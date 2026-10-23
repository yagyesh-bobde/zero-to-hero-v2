"""
bigram.py - a character-level bigram name model with nothing but counting.

Chapter 2 of the Zero to Hero course project pack.

What it shows
  * Turning words into character pairs with a '.' start/end token.
  * A 27 x 27 count table: N[a][b] = how often b follows a.
  * Add-k smoothing so unseen pairs never get probability 0.
  * Average negative log-likelihood (NLL) as the model's score.
  * Sampling new names one character at a time.

Usage
  python bigram.py                         # defaults: smoothing 0.3, 10 samples
  python bigram.py --smoothing 0           # see why smoothing matters (inf NLL)
  python bigram.py --smoothing 5           # too much smoothing flattens the table
  python bigram.py --samples 20 --seed 3
  python bigram.py --data my_names.txt     # one lowercase name per line

No third-party packages. The bundled names list is tiny on purpose: it
demonstrates the mechanics, not model quality.
"""

import argparse
import math
import random

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

BOUNDARY = "."  # marks both "start of name" and "end of name"


def build_vocab(words):
    chars = sorted(set("".join(words)))
    itos = [BOUNDARY] + chars  # index 0 is the boundary token
    stoi = {ch: i for i, ch in enumerate(itos)}
    return stoi, itos


def pairs(word):
    # "emma" -> ".emma." -> (.,e) (e,m) (m,m) (m,a) (a,.)
    chs = [BOUNDARY] + list(word) + [BOUNDARY]
    return zip(chs, chs[1:])


def count_table(words, stoi):
    V = len(stoi)
    N = [[0] * V for _ in range(V)]  # rows: current char, cols: next char
    for w in words:
        for a, b in pairs(w):
            N[stoi[a]][stoi[b]] += 1
    return N


def to_probs(N, smoothing):
    # Add `smoothing` to every cell, then normalize each row so it sums to 1.
    # Each row is a probability distribution over "what comes next".
    P = []
    for row in N:
        smoothed = [c + smoothing for c in row]
        total = sum(smoothed)
        P.append([c / total if total > 0 else 0.0 for c in smoothed])
    return P


def nll(words, P, stoi):
    """Average negative log-likelihood per character pair (lower is better)."""
    total, n = 0.0, 0
    for w in words:
        for a, b in pairs(w):
            p = P[stoi[a]][stoi[b]] if a in stoi and b in stoi else 0.0
            total += -math.log(p) if p > 0 else math.inf
            n += 1
    return total / n


def sample(P, itos, rng, max_len=20):
    out, ix = [], 0  # start from the boundary token
    for _ in range(max_len):
        ix = rng.choices(range(len(itos)), weights=P[ix])[0]
        if ix == 0:  # sampled the end token
            break
        out.append(itos[ix])
    return "".join(out)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--smoothing", type=float, default=0.3, help="add-k smoothing (default 0.3)")
    parser.add_argument("--samples", type=int, default=10, help="names to sample (default 10)")
    parser.add_argument("--seed", type=int, default=42, help="random seed (default 42)")
    parser.add_argument("--data", help="optional text file with one name per line")
    args = parser.parse_args()

    words = NAMES
    if args.data:
        with open(args.data, encoding="utf-8") as f:
            words = [line.strip().lower() for line in f if line.strip()]

    rng = random.Random(args.seed)
    words = words[:]
    rng.shuffle(words)
    split = int(0.9 * len(words))
    train_words, val_words = words[:split], words[split:]

    # Build the vocabulary from ALL words so validation never hits an unknown
    # character; the counts themselves come only from the training split.
    stoi, itos = build_vocab(words)
    N = count_table(train_words, stoi)
    P = to_probs(N, args.smoothing)
    print("%d names (%d train / %d val), vocab size %d" % (len(words), len(train_words), len(val_words), len(itos)))

    top = sorted(((N[i][j], itos[i] + itos[j]) for i in range(len(itos)) for j in range(len(itos))), reverse=True)[:8]
    print("most common pairs:", ", ".join("%s=%d" % (pair, c) for c, pair in top))

    print("uniform guess NLL: %.4f  (= ln %d)" % (math.log(len(itos)), len(itos)))
    print("train NLL:         %.4f" % nll(train_words, P, stoi))
    print("val NLL:           %.4f" % nll(val_words, P, stoi))
    if args.smoothing == 0:
        print("(with smoothing 0, any unseen pair has p=0, so its NLL is infinite)")

    print("\nsamples:")
    for _ in range(args.samples):
        print(" ", sample(P, itos, rng) or "(empty)")


if __name__ == "__main__":
    main()
