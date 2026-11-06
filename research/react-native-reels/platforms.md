# Platform Must-Knows for React Native devs — reel research

Format: Instagram-style reels, 40–75 s each. Goal of every reel: "I didn't know I could do that" + when to reach for it + how to touch it from React Native.
Facts checked 2026-11-05 against developer.android.com, developer.apple.com, reactnative.dev, docs.expo.dev and library docs. Android 16 (API 36) / targetSdk 35–36, iOS 26.

Series: **Android Must-Knows** (12) · **iOS Must-Knows** (9) · **Ship It** (3)

---

## Series 1 — Android Must-Knows

### 1. android-manifest-what-it-declares
- **series:** Android Must-Knows
- **title:** The file Android reads first
- **hook:** "Android never runs your JS. It reads this XML first."
- **core idea:** `AndroidManifest.xml` is the contract between your app and the OS: every Activity, Service, BroadcastReceiver and ContentProvider, every permission, every hardware feature, and every link your app can open is declared here. If it's not in the manifest, Android can't start it — and Play Store uses it to decide which phones can even install you.
- **example (what RN's template already puts there):**
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  <application android:name=".MainApplication" android:allowBackup="false" ...>
    <activity android:name=".MainActivity"
      android:launchMode="singleTask"
      android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
      android:exported="true">
      <intent-filter> <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" /> </intent-filter>
    </activity>
  </application>
  ```
  `configChanges` is why rotating the phone doesn't recreate your whole RN app. `singleTask` is why tapping a deep link reuses the running app instead of stacking a second copy.
- **RN access:** Bare: edit `android/app/src/main/AndroidManifest.xml`. Expo: never touch it by hand — `app.json` → `android.permissions`, `android.intentFilters`, and config plugins (`expo-build-properties`, library plugins) generate it at prebuild. `npx expo prebuild` shows the result; `npx expo config --type introspect` shows what plugins will write.
- **visual idea:** The XML file on screen; each block lights up and a label flies to the phone mockup: "Activity → the screen", "uses-permission → the install sheet", "intent-filter → the link that opens you", "uses-feature → which phones see you on Play".
- **narration beats:**
  1. Every Android app ships a file called AndroidManifest.xml, and the OS reads it before a single line of your JavaScript runs.
  2. Think of it as a menu card: here's my screen, here's my background service, here's what I'm allowed to touch.
  3. Your RN app has exactly one Activity — MainActivity — and the whole React tree lives inside it.
  4. See configChanges? That's the line that stops Android from destroying your Activity on every rotation.
  5. See singleTask? That's why a deep link reuses your running app instead of opening a second copy.
  6. Permissions go here too, and dangerous ones still need a runtime prompt later.
  7. Add uses-feature android.hardware.camera required=true and phones without a camera won't even see your app on Play.
  8. Expo users: you don't edit this file, your app.json and config plugins generate it on prebuild.
  9. Rule of thumb: if a library README says "add this to your manifest", it's talking to this file.
- **you'll use this when…** a library says "add to manifest", a deep link won't open, or Play says "your app isn't compatible with this device".
- **gotcha:** Libraries' manifests are *merged* into yours at build time, so a dependency can silently add permissions (e.g. `AD_ID`) you never declared. Inspect the merged manifest in `android/app/build/intermediates/merged_manifests/` before shipping.
- **sources:** https://developer.android.com/guide/topics/manifest/manifest-intro · https://docs.expo.dev/config-plugins/introduction/

### 2. android-permissions-three-kinds
- **series:** Android Must-Knows
- **title:** Three kinds of permission
- **hook:** "Android has three permission types. Most RN devs only know one."
- **core idea:** Install-time ("normal") permissions are granted silently when the app installs. Runtime ("dangerous") permissions need a system dialog (camera, location, contacts, POST_NOTIFICATIONS). Special permissions (draw over apps, exact alarms, all-files access, ignore battery optimization) have no dialog at all — you must deep-link the user to a Settings toggle and check again when they come back.
- **example (special permission flow, Kotlin):**
  ```kotlin
  if (!Settings.canDrawOverlays(ctx)) {
    startActivity(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
      Uri.parse("package:${ctx.packageName}")))
  }
  // exact alarms: alarmManager.canScheduleExactAlarms()
  //   -> Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM
  ```
  App scenario: a call-recorder or "screen filter" app needs an overlay; an alarm-clock app needs exact alarms; everything else should use inexact alarms / WorkManager.
- **RN access:** Runtime: `react-native-permissions` (`request(PERMISSIONS.ANDROID.CAMERA)` → `RESULTS.GRANTED | DENIED | BLOCKED`; on Android only `request` can return `BLOCKED`, `check` never does) or core `PermissionsAndroid.request(..., rationale)` which returns `NEVER_ASK_AGAIN` after a second deny. Special: react-native-permissions covers exact alarms only — `canScheduleExactAlarms()` + `openSettings('alarms')`; overlay / all-files need a 10-line native module (above). Declare in `app.json` → `android.permissions` (Expo) or the manifest.
- **visual idea:** Three doors on a phone: door 1 opens itself at install; door 2 shows the classic Allow/Deny dialog; door 3 pushes the user out to a Settings screen with a toggle, then back.
- **narration beats:**
  1. Android permissions come in three flavors, and the flavor decides how you ask.
  2. Normal ones like INTERNET: declare them in the manifest and you get them at install, no dialog.
  3. Dangerous ones like camera, location, contacts, notifications: a system dialog at runtime, and you ask as late as possible, right when the user taps the feature.
  4. Deny twice and Android stops showing the dialog — react-native-permissions calls that BLOCKED, PermissionsAndroid calls it NEVER_ASK_AGAIN.
  5. Then there's the third kind: special permissions. Draw over other apps. Exact alarms. All files access. Ignore battery optimizations.
  6. These have no dialog. You open a Settings page with an intent, the user flips a switch, and you re-check when they come back.
  7. And since Android 14, exact alarms are denied by default on fresh installs, so a reminder app has to send users to that switch.
  8. Play reviews special permissions too: all-files access is only for file managers and backup apps.
  9. So before you add a permission, ask: which door is this?
- **you'll use this when…** a feature "silently doesn't work" on a user's phone and no dialog ever showed up.
- **gotcha:** Exact alarms: `SCHEDULE_EXACT_ALARM` is user-revocable and not pre-granted for apps targeting 33+; `USE_EXACT_ALARM` is auto-granted but Play restricts it to alarm/calendar-type apps. Most "remind me later" features should use inexact alarms or WorkManager instead.
- **sources:** https://developer.android.com/guide/topics/permissions/overview · https://developer.android.com/develop/background-work/services/alarms/schedule · https://developer.android.com/training/permissions/requesting-special · https://reactnative.dev/docs/permissionsandroid · https://github.com/zoontek/react-native-permissions

### 3. android-activity-killed-rn-state
- **series:** Android Must-Knows
- **title:** Why your state vanished
- **hook:** "User came back and your app restarted. Nobody crashed. Here's why."
- **core idea:** An Activity goes Created → Started → Resumed → Paused → Stopped → Destroyed. Once it's Stopped (user switched apps), Android may kill your whole process to free RAM; when the user returns, it creates a *new* Activity — but your JS runtime, Redux store, in-memory caches and navigation state are gone. Android remembers only what was saved as "instance state", which RN does not do for you.
- **example (real scenario):** Checkout form, user hops to the bank app for an OTP, comes back 90 s later on a 4 GB phone → app cold-starts on the home screen, cart empty. Simulate it:
  ```bash
  adb shell am kill com.yourapp      # kills only when backgrounded
  # or: Developer options → "Don't keep activities"
  ```
- **RN access:** `AppState` tells you background/foreground, but *not* process death. Persist what matters: React Navigation `onStateChange` + storage + `initialState` (their State persistence guide), TanStack Query persister, MMKV/AsyncStorage for form drafts. Expo Router restores the stack from the URL automatically for linked routes.
- **visual idea:** Timeline of lifecycle states; at "Stopped" a memory bar fills up and the process box gets an X; user taps icon → fresh empty app vs. the same app with restored form (after fix).
- **narration beats:**
  1. Your Android app lives inside one Activity, and that Activity has a life.
  2. Created, started, resumed — that's you on screen. Pause, stop — that's the user switching to WhatsApp.
  3. Here's the part nobody tells RN devs: once you're stopped, Android can kill your entire process to free memory. No crash, no error, no log.
  4. When the user comes back, Android politely creates a new Activity. Your JS engine starts from zero.
  5. Redux store? Gone. The form they half-filled? Gone. Navigation stack? Back to Home.
  6. AppState won't warn you, it only sees background and foreground.
  7. Test it: background the app and run adb shell am kill your.package, or flip on "Don't keep activities" in developer options.
  8. Fix it by saving what matters: React Navigation's state persistence pattern, a query cache persister, and drafts in MMKV.
  9. Design for it on day one and the OTP round-trip stops losing carts.
- **you'll use this when…** users report "the app restarted" after switching apps, especially on low-RAM phones.
- **gotcha:** Rotation also destroys and recreates the Activity unless `configChanges` covers it — RN's template does, so removing that line to "fix" an orientation bug will reload your whole app on every rotate.
- **sources:** https://developer.android.com/guide/components/activities/activity-lifecycle · https://reactnavigation.org/docs/state-persistence · https://reactnative.dev/docs/appstate

### 4. android-workmanager-periodic-jobs
- **series:** Android Must-Knows
- **title:** Cron jobs your app survives
- **hook:** "Android can run your code every hour, even after the app's killed."
- **core idea:** WorkManager is Android's built-in scheduler for work that must happen even if the app is closed or the phone reboots: one-time or periodic (minimum 15 min, with a "flex" window), with constraints like "only on Wi-Fi" or "only while charging", automatic retry with backoff, and a SQLite-backed queue that persists across reboots. It's the right home for "flush the analytics outbox", "sync pending edits", "refresh content overnight".
- **example (Kotlin — flush an outbox every hour, only online):**
  ```kotlin
  val req = PeriodicWorkRequestBuilder<FlushOutboxWorker>(1, TimeUnit.HOURS, 15, TimeUnit.MINUTES)
    .setConstraints(Constraints.Builder()
      .setRequiredNetworkType(NetworkType.CONNECTED)
      .setRequiresBatteryNotLow(true).build())
    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
    .build()
  WorkManager.getInstance(ctx).enqueueUniquePeriodicWork(
    "flush-outbox", ExistingPeriodicWorkPolicy.KEEP, req)
  ```
- **RN access:** `expo-background-task` (`TaskManager.defineTask` at module scope + `BackgroundTask.registerTaskAsync('flush', { minimumInterval: 60 })`) — it's WorkManager on Android and BGTaskScheduler on iOS, so one JS task runs on both. For custom constraints/chaining, write the Worker in Kotlin and hand off to JS with Headless JS.
- **visual idea:** A queue of unsent events piling up in a box labelled "outbox"; a clock ticks to the top of the hour; phone screen is off; a tiny worker wakes, checks a Wi-Fi checkbox, uploads, and the box empties.
- **narration beats:**
  1. Say your app queues analytics or offline edits, and you upload them "next time the app opens". Sometimes that's days.
  2. Android has a built-in scheduler for exactly this: WorkManager.
  3. You hand it a job and the rules: run every hour, only on network, not when battery's low.
  4. It stores the job in a database, so it survives the app being killed and even a reboot.
  5. Minimum period is 15 minutes, and the OS picks the exact moment inside a flex window, so it's not a precise cron — it's a reliable one.
  6. If your job fails, return retry and it backs off automatically.
  7. From React Native, expo-background-task wraps it: define a task in JS, register it with a minimum interval, done. Same code works on iOS.
  8. Need chaining or expedited work? Write the Worker in Kotlin and call into JS with Headless JS.
  9. Next time you write "we'll sync when they reopen", reach for this instead.
- **you'll use this when…** anything needs to happen "later, reliably, even if the app is closed": outbox flush, log upload, periodic sync, cache prewarm.
- **gotcha:** WorkManager jobs don't run during Doze (they wait for the maintenance window), and some OEMs (see dontkillmyapp.com) kill scheduled work if the user swipes the app away. Treat the schedule as "soon", not "at 2:00".
- **sources:** https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work · https://developer.android.com/develop/background-work/background-tasks/persistent · https://docs.expo.dev/versions/latest/sdk/background-task/

### 5. android-foreground-services-types
- **series:** Android Must-Knows
- **title:** Foreground services, now typed
- **hook:** "Want to keep running with the screen off? Pay with a notification."
- **core idea:** A foreground service is the only way to keep doing real work (GPS tracking, audio, a big upload) while the user is elsewhere — in exchange for a persistent notification. Since Android 14 (targetSdk 34) every foreground service must declare a *type* (`location`, `mediaPlayback`, `dataSync`, `camera`, `microphone`, `shortService`, `specialUse`…) plus the matching `FOREGROUND_SERVICE_<TYPE>` permission, and Play asks you to justify it. Android 15 caps `dataSync` and `mediaProcessing` at 6 hours per 24.
- **example (manifest):**
  ```xml
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
  <service android:name=".TrackingService"
           android:foregroundServiceType="location"
           android:exported="false" />
  ```
  App scenario: a delivery app tracking a rider's route; a podcast app playing with the screen off; a photo backup app uploading 300 pictures.
- **RN access:** Notifee: `notifee.registerForegroundService(cb)` (call it in `index.js`, outside components) + `displayNotification({ android: { asForegroundService: true } })`; you declare the type on Notifee's own service in your manifest: `<service android:name="app.notifee.core.ForegroundService" android:foregroundServiceType="location|dataSync" />` plus the matching `FOREGROUND_SERVICE_*` permissions (Notifee's docs don't yet spell out the Android 14 rule; the crash reports in their issue tracker do). `react-native-background-actions` is the other common wrapper. Expo: add the service/type via a config plugin; `expo-location` adds the `location` type when you enable background location.
- **visual idea:** Phone with screen off; a small persistent notification "Uploading 42/300"; a label animates the manifest `foregroundServiceType="dataSync"` and a 6-hour hourglass; another phone with `location` and a map pin.
- **narration beats:**
  1. Android lets you keep working in the background, but it charges a fee: a notification the user can always see.
  2. That's a foreground service, and it's how music keeps playing and ride-tracking keeps tracking.
  3. Since Android 14 you must say *what kind* of work: location, mediaPlayback, dataSync, camera, microphone, and so on.
  4. Each type needs its own permission in the manifest, and some need a runtime permission first — a location service won't start without location granted.
  5. Android 15 adds a timer: dataSync and mediaProcessing get six hours a day, then onTimeout fires and you must stop.
  6. And you can't launch most of them from a boot receiver anymore.
  7. From React Native, Notifee can turn a notification into a foreground service with asForegroundService, and your JS keeps running underneath it.
  8. But here's the honest advice: if the work can wait, use WorkManager instead. Foreground services are for things the user is watching happen.
  9. Play will ask you to declare the type on the app content page, so pick the one you can defend.
- **you'll use this when…** the user expects something to keep going with the screen off: playback, navigation, an upload they started.
- **gotcha:** Starting a foreground service while your app is in the background is mostly forbidden (Android 12+) and throws `ForegroundServiceStartNotAllowedException`. Start it from a user action or an exempted trigger (high-priority FCM, exact alarm), not from a timer in JS.
- **sources:** https://developer.android.com/develop/background-work/services/fgs/service-types · https://developer.android.com/about/versions/15/behavior-changes-15 · https://notifee.app/react-native/docs/android/foreground-service

### 6. android-doze-why-timer-stopped
- **series:** Android Must-Knows
- **title:** Doze ate your timer
- **hook:** "Your setInterval didn't break. The phone fell asleep on purpose."
- **core idea:** When a phone sits unplugged, screen off and still, it enters Doze: network is cut, wake locks are ignored, normal alarms and WorkManager jobs are deferred to short "maintenance windows" that get rarer the longer it sleeps. App Standby does the same per-app when the user hasn't touched you for a while. Only a few things get through: high-priority FCM / `RemoteNotification` messages, `setAndAllowWhileIdle` alarms (max once per 9 min), and `setAlarmClock`.
- **example (test it in 10 seconds):**
  ```bash
  adb shell dumpsys deviceidle force-idle    # enter Doze now
  adb shell dumpsys deviceidle unforce
  adb shell dumpsys battery reset
  adb shell am set-inactive com.yourapp true # App Standby
  ```
  App scenario: a "sync every 5 min while open" JS interval that silently stops overnight; a chat app whose socket dies and only wakes on push.
- **RN access:** Nothing to install — design around it. Push via `@react-native-firebase/messaging` with high priority for time-sensitive wakes; scheduled work via `expo-background-task` / WorkManager (deferred, not lost); Notifee timestamp triggers can opt into `alarmManager.allowWhileIdle` for the rare true alarm. Don't ask for battery-optimization exemption unless the core feature breaks — Play policy says no.
- **visual idea:** Phone on a nightstand; clock advances 11 pm → 7 am; a JS timer icon pulses, then a "zzz" blanket drops; small gaps labelled "maintenance window" let a few packets through; an FCM bolt punches through the blanket.
- **narration beats:**
  1. Bug report: "sync stops at night". Your code's fine. The phone went into Doze.
  2. Unplugged, screen off, not moving for a while, and Android shuts the network, ignores wake locks, and parks your alarms and jobs.
  3. It wakes briefly in maintenance windows to run what's queued, then sleeps again, and the windows get rarer.
  4. App Standby is the per-app version: ignore an app for days and it gets network about once a day.
  5. So a setInterval in JS is dead the moment your process is paused or killed anyway.
  6. What gets through? High-priority FCM messages. Alarms set with allowWhileIdle, and those are limited to one every nine minutes. Real alarm-clock alarms.
  7. Reproduce it with adb shell dumpsys deviceidle force-idle, no overnight wait needed.
  8. The fix is architectural: push to wake, WorkManager to catch up, and stop pretending timers run in the background.
  9. Asking for the battery-optimization exemption is a Play policy problem unless your app's core feature truly needs it.
- **you'll use this when…** anything "stops overnight" or on idle phones, and when choosing between a timer, a job, and a push.
- **gotcha:** Many OEM skins (Xiaomi, Oppo, Samsung) add their own killers on top of Doze; what works on a Pixel may still die elsewhere — check dontkillmyapp.com before promising background behavior.
- **sources:** https://developer.android.com/training/monitoring-device-state/doze-standby · https://developer.android.com/develop/background-work/services/alarms/schedule

### 7. android-broadcast-receivers-boot-connectivity
- **series:** Android Must-Knows
- **title:** Wake up on boot or Wi-Fi
- **hook:** "Android will start your app when the phone reboots. If you ask right."
- **core idea:** A BroadcastReceiver is a tiny entry point that the system can call when something happens — device finished booting, charger plugged, time zone changed, your own custom event. Manifest-declared receivers can launch your app even if it isn't running, but since Android 8 most *implicit* system broadcasts can't be declared in the manifest anymore (BOOT_COMPLETED is an exception; CONNECTIVITY_ACTION is not — register it in code, or better, use a WorkManager network constraint). `onReceive` runs on the main thread and must finish in seconds; kick real work to WorkManager.
- **example (manifest + receiver):**
  ```xml
  <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
  <receiver android:name=".BootReceiver" android:exported="true">
    <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
  </receiver>
  ```
  ```kotlin
  class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, i: Intent) {
      if (i.action == Intent.ACTION_BOOT_COMPLETED) WorkManager.getInstance(ctx).enqueue(/* re-schedule */)
    }
  }
  ```
  App scenario: re-arm reminders after a reboot (alarms are wiped on shutdown); re-register a periodic sync.
- **RN access:** Boot: a native receiver that starts a `HeadlessJsTaskService` (RN's official Headless JS: `AppRegistry.registerHeadlessTask('Boot', () => require('./bootTask'))`) to run a JS function with no UI — call `HeadlessJsTaskService.acquireWakeLockNow()` in the receiver, and note the docs' warning: "your app will crash if you try to run a task while the app is in the foreground" unless you pass the fourth `allowedInForeground` argument. `expo-background-task` jobs survive reboot on their own (WorkManager persists them). Connectivity: `@react-native-community/netinfo` (uses `ConnectivityManager` callbacks, not the deprecated broadcast); `expo-network`. Don't listen for connectivity just to retry uploads — put a `NetworkType.CONNECTED` constraint on the job instead.
- **visual idea:** Phone reboots (boot animation); a mailbox flag pops up labelled BOOT_COMPLETED; an arrow into a tiny "receiver" box that immediately hands a ticket to WorkManager; a second strip shows the old CONNECTIVITY_ACTION path with a red "manifest ✗ / code ✓" stamp.
- **narration beats:**
  1. Phones reboot. When they do, every alarm you scheduled is gone, and your app isn't running to fix that.
  2. Android's answer is a broadcast receiver: a tiny class the system calls when an event happens.
  3. Declare one for BOOT_COMPLETED in the manifest, add the RECEIVE_BOOT_COMPLETED permission, and Android starts your process after boot.
  4. Catch: the user must have opened the app at least once, and onReceive runs on the main thread with seconds to live.
  5. So don't work in there, just re-enqueue your WorkManager jobs and return.
  6. Since Android 8 most system broadcasts can't be manifest-declared at all; connectivity changes must be registered in code while you're running.
  7. In React Native that's NetInfo for connectivity and Headless JS if you really need JS code on boot.
  8. And expo-background-task re-registers its own jobs after a reboot for you.
  9. Rule: receivers wake you up, WorkManager does the work.
- **you'll use this when…** reminders die after reboot, or you need "when X happens on the device, do Y" without the app open.
- **gotcha:** Android 15+: a BOOT_COMPLETED receiver can no longer start `dataSync`, `camera`, `mediaPlayback`, `microphone`, `phoneCall` or `mediaProjection` foreground services — schedule a job instead of starting a service from boot.
- **sources:** https://developer.android.com/develop/background-work/background-tasks/broadcasts · https://developer.android.com/develop/background-work/services/alarms/schedule#boot · https://reactnative.dev/docs/headless-js-android · https://github.com/react-native-netinfo/react-native-netinfo

### 8. android-notification-channels-permission
- **series:** Android Must-Knows
- **title:** Channels: the user's mute switch
- **hook:** "On Android, users can mute one kind of your notification. Not all of them."
- **core idea:** Since Android 8 every notification must belong to a *channel* you create (id, name, importance); users can silence or re-prioritise each channel in Settings, and once created you cannot change a channel's importance from code. Since Android 13 you also need the `POST_NOTIFICATIONS` runtime permission — new installs have notifications off until the user taps Allow, and apps targeting ≤32 get an automatic prompt at the first channel creation instead of a prompt at your chosen moment.
- **example (Notifee in JS):**
  ```ts
  await notifee.requestPermission();                 // POST_NOTIFICATIONS on 13+
  const channelId = await notifee.createChannel({
    id: 'orders', name: 'Order updates', importance: AndroidImportance.HIGH });
  await notifee.displayNotification({
    title: 'Driver is 2 min away', body: 'Order #4821',
    android: { channelId, pressAction: { id: 'default' } } });
  ```
  App scenario: food-delivery app with `orders` (high), `promos` (low) and `chat` (high, with its own sound) — users mute promos without losing order alerts.
- **RN access:** `@notifee/react-native` (`createChannel`, `displayNotification`, `requestPermission`) or `expo-notifications` (`setNotificationChannelAsync`, `requestPermissionsAsync`). Permission alone: `react-native-permissions` `PERMISSIONS.ANDROID.POST_NOTIFICATIONS` / `requestNotifications()`. Remote push payloads from FCM must name the channel too (`android.notification.channel_id`).
- **visual idea:** Settings → App notifications screen with three toggles (Orders, Promos, Chat); user flips Promos off; a promo notification bounces off the phone while an order notification lands; then the Android 13 Allow/Don't allow dialog appears at a sensible moment ("Order placed!").
- **narration beats:**
  1. One of the nicest Android features is one most RN apps ignore: notification channels.
  2. Every notification belongs to a channel you create: an id, a human name, and an importance.
  3. Users see those channels in Settings and can mute "Promos" while keeping "Order updates" loud.
  4. Give everything one channel called "default" and the user's only option is muting you entirely.
  5. Careful: once a channel exists, you can't bump its importance from code; you'd need a new channel id.
  6. Then there's permission. Since Android 13, notifications are off for new installs until the user allows POST_NOTIFICATIONS.
  7. Target Android 13 or newer and you choose the moment, like right after they place an order, not a cold prompt on launch.
  8. Notifee or expo-notifications handle both: request permission, create channels, display.
  9. And when your server sends via FCM, put the channel id in the payload or Android drops it into a default bucket.
- **you'll use this when…** you have more than one kind of alert, or users complain your app is "too noisy" and mute everything.
- **gotcha:** Foreground-service notifications still appear in the task manager if notifications are denied, but your *other* notifications won't — check `areNotificationsEnabled()` before promising "we'll notify you".
- **sources:** https://developer.android.com/develop/ui/views/notifications/notification-permission · https://developer.android.com/develop/ui/views/notifications/channels · https://notifee.app/react-native/docs/android/channels · https://docs.expo.dev/versions/latest/sdk/notifications/

### 9. android-app-links-vs-deep-links
- **series:** Android Must-Knows
- **title:** Links that skip the chooser
- **hook:** "Your https link opens Chrome, not your app. One JSON file fixes it."
- **core idea:** A custom scheme (`myapp://`) always opens you but anyone can claim it. An Android App Link is an `https://` intent filter with `android:autoVerify="true"`; at install Android fetches `https://yourdomain/.well-known/assetlinks.json`, checks your package name and signing-cert SHA-256, and only then opens your app directly with no "Open with" chooser. Since Android 12 unverified web links go to the browser by default.
- **example:**
  ```xml
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="shop.example.com" android:pathPrefix="/p/" />
  </intent-filter>
  ```
  ```json
  [{"relation":["delegate_permission/common.handle_all_urls"],
    "target":{"namespace":"android_app","package_name":"com.example.shop",
    "sha256_cert_fingerprints":["AB:CD:…"]}}]
  ```
  Debug: `adb shell pm verify-app-links --re-verify com.example.shop` then `adb shell pm get-app-links com.example.shop` → `verified`.
