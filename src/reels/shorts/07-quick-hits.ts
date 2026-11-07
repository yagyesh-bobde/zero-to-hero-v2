import type { Series } from '../types';

// Short-form sampler: one 2–4 beat reel per format (tip, spot the bug, myth vs fact,
// before → after, this vs that, command of the day, interview question).
// An intentional exception to the 45–70s explainer format in AUTHORING.md §7.

const leakyEffect = `useEffect(() => {
  const sub = Keyboard.addListener(
    'keyboardDidShow',
    onShow,
  );
}, []);`;

const fixedEffect = `useEffect(() => {
  const sub = Keyboard.addListener(
    'keyboardDidShow',
    onShow,
  );
  return () => sub.remove();
}, []);`;

const cart = (check: string) => `function Cart({ count }) {
  return (
    <View>
      <Text>Cart</Text>
      {${check} && <Badge />}
    </View>
  );
}`;

const cartQuiz = {
  type: 'quiz' as const,
  question: 'The cart is empty, so count is 0. What happens?',
  options: ['The badge hides', 'The app crashes', 'It shows a 0 badge'],
  answer: 1,
};

const adbReverse = [
  { cmd: 'adb reverse tcp:8081 tcp:8081' },
  { out: '# phone :8081 → laptop :8081', tone: 'muted' as const },
];

// Where the app looks for Metro over USB, before and after `adb reverse`.
const metroMap = (fixed: boolean) => ({
  type: 'diagram' as const,
  title: 'Where is Metro?',
  cols: 1,
  rows: 3,
  nodes: [
    { id: 'phone', label: 'Your phone', sub: 'asks localhost:8081', icon: '📱', x: 0, y: 0, active: !fixed },
    { id: 'laptop', label: 'Metro', sub: 'on your laptop', icon: '💻', x: 0, y: 2, active: fixed, dim: !fixed },
  ],
  edges: [{ from: 'phone', to: 'laptop', dashed: !fixed, active: fixed, tone: fixed ? ('good' as const) : ('bad' as const) }],
  packets: fixed ? [{ from: 'phone', to: 'laptop', label: ':8081', tone: 'good' as const }] : [],
  caption: fixed ? 'phone :8081 → laptop :8081' : 'localhost is the phone itself',
});

