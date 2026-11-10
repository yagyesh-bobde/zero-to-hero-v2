import type { Series } from '../types';

// Case studies from public engineering write-ups. Every number here comes from the
// company's own post (or a case study reviewed by its engineers); see the narration.

const tabsJs = `// tabs.js, no framework
const tabs = document
  .querySelectorAll('[role=tab]');

for (const t of tabs) {
  t.addEventListener('click', () => {
    for (const o of tabs) {
      o.setAttribute('aria-selected',
        String(o === t));
    }
  });
}`;

const gpResponse = `{
  "screens": [{
    "id": "ROOT",
    "layout": {
      "compact": ["title", "photos"],
      "wide": ["photos", "title"]
    }
  }],
  "sections": [{
    "id": "title",
    "type": "TITLE",
    "data": { "title": "Cozy loft" }
  }]
}`;

const coalesce = `const inFlight = new Map();

function getMessages(channelId) {
  let query = inFlight.get(channelId);
  if (!query) {
    query = db.fetch(channelId)
      .finally(() =>
        inFlight.delete(channelId));
    inFlight.set(channelId, query);
  }
  return query;
}`;

const figmaDoc = `// the whole document
Map<ObjectID, Map<Property, Value>>

doc.get('rect-1');
// {
//   x: 120,
//   fill: 'blue',
//   parent: 'frame-1',
// }`;

const uberMap = `const tti = timeToInteraction(
  window.performance,
);

if (tti < FAST_ENOUGH) {
  loadInteractiveMap();
} else {
  hideMap();
}`;

const listingItems = (photosFirst: boolean) => {
  const title = { id: 'title', label: 'Cozy loft', icon: '🏠', sub: 'Lisbon · 2 guests' };
  const photos = { id: 'photos', label: 'Photos', icon: '🖼️', sub: '24 photos' };
  return [
    ...(photosFirst ? [photos, title] : [title, photos]),
    { id: 'amenities', label: 'Amenities', icon: '📶', sub: 'Wifi, kitchen' },
    { id: 'reviews', label: 'Reviews', icon: '⭐', value: '4.9' },
  ];
};

