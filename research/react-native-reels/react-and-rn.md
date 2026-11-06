# Research: React & React Native internals reels

Snapshot: **5 November 2026**. Scope: three series, 22 reels (40–75s each). Platform-specific Android/iOS topics are covered by another researcher and are only touched where a reel needs one verified fact.

Version facts used throughout (all verified live against reactnative.dev / react.dev):
- React Native 0.82 (Oct 2025) is "the first React Native that runs entirely on the New Architecture"; `newArchEnabled=false` / `RCT_NEW_ARCH_ENABLED=0` are ignored.
- RN 0.84 (Feb 2026): Hermes V1 is the default engine on both platforms; Legacy Architecture code is no longer compiled into iOS builds; several Android legacy classes removed; ships React 19.2.3.
- Docs currently label 0.87 as latest and the blog index lists 0.88.
- React Compiler installs as `babel-plugin-react-compiler` (must run first in the Babel pipeline); works best with React 19, supports 17/18 with `target` config.
- FlashList v2 is New-Architecture-only and JS-only (no native code); `estimatedItemSize` is deprecated and unused.
- Reanimated 4 moved worklet APIs to `react-native-worklets`; `runOnJS`/`runOnUI` are deprecated in favor of `scheduleOnRN`/`scheduleOnUI`.

Conventions: each reel has id, series, title, hook, core idea, example, visual, narration beats, "use this when", gotcha, sources. Code is kept to ≤8 lines. Narration is ~110–170 words.

---

## Series 1: Zero to Mobile (4 reels)

### 1. `what-is-an-app`
- **Series:** Zero to Mobile
- **Title:** Your App Is Just A Process
- **Hook:** "Your app is a zip file that becomes a Linux process."
- **Core idea:** A mobile app is a packaged archive (APK/AAB on Android, IPA on iOS) full of compiled code and assets; when the user taps the icon, the OS unpacks the entry point and starts a sandboxed process. Android docs: "every app runs in its own Linux process" with "its own virtual machine."
- **Example (scenario):** You tap Instagram. The OS reads `AndroidManifest.xml`, finds the launcher `Activity`, spins up a process with a unique Linux user ID, and only *then* does any of your code run. Kill the process from the task switcher and it's gone; a fresh tap starts a cold process again.
- **Visual:** Phone mockup. Icon tap → an archive (`.apk` / `.ipa`) "unzips" into a box labeled `process (uid 10123)`. Inside the box: `manifest`, `compiled code`, `assets`. A second app appears as a separate box; a wall between them labeled "sandbox".
- **Narration beats:**
  1. Here's the thing nobody tells you: an app is just a zip file with a fancy extension.
  2. On Android it's an APK, on iOS it's an IPA.
  3. Inside: compiled code, images, and a manifest that says "here's my front door."
  4. When you tap the icon, the OS starts a brand-new process just for your app.
  5. Android even gives each app its own Linux user, so apps can't read each other's files.
  6. That process has its own memory, its own threads, its own clock on life.
  7. Swipe it away in the task switcher and the process is killed. Everything in RAM is gone.
  8. So "cold start" literally means: unzip, create process, run your entry point, from zero.
  9. Everything React Native does lives inside that one process. Keep that picture.
- **You'll use this when…** debugging cold-start time, "why did my state disappear", or permissions/sandbox errors.
- **Gotcha / myth:** "The app is still running in the background." Usually it isn't; the OS "shuts down the process when it's no longer needed or when the system must recover memory."
- **Sources:**
  - https://developer.android.com/guide/components/fundamentals (APK/AAB, own Linux process, own VM, sandbox)

### 2. `rn-is-not-a-webview`
- **Series:** Zero to Mobile
- **Title:** React Native Isn't A WebView
- **Hook:** "React Native has zero HTML in it. Not one div."
- **Core idea:** RN runs your JavaScript in a real JS engine inside the native process, and every `<View>` or `<Text>` becomes an actual platform view (`ViewGroup`/`UIView`, `TextView`/`UITextView`). There is no browser and no DOM; React just has a different "renderer" that talks to native views instead of HTML.
- **Example:**
  ```tsx
  // What you write            // What exists on screen
  <View>                        // Android ViewGroup / iOS UIView
    <Text>Hi</Text>             // Android TextView / iOS UITextView
    <TextInput />               // Android EditText / iOS UITextField
  </View>
  ```
- **Visual:** Split screen. Left: JSX. Right: a phone with the Android/iOS view-hierarchy inspector; each JSX tag draws an arrow to a native view class name. A ghosted "browser" icon gets crossed out.
- **Narration beats:**
  1. Quick myth check: React Native is not a website in a box.
  2. A WebView app ships HTML and lets a browser draw it. RN doesn't.
  3. Your JS runs in a real JavaScript engine that lives inside the app's process.
  4. When React says "render a View", RN creates a real native view. A UIView on iOS, a ViewGroup on Android.
  5. Text becomes a real TextView. TextInput becomes a real EditText. Same classes a Kotlin dev would use.
  6. That's why RN apps scroll, bounce, and feel native. They *are* native views.
  7. React itself doesn't care. It just needs a renderer. On web that's react-dom. Here it's React Native.
  8. So the mental model: React decides *what* to show, native decides *how* to draw it.
  9. We'll spend this whole series opening up the pipe between those two.
- **You'll use this when…** explaining to a stakeholder why RN isn't "a wrapper", or when a native view inspector shows classes you didn't write.
- **Gotcha / myth:** "It's basically Cordova/Ionic." Those draw UI in a WebView; RN renders platform views and only uses a WebView if you add one.
- **Sources:**
  - https://reactnative.dev/docs/intro-react-native-components (component → native view table; "React Native creates the corresponding Android and iOS views")

### 3. `expo-vs-bare`
- **Series:** Zero to Mobile
- **Title:** Expo vs Bare, Honestly
- **Hook:** "Expo Go is a demo app. It was never your app."
- **Core idea:** Expo Go is a prebuilt sandbox binary that loads your JS, so you can't add native code to it. A development build is *your own* native app with `expo-dev-client` inside; the `android/` and `ios/` folders can be generated on demand from `app.json` (Continuous Native Generation) or hand-edited (what people still call "bare").
- **Example (scenario):**
  ```sh
  npx create-expo-app my-app     # no android/ or ios/ folders yet
  npx expo prebuild --clean      # generates them from app.json
  npx expo run:ios               # builds YOUR binary with expo-dev-client
  # edit ios/ by hand?  next prebuild overwrites it
  ```
- **Visual:** Three phone mockups side by side: "Expo Go" (grey, sealed box, your JS poured in), "Dev build" (your icon, box open, native libs being dropped in), "Hand-edited native" (same, but a wrench on the `ios/` folder and a warning sticker "prebuild will overwrite").
- **Narration beats:**
  1. Let's kill the confusion in 60 seconds.
  2. Expo Go is a finished app from the store. It just downloads your JavaScript and runs it.
  3. Great for learning. But you can't add a native library to an app you didn't build.
  4. A development build is your actual app, compiled by you, with a tiny dev client inside.
  5. Now you can add any native module, change the manifest, whatever.
  6. Where do the android and ios folders come from? Expo generates them from app.json. Like node_modules, but for native projects.
  7. That's called Continuous Native Generation. Run prebuild, folders appear. They're gitignored by default.
  8. "Bare" just means you keep those folders and edit them by hand.
  9. Trade-off: hand edits give full control, but prebuild will overwrite them.
  10. Most teams today: dev build plus config plugins. Only go bare when you must.