export const series: Series = {
  id: 'quick-hits',
  title: 'Quick hits',
  emoji: '⚡',
  color: '#facc15',
  order: 7,
  blurb: 'Fifteen-second React Native wins: tips, bugs, myths and interview answers.',
  reels: [
    {
      id: 'tip-hit-slop',
      title: '10-second tip: hitSlop',
      voice: 'af_heart',
      speed: 1.2,
      beats: [
        {
          say: "Tiny button, hard to tap? Don't make it bigger.",
          emphasis: ['tap'],
          scene: { type: 'title', kicker: '10-second tip', title: 'Tiny button? Hard to *tap*?', emoji: '👆', style: 'slam' },
        },
        {
          say: "Add hitSlop. The touch area grows, but the layout doesn't move.",
          speak: "Add hit slop. The touch area grows, but the layout doesn't move.",
          emphasis: ['hitSlop', 'grows'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'CloseButton.tsx',
            code: `<Pressable
  onPress={onClose}
  hitSlop={14}
>
  <CloseIcon size={16} />
</Pressable>`,
            highlight: [3],
            note: { line: 3, text: '+14pt on every side', tone: 'accent' },
          },
        },
        {
          say: "Sixteen plus fourteen on each side is forty-four, Apple's minimum tap size.",
          emphasis: ['forty-four'],
          sfx: 'ding',
          scene: { type: 'stat', value: '44', unit: 'pt', label: "Apple's minimum *tap target*", sub: '16 + 14 + 14, same look', tone: 'good' },
        },
      ],
    },
    {
      id: 'bug-zero-and',
      title: 'Spot the bug: the empty cart',
      voice: 'am_fenrir',
      speed: 1.05,
      beats: [
        {
          say: 'Spot the bug. This cart works fine, until it is empty.',
          emphasis: ['bug', 'empty'],
          sfx: 'type',
          scene: { type: 'code', lang: 'tsx', file: 'Cart.tsx', code: cart('count') },
        },
        {
          say: 'Count is zero. What happens?',
          emphasis: ['zero'],
          sfx: 'riser',
          scene: cartQuiz,
        },
        {
          say: "It crashes. The check returns zero, and React Native can't render raw text outside Text.",
          emphasis: ['crashes', 'Text'],
          sfx: 'error',
          scene: { ...cartQuiz, reveal: true, explain: '0 && <Badge /> is 0. A bare 0 outside <Text> throws.' },
        },
        {
          say: 'Compare to zero, so the check is a real boolean.',
          emphasis: ['boolean'],
          sfx: 'success',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Cart.tsx',
            code: cart('count > 0'),
            added: [5],
            note: { line: 5, text: 'true or false, never 0', tone: 'good' },
          },
        },
      ],
    },
    {
      id: 'myth-webview',
      title: 'Myth vs fact: the WebView',
      voice: 'af_bella',
      speed: 1.1,
      beats: [
        {
          say: 'Myth: React Native is just a website inside a WebView.',
          speak: 'Myth: React Native is just a website inside a web view.',
          emphasis: ['WebView'],
          scene: { type: 'title', kicker: 'Myth vs fact', title: 'React Native is a *WebView*?', emoji: '🕸️', style: 'glitch' },
        },
        {
          say: "Fact: there's no browser at all. Your components become real native views.",
          emphasis: ['native', 'views'],
          scene: {
            type: 'compare',
            title: 'Is it a WebView?',
            left: { title: 'Myth', verdict: 'bad', icon: '🕸️', items: ['HTML in a WebView', 'Styled by CSS'] },
            right: { title: 'Fact', verdict: 'ok', icon: '📱', items: ['Real native views', 'No browser at all'] },
          },
        },
        {
          say: 'Your View goes through Fabric, and comes out a UIView on iOS and a ViewGroup on Android.',
          speak: 'Your View goes through Fabric, and comes out a U I View on iOS and a View Group on Android.',
          emphasis: ['UIView', 'ViewGroup'],
          sfx: 'swipe',
          scene: {
            type: 'diagram',
            title: 'One View, two platforms',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'view', label: '<View>', sub: 'your JSX', icon: '⚛️', x: 1, y: 0 },
              { id: 'fabric', label: 'Fabric', sub: 'renderer', icon: '🧵', x: 1, y: 1, active: true },
              { id: 'ios', label: 'UIView', sub: 'iOS', icon: '🍎', x: 0, y: 2, tone: 'good' },
              { id: 'android', label: 'ViewGroup', sub: 'Android', icon: '🤖', x: 2, y: 2, tone: 'good' },
            ],
            edges: [
              { from: 'view', to: 'fabric', active: true },
              { from: 'fabric', to: 'ios' },
              { from: 'fabric', to: 'android' },
            ],
            caption: 'real native views, no WebView',
          },
        },
      ],
    },
    {
      id: 'before-after-cleanup',
      title: 'Before → after: the leak',
      voice: 'am_puck',
      speed: 1.1,
      beats: [
        {
          say: 'One line fixes this leak.',
          emphasis: ['leak'],
          scene: { type: 'title', kicker: 'Before → after', title: 'One line fixes this *leak*', emoji: '🩹', style: 'slam' },
        },
        {
          say: 'Before: every mount adds a keyboard listener, and nothing ever removes it.',
          emphasis: ['nothing', 'removes'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Chat.tsx',
            code: leakyEffect,
            errors: [[2, 5]],
            note: { line: 5, text: 'never removed', tone: 'bad' },
          },
        },
        {
          say: 'After: return a cleanup. React calls it on unmount, and the listener is gone.',
          emphasis: ['cleanup', 'gone'],
          sfx: 'success',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Chat.tsx',
            code: fixedEffect,
            added: [6],
            note: { line: 6, text: 'runs on unmount', tone: 'good' },
          },
        },
      ],
    },
    {
      id: 'flatlist-vs-flashlist',
      title: 'This vs that: FlashList',
      voice: 'af_sarah',
      speed: 1.1,
      beats: [
        {
          say: 'FlatList or FlashList? One thing decides it.',
          speak: 'Flat List or Flash List? One thing decides it.',
          emphasis: ['decides'],
          scene: { type: 'title', kicker: 'This vs that', title: 'FlatList or *FlashList*?', emoji: '⚡', style: 'stack' },
        },
        {
          say: 'FlatList mounts new rows as you scroll. FlashList recycles the rows that scrolled away.',
          speak: 'Flat List mounts new rows as you scroll. Flash List recycles the rows that scrolled away.',
          emphasis: ['recycles'],
          scene: {
            type: 'compare',
            title: 'How they scroll',
            left: { title: 'FlatList', verdict: 'neutral', icon: '📜', items: ['Built into RN', 'Mounts new rows', 'Unmounts old ones'] },
            right: { title: 'FlashList', verdict: 'ok', icon: '♻️', items: ['From Shopify', 'Reuses row views', 'Smooth long feeds'] },
          },
        },
        {
          say: 'Switching is easy. Same data and renderItem props, just a new import.',
          speak: 'Switching is easy. Same data and render item props, just a new import.',
          emphasis: ['easy'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Feed.tsx',
            code: `import { FlashList }
  from '@shopify/flash-list';

<FlashList
  data={posts}
  renderItem={renderPost}
/>`,
            highlight: [[1, 2]],
          },
        },
      ],
    },
    {
      id: 'command-adb-reverse',
      title: 'Command of the day: adb reverse',
      voice: 'am_michael',
      speed: 1.05,
      beats: [
        {
          say: "Your Android phone can't reach Metro over USB?",
          emphasis: ['Metro'],
          scene: { type: 'title', kicker: 'Command of the day', title: "Phone can't reach *Metro*?", emoji: '🔌', style: 'slam' },
        },
        {
          say: 'On a real phone, localhost means the phone itself, so it never finds your laptop.',
          speak: 'On a real phone, local host means the phone itself, so it never finds your laptop.',
          emphasis: ['itself'],
          sfx: 'error',
          scene: metroMap(false),
        },
        {
          say: "Run adb reverse. The phone's Metro port now tunnels to your laptop.",
          speak: "Run A D B reverse. The phone's Metro port now tunnels to your laptop.",
          emphasis: ['tunnels'],
          sfx: 'type',
          scene: { type: 'terminal', title: 'Over USB', lines: adbReverse },
        },
        {
          say: 'Now the app finds Metro. Replugged the cable? Run it again.',
          emphasis: ['Metro', 'again'],
          sfx: 'success',
          scene: metroMap(true),
        },
      ],
    },
    {
      id: 'interview-bridge',
      title: 'Interview question: the bridge',
      voice: 'bm_george',
      speed: 1.0,
      beats: [
        {
          say: 'Interview question: what replaced the bridge in React Native?',
          emphasis: ['bridge'],
          scene: { type: 'title', kicker: 'Interview question', title: 'What replaced the *bridge*?', emoji: '🎤', style: 'slam' },
        },
        {
          say: 'The answer is JSI. JavaScript calls native code directly, with no JSON queue in between.',
          speak: 'The answer is J S I. JavaScript calls native code directly, with no JSON queue in between.',
          emphasis: ['JSI', 'directly'],
          sfx: 'ding',
          scene: {
            type: 'compare',
            title: 'The answer: JSI',
            left: { title: 'Old bridge', verdict: 'bad', icon: '🐢', items: ['Async messages', 'All JSON, both ways'] },
            right: { title: 'JSI', verdict: 'ok', icon: '⚡', items: ['Direct native calls', 'Sync when needed'] },
          },
        },
        {
          say: 'Bonus points: TurboModules for native calls, and Fabric for rendering, both built on JSI.',
          speak: 'Bonus points: Turbo Modules for native calls, and Fabric for rendering, both built on J S I.',
          emphasis: ['TurboModules', 'Fabric'],
          sfx: 'success',
          scene: {
            type: 'list',
            title: 'Built on JSI',
            items: [
              { text: '*TurboModules*', icon: '🔌', sub: 'native modules, loaded lazily' },
              { text: '*Fabric*', icon: '🎨', sub: 'the new renderer' },
              { text: 'Codegen', icon: '🧬', sub: 'typed glue from your specs' },
            ],
          },
        },
      ],
    },
  ],
};
