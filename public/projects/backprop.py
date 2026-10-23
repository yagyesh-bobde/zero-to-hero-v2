"""
backprop.py - backpropagate a 2-layer BatchNorm MLP by hand, checked against autograd.

Chapter 5 of the Zero to Hero course project pack.

What it shows
  * A forward pass broken into small named steps (embedding, concat, linear,
    batchnorm pieces, tanh, linear, a hand-built softmax cross-entropy).
  * The backward pass for EVERY step written out manually, then compared to
    the gradients PyTorch's autograd computes.
  * Shortcut ("fused") backward formulas for cross-entropy and batchnorm.
  * A short training run that uses ONLY the manual gradients.

Usage
  python backprop.py                 # check all grads, then 300 manual-grad steps
  python backprop.py --steps 2       # quick smoke test
  python backprop.py --steps 0       # only the gradient checks

Needs PyTorch only. We use float64 so "matches autograd" means ~1e-12 error,
not float32 rounding noise. The bundled names are tiny on purpose: this
demonstrates the mechanics, not model quality.
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

DTYPE = torch.float64
EPS = 1e-5


def build_dataset(words, block_size, stoi):
    X, Y = [], []
    for w in words:
        context = [0] * block_size
        for ch in w + ".":
            X.append(context)
            Y.append(stoi[ch])
            context = context[1:] + [stoi[ch]]
    return torch.tensor(X), torch.tensor(Y)


def init_params(V, block_size, n_embd, n_hidden, g):
    p = {
        "C": torch.randn((V, n_embd), generator=g, dtype=DTYPE),
        "W1": torch.randn((block_size * n_embd, n_hidden), generator=g, dtype=DTYPE) * (5 / 3) / (block_size * n_embd) ** 0.5,
        # b1 is pointless before batchnorm (BN subtracts the mean); we keep it to
        # show its gradient comes out as ~0.
        "b1": torch.randn(n_hidden, generator=g, dtype=DTYPE) * 0.1,
        "W2": torch.randn((n_hidden, V), generator=g, dtype=DTYPE) * 0.1,
        "b2": torch.randn(V, generator=g, dtype=DTYPE) * 0.1,
        # Non-trivial gain/bias so their gradients are interesting.
        "bngain": 1.0 + torch.randn((1, n_hidden), generator=g, dtype=DTYPE) * 0.1,
        "bnbias": torch.randn((1, n_hidden), generator=g, dtype=DTYPE) * 0.1,
    }
    for t in p.values():
        t.requires_grad = True
    return p


def forward(p, Xb, Yb):
    """Forward pass in tiny steps. Returns loss and every intermediate tensor."""
    B = Xb.shape[0]
    t = {}
    t["emb"] = p["C"][Xb]  # (B, T, E)
    t["embcat"] = t["emb"].view(B, -1)  # (B, T*E): concatenate the context vectors
    t["hprebn"] = t["embcat"] @ p["W1"] + p["b1"]  # (B, H)
    # --- batchnorm, one operation at a time (statistics over the batch dim 0)
    t["bnmeani"] = t["hprebn"].sum(0, keepdim=True) / B  # (1, H)
    t["bndiff"] = t["hprebn"] - t["bnmeani"]  # (B, H), broadcast over rows
    t["bndiff2"] = t["bndiff"] ** 2  # (B, H)
    t["bnvar"] = t["bndiff2"].sum(0, keepdim=True) / B  # (1, H) biased variance, like torch BN
    t["bnvar_inv"] = (t["bnvar"] + EPS) ** -0.5  # (1, H)
    t["bnraw"] = t["bndiff"] * t["bnvar_inv"]  # (B, H)
    t["hpreact"] = p["bngain"] * t["bnraw"] + p["bnbias"]  # (B, H)
    t["h"] = torch.tanh(t["hpreact"])  # (B, H)
    t["logits"] = t["h"] @ p["W2"] + p["b2"]  # (B, V)
    # --- cross-entropy by hand
    t["logit_maxes"] = t["logits"].max(1, keepdim=True).values  # (B, 1)
    t["norm_logits"] = t["logits"] - t["logit_maxes"]  # subtract max for numerical safety
    t["counts"] = t["norm_logits"].exp()  # (B, V)
    t["counts_sum"] = t["counts"].sum(1, keepdim=True)  # (B, 1)
    t["counts_sum_inv"] = t["counts_sum"] ** -1  # (B, 1)
    t["probs"] = t["counts"] * t["counts_sum_inv"]  # (B, V), rows sum to 1
    t["logprobs"] = t["probs"].log()  # (B, V)
    loss = -t["logprobs"][range(B), Yb].mean()  # pick the correct class per row
    return loss, t


def manual_backward(p, t, Xb, Yb):
    """Every local derivative, in reverse order. d<name> = dloss/d<name>."""
    B, V = t["logits"].shape
    d = {}
    # loss = -mean(logprobs[i, Yb[i]]): only the picked entries get gradient
    d["logprobs"] = torch.zeros_like(t["logprobs"])
    d["logprobs"][range(B), Yb] = -1.0 / B
    d["probs"] = d["logprobs"] / t["probs"]  # d log(x) = 1/x
    # probs = counts * counts_sum_inv  ((B,V) * (B,1) broadcast -> sum over V)
    d["counts_sum_inv"] = (t["counts"] * d["probs"]).sum(1, keepdim=True)
    d["counts"] = t["counts_sum_inv"] * d["probs"]
    d["counts_sum"] = -t["counts_sum"] ** -2 * d["counts_sum_inv"]
    d["counts"] = d["counts"] + d["counts_sum"]  # counts also feeds counts_sum (broadcast back)
    d["norm_logits"] = t["counts"] * d["counts"]  # d exp(x) = exp(x)
    d["logit_maxes"] = -d["norm_logits"].sum(1, keepdim=True)
    # logits feeds norm_logits directly AND through max(); the max only routes
    # gradient to the position that was the max.
    d["logits"] = d["norm_logits"] + F.one_hot(t["logits"].max(1).indices, V).to(DTYPE) * d["logit_maxes"]
    # logits = h @ W2 + b2
    d["h"] = d["logits"] @ p["W2"].T  # (B,V) @ (V,H) -> (B,H)
    d["W2"] = t["h"].T @ d["logits"]  # (H,B) @ (B,V) -> (H,V)
    d["b2"] = d["logits"].sum(0)  # b2 was broadcast over B rows
    d["hpreact"] = (1.0 - t["h"] ** 2) * d["h"]  # d tanh
    # hpreact = bngain * bnraw + bnbias  ((1,H) params broadcast over B)
    d["bngain"] = (t["bnraw"] * d["hpreact"]).sum(0, keepdim=True)
    d["bnbias"] = d["hpreact"].sum(0, keepdim=True)
    d["bnraw"] = p["bngain"] * d["hpreact"]
    # bnraw = bndiff * bnvar_inv
    d["bnvar_inv"] = (t["bndiff"] * d["bnraw"]).sum(0, keepdim=True)
    d["bndiff"] = t["bnvar_inv"] * d["bnraw"]
    d["bnvar"] = -0.5 * (t["bnvar"] + EPS) ** -1.5 * d["bnvar_inv"]
    d["bndiff2"] = torch.ones_like(t["bndiff2"]) / B * d["bnvar"]
    d["bndiff"] = d["bndiff"] + 2 * t["bndiff"] * d["bndiff2"]  # bndiff is used twice
    # bndiff = hprebn - bnmeani
    d["bnmeani"] = -d["bndiff"].sum(0, keepdim=True)
    d["hprebn"] = d["bndiff"] + torch.ones_like(t["hprebn"]) / B * d["bnmeani"]
    # hprebn = embcat @ W1 + b1
    d["embcat"] = d["hprebn"] @ p["W1"].T
    d["W1"] = t["embcat"].T @ d["hprebn"]
    d["b1"] = d["hprebn"].sum(0)
    d["emb"] = d["embcat"].view(t["emb"].shape)  # undo the concat: (B, T*E) -> (B, T, E)
    # emb = C[Xb]: each row of C gets the sum of grads from every place it was used
    d["C"] = torch.zeros_like(p["C"])
    d["C"].index_add_(0, Xb.view(-1), d["emb"].view(-1, p["C"].shape[1]))
    return d


def fused_logits_grad(logits, Yb):
    # Cross-entropy shortcut: dloss/dlogits = (softmax - one_hot) / B
    B = logits.shape[0]
    dlogits = F.softmax(logits, 1)
    dlogits[range(B), Yb] -= 1
    return dlogits / B


def fused_bn_grad(p, t, dhpreact):
    # Batchnorm shortcut (biased variance): one line instead of eight.
    B = dhpreact.shape[0]
    bnraw = t["bnraw"]
    return p["bngain"] * t["bnvar_inv"] / B * (
        B * dhpreact - dhpreact.sum(0, keepdim=True) - bnraw * (dhpreact * bnraw).sum(0, keepdim=True))


def cmp(name, ours, ref):
    exact = torch.equal(ours, ref)
    close = torch.allclose(ours, ref, rtol=1e-9, atol=1e-12)
    maxdiff = (ours - ref).abs().max().item()
    print("  %-15s exact: %-5s | approx: %-5s | maxdiff: %.1e" % (name, exact, close, maxdiff))
    return close


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=300, help="manual-gradient training steps (default 300)")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=0.1)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    block_size, n_embd, n_hidden = 3, 10, 64
    words = NAMES[:]
    random.Random(args.seed).shuffle(words)
    itos = ["."] + sorted(set("".join(words)))
    stoi = {ch: i for i, ch in enumerate(itos)}
    n1 = int(0.9 * len(words))
    Xtr, Ytr = build_dataset(words[:n1], block_size, stoi)
    Xva, Yva = build_dataset(words[n1:], block_size, stoi)

    g = torch.Generator().manual_seed(args.seed)
    p = init_params(len(itos), block_size, n_embd, n_hidden, g)
    ix = torch.randint(0, Xtr.shape[0], (args.batch_size,), generator=g)
    Xb, Yb = Xtr[ix], Ytr[ix]

    # ---- 1) autograd reference: keep the grad of every intermediate too -----
    loss, t = forward(p, Xb, Yb)
    for v in t.values():
        v.retain_grad()
    loss.backward()
    print("batch loss %.6f; torch F.cross_entropy agrees: %s" % (
        loss.item(), abs(loss.item() - F.cross_entropy(t["logits"], Yb).item()) < 1e-12))

    # ---- 2) our manual backward, compared step by step ------------------------
    with torch.no_grad():
        d = manual_backward(p, t, Xb, Yb)
    ok = True
    print("\nintermediates (manual vs autograd):")
    for name in t:
        ok &= cmp(name, d[name], t[name].grad)
    print("\nparameters (manual vs autograd):")
    for name in p:
        ok &= cmp(name, d[name], p[name].grad)
    print("  |b1 grad| max = %.1e (BN cancels any bias before it)" % d["b1"].abs().max().item())

    print("\nfused shortcuts:")
    with torch.no_grad():
        ok &= cmp("logits (fused)", fused_logits_grad(t["logits"], Yb), t["logits"].grad)
        ok &= cmp("hprebn (fused)", fused_bn_grad(p, t, t["hpreact"].grad), t["hprebn"].grad)
    print("\nall gradients match autograd:", ok)
    if not ok:
        raise SystemExit(1)

    if args.steps <= 0:
        return

    # ---- 3) train with manual gradients only (no loss.backward) ------------
    print("\ntraining %d steps with manual gradients only:" % args.steps)
    with torch.no_grad():
        for v in p.values():
            v.requires_grad = False
        running_mean = torch.zeros((1, n_hidden), dtype=DTYPE)
        running_var = torch.ones((1, n_hidden), dtype=DTYPE)
        for step in range(args.steps):
            ix = torch.randint(0, Xtr.shape[0], (args.batch_size,), generator=g)
            Xb, Yb = Xtr[ix], Ytr[ix]
            loss, t = forward(p, Xb, Yb)
            d = manual_backward(p, t, Xb, Yb)
            lr = args.lr if step < 0.75 * args.steps else args.lr / 10
            for name in p:
                p[name] -= lr * d[name]
            running_mean = 0.9 * running_mean + 0.1 * t["bnmeani"]
            running_var = 0.9 * running_var + 0.1 * t["bnvar"]
            if step % max(1, args.steps // 6) == 0 or step == args.steps - 1:
                print("  step %4d/%d | batch loss %.4f" % (step, args.steps, loss.item()))

        # Evaluate with running BN statistics (inference mode).
        def split_loss(X, Y):
            h = p["C"][X].view(X.shape[0], -1) @ p["W1"] + p["b1"]
            h = torch.tanh(p["bngain"] * (h - running_mean) * (running_var + EPS) ** -0.5 + p["bnbias"])
            return F.cross_entropy(h @ p["W2"] + p["b2"], Y).item()

        print("train loss %.4f | val loss %.4f" % (split_loss(Xtr, Ytr), split_loss(Xva, Yva)))


if __name__ == "__main__":
    main()
