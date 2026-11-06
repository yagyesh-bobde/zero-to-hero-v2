import type { Series } from '../types';

const linking = `const linking = {
  prefixes: [
    'https://shop.example.com',
    'shopapp://',
  ],
  config: {
    screens: { Product: 'p/:id' },
  },
};

<NavigationContainer
  linking={linking}>`;

const updates = `const update = await Updates
  .checkForUpdateAsync();

if (update.isAvailable) {
  await Updates.fetchUpdateAsync();
  await Updates.reloadAsync();
}

// app.json
"runtimeVersion": {
  "policy": "fingerprint"
}`;

const privacyConfig = `"NSPrivacyAccessedAPITypes": [{
  "NSPrivacyAccessedAPIType":
    "…CategoryUserDefaults",
  "NSPrivacyAccessedAPITypeReasons":
    ["CA92.1"]
}, {
  "NSPrivacyAccessedAPIType":
    "…CategoryFileTimestamp",
  "NSPrivacyAccessedAPITypeReasons":
    ["C617.1"]
}]`;

const deferredSteps = (last: { label: string; sub: string; icon: string; tone: 'bad' | 'good' }) => [
  { label: 'Tap ad', sub: 'link to /p/42', icon: '👆' },
  { label: 'App Store', sub: 'app not installed', icon: '🛒' },
  { label: 'Install', sub: 'the link is forgotten', icon: '⬇️' },
  { label: 'First open', icon: '🚀' },
  last,
];

const otaQuestion = 'You added a native camera library. How do you ship it?';
const otaOptions = ['OTA update', 'Store release', 'Either works'];

