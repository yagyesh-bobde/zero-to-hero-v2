import type { Series } from '../types';

const counter = `function Counter() {
  const [count, setCount] =
    useState(0);

  const onPress = () => {
    setCount(count + 1);
    console.log(count);
  };

  return (
    <Button onPress={onPress} />
  );
}`;

const triple = (update: string) => `const onPress = () => {
  ${update};
  ${update};
  ${update};
};`;

const list = (key: string) => `items.map((item, i) => (
  <Row
    key={${key}}
    label={item.name}
  />
));

function Row({ label }) {
  const [note, setNote] =
    useState('');
  return <Field value={note} />;
}`;

const greeting = `function Greeting({ name }) {
  return <Text>Hi {name}</Text>;
}
`;

const jsxLog = `${greeting}
const el = <Greeting name="Ana" />;

console.log(el);`;

const jsxCompiled = `${greeting}
const el = createElement(
  Greeting,
  { name: 'Ana' },
);

console.log(el);`;

const jsxMutate = `${greeting}
const el = <Greeting name="Ana" />;

el.props.name = 'Bob';`;

const clock = `function Clock({ time }) {
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}`;

const impureClock = `function Clock({ time }) {
  sendAnalytics(time);
  return (
    <>
      <h1>{time}</h1>
      <input />
    </>
  );
}`;

const fiberType = `type Fiber = {
  type: Function | string;
  key: string | null;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
  memoizedProps: Props;
  alternate: Fiber | null;
};`;

const profile = (cond: boolean) =>
  cond
    ? `function Profile({ isAdmin }) {
  const [name, setName] =
    useState('');
  if (isAdmin) {
    const [role, setRole] =
      useState('admin');
  }
  const [bio, setBio] =
    useState('');
}`
    : `function Profile() {
  const [name, setName] =
    useState('');
  const [role, setRole] =
    useState('admin');
  const [bio, setBio] =
    useState('');
}`;

const measure = (hook: string) => `const [h, setH] = useState(0);

${hook}(() => {
  ref.current?.measureInWindow(
    (x, y, w, height) =>
      setH(height),
  );
}, []);`;

const memoChild = `const Child = memo(
  function Child({ style }) {
    return <View style={style} />;
  },
);

function Parent() {
  return (
    <Child style={{ gap: 8 }} />
  );
}`;

const memoManual = `function Parent() {
  const style = useMemo(
    () => ({ gap: 8 }),
    [],
  );
  return (
    <Child style={style} />
  );
}`;

const babelConfig = `// babel.config.js
module.exports = {
  plugins: [
    // must run first!
    'babel-plugin-react-compiler',
  ],
};`;

const memoCompiled = `// no memo, no useMemo
function Child({ style }) {
  return <View style={style} />;
}

function Parent() {
  return (
    <Child style={{ gap: 8 }} />
  );
}`;

const transition = `const [
  isPending,
  startTransition,
] = useTransition();

function onType(text) {
  setQuery(text);
  startTransition(() => {
    setFilter(text);
  });
}`;

const suspense = `function Tabs({ tab }) {
  return (
    <Suspense
      fallback={<Spinner />}
    >
      <TabPanel tab={tab} />
    </Suspense>
  );
}`;

const searchItems = (tone: 'good' | 'muted') => [
  { id: 'r1', label: 'Pizza Palace', icon: '🍕', tone },
  { id: 'r2', label: 'Pizza Corner', icon: '🍕', tone },
  { id: 'r3', label: 'Pita Place', icon: '🥙', tone },
];

const hookChain = (mode: 'build' | 'walk' | 'broken') => {
  const broken = mode === 'broken';
  return {
    type: 'diagram' as const,
    title: broken ? 'isAdmin flipped to false' : 'Hooks on the fiber',
    cols: 1,
    rows: 4,
    nodes: [
      { id: 'fiber', label: 'Profile fiber', icon: '🧵', sub: 'hook list', x: 0, y: 0, tone: 'info' as const },
      { id: 'h1', label: 'Slot 1', sub: "name: ''", x: 0, y: 1, active: mode === 'walk' },
      {
        id: 'h2',
        label: 'Slot 2',
        sub: broken ? "bio reads 'admin' 😱" : "role: 'admin'",
        x: 0,
        y: 2,
        tone: broken ? ('bad' as const) : undefined,
        active: mode === 'walk' || broken,
      },
      { id: 'h3', label: 'Slot 3', sub: broken ? 'never reached' : "bio: ''", x: 0, y: 3, dim: broken },
    ],
    edges: [
      { from: 'fiber', to: 'h1', label: 'first', active: true },
      { from: 'h1', to: 'h2', label: 'next', tone: broken ? ('bad' as const) : undefined },
      { from: 'h2', to: 'h3', label: 'next', dashed: broken },
    ],
    packets:
      mode === 'build'
        ? []
        : [{ from: 'h1', to: 'h2', label: broken ? 'bio?' : '2', tone: broken ? ('bad' as const) : ('accent' as const) }],
    caption: broken ? 'React only counts' : mode === 'walk' ? 'same order, every render' : 'one node per hook call',
  };
};

const listNodes = (paused: boolean) => [
  { id: 'app', label: 'App', x: 1, y: 0, active: !paused },
  { id: 'header', label: 'Header', x: 0, y: 1.5, tone: 'good' as const, sub: 'done ✓' },
  {
    id: 'list',
    label: 'List',
    x: 1,
    y: 1.5,
    active: !paused,
    sub: paused ? 'paused ⏸' : 'working…',
    tone: paused ? ('warn' as const) : undefined,
  },
  { id: 'footer', label: 'Footer', x: 2, y: 1.5, dim: true },
  { id: 'item', label: 'Item', x: 1, y: 3, dim: true },
];

const listEdges = [
  { from: 'app', to: 'header', label: 'child' },
  { from: 'header', to: 'list', active: true },
  { from: 'list', to: 'footer' },
  { from: 'list', to: 'item', label: 'child' },
  { from: 'footer', to: 'app', label: 'return', dashed: true },
];

