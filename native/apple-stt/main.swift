// Apple on-device streaming speech helper (bake-off only).
// usage: apple-stt <mono16k.wav> | apple-stt --stdin   (stdin = raw mono 16 kHz signed 16-bit little-endian PCM, live)
// -> prints JSON lines {"atMs":..,"text":..} per partial, wall-clock since start,
// feeding the audio at real time. Needs Speech Recognition permission granted once by a human.
import Foundation
import Speech
import AVFoundation

let args = CommandLine.arguments
guard args.count >= 2 else { FileHandle.standardError.write("usage: apple-stt <wav>\n".data(using: .utf8)!); exit(2) }
let live = args[1] == "--stdin"

func emit(_ obj: [String: Any]) {
    if let d = try? JSONSerialization.data(withJSONObject: obj), let s = String(data: d, encoding: .utf8) { print(s); fflush(stdout) }
}

let sem = DispatchSemaphore(value: 0)
var status = SFSpeechRecognizer.authorizationStatus()
if status == .notDetermined {
    SFSpeechRecognizer.requestAuthorization { s in status = s; sem.signal() }
    _ = sem.wait(timeout: .now() + 60)
}
guard status == .authorized else { emit(["error": "speech_auth", "status": status.rawValue]); exit(3) }
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
    let input = FileHandle.standardInput
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
    exit(0)
}
let url = URL(fileURLWithPath: args[1])
let file = try AVAudioFile(forReading: url)
let fmt = file.processingFormat
let chunk: AVAudioFrameCount = AVAudioFrameCount(fmt.sampleRate / 10) // 100 ms
while file.framePosition < file.length {
    guard let buf = AVAudioPCMBuffer(pcmFormat: fmt, frameCapacity: chunk) else { break }
    try file.read(into: buf, frameCount: chunk)
    req.append(buf)
    Thread.sleep(forTimeInterval: Double(buf.frameLength) / fmt.sampleRate)
}
req.endAudio()
_ = sem.wait(timeout: .now() + 20)
_ = task