- **You'll use this when…** a library says "not supported in Expo Go" or you're deciding whether to commit `ios/` and `android/`.
- **Gotcha / myth:** "Expo can't use native code." Wrong since dev builds; the restriction is Expo Go only. Note: current Expo docs don't formally define "bare" anymore; they say "React Native app that doesn't use any Expo tools."
- **Sources:**
  - https://docs.expo.dev/workflow/overview/ (Expo Go = limited playground; dev builds; CNG; prebuild overwrites hand edits; folders gitignored)
  - https://docs.expo.dev/develop/development-builds/introduction/ ("your own version of Expo Go" with expo-dev-client)
  - https://docs.expo.dev/bare/overview/ ("bare" not defined as a term on the page)

### 4. `what-is-a-bundle`
- **Series:** Zero to Mobile
- **Title:** What's In The Bundle
- **Hook:** "Your 400 files ship as one giant JavaScript file."
- **Core idea:** Metro walks every `import` from `index.js`, transforms each file with Babel, and serializes them into a single JS file where every module is wrapped in `__d(factory, id, deps)` and the app starts with `__r(entryId)`. In release that text is precompiled to Hermes bytecode.
- **Example (shape of a bundle, simplified from Metro docs):**
  ```js
  var __DEV__ = false;            // 1. runtime vars
  /* Metro module system: defines __d and __r */   // 2. scripts
  __d(function (g, r, i, a, m, e, d) {
    /* your App.tsx, transformed */
  }, 0, [1, 2]);                   // 3. module 0 depends on 1, 2
  __d(function (...) { /* react */ }, 1, []);
  __r(0);                          // 4. run the entry point
  ```
- **Visual:** A tree of files on the left collapses into a single scroll labeled `index.bundle`. Zoom in to show stacked `__d(...)` blocks with numeric IDs and a final `__r(0)`. A second "release" lane turns the scroll into a binary `.hbc` block.
- **Narration beats:**
  1. Run your app and watch the terminal: "Bundling 100%". What just happened?
  2. Metro started at index.js and followed every import like a spider.
  3. Resolution: figure out which file `./Button` means. Maybe Button.ios.js on iOS.
  4. Transformation: Babel turns TypeScript and JSX into plain JavaScript. In parallel, cached.
  5. Serialization: glue every module into one file.
  6. Each module gets a number and gets wrapped in a function. That's the `__d` you see.
  7. The last line is `__r(0)`: run module zero. That's your entry point.
  8. In dev, the phone downloads this file from Metro over HTTP.
  9. In release, Hermes compiles it to bytecode ahead of time, so the phone skips parsing entirely.
  10. So when someone says "the bundle": one file, numbered modules, one run call.
- **You'll use this when…** a "module not found" error, slow startup, or an OTA update ships "a new bundle".
- **Gotcha / myth:** "Dynamic `require(path)` works." Module IDs are assigned at build time, so dynamic paths aren't supported. Also: RN does not use RAM bundles with Hermes.
- **Sources:**
  - https://metrobundler.dev/docs/concepts (resolution / transformation / serialization; single file; numeric IDs; platform files)
  - https://metrobundler.dev/docs/bundling (`__d`, `__r`, bundle sections; RAM bundles not used with Hermes)
  - https://reactnative.dev/docs/metro (metro.config.js)
  - https://reactnative.dev/docs/hermes (release builds compile to `.hbc`)

---

## Series 2: React Under the Hood (9 reels)

### 5. `jsx-is-just-objects`
- **Series:** React Under the Hood
- **Title:** JSX Is Just Objects
- **Hook:** "`<Greeting />` is a plain object. You can console.log it."
- **Core idea:** JSX compiles to a `createElement` call, which returns a tiny immutable object `{ type, props, key, ref }`. Nothing is rendered when you create it; it's a description React reads later.
- **Example:**
  ```jsx
  const el = <Greeting name="Taylor" />;
  // becomes: createElement(Greeting, { name: 'Taylor' })
  console.log(el);
  // { type: Greeting, props: { name: 'Taylor' }, key: null, ref: null }
  // lowercase tags:  <view /> → createElement('view')  (a string type)
  ```
- **Visual:** Code morph: JSX line → `createElement(...)` → the object literal, with each field highlighted and labeled. Then a "no screen yet" phone stays blank to stress nothing rendered.
- **Narration beats:**
  1. Open the console and log a JSX tag. You get an object.
  2. JSX is syntax sugar. Babel turns `<Greeting name="Taylor" />` into `createElement(Greeting, { name: 'Taylor' })`.
  3. That returns a tiny object: a `type`, some `props`, a `key`, a `ref`.
  4. `type` is your component function, or a string like `'view'` for built-in tags.
  5. `key` and `ref` get pulled out; they are *not* inside props.
  6. Creating this object draws nothing. It's a description, like a recipe, not the meal.
  7. React freezes it in dev. Elements are immutable; don't mutate `props`.
  8. Your whole UI is just a tree of these little objects.
  9. Next: how React turns that tree into real views.
- **You'll use this when…** passing elements as props, building a `children` helper, or reading a React DevTools dump.
- **Gotcha / myth:** "A component instance is created when I write `<Foo />`." No; only the element object is created. The component function runs later, during render.
- **Sources:**
  - https://react.dev/reference/react/createElement (returned object shape; immutability; lowercase tag rule)

### 6. `render-vs-commit`
- **Series:** React Under the Hood
- **Title:** Render Is Not Commit
- **Hook:** "React calls your component but doesn't touch the screen. Yet."
- **Core idea:** A React update has three steps: trigger (initial render or setState), render (React calls your components and computes a new element tree, pure, no side effects), and commit (React applies "the minimal necessary operations" to the host tree). The screen only changes in commit.
- **Example:**
  ```jsx
  function Clock({ time }) {
    return (
      <>
        <h1>{time}</h1>
        <input />   {/* keeps your typed text across ticks */}
      </>
    );
  }
  ```
  Each second only the `<h1>` text node is updated; the `<input>` is left alone because it sits in the same place in the tree.
- **Visual:** Three-lane timeline: TRIGGER → RENDER → COMMIT. In RENDER, component boxes light up and a virtual tree builds in memory (screen untouched). In COMMIT, only the changed `h1` node flashes on the phone; the input keeps its text.
- **Narration beats:**
  1. Here's the single most useful React mental model.
  2. Step one, trigger: first mount, or someone called a setter.
  3. Step two, render. React calls your component function. That's all "render" means.
  4. It recurses down, building a new tree of element objects in memory.
  5. Nothing on screen changes during render. It's a pure calculation.
  6. Step three, commit. React compares the new tree to the last one and applies only the differences.
  7. In the clock example, only the h1 text changes every second.
  8. The input next to it keeps what you typed, because React never recreated it.
  9. After commit, the platform paints.
  10. Rule from this: anything in render must be pure. Side effects wait for commit.
