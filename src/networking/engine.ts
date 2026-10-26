import type { LabKind } from './types';
export type Simulation = Exclude<LabKind, 'workshop'>;
export interface Config {
  [key: string]: string | number | boolean;
  status: string;
  action: string;
  attempts: number;
  stable: boolean;
  dedupe: boolean;
  jitter: boolean;
  budget: number;
  age: number;
  stale: number;
  inactive: number;
  gc: number;
  switchAccount: boolean;
  scope: boolean;
  calls: number;
  single: boolean;
  logout: boolean;
  guard: boolean;
  crash: string;
  atomic: boolean;
  bound: boolean;
  scenario: string;
  propagate: boolean;
  sampled: boolean;
  cause: string;
  fail: number;
  recover: number;
  denominator: string;
  case: string;
  step: string;
}
export const defaults: Config = {
  status: '202',
  action: 'render',
  attempts: 3,
  stable: false,
  dedupe: false,
  jitter: true,
  budget: 5000,
  age: 60,
  stale: 30,
  inactive: 20,
  gc: 120,
  switchAccount: false,
  scope: true,
  calls: 5,
  single: false,
  logout: false,
  guard: false,
  crash: 'server',
  atomic: true,
  bound: false,
  scenario: 'a',
  propagate: true,
  sampled: true,
  cause: 'unknown',
  fail: 20,
  recover: 75,
  denominator: 'attempts',
  case: '0',
  step: '',
};
// Backups can come from another version. Only known, bounded controls enter a model.
export function modelConfig(kind: Simulation, raw: Record<string, unknown> = {}): Config {
  const c = { ...defaults };
  if (kind === 'diagnosis') c.cause = '';
  for (const key of Object.keys(c)) {
    const v = raw[key];
    if (typeof v === typeof c[key] && (typeof v !== 'number' || Number.isFinite(v)))
      c[key] = v as string | number | boolean;
  }
  const bounds: Record<string, [number, number]> = {
    attempts: [1, 4],
    budget: [1000, 6000],
    age: [0, 180],
    stale: [0, 120],
    inactive: [0, 180],
    gc: [10, 240],
    calls: [2, 8],
    fail: [0, 50],
    recover: [0, 100],
  };
  for (const [key, [low, high]] of Object.entries(bounds))
    c[key] = Math.round(Math.max(low, Math.min(high, Number(c[key]))));
  if (!Object.hasOwn(HTTP_CASES, c.status)) c.status = '202';
  if (!['local', 'server', 'ack'].includes(c.crash)) c.crash = 'server';
  if (!['a', 'b', 'c'].includes(c.scenario)) c.scenario = 'a';
  if (!/^\d$/.test(c.case) || Number(c.case) >= DIAGNOSES.length) c.case = '0';
  if (!['attempts', 'operations', 'successes'].includes(c.denominator)) c.denominator = 'attempts';
  return c;
}
export const HTTP_CASES: Record<
  string,
  { name: string; body: string; action: string; explain: string }
