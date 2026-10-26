> The primary course is now integrated into Zero to Hero at **`/react-native-networking`**, following the React Native OTA pattern. React components live in `src/networking/`; this folder retains the original portable field guide and research. Run `python3 research/react-native-networking/export-react.py` from the repository root after changing curriculum data. The integration uses a separate local progress store and can import a standalone JSON backup. The verification results below concern the original standalone artifact; React integration has its own tests.

# The Network Fieldguide — React Native

Open **[index.html](index.html)** in a browser. The entire course is one self-contained HTML file, with no dependencies, account, backend, or remote assets. The **Save course HTML** button produces another portable copy without your private notes.

For a stable browser address, serve this directory locally:

```sh
python3 -m http.server 8731 --directory research/react-native-networking
```

Run that command from the repository root, then open <http://localhost:8731>. Keep the same protocol, hostname, and port to reuse the same local storage. Stopping the server does not delete progress; the HTML file itself can also be opened directly for offline use. File-URL storage behavior varies between browsers.

## What is included

- 28 beginner-friendly chapters in six stages, about 14,300 words plus exercises and explanations.
- 84 chapter questions and a 16-question final knowledge assessment, with explanations and retries.
- Eight interactive simulations: HTTP responses, safe retries, caching, session refresh, outbox crash recovery, trace waterfalls, metric denominators, and incident diagnosis.
- 55 glossary definitions and flashcards, bookmarks, chapter/content search, and a mistake-review queue.
- Chapter notes, an incident notebook, an 18-item evidence checklist, and Markdown notebook download.
- Versioned local progress, safe JSON export/import with a replacement preview, and original-record recovery if stored data is unreadable.
- 36 readable primary references retrieved on 26 October 2026, chapter citations, research findings, access records, and local text snapshots.

Follow Course → Learn → Labs → Review → Field notes. A chapter is complete after it is marked studied and each of its questions has been answered correctly at least once. Later mistakes remain available for review. The checklist is self-recorded evidence for your own app, separate from chapter progress. The final assessment target is 13/16; it is not a certification.

## Save your work

Progress is stored under `rn-network-fieldguide.v1` in browser localStorage, scoped to this file/origin and browser profile. It is not a cloud account. Private browsing, browser data clearing, changed file paths/origins, or an embedded frame's storage policy can make it unavailable. The interface reports whether it can save locally. If it cannot, the course remains usable for that session.

Use **Field notes → Export progress JSON** regularly. To move devices or recover a session, import that backup and inspect the preview before replacing the current record. The HTML download contains the curriculum; the JSON contains progress and notes. Keep both. Avoid recording actual credentials or customer data.

A corrupt/unsupported saved record is not automatically overwritten. Field notes offers a download of its original contents before reset/import. Imports are bounded, structurally validated, and rendered as plain text. A manually edited backup is still self-reported progress, not proof of app readiness.

## Scope and research

This is an authored practical foundation covering production networking across client, API contract, mobile lifecycle, and observability boundaries. It uses a fictional shop app called Fieldcart. Numerical timeouts/SLOs and all simulation timings are teaching examples. The labs do not run React Native, contact an API, or implement the server guarantees they model. The course includes a capstone starting recipe and real-device failure drills; no native app was built as part of this HTML artifact.

Read [RESEARCH.md](RESEARCH.md) for the primary findings and source limitations. Security, store policies, platform schedules, and SDK integrations need rechecking against your actual supported versions and product requirements before shipping.

## Edit, rebuild, and verify

`course.py` contains the lessons, questions, glossary, and checklist. `app.js`, `style.css`, and `template.html` implement the interface. `build.py` embeds them with `sources.json` into the standalone document:

```sh
python3 research/react-native-networking/build.py
```

`research.py` retrieves public official references into `research/` and updates the manifest. Refreshing sources does not automatically fact-check or revise the authored lessons; review changed guidance and update the snapshot date/content together.

The browser acceptance suite requires installed Google Chrome and Playwright. An isolated run with `uv` is:

```sh
uv run --with playwright research/react-native-networking/verify.py
```

It tests all lesson and lab routes at 360, 728, and 1280 pixels; real quiz/exam interactions; lab recovery outcomes; reload persistence; safe import/export; plain-text note rendering; corrupt/unavailable storage; downloadable HTML; and offline/no-remote-request behavior. See [verification.json](verification.json) for the exact results. No mobile/native integration is claimed by this browser suite.
