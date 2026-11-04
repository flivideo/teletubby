import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** GROQ_API_KEY from the environment, else the same secrets files FliTools loads. Never logged. */
export function loadGroqKey(env: NodeJS.ProcessEnv = process.env, home = homedir()): string | null {
  if (env['GROQ_API_KEY']) return env['GROQ_API_KEY']
  for (const file of [join(home, '.config', 'appydave', '.env.secrets'), join(home, '.secrets')]) {
    try {
      const m = /^\s*(?:export\s+)?GROQ_API_KEY\s*=\s*["']?([^"'\s#]+)/m.exec(readFileSync(file, 'utf8'))
      if (m) return m[1]!
    } catch {
      /* file absent: try the next */
    }
  }
  return null
}
