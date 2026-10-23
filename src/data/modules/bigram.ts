import type { CourseModule } from '../../types';

export const bigramModule: CourseModule = {
  id: 'bigram',
  number: 2,
  title: 'The bigram model',
  subtitle:
    'Build a character-level name generator by counting, then rebuild it as a tiny neural network.',
  description:
    'An original, hands-on companion to the lecture on building makemore: you model names one character at a time, first by counting letter pairs and then by training a one-layer network with gradient descent. Each lesson pairs a short conceptual read with a pure-Python exercise. Watch the video for the full build in a tensor library.',
  duration: '1h57m',
  videoId: 'PaCmpygFfXo',
  sourceTitle: 'The spelled-out intro to language modeling: building makemore',
  topics: [
    'Bigram counting',
    'Tensors & broadcasting',
    'Sampling & negative log-likelihood',
    'Neural bigram with softmax',
  ],
  project:
    'A pure-Python bigram toolkit: bigram extraction, a 27×27 count matrix, broadcasting-safe normalization, a smoothed seeded name sampler, an average-NLL evaluator, and a softmax model trained by gradient descent that recovers the counting model.',
  lessons: [
    {
      id: 'bigram-dataset',
      title: 'Names, Special Tokens, and Bigrams',
      minutes: 9,
      summary:
        'Turn a list of names into training pairs by marking where each name starts and ends, then sliding a two-character window across it.',
      sections: [
        {
          title: 'A dataset of names',
          body: 'A language model assigns probabilities to sequences. Here the sequences are first names such as “emma” or “olivia”, and the units are single characters. A character-level model is small enough to inspect by hand, which makes it ideal for learning the whole loop: data, model, evaluation, and generation. A name is more than a bag of letters. Order matters, and so does position: some letters are common at the start of names, others are common at the end.',
        },
        {
          title: 'Marking beginnings and endings',
          body: "If the model only sees letter pairs inside a word, it never learns how names start or when they should stop. The fix is a special token. We wrap every name in '.' on both sides, so “emma” becomes “.emma.”. The leading dot lets the model learn which first letters are likely; the trailing dot lets it learn when to finish. A single token can do both jobs because its meaning depends on position: as the first element of a pair it means “start”, as the second it means “end”. Choosing a character that never appears inside names keeps it unambiguous.",
        },
        {
          title: 'Extracting bigrams',
          body: 'A bigram is a pair of consecutive tokens (previous, next). Sliding a window of width two over “.emma.” gives (., e), (e, m), (m, m), (m, a), (a, .). A name with n letters always produces n + 1 bigrams. The bigram model assumes the next character depends only on the one directly before it. That is a strong simplification which throws away longer context, but it produces a clean, fully understandable baseline that every later model must beat.',
          formula: 'P(c1 … cn) ≈ Π_t P(c_t | c_{t-1}),  with c_0 = c_{n+1} = "."',
        },
      ],
      keyTakeaways: [
        "Wrapping each name in a '.' token lets one model learn both how names start and how they end.",
        'A name with n characters yields n + 1 bigrams (previous, next).',
        'The bigram assumption: the next character depends only on the current one.',
      ],
      quiz: [
        {
          question: "Why do we add the '.' token to both ends of every name?",
          options: [
            'To make every name the same length',
            'Because the model cannot handle vowels at the edges',
            'So the model can learn which characters start names and when names end',
            'To separate first names from last names',
          ],
          answer: 2,
          explanation:
            "Pairs like ('.', 'e') record how names begin and pairs like ('a', '.') record how they end. Without the token, generation would have no way to start or stop. It does not pad names to equal length; names keep their natural lengths.",
        },
        {
          question:
            'How many bigrams does the name “olivia” produce after adding the start and end token?',
          options: ['6', '7', '8', '12'],
          answer: 1,
          explanation:
            '“.olivia.” has 8 tokens, and a window of width two over 8 tokens gives 7 pairs. In general n letters give n + 1 bigrams. 6 forgets one of the boundary pairs.',
        },
      ],
      challenge: {
        title: 'Extract bigrams from names',
        instructions:
          "Implement `extract_bigrams(words)`. For each word in order, wrap it as '.' + word + '.' and collect every consecutive pair as a tuple `(prev, next)`. Return one flat list of tuples covering all words in their original order. An empty word still contributes one bigram: ('.', '.'). An empty list of words returns [].",
        starter: String.raw`def extract_bigrams(words):
    """Return a list of (prev, next) character tuples for all words.

    Each word is wrapped as '.' + word + '.' before pairing.
    """
    # TODO: loop over words, wrap with '.', and pair consecutive characters
    raise NotImplementedError
`,
        solution: String.raw`def extract_bigrams(words):
    """Return a list of (prev, next) character tuples for all words.

    Each word is wrapped as '.' + word + '.' before pairing.
    """
    pairs = []
    for w in words:
        chars = ['.'] + list(w) + ['.']
        for a, b in zip(chars, chars[1:]):
            pairs.append((a, b))
    return pairs
`,
        tests: String.raw`from collections import Counter

got = extract_bigrams(['emma'])
assert got == [('.', 'e'), ('e', 'm'), ('m', 'm'), ('m', 'a'), ('a', '.')], "emma bigrams wrong: %r" % (got,)

got = extract_bigrams(['ab', 'xyz'])
assert got == [('.', 'a'), ('a', 'b'), ('b', '.'), ('.', 'x'), ('x', 'y'), ('y', 'z'), ('z', '.')], "order across words wrong: %r" % (got,)

names = ['olivia', 'ava', 'anna', 'mia']
got = extract_bigrams(names)
assert len(got) == sum(len(n) + 1 for n in names), "each name of length n must give n + 1 bigrams"
c = Counter(got)
assert c[('a', '.')] == 4, "four names end in 'a'"
assert c[('.', 'a')] == 2, "two names start with 'a'"
assert c[('n', 'n')] == 1, "'anna' contains one ('n', 'n')"

assert extract_bigrams([]) == [], "no words -> no bigrams"
assert extract_bigrams(['']) == [('.', '.')], "empty word -> single ('.', '.') bigram"
`,
        hint: "Build the padded sequence ['.'] + list(word) + ['.'] and use zip(seq, seq[1:]) to walk over neighbouring pairs.",
      },
      lab: 'bigram',
    },
    {
      id: 'bigram-count-matrix',
      title: 'The 27×27 Count Matrix',
      minutes: 10,
      summary:
        'Map characters to integer indices and tally every bigram into a square table that is, by itself, the entire counting model.',
      sections: [
        {
          title: 'From characters to integers',
          body: "Arrays are indexed by integers, not letters, so we need two lookup tables. stoi (string to index) maps each token to a number, and itos (index to string) maps it back. A tidy convention puts '.' at index 0 and the letters a to z at 1 to 26 in sorted order. Building the vocabulary from the data itself, as the sorted set of characters that actually appear, keeps the code honest if the dataset contains something unexpected.",
        },
        {
          title: 'Counting into a grid',
          body: 'With 27 tokens there are 27 × 27 = 729 possible bigrams, so we keep a 27×27 matrix N of zeros and add one to N[i][j] every time token j follows token i. Row i then describes everything that follows character i, and column j describes everything that precedes character j. Row 0 holds start-of-name counts (which letters begin names), and column 0 holds end-of-name counts (which letters finish them).',
          formula: 'for each bigram (a, b):  N[stoi[a]][stoi[b]] += 1',
        },
        {
          title: 'Reading the matrix',
          body: 'The grand total of N equals the number of bigrams in the dataset. A row total tells you how often a character appears as the “previous” token. Many cells stay at zero: N[0][0], for example, would require an empty name. Those zeros look harmless now, but once counts become probabilities they will mean “impossible”, and that causes trouble during evaluation. Everything that follows (probabilities, sampling, the loss) is derived from this one table.',
        },
      ],
      keyTakeaways: [
        "stoi and itos translate between tokens and indices, with '.' conventionally at index 0.",
        'N[i][j] counts how many times token j followed token i; row 0 is starts, column 0 is ends.',
        'The count matrix is the whole counting model; zero cells will need attention later.',
      ],
      quiz: [
        {
          question: "With '.' at index 0, what does column 0 of the count matrix tell you?",
          options: [
            'How often each character appears anywhere in a name',
            'Which characters most often start a name',
            'How many names are in the dataset, per letter',
            'How often each character is the last letter of a name',
          ],
          answer: 3,
          explanation:
            "Column 0 holds N[i][0], the count of bigrams (character i, '.'), meaning character i was followed by the end token. That is the last-letter statistic. Starts live in row 0, not column 0.",
        },
        {
          question:
            'Why build the vocabulary as sorted(set(all characters)) instead of hard-coding a to z?',
          options: [
            'Sorting makes the counts larger',
            'It adapts to the actual data, and sorting makes the index assignment deterministic',
            'Hard-coded alphabets are slower to index',
            "It removes the need for a '.' token",
          ],
          answer: 1,
          explanation:
            "A set has no reliable order, so sorting guarantees the same index every run. Deriving it from the data also catches unexpected characters (hyphens, accents) instead of crashing on a missing key. You still add '.' separately.",
        },
      ],
      challenge: {
        title: 'Build stoi/itos and the count matrix',
        instructions:
          "Implement `build_vocab(words)` returning `(stoi, itos)`: stoi is a dict mapping '.' to 0 and each distinct character in the words, in sorted order, to 1, 2, 3, …; itos is the reverse dict (int -> str). Then implement `count_matrix(words, stoi)` returning a V×V list of lists of ints (V = len(stoi)) where entry [i][j] counts how often token j followed token i, after wrapping each word as '.' + word + '.'.",
        starter: String.raw`def build_vocab(words):
    """Return (stoi, itos). '.' -> 0, then sorted distinct characters -> 1, 2, ..."""
    # TODO: collect distinct characters, sort them, assign indices
    raise NotImplementedError


def count_matrix(words, stoi):
    """Return a V x V list of lists where N[i][j] counts bigram (itos[i], itos[j])."""
    # TODO: start from zeros, then add 1 for every bigram in '.' + w + '.'
    raise NotImplementedError
`,
        solution: String.raw`def build_vocab(words):
    """Return (stoi, itos). '.' -> 0, then sorted distinct characters -> 1, 2, ..."""
    chars = sorted(set(''.join(words)))
    stoi = {'.': 0}
    for i, ch in enumerate(chars):
        stoi[ch] = i + 1
    itos = {i: s for s, i in stoi.items()}
    return stoi, itos


def count_matrix(words, stoi):
    """Return a V x V list of lists where N[i][j] counts bigram (itos[i], itos[j])."""
    V = len(stoi)
    N = [[0] * V for _ in range(V)]
    for w in words:
        chars = ['.'] + list(w) + ['.']
        for a, b in zip(chars, chars[1:]):
            N[stoi[a]][stoi[b]] += 1
    return N
`,
        tests: String.raw`stoi, itos = build_vocab(['zebra', 'abe'])
assert stoi == {'.': 0, 'a': 1, 'b': 2, 'e': 3, 'r': 4, 'z': 5}, "stoi wrong: %r" % (stoi,)
assert itos == {0: '.', 1: 'a', 2: 'b', 3: 'e', 4: 'r', 5: 'z'}, "itos wrong: %r" % (itos,)

words = ['ab', 'ba', 'a']
stoi, itos = build_vocab(words)
N = count_matrix(words, stoi)
assert len(N) == 3 and all(len(r) == 3 for r in N), "matrix must be 3x3"
expected = [
    [0, 2, 1],  # '.' -> a twice (ab, a), '.' -> b once (ba)
    [2, 0, 1],  # a -> '.' twice (ba, a), a -> b once (ab)
    [1, 1, 0],  # b -> '.' once (ab), b -> a once (ba)
]
assert N == expected, "counts wrong: %r" % (N,)

names = ['emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia']
stoi, itos = build_vocab(names)
N = count_matrix(names, stoi)
assert sum(sum(r) for r in N) == sum(len(n) + 1 for n in names), "total must equal number of bigrams"
assert sum(N[0]) == len(names), "row 0 (starts) must sum to the number of names"
assert sum(N[i][0] for i in range(len(N))) == len(names), "column 0 (ends) must sum to the number of names"
assert N[stoi['l']][stoi['l']] == 1, "'isabella' has one 'll'"
assert N[stoi['a']][0] == 6, "all six names end in 'a'"
assert N[0][0] == 0, "no empty names, so ('.', '.') never occurs"
`,
        hint: "Use sorted(set(''.join(words))) for the characters and enumerate starting at 1. For counting, create [[0] * V for _ in range(V)] (not [[0] * V] * V, which shares one row).",
      },
      lab: 'bigram',
    },
    {
      id: 'bigram-tensors-broadcasting',
      title: 'Tensors, Row Sums, and Broadcasting',
      minutes: 12,
      summary:
        'Learn how shapes govern whole-array operations, and why a missing keepdim silently normalizes the wrong thing.',
      sections: [
        {
          title: 'Tensors as shaped grids',
          body: 'A tensor is a multi-dimensional array with a shape. Our count matrix has shape (27, 27); indexing one row gives shape (27,), and indexing a row and column gives a scalar. Tensor libraries apply an operation to every element at once, which is far faster than Python loops, but only if you keep track of shapes.',
        },
        {
          title: 'Summing along a dimension',
          body: 'Summing over dimension 1 adds across the columns and gives one total per row. With keepdim the result keeps a size-1 axis and has shape (27, 1), a column. Without it the axis is dropped and the shape is (27,), a flat vector. The numbers are identical; only the shape differs, and the shape decides what the next operation does.',
        },
        {
          title: 'Broadcasting rules',
          body: "To combine tensors of different shapes, line the shapes up from the right. Each pair of sizes must be equal, or one of them must be 1, or one must be missing (treated as 1). A size-1 axis is stretched by copying. Dividing (27, 27) by (27, 1) stretches the column of row sums sideways, so every entry in row i is divided by that row's own total.",
          formula: '(27, 27) / (27, 1) → entry (i, j) divided by s_i',
        },
        {
          title: 'The keepdim pitfall',
          body: 'Forget keepdim and you divide by shape (27,). Aligned from the right it becomes (1, 27), a row, and is stretched downward instead. Entry (i, j) is now divided by s_j, the total of row j, not row i. No error is raised because the shapes are perfectly legal. The result looks like probabilities but its rows do not sum to one. A cheap habit catches this: after normalizing, check that every row sums to 1.',
          formula: '(27, 27) / (27,) ≡ (27, 27) / (1, 27) → entry (i, j) divided by s_j  ✗',
        },
      ],
      keyTakeaways: [
        'Broadcasting aligns shapes from the right; a size-1 or missing axis gets stretched.',
        'keepdim keeps the summed axis as size 1, turning row totals into a (27, 1) column.',
        'Dropping keepdim silently divides by the wrong totals; always check that rows sum to 1.',
      ],
      quiz: [
        {
          question:
            'N has shape (27, 27) and s = N.sum(1) without keepdim, shape (27,). What does N / s compute at entry (i, j)?',
          options: [
            'N[i][j] / s[j]',
            'N[i][j] / s[i]',
            'It raises a shape-mismatch error',
            'N[i][j] / (s[i] · s[j])',
          ],
          answer: 0,
          explanation:
            'Aligned from the right, (27,) acts like (1, 27): a single row copied down every row, so column j is always divided by s[j]. The shapes are compatible, so there is no error, which is exactly why the bug is dangerous. Dividing by s[i] needs keepdim.',
        },
        {
          question: 'Which pair of shapes can NOT be broadcast together?',
          options: [
            '(27, 27) and (27, 1)',
            '(27, 27) and (1, 27)',
            '(27, 27) and (3, 1)',
            '(5, 1) and (1, 4)',
          ],
          answer: 2,
          explanation:
            'Aligned from the right, the first axis compares 27 with 3: neither is 1 and they are not equal, so it fails. (5, 1) and (1, 4) is legal and produces (5, 4), because each size-1 axis is stretched.',
        },
      ],
      challenge: {
        title: 'Row sums and a mini broadcasting divide',
        instructions:
          'Matrices are lists of lists of numbers. Implement `row_sums(M, keepdim=False)`: return a flat list of row totals, or, if keepdim is True, a column of shape (n, 1) like [[s0], [s1], ...]. Then implement `broadcast_div(A, B)` for A of shape (n, m), returning a new (n, m) list of floats. B may be exactly one of these accepted shapes: a flat list of length m (treat it as shape (1, m)), or a list of lists of shape (1, 1) (one number divides everything), (n, 1) (one number per row), (1, m) (one number per column) or (n, m) (elementwise). Stretch size-1 axes as broadcasting does. Any other shape must raise ValueError; for example, with A of shape (2, 3), the shapes (1, 2), (3, 1) and a flat list of length 2 are all rejected.',
        starter: String.raw`def row_sums(M, keepdim=False):
    """Sum each row. keepdim=False -> [s0, s1, ...]; keepdim=True -> [[s0], [s1], ...]."""
    # TODO
    raise NotImplementedError


def broadcast_div(A, B):
    """Divide A (n x m) by B using broadcasting rules.

    B can be a flat list (treated as shape (1, m)) or a list of lists of
    shape (1, 1), (n, 1), (1, m) or (n, m). Raise ValueError otherwise.
    """
    # TODO: normalise B to a list of lists, check its shape, then divide
    raise NotImplementedError
`,
        solution: String.raw`def row_sums(M, keepdim=False):
    """Sum each row. keepdim=False -> [s0, s1, ...]; keepdim=True -> [[s0], [s1], ...]."""
    sums = [sum(row) for row in M]
    if keepdim:
        return [[s] for s in sums]
    return sums


def broadcast_div(A, B):
    """Divide A (n x m) by B using broadcasting rules.

    B can be a flat list (treated as shape (1, m)) or a list of lists of
    shape (1, 1), (n, 1), (1, m) or (n, m). Raise ValueError otherwise.
    """
    n, m = len(A), len(A[0])
    if len(B) > 0 and not isinstance(B[0], list):
        B = [B]  # a 1-D vector lines up as a single row
    bn, bm = len(B), len(B[0])
    if bn not in (1, n) or bm not in (1, m):
        raise ValueError("cannot broadcast (%d, %d) with (%d, %d)" % (n, m, bn, bm))
    out = []
    for i in range(n):
        bi = 0 if bn == 1 else i
        row = []
        for j in range(m):
            bj = 0 if bm == 1 else j
            row.append(A[i][j] / B[bi][bj])
        out.append(row)
    return out
`,
        tests: String.raw`import math

def close(X, Y):
    return len(X) == len(Y) and all(
        len(r) == len(s) and all(math.isclose(a, b, rel_tol=1e-9) for a, b in zip(r, s))
        for r, s in zip(X, Y)
    )

M = [[1, 3], [2, 6]]
assert row_sums(M) == [4, 8], "flat row sums wrong"
assert row_sums(M, keepdim=True) == [[4], [8]], "keepdim should give a column"

P = broadcast_div(M, row_sums(M, keepdim=True))
assert close(P, [[0.25, 0.75], [0.25, 0.75]]), "column broadcast should divide each row by its own sum: %r" % (P,)
assert all(math.isclose(sum(r), 1.0) for r in P), "rows must sum to 1 after correct normalisation"

# The pitfall: a flat vector is treated as a row, so column j is divided by s[j].
Q = broadcast_div(M, row_sums(M))
assert close(Q, [[0.25, 0.375], [0.5, 0.75]]), "flat vector must act like shape (1, m): %r" % (Q,)
assert not math.isclose(sum(Q[0]), 1.0), "the keepdim bug should NOT give rows summing to 1"

assert close(broadcast_div(M, [[2, 4]]), [[0.5, 0.75], [1.0, 1.5]]), "(1, m) row broadcast wrong"
assert close(broadcast_div(M, [[1, 3], [4, 2]]), [[1.0, 1.0], [0.5, 3.0]]), "elementwise (n, m) wrong"

A = [[3, 3, 3], [1, 2, 3]]
assert close(broadcast_div(A, row_sums(A, keepdim=True)), [[1/3, 1/3, 1/3], [1/6, 2/6, 3/6]]), "non-square column broadcast wrong"
assert close(broadcast_div(A, [[1]]), [[3, 3, 3], [1, 2, 3]]), "(1, 1) should broadcast to everything"

for bad in ([[1, 2]], [[1], [2], [3]], [1, 2]):
    try:
        broadcast_div(A, bad)
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError for shape of %r" % (bad,))
`,
        hint: 'Convert a flat B to [B] first. Then, for each output cell, use row index 0 if B has one row (else i) and column index 0 if B has one column (else j).',
      },
      lab: 'bigram',
    },
    {
      id: 'bigram-sampling',
      title: 'Probabilities, Smoothing, and Sampling',
      minutes: 13,
      summary:
        'Normalize counts into next-character distributions, smooth away the zeros, and generate new names with a seeded sampler.',
      sections: [
        {
          title: 'Counts to probabilities',
          body: 'Dividing each row of the count matrix by its total turns it into a probability distribution: P[i][j] estimates the chance that token j comes next, given that the current token is i. Every row is non-negative and sums to 1.',
        },
        {
          title: 'Add-k smoothing',
          body: 'A bigram never seen in training gets probability zero, so the model claims it is impossible. That is overconfident, and since log(0) = -∞ a single unseen pair makes the loss infinite. Smoothing adds a small pseudo-count k to every cell before normalizing; k = 1 is classic Laplace smoothing. Larger k pulls each row toward the uniform distribution 1/V. It is a knob that trades fidelity to the data for robustness.',
          formula: 'P[i][j] = (N[i][j] + k) / (Σ_j N[i][j] + k·V)',
        },
        {
          title: 'Sampling one character at a time',
          body: "To generate a name, start at '.', look up that row, draw the next index according to its probabilities, and repeat until '.' is drawn again. To draw from a row, take a uniform number u in [0, 1) and walk the running total of the probabilities, choosing the first index whose cumulative sum exceeds u. Each index owns a slice of [0, 1) as wide as its probability, so it is picked exactly that often. This is what multinomial sampling does under the hood.",
          formula: 'pick smallest j with  p_0 + … + p_j > u,   u ~ Uniform[0, 1)',
        },
        {
          title: 'Seeded randomness',
          body: 'Seeding the random number generator makes sampling reproducible: the same seed and the same model give the same names, which makes debugging and comparisons fair. Expect bigram samples to look only vaguely name-like, because the model sees just one character of context.',
        },
      ],
      keyTakeaways: [
        'Each row of the normalized matrix is a next-character distribution.',
        'Add-k smoothing removes zero probabilities; larger k pushes rows toward uniform.',
        'Inverse-CDF sampling with a seeded RNG generates reproducible names, one character at a time.',
      ],
      quiz: [
        {
          question:
            'What happens to a row of probabilities as the smoothing constant k grows very large?',
          options: [
            'It becomes one-hot on the most frequent character',
            'It stays exactly the same as without smoothing',
            'It approaches the uniform distribution 1/V',
            'It stops summing to 1',
          ],
          answer: 2,
          explanation:
            'When k dominates the real counts, every cell is roughly k / (k·V) = 1/V. Smoothing never breaks normalization, because the k·V term in the denominator accounts for all the added pseudo-counts.',
        },
        {
          question:
            'A row has probabilities [0.2, 0.5, 0.3] and the uniform draw is u = 0.65. Which index is sampled?',
          options: ['0', '1', '2', 'It depends on the seed'],
          answer: 1,
          explanation:
            'The cumulative sums are 0.2, 0.7, 1.0. The first one greater than 0.65 is 0.7, at index 1. The seed only determines u; once u is fixed, the choice is deterministic.',
        },
      ],
      challenge: {
        title: 'Smooth, sample, generate',
        instructions:
          "Implement three functions. `smooth_probs(counts, k)` returns a new list of lists of floats where each row is (count + k) divided by (row total + k * V), V being the row length. `sample_index(probs, u)` returns the smallest index j whose cumulative probability probs[0] + ... + probs[j] is strictly greater than u (if rounding means none is, return the last index). `generate(P, itos, rng)` starts at index 0 ('.'), repeatedly calls `rng.random()` exactly once per draw, picks the next index with sample_index on the current row, stops when index 0 is drawn, and returns the generated characters joined into a string (without the '.').",
        starter: String.raw`def smooth_probs(counts, k):
    """Return row-normalised probabilities after adding k to every count."""
    # TODO
    raise NotImplementedError


def sample_index(probs, u):
    """Return the smallest j with cumulative sum of probs[0..j] > u."""
    # TODO: walk a running total
    raise NotImplementedError


def generate(P, itos, rng):
    """Generate one name: start at index 0, sample until index 0 comes back."""
    # TODO: call rng.random() once per character drawn (including the final '.')
    raise NotImplementedError
`,
        solution: String.raw`def smooth_probs(counts, k):
    """Return row-normalised probabilities after adding k to every count."""
    out = []
    for row in counts:
        total = sum(row) + k * len(row)
        out.append([(c + k) / total for c in row])
    return out


def sample_index(probs, u):
    """Return the smallest j with cumulative sum of probs[0..j] > u."""
    cum = 0.0
    for j, p in enumerate(probs):
        cum += p
        if cum > u:
            return j
    return len(probs) - 1


def generate(P, itos, rng):
    """Generate one name: start at index 0, sample until index 0 comes back."""
    out = []
    ix = 0
    while True:
        ix = sample_index(P[ix], rng.random())
        if ix == 0:
            break
        out.append(itos[ix])
    return ''.join(out)
`,
        tests: String.raw`import math
import random

def close(X, Y):
    return all(math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12) for r, s in zip(X, Y) for a, b in zip(r, s))

C = [[0, 2], [1, 1]]
assert close(smooth_probs(C, 0), [[0.0, 1.0], [0.5, 0.5]]), "k=0 should be plain normalisation"
assert close(smooth_probs(C, 1), [[0.25, 0.75], [0.5, 0.5]]), "k=1 should give (0+1)/4 and (2+1)/4"
P = smooth_probs([[0, 0, 0], [5, 0, 1]], 0.5)
assert close(P, [[1/3, 1/3, 1/3], [5.5/7.5, 0.5/7.5, 1.5/7.5]]), "smoothing with k=0.5 wrong: %r" % (P,)
assert all(math.isclose(sum(r), 1.0) for r in P), "rows must sum to 1"
assert C == [[0, 2], [1, 1]], "do not modify the input counts"

probs = [0.2, 0.5, 0.3]
for u, want in [(0.0, 0), (0.19, 0), (0.2, 1), (0.65, 1), (0.75, 2), (0.999, 2)]:
    got = sample_index(probs, u)
    assert got == want, "sample_index(%r, %r) = %r, expected %r" % (probs, u, got, want)
assert sample_index([0.0, 1.0, 0.0], 0.0) == 1, "zero-probability entries must never be chosen"

class FakeRng:
    def __init__(self, seq):
        self.seq = list(seq)
    def random(self):
        return self.seq.pop(0)

itos = {0: '.', 1: 'a', 2: 'b'}
P = [[0.0, 0.5, 0.5], [0.3, 0.3, 0.4], [0.5, 0.25, 0.25]]
rng = FakeRng([0.2, 0.5, 0.95, 0.6, 0.1])
assert generate(P, itos, rng) == 'aaba', "walk through rows with the given draws should give 'aaba'"
assert rng.seq == [], "rng.random() must be called exactly once per draw"

P_det = [[0, 1, 0], [0, 0, 1], [1, 0, 0]]
assert generate(P_det, itos, random.Random(0)) == 'ab', "deterministic chain . -> a -> b -> . gives 'ab'"

P_coin = [[0.0, 0.5, 0.5], [1.0, 0.0, 0.0], [1.0, 0.0, 0.0]]
r1 = random.Random(1234)
names = [generate(P_coin, itos, r1) for _ in range(2000)]
frac_a = names.count('a') / len(names)
assert set(names) == {'a', 'b'}, "only 'a' and 'b' are possible"
assert 0.45 < frac_a < 0.55, "fair coin row should give about half 'a': %.3f" % frac_a
r2 = random.Random(1234)
assert names[:20] == [generate(P_coin, itos, r2) for _ in range(20)], "same seed must give the same names"
`,
        hint: 'For sampling keep a running total and return as soon as it passes u. In generate, the current index is just the last sampled index, so loop until it becomes 0.',
      },
      lab: 'bigram',
    },
    {
      id: 'bigram-likelihood-nll',
      title: 'Likelihood and Negative Log-Likelihood',
      minutes: 11,
      summary:
        'Score a model with a single number, the average negative log-likelihood, and see why counting is the best possible bigram training.',
      sections: [
        {
          title: 'Likelihood of the data',
          body: 'To judge a model, ask how probable it finds the data that actually occurred. The likelihood is the product of the probabilities the model gives to every bigram in the dataset. A good model puts high probability on what really happened. A model that guesses uniformly gives each bigram 1/27.',
          formula: 'likelihood = Π_t P(y_t | x_t)',
        },
        {
          title: 'Why take logs',
          body: 'Multiplying thousands of numbers below 1 quickly underflows to zero in floating point. The logarithm turns the product into a sum, and because log is increasing, maximizing the log-likelihood picks the same model as maximizing the likelihood. Each term log P is at most 0.',
          formula: 'log L = Σ_t log P(y_t | x_t)',
        },
        {
          title: 'Average negative log-likelihood',
          body: 'Negating gives a loss where lower is better, and dividing by the number of bigrams makes it comparable across datasets of different sizes. A perfect model scores 0. The uniform model scores log 27 ≈ 3.30, a useful baseline. If the model gives probability zero to any bigram that actually occurs, the loss is infinite, which is the practical reason for smoothing.',
          formula: 'NLL = -(1/N) Σ_t log P(y_t | x_t)',
        },
        {
          title: 'Counting is maximum likelihood',
          body: 'For a bigram table, the normalized counts are exactly the probabilities that minimize the NLL on the training data. In that sense counting is already optimal training. The neural version in the next lesson must rediscover the same answer by gradient descent, and that is a good sanity check. Measuring NLL on held-out names tells you how well the model generalizes.',
        },
      ],
      keyTakeaways: [
        'Average NLL turns model quality into one number: lower is better, 0 is perfect.',
        'Logs prevent underflow and turn products into sums without changing the best model.',
        'Normalized counts minimize training NLL; zero probabilities make it infinite.',
      ],
      quiz: [
        {
          question:
            'A model assigns probability 1/27 to every next character. What is its average NLL?',
          options: ['0', '1/27', '27', 'log 27 ≈ 3.30'],
          answer: 3,
          explanation:
            'Every term is -log(1/27) = log 27, so the average is also log 27 ≈ 3.30. That is the baseline any trained model should beat. 1/27 is the probability, not the loss.',
        },
        {
          question:
            'Why do we average the negative log-likelihood instead of multiplying raw probabilities?',
          options: [
            'Products of many small probabilities underflow, and averaging makes scores comparable across dataset sizes',
            'Logs make the model more accurate',
            'Multiplying probabilities is not allowed for independent events',
            'The average is always smaller than the product',
          ],
          answer: 0,
          explanation:
            'The log keeps the numbers in a usable range and leaves the best model unchanged, while averaging removes the dependence on how many bigrams there are. Logs measure the model; they do not change its predictions.',
        },
      ],
      challenge: {
        title: 'Average NLL of a bigram model',
        instructions:
          "Implement `avg_nll(words, P, stoi)`. Wrap each word as '.' + word + '.', and for every bigram (a, b) look up p = P[stoi[a]][stoi[b]]. Return the average of -log(p) over all bigrams of all words, as a float (natural log). If any p is 0, return float('inf') instead of crashing. If there are no words, raise ValueError.",
        starter: String.raw`import math


def avg_nll(words, P, stoi):
    """Average negative log-likelihood of all bigrams in words under P."""
    # TODO: accumulate log-probabilities and count bigrams
    raise NotImplementedError
`,
        solution: String.raw`import math


def avg_nll(words, P, stoi):
    """Average negative log-likelihood of all bigrams in words under P."""
    if not words:
        raise ValueError("need at least one word")
    total = 0.0
    n = 0
    for w in words:
        chars = ['.'] + list(w) + ['.']
        for a, b in zip(chars, chars[1:]):
            p = P[stoi[a]][stoi[b]]
            if p <= 0:
                return float('inf')
            total += -math.log(p)
            n += 1
    return total / n
`,
        tests: String.raw`import math
import string

stoi = {'.': 0, 'a': 1}
P = [[0.5, 0.5], [0.25, 0.75]]
got = avg_nll(['a'], P, stoi)
assert math.isclose(got, -(math.log(0.5) + math.log(0.25)) / 2, rel_tol=1e-9), "'a' -> pairs .a and a. : got %r" % got
got = avg_nll(['aa', 'a'], P, stoi)
want = -(math.log(0.5) + math.log(0.75) + math.log(0.25) + math.log(0.5) + math.log(0.25)) / 5
assert math.isclose(got, want, rel_tol=1e-9), "average must be over all 5 bigrams: got %r want %r" % (got, want)

stoi27 = {'.': 0}
for i, ch in enumerate(string.ascii_lowercase):
    stoi27[ch] = i + 1
U = [[1 / 27] * 27 for _ in range(27)]
assert math.isclose(avg_nll(['emma', 'olivia', 'ava'], U, stoi27), math.log(27), rel_tol=1e-9), "uniform model must give log 27"

Z = [[0.0, 1.0], [1.0, 0.0]]
assert avg_nll(['a'], Z, stoi) == 0.0, "probability-1 bigrams give zero loss"
assert avg_nll(['aa'], Z, stoi) == float('inf'), "a zero-probability bigram must give inf"

try:
    avg_nll([], P, stoi)
except ValueError:
    pass
else:
    raise AssertionError("empty word list should raise ValueError")
`,
        hint: 'Keep two running values, the sum of -log(p) and the number of bigrams, and divide at the end. Check for p == 0 before calling math.log.',
      },
      lab: 'bigram',
    },
    {
      id: 'bigram-neural-network',
      title: 'A Neural Bigram Trained by Gradient Descent',
      minutes: 15,
      summary:
        'Replace the count table with a weight matrix, softmax and cross-entropy, derive the p minus one-hot gradient, and watch regularization play the role of smoothing.',
      sections: [
        {
          title: 'One-hot in, logits out',
          body: 'Encode the previous character index i as a one-hot vector of length 27. Multiplying it by a 27×27 weight matrix W simply selects row i of W. That row holds 27 logits: unnormalized scores that can be any real number.',
          formula: 'z = onehot(i) · W = W[i]',
        },
        {
          title: 'Softmax',
          body: 'Exponentiating the logits makes them positive, like counts, and dividing by their sum makes a distribution. So exp(W) plays the role of the count matrix, and logits behave like log-counts. Subtracting the largest logit before exponentiating avoids overflow and does not change the result.',
          formula: 'p_j = exp(z_j − m) / Σ_k exp(z_k − m),   m = max_k z_k',
        },
        {
          title: 'The gradient is p minus one-hot',
          body: 'The loss for one example is −log p_y, the same NLL as before. Its derivative with respect to logit z_j is p_j minus 1 if j is the correct index y, else 0. The correct logit is pushed up and every other logit is pushed down in proportion to its probability. Because only row x of W produced the logits, that row receives the gradient, averaged over the batch. Gradient descent then repeats W ← W − lr · ∂L/∂W.',
          formula: '∂L/∂z_j = p_j − 1[j = y]',
        },
        {
          title: 'Regularization is smoothing',
          body: 'Adding λ · mean(W²) to the loss pulls weights toward zero. An all-zero row gives a uniform softmax, so the penalty pulls predictions toward uniform, just as adding k to the counts does. Without the penalty, long training converges to the normalized counts. The two routes reach the same model, but the neural one extends to richer inputs.',
          formula: 'L = −(1/N) Σ_n log p_{y_n} + λ · (1/V²) Σ_{i,j} W_ij²',
        },
      ],
      keyTakeaways: [
        'A one-hot input times W just selects a row of logits; softmax turns them into probabilities.',
        'For softmax with cross-entropy, the gradient with respect to the logits is p − onehot(y).',
        'An L2 penalty on W pulls predictions toward uniform, acting like add-k smoothing.',
      ],
      quiz: [
        {
          question:
            'Logits are z = [2, 0, 0], softmax gives p ≈ [0.79, 0.11, 0.11], and the correct class is y = 1. What is ∂L/∂z for L = −log p_y?',
          options: [
            '[−0.21, 0.11, 0.11]',
            '[0.79, 0.11, 0.11]',
            '[0.79, −0.89, 0.11]',
            '[0, −1, 0]',
          ],
          answer: 2,
          explanation:
            'The gradient is p − onehot(y) = [0.79, 0.11 − 1, 0.11] = [0.79, −0.89, 0.11]. Gradient descent subtracts it, so the correct logit z_1 rises and the over-confident z_0 falls. The first option subtracts the one-hot at index 0 (the most likely class) instead of the correct class y = 1, the second forgets the one-hot entirely, and the last keeps only −onehot(y) and ignores the probabilities.',
        },
        {
          question:
            'Why does a large L2 penalty on W behave like a large add-k smoothing constant?',
          options: [
            'Both make the matrix sparse',
            'Both increase the learning rate',
            'Both remove the need for the start/end token',
            'Both pull each row toward the uniform distribution',
          ],
          answer: 3,
          explanation:
            'The penalty drives weights toward 0, and a row of zero logits gives equal probability to every token, the same limit that large k reaches with counts. Neither one makes the matrix sparse; both spread probability out.',
        },
      ],
      challenge: {
        title: 'Train a softmax bigram model',
        instructions:
          'W is a V×V list of lists of floats; xs and ys are equal-length lists of integer indices (previous and next token). Implement `softmax(z)` (numerically stable: subtract max(z) first). Implement `loss_and_grad(W, xs, ys, reg)` returning `(loss, dW)` where loss = (1/N) Σ_n −log softmax(W[xs[n]])[ys[n]] + reg · (1/V²) Σ_ij W[i][j]², and dW is a V×V list of lists with the exact gradient (use p − onehot for each example, divided by N, plus the regularization term). Implement `train(W, xs, ys, lr, steps, reg)` that runs `steps` gradient-descent updates W[i][j] -= lr * dW[i][j] in place and returns the list of losses computed before each update.',
        starter: String.raw`import math


def softmax(z):
    """Numerically stable softmax of a list of floats."""
    # TODO
    raise NotImplementedError


def loss_and_grad(W, xs, ys, reg):
    """Return (loss, dW) for the softmax bigram model with L2 penalty reg * mean(W**2)."""
    # TODO: for each example take row W[x], softmax it, add -log p[y] to the loss,
    # and add (p - onehot(y)) / N into dW[x]. Then add the regularisation terms.
    raise NotImplementedError


def train(W, xs, ys, lr, steps, reg):
    """Run gradient descent in place; return the list of losses (before each update)."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math


def softmax(z):
    """Numerically stable softmax of a list of floats."""
    m = max(z)
    exps = [math.exp(v - m) for v in z]
    s = sum(exps)
    return [e / s for e in exps]


def loss_and_grad(W, xs, ys, reg):
    """Return (loss, dW) for the softmax bigram model with L2 penalty reg * mean(W**2)."""
    V = len(W)
    N = len(xs)
    dW = [[0.0] * V for _ in range(V)]
    loss = 0.0
    for x, y in zip(xs, ys):
        p = softmax(W[x])
        loss -= math.log(p[y])
        for j in range(V):
            dW[x][j] += (p[j] - (1.0 if j == y else 0.0)) / N
    loss /= N
    scale = reg / (V * V)
    for i in range(V):
        for j in range(V):
            loss += scale * W[i][j] ** 2
            dW[i][j] += 2 * scale * W[i][j]
    return loss, dW


def train(W, xs, ys, lr, steps, reg):
    """Run gradient descent in place; return the list of losses (before each update)."""
    losses = []
    for _ in range(steps):
        loss, dW = loss_and_grad(W, xs, ys, reg)
        losses.append(loss)
        for i in range(len(W)):
            for j in range(len(W)):
                W[i][j] -= lr * dW[i][j]
    return losses
`,
        tests: String.raw`import math
import random

p = softmax([1.0, 2.0, 3.0])
e = [math.exp(1), math.exp(2), math.exp(3)]
assert all(math.isclose(a, b / sum(e), rel_tol=1e-9) for a, b in zip(p, e)), "softmax values wrong"
p = softmax([1000.0, 1000.0, 999.0])
assert math.isclose(p[0], p[1]) and math.isclose(sum(p), 1.0), "softmax must be stable for large logits"

W0 = [[0.0] * 3 for _ in range(3)]
loss, dW = loss_and_grad(W0, [0, 1], [1, 2], 0.0)
assert math.isclose(loss, math.log(3), rel_tol=1e-9), "zero weights -> uniform -> loss log 3"
want_row0 = [(1/3) / 2, (1/3 - 1) / 2, (1/3) / 2]
assert all(math.isclose(a, b, rel_tol=1e-9) for a, b in zip(dW[0], want_row0)), "dW row 0 should be (p - onehot) / N: %r" % (dW[0],)
assert all(v == 0.0 for v in dW[2]), "rows never used as input get zero gradient (reg = 0)"

# finite-difference check with regularisation
rng = random.Random(7)
V = 4
W = [[rng.gauss(0, 1) for _ in range(V)] for _ in range(V)]
xs = [0, 1, 1, 3, 2, 0]
ys = [1, 2, 0, 3, 3, 1]
reg = 0.3
_, dW = loss_and_grad(W, xs, ys, reg)
h = 1e-6
for i in range(V):
    for j in range(V):
        old = W[i][j]
        W[i][j] = old + h
        lp, _ = loss_and_grad(W, xs, ys, reg)
        W[i][j] = old - h
        lm, _ = loss_and_grad(W, xs, ys, reg)
        W[i][j] = old
        num = (lp - lm) / (2 * h)
        assert math.isclose(dW[i][j], num, abs_tol=1e-6), "gradient mismatch at (%d, %d): %r vs %r" % (i, j, dW[i][j], num)

# bigrams of ['ab', 'ba', 'a'] with '.'=0, a=1, b=2
xs = [0, 1, 2, 0, 2, 1, 0, 1]
ys = [1, 2, 0, 2, 1, 0, 1, 0]
W = [[0.0] * 3 for _ in range(3)]
losses = train(W, xs, ys, 5.0, 400, 0.0)
assert len(losses) == 400, "train must return one loss per step"
assert losses[-1] < losses[0] - 0.3, "loss should drop substantially: %r -> %r" % (losses[0], losses[-1])
count_probs = [[0, 2/3, 1/3], [2/3, 0, 1/3], [1/2, 1/2, 0]]
for i in range(3):
    p = softmax(W[i])
    assert all(abs(a - b) < 0.05 for a, b in zip(p, count_probs[i])), "row %d should approach normalised counts: %r" % (i, p)

W = [[0.0] * 3 for _ in range(3)]
train(W, xs, ys, 0.05, 200, 50.0)
for i in range(3):
    p = softmax(W[i])
    assert max(p) - min(p) < 0.1, "strong regularisation should keep rows near uniform: %r" % (p,)
`,
        hint: 'Only row W[x] is used for an example, so only dW[x] gets the (p - onehot) / N contribution. The penalty adds reg * 2 * W[i][j] / V² to every entry.',
      },
      lab: 'bigram',
    },
  ],
};
