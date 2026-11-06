import type { Series } from '../types';

const cameraPlist = `<key>NSCameraUsageDescription</key>
<string>Scan your receipts.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Pick a receipt photo.</string>`;

const cameraConfig = `{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription":
        "Scan your receipts."
    }
  },
  "plugins": [
    ["expo-camera", {
      "cameraPermission": "…"
    }]
  ]
}`;

const prePrompt = `const CAM = PERMISSIONS.IOS.CAMERA;
const s = await check(CAM);

if (s === RESULTS.DENIED) {
  // never asked yet
  if (await showExplainer()) {
    await request(CAM);
  }
} else if (s === RESULTS.BLOCKED) {
  // asked and refused
  showSettingsCard(openSettings);
}`;

const appState = (extra: string) => `useEffect(() => {
  const sub = AppState.addEventListener(
    'change',
    (s) => {
      if (s === 'background') flush();
      if (s === 'active') refetch();${extra}
    },
  );
  return () => sub.remove();
}, []);`;

const backgroundTask = `TaskManager.defineTask(
  'sync-outbox',
  async () => {
    await flushOutbox(); // ~30 s
    return BackgroundTask
      .BackgroundTaskResult.Success;
  },
);

await BackgroundTask.registerTaskAsync(
  'sync-outbox',
  { minimumInterval: 15 }, // minutes
);`;

const provisional = `// Notifee
await notifee.requestPermission({
  provisional: true,
});

// or expo-notifications
await requestPermissionsAsync({
  ios: { allowProvisional: true },
});`;

const richPayload = `{
  "aps": {
    "alert": {
      "title": "Order shipped",
      "body": "Tap to track"
    },
    "mutable-content": 1
  },
  "image": "https://cdn…/box.jpg"
}`;

const apsEntitlement = `<!-- App.entitlements -->
<key>aps-environment</key>
<string>production</string>`;

const aasa = `{
  "applinks": {
    "details": [{
      "appIDs": [
        "ABCDE12345.com.example.shop"
      ],
      "components": [
        { "/": "/p/*" },
        { "/": "/admin/*",
          "exclude": true }
      ]
    }]
  }
}`;

const associatedDomains = `{
  "expo": {
    "ios": {
      "associatedDomains": [
        "applinks:shop.example.com"
      ]
    }
  }
}`;

const tracking = `const { status } = await
  requestTrackingPermissionsAsync();

const idfa = status === 'granted'
  ? getAdvertisingId()
  : null; // zeros otherwise`;

const entitlements = `<!-- push -->
<key>aps-environment</key>
<string>production</string>
<!-- shared drawer for widgets -->
<key>…application-groups</key>
<array>
  <string>group.com.example.shop</string>
</array>
<!-- universal links -->
<key>…associated-domains</key>
<array>
  <string>applinks:shop.example.com</string>
</array>`;

const appGroup = `// app side: a tiny native module
let shared = UserDefaults(
  suiteName: "group.com.example.shop"
)!
shared.set("Out for delivery",
  forKey: "orderStatus")
WidgetCenter.shared.reloadTimelines(
  ofKind: "OrderWidget")

// widget side: TimelineProvider
let status = UserDefaults(
  suiteName: "group.com.example.shop"
)?.string(forKey: "orderStatus")`;

const attQuestion = 'Your SDK shows the ATT prompt on first launch. Good?';
const attOptions = ['Great, ask early', 'No, it wastes your one shot', 'Doesn’t matter'];

const permQuestion = 'check() returns DENIED on iOS. What does that mean?';
const permOptions = ['The user said no', 'Never asked yet', 'The app was reinstalled'];

const pushQuestion = 'The user never allowed notifications. Do pushes still reach the app?';
const pushOptions = ['No, Apple drops them', 'Yes, silently', 'Only on Wi‑Fi'];