- **RN access:** Expo `app.json` → `android.intentFilters: [{ action: 'VIEW', autoVerify: true, data: [{ scheme: 'https', host: 'shop.example.com', pathPrefix: '/p/' }], category: ['BROWSABLE','DEFAULT'] }]`. Bare: the XML above. Then React Navigation `linking.prefixes: ['https://shop.example.com', 'myapp://']` or Expo Router (automatic). Get the fingerprint from Play Console → App signing (the *app signing* cert, not your upload cert).
- **visual idea:** Two phones side by side: tapping a link on the left shows the "Open with" sheet / Chrome; on the right the app opens instantly. Middle: a request flying from the phone to `/.well-known/assetlinks.json` with a green checkmark on the SHA-256.
- **narration beats:**
  1. You add myapp:// deep links and it works. Then marketing sends an https link in an email and it opens Chrome. Classic.
  2. Custom schemes are easy but weak: any app can register myapp://, and web links don't use them anyway.
  3. Android App Links are https links that Android *verifies* belong to you.
  4. Put autoVerify on the intent filter, host assetlinks.json at .well-known on your domain, and list your package name and signing certificate fingerprint.
  5. At install, Android fetches the file, checks the fingerprint, and from then on your links open your app with no chooser.
  6. Since Android 12, if verification fails, the link just goes to the browser. So verify.
  7. Pro tip: the fingerprint must be the Play App Signing certificate, not your local upload key.
  8. Debug with adb shell pm get-app-links your.package and look for "verified".
  9. On the JS side nothing changes: React Navigation or Expo Router just receive the URL.
