"""Authored curriculum. Build into a single offline HTML document with build.py."""
import textwrap

LESSONS=[]
QUESTION_COUNT=0
STAGES=[
 {'name':'Understand the journey','short':'Foundations','color':'#d6a05b','description':'Build a mental model before adding libraries.'},
 {'name':'Build the request layer','short':'Implementation','color':'#7cb69b','description':'Turn HTTP into predictable application behavior.'},
 {'name':'Protect and recover','short':'Trust & resilience','color':'#a69bd5','description':'Keep identities, writes, and retries safe.'},
 {'name':'Survive mobile reality','short':'Mobile systems','color':'#77acc8','description':'Design for lost connections and suspended processes.'},
 {'name':'See the whole system','short':'Observability','color':'#d18d87','description':'Connect user symptoms to useful evidence.'},
 {'name':'Ship with evidence','short':'Production','color':'#a2b776','description':'Test failures, control rollouts, and operate the app.'},
]

def q(prompt,correct,wrong1,wrong2,why):
 global QUESTION_COUNT
 i=QUESTION_COUNT;QUESTION_COUNT+=1
 options=[correct,wrong1,wrong2]
 shift=i%3
 options=options[shift:]+options[:shift]
 return {'id':f'q{i+1:03}','prompt':prompt,'options':options,'answer':options.index(correct),'why':why}

def add(id,stage,title,subtitle,minutes,objectives,body,questions,sources,exercise,lab=None):
 LESSONS.append({'id':id,'stage':stage,'title':title,'subtitle':subtitle,'minutes':minutes,'objectives':objectives,'body':textwrap.dedent(body).strip(),'questions':questions,'sources':sources,'exercise':exercise,'lab':lab})

add('mental-model',0,'A request is a journey','Follow one tap through the entire system.',25,
 ['Separate a user action from a network attempt.','Name the layers that can fail.','Describe the sample app you will build.'],r'''
 ## Start with a real app
 Imagine **Fieldcart**, a small shop app. A customer browses products, searches, signs in, saves a cart, places an order, uploads a photo, and watches delivery updates. They use an old Android phone on a train. The phone loses signal immediately after the customer taps “Place order.” This course follows that app from its first request to its first production incident.

 A **client** asks for something; a **server** processes the request. An **API** is the agreed interface between them: which requests exist, which data they accept, what they return, and what errors mean. Your React Native app is a client. It is never a trusted authority for prices, permissions, payment confirmation, or inventory.

 ## Trace the happy path
 1. A tap starts a user operation, such as “load catalog.”
 2. Your app may already have useful cached data. Otherwise, it schedules a request.
 3. A native networking stack resolves a hostname, opens or reuses a connection, and uses TLS for HTTPS.
 4. An edge proxy or gateway forwards the request. The API authenticates it, checks authorization, and may call other services or a database.
 5. Response bytes arrive. The app checks status, decodes and validates data, updates its cache, and renders a meaningful screen.
 6. Privacy-safe telemetry records enough evidence to diagnose slow or failed operations.

 **Latency** means elapsed time. **Throughput** means work completed per unit of time. **Reliability** means the operation does what the user expects under its stated conditions. A fast HTTP 200 containing the wrong cart is unreliable.

 ## One operation, several attempts
 An operation is the user's intent. An attempt is one actual network call. A retry creates another attempt. Cache hits can complete an operation without an attempt. One checkout may also involve several different requests. Keep these distinctions: they determine retry safety, UI state, and honest metrics.

 Distributed systems introduce an uncomfortable fact: **you can lose knowledge of the outcome**. If a server committed an order but its reply disappeared, the phone cannot infer failure from silence. You need an operation identity and a way to reconcile with the server. We will build that reasoning step by step.

 ## Your responsibilities
 Client work includes clear loading and error states, request deadlines, safe credential handling, cache isolation, offline recovery, and useful diagnostics. Server work includes authorization, durable writes, deduplication, validation, rate limits, and trace propagation. Production quality depends on their contract; a client library cannot provide all of it.

 **Course map:** learn the wire → build a request layer → protect identity → survive offline → observe the full journey → test and ship. You can open any lesson. For a beginner, follow the order and keep a small notebook of predictions before running each lab.

 This is a comprehensive practical foundation, not a promise that one course covers every protocol or regulatory environment. The core path uses TypeScript, React Native, HTTPS JSON APIs, and TanStack Query v5. Platform and vendor features are explicitly dated in the source library.
 ''',[
 q('The phone times out after placing an order. What do you know?','The outcome is unknown; reconcile using the same operation identity.','The server definitely rejected the order.','A second tap should create a fresh order identity.','The server may have committed before the response was lost. A timeout describes the client’s wait, not the server’s transaction outcome.'),
 q('A cached catalog appears with no HTTP call. What completed?','A user operation, with zero network attempts.','One successful HTTP attempt.','Nothing, because every screen needs a request.','Measure user-visible operations separately from transport attempts. A useful cache hit is a successful experience.'),
 q('Who must decide whether a user can access an order?','The server, on every relevant request.','The app, by hiding the order button.','The analytics service.','UI restrictions help users navigate but do not enforce security. A modified client can call an endpoint directly.')],['rn-networking','otel'],
 'Draw “tap → cache → native network → edge → API → database → response → screen.” Mark where each layer could fail, and where an order could have committed without the phone knowing.')

add('async',0,'Just enough JavaScript for networking','Promises, await, concurrency, and cleanup without the mystery.',30,
 ['Read async code without confusing waiting and blocking.','Choose sequential versus concurrent work.','Avoid stale responses and unhandled rejections.'],r'''
 ## A promise is a future result
 A **Promise** represents work that may succeed or fail later. `fetch()` returns a Promise for a response. `await` pauses that async function until the Promise settles; it does not freeze the whole JavaScript runtime. Other callbacks and rendering can continue. Large synchronous JSON processing can still occupy the JavaScript thread.

 ```ts
 async function loadCatalog() {
   try {
     const response = await fetch('https://api.example.com/products');
     if (!response.ok) throw new Error(`HTTP ${response.status}`);
     const data: unknown = await response.json();
     return data; // validate this unknown value before using it
   } catch (error) {
     throw error; // let the caller decide the UI behavior
   }
 }
 ```

 The `catch` above is deliberately redundant: remove it unless you actually classify, recover, or attach safe context. Catching an error and returning `[]` turns a broken API into a misleading empty shop. `finally` is useful for cleanup, such as clearing a deadline timer.

 ## Dependencies determine concurrency
 If request B needs an ID from request A, await A first. If two reads are independent, start them together with `Promise.all`. It rejects when one rejects but does **not** automatically cancel the other work. Use `Promise.allSettled` when partial results are useful, then inspect each result. Starting 500 requests at once can overwhelm a radio, a server, and memory: bound concurrency for bulk work.

 ```ts
 const [catalog, profile] = await Promise.all([
   loadCatalog(), loadProfile(),
 ]); // these operations are independent
 ```

 ## A late response can lie to the screen
 A user types `ca`, then `cart`. If the `ca` response arrives last, naive code replaces the newer results with old ones. Cancel obsolete work when possible and ensure results are associated with the input that created them. A query key containing the search term helps a query library separate those results. Cancellation saves resources; identity checks protect correctness even when cancellation arrives too late.

 React Effects synchronize with external systems. Dependencies must include the values used. Cleanup runs before a new effect setup and on unmount. React development Strict Mode may run an extra setup/cleanup cycle to find bugs. Production duplicates can also come from repeated taps or multiple mounted consumers, so do not dismiss every duplicate as Strict Mode.

 ```tsx
 useEffect(() => {
   let current = true;
   const controller = new AbortController();
   loadSearch(term, controller.signal).then(
     data => { if (current) setResults(data); },
     error => { if (current) setError(error); },
   );
   return () => { current = false; controller.abort(); };
 }, [term]);
 ```

 This illustrates the race guard, not a full data layer. A production screen should distinguish cancellation, errors, and stale useful data; later lessons use a query library for shared lifecycle behavior. Avoid making the Effect callback itself `async`, because React expects a cleanup function rather than a Promise.

 **Debouncing** waits for a quiet interval before starting work. **Throttling** limits how often work starts. Neither provides server deduplication. Avoid `.forEach(async ...)` when you need to await completion; use an explicit loop or a bounded worker pool.
 ''',[
 q('Does await fetch(...) block all JavaScript until the response arrives?','No; it pauses that async function while other work can run.','Yes; no UI work can run.','Only on iOS.','The network wait is asynchronous. CPU-heavy parsing or computation on the JS thread is a separate source of UI stalls.'),
 q('Promise.all rejects. Did it cancel all other requests?','No; cancellation needs explicit support and signals.','Yes, automatically.','Yes, but only for POST.','Promise aggregation does not own transport cancellation. Requests already started can continue and perform side effects.'),
 q('An old search response arrives after a newer one. What protects the UI?','Associate results with their query identity and discard obsolete results.','Render the last response received regardless of input.','Increase the timeout.','Arrival order is not intent order. Cancellation plus identity or query keys prevents stale data replacing current results.')],['fetch','react-effects'],
 'Write down the arrival order for searches “c”, “ca”, and “cat” with latencies 900, 600, and 100 ms. Explain why the oldest result may arrive last, then add cleanup or a query key.')

add('wire',0,'What happens on the wire','DNS, connections, TLS, HTTP versions, and the mobile radio.',30,
 ['Explain DNS, TLS, and connection reuse.','Separate server time from end-to-end latency.','Recognize what a JavaScript timer can and cannot measure.'],r'''
 ## Turn a URL into a connection
 In `https://api.example.com:443/products?limit=20`, `https` is the scheme, `api.example.com` the hostname, `443` the port, `/products` the path, and `limit=20` a query parameter. A fragment such as `#details` is not sent as part of the HTTP request target. Encode query values with a URL builder; string concatenation breaks on spaces, `&`, and non-English text.

 **DNS** maps a hostname to connection information such as IP addresses. A device may use cached records, IPv4, IPv6, a VPN, or a carrier DNS resolver. A DNS failure happens before an HTTP response exists. An IP allowlist or hardcoded address can break CDNs, failover, IPv6-only networks, and certificate validation. Keep hostnames and test realistic networks.

 For HTTP/1.1 and HTTP/2, the client commonly establishes TCP, an ordered reliable byte stream. **TLS** then authenticates the server through certificate and hostname validation and protects data in transit. HTTP/3 uses QUIC over UDP with TLS integrated. You usually let the native stack and server negotiate; setting an imaginary JavaScript “HTTP/3” switch does not upgrade a deployed system.

 ## Reuse changes the timing
 A cold request may pay for DNS, connection setup, and TLS. A warm request may reuse an existing connection. HTTP/2 multiplexes streams on a connection, reducing some connection overhead; it does not remove packet loss or all contention. HTTP/3 changes transport behavior but still depends on network and server support. Native stacks manage connection pools and negotiated protocol details.

 **TTFB**, time to first byte, includes more than backend execution: depending on the tool, it can include connection setup, queueing, transit, and waiting. Download time depends on payload size, bandwidth, and contention. **Bandwidth** is transfer capacity; **round-trip time** is the delay for a there-and-back exchange. Sending fewer bytes helps bandwidth; removing serial request waterfalls helps high round-trip latency.

 ## Mobile adds transitions
 A phone can move between Wi-Fi and cellular, pass through dead zones, or connect to a captive portal that requires a browser login. The OS may suspend the app. Radio activation and repeated small polling requests cost battery. An emulator on fast office Wi-Fi hides many of these effects.

 ## Measure the experience honestly
 A timer around `fetch` plus body reading gives an application-level duration. A timer around only `await fetch` commonly stops once headers are available, before the body has been consumed. Neither automatically exposes precise DNS, TCP, or TLS timings. Use native instrumentation or a compatible SDK when you need those details, and label unavailable phases as unknown rather than inventing them.

 The user's wait can continue after the response: JSON decoding, runtime validation, cache updates, image decoding, and rendering take time. Later, you will instrument `catalog.load` from user intent to useful content, with a child HTTP span. Do not subtract unsynchronized client and server wall-clock timestamps to estimate one-way network delay. Use monotonic clocks for local durations and explicit server timing for server phases.

 **Useful observation:** if server logs say 80 ms but the app took 2 seconds, inspect everything around the server: queueing, connection setup, retries, transfer, parsing, and rendering. Both measurements may be correct.
 ''',[
 q('The app has a DNS error. Which HTTP status should it have?','None; it failed before an HTTP response.','500, because every failure is HTTP.','404, because the hostname was missing.','A transport failure has no HTTP response status. Preserve that distinction in error types and metrics.'),
 q('A timer ends as soon as fetch resolves. What might still be pending?','Reading and processing the response body.','Nothing; the screen must already be rendered.','Only server authorization.','Fetch resolves with the response when headers are available; body consumption and rendering can take additional time.'),
 q('How should you obtain DNS/TLS timings in React Native?','Use supported native or SDK instrumentation and state coverage limits.','Divide fetch duration into three equal phases.','Read the response status.','A JS duration does not reveal native phase breakdowns. Reused connections also change which setup phases occur.')],['http','fetch','rn-networking'],
 'Compare a cold and warm catalog load on a real device. Record total app duration, payload size, and backend duration separately. List which phases your tool cannot observe.')

add('http',0,'HTTP is your contract','Methods, status codes, headers, schemas, and conditional requests.',35,
 ['Read a request and response.','Distinguish safe, idempotent, and retryable.','Handle empty bodies and schema mismatches.'],r'''
 ## Read the envelope
 An HTTP request has a method, URL, headers, and sometimes a body. A response has a status, headers, and sometimes a body. JSON is one body format, not the transport protocol. Set `Content-Type: application/json` when sending JSON and `Accept: application/json` when that is what you expect. A content-type header does not prove a body actually follows your schema.

 ```http
 POST /orders HTTP/1.1
 Authorization: Bearer <access-token>
 Content-Type: application/json
 Idempotency-Key: <stable-order-operation-id>

 {"cartId":"cart_42","expectedVersion":7}
 ```

 ## Methods describe semantics
 **GET** reads a representation and should not cause a requested state change. It is safe and idempotent by HTTP semantics. **PUT** replaces the target representation and is idempotent; **DELETE** is also idempotent in intended effect, although repeated calls can return different statuses. **POST** usually creates or executes an operation and is not inherently idempotent. **PATCH** partially modifies a resource and is not inherently idempotent. “Increment quantity” behaves differently from “set quantity to 2.”

 Safe means the client does not request a state-changing effect. Idempotent means repeating the same request has the same intended effect as one request. Retryable is a policy decision involving semantics, failure type, body replayability, time budget, and server contract. These are related concepts, not interchangeable labels.

 ## Status is only the first decision
 - `200` usually carries a result; `201` commonly signals creation.
 - `202` means accepted for processing, not completed. Follow an operation-status contract.
 - `204` has no response content. Do not blindly call `.json()`.
 - `304` is a conditional read result used with an existing cached representation. A minimal `response.ok` wrapper alone cannot implement this cache protocol.
 - `400` is a request problem; `401` means valid authentication is needed; `403` means access is refused. Do not refresh credentials for every `403`.
 - `404` may mean missing or intentionally concealed; `409` signals a conflict; `412` can mean an `If-Match` precondition failed; `422` often represents semantic validation.
 - `429` signals rate limiting. `Retry-After` can be seconds or an HTTP date.
 - `500`, `502`, `503`, and `504` are server/gateway failures, but none alone proves a write was not committed.

 ## Types are not runtime validation
 TypeScript types disappear at runtime. `await response.json() as Product[]` does not verify a response. Parse from `unknown` with a schema library or explicit guards. Decide how to handle unknown fields, missing required fields, nullable values, enum additions, and dates. A malformed proxy HTML page can arrive where JSON was expected.

 Define response and error schemas in a shared API specification when possible. RFC 9457 provides a standard Problem Details format; only show user-safe fields, and never treat its `detail` text as a stable machine error code. Error messages can change; stable typed codes drive behavior.

 ## Concurrency has a contract too
 An **ETag** identifies a representation version. `If-None-Match` supports revalidation; `If-Match` can protect an update from overwriting a version you never read. These need server implementation. APIs should also define pagination, rate limits, supported app versions, deduplication scope and retention, and authorization for every resource.
 ''',[
 q('Which statement is true about HTTP 202?','The work was accepted; completion needs a separate contract.','The order is definitely fulfilled.','The client should parse it as a 204.','Accepted work can later succeed or fail. Poll or subscribe to a stable operation-status endpoint as documented.'),
 q('Does casting response JSON to Product[] validate it?','No; runtime validation must check the unknown data.','Yes, TypeScript checks server data on the phone.','Only when HTTPS is enabled.','TLS protects transport, not application schema correctness. Type assertions do not execute runtime checks.'),
 q('An If-Match update gets 412. What should happen?','Fetch the current version and resolve the conflict.','Retry the exact stale update forever.','Refresh the access token.','A failed precondition indicates your representation version is no longer suitable for that conditional write.')],['http','problem','cache'],
 'Write a contract for POST /orders: success, accepted-but-pending, validation failure, authentication failure, version conflict, rate limit, and unknown outcome. Include example safe error codes.', 'http')

