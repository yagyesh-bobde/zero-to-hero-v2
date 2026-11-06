import type { Series } from '../types';

const nativeJsx = `function Hello() {
  return (
    <View>
      <Text>Hi</Text>
      <TextInput />
    </View>
  );
}`;

const bundle = `var __DEV__ = false;

__d(function (...) {
  /* your App.tsx */
}, 0, [1, 2]);

__d(function (...) {
  /* react */
}, 1, []);

__r(0);`;

const appIcons = [
  { icon: '📸', label: 'Instagram' },
  { icon: '🏦', label: 'Bank' },
  { icon: '🗺️', label: 'Maps' },
  { icon: '🎵', label: 'Music' },
  { icon: '💬', label: 'Chat' },
  { icon: '⚙️', label: 'Settings' },
];

export const series: Series = {
  id: 'zero-to-mobile',
  title: 'Zero to Mobile',
  emoji: '📱',
  color: '#2dd4bf',
  order: 0,
  blurb: 'What a mobile app really is, and where React Native fits in.',
  reels: [
    {
      id: 'what-is-an-app',
      title: 'Your app is just a process',
      beats: [
        {
          say: 'Every app on your phone is secretly a zip file.',
          scene: {
            type: 'title',
            kicker: 'Mobile basics',
            title: 'Your app is a *zip file*',
            sub: 'that becomes a process',
            emoji: '📦',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['zip', 'secretly'],
        },
        {
          say: "On Android it's an APK. On iOS it's an IPA. Let's peek inside one.",
          speak: "On Android it's an A P K. On iOS it's an I P A. Let's peek inside one.",
          scene: {
            type: 'terminal',
            title: 'Unzip an Android app',
            lines: [
              { cmd: 'unzip -l app-release.apk' },
              { out: 'AndroidManifest.xml', tone: 'accent' },
              { out: 'classes.dex' },
              { out: 'res/' },
              { out: 'assets/index.android.bundle' },
            ],
          },
          sfx: 'type',
          emphasis: ['APK', 'IPA'],
        },
        {
          say: "Compiled code, images, and a manifest that basically says, here's my front door.",
          scene: {
            type: 'list',
            title: 'Inside the zip',
            items: [
              { text: 'Compiled *code*', icon: '⚙️' },
              { text: 'Images and assets', icon: '🖼️' },
              { text: 'The *manifest*', icon: '🚪', sub: '“start here”' },
            ],
            active: 2,
          },
          sfx: 'pop',
          emphasis: ['manifest', 'door'],
        },
        {
          say: 'Now you tap Instagram. The OS starts a brand new process, just for that app.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'home', apps: appIcons, highlight: 'Instagram' },
            caption: 'tap → new process',
          },
          sfx: 'click',
          emphasis: ['new', 'process'],
        },
        {
          say: "Android even gives each app its own Linux user, so apps can't read each other's files.",
          scene: {
            type: 'diagram',
            title: 'One app, one process',
            cols: 3,
            rows: 2,
            nodes: [
              { id: 'insta', label: 'Instagram', icon: '📸', sub: 'uid 10123', x: 0, y: 0, active: true },
              { id: 'wall', label: 'Sandbox', icon: '🧱', x: 1, y: 1, shape: 'pill', tone: 'bad' },
              { id: 'bank', label: 'Bank', icon: '🏦', sub: 'uid 10124', x: 2, y: 0, tone: 'info' },
            ],
            edges: [
              { from: 'insta', to: 'wall', tone: 'bad', dashed: true },
              { from: 'bank', to: 'wall', tone: 'bad', dashed: true },
            ],
            caption: 'every app gets its own Linux user',
          },
          sfx: 'pop',
          emphasis: ['own', "can't"],
        },
        {
          say: 'That process gets its own memory and its own threads. A tiny private world.',
          scene: {
            type: 'diagram',
            title: 'One app, one process',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'insta', label: 'Instagram', icon: '📸', sub: 'uid 10123', x: 1, y: 0, active: true },
              { id: 'mem', label: 'Own memory', icon: '🧠', x: 0, y: 2, tone: 'accent' },
              { id: 'thr', label: 'Own threads', icon: '🧵', x: 2, y: 2, tone: 'accent' },
            ],
            edges: [
              { from: 'insta', to: 'mem', active: true },
              { from: 'insta', to: 'thr', active: true },
            ],
            caption: 'a private little world',
          },
          sfx: 'pop',
          emphasis: ['memory', 'threads'],
        },
        {
          say: 'Swipe it away in the app switcher, and the process dies. Everything in memory is gone.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'killed', app: 'Instagram', icon: '📸', reason: 'Process killed. Memory wiped.' },
          },
          sfx: 'error',
          emphasis: ['dies', 'gone'],
        },
        {
          say: 'So a cold start means: load the package, create the process, run your entry point. From zero.',
          scene: {
            type: 'timeline',
            title: 'Cold start',
            steps: [
              { label: 'Tap', icon: '👆' },
              { label: 'Load the package', sub: '.apk / .ipa', icon: '📦' },
              { label: 'New process', sub: 'own user, own memory', icon: '⚙️' },
              { label: 'Run entry point', sub: 'your code starts here', icon: '▶️', tone: 'accent' },
            ],
            active: 3,
          },
          sfx: 'whoosh',
          emphasis: ['cold', 'zero'],
        },
        {
          say: 'Quick check. You left an app an hour ago. Is it still running?',
          scene: {
            type: 'quiz',
            question: 'You left an app an hour ago. Still running?',
            options: ['Yes, always', 'Maybe not. The OS may kill it'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['still'],
        },
        {
          say: 'Often not. The OS shuts down processes it no longer needs, or when it wants memory back.',
          scene: {
            type: 'quiz',
            question: 'You left an app an hour ago. Still running?',
            options: ['Yes, always', 'Maybe not. The OS may kill it'],
            answer: 1,
            reveal: true,
            explain: 'The OS kills processes it no longer needs, or to recover memory.',
          },
          sfx: 'ding',
          emphasis: ['memory'],
        },
        {
          say: 'Remember this. An app is a package that becomes one sandboxed process. React Native lives inside it.',
          scene: {
            type: 'outro',
            points: ['APK or IPA: a zip of code and assets', 'Tap = a fresh, sandboxed *process*', 'Process killed = memory gone'],
            tagline: 'One app, one process.',
          },
          sfx: 'success',
          emphasis: ['package', 'process'],
        },
      ],
    },
    {
      id: 'rn-is-not-a-webview',
      title: "React Native isn't a WebView",
      beats: [
        {
          say: 'React Native has zero HTML in it. Not one single div.',
          speak: 'React Native has zero H T M L in it. Not one single div.',
          scene: {
            type: 'title',
            kicker: 'Myth check',
            title: 'Zero HTML. *Not one div.*',
            emoji: '🚫',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['zero', 'div'],
        },
        {
          say: "Here's normal React Native code. A View, some Text, and a TextInput.",
          speak: "Here's normal React Native code. A View, some Text, and a Text Input.",
          scene: { type: 'code', lang: 'tsx', file: 'Hello.tsx', code: nativeJsx, highlight: [[3, 6]] },
          sfx: 'type',
          emphasis: ['View', 'Text'],
        },
        {
          say: 'A WebView app ships HTML and lets a hidden browser draw it. React Native does not.',
          speak: 'A web view app ships H T M L and lets a hidden browser draw it. React Native does not.',
          scene: {
            type: 'compare',
            title: 'Two very different apps',
            left: { title: 'WebView app', verdict: 'neutral', icon: '🌐', items: ['Ships HTML and CSS', 'A browser draws it', 'Cordova, Ionic'] },
            right: { title: 'React Native', verdict: 'ok', icon: '📱', items: ['No HTML at all', 'No browser', 'Real native views'] },
          },
          sfx: 'swipe',
          emphasis: ['browser', 'not'],
        },
        {
          say: 'Your JavaScript runs in a real JS engine inside the app. When it says View, you get a real native view.',
          speak: 'Your JavaScript runs in a real J S engine inside the app. When it says View, you get a real native view.',
          scene: {
            type: 'diagram',
            title: 'What each tag becomes',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'v', label: '<View>', sub: 'you write', x: 1, y: 0, active: true },
              { id: 'va', label: 'ViewGroup', sub: '🤖 Android', x: 0, y: 1, tone: 'good' },
              { id: 'vi', label: 'UIView', sub: '🍎 iOS', x: 2, y: 1, tone: 'info' },
            ],
            edges: [
              { from: 'v', to: 'va', active: true },
              { from: 'v', to: 'vi', active: true },
            ],
            packets: [
              { from: 'v', to: 'va', tone: 'accent' },
              { from: 'v', to: 'vi', tone: 'accent' },
            ],
            caption: 'a real native view, not a div',
          },
          sfx: 'pop',
          emphasis: ['real', 'native'],
        },
        {
          say: 'Text becomes a TextView. TextInput becomes an EditText. The same classes a Kotlin dev would use.',
          speak: 'Text becomes a Text View. Text Input becomes an Edit Text. The same classes a Kotlin dev would use.',
          scene: {
            type: 'diagram',
            title: 'What each tag becomes',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'v', label: '<View>', sub: 'you write', x: 1, y: 0, dim: true },
              { id: 'va', label: 'ViewGroup', sub: '🤖 Android', x: 0, y: 0, tone: 'good', dim: true },
              { id: 'vi', label: 'UIView', sub: '🍎 iOS', x: 2, y: 0, tone: 'info', dim: true },
              { id: 't', label: 'Text', x: 1, y: 1, active: true },
              { id: 'ta', label: 'TextView', x: 0, y: 1, tone: 'good' },
              { id: 'ti', label: 'UIText\u200bView', x: 2, y: 1, tone: 'info' },
              { id: 'i', label: 'TextInput', x: 1, y: 2, active: true },
              { id: 'ia', label: 'EditText', x: 0, y: 2, tone: 'good' },
              { id: 'ii', label: 'UITextField', x: 2, y: 2, tone: 'info' },
            ],
            edges: [
              { from: 'v', to: 'va' },
              { from: 'v', to: 'vi' },
              { from: 't', to: 'ta', active: true },
              { from: 't', to: 'ti', active: true },
              { from: 'i', to: 'ia', active: true },
              { from: 'i', to: 'ii', active: true },
            ],
            packets: [
              { from: 't', to: 'ta', tone: 'accent' },
              { from: 'i', to: 'ia', tone: 'accent' },
            ],
            caption: 'the same classes a Kotlin dev uses',
          },
          sfx: 'pop',
          emphasis: ['same', 'Kotlin'],
        },
        {
          say: "That's why React Native apps scroll and bounce like native apps. Because they are native.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Chats',
              icon: '💬',
              items: [
                { id: 'a', label: 'Mom', icon: '👩', sub: 'Call me back' },
                { id: 'b', label: 'Team', icon: '👥', sub: 'Ship it 🚀' },
                { id: 'c', label: 'Alex', icon: '🧑', sub: 'lol' },
              ],
            },
            caption: 'real UIViews, real scrolling',
          },
          sfx: 'swipe',
          emphasis: ['are'],
        },
        {
          say: "React itself doesn't care. It just needs a renderer. On the web, that's react-dom. Here, it's React Native.",
          speak: "React itself doesn't care. It just needs a renderer. On the web, that's react dom. Here, it's React Native.",
          scene: {
            type: 'tree',
            title: 'One React, many renderers',
            root: {
              id: 'react',
              label: 'React',
              children: [
                { id: 'dom', label: 'react-dom', dim: true, children: [{ id: 'html', label: 'HTML', dim: true }] },
                {
                  id: 'rn',
                  label: 'React Native',
                  active: true,
                  children: [
                    { id: 'uiv', label: 'UIView', active: true },
                    { id: 'vg', label: 'ViewGroup', active: true },
                  ],
                },
              ],
            },
            caption: 'same React, different renderer',
          },
          sfx: 'pop',
          emphasis: ['renderer'],
        },
        {
          say: 'Quick check. Does React Native secretly run your screens in a WebView?',
          scene: {
            type: 'quiz',
            question: 'Does React Native secretly use a WebView?',
            options: ['Yes, under the hood', 'Only if you add one'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['secretly'],
        },
        {
          say: 'Nope. You only get a WebView if you add one yourself, like for a help page.',
          scene: {
            type: 'quiz',
            question: 'Does React Native secretly use a WebView?',
            options: ['Yes, under the hood', 'Only if you add one'],
            answer: 1,
            reveal: true,
            explain: 'Screens are platform views. A WebView is opt-in.',
          },
          sfx: 'ding',
          emphasis: ['yourself'],
        },
        {
          say: 'Remember this. React decides what to show. Native decides how to draw it.',
          scene: {
            type: 'outro',
            points: ['No HTML, no DOM, no browser', '<View> is a real *native view*', 'React picks what. Native draws it.'],
            tagline: 'Real views, not a webpage.',
          },
          sfx: 'success',
          emphasis: ['what', 'how'],
        },
      ],
    },
    {
      id: 'expo-vs-bare',
      title: 'Expo vs bare, honestly',
      beats: [
        {
          say: 'Expo Go is a demo app. It was never your app.',
          scene: {
            type: 'title',
            kicker: 'Expo, untangled',
            title: 'Expo Go was *never* your app',
            emoji: '🧪',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['never'],
        },
        {
          say: "Expo Go is someone else's finished app. It just downloads your JavaScript and runs it.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Expo Go',
              icon: '🧪',
              items: [
                { id: 'proj', label: 'my-app', icon: '📦', sub: 'loading your JS…' },
                { id: 'native', label: 'Native side', icon: '🔒', sub: 'prebuilt by Expo' },
              ],
              loading: true,
            },
            caption: 'someone else’s binary',
          },
          sfx: 'pop',
          emphasis: ['finished', 'JavaScript'],
        },
        {
          say: "Great for learning. But you can't add a native library to an app you didn't build.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Expo Go',
              icon: '🧪',
              items: [
                { id: 'proj', label: 'my-app', icon: '📦', sub: 'running' },
                { id: 'native', label: 'Native side', icon: '🔒', sub: 'prebuilt by Expo' },
                { id: 'sdk', label: 'Camera SDK', icon: '📷', sub: 'needs native code', tone: 'bad' },
              ],
              toast: 'Not supported in Expo Go',
            },
            caption: 'no native code allowed',
          },
          sfx: 'error',
          emphasis: ["didn't"],
        },
        {
          say: 'The fix is a development build. Your own app, compiled by you, with a tiny dev client inside.',
          scene: {
            type: 'terminal',
            title: 'Make a dev build',
            lines: [
              { cmd: 'npm i expo-dev-client' },
              { cmd: 'npx expo run:ios' },
              { out: '✓ Built my-app.app\n  with the dev client inside', tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['development', 'own'],
        },
        {
          say: 'Now it has your icon and your name. Add any native module you want.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'home',
              apps: [
                { icon: '🚀', label: 'My App' },
                { icon: '🗺️', label: 'Maps' },
                { icon: '🎵', label: 'Music' },
                { icon: '⚙️', label: 'Settings' },
              ],
              highlight: 'My App',
            },
            caption: 'your binary, your rules',
          },
          sfx: 'success',
          emphasis: ['your', 'any'],
        },
        {
          say: 'So where do the android and ios folders come from? Expo generates them from app dot json.',
          speak: 'So where do the android and iOS folders come from? Expo generates them from app dot json.',
          scene: {
            type: 'terminal',
            title: 'Where native folders come from',
            lines: [
              { cmd: 'ls' },
              { out: 'app.json  package.json  src/' },
              { cmd: 'npx expo prebuild --clean' },
              { out: '✨ android/  ios/', tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['generates'],
        },
        {
          say: 'This is called Continuous Native Generation. Think node modules, but for native projects.',
          scene: {
            type: 'diagram',
            title: 'Continuous Native Generation',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'cfg', label: 'app.json', icon: '📄', x: 1, y: 0, tone: 'accent' },
              { id: 'pb', label: 'prebuild', icon: '⚙️', x: 1, y: 1.5, shape: 'pill', active: true },
              { id: 'and', label: 'android/', icon: '🤖', x: 0, y: 3, sub: 'gitignored', tone: 'muted' },
              { id: 'ios', label: 'ios/', icon: '🍎', x: 2, y: 3, sub: 'gitignored', tone: 'muted' },
            ],
            edges: [
              { from: 'cfg', to: 'pb', active: true },
              { from: 'pb', to: 'and', label: 'generate' },
              { from: 'pb', to: 'ios', label: 'generate' },
            ],
            packets: [
              { from: 'pb', to: 'and', tone: 'accent' },
              { from: 'pb', to: 'ios', tone: 'accent' },
            ],
            caption: 'like node_modules, for native',
          },
          sfx: 'pop',
          emphasis: ['Continuous', 'gitignored'],
        },
        {
          say: 'Bare just means you keep those folders and edit them by hand. Full control, but prebuild will overwrite your edits.',
          scene: {
            type: 'compare',
            title: 'Generated vs hand-edited',
            left: { title: 'Generated', verdict: 'ok', icon: '✨', items: ['Config in app.json', 'Folders gitignored', 'Rebuilt any time'] },
            right: { title: 'Bare', verdict: 'neutral', icon: '🔧', items: ['Edit ios/ by hand', 'Full control', 'prebuild wipes it'] },
          },
          sfx: 'swipe',
          emphasis: ['hand', 'overwrite'],
        },
        {
          say: "Quick check. True or false? Expo apps can't use native code.",
          scene: {
            type: 'quiz',
            question: 'Expo apps can’t use native code.',
            options: ['True', 'False'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['native'],
        },
        {
          say: 'False. That limit is only Expo Go. A dev build runs any native code you add.',
          scene: {
            type: 'quiz',
            question: 'Expo apps can’t use native code.',
            options: ['True', 'False'],
            answer: 1,
            reveal: true,
            explain: 'Only Expo Go is locked. Dev builds take any native module.',
          },
          sfx: 'ding',
          emphasis: ['only'],
        },
        {
          say: 'Remember this. Expo Go is a playground. A dev build is your app. Go bare only when you must.',
          scene: {
            type: 'outro',
            points: ['Expo Go: someone else’s app', 'Dev build: *your* app, any native code', 'prebuild makes ios/ and android/'],
            tagline: 'Playground vs your app.',
          },
          sfx: 'success',
          emphasis: ['playground', 'your'],
        },
      ],
    },
    {
      id: 'what-is-a-bundle',
      title: "What's in the bundle",
      beats: [
        {
          say: 'Your four hundred files ship as one giant JavaScript file.',
          scene: {
            type: 'title',
            kicker: 'Metro, explained',
            title: '400 files. *One bundle.*',
            emoji: '🧳',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['one', 'giant'],
        },
        {
          say: 'Start your app and watch the terminal hit a hundred percent. What just happened?',
          scene: {
            type: 'terminal',
            title: 'Metro',
            lines: [
              { cmd: 'npm start' },
              { out: 'Welcome to Metro' },
              { out: 'BUNDLE  ./index.js' },
              { out: '████████ 100% (412/412)', tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['hundred'],
        },
        {
          say: 'Metro starts at index dot js, then follows every import, like a spider crawling a web.',
          scene: {
            type: 'tree',
            title: 'Follow every import',
            root: {
              id: 'index',
              label: 'index.js',
              active: true,
              children: [
                {
                  id: 'app',
                  label: 'App.tsx',
                  active: true,
                  children: [
                    { id: 'btn', label: 'Button', active: true },
                    { id: 'api', label: 'api.ts', active: true },
                  ],
                },
                { id: 'react', label: 'react', active: true, children: [{ id: 'sched', label: 'scheduler' }] },
              ],
            },
            caption: '🕷️ one import at a time',
          },
          sfx: 'pop',
          emphasis: ['every', 'spider'],
        },
        {
          say: 'Step one, resolve. Which file is the Button import? On iOS, it might pick Button dot ios dot js.',
          speak: 'Step one, resolve. Which file is the Button import? On iOS, it might pick Button dot iOS dot JS.',
          scene: {
            type: 'timeline',
            title: 'Three steps',
            steps: [
              { label: 'Resolve', sub: './Button → Button.ios.js', icon: '🔎' },
              { label: 'Transform', sub: 'Babel: TS + JSX → JS', icon: '🛠️' },
              { label: 'Serialize', sub: 'glue into one file', icon: '🧵', tone: 'accent' },
            ],
            active: 0,
          },
          sfx: 'swipe',
          emphasis: ['resolve'],
        },
        {
          say: 'Step two, transform. Babel turns TypeScript and JSX into plain JavaScript, in parallel, with a cache.',
          speak: 'Step two, transform. Babel turns TypeScript and J S X into plain JavaScript, in parallel, with a cache.',
          scene: {
            type: 'timeline',
            title: 'Three steps',
            steps: [
              { label: 'Resolve', sub: './Button → Button.ios.js', icon: '🔎' },
              { label: 'Transform', sub: 'Babel: TS + JSX → JS', icon: '🛠️' },
              { label: 'Serialize', sub: 'glue into one file', icon: '🧵', tone: 'accent' },
            ],
            active: 1,
          },
          emphasis: ['transform', 'plain'],
        },
        {
          say: 'Step three, serialize. Glue every module together into one single file.',
          scene: {
            type: 'timeline',
            title: 'Three steps',
            steps: [
              { label: 'Resolve', sub: './Button → Button.ios.js', icon: '🔎' },
              { label: 'Transform', sub: 'Babel: TS + JSX → JS', icon: '🛠️' },
              { label: 'Serialize', sub: 'glue into one file', icon: '🧵', tone: 'accent' },
            ],
            active: 2,
          },
          emphasis: ['serialize', 'one'],
        },
        {
          say: 'Inside, every module is wrapped in a function and given a number. Module zero needs one and two.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'index.bundle',
            code: bundle,
            highlight: [[3, 5]],
            note: { line: 5, text: 'module 0, needs 1 and 2', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['function', 'number'],
        },
        {
          say: 'The very last line says: run module zero. That is your app starting.',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'index.bundle',
            code: bundle,
            added: [11],
            note: { line: 11, text: '▶ run the entry point', tone: 'good' },
          },
          sfx: 'ding',
          emphasis: ['last', 'starting'],
        },
        {
          say: 'In dev, the phone downloads this file from Metro. In release, it ships inside the app, precompiled by Hermes.',
          scene: {
            type: 'compare',
            title: 'Same bundle, two lives',
            left: { title: 'Dev', verdict: 'neutral', icon: '🛠️', items: ['Fetched from Metro', 'Plain JS text', 'Parsed on the phone'] },
            right: { title: 'Release', verdict: 'ok', icon: '🚀', items: ['Inside the app', 'Hermes bytecode', 'A .hbc file'] },
          },
          sfx: 'swipe',
          emphasis: ['inside', 'Hermes'],
        },
        {
          say: 'Remember this. The bundle is one file, a stack of numbered modules, and one run call at the end.',
          scene: {
            type: 'outro',
            points: ['Metro follows every import', 'Each module: a function + a *number*', 'Release: Hermes bytecode'],
            tagline: 'One file. Numbered modules.',
          },
          sfx: 'success',
          emphasis: ['one', 'numbered'],
        },
      ],
    },
  ],
};
