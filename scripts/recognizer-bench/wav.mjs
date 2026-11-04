import { readFileSync } from 'node:fs'
/** Mono 16 kHz 16-bit WAV -> { pcm: Buffer, durMs }. Finds the data chunk. */
export function readWav(path) {
  const b = readFileSync(path)
  let p = 12
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4)
    const size = b.readUInt32LE(p + 4)
    if (id === 'data') {
      const pcm = b.subarray(p + 8, Math.min(b.length, p + 8 + size))
      return { pcm, durMs: (pcm.length / 2 / 16000) * 1000 }
    }
    p += 8 + size
  }
  throw new Error('no data chunk')
}
export function wavSlice(pcm, fromMs, toMs) {
  const a = Math.floor((fromMs / 1000) * 16000) * 2
  const z = Math.floor((toMs / 1000) * 16000) * 2
  const body = pcm.subarray(a, Math.min(z, pcm.length))
  const h = Buffer.alloc(44)
  h.write('RIFF', 0); h.writeUInt32LE(36 + body.length, 4); h.write('WAVEfmt ', 8)
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22)
  h.writeUInt32LE(16000, 24); h.writeUInt32LE(32000, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34)
  h.write('data', 36); h.writeUInt32LE(body.length, 40)
  return Buffer.concat([h, body])
}
