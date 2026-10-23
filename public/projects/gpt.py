"""
gpt.py - a tiny character-level GPT (decoder-only Transformer) trained from scratch.

Chapter 7 of the Zero to Hero course project pack.

What it shows
  * Token + positional embeddings: what a character is, and where it is.
  * Multi-head causal self-attention with a lower-triangular mask, so a
    position can only look at itself and the past.
  * Pre-norm residual blocks: x + attn(ln(x)), then x + mlp(ln(x)).
  * Training with AdamW on random chunks, with a train/val loss estimate.
  * A check that changing a FUTURE character never changes earlier outputs.
  * Sampling with temperature (and optional top-k).

Usage
  python gpt.py                                 # defaults: 300 steps (a few seconds on CPU)
  python gpt.py --steps 2                       # quick smoke test
  python gpt.py --temperature 0.6 --sample-chars 400
  python gpt.py --text-file my_text.txt --steps 2000 --n-layer 4

Needs PyTorch only. The bundled text is tiny on purpose: it demonstrates
the mechanics of a Transformer, not quality or benchmark numbers.
"""

import argparse
import warnings

warnings.filterwarnings("ignore", message="Failed to initialize NumPy")  # torch works without numpy
import torch
import torch.nn as nn
import torch.nn.functional as F

TEXT = """
The river keeps a little light at night. The fox walks by the river and the
owl watches from the old tree. The fox says to the owl, the water is cold and
the moon is far. The owl says, the moon is far but the light is here.
A small boat sleeps by the river. The wind moves the boat and the boat moves
the water, and the water carries the light back to the tree.
In the morning the fox comes back and the owl goes to sleep. The river is warm
and bright, and the light is everywhere, on the water, on the boat, on the tree.
The fox says, where did the night light go? The river says, it is still here,
it only looks small when the sun is big. The fox sits by the water and waits.
At night the owl wakes up and the moon comes back over the hill. The fox and
the owl and the river and the boat all keep a little light, and the night is
not so dark at all. The owl says, we each keep a little light. The fox says,
and together it is enough. The river laughs and carries it all the way home.
"""


class CausalSelfAttention(nn.Module):
    def __init__(self, n_embd, n_head, block_size, dropout):
        super().__init__()
        assert n_embd % n_head == 0, "n_embd must split evenly across heads"
        self.n_head = n_head
        self.qkv = nn.Linear(n_embd, 3 * n_embd)  # queries, keys, values in one matmul
        self.proj = nn.Linear(n_embd, n_embd)
        self.drop = nn.Dropout(dropout)
        # mask[i, j] = 1 if position i may look at position j (j <= i).
        self.register_buffer("mask", torch.tril(torch.ones(block_size, block_size)))

    def forward(self, x):
        B, T, C = x.shape
        hs = C // self.n_head  # head size
        q, k, v = self.qkv(x).split(C, dim=2)  # each (B, T, C)
        # Split channels into heads and move heads next to batch:
        # (B, T, C) -> (B, T, n_head, hs) -> (B, n_head, T, hs)
        q = q.view(B, T, self.n_head, hs).transpose(1, 2)
        k = k.view(B, T, self.n_head, hs).transpose(1, 2)
        v = v.view(B, T, self.n_head, hs).transpose(1, 2)
        # Affinities: (B, nh, T, hs) @ (B, nh, hs, T) -> (B, nh, T, T).
        # Scale by 1/sqrt(hs) so softmax does not get too peaky at init.
        att = (q @ k.transpose(-2, -1)) * hs ** -0.5
        att = att.masked_fill(self.mask[:T, :T] == 0, float("-inf"))  # hide the future
        att = self.drop(F.softmax(att, dim=-1))  # each row sums to 1 over the past
        y = att @ v  # (B, nh, T, T) @ (B, nh, T, hs) -> (B, nh, T, hs)
        y = y.transpose(1, 2).contiguous().view(B, T, C)  # glue heads back: (B, T, C)
        return self.drop(self.proj(y))


class FeedForward(nn.Module):
    def __init__(self, n_embd, dropout):
        super().__init__()
        # Per-position MLP; the 4x wider hidden layer is the usual choice.
        self.net = nn.Sequential(
            nn.Linear(n_embd, 4 * n_embd), nn.GELU(), nn.Linear(4 * n_embd, n_embd), nn.Dropout(dropout))

    def forward(self, x):
        return self.net(x)


class Block(nn.Module):
    def __init__(self, n_embd, n_head, block_size, dropout):
        super().__init__()
        self.ln1, self.ln2 = nn.LayerNorm(n_embd), nn.LayerNorm(n_embd)
        self.attn = CausalSelfAttention(n_embd, n_head, block_size, dropout)
        self.ffwd = FeedForward(n_embd, dropout)

    def forward(self, x):
        # Pre-norm residuals: normalize the INPUT to each sub-layer, and add
        # its output back onto the residual stream x (shape stays (B, T, C)).
        x = x + self.attn(self.ln1(x))  # tokens talk to each other
        x = x + self.ffwd(self.ln2(x))  # each token thinks on its own
        return x


