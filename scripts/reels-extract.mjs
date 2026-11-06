// Extracts narration text from every src/reels/series/*.ts into
// .reels-cache/narration.json (consumed by scripts/reels-voice.py).
//
// Usage: node scripts/reels-extract.mjs [reelId]
//
// Series files are imported directly: Node strips the TypeScript types.
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seriesDir = path.join(root, 'src/reels/series');
const outFile = path.join(root, '.reels-cache/narration.json');
const onlyReel = process.argv[2];

const fail = (msg) => {
  console.error(`reels-extract: ${msg}`);
  process.exit(1);
};

const files = (await readdir(seriesDir)).filter((f) => f.endsWith('.ts')).sort();
if (files.length === 0) fail(`no series files in ${seriesDir}`);

const seen = new Map();
const reels = [];

for (const file of files) {
  const mod = await import(pathToFileURL(path.join(seriesDir, file)).href);
  const series = mod.series;
  if (!series || !Array.isArray(series.reels)) fail(`${file} must export \`series\` with a reels array`);

  for (const reel of series.reels) {
    if (seen.has(reel.id)) fail(`duplicate reel id "${reel.id}" in ${file} and ${seen.get(reel.id)}`);
    seen.set(reel.id, file);
    if (!Array.isArray(reel.beats) || reel.beats.length === 0) fail(`reel "${reel.id}" (${file}) has no beats`);

    const beats = reel.beats.map((beat, i) => {
      if (typeof beat.say !== 'string' || !beat.say.trim()) fail(`reel "${reel.id}" beat ${i} has empty \`say\``);
      const speak = beat.speak ?? beat.say;
      if (!speak.trim()) fail(`reel "${reel.id}" beat ${i} has empty \`speak\``);
      return { say: beat.say, speak };
    });
    reels.push({ id: reel.id, seriesId: series.id, beats });
  }
}

const selected = onlyReel ? reels.filter((r) => r.id === onlyReel) : reels;
if (selected.length === 0) fail(`reel "${onlyReel}" not found (have: ${reels.map((r) => r.id).join(', ')})`);

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify({ reels: selected }, null, 2) + '\n');
console.log(`reels-extract: ${selected.length} reel(s) from ${files.length} series file(s) -> ${path.relative(root, outFile)}`);