add('native',0,'React Native is a native network client','Devices, localhost, ATS, Android configuration, and web differences.',30,
 ['Reach a development API from each device type.','Separate browser security from native security.','Keep debug trust changes out of release builds.'],r'''
 ## Your JavaScript uses native plumbing
 React Native provides Fetch, XMLHttpRequest, and WebSocket APIs. Axios can use the available transport and offers interceptors and request configuration; it does not magically solve offline durability, server idempotency, or every native TLS problem. Choose one transport boundary so authentication, deadlines, and telemetry are consistent.

 A native iOS or Android app does not enforce browser CORS in the same way a webpage does. **CORS** is a browser rule about which origins may read responses. React Native Web and a WebView do run in browser contexts with their own rules. Adding `Access-Control-Allow-Origin: *` to an API will not fix a native certificate error or incorrect hostname. CORS also never replaces API authentication or authorization.

 ## Localhost depends on where code runs
 `localhost` refers to the machine or device making the connection. On a physical phone it points to that phone. A standard Android Studio emulator commonly reaches its host's loopback through `10.0.2.2`; other emulator products differ. The iOS Simulator can commonly reach services on its Mac through loopback, but a physical iPhone needs a reachable LAN address or secure development tunnel.

 For a phone on your LAN, bind the development API to an appropriate interface, check the host firewall, use the correct port, and keep both devices on a reachable network. On Android, `adb reverse tcp:3000 tcp:3000` can forward a connected device's port to the host during development. These are development arrangements, not production URLs.

 ## HTTPS is the release baseline
 iOS App Transport Security restricts insecure connections. Android apps targeting API 28+ generally disallow cleartext by default. Exact behavior depends on target level, network configuration, and which native stack is used. Use HTTPS with a valid hostname and trusted certificate. A self-signed development certificate is not automatically trusted because its URL begins with `https`.

 If local development needs an exception, scope it to the development build and required domain. Android Network Security Configuration supports debug-only trust anchors. Never ship a global “trust all certificates” callback or broadly disable ATS to fix one endpoint. Test the release artifact: debug certificates and different environment values can hide release failures.

 ## Feature parity is not guaranteed
 The React Native networking documentation lists platform-specific cookie and redirect limitations, including unstable cookie flows and unsupported Fetch options. Test your exact React Native version, OS, library adapter, and auth redirect flow. A browser tutorial using `credentials` or `redirect: 'manual'` cannot establish native behavior. If you choose cookies, use an appropriate maintained cookie integration and verify login, expiry, logout, redirects, and account switching on both platforms.

 Build-time “environment variables” included in the app bundle are readable by someone inspecting the binary. Use them for public API base URLs and public client IDs, not backend API secrets. Expo Go can also differ from your own development build when native modules or custom configuration are required. Always validate the actual native integration and a release-mode build.
 ''',[
 q('A physical iPhone requests http://localhost:3000. Where does localhost point?','The iPhone itself.','Always the developer’s Mac.','The production API.','Loopback is local to the process’s device. Use a reachable host address or development tunnel for a physical phone.'),
 q('Will adding CORS headers fix native TLS certificate validation?','No; diagnose the native trust or hostname problem.','Yes; CORS controls certificate trust.','Only on cellular.','CORS is a browser response-sharing policy. Native TLS trust is a different layer.'),
 q('Where can you safely put a backend secret?','On a trusted backend, not inside the mobile bundle.','In a bundled .env file.','In a minified JavaScript constant.','Bundling or obfuscation does not make a mobile client capable of keeping a shared backend secret.')],['rn-networking','android-security','apple-ats-text','android-address'],
 'Create a device/URL matrix for Android emulator, Android phone, iOS Simulator, iPhone, and React Native Web. Verify one HTTPS read in a release-mode build on each target you support.')

add('client',1,'Build a small, explicit API client','One boundary for deadlines, HTTP errors, and validated data.',45,
 ['Keep transport concerns separate from screens.','Keep the deadline active through body reading.','Validate responses without leaking credentials.'],r'''
 ## Start smaller than a framework
 Screens should ask for a product, not rebuild headers, timeouts, and JSON handling. Put a small transport helper behind domain functions such as `getProducts` and `placeOrder`. Then put cache and UI behavior above those functions. Keep retry policy in one intentional layer; this helper does **one attempt**.

 The following TypeScript is a teaching reference for bounded JSON endpoints. It includes HTTP errors, cancellation, a total asynchronous attempt deadline, an empty response, and runtime parsing. It is not a complete authentication, streaming, persistence, or tracing SDK. Set deadlines from measured endpoint behavior and user needs; 10 seconds below is an example.

 ```ts
 const API_ORIGIN = 'https://api.example.com';
 type Kind = 'http' | 'network' | 'timeout' | 'cancelled' | 'decode';
 class ApiError extends Error {
   constructor(
     public kind: Kind,
     public status?: number,
     public requestId?: string | null,
     public retryAfter?: string | null,
   ) { super(kind); }
 }

 async function requestJson<T>(
   path: string,
   parse: (value: unknown) => T,
   options: {
     signal?: AbortSignal;
     deadlineMs?: number;
     method?: string;
     json?: unknown;
     accessToken?: string;
     idempotencyKey?: string;
   } = {},
 ): Promise<T | undefined> {
   const url = new URL(path, API_ORIGIN);
   if (url.origin !== API_ORIGIN) throw new Error('Untrusted API origin');
   const body = options.json === undefined ? undefined : JSON.stringify(options.json);
   const controller = new AbortController();
   let timedOut = false;
   const onAbort = () => controller.abort();
   options.signal?.addEventListener('abort', onAbort);
   if (options.signal?.aborted) controller.abort();
   const timer = setTimeout(() => {
     timedOut = true;
     controller.abort();
   }, options.deadlineMs ?? 10_000);
   try {
     const headers: Record<string, string> = { Accept: 'application/json' };
     if (options.json !== undefined) headers['Content-Type'] = 'application/json';
     if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;
     if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
     const response = await fetch(url.toString(), {
       method: options.method ?? 'GET',
       headers,
       body,
       signal: controller.signal,
     });
     if (!response.ok) {
       throw new ApiError('http', response.status,
         response.headers.get('x-request-id'),
         response.headers.get('retry-after'));
     }
     if (response.status === 204) return undefined;
     let value: unknown;
     try { value = await response.json(); }
     catch (error) {
       if (controller.signal.aborted) throw error;
       throw new ApiError('decode');
     }
     try { return parse(value); }
     catch { throw new ApiError('decode'); }
   } catch (error) {
     if (options.signal?.aborted) throw new ApiError('cancelled');
     if (timedOut) throw new ApiError('timeout');
     if (error instanceof ApiError) throw error;
     throw new ApiError('network');
   } finally {
     clearTimeout(timer);
     options.signal?.removeEventListener('abort', onAbort);
   }
 }
 ```

 ## Understand the choices before copying
 A Fetch Promise normally resolves for `404` and `500`, so check the response status yourself. Its body is consumed separately. The `finally` belongs after body consumption so a slow body is still covered. An abort cannot interrupt synchronous JSON parsing or validation while it owns the JS thread, and a suspended app cannot rely on JS timers running on schedule. If you need precise native connection/read deadlines or background transfers, use a supported native transport.

 A `204` returns `undefined`; a domain wrapper expecting data must reject a missing result rather than asserting it exists. Conditional `304` handling belongs in a cache-aware adapter. This sample also assumes bounded bodies and a server contract that authenticated API routes do not redirect to arbitrary origins. Runtime URL checks alone do not validate an automatically followed redirect chain; verify your native stack's redirect behavior. Never attach an API token to arbitrary upload/CDN URLs.

 ## Add domain meaning
 A product parser checks object shape, required fields, allowed values, and finite numbers. Use a schema library if it improves clarity. Map validated Problem Details into typed domain errors where available. Return a safe request ID for support, not a raw response body. Never log the `Authorization` header.

 Configure JSON size limits at the API and test big responses. Buffering JSON is unsuitable for huge downloads. Keep staging and production base URLs explicit; do not silently fall back to a different environment when one fails. The query library and the observability SDK will wrap this boundary later.
 ''',[
 q('Fetch receives HTTP 500. Will it normally reject for that status?','No; inspect response.ok or status and throw a typed error.','Yes; catch always receives all non-200 statuses.','Only if the response contains JSON.','Fetch distinguishes transport failure from an HTTP response. Your client must interpret HTTP status.'),
 q('Why keep the deadline timer until the body is read?','Headers can arrive while the body still stalls.','The server needs the timer value.','It makes JSON type assertions safe.','Clearing the timer immediately after fetch resolves can leave a body read waiting without the intended deadline.'),
 q('Can this helper’s abort stop synchronous JSON validation immediately?','No; synchronous JS must yield before a timer callback runs.','Yes; AbortController interrupts any CPU work.','Only with an access token.','Abort signals coordinate cancellable asynchronous work. They do not preempt a busy JS thread.')],['fetch','rn-networking','http'],
 'Implement this boundary in a scratch app. Exercise 200 JSON, 204, 500, malformed JSON, a slow body, and parent cancellation. For each, predict the error kind before testing.')

add('errors',1,'Errors, deadlines, and UI state','Make failure understandable without lying about the outcome.',35,
 ['Classify failures by layer.','Preserve useful data while refetching.','Make cancellation and ambiguous writes distinct.'],r'''
 ## A spinner is not a state model
 A useful read screen distinguishes first load, success with data, success with no results, refresh while showing old data, refresh failure with old data, first-load failure, and offline with or without a usable snapshot. These states produce different actions. “No orders yet” is not the same as “We could not load your orders.”

 A write adds more states: editing, submitting, queued locally, acknowledged by the server, rejected, and outcome unknown. “Saved on this device” and “Synced to server” must have different labels. A `202` might add a processing state. If an order times out, show a reconciliation state rather than confidently saying “Order failed.”

 ## Classify before recovering
 - **Configuration:** wrong base URL, missing build setting, unsupported native feature. Fix configuration; retries rarely help.
 - **Transport:** DNS failure, TLS failure, disconnected socket, no usable route. There is no HTTP status. A generic Fetch error may hide the exact native reason; inspect native diagnostics.
 - **HTTP:** authentication, authorization, validation, conflict, throttling, or server failure. Interpret the documented contract.
 - **Decode/schema:** bytes arrived but did not match your contract. Record safe shape/version context and treat this as a compatibility issue.
 - **Cancellation:** the user navigated away or the request became obsolete. Usually do not show a scary error toast.
 - **Deadline exceeded:** the client stopped waiting. A write may still have happened.

 Preserve these categories in code and telemetry. Do not label every exception “offline,” or every `401` “wrong password.” A request ID helps support connect a client report to server evidence, if the server received the call.

 ## Deadlines are budgets
 A timeout for a single attempt is not the same as an overall operation deadline. Three 10-second attempts plus backoff can make a “10-second” action take much longer. Define a user-visible operation budget, then allocate remaining time to attempts and waits. Skip an attempt if it cannot fit. A read may be cancelled on navigation; a committed order needs reconciliation even if the initiating screen disappears.

 Cancellation is cooperative. Abort the transport where supported, remove listeners, and guard against obsolete results. Do not infer server rollback from an abort. For shared cached reads, one component unmounting must not incorrectly cancel work still needed by another observer; let a query library own that lifecycle.

 ## Error messages should guide action
 Prefer “Couldn't refresh. Showing products from 10:42. Try again.” over “Network Error.” For validation, preserve the user's input and associate errors with fields. For an expired session, keep a safe route back after sign-in. For rate limits, communicate an appropriate wait rather than encouraging repeated tapping. For unknown order outcomes, offer “Check order status.”

 Announce meaningful state changes to assistive technology, support retry buttons with accessible names, and avoid repeated global toasts for every background refetch. A low-priority analytics upload should not block checkout. Separate critical and optional dependencies so partial failure can still produce a useful screen.

 ## A diagnostic observation
 If users report “empty cart” while status codes look healthy, inspect your catch paths and cache transitions. An error swallowed into an empty array, an account switch, or a mismatched query key can mimic a perfectly successful empty response. Reliability begins with honest state, not just green HTTP dashboards.
 ''',[
 q('A background refresh fails but cached data is available. What is usually best?','Keep the data, label freshness, and offer an appropriate retry.','Erase the data and show an empty state.','Log the access token for diagnosis.','Preserving useful data avoids a worse experience. Make staleness visible when it matters to the product.'),
 q('Three attempts each have a 10-second timeout. Is the operation guaranteed under 10 seconds?','No; attempts and waits must share an overall budget.','Yes; each uses the same timeout.','Yes, if they are GETs.','An operation budget must include all attempt durations and backoff, plus any relevant processing time.'),
 q('The user leaves a screen and the read is cancelled. Should that count as an API outage?','Usually no; track intentional cancellation separately.','Always yes.','Only if it used HTTPS.','Cancellation describes lifecycle or intent. Mixing it with unintentional failures makes operational metrics misleading.')],['fetch','aws-retry','react-effects'],
 'Sketch the catalog and checkout UI for: initial failure, stale-data refresh failure, offline queued write, 401, 422, and an order whose reply was lost.')

