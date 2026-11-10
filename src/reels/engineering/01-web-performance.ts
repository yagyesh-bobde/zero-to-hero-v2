import type { Series } from '../types';

// Facts: web.dev "Web Vitals" (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile)
// and "Optimize long tasks" (long task > 50 ms, scheduler.yield in Chrome/Edge 129+, Firefox 142+, not Safari).

const hero = `<!-- index.html -->
<img
  src="/hero.jpg"
  fetchpriority="high"
  width="800"
  height="600"
  alt="Red sneaker"
/>`;

const shopRows = (ad: boolean) => [
  ...(ad ? [{ id: 'ad', label: 'Sponsored banner', icon: '📢', sub: 'loaded late, no slot', tone: 'bad' as const }] : []),
  { id: 'photo', label: 'Red sneaker photo', icon: '👟', sub: ad ? 'pushed down' : 'still loading…' },
  { id: 'price', label: 'Runner X · $89', icon: '🏷️', sub: 'size 9 in stock' },
  { id: 'reviews', label: 'Reviews', icon: '⭐', sub: '4.8 from 212 buyers' },
];

const slowClick = `button.onclick = () => {
  showSpinner();
  for (const row of rows) {
    score(row);
  }
  render(results);
};`;

const yieldingClick = `button.onclick = async () => {
  showSpinner();
  await scheduler.yield();
  for (const chunk of chunks) {
    chunk.forEach(score);
    await scheduler.yield();
  }
  render(results);
};`;

const eagerRoutes = `import Home from './Home';
import Admin from './Admin';
import Editor from './Editor';

const routes = {
  '/': Home,
  '/admin': Admin,
  '/editor': Editor,
};`;

const lazyRoutes = `import { lazy } from 'react';
import Home from './Home';

const Admin = lazy(
  () => import('./Admin'),
);
const Editor = lazy(
  () => import('./Editor'),
);`;

const inbox = `function Inbox({ emails }) {
  return (
    <ul>
      {emails.map((e) => (
        <Row key={e.id} email={e} />
      ))}
    </ul>
  );
}`;

const windowMath = `const rowHeight = 48;

const start = Math.floor(
  scrollTop / rowHeight,
);
const count = Math.ceil(
  viewportHeight / rowHeight,
);
const end = start + count + 3;`;

