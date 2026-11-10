import type { Series } from '../types';

// Case studies: only what each company has said publicly. Sources:
// - Razorpay: API docs "Payout Idempotency" (razorpay.com/docs/api/x/payout-idempotency/)
// - Zepto: blog.zepto.com "Build at Zepto Speed: How We Cut Frontend Webpack Build Times by 95%"
// - Swiggy: Swiggy Bytes, "A Deep Dive into Dynamic Widget — Swiggy's Server Driven UI System" (Mar 2024)
// - Zomato: eternal.com/blog/pulse, "Pulse: Building resilient MQTT infrastructure for Android at Zomato" (Jun 2026)
// - Flipkart: Aditya Punjani, "Building Flipkart Lite: A Progressive Web App" (Nov 2015) + web.dev/case-studies/flipkart
// - Hotstar: Gaurav Kamboj, "Scaling Hotstar for 25 million concurrent viewers" (Rootconf / re:Invent CMY302, 2019)

const payoutFlow = (mode: 'lost' | 'twice' | 'saved') => ({
  type: 'diagram' as const,
  title: mode === 'saved' ? 'Same key, same answer' : 'One payout request',
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'server', label: 'Your server', icon: '🖥️', x: 1, y: 0, active: mode === 'lost' },
    { id: 'rzp', label: 'Razorpay', icon: '💳', x: 1, y: 1.5, active: mode === 'saved' },
    { id: 'p1', label: 'Payout 1', sub: 'sent ✓', x: 0, y: 2.75, tone: 'good' as const },
    ...(mode === 'lost'
      ? [{ id: 'reply', label: 'Reply', sub: 'lost on the way', x: 2, y: 2.75, tone: 'bad' as const, dim: true }]
      : mode === 'twice'
        ? [{ id: 'p2', label: 'Payout 2', sub: 'paid twice', x: 2, y: 2.75, tone: 'bad' as const, active: true }]
        : [{ id: 'saved', label: 'Saved reply', sub: 'from try 1', x: 2, y: 2.75, tone: 'good' as const }]),
  ],
  edges: [
    { from: 'server', to: 'rzp', active: true },
    { from: 'rzp', to: 'p1', label: 'try 1' },
    ...(mode === 'lost' ? [{ from: 'rzp', to: 'reply', dashed: true, tone: 'bad' as const }] : []),
    ...(mode === 'twice' ? [{ from: 'rzp', to: 'p2', label: 'try 2', tone: 'bad' as const }] : []),
    ...(mode === 'saved' ? [{ from: 'rzp', to: 'saved', label: 'try 2', tone: 'good' as const }] : []),
  ],
  packets: [
    {
      from: 'server',
      to: 'rzp',
      label: mode === 'lost' ? 'pay' : mode === 'twice' ? 'retry' : 'key',
      tone: mode === 'twice' ? ('bad' as const) : ('accent' as const),
    },
  ],
  caption:
    mode === 'lost' ? 'the reply never made it back' : mode === 'twice' ? 'a blind retry pays again' : 'the retry gets the first answer',
});

const payoutCurl = `curl -X POST \\
  api.razorpay.com/v1/payouts \\
  -H "X-Payout-Idempotency: \\
      7f3c2a91-…" \\
  -d '{ "amount": 500000, … }'`;

const retryQuiz = {
  question: 'Retry timed out. The first try is still processing. Which key?',
  options: ['A fresh new key', 'The same key', 'No key at all'],
  answer: 1,
};

const minifier = `// webpack.config.js
optimization: {
  minimizer: [
    // new TerserPlugin(),
    new EsbuildPlugin({
      target: 'es2015',
      minify: true,
    }),
  ],
},`;