export const series: Series = {
  id: 'eng-cases-global',
  title: 'Case studies: global',
  emoji: '🌍',
  color: '#0a84ff',
  order: 9,
  blurb: 'Real problems at Netflix, Airbnb, Discord, Figma, Uber and Slack, and how they fixed them.',
  reels: [
    // ───────────────────────── Netflix ─────────────────────────
    {
      id: 'world-netflix-landing',
      title: 'Netflix: less JavaScript, faster sign-up',
      beats: [
        {
          say: 'Netflix made its landing page faster by removing React from the browser.',
          scene: {
            type: 'title',
            kicker: 'Case study: Netflix',
            title: 'Faster with *less* React',
            sub: 'React stayed on the server',
            emoji: '🎬',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['faster', 'removing'],
        },
        {
          say: 'In a case study written with Netflix engineers, the logged-out landing page started with 300kB of JavaScript.',
          speak: 'In a case study written with Netflix engineers, the logged-out landing page started with three hundred kilobytes of JavaScript.',
          scene: {
            type: 'stat',
            value: '300',
            unit: 'kB',
            label: 'of JavaScript on the *landing page*',
            sub: 'the page where you sign up or sign in',
            tone: 'warn',
          },
          emphasis: ['logged-out', 'JavaScript'],
        },
        {
          say: 'Some was data to hydrate React, meaning wire it up to HTML the server already sent.',
          scene: {
            type: 'list',
            title: 'What those 300kB were',
            items: [
              { text: 'React', icon: '⚛️' },
              { text: 'Libraries like Lodash', icon: '📚' },
              { text: 'App code', icon: '🧩' },
              { text: '*Hydration* data', icon: '💧', sub: 'state to wire up server HTML' },
            ],
            active: 3,
          },
          sfx: 'pop',
          emphasis: ['hydrate', 'server'],
        },
        {
          say: 'So the team turned JavaScript off, and checked which parts of the page still worked.',
          scene: {
            type: 'phone',
            os: 'ios',
            caption: 'JavaScript off: what still works?',
            screen: {
              kind: 'app',
              title: 'Landing page',
              icon: '🎬',
              items: [
                { id: 'tabs', label: 'Feature tabs', icon: '🗂️', sub: 'needs JS' },
                { id: 'lang', label: 'Language switcher', icon: '🌐', sub: 'needs JS' },
                { id: 'cookie', label: 'Cookie banner', icon: '🍪', sub: 'needs JS' },
                { id: 'log', label: 'Logging and metrics', icon: '📈', sub: 'needs JS' },
              ],
              button: 'Get started',
            },
          },
          sfx: 'swipe',
          emphasis: ['off', 'worked'],
        },
        {
          say: 'The few interactive bits were rebuilt in plain JavaScript. The language switcher took under 300 lines.',
          speak: 'The few interactive bits were rebuilt in plain JavaScript. The language switcher took under three hundred lines.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'tabs.js',
            code: tabsJs,
            highlight: [[5, 12]],
            note: { line: 12, text: 'a click handler, no framework', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['plain', 'switcher'],
        },
        {
          say: 'Dropping React, some libraries and app code cut over 200kB. React itself was only 45kB of that.',
          speak: 'Dropping React, some libraries and app code cut over two hundred kilobytes. React itself was only forty five kilobytes of that.',
          scene: {
            type: 'stat',
            value: '200+',
            unit: 'kB',
            label: 'of JavaScript *removed*',
            sub: 'React alone was just 45kB of it',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['200kB', '45kB'],
        },
        {
          say: 'Time to Interactive, or TTI, is when the page reliably responds. It dropped by over half.',
          speak: 'Time to Interactive, or T T I, is when the page reliably responds. It dropped by over half.',
          scene: {
            type: 'compare',
            title: 'Logged-out landing page',
            left: { title: 'Before', verdict: 'bad', items: ['300kB of JavaScript', 'Hydrates React'] },
            right: { title: 'After', verdict: 'ok', items: ['Server-rendered HTML', 'A bit of plain JS', 'TTI cut by over half'] },
          },
          sfx: 'swipe',
          emphasis: ['TTI', 'half'],
        },
        {
          say: 'Then the clever part. While you read the landing page, it prefetches the JavaScript and CSS for sign-up.',
          speak: 'Then the clever part. While you read the landing page, it prefetches the JavaScript and C S S for sign-up.',
          scene: {
            type: 'diagram',
            title: 'Use the idle seconds',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'landing', label: 'Landing page', icon: '📄', sub: 'server HTML + plain JS', x: 0, y: 0, active: true },
              { id: 'signup', label: 'Sign-up flow', icon: '⚛️', sub: 'React single-page app', x: 0, y: 2, dim: true },
            ],
            edges: [{ from: 'landing', to: 'signup', label: 'prefetch JS, CSS', active: true }],
            packets: [{ from: 'landing', to: 'signup', label: 'JS', tone: 'info' }],
            caption: 'link rel=prefetch plus XHR prefetching',
          },
          sfx: 'swipe',
          emphasis: ['prefetches', 'sign-up'],
        },
        {
          say: "So React arrives before you need it. The next page's TTI fell 30 percent, without slowing the landing page.",
          speak: "So React arrives before you need it. The next page's T T I fell thirty percent, without slowing the landing page.",
          scene: {
            type: 'diagram',
            title: 'Use the idle seconds',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'landing', label: 'Landing page', icon: '📄', sub: 'server HTML + plain JS', x: 0, y: 0 },
              { id: 'signup', label: 'Sign-up flow', icon: '⚛️', sub: 'React single-page app', x: 0, y: 2, active: true, tone: 'good' },
            ],
            edges: [{ from: 'landing', to: 'signup', label: 'already cached', tone: 'good' }],
            caption: 'next page TTI: 30% lower',
          },
          sfx: 'ding',
          emphasis: ['before', 'next'],
        },
        {
          say: 'Remember this. A landing page needs HTML, not a framework. Keep React on the server, and prefetch it.',
          scene: {
            type: 'outro',
            points: ['Turn JS off and see what breaks', 'Keep React on the *server*', 'Prefetch what the next page needs'],
            tagline: 'Ship HTML first.',
          },
          sfx: 'success',
          emphasis: ['HTML', 'prefetch'],
        },
      ],
    },

    // ───────────────────────── Airbnb ─────────────────────────
    {
      id: 'world-airbnb-sdui',
      title: 'Airbnb: the server sends the screen',
      beats: [
        {
          say: 'What if your backend sent the whole screen, not just the data?',
          scene: {
            type: 'title',
            kicker: 'Case study: Airbnb',
            title: 'The server sends the *screen*',
            emoji: '🏠',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['whole', 'screen'],
        },
        {
          say: "Airbnb's tech blog describes the old pain. Web, iOS and Android each built their own listing page logic.",
          speak: "Airbnb's tech blog describes the old pain. Web, i O S and Android each built their own listing page logic.",
          scene: {
            type: 'phone',
            os: 'ios',
            caption: 'built three times: web, iOS, Android',
            screen: { kind: 'app', title: 'Listing', icon: '🏠', items: listingItems(false), button: 'Reserve' },
          },
          sfx: 'swipe',
          emphasis: ['own', 'logic'],
        },
        {
          say: 'So the three apps drifted apart, and every new listing feature needed a new mobile app release.',
          scene: {
            type: 'list',
            title: 'The old way hurt',
            items: [
              { text: 'Listing logic per client', icon: '🧱' },
              { text: 'Clients drift apart', icon: '↔️' },
              { text: 'New feature, new *app release*', icon: '📦', tone: 'bad' },
            ],
            active: 2,
          },
          sfx: 'pop',
          emphasis: ['drifted', 'release'],
        },
        {
          say: 'Their fix is server-driven UI, called Ghost, for guest and host. One response holds layout, sections and actions.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'simplified response',
            code: gpResponse,
            highlight: [[4, 7]],
            note: { line: 7, text: 'layout per screen size', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['server-driven', 'Ghost'],
        },
        {
          say: 'A section is a ready-to-show chunk, already translated and formatted. The layout just places sections by ID.',
          speak: 'A section is a ready-to-show chunk, already translated and formatted. The layout just places sections by I D.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'simplified response',
            code: gpResponse,
            highlight: [[9, 12]],
            note: { line: 12, text: 'translated, formatted data', tone: 'accent' },
          },
          sfx: 'click',
          emphasis: ['section', 'places'],
        },
        {
          say: 'One shared GraphQL schema feeds all three apps, and each renders sections with its own native components.',
          scene: {
            type: 'diagram',
            title: 'One schema, three apps',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'api', label: 'Backend', icon: '🧠', sub: 'one GraphQL schema', x: 1, y: 0, active: true },
              { id: 'web', label: 'Web', icon: '🌐', sub: 'TypeScript', x: 0, y: 2 },
              { id: 'ios', label: 'iOS', icon: '🍎', sub: 'Swift', x: 1, y: 2 },
              { id: 'android', label: 'Android', icon: '🤖', sub: 'Kotlin', x: 2, y: 2 },
            ],
            edges: [
              { from: 'api', to: 'web' },
              { from: 'api', to: 'ios' },
              { from: 'api', to: 'android' },
            ],
            packets: [
              { from: 'api', to: 'web', label: '{}', tone: 'info' },
              { from: 'api', to: 'android', label: '{}', tone: 'info' },
            ],
            caption: 'same sections, native components',
          },
          sfx: 'swipe',
          emphasis: ['GraphQL', 'native'],
        },
        {
          say: 'Want photos above the title? Change the response, and the app reorders its sections. No new release.',
          scene: {
            type: 'phone',
            os: 'ios',
            caption: 'new order came from the server',
            screen: { kind: 'app', title: 'Listing', icon: '🏠', items: listingItems(true), button: 'Reserve' },
          },
          sfx: 'swipe',
          emphasis: ['response', 'reorders'],
        },
        {
          say: 'The catch: the app must already know each section component. A brand-new section type still needs client work.',
          scene: {
            type: 'compare',
            title: 'What ships without a release?',
            left: { title: 'Server only', verdict: 'ok', items: ['Section order', 'Layouts', 'Text and data'] },
            right: { title: 'Needs the app', verdict: 'bad', items: ['New section types', 'New renderers'] },
          },
          emphasis: ['catch', 'brand-new'],
        },
        {
          say: 'About a year in, a majority of their most used features were built on it, including checkout.',
          scene: {
            type: 'stat',
            value: '~1',
            unit: 'year',
            label: 'in: most top *features* on it',
            sub: 'search, listing pages, checkout',
            tone: 'accent',
          },
          sfx: 'ding',
          emphasis: ['majority', 'checkout'],
        },
        {
          say: 'Remember this. Send the screen as data. Layout changes become backend deploys, not app releases.',
          scene: {
            type: 'outro',
            points: ['Server sends *sections* + layout', 'Apps render them natively', 'New section types still need code'],
            tagline: 'Ship screens as data.',
          },
          sfx: 'success',
          emphasis: ['data', 'deploys'],
        },
      ],
    },

    // ───────────────────────── Discord ─────────────────────────
    {
      id: 'world-discord-messages',
      title: 'Discord: trillions of messages',
      beats: [
        {
          say: "One big announcement could slow down Discord's whole message database.",
          speak: "One big announcement could slow down Discord's whole message database.",
          scene: {
            type: 'title',
            kicker: 'Case study: Discord',
            title: 'Beware the *hot* partition',
            emoji: '🔥',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['announcement', 'whole'],
        },
        {
          say: "Discord's engineering blog says that by early 2022, trillions of messages lived on 177 Cassandra nodes.",
          speak: "Discord's engineering blog says that by early twenty twenty-two, trillions of messages lived on a hundred seventy-seven Cassandra nodes.",
          scene: {
            type: 'stat',
            value: '177',
            unit: 'nodes',
            label: 'of *Cassandra*, early 2022',
            sub: 'up from 12 nodes in 2017',
            tone: 'warn',
          },
          emphasis: ['trillions', 'Cassandra'],
        },
        {
          say: "A partition is data stored together, like a slice of one channel's messages. An @everyone ping sends crowds to one.",
          speak: "A partition is data stored together, like a slice of one channel's messages. An at everyone ping sends crowds to one.",
          scene: {
            type: 'phone',
            os: 'android',
            caption: 'everyone reads the same partition',
            screen: {
              kind: 'app',
              title: '#announcements',
              icon: '📣',
              items: [
                { id: 'a1', label: '@everyone Big update is live!', icon: '📣', tone: 'warn' },
                { id: 'a2', label: 'So many readers', icon: '👀', sub: 'all loading this channel' },
                { id: 'a3', label: 'Same rows, same time', icon: '🔥', tone: 'bad' },
              ],
            },
          },
          sfx: 'swipe',
          emphasis: ['partition', 'crowds'],
        },
        {
          say: 'The blog says one hot partition often hurt latency across the whole cluster. So they added data services.',
          scene: {
            type: 'diagram',
            title: 'A layer in front',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'api', label: 'API monolith', icon: '🏢', x: 0, y: 0 },
              { id: 'svc', label: 'Data service', icon: '🦀', sub: 'Rust, no business logic', x: 0, y: 1, active: true },
              { id: 'db', label: 'Database', icon: '🗄️', sub: 'Cassandra cluster', x: 0, y: 2 },
            ],
            edges: [
              { from: 'api', to: 'svc' },
              { from: 'svc', to: 'db' },
            ],
            caption: 'about one gRPC endpoint per query',
          },
          sfx: 'swipe',
          emphasis: ['latency', 'services'],
        },
        {
          say: 'If many users ask for the same row at once, the data service queries the database only once.',
          scene: {
            type: 'diagram',
            title: 'Request coalescing',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'u1', label: 'User', icon: '👤', x: 0, y: 0 },
              { id: 'u2', label: 'User', icon: '👤', x: 1, y: 0 },
              { id: 'u3', label: 'User', icon: '👤', x: 2, y: 0 },
              { id: 'svc', label: 'Data service', icon: '🦀', sub: 'same channel', x: 1, y: 1.5, active: true },
              { id: 'db', label: 'Database', icon: '🗄️', sub: '1 query', x: 1, y: 3 },
            ],
            edges: [
              { from: 'u1', to: 'svc' },
              { from: 'u2', to: 'svc' },
              { from: 'u3', to: 'svc' },
              { from: 'svc', to: 'db', active: true },
            ],
            packets: [
              { from: 'u1', to: 'svc', tone: 'info' },
              { from: 'u3', to: 'svc', tone: 'info' },
              { from: 'svc', to: 'db', label: '1', tone: 'good' },
            ],
            caption: 'routed by channel ID to one instance',
          },
          sfx: 'pop',
          emphasis: ['same', 'once'],
        },
        {
          say: "Here's the idea in TypeScript. The first request starts the query, and later ones share it.",
          speak: "Here's the idea in TypeScript. The first request starts the query, and later ones share it.",
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'coalesce.ts',
            code: coalesce,
            highlight: [[5, 9]],
            note: { line: 12, text: 'callers share one promise', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['first', 'share'],
        },
        {
          say: 'Then they moved to ScyllaDB, a Cassandra-compatible database written in C++, with no garbage collector.',
          speak: 'Then they moved to Scylla D B, a Cassandra-compatible database written in C plus plus, with no garbage collector.',
          scene: {
            type: 'compare',
            title: 'May 2022 switch',
            left: { title: 'Cassandra', verdict: 'bad', items: ['177 nodes', '4 TB each, on average', 'JVM GC tuning'] },
            right: { title: 'ScyllaDB', verdict: 'ok', items: ['72 nodes', '9 TB each', 'C++, no GC'] },
          },
          sfx: 'swipe',
          emphasis: ['ScyllaDB', 'garbage'],
        },
        {
          say: 'P99 is the time 99 of 100 requests beat. Old message fetches went from 40–125 milliseconds to 15.',
          speak: 'P ninety-nine is the time ninety-nine of a hundred requests beat. Old message fetches went from forty to a hundred twenty-five milliseconds, to fifteen.',
          scene: {
            type: 'stat',
            value: '15',
            unit: 'ms',
            label: 'p99 to fetch *old messages*',
            sub: 'was 40–125ms on Cassandra',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['P99', '15'],
        },
        {
          say: 'Quick check. After all that, are hot partitions gone for good?',
          scene: {
            type: 'quiz',
            question: 'After ScyllaDB and data services, are hot partitions gone?',
            options: ['Yes, solved', 'No, they still happen'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['gone'],
        },
        {
          say: 'No. The blog says hot partitions still happen, just less often.',
          scene: {
            type: 'quiz',
            question: 'After ScyllaDB and data services, are hot partitions gone?',
            options: ['Yes, solved', 'No, they still happen'],
            answer: 1,
            reveal: true,
            explain: 'Coalescing cuts duplicate reads; hot spots can still form.',
          },
          sfx: 'ding',
          emphasis: ['still'],
        },
        {
          say: 'Remember this. Before buying a faster database, stop asking it the same question many times at once.',
          scene: {
            type: 'outro',
            points: ['One hot partition slows the cluster', '*Coalesce* identical reads', 'Route by key to one instance'],
            tagline: 'Ask once, share the answer.',
          },
          sfx: 'success',
          emphasis: ['same', 'once'],
        },
      ],
    },

    // ───────────────────────── Figma ─────────────────────────
    {
      id: 'world-figma-multiplayer',
      title: 'Figma: multiplayer without OT',
      beats: [
        {
          say: 'Two people change the same shape at once. Who wins in Figma?',
          scene: {
            type: 'title',
            kicker: 'Case study: Figma',
            title: 'Two cursors, *one* shape',
            emoji: '🎨',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['same', 'wins'],
        },
        {
          say: "Figma's blog explains it. Each file gets its own server process, and browsers connect over WebSockets.",
          scene: {
            type: 'diagram',
            title: 'One process per file',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'alice', label: 'Alice', icon: '🧑‍🎨', sub: 'browser', x: 0, y: 0 },
              { id: 'bob', label: 'Bob', icon: '🧑‍💻', sub: 'browser', x: 2, y: 0 },
              { id: 'server', label: 'Server', icon: '🖥️', sub: 'one per file', x: 1, y: 2, active: true },
            ],
            edges: [
              { from: 'alice', to: 'server', both: true },
              { from: 'bob', to: 'server', both: true },
            ],
            packets: [
              { from: 'alice', to: 'server', tone: 'info' },
              { from: 'bob', to: 'server', tone: 'warn' },
            ],
            caption: 'WebSockets both ways',
          },
          sfx: 'swipe',
          emphasis: ['process', 'WebSockets'],
        },
        {
          say: 'The document is a tree of objects, stored as a two-level map: object, then property, then value.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'document.ts',
            code: figmaDoc,
            highlight: [2],
            note: { line: 2, text: 'object → property → value', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['tree', 'two-level'],
        },
        {
          say: "They skipped operational transforms, or OT, which rewrite edits against each other. Figma found them too complex.",
          speak: "They skipped operational transforms, or O T, which rewrite edits against each other. Figma found them too complex.",
          scene: {
            type: 'compare',
            title: 'Why not OT?',
            left: { title: 'OT', verdict: 'bad', items: ['Rewrites every edit', 'Built for text', 'Hard to get right'] },
            right: { title: 'Figma', verdict: 'ok', items: ['Server picks order', 'Values per property', 'Quick to ship'] },
          },
          sfx: 'swipe',
          emphasis: ['OT', 'complex'],
        },
        {
          say: 'It borrows ideas from CRDTs, data types built to merge without a central server. Figma has one.',
          speak: 'It borrows ideas from C R D Ts, data types built to merge without a central server. Figma has one.',
          scene: {
            type: 'diagram',
            title: 'One process per file',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'alice', label: 'Alice', icon: '🧑‍🎨', sub: 'browser', x: 0, y: 0, dim: true },
              { id: 'bob', label: 'Bob', icon: '🧑‍💻', sub: 'browser', x: 2, y: 0, dim: true },
              { id: 'server', label: 'Server', icon: '👑', sub: 'central authority', x: 1, y: 2, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'alice', to: 'server', both: true },
              { from: 'bob', to: 'server', both: true },
            ],
            caption: 'inspired by CRDTs, not true CRDTs',
          },
          sfx: 'click',
          emphasis: ['CRDTs', 'central'],
        },
        {
          say: 'If both change the same property, the last value to reach the server wins. No timestamps, just arrival order.',
          scene: {
            type: 'timeline',
            title: 'Same property, same object',
            active: 2,
            steps: [
              { label: 'Alice: fill red', icon: '🟥', sub: 'reaches server 1st' },
              { label: 'Bob: fill blue', icon: '🟦', sub: 'reaches server 2nd' },
              { label: 'Fill is blue', icon: '✅', tone: 'good', sub: 'last writer wins' },
            ],
          },
          sfx: 'swipe',
          emphasis: ['property', 'arrival'],
        },
        {
          say: "Different properties never clash. But two people editing one text box won't merge; one value wins.",
          scene: {
            type: 'compare',
            title: 'What counts as a conflict',
            left: { title: 'No conflict', verdict: 'ok', items: ['Alice: move', 'Bob: recolor', 'Both stay'] },
            right: { title: 'Conflict', verdict: 'bad', items: ['Same text box', 'One value wins', 'No text merge'] },
          },
          sfx: 'swipe',
          emphasis: ['clash', 'merge'],
        },
        {
          say: "Your edits show instantly, before the server acknowledges them. Then Bob's older red arrives. What happens?",
          scene: {
            type: 'quiz',
            question: "You set fill to blue. Before it's acked, Bob's red arrives. Then?",
            options: ['Flash red, then blue', 'Ignore red, stay blue'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['instantly', 'acknowledges'],
        },
        {
          say: 'Figma drops incoming changes that clash with your unacknowledged ones. So your screen never flickers back to red.',
          scene: {
            type: 'quiz',
            question: "You set fill to blue. Before it's acked, Bob's red arrives. Then?",
            options: ['Flash red, then blue', 'Ignore red, stay blue'],
            answer: 1,
            reveal: true,
            explain: 'Pending local edits win on your screen until the server acks.',
          },
          sfx: 'ding',
          emphasis: ['drops', 'flickers'],
        },
        {
          say: 'Remember this. With a central server, skip fancy merging. Let the server order edits, one property at a time.',
          scene: {
            type: 'outro',
            points: ['Doc is object → property → value', 'Server order picks the *winner*', 'Your pending edits win locally'],
            tagline: 'Order beats cleverness.',
          },
          sfx: 'success',
          emphasis: ['central', 'order'],
        },
      ],
    },

    // ───────────────────────── Uber ─────────────────────────
    {
      id: 'world-uber-mpwa',
      title: 'Uber: a ride app in 50kB',
      beats: [
        {
          say: "Uber's core ride request web app fits in just 50kB.",
          speak: "Uber's core ride request web app fits in just fifty kilobytes.",
          scene: {
            type: 'title',
            kicker: 'Case study: Uber',
            title: 'A ride app in *50kB*',
            sub: 'gzipped and minified',
            emoji: '🚗',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['core', '50kB'],
        },
        {
          say: "Uber's engineering blog describes m.uber, a web app built for the global market, even on slow 2G networks.",
          speak: "Uber's engineering blog describes m dot uber, a web app built for the global market, even on slow two G networks.",
          scene: {
            type: 'phone',
            os: 'android',
            caption: 'm.uber on a slow 2G network',
            screen: {
              kind: 'app',
              title: 'm.uber',
              icon: '🚗',
              items: [
                { id: 'pickup', label: 'Pickup', icon: '📍', sub: 'Current location' },
                { id: 'drop', label: 'Where to?', icon: '🏁', sub: 'Airport, Terminal 2' },
                { id: 'net', label: 'Network', icon: '📶', value: '2G', tone: 'warn' },
              ],
              button: 'Request ride',
            },
          },
          sfx: 'swipe',
          emphasis: ['global', '2G'],
        },
        {
          say: "On typical 2G, that's a three second time to interaction, the moment you can actually use it.",
          speak: "On typical two G, that's a three second time to interaction, the moment you can actually use it.",
          scene: {
            type: 'stat',
            value: '3',
            unit: 's',
            label: 'to interaction on *2G*',
            sub: '2G here: 250kB/s, 300ms latency',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['three', 'use'],
        },
        {
          say: 'First pick: Preact, a tiny React-like library, at 3kB versus React at 45kB.',
          speak: 'First pick: Preact, a tiny React-like library, at three kilobytes versus React at forty five kilobytes.',
          scene: {
            type: 'compare',
            title: 'Gzipped and minified',
            left: { title: 'React', verdict: 'bad', items: ['45kB', "Uber's usual stack"] },
            right: { title: 'Preact', verdict: 'ok', items: ['3kB', 'Chosen for m.uber'] },
          },
          sfx: 'swipe',
          emphasis: ['Preact', '3kB'],
        },
        {
          say: 'Then every byte had to earn its place. Preact renders on the server first, and rare screens load later.',
          scene: {
            type: 'list',
            title: 'Spend the budget on purpose',
            items: [
              { text: 'Server-render first', icon: '🖥️', sub: 'state and markup inlined' },
              { text: 'Split rare screens', icon: '✂️', sub: 'settings loads on demand' },
              { text: 'No custom fonts', icon: '🔤' },
              { text: 'Heavy data work on the server', icon: '🏋️' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['byte', 'server'],
        },
        {
          say: 'Even the logo shrank, from a 7.4kB PNG to a 500 byte tuned SVG.',
          speak: 'Even the logo shrank, from a seven point four kilobyte P N G to a five hundred byte tuned S V G.',
          scene: {
            type: 'stat',
            value: '500',
            unit: 'bytes',
            label: 'logo as a tuned *SVG*',
            sub: 'it was 7.4kB as a PNG',
            tone: 'accent',
          },
          sfx: 'ding',
          emphasis: ['logo', 'SVG'],
        },
        {
          say: 'A service worker, a script between page and network, caches the HTML and bundles, so the app survives a dropped signal.',
          scene: {
            type: 'diagram',
            title: 'Survive a dropped signal',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'page', label: 'Page', icon: '📱', x: 1, y: 0 },
              { id: 'sw', label: 'Service worker', icon: '⚙️', x: 1, y: 1.5, active: true },
              { id: 'net', label: 'Network', icon: '📶', sub: 'dropped', x: 0, y: 3, tone: 'bad', dim: true },
              { id: 'cache', label: 'Cache', icon: '💾', sub: 'HTML + JS', x: 2, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'page', to: 'sw', both: true },
              { from: 'sw', to: 'net', dashed: true, tone: 'bad' },
              { from: 'cache', to: 'sw', active: true },
            ],
            packets: [{ from: 'cache', to: 'sw', label: 'HTML', tone: 'good' }],
            caption: 'cached HTML and JavaScript bundles',
          },
          sfx: 'swipe',
          emphasis: ['service', 'caches'],
        },
        {
          say: 'Even the map is optional. If the page was slow to become interactive, the heavy map stays hidden.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'map.js',
            code: uberMap,
            highlight: [[5, 9]],
            note: { line: 9, text: 'slow start? skip the map', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['optional', 'hidden'],
        },
        {
          say: 'Remember this. Set a hard byte budget, then spend it on purpose, starting with the framework.',
          scene: {
            type: 'outro',
            points: ['Pick the smallest *framework*', 'Cache with a service worker', 'Load extras only when fast'],
            tagline: 'Every byte earns its place.',
          },
          sfx: 'success',
          emphasis: ['budget', 'purpose'],
        },
      ],
    },

    // ───────────────────────── Slack ─────────────────────────
    {
      id: 'world-slack-flannel',
      title: 'Slack: stop loading everything',
      beats: [
        {
          say: "Slack used to download your whole team at startup. That didn't scale.",
          scene: {
            type: 'title',
            kicker: 'Case study: Slack',
            title: 'Stop loading *everything* at boot',
            emoji: '💬',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['whole', 'startup'],
        },
        {
          say: "Slack's engineering blog describes the old boot call. One request returned users, channels, members, messages and DMs.",
          speak: "Slack's engineering blog describes the old boot call. One request returned users, channels, members, messages and D Ms.",
          scene: {
            type: 'terminal',
            title: 'The old boot call',
            lines: [
              { cmd: 'rtm.start' },
              { out: 'users: [ every user ]', tone: 'warn' },
              { out: 'channels + members: [ ... ]' },
              { out: 'latest messages, DMs, group DMs' },
              { out: 'then: open a WebSocket', tone: 'muted' },
            ],
          },
          sfx: 'type',
          emphasis: ['users', 'DMs'],
        },
        {
          say: 'Fine for small teams. Past tens of thousands of users, connecting got slow and memory use got large.',
          scene: {
            type: 'list',
            title: 'Huge teams felt it',
            items: [
              { text: 'Slow to connect', icon: '🐢', tone: 'bad' },
              { text: 'Large memory footprint', icon: '🧠' },
              { text: 'Expensive reconnects', icon: '🔁' },
              { text: 'Reconnection storms', icon: '🌪️', sub: 'lots of clients at once' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['thousands', 'slow'],
        },
        {
          say: 'The new idea: load minimal data upfront, and load user and channel data only as needed.',
          scene: {
            type: 'compare',
            title: 'At startup',
            left: { title: 'Before', verdict: 'bad', items: ['Full team snapshot', 'Grows with the team'] },
            right: { title: 'After', verdict: 'ok', items: ['Minimal data upfront', 'The rest on demand'] },
          },
          sfx: 'swipe',
          emphasis: ['minimal', 'needed'],
        },
        {
          say: "That's Flannel, an edge cache. It runs in edge locations near users, and holds a WebSocket to Slack's main servers.",
          scene: {
            type: 'diagram',
            title: 'Flannel at the edge',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'you', label: 'You', icon: '💻', x: 0, y: 0 },
              { id: 'mate', label: 'Teammate', icon: '📱', x: 2, y: 0 },
              { id: 'flannel', label: 'Flannel', icon: '⚡', sub: 'edge cache', x: 1, y: 1.5, active: true },
              { id: 'main', label: 'Slack servers', icon: '🏢', sub: 'main AWS region', x: 1, y: 3 },
            ],
            edges: [
              { from: 'you', to: 'flannel' },
              { from: 'mate', to: 'flannel' },
              { from: 'flannel', to: 'main', both: true },
            ],
            caption: 'edge = servers close to you',
          },
          sfx: 'swipe',
          emphasis: ['Flannel', 'edge'],
        },
        {
          say: 'Teammates in the same region share one Flannel instance, so even a reconnect is served straight from its cache.',
          scene: {
            type: 'diagram',
            title: 'Flannel at the edge',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'you', label: 'You', icon: '💻', x: 0, y: 0, active: true },
              { id: 'mate', label: 'Teammate', icon: '📱', x: 2, y: 0, active: true },
              { id: 'flannel', label: 'Flannel', icon: '⚡', sub: 'same instance', x: 1, y: 1.5, tone: 'good' },
              { id: 'main', label: 'Slack servers', icon: '🏢', sub: 'main AWS region', x: 1, y: 3, dim: true },
            ],
            edges: [
              { from: 'flannel', to: 'you', active: true },
              { from: 'flannel', to: 'mate', active: true },
              { from: 'flannel', to: 'main', both: true },
            ],
            packets: [
              { from: 'flannel', to: 'you', tone: 'good' },
              { from: 'flannel', to: 'mate', tone: 'good' },
            ],
            caption: 'reconnects served from the cache',
          },
          sfx: 'click',
          emphasis: ['share', 'reconnect'],
        },
        {
          say: "It even pushes ahead. When someone mentions a user you haven't loaded, Flannel sends that user first.",
          scene: {
            type: 'phone',
            os: 'ios',
            caption: 'user data lands before the message',
            screen: {
              kind: 'app',
              title: '#launch',
              icon: '💬',
              items: [
                { id: 'm1', label: 'Ravi', icon: '🧑', sub: 'Shipping at 5pm' },
                { id: 'm2', label: 'Ana', icon: '👩', sub: '@Maya can you review?' },
              ],
              toast: "Maya's profile arrived first",
            },
          },
          sfx: 'swipe',
          emphasis: ['pushes', 'first'],
        },
        {
          say: 'The result: boot data got 7 times smaller on a 1,500 user team, and 44 times smaller on 32,000 users.',
          speak: 'The result: boot data got seven times smaller on a fifteen hundred user team, and forty four times smaller on thirty two thousand users.',
          scene: {
            type: 'stat',
            value: '44',
            unit: '×',
            label: 'smaller boot data, *32K* users',
            sub: '7× smaller on a 1.5K-user team',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['smaller', '44'],
        },
        {
          say: "Remember this. Don't ship the whole world at boot. Load the minimum, and fetch the rest from near the user.",
          scene: {
            type: 'outro',
            points: ['Boot snapshots grow with the team', 'Load *minimal* data upfront', 'An edge cache serves the rest'],
            tagline: 'Load less, fetch near.',
          },
          sfx: 'success',
          emphasis: ['minimum', 'near'],
        },
      ],
    },
  ],
};