- **You'll use this when…** wondering why a `console.log` in the body runs twice (Strict Mode), or why DOM reads in render are wrong.
- **Gotcha / myth:** "Re-render means the screen redrew." Re-render means your function ran; the screen only changes if commit finds a diff.
- **Sources:**
  - https://react.dev/learn/render-and-commit (trigger/render/commit; "minimal necessary operations"; Clock example)

### 7. `keys-and-reconciliation`
- **Series:** React Under the Hood
- **Title:** Why Keys Fix That Bug
- **Hook:** "Delete row one and row two's text moved. Classic key bug."
- **Core idea:** During reconciliation React matches old and new children by position unless you give a `key`; with index keys, deleting an item shifts every later item onto the wrong old instance, so state (like a text input) sticks to the wrong row. Keys are like file names: they identify an item even when its position changes.
- **Example (the bug):**
  ```jsx
  // BUG: index as key
  {todos.map((t, i) => <Row key={i} todo={t} />)}
  // Row has <TextInput /> inside. Delete todos[0]:
  // Row key=0 stays mounted but now shows todos[1] → typed text "jumps" up.

  // FIX: stable identity
  {todos.map(t => <Row key={t.id} todo={t} />)}
  ```
- **Visual:** Two columns of rows with typed text in each input. Left (index keys): delete top row, watch text slide into the wrong rows. Right (`t.id` keys): delete top row, the correct row disappears and the rest are untouched. Arrows show which old instance matched which new element.
- **Narration beats:**
  1. You've hit this bug. You just didn't know why.
  2. On every render, React has to match new list items to old ones.
  3. With no key, it matches by position. First to first, second to second.
  4. Delete item one. Now the old "first" instance gets item two's data.
  5. Any state inside, like a TextInput, stays with the instance. So the text looks like it moved.
  6. Keys are names. React matches by name instead of position.
  7. Use a stable id from your data. Not the index, not Math.random().
  8. Math.random remounts every row every render and wipes input.
  9. Keys only need to be unique among siblings, and they must not change.
  10. Same rule on web and on native. It's a React thing, not a DOM thing.
- **You'll use this when…** lists with inputs, animated rows, or "why does my checkbox state swap?"
- **Gotcha / myth:** "Keys are only for silencing the warning." They decide which component instance keeps its state.
- **Sources:**
  - https://react.dev/learn/rendering-lists (why keys; index/random keys "subtle and confusing bugs"; uniqueness and stability rules)
  - https://react.dev/learn/render-and-commit (matching by position; input preserved when in the same place)

### 8. `fiber-work-units`
- **Series:** React Under the Hood
- **Title:** Fiber: React's Pausable Loop
- **Hook:** "React can pause rendering mid-tree. That's what Fiber is."
- **Core idea:** A fiber is a plain object per component instance (a "virtual stack frame") with `child`, `sibling`, and `return` pointers, so React walks the tree as a linked list instead of recursion. Because the work lives in memory, React can pause, prioritize, reuse, or abort it; there's a `current` tree and a `workInProgress` tree linked by `alternate`.
- **Example (shape, from the Fiber architecture notes):**
  ```ts
  type Fiber = {
    type: Function | string;  // Greeting, or 'view'
    key: string | null;
    child: Fiber | null;      // first child
    sibling: Fiber | null;    // next brother/sister
    return: Fiber | null;     // parent ("where to go back to")
    memoizedProps: any;       // props from the last completed render
    alternate: Fiber | null;  // the other tree's version of me
  };
  ```
- **Visual:** Element tree redrawn as a linked list: down arrows (`child`), right arrows (`sibling`), up arrows (`return`). A cursor walks it; midway a "high priority tap" badge appears, the cursor pauses, a second tree (work-in-progress, dashed) is shown beside the solid `current` tree.
- **Narration beats:**
  1. Old React rendered with recursion. Once it started, it couldn't stop. Big tree, frozen UI.
  2. Fiber rewrote the engine so each component is a "unit of work": a small object called a fiber.
  3. Fibers link up: child, sibling, return. A tree you can walk with a loop.
  4. Because it's a loop, React can stop after any fiber and come back later.
  5. That's the superpower: pause, give priority to a tap, resume, or throw the work away.
  6. There are two trees. `current` is what's on screen. `workInProgress` is the draft.
  7. Each fiber points to its twin through `alternate`.
  8. When the draft finishes, React swaps the pointer. That swap is the commit.
  9. If props didn't change, React can reuse the old output and skip the fiber.
  10. Everything after this reel, hooks, batching, transitions, sits on these objects.
- **You'll use this when…** reading profiler flame charts, understanding why interrupted renders discard work, or why `startTransition` exists.
- **Gotcha / myth:** "Fiber made React faster at rendering." It made rendering *schedulable*; the goal is responsiveness, not raw speed.
- **Sources:**
  - https://github.com/acdlite/react-fiber-architecture (unit of work; type/key/child/sibling/return/pendingProps/memoizedProps/alternate; goals; current vs work-in-progress)

### 9. `where-hook-state-lives`
- **Series:** React Under the Hood
- **Title:** Hooks Are A Linked List
- **Hook:** "Your useState lives on the fiber, in call order. That's it."
- **Core idea:** React's source says "Hooks are stored as a linked list on the fiber's memoizedState field." On every render React walks that list in the same order your hooks are called, so a hook inside an `if` shifts every later hook onto the wrong slot. That is the entire reason the Rules of Hooks exist.
- **Example:**
  ```jsx
  function Profile({ user }) {
    const [name, setName] = useState('');      // hook #1
    if (user.isAdmin) {
      const [role, setRole] = useState('admin'); // sometimes hook #2 ❌
    }
    const [bio, setBio] = useState('');        // hook #2 or #3 → wrong slot
    // React: "Rendered fewer hooks than expected..." or bio gets 'admin'
  }
  ```
- **Visual:** A fiber box with `memoizedState →` pointing to a chain of nodes `[name] → [role] → [bio]`. On re-render with `isAdmin=false` the cursor walks `[name] → [bio?]` but lands on the `[role]` node; node turns red and the error string appears.
- **Narration beats:**
  1. Ever wonder where `useState` keeps its value? Your function finishes and forgets everything.
  2. The value is stored on the fiber, that object from last reel.
  3. Each hook call is a node in a linked list hanging off `memoizedState`.
  4. First render: React appends a node per hook call. Node one, node two, node three.
  5. Next render: it walks the same list, handing you node one, then node two.
  6. It never checks names. It only counts.
  7. So put a hook in an `if`, and when the `if` flips, the count shifts.
  8. Your bio state suddenly reads the role slot. Or React throws "rendered fewer hooks than expected."
  9. That's why: top level only, same order every time, only in components and custom hooks.
  10. The lint rule isn't being picky. It's protecting a counter.
