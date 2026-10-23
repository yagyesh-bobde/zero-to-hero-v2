"""
batchnorm.py - a deeper name MLP with a hand-written BatchNorm1d and health checks.

Chapter 4 of the Zero to Hero course project pack.

What it shows
  * Small explicit modules (Embedding, Flatten, Linear, BatchNorm1d, Tanh)
    with __call__ and parameters(), like a mini torch.nn.
  * BatchNorm in TRAINING mode: normalize with this batch's mean/var and
    update running estimates. In INFERENCE mode: use the running estimates,
    so one example at a time works and outputs do not depend on the batch.
  * A check that our layer matches torch.nn.BatchNorm1d.
  * Diagnostics per tanh layer: activation mean/std, % saturated (|t|>0.97),
    gradient std, and the update-to-data ratio of each weight.

Usage
  python batchnorm.py                   # defaults: 1500 steps
  python batchnorm.py --steps 2         # quick smoke test
  python batchnorm.py --no-batchnorm    # same net without BN, compare diagnostics

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


# ---- explicit modules ------------------------------------------------------
class Embedding:
    def __init__(self, num, dim, g):
        self.weight = torch.randn((num, dim), generator=g)

    def __call__(self, ix):
        self.out = self.weight[ix]  # (B, T) -> (B, T, dim)
        return self.out

    def parameters(self):
        return [self.weight]


class Flatten:
    def __call__(self, x):
        self.out = x.view(x.shape[0], -1)  # (B, T, dim) -> (B, T*dim)
        return self.out

    def parameters(self):
        return []


class Linear:
    def __init__(self, fan_in, fan_out, g, bias=True, gain=1.0):
        # Kaiming-style init: divide by sqrt(fan_in) so the output std stays
        # about the same as the input std; `gain` compensates for tanh squash.
        self.weight = torch.randn((fan_in, fan_out), generator=g) * gain / fan_in ** 0.5
        self.bias = torch.zeros(fan_out) if bias else None

    def __call__(self, x):
        self.out = x @ self.weight  # (B, fan_in) @ (fan_in, fan_out) -> (B, fan_out)
        if self.bias is not None:
            self.out = self.out + self.bias
        return self.out

    def parameters(self):
        return [self.weight] + ([] if self.bias is None else [self.bias])


class BatchNorm1d:
    def __init__(self, dim, eps=1e-5, momentum=0.1):
        self.eps, self.momentum = eps, momentum
        self.training = True
        self.gamma = torch.ones(dim)  # learned scale
        self.beta = torch.zeros(dim)  # learned shift
        # Buffers, not parameters: updated with a moving average, no gradient.
        self.running_mean = torch.zeros(dim)
        self.running_var = torch.ones(dim)

    def __call__(self, x):
        if self.training:
            mean = x.mean(0, keepdim=True)  # (B, dim) -> (1, dim): one per feature
            var = x.var(0, keepdim=True, unbiased=False)  # biased var to normalize
        else:
            mean, var = self.running_mean, self.running_var
        xhat = (x - mean) / torch.sqrt(var + self.eps)  # each feature ~ zero mean, unit var
        self.out = self.gamma * xhat + self.beta
        if self.training:
            with torch.no_grad():
                # PyTorch tracks the UNBIASED variance in its running estimate,
                # so we do too (that is what the comparison below checks).
                unbiased = x.var(0, keepdim=True, unbiased=True)
                m = self.momentum
                self.running_mean = (1 - m) * self.running_mean + m * mean.squeeze(0)
                self.running_var = (1 - m) * self.running_var + m * unbiased.squeeze(0)
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
        self.out = x
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

    def train(self, mode=True):
        for layer in self.layers:
            if isinstance(layer, BatchNorm1d):
                layer.training = mode


# ---- helpers ----------------------------------------------------------------
def build_dataset(words, block_size, stoi):
    X, Y = [], []
    for w in words:
        context = [0] * block_size
        for ch in w + ".":
            X.append(context)
            Y.append(stoi[ch])
            context = context[1:] + [stoi[ch]]
    return torch.tensor(X), torch.tensor(Y)  # (N, block_size), (N,)


def check_against_torch(g):
    ours = BatchNorm1d(5)
    ref = torch.nn.BatchNorm1d(5)
    for _ in range(3):
        x = torch.randn((16, 5), generator=g) * 3 + 2
        same_out = torch.allclose(ours(x), ref(x), atol=1e-5)
    same_stats = torch.allclose(ours.running_mean, ref.running_mean, atol=1e-5) and torch.allclose(
        ours.running_var, ref.running_var, atol=1e-5)
    ours.training = False
    ref.eval()
    x = torch.randn((4, 5), generator=g)
    same_eval = torch.allclose(ours(x), ref(x), atol=1e-5)
    print("matches torch.nn.BatchNorm1d -> train output %s, running stats %s, eval output %s" % (
        same_out, same_stats, same_eval))
    assert same_out and same_stats and same_eval


def diagnostics(model, lr):
    print("\n%-14s %8s %8s %10s %10s" % ("tanh layer", "mean", "std", "saturated", "grad std"))
    for i, layer in enumerate(model.layers):
        if isinstance(layer, Tanh):
            t = layer.out
            sat = (t.abs() > 0.97).float().mean().item() * 100
            gstd = t.grad.std().item() if t.grad is not None else float("nan")
            print("%-14s %+8.3f %8.3f %9.1f%% %10.2e" % ("layer %d" % i, t.mean().item(), t.std().item(), sat, gstd))
    print("\nupdate:data ratio per weight matrix (log10; around -3 is healthy):")
    for i, layer in enumerate(model.layers):
        if isinstance(layer, Linear) and layer.weight.grad is not None:
            w = layer.weight
            ratio = (lr * w.grad).std() / w.data.std()
            print("  layer %d weight %-12s log10 ratio %.2f" % (i, tuple(w.shape), torch.log10(ratio).item()))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=1500, help="training steps (default 1500)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--block-size", type=int, default=3)
    parser.add_argument("--n-embd", type=int, default=10)
    parser.add_argument("--n-hidden", type=int, default=64)
    parser.add_argument("--n-layers", type=int, default=3, help="hidden Linear+BN+Tanh blocks")
    parser.add_argument("--lr", type=float, default=0.1)
    parser.add_argument("--no-batchnorm", action="store_true", help="drop BN layers (Linear gets a bias instead)")
    parser.add_argument("--samples", type=int, default=10)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    g = torch.Generator().manual_seed(args.seed)
    check_against_torch(g)

    words = NAMES[:]
    random.Random(args.seed).shuffle(words)
    itos = ["."] + sorted(set("".join(words)))
    stoi = {ch: i for i, ch in enumerate(itos)}
    V = len(itos)
    n1 = int(0.9 * len(words))
    Xtr, Ytr = build_dataset(words[:n1], args.block_size, stoi)
    Xva, Yva = build_dataset(words[n1:], args.block_size, stoi)

    # ---- model: Embedding -> Flatten -> [Linear -> BN -> Tanh] x n -> Linear --
    use_bn = not args.no_batchnorm
    layers = [Embedding(V, args.n_embd, g), Flatten()]
    fan_in = args.block_size * args.n_embd
    for _ in range(args.n_layers):
        # With BN right after, a Linear bias is useless: BN subtracts the mean.
        layers.append(Linear(fan_in, args.n_hidden, g, bias=not use_bn, gain=5 / 3))
        if use_bn:
            layers.append(BatchNorm1d(args.n_hidden))
        layers.append(Tanh())
        fan_in = args.n_hidden
    layers.append(Linear(fan_in, V, g))
    model = Sequential(layers)
    with torch.no_grad():
        layers[-1].weight *= 0.1  # unsure output at init -> loss near ln(V)
    params = model.parameters()
    for p in params:
        p.requires_grad = True
    print("model: %d layers, %d parameters, batchnorm=%s" % (len(layers), sum(p.nelement() for p in params), use_bn))

    # ---- training --------------------------------------------------------------
    lr = args.lr
    for step in range(args.steps):
        ix = torch.randint(0, Xtr.shape[0], (args.batch_size,), generator=g)
        loss = F.cross_entropy(model(Xtr[ix]), Ytr[ix])
        for layer in layers:
            if isinstance(layer, Tanh):
                layer.out.retain_grad()  # keep activation grads for diagnostics
        for p in params:
            p.grad = None
        loss.backward()
        lr = args.lr if step < 0.75 * args.steps else args.lr / 10
        with torch.no_grad():
            for p in params:
                p -= lr * p.grad
        if step % max(1, args.steps // 10) == 0 or step == args.steps - 1:
            print("step %5d/%d | batch loss %.4f" % (step, args.steps, loss.item()))

    diagnostics(model, lr)  # uses the activations/grads from the last batch

    # ---- evaluation: switch BN to inference mode --------------------------------
    @torch.no_grad()
    def split_loss(X, Y):
        return F.cross_entropy(model(X), Y).item()

    model.train(False)
    print("\neval mode (running stats): train %.4f | val %.4f" % (split_loss(Xtr, Ytr), split_loss(Xva, Yva)))
    if use_bn:
        bn = next(layer for layer in layers if isinstance(layer, BatchNorm1d))
        with torch.no_grad():
            model.train(True)
            momentum, bn.momentum = bn.momentum, 0.0  # look at batch stats without updating
            model(Xtr)
            model.train(False)
            bn.momentum = momentum
            pre_bn = layers[layers.index(bn) - 1].out  # (N, n_hidden) Linear output
        gap = (pre_bn.mean(0) - bn.running_mean).abs().max().item()
        print("first BN: max |full-train mean - running mean| = %.4f (small = good estimate)" % gap)

    # One example at a time only works in eval mode (a batch of 1 has no variance).
    print("\nsamples (eval mode, one example at a time):")
    with torch.no_grad():
        for _ in range(args.samples):
            out, context = [], [0] * args.block_size
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