- **you'll use this when…** links from email, SMS, QR codes or the web should land inside the app, and for passwordless/magic-link logins.
- **gotcha:** Android 15+ re-verifies domains in the background and changes can take up to 7 days to propagate; older versions only re-check on install/update. Keep assetlinks.json served over HTTPS with no redirects, `Content-Type: application/json`.
- **sources:** https://developer.android.com/training/app-links/verify-android-applinks · https://developer.android.com/training/app-links · https://docs.expo.dev/linking/android-app-links/ · https://reactnavigation.org/docs/configuring-links

### 10. android-overlays-bubbles-pip
- **series:** Android Must-Knows
- **title:** Floating windows, three ways
- **hook:** "Facebook's chat heads, YouTube's mini player: three different Android APIs."
- **core idea:** Android has three ways to float over other apps, each with a different cost. (1) Picture-in-Picture: a shrunken copy of your Activity for video/calls/navigation, needs no permission, just `android:supportsPictureInPicture="true"`. (2) Bubbles (Android 11+): a chat-conversation notification that the *user* can pop out into a floating circle; needs a conversation shortcut and `BubbleMetadata`, no special permission. (3) System overlay windows (`SYSTEM_ALERT_WINDOW`): draw anything anywhere, but it's a special permission via Settings and Play scrutinises it — Google explicitly says don't use it to fake PiP.
- **example (PiP, manifest + Kotlin):**
  ```xml
  <activity android:name=".MainActivity" android:supportsPictureInPicture="true"
    android:configChanges="screenSize|smallestScreenSize|screenLayout|orientation" />
  ```
  ```kotlin
  setPictureInPictureParams(PictureInPictureParams.Builder()
    .setAspectRatio(Rational(16, 9)).setAutoEnterEnabled(true).build())  // 12+: auto on swipe-home
  ```
  App scenario: video call keeps running while the user checks a message; map navigation shrinks when they open Spotify.
- **RN access:** PiP: `expo-video` `<VideoView allowsPictureInPicture startsPictureInPictureAutomatically />` with the plugin's `supportsPictureInPicture: true`; `react-native-video` has `pictureInPicture`. For non-video PiP (calls, nav) you call `enterPictureInPictureMode` from a tiny native module — the whole RN root view shrinks. Bubbles and overlays: no mainstream RN library; bubbles are a notification-side feature (native `BubbleMetadata` on a Notifee/FCM notification plus a dedicated `allowEmbedded`/`resizeableActivity` Activity), overlays need a native `WindowManager.addView(TYPE_APPLICATION_OVERLAY)` module.
- **visual idea:** Triptych on one phone: (a) video shrinks to a corner while the user scrolls another app; (b) a chat notification with a "bubble" button pops into a floating avatar; (c) a Settings toggle "Display over other apps" with a Play-review magnifying glass over it.
- **narration beats:**
  1. Three apps float over other apps, and they use three different APIs.
  2. YouTube's mini player is Picture-in-Picture: your Activity literally shrinks into a corner and keeps running.
  3. One manifest flag, an aspect ratio, and on Android 12+ setAutoEnterEnabled makes it happen when the user swipes home.
  4. Your whole React Native screen shrinks, so hide everything except the video when you enter PiP.
  5. Messenger's chat heads are Bubbles: a conversation notification the user chooses to pop out. No permission, but you need a conversation shortcut and an embeddable Activity.
  6. The third way is the nuclear option: SYSTEM_ALERT_WINDOW. Draw anything over any app.
  7. That's a special permission with a Settings toggle, Play reviews it, and Google says explicitly: don't fake PiP with it.
  8. From React Native, expo-video and react-native-video give you PiP for free; calls or navigation need a ten-line native module.
  9. Pick the smallest hammer: PiP for video and calls, bubbles for chats, overlay only when nothing else works.