- **You'll use this when…** tempted by an early return before a hook, or debugging a "hooks order changed" crash.
- **Gotcha / myth:** "Custom hooks are special." They're plain functions whose hook calls are appended to the *caller's* list; that's why they must follow the same rules.
- **Sources:**
  - https://react.dev/reference/rules/rules-of-hooks (rules; what's not allowed)
  - https://raw.githubusercontent.com/facebook/react/main/packages/react-reconciler/src/ReactFiberHooks.js (comment "Hooks are stored as a linked list on the fiber's memoizedState field"; Hook type `{memoizedState, baseState, baseQueue, queue, next}`; errors "Rendered more hooks than during the previous render" / "Rendered fewer hooks than expected")

### 10. `state-is-a-snapshot`
- **Series:** React Under the Hood
- **Title:** Why +3 Only Adds 1
- **Hook:** "Call setNumber three times. You get one. Not three."
- **Core idea:** A state variable's value never changes within a render; `number` is a snapshot fixed for that render, so three `setNumber(number + 1)` calls all queue "set to 1". React batches all setter calls in the event handler and renders once; updater functions (`n => n + 1`) run in a queue, each receiving the previous result.
- **Example:**
  ```jsx
  const [number, setNumber] = useState(0);
  <button onClick={() => {
    setNumber(number + 1);  // queue: replace with 1
    setNumber(number + 1);  // queue: replace with 1
    setNumber(number + 1);  // queue: replace with 1  → result 1
    // fix: setNumber(n => n + 1) ×3  → 0→1→2→3
  }}>+3</button>
  ```
- **Visual:** The handler with `number` replaced inline by `0` (substitution animation). A queue column fills with three "replace with 1" cards; the renderer processes once → `1`. Then the updater version: cards `n→n+1`, a table `n=0→1, 1→2, 2→3`.
- **Narration beats:**
  1. Classic interview question, and a real bug in a lot of apps.
  2. `number` is not a live variable. It's a snapshot taken when this render ran.
  3. In that render, number was zero. So all three calls say "make it zero plus one."
  4. React also doesn't re-render between them. It waits until your handler finishes.
  5. That's batching. One render, not three. Like a waiter taking the full order first.
  6. Then it processes the queue: set to 1, set to 1, set to 1. Final answer: 1.
  7. Want each call to see the last one? Pass a function.
  8. `n => n + 1` gets the previous queued value. Zero, then one, then two. Result: three.
  9. Same reason a `setTimeout` reads the old value: the snapshot it closed over.
  10. Snapshot plus batching explains ninety percent of "React is weird" moments.
- **You'll use this when…** incrementing counters, toggling in loops, or reading state inside async callbacks.
- **Gotcha / myth:** "Batching only happens in event handlers." Since React 18, updates in timeouts and promises are batched too; the snapshot rule still holds regardless.
- **Sources:**
  - https://react.dev/learn/state-as-a-snapshot (+3 example; "A state variable's value never changes within a render")
  - https://react.dev/learn/queueing-a-series-of-state-updates (batching; updater queue table)

### 11. `effect-timing`
- **Series:** React Under the Hood
- **Title:** useEffect vs useLayoutEffect
- **Hook:** "Your tooltip flickers because useEffect runs after paint."
- **Core idea:** Both run after commit, but `useLayoutEffect` fires before the screen repaints (and any state it sets is applied before paint), while `useEffect` generally lets the screen update first. Measuring layout and immediately repositioning belongs in `useLayoutEffect`; everything else in `useEffect` because layout effects block painting.
- **Example:**
  ```jsx
  const [h, setH] = useState(0);
  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    setH(height);          // re-render happens BEFORE user sees h=0
  }, []);
  // In RN New Architecture the same idea works with
  // ref.current?.measureInWindow(...) inside useLayoutEffect.
  ```
- **Visual:** Timeline: RENDER → COMMIT → [useLayoutEffect] → PAINT → [useEffect]. Phone shows a tooltip: with `useEffect` it pops at the wrong spot for one frame then jumps; with `useLayoutEffect` it appears already positioned.
- **Narration beats:**
  1. Two hooks, same signature, one frame of difference. That frame is the flicker.
  2. After React commits changes, the platform wants to paint.
  3. `useEffect` usually lets that paint happen first, then runs your code.
  4. `useLayoutEffect` runs before the paint, and any setState inside is also applied before paint.
  5. So: measure the tooltip, set its height, re-render, all before the user sees anything.
  6. With plain `useEffect` the user briefly sees the zero-height version. That's the flicker.
  7. Cost: layout effects block painting. Heavy work there slows the whole app.
  8. Default to `useEffect`. Reach for layout effect only when you measure and adjust.
  9. One subtlety: if an effect was caused by a click, React may run even `useEffect` before paint, so the event system can see the result.
  10. On React Native's new renderer, synchronous measurement inside `useLayoutEffect` is exactly why "no layout jump" is now possible.
- **You'll use this when…** tooltips, popovers, auto-scroll-to-bottom, measuring before showing.
- **Gotcha / myth:** "useEffect always runs after paint." Only *generally*; interaction-triggered effects may run before paint.
- **Sources:**
  - https://react.dev/reference/react/useLayoutEffect (fires before repaint; tooltip example; performance caveat)
  - https://react.dev/reference/react/useEffect ("React will generally let the browser paint the updated screen first"; interaction exception)
  - https://reactnative.dev/architecture/landing-page (synchronous `useLayoutEffect` + `measureInWindow` example)

### 12. `memo-and-the-compiler`
- **Series:** React Under the Hood
- **Title:** The Compiler Writes Your Memo
- **Hook:** "React Compiler deletes your useMemo. And it's right."
- **Core idea:** `memo`, `useMemo`, and `useCallback` all do one thing: keep a reference stable so a shallow `Object.is` comparison says "unchanged" and work is skipped. React Compiler is a Babel plugin that inserts the equivalent memoization automatically, so with it you can remove manual `React.memo`.
- **Example:**
  ```jsx
  // Before: child re-renders every time because {} is new each render
  const Child = memo(function Child({ style }) { /* ... */ });
  <Child style={{ padding: 8 }} />          // memo defeated: new object
  const style = useMemo(() => ({ padding: 8 }), []);  // manual fix

  // babel.config.js with the compiler:
  plugins: ['babel-plugin-react-compiler' /* must run first */]
  ```
- **Visual:** Parent re-renders; a `Child` box flashes red each time. Add `useMemo` → flashes stop. Then wipe the `useMemo`, drop in the compiler plugin line, and show the compiled output doing the caching for you (greyed auto-generated code).
- **Narration beats:**
  1. Let's end the memo religion.
  2. `memo` means: if my props look the same, skip me.
  3. "Look the same" is a shallow check with `Object.is`. New object? Different. Even if the content matches.
  4. That's why an inline style object defeats memo every single render.
  5. `useMemo` and `useCallback` just keep a reference stable so the check passes.
  6. The React Compiler does that for you. It's a Babel plugin, `babel-plugin-react-compiler`, and it must run first in your pipeline.
  7. It reads your component and inserts the caching where it's safe.
  8. The docs say it: with the compiler, you can safely remove `React.memo`.
  9. Works best on React 19; 17 and 18 work with a target setting.
  10. Memoization is a performance optimization, not a guarantee. Measure first, memo second.
