import type { CourseModule } from '../../types';

export const gptModule: CourseModule = {
  id: 'gpt',
  number: 7,
  title: 'Build a tiny GPT',
  subtitle: 'From raw characters to a Transformer that writes text, one idea at a time.',
  description:
    'An original, hands-on companion to the lecture on building a GPT from scratch: you will tokenize text, train a bigram baseline, and then grow it into a decoder-only Transformer with causal self-attention, multi-head attention, residual blocks and LayerNorm. Each lesson isolates one idea and has you implement it in plain Python; watch the video for the full build and training run.',
  duration: '1h56m',
  videoId: 'kCc8FmEb1nY',
  sourceTitle: "Let's build GPT: from scratch, in code, spelled out.",
  topics: [
    'Tokenization and batching',
    'Causal self-attention',
    'Transformer blocks',
    'Base models vs assistants',
  ],
  project:
    'A pure-Python toolkit for a tiny GPT: a character tokenizer with training-example builder, a bigram loss, single-head and multi-head causal attention, LayerNorm with pre-norm residuals, and a context-cropping generation loop.',
  lessons: [
    {
      id: 'gpt-data-pipeline',
      title: 'Characters, Chunks and Batches',
      minutes: 10,
      summary:
        'Turn raw text into integer tokens, hold out validation data, and see how one short chunk of text yields many training examples at once.',
      sections: [
        {
          title: 'Characters as integers',
          body: 'A neural network only understands numbers, so the first step is a tokenizer. The simplest one works at the character level: collect every distinct character in the training text, sort them, and give each one an index. encode looks up each character and returns a list of integers; decode maps integers back and joins them into a string. The vocabulary stays tiny (a few dozen symbols for English prose), but sequences are long. Subword tokenizers make the opposite trade: a much larger vocabulary in exchange for shorter sequences.',
          formula: 'decode(encode(s)) = s',
        },
        {
          title: 'Holding out validation data',
          body: 'Before training, split the encoded text into two contiguous parts, for example the first 90% for training and the last 10% for validation. Keeping the split contiguous means the validation text is genuinely unseen prose rather than characters shuffled out of familiar sentences. If training loss keeps falling while validation loss rises, the model is memorizing instead of generalizing.',
        },
        {
          title: 'One chunk, many examples',
          body: 'We never feed the whole text at once. Instead we pick chunks of length block_size + 1. Such a chunk hides block_size separate prediction problems: given the first token predict the second, given the first two predict the third, and so on. Training on all of them teaches the model to work with any context length from 1 up to block_size, which matters later when generation starts from a single character.',
          formula: 'for t = 1..block_size: context = chunk[:t], target = chunk[t]',
        },
        {
          title: 'Random batches',
          body: 'To keep hardware busy, we sample batch_size random starting offsets and stack the chunks into a batch. The inputs x are data[i : i+block_size] and the targets y are the same slice shifted one step right. The rows of a batch are completely independent; they are processed side by side but never exchange information.',
        },
      ],
      keyTakeaways: [
        'A character tokenizer is a pair of lookup tables: string to integers (encode) and back (decode).',
        'A chunk of block_size + 1 tokens contains block_size training examples with growing context.',
        'Targets are the inputs shifted by one position; batch rows are independent of each other.',
      ],
      quiz: [
        {
          question:
            'A chunk of 9 tokens is sampled with block_size = 8. How many (context, target) training examples does it contain?',
          options: ['1', '8', '9', '36'],
          answer: 1,
          explanation:
            'Each position from 1 to 8 serves as a target whose context is everything before it, giving 8 examples. It is not 9 because the first token has no earlier context to predict it from, and not 1 because every prefix is used, not only the full one.',
        },
        {
          question:
            'Why is the train/validation split taken as two contiguous pieces of text rather than random characters?',
          options: [
            'Random splits are slower to compute',
            'Contiguous splits make the vocabulary smaller',
            'So the validation set is truly unseen text and measures generalization honestly',
            'Because the model cannot read characters out of order',
          ],
          answer: 2,
          explanation:
            'If validation characters were scattered through training sentences, the model would see almost all of their surrounding context during training, making validation loss look better than real generalization. Speed and vocabulary size are unaffected by how you split.',
        },
      ],
      challenge: {
        title: 'Tokenizer and training examples',
        instructions:
          'Implement three functions. encode(s, chars) returns a list of ints where each character of s is replaced by its index in the list chars. decode(ids, chars) does the reverse and returns a string. chunk_examples(chunk) takes a list of token ids of length block_size + 1 and returns a list of (context, target) tuples: for t = 1 .. len(chunk) - 1, context is the list chunk[:t] and target is chunk[t]. A chunk of length 0 or 1 gives an empty list.',
        starter: String.raw`def encode(s, chars):
    """Map each character of s to its index in chars. Returns a list of ints."""
    # TODO
    raise NotImplementedError


def decode(ids, chars):
    """Map each int back to its character and join into a string."""
    # TODO
    raise NotImplementedError


def chunk_examples(chunk):
    """Return [(chunk[:t], chunk[t]) for t = 1 .. len(chunk) - 1], contexts as lists."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def encode(s, chars):
    """Map each character of s to its index in chars. Returns a list of ints."""
    stoi = {ch: i for i, ch in enumerate(chars)}
    return [stoi[ch] for ch in s]


def decode(ids, chars):
    """Map each int back to its character and join into a string."""
    return ''.join(chars[i] for i in ids)


def chunk_examples(chunk):
    """Return [(chunk[:t], chunk[t]) for t = 1 .. len(chunk) - 1], contexts as lists."""
    examples = []
    for t in range(1, len(chunk)):
        examples.append((list(chunk[:t]), chunk[t]))
    return examples
`,
        tests: String.raw`chars = sorted(set("hello world"))
assert chars == [' ', 'd', 'e', 'h', 'l', 'o', 'r', 'w']
assert encode("hello", chars) == [3, 2, 4, 4, 5], "encode('hello') should be [3, 2, 4, 4, 5]"
assert encode("", chars) == [], "encoding an empty string gives []"
assert decode([7, 5, 6, 4, 1], chars) == "world", "decode should rebuild 'world'"
assert decode(encode("hello world", chars), chars) == "hello world", "decode(encode(s)) must return s"

ex = chunk_examples([5, 1, 4, 2])
assert ex == [([5], 1), ([5, 1], 4), ([5, 1, 4], 2)], "got %r" % (ex,)
big = chunk_examples(list(range(9)))
assert len(big) == 8, "a chunk of block_size + 1 = 9 tokens gives 8 examples"
assert big[-1] == (list(range(8)), 8), "last example uses the full context"
assert chunk_examples([3]) == [], "a single token has nothing to predict"
assert chunk_examples([]) == [], "empty chunk gives no examples"
`,
        hint: 'Build a dict from character to index once with enumerate. For the examples, loop t from 1 to len(chunk) - 1 and slice.',
      },
      lab: 'attention',
    },
    {
      id: 'gpt-bigram-baseline',
      title: 'The Bigram Baseline',
      minutes: 11,
      summary:
        'Build the simplest possible language model, a table lookup, measure it with cross-entropy, and write the generation loop the Transformer will reuse.',
      sections: [
        {
          title: 'A lookup table that predicts',
          body: 'The bigram model is an embedding table with V rows and V columns, where V is the vocabulary size. To predict what follows token i, it simply reads row i and treats those V numbers as logits, unnormalized scores for every possible next token. Softmax turns logits into a probability distribution. The model looks only at the current token and ignores all earlier context, which makes it a useful baseline: anything smarter should beat it.',
          formula: 'p(next = j | current = i) = exp(W[i][j]) / Σ_k exp(W[i][k])',
        },
        {
          title: 'Scoring with cross-entropy',
          body: 'For every position we know the true next token, so the loss is the average negative log probability the model assigned to it. Batched inputs of shape (B, T) produce logits of shape (B, T, V); for the loss we simply treat them as B·T independent predictions. Compute it through log-softmax with the maximum logit subtracted first, so large logits never overflow exp.',
          formula: 'L = -(1/N) Σ_n log softmax(logits_n)[y_n]',
        },
        {
          title: 'Sanity check at initialization',
          body: 'Before training you can predict the loss. If the initial logits are roughly equal, every token gets probability 1/V, and the loss is -ln(1/V) = ln V. With 65 characters that is about 4.17. If your first measured loss is far above this, the network starts out confidently wrong, which usually means the initial weights are too large.',
          formula: 'L_init ≈ -ln(1/V) = ln V',
        },
        {
          title: 'Generating autoregressively',
          body: 'Generation is a loop: run the model on the current sequence, keep only the logits at the last position, apply softmax, sample one token, append it, and repeat. The bigram model only needs the last token, but writing the loop to accept the whole sequence means the same code will drive the Transformer later.',
        },
      ],
      keyTakeaways: [
        'A bigram model reads the next-token logits straight out of a V-by-V table row.',
        'Cross-entropy is the mean negative log probability of the correct next token; at a uniform start it equals ln V.',
        'Autoregressive generation repeatedly predicts, samples and appends one token at a time.',
      ],
      quiz: [
        {
          question:
            'A freshly initialized model over a vocabulary of 65 characters gives nearly uniform predictions. What loss should you expect?',
          options: ['About 0', 'About 1', 'About 4.17', 'About 65'],
          answer: 2,
          explanation:
            'Uniform predictions give each correct token probability 1/65, and -ln(1/65) = ln 65 ≈ 4.17. A loss of 0 would mean perfect certainty, and 65 confuses the vocabulary size with its logarithm.',
        },
        {
          question: 'During generation, which logits are used to choose the next token?',
          options: [
            'Only the logits at the last position of the sequence',
            'The average of the logits over all positions',
            'The logits at the first position',
            'The logits of a randomly chosen position',
          ],
          answer: 0,
          explanation:
            'The last position is the only one whose prediction concerns the token that does not exist yet. Earlier positions predict tokens we already have, so averaging them would mix in stale predictions.',
        },
      ],
      challenge: {
        title: 'Bigram cross-entropy',
        instructions:
          'Implement bigram_loss(table, xs, ys). table is a list of V rows, each a list of V float logits; row i holds the logits for the token that follows token i. xs and ys are equal-length lists of token ids (inputs and their true next tokens). Return the mean cross-entropy, -(1/N) Σ log softmax(table[xs[n]])[ys[n]], as a float. Subtract the row maximum before exponentiating so large logits do not overflow.',
        starter: String.raw`import math


def bigram_loss(table, xs, ys):
    """Mean cross-entropy of a bigram logit table on (xs -> ys) pairs."""
    # TODO: for each pair, take the row table[x], compute a stable
    # log-softmax, and accumulate -log p(y). Return the mean.
    raise NotImplementedError
`,
        solution: String.raw`import math


def bigram_loss(table, xs, ys):
    """Mean cross-entropy of a bigram logit table on (xs -> ys) pairs."""
    total = 0.0
    for x, y in zip(xs, ys):
        row = table[x]
        m = max(row)
        log_sum = m + math.log(sum(math.exp(v - m) for v in row))
        total += log_sum - row[y]
    return total / len(xs)
`,
        tests: String.raw`import math

V = 65
zeros = [[0.0] * V for _ in range(V)]
loss = bigram_loss(zeros, [0, 5, 64], [3, 3, 0])
assert math.isclose(loss, math.log(V), rel_tol=1e-6), "uniform logits should give ln V, got %r" % loss

table = [[2.0, 0.0], [0.0, 1.0]]
expected = (math.log1p(math.exp(-2.0)) + math.log1p(math.exp(1.0))) / 2
got = bigram_loss(table, [0, 1], [0, 0])
assert math.isclose(got, expected, rel_tol=1e-6), "expected %r, got %r" % (expected, got)

big = [[1000.0, 0.0], [0.0, 0.0]]
assert math.isclose(bigram_loss(big, [0], [0]), 0.0, abs_tol=1e-9), "confident correct prediction should cost ~0"
assert math.isclose(bigram_loss(big, [0], [1]), 1000.0, rel_tol=1e-6), "must be numerically stable for large logits"
`,
        hint: 'log softmax(row)[y] = row[y] - (m + log Σ exp(row_k - m)) where m = max(row). Negate it and average over the pairs.',
      },
      lab: 'attention',
    },
    {
      id: 'gpt-self-attention',
      title: 'Causal Self-Attention',
      minutes: 14,
      summary:
        'Let each token gather information from earlier tokens using data-dependent weights computed from queries and keys, while never peeking at the future.',
      sections: [
        {
          title: 'The averaging trick',
          body: 'The crudest way for token t to learn about its past is to average the vectors of tokens 1 through t. That can be done for every position at once with one matrix multiply by a lower-triangular weight matrix whose rows each sum to 1. An equivalent recipe sets the upper-triangle scores to minus infinity and applies softmax row by row: zeros become uniform weights over the allowed positions, and the future gets weight exactly 0.',
        },
        {
          title: 'Queries, keys and values',
          body: 'Uniform averaging treats every past token as equally relevant. Self-attention makes the weights depend on the data. Each token produces three vectors through learned linear maps: a query (what am I looking for), a key (what do I contain) and a value (what I will pass on if chosen). The affinity between position t and position s is the dot product of q_t and k_s, so tokens whose keys match a query receive more weight.',
          formula: 'out_t = Σ_{s ≤ t} softmax_s(q_t · k_s / √d) · v_s',
        },
        {
          title: 'Why divide by √head_size',
          body: 'If query and key entries have unit variance, their dot product over d dimensions has variance about d. Large scores push softmax toward a one-hot vector, so each token listens to a single neighbor and gradients become tiny. Dividing by √d keeps the scores near unit variance, and softmax stays soft at initialization.',
          formula: 'score(t, s) = q_t · k_s / √d',
        },
        {
          title: 'Masking the future',
          body: 'For a language model, position t must not see tokens after t, otherwise predicting the next token is trivial. Before softmax we set every score with s greater than t to minus infinity; exp of that is 0. This masked version is a decoder block. Tasks like classifying a whole sentence can drop the mask and let all tokens talk freely.',
        },
        {
          title: 'Encoder, decoder and cross-attention',
          body: 'The original Transformer was built for translation and had two stacks. The encoder reads the whole source sentence with unmasked self-attention, so every source token can look at every other one, both earlier and later. The decoder writes the translation one token at a time. Each decoder block has masked self-attention over the words written so far, then a second attention layer called cross-attention, and then the feed-forward layer.\n\nIn cross-attention the queries come from the decoder (what am I trying to write next?) while the keys and values come from the encoder output (what does the source sentence contain?). No causal mask is needed there, because the whole source is already known. Self-attention means q, k and v all come from the same sequence; cross-attention means q comes from one sequence and k, v from another.\n\nGPT keeps only the decoder half and drops cross-attention, because there is no separate source to read. It is decoder-only: a stack of blocks with masked self-attention and feed-forward layers, conditioned on nothing but its own past tokens.\n\n```python\n# self-attention: one sequence x talks to itself\nq, k, v = x @ Wq, x @ Wk, x @ Wv\n# cross-attention: decoder states ask questions of the encoder output\nq = dec @ Wq\nk, v = enc @ Wk, enc @ Wv      # no causal mask on this one\n```',
        },
      ],
      keyTakeaways: [
        'A lower-triangular mask plus softmax turns raw scores into weights over past positions only.',
        'Queries and keys decide how much to attend; values carry what is actually communicated.',
        'Scaling scores by 1/√head_size keeps softmax from saturating into one-hot weights.',
      ],
      quiz: [
        {
          question:
            'What happens if attention scores are NOT divided by √head_size and head_size is large?',
          options: [
            'The outputs become exactly zero',
            'Softmax becomes very peaked, so each token attends almost entirely to one position',
            'The mask stops working',
            'Values are ignored and only keys are returned',
          ],
          answer: 1,
          explanation:
            'Unscaled dot products have variance proportional to head_size, so some scores dominate and softmax approaches one-hot, which also shrinks gradients. The mask still works because -inf stays -inf regardless of scaling.',
        },
        {
          question:
            'With all attention scores equal to zero, what does causal attention output at position t?',
          options: [
            'The value vector at position t only',
            'A vector of zeros',
            'The average of all value vectors including future ones',
            'The average of the value vectors at positions 1 through t',
          ],
          answer: 3,
          explanation:
            'Equal scores give uniform softmax weights over the unmasked positions, which are 1..t. Future positions are masked to -inf and receive weight 0, so they are not part of the average.',
        },
      ],
      challenge: {
        title: 'Single-head causal attention',
        instructions:
          'Implement causal_attention(q, k, v). q and k are lists of T vectors of length d (lists of floats); v is a list of T vectors of length dv. For each position t, compute scores q[t]·k[s] / sqrt(d) for s = 0..t only (later positions are masked out), turn them into weights with a numerically stable softmax, and return the weighted sum of v[0..t]. Return a list of T output vectors, each of length dv.',
        starter: String.raw`import math


def causal_attention(q, k, v):
    """Single-head causal self-attention on plain Python lists.

    q, k: T vectors of length d.  v: T vectors of length dv.
    Returns T output vectors of length dv.
    """
    # TODO: for each t, score positions s <= t, softmax, mix the values.
    raise NotImplementedError
`,
        solution: String.raw`import math


def causal_attention(q, k, v):
    """Single-head causal self-attention on plain Python lists.

    q, k: T vectors of length d.  v: T vectors of length dv.
    Returns T output vectors of length dv.
    """
    T = len(q)
    d = len(q[0])
    dv = len(v[0])
    scale = 1.0 / math.sqrt(d)
    out = []
    for t in range(T):
        scores = [sum(a * b for a, b in zip(q[t], k[s])) * scale for s in range(t + 1)]
        m = max(scores)
        exps = [math.exp(x - m) for x in scores]
        z = sum(exps)
        weights = [e / z for e in exps]
        row = [0.0] * dv
        for s in range(t + 1):
            for j in range(dv):
                row[j] += weights[s] * v[s][j]
        out.append(row)
    return out
`,
        tests: String.raw`import math

def close_vec(a, b):
    return len(a) == len(b) and all(math.isclose(x, y, rel_tol=1e-6, abs_tol=1e-9) for x, y in zip(a, b))

# zero queries -> uniform weights -> running average of values (the averaging trick)
q0 = [[0.0, 0.0]] * 3
v = [[3.0, 0.0], [5.0, 2.0], [1.0, 4.0]]
out = causal_attention(q0, [[1.0, 2.0], [3.0, -1.0], [0.5, 0.5]], v)
assert close_vec(out[0], [3.0, 0.0]), "position 0 can only see itself"
assert close_vec(out[1], [4.0, 1.0]), "position 1 should average v[0], v[1], got %r" % (out[1],)
assert close_vec(out[2], [3.0, 2.0]), "position 2 should average v[0..2], got %r" % (out[2],)

# hand-computed case with d = 1 (scale 1)
out = causal_attention([[1.0], [2.0]], [[1.0], [3.0]], [[10.0], [20.0]])
w0 = math.exp(2.0) / (math.exp(2.0) + math.exp(6.0))
assert close_vec(out[1], [w0 * 10.0 + (1 - w0) * 20.0]), "wrong weights at position 1: %r" % (out[1],)

# scaling by 1/sqrt(d): d = 4, raw score 4 becomes 2
q = [[1.0] * 4, [1.0] * 4]
k = [[0.0] * 4, [1.0] * 4]
out = causal_attention(q, k, [[0.0], [1.0]])
w1 = math.exp(2.0) / (1.0 + math.exp(2.0))
assert close_vec(out[1], [w1]), "scores must be divided by sqrt(d): expected %r got %r" % (w1, out[1])

# future must be masked: changing a later value must not change earlier outputs
a = causal_attention(q0, q0, [[1.0], [2.0], [3.0]])
b = causal_attention(q0, q0, [[1.0], [2.0], [999.0]])
assert close_vec(a[1], b[1]), "position 1 must not see position 2"

# stability with huge scores
out = causal_attention([[100.0], [100.0]], [[100.0], [-100.0]], [[1.0], [2.0]])
assert close_vec(out[1], [1.0]), "softmax must be stable for large scores"
`,
        hint: 'Only loop s over range(t + 1), which is the mask. Subtract the max score before exp, divide by the sum, then accumulate weights[s] * v[s].',
      },
      lab: 'attention',
    },
    {
      id: 'gpt-multi-head',
      title: 'Multi-Head Attention',
      minutes: 12,
      summary:
        'Run several small attention heads in parallel, concatenate their outputs and project back, and see attention as the communication step of a Transformer.',
      sections: [
        {
          title: 'Many smaller heads',
          body: 'One attention head computes a single set of weights per position, so it can only track one kind of relationship at a time. Multi-head attention runs h heads side by side, each with its own query, key and value projections and a head size of n_embd / h. The heads never share weights or scores, so they are free to specialize: one might follow the previous vowel, another the start of the current word, another a matching bracket. Because each head is smaller, the total cost is similar to one big head.',
        },
        {
          title: 'Concatenate, then project',
          body: 'Each head returns a T by head_size output. Concatenating them along the feature dimension restores a width of h times head_size, which equals n_embd. A final learned linear layer, the output projection, then mixes information across heads and maps the result back into the main stream of the network, where it is added to the input in a residual connection.',
          formula: 'MultiHead(x) = Concat(head_1, ..., head_h) · W_O',
        },
        {
          title: 'Communication versus computation',
          body: 'A helpful mental model: attention is communication. Picture the tokens as nodes in a directed graph, with each node receiving edges from itself and every earlier node. Each node sends out a message (its value) and decides, based on queries and keys, how much to listen to each incoming edge. Attention has no built-in notion of where a node sits; it just aggregates over a set. After communicating, each token needs to think about what it gathered on its own, which is the job of the feed-forward layer covered next. A Transformer alternates these two steps many times.',
        },
      ],
      keyTakeaways: [
        'Multi-head attention runs independent heads in parallel, each with head_size = n_embd / h.',
        'Head outputs are concatenated along features and passed through an output projection W_O.',
        'Attention is the communication step between tokens; feed-forward layers are per-token computation.',
      ],
      quiz: [
        {
          question:
            'With n_embd = 384 and 6 heads, what is the usual head_size, and what is the width after concatenation?',
          options: ['384 and 2304', '64 and 384', '6 and 64', '64 and 64'],
          answer: 1,
          explanation:
            'Each head gets 384 / 6 = 64 dimensions, and concatenating 6 heads of width 64 gives back 384. Giving each head the full 384 would make the concatenation 2304 wide and multiply the cost.',
        },
        {
          question: 'What does the output projection W_O add on top of plain concatenation?',
          options: [
            'It applies the causal mask',
            'It normalizes each head to unit variance',
            'It reorders tokens by position',
            'It lets the model mix information across heads and map it back into the residual stream',
          ],
          answer: 3,
          explanation:
            'Concatenation just places head outputs side by side; W_O is a learned linear map that combines them. The mask is applied inside each head before softmax, and normalization is LayerNorm, a separate component.',
        },
      ],
      challenge: {
        title: 'Multi-head attention from heads',
        instructions:
          'Implement multi_head_attention(x, heads, w_o). x is a list of T vectors of width C. heads is a list of (Wq, Wk, Wv) tuples, each matrix a list of C rows of length head_size. w_o is a matrix with (number of heads × head_size) rows and C columns. For each head compute q = matmul(x, Wq), k = matmul(x, Wk), v = matmul(x, Wv), then causal_attention(q, k, v). Concatenate the head outputs along the feature dimension in head order, then return matmul(concat, w_o), a list of T vectors of width C. The helpers matmul and causal_attention are provided.',
        starter: String.raw`import math


def matmul(A, B):
    """(n x m) @ (m x p) on lists of rows."""
    return [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]


def causal_attention(q, k, v):
    """Single-head causal attention (provided)."""
    d = len(q[0])
    out = []
    for t in range(len(q)):
        s = [sum(a * b for a, b in zip(q[t], k[j])) / math.sqrt(d) for j in range(t + 1)]
        m = max(s)
        e = [math.exp(x - m) for x in s]
        z = sum(e)
        out.append([sum(e[j] / z * v[j][c] for j in range(t + 1)) for c in range(len(v[0]))])
    return out


def multi_head_attention(x, heads, w_o):
    """Run every head, concatenate along features, project with w_o."""
    # TODO: compute each head's output, concatenate row by row, then project.
    raise NotImplementedError
`,
        solution: String.raw`import math


def matmul(A, B):
    """(n x m) @ (m x p) on lists of rows."""
    return [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]


def causal_attention(q, k, v):
    """Single-head causal attention (provided)."""
    d = len(q[0])
    out = []
    for t in range(len(q)):
        s = [sum(a * b for a, b in zip(q[t], k[j])) / math.sqrt(d) for j in range(t + 1)]
        m = max(s)
        e = [math.exp(x - m) for x in s]
        z = sum(e)
        out.append([sum(e[j] / z * v[j][c] for j in range(t + 1)) for c in range(len(v[0]))])
    return out


def multi_head_attention(x, heads, w_o):
    """Run every head, concatenate along features, project with w_o."""
    head_outs = []
    for Wq, Wk, Wv in heads:
        q = matmul(x, Wq)
        k = matmul(x, Wk)
        v = matmul(x, Wv)
        head_outs.append(causal_attention(q, k, v))
    concat = []
    for t in range(len(x)):
        row = []
        for h in head_outs:
            row.extend(h[t])
        concat.append(row)
    return matmul(concat, w_o)
`,
        tests: String.raw`import math

def close_mat(A, B):
    return len(A) == len(B) and all(
        len(a) == len(b) and all(math.isclose(x, y, rel_tol=1e-6, abs_tol=1e-9) for x, y in zip(a, b))
        for a, b in zip(A, B))

# Hand-computed: zero Wq/Wk -> uniform causal averaging inside each head.
x = [[1.0, 0.0], [0.0, 1.0]]
Z = [[0.0], [0.0]]
head1 = (Z, Z, [[1.0], [0.0]])   # values = feature 0 -> running avg [1, 0.5]
head2 = (Z, Z, [[0.0], [1.0]])   # values = feature 1 -> running avg [0, 0.5]
w_o = [[1.0, 2.0], [3.0, 4.0]]
out = multi_head_attention(x, [head1, head2], w_o)
assert close_mat(out, [[1.0, 2.0], [2.0, 3.0]]), "expected [[1, 2], [2, 3]], got %r" % (out,)

# Head order matters: swapping heads changes the concatenation.
out_sw = multi_head_attention(x, [head2, head1], w_o)
assert close_mat(out_sw, [[3.0, 4.0], [2.0, 3.0]]), "concatenate heads in the given order, got %r" % (out_sw,)

# Non-trivial heads: compare with a step-by-step reference built from the helpers.
x = [[0.5, -1.0, 2.0], [1.5, 0.0, -0.5], [-1.0, 1.0, 1.0]]
hA = ([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]], [[0.5, -0.5], [1.0, 0.0], [0.0, 2.0]], [[1.0, 2.0], [0.0, -1.0], [3.0, 0.5]])
hB = ([[0.0, 1.0], [2.0, 0.0], [-1.0, 0.5]], [[1.0, 1.0], [0.0, -1.0], [0.5, 0.0]], [[0.0, 1.0], [1.0, 1.0], [-2.0, 0.0]])
w_o = [[0.1, 0.2, 0.3], [0.0, -0.4, 1.0], [0.5, 0.5, 0.5], [-1.0, 0.0, 0.2]]
oA = causal_attention(matmul(x, hA[0]), matmul(x, hA[1]), matmul(x, hA[2]))
oB = causal_attention(matmul(x, hB[0]), matmul(x, hB[1]), matmul(x, hB[2]))
ref = matmul([oA[t] + oB[t] for t in range(3)], w_o)
out = multi_head_attention(x, [hA, hB], w_o)
assert len(out) == 3 and all(len(r) == 3 for r in out), "output must be T x C"
assert close_mat(out, ref), "mismatch with reference: %r vs %r" % (out, ref)
`,
        hint: 'Collect each head output (a T x head_size list), then for every position t build one long row by extending with each head row t in order, and finally multiply by w_o.',
      },
      lab: 'attention',
    },
    {
      id: 'gpt-transformer-block',
      title: 'The Transformer Block',
      minutes: 13,
      summary:
        'Combine attention with a feed-forward network, residual connections, pre-norm LayerNorm and positional embeddings into the block that GPT stacks.',
      sections: [
        {
          title: 'Feed-forward: per-token computation',
          body: 'After tokens communicate through attention, each position passes its vector through a small MLP on its own: a linear layer that expands the width (commonly by 4), a nonlinearity such as ReLU or GELU, and a linear layer back to n_embd. The same weights apply at every position, and no information flows between tokens here.',
        },
        {
          title: 'Residual connections',
          body: 'Deep stacks are hard to optimize, so each sublayer adds its output to its input instead of replacing it. During backpropagation an addition passes the gradient through unchanged, creating a direct highway from the loss to the earliest layers. At initialization the sublayers contribute little, so the network behaves like a shallow one and gradually learns to use its depth.',
          formula: 'x = x + Attn(LN(x));  x = x + FFN(LN(x))',
        },
        {
          title: 'LayerNorm, applied first',
          body: 'LayerNorm normalizes each token vector across its own features to mean 0 and variance 1, then applies a learned scale γ and shift β. Unlike batch normalization it uses no batch statistics and no running buffers, so it behaves the same in training and inference. Modern GPTs use pre-norm: normalize the input to each sublayer, as in the formula above, and add one final LayerNorm before the output head.',
          formula: 'LN(x)_i = γ_i · (x_i − μ) / √(σ² + ε) + β_i',
        },
        {
          title: 'Pre-norm versus post-norm',
          body: 'The 2017 Transformer paper put LayerNorm after the residual add: x = LN(x + Sublayer(x)). That is post-norm. Most GPT-style models since then move it to the front of each branch: x = x + Sublayer(LN(x)). That is pre-norm.\n\nThe difference matters for the gradient highway. In pre-norm the residual path from the output back to the input is a chain of plain additions, so gradient flows straight through every block untouched, and deep stacks train more easily, often with less learning-rate warmup. In post-norm every block passes its signal (and its gradient) through a normalization, so the clean path is broken. Because pre-norm never normalizes the residual stream itself, it needs one extra LayerNorm (ln_f) at the very end, before the output head.\n\n```python\n# post-norm (original Transformer)\nx = ln1(x + attn(x))\nx = ln2(x + ffwd(x))\n# pre-norm (GPT-2 style, what we build)\nx = x + attn(ln1(x))\nx = x + ffwd(ln2(x))\nlogits = lm_head(ln_f(x))\n```',
        },
        {
          title: 'Where dropout goes',
          body: 'In a GPT like ours, dropout sits in two kinds of places. First, on the attention weights right after softmax, so on a given step a token randomly cannot listen to some of its past positions. Second, on the output of each residual branch (after the attention projection and after the feed-forward layer), just before it is added back into the stream. Larger models such as GPT-2 also apply it to the summed token and position embeddings; our downloadable gpt.py skips that one. It is never applied to the residual stream itself, so the gradient highway stays clean. Dropout is only active in training mode; model.eval() turns it into a no-op.\n\n```python\natt = dropout(softmax(masked_scores))   # 1. on attention weights\nx = x + dropout(proj(att @ v))          # 2. on the attention branch output\nx = x + dropout(ffwd(ln2(x)))           #    and on the MLP branch output\n```',
        },
        {
          title: 'Positional embeddings',
          body: 'Attention is a weighted sum over a set. Without a mask and without positions, self-attention is permutation equivariant: shuffle the input tokens and the outputs come back shuffled in exactly the same way, so the layer itself has no idea about order. (Equivariant, not invariant: the outputs do change, they just move along with their inputs.) The causal mask does break this symmetry a little, because position t can see t tokens and position 1 can see only itself. But that is a weak, indirect hint. In a single causal layer, the output at position t still treats its visible past as an unordered bag: swap two earlier tokens and that output does not change. To give every slot a clear identity, a second learned table with block_size rows maps each position to a vector, which is added to the token embedding. This is also why the model cannot see more than block_size tokens at once.',
          formula: 'x_t = tok_emb[idx_t] + pos_emb[t]',
        },
      ],
      keyTakeaways: [
        'A block is attention (communication) followed by a feed-forward MLP (computation), each wrapped in a residual.',
        'Pre-norm LayerNorm normalizes each token across features before every sublayer, with no batch dependence.',
        'Without a mask or positions, self-attention is permutation equivariant (shuffle inputs, outputs shuffle the same way); the causal mask adds only a weak order hint, so position vectors are added to token embeddings.',
      ],
      quiz: [
        {
          question: 'Why does a Transformer need positional embeddings?',
          options: [
            'Attention mixes its inputs as a set: unmasked, reordering tokens just reorders outputs, and a causal mask alone gives only a weak hint of order',
            'They make the vocabulary larger',
            'They replace the causal mask',
            'They normalize the activations',
          ],
          answer: 0,
          explanation:
            'Dot products and weighted sums do not depend on where a token sits, so attention alone cannot tell "dog bites man" from "man bites dog". Without a mask the layer is permutation equivariant. The causal mask hides future tokens, so each position sees a prefix of a different length, but within that prefix one attention layer still sums over an unordered set; it does not say which earlier token sat where.',
        },
        {
          question: 'How does LayerNorm differ from BatchNorm in a GPT?',
          options: [
            'LayerNorm only works on images',
            'LayerNorm has no learnable parameters',
            'LayerNorm normalizes each token across its features, so it needs no batch statistics or running averages',
            'LayerNorm normalizes each feature across the batch',
          ],
          answer: 2,
          explanation:
            'LayerNorm computes mean and variance over the feature dimension of a single example, so it behaves identically in training and inference. Normalizing each feature across the batch is what BatchNorm does, and LayerNorm still has learnable γ and β.',
        },
      ],
      challenge: {
        title: 'LayerNorm and a pre-norm residual',
        instructions:
          'Implement layer_norm(x, gamma, beta, eps=1e-5): x, gamma and beta are lists of the same length C. Compute the mean μ and the biased variance σ² (divide by C) of x, and return [gamma[i] * (x[i] - μ) / sqrt(σ² + eps) + beta[i]]. Then implement pre_norm_residual(x, sublayer, gamma, beta), which returns x + sublayer(layer_norm(x, gamma, beta)) element by element (sublayer is a function from a list of C floats to a list of C floats).',
        starter: String.raw`import math


def layer_norm(x, gamma, beta, eps=1e-5):
    """Normalize one token vector across its features, then scale and shift."""
    # TODO
    raise NotImplementedError


def pre_norm_residual(x, sublayer, gamma, beta):
    """Return x + sublayer(layer_norm(x)) element-wise."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math


def layer_norm(x, gamma, beta, eps=1e-5):
    """Normalize one token vector across its features, then scale and shift."""
    n = len(x)
    mu = sum(x) / n
    var = sum((v - mu) ** 2 for v in x) / n
    inv = 1.0 / math.sqrt(var + eps)
    return [g * (v - mu) * inv + b for v, g, b in zip(x, gamma, beta)]


def pre_norm_residual(x, sublayer, gamma, beta):
    """Return x + sublayer(layer_norm(x)) element-wise."""
    h = sublayer(layer_norm(x, gamma, beta))
    return [a + b for a, b in zip(x, h)]
`,
        tests: String.raw`import math

def close_vec(a, b, tol=1e-6):
    return len(a) == len(b) and all(math.isclose(p, q, rel_tol=tol, abs_tol=1e-9) for p, q in zip(a, b))

x = [1.0, 2.0, 3.0, 4.0]
ones, zeros = [1.0] * 4, [0.0] * 4
y = layer_norm(x, ones, zeros)
s = math.sqrt(1.25 + 1e-5)
assert close_vec(y, [-1.5 / s, -0.5 / s, 0.5 / s, 1.5 / s]), "got %r" % (y,)
assert abs(sum(y)) < 1e-9, "output mean should be 0"
assert math.isclose(sum(v * v for v in y) / 4, 1.25 / (1.25 + 1e-5), rel_tol=1e-6), "use the biased variance (divide by C)"

y2 = layer_norm(x, [2.0, 2.0, 0.5, 1.0], [1.0, 0.0, -1.0, 3.0])
assert close_vec(y2, [2 * -1.5 / s + 1, 2 * -0.5 / s, 0.5 * 0.5 / s - 1, 1.5 / s + 3]), "gamma/beta wrong: %r" % (y2,)

const = layer_norm([7.0, 7.0, 7.0], [1.0] * 3, [0.5, -0.5, 2.0])
assert close_vec(const, [0.5, -0.5, 2.0]), "constant input should give beta, got %r" % (const,)

scaled = layer_norm([10.0, 20.0, 30.0, 40.0], ones, zeros)
assert close_vec(scaled, layer_norm([1.0, 2.0, 3.0, 4.0], ones, [0.0] * 4, eps=1e-7), tol=1e-4), "LayerNorm is scale invariant"

double = lambda v: [2 * a for a in v]
r = pre_norm_residual(x, double, ones, zeros)
assert close_vec(r, [a + 2 * b for a, b in zip(x, y)]), "residual must add the sublayer output to x, got %r" % (r,)
r0 = pre_norm_residual(x, lambda v: [0.0] * len(v), ones, zeros)
assert close_vec(r0, x), "a zero sublayer must leave x unchanged"
`,
        hint: 'Compute the mean, then the average squared deviation, then normalize each element. For the residual, call layer_norm, pass the result to sublayer, and add x back.',
      },
      lab: 'attention',
    },
    {
      id: 'gpt-full-model',
      title: 'Generate, Scale, and Align',
      minutes: 12,
      summary:
        'Generate from the full model with a cropped context window, understand the training tools used to scale it up, and see how a base model differs from a chat assistant.',
      sections: [
        {
          title: 'Generating with a fixed window',
          body: 'The full model stacks token and position embeddings, several Transformer blocks, a final LayerNorm and a linear head that produces logits over the vocabulary. Because the position table only has block_size rows, the model cannot accept a longer input. During generation the sequence keeps growing, so before every forward pass we crop it to its last block_size tokens, take the logits at the final position, sample, and append.',
          formula: 'idx_cond = idx[-block_size:]',
        },
        {
          title: 'Training tools for scaling up',
          body: 'AdamW adapts the step size of each parameter using running averages of its gradient and squared gradient, and applies weight decay directly to the weights rather than mixing it into the gradient. Dropout randomly zeroes a fraction of activations during training, which discourages co-dependence between units and acts like training an ensemble of thinner networks; it is switched off at inference. Scaling up means more layers, more heads, a wider embedding and a longer context, usually with a smaller learning rate. Watching validation loss tells you when the bigger model starts to overfit.',
        },
        {
          title: 'Measuring loss honestly: estimate_loss',
          body: 'The loss of one batch is noisy, so the training loop reports an average over many batches for both the train and validation splits. Three details make that number trustworthy and cheap. First, wrap it in torch.no_grad(): we never call backward here, so there is no need to store the graph, which saves memory and time. Second, call model.eval() before measuring, so dropout is switched off and you score the full model rather than a random thinned one. (Layers like BatchNorm would also switch to running statistics in eval mode; our GPT has none, but the habit matters.) Third, call model.train() afterwards, or the rest of training would silently run without dropout.\n\n```python\n@torch.no_grad()                 # no graph, no gradients\ndef estimate_loss():\n    model.eval()                 # dropout off while we measure\n    out = {}\n    for split in ("train", "val"):\n        losses = [model(*get_batch(split))[1] for _ in range(eval_iters)]\n        out[split] = torch.stack(losses).mean().item()\n    model.train()                # restore training behaviour\n    return out\n```\n\nA big, growing gap between train and val loss means the model is memorising the training text, which is the cue to add dropout, shrink the model, or stop earlier.',
        },
        {
          title: 'Base model versus assistant',
          body: 'Pretraining on a large corpus produces a base model: a document completer. Ask it a question and it may continue with more questions, because that is what similar documents look like. A ChatGPT-style assistant adds alignment stages. First, supervised fine-tuning on example conversations teaches the question-and-answer format. Next, people rank alternative answers, and a reward model learns to predict their preferences. Finally, reinforcement learning tunes the model to produce answers the reward model scores highly (RLHF). The tiny GPT you build here stops after pretraining.',
        },
      ],
      keyTakeaways: [
        'During generation, crop the context to the last block_size tokens because position embeddings stop there.',
        'AdamW and dropout help large models train stably and generalize; validation loss guides scaling.',
        'A pretrained base model completes documents; assistants need fine-tuning and RLHF on top.',
      ],
      quiz: [
        {
          question: 'Why must the context be cropped to block_size tokens during generation?',
          options: [
            'To make sampling deterministic',
            'Because the vocabulary is limited to block_size tokens',
            'Because the position embedding table has only block_size rows, so longer inputs have no position vector',
            'To prevent the causal mask from leaking future tokens',
          ],
          answer: 2,
          explanation:
            'Position t looks up row t of the position table, which only goes up to block_size - 1. Cropping has nothing to do with the vocabulary size or with randomness in sampling.',
        },
        {
          question:
            'You ask a freshly pretrained base model "What is the capital of France?" What is the most likely behavior?',
          options: [
            'It may continue the text as a document would, for example with more quiz questions',
            'It always answers "Paris" politely',
            'It refuses because it has not been aligned',
            'It returns an error because questions are not allowed',
          ],
          answer: 0,
          explanation:
            'A base model only learned to continue documents, and a list of quiz questions is a common continuation. Reliable direct, polite answers come from fine-tuning and RLHF, which a base model has not had.',
        },
      ],
      challenge: {
        title: 'Generation loop with context cropping',
        instructions:
          'Implement generate(next_token_probs, idx, max_new_tokens, block_size). next_token_probs is a function that takes a context list of token ids and returns a list of probabilities over the vocabulary for the next token. Starting from the list idx, repeat max_new_tokens times: crop the sequence to its last block_size tokens, call next_token_probs on the cropped context, pick the token with the highest probability (greedy decoding; on ties pick the smallest index), and append it. Return the full sequence as a new list and do not modify idx.',
        starter: String.raw`def generate(next_token_probs, idx, max_new_tokens, block_size):
    """Greedy autoregressive generation with a context window of block_size."""
    # TODO: copy idx, then loop: crop, predict, argmax, append.
    raise NotImplementedError
`,
        solution: String.raw`def generate(next_token_probs, idx, max_new_tokens, block_size):
    """Greedy autoregressive generation with a context window of block_size."""
    seq = list(idx)
    for _ in range(max_new_tokens):
        context = seq[-block_size:]
        probs = next_token_probs(context)
        best = 0
        for i in range(1, len(probs)):
            if probs[i] > probs[best]:
                best = i
        seq.append(best)
    return seq
`,
        tests: String.raw`V = 5
seen = []

def model(context):
    seen.append(len(context))
    assert len(context) <= 2, "context longer than block_size was passed to the model"
    p = [0.0] * V
    p[sum(context) % V] = 1.0
    return p

start = [1, 2]
out = generate(model, start, 3, 2)
assert out == [1, 2, 3, 0, 3], "expected [1, 2, 3, 0, 3], got %r" % (out,)
assert start == [1, 2], "generate must not modify idx"
assert seen == [2, 2, 2], "each step should see the cropped context"

seen.clear()
out = generate(model, [4], 2, 2)
assert out == [4, 4, 3], "short contexts are used as-is: got %r" % (out,)
assert seen == [1, 2]

assert generate(model, [1, 2], 0, 2) == [1, 2], "zero new tokens returns a copy of idx"
assert generate(lambda c: [0.4, 0.4, 0.2], [0], 2, 4) == [0, 0, 0], "ties go to the smallest index"
`,
        hint: 'Work on seq = list(idx). Slicing with seq[-block_size:] crops safely even when seq is shorter. Track the index of the largest probability with a strict > comparison so ties keep the first one.',
      },
      lab: 'attention',
    },
  ],
};