> = {
  '200': {
    name: 'OK',
    body: '{"items":[{"id":"p_1","name":"Notebook"}]}',
    action: 'render',
    explain:
      'Validate the JSON at runtime, then use the result. HTTP success alone does not establish the expected schema.',
  },
  '202': {
    name: 'Accepted',
    body: '{"operationId":"op_42","status":"processing"}',
    action: 'pending',
    explain:
      'Work is accepted, not completed. Follow the documented operation-status contract and show processing.',
  },
  '204': {
    name: 'No Content',
    body: '(no content)',
    action: 'empty',
    explain:
      'Do not call json() on this empty response. Your domain wrapper decides whether the lack of data is expected.',
  },
  '401': {
    name: 'Unauthorized',
    body: '{"code":"access_token_expired"}',
    action: 'refresh',
    explain:
      'For this documented expired-token code, join a bounded single-flight refresh for the current session. Not every auth error is a refresh opportunity.',
  },
  '403': {
    name: 'Forbidden',
    body: '{"code":"order_access_denied"}',
    action: 'forbidden',
    explain:
      'The server denied permission. Repeating token refresh is not a general remedy; show a safe permission message.',
  },
  '409': {
    name: 'Conflict',
    body: '{"code":"cart_version_conflict"}',
    action: 'conflict',
    explain:
      'Fetch the current version and follow your domain conflict strategy. A blind stale-write retry can repeat forever.',
  },
  '429': {
    name: 'Too Many Requests',
    body: 'Retry-After: 30\n\n{"code":"rate_limited"}',
    action: 'wait',
    explain:
      'Respect the documented minimum wait. If 30 seconds does not fit the operation budget, defer or fail clearly rather than retrying early.',
  },
  '503': {
    name: 'Service Unavailable',
    body: '{"code":"temporarily_unavailable"}',
    action: 'retry',
    explain:
      'For this modeled safe read, a bounded retry with backoff may help. Do not generalize it to an ambiguous non-idempotent write.',
  },
};
export const DIAGNOSES = [
  {
    title: 'Only the Android release build fails',
    evidence: [
      'Debug connects through a development proxy.',
      'Release fails before an HTTP status exists.',
      'Logcat reports certificate trust validation failure.',
      'The API logs no corresponding request.',
    ],
    causes: [
      'CORS headers are missing',
      'A native TLS trust/configuration difference',
      'A malformed JSON body',
    ],
    correctCause: 1,
    steps: [
      'Disable certificate validation in release',
      'Compare the release trust config and certificate chain; keep fixes scoped',
      'Retry five times without checking native logs',
    ],
    correctStep: 1,
    why: 'The evidence points to native trust before HTTP. Inspect chain, hostname, time, and release/debug trust settings; browser CORS is unrelated.',
  },
  {
    title: 'HTTP 200, but the screen says nothing loaded',
    evidence: [
      'The response body is HTML from an upstream error page.',
      'The app expects a JSON product array.',
      'A catch block returns an empty array.',
      'Users see “No products yet.”',
    ],
    causes: [
      'A decode/contract error hidden as an empty result',
      'A proven successful empty catalog',
      'An authentication refresh storm',
    ],
    correctCause: 0,
    steps: [
      'Keep returning [] for all errors',
      'Validate the response and preserve a typed failure with a truthful UI',
      'Add a second query cache with the same key',
    ],
    correctStep: 1,
    why: 'Transport success is not schema success. Fix the error boundary and upstream contract; preserve a safe diagnostic category rather than lying with an empty state.',
  },
  {
    title: 'Two orders after a weak-signal checkout',
    evidence: [
      'The first order committed before its reply was lost.',
      'The retry generated a new idempotency key.',
      'The server stores one result per key.',
      'Two records exist with different keys.',
    ],
    causes: [
      'A failed deduplication identity across retries',
      'Strict Mode definitely created the orders',
      'An image cache issue',
    ],
    correctCause: 0,
    steps: [
      'Create a new key on every timeout',
      'Persist one key per logical operation and reconcile the known outcomes',
      'Hide one order locally without checking the server',
    ],
    correctStep: 1,
    why: 'Changing the key makes the duplicate look like a new operation. Repair identity generation and server/client recovery, then handle the existing duplicate through the business process.',
  },
  {
    title: 'The catalog takes 3 seconds, but the API takes 80 ms',
    evidence: [
      'One HTTP attempt completes in 150 ms including body reading.',
      'A measured synchronous transformation consumes 2.4 seconds.',
      'The JS thread stalls during that transformation.',
      'The list renders after the transformation finishes.',
    ],
    causes: [
      'A confirmed DNS delay',
      'Client processing dominates the measured delay',
      'A guaranteed database bottleneck',
    ],
    correctCause: 1,
    steps: [
      'Increase the API timeout',
      'Reduce/optimize measured client work and remeasure release-device behavior',
      'Add retries to speed up rendering',
    ],
    correctStep: 1,
    why: 'The timer boundaries isolate the main delay after transfer. Optimize the verified transformation and payload rather than diagnosing DNS from a screen timer.',
  },
  {
    title: 'The mobile trace ends at the API boundary',
    evidence: [
      'App sends sentry-trace and baggage.',
      'API is configured only for unrelated W3C context extraction.',
      'API requests appear in a separate trace.',
      'The server did process the call.',
    ],
    causes: [
      'The request never reached the server',
      'A propagation-format/integration mismatch',
      'An automatic order rollback',
    ],
    correctCause: 1,
    steps: [
      'Assume any tracing header works with every backend',
      'Configure a compatible documented propagation path and verify parentage',
      'Put the user’s password in baggage for correlation',
    ],
    correctStep: 1,
    why: 'Both sides emit spans, but incompatible context handling disconnects them. Use supported integration and verify a shared causal trace, without sensitive baggage.',
  },
];
export function simRetry(c: Config) {
  let attempts = 1,
    orders = 1,
    elapsed = 800;
  const timeline = [
    '0 ms · send operation op_42 with key k_42.',
    '100 ms · server commits an order; its reply is lost.',
    '800 ms · client deadline expires; the outcome is unknown.',
  ];
  if (c.attempts < 2)
    timeline.push(
      'No recovery attempt is allowed. Order exists, but the client still needs reconciliation.',
    );
  else {
    const wait = c.jitter ? 180 : 0;
    if (elapsed + wait + 300 > c.budget)
      timeline.push(
        'Remaining operation budget is too small for the modeled recovery attempt. Stop and reconcile later.',
      );
    else {
      elapsed += wait + 300;
      attempts++;
      if (!(c.stable && c.dedupe)) orders++;
      timeline.push(
        `${800 + wait} ms · retry with ${c.stable ? 'the original key k_42' : 'a new key k_99'}.`,
      );
      timeline.push(
        c.stable && c.dedupe
          ? 'Server recognizes the same operation and returns its recorded outcome.'
          : 'The retry produces a second order in this model.',
      );
    }
  }
  return {
    attempts,
    orders,
    elapsed,
    timeline,
    recovered: attempts === 2,
    safe: attempts === 2 && orders === 1,
  };
}
export function simCache(c: Config) {
  const inactive = Math.min(c.inactive, c.age),
    present = inactive < c.gc;
  const identityMatch = !c.switchAccount || !c.scope;
  const usable = present && identityMatch;
  const stale = c.age >= c.stale;
  return {
    inactive,
    present,
    usable,
    stale,
    leak: usable && c.switchAccount && !c.scope,
    fetch: !usable || stale,
  };
}
export function simAuth(c: Config) {
  return {
    refreshes: c.single ? 1 : c.calls,
    rejections: c.single ? 0 : c.calls - 1,
    resurrected: c.logout && !c.guard,
    acceptedAfterLogout: c.logout && !c.guard,
    active: !c.logout || !c.guard,
  };
}
export function simOutbox(c: Config) {
  if (c.crash === 'local' && !c.atomic)
    return {
      local: true,
      queued: false,
      orders: 0,
      status: 'Local change persisted, synchronization intent missing',
      safe: false,
      events: [
        'The local row was saved.',
        'Process died before a separate outbox insert.',
        'After restart there is no row to tell the sync worker what to send.',
      ],
    };
  if (c.crash === 'local' && c.atomic)
    return {
      local: false,
      queued: false,
      orders: 0,
      status: 'Transaction rolled back; no half-saved draft',
      safe: true,
      events: [
        'Crash occurs before the atomic local/outbox transaction commits.',
        'Neither record becomes durable. The UI must not have promised durable save before commit.',
        'The original unsaved edit requires the defined draft recovery policy.',
      ],
    };
  if (c.switchAccount && c.bound)
    return {
      local: true,
      queued: true,
      orders: 1,
      status: 'Paused: pending work belongs to the old account',
      safe: true,
      events: [
        'The original account’s server may already have committed.',
        'After restart, a different account is active.',
        'The row stays isolated and paused. Do not send it using the new account token.',
      ],
    };
  if (c.switchAccount && !c.bound)
    return {
      local: true,
      queued: true,
      orders: 'Unknown',
      status: 'Unsafe: attempted replay under a different identity',
      safe: false,
      events: [
        'The original operation belongs to account A.',
        'Recovery sends the row using account B’s credentials.',
        'This violates identity isolation. Exact server effect depends on authorization; the model flags unsafe replay.',
      ],
    };
  const safe = c.stable && c.dedupe;
  return {
    local: true,
    queued: false,
    orders: safe ? 1 : 2,
    status: safe
      ? 'Recovered: one order, authoritative outcome reconciled'
      : 'Unsafe replay: a duplicate order in this model',
    safe,
    events: [
      'Local change and outbox are durable.',
      'Server commits; process dies before durable acknowledgement.',
      `Recovery ${c.stable ? 'uses the persisted operation key' : 'generates a different key'}.`,
      safe
        ? 'Server deduplicates and returns the original outcome; local state is reconciled.'
        : 'The duplicate is not recognized; replay creates another business effect.',
    ],
  };
}
export function simTrace(c: Config) {
  const cases = {
    a: { outside: 1500, server: 120, db: 50, app: 80, cause: 'outside' },
    b: { outside: 120, server: 1420, db: 1250, app: 80, cause: 'database' },
    c: { outside: 120, server: 120, db: 50, app: 1400, cause: 'app' },
  };
  const x = cases[c.scenario as keyof typeof cases] || cases.a;
  return { ...x, total: x.outside + x.server + x.app, http: x.outside + x.server };
}
export function simMetrics(c: Config) {
  const operations = 100,
    failed = c.fail,
    recovered = Math.round((failed * c.recover) / 100),
    attempts = 100 + failed,
    success = 100 - failed + recovered;
  return {
    operations,
    failed,
    recovered,
    attempts,
    success,
    opRate: success,
    attemptRate: (success / attempts) * 100,
    budget: operations * 0.005,
  };
}