- **You'll use this when…** a list row re-renders on every keystroke, or deciding whether to adopt the compiler.
- **Gotcha / myth:** "useMemo makes things faster." It trades CPU for memory and a comparison; cheap values are often slower with it.
- **Sources:**
  - https://react.dev/reference/react/memo (shallow `Object.is`; "not a guarantee"; compiler makes `React.memo` removable)
  - https://react.dev/learn/react-compiler (automatic memoization)
  - https://react.dev/learn/react-compiler/installation (`babel-plugin-react-compiler`, must run first; React 19 / 17-18 with target)

### 13. `concurrent-transitions-suspense`
- **Series:** React Under the Hood
- **Title:** Transitions: Interruptible Renders
- **Hook:** "Typing stayed smooth while React rebuilt a 5,000-row list."
- **Core idea:** `startTransition` marks an update as low priority so React renders it in the background and lets urgent updates (typing, taps) interrupt and restart it; the Fiber loop makes that possible. Inside a transition, Suspense keeps already-shown content on screen instead of flashing the fallback.
- **Example:**
  ```jsx
  const [isPending, startTransition] = useTransition();
  function selectTab(next) {
    startTransition(() => setTab(next));  // low priority, interruptible
  }
  <Suspense fallback={<Spinner />}>
    <TabPanel tab={tab} />                 // old tab stays visible while new loads
  </Suspense>
  ```
- **Visual:** Two lanes. "Urgent" lane: keystrokes land instantly. "Transition" lane: a big list render bar starts, gets cut by a keystroke, restarts. Then a tab switch: content stays, a small pending state dims it, no spinner flash.
- **Narration beats:**
  1. Remember Fiber can pause? This is the API that uses it.
  2. Wrap a slow state update in `startTransition`.
  3. React treats it as background work. It's non-blocking.
  4. If you type while it's rendering, React handles the keystroke first and restarts the slow work.
  5. `isPending` tells you it's still cooking, so you can dim the old UI.
  6. Now Suspense. A boundary shows a fallback until its children are ready.
  7. Normally, switching to content that isn't loaded shows the spinner.
  8. Inside a transition, React keeps the old content visible until the new one is ready.
  9. Suspense only triggers for `lazy`, `use`, and Suspense-aware data libraries. Not a fetch in `useEffect`.
  10. React Native's new renderer supports all of this, same as web.
- **You'll use this when…** search filtering, tab switches, heavy chart re-renders, route changes.
- **Gotcha / myth:** "Transitions make rendering faster." They make it interruptible; total work is the same or more.
- **Sources:**
  - https://react.dev/reference/react/useTransition (non-blocking; interrupted by other updates; tab example; async Actions)
  - https://react.dev/reference/react/Suspense (fallback; what activates it; transitions avoid hiding shown content)
  - https://reactnative.dev/architecture/landing-page (concurrent renderer: Suspense, Transitions supported in RN)

---

## Series 3: React Native Internals (9 reels)

### 14. `rn-threads`
- **Series:** React Native Internals
- **Title:** Three Threads, One Frame
- **Hook:** "A 200ms re-render drops twelve frames. Here's why."
- **Core idea:** Your React code runs on the JS thread; only the UI (main) thread can touch native views; layout and commit of the shadow tree happen on a background thread. At 60fps each frame is 16.67ms, so a busy JS thread freezes JS-driven animations and touches, while native scrolling keeps going.
- **Example (scenario):**
  ```jsx
  function onPress() {
    const rows = buildHugeReport();   // 200ms sync work on JS thread
    setRows(rows);
  }
  // Tap feedback is delayed; a JS-driven animation freezes.
  // A native ScrollView on screen keeps scrolling, because that's on the UI thread.
  ```
- **Visual:** Three horizontal lanes labeled JS, Background (layout), UI/main. A frame grid of 16.67ms ticks. A long red block on JS spans ~12 ticks; the UI lane keeps a scroll gesture moving; a "touch" dot waits on the JS lane until the block ends.
- **Narration beats:**
  1. Smooth means 60 frames a second. That's 16.67 milliseconds per frame.
  2. React Native splits work across threads.
  3. JS thread: your components, your handlers, your API calls.
  4. UI thread, also called main: the only one allowed to touch real views.
  5. Background thread: layout math and committing the shadow tree, so the UI thread stays free.
  6. Block the JS thread for 200ms and about twelve frames are gone.
  7. Taps feel dead, because touch handling waits for JS. JS-driven animations freeze.
  8. But a native ScrollView keeps scrolling. It never asked JS.
  9. The game: keep JS light, push animation and scrolling to the UI side.
  10. Every reel after this is about who runs where.
- **You'll use this when…** profiling jank, choosing between JS animation and native-driven, or batching heavy work.
- **Gotcha / myth:** "Dev build performance is representative." Docs: in dev mode "JavaScript thread performance suffers greatly." Measure in release.
- **Sources:**
  - https://reactnative.dev/docs/performance (16.67ms; 200ms → ~12 frames; JS vs UI thread examples; dev mode caveat)
  - https://reactnative.dev/architecture/threading-model (UI thread "the only thread that can manipulate host views"; JS thread runs render phase)
  - https://reactnative.dev/architecture/render-pipeline (commit/layout on a background thread)

### 15. `bridge-vs-jsi`
- **Series:** React Native Internals
- **Title:** Bridge vs JSI
- **Hook:** "Old React Native talked to native by sending JSON strings."
- **Core idea:** The original bridge was "asynchronous, serializable, and batched": every call was turned into a JSON message like `[["createView", attrs]]`, queued, and processed later, so JS could never get a synchronous answer and large data was copied. JSI replaces that with a C++ interface where JS and native hold direct references to each other's objects and call methods without serialization.
- **Example:**
  ```js
  // Old bridge (conceptually): JSON over a queue, async only
  // → [["UIManager", "createView", [tag, "RCTView", props]]]
  NativeModules.Foo.getValue((v) => use(v));   // callback or promise only

  // JSI (New Architecture): direct, can be synchronous
  const value = nativeModule.getValue();        // returns immediately
  ```
- **Visual:** Left: JS box and Native box with a conveyor belt between them; objects get flattened into JSON strings, queued, then re-inflated. Right: same boxes sharing a C++ layer; JS holds a pointer straight into a native object; arrow is bidirectional and instant.
- **Narration beats:**
  1. For years, every tap, every view, every native call went through one bridge.
  2. The bridge had three rules: asynchronous, serializable, batched.
  3. Serializable meant: turn your data into JSON text. Then parse it on the other side.
  4. Asynchronous meant: you could never just ask native a question and get an answer now.
  5. Batched meant calls were queued up and flushed together.
  6. Great for debugging over a WebSocket. Terrible for a camera feeding frames.
  7. JSI is a thin C++ layer. JS can hold a reference to a native object and call its methods directly.
  8. No JSON. No copy. Synchronous when you want it.
  9. The docs' example: VisionCamera pushes about 2 GB per second of frame data through it.
  10. Since 0.82 there's no bridge to fall back to. JSI is the only road.
