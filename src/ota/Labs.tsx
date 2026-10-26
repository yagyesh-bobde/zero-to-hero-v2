import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Database,
  FileCode2,
  GitBranch,
  HardDrive,
  Info,
  Layers,
  Package,
  Play,
  Radio,
  RotateCcw,
  Server,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  X,
} from 'lucide-react';
import type { LabKind } from './types';
import {
  applyTeachingPatch,
  byteLength,
  makeTeachingPatch,
  patchKey,
  selectUpdate,
  stateValues,
  transitions,
} from './engine';
import type { ReleaseState, Release } from './engine';
import Workshop from './Workshop';
import type { WorkshopProps } from './Workshop';
export const labMeta: Record<LabKind, { title: string; subtitle: string; icon: typeof Box }> = {
  boundary: {
    title: 'The OTA boundary',
    subtitle: 'Decide which changes fit inside the installed app.',
    icon: Layers,
  },
  lifecycle: {
    title: 'Follow the bytes',
    subtitle: 'Step through one release, from source to a running screen.',
    icon: Radio,
  },
  patch: {
    title: 'The patch workbench',
    subtitle: 'Edit two programs. Reconstruct one from the other.',
    icon: GitBranch,
  },
  architecture: {
    title: 'Inside the platform',
    subtitle: 'Explore the real responsibilities of each moving part.',
    icon: Server,
  },
  rollout: {
    title: 'The release control room',
    subtitle: 'Change the inputs and inspect the server’s decision.',
    icon: Smartphone,
  },
  failure: {
    title: 'Break it. Recover it.',
    subtitle: 'Find the safe stopping point for a failed update.',
    icon: ShieldCheck,
  },
  workshop: {
    title: 'Build the rules',
    subtitle: 'Write real JavaScript. Run it against behavioral checks.',
    icon: Code2,
  },
};
export default function Lab({ kind, ...props }: WorkshopProps & { kind: LabKind }) {
  return (
    <section className={`ota-lab ota-lab-${kind}`} aria-label={labMeta[kind].title}>
      <div className="ota-lab-heading">
        <span className="ota-live-dot" />
        <span>Interactive lab</span>
        <span className="ota-lab-local">In your browser</span>
      </div>
      {kind === 'boundary' ? (
        <BoundaryLab />
      ) : kind === 'lifecycle' ? (
        <LifecycleLab />
      ) : kind === 'patch' ? (
        <PatchLab />
      ) : kind === 'architecture' ? (
        <ArchitectureLab />
      ) : kind === 'rollout' ? (
        <RolloutLab />
      ) : kind === 'failure' ? (
        <FailureLab />
      ) : (
        <Workshop {...props} />
      )}
    </section>
  );
}
const changes = [
  {
    title: 'Fix a checkout calculation',
    detail: 'The calculation is JavaScript and uses existing APIs.',
    ota: true,
    why: 'A compatible JS logic change can travel in the bundle. Still test the behavior and follow platform rules.',
  },
  {
    title: 'Add a native camera package',
    detail: 'The installed app does not contain its native module.',
    ota: false,
    why: 'The binary must contain the compiled native module. Publish a new native build with a new compatibility line.',
  },
  {
    title: 'Change a button label',
    detail: 'A string rendered by an existing React component.',
    ota: true,
    why: 'The existing runtime can render the new label without a new native capability.',
  },
  {
    title: 'Upgrade Hermes',
    detail: 'The new bundle expects a different engine version.',
    ota: false,
    why: 'Hermes is compiled into the native app. Ship a compatible native runtime through a new binary.',
  },
  {
    title: 'Replace a packaged product image',
    detail: 'The SDK packages the asset and the release resolves it.',
    ota: true,
    why: 'Supported bundled assets can be delivered with an update. Their bytes still count toward transfer size.',
  },
  {
    title: 'Add an Android permission',
    detail: 'A new entry is needed in AndroidManifest.xml.',
    ota: false,
    why: 'The manifest belongs to the installed binary. Downloading JavaScript cannot rewrite it.',
  },
];
function BoundaryLab() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const item = changes[current];
  const answered = current in answers;
  const score = Object.entries(answers).filter(([i, a]) => changes[Number(i)].ota === a).length;
  return (
    <div className="ota-lab-body">
      <div className="ota-lab-title-row">
        <div>
          <h3>Can it ship OTA?</h3>
          <p>The native app is already installed. What can it handle?</p>
        </div>
        <span className="ota-mono">
          {current + 1} / {changes.length}
        </span>
      </div>
      <div className="ota-boundary-stage">
        <div className="ota-layer-stack">
          <div>
            <Smartphone size={19} />
            <span>
              Native shell<small>Installed with the app</small>
            </span>
            <span className="ota-lock">Fixed</span>
          </div>
          <div className="ota-layer-js">
            <FileCode2 size={19} />
            <span>
              JS bundle + assets<small>Compatible runtime updates</small>
            </span>
            <span className="ota-live-dot" />
          </div>
        </div>
        <div className="ota-boundary-question">
          <span className="ota-kicker">The proposed change</span>
          <h4>{item.title}</h4>
          <p>{item.detail}</p>
          <div className="ota-button-row">
            <button
              className={`ota-btn ${answered && answers[current] ? 'is-selected' : ''}`}
              onClick={() => setAnswers((a) => ({ ...a, [current]: true }))}
            >
              <Radio size={15} /> OTA candidate
            </button>
            <button
              className={`ota-btn ${answered && !answers[current] ? 'is-selected' : ''}`}
              onClick={() => setAnswers((a) => ({ ...a, [current]: false }))}
            >
              <Package size={15} /> New native build
            </button>
          </div>
        </div>
      </div>
      <div className="ota-boundary-feedback" aria-live="polite">
        {answered ? (
          <div
            className={`ota-feedback ${answers[current] === item.ota ? 'is-correct' : 'is-wrong'}`}
          >
            {answers[current] === item.ota ? <CheckCircle2 size={18} /> : <Info size={18} />}
            <p>{item.why}</p>
          </div>
        ) : (
          <p className="ota-muted">Choose a delivery path to see the reasoning.</p>
        )}
      </div>
      <div className="ota-lab-bottom">
        <span>
          {Object.keys(answers).length
            ? `${score} correct · ${Object.keys(answers).length} explored`
            : 'Try all six changes'}
        </span>
        <div className="ota-button-row">
          <button
            className="ota-icon-button"
            aria-label="Previous change"
            disabled={current === 0}
            onClick={() => setCurrent((n) => n - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="ota-icon-button"
            aria-label="Next change"
            disabled={current === changes.length - 1}
            onClick={() => setCurrent((n) => n + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
const flow = [
  {
    title: 'Build the target',
    actor: 'Publisher · Delta CLI',
    text: 'Metro bundles the JS; Hermes compiles it. The CLI creates the complete target bundle 4 and its expected MD5.',
    disk: 'Embedded 0 + downloaded 1',
    engine: 'Bundle 1',
    status: 'No new update',
    icon: Code2,
    code: 'source → Metro → Hermes → target 4',
  },
  {
    title: 'Generate and publish',
    actor: 'Publisher → S3 + DynamoDB',
    text: 'Create the 1→4 binary patch, upload it with assets and the full target, then make the staged/tested release LIVE.',
    disk: 'Embedded 0 + downloaded 1',
    engine: 'Bundle 1',
    status: 'Target LIVE at 30%',
    icon: UploadCloud,
    code: 'bsdiff(base1, target4) → patch-04-01',
  },
  {
    title: 'Ask for an update',
    actor: 'Native SDK → CloudFront → Lambda',
    text: 'The phone sends its identity, compatibility line, current revision, and bucket. Here 30% rollout includes bucket 20.',
    disk: 'Embedded 0 + downloaded 1',
    engine: 'Bundle 1',
    status: 'Target 4 is eligible',
    icon: Radio,
    code: 'jsVersion=101 & bundleVersion=1 & bucket=20',
  },
  {
    title: 'Download the patch',
    actor: 'Native SDK ← CloudFront / S3',
    text: 'The response has a direct patch edge and the full target URL. The native downloader writes a patch ZIP to temporary storage.',
    disk: 'Bundle 1 + temporary patch ZIP',
    engine: 'Bundle 1',
    status: 'Downloading',
    icon: Cloud,
    code: 'GET https://cdn.example.com/patch-04-01.zip',
  },
  {
    title: 'Reconstruct the target',
    actor: 'Native SDK · bspatch',
    text: 'Unzip the patch and assets. bspatch uses the exact bundle 1 bytes to reconstruct a complete target bundle 4.',
    disk: 'Bundle 1 + temporary target 4',
    engine: 'Bundle 1',
    status: 'PATCH_APPLIED',
    icon: GitBranch,
    code: 'bspatch(base1, patch1to4) → reconstructed4',
  },
  {
    title: 'Verify the final bytes',
    actor: 'Native SDK · file validation',
    text: 'Compare reconstructed MD5 with the expected target hash. Copy the target into its final location and verify that copy too.',
    disk: 'Bundle 1 + verified target 4',
    engine: 'Bundle 1',
    status: 'Hash matched',
    icon: ShieldCheck,
    code: 'MD5(reconstructed4) === expectedTargetHash',
  },
  {
    title: 'Commit ready state',
    actor: 'Native SDK · cached manifest',
    text: 'Persist the target metadata as READY_TO_INSTALL. The already-running JS engine still executes bundle 1.',
    disk: 'Bundle 4 ready for next start',
    engine: 'Bundle 1',
    status: 'READY_TO_INSTALL',
    icon: HardDrive,
    code: 'manifest: { bundleVersion: 4, status: READY_TO_INSTALL }',
  },
  {
    title: 'Start a new runtime',
    actor: 'Native host · getJSBundlePath',
    text: 'On the next native loading path, appVersion matches and the target file exists. The loader returns bundle 4 and updates installed metadata.',
    disk: 'Bundle 4 selected',
    engine: 'Bundle 4',
    status: 'INSTALLED',
    icon: Smartphone,
    code: 'getJSBundlePath() → /delta/101-4/bundle',
  },
  {
    title: 'Observe healthy behavior',
    actor: 'Your app · product telemetry',
    text: 'Confirm the executing revision and successful checkout. SDK installed state alone does not prove the fix worked.',
    disk: 'Bundle 4 selected',
    engine: 'Bundle 4',
    status: 'App health observed',
    icon: CheckCircle2,
    code: 'executing=101/4; checkout_rendered=true',
  },
];
export function LifecycleLab({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const item = flow[step];
  const Icon = item.icon;
  return (
    <div className={`ota-lab-body ota-lifecycle ${compact ? 'is-compact' : ''}`}>
      <div className="ota-lab-title-row">
        <div>
          <span className="ota-kicker">A checkout hotfix · 101/1 → 101/4</span>
          <h3>{compact ? 'A release, from the inside.' : 'Follow the bytes'}</h3>
        </div>
        <span className="ota-step-count">
          {String(step + 1).padStart(2, '0')}
          <span> / 09</span>
        </span>
      </div>
      <div className="ota-flow-scene">
        <div className="ota-flow-system">
          <div className={`ota-system-box ${step < 2 ? 'is-active' : ''}`}>
            <Code2 size={19} />
            <span>
              Build<small>Delta CLI</small>
            </span>
          </div>
          <ArrowDown size={15} />
          <div className={`ota-system-box ${step >= 1 && step < 4 ? 'is-active' : ''}`}>
            <Cloud size={19} />
            <span>
              Deliver<small>API + CDN</small>
            </span>
          </div>
          <ArrowDown size={15} />
          <div className={`ota-system-box ${step >= 4 ? 'is-active' : ''}`}>
            <ShieldCheck size={19} />
            <span>
              Verify & load<small>Native SDK</small>
            </span>
          </div>
        </div>
        <div className="ota-flow-connector">
          <span />
          <Radio size={18} />
          <span />
        </div>
        <div className="ota-phone">
          <div className="ota-phone-speaker" />
          <div className="ota-phone-header">
            <span>Learning Shop</span>
            <span className="ota-live-dot" />
          </div>
          <div className="ota-phone-screen">
            <div className="ota-phone-logo">
              <Layers size={27} />
            </div>
            <span className="ota-kicker">Running on the phone</span>
            <strong>{item.engine}</strong>
            <span className={`ota-phone-badge ${step >= 7 ? 'is-new' : ''}`}>
              {step >= 7 ? 'The fix is running' : 'Current program'}
            </span>
            <div className="ota-phone-divider" />
            <span className="ota-kicker">On disk</span>
            <p>{item.disk}</p>
          </div>
          <div className="ota-phone-home" />
        </div>
      </div>
      <div className="ota-flow-detail" aria-live="polite">
        <div className="ota-flow-detail-title">
          <span className="ota-flow-icon">
            <Icon size={17} />
          </span>
          <div>
            <h4>{item.title}</h4>
            <span>{item.actor}</span>
          </div>
          <span className="ota-status-pill">{item.status}</span>
        </div>
        <p>{item.text}</p>
        {!compact && <code className="ota-flow-code">{item.code}</code>}
      </div>
      <div className="ota-lab-bottom">
        <div className="ota-step-dots">
          {flow.map((s, i) => (
            <button
              key={s.title}
              className={step === i ? 'is-active' : i < step ? 'is-done' : ''}
              aria-label={`Step ${i + 1}: ${s.title}`}
              aria-pressed={step === i}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
        <div className="ota-button-row">
          <button
            className="ota-icon-button"
            aria-label="Previous update step"
            disabled={step === 0}
            onClick={() => setStep((n) => n - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="ota-btn ota-btn-small"
            onClick={() => setStep((n) => (n + 1) % flow.length)}
          >
            {step === flow.length - 1 ? <RotateCcw size={14} /> : <Play size={13} />}{' '}
            {step === flow.length - 1 ? 'Replay' : 'Next step'}
          </button>
        </div>
      </div>
    </div>
  );
}
function PatchLab() {
  const [base, setBase] = useState('const greeting = "Hello, Alex!";\nshowCheckout(greeting);');
  const [target, setTarget] = useState('const greeting = "Hello, Maya!";\nshowCheckout(greeting);');
  const [wrongBase, setWrongBase] = useState(false);
  const ops = makeTeachingPatch(base, target);
  const appliedBase = wrongBase ? '/* unexpected base */' + base : base;
  const output = applyTeachingPatch(appliedBase, ops);
  const valid = output === target;
  const copied = ops.reduce((n, op) => n + (op.kind === 'copy' ? op.length : 0), 0);
  const recipeBytes = byteLength(JSON.stringify(ops));
  return (
    <div className="ota-lab-body">
      <h3>The patch workbench</h3>
      <p>Edit either bundle. The recipe and reconstruction update as you type.</p>
      <div className="ota-patch-inputs">
        <label>
          <span>
            <FileCode2 size={14} /> Base bundle A
          </span>
          <textarea
            aria-label="Base bundle text"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label>
          <span>
            <FileCode2 size={14} /> Target bundle B
          </span>
          <textarea
            aria-label="Target bundle text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            spellCheck={false}
          />
        </label>
      </div>
      <div className="ota-patch-metrics">
        <div>
          <span>Target</span>
          <strong>
            {byteLength(target)}
            <small> bytes</small>
          </strong>
        </div>
        <div>
          <span>Reused from A</span>
          <strong>
            {copied}
            <small> characters</small>
          </strong>
        </div>
        <div>
          <span>JSON recipe</span>
          <strong>
            {recipeBytes}
            <small> bytes</small>
          </strong>
        </div>
      </div>
      <div className="ota-patch-recipe">
        <div>
          <span className="ota-kicker">The reconstruction recipe</span>
          {ops.length ? (
            ops.map((op, i) => (
              <div className={`ota-patch-op is-${op.kind}`} key={i}>
                <span>{i + 1}</span>
                <strong>{op.kind.toUpperCase()}</strong>
                <code>
                  {op.kind === 'copy'
                    ? `A[${op.start}…${op.start + op.length})`
                    : JSON.stringify(op.text)}
                </code>
              </div>
            ))
          ) : (
            <p className="ota-muted">Empty target → empty recipe.</p>
          )}
        </div>
        <div>
          <span className="ota-kicker">Reconstructed output</span>
          <pre className={valid ? 'is-valid' : 'is-invalid'}>{output || '(empty bundle)'}</pre>
          <div className={`ota-feedback ${valid ? 'is-correct' : 'is-wrong'}`}>
            {valid ? <CheckCircle2 size={16} /> : <X size={16} />}
            <span>
              {valid ? 'Exact target reconstructed' : 'Wrong base → target mismatch. Reject it.'}
            </span>
          </div>
        </div>
      </div>
      <label className="ota-checkbox">
        <input
          type="checkbox"
          checked={wrongBase}
          onChange={(e) => setWrongBase(e.target.checked)}
        />
        Apply this recipe to the wrong base
      </label>
      <p className="ota-lab-caption">
        Original COPY/ADD teaching format over JS strings; not bsdiff, binary compression, or a
        performance benchmark. UTF-8 sizes include JSON metadata. Delta uses binary bsdiff/bspatch
        and packages assets too. Output equality here stands in for target verification.
      </p>
    </div>
  );
}
const systems = [
  {
    id: 'cli',
    title: 'Delta CLI',
    icon: Code2,
    tag: 'Publishing',
    detail:
      'Runs Metro and Hermes, hashes the complete bundle, creates bsdiff patches for fetched bases, copies assets into patch ZIPs, uploads artifacts, and invokes management Lambdas using the publisher’s AWS credentials.',
    file: 'delta-cli / src/utils/BundleManager.ts',
    hop: 'Source + baseline → target + patches',
  },
  {
    id: 's3',
    title: 'Amazon S3',
    icon: Box,
    tag: 'Artifacts',
    detail:
      'Stores the full bundle ZIP and base-specific patch ZIPs. The infrastructure uses a private bucket with CloudFront origin access control. Deleting an object does not update the corresponding release state.',
    file: 'delta-server / template.yaml',
    hop: 'Full target + patch ZIPs → CDN',
  },
  {
    id: 'ddb',
    title: 'DynamoDB',
    icon: Database,
    tag: 'Metadata',
    detail:
      'Stores registry and release records in a single table. AppId is the partition key; ReleaseVersion is the sort key. The reserved registry key is 0000-00 and a sample release key is 0101-04.',
    file: 'delta-server / src/data/model.ts',
    hop: 'App + JS line → eligible releases',
  },
  {
    id: 'lambda',
    title: 'Check Lambda',
    icon: Server,
    tag: 'Selection',
    detail:
      'Queries the app and JS line. Gives rollback priority to a disabled/deleted current record; otherwise selects the highest eligible revision and looks up patch-TARGET-BASE. isMandatory is always false in this snapshot.',
    file: 'delta-server / src/api/checkUpdate/app.ts',
    hop: 'Device query → update / no update / rollback',
  },
  {
    id: 'gateway',
    title: 'API Gateway',
    icon: GitBranch,
    tag: 'Routing',
    detail:
      'Exposes the public check_update route to devices. Management functions are invoked directly through the Lambda API with IAM. The deployed API stage may be part of the configured URL.',
    file: 'delta-server / template.yaml',
    hop: 'HTTP check → Lambda invocation',
  },
  {
    id: 'cdn',
    title: 'CloudFront',
    icon: Cloud,
    tag: 'Delivery',
    detail:
      'Routes artifact reads to S3 and check requests to API Gateway. API cache keys include device targeting/version fields. Release updates invalidate cached check responses, with propagation time.',
    file: 'delta-server / template.yaml',
    hop: 'Cache hit or origin fetch → device',
  },
  {
    id: 'sdk',
    title: 'Native SDK',
    icon: Smartphone,
    tag: 'On device',
    detail:
      'Chooses the launch path, checks for updates, downloads/unzips artifacts, applies bspatch, validates target bytes, and commits ready state. The current engine can keep running older code until the next native runtime start.',
    file: 'react-native-delta / Android + iOS managers',
    hop: 'Base + patch → verified target → next load',
  },
  {
    id: 'embedded',
    title: 'Embedded bundle',
    icon: ShieldCheck,
    tag: 'Safety path',
    detail:
      'Ships inside the installed native app and remains available offline. The inspected rollback loader returns this baseline while downloaded state is cleared. It must remain compatible with persisted data.',
    file: 'react-native-delta / getJSBundlePath',
    hop: 'No usable downloaded bundle → embedded path',
  },
];
function ArchitectureLab() {
  const [selected, setSelected] = useState('cli');
  const system = systems.find((s) => s.id === selected)!;
  const Icon = system.icon;
  return (
    <div className="ota-lab-body">
      <h3>Eight pieces. One release.</h3>
      <p>Choose a component to inspect its responsibility and the handoff it owns.</p>
      <div className="ota-architecture-grid">
        {systems.map((s, i) => {
          const I = s.icon;
          return (
            <button
              key={s.id}
              className={selected === s.id ? 'is-active' : ''}
              onClick={() => setSelected(s.id)}
              aria-pressed={selected === s.id}
            >
              <span className="ota-system-number">0{i + 1}</span>
              <I size={23} />
              <strong>{s.title}</strong>
              <span>{s.tag}</span>
            </button>
          );
        })}
      </div>
      <div className="ota-architecture-route">
        <span>CLI</span>
        <ArrowRight size={14} />
        <span>S3 + metadata</span>
        <ArrowRight size={14} />
        <span>API / CDN</span>
        <ArrowRight size={14} />
        <span>Native SDK</span>
        <ArrowRight size={14} />
        <span>JS runtime</span>
      </div>
      <div className="ota-architecture-detail" aria-live="polite">
        <Icon size={22} />
        <div>
          <span className="ota-kicker">{system.tag}</span>
          <h4>{system.title}</h4>
          <p>{system.detail}</p>
          <code>{system.hop}</code>
          <span className="ota-file-ref">{system.file}</span>
        </div>
      </div>
      <p className="ota-lab-caption">
        Patch generation happens during publishing in the CLI. The public server’s check handler
        selects existing artifacts; it does not generate a patch per device request.
      </p>
    </div>
  );
}
export function RolloutLab() {
  const [rollout, setRollout] = useState(30);
  const [bucket, setBucket] = useState(20);
  const [state, setState] = useState<ReleaseState>('LIVE');
  const [internal, setInternal] = useState(false);
  const [line, setLine] = useState(101);
  const [current, setCurrent] = useState(1);
  const [edge, setEdge] = useState(true);
  const [disabledCurrent, setDisabledCurrent] = useState(false);
  const target: Release = {
    appId: 'shop-android',
    jsVersion: 101,
    bundleVersion: 4,
    state,
    rollout,
    hash: 'example-target-md5',
    patchFrom: edge ? [0, 1, 2, 3] : [],
  };
  const releases = [
    target,
    ...(disabledCurrent
      ? [
          {
            ...target,
            jsVersion: line,
            bundleVersion: current,
            state: 'DISABLED' as const,
            patchFrom: [],
          },
        ]
      : []),
  ];
  const device = {
    appId: 'shop-android',
    jsVersion: line,
    bundleVersion: current,
    bucket,
    internal,
  };
  const response = selectUpdate(device, releases);
  const data = response.data;
  const verdict =
    'rollback' in data
      ? 'Rollback to embedded'
      : data.isUpdateAvailable
        ? 'Update available'
        : 'No update available';
  const reason =
    'rollback' in data
      ? 'The current revision is disabled. Rollback takes priority over a newer target.'
      : line !== 101
        ? 'The device is on a different JS compatibility line.'
        : current >= 4
          ? 'There is no newer revision in this example.'
          : internal
            ? ['STAGING', 'LIVE'].includes(state)
              ? 'Internal users can receive STAGING or LIVE without the rollout gate.'
              : 'This release state is not offered to internal users.'
            : state !== 'LIVE'
              ? 'Regular users only receive LIVE releases.'
              : rollout < bucket
                ? `Bucket ${bucket} is outside rollout ${rollout}.`
                : `LIVE + newer + same line + ${rollout} ≥ ${bucket}. ${edge ? 'A direct patch is available.' : 'No patch edge; use the full bundle.'}`;
  return (
    <div className="ota-lab-body">
      <h3>The release control room</h3>
      <p>
        Target: <code>shop-android · JS 101 · bundle 4</code>. These controls change a local model
        of the checked-in server.
      </p>
      <div className="ota-rollout-columns">
        <div className="ota-release-controls">
          <label>
            Target release state
            <select value={state} onChange={(e) => setState(e.target.value as ReleaseState)}>
              {Object.keys(stateValues).map((s) => (
                <option key={s} value={s}>
                  {s} ({stateValues[s as ReleaseState]})
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>
              Rollout <strong>{rollout}%</strong>
            </span>
            <input
              aria-label="Release rollout percentage"
              type="range"
              min="0"
              max="100"
              step="10"
              value={rollout}
              onChange={(e) => setRollout(Number(e.target.value))}
            />
          </label>
          <div className="ota-device-controls">
            <label>
              Device JS line
              <select value={line} onChange={(e) => setLine(Number(e.target.value))}>
                <option value={101}>101 · compatible</option>
                <option value={102}>102 · incompatible</option>
              </select>
            </label>
            <label>
              Current bundle
              <select value={current} onChange={(e) => setCurrent(Number(e.target.value))}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>
              Device bucket <strong>{bucket}</strong>
            </span>
            <input
              aria-label="Device rollout bucket"
              type="range"
              min="10"
              max="100"
              step="10"
              value={bucket}
              onChange={(e) => setBucket(Number(e.target.value))}
            />
          </label>
          <label className="ota-checkbox">
            <input
              type="checkbox"
              checked={internal}
              onChange={(e) => setInternal(e.target.checked)}
            />
            Internal test user · iu=true
          </label>
          <label className="ota-checkbox">
            <input type="checkbox" checked={edge} onChange={(e) => setEdge(e.target.checked)} />
            Direct base → target patch exists
          </label>
          <label className="ota-checkbox">
            <input
              type="checkbox"
              checked={disabledCurrent}
              onChange={(e) => setDisabledCurrent(e.target.checked)}
            />
            Current revision is DISABLED
          </label>
        </div>
        <div className="ota-cohort-panel">
          <div className="ota-cohort-header">
            <span className="ota-kicker">100 illustrative devices</span>
            <span>
              {line === 101 && current < 4 && !disabledCurrent
                ? internal && ['LIVE', 'STAGING'].includes(state)
                  ? '100 eligible'
                  : !internal && state === 'LIVE'
                    ? `${rollout} eligible`
                    : '0 eligible'
                : '0 updates'}
            </span>
          </div>
          <div className="ota-device-grid" aria-label="Illustrative device rollout grid">
            {Array.from({ length: 100 }, (_, i) => {
              const b = Math.ceil((i + 1) / 10) * 10;
              const d = selectUpdate({ ...device, bucket: b }, releases).data;
              const yes = 'isUpdateAvailable' in d && d.isUpdateAvailable;
              return (
                <span
                  key={i}
                  title={`Illustrative device ${i + 1} · bucket ${b}${yes ? ' · eligible' : ''}`}
                  className={`${yes ? 'is-eligible' : ''} ${b === bucket ? 'is-bucket' : ''}`}
                />
              );
            })}
          </div>
          <div className="ota-cohort-legend">
            <span>
              <i />
              Outside target
            </span>
            <span>
              <i />
              Eligible
            </span>
            <span>Your bucket: {bucket}</span>
          </div>
          <div
            className={`ota-decision ${'rollback' in data ? 'is-rollback' : data.isUpdateAvailable ? 'is-update' : ''}`}
            aria-live="polite"
          >
            <span className="ota-kicker">Server decision</span>
            <strong>{verdict}</strong>
            <p>{reason}</p>
          </div>
        </div>
      </div>
      <details className="ota-json" open>
        <summary>
          Request & response <span>JSON · example URLs</span>
        </summary>
        <code className="ota-request">
          GET /api/v1/check_update?appId=shop-android&amp;jsVersion={line}&amp;bundleVersion=
          {current}&amp;bucket={bucket}&amp;iu={String(internal)}
        </code>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </details>
      <div className="ota-transition-note">
        <GitBranch size={16} />
        <p>
          <strong>Allowed next states for {state}:</strong>{' '}
          {transitions[state].join(', ') || 'None; DELETED is terminal.'} The selector can inspect
          any state; it does not perform a real transition.
        </p>
      </div>
      <p className="ota-lab-caption">
        Buckets are illustrative ten-point groups. Actual SDK buckets are hash-derived with version
        inputs. Eligibility is not measured adoption. Hashes and CDN URLs are placeholders; no
        requests are made.
      </p>
    </div>
  );
}
const failures = [
  {
    id: 'network',
    title: 'Network disconnects',
    stage: 1,
    result: 'Keep the current bundle',
    outcome:
      'No complete target exists. The current launchable bundle remains the usable path; retry policy can act later.',
    steps: [
      'Check target',
      'Download interrupted',
      'No verified target',
      'Current program continues',
    ],
    note: 'A network failure does not require changing to an incompatible or incomplete bundle.',
  },
  {
    id: 'patch',
    title: 'Patch reconstruction fails',
    stage: 2,
    result: 'Try the full target',
    outcome:
      'The inspected Android paths can download the full bundle when patch application or reconstructed hash validation fails. The full target still has to pass verification.',
    steps: [
      'Download patch',
      'Reconstruction fails',
      'Download full bundle',
      'Verify full target → ready',
    ],
    note: 'This is a transport fallback. It is different from rolling a bad release back.',
  },
  {
    id: 'hash',
    title: 'Full target hash is wrong',
    stage: 2,
    result: 'Reject the target',
    outcome:
      'Do not commit the invalid target as ready. Retain a usable launch path; investigate artifacts, expected hash, base bytes, and publishing pipeline.',
    steps: [
      'Download full target',
      'Unzip file',
      'Target MD5 mismatch',
      'Reject; keep usable bundle',
    ],
    note: 'A successful HTTP 200 response does not establish artifact integrity.',
  },
  {
    id: 'native',
    title: 'Native app was upgraded',
    stage: 2,
    result: 'Use the embedded bundle',
    outcome:
      'The loader sees a cached appVersion that differs from the installed appVersion. It uses the new binary’s embedded baseline instead of the old downloaded file.',
    steps: [
      'Install new native binary',
      'Read cached metadata',
      'App version mismatch',
      'Load new embedded baseline',
    ],
    note: 'A stored file can exist and still be inappropriate for the current native binary.',
  },
  {
    id: 'rollback',
    title: 'Current release is disabled',
    stage: 1,
    result: 'Request embedded rollback',
    outcome:
      'The server returns rollback:true. Native code marks ROLL_BACK. On the relevant bundle-loader path, the embedded bundle is returned while downloaded state is cleared.',
    steps: ['Fresh update check', 'rollback: true', 'Mark ROLL_BACK', 'Next loader → embedded'],
    note: 'It needs a check and a loader path. It is not an immediate switch in every running process.',
  },
  {
    id: 'crash',
    title: 'Android bytecode mismatch',
    stage: 2,
    result: 'Scoped native recovery',
    outcome:
      'For a recognized RN/Hermes CppException category, Android clears Delta bundle/manifest state and chains the prior fatal handler. A later launch can use the embedded path.',
    steps: [
      'Load downloaded bundle',
      'Recognized CppException',
      'Clear Delta state',
      'Fatal reporting → later fallback',
    ],
    note: 'This scoped handler is not a universal crash detector, an iOS guarantee, or an app-health acknowledgement.',
  },
  {
    id: 'logic',
    title: 'Code runs, checkout is wrong',
    stage: 3,
    result: 'Use product health and operations',
    outcome:
      'The artifact can match its hash and load successfully while the feature is broken. Detect it through app telemetry and staged testing; choose halt, disable, or a new fixed release with evidence.',
    steps: ['Download verified', 'Bundle loads', 'Checksum matches', 'Product logic still wrong'],
    note: 'Checksums verify bytes. They cannot verify your business requirements.',
  },
];
function FailureLab() {
  const [id, setId] = useState('patch');
  const item = failures.find((f) => f.id === id)!;
  return (
    <div className="ota-lab-body">
      <h3>Break it. Recover it.</h3>
      <p>Inject a failure and inspect what a safe update path does next.</p>
      <label className="ota-failure-picker">
        Failure scenario
        <select value={id} onChange={(e) => setId(e.target.value)}>
          {failures.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
      </label>
      <div className="ota-failure-timeline">
        {item.steps.map((s, i) => (
          <div
            key={s}
            className={i === item.stage ? 'is-failure' : i > item.stage ? 'is-recovery' : ''}
          >
            <span>
              {i === item.stage ? (
                <X size={17} />
              ) : i > item.stage ? (
                <ShieldCheck size={17} />
              ) : (
                <Check size={17} />
              )}
            </span>
            <strong>{s}</strong>
          </div>
        ))}
      </div>
      <div className="ota-failure-outcome" aria-live="polite">
        <ShieldCheck size={24} />
        <div>
          <span className="ota-kicker">Expected next action</span>
          <h4>{item.result}</h4>
          <p>{item.outcome}</p>
        </div>
      </div>
      <div className="ota-callout">
        <Info size={17} />
        <p>{item.note}</p>
      </div>
      <p className="ota-lab-caption">
        A source-guided teaching simulation. Android full-download fallback and scoped exception
        recovery are identified explicitly; do not infer feature parity across platforms or SDK
        versions.
      </p>
    </div>
  );
}
