export type ReleaseState = 'CREATED' | 'STAGING' | 'LIVE' | 'HALTED' | 'DISABLED' | 'DELETED';
export interface Release {
  appId: string;
  jsVersion: number;
  bundleVersion: number;
  state: ReleaseState;
  rollout: number;
  hash: string;
  patchFrom: number[];
}
export interface Device {
  appId: string;
  jsVersion: number;
  bundleVersion: number;
  bucket: number;
  internal: boolean;
}
export const stateValues: Record<ReleaseState, number> = {
  CREATED: 0,
  STAGING: 10,
  LIVE: 20,
  HALTED: 25,
  DISABLED: 30,
  DELETED: 40,
};
export const transitions: Record<ReleaseState, ReleaseState[]> = {
  CREATED: ['STAGING', 'DISABLED', 'DELETED'],
  STAGING: ['LIVE', 'DISABLED', 'DELETED', 'HALTED'],
  LIVE: ['DISABLED', 'DELETED', 'HALTED'],
  HALTED: ['LIVE', 'DISABLED', 'DELETED'],
  DISABLED: ['DELETED'],
  DELETED: [],
};
export function patchKey(target: number, base: number) {
  return `patch-${String(target).padStart(2, '0').slice(-2)}-${String(base).padStart(2, '0').slice(-2)}`;
}
// Mirrors checkUpdate/app.ts selection; URLs and hash values in the lab are illustrative.
export function selectUpdate(device: Device, releases: Release[]) {
  const compatible = releases.filter(
    (r) => r.appId === device.appId && r.jsVersion === device.jsVersion,
  );
  if (
    compatible.some(
      (r) => r.bundleVersion === device.bundleVersion && ['DISABLED', 'DELETED'].includes(r.state),
    )
  ) {
    return { data: { rollback: true } };
  }
  const selected = compatible
    .filter(
      (r) =>
        r.bundleVersion > device.bundleVersion &&
        (device.internal
          ? ['STAGING', 'LIVE'].includes(r.state)
          : r.state === 'LIVE' && r.rollout >= device.bucket),
    )
    .sort((a, b) => b.bundleVersion - a.bundleVersion)[0];
  if (!selected) return { data: { isUpdateAvailable: false } };
  const root = `https://cdn.example.com/${selected.appId}/${selected.jsVersion}/${selected.bundleVersion}`;
  return {
    data: {
      isUpdateAvailable: true,
      isMandatory: false,
      hash: selected.hash,
      jsVersion: selected.jsVersion,
      bundleVersion: selected.bundleVersion,
      releaseState: stateValues[selected.state],
      patchUrl: selected.patchFrom.includes(device.bundleVersion)
        ? `${root}/${patchKey(selected.bundleVersion, device.bundleVersion)}.zip`
        : null,
      bundleUrl: `${root}/bundle.zip`,
    },
  };
}
export type PatchOp =
  { kind: 'copy'; start: number; length: number } | { kind: 'add'; text: string };
// A deliberately small COPY/ADD teaching format. Delta uses binary bsdiff/bspatch.
export function makeTeachingPatch(base: string, target: string): PatchOp[] {
  let prefix = 0;
  while (prefix < Math.min(base.length, target.length) && base[prefix] === target[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < Math.min(base.length - prefix, target.length - prefix) &&
    base[base.length - 1 - suffix] === target[target.length - 1 - suffix]
  )
    suffix++;
  const ops: PatchOp[] = [];
  if (prefix) ops.push({ kind: 'copy', start: 0, length: prefix });
  const middle = target.slice(prefix, target.length - suffix);
  if (middle) ops.push({ kind: 'add', text: middle });
  if (suffix) ops.push({ kind: 'copy', start: base.length - suffix, length: suffix });
  return ops;
}
export function applyTeachingPatch(base: string, ops: PatchOp[]): string {
  return ops
    .map((op) => (op.kind === 'add' ? op.text : base.slice(op.start, op.start + op.length)))
    .join('');
}
export const byteLength = (text: string) => new TextEncoder().encode(text).length;
