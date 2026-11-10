import type { Series } from '../types';

const preconnect = `<!-- index.html, in <head> -->
<link
  rel="preconnect"
  href="https://api.shop.dev"
/>`;

const assetHeaders = `HTTP/2 200 OK
content-type: text/javascript
cache-control:
  max-age=31536000, immutable`;

const htmlHeaders = `HTTP/2 200 OK
content-type: text/html
cache-control: no-cache
etag: "v42"`;

const corsGet = `// page on https://shop.dev
const res = await fetch(
  'https://api.shop.dev/cart'
);`;

const corsPost = `// page on https://shop.dev
const res = await fetch(
  'https://api.shop.dev/cart',
  {
    method: 'POST',
    headers: {
      'Content-Type':
        'application/json',
    },
    body,
  }
);`;

const preflight = `OPTIONS /cart
Origin: https://shop.dev
Access-Control-Request-Method:
  POST

204 No Content
Access-Control-Allow-Origin:
  https://shop.dev
Access-Control-Allow-Headers:
  Content-Type`;

/** HTTP/1.1 → 2 → 3 diagram, reused across beats so the nodes stay put. */
const muxDiagram = (mode: 'h1' | 'h2' | 'lost') => {
  const h1 = mode === 'h1';
  const lost = mode === 'lost';
  return {
    type: 'diagram' as const,
    title: h1 ? 'HTTP/1.1: one at a time' : lost ? 'One packet lost' : 'HTTP/2: one shared pipe',
    cols: 3,
    rows: 4,
    nodes: [
      { id: 'js', label: 'app.js', icon: '📜', x: 0, y: 0, active: h1, tone: lost ? ('bad' as const) : undefined },
      { id: 'img', label: 'hero.jpg', icon: '🖼️', x: 1, y: 0, dim: h1, tone: lost ? ('bad' as const) : undefined },
      { id: 'font', label: 'font', icon: '🔤', x: 2, y: 0, dim: h1, tone: lost ? ('bad' as const) : undefined },
      {
        id: 'pipe',
        label: h1 ? 'Conn 1' : 'One TCP',
        sub: h1 ? 'busy with app.js' : lost ? 'waits for 1 resend' : 'frames interleave',
        x: 1,
        y: 1.5,
        shape: 'pill' as const,
        active: !h1,
        tone: lost ? ('bad' as const) : ('accent' as const),
      },
      { id: 'server', label: 'Server', icon: '🖥️', x: 1, y: 3, tone: 'info' as const },
    ],
    edges: [
      { from: 'js', to: 'pipe', active: !lost, dashed: lost, tone: lost ? ('bad' as const) : undefined },
      { from: 'img', to: 'pipe', active: mode === 'h2', dashed: !(mode === 'h2'), tone: lost ? ('bad' as const) : undefined },
      { from: 'font', to: 'pipe', active: mode === 'h2', dashed: !(mode === 'h2'), tone: lost ? ('bad' as const) : undefined },
      { from: 'pipe', to: 'server', active: !lost, dashed: lost, tone: lost ? ('bad' as const) : undefined },
    ],
    packets: lost
      ? []
      : h1
        ? [{ from: 'js', to: 'pipe', label: 'GET', tone: 'warn' as const }]
        : [
            { from: 'js', to: 'pipe', label: '1', tone: 'warn' as const },
            { from: 'img', to: 'pipe', label: '2', tone: 'info' as const },
            { from: 'font', to: 'pipe', label: '3', tone: 'good' as const },
          ],
    caption: h1 ? 'the rest wait their turn' : lost ? 'every file stalls behind it' : 'all files, one connection',
  };
};