add('query',1,'Server state, query keys, and caching','Learn what a cache promises—and what it does not.',40,
 ['Distinguish server state from local UI state.','Use identity-safe query keys.','Separate staleTime, gcTime, persistence, and HTTP caching.'],r'''
 ## Two kinds of state
 **UI state** includes the selected tab or an unfinished form. **Server state** is a local view of data owned elsewhere: product stock, your profile, or order status. It can become outdated without a local action. A query library helps deduplicate reads, track loading, cache results, and coordinate refetching; it does not make the server stop changing.

 A sensible starting stack is Fetch or Axios for transport, a runtime schema validator for data, and TanStack Query v5 for server-state lifecycle. Avoid maintaining the same server list independently in a global store, a component, and a query cache unless you have a specific consistency design.

 ## The key is the identity
 ```tsx
 const products = useQuery({
   queryKey: ['products', accountId, { category, search, sort }],
   enabled: Boolean(accountId),
   queryFn: ({ signal }) => getProducts({ category, search, sort, signal }),
   staleTime: 30_000,
   gcTime: 10 * 60_000,
   retry: false, // add one deliberate retry policy later
 });
 ```

 Include every input that changes the result: account or tenant, filters, locale when it affects content, and other relevant scope. Do not include raw access tokens. Two users sharing `['profile']` in a long-lived client can accidentally see each other's cached data. On logout/account switch, cancel old work and clear the relevant memory and persisted cache. An identity key complements cleanup; it does not replace it.

 The query function above is an application adapter returning validated data and throwing typed failures. It receives the library's cancellation signal. Do not return `undefined` from a query function expecting data: handle endpoint emptiness explicitly. The numeric timings are illustrative, not universal defaults.

 ## Four different clocks
 **staleTime** controls how long query data is considered fresh. Becoming stale does not itself mean a timer must fire a request at that exact instant. Events such as mounting, focus, reconnect, invalidation, or configured polling decide when work starts.

 **gcTime** controls when an unobserved query becomes eligible for garbage collection. It does not describe how fresh the data is. Query data can be stale and still useful, or fresh but later discarded after inactivity.

 **Persistence maxAge** is a policy for restoring an on-disk snapshot after restart. Match it with the documented garbage-collection/hydration settings, use a schema buster, and exclude sensitive data as appropriate. Persistence is opt-in; an in-memory query cache is not durable storage.

 **HTTP caching** is a separate native/proxy/CDN layer. `Cache-Control: no-cache` generally permits storage but requires validation before reuse; `no-store` instructs compliant HTTP caches not to store. Those directives do not automatically delete a manually persisted query cache. `private` restricts shared caching but does not encrypt data.

 ## React Native needs lifecycle wiring
 TanStack's browser focus and online behavior need React Native integration through AppState and a connectivity source such as NetInfo. Install once, clean up subscriptions, and verify current library guidance. A screen gaining navigation focus is also distinct from the app returning to the foreground.

 Cache policy is a product decision. A public product description can tolerate different staleness from a bank balance or final checkout price. The server must revalidate price and availability for a critical write. A cache can improve experience while still requiring a clear “last updated” label.
 ''',[
 q('What does staleTime = 30 seconds mean?','Data is considered fresh for that interval; becoming stale alone need not trigger a request.','Delete the data at 30 seconds.','Persist the data for 30 seconds.','Freshness, garbage collection, persistence, and refetch triggers are separate controls.'),
 q('Which query key best separates customer profiles?','A key including a stable account/tenant identity.','A shared string profile for every user.','A key containing the raw bearer token.','Use non-secret identity scopes and cancel/clear old account data. Tokens should not become cache keys or diagnostic labels.'),
 q('Does Cache-Control: no-store automatically clear an app-managed persisted cache?','No; app persistence needs its own policy and cleanup.','Yes, including all SQLite rows.','Only on iOS.','HTTP cache directives govern HTTP caching. Application-managed copies require deliberate handling.')],['tanstack-defaults','tanstack-rn','tanstack-persist','cache'],
 'Define query keys and freshness policies for catalog, profile, cart, and order status. Switch between two test accounts and confirm no prior-account result flashes on screen.', 'cache')

add('mutations',1,'Writes and optimistic interfaces','Make “saved” mean something precise.',35,
 ['Distinguish pending local changes from server confirmation.','Handle optimistic updates and concurrent mutations.','Avoid duplicate writes without relying on a disabled button.'],r'''
 ## Reads and writes have different risks
 A **mutation** changes server state: adding to a cart, creating an order, or uploading metadata. Disabling a submit button reduces accidental duplicate taps. It does not protect against network retries, app restarts, two devices, or a delayed duplicate request. Critical duplicate prevention belongs in the server contract.

 Choose UI feedback based on reversibility and risk. Toggling a favorite can feel instant. A payment or final order should not appear completed until the server's authoritative workflow confirms the required state. A locally queued draft can appear immediately with an explicit pending marker.

 ## Optimistic means provisional
 An optimistic update predicts what the server will accept. A basic flow is: cancel conflicting reads, snapshot current data, apply the prediction, send the mutation, reconcile with the authoritative result, and invalidate/refetch relevant views. On a definite rejection, roll back or show a conflict resolution action.

 ```ts
 // Conceptual lifecycle; adapt to your query library's current API.
 // 1. Cancel relevant reads so old data cannot overwrite the prediction.
 // 2. Record prior state or an operation-specific inverse.
 // 3. Show the optimistic change with a pending operation ID.
 // 4. Send the mutation once through your chosen policy layer.
 // 5. On success, replace predicted fields with the server representation.
 // 6. On definite rejection, undo this operation and preserve newer edits.
 // 7. On unknown outcome, reconcile by operation ID before declaring failure.
 ```

 ## The concurrency trap
 Suppose the cart starts at quantity 1. Change A optimistically sets 2. Change B sets 3. A fails later. A naive rollback to the original snapshot sets the cart to 1, erasing B. A naive success response from A can likewise overwrite a newer value. Serialize writes per resource, use versioned server responses, or track operations and recompute the optimistic projection. “Just restore the snapshot” is safe only under assumptions you have checked.

 Prefer operations with clear semantics. `setQuantity(3, expectedVersion)` is easier to reconcile than blind increments, but still needs conflict handling. If the server applies business rules, its returned representation wins. Never trust optimistic totals for charging or inventory reservations.

 ## Invalidation is a consistency strategy
 After an order succeeds, the order list, cart, inventory, and badge count may be affected. You can update known cache entries from the returned resource, invalidate related keys, or use a normalized cache. Document what must be immediately consistent and what may refresh later. Invalidating every query after every tap wastes bandwidth and can cause distracting refreshes.

 Keep a mutation's server error separate from a later refresh error. “Order created, but list refresh failed” should not invite the user to place the order again. If a write result is uncertain, show that uncertainty and reconcile. If a user is offline and your product does not support offline orders, preserve their form and explain when submission is possible.

 ## Accessibility and user control
 Announce pending and completed states appropriately. Provide undo only when its semantics are real; a cosmetic undo after an irreversible commit is misleading. Keep the button tied to the operation state, and use an operation identity stable across safe retries. The offline lesson extends this model across process death.
 ''',[
 q('Is disabling the submit button sufficient to prevent duplicate orders?','No; the server needs a deduplication/idempotency contract.','Yes; a second request becomes impossible.','Yes, when using React Query.','UI guards cannot cover retries, restarts, multiple devices, or duplicate transport delivery.'),
 q('An old optimistic change fails after a newer change succeeds. What is risky?','Restoring the old whole-object snapshot and erasing the newer change.','Showing any pending indicator.','Using an operation ID.','Concurrent optimistic updates require serialization or operation-aware reconciliation rather than blind snapshot rollback.'),
 q('Order creation succeeds but refreshing the list fails. What should the app say?','The order was created; the list could not refresh.','The order failed, so submit again.','Nothing happened.','Treat the authoritative write outcome separately from the read used to refresh the UI.')],['http','tanstack-defaults','aws-retry'],
 'Describe two simultaneous cart edits and draw their response order. Choose serialization, version checks, or an operation ledger, then explain how your UI avoids rolling back the newer edit.')

add('lists',1,'Lists, search, pagination, and waterfalls','Keep data loading correct as the dataset grows.',30,
 ['Design stable pagination and reset rules.','Prevent search races and request storms.','Avoid unnecessary dependent request chains.'],r'''
 ## A production list has a lifecycle
 A product list needs an initial page, a loading-more state, an end condition, refresh behavior, and a way to handle filters changing mid-request. Search adds rapid input changes and race conditions. A small demo that downloads all rows hides memory, latency, and correctness problems.

 **Offset pagination** uses an offset/page number and size. It is easy to understand but inserts and deletes can shift boundaries, causing duplicates or skipped items. **Cursor pagination** uses an opaque marker supplied by the server. It can be more stable, but only if the server defines ordering, tie-breakers, and cursor semantics. Never invent or decode opaque cursors in the app.

 ## Identity spans the whole list
 Keep the filter, sort order, account scope, and search term in the list's query key. A cursor identifies a page within that list, not a universal location. On filter change, start the new query identity and reset pagination. Do not append results from the old filter into the new list. Use stable item IDs for rendering and defensive duplicate handling; client deduplication cannot recover rows the server skipped.

 ```ts
 // Illustrative infinite-query contract
 type Page<T> = { items: T[]; nextCursor: string | null };
 // Start with an explicit first-page parameter.
 // getNextPageParam: page => page.nextCursor ?? undefined
 // query key: ['products', accountId, { search, sort, category }]
 // queryFn receives both pageParam and the cancellation signal.
 ```

 A missing next cursor means stop. Guard a load-more trigger while a page fetch is already in progress. Decide whether refresh replaces the whole page sequence or revalidates loaded pages. A high-churn feed may require a snapshot token or a server-defined consistency window to avoid page boundaries moving beneath the user.

 ## Search deliberately
 Debounce typing when it makes the interface clearer and reduces waste; keep local input responsive. Enforce minimum useful query lengths where appropriate. Associate results with the exact term, cancel obsolete work, and encode query values with a URL builder. Do not use raw search text as an analytics or metric label: it may contain names, addresses, or other sensitive data.

 ## Remove waterfalls before adding caches
 If a screen first fetches a user, then fetches a store, then fetches a catalog only because the code was arranged that way, inspect whether those dependencies are necessary. Start independent reads in parallel or design a screen-oriented endpoint with the backend team. Avoid N+1 loading where every list item triggers another request. Batching can help but should be bounded and measured; one gigantic response is not automatically better.

 Prefetch only likely next content and respect metered connections and resource budgets. Images should use appropriate sizes and caching rather than embedding full-resolution files into JSON. Limit retained pages when long sessions could grow memory without bound. Test pull-to-refresh, rapid scroll, filter changes, navigation away, and account switching while responses arrive out of order.

 **Observation:** repeated first pages often indicate an unstable key, recreated query client, wrong next-cursor handling, or a load trigger firing while already fetching. Compare query identity and cursors before blaming the server.
 ''',[
 q('A filter changes while a page is loading. What should happen?','Use a new list identity and prevent old results being appended.','Append every arriving page to the visible list.','Keep the old cursor for all filters.','The cursor belongs to the old query scope. Filter identity and cancellation prevent mixed datasets.'),
 q('What does cursor pagination guarantee by itself?','Only what the server’s ordering and cursor contract explicitly guarantee.','A perfectly consistent snapshot under every concurrent write.','That item IDs are unnecessary.','A cursor is not automatically a snapshot. Stable ordering, tie-breakers, and churn semantics must be defined.'),
 q('Every product card fetches its own price. What issue might this create?','An N+1 request pattern with avoidable latency and load.','Automatic end-to-end tracing.','Guaranteed better caching.','A list request plus one request per item can multiply calls. Prefer suitable representations or bounded batching when the contract allows.')],['http','tanstack-defaults','react-effects'],
 'Design a product-page response with items and nextCursor. Specify ordering, tie-breakers, refresh semantics, and how account/filter changes reset the list. Try fast typing under reversed response order.')

add('oauth',2,'Authentication without a hidden secret','OAuth, OIDC, PKCE, and native redirects explained plainly.',40,
 ['Separate authentication from authorization.','Explain Authorization Code with PKCE.','Choose system browser flows and validate redirects.'],r'''
 ## Identity and permission are different
 **Authentication** establishes who is signing in. **Authorization** decides what that identity may do. OAuth 2.0 is a delegated authorization framework. OpenID Connect, or **OIDC**, adds an identity layer on top. A JWT is one token format; it is not an authentication flow, and its encoded payload is not encrypted merely because it looks unreadable.

 A native app is a **public client**: anyone with the binary can inspect embedded values. A client ID can be public. A shared client secret in an app cannot provide the security of a confidential backend. Use the identity provider's supported native flow and a maintained library rather than inventing a login protocol.

 ## Authorization Code with PKCE
 1. The app creates a high-entropy one-time `code_verifier` and derives the S256 `code_challenge`.
 2. It opens the authorization request in the platform's external user-agent, such as a system browser authentication session. The provider authenticates the user.
 3. The provider redirects to a registered callback with a short-lived authorization code.
 4. The app validates the callback and transaction binding, then exchanges the code plus its verifier at the token endpoint.
 5. The provider checks the verifier against the challenge and issues tokens according to policy.

 **PKCE**, pronounced “pixy,” makes an intercepted authorization code insufficient without the verifier. It does not make every redirect secure or replace validation of the issuer and transaction. Follow the library/provider's documented handling of `state`, OIDC `nonce`, redirect URI, issuer, and ID token validation. Exact requirements depend on the protocol flow; do not hand-roll these checks from a diagram.

 ## Why use the system browser?
 RFC 8252 recommends external user-agents for native OAuth. They keep the app from directly handling the provider's password and can reuse an existing browser sign-in session. Avoid collecting an identity provider's credentials inside an arbitrary embedded WebView. PKCE does not make credential-phishing UI acceptable.

 Prefer claimed HTTPS redirects via Universal Links/App Links when supported and correctly configured. Custom schemes can be claimed by another app; PKCE mitigates code interception, while exact redirect registration and transaction checks remain necessary. Never place access or refresh tokens in ordinary deep-link query strings. Validate deep-link input just as you validate any external input.

 ## Use the right token
 An **access token** is presented to the resource API for a limited scope and audience. An **ID token** tells the client about the authentication event; do not substitute it for an API access token unless your provider explicitly defines that contract. A **refresh token** obtains new tokens and is especially sensitive. Token lifetimes, scopes, and rotation are server/provider policy.

 The API validates signature or introspection as applicable, issuer, audience, expiry, and permissions. The client decoding a JWT to display an expiry time does not prove it is valid. Device time can also be wrong. Minimize scopes, keep tokens out of URLs and logs, and use HTTPS. Revocation and session invalidation belong in the system design.

 ## Practice with realistic failure
 Test cancelled login, a malicious or unrelated callback, duplicate callbacks, a stale login transaction, provider unavailability, and returning to a killed app. Decide what the user sees if login succeeds but loading the profile fails. Do not label that whole sequence “wrong password.”
 ''',[
 q('Can a bundled OAuth client secret be treated as confidential?','No; native apps are public clients.','Yes, if it is in an environment file.','Yes, if the JavaScript is minified.','An installed app cannot keep a shared secret from someone who can inspect it. Use public-client native OAuth flows.'),
 q('What does PKCE primarily protect?','The code exchange when an authorization code is intercepted.','All data stored on the phone.','The API from every unauthorized request.','The verifier binds the token exchange to the initiating client transaction. It complements redirect and identity validation.'),
 q('Which token normally belongs on a protected resource API request?','An access token with the correct audience and scope.','Any ID token because both may be JWTs.','The PKCE verifier.','Access tokens and ID tokens serve different roles. Token shape alone does not make them interchangeable.')],['auth-native','auth-bcp','rn-security'],
 'Draw the browser, app, authorization server, and API as four actors. Label the authorization code, verifier, access token, ID token, and refresh token, including which actor should receive each.')

