import type { CourseModule } from '../../types';

export const mlpModule: CourseModule = {
  id: 'mlp',
  number: 3,
  title: 'Multilayer perceptrons',
  subtitle: 'Give a character model more context with embeddings and a hidden layer.',
  description:
    'Move past bigram counts and train a small neural network that looks at several previous characters at once, using learned embeddings and a tanh hidden layer. This is an original, hands-on companion to the referenced lecture; watch the video for the full build.',
  duration: '1h15m',
  videoId: 'TCH_1BHY58I',
  sourceTitle: 'Building makemore Part 2: MLP',
  topics: ['Context windows', 'Embeddings', 'Hidden layers & cross-entropy', 'Training & tuning'],
  project:
    'A pure-Python toolkit for a character-level MLP: a context-window dataset builder, embedding lookup, forward pass with cross-entropy, mini-batch sampler, learning-rate sweep, and a name sampler.',
  lessons: [
    {
      id: 'mlp-context-dataset',
      title: 'Building a Context-Window Dataset',
      minutes: 10,
      summary:
        'A bigram only sees one previous character. Here we turn words into many (context, next character) pairs so a model can look further back.',
      sections: [
        {
          title: 'Why one character is not enough',
          body: `A bigram model predicts the next character from just the previous one. Counting works for that, but the table grows as V^n when you look back n characters: with 27 tokens and 3 characters of context you already need 19,683 rows, and most of them are never seen in training. The neural language model idea, popularized by Bengio and colleagues in 2003, avoids this explosion. Instead of a giant table, a small network maps a fixed-length context to a probability distribution over the next token, and similar contexts can share what they learned.`,
        },
        {
          title: 'The block size',
          body: `The block_size is how many previous tokens the model sees. With block_size = 3, the model always receives exactly three token indices and must predict a fourth. Fixed length matters because the network has a fixed number of inputs.`,
        },
        {
          title: 'Padding with the dot token',
          body: `At the start of a word there is no history yet, so we pad with the special '.' token (index 0). The word "emma" with block_size 3 becomes five examples: ... → e, ..e → m, .em → m, emm → a, mma → '.'. The final '.' teaches the model when to stop. After each example we slide the window: drop the oldest index and append the character we actually observed next (the target from the word), not anything the model predicted. While building the dataset there is no model at all; we only read the real text. (Later, when we generate, the window is fed with sampled characters instead, because then there is no real text to read.)`,
          formula: 'context ← context[1:] + [ix]',
        },
        {
          title: 'X and Y',
          body: `Stacking every context gives X, a list of shape (N, block_size), and stacking the targets gives Y, shape (N,). Every word contributes len(word) + 1 rows, so the dataset is much larger than the word list and every row is one training example.`,
        },
      ],
      keyTakeaways: [
        'A count table explodes with longer context; a neural model with shared parameters does not.',
        "Pad the start of every word with '.' (index 0) so every example has exactly block_size inputs.",
        'Each word of length L yields L + 1 (context, target) pairs, including the final stop token.',
      ],
      quiz: [
        {
          question: 'With block_size = 3, how many (X, Y) pairs does the word "ava" produce?',
          options: ['3', '4', '6', '1'],
          answer: 1,
          explanation:
            "One pair per character plus one for the closing '.': a, v, a, then '.'. That is 3 + 1 = 4. Answering 3 forgets the stop token, which the model needs in order to learn when names end.",
        },
        {
          question: "Why does the dataset pad the beginning of each word with the '.' token?",
          options: [
            'To make words the same total length',
            'Because the network ignores index 0',
            'So the very first characters still have a full block_size context to condition on',
            'To reduce the vocabulary size',
          ],
          answer: 2,
          explanation:
            "The network needs exactly block_size inputs. Padding with '.' fills the missing history and also tells the model 'this is the start of a word'. It does not equalize word lengths, and index 0 is a normal, learned token, not ignored.",
        },
      ],
      challenge: {
        title: 'Build the context-window dataset',
        instructions:
          "Implement build_dataset(words, block_size, stoi) returning a tuple (X, Y). X is a list of lists of ints (each of length block_size), Y is a list of ints. For each word, start with context = [0] * block_size (index 0 is the '.' token). For every character in word + '.', append a copy of the current context to X, append stoi[ch] to Y, then slide the window: drop the first index and append stoi[ch]. The helper build_stoi is already provided.",
        starter: String.raw`def build_stoi(words):
    """Map '.' -> 0 and each letter (sorted) -> 1, 2, ..."""
    chars = sorted(set("".join(words)))
    stoi = {c: i + 1 for i, c in enumerate(chars)}
    stoi["."] = 0
    return stoi


def build_dataset(words, block_size, stoi):
    """Return (X, Y): contexts of length block_size and next-token targets."""
    X, Y = [], []
    # TODO: for each word, start with a context of block_size zeros,
    # and for each ch in word + '.', record (context copy, stoi[ch])
    # then slide the window forward.
    raise NotImplementedError
`,
        solution: String.raw`def build_stoi(words):
    """Map '.' -> 0 and each letter (sorted) -> 1, 2, ..."""
    chars = sorted(set("".join(words)))
    stoi = {c: i + 1 for i, c in enumerate(chars)}
    stoi["."] = 0
    return stoi


def build_dataset(words, block_size, stoi):
    """Return (X, Y): contexts of length block_size and next-token targets."""
    X, Y = [], []
    for w in words:
        context = [0] * block_size
        for ch in w + ".":
            ix = stoi[ch]
            X.append(list(context))
            Y.append(ix)
            context = context[1:] + [ix]
    return X, Y
`,
        tests: String.raw`stoi = build_stoi(["emma", "ava"])
assert stoi == {".": 0, "a": 1, "e": 2, "m": 3, "v": 4}, "build_stoi helper changed"

X, Y = build_dataset(["emma"], 3, stoi)
assert X == [[0, 0, 0], [0, 0, 2], [0, 2, 3], [2, 3, 3], [3, 3, 1]], "wrong contexts for 'emma': %r" % (X,)
assert Y == [2, 3, 3, 1, 0], "wrong targets for 'emma': %r" % (Y,)

X2, Y2 = build_dataset(["emma", "ava"], 2, stoi)
assert len(X2) == 5 + 4 and len(Y2) == 9, "each word should give len(word)+1 rows"
assert X2[5:] == [[0, 0], [0, 1], [1, 4], [4, 1]], "contexts must reset to zeros for each new word: %r" % (X2[5:],)
assert Y2[5:] == [1, 4, 1, 0], "wrong targets for 'ava'"
assert all(len(row) == 2 for row in X2), "every context must have exactly block_size entries"

X1, Y1 = build_dataset(["ava"], 1, stoi)
assert X1 == [[0], [1], [4], [1]] and Y1 == [1, 4, 1, 0], "block_size=1 should reduce to a bigram dataset"

X0, Y0 = build_dataset([], 3, stoi)
assert X0 == [] and Y0 == [], "empty word list gives empty dataset"
`,
        hint: 'Keep a list called context, append list(context) (a copy!) before updating it, then set context = context[1:] + [ix].',
      },
      lab: 'mlp',
    },
    {
      id: 'mlp-embeddings',
      title: 'Embeddings: A Lookup Table That Learns',
      minutes: 11,
      summary:
        'Each token gets a small learned vector. Looking up a row of the table is the same as multiplying a one-hot vector by it.',
      sections: [
        {
          title: 'The table C',
          body: `An embedding table C has one row per token and emb_dim columns. With 27 tokens and emb_dim = 2, C is a 27 × 2 matrix, so every character lives at a point in a 2-D space. The values start random and are trained by gradient descent like any other weight. Over training, characters that behave alike, such as vowels, tend to drift close together, which lets the model generalize to contexts it has rarely seen.`,
        },
        {
          title: 'Indexing equals one-hot times C',
          body: `To embed token i you just read row C[i]. This is not a trick outside the math: if one_hot(i) is a vector of length V with a 1 at position i, then one_hot(i) @ C picks out exactly row i, because every other row is multiplied by zero. So the embedding is a linear layer with no bias whose input happens to be one-hot. Indexing is simply the fast way to compute it.`,
          formula: 'one_hot(i) @ C = C[i]',
        },
        {
          title: 'Concatenating the context',
          body: `A context of block_size tokens gives block_size vectors of length emb_dim. We place them side by side into one flat vector of length block_size × emb_dim. Order matters: the first slot always holds the oldest token, so the next layer can learn position-specific weights. For a batch, X of shape (B, block_size) becomes C[X] of shape (B, block_size, emb_dim), which is then reshaped (viewed) to (B, block_size × emb_dim).`,
        },
      ],
      keyTakeaways: [
        'An embedding table C has shape (vocab_size, emb_dim) and is trained like any weight.',
        'C[i] is mathematically identical to one_hot(i) @ C; indexing is just cheaper.',
        'Concatenate the context embeddings in order to get one input vector of length block_size × emb_dim.',
      ],
      quiz: [
        {
          question:
            'With vocab 27, emb_dim 10 and block_size 3, what is the length of one concatenated input vector?',
          options: ['30', '27', '81', '10'],
          answer: 0,
          explanation:
            'Each of the 3 context tokens contributes a 10-number embedding, so 3 × 10 = 30. The vocabulary size only sets how many rows C has, not the input length.',
        },
        {
          question: 'Why is indexing C[i] preferred over one_hot(i) @ C in practice?',
          options: [
            'It gives slightly different, better gradients',
            'It avoids storing a large table',
            'It only works for 2-D embeddings',
            'It gives the same result while skipping V multiply-adds with zeros',
          ],
          answer: 3,
          explanation:
            'The two are mathematically equal, including their gradients (only row i gets updated). Indexing just skips the wasted multiplications by zero. The table C is still stored either way.',
        },
      ],
      challenge: {
        title: 'Embed a context two ways',
        instructions:
          'C is a list of rows (C[i] is the embedding of token i). Implement one_hot_matmul(C, ix): build a one-hot list of length len(C) with a 1.0 at ix and return the vector one_hot @ C computed with explicit sums (no indexing shortcut C[ix]). Then implement embed_context(C, context): return one flat list that concatenates C[t] for each token index t in context, in order.',
        starter: String.raw`def one_hot_matmul(C, ix):
    """Return one_hot(ix) @ C as a list of floats, using explicit sums."""
    # TODO: build the one-hot vector, then for each column j
    # sum one_hot[i] * C[i][j] over all rows i.
    raise NotImplementedError


def embed_context(C, context):
    """Concatenate the embeddings of each token in context into one flat list."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def one_hot_matmul(C, ix):
    """Return one_hot(ix) @ C as a list of floats, using explicit sums."""
    V = len(C)
    one_hot = [1.0 if i == ix else 0.0 for i in range(V)]
    dim = len(C[0])
    return [sum(one_hot[i] * C[i][j] for i in range(V)) for j in range(dim)]


def embed_context(C, context):
    """Concatenate the embeddings of each token in context into one flat list."""
    out = []
    for t in context:
        out.extend(C[t])
    return out
`,
        tests: String.raw`import math
import random

C = [[0.1, -0.2], [1.5, 0.3], [-0.7, 2.0], [0.0, 0.9]]
r = one_hot_matmul(C, 2)
assert len(r) == 2, "result should have emb_dim entries"
assert all(math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12) for a, b in zip(r, [-0.7, 2.0])), "one_hot(2) @ C should equal row 2"

random.seed(3)
C2 = [[random.uniform(-1, 1) for _ in range(5)] for _ in range(27)]
for i in [0, 13, 26]:
    v = one_hot_matmul(C2, i)
    assert all(math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12) for a, b in zip(v, C2[i])), "mismatch at row %d" % i

e = embed_context(C, [0, 0, 3])
assert e == [0.1, -0.2, 0.1, -0.2, 0.0, 0.9], "wrong concatenation: %r" % (e,)
e2 = embed_context(C, [3, 1])
assert e2 == [0.0, 0.9, 1.5, 0.3], "order of tokens must be preserved: %r" % (e2,)
assert len(embed_context(C2, [5, 6, 7])) == 15, "length should be block_size * emb_dim"
assert embed_context(C, []) == [], "empty context gives empty vector"
`,
        hint: 'For one_hot_matmul, loop over columns j and sum one_hot[i] * C[i][j] over every row i. For embed_context, extend an output list with each row.',
      },
      lab: 'mlp',
    },
    {
      id: 'mlp-hidden-layer',
      title: 'Hidden Layer, Logits and Cross-Entropy',
      minutes: 13,
      summary:
        'The concatenated embedding flows through a tanh hidden layer and an output layer to produce logits, and cross-entropy scores how well they predict the target.',
      sections: [
        {
          title: 'Shape bookkeeping',
          body: `Write every shape down. The batch of embeddings is (B, block_size·emb_dim). The first weight W1 must therefore be (block_size·emb_dim, hidden) and b1 is (hidden,). The product gives (B, hidden), and b1 is broadcast across every row. If block_size is 3 and emb_dim is 2, W1 has 6 rows; if those numbers disagree, the matrix multiply fails, which is a useful early warning.`,
          formula: 'h = tanh(emb @ W1 + b1)    # (B, hidden)',
        },
        {
          title: 'Why tanh',
          body: `Without a nonlinearity, two linear layers collapse into one linear layer and the network gains no expressive power. tanh squashes each value into (-1, 1), giving the model curved decision boundaries. Its downside: when inputs are large, tanh saturates near ±1 and its gradient (1 − h²) becomes almost zero, so keep initial weights fairly small.`,
        },
        {
          title: 'Logits',
          body: `A second layer maps the hidden activations to one score per token: W2 has shape (hidden, V) and b2 has shape (V,). These raw scores are logits. Softmax turns them into probabilities by exponentiating and normalizing.`,
          formula: 'logits = h @ W2 + b2    # (B, V)',
        },
        {
          title: 'Cross-entropy, computed stably',
          body: `The loss for one example is the negative log probability of the correct token. Computing softmax naively can overflow for large logits, so subtract the maximum logit first; this does not change the probabilities. Library functions such as cross_entropy do this for you and are faster than a manual softmax.`,
          formula: 'loss = log Σ_k exp(z_k − m) + m − z_y,   m = max_k z_k',
        },
      ],
      keyTakeaways: [
        'W1 must have shape (block_size·emb_dim, hidden); track shapes at every step.',
        'tanh adds the nonlinearity that makes stacking layers useful, but it saturates for large inputs.',
        'Cross-entropy is log-sum-exp minus the correct logit; subtracting the max keeps it numerically stable.',
      ],
      quiz: [
        {
          question: 'block_size = 4, emb_dim = 8, hidden = 100, vocab = 27. What shape is W2?',
          options: ['(32, 100)', '(100, 27)', '(27, 100)', '(32, 27)'],
          answer: 1,
          explanation:
            'W2 maps the hidden activations (hidden = 100) to one logit per vocab token (27), so it is (100, 27). (32, 100) is W1, since 4 × 8 = 32 inputs feed the hidden layer.',
        },
        {
          question:
            'If every logit is equal, what is the cross-entropy loss with a vocabulary of V tokens?',
          options: ['0', '1', 'log(V)', '1/V'],
          answer: 2,
          explanation:
            'Equal logits give a uniform distribution, so p(correct) = 1/V and the loss is −log(1/V) = log(V), about 3.30 for V = 27. This is a great sanity check for the loss at initialization. A loss of 1/V confuses the probability with its negative log.',
        },
      ],
      challenge: {
        title: 'Forward pass and stable cross-entropy',
        instructions:
          'Implement forward(emb, W1, b1, W2, b2) for ONE example. emb is a flat list of length n_in; W1 is a list of n_in rows each of length hidden (shape (n_in, hidden)); b1 has length hidden; W2 is (hidden, V) as a list of rows; b2 has length V. Compute h[j] = tanh(sum_i emb[i] * W1[i][j] + b1[j]) and return logits[k] = sum_j h[j] * W2[j][k] + b2[k] as a list. Then implement cross_entropy(logits, target) returning -log softmax(logits)[target], computed stably by subtracting max(logits).',
        starter: String.raw`import math


def forward(emb, W1, b1, W2, b2):
    """One-example forward pass: tanh hidden layer, then linear output logits."""
    # TODO: compute hidden activations h (length hidden), then logits (length V)
    raise NotImplementedError


def cross_entropy(logits, target):
    """Return -log(softmax(logits)[target]) without overflowing."""
    # TODO: subtract the max logit before exponentiating
    raise NotImplementedError
`,
        solution: String.raw`import math


def forward(emb, W1, b1, W2, b2):
    """One-example forward pass: tanh hidden layer, then linear output logits."""
    n_in = len(emb)
    hidden = len(b1)
    h = [math.tanh(sum(emb[i] * W1[i][j] for i in range(n_in)) + b1[j]) for j in range(hidden)]
    V = len(b2)
    return [sum(h[j] * W2[j][k] for j in range(hidden)) + b2[k] for k in range(V)]


def cross_entropy(logits, target):
    """Return -log(softmax(logits)[target]) without overflowing."""
    m = max(logits)
    lse = m + math.log(sum(math.exp(z - m) for z in logits))
    return lse - logits[target]
`,
        tests: String.raw`import math

emb = [1.0, -0.5]
W1 = [[0.2, -0.3, 0.5], [0.4, 0.1, -0.2]]
b1 = [0.0, 0.1, -0.1]
W2 = [[1.0, 0.0], [0.5, -1.0], [-0.5, 2.0]]
b2 = [0.1, -0.1]
h = [math.tanh(1.0 * 0.2 + -0.5 * 0.4 + 0.0),
     math.tanh(1.0 * -0.3 + -0.5 * 0.1 + 0.1),
     math.tanh(1.0 * 0.5 + -0.5 * -0.2 - 0.1)]
exp_logits = [h[0] * 1.0 + h[1] * 0.5 + h[2] * -0.5 + 0.1,
              h[0] * 0.0 + h[1] * -1.0 + h[2] * 2.0 - 0.1]
out = forward(emb, W1, b1, W2, b2)
assert len(out) == 2, "logits should have length V"
assert all(math.isclose(a, b, rel_tol=1e-9, abs_tol=1e-12) for a, b in zip(out, exp_logits)), "wrong logits: %r vs %r" % (out, exp_logits)

zero_out = forward([3.0, 3.0], [[0.0] * 3, [0.0] * 3], [0.0] * 3, W2, [0.7, -0.2])
assert all(math.isclose(a, b, rel_tol=1e-9) for a, b in zip(zero_out, [0.7, -0.2])), "zero hidden weights should give logits == b2"

big = forward([10.0], [[100.0]], [0.0], [[2.0]], [0.0])
assert math.isclose(big[0], 2.0, rel_tol=1e-6), "tanh must saturate at 1 for huge pre-activations"

assert math.isclose(cross_entropy([0.0] * 27, 5), math.log(27), rel_tol=1e-9), "uniform logits should give log(V)"
z = [2.0, 1.0, 0.1]
p = [math.exp(v) for v in z]
assert math.isclose(cross_entropy(z, 0), -math.log(p[0] / sum(p)), rel_tol=1e-9), "wrong loss for target 0"
assert math.isclose(cross_entropy(z, 2), -math.log(p[2] / sum(p)), rel_tol=1e-9), "wrong loss for target 2"
assert math.isclose(cross_entropy([1000.0, 0.0], 1), 1000.0, rel_tol=1e-9), "must be stable for huge logits"
assert cross_entropy([1000.0, 0.0], 0) < 1e-9, "confident correct prediction should have ~0 loss"
`,
        hint: 'Build h with a list comprehension over hidden units, then logits over vocab entries. For the loss, compute m = max(logits) and log-sum-exp as m + log(sum(exp(z - m))).',
      },
      lab: 'mlp',
    },
    {
      id: 'mlp-minibatches',
      title: 'Mini-Batches: Fast, Noisy Steps',
      minutes: 10,
      summary:
        'Instead of computing the gradient on every example, sample a small random batch each step. Each step is noisier but far cheaper.',
      sections: [
        {
          title: 'The cost of the full dataset',
          body: `A names dataset easily yields over 200,000 (context, target) pairs. Running forward and backward on all of them for every single update is slow, and most of that work is redundant: nearby examples point the gradient in similar directions. Mini-batching trades exactness for speed.`,
        },
        {
          title: 'Random index sampling',
          body: `Each step, draw B random integers in [0, N) and use them to select rows: Xb = X[ix], Yb = Y[ix]. Typical B is 32 to a few hundred. Sampling with replacement is simplest and works well; shuffling and walking through the data in chunks (epochs) is the common alternative. Only the selected rows go through the network, so a step costs about B/N of a full pass.`,
          formula: 'ix = randint(0, N, size=B);  loss ≈ (1/B) Σ_{i∈ix} ℓ_i',
        },
        {
          title: 'Noisy but unbiased',
          body: `The mini-batch gradient is an estimate of the full gradient. On average over random batches it equals the true gradient, so it points the right way in expectation, but any single estimate wobbles. Its noise shrinks roughly like 1/√B. In practice it is far better to take many quick approximate steps than a few exact ones. The noise even helps a little by jostling the model out of poor spots. One side effect: the per-step loss curve looks jagged, so evaluate the full training loss occasionally to see real progress.`,
        },
        {
          title: 'Diagnostic: overfit a single mini-batch first',
          body: 'Before training on the whole dataset, run a quick sanity check: take one small batch, say 32 examples, and train on only that batch for a few hundred steps. A model with thousands of parameters can memorise 32 examples, so the loss on that batch should drop far below its starting value. If it barely moves, something is broken in the pipeline: wrong shapes, gradients not reaching a parameter, a learning rate that is way off, or an update you forgot to apply. Finding that bug now costs seconds; finding it after an hour of full training costs an hour.\n\nDo not expect exactly zero, though. In this dataset the same context can have several correct next characters. For example "..." is followed by the first letter of every name, so even a perfect memoriser must spread probability over those targets, and the loss stalls at a floor above zero.\n\n```python\n# sketch: overfit one fixed batch as a pipeline check\nix = torch.randint(0, X.shape[0], (32,))\nXb, Yb = X[ix], Y[ix]               # keep the SAME batch every step\nfor step in range(500):\n    loss = forward(Xb, Yb)\n    for p in params:\n        p.grad = None\n    loss.backward()\n    for p in params:\n        p.data += -0.1 * p.grad\nprint(loss.item())                  # should be far below the starting loss\n```',
        },
      ],
      keyTakeaways: [
        'Sample B random indices per step and train only on those rows.',
        'The mini-batch gradient is an unbiased but noisy estimate of the full gradient.',
        'Many cheap noisy steps beat a few exact expensive ones; check full-dataset loss to track true progress.',
      ],
      quiz: [
        {
          question: 'What happens to gradient noise as the batch size B grows?',
          options: [
            'It grows linearly with B',
            'It shrinks, roughly like 1/√B',
            'It stays the same',
            'It disappears at B = 32',
          ],
          answer: 1,
          explanation:
            'Averaging B independent per-example gradients shrinks the standard deviation roughly like 1/√B. It never disappears until B covers the whole dataset, and bigger batches cost proportionally more compute.',
        },
        {
          question: 'Why does the per-step training loss look jagged when using mini-batches?',
          options: [
            'The learning rate is too high',
            'The model is overfitting',
            'Each step measures the loss on a different random subset',
            'tanh saturation',
          ],
          answer: 2,
          explanation:
            'Every batch is a different random sample, so its loss varies around the true average. A too-high learning rate can also cause jumps, but the jaggedness is expected even with a good learning rate.',
        },
      ],
      challenge: {
        title: 'Sample batches and estimate a gradient',
        instructions:
          'Implement sample_batch(n, batch_size, rng): return a list of batch_size indices, each drawn as rng.randrange(n) (sampling with replacement, in draw order). Then implement batch_grad(data, w, idx) for the toy loss L(w) = mean over the batch of (w - data[i])**2: return the mean of 2 * (w - data[i]) over i in idx. Indices may repeat; count each occurrence.',
        starter: String.raw`import random


def sample_batch(n, batch_size, rng):
    """Return batch_size random indices in [0, n) using rng.randrange(n)."""
    # TODO
    raise NotImplementedError


def batch_grad(data, w, idx):
    """Gradient of mean((w - data[i])**2 for i in idx) with respect to w."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import random


def sample_batch(n, batch_size, rng):
    """Return batch_size random indices in [0, n) using rng.randrange(n)."""
    return [rng.randrange(n) for _ in range(batch_size)]


def batch_grad(data, w, idx):
    """Gradient of mean((w - data[i])**2 for i in idx) with respect to w."""
    return sum(2 * (w - data[i]) for i in idx) / len(idx)
`,
        tests: String.raw`import math
import random

ref = random.Random(7)
expected = [ref.randrange(10) for _ in range(5)]
got = sample_batch(10, 5, random.Random(7))
assert got == expected, "use rng.randrange(n) once per index: %r vs %r" % (got, expected)
big = sample_batch(4, 500, random.Random(1))
assert len(big) == 500 and all(0 <= i < 4 for i in big), "indices must be in [0, n)"
assert len(set(big)) == 4, "with replacement over 500 draws every index should appear"

data = [1.0, 2.0, 3.0, 10.0]
w = 0.5
full = batch_grad(data, w, [0, 1, 2, 3])
assert math.isclose(full, 2 * (w - sum(data) / 4), rel_tol=1e-9), "full-batch gradient is 2*(w - mean)"
assert math.isclose(batch_grad(data, w, [3]), 2 * (0.5 - 10.0), rel_tol=1e-9), "single-example gradient wrong"
assert math.isclose(batch_grad(data, w, [0, 0, 3]), (2 * -0.5 * 2 + 2 * -9.5) / 3, rel_tol=1e-9), "repeated indices count each time"

h = 1e-6
idx = [1, 3, 3]
lossf = lambda v: sum((v - data[i]) ** 2 for i in idx) / len(idx)
fd = (lossf(w + h) - lossf(w - h)) / (2 * h)
assert math.isclose(batch_grad(data, w, idx), fd, rel_tol=1e-5), "gradient should match finite differences"

rng = random.Random(0)
est = [batch_grad(data, w, sample_batch(4, 8, rng)) for _ in range(4000)]
avg = sum(est) / len(est)
assert abs(avg - full) < 0.2, "mini-batch gradients should average to the full gradient (unbiased)"
`,
        hint: 'sample_batch is a one-line list comprehension. batch_grad sums 2 * (w - data[i]) over idx and divides by len(idx).',
      },
      lab: 'mlp',
    },
    {
      id: 'mlp-lr-and-splits',
      title: 'Learning-Rate Sweeps and Data Splits',
      minutes: 13,
      summary:
        'Find a good learning rate by sweeping it exponentially, then use train/dev/test splits to tell underfitting from overfitting.',
      sections: [
        {
          title: 'Sweep exponentially',
          body: `Good learning rates can differ by orders of magnitude, so search on a log scale. Pick exponents evenly spaced from, say, −3 to 0 and use lr = 10^e. Run a short training for each value (or increase the rate a little each step within one run) and plot loss against the exponent. Very small rates barely move; very large ones bounce or blow up. The useful region is the valley in between, and a value near its bottom is a solid starting choice.`,
          formula: 'lr_i = 10^(e_lo + i·(e_hi − e_lo)/(n − 1))',
        },
        {
          title: 'Three splits',
          body: `Shuffle the words, then split them, commonly 80% train, 10% dev (validation), and 10% test. Train parameters only on the training split. Tune hyperparameters such as hidden size or learning rate by comparing dev loss. Touch the test split rarely, ideally once at the end, so it remains an honest estimate of performance on new data.`,
        },
        {
          title: 'Reading the losses',
          body: `If training loss and dev loss are about equal and both are disappointing, the model is underfitting: it is too small or undertrained, so make it bigger or train longer. If training loss keeps dropping while dev loss stalls or rises, it is overfitting: it memorizes the training names, so you need more data, a smaller model, or regularization. A large model on a small dataset overfits easily.`,
        },
      ],
      keyTakeaways: [
        'Search learning rates on a log scale and pick a value near the bottom of the loss valley.',
        'Train on train, tune on dev, and report on test as rarely as possible.',
        'Train ≈ dev and both high means underfitting; train ≪ dev means overfitting.',
      ],
      quiz: [
        {
          question:
            'Train loss 2.10, dev loss 2.12, and both are higher than you hoped. What is the most sensible next step?',
          options: [
            'Make the model bigger or train it longer',
            'Add regularization to reduce overfitting',
            'Evaluate on the test set more often',
            'Shrink the hidden layer',
          ],
          answer: 0,
          explanation:
            'Train and dev losses match, so the model is not memorizing; it lacks capacity or training time, which is underfitting. Regularization and shrinking the model fight overfitting and would make things worse.',
        },
        {
          question:
            'Why sweep learning rates as 10^e instead of evenly spaced values like 0.01, 0.02, 0.03?',
          options: [
            'Powers of ten are faster to compute',
            'Useful rates can span several orders of magnitude, so a log scale covers them evenly',
            'Linear spacing makes training diverge',
            'The optimizer requires powers of ten',
          ],
          answer: 1,
          explanation:
            'A good rate might be 0.001 or 0.5. Linear spacing wastes almost all candidates in one decade, while exponent spacing gives each decade equal attention.',
        },
      ],
      challenge: {
        title: 'Run a learning-rate sweep',
        instructions:
          'Implement lr_range(lo_exp, hi_exp, n): return n learning rates 10 ** e with e evenly spaced from lo_exp to hi_exp inclusive (assume n >= 2). Then implement find_best_lr(grad_fn, loss_fn, w0, lrs, steps): for each lr, start at w = w0, run steps of gradient descent (w = w - lr * grad_fn(w)), record loss_fn(w) at the end (treat NaN as float("inf")), and return a tuple (best_lr, losses) where losses is the list of final losses in the same order as lrs and best_lr has the lowest final loss (first one on ties).',
        starter: String.raw`import math


def lr_range(lo_exp, hi_exp, n):
    """n learning rates 10**e, e evenly spaced from lo_exp to hi_exp inclusive."""
    # TODO
    raise NotImplementedError


def find_best_lr(grad_fn, loss_fn, w0, lrs, steps):
    """Train once per lr with plain gradient descent; return (best_lr, final_losses)."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math


def lr_range(lo_exp, hi_exp, n):
    """n learning rates 10**e, e evenly spaced from lo_exp to hi_exp inclusive."""
    return [10 ** (lo_exp + i * (hi_exp - lo_exp) / (n - 1)) for i in range(n)]


def find_best_lr(grad_fn, loss_fn, w0, lrs, steps):
    """Train once per lr with plain gradient descent; return (best_lr, final_losses)."""
    losses = []
    for lr in lrs:
        w = w0
        for _ in range(steps):
            w = w - lr * grad_fn(w)
        loss = loss_fn(w)
        if math.isnan(loss):
            loss = float("inf")
        losses.append(loss)
    best = min(range(len(lrs)), key=lambda i: losses[i])
    return lrs[best], losses
`,
        tests: String.raw`import math

lrs = lr_range(-3, 0, 4)
assert len(lrs) == 4, "should return n values"
assert all(math.isclose(a, b, rel_tol=1e-9) for a, b in zip(lrs, [0.001, 0.01, 0.1, 1.0])), "wrong lr_range: %r" % (lrs,)
lrs2 = lr_range(-2, -1, 3)
assert math.isclose(lrs2[1], 10 ** -1.5, rel_tol=1e-9), "midpoint should be 10**-1.5"

a = 5.0
loss_fn = lambda w: a * (w - 3.0) ** 2
grad_fn = lambda w: 2 * a * (w - 3.0)
sweep = lr_range(-3, 0, 31)
best, losses = find_best_lr(grad_fn, loss_fn, 0.0, sweep, 5)
assert len(losses) == 31, "one final loss per learning rate"
assert math.isclose(best, 0.1, rel_tol=1e-6), "for this quadratic lr = 1/(2a) = 0.1 is optimal, got %r" % best
assert losses[0] > 10.0, "lr=0.001 should barely move from the start"
assert math.isclose(losses[0], a * (3.0 * (1 - 2 * a * 0.001) ** 5) ** 2, rel_tol=1e-6), "slow-lr loss value wrong"
assert losses[-1] > 1e10, "lr=1.0 should diverge on this problem"
i = sweep.index(best)
assert losses[i] <= min(losses), "best_lr must have the smallest loss"

best2, l2 = find_best_lr(lambda w: 1.0, lambda w: float("nan") if w < -1 else w * w, 0.0, [10.0, 0.5], 1)
assert l2[0] == float("inf") and best2 == 0.5, "NaN losses must be treated as inf"
`,
        hint: 'For lr_range, the i-th exponent is lo + i * (hi - lo) / (n - 1). For the sweep, reset w to w0 for every lr and pick the index of the smallest final loss with min(..., key=...).',
      },
      lab: 'mlp',
    },
    {
      id: 'mlp-sampling-hyperparams',
      title: 'Sampling Names and Tuning Hyperparameters',
      minutes: 12,
      summary:
        'Generate new names by repeatedly sampling the next character and sliding the context, then learn which knobs most improve the model.',
      sections: [
        {
          title: 'The sampling loop',
          body: `Start with a context of block_size '.' tokens. Run the network to get logits, softmax them into probabilities, and draw one index from that distribution. Append the sampled character to the output, slide the context window by one, and repeat. Stop when the model samples '.', which it learned to emit at the end of every training word. Because each draw is random, every run produces different names, and good samples look name-like without copying the training set.`,
        },
        {
          title: 'Drawing from a distribution',
          body: `To sample from probabilities p, draw a uniform number r in [0, 1) and walk through the cumulative sums; return the first index whose running total exceeds r. Tokens with larger probability cover a wider slice of [0, 1), so they are chosen more often.`,
          formula: 'choose smallest i with p_0 + … + p_i > r,  r ~ U[0, 1)',
        },
        {
          title: 'The knobs',
          body: `Embedding size controls how much each character can express; 2 is great for plotting but tight for quality. Hidden size sets capacity: more units fit better, until they overfit. Block size sets how much history the model sees, but it also grows W1. Steps and batch size set how much training happens. Learning-rate decay helps at the end: train at a larger rate, then drop it about tenfold for the final stretch to settle into the valley. Change one knob at a time and judge each change by dev loss, not training loss.`,
        },
      ],
      keyTakeaways: [
        "Sampling repeats: predict, draw an index, append, slide the context, stop at '.'.",
        'Inverse-CDF sampling picks the first index whose cumulative probability exceeds a uniform draw.',
        'Tune embedding size, hidden size, block size, steps and learning-rate decay one at a time against dev loss.',
      ],
      quiz: [
        {
          question:
            'Probabilities are [0.2, 0.5, 0.3] and the uniform draw is r = 0.65. Which index is sampled?',
          options: ['0', '2', 'It depends on the seed', '1'],
          answer: 3,
          explanation:
            'Cumulative sums are 0.2, 0.7, 1.0. The first that exceeds 0.65 is 0.7 at index 1. Index 2 would only be chosen for r ≥ 0.7. The seed only matters before r is drawn.',
        },
        {
          question:
            'Training loss keeps improving but dev loss stopped improving long ago. Which change makes the most sense?',
          options: [
            'Triple the hidden size',
            'Increase the number of training steps',
            'Stop increasing capacity; try regularization, more data, or a smaller model',
            'Raise the learning rate tenfold',
          ],
          answer: 2,
          explanation:
            'The gap between train and dev means the model is memorizing. More capacity or more steps would widen the gap. Reducing effective capacity or adding data addresses the real problem.',
        },
      ],
      challenge: {
        title: 'Sample names from a model',
        instructions:
          "Implement sample_index(probs, rng): draw r = rng.random() once and return the first index i whose cumulative sum probs[0] + ... + probs[i] is greater than r (return the last index if rounding leaves none). Then implement generate(next_probs, block_size, itos, rng, max_len=20): start with context = [0] * block_size; repeatedly call next_probs(context) to get a probability list, pick ix = sample_index(probs, rng), stop if ix == 0 (the '.' token), otherwise append itos[ix] to the output and slide the context (context = context[1:] + [ix]). Stop after max_len characters. Return the generated string (without the final '.').",
        starter: String.raw`import random


def sample_index(probs, rng):
    """Inverse-CDF sampling: first i with cumulative probability > rng.random()."""
    # TODO
    raise NotImplementedError


def generate(next_probs, block_size, itos, rng, max_len=20):
    """Generate one name. Index 0 is the '.' end token."""
    # TODO: start from a context of zeros, sample until '.' or max_len
    raise NotImplementedError
`,
        solution: String.raw`import random


def sample_index(probs, rng):
    """Inverse-CDF sampling: first i with cumulative probability > rng.random()."""
    r = rng.random()
    total = 0.0
    for i, p in enumerate(probs):
        total += p
        if total > r:
            return i
    return len(probs) - 1


def generate(next_probs, block_size, itos, rng, max_len=20):
    """Generate one name. Index 0 is the '.' end token."""
    context = [0] * block_size
    out = []
    while len(out) < max_len:
        ix = sample_index(next_probs(context), rng)
        if ix == 0:
            break
        out.append(itos[ix])
        context = context[1:] + [ix]
    return "".join(out)
`,
        tests: String.raw`import random


class FixedRng:
    def __init__(self, values):
        self.values = list(values)

    def random(self):
        return self.values.pop(0)


assert sample_index([0.2, 0.5, 0.3], FixedRng([0.65])) == 1, "r=0.65 should land in index 1"
assert sample_index([0.2, 0.5, 0.3], FixedRng([0.1])) == 0, "r=0.1 should land in index 0"
assert sample_index([0.2, 0.5, 0.3], FixedRng([0.7])) == 2, "r=0.7 is not < 0.7, so index 2"
assert sample_index([0.0, 0.0, 1.0], FixedRng([0.0])) == 2, "zero-probability tokens must never be picked"
assert sample_index([0.5, 0.5 - 1e-12], FixedRng([0.9999999999999])) == 1, "fall back to the last index"

rng = random.Random(42)
counts = [0, 0, 0]
for _ in range(20000):
    counts[sample_index([0.1, 0.6, 0.3], rng)] += 1
assert abs(counts[1] / 20000 - 0.6) < 0.02 and abs(counts[0] / 20000 - 0.1) < 0.02, "empirical frequencies should match probs"

itos = {0: ".", 1: "a", 2: "e", 3: "m"}
seen = []
script = {(0, 0, 0): 2, (0, 0, 2): 3, (0, 2, 3): 3, (2, 3, 3): 1, (3, 3, 1): 0}


def det_probs(context):
    seen.append(tuple(context))
    assert len(context) == 3, "context must always have block_size entries"
    p = [0.0, 0.0, 0.0, 0.0]
    p[script[tuple(context)]] = 1.0
    return p


name = generate(det_probs, 3, itos, random.Random(0))
assert name == "emma", "deterministic model should spell 'emma', got %r" % name
assert seen == [(0, 0, 0), (0, 0, 2), (0, 2, 3), (2, 3, 3), (3, 3, 1)], "context must slide by one each step"

always_a = lambda ctx: [0.0, 1.0, 0.0, 0.0]
assert generate(always_a, 2, itos, random.Random(0), max_len=5) == "aaaaa", "must stop at max_len"
assert generate(lambda ctx: [1.0, 0.0, 0.0, 0.0], 2, itos, random.Random(0)) == "", "immediate '.' gives empty name"
`,
        hint: 'Keep a running total in sample_index and return as soon as it exceeds r. In generate, loop while the output is shorter than max_len, break on index 0, and slide the context after each character.',
      },
      lab: 'mlp',
    },
  ],
};
