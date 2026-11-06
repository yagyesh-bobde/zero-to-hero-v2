# Authoring React Native Reels

A reel is a 45–70 second animated explainer. You write data, not components: a list of **beats**, each with one narrated sentence and one animated **scene**. The engine handles motion, captions, voice timing, sound effects, progress, and navigation.

The two reels in `series/01-react-under-the-hood.ts` set the quality bar. Read them before you write one.

## 1. Where reels live

- Every file in `src/reels/series/*.ts` is loaded automatically. You don't need to register anything.
- Each file exports **exactly** `export const series: Series = {...}`.
- Use **type-only imports** (`import type { Series } from '../types';`). Don't import runtime code: the voice script loads these files directly with Node.
- Name files `NN-kebab-name.ts` (`02-react-native-architecture.ts`). `order` decides feed order.
- If a series file already exists, append your reels to its `reels` array. Don't create a duplicate series.

```ts
import type { Series } from '../types';

export const series: Series = {
  id: 'android-platform',      // unique kebab-case
  title: 'Android platform',
  emoji: '🤖',
  color: '#3ddc84',            // series accent (hex). Bright and saturated: it sits on near-black.
  order: 3,
  blurb: 'What Android does to your app behind the scenes.',
  reels: [
    { id: 'android-process-death', title: 'Process death, explained', beats: [ /* … */ ] },
  ],
};
```

Good accents: React `#61dafb`, Android `#3ddc84`, iOS `#0a84ff`, perf `#facc15`, native modules `#f472b6`, networking `#a78bfa`, JS engine `#fb923c`.

## 2. Data model

```ts
Reel = { id: string; title: string; beats: Beat[] }

Beat = {
  say: string;          // ONE narration sentence (or two very short ones). Also the captions.
  scene: Scene;         // what is on screen while this sentence plays
  sfx?: Sfx;            // sound on beat start (defaults below)
  emphasis?: string[];  // words in `say` to colour in captions (case/punctuation-insensitive)
  speak?: string;       // optional pronunciation override for TTS. Captions still show `say`.
}
```

- `id` must be unique across **all** series, kebab-case, stable. It's the audio file name and the share link: `/react-native-reels#/reel/<id>`.
- `speak` is for words TTS mispronounces: `setState` → `set state`, `useEffect` → `use effect`, `JSI` → `J S I`, `.tsx` → `T S X`, `Object.is` → `Object dot is`, `iOS` is fine. **Keep the same number of words in `speak` and `say` where you can** so word-timed captions stay aligned. When counts differ, captions fall back to estimated timing for that beat. That's fine, just less exact.
- `emphasis` words must appear in `say`. Pick 1–3 per beat.

**Scene continuity rule:** consecutive beats with the **same scene type** keep the scene mounted and animate the change. Highlights move, nodes light up, list rows glide, and only new code characters type in. A **different** type plays a transition (old scene flies out, new one flies in). Use this on purpose:

- Same code, new `highlight` / `errors` / `added` / `note` → the highlight moves; nothing retypes.
- Changed code → only the changed tail retypes from the first differing character.
- Diagram with the same node ids → nodes slide to new positions, `active` changes glow, new edges draw in, `packets` fly.
- Quiz → quiz with `reveal: true` → the answer flips in place.
- Phone `app` → phone `app` with the same item `id`s in a new order → rows slide (FLIP).

## 3. Scenes (copy-paste examples)

`Tone` = `'accent' | 'good' | 'bad' | 'warn' | 'info' | 'muted'`. `accent` is the series colour. In titles, lists, stats, quizzes and outro points, wrap words in `*stars*` to colour them with the accent.

### title: hook card with giant kinetic type
```ts
{ type: 'title', kicker: 'React internals', title: 'setState does *not* change your variable',
  emoji: '🤯', style: 'slam' }   // style: 'slam' (words punch in) | 'stack' (huge stacked words) | 'glitch' (RGB glitch)
```
Keep `title` at 3–7 words. `sub` is an optional smaller line.

### code: types in, then highlights
```ts
{ type: 'code', lang: 'tsx', file: 'Counter.tsx',
  code: `const [count, setCount] = useState(0);
setCount(count + 1);
console.log(count);`,
  highlight: [2],          // accent glow. Line numbers are 1-based; ranges like [2, 4] are inclusive.
  errors: [3],             // red glow + shake
  added: [],               // green glow
  note: { line: 3, text: 'logs 0 😱', tone: 'bad' },  // callout bubble under that line
  focus: true }            // dim unmarked lines (default: true when anything is marked)
```
`lang`: `tsx ts js json bash kotlin java swift objc xml gradle ruby cpp text`. Keep it to **14 lines or fewer and about 34 characters per line**. Long lines get clipped on phones. Use 2-space indentation.

### terminal: commands type out, output appears
```ts
{ type: 'terminal', title: 'Build it',
  lines: [
    { cmd: 'npx react-native run-android' },
    { out: 'BUILD SUCCESSFUL in 41s', tone: 'good' },
    { cmd: 'adb shell am kill com.app' },
    { out: 'Process killed', tone: 'bad' },
  ] }
```