add('sessions',2,'Sessions, secure storage, and one refresh','Survive expiry, rotation, logout, and account changes.',40,
 ['Store credentials using platform-backed facilities.','Coordinate concurrent 401 responses.','Prevent late responses from resurrecting a logged-out session.'],r'''
 ## Persistence is a security decision
 React Native's security guide describes AsyncStorage as unencrypted key-value storage. It is suitable for many non-sensitive preferences, not bearer credentials. Use an appropriate platform-backed facility such as Keychain/Keystore through a maintained library, for example Expo SecureStore when compatible with your project.

 Keep access tokens in memory when the flow allows, and protect refresh tokens in secure storage. The exact design depends on your provider and threat model. Secure storage does not make a rooted or actively compromised device harmless, and it does not replace server expiry and revocation. Biometric-gated storage can become unavailable when enrollment changes; provide reauthentication recovery.

 Uninstall behavior differs: Android SecureStore data is not retained after uninstall; iOS Keychain values may survive reinstall with the same bundle ID, but do not rely on that behavior as a guarantee. Backups and restore need correct platform exclusions. “Uninstall means logout” is not a reliable cross-platform contract.

 ## The refresh storm
 Five API calls return `401` simultaneously. If each independently uses the same rotating refresh token, one may succeed while another triggers token reuse detection or invalidates the session. Use **single-flight refresh**: one refresh Promise per active session, shared by all waiting calls.

 ```ts
 // Pseudocode: illustrates ownership, not a complete auth implementation.
 // session = { accountId, epoch, accessToken, refreshToken }
 // refreshPromise is scoped to this session, never global across users.
 // On eligible 401:
 //   1. If this request used an older token than current, retry with current.
 //   2. Otherwise join/start the session's single refresh operation.
 //   3. Store rotated credentials safely before releasing waiting requests.
 //   4. Confirm the account and epoch still match.
 //   5. Replay at most once, only when operation/body semantics permit.
 // Never route the refresh endpoint through its own 401-refresh interceptor.
 ```

 Distinguish an expired/invalid token response from other authorization failures according to your API. Do not refresh for every `403` or enter an infinite refresh loop. If refresh gets a transient network failure, your user may still have a valid recoverable session; do not indiscriminately delete it. A definitive invalid/revoked refresh token usually requires signing in again.

 ## Rotation has a crash window
 Rotated refresh credentials must replace the old ones coherently. Separate access-token and refresh-token writes can leave mismatched state if the app dies between them. Prefer a securely stored credential envelope and a provider/library with documented recovery semantics. A crash after server rotation but before local persistence may require reauthentication; do not invent unsafe reuse behavior to hide it. RFC 9700 requires public-client refresh tokens to be sender-constrained or use rotation.

 ## Logout must win
 Give each session an **epoch** or generation. Increase it on logout/account change. Cancel old requests, reject queued replays from the old generation, clear credentials and account caches, and prevent late refresh responses from saving tokens into a new session. Where available, revoke the server session/refresh token, and understand how device logout differs from signing out of the provider's browser session.

 Replaying a body is another constraint: a consumed stream or upload may not be replayable. Even with a new access token, an ambiguous write needs its original idempotency identity. A server should reject unauthorized writes before effects, but do not assume an undocumented middleware ordering is a deduplication protocol.
 ''',[
 q('Six requests hit token expiry at once. What is the preferred coordination?','One refresh operation shared within that session.','Six independent refreshes with the same rotating token.','Refresh once for each screen component.','Single-flight coordination avoids refresh storms and rotation races. It must still be scoped to the active identity.'),
 q('A refresh response arrives after logout. What should happen?','Reject it using the session generation and avoid saving its tokens.','Save the tokens and silently log the user back in.','Store them in the next account’s cache.','Logout/account change invalidates work owned by the old session. Late results must not resurrect that identity.'),
 q('Where should an ordinary bearer refresh token be persisted?','In suitable platform-backed secure storage.','In plain AsyncStorage with a different key name.','In the analytics user properties.','A refresh token is a credential. Use maintained secure storage and understand backup, biometric, and reinstall behavior.')],['rn-security','securestore','auth-bcp'],
 'Write a session state machine: signed out, restoring, active, refreshing, temporarily offline, and reauthentication required. Include logout during refresh and account switching.', 'auth')

add('retry',2,'Retries, backoff, and idempotency','Retry the right work, once in the right layer.',40,
 ['Choose retries by semantics and failure.','Use bounded backoff with jitter and Retry-After.','Explain why deduplication requires durable server behavior.'],r'''
 ## A retry adds load and uncertainty
 A retry is a second attempt at the same logical operation. It can recover a transient connection failure, but it also adds traffic to an overloaded service. If the first attempt changed state, retrying can duplicate the effect. Never retry every error simply because an interceptor makes it easy.

 A typical read policy may retry a few transport failures or selected transient statuses, within an overall deadline. Validation errors and forbidden access do not improve by immediate repetition. A `401` may use a separate bounded refresh flow. Cancellation should stop retrying. Exact status handling is an API contract: even `500` does not universally mean “safe to repeat a write.”

 ## Exponential backoff with full jitter
 ```ts
 // Example wait before retry n, with n starting at 0.
 const ceilingMs = Math.min(capMs, baseMs * 2 ** n);
 const waitMs = Math.random() * ceilingMs;
 ```

 Backoff spreads repeated attempts over time; jitter spreads different clients across that window. Choose caps, retry counts, and operation deadlines from the product and service behavior. Stop on cancellation. If a valid `Retry-After` specifies a minimum wait, respect it without retrying earlier; if it exceeds the user's remaining budget, defer or fail clearly instead of sleeping forever. Parse both delta-seconds and HTTP-date forms, accounting for clock uncertainty.

 Retry in one intentional layer. Three retries in the transport plus three retries in a query library can multiply into 16 attempts because each includes its initial attempt. Upstream/downstream retries can amplify further. Add a retry budget or server-directed load shedding and observe attempts per operation, not just final success.

 ## A stable key is only half a protocol
 For a critical POST, create a high-entropy idempotency key once per logical operation and persist it before the first attempt when recovery must survive process death. Reuse it for the **same** operation and payload. A genuinely new operation gets a new key.

 The server must scope keys to the appropriate identity/endpoint, compare payload fingerprints, atomically claim the key with the business effect, handle concurrent duplicates, store an outcome or operation reference, and retain it for a documented recovery window. The key is not a password or authorization substitute. If retention expires, blindly replaying an old write may duplicate it; reconcile or ask for a new explicit action according to the contract.

 The result is safe repetition under stated assumptions, not a magical universal “exactly once” network. A server that checks a key in memory and then writes the order in an unrelated transaction still has a crash race. A client generating a new key on every retry defeats deduplication.

 ## Reconcile ambiguity
 If the reply disappears, query status by the stable operation/order identity or resend the same idempotent operation according to the API. Surface “checking result” until you know. The server may still be processing; respect its documented pending response. If dependencies are unhealthy, circuit breaking or a degraded read-only path can help, but coordinate limits across clients and servers rather than letting millions of apps probe in lockstep.
 ''',[
 q('When do you generate a fresh idempotency key?','For a new logical operation, not for each retry of the same one.','Before every attempt, including retries.','Whenever a timeout happens.','Stable identity allows the server to recognize a duplicate attempt. A changed payload must follow the server’s conflict contract.'),
 q('What does jitter accomplish?','It spreads clients’ retry times to reduce synchronized bursts.','It validates the response schema.','It proves a POST was never committed.','Randomized waits reduce the herd effect. Backoff and retry budgets still need bounds and server coordination.'),
 q('Transport and query layers each make 4 total attempts. How many calls could occur?','16, if the outer layer repeats the entire inner operation.','4, because retries deduplicate automatically.','8 in every case.','Layered retries multiply. Configure a single owner for retries and measure attempt counts.')],['aws-retry','http'],
 'Define retry decisions for a catalog GET and order POST across timeout, TLS failure, 401, 403, 422, 429, 503, and cancellation. Add an overall deadline and a documented key-retention window.', 'retry')

add('security',2,'Transport security and data privacy','Protect the wire, the device, and the diagnostic trail.',35,
 ['Understand what HTTPS protects.','Make pinning an operational decision.','Minimize secrets and personal data throughout networking.'],r'''
 ## HTTPS is necessary and specific
 TLS with correct certificate and hostname validation protects confidentiality and integrity in transit and authenticates the server under the chosen trust model. It does not establish that an authorized user may read any order, prevent a compromised server, or encrypt your application's local database. Security boundaries need separate controls.

 Use supported platform defaults and modern TLS configurations. Never “fix” certificate failures by accepting every certificate or disabling hostname validation. Check device time, certificate chain completeness, hostname, expiry, network interception, and release/debug differences. Test your actual supported OS versions rather than just the newest simulator.

 ## Pinning has a lifecycle
 Certificate/public-key pinning narrows which otherwise trusted server credentials a client accepts. It may be appropriate for a threat model or requirement, but it creates a deployment dependency between long-lived installed apps and certificate infrastructure. A rotation mistake can disconnect every old app version.

 If you choose pinning, use a maintained native implementation, document coverage for every transport and domain, include an appropriate backup/rotation strategy, and rehearse expiry and emergency recovery. Do not silently bypass pins on failure. Certificate pinning does not prevent a fully controlled client from being modified; authorization and server-side abuse controls still matter. Some platform guidance cautions against pinning because recovery is difficult: make the choice with your security and operations owners.

 ## Reduce what you send and store
 Do not put credentials in query strings. URLs are copied into logs, analytics, proxies, screenshots, and support reports. Avoid sending personal fields that an endpoint does not need. Never include a backend secret in a mobile bundle. Treat signed upload URLs as temporary capabilities: do not log them and restrict their scope and lifetime.

 Separate public cacheable content from private data. Namespace persisted state by account/tenant, expire it appropriately, and clear it on logout or account deletion according to your product obligations. Encrypt sensitive local records with an appropriate key-management design; renaming the file or encoding data as Base64 is not encryption. Secure deletion and backup behavior depend on the platform; promise only what you can verify.

 ## Diagnostics are another data pipeline
 Before enabling request bodies, header capture, analytics, crash attachments, or session replay, inspect their actual payloads. Use an allowlist of safe fields, sanitize URLs to route templates, and remove Authorization, Cookie, Set-Cookie, tokens, passwords, and signed parameters. Redaction should happen before data leaves the device where feasible, with server-side filtering as another layer.

 Do not put emails or access tokens in trace baggage or metric labels. Consider consent, retention, deletion, data residency, and access control according to your product and jurisdiction. This course teaches engineering mechanisms; specific legal requirements need the relevant owner and current policy.

 ## Check all destinations
 Only send auth credentials and trace context to an explicit set of trusted hosts. Keep API, image/CDN, identity provider, telemetry, and upload destinations distinct. If remote configuration can change endpoints, validate an allowlist and authenticate configuration delivery; an untrusted URL override can become a credential exfiltration path. Treat third-party SDK networking as part of your data inventory.
 ''',[
 q('What does valid HTTPS fail to guarantee by itself?','That the requester is authorized to read a particular order.','Confidentiality in transit under its trust model.','Server hostname validation when correctly implemented.','Object-level authorization remains a server responsibility. TLS secures a transport channel, not your business permissions.'),
 q('What is a major pinning operational risk?','Certificate/key rotation can break older installed app versions.','It makes tokens public automatically.','It makes HTTPS unnecessary.','Pins couple clients to server credentials. Coverage, backup pins, rotation, and emergency recovery require real operational planning.'),
 q('Which telemetry policy is safest by default?','Allowlist safe fields and redact credentials before transmission.','Upload every header and body for convenience.','Replace passwords with Base64.','Diagnostic systems are data recipients. Minimize collection and verify the actual emitted payload, including URL parameters.')],['rn-security','android-security','apple-ats-text','sentry-data'],
 'Create a data inventory for API, auth, uploads, analytics, and crash reporting. For each destination, name allowed fields, credential handling, retention, and a deletion/account-switch test.')

add('connectivity',3,'Connectivity and app lifecycle','Online is a hint. Foreground is a different signal.',30,
 ['Interpret unknown network state correctly.','Wire AppState and online status once.','Choose a reconnection and freshness strategy.'],r'''
 ## Connected to what?
 A phone may be connected to Wi-Fi without reaching the internet. The internet may work while your API is down. A reachability probe may succeed through one host while another is blocked. Treat connectivity as a useful scheduling hint, not proof that the next request will succeed or fail.

 NetInfo exposes `isConnected` and `isInternetReachable`, which can be `null` when unknown. Converting unknown to false can lock a user out unnecessarily. Keep unknown explicit or choose a documented optimistic policy that allows an attempt. Configure probes carefully: they consume resources, may need privacy consideration, and do not test every backend dependency.

 ## App focus and screen focus differ
 React Native AppState distinguishes foreground and background states, with platform-specific nuances. Returning to the app can justify checking stale data. Switching tabs inside the app is navigation focus, a separate event. Do not install a new global network listener in every screen.

 ```ts
 // Illustration: install once in the application lifecycle.
 import NetInfo from '@react-native-community/netinfo';
 import { AppState } from 'react-native';
 import { onlineManager, focusManager } from '@tanstack/react-query';

 onlineManager.setEventListener(setOnline =>
   NetInfo.addEventListener(state => {
     // Unknown remains eligible for a real request under this policy.
     const knownOffline = state.isConnected === false ||
       state.isInternetReachable === false;
     setOnline(!knownOffline);
   })
 );
 const subscription = AppState.addEventListener('change', state => {
   focusManager.setFocused(state === 'active');
 });
 // Initialize focus from AppState.currentState when it is known.
 // Remove subscription during app-level cleanup/hot-reload teardown.
 ```

 A reachability signal can be stale or wrong. Always handle request failures. Recheck current library/platform integration guidance and avoid a focus manager path intended only for web.

 ## Reconnect is a scheduling event
 When connection returns, many reads, uploads, and queued writes may become eligible together. Resume with bounded concurrency, prioritize user-critical operations, refresh stale auth if needed, and add jitter where appropriate. Avoid refetching every cached query and draining a huge outbox at once.

 Show whether displayed data is cached and how old it is when freshness matters. A connectivity banner should be useful, stable, and accessible; do not flash it for every transient probe or cover the whole UI when local browsing still works. An API outage deserves a different message from a known disconnected device.

 ## Background changes the rules
 JavaScript timers and sockets may pause when the OS suspends the app. A foreground timeout is not a reliable background scheduling mechanism. On resume, inspect persisted operation state, refresh stale views according to policy, reconnect real-time sessions, and reconcile writes whose outcomes were unknown. Repeated foreground events should be safe and idempotent from the app's perspective.

 Test Wi-Fi with no internet, captive portals, VPNs, airplane mode, Wi-Fi-to-cellular transitions, and rapidly backgrounding during a request. Include real devices; simulator connectivity can differ from physical-device behavior.
 ''',[
 q('NetInfo reports isInternetReachable = null. What does that mean?','Reachability is unknown, not definitely offline.','The API returned 500.','The user is definitely signed out.','Unknown is a distinct state. Choose a documented scheduling policy while still handling real request outcomes.'),
 q('The phone is on Wi-Fi. Is your API necessarily reachable?','No; the route, DNS, service, or captive portal may still fail.','Yes, Wi-Fi guarantees HTTP success.','Yes, unless the token is a JWT.','Connectivity is not endpoint health or authorization. A real attempt can fail at several later layers.'),
 q('What should happen when a large offline outbox reconnects?','Resume with bounded concurrency and prioritization.','Start every queued request simultaneously.','Delete all queued work without explanation.','A reconnect burst can overload both app and server. Use a deliberate scheduler and preserve operation identity.')],['netinfo','tanstack-rn','rn-appstate'],
 'Specify behavior for online, known offline, unknown, API unavailable, and foreground resume. Test each while a cached catalog and one pending cart write exist.')