export const series: Series = {
  id: 'eng-web-performance',
  title: 'Web performance',
  emoji: '⚡',
  color: '#facc15',
  order: 1,
  blurb: 'Why pages feel slow, and the fixes that move the numbers.',
  reels: [
    {
      id: 'perf-core-web-vitals',
      title: 'Core Web Vitals, decoded',
      beats: [
        {
          say: 'Google grades your page on three numbers. Do you know them?',
          scene: {
            type: 'title',
            kicker: 'Web performance',
            title: 'Three numbers grade your *page*',
            emoji: '📊',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['three', 'numbers'],
        },
        {
          say: 'Picture a shop page on your phone. The photo is slow, the text jumps, and Buy feels stuck.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Sneaker Shop', icon: '👟', items: shopRows(false), button: 'Buy now' },
            caption: 'slow, jumpy, laggy',
            tap: { x: 0.5, y: 0.86 },
          },
          sfx: 'swipe',
          emphasis: ['slow', 'jumps', 'stuck'],
        },
        {
          say: 'Core Web Vitals give each feeling a score. Loading, responding to input, and staying still.',
          scene: {
            type: 'list',
            title: 'Core Web Vitals',
            items: [
              { text: '*LCP*: main content shows', icon: '🖼️', sub: 'good: 2.5 s or less' },
              { text: '*INP*: taps respond', icon: '👆', sub: 'good: 200 ms or less' },
              { text: '*CLS*: nothing jumps', icon: '📐', sub: 'good: 0.1 or less' },
            ],
          },
          sfx: 'pop',
          emphasis: ['loading', 'responding', 'still'],
        },
        {
          say: 'LCP, largest contentful paint, is when the biggest image or text block appears. Aim for two and a half seconds.',
          speak: 'L C P, largest contentful paint, is when the biggest image or text block appears. Aim for two and a half seconds.',
          scene: {
            type: 'timeline',
            title: 'LCP: the hero shows up',
            steps: [
              { label: 'HTML arrives', icon: '📄' },
              { label: 'Image found', sub: 'late if CSS or JS adds it', icon: '🔍', tone: 'warn' },
              { label: 'Image downloads', icon: '⬇️' },
              { label: 'Hero painted', sub: 'this moment is LCP', icon: '🖼️', tone: 'accent' },
            ],
            active: 3,
          },
          sfx: 'swipe',
          emphasis: ['biggest', 'appears'],
        },
        {
          say: 'The biggest fix? Put the hero image right in the HTML, mark it high priority, and never lazy load it.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'index.html',
            code: hero,
            highlight: [4],
            note: { line: 4, text: 'fetch me first 🚀', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['HTML', 'priority', 'never'],
        },
        {
          say: 'INP, interaction to next paint, times each tap or key press until the screen updates. Good is two hundred milliseconds.',
          speak: 'I N P, interaction to next paint, times each tap or key press until the screen updates. Good is two hundred milliseconds.',
          scene: {
            type: 'diagram',
            title: 'INP: tap to next frame',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'tap', label: 'Tap on Buy', icon: '👆', x: 0, y: 0 },
              { id: 'js', label: 'Your JavaScript', icon: '⚙️', sub: 'event handlers run', x: 0, y: 1.5, active: true },
              { id: 'paint', label: 'Next paint', icon: '🖼️', sub: 'user sees a change', x: 0, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'tap', to: 'js', active: true },
              { from: 'js', to: 'paint' },
            ],
            packets: [{ from: 'tap', to: 'js', label: 'tap', tone: 'accent' }],
            caption: 'the whole wait counts',
          },
          sfx: 'swipe',
          emphasis: ['tap', 'updates'],
        },
        {
          say: 'The top fix is breaking up long tasks. Any task over fifty milliseconds makes your taps wait in line.',
          scene: {
            type: 'stat',
            value: '50',
            unit: 'ms',
            label: 'past this, it is a *long task*',
            sub: 'split it so taps can cut in',
            tone: 'warn',
          },
          sfx: 'ding',
          emphasis: ['long', 'tasks', 'wait'],
        },
        {
          say: 'CLS, cumulative layout shift, adds up how far things jump while you read. Keep it at zero point one or less.',
          speak: 'C L S, cumulative layout shift, adds up how far things jump while you read. Keep it at zero point one or less.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Sneaker Shop', icon: '👟', items: shopRows(true), button: 'Buy now' },
            caption: 'a late ad shoves it all down',
          },
          sfx: 'error',
          emphasis: ['jump'],
        },
        {
          say: 'The fix is to reserve the space. Give images a width and height, and give ads a fixed slot.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'index.html',
            code: hero,
            added: [[5, 6]],
            note: { line: 6, text: 'space held before it loads', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['reserve', 'space'],
        },
        {
          say: 'Remember this. Show the hero early, keep tasks short, and reserve the space. That fixes most bad scores.',
          scene: {
            type: 'outro',
            points: ['LCP: load the *hero* first', 'INP: break up *long tasks*', 'CLS: *reserve* the space'],
            tagline: 'Fast, snappy, steady.',
          },
          sfx: 'success',
          emphasis: ['hero', 'short', 'reserve'],
        },
      ],
    },
    {
      id: 'perf-inp-long-tasks',
      title: 'Why your click feels laggy',
      beats: [
        {
          say: 'Your click handler looks fast. So why does the button feel dead?',
          scene: {
            type: 'title',
            kicker: 'Web performance',
            title: 'Your click *waited* in line',
            emoji: '🐢',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['dead'],
        },
        {
          say: 'Here is the handler. It shows a spinner, then scores ten thousand rows in one go.',
          scene: { type: 'code', lang: 'js', file: 'search.js', code: slowClick, highlight: [[3, 5]] },
          sfx: 'type',
          emphasis: ['spinner', 'one'],
        },
        {
          say: "But the spinner never shows up. The browser can't paint until your whole function returns.",
          scene: {
            type: 'code',
            lang: 'js',
            file: 'search.js',
            code: slowClick,
            errors: [2],
            note: { line: 2, text: 'never painted 😱', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['never', 'paint'],
        },
        {
          say: 'The main thread does one thing at a time. Your JavaScript, layout and paint all share it.',
          scene: {
            type: 'timeline',
            title: 'One main thread',
            steps: [
              { label: 'Click', icon: '👆' },
              { label: 'Your JavaScript', sub: 'one huge task', icon: '⚙️', tone: 'bad' },
              { label: 'Layout', icon: '📐' },
              { label: 'Paint', sub: 'only now', icon: '🖼️' },
            ],
            active: 1,
          },
          sfx: 'swipe',
          emphasis: ['one', 'share'],
        },
        {
          say: 'Any task over fifty milliseconds is a long task. A tap that lands during it just waits.',
          scene: {
            type: 'stat',
            value: '50',
            unit: 'ms',
            label: 'past this, it is a *long task*',
            sub: 'input waits until it ends',
            tone: 'warn',
          },
          sfx: 'ding',
          emphasis: ['long', 'waits'],
        },
        {
          say: 'INP, interaction to next paint, counts that whole wait. Input delay, your handler, then the work to paint.',
          speak: 'I N P, interaction to next paint, counts that whole wait. Input delay, your handler, then the work to paint.',
          scene: {
            type: 'list',
            title: 'INP adds three parts',
            numbered: true,
            items: [
              { text: 'Input delay', sub: 'stuck behind a busy thread', tone: 'bad' },
              { text: 'Processing', sub: 'your event handlers' },
              { text: 'Presentation', sub: 'style, layout and paint' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['whole', 'wait'],
        },
        {
          say: 'The fix is to yield. Each await hands the thread back, so the spinner paints right away.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'search.js',
            code: yieldingClick,
            added: [3],
            note: { line: 3, text: 'spinner paints here ✅', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['yield', 'spinner'],
        },
        {
          say: 'Then do the rest in small chunks, yielding between each one, so taps can cut in.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'search.js',
            code: yieldingClick,
            highlight: [[4, 7]],
            note: { line: 7, text: 'taps can cut in here', tone: 'accent' },
          },
          sfx: 'click',
          emphasis: ['chunks', 'cut'],
        },
        {
          say: 'Quick check. Why use scheduler yield instead of a zero millisecond setTimeout?',
          speak: 'Quick check. Why use scheduler yield instead of a zero millisecond set timeout?',
          scene: {
            type: 'quiz',
            question: 'Why yield with scheduler.yield, not setTimeout(0)?',
            options: ['It runs code faster', 'Your code resumes first', 'It skips layout'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['why'],
        },
        {
          say: 'Your code resumes first. setTimeout goes to the back of the queue. Safari lacks yield, so keep a fallback.',
          speak: 'Your code resumes first. Set timeout goes to the back of the queue. Safari lacks yield, so keep a fallback.',
          scene: {
            type: 'quiz',
            question: 'Why yield with scheduler.yield, not setTimeout(0)?',
            options: ['It runs code faster', 'Your code resumes first', 'It skips layout'],
            answer: 1,
            reveal: true,
            explain: 'setTimeout waits at the back of the queue. yield resumes ahead.',
          },
          sfx: 'ding',
          emphasis: ['first', 'fallback'],
        },
        {
          say: "Remember this. A click can't paint until your task ends. Keep tasks short, and yield often.",
          scene: {
            type: 'outro',
            points: ['One thread, one task at a time', 'Over *50 ms* blocks taps', '*Yield* between chunks'],
            tagline: 'Short tasks, snappy taps.',
          },
          sfx: 'success',
          emphasis: ['short', 'yield'],
        },
      ],
    },
    {
      id: 'perf-code-splitting',
      title: 'Ship less JavaScript up front',
      beats: [
        {
          say: 'Every visitor downloads your admin dashboard. Even on the homepage.',
          scene: {
            type: 'title',
            kicker: 'Web performance',
            title: 'Your homepage ships *admin*',
            emoji: '📦',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['admin', 'homepage'],
        },
        {
          say: 'Here is a typical router. Every page is a static import at the top of one file.',
          scene: { type: 'code', lang: 'tsx', file: 'routes.tsx', code: eagerRoutes, highlight: [[1, 3]] },
          sfx: 'type',
          emphasis: ['static', 'import'],
        },
        {
          say: 'The bundler follows every import into one main file. So the chart and editor libraries ride along.',
          scene: {
            type: 'tree',
            title: 'One main bundle',
            caption: 'all of it loads on /',
            root: {
              id: 'main',
              label: 'main.js',
              active: true,
              children: [
                { id: 'home', label: 'Home' },
                { id: 'admin', label: 'Admin', dirty: true, children: [{ id: 'charts', label: 'Charts lib', dirty: true }] },
                { id: 'editor', label: 'Editor', dirty: true, children: [{ id: 'rte', label: 'Rich text', dirty: true }] },
              ],
            },
          },
          sfx: 'swipe',
          emphasis: ['one', 'ride'],
        },
        {
          say: "And bytes aren't the only cost. Every script must be parsed, compiled and run, which is slow on cheap phones.",
          scene: {
            type: 'timeline',
            title: 'Each script costs',
            steps: [
              { label: 'Download', icon: '⬇️' },
              { label: 'Parse', icon: '🧩' },
              { label: 'Compile', icon: '🛠️' },
              { label: 'Run', sub: 'blocks the main thread', icon: '⚙️', tone: 'bad' },
            ],
            active: 3,
          },
          sfx: 'swipe',
          emphasis: ['parsed', 'compiled', 'run'],
        },
        {
          say: 'The critical path should hold only what this route needs for its first screen. Everything else can wait.',
          scene: {
            type: 'list',
            title: 'The critical path',
            items: [
              { text: 'Code for *this* route', icon: '✅', tone: 'good' },
              { text: 'UI for the first screen', icon: '✅', tone: 'good' },
              { text: 'Other routes', icon: '⏳', tone: 'muted' },
              { text: 'Charts, editors, modals', icon: '⏳', tone: 'muted' },
            ],
          },
          sfx: 'pop',
          emphasis: ['first', 'wait'],
        },
        {
          say: 'The fix is route level splitting. React lazy with a dynamic import puts each page in its own chunk.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'routes.tsx',
            code: lazyRoutes,
            added: [[4, 9]],
            note: { line: 9, text: 'own chunk, loaded on visit', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['lazy', 'chunk'],
        },
        {
          say: 'Now the homepage ships just the home code. The admin chunk downloads only when someone opens admin.',
          scene: {
            type: 'diagram',
            title: 'Split by route',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'main', label: 'main.js', icon: '🏠', sub: 'Home only', x: 1, y: 0, active: true, tone: 'good' },
              { id: 'admin', label: 'admin.js', icon: '📊', sub: 'on /admin', x: 0, y: 2 },
              { id: 'editor', label: 'editor.js', icon: '✍️', sub: 'on /editor', x: 2, y: 2, dim: true },
            ],
            edges: [
              { from: 'main', to: 'admin', dashed: true, active: true },
              { from: 'main', to: 'editor', dashed: true },
            ],
            packets: [{ from: 'main', to: 'admin', label: 'go', tone: 'accent' }],
            caption: 'wrap them in Suspense for a fallback',
          },
          sfx: 'swipe',
          emphasis: ['just', 'only'],
        },
        {
          say: 'Then lock it in with a bundle budget. A tool like size limit fails the build when the bundle grows past it.',
          scene: {
            type: 'terminal',
            title: 'Budget check in CI',
            lines: [
              { cmd: 'npx size-limit' },
              { out: 'main.js', tone: 'muted' },
              { out: 'Size limit: 170 kB\nSize:       212 kB', tone: 'bad' },
              { out: '✕ Budget exceeded', tone: 'bad' },
            ],
          },
          sfx: 'error',
          emphasis: ['budget', 'fails'],
        },
        {
          say: 'Quick check. Which of these belongs in the main chunk?',
          scene: {
            type: 'quiz',
            question: 'Which belongs in the main chunk of a shop homepage?',
            options: ['The admin chart library', 'The homepage hero', 'The settings modal'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['main'],
        },
        {
          say: 'The hero. The user needs it on the first screen. The chart and the modal can load later.',
          scene: {
            type: 'quiz',
            question: 'Which belongs in the main chunk of a shop homepage?',
            options: ['The admin chart library', 'The homepage hero', 'The settings modal'],
            answer: 1,
            reveal: true,
            explain: 'First screen = critical path. The rest loads on demand.',
          },
          sfx: 'ding',
          emphasis: ['hero', 'later'],
        },
        {
          say: 'Remember this. Ship only what the first screen needs, split each route, and let CI guard the budget.',
          scene: {
            type: 'outro',
            points: ['First screen code only', '*lazy()* each route', 'A size *budget* in CI'],
            tagline: 'Ship less, sooner.',
          },
          sfx: 'success',
          emphasis: ['first', 'split', 'budget'],
        },
      ],
    },
    {
      id: 'perf-virtualization',
      title: 'Rendering 10,000 rows',
      beats: [
        {
          say: 'Your list has ten thousand rows. The user can see about twelve.',
          scene: {
            type: 'title',
            kicker: 'Web performance',
            title: 'Render *12* rows, not 10,000',
            emoji: '📜',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['thousand', 'twelve'],
        },
        {
          say: 'The simple way maps every email to a row. Ten thousand rows, all living in the DOM.',
          speak: 'The simple way maps every email to a row. Ten thousand rows, all living in the dom.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Inbox.tsx',
            code: inbox,
            errors: [[4, 6]],
            note: { line: 6, text: '10,000 rows in the DOM', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['every', 'DOM'],
        },
        {
          say: 'First load stalls, memory climbs, and each update touches every row. Scrolling starts to stutter.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Inbox',
              icon: '📥',
              items: [
                { id: 'm1', label: 'Invoice for March', icon: '🧾', sub: 'Billing team' },
                { id: 'm2', label: 'Standup moved', icon: '📅', sub: 'Priya' },
                { id: 'm3', label: 'Build failed', icon: '🔴', sub: 'CI bot', tone: 'bad' },
                { id: 'm4', label: 'Lunch on Friday?', icon: '🥪', sub: 'Sam' },
                { id: 'm5', label: 'Design review notes', icon: '🎨', sub: 'Lee' },
              ],
              loading: true,
            },
            caption: 'scroll janks, memory climbs',
          },
          sfx: 'error',
          emphasis: ['stalls', 'stutter'],
        },
        {
          say: 'Virtualization, also called windowing, renders only the rows inside the visible window.',
          scene: {
            type: 'diagram',
            title: 'Only the window is real',
            cols: 1,
            rows: 3,
            nodes: [
              { id: 'above', label: 'Rows above', sub: 'not rendered', x: 0, y: 0, dim: true, shape: 'pill' },
              { id: 'view', label: 'Visible window', icon: '👀', sub: 'about 12 real rows', x: 0, y: 1, active: true },
              { id: 'below', label: 'Rows below', sub: 'not rendered', x: 0, y: 2, dim: true, shape: 'pill' },
            ],
            caption: 'scroll, and the window slides',
          },
          sfx: 'swipe',
          emphasis: ['windowing', 'visible'],
        },
        {
          say: 'The math is tiny. Divide the scroll position by the row height, and you get the first row.',
          scene: { type: 'code', lang: 'ts', file: 'window.ts', code: windowMath, highlight: [[3, 5]] },
          sfx: 'type',
          emphasis: ['tiny', 'first'],
        },
        {
          say: 'Add one screen of rows, plus a few extra called overscan, so fast scrolling never flashes blank.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'window.ts',
            code: windowMath,
            highlight: [[6, 9]],
            note: { line: 9, text: '3 extra rows: overscan', tone: 'accent' },
          },
          sfx: 'click',
          emphasis: ['overscan', 'blank'],
        },
        {
          say: 'A tall, empty spacer keeps the scrollbar honest. The real rows slide down to where they belong.',
          scene: {
            type: 'diagram',
            title: 'The spacer trick',
            cols: 1,
            rows: 5,
            nodes: [
              { id: 'scroller', label: 'Scroll box', icon: '🖱️', sub: 'overflow: auto', x: 0, y: 0 },
              { id: 'spacer', label: 'Empty spacer', icon: '📏', sub: '10,000 × 48px tall', x: 0, y: 2, active: true },
              { id: 'rows', label: 'Visible rows', icon: '📄', sub: 'translateY(start×48)', x: 0, y: 4, tone: 'good' },
            ],
            edges: [
              { from: 'scroller', to: 'spacer', active: true },
              { from: 'spacer', to: 'rows' },
            ],
            packets: [{ from: 'scroller', to: 'spacer', label: 'scrollTop', tone: 'accent' }],
          },
          sfx: 'swipe',
          emphasis: ['spacer', 'scrollbar'],
        },
        {
          say: 'So the DOM holds about a dozen rows at any moment. Scrolling just swaps which ones they are.',
          speak: 'So the dom holds about a dozen rows at any moment. Scrolling just swaps which ones they are.',
          scene: {
            type: 'stat',
            value: '12',
            unit: 'rows',
            label: 'in the DOM at any *scroll*',
            sub: 'out of 10,000, swapped as you go',
            tone: 'good',
          },
          sfx: 'ding',
          emphasis: ['dozen', 'swaps'],
        },
        {
          say: 'Libraries like TanStack Virtual do this for you. But know the costs before you reach for it.',
          scene: {
            type: 'list',
            title: 'The trade-offs',
            items: [
              { text: 'Find in page misses rows', icon: '🔍', tone: 'warn' },
              { text: 'Varied heights need measuring', icon: '📏', tone: 'warn' },
              { text: 'Screen readers see fewer rows', icon: '🦻', tone: 'warn' },
            ],
          },
          sfx: 'pop',
          emphasis: ['costs'],
        },
        {
          say: 'Remember this. Users see a dozen rows, so render a dozen. A spacer fakes the rest.',
          scene: {
            type: 'outro',
            points: ['Render only *visible* rows', 'A *spacer* keeps the scrollbar', '*Overscan* hides blank flashes'],
            tagline: 'Draw what they see.',
          },
          sfx: 'success',
          emphasis: ['dozen', 'spacer'],
        },
      ],
    },
  ],
};
