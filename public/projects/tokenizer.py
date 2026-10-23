"""
tokenizer.py - a byte-level BPE (byte pair encoding) tokenizer in pure Python.

Chapter 8 of the Zero to Hero course project pack.

What it shows
  * Text -> UTF-8 bytes, so the starting vocabulary is just 256 byte values
    and ANY string (emoji, Hindi, Chinese...) can be encoded.
  * Training: repeatedly find the most common adjacent pair and merge it
    into a new token id (256, 257, ...).
  * Encoding: apply learned merges in the order they were learned (rank).
  * Decoding: join token bytes back together and decode UTF-8.
  * A simple pre-split (words, numbers, punctuation, spaces) so merges never
    glue the end of one word to the start of the next.

Usage
  python tokenizer.py                              # train on bundled text, run checks
  python tokenizer.py --vocab-size 400
  python tokenizer.py --text "héllo wörld 👋 नमस्ते"   # encode/decode your own string
  python tokenizer.py --train-file my_corpus.txt --no-split

No third-party packages. The bundled corpus is tiny on purpose: it
demonstrates the mechanics, not a production tokenizer.
"""

import argparse
import re

CORPUS = """
A tokenizer turns text into a list of numbers, and a model only ever sees
those numbers. We start from raw bytes, so every possible character already
has a home in the first 256 ids. Then we look for the pair of neighbours that
appears most often, give that pair a brand new id, and replace it everywhere.
Repeat the merge again and again, and common pieces like "the", "ing" and
" token" become single tokens. Rare words still work, because they simply
fall back to smaller pieces, and in the worst case to single bytes.
Merging the most frequent pair, then the next, then the next: that is the
whole training loop. Encoding applies the same merges in the same order.
Decoding glues the bytes back together. The tokenizer is trained before the
model and lives beside it, and many strange model behaviours start here:
spelling, counting letters, arithmetic, spaces, and text in other languages.
Café, naïve, jalapeño, 東京, नमस्ते and 🙂 are all just bytes to begin with.
"""

# Pre-split pattern (stdlib `re`; \w is Unicode-aware in Python 3):
#   optional space + letters | optional space + digits |
#   optional space + other symbols | whitespace runs
SPLIT_PATTERN = re.compile(r" ?[^\W\d_]+| ?\d+| ?[^\s\w]+|\s+(?!\S)|\s+")


def get_stats(chunks, counts=None):
    """Count adjacent pairs across every chunk: {(a, b): count}."""
    counts = {} if counts is None else counts
    for ids in chunks:
        for pair in zip(ids, ids[1:]):
            counts[pair] = counts.get(pair, 0) + 1
    return counts


def merge(ids, pair, new_id):
    """Replace every occurrence of `pair` in `ids` with `new_id`."""
    out, i = [], 0
    while i < len(ids):
        if i + 1 < len(ids) and ids[i] == pair[0] and ids[i + 1] == pair[1]:
            out.append(new_id)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out


