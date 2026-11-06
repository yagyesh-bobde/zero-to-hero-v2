import type { DiagramEdge, DiagramNode, PhoneItem, QuizScene, Series } from '../types';

// ---------- rn-threads ----------
const tapHandler = `function onPress() {
  // build a giant report
  const rows = buildHugeReport();
  setRows(rows);
}`;

type ThreadMode = 'js' | 'ui' | 'bg' | 'busy';
const threadNodes = (mode: ThreadMode): DiagramNode[] => [
  {
    id: 'js',
    label: 'JS thread',
    sub: mode === 'busy' ? 'busy for 200ms' : 'your React code',
    icon: mode === 'busy' ? '🔥' : '🟨',
    x: 1,
    y: 0,
    active: mode === 'js' || mode === 'busy',
    tone: mode === 'busy' ? 'bad' : undefined,
  },
  { id: 'bg', label: 'BG thread', sub: 'layout + commit', icon: '⚙️', x: 2, y: 1.5, active: mode === 'bg', dim: mode === 'busy' },
  { id: 'ui', label: 'UI thread', sub: 'aka main', icon: '📱', x: 1, y: 3, active: mode === 'ui', tone: 'info' },
  { id: 'views', label: 'Real views', icon: '🖼️', x: 0, y: 1.5, shape: 'pill', dim: mode === 'js' || mode === 'bg' },
];
const threadEdges = (mode: ThreadMode): DiagramEdge[] => [
  { from: 'js', to: 'bg', label: 'new tree', active: mode === 'js', dashed: mode === 'busy' },
  { from: 'bg', to: 'ui', label: 'mount', active: mode === 'bg', dashed: mode === 'busy' },
  { from: 'ui', to: 'views', label: 'only path', active: mode === 'ui' },
  ...(mode === 'busy'
    ? [{ from: 'ui', to: 'js', label: 'touch waits', tone: 'bad' as const, dashed: true }]
    : []),
];

// ---------- bridge-vs-jsi ----------
const oldCall = `// Old bridge (legacy)
NativeModules.Foo.getValue(
  (v) => use(v),
);

// What crossed the bridge:
// [["UIManager", "createView",
//   [tag, "RCTView", props]]]`;

const bridgeQuiz: QuizScene = {
  type: 'quiz',
  question: 'Sync calls are possible now. Make every call sync?',
  options: ['Yes, sync is faster', 'No, sync blocks JS', 'Only on iOS'],
  answer: 1,
};

// ---------- fabric-render-pipeline ----------
const fabricSteps = [
  { label: 'Render', sub: 'JS thread · shadow nodes', icon: '⚛️' },
  { label: 'Commit', sub: 'background · Yoga layout', icon: '📐' },
  { label: 'Mount', sub: 'UI thread · real views', icon: '📱' },
];

const mountNodes = (sent: boolean): DiagramNode[] => [
  { id: 'old', label: 'On screen', sub: 'View: red', icon: '🌳', x: 0, y: 0, dim: sent },
  { id: 'new', label: 'New tree', sub: 'View: yellow', icon: '🌳', x: 2, y: 0, tone: 'accent' },
  { id: 'diff', label: 'Diff', icon: '🔍', x: 1, y: 1.4, shape: 'circle', active: !sent },
  {
    id: 'host',
    label: 'Host view',
    sub: sent ? 'now yellow' : 'UI thread',
    icon: '📱',
    x: 1,
    y: 3,
    tone: sent ? 'good' : 'info',
    active: sent,
  },
];

// ---------- turbomodules-codegen ----------
const spec = `// specs/NativeLocalStorage.ts
export interface Spec
  extends TurboModule {
  setItem(value: string,
    key: string): void;
  getItem(key: string):
    string | null;
}

export default TurboModuleRegistry
  .getEnforcing<Spec>(
    'NativeLocalStorage',
  );`;

const codegenNodes = (filled: boolean): DiagramNode[] => [
  { id: 'spec', label: 'Your spec', sub: 'TS interface', icon: '📄', x: 1, y: 0, dim: filled },
  { id: 'cg', label: 'Codegen', sub: 'every build', icon: '⚙️', x: 1, y: 1.2, shape: 'pill', active: !filled, dim: filled },
  { id: 'cpp', label: 'C++ glue', sub: '…SpecJSI', icon: '🔌', x: 0, y: 2.5 },
  { id: 'java', label: 'Java class', sub: '…Spec', icon: '☕', x: 1, y: 2.5, active: filled },
  { id: 'objc', label: 'ObjC++ protocol', sub: '<…Spec>', icon: '🍎', x: 2, y: 2.5, active: filled },
  ...(filled
    ? [
        { id: 'kt', label: 'Your Kotlin', sub: 'extends', icon: '🤖', x: 0.6, y: 3.9, tone: 'good' as const },
        { id: 'mm', label: 'Your .mm', sub: 'conforms', icon: '🧩', x: 1.9, y: 3.9, tone: 'good' as const },
      ]
    : []),
];
const codegenEdges = (filled: boolean): DiagramEdge[] => [
  { from: 'spec', to: 'cg', active: !filled },
  { from: 'cg', to: 'cpp', dashed: filled },
  { from: 'cg', to: 'java', dashed: filled },
  { from: 'cg', to: 'objc', dashed: filled },
  ...(filled
    ? [
        { from: 'kt', to: 'java', tone: 'good' as const, active: true },
        { from: 'mm', to: 'objc', tone: 'good' as const, active: true },
      ]
    : []),
];

const changeQuiz: QuizScene = {
  type: 'quiz',
  question: 'You change getItem in the spec to return a number. Then?',
  options: ['Crash at runtime', 'Native stops compiling', 'JS converts it'],
  answer: 1,
};

// ---------- js-to-kotlin-call-path ----------
type HopStep = 'host' | 'cpp' | 'back';
const hopNodes = (step: HopStep): DiagramNode[] => [
  { id: 'js', label: 'getItem()', sub: 'JS thread', icon: '🟨', x: 0, y: 0, active: step === 'back', tone: step === 'back' ? 'good' : undefined },
  { id: 'host', label: 'Host object', sub: 'JSI', icon: '🔌', x: 0, y: 4 / 3, active: step === 'host' },
  { id: 'cpp', label: 'C++ spec', sub: '…SpecJSI', icon: '⚙️', x: 0, y: 8 / 3, active: step === 'cpp' || step === 'back' },
  { id: 'kt', label: 'Kotlin getItem', sub: 'your code', icon: '🤖', x: 0, y: 4, active: step === 'cpp', dim: step === 'host' },
];
const hopEdges: DiagramEdge[] = [
  { from: 'js', to: 'host', both: true },
  { from: 'host', to: 'cpp', both: true },
  { from: 'cpp', to: 'kt', both: true },
];

const authCall = `import NativeLocalStorage
  from './NativeLocalStorage';

const token =
  NativeLocalStorage
    .getItem('token');`;

const kotlinModule = `class NativeLocalStorageModule(
  ctx: ReactApplicationContext
) : NativeLocalStorageSpec(ctx) {
  override fun getItem(
    key: String
  ): String? = ctx
    .getSharedPreferences(
      "local", MODE_PRIVATE)
    .getString(key, null)
}`;

