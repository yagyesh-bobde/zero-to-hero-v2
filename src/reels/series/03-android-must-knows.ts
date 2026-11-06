import type { Series } from '../types';

// ---------- shared code snippets ----------

const manifest = `<uses-permission android:name=
  "android.permission.INTERNET" />
<application>
  <activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:configChanges=
      "orientation|screenSize|…"
    android:exported="true">
    <intent-filter>
      <!-- MAIN + LAUNCHER -->
    </intent-filter>
  </activity>
</application>`;

const exactAlarms = `import {
  canScheduleExactAlarms,
  openSettings,
} from 'react-native-permissions';

const ok =
  await canScheduleExactAlarms();
if (!ok) openSettings('alarms');`;

const persist = `// remember the screen stack
<NavigationContainer
  initialState={savedNav}
  onStateChange={saveNav}
/>

// save drafts as they type
mmkv.set(
  'checkout-draft',
  JSON.stringify(form),
);`;

const workRequest = `val rules = Constraints.Builder()
  .setRequiredNetworkType(
    NetworkType.CONNECTED)
  .setRequiresBatteryNotLow(true)
  .build()
val req =
  PeriodicWorkRequestBuilder<
    FlushWorker>(1, HOURS)
  .setConstraints(rules)
  .build()
WorkManager.getInstance(ctx)
  .enqueueUniquePeriodicWork(
    "flush-outbox", KEEP, req)`;

const expoTask = `TaskManager.defineTask(
  'flush-outbox',
  async () => {
    await flushOutbox();
    return BackgroundTask
      .BackgroundTaskResult.Success;
  },
);

BackgroundTask.registerTaskAsync(
  'flush-outbox',
  { minimumInterval: 60 },
);`;

const fgsManifest = `<uses-permission android:name=
  "…FOREGROUND_SERVICE" />
<uses-permission android:name=
  "…FOREGROUND_SERVICE_LOCATION" />

<service
  android:name=".TrackingService"
  android:foregroundServiceType=
    "location"
  android:exported="false" />`;

const notifeeFgs = `// index.ts, outside components
notifee.registerForegroundService(
  () => new Promise(() => {}),
);

notifee.displayNotification({
  title: 'Tracking your route',
  android: {
    channelId: 'trips',
    asForegroundService: true,
  },
});`;

const syncTimer = `// keep messages fresh
setInterval(() => {
  syncMessages();
}, 5 * 60 * 1000); // every 5 min`;

const bootManifest = `<uses-permission android:name=
  "…RECEIVE_BOOT_COMPLETED" />

<receiver
  android:name=".BootReceiver"
  android:exported="true">
  <intent-filter>
    <action android:name=
      "…BOOT_COMPLETED" />
  </intent-filter>
</receiver>`;

const bootReceiver = `class BootReceiver :
  BroadcastReceiver() {
  override fun onReceive(
    ctx: Context, i: Intent
  ) {
    if (i.action !=
      Intent.ACTION_BOOT_COMPLETED
    ) return
    // seconds to live: hand off
    WorkManager.getInstance(ctx)
      .enqueue(rearmReminders)
  }
}`;

const channels = `const channelId =
  await notifee.createChannel({
    id: 'orders',
    name: 'Order updates',
    importance:
      AndroidImportance.HIGH,
  });

notifee.displayNotification({
  title: 'Driver is 2 min away',
  android: { channelId },
});`;

const fcmPayload = `{
  "message": {
    "android": {
      "notification": {
        "channel_id": "orders"
      }
    }
  }
}`;

const appLinkFilter = `<intent-filter
  android:autoVerify="true">
  <action android:name=
    "android.intent.action.VIEW" />
  <category android:name=
    "…category.DEFAULT" />
  <category android:name=
    "…category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="shop.example.com"
    android:pathPrefix="/p/" />
</intent-filter>`;

const assetLinks = `[{
  "relation": ["…handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name":
      "com.shop.app",
    "sha256_cert_fingerprints": [
      "AB:CD:EF:…"
    ]
  }
}]`;

const pip = `// manifest, on MainActivity:
// supportsPictureInPicture="true"

val params =
  PictureInPictureParams.Builder()
  .setAspectRatio(Rational(16, 9))
  .setAutoEnterEnabled(true)
  .build()
setPictureInPictureParams(params)`;

const adIdManifest = `<manifest …>
  <!-- targeting Android 13+ -->
  <uses-permission android:name=
    "…gms.permission.AD_ID" />

  <application>…</application>
</manifest>`;

const adIdJs = `import { getAdvertisingId }
  from 'expo-tracking-transparency';

const adId = getAdvertisingId();

const zeros = /^[0-]+$/;
if (!adId || zeros.test(adId)) {
  // skip the ads work, carry on
}`;

const gradle = `android {
  buildTypes {
    release {
      signingConfig
        signingConfigs.release
      minifyEnabled true
      shrinkResources true
    }
  }
}`;

