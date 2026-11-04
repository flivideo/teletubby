// Apple on-device streaming speech helper (bake-off only).
// Runs inside TeletubbySpeech.app (its own responsible process, so macOS can show the Speech prompt).
// usage (via `open -W -n -a TeletubbySpeech.app --args ...`):
//   --out <fifo> --in <fifo>      live: <fifo in> = raw mono 16 kHz s16le PCM
//   --out <fifo> --wav <file>     bench: feeds the file at real time
// -> writes JSON lines {"atMs":..,"text":..} per partial to the --out FIFO (not stdout: LaunchServices owns that).
// Errors: {"error":"speech_auth","status":0..3,"reason":..}. Needs Speech Recognition permission granted once by a human.
import Foundation
import Speech
import AVFoundation

let args = CommandLine.arguments
func arg(_ name: String) -> String? { if let i = args.firstIndex(of: name), i + 1 < args.count { return args[i + 1] }; return nil }
guard let outPath = arg("--out"), let outHandle = FileHandle(forWritingAtPath: outPath) else { exit(2) }
let inPath = arg("--in")
let wavPath = arg("--wav")
let live = inPath != nil
guard live || wavPath != nil else { exit(2) }

func emit(_ obj: [String: Any]) {
    if let d = try? JSONSerialization.data(withJSONObject: obj) { outHandle.write(d + Data([10])) }
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
let req = SFSpeechAudioBufferRecognitionRequest()
req.shouldReportPartialResults = true
if rec.supportsOnDeviceRecognition { req.requiresOnDeviceRecognition = true }
emit(["onDevice": rec.supportsOnDeviceRecognition])

let start = Date()
var finished = false
let task = rec.recognitionTask(with: req) { result, error in
    if let r = result {
        emit(["atMs": Date().timeIntervalSince(start) * 1000, "text": r.bestTranscription.formattedString, "final": r.isFinal])
        if r.isFinal { finished = true; sem.signal() }
    }
    if let e = error { emit(["error": e.localizedDescription]); finished = true; sem.signal() }
}

if live {
    let f = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 16000, channels: 1, interleaved: false)!
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
        req.append(buf)
    }
    req.endAudio()
    _ = sem.wait(timeout: .now() + 5)
    return
}
let url = URL(fileURLWithPath: wavPath!)
guard let file = try? AVAudioFile(forReading: url) else { emit(["error": "cannot read wav"]); return }
let fmt = file.processingFormat
let chunk: AVAudioFrameCount = AVAudioFrameCount(fmt.sampleRate / 10) // 100 ms
while file.framePosition < file.length {
    guard let buf = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: chunk) else { break }
    try? file.read(into: buf, frameCount: chunk)
    req.append(buf)
    Thread.sleep(forTimeInterval: Double(buf.frameLength) / fmt.sampleRate)
}
req.endAudio()
_ = sem.wait(timeout: .now() + 20)
_ = task
}

// Do the work off the main thread; the main thread keeps a run loop so the permission prompt can be presented.
Thread.detachNewThread { run(); exit(0) }
dispatchMain()