### diagram: nodes and arrows on a grid
```ts
{ type: 'diagram', title: 'The bridge', cols: 3, rows: 4,
  nodes: [
    { id: 'js', label: 'JS thread', icon: '🟨', x: 0, y: 0, active: true },
    { id: 'native', label: 'Native', sub: 'UI thread', icon: '📱', x: 2, y: 0, tone: 'info' },
    { id: 'q', label: 'Queue', x: 1, y: 2, shape: 'pill', dim: true },   // shape: box | pill | circle
  ],
  edges: [
    { from: 'js', to: 'native', label: 'JSON', active: true },   // active = marching glow
    { from: 'native', to: 'q', dashed: true, tone: 'bad', both: true },
  ],
  packets: [{ from: 'js', to: 'native', label: '{}', tone: 'warn' }],  // dot flies along the arrow (loops)
  caption: 'every call is serialized' }
```
- `x` is the column and `y` is the row, both 0-based. Fractions are allowed (`y: 1.5`). The default grid is 3 × 4. The stage is tall, so use more rows than columns.
- Nodes are about 1 column wide. Keep labels to 2 words or fewer. `sub` is a small mono line (good for values that change).
- To show something "newly added", introduce a new node id on the next beat; it pops in. To show something going away, set `dim: true`.
- An edge needs both node ids to exist (tests check this).

### tree: component or fiber tree
```ts
{ type: 'tree', title: 'Who re-renders?', caption: 'state lives in Counter',
  root: { id: 'app', label: 'App', dim: true, children: [
    { id: 'counter', label: 'Counter', active: true, dirty: true, children: [
      { id: 'btn', label: 'Button', active: true },
    ] },
    { id: 'footer', label: 'Footer', dim: true },
  ] } }
```
Layout is automatic. `active` = glowing (rendering), `dirty` = dashed outline + dot (marked for update), `dim` = skipped. Up to 6 leaves fits well.

### phone: device mockup
```ts
{ type: 'phone', os: 'android', caption: 'each row owns a note',
  tap: { x: 0.5, y: 0.86 },        // optional tap ripple (fractions of the screen)
  screen: { kind: 'app', title: 'Groceries', icon: '🛒',
    body: 'optional paragraph',
    items: [{ id: 'milk', label: 'Milk', icon: '🥛', value: '2 litres', tone: 'bad' },
            { id: 'eggs', label: 'Eggs', sub: '12 pack', checked: true }],
    button: '+ Add', toast: 'Saved', loading: false } }
```
Other `screen` variants:
```ts
{ kind: 'permission', app: 'Snapcat', icon: '📷', text: 'would like to access your camera',
  allow: 'Allow', deny: 'Don’t allow', choice: 'allow' }              // choice animates a tap
{ kind: 'notification', notice: { app: 'Chat', title: 'New message', body: 'Hey!', icon: '💬' },
  behind: 'lock' }                                                     // behind: 'home' | 'lock' | 'app'
{ kind: 'bubble', app: 'Messenger', icon: '💬', text: 'Draw over other apps', behind: 'home' }
{ kind: 'home', highlight: 'Settings' }                                // optional apps: [{ icon, label }]
{ kind: 'lock', time: '9:41', notices: [{ app: 'Bank', title: 'Payment received' }] }
{ kind: 'killed', app: 'MyApp', icon: '📱', reason: 'Killed by low memory' }  // card swipes away
{ kind: 'crash', app: 'MyApp', message: 'TypeError: undefined is not a function' }
{ kind: 'splash', app: 'MyApp', icon: '🚀' }
```
Give list items a stable `id` when you reorder them across beats. Changing `label` with the same `id` shows that the row stayed and only its content changed. That's how the keys reel shows the bug.

### compare: left vs right
```ts
{ type: 'compare', title: 'Pick your key',
  left:  { title: 'key={index}', verdict: 'bad', items: ['Sticks to positions', 'Breaks on sort'] },
  right: { title: 'key={item.id}', verdict: 'ok', items: ['Follows the item', 'Safe to reorder'],
           code: 'optional short code', icon: '✅' } }
```
`verdict`: `ok` (✓ stamp), `bad` (✕ stamp), `neutral`. Use 2–3 items per side, each 4 words or fewer.

### list: items pop in
```ts
{ type: 'list', title: 'Index keys break on…', numbered: false, active: 1,
  items: ['Plain string', { text: 'Delete a *row*', icon: '🗑️', sub: 'small note', tone: 'bad' }] }
```
3–5 items. `active` highlights one item and dims the rest. Step it across consecutive beats to walk through the list.

### timeline: sequence of steps
```ts
{ type: 'timeline', title: 'One tap, four steps', active: 2,
  steps: [{ label: 'Tap', sub: 'count is 0', icon: '👆' }, { label: 'Queue' }, { label: 'Render', tone: 'accent' }, { label: 'Commit' }] }
```
Earlier steps show ✓, `active` glows, and later steps are dimmed. Repeat the scene with `active` increasing to advance it.

