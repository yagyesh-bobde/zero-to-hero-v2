export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  signature: string;
  starter: string;
  solution: string;
  tests: { name: string; args: unknown[]; expected: unknown }[];
}
export const challenges: Challenge[] = [
  {
    id: 'classify-response',
    title: 'Classify the response envelope',
    prompt:
      'Return data for 200, pending for 202, empty for 204, conditional for 304, auth for 401, forbidden for 403, conflict for 409 or 412, wait for 429, server for 5xx, and other otherwise. This classifies HTTP envelopes; it does not authorize a retry or validate the body.',
    signature: 'classifyResponse(status)',
    starter:
      'function classifyResponse(status) {\n  // Different statuses lead to different domain handling.\n  return "other";\n}',
    solution:
      'function classifyResponse(status) {\n  const known = {200:"data",202:"pending",204:"empty",304:"conditional",401:"auth",403:"forbidden",409:"conflict",412:"conflict",429:"wait"};\n  return known[status] ?? (status >= 500 && status < 600 ? "server" : "other");\n}',
    tests: [
      { name: 'Accepted is not completed', args: [202], expected: 'pending' },
      { name: 'Do not decode an empty body', args: [204], expected: 'empty' },
      { name: 'Conditional read needs a cache', args: [304], expected: 'conditional' },
      { name: 'A permission denial is not token expiry', args: [403], expected: 'forbidden' },
      { name: 'Precondition conflict', args: [412], expected: 'conflict' },
      { name: 'Respect rate limiting', args: [429], expected: 'wait' },
      { name: 'Service failure', args: [503], expected: 'server' },
      { name: 'A success still needs validation', args: [200], expected: 'data' },
    ],
  },
  {
    id: 'validate-product',
    title: 'Validate unknown product data',
    prompt:
      'Return true only for a non-null, non-array object with non-empty string id and name, a nonnegative integer priceMinor, and a three-uppercase-letter currency. Extra fields are allowed in this example contract.',
    signature: 'validProduct(value)',
    starter:
      'function validProduct(value) {\n  // Check actual runtime values, not a TypeScript assertion.\n  return false;\n}',
    solution:
      'function validProduct(v) {\n  return v !== null && typeof v === "object" && !Array.isArray(v) &&\n    typeof v.id === "string" && v.id.trim().length > 0 &&\n    typeof v.name === "string" && v.name.trim().length > 0 &&\n    Number.isInteger(v.priceMinor) && v.priceMinor >= 0 &&\n    typeof v.currency === "string" && /^[A-Z]{3}$/.test(v.currency);\n}',
    tests: [
      {
        name: 'Valid including free item',
        args: [{ id: 'p1', name: 'Notebook', priceMinor: 0, currency: 'INR' }],
        expected: true,
      },
      {
        name: 'Do not coerce strings into prices',
        args: [{ id: 'p1', name: 'Notebook', priceMinor: '500', currency: 'INR' }],
        expected: false,
      },
      { name: 'Reject null', args: [null], expected: false },
      { name: 'Reject arrays', args: [[]], expected: false },
      {
        name: 'Reject a fractional minor-unit value',
        args: [{ id: 'p', name: 'N', priceMinor: 1.5, currency: 'INR' }],
        expected: false,
      },
      {
        name: 'Unknown fields are additive here',
        args: [{ id: 'p', name: 'N', priceMinor: 5, currency: 'USD', optionalNewField: true }],
        expected: true,
      },
    ],
  },
  {
    id: 'should-retry',
    title: 'Guard the retry budget',
    prompt:
      'For this teaching policy, permit another attempt only when the body is replayable, a GET/HEAD or durably idempotent operation is used, the failure is network/timeout or HTTP 429/502/503/504, attemptsMade < maxAttempts, and waitMs + attemptBudgetMs <= remainingMs. Cancellation/decode/other failures do not qualify. waitMs already includes any required Retry-After minimum.',
    signature: 'canRetry(operation)',
    starter:
      'function canRetry(operation) {\n  // Combine semantics, failure category, count, and time budget.\n  return false;\n}',
    solution:
      'function canRetry(o) {\n  const safe = ["GET", "HEAD"].includes(o.method) || o.durableIdempotency === true;\n  const transient = ["network", "timeout"].includes(o.kind) ||\n    (o.kind === "http" && [429,502,503,504].includes(o.status));\n  return safe && o.replayable === true && transient &&\n    o.attemptsMade < o.maxAttempts && o.waitMs + o.attemptBudgetMs <= o.remainingMs;\n}',
    tests: [],
  },
  {
    id: 'recover-outbox',
    title: 'Choose a recovery action',
    prompt:
      'First pause any row owned by another account. For the current owner, sending/outcome-unknown require reconcile; queued/retry-wait require send; acknowledged/reconciled require done; rejected/conflict/unknown states require repair. Sending is not proof of success or rollback.',
    signature: 'recover(row, activeAccount)',
    starter:
      'function recover(row, activeAccount) {\n  // Keep identity and uncertainty explicit.\n  return "repair";\n}',
    solution:
      'function recover(row, activeAccount) {\n  if (row.accountId !== activeAccount) return "pause";\n  if (["sending","outcome-unknown"].includes(row.state)) return "reconcile";\n  if (["queued","retry-wait"].includes(row.state)) return "send";\n  if (["acknowledged","reconciled"].includes(row.state)) return "done";\n  return "repair";\n}',
    tests: [
      {
        name: 'Never replay user A with B credentials',
        args: [{ accountId: 'A', state: 'queued' }, 'B'],
        expected: 'pause',
      },
      {
        name: 'Process died while sending',
        args: [{ accountId: 'A', state: 'sending' }, 'A'],
        expected: 'reconcile',
      },
      {
        name: 'Known queued operation',
        args: [{ accountId: 'A', state: 'queued' }, 'A'],
        expected: 'send',
      },
      {
        name: 'Confirmed durable outcome',
        args: [{ accountId: 'A', state: 'acknowledged' }, 'A'],
        expected: 'done',
      },
      {
        name: 'Conflict needs resolution',
        args: [{ accountId: 'A', state: 'conflict' }, 'A'],
        expected: 'repair',
      },
    ],
  },
  {
    id: 'metric-summary',
    title: 'Keep the denominators honest',
    prompt:
      'All eligible operations make one initial request; every initial failure gets one retry. Return {successfulOperations, totalOperations, successfulAttempts, totalAttempts}. recovered is the number of failed operations that the retry rescues. This exercise deliberately excludes cache hits and intentional cancellations.',
    signature: 'summarize(total, initialFailures, recovered)',
    starter:
      'function summarize(total, initialFailures, recovered) {\n  // One operation can produce two attempts.\n  return {};\n}',
    solution:
      'function summarize(total, initialFailures, recovered) {\n  const successes = total - initialFailures + recovered;\n  return {successfulOperations:successes,totalOperations:total,successfulAttempts:successes,totalAttempts:total+initialFailures};\n}',
    tests: [
      {
        name: 'All failures recover, but attempts still fail',
        args: [100, 20, 20],
        expected: {
          successfulOperations: 100,
          totalOperations: 100,
          successfulAttempts: 100,
          totalAttempts: 120,
        },
      },
      {
        name: 'Some operations remain failed',
        args: [100, 20, 10],
        expected: {
          successfulOperations: 90,
          totalOperations: 100,
          successfulAttempts: 90,
          totalAttempts: 120,
        },
      },
      {
        name: 'Healthy first attempts',
        args: [10, 0, 0],
        expected: {
          successfulOperations: 10,
          totalOperations: 10,
          successfulAttempts: 10,
          totalAttempts: 10,
        },
      },
    ],
  },
  {
    id: 'supports-contract',
    title: 'Guard an old client’s capabilities',
    prompt:
      'Return true when every capability required by a new API path is included in the installed client’s supported capabilities. Empty requirements are allowed. Unknown extra supported capabilities are harmless in this model. Real API schema evolution still needs contract tests and a support policy.',
    signature: 'supports(required, available)',
    starter:
      'function supports(required, available) {\n  // Extra capabilities are fine; missing requirements are not.\n  return false;\n}',
    solution:
      'function supports(required, available) {\n  return required.every(capability => available.includes(capability));\n}',
    tests: [
      {
        name: 'Existing capabilities satisfy requirements',
        args: [
          ['json-v1', 'cursor-v1'],
          ['json-v1', 'cursor-v1', 'images'],
        ],
        expected: true,
      },
      {
        name: 'Old client lacks required contract',
        args: [['outbox-v2'], ['outbox-v1']],
        expected: false,
      },
      { name: 'No additional requirements', args: [[], ['json-v1']], expected: true },
      { name: 'No accidental partial match', args: [['auth-v2'], ['auth-v20']], expected: false },
    ],
  },
];
const base = {
  method: 'GET',
  durableIdempotency: false,
  replayable: true,
  kind: 'network',
  status: 0,
  attemptsMade: 1,
  maxAttempts: 3,
  waitMs: 100,
  attemptBudgetMs: 500,
  remainingMs: 1000,
};
challenges.find((c) => c.id === 'should-retry')!.tests = [
  { name: 'A bounded transient read', args: [base], expected: true },
  { name: 'Unsafe POST must not repeat', args: [{ ...base, method: 'POST' }], expected: false },
  {
    name: 'An idempotent POST with replayable body',
    args: [{ ...base, method: 'POST', durableIdempotency: true }],
    expected: true,
  },
  {
    name: 'Consumed body cannot be replayed',
    args: [{ ...base, replayable: false }],
    expected: false,
  },
  {
    name: 'Cancellation stops recovery attempts',
    args: [{ ...base, kind: 'cancelled' }],
    expected: false,
  },
  {
    name: 'Forbidden access does not improve by retrying',
    args: [{ ...base, kind: 'http', status: 403 }],
    expected: false,
  },
  {
    name: 'Required rate-limit wait exceeds remaining budget',
    args: [{ ...base, kind: 'http', status: 429, waitMs: 900 }],
    expected: false,
  },
  { name: 'Attempt cap exhausted', args: [{ ...base, attemptsMade: 3 }], expected: false },
];
