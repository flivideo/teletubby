// Apple on-device streaming speech helper — Teletubby's PRIMARY live engine (Groq is the fallback).
// Runs inside TeletubbySpeech.app (its own responsible process, so macOS can show the Speech prompt).
// usage (via `open -W -n -a TeletubbySpeech.app --args ...`):
//   --out <fifo> --in <fifo>  [--hints <file>]   live: <fifo in> = raw mono 16 kHz s16le PCM
//   --out <fifo> --wav <file> [--hints <file>]   bench: feeds the file at real time
// Writes JSON lines to the --out FIFO (not stdout: LaunchServices owns that):
//   {"task":N,"started":true,"startMs":..,"hints":K,"reason":".."}   a recognition task started
//   {"task":N,"atMs":..,"text":..,"final":..}                         a partial of task N
//   {"retry":"..","task":N,"attempt":A,"delayMs":D,"expected":B}      an error the helper is handling itself
//   {"error":"..","fatal":true,"attempts":A}                          retries exhausted -> exit (main falls back)
//   {"error":"speech_auth","status":0..3,"reason":..} / {"error":"unavailable"}   cannot run at all
//
// Tasks: Apple stops a recognition task at about one minute, so the helper REPLACES it every ~50 s
// while audio keeps flowing (the FIFO is never paused). "No speech" / time-limit style errors and a
// final result restart at once; other errors back off 0.5 s x attempt (cap 1.5 s), at most 10 in a
// row, and a good partial resets the count. Every task starts with the hint file re-read
// (contextualStrings) and the dictation task hint; on-device is forced when supported.
import Foundation
import Speech
import AVFoundation

let args = CommandLine.arguments
func arg(_ name: String) -> String? { if let i = args.firstIndex(of: name), i + 1 < args.count { return args[i + 1] }; return nil }
let outHandle: FileHandle = {
    guard let p = arg("--out"), let h = FileHandle(forWritingAtPath: p) else { exit(2) }
    return h
}()
let inPath = arg("--in")
let wavPath = arg("--wav")
let hintsPath = arg("--hints")
let live = inPath != nil
if !live && wavPath == nil { exit(2) }

let emitLock = NSLock()
func emit(_ obj: [String: Any]) {
    guard let d = try? JSONSerialization.data(withJSONObject: obj) else { return }
    emitLock.lock(); outHandle.write(d + Data([10])); emitLock.unlock()
}

let SWAP_AFTER: TimeInterval = 50
let MAX_ATTEMPTS = 10

/// Errors that just mean "this task is over, start another": no speech, time limit, our own cancel.
func isExpected(_ e: Error) -> Bool {
    let ns = e as NSError
    if ns.domain == "kAFAssistantErrorDomain" && [203, 209, 216, 301, 1107, 1110].contains(ns.code) { return true }
    let d = ns.localizedDescription.lowercased()
    return d.contains("no speech") || d.contains("limit") || d.contains("timed out") || d.contains("canceled") || d.contains("cancelled")
}

func readHints() -> [String] {
    guard let p = hintsPath, let d = FileManager.default.contents(atPath: p),
          let a = try? JSONSerialization.jsonObject(with: d) as? [String] else { return [] }
    return Array(a.prefix(50))
}

final class Engine {
    let rec: SFSpeechRecognizer
    let q = DispatchQueue(label: "teletubby.speech")
    let sampleRate: Double
    var req: SFSpeechAudioBufferRecognitionRequest?
    var task: SFSpeechRecognitionTask?
    var taskId = 0
    var taskStarted = Date()
    var attempts = 0
    var framesIn: Int64 = 0
    var lastAudio = Date.distantPast
    var ended = false
    let clockStart = Date()
    let done = DispatchSemaphore(value: 0)
    var timer: DispatchSourceTimer?

    init(rec: SFSpeechRecognizer, sampleRate: Double) { self.rec = rec; self.sampleRate = sampleRate }

    var audioMs: Double { Double(framesIn) * 1000 / sampleRate }

    /// Must run on q.
    func startTask(_ reason: String) {
        let old = task
        let oldReq = req
        taskId += 1
        let id = taskId
        let r = SFSpeechAudioBufferRecognitionRequest()
        r.shouldReportPartialResults = true
        r.taskHint = .dictation
        if rec.supportsOnDeviceRecognition { r.requiresOnDeviceRecognition = true }
        let hints = readHints()
        if !hints.isEmpty { r.contextualStrings = hints }
        req = r
        taskStarted = Date()
        emit(["task": id, "started": true, "startMs": audioMs, "hints": hints.count, "reason": reason])
        task = rec.recognitionTask(with: r) { [weak self] result, error in
            guard let self = self else { return }
            self.q.async { self.handle(id: id, result: result, error: error) }
        }
        // The old task stops AFTER the new one is taking audio, so no sample goes nowhere.
        oldReq?.endAudio()
        old?.cancel()
    }