- **you'll use this when…** video/calls/navigation should keep going outside the app, or a messaging app wants chat heads.
- **gotcha:** PiP puts your Activity in the *paused* state (`onPause`), so pause-on-blur logic will stop your video; check `isInPictureInPictureMode` and use `onStop` for real pauses. Bubbles only work for conversation-style notifications on 11+ and users can block them per app.
- **sources:** https://developer.android.com/develop/ui/views/picture-in-picture · https://developer.android.com/develop/ui/views/notifications/bubbles · https://developer.android.com/training/permissions/requesting-special · https://docs.expo.dev/versions/latest/sdk/video/

### 11. android-advertising-id
- **series:** Android Must-Knows
- **title:** The ID users can reset
- **hook:** "There's a device ID your users can wipe in Settings. Plan for zeros."
- **core idea:** The Google Advertising ID (GAID/AAID) is a per-device, user-resettable, user-*deletable* UUID from Google Play services, meant to be the only identifier you use for ads: attribution ("this install came from that campaign"), frequency capping, and the Install Referrer handshake. Apps targeting Android 13+ must declare `com.google.android.gms.permission.AD_ID` or they read all zeros; if the user deletes their ID, every read returns zeros too. For non-ad needs (analytics, fraud) Google points you to App Set ID instead. Privacy Sandbox on Android was meant to replace it, but on 17 Oct 2025 Google announced it is retiring Topics, Protected Audience, Attribution Reporting, Protected App Signals and the SDK Runtime "due to low levels of adoption" — so the advertising ID is still what attribution SDKs use today (Google's post doesn't say that explicitly; it just never mentions the ID).
- **example:**
  ```xml
  <uses-permission android:name="com.google.android.gms.permission.AD_ID" />
  ```
  ```kotlin
  val info = AdvertisingIdClient.getAdvertisingIdInfo(ctx)   // background thread!
  if (info.isLimitAdTrackingEnabled || info.id == "00000000-0000-0000-0000-000000000000") { /* treat as no ID */ }
  ```
  App scenario: a Google Ads / Meta campaign; the attribution SDK (AppsFlyer, Adjust, Firebase) matches the click to the install using this ID plus the Play Install Referrer.
- **RN access:** `expo-tracking-transparency` `getAdvertisingId()` (returns the GAID on Android; `null`/zeros when unavailable) and declares `AD_ID` for you; attribution SDKs (`react-native-appsflyer`, `react-native-adjust`, Firebase Analytics) read it themselves — add the permission in `app.json` → `android.permissions` if you use any ads SDK. Declare "Advertising ID" usage in Play Console → App content.
- **visual idea:** Settings → Privacy → Ads screen with "Reset advertising ID" and "Delete advertising ID"; the ID string morphs to `0000-…`; then a flow: ad click → Play Store → install → first open → attribution SDK matches on the ID.
- **narration beats:**
  1. Every Android phone with Play services has an advertising ID. It's a UUID, and the user owns it.
  2. It's for one job: ads. Which campaign brought this install, don't show the same ad ten times, that kind of thing.
  3. Users can reset it any time in Settings, and they can delete it. After that, you read all zeros.
  4. If your app targets Android 13 or newer, you must declare the AD_ID permission, or you also get zeros.
  5. Ads SDKs usually add that permission for you, which is why it shows up in your merged manifest.
  6. Don't use it as a user ID or link it to anything permanent; Play's policy forbids it, and Google offers App Set ID for analytics instead.
  7. From React Native, expo-tracking-transparency's getAdvertisingId reads it, and your attribution SDK reads it on its own.
  8. Declare the usage in Play Console under App content, otherwise your release gets flagged.
  9. Build for the zero case from day one: no ID is a normal state, not an error.
- **you'll use this when…** you run paid campaigns and need install attribution, or an SDK asks "do you use the advertising ID?".
- **gotcha:** Calling `getAdvertisingIdInfo` on the main thread throws; and on Android 12+ if the user opts out of ads personalization, the ID is zeroed for apps targeting 31+. Always branch on the zero/`null` case.
- **sources:** https://support.google.com/googleplay/android-developer/answer/6048248 · https://developer.android.com/about/versions/13/behavior-changes-13 · https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies · https://docs.expo.dev/versions/latest/sdk/tracking-transparency/

### 12. android-release-signing-r8
- **series:** Android Must-Knows
- **title:** Keys and shrinking, demystified
- **hook:** "Lose this one file and you can never update your app. Here's the fix."
- **core idea:** Every APK must be signed; an update is only accepted if it's signed with the *same* key, so a lost key means a new package name and zero migrated users. Play App Signing (required for new apps using App Bundles) solves it: Google holds the real *app signing key*, you keep an *upload key* that can be reset if lost. Separately, R8 (`minifyEnabled`/`shrinkResources`) strips unused code, renames classes and can break reflection-heavy libs — it needs keep rules and you must upload `mapping.txt` or your crash stack traces are gibberish.
- **example (`android/app/build.gradle`):**
  ```groovy
  def enableProguardInReleaseBuilds = true
  signingConfigs { release { storeFile file(MYAPP_UPLOAD_STORE_FILE); storePassword MYAPP_UPLOAD_STORE_PASSWORD
                              keyAlias MYAPP_UPLOAD_KEY_ALIAS; keyPassword MYAPP_UPLOAD_KEY_PASSWORD } }
  buildTypes { release { signingConfig signingConfigs.release
      minifyEnabled enableProguardInReleaseBuilds; shrinkResources enableProguardInReleaseBuilds
      proguardFiles getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro" } }
  ```
  Mapping lands at `android/app/build/outputs/mapping/release/mapping.txt`.
- **RN access:** Bare: the RN docs' "Publishing to Google Play Store" steps (`keytool -genkeypair`, `~/.gradle/gradle.properties` vars above, `./gradlew bundleRelease`). Expo: EAS Build generates and stores the keystore for you (`eas credentials` to inspect/download); Sentry's and Crashlytics' Gradle plugins upload `mapping.txt` automatically.
- **visual idea:** Two keys on a ring: "upload key" (you) and "app signing key" (Google vault); a lost-key scenario with a crossed-out update arrow vs. the Play Console "reset upload key" button. Second half: a bundle shrinking (bar 40 MB → 24 MB) and a crash stack `a.b.c.d()` turning readable after `mapping.txt` upload.
- **narration beats:**
  1. Android has one rule that scares people: updates must be signed with the exact same key as the first release.
  2. Lose that keystore and the best you can do is publish a brand-new app and beg users to reinstall.
  3. Play App Signing fixes it. Google keeps the real signing key, you keep an upload key.
  4. Lose the upload key? Click reset in Play Console, make a new one, keep shipping.
  5. It's required for new apps because App Bundles are built into APKs on Google's side anyway.
  6. On EAS, Expo manages that keystore for you; just don't leave it in the repo.
  7. Second thing in a release build: R8. It deletes unused code and renames classes, so your app gets smaller and faster.
  8. The trade: reflection-based libraries can break, so you add keep rules, and crash logs become a.b.c unless you upload mapping.txt.
  9. Turn it on early, test the release build, upload the mapping, and your production crashes stay readable.
- **you'll use this when…** setting up CI for the first store release, onboarding a new dev who asks "where's the keystore?", or reading an obfuscated crash.
- **gotcha:** `assetlinks.json`, Firebase, Google Sign-In and Facebook all want the SHA-256 of the *app signing* cert from Play Console, not your local upload/debug cert — a classic "works in debug, dead in production" bug.
- **sources:** https://developer.android.com/studio/publish/app-signing · https://developer.android.com/build/shrink-code · https://reactnative.dev/docs/signed-apk-android · https://docs.expo.dev/app-signing/app-credentials/

---

## Series 2 — iOS Must-Knows

