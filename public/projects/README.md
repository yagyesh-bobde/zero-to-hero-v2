# Zero to Hero: runnable chapter projects

Eight small Python scripts, one per chapter. Each one is a complete program you can
read top to bottom and run on a laptop CPU. No downloads at run time: every script
carries its own tiny dataset.

> **About the data.** The bundled name list (~200 names) and text (~1 KB) are tiny on
> purpose. They show *how* each idea works. They are not meant to make good models,
> and the loss numbers are not benchmarks. Several scripts will memorize the data, and
> they print a note when that happens.

## Setup

You need Python 3.9 or newer.

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

`requirements.txt` holds a single package, `torch>=2.2,<3`. `micrograd.py`,
`bigram.py` and `tokenizer.py` need only the standard library, so they run without
installing anything.

On Windows, use `.venv\Scripts\pip` and `.venv\Scripts\python` instead.

## Run

| # | Script | What it builds | Command |
|---|--------|----------------|---------|
| 1 | `micrograd.py` | Scalar autograd (`Value` with +, *, **, tanh), reverse topological backprop, and a Neuron/Layer/MLP trained on a tiny 2D binary dataset | `.venv/bin/python micrograd.py` |
| 2 | `bigram.py` | Pure-Python character bigram counts, add-k smoothing, NLL, name sampling | `.venv/bin/python bigram.py` |
| 3 | `mlp.py` | MLP name generator: embeddings, context window, mini-batches, train/val/test, sampling | `.venv/bin/python mlp.py` |
| 4 | `batchnorm.py` | Hand-written BatchNorm1d (train vs. inference, running stats) checked against PyTorch, plus activation/gradient diagnostics | `.venv/bin/python batchnorm.py` |
| 5 | `backprop.py` | Manual backward pass through a 2-layer BatchNorm MLP, compared with autograd for every tensor and parameter | `.venv/bin/python backprop.py` |
| 6 | `wavenet.py` | Hierarchical model: `FlattenConsecutive(2)` merges an 8-character context in pairs, 8 → 4 → 2 → 1 | `.venv/bin/python wavenet.py` |
| 7 | `gpt.py` | Tiny GPT: multi-head causal self-attention, feed-forward, pre-norm residuals, positional embeddings, temperature sampling | `.venv/bin/python gpt.py` |
| 8 | `tokenizer.py` | Pure-Python byte-level BPE: training, merge-rank encoding, decoding that round-trips any UTF-8 text | `.venv/bin/python tokenizer.py` |

Each script runs in a few seconds on a CPU with its default settings, and uses fixed seeds,
so you get the same output every time on the same machine.

### Useful options

Every script has `--help`, and the docstring at the top of each file lists examples.

- `--steps N` sets the number of training steps (`micrograd`, `mlp`, `batchnorm`,
  `backprop`, `wavenet`, `gpt`). Use `--steps 2` for a quick smoke test.
- `--seed N` changes the random seed.
- `bigram.py --smoothing 0` shows why smoothing matters: validation NLL becomes infinite.
- `batchnorm.py --no-batchnorm` runs the same network without BatchNorm so you can compare diagnostics.
- `gpt.py --temperature 0.5 --top-k 5 --sample-chars 400` changes how text is sampled.
- `gpt.py --text-file my.txt` and `tokenizer.py --train-file my.txt` train on your own text.
- `tokenizer.py --text "héllo 👋 नमस्ते"` encodes and decodes your own string.
- `bigram.py --data names.txt` uses your own names file (one name per line).

## Notes

- Comments mark the important tensor-shape steps, for example `(B, T) -> (B, T, C)`.
- Everything runs on the CPU. `gpt.py` is small enough that a GPU is not needed.
- These are independent, simplified teaching builds written for this course. They are
  not copies of the lecture code, and they leave out production details on purpose.

## Sources and further reading

These projects follow the chapter order of Andrej Karpathy's *Neural Networks: Zero to Hero*.
Go to the originals for the full lectures and reference code:

- Course: <https://karpathy.ai/zero-to-hero.html>
- micrograd: <https://github.com/karpathy/micrograd>
- makemore (bigram, MLP, BatchNorm, backprop, WaveNet): <https://github.com/karpathy/makemore>
- nanoGPT: <https://github.com/karpathy/nanoGPT>
- minbpe (tokenizer): <https://github.com/karpathy/minbpe>

Papers behind the ideas:

- Bengio et al. 2003, *A Neural Probabilistic Language Model*: <https://www.jmlr.org/papers/v3/bengio03a.html>
- Ioffe & Szegedy 2015, *Batch Normalization*: <https://arxiv.org/abs/1502.03167>
- van den Oord et al. 2016, *WaveNet*: <https://arxiv.org/abs/1609.03499>
- Vaswani et al. 2017, *Attention Is All You Need*: <https://arxiv.org/abs/1706.03762>
- Sennrich et al. 2016, *Neural Machine Translation of Rare Words with Subword Units* (BPE): <https://arxiv.org/abs/1508.07909>
- Radford et al. 2019, *Language Models are Unsupervised Multitask Learners* (GPT-2, byte-level BPE): <https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf>
