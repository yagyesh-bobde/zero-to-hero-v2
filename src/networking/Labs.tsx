import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Code2,
  Database,
  FileSearch,
  KeyRound,
  Network,
  Play,
  RefreshCw,
  Send,
  Timer,
} from 'lucide-react';
import Workshop from './Workshop';
import type { WorkshopProps } from './Workshop';
import type { LabKind, Progress } from './types';
import {
  DIAGNOSES,
  HTTP_CASES,
  modelConfig,
  simAuth,
  simCache,
  simMetrics,
  simOutbox,
  simRetry,
  simTrace,
} from './engine';
import type { Config, Simulation } from './engine';

export const labMeta = {
  http: {
    title: 'Response contracts',
    subtitle: 'Choose what an HTTP response actually means.',
    icon: Network,
  },
  retry: {
    title: 'Retry & uncertainty',
    subtitle: 'Recover a lost acknowledgement without duplicating an order.',
    icon: RefreshCw,
  },
  cache: {
    title: 'Cache clocks',
    subtitle: 'Separate freshness, retention, and account ownership.',
    icon: Database,
  },
  auth: {
    title: 'Session races',
    subtitle: 'Control refresh concurrency and a late response after logout.',
    icon: KeyRound,
  },
  outbox: {
    title: 'Durable outbox',
    subtitle: 'Crash a write and inspect what survives restart.',
    icon: Send,
  },
  trace: {
    title: 'Trace waterfall',
    subtitle: 'Connect user intent, HTTP, backend work, and rendering.',
    icon: Timer,
  },
  metrics: {
    title: 'Honest metrics',
    subtitle: 'Count operations and attempts with the right denominator.',
    icon: Activity,
  },
  diagnosis: {
    title: 'Incident desk',
    subtitle: 'Use evidence to choose the next useful action.',
    icon: FileSearch,
  },
  workshop: {
    title: 'JavaScript workshop',
    subtitle: 'Build six small networking rules and run their checks.',
    icon: Code2,
  },
};
export interface LabProps extends WorkshopProps {
  kind: LabKind;
  update: (fn: (p: Progress) => Progress) => void;
}
const goals: Record<Simulation, string> = {
  http: 'Correctly handle 202, 204, and 429. Run each with the appropriate next action.',
  retry:
    'Recover one logical order within the budget. Reuse a persisted key, model durable server deduplication, and enable jitter.',
  cache:
    'First serve useful stale data while refreshing. Then switch accounts with an account-scoped key.',
  auth: 'Share one refresh, log out while it runs, and reject the late response using the session epoch.',
  outbox:
    'Recover a crash after commit with atomic local intent, a stable key, server deduplication, and account binding.',
  trace:
    'Find the dominant region with compatible propagation and retained server spans. Then experiment with missing context and sampling.',
  metrics:
    'Recover every initial failure and choose the denominator for final user-operation success.',
  diagnosis:
    'Solve three different incidents with both the supported cause and next action correct.',
};
const limits: Record<string, [string, number, number, number, string]> = {
  attempts: ['Maximum total attempts', 1, 4, 1, ''],
  budget: ['Overall operation budget', 1000, 6000, 250, ' ms'],
  age: ['Age since successful fetch', 0, 180, 5, ' s'],
  stale: ['staleTime', 0, 120, 5, ' s'],
  inactive: ['Time without an observer', 0, 180, 5, ' s'],
  gc: ['gcTime', 10, 240, 10, ' s'],
  calls: ['Concurrent expired requests', 2, 8, 1, ''],
  fail: ['Initial failures out of 100', 0, 50, 1, ''],
  recover: ['Failures recovered by retry', 0, 100, 5, '%'],
};
function Readouts({ items }: { items: [string | number, string][] }) {
  return (
    <div className="net-model-readouts">
      {items.map(([n, label]) => (
        <div key={label}>
          <strong>{n}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
function Events({ items }: { items: string[] }) {
  return (
    <ol className="net-model-events">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );
}
function Waterfall({ c }: { c: Config }) {
  const x = simTrace(c),
    start = x.outside / 2;
  const rows: [string, number, number][] = [
    ['catalog.load', 0, x.total],
    ['HTTP client', 0, x.http],
    ...(c.sampled
      ? ([
          [c.propagate ? '↳ API server' : 'API · separate trace', start, x.server],
          ['↳ database', start + 20, x.db],
        ] as [string, number, number][])
      : []),
    ['decode / render', x.http, x.app],
  ];
  return (
    <div className="net-waterfall" aria-label="Modeled trace durations">
      {rows.map(([label, s, d]) => (
        <div key={label}>
          <span>
            {label}
            <small>{d} ms</small>
          </span>
          <div className="net-span-track">
            <span style={{ left: `${(s / x.total) * 100}%`, width: `${(d / x.total) * 100}%` }} />
          </div>
        </div>
      ))}
      <p>
        0 ms <span>{x.total} ms</span>
      </p>
    </div>
  );
}
function Result({ kind, c, seen }: { kind: Simulation; c: Config; seen: string[] }) {
  if (kind === 'http') {
    const x = HTTP_CASES[c.status];
    return (
      <>
        <h3>{x.action === c.action ? 'Good decision.' : 'Reconsider the response contract.'}</h3>
        <p>{x.explain}</p>
        <p>
          Challenge responses understood:{' '}
          {['202', '204', '429'].filter((s) => seen.includes(s)).join(', ') || 'none yet'}.
        </p>
      </>
    );
  }
  if (kind === 'retry') {
    const x = simRetry(c);
    return (
      <>
        <Readouts
          items={[
            [x.attempts, 'HTTP attempts'],
            [x.orders, 'server orders'],
            [`${x.elapsed} ms`, 'modeled elapsed'],
          ]}
        />
        <Events items={x.timeline} />
        <p>
          {x.safe
            ? 'One operation recovered through a shared identity and server contract.'
            : x.orders > 1
              ? 'The retry created another business operation.'
              : 'An order exists but the client has no confirmed outcome. Reconcile later.'}{' '}
          Maximum attempts is a cap; recovery stops early. Jitter uses a repeatable 180 ms sample
          here.
        </p>
      </>
    );
  }
  if (kind === 'cache') {
    const x = simCache(c);
    return (
      <>
        <Readouts
          items={[
            [x.present ? 'Retained' : 'Collected', 'old cache entry'],
            [x.usable ? 'Available' : 'Not reusable', 'data for this account'],
            [x.fetch ? 'Start read' : 'No stale-driven read', 'on this modeled mount'],
          ]}
        />
        <Events
          items={[
            `Entry age ${c.age} s / staleTime ${c.stale} s: ${x.stale ? 'stale' : 'fresh'}.`,
            `Effective inactivity ${x.inactive} s / gcTime ${c.gc} s.`,
            x.leak
              ? 'Privacy bug: account B reused account A’s data under a shared key.'
              : c.switchAccount
                ? 'The scoped key has no data for account B; fetch the new account’s data.'
                : x.usable && x.stale
                  ? 'Show useful stale data while refreshing.'
                  : 'Use the current identity and freshness policy.',
          ]}
        />
        <p>
          Stale-data challenge {seen.includes('stale') ? '✓' : '○'} · account isolation{' '}
          {seen.includes('isolation') ? '✓' : '○'}. Staleness alone is not a timer-triggered fetch.
          This models the query cache, not native HTTP caching.
        </p>
      </>
    );
  }
  if (kind === 'auth') {
    const x = simAuth(c);
    return (
      <>
        <Readouts
          items={[
            [x.refreshes, 'refresh requests'],
            [x.rejections, 'modeled duplicate rejections'],
            [x.active ? 'Active' : 'Signed out', 'session after completion'],
          ]}
        />
        <Events
          items={[
            `${c.calls} requests use the expired access token.`,
            c.single
              ? 'Requests join one refresh for this session.'
              : 'Requests race with the same rotating credential.',
            ...(c.logout
              ? [
                  'Logout increments the session generation.',
                  c.guard
                    ? 'The stale refresh result is rejected. No credentials or old requests are restored.'
                    : 'The late result saves credentials and resurrects the session.',
                ]
              : ['The refresh result updates the current session.']),
          ]}
        />
        <p>
          This provider model accepts one rotating-token use. Real reuse/revocation semantics
          differ. Single-flight controls concurrency; an epoch guard protects session ownership.
        </p>
      </>
    );
  }
  if (kind === 'outbox') {
    const x = simOutbox(c);
    return (
      <>
        <h3>{x.status}</h3>
        <Readouts
          items={[
            [x.orders, 'modeled server effects'],
            [x.local ? 'Yes' : 'No', 'local change durable'],
            [x.queued ? 'Paused / pending' : 'No pending row', 'outbox after recovery'],
          ]}
        />
        <Events items={x.events} />
        <p>
          Atomic intent, identity isolation, and deduplication solve different failures. Verify real
          database transactions and the server’s durable key contract.
        </p>
      </>
    );
  }
  if (kind === 'trace') {
    const x = simTrace(c);
    return (
      <>
        <Readouts
          items={[
            [`${x.total} ms`, 'intent → useful content'],
            [`${x.http} ms`, 'HTTP attempt'],
            [`${x.app} ms`, 'app processing'],
          ]}
        />
        <Waterfall c={c} />
        <p>
          {c.cause === x.cause
            ? 'Your diagnosis matches the dominant region.'
            : 'Choose the dominant region using the measured boundaries.'}{' '}
          {!c.propagate
            ? 'API spans belong to a separate trace. Verify compatible propagation and parent extraction.'
            : !c.sampled
              ? 'Server spans were not retained. Their absence does not prove the request never arrived.'
              : x.cause === 'outside'
                ? 'Time outside the server span alone cannot identify DNS, TLS, transit, or queueing.'
                : x.cause === 'database'
                  ? 'Database work dominates the backend path.'
                  : 'Post-HTTP app processing dominates the wait.'}{' '}
          These are fabricated durations.
        </p>
      </>
    );
  }
  if (kind === 'metrics') {
    const x = simMetrics(c),
      chosen =
        c.denominator === 'operations'
          ? x.opRate
          : c.denominator === 'attempts'
            ? x.attemptRate
            : 100;
    return (
      <>
        <Readouts
          items={[
            [`${x.opRate.toFixed(1)}%`, 'operation success'],
            [`${x.attemptRate.toFixed(1)}%`, 'attempt success'],
            [x.attempts, 'total attempts'],
          ]}
        />
        <Events
          items={[
            `${x.operations} operations → ${x.failed} initial failures → ${x.recovered} recovered.`,
            `${x.success} successful operations / 100 eligible operations.`,
            `${x.success} successful attempts / ${x.attempts} total attempts.`,
          ]}
        />
        <p>
          Your chosen denominator reports {chosen.toFixed(1)}%.{' '}
          {c.denominator === 'operations'
            ? 'This answers the final user-outcome question.'
            : c.denominator === 'attempts'
              ? 'This answers an attempt-level question.'
              : 'Counting only successes hides all failures.'}{' '}
          Cache hits and intentional cancellations are excluded from this model. A 99.5% example
          objective gives a mathematical budget of 0.5 bad operations here; real alerts need an
          appropriate population and window.
        </p>
      </>
    );
  }
  const d = DIAGNOSES[Number(c.case)],
    correct = c.cause === String(d.correctCause) && c.step === String(d.correctStep);
  return (
    <>
      <h3>{correct ? 'Evidence and action align.' : 'Revisit the layer and next step.'}</h3>
      <p>{d.why}</p>
      <p>{seen.length}/3 different incidents solved.</p>
    </>
  );
}
export function RequestJourney() {
  return (
    <div className="net-request-journey">
      {[
        ['01', 'User intent', '“Show my orders”'],
        ['02', 'App request layer', 'Identity · deadline · validation'],
        ['03', 'Native transport → API', 'DNS · TLS · HTTP · authorization'],
        ['04', 'Useful outcome', 'State · rendering · operation metric'],
      ].map(([n, title, detail]) => (
        <div key={n}>
          <span>{n}</span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
          <ArrowRight size={16} />
        </div>
      ))}
      <p>A timeout can hide a committed write. Trace the whole operation.</p>
    </div>
  );
}
export default function Lab(props: LabProps) {
  return props.kind === 'workshop' ? (
    <Workshop {...props} />
  ) : (
    <SimulationLab key={props.kind} {...props} kind={props.kind} />
  );
}
function SimulationLab({
  kind,
  progress,
  update,
}: {
  kind: Simulation;
  progress: Progress;
  update: LabProps['update'];
}) {
  const c = modelConfig(kind, progress.labState[kind]),
    [run, setRun] = useState<Config | null>(null);
  const seen = progress.labSeen[kind] || [];
  const change = (key: string, value: string | number | boolean) => {
    setRun(null);
    update((p) => ({
      ...p,
      labState: {
        ...p.labState,
        [kind]: {
          ...c,
          [key]: value,
          ...(kind === 'diagnosis' && key === 'case' ? { cause: '', step: '' } : {}),
        },
      },
    }));
  };
  const check = (key: string, label: string) => (
    <label className="net-model-check">
      <input
        type="checkbox"
        checked={Boolean(c[key])}
        onChange={(e) => change(key, e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
  const range = (key: string) => {
    const [label, min, max, step, unit] = limits[key];
    return (
      <label className="net-model-control">
        <span>
          {label}
          <strong>
            {c[key]}
            {unit}
          </strong>
        </span>
        <input
          aria-label={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number(c[key])}
          onChange={(e) => change(key, Number(e.target.value))}
        />
      </label>
    );
  };
  const select = (key: string, label: string, options: [string, string][]) => (
    <label className="net-model-control">
      <span>{label}</span>
      <select
        aria-label={label}
        value={String(c[key])}
        onChange={(e) => change(key, e.target.value)}
      >
        {options.map(([v, s]) => (
          <option key={v} value={v}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
  let controls: ReactNode;
  if (kind === 'http')
    controls = (
      <>
        {select(
          'status',
          'Response',
          Object.entries(HTTP_CASES).map(([v, x]) => [v, `${v} ${x.name}`]),
        )}
        {select('action', 'Your next action', [
          ['render', 'Validate JSON and render'],
          ['pending', 'Track accepted work as pending'],
          ['empty', 'Handle an explicitly empty response'],
          ['refresh', 'Join a bounded token refresh'],
          ['forbidden', 'Show permission refusal'],
          ['conflict', 'Resolve a version conflict'],
          ['wait', 'Respect Retry-After / budget'],
          ['retry', 'Bounded retry of this safe read'],
        ])}
      </>
    );
  else if (kind === 'retry')
    controls = (
      <>
        {range('attempts')}
        {range('budget')}
        {check('stable', 'Reuse the persisted operation key')}
        {check('dedupe', 'Server implements atomic durable deduplication')}
        {check('jitter', 'Use sampled backoff with jitter')}
      </>
    );
  else if (kind === 'cache')
    controls = (
      <>
        {range('age')}
        {range('stale')}
        {range('inactive')}
        {range('gc')}
        {check('switchAccount', 'Mount as account B instead of A')}
        {check('scope', 'Include account identity in the query key')}
      </>
    );
  else if (kind === 'auth')
    controls = (
      <>
        {range('calls')}
        {check('single', 'Single-flight refresh per session')}
        {check('logout', 'Log out before refresh completes')}
        {check('guard', 'Check captured session epoch before saving / replaying')}
      </>
    );
  else if (kind === 'outbox')
    controls = (
      <>
        {select('crash', 'Crash point', [
          ['local', 'Between local change and outbox insert'],
          ['server', 'After server commit, before response'],
          ['ack', 'After response, before durable acknowledgement'],
        ])}
        {check('atomic', 'Save local change + outbox in one transaction')}
        {check('stable', 'Persist and reuse the same operation key')}
        {check('dedupe', 'Server durably deduplicates the key')}
        {check('switchAccount', 'Restart with a different active account')}
        {check('bound', 'Bind outbox to its original account')}
      </>
    );
  else if (kind === 'trace')
    controls = (
      <>
        {select('scenario', 'Controlled scenario', [
          ['a', 'Scenario A'],
          ['b', 'Scenario B'],
          ['c', 'Scenario C'],
        ])}
        {select('cause', 'Your diagnosis', [
          ['unknown', 'Choose a dominant region…'],
          ['outside', 'Time outside the server span'],
          ['database', 'Backend database work'],
          ['app', 'App processing after HTTP'],
        ])}
        {check('propagate', 'Compatible app → API context propagation')}
        {check('sampled', 'Retain server spans in this sampled trace')}
      </>
    );
  else if (kind === 'metrics')
    controls = (
      <>
        {range('fail')}
        {range('recover')}
        {select('denominator', 'Denominator for final operation success', [
          ['attempts', 'All HTTP attempts'],
          ['operations', 'All eligible user operations'],
          ['successes', 'Only successful events'],
        ])}
      </>
    );
  else {
    const d = DIAGNOSES[Number(c.case)];
    controls = (
      <>
        {select(
          'case',
          'Incident',
          DIAGNOSES.map((d, i) => [String(i), d.title]),
        )}
        {select('cause', 'Most supported explanation', [
          ['', 'Choose a cause…'],
          ...d.causes.map((s, i) => [String(i), s] as [string, string]),
        ])}
        {select('step', 'Next action', [
          ['', 'Choose a next action…'],
          ...d.steps.map((s, i) => [String(i), s] as [string, string]),
        ])}
      </>
    );
  }
  const execute = () => {
    const next = new Set(seen);
    let pass = false;
    if (kind === 'http') {
      if (HTTP_CASES[c.status].action === c.action) next.add(c.status);
      pass = ['202', '204', '429'].every((s) => next.has(s));
    }
    if (kind === 'retry') pass = simRetry(c).safe && c.jitter;
    if (kind === 'cache') {
      const x = simCache(c);
      if (x.usable && x.stale && !x.leak) next.add('stale');
      if (c.switchAccount && c.scope && !x.usable) next.add('isolation');
      pass = next.has('stale') && next.has('isolation');
    }
    if (kind === 'auth') pass = c.single && c.logout && c.guard;
    if (kind === 'outbox')
      pass = c.crash !== 'local' && !c.switchAccount && c.atomic && c.stable && c.dedupe && c.bound;
    if (kind === 'trace') pass = c.cause === simTrace(c).cause && c.propagate && c.sampled;
    if (kind === 'metrics')
      pass = c.fail > 0 && c.recover === 100 && c.denominator === 'operations';
    if (kind === 'diagnosis') {
      const d = DIAGNOSES[Number(c.case)];
      if (c.cause === String(d.correctCause) && c.step === String(d.correctStep)) next.add(c.case);
      pass = next.size >= 3;
    }
    update((p) => ({
      ...p,
      labSeen: { ...p.labSeen, [kind]: [...next] },
      labs: pass ? [...new Set([...p.labs, kind])] : p.labs,
    }));
    setRun({ ...c });
  };
  return (
    <section className="net-simulation">
      <div className="net-simulation-heading">
        <span className="net-kicker">PREDICT · CHANGE · OBSERVE</span>
        {progress.labs.includes(kind) && (
          <span className="net-complete-label">
            <CheckCircle2 size={15} />
            Challenge completed
          </span>
        )}
      </div>
      <h3>{labMeta[kind].title}</h3>
      <p>{labMeta[kind].subtitle}</p>
      <div className="net-callout">
        <p>
          <strong>Your challenge.</strong> {goals[kind]}
        </p>
      </div>
      <div className="net-model-controls">{controls}</div>
      {kind === 'http' && (
        <div className="net-code-block">
          <pre>
            <code>
              HTTP {c.status} {HTTP_CASES[c.status].name}
              {'\n'}
              {HTTP_CASES[c.status].body}
            </code>
          </pre>
        </div>
      )}
      {kind === 'diagnosis' && (
        <>
          <h4>Evidence available</h4>
          <Events items={DIAGNOSES[Number(c.case)].evidence} />
        </>
      )}
      <button className="net-btn net-btn-primary" onClick={execute}>
        <Play size={15} />
        {kind === 'diagnosis' ? 'Check the evidence' : 'Run simulation'}
      </button>
      <div className="net-model-output" aria-live="polite">
        {run ? (
          <Result kind={kind} c={run} seen={seen} />
        ) : (
          <p>Change a control, predict the outcome, then run the model.</p>
        )}
      </div>
      <p className="net-footnote">
        Local teaching model with controlled assumptions. It does not make API calls or prove real
        native, provider, database, or server guarantees.
      </p>
    </section>
  );
}
