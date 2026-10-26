import type { Chapter, Question } from './types';
const q = (prompt: string, options: string[], answer: number, explanation: string): Question => ({
  prompt,
  options,
  answer,
  explanation,
});
export const chapters: Chapter[] = [
  {
    id: 'foundations',
    title: 'What actually updates',
    description: 'Build the mental model before touching the tools.',
    lessons: [
      {
        id: 'two-parts',
        title: 'One app, two kinds of code',
        description: 'The native shell, the JavaScript bundle, and the seam between them.',
        minutes: 9,
        lab: 'boundary',
        sources: ['sdk', 'bridge'],
        sections: [
          {
            title: 'Think of a theatre and its script',
            body: [
              'A React Native app is an installed native program that also runs a JavaScript program. The native program supplies the stage: the React Native runtime, a JavaScript engine, platform views, native modules, permissions, and compiled libraries. The JavaScript bundle supplies much of the script: React components, business logic, navigation, and styles.',
              'An OTA (over-the-air) update delivers a new compatible JavaScript program and supported assets over the network. The native program already on the phone knows how to find, validate, and load it. You are updating a part of an installed app; you are not remotely replacing its APK, AAB, or IPA.',
            ],
          },
          {
            title: 'What is in a release bundle?',
            body: [
              'Metro resolves imports and turns your JS/TS source tree into a production bundle. In a Hermes-enabled release pipeline, that bundle can then be compiled into Hermes bytecode. A bytecode file is still tied to the engine/runtime built into the app.',
              'Images and other supported resources may travel with the update. Native modules remain in the store binary. If new JS asks for a native capability the installed binary does not contain, downloading that JS cannot manufacture the missing capability.',
            ],
            code: {
              label: 'A useful model',
              value:
                'Installed app = native runtime + embedded baseline bundle\nOTA release   = compatible JS / Hermes bundle + supported assets\nNext launch   = native loader chooses which bundle to execute',
            },
          },
          {
            title: 'Why the updater has to start below JavaScript',
            body: [
              'An updater implemented only inside your React tree cannot choose the bundle before that tree exists. Delta exposes a small JavaScript API, but its Android and iOS loaders do the file selection and patch work in native code. The embedded bundle is available even when there is no network or downloadable update.',
            ],
            callout:
              'A release bundle is data until the native runtime chooses to execute it. Downloaded does not mean running.',
          },
        ],
        takeaway: 'OTA changes a compatible program inside an already installed native app.',
        questions: [
          q(
            'Where does a new native camera module have to come from?',
            [
              'A binary patch to JavaScript',
              'A new store binary containing the module',
              'A rollout percentage change',
              'A new CDN URL',
            ],
            1,
            'The installed native binary must contain the module. JS can call an existing module, but cannot add compiled native code.',
          ),
          q(
            'Why does Delta include native code?',
            [
              'To replace React with Swift',
              'To make every update mandatory',
              'To select and reconstruct bundles before React starts',
              'To remove the embedded bundle',
            ],
            2,
            'Bundle selection happens before the downloaded React code can run.',
          ),
        ],
      },
      {
        id: 'ota-boundary',
        title: 'Can this change ship OTA?',
        description: 'Draw the line between a JS fix and a new native release.',
        minutes: 8,
        lab: 'boundary',
        sources: ['sdk', 'apple', 'google'],
        sections: [
          {
            title: 'Ask what changed in the installed contract',
            body: [
              'Changing a checkout calculation in JavaScript is a typical OTA candidate. Rewording a label or adjusting a React component style is another. Updating an image can work if the updater packages it and the app resolves it correctly.',
              'Adding a native dependency, changing Info.plist or AndroidManifest.xml, adding a permission, changing entitlements, or upgrading React Native or Hermes changes the installed contract. That requires a native build distributed through the appropriate store or testing channel.',
            ],
          },
          {
            title: 'A package name does not tell you enough',
            body: [
              'An npm dependency can be entirely JavaScript, partly native, or a wrapper around platform code. Inspect what the change requires. Even a pure-JS change can be incompatible if it starts calling a native API absent from older installed versions.',
              'A feature flag is useful when it enables code and native support that are already present. It is not a way to add a missing native library. Test against the oldest binary that will receive the release, rather than assuming the latest development build represents every device.',
            ],
          },
          {
            title: 'Technical ability and platform rules both matter',
            body: [
              'OTA is a distribution mechanism, not blanket permission to change app behavior without review. Apple and Google publish rules about downloaded code and changes to app functionality. Check the current rules for your platform and use case; this course explains engineering behavior, not a guaranteed policy exemption.',
            ],
            callout:
              'First establish native compatibility. Then establish that the intended change is permitted by the platform rules.',
          },
        ],
        takeaway:
          'If the change needs a new native capability or native configuration, plan a store release.',
        questions: [
          q(
            'A JS-only library now calls a native method missing in older binaries. Is the OTA safe for them?',
            [
              'Yes, because the package is JavaScript',
              'Only if the patch is small',
              'No; the native API contract is incompatible',
              'Yes, if the rollout reaches 100%',
            ],
            2,
            'Compatibility depends on APIs and runtime behavior, not just the language of the changed file.',
          ),
          q(
            'Which is normally an OTA candidate, assuming compatible APIs and platform policy?',
            [
              'Adding an Android permission',
              'Changing an existing React label',
              'Updating Hermes',
              'Adding an iOS entitlement',
            ],
            1,
            'A label is JS-rendered content. The other changes modify the installed native binary or configuration.',
          ),
        ],
      },
      {
        id: 'update-lifecycle',
        title: 'From a commit to a new screen',
        description: 'Separate publishing, downloading, installing, and activating.',
        minutes: 10,
        lab: 'lifecycle',
        sources: ['cli-build', 'android', 'ios'],
        sections: [
          {
            title: 'Two timelines are running',
            body: [
              'The publisher builds a target bundle, prepares artifacts, uploads them, and changes release metadata to make them eligible. The device independently launches, checks for an eligible release, downloads an artifact, verifies it, and chooses a bundle for a later runtime start.',
              'A release marked LIVE does not magically appear on every phone. A device might be offline, outside the rollout, running an incompatible binary, or still using a process that started before the download. Publishing success and adoption are different measurements.',
            ],
          },
          {
            title: 'Staging files is different from switching execution',
            body: [
              'The currently running JavaScript engine already has a program loaded. Writing a different bundle to disk does not replace that program in memory. In the Delta paths we inspect, a validated bundle becomes READY_TO_INSTALL. The native getJSBundlePath hook selects it when a React Native runtime is started again.',
              'A normal navigation action, foreground event, or React re-render is not necessarily a new runtime start. In these lessons, “next launch” means the native bundle-loading path runs again. We do not invent an immediate-reload API that this SDK does not export.',
            ],
            code: {
              label: 'Three distinct observations',
              value:
                'Server: release is LIVE\nDisk:   target bundle is READY_TO_INSTALL\nEngine: old bundle keeps running until a new runtime starts',
            },
          },
          {
            title: 'Design for interrupted work',
            body: [
              'The process can be killed during a download, while unzipping, or before metadata is committed. Keep incomplete work separate from the bundle you can already launch. Delta stores temporary update state to distinguish an in-progress operation from a bundle ready for loading.',
            ],
            callout:
              'A successful HTTP download is one step in the lifecycle. It is not proof that the target rendered successfully.',
          },
        ],
        takeaway:
          'Publish → select → download → reconstruct → verify → stage → load on a later runtime start.',
        questions: [
          q(
            'An update is fully downloaded while checkout is open. What does that prove?',
            [
              'The checkout now runs the new code',
              'The new code passed all business checks',
              'The artifact reached the phone; activation is a separate step',
              'All users have adopted the release',
            ],
            2,
            'A running engine does not switch programs just because a file changed on disk.',
          ),
          q(
            'Why track temporary update state?',
            [
              'To distinguish incomplete work from a launchable bundle',
              'To eliminate integrity checks',
              'To force a store update',
              'To keep the network online',
            ],
            0,
            'Downloads and reconstruction can be interrupted; the last usable launch path must remain distinguishable.',
          ),
        ],
      },
      {
        id: 'versions',
        title: 'The three versions you must separate',
        description: 'appVersion, jsVersion, and bundleVersion each answer a different question.',
        minutes: 11,
        lab: 'rollout',
        challenge: 'compatible',
        sources: ['sdk', 'server', 'helpers'],
        sections: [
          {
            title: 'Name the dimensions',
            body: [
              'appVersion is the native app version, such as 2.4.0. In Delta, jsVersion identifies the native bundle compatibility line; despite its name, it is not your JavaScript language version. The SDK documentation requires a unique jsVersion for each native app version. bundleVersion is the OTA revision within that line.',
              'For example, appVersion 2.4.0 can ship with jsVersion 101 and embedded bundleVersion 0. OTA fixes become 101/1, 101/2, and so on. A new native app version 2.5.0 uses a new jsVersion, such as 102, and a new baseline. Never send a 102 bundle to a phone whose native contract is 101.',
            ],
          },
          {
            title: 'The server gate and the device guard differ',
            body: [
              'The public check_update endpoint takes appId, jsVersion, bundleVersion, bucket, and iu. It queries the app and JS compatibility line; it does not receive appVersion as a query parameter. The native loader also compares the cached manifest appVersion with the currently installed app version.',
              'Platform matters too. Delta documents separate registry app IDs for Android and iOS. Do not reuse one app ID across both and hope the server infers the platform.',
            ],
            code: {
              label: 'Example baseline manifest · illustrative values',
              value:
                '{\n  "appId": "shop-android",\n  "appVersion": "2.4.0",\n  "jsVersion": 101,\n  "bundleVersion": 0,\n  "hash": "md5-of-the-embedded-bundle"\n}',
            },
          },
          {
            title: 'Compatibility is an invariant, not a guess',
            body: [
              'A matching version label does not make an incompatible build safe. The publisher has to use the native contract, platform, engine version, and build pipeline associated with that line. A hash proves byte equality with the expected artifact; it does not prove the artifact calls the right native APIs.',
            ],
            callout:
              'Keep jsVersion fixed for compatible OTAs. Increment it for each new native app version, as Delta’s documentation specifies.',
          },
        ],
        takeaway:
          'appVersion names the installed app; jsVersion names its compatibility line; bundleVersion names an OTA revision.',
        questions: [
          q(
            'A native app with jsVersion 101 sees a release with jsVersion 102. What should happen?',
            [
              'Use it if bundleVersion is larger',
              'Do not offer that incompatible line',
              'Download it and check the UI later',
              'Ignore jsVersion for internal users',
            ],
            1,
            'Internal-user targeting does not remove the app and compatibility-line query.',
          ),
          q(
            'Within one compatible native release, which field advances for OTA fixes?',
            ['Hermes bytecode version', 'appVersion', 'bundleVersion', 'iOS deployment target'],
            2,
            'bundleVersion advances while jsVersion stays fixed for that compatibility line.',
          ),
        ],
      },
    ],
  },
  {
    id: 'patches',
    title: 'The difference is the download',
    description: 'Understand bundles, binary patches, assets, and exact reconstruction.',
    lessons: [
      {
        id: 'bundle-build',
        title: 'How source becomes a release artifact',
        description: 'Follow Metro, Hermes, ZIP packaging, and source maps.',
        minutes: 10,
        lab: 'architecture',
        sources: ['cli-build', 'cli'],
        sections: [
          {
            title: 'Start with a reproducible build',
            body: [
              'You edit TypeScript or JavaScript. Metro produces a platform-specific production JavaScript bundle and resolves assets. In Delta’s CLI, the Hermes toolchain compiles the program into bytecode, and source maps are composed so production failures can be related back to source.',
              'The target artifact is the complete program the device must eventually execute. Delta patching optimizes how that target is transported; it does not mean the device executes only your changed source lines. Keep build flags, dependencies, platform, and engine aligned with the native compatibility line.',
            ],
          },
          {
            title: 'Create the complete target before creating a difference',
            body: [
              'The CLI hashes the complete main bundle and packages the full bundle and assets. It also obtains previous bundle artifacts and generates patches against them. The full artifact remains useful for a fresh baseline, missing patch edge, or reconstruction fallback.',
              'Retain source maps associated with the exact target bundle. A symbolicated crash must use the map for the executed bundleVersion, not merely the store app version. Two devices with the same appVersion can run different OTA revisions.',
            ],
            code: {
              label: 'Publishing pipeline',
              value:
                'source → Metro → Hermes bytecode → target bundle\n                                  ├─ full ZIP\nprevious bundle + target bundle ──┴─ binary patch ZIP\nexact target bundle ───────────────── MD5 + source maps',
            },
          },
          {
            title: 'A small source edit is not a size guarantee',
            body: [
              'Compiler layout, minification, module ordering, dependencies, and asset changes can move many bytes. A one-line edit may produce a large binary difference. Measure the uploaded compressed patch ZIP and the full ZIP on real builds. This module deliberately provides no invented Zepto percentage savings.',
            ],
          },
        ],
        takeaway:
          'Build the complete target first. A patch is a transport artifact derived from that target and a particular base.',
        questions: [
          q(
            'What does the phone execute after applying a binary patch?',
            [
              'The patch instructions as React code',
              'A reconstructed complete target bundle',
              'The git diff',
              'Only the edited component',
            ],
            1,
            'bspatch reconstructs the target program; the runtime then loads that program.',
          ),
          q(
            'Which source map should be used for an OTA crash?',
            [
              'Always the latest map in main',
              'The map for the store binary alone',
              'The map matching the executed target bundle',
              'Any map from the same platform',
            ],
            2,
            'The map must describe the exact bundle whose stack you are decoding.',
          ),
        ],
      },
      {
        id: 'binary-patch',
        title: 'A patch is a recipe, not a smaller app',
        description: 'Reconstruct a target from a base and see why the base matters.',
        minutes: 12,
        lab: 'patch',
        challenge: 'patch',
        sources: ['cli-build', 'android-utils'],
        sections: [
          {
            title: 'The invariant is exact reconstruction',
            body: [
              'Let A be the old bundle and B the target. A binary differ computes P = diff(A, B). The phone computes B′ = patch(A, P), then checks that B′ matches the expected B. The point is to reuse bytes already on disk instead of transmitting all target bytes again.',
              'Delta’s CLI calls bsdiff.diffSync. Native code applies the patch with bspatch. This is a binary algorithm, so the input may be Hermes bytecode rather than human-readable JavaScript. It is not a git diff, a JSON merge, or a component-level hot reload.',
            ],
          },
          {
            title: 'Use COPY and ADD to see the idea',
            body: [
              'The lab below uses an original teaching format: COPY a range from the old text and ADD a new piece of text. It is intentionally simpler than bsdiff, whose control, difference, and extra data work at the byte level. Editing either side shows an actual reconstruction, not a canned animation.',
              'The transferred size includes the recipe’s metadata and encoding. On tiny examples the JSON recipe can be larger than the target. Reused characters alone are not network savings. Real Delta transfer includes compressed binary patch data and packaged assets.',
            ],
            code: {
              label: 'Teaching example · not bsdiff wire format',
              value:
                'A: "Hello, Alex!"\nB: "Hello, Maya!"\nP: COPY(0, 7), ADD("Maya"), COPY(11, 1)\napply(A, P) === B',
            },
          },
          {
            title: 'A recipe belongs to a specific base',
            body: [
              'A patch generated from revision 1 to revision 4 expects the exact bytes of revision 1. Applying it to revision 2 can fail or reconstruct the wrong result. Delta identifies a base-specific patch in release metadata and validates the reconstructed target hash. If reconstruction fails, the inspected Android code can fall back to downloading the full target.',
            ],
            callout:
              'Never activate an unverified reconstruction, even if the patch application function returned success.',
          },
        ],
        takeaway:
          'The desired outcome is exact target bytes. Fewer transferred bytes are an optimization around that invariant.',
        questions: [
          q(
            'Why must a patch be tied to a base bundle?',
            [
              'The base supplies bytes the patch expects to reuse',
              'Every patch contains the whole app',
              'The CDN needs a random identifier',
              'React compares the source lines',
            ],
            0,
            'A delta is computed relative to specific input bytes. Another base can produce a different output.',
          ),
          q(
            'The lab’s JSON patch is larger than the target. Is that a bug?',
            [
              'Yes, all patches must be smaller',
              'No; metadata overhead can dominate a tiny example',
              'Yes, it means bsdiff is broken',
              'No, because JSON bytes do not count',
            ],
            1,
            'The teaching encoding has overhead. Real savings must compare actual compressed artifacts, including assets.',
          ),
        ],
      },
      {
        id: 'patch-graph',
        title: 'What if a user skips three updates?',
        description: 'Base-to-target edges, missing patches, and full bundle fallback.',
        minutes: 10,
        lab: 'rollout',
        sources: ['helpers', 'cli-build', 'server'],
        sections: [
          {
            title: 'Model revisions as a graph',
            body: [
              'Each complete bundle is a node. A generated patch from one exact base to a target is a directed edge. A device on bundle 1 can go straight to bundle 4 when the release contains a 1→4 patch. It does not inherently need to install 2 and 3 first.',
              'Producing patches from many historical bases increases build time, artifact count, and storage. Producing very few patches increases full-download fallbacks. The public CLI generates patches for the previous bundles it fetches; do not assume every imaginable edge is available.',
            ],
          },
          {
            title: 'Read the key in the correct direction',
            body: [
              'The server helper builds patch keys as patch-TARGET-BASE. For target 4 and current device bundle 1, the key is patch-04-01. The target release’s Patches map stores that edge. getPatchUrl checks the exact key for the requesting device’s current bundleVersion.',
              'If no edge exists, patchUrl is null while bundleUrl can still point to the complete target. The SDK can then take the full-bundle path. Missing a patch should affect efficiency, not make the target intrinsically uninstallable.',
            ],
            code: {
              label: 'Target release 4 · illustrative record fragment',
              value:
                '{\n  "BundleVersion": 4,\n  "Patches": {\n    "patch-04-00": { "url": ".../from-baseline.zip" },\n    "patch-04-01": { "url": ".../from-one.zip" }\n  }\n}\n// Device at 2: no patch-04-02 → full bundle URL',
            },
          },
          {
            title: 'Retain what your population still needs',
            body: [
              'Offline users may return weeks later. Retain the embedded baseline, supported full targets, required patch bases, and release metadata according to your support policy. Deleting a file from S3 is not the same as moving a release to DELETED; release state is what the check endpoint evaluates.',
            ],
          },
        ],
        takeaway:
          'A direct patch edge lets a user skip intermediate revisions. A full target is the safety path when that edge is absent.',
        questions: [
          q(
            'Which patch key serves a device at 2 moving to target 5?',
            ['patch-02-05', 'patch-05-02', 'patch-05-00', 'patch-02-02'],
            1,
            'The helper encodes target first, then current base.',
          ),
          q(
            'If patchUrl is null but bundleUrl exists, what can the device do?',
            [
              'Install every previous revision manually',
              'Execute the response JSON',
              'Download the full target',
              'Bypass the compatibility check',
            ],
            2,
            'The full bundle path does not require a base-to-target patch edge.',
          ),
        ],
      },
      {
        id: 'integrity-assets',
        title: 'The bytes, the assets, and the hash',
        description: 'Understand exactly what is verified and what the patch ZIP carries.',
        minutes: 11,
        lab: 'patch',
        sources: ['cli-build', 'android-utils'],
        sections: [
          {
            title: 'Hash the reconstructed program',
            body: [
              'The CLI computes the MD5 of the complete main bundle. After applying a patch, the Android implementation computes the MD5 of the reconstructed bundle and compares it with the release hash. It also verifies the final copied bundle before committing ready state.',
              'A hash of the downloaded patch alone would answer a different question: “Did I get these patch bytes?” The runtime needs to know “Did this base plus this patch produce the expected target?” A wrong base can pass a patch-file checksum and still reconstruct the wrong program.',
            ],
          },
          {
            title: 'Assets are part of delivery costs',
            body: [
              'In the inspected CLI, patch packaging copies files from the target bundle directory except the main bundle file into the patch directory. Those assets are then zipped with the binary patch. Do not describe this implementation as diffing each image or sending only changed asset bytes.',
              'The target bundle MD5 does not by itself authenticate or individually verify every asset in the ZIP. An image-heavy release can have a small code patch and a large download. Test asset resolution in release builds on both platforms, including a device that skips revisions.',
            ],
          },
          {
            title: 'Integrity is not publisher authenticity',
            body: [
              'A checksum comparison can catch accidental corruption or a bad reconstruction. MD5 is not a modern authenticity mechanism. Even a strong hash does not authenticate a publisher if an attacker can replace both the artifact and the expected hash.',
              'A hardened design uses a trusted signed manifest or artifact, verifies it with a key already trusted by the binary, protects the publishing path, and defines replay and rollback rules. Those are design recommendations; this course does not claim the inspected Delta SDK supplies signed-update verification.',
            ],
            callout:
              'Verified MD5 means “matches the expected bundle bytes,” not “safe business logic” or “authorized publisher.”',
          },
        ],
        takeaway:
          'Verify the reconstructed target, account for assets, and keep integrity separate from authenticity.',
        questions: [
          q(
            'What does the Delta release hash describe in this flow?',
            [
              'Only the compressed patch',
              'The complete main target bundle',
              'The entire App Store binary',
              'Every user’s local database',
            ],
            1,
            'The CLI hashes the main bundle; the native patch path compares the reconstructed main bundle to it.',
          ),
          q(
            'An attacker replaces both bundle and expected hash. What is missing?',
            [
              'A higher rollout percentage',
              'An additional re-render',
              'An independently trusted authenticity check',
              'A smaller ZIP',
            ],
            2,
            'A signed artifact or manifest verified against a trusted key protects authenticity; a replaceable hash alone does not.',
          ),
        ],
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Inside Zepto’s Delta',
    description: 'Connect the CLI, AWS control plane, CDN, and native SDK.',
    lessons: [
      {
        id: 'why-delta',
        title: 'Why build an OTA platform?',
        description: 'Understand the engineering tradeoff behind owning the delivery system.',
        minutes: 9,
        lab: 'architecture',
        sources: ['article', 'sdk', 'cli-build', 'server-guide'],
        sections: [
          {
            title: 'The problem is bigger than a file download',
            body: [
              'An OTA system has to answer four questions: Which devices may use this program? How do we move it efficiently? When can it become active? How do we recover if it is wrong? A download URL answers only part of the second question.',
              'The linked Zepto article frames an in-house CodePush platform. The public Delta repositories let us inspect the design directly: a React Native SDK, a publishing CLI, and an AWS server. The article host restricted retrieval during this research, so the technical explanations here follow the pinned code instead of inventing quotes or performance numbers.',
            ],
          },
          {
            title: 'The concrete design choice: binary delta transport',
            body: [
              'Delta puts binary patch generation in the publishing tool and native patch application on the phone. The server tracks releases and selects an eligible target plus an appropriate patch URL. This moves expensive differencing away from each device and avoids regenerating the same patch for every check request.',
              'The design is useful when many devices already have most bytes of the next program. It trades additional build artifacts and native complexity for potentially smaller transfers. Some releases still need full downloads, and supported assets add to the payload.',
            ],
          },
          {
            title: 'Ownership brings ongoing work',
            body: [
              'Operating your own platform means owning IAM, publication permissions, artifact retention, cache invalidation, compatibility discipline, native integration, observability, and incident response. Evaluate those costs alongside download size and control over infrastructure.',
              'Some OTA systems also optimize asset or bundle delivery; binary differences are not a license to claim every other product always downloads everything. Compare actual artifacts and operational requirements for your app.',
            ],
            callout:
              'Delta is best understood as three cooperating codebases and a delivery protocol, not a single React hook.',
          },
        ],
        takeaway:
          'The platform owns eligibility, transport, activation, and recovery. Binary patching is one important part of that system.',
        questions: [
          q(
            'Where does the inspected Delta implementation generate binary patches?',
            [
              'On each phone',
              'Inside React render',
              'In the publishing CLI',
              'Inside every check_update request',
            ],
            2,
            'BundleManager in delta-cli calls bsdiff during publishing.',
          ),
          q(
            'What must a self-hosted OTA team still own?',
            [
              'Only a public download URL',
              'IAM, compatibility, operations, monitoring, and recovery',
              'Nothing after the first deploy',
              'Only frontend styling',
            ],
            1,
            'A reliable release system includes both control-plane operations and device behavior.',
          ),
        ],
      },
      {
        id: 'publisher',
        title: 'The publisher’s side of the wire',
        description: 'Follow a build from your machine to S3 and release metadata.',
        minutes: 11,
        lab: 'architecture',
        sources: ['cli', 'cli-build', 'server-guide'],
        sections: [
          {
            title: 'Give each platform an identity',
            body: [
              'Create a registry entry per platform using the CLI. A registry records an app identity; a release records one versioned program for that identity. Configure the native app’s ID and server URL so devices query the matching registry and compatibility line.',
              'The CLI uses AWS credentials on the publishing machine or CI runner. It uploads artifacts to S3 and directly invokes management Lambda functions. The mobile SDK uses the public check endpoint and download URLs; it does not need a publishing IAM key embedded in the app.',
            ],
            code: {
              label: 'Registry + a staged OTA · configured development environment required',
              value:
                'npx delta-cli createRegistry --appId shop-android \\\n  --platform android --appName "Learning Shop"\n\nnpx delta-cli createBundleRelease \\\n  --platform android --entryFile index.js --pushToStaging',
            },
          },
          {
            title: 'Upload artifacts before advertising them',
            body: [
              'A safe publication sequence makes the artifacts retrievable before making the metadata eligible for users. The target needs its full bundle, supported base-specific patches, target hash, and compatibility metadata. A LIVE record pointing to a missing ZIP is a release failure.',
              'Delta separates created/staged releases from live rollout. Test the staged release on internal release builds before changing its state. Debug mode loading from Metro is not a valid end-to-end test of native downloaded bundle selection.',
            ],
          },
          {
            title: 'Distinguish the control plane and the data plane',
            body: [
              'The control plane changes registry and release state through management functions. The data plane serves check responses and artifact downloads to devices. Separating permissions helps prevent a device-facing endpoint from becoming a general release-administration API.',
              'The generated delta.config.json contains resource names and locations for the CLI. It is configuration, not an AWS credential. Keep credential material out of the app and restrict the publishing role to the required resources.',
            ],
          },
        ],
        takeaway:
          'CI prepares and uploads artifacts, then release metadata controls who can discover them.',
        questions: [
          q(
            'Should a mobile client contain the publisher’s AWS credentials?',
            [
              'Yes, for faster S3 uploads',
              'No; it uses the check API and artifact URLs',
              'Only on iOS',
              'Only during a 10% rollout',
            ],
            1,
            'Management privileges belong on trusted publishing infrastructure.',
          ),
          q(
            'Why test a release build rather than only Metro debug mode?',
            [
              'Debug mode has no React components',
              'Release mode uses the native packaged/downloaded bundle path',
              'Metro always validates production patches',
              'Release builds skip native code',
            ],
            1,
            'You need to exercise the same bundle-loading mechanism that installed users use.',
          ),
        ],
      },
      {
        id: 'server-selection',
        title: 'Read the actual update decision',
        description: 'App identity, compatibility, rollback priority, and release eligibility.',
        minutes: 14,
        lab: 'rollout',
        challenge: 'selection',
        sources: ['server', 'helpers', 'wrapper'],
        sections: [
          {
            title: 'A check is a question about one device',
            body: [
              'The device sends appId, jsVersion, bundleVersion, a rollout bucket, and iu for internal-user status. The server queries the app and compatibility-line prefix in DynamoDB. For a regular user it includes newer LIVE releases where Rollout ≥ bucket. For an internal user it includes newer STAGING or LIVE releases and ignores the rollout percentage.',
              'It also looks for the current bundle in DISABLED or DELETED. If that record is present, the response is rollback:true even if a newer eligible release also exists. Otherwise it picks the eligible release with the largest bundleVersion.',
            ],
            code: {
              label: 'HTTP request · use the deployed API base path',
              value:
                'GET /api/v1/check_update?appId=shop-android\n    &jsVersion=101&bundleVersion=1&bucket=30&iu=false\n\n// Some deployments include an API stage prefix, such as /Prod.\n// Configure the SDK base URL accordingly.',
            },
          },
          {
            title: 'A selected target is still base-specific',
            body: [
              'After selecting the target, getPatchUrl searches its patch map for the current device bundle. A direct patch URL can be returned alongside the full bundle URL. If the edge is missing, the full target can still be offered.',
              'The handler returns isMandatory:false with a comment that mandatory behavior is not currently supported. The response wrapper nests successful data under data. Some README examples show the inner object alone; the lab uses the actual HTTP envelope.',
            ],
            code: {
              label: 'Actual envelope · illustrative URLs and hash',
              value:
                '{\n  "data": {\n    "isUpdateAvailable": true,\n    "isMandatory": false,\n    "jsVersion": 101,\n    "bundleVersion": 4,\n    "hash": "example-target-md5",\n    "releaseState": 20,\n    "patchUrl": "https://cdn.example.com/patch-04-01.zip",\n    "bundleUrl": "https://cdn.example.com/bundle.zip"\n  }\n}',
            },
          },
          {
            title: 'Metadata does not imply extra enforcement',
            body: [
              'The release schema contains AppVersion, but the check endpoint does not accept it as a query filter. Platform separation comes from appId and native compatibility discipline comes from jsVersion. Similarly, iu is a request flag, not authentication for sensitive features or access to secret assets.',
            ],
            callout:
              'The playground reproduces the visible selection predicates, not a live call to Zepto’s infrastructure.',
          },
        ],
        takeaway:
          'Same app + same compatibility line → rollback check → newest eligible target → exact base patch or full bundle.',
        questions: [
          q(
            'The current bundle is DISABLED and a newer LIVE bundle exists. What does this handler return?',
            [
              'Always the newer bundle',
              'rollback:true',
              'isMandatory:true',
              'An incompatible JS version',
            ],
            1,
            'The handler checks for the disabled/deleted current record before selecting a new target.',
          ),
          q(
            'What does iu=true change?',
            [
              'It bypasses the compatibility line',
              'It authenticates the user as an administrator',
              'It allows STAGING/LIVE targets and ignores rollout percentage',
              'It makes every release mandatory',
            ],
            2,
            'Internal users still query the same app and JS line. The flag is targeting, not access control.',
          ),
        ],
      },
      {
        id: 'storage-cdn',
        title: 'DynamoDB decides. CloudFront delivers.',
        description: 'Separate release metadata, artifact storage, and cache behavior.',
        minutes: 12,
        lab: 'architecture',
        sources: ['server-guide', 'helpers', 'cache'],
        sections: [
          {
            title: 'One table, two kinds of item',
            body: [
              'Delta stores registry and release items in one DynamoDB table. AppId is the partition key and ReleaseVersion is the sort key. Registry items reserve 0000-00. Release sort keys use JJJJ-PP, such as 0101-04 for JS line 101 and bundle 4.',
              'The server queries begins_with(ReleaseVersion, "0101-") to stay within a compatibility line. Its helper pads and truncates to four and two digits. Treat that as a bounded encoding: going beyond those widths can collide. Do not assume this format supports unlimited version numbers.',
            ],
            code: {
              label: 'Illustrative DynamoDB release item',
              value:
                'AppId:          shop-android\nReleaseVersion: 0101-04\nJsVersion:      101\nBundleVersion:  4\nReleaseState:   20\nRollout:        30\nPatches:        { "patch-04-01": { url: "s3-url" } }',
            },
          },
          {
            title: 'The check and the ZIP take different routes',
            body: [
              'CloudFront routes API requests to API Gateway and the check Lambda, which reads DynamoDB. Artifact requests go to S3 through the CDN. The infrastructure template uses origin access control so S3 can stay private while CloudFront reads it.',
              'Management functions are invoked through the AWS Lambda API with IAM permissions, rather than public API Gateway routes. A production install includes the table, bucket, distribution, public check route, management functions, and the correct generated CLI config.',
            ],
          },
          {
            title: 'A cached decision can delay an emergency',
            body: [
              'The API cache key includes appId, bucket, bundleVersion, iu, jsVersion, and is. Omitting compatibility or targeting fields from a cache key could serve one cohort’s decision to another. The checked-in template sets a seven-day default API TTL, making invalidation especially significant.',
              'Release update operations trigger check-cache invalidation. That invalidation still has propagation time. Halting or disabling is not a synchronous command sent to every running phone: the device must check again, receive current metadata, and reach the relevant native loading path.',
            ],
            callout:
              'Changing a database row does not guarantee an immediate fresh response at every CDN edge.',
          },
        ],
        takeaway:
          'DynamoDB stores decisions, S3 stores artifacts, and CloudFront caches both kinds of delivery with different consequences.',
        questions: [
          q(
            'Which change could accidentally mix decisions for different native runtimes?',
            [
              'Keeping S3 private',
              'Removing jsVersion from the API cache key',
              'Using a full bundle fallback',
              'Retaining source maps',
            ],
            1,
            'The compatibility dimension must participate in cached response identity.',
          ),
          q(
            'Does disabling a release immediately replace code in every running process?',
            [
              'Yes, CloudFront pushes new code',
              'Yes, DynamoDB restarts React',
              'No; devices must observe fresh metadata and reload through the native path',
              'Only on Wi-Fi',
            ],
            2,
            'The update protocol is pull-based, and already-running JS does not change solely because server metadata changed.',
          ),
        ],
      },
    ],
  },
  {
    id: 'native',
    title: 'Follow the update on a phone',
    description: 'See the native integration, disk states, loading, and recovery.',
    lessons: [
      {
        id: 'android-native',
        title: 'Android: before React starts',
        description: 'Connect initialization, Gradle, the manifest, and the bundle hook.',
        minutes: 12,
        lab: 'lifecycle',
        sources: ['sdk', 'android', 'crash'],
        sections: [
          {
            title: 'Installing the npm package is only the beginning',
            body: [
              'The app must include Delta’s native module and rebuild. Configure ANDROID_DELTA_ID and DELTA_SERVER_URL in BuildConfig, configure DELTA_JS_VERSION for the baseline, and apply the Delta Gradle script. The BSPatch Maven repository path lets Gradle resolve the native patch library shipped with the SDK.',
              'The MainApplication implements the delegate and initializes Delta with the application context. The SDK holds a long-lived delegate; using an Activity context would create an avoidable lifecycle problem. The public JS wrapper explicitly rejects a missing native module, including an Expo Go-only setup.',
            ],
          },
          {
            title: 'The bundle path is the decisive hook',
            body: [
              'The release ReactNativeHost delegates getJSBundleFile to Delta.getJSBundlePath(). The manager compares the cache manifest’s appVersion with the installed app version, checks rollback state, and checks whether the referenced bundle file exists. If conditions do not support the downloaded path, it returns the embedded default path.',
              'This snippet shows only the important hooks; adapt the complete host/delegate setup to your app’s RN version and architecture. Keep development Metro behavior appropriate for your project.',
            ],
            code: {
              label: 'Android · key hooks, not a complete MainApplication',
              value:
                'override fun onCreate() {\n    super.onCreate()\n    Delta.initialize(this)\n}\n\n// In your release ReactNativeHost:\noverride fun getJSBundleFile(): String {\n    return Delta.getJSBundlePath()\n}',
            },
          },
          {
            title: 'Generate and upload the baseline intentionally',
            body: [
              'The documented Gradle integration is gated by -PdeltaBuild=true. It generates manifest.json after bundling, and hooks the native artifact tasks to upload the baseline via the CLI. Without that flag the script is a no-op.',
              'A baseline is the exact bundle that shipped inside the native app. If the server builds a patch from a different “equivalent” source build, those bytes can differ. Preserve the actual baseline and check it against the native release.',
            ],
            code: {
              label: 'Documented release build flag',
              value:
                './gradlew assembleRelease -PdeltaBuild=true\n# Or: ./gradlew bundleRelease -PdeltaBuild=true',
            },
          },
        ],
        takeaway:
          'The Android host must let Delta choose the release bundle, and the uploaded baseline must match the shipped bytes.',
        questions: [
          q(
            'Why can installing the JS package alone be insufficient?',
            [
              'Native initialization and bundle-loader integration must be built into the binary',
              'JavaScript cannot call any native APIs',
              'The CLI replaces MainApplication remotely',
              'The app must always use Metro in production',
            ],
            0,
            'The binary needs the native module and loader hooks before it can use OTA bundles.',
          ),
          q(
            'What happens to the documented Delta Gradle tasks without deltaBuild=true?',
            [
              'They always publish to LIVE',
              'The script is a no-op',
              'They delete the baseline',
              'They enable mandatory updates',
            ],
            1,
            'The README explicitly gates those build tasks on the flag.',
          ),
        ],
      },
      {
        id: 'ios-native',
        title: 'iOS: choosing the bundle URL',
        description: 'Wire the delegate and preserve the debug/release distinction.',
        minutes: 12,
        lab: 'lifecycle',
        sources: ['sdk', 'ios'],
        sections: [
          {
            title: 'Native configuration establishes trust and compatibility',
            body: [
              'Configure a unique iOS registry ID, DeltaJsVersion, and DeltaServerUrl in Info.plist. Add bspatch-ios with modular headers in the Podfile as documented, and install pods. The app delegate conforms to IDeltaDelegate, initializes Delta, and supplies the bundle URL hook.',
              'Use a distinct iOS app ID from Android. An iOS Hermes bundle and an Android build are not interchangeable release artifacts just because the React source is shared. The native binary and generated program must stay aligned.',
            ],
          },
          {
            title: 'The release path is different from Metro',
            body: [
              'Debug uses the normal development bundle provider. Release returns the Delta-managed URL. In Swift, the update manager checks appVersion, rollback state, and file existence before selecting a downloaded bundle; otherwise it uses the embedded default.',
              'The important idea is the hook, not copying an AppDelegate from another RN template. The README contains older Objective-C-style examples; adapt module imports and app lifecycle integration to the RN/Xcode versions you actually use.',
            ],
            code: {
              label: 'iOS · documented bundle URL hook',
              value:
                '- (NSURL *)bundleURL {\n#if DEBUG\n  return [[RCTBundleURLProvider sharedSettings]\n    jsBundleURLForBundleRoot:@"index"];\n#else\n  return [Delta getJSBundlePath];\n#endif\n}',
            },
          },
          {
            title: 'Build phases produce a baseline',
            body: [
              'The documented scheme pre-action runs update_info_plist.rb for Release. The Archive post-action runs upload_delta_bundle.rb. That means ordinary development Run is not the same operation as a release Archive with baseline upload.',
              'Use the complete setup in the SDK README and inspect the build logs. Confirm the app’s embedded manifest, generated JS compatibility line, uploaded baseline, and server config all describe the same native release. A green Xcode build alone does not prove publication is correct.',
            ],
            callout:
              'A debug screen served from Metro does not demonstrate that a release binary can load a downloaded bundle.',
          },
        ],
        takeaway:
          'iOS needs a native bundle URL hook and an exact release baseline, just as Android does.',
        questions: [
          q(
            'Why keep Metro in the DEBUG branch?',
            [
              'It preserves normal development loading while release uses Delta',
              'Metro authenticates production releases',
              'Delta only works in debug mode',
              'It allows iOS to execute Android binaries',
            ],
            0,
            'Debug and release have different bundle sources; OTA verification needs the release path.',
          ),
          q(
            'When does the documented iOS baseline upload script run?',
            [
              'On every React render',
              'During every debug Run',
              'After Archive via the configured post-action',
              'Only after rollout reaches 100%',
            ],
            2,
            'The README distinguishes the Release pre-action from the Archive upload post-action.',
          ),
        ],
      },
      {
        id: 'disk-to-runtime',
        title: 'Downloaded → ready → loaded',
        description: 'Follow the temporary manifest and the native state machine.',
        minutes: 13,
        lab: 'lifecycle',
        challenge: 'loader',
        sources: ['android', 'android-utils', 'ios', 'bridge'],
        sections: [
          {
            title: 'Observe the files, not just the network',
            body: [
              'The SDK checks the current or embedded manifest and any temporary update manifest. Based on the server response it downloads a patch ZIP or a full bundle ZIP. It unzips, applies a base-specific patch where available, and validates the target.',
              'There are separate states for patch unzipped, patch applied, failures, and READY_TO_INSTALL. The temporary manifest gives interrupted operations context. A file merely existing in a temporary directory is not a reason to choose it as the active bundle.',
            ],
          },
          {
            title: 'The next loader call selects a path',
            body: [
              'Once the target has been validated and committed to the ready path, the current JS process can continue running its old program. On a later runtime start the native getJSBundlePath call returns the chosen on-disk bundle when its appVersion and file conditions are valid.',
              'The inspected code updates READY_TO_INSTALL to INSTALLED around path selection. That is useful lifecycle metadata, but it does not wait for a checkout interaction or prove a healthy render. Treat “installed” as the SDK’s state label, not an application-level success signal.',
            ],
            code: {
              label: 'JS API · actual exported names',
              value:
                'import { checkUpdate, getManifestData }\n  from "@zepto-labs/react-native-delta";\n\ncheckUpdate(); // void: starts native update work\nconst manifest = JSON.parse(await getManifestData());\n// Observe lifecycle events through the native delegate too.\n// No immediate reload API is exported by this JS wrapper.',
            },
          },
          {
            title: 'Choose your user experience deliberately',
            body: [
              'You might check after startup or at a safe lifecycle point. Avoid interpreting every foreground as a process restart. If a product requires a controlled restart, design and verify that flow with the appropriate RN/native mechanism; do not imply checkUpdate forces one.',
              'For a learning experiment, kill and reopen a release build after the update becomes ready, then verify the executed revision through UI behavior and telemetry. Record both the revision running before the check and the revision staged for the next start.',
            ],
          },
        ],
        takeaway:
          'File readiness, native path selection, and successful app behavior are three separate observations.',
        questions: [
          q(
            'Does INSTALLED in the inspected SDK prove the checkout rendered correctly?',
            [
              'Yes, it waits for checkout success',
              'No; it is updated around bundle path selection',
              'Yes, it means every user is healthy',
              'Only for mandatory updates',
            ],
            1,
            'Application-level health needs separate measurements.',
          ),
          q(
            'What is the return type of the JS checkUpdate export?',
            ['Promise<newBundle>', 'boolean', 'void', 'A reload callback'],
            2,
            'The wrapper delegates to native code and returns void; lifecycle observation happens separately.',
          ),
        ],
      },
      {
        id: 'recovery',
        title: 'Recovery has specific limits',
        description: 'Understand full-download fallback, embedded rollback, and crash scope.',
        minutes: 13,
        lab: 'failure',
        sources: ['android-utils', 'android', 'ios', 'crash'],
        sections: [
          {
            title: 'An artifact failure and a bad release are different',
            body: [
              'A patch reconstruction can fail even when the target itself is valid: a base file is missing, the patch is corrupted, or the patching library fails. The inspected Android patch paths can fall back to the full bundle. The full path must still verify its target before becoming ready.',
              'A network failure should leave the current usable program available. If the reconstructed or downloaded target does not match the expected hash, do not activate it. These are transport/reconstruction problems, and they are distinct from a validly delivered bundle containing a business-logic bug.',
            ],
          },
          {
            title: 'Server-directed rollback means embedded fallback here',
            body: [
              'When the current release is DISABLED or DELETED, check_update returns rollback:true. The native SDK marks rollback state. At the bundle-loader path, it returns the embedded default while clearing the downloaded bundle/manifest.',
              'That is not a guarantee of jumping to whichever OTA revision you consider “last known good.” The public paths inspected here explicitly use the embedded baseline. A running bad process also does not instantly become good when you disable its server record.',
            ],
            code: {
              label: 'Three recovery paths',
              value:
                'Patch invalid → try full target → verify → ready\nFull target invalid → reject → keep usable launch path\nCurrent release disabled → ROLL_BACK → embedded baseline',
            },
          },
          {
            title: 'Automatic crash recovery is not universal',
            body: [
              'The Android uncaught exception wrapper only clears Delta state for recognized RN/Hermes CppException messages: examples include bytecode mismatch, truncated buffers, and compilation or packaging errors. It chains to the previous fatal handler so crash reporting still happens.',
              'This is not a generic health acknowledgement protocol for all JS bugs, all crashes, or both platforms. The inspected iOS code has the embedded rollback path, but we do not assume an equivalent universal crash guard. Test recovery on the exact platform and SDK version you ship.',
            ],
            callout:
              'A perfectly hashed release can still be wrong. You need staged testing, app-health telemetry, and an incident plan.',
          },
        ],
        takeaway:
          'Know which failure triggers full download, which triggers embedded rollback, and which still requires operator action.',
        questions: [
          q(
            'What does the inspected rollback loader select?',
            [
              'Always the previous OTA',
              'A random LIVE revision',
              'The embedded baseline bundle',
              'The broken downloaded bundle again',
            ],
            2,
            'The native rollback paths return the default embedded bundle while clearing downloaded state.',
          ),
          q(
            'Does Android’s scoped crash handler recover from every possible app bug?',
            [
              'Yes, across both platforms',
              'No; it recognizes specific RN/Hermes native exception categories',
              'Yes, if the hash matched',
              'No, because it only runs on the server',
            ],
            1,
            'Its checks are specific; a logical failure or unrelated exception may not trigger Delta cleanup.',
          ),
        ],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Ship slowly. Recover deliberately.',
    description: 'Make eligibility, state transitions, and health visible.',
    lessons: [
      {
        id: 'rollout-buckets',
        title: 'Who is in a 30% rollout?',
        description: 'Use deterministic buckets rather than a coin flip on every request.',
        minutes: 11,
        lab: 'rollout',
        sources: ['android-utils', 'server'],
        sections: [
          {
            title: 'A cohort needs an identity',
            body: [
              'If the server flipped a coin on every check, a user outside a rollout could get in simply by checking repeatedly. A deterministic bucket makes membership stable for the inputs used to derive it. The SDK sends that bucket with its check.',
              'In the inspected Android helper, a MurmurHash of device identity uses a seed derived from jsVersion plus bundleVersion, then maps into a percentage range and rounds up into ten-point buckets. Values sent by that helper are 10, 20, …, 100. This is version-seeded stability; membership may change after the current bundle version changes.',
            ],
          },
          {
            title: 'The server does a simple comparison',
            body: [
              'For ordinary users, the predicate is Rollout ≥ bucket with the target in LIVE state and newer than the current bundle. A bucket of 30 qualifies for a rollout of 30. A bucket of 40 does not. The API accepts values from 0 to 100, while the SDK helper uses the rounded bucket scheme.',
              'The playground uses 100 illustrative devices, ten in each bucket. It shows the eligibility rule, not a measurement of the distribution on real Zepto devices. A 30% setting does not prove exactly 30% of active users have downloaded or adopted the release.',
            ],
            code: {
              label: 'Actual ordinary-user predicate, simplified',
              value:
                'sameApp && sameJsLine &&\n  target.bundleVersion > device.bundleVersion &&\n  target.state === "LIVE" &&\n  target.rollout >= device.bucket',
            },
          },
          {
            title: 'Internal targeting changes the rule',
            body: [
              'Internal users can see newer STAGING and LIVE releases regardless of rollout. They still need the same app and JS line. Use an explicit, controlled internal-testing workflow so you know which build and identity are involved.',
              'The source uses a request flag for internal targeting. Treat it as a convenience for staged distribution, not an authentication boundary for private features. Do not publish secrets in a bundle and rely on iu=false to protect them.',
            ],
          },
        ],
        takeaway:
          'Rollout is a device-selection rule. Adoption is what actually happened after selection.',
        questions: [
          q(
            'A regular device has bucket 40 and the LIVE release has rollout 30. Is it eligible?',
            [
              'Yes, any LIVE release is eligible',
              'No; 30 is less than 40',
              'Yes, if it checks often enough',
              'Only when the hash is MD5',
            ],
            1,
            'The server checks Rollout ≥ bucket.',
          ),
          q(
            'Are Android bucket assignments guaranteed to be the same across every current bundle version?',
            [
              'Yes, permanently for the device',
              'No; the hash seed includes version inputs',
              'Only if rollout is 0',
              'The SDK never hashes anything',
            ],
            1,
            'The helper seeds its hash using JS and bundle versions. Do not describe its cohort as permanently fixed.',
          ),
        ],
      },
      {
        id: 'release-states',
        title: 'Halt and disable are different operations',
        description:
          'Read the authoritative state transition map and choose the right incident action.',
        minutes: 10,
        lab: 'rollout',
        challenge: 'states',
        sources: ['states', 'server', 'cli'],
        sections: [
          {
            title: 'Walk through the states',
            body: [
              'CREATED (0) is the initial record. STAGING (10) can be offered to internal users. LIVE (20) is eligible for regular users subject to rollout. HALTED (25) stops that target being selected for new updates and can transition back to LIVE.',
              'DISABLED (30) and DELETED (40) make a current bundle trigger the rollback branch. DELETED is terminal. In the current state transition map, DISABLED can only move to DELETED; it cannot go back to LIVE. Some README text suggests otherwise, so the code is the authority for this snapshot.',
            ],
            code: {
              label: 'Important allowed transitions',
              value:
                'CREATED → STAGING → LIVE → HALTED → LIVE\n                      └→ DISABLED → DELETED\n\nHALTED:  stops new offers; current users remain on it\nDISABLED / DELETED: current users get rollback on check',
            },
          },
          {
            title: 'A pause is not a rollback',
            body: [
              'Suppose a release has reached 30% and a metric becomes suspicious. HALTED stops new devices receiving it, while already-running users remain on that release. If the release is known bad and affected devices should return to the embedded baseline, DISABLED invokes the server rollback path on their next check.',
              'Rollout values can only increase through the update handler. Lowering rollout from 30 to 0 is not the supported way to stop a release. Choose the state operation that corresponds to the intended behavior.',
            ],
          },
          {
            title: 'Keep transition intent explicit',
            body: [
              'Use updateRelease with the exact app ID, JS line, and bundle revision. Confirm invalidation and observe fresh check responses from affected and unaffected cohorts. A command reporting success does not confirm every device has recovered.',
              'Practice these actions in a test environment with a release binary before a production incident. The sandbox below changes only a local model; it never changes a real Delta release.',
            ],
          },
        ],
        takeaway:
          'HALTED pauses new offers. DISABLED requests embedded rollback. The source transition map governs reversibility.',
        questions: [
          q(
            'Which action stops new offers while allowing a later return to LIVE?',
            [
              'DELETED',
              'HALTED',
              'Removing the source map',
              'Lowering rollout through the update handler',
            ],
            1,
            'HALTED is reversible to LIVE and does not trigger rollback for devices already on the revision.',
          ),
          q(
            'According to the pinned transition map, can DISABLED move directly to LIVE?',
            [
              'Yes, always',
              'Only for internal users',
              'No; it can only move to DELETED',
              'Only at rollout 100',
            ],
            2,
            'The current code permits DISABLED → DELETED. This differs from some prose documentation.',
          ),
        ],
      },
      {
        id: 'observability',
        title: 'Measure the release users actually run',
        description: 'Build a useful funnel and connect crashes to exact revisions.',
        minutes: 10,
        lab: 'failure',
        sources: ['sdk', 'android-utils', 'cli-build'],
        sections: [
          {
            title: 'Count the lifecycle in stages',
            body: [
              'Track checks, eligible offers, download starts, download successes, patch apply results, target hash results, ready state, bundle selection, and application health. These counts answer different questions. A patch downloaded successfully but rejected at verification belongs in neither adoption nor success.',
              'Attach app identity/platform, native app version, jsVersion, bundleVersion, SDK version, and artifact type. Track time and bytes for patch and full paths separately. Compare target cohorts with a baseline cohort rather than treating total crash counts as a useful release signal.',
            ],
          },
          {
            title: 'Use the SDK’s native event delegate',
            body: [
              'Delta exposes lifecycle events through onEventOccurred on the native delegate. The README lists download, patch, hash, manifest, installation, and rollback-related events. Wire those events to your analytics system with stable field names and sensible privacy controls.',
              'The JS getManifestData API can help inspect cached metadata, but the current process may still be running an older program while a newer target is staged. Capture executing-bundle identity at launch and keep it distinct from available or staged revision metadata.',
            ],
            code: {
              label: 'Recommended telemetry dimensions · design example',
              value:
                '{\n  "appVersion": "2.4.0",\n  "executingRevision": "101/1",\n  "stagedRevision": "101/4",\n  "phase": "ready",\n  "artifact": "patch",\n  "platform": "android"\n}',
            },
          },
          {
            title: 'Define health in the product',
            body: [
              'The app should report startup completion and relevant key flows, such as opening checkout or completing payment. Correct checksums do not detect a broken price calculation. Installed state does not certify a rendered screen.',
              'Set evidence-based promotion and rollback criteria for your app. The course intentionally does not prescribe a universal crash threshold or claim a particular Zepto production dashboard. Keep target source maps available to explain failures.',
            ],
          },
        ],
        takeaway:
          'Measure the funnel from offer to healthy execution, with the executing OTA revision attached.',
        questions: [
          q(
            'Which best demonstrates healthy adoption?',
            [
              'The upload completed',
              'The server said LIVE',
              'The target was loaded and the app’s health signals passed',
              'A patch ZIP exists in S3',
            ],
            2,
            'Delivery and metadata are prerequisites, while healthy execution needs runtime evidence.',
          ),
          q(
            'Why split executingRevision from stagedRevision?',
            [
              'They are always equal',
              'A running process can still use old code after a new bundle is ready',
              'S3 requires two version fields',
              'It removes the need for source maps',
            ],
            1,
            'Disk staging and the executing engine are separate states.',
          ),
        ],
      },
      {
        id: 'security',
        title: 'An updater is a code-delivery trust path',
        description: 'Protect publishing, authenticity, compatibility, and persisted data.',
        minutes: 12,
        lab: 'failure',
        sources: ['cache', 'cli', 'android-utils', 'apple', 'google'],
        sections: [
          {
            title: 'Protect who can publish',
            body: [
              'A release program runs inside your app’s existing privileges. Restrict CI and developer IAM access for artifact writes and management Lambda invocations. Keep credentials short-lived where possible, separate environments, audit publication and state changes, and avoid putting secrets in the shipped JS bundle.',
              'TLS protects transport. A private S3 bucket with CloudFront origin access control protects direct origin access. Neither by itself proves that an artifact was produced by an authorized software release process if the publishing path is compromised.',
            ],
          },
          {
            title: 'Design authenticity deliberately',
            body: [
              'The inspected client validates bundle MD5. It does not show a complete signed-manifest trust protocol. A hardened design signs metadata containing the artifact digest, identity, compatibility line, and revision, then verifies it against a trusted key anchored in the native binary.',
              'Key rotation, expiry, replay defense, and intentional rollback need an explicit design. Simply rejecting every lower revision can conflict with legitimate recovery to a baseline. These are additional engineering recommendations, not undocumented claims about the public Delta implementation.',
            ],
          },
          {
            title: 'Rollback also meets local data',
            body: [
              'An OTA can change AsyncStorage keys, database schemas, cached payloads, and API expectations. Rolling code back does not automatically undo a data migration. The embedded baseline must still handle data written by the newer OTA, or recovery may fail after a perfectly successful bundle switch.',
              'Favor backward-compatible data evolution, additive fields, versioned migrations, and tests that exercise target → embedded fallback with realistic persisted state. Keep server API changes compatible across the supported device population.',
            ],
            callout:
              'A safe update is compatible with the native runtime, platform policy, backend contracts, and persisted data.',
          },
        ],
        takeaway:
          'A hash is one check in a larger trust path. Code rollback must also survive the data it leaves behind.',
        questions: [
          q(
            'What can still break after a successful embedded-bundle rollback?',
            [
              'Nothing; code rollback resets all state',
              'A local data migration that the baseline cannot read',
              'The patch key format only',
              'The CDN necessarily deletes itself',
            ],
            1,
            'The updater changes code, not necessarily the data that new code persisted.',
          ),
          q(
            'Which is a design recommendation rather than a verified feature of this SDK snapshot?',
            [
              'Bundle MD5 checks',
              'Native bundle path selection',
              'A complete signed-manifest authenticity protocol',
              'Patch reconstruction',
            ],
            2,
            'The inspected paths show checksums; the course does not claim a signature verification feature that was not found.',
          ),
        ],
      },
    ],
  },
  {
    id: 'end-to-end',
    title: 'Put the whole system together',
    description: 'Walk a real-shaped release, practice locally, then debug it.',
    lessons: [
      {
        id: 'complete-flow',
        title: 'Trace one checkout hotfix end to end',
        description: 'Take native 2.4.0, bundle 1, to a compatible target 4.',
        minutes: 14,
        lab: 'lifecycle',
        sources: ['cli-build', 'server', 'android', 'android-utils'],
        sections: [
          {
            title: 'Start with a known device',
            body: [
              'Our illustrative Android app is shop-android, native appVersion 2.4.0, jsVersion 101, currently executing bundle 1. The bug is in JS price formatting, so it needs no new native module or permission. The app already includes the Delta loader.',
              'The publisher builds target 4 against the same native contract, generates a full target and available base-specific patches, computes the target bundle MD5, uploads artifacts, and creates the staged release. Internal release builds verify the fix and asset paths. These are example versions, not Zepto production data.',
            ],
          },
          {
            title: 'The server answers for this device',
            body: [
              'The operator promotes target 4 to LIVE with rollout 30. The device’s bucket is 20. On its next check, the server finds the same app/JS line, no disabled current record, and a newer LIVE target with 30 ≥ 20. It selects bundle 4.',
              'The target has patch-04-01, so the response returns that URL plus the full target URL and expected hash. If the device were on bundle 2 without patch-04-02, it could receive the full target instead. A phone on JS line 102 would query a different line.',
            ],
            code: {
              label: 'The decision',
              value:
                'app:         shop-android === shop-android ✓\nJS line:     101 === 101                   ✓\nrevision:    4 > 1                         ✓\nstate:       LIVE                          ✓\ncohort:      rollout 30 ≥ bucket 20        ✓\npatch edge:  patch-04-01 exists             ✓',
            },
          },
          {
            title: 'Disk changes before the running screen',
            body: [
              'The SDK downloads and unzips the patch, uses bundle 1 to reconstruct bundle 4, compares the reconstructed MD5 to the expected target, copies the final files, verifies the copied bundle, and commits ready metadata.',
              'The current screen can still execute bundle 1. After a later native runtime start, the loader sees the matching app version, a valid selected file, and no rollback flag, then loads bundle 4. Product telemetry confirms the executing revision and the fixed checkout behavior. If target 4 is later disabled, affected phones must observe fresh rollback metadata and go through the loader to return to the embedded baseline.',
            ],
          },
        ],
        takeaway:
          'You can now trace every handoff: publisher → metadata → eligible device → patch → verified target → native loader → observed behavior.',
        questions: [
          q(
            'A compatible device in bucket 20 checks target 4, LIVE at rollout 30. What happens if no direct patch exists?',
            [
              'It must install 2 and 3',
              'It can use the full target bundle',
              'It switches native app versions',
              'It cannot update under any circumstances',
            ],
            1,
            'A missing edge changes the transfer path, not the target’s compatibility.',
          ),
          q(
            'What closes the loop after loading the new bundle?',
            [
              'Only a successful S3 upload',
              'Only the hash match',
              'Evidence that the intended revision executes and the checkout is healthy',
              'The size of the patch',
            ],
            2,
            'Delivery correctness and product correctness need separate observations.',
          ),
        ],
      },
      {
        id: 'implementation-recipe',
        title: 'Your hands-on implementation recipe',
        description: 'A grounded sequence for trying Delta in a separate RN test app.',
        minutes: 16,
        lab: 'architecture',
        sources: ['sdk', 'cli', 'server-guide', 'states'],
        sections: [
          {
            title: 'Prepare infrastructure and identities',
            body: [
              'Use a separate test environment. Follow delta-server’s SAM setup with AWS credentials, Docker for local testing where required, and your own globally unique S3 bucket/table/resource names. The documented first cloud deployment is two passes: create resources, then wire the generated CloudFront ID and URL back into configuration and redeploy.',
              'Use the generated delta.config.json with the CLI. Configure the CLI’s .env with ANDROID_VERSION, ANDROID_JS_VERSION, ANDROID_DELTA_ID and the corresponding IOS_VERSION, IOS_JS_VERSION, IOS_DELTA_ID. Match those values to the installed native baseline; the CLI environment keys and native SDK build keys have different names. Install @zepto-labs/react-native-delta in a compatible bare/native RN app and @zepto-labs/delta-cli as a development dependency. Create separate Android and iOS registries. The SDK README lists React Native ≥0.73 and platform prerequisites; inspect your exact toolchain compatibility.',
            ],
            code: {
              label: 'Inside your separate RN test app · prerequisites and config required',
              value:
                'npm install @zepto-labs/react-native-delta\nnpm install -D @zepto-labs/delta-cli\n\nnpx delta-cli createRegistry --appId shop-android \\\n  --platform android --appName "Learning Shop"\nnpx delta-cli createRegistry --appId shop-ios \\\n  --platform ios --appName "Learning Shop"',
            },
          },
          {
            title: 'Ship a baseline before a patch',
            body: [
              'Complete the native setup in each platform’s SDK instructions: initialization, delegate, bundle path hook, IDs/URL, JS version, patch library, and build hooks. Build/install a Release binary and confirm its embedded manifest and uploaded baseline. Do not use this web course as a substitute for the complete platform setup.',
              'Make a visible JS-only test change. Keep jsVersion fixed. Build an OTA into STAGING, mark only your test device as an internal user, check, wait for verified readiness, then restart through the native loader and confirm the new revision executes.',
            ],
            code: {
              label: 'After a baseline exists · examples assume JS line 101, target 4',
              value:
                'npx delta-cli createBundleRelease --platform android \\\n  --entryFile index.js --pushToStaging\n\n# Only after testing, promote an actual existing staged revision:\nnpx delta-cli updateRelease --platform android \\\n  --appId shop-android --jsVersion 101 --bundleVersion 4 \\\n  --releaseState 20 --rollout 10',
            },
          },
          {
            title: 'Rehearse failure before increasing rollout',
            body: [
              'Check the no-update path, incompatible JS line, absent patch edge, interrupted download, wrong reconstructed hash, app-version change, HALTED behavior, and DISABLED rollback. Verify persisted data survives embedded fallback. Measure artifacts rather than assuming a size reduction.',
              'The commands shown create real cloud resources or release changes when run with configured credentials. Nothing in this learning site runs them for you; the browser labs are local simulations. Download the study guide from Resources for a portable checklist.',
            ],
            callout:
              'Use the bundleVersion actually created by your CLI. The number 4 is an example, not a command to force a new revision number.',
          },
        ],
        takeaway:
          'Establish infrastructure → integrate a native baseline → stage one compatible OTA → observe → rehearse recovery → promote slowly.',
        questions: [
          q(
            'What must exist before you can meaningfully test a baseline-to-target patch?',
            [
              'Only a React component screenshot',
              'An installed native release with Delta and a matching uploaded baseline',
              'A production rollout at 100%',
              'An Expo Go session without custom native code',
            ],
            1,
            'The test needs the real native loader and exact base bytes.',
          ),
          q(
            'What should you do with the example target revision 4 in the CLI snippet?',
            [
              'Always use it, even if absent',
              'Replace it with the actual created revision in your test environment',
              'Use it as the native app version',
              'Use it as the AWS region',
            ],
            1,
            'CLI state updates operate on an existing exact release, not an arbitrary tutorial number.',
          ),
        ],
      },
      {
        id: 'failure-drills',
        title: 'Debug by finding the broken handoff',
        description: 'Use evidence to isolate eligibility, delivery, verification, and activation.',
        minutes: 12,
        lab: 'failure',
        sources: ['server', 'cache', 'android', 'crash'],
        sections: [
          {
            title: '“The release is live, but I see nothing”',
            body: [
              'First verify the executing revision and installed native version. Inspect the actual check request: appId, JS line, current bundle, bucket, and internal flag. A live target in another registry or compatibility line is irrelevant to that phone.',
              'Then inspect the response freshness and eligibility. A regular user outside rollout is expected to see no update. A HALTED target is not eligible. CDN caching can preserve an older decision until invalidation propagates. Avoid “fixing” expected targeting behavior by bypassing compatibility.',
            ],
          },
          {
            title: '“The request succeeded, but the app is unchanged”',
            body: [
              'An update offer is not a completed download. Inspect artifact HTTP results, disk availability, unzip and patch outcomes, target MD5, final-copy verification, and ready metadata. If the patch edge is missing, confirm the full path works.',
              'If the target is ready, confirm a new native loading path actually ran. Navigating between screens is not a reliable runtime restart. If it did run, inspect cached appVersion, rollback state, and file existence to understand which path the native hook returned.',
            ],
            code: {
              label: 'Debug in this order',
              value:
                '1. Correct app / platform / native line?\n2. Fresh response, eligible state and bucket?\n3. Download / unzip / reconstruct successful?\n4. Target hash and final copy valid?\n5. Ready state committed?\n6. Native loader invoked again?\n7. Target executing and product behavior healthy?',
            },
          },
          {
            title: '“It recovered, but data is broken”',
            body: [
              'A code fallback does not reverse writes to local databases or server-side state. Reproduce with realistic user data and compare both the target and embedded baseline against it. This is why recovery testing belongs before a wide rollout.',
              'For crashes, retain the exact native build and OTA source map. Do not assume the scoped Android exception handler catches the particular failure. Use its category checks and your actual telemetry to explain the outcome.',
            ],
          },
        ],
        takeaway:
          'Trace the handoffs in order. Each successful stage narrows the next place to inspect.',
        questions: [
          q(
            'A target is READY_TO_INSTALL but screen navigation shows old behavior. What should you investigate?',
            [
              'Whether a new native runtime loading path has actually run',
              'Whether JSON should be larger',
              'Whether a native permission can be added through a patch',
              'Whether all users are internal',
            ],
            0,
            'A ready file is selected at runtime start, not automatically on navigation.',
          ),
          q(
            'A no-update response is cached after promotion. What infrastructure behavior matters?',
            [
              'React component memoization',
              'CDN cache keys, TTL, and invalidation propagation',
              'The font cache',
              'Only the patch filename',
            ],
            1,
            'The check decision itself is cached, so inspect freshness as well as database state.',
          ),
        ],
      },
      {
        id: 'capstone',
        title: 'Build the rules. Explain the release.',
        description: 'Finish with six runnable exercises and an end-to-end design review.',
        minutes: 20,
        lab: 'workshop',
        challenge: 'readiness',
        sources: ['server', 'states', 'android', 'cli-build'],
        sections: [
          {
            title: 'Implement the small rules that protect the system',
            body: [
              'The code workshop gives you six focused JavaScript exercises: compatibility, a teaching patch interpreter, release selection, native launch selection, state transitions, and readiness validation. Each runs real code against multiple checks in a terminable browser worker.',
              'The exercises isolate mechanisms so you can explain them. They do not implement the production SDK, bsdiff, AWS, a native file system, or publisher signature verification. Passing them means your small rules work on the supplied cases; it is not certification of a production OTA platform.',
            ],
          },
          {
            title: 'Talk through an unfamiliar incident',
            body: [
              'Imagine target 7 is LIVE at 50%, some users remain on 3, others have staged 7, and startup failures appear only on one native version. Describe which app and JS line each device queries, whether patch-07-03 exists, how full fallback is verified, and which program is still executing.',
              'Then choose between HALTED and DISABLED. Explain when affected devices will observe the change, why the embedded fallback is different from an arbitrary prior OTA, and how data migrations and source maps influence recovery. If you can connect these decisions, you understand the system beyond its API names.',
            ],
          },
          {
            title: 'Your final mental model',
            body: [
              'Compatibility decides whether a program may run. Release state and cohorts decide whether it is offered. Delta transport decides how its bytes arrive. Verification decides whether the reconstructed target matches. The native loader decides when it runs. Application telemetry decides whether it worked.',
              'Use Sources to revisit the exact implementation. The course pins repository commits because SDKs and state machines evolve; treat source-backed conclusions as statements about those snapshots. Export your notes and progress to keep your own explanation.',
            ],
            callout:
              'The invariant: always retain a compatible, verified program that the native app can load, including when an update fails.',
          },
        ],
        takeaway:
          'You understand OTA when you can explain both a successful update and every boundary where it may safely stop.',
        questions: [
          q(
            'Which ordering best describes a robust update flow?',
            [
              'Activate → download → verify',
              'Eligibility → delivery → reconstruction → verification → ready → native load → health',
              'Publish → assume adoption',
              'Increase rollout → ignore compatibility',
            ],
            1,
            'Each phase establishes a different condition before the next phase relies on it.',
          ),
          q(
            'What does passing these browser exercises establish?',
            [
              'That a full native OTA platform is deployed',
              'That store policies never apply',
              'That your focused functions pass the supplied behavioral checks',
              'That all future app releases are safe',
            ],
            2,
            'The exercises teach real rules in a small model; native integration and operations still require separate verification.',
          ),
        ],
      },
    ],
  },
];
export const lessons = chapters.flatMap((chapter, chapterIndex) =>
  chapter.lessons.map((lesson, lessonIndex) => ({ ...lesson, chapter, chapterIndex, lessonIndex })),
);
export const totalMinutes = lessons.reduce((total, lesson) => total + lesson.minutes, 0);
