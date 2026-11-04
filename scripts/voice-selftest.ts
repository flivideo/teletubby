// Voice self-test, standalone or through the running app's door.
// Usage: bash scripts/voice-selftest.sh   (prints PASS/FAIL per check; exit 0 only when all pass)
// If Teletubby is up, the test runs INSIDE the app (`voice_selftest`) so the mic status is the
// app's own; otherwise it runs here and the mic line is SKIP.
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatSelftest, runVoiceSelftest, type SelftestReport } from '../src/core/voice-selftest'
import { realSelftestDeps } from '../src/main/voice/selftest-deps'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function viaApp(): SelftestReport | null {
  const r = spawnSync('node', [join(root, 'bin', 'teletubby.mjs'), 'call', 'voice_selftest', '--as', 'agent:voice-selftest'], {
    encoding: 'utf8',
    timeout: 60_000,
  })
  try {
    const j = JSON.parse(r.stdout) as { ok: boolean; data?: SelftestReport; error?: { code: string } }
    if (j.ok && j.data) return j.data
    if (j.error) console.error(`(running app answered ${j.error.code} — it predates the self-test; running standalone)`)
  } catch {
    /* app not running */
  }
  return null
}

const report = viaApp() ?? (await runVoiceSelftest(realSelftestDeps(root, 'standalone', () => null)))
console.log(formatSelftest(report))
process.exit(report.ok ? 0 : 1)