add('offline',3,'Offline writes and durable outboxes','Make local promises survive process death.',45,
 ['Design a persisted operation state machine.','Reconcile a lost acknowledgement.','Resolve ordering, conflicts, and account boundaries.'],r'''
 ## Offline support is a product promise
 Choose which operations are available offline. Reading a downloaded catalog, drafting a cart, reserving inventory, and confirming payment are different promises. A local draft does not reserve server stock. Never label a queued write “confirmed” because it appears in your local database.

 A **durable outbox** is a persisted record of operations the app intends to send. For recoverable local work, commit the local change and outbox row together in a database transaction when your storage supports it. Otherwise, a crash can save the visible change without saving the work needed to synchronize it.

 ## Record enough to recover
 A row can include operation ID, account/tenant scope, operation type, schema version, payload, resource ID, dependency/version information, state, attempts, next eligible time, creation time, and last safe error. Do not embed a long-lived bearer token in each row. Obtain credentials for the correct current identity at send time.

 ```text
 queued → sending → acknowledged → reconciled
              ↘ outcome-unknown → status check / same-key replay
              ↘ retry-wait → queued
              ↘ rejected / conflict → user or domain resolution
 ```

 “Sending” left on disk after process death is not proof of success or failure. Recover it into an uncertain state and reconcile. Delete/archive only when the durable outcome has been handled. Keep a visible pending indicator and a safe way to explain stalled work.

 ## At least once, with safe effects
 A client may resend after losing an acknowledgement. Server idempotency provides safe duplicate handling under its documented scope and retention. Without it, an outbox alone can duplicate orders. Persist the same logical identity across restarts. A response lost after server commit is the core recovery case, not an edge case to ignore.

 Send dependent writes in order: an attachment may depend on a created record. Different independent resources can use bounded parallelism. A poison operation that always fails validation should not block every other resource forever. Classify permanent failure, retryable failure, and conflict; cap or park retries and surface a repair path.

 ## Conflict resolution is domain-specific
 If two devices edit one cart, use explicit versions, conditional writes, merging rules, or user resolution. Last-write-wins is only appropriate when losing an intermediate edit is acceptable, and device wall clocks are not a reliable global ordering mechanism. CRDTs are specialized merge-friendly data structures; they do not automatically encode inventory, payment, or permission rules.

 A queued operation can become invalid when prices change, a resource is deleted, permissions are revoked, or idempotency retention expires. Revalidate business rules server-side. Decide how long old work remains eligible. Don't replay last month's order simply because a connection finally returned.

 ## Identity and migrations
 On logout, do not send user A's outbox with user B's credentials. Define whether to delete, retain securely but pause, or require explicit resolution for unsynced data. Migrate outbox schemas across app updates and test interrupted migrations. A persisted TanStack mutation cache may help a specific workflow but is not automatically a complete transactional domain outbox, conflict engine, or long-term credential policy.
 ''',[
 q('The app dies with an outbox row marked sending. What is safe on restart?','Treat the outcome as uncertain and reconcile with the stable operation identity.','Assume the server committed.','Assume the server rejected and create a new identity.','Process death can happen before or after the server commit. Durable recovery must handle both without duplicating effects.'),
 q('Why commit the local update and outbox row together?','To avoid a crash saving one without the other.','To encrypt all network traffic.','To make authorization unnecessary.','Atomic local persistence prevents a visible change from losing its synchronization intent, or the reverse.'),
 q('Can an old account’s outbox be sent with a new account’s token?','No; operations must remain bound to their owning identity.','Yes, if the endpoint path is unchanged.','Yes, after an app restart.','Identity isolation applies to durable writes as well as caches. Choose an explicit logout/unsynced-data policy.')],['aws-retry','tanstack-persist','http'],
 'Design an outbox schema and recovery table. Walk through crashes before send, after server commit, after response receipt, and before local acknowledgement. Explain each recovery action.', 'outbox')

add('background',3,'Background work without impossible promises','Understand OS scheduling, native transfers, and push.',30,
 ['Separate foreground JS from OS-managed work.','Choose the right scheduling mechanism.','Communicate background limitations honestly.'],r'''
 ## The OS owns execution time
 A foreground JavaScript timer is not a service that can run forever. iOS and Android restrict background execution to protect battery, memory, privacy, and user control. The app can be suspended, terminated, or force-stopped. A permanently open WebSocket or `setInterval` loop does not override these rules.

 Use background work for a product need with a supported platform mechanism. There are several different categories: short completion time after a state transition, deferred synchronization, user-visible long-running transfers, and push-triggered opportunities. Each has different permissions, limits, and lifecycle rules.

 ## Deferred scheduling
 Expo BackgroundTask uses native schedulers: WorkManager on Android and BGTaskScheduler on iOS. Android periodic work has a minimum interval of 15 minutes in the documented integration, and the OS may run it later. iOS chooses suitable execution opportunities. A requested interval is not a precise alarm or guaranteed execution time. Availability and testing support vary; current Expo docs state iOS background tasks require a physical device.

 WorkManager is designed for persistent work subject to constraints and OS rules, not arbitrary exact second-by-second updates. Force-stop/user termination behavior differs by platform and mechanism. Persist enough state to safely resume later, and always reconcile on foreground launch rather than relying exclusively on a background callback.

 ## Transfers are a separate mechanism
 Native background URLSession on iOS can transfer files while the app is suspended, with session identifiers and delegate/lifecycle integration. An ordinary JS Fetch Promise is not equivalent. Android offers several transfer/work mechanisms whose suitability depends on duration, user initiation, target SDK, and current restrictions. Pick a maintained React Native integration and verify that it uses the right native mechanism.

 Persist transfer identifiers and metadata, handle completion when the JS process is recreated, move temporary files correctly, and reconcile server state. OS-managed transfer does not itself guarantee the business operation is valid, deduplicated, or authorized forever.

 ## Push is a hint, not the database
 A push can inform the user or suggest fetching new data. Delivery can be delayed, coalesced, denied, or unavailable. A silent push does not guarantee a background wake, and a notification's contents are not an authoritative order state. Fetch or reconcile through your API, and avoid putting secrets or unnecessary personal details into push payloads.

 ## Product language should match reality
 Prefer “Will sync when the app can connect” over “Guaranteed every five minutes” unless your actual mechanism and contract support that guarantee. Show queued/synced state and last successful sync. Let users manually retry in the foreground.

 Test charging and unplugged states, battery saver, network constraints, locked device, process termination, reboot, permission changes, and a release build. A debug “run task now” hook proves your handler works when invoked; it does not prove the OS will invoke it on your desired schedule.
 ''',[
 q('Does setInterval keep a React Native app syncing after OS suspension?','No; use supported native scheduling and recover on resume.','Yes, if the interval is short.','Yes, with a global variable.','Background execution is governed by the operating system. JS timers are not an execution entitlement.'),
 q('A background task requests a 15-minute interval. What should the UI promise?','A best-effort sync opportunity subject to OS rules.','Exactly one sync every 15 minutes.','Guaranteed execution after force-stop.','Minimum intervals and scheduling requests are not precise execution guarantees.'),
 q('Should an order status notification be the only source of truth?','No; reconcile through the authoritative API.','Yes; push delivery is guaranteed and ordered.','Yes; notifications never become stale.','Push is a delivery channel with delays and omissions. Treat it as a hint or user message, not a durable state ledger.')],['expo-background','android-work','apple-background-text'],
 'Write a sync promise your product can honestly make. Choose foreground refresh, deferred work, native transfer, or push for each of catalog refresh, photo upload, and delivery notification.')

add('files',3,'Uploads, downloads, and large payloads','Treat bytes as a resource, not just another JSON field.',35,
 ['Use multipart and signed uploads safely.','Design resumable/background transfers.','Bound memory, concurrency, and retry costs.'],r'''
 ## Choose the transfer shape
 Small JSON endpoints are convenient; large binary files need another path. Base64 inflates size by roughly one third before other overhead and can cause multiple in-memory copies. Prefer file-backed native transfer APIs where supported. File URIs, content URIs, Blob/FormData implementations, and streaming features differ by library/platform version: verify your exact runtime.

 For multipart FormData, let the chosen transport generate the multipart boundary rather than manually setting a bare `Content-Type: multipart/form-data`. Include file name, media type, and supported file reference correctly. The server must verify authorization, size, actual file type, and other safety rules; client checks improve UX but are bypassable.

 ## Signed direct uploads
 A common flow is: ask your API for an authorized upload session; receive a short-lived, tightly scoped signed destination; transfer the file to storage; tell the API to finalize; have the server validate and attach the object to the resource. Do not send your normal API bearer token to a third-party signed URL unless that endpoint explicitly requires it. Treat the URL itself as a sensitive capability.

 A successful byte upload is not the same as the business record being finalized. You can have an orphaned object or a completed upload whose finalization reply was lost. Use stable transfer/operation IDs and idempotent finalization. Clean up incomplete or expired uploads according to a server-side policy.

 ## Resume requires a protocol
 Retrying a 500 MB upload from byte zero is expensive. Resumable transfer uses a server-defined session, offsets or parts, checksums, and final assembly rules. Persist the session and local file reference; handle URL/session expiration and verify the source file has not changed. A generic Fetch retry cannot create a resumable protocol by itself.

 Downloads may use range requests only if the server and representation support them. Combine ranges with an appropriate validator so you do not append bytes from a changed version. Verify integrity using a trusted digest when required. Move temporary files into durable storage correctly, enforce storage quotas, and handle low-disk conditions.

 ## Progress must mean what it says
 Upload progress indicates bytes handed to a transport or sent, depending on the API. It does not prove server-side validation, persistence, or attachment succeeded. Show “uploading,” “processing,” and “complete” distinctly. Native progress may require XMLHttpRequest or a library/OS transfer mechanism; do not assume ordinary Fetch exposes all upload progress callbacks.

 Bound concurrent uploads, compress/resize images appropriately, respect metered connections and user settings, and support cancellation. For long work that must continue while suspended, use a genuine native background transfer integration. Expo FileSystem APIs and legacy APIs vary by SDK, so check the installed version rather than copying old snippets.

 **Failure drill:** upload succeeds, then the app dies before finalization. On restart, recover the transfer record, query status, and safely finalize or clean up. Never infer that the photo is attached just because every byte left the phone.
 ''',[
 q('Why avoid Base64 for a large image when a file-backed transfer is available?','It increases size and can cause expensive memory copies.','It automatically leaks the access token.','It makes TLS impossible.','Base64 adds about 33% size overhead and often additional buffering, which matters on mobile devices.'),
 q('The upload is at 100%. Is the business workflow necessarily complete?','No; server validation/finalization may still be pending.','Yes; the record must be attached.','Yes; checksums are no longer needed.','Byte transfer progress and authoritative workflow completion are different stages.'),
 q('Should your API bearer token be sent to every signed storage URL?','No; send only credentials explicitly required by that destination.','Yes; all upload URLs need the API token.','Yes; it improves tracing.','Signed URLs are scoped capabilities. Avoid leaking unrelated API credentials to storage/CDN or third-party hosts.')],['expo-file','apple-background-text','http'],
 'Design create-session → transfer → finalize → reconcile for a photo. Include expiry, app death, cancellation, checksum validation, low disk, and cleanup of orphaned uploads.')

add('realtime',3,'Real-time data and reconnecting streams','WebSockets, SSE, polling, and missed events.',35,
 ['Choose a real-time mechanism by product needs.','Reconnect without losing state or creating storms.','Bound message buffering and handle session changes.'],r'''
 ## Pick the simplest adequate channel
 **Polling** makes periodic reads. It is simple but adds traffic and battery cost; slow it down or stop it when the screen is inactive, and use conditional reads when appropriate. **Server-Sent Events (SSE)** provide a server-to-client event stream over HTTP. **WebSocket** supports bidirectional messages on a long-lived connection. A chat app and an order-status screen may need different choices.

 React Native exposes WebSocket. Browser EventSource and streaming Fetch behavior should not be assumed across every native runtime: choose and test an appropriate maintained implementation. Socket.IO is its own higher-level protocol; a raw WebSocket server is not automatically compatible with a Socket.IO client.

 ## A socket is not durable state
 Connections break during network switches and suspension. Reconnect with bounded exponential backoff and jitter, authenticate correctly, resubscribe, and reconcile missed data. Refresh expired credentials without creating multiple simultaneous sockets or using a token from an old account. Remove listeners and close obsolete connections.

 A robust event contract defines event IDs or sequence numbers, resource identity and version, ordering scope, duplicates, retention, and replay/resume behavior. On reconnect, use a resume cursor if the server supports it. If the cursor is too old or a gap is detected, fetch a fresh snapshot. Deduplicate events; do not count duplicate delivery as a second business action.

 ## Ordering has a scope
 TCP gives ordered bytes within one connection. It does not make events across reconnections or different channels globally ordered. A REST refresh can race with socket events. Apply resource versions or a well-defined merge strategy so an old snapshot does not overwrite a newer event. If a stream only says “something changed,” invalidate a relevant query rather than pretending the message is a complete authoritative object.

 ## Heartbeats and backpressure
 Application heartbeats help detect a half-open connection, but frequent pings cost radio time and battery. Respect infrastructure idle timeouts and native background rules. The standard WebSocket API has no automatic application backpressure. Bound queues, coalesce replaceable updates, drop explicitly disposable messages, or disconnect/resync if the consumer falls too far behind. Do not let an unbounded message list fill memory.

 With SSE, event IDs and reconnection support depend on the server/client implementation; do not assume every library persists a resume token across process death. With polling, avoid overlapping requests and synchronized refresh bursts across all clients.

 ## Security still applies
 Use `wss://` in production. Authenticate the connection and authorize subscriptions/resources server-side. Avoid tokens in URLs when a safer supported mechanism exists, because URLs leak into logs. Validate messages as runtime data. Limit message size and subscription fanout. Test duplicate messages, missed ranges, token expiry, reconnect storms, malformed events, and a logout while a reconnect is pending.
 ''',[
 q('Does TCP ordering guarantee global event order across reconnects?','No; use server-defined sequence/version and resume semantics.','Yes; the phone remembers every lost message.','Only when using JSON.','Transport ordering is scoped to the connection. Application continuity requires explicit event identities and recovery.'),
 q('The resume cursor is older than the server’s replay retention. What now?','Fetch a fresh authoritative snapshot and resume from a valid point.','Assume no updates were missed.','Replay the cursor forever.','A replay gap cannot be repaired by wishful retries. The protocol needs a full-resynchronization path.'),
 q('Messages arrive faster than the app can process them. What is needed?','A bounded buffering/coalescing or resync policy.','An unlimited in-memory array.','More frequent heartbeats.','The standard WebSocket API does not provide automatic application backpressure. Bound memory and define overload behavior.')],['rn-networking','websocket','rn-appstate'],
 'Design order-status events with IDs and versions. Explain reconnect after a 20-minute gap, duplicate delivery, REST/socket races, token expiry, and background suspension.')