const swFlow = (step: 'meet' | 'cache') => ({
  type: 'diagram' as const,
  title: step === 'meet' ? 'Who answers the page?' : 'Cache first',
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'page', label: 'Page', icon: '📱', x: 1, y: 0 },
    {
      id: 'sw',
      label: 'Service worker',
      sub: 'answers requests',
      icon: '⚙️',
      x: 1,
      y: 1.5,
      active: step === 'meet',
    },
    { id: 'cache', label: 'Cache', icon: '🗄️', sub: 'HTML shells', x: 0, y: 3, active: step === 'cache', tone: 'good' as const },
    { id: 'net', label: 'Network', icon: '📶', sub: 'slow 2G', x: 2, y: 3, tone: 'warn' as const },
  ],
  edges: [
    { from: 'page', to: 'sw', active: true },
    { from: 'sw', to: 'cache', active: step === 'cache' },
    { from: 'sw', to: 'net', dashed: true },
  ],
  packets: step === 'cache' ? [{ from: 'cache', to: 'sw', label: 'shell', tone: 'good' as const }] : [],
  caption: step === 'meet' ? 'a script between page and network' : 'the frame draws before data arrives',
});

const swCode = `// sw.js (a sketch)
addEventListener('fetch', (e) => {
  if (!isShell(e.request)) return;
  e.respondWith(
    caches.match(e.request),
  );
  e.waitUntil(
    refreshShell(e.request),
  );
});`;

const liteCaches = (active: number) => ({
  type: 'list' as const,
  title: 'What else they cached',
  items: [
    { text: 'Recent *searches*', icon: '🔍', sub: 'kept in an LRU cache' },
    { text: 'Last few *products*', icon: '🛍️', sub: 'browse with no signal' },
    { text: 'A *kill switch*', icon: '🧯', sub: 'purges every cache', tone: 'warn' as const },
  ],
  active,
});

const hotstarHome = {
  type: 'phone' as const,
  os: 'android' as const,
  screen: {
    kind: 'app' as const,
    title: 'Home',
    icon: '🏏',
    items: [
      { id: 'mast', label: 'Masthead banner', icon: '🖼️' },
      { id: 'cw', label: 'Continue watching', icon: '⏯️' },
      { id: 'recs', label: 'Picked for you', icon: '✨' },
    ],
    loading: true,
  },
  caption: 'millions load this at the same time',
  tap: { x: 0.12, y: 0.08 },
};

const hotstarServices = {
  type: 'diagram' as const,
  title: 'Panic mode',
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'video', label: 'Video', icon: '📺', x: 0, y: 0, tone: 'good' as const },
    { id: 'ads', label: 'Ads', icon: '📣', x: 1, y: 0, tone: 'good' as const },
    { id: 'pay', label: 'Payments', icon: '💳', x: 2, y: 0, tone: 'good' as const },
    { id: 'switch', label: 'Panic switch', icon: '🚨', x: 1, y: 1.5, shape: 'pill' as const, tone: 'warn' as const, active: true },
    { id: 'recs', label: 'Recs', sub: 'off for now', icon: '✨', x: 0, y: 3, dim: true },
    { id: 'pers', label: 'Personal', sub: 'off for now', icon: '👤', x: 2, y: 3, dim: true },
  ],
  edges: [
    { from: 'switch', to: 'recs', dashed: true, tone: 'bad' as const },
    { from: 'switch', to: 'pers', dashed: true, tone: 'bad' as const },
  ],
  caption: 'video, ads and payments stay up',
};

const shedQuiz = {
  question: 'Match spike. Recommendations are timing out. Your move?',
  options: ['Retry them harder', 'Switch them off', 'Show an error page'],
  answer: 1,
};

const dwJson = `{
  "type": "stack",
  "axis": "horizontal",
  "children": [
    { "type": "image",
      "url": "{{bannerUrl}}" },
    { "type": "text",
      "value": "{{offerText}}" }
  ]
}`;

const dwFlow = {
  type: 'diagram' as const,
  title: 'One schema, two apps',
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'srv', label: 'Server', icon: '🗄️', sub: 'JSON template', x: 1, y: 0 },
    { id: 'kmm', label: 'Shared models', icon: '🧩', sub: 'KMM, shared by both', x: 1, y: 1.5, active: true },
    { id: 'ios', label: 'iOS', icon: '🍎', sub: 'SwiftUI views', x: 0, y: 3 },
    { id: 'android', label: 'Android', icon: '🤖', sub: 'same models', x: 2, y: 3 },
  ],
  edges: [
    { from: 'srv', to: 'kmm', active: true },
    { from: 'kmm', to: 'ios' },
    { from: 'kmm', to: 'android' },
  ],
  packets: [{ from: 'srv', to: 'kmm', label: 'JSON', tone: 'accent' as const }],
  caption: 'each block maps to a native view',
};

