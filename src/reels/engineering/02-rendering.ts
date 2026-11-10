import type { Series } from '../types';

const productPage = `// app/product/[id]/page.tsx
async function ProductPage({ id }) {
  const p = await getProduct(id);
  return (
    <main>
      <h1>{p.name}</h1>
      <Price value={p.price} />
    </main>
  );
}`;

const isrPage = `// app/product/[id]/page.tsx
export const revalidate = 60;

async function ProductPage({ id }) {
  const p = await getProduct(id);
  return <Product data={p} />;
}`;

const hydrate = `// client.tsx
import { hydrateRoot } from
  'react-dom/client';

hydrateRoot(
  document.getElementById('root'),
  <App />,
);`;

const rscPage = `// a Server Component (the default)
async function ProductPage({ id }) {
  const p = await db.find(id);
  return (
    <article>
      <h1>{p.name}</h1>
      <Markdown src={p.body} />
      <AddToCart id={id} />
    </article>
  );
}`;

const addToCart = `'use client';

export function AddToCart({ id }) {
  const [n, setN] = useState(0);
  const add = () => setN(n + 1);
  return (
    <button onClick={add}>
      Add to cart ({n})
    </button>
  );
}`;

const streamPage = (suspense: boolean) =>
  suspense
    ? `function ProductPage() {
  return (
    <Layout>
      <Details />
      <Suspense fallback={<Dots />}>
        <Reviews />
      </Suspense>
    </Layout>
  );
}`
    : `function ProductPage() {
  return (
    <Layout>
      <Details />
      <Reviews />
    </Layout>
  );
}`;

const streamSteps = [
  { label: 'Shell', sub: 'layout and details', icon: '📦' },
  { label: 'Fallback', sub: 'spinner for reviews', icon: '⏳' },
  { label: 'Reviews HTML', sub: 'streams in later', icon: '💬' },
  { label: 'Swap', sub: 'tiny inline script', icon: '🔁', tone: 'accent' as const },
];

const hydrateSteps = [
  { label: 'HTML paints', sub: 'looks finished', icon: '🖼️' },
  { label: 'Download JS', sub: 'every component', icon: '📦' },
  { label: 'Run components', sub: 'rebuild the tree', icon: '🧮' },
  { label: 'Attach handlers', sub: 'now taps work', icon: '👆', tone: 'accent' as const },
];

