# Authoring React Native Reels

A reel is a 45–70 second animated explainer. You write data, not components: a list of **beats**, each with one narrated sentence and one animated **scene**. The engine handles motion, layout, captions, voice timing, sound effects, progress and navigation.

The reels in `series/01-react-under-the-hood.ts` set the quality bar. Read two before you write one. **Section 7 is mandatory before you ship.**

## 1. Where reels live

- Every file in `src/reels/series/*.ts` is loaded automatically. You don't need to register anything.
- Each file exports **exactly** `export const series: Series = {...}`.
- Use **type-only imports** (`import type { Series } from '../types';`). Don't import runtime code: the voice script and the QA script load these files directly with Node.
- Name files `NN-kebab-name.ts`. `order` decides feed order. If a series file already exists, append to its `reels` array.

```ts
import type { Series } from '../types';

export const series: Series = {
  id: 'android-platform',      // unique kebab-case
  title: 'Android platform',
  emoji: '🤖',
  color: '#3ddc84',            // series accent (hex). Bright and saturated: it sits on near-black.
  order: 3,
  blurb: 'What Android does to your app behind the scenes.',
  reels: [{ id: 'android-process-death', title: 'Process death, explained', beats: [ /* … */ ] }],
};
```

Good accents: React `#61dafb`, Android `#3ddc84`, iOS `#0a84ff`, perf `#facc15`, native modules `#f472b6`, networking `#a78bfa`, JS engine `#fb923c`.

## 2. Data model

```ts
Reel = { id: string; title: string; beats: Beat[] }

Beat = {
  say: string;          // ONE narration sentence (or two very short ones). Also the captions.
  scene: Scene;         // what is on screen while this sentence plays
  sfx?: Sfx;            // sound on beat start (defaults in §5)
  emphasis?: string[];  // words in `say` to colour in captions (case/punctuation-insensitive)
  speak?: string;       // optional pronunciation override for TTS. Captions still show `say`.
}
```

- `id` must be unique across **all** series, kebab-case, stable. It's the audio file name and the share link: `/react-native-reels#/reel/<id>`.
- `speak` is for words TTS mispronounces: `setState` → `set state`, `JSI` → `J S I`, `.tsx` → `T S X`. Keep the same number of words in `speak` and `say` where you can so word-timed captions stay aligned.
- `emphasis` words must appear in `say`. Pick 1–3 per beat.

**Scene continuity:** consecutive beats with the **same scene type** keep the scene mounted and animate the change (highlights move, nodes slide, list rows glide, only new code characters type). A **different** type plays a transition. Use it on purpose: same code with a new `highlight`/`note`; a diagram with the same node ids and new positions/`active`; quiz → quiz with `reveal: true`; phone `app` → `app` with the same item `id`s in a new order (rows FLIP).

## 3. The layout system (what the engine guarantees)

Everything is sized in `cqw` (1% of the stage width), so a phone (390px) and the laptop frame share one rhythm. Tokens live at the top of `reels.css` (`.stage`): spacing `--s-1…--s-8`, type `--fs-display/h1/h2/body/small/mono/micro/caption` (clamped so phones never drop below readable sizes), radii `--r-sm/md/lg`.

**Safe zones.** A scene draws only inside `.stage-scenes`: below the progress bar + title chrome (`--zone-top`), above the two-line caption home (`--zone-bottom` = caption box + a guaranteed `--caption-gap`), inside side insets (`--zone-left/right`; 13cqw on phones, symmetric, so content and captions keep ≥ 12px clear of the compact action rail while staying centred on the screen axis). Captions are centred in their own box and never move.

**Fit** (`Stage.tsx`). Each scene is laid out in a copy of the zone shrunk by a zoom factor and scaled back up, so type and boxes grow up to `--zoom-max` (1.2×) while the footprint stays the zone. The zoom backs off until the content's height and its widest element fit; content still too tall at 1× is scaled down (QA fails below 85%). Phone, diagram, tree and outro scenes lay out at 1×. Code, terminal, stat and outro text shrink to fit their longest line; compare cards shrink their type (to 13px) to fit the longest word; a diagram shrinks all its labels a little (to a 15px floor) to fit its widest word.

**Headings are pinned.** A scene `title` (diagram, tree, list, timeline, compare, terminal) is rendered by Fit as a separate heading at the top of the zone, at the same y on every beat; only the body is centred in the space under it. Scenes without a heading (title, code, phone, stat, quiz, outro) are centred as a block.