const pollCode = `// the old way: ask, again and again
setInterval(async () => {
  const res = await fetch(
    \`/orders/\${id}/location\`,
  );
  moveRider(await res.json());
}, POLL_MS);`;

const mqttFlow = {
  type: 'diagram' as const,
  title: 'Push, not pull',
  cols: 1,
  rows: 4,
  nodes: [
    { id: 'srv', label: 'Order updates', icon: '📍', x: 0, y: 0 },
    { id: 'broker', label: 'MQTT broker', icon: '📡', sub: 'publish / subscribe', x: 0, y: 1.5, active: true },
    { id: 'app', label: 'Tracking screen', icon: '📱', sub: 'one open connection', x: 0, y: 3, tone: 'good' as const },
  ],
  edges: [
    { from: 'srv', to: 'broker', label: 'publish' },
    { from: 'broker', to: 'app', label: 'push', active: true },
  ],
  packets: [{ from: 'broker', to: 'app', tone: 'good' as const }],
  caption: 'the server pushes each update',
};

export const series: Series = {
  id: 'eng-cases-india',
  title: 'Case studies: India',
  emoji: '🏙️',
  color: '#fc8019',
  order: 8,
  blurb: 'How Indian tech companies solved real engineering problems, from their own write-ups.',
  reels: [
    {
      id: 'in-razorpay-idempotency',
      title: 'Razorpay: retry without paying twice',
      beats: [
        {
          say: 'Your payout request timed out. Do you retry, and risk paying twice?',
          scene: { type: 'title', kicker: 'Razorpay · payments', title: 'One retry, *two* payouts?', emoji: '💸', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['retry', 'twice'],
        },
        {
          say: 'Your server asks Razorpay to pay a vendor. Then the request times out, with no reply.',
          scene: {
            type: 'terminal',
            title: 'Your server',
            lines: [
              { cmd: 'curl -X POST api.razorpay.com/v1/payouts' },
              { out: 'curl: (28) Operation timed out', tone: 'bad' },
              { out: '' },
              { out: '# was the vendor paid? 🤷', tone: 'warn' },
            ],
          },
          sfx: 'error',
          emphasis: ['times', 'out'],
        },
        {
          say: "Here's the catch. The payout may have gone through. Only the reply got lost.",
          scene: payoutFlow('lost'),
          sfx: 'swipe',
          emphasis: ['gone', 'lost'],
        },
        {
          say: 'So if you blindly send it again, Razorpay sees a brand new payout, and the vendor gets paid twice.',
          scene: payoutFlow('twice'),
          sfx: 'error',
          emphasis: ['new', 'twice'],
        },
        {
          say: "Razorpay's API docs describe the fix. Make up a unique key, and send it in a header.",
          speak: "Razorpay's A P I docs describe the fix. Make up a unique key, and send it in a header.",
          scene: {
            type: 'code',
            lang: 'bash',
            file: 'payout.sh',
            code: payoutCurl,
            highlight: [[3, 4]],
            note: { line: 4, text: 'a random UUID, made by you', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['unique', 'key'],
        },
        {
          say: "It's called an idempotency key. Razorpay saves the reply to the first request, and a repeat gets that saved reply.",
          scene: payoutFlow('saved'),
          sfx: 'ding',
          emphasis: ['idempotency', 'saved'],
        },
        {
          say: 'The docs also warn you. A fresh key while the first try is still processing counts as a second payout.',
          scene: {
            type: 'compare',
            title: 'How you retry',
            left: { title: 'Fresh key', verdict: 'bad', items: ['Looks like a new payout', 'Both get paid'] },
            right: { title: 'Same key', verdict: 'ok', items: ['Maps to one payout', 'Safe to retry'] },
          },
          sfx: 'swipe',
          emphasis: ['fresh', 'second'],
        },
        {
          say: 'Quick check. Your retry timed out again, and the first try is still processing. Which key?',
          scene: { type: 'quiz', ...retryQuiz },
          sfx: 'riser',
          emphasis: ['processing'],
        },
        {
          say: 'The same key. You only make a new key once the payout comes back failed.',
          scene: {
            type: 'quiz',
            ...retryQuiz,
            reveal: true,
            explain: 'Keep the key until the payout is processed or failed.',
          },
          sfx: 'success',
          emphasis: ['same', 'failed'],
        },
        {
          say: "Remember this. A timeout doesn't mean it failed. Give each action one key, and retries become safe.",
          scene: {
            type: 'outro',
            points: ["A timeout isn't a *failure*", 'One action, *one key*', 'New key only after *failed*'],
            tagline: 'Same key, same answer.',
          },
          sfx: 'success',
          emphasis: ['timeout', 'safe'],
        },
      ],
    },
    {
      id: 'in-zepto-profile-first',
      title: 'Zepto: profile before you migrate',
      beats: [
        {
          say: 'Zepto blamed Webpack for slow builds. Webpack was not the problem.',
          scene: { type: 'title', kicker: 'Zepto · build speed', title: "Webpack *wasn't* the slow part", emoji: '🐢', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['Webpack', 'not'],
        },
        {
          say: "Zepto's engineering blog describes it. Frontend builds on their micro frontend platform took over twenty minutes.",
          scene: {
            type: 'stat',
            value: '20+',
            unit: 'min',
            label: 'per *frontend build*',
            sub: 'across their micro-frontend platform',
            tone: 'warn',
          },
          sfx: 'swipe',
          emphasis: ['twenty', 'minutes'],
        },
        {
          say: 'Moving to Vite looked like the obvious fix. Instead, they measured first, timing every Webpack plugin.',
          speak: 'Moving to Veet looked like the obvious fix. Instead, they measured first, timing every Webpack plugin.',
          scene: {
            type: 'terminal',
            title: 'Plugin timings',
            lines: [
              { cmd: 'npm run build' },
              { out: 'copy-webpack-plugin      30ms' },
              { out: 'CompressionPlugin        70ms' },
              { out: 'LicenseWebpackPlugin    1.15s' },
              { out: 'TerserPlugin          825.31s', tone: 'bad' },
            ],
          },
          sfx: 'type',
          emphasis: ['measured', 'plugin'],
        },
        {
          say: 'One plugin, Terser, ate over thirteen minutes. Its job is minifying, which shrinks your JavaScript for production.',
          scene: {
            type: 'stat',
            value: '13+',
            unit: 'min',
            label: 'inside *one plugin*: Terser',
            sub: 'just minifying the JavaScript',
            tone: 'bad',
          },
          sfx: 'ding',
          emphasis: ['thirteen', 'minifying'],
        },
        {
          say: 'So Vite would not have saved them. The blog says that minify time would have followed them to any bundler.',
          speak: 'So Veet would not have saved them. The blog says that minify time would have followed them to any bundler.',
          scene: {
            type: 'compare',
            title: 'Two ways out',
            left: { title: 'Move to Vite', verdict: 'bad', items: ['Weeks of migration', 'Still minifies slowly'] },
            right: { title: 'Fix one step', verdict: 'ok', items: ['Keep Webpack', 'Swap the minifier'] },
          },
          sfx: 'swipe',
          emphasis: ['followed', 'bundler'],
        },
        {
          say: 'So they kept Webpack and swapped just that one step. Esbuild now minifies the JavaScript instead of Terser.',
          speak: 'So they kept Webpack and swapped just that one step. E S build now minifies the JavaScript instead of Terser.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'webpack.config.js',
            code: minifier,
            errors: [4],
            added: [[5, 8]],
            note: { line: 8, text: 'replaces Terser', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['Esbuild', 'one'],
        },
        {
          say: 'Then they trimmed the rest. swc replaced Babel, Lightning CSS took over the styles, and pnpm installs got cached.',
          speak: 'Then they trimmed the rest. S W C replaced Babel, Lightning C S S took over the styles, and P N P M installs got cached.',
          scene: {
            type: 'list',
            title: 'Smaller wins',
            items: [
              { text: '*swc* instead of Babel', icon: '⚡', sub: 'compiles TypeScript faster' },
              { text: 'Lightning CSS', icon: '🎨', sub: 'minifies the styles' },
              { text: 'pnpm + cache mount', icon: '📦', sub: 'installs reuse a cache' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['trimmed', 'Babel'],
        },
        {
          say: 'The result: builds dropped from over twenty minutes to about two, with no risky migration.',
          scene: {
            type: 'stat',
            value: '2',
            unit: 'min',
            label: 'per build, *down from 20+*',
            sub: 'same Webpack, no migration',
            tone: 'good',
          },
          sfx: 'success',
          emphasis: ['two', 'migration'],
        },
        {
          say: 'Remember this. Before you blame the tool, profile it. The slow part is often one step you can swap.',
          scene: {
            type: 'outro',
            points: ['Profile *before* you migrate', 'One plugin ate *13 minutes*', 'Swap the hot spot, keep the rest'],
            tagline: 'Measure, then move.',
          },
          sfx: 'success',
          emphasis: ['profile', 'swap'],
        },
      ],
    },
    {
      id: 'in-swiggy-dynamic-widget',
      title: 'Swiggy: UI that ships from the server',
      beats: [
        {
          say: 'Swiggy can change parts of its app screens without an app update.',
          scene: { type: 'title', kicker: 'Swiggy · server-driven UI', title: 'New UI, *no* app update', emoji: '🧩', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['without', 'update'],
        },
        {
          say: "Normally, every UI change means a release. Swiggy's engineering blog notes store reviews can take several days.",
          scene: {
            type: 'timeline',
            title: 'A normal UI change',
            steps: [
              { label: 'Write the code', icon: '⌨️' },
              { label: 'Store review', sub: 'often several days', icon: '⏳', tone: 'warn' },
              { label: 'Users update', sub: 'if they ever do', icon: '📲' },
              { label: 'Finally live', icon: '✅' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['release', 'days'],
        },
        {
          say: 'Their answer is Dynamic Widget, a small UI language in JSON. Simplified, a widget looks like this.',
          speak: 'Their answer is Dynamic Widget, a small UI language in Jason. Simplified, a widget looks like this.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'sketch.json',
            code: dwJson,
            highlight: [[5, 8]],
            note: { line: 8, text: 'generic blocks only', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['Dynamic', 'Widget'],
        },
        {
          say: "There's no Restaurant or Rating component. Just generic blocks like text, image and video, inside Stack and Box layouts.",
          scene: {
            type: 'tree',
            title: 'Blocks, not features',
            caption: 'the server composes the screen',
            root: {
              id: 'stack',
              label: 'Stack',
              active: true,
              children: [
                { id: 'box', label: 'Box', children: [{ id: 'img', label: 'Image' }, { id: 'txt', label: 'Text' }] },
                { id: 'row', label: 'Stack', children: [{ id: 'txt2', label: 'Text' }, { id: 'vid', label: 'Video' }] },
              ],
            },
          },
          sfx: 'pop',
          emphasis: ['generic', 'blocks'],
        },
        {
          say: 'The schema is written in Kotlin Multiplatform, so iOS and Android share one set of models. SwiftUI then draws each block.',
          scene: dwFlow,
          sfx: 'swipe',
          emphasis: ['Multiplatform', 'share'],
        },
        {
          say: 'The template fixes the look. Any field can be marked dynamic, so text or images change per user, which suits experiments.',
          scene: {
            type: 'compare',
            title: 'Two parts',
            left: { title: 'Template', verdict: 'neutral', icon: '📐', items: ['Layout and style', 'Rarely changes'] },
            right: { title: 'Dynamic fields', verdict: 'neutral', icon: '🔁', items: ['Text, image URLs', 'Swap per experiment'] },
          },
          sfx: 'swipe',
          emphasis: ['dynamic', 'experiments'],
        },
        {
          say: 'Taps go back through a bridge, so the renderer stays dumb and the app decides what happens next.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Track order',
              icon: '🛵',
              items: [
                { id: 'status', label: 'Order on the way', icon: '📦' },
                { id: 'dw', label: 'Offer banner', sub: 'drawn from server JSON', icon: '🧩', tone: 'accent' },
                { id: 'partner', label: 'Delivery partner', icon: '🧑' },
                { id: 'help', label: 'Need help?', icon: '💬' },
              ],
              toast: 'Tap sent to the app',
            },
            tap: { x: 0.5, y: 0.3 },
            caption: 'a Dynamic Widget on Track',
          },
          sfx: 'click',
          emphasis: ['bridge', 'decides'],
        },
        {
          say: "And honestly, it's still careful. The 2024 post says it runs behind an experiment, on a few widgets in Track and Search.",
          scene: {
            type: 'list',
            title: 'Where it runs (2024)',
            items: [
              { text: '*Track* page widgets', icon: '🛵' },
              { text: '*Search* page widgets', icon: '🔍' },
              { text: 'Behind an experiment', icon: '🧪', tone: 'warn' },
            ],
            active: 2,
          },
          sfx: 'pop',
          emphasis: ['experiment', 'few'],
        },
        {
          say: 'Remember this. Send generic blocks from the server, not finished screens. Then UI changes ship without a release.',
          scene: {
            type: 'outro',
            points: ['Server sends *blocks*, not screens', 'Template fixed, *fields* dynamic', 'Ship UI without a *release*'],
            tagline: 'The app just renders.',
          },
          sfx: 'success',
          emphasis: ['blocks', 'release'],
        },
      ],
    },
    {
      id: 'in-zomato-pulse-mqtt',
      title: 'Zomato: from polling to push',
      beats: [
        {
          say: 'Zomato found that polling for updates cost more than the updates.',
          scene: { type: 'title', kicker: 'Zomato · real-time', title: 'Polling cost *more* than data', emoji: '🛵', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['polling', 'more'],
        },
        {
          say: "Zomato's post on Pulse sets the scene. Live tracking needs a steady stream of tiny location updates and order events.",
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Order on the way',
              icon: '🛵',
              items: [
                { id: 'rider', label: 'Rider location', sub: 'updates all the time', icon: '📍', tone: 'accent' },
                { id: 'eta', label: 'Arriving soon', sub: 'ETA keeps changing', icon: '⏱️' },
                { id: 'status', label: 'Order picked up', icon: '📦', tone: 'good' },
              ],
            },
            caption: 'small updates, all the time',
          },
          sfx: 'swipe',
          emphasis: ['tiny', 'updates'],
        },
        {
          say: 'They began with HTTP polling. But every tiny request paid for setup, a TLS handshake and headers.',
          speak: 'They began with H T T P polling. But every tiny request paid for setup, a T L S handshake and headers.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'tracking.ts',
            code: pollCode,
            highlight: [[3, 5]],
            note: { line: 5, text: 'new handshake + headers', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['polling', 'handshake'],
        },
        {
          say: 'The post says the overhead often outweighed the payload. And rider markers jumped instead of moving.',
          scene: {
            type: 'compare',
            title: 'Poll vs push',
            left: { title: 'Polling', verdict: 'bad', items: ['Overhead beats payload', 'Markers jump'] },
            right: { title: 'MQTT', verdict: 'ok', items: ['One open connection', 'Updates pushed'] },
          },
          sfx: 'error',
          emphasis: ['overhead', 'jumped'],
        },
        {
          say: 'So they moved to MQTT, a publish and subscribe protocol. One connection stays open, and updates are pushed instantly.',
          speak: 'So they moved to M Q T T, a publish and subscribe protocol. One connection stays open, and updates are pushed instantly.',
          scene: mqttFlow,
          sfx: 'ding',
          emphasis: ['open', 'pushed'],
        },
        {
          say: 'Then came the real lesson, in their words: MQTT solved networking, not reliability. Phones drop signal and kill background work.',
          speak: 'Then came the real lesson, in their words: M Q T T solved networking, not reliability. Phones drop signal and kill background work.',
          scene: {
            type: 'title',
            kicker: 'The real lesson',
            title: 'Networking fixed. *Reliability* not.',
            sub: 'signal drops, network switches, battery savers',
            emoji: '📉',
            style: 'slam',
          },
          sfx: 'error',
          emphasis: ['networking', 'reliability'],
        },
        {
          say: 'So they built Pulse on Eclipse Paho. Connect, subscribe and publish run through a command queue, always in order.',
          speak: 'So they built Pulse on Eclipse Paho. Connect, subscribe and publish run through a command queue, always in order.',
          scene: {
            type: 'timeline',
            title: 'The command queue',
            steps: [
              { label: 'CONNECT', icon: '🔌' },
              { label: 'SUBSCRIBE', sub: 'waits for connect', icon: '📥' },
              { label: 'PUBLISH', icon: '📤' },
              { label: 'Reconnect', sub: 'restores subscriptions', icon: '🔁', tone: 'good' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['queue', 'order'],
        },
        {
          say: 'On a drop, it reconnects and restores subscriptions, retries with backoff, and runs health checks with WorkManager.',
          scene: {
            type: 'list',
            title: 'What Pulse adds',
            items: [
              { text: '*Auto-reconnect*', icon: '🔁', sub: 'restores subscriptions' },
              { text: 'Retry policies', icon: '⏳', sub: 'exponential or sequential' },
              { text: 'Health checks', icon: '🩺', sub: 'WorkManager or AlarmManager' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['reconnects', 'backoff'],
        },
        {
          say: 'Remember this. Push beats polling for live data. But the hard part is keeping that connection alive on real phones.',
          scene: {
            type: 'outro',
            points: ['Polling pays *overhead* each time', 'Push over *one* open connection', 'Reliability is the *real* work'],
            tagline: 'Connect once, recover always.',
          },
          sfx: 'success',
          emphasis: ['push', 'alive'],
        },
      ],
    },
    {
      id: 'in-flipkart-lite-shell',
      title: 'Flipkart Lite: the app shell',
      beats: [
        {
          say: "Flipkart's mobile site worked on 2G, and even offline. Here's how.",
          speak: "Flipkart's mobile site worked on 2 G, and even offline. Here's how.",
          scene: { type: 'title', kicker: 'Flipkart · PWA', title: 'A website that works *offline*', emoji: '📶', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['2G', 'offline'],
        },
        {
          say: "Google's case study on Flipkart Lite says 63 percent of its users arrived on a 2G network.",
          speak: "Google's case study on Flipkart Lite says sixty-three percent of its users arrived on a 2 G network.",
          scene: {
            type: 'stat',
            value: '63',
            unit: '%',
            label: 'of users came in on *2G*',
            sub: 'Flipkart Lite, Google case study',
            tone: 'warn',
          },
          sfx: 'swipe',
          emphasis: ['63', '2G'],
        },
        {
          say: "Aditya Punjani's write-up shares the trick: every page is a static HTML shell, filled with API data.",
          speak: "Aditya Punjani's write-up shares the trick: every page is a static H T M L shell, filled with A P I data.",
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Flipkart Lite',
              icon: '🛒',
              items: [
                { id: 'search', label: 'Search for products', icon: '🔍' },
                { id: 'cats', label: 'Categories', icon: '🗂️' },
              ],
              body: 'Products load from the API…',
              loading: true,
            },
            caption: 'the shell draws, the data streams in',
          },
          sfx: 'pop',
          emphasis: ['shell', 'data'],
        },
        {
          say: "A service worker makes that fast. It's a script the browser runs between your page and the network.",
          scene: swFlow('meet'),
          sfx: 'swipe',
          emphasis: ['service', 'worker'],
        },
        {
          say: 'The shells are always served from the cache first, so the frame draws at once, even on a slow network.',
          scene: swFlow('cache'),
          sfx: 'ding',
          emphasis: ['cache', 'first'],
        },
        {
          say: 'In code, it looks roughly like this: answer from the cache, then refresh it in the background.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'sw.js',
            code: swCode,
            highlight: [[4, 9]],
            note: { line: 9, text: 'answer now, refresh later', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['cache', 'background'],
        },
        {
          say: 'They also cached recent search results and the last few product pages, so browsing kept working offline.',
          scene: liteCaches(0),
          sfx: 'pop',
          emphasis: ['searches', 'offline'],
        },
        {
          say: 'Their big lesson was a kill switch: a reliable way to purge every cache if a bad version gets stuck.',
          scene: liteCaches(2),
          sfx: 'click',
          emphasis: ['kill', 'switch'],
        },
        {
          say: "The payoff, in Google's case study: people spent three times more time on the site.",
          scene: {
            type: 'stat',
            value: '3',
            unit: 'x',
            label: 'more *time on site*',
            sub: 'Flipkart Lite vs the old mobile site',
            tone: 'good',
          },
          sfx: 'success',
          emphasis: ['three', 'times'],
        },
        {
          say: 'Remember this. Cache the shell, fetch the data. On a bad network, showing something right away wins.',
          scene: {
            type: 'outro',
            points: ['Shell from *cache*, data from API', 'Cache recent pages for *offline*', 'Always ship a *kill switch*'],
            tagline: 'Shell first, data second.',
          },
          sfx: 'success',
          emphasis: ['shell', 'data'],
        },
      ],
    },
    {
      id: 'in-hotstar-panic-mode',
      title: 'Hotstar: switch features off to stay up',
      beats: [
        {
          say: 'When millions join at once, Hotstar switches features off. On purpose.',
          scene: { type: 'title', kicker: 'Disney+ Hotstar · scale', title: 'Turn features *off* to stay up', emoji: '🏏', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['off', 'purpose'],
        },
        {
          say: "In a 2019 talk, Hotstar's Gaurav Kamboj described 25.3 million people watching one cricket match at once.",
          speak: "In a 2019 talk, Hotstar's Gaurav Kamboj described twenty five point three million people watching one cricket match at once.",
          scene: {
            type: 'stat',
            value: '25.3',
            unit: 'M',
            label: 'people watching *at once*',
            sub: 'India vs New Zealand, 2019',
            tone: 'accent',
          },
          sfx: 'swipe',
          emphasis: ['million', 'once'],
        },
        {
          say: 'The talk says the scary part is the drop. When Dhoni got out, millions pressed back and loaded the home page together.',
          scene: hotstarHome,
          sfx: 'error',
          emphasis: ['drop', 'together'],
        },
        {
          say: 'Normal autoscaling is too slow for that. New servers take minutes, but over a million users can arrive per minute.',
          scene: {
            type: 'timeline',
            title: 'Too slow to scale',
            steps: [
              { label: 'Crowd arrives', sub: 'in seconds', icon: '🌊' },
              { label: 'Scaler notices', icon: '📈' },
              { label: 'Servers boot', sub: 'takes minutes', icon: '⏳' },
              { label: 'Too late', icon: '💥', tone: 'bad' },
            ],
            active: 2,
          },
          sfx: 'swipe',
          emphasis: ['minutes', 'million'],
        },
        {
          say: 'Besides warming up servers before matches, they built panic mode. It turns off extras, like recommendations, to protect critical services.',
          scene: hotstarServices,
          sfx: 'ding',
          emphasis: ['panic', 'extras'],
        },
        {
          say: 'The apps play along. If login or payment is struggling, the talk says users can skip it and just watch.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Live: IND vs NZ',
              icon: '🏏',
              items: [
                { id: 'video', label: 'Live video', icon: '📺', tone: 'good' },
                { id: 'ads', label: 'Ad break', icon: '📣', tone: 'good' },
                { id: 'recs', label: 'Picked for you', icon: '✨', sub: 'hidden for now', tone: 'muted' },
              ],
              toast: 'Sign in later. Watch now.',
            },
            caption: 'the core keeps working',
          },
          sfx: 'pop',
          emphasis: ['skip', 'watch'],
        },
        {
          say: 'Quick check. A match spike hits, and recommendations start timing out. What do you do?',
          scene: { type: 'quiz', ...shedQuiz },
          sfx: 'riser',
          emphasis: ['timing', 'out'],
        },
        {
          say: 'Switch them off. Video, ads and payments keep their room, and nobody misses a ball.',
          scene: {
            type: 'quiz',
            ...shedQuiz,
            reveal: true,
            explain: 'Shed the extras so video, ads and payments stay up.',
          },
          sfx: 'success',
          emphasis: ['off', 'ball'],
        },
        {
          say: "Remember this. Under extreme load, decide ahead of time what can break. Degrade gracefully, and the core keeps working.",
          scene: {
            type: 'outro',
            points: ['Rank features: *core* vs extras', 'Switch extras *off* under load', 'Clients handle the *fallback*'],
            tagline: "Bend, don't break.",
          },
          sfx: 'success',
          emphasis: ['decide', 'gracefully'],
        },
      ],
    },
  ],
};
