# Research record

Snapshot: **26 October 2026**. Primary documentation was retrieved live before building the learning module. The course synthesizes the sources into a beginner path rather than copying a single library tutorial. Full readable retrievals are in `research/`; URLs, resolution status, date, and text size are in `sources.json`. Chapter citations resolve to readable references. The HTML Sources section exposes the source register without requiring these local files.

## Findings that shaped the curriculum

| Finding | Primary evidence | Teaching consequence |
|---|---|---|
| Fetch normally resolves on HTTP error statuses; response-body consumption is separate from receiving headers. | MDN Using Fetch; React Native Networking | A single-attempt helper checks status, handles 204, validates from unknown, and keeps its asynchronous deadline until body consumption finishes. |
| Native networking differs from browser networking; the RN guide lists cookie/redirect limitations. | React Native Networking | CORS is separated from TLS/auth, and browser Fetch options are not assumed to work identically on device. |
| Cleartext and trust configuration are platform/build sensitive. | Apple ATS article; Android Network Security Configuration | Debug exceptions are scoped; release validation is never globally bypassed. Real-device release checks remain necessary. |
| Android emulator host alias is 10.0.2.2; loopback points at the device itself. | Android emulator network address space | A device/URL matrix precedes networking implementation. |
| The current RN DevTools docs identify Network and Performance panels from RN 0.83 and describe coverage/feature gaps. | React Native DevTools | Debugging advice is versioned, with native logs and transport-specific evidence for gaps. |
| Staleness, inactivity collection, persistence, and HTTP cache validation are distinct. | TanStack Query v5 defaults, native integration, network mode, persistence; MDN HTTP caching | A cache simulation separates clocks and identity; account-scoped keys and explicit cleanup are emphasized. |
| Reachability can be unknown, and a network hint is not endpoint health. | NetInfo README; TanStack React Native integration | Unknown is not silently treated as confirmed offline, and actual attempts still handle failure. |
| Native OAuth uses external user-agents and PKCE; public clients cannot safely keep a shared confidential client secret. | RFC 8252; RFC 9700 | The auth lesson separates roles, tokens, redirect validation, and native flow requirements. |
| Public-client refresh tokens must be sender-constrained or rotated under current OAuth security best practice. | RFC 9700 | Session refresh has single-flight ownership, generation checks, credential persistence, and provider-specific crash/reuse recovery limits. |
| AsyncStorage is unencrypted; secure storage has platform-specific backup/reinstall/biometric behavior. | React Native Security; Expo SecureStore | Credentials and account data have explicit storage/recovery boundaries. Uninstall is not assumed to be a universal logout contract. |
| A timed-out request may have performed its effect, and retries can amplify load. | HTTP Semantics RFC 9110; AWS Builders Library | The retry/outbox labs center on lost acknowledgement after commit, bounded retries, stable identity, and a real server deduplication contract. |
| Background scheduling is OS-controlled; JS timers are not persistent execution. | Expo BackgroundTask; Android WorkManager; Apple background URLSession article | Deferred work, native transfers, push hints, and foreground reconciliation are taught separately without exact scheduling promises. |
| Ordinary WebSocket exposes no automatic application backpressure. | MDN WebSocket; React Native Networking | Queues are bounded, reconnect gaps are reconciled, and application event ordering/versioning is explicit. |
| A successful GraphQL transport can still carry partial data and errors. | GraphQL Serving over HTTP | API style does not replace operation-level error policy, retry safety, or authorization. |
| Trace context must be propagated compatibly; generic JavaScript runtime support is not proof of RN instrumentation. | OpenTelemetry JS runtime docs, propagation guide, W3C Trace Context | A trace is verified across real boundaries; Node bootstrap code is not presented as an automatic mobile integration. |
| Sentry RN distributed tracing documents sentry-trace/baggage and propagation-target configuration. | Sentry React Native tracing and trace propagation | The course explicitly distinguishes this path from W3C-only propagation and requires a compatible backend integration. |
| Sensitive values can appear in URLs, transaction names, request context, and spans. | Sentry sensitive-data guide; RN Security | Diagnostics use safe fields, normalized routes, pre-transmission scrubbing, and bounded resources. |
| The current MSW native integration uses @msw/react-native and says msw/native was removed. | MSW React Native integration | The testing lesson avoids obsolete native imports and separates Node component tests from device behavior. |

## Interpretation and limits

- The 36 readable references include specifications, guides, and an official overview page. They are not 36 independent experimental studies. Reading a document does not demonstrate a native implementation works.
- Two Apple HTML pages returned JavaScript-only shells. Their advertised Markdown articles were retrieved and read instead; the shells are retained as superseded access records, not substantive evidence.
- Two attempted OWASP URLs returned 404. They are recorded as failures and are not cited as evidence. An additional OWASP landing-page discovery attempt returned 403. No bypass was attempted.
- The course's sample SLOs, deadlines, timings, fictional incidents, and state-machine outputs are authored teaching models. They are explicitly not measured device/server performance.
- The single-attempt JSON reference client is limited to bounded JSON APIs. It is not a streaming/background transport, cookie manager, tracing SDK, transactional database, or complete authentication implementation.
- Platform/network behaviors must be checked against the installed React Native, Expo SDK, library versions, supported OS/target SDKs, chosen transport, and release build. SDK examples are teaching references with explicit placeholders where a project-specific root or API is required.
- W3C and vendor trace propagation need compatible configuration. Sampling and missing telemetry make absence of a span inconclusive by itself.
- Metrics/SLO guidance is an engineering synthesis: denominators, sampling bias, missing completion events, bounded dimensions, tail latency, and ownership are deliberately spelled out. The course's numerical targets are examples, not universal standards.
- No production API was exercised, no OAuth account was used, and no React Native binary was built or tested. Browser acceptance checks validate the course itself. The capstone requires the learner to verify actual server guarantees and native behavior.
- Product-specific compliance, abuse/fraud controls, threat modeling, and specialized transports may require additional expertise. This module provides the networking foundation and a way to gather evidence, not blanket certification.