add('protocols',3,'REST, GraphQL, RPC, and protocol choices','Choose contracts for the team and the device you actually have.',25,
 ['Compare common API styles without treating one as magic.','Handle GraphQL partial results and RPC constraints.','Keep cross-cutting guarantees explicit.'],r'''
 ## API style is not reliability policy
 REST commonly models resources and uses HTTP methods/statuses. GraphQL lets clients request a typed shape through operations against a schema. RPC models calls to named procedures; gRPC commonly uses Protocol Buffers and HTTP/2 with generated clients. Every style still needs authentication, authorization, version compatibility, deadlines, retries, cache rules, and observability.

 Choose based on team skills, backend capabilities, payload patterns, tooling, and supported native clients. A screen-oriented backend-for-frontend can reduce waterfalls without forcing every service to adopt the same public protocol. Avoid exposing a complex internal service topology directly to the phone unless it serves a clear need.

 ## GraphQL has two error layers
 A transport can succeed while a GraphQL response includes both `data` and `errors`. Partial field failures may be usable if your UI and cache handle them intentionally. Do not infer complete business success from HTTP 200 alone. Request/validation failures and transport status behavior also depend on media type and the GraphQL-over-HTTP contract; use a compatible client and current specification.

 Define an error policy for partial data, stable operation names for telemetry, and normalized-cache identities if using a normalized client. Protect sensitive fields with server authorization. Query depth/complexity limits, rate limiting, and persisted/allowlisted operations can limit abuse and improve predictability. Query variables can contain personal data; avoid logging them indiscriminately.

 HTTP POST for GraphQL does not make every operation a mutation or unsafe to retry: inspect operation semantics. Conversely, a mutation transported through a conventional endpoint is not safe just because the response is typed. Retry and idempotency belong to the operation contract.

 ## RPC and native compatibility
 gRPC can offer strong schemas, generated code, and streaming, but ordinary React Native Fetch is not a complete native gRPC client. You may need a maintained native bridge, platform clients, gRPC-Web-compatible infrastructure, or another transport. Verify build support, cancellation, TLS, background behavior, and release compatibility before adopting it.

 Binary encoding can reduce payload size for some workloads but adds tooling and debugging considerations. Measure before optimizing. “Binary” does not mean encrypted. Schema evolution still needs rules for unknown fields, optional values, and old installed versions.

 ## One consistent boundary
 Whatever the style, keep typed domain operations above transport. Make retry ownership, trace propagation, credential destinations, and error categories consistent. If the app mixes public REST, an identity SDK, uploads, and a socket, inventory each path: the main API client's interceptors may cover only one of them.

 A production architecture decision should name the constraints it satisfies and how it will be tested. “Popular,” “modern,” and “the same as our web app” are not sufficient reasons when the native runtime has different capabilities.
 ''',[
 q('A GraphQL response has HTTP 200 plus data and errors. Is everything successful?','Not necessarily; interpret partial results using an explicit error policy.','Yes; HTTP 200 guarantees every field succeeded.','No; discard all data in every product.','GraphQL can represent partial execution results. Decide which data is safe and useful for the screen.'),
 q('Does ordinary React Native Fetch provide a complete native gRPC client?','No; validate an appropriate client/bridge and infrastructure.','Yes; set Content-Type to protobuf.','Yes; HTTP/2 alone is enough.','gRPC includes framing, schemas, status semantics, and often streaming beyond changing a Fetch header.'),
 q('Which concern disappears when using a typed API schema?','None of authorization, runtime failure, or compatibility disappears.','All runtime failures.','All old-client compatibility work.','Schemas help agreement and generation, but distributed failures and security decisions still need explicit handling.')],['graphql','http','rn-networking'],
 'Write a one-page API choice for Fieldcart. Compare REST, GraphQL, and RPC against offline recovery, native tooling, caching, observability, and the team’s operational experience.')

add('logs',4,'Logs, breadcrumbs, and analytics','Different evidence for different questions.',35,
 ['Separate product analytics, diagnostics, and audit records.','Design a safe structured request event.','Correlate reports without collecting raw sensitive data.'],r'''
 ## Start with the question
 **Product analytics** asks how people use a feature: did a catalog view lead to checkout? **Diagnostic logs** describe system behavior: request attempt 2 timed out. **Breadcrumbs** are a small ordered trail before an event. **Audit records** capture security/business actions with stronger durability and integrity requirements, normally enforced server-side. Do not use a sampled client analytics event as your authoritative payment or security ledger.

 An **observation** is a measurement or recorded event. **Observability** is the system's ability to explain its internal behavior from emitted evidence. You want to answer new questions without shipping another build just to add a print statement. That requires thoughtful signals, not unlimited collection.

 ## Use a structured vocabulary
 A useful request-attempt event can include an event name, route template, method, operation type, attempt number, duration, outcome category, status if one exists, server request ID if returned, trace/span IDs when present, app release, OS version, and a bounded connectivity category. Use fields a person or tool can query; avoid a single enormous string.

 ```json
 {
   "event": "api.attempt.completed",
   "route": "/orders/:id",
   "method": "GET",
   "attempt": 2,
   "duration_ms": 842,
   "outcome": "http_error",
   "http_status": 503,
   "release": "2.4.0+118",
   "network_type": "cellular"
 }
 ```

 This is a safe-shape example, not a universal schema. Add identifiers only where policy allows. A local operation ID connects retries; a per-attempt request ID distinguishes actual calls; a trace ID connects causally related spans. Do not put access tokens into any of them. Hashing a stable user ID can still be personal data depending on context.

 ## Collect enough, not everything
 Normalize `/orders/abc123?email=...` to `/orders/:id` and strip query values. Allowlist headers and fields. Error messages and stack contexts may accidentally contain user input or response fragments. Scrub on-device before transmission where feasible, and inspect actual payloads in a test environment. Server-side scrubbing is defense in depth, not permission to send raw passwords.

 Keep a small bounded breadcrumb ring rather than storing a full unbounded history. Limit on-device telemetry queue size, retention, upload batch size, and retry budget. Telemetry itself uses networking and battery; a monitoring outage must not freeze checkout or trigger infinite recursive logging.

 ## Correlation and privacy
 A user report can include app version, approximate time, a safe support/request ID, and a description of the visible state. Support should not ask for tokens or full sensitive request bodies. Secure access to logs, define retention/deletion, and restrict who can inspect user-linked diagnostics. Respect applicable consent and data rules.

 Dedupe and sample repetitive events deliberately, but preserve enough context for serious failures. Sampled diagnostic logs cannot directly establish total failure counts unless the sampling model is accounted for. Keep product conversion metrics separate from low-level attempts so retry storms do not look like increased user engagement.
 ''',[
 q('Which record should be authoritative for a charged order?','A durable server-side business/payment record.','A sampled mobile analytics event.','A console.log line on the phone.','Client telemetry may be missing, delayed, duplicated, or manipulated. Business truth needs an authoritative server workflow.'),
 q('What route value is best for a metric or general diagnostic event?','A normalized template such as /orders/:id.','A full URL containing email and signed parameters.','The access token.','Route templates reduce sensitive leakage and unbounded distinct values while preserving useful grouping.'),
 q('What should happen if the telemetry endpoint is down?','Bound and defer telemetry without blocking the main user operation.','Block all API calls until every log uploads.','Retry logs recursively without a cap.','Observability networking must have its own resource budgets and should not create a new production outage.')],['otel','sentry-data'],
 'Define a safe api.attempt.completed event and a user-operation event. List fields you intentionally exclude. Capture and inspect emitted telemetry for a login, search, and failed order.')

add('metrics',4,'Metrics, percentiles, and useful alerts','Measure reliability from the user’s point of view.',40,
 ['Define SLIs with explicit denominators.','Separate operation success from attempt success.','Interpret tail latency, sampling, and error budgets.'],r'''
 ## Begin with an SLI
 A **service-level indicator (SLI)** is a defined measurement of behavior. A **service-level objective (SLO)** is a target over a time window. An **error budget** is the allowed amount of bad behavior under that definition. An SLA is a separate agreement, often contractual; do not use the terms interchangeably.

 For catalog loading, define a user operation as beginning when the user requests the screen and ending when useful content appears or the operation fails. An illustrative SLI could be “eligible foreground catalog operations that show useful content within 2 seconds / all eligible foreground catalog operations.” Explicitly define cache hits, intentional cancellation, known offline use, missing telemetry, unsupported versions, and partial data. Do not quietly exclude inconvenient failures to make the chart green.

 ## Attempts and operations answer different questions
 Suppose 100 operations generate 120 HTTP attempts. Twenty first attempts fail transiently and all twenty retries succeed. Operation success can be 100%, while attempt success is 100/120, about 83.3%. Both are informative: users recovered, but the network/service is doing extra work and may have added latency. Reporting only final success hides deterioration.

 A crash or process kill can prevent a completion event. Pair start/completion where feasible and define orphaned operations or server-confirmed outcomes instead of counting only received success events. Mobile telemetry may upload hours later; distinguish event time from ingestion time.

 ## Tail latency matters
 The median, or p50, is the middle observed value. p95 is a threshold at or below which about 95% of the chosen observations fall, depending on the quantile method. It is not “95% faster than average.” A mean can hide a slow minority. Measure request duration, useful-content duration, and parsing/render work separately where practical.

 Use histograms with sensible buckets for aggregation. Do not average per-device p95 values and call the result the overall p95. Compute a population quantile from an appropriate mergeable distribution or raw observations. Document whether failed/time-out operations are included; measuring only successful requests creates survivorship bias.

 ## Choose bounded dimensions
 Useful breakdowns can include route template, operation type, app release, OS family, region/coarse network category, and outcome class. Raw user IDs, request IDs, search strings, and full URLs create high-cardinality metrics and may expose personal data. Such identifiers belong, if allowed, in controlled logs/traces rather than general metric labels.

 Track error rate, latency distribution, attempts per operation, retry exhaustion, cache hit/freshness, outbox age/depth, conflict rate, auth refresh failure, upload completion, and reconnect gaps. Pick a small actionable set first; define an owner and response for each alert.

 ## Alerts should reflect impact
 A 99.5% objective over 10,000 eligible operations permits 50 bad operations under that definition. Watch error-budget burn over appropriate windows and segment by release/platform to detect a bad rollout. Low traffic needs different statistical care. A single device's weak signal should not page the whole team; a widespread checkout failure should.

 Sampling must be accounted for. Failure-biased traces are excellent for diagnosis but do not represent unbiased population success rates. SDK dashboards may use different sampling pipelines for metrics and traces: verify the product's semantics before treating counts as a denominator.
 ''',[
 q('100 operations produce 120 attempts, of which 100 succeed. What is attempt success?','About 83.3%, while operation success may still be 100%.','120%.','Always 100% if retries recover.','Define the denominator. Retry recovery can preserve final success while hiding failed attempts and extra latency.'),
 q('Can you average each phone’s p95 to get the overall p95?','No; aggregate the underlying distribution appropriately.','Yes, always.','Yes, if each p95 is in milliseconds.','Percentiles are not generally additive or averageable across populations. Use mergeable histograms or the combined observations.'),
 q('At a 99.5% SLO over 10,000 eligible operations, what is the error budget?','50 bad operations under that SLI definition.','500 bad operations.','5,000 bad operations.','The allowed bad fraction is 0.5%. Multiplying 10,000 by 0.005 gives 50; eligibility and the window must be explicit.')],['otel','aws-retry'],
 'Write one catalog SLI and one order-submission SLI with start/end, denominator, exclusions, offline policy, missing-event handling, dimensions, target, and owner.', 'metrics')

add('traces',4,'End-to-end traces that actually connect','From a tap to the API, downstream calls, and database.',45,
 ['Explain spans, parentage, and propagation.','Connect a supported mobile SDK to compatible backend instrumentation.','Recognize sampling gaps and timing limits.'],r'''
 ## A trace tells a causal story
 A **trace** represents a connected operation. A **span** records one timed unit of work with a name, identity, parent relationship, attributes, and outcome. A trace ID groups the story; span IDs distinguish its parts. A request ID is useful correlation but is not automatically a distributed trace.

 For Fieldcart, a user span `catalog.load` may contain an HTTP client span. The API extracts incoming context and creates a server span. Database and downstream calls create children. Response parsing and rendering can have their own measured work where the integration supports it. A checkout with retries should preserve one operation identity and distinguish each attempt.

 ```text
 catalog.load                       [user intent → useful content]
   GET /products                    [client attempt]
     GET /products                  [API server]
       inventory.lookup             [downstream service]
       SELECT products              [database]
   catalog.decode                   [app work, if instrumented]
 ```

 ## Context crosses the network
 W3C Trace Context defines `traceparent` and `tracestate`. A typical version-00 header has a version, 32-hex-character trace ID, 16-hex-character parent/span ID, and flags. Each span gets its own identity; do not reuse a hardcoded example or generate a new unrelated trace in every service. Let a supported SDK generate, validate, and inject context.

 The server must **extract** the incoming context, create the request span with the right parent, and **inject** current context into downstream calls. Add trace/span IDs to structured logs where supported. Without propagation on either side you get disconnected traces, even if both dashboards show spans.

 ## React Native requires a supported integration
 Do not paste a Node.js auto-instrumentation bootstrap into a React Native app and assume native HTTP, navigation, startup, or async context are covered. OpenTelemetry's JavaScript runtime support and individual instrumentations must be checked against your React Native/runtime version. Choose an explicitly supported mobile integration, test its transport coverage, and document gaps.

 One concrete option is the maintained Sentry React Native SDK with a matching supported backend SDK. Its distributed tracing uses Sentry's documented `sentry-trace` and `baggage` propagation, so it is not correct to claim that adding only W3C `traceparent` completes that setup. Configure `tracePropagationTargets` for your own API destinations, instrument the backend, create a test transaction/operation, and verify the parent-child relationship in one actual trace. Follow the exact installed SDK version's API. Sentry and OpenTelemetry concepts overlap, but wire formats and integration paths require explicit compatibility.

 ## Propagation needs boundaries
 Only propagate to approved hosts; a broad substring match can accidentally include an attacker-controlled hostname. Never put tokens, emails, or other sensitive payload in baggage. At public boundaries, treat incoming trace context as untrusted metadata, validate it, and enforce sampling/rate budgets. A trace header grants no authorization. Browser clients may also require CORS header configuration; native clients do not gain browser rules merely by adding trace headers.

 ## Read traces carefully
 A missing span may mean unsampled work, unsupported instrumentation, dropped telemetry, a propagation bug, or a real failure before the server received anything. Head sampling chooses early; tail sampling chooses after more outcome information is available and often needs infrastructure support. Biased samples are diagnostic evidence, not automatically population metrics.

 A client span longer than its server child can include connection/setup, transit, queueing, transfer, and app work; check the SDK's exact span boundary. Clocks on different machines can be skewed. Distinguish sequential from parallel spans: the **critical path** determines elapsed time, not the sum of overlapping child durations. End-to-end means you have verified every boundary you claim to cover.
 ''',[
 q('Both app and API create spans but use unrelated trace IDs. What is missing?','Compatible context propagation and parent extraction/injection.','A longer timeout.','A shared access token in baggage.','Instrumentation in two services does not automatically connect them. Context must cross the request boundary in a compatible format.'),
 q('Can you drop Node auto-instrumentation into React Native and assume full coverage?','No; verify an explicitly supported runtime and mobile integration.','Yes; JavaScript is identical everywhere.','Yes, if TypeScript compiles.','Native networking, async context, navigation, and startup need compatible instrumentation. Successful compilation does not prove coverage.'),
 q('What does a missing server span prove?','Nothing by itself; inspect sampling, propagation, coverage, and actual receipt.','The server definitely never saw the request.','The API definitely succeeded.','Telemetry can be absent for many reasons. Correlate with logs and request evidence before drawing an outcome conclusion.')],['tracecontext','otel-context','otel-js','sentry-rn','sentry-distributed'],
 'Capture a real app-to-API trace in a development environment. Verify shared trace identity, correct parentage, one child per actual attempt, downstream propagation, safe attributes, and the documented sampling policy.', 'trace')

