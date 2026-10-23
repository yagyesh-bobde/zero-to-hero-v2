"""
wavenet.py - a hierarchical (WaveNet-style) name model with an 8-character context.

Chapter 6 of the Zero to Hero course project pack.

What it shows
  * block_size = 8: the model sees the previous 8 characters.
  * Instead of squashing all 8 into one layer at once, FlattenConsecutive(2)
    fuses neighbours in pairs, three times: 8 -> 4 -> 2 -> 1 groups.
    This is the tree-like idea behind WaveNet's dilated causal convolutions.
  * A BatchNorm1d that works on 3D inputs (B, T, C) by averaging over B and T.
  * Printing the tensor shape after every layer so the hierarchy is visible.

Usage
  python wavenet.py                 # defaults: 1000 steps (a couple of seconds on CPU)
  python wavenet.py --steps 2       # quick smoke test
  python wavenet.py --n-embd 16 --n-hidden 96 --steps 4000

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


# ---- modules ----------------------------------------------------------------
class Embedding:
    def __init__(self, num, dim, g):
        self.weight = torch.randn((num, dim), generator=g)

    def __call__(self, ix):
        self.out = self.weight[ix]  # (B, T) -> (B, T, dim)
        return self.out

    def parameters(self):
        return [self.weight]


class FlattenConsecutive:
    """Glue every n neighbouring time steps into one wider vector."""

    def __init__(self, n):
        self.n = n

    def __call__(self, x):
        B, T, C = x.shape
        # (B, T, C) -> (B, T/n, C*n). view() works because neighbours in time
        # are already next to each other in memory.
        x = x.view(B, T // self.n, C * self.n)
        if x.shape[1] == 1:
            x = x.squeeze(1)  # last level: (B, 1, C*n) -> (B, C*n)
        self.out = x
        return x

    def parameters(self):
        return []


class Linear:
    def __init__(self, fan_in, fan_out, g, bias=True):
        self.weight = torch.randn((fan_in, fan_out), generator=g) / fan_in ** 0.5
        self.bias = torch.zeros(fan_out) if bias else None

    def __call__(self, x):
        # matmul works on the LAST dim, so (B, G, fan_in) -> (B, G, fan_out):
        # the same weights are applied to every group G independently.
        self.out = x @ self.weight
        if self.bias is not None:
            self.out = self.out + self.bias
        return self.out

    def parameters(self):
        return [self.weight] + ([] if self.bias is None else [self.bias])


class BatchNorm1d:
    def __init__(self, dim, eps=1e-5, momentum=0.1):
        self.eps, self.momentum, self.training = eps, momentum, True
        self.gamma, self.beta = torch.ones(dim), torch.zeros(dim)
        self.running_mean, self.running_var = torch.zeros(dim), torch.ones(dim)

    def __call__(self, x):
        if self.training:
            # 2D (B, C): stats over dim 0. 3D (B, G, C): over dims (0, 1), so
            # every group position shares one mean/var per channel.
            dims = 0 if x.ndim == 2 else (0, 1)
            mean = x.mean(dims, keepdim=True)
            var = x.var(dims, keepdim=True, unbiased=False)
        else:
            mean, var = self.running_mean, self.running_var
        self.out = self.gamma * (x - mean) / torch.sqrt(var + self.eps) + self.beta
        if self.training:
            with torch.no_grad():
                m = self.momentum
                self.running_mean = (1 - m) * self.running_mean + m * mean.reshape(-1)
                # (biased var kept here for brevity; batchnorm.py matches torch exactly)
                self.running_var = (1 - m) * self.running_var + m * var.reshape(-1)
        return self.out

    def parameters(self):
        return [self.gamma, self.beta]


class Tanh:
    def __call__(self, x):
        self.out = torch.tanh(x)
        return self.out

    def parameters(self):
        return []


class Sequential:
    def __init__(self, layers):
        self.layers = layers

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

    def train(self, mode=True):
        for layer in self.layers:
            if isinstance(layer, BatchNorm1d):
                layer.training = mode


def build_dataset(words, block_size, stoi):
    X, Y = [], []
    for w in words:
        context = [0] * block_size
        for ch in w + ".":
            X.append(context)
            Y.append(stoi[ch])
            context = context[1:] + [stoi[ch]]
    return torch.tensor(X), torch.tensor(Y)  # (N, 8), (N,)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=1000, help="training steps (default 1000)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--n-embd", type=int, default=10, help="embedding size per character")
    parser.add_argument("--n-hidden", type=int, default=64, help="width of each hierarchy level")
    parser.add_argument("--lr", type=float, default=0.1)
    parser.add_argument("--samples", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    block_size = 8  # must be a power of two: three pair-merges take 8 -> 1
    words = NAMES[:]
    random.Random(args.seed).shuffle(words)
    itos = ["."] + sorted(set("".join(words)))
    stoi = {ch: i for i, ch in enumerate(itos)}
    V = len(itos)
    n1 = int(0.9 * len(words))
    Xtr, Ytr = build_dataset(words[:n1], block_size, stoi)
    Xva, Yva = build_dataset(words[n1:], block_size, stoi)

    g = torch.Generator().manual_seed(args.seed)
    E, H = args.n_embd, args.n_hidden
    model = Sequential([
        Embedding(V, E, g),
        FlattenConsecutive(2), Linear(E * 2, H, g, bias=False), BatchNorm1d(H), Tanh(),  # 8 -> 4 groups
        FlattenConsecutive(2), Linear(H * 2, H, g, bias=False), BatchNorm1d(H), Tanh(),  # 4 -> 2 groups
        FlattenConsecutive(2), Linear(H * 2, H, g, bias=False), BatchNorm1d(H), Tanh(),  # 2 -> 1
        Linear(H, V, g),
    ])
    with torch.no_grad():
        model.layers[-1].weight *= 0.1  # calm output at init
    params = model.parameters()
    for p in params:
        p.requires_grad = True
    print("vocab %d | train examples %d | parameters %d" % (V, len(Xtr), sum(p.nelement() for p in params)))

    # Push 4 examples through once and print every layer's output shape.
    model.train(False)
    with torch.no_grad():
        x = Xtr[:4]
        print("\ninput                %s" % (tuple(x.shape),))
        for layer in model.layers:
            x = layer(x)
            print("%-20s %s" % (type(layer).__name__, tuple(x.shape)))
    model.train(True)
    print()

    for step in range(args.steps):
        ix = torch.randint(0, Xtr.shape[0], (args.batch_size,), generator=g)
        loss = F.cross_entropy(model(Xtr[ix]), Ytr[ix])
        for p in params:
            p.grad = None
        loss.backward()
        lr = args.lr if step < 0.75 * args.steps else args.lr / 10
        with torch.no_grad():
            for p in params:
                p -= lr * p.grad
        if step % max(1, args.steps // 10) == 0 or step == args.steps - 1:
            print("step %5d/%d | batch loss %.4f" % (step, args.steps, loss.item()))

    model.train(False)  # BN uses running stats from here on
    with torch.no_grad():
        tr = F.cross_entropy(model(Xtr), Ytr).item()
        va = F.cross_entropy(model(Xva), Yva).item()
    print("\ntrain loss %.4f | val loss %.4f" % (tr, va))
    print("(8 characters of context on ~200 names is enough to memorize them; a big gap is expected)")

    print("\nsamples:")
    with torch.no_grad():
        for _ in range(args.samples):
            out, context = [], [0] * block_size
            for _ in range(30):
                probs = F.softmax(model(torch.tensor([context])), dim=1)  # (1, V)
                ix = torch.multinomial(probs, 1, generator=g).item()
                if ix == 0:
                    break
                out.append(itos[ix])
                context = context[1:] + [ix]
            print(" ", "".join(out))


if __name__ == "__main__":
    main()