### stat: big number
```ts
{ type: 'stat', value: '16.6', unit: 'ms', label: 'per frame at *60fps*', sub: 'miss it and you drop a frame', tone: 'warn' }
```
A leading number counts up (`'3x'`, `'200'`, `'99.9'`). If the value isn't numeric (`'∞'`) it shows as is.

### quiz: ask, then reveal on the next beat
```ts
// beat N
{ type: 'quiz', question: 'count is 5. You call setCount(5). Then?',
  options: ['Re-renders anyway', 'React bails out', 'Throws'], answer: 1 }
// beat N+1: same question and options
{ type: 'quiz', question: '…same…', options: [/* same */], answer: 1, reveal: true,
  explain: 'Object.is(5, 5) is true, so React bails out.' }
```
Use 2–4 short options. On the asking beat, narrate the question ("Quick check…"). On the reveal beat, say the answer and why.

### outro: "remember this" payoff
```ts
{ type: 'outro', title: 'Remember this',   // optional; this is the default
  points: ['setState queues an update', 'count is a *snapshot*', 'Use setCount(c => c + 1)'],
  tagline: 'Schedules, not assigns.' }
```
2–3 points, each 7 words or fewer. Make the tagline a punchy summary of 5 words or fewer.

## 4. Sound effects

`sfx` values: `whoosh` (big entrance), `swipe` (scene change), `pop` (node/item appears), `click` (small change), `type` (code/terminal; typing ticks play automatically), `ding` (correct answer / insight), `success` (fix works, outro), `error` (bug, crash), `riser` (build tension: quiz question, "but wait…"), `none`.

If `sfx` is omitted: beat 1 → `whoosh`, a scene type change → `swipe`, same type → `click`. Use `error` on the beat that reveals a bug and `success` on the fix. Don't put a loud effect on every beat.

## 5. Writing and design rules

1. **Hook first.** Beat 1 is a `title` scene with a surprising claim or question, **12 words or fewer** in `say`. No "In this video…".
2. **One idea per reel.** If you need "and also", make two reels.
3. **Show a concrete example** within the first 3 beats: real code, a real screen, a real bug. Abstract diagrams come after the example.
4. **Every beat changes something visible**: a new scene, a moved highlight, a new node, a revealed answer. Never two beats that look identical.
5. **6–11 beats, about 110–170 words in total, 45–70 seconds.** About 8–22 words per beat. One sentence per beat, or two very short ones.
6. **Casual, plain language.** Talk like a friend at a whiteboard. Short words. Use "you". No jargon without a one-line explanation. Contractions are good.
7. **Vary the scenes.** Use at least 4 different scene types per reel. Mix code with a visual (diagram, tree, phone, or timeline).
8. **Pay it off.** The last beat is an `outro` whose `say` starts with "Remember this." and restates the core idea in a new, quotable way.
9. **A quiz is optional but great**: two beats (ask → reveal), placed near the end.
10. **Be correct.** Use current APIs (React 19, RN New Architecture, Android 14+, iOS 17+). If something is version-specific, say so in a few words.
11. Screen text is short. Narration carries the explanation; scenes show it. Don't paste the `say` sentence into the scene.
12. Avoid things TTS reads badly in `say`: emoji, symbols like `=>`, `&&`, `→`, `%`, URLs. Use `speak` or reword. (Emoji and symbols are fine inside scenes.)

**Template (10 beats):** hook title → concrete example (code or phone) → the surprise/bug → why (diagram/tree/timeline) → detail → consequence (list/stat) → fix (code `added`) → quiz ask → quiz reveal → outro.

## 6. Generate the voice

After adding or editing narration, run this from the repo root:

```bash
npm run reels:voice                    # renders every reel whose narration changed
npm run reels:voice -- my-reel-id      # just one reel
npm run reels:voice -- my-reel-id --force
```

It extracts narration (`scripts/reels-extract.mjs`) and renders it with Kokoro-82M through `uv`. The voice is `af_heart` at speed 1.1, and ffmpeg encodes AAC `.m4a` files. Output goes to `public/react-native-reels/audio/<id>.m4a`, `<id>.json` (per-beat `start`/`end` and per-word timings) and `index.json`. Unchanged reels are skipped by hash. You need `uv` and `ffmpeg`. The first run downloads Python packages, which takes a few minutes.

Reels without audio still play silently on an estimated timeline (about 2.6 words per second), so you can preview layout before rendering.

## 7. Check your work

```bash
npx tsc --noEmit -p .        # types
npx vitest run tests/reels.test.ts
```

The tests check unique ids, non-empty beats, valid code line numbers and diagram edges, quiz answers in range, that every beat renders, and that **every reel has an audio manifest whose beat count matches**. After changing beats, re-run `npm run reels:voice`.