add('debug',4,'A repeatable debugging workflow','Use tools to test a hypothesis, not just stare at traffic.',35,
 ['Move from symptom to layer-specific evidence.','Choose DevTools, native logs, proxies, and server logs appropriately.','Recognize version and instrumentation coverage gaps.'],r'''
 ## Begin with a reproducible report
 Record the visible symptom, expected result, app build, OS/device, network context, account scope without secrets, approximate event time, and safe operation/request ID. Ask whether it affects one user, one platform, one release, one endpoint, or everyone. Preserve the user's unsynced work before recommending a destructive reset or reinstall.

 Follow a ladder: configuration → connectivity/DNS → TLS → HTTP → schema → cache/state → rendering. At each rung, form a hypothesis and choose evidence that could disprove it. “It is the network” is too broad to guide an investigation.

 ## Pick the right instrument
 React Native DevTools' built-in Network and Performance panels are documented from **React Native 0.83**. The retrieved docs describe recording Fetch, XMLHttpRequest, and Image requests; custom transports and Expo-specific behavior have coverage differences. They also list limitations such as WebSocket events, response mocking, and simulated throttling. Recheck your installed version; an absent event may be a tool gap. Older setups may use other supported inspection tools.

 Use Xcode device logs and Android Logcat for native trust, DNS, socket, and lifecycle errors. A desktop HTTP client can establish that an endpoint works from your laptop, but it does not reproduce the phone's native trust store, network route, app lifecycle, or auth state. Do not treat a successful curl call as proof that the app must work.

 A development proxy can inspect permitted test traffic and simulate conditions. It requires correct routing and a test-device CA/trust setup; release certificate pinning may intentionally block interception. Use debug-only trust changes, redact captures, and never weaken release validation to make a proxy convenient. Your proxy may also change protocol negotiation and timing.

 ## Work through a slow request
 1. Compare user-operation duration with HTTP-attempt duration.
 2. Count attempts and waits. Is a query library or interceptor retrying?
 3. Correlate the server request ID/trace. Check backend and database time.
 4. Inspect cold/warm connection behavior, payload size, and transfer cost where observable.
 5. Measure body parsing, validation, cache update, and rendering.
 6. Segment by app release, OS, device class, and network category.

 Do not invent DNS timings from a generic JS timer. Do not compare raw wall-clock timestamps from different devices as a precise latency measurement.

 ## Common misleading observations
 “HTTP 200 but broken screen” may be a schema mismatch, partial GraphQL error, swallowed exception, image failure, or stale cache. “Only release fails” often suggests environment config, native module setup, certificate trust, build optimization, or missing production permissions. “Duplicate orders” requires operation identities and server logs; a double-render explanation alone is insufficient. “Only on cellular” suggests route/carrier/VPN/IPv6, metering, or timing differences as well as app logic.

 Write down the hypothesis, observation, conclusion, and next test. Keep sanitized traces/screenshots as incident evidence, and add a regression check that targets the confirmed failure rather than every speculative theory.
 ''',[
 q('curl succeeds on your laptop. What has that proved?','The endpoint worked from that laptop under those request conditions.','The phone’s TLS and routing must work.','The mobile app cannot have a networking bug.','Different devices can use different DNS, trust stores, routes, credentials, and lifecycle behavior.'),
 q('A request is missing from DevTools. What should you check first?','Your version and the tool’s transport/event coverage.','Assume the request never happened.','Disable all release certificate checks.','Inspection coverage is version- and transport-dependent. Native logs and server evidence may be needed.'),
 q('What is a good first step for a slow screen?','Separate operation time, attempts/backoff, server time, and app processing.','Increase every timeout.','Add retries at every layer.','A phase breakdown and attempt count narrows the cause. Longer waits and more retries can hide or amplify it.')],['rn-devtools','android-security','otel'],
 'Use the incident notebook to investigate “catalog takes 8 seconds on cellular.” Record three hypotheses and the observation that would falsify each. Do not change code until one has evidence.', 'diagnosis')

add('testing',5,'Test failures before users find them','A practical test pyramid for mobile networking.',40,
 ['Separate policy tests from native network verification.','Build a deterministic failure matrix.','Exercise process death and lost acknowledgements.'],r'''
 ## Test the promise at the right layer
 Unit-test pure decisions such as retry eligibility, backoff bounds, error mapping, query-key construction, schema validation, and outbox state transitions. Inject clocks and randomness so tests are deterministic. Integration-test screens against controlled responses so loading, stale data, errors, and retry actions are exercised together. Contract-test client assumptions against the API schema and real server behavior.

 Native device/end-to-end tests cover what mocks cannot prove: certificate trust, ATS/Android config, cookie redirects, file/content URIs, actual native transports, background behavior, and release build configuration. A Jest Fetch mock cannot prove those work.

 ## Mock the boundary accurately
 MSW can intercept at useful request boundaries, but setup depends on environment. The retrieved current React Native guide uses `@msw/react-native`, importing its environment setup before MSW handlers, configuring `network`, and enabling it only in development/test. It explicitly says older `msw/native` setup has been removed. Node-based component tests instead use the documented Node integration. Pin versions and follow the current guide for the version installed.

 No mocking library automatically covers every native file transfer or SDK transport. Verify each path you rely on. Keep production mock code disabled and test the release artifact. Use a controlled mock API or network fault tool when you need server-side effects plus response loss.

 ## A minimum failure matrix
 - Responses: valid JSON, malformed JSON, incompatible schema, empty `204`, partial GraphQL data, very large body.
 - Status: 401, 403, validation failure, conflict/precondition failure, 429 with both Retry-After forms, and transient 5xx.
 - Timing: slow headers, slow/stalled body, out-of-order reads, deadline, explicit cancellation.
 - Connectivity: DNS failure, invalid certificate, captive portal, no route, Wi-Fi/cellular transition.
 - Lifecycle: background, resume, process death, reboot, logout/account switch during a request or refresh.
 - Writes: duplicate taps, concurrent retries, response lost after commit, expired deduplication retention, conflict from another device.
 - Storage: full disk, failed credential persistence, interrupted outbox migration, stale account cache.

 ## Assert outcomes, not implementation trivia
 For a lost order response, assert that one business order exists, the operation identity survives restart, and the UI reconciles correctly. Do not merely assert that `fetch` was called once: safe recovery may correctly require another attempt. For retry timing, assert allowed bounds and budget behavior with a fake clock instead of waiting through real delays.

 Test accessibility and message correctness too. A screen that says “saved” for an unacknowledged outbox row is a failure even if every unit test about function calls passes. Verify that credentials and personal data never appear in captured diagnostic payloads.

 ## From deterministic tests to chaos
 Start with one controlled fault and a known expected result. Then combine realistic failures: token expires while connectivity flaps and the app backgrounds, for example. Use staging/test accounts and bounded load. A chaos exercise is useful only if the team can explain the outcome and recover. Finish by preserving the smallest regression case that reproduces a confirmed bug.
 ''',[
 q('What can a mocked Fetch test not prove?','Native certificate trust and release transport configuration.','That the UI shows an error for a controlled mocked failure.','That your pure retry predicate returns a value.','Mocks exercise application behavior at a boundary. Real native integration still needs device/release verification.'),
 q('What is the strongest assertion for a lost order acknowledgement?','One business effect exists and the app recovers its stable operation outcome.','fetch was called exactly once in every scenario.','The spinner disappeared.','The actual promise is safe business behavior and recoverability, not a universal fixed transport call count.'),
 q('Which native MSW setup should you blindly copy?','None; use the current integration for your installed version.','Any old msw/native tutorial.','A Node http interceptor inside the device app.','The retrieved current guide uses @msw/react-native; APIs evolve and Node-only modules do not automatically work on-device.')],['msw-native','rn-networking','android-security'],
 'Build six deterministic tests: malformed body, stale search race, retry budget, concurrent refresh, logout during refresh, and lost acknowledgement after server commit. Add real-device TLS and process-death checks.')

add('performance',5,'Performance, battery, and cost','Optimize the full experience with measured tradeoffs.',30,
 ['Reduce waterfalls, bytes, and redundant work.','Balance freshness against battery and data cost.','Measure release builds on realistic devices.'],r'''
 ## Optimize a measured bottleneck
 First establish a baseline: time to useful content, request/attempt counts, payload bytes, cache usefulness, JS processing, memory, and battery-relevant scheduling behavior. Measure a release build on a representative device and network. Debug instrumentation and emulators can distort performance; a desktop benchmark is not the same workload.

 Make independent requests concurrent when appropriate, remove N+1 patterns, and avoid fetching data that the screen never uses. Use pagination and field selection instead of a giant “everything” payload. Compress text where server/client stacks support it. For media, request the size and format the display needs. Repeated megabyte thumbnails can dominate a small JSON API.

 ## Cache deliberately across layers
 A CDN can reduce server load for public cacheable content. Native HTTP caches and image libraries can reuse representations. The query cache coordinates app data and UI state. Each has its own keys, expiry, and privacy boundaries. Check `Vary`, authorization, cookies, and cache-control rules before allowing shared caching. Private user data must not leak through a public cache key.

 ETag revalidation can save response bytes while still paying a network round trip. A query cache can avoid the request entirely while its policy permits. Prefetch can hide latency, but incorrect predictions waste data and energy. Respect metered/expensive connections and user preferences; do not prefetch the whole shop because it is technically possible.

 ## The radio has a cost
 Many tiny requests can repeatedly activate the radio. Batch noncritical telemetry, reduce unnecessary polling, use appropriate freshness windows, and stop screen-specific work when inactive. Batching introduces delay and memory limits, so keep urgent business work separate. Reconnect floods and repeated failed probes also consume battery.

 A real-time connection can reduce some polling but has heartbeat, reconnect, and background limitations. Compare measured behavior for your use case rather than assuming sockets are always cheaper. Native connection pooling generally handles reuse better than ad hoc attempts to force connection headers from JavaScript.

 ## Work continues after the wire
 Large JSON decoding, validation, object creation, cache transformations, and image processing can block the JS thread or increase memory pressure. Reduce payloads first; move suitable heavy work to supported native/background mechanisms when needed. Streaming is useful only if your actual transport/runtime and server contract support it. Do not assume a browser streaming example works identically in React Native.

 ## Make tradeoffs visible
 Set illustrative budgets, then tune them from evidence: maximum page size, retained pages, concurrent uploads, telemetry queue size, retry amplification, and useful-content latency. Record the device/network/build for measurements. Watch regressions by release and endpoint. A faster catalog is not worth an incorrect price or lost offline draft; preserve correctness while optimizing.
 ''',[
 q('What should guide your first optimization?','A measured bottleneck in a representative release-device scenario.','The newest networking library.','An assumed problem based only on localhost speed.','Baseline evidence tells you whether latency, bytes, processing, or redundant work dominates.'),
 q('Does an ETag 304 eliminate all network latency?','No; it can save body bytes but still involves a validation round trip.','Yes; no request occurred.','Yes; it is identical to a fresh in-memory cache hit.','Conditional requests and local cache hits are distinct. Measure both request count and transferred data.'),
 q('Why batch noncritical telemetry carefully?','To reduce overhead while bounding queue size, delay, and battery cost.','To make every event authoritative business truth.','To avoid all privacy review.','Batching trades latency and buffering against radio/network overhead. It still needs budgets and data minimization.')],['cache','rn-devtools','websocket','expo-file'],
 'Measure one catalog scenario in release mode. Remove one waterfall or redundant request, then compare useful-content time, bytes, attempts, and JS work on the same device/network.')

add('release',5,'API evolution and safe releases','Installed apps live longer than your deployment.',35,
 ['Design compatibility for old clients.','Roll out networking changes with observable guardrails.','Plan certificate, endpoint, and data migrations.'],r'''
 ## You cannot instantly update every phone
 Server code can deploy quickly; installed app versions may remain active for months. Design API evolution for that reality. Adding an optional field is often safer than removing a required field, but even additions can break strict validators or exhaustive enum switches. Define how clients handle unknown fields and enum values, and test old binaries against new APIs.

 Keep contracts stable or version them with an explicit support policy. Coordinate deprecation windows, old-client traffic measurement, migration documentation, and user communication. An endpoint should not start returning a completely different error shape without a transition. Never require a forced upgrade solely because it is easier to reason about; decide with product/security needs and provide an accessible recovery path if an update is mandatory.

 ## Release configuration is part of the feature
 Verify production base URLs, TLS chains, ATS/Android settings, native module configuration, auth redirect registration, trace propagation hosts, source maps/symbols, and privacy filters. Public build-time configuration is not a secret store. Confirm release logging does not include debug request bodies or test credentials.

 Certificate and pin rotation, identity-provider changes, backend region moves, DNS/CDN changes, and signed-upload policy changes can break older clients. Rehearse these with supported versions and real devices. Keep a documented recovery plan with named owners; long-lived pins are particularly unforgiving.

 ## Roll out with observable guardrails
 Use staged app/server rollout where available and compare operation success, tail latency, refresh failures, retries per operation, conflicts, and outbox age by release/platform. Define a rollback or pause threshold before launch. Preserve both the old and new server behavior during the compatibility window when necessary.

 Feature flags can disable a broken optional path or choose a supported alternative. Remote configuration needs authenticated delivery, bounded caching, validation, safe defaults, and explicit destination allowlists. A flag cannot repair an incompatible native binary or make an unsafe credential destination acceptable. Store policy and your update mechanism determine what can change without a new binary; verify those rules rather than assuming arbitrary native changes can be delivered over the air.

 ## Migrate local state too
 App upgrades may restore persisted queries, credentials, file sessions, and outbox rows created by older versions. Use schema versions and carefully tested migrations. A cache buster can discard a replaceable cache; it must not silently erase irreplaceable unsynced user work. Test failure during migration and rollback behavior where supported.

 ## A launch checklist needs evidence
 “Works on my phone” is not a release decision. Require evidence for old-client compatibility, account isolation, offline recovery, write deduplication, authentication rotation, privacy-safe telemetry, monitoring ownership, and a tested incident runbook. The capstone converts these into a concrete acceptance checklist. Some products need additional compliance and threat-model work beyond this curriculum.
 ''',[
 q('Why test a new API against old app binaries?','Installed clients cannot all update at deployment time.','Old binaries always refresh themselves instantly.','HTTP forbids optional fields.','Mobile compatibility must account for delayed or unavailable client updates.'),
 q('When is a cache buster insufficient or dangerous?','When it would discard irreplaceable unsynced user operations.','When the data is a replaceable public catalog snapshot.','When it has a schema-version label.','Replaceable caches and durable user intent require different migration policies. Do not erase pending work as a shortcut.'),
 q('What should determine a rollout pause?','Predefined user-impact metrics and an owned recovery plan.','Only whether HTTP 200 counts increased.','Only whether the build uploaded successfully.','Measure operation success, latency, retries, auth, and offline health, segmented by release and platform.')],['http','tanstack-persist','android-security','securestore'],
 'Write a rollout plan with supported client versions, staged exposure, four guardrail metrics, rollback/pause criteria, owners, and migration behavior for a pending outbox row.')