export const series: Series = {
  id: 'eng-networking',
  title: 'Networking for frontend',
  emoji: '🌐',
  color: '#a78bfa',
  order: 4,
  blurb: 'Round trips, HTTP versions, caching and CORS: what really happens on the wire.',
  reels: [
    {
      id: 'net-before-first-byte',
      title: 'Before the first byte',
      beats: [
        {
          say: 'Your server answers in ten milliseconds. The first request still feels slow.',
          scene: {
            type: 'title',
            kicker: 'Networking',
            title: 'Fast server, *slow* first request',
            sub: 'the wait starts before your code runs',
            emoji: '🐢',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['ten', 'slow'],
        },
        {
          say: 'Time a cold request with curl. Most of the wait happens before your server even sees it.',
          scene: {
            type: 'terminal',
            title: 'A cold request',
            lines: [
              { cmd: 'curl -w @timing.txt api.shop.dev' },
              { out: 'dns lookup     0.040s', tone: 'muted' },
              { out: 'tcp connect    0.141s', tone: 'muted' },
              { out: 'tls done       0.243s', tone: 'warn' },
              { out: 'first byte     0.354s', tone: 'bad' },
            ],
          },
          sfx: 'type',
          emphasis: ['cold', 'before'],
        },
        {
          say: 'Three setup steps run first. DNS finds the IP address, TCP opens a connection, TLS agrees on encryption keys.',
          scene: {
            type: 'timeline',
            title: 'Before your request',
            steps: [
              { label: 'DNS', sub: 'name to IP address', icon: '📖' },
              { label: 'TCP', sub: 'open a connection', icon: '🤝' },
              { label: 'TLS', sub: 'agree on keys', icon: '🔐' },
              { label: 'Request', sub: 'finally, your GET', icon: '📨', tone: 'accent' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['DNS', 'TCP', 'TLS'],
        },
        {
          say: 'Each step costs a round trip: a message out and a reply back. Distance sets the price.',
          scene: {
            type: 'diagram',
            title: 'One round trip',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'you', label: 'Browser', icon: '💻', sub: 'you, in Mumbai', x: 0, y: 0, active: true },
              { id: 'far', label: 'Server', icon: '🖥️', sub: 'far away, in Virginia', x: 0, y: 2, tone: 'info' },
            ],
            edges: [{ from: 'you', to: 'far', both: true, label: 'out and back', active: true }],
            packets: [{ from: 'you', to: 'far', label: 'hello', tone: 'warn' }],
            caption: 'light in fibre has a speed limit',
          },
          sfx: 'pop',
          emphasis: ['round', 'distance'],
        },
        {
          say: 'Add it up. Three hundred and fifty milliseconds of waiting, for ten milliseconds of real work.',
          scene: {
            type: 'stat',
            value: '354',
            unit: 'ms',
            label: 'until the *first byte*',
            sub: "your server's share of it: 10ms",
            tone: 'bad',
          },
          sfx: 'ding',
          emphasis: ['waiting', 'real'],
        },
        {
          say: 'Fix one: preconnect. The browser runs DNS, TCP and TLS early, while your JavaScript still downloads.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'index.html',
            code: preconnect,
            highlight: [3],
            note: { line: 3, text: 'handshakes start right away', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['preconnect', 'early'],
        },
        {
          say: 'Fix two: shorten the trip. A CDN edge near the user does the handshakes, and keeps a warm line to your origin.',
          speak: 'Fix two: shorten the trip. A C D N edge near the user does the handshakes, and keeps a warm line to your origin.',
          scene: {
            type: 'diagram',
            title: 'Shorter round trips',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'you', label: 'Browser', icon: '💻', sub: 'you, in Mumbai', x: 0, y: 0 },
              { id: 'edge', label: 'CDN edge', icon: '📍', sub: 'same city, short trips', x: 0, y: 1.5, active: true },
              { id: 'far', label: 'Origin', icon: '🖥️', sub: 'connection kept open', x: 0, y: 3, tone: 'info' },
            ],
            edges: [
              { from: 'you', to: 'edge', both: true, active: true },
              { from: 'edge', to: 'far', dashed: true, label: 'already warm' },
            ],
            packets: [{ from: 'you', to: 'edge', label: 'TLS', tone: 'good' }],
            caption: 'handshakes happen close to the user',
          },
          sfx: 'swipe',
          emphasis: ['shorten', 'warm'],
        },
        {
          say: 'Quick check. Same API, connection still open. How many round trips does the next request need?',
          scene: {
            type: 'quiz',
            question: 'Next fetch to the same API, connection still open. Round trips?',
            options: ['All four again', 'Just one'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['open'],
        },
        {
          say: 'Just one. A reused connection skips DNS, TCP and TLS. Only the request itself travels.',
          scene: {
            type: 'quiz',
            question: 'Next fetch to the same API, connection still open. Round trips?',
            options: ['All four again', 'Just one'],
            answer: 1,
            reveal: true,
            explain: 'Reused connection: no DNS, TCP or TLS. Just the request.',
          },
          sfx: 'ding',
          emphasis: ['reused', 'skips'],
        },
        {
          say: 'Remember this. Before the first byte, you pay in round trips. Cut the trips, not just the bytes.',
          scene: {
            type: 'outro',
            points: ['DNS, TCP, TLS run *before* your code', 'Each one costs a round trip', 'Preconnect, use an edge, reuse'],
            tagline: 'Count trips, not bytes.',
          },
          sfx: 'success',
          emphasis: ['trips', 'bytes'],
        },
      ],
    },
    {
      id: 'net-http-versions',
      title: 'HTTP/1.1 vs 2 vs 3',
      beats: [
        {
          say: 'HTTP/2 fixed head-of-line blocking. Then one lost packet brought it back.',
          speak: 'HTTP two fixed head-of-line blocking. Then one lost packet brought it back.',
          scene: {
            type: 'title',
            kicker: 'HTTP/1.1 → 2 → 3',
            title: 'One lost packet stalls *everything*',
            emoji: '🚧',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['lost', 'back'],
        },
        {
          say: 'Open DevTools on an HTTP/1.1 site. Some files say stalled. They are waiting for a free connection.',
          speak: 'Open DevTools on an HTTP one one site. Some files say stalled. They are waiting for a free connection.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Network tab',
              icon: '🛠️',
              items: [
                { id: 'css', label: 'main.css', icon: '🎨', value: '200', tone: 'good' },
                { id: 'js', label: 'app.js', icon: '📜', value: 'loading' },
                { id: 'img', label: 'hero.jpg', icon: '🖼️', value: 'loading' },
                { id: 'font', label: 'font.woff2', icon: '🔤', value: 'stalled', tone: 'bad' },
                { id: 'svg', label: 'icons.svg', icon: '✨', value: 'stalled', tone: 'bad' },
              ],
            },
            caption: 'Chrome opens 6 connections per host',
          },
          sfx: 'swipe',
          emphasis: ['stalled', 'free'],
        },
        {
          say: 'HTTP/1.1 runs one request per connection at a time. A slow one blocks the queue behind it.',
          speak: 'HTTP one one runs one request per connection at a time. A slow one blocks the queue behind it.',
          scene: muxDiagram('h1'),
          sfx: 'swipe',
          emphasis: ['one', 'blocks'],
        },
        {
          say: 'HTTP/2 multiplexes. Every file shares one TCP connection, cut into small frames that take turns.',
          speak: 'HTTP two multiplexes. Every file shares one TCP connection, cut into small frames that take turns.',
          scene: muxDiagram('h2'),
          sfx: 'pop',
          emphasis: ['multiplexes', 'shares'],
        },
        {
          say: 'But TCP hands over bytes strictly in order. Lose one packet, and every file waits for the resend.',
          scene: muxDiagram('lost'),
          sfx: 'error',
          emphasis: ['order', 'every'],
        },
        {
          say: 'Why not fix TCP? It lives inside every operating system, and firewalls expect its exact shape.',
          scene: {
            type: 'list',
            title: 'Why not fix TCP?',
            items: [
              { text: 'Lives in the OS *kernel*', icon: '🧱' },
              { text: 'Firewalls expect its shape', icon: '🧱' },
              { text: 'Changes ship very slowly', icon: '🐌', tone: 'bad' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['fix', 'shape'],
        },
        {
          say: 'So QUIC builds its own streams on top of UDP. A lost packet only stalls the stream it belonged to.',
          scene: {
            type: 'compare',
            title: 'Where streams live',
            left: { title: 'HTTP/2 on TCP', verdict: 'bad', icon: '🚧', items: ['One ordered queue', 'A loss stalls all'] },
            right: { title: 'HTTP/3 on QUIC', verdict: 'ok', icon: '🛣️', items: ['Independent streams', 'A loss stalls one'] },
          },
          sfx: 'swipe',
          emphasis: ['QUIC', 'UDP'],
        },
        {
          say: 'Bonus: QUIC folds encryption into its own handshake. One round trip to connect, instead of two.',
          scene: {
            type: 'stat',
            value: '1',
            unit: 'RTT',
            label: 'QUIC setup, *TLS included*',
            sub: 'TCP plus TLS 1.3 needs 2',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['encryption', 'one'],
        },
        {
          say: 'Quick check. A phone on a flaky network drops one packet. Which version stalls less?',
          scene: {
            type: 'quiz',
            question: 'Flaky phone network, one packet lost. Which stalls less?',
            options: ['HTTP/2', 'HTTP/3'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['flaky'],
        },
        {
          say: 'HTTP/3. Only the stream that lost data waits, and the other files keep flowing.',
          speak: 'HTTP three. Only the stream that lost data waits, and the other files keep flowing.',
          scene: {
            type: 'quiz',
            question: 'Flaky phone network, one packet lost. Which stalls less?',
            options: ['HTTP/2', 'HTTP/3'],
            answer: 1,
            reveal: true,
            explain: 'QUIC streams are independent. Only one file waits.',
          },
          sfx: 'ding',
          emphasis: ['waits', 'flowing'],
        },
        {
          say: 'Remember this. HTTP/2 pushed head-of-line blocking down into TCP. HTTP/3 left TCP to escape it.',
          speak: 'Remember this. HTTP two pushed head-of-line blocking down into TCP. HTTP three left TCP to escape it.',
          scene: {
            type: 'outro',
            points: ['1.1: one request per *connection*', '2: many files, one TCP queue', '3: QUIC streams fail alone'],
            tagline: 'Fix the layer below.',
          },
          sfx: 'success',
          emphasis: ['TCP', 'escape'],
        },
      ],
    },
    {
      id: 'net-http-caching',
      title: 'HTTP caching, done right',
      beats: [
        {
          say: 'The fastest request is the one your browser never sends.',
          scene: {
            type: 'title',
            kicker: 'HTTP caching',
            title: 'Best request: *never sent*',
            emoji: '⚡',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['never'],
        },
        {
          say: 'Look at the response for a hashed bundle. Cache-Control says keep it for a year, it will never change.',
          speak: 'Look at the response for a hashed bundle. Cache control says keep it for a year, it will never change.',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'app.3f9a1c.js',
            code: assetHeaders,
            highlight: [4],
            note: { line: 4, text: '1 year, never revalidate', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['year', 'never'],
        },
        {
          say: 'While a response is fresh, the browser serves it straight from its cache. Nothing leaves the device.',
          scene: {
            type: 'diagram',
            title: 'Fresh: no network',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'page', label: 'Browser', icon: '💻', sub: 'needs app.js', x: 0, y: 0 },
              { id: 'cache', label: 'HTTP cache', icon: '🗄️', sub: 'fresh for a year', x: 0, y: 1.5, active: true, tone: 'good' },
              { id: 'server', label: 'Server', icon: '🖥️', sub: 'never asked', x: 0, y: 3, dim: true },
            ],
            edges: [
              { from: 'page', to: 'cache', both: true, active: true },
              { from: 'cache', to: 'server', dashed: true },
            ],
            packets: [{ from: 'cache', to: 'page', label: 'app.js', tone: 'good' }],
            caption: 'zero round trips',
          },
          sfx: 'swipe',
          emphasis: ['fresh', 'cache'],
        },
        {
          say: "Your HTML can't be cached for a year. It sends no-cache: keep a copy, but check before using it.",
          speak: "Your HTML can't be cached for a year. It sends no cache: keep a copy, but check before using it.",
          scene: {
            type: 'code',
            lang: 'text',
            file: 'index.html',
            code: htmlHeaders,
            highlight: [3],
            note: { line: 3, text: 'keep it, but check first', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['HTML', 'check'],
        },
        {
          say: 'So the browser asks, sending the ETag it holds. If nothing changed, the server replies 304, with no body.',
          speak: 'So the browser asks, sending the E tag it holds. If nothing changed, the server replies three oh four, with no body.',
          scene: {
            type: 'diagram',
            title: 'Stale: ask first',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'page', label: 'Browser', icon: '💻', sub: 'needs index.html', x: 0, y: 0 },
              { id: 'cache', label: 'HTTP cache', icon: '🗄️', sub: 'has "v42", must check', x: 0, y: 1.5, tone: 'warn' },
              { id: 'server', label: 'Server', icon: '🖥️', sub: '304 Not Modified', x: 0, y: 3, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'page', to: 'cache', both: true },
              { from: 'cache', to: 'server', both: true, active: true, label: 'If-None-Match' },
            ],
            packets: [{ from: 'cache', to: 'server', label: 'v42', tone: 'warn' }],
            caption: 'a tiny reply, reuse the copy',
          },
          sfx: 'pop',
          emphasis: ['ETag', 'body'],
        },
        {
          say: 'Careful with the names. No-cache still stores the response. No-store is the one that keeps nothing.',
          speak: 'Careful with the names. No cache still stores the response. No store is the one that keeps nothing.',
          scene: {
            type: 'compare',
            title: 'Confusing names',
            left: { title: 'no-cache', verdict: 'neutral', icon: '🔁', items: ['Stores a copy', 'Checks before reuse'] },
            right: { title: 'no-store', verdict: 'neutral', icon: '🚫', items: ['Stores nothing', 'Full download always'] },
          },
          sfx: 'swipe',
          emphasis: ['stores', 'nothing'],
        },
        {
          say: 'Put them together. The HTML always checks in, and points at hashed files that are cached forever.',
          scene: {
            type: 'tree',
            title: 'The deploy-safe setup',
            root: {
              id: 'html',
              label: 'index.html',
              active: true,
              children: [
                { id: 'js', label: 'app.3f9a1c.js', tone: 'good' },
                { id: 'css', label: 'style.81bd.css', tone: 'good' },
              ],
            },
            caption: 'HTML checks, assets never do',
          },
          sfx: 'swipe',
          emphasis: ['checks', 'forever'],
        },
        {
          say: 'Ship a fix, and the bundle gets a new hash, so a brand new URL. Unchanged files stay cached.',
          scene: {
            type: 'tree',
            title: 'The deploy-safe setup',
            root: {
              id: 'html',
              label: 'index.html',
              children: [
                { id: 'js2', label: 'app.7c2e90.js', active: true, dirty: true },
                { id: 'css', label: 'style.81bd.css', dim: true },
              ],
            },
            caption: 'new name means a new download',
          },
          sfx: 'pop',
          emphasis: ['hash', 'cached'],
        },
        {
          say: 'Quick check. After a deploy, users still run old JavaScript. What is the usual culprit?',
          scene: {
            type: 'quiz',
            question: 'You deployed. Users still run the old JS. Most likely cause?',
            options: ['HTML cached too long', 'Hashed files immutable'],
            answer: 0,
          },
          sfx: 'riser',
          emphasis: ['old'],
        },
        {
          say: 'The HTML was cached too long, so it still points at the old hashed files.',
          scene: {
            type: 'quiz',
            question: 'You deployed. Users still run the old JS. Most likely cause?',
            options: ['HTML cached too long', 'Hashed files immutable'],
            answer: 0,
            reveal: true,
            explain: 'Old HTML points at old hashes. Make the HTML revalidate.',
          },
          sfx: 'ding',
          emphasis: ['HTML', 'old'],
        },
        {
          say: 'Remember this. Cache hashed files forever, and make your HTML check in every time.',
          scene: {
            type: 'outro',
            points: ['Fresh: no request at all', 'Stale: send the ETag, maybe *304*', 'Hash assets, revalidate HTML'],
            tagline: 'New content, new name.',
          },
          sfx: 'success',
          emphasis: ['forever', 'HTML'],
        },
      ],
    },
    {
      id: 'net-cors-preflight',
      title: 'CORS and the preflight',
      beats: [
        {
          say: 'CORS says blocked. Your request probably reached the server anyway.',
          speak: 'Cors says blocked. Your request probably reached the server anyway.',
          scene: {
            type: 'title',
            kicker: 'CORS errors',
            title: 'Blocked? It *already* landed',
            emoji: '🚫',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['blocked', 'reached'],
        },
        {
          say: 'Your page on shop.dev fetches from api.shop.dev. A different host is a different origin, so CORS applies.',
          speak: 'Your page on shop dot dev fetches from api dot shop dot dev. A different host is a different origin, so cors applies.',
          scene: { type: 'code', lang: 'js', file: 'cart.js', code: corsGet, highlight: [3] },
          sfx: 'type',
          emphasis: ['origin'],
        },
        {
          say: 'Then the console shows the famous error. Look at who wrote it: the browser, not your server.',
          scene: {
            type: 'terminal',
            title: 'Console',
            lines: [
              { out: '✕ Blocked by CORS policy', tone: 'bad' },
              { out: "No 'Access-Control-Allow-Origin'", tone: 'muted' },
              { out: 'header on the response', tone: 'muted' },
              { out: 'TypeError: Failed to fetch', tone: 'bad' },
            ],
          },
          sfx: 'error',
          emphasis: ['browser'],
        },
        {
          say: 'Here is the twist. The server got the GET, ran it, and replied. The browser just hid the reply.',
          scene: {
            type: 'diagram',
            title: 'Who blocks?',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'code', label: 'Your code', icon: '📜', sub: 'gets only an error', x: 0, y: 0, tone: 'bad' },
              { id: 'browser', label: 'Browser', icon: '🧭', sub: 'no allow header? hide it', x: 0, y: 1.5, active: true },
              { id: 'api', label: 'api.shop.dev', icon: '🖥️', sub: 'ran it, replied 200', x: 0, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'code', to: 'browser', dashed: true, tone: 'bad' },
              { from: 'browser', to: 'api', both: true, active: true },
            ],
            packets: [{ from: 'api', to: 'browser', label: '200', tone: 'good' }],
            caption: 'the browser is the gatekeeper',
          },
          sfx: 'swipe',
          emphasis: ['twist', 'hid'],
        },
        {
          say: "Now send JSON. That content type isn't on the browser's safe list, so it asks permission first.",
          scene: {
            type: 'code',
            lang: 'js',
            file: 'cart.js',
            code: corsPost,
            added: [5],
            highlight: [7, 8],
            note: { line: 8, text: 'not on the safe list', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['JSON', 'permission'],
        },
        {
          say: 'That permission check is the preflight: an OPTIONS request, sent before your real one.',
          scene: {
            type: 'timeline',
            title: 'Preflight first',
            steps: [
              { label: 'OPTIONS', sub: 'may I POST JSON?', icon: '🙋' },
              { label: 'Server answers', sub: 'allowed origins, headers', icon: '📋' },
              { label: 'Real POST', sub: 'only if allowed', icon: '📨', tone: 'accent' },
            ],
            active: 0,
          },
          sfx: 'swipe',
          emphasis: ['preflight', 'before'],
        },
        {
          say: 'The server must reply with matching Access-Control-Allow headers. Only then does the real POST go out.',
          speak: 'The server must reply with matching access control allow headers. Only then does the real post go out.',
          scene: {
            type: 'code',
            lang: 'text',
            file: 'preflight',
            code: preflight,
            highlight: [7, 8, 9, 10],
            note: { line: 10, text: 'must match your request', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['matching', 'then'],
        },
        {
          say: 'Quick check. The preflight fails. Did your POST ever reach the server?',
          speak: 'Quick check. The preflight fails. Did your post ever reach the server?',
          scene: {
            type: 'quiz',
            question: 'The preflight fails. Did your POST reach the server?',
            options: ['Yes, reply hidden', 'No, never sent'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['fails'],
        },
        {
          say: 'No. A failed preflight means the real request never leaves. Simple GETs are the ones that still land.',
          scene: {
            type: 'quiz',
            question: 'The preflight fails. Did your POST reach the server?',
            options: ['Yes, reply hidden', 'No, never sent'],
            answer: 1,
            reveal: true,
            explain: 'Failed preflight: the real request is never sent.',
          },
          sfx: 'ding',
          emphasis: ['never', 'land'],
        },
        {
          say: "Remember this. CORS decides who can read a response. It doesn't protect your server, so check every request yourself.",
          speak: "Remember this. Cors decides who can read a response. It doesn't protect your server, so check every request yourself.",
          scene: {
            type: 'outro',
            points: ['The *browser* blocks, not the server', 'Simple requests still reach it', 'JSON or custom headers: preflight'],
            tagline: 'CORS guards reading.',
          },
          sfx: 'success',
          emphasis: ['read', 'protect'],
        },
      ],
    },
  ],
};