### 13. ios-info-plist-usage-strings
- **series:** iOS Must-Knows
- **title:** One missing string, instant crash
- **hook:** "Your iOS app crashed on 'take photo'. No stack trace. It's a plist."
- **core idea:** `Info.plist` is iOS's manifest: bundle id, version, URL schemes, background modes, and the *purpose strings* that explain why you want each protected resource. Touch the camera, mic, photos, location, contacts, Bluetooth or tracking without the matching `NS…UsageDescription` key and the system kills the app on the spot (camera/photos: "the system terminates your app"); App Review also rejects binaries that reference those APIs without a string (ITMS-90683).
- **example (`Info.plist`):**
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>Scan receipts to add expenses faster.</string>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>Pick a receipt photo from your library.</string>
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>Show stores near you.</string>
  ```
  App scenario: you add a "scan receipt" button, test on Android, ship — iOS testers report a crash the first time they tap it.
- **RN access:** Expo: `app.json` → `ios.infoPlist: { NSCameraUsageDescription: '…' }`, or the library's plugin option (`["expo-camera", { "cameraPermission": "…" }]`); prebuild writes the plist. Bare: edit `ios/<App>/Info.plist`. The string shows verbatim in the prompt, so write it for the user, not the reviewer.
- **visual idea:** Phone taps "Scan receipt" → app vanishes (crash); cut to Xcode console line "This app has crashed because it attempted to access privacy-sensitive data without a usage description"; the plist key types itself in; replay shows the permission sheet with your string.
- **narration beats:**
  1. iOS has its own manifest, Info.plist, and one kind of entry in it can crash your app.
  2. Every private thing you touch needs a purpose string: camera, mic, photos, location, contacts, Bluetooth, tracking.
  3. Forget the key and the first time your code calls that API, iOS terminates the app. No JS error, nothing to catch.
  4. App Review checks for it too: if your binary references the camera API without the string, you're rejected before a human looks.
  5. The string is shown to the user inside the permission sheet, so "Camera access" is bad and "Scan receipts to add expenses" is good.
  6. Libraries drag in APIs you don't call. A photo-picker dependency can mean you need the photo-library string even if you never open it.
  7. In Expo, put them in app.json under ios.infoPlist or use the library plugin's permission option.
  8. Bare React Native: edit Info.plist in Xcode or in the ios folder.
  9. Before every TestFlight: grep your JS for permissions you request, then grep the plist for the strings.
- **you'll use this when…** adding any feature that touches hardware or personal data, or debugging an iOS-only crash with no JS trace.
- **gotcha:** The crash only happens when the API is *called*, so it hides until a user reaches that screen; it also hides in the simulator for some resources. Test the real tap on a device, and keep strings in sync with the privacy manifest (reel 24).
- **sources:** https://developer.apple.com/documentation/uikit/requesting-access-to-protected-resources · https://developer.apple.com/documentation/avfoundation/requesting-authorization-to-capture-and-save-media · https://docs.expo.dev/versions/latest/config/app/#infoplist

### 14. ios-permission-prompt-one-shot
- **series:** iOS Must-Knows
- **title:** You get one shot
- **hook:** "iOS shows your permission dialog exactly once. Ever. Don't waste it."
- **core idea:** Once a user answers an iOS permission prompt the system remembers it and never asks again; a denial can only be undone by the user in Settings (or by resetting Location & Privacy on the device). So the winning pattern is a *pre-prompt*: your own screen explains the benefit, and you call the real request only when the user says "Sure" — if they say "Not now", the system dialog was never spent and you can ask later.
- **example (RN pre-prompt pattern):**
  ```ts
  const status = await check(PERMISSIONS.IOS.CAMERA);
  if (status === RESULTS.DENIED) {           // never asked yet
    const ok = await showExplainer('Scan receipts to add expenses faster');
    if (ok) await request(PERMISSIONS.IOS.CAMERA);
  } else if (status === RESULTS.BLOCKED) {   // asked and denied
    showSettingsCard(() => openSettings());  // UIApplication.openSettingsURLString
  }
  ```
  App scenario: a notes app that asks for notifications on first launch gets 30% opt-in; asking right after the user sets their first reminder gets far more — and a denial no longer blocks the feature forever.
- **RN access:** `react-native-permissions` (`check` → `DENIED` means not asked yet, `BLOCKED` means asked and refused; `openSettings()`), `requestNotifications(['alert','sound'])`; Expo: `expo-camera`/`expo-location`/`expo-notifications` `getXPermissionsAsync()` + `requestXPermissionsAsync()` and `Linking.openSettings()`. Notifications have a cheat code: `.provisional` (Notifee `requestPermission({ provisional: true })`, expo `ios.allowProvisional`) delivers quietly with no prompt at all (reel 17).
- **visual idea:** Split phone: left side taps "Allow Camera?" dialog → "Don't Allow" → dialog turns to stone with a lock. Right side: friendly in-app card "Scan receipts? [Sure] [Not now]" → "Not now" → card fades, dialog never spent → later "Sure" → real dialog → Allow.
- **narration beats:**
  1. On Android a user can deny you twice. On iOS, once. The system dialog appears one time and then it's gone.
  2. Deny it and the only way back is Settings, where most people never go.
  3. So never fire the real prompt the moment the app launches. The user has no idea why you want their camera yet.
  4. Use a pre-prompt: your own screen, your own words, with a "Sure" and a "Not now".
  5. "Not now" costs nothing; the iOS dialog hasn't been shown, so you can ask again when it makes sense.
  6. "Sure" is when you call the real request, and now most people tap Allow because they just said yes to you.
  7. react-native-permissions tells you which state you're in: DENIED means never asked, BLOCKED means asked and refused.
  8. If it's BLOCKED, don't prompt, show a card with a button that opens Settings.
  9. One dialog, one chance, so spend it when the user wants the thing.
- **you'll use this when…** any iOS permission ask — camera, photos, location, notifications, tracking — and when opt-in rates are low.
- **gotcha:** ATT is the exception that proves the rule: if the system dismisses the tracking prompt without a decision (app not active, called from an extension), status stays `notDetermined` and you must call again — so always branch on status, never on "did I call it once".
- **sources:** https://developer.apple.com/documentation/uikit/requesting-access-to-protected-resources · https://developer.apple.com/documentation/uikit/uiapplication/opensettingsurlstring · https://github.com/zoontek/react-native-permissions · https://developer.apple.com/documentation/apptrackingtransparency

### 15. ios-app-lifecycle-suspended
- **series:** iOS Must-Knows
- **title:** Background means frozen
- **hook:** "On iOS, 'background' lasts about five seconds. Then you're frozen."
- **core idea:** An iOS scene is foreground-active, foreground-inactive (a call or Control Center on top), background, then *suspended*: the process stays in RAM but gets zero CPU, so timers, sockets and `fetch` all freeze mid-flight. After `applicationDidEnterBackground` you have five seconds; `beginBackgroundTask` buys a short finite extension (read `backgroundTimeRemaining`; Apple gives no number). Under memory pressure a suspended app is terminated silently and next launch is cold. Swiping the app away in the switcher terminates it and, unlike Android, also cancels pending background tasks.
- **example (RN):**
  ```ts
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background') flushOutboxNow();     // you have seconds, not minutes
      if (s === 'active') refetchStaleQueries();
    });
    return () => sub.remove();
  }, []);
  ```
  App scenario: a chat app's WebSocket "works" in the simulator but on device it's dead after the user locks the phone; messages arrive only when the app reopens — because the socket was frozen with the process.
- **RN access:** `AppState` (`active | background | inactive` on iOS) is your only lifecycle hook from JS. For real background work use the OS-sanctioned doors: `expo-background-task`/BGTaskScheduler (reel 16), silent push, or `URLSession` background transfers (`expo-file-system` downloads with `sessionType: BACKGROUND`, `react-native-background-upload`). Note: Apple's TN3187 says the next major release after iOS 26 will *require* the UIScene lifecycle; Expo and RN templates already use it.
- **visual idea:** Timeline bar: ACTIVE (green) → INACTIVE (yellow, phone call banner) → BACKGROUND (orange, 5-second countdown) → SUSPENDED (blue ice crystals over the process, a WebSocket line freezes mid-dash) → red X "terminated for memory" → cold start spinner.
- **narration beats:**
  1. iOS and Android both have a "background", but they mean different things.
  2. On iOS, when the user leaves, you get about five seconds in the background. Then the process is suspended: still in memory, zero CPU.
  3. Your setTimeout doesn't fire late, it doesn't fire at all until the app comes back. Your socket is frozen mid-sentence.
  4. Need a bit more? beginBackgroundTask gives a short, finite extension. Apple won't tell you how long; you read backgroundTimeRemaining.
  5. Then there's inactive: a phone call or Control Center on top. You're visible but not receiving touches.
  6. Under memory pressure iOS kills suspended apps quietly. Next open is a cold start, so persist state before you go to background.
  7. And swiping your app away in the switcher terminates it and cancels your scheduled background tasks.
  8. In React Native, AppState is your hook: flush on background, refetch on active.
  9. For anything that must run while you're frozen, use the doors iOS gives you: background tasks, silent push, background URL sessions. Not timers.
- **you'll use this when…** anything "stops when the phone locks", or you're deciding where to save state and when to refetch.
- **gotcha:** `inactive` fires for the app switcher, Face ID sheet and incoming calls — don't treat it as "user left" or you'll pause video and drop socket connections on every notification pull-down.
- **sources:** https://developer.apple.com/documentation/uikit/managing-your-app-s-life-cycle · https://developer.apple.com/documentation/uikit/extending-your-app-s-background-execution-time · https://developer.apple.com/documentation/technotes/tn3187-migrating-to-the-uikit-scene-based-life-cycle · https://reactnative.dev/docs/appstate

### 16. ios-background-work-no-cron
- **series:** iOS Must-Knows
- **title:** iOS has no cron
- **hook:** "You can't run code every 15 minutes on iOS. Here's what you can do."
- **core idea:** iOS never promises a schedule; it decides when to wake you based on usage patterns, battery and network. BGTaskScheduler offers two deferred doors: *app refresh* (≈30 s, keep content fresh) and *processing* (minutes, can require power/network, usually overnight), both listed in `BGTaskSchedulerPermittedIdentifiers` with `UIBackgroundModes` `fetch`/`processing`. New in iOS 26: `BGContinuedProcessingTask` lets a user-started job (export, upload) continue after the user leaves, shown as a Live Activity they can cancel. The third door is silent push (`content-available`), which the server triggers but Apple throttles (2–3 per hour at most, ~30 s to work).
- **example (Expo, same code on Android):**
  ```ts
  TaskManager.defineTask('flush-outbox', async () => {
    await flushOutbox();                                 // must finish in ~30 s
    return BackgroundTask.BackgroundTaskResult.Success;
  });
  await BackgroundTask.registerTaskAsync('flush-outbox', { minimumInterval: 60 }); // minutes; iOS treats it as a hint
  ```
  `Info.plist`: `UIBackgroundModes: [processing]`, `BGTaskSchedulerPermittedIdentifiers: [com.expo.modules.backgroundtask.processing]` (prebuild adds both).
- **RN access:** `expo-background-task` (BGTaskScheduler on iOS, WorkManager on Android, not available in the iOS simulator); `react-native-background-fetch` (transistorsoft) for bare; silent push via `@react-native-firebase/messaging` `setBackgroundMessageHandler` + `content-available: 1`; big transfers via background `URLSession` (`expo-file-system` background downloads). `BGContinuedProcessingTask` has no RN wrapper yet — it's a few lines of Swift in a native module.
- **visual idea:** A wall clock vs. an iOS "mood ring": the dev's cron icon (every 15 min) gets a red X; three doors appear — "Refresh (30 s)", "Processing (overnight, plugged in)", "Silent push (server-triggered, throttled)" — plus a new iOS 26 door "Continued processing" with a Live Activity progress pill.
- **narration beats:**
  1. Android has WorkManager with a 15-minute minimum. iOS has… vibes. It wakes you when it feels like it.
  2. That's by design: iOS learns when you use an app and refreshes it right before, not on a timer.
  3. Door one: app refresh. About thirty seconds to pull fresh data. Great for "open the app and it's already up to date".
  4. Door two: processing. Minutes of work, usually overnight on the charger, for cleanup or big syncs.
  5. Both need the task id in Info.plist and the matching background mode, or the registration is ignored.
  6. Door three: silent push. Your server pokes the app with content-available, you get thirty seconds, and Apple throttles it to a couple an hour.
  7. New in iOS 26, door four: continued processing. A user taps "export", leaves, and the job keeps running with a progress pill they can cancel.
  8. From React Native, expo-background-task covers doors one and two on both platforms with one JS function.
  9. So design your sync as "catch up whenever we're awake", never "every 15 minutes", and you'll stop fighting iOS.
- **you'll use this when…** syncing, prefetching, uploading queued data, or any "do it later" feature on iOS.
- **gotcha:** Swiping the app away in the switcher cancels scheduled BG tasks until the next launch, and the simulator never runs them — test on a device with Xcode's `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"…"]` debugger trick from Apple's docs.
- **sources:** https://developer.apple.com/documentation/backgroundtasks/choosing-background-strategies-for-your-app · https://developer.apple.com/documentation/uikit/using-background-tasks-to-update-your-app · https://developer.apple.com/documentation/backgroundtasks/bgcontinuedprocessingtask · https://developer.apple.com/documentation/usernotifications/pushing-background-updates-to-your-app · https://docs.expo.dev/versions/latest/sdk/background-task/

### 17. ios-push-apns-provisional-nse
- **series:** iOS Must-Knows
- **title:** Push: tokens, quiet mode, rich media
- **hook:** "You can send iOS notifications without ever showing the permission prompt."
- **core idea:** APNs flow: the app calls `registerForRemoteNotifications`, iOS hands back a device token, your server (or Firebase/Expo push service) sends to APNs with that token. Three things most RN devs miss: *provisional* authorization delivers notifications quietly to Notification Center with no prompt (user later taps Keep/Turn off); a *Notification Service Extension* runs ~30 s of your code on every push marked `mutable-content: 1` to decrypt, localise or attach an image before it's shown; and without any authorization pushes still arrive — silently.
- **example (payload your server sends):**
  ```json
  { "aps": { "alert": { "title": "Order shipped", "body": "Tap to track" },
             "mutable-content": 1, "sound": "default" },
    "image": "https://cdn.example.com/box.jpg" }
  ```
  The NSE downloads `image`, attaches it, and the notification shows a thumbnail — Swift/Expo config, no JS.
- **RN access:** Token: `expo-notifications` `getDevicePushTokenAsync()` (raw APNs/FCM) or `getExpoPushTokenAsync()` (Expo push service); `@react-native-firebase/messaging` `getToken()`. Provisional: Notifee `requestPermission({ provisional: true })`, expo `requestPermissionsAsync({ ios: { allowProvisional: true } })`. NSE: Expo users add the target with `@bacons/apple-targets` or the `expo-notifications` docs' extension guidance; React Native Firebase documents an NSE for notification images. The `aps-environment` entitlement (development/production) must match your build or tokens never arrive.
- **visual idea:** Flow diagram: app → "token" → your server → APNs cloud → phone. Branch 1: a notification slides quietly into Notification Center (no banner) with Keep/Turn off buttons. Branch 2: a gear labelled "Service Extension" intercepts the push, downloads an image, and the banner appears with a thumbnail.
- **narration beats:**
  1. Push on iOS is three parts: a token from the device, a server that sends to Apple, and Apple delivering to the phone.
  2. Your app asks iOS to register, iOS returns a device token, you ship that token to your backend. Expo and Firebase wrap this.
  3. Trick one: provisional authorization. Pass provisional and you get no prompt at all.
  4. Notifications land quietly in Notification Center with a "Keep" or "Turn off" button, so the user decides after seeing real value.
  5. Trick two: a Notification Service Extension. Add mutable-content to the payload and your little Swift extension gets thirty seconds to change it.
  6. That's how chat apps decrypt messages and how shipping apps attach a photo of the parcel.
  7. Miss the thirty seconds and iOS shows the original payload unchanged.
  8. And if the user never granted notifications, your pushes still arrive, silently, which is handy for data updates.
  9. Check the aps-environment entitlement matches your build type; it's the number one "token never arrives" bug.
- **you'll use this when…** opt-in rates are bad (provisional), you need images/encryption/localisation in pushes (NSE), or debugging "no token on iOS".
- **gotcha:** Expo push tokens and APNs device tokens are different things; `getExpoPushTokenAsync` needs the EAS `projectId` and only works with Expo's push service, while a self-hosted APNs sender needs `getDevicePushTokenAsync`.
- **sources:** https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications · https://developer.apple.com/documentation/usernotifications/modifying-content-in-newly-delivered-notifications · https://developer.apple.com/documentation/uikit/uiapplication/registerforremotenotifications() · https://docs.expo.dev/versions/latest/sdk/notifications/ · https://notifee.app/react-native/docs/ios/permissions

### 18. ios-universal-links-vs-schemes
- **series:** iOS Must-Knows
- **title:** Universal Links, with Apple's CDN
- **hook:** "Your https link works on your phone but not the tester's. It's Apple's cache."
- **core idea:** A custom scheme (`myapp://`) opens your app but any app can claim it and Safari shows "Open in app?" prompts. Universal Links are https URLs tied to your app via an Associated Domains entitlement (`applinks:shop.example.com`) and an `apple-app-site-association` JSON file (no extension) served over HTTPS with no redirects at `/.well-known/`. Since iOS 14 devices don't fetch that file from you — Apple's CDN does, within ~24 h, and devices re-check about weekly — which is why a freshly deployed file "doesn't work yet".
- **example (`/.well-known/apple-app-site-association`):**
  ```json
  { "applinks": { "details": [ {
      "appIDs": ["ABCDE12345.com.example.shop"],
      "components": [ { "/": "/p/*" }, { "/": "/admin/*", "exclude": true } ]
  } ] } }
  ```
  Entitlement: `com.apple.developer.associated-domains = ["applinks:shop.example.com"]` (add `?mode=developer` on dev builds to bypass the CDN).