- **You'll use this when…** reading library docs that say "JSI-based", or understanding why a native call can now be sync.
- **Gotcha / myth:** "JSI is faster, so make everything synchronous." Sync calls block the JS thread; use sync only when the answer is needed immediately.
- **Sources:**
  - https://reactnative.dev/blog/2018/06/14/state-of-react-native-2018 ("asynchronous, serializable, and batched"; JSON mutation lists; downsides)
  - https://reactnative.dev/architecture/fabric-renderer ("React used to transfer data ... as serialized JSON"; JSI accesses values directly)
  - https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here (bridge serialization bottleneck; sync `nativeModule.getValue()` example)
  - https://reactnative.dev/architecture/landing-page (JSI "directly invoke methods without serialization costs"; VisionCamera ~2 GB/s)
  - https://reactnative.dev/blog/2025/10/08/react-native-0.82 (New Architecture only; opt-out flags ignored)

### 16. `fabric-render-pipeline`
- **Series:** React Native Internals
- **Title:** Fabric: Render, Commit, Mount
- **Hook:** "Your View exists three times before it hits the screen."
- **Core idea:** Fabric turns the React element tree into a C++ shadow tree (one shadow node per host component), runs Yoga flexbox layout on it during commit on a background thread, then on the UI thread diffs the new tree against the last mounted one and applies only mutations like `createView` / `updateView` / `removeView` to real host views.
- **Example:**
  ```jsx
  <View style={{ backgroundColor: 'red' }} />
  // Render:  React element  →  C++ ViewShadowNode (immutable)
  // Commit:  Yoga computes x/y/width/height  (background thread)
  // Mount:   diff → UpdateView(node3, { backgroundColor: 'yellow' })
  //          applied to UIView / ViewGroup on the UI thread
  ```
- **Visual:** Three stacked trees sliding left to right: Element tree (JS) → Shadow tree (C++, each node gets a layout rect stamped on it) → Host view tree (phone). A color change on one node produces a single `UpdateView` card flying to the phone.
- **Narration beats:**
  1. Fabric is the renderer. Three phases, three trees.
  2. Render: React produces elements. For each host element, Fabric creates a C++ shadow node, right then, on the JS thread.
  3. Shadow nodes are immutable. Updates clone, never mutate. That's how threads stay safe.
  4. Commit: Yoga, the C++ flexbox engine, walks the shadow tree and computes every position and size.
  5. This happens on a background thread. The UI thread isn't waiting.
  6. Text nodes call out to the platform to be measured. Everything else is pure math.
  7. Mount, on the UI thread: diff the new tree against the one on screen.
  8. The diff spits out tiny mutations: create view, update view, remove view.
  9. Change red to yellow? One UpdateView. Nothing else is touched.
  10. Fabric also flattens views here, dropping wrappers that only affect layout.
- **You'll use this when…** reading Perfetto/Instruments traces, understanding "view flattening", or why layout is now synchronous-capable.
- **Gotcha / myth:** "Composite components become native views." Only host components (`View`, `Text`, …) get shadow nodes; `<MyCard>` has none.
- **Sources:**
  - https://reactnative.dev/architecture/render-pipeline (render/commit/mount; shadow nodes; Yoga in commit; mount diff mutations; view flattening)
  - https://reactnative.dev/architecture/fabric-renderer (motivations: sync layout, JSI, shared C++ core, codegen type safety)
  - https://www.yogalayout.dev/docs/about-yoga (Yoga: C++ layout engine implementing a Flexbox subset)

### 17. `turbomodules-codegen`
- **Series:** React Native Internals
- **Title:** TurboModules & Codegen
- **Hook:** "Your TypeScript interface generates the C++ glue code."
- **Core idea:** A Turbo Native Module starts as a typed spec file; at build time Codegen reads it and generates C++ JSI bindings plus a Java/Kotlin interface and an Objective-C++ protocol; you implement that generated interface in native code and register it. Modules are loaded lazily and called through JSI, no bridge.
- **Example (from the RN docs):**
  ```ts
  // specs/NativeLocalStorage.ts   (file name must start with Native)
  import type { TurboModule } from 'react-native';
  import { TurboModuleRegistry } from 'react-native';
  export interface Spec extends TurboModule {
    setItem(value: string, key: string): void;
    getItem(key: string): string | null;
  }
  export default TurboModuleRegistry.getEnforcing<Spec>('NativeLocalStorage');
  ```
- **Visual:** Pipeline: `NativeLocalStorage.ts` → gear labeled "Codegen (runs on every build)" → three outputs fan out: `NativeLocalStorageSpecJSI` (C++), `NativeLocalStorageSpec` (Java/Kotlin abstract class), `<NativeLocalStorageSpec>` (ObjC protocol). Then your Kotlin class and `.mm` class slot into them.
- **Narration beats:**
  1. Here's how a TypeScript file becomes a Kotlin class.
  2. Step one: write a spec. An interface that extends `TurboModule`.
  3. Export it with `TurboModuleRegistry.getEnforcing`. That throws if native forgot to register.
  4. Step two: `codegenConfig` in package.json says "my specs live in this folder."
  5. Step three: build the app. Codegen runs automatically on every iOS and Android build.
  6. It writes the C++ JSI glue, a Kotlin abstract class, and an ObjC protocol. Same names, same types.
  7. Step four: you fill in the blanks. Kotlin extends the generated spec. ObjC++ conforms to the protocol.
  8. Register it: a package on Android, a `modulesProvider` entry on iOS.
  9. Now `NativeLocalStorage.getItem('k')` in JS calls your Kotlin method through C++. No JSON, no queue.
  10. Type safety across the boundary is the whole point. Change the spec, native stops compiling.
- **You'll use this when…** wrapping an SDK, reading a library's `codegenConfig`, or debugging "module not registered".
- **Gotcha / myth:** "I can write the iOS side in Swift straight from the docs." The current RN docs show Objective-C++ (`.mm`) and Kotlin/Java; a Swift implementation isn't documented on that page.
- **Sources:**
  - https://reactnative.dev/docs/turbo-native-modules-introduction (spec; `codegenConfig`; generated `NativeLocalStorageSpec`; Kotlin + ObjC++ implementations; `getTurboModule` returning `NativeLocalStorageSpecJSI`)
  - https://reactnative.dev/docs/the-new-architecture/what-is-codegen (C++ glue + Java + ObjC++; runs on every build)
  - https://reactnative.dev/docs/the-new-architecture/pure-cxx-modules (C++ modules; `jsi::Runtime&`)

### 18. `hermes-bytecode`
- **Series:** React Native Internals
- **Title:** Hermes Skips Parsing JavaScript
- **Hook:** "Your release app never parses JavaScript. It's already bytecode."
- **Core idea:** Hermes is RN's bundled JS engine; in release builds the Metro bundle is compiled ahead of time into a `.hbc` bytecode file, so startup skips parse and compile. Hermes V1 (default since RN 0.84, opt-in since 0.82) is an improved compiler and VM; it does *not* yet include JS-to-native compilation ("Static Hermes") or JIT.
- **Example:**
  ```js
  // Is Hermes running?
  const isHermes = () => !!global.HermesInternal;
  // Release build precompiles to .hbc:
  //   npm run android -- --mode="release"
  //   npm run ios -- --mode="Release"
  // Opt out of V1 (Android): hermesV1Enabled=false  in gradle.properties
  ```