**Words never break mid-word.** Text wraps at spaces. If you must show an identifier longer than one line (`NSUserTrackingUsageDescription`), put a zero-width space (`​`) at a sensible boundary; that is the only place a word may break and both the test and QA treat each part as its own word. Hyphens and slashes are also allowed break points (except in captions, which shrink a long word to fit instead).

## 4. Scenes (copy-paste examples)

`Tone` = `'accent' | 'good' | 'bad' | 'warn' | 'info' | 'muted'`. `accent` is the series colour. In titles, lists, stats, quizzes and outro points, wrap words in `*stars*` to colour them with the accent (inline, mid-sentence is fine).

### title: hook card with giant kinetic type
```ts
{ type: 'title', kicker: 'React internals', title: 'setState does *not* change your variable',
  emoji: '🤯', style: 'slam' }   // style: 'slam' (words punch in) | 'stack' (huge stacked words) | 'glitch'
```
3–7 words. `sub` is an optional smaller line. Two sizes: big (14.5cqw) when the title fits 2 phone lines, regular (10.5cqw) otherwise; balanced wrapping, never more than 4 lines (tested + QA `title-lines`). `stack` puts a word per line only for ≤ 4 words.

### code: types in, then highlights
```ts
{ type: 'code', lang: 'tsx', file: 'Counter.tsx',
  code: `const [count, setCount] = useState(0);
setCount(count + 1);
console.log(count);`,
  highlight: [2],          // accent glow. 1-based; ranges like [2, 4] are inclusive.
  errors: [3],             // red glow + shake
  added: [],               // green glow
  note: { line: 3, text: 'logs 0 😱', tone: 'bad' },  // callout bubble under that line
  focus: true }            // dim unmarked lines (default: true when anything is marked)
```
`lang`: `tsx ts js json bash kotlin java swift objc xml gradle ruby cpp text`. The longest line sets the font size: at 38 columns it is at the minimum. The file name and the language badge share the chrome bar.

### terminal: commands type out, output appears
```ts
{ type: 'terminal', title: 'Build it',
  lines: [{ cmd: 'npx react-native run-android' }, { out: 'BUILD SUCCESSFUL in 41s', tone: 'good' }] }
```
The widest `out` row sets the font size; a long `cmd` wraps once at a space with a hanging indent.

### diagram: nodes and arrows on a grid
```ts
{ type: 'diagram', title: 'The bridge', cols: 3, rows: 4,
  nodes: [
    { id: 'js', label: 'JS thread', icon: '🟨', x: 0, y: 0, active: true },
    { id: 'native', label: 'Native', sub: 'UI thread', icon: '📱', x: 2, y: 0, tone: 'info' },
    { id: 'q', label: 'Queue', x: 1, y: 2, shape: 'pill', dim: true },   // shape: box | pill | circle
  ],
  edges: [{ from: 'js', to: 'native', label: 'JSON', active: true }, { from: 'native', to: 'q', dashed: true, tone: 'bad', both: true }],
  packets: [{ from: 'js', to: 'native', label: '{}', tone: 'warn' }],  // dot flies along the arrow (loops)
  caption: 'every call is serialized' }
```
`x` is the column, `y` the row (0-based, fractions allowed). Nodes are one cell wide (at most 56cqw, so a `cols: 1` chain fills ~¾ of a phone column), so the word budgets depend on `cols` (table in §6); nodes sharing a row share the tallest node's height. A `sub` wraps to 2 lines at most; a `circle` holds an icon and a label only (use a `pill` for a sub) (tested). Row centres sit on the canvas edges, so the heading and the caption hug the graph. Edge labels sit beside their edge on an opaque backdrop, above the packets. A packet flies along one edge: never between two nodes with a third in the way (it would cover its text; QA `overlay-covers-text`). New node id → pops in; `dim: true` → fades. Edges need existing ids (tested). A vertical chain belongs in `cols: 1` (QA fails a graph narrower than half the zone).

### tree: component or fiber tree
```ts
{ type: 'tree', title: 'Who re-renders?', caption: 'state lives in Counter',
  root: { id: 'app', label: 'App', dim: true, children: [
    { id: 'counter', label: 'Counter', active: true, dirty: true, children: [{ id: 'btn', label: 'Button', active: true }] },
    { id: 'footer', label: 'Footer', dim: true } ] } }
```
Layout is automatic; each leaf is a column. `active` = glowing, `dirty` = dashed + dot, `dim` = skipped.

