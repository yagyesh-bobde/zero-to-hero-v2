import type { Series } from '../types';

// ---------- Reel 1: polling vs long polling vs SSE vs WebSockets ----------

const pollCode = `setInterval(async () => {
  const res = await fetch(
    '/orders/42/status',
  );
  render(await res.json());
}, 5000);`;

const sseCode = `const es = new EventSource(
  '/orders/42/stream',
);

es.onmessage = (e) => {
  render(JSON.parse(e.data));
};`;

const trackerItems = [
  { id: 'placed', label: 'Order placed', icon: '🧾', checked: true },
  { id: 'cooking', label: 'Cooking', icon: '🍳', tone: 'accent' as const, sub: 'live from the kitchen' },
  { id: 'driver', label: 'Driver on the way', icon: '🛵', checked: false },
];

// ---------- Reel 2: backoff + jitter ----------

const naiveRetry = `async function load() {
  while (true) {
    try {
      return await fetch('/feed');
    } catch {
      await sleep(1000);
    }
  }
}`;

const jitterCode = `const cap = 30_000;
const base = 1_000;

const max = Math.min(
  cap,
  base * 2 ** attempt,
);
await sleep(Math.random() * max);`;

const herd = (mode: 'storm' | 'lockstep' | 'jitter') => {
  const ok = mode === 'jitter';
  const labels =
    mode === 'storm' ? ['1s', '1s', '1s'] : mode === 'lockstep' ? ['4s', '4s', '4s'] : ['0.7s', '2.9s', '1.6s'];
  const tone = ok ? ('good' as const) : mode === 'storm' ? ('bad' as const) : ('warn' as const);
  return {
    type: 'diagram' as const,
    title: ok ? 'Backoff + jitter' : mode === 'storm' ? 'The API blips' : 'Backoff alone',
    cols: 3,
    rows: 3,
    nodes: [
      { id: 'a', label: 'Phone A', icon: '📱', x: 0, y: 0, shape: 'circle' as const },
      { id: 'b', label: 'Phone B', icon: '📱', x: 1, y: 0, shape: 'circle' as const },
      { id: 'c', label: 'Phone C', icon: '📱', x: 2, y: 0, shape: 'circle' as const },
      {
        id: 'api',
        label: 'API',
        icon: ok ? '✅' : '🔥',
        sub: ok ? 'steady load' : mode === 'storm' ? 'down again' : 'spike every time',
        x: 1,
        y: 2,
        tone,
        active: true,
      },
    ],
    edges: [
      { from: 'a', to: 'api', tone },
      { from: 'b', to: 'api', tone },
      { from: 'c', to: 'api', tone },
    ],
    packets: [
      { from: 'a', to: 'api', label: labels[0], tone },
      { from: 'b', to: 'api', label: labels[1], tone },
      { from: 'c', to: 'api', label: labels[2], tone },
    ],
    caption: ok ? 'retries spread out over time' : mode === 'storm' ? 'everyone retries in sync' : 'still in lockstep',
  };
};

// ---------- Reel 3: idempotency keys ----------

const payCode = `const key = crypto.randomUUID();

await fetch('/payments', {
  method: 'POST',
  headers: {
    'Idempotency-Key': key,
  },
  body: JSON.stringify(order),
});`;

const payQuiz = {
  question: 'Same key, two requests, same instant. You check, then charge. Safe?',
  options: ['Yes, the key covers it', 'No, both can charge'],
  answer: 1,
};

// ---------- Reel 4: offline-first sync queue ----------

const syncChain = (step: 'local' | 'sync') => ({
  type: 'diagram' as const,
  title: step === 'local' ? 'Offline: write locally' : 'Back online: drain',
  cols: 1,
  rows: 4,
  nodes: [
    { id: 'ui', label: 'Your UI', icon: '📱', x: 0, y: 0, dim: step === 'sync' },
    {
      id: 'db',
      label: 'Local database',
      icon: '💾',
      sub: 'source of truth for UI',
      x: 0,
      y: 1,
      active: step === 'local',
      tone: 'accent' as const,
    },
    {
      id: 'queue',
      label: 'Sync queue',
      icon: '📬',
      sub: step === 'local' ? '1 pending write' : 'removed once confirmed',
      x: 0,
      y: 2,
      tone: 'warn' as const,
      active: step === 'sync',
    },
    {
      id: 'server',
      label: 'Server',
      icon: '☁️',
      sub: step === 'local' ? 'offline' : 'confirms each write',
      x: 0,
      y: 3,
      dim: step === 'local',
      tone: step === 'sync' ? ('good' as const) : undefined,
    },
  ],
  edges: [
    { from: 'ui', to: 'db', active: step === 'local' },
    { from: 'db', to: 'queue' },
    { from: 'queue', to: 'server', dashed: step === 'local', active: step === 'sync' },
  ],
  packets:
    step === 'local'
      ? [{ from: 'ui', to: 'db', label: 'Milk', tone: 'accent' as const }]
      : [{ from: 'queue', to: 'server', label: 'add Milk', tone: 'good' as const }],
  caption: step === 'local' ? 'no spinner, no network' : 'in order, one at a time',
});

