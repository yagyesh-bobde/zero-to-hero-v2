import type { Series } from '../types';

const offsetFetch = `// page 2, offset style
fetch('/posts?offset=20&limit=20')

// SQL on the server
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;`;

const cursorFetch = `// page 2, cursor style
fetch('/posts?after=120&limit=20')

// SQL on the server
SELECT * FROM posts
WHERE id < 120
ORDER BY id DESC
LIMIT 20;`;

const sentinel = `const io = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      fetchNextPage();
    }
  },
  { rootMargin: '800px' },
);
io.observe(sentinelRef.current);`;

const naiveSearch = `input.oninput = async (e) => {
  const q = e.target.value;
  const res = await fetch(
    \`/search?q=\${q}\`,
  );
  setResults(await res.json());
};`;

const debounced = `let timer;
input.oninput = (e) => {
  clearTimeout(timer);
  timer = setTimeout(
    () => search(e.target.value),
    250,
  );
};`;

const abortable = `let ctrl;
async function search(q) {
  ctrl?.abort();
  ctrl = new AbortController();
  const res = await fetch(
    \`/search?q=\${q}\`,
    { signal: ctrl.signal },
  );
  setResults(await res.json());
}`;

const cached = `const cache = new Map();
async function search(q) {
  if (cache.has(q)) {
    return setResults(cache.get(q));
  }
  const data = await fetchResults(q);
  cache.set(q, data);
  setResults(data);
}`;

const comboA11y = `<input
  role="combobox"
  aria-expanded="true"
  aria-controls="results"
  aria-activedescendant="opt-2"
/>
<ul id="results" role="listbox">
  <li id="opt-1" role="option">
    pizza</li>
  <li id="opt-2" role="option"
    aria-selected="true">pita</li>
</ul>`;

const flagCode = `const on = flags.isOn(
  'new-checkout', user,
);
if (on) {
  return <NewCheckout />;
}
return <OldCheckout />;`;

const bucketCode = `function isOn(flag, user) {
  const n = hash(flag.key + user.id)
    % 100;
  return n < flag.rolloutPercent;
}`;

const killSwitch = (on: boolean) => `{
  "key": "new-checkout",
  "enabled": ${on},
  "rolloutPercent": ${on ? 25 : 0}
}`;

const feedRows = (shift: boolean) => [
  ...(shift ? [{ id: 'new', label: 'New post!', icon: '🆕', sub: 'just published', tone: 'good' as const }] : []),
  { id: 'p20', label: 'Post 20', icon: '📝', sub: 'end of page 1' },
  { id: 'p21', label: 'Post 21', icon: '📝', sub: shift ? 'shown again 😬' : 'start of page 2', tone: shift ? ('bad' as const) : undefined },
  { id: 'p22', label: 'Post 22', icon: '📝' },
  { id: 'p23', label: 'Post 23', icon: '📝' },
];

const feedDiagram = (step: 'win' | 'recycle') => ({
  type: 'diagram' as const,
  title: 'Only the window is real',
  cols: 1,
  rows: 4,
  nodes: [
    { id: 'above', label: 'Rows above', sub: 'just empty space', x: 0, y: 0, dim: true },
    {
      id: 'window',
      label: 'Visible rows',
      sub: step === 'win' ? '~10 real DOM nodes' : 'reused as you scroll',
      icon: '📱',
      x: 0,
      y: 1.5,
      active: true,
      tone: 'accent' as const,
    },
    { id: 'below', label: 'Rows below', sub: 'just empty space', x: 0, y: 3, dim: true },
  ],
  edges: step === 'recycle' ? [{ from: 'above', to: 'window', label: 'recycled', active: true }] : [],
  packets: step === 'recycle' ? [{ from: 'above', to: 'window', label: 'row', tone: 'accent' as const }] : [],
  caption: '10,000 posts, a few dozen nodes',
});

const mfeDiagram = (mode: 'split' | 'shell') => ({
  type: 'diagram' as const,
  title: 'One page, three teams',
  cols: 3,
  rows: 3,
  nodes: [
    { id: 'shell', label: 'App shell', icon: '🐚', sub: 'routes, login', x: 1, y: 0, active: mode === 'shell', tone: 'accent' as const },
    { id: 'search', label: 'Search', icon: '🔎', sub: 'team A', x: 0, y: 2, active: mode === 'split' },
    { id: 'cart', label: 'Cart', icon: '🛒', sub: 'team B', x: 1, y: 2 },
    { id: 'account', label: 'Account', icon: '👤', sub: 'team C', x: 2, y: 2 },
  ],
  edges: [
    { from: 'shell', to: 'search', active: mode === 'shell' },
    { from: 'shell', to: 'cart', active: mode === 'shell' },
    { from: 'shell', to: 'account', active: mode === 'shell' },
  ],
  packets: mode === 'shell' ? [{ from: 'shell', to: 'cart', label: 'JS', tone: 'accent' as const }] : [],
  caption: mode === 'split' ? 'each team deploys on its own' : 'loaded at runtime, not build time',
});

