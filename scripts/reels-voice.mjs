// npm run reels:voice [-- <reelId>] [--force] [--voice <name>] [--speed <n>]
// 1) extracts narration for ALL reels (so index.json stays complete),
// 2) runs the Kokoro renderer under uv with an ephemeral Python env.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const spacyModel =
  'https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl';

const run = (cmd, args, env = {}) => {
  const res = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', env: { ...process.env, ...env } });
  if (res.error) {
    console.error(`reels-voice: failed to run ${cmd}: ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) process.exit(res.status ?? 1);
};

run(process.execPath, ['scripts/reels-extract.mjs']);

run(
  'uv',
  [
    'run', '--python', '3.12',
    '--with', 'kokoro',
    '--with', 'soundfile',
    // spaCy model needed by misaki; pinned wheel so it is not pip-downloaded on every run.
    '--with', `en-core-web-sm @ ${spacyModel}`,
    'scripts/reels-voice.py',
    ...process.argv.slice(2),
  ],
  {
    // Let phonemizer find Homebrew's espeak-ng if misaki falls back to it.
    PHONEMIZER_ESPEAK_LIBRARY: process.env.PHONEMIZER_ESPEAK_LIBRARY ?? '/opt/homebrew/lib/libespeak-ng.dylib',
    PYTORCH_ENABLE_MPS_FALLBACK: '1',
  },
);
