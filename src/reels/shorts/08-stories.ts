import type { Series } from '../types';

// Short-form format sampler: one 2–4 beat reel (~10–25s) per format, each with
// its own voice. An intentional exception to the 45–70s explainer format in
// AUTHORING.md §7 (beat count, outro ending, scene variety).

const incidentSteps = (done: boolean) => [
  { label: 'Crash alert', sub: '3:02 AM', icon: '🚨', tone: 'bad' as const },
  { label: 'Rollout halted', sub: '3:10 AM', icon: '✋' },
  { label: 'Keep rule added', sub: '3:30 AM', icon: '🔧' },
  { label: 'Hotfix submitted', sub: '3:55 AM', icon: '🚀', tone: done ? ('good' as const) : undefined },
];

const historySteps = [
  { label: 'Launch', sub: '2015 · async bridge', icon: '🚀' },
  { label: 'Rewrite announced', sub: '2018 · JSI + Fabric', icon: '📣' },
  { label: 'New Arch opt-in', sub: '2022 · RN 0.68', icon: '🧪' },
  { label: 'New Arch default', sub: '2024 · RN 0.76', icon: '⭐' },
  { label: 'New Arch only', sub: '2025 · RN 0.82', icon: '🏁', tone: 'accent' as const },
];

const shipChecklist = [
  { text: 'Test a *release* build', icon: '📦', sub: 'dev mode hides real bugs' },
  { text: 'Try a cheap Android', icon: '🐢', sub: 'not just your flagship' },
  { text: 'Upload *sourcemaps*', icon: '🗺️', sub: 'readable crash reports' },
  { text: 'Stage the *rollout*', icon: '🚦', sub: 'catch crashes at 5% first' },
];

// ELI5 restaurant: chef = JS thread, waiter = UI thread, table = the screen.
const kitchen = (step: 0 | 1 | 2) => ({
  type: 'diagram' as const,
  title: 'Your app is a restaurant',
  cols: 1,
  rows: 4,
  nodes: [
    {
      id: 'chef',
      label: 'JS thread',
      sub: step === 2 ? 'the chef, swamped' : 'the chef',
      icon: '👨‍🍳',
      x: 0,
      y: 0,
      active: step !== 1,
      tone: step === 2 ? ('bad' as const) : undefined,
    },
    { id: 'waiter', label: 'UI thread', sub: 'the waiter', icon: '🛎️', x: 0, y: 1.5, active: step === 1 },
    { id: 'table', label: 'Screen', sub: 'your user', icon: '📱', x: 0, y: 3, dim: step === 0 },
  ],
  edges: [
    { from: 'chef', to: 'waiter', dashed: step === 2, tone: step === 2 ? ('bad' as const) : undefined },
    { from: 'waiter', to: 'table', both: step === 1 },
  ],
  packets:
    step === 0
      ? [{ from: 'chef', to: 'waiter', label: 'plan', tone: 'accent' as const }]
      : step === 1
        ? [{ from: 'waiter', to: 'table', label: 'pixels', tone: 'info' as const }]
        : [],
  caption: ['the chef decides what to serve', 'the waiter serves and takes taps', 'no plan, so taps feel dead'][step],
});