const threadQuiz: QuizScene = {
  type: 'quiz',
  question: 'Which thread ran your Kotlin getItem?',
  options: ['The UI thread', 'The JS thread', 'A background thread'],
  answer: 1,
};

// ---------- hermes-bytecode ----------
const hermesNodes = (compiled: boolean): DiagramNode[] => [
  { id: 'files', label: 'Your files', sub: 'App.tsx, …', icon: '🗂️', x: 0, y: 0, dim: compiled },
  { id: 'metro', label: 'Metro', sub: 'follows imports', icon: '🚇', x: 0, y: 1, active: !compiled, dim: compiled },
  { id: 'bundle', label: 'JS bundle', sub: 'one file', icon: '📜', x: 0, y: 2, active: compiled },
  ...(compiled
    ? [{ id: 'hbc', label: '.hbc file', sub: 'Hermes bytecode', icon: '⚡', x: 0, y: 3.2, tone: 'good' as const, active: true }]
    : []),
];
const hermesEdges = (compiled: boolean): DiagramEdge[] => [
  { from: 'files', to: 'metro', active: !compiled },
  { from: 'metro', to: 'bundle', active: !compiled },
  ...(compiled ? [{ from: 'bundle', to: 'hbc', label: 'at build time', active: true }] : []),
];

const isHermes = `const isHermes = () =>
  !!global.HermesInternal;

console.log(isHermes());
// true in dev builds too`;

const v1Quiz: QuizScene = {
  type: 'quiz',
  question: 'Does Hermes V1 compile JS to native code, or JIT it?',
  options: ['Yes, both', 'Just a JIT', 'Neither, not yet'],
  answer: 2,
};

// ---------- reanimated-worklets ----------
const animatedStyle = `const x = useSharedValue(0);

const style = useAnimatedStyle(
  () => ({
    transform: [
      { translateX: x.value },
    ],
  }),
);`;

type RuntimeMode = 'two' | 'copy' | 'shared' | 'busy';
const runtimeNodes = (mode: RuntimeMode): DiagramNode[] => [
  {
    id: 'rn',
    label: 'RN runtime',
    sub: mode === 'busy' ? 'JS thread · busy 🔥' : 'JS thread',
    icon: '🟨',
    x: 0,
    y: 0.4,
    tone: mode === 'busy' ? 'bad' : undefined,
    active: mode === 'busy',
  },
  {
    id: 'ui',
    label: 'UI runtime',
    sub: mode === 'busy' ? 'UI thread · still 60fps' : 'UI thread',
    icon: '📱',
    x: 2,
    y: 0.4,
    tone: mode === 'busy' ? 'good' : 'accent',
    active: true,
  },
  ...(mode === 'copy'
    ? [{ id: 'babel', label: 'Babel plugin', sub: 'serializes', icon: '🧪', x: 1, y: 2, shape: 'pill' as const, active: true }]
    : []),
  ...(mode === 'shared' || mode === 'busy'
    ? [{ id: 'sv', label: 'Shared value', sub: 'x.value', icon: '🔗', x: 1, y: 2, shape: 'pill' as const, active: mode === 'shared', dim: mode === 'busy' }]
    : []),
  { id: 'box', label: 'Moving view', icon: '🟦', x: 2, y: 3.2, active: mode === 'busy', dim: mode === 'two' || mode === 'copy' },
];

const workletHelper = `function clamp(v: number) {
  'worklet';
  return Math.min(v, 200);
}`;

const tapGesture = `const tap = Gesture.Tap()
  .onEnd(() => {
    x.value = withSpring(200);
    scheduleOnRN(
      trackEvent, 'tapped',
    );
  });`;

const setStateQuiz: QuizScene = {
  type: 'quiz',
  question: 'Can you call setState inside a worklet?',
  options: ['Sure, why not', 'No, use scheduleOnRN', 'Only in gestures'],
  answer: 1,
};

// ---------- why-lists-jank-flashlist ----------
const chatRows = (n: number): PhoneItem[] =>
  Array.from({ length: n }, (_, i) => ({ id: `c${i + 1}`, label: `Message ${i + 1}`, icon: '💬' }));

const recycledRows = (bad: boolean): PhoneItem[] => [
  { id: 'c2', label: 'Message 2', icon: '💬', checked: false },
  { id: 'c3', label: 'Message 3', icon: '💬', checked: false },
  { id: 'c4', label: 'Message 4', icon: '💬', checked: false },
  { id: 'c5', label: 'Message 5', icon: '💬', checked: false },
  {
    id: 'c1',
    label: 'Message 6',
    sub: bad ? 'starred?! never touched it' : 'same row, new item',
    icon: '♻️',
    checked: true,
    tone: bad ? 'bad' : 'accent',
  },
];

const rowCode = `function Row({ item }) {
  const [starred, setStarred] =
    useRecyclingState(
      false,
      [item.id],
    );
  // …
}`;

// ---------- new-arch-today ----------
const gradleProps = `# android/gradle.properties
newArchEnabled=false
hermesV1Enabled=false`;

const archSteps = [
  { label: '0.68', sub: 'opt-in', icon: '🧪' },
  { label: '0.76', sub: 'on by default', icon: '✅' },
  { label: '0.82', sub: 'the only option', icon: '🔒' },
  { label: '0.84', sub: 'legacy out of iOS builds', icon: '🧹' },
];

const fasterQuiz: QuizScene = {
  type: 'quiz',
  question: 'New Architecture on. Is your app faster automatically?',
  options: ['Yes, instantly', 'Not necessarily', 'Only on Android'],
  answer: 1,
};