### phone: device mockup
```ts
{ type: 'phone', os: 'android', caption: 'each row owns a note', tap: { x: 0.5, y: 0.86 },
  screen: { kind: 'app', title: 'Groceries', icon: '🛒', body: 'optional paragraph',
    items: [{ id: 'milk', label: 'Milk', icon: '🥛', value: '2 litres', tone: 'bad' }, { id: 'eggs', label: 'Eggs', sub: '12 pack', checked: true }],
    button: '+ Add', toast: 'Saved', loading: false } }   // loading: spinner below the rows
```
Other `screen` kinds: `permission` (`app, icon, text, allow, deny, choice`), `notification` (`notice: { app, title, body, icon }, behind: 'home' | 'lock' | 'app'`; on the lock screen it sits under the clock), `bubble`, `home` (`highlight`), `lock` (`time, notices`), `killed`, `crash` (`message`), `splash`. Give list items a stable `id` when you reorder them across beats.

### compare: left vs right
```ts
{ type: 'compare', title: 'Pick your key',
  left:  { title: 'key={index}', verdict: 'bad', items: ['Sticks to positions', 'Breaks on sort'] },
  right: { title: 'key={item.id}', verdict: 'ok', items: ['Follows the item', 'Safe to reorder'], icon: '✅' } }
```
`verdict`: `ok` (✓ stamp), `bad` (✕), `neutral`. 2–3 items per side, 4 words or fewer each (≤ 26 characters: two lines on a phone card). The cards share a row grid (heads, code, lists align) and the VS badge owns the gutter between them.

### list, timeline, stat, quiz, outro
```ts
{ type: 'list', title: 'Index keys break on…', numbered: false, active: 1,
  items: ['Plain string', { text: 'Delete a *row*', icon: '🗑️', sub: 'small note', tone: 'bad' }] }   // 3–5 items
{ type: 'timeline', title: 'One tap, four steps', active: 2,
  steps: [{ label: 'Tap', sub: 'count is 0', icon: '👆' }, { label: 'Queue' }, { label: 'Render', tone: 'accent' }, { label: 'Commit' }] }
{ type: 'stat', value: '16.6', unit: 'ms', label: 'per frame at *60fps*', sub: 'miss it and you drop a frame', tone: 'warn' }  // leading number counts up
{ type: 'quiz', question: 'count is 5. You call setCount(5). Then?', options: ['Re-renders anyway', 'React bails out', 'Throws'], answer: 1 }
{ type: 'quiz', question: '…same…', options: [/* same */], answer: 1, reveal: true, explain: 'Object.is(5, 5) is true, so React bails out.' }
{ type: 'outro', points: ['setState queues an update', 'count is a *snapshot*'], tagline: 'Schedules, not assigns.' }  // 2–3 points, 7 words or fewer
```
`active` (list/timeline) highlights one entry and dims the rest; step it across beats. Quiz = two beats (ask → reveal).

## 5. Sound effects

`sfx`: `whoosh` (big entrance), `swipe` (scene change), `pop` (node/item appears), `click` (small change), `type` (code/terminal), `ding` (insight), `success` (fix works, outro), `error` (bug, crash), `riser` (tension: quiz question), `none`. Defaults: beat 1 → `whoosh`, type change → `swipe`, same type → `click`. Don't put a loud effect on every beat.

## 6. Text budgets (enforced by `npx vitest run`)

Scenes never scroll, so every field has a budget in `src/reels/limits.ts`; `tests/reels.test.ts` fails a reel that exceeds one. **Keep this table in sync with `LIMITS`.** Plain numbers are total characters (the text may wrap at spaces) or counts. **Word** columns are the widest single word that fits on one line, in *average characters* (the test measures real glyph widths: `illit` fits more, `mmww` less); mono fields count plain characters.

