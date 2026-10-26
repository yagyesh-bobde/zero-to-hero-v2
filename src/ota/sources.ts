const sdk =
  'https://github.com/zepto-labs/react-native-delta/blob/d17e6bd249d21380cfd8aac999311bee8fa843fc/';
const server =
  'https://github.com/zepto-labs/delta-server/blob/3d110006c693de70009e745462d8b2ae52d04009/';
const cli =
  'https://github.com/zepto-labs/delta-cli/blob/1ae2a1b17ea745dda064e0cd36fa805cd8b45403/';
export const sources = [
  {
    id: 'article',
    title: 'Why Zepto built its own CodePush platform',
    kind: 'Context',
    url: 'https://blog.zepto.com/why-we-built-our-very-own-in-house-react-native-codepush-platform-db0c195e4603',
    detail:
      'The article you shared. Its host restricted retrieval during research, so this course does not attribute unverified quotes, adoption figures, or benchmarks to it.',
  },
  {
    id: 'sdk',
    title: 'Delta SDK · integration & public API',
    kind: 'SDK',
    url: sdk + 'README.md',
    detail: 'Native setup, build hooks, manifest fields, JS version rules, and lifecycle events.',
  },
  {
    id: 'bridge',
    title: 'The JavaScript → native bridge',
    kind: 'SDK',
    url: sdk + 'src/index.ts',
    detail: 'checkUpdate, getManifestData, updateUserType, and the missing-native-module error.',
  },
  {
    id: 'android',
    title: 'Android · update manager',
    kind: 'Native',
    url: sdk + 'android/src/main/java/com/delta/DeltaUpdateManager.kt',
    detail:
      'Bundle path selection, temporary manifests, patch/full download paths, and rollback handling.',
  },
  {
    id: 'android-utils',
    title: 'Android · patch, hash & bucket implementation',
    kind: 'Native',
    url: sdk + 'android/src/main/java/com/delta/DeltaUtils.kt',
    detail:
      'bspatch application, reconstructed bundle MD5, full fallback, bucket generation, and installed state.',
  },
  {
    id: 'ios',
    title: 'iOS · update manager',
    kind: 'Native',
    url: sdk + 'ios/DeltaUpdateManager.swift',
    detail: 'Swift bundle selection, downloads, readiness state, and embedded fallback.',
  },
  {
    id: 'crash',
    title: 'Android · scoped crash recovery',
    kind: 'Native',
    url: sdk + 'android/src/main/java/com/delta/GlobalUncaughtExceptionHandler.kt',
    detail:
      'Recovery for recognized RN/Hermes CppException messages; preserves the previous fatal handler.',
  },
  {
    id: 'cli',
    title: 'Delta CLI · release commands',
    kind: 'Publishing',
    url: cli + 'README.md',
    detail:
      'Actual createBundleRelease, createRegistry, updateRelease, and AWS credential requirements.',
  },
  {
    id: 'cli-build',
    title: 'CLI · bundle & patch generation',
    kind: 'Publishing',
    url: cli + 'src/utils/BundleManager.ts',
    detail:
      'Hermes compilation, bsdiff.diffSync, full bundle hash, asset copying, and patch ZIP creation.',
  },
  {
    id: 'server',
    title: 'Server · check_update handler',
    kind: 'Backend',
    url: server + 'src/api/checkUpdate/app.ts',
    detail:
      'Exact eligibility predicates, internal users, rollback priority, and unsupported mandatory updates.',
  },
  {
    id: 'helpers',
    title: 'Server · version keys & patch lookup',
    kind: 'Backend',
    url: server + 'src/utils/helpers.ts',
    detail: 'JJJJ-PP release keys, patch-TARGET-BASE keys, CDN URLs, and invalidation helpers.',
  },
  {
    id: 'states',
    title: 'Server · release state transitions',
    kind: 'Backend',
    url: server + 'src/data/model.ts',
    detail: 'Authoritative transition map, including HALTED and terminal DELETED.',
  },
  {
    id: 'server-guide',
    title: 'Server · deployment & data model',
    kind: 'Backend',
    url: server + 'README.md',
    detail: 'AWS SAM setup, two-pass CloudFront deployment, IAM, DynamoDB, and local development.',
  },
  {
    id: 'cache',
    title: 'Infrastructure · CDN cache behavior',
    kind: 'Infrastructure',
    url: server + 'template.yaml',
    detail: 'Private S3 origin access control, API cache keys, and TTL configuration.',
  },
  {
    id: 'wrapper',
    title: 'Server · HTTP response envelope',
    kind: 'Backend',
    url: server + 'src/utils/handlerWrapper.ts',
    detail: 'Successful HTTP responses wrap handler output in a data object; errors use error.',
  },
  {
    id: 'apple',
    title: 'Apple · App Review Guidelines',
    kind: 'Platform policy',
    url: 'https://developer.apple.com/app-store/review/guidelines/#software-requirements',
    detail:
      'Check the current rules, including 2.5.2. OTA does not grant an exemption from store policy.',
  },
  {
    id: 'google',
    title: 'Google Play · Device and Network Abuse',
    kind: 'Platform policy',
    url: 'https://support.google.com/googleplay/android-developer/answer/9888379',
    detail:
      'Review the current rules on executable code, interpreted code, and changes to app behavior.',
  },
];
export const sourceById = (id: string) => sources.find((s) => s.id === id)!;
export const snapshots = [
  { repo: 'react-native-delta', sha: 'd17e6bd249d21380cfd8aac999311bee8fa843fc' },
  { repo: 'delta-cli', sha: '1ae2a1b17ea745dda064e0cd36fa805cd8b45403' },
  { repo: 'delta-server', sha: '3d110006c693de70009e745462d8b2ae52d04009' },
];