add('capstone',5,'Build, break, observe, and recover','Your production-readiness project and incident rehearsal.',60,
 ['Combine the course into one coherent app design.','Prove recovery with concrete failure drills.','Write an actionable incident review.'],r'''
 ## Build Fieldcart in slices
 Begin with a catalog and a typed JSON API boundary. Add loading/error/empty/stale states. Introduce identity-scoped queries, search, and cursor pagination. Add supported native OAuth, secure session restore, and single-flight refresh. Then add a cart, safe order creation, a durable draft/outbox policy, a photo transfer, and order-status updates.

 Keep server responsibilities explicit. You need a real or controlled test API with authorization, schema contracts, version checks, order deduplication, operation-status reconciliation, file finalization, and trace extraction. A frontend-only simulation cannot establish that the production server makes those guarantees.

 ## Instrument before the final demo
 Define catalog and checkout operations, each HTTP attempt, safe structured errors, and backend spans. Connect an actual trace across app → API → a downstream or database call. Confirm allowed propagation destinations, sampling, privacy filters, and release tagging. Record unsupported transports as coverage gaps rather than claiming complete visibility.

 Create a small dashboard with user-operation success, useful-content latency distribution, attempts per operation, auth refresh failures, and oldest pending outbox age. Define denominators and owners. Keep analytics events separate from order/payment truth.

 ## Run the acceptance drills
 1. Expire the access token while five reads start: observe one refresh and no account mixup.
 2. Lose an order reply after the server commits, then kill the app: restart and reconcile to one order.
 3. Edit a draft offline, kill/restart, reconnect: preserve local intent and show accurate pending/synced state.
 4. Race old search results against newer ones and switch accounts while reads are in flight.
 5. Return 429/503 repeatedly: respect bounded waits, cancellation, and an operation budget.
 6. Expire an upload session after bytes are transferred but before finalization: recover without a false “attached” state.
 7. Miss real-time events while backgrounded: detect the gap and obtain authoritative state.
 8. Send malformed data and inspect logs/traces: show an honest error without leaking secrets.

 Use the checklist in Field notes to retain evidence. A tick means you have verified that item, not merely read about it. The final assessment checks understanding; it does not certify your app.

 ## Rehearse one incident
 Scenario: a release increases checkout failures on Android cellular networks. Stabilize first: name an incident owner, assess impact, preserve unsynced work, and pause a rollout or disable a safely switchable optional path. Avoid a hurried retry increase that amplifies load or a trust-bypass patch that introduces a security flaw.

 Segment by release/platform/route. Compare operation and attempt metrics, inspect sampled traces and native errors, correlate server request IDs, and check configuration/certificate/API changes. Track facts separately from hypotheses. Verify that the mitigation restores user outcomes and stops further damage.

 ## Write a useful review
 Record impact, detection, timeline with timezone, contributing conditions, the evidence for the cause, mitigation, recovery validation, and a small set of owned preventive actions. Avoid blaming “the network” or an individual. Add the smallest regression test or release check that would have caught the verified failure. Share only sanitized evidence.

 After completing this course, repeat the project on your own product's riskiest operation. Production judgment grows from testing assumptions, measuring outcomes, and learning from real constraints—not from memorizing a library's options.
 ''',[
 q('What proves end-to-end trace coverage?','A verified connected trace across the boundaries and transports you claim.','Initializing a mobile SDK alone.','Seeing unrelated spans in two dashboards.','End-to-end is a tested property. Verify parentage, compatible propagation, sampling, and actual transport coverage.'),
 q('During an order incident, what is a dangerous reflex?','Increasing retries everywhere before checking idempotency and load.','Pausing a rollout using a tested plan.','Preserving unsynced user work.','Retry amplification can worsen overload and duplicate unsafe writes. Stabilize with evidence and bounded mechanisms.'),
 q('What is the purpose of the capstone checklist?','Record evidence that the chosen app guarantees were actually verified.','Certify every possible compliance requirement.','Replace native testing.','A practical readiness checklist is scoped evidence. It complements, rather than replaces, product-specific review and real-device validation.')],['aws-retry','otel-context','rn-security','rn-devtools'],
 'Build the smallest version of Fieldcart that exercises your product’s risky operations. Save one sanitized trace, a failure-matrix result, a dashboard definition, and an incident review in your project repository.')

FINAL=[
 q('The API commits an order, but its response never reaches the phone. What supports safe recovery?','A persisted operation identity, server deduplication, and reconciliation.','A new order ID for every retry.','A longer spinner without a status check.','Recovery needs stable logical identity and a documented server outcome protocol.'),
 q('Which pair belongs in separate measurements?','User operation outcomes and individual HTTP attempt outcomes.','All retries counted as new customers.','Every cancellation counted as downtime.','These denominators answer different reliability questions and expose retry amplification.'),
 q('A logout happens during token refresh. Which invariant matters?','Old-session results cannot update the new session or account cache.','Every refresh result must always be saved.','Logout only hides the screen.','Use generation checks and cleanup so late work cannot resurrect credentials or leak identity-scoped data.'),
 q('What does a query becoming stale necessarily do?','Mark the data stale; configured events/policies determine refetching.','Delete the persisted database.','Start a request at that exact instant in every case.','Freshness is separate from scheduling, garbage collection, and persistence.'),
 q('A cache key omits the tenant while the result depends on tenant. What is the risk?','Wrong-tenant data can be reused.','Only a cosmetic loading delay.','TLS automatically separates all cache entries.','Query identity must include every result-changing scope, with cleanup on account changes.'),
 q('An SDK uses sentry-trace while your backend reads only traceparent. What is required?','A documented compatible integration/propagation path and verification.','Assume any header spelling is equivalent.','Put the access token in baggage.','Trace concepts do not make wire formats interchangeable. Configure compatible SDKs or an explicit supported bridge.'),
 q('What belongs in a general metric label?','A bounded route template or outcome category.','A raw email address.','A unique request ID for every sample.','Bounded dimensions keep metrics useful and control cost/privacy risks.'),
 q('An offline row is visibly saved but has no outbox entry after a crash. What design helps?','Atomic persistence of the local change and synchronization intent.','A faster retry delay.','A bigger HTTP header.','Local transactionality prevents half-saved synchronization state.'),
 q('Why is a successful mocked networking suite insufficient for release?','It cannot establish native trust, lifecycle, and actual transport behavior.','Mocks can never test UI behavior.','HTTPS bypasses every platform difference.','Use mocks for controlled app logic plus native/release device checks for integration guarantees.'),
 q('A signed upload URL is valid. What should the client still avoid?','Sending unrelated API credentials or logging the signed URL.','Tracking transfer identity.','Checking finalization status.','Signed URLs are sensitive scoped capabilities; keep credentials and diagnostics destination-aware.'),
 q('How can you support old installed clients during API changes?','Use compatibility rules, transition windows, and old-binary contract checks.','Require every phone to update before any deployment.','Delete all old outboxes on startup.','API and local-schema evolution must account for delayed updates and durable user intent.'),
 q('A background job ran in a debug trigger. What does that prove?','The handler ran under that trigger, not a guaranteed OS schedule.','The OS will run it every minute.','Force-stopped apps always execute it.','Controlled triggers test behavior when invoked. Platform scheduling remains best effort and constrained.'),
 q('Which is a safe handling of a 204 JSON endpoint response?','Handle its lack of content explicitly.','Always call response.json().','Treat it as an automatic schema-valid object.','204 has no content. A typed domain adapter must decide whether absence is expected.'),
 q('Why might client duration exceed server span duration?','Connection, transit, retries, transfer, and app work may add time.','The measurements must both be false.','Server time always equals screen time.','Understand span/timer boundaries before comparing measurements across layers.'),
 q('What should a conflict from another device trigger?','A documented version/merge/user-resolution path.','Unbounded retry of the same stale write.','A fresh login in every case.','Conflicts express concurrent state change, not necessarily a transient transport problem.'),
 q('What makes telemetry production-ready?','Safe fields, verified coverage, bounded resources, useful correlation, and owned alerts.','Maximum raw payload collection.','A dashboard without defined denominators.','Telemetry must explain behavior without introducing privacy leaks, false certainty, or resource failures.'),
]

GLOSSARY={
 'API':'A contract through which one program requests data or actions from another.',
 'Attempt':'One actual network call; an operation can have several attempts.',
 'Operation':'One logical user or system intent, potentially fulfilled from cache or multiple calls.',
 'Asynchronous':'Work that can complete later without synchronously occupying the caller throughout the wait.',
 'Promise':'A JavaScript object representing future completion or failure.',
 'DNS':'A system for resolving names to connection information such as IP addresses.',
 'TLS':'Transport Layer Security: protects a channel and authenticates the server under its trust model.',
 'HTTP':'The application protocol defining requests, responses, methods, statuses, and headers.',
 'TCP':'A reliable ordered byte-stream transport used by HTTP/1.1 and HTTP/2 in common deployments.',
 'QUIC':'A UDP-based secure transport used by HTTP/3.',
 'Latency':'Elapsed time for a defined piece of work. Always state the start and end.',
 'Bandwidth':'Available data-transfer capacity, distinct from round-trip delay.',
 'TTFB':'Time to first byte under the measuring tool’s definition; not necessarily pure backend time.',
 'CORS':'A browser response-sharing policy between origins; not API authorization.',
 'ATS':'Apple App Transport Security, which enforces security requirements for supported URL loading.',
 'Schema':'Rules describing valid data shape and values; runtime validation checks actual received data.',
 'Idempotent':'Repeating the same request has the same intended effect as one request, under its contract.',
 'Idempotency key':'A stable logical-operation key used by a server deduplication protocol.',
 'Deadline':'The time budget after which the caller stops waiting; not proof of server rollback.',
 'Backoff':'Increasing waits between repeated attempts to reduce load.',
 'Jitter':'Randomization of scheduling delays to reduce synchronized bursts.',
 'Retry budget':'A bound on additional attempts, time, or load allocated to retries.',
 'Query key':'The identity of cached server data, including every relevant result-changing input.',
 'staleTime':'How long query data is considered fresh, separate from refetch scheduling.',
 'gcTime':'How long inactive/unobserved query data can remain before garbage collection under the library policy.',
 'ETag':'A server-provided representation validator used for conditional reads or writes.',
 'Optimistic update':'A provisional local prediction of a server-accepted change.',
 'OAuth':'A delegated authorization framework, commonly used with native Authorization Code + PKCE.',
 'OIDC':'OpenID Connect, an identity layer built on OAuth 2.0.',
 'PKCE':'A one-time verifier/challenge mechanism binding the authorization-code exchange to the initiating client.',
 'Access token':'A credential for a resource API with defined scope, audience, and lifetime.',
 'Refresh token':'A sensitive credential used to obtain replacement tokens under provider policy.',
 'JWT':'A structured token format; Base64url payload encoding is not encryption.',
 'Single-flight':'Sharing one in-progress operation, such as token refresh, among concurrent callers.',
 'Session epoch':'A generation marker used to reject work owned by an earlier login/account session.',
 'Outbox':'Durable local records of intended operations awaiting transmission or reconciliation.',
 'Reconciliation':'Comparing local intent/state with authoritative outcomes and resolving uncertainty.',
 'Cursor':'An opaque server marker locating a page or resume position under a defined contract.',
 'Backpressure':'A way to control or respond to producers exceeding consumer capacity.',
 'WebSocket':'A bidirectional long-lived messaging channel; it needs application recovery semantics.',
 'SSE':'Server-Sent Events: a server-to-client HTTP event stream.',
 'Trace':'A causal story of connected work across timed spans.',
 'Span':'A timed unit of work with identity, parentage, attributes, and outcome.',
 'Propagation':'Passing trace or other compatible context across a boundary.',
 'Baggage':'Propagated contextual key-value data; never a place for secrets or unnecessary personal data.',
 'Sampling':'Selecting some telemetry for retention; selection can bias conclusions.',
 'Cardinality':'The number of distinct values for a dimension; unbounded values are costly in metrics.',
 'SLI':'A precisely defined reliability indicator with an explicit measurement population.',
 'SLO':'A target for an SLI over a specified window.',
 'Error budget':'The permitted bad portion under the chosen SLO and denominator.',
 'p95':'A 95th-percentile threshold of a defined measurement distribution, not an average.',
 'Critical path':'The chain of dependent work that determines total elapsed time.',
 'Breadcrumb':'A bounded diagnostic trail of recent events leading to an issue.',
 'Contract test':'A check that clients and services agree on API behavior and data assumptions.',
 'Chaos exercise':'A controlled failure experiment with clear scope, expected behavior, and recovery.',
}

CHECKLIST=[
 ('Contract','Endpoint success, error, empty-body, schema, pagination, and compatibility behavior documented.'),
 ('Native','Valid HTTPS verified on supported physical-device OS versions in release mode.'),
 ('State','Initial, empty, stale, refresh-error, offline, cancelled, and outcome-unknown UI states verified.'),
 ('Identity','OAuth/PKCE flow and secure credential restore verified; no bundled backend secret.'),
 ('Session','Concurrent expiry uses one refresh; logout/account switch rejects old-generation results.'),
 ('Privacy','Memory/persisted caches and outboxes isolate accounts; logout/deletion policies tested.'),
 ('Writes','Stable operation identity and atomic server deduplication verified, including concurrent duplicates.'),
 ('Recovery','Lost acknowledgement after commit plus process death recovers to one business outcome.'),
 ('Retries','One retry owner, cancellation, jitter, Retry-After, and overall budget verified.'),
 ('Offline','Atomic local/outbox state, migrations, conflicts, and permanently rejected work handled.'),
 ('Background','OS constraints documented; foreground recovery does not depend on guaranteed background execution.'),
 ('Files','Session expiry, finalization, cancellation, memory/disk bounds, and orphan cleanup verified.'),
 ('Realtime','Duplicate/gap/reconnect/auth/version handling and bounded buffering verified.'),
 ('Signals','Operation and attempt metrics have explicit denominators, time boundaries, and missing-event policy.'),
 ('Tracing','A connected app→API→downstream trace verified; unsupported transports and sampling gaps documented.'),
 ('Data','Actual emitted logs/traces/analytics inspected for credentials, personal fields, and unsafe URLs.'),
 ('Testing','Failure matrix, old-client contract checks, native integration, and release build checks passed.'),
 ('Release','Staged rollout guardrails, certificate/config migrations, rollback/pause owners, and runbook ready.'),
]

# A concrete project starting point, kept inside the capstone so the path stays 28 chapters.
capstone=next(l for l in LESSONS if l['id']=='capstone')
capstone['body']=capstone['body'].replace('## Build Fieldcart in slices',r'''## A concrete starting point
 If you do not have an app yet, create a TypeScript React Native project using the current official React Native/Expo setup path for your environment. For an Expo project, the commands below add this course's suggested data-layer pieces; they do not implement your backend or configure OAuth for you.

 ```sh
 npx create-expo-app@latest Fieldcart
 cd Fieldcart
 npm install @tanstack/react-query zod
 npx expo install @react-native-community/netinfo expo-secure-store
 ```

 Follow the generated project's instructions for running on a device. Use a development build when your chosen native auth, transfer, or instrumentation integration needs native configuration; Expo Go is not proof that those integrations work. Choose versions compatible with the generated SDK rather than assuming every latest package works together.

 Keep the first implementation easy to inspect:

 ```text
 src/net/client.ts           one-attempt JSON boundary from chapter 6
 src/net/products.ts         URL building + runtime product/page schema
 src/net/retry-policy.ts     chosen retry decisions and operation budget
 src/auth/session.ts         identity, epoch, restore, shared refresh
 src/query/client.ts         one stable QueryClient per app lifetime
 src/sync/outbox.ts          durable operation state + recovery
 src/telemetry/index.ts      safe events, mobile SDK configuration
 src/features/catalog/      screen, search, pagination, UI states
 ```

 Mount `QueryClientProvider` at the root around your app or routing tree. Create its QueryClient once at module scope or with a stable initializer, not on every render. Register the app-level AppState/NetInfo integration once with cleanup. Keep screen navigation focus handling separate.

 ```tsx
 import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
 const queryClient = new QueryClient({
   defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
 });
 // In App.tsx, or adapt this provider to your router's root layout:
 export function Root() {
   return <QueryClientProvider client={queryClient}>
     <YourAppOrRoutingTree />
   </QueryClientProvider>;
 }
 ```

 `YourAppOrRoutingTree` is a placeholder for your generated app's root. Add a domain adapter that builds the request URL from the chosen filters, calls `requestJson`, and validates a documented product-page schema from `unknown`. Reject an unexpected empty response. Start with a controlled HTTPS API or test server, then verify the same contract against your real API. Do not let a mock replace release/native verification.

 First milestone: one catalog query renders valid data; malformed JSON gives an honest error; cancellation does not show a failure toast; a refresh preserves useful existing data. Only then add the next slice.

 ## Build Fieldcart in slices''')