export const series: Series = {
  id: 'stories',
  title: 'Stories & takes',
  emoji: '🎬',
  color: '#e879f9',
  order: 8,
  blurb: 'Seven short formats: war stories, hot takes, stats, analogies and more.',
  reels: [
    {
      id: 'war-story-3am-crash',
      title: 'War story: the 3am crash',
      voice: 'bm_fable',
      speed: 0.95,
      beats: [
        {
          say: 'Three in the morning. The new release crashes on launch, every time.',
          emphasis: ['crashes'],
          sfx: 'error',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'crash', app: 'Shopr', message: 'FATAL EXCEPTION: main' },
            caption: 'every update, every launch',
          },
        },
        {
          say: 'Logcat says a class is missing, but only in release builds.',
          speak: 'Log cat says a class is missing, but only in release builds.',
          emphasis: ['missing', 'release'],
          sfx: 'type',
          scene: {
            type: 'terminal',
            title: 'adb logcat',
            lines: [
              { cmd: 'adb logcat *:E' },
              { out: 'FATAL EXCEPTION: main', tone: 'bad' },
              { out: 'ClassNotFoundException:', tone: 'bad' },
              { out: '  com.shopr.pay.PayBridge', tone: 'muted' },
            ],
          },
        },
        {
          say: 'R8 stripped a class we load by reflection. One keep rule fixes it.',
          emphasis: ['reflection', 'keep'],
          sfx: 'ding',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'proguard-rules.pro',
            code: `# loaded by reflection,
# so R8 thought it was unused
-keep class com.shopr.pay.** { *; }`,
            added: [3],
            note: { line: 3, text: 'R8 keeps it now', tone: 'good' },
          },
        },
        {
          say: 'We halted the rollout, shipped the fix, and went back to bed.',
          emphasis: ['halted', 'bed'],
          sfx: 'success',
          scene: { type: 'timeline', title: 'Tuesday, 3am', steps: incidentSteps(true), active: 3 },
        },
      ],
    },
    {
      id: 'hot-take-no-redux',
      title: "Hot take: you don't need Redux",
      voice: 'am_fenrir',
      speed: 1.1,
      beats: [
        {
          say: "Hot take. Your app probably doesn't need Redux.",
          emphasis: ['Redux'],
          scene: { type: 'title', kicker: 'Hot take', title: "You don't need *Redux*", emoji: '🌶️', style: 'slam' },
        },
        {
          say: 'Most of that store is just a copy of server data, going stale.',
          emphasis: ['server', 'stale'],
          scene: {
            type: 'compare',
            title: 'Where state lives',
            left: { title: 'Global store', verdict: 'bad', items: ['API data, copied', 'Manual loading', 'Goes stale'] },
            right: { title: 'Query + local', verdict: 'ok', items: ['Server data, cached', 'Auto refetch', 'UI state stays local'] },
          },
        },
        {
          say: 'Let a query cache own server data, and keep UI state local.',
          emphasis: ['cache', 'local'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Todos.tsx',
            code: `const { data } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
});
const [tab, setTab] = useState(0);`,
            highlight: [[1, 4]],
            focus: false,
            note: { line: 4, text: 'cached, refetched, shared', tone: 'good' },
          },
        },
        {
          say: 'Reach for a global store last, not first.',
          emphasis: ['last'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The rule', title: 'Store *last*, not first', emoji: '🧯', style: 'slam' },
        },
      ],
    },
    {
      id: 'by-the-numbers-frame-budget',
      title: 'By the numbers: 16.6ms',
      voice: 'af_bella',
      speed: 1.05,
      beats: [
        {
          say: 'You get 16.6 milliseconds to draw every single frame.',
          emphasis: ['16.6'],
          scene: { type: 'stat', value: '16.6', unit: 'ms', label: 'per frame at *60fps*', sub: 'on both the JS and UI threads', tone: 'warn' },
        },
        {
          say: "On a 120 hertz screen, it's only 8.3.",
          emphasis: ['8.3'],
          sfx: 'riser',
          scene: { type: 'stat', value: '8.3', unit: 'ms', label: 'per frame at *120Hz*', sub: 'miss it and the user sees a stutter', tone: 'bad' },
        },
        {
          say: 'So animate on the UI thread, virtualize long lists, and defer heavy work.',
          emphasis: ['animate', 'virtualize', 'defer'],
          sfx: 'ding',
          scene: {
            type: 'list',
            title: 'Protect the budget',
            items: [
              { text: 'Animate on the *UI thread*', icon: '🎞️', sub: 'Reanimated worklets' },
              { text: 'Virtualize lists', icon: '📜', sub: 'FlashList or FlatList' },
              { text: 'Defer heavy JS work', icon: '⏳', sub: 'after the animation ends' },
            ],
          },
        },
      ],
    },
    {
      id: 'eli5-js-vs-ui-thread',
      title: 'ELI5: two threads, one kitchen',
      voice: 'af_heart',
      speed: 1.0,
      beats: [
        {
          say: 'Think of your app as a restaurant. The JS thread is the chef.',
          speak: 'Think of your app as a restaurant. The J S thread is the chef.',
          emphasis: ['restaurant', 'chef'],
          scene: kitchen(0),
        },
        {
          say: 'The UI thread is the waiter. It serves the screen and takes every tap.',
          emphasis: ['waiter', 'tap'],
          sfx: 'pop',
          scene: kitchen(1),
        },
        {
          say: 'If the chef is swamped, the waiter has nothing to serve. Taps feel dead.',
          emphasis: ['swamped', 'dead'],
          sfx: 'error',
          scene: kitchen(2),
        },
        {
          say: 'So keep heavy work off the JS thread.',
          speak: 'So keep heavy work off the J S thread.',
          emphasis: ['off'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The lesson', title: 'Keep the *chef* free', emoji: '👨‍🍳', style: 'slam' },
        },
      ],
    },
    {
      id: 'history-rn-architecture',
      title: 'History: the RN rewrite in 15s',
      voice: 'bf_emma',
      speed: 1.05,
      beats: [
        {
          say: '2015. React Native ships, talking to native over an async bridge.',
          emphasis: ['bridge'],
          scene: { type: 'timeline', title: 'React Native, 2015 to now', steps: historySteps, active: 0 },
        },
        {
          say: '2018. Facebook announces a rewrite: JSI, Fabric and TurboModules.',
          speak: '2018. Facebook announces a rewrite: J S I, Fabric and Turbo Modules.',
          emphasis: ['rewrite'],
          scene: { type: 'timeline', title: 'React Native, 2015 to now', steps: historySteps, active: 1 },
        },
        {
          say: 'It turns opt-in in 2022, and becomes the default in 0.76.',
          emphasis: ['default'],
          scene: { type: 'timeline', title: 'React Native, 2015 to now', steps: historySteps, active: 3 },
        },
        {
          say: 'Since 0.82, the New Architecture is the only one.',
          emphasis: ['only'],
          sfx: 'success',
          scene: { type: 'timeline', title: 'React Native, 2015 to now', steps: historySteps, active: 4 },
        },
      ],
    },
    {
      id: 'checklist-before-you-ship',
      title: 'Checklist: before you ship',
      voice: 'am_michael',
      speed: 1.1,
      beats: [
        {
          say: 'Before you ship, test a release build. Dev mode hides real bugs.',
          emphasis: ['release'],
          scene: { type: 'list', title: 'Before you ship', numbered: true, items: shipChecklist, active: 0 },
        },
        {
          say: 'Run it on a cheap Android phone, not just your flagship.',
          emphasis: ['cheap'],
          scene: { type: 'list', title: 'Before you ship', numbered: true, items: shipChecklist, active: 1 },
        },
        {
          say: 'Upload source maps, or your crash reports are gibberish.',
          emphasis: ['source', 'maps'],
          scene: { type: 'list', title: 'Before you ship', numbered: true, items: shipChecklist, active: 2 },
        },
        {
          say: 'And start with a staged rollout, so a bad build only hits a few users.',
          emphasis: ['staged'],
          sfx: 'success',
          scene: { type: 'list', title: 'Before you ship', numbered: true, items: shipChecklist, active: 3 },
        },
      ],
    },
    {
      id: 'users-eye-permission-prompt',
      title: "User's eye: the cold permission ask",
      voice: 'af_nicole',
      speed: 1.0,
      beats: [
        {
          say: 'You open a new app. Before you see anything, it wants your camera.',
          emphasis: ['camera'],
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'permission', app: '“Receipts”', icon: '📷', text: 'would like to access the camera.' },
            caption: 'first second of first launch',
          },
        },
        {
          say: "So you tap Don't Allow. Now iOS won't let it ask again.",
          emphasis: ['again'],
          sfx: 'error',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: '“Receipts”',
              icon: '📷',
              text: 'would like to access the camera.',
              choice: 'deny',
            },
            caption: 'denied, and it can never re-ask',
          },
        },
        {
          say: 'Better: ask the moment you tap Scan, when it obviously makes sense.',
          emphasis: ['Scan'],
          sfx: 'click',
          scene: {
            type: 'phone',
            os: 'ios',
            tap: { x: 0.5, y: 0.86 },
            screen: {
              kind: 'app',
              title: 'Receipts',
              icon: '🧾',
              items: [
                { id: 'cafe', label: 'Corner Cafe', icon: '☕', sub: 'Mon · $4.50' },
                { id: 'fuel', label: 'Fuel stop', icon: '⛽', sub: 'Tue · $38.20' },
                { id: 'books', label: 'Book shop', icon: '📚', sub: 'Wed · $12.00' },
              ],
              button: '📷 Scan receipt',
            },
            caption: 'the user asks for the camera',
          },
        },
        {
          say: 'Same prompt, right moment, and now you say yes.',
          emphasis: ['yes'],
          sfx: 'success',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: '“Receipts”',
              icon: '📷',
              text: 'would like to access the camera. Scan your receipts.',
              choice: 'allow',
            },
            caption: 'asked in context',
          },
        },
      ],
    },
  ],
};