const twoTrees = (swapped: boolean) => ({
  type: 'diagram' as const,
  title: swapped ? 'Commit = swap' : 'Two trees, twin fibers',
  cols: 3,
  rows: 4,
  nodes: [
    {
      id: 'curHead',
      label: swapped ? 'Old' : 'Current',
      sub: swapped ? 'reused next time' : 'on screen',
      x: 0,
      y: 0,
      shape: 'pill' as const,
      dim: swapped,
    },
    {
      id: 'wipHead',
      label: swapped ? 'Current' : 'Draft',
      sub: swapped ? 'on screen now' : 'work in progress',
      x: 2,
      y: 0,
      shape: 'pill' as const,
      active: swapped,
      tone: 'accent' as const,
    },
    { id: 'cApp', label: 'App', x: 0, y: 1.4, dim: swapped },
    { id: 'cList', label: 'List', x: 0, y: 2.8, dim: swapped },
    { id: 'wApp', label: 'App', x: 2, y: 1.4, tone: 'accent' as const, active: swapped },
    { id: 'wList', label: 'List', x: 2, y: 2.8, tone: 'accent' as const, active: swapped },
  ],
  edges: [
    { from: 'cApp', to: 'wApp', label: swapped ? undefined : 'alternate', both: true, dashed: true, active: !swapped },
    { from: 'cList', to: 'wList', label: swapped ? undefined : 'alternate', both: true, dashed: true, active: !swapped },
  ],
  packets: swapped ? [{ from: 'cApp', to: 'wApp', label: 'swap', tone: 'good' as const, loop: false }] : [],
  caption: swapped ? 'the draft becomes the screen' : 'every fiber has a twin',
});

const effectSteps = (layout: boolean) =>
  layout
    ? [
        { label: 'Render', icon: '🧮' },
        { label: 'Commit', icon: '📝' },
        { label: 'useLayoutEffect', sub: 'measure + setH', icon: '📏', tone: 'good' as const },
        { label: 'Paint', sub: 'already correct ✅', icon: '🎨' },
      ]
    : [
        { label: 'Render', icon: '🧮' },
        { label: 'Commit', icon: '📝' },
        { label: 'Paint', sub: 'user sees h = 0 😬', icon: '🎨', tone: 'bad' as const },
        { label: 'useEffect', sub: 'measure + setH', icon: '📏' },
      ];

const transitionLanes = {
  type: 'diagram' as const,
  title: 'Two lanes',
  cols: 3,
  rows: 4,
  nodes: [
    { id: 'key', label: 'Keystroke', icon: '⌨️', x: 0, y: 0.4, tone: 'good' as const, active: true },
    { id: 'input', label: 'Input', sub: 'updates now', x: 2, y: 0.4, tone: 'good' as const },
    { id: 'slow', label: 'Big list', icon: '🐢', sub: 'background', x: 0, y: 2.6, tone: 'warn' as const },
    { id: 'list', label: 'Results', sub: 'restarted ↺', x: 2, y: 2.6, dim: true },
  ],
  edges: [
    { from: 'key', to: 'input', label: 'urgent', active: true },
    { from: 'slow', to: 'list', label: 'interruptible', dashed: true, tone: 'warn' as const },
    { from: 'key', to: 'slow', label: 'interrupts', tone: 'bad' as const },
  ],
  packets: [{ from: 'key', to: 'input', tone: 'good' as const }],
  caption: 'urgent work cuts in line',
};