class BPETokenizer:
    def __init__(self, use_split=True):
        self.use_split = use_split
        self.merges = {}  # (id_a, id_b) -> new_id; insertion order == rank
        self.vocab = {i: bytes([i]) for i in range(256)}  # id -> bytes

    def _chunks(self, text):
        pieces = SPLIT_PATTERN.findall(text) if self.use_split else [text]
        return [list(p.encode("utf-8")) for p in pieces]

    def train(self, text, vocab_size, verbose=False):
        assert vocab_size >= 256, "vocab must at least hold the 256 raw bytes"
        chunks = self._chunks(text)
        for new_id in range(256, vocab_size):
            stats = get_stats(chunks)
            if not stats:
                break  # nothing left to merge
            # Most frequent pair; ties go to the smallest pair so training is
            # deterministic no matter how the dict was filled.
            pair = max(stats, key=lambda p: (stats[p], -p[0], -p[1]))
            if stats[pair] < 2:
                break  # merging a pair seen once saves nothing
            chunks = [merge(ids, pair, new_id) for ids in chunks]
            self.merges[pair] = new_id
            self.vocab[new_id] = self.vocab[pair[0]] + self.vocab[pair[1]]
            if verbose:
                print("  merge %3d: %-14r + %-14r -> %r (seen %d times)" % (
                    new_id, self.vocab[pair[0]], self.vocab[pair[1]], self.vocab[new_id], stats[pair]))

    def _encode_chunk(self, ids):
        while len(ids) >= 2:
            # Of the pairs present, pick the one learned EARLIEST (lowest id).
            # Later merges may depend on earlier ones, so order matters.
            pair = min(zip(ids, ids[1:]), key=lambda p: self.merges.get(p, float("inf")))
            if pair not in self.merges:
                break  # no learned merge applies anymore
            ids = merge(ids, pair, self.merges[pair])
        return ids

    def encode(self, text):
        out = []
        for ids in self._chunks(text):
            out.extend(self._encode_chunk(ids))
        return out

    def decode(self, ids):
        data = b"".join(self.vocab[i] for i in ids)
        # A hand-made id list may cut a multi-byte character in half;
        # errors="replace" shows that as U+FFFD instead of crashing.
        return data.decode("utf-8", errors="replace")


def piece_repr(b):
    # A token can hold part of a multi-byte character, so show raw bytes
    # when the piece is not valid UTF-8 on its own.
    try:
        return repr(b.decode("utf-8"))
    except UnicodeDecodeError:
        return str(b)


def show(tok, text):
    ids = tok.encode(text)
    pieces = [piece_repr(tok.vocab[i]) for i in ids]
    n_bytes = len(text.encode("utf-8"))
    print("  text   : %r" % text)
    print("  tokens : %d (from %d bytes, ratio %.2fx)" % (len(ids), n_bytes, n_bytes / max(1, len(ids))))
    print("  pieces : %s" % " | ".join(pieces))
    ok = tok.decode(ids) == text
    print("  round trip ok: %s" % ok)
    return ok


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--vocab-size", type=int, default=320, help="final vocab size, >= 256 (default 320)")
    parser.add_argument("--text", help="a string to encode and decode after training")
    parser.add_argument("--train-file", help="optional UTF-8 file to train on instead of the bundled corpus")
    parser.add_argument("--no-split", action="store_true", help="train on raw text without the word pre-split")
    parser.add_argument("--show-merges", type=int, default=12, help="how many merges to print (default 12)")
    args = parser.parse_args()

    corpus = CORPUS
    if args.train_file:
        with open(args.train_file, encoding="utf-8") as f:
            corpus = f.read()

    tok = BPETokenizer(use_split=not args.no_split)
    tok.train(corpus, args.vocab_size)
    print("trained %d merges on %d bytes -> vocab size %d" % (len(tok.merges), len(corpus.encode("utf-8")), len(tok.vocab)))
    print("first merges:")
    for (a, b), new_id in list(tok.merges.items())[: args.show_merges]:
        print("  %3d: %r + %r -> %r" % (new_id, tok.vocab[a], tok.vocab[b], tok.vocab[new_id]))

    samples = [args.text] if args.text is not None else [
        "the tokenizer merges the most frequent pair",
        "Unseen words: zygote, quixotic, 2026!",
        "Ünïcödé: 日本語, हिन्दी, Ελληνικά, emoji 🧠🚀 and a tab\tend",
        "",
    ]
    print("\nencode -> decode checks:")
    all_ok = True
    for s in samples:
        all_ok &= show(tok, s)
        print()

    # 0xE2 is the first byte of a 3-byte character; alone it is not valid UTF-8.
    print("decode([0xE2]) on half a character ->", repr(tok.decode([0xE2])))
    print("all round trips ok:", all_ok)
    if not all_ok:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
