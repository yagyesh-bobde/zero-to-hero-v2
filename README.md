# Zero to Hero, interactive

A complete, independent web learning companion to [Andrej Karpathy’s Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html). All eight lectures become 48 original lessons, 96 knowledge checks, 48 executable Python challenges, and nine interactive visual experiments.

[**Start learning →**](https://zero-to-hero-v2.vercel.app) · [Original lectures](https://zero-to-hero-v2.vercel.app/#/resources/lectures) · [GitHub](https://github.com/yagyesh-bobde/zero-to-hero-v2)

## Why I built this

My way of learning is hands-on: change something, see what happens, explain it, then build it myself. I wanted a way to work through the ideas in Zero to Hero in smaller, interactive steps, alongside the original videos. This companion turns that approach into a learning path with visual experiments, runnable code, and questions that check understanding.

Andrej Karpathy created the original course and deserves the credit for its teaching and progression. This project offers another way to practice those ideas. Every chapter and lesson links back to its original YouTube lecture, and all eight videos are available in the app’s Resources page.

## Run

```sh
npm install
npm run dev
```

Use Node.js 22.12+, 24, or 26+ (the test runner supports LTS releases). Open http://localhost:5173. Build for any static hosting provider with `npm run build`; serve `dist/`. Hash routes support direct lesson links without special server rewrites.

## The experience

- A structured learning path covering micrograd, bigram language modeling, MLPs, initialization and BatchNorm, manual tensor backpropagation, WaveNet, GPT, and BPE tokenization.
- Each lesson follows Understand → Explore → Build it → Check in. Completion requires passing the Python exercise and both knowledge checks.
- Real Python 3 execution through Pyodide in a dedicated, terminable Web Worker. Standard-library exercises need no accounts, API keys, Python installation, or backend. The first run downloads the runtime from jsDelivr and requires a network connection. Subsequent runs reuse the runtime while the editor stays mounted. Stop or timeouts terminate the worker.
- Nine original SVG/HTML visual labs, shaped with Claude Opus 5.5: derivatives and gradient descent, bigrams, embeddings/MLPs, activation health, backpropagation, hierarchical context, causal attention, byte pair encoding, and explicit tensor-level backpropagation. Graphics are interactive web animations rather than generated video files.
- A persistent Python sandbox, searchable course, per-lesson notebook, Markdown notes export, JSON progress backup, a glossary, and downloadable complete chapter projects.
- All eight original YouTube lectures, with Andrej Karpathy credited on each video card. Lessons and chapters include their matching source video; Resources collects the full series. Players load when you choose to watch, with direct YouTube links alongside them.
- Readable Inter typography, larger lesson text and code, and a light/dark switch in the top bar. Dark mode is the default; your choice is remembered on this device and applied before the page renders. The GitHub button links to this public repository if you want to explore the code or leave a star.
- A compact sidebar with a collapsible chapter list, a thin scrollbar, and progress pinned at the bottom. Use the sidebar icon or **⌘B / Ctrl+B** to show or hide navigation; sidebar and chapter-list preferences are remembered. The shortcut leaves code and note editing alone. **⌘K / Ctrl+K** opens course search, and **Esc** closes search or mobile navigation.
- Local progress, code, answers, and notes are saved in browser localStorage. Data stays on this browser/device; clearing site storage clears it. No account or cloud sync. Export a backup from My notebook. This release exports backups; it does not import them.

## Full projects

Download the chapter implementations from the Resources page or find them in `public/projects/`. Browser exercises deliberately expose small mechanisms using the standard library. Full tensor training projects use PyTorch locally and include installation instructions. The models use small illustrative datasets and are not production training or performance benchmarks.

## Checks

```sh
npm run build
npm test
# With PyTorch installed, also smoke-test every complete project:
npm run test:projects
```

Tests check complete lecture/lesson coverage, all challenge reference solutions in real Python, unfinished starter failures, and progress persistence/recovery. Tests require `python3` on PATH. Browser verification covers the actual Pyodide worker, lesson completion, navigation, visual labs, search, notes, and mobile layout.

## Structure

`src/data/modules/` contains the independently written curriculum and exercise checks. `src/components/VisualLab.tsx` contains the visual teaching tools. `public/python-worker.js` loads and executes Python. `src/storage.ts` manages local learning data. `src/theme.css` defines the shared color themes and readable typography; `src/dark.css` applies neutral charcoal surfaces, coral actions, and distinct feedback colors across the learning activities; `src/shell.css` handles the sidebar and header layout. The app uses React, TypeScript, Vite, and Lucide icons, with Inter and JetBrains Mono from Google Fonts (system font fallbacks included).

## Attribution

Created by [Yagyesh Bobde](https://github.com/yagyesh-bobde), inspired by [Andrej Karpathy’s Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html).

The teaching sequence and source lecture links come from Karpathy’s course. All lesson prose, exercises, interactive graphics, and interface in this project are original companion material, not video transcripts. The original videos belong to their creators and are embedded from YouTube. This project is independent and is not affiliated with or endorsed by Andrej Karpathy. Original implementation notebooks: [karpathy/nn-zero-to-hero](https://github.com/karpathy/nn-zero-to-hero).

| Chapter                          | Original lecture by Andrej Karpathy                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1 · micrograd                    | [Building micrograd](https://www.youtube.com/watch?v=VMj-3S1tku0)                                  |
| 2 · Bigram language model        | [Building makemore](https://www.youtube.com/watch?v=PaCmpygFfXo)                                   |
| 3 · Multilayer perceptron        | [makemore Part 2: MLP](https://www.youtube.com/watch?v=TCH_1BHY58I)                                |
| 4 · Initialization and BatchNorm | [makemore Part 3: Activations & Gradients, BatchNorm](https://www.youtube.com/watch?v=P6sfmUTpUmc) |
| 5 · Manual backpropagation       | [makemore Part 4: Becoming a Backprop Ninja](https://www.youtube.com/watch?v=q8SA3rM6ckI)          |
| 6 · WaveNet                      | [makemore Part 5: Building a WaveNet](https://www.youtube.com/watch?v=t3YJ5hKiMQ0)                 |
| 7 · GPT                          | [Let’s build GPT: from scratch, in code, spelled out](https://www.youtube.com/watch?v=kCc8FmEb1nY) |
| 8 · Tokenization                 | [Let’s build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)                       |