const queueCode = `queue.push({
  id: crypto.randomUUID(),
  op: 'add',
  item: 'Milk',
  updatedAt: Date.now(),
});`;

const strategies = (active: number) => ({
  type: 'list' as const,
  title: 'Pick a conflict rule',
  active,
  items: [
    { text: 'Last write wins', icon: '🏁', sub: 'simple, drops work', tone: 'warn' as const },
    { text: 'Merge *per field*', icon: '🧩', sub: 'name + qty both kept', tone: 'good' as const },
    { text: 'Ask the user', icon: '🙋', sub: 'for things that matter' },
  ],
});

export const series: Series = {
  id: 'eng-realtime',
  title: 'Real-time & reliability',
  emoji: '📡',
  color: '#fb923c',
  order: 5,
  blurb: 'Live updates, retries, payments and offline sync that survive bad networks.',
  reels: [
    // ------------------------------------------------------------------
    {
      id: 'rt-polling-sse-websockets',
      title: 'Polling, SSE or WebSockets?',
      beats: [
        {
          say: 'Four ways to make a screen live. Most teams reach for the wrong one.',
          scene: {
            type: 'title',
            kicker: 'Real-time web',
            title: 'Poll, stream, or *socket*?',
            emoji: '📡',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['live', 'wrong'],
        },
        {
          say: "Say you're building a live order tracker. The status changes maybe five times in half an hour.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Order #42', icon: '🛵', items: trackerItems },
            caption: '5 changes in 30 minutes',
          },
          sfx: 'swipe',
          emphasis: ['five', 'tracker'],
        },
        {
          say: 'Option one, polling. Ask the server every five seconds. Simple, but most answers say nothing changed.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'tracker.js',
            code: pollCode,
            highlight: [6],
            note: { line: 6, text: '360 asks for 5 updates', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['polling', 'nothing'],
        },
        {
          say: 'Long polling is smarter. The server holds the request open, and replies only when something changes.',
          scene: {
            type: 'diagram',
            title: 'Long polling',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Browser', icon: '🌐', x: 0, y: 0 },
              { id: 'srv', label: 'Server', icon: '🖥️', sub: 'holds the request ⏳', x: 0, y: 1.5, active: true },
              { id: 'kitchen', label: 'Kitchen', icon: '🍳', sub: 'status changed', x: 0, y: 3, tone: 'accent' },
            ],
            edges: [
              { from: 'app', to: 'srv', label: 'GET, wait…', both: true },
              { from: 'kitchen', to: 'srv', active: true },
            ],
            packets: [{ from: 'kitchen', to: 'srv', label: 'cooking', tone: 'accent' }],
            caption: 'one reply, then ask again',
          },
          sfx: 'swipe',
          emphasis: ['holds', 'changes'],
        },
        {
          say: 'Server-sent events go further. One response stays open, and the server keeps writing updates into it.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'tracker.js',
            code: sseCode,
            highlight: [[1, 3]],
            note: { line: 3, text: 'one long HTTP response', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['open', 'writing'],
        },
        {
          say: "It's plain text. If the line drops, the browser reconnects and sends the last event ID it saw.",
          scene: {
            type: 'terminal',
            title: 'text/event-stream',
            lines: [
              { out: 'id: 7' },
              { out: 'data: {"status":"cooking"}', tone: 'accent' },
              { out: '' },
              { out: 'id: 8' },
              { out: 'data: {"status":"on the way"}', tone: 'good' },
            ],
          },
          sfx: 'pop',
          emphasis: ['reconnects', 'ID'],
        },
        {
          say: 'WebSockets upgrade the connection into a two-way pipe. Use them when the client talks a lot too.',
          scene: {
            type: 'compare',
            title: 'Down only vs both ways',
            left: { title: 'SSE', verdict: 'neutral', icon: '⬇️', items: ['Server to client', 'Plain HTTP', 'Reconnects itself'] },
            right: { title: 'WebSocket', verdict: 'neutral', icon: '↕️', items: ['Both directions', 'Own protocol', 'You handle reconnect'] },
          },
          sfx: 'swipe',
          emphasis: ['two-way', 'talks'],
        },
        {
          say: 'So, the order tracker. Updates only flow down to the phone. Which one fits?',
          scene: {
            type: 'quiz',
            question: 'Live order tracker, updates flow down only. Pick one.',
            options: ['Poll every second', 'Server-sent events', 'WebSockets'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['down'],
        },
        {
          say: 'Server-sent events. One way, plain HTTP, free reconnects. Serve it over HTTP 2, or browsers cap you at six streams.',
          speak: 'Server-sent events. One way, plain H T T P, free reconnects. Serve it over H T T P 2, or browsers cap you at six streams.',
          scene: {
            type: 'quiz',
            question: 'Live order tracker, updates flow down only. Pick one.',
            options: ['Poll every second', 'Server-sent events', 'WebSockets'],
            answer: 1,
            reveal: true,
            explain: 'HTTP/1.1 allows 6 SSE per domain, across all tabs.',
          },
          sfx: 'ding',
          emphasis: ['six'],
        },
        {
          say: 'Remember this. Pick by direction. Server talks, use SSE. Both sides talk, use WebSockets.',
          speak: 'Remember this. Pick by direction. Server talks, use S S E. Both sides talk, use WebSockets.',
          scene: {
            type: 'outro',
            points: ['Rare changes: *polling* is fine', 'Server pushes only: *SSE*', 'Both sides talk: *WebSockets*'],
            tagline: 'Match the pipe to the flow.',
          },
          sfx: 'success',
          emphasis: ['direction'],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'rt-backoff-jitter',
      title: 'Retries that don’t stampede',
      beats: [
        {
          say: "Your retry code can take down the server it's trying to reach.",
          scene: {
            type: 'title',
            kicker: 'Reliability',
            title: 'Your retries can *kill* the server',
            emoji: '🐃',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['retry', 'down'],
        },
        {
          say: "Here's a normal retry. If the fetch fails, wait one second, then try again, forever.",
          scene: {
            type: 'code',
            lang: 'js',
            file: 'feed.js',
            code: naiveRetry,
            highlight: [6],
            note: { line: 6, text: 'every client, same rhythm', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['forever'],
        },
        {
          say: "Now the API blips. Every phone fails together, and retries together, every second. That's a thundering herd.",
          scene: herd('storm'),
          sfx: 'error',
          emphasis: ['together', 'herd'],
        },
        {
          say: 'Fix one, exponential backoff. Double the wait after each failure, up to a cap.',
          scene: {
            type: 'timeline',
            title: 'Exponential backoff',
            steps: [
              { label: 'Fail 1', sub: 'wait 1s', icon: '❌' },
              { label: 'Fail 2', sub: 'wait 2s', icon: '❌' },
              { label: 'Fail 3', sub: 'wait 4s', icon: '❌' },
              { label: 'Fail 4', sub: 'wait 8s', icon: '❌' },
              { label: 'Cap', sub: 'never above 30s', icon: '🧢', tone: 'accent' },
            ],
            active: 4,
          },
          sfx: 'swipe',
          emphasis: ['Double', 'cap'],
        },
        {
          say: 'But phones that failed together still wait four seconds together, and hit together.',
          scene: herd('lockstep'),
          sfx: 'swipe',
          emphasis: ['together'],
        },
        {
          say: 'Fix two, jitter. Sleep a random time between zero and that limit. This is called full jitter.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'retry.js',
            code: jitterCode,
            highlight: [8],
            note: { line: 8, text: 'random wait breaks the sync', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['random', 'jitter'],
        },
        {
          say: 'Now the same retries land at different moments, and the server gets a steady trickle instead of a wall.',
          scene: herd('jitter'),
          sfx: 'ding',
          emphasis: ['trickle', 'wall'],
        },
        {
          say: "Marc Brooker tested this on AWS's architecture blog. Backoff with no jitter was the clear loser.",
          speak: "Marc Brooker tested this on A W S's architecture blog. Backoff with no jitter was the clear loser.",
          scene: {
            type: 'list',
            title: 'Retry rules',
            active: 1,
            items: [
              { text: 'Backoff with a cap', icon: '⏱️' },
              { text: 'Always add *jitter*', icon: '🎲', sub: 'no jitter: the clear loser' },
              { text: 'Retry timeouts, 5xx, 429', icon: '🔁', sub: 'never a 400' },
              { text: 'Give up after a few', icon: '🛑' },
            ],
          },
          sfx: 'pop',
          emphasis: ['loser'],
        },
        {
          say: 'Remember this. Backoff spreads retries over time. Jitter spreads them across clients. You need both.',
          scene: {
            type: 'outro',
            points: ['Double the wait each try', 'Add *jitter*: a random wait', 'Cap it, then give up'],
            tagline: 'Spread out, or pile up.',
          },
          sfx: 'success',
          emphasis: ['time', 'clients', 'both'],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'rt-idempotency-keys',
      title: 'Idempotency keys stop double charges',
      beats: [
        {
          say: 'The user tapped Pay once. Their card got charged twice.',
          scene: {
            type: 'title',
            kicker: 'Payments',
            title: 'Tapped *once*. Charged twice.',
            emoji: '💸',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['once', 'twice'],
        },
        {
          say: 'The request reaches the server and the charge goes through. Then the network drops before the reply arrives.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Checkout',
              icon: '🛒',
              items: [
                { id: 'shoes', label: 'Running shoes', icon: '👟', sub: 'size 9' },
                { id: 'ship', label: 'Shipping', icon: '📦', sub: 'free' },
                { id: 'total', label: 'Total', icon: '🧾', sub: '$49.00' },
              ],
              button: 'Pay $49',
              loading: true,
            },
            caption: 'spinner… then timeout',
            tap: { x: 0.5, y: 0.86 },
          },
          sfx: 'swipe',
          emphasis: ['drops'],
        },
        {
          say: "So the app retries. The server can't tell it's the same payment, so it charges again.",
          scene: {
            type: 'timeline',
            title: 'One tap, two charges',
            steps: [
              { label: 'Tap Pay', icon: '👆' },
              { label: 'Charge #1', sub: 'succeeds', icon: '💳', tone: 'good' },
              { label: 'Reply lost', icon: '📶', tone: 'warn' },
              { label: 'App retries', icon: '🔁' },
              { label: 'Charge #2', sub: 'same order 😱', icon: '💳', tone: 'bad' },
            ],
            active: 4,
          },
          sfx: 'error',
          emphasis: ['same', 'again'],
        },
        {
          say: 'The fix is an idempotency key. Idempotent means doing it twice has the same effect as once.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'pay.js',
            code: payCode,
            highlight: [6],
            note: { line: 6, text: 'a header on the request', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['idempotency', 'once'],
        },
        {
          say: 'The app makes one random ID per payment, and sends that same ID on every retry.',
          speak: 'The app makes one random I D per payment, and sends that same I D on every retry.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'pay.js',
            code: payCode,
            highlight: [1],
            note: { line: 1, text: 'once per payment, not per try', tone: 'good' },
          },
          emphasis: ['one', 'every'],
        },
        {
          say: 'The server remembers keys. A new key runs the charge and saves the reply. A seen key just replays it.',
          scene: {
            type: 'diagram',
            title: 'Server side',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'req', label: 'Request', icon: '📨', sub: 'key a1b2', x: 1, y: 0 },
              { id: 'store', label: 'Key store', icon: '🗄️', sub: 'seen a1b2?', x: 1, y: 1.5, tone: 'info' },
              { id: 'charge', label: 'Charge', icon: '💳', sub: 'new key', x: 0.2, y: 3 },
              { id: 'replay', label: 'Replay', icon: '♻️', sub: 'seen key', x: 1.8, y: 3, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'req', to: 'store' },
              { from: 'store', to: 'charge', dashed: true },
              { from: 'store', to: 'replay', active: true },
            ],
            packets: [{ from: 'store', to: 'replay', label: 'retry', tone: 'good' }],
            caption: 'a retry never charges twice',
          },
          sfx: 'swipe',
          emphasis: ['new', 'replays'],
        },
        {
          say: "Stripe's docs describe exactly this. They save the first status and body, and can drop keys after 24 hours.",
          scene: {
            type: 'list',
            title: 'How Stripe does it',
            active: 1,
            items: [
              { text: 'Idempotency-Key header', icon: '🔑' },
              { text: 'Saves *status + body*', icon: '💾', sub: 'even a 500 is replayed' },
              { text: 'Params differ? Error', icon: '⛔' },
              { text: 'Keys pruned after 24h', icon: '🧹' },
            ],
          },
          sfx: 'pop',
          emphasis: ['Stripe', 'body'],
        },
        {
          say: 'Senior question. Two requests, same key, same instant. You check the store, then charge. Safe?',
          scene: { type: 'quiz', ...payQuiz },
          sfx: 'riser',
          emphasis: ['same', 'Safe'],
        },
        {
          say: 'No. Both can pass the check. Claim the key first with a unique insert, then charge.',
          scene: {
            type: 'quiz',
            ...payQuiz,
            reveal: true,
            explain: 'Insert the key with a unique constraint first.',
          },
          sfx: 'ding',
          emphasis: ['Claim', 'unique'],
        },
        {
          say: 'Remember this. Retries will happen. Give every payment a key, and make the server remember it.',
          scene: {
            type: 'outro',
            points: ['One key per action', 'Same key on every retry', 'Server *replays* the saved reply'],
            tagline: 'Once means once.',
          },
          sfx: 'success',
          emphasis: ['key', 'remember'],
        },
      ],
    },
    // ------------------------------------------------------------------
    {
      id: 'rt-offline-sync-queue',
      title: 'Offline-first with a sync queue',
      beats: [
        {
          say: 'Your app should still work in a subway tunnel. Here is how.',
          scene: {
            type: 'title',
            kicker: 'Offline-first',
            title: 'Zero bars. App still *works*.',
            emoji: '🚇',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['tunnel'],
        },
        {
          say: 'Underground, you add Milk to a shared list. It shows up instantly. No spinner, no error.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Groceries',
              icon: '🛒',
              items: [
                { id: 'milk', label: 'Milk', icon: '🥛', sub: 'waiting to sync ⏳', tone: 'accent' },
                { id: 'eggs', label: 'Eggs', icon: '🥚', checked: false },
                { id: 'bread', label: 'Bread', icon: '🍞', checked: true },
              ],
              toast: 'Offline · saved on device',
            },
            caption: 'no network, no waiting',
          },
          sfx: 'swipe',
          emphasis: ['instantly'],
        },
        {
          say: 'The trick is that the UI only talks to a local database. Each change also joins a queue.',
          scene: syncChain('local'),
          sfx: 'swipe',
          emphasis: ['local', 'queue'],
        },
        {
          say: 'A queue entry is tiny. What changed, when, and a unique ID so the server can skip duplicates.',
          speak: 'A queue entry is tiny. What changed, when, and a unique I D so the server can skip duplicates.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'sync.ts',
            code: queueCode,
            highlight: [2],
            note: { line: 2, text: 'safe to send twice', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['unique', 'duplicates'],
        },
        {
          say: 'Back online, a worker sends the queue in order. An entry leaves only after the server confirms it.',
          scene: syncChain('sync'),
          sfx: 'swipe',
          emphasis: ['order', 'confirms'],
        },
        {
          say: 'Now the hard part. While you were offline, your partner renamed Milk to Oat milk. Who wins?',
          scene: {
            type: 'compare',
            title: 'Same item, two edits',
            left: { title: 'You, offline', verdict: 'neutral', icon: '🚇', items: ['qty: 1 → 2', 'edited 9:02'] },
            right: { title: 'Partner, online', verdict: 'neutral', icon: '🏠', items: ['name: Oat milk', 'edited 9:05'] },
          },
          sfx: 'riser',
          emphasis: ['hard', 'wins'],
        },
        {
          say: 'Last write wins is simple, but one of you loses work.',
          scene: strategies(0),
          sfx: 'pop',
          emphasis: ['loses'],
        },
        {
          say: 'Merging per field keeps both. Your quantity and their new name never touched the same field.',
          scene: strategies(1),
          sfx: 'ding',
          emphasis: ['both', 'field'],
        },
        {
          say: "Figma's engineering blog describes this. Offline edits are reapplied on a fresh copy, and the server settles each property.",
          scene: {
            type: 'timeline',
            title: 'Figma on reconnect',
            steps: [
              { label: 'Edit offline', icon: '✏️' },
              { label: 'Fetch fresh doc', icon: '⬇️' },
              { label: 'Reapply edits', icon: '🔁', tone: 'accent' },
              { label: 'Server decides', sub: 'last write, per property', icon: '⚖️' },
            ],
            active: 2,
          },
          sfx: 'swipe',
          emphasis: ['Figma', 'property'],
        },
        {
          say: 'Remember this. Write locally first, queue every change, and choose your conflict rule before you ship.',
          scene: {
            type: 'outro',
            points: ['UI reads and writes *locally*', 'A queue syncs when online', 'Pick a conflict rule early'],
            tagline: 'Local first, server later.',
          },
          sfx: 'success',
          emphasis: ['locally', 'conflict'],
        },
      ],
    },
  ],
};