export const series: Series = {
  id: 'eng-rendering',
  title: 'Rendering architecture',
  emoji: '🧱',
  color: '#61dafb',
  order: 2,
  blurb: 'Where your HTML is built, when it becomes interactive, and what ships to the browser.',
  reels: [
    {
      id: 'render-csr-ssr-ssg-isr',
      title: 'CSR vs SSR vs SSG vs ISR',
      beats: [
        {
          say: 'One product page. Four ways to build it. Picking wrong costs you.',
          scene: {
            type: 'title',
            kicker: 'Rendering architecture',
            title: 'One page, *four* ways to build it',
            emoji: '🧱',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['four', 'wrong'],
        },
        {
          say: "Here's a product page that loads its price from your database. The real question is when its HTML gets built.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'page.tsx',
            code: productPage,
            highlight: [3],
            note: { line: 3, text: 'when does this run? 🤔', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['when', 'built'],
        },
        {
          say: 'Client-side rendering, or CSR, sends an empty shell. The browser downloads JavaScript, fetches the data, then draws everything.',
          speak: 'Client-side rendering, or C S R, sends an empty shell. The browser downloads JavaScript, fetches the data, then draws everything.',
          scene: {
            type: 'timeline',
            title: 'CSR: built in the browser',
            steps: [
              { label: 'Empty HTML', sub: '<div id="root">', icon: '📄' },
              { label: 'Download JS', sub: 'the whole app', icon: '📦' },
              { label: 'Fetch data', sub: 'from the browser', icon: '🌐' },
              { label: 'Render', sub: 'finally visible', icon: '🎨', tone: 'accent' },
            ],
            active: 0,
          },
          sfx: 'swipe',
          emphasis: ['empty', 'shell'],
        },
        {
          say: 'Server-side rendering, or SSR, builds the HTML on every request. Fast first paint, but every visit costs server time.',
          speak: 'Server-side rendering, or S S R, builds the HTML on every request. Fast first paint, but every visit costs server time.',
          scene: {
            type: 'timeline',
            title: 'SSR: built per request',
            steps: [
              { label: 'Request', sub: 'a user visits', icon: '🙋' },
              { label: 'Server fetches', sub: 'fresh data', icon: '🗄️' },
              { label: 'Full HTML', sub: 'visible at once', icon: '📄', tone: 'accent' },
              { label: 'Hydrate', sub: 'JS makes it work', icon: '💧' },
            ],
            active: 2,
          },
          sfx: 'click',
          emphasis: ['every', 'request'],
        },
        {
          say: 'Static generation, or SSG, builds the HTML once, at deploy time. A CDN hands everyone that same file, instantly.',
          speak: 'Static generation, or S S G, builds the HTML once, at deploy time. A C D N hands everyone that same file, instantly.',
          scene: {
            type: 'diagram',
            title: 'SSG: built at deploy',
            cols: 1,
            rows: 5,
            nodes: [
              { id: 'build', label: 'Build step', sub: 'runs once per deploy', icon: '🏗️', x: 0, y: 0 },
              { id: 'cdn', label: 'CDN', sub: 'stores the HTML file', icon: '🌍', x: 0, y: 2, active: true },
              { id: 'users', label: 'Every visitor', sub: 'same page, no wait', icon: '👥', x: 0, y: 4, tone: 'good' },
            ],
            edges: [
              { from: 'build', to: 'cdn', active: true },
              { from: 'cdn', to: 'users' },
            ],
            packets: [{ from: 'cdn', to: 'users', label: 'HTML', tone: 'good' }],
          },
          sfx: 'swipe',
          emphasis: ['once', 'instantly'],
        },
        {
          say: 'Incremental static regeneration, or ISR, is static with a timer. In Next.js, one line sets it.',
          speak: 'Incremental static regeneration, or I S R, is static with a timer. In Next J S, one line sets it.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'page.tsx',
            code: isrPage,
            highlight: [2],
            note: { line: 2, text: 'rebuild at most every 60s', tone: 'good' },
          },
          sfx: 'swipe',
          emphasis: ['timer', 'one'],
        },
        {
          say: 'Once sixty seconds pass, the next visitor still gets the old page instantly, while the server rebuilds it in the background.',
          scene: {
            type: 'timeline',
            title: 'ISR: stale, then fresh',
            steps: [
              { label: 'Visit at 61s', sub: 'gets the old page', icon: '⚡' },
              { label: 'Rebuild', sub: 'in the background', icon: '🔄', tone: 'accent' },
              { label: 'Next visit', sub: 'gets the new page', icon: '✨', tone: 'good' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['old', 'background'],
        },
        {
          say: 'So pick by freshness. Same for everyone, SSG or ISR. Personal or live, SSR. Behind a login, CSR is fine.',
          speak: 'So pick by freshness. Same for everyone, S S G or I S R. Personal or live, S S R. Behind a login, C S R is fine.',
          scene: {
            type: 'list',
            title: 'Pick by freshness',
            items: [
              { text: 'Docs, marketing: *SSG*', icon: '📘' },
              { text: 'Catalog, blog: *ISR*', icon: '🛍️' },
              { text: 'Per user, live: *SSR*', icon: '👤' },
              { text: 'Behind a login: *CSR*', icon: '🔒' },
            ],
            active: 1,
          },
          sfx: 'pop',
          emphasis: ['freshness'],
        },
        {
          say: 'Remember this. Every option answers one question: when is the HTML built, and how fresh must it be?',
          scene: {
            type: 'outro',
            points: ['CSR: built in the *browser*', 'SSR: built on every *request*', 'SSG: built once at *deploy*', 'ISR: static, rebuilt on a *timer*'],
            tagline: 'When is the HTML built?',
          },
          sfx: 'success',
          emphasis: ['when', 'fresh'],
        },
      ],
    },
    {
      id: 'render-hydration-cost',
      title: 'Hydration: looks ready, isn’t',
      beats: [
        {
          say: 'The page is on screen. You tap Add to cart. Nothing happens.',
          scene: {
            type: 'title',
            kicker: 'Rendering architecture',
            title: 'Looks ready. *Isn’t* ready.',
            sub: 'the gap between visible and interactive',
            emoji: '💧',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['nothing'],
        },
        {
          say: "This page was built on the server, so its HTML arrived fast. But the click handler lives in JavaScript that hasn't run yet.",
          scene: {
            type: 'phone',
            os: 'ios',
            tap: { x: 0.5, y: 0.86 },
            screen: {
              kind: 'app',
              title: 'Sneakers',
              icon: '👟',
              items: [
                { id: 'shoe', label: 'Runner 2', icon: '👟', value: '$120' },
                { id: 'size', label: 'Size', sub: 'pick one', value: '42' },
                { id: 'ship', label: 'Free delivery', icon: '🚚', tone: 'good' },
              ],
              button: 'Add to cart',
            },
            caption: 'HTML is here, the JS is not',
          },
          sfx: 'error',
          emphasis: ['fast', "hasn't"],
        },
        {
          say: 'Hydration is how React takes over that server HTML, and attaches your event handlers to it.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'client.tsx',
            code: hydrate,
            highlight: [[5, 8]],
            note: { line: 8, text: 'adopt the HTML, wire up events', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['hydration', 'handlers'],
        },
        {
          say: 'First, the browser has to download the JavaScript for every component on the page.',
          scene: { type: 'timeline', title: 'Before a tap works', steps: hydrateSteps, active: 1 },
          sfx: 'swipe',
          emphasis: ['every', 'component'],
        },
        {
          say: 'Then React runs all those components again, to rebuild its tree and match it to the HTML.',
          scene: { type: 'timeline', title: 'Before a tap works', steps: hydrateSteps, active: 2 },
          sfx: 'click',
          emphasis: ['again'],
        },
        {
          say: 'Only then are handlers attached. Until that moment, your tap has nothing to land on.',
          scene: { type: 'timeline', title: 'Before a tap works', steps: hydrateSteps, active: 3 },
          sfx: 'click',
          emphasis: ['only', 'nothing'],
        },
        {
          say: 'So you pay twice. Each component renders on the server, then again in the browser, even the static ones.',
          scene: {
            type: 'stat',
            value: '2×',
            label: 'renders of *every* component',
            sub: 'once on the server, once in the browser',
            tone: 'warn',
          },
          sfx: 'ding',
          emphasis: ['twice', 'static'],
        },
        {
          say: 'The fix is less to hydrate. Suspense lets parts hydrate separately, and Server Components skip hydration entirely.',
          scene: {
            type: 'list',
            title: 'Shrink the gap',
            items: [
              { text: 'Ship *less* JavaScript', icon: '✂️' },
              { text: 'Split with *Suspense*', icon: '🧩', sub: 'parts hydrate on their own' },
              { text: '*Server* Components', icon: '🖥️', sub: 'no JS, no hydration' },
            ],
            active: 1,
          },
          sfx: 'pop',
          emphasis: ['less', 'separately'],
        },
        {
          say: 'Remember this. Server HTML makes a page look ready. Hydration is what makes it actually work.',
          scene: {
            type: 'outro',
            points: ['HTML paints, but can’t *respond*', 'Hydration re-runs every component', 'Less JS means a *smaller* gap'],
            tagline: 'Visible is not interactive.',
          },
          sfx: 'success',
          emphasis: ['look', 'work'],
        },
      ],
    },
    {
      id: 'render-server-components',
      title: 'Server Components ship zero JS',
      beats: [
        {
          say: 'This component reads your database, and sends zero JavaScript to the browser.',
          scene: {
            type: 'title',
            kicker: 'Rendering architecture',
            title: 'This component ships *zero* JS',
            emoji: '🖥️',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['zero'],
        },
        {
          say: "In Next.js's App Router, components are Server Components by default. This one is async, and queries the database directly.",
          speak: "In Next J S's App Router, components are Server Components by default. This one is async, and queries the database directly.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ProductPage.tsx',
            code: rscPage,
            highlight: [3],
            note: { line: 3, text: 'runs only on the server', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['default', 'directly'],
        },
        {
          say: 'It also uses a heavy markdown library. That library runs on the server, and never enters the browser bundle.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ProductPage.tsx',
            code: rscPage,
            highlight: [7],
            note: { line: 7, text: 'markdown lib stays on server', tone: 'good' },
          },
          sfx: 'click',
          emphasis: ['never', 'bundle'],
        },
        {
          say: 'React runs Server Components on the server, and sends their result, not their code. The browser only gets output.',
          scene: {
            type: 'diagram',
            title: 'What travels',
            cols: 1,
            rows: 5,
            nodes: [
              { id: 'server', label: 'Server', sub: 'runs Page and Markdown', icon: '🖥️', x: 0, y: 0 },
              { id: 'payload', label: 'RSC payload', sub: 'rendered output only', icon: '📨', x: 0, y: 2, active: true },
              { id: 'browser', label: 'Browser', sub: 'JS for AddToCart only', icon: '🌐', x: 0, y: 4, tone: 'good' },
            ],
            edges: [
              { from: 'server', to: 'payload', active: true },
              { from: 'payload', to: 'browser' },
            ],
            packets: [{ from: 'server', to: 'payload', label: 'result', tone: 'good' }],
          },
          sfx: 'swipe',
          emphasis: ['result', 'code'],
        },
        {
          say: "Need state or a click handler? Put use client at the top. That's where JavaScript starts shipping.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'AddToCart.tsx',
            code: addToCart,
            highlight: [1],
            note: { line: 1, text: 'this file ships to the browser', tone: 'warn' },
          },
          sfx: 'swipe',
          emphasis: ['use', 'client'],
        },
        {
          say: 'So in this tree, only AddToCart ships code. Everything above it costs zero JavaScript, and needs no hydration.',
          speak: 'So in this tree, only Add To Cart ships code. Everything above it costs zero JavaScript, and needs no hydration.',
          scene: {
            type: 'tree',
            title: 'Who ships JS?',
            root: {
              id: 'page',
              label: 'Page',
              tone: 'muted',
              children: [
                { id: 'h1', label: 'h1', tone: 'muted' },
                { id: 'md', label: 'Markdown', tone: 'muted' },
                { id: 'cart', label: 'AddToCart', active: true },
              ],
            },
            caption: 'only the client leaf ships code',
          },
          sfx: 'pop',
          emphasis: ['only', 'zero'],
        },
        {
          say: "The trade-off: Server Components can't hold state or run effects. Client ones can, but they ship code and hydrate.",
          scene: {
            type: 'compare',
            title: 'Server vs client',
            left: { title: 'Server', verdict: 'neutral', icon: '🖥️', items: ['Await data directly', 'No state or effects', 'Zero JS shipped'] },
            right: { title: 'Client', verdict: 'neutral', icon: '🌐', items: ['State and onClick', 'Ships JS, hydrates', 'Props must serialize'] },
          },
          sfx: 'swipe',
          emphasis: ["can't", 'hydrate'],
        },
        {
          say: 'Remember this. Server Components send results, not code. Add use client only where people interact.',
          scene: {
            type: 'outro',
            points: ['Server Components run only on the *server*', "'use client' marks where JS *ships*", 'Push the boundary down to the leaves'],
            tagline: 'Send results, not code.',
          },
          sfx: 'success',
          emphasis: ['results', 'interact'],
        },
      ],
    },
    {
      id: 'render-streaming-suspense',
      title: 'Streaming SSR with Suspense',
      beats: [
        {
          say: 'One slow query. Why should your whole page wait for it?',
          scene: {
            type: 'title',
            kicker: 'Rendering architecture',
            title: 'Send the page *before* it’s done',
            emoji: '🌊',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['slow', 'whole'],
        },
        {
          say: 'Details load fast, but Reviews waits on a slow query. Classic server rendering sends nothing until every part is done.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ProductPage.tsx',
            code: streamPage(false),
            highlight: [5],
            note: { line: 5, text: 'slow database query 🐢', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['nothing', 'every'],
        },
        {
          say: 'So the user stares at a blank screen, held hostage by the slowest part of the page.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'app', title: 'Shop', icon: '🛍️', loading: true },
            caption: 'blank until the slowest part',
          },
          sfx: 'error',
          emphasis: ['blank', 'slowest'],
        },
        {
          say: 'Wrap the slow part in Suspense, with a fallback. Now React can stream the page in pieces.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ProductPage.tsx',
            code: streamPage(true),
            added: [[5, 7]],
            note: { line: 7, text: 'a stream boundary', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['Suspense', 'stream'],
        },
        {
          say: 'The server sends the shell right away: the layout, the details, and a spinner. The browser paints it immediately.',
          scene: { type: 'timeline', title: 'One response, streamed', steps: streamSteps, active: 0 },
          sfx: 'swipe',
          emphasis: ['shell', 'immediately'],
        },
        {
          say: 'The user sees real content now, while reviews show a spinner. No more blank screen.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Shop',
              icon: '🛍️',
              items: [
                { id: 'shoe', label: 'Runner 2', icon: '👟', value: '$120', tone: 'good' },
                { id: 'desc', label: 'Light trail shoe', sub: 'details are here' },
                { id: 'rev', label: 'Reviews', icon: '💬', sub: 'loading…', tone: 'muted' },
              ],
              loading: true,
            },
            caption: 'content first, reviews later',
          },
          sfx: 'pop',
          emphasis: ['real', 'content'],
        },
        {
          say: 'When reviews finish, their HTML streams down the same response, with a tiny script that swaps it into place.',
          scene: { type: 'timeline', title: 'One response, streamed', steps: streamSteps, active: 3 },
          sfx: 'swipe',
          emphasis: ['same', 'swaps'],
        },
        {
          say: 'Each Suspense boundary also hydrates on its own, and React hydrates the part you click first.',
          scene: {
            type: 'diagram',
            title: 'Selective hydration',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'details', label: 'Details', sub: 'you tapped here', icon: '👆', x: 0, y: 0, active: true },
              { id: 'reviews', label: 'Reviews', sub: 'waits its turn', icon: '💬', x: 2, y: 0, dim: true },
              { id: 'react', label: 'React', icon: '⚛️', x: 1, y: 2, shape: 'pill' },
            ],
            edges: [
              { from: 'react', to: 'details', active: true },
              { from: 'react', to: 'reviews', dashed: true },
            ],
            packets: [{ from: 'react', to: 'details', label: 'JS', tone: 'good' }],
            caption: 'the clicked part hydrates first',
          },
          sfx: 'swipe',
          emphasis: ['own', 'first'],
        },
        {
          say: 'Remember this. Suspense lets the server send the fast parts now, and stream the slow parts later.',
          scene: {
            type: 'outro',
            points: ['Shell first, slow parts *later*', 'Suspense marks the stream *boundaries*', 'Boundaries hydrate on their own'],
            tagline: 'Shell now. The rest streams.',
          },
          sfx: 'success',
          emphasis: ['now', 'later'],
        },
      ],
    },
  ],
};