| Scene | Lengths | Widest word |
|---|---|---|
| title | title 40 (≤ 4 phone lines) · kicker 26 · sub 60 | title 12.1 · sub 25.8 |
| code | 14 lines × 38 cols · note 36 · file + lang badge 26 | note 29.6 |
| terminal | 8 lines · cmd 40 (wraps once) · out 34 cols × 4 rows · title 30 | — |
| diagram | 9 nodes · label 18 · sub 24 (≤ 2 lines) · edge label 16 · caption 40 · title 30 | label (15px floor) by cols 1/2/3/4/5: 24.6 / 15.3 / 9.9 / 7.2 / 5.6, circle × 0.8 · sub (mono) 20 / 18 / 11 / 8 / 6 · caption 34.6 |
| tree | 5 leaves · depth 4 · label 14 · caption 32 · title 30 | label by leaves 1–5: 24.6 / 15.3 / 9.9 / 7.2 / 5.6 · caption 34.6 |
| phone | 5 items · label 36 · sub 30 · value 10 · title 24 · body 70 · caption 40 · notice title 36 / body 50 · bubble 40 · permission 70 · crash 60 · toast 30 | label 19.8 · sub 27 · title 15.8 · notice title 21.5 / body 23 · caption 36 (laptop frame is the tight one) |
| compare | 4 items · item 26 · side title 18 · code 6 × 23 · title 30 | item 15 · side title (mono) 14 |
| list | 5 items · text 36 · sub 36 · title 30 | text 14.5 · sub 22.8 |
| timeline | 6 steps · label 18 · sub 30 · title 30 | label 16.6 · sub (mono) 24 |
| stat | value 8 · unit 6 · label 36 · sub 40 | label 17.6 · sub 25.5 |
| quiz | question 70 · 4 options · option 32 · explain 72 | question 17.8 · option 18.8 · explain (mono) 29.8 |
| outro | 4 points · point 46 · tagline 30 · title 24 | point 18.8 · tagline 16.7 |
| any scene title | 30 | 19.2 |

Captions are built from `say` in chunks of ≤ 5 words / 24 characters, never cross a sentence end, prefer to break after commas, never dangle a function word ("the") at the end of a chunk and never leave a sentence's last short word alone. A chunk also either fits one phone caption line (10.7em; one or two words shrink to fit) or wraps into two lines of ≥ 2 words each, so a second line never holds a lone word. Keep sentences short and you'll never see a 3-line caption.

## 7. Writing, composition and caption rules

**Writing**
1. **Hook first.** Beat 1 is a `title` with a surprising claim or question, 12 words or fewer in `say`. No "In this video…".
2. **One idea per reel.** 6–11 beats, 110–170 words, 45–70 seconds. 8–22 words per beat, one sentence (or two very short ones).
3. **Show a concrete example** within the first 3 beats: real code, a real screen, a real bug. Diagrams come after.
4. **Every beat changes something visible.** Never two beats that look identical.
5. **Vary the scenes**: at least 4 scene types per reel; mix code with a visual (diagram, tree, phone, timeline).
6. **Pay it off.** The last beat is an `outro` whose `say` starts with "Remember this."
7. Casual, plain language, "you", contractions. Be correct (React 19, RN New Architecture, Android 14+, iOS 17+). Screen text is short; narration carries the explanation. Avoid things TTS reads badly in `say` (emoji, `=>`, `%`, URLs); use `speak`.

**Composition** (the QA checks most of these; the rest is taste)
- **One focal point per beat**: one `active` node, one highlighted line, one glowing item.
- **Balanced on the centre axis**: diagrams symmetric around the middle column; a lone node goes in the centre column; a pair goes at `x: 0` and `x: 2` of `cols: 3`, not `0` and `1`.
- **Integer rows for nodes that share a row**; use fractions (`y: 1.5`) only for a mid-point node.
- **No edge label between adjacent nodes** (it collides with both); label edges that have room, or let the `packets` tell the story.
- **No lonely single items**: a list/compare/outro with one entry looks broken. Use a `stat` or `title` instead.
- **Notes never cover the marked line**: put `note.line` on the highlighted line itself (the bubble opens *below* it) or on the last line of the block.
- **Fill the zone**: a scene whose settled ink covers less than 22% of the zone height fails QA, and a diagram/tree whose nodes span less than half the zone width fails too. Add a `caption`, a `sub`, or a second node rather than leaving dead space; a vertical chain uses `cols: 1`.
- **Diagrams on phones are tall**: prefer more rows than columns; `cols: 3` fits ~10-char labels, `cols: 4` only ~7. Labels never go below 15px and subs below 11px; a longer identifier gets a `​` break (`UIText​View`) or a shorter label.
- **Leave packets room**: in a vertical chain, spread the nodes over the rows (`y: 0, 4/3, 8/3, 4` of `rows: 5`) so a packet has an edge to travel on; a packet on an edge too short to travel is not drawn.
- **Empty phone screens** (an `app` with no items, button, toast or spinner) render as a calm grey canvas, not a white slab; give the beat real rows when the point isn't "nothing is drawn".