export const series: Series = {
  id: 'ios-must-knows',
  title: 'iOS Must-Knows',
  emoji: '🍎',
  color: '#0a84ff',
  order: 4,
  blurb: 'The iOS rules your JavaScript never sees, and how to work with them.',
  reels: [
    // ───────────────────────── 1. Info.plist purpose strings
    {
      id: 'ios-info-plist-usage-strings',
      title: 'One missing string, instant crash',
      beats: [
        {
          say: 'Tap scan receipt, and your iOS app just vanishes. Blame one plist.',
          speak: 'Tap scan receipt, and your iOS app just vanishes. Blame one p list.',
          scene: {
            type: 'title',
            kicker: 'iOS Must-Knows',
            title: 'One missing string, *instant crash*',
            emoji: '💥',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['vanishes', 'plist'],
        },
        {
          say: "Here's an expense app. You add a scan receipt button, test it on Android, and ship.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Expenses',
              icon: '🧾',
              items: [
                { id: 'coffee', label: 'Coffee', icon: '☕', sub: 'today', value: '$4.50' },
                { id: 'lunch', label: 'Team lunch', icon: '🍜', sub: 'yesterday', value: '$62.00' },
              ],
              button: '📷 Scan receipt',
            },
            tap: { x: 0.5, y: 0.86 },
            caption: 'worked great on Android',
          },
          sfx: 'pop',
          emphasis: ['Android', 'ship'],
        },
        {
          say: 'The first iOS tester taps it, and the app is just gone. No red screen. No JS error.',
          speak: 'The first iOS tester taps it, and the app is just gone. No red screen. No J S error.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'killed', app: 'Expenses', icon: '🧾', reason: 'Terminated by iOS' },
            caption: 'no crash dialog, it just closes',
          },
          sfx: 'error',
          emphasis: ['gone', 'error'],
        },
        {
          say: "Xcode's console spills the truth. You touched the camera without a usage description.",
          scene: {
            type: 'terminal',
            title: 'Xcode console',
            lines: [
              { out: 'This app has crashed because it attempted to access privacy-sensitive data without a usage description.', tone: 'bad' },
              { out: 'Missing: NSCameraUsageDescription', tone: 'warn' },
            ],
          },
          sfx: 'type',
          emphasis: ['camera', 'description'],
        },
        {
          say: "The fix is one key in Info.plist, iOS's manifest. A purpose string that says why.",
          speak: "The fix is one key in Info p list, iOS's manifest. A purpose string that says why.",
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'Info.plist',
            code: cameraPlist,
            added: [[1, 2]],
            note: { line: 2, text: 'shown to the user, word for word', tone: 'good' },
          },
          sfx: 'success',
          emphasis: ['key', 'why'],
        },
        {
          say: 'Same rule for the mic, photos, location, contacts, Bluetooth, and tracking. No string, no mercy.',
          scene: {
            type: 'list',
            title: 'Needs a *purpose string*',
            items: [
              { text: 'Camera & microphone', icon: '📷' },
              { text: 'Photo library', icon: '🖼️' },
              { text: 'Location', icon: '📍' },
              { text: 'Contacts & Bluetooth', icon: '👥' },
              { text: 'Tracking', icon: '🕵️', sub: 'NSUserTrackingUsageDescription' },
            ],
          },
          sfx: 'pop',
          emphasis: ['mercy'],
        },
        {
          say: 'iOS shows your sentence right inside the prompt. So write it for the user, not the reviewer.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: '“Expenses”',
              icon: '📷',
              text: 'would like to access the camera. Scan your receipts.',
              allow: 'Allow',
              deny: 'Don’t Allow',
              choice: 'allow',
            },
            caption: 'your string, verbatim',
          },
          sfx: 'pop',
          emphasis: ['user', 'reviewer'],
        },
        {
          say: 'App Review checks too. If any code in your binary references the API, even a library, no string means rejected.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'notification',
              behind: 'home',
              notice: {
                app: 'App Store Connect',
                title: 'ITMS-90683: Missing purpose string',
                body: 'NSCameraUsageDescription not found in Info.plist',
                icon: '✉️',
              },
            },
            caption: 'rejected before a human looks',
          },
          sfx: 'error',
          emphasis: ['library', 'rejected'],
        },
        {
          say: 'In Expo, put the strings in your app config, or the library plugin option. Prebuild writes the plist.',
          speak: 'In Expo, put the strings in your app config, or the library plugin option. Prebuild writes the p list.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'app.json › expo',
            code: cameraConfig,
            highlight: [[3, 5], [9, 10]],
          },
          sfx: 'type',
          emphasis: ['Expo', 'prebuild'],
        },
        {
          say: 'Remember this. On iOS, private data starts with a sentence. No sentence, no app.',
          scene: {
            type: 'outro',
            points: [
              'Private data needs a *purpose string*',
              'Missing string means instant termination',
              'Write it for the user',
            ],
            tagline: 'No sentence, no app.',
          },
          sfx: 'success',
          emphasis: ['sentence'],
        },
      ],
    },

    // ───────────────────────── 2. One-shot permission prompt
    {
      id: 'ios-permission-prompt-one-shot',
      title: 'You get one shot',
      beats: [
        {
          say: "iOS shows your permission dialog once. Ever. Don't waste it.",
          scene: {
            type: 'title',
            kicker: 'iOS permissions',
            title: 'You get *one shot*',
            emoji: '🎯',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['once', 'ever'],
        },
        {
          say: "Your app opens for the first time and instantly asks for the camera. The user taps Don't Allow.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: '“Expenses”',
              icon: '📷',
              text: 'would like to access the camera.',
              allow: 'Allow',
              deny: 'Don’t Allow',
              choice: 'deny',
            },
            caption: 'first launch, zero context',
          },
          sfx: 'error',
          emphasis: ['instantly'],
        },
        {
          say: 'Android gives you two tries. iOS gives one. Now the only way back is Settings, and nobody goes there.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Settings › Expenses',
              icon: '⚙️',
              items: [
                { id: 'cam', label: 'Camera', icon: '📷', checked: false, tone: 'bad' },
                { id: 'notif', label: 'Notifications', icon: '🔔', checked: true },
                { id: 'photos', label: 'Photos', icon: '🖼️', sub: 'None' },
              ],
            },
            caption: 'the only way back 🪦',
          },
          sfx: 'click',
          emphasis: ['one', 'Settings'],
        },
        {
          say: 'So use a pre-prompt. Your own screen, your own words, with a Sure and a Not now.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Scan receipts?',
              icon: '📷',
              body: 'Point your camera at a receipt and we fill in the expense for you.',
              items: [
                { id: 'sure', label: 'Sure', icon: '👍', tone: 'good' },
                { id: 'later', label: 'Not now', icon: '⏳', tone: 'muted' },
              ],
            },
            caption: 'your screen, not the system’s',
          },
          sfx: 'pop',
          emphasis: ['pre-prompt'],
        },
        {
          say: 'Tap Not now, and nothing is lost. The real dialog never showed, so you can ask later.',
          scene: {
            type: 'diagram',
            title: 'Two answers, two paths',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'pre', label: 'Pre-prompt', icon: '💬', x: 1, y: 0, shape: 'pill' },
              { id: 'no', label: 'Not now', icon: '⏳', x: 0, y: 1.5, active: true, tone: 'muted' },
              { id: 'yes', label: 'Sure', icon: '👍', x: 2, y: 1.5, dim: true },
              { id: 'later', label: 'Ask later', sub: 'dialog unspent', icon: '🎟️', x: 0, y: 3, active: true, tone: 'good' },
              { id: 'real', label: 'Real dialog', sub: 'Allow?', icon: '🔐', x: 2, y: 3, dim: true },
            ],
            edges: [
              { from: 'pre', to: 'no', active: true },
              { from: 'pre', to: 'yes', dashed: true },
              { from: 'no', to: 'later', label: 'free', active: true, tone: 'good' },
              { from: 'yes', to: 'real', dashed: true },
            ],
            packets: [{ from: 'pre', to: 'no' }],
          },
          sfx: 'pop',
          emphasis: ['lost', 'later'],
        },
        {
          say: 'Tap Sure, then fire the real request. They just said yes to you, so they usually say yes again.',
          scene: {
            type: 'diagram',
            title: 'Two answers, two paths',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'pre', label: 'Pre-prompt', icon: '💬', x: 1, y: 0, shape: 'pill' },
              { id: 'no', label: 'Not now', icon: '⏳', x: 0, y: 1.5, dim: true },
              { id: 'yes', label: 'Sure', icon: '👍', x: 2, y: 1.5, active: true, tone: 'good' },
              { id: 'later', label: 'Ask later', sub: 'dialog unspent', icon: '🎟️', x: 0, y: 3, dim: true },
              { id: 'real', label: 'Real dialog', sub: 'Allow ✅', icon: '🔐', x: 2, y: 3, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'pre', to: 'no', dashed: true },
              { from: 'pre', to: 'yes', active: true },
              { from: 'no', to: 'later', dashed: true },
              { from: 'yes', to: 'real', label: 'request()', active: true, tone: 'good' },
            ],
            packets: [{ from: 'yes', to: 'real', label: '✓', tone: 'good' }],
          },
          sfx: 'ding',
          emphasis: ['then', 'yes'],
        },
        {
          say: 'In code, react-native-permissions tells you where you stand. Denied means never asked.',
          speak: 'In code, react native permissions tells you where you stand. Denied means never asked.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'useCamera.ts',
            code: prePrompt,
            highlight: [[4, 8]],
            note: { line: 6, text: 'explain first, then spend the dialog', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['denied', 'never'],
        },
        {
          say: "Blocked means asked and refused. Don't nag. Show a card that opens Settings.",
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'useCamera.ts',
            code: prePrompt,
            highlight: [[9, 11]],
            note: { line: 11, text: 'opens your app’s Settings page', tone: 'warn' },
          },
          sfx: 'click',
          emphasis: ['blocked', 'Settings'],
        },
        {
          say: "Quick check. The check call returns Denied on iOS. Did the user say no?",
          scene: { type: 'quiz', question: permQuestion, options: permOptions, answer: 1 },
          sfx: 'riser',
          emphasis: ['denied'],
        },
        {
          say: 'Nope. On iOS, Denied means you never asked. Your one shot is still in your pocket.',
          scene: {
            type: 'quiz',
            question: permQuestion,
            options: permOptions,
            answer: 1,
            reveal: true,
            explain: 'DENIED = still requestable. BLOCKED = refused.',
          },
          sfx: 'ding',
          emphasis: ['never', 'pocket'],
        },
        {
          say: 'Remember this. One dialog, one chance. Spend it when the user wants the thing.',
          scene: {
            type: 'outro',
            points: ['The system dialog shows *once*', 'Pre-prompt first, real request second', 'BLOCKED? Link to Settings'],
            tagline: 'One dialog, one chance.',
          },
          sfx: 'success',
          emphasis: ['one', 'wants'],
        },
      ],
    },

    // ───────────────────────── 3. Lifecycle: background means frozen
    {
      id: 'ios-app-lifecycle-suspended',
      title: 'Background means frozen',
      beats: [
        {
          say: "Leave an iOS app, and within seconds it's frozen solid.",
          scene: {
            type: 'title',
            kicker: 'iOS lifecycle',
            title: 'Background means *frozen*',
            emoji: '🧊',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['seconds', 'frozen'],
        },
        {
          say: "Your chat app's socket works great. Then the user locks the phone.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Chat',
              icon: '💬',
              items: [
                { id: 'm1', label: 'Sam', icon: '🧑', sub: 'pizza tonight?' },
                { id: 'm2', label: 'Priya', icon: '👩', sub: 'running 5 min late' },
              ],
              toast: 'socket connected 🟢',
            },
            caption: 'works great while open',
          },
          sfx: 'pop',
          emphasis: ['locks'],
        },
        {
          say: 'Now nothing arrives. No crash, no error. Messages show up only when the app reopens.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'lock', time: '9:41', notices: [] },
            caption: 'socket frozen mid-sentence 🥶',
          },
          sfx: 'error',
          emphasis: ['nothing', 'reopens'],
        },
        {
          say: "Here's why. You get about five seconds to wrap up. A background task buys a little more, but Apple won't say how long.",
          scene: {
            type: 'timeline',
            title: 'Life of an iOS app',
            steps: [
              { label: 'Active', sub: 'on screen, getting touches', icon: '🟢' },
              { label: 'Inactive', sub: 'call or Control Center on top', icon: '🟡' },
              { label: 'Background', sub: '≈ 5 seconds to wrap up', icon: '⏳', tone: 'warn' },
              { label: 'Suspended', sub: 'in memory, zero CPU', icon: '🧊', tone: 'info' },
              { label: 'Terminated', sub: 'killed for memory', icon: '✕', tone: 'bad' },
            ],
            active: 2,
          },
          sfx: 'swipe',
          emphasis: ['five', 'more'],
        },
        {
          say: 'Then iOS suspends you. Still in memory, zero CPU. Timers, sockets, and fetch all freeze mid-flight.',
          speak: 'Then iOS suspends you. Still in memory, zero C P U. Timers, sockets, and fetch all freeze mid-flight.',
          scene: {
            type: 'timeline',
            title: 'Life of an iOS app',
            steps: [
              { label: 'Active', sub: 'on screen, getting touches', icon: '🟢' },
              { label: 'Inactive', sub: 'call or Control Center on top', icon: '🟡' },
              { label: 'Background', sub: '≈ 5 seconds to wrap up', icon: '⏳', tone: 'warn' },
              { label: 'Suspended', sub: 'timers ✕ sockets ✕ fetch ✕', icon: '🧊', tone: 'info' },
              { label: 'Terminated', sub: 'killed for memory', icon: '✕', tone: 'bad' },
            ],
            active: 3,
          },
          sfx: 'click',
          emphasis: ['zero', 'freeze'],
        },
        {
          say: 'Low on memory? iOS quietly kills suspended apps. Next open is a cold start, from zero.',
          scene: {
            type: 'timeline',
            title: 'Life of an iOS app',
            steps: [
              { label: 'Active', sub: 'on screen, getting touches', icon: '🟢' },
              { label: 'Inactive', sub: 'call or Control Center on top', icon: '🟡' },
              { label: 'Background', sub: '≈ 5 seconds to wrap up', icon: '⏳', tone: 'warn' },
              { label: 'Suspended', sub: 'timers ✕ sockets ✕ fetch ✕', icon: '🧊', tone: 'info' },
              { label: 'Terminated', sub: 'no warning, no callback', icon: '✕', tone: 'bad' },
            ],
            active: 4,
          },
          sfx: 'error',
          emphasis: ['quietly', 'cold'],
        },
        {
          say: 'And unlike Android, swiping the app away kills it and cancels its scheduled background tasks.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: { kind: 'killed', app: 'Chat', icon: '💬', reason: 'Swiped away: background tasks cancelled' },
            caption: 'the swipe is a hard stop',
          },
          sfx: 'swipe',
          emphasis: ['cancels'],
        },
        {
          say: 'In React Native, AppState is your hook. Flush your outbox on background, refetch on active.',
          speak: 'In React Native, app state is your hook. Flush your outbox on background, refetch on active.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'useLifecycle.ts',
            code: appState(''),
            highlight: [[5, 6]],
            note: { line: 5, text: 'seconds, not minutes', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['flush', 'refetch'],
        },
        {
          say: "Careful. Inactive also fires for Face ID and incoming calls. That doesn't mean the user left.",
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'useLifecycle.ts',
            code: appState("\n      if (s === 'inactive') pauseAll();"),
            errors: [7],
            note: { line: 7, text: 'fires on every pull-down 😬', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['inactive', 'left'],
        },
        {
          say: "Need work while frozen? Use iOS's doors: background tasks, silent push, background downloads. Never timers.",
          scene: {
            type: 'list',
            title: 'Real background work',
            items: [
              { text: 'Background tasks', icon: '🗓️', sub: 'expo-background-task', tone: 'good' },
              { text: 'Silent push', icon: '📨', sub: 'content-available', tone: 'good' },
              { text: 'Background URL session', icon: '⬇️', sub: 'big uploads & downloads', tone: 'good' },
              { text: 'setTimeout', icon: '⏱️', sub: 'frozen with you', tone: 'bad' },
            ],
          },
          sfx: 'pop',
          emphasis: ['doors', 'timers'],
        },
        {
          say: 'Remember this. On iOS, background is a goodbye, not a second shift. Save your state and go.',
          scene: {
            type: 'outro',
            points: ['Seconds to wrap up, then *suspended*', 'Persist state on background', 'Real work needs an iOS door'],
            tagline: 'Goodbye, not overtime.',
          },
          sfx: 'success',
          emphasis: ['goodbye', 'save'],
        },
      ],
    },

    // ───────────────────────── 4. No cron on iOS
    {
      id: 'ios-background-work-no-cron',
      title: 'iOS has no cron',
      beats: [
        {
          say: "Want a sync every fifteen minutes on iOS? There's no such thing.",
          scene: {
            type: 'title',
            kicker: 'iOS background work',
            title: 'iOS has *no cron*',
            emoji: '⏰',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['fifteen', 'no'],
        },
        {
          say: 'Android has WorkManager, with a fifteen minute minimum. iOS never promises a schedule at all.',
          speak: 'Android has work manager, with a fifteen minute minimum. iOS never promises a schedule at all.',
          scene: {
            type: 'compare',
            title: 'Every 15 minutes?',
            left: {
              title: 'Android',
              icon: '🤖',
              verdict: 'ok',
              items: ['WorkManager', '15 min minimum', 'Survives reboot'],
            },
            right: {
              title: 'iOS',
              icon: '🍎',
              verdict: 'bad',
              items: ['No fixed schedule', 'iOS picks the moment', 'Minutes are a hint'],
            },
          },
          sfx: 'swipe',
          emphasis: ['never', 'schedule'],
        },
        {
          say: 'By design. iOS learns your habits, checks battery and network, and wakes you just before you usually open.',
          scene: {
            type: 'diagram',
            title: 'Who decides when you run?',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'usage', label: 'Your habits', icon: '📈', x: 0, y: 0 },
              { id: 'battery', label: 'Battery', icon: '🔋', x: 1, y: 0 },
              { id: 'net', label: 'Network', icon: '📶', x: 2, y: 0 },
              { id: 'ios', label: 'iOS', icon: '🍎', x: 1, y: 1.6, active: true, tone: 'accent', shape: 'circle' },
              { id: 'app', label: 'Your app', sub: 'woken at 8:58', icon: '📱', x: 1, y: 3.1, tone: 'good' },
            ],
            edges: [
              { from: 'usage', to: 'ios' },
              { from: 'battery', to: 'ios' },
              { from: 'net', to: 'ios' },
              { from: 'ios', to: 'app', label: 'wake', active: true },
            ],
            packets: [{ from: 'ios', to: 'app', label: '⏰' }],
            caption: 'opens it at 9? refreshed just before',
          },
          sfx: 'pop',
          emphasis: ['design', 'before'],
        },
        {
          say: 'Door one, app refresh. About thirty seconds to grab fresh data, so the app opens already up to date.',
          scene: {
            type: 'list',
            title: 'The doors iOS gives you',
            numbered: true,
            items: [
              { text: 'App refresh', icon: '🔄', sub: '~30 s, keep content fresh' },
              { text: 'Processing', icon: '🌙', sub: 'minutes, often overnight' },
              { text: 'Silent push', icon: '📨', sub: 'server pokes, Apple throttles' },
              { text: 'Continued processing', icon: '📤', sub: 'new in iOS 26' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['thirty', 'fresh'],
        },
        {
          say: 'Door two, processing. Minutes of work, usually overnight on the charger. Great for cleanup and big syncs.',
          scene: {
            type: 'list',
            title: 'The doors iOS gives you',
            numbered: true,
            items: [
              { text: 'App refresh', icon: '🔄', sub: '~30 s, keep content fresh' },
              { text: 'Processing', icon: '🌙', sub: 'minutes, often overnight' },
              { text: 'Silent push', icon: '📨', sub: 'server pokes, Apple throttles' },
              { text: 'Continued processing', icon: '📤', sub: 'new in iOS 26' },
            ],
            active: 1,
          },
          sfx: 'click',
          emphasis: ['overnight', 'charger'],
        },
        {
          say: 'Door three, silent push. Your server wakes you for about thirty seconds, and Apple allows a couple an hour.',
          scene: {
            type: 'list',
            title: 'The doors iOS gives you',
            numbered: true,
            items: [
              { text: 'App refresh', icon: '🔄', sub: '~30 s, keep content fresh' },
              { text: 'Processing', icon: '🌙', sub: 'minutes, often overnight' },
              { text: 'Silent push', icon: '📨', sub: '2–3 an hour, at most' },
              { text: 'Continued processing', icon: '📤', sub: 'new in iOS 26' },
            ],
            active: 2,
          },
          sfx: 'click',
          emphasis: ['server', 'couple'],
        },
        {
          say: 'New in iOS 26: tap export, leave, and the job keeps going with a progress card you can cancel.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'lock',
              time: '9:41',
              notices: [{ app: 'Clips', title: 'Exporting video… 62%', body: 'Tap to cancel', icon: '📤' }],
            },
            caption: 'BGContinuedProcessingTask',
          },
          sfx: 'whoosh',
          emphasis: ['export', 'cancel'],
        },
        {
          say: 'From React Native, expo-background-task wraps iOS background tasks and Android WorkManager. One JS function, both phones.',
          speak: 'From React Native, expo background task wraps iOS background tasks and Android work manager. One J S function, both phones.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'sync.ts',
            code: backgroundTask,
            highlight: [[1, 8]],
          },
          sfx: 'type',
          emphasis: ['one', 'both'],
        },
        {
          say: 'On iOS that fifteen is a hint, not a promise. And the simulator never runs it, so test on a device.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'sync.ts',
            code: backgroundTask,
            highlight: [12],
            note: { line: 12, text: 'iOS treats it as a hint', tone: 'warn' },
          },
          sfx: 'click',
          emphasis: ['hint', 'device'],
        },
        {
          say: "Remember this. Design sync as catch up whenever we're awake. Never every fifteen minutes.",
          scene: {
            type: 'outro',
            points: ['iOS picks when you run', 'Refresh, processing, silent push', 'Sync = *catch up* when awake'],
            tagline: 'A mood, not a clock.',
          },
          sfx: 'success',
          emphasis: ['awake', 'never'],
        },
      ],
    },

    // ───────────────────────── 5. Push: tokens, provisional, NSE
    {
      id: 'ios-push-apns-provisional-nse',
      title: 'Push: tokens, quiet mode, rich media',
      beats: [
        {
          say: 'You can send iOS notifications without ever showing the permission prompt.',
          scene: {
            type: 'title',
            kicker: 'iOS push',
            title: 'Push *without* the prompt',
            emoji: '🔕',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['without', 'prompt'],
        },
        {
          say: 'First, the pipes. iOS gives your app a device token, your server sends to Apple with it, Apple delivers.',
          scene: {
            type: 'diagram',
            title: 'How a push travels',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', sub: 'register', icon: '📱', x: 0, y: 0 },
              { id: 'server', label: 'Your server', sub: 'or Expo, Firebase', icon: '🖥️', x: 2, y: 0 },
              { id: 'apns', label: 'Apple push', sub: 'APNs', icon: '☁️', x: 2, y: 2, active: true },
              { id: 'phone', label: 'iPhone', icon: '🔔', x: 0, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'app', to: 'server', label: 'device token', active: true },
              { from: 'server', to: 'apns', label: 'send' },
              { from: 'apns', to: 'phone', label: 'deliver' },
            ],
            packets: [
              { from: 'app', to: 'server', label: '🔑' },
              { from: 'apns', to: 'phone', label: '📦' },
            ],
          },
          sfx: 'pop',
          emphasis: ['token', 'Apple'],
        },
        {
          say: 'Trick one: provisional. Ask with provisional set to true, and iOS shows no prompt at all.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'notifications.ts',
            code: provisional,
            highlight: [3, 8],
            note: { line: 3, text: 'no dialog. none.', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['provisional', 'no'],
        },
        {
          say: 'Your notifications land quietly in Notification Center, with Keep or Turn Off. Users decide after seeing real value.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'lock',
              time: '9:41',
              notices: [
                { app: 'Shop', title: 'Your order shipped 📦', body: 'Delivered quietly · Keep / Turn Off…', icon: '🛍️' },
              ],
            },
            caption: 'no banner, no sound, no prompt',
          },
          sfx: 'pop',
          emphasis: ['quietly', 'value'],
        },
        {
          say: 'Trick two: a Notification Service Extension. Mark the push mutable-content, and your Swift code gets about thirty seconds to change it.',
          speak: 'Trick two: a Notification Service Extension. Mark the push mutable content, and your Swift code gets about thirty seconds to change it.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'payload.json',
            code: richPayload,
            highlight: [7, 9],
            note: { line: 7, text: 'wakes your extension', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['extension', 'thirty'],
        },
        {
          say: "That's how shipping apps attach a parcel photo, and chat apps decrypt messages. Miss the deadline, and iOS shows the original.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'notification',
              behind: 'lock',
              notice: { app: 'Shop', title: 'Order shipped', body: 'Tap to track · 🖼️ photo of your box', icon: '📦' },
            },
            caption: 'image added by your extension',
          },
          sfx: 'ding',
          emphasis: ['photo', 'decrypt'],
        },
        {
          say: "Then the number one token never arrives bug. aps-environment must match your build: development or production.",
          speak: 'Then the number one token never arrives bug. A P S environment must match your build: development or production.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'App.entitlements',
            code: apsEntitlement,
            errors: [3],
            note: { line: 3, text: 'dev build + production = no token', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['match', 'build'],
        },
        {
          say: 'Quick check. The user never allowed notifications. Do your pushes still reach the app?',
          scene: { type: 'quiz', question: pushQuestion, options: pushOptions, answer: 1 },
          sfx: 'riser',
          emphasis: ['never'],
        },
        {
          say: 'Yes. They still arrive, just silently. Handy for quiet data updates.',
          scene: {
            type: 'quiz',
            question: pushQuestion,
            options: pushOptions,
            answer: 1,
            reveal: true,
            explain: 'No permission = no alert, but the push still lands.',
          },
          sfx: 'ding',
          emphasis: ['silently'],
        },
        {
          say: 'Remember this. Ask quietly with provisional, dress it up with an extension, and match your entitlement.',
          scene: {
            type: 'outro',
            points: ['*Provisional* = no prompt, quiet delivery', 'Service Extension edits pushes', 'aps-environment must match'],
            tagline: 'Quiet first, loud later.',
          },
          sfx: 'success',
          emphasis: ['quietly', 'extension'],
        },
      ],
    },

    // ───────────────────────── 6. Universal Links
    {
      id: 'ios-universal-links-vs-schemes',
      title: "Universal Links, with Apple's CDN",
      beats: [
        {
          say: "Universal Link works for you, not your tester? Blame Apple's cache.",
          scene: {
            type: 'title',
            kicker: 'Universal Links',
            title: "Blame *Apple's cache*",
            emoji: '🔗',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['cache'],
        },
        {
          say: 'A friend texts you a product link. Tap it, and your shop app should open. Not Safari.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Messages',
              icon: '💬',
              items: [
                { id: 'msg', label: 'Alex', icon: '🧑', sub: 'these are on sale!!' },
                { id: 'link', label: 'shop.example.com/p/42', icon: '🔗', sub: 'tap to open', tone: 'accent' },
              ],
            },
            tap: { x: 0.5, y: 0.42 },
            caption: 'should open the app',
          },
          sfx: 'pop',
          emphasis: ['app', 'Safari'],
        },
        {
          say: 'Custom schemes work, but any app can claim them. Universal Links are real https links that Apple ties to you.',
          speak: 'Custom schemes work, but any app can claim them. Universal Links are real H T T P S links that Apple ties to you.',
          scene: {
            type: 'compare',
            title: 'Two kinds of link',
            left: { title: 'myapp://', verdict: 'neutral', items: ['Any app can claim it', 'Not a web link'] },
            right: {
              title: 'https://',
              verdict: 'ok',
              icon: '🔗',
              items: ['Verified as yours', 'Works on web too'],
            },
          },
          sfx: 'swipe',
          emphasis: ['claim', 'https'],
        },
        {
          say: 'Piece one: the apple-app-site-association file. Team ID plus bundle ID, and which paths open the app.',
          speak: 'Piece one: the apple app site association file. Team I D plus bundle I D, and which paths open the app.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'apple-app-site-association',
            code: aasa,
            highlight: [[4, 10]],
            note: { line: 6, text: 'Team ID + bundle ID', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['paths', 'bundle'],
        },
        {
          say: 'Piece two: the Associated Domains entitlement. In Expo, it is one line in your app config.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'app.json',
            code: associatedDomains,
            added: [[4, 6]],
            note: { line: 5, text: 'applinks:<your domain>', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['entitlement', 'one'],
        },
        {
          say: "Here's the twist. Since iOS 14, phones don't fetch that file from your server. Apple's CDN does.",
          speak: "Here's the twist. Since iOS 14, phones don't fetch that file from your server. Apple's C D N does.",
          scene: {
            type: 'diagram',
            title: 'Who reads your file?',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'server', label: 'Your server', sub: '/.well-known/…', icon: '🖥️', x: 0, y: 0 },
              { id: 'cdn', label: 'Apple CDN', icon: '☁️', x: 2, y: 1.4, active: true },
              { id: 'phone', label: 'iPhone', icon: '📱', x: 0, y: 3 },
            ],
            edges: [
              { from: 'server', to: 'cdn', label: 'Apple fetches', active: true },
              { from: 'cdn', to: 'phone', label: 'phone asks Apple' },
            ],
            packets: [{ from: 'server', to: 'cdn', label: '{}' }],
          },
          sfx: 'riser',
          emphasis: ['twist', 'CDN'],
        },
        {
          say: 'So you deploy, test, nothing. Give it up to a day, and phones re-check about weekly.',
          scene: {
            type: 'diagram',
            title: 'Who reads your file?',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'server', label: 'Your server', sub: 'deployed ✅', icon: '🖥️', x: 0, y: 0, tone: 'good' },
              { id: 'cdn', label: 'Apple CDN', sub: 'up to ~24 h', icon: '☁️', x: 2, y: 1.4, tone: 'warn', active: true },
              { id: 'phone', label: 'iPhone', sub: 're-checks ~weekly', icon: '📱', x: 0, y: 3, tone: 'warn' },
            ],
            edges: [
              { from: 'server', to: 'cdn', label: 'someday…', dashed: true, tone: 'warn' },
              { from: 'cdn', to: 'phone', label: 'old copy', dashed: true, tone: 'warn' },
            ],
          },
          sfx: 'error',
          emphasis: ['day', 'weekly'],
        },
        {
          say: 'For dev builds, add mode equals developer to the entitlement, and the phone fetches from you directly.',
          scene: {
            type: 'diagram',
            title: 'Who reads your file?',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'server', label: 'Your server', sub: 'deployed ✅', icon: '🖥️', x: 0, y: 0, tone: 'good' },
              { id: 'cdn', label: 'Apple CDN', sub: 'skipped', icon: '☁️', x: 2, y: 1.4, dim: true },
              { id: 'phone', label: 'Dev build', sub: '?mode=developer', icon: '🛠️', x: 0, y: 3, tone: 'good', active: true },
            ],
            edges: [
              { from: 'server', to: 'cdn', dashed: true },
              { from: 'cdn', to: 'phone', dashed: true },
              { from: 'server', to: 'phone', label: 'direct', active: true, tone: 'good' },
            ],
            packets: [{ from: 'server', to: 'phone', label: '{}', tone: 'good' }],
          },
          sfx: 'success',
          emphasis: ['developer', 'directly'],
        },
        {
          say: "Testing tip: typing the link into Safari's address bar won't open the app. Tap it in Notes or Messages.",
          scene: {
            type: 'list',
            title: 'Testing a Universal Link',
            items: [
              { text: 'Safari address bar', icon: '🧭', sub: 'never opens the app', tone: 'bad' },
              { text: 'Tap in Notes or Messages', icon: '📝', tone: 'good' },
              { text: 'xcrun simctl openurl', icon: '💻', sub: 'on the simulator', tone: 'good' },
            ],
          },
          sfx: 'pop',
          emphasis: ["Safari's", 'Notes'],
        },
        {
          say: "Remember this. A Universal Link is a file, an entitlement, and Apple's cache. Be patient with the cache.",
          scene: {
            type: 'outro',
            points: ['AASA file + Associated Domains', 'Apple’s CDN serves the file', 'Dev builds: *?mode=developer*'],
            tagline: 'Deploy, then wait.',
          },
          sfx: 'success',
          emphasis: ['file', 'entitlement', 'patient'],
        },
      ],
    },

    // ───────────────────────── 7. IDFA, ATT, AdAttributionKit
    {
      id: 'ios-idfa-att-adattributionkit',
      title: 'IDFA, ATT, and the new kit',
      beats: [
        {
          say: 'On iOS, the ad ID is all zeros until users say yes.',
          speak: 'On iOS, the ad I D is all zeros until users say yes.',
          scene: {
            type: 'title',
            kicker: 'iOS ads & attribution',
            title: 'The ad ID is *all zeros*',
            emoji: '🕵️',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['zeros', 'yes'],
        },
        {
          say: "Meet App Tracking Transparency, the bouncer in front of the IDFA, iOS's advertising ID.",
          speak: "Meet App Tracking Transparency, the bouncer in front of the I D F A, iOS's advertising I D.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: 'Allow “Shop”',
              icon: '🕵️',
              text: 'to track your activity across other companies’ apps and websites?',
              allow: 'Allow',
              deny: 'Ask App Not to Track',
            },
            caption: 'the ATT prompt',
          },
          sfx: 'pop',
          emphasis: ['bouncer', 'IDFA'],
        },
        {
          say: 'Tap Ask App Not to Track, and the IDFA reads as zeros. Most people tap that.',
          speak: 'Tap Ask App Not to Track, and the I D F A reads as zeros. Most people tap that.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'permission',
              app: 'Allow “Shop”',
              icon: '🕵️',
              text: 'to track your activity across other companies’ apps and websites?',
              allow: 'Allow',
              deny: 'Ask App Not to Track',
              choice: 'deny',
            },
            caption: 'IDFA → 00000000-0000-…',
          },
          sfx: 'error',
          emphasis: ['zeros', 'most'],
        },
        {
          say: "Apple's rules are strict. Ask before tracking across apps, add a usage string or crash, and never lock features behind it.",
          scene: {
            type: 'list',
            title: 'ATT house rules',
            items: [
              { text: 'Ask before you track', icon: '✋' },
              { text: 'Usage string, or crash', icon: '💥', sub: 'NSUserTrackingUsageDescription', tone: 'bad' },
              { text: 'No “allow tracking to unlock”', icon: '🔒', tone: 'warn' },
            ],
          },
          sfx: 'pop',
          emphasis: ['crash', 'never'],
        },
        {
          say: 'So how are ads measured? Postbacks. The ad network learns an install came from campaign twelve, but never who.',
          scene: {
            type: 'diagram',
            title: 'Attribution without a user ID',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'ad', label: 'Ad tap', icon: '📣', x: 0, y: 0 },
              { id: 'install', label: 'Install', icon: '📲', x: 2, y: 0 },
              { id: 'apple', label: 'Apple', sub: 'SKAdNetwork', icon: '🍎', x: 1, y: 1.6, active: true },
              { id: 'net', label: 'Ad network', sub: 'campaign 12 ✓ · who? ✕', icon: '📊', x: 1, y: 3.1, tone: 'good' },
            ],
            edges: [
              { from: 'ad', to: 'install' },
              { from: 'install', to: 'apple' },
              { from: 'apple', to: 'net', label: 'postback', active: true },
            ],
            packets: [{ from: 'apple', to: 'net', label: '✉️' }],
          },
          sfx: 'swipe',
          emphasis: ['postbacks', 'never'],
        },
        {
          say: "That's SKAdNetwork, and since iOS 17.4, AdAttributionKit. No ATT prompt needed, and it works on EU marketplaces too.",
          speak: "That's S K ad network, and since iOS seventeen point four, ad attribution kit. No A T T prompt needed, and it works on E U marketplaces too.",
          scene: {
            type: 'diagram',
            title: 'Attribution without a user ID',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'ad', label: 'Ad tap', icon: '📣', x: 0, y: 0 },
              { id: 'install', label: 'Install', icon: '📲', x: 2, y: 0 },
              { id: 'apple', label: 'Apple', sub: 'AdAttributionKit', icon: '🍎', x: 1, y: 1.6, active: true, tone: 'accent' },
              { id: 'net', label: 'Ad network', sub: 'campaign 12 ✓ · who? ✕', icon: '📊', x: 1, y: 3.1, tone: 'good' },
              { id: 'eu', label: 'EU stores', sub: 'alt marketplaces', icon: '🇪🇺', x: 0, y: 2.2, tone: 'info' },
            ],
            edges: [
              { from: 'ad', to: 'install' },
              { from: 'install', to: 'apple' },
              { from: 'eu', to: 'apple', dashed: true },
              { from: 'apple', to: 'net', label: 'postback', active: true },
            ],
            packets: [{ from: 'apple', to: 'net', label: '✉️' }],
          },
          sfx: 'pop',
          emphasis: ['AdAttributionKit', 'EU'],
        },
        {
          say: 'In React Native, expo-tracking-transparency asks, and you read the ID only if granted. On Android it just says granted.',
          speak: 'In React Native, expo tracking transparency asks, and you read the I D only if granted. On Android it just says granted.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'tracking.ts',
            code: tracking,
            highlight: [[4, 6]],
            note: { line: 6, text: 'design for this branch', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['granted'],
        },
        {
          say: 'Quick check. Your analytics SDK pops the ATT prompt on first launch. Good idea?',
          speak: 'Quick check. Your analytics S D K pops the A T T prompt on first launch. Good idea?',
          scene: { type: 'quiz', question: attQuestion, options: attOptions, answer: 1 },
          sfx: 'riser',
          emphasis: ['first'],
        },
        {
          say: 'Bad idea. It burns your one shot at the worst moment. Turn off auto prompting, and ask after onboarding.',
          scene: {
            type: 'quiz',
            question: attQuestion,
            options: attOptions,
            answer: 1,
            reveal: true,
            explain: 'Disable SDK auto-prompt. Ask yourself, later, while the app is active.',
          },
          sfx: 'ding',
          emphasis: ['burns', 'onboarding'],
        },
        {
          say: 'Remember this. Zeros are the normal case. Measure with postbacks, not people.',
          scene: {
            type: 'outro',
            points: ['No ATT yes, no IDFA', 'Postbacks count installs, not people', 'Treat *zeros* as normal'],
            tagline: 'Count installs, not people.',
          },
          sfx: 'success',
          emphasis: ['zeros', 'postbacks'],
        },
      ],
    },

    // ───────────────────────── 8. Signing in plain words
    {
      id: 'ios-signing-entitlements-plain-words',
      title: 'Signing, in plain words',
      beats: [
        {
          say: "Turn on one capability, and your iOS build won't sign. Here's why.",
          scene: {
            type: 'title',
            kicker: 'iOS signing',
            title: "Why your build *won't sign*",
            emoji: '🪪',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['capability', "won't"],
        },
        {
          say: 'You add Universal Links, CI runs, and boom: the profile is missing an entitlement. What profile?',
          speak: 'You add Universal Links, C I runs, and boom: the profile is missing an entitlement. What profile?',
          scene: {
            type: 'terminal',
            title: 'CI · iOS release',
            lines: [
              { cmd: 'xcodebuild archive -scheme Shop' },
              { out: 'error: Provisioning profile "Shop App Store" doesn\'t include the com.apple.developer.associated-domains entitlement.', tone: 'bad' },
              { out: '** ARCHIVE FAILED **', tone: 'bad' },
            ],
          },
          sfx: 'error',
          emphasis: ['boom', 'profile'],
        },
        {
          say: 'Four words explain it. Think passport. The certificate is your photo page: who built the app.',
          scene: {
            type: 'list',
            title: 'Your app’s passport',
            items: [
              { text: 'Certificate', icon: '📸', sub: 'who built it' },
              { text: 'App ID', icon: '🏷️', sub: 'which app' },
              { text: 'Entitlements', icon: '🛂', sub: 'what it may use' },
              { text: 'Provisioning profile', icon: '🎫', sub: 'Apple’s signed visa' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['passport', 'who'],
        },
        {
          say: 'The App ID is your name. Your team ID plus your bundle identifier.',
          speak: 'The app I D is your name. Your team I D plus your bundle identifier.',
          scene: {
            type: 'list',
            title: 'Your app’s passport',
            items: [
              { text: 'Certificate', icon: '📸', sub: 'who built it' },
              { text: 'App ID', icon: '🏷️', sub: 'ABCDE12345.com.example.shop' },
              { text: 'Entitlements', icon: '🛂', sub: 'what it may use' },
              { text: 'Provisioning profile', icon: '🎫', sub: 'Apple’s signed visa' },
            ],
            active: 1,
          },
          sfx: 'click',
          emphasis: ['name', 'bundle'],
        },
        {
          say: 'Entitlements are the stamps. Push, App Groups, Associated Domains. Key value pairs sealed into the signature.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'Shop.entitlements',
            code: entitlements,
            highlight: [2, 5, 10],
          },
          sfx: 'type',
          emphasis: ['stamps', 'sealed'],
        },
        {
          say: 'The provisioning profile is the visa. Apple signs it: this certificate, this App ID, these entitlements, these devices.',
          speak: 'The provisioning profile is the visa. Apple signs it: this certificate, this app I D, these entitlements, these devices.',
          scene: {
            type: 'diagram',
            title: 'The profile bundles it all',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'cert', label: 'Certificate', icon: '📸', x: 0, y: 0 },
              { id: 'appid', label: 'App ID', icon: '🏷️', x: 2, y: 0 },
              { id: 'ents', label: 'Entitlements', sub: 'push · groups', icon: '🛂', x: 0, y: 3 },
              { id: 'devices', label: 'Devices', sub: 'dev builds', icon: '📱', x: 2, y: 3 },
              { id: 'profile', label: 'Profile', sub: 'signed by Apple', icon: '🎫', x: 1, y: 1.5, active: true, tone: 'good', shape: 'circle' },
            ],
            edges: [
              { from: 'cert', to: 'profile' },
              { from: 'appid', to: 'profile' },
              { from: 'ents', to: 'profile' },
              { from: 'devices', to: 'profile' },
            ],
          },
          sfx: 'pop',
          emphasis: ['visa', 'signs'],
        },
        {
          say: 'Add a new capability, and the old visa is stale. Xcode or EAS must reissue it. That was our CI error.',
          speak: 'Add a new capability, and the old visa is stale. Xcode or E A S must reissue it. That was our C I error.',
          scene: {
            type: 'diagram',
            title: 'The profile bundles it all',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'cert', label: 'Certificate', icon: '📸', x: 0, y: 0 },
              { id: 'appid', label: 'App ID', icon: '🏷️', x: 2, y: 0 },
              { id: 'ents', label: 'Entitlements', sub: '+ associated domains', icon: '🛂', x: 0, y: 3, tone: 'warn', active: true },
              { id: 'devices', label: 'Devices', sub: 'dev builds', icon: '📱', x: 2, y: 3 },
              { id: 'profile', label: 'Profile', sub: 'stale, regenerate', icon: '🎫', x: 1, y: 1.5, tone: 'bad', shape: 'circle' },
            ],
            edges: [
              { from: 'cert', to: 'profile' },
              { from: 'appid', to: 'profile' },
              { from: 'ents', to: 'profile', label: 'not in visa', tone: 'bad', active: true },
              { from: 'devices', to: 'profile' },
            ],
          },
          sfx: 'error',
          emphasis: ['stale', 'reissue'],
        },
        {
          say: 'Development and production are separate visas. And aps-environment must match, or push tokens never arrive.',
          speak: 'Development and production are separate visas. And A P S environment must match, or push tokens never arrive.',
          scene: {
            type: 'compare',
            title: 'Two visas',
            left: { title: 'Development', verdict: 'neutral', icon: '🛠️', items: ['Listed test devices', 'aps: development'] },
            right: { title: 'Production', verdict: 'neutral', icon: '🚀', items: ['TestFlight & App Store', 'aps: production'] },
          },
          sfx: 'swipe',
          emphasis: ['separate', 'match'],
        },
        {
          say: 'With EAS, Expo creates and stores all of this. Bare app? Let Xcode manage signing, or share one set with fastlane match.',
          speak: 'With E A S, Expo creates and stores all of this. Bare app? Let Xcode manage signing, or share one set with fastlane match.',
          scene: {
            type: 'terminal',
            title: 'Let the tools do it',
            lines: [
              { cmd: 'eas credentials -p ios' },
              { out: 'Distribution certificate ✓\nProvisioning profile ✓\nPush key ✓', tone: 'good' },
              { cmd: 'fastlane match appstore' },
              { out: 'whole team, one set of certs', tone: 'info' },
            ],
          },
          sfx: 'type',
          emphasis: ['Expo', 'match'],
        },
        {
          say: 'Remember this. Certificate is who, App ID is which, entitlements are what, and the profile ties them together.',
          speak: 'Remember this. Certificate is who, app I D is which, entitlements are what, and the profile ties them together.',
          scene: {
            type: 'outro',
            points: ['Certificate who, App ID which', 'Entitlements: what it may use', 'New capability? *New profile*'],
            tagline: 'The profile ties it together.',
          },
          sfx: 'success',
          emphasis: ['who', 'what', 'together'],
        },
      ],
    },

    // ───────────────────────── 9. Widgets, Live Activities, App Groups
    {
      id: 'ios-extensions-widgets-live-activities-app-groups',
      title: 'Widgets share data, not memory',
      beats: [
        {
          say: "Your widget can't read your app's state. It needs a shared drawer.",
          scene: {
            type: 'title',
            kicker: 'Widgets & Live Activities',
            title: "Widgets *can't see* your app",
            emoji: '🧩',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ["can't", 'drawer'],
        },
        {
          say: 'Picture a delivery app with a Live Activity on the Lock Screen showing your order.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'lock',
              time: '9:41',
              notices: [{ app: 'Shop · Live Activity', title: 'Driver is 2 stops away 🛵', body: 'Out for delivery · ETA 9:58', icon: '📦' }],
            },
            caption: 'Live Activity on the Lock Screen',
          },
          sfx: 'pop',
          emphasis: ['Live', 'order'],
        },
        {
          say: "But widgets and Live Activities are separate programs, often running while your app isn't.",
          scene: {
            type: 'diagram',
            title: 'Two programs, one wall',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', sub: 'JS · Redux · MMKV', icon: '📱', x: 0, y: 0.6, active: true },
              { id: 'widget', label: 'Widget', sub: 'status = ???', icon: '🧩', x: 2, y: 0.6, tone: 'bad' },
            ],
            edges: [{ from: 'app', to: 'widget', label: 'no access', dashed: true, tone: 'bad', both: true }],
            caption: 'separate processes, separate memory',
          },
          sfx: 'error',
          emphasis: ['separate'],
        },
        {
          say: "They can't touch your Redux store or MMKV. The only shared thing is an App Group container.",
          speak: "They can't touch your Redux store or M M K V. The only shared thing is an App Group container.",
          scene: {
            type: 'diagram',
            title: 'Two programs, one drawer',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', sub: 'JS · Redux · MMKV', icon: '📱', x: 0, y: 0.6 },
              { id: 'widget', label: 'Widget', sub: 'status = ???', icon: '🧩', x: 2, y: 0.6 },
              { id: 'group', label: 'App Group', sub: 'group.com.example.shop', icon: '🗄️', x: 1, y: 2.6, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'app', to: 'group', label: 'write', active: true },
              { from: 'group', to: 'widget', label: 'read', active: true },
            ],
            packets: [{ from: 'app', to: 'group', label: '📝' }],
          },
          sfx: 'pop',
          emphasis: ['only', 'group'],
        },
        {
          say: 'Your app writes a value with UserDefaults suiteName, then rings the bell: reload timelines.',
          speak: 'Your app writes a value with user defaults suite name, then rings the bell: reload timelines.',
          scene: {
            type: 'code',
            lang: 'swift',
            file: 'SharedStore.swift',
            code: appGroup,
            highlight: [[2, 8]],
            note: { line: 7, text: '🔔 nudge the widget', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['writes', 'bell'],
        },
        {
          say: 'The widget reads it back and draws with SwiftUI. Yes, widgets are SwiftUI. Your JS never renders there.',
          speak: 'The widget reads it back and draws with swift U I. Yes, widgets are swift U I. Your J S never renders there.',
          scene: {
            type: 'code',
            lang: 'swift',
            file: 'SharedStore.swift',
            code: appGroup,
            highlight: [[10, 13]],
            note: { line: 13, text: '"Out for delivery" ✅', tone: 'good' },
          },
          sfx: 'click',
          emphasis: ['SwiftUI', 'never'],
        },
        {
          say: "Budget check: iOS gives a widget roughly forty to seventy refreshes a day. So don't ring the bell every second.",
          scene: {
            type: 'stat',
            value: '40–70',
            unit: '/day',
            label: 'widget reloads, *roughly*',
            sub: 'iOS decides the exact budget',
            tone: 'warn',
          },
          sfx: 'pop',
          emphasis: ['budget', 'seventy'],
        },
        {
          say: 'Live Activities have rules too. Start in the foreground or by push, eight hours active, four kilobytes of state.',
          scene: {
            type: 'list',
            title: 'Live Activity limits',
            items: [
              { text: 'Start in the foreground', icon: '▶️', sub: 'or push-to-start, iOS 17.2+' },
              { text: '8 hours active', icon: '⏳', sub: '+4 h more on the Lock Screen' },
              { text: '4 KB of state', icon: '📦', sub: 'keep the payload tiny', tone: 'warn' },
            ],
          },
          sfx: 'pop',
          emphasis: ['foreground', 'eight', 'four'],
        },
        {
          say: 'With Expo, the apple-targets plugin generates the widget. Put the App Group on both sides, or reads come back empty.',
          speak: 'With Expo, the apple targets plugin generates the widget. Put the App Group on both sides, or reads come back empty.',
          scene: {
            type: 'terminal',
            title: '@bacons/apple-targets',
            lines: [
              { cmd: 'npx create-target widget' },
              { out: 'targets/widget → SwiftUI widget target', tone: 'good' },
              { out: 'App Group on app + widget, or reads return nil', tone: 'warn' },
            ],
          },
          sfx: 'type',
          emphasis: ['both'],
        },
        {
          say: "Remember this. Extensions don't share memory, they share a drawer. Write it, ring the bell, and let SwiftUI draw.",
          speak: "Remember this. Extensions don't share memory, they share a drawer. Write it, ring the bell, and let swift U I draw.",
          scene: {
            type: 'outro',
            points: ['Widgets are *separate programs*', 'Share through an App Group', 'Write, then reloadTimelines'],
            tagline: 'Share a drawer, not memory.',
          },
          sfx: 'success',
          emphasis: ['drawer', 'bell'],
        },
      ],
    },
  ],
};