export const series: Series = {
  id: 'react-native-internals',
  title: 'React Native internals',
  emoji: '📱',
  color: '#f472b6',
  order: 2,
  blurb: 'Threads, JSI, Fabric, Hermes: what runs where when your RN app moves.',
  reels: [
    // 1 ─────────────────────────────────────────────
    {
      id: 'rn-threads',
      title: 'Three threads, one frame',
      beats: [
        {
          say: 'A 200 millisecond function can drop twelve frames. Here’s why.',
          scene: {
            type: 'title',
            kicker: 'RN threads',
            title: '200ms drops *12 frames*',
            sub: 'one busy thread, one frozen app',
            emoji: '🧵',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['twelve', 'frames'],
        },
        {
          say: 'Here’s a tap handler. It builds a huge report, then sets state.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Report.tsx',
            code: tapHandler,
            highlight: [3],
            note: { line: 3, text: '~200ms of sync work 🐌', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['huge'],
        },
        {
          say: 'Smooth means sixty frames a second. That’s just 16.67 milliseconds per frame.',
          speak: 'Smooth means sixty frames a second. That’s just sixteen point six seven milliseconds per frame.',
          scene: {
            type: 'stat',
            value: '16.67',
            unit: 'ms',
            label: 'per frame at *60fps*',
            sub: '200ms ≈ 12 frames missed',
            tone: 'warn',
          },
          emphasis: ['sixty', '16.67'],
        },
        {
          say: 'React Native splits the work. Your components and handlers run on the JS thread.',
          speak: 'React Native splits the work. Your components and handlers run on the J S thread.',
          scene: {
            type: 'diagram',
            title: 'Who runs where',
            cols: 3,
            rows: 4,
            nodes: threadNodes('js'),
            edges: threadEdges('js'),
            packets: [{ from: 'js', to: 'bg', label: '⚛️' }],
          },
          sfx: 'pop',
          emphasis: ['JS', 'thread'],
        },
        {
          say: 'The UI thread, also called main, is the only one allowed to touch real views.',
          speak: 'The U I thread, also called main, is the only one allowed to touch real views.',
          scene: {
            type: 'diagram',
            title: 'Who runs where',
            cols: 3,
            rows: 4,
            nodes: threadNodes('ui'),
            edges: threadEdges('ui'),
            packets: [{ from: 'ui', to: 'views', label: '🖌️', tone: 'info' }],
          },
          emphasis: ['only'],
        },
        {
          say: 'Layout math and committing the shadow tree happen on a background thread, so the UI thread stays free.',
          speak:
            'Layout math and committing the shadow tree happen on a background thread, so the U I thread stays free.',
          scene: {
            type: 'diagram',
            title: 'Who runs where',
            cols: 3,
            rows: 4,
            nodes: threadNodes('bg'),
            edges: threadEdges('bg'),
            packets: [{ from: 'bg', to: 'ui', label: '📐' }],
          },
          emphasis: ['background', 'free'],
        },
        {
          say: 'Block JS for 200 milliseconds and about twelve frames vanish. Taps feel dead. JS animations freeze.',
          speak:
            'Block J S for 200 milliseconds and about twelve frames vanish. Taps feel dead. J S animations freeze.',
          scene: {
            type: 'diagram',
            title: 'JS thread blocked',
            cols: 3,
            rows: 4,
            nodes: threadNodes('busy'),
            edges: threadEdges('busy'),
            packets: [{ from: 'ui', to: 'js', label: '👆', tone: 'bad' }],
            caption: '≈ 12 frames dropped',
          },
          sfx: 'error',
          emphasis: ['dead', 'freeze'],
        },
        {
          say: 'But a native ScrollView keeps on scrolling. It never asked JS for anything.',
          speak: 'But a native Scroll View keeps on scrolling. It never asked J S for anything.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Inbox',
              icon: '📬',
              items: [
                { id: 'a', label: 'Lunch?', sub: 'Sam', icon: '🍜' },
                { id: 'b', label: 'Deploy done', sub: 'CI bot', icon: '🤖' },
                { id: 'c', label: 'Your receipt', sub: 'Store', icon: '🧾' },
                { id: 'd', label: 'Standup notes', sub: 'Priya', icon: '📝' },
              ],
            },
            tap: { x: 0.5, y: 0.6 },
            caption: 'JS frozen, scroll still smooth',
          },
          sfx: 'swipe',
          emphasis: ['never'],
        },
        {
          say: 'One catch. Dev mode makes the JS thread way slower, so always measure in a release build.',
          speak: 'One catch. Dev mode makes the J S thread way slower, so always measure in a release build.',
          scene: {
            type: 'compare',
            title: 'Where to measure',
            left: { title: 'Dev build', verdict: 'bad', icon: '🐢', items: ['JS much slower', 'Misleading numbers'] },
            right: { title: 'Release build', verdict: 'ok', icon: '🚀', items: ['Real speed', 'Profile here'] },
          },
          emphasis: ['release'],
        },
        {
          say: 'Remember this. JS thinks, the UI thread draws. Keep JS light, and let native do the moving.',
          speak: 'Remember this. J S thinks, the U I thread draws. Keep J S light, and let native do the moving.',
          scene: {
            type: 'outro',
            points: ['JS thread runs your React code', 'Only the *UI thread* touches views', 'Busy JS = dead taps'],
            tagline: 'Keep JS light.',
          },
          sfx: 'success',
          emphasis: ['thinks', 'draws'],
        },
      ],
    },

    // 2 ─────────────────────────────────────────────
    {
      id: 'bridge-vs-jsi',
      title: 'Bridge vs JSI',
      beats: [
        {
          say: 'Old React Native talked to native by mailing JSON strings.',
          scene: {
            type: 'title',
            kicker: 'Bridge vs JSI',
            title: 'Old RN mailed *JSON strings*',
            emoji: '✉️',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['JSON', 'strings'],
        },
        {
          say: 'Here’s an old native call. No answer right away, just a callback, sometime later.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'legacy.js',
            code: oldCall,
            highlight: [[2, 4]],
            note: { line: 3, text: 'callback only. no answer now', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['callback', 'later'],
        },
        {
          say: 'Under the hood, every call turned into a JSON message like this one.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'legacy.js',
            code: oldCall,
            highlight: [[6, 8]],
            note: { line: 8, text: 'text, not objects 📝', tone: 'info' },
          },
          emphasis: ['JSON', 'message'],
        },
        {
          say: 'The bridge had three rules. Asynchronous, serializable, and batched.',
          scene: {
            type: 'list',
            title: 'The bridge’s 3 rules',
            numbered: true,
            items: [
              { text: '*Asynchronous*', icon: '⏳', sub: 'answers come later' },
              { text: '*Serializable*', icon: '📝', sub: 'everything becomes JSON' },
              { text: '*Batched*', icon: '📦', sub: 'queued, flushed together' },
            ],
          },
          sfx: 'pop',
          emphasis: ['asynchronous', 'serializable', 'batched'],
        },
        {
          say: 'So your data got flattened to text, waited in a queue, then got parsed again on the other side.',
          scene: {
            type: 'diagram',
            title: 'The old bridge',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'js', label: 'JavaScript', icon: '🟨', x: 0, y: 0 },
              { id: 'bridge', label: 'Bridge', sub: 'queue of JSON', icon: '🌉', x: 1, y: 1.5, active: true, tone: 'warn' },
              { id: 'native', label: 'Native', icon: '📱', x: 2, y: 3, tone: 'info' },
            ],
            edges: [
              { from: 'js', to: 'bridge', label: 'stringify', active: true },
              { from: 'bridge', to: 'native', label: 'parse', dashed: true },
            ],
            packets: [
              { from: 'js', to: 'bridge', label: '{…}', tone: 'warn' },
              { from: 'bridge', to: 'native', label: '{…}', tone: 'warn' },
            ],
            caption: 'copy, wait, parse, every time',
          },
          sfx: 'swipe',
          emphasis: ['flattened', 'queue'],
        },
        {
          say: 'JSI replaces all that. It’s a thin C++ layer where JS holds a direct reference to native objects.',
          speak:
            'J S I replaces all that. It’s a thin C plus plus layer where J S holds a direct reference to native objects.',
          scene: {
            type: 'diagram',
            title: 'JSI: no bridge',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'js', label: 'JavaScript', icon: '🟨', x: 0, y: 0, active: true },
              { id: 'bridge', label: 'Bridge', sub: 'retired', icon: '🌉', x: 2, y: 0, dim: true },
              { id: 'jsi', label: 'JSI', sub: 'C++ layer', icon: '🔌', x: 1, y: 1.5, tone: 'accent', active: true },
              { id: 'native', label: 'Native', icon: '📱', x: 2, y: 3, tone: 'info', active: true },
            ],
            edges: [
              { from: 'js', to: 'jsi', label: 'direct ref', active: true, both: true },
              { from: 'jsi', to: 'native', label: 'call method', active: true, both: true },
            ],
            packets: [
              { from: 'js', to: 'jsi', label: 'ref', tone: 'good' },
              { from: 'jsi', to: 'native', label: 'ref', tone: 'good' },
            ],
          },
          sfx: 'whoosh',
          emphasis: ['direct', 'reference'],
        },
        {
          say: 'No JSON, no copying. And you can even get an answer back synchronously.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'new-arch.js',
            code: `// New Architecture (JSI)
const value =
  nativeModule.getValue();
// returns immediately`,
            added: [[2, 3]],
            note: { line: 3, text: 'no JSON, no queue ✅', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['synchronously'],
        },
        {
          say: 'The docs mention VisionCamera pushing about two gigabytes of frame data a second through it.',
          speak: 'The docs mention Vision Camera pushing about two gigabytes of frame data a second through it.',
          scene: {
            type: 'stat',
            value: '2',
            unit: 'GB/s',
            label: '*VisionCamera* frame data',
            sub: 'through JSI, per the RN docs',
            tone: 'good',
          },
          sfx: 'pop',
          emphasis: ['two', 'gigabytes'],
        },
        {
          say: 'Quick check. Sync calls are possible now. Should every call be sync?',
          scene: bridgeQuiz,
          sfx: 'riser',
          emphasis: ['every'],
        },
        {
          say: 'Nope. A sync call blocks the JS thread while native works. Use it only when you need the answer now.',
          speak: 'Nope. A sync call blocks the J S thread while native works. Use it only when you need the answer now.',
          scene: { ...bridgeQuiz, reveal: true, explain: 'Sync means the JS thread waits.' },
          sfx: 'ding',
          emphasis: ['blocks'],
        },
        {
          say: 'Remember this. The bridge mailed letters. JSI makes a phone call. And since 0.82, the bridge is gone.',
          speak: 'Remember this. The bridge mailed letters. J S I makes a phone call. And since zero point eighty-two, the bridge is gone.',
          scene: {
            type: 'outro',
            points: ['Bridge: async, JSON, batched', 'JSI: direct refs, no serializing', 'Since 0.82, JSI is the *only* road'],
            tagline: 'Letters out. Calls in.',
          },
          sfx: 'success',
          emphasis: ['letters', 'call'],
        },
      ],
    },

    // 3 ─────────────────────────────────────────────
    {
      id: 'fabric-render-pipeline',
      title: 'Fabric: render, commit, mount',
      beats: [
        {
          say: 'Your View exists three times before it hits the screen.',
          scene: {
            type: 'title',
            kicker: 'Fabric renderer',
            title: 'One View, *three* lives',
            emoji: '🧩',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['three'],
        },
        {
          say: 'Take one red box. We’ll follow it to the screen, then turn it yellow.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Box.tsx',
            code: `<View
  style={{
    backgroundColor: 'red',
  }}
/>`,
            highlight: [3],
            note: { line: 3, text: '🟥 → soon 🟨', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['red', 'yellow'],
        },
        {
          say: 'Fabric, the renderer, works in three phases. First up, render, on the JS thread.',
          speak: 'Fabric, the renderer, works in three phases. First up, render, on the J S thread.',
          scene: { type: 'timeline', title: 'Fabric’s pipeline', steps: fabricSteps, active: 0 },
          emphasis: ['three', 'render'],
        },
        {
          say: 'Life one is the React element. For each host component, like View or Text, Fabric makes life two, a C++ shadow node.',
          speak:
            'Life one is the React element. For each host component, like View or Text, Fabric makes life two, a C plus plus shadow node.',
          scene: {
            type: 'tree',
            title: 'Who gets a shadow node?',
            root: {
              id: 'app',
              label: 'App',
              dim: true,
              children: [
                {
                  id: 'card',
                  label: 'MyCard',
                  dim: true,
                  children: [
                    { id: 'view', label: 'View', active: true },
                    { id: 'text', label: 'Text', active: true },
                  ],
                },
                { id: 'img', label: 'Image', active: true },
              ],
            },
            caption: 'MyCard gets no shadow node',
          },
          emphasis: ['one', 'two'],
        },
        {
          say: 'Shadow nodes never change. An update clones the node instead, which keeps threads from fighting.',
          scene: {
            type: 'tree',
            title: 'Update = clone',
            root: {
              id: 'app',
              label: 'App',
              dim: true,
              children: [
                {
                  id: 'card',
                  label: 'MyCard',
                  dim: true,
                  children: [
                    { id: 'view', label: 'View′ (clone)', active: true, dirty: true, tone: 'accent' },
                    { id: 'text', label: 'Text', dim: true },
                  ],
                },
                { id: 'img', label: 'Image', dim: true },
              ],
            },
            caption: 'immutable: never mutated',
          },
          sfx: 'click',
          emphasis: ['clones'],
        },
        {
          say: 'Commit. Yoga, a C++ flexbox engine, measures every node on a background thread.',
          speak: 'Commit. Yoga, a C plus plus flexbox engine, measures every node on a background thread.',
          scene: { type: 'timeline', title: 'Fabric’s pipeline', steps: fabricSteps, active: 1 },
          emphasis: ['Yoga', 'background'],
        },
        {
          say: 'Mount, on the UI thread. Fabric diffs the new tree against the one already on screen.',
          speak: 'Mount, on the U I thread. Fabric diffs the new tree against the one already on screen.',
          scene: {
            type: 'diagram',
            title: 'Mount',
            cols: 3,
            rows: 4,
            nodes: mountNodes(false),
            edges: [
              { from: 'old', to: 'diff', active: true },
              { from: 'new', to: 'diff', active: true },
              { from: 'diff', to: 'host', dashed: true },
            ],
          },
          emphasis: ['diffs'],
        },
        {
          say: 'Red to yellow becomes one tiny update on life three, the real native view. Nothing else gets touched.',
          scene: {
            type: 'diagram',
            title: 'Mount',
            cols: 3,
            rows: 4,
            nodes: mountNodes(true),
            edges: [
              { from: 'old', to: 'diff', dashed: true },
              { from: 'new', to: 'diff' },
              { from: 'diff', to: 'host', label: '1 mutation', active: true, tone: 'good' },
            ],
            packets: [{ from: 'diff', to: 'host', label: '🟨', tone: 'good' }],
          },
          sfx: 'ding',
          emphasis: ['three', 'nothing'],
        },
        {
          say: 'Mount speaks in tiny mutations, and it also flattens away wrappers that only affect layout.',
          scene: {
            type: 'list',
            title: 'Mount, in short',
            active: 3,
            items: [
              { text: 'createView', icon: '➕' },
              { text: 'updateView', icon: '✏️' },
              { text: 'removeView', icon: '➖' },
              { text: 'Flatten wrappers', icon: '🥞', sub: 'layout-only Views get dropped' },
            ],
          },
          sfx: 'pop',
          emphasis: ['mutations', 'flattens'],
        },
        {
          say: 'Remember this. Element, shadow node, native view. Render builds, commit measures, and mount patches only what changed.',
          scene: {
            type: 'outro',
            points: ['Render: shadow nodes, JS thread', 'Commit: Yoga layout, background', 'Mount: diff, then *tiny* mutations'],
            tagline: 'Build. Measure. Patch.',
          },
          sfx: 'success',
          emphasis: ['builds', 'measures', 'patches'],
        },
      ],
    },

    // 4 ─────────────────────────────────────────────
    {
      id: 'turbomodules-codegen',
      title: 'TurboModules and Codegen',
      beats: [
        {
          say: 'Your TypeScript interface writes the C++ glue code for you.',
          speak: 'Your TypeScript interface writes the C plus plus glue code for you.',
          scene: {
            type: 'title',
            kicker: 'TurboModules',
            title: 'TypeScript writes your *C++*',
            emoji: '⚙️',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['writes', 'glue'],
        },
        {
          say: 'Step one, a spec. A TypeScript interface that extends TurboModule, in a file whose name starts with Native.',
          speak:
            'Step one, a spec. A TypeScript interface that extends Turbo Module, in a file whose name starts with Native.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'NativeLocalStorage.ts',
            code: spec,
            highlight: [[1, 7]],
            note: { line: 1, text: 'file name must start with Native', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['spec', 'Native'],
        },
        {
          say: 'Export it with getEnforcing. That throws if the native side forgot to register the module.',
          speak: 'Export it with get Enforcing. That throws if the native side forgot to register the module.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'NativeLocalStorage.ts',
            code: spec,
            highlight: [[10, 13]],
            note: { line: 11, text: 'throws if not registered', tone: 'warn' },
          },
          emphasis: ['throws'],
        },
        {
          say: 'Step two. Point package.json at your specs folder with codegenConfig.',
          speak: 'Step two. Point package dot json at your specs folder with code gen config.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'package.json',
            code: `{
  "codegenConfig": {
    "type": "modules",
    "jsSrcsDir": "specs"
  }
}`,
            added: [[2, 5]],
            note: { line: 4, text: 'my specs live here 📂', tone: 'good' },
          },
          emphasis: ['specs'],
        },
        {
          say: 'Step three, build. Codegen runs on every build and writes C++ glue, a Java class, and an Objective-C++ protocol.',
          speak:
            'Step three, build. Code gen runs on every build and writes C plus plus glue, a Java class, and an Objective C plus plus protocol.',
          scene: {
            type: 'diagram',
            title: 'Codegen fans out',
            cols: 3,
            rows: 5,
            nodes: codegenNodes(false),
            edges: codegenEdges(false),
            packets: [
              { from: 'cg', to: 'cpp', tone: 'accent' },
              { from: 'cg', to: 'java', tone: 'accent' },
              { from: 'cg', to: 'objc', tone: 'accent' },
            ],
          },
          sfx: 'pop',
          emphasis: ['every', 'build'],
        },
        {
          say: 'Step four, fill in the blanks. Your Kotlin class extends the generated one. Your Objective-C++ file conforms to the protocol.',
          speak:
            'Step four, fill in the blanks. Your Kotlin class extends the generated one. Your Objective C plus plus file conforms to the protocol.',
          scene: {
            type: 'diagram',
            title: 'You fill in the blanks',
            cols: 3,
            rows: 5,
            nodes: codegenNodes(true),
            edges: codegenEdges(true),
          },
          emphasis: ['extends', 'conforms'],
        },
        {
          say: 'Step five, register it. A package on Android, a modulesProvider entry on iOS.',
          speak: 'Step five, register it. A package on Android, a modules Provider entry on iOS.',
          scene: {
            type: 'list',
            title: 'Register it',
            items: [
              { text: 'Android: add a package', icon: '🤖' },
              { text: 'iOS: modules\u200bProvider', icon: '🍎' },
              { text: 'JS finds it by name', icon: '🔎', sub: "'NativeLocalStorage'" },
            ],
          },
          emphasis: ['register'],
        },
        {
          say: 'Quick check. You change getItem in the spec to return a number. What happens?',
          speak: 'Quick check. You change get Item in the spec to return a number. What happens?',
          scene: changeQuiz,
          sfx: 'riser',
          emphasis: ['number'],
        },
        {
          say: 'Codegen regenerates the interface, so native code that doesn’t match stops compiling. That’s the whole point.',
          speak:
            'Code gen regenerates the interface, so native code that doesn’t match stops compiling. That’s the whole point.',
          scene: { ...changeQuiz, reveal: true, explain: 'Type safety across the JS ↔ native border.' },
          sfx: 'ding',
          emphasis: ['stops', 'compiling'],
        },
        {
          say: 'Remember this. The spec is the contract. Codegen turns it into glue, and the compiler keeps both sides honest.',
          speak:
            'Remember this. The spec is the contract. Code gen turns it into glue, and the compiler keeps both sides honest.',
          scene: {
            type: 'outro',
            points: ['Write a typed spec first', 'Codegen writes the glue', 'Mismatch? Native won’t *compile*'],
            tagline: 'Spec in. Glue out.',
          },
          sfx: 'success',
          emphasis: ['contract', 'honest'],
        },
      ],
    },

    // 5 ─────────────────────────────────────────────
    {
      id: 'js-to-kotlin-call-path',
      title: 'One JS call, step by step',
      beats: [
        {
          say: 'One JavaScript line crosses into C++, then Kotlin, and back.',
          speak: 'One JavaScript line crosses into C plus plus, then Kotlin, and back.',
          scene: {
            type: 'title',
            kicker: 'Native modules',
            title: 'One call, *three* languages',
            emoji: '🧭',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['Kotlin', 'back'],
        },
        {
          say: 'Here’s the line. Grab the saved login token from native storage.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'auth.ts',
            code: authCall,
            highlight: [[4, 6]],
            note: { line: 6, text: 'sync · string | null', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['token'],
        },
        {
          say: 'That object isn’t plain JavaScript. It’s a host object, backed by C++.',
          speak: 'That object isn’t plain JavaScript. It’s a host object, backed by C plus plus.',
          scene: {
            type: 'diagram',
            title: 'The call stack',
            cols: 1,
            rows: 5,
            nodes: hopNodes('host'),
            edges: hopEdges,
            packets: [{ from: 'js', to: 'host', label: "'token'" }],
          },
          sfx: 'pop',
          emphasis: ['host', 'object'],
        },
        {
          say: 'The call lands in the generated C++ class. It converts the JSI string into a Kotlin string.',
          speak: 'The call lands in the generated C plus plus class. It converts the J S I string into a Kotlin string.',
          scene: {
            type: 'diagram',
            title: 'The call stack',
            cols: 1,
            rows: 5,
            nodes: hopNodes('cpp'),
            edges: hopEdges,
            packets: [
              { from: 'host', to: 'cpp', label: "'token'" },
              { from: 'cpp', to: 'kt', label: 'String', tone: 'info' },
            ],
          },
          emphasis: ['converts'],
        },
        {
          say: 'Then it calls your Kotlin method, written against the generated base class. It reads SharedPreferences.',
          speak:
            'Then it calls your Kotlin method, written against the generated base class. It reads Shared Preferences.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'StorageModule.kt',
            code: kotlinModule,
            highlight: [[3, 9]],
            note: { line: 3, text: 'base class from Codegen', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['your', 'SharedPreferences'],
        },
        {
          say: 'Now the answer climbs back up. C++ wraps it in a JSI value, and JavaScript gets its string.',
          speak: 'Now the answer climbs back up. C plus plus wraps it in a J S I value, and JavaScript gets its string.',
          scene: {
            type: 'diagram',
            title: 'Back up the stack',
            cols: 1,
            rows: 5,
            nodes: hopNodes('back'),
            edges: hopEdges,
            packets: [
              { from: 'kt', to: 'cpp', label: '"abc123"', tone: 'good' },
              { from: 'cpp', to: 'host', label: 'jsi::Value', tone: 'good' },
            ],
          },
          sfx: 'ding',
          emphasis: ['back', 'string'],
        },
        {
          say: 'Quick check. Your Kotlin method just ran. Which thread was it on?',
          scene: threadQuiz,
          sfx: 'riser',
          emphasis: ['thread'],
        },
        {
          say: 'The JS thread, the whole trip. Even your Kotlin code. JavaScript sat and waited for every hop.',
          speak: 'The J S thread, the whole trip. Even your Kotlin code. JavaScript sat and waited for every hop.',
          scene: { ...threadQuiz, reveal: true, explain: 'A sync call never leaves the JS thread.' },
          sfx: 'ding',
          emphasis: ['whole', 'waited'],
        },
        {
          say: 'No JSON, but not free. Keep sync methods tiny, or return a Promise and get the answer later.',          scene: {
            type: 'compare',
            title: 'Sync or Promise?',
            left: {
              title: 'getItem(): string',
              verdict: 'neutral',
              icon: '⏸️',
              items: ['JS thread waits', 'Keep it tiny'],
            },
            right: {
              title: 'getItem(): Promise',
              verdict: 'ok',
              icon: '📬',
              items: ['Returns right away', 'Resolves on JS later'],
            },
          },
          sfx: 'swipe',
          emphasis: ['tiny', 'Promise'],
        },
        {
          say: 'Remember this. JS calls a host object, generated glue translates, and Kotlin does the work. Sync means JS waits.',
          speak:
            'Remember this. J S calls a host object, generated glue translates, and Kotlin does the work. Sync means J S waits.',
          scene: {
            type: 'outro',
            points: ['JS → host object → C++ → Kotlin', 'Values convert at each border', 'Sync = the *JS thread waits*'],
            tagline: 'Fast, not free.',
          },
          sfx: 'success',
          emphasis: ['translates', 'waits'],
        },
      ],
    },

    // 6 ─────────────────────────────────────────────
    {
      id: 'hermes-bytecode',
      title: 'Hermes skips parsing',
      beats: [
        {
          say: 'Your release app never parses JavaScript. It’s already bytecode.',
          scene: {
            type: 'title',
            kicker: 'Hermes engine',
            title: 'Your app never *parses* JS',
            emoji: '⚡',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['never', 'bytecode'],
        },
        {
          say: 'Build a release, and your JavaScript gets transformed before it ever reaches the phone.',
          scene: {
            type: 'terminal',
            title: 'Release build',
            lines: [
              { cmd: './gradlew bundleRelease' },
              { cmd: 'yarn ios --mode Release' },
              { out: 'BUILD SUCCESSFUL in 1m 52s', tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['release'],
        },
        {
          say: 'You’ve met Metro already. It glues every file into one JavaScript bundle. That’s just the start.',
          scene: {
            type: 'diagram',
            title: 'From files to bytecode',
            cols: 1,
            rows: 4,
            nodes: hermesNodes(false),
            edges: hermesEdges(false),
            packets: [
              { from: 'files', to: 'metro', label: 'import' },
              { from: 'metro', to: 'bundle', label: '📦' },
            ],
          },
          sfx: 'pop',
          emphasis: ['Metro', 'start'],
        },
        {
          say: 'Then, at build time, that bundle gets compiled into Hermes bytecode. That’s the .hbc file.',
          speak: 'Then, at build time, that bundle gets compiled into Hermes bytecode. That’s the H B C file.',
          scene: {
            type: 'diagram',
            title: 'From files to bytecode',
            cols: 1,
            rows: 4,
            nodes: hermesNodes(true),
            edges: hermesEdges(true),
            packets: [],
          },
          emphasis: ['build', 'bytecode'],
        },
        {
          say: 'So on the phone there’s no parse step and no compile step. It loads bytecode and runs.',
          scene: {
            type: 'compare',
            title: 'App startup',
            left: { title: 'Plain JS engine', verdict: 'bad', icon: '🐢', items: ['Parse text', 'Compile', 'Then run'] },
            right: { title: 'Hermes release', verdict: 'ok', icon: '⚡', items: ['Load .hbc', 'Run'] },
          },
          sfx: 'swipe',
          emphasis: ['no', 'runs'],
        },
        {
          say: 'That’s the Hermes deal. Faster startup, less memory, and a smaller app.',
          scene: {
            type: 'list',
            title: 'Why Hermes',
            items: [
              { text: 'Faster startup', icon: '🚀', sub: 'no parse, no compile' },
              { text: 'Less memory', icon: '🧠', sub: 'bytecode, not source' },
              { text: 'Smaller app', icon: '📦', sub: 'a lean engine' },
            ],
          },
          sfx: 'pop',
          emphasis: ['startup', 'memory', 'smaller'],
        },
        {
          say: 'Curious if Hermes is on? Check for global HermesInternal. Careful, that proves the engine, not the bytecode.',
          speak:
            'Curious if Hermes is on? Check for global Hermes Internal. Careful, that proves the engine, not the bytecode.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'debug.ts',
            code: isHermes,
            highlight: [2],
            note: { line: 2, text: 'engine ✅  bytecode ❓', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['engine', 'bytecode'],
        },
        {
          say: 'Since React Native 0.84, Hermes V1, with a new compiler and VM, is the default.',
          speak: 'Since React Native zero point eighty-four, Hermes V one, with a new compiler and V M, is the default.',
          scene: {
            type: 'stat',
            value: 'V1',
            label: 'default engine since *RN 0.84*',
            sub: 'new compiler + VM · opt-in since 0.82',
            tone: 'accent',
          },
          sfx: 'ding',
          emphasis: ['V1', 'default'],
        },
        {
          say: 'Quick check. Does V1 compile JavaScript to native code, or use a JIT?',
          speak: 'Quick check. Does V one compile JavaScript to native code, or use a JIT?',
          scene: v1Quiz,
          sfx: 'riser',
          emphasis: ['native', 'JIT'],
        },
        {
          say: 'Neither, not yet. Both are still future work. V1 is a better compiler and VM.',
          speak: 'Neither, not yet. Both are still future work. V one is a better compiler and V M.',
          scene: { ...v1Quiz, reveal: true, explain: 'No Static Hermes, no JIT in V1 yet.' },
          sfx: 'ding',
          emphasis: ['neither'],
        },
        {
          say: 'Remember this. Hermes does the parsing at build time, so your users never wait for it.',
          scene: {
            type: 'outro',
            points: ['Release builds ship *bytecode*', 'No parse, no compile on device', 'V1 is default since 0.84'],
            tagline: 'Parse once. At build.',
          },
          sfx: 'success',
          emphasis: ['build', 'never'],
        },
      ],
    },

    // 7 ─────────────────────────────────────────────
    {
      id: 'reanimated-worklets',
      title: 'Worklets run on the UI thread',
      beats: [
        {
          say: 'This function runs on a thread your React code can’t touch.',
          scene: {
            type: 'title',
            kicker: 'Reanimated',
            title: 'JS on the *UI thread*',
            emoji: '🎢',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['can’t', 'touch'],
        },
        {
          say: 'Here’s a Reanimated style. When x changes, that little arrow function reruns on the UI thread, not the JS thread.',
          speak: 'Here’s a Reanimated style. When x changes, that little arrow function reruns on the U I thread, not the J S thread.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Slider.tsx',
            code: animatedStyle,
            highlight: [[4, 8]],
            note: { line: 6, text: 'runs on the UI thread 🧵', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['UI', 'not'],
        },
        {
          say: 'Reanimated runs a second JavaScript runtime on the UI thread. A worklet is a function allowed to live there.',
          speak:
            'Reanimated runs a second JavaScript runtime on the U I thread. A worklet is a function allowed to live there.',
          scene: {
            type: 'diagram',
            title: 'Two JS runtimes',
            cols: 3,
            rows: 4,
            nodes: runtimeNodes('two'),
            edges: [{ from: 'rn', to: 'ui', dashed: true }],
            caption: 'two runtimes, two threads',
          },
          sfx: 'pop',
          emphasis: ['second', 'worklet'],
        },
        {
          say: 'The Babel plugin from react-native-worklets serializes the function, so it can be copied across.',
          speak: 'The Babel plugin from react native worklets serializes the function, so it can be copied across.',
          scene: {
            type: 'diagram',
            title: 'Two JS runtimes',
            cols: 3,
            rows: 4,
            nodes: runtimeNodes('copy'),
            edges: [
              { from: 'rn', to: 'babel', label: 'your fn', active: true },
              { from: 'babel', to: 'ui', label: 'copied', active: true },
            ],
            packets: [
              { from: 'rn', to: 'babel', label: 'ƒ' },
              { from: 'babel', to: 'ui', label: '{…}', tone: 'accent' },
            ],
            caption: 'a copy, not the original',
          },
          emphasis: ['serializes', 'copied'],
        },
        {
          say: 'useAnimatedStyle callbacks get marked for you. Your own helpers need the worklet directive.',
          speak: 'use Animated Style callbacks get marked for you. Your own helpers need the worklet directive.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'clamp.ts',
            code: workletHelper,
            added: [2],
            note: { line: 2, text: 'opt in by hand', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['directive'],
        },
        {
          say: 'Shared values connect the two worlds. Write it on one side, and the other side sees it.',
          scene: {
            type: 'diagram',
            title: 'Shared values',
            cols: 3,
            rows: 4,
            nodes: runtimeNodes('shared'),
            edges: [
              { from: 'rn', to: 'sv', both: true, active: true },
              { from: 'sv', to: 'ui', both: true, active: true },
              { from: 'ui', to: 'box', label: 'style' },
            ],
            packets: [
              { from: 'sv', to: 'ui', label: '200', tone: 'accent' },
              { from: 'ui', to: 'box', label: '→' },
            ],
          },
          sfx: 'swipe',
          emphasis: ['shared', 'sees'],
        },
        {
          say: 'So block the JS thread with a huge render, and the animation keeps going anyway.',
          speak: 'So block the J S thread with a huge render, and the animation keeps going anyway.',
          scene: {
            type: 'diagram',
            title: 'JS busy? Who cares',
            cols: 3,
            rows: 4,
            nodes: runtimeNodes('busy'),
            edges: [
              { from: 'rn', to: 'sv', dashed: true, tone: 'bad' },
              { from: 'sv', to: 'ui', dashed: true },
              { from: 'ui', to: 'box', label: 'every frame', active: true, tone: 'good' },
            ],
            packets: [{ from: 'ui', to: 'box', label: '→', tone: 'good' }],
          },
          sfx: 'ding',
          emphasis: ['keeps', 'going'],
        },
        {
          say: 'Quick check. Can you call setState inside a worklet?',
          speak: 'Quick check. Can you call set State inside a worklet?',
          scene: setStateQuiz,
          sfx: 'riser',
          emphasis: ['setState'],
        },
        {
          say: 'No. Worklets live in a different runtime, with no React in it. You have to hop back to React.',
          scene: { ...setStateQuiz, reveal: true, explain: 'React state lives on the RN runtime.' },
          sfx: 'ding',
          emphasis: ['different', 'hop'],
        },
        {
          say: 'Here’s that hop. scheduleOnRN runs your function back on the React side. The old runOnJS is deprecated.',
          speak: 'Here’s that hop. schedule On R N runs your function back on the React side. The old run On J S is deprecated.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Slider.tsx',
            code: tapGesture,
            highlight: [3],
            added: [[4, 6]],
            note: { line: 5, text: 'hop back to React', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['scheduleOnRN', 'deprecated'],
        },
        {
          say: 'Remember this. Worklets are tiny functions that move house to the UI thread. Animations stay smooth when JS is slammed.',
          speak:
            'Remember this. Worklets are tiny functions that move house to the U I thread. Animations stay smooth when J S is slammed.',
          scene: {
            type: 'outro',
            points: ['Worklets run on the *UI thread*', 'Shared values sync both sides', 'Back to React: scheduleOnRN'],
            tagline: 'Animate where you draw.',
          },
          sfx: 'success',
          emphasis: ['UI', 'smooth'],
        },
      ],
    },

    // 8 ─────────────────────────────────────────────
    {
      id: 'why-lists-jank-flashlist',
      title: 'FlashList recycles, FlatList mounts',
      beats: [
        {
          say: 'FlatList builds a new row every scroll. FlashList just reuses one.',
          speak: 'Flat List builds a new row every scroll. Flash List just reuses one.',
          scene: {
            type: 'title',
            kicker: 'Lists',
            title: 'Don’t build rows, *recycle*',
            emoji: '♻️',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['new', 'reuses'],
        },
        {
          say: 'Picture a chat with a thousand messages. You flick it, hard.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Chat', icon: '💬', items: chatRows(5) },
            caption: '1,000 messages. Flick! 👆',
            tap: { x: 0.5, y: 0.7 },
          },
          sfx: 'swipe',
          emphasis: ['thousand', 'flick'],
        },
        {
          say: 'FlatList mounts every row that scrolls in. Run the component, make shadow nodes, do layout, create views.',
          speak:
            'Flat List mounts every row that scrolls in. Run the component, make shadow nodes, do layout, create views.',
          scene: {
            type: 'timeline',
            title: 'Cost of one new row',
            active: 3,
            steps: [
              { label: 'Run component', icon: '⚛️' },
              { label: 'Shadow nodes', icon: '🌳' },
              { label: 'Layout', icon: '📐' },
              { label: 'Create views', icon: '🔨', tone: 'bad' },
            ],
          },
          sfx: 'error',
          emphasis: ['every', 'mounts'],
        },
        {
          say: 'FlashList recycles. A row that scrolls off the top isn’t destroyed.',
          speak: 'Flash List recycles. A row that scrolls off the top isn’t destroyed.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Chat',
              icon: '💬',
              items: [
                { id: 'c1', label: 'Message 1', sub: 'you starred this', icon: '💬', checked: true, tone: 'muted' },
                { id: 'c2', label: 'Message 2', icon: '💬', checked: false },
                { id: 'c3', label: 'Message 3', icon: '💬', checked: false },
                { id: 'c4', label: 'Message 4', icon: '💬', checked: false },
                { id: 'c5', label: 'Message 5', icon: '💬', checked: false },
              ],
            },
            caption: 'row 1 is leaving…',
          },
          emphasis: ['recycles', 'destroyed'],
        },
        {
          say: 'It slides to the bottom and re-renders with a new item prop. Reusing beats building.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Chat', icon: '💬', items: recycledRows(false) },
            caption: 'same instance, new data',
          },
          sfx: 'ding',
          emphasis: ['new', 'reusing'],
        },
        {
          say: 'The catch? useState inside the row survives the swap. Message six looks starred, and you never touched it.',
          speak:
            'The catch? use State inside the row survives the swap. Message six looks starred, and you never touched it.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Chat', icon: '💬', items: recycledRows(true) },
            caption: 'state leaked from message 1 😬',
          },
          sfx: 'error',
          emphasis: ['survives', 'starred'],
        },
        {
          say: 'The fix is useRecyclingState. It resets whenever your dependency, like the item id, changes.',
          speak: 'The fix is use Recycling State. It resets whenever your dependency, like the item id, changes.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Row.tsx',
            code: rowCode,
            added: [[2, 6]],
            note: { line: 5, text: 'new item → fresh state ✅', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['resets', 'id'],
        },
        {
          say: 'Version two is pure JavaScript, needs the New Architecture, and measures layout for real. So no more estimatedItemSize.',
          speak:
            'Version two is pure JavaScript, needs the New Architecture, and measures layout for real. So no more estimated Item Size.',
          scene: {
            type: 'list',
            title: 'FlashList v2',
            items: [
              { text: 'Pure JS, no native code', icon: '🟨' },
              { text: 'New Architecture only', icon: '🏗️' },
              { text: 'Measures layout for real', icon: '📏', sub: 'estimatedItemSize is gone' },
            ],
          },
          sfx: 'pop',
          emphasis: ['real', 'estimatedItemSize'],
        },
        {
          say: 'Remember this. Mounting is the expensive part. FlashList skips it, so keep your row state recycling-safe.',
          speak:
            'Remember this. Mounting is the expensive part. Flash List skips it, so keep your row state recycling-safe.',
          scene: {
            type: 'outro',
            points: ['Mounting rows is the cost', 'FlashList *reuses* row instances', 'Row state? useRecyclingState'],
            tagline: 'Reuse beats rebuild.',
          },
          sfx: 'success',
          emphasis: ['expensive', 'skips'],
        },
      ],
    },

    // 9 ─────────────────────────────────────────────
    {
      id: 'new-arch-today',
      title: 'The legacy bridge is gone',
      beats: [
        {
          say: 'Set newArchEnabled to false in React Native 0.82. Nothing happens.',
          speak: 'Set new Arch Enabled to false in React Native zero point eighty-two. Nothing happens.',
          scene: {
            type: 'title',
            kicker: 'New Architecture',
            title: 'The off switch does *nothing*',
            emoji: '🔌',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['nothing'],
        },
        {
          say: 'Here’s an Android gradle file on 0.82 or newer. That first flag gets ignored.',
          speak: 'Here’s an Android gradle file on zero point eighty-two or newer. That first flag gets ignored.',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'gradle.properties',
            code: gradleProps,
            errors: [2],
            note: { line: 2, text: 'ignored on 0.82+ 🙈', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['ignored'],
        },
        {
          say: 'But on 0.84 and up, this one does work. It opts you out of Hermes V1.',
          speak: 'But on zero point eighty-four and up, this one does work. It opts you out of Hermes V one.',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'gradle.properties',
            code: gradleProps,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'real opt-out (0.84+)', tone: 'good' },
          },
          sfx: 'click',
          emphasis: ['does', 'work'],
        },
        {
          say: 'The New Architecture was opt-in from 0.68, then became the default in 0.76.',
          speak: 'The New Architecture was opt-in from zero point sixty-eight, then became the default in zero point seventy-six.',
          scene: { type: 'timeline', title: 'How we got here', steps: archSteps, active: 1 },
          sfx: 'swipe',
          emphasis: ['opt-in', 'default'],
        },
        {
          say: 'In 0.82 the switch disappeared. In 0.84, legacy code isn’t even compiled into iOS builds.',
          speak: 'In zero point eighty-two the switch disappeared. In zero point eighty-four, legacy code isn’t even compiled into iOS builds.',
          scene: { type: 'timeline', title: 'How we got here', steps: archSteps, active: 3 },
          emphasis: ['disappeared', 'compiled'],
        },
        {
          say: 'So this is the one pipeline now. JSI for calls, Fabric for views, TurboModules for native code, Codegen for types.',
          speak:
            'So this is the one pipeline now. J S I for calls, Fabric for views, Turbo Modules for native code, Code gen for types.',
          scene: {
            type: 'list',
            title: 'The only pipeline',
            items: [
              { text: '*JSI*', icon: '🔌', sub: 'direct native calls' },
              { text: '*Fabric*', icon: '🧩', sub: 'renders your views' },
              { text: '*TurboModules*', icon: '⚙️', sub: 'your native code' },
              { text: '*Codegen*', icon: '🛡️', sub: 'types across the border' },
            ],
          },
          sfx: 'pop',
          emphasis: ['one', 'pipeline'],
        },
        {
          say: 'So a tutorial using NativeModules with callbacks is showing the legacy API. Look for TurboModule specs instead.',
          speak:
            'So a tutorial using Native Modules with callbacks is showing the legacy A P I. Look for Turbo Module specs instead.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'spot-the-old-api.ts',
            code: `// old tutorial (legacy)
NativeModules.Foo.bar(
  (result) => use(result),
);

// New Architecture
import NativeFoo from
  './specs/NativeFoo';
const result = NativeFoo.bar();`,
            errors: [[2, 4]],
            added: [[7, 9]],
            note: { line: 4, text: 'callbacks = legacy API 📼', tone: 'bad' },
          },
          sfx: 'swipe',
          emphasis: ['legacy', 'TurboModule'],
        },
        {
          say: 'Quick check. You’re on the New Architecture. Is your app faster automatically?',
          scene: fasterQuiz,
          sfx: 'riser',
          emphasis: ['automatically'],
        },
        {
          say: 'Not necessarily. The docs say it may not help right away. Sync layout and no serialization only pay off when you use them.',
          scene: {
            ...fasterQuiz,
            reveal: true,
            explain: 'The wins are tools. You have to use them.',
          },
          sfx: 'ding',
          emphasis: ['necessarily', 'use'],
        },
        {
          say: 'Remember this. There’s no old architecture to fall back on. The new pipeline is the only pipeline.',
          scene: {
            type: 'outro',
            points: ['0.82+: New Architecture only', 'JSI, Fabric, TurboModules, Codegen', 'Skip old-arch-only libraries'],
            tagline: 'One pipeline. No exits.',
          },
          sfx: 'success',
          emphasis: ['only'],
        },
      ],
    },
  ],
};