class GPT(nn.Module):
    def __init__(self, vocab_size, block_size, n_embd, n_head, n_layer, dropout):
        super().__init__()
        self.block_size = block_size
        self.tok_emb = nn.Embedding(vocab_size, n_embd)  # what the character is
        self.pos_emb = nn.Embedding(block_size, n_embd)  # where it sits (0..T-1)
        self.blocks = nn.Sequential(*[Block(n_embd, n_head, block_size, dropout) for _ in range(n_layer)])
        self.ln_f = nn.LayerNorm(n_embd)
        self.lm_head = nn.Linear(n_embd, vocab_size)

    def forward(self, idx, targets=None):
        B, T = idx.shape
        assert T <= self.block_size, "sequence longer than block_size"
        pos = torch.arange(T, device=idx.device)
        # (B, T, C) + (T, C): the same position vectors are added to every row
        x = self.tok_emb(idx) + self.pos_emb(pos)
        x = self.ln_f(self.blocks(x))
        logits = self.lm_head(x)  # (B, T, vocab): a prediction at EVERY position
        loss = None
        if targets is not None:
            # cross_entropy wants (N, classes), so flatten batch and time together
            loss = F.cross_entropy(logits.view(B * T, -1), targets.view(B * T))
        return logits, loss

    @torch.no_grad()
    def generate(self, idx, max_new_tokens, temperature=1.0, top_k=None, generator=None):
        for _ in range(max_new_tokens):
            idx_cond = idx[:, -self.block_size:]  # positional table only has block_size slots
            logits, _ = self(idx_cond)
            # Only the last position predicts the next char. Temperature < 1
            # sharpens the distribution, > 1 flattens it.
            logits = logits[:, -1, :] / max(temperature, 1e-6)
            if top_k is not None:
                kth = torch.topk(logits, min(top_k, logits.shape[-1])).values[:, [-1]]
                logits = logits.masked_fill(logits < kth, float("-inf"))
            next_id = torch.multinomial(F.softmax(logits, dim=-1), 1, generator=generator)  # (B, 1)
            idx = torch.cat([idx, next_id], dim=1)
        return idx


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=300, help="training steps (default 300)")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--block-size", type=int, default=32, help="context length in characters")
    parser.add_argument("--n-embd", type=int, default=64)
    parser.add_argument("--n-head", type=int, default=4)
    parser.add_argument("--n-layer", type=int, default=2)
    parser.add_argument("--dropout", type=float, default=0.1)
    parser.add_argument("--lr", type=float, default=3e-3)
    parser.add_argument("--eval-iters", type=int, default=20, help="batches per loss estimate")
    parser.add_argument("--temperature", type=float, default=0.8)
    parser.add_argument("--top-k", type=int, default=None)
    parser.add_argument("--sample-chars", type=int, default=300)
    parser.add_argument("--text-file", help="optional UTF-8 text file to train on")
    parser.add_argument("--seed", type=int, default=1337)
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    text = TEXT
    if args.text_file:
        with open(args.text_file, encoding="utf-8") as f:
            text = f.read()

    chars = sorted(set(text))
    stoi = {ch: i for i, ch in enumerate(chars)}
    encode = lambda s: [stoi[c] for c in s]
    decode = lambda ids: "".join(chars[i] for i in ids)
    data = torch.tensor(encode(text))  # (N,) the whole text as ids
    n = int(0.9 * len(data))
    train_data, val_data = data[:n], data[n:]
    bs = args.block_size
    assert len(val_data) > bs + 1, "text too short for this block_size"

    def get_batch(split):
        d = train_data if split == "train" else val_data
        starts = torch.randint(len(d) - bs - 1, (args.batch_size,))
        x = torch.stack([d[i:i + bs] for i in starts])  # (B, T)
        y = torch.stack([d[i + 1:i + bs + 1] for i in starts])  # (B, T): x shifted left by one
        return x, y

    model = GPT(len(chars), bs, args.n_embd, args.n_head, args.n_layer, args.dropout)
    print("vocab %d | train chars %d | val chars %d | parameters %d" % (
        len(chars), len(train_data), len(val_data), sum(p.numel() for p in model.parameters())))

    # Causality check: change the last character; earlier logits must not move.
    model.eval()
    with torch.no_grad():
        x = train_data[:bs].unsqueeze(0).clone()
        a, _ = model(x)
        x[0, -1] = (x[0, -1] + 1) % len(chars)
        b, _ = model(x)
    causal = torch.allclose(a[0, :-1], b[0, :-1], atol=1e-6)
    print("causal mask check (future edit leaves the past unchanged): %s" % causal)
    assert causal

    @torch.no_grad()
    def estimate_loss():
        model.eval()  # turn dropout off while measuring
        out = {}
        for split in ("train", "val"):
            out[split] = torch.stack([model(*get_batch(split))[1] for _ in range(args.eval_iters)]).mean().item()
        model.train()
        return out

    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr)
    print("initial loss ~ ln(vocab) = %.3f" % torch.log(torch.tensor(float(len(chars)))).item())
    model.train()
    for step in range(args.steps):
        if step % max(1, args.steps // 5) == 0 or step == args.steps - 1:
            losses = estimate_loss()
            print("step %5d/%d | train %.4f | val %.4f" % (step, args.steps, losses["train"], losses["val"]))
        _, loss = model(*get_batch("train"))
        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # avoid rare loss spikes
        optimizer.step()

    print("(on ~1 KB of text the model soon memorizes it: train keeps falling while val rises)")

    model.eval()
    g = torch.Generator().manual_seed(args.seed)
    start = torch.tensor([encode("The ")])  # (1, 4) prompt
    out = model.generate(start, args.sample_chars, args.temperature, args.top_k, generator=g)
    print("\nsample (temperature %.2f):\n%s" % (args.temperature, decode(out[0].tolist())))


if __name__ == "__main__":
    main()