export const series: Series = {
  id: 'ship-it',
  title: 'Ship It',
  emoji: '🚢',
  color: '#34d399',
  order: 5,
  blurb: 'Links, updates and privacy forms that decide whether your release lands.',
  reels: [
    // ───────────────────────── 1. Deep links, end to end
    {
      id: 'ship-deep-linking-end-to-end',
      title: 'Deep links, end to end',
      beats: [
        {
          say: 'A good link survives the install. Most apps drop it.',
          scene: {
            type: 'title',
            kicker: 'Ship It',
            title: 'Your link should *survive install*',
            emoji: '🔗',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['survives', 'drop'],
        },
        {
          say: 'Someone taps your sneaker ad. They want that exact shoe, product forty two.',
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'app',
              title: 'Feed',
              icon: '📰',
              items: [
                { id: 'post', label: 'Sam’s cat photo', icon: '🐈', sub: '2,104 likes' },
                { id: 'ad', label: 'Trail runners, 30% off', icon: '👟', sub: 'Sponsored · /p/42', tone: 'accent' },
              ],
            },
            tap: { x: 0.5, y: 0.42 },
            caption: 'they want product 42',
          },
          sfx: 'pop',
          emphasis: ['exact', 'forty'],
        },
        {
          say: 'Getting them there takes three legs. Most apps only build the first.',
          scene: {
            type: 'list',
            title: 'A deep link has 3 legs',
            numbered: true,
            items: [
              { text: 'OS opens your app', icon: '📲', sub: 'scheme or verified https' },
              { text: 'URL becomes a screen', icon: '🧭', sub: 'your navigator' },
              { text: 'Survive the install', icon: '🧳', sub: 'deferred deep link' },
            ],
            active: 0,
          },
          sfx: 'pop',
          emphasis: ['three', 'first'],
        },
        {
          say: 'Leg one, the part most apps have: the OS hands you the URL, after checking a file on your domain.',
          speak: 'Leg one, the part most apps have: the OS hands you the U R L, after checking a file on your domain.',
          scene: {
            type: 'diagram',
            title: 'Leg 1: the OS opens you',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'link', label: 'Link tap', sub: '/p/42', icon: '🔗', x: 1, y: 0, shape: 'pill' },
              { id: 'android', label: 'Android', sub: 'assetlinks.json', icon: '🤖', x: 0, y: 1.6, tone: 'info' },
              { id: 'ios', label: 'iOS', sub: 'apple-app-site-…', icon: '🍎', x: 2, y: 1.6, tone: 'info' },
              { id: 'app', label: 'Your app', sub: 'gets the URL', icon: '📱', x: 1, y: 3.1, active: true, tone: 'good' },
            ],
            edges: [
              { from: 'link', to: 'android' },
              { from: 'link', to: 'ios' },
              { from: 'android', to: 'app', label: 'verified', active: true },
              { from: 'ios', to: 'app', label: 'verified', active: true },
            ],
            packets: [{ from: 'link', to: 'ios', label: 'URL' }],
          },
          sfx: 'swipe',
          emphasis: ['URL', 'file'],
        },
        {
          say: 'Leg two: the URL becomes a screen. React Navigation takes prefixes and a screens map.',
          speak: 'Leg two: the U R L becomes a screen. React Navigation takes prefixes and a screens map.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'linking.ts',
            code: linking,
            highlight: [[2, 5], 7],
            note: { line: 7, text: "/p/42 → Product, id '42'", tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['screen', 'prefixes'],
        },
        {
          say: 'Cold start or warm start, the navigator handles both. Expo Router does it from file names.',
          scene: {
            type: 'compare',
            title: 'Two ways a URL arrives',
            left: { title: 'Cold start', icon: '🧊', verdict: 'neutral', items: ['App was killed', 'getInitialURL()'] },
            right: { title: 'Warm start', icon: '🔥', verdict: 'neutral', items: ['App was running', "'url' event"] },
          },
          sfx: 'swipe',
          emphasis: ['both', 'Router'],
        },
        {
          say: 'Leg three loses money. No app yet, so: store, install, open... and they land on Home.',
          scene: {
            type: 'timeline',
            title: 'Leg 3: not installed',
            steps: deferredSteps({ label: 'Home screen', sub: 'where is my shoe?', icon: '😐', tone: 'bad' }),
            active: 4,
          },
          sfx: 'error',
          emphasis: ['money', 'Home'],
        },
        {
          say: 'The OS forgets the link across install. Android has the Play Install Referrer. iOS has nothing built in.',
          scene: {
            type: 'compare',
            title: 'Link after install?',
            left: { title: 'Android', icon: '🤖', verdict: 'neutral', items: ['Play Install Referrer', 'read on first launch'] },
            right: { title: 'iOS', icon: '🍎', verdict: 'bad', items: ['Nothing built in'] },
          },
          sfx: 'swipe',
          emphasis: ['forgets', 'nothing'],
        },
        {
          say: 'So teams use Branch or AppsFlyer. They remember the click and hand you the link on first open.',
          speak: 'So teams use Branch or Apps Flyer. They remember the click and hand you the link on first open.',
          scene: {
            type: 'diagram',
            title: 'Deferred deep link',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'click', label: 'Ad click', sub: '/p/42', icon: '👆', x: 0, y: 0 },
              { id: 'sdk', label: 'Link service', sub: 'Branch, AppsFlyer', icon: '🧠', x: 2, y: 1, active: true },
              { id: 'install', label: 'Install', icon: '⬇️', x: 0, y: 2 },
              { id: 'open', label: 'First open', sub: 'here’s /p/42', icon: '🚀', x: 2, y: 3, tone: 'good' },
            ],
            edges: [
              { from: 'click', to: 'sdk', label: 'store click', active: true },
              { from: 'click', to: 'install', dashed: true },
              { from: 'install', to: 'open', dashed: true },
              { from: 'sdk', to: 'open', label: 'match', active: true, tone: 'good' },
            ],
            packets: [{ from: 'sdk', to: 'open', label: '🔗', tone: 'good' }],
          },
          sfx: 'pop',
          emphasis: ['remember', 'first'],
        },
        {
          say: 'Now the same tap lands on the exact shoe. Test it with the app killed, not just backgrounded.',
          scene: {
            type: 'timeline',
            title: 'Leg 3: not installed',
            steps: deferredSteps({ label: 'Product 42', sub: 'the exact shoe 👟', icon: '🎯', tone: 'good' }),
            active: 4,
          },
          sfx: 'success',
          emphasis: ['exact', 'killed'],
        },
        {
          say: 'Remember this. Three legs: open the app, find the screen, survive the install.',
          scene: {
            type: 'outro',
            points: ['OS opens you: verified https', 'Navigator maps URL to screen', '*Deferred* links survive install'],
            tagline: 'Three legs, or it limps.',
          },
          sfx: 'success',
          emphasis: ['three', 'survive'],
        },
      ],
    },

    // ───────────────────────── 2. Store vs OTA updates
    {
      id: 'ship-store-vs-ota-updates',
      title: 'OTA updates and the rules',
      beats: [
        {
          say: 'Fix a live crash in minutes, without waiting on App Review.',
          scene: {
            type: 'title',
            kicker: 'Ship It',
            title: 'Skip the review line, *legally*',
            emoji: '🛫',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['minutes', 'without'],
        },
        {
          say: 'Friday night. A typo crashes checkout on every tap. A store fix means days of review.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'crash', app: 'Shop', message: "TypeError: Cannot read property 'total' of undefined" },
            caption: 'checkout is down 🔥',
          },
          sfx: 'error',
          emphasis: ['Friday', 'days'],
        },
        {
          say: 'But your app is two things: a native shell and a JS bundle. Only the shell needs the store.',
          speak: 'But your app is two things: a native shell and a J S bundle. Only the shell needs the store.',
          scene: {
            type: 'diagram',
            title: 'Two layers, two pipes',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'store', label: 'Store release', sub: 'review · days', icon: '🏪', x: 0, y: 0, tone: 'warn' },
              { id: 'ota', label: 'OTA update', sub: 'minutes', icon: '🛫', x: 2, y: 0, tone: 'good', active: true },
              { id: 'shell', label: 'Native shell', sub: 'native code, SDKs', icon: '🧱', x: 0, y: 2.6 },
              { id: 'bundle', label: 'JS bundle', sub: 'JS + assets', icon: '📦', x: 2, y: 2.6, active: true },
            ],
            edges: [
              { from: 'store', to: 'shell' },
              { from: 'store', to: 'bundle', dashed: true },
              { from: 'ota', to: 'bundle', active: true, tone: 'good' },
            ],
            packets: [{ from: 'ota', to: 'bundle', label: 'fix', tone: 'good' }],
          },
          sfx: 'pop',
          emphasis: ['shell', 'bundle'],
        },
        {
          say: 'The guard rail is runtimeVersion. Updates only install on builds with the same runtime.',
          speak: 'The guard rail is runtime version. Updates only install on builds with the same runtime.',
          scene: {
            type: 'diagram',
            title: 'Who gets the update?',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'update', label: 'Update', sub: 'runtime 1.5', icon: '🛫', x: 1, y: 0, active: true, shape: 'pill' },
              { id: 'a', label: 'Phone A', sub: 'runtime 1.5', icon: '📱', x: 0, y: 2.6, tone: 'good' },
              { id: 'b', label: 'Phone B', sub: 'runtime 1.4', icon: '📱', x: 2, y: 2.6, tone: 'bad', dim: true },
            ],
            edges: [
              { from: 'update', to: 'a', label: 'match ✓', active: true, tone: 'good' },
              { from: 'update', to: 'b', label: 'skip', dashed: true, tone: 'bad' },
            ],
            packets: [{ from: 'update', to: 'a', label: '📦', tone: 'good' }],
          },
          sfx: 'click',
          emphasis: ['runtimeVersion', 'same'],
        },
        {
          say: 'expo-updates checks, fetches, and reloads. The fingerprint policy bumps the runtime when native code changes.',
          speak: 'expo updates checks, fetches, and reloads. The fingerprint policy bumps the runtime when native code changes.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'updates.ts',
            code: updates,
            highlight: [[4, 7], [10, 12]],
            note: { line: 11, text: 'native change ⇒ new runtime', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['fingerprint', 'native'],
        },
        {
          say: "Allowed? Play exempts interpreted code, like JavaScript. Apple's rule two point five point two bans downloaded code that changes features.",
          scene: {
            type: 'compare',
            title: 'What the stores say',
            left: {
              title: 'Google Play',
              icon: '🤖',
              verdict: 'ok',
              items: ['No self-updating', 'Except interpreted code'],
            },
            right: {
              title: 'Apple',
              icon: '🍎',
              verdict: 'neutral',
              items: ['2.5.2: no new features', 'Fixes, not a new app'],
            },
          },
          sfx: 'swipe',
          emphasis: ['interpreted', 'features'],
        },
        {
          say: 'So: bug fixes, copy, and styling, yes. A brand new feature nobody reviewed, no.',
          scene: {
            type: 'list',
            title: 'Fine over the air?',
            items: [
              { text: 'Bug fixes', icon: '🐛', tone: 'good' },
              { text: 'Copy & styling tweaks', icon: '🎨', tone: 'good' },
              { text: 'Unreviewed new feature', icon: '🚫', tone: 'bad' },
            ],
          },
          sfx: 'pop',
          emphasis: ['fixes', 'reviewed'],
        },
        {
          say: "To ship it, use EAS Update or your own expo-updates server. CodePush retired in March 2025.",
          speak: "To ship it, use E A S Update or your own expo updates server. Code Push retired in March 2025.",
          scene: {
            type: 'terminal',
            title: 'Ship the hotfix',
            lines: [
              { cmd: 'eas update --branch production' },
              { out: 'Published to runtime 1.5 ✓', tone: 'good' },
              { out: 'react-native-code-push: archived', tone: 'muted' },
            ],
          },
          sfx: 'type',
          emphasis: ['retired', 'Update'],
        },
        {
          say: 'Quick check. You added a native camera library. Can that go over the air?',
          scene: { type: 'quiz', question: otaQuestion, options: otaOptions, answer: 1 },
          sfx: 'riser',
          emphasis: ['native'],
        },
        {
          say: 'Store only. Native code lives in the binary. An update that needs it crashes at launch.',
          scene: {
            type: 'quiz',
            question: otaQuestion,
            options: otaOptions,
            answer: 1,
            reveal: true,
            explain: 'New native code = new binary = new runtimeVersion.',
          },
          sfx: 'ding',
          emphasis: ['binary', 'crashes'],
        },
        {
          say: 'Remember this. Shell through the store, fixes over the air, and runtimeVersion keeps them matched.',
          speak: 'Remember this. Shell through the store, fixes over the air, and runtime version keeps them matched.',
          scene: {
            type: 'outro',
            points: ['Native change? *Store release*', 'JS fix? Over the air', 'runtimeVersion keeps them matched'],
            tagline: 'Shell by store, fixes by air.',
          },
          sfx: 'success',
          emphasis: ['shell', 'air'],
        },
      ],
    },

    // ───────────────────────── 3. Privacy manifests & Data safety
    {
      id: 'ship-privacy-manifests-data-safety',
      title: 'Privacy forms that block releases',
      beats: [
        {
          say: 'Apple rejected your upload for reading UserDefaults. Really.',
          speak: 'Apple rejected your upload for reading user defaults. Really.',
          scene: {
            type: 'title',
            kicker: 'Ship It',
            title: 'Rejected for *UserDefaults*',
            emoji: '📮',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['rejected', 'UserDefaults'],
        },
        {
          say: "The upload hits ninety nine percent, then this email. You read UserDefaults and didn't say why.",
          speak: "The upload hits ninety nine percent, then this email. You read user defaults and didn't say why.",
          scene: {
            type: 'phone',
            os: 'ios',
            screen: {
              kind: 'notification',
              behind: 'home',
              notice: {
                app: 'App Store Connect',
                title: 'ITMS-91053: Missing API declaration',
                body: 'NSPrivacyAccessedAPICategoryUserDefaults',
                icon: '✉️',
              },
            },
            caption: 'yes, that UserDefaults 🙃',
          },
          sfx: 'error',
          emphasis: ['why'],
        },
        {
          say: 'Apple wants a privacy manifest, a file called PrivacyInfo, inside your app and inside every SDK.',
          speak: 'Apple wants a privacy manifest, a file called privacy info, inside your app and inside every S D K.',
          scene: {
            type: 'tree',
            title: 'PrivacyInfo.xcprivacy',
            root: {
              id: 'app',
              label: 'Your app',
              active: true,
              children: [
                { id: 'own', label: 'Your manifest', active: true },
                { id: 'rn', label: 'React Native', dirty: true },
                { id: 'fb', label: 'Firebase', dirty: true },
                { id: 'ads', label: 'Ads SDK', dirty: true },
              ],
            },
            caption: 'one per app, one per SDK',
          },
          sfx: 'pop',
          emphasis: ['manifest', 'every'],
        },
        {
          say: 'It lists what you track, which domains track, what data you collect, and which required reason APIs you call.',
          speak: 'It lists what you track, which domains track, what data you collect, and which required reason A P Is you call.',
          scene: {
            type: 'list',
            title: 'Inside the manifest',
            items: [
              { text: 'Tracking', icon: '🕵️', sub: 'NSPrivacyTracking' },
              { text: 'Tracking domains', icon: '🌐' },
              { text: 'Data you collect', icon: '📋' },
              { text: 'Required reason APIs', icon: '🧾', tone: 'accent' },
            ],
            active: 3,
          },
          sfx: 'pop',
          emphasis: ['track', 'reason'],
        },
        {
          say: 'UserDefaults, file timestamps, boot time, disk space, keyboards. Each one needs an approved reason code.',
          speak: 'User defaults, file timestamps, boot time, disk space, keyboards. Each one needs an approved reason code.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'ios.privacyManifests',
            code: privacyConfig,
            highlight: [[2, 5]],
            note: { line: 5, text: 'CA92.1 = your own UserDefaults', tone: 'info' },
          },
          sfx: 'type',
          emphasis: ['reason', 'code'],
        },
        {
          say: 'File timestamps get their own code. In Expo, this block lives in app.json, and prebuild writes the real file.',
          speak: 'File timestamps get their own code. In Expo, this block lives in app dot json, and prebuild writes the real file.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'ios.privacyManifests',
            code: privacyConfig,
            highlight: [[7, 10]],
            note: { line: 10, text: 'C617.1 = files in your container', tone: 'info' },
          },
          sfx: 'click',
          emphasis: ['Expo', 'prebuild'],
        },
        {
          say: 'Since May 2024, a missing reason means the upload is rejected before review even starts.',
          scene: {
            type: 'stat',
            value: 'May 2024',
            label: 'missing reason = *upload rejected*',
            sub: 'checked at upload, before review',
            tone: 'bad',
          },
          sfx: 'error',
          emphasis: ['rejected', 'before'],
        },
        {
          say: 'Bonus trap. Domains in your tracking list are blocked at the network level until the user allows tracking.',
          scene: {
            type: 'diagram',
            title: 'Tracking domains',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', icon: '📱', x: 0, y: 0.5 },
              { id: 'api', label: 'api.shop.com', icon: '✅', x: 2, y: 0.5, tone: 'good' },
              { id: 'tracker', label: 'track.ads.com', sub: 'blocked until ATT yes', icon: '⛔', x: 2, y: 2.6, tone: 'bad' },
            ],
            edges: [
              { from: 'app', to: 'api', active: true, tone: 'good' },
              { from: 'app', to: 'tracker', dashed: true, tone: 'bad' },
            ],
            packets: [{ from: 'app', to: 'api', tone: 'good' }],
          },
          sfx: 'click',
          emphasis: ['blocked', 'tracking'],
        },
        {
          say: "Google's version is the Data safety form. Every app fills it, including what your SDKs collect, and it shows on your listing.",
          speak: "Google's version is the Data safety form. Every app fills it, including what your S D Ks collect, and it shows on your listing.",
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Data safety',
              icon: '🛡️',
              items: [
                { id: 'crash', label: 'Crash logs', sub: 'collected by Crashlytics', checked: true },
                { id: 'device', label: 'Device IDs', sub: 'collected by Analytics', checked: true },
                { id: 'loc', label: 'Location', sub: 'not collected', checked: false },
              ],
              button: 'Save',
            },
            caption: 'Play Console › App content',
          },
          sfx: 'swipe',
          emphasis: ['SDKs', 'listing'],
        },
        {
          say: 'Remember this. Every new SDK is a new answer on two forms. Update both before you ship.',
          speak: 'Remember this. Every new S D K is a new answer on two forms. Update both before you ship.',
          scene: {
            type: 'outro',
            points: ['iOS: PrivacyInfo + reason codes', 'Android: Data safety form', 'New SDK? *Re-check both*'],
            tagline: 'New SDK, new answers.',
          },
          sfx: 'success',
          emphasis: ['SDK', 'both'],
        },
      ],
    },
  ],
};