- **Visual:** Two startup timelines. "Text JS engine": download bundle → parse → compile → run. "Hermes release": load `.hbc` → run. The parse and compile blocks are deleted. A badge "V1 default in 0.84".
- **Narration beats:**
  1. Fast startup trick most people never see: don't parse JavaScript on the phone at all.
  2. Hermes is the engine bundled with React Native. Every RN release ships a matching Hermes.
  3. In release builds, your bundle is compiled to Hermes bytecode at build time. A `.hbc` file.
  4. The phone loads bytecode and starts running. No parse step, no compile step.
  5. Less startup time, less memory, smaller app. Those are the three Hermes goals.
  6. Check it: `global.HermesInternal` exists when Hermes is running.
  7. Hermes V1 is the next version of the engine: new compiler, new VM.
  8. Expensify measured a few percent to under ten percent faster bundle load and TTI. Your numbers will differ.
  9. V1 became the default in 0.84. If you were on Hermes, you got it for free.
  10. Not in V1 yet: compiling JS to native code, or a JIT. That's still future work.
- **You'll use this when…** chasing cold-start time, reading a crash with Hermes stack frames, or deciding on an engine override.
- **Gotcha / myth:** "`HermesInternal` exists, so I'm using bytecode." Not necessarily; if you load the bundle in a non-standard way the engine can run plain JS. Check for the `.hbc` file.
- **Sources:**
  - https://reactnative.dev/docs/hermes (bundled per release; `.hbc` in release; benefits; `HermesInternal` check and caveat)
  - https://reactnative.dev/blog/2025/10/08/react-native-0.82 (Hermes V1 opt-in; no Static Hermes/JIT yet; Expensify numbers)
  - https://reactnative.dev/blog/2026/02/11/react-native-0.84 (V1 default; opt-out flags; React 19.2.3)

### 19. `js-to-kotlin-call-path`
- **Series:** React Native Internals
- **Title:** One JS Call, Step By Step
- **Hook:** "Trace `getItem('token')` from JavaScript all the way to Kotlin."
- **Core idea:** Calling a TurboModule method from JS invokes a JSI host function; the generated C++ spec class converts JSI values to native types and calls your Kotlin/ObjC++ method; the return value is converted back into a `jsi::Value` and handed to JS. Synchronous methods block the JS thread for the duration; promises resolve back on the JS thread.
- **Example:**
  ```ts
  // JS
  const token = NativeLocalStorage.getItem('token');   // sync, returns string | null
  ```
  ```kotlin
  // Android (generated base class from Codegen)
  class NativeLocalStorageModule(ctx: ReactApplicationContext)
    : NativeLocalStorageSpec(ctx) {
    override fun getItem(key: String): String? =
      ctx.getSharedPreferences("local", MODE_PRIVATE).getString(key, null)
  }
  ```
- **Visual:** Vertical call stack animation: `JS: getItem('token')` → `JSI host function` → `C++ NativeLocalStorageSpecJSI` → `Kotlin getItem()` → `SharedPreferences` → values bubble back up as the stack unwinds; each hop labeled with the thread it runs on (JS thread throughout for a sync call).
- **Narration beats:**
  1. Let's follow one call across the border.
  2. In JS you call `NativeLocalStorage.getItem('token')`.
  3. That object isn't a plain JS object. It's a JSI host object backed by C++.
  4. Calling the method lands in the generated C++ spec class.
  5. C++ converts the JSI string into a real Kotlin string, or an NSString on iOS.
  6. It calls your `getItem`, the method you wrote against the generated base class.
  7. Kotlin reads SharedPreferences and returns.
  8. C++ wraps the result back into a `jsi::Value`. JS gets a string.
  9. The whole thing was synchronous, so the JS thread waited. Keep sync methods tiny.
  10. Return a Promise from the spec and the call becomes async; the result comes back on the JS thread later.
- **You'll use this when…** writing your first native module, or deciding sync vs promise in a spec.
- **Gotcha / myth:** "Native calls are free now." They skip serialization, but a sync call still occupies the JS thread; a heavy native method can jank just like heavy JS.
- **Sources:**
  - https://reactnative.dev/docs/turbo-native-modules-introduction (Kotlin extends `NativeLocalStorageSpec`; `getTurboModule` returns `NativeLocalStorageSpecJSI`; SharedPreferences / NSUserDefaults example)
  - https://reactnative.dev/blog/2024/10/23/the-new-architecture-is-here (synchronous `nativeModule.getValue()`)
  - https://reactnative.dev/docs/the-new-architecture/pure-cxx-modules (`jsi::Runtime&` in generated code)

### 20. `reanimated-worklets`
- **Series:** React Native Internals
- **Title:** Worklets Run On The UI Thread
- **Hook:** "This function runs on a thread your React code can't touch."
- **Core idea:** A worklet is a small JS function marked with `'worklet'` (or auto-marked, like `useAnimatedStyle` callbacks) that the Babel plugin serializes so it can be copied into a second JS runtime that runs on the UI thread. Shared values sync between the two runtimes, so animations keep moving even when the JS thread is busy; `scheduleOnRN` sends work back to React.
- **Example:**
  ```jsx
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({   // runs on the UI thread
    transform: [{ translateX: x.value }],
  }));
  const tap = Gesture.Tap().onEnd(() => {
    x.value = withSpring(200);              // worklet, no JS thread hop
    scheduleOnRN(trackEvent, 'tapped');    // back to React when needed
  });
  ```
- **Visual:** Two JS runtime boxes: "RN runtime (JS thread)" and "UI runtime (UI thread)". The `useAnimatedStyle` function gets serialized (turns into a packet) and copied into the UI box. A `x.value` dial sits between them, synced. A big red "JS busy" block appears on the left; the box on the right keeps animating.
- **Narration beats:**
  1. Reanimated's trick isn't clever math. It's running JavaScript somewhere else.
  2. React Native actually has room for a second JS runtime, and Reanimated puts one on the UI thread.
  3. A worklet is a function allowed to live there.
  4. The Babel plugin, now from `react-native-worklets`, serializes the function so it can be copied over.
  5. `useAnimatedStyle` callbacks get marked automatically. Your own helpers need the `'worklet'` directive.
  6. Shared values are the bridge: write `.value` on one side, the other side sees it.
  7. So a gesture updates `x.value`, the style worklet recomputes, the view moves. All on the UI thread.
  8. Block the JS thread with a huge render? The animation keeps going.
  9. Need to call React code, like analytics? `scheduleOnRN(fn, args)`. The old `runOnJS` is deprecated.
  10. Rule: anything touching React state or hooks stays on the RN side.
- **You'll use this when…** gestures, 60fps animations, or anything that must not stutter during heavy JS work.
- **Gotcha / myth:** "I can call `setState` inside a worklet." No; worklets run in a different runtime and must use `scheduleOnRN` to reach React.
- **Sources:**
  - https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/ (worklet; UI vs JS thread; shared values sync; `'worklet'` directive + Babel plugin; `useAnimatedStyle` auto-workletized)
  - https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/ (`runOnJS`→`scheduleOnRN`, `runOnUI`→`scheduleOnUI`; plugin from `react-native-worklets/plugin`)
  - https://docs.swmansion.com/react-native-worklets/docs/threading/scheduleOnRN/ (signature; RN runtime vs Worklet runtime scheduling)

