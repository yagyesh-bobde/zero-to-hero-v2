"""
mlp.py - an MLP character-level name generator (embeddings + hidden layer).

Chapter 3 of the Zero to Hero course project pack.

What it shows
  * A context window: the previous `block_size` characters predict the next.
  * An embedding table C that turns each character id into a small vector.
  * Concatenating the context embeddings, a tanh hidden layer, then logits.
  * Mini-batch training with cross-entropy, a learning-rate drop late on.
  * Train / validation / test splits by NAME, so we can spot overfitting.
  * Sampling new names from the trained model.

Usage
  python mlp.py                    # defaults: 1000 steps (about a second on CPU)
  python mlp.py --steps 2          # quick smoke test
  python mlp.py --block-size 4 --n-embd 16 --n-hidden 128 --steps 3000  # watch it overfit

Needs PyTorch only. The bundled names list is tiny on purpose: it
demonstrates the mechanics, not model quality or benchmark numbers.
"""

import argparse
import random
import warnings

warnings.filterwarnings("ignore", message="Failed to initialize NumPy")  # torch works without numpy
import torch
import torch.nn.functional as F

NAMES = """
emma olivia ava isabella sophia mia charlotte amelia harper evelyn abigail emily
ella elizabeth camila luna sofia avery mila aria scarlett penelope layla chloe
victoria madison eleanor grace nora riley zoey hannah hazel lily ellie violet
lillian zoe stella aurora natalie emilia everly leah aubrey willow addison lucy
audrey bella nova brooklyn paisley savannah claire skylar isla genesis naomi
elena caroline eliana anna maya valentina ruby kennedy ivy ariana aaliyah cora
madelyn alice kinsley hailey gabriella allison gianna serenity samantha sarah
liam noah oliver elijah james william benjamin lucas henry theodore jack levi
alexander jackson mateo daniel michael mason sebastian ethan logan owen samuel
jacob asher aiden john joseph wyatt david leo luke julian hudson grayson matthew
ezra gabriel carter isaac jayden luca anthony dylan lincoln thomas maverick elias
josiah charles caleb christopher ezekiel miles jaxon isaiah andrew joshua nathan
nolan adrian cameron santiago eli aaron ryan angel cooper waylon easton kai
christian landon colton roman axel brooks jonathan robert jameson ian everett
greyson wesley jeremiah hunter leonardo jordan jose bennett silas nicholas parker
beau weston austin connor carson dominic xavier jaxson jace emmett adam declan
rowan micah kayden gael river ryder kingston damian sawyer luka evan vincent
""".split()


def build_dataset(words, block_size, stoi):
    X, Y = [], []
    for w in words:
        context = [0] * block_size  # start padded with '.' (id 0)
        for ch in w + ".":
            ix = stoi[ch]
            X.append(context)  # the last block_size ids ...
            Y.append(ix)  # ... predict this one
            context = context[1:] + [ix]  # slide the window by one
    # X: (N, block_size) ints, Y: (N,) ints
    return torch.tensor(X), torch.tensor(Y)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=1000, help="training steps (default 1000)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--block-size", type=int, default=3, help="context length in characters")
    parser.add_argument("--n-embd", type=int, default=10, help="embedding size per character")
    parser.add_argument("--n-hidden", type=int, default=64, help="hidden layer width")
    parser.add_argument("--lr", type=float, default=0.1)
    parser.add_argument("--samples", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    # ---- data ---------------------------------------------------------------
    words = NAMES[:]
    random.Random(args.seed).shuffle(words)
    chars = sorted(set("".join(words)))
    itos = ["."] + chars
    stoi = {ch: i for i, ch in enumerate(itos)}
    V = len(itos)

    n1, n2 = int(0.8 * len(words)), int(0.9 * len(words))
    Xtr, Ytr = build_dataset(words[:n1], args.block_size, stoi)
    Xva, Yva = build_dataset(words[n1:n2], args.block_size, stoi)
    Xte, Yte = build_dataset(words[n2:], args.block_size, stoi)
    print("vocab %d | examples train %d, val %d, test %d" % (V, len(Xtr), len(Xva), len(Xte)))

    # ---- parameters -----------------------------------------------------------
    g = torch.Generator().manual_seed(args.seed)
    E, T, H = args.n_embd, args.block_size, args.n_hidden
    C = torch.randn((V, E), generator=g)  # (vocab, n_embd)
    # Small init scales keep tanh out of its flat regions and the first loss
    # close to -ln(1/V) instead of a confident-and-wrong huge number.
    W1 = torch.randn((T * E, H), generator=g) * (5 / 3) / (T * E) ** 0.5
    b1 = torch.randn(H, generator=g) * 0.01
    W2 = torch.randn((H, V), generator=g) * 0.01
    b2 = torch.zeros(V)
    params = [C, W1, b1, W2, b2]
    for p in params:
        p.requires_grad = True
    print("parameters: %d" % sum(p.nelement() for p in params))

    def forward(X):
        emb = C[X]  # (B, T) ids -> (B, T, E) vectors
        # Concatenate the T vectors of each example: (B, T, E) -> (B, T*E)
        h = torch.tanh(emb.view(emb.shape[0], -1) @ W1 + b1)  # (B, H)
        return h @ W2 + b2  # (B, V) one score per possible next char

    @torch.no_grad()
    def split_loss(X, Y):
        return F.cross_entropy(forward(X), Y).item()

    # ---- training ---------------------------------------------------------------
    for step in range(args.steps):
        ix = torch.randint(0, Xtr.shape[0], (args.batch_size,), generator=g)  # random mini-batch
        loss = F.cross_entropy(forward(Xtr[ix]), Ytr[ix])
        for p in params:
            p.grad = None
        loss.backward()
        lr = args.lr if step < 0.75 * args.steps else args.lr / 10  # simple decay
        for p in params:
            p.data += -lr * p.grad
        if step % max(1, args.steps // 10) == 0 or step == args.steps - 1:
            print("step %5d/%d | batch loss %.4f" % (step, args.steps, loss.item()))

    print("\nuniform baseline: %.4f" % torch.log(torch.tensor(float(V))).item())
    print("train loss %.4f | val loss %.4f | test loss %.4f" % (
        split_loss(Xtr, Ytr), split_loss(Xva, Yva), split_loss(Xte, Yte)))
    print("(a big train/val gap means the tiny dataset is being memorized)")

    # ---- sampling -----------------------------------------------------------------
    print("\nsamples:")
    with torch.no_grad():
        for _ in range(args.samples):
            out, context = [], [0] * T
            for _ in range(30):
                probs = F.softmax(forward(torch.tensor([context])), dim=1)  # (1, V)
                ix = torch.multinomial(probs, num_samples=1, generator=g).item()
                if ix == 0:
                    break
                out.append(itos[ix])
                context = context[1:] + [ix]
            print(" ", "".join(out))


if __name__ == "__main__":
    main()