- **RN access:** Expo `app.json` → `ios.associatedDomains: ["applinks:shop.example.com"]`; Expo Router serves the file from `public/.well-known/`. Bare: Xcode → Signing & Capabilities → Associated Domains. JS side: React Navigation `linking.prefixes: ['https://shop.example.com', 'myapp://']` or Expo Router (file routes = URLs). Test with `xcrun simctl openurl booted https://shop.example.com/p/42` or a Notes-app link (Safari address bar does *not* trigger Universal Links).
- **visual idea:** Phone taps a link in iMessage → app opens. Behind it, a map: your server → Apple CDN (cloud with "24 h" timer) → iPhone (weekly refresh). A "?mode=developer" key unlocks a direct path for dev builds.
- **narration beats:**
  1. On iOS, https links that open your app are called Universal Links, and they involve a file, an entitlement and Apple's cache.
  2. The file is apple-app-site-association, no extension, JSON, served from .well-known over https with no redirects.
  3. It lists your Team ID plus bundle id and which paths belong to the app. You can exclude paths too.
  4. The entitlement is Associated Domains: applinks colon your domain. In Expo that's one line in app.json.
  5. Here's the surprise: since iOS 14 your phone never reads that file from your server. Apple's CDN does, and devices get it from Apple.
  6. So you deploy, test, nothing. Give it up to a day. Devices refresh about weekly.
  7. For dev builds add ?mode=developer to the entitlement and the device fetches the file directly.
  8. Testing tip: typing the URL into Safari won't open the app; tap it from Notes, Messages, or use simctl openurl.
  9. In React Native nothing else changes: React Navigation or Expo Router just receive the URL.