    /// Must run on q.
    func handle(id: Int, result: SFSpeechRecognitionResult?, error: Error?) {
        if id != taskId { return } // an old task's late result: stale
        if let r = result {
            let text = r.bestTranscription.formattedString
            emit(["task": id, "atMs": Date().timeIntervalSince(clockStart) * 1000, "text": text, "final": r.isFinal])
            if !text.isEmpty { attempts = 0 }
            if r.isFinal {
                if ended { done.signal(); return }
                startTask("final")
                return
            }
        }
        guard let e = error else { return }
        if ended { done.signal(); return }
        if isExpected(e) {
            emit(["retry": e.localizedDescription, "task": id, "attempt": 0, "delayMs": 0, "expected": true])
            startTask("expected-error")
            return
        }
        attempts += 1
        if attempts > MAX_ATTEMPTS {
            emit(["error": e.localizedDescription, "fatal": true, "attempts": attempts - 1])
            exit(5)
        }
        let delay = min(0.5 * Double(attempts), 1.5)
        emit(["retry": e.localizedDescription, "task": id, "attempt": attempts, "delayMs": Int(delay * 1000), "expected": false])
        req = nil // audio during the back-off is dropped (at most 1.5 s)
        task = nil
        q.asyncAfter(deadline: .now() + delay) { [weak self] in
            guard let self = self, !self.ended, self.taskId == id else { return }
            self.startTask("retry")
        }
    }

    func begin() {
        q.sync { startTask("start") }
        let t = DispatchSource.makeTimerSource(queue: q)
        t.schedule(deadline: .now() + 1, repeating: 1)
        t.setEventHandler { [weak self] in
            guard let self = self, !self.ended, self.req != nil else { return }
            // Swap ahead of Apple's ~1-minute limit, but only while audio is actually arriving.
            if Date().timeIntervalSince(self.taskStarted) >= SWAP_AFTER && Date().timeIntervalSince(self.lastAudio) < 2 {
                self.startTask("swap")
            }
        }
        t.resume()
        timer = t
    }

    func append(_ buf: AVAudioPCMBuffer) {
        q.sync {
            framesIn += Int64(buf.frameLength)
            lastAudio = Date()
            req?.append(buf)
        }
    }

    func finish(wait: TimeInterval) {
        q.sync {
            ended = true
            timer?.cancel()
            if let r = req { r.endAudio() } else { done.signal() }
        }
        _ = done.wait(timeout: .now() + wait)
    }
}

func run() {
    let sem = DispatchSemaphore(value: 0)
    var status = SFSpeechRecognizer.authorizationStatus()
    if status == .notDetermined {
        SFSpeechRecognizer.requestAuthorization { s in status = s; sem.signal() }
        _ = sem.wait(timeout: .now() + 60)
    }
    guard status == .authorized else {
        let reason = ["not_determined", "denied", "restricted", "authorized"][Int(status.rawValue)]
        emit(["error": "speech_auth", "status": status.rawValue, "reason": reason]); exit(3)
    }
    guard let rec = SFSpeechRecognizer(locale: Locale(identifier: "en-US")), rec.isAvailable else { emit(["error": "unavailable"]); exit(4) }
    emit(["onDevice": rec.supportsOnDeviceRecognition])

    if live {
        let f = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: 1, interleaved: false)!
        let engine = Engine(rec: rec, sampleRate: 16000)
        engine.begin()
        let input = FileHandle(forReadingAtPath: inPath!)!
        var carry = Data()
        while true {
            let d = input.availableData
            if d.isEmpty { break }
            carry.append(d)
            let n = carry.count / 2
            if n == 0 { continue }
            guard let buf = AVAudioPCMBuffer(pcmFormat: f, frameCapacity: AVAudioFrameCount(n)) else { continue }
            buf.frameLength = AVAudioFrameCount(n)
            carry.withUnsafeBytes { raw in
                let src = raw.bindMemory(to: Int16.self)
                for i in 0..<n { buf.floatChannelData![0][i] = Float(Int16(littleEndian: src[i])) / 32768.0 }
            }
            carry = carry.subdata(in: (n * 2)..<carry.count)
            engine.append(buf)
        }
        engine.finish(wait: 5)
        return
    }
    let url = URL(fileURLWithPath: wavPath!)
    guard let file = try? AVAudioFile(forReading: url) else { emit(["error": "cannot read wav"]); return }
    let fmt = file.processingFormat
    let engine = Engine(rec: rec, sampleRate: fmt.sampleRate)
    engine.begin()
    let chunk: AVAudioFrameCount = AVAudioFrameCount(fmt.sampleRate / 10) // 100 ms
    while file.framePosition < file.length {
        guard let buf = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: chunk) else { break }
        try? file.read(into: buf, frameCount: chunk)
        engine.append(buf)
        Thread.sleep(forTimeInterval: Double(buf.frameLength) / fmt.sampleRate)
    }
    engine.finish(wait: 20)
}

// Do the work off the main thread; the main thread keeps a run loop so the permission prompt can be presented.
Thread.detachNewThread { run(); exit(0) }
dispatchMain()