**Captions**: `emphasis` 1–3 words. Prefer a comma over a long clause; it becomes a caption break. A word longer than ~15 characters in `say` forces a short chunk; reword if it reads oddly.

## 8. Generate the voice

```bash
npm run reels:voice                    # renders every reel whose narration changed
npm run reels:voice -- my-reel-id      # just one reel (--force to re-render)
```
Kokoro-82M via `uv`, `af_heart` at speed 1.1, encoded with ffmpeg to `public/react-native-reels/audio/<id>.m4a` + `<id>.json` (beat and word timings) + `index.json`. Needs `uv` and `ffmpeg`. Reels without audio play silently on an estimated clock so you can preview layout first.

## 9. Before you ship a reel (mandatory)

```bash
npx tsc -b                               # types
npx vitest run                           # ids, beats, line numbers, budgets (§6), audio manifests
npm run reels:qa -- --reel my-reel-id    # must end with "0 failing"
npm run reels:voice -- my-reel-id        # if `say` changed (then re-run vitest + QA)
```

Then **open `.reels-qa/index.html`** and look at every beat at **both** sizes (phone and laptop), not just the failing ones. Ask: is there one focal point, is it balanced, does anything look cramped, does the caption read well at the `longcap` moment? Fix and re-run until it looks like the best reel in the series.

### What `reels:qa` checks

It renders every beat at phone (390×844) and laptop (1440×900) at five frozen moments (`enter` 80ms in, `settle` 1.8s in, `mid`, `end`, `longcap` = the longest caption chunk) and fails the frame on any of these:

| Rule | Fails when |
|---|---|
| `zone-overflow` | settled content leaves the content zone (tolerance 1px, 3px for glyph boxes) |
| `caption-gap` | content overlaps the caption or sits closer than 3.5% of the stage width above it |
| `rail-clear` / `top-overlap` | content or the caption is < 12px from the phone action rail icons it shares rows with / content touches the progress-bar chrome |
| `sibling-overlap` | two sibling blocks overlap by more than 2px |
| `overlay-covers-text` | the VS badge or a packet is painted over scene text |
| `clipped` | text cut by an `overflow: hidden` ancestor, or ellipsised |
| `font-min` | rendered size below caption 18 (24.6 normally; a lone long word may shrink) / title 18 / body 13 / diagram label 15 / small labels, subs & mono 11 / phone mock 8 / chrome 11 px |
| `caption-lines` / `caption-words` / `caption-orphan-line` | a caption chunk needs more than 2 lines or leaves its box / two words on a line are < 0.26em apart / line 2 holds a lone word (rendered, or by the phone-width estimate of every chunk) |
| `heading-jump` | a scene heading sits > 2.5% of the stage height from the reel's median heading position (checked on `end` frames) |
| `title-lines` | a title wraps to more than 4 lines |
| `dia-size` | a diagram/tree's nodes span < 50% of the zone width (on the settled `end` frame) |
| `stat-unit-gap` | the unit is < 0.06em (of the value size) from the number |
| `blank` | no scene ink at ≥ 0.25 opacity at a sampled moment, including `enter` (80ms after the beat change) |
| `fit-scaled` | Fit had to shrink the scene below 85% |
| `composition` | the zone is off the stage axis (> 1.5%), or a centred scene's ink centre is > 10% of the zone width off centre (not on `enter`) |
| `fill` | at the end of a beat the settled ink covers < 22% of the zone height |
| `word-split` | a word breaks across two lines, runs past the border of its box, or spills out of its diagram node / circle (only `​` and hyphens may break a word; never in captions) |
| `caption-sentence` / `caption-orphan` | a caption chunk spans a sentence end / a sentence ends on a lone short word |
| `error` | the beat could not be rendered or frozen |

Flags: `--reel a,b`, `--viewport phone|laptop`, `--moments enter,settle,end`, `--no-shots`, `--out <dir>` (the run only clears its own reels' shot folders), `--workers 6`. Output: `report.json` + `index.html` contact sheet + `shots/<viewport>/<reel>/<beat>-<moment>.jpg`.
