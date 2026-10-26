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
    id: 'compatible',
    title: 'Guard the compatibility line',
    prompt:
      'Return true only when appId and jsVersion match and the target bundleVersion is newer. This is the compatibility/newness gate; release state and rollout are handled separately.',
    signature: 'compatible(device, target)',
    starter:
      'function compatible(device, target) {\n  // Compare identity, compatibility line, and revision.\n  return false;\n}',
    solution:
      'function compatible(device, target) {\n  return device.appId === target.appId &&\n    device.jsVersion === target.jsVersion &&\n    target.bundleVersion > device.bundleVersion;\n}',
    tests: [
      {
        name: 'Newer compatible release',
        args: [
          { appId: 'shop-android', jsVersion: 101, bundleVersion: 1 },
          { appId: 'shop-android', jsVersion: 101, bundleVersion: 4 },
        ],
        expected: true,
      },
      {
        name: 'Wrong native line',
        args: [
          { appId: 'a', jsVersion: 101, bundleVersion: 1 },
          { appId: 'a', jsVersion: 102, bundleVersion: 4 },
        ],
        expected: false,
      },
      {
        name: 'Wrong platform registry',
        args: [
          { appId: 'android', jsVersion: 101, bundleVersion: 1 },
          { appId: 'ios', jsVersion: 101, bundleVersion: 4 },
        ],
        expected: false,
      },
      {
        name: 'Already on the target',
        args: [
          { appId: 'a', jsVersion: 1, bundleVersion: 4 },
          { appId: 'a', jsVersion: 1, bundleVersion: 4 },
        ],
        expected: false,
      },
      {
        name: 'Older target',
        args: [
          { appId: 'a', jsVersion: 1, bundleVersion: 4 },
          { appId: 'a', jsVersion: 1, bundleVersion: 2 },
        ],
        expected: false,
      },
    ],
  },
  {
    id: 'patch',
    title: 'Reconstruct a target',
    prompt:
      'Interpret a teaching patch. A copy operation has kind, start, and length; an add operation has kind and text. Join the resulting pieces. This COPY/ADD exercise is not the bsdiff format.',
    signature: 'reconstruct(base, operations)',
    starter:
      'function reconstruct(base, operations) {\n  // Reuse slices from the base; append added text.\n  return "";\n}',
    solution:
      'function reconstruct(base, operations) {\n  return operations.map(op => op.kind === "copy"\n    ? base.slice(op.start, op.start + op.length)\n    : op.text).join("");\n}',
    tests: [
      {
        name: 'Copy, add, copy',
        args: [
          'Hello, Alex!',
          [
            { kind: 'copy', start: 0, length: 7 },
            { kind: 'add', text: 'Maya' },
            { kind: 'copy', start: 11, length: 1 },
          ],
        ],
        expected: 'Hello, Maya!',
      },
      {
        name: 'All new content',
        args: ['', [{ kind: 'add', text: 'new bundle' }]],
        expected: 'new bundle',
      },
      {
        name: 'Reorder base ranges',
        args: [
          'abcdef',
          [
            { kind: 'copy', start: 3, length: 3 },
            { kind: 'copy', start: 0, length: 3 },
          ],
        ],
        expected: 'defabc',
      },
      { name: 'Empty target', args: ['previous', []], expected: '' },
    ],
  },
  {
    id: 'selection',
    title: 'Choose the newest eligible release',
    prompt:
      'Input releases already belong to the right app and JS line. Return "rollback" if the current revision is DISABLED or DELETED. Otherwise return the highest newer eligible bundleVersion, or null. Regular users need LIVE and rollout ≥ bucket; internal users accept STAGING or LIVE regardless of rollout.',
    signature: 'choose(device, releases)',
    starter:
      'function choose(device, releases) {\n  // Rollback first, then filter and select.\n  return null;\n}',
    solution:
      'function choose(device, releases) {\n  if (releases.some(r => r.bundleVersion === device.bundleVersion &&\n      ["DISABLED", "DELETED"].includes(r.state))) return "rollback";\n  const eligible = releases.filter(r => r.bundleVersion > device.bundleVersion &&\n    (device.internal ? ["STAGING", "LIVE"].includes(r.state)\n      : r.state === "LIVE" && r.rollout >= device.bucket));\n  return eligible.length ? Math.max(...eligible.map(r => r.bundleVersion)) : null;\n}',
    tests: [
      {
        name: 'Newest eligible, not merely latest',
        args: [
          { bundleVersion: 1, bucket: 30, internal: false },
          [
            { bundleVersion: 4, state: 'LIVE', rollout: 30 },
            { bundleVersion: 5, state: 'LIVE', rollout: 10 },
          ],
        ],
        expected: 4,
      },
      {
        name: 'Internal staging ignores rollout',
        args: [
          { bundleVersion: 1, bucket: 90, internal: true },
          [{ bundleVersion: 2, state: 'STAGING', rollout: 0 }],
        ],
        expected: 2,
      },
      {
        name: 'Rollback has priority',
        args: [
          { bundleVersion: 1, bucket: 10, internal: false },
          [
            { bundleVersion: 1, state: 'DISABLED', rollout: 100 },
            { bundleVersion: 4, state: 'LIVE', rollout: 100 },
          ],
        ],
        expected: 'rollback',
      },
      {
        name: 'HALTED is not offered',
        args: [
          { bundleVersion: 1, bucket: 10, internal: true },
          [{ bundleVersion: 4, state: 'HALTED', rollout: 100 }],
        ],
        expected: null,
      },
      {
        name: 'Boundary bucket qualifies',
        args: [
          { bundleVersion: 0, bucket: 50, internal: false },
          [{ bundleVersion: 1, state: 'LIVE', rollout: 50 }],
        ],
        expected: 1,
      },
      {
        name: 'Deleted current revision',
        args: [
          { bundleVersion: 2, bucket: 20, internal: false },
          [{ bundleVersion: 2, state: 'DELETED', rollout: 0 }],
        ],
        expected: 'rollback',
      },
    ],
  },
  {
    id: 'loader',
    title: 'Choose the launch bundle',
    prompt:
      'Return "downloaded" only if a cached manifest exists, its appVersion equals installedVersion, its status is not ROLL_BACK, and the bundle file exists. Otherwise return "embedded". This models path selection, not file verification.',
    signature: 'launch(installedVersion, cache, fileExists)',
    starter:
      'function launch(installedVersion, cache, fileExists) {\n  // Native code has to make this decision before React starts.\n  return "embedded";\n}',
    solution:
      'function launch(installedVersion, cache, fileExists) {\n  return cache && cache.appVersion === installedVersion &&\n    cache.status !== "ROLL_BACK" && fileExists\n    ? "downloaded" : "embedded";\n}',
    tests: [
      {
        name: 'Compatible ready file',
        args: ['2.4.0', { appVersion: '2.4.0', status: 'READY_TO_INSTALL' }, true],
        expected: 'downloaded',
      },
      { name: 'Fresh installation', args: ['2.4.0', null, false], expected: 'embedded' },
      {
        name: 'Native app was upgraded',
        args: ['2.5.0', { appVersion: '2.4.0', status: 'INSTALLED' }, true],
        expected: 'embedded',
      },
      {
        name: 'Rollback overrides file existence',
        args: ['2.4.0', { appVersion: '2.4.0', status: 'ROLL_BACK' }, true],
        expected: 'embedded',
      },
      {
        name: 'Referenced file missing',
        args: ['2.4.0', { appVersion: '2.4.0', status: 'INSTALLED' }, false],
        expected: 'embedded',
      },
    ],
  },
  {
    id: 'states',
    title: 'Enforce release transitions',
    prompt:
      'Implement the source transition map. CREATED → STAGING/DISABLED/DELETED; STAGING → LIVE/DISABLED/DELETED/HALTED; LIVE → DISABLED/DELETED/HALTED; HALTED → LIVE/DISABLED/DELETED; DISABLED → DELETED; DELETED → nothing. Return a boolean, including false for unknown states.',
    signature: 'canMove(from, to)',
    starter:
      'function canMove(from, to) {\n  // An explicit map makes recovery intent reviewable.\n  return false;\n}',
    solution:
      'function canMove(from, to) {\n  const allowed = {\n    CREATED: ["STAGING", "DISABLED", "DELETED"],\n    STAGING: ["LIVE", "DISABLED", "DELETED", "HALTED"],\n    LIVE: ["DISABLED", "DELETED", "HALTED"],\n    HALTED: ["LIVE", "DISABLED", "DELETED"],\n    DISABLED: ["DELETED"],\n    DELETED: []\n  };\n  return Object.hasOwn(allowed, from) && allowed[from].includes(to);\n}',
    tests: [
      { name: 'Stage before live', args: ['CREATED', 'STAGING'], expected: true },
      { name: 'No created-to-live shortcut', args: ['CREATED', 'LIVE'], expected: false },
      { name: 'Pause distribution', args: ['LIVE', 'HALTED'], expected: true },
      { name: 'Resume halted', args: ['HALTED', 'LIVE'], expected: true },
      { name: 'Disabled cannot resume', args: ['DISABLED', 'LIVE'], expected: false },
      { name: 'Deleted is terminal', args: ['DELETED', 'STAGING'], expected: false },
      { name: 'Unknown state rejected', args: ['UNKNOWN', 'LIVE'], expected: false },
    ],
  },
  {
    id: 'readiness',
    title: 'Commit only a verified target',
    prompt:
      'In this recommended readiness model, return true only when downloadComplete, reconstructed, hashMatches, finalCopyVerified, and compatible are all exactly true. A successful patch operation alone is insufficient. This is an invariant exercise, not an SDK API.',
    signature: 'mayStage(result)',
    starter:
      'function mayStage(result) {\n  // Check each prerequisite before making a target launchable.\n  return false;\n}',
    solution:
      'function mayStage(result) {\n  return ["downloadComplete", "reconstructed", "hashMatches",\n    "finalCopyVerified", "compatible"].every(key => result[key] === true);\n}',
    tests: [
      {
        name: 'All prerequisites hold',
        args: [
          {
            downloadComplete: true,
            reconstructed: true,
            hashMatches: true,
            finalCopyVerified: true,
            compatible: true,
          },
        ],
        expected: true,
      },
      ...[
        'downloadComplete',
        'reconstructed',
        'hashMatches',
        'finalCopyVerified',
        'compatible',
      ].map((key) => ({
        name: `Reject missing ${key}`,
        args: [
          {
            downloadComplete: true,
            reconstructed: true,
            hashMatches: true,
            finalCopyVerified: true,
            compatible: true,
            [key]: false,
          },
        ],
        expected: false,
      })),
      { name: 'Missing fields are not success', args: [{}], expected: false },
    ],
  },
];