export const series: Series = {
  id: 'react-under-the-hood',
  title: 'React under the hood',
  emoji: '⚛️',
  color: '#61dafb',
  order: 1,
  blurb: 'What React actually does when your components run.',
  reels: [
    {
      id: 'jsx-is-just-objects',
      title: 'JSX is just objects',
      beats: [
        {
          say: 'A JSX tag is just a plain object. You can log it.',
          speak: 'A J S X tag is just a plain object. You can log it.',
          scene: {
            type: 'title',
            kicker: 'React basics',
            title: 'JSX is just an *object*',
            emoji: '📦',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['object', 'log'],
        },
        {
          say: "Let's try it. Make a Greeting tag, and log it. No magic.",
          scene: { type: 'code', lang: 'tsx', file: 'App.tsx', code: jsxLog, highlight: [5] },
          sfx: 'type',
          emphasis: ['log'],
        },
        {
          say: 'JSX is sugar. Babel turns that tag into a plain function call, like this one.',
          speak: 'J S X is sugar. Babel turns that tag into a plain function call, like this one.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'App.tsx',
            code: jsxCompiled,
            highlight: [[5, 8]],
            note: { line: 8, text: 'same thing, by hand', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['sugar', 'function'],
        },
        {
          say: 'And that call returns a tiny object. A type, some props, a key, and a ref.',
          scene: {
            type: 'terminal',
            title: 'Console',
            lines: [
              { out: '{' },
              { out: '  type: ƒ Greeting,', tone: 'accent' },
              { out: "  props: { name: 'Ana' }," },
              { out: '  key: null,' },
              { out: '  ref: null' },
              { out: '}' },
            ],
          },
          sfx: 'pop',
          emphasis: ['tiny', 'object'],
        },
        {
          say: "Type is your component function. For a lowercase built-in tag, it's just a string.",
          scene: {
            type: 'list',
            title: 'Four fields',
            items: [
              { text: '*type*', icon: '🏷️', sub: 'Greeting, or a string' },
              { text: 'props', icon: '🎒', sub: "{ name: 'Ana' }" },
              { text: 'key', icon: '🔑', sub: 'not inside props' },
              { text: 'ref', icon: '🪝' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['function', 'string'],
        },
        {
          say: "Notice key isn't inside props. React pulls it out and keeps it for itself.",
          scene: {
            type: 'list',
            title: 'Four fields',
            items: [
              { text: 'type', icon: '🏷️', sub: 'Greeting, or a string' },
              { text: 'props', icon: '🎒', sub: "{ name: 'Ana' }" },
              { text: '*key*', icon: '🔑', sub: 'not inside props' },
              { text: 'ref', icon: '🪝' },
            ],
            active: 2,
          },
          emphasis: ['key', 'itself'],
        },
        {
          say: "Making this object draws nothing. It's a recipe, not the meal.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'app', title: 'Greeting', icon: '👋', body: 'Nothing rendered yet. Just an object in memory.' },
            caption: 'recipe, not the meal 🍝',
          },
          sfx: 'swipe',
          emphasis: ['nothing', 'recipe'],
        },
        {
          say: "In dev, React freezes it. Elements are read only, so don't mutate props.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'App.tsx',
            code: jsxMutate,
            errors: [7],
            note: { line: 7, text: 'frozen in dev 🧊', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['freezes', 'mutate'],
        },
        {
          say: 'Quick check. You write a Greeting tag. Does the Greeting function run right then?',
          scene: {
            type: 'quiz',
            question: 'You write <Greeting />. Does Greeting() run now?',
            options: ['Yes, right away', 'No, later, during render'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['run'],
        },
        {
          say: 'Nope. Only the object gets made. React calls your function later, when it renders.',
          scene: {
            type: 'quiz',
            question: 'You write <Greeting />. Does Greeting() run now?',
            options: ['Yes, right away', 'No, later, during render'],
            answer: 1,
            reveal: true,
            explain: 'JSX makes a description. React calls Greeting later.',
          },
          sfx: 'ding',
          emphasis: ['later'],
        },
        {
          say: 'Remember this. Your whole UI is a tree of tiny, frozen objects. React reads them later.',
          scene: {
            type: 'outro',
            points: ['JSX becomes a function call', 'It returns { type, props, key, ref }', 'A *description*, not a render'],
            tagline: 'Recipe, not the meal.',
          },
          sfx: 'success',
          emphasis: ['tree', 'objects'],
        },
      ],
    },
    {
      id: 'render-vs-commit',
      title: 'Render is not commit',
      beats: [
        {
          say: "React called your component. The screen didn't change. Not yet.",
          scene: {
            type: 'title',
            kicker: 'React internals',
            title: 'Render ≠ *paint*',
            sub: 'your function ran. the screen didn’t move.',
            emoji: '🎬',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ["didn't", 'yet'],
        },
        {
          say: "Here's a clock. Every second the time changes. Right below it sits an input.",
          scene: { type: 'code', lang: 'tsx', file: 'Clock.tsx', code: clock, highlight: [4, 5] },
          sfx: 'type',
          emphasis: ['clock', 'input'],
        },
        {
          say: 'Step one, trigger. The first mount, or someone called a state setter.',
          scene: {
            type: 'timeline',
            title: 'Every update',
            steps: [
              { label: 'Trigger', sub: 'mount or setState', icon: '🔔' },
              { label: 'Render', sub: 'call your components', icon: '🧮' },
              { label: 'Commit', sub: 'touch the screen', icon: '📱', tone: 'accent' },
            ],
            active: 0,
          },
          sfx: 'swipe',
          emphasis: ['trigger'],
        },
        {
          say: "Step two, render. React calls your component function. That's all render means.",
          scene: {
            type: 'tree',
            title: 'Render: in memory',
            root: {
              id: 'clock',
              label: 'Clock',
              active: true,
              children: [
                { id: 'h1', label: 'h1', dim: true },
                { id: 'input', label: 'input', dim: true },
              ],
            },
            caption: 'screen untouched',
          },
          sfx: 'swipe',
          emphasis: ['calls', 'all'],
        },
        {
          say: 'It walks down and builds a fresh tree of objects in memory. The screen stays exactly the same.',
          scene: {
            type: 'tree',
            title: 'Render: in memory',
            root: {
              id: 'clock',
              label: 'Clock',
              active: true,
              children: [
                { id: 'h1', label: 'h1', active: true, dirty: true },
                { id: 'input', label: 'input', active: true },
              ],
            },
            caption: 'a pure calculation',
          },
          sfx: 'pop',
          emphasis: ['memory', 'same'],
        },
        {
          say: 'Step three, commit. React compares the new tree with the last one, and applies only the differences.',
          scene: {
            type: 'diagram',
            title: 'Commit: apply the diff',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'old', label: 'Last tree', sub: 'h1: 10:00:01', x: 0, y: 0, tone: 'muted' },
              { id: 'new', label: 'New tree', sub: 'h1: 10:00:02', x: 2, y: 0, tone: 'accent' },
              { id: 'diff', label: 'Compare', icon: '🔍', x: 1, y: 1.5, shape: 'pill', active: true },
              { id: 'screen', label: 'Screen', icon: '📱', sub: '1 change', x: 1, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'old', to: 'diff' },
              { from: 'new', to: 'diff' },
              { from: 'diff', to: 'screen', active: true },
            ],
            packets: [{ from: 'diff', to: 'screen', label: 'h1 text', tone: 'good' }],
            caption: 'only the difference is applied',
          },
          sfx: 'pop',
          emphasis: ['commit', 'differences'],
        },
        {
          say: 'So each second, only the h1 text changes. The input keeps what you typed, because React never recreated it.',
          speak: 'So each second, only the H 1 text changes. The input keeps what you typed, because React never recreated it.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Clock',
              icon: '⏰',
              items: [
                { id: 'h1', label: '10:00:02', icon: '🕙', tone: 'accent' },
                { id: 'input', label: 'Note', value: 'buy milk', tone: 'good' },
              ],
              toast: 'only the h1 updated',
            },
            caption: 'your typing survives',
          },
          sfx: 'success',
          emphasis: ['only', 'keeps'],
        },
        {
          say: 'That is why render must be pure. Side effects wait until after commit.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Clock.tsx',
            code: impureClock,
            errors: [2],
            note: { line: 2, text: 'side effect in render ❌', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['pure', 'after'],
        },
        {
          say: 'Quick check. Your component re-rendered. Did the screen redraw?',
          scene: {
            type: 'quiz',
            question: 'Your component re-rendered. Did the screen change?',
            options: ['Yes, always', 'Only if commit finds a change'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['redraw'],
        },
        {
          say: 'Only if commit found a difference. Re-render just means your function ran.',
          scene: {
            type: 'quiz',
            question: 'Your component re-rendered. Did the screen change?',
            options: ['Yes, always', 'Only if commit finds a change'],
            answer: 1,
            reveal: true,
            explain: 'Render = your function ran. Commit = screen changes.',
          },
          sfx: 'ding',
          emphasis: ['function', 'ran'],
        },
        {
          say: 'Remember this. Render is React doing math. Commit is React touching the screen.',
          scene: {
            type: 'outro',
            points: ['Trigger, render, *commit*', 'Render calls your function, in memory', 'Commit applies only the diff'],
            tagline: 'Render thinks. Commit acts.',
          },
          sfx: 'success',
          emphasis: ['math', 'screen'],
        },
      ],
    },
    {
      id: 'fiber-work-units',
      title: "Fiber: React's pausable loop",
      beats: [
        {
          say: "React can pause halfway through rendering. That's what Fiber is.",
          scene: {
            type: 'title',
            kicker: 'React internals',
            title: 'React can *pause* mid-render',
            emoji: '⏸️',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['pause', 'Fiber'],
        },
        {
          say: "Old React rendered with recursion. Once it started a big tree, it couldn't stop.",
          scene: {
            type: 'compare',
            title: 'Before and after Fiber',
            left: { title: 'Old React', verdict: 'bad', icon: '🌀', items: ['Recursive calls', "Can't stop midway", 'Big tree, frozen UI'] },
            right: { title: 'Fiber', verdict: 'ok', icon: '🧵', items: ['A loop over objects', 'Stop after any one', 'Resume or toss it'] },
          },
          sfx: 'swipe',
          emphasis: ['recursion', "couldn't"],
        },
        {
          say: 'Fiber made each component a unit of work. A plain object, called a fiber.',
          scene: { type: 'code', lang: 'ts', file: 'Fiber.ts', code: fiberType, highlight: [[2, 3]] },
          sfx: 'type',
          emphasis: ['unit', 'fiber'],
        },
        {
          say: "Three pointers matter most. Child, sibling, and return. That's a tree you can walk with a simple loop.",
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'Fiber.ts',
            code: fiberType,
            highlight: [[4, 6]],
            note: { line: 6, text: 'return = go back to parent', tone: 'accent' },
          },
          emphasis: ['child', 'sibling', 'return'],
        },
        {
          say: 'React walks it one fiber at a time. And after any fiber, it can stop.',
          scene: {
            type: 'diagram',
            title: 'One fiber at a time',
            cols: 3,
            rows: 4,
            nodes: listNodes(false),
            edges: listEdges,
            packets: [{ from: 'header', to: 'list', label: '▶', tone: 'accent' }],
            caption: 'child ↓   sibling →   return ↺',
          },
          sfx: 'pop',
          emphasis: ['one', 'stop'],
        },
        {
          say: 'A tap lands during low priority work? React handles the tap first, then comes back. Or tosses the half done work.',
          scene: {
            type: 'diagram',
            title: 'Urgent tap, cut the line',
            cols: 3,
            rows: 4,
            nodes: [...listNodes(true), { id: 'tap', label: 'Tap!', icon: '👆', x: 2, y: 3, tone: 'warn', active: true }],
            edges: listEdges,
            caption: 'pause, prioritize, resume',
          },
          sfx: 'riser',
          emphasis: ['pauses', 'away'],
        },
        {
          say: "There are two trees. Current is what's on screen. Work in progress is the draft. Each fiber points to its twin through alternate.",
          scene: twoTrees(false),
          sfx: 'swipe',
          emphasis: ['two', 'draft', 'alternate'],
        },
        {
          say: 'When the draft is finished, React swaps them. That swap is the commit.',
          scene: twoTrees(true),
          sfx: 'success',
          emphasis: ['swaps', 'commit'],
        },
        {
          say: 'Quick check. Did Fiber make React render faster?',
          scene: {
            type: 'quiz',
            question: 'What did Fiber really change?',
            options: ['Raw render speed', 'Rendering became schedulable'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['faster'],
        },
        {
          say: 'Not really. It made rendering schedulable. The goal is a responsive app, not raw speed.',
          scene: {
            type: 'quiz',
            question: 'What did Fiber really change?',
            options: ['Raw render speed', 'Rendering became schedulable'],
            answer: 1,
            reveal: true,
            explain: 'Pause, prioritize, reuse, or abort. Responsiveness first.',
          },
          sfx: 'ding',
          emphasis: ['schedulable', 'responsive'],
        },
        {
          say: 'Remember this. A fiber is a bookmark in a to do list. React can always put the book down.',
          speak: 'Remember this. A fiber is a bookmark in a to-do list. React can always put the book down.',
          scene: {
            type: 'outro',
            points: ['One fiber per component', 'child, sibling, return: a *loop*', 'Two trees. Commit swaps them.'],
            tagline: 'Pausable by design.',
          },
          sfx: 'success',
          emphasis: ['bookmark', 'down'],
        },
      ],
    },
    {
      id: 'where-hook-state-lives',
      title: 'Hooks are a linked list',
      beats: [
        {
          say: "React has no idea what your state is called. It just counts.",
          scene: {
            type: 'title',
            kicker: 'React internals',
            title: 'React just *counts* hooks',
            emoji: '🔗',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['idea', 'counts'],
        },
        {
          say: 'Here are three hooks. When this function ends, it forgets everything. So where do the values go?',
          scene: { type: 'code', lang: 'tsx', file: 'Profile.tsx', code: profile(false), highlight: [[2, 7]] },
          sfx: 'type',
          emphasis: ['forgets', 'where'],
        },
        {
          say: 'Onto the fiber from last time. Each hook call adds one node to a linked list.',
          scene: hookChain('build'),
          sfx: 'pop',
          emphasis: ['fiber', 'node'],
        },
        {
          say: 'Next render, React walks that list in order. Slot one, slot two, slot three.',
          scene: hookChain('walk'),
          sfx: 'click',
          emphasis: ['order'],
        },
        {
          say: 'That is the trick. No names, no ids. Just slot one, two, three.',
          scene: {
            type: 'stat',
            value: '1, 2, 3',
            label: 'React only *counts*',
            sub: 'no names. just call order.',
            tone: 'accent',
          },
          sfx: 'ding',
          emphasis: ['names', 'three'],
        },
        {
          say: 'Now put a hook inside an if. When isAdmin flips to false, the count shifts.',
          speak: 'Now put a hook inside an if. When is Admin flips to false, the count shifts.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Profile.tsx',
            code: profile(true),
            errors: [[4, 7]],
            note: { line: 7, text: 'slot 2? or skipped?', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['if', 'shifts'],
        },
        {
          say: 'Bio grabs the role slot by mistake. Then React throws: rendered fewer hooks than expected.',
          scene: hookChain('broken'),
          sfx: 'error',
          emphasis: ['role', 'fewer'],
        },
        {
          say: "That's the whole reason for the rules of hooks. Top level only, same order, every single render.",
          scene: {
            type: 'list',
            title: 'Rules of hooks',
            items: [
              { text: 'Top level only', icon: '⬆️', sub: 'no if, no loops', tone: 'good' },
              { text: 'Same *order* every render', icon: '🔢', tone: 'good' },
              { text: 'Only in components', icon: '⚛️', sub: 'or custom hooks', tone: 'good' },
            ],
          },
          sfx: 'pop',
          emphasis: ['rules', 'order'],
        },
        {
          say: 'Quick check. Do custom hooks get their own list?',
          scene: {
            type: 'quiz',
            question: 'Where do a custom hook’s hooks go?',
            options: ['Their own list', 'The calling component’s list'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['own'],
        },
        {
          say: "No. They're plain functions, so their hooks land in the caller's list. Same rules apply.",
          scene: {
            type: 'quiz',
            question: 'Where do a custom hook’s hooks go?',
            options: ['Their own list', 'The calling component’s list'],
            answer: 1,
            reveal: true,
            explain: 'Custom hooks append to the caller’s list.',
          },
          sfx: 'ding',
          emphasis: ['plain', 'caller'],
        },
        {
          say: "Remember this. The lint rule isn't being picky. It's protecting a counter.",
          scene: {
            type: 'outro',
            points: ['Hooks are a linked list on the fiber', 'Matched by *position*, not name', 'Never call hooks conditionally'],
            tagline: 'Hooks are counted.',
          },
          sfx: 'success',
          emphasis: ['picky', 'counter'],
        },
      ],
    },
    {
      id: 'what-setstate-really-does',
      title: 'What setState really does',
      beats: [
        {
          say: 'Calling setState does not change your variable. Not even a little.',
          speak: 'Calling set state does not change your variable. Not even a little.',
          scene: {
            type: 'title',
            kicker: 'React internals',
            title: 'setState does *not* assign',
            emoji: '🤯',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['not'],
        },
        {
          say: 'Here is a counter. We tap the button, add one, then log count.',
          scene: { type: 'code', lang: 'tsx', file: 'Counter.tsx', code: counter, highlight: [[5, 8]] },
          sfx: 'type',
          emphasis: ['log'],
        },
        {
          say: 'The log prints zero. The old value, from this render.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Counter.tsx',
            code: counter,
            errors: [7],
            note: { line: 7, text: 'logs 0 😱', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['zero', 'old'],
        },
        {
          say: "That's because setState doesn't assign anything. It drops an update into a queue and asks React for a render.",
          speak:
            "That's because set state doesn't assign anything. It drops an update into a queue, and asks React for a render.",
          scene: {
            type: 'diagram',
            title: 'What setCount(count + 1) does',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'code', label: 'onPress', icon: '👆', x: 0, y: 0, shape: 'pill' },
              { id: 'queue', label: 'Update queue', sub: '[ +1 ]', icon: '📥', x: 0, y: 1.6, active: true },
              { id: 'react', label: 'React scheduler', icon: '⚛️', x: 0, y: 3.1, tone: 'info' },
            ],
            edges: [
              { from: 'code', to: 'queue', label: 'enqueue', active: true },
              { from: 'queue', to: 'react', label: 'schedule render', dashed: true },
            ],
            packets: [{ from: 'code', to: 'queue', label: '+1' }],
          },
          sfx: 'pop',
          emphasis: ['queue', 'assign'],
        },
        {
          say: 'A moment later, React calls your component again, and useState hands back the new number.',
          speak: 'A moment later, React calls your component again, and use state hands back the new number.',
          scene: {
            type: 'timeline',
            title: 'One tap, four steps',
            steps: [
              { label: 'Tap', sub: 'count is 0 in this render', icon: '👆' },
              { label: 'Queue update', sub: 'setCount(count + 1)', icon: '📥' },
              { label: 'Render again', sub: 'Counter() runs, count is 1', icon: '🔁', tone: 'accent' },
              { label: 'Commit', sub: 'screen shows 1', icon: '📱' },
            ],
            active: 2,
          },
          sfx: 'whoosh',
          emphasis: ['again', 'new'],
        },
        {
          say: 'Only the component that owns the state and its children render again. The rest of the tree just chills.',
          scene: {
            type: 'tree',
            title: 'Who re-renders?',
            root: {
              id: 'app',
              label: 'App',
              dim: true,
              children: [
                { id: 'header', label: 'Header', dim: true },
                {
                  id: 'counter',
                  label: 'Counter',
                  active: true,
                  dirty: true,
                  children: [
                    { id: 'button', label: 'Button', active: true },
                    { id: 'text', label: 'Text', active: true },
                  ],
                },
                { id: 'footer', label: 'Footer', dim: true },
              ],
            },
            caption: 'state lives in Counter',
          },
          sfx: 'pop',
          emphasis: ['owns', 'chills'],
        },
        {
          say: 'Three setCount calls get batched into one render. But all three read the same old count, so you get one.',
          speak: 'Three set count calls get batched into one render. But all three read the same old count, so you get one.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Counter.tsx',
            code: triple('setCount(count + 1)'),
            errors: [[2, 4]],
            note: { line: 4, text: '0 + 1, three times → 1', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['one', 'same'],
        },
        {
          say: 'Pass a function instead. Each update gets the latest value from the queue, so now you get three.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Counter.tsx',
            code: triple('setCount((c) => c + 1)'),
            added: [[2, 4]],
            note: { line: 4, text: '0 → 1 → 2 → 3 ✅', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['function', 'three'],
        },
        {
          say: 'Quick check. Count is already five, and you set it to five. What happens?',
          scene: {
            type: 'quiz',
            question: 'count is 5. You call setCount(5). Then?',
            options: ['It re-renders anyway', 'React bails out early', 'It throws an error'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['five'],
        },
        {
          say: 'React compares old and new with Object dot is, sees nothing changed, and skips the extra work.',
          scene: {
            type: 'quiz',
            question: 'count is 5. You call setCount(5). Then?',
            options: ['It re-renders anyway', 'React bails out early', 'It throws an error'],
            answer: 1,
            reveal: true,
            explain: 'Object.is(5, 5) is true, so React bails out.',
          },
          sfx: 'ding',
          emphasis: ['nothing', 'skips'],
        },
        {
          say: 'Remember this. setState schedules, it never assigns. Your variable is a snapshot of one render.',
          speak: 'Remember this. Set state schedules, it never assigns. Your variable is a snapshot of one render.',
          scene: {
            type: 'outro',
            points: [
              'setState queues an update. It never assigns.',
              'count is a snapshot of this render',
              'Need the latest? setCount((c) => c + 1)',
            ],
            tagline: 'Schedules, not assigns.',
          },
          sfx: 'success',
          emphasis: ['schedules', 'snapshot'],
        },
      ],
    },
    {
      id: 'why-keys-matter',
      title: 'Why keys matter',
      beats: [
        {
          say: 'One wrong key, and your list quietly swaps everyone’s data.',
          scene: {
            type: 'title',
            kicker: 'React lists',
            title: 'Wrong key, *swapped* data',
            emoji: '🔑',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['wrong', 'swaps'],
        },
        {
          say: "Here's a shopping list. Every row has its own text box, and I typed a note in each.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Groceries',
              icon: '🛒',
              items: [
                { id: 'r0', label: 'Milk', icon: '🥛', value: '2 litres' },
                { id: 'r1', label: 'Eggs', icon: '🥚', value: 'a dozen' },
              ],
              button: '+ Add to top',
            },
            caption: 'each row owns a note',
          },
          sfx: 'pop',
          emphasis: ['own', 'note'],
        },
        {
          say: 'Now I add bread to the top. Wait. Bread says two litres, and the eggs lost their note!',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Groceries',
              icon: '🛒',
              items: [
                { id: 'r0', label: 'Bread', icon: '🍞', value: '2 litres', tone: 'bad' },
                { id: 'r1', label: 'Milk', icon: '🥛', value: 'a dozen', tone: 'bad' },
                { id: 'r2', label: 'Eggs', icon: '🥚', value: '', tone: 'bad' },
              ],
              button: '+ Add to top',
              toast: 'Bread added',
            },
            tap: { x: 0.5, y: 0.86 },
            caption: 'notes stayed in place 😬',
          },
          sfx: 'error',
          emphasis: ['bread', 'lost'],
        },
        {
          say: 'The culprit is this line. We used the array index as the key.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ShoppingList.tsx',
            code: list('i'),
            errors: [3],
            note: { line: 3, text: 'position, not identity', tone: 'bad' },
          },
          sfx: 'type',
          emphasis: ['index'],
        },
        {
          say: 'React matches rows by key. Key zero existed before, so it keeps key zero’s state, even though the label is now bread.',
          scene: {
            type: 'diagram',
            title: 'React matches by key',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'k0', label: 'key 0', sub: 'Milk → Bread', x: 0, y: 0.6, tone: 'bad', active: true },
              { id: 'k1', label: 'key 1', sub: 'Eggs → Milk', x: 0, y: 1.8, tone: 'bad' },
              { id: 'k2', label: 'key 2', sub: 'new → Eggs', x: 0, y: 3, tone: 'info' },
              { id: 's0', label: '“2 litres”', icon: '📝', x: 2, y: 0.6 },
              { id: 's1', label: '“a dozen”', icon: '📝', x: 2, y: 1.8 },
              { id: 's2', label: 'empty', icon: '📝', x: 2, y: 3, dim: true },
            ],
            edges: [
              { from: 'k0', to: 's0', label: 'kept', tone: 'bad', active: true },
              { from: 'k1', to: 's1', label: 'kept', tone: 'bad' },
              { from: 'k2', to: 's2', label: 'fresh', dashed: true },
            ],
            packets: [{ from: 'k0', to: 's0', tone: 'bad' }],
          },
          sfx: 'pop',
          emphasis: ['key', 'keeps'],
        },
        {
          say: 'So inserting at the top, deleting, or sorting shifts the positions and drags the wrong state along.',
          scene: {
            type: 'list',
            title: 'Index keys break on…',
            items: [
              { text: 'Insert at the top', icon: '⬆️', tone: 'bad' },
              { text: 'Delete a row', icon: '🗑️', tone: 'bad' },
              { text: 'Sort or filter', icon: '🔀', tone: 'bad' },
            ],
          },
          sfx: 'pop',
          emphasis: ['inserting', 'deleting', 'sorting'],
        },
        {
          say: 'The fix is tiny. Use a stable id that travels with the item.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'ShoppingList.tsx',
            code: list('item.id'),
            added: [3],
            note: { line: 3, text: 'identity travels with data', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['stable', 'id'],
        },
        {
          say: 'Now bread arrives as a brand new empty row, and milk and eggs keep their own notes.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Groceries',
              icon: '🛒',
              items: [
                { id: 'bread', label: 'Bread', icon: '🍞', value: '', tone: 'good' },
                { id: 'milk', label: 'Milk', icon: '🥛', value: '2 litres', tone: 'good' },
                { id: 'eggs', label: 'Eggs', icon: '🥚', value: 'a dozen', tone: 'good' },
              ],
              button: '+ Add to top',
              toast: 'Notes stayed put ✅',
            },
            caption: 'state follows the item',
          },
          sfx: 'success',
          emphasis: ['new', 'own'],
        },
        {
          say: 'Index keys are only safe when the list never inserts, deletes, or reorders. Ever.',
          scene: {
            type: 'compare',
            title: 'Pick your key',
            left: {
              title: 'key={index}',
              verdict: 'bad',
              items: ['Sticks to positions', 'Breaks on insert, sort', 'Static lists only'],
            },
            right: {
              title: 'key={item.id}',
              verdict: 'ok',
              items: ['Follows the item', 'Unique per sibling', 'Never changes'],
            },
          },
          sfx: 'whoosh',
          emphasis: ['safe', 'never'],
        },
        {
          say: 'Remember this. Keys are identity. Use a stable id, and never use Math dot random as a key.',
          scene: {
            type: 'outro',
            points: [
              'Keys tell React who is who',
              'Index keys glue state to positions',
              'Use a stable id. Never Math.random()',
            ],
            tagline: 'Keys are identity.',
          },
          sfx: 'success',
          emphasis: ['identity', 'stable'],
        },
      ],
    },
    {
      id: 'effect-timing',
      title: 'useEffect vs useLayoutEffect',
      beats: [
        {
          say: 'Your tooltip flickers because useEffect runs after paint.',
          speak: 'Your tooltip flickers because use effect runs after paint.',
          scene: {
            type: 'title',
            kicker: 'React timing',
            title: 'One frame of *flicker*',
            sub: 'useEffect vs useLayoutEffect',
            emoji: '⚡',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['flickers', 'after'],
        },
        {
          say: 'Here is a tooltip. For one frame it shows up squished, then it jumps into place. Ugh.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Settings',
              icon: '⚙️',
              items: [
                { id: 'help', label: 'Dark mode', icon: '🌙', checked: true },
                { id: 'notif', label: 'Notifications', icon: '🔔', checked: true },
                { id: 'tip', label: 'Tooltip', sub: 'height: 0 → 48 💥', icon: '💬', tone: 'bad' },
              ],
            },
            caption: 'wrong for one frame',
          },
          sfx: 'error',
          emphasis: ['one', 'jumps'],
        },
        {
          say: 'The code measures the tooltip inside useEffect, then saves its height.',
          speak: 'The code measures the tooltip inside use effect, then saves its height.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Tooltip.tsx',
            code: measure('useEffect'),
            highlight: [3],
            note: { line: 6, text: 'measure, then save', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['measures', 'height'],
        },
        {
          say: 'But useEffect usually lets the screen paint first. So for a moment, you see height zero.',
          speak: 'But use effect usually lets the screen paint first. So for a moment, you see height zero.',
          scene: { type: 'timeline', title: 'With useEffect', steps: effectSteps(false), active: 2 },
          sfx: 'swipe',
          emphasis: ['paint', 'zero'],
        },
        {
          say: 'useLayoutEffect runs before paint. And state you set inside it also lands before paint.',
          speak: 'Use layout effect runs before paint. And state you set inside it also lands before paint.',
          scene: { type: 'timeline', title: 'With useLayoutEffect', steps: effectSteps(true), active: 2 },
          sfx: 'click',
          emphasis: ['before'],
        },
        {
          say: "Swap one word. On React Native's new renderer, measuring here is synchronous, so the fix lands before anyone sees a thing.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Tooltip.tsx',
            code: measure('useLayoutEffect'),
            added: [3],
            note: { line: 3, text: 'no flicker ✅', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['synchronous', 'before'],
        },
        {
          say: 'The catch? Layout effects block painting. So use the plain one by default, and the layout one only to measure and adjust.',
          scene: {
            type: 'compare',
            title: 'Which one?',
            left: { title: 'useEffect', verdict: 'ok', icon: '🟢', items: ['Your default', "Doesn't block paint", 'Fetch, log, subscribe'] },
            right: { title: 'Layout effect', verdict: 'neutral', icon: '📏', items: ['Blocks paint', 'Measure, then adjust', 'Keep it tiny'] },
          },
          sfx: 'swipe',
          emphasis: ['block', 'default'],
        },
        {
          say: 'Quick check. Does useEffect always run after paint?',
          speak: 'Quick check. Does use effect always run after paint?',
          scene: {
            type: 'quiz',
            question: 'Does useEffect ALWAYS run after paint?',
            options: ['Yes, always', 'Usually, not always'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['always'],
        },
        {
          say: 'Usually, not always. If a click caused it, React may run it before paint, so the result is ready.',
          scene: {
            type: 'quiz',
            question: 'Does useEffect ALWAYS run after paint?',
            options: ['Yes, always', 'Usually, not always'],
            answer: 1,
            reveal: true,
            explain: 'Effects from a click may run before paint.',
          },
          sfx: 'ding',
          emphasis: ['usually', 'click'],
        },
        {
          say: 'Remember this. Layout effect is for measuring. Everything else goes in useEffect.',
          speak: 'Remember this. Layout effect is for measuring. Everything else goes in use effect.',
          scene: {
            type: 'outro',
            points: ['useEffect: usually after paint', 'useLayoutEffect: *before* paint', 'Measure and adjust? Use layout.'],
            tagline: 'Measure before paint.',
          },
          sfx: 'success',
          emphasis: ['measuring', 'everything'],
        },
      ],
    },
    {
      id: 'memo-and-the-compiler',
      title: 'The compiler writes your memo',
      beats: [
        {
          say: 'Your memo does nothing. One inline object breaks it, every render.',
          scene: {
            type: 'title',
            kicker: 'React performance',
            title: 'Your memo does *nothing*',
            sub: 'until the compiler steps in',
            emoji: '🤖',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['nothing', 'inline'],
        },
        {
          say: 'Here is a memo child. Memo means: if my props look the same, skip me.',
          scene: { type: 'code', lang: 'tsx', file: 'Parent.tsx', code: memoChild, highlight: [[1, 2]] },
          sfx: 'type',
          emphasis: ['same', 'skip'],
        },
        {
          say: 'But this child still re-renders every time Parent does. Rude.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Parent.tsx',
            code: memoChild,
            errors: [9],
            note: { line: 9, text: 'new object every render', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['still', 'rude'],
        },
        {
          say: 'Look the same means each prop passes Object dot is. Two new objects fail, even with the same stuff inside.',
          scene: {
            type: 'terminal',
            title: 'Object.is',
            lines: [
              { cmd: 'Object.is(8, 8)' },
              { out: 'true', tone: 'good' },
              { cmd: 'Object.is({a: 1}, {a: 1})' },
              { out: 'false', tone: 'bad' },
            ],
          },
          sfx: 'type',
          emphasis: ['prop', 'fail'],
        },
        {
          say: 'The manual fix: useMemo hands back the same object every render, so the check passes.',
          speak: 'The manual fix: use memo hands back the same object every render, so the check passes.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Parent.tsx',
            code: memoManual,
            added: [[2, 5]],
            note: { line: 5, text: 'same reference ✅', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['same', 'passes'],
        },
        {
          say: "Now the parent re-renders, and the child gets skipped. That's all memo, useMemo, and useCallback do. Keep references stable.",
          speak: "Now the parent re-renders, and the child gets skipped. That's all memo, use memo, and use callback do. Keep references stable.",
          scene: {
            type: 'tree',
            title: 'Parent re-renders',
            root: {
              id: 'parent',
              label: 'Parent',
              active: true,
              dirty: true,
              children: [
                { id: 'child', label: 'Child', dim: true },
                { id: 'other', label: 'Header', active: true },
              ],
            },
            caption: 'Child skipped 😴',
          },
          sfx: 'success',
          emphasis: ['skipped', 'stable'],
        },
        {
          say: 'Or let the React Compiler do it. It is a Babel plugin, it must run first, and it works best on React nineteen.',
          scene: { type: 'code', lang: 'js', file: 'babel.config.js', code: babelConfig, added: [5], note: { line: 5, text: 'first in the pipeline', tone: 'warn' } },
          sfx: 'type',
          emphasis: ['Babel', 'first'],
        },
        {
          say: "It adds the caching wherever it's safe. The docs even say you can safely remove React dot memo.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Parent.tsx',
            code: memoCompiled,
            highlight: [8],
            note: { line: 8, text: 'cached for you ✨', tone: 'good' },
          },
          sfx: 'ding',
          emphasis: ['safe', 'remove'],
        },
        {
          say: 'Quick check. Does memo guarantee your component skips a render?',
          scene: {
            type: 'quiz',
            question: 'Memo guarantees a skipped render?',
            options: ['Yes, always', 'No, it is just an optimization'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['guarantee'],
        },
        {
          say: "No. It's a performance optimization, not a promise. Measure first, memo second.",
          scene: {
            type: 'quiz',
            question: 'Memo guarantees a skipped render?',
            options: ['Yes, always', 'No, it is just an optimization'],
            answer: 1,
            reveal: true,
            explain: 'Memoization is a performance hint, not a guarantee.',
          },
          sfx: 'ding',
          emphasis: ['optimization', 'measure'],
        },
        {
          say: 'Remember this. Memo is about stable references. Let the compiler keep them stable for you.',
          scene: {
            type: 'outro',
            points: ['memo compares with Object.is', 'New object = *new* props', 'Compiler adds the caching'],
            tagline: 'Stable refs, skipped work.',
          },
          sfx: 'success',
          emphasis: ['stable', 'compiler'],
        },
      ],
    },
    {
      id: 'concurrent-transitions-suspense',
      title: 'Transitions: interruptible renders',
      beats: [
        {
          say: 'Typing stays smooth, even while React rebuilds a giant list.',
          scene: {
            type: 'title',
            kicker: 'Concurrent React',
            title: 'Smooth typing, *giant* list',
            emoji: '⌨️',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['smooth', 'giant'],
        },
        {
          say: 'You type in a search box, and every key re-filters thousands of rows. Now each key feels sticky.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Find food',
              icon: '🔎',
              items: [{ id: 'q', label: 'Search', value: 'pi', tone: 'bad' }, ...searchItems('muted')],
              toast: 'Filtering 10,000 rows…',
            },
            caption: 'every key waits for the list 🐌',
          },
          sfx: 'error',
          emphasis: ['every', 'sticky'],
        },
        {
          say: 'Remember Fiber can pause? This is the API that uses it. Wrap the slow update in startTransition.',
          speak: 'Remember Fiber can pause? This is the API that uses it. Wrap the slow update in start transition.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Search.tsx',
            code: transition,
            highlight: [[8, 10]],
            note: { line: 10, text: 'low priority', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['pause', 'startTransition'],
        },
        {
          say: 'Now the keystroke goes first. If you type mid render, React drops the slow work and starts it again.',
          scene: transitionLanes,
          sfx: 'pop',
          emphasis: ['first', 'again'],
        },
        {
          say: "And isPending tells you it's still cooking, so you can dim the old results.",
          speak: "And is Pending tells you it's still cooking, so you can dim the old results.",
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'app', title: 'Find food', icon: '🔎', items: [{ id: 'q', label: 'Search', value: 'pizza', tone: 'good' }, ...searchItems('muted')] },
            caption: 'isPending: dim, don’t block',
          },
          sfx: 'click',
          emphasis: ['isPending', 'dim'],
        },
        {
          say: 'Now Suspense. A boundary shows a fallback until the stuff inside is ready.',
          scene: { type: 'code', lang: 'tsx', file: 'Tabs.tsx', code: suspense, highlight: [[3, 5]] },
          sfx: 'type',
          emphasis: ['Suspense', 'fallback'],
        },
        {
          say: 'Switch tabs normally and the spinner flashes. Inside a transition, the old tab stays until the new one is ready.',
          scene: {
            type: 'compare',
            title: 'Switching tabs',
            left: { title: 'Normal update', verdict: 'bad', icon: '⏳', items: ['Old tab vanishes', 'Spinner flashes'] },
            right: { title: 'In a transition', verdict: 'ok', icon: '✨', items: ['Old tab stays', 'Swaps when ready'] },
          },
          sfx: 'swipe',
          emphasis: ['flashes', 'stays'],
        },
        {
          say: 'Quick check. Does a fetch inside useEffect trigger Suspense?',
          speak: 'Quick check. Does a fetch inside use effect trigger Suspense?',
          scene: {
            type: 'quiz',
            question: 'fetch() in useEffect. Does Suspense kick in?',
            options: ['Yes', 'No'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['fetch'],
        },
        {
          say: 'No. Only lazy, the use hook, and Suspense-ready data libraries trigger it.',
          scene: {
            type: 'quiz',
            question: 'fetch() in useEffect. Does Suspense kick in?',
            options: ['Yes', 'No'],
            answer: 1,
            reveal: true,
            explain: 'Only lazy, use, and Suspense-aware libraries.',
          },
          sfx: 'ding',
          emphasis: ['lazy', 'use'],
        },
        {
          say: "Remember this. Transitions don't make work faster. They make it interruptible. And React Native supports them too.",
          scene: {
            type: 'outro',
            points: ['startTransition = low priority', 'Urgent updates *cut in line*', 'Works in RN’s new renderer'],
            tagline: 'Interruptible, not faster.',
          },
          sfx: 'success',
          emphasis: ['interruptible'],
        },
      ],
    },
  ],
};