### 21. `why-lists-jank-flashlist`
- **Series:** React Native Internals
- **Title:** FlashList Recycles, FlatList Mounts
- **Hook:** "FlatList creates a new row every scroll. FlashList reuses it."
- **Core idea:** Creating and laying out a fresh component for every item that scrolls in is the expensive part; FlashList keeps the item component alive when it scrolls off and re-renders the same instance with a new `item` prop. v2 is JS-only and New-Architecture-only because it relies on synchronous layout measurement, which is also why `estimatedItemSize` is gone.
- **Example:**
  ```jsx
  <FlashList data={msgs} renderItem={({ item }) => <Row item={item} />} />

  function Row({ item }) {
    // ❌ useState here leaks from the previous item this instance showed
    // ✅ resets when item.id changes, no extra render
    const [open, setOpen] = useRecyclingState(false, [item.id]);
  }
  ```
- **Visual:** Phone scrolling a list. FlatList lane: rows fall off the bottom and explode; new rows are built from scratch at the top (hammer icon, frame counter dips). FlashList lane: the same row box slides from bottom to top, its label swaps `item 7 → item 23`; frame counter stays flat. Then a toggled checkbox "survives" the swap to show the state gotcha.
- **Narration beats:**
  1. Lists jank for one boring reason: mounting components is expensive.
  2. FlatList, as you scroll, unmounts rows that leave and mounts new ones that enter.
  3. Each mount means running your component, creating shadow nodes, running layout, creating views.
  4. FlashList recycles. A row that scrolls off isn't destroyed.
  5. It's re-rendered with a different `item` prop and slides back in as a new row.
  6. Reusing an instance is far cheaper than building one.
  7. Catch: `useState` inside a row survives the swap. The old item's toggle shows on the new item.
  8. Fix: `useRecyclingState`, which resets when your dependency, like `item.id`, changes.
  9. v2 is pure JavaScript, no native code, and needs the New Architecture, because it measures layout synchronously.
  10. That's also why you no longer pass `estimatedItemSize`. It measures for real.
- **You'll use this when…** chat lists, feeds, anything over a few dozen rows with heavy cells.
- **Gotcha / myth:** "Any list is fine if I add `getItemLayout`." That helps FlatList, but recycling removes the mount cost entirely; keep row components cheap to re-render either way.
- **Sources:**
  - https://shopify.github.io/flash-list/docs/recycling (re-rendered with a different `item` prop; state leaks; `useRecyclingState`)
  - https://shopify.github.io/flash-list/docs/v2-changes (`estimatedItemSize` deprecated; masonry prop; `maintainVisibleContentPosition` default)
  - https://shopify.github.io/flash-list/docs/v2-migration/ ("v2 only works on top of React Native's new architecture")
  - https://shopify.engineering/flashlist-v2 (JS-only rewrite; relies on synchronous layout measurement)
  - https://reactnative.dev/docs/performance (large lists cause JS frame drops; FlashList recommended)

### 22. `new-arch-today`
- **Series:** React Native Internals
- **Title:** The Legacy Bridge Is Gone
- **Hook:** "Set newArchEnabled=false in RN 0.82. Nothing happens."
- **Core idea:** The New Architecture (JSI + Fabric + TurboModules + Codegen) was opt-in from 0.68, default in 0.76, the only option in 0.82, and in 0.84 the legacy code is no longer compiled into iOS builds and key Android legacy classes were deleted. Everything in this series is now the only way RN works, so library choice and mental models should assume it.
- **Example (scenario):**
  ```properties
  # android/gradle.properties on RN 0.82+
  newArchEnabled=false     # ignored: app still runs on the New Architecture
  hermesV1Enabled=false    # 0.84+: this one *does* opt out of Hermes V1
  ```
- **Visual:** A version timeline: 0.68 (opt-in toggle) → 0.76 (toggle default ON) → 0.82 (toggle removed, "New Architecture only") → 0.84 (legacy code block crumbles out of the iOS build; Hermes V1 badge). Side panel: four pillars JSI / Fabric / TurboModules / Codegen.
- **Narration beats:**
  1. Quick recap, and a reality check on what "React Native" means in 2026.
  2. New Architecture is four pieces: JSI for calls, Fabric for views, TurboModules for native code, Codegen for type safety.
  3. 0.68: you could turn it on. 0.76: on by default. 0.82: the switch is gone.
  4. Flip `newArchEnabled=false` on 0.82 and the app ignores you.
  5. 0.84 went further: legacy architecture code isn't even compiled into iOS builds anymore.
  6. Android dropped classes like `LazyReactPackage` and `BridgeDevSupportManager`.
  7. Same release, Hermes V1 became the default engine.
  8. So when a library says "works on old arch only", that's a library you can't use.
  9. And docs or tutorials showing `NativeModules.Foo` with callbacks are the legacy API. Look for TurboModule specs instead.
  10. Everything you learned in this series is the one and only pipeline now.
- **You'll use this when…** evaluating a dependency, upgrading an old app, or reading pre-2025 blog posts.
- **Gotcha / myth:** "Enabling New Architecture automatically makes my app faster." The docs explicitly caution it "may not immediately improve performance"; the win is sync layout, concurrency, and no serialization, which you have to use.
- **Sources:**
  - https://reactnative.dev/architecture/landing-page (opt-in from 0.68, default from 0.76; performance caveat)
  - https://reactnative.dev/blog/2025/10/08/react-native-0.82 (New Architecture only; flags ignored)
  - https://reactnative.dev/blog/2026/02/11/react-native-0.84 (legacy code removed from iOS builds; Android classes removed; Hermes V1 default; `hermesV1Enabled`)
  - https://reactnative.dev/blog/2025/12/10/react-native-0.83 (`RCT_REMOVE_LEGACY_ARCH=1` experiment)

---

## Claims left out or hedged (could not verify from an official page)

- The exact dev-server URL for the bundle (`index.bundle?platform=…`) was not found on a docs page fetched here; reel 4 says "downloads this file from Metro over HTTP" without naming the URL.
- React Compiler "1.0 stable, October 2025": the fetched react.dev pages do not state a version or release date, so no version number appears in reel 12.
- Swift implementation of Turbo Native Modules: the current docs page shows Objective-C++ and Kotlin/Java only; reel 17/19 use Kotlin and ObjC++ and flag Swift as undocumented there.
- A "Background thread" named explicitly in the threading-model page: the current page names only UI and JS threads; the render-pipeline page states commit runs "on a background thread", which is what reel 14/16 cite.
- Hermes V1 language/feature changes (ES classes, block scoping, etc.): the 0.82 and 0.84 posts only say "improvements in the compiler and VM"; no feature list is claimed.
- The old bridge's JSON format is cited from the 2018 blog; the 2024 "New Architecture is here" post says only "serialize", so reel 15 attributes JSON to the 2018 post and the Fabric renderer page.
- Automatic batching outside event handlers (React 18) is stated as a gotcha in reel 10 from general React 18 knowledge; the two react.dev pages fetched only cover handler batching.