export const series: Series = {
  id: 'android-must-knows',
  title: 'Android Must-Knows',
  emoji: '🤖',
  color: '#3ddc84',
  order: 3,
  blurb: 'Android superpowers you didn’t know existed, and when to reach for them from React Native.',
  reels: [
    // 1 ─────────────────────────────────────────────────────────────
    {
      id: 'android-manifest-what-it-declares',
      title: 'The file Android reads first',
      beats: [
        {
          say: 'Before your JavaScript runs, Android reads this one file.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Android reads *this* first',
            sub: 'AndroidManifest.xml',
            emoji: '📜',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['before', 'file'],
        },
        {
          say: 'Meet the manifest. It’s your app’s menu card for Android: here’s my screen, here’s what I need.',
          scene: { type: 'code', lang: 'xml', file: 'AndroidManifest.xml', code: manifest },
          sfx: 'type',
          emphasis: ['manifest', 'menu'],
        },
        {
          say: 'Every screen, background service, event listener and permission is listed here. Not listed? Android simply can’t start it.',
          scene: {
            type: 'diagram',
            title: 'What the manifest declares',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'm', label: 'Manifest', icon: '📜', x: 1, y: 0, active: true },
              { id: 'act', label: 'Activity', sub: 'a screen', icon: '📱', x: 0, y: 2 },
              { id: 'svc', label: 'Service', sub: 'background work', icon: '⚙️', x: 2, y: 2 },
              { id: 'rcv', label: 'Receiver', sub: 'system events', icon: '📡', x: 0, y: 3.4 },
              { id: 'perm', label: 'Permission', sub: 'what you touch', icon: '🔐', x: 2, y: 3.4 },
            ],
            edges: [
              { from: 'm', to: 'act', active: true },
              { from: 'm', to: 'svc', active: true },
              { from: 'm', to: 'rcv', active: true },
              { from: 'm', to: 'perm', active: true },
            ],
            caption: 'not listed = can’t start',
          },
          sfx: 'pop',
          emphasis: ['listed', 'can’t'],
        },
        {
          say: 'A React Native app has exactly one activity. Your entire React tree lives inside it.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: manifest,
            highlight: [[4, 5]],
            note: { line: 5, text: 'your whole React app lives here', tone: 'accent' },
          },
          emphasis: ['one', 'entire'],
        },
        {
          say: 'This config changes line is why rotating the phone doesn’t destroy and rebuild your whole app.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: manifest,
            highlight: [[7, 8]],
            note: { line: 8, text: 'rotate ≠ restart', tone: 'good' },
          },
          emphasis: ['rotating', 'destroy'],
        },
        {
          say: 'And single task is why tapping a deep link reuses your running app instead of opening a second copy.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: manifest,
            highlight: [6],
            note: { line: 6, text: 'deep links reuse the running app', tone: 'info' },
          },
          emphasis: ['reuses', 'second'],
        },
        {
          say: 'Add a uses feature line for the camera, and phones without one won’t even see you on Play.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Play Store',
              icon: '▶️',
              items: [
                { id: 'snap', label: 'Snapcat', icon: '📷', sub: 'Your device isn’t compatible', tone: 'bad' },
                { id: 'req', label: 'Requires', icon: '📸', sub: 'a rear camera', tone: 'warn' },
                { id: 'dev', label: 'This device', icon: '📟', sub: 'no camera', tone: 'muted' },
              ],
              button: 'Not available',
            },
            caption: '<uses-feature camera required>',
          },
          sfx: 'error',
          emphasis: ['camera', 'see'],
        },
        {
          say: 'On Expo you never edit it by hand. App dot json and config plugins write it during prebuild.',
          speak: 'On Expo you never edit it by hand. App dot jason and config plugins write it during pre build.',
          scene: {
            type: 'compare',
            title: 'Who writes it?',
            left: { title: 'Bare RN', verdict: 'neutral', icon: '✍️', items: ['You edit the XML', 'Lives in android/app'] },
            right: { title: 'Expo', verdict: 'ok', icon: '🪄', items: ['app.json + plugins', 'Generated on prebuild'] },
          },
          emphasis: ['never', 'prebuild'],
        },
        {
          say: 'Watch out: libraries merge their own manifests into yours, so a dependency can sneak in permissions.',
          scene: {
            type: 'terminal',
            title: 'Check the merged manifest',
            lines: [
              { cmd: 'cd app/build/intermediates' },
              { cmd: 'grep -r permission merged*' },
              { out: 'android.permission.INTERNET', tone: 'muted' },
              { out: '…gms.permission.AD_ID', tone: 'warn' },
              { out: '↑ you never wrote this one', tone: 'warn' },
            ],
          },
          sfx: 'type',
          emphasis: ['merge', 'sneak'],
        },
        {
          say: 'Remember this. When a library says add this to your manifest, it means this one file.',
          scene: {
            type: 'outro',
            points: ['The manifest is your menu for *Android*', 'Not listed? Android can’t start it', 'Check the *merged* one before shipping'],
            tagline: 'Android reads it first.',
          },
          sfx: 'success',
          emphasis: ['manifest', 'one'],
        },
      ],
    },

    // 2 ─────────────────────────────────────────────────────────────
    {
      id: 'android-permissions-three-kinds',
      title: 'Three kinds of permission',
      beats: [
        {
          say: 'Android has three kinds of permission. Most devs only know one.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Three doors. You know *one*.',
            sub: 'install · dialog · settings',
            emoji: '🚪',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['three', 'one'],
        },
        {
          say: 'Door one: normal permissions, like internet. List them in the manifest and they’re granted at install. No dialog.',
          scene: {
            type: 'list',
            title: 'Which door?',
            numbered: true,
            active: 0,
            items: [
              { text: '*Normal*', sub: 'granted at install', icon: '✅' },
              { text: '*Dangerous*', sub: 'system dialog', icon: '💬' },
              { text: '*Special*', sub: 'a Settings toggle', icon: '⚙️' },
            ],
          },
          sfx: 'pop',
          emphasis: ['normal', 'install'],
        },
        {
          say: 'Door two: dangerous ones, like camera or location. You get the classic dialog, so ask right when they tap the feature.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'permission',
              app: 'Allow Snapcat',
              icon: '📷',
              text: 'to take pictures and record video?',
              allow: 'While using the app',
              deny: 'Don’t allow',
            },
            caption: 'asked when they tap “Scan”',
          },
          sfx: 'pop',
          emphasis: ['dangerous', 'dialog'],
        },
        {
          say: 'Deny it twice and Android stops asking. React Native Permissions calls that blocked.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'permission',
              app: 'Allow Snapcat',
              icon: '📷',
              text: 'to take pictures and record video?',
              allow: 'While using the app',
              deny: 'Don’t allow',
              choice: 'deny',
            },
            caption: 'twice → BLOCKED',
          },
          sfx: 'error',
          emphasis: ['twice', 'blocked'],
        },
        {
          say: 'Door three is the sneaky one. Special permissions, like drawing over other apps or exact alarms. No dialog at all.',
          scene: {
            type: 'list',
            title: 'Which door?',
            numbered: true,
            active: 2,
            items: [
              { text: '*Normal*', sub: 'granted at install', icon: '✅' },
              { text: '*Dangerous*', sub: 'system dialog', icon: '💬' },
              { text: '*Special*', sub: 'overlay · exact alarms', icon: '⚙️', tone: 'warn' },
            ],
          },
          sfx: 'riser',
          emphasis: ['special', 'no'],
        },
        {
          say: 'Instead, you send the user to a Settings screen, they flip a switch, and you check again when they’re back.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Alarms & reminders',
              icon: '⚙️',
              body: 'Allow setting alarms and reminders',
              items: [
                { id: 'clock', label: 'Clock', icon: '⏰', checked: true, tone: 'muted' },
                { id: 'sw', label: 'Remindly', icon: '💊', checked: true, tone: 'good' },
                { id: 'cal', label: 'Calendar', icon: '📅', checked: false, tone: 'muted' },
              ],
            },
            tap: { x: 0.85, y: 0.42 },
            caption: 'the only way in',
          },
          sfx: 'click',
          emphasis: ['settings', 'switch'],
        },
        {
          say: 'From React Native, react-native-permissions checks exact alarms and opens that exact page for you.',
          speak: 'From React Native, react native permissions checks exact alarms and opens that exact page for you.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'reminders.ts',
            code: exactAlarms,
            highlight: [[6, 8]],
            note: { line: 8, text: 'opens the toggle · recheck', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['exact', 'page'],
        },
        {
          say: 'Since Android fourteen, exact alarms start switched off on fresh installs. So most reminders should just use inexact alarms or WorkManager.',
          speak: 'Since Android fourteen, exact alarms start switched off on fresh installs. So most reminders should just use inexact alarms or work manager.',
          scene: {
            type: 'stat',
            value: '14',
            unit: '+',
            label: 'exact alarms *off* by default',
            sub: 'Android 14+, fresh installs',
            tone: 'warn',
          },
          emphasis: ['off', 'inexact'],
        },
        {
          say: 'Remember this. Before adding any permission, ask which door it uses: install, dialog, or settings.',
          scene: {
            type: 'outro',
            points: ['Normal: free at *install*', 'Dangerous: a *dialog*, ask late', 'Special: send them to *Settings*'],
            tagline: 'Know your door.',
          },
          sfx: 'success',
          emphasis: ['door'],
        },
      ],
    },

    // 3 ─────────────────────────────────────────────────────────────
    {
      id: 'android-activity-killed-rn-state',
      title: 'Why your state vanished',
      beats: [
        {
          say: 'Your app restarted. Nobody crashed. Android did it on purpose.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Nobody crashed. It *restarted*.',
            emoji: '🫥',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['restarted', 'purpose'],
        },
        {
          say: 'A user fills in your checkout, then hops over to their bank app to grab a one time code.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Checkout',
              icon: '🛍️',
              items: [
                { id: 'cart', label: 'Cart', icon: '🛒', sub: '3 items' },
                { id: 'addr', label: 'Address', icon: '🏠', value: '12 Oak St' },
                { id: 'card', label: 'Card', icon: '💳', value: '•••• 4242' },
              ],
              button: 'Pay now',
            },
            caption: 'switching to the bank app…',
          },
          sfx: 'pop',
          emphasis: ['checkout', 'bank'],
        },
        {
          say: 'Ninety seconds later, on a phone short on memory, Android kills your whole process. No crash. No log.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'killed', app: 'ShopApp', icon: '🛍️', reason: 'Killed to free memory' },
            caption: 'silent. no crash report.',
          },
          sfx: 'error',
          emphasis: ['kills', 'no'],
        },
        {
          say: 'They come back to the home screen and an empty cart. Store, form, navigation. All gone.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Home',
              icon: '🛍️',
              items: [
                { id: 'cart', label: 'Cart', icon: '🛒', sub: '0 items', tone: 'bad' },
                { id: 'addr', label: 'Address', icon: '🏠', value: '', tone: 'bad' },
                { id: 'card', label: 'Card', icon: '💳', value: '', tone: 'bad' },
              ],
            },
            caption: 'fresh JS runtime 😬',
          },
          sfx: 'error',
          emphasis: ['empty', 'gone'],
        },
        {
          say: 'Here’s why. Once your activity is stopped in the background, Android may kill the process whenever it needs memory.',
          scene: {
            type: 'timeline',
            title: 'An activity’s life',
            active: 4,
            steps: [
              { label: 'Created', icon: '🐣' },
              { label: 'Started', icon: '▶️' },
              { label: 'Resumed', sub: 'on screen', icon: '📱' },
              { label: 'Paused', sub: 'bank app opens', icon: '⏸️' },
              { label: 'Stopped', sub: 'killable from here', icon: '💀', tone: 'bad' },
            ],
          },
          sfx: 'swipe',
          emphasis: ['stopped', 'kill'],
        },
        {
          say: 'And AppState won’t warn you. It knows background and foreground, never killed. So test it yourself.',
          speak: 'And app state won’t warn you. It knows background and foreground, never killed. So test it yourself.',
          scene: {
            type: 'terminal',
            title: 'Simulate it',
            lines: [
              { out: '# background the app, then:', tone: 'muted' },
              { cmd: 'adb shell am kill com.shop' },
              { out: 'process gone. reopen it.', tone: 'bad' },
              { out: '# or: Don’t keep activities', tone: 'muted' },
            ],
          },
          sfx: 'type',
          emphasis: ['never', 'test'],
        },
        {
          say: 'The fix: save what matters. Persist navigation state, keep drafts in MMKV, and restore on launch.',
          speak: 'The fix: save what matters. Persist navigation state, keep drafts in M M K V, and restore on launch.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'App.tsx',
            code: persist,
            added: [[2, 5], [8, 11]],
            note: { line: 11, text: 'survives process death', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['save', 'restore'],
        },
        {
          say: 'Now the bank round trip lands right back on the same checkout, card and all.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Checkout',
              icon: '🛍️',
              items: [
                { id: 'cart', label: 'Cart', icon: '🛒', sub: '3 items', tone: 'good' },
                { id: 'addr', label: 'Address', icon: '🏠', value: '12 Oak St', tone: 'good' },
                { id: 'card', label: 'Card', icon: '💳', value: '•••• 4242', tone: 'good' },
              ],
              button: 'Pay now',
              toast: 'Restored ✅',
            },
            caption: 'new process, same screen',
          },
          sfx: 'success',
          emphasis: ['same', 'checkout'],
        },
        {
          say: 'Remember this. In the background, your app can die silently. Save anything you’d hate to lose.',
          scene: {
            type: 'outro',
            points: ['Stopped apps can be *killed* silently', 'AppState never sees process death', 'Persist *nav + drafts*, restore on launch'],
            tagline: 'Background means mortal.',
          },
          sfx: 'success',
          emphasis: ['silently', 'save'],
        },
      ],
    },

    // 4 ─────────────────────────────────────────────────────────────
    {
      id: 'android-workmanager-periodic-jobs',
      title: 'Cron jobs your app survives',
      beats: [
        {
          say: 'Android can run your code hourly, even after your app dies.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Cron jobs that *survive* your app',
            emoji: '⏰',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['hourly', 'dies'],
        },
        {
          say: 'Say your app queues analytics and offline edits, and uploads them next time it opens. That could be days.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Outbox',
              icon: '📤',
              body: 'waiting for the app to open…',
              items: [
                { id: 'e1', label: 'checkout_started', icon: '📊', sub: 'queued 3 days ago', tone: 'warn' },
                { id: 'e2', label: 'note edited offline', icon: '📝', sub: 'queued 2 days ago', tone: 'warn' },
                { id: 'e3', label: 'item_viewed', icon: '📊', sub: 'queued yesterday', tone: 'warn' },
              ],
            },
            caption: 'your dashboard is blind',
          },
          sfx: 'error',
          emphasis: ['next', 'days'],
        },
        {
          say: 'Android has a built in scheduler for exactly this. It’s called WorkManager, and it saves your job in a database.',
          speak: 'Android has a built in scheduler for exactly this. It’s called work manager, and it saves your job in a database.',
          scene: {
            type: 'diagram',
            title: 'WorkManager',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', icon: '📱', x: 0, y: 0 },
              { id: 'wm', label: 'WorkManager', icon: '🗓️', x: 0, y: 1.5, active: true },
              { id: 'db', label: 'Job database', sub: 'hourly job', icon: '🗄️', x: 0, y: 3 },
            ],
            edges: [
              { from: 'app', to: 'wm', label: 'enqueue', active: true },
              { from: 'wm', to: 'db', label: 'save', active: true },
            ],
            packets: [{ from: 'app', to: 'wm', label: 'job' }],
          },
          sfx: 'pop',
          emphasis: ['WorkManager', 'database'],
        },
        {
          say: 'So your app gets killed, the phone even reboots, and the job is still there, waiting.',
          scene: {
            type: 'diagram',
            title: 'WorkManager',
            cols: 2,
            rows: 4,
            nodes: [
              { id: 'app', label: 'Your app', sub: 'killed ✕', icon: '📱', x: 0, y: 0, dim: true, tone: 'bad' },
              { id: 'boot', label: 'Reboot', sub: 'power cycle', icon: '🔄', x: 1, y: 0, dim: true },
              { id: 'wm', label: 'WorkManager', icon: '🗓️', x: 0.5, y: 1.5, active: true },
              { id: 'db', label: 'Job database', sub: 'still here ✓', icon: '🗄️', x: 0.5, y: 3, tone: 'good', active: true },
            ],
            edges: [
              { from: 'app', to: 'wm', dashed: true, tone: 'bad' },
              { from: 'boot', to: 'wm', dashed: true },
              { from: 'wm', to: 'db', label: 'reload', active: true, both: true },
            ],
          },
          sfx: 'ding',
          emphasis: ['killed', 'reboots', 'still'],
        },
        {
          say: 'You hand it a job and a rule: run my flush worker every hour.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'Scheduler.kt',
            code: workRequest,
            highlight: [[6, 10]],
            note: { line: 10, text: 'every hour', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['every', 'hour'],
        },
        {
          say: 'Add conditions too. Only when there’s network, and only when the battery isn’t low.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'Scheduler.kt',
            code: workRequest,
            highlight: [[1, 5]],
            note: { line: 5, text: 'online + battery OK', tone: 'good' },
          },
          emphasis: ['network', 'battery'],
        },
        {
          say: 'It’s not a precise cron. Fifteen minutes is the minimum, and Android picks the moment inside a flex window.',
          scene: {
            type: 'timeline',
            title: 'One hour of flush-outbox',
            active: 1,
            steps: [
              { label: 'Period starts', sub: 'minimum 15 min', icon: '⏱️' },
              { label: 'Flex window', sub: 'Android picks when', icon: '🎯', tone: 'accent' },
              { label: 'Offline?', sub: 'it waits for network', icon: '📵' },
              { label: 'Failed?', sub: 'Result.retry()', icon: '🔁' },
            ],
          },
          sfx: 'swipe',
          emphasis: ['precise', 'fifteen', 'flex'],
        },
        {
          say: 'And if the upload fails, return retry. It backs off and tries again on its own.',
          scene: {
            type: 'timeline',
            title: 'One hour of flush-outbox',
            active: 3,
            steps: [
              { label: 'Period starts', sub: 'minimum 15 min', icon: '⏱️' },
              { label: 'Flex window', sub: 'Android picks when', icon: '🎯' },
              { label: 'Offline?', sub: 'it waits for network', icon: '📵' },
              { label: 'Failed?', sub: 'backs off, tries again', icon: '🔁', tone: 'good' },
            ],
          },
          emphasis: ['retry', 'backs'],
        },
        {
          say: 'From React Native, expo-background-task wraps it. Define the task in JavaScript, register an interval, done.',
          speak: 'From React Native, expo background task wraps it. Define the task in JavaScript, register an interval, done.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'index.ts',
            code: expoTask,
            highlight: [1, [10, 13]],
            note: { line: 13, text: 'minutes · WorkManager underneath', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['JavaScript', 'done'],
        },
        {
          say: 'Reach for it whenever work should happen later, but reliably.',
          scene: {
            type: 'list',
            title: 'Perfect for…',
            items: [
              { text: 'Flush the *outbox*', icon: '📤' },
              { text: 'Sync *offline* edits', icon: '📝' },
              { text: 'Upload crash *logs*', icon: '🪵' },
              { text: 'Refresh *overnight*', icon: '🌙' },
            ],
          },
          sfx: 'pop',
          emphasis: ['later', 'reliably'],
        },
        {
          say: 'Remember this. Never write we’ll sync when they reopen. Reach for WorkManager instead.',
          speak: 'Remember this. Never write we’ll sync when they reopen. Reach for work manager instead.',
          scene: {
            type: 'outro',
            points: ['WorkManager: a cron that *survives* kills', 'Think “soon”, not “at 2:00”', 'From RN: *expo-background-task*'],
            tagline: 'Later, but reliably.',
          },
          sfx: 'success',
          emphasis: ['reopen', 'WorkManager'],
        },
      ],
    },

    // 5 ─────────────────────────────────────────────────────────────
    {
      id: 'android-foreground-services-types',
      title: 'Foreground services, now typed',
      beats: [
        {
          say: 'Want to keep working with the screen off? Pay with a notification.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Pay with a *notification*',
            emoji: '🧾',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['screen', 'notification'],
        },
        {
          say: 'A delivery app tracks the rider’s route with the phone in their pocket. That notification is the price.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'lock',
              time: '9:41',
              notices: [{ app: 'Dashly', title: 'Tracking your route', body: 'Delivery 3 of 8 · 2.4 km to go', icon: '🛵' }],
            },
            caption: 'the price of running',
          },
          sfx: 'pop',
          emphasis: ['tracks', 'price'],
        },
        {
          say: 'That’s a foreground service. It keeps music playing and maps tracking.',
          scene: {
            type: 'list',
            title: 'Foreground service = …',
            items: [
              { text: 'Music with the *screen off*', icon: '🎧' },
              { text: 'Route *tracking*', icon: '🗺️' },
              { text: 'A 300-photo *upload*', icon: '⬆️' },
            ],
          },
          sfx: 'pop',
          emphasis: ['foreground', 'service'],
        },
        {
          say: 'Since Android fourteen, every foreground service must declare a type, like location, media playback, or data sync.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: fgsManifest,
            highlight: [[8, 9]],
            note: { line: 9, text: 'required on Android 14+', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['type', 'fourteen'],
        },
        {
          say: 'Each type needs its matching permission, and a location service won’t even start until location is granted.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: fgsManifest,
            highlight: [[3, 4]],
            note: { line: 4, text: 'one permission per type', tone: 'warn' },
          },
          emphasis: ['matching', 'granted'],
        },
        {
          say: 'Android fifteen adds a timer. Data sync and media processing get six hours a day, then you must stop.',
          scene: {
            type: 'stat',
            value: '6',
            unit: 'hours',
            label: 'per day for *dataSync*',
            sub: 'Android 15, then onTimeout fires',
            tone: 'warn',
          },
          sfx: 'riser',
          emphasis: ['six', 'stop'],
        },
        {
          say: 'And you mostly can’t start one while your app is in the background. Android just throws. Start it from a user tap.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'crash', app: 'Dashly', message: 'ForegroundService\u200BStartNotAllowed\u200BException' },
            caption: 'started from a background timer',
          },
          sfx: 'error',
          emphasis: ['background', 'tap'],
        },
        {
          say: 'From React Native, Notifee turns a notification into a foreground service, and your JavaScript keeps running underneath.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'index.ts',
            code: notifeeFgs,
            highlight: [[2, 4], 10],
            note: { line: 10, text: 'type still goes in the manifest', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['Notifee', 'running'],
        },
        {
          say: 'Honest advice: if the work can wait, use WorkManager. Foreground services are for things the user watches happen.',
          speak: 'Honest advice: if the work can wait, use work manager. Foreground services are for things the user watches happen.',
          scene: {
            type: 'compare',
            title: 'Which one?',
            left: { title: 'Right now', verdict: 'neutral', icon: '👀', items: ['Foreground service', 'User is watching', 'Visible notification', 'Type + Play review'] },
            right: { title: 'Later', verdict: 'ok', icon: '🗓️', items: ['A scheduled job', 'Can wait a bit', 'No notification', 'Survives reboots'] },
          },
          sfx: 'swipe',
          emphasis: ['wait', 'watches'],
        },
        {
          say: 'Remember this. A foreground service is a deal: a visible notification and a declared type.',
          scene: {
            type: 'outro',
            points: ['Screen-off work = *visible* notification', 'Android 14+: declare a *type*', 'Can it wait? *WorkManager*'],
            tagline: 'Visible work only.',
          },
          sfx: 'success',
          emphasis: ['deal', 'type'],
        },
      ],
    },

    // 6 ─────────────────────────────────────────────────────────────
    {
      id: 'android-doze-why-timer-stopped',
      title: 'Doze ate your timer',
      beats: [
        {
          say: 'Your setInterval didn’t break. The phone fell asleep on purpose.',
          speak: 'Your set interval didn’t break. The phone fell asleep on purpose.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Doze *ate* your timer',
            emoji: '😴',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['asleep', 'purpose'],
        },
        {
          say: 'Bug report: chat sync stops at night. Your code is fine. The phone went into Doze.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'sync.ts',
            code: syncTimer,
            errors: [[2, 4]],
            note: { line: 4, text: 'silent from 1 AM to 7 AM 😴', tone: 'bad' },
          },
          sfx: 'error',
          emphasis: ['night', 'Doze'],
        },
        {
          say: 'Unplugged, screen off, sitting still for a while? Android cuts the network, ignores wake locks, and parks your jobs.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'lock', time: '2:14' },
            caption: 'unplugged · still · screen off',
          },
          sfx: 'swipe',
          emphasis: ['network', 'parks'],
        },
        {
          say: 'Every so often it wakes for a short maintenance window, runs what’s queued, then sleeps again.',
          scene: {
            type: 'timeline',
            title: 'One night on the nightstand',
            active: 2,
            steps: [
              { label: '11 PM', sub: 'screen off', icon: '🌙' },
              { label: 'Doze', sub: 'network cut', icon: '😴' },
              { label: 'Window', sub: 'queued work runs', icon: '🔓', tone: 'good' },
              { label: 'Deeper Doze', sub: 'windows get rarer', icon: '💤' },
              { label: '7 AM', sub: 'phone picked up', icon: '☀️' },
            ],
          },
          emphasis: ['maintenance', 'window'],
        },
        {
          say: 'And the longer it sleeps, the rarer those windows get. Apps you haven’t opened in days get squeezed even harder.',
          scene: {
            type: 'timeline',
            title: 'One night on the nightstand',
            active: 3,
            steps: [
              { label: '11 PM', sub: 'screen off', icon: '🌙' },
              { label: 'Doze', sub: 'network cut', icon: '😴' },
              { label: 'Window', sub: 'queued work runs', icon: '🔓' },
              { label: 'Deeper Doze', sub: 'windows get rarer', icon: '💤', tone: 'warn' },
              { label: '7 AM', sub: 'phone picked up', icon: '☀️' },
            ],
          },
          emphasis: ['rarer', 'squeezed'],
        },
        {
          say: 'So what gets through? High priority push, alarms allowed while idle, at most one every nine minutes, and real alarm clocks.',
          scene: {
            type: 'diagram',
            title: 'What gets through Doze',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'push', label: 'Push', sub: 'high priority', icon: '⚡', x: 0, y: 0, tone: 'good' },
              { id: 'idle', label: 'Idle alarm', sub: '1 per 9 min', icon: '⏰', x: 1, y: 0, tone: 'good' },
              { id: 'clock', label: 'Alarm clock', icon: '🔔', x: 2, y: 0, tone: 'good' },
              { id: 'doze', label: 'Doze', icon: '😴', x: 1, y: 1.6, shape: 'pill', tone: 'info' },
              { id: 'timer', label: 'setInterval', sub: 'blocked', icon: '⏲️', x: 0, y: 3.2, dim: true, tone: 'bad' },
              { id: 'app', label: 'Your app', icon: '📱', x: 2, y: 3.2, active: true },
            ],
            edges: [
              { from: 'push', to: 'app', active: true },
              { from: 'idle', to: 'app', active: true },
              { from: 'clock', to: 'app', active: true },
              { from: 'timer', to: 'doze', dashed: true, tone: 'bad' },
            ],
            packets: [{ from: 'push', to: 'app', label: '⚡', tone: 'good' }],
          },
          sfx: 'pop',
          emphasis: ['push', 'nine'],
        },
        {
          say: 'Reproduce it in seconds with adb. No overnight wait needed.',
          speak: 'Reproduce it in seconds with A D B. No overnight wait needed.',
          scene: {
            type: 'terminal',
            title: 'Force Doze now',
            lines: [
              { cmd: 'adb shell dumpsys deviceidle force-idle' },
              { out: '😴 phone is dozing', tone: 'info' },
              { cmd: 'adb shell am set-inactive com.chat true' },
              { out: '💤 app standby on', tone: 'info' },
              { cmd: 'adb shell dumpsys deviceidle unforce' },
            ],
          },
          sfx: 'type',
          emphasis: ['seconds', 'overnight'],
        },
        {
          say: 'Quick check. A chat message must show up at three AM while the phone dozes. What works?',
          speak: 'Quick check. A chat message must show up at three A M while the phone dozes. What works?',
          scene: {
            type: 'quiz',
            question: 'New chat message at 3 AM, phone in Doze. What delivers it?',
            options: ['setInterval polling', 'High-priority push', 'Holding a wake lock'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['three', 'works'],
        },
        {
          say: 'High priority push punches through. Polling is frozen, and Doze ignores wake locks anyway.',
          scene: {
            type: 'quiz',
            question: 'New chat message at 3 AM, phone in Doze. What delivers it?',
            options: ['setInterval polling', 'High-priority push', 'Holding a wake lock'],
            answer: 1,
            reveal: true,
            explain: 'Push to wake, WorkManager to catch up.',
          },
          sfx: 'ding',
          emphasis: ['push', 'ignores'],
        },
        {
          say: 'Remember this. Background timers are a lie. Push wakes you up, and WorkManager catches you up.',
          speak: 'Remember this. Background timers are a lie. Push wakes you up, and work manager catches you up.',
          scene: {
            type: 'outro',
            points: ['Idle phone = *Doze*. Timers stop.', 'Push wakes, *WorkManager* catches up', 'Test with deviceidle force-idle'],
            tagline: 'Design for sleep.',
          },
          sfx: 'success',
          emphasis: ['lie', 'wakes'],
        },
      ],
    },

    // 7 ─────────────────────────────────────────────────────────────
    {
      id: 'android-broadcast-receivers-boot-connectivity',
      title: 'Wake up on boot',
      beats: [
        {
          say: 'Android will wake your app when the phone reboots. If you ask.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Wake up on *reboot*',
            emoji: '🔁',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['wake', 'reboots'],
        },
        {
          say: 'Your reminder app schedules a pill alarm for eight PM. Then the phone restarts at lunch.',
          speak: 'Your reminder app schedules a pill alarm for eight P M. Then the phone restarts at lunch.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Remindly',
              icon: '💊',
              items: [
                { id: 'pill', label: 'Take your pill', icon: '💊', sub: 'today · 8:00 PM', checked: false },
                { id: 'walk', label: 'Evening walk', icon: '🚶', sub: 'today · 7:00 PM', checked: false },
              ],
              toast: 'Restarting…',
            },
            caption: 'alarms scheduled ✓',
          },
          sfx: 'pop',
          emphasis: ['pill', 'restarts'],
        },
        {
          say: 'Eight PM comes and goes. Nothing. A reboot wipes every alarm, and your app isn’t running to fix it.',
          speak: 'Eight P M comes and goes. Nothing. A reboot wipes every alarm, and your app isn’t running to fix it.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'lock', time: '8:00' },
            caption: 'no reminder 😬',
          },
          sfx: 'error',
          emphasis: ['wipes', 'every'],
        },
        {
          say: 'The fix is a broadcast receiver: a tiny class Android calls when something happens, like boot completed.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: bootManifest,
            highlight: [[4, 9]],
            note: { line: 9, text: 'call me after boot', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['receiver', 'boot'],
        },
        {
          say: 'Add its permission, and once the user has opened your app at least once, Android starts you after boot.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: bootManifest,
            highlight: [[1, 2]],
            note: { line: 2, text: 'needed for boot events', tone: 'warn' },
          },
          emphasis: ['permission', 'once'],
        },
        {
          say: 'Catch: on receive runs on the main thread with seconds to live. So don’t work there. Hand off and return.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'BootReceiver.kt',
            code: bootReceiver,
            highlight: [[10, 11]],
            note: { line: 11, text: 'WorkManager does the real work', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['seconds', 'hand'],
        },
        {
          say: 'So the receiver just wakes up, drops a job into WorkManager, and the reminders get re armed.',
          speak: 'So the receiver just wakes up, drops a job into work manager, and the reminders get re armed.',
          scene: {
            type: 'diagram',
            title: 'After a reboot',
            cols: 1,
            rows: 4,
            nodes: [
              { id: 'boot', label: 'Boot done', icon: '🔌', x: 0, y: 0, shape: 'pill' },
              { id: 'rcv', label: 'BootReceiver', sub: 'seconds to live', icon: '📡', x: 0, y: 1.1, active: true },
              { id: 'wm', label: 'WorkManager', sub: 'does the work', icon: '🗓️', x: 0, y: 2.2 },
              { id: 'alarm', label: 'Reminders', sub: 're-armed ✓', icon: '⏰', x: 0, y: 3.3, tone: 'good' },
            ],
            edges: [
              { from: 'boot', to: 'rcv', active: true },
              { from: 'rcv', to: 'wm', label: 'enqueue', active: true },
              { from: 'wm', to: 'alarm', active: true },
            ],
            packets: [{ from: 'rcv', to: 'wm', label: 'job' }],
          },
          sfx: 'pop',
          emphasis: ['WorkManager', 're'],
        },
        {
          say: 'Heads up: since Android eight, most system broadcasts can’t live in the manifest. Network changes only reach you while you’re running.',
          scene: {
            type: 'compare',
            title: 'Where can it live?',
            left: { title: 'In the manifest', verdict: 'neutral', icon: '📜', items: ['Boot completed ✓', 'Most others ✕', 'Wakes a dead app'] },
            right: { title: 'Registered in code', verdict: 'neutral', icon: '🧩', items: ['Network changes', 'Only while running'] },
          },
          sfx: 'swipe',
          emphasis: ['eight', 'running'],
        },
        {
          say: 'From React Native: NetInfo for network, Headless JS for boot, and expo-background-task jobs survive reboots on their own.',
          speak: 'From React Native: net info for network, headless J S for boot, and expo background task jobs survive reboots on their own.',
          scene: {
            type: 'list',
            title: 'From React Native',
            items: [
              { text: '*NetInfo*', sub: 'network changes', icon: '📶' },
              { text: '*Headless JS*', sub: 'run JS after boot', icon: '👻' },
              { text: '*Background tasks*', sub: 'expo-background-task re-registers', icon: '🔁' },
            ],
          },
          sfx: 'pop',
          emphasis: ['boot', 'survive'],
        },
        {
          say: 'Remember this. Receivers wake you up. WorkManager does the work.',
          speak: 'Remember this. Receivers wake you up. Work manager does the work.',
          scene: {
            type: 'outro',
            points: ['A reboot *wipes* your alarms', 'Boot receiver: seconds, then hand off', 'Most broadcasts: register in *code*'],
            tagline: 'Wake up, hand off.',
          },
          sfx: 'success',
          emphasis: ['wake', 'work'],
        },
      ],
    },

    // 8 ─────────────────────────────────────────────────────────────
    {
      id: 'android-notification-channels-permission',
      title: 'Channels: the user’s mute switch',
      beats: [
        {
          say: 'Android users can mute one kind of your notifications. Not all.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Mute *promos*, keep orders',
            emoji: '🔕',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['one', 'kind'],
        },
        {
          say: 'A food delivery app sends driver updates, chat messages, and the occasional half price pizza promo.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'lock',
              time: '9:41',
              notices: [
                { app: 'Foodie', title: 'Driver is 2 min away', body: 'Order #4821', icon: '🛵' },
                { app: 'Foodie', title: 'Maya: on my way!', body: 'Chat', icon: '💬' },
                { app: 'Foodie', title: 'Half-price pizza tonight', body: 'Promo', icon: '🍕' },
              ],
            },
            caption: 'orders · chat · promos',
          },
          sfx: 'pop',
          emphasis: ['driver', 'promo'],
        },
        {
          say: 'Since Android eight, each kind gets its own channel, and users see every channel in Settings.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Foodie notifications',
              icon: '🔔',
              items: [
                { id: 'orders', label: 'Order updates', icon: '🛵', sub: 'Urgent', checked: true },
                { id: 'chat', label: 'Chat', icon: '💬', sub: 'Urgent', checked: true },
                { id: 'promos', label: 'Promos', icon: '🍕', sub: 'Low', checked: true },
              ],
            },
            caption: 'Settings → Apps → Foodie',
          },
          emphasis: ['channel', 'settings'],
        },
        {
          say: 'So a user can mute promos and still get the driver alert, instead of muting your whole app.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Foodie notifications',
              icon: '🔔',
              items: [
                { id: 'orders', label: 'Order updates', icon: '🛵', sub: 'Urgent', checked: true, tone: 'good' },
                { id: 'chat', label: 'Chat', icon: '💬', sub: 'Urgent', checked: true, tone: 'good' },
                { id: 'promos', label: 'Promos', icon: '🍕', sub: 'Off', checked: false, tone: 'muted' },
              ],
            },
            tap: { x: 0.85, y: 0.42 },
            caption: 'muted one, kept two',
          },
          sfx: 'click',
          emphasis: ['mute', 'still'],
        },
        {
          say: 'In code, each channel gets an ID, a human name, and an importance. Then every notification names its channel.',
          speak: 'In code, each channel gets an I D, a human name, and an importance. Then every notification names its channel.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'notifications.ts',
            code: channels,
            highlight: [[1, 7], 11],
          },
          sfx: 'type',
          emphasis: ['name', 'importance'],
        },
        {
          say: 'Careful: once a channel exists, your code can’t raise its importance. You’d need a brand new channel ID.',
          speak: 'Careful: once a channel exists, your code can’t raise its importance. You’d need a brand new channel I D.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'notifications.ts',
            code: channels,
            highlight: [[5, 6]],
            note: { line: 6, text: 'locked once created 🔒', tone: 'warn' },
          },
          emphasis: ['can’t', 'new'],
        },
        {
          say: 'And since Android thirteen, new installs start with notifications off until the user taps allow.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'permission',
              app: 'Allow Foodie',
              icon: '🔔',
              text: 'to send you notifications?',
              allow: 'Allow',
              deny: 'Don’t allow',
            },
            caption: 'POST_NOTIFICATIONS',
          },
          sfx: 'riser',
          emphasis: ['thirteen', 'off'],
        },
        {
          say: 'Target Android thirteen or newer and you pick the moment, like right after an order. Not a cold prompt on launch.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'permission',
              app: 'Allow Foodie',
              icon: '🔔',
              text: 'to send you notifications?',
              allow: 'Allow',
              deny: 'Don’t allow',
              choice: 'allow',
            },
            caption: 'asked right after “Order placed!”',
          },
          sfx: 'ding',
          emphasis: ['moment', 'order'],
        },
        {
          say: 'Sending push from your server? Put the channel ID in the FCM payload too, or it lands in a default bucket.',
          speak: 'Sending push from your server? Put the channel I D in the F C M payload too, or it lands in a default bucket.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'fcm-message.json',
            code: fcmPayload,
            highlight: [5],
            note: { line: 5, text: 'name the channel', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['channel', 'default'],
        },
        {
          say: 'Remember this. Channels are the user’s mute switch. One per kind of alert.',
          scene: {
            type: 'outro',
            points: ['One *channel* per kind of alert', 'Importance is locked once created', 'Android 13+: ask at a *good moment*'],
            tagline: 'Let them mute promos.',
          },
          sfx: 'success',
          emphasis: ['mute', 'kind'],
        },
      ],
    },

    // 9 ─────────────────────────────────────────────────────────────
    {
      id: 'android-app-links-vs-deep-links',
      title: 'Links that skip the browser',
      beats: [
        {
          say: 'Your web link opens Chrome, not your app. One file fixes it.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Links that *skip* the browser',
            emoji: '🔗',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['Chrome', 'one'],
        },
        {
          say: 'Marketing emails a link to your sneaker drop. Users tap it, and it opens Chrome. Classic.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Chrome',
              icon: '🌐',
              body: 'shop.example.com/p/42',
              items: [
                { id: 'banner', label: 'Get the app for a better experience', icon: '📲', tone: 'bad' },
                { id: 'page', label: 'Sneaker X', icon: '👟', sub: 'loading the web page…', tone: 'muted' },
              ],
              loading: true,
            },
            tap: { x: 0.5, y: 0.3 },
            caption: 'not your app 😩',
          },
          sfx: 'error',
          emphasis: ['Chrome', 'classic'],
        },
        {
          say: 'Custom schemes like my app colon slash slash are weak. Any app can claim them.',
          scene: {
            type: 'compare',
            title: 'Two kinds of link',
            left: { title: 'myapp://', verdict: 'bad', icon: '🔓', items: ['Anyone can claim it', 'Web links skip it'] },
            right: { title: 'https:// App Link', verdict: 'ok', icon: '🔐', items: ['Verified as yours', 'Opens with no chooser'] },
          },
          sfx: 'swipe',
          emphasis: ['weak', 'claim'],
        },
        {
          say: 'An App Link is an https intent filter with auto verify switched on.',
          speak: 'An App Link is an H T T P S intent filter with auto verify switched on.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: appLinkFilter,
            highlight: [[1, 2], [9, 12]],
            note: { line: 2, text: 'Android, please check me', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['verify'],
        },
        {
          say: 'Then host assetlinks dot json on your domain, with your package name and your signing certificate fingerprint.',
          speak: 'Then host asset links dot jason on your domain, with your package name and your signing certificate fingerprint.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'assetlinks.json',
            code: assetLinks,
            highlight: [[5, 9]],
          },
          sfx: 'type',
          emphasis: ['package', 'fingerprint'],
        },
        {
          say: 'Pro tip: use the fingerprint from Play App Signing, not your local upload key. That’s the classic works in debug bug.',
          scene: {
            type: 'code',
            lang: 'json',
            file: 'assetlinks.json',
            code: assetLinks,
            errors: [8],
            note: { line: 8, text: 'Play Console → App signing', tone: 'warn' },
          },
          sfx: 'error',
          emphasis: ['Play', 'upload'],
        },
        {
          say: 'At install, Android fetches that file and checks the fingerprint. Since Android twelve, if that fails, the link just opens the browser.',
          scene: {
            type: 'diagram',
            title: 'Verification',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'phone', label: 'Android', icon: '🤖', x: 0, y: 0.4 },
              { id: 'site', label: 'Your domain', sub: 'assetlinks\u200B.json', icon: '🌐', x: 2, y: 0.4 },
              { id: 'ok', label: 'Verified', sub: 'opens your app', icon: '✅', x: 0, y: 3, tone: 'good', active: true },
              { id: 'bad', label: 'Failed', sub: 'opens browser', icon: '🌐', x: 2, y: 3, tone: 'bad', dim: true },
            ],
            edges: [
              { from: 'phone', to: 'site', active: true, both: true },
              { from: 'phone', to: 'ok', label: 'match', active: true, tone: 'good' },
              { from: 'site', to: 'bad', label: 'mismatch', dashed: true, tone: 'bad' },
            ],
            packets: [{ from: 'phone', to: 'site', label: 'GET' }],
          },
          sfx: 'pop',
          emphasis: ['checks', 'twelve'],
        },
        {
          say: 'Debug it with adb, ask for the app links, and look for the word verified.',
          speak: 'Debug it with A D B, ask for the app links, and look for the word verified.',
          scene: {
            type: 'terminal',
            title: 'Is it verified?',
            lines: [
              { cmd: 'adb shell pm get-app-links com.shop.app' },
              { out: 'Domain verification state:', tone: 'muted' },
              { out: 'shop.example.com: verified', tone: 'good' },
            ],
          },
          sfx: 'type',
          emphasis: ['verified'],
        },
        {
          say: 'And in React Native nothing changes. React Navigation or Expo Router gets the URL and opens the product.',
          speak: 'And in React Native nothing changes. React Navigation or Expo Router gets the U R L and opens the product.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Sneaker X',
              icon: '👟',
              items: [
                { id: 'size', label: 'Size', icon: '📏', value: '42' },
                { id: 'price', label: 'Price', icon: '💸', sub: '$129' },
              ],
              button: 'Add to cart',
              toast: 'Opened from link ✅',
            },
            caption: 'no chooser, no Chrome',
          },
          sfx: 'success',
          emphasis: ['nothing', 'product'],
        },
        {
          say: 'Remember this. Custom schemes are easy. Verified https links are yours, and they open your app from anywhere.',
          speak: 'Remember this. Custom schemes are easy. Verified H T T P S links are yours, and they open your app from anywhere.',
          scene: {
            type: 'outro',
            points: ['*autoVerify* + assetlinks.json', 'Use the *Play signing* fingerprint', 'Unverified? Android 12+ opens the browser'],
            tagline: 'Verify, skip Chrome.',
          },
          sfx: 'success',
          emphasis: ['verified', 'yours'],
        },
      ],
    },

    // 10 ────────────────────────────────────────────────────────────
    {
      id: 'android-overlays-bubbles-pip',
      title: 'Floating windows, three ways',
      beats: [
        {
          say: 'Chat heads, mini players, screen filters. Three different Android APIs.',
          speak: 'Chat heads, mini players, screen filters. Three different Android A P Is.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Three ways to *float*',
            sub: 'PiP · Bubbles · Overlays',
            emoji: '🫧',
            style: 'stack',
          },
          sfx: 'whoosh',
          emphasis: ['three', 'different'],
        },
        {
          say: 'Video call app: swipe home, and the call shrinks into a corner and keeps going. That’s Picture in Picture.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'bubble', app: 'Meetly', icon: '📹', text: 'Call · 12:04', behind: 'home' },
            caption: 'Picture-in-Picture',
          },
          sfx: 'pop',
          emphasis: ['shrinks', 'picture'],
        },
        {
          say: 'One manifest flag, an aspect ratio, and on Android twelve and up, auto enter does it when they swipe home.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'MainActivity.kt',
            code: pip,
            highlight: [2, [6, 7]],
            note: { line: 7, text: 'enter on swipe home', tone: 'accent' },
          },
          sfx: 'type',
          emphasis: ['flag', 'auto'],
        },
        {
          say: 'No permission needed. But your whole React Native screen shrinks, so hide everything except the video.',
          scene: {
            type: 'code',
            lang: 'kotlin',
            file: 'MainActivity.kt',
            code: pip,
            highlight: [9],
            note: { line: 9, text: 'your whole RN root shrinks', tone: 'warn' },
          },
          emphasis: ['whole', 'hide'],
        },
        {
          say: 'Chat heads are Bubbles, Android eleven and up: a conversation notification the user chooses to pop out. No special permission.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: { kind: 'bubble', app: 'Chatter', icon: '🧑‍🎤', text: 'Maya: you up?', behind: 'app' },
            caption: 'Bubbles · conversations only',
          },
          sfx: 'pop',
          emphasis: ['bubbles', 'chooses'],
        },
        {
          say: 'Third way, the nuclear option: draw over other apps. Anything, anywhere. Users must enable it in Settings.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Display over other apps',
              icon: '⚙️',
              body: 'Allow display over other apps',
              items: [
                { id: 'twi', label: 'Twilight', icon: '🌅', checked: true, tone: 'muted' },
                { id: 'sw', label: 'ScreenTint', icon: '🪟', checked: false, tone: 'warn' },
                { id: 'maps', label: 'Maps', icon: '🗺️', checked: false, tone: 'muted' },
                { id: 'chat', label: 'Messenger', icon: '💬', checked: true, tone: 'muted' },
                { id: 'notes', label: 'Sticky notes', icon: '🗒️', checked: false, tone: 'muted' },
              ],
            },
            tap: { x: 0.85, y: 0.42 },
            caption: 'special · Play reviews it',
          },
          sfx: 'riser',
          emphasis: ['nuclear', 'settings'],
        },
        {
          say: 'From React Native, expo-video and react-native-video give you video Picture in Picture for free.',
          speak: 'From React Native, expo video and react native video give you video Picture in Picture for free.',
          scene: {
            type: 'code',
            lang: 'tsx',
            file: 'Call.tsx',
            code: `// expo-video; react-native-video too

<VideoView
  player={player}
  allowsPictureInPicture
  startsPictureInPictureAutomatically
/>`,
            added: [[5, 6]],
          },
          sfx: 'type',
          emphasis: ['free'],
        },
        {
          say: 'Quick check. A ride app wants its map floating while the user texts. Which one?',
          scene: {
            type: 'quiz',
            question: 'Keep the navigation map floating while they text?',
            options: ['Overlay window', 'Picture-in-Picture', 'Bubble'],
            answer: 1,
          },
          sfx: 'riser',
          emphasis: ['map', 'floating'],
        },
        {
          say: 'Picture in Picture. It covers video, calls and navigation, and Google says plainly: don’t fake it with an overlay.',
          scene: {
            type: 'quiz',
            question: 'Keep the navigation map floating while they text?',
            options: ['Overlay window', 'Picture-in-Picture', 'Bubble'],
            answer: 1,
            reveal: true,
            explain: 'Non-video PiP needs a tiny native module.',
          },
          sfx: 'ding',
          emphasis: ['navigation', 'fake'],
        },
        {
          say: 'Remember this. Pick the smallest hammer: picture in picture for video, bubbles for chats, overlays as a last resort.',
          scene: {
            type: 'outro',
            points: ['*PiP*: video, calls, navigation', '*Bubbles*: chat conversations', '*Overlay*: last resort, reviewed'],
            tagline: 'Smallest hammer wins.',
          },
          sfx: 'success',
          emphasis: ['smallest', 'hammer'],
        },
      ],
    },

    // 11 ────────────────────────────────────────────────────────────
    {
      id: 'android-advertising-id',
      title: 'The ID users can reset',
      beats: [
        {
          say: 'There’s a device ID your users can wipe anytime. Plan for zeros.',
          speak: 'There’s a device I D your users can wipe anytime. Plan for zeros.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Plan for *zeros*',
            sub: '00000000-0000-0000-0000-000000000000',
            emoji: '🆔',
            style: 'glitch',
          },
          sfx: 'whoosh',
          emphasis: ['wipe', 'zeros'],
        },
        {
          say: 'You run an ad campaign. Someone taps the ad, installs, and opens your app. Which campaign gets the credit?',
          scene: {
            type: 'diagram',
            title: 'Install attribution',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'ad', label: 'Ad tap', icon: '📣', x: 0, y: 0 },
              { id: 'play', label: 'Play Store', icon: '▶️', x: 2, y: 0 },
              { id: 'open', label: 'First open', icon: '📱', x: 2, y: 2 },
              { id: 'sdk', label: 'Attribution SDK', sub: 'ad ID + referrer', icon: '🔍', x: 0, y: 2, active: true },
              { id: 'win', label: 'Campaign B', sub: '+1 install', icon: '🏆', x: 1, y: 3.4, tone: 'good' },
            ],
            edges: [
              { from: 'ad', to: 'play', active: true },
              { from: 'play', to: 'open', active: true },
              { from: 'open', to: 'sdk', active: true },
              { from: 'sdk', to: 'win', active: true },
            ],
            packets: [{ from: 'open', to: 'sdk', label: 'ID' }],
          },
          sfx: 'pop',
          emphasis: ['campaign', 'credit'],
        },
        {
          say: 'That match uses the advertising ID: a random ID from Play services, made for ads, owned by the user.',
          speak: 'That match uses the advertising I D: a random I D from Play services, made for ads, owned by the user.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Ads',
              icon: '⚙️',
              items: [
                { id: 'id', label: 'Your advertising ID', icon: '🆔', sub: '38400000-8cf0-11bd-b23e…' },
                { id: 'reset', label: 'Reset advertising ID', icon: '🔄' },
                { id: 'del', label: 'Delete advertising ID', icon: '🗑️' },
              ],
            },
            caption: 'Settings → Privacy → Ads',
          },
          sfx: 'swipe',
          emphasis: ['advertising', 'user'],
        },
        {
          say: 'Users can reset it or delete it in Settings. After a delete, you read all zeros.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Ads',
              icon: '⚙️',
              items: [
                { id: 'id', label: 'Your advertising ID', icon: '🆔', sub: '00000000-0000-0000-0000…', tone: 'bad' },
                { id: 'reset', label: 'Reset advertising ID', icon: '🔄', tone: 'muted' },
                { id: 'del', label: 'Delete advertising ID', icon: '🗑️', tone: 'bad' },
              ],
              toast: 'Advertising ID deleted',
            },
            tap: { x: 0.5, y: 0.42 },
            caption: 'gone, by the user’s choice',
          },
          sfx: 'error',
          emphasis: ['delete', 'zeros'],
        },
        {
          say: 'Targeting Android thirteen plus without the ad ID permission? Zeros again. Ads SDKs usually add it.',
          speak: 'Targeting Android thirteen plus without the ad I D permission? Zeros again. Ads S D Ks usually add it.',
          scene: {
            type: 'code',
            lang: 'xml',
            file: 'AndroidManifest.xml',
            code: adIdManifest,
            highlight: [[3, 4]],
            note: { line: 4, text: 'missing? you read zeros', tone: 'warn' },
          },
          sfx: 'type',
          emphasis: ['thirteen', 'permission'],
        },
        {
          say: 'From React Native, expo tracking transparency reads it, and attribution SDKs read it on their own.',
          speak: 'From React Native, expo tracking transparency reads it, and attribution S D Ks read it on their own.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'ads.ts',
            code: adIdJs,
            highlight: [4],
          },
          sfx: 'type',
          emphasis: ['reads'],
        },
        {
          say: 'And build for the zero case on day one. No ID is a normal state, not an error.',
          speak: 'And build for the zero case on day one. No I D is a normal state, not an error.',
          scene: {
            type: 'code',
            lang: 'ts',
            file: 'ads.ts',
            code: adIdJs,
            added: [[6, 8]],
            note: { line: 8, text: 'normal, not an error', tone: 'good' },
          },
          sfx: 'ding',
          emphasis: ['zero', 'normal'],
        },
        {
          say: 'Never use it as a user ID. Play policy forbids that, and for analytics Google points you to App Set ID.',
          speak: 'Never use it as a user I D. Play policy forbids that, and for analytics Google points you to App Set I D.',
          scene: {
            type: 'compare',
            title: 'Which ID?',
            left: { title: 'Ad ID', verdict: 'neutral', icon: '📣', items: ['Ads + attribution', 'User can delete it', 'Never a user ID'] },
            right: { title: 'App Set ID', verdict: 'ok', icon: '📊', items: ['Analytics', 'Fraud checks', 'Non-ad uses'] },
          },
          sfx: 'swipe',
          emphasis: ['never', 'analytics'],
        },
        {
          say: 'Last step: declare it in Play Console under App content, or your release gets flagged.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'App content',
              icon: '▶️',
              items: [
                { id: 'safety', label: 'Data safety', icon: '🛡️', sub: 'Completed', checked: true, tone: 'muted' },
                { id: 'ads', label: 'Ads', icon: '📣', sub: 'Contains ads: yes', checked: true, tone: 'muted' },
                { id: 'adid', label: 'Advertising ID', icon: '🆔', sub: 'Does your app use one? Yes', checked: true, tone: 'good' },
              ],
              button: 'Save',
            },
            tap: { x: 0.5, y: 0.86 },
            caption: 'Play Console',
          },
          sfx: 'pop',
          emphasis: ['declare', 'flagged'],
        },
        {
          say: 'Remember this. The ad ID belongs to the user. Use it only for ads, and expect zeros.',
          speak: 'Remember this. The ad I D belongs to the user. Use it only for ads, and expect zeros.',
          scene: {
            type: 'outro',
            points: ['Ad ID = ads and *attribution* only', 'Deleted or undeclared? *Zeros*', 'Analytics? Use App Set ID'],
            tagline: 'Expect zeros.',
          },
          sfx: 'success',
          emphasis: ['user', 'zeros'],
        },
      ],
    },

    // 12 ────────────────────────────────────────────────────────────
    {
      id: 'android-release-signing-r8',
      title: 'Keys and shrinking, demystified',
      beats: [
        {
          say: 'Lose this one file and you can never update your app.',
          scene: {
            type: 'title',
            kicker: 'Android must-knows',
            title: 'Lose this file, lose your *app*',
            emoji: '🔑',
            style: 'slam',
          },
          sfx: 'whoosh',
          emphasis: ['lose', 'never'],
        },
        {
          say: 'This command makes your signing key. Every update must be signed with that exact same key.',
          scene: {
            type: 'terminal',
            title: 'Your first release',
            lines: [
              { cmd: 'keytool -genkeypair -v …' },
              { out: '🔑 release.keystore created', tone: 'good' },
              { out: '# every update must match this key', tone: 'warn' },
            ],
          },
          sfx: 'type',
          emphasis: ['same', 'key'],
        },
        {
          say: 'Lose it, and you ship a brand new app and beg everyone to reinstall.',
          scene: {
            type: 'phone',
            os: 'android',
            screen: {
              kind: 'app',
              title: 'Play Store',
              icon: '▶️',
              items: [
                { id: 'v1', label: 'MyApp', icon: '📱', sub: 'v1.0 · stuck forever', tone: 'bad' },
                { id: 'v2', label: 'MyApp (new!)', icon: '🙏', sub: 'please reinstall · 0 users', tone: 'warn' },
              ],
            },
            caption: 'no key, no updates',
          },
          sfx: 'error',
          emphasis: ['brand', 'beg'],
        },
        {
          say: 'Play App Signing fixes it. Google vaults the real key, and you hold an upload key.',
          scene: {
            type: 'diagram',
            title: 'Play App Signing',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'you', label: 'Upload key', sub: 'on your machine', icon: '🔑', x: 0, y: 0.3 },
              { id: 'play', label: 'Google Play', sub: 'app signing key', icon: '🏦', x: 2, y: 1.6, active: true },
              { id: 'users', label: 'Users', sub: 'get updates', icon: '📱', x: 1, y: 3.3 },
            ],
            edges: [
              { from: 'you', to: 'play', label: 'upload', active: true },
              { from: 'play', to: 'users', label: 're-signed', active: true },
            ],
            packets: [{ from: 'you', to: 'play', label: '.aab' }],
          },
          sfx: 'pop',
          emphasis: ['vaults', 'upload'],
        },
        {
          say: 'Lose the upload key? Reset it in Play Console and keep shipping. On Expo, EAS manages the keystore for you.',
          speak: 'Lose the upload key? Reset it in Play Console and keep shipping. On Expo, E A S manages the key store for you.',
          scene: {
            type: 'diagram',
            title: 'Play App Signing',
            cols: 3,
            rows: 4,
            nodes: [
              { id: 'you', label: 'Upload key', sub: 'lost ✕', icon: '🔑', x: 0, y: 0.3, dim: true, tone: 'bad' },
              { id: 'new', label: 'New key', sub: 'upload key, reset', icon: '🗝️', x: 0, y: 1.9, tone: 'good', active: true },
              { id: 'play', label: 'Google Play', sub: 'app signing key', icon: '🏦', x: 2, y: 1.6, active: true },
              { id: 'users', label: 'Users', sub: 'still get updates', icon: '📱', x: 1, y: 3.3, tone: 'good' },
            ],
            edges: [
              { from: 'new', to: 'play', label: 'upload', active: true },
              { from: 'play', to: 'users', label: 're-signed', active: true },
            ],
            packets: [{ from: 'new', to: 'play', label: '.aab' }],
          },
          sfx: 'ding',
          emphasis: ['reset', 'shipping'],
        },
        {
          say: 'Next up: R8. Turn on minify, and it deletes unused code and renames classes.',
          speak: 'Next up: R eight. Turn on minify, and it deletes unused code and renames classes.',
          scene: {
            type: 'code',
            lang: 'gradle',
            file: 'app/build.gradle',
            code: gradle,
            added: [[6, 7]],
            note: { line: 7, text: 'R8 strips and renames', tone: 'good' },
          },
          sfx: 'type',
          emphasis: ['minify', 'unused'],
        },
        {
          say: 'The catch: crash reports turn into a dot b dot c, and some libraries need keep rules.',
          scene: {
            type: 'terminal',
            title: 'Production crash',
            lines: [
              { out: 'FATAL EXCEPTION: main', tone: 'bad' },
              { out: '  at a.b.c(SourceFile:12)', tone: 'bad' },
              { out: '  at a.b.d(SourceFile:4)', tone: 'bad' },
              { out: '# …which class was that? 🤷', tone: 'muted' },
            ],
          },
          sfx: 'error',
          emphasis: ['crash', 'keep'],
        },
        {
          say: 'Upload the mapping file and they’re readable again. Sentry and Crashlytics plugins automate it.',
          scene: {
            type: 'terminal',
            title: 'Production crash',
            lines: [
              { out: 'FATAL EXCEPTION: main', tone: 'bad' },
              { out: '  at Cart.save(Cart.kt:12)', tone: 'good' },
              { out: '  at Checkout.pay(Pay.kt:4)', tone: 'good' },
              { out: '✓ mapping.txt uploaded', tone: 'good' },
            ],
          },
          sfx: 'success',
          emphasis: ['mapping', 'readable'],
        },
        {
          say: 'Quick check. Google sign in works locally, but fails from the Play Store. Why?',
          scene: {
            type: 'quiz',
            question: 'Google Sign-In fails only on Play Store installs. Why?',
            options: ['Wrong SHA-256 registered', 'Play blocks Google login', 'The upload key expired'],
            answer: 0,
          },
          sfx: 'riser',
          emphasis: ['fails', 'why'],
        },
        {
          say: 'Google sign in, Firebase and app links want the Play signing key’s fingerprint, not your upload key’s.',
          scene: {
            type: 'quiz',
            question: 'Google Sign-In fails only on Play Store installs. Why?',
            options: ['Wrong SHA-256 registered', 'Play blocks Google login', 'The upload key expired'],
            answer: 0,
            reveal: true,
            explain: 'Copy it from Play Console → App signing.',
          },
          sfx: 'ding',
          emphasis: ['fingerprint', 'signing'],
        },
        {
          say: 'Remember this. Google guards the signing key, you guard the upload key, and always upload the mapping.',
          scene: {
            type: 'outro',
            points: ['Same key or *no updates*', 'Play App Signing holds the real key', 'R8 on? Upload *mapping.txt*'],
            tagline: 'Guard keys, ship maps.',
          },
          sfx: 'success',
          emphasis: ['guards', 'mapping'],
        },
      ],
    },
  ],
};
