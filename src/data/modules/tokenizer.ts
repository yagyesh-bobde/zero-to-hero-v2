import type { CourseModule } from '../../types';

export const tokenizerModule: CourseModule = {
  id: 'tokenizer',
  number: 8,
  title: 'The GPT tokenizer',
  subtitle: 'Build a byte-level BPE tokenizer and learn why so many LLM quirks start here.',
  description:
    'An original, hands-on companion to the "Let\'s build the GPT Tokenizer" lecture: you go from Unicode and UTF-8 bytes to a working byte-pair encoder with GPT-2 style pre-tokenization and safe special-token handling. Along the way you connect tokenizer design choices to real model failures. Watch the video for the full build.',
  duration: '2h13m',
  videoId: 'zduSFxRajkE',
  sourceTitle: "Let's build the GPT Tokenizer",
  topics: [
    'Unicode & UTF-8 bytes',
    'Byte-pair encoding',
    'Regex pre-tokenization & special tokens',
    'Tokenization-driven failures',
  ],
  project:
    'A pure-Python byte-level BPE tokenizer: a hand-written UTF-8 encoder, a merge trainer, rank-ordered encode and lossless decode, a GPT-2 style chunking regex, special-token handling with an allow-list, and small probes that expose digit-chunking and multilingual cost.',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'tokenizer-unicode-bytes',
      title: 'From Characters to Bytes',
      minutes: 10,
      summary:
        'Strings are sequences of Unicode code points, and UTF-8 turns each one into 1 to 4 bytes. Bytes give a tiny universal alphabet, but on their own they make sequences far too long.',
      sections: [
        {
          title: 'Text is a sequence of code points',
          body: `A Python string is a sequence of Unicode code points: integers the Unicode standard assigns to around 150,000 characters across scripts, symbols and emoji. ord('a') is 97, ord('€') is 8364 and ord('😀') is 128512. Using code points directly as token ids sounds simple, but the vocabulary would be enormous, it keeps changing as the standard grows, and most entries are so rare that a model would never learn useful vectors for them.`,
        },
        {
          title: 'UTF-8: one to four bytes',
          body: `An encoding maps each code point to bytes. UTF-8, the dominant encoding on the web, uses 1 byte for ASCII, 2 bytes up to U+07FF (accented Latin, Greek, Cyrillic, Arabic), 3 bytes up to U+FFFF (most CJK characters, the euro sign) and 4 bytes beyond that (emoji, rare scripts). The leading byte announces the length through its high bits (0xxxxxxx, 110xxxxx, 1110xxxx, 11110xxx) and every continuation byte has the form 10xxxxxx, carrying six payload bits. Plain ASCII text is unchanged, which is why UTF-8 won. UTF-16 and UTF-32 exist, but they waste space on ASCII-heavy text.`,
          formula: 'n_bytes(cp) = 1 if cp < 0x80, 2 if cp < 0x800, 3 if cp < 0x10000, else 4',
        },
        {
          title: 'Why raw bytes alone are not enough',
          body: `Treating bytes as tokens gives a fixed vocabulary of exactly 256 symbols that can represent any string ever written. The price is length: every character costs at least one token and non-Latin characters cost two to four. Attention cost grows with sequence length and the context window is finite, so a pure byte model sees much less text per forward pass. The goal is to keep the byte foundation, so nothing is ever out of vocabulary, while compressing frequent byte sequences into single tokens. That is the job of byte-pair encoding.`,
        },
        {
          title: 'Bytes first or characters first: SentencePiece and byte fallback',
          body: 'GPT-style tokenizers start from raw UTF-8 bytes: the 256 byte values are the base vocabulary, every merge joins bytes or earlier merges, and any string can be encoded with no special case. SentencePiece, the library behind Llama 1 and 2 (and many others), starts one level higher. Its base units are Unicode code points, and it merges those.\n\nThat choice brings three details worth knowing.\n\n- Normalization. Before anything else, SentencePiece can rewrite the text with a Unicode normalization rule (NFKC by default), which folds look-alike forms together: a full-width "Ａ" becomes "A", the ligature "ﬁ" becomes "fi". That shrinks the vocabulary but is lossy: after decoding you get the normalized text back, not the exact original characters. Llama\'s tokenizer turns normalization off ("identity") to stay faithful to the input.\n- Whitespace as a symbol. Spaces are replaced by the visible character "▁" (U+2581) and treated like any letter, so a decoded sequence restores spaces exactly. An option called add_dummy_prefix also puts "▁" at the very start, so "hello" at the start of a text gets the same tokens as " hello" in the middle.\n- Byte fallback. Code points are only added to the vocabulary if they are common enough (a character_coverage setting such as 0.99995). A rare character that did not make the cut would normally become an unknown token, which loses information. With byte_fallback turned on, as in Llama, the rare character is instead spelled out as its UTF-8 bytes using 256 reserved tokens named <0x00> to <0xFF>.\n\n```python\n# what byte fallback does for a character missing from the vocabulary\nch = "\\u0f04"                                   # a rare Tibetan mark\npieces = ["<0x%02X>" % b for b in ch.encode("utf-8")]\nprint(pieces)    # [\'<0xE0>\', \'<0xBC>\', \'<0x84>\'], three byte tokens, nothing lost\n```\n\nSo both families end up able to represent any text. The difference is the starting point: GPT merges bytes from the very beginning, while SentencePiece merges characters and only drops down to bytes for the rare leftovers.',
        },
      ],
      keyTakeaways: [
        'Strings are sequences of Unicode code points; UTF-8 encodes each as 1-4 bytes, with ASCII staying 1 byte.',
        'The first UTF-8 byte signals the length; continuation bytes always look like 10xxxxxx.',
        'A 256-symbol byte vocabulary covers everything but makes sequences long, which motivates compression with BPE.',
      ],
      quiz: [
        {
          question: 'How many bytes does UTF-8 use for the euro sign € (U+20AC)?',
          options: ['2', '3', '4', '1'],
          answer: 1,
          explanation:
            'U+20AC is above U+07FF but below U+10000, so it falls in the 3-byte range (E2 82 AC). Two bytes only reach U+07FF, and four bytes start at U+10000.',
        },
        {
          question: 'Why not simply use raw UTF-8 bytes as the tokens of a language model?',
          options: [
            'Some strings cannot be represented as bytes',
            'Bytes are only defined for English text',
            'A 256-entry embedding table is too large to train',
            'Sequences become very long, which wastes the finite context and increases attention cost',
          ],
          answer: 3,
          explanation:
            'Every string can be written as UTF-8 bytes, and 256 embeddings is tiny. The real problem is length: one or more tokens per character means far fewer characters fit into the context window.',
        },
      ],
      challenge: {
        title: 'Hand-roll a UTF-8 encoder',
        instructions:
          'Implement `encode_code_point(cp)` that returns the UTF-8 encoding of one integer code point as a `bytes` object, using bit operations (do not call `.encode`). Use 1 byte below 0x80, 2 below 0x800, 3 below 0x10000, otherwise 4. Raise `ValueError` if `cp < 0` or `cp > 0x10FFFF`. Then implement `utf8_len(text)` that returns the total number of UTF-8 bytes of a string by summing `len(encode_code_point(ord(ch)))` over its characters.',
        starter: String.raw`def encode_code_point(cp):
    """Return the UTF-8 bytes for integer code point cp.

    1 byte : 0xxxxxxx                              (cp < 0x80)
    2 bytes: 110xxxxx 10xxxxxx                     (cp < 0x800)
    3 bytes: 1110xxxx 10xxxxxx 10xxxxxx            (cp < 0x10000)
    4 bytes: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx   (cp <= 0x10FFFF)
    Raise ValueError if cp is out of range.
    """
    # TODO: use >> to shift, & 0x3F to keep 6 bits, | to add the marker bits
    raise NotImplementedError


def utf8_len(text):
    """Total number of UTF-8 bytes in text (use encode_code_point)."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def encode_code_point(cp):
    """Return the UTF-8 bytes for integer code point cp."""
    if cp < 0 or cp > 0x10FFFF:
        raise ValueError("code point out of range")
    if cp < 0x80:
        return bytes([cp])
    if cp < 0x800:
        return bytes([0xC0 | (cp >> 6), 0x80 | (cp & 0x3F)])
    if cp < 0x10000:
        return bytes([0xE0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)])
    return bytes([
        0xF0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3F),
        0x80 | ((cp >> 6) & 0x3F),
        0x80 | (cp & 0x3F),
    ])


def utf8_len(text):
    """Total number of UTF-8 bytes in text (use encode_code_point)."""
    return sum(len(encode_code_point(ord(ch))) for ch in text)
`,
        tests: String.raw`assert encode_code_point(65) == b"A", "ASCII 'A' should be the single byte 0x41"
assert encode_code_point(0xE9) == b"\xc3\xa9", "U+00E9 (e acute) should be 2 bytes C3 A9"
assert encode_code_point(0x20AC) == b"\xe2\x82\xac", "U+20AC (euro) should be 3 bytes E2 82 AC"
assert encode_code_point(0x1F600) == b"\xf0\x9f\x98\x80", "U+1F600 (emoji) should be 4 bytes F0 9F 98 80"
checks = [0, 0x7F, 0x80, 0x7FF, 0x800, 0xFFFF, 0x10000, 0x10FFFF] + list(range(0, 0x3000, 37)) + list(range(0x1F300, 0x1F700, 101))
for cp in checks:
    if 0xD800 <= cp <= 0xDFFF:
        continue
    assert encode_code_point(cp) == chr(cp).encode("utf-8"), "wrong encoding for code point %#x" % cp
for bad in (-1, 0x110000):
    try:
        encode_code_point(bad)
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError for %d" % bad)
assert utf8_len("") == 0, "empty string has 0 bytes"
assert utf8_len("hello") == 5, "ASCII is 1 byte per character"
assert utf8_len("héllo €\U0001F600") == 14, "1+2+1+1+1+1+3+4 = 14 bytes"
`,
        hint: 'Check the ranges from smallest to largest. For multi-byte forms, the lead byte is a marker OR the top bits (cp >> 6, >> 12 or >> 18), and each continuation byte is 0x80 | (next 6 bits & 0x3F).',
      },
      lab: 'tokenizer',
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'tokenizer-bpe-training',
      title: 'Training Byte-Pair Encoding',
      minutes: 13,
      summary:
        'BPE repeatedly finds the most frequent adjacent pair of token ids and replaces it with a new id. The ordered list of merges is the whole learned tokenizer.',
      sections: [
        {
          title: 'The core loop',
          body: `Start with the UTF-8 bytes of a training text, as a list of integers from 0 to 255. Count every adjacent pair (a, b). Take the most frequent pair, mint a new token id for it (the first is 256, then 257, and so on) and replace each occurrence of that pair, scanning left to right without overlap, with the new id. Record the rule (a, b) → new id and repeat. Each round shortens the sequence by the number of replacements made.`,
          formula: 'new_id = 256 + k for the k-th merge (k = 0, 1, 2, ...)',
        },
        {
          title: 'Tokens built from tokens',
          body: `Because later rounds count pairs over the already-merged sequence, a new token can combine earlier merged tokens. Frequent fragments grow into subwords, whole words and even common words with a leading space. The final vocabulary is 256 byte tokens plus one token per merge, so the number of merges is a hyperparameter you choose. The ordered merge table is the tokenizer's entire learned state, and it reflects its training data: a tokenizer trained mostly on English learns few merges for Hindi or Korean.`,
          formula: 'vocab_size = 256 + num_merges',
        },
        {
          title: 'Measuring compression',
          body: `The usual quality signal is the compression ratio: how many bytes each token covers on average. Higher means shorter sequences for the model. The ratio climbs quickly during the first merges, which capture very common pairs, and then improves more slowly as the remaining pairs get rarer.`,
          formula: 'compression_ratio = len(utf8_bytes) / len(token_ids)',
        },
        {
          title: 'Small but important details',
          body: `Ties need a deterministic rule; a simple one is to pick the pair that first appears earliest. Overlaps matter too: in [a, a, a] the pair (a, a) is replaced once from the left, giving [X, a], not two overlapping copies.`,
        },
        {
          title: 'Two ways to learn a vocabulary: BPE and Unigram',
          body: "The loop above is byte-pair encoding: a bottom-up method that starts tiny and keeps merging. SentencePiece supports BPE too (Llama 2's tokenizer is a SentencePiece BPE model over code points), but it also offers a different algorithm called Unigram, used for example by T5.\n\nUnigram goes top-down. It starts with a large set of candidate pieces (for instance, frequent substrings), gives each piece a probability, and treats a segmentation as a sequence of independent picks, so its probability is the product of the piece probabilities. Training alternates two steps: estimate the probabilities from the data, then remove the pieces whose removal hurts the total likelihood least, until the vocabulary reaches its target size. Single characters are always kept so everything stays encodable.\n\nEncoding differs too. BPE replays its merge list in rank order, which is deterministic. Unigram looks for the single most probable split of the text (a dynamic-programming search called Viterbi), and it can also sample other plausible splits during training, a trick called subword regularization that makes models more robust to segmentation.\n\n- BPE: grow the vocabulary by merging; encode by replaying merges in learned order.\n- Unigram: shrink a big vocabulary by pruning; encode by picking the most likely split.\n\nGPT-2, GPT-4 and the tokenizer you build in this module are all BPE.",
        },
      ],
      keyTakeaways: [
        'BPE training: count adjacent pairs, merge the most frequent into a new id starting at 256, repeat.',
        'Vocabulary size equals 256 plus the number of merges; merged tokens can contain other merged tokens.',
        'Compression ratio (bytes per token) measures how much shorter the sequences become.',
      ],
      quiz: [
        {
          question:
            'After training BPE with 1,000 merges on top of raw bytes, how many tokens are in the vocabulary?',
          options: ['1,000', '1,255', '1,256', '256'],
          answer: 2,
          explanation:
            'You always keep the 256 byte tokens, and each merge adds exactly one new token: 256 + 1,000 = 1,256. 1,255 would be an off-by-one from treating the first new id as 255 instead of 256.',
        },
        {
          question: 'Merging the pair (7, 7) into id 300 in the sequence [7, 7, 7, 5] gives:',
          options: ['[300, 7, 5]', '[300, 300, 5]', '[7, 300, 5]', '[300, 5]'],
          answer: 0,
          explanation:
            'The scan goes left to right and skips past a match once it is replaced, so the first two 7s become 300 and the third 7 is left alone. Overlapping matches cannot share the middle element.',
        },
      ],
      challenge: {
        title: 'Train a tiny BPE',
        instructions:
          'Implement three functions. `get_stats(ids)` returns a dict mapping each adjacent pair `(a, b)` to its count, with keys inserted in order of first appearance. `merge(ids, pair, idx)` returns a new list where every non-overlapping occurrence of `pair` (scanning left to right) is replaced by `idx`. `train_bpe(text, num_merges)` starts from `list(text.encode("utf-8"))`, performs up to `num_merges` merges (ids 256, 257, ...; stop early if fewer than 2 ids remain) choosing the most frequent pair each time, breaking ties by first appearance (`max(stats, key=stats.get)` does this), and returns `(ids, merges)` where `merges` maps pair -> new id.',
        starter: String.raw`def get_stats(ids):
    """Return {(a, b): count} for adjacent pairs, keys in first-appearance order."""
    # TODO
    raise NotImplementedError


def merge(ids, pair, idx):
    """Replace non-overlapping occurrences of pair (left to right) with idx."""
    # TODO
    raise NotImplementedError


def train_bpe(text, num_merges):
    """Return (ids, merges) after up to num_merges BPE merges on text's UTF-8 bytes."""
    ids = list(text.encode("utf-8"))
    merges = {}
    # TODO: loop, pick the most frequent pair, assign id 256 + i, merge
    raise NotImplementedError
`,
        solution: String.raw`def get_stats(ids):
    """Return {(a, b): count} for adjacent pairs, keys in first-appearance order."""
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts


def merge(ids, pair, idx):
    """Replace non-overlapping occurrences of pair (left to right) with idx."""
    out = []
    i = 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i + 1] == pair[1]:
            out.append(idx)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out


def train_bpe(text, num_merges):
    """Return (ids, merges) after up to num_merges BPE merges on text's UTF-8 bytes."""
    ids = list(text.encode("utf-8"))
    merges = {}
    for i in range(num_merges):
        if len(ids) < 2:
            break
        stats = get_stats(ids)
        pair = max(stats, key=stats.get)
        idx = 256 + i
        ids = merge(ids, pair, idx)
        merges[pair] = idx
    return ids, merges
`,
        tests: String.raw`assert get_stats([1, 2, 3, 1, 2]) == {(1, 2): 2, (2, 3): 1, (3, 1): 1}, "pair counts wrong"
assert list(get_stats([5, 6, 5, 6]).keys()) == [(5, 6), (6, 5)], "keys should be in first-appearance order"
assert get_stats([7]) == {}, "a single id has no pairs"
assert merge([1, 2, 3, 1, 2], (1, 2), 4) == [4, 3, 4], "basic merge wrong"
assert merge([7, 7, 7, 5], (7, 7), 300) == [300, 7, 5], "merges must not overlap"
assert merge([], (1, 2), 9) == [], "empty input stays empty"
ids, merges = train_bpe("aaabdaaabac", 3)
assert merges == {(97, 97): 256, (256, 97): 257, (257, 98): 258}, "merge table wrong: %r" % (merges,)
assert ids == [258, 100, 258, 97, 99], "final ids wrong: %r" % (ids,)
ids2, merges2 = train_bpe("ab", 5)
assert ids2 == [256] and merges2 == {(97, 98): 256}, "should stop early once a single id remains"
text = "the cat sat on the mat; the cat ate the rat"
ids3, merges3 = train_bpe(text, 10)
assert len(merges3) == 10 and sorted(merges3.values()) == list(range(256, 266)), "ids must be 256..265"
assert len(text.encode("utf-8")) / len(ids3) > 2.0, "10 merges should compress this text by more than 2x"
`,
        hint: 'Use zip(ids, ids[1:]) to walk adjacent pairs. In merge, use a while loop with an index and jump by 2 after a replacement so matches cannot overlap.',
      },
      lab: 'tokenizer',
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'tokenizer-encode-decode',
      title: 'Encoding and Decoding',
      minutes: 12,
      summary:
        "Decoding concatenates each token's bytes and decodes them as UTF-8, replacing invalid sequences. Encoding replays the learned merges on new text, always applying the earliest-learned mergeable pair first.",
      sections: [
        {
          title: 'Decoding: look up and concatenate',
          body: `Build a vocabulary that maps each id to its bytes. Ids 0-255 map to single bytes. Then walk the merges in the order they were learned: the token for (a, b) → idx has bytes vocab[a] + vocab[b]. Because a merge only ever refers to earlier ids, one pass fills everything. Decoding a list of ids is then just joining their byte strings and turning the result back into text.`,
          formula:
            'decode(ids) = utf8_decode(vocab[i_1] + vocab[i_2] + ... + vocab[i_n], errors="replace")',
        },
        {
          title: 'Invalid byte sequences',
          body: `Not every id sequence forms valid UTF-8. A model can sample a lone continuation byte such as 0x80, or only the first half of a multi-byte character. Strict decoding would raise UnicodeDecodeError and crash generation. Passing errors="replace" substitutes the replacement character U+FFFD (�) for each broken sequence, so you always get a string back.`,
        },
        {
          title: 'Encoding: apply merges by rank',
          body: `To encode, start from the text's bytes. Look at all adjacent pairs, keep only those that appear in the merge table, and pick the one with the lowest merge id, meaning the one learned earliest. Merge it everywhere, then repeat until no adjacent pair is mergeable. Order matters because later tokens were built from earlier ones during training; applying merges by rank reproduces how training would have segmented the text. Choosing by frequency in the new text would give different, inconsistent tokens.`,
        },
        {
          title: 'Round trips',
          body: `For any string, decode(encode(s)) == s. The reverse is not guaranteed: several id sequences can spell the same bytes, and encode always returns the canonical one.`,
        },
      ],
      keyTakeaways: [
        'The vocab is built by concatenating the bytes of each merged pair, in merge order.',
        'Decode with errors="replace" because sampled ids can form invalid UTF-8.',
        'Encode by repeatedly merging the present pair with the lowest merge rank until none apply.',
      ],
      quiz: [
        {
          question:
            'Merges are {(98, 99): 256, (97, 98): 257}. What does encoding the text "abc" (bytes 97, 98, 99) produce?',
          options: ['[257, 99]', '[97, 98, 99]', '[256, 257]', '[97, 256]'],
          answer: 3,
          explanation:
            'Both pairs (97, 98) and (98, 99) are present, but (98, 99) has the lower rank 256, so it is applied first, giving [97, 256]. No further merge applies. [257, 99] is what you would get by greedily merging from the left instead of by rank.',
        },
        {
          question: 'Why use errors="replace" when decoding token ids to text?',
          options: [
            'It makes decoding faster',
            'Some id sequences are not valid UTF-8, and strict decoding would raise an exception',
            'It converts special tokens into readable names',
            'It removes leading spaces from tokens',
          ],
          answer: 1,
          explanation:
            'A model can emit tokens whose bytes do not form complete UTF-8 characters. Replacement inserts U+FFFD instead of crashing. It has nothing to do with speed, special tokens or spaces.',
        },
      ],
      challenge: {
        title: 'Encode and decode with a merge table',
        instructions:
          'Helpers `get_stats` and `merge` are given. Implement `build_vocab(merges)` returning a dict id -> bytes (ids 0-255 are single bytes; for each `(a, b) -> idx` in insertion order, `vocab[idx] = vocab[a] + vocab[b]`). Implement `decode(ids, vocab)` returning a `str` decoded with `errors="replace"`. Implement `encode(text, merges)` returning a list of ids: start from the UTF-8 bytes and repeatedly merge the adjacent pair with the lowest merge id (only pairs present in `merges`) until no pair can be merged.',
        starter: String.raw`def get_stats(ids):
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts


def merge(ids, pair, idx):
    out, i = [], 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i + 1] == pair[1]:
            out.append(idx)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out


def build_vocab(merges):
    """Return {id: bytes} for the 256 byte tokens plus every merged token."""
    # TODO
    raise NotImplementedError


def decode(ids, vocab):
    """Concatenate token bytes and decode as UTF-8 with errors='replace'."""
    # TODO
    raise NotImplementedError


def encode(text, merges):
    """Apply merges to the UTF-8 bytes of text, lowest merge id first."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def get_stats(ids):
    counts = {}
    for pair in zip(ids, ids[1:]):
        counts[pair] = counts.get(pair, 0) + 1
    return counts


def merge(ids, pair, idx):
    out, i = [], 0
    while i < len(ids):
        if i < len(ids) - 1 and ids[i] == pair[0] and ids[i + 1] == pair[1]:
            out.append(idx)
            i += 2
        else:
            out.append(ids[i])
            i += 1
    return out


def build_vocab(merges):
    """Return {id: bytes} for the 256 byte tokens plus every merged token."""
    vocab = {i: bytes([i]) for i in range(256)}
    for (a, b), idx in merges.items():
        vocab[idx] = vocab[a] + vocab[b]
    return vocab


def decode(ids, vocab):
    """Concatenate token bytes and decode as UTF-8 with errors='replace'."""
    return b"".join(vocab[i] for i in ids).decode("utf-8", errors="replace")


def encode(text, merges):
    """Apply merges to the UTF-8 bytes of text, lowest merge id first."""
    ids = list(text.encode("utf-8"))
    while len(ids) >= 2:
        stats = get_stats(ids)
        pair = min(stats, key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break
        ids = merge(ids, pair, merges[pair])
    return ids
`,
        tests: String.raw`merges = {(97, 97): 256, (256, 97): 257, (257, 98): 258}
vocab = build_vocab(merges)
assert vocab[97] == b"a" and vocab[256] == b"aa" and vocab[257] == b"aaa" and vocab[258] == b"aaab", "vocab bytes wrong"
assert len(vocab) == 259, "vocab should have 256 + 3 entries"
assert encode("aaabdaaabac", merges) == [258, 100, 258, 97, 99], "encoding of training text wrong"
assert encode("aaaa", merges) == [256, 256], "(256, 256) is not a merge, so two 'aa' tokens remain"
assert encode("", merges) == [] and decode([], vocab) == "", "empty input edge case"
rank = {(98, 99): 256, (97, 98): 257}
assert encode("abc", rank) == [97, 256], "must apply the lowest-ranked merge first, not the leftmost pair"
# (97, 98) appears twice in "ababc" and (98, 99) only once: a frequency-based encoder would give [257, 257, 99].
assert encode("ababc", rank) == [257, 97, 256], "must pick merges by rank, not by how often a pair appears in the new text"
for s in ["aaabdaaabac", "hello wörld 😀", "abcabc", "a"]:
    assert decode(encode(s, merges), vocab) == s, "round trip failed for %r" % s
assert decode([0xE2, 0x82], vocab) == "�", "truncated 3-byte char should decode to one U+FFFD"
assert decode([104, 0x80, 105], vocab) == "h�i", "lone continuation byte should become U+FFFD"
`,
        hint: 'In encode, use min(stats, key=lambda p: merges.get(p, float("inf"))); if the winner is not in merges, nothing else can be merged and you are done.',
      },
      lab: 'tokenizer',
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'tokenizer-regex-pretokenization',
      title: 'Regex Pre-tokenization',
      minutes: 12,
      summary:
        'GPT-2 style tokenizers first cut text into chunks with a regex (contractions, letters, numbers, punctuation, whitespace) and only merge bytes inside each chunk, so tokens never cross category boundaries.',
      sections: [
        {
          title: 'The problem with merging freely',
          body: `Run BPE over a raw byte stream and the most frequent pairs happily cross word and punctuation boundaries. You end up with separate tokens for "dog.", "dog!" and "dog?", each mixing a word with punctuation. That spends vocabulary slots on near-duplicates and blurs meaning the model would rather see separately.`,
        },
        {
          title: 'Split first, merge within chunks',
          body: `GPT-2 applies a regular expression that cuts text into chunks, encodes each chunk's bytes on its own and concatenates the results. Pair counts during training are also gathered only inside chunks, so no merge can join bytes from two chunks. The pattern tries, in order: common English contractions ('s, 't, 're, 've, 'm, 'll, 'd), an optional space followed by letters, an optional space followed by digits, an optional space followed by other symbols, and runs of whitespace. Because the optional space belongs to the next word, " world" and "world" become different tokens.`,
          formula: "PAT = 's|'t|'re|'ve|'m|'ll|'d| ?L+| ?N+| ?[^\\s L N]+|\\s+(?!\\S)|\\s+",
        },
        {
          title: 'The whitespace lookahead',
          body: `The branch \\s+(?!\\S) matches whitespace that is not followed by a non-space character. On "   ok" it backs off by one, producing "  " and then " ok", so the final space still attaches to the word.`,
        },
        {
          title: 'Quirks and a standard-library version',
          body: `GPT-2's real pattern uses \\p{L} and \\p{N}, which need the third-party regex package; Python's built-in re has no \\p classes. A close std-lib substitute for "any Unicode letter" is [^\\W\\d_]: word characters minus digits and underscore. GPT-2's contractions are case-sensitive, so "HOW'S" splits differently from "how's". Later tokenizers made them case-insensitive and limited digit runs to three.`,
        },
        {
          title: 'What changed in the GPT-4 pattern',
          body: 'GPT-4\'s tokenizer (named cl100k_base in OpenAI\'s tiktoken library) keeps the same split-then-merge idea but uses a changed pattern. The details are specific to that one tokenizer version; GPT-2 used an older pattern, and later models (for example o200k_base) changed it again. Roughly, the differences from GPT-2 are:\n\n- Contractions are matched case-insensitively, so "HOW\'S" and "how\'s" split the same way.\n- Numbers are cut into groups of 1 to 3 digits, read left to right, and a digit group never carries a leading space. "1234567" becomes "123", "456", "7". Long numbers can no longer turn into one rare token, and the vocabulary needs at most 1,110 number tokens (all strings of 1 to 3 digits).\n- A separate rule groups whitespace that ends in newlines. Both GPT-2 and GPT-4 patterns keep runs of spaces together, but GPT-2’s vocabulary did not learn multi-space tokens. GPT-4’s vocabulary includes them, making common code indentation cheaper to encode.\n- A word can absorb one leading non-letter character that is not a newline, such as a space or an opening bracket.\n\nYou can see the digit rule with plain re:\n\n```python\nimport re\nprint(re.findall(r"\\d{1,3}", "1234567"))   # [\'123\', \'456\', \'7\']\nprint(re.findall(r"\\d{1,3}", "2024 vs 99999"))  # [\'202\', \'4\', \'999\', \'99\']\n```\n\nNotice "2024" splits as "202" + "4" and "99999" as "999" + "99", because the grouping starts from the left, not from the ones place. The exercise below stays with a simplified GPT-2 style pattern in Python\'s built-in re; the real GPT-4 pattern relies on \\p{L}, \\p{N} and possessive quantifiers that need the third-party regex module.',
        },
      ],
      keyTakeaways: [
        'Pre-tokenization splits text into chunks; BPE merges are learned and applied only within a chunk.',
        'GPT-2 chunks are contractions, optional-space + letters, optional-space + numbers, optional-space + symbols, and whitespace.',
        "Python's re lacks \\p{L}; [^\\W\\d_] matches Unicode letters using only the standard library.",
      ],
      quiz: [
        {
          question: 'With GPT-2 style pre-tokenization, how is "Hi  there" (two spaces) split?',
          options: [
            '["Hi", " ", " there"]',
            '["Hi", "  there"]',
            '["Hi", "  ", "there"]',
            '["Hi ", " there"]',
          ],
          answer: 0,
          explanation:
            'The whitespace lookahead leaves the last space for the word, so the first space is its own chunk and " there" keeps its leading space. "  there" is impossible because the letter branch allows at most one optional space.',
        },
        {
          question: 'What is the main reason to pre-tokenize with a regex before BPE?',
          options: [
            'It makes UTF-8 decoding unnecessary',
            'It guarantees every word becomes exactly one token',
            'It prevents merges from crossing boundaries between letters, numbers, punctuation and whitespace',
            'It lowers the vocabulary size to 256',
          ],
          answer: 2,
          explanation:
            'Merges only happen inside chunks, so tokens never fuse a word with punctuation or digits. Words can still be several tokens, and the vocabulary size is still set by the number of merges.',
        },
      ],
      challenge: {
        title: 'A std-lib GPT-2 style splitter',
        instructions:
          "Implement `pretokenize(text)` returning a list of chunks via `re.findall` with a pattern whose alternatives are tried in this order: the contractions `'s 't 're 've 'm 'll 'd`; an optional single space then one or more Unicode letters (use `[^\\W\\d_]`); an optional space then digits (`\\d+`); an optional space then one or more characters that are not whitespace, letters or digits (underscore counts as a symbol); whitespace not followed by a non-space (`\\s+(?!\\S)`); any other whitespace (`\\s+`). Joining the chunks must reproduce `text`. Then implement `chunk_pair_counts(text)` returning a `collections.Counter` of adjacent UTF-8 byte pairs counted inside each chunk only.",
        starter: String.raw`import re
from collections import Counter


def pretokenize(text):
    """Split text into GPT-2 style chunks using only the standard library re."""
    # TODO: build the pattern and return re.findall(pattern, text)
    raise NotImplementedError


def chunk_pair_counts(text):
    """Counter of adjacent byte pairs, counted within each chunk only."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import re
from collections import Counter

PAT = re.compile(r"""'s|'t|'re|'ve|'m|'ll|'d| ?[^\W\d_]+| ?\d+| ?(?:[^\s\w]|_)+|\s+(?!\S)|\s+""")


def pretokenize(text):
    """Split text into GPT-2 style chunks using only the standard library re."""
    return PAT.findall(text)


def chunk_pair_counts(text):
    """Counter of adjacent byte pairs, counted within each chunk only."""
    counts = Counter()
    for chunk in pretokenize(text):
        b = list(chunk.encode("utf-8"))
        counts.update(zip(b, b[1:]))
    return counts
`,
        tests: String.raw`assert pretokenize("Hello world's 123 apples!!!   ok") == ["Hello", " world", "'s", " 123", " apples", "!!!", "  ", " ok"], "basic GPT-2 style split wrong"
assert pretokenize("we're done") == ["we", "'re", " done"], "contractions should split off"
assert pretokenize("naïve café") == ["naïve", " café"], "accented letters are letters"
assert pretokenize("hello\n\nworld") == ["hello", "\n", "\n", "world"], "newline handling wrong"
assert pretokenize("abc123def") == ["abc", "123", "def"], "letters and digits must be separate chunks"
assert pretokenize("x_y") == ["x", "_", "y"], "underscore is a symbol, not a letter"
assert pretokenize("") == [], "empty text gives no chunks"
for t in ["  lead and trail  ", "tabs\tand\nnewlines\n", "你好, world! 42x", "a_b__c ;; d"]:
    assert "".join(pretokenize(t)) == t, "chunks must join back to the original: %r" % t
c = chunk_pair_counts("ab ab")
assert c[(97, 98)] == 2 and c[(32, 97)] == 1, "pair counts inside chunks wrong"
assert (98, 32) not in c, "pair (b, space) crosses a chunk boundary and must not be counted"
assert sum(chunk_pair_counts("dog. dog!").values()) == 2 + 3, "'dog' has 2 pairs, ' dog' has 3, punctuation chunks have none"
`,
        hint: 'Write the pattern as a raw string and put the alternatives in the listed order; for symbols use (?:[^\\s\\w]|_)+ so underscore is included. For the counts, encode each chunk separately and zip its bytes with themselves shifted by one.',
      },
      lab: 'tokenizer',
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'tokenizer-special-tokens',
      title: 'Special Tokens and Safety',
      minutes: 11,
      summary:
        'Special tokens such as <|endoftext|> live outside BPE, must be split out before pre-tokenization, and should only be recognized in trusted text, or users can forge structure.',
      sections: [
        {
          title: 'Tokens outside the merge table',
          body: `Some ids carry structure rather than text. <|endoftext|> marks the boundary between training documents so the model learns that what follows is unrelated. Chat models add more, such as markers for the start and end of each message. These ids are appended after the BPE vocabulary; GPT-2 has 50,257 tokens: 256 bytes, 50,000 merges and one special. No merge ever produces them, and adding a new one to a trained model means growing the embedding table and the output layer by one row each.`,
          formula: 'vocab_size = 256 + num_merges + num_special',
        },
        {
          title: 'Split on specials before pre-tokenization',
          body: `If the regex ran first, "<|endoftext|>" would be shredded into chunks like "<|", "endoftext" and "|>", and ordinary BPE would encode those pieces. So the encoder first splits the text on exact occurrences of the allowed special strings, emits their ids directly, and sends only the pieces in between through pre-tokenization and merges.`,
        },
        {
          title: 'A security boundary',
          body: `If text from users is scanned for special strings, a user can type "<|endoftext|>" or a fake role marker and forge structure: end the conversation early, pretend to be the system, or inject instructions. This is prompt injection at the tokenizer level. Careful libraries refuse by default: tiktoken raises an error when a special string appears in text unless you list it in allowed_special, and it offers encode_ordinary, which treats everything as plain text. The safe rule: only markers your own code inserts become special ids, and untrusted text is always encoded as ordinary text.`,
        },
      ],
      keyTakeaways: [
        'Special tokens get ids outside the BPE merges and require extra rows in the embedding and output layers.',
        'Split text on allowed special strings before running the pre-tokenization regex.',
        'Never let untrusted text become special ids: use an allow-list and encode user input as ordinary text.',
      ],
      quiz: [
        {
          question: 'Why must special tokens be split out before regex pre-tokenization?',
          options: [
            'The regex cannot handle ASCII characters',
            'Otherwise the regex would break "<|endoftext|>" into pieces that BPE encodes as ordinary text',
            'Special tokens have to be lowercased first',
            'Pre-tokenization removes all punctuation',
          ],
          answer: 1,
          explanation:
            'The regex splits on character categories, so "<|", "endoftext" and "|>" would land in separate chunks and become normal tokens. The regex handles ASCII fine and removes nothing; it only splits.',
        },
        {
          question:
            'A chat app encodes user messages with special-token parsing enabled for all specials. What is the risk?',
          options: [
            'Messages will use more tokens',
            'Non-English text can no longer be encoded',
            'The tokenizer will run out of merges',
            'Users can type special strings to forge message boundaries or roles, a form of prompt injection',
          ],
          answer: 3,
          explanation:
            'If "<|endoftext|>" or a role marker typed by a user becomes the real special id, the model sees forged structure. Token count and language support are unaffected; the problem is trust.',
        },
      ],
      challenge: {
        title: 'Encode with an allow-list of special tokens',
        instructions:
          'The helper `encode_ordinary(text)` (plain UTF-8 byte ids, standing in for regex + BPE) is given. Implement `encode(text, specials, allowed_special)`. `specials` maps special strings to ids; `allowed_special` is either the string `"all"` or a set of special strings. If any special string that is NOT allowed occurs in `text`, raise `ValueError`. Otherwise split `text` on occurrences of the allowed specials (use `re.split` with a capturing group of `re.escape`d strings, longest first), emit the special id for each special piece, and `encode_ordinary` for every other non-empty piece. Return the list of ids.',
        starter: String.raw`import re


def encode_ordinary(text):
    """Treat everything as plain text (stand-in for regex + BPE)."""
    return list(text.encode("utf-8"))


def encode(text, specials, allowed_special):
    """Encode text, turning only allowed special strings into special ids.

    specials: dict like {"<|endoftext|>": 301}
    allowed_special: "all" or a set of special strings
    Raise ValueError if a disallowed special string appears in text.
    """
    # TODO: 1) work out the allowed set  2) reject disallowed specials
    #       3) re.split on allowed specials and encode each piece
    raise NotImplementedError
`,
        solution: String.raw`import re


def encode_ordinary(text):
    """Treat everything as plain text (stand-in for regex + BPE)."""
    return list(text.encode("utf-8"))


def encode(text, specials, allowed_special):
    """Encode text, turning only allowed special strings into special ids."""
    allowed = set(specials) if allowed_special == "all" else set(allowed_special)
    for s in specials:
        if s not in allowed and s in text:
            raise ValueError("disallowed special token in text: " + s)
    if not allowed:
        return encode_ordinary(text)
    ordered = sorted(allowed, key=len, reverse=True)
    pattern = "(" + "|".join(re.escape(s) for s in ordered) + ")"
    ids = []
    for piece in re.split(pattern, text):
        if piece in allowed:
            ids.append(specials[piece])
        elif piece:
            ids.extend(encode_ordinary(piece))
    return ids
`,
        tests: String.raw`S = {"<|user|>": 300, "<|endoftext|>": 301}
assert encode("hi<|endoftext|>yo", S, {"<|endoftext|>"}) == [104, 105, 301, 121, 111], "allowed special should map to its id"
assert encode("<|user|>a<|endoftext|><|endoftext|>", S, "all") == [300, 97, 301, 301], "'all' allows every special, including adjacent ones"
assert encode("plain text", S, set()) == list(b"plain text"), "no specials present: ordinary bytes"
assert encode("", S, "all") == [], "empty text gives no ids"
for text, allowed in [("x<|endoftext|>", set()), ("<|user|>hi<|endoftext|>", {"<|endoftext|>"})]:
    try:
        encode(text, S, allowed)
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError for disallowed special in %r" % text)
assert len(encode_ordinary("<|user|>")) == 8, "encode_ordinary treats a special string as 8 plain bytes"
assert encode("a<|b", S, "all") == [97, 60, 124, 98], "partial special-looking text is ordinary"
`,
        hint: 'Build the allowed set first, then check `s in text` for every special that is not allowed. With a capturing group, re.split keeps the matched specials in its output list, so you can tell them apart by checking membership in the allowed set.',
      },
      lab: 'tokenizer',
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'tokenizer-vocab-tradeoffs',
      title: 'Vocabulary Size and Tokenizer-Driven Failures',
      minutes: 12,
      summary:
        'Vocabulary size trades parameter and softmax cost against sequence length. Many puzzling LLM failures, from spelling to arithmetic to glitch tokens, trace back to how text was tokenized.',
      sections: [
        {
          title: 'Choosing a vocabulary size',
          body: `Every token needs a row in the embedding table and a column in the output layer, and each generation step computes a softmax over all V logits. A bigger vocabulary shortens sequences, so more text fits in the context and attention does less work, but it adds parameters, makes the output layer more expensive and leaves each token rarer in training data, so its vector gets fewer updates. A smaller vocabulary does the opposite. Practical choices sit between tens of thousands and a few hundred thousand tokens.`,
          formula: 'vocab params ≈ V·d (tied) or 2·V·d (untied embedding + output layer)',
        },
        {
          title: 'The model never sees letters',
          body: `A word may be one or two tokens, so spelling it, counting its letters or reversing it requires the model to have memorized what characters each token contains. Asking it to write the characters out separately first often helps. Text in languages the tokenizer saw less of splits into many more tokens, which costs more and fits less in context. GPT-2 also encoded each space of Python indentation separately, wasting context on code.`,
        },
        {
          title: 'Numbers and trailing whitespace',
          body: `Digits are chunked inconsistently: one four-digit number may be a single token while a neighbour is two, so place values do not line up across examples. Some tokenizers split every digit or cap chunks at three. Because spaces attach to the following word, a prompt ending in a space leaves a lone space token rarely seen in training, an "unstable" boundary that hurts completions.`,
        },
        {
          title: 'Glitch tokens',
          body: `"SolidGoldMagikarp" became a token because it was frequent in the tokenizer's data but almost absent from the model's training data. Its embedding was barely trained, so prompts containing it produced erratic output.`,
        },
      ],
      keyTakeaways: [
        'Larger vocabularies shorten sequences but cost parameters, softmax compute and per-token training signal.',
        'Spelling, multilingual cost, code indentation and arithmetic problems often come from tokenization.',
        'Trailing spaces and undertrained glitch tokens push the model into input patterns it barely saw in training.',
      ],
      quiz: [
        {
          question: 'Which is a cost of making the vocabulary much larger?',
          options: [
            'Sequences get longer',
            'The model can no longer encode emoji',
            'The embedding table and output softmax grow, and each token appears less often in training',
            'Attention becomes quadratic in vocabulary size',
          ],
          answer: 2,
          explanation:
            'Both the embedding and output layers scale with V, and rarer tokens get fewer gradient updates. Sequences actually get shorter with a bigger vocabulary, and attention cost depends on sequence length, not V.',
        },
        {
          question: 'Why can a prompt that ends with a trailing space make completions worse?',
          options: [
            'In training, spaces usually attach to the start of the next word, so a lone trailing space token is unusual input',
            'Trailing spaces are removed by the tokenizer and the prompt gets truncated',
            'Spaces are treated as special tokens',
            'The softmax cannot output a space',
          ],
          answer: 0,
          explanation:
            'Tokens like " world" carry their leading space, so a prompt ending in a separate space token puts the model in a rare state. The tokenizer does not drop the space or treat it as special.',
        },
      ],
      challenge: {
        title: 'Probe vocab cost, digit chunking and byte cost',
        instructions:
          'Implement three small functions. `vocab_params(vocab_size, n_embd, tied)` returns the number of parameters in the token embedding plus output layer weights: `vocab_size * n_embd` if `tied` is True, otherwise twice that. `chunk_digits(s, k, from_right)` splits a digit string into chunks of at most `k` characters, grouping from the left (`"12345", 3, False -> ["123", "45"]`) or from the right (`"12345", 3, True -> ["12", "345"]`); return `[]` for an empty string. `bytes_per_char(text)` returns UTF-8 bytes divided by number of characters as a float, and `0.0` for empty text.',
        starter: String.raw`def vocab_params(vocab_size, n_embd, tied):
    """Embedding + output layer weights (no biases)."""
    # TODO
    raise NotImplementedError


def chunk_digits(s, k, from_right):
    """Split digit string s into chunks of at most k, from the left or right."""
    # TODO
    raise NotImplementedError


def bytes_per_char(text):
    """Average UTF-8 bytes per character (0.0 for empty text)."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def vocab_params(vocab_size, n_embd, tied):
    """Embedding + output layer weights (no biases)."""
    per_matrix = vocab_size * n_embd
    return per_matrix if tied else 2 * per_matrix


def chunk_digits(s, k, from_right):
    """Split digit string s into chunks of at most k, from the left or right."""
    if not from_right:
        return [s[i:i + k] for i in range(0, len(s), k)]
    first = len(s) % k
    chunks = [s[:first]] if first else []
    return chunks + [s[i:i + k] for i in range(first, len(s), k)]


def bytes_per_char(text):
    """Average UTF-8 bytes per character (0.0 for empty text)."""
    if not text:
        return 0.0
    return len(text.encode("utf-8")) / len(text)
`,
        tests: String.raw`import math
assert vocab_params(50257, 768, False) == 2 * 50257 * 768, "untied: embedding and output layer are separate"
assert vocab_params(50257, 768, True) == 50257 * 768, "tied: one shared matrix"
assert vocab_params(100000, 768, False) - vocab_params(50000, 768, False) == 76800000, "doubling V from 50k adds 76.8M untied params"
assert chunk_digits("1234567", 3, False) == ["123", "456", "7"], "left-to-right chunking wrong"
assert chunk_digits("1234567", 3, True) == ["1", "234", "567"], "right-to-left chunking wrong"
assert chunk_digits("12345", 3, False) == ["123", "45"] and chunk_digits("12345", 3, True) == ["12", "345"], "5 digits"
assert chunk_digits("123456", 3, True) == ["123", "456"], "exact multiple from the right"
assert chunk_digits("98", 1, True) == ["9", "8"], "k=1 splits every digit"
assert chunk_digits("", 3, False) == [] and chunk_digits("", 3, True) == [], "empty string"
assert math.isclose(bytes_per_char("hello"), 1.0, rel_tol=1e-6), "ASCII is 1 byte per char"
assert math.isclose(bytes_per_char("привет"), 2.0, rel_tol=1e-6), "Cyrillic is 2 bytes per char"
assert math.isclose(bytes_per_char("你好"), 3.0, rel_tol=1e-6), "CJK is 3 bytes per char"
assert math.isclose(bytes_per_char("hi\U0001F600"), 2.0, rel_tol=1e-6), "(1 + 1 + 4) / 3 = 2.0"
assert bytes_per_char("") == 0.0, "empty text"
`,
        hint: 'For right-to-left chunking, the first chunk holds len(s) % k digits (if any) and every later chunk is exactly k digits long.',
      },
      lab: 'tokenizer',
    },
  ],
};