- **you'll use this when…** email, SMS, QR, web-to-app flows, or magic-link login on iOS.
- **gotcha:** If the user ever taps the "open in Safari" breadcrumb at the top-right, iOS remembers and keeps opening that domain in Safari; they must long-press a link and choose "Open in app" to flip it back. Also, the AASA must be ≤128 KB (Expo's docs note the size cap).
- **sources:** https://developer.apple.com/documentation/xcode/supporting-associated-domains · https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.associated-domains · https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app · https://docs.expo.dev/linking/ios-universal-links/

### 19. ios-idfa-att-adattributionkit
- **series:** iOS Must-Knows
- **title:** IDFA, ATT, and the new kit
- **hook:** "On iOS the ad ID is all zeros until the user says yes. Most say no."
- **core idea:** The IDFA is iOS's advertising identifier, and since iOS 14.5 you must show the App Tracking Transparency prompt before reading it or tracking users across apps — until they allow, it's `00000000-…`, and App Review rejects apps that track without asking. Because most users decline, attribution moved to privacy-preserving postbacks: SKAdNetwork and, since iOS 17.4, AdAttributionKit (covers App Store *and* EU alternative marketplaces, needs no ATT prompt). Apple's rule: you also can't gate features behind "enable tracking".
- **example (JS + plist):**
  ```ts
  const { status } = await requestTrackingPermissionsAsync();   // expo-tracking-transparency
  const idfa = status === 'granted' ? getAdvertisingId() : null; // zeros/null otherwise
  ```
  `Info.plist`: `NSUserTrackingUsageDescription` (required — the app crashes without it) and `SKAdNetworkItems` listing your ad networks' IDs.
- **RN access:** `expo-tracking-transparency` (`requestTrackingPermissionsAsync`, `getAdvertisingId`; plugin option `userTrackingPermission` writes the plist string) or `react-native-permissions` `PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY`. Attribution SDKs (`react-native-appsflyer`, Adjust, Branch, Firebase) handle SKAdNetwork/AdAttributionKit postbacks — you mostly configure, not code. Show the ATT prompt only when the app is active (foreground) or the status stays `notDetermined`.
- **visual idea:** The ATT sheet "Allow 'Shop' to track your activity…" → "Ask App Not to Track" → the IDFA string flips to zeros. Then a second lane: ad tap → install → anonymous "postback" envelope flies from Apple to the ad network with no user ID inside, labelled SKAdNetwork / AdAttributionKit.
- **narration beats:**
  1. iOS has an advertising ID too, the IDFA, but there's a bouncer in front of it called App Tracking Transparency.
  2. Until the user taps Allow on that prompt, the IDFA reads as all zeros. Most people don't tap Allow.
  3. The prompt needs a usage string in Info.plist, and without it the app crashes the moment you ask.
  4. Apple's rule is strict: no tracking across apps without that permission, and you can't lock features behind it.
  5. So how do ads get measured? Postbacks. The ad network gets "an install happened from campaign 12", but never who.
  6. That's SKAdNetwork, and since iOS 17.4 its successor AdAttributionKit, which also works on EU alternative marketplaces and needs no ATT prompt.
  7. Your attribution SDK does the heavy lifting; you list ad network IDs in the plist and configure.
  8. From React Native, expo-tracking-transparency requests the permission and reads the ID; on Android the same call just returns granted.
  9. Design for zeros being the normal case and your analytics will survive iOS.
- **you'll use this when…** integrating any ads/attribution SDK, or App Review flags "tracking without permission" (guideline 5.1.2).
- **gotcha:** Some SDKs auto-call the ATT prompt on launch, burning your one chance at the worst moment; disable auto-prompting and call it yourself after onboarding. And calling `requestTrackingAuthorization` while the app isn't active quietly returns `notDetermined`.
- **sources:** https://developer.apple.com/documentation/apptrackingtransparency · https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier · https://developer.apple.com/app-store/ad-attribution/ · https://developer.apple.com/documentation/adattributionkit · https://developer.apple.com/app-store/review/guidelines/ (5.1.2) · https://docs.expo.dev/versions/latest/sdk/tracking-transparency/

### 20. ios-signing-entitlements-plain-words
- **series:** iOS Must-Knows
- **title:** Signing, in plain words
- **hook:** "Certificate, profile, entitlement, App ID. Here's what each one actually is."
- **core idea:** iOS code signing answers four questions. *Certificate*: who built this (your Apple Developer identity). *App ID*: which app (team ID + bundle id). *Entitlements*: what it's allowed to use — push (`aps-environment`), App Groups, Associated Domains, background modes — key/value pairs baked into the code signature. *Provisioning profile*: a signed ticket from Apple that bundles the certificate, the App ID, the allowed entitlements and (for dev/ad-hoc) the device UDIDs. Change a capability and Apple must re-issue the profile; that's most "provisioning profile doesn't match" errors.
- **example (`ios/App/App.entitlements`):**
  ```xml
  <key>aps-environment</key> <string>production</string>
  <key>com.apple.security.application-groups</key>
  <array><string>group.com.example.shop</string></array>
  <key>com.apple.developer.associated-domains</key>
  <array><string>applinks:shop.example.com</string></array>
  ```
  App scenario: you add Universal Links, CI suddenly fails with "doesn't include the associated-domains entitlement" — because the profile was generated before you enabled the capability.
- **RN access:** Expo/EAS: `app.json` → `ios.entitlements` (plus `associatedDomains`, `usesAppleSignIn` etc.); `eas build` creates certs and profiles and `eas credentials` shows/rotates them — you rarely touch Xcode. Bare: Xcode → Signing & Capabilities with "Automatically manage signing", or fastlane `match` for teams. Push needs the APNs key (`.p8`) uploaded to your push provider, separate from signing.
- **visual idea:** Four cards stack into a passport: Certificate (photo), App ID (name), Entitlements (stamps: push, groups, links), Provisioning Profile (the visa, signed by Apple, expiring in 1 year); a red "capability added → visa invalid → regenerate" loop.
- **narration beats:**
  1. iOS signing scares people because four words get mixed up. Let's untangle them.
  2. Certificate: proves who you are. Apple issues it to your developer account.
  3. App ID: which app, your team ID plus bundle identifier.
  4. Entitlements: what the app may use. Push, App Groups, Associated Domains. They're key-value pairs sealed into the signature.
  5. Provisioning profile: Apple's ticket that says this certificate may ship this App ID with these entitlements, on these devices for dev builds.
  6. Turn on a new capability and the old ticket is stale, so Xcode or EAS has to regenerate it. That's most signing errors.
  7. Production and development are separate tickets, and aps-environment must match or push tokens never arrive.
  8. On EAS, Expo creates and stores all of this; run eas credentials to see it.
  9. Bare: let Xcode manage signing automatically, or use fastlane match so the whole team shares one set.
- **you'll use this when…** CI fails on signing, push stops working after a new build, or you add any capability.
- **gotcha:** The distribution certificate and the APNs auth key are different things; revoking a certificate to "fix" signing can invalidate every profile for every app on the team. Rotate the profile, not the certificate.
- **sources:** https://developer.apple.com/documentation/bundleresources/entitlements · https://developer.apple.com/documentation/xcode/capabilities · https://docs.expo.dev/app-signing/app-credentials/ · https://docs.expo.dev/versions/latest/config/app/#entitlements

### 21. ios-extensions-widgets-live-activities-app-groups
- **series:** iOS Must-Knows
- **title:** Widgets share data, not memory
- **hook:** "Your widget can't read your app's state. It needs a shared drawer."
- **core idea:** Widgets, Live Activities, share sheets and notification extensions are *app extensions*: separate binaries that usually run while your app isn't even running, so they can't see your JS state, AsyncStorage or MMKV instance. They share data only through an App Group container (`group.com.example.shop`) via `UserDefaults(suiteName:)` or files in `containerURL(forSecurityApplicationGroupIdentifier:)`. Widgets refresh on a budget (roughly 40–70 reloads/day, system-decided) and you nudge them with `WidgetCenter.shared.reloadTimelines`; Live Activities run up to 8 h active (+4 h on the Lock Screen), must start from the foreground unless you use push-to-start (iOS 17.2+), and carry ≤4 KB of state.
- **example (Swift, both sides of the drawer):**
  ```swift
  // app side (native module called from JS after an order updates)
  let d = UserDefaults(suiteName: "group.com.example.shop")!
  d.set("Out for delivery", forKey: "orderStatus")
  WidgetCenter.shared.reloadTimelines(ofKind: "OrderWidget")
  // widget side (TimelineProvider)
  let status = UserDefaults(suiteName: "group.com.example.shop")?.string(forKey: "orderStatus")
  ```
  App scenario: a delivery app's Lock Screen Live Activity ("Driver 2 stops away"), a home-screen widget with today's order, and a share extension that accepts a URL from Safari.
- **RN access:** Targets: `@bacons/apple-targets` (config plugin by an Expo team member: `npx create-target widget|share|clip|watch…`, SwiftUI inside, works with Expo prebuild); share extensions with a React Native UI: `expo-share-extension` (MaxAst). Entitlement: `app.json` → `ios.entitlements["com.apple.security.application-groups"]`. Data bridge: a tiny native module (10 lines above) exposing `setSharedValue(key, value)` + `reloadWidgets()`; Live Activities need a native module around ActivityKit (`Activity.request`, `pushToStartToken`) — no official Expo module verified at the time of writing.
- **visual idea:** Phone split: app on the left with a JS store, widget on the right with a "?" — a wall between them; a drawer labelled `group.com.example.shop` slides through the wall; the app drops a note in, pulls a bell (`reloadTimelines`), the widget updates. Second shot: Lock Screen Live Activity with an 8-hour hourglass.
- **narration beats:**
  1. Widgets look like part of your app. They're not. They're a separate little program that runs when your app is closed.
  2. Same for Live Activities, share sheets, notification extensions. They can't read your Redux store or your MMKV file.
  3. The only shared thing is an App Group: a container both can open, keyed like group.com.example.shop.
  4. Your app writes a few values with UserDefaults suiteName, then rings the bell: WidgetCenter reloadTimelines.
  5. The widget's timeline provider reads those values and draws SwiftUI. Yes, widgets are SwiftUI; your JS doesn't render there.
  6. Budget check: iOS gives a widget roughly forty to seventy refreshes a day, so don't ring the bell every second.
  7. Live Activities: start from the foreground or with a push-to-start token, eight hours active, four more on the Lock Screen, four kilobytes of state.
  8. With Expo, bacons apple-targets generates the widget target and expo-share-extension gives you a share sheet with a React Native UI.
  9. The bridge is tiny: one native module with setSharedValue and reloadWidgets, and now your app talks to its widget.
- **you'll use this when…** adding home/lock-screen widgets, order/ride tracking Live Activities, "share to my app", or rich push.
- **gotcha:** Every target has its own bundle id, entitlements and provisioning profile, and the App Group entitlement must be on *both* the app and the extension — forget one side and `UserDefaults(suiteName:)` silently returns nil.
- **sources:** https://developer.apple.com/documentation/xcode/configuring-app-groups · https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date · https://developer.apple.com/documentation/activitykit/displaying-live-data-with-live-activities · https://github.com/EvanBacon/expo-apple-targets · https://github.com/MaxAst/expo-share-extension

---

## Series 3 — Ship It

### 22. ship-deep-linking-end-to-end
- **series:** Ship It
- **title:** Deep links, end to end
- **hook:** "A link should survive install. Here's the whole chain in one minute."
- **core idea:** A deep link has three legs: the OS hands your app a URL (custom scheme, Android App Link, iOS Universal Link), your navigator maps the URL to a screen (React Navigation `linking` config or Expo Router file routes), and — the leg most apps skip — *deferred* deep linking: the user didn't have the app, went to the store, installed, and should still land on the product they tapped. The OS gives you nothing for that last leg (Android has the Play Install Referrer string; iOS has no equivalent), so you either read the referrer yourself or use Branch/AppsFlyer, which match the click to the first open.
- **example (React Navigation):**
  ```ts
  const linking = {
    prefixes: ['https://shop.example.com', 'https://*.shop.example.com', 'shopapp://'],
    config: { screens: { Product: 'p/:id', Orders: { path: 'orders', screens: { Detail: ':orderId' } } } },
  };
  <NavigationContainer linking={linking} fallback={<Splash />}>…
  ```
  Cold start arrives via `Linking.getInitialURL()`, warm via `Linking.addEventListener('url')` — React Navigation wires both for you; Expo Router does it from the file tree.
- **RN access:** React Navigation `linking` (prefixes + `config.screens`; `getInitialURL`/`subscribe` overridable), Expo Router (every file is a URL; `Linking.createURL('/')` from `expo-linking` for the scheme prefix). Deferred: AppsFlyer `registerDeepLinkListener({ onDeepLinking })` before `init()`, Branch's RN SDK, or Android's `InstallReferrerClient` (`com.android.installreferrer:installreferrer`, call once on first launch, data lives 90 days) via a small native module.
- **visual idea:** Three-lane race track: lane 1 "App installed" → URL → screen; lane 2 "Not installed" → store → install → first open → spinner → *home screen* (fail) vs. → product page (deferred link resolved); callouts show `assetlinks.json` and `apple-app-site-association` as the gates on both platforms.
- **narration beats:**
  1. Deep linking has three legs, and most apps only build the first one.
  2. Leg one: the OS opens your app with a URL. Custom scheme, or verified https on both platforms.
  3. Leg two: the URL becomes a screen. React Navigation takes a prefixes list and a screens map; Expo Router does it from file names.
  4. Cold start and warm start are different events, getInitialURL and the url listener, and the navigator handles both.
  5. Leg three is the one that loses money: user taps your ad, doesn't have the app, installs, opens… and lands on Home.
  6. That's deferred deep linking. The OS doesn't carry the link across install.
  7. On Android you can read the Play Install Referrer string on first launch; on iOS there's nothing built in.
  8. So teams use Branch or AppsFlyer, which remember the click and hand you the link on first open.
  9. Build all three legs and QR codes, emails and ads finally land where they should.
- **you'll use this when…** marketing links, referral programs, push notifications that open a screen, magic-link auth.
- **gotcha:** Test the cold-start path with the app *killed*, not backgrounded, and with the production signing cert (App Links verify the Play signing SHA-256, Universal Links verify the Team ID). Also keep the `prefixes` list in sync with both `.well-known` files.
- **sources:** https://reactnavigation.org/docs/configuring-links · https://reactnavigation.org/docs/deep-linking · https://docs.expo.dev/router/basics/core-concepts/ · https://github.com/AppsFlyerSDK/appsflyer-react-native-plugin/blob/master/Docs/RN_UnifiedDeepLink.md · https://developer.android.com/google/play/installreferrer/library

### 23. ship-store-vs-ota-updates
- **series:** Ship It
- **title:** OTA updates and the rules
- **hook:** "You can ship JS fixes without App Review. Within rules."
- **core idea:** An RN app is a native shell plus a JS bundle. Store releases replace the shell (new native code, permissions, SDK); OTA updates (EAS Update / `expo-updates`, self-hosted servers) replace only the JS bundle and assets, and only into binaries with a matching `runtimeVersion`. Both stores allow this because the code runs in an interpreter: Google Play's policy says apps may not self-update "other than Google Play's update mechanism" but exempts "code that runs in a virtual machine or an interpreter"; Apple's App Review guideline 2.5.2 forbids downloading code that "introduces or changes features or functionality", with the interpreted-code allowance living in the Developer Program License Agreement (§3.3.1(B)). The intent is the line: fix bugs and tweak UI, don't ship a different app than the one reviewed.
- **example (expo-updates):**
  ```ts
  const { isAvailable } = await Updates.checkForUpdateAsync();
  if (isAvailable) { await Updates.fetchUpdateAsync(); await Updates.reloadAsync(); }
  // app.json: "runtimeVersion": { "policy": "fingerprint" }  // native change ⇒ new runtime ⇒ no mismatched OTAs
  ```
  App scenario: a typo in the checkout button crashes on tap; a store release takes a day (Play) to a week (App Review); an OTA lands in minutes for every user on that runtime.
- **RN access:** `expo-updates` + EAS Update (`eas update --branch production`), works in bare RN too; `runtimeVersion` with the `fingerprint` policy recalculates when native code changes. Microsoft CodePush/App Center retired on 31 Mar 2025 (the `react-native-code-push` repo is archived); alternatives are EAS Update or a self-hosted `expo-updates` server.
- **visual idea:** Two conveyor belts: "Store release" (box with native + JS, passes through a review gate, slow) and "OTA" (envelope with JS only, flies straight to phones with matching `runtimeVersion` tags; a mismatched tag bounces off). A rulebook pop-up quotes Play's interpreter exception and Apple 2.5.2.
- **narration beats:**
  1. A React Native app is two things: a native shell and a JavaScript bundle. Updates work differently for each.
  2. Change native code, permissions, or an SDK? That's a store release: new binary, review, days.
  3. Change only JS and assets? That can be an over-the-air update: minutes, no review.
  4. The guard rail is runtimeVersion. An update only installs into binaries with the same runtime, and the fingerprint policy computes it from your native code.
  5. Is it allowed? Google Play says apps can't update themselves outside Play, except code running in an interpreter, like JavaScript.
  6. Apple's guideline 2.5.2 says no downloading code that changes features; the license agreement allows interpreted code as long as it doesn't change the app's purpose or bypass security.
  7. Read that as: bug fixes, copy, styling, yes. A brand-new feature nobody reviewed, no.
  8. CodePush is gone since March 2025; EAS Update or a self-hosted expo-updates server is the path now.
  9. Ship the shell through the store, ship the fixes over the air, and keep the two in sync with runtimeVersion.
- **you'll use this when…** hotfixing production, rolling out UI tweaks, or deciding whether a change needs a store release.
- **gotcha:** An OTA that references a native module the binary doesn't have crashes at launch for every user on that runtime; always bump `runtimeVersion` (or use `fingerprint`) with native changes, and keep a rollback branch ready (`eas update --republish`).
- **sources:** https://docs.expo.dev/eas-update/introduction/ · https://docs.expo.dev/versions/latest/sdk/updates/ · https://support.google.com/googleplay/android-developer/answer/9888379 · https://developer.apple.com/app-store/review/guidelines/ (2.5.2) · https://learn.microsoft.com/en-us/appcenter/retirement

### 24. ship-privacy-manifests-data-safety
- **series:** Ship It
- **title:** Privacy forms that block releases
- **hook:** "App Store Connect rejected your upload for reading UserDefaults. Really."
- **core idea:** Both stores now want a machine-readable privacy declaration. Apple: a `PrivacyInfo.xcprivacy` file in the app (and in each SDK) listing tracking (`NSPrivacyTracking`, `NSPrivacyTrackingDomains` — requests to those domains fail until ATT is granted), collected data types, and *required-reason APIs* (UserDefaults, file timestamps, system boot time, disk space, active keyboards) with an approved reason code; since 1 May 2024 uploads missing required reasons are rejected. Google: the Data safety form in Play Console, mandatory for every app, must cover data collected by your SDKs too, and is shown on your store listing.
- **example (Expo `app.json`):**
  ```json
  "ios": { "privacyManifests": { "NSPrivacyAccessedAPITypes": [
    { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"] },
    { "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryFileTimestamp",
      "NSPrivacyAccessedAPITypeReasons": ["C617.1"] } ] } }
  ```
  `CA92.1` = "reads/writes its own UserDefaults"; `C617.1` = file timestamps inside your own container.
- **RN access:** Expo: `ios.privacyManifests` in `app.json` (prebuild writes `PrivacyInfo.xcprivacy`), and `npx expo install --fix` keeps SDKs on versions that ship their own manifests. Bare: add `PrivacyInfo.xcprivacy` to the Xcode target; RN ≥0.74 ships one for the framework itself. Android: Play Console → App content → Data safety; libraries like Firebase publish "data disclosure" pages you copy from. Keep both in sync with your usage-description strings and the ATT/AD_ID declarations.
- **visual idea:** Upload progress bar hits 99% then a red ITMS email: "missing NSPrivacyAccessedAPIType… UserDefaults"; cut to the xcprivacy file filling in reason codes; second half: the Play Console Data safety questionnaire with checkboxes "Collected by SDK: Firebase Analytics".
- **narration beats:**
  1. Here's a rejection that surprises everyone: App Store Connect bounces your build because the app reads UserDefaults without saying why.
  2. Apple wants a privacy manifest, PrivacyInfo.xcprivacy, inside the app and inside every SDK.
  3. It lists what you track, which domains do the tracking, what data you collect, and the "required reason" APIs you call.
  4. UserDefaults, file timestamps, boot time, disk space, keyboards. Each needs a reason code like CA92.1.
  5. Since May 2024, miss a reason and the upload is rejected before review even starts.
  6. Bonus rule: domains in the tracking list are blocked at the network level until the user allows ATT.
  7. Google's version is the Data safety form in Play Console. Every app must fill it, including what your SDKs collect, and it's shown on your listing.
  8. In Expo, add ios.privacyManifests to app.json and run expo install --fix so your SDKs bring their own manifests.
  9. Audit it every release: new SDK, new data type, new answer on both forms.
- **you'll use this when…** preparing a store release, adding an analytics/ads SDK, or decoding an ITMS-91053 email.
- **gotcha:** Declaring `NSPrivacyTracking: true` with tracking domains means those requests silently fail for users who denied ATT; and declaring "no data collected" on Play while your crash SDK collects device IDs is a policy violation that can pull the listing.
- **sources:** https://developer.apple.com/documentation/bundleresources/privacy-manifest-files · https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api · https://docs.expo.dev/guides/apple-privacy/ · https://support.google.com/googleplay/android-developer/answer/10787469

---

## Appendix — facts that could not be verified against an official page (flagged for the writer)
- Apple's interpreted-code allowance: guideline 2.5.2 itself has no JavaScript exception; the allowance is in the Developer Program License Agreement §3.3.1(B), which is behind a developer login and was not fetched. Wording above is from memory of that clause, not quoted.
- Notifee's foreground-service docs don't yet state the Android 14 `foregroundServiceType` requirement; the requirement itself is from Android docs and Notifee's issue tracker.
- `beginBackgroundTask` duration: Apple gives no number (the folk "30 seconds" figure is not in the docs); only the 5-second `applicationDidEnterBackground` window is documented.
- Whether `BGContinuedProcessingTask` needs `UIBackgroundModes`/`BGTaskSchedulerPermittedIdentifiers` entries: not stated on the pages fetched.
- No official Expo module for widgets or Live Activities was confirmed; `@bacons/apple-targets` (community plugin by an Expo team member) is the practical route.
- React Native Firebase's Notification Service Extension guide and `react-native-background-fetch`'s `startOnBoot` option were not re-fetched in this pass.
- The AASA 128 KB limit comes from Expo's docs, not Apple's page.
- Google's Oct 2025 Privacy Sandbox post never mentions the Advertising ID; "the ad ID remains the identifier" is an inference.
- The Xcode debugger command for simulating a BG task launch (`_simulateLaunchForTaskWithIdentifier:`) is on Apple's "Starting and terminating tasks during development" page but was not re-fetched in this pass.
