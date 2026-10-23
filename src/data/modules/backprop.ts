import type { CourseModule } from '../../types';

export const backpropModule: CourseModule = {
  id: 'backprop',
  number: 5,
  title: 'Backprop ninja',
  subtitle: 'Derive every gradient of an MLP by hand — no autograd allowed.',
  description:
    "An original, hands-on companion to the lecture 'Building makemore Part 4: Becoming a Backprop Ninja'. You will break a character-level MLP into tiny operations, push gradients through each one manually, and prove your math with numerical gradient checks. Watch the video for the full build; this module focuses on the reasoning and the drills.",
  duration: '1h55m',
  videoId: 'q8SA3rM6ckI',
  sourceTitle: 'Building makemore Part 4: Becoming a Backprop Ninja',
  topics: [
    'Manual backprop through cross-entropy',
    'Matmul and tanh gradients',
    'BatchNorm backward',
    'Gradient checking',
  ],
  project:
    'A pure-Python toolkit of hand-written backward passes — cross-entropy, linear, tanh, BatchNorm and embedding layers — each verified against finite-difference gradient checks.',
  lessons: [
    {
      id: 'backprop-cross-entropy-steps',
      title: 'Cross-Entropy, One Atom at a Time',
      minutes: 12,
      summary:
        'Rewrite the cross-entropy loss as a chain of single-purpose steps, including the max-subtraction trick that keeps softmax numerically stable.',
      sections: [
        {
          title: 'Why break the loss apart',
          body: 'A library call like cross_entropy hides a whole pipeline of simple operations. To backpropagate by hand, every intermediate tensor needs a name, because each one will later receive its own gradient. The rule of the game: each line of the forward pass does exactly one thing — a subtraction, an exponential, a sum, a reciprocal, a product, a log, or an indexing step. Small steps mean small, checkable local derivatives.',
        },
        {
          title: 'The stable softmax trick',
          body: 'Exponentiating a logit of 1000 overflows a float. Softmax does not care if every logit in a row shifts by the same constant, so we subtract the row maximum first. The largest shifted logit becomes 0, its exponential becomes 1, and nothing can overflow. The output is mathematically identical; only the numerics improve.',
          formula: 'softmax(z)_j = exp(z_j - m) / Σ_k exp(z_k - m),   m = max_k z_k',
        },
        {
          title: 'The full chain',
          body: 'For a batch of N rows: maxes holds each row maximum; norm_logits = logits - maxes, broadcast across columns; counts = exp(norm_logits); counts_sum adds up each row; counts_sum_inv = 1 / counts_sum; probs = counts * counts_sum_inv, broadcast again; logprobs = log(probs); and the loss is the negative mean of logprobs picked out at the correct class of each row. Every one of these is a target for a gradient.',
          formula: 'loss = -(1/N) Σ_i logprobs[i, y_i]',
        },
        {
          title: 'Why a reciprocal, then a multiply?',
          body: 'Dividing by counts_sum could be one step, but splitting it into a reciprocal followed by a multiply gives two very simple derivatives instead of one quotient rule. This trade — more lines, easier calculus — is the core habit of manual backprop.',
        },
      ],
      keyTakeaways: [
        'Manual backprop starts by writing the forward pass as a chain of tiny, named operations.',
        'Subtracting the row max before exp prevents overflow and leaves softmax unchanged.',
        'Splitting division into reciprocal-then-multiply makes each local derivative trivial.',
      ],
      quiz: [
        {
          question: 'Why subtract each row maximum from the logits before exponentiating?',
          options: [
            'It makes the probabilities sharper',
            'It prevents overflow without changing the softmax output',
            'It forces the gradient of the max element to zero',
            'It is required for the log to be defined',
          ],
          answer: 1,
          explanation:
            'Softmax is invariant to adding the same constant to every logit in a row, so shifting by the max changes nothing mathematically. It only ensures the biggest exponent is exp(0) = 1, so no overflow. It does not sharpen anything — that would need a temperature change.',
        },
        {
          question:
            'logits has shape (32, 27). What shape does counts_sum have (keeping dimensions)?',
          options: ['(32, 27)', '(27, 1)', '(1, 27)', '(32, 1)'],
          answer: 3,
          explanation:
            'counts_sum adds across the 27 classes of each example, giving one number per row: (32, 1). Summing down the batch instead would give (1, 27), which mixes different examples and is wrong for softmax.',
        },
      ],
      challenge: {
        title: 'A stable, step-by-step forward pass',
        instructions:
          "Implement forward_steps(logits, targets). logits is a list of N rows (lists of floats); targets is a list of N correct class indices. Return a dict with these keys: 'maxes' (list of N row maxima), 'norm_logits' (logits minus the row max), 'counts' (exp of norm_logits), 'counts_sum' (list of N row sums), 'counts_sum_inv' (list of N reciprocals), 'probs' (counts times counts_sum_inv), 'logprobs' (log of probs), and 'loss' (a float: negative mean of logprobs at each row's target). It must not overflow for logits like 1000.",
        starter: String.raw`import math


def forward_steps(logits, targets):
    """Cross-entropy forward pass, one atomic step at a time.

    Returns a dict with keys: maxes, norm_logits, counts, counts_sum,
    counts_sum_inv, probs, logprobs, loss.
    """
    # TODO: compute each intermediate in order, then build the dict
    raise NotImplementedError
`,
        solution: String.raw`import math


def forward_steps(logits, targets):
    """Cross-entropy forward pass, one atomic step at a time.

    Returns a dict with keys: maxes, norm_logits, counts, counts_sum,
    counts_sum_inv, probs, logprobs, loss.
    """
    N = len(logits)
    maxes = [max(row) for row in logits]
    norm_logits = [[v - maxes[i] for v in row] for i, row in enumerate(logits)]
    counts = [[math.exp(v) for v in row] for row in norm_logits]
    counts_sum = [sum(row) for row in counts]
    counts_sum_inv = [1.0 / s for s in counts_sum]
    probs = [[c * counts_sum_inv[i] for c in row] for i, row in enumerate(counts)]
    logprobs = [[math.log(p) for p in row] for row in probs]
    loss = -sum(logprobs[i][targets[i]] for i in range(N)) / N
    return {
        'maxes': maxes,
        'norm_logits': norm_logits,
        'counts': counts,
        'counts_sum': counts_sum,
        'counts_sum_inv': counts_sum_inv,
        'probs': probs,
        'logprobs': logprobs,
        'loss': loss,
    }
`,
        tests: String.raw`import math

out = forward_steps([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]], [2, 0])
assert out['maxes'] == [3.0, 0.0], 'maxes should be the row maxima'
assert out['norm_logits'][0] == [-2.0, -1.0, 0.0], 'norm_logits = logits - row max'
assert math.isclose(out['counts_sum'][0], math.exp(-2) + math.exp(-1) + 1.0, rel_tol=1e-9), 'counts_sum row 0 is wrong'
assert math.isclose(out['counts_sum_inv'][0] * out['counts_sum'][0], 1.0, rel_tol=1e-9), 'counts_sum_inv must be 1 / counts_sum'
for row in out['probs']:
    assert math.isclose(sum(row), 1.0, rel_tol=1e-9), 'each probs row must sum to 1'
for v in out['logprobs'][1]:
    assert math.isclose(v, -math.log(3), rel_tol=1e-9), 'uniform row should have logprob -log(3)'
z = math.exp(1) + math.exp(2) + math.exp(3)
expected = ((math.log(z) - 3.0) + math.log(3)) / 2
assert math.isclose(out['loss'], expected, rel_tol=1e-9), 'loss value is wrong'

big = forward_steps([[1000.0, 1001.0, 1002.0]], [2])
small = forward_steps([[0.0, 1.0, 2.0]], [2])
assert math.isclose(big['loss'], small['loss'], rel_tol=1e-9), 'shifting all logits must not change the loss'
assert max(big['counts'][0]) == 1.0, 'after max-subtraction the largest count is exactly 1'

single = forward_steps([[5.0]], [0])
assert math.isclose(single['loss'], 0.0, abs_tol=1e-12), 'one class means probability 1 and loss 0'
`,
        hint: 'Compute the row max first and subtract it from every entry in that row; then exp, sum per row, take 1/sum, multiply, take log, and average the picked logprobs with a minus sign.',
      },
      lab: 'tensor',
    },
    {
      id: 'backprop-softmax-grads',
      title: 'Gradients Through log, exp and Sums',
      minutes: 14,
      summary:
        'Walk the gradient backward through every step of cross-entropy, learn why broadcasting turns into summing, and arrive at the fused formula (softmax − onehot) / N.',
      sections: [
        {
          title: 'Start at the end',
          body: "The loss only touches N entries of logprobs, each scaled by -1/N. So dlogprobs is all zeros except -1/N at each row's correct class. Going through log gives dprobs = dlogprobs / probs, because the derivative of log x is 1/x. Every step multiplies the incoming gradient by a local derivative — that is all the chain rule ever asks.",
          formula: 'dlogprobs[i, y_i] = -1/N,   dprobs = dlogprobs / probs',
        },
        {
          title: 'Broadcasting forward means summing backward',
          body: 'probs = counts * counts_sum_inv uses one counts_sum_inv value for a whole row. That single number influenced every column, so its gradient collects contributions from all of them. The rule is general: when a forward op copies a value along a dimension, the backward op sums along that dimension. Conversely, a forward sum copies its gradient back out to every input.',
          formula: 'dcounts_sum_inv[i] = Σ_j counts[i,j] · dprobs[i,j]',
        },
        {
          title: 'Variables used twice',
          body: 'counts feeds both the product and the row sum, and gradients from every use must be added. So dcounts gets a direct term, counts_sum_inv * dprobs, plus a broadcast copy of dcounts_sum. The exponential is easy: its derivative is itself, so dnorm_logits = counts * dcounts. The max-subtraction path ends up contributing almost exactly zero, as it should for a shift that never changes the output.',
        },
        {
          title: 'The fused shortcut',
          body: 'Grinding through every step and simplifying gives a strikingly clean result: each logit gradient is its predicted probability, minus 1 at the correct class, divided by the batch size. Each row of dlogits sums to zero — probability pushed up on the right answer is pulled down everywhere else.',
          formula: 'dlogits = (softmax(logits) - onehot(y)) / N',
        },
        {
          title: 'The full atomic backward, in code',
          body: "Here is the whole cross-entropy backward written as code, one line per forward step, in reverse. Each line is a local derivative times the gradient arriving from above; comments mark where a broadcast turns into a sum and where a variable used twice gets a +=.\n\n```python\n# forward (from the previous lesson)\nlogit_maxes = logits.max(1, keepdim=True).values\nnorm_logits = logits - logit_maxes\ncounts = norm_logits.exp()\ncounts_sum = counts.sum(1, keepdim=True)\ncounts_sum_inv = counts_sum ** -1\nprobs = counts * counts_sum_inv\nlogprobs = probs.log()\nloss = -logprobs[range(n), Yb].mean()\n\n# backward\ndlogprobs = torch.zeros_like(logprobs)\ndlogprobs[range(n), Yb] = -1.0 / n\ndprobs = (1.0 / probs) * dlogprobs                           # d log x = 1/x\ndcounts_sum_inv = (counts * dprobs).sum(1, keepdim=True)     # broadcast -> sum\ndcounts = counts_sum_inv * dprobs                            # first use of counts\ndcounts_sum = -counts_sum ** -2 * dcounts_sum_inv            # d x^-1 = -x^-2\ndcounts += torch.ones_like(counts) * dcounts_sum             # second use: ADD\ndnorm_logits = counts * dcounts                              # d exp x = exp x\ndlogits = dnorm_logits.clone()                               # direct path\ndlogit_maxes = -dnorm_logits.sum(1, keepdim=True)\ndlogits += F.one_hot(logits.max(1).indices, num_classes=logits.shape[1]) * dlogit_maxes\n```\n\nThe last line routes the max's gradient back only to the position that held the maximum, because max just copies one element. dlogit_maxes comes out as essentially zero (around 1e-9 from rounding), which is a nice built-in check: shifting every logit by the same amount never changes the loss. When everything is right, dlogits equals (softmax(logits) − onehot) / n to within rounding.",
        },
      ],
      keyTakeaways: [
        'Each backward step multiplies the upstream gradient by a simple local derivative.',
        'A value broadcast in the forward pass gets the sum of gradients in the backward pass; a value used twice gets both gradients added.',
        'The whole cross-entropy backward collapses to (softmax − onehot) / N, and each row sums to zero.',
      ],
      quiz: [
        {
          question:
            'In the forward pass a per-row value is broadcast across all columns. What happens to it in the backward pass?',
          options: [
            'Keep only the gradient from the first column',
            'Average the gradients over the columns',
            'Sum the gradients along the broadcast dimension',
            'Pass the upstream gradient through unchanged',
          ],
          answer: 2,
          explanation:
            'The value influenced every column, so by the multivariable chain rule its gradient is the sum of all those contributions. Averaging is a common mistake: it divides the true gradient by the number of columns.',
        },
        {
          question: 'What does each row of dlogits = (softmax − onehot) / N sum to?',
          options: ['0', '1/N', '-1/N', '1'],
          answer: 0,
          explanation:
            'Softmax probabilities sum to 1 and the onehot row sums to 1, so their difference sums to 0 — dividing by N keeps it 0. Intuitively, raising the correct logit is balanced by lowering the others.',
        },
      ],
      challenge: {
        title: 'The fused cross-entropy gradient',
        instructions:
          'Implement cross_entropy_backward(logits, targets). logits is a list of N rows of floats and targets is a list of N class indices. The loss is the mean cross-entropy over the batch. Return dlogits, a list of N rows with the same shape as logits, using dlogits = (softmax(logits) - onehot(targets)) / N. Compute softmax stably (subtract the row max).',
        starter: String.raw`import math


def cross_entropy_backward(logits, targets):
    """Gradient of mean cross-entropy loss with respect to logits."""
    # TODO: stable softmax per row, subtract 1 at the target, divide by N
    raise NotImplementedError
`,
        solution: String.raw`import math


def cross_entropy_backward(logits, targets):
    """Gradient of mean cross-entropy loss with respect to logits."""
    N = len(logits)
    dlogits = []
    for i, row in enumerate(logits):
        m = max(row)
        exps = [math.exp(v - m) for v in row]
        s = sum(exps)
        grad = [e / s / N for e in exps]
        grad[targets[i]] -= 1.0 / N
        dlogits.append(grad)
    return dlogits
`,
        tests: String.raw`import math
import random


def _loss(logits, targets):
    total = 0.0
    for row, t in zip(logits, targets):
        m = max(row)
        lse = m + math.log(sum(math.exp(v - m) for v in row))
        total += lse - row[t]
    return total / len(logits)


g = cross_entropy_backward([[0.0, 0.0, 0.0, 0.0]], [1])
for got, want in zip(g[0], [0.25, -0.75, 0.25, 0.25]):
    assert math.isclose(got, want, rel_tol=1e-9), 'uniform logits: expected [0.25, -0.75, 0.25, 0.25]'

random.seed(5)
logits = [[random.uniform(-3, 3) for _ in range(5)] for _ in range(4)]
targets = [0, 3, 4, 1]
d = cross_entropy_backward(logits, targets)
assert len(d) == 4 and all(len(r) == 5 for r in d), 'dlogits must have the same shape as logits'
for row in d:
    assert math.isclose(sum(row), 0.0, abs_tol=1e-12), 'each dlogits row must sum to zero'
h = 1e-5
for i in range(4):
    for j in range(5):
        old = logits[i][j]
        logits[i][j] = old + h
        lp = _loss(logits, targets)
        logits[i][j] = old - h
        lm = _loss(logits, targets)
        logits[i][j] = old
        num = (lp - lm) / (2 * h)
        assert math.isclose(d[i][j], num, abs_tol=1e-7), 'mismatch with finite differences at (%d, %d)' % (i, j)

big = cross_entropy_backward([[1000.0, 0.0]], [0])
assert math.isclose(big[0][0], 0.0, abs_tol=1e-12) and math.isclose(big[0][1], 0.0, abs_tol=1e-12), 'a confident correct prediction has ~zero gradient (and must not overflow)'
`,
        hint: "Reuse the stable softmax from the previous lesson for each row, then subtract 1 at that row's target index and divide everything by the number of rows.",
      },
      lab: 'tensor',
    },
    {
      id: 'backprop-matmul',
      title: 'Matmul Backward by Shape Matching',
      minutes: 13,
      summary:
        'Derive the gradients of a linear layer, dA = dC @ Bᵀ and dB = Aᵀ @ dC, and see why the bias gradient is a sum over the batch.',
      sections: [
        {
          title: 'The forward layer',
          body: 'A linear layer computes C = A @ B + b, with inputs A of shape (N, D), weights B of shape (D, H) and a bias b of length H. Each output C[i,k] is the dot product of row i of A with column k of B, plus b[k]. Given the upstream gradient dC, which has the same shape as C, we want dA, dB and db.',
          formula: 'C[i,k] = Σ_d A[i,d] · B[d,k] + b[k]',
        },
        {
          title: 'Derive it on indices',
          body: 'Differentiating C[i,k] by A[i,d] gives B[d,k]. Summing over every output that A[i,d] touched yields dA[i,d] = Σ_k dC[i,k] · B[d,k] — row i of dC dotted with row d of B, which is exactly the matrix product dC @ Bᵀ. The same reasoning for the weights gives dB[d,k] = Σ_i A[i,d] · dC[i,k], which is Aᵀ @ dC.',
          formula: 'dA = dC @ Bᵀ,   dB = Aᵀ @ dC',
        },
        {
          title: 'The shape-matching shortcut',
          body: 'You rarely need the index algebra. dA must have the shape of A, (N, D). Built from dC (N, H) and B (D, H), the only product with that shape is dC @ Bᵀ. dB must be (D, H), and the only product of A (N, D) and dC (N, H) with that shape is Aᵀ @ dC. When the dimensions are distinct, shapes force the formula.',
        },
        {
          title: 'Bias: a broadcast in disguise',
          body: 'The single bias row is added to all N examples, so it is broadcast down the batch. Backward, broadcast becomes sum: db is the column-wise sum of dC over the batch. Forgetting the sum, or summing along the wrong axis, is one of the most common shape bugs.',
          formula: 'db[k] = Σ_i dC[i,k]',
        },
      ],
      keyTakeaways: [
        'For C = A @ B, the gradients are dA = dC @ Bᵀ and dB = Aᵀ @ dC.',
        'A gradient always has the same shape as the tensor it belongs to — use that to pick the right product.',
        'The bias is broadcast over the batch, so db is the sum of dC down the batch dimension.',
      ],
      quiz: [
        {
          question:
            'A is (32, 10), B is (10, 64), C = A @ B, and dC is (32, 64). Which expression is dB?',
          options: ['dC @ Bᵀ', 'Aᵀ @ dC', 'A @ dC', 'dCᵀ @ A'],
          answer: 1,
          explanation:
            'dB must be (10, 64). Aᵀ @ dC is (10, 32) @ (32, 64) = (10, 64). dCᵀ @ A is (64, 10) — the transpose of the right answer, a tempting slip. dC @ Bᵀ is dA, and A @ dC does not even have compatible shapes.',
        },
        {
          question: 'For C = A @ B + b, where b is broadcast to every row, what is db?',
          options: [
            'The mean of dC over the batch',
            'dC itself',
            'The sum of dC over the hidden units',
            'The sum of dC over the batch dimension',
          ],
          answer: 3,
          explanation:
            'Each b[k] was added to C[i,k] for every example i, so its gradient sums dC[i,k] over i. Using the mean would scale the gradient down by N, and summing over hidden units would mix different bias entries together.',
        },
      ],
      challenge: {
        title: 'Linear layer backward',
        instructions:
          'Implement linear_backward(A, B, dC) for the layer C = A @ B + b. A is an N x D list of lists, B is D x H, and dC is N x H (the upstream gradient). Return a tuple (dA, dB, db): dA is N x D (dC @ Bᵀ), dB is D x H (Aᵀ @ dC), and db is a list of length H (column sums of dC). Use plain Python lists.',
        starter: String.raw`def linear_backward(A, B, dC):
    """Backward pass for C = A @ B + b.

    A: N x D, B: D x H, dC: N x H.
    Returns (dA, dB, db) with shapes N x D, D x H, and H.
    """
    # TODO: dA = dC @ B^T, dB = A^T @ dC, db = sum of dC over rows
    raise NotImplementedError
`,
        solution: String.raw`def linear_backward(A, B, dC):
    """Backward pass for C = A @ B + b.

    A: N x D, B: D x H, dC: N x H.
    Returns (dA, dB, db) with shapes N x D, D x H, and H.
    """
    N, D, H = len(A), len(B), len(B[0])
    dA = [[sum(dC[i][k] * B[d][k] for k in range(H)) for d in range(D)] for i in range(N)]
    dB = [[sum(A[i][d] * dC[i][k] for i in range(N)) for k in range(H)] for d in range(D)]
    db = [sum(dC[i][k] for i in range(N)) for k in range(H)]
    return dA, dB, db
`,
        tests: String.raw`import math
import random

dA, dB, db = linear_backward([[1.0, 2.0]], [[3.0], [4.0]], [[1.0]])
assert dA == [[3.0, 4.0]], 'dA for the tiny case should be [[3, 4]]'
assert dB == [[1.0], [2.0]], 'dB for the tiny case should be [[1], [2]]'
assert db == [1.0], 'db for the tiny case should be [1]'


def _loss(A, B, b, G):
    total = 0.0
    for i in range(len(A)):
        for k in range(len(B[0])):
            c = sum(A[i][d] * B[d][k] for d in range(len(B))) + b[k]
            total += G[i][k] * c
    return total


random.seed(3)
N, D, H = 4, 3, 2
A = [[random.uniform(-1, 1) for _ in range(D)] for _ in range(N)]
B = [[random.uniform(-1, 1) for _ in range(H)] for _ in range(D)]
b = [random.uniform(-1, 1) for _ in range(H)]
G = [[random.uniform(-1, 1) for _ in range(H)] for _ in range(N)]
dA, dB, db = linear_backward(A, B, G)
assert len(dA) == N and len(dA[0]) == D, 'dA must be N x D'
assert len(dB) == D and len(dB[0]) == H, 'dB must be D x H'
assert len(db) == H, 'db must have length H'

h = 1e-6
for M, dM, name in [(A, dA, 'dA'), (B, dB, 'dB')]:
    for r in range(len(M)):
        for c in range(len(M[0])):
            old = M[r][c]
            M[r][c] = old + h
            lp = _loss(A, B, b, G)
            M[r][c] = old - h
            lm = _loss(A, B, b, G)
            M[r][c] = old
            assert math.isclose(dM[r][c], (lp - lm) / (2 * h), abs_tol=1e-7), name + ' mismatch with finite differences'
for k in range(H):
    old = b[k]
    b[k] = old + h
    lp = _loss(A, B, b, G)
    b[k] = old - h
    lm = _loss(A, B, b, G)
    b[k] = old
    assert math.isclose(db[k], (lp - lm) / (2 * h), abs_tol=1e-7), 'db mismatch with finite differences'
`,
        hint: 'Write each gradient as a sum over the one index that disappears: dA[i][d] sums over k, dB[d][k] sums over i, and db[k] sums over i.',
      },
      lab: 'tensor',
    },
    {
      id: 'backprop-tanh-chain',
      title: 'tanh and Chaining Layers',
      minutes: 12,
      summary:
        'Use the tanh local gradient 1 − h² and compose it with the linear-layer rules to backpropagate through a full hidden layer.',
      sections: [
        {
          title: 'A local gradient you can reuse',
          body: 'tanh squashes its input into the range (-1, 1). Its derivative is 1 - tanh(z)², which means the backward pass can reuse the forward output h instead of recomputing anything from the pre-activation. Cache h during the forward pass and the local gradient is almost free.',
          formula: 'h = tanh(z),   dz = (1 - h²) · dh',
        },
        {
          title: 'Saturation',
          body: 'When |z| is large, h sits near ±1 and 1 - h² is near zero. The gradient flowing back through that unit nearly vanishes, so the weights feeding it barely learn. A histogram of h that piles up at ±1 is an early warning that initialization or input scale is off.',
        },
        {
          title: 'Composing layer by layer',
          body: 'A hidden layer computes z = x @ W + b and then h = tanh(z). Backward runs in exactly reverse order: first dz from dh through tanh, then the linear rules give dW = xᵀ @ dz, db = column sums of dz, and dx = dz @ Wᵀ. That dx becomes the upstream gradient for whatever produced x. Each layer needs only its cached inputs and outputs plus the gradient arriving from above.',
          formula: 'dW = xᵀ @ dz,   db = Σ_i dz[i],   dx = dz @ Wᵀ',
        },
        {
          title: 'Elementwise versus matrix ops',
          body: 'Elementwise operations like tanh multiply gradients position by position and never change shape. Matrix operations mix positions and need transposes. Keeping these two families straight is most of what it takes to write a whole backward pass without errors.',
        },
      ],
      keyTakeaways: [
        'The tanh backward is dz = (1 − h²) · dh, using the cached output h.',
        'Saturated units (h near ±1) pass almost no gradient back.',
        'Backprop through a layer runs the forward steps in reverse, handing dx to the layer below.',
      ],
      quiz: [
        {
          question: 'A tanh unit has output h = 0.8 and upstream gradient dh = 2.0. What is dz?',
          options: ['0.72', '1.28', '0.36', '1.6'],
          answer: 0,
          explanation:
            'dz = (1 − h²) · dh = (1 − 0.64) · 2.0 = 0.36 · 2.0 = 0.72. Stopping at 0.36 forgets the upstream factor, and 1.6 multiplies by h instead of by the derivative.',
        },
        {
          question: 'Why are many saturated tanh units a problem for training?',
          options: [
            'They make the forward pass slower',
            'They push tanh outputs above 1',
            'Their local gradient 1 − h² is near zero, so little gradient flows through',
            'They make the loss negative',
          ],
          answer: 2,
          explanation:
            'tanh outputs never leave (-1, 1), but near the edges the slope is almost flat. Multiplying by a near-zero local gradient blocks learning for every weight upstream of that unit.',
        },
      ],
      challenge: {
        title: 'Backward through a tanh layer',
        instructions:
          'Implement tanh_layer_backward(x, W, b, dh) for the layer h = tanh(x @ W + b). x is N x D, W is D x H, b has length H, and dh is the N x H upstream gradient. Recompute h in the forward direction, then return a tuple (dx, dW, db) with shapes N x D, D x H, and H. Use math.tanh and plain lists.',
        starter: String.raw`import math


def tanh_layer_backward(x, W, b, dh):
    """Backward pass for h = tanh(x @ W + b).

    Returns (dx, dW, db) with shapes N x D, D x H, and H.
    """
    # TODO: forward to get h, then dz = (1 - h^2) * dh, then the linear rules
    raise NotImplementedError
`,
        solution: String.raw`import math


def tanh_layer_backward(x, W, b, dh):
    """Backward pass for h = tanh(x @ W + b).

    Returns (dx, dW, db) with shapes N x D, D x H, and H.
    """
    N, D, H = len(x), len(W), len(W[0])
    h = [[math.tanh(sum(x[i][d] * W[d][k] for d in range(D)) + b[k]) for k in range(H)] for i in range(N)]
    dz = [[(1.0 - h[i][k] ** 2) * dh[i][k] for k in range(H)] for i in range(N)]
    dx = [[sum(dz[i][k] * W[d][k] for k in range(H)) for d in range(D)] for i in range(N)]
    dW = [[sum(x[i][d] * dz[i][k] for i in range(N)) for k in range(H)] for d in range(D)]
    db = [sum(dz[i][k] for i in range(N)) for k in range(H)]
    return dx, dW, db
`,
        tests: String.raw`import math
import random

dx, dW, db = tanh_layer_backward([[0.0]], [[1.0]], [0.0], [[3.0]])
assert math.isclose(dx[0][0], 3.0, rel_tol=1e-9) and math.isclose(db[0], 3.0, rel_tol=1e-9), 'at z = 0 tanh has slope 1'
assert math.isclose(dW[0][0], 0.0, abs_tol=1e-12), 'dW is x^T @ dz, and x is 0 here'


def _loss(x, W, b, G):
    total = 0.0
    for i in range(len(x)):
        for k in range(len(W[0])):
            z = sum(x[i][d] * W[d][k] for d in range(len(W))) + b[k]
            total += G[i][k] * math.tanh(z)
    return total


random.seed(11)
N, D, H = 3, 4, 2
x = [[random.uniform(-1, 1) for _ in range(D)] for _ in range(N)]
W = [[random.uniform(-1, 1) for _ in range(H)] for _ in range(D)]
b = [random.uniform(-0.5, 0.5) for _ in range(H)]
G = [[random.uniform(-1, 1) for _ in range(H)] for _ in range(N)]
dx, dW, db = tanh_layer_backward(x, W, b, G)
assert len(dx) == N and len(dx[0]) == D, 'dx must be N x D'
assert len(dW) == D and len(dW[0]) == H, 'dW must be D x H'

h = 1e-6
for M, dM, name in [(x, dx, 'dx'), (W, dW, 'dW')]:
    for r in range(len(M)):
        for c in range(len(M[0])):
            old = M[r][c]
            M[r][c] = old + h
            lp = _loss(x, W, b, G)
            M[r][c] = old - h
            lm = _loss(x, W, b, G)
            M[r][c] = old
            assert math.isclose(dM[r][c], (lp - lm) / (2 * h), abs_tol=1e-7), name + ' mismatch with finite differences'
for k in range(H):
    old = b[k]
    b[k] = old + h
    lp = _loss(x, W, b, G)
    b[k] = old - h
    lm = _loss(x, W, b, G)
    b[k] = old
    assert math.isclose(db[k], (lp - lm) / (2 * h), abs_tol=1e-7), 'db mismatch with finite differences'

dx, dW, db = tanh_layer_backward([[10.0]], [[1.0]], [0.0], [[1.0]])
assert abs(dx[0][0]) < 1e-7, 'a saturated unit should pass almost no gradient'
`,
        hint: 'First compute h for every (i, k). Then dz[i][k] = (1 - h[i][k]**2) * dh[i][k], and reuse exactly the linear-layer formulas with dz in place of dC.',
      },
      lab: 'tensor',
    },
    {
      id: 'backprop-batchnorm',
      title: 'BatchNorm Backward',
      minutes: 15,
      summary:
        'Backpropagate through batch normalization by following each path from x to the output, then collapse the result into one compact formula.',
      sections: [
        {
          title: 'Forward, in small steps',
          body: 'For each feature column, BatchNorm computes the batch mean μ, the centered values x - μ, the variance as the mean of their squares, the inverse standard deviation 1/√(var + ε), the normalized x̂, and finally y = γ·x̂ + β. Our exercise uses the population (biased) variance, dividing by N. The lecture divides by N − 1 instead, the sample (unbiased, Bessel-corrected) variance, for reasons covered in the next sections. That choice is not cosmetic: it changes one backward step and adds an extra factor to the compact formula.',
          formula: 'x̂_i = (x_i - μ) · (var + ε)^(-1/2),   y_i = γ·x̂_i + β',
        },
        {
          title: 'The easy gradients',
          body: 'γ and β are shared by every example in the batch, so their gradients are sums over it. The gradient flowing into x̂ is simply γ times dy, since y is linear in x̂.',
          formula: 'dβ = Σ_i dy_i,   dγ = Σ_i dy_i · x̂_i,   dx̂ = γ · dy',
        },
        {
          title: 'Why x is tricky',
          body: 'Each x_i reaches the output through three paths: directly through x - μ, through the mean μ, and through the variance, which depends on every element of the batch. Backpropagating each path through the atomic steps and adding the results is long but mechanical — the same broadcast-means-sum and used-twice-means-add rules as before.',
        },
        {
          title: 'The compact formula',
          body: "Collecting the three paths and simplifying gives one expression. Read it as: take the upstream gradient, remove its mean across the batch, then remove the part aligned with x̂, and scale by γ·invstd. Those two subtractions are exactly what keep the normalized output's mean and variance pinned, so the gradient on x sums to zero over the batch.",
          formula: 'dx_i = (γ·invstd / N) · (N·dy_i - Σ_j dy_j - x̂_i · Σ_j dy_j·x̂_j)',
        },
        {
          title: 'Population versus sample variance: dividing by N or N − 1',
          body: "There are two ways to average the squared deviations of a batch of n numbers.\n\n- Population (biased) variance: divide by n. This is what our challenge uses, and what PyTorch's BatchNorm1d uses to normalize during training.\n- Sample (unbiased) variance: divide by n − 1. This is Bessel's correction. A small batch's own mean sits closer to its own points than the true mean does, so dividing by n slightly underestimates the real spread; n − 1 fixes that on average.\n\nThe lecture uses the sample variance in the training forward pass and argues for it because batches are small and the same estimate is then used at inference. PyTorch's layer mixes the two: it normalizes with the 1/n variance but updates running_var with the 1/(n − 1) one, a small train/test mismatch. Neither is wrong; what matters is that your backward pass matches whichever forward you wrote.\n\nHere is the difference in the atomic steps. Only the line that averages bndiff2 changes, and so does its local derivative:\n\n```python\n# forward, lecture version (sample variance)\nbnvar = 1 / (n - 1) * bndiff2.sum(0, keepdim=True)\n# backward of that line: every element got weight 1/(n-1)\ndbndiff2 = 1 / (n - 1) * torch.ones_like(bndiff2) * dbnvar\n\n# our challenge (population variance) would instead have\n#   bnvar    = 1 / n * bndiff2.sum(0, keepdim=True)\n#   dbndiff2 = 1 / n * torch.ones_like(bndiff2) * dbnvar\n```\n\nThat change carries through to the compact formula as a factor n/(n − 1) on the last term:\n\n- population (÷ n): dx_i = (γ·invstd / n) · (n·dy_i − Σ_j dy_j − x̂_i · Σ_j dy_j·x̂_j)\n- sample (÷ (n − 1)): dx_i = (γ·invstd / n) · (n·dy_i − Σ_j dy_j − n/(n − 1) · x̂_i · Σ_j dy_j·x̂_j)\n\nFor a batch of 32 the factor is 32/31 ≈ 1.03, so using the wrong one gives gradients that are close but measurably off, exactly the kind of bug a gradient check catches.",
          formula:
            'sample variance: dx_i = (γ·invstd / n) · (n·dy_i − Σ dy − n/(n−1) · x̂_i · Σ dy·x̂)',
        },
        {
          title: 'Every BatchNorm step, backward',
          body: "The compact formula is the destination; the decomposed backward is how you get there and how you check it. Walk the forward lines in reverse. At each line, ask two questions: what is the local derivative, and did the forward broadcast a value (sum it back) or use a value twice (add the contributions)? This is the lecture's version with the sample variance; tensors are (n, H) unless noted.\n\n```python\n# forward (one op per line)\nbnmeani  = 1 / n * hprebn.sum(0, keepdim=True)          # (1, H)\nbndiff   = hprebn - bnmeani                             # (n, H)\nbndiff2  = bndiff ** 2\nbnvar    = 1 / (n - 1) * bndiff2.sum(0, keepdim=True)   # (1, H)\nbnvar_inv = (bnvar + 1e-5) ** -0.5\nbnraw    = bndiff * bnvar_inv\nhpreact  = bngain * bnraw + bnbias\n\n# backward, in reverse order\ndbngain   = (bnraw * dhpreact).sum(0, keepdim=True)     # bngain was broadcast over rows\ndbnbias   = dhpreact.sum(0, keepdim=True)\ndbnraw    = bngain * dhpreact\ndbnvar_inv = (bndiff * dbnraw).sum(0, keepdim=True)     # broadcast -> sum\ndbndiff   = bnvar_inv * dbnraw                          # first use of bndiff\ndbnvar    = -0.5 * (bnvar + 1e-5) ** -1.5 * dbnvar_inv\ndbndiff2  = 1 / (n - 1) * torch.ones_like(bndiff2) * dbnvar\ndbndiff  += 2 * bndiff * dbndiff2                       # second use: ADD\ndhprebn   = dbndiff.clone()                             # direct path\ndbnmeani  = -dbndiff.sum(0, keepdim=True)\ndhprebn  += 1 / n * torch.ones_like(hprebn) * dbnmeani  # path through the mean\n```\n\nTwo lines carry the whole lesson. dbndiff is written once and then added to, because bndiff feeds both bnraw and bndiff2. dhprebn also gets two contributions, the direct one and the one through the mean. Forget either += and the gradient is wrong, even though every shape still lines up. The downloadable backprop.py does exactly this walk (with the 1/n variance to match PyTorch's layer) and then checks the fused one-liner against it.",
        },
      ],
      keyTakeaways: [
        'dβ and dγ are batch sums because γ and β are broadcast over the batch.',
        'Each input reaches the output through the mean and variance as well as directly, so all paths must be added.',
        'The compact BatchNorm backward subtracts the batch mean of dy and its projection onto x̂, then scales by γ·invstd / N.',
      ],
      quiz: [
        {
          question: 'For y = γ·x̂ + β applied across a batch, what is dβ?',
          options: [
            'γ · Σ dy',
            'The mean of dy over the batch',
            'Σ_i dy_i over the batch',
            'dy itself',
          ],
          answer: 2,
          explanation:
            'β is added to every example, so each example contributes its dy and the contributions add up. The mean would underestimate the gradient by a factor of N, and γ does not multiply β.',
        },
        {
          question:
            'For one feature, what does Σ_i dx_i over the batch equal in the compact BatchNorm backward?',
          options: ['Σ dy', 'Zero', 'γ', '1/N'],
          answer: 1,
          explanation:
            'Summing the bracket gives N·Σdy − N·Σdy − (Σ x̂_i)·Σ dy·x̂, and Σ x̂_i = 0 because x̂ is centered. Shifting every x by the same amount does not change the output, so the total gradient must be zero.',
        },
      ],
      challenge: {
        title: 'BatchNorm backward, compact form',
        instructions:
          'Implement batchnorm_backward(x, gamma, dy, eps=1e-5). x is an N x D list of lists (normalize each column over the batch), gamma has length D, and dy is the N x D upstream gradient for y = gamma * xhat + beta. Use the biased variance var = mean((x - mu)^2). Return a tuple (dx, dgamma, dbeta): dx is N x D, dgamma and dbeta have length D.',
        starter: String.raw`import math


def batchnorm_backward(x, gamma, dy, eps=1e-5):
    """Backward pass for per-column batch normalization.

    Forward: mu = mean, var = mean((x - mu)^2), invstd = 1 / sqrt(var + eps),
    xhat = (x - mu) * invstd, y = gamma * xhat + beta.
    Returns (dx, dgamma, dbeta).
    """
    # TODO: for each column, recompute xhat and invstd, then apply the compact formula
    raise NotImplementedError
`,
        solution: String.raw`import math


def batchnorm_backward(x, gamma, dy, eps=1e-5):
    """Backward pass for per-column batch normalization.

    Forward: mu = mean, var = mean((x - mu)^2), invstd = 1 / sqrt(var + eps),
    xhat = (x - mu) * invstd, y = gamma * xhat + beta.
    Returns (dx, dgamma, dbeta).
    """
    N, D = len(x), len(x[0])
    dx = [[0.0] * D for _ in range(N)]
    dgamma = [0.0] * D
    dbeta = [0.0] * D
    for j in range(D):
        col = [x[i][j] for i in range(N)]
        mu = sum(col) / N
        var = sum((v - mu) ** 2 for v in col) / N
        invstd = 1.0 / math.sqrt(var + eps)
        xhat = [(v - mu) * invstd for v in col]
        g = [dy[i][j] for i in range(N)]
        dbeta[j] = sum(g)
        dgamma[j] = sum(g[i] * xhat[i] for i in range(N))
        scale = gamma[j] * invstd / N
        for i in range(N):
            dx[i][j] = scale * (N * g[i] - dbeta[j] - xhat[i] * dgamma[j])
    return dx, dgamma, dbeta
`,
        tests: String.raw`import math
import random


def _loss(x, gamma, beta, G, eps=1e-5):
    N, D = len(x), len(x[0])
    total = 0.0
    for j in range(D):
        col = [x[i][j] for i in range(N)]
        mu = sum(col) / N
        var = sum((v - mu) ** 2 for v in col) / N
        for i in range(N):
            y = gamma[j] * (col[i] - mu) / math.sqrt(var + eps) + beta[j]
            total += G[i][j] * y
    return total


random.seed(7)
N, D = 5, 3
x = [[random.uniform(-2, 2) for _ in range(D)] for _ in range(N)]
gamma = [random.uniform(0.5, 1.5) for _ in range(D)]
beta = [random.uniform(-0.5, 0.5) for _ in range(D)]
G = [[random.uniform(-1, 1) for _ in range(D)] for _ in range(N)]
dx, dgamma, dbeta = batchnorm_backward(x, gamma, G)
assert len(dx) == N and len(dx[0]) == D, 'dx must be N x D'
for j in range(D):
    assert math.isclose(dbeta[j], sum(G[i][j] for i in range(N)), rel_tol=1e-9), 'dbeta must be the column sum of dy'
    assert math.isclose(sum(dx[i][j] for i in range(N)), 0.0, abs_tol=1e-9), 'dx should sum to zero over the batch'

h = 1e-5
for i in range(N):
    for j in range(D):
        old = x[i][j]
        x[i][j] = old + h
        lp = _loss(x, gamma, beta, G)
        x[i][j] = old - h
        lm = _loss(x, gamma, beta, G)
        x[i][j] = old
        assert math.isclose(dx[i][j], (lp - lm) / (2 * h), abs_tol=1e-6), 'dx mismatch with finite differences at (%d, %d)' % (i, j)
for j in range(D):
    old = gamma[j]
    gamma[j] = old + h
    lp = _loss(x, gamma, beta, G)
    gamma[j] = old - h
    lm = _loss(x, gamma, beta, G)
    gamma[j] = old
    assert math.isclose(dgamma[j], (lp - lm) / (2 * h), abs_tol=1e-6), 'dgamma mismatch with finite differences'

dx2, _, _ = batchnorm_backward([[1.0], [3.0]], [1.0], [[1.0], [1.0]])
assert all(math.isclose(r[0], 0.0, abs_tol=1e-12) for r in dx2), 'a constant upstream gradient gives zero dx'
`,
        hint: 'Work one column at a time: compute mu, var, invstd and xhat, then dbeta = sum(dy), dgamma = sum(dy * xhat), and plug those two sums straight into the compact dx formula.',
      },
      lab: 'tensor',
    },
    {
      id: 'backprop-embedding-gradcheck',
      title: 'Embedding Backward and Gradient Checks',
      minutes: 14,
      summary:
        'Route gradients from embedded vectors back into the rows of the lookup table with a scatter-add, then verify any manual gradient numerically.',
      sections: [
        {
          title: 'Indexing is a copy',
          body: 'An embedding lookup emb = C[ix] copies rows of the table C into a new tensor of shape (N, T, D). Backward, every copy sends its gradient home: for each position (n, t), add demb[n, t] into row ix[n, t] of dC. Rows that were never looked up get a gradient of exactly zero.',
          formula: 'dC[ix[n,t]] += demb[n,t]',
        },
        {
          title: 'Repeated indices accumulate',
          body: 'If the same character appears twice in a batch, its row was used twice, so both gradients must be added — the used-twice rule once more. Writing dC[ix] = demb with plain assignment silently keeps only one of them. A loop with +=, or a dedicated scatter-add, is correct.',
        },
        {
          title: 'Numerical gradient checks',
          body: 'To test any manual gradient, nudge one parameter by a small h in both directions, rerun the forward pass, and measure how the loss changes. The centered difference has error proportional to h² and needs only forward code you already trust.',
          formula: '∂L/∂θ ≈ (L(θ + h) - L(θ - h)) / (2h)',
        },
        {
          title: 'Reading the comparison',
          body: 'Compare manual gradients with numerical or autograd ones using the maximum absolute difference plus a relative error, which is scale-free. In double precision, differences around 1e-7 or smaller usually mean correct; around 1e-2 points to a real bug. Check one tensor at a time, starting at the loss and walking backward, so the first mismatch pinpoints the faulty step.',
          formula: 'rel = |a - b| / max(|a| + |b|, ε)',
        },
        {
          title: 'Closing the loop: a full manual training step',
          body: "All the pieces now meet. One manual training step runs the forward pass, walks every gradient back from the loss to the embedding table, and then updates every parameter: C, W1, b1, bngain, bnbias, W2 and b2. The last link in the chain is the one from this lesson. emb = C[Xb] has shape (n, T, D), and before it the flat embcat (n, T·D) fed the first matmul. So demb = dembcat.view(n, T, D) undoes the concatenation, and the scatter-add sends each piece home to its row of C.\n\n```python\n# end of the manual backward\ndembcat = dhprebn @ W1.T                 # matmul rule\ndW1 = embcat.T @ dhprebn\ndb1 = dhprebn.sum(0)\ndemb = dembcat.view(emb.shape)           # undo the concat\ndC = torch.zeros_like(C)\nfor k in range(Xb.shape[0]):\n    for j in range(Xb.shape[1]):\n        dC[Xb[k, j]] += demb[k, j]       # repeated rows accumulate\n\n# one training step with manual gradients only\ngrads = [dC, dW1, db1, dW2, db2, dbngain, dbnbias]\nfor p, g in zip(parameters, grads):\n    p.data += -lr * g\n```\n\nWhat about zeroing gradients? With autograd, .grad accumulates across calls to backward(), so you must reset it (p.grad = None) every step. A manual backward builds brand-new gradient tensors each step, so there is nothing stale to clear; the zeroing is built in. The real danger moves inside the step: forgetting a += for a reused tensor, as in dC above.\n\nAlso notice db1. Because BatchNorm subtracts the batch mean right after the first layer, b1 has no effect on the loss and its gradient is zero up to rounding. It is a free sanity check.\n\nThe downloadable backprop.py pulls this together on a real names dataset. It runs the forward in small named steps, computes the manual gradient for every one of its 19 intermediate tensors (from emb through logprobs) and every parameter, and compares each against PyTorch's autograd with exact and approximate checks. Then it checks the fused cross-entropy and BatchNorm shortcuts, and finally trains the network using only the manual gradients, tracking BatchNorm running statistics for evaluation. If any check fails, it stops before training.",
        },
      ],
      keyTakeaways: [
        'Embedding backward is a scatter-add of demb into the rows of dC selected by ix.',
        'Repeated indices must accumulate with +=; plain assignment loses gradients.',
        'Centered finite differences plus max-abs and relative error give a reliable check of any manual gradient.',
      ],
      quiz: [
        {
          question:
            'Token 5 appears three times in a batch. What is the gradient for row 5 of the embedding table?',
          options: [
            'Only the gradient from its last occurrence',
            'The average of the three gradients',
            'Zero, because repeated tokens cancel',
            'The sum of the three gradients',
          ],
          answer: 3,
          explanation:
            'Row 5 was copied into three places, and each copy influenced the loss, so the contributions add. Keeping only the last one is exactly the bug produced by assignment instead of accumulation.',
        },
        {
          question:
            'Why prefer the centered difference (L(θ+h) − L(θ−h)) / 2h over a one-sided difference?',
          options: [
            'Its error shrinks like h², so it is far more accurate for the same h',
            'It does not require running the forward pass',
            'It works with h = 0',
            'It is exact for every function',
          ],
          answer: 0,
          explanation:
            'The first-order error terms cancel in the centered version, leaving an error of order h² instead of h. It still needs two forward passes, and it is only exact for functions with no curvature beyond second order.',
        },
      ],
      challenge: {
        title: 'Scatter-add and a gradient checker',
        instructions:
          'Implement two functions. (1) embedding_backward(ix, demb, vocab_size): ix is an N x T list of integer indices, demb is an N x T x D nested list of upstream gradients; return dC, a vocab_size x D list of lists where each demb[n][t] is added into row ix[n][t] (repeats accumulate, unused rows are zero). (2) grad_check(a, b): a and b are equal-length flat lists of floats; return a tuple (max_abs, max_rel) where max_abs is the largest |a_i - b_i| and max_rel is the largest |a_i - b_i| / max(|a_i| + |b_i|, 1e-12). Both are 0.0 for empty or identical lists.',
        starter: String.raw`def embedding_backward(ix, demb, vocab_size):
    """Scatter-add demb[n][t] into row ix[n][t] of a zero vocab_size x D table."""
    # TODO: build a zero table, then accumulate with +=
    raise NotImplementedError


def grad_check(a, b):
    """Return (max_abs_diff, max_rel_error) between two flat gradient lists."""
    # TODO: track the largest absolute and relative differences
    raise NotImplementedError
`,
        solution: String.raw`def embedding_backward(ix, demb, vocab_size):
    """Scatter-add demb[n][t] into row ix[n][t] of a zero vocab_size x D table."""
    D = len(demb[0][0])
    dC = [[0.0] * D for _ in range(vocab_size)]
    for n, row in enumerate(ix):
        for t, idx in enumerate(row):
            for d in range(D):
                dC[idx][d] += demb[n][t][d]
    return dC


def grad_check(a, b):
    """Return (max_abs_diff, max_rel_error) between two flat gradient lists."""
    max_abs = 0.0
    max_rel = 0.0
    for x, y in zip(a, b):
        diff = abs(x - y)
        max_abs = max(max_abs, diff)
        max_rel = max(max_rel, diff / max(abs(x) + abs(y), 1e-12))
    return max_abs, max_rel
`,
        tests: String.raw`import math
import random

ix = [[1, 1], [0, 1]]
demb = [[[1.0, 2.0], [3.0, 4.0]], [[5.0, 6.0], [0.5, -1.0]]]
dC = embedding_backward(ix, demb, 3)
assert len(dC) == 3 and len(dC[0]) == 2, 'dC must be vocab_size x D'
assert dC[0] == [5.0, 6.0], 'row 0 gets the single gradient at ix[1][0]'
assert dC[1] == [4.5, 5.0], 'row 1 appears three times: gradients must accumulate'
assert dC[2] == [0.0, 0.0], 'unused rows must be zero'

random.seed(2)
V, D, N, T = 4, 3, 3, 2
C = [[random.uniform(-1, 1) for _ in range(D)] for _ in range(V)]
ix = [[random.randrange(V) for _ in range(T)] for _ in range(N)]
ix[0][0] = ix[2][1]
G = [[[random.uniform(-1, 1) for _ in range(D)] for _ in range(T)] for _ in range(N)]


def _loss(C):
    return sum(G[n][t][d] * C[ix[n][t]][d] for n in range(N) for t in range(T) for d in range(D))


dC = embedding_backward(ix, G, V)
h = 1e-6
num = []
for v in range(V):
    for d in range(D):
        old = C[v][d]
        C[v][d] = old + h
        lp = _loss(C)
        C[v][d] = old - h
        lm = _loss(C)
        C[v][d] = old
        num.append((lp - lm) / (2 * h))
flat = [g for row in dC for g in row]
for got, want in zip(flat, num):
    assert math.isclose(got, want, abs_tol=1e-7), 'embedding gradient disagrees with finite differences'

ma, mr = grad_check([1.0, 2.0, 0.0], [1.0, 2.5, 0.0])
assert math.isclose(ma, 0.5, rel_tol=1e-9), 'max abs diff should be 0.5'
assert math.isclose(mr, 0.5 / 4.5, rel_tol=1e-9), 'max rel error should be 0.5 / 4.5'
ma, mr = grad_check([0.0, 0.0], [0.0, 0.0])
assert ma == 0.0 and mr == 0.0, 'identical zero lists give (0.0, 0.0)'
ma, mr = grad_check(flat, num)
assert ma < 1e-7 and mr < 1e-6, 'a correct gradient should pass grad_check'
ma, mr = grad_check([1e-3], [-1e-3])
assert math.isclose(mr, 1.0, rel_tol=1e-9), 'opposite signs give relative error 1 regardless of scale'
`,
        hint: 'Start dC as zeros and loop over every (n, t), adding demb[n][t] into dC[ix[n][t]] element by element. For grad_check, loop with zip and keep two running maxima.',
      },
      lab: 'tensor',
    },
  ],
};