export const series: Series = {
  id: 'eng-system-design',
  title: 'Frontend system design',
  emoji: '🏗️',
  color: '#f472b6',
  order: 7,
  blurb: 'How senior engineers design feeds, search, big frontends and safe launches.',
  reels: [
    // ───────────────────────── 1. Infinite feed ─────────────────────────
    {
      id: 'fsd-infinite-feed',
      title: 'Design an infinite feed',
      beats: [
        {
          say: 'Your infinite feed shows the same post twice. Here is why.',
          scene: { type: 'title', kicker: 'System design', title: 'Why your feed shows *duplicates*', emoji: '♾️', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['twice'],
        },
        {
          say: 'Most feeds start with offset paging. Page two means skip twenty rows, then take twenty.',
          scene: { type: 'code', lang: 'ts', file: 'feed.ts', code: offsetFetch, highlight: [2], note: { line: 2, text: 'skip 20, take 20', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['offset', 'skip'],
        },
        {
          say: 'But someone posts while you scroll. Every row slides down one, so post twenty one comes back.',
          scene: {
            type: 'phone',
            os: 'ios',
            caption: 'a new post shifts every offset',
            screen: { kind: 'app', title: 'Feed', icon: '♾️', items: feedRows(true) },
          },
          sfx: 'error',
          emphasis: ['slides', 'back'],
        },
        {
          say: 'A cursor fixes it. Instead of a count, you send the last item you saw, and ask for older ones.',
          scene: { type: 'code', lang: 'ts', file: 'feed.ts', code: cursorFetch, highlight: [[2, 2], [6, 6]], note: { line: 6, text: 'anchored to a real row', tone: 'good' } },
          sfx: 'type',
          emphasis: ['cursor', 'last'],
        },
        {
          say: 'New posts land above your cursor, so they never shift your page. The database also skips nothing.',
          scene: {
            type: 'compare',
            title: 'Offset vs cursor',
            left: { title: 'offset', verdict: 'bad', items: ['Shifts on new posts', 'Slow on deep pages', 'Can jump to page 9'] },
            right: { title: 'cursor', verdict: 'ok', items: ['Stable while scrolling', 'Fast at any depth', 'Next and back only'] },
          },
          sfx: 'swipe',
          emphasis: ['never', 'skips'],
        },
        {
          say: 'Next problem. Ten thousand posts means ten thousand DOM nodes, and scrolling turns to mud.',
          scene: { type: 'stat', value: '10k', unit: 'nodes', label: 'if you render *every* post', sub: 'layout and memory grow with every page', tone: 'bad' },
          sfx: 'error',
          emphasis: ['mud'],
        },
        {
          say: 'So you virtualize. Only the rows on screen exist. Above and below is just empty space.',
          scene: feedDiagram('win'),
          sfx: 'swipe',
          emphasis: ['virtualize', 'screen'],
        },
        {
          say: 'As you scroll, the rows that leave the top get reused for the new rows at the bottom.',
          scene: feedDiagram('recycle'),
          emphasis: ['reused'],
        },
        {
          say: "Last trick. Don't wait for the bottom. Fetch the next page while the user is still a screen away.",
          scene: { type: 'code', lang: 'ts', file: 'useFeed.ts', code: sentinel, highlight: [7], note: { line: 7, text: 'start early, before the end', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['next', 'away'],
        },
        {
          say: 'Remember this. Cursors keep pages stable, virtualization keeps the DOM small, and prefetching hides the wait.',
          scene: {
            type: 'outro',
            points: ['*Cursor*, not offset', 'Render only what is on screen', 'Prefetch before the bottom'],
            tagline: 'Stable, small, early.',
          },
          sfx: 'success',
          emphasis: ['stable', 'small'],
        },
      ],
    },

    // ───────────────────────── 2. Typeahead ─────────────────────────
    {
      id: 'fsd-typeahead',
      title: 'Design a typeahead search box',
      beats: [
        {
          say: 'A search box can show results for the wrong word.',
          scene: { type: 'title', kicker: 'System design', title: 'Your search box *lies*', emoji: '🔎', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['wrong'],
        },
        {
          say: 'Here is the naive version. Every keystroke fires a request, and the last reply to arrive wins.',
          scene: { type: 'code', lang: 'js', file: 'search.js', code: naiveSearch, highlight: [6], note: { line: 6, text: 'whoever lands last wins', tone: 'bad' } },
          sfx: 'type',
          emphasis: ['every', 'last'],
        },
        {
          say: 'You type pizza. The slow reply for p lands after the fast one for pizza, and overwrites it.',
          scene: {
            type: 'phone',
            os: 'android',
            caption: 'typed "pizza", showing "p" 😬',
            screen: {
              kind: 'app',
              title: 'pizza',
              icon: '🔎',
              items: [
                { id: 'a', label: 'Pasta Bar', icon: '🍝', tone: 'bad' },
                { id: 'b', label: 'Poke House', icon: '🥗', tone: 'bad' },
                { id: 'c', label: 'Pho King', icon: '🍜', tone: 'bad' },
              ],
            },
          },
          sfx: 'error',
          emphasis: ['overwrites'],
        },
        {
          say: 'Step one, debounce. Wait until the user pauses for a quarter second, then send one request.',
          scene: { type: 'code', lang: 'js', file: 'search.js', code: debounced, highlight: [3], note: { line: 6, text: 'fires once they pause', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['debounce', 'pauses'],
        },
        {
          say: 'Step two, cancel the stale one. An abort controller kills the old request before the new one starts.',
          scene: { type: 'code', lang: 'js', file: 'search.js', code: abortable, highlight: [3], note: { line: 3, text: 'old reply can never land', tone: 'good' } },
          sfx: 'type',
          emphasis: ['cancel', 'stale'],
        },
        {
          say: 'Step three, cache. Users backspace and retype all the time, so keep answers by query.',
          scene: { type: 'code', lang: 'js', file: 'search.js', code: cached, highlight: [[3, 5]], note: { line: 5, text: 'instant on backspace', tone: 'good' } },
          sfx: 'type',
          emphasis: ['cache', 'backspace'],
        },
        {
          say: 'Now the flow is calm. Keystrokes, one pause, one request, and only the newest answer is drawn.',
          scene: {
            type: 'timeline',
            title: 'One search, done right',
            active: 3,
            steps: [
              { label: 'Keystrokes', icon: '⌨️', sub: 'p, pi, piz…' },
              { label: 'Debounce', icon: '⏱️', sub: 'wait 250ms' },
              { label: 'Cache check', icon: '🗂️', sub: 'hit? done' },
              { label: 'Fetch', icon: '🌐', sub: 'abort the old one', tone: 'accent' },
              { label: 'Render', icon: '✅', sub: 'newest only' },
            ],
          },
          sfx: 'swipe',
          emphasis: ['newest'],
        },
        {
          say: 'Last, the keyboard. A real combobox lets arrow keys move a highlight while focus stays in the input.',
          scene: { type: 'code', lang: 'xml', file: 'Search.html', code: comboA11y, highlight: [5], note: { line: 5, text: 'screen readers hear this', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['arrow', 'focus'],
        },
        {
          say: 'Quick check. You debounce but skip the abort. Can a stale result still win?',
          scene: {
            type: 'quiz',
            question: 'Debounce, but no abort. Can a stale reply still win?',
            options: ['No, debounce fixes it', 'Yes, if the user pauses twice'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['stale'],
        },
        {
          say: 'Yes. Pause, type, pause again, and two requests are in flight. Only abort makes order safe.',
          scene: {
            type: 'quiz',
            question: 'Debounce, but no abort. Can a stale reply still win?',
            options: ['No, debounce fixes it', 'Yes, if the user pauses twice'],
            answer: 1,
            reveal: true,
            explain: 'Debounce cuts how many. Abort fixes order.',
          },
          sfx: 'ding',
          emphasis: ['abort'],
        },
        {
          say: 'Remember this. Debounce cuts requests, abort kills stale ones, a cache makes backspace instant.',
          scene: {
            type: 'outro',
            points: ['*Debounce* the keystrokes', 'Abort the stale request', 'Cache by query, a11y by default'],
            tagline: 'Fewer, fresher, faster.',
          },
          sfx: 'success',
          emphasis: ['abort', 'instant'],
        },
      ],
    },

    // ───────────────────────── 3. Micro-frontends ─────────────────────────
    {
      id: 'fsd-micro-frontends',
      title: 'Micro-frontends: help or hurt?',
      beats: [
        {
          say: 'Micro frontends fix team problems, not code problems.',
          scene: { type: 'title', kicker: 'System design', title: 'Micro-frontends fix *teams*, not code', emoji: '🧩', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['team'],
        },
        {
          say: 'Picture one shop app, three teams, one repo. A typo fix in the cart waits on everyone else to ship.',
          scene: {
            type: 'terminal',
            title: 'Release day',
            lines: [
              { cmd: 'git log --oneline main' },
              { out: 'fix(cart): typo in button', tone: 'accent' },
              { out: 'feat(search): new filters' },
              { out: 'wip(account): half done', tone: 'bad' },
              { out: 'release blocked by account', tone: 'bad' },
            ],
          },
          sfx: 'type',
          emphasis: ['waits'],
        },
        {
          say: 'A micro frontend splits the page by team. Each team owns a slice and deploys it on its own.',
          scene: mfeDiagram('split'),
          sfx: 'swipe',
          emphasis: ['team', 'own'],
        },
        {
          say: 'A thin app shell owns routing and login, then loads each slice at runtime, for example with module federation.',
          scene: mfeDiagram('shell'),
          emphasis: ['shell', 'runtime'],
        },
        {
          say: 'It helps when many teams block each other, or when you are slowly moving off an old framework.',
          scene: {
            type: 'list',
            title: 'When it helps',
            items: [
              { text: 'Many teams, one *page*', icon: '👥', sub: 'releases keep colliding' },
              { text: 'Old app, slow migration', icon: '🚚', sub: 'swap one route at a time' },
              { text: 'Clear domain borders', icon: '🧱', sub: 'cart never touches search' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['block', 'old'],
        },
        {
          say: 'It hurts when you pay for it without that pain. Each slice can ship its own copy of React.',
          scene: { type: 'stat', value: '3', unit: 'Reacts', label: 'on one page, if nobody *shares*', sub: 'same library, downloaded three times', tone: 'bad' },
          sfx: 'error',
          emphasis: ['hurts', 'copy'],
        },
        {
          say: 'You also get drift. Three teams, three button styles, and a shared state bug nobody owns.',
          scene: {
            type: 'compare',
            title: 'The price you pay',
            left: { title: 'Monolith', verdict: 'neutral', items: ['One build, one bundle', 'One design system', 'Slow shared releases'] },
            right: { title: 'Micro-FE', verdict: 'neutral', items: ['Fast team releases', 'Duplicate libraries', 'UI and state drift'] },
          },
          sfx: 'swipe',
          emphasis: ['drift', 'owns'],
        },
        {
          say: 'Quick check. Five engineers, one team, one slow build. Do you split into micro frontends?',
          scene: {
            type: 'quiz',
            question: 'One team, five engineers, a slow build. Split it?',
            options: ['Yes, split by feature', 'No, fix the build'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['split'],
        },
        {
          say: 'No. One team has no one to block. Fix the build with caching or code splitting instead.',
          scene: {
            type: 'quiz',
            question: 'One team, five engineers, a slow build. Split it?',
            options: ['Yes, split by feature', 'No, fix the build'],
            answer: 1,
            reveal: true,
            explain: 'No team pain, no micro frontends.',
          },
          sfx: 'ding',
          emphasis: ['build'],
        },
        {
          say: 'Remember this. Split by team when teams block each other, and share one React and one design system.',
          scene: {
            type: 'outro',
            points: ['Split for *team* speed', 'Share React and the design system', 'One team? Stay a monolith'],
            tagline: 'Org chart first, code second.',
          },
          sfx: 'success',
          emphasis: ['team', 'share'],
        },
      ],
    },

    // ───────────────────────── 4. Feature flags ─────────────────────────
    {
      id: 'fsd-feature-flags',
      title: 'Feature flags and gradual rollouts',
      beats: [
        {
          say: 'Big teams deploy unfinished code to production every day. On purpose.',
          scene: { type: 'title', kicker: 'System design', title: 'Ship it *dark*', emoji: '🚦', style: 'slam' },
          sfx: 'whoosh',
          emphasis: ['unfinished', 'purpose'],
        },
        {
          say: 'The trick is a feature flag. The new checkout is in the bundle, but a flag decides who sees it.',
          scene: { type: 'code', lang: 'tsx', file: 'Checkout.tsx', code: flagCode, highlight: [[1, 3]], note: { line: 3, text: 'off for everyone, for now', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['flag', 'who'],
        },
        {
          say: 'Deploy and release are now two steps. Deploy moves code. Release flips the flag.',
          scene: {
            type: 'compare',
            title: 'Two separate steps',
            left: { title: 'Deploy', verdict: 'neutral', items: ['Code goes to prod', 'Nobody sees it', 'Engineers decide'] },
            right: { title: 'Release', verdict: 'ok', items: ['Flag turns on', 'Users see it', 'Product decides'] },
          },
          sfx: 'swipe',
          emphasis: ['deploy', 'release'],
        },
        {
          say: 'Then you ramp slowly. Staff first, then one percent, then ten, then everyone.',
          scene: {
            type: 'timeline',
            title: 'A gradual rollout',
            active: 1,
            steps: [
              { label: 'Staff', icon: '🧑‍💻', sub: 'dogfood it' },
              { label: '1%', icon: '🐤', sub: 'watch error rates', tone: 'accent' },
              { label: '10%', icon: '📈', sub: 'watch conversion' },
              { label: '100%', icon: '🚀', sub: 'then delete the flag' },
            ],
          },
          sfx: 'pop',
          emphasis: ['staff', 'percent'],
        },
        {
          say: 'Who is in the one percent? Hash the user id into a number from zero to ninety nine.',
          scene: { type: 'code', lang: 'ts', file: 'flags.ts', code: bucketCode, highlight: [[2, 3]], note: { line: 3, text: 'same user, same bucket', tone: 'accent' } },
          sfx: 'type',
          emphasis: ['hash'],
        },
        {
          say: 'The hash is sticky. A user under the line stays in on every visit, so nobody flickers between versions.',
          scene: {
            type: 'diagram',
            title: 'Sticky buckets',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'user', label: 'user 42', icon: '👤', x: 1, y: 0 },
              { id: 'hash', label: 'hash = 7', icon: '#️⃣', x: 1, y: 1.5, active: true, tone: 'accent' },
              { id: 'old', label: 'Old checkout', sub: 'bucket ≥ 10', x: 0, y: 3, dim: true },
              { id: 'new', label: 'New checkout', sub: 'bucket < 10', x: 2, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'user', to: 'hash', active: true },
              { from: 'hash', to: 'new', active: true },
              { from: 'hash', to: 'old', dashed: true },
            ],
            packets: [{ from: 'hash', to: 'new', label: '42', tone: 'good' }],
            caption: 'raise the % and old users stay in',
          },
          sfx: 'swipe',
          emphasis: ['sticky', 'flickers'],
        },
        {
          say: 'At ten percent, errors spike. You do not roll back a deploy. You set the flag to zero.',
          scene: { type: 'code', lang: 'json', file: 'new-checkout.json', code: killSwitch(false), errors: [3, 4], note: { line: 4, text: 'kill switch, live in seconds', tone: 'bad' } },
          sfx: 'error',
          emphasis: ['zero'],
        },
        {
          say: 'That is a kill switch. No build, no app store review, and the old checkout is back.',
          scene: { type: 'stat', value: '0', unit: 'builds', label: 'to turn a feature *off*', sub: 'the flag service pushes the change', tone: 'good' },
          sfx: 'ding',
          emphasis: ['kill', 'back'],
        },
        {
          say: 'One catch. Flags are debt. Once it hits one hundred percent, delete the flag and the old path.',
          scene: {
            type: 'list',
            title: 'Flag hygiene',
            items: [
              { text: 'Give every flag an *owner*', icon: '👤' },
              { text: 'Add an expiry date', icon: '📅' },
              { text: 'Delete it at 100%', icon: '🗑️', sub: 'and the old code path' },
            ],
            active: 2,
          },
          sfx: 'pop',
          emphasis: ['debt', 'delete'],
        },
        {
          say: 'Remember this. Deploy dark, release with a flag, ramp in small steps, and keep a kill switch ready.',
          scene: {
            type: 'outro',
            points: ['Deploy is not *release*', 'Ramp 1%, 10%, 100%', 'Kill switch beats a rollback'],
            tagline: 'Ship dark, light it slowly.',
          },
          sfx: 'success',
          emphasis: ['dark', 'kill'],
        },
      ],
    },
  ],
};
