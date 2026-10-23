import type { CourseModule } from '../../types';

export const wavenetModule: CourseModule = {
  id: 'wavenet',
  number: 6,
  title: 'A WaveNet-style model',
  subtitle: 'Fuse characters slowly, level by level, instead of all at once.',
  description:
    'Turn the flat character-level MLP into a hierarchical model that combines neighbouring characters in a tree, and tidy the code into reusable, torch.nn-style layers. This is an original companion to the referenced lecture: it explains the ideas in our own words with small pure-Python exercises, so watch the video for the full build.',
  duration: '56m',
  videoId: 't3YJ5hKiMQ0',
  sourceTitle: 'Building makemore Part 5: Building a WaveNet',
  topics: [
    'Hierarchical fusion',
    'Receptive fields',
    'Module design & train/eval',
    'Dilated causal convolutions',
  ],
  project:
    'A pure-Python toolkit for a WaveNet-style name model: a FlattenConsecutive reshape, a receptive-field calculator, Sequential/BatchNorm1d layers with train/eval modes, a dilated causal convolution stack, and an evaluate-and-sample loop.',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'wavenet-bottleneck',
      title: 'Why One Hidden Layer Is a Bottleneck',
      minutes: 9,
      summary:
        'The flat MLP glues every context character into one long vector and mixes it all in a single step. This module explores a different architecture that mixes information more gradually, and how to tell whether it actually helps.',
      sections: [
        {
          title: 'Where we left off',
          body: 'The earlier MLP language model looks up an embedding vector for each of the last T characters, lays those vectors end to end into one long vector of length T·C, and sends it through one hidden layer before predicting the next character. It works, and widening the context helps a little, but every extra character simply makes that first layer wider.',
        },
        {
          title: 'Everything is crushed at once',
          body: 'Each hidden neuron computes one dot product over the entire flattened context. In that single step it must discover how a character at any position relates to every other position. There is no stage where the network first builds small, reusable pieces, such as "the last two letters were th", and then reasons about those pieces. Near and distant characters are squashed together immediately.',
        },
        {
          title: 'More context, same depth',
          body: 'The first layer holds T·C·H weights plus H biases. Doubling the context doubles those weights, yet the computation stays exactly as shallow. Extra context buys more parameters but no extra structure, so improvements often fade and the larger layer becomes easier to overfit.',
          formula: 'params(first layer) = T·C·H + H',
        },
        {
          title: 'An alternative, and a hypothesis to test',
          body: "Mix information slowly: combine neighbouring characters first, then combine those combinations, and keep going until one vector summarises the whole context. This progressive fusion is the central idea of the WaveNet architecture, originally designed for audio, and the rest of this module builds it piece by piece.\n\nTreat it as a hypothesis, not a guarantee. A deeper hierarchy changes the model's structure, but it does not automatically lower held-out loss. It still has to be initialised sensibly, normalised over the right dimensions, given enough parameters and training steps, and tuned. In the lecture, the first hierarchical version scored about the same validation loss as a flat model of similar size; the improvement came only after fixing a BatchNorm bug and then scaling the network up. The only fair judge is validation loss, compared at a similar parameter count and training budget.",
        },
      ],
      keyTakeaways: [
        'The flat MLP concatenates all T embeddings and mixes them in one hidden layer.',
        'Its first-layer weight count grows linearly with context length while depth stays fixed.',
        'A hierarchical model fuses neighbours first, building structure gradually.',
      ],
      quiz: [
        {
          question:
            'With block size T = 8, embedding size C = 10 and H = 200 hidden units, how many parameters does the flat first layer have?',
          options: ['16,000', '16,200', '2,000', '80,200'],
          answer: 1,
          explanation:
            'The flattened input has T·C = 80 numbers, so the weights are 80·200 = 16,000, plus 200 biases gives 16,200. Forgetting the biases gives the tempting 16,000.',
        },
        {
          question:
            'What is the main structural weakness of feeding the whole flattened context into one hidden layer?',
          options: [
            'It cannot use embeddings at all',
            'It needs more than one output softmax',
            'All positions are mixed in a single step, so there is no stage that builds small local features first',
            'It can only look at one previous character',
          ],
          answer: 2,
          explanation:
            'The flat model does see every context character, but it combines them all in one dot product per neuron. It never builds intermediate summaries like bigrams before reasoning about longer patterns.',
        },
      ],
      challenge: {
        title: 'The flat hidden layer',
        instructions:
          'Implement three functions. `flatten_context(emb)` takes a list of T vectors (each a list of C floats) and returns one list of T*C floats, keeping the order. `flat_hidden(emb, W, b)` flattens the context and returns a list of H floats where entry h is math.tanh(sum(W[h][i] * x[i]) + b[h]); W is a list of H rows each of length T*C. `first_layer_params(T, C, H)` returns the total number of weights plus biases in that layer.',
        starter: String.raw`import math

def flatten_context(emb):
    """emb: list of T vectors, each a list of C floats.
    Return a single list of T*C floats (vectors laid end to end)."""
    # TODO
    raise NotImplementedError

def flat_hidden(emb, W, b):
    """Return tanh(W @ flatten_context(emb) + b) as a list of H floats.
    W: list of H rows, each with T*C floats. b: list of H floats."""
    # TODO
    raise NotImplementedError

def first_layer_params(T, C, H):
    """Total weights + biases of the flat first layer."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math

def flatten_context(emb):
    """emb: list of T vectors, each a list of C floats.
    Return a single list of T*C floats (vectors laid end to end)."""
    return [v for vec in emb for v in vec]

def flat_hidden(emb, W, b):
    """Return tanh(W @ flatten_context(emb) + b) as a list of H floats.
    W: list of H rows, each with T*C floats. b: list of H floats."""
    x = flatten_context(emb)
    out = []
    for row, bias in zip(W, b):
        out.append(math.tanh(sum(w * xi for w, xi in zip(row, x)) + bias))
    return out

def first_layer_params(T, C, H):
    """Total weights + biases of the flat first layer."""
    return T * C * H + H
`,
        tests: String.raw`import math

emb = [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]
assert flatten_context(emb) == [1.0, 2.0, 3.0, 4.0, 5.0, 6.0], "flatten must keep order"
assert flatten_context([[7.0, 8.0, 9.0]]) == [7.0, 8.0, 9.0], "T=1 edge case"

W = [[0.1, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, -0.2]]
b = [0.0, 0.5]
h = flat_hidden(emb, W, b)
assert len(h) == 2, "one output per hidden unit"
assert math.isclose(h[0], math.tanh(0.1), rel_tol=1e-6), "unit 0 sees only the first number"
assert math.isclose(h[1], math.tanh(-1.2 + 0.5), rel_tol=1e-6), "unit 1 sees only the last number plus bias"

W2 = [[1, 1, 1, 1, 1, 1]]
assert math.isclose(flat_hidden(emb, W2, [-21.0])[0], 0.0, abs_tol=1e-12), "sum 21 minus 21 -> tanh(0)"

assert first_layer_params(8, 10, 200) == 16200, "8*10*200 + 200"
assert first_layer_params(3, 10, 200) == 6200, "3*10*200 + 200"
assert first_layer_params(16, 10, 200) - first_layer_params(8, 10, 200) == 16000, "doubling T doubles the weights"
`,
        hint: 'Flatten with a nested comprehension, then compute one dot product per row of W, add the bias, and apply math.tanh.',
      },
      lab: 'wavenet',
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'wavenet-hierarchical-fusion',
      title: 'Fusing Pairs, Level by Level',
      minutes: 13,
      summary:
        'Build a tree over the context: fuse consecutive characters into bigrams, then 4-grams, then 8-grams, using a single reshape called FlattenConsecutive.',
      sections: [
        {
          title: 'A tree over the context',
          body: 'Take eight context characters. Level one fuses each neighbouring pair into a bigram summary, giving four vectors. Level two fuses pairs of those into two 4-gram summaries. Level three fuses the last two into a single 8-gram summary that feeds the output layer. Every fusion is a small linear layer plus a nonlinearity, and one shared layer handles every pair at its level.',
        },
        {
          title: 'A reshape instead of a loop',
          body: 'We never loop over pairs. Embeddings arrive as a (B, T, C) tensor. Grouping n consecutive positions just reinterprets it as (B, T//n, C·n): each new position holds n old vectors laid side by side. A linear layer only acts on the last dimension, so the middle dimension behaves like an extra batch dimension and every group is processed in parallel.',
          formula: 'FlattenConsecutive(n): (B, T, C) → (B, T/n, C·n)',
        },
        {
          title: 'Squeezing at the top',
          body: 'At the final level T//n equals 1, leaving a useless middle dimension of size one. FlattenConsecutive removes it and returns (B, C·n), so the output layer receives an ordinary 2-D batch of vectors just like the flat model did.',
        },
        {
          title: 'Why sharing matters',
          body: 'Because each level reuses one set of weights for all its groups, a level costs n·C·H parameters no matter how long the context is. Adding a level doubles the context covered while adding only one modest layer, which is far cheaper than widening a single flat layer.',
        },
      ],
      keyTakeaways: [
        'The hierarchy fuses pairs into bigrams, then 4-grams, then 8-grams.',
        'FlattenConsecutive(n) reshapes (B, T, C) into (B, T//n, C·n) and squeezes when T//n is 1.',
        'One linear layer per level is shared across all groups, treating the middle axis as batch.',
      ],
      quiz: [
        {
          question:
            'An input of shape (32, 8, 10) passes through FlattenConsecutive(2). What shape comes out?',
          options: ['(32, 4, 20)', '(32, 16, 5)', '(64, 4, 10)', '(32, 80)'],
          answer: 0,
          explanation:
            'Pairs of consecutive positions are merged, so T halves from 8 to 4 and each new vector holds two 10-dim embeddings, giving 20. (32, 80) would be the flat model, which merges all eight at once.',
        },
        {
          question: 'Why can one linear layer process every group at a level simultaneously?',
          options: [
            'Because each group gets its own private weight matrix',
            'Because the groups are summed before the layer',
            'Because the batch size is always 1',
            'Because a linear layer acts on the last dimension only, so leading dimensions act like batch dimensions',
          ],
          answer: 3,
          explanation:
            'Matrix multiplication applies to the last axis and broadcasts over all earlier axes, so (B, T//n) groups are all transformed by the same shared weights. Private weights per group would break the sharing that keeps the model small.',
        },
      ],
      challenge: {
        title: 'FlattenConsecutive with nested lists',
        instructions:
          'Implement `flatten_consecutive(x, n)` where x is a nested list of shape (B, T, C). Return shape (B, T//n, C*n), where new position j of batch row b is x[b][j*n] + x[b][j*n+1] + ... + x[b][j*n+n-1] (lists concatenated in order). If T//n == 1, squeeze the middle dimension and return shape (B, C*n). If T is not divisible by n, raise ValueError.',
        starter: String.raw`def flatten_consecutive(x, n):
    """x: nested list of shape (B, T, C).
    Return (B, T//n, C*n) by concatenating each run of n consecutive vectors.
    If T//n == 1, return (B, C*n) instead (squeeze).
    Raise ValueError if T % n != 0."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def flatten_consecutive(x, n):
    """x: nested list of shape (B, T, C).
    Return (B, T//n, C*n) by concatenating each run of n consecutive vectors.
    If T//n == 1, return (B, C*n) instead (squeeze).
    Raise ValueError if T % n != 0."""
    T = len(x[0])
    if T % n != 0:
        raise ValueError("T must be divisible by n")
    out = []
    for seq in x:
        groups = []
        for j in range(T // n):
            fused = []
            for vec in seq[j * n:(j + 1) * n]:
                fused.extend(vec)
            groups.append(fused)
        out.append(groups[0] if len(groups) == 1 else groups)
    return out
`,
        tests: String.raw`x = [[[10 * b + t, -(10 * b + t)] for t in range(4)] for b in range(2)]

y = flatten_consecutive(x, 2)
assert y == [
    [[0, 0, 1, -1], [2, -2, 3, -3]],
    [[10, -10, 11, -11], [12, -12, 13, -13]],
], "pairs of consecutive positions should be concatenated"

z = flatten_consecutive(x, 4)
assert z == [[0, 0, 1, -1, 2, -2, 3, -3], [10, -10, 11, -11, 12, -12, 13, -13]], "T//n == 1 must squeeze to (B, C*n)"

assert flatten_consecutive(x, 1) == x, "n=1 leaves the shape unchanged"
assert flatten_consecutive(flatten_consecutive(x, 2), 2) == z, "two pair-merges equal one 4-merge"

raised = False
try:
    flatten_consecutive(x, 3)
except ValueError:
    raised = True
assert raised, "T=4 is not divisible by 3, expected ValueError"

x8 = [[[t] for t in range(8)]]
assert flatten_consecutive(x8, 2) == [[[0, 1], [2, 3], [4, 5], [6, 7]]], "B=1, T=8, C=1"
`,
        hint: 'For each batch row, walk j from 0 to T//n - 1, slice seq[j*n:(j+1)*n] and extend one list with those vectors; squeeze when only one group exists.',
      },
      lab: 'wavenet',
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'wavenet-receptive-field',
      title: 'Receptive Fields: How Far Can an Output See?',
      minutes: 11,
      summary:
        'Count how many input positions influence one output, and see why stacking grouped layers grows that number multiplicatively.',
      sections: [
        {
          title: 'What a receptive field is',
          body: 'The receptive field of an output is the set of input positions that can change its value. For a character model it answers a simple question: how many previous characters could this prediction possibly depend on? Anything outside the field is invisible, however clever the weights are.',
        },
        {
          title: 'Flat versus hierarchical',
          body: 'The flat MLP reaches a field of eight in one jump: a single layer reads all eight characters. The hierarchical model also ends with a field of eight, but gets there in three levels of two: each bigram unit sees 2 characters, each 4-gram unit sees 4, and the top unit sees 8. Same coverage, but now with depth and shared intermediate features.',
        },
        {
          title: 'Why growth is multiplicative',
          body: 'Track two numbers per layer: the field r and the jump j, the distance in input positions between neighbouring units. A layer with kernel k adds (k − 1)·j to the field, and its stride s multiplies the jump. With k = s = 2 the jump doubles each level, so L levels see 2^L inputs. Stacking stride-1 layers instead only adds one position per layer: linear growth.',
          formula: 'r_l = r_(l−1) + (k_l − 1)·j_(l−1),   j_l = j_(l−1)·s_l,   r_0 = j_0 = 1',
        },
        {
          title: 'The payoff',
          body: 'Seeing 64 characters needs just six levels of pairs, whereas a flat layer would need one enormous input. Depth that grows logarithmically with context makes long contexts affordable to compute. Affordable is not the same as better, though: a large receptive field only says what the model could use, and whether it learns to use it shows up only in validation loss.',
        },
      ],
      keyTakeaways: [
        'The receptive field is the number of input positions that can influence an output.',
        'Grouping layers with stride equal to the kernel multiply the field: k^L for L levels.',
        'Stride-1 stacking only grows the field linearly, which is why downsampling or dilation is needed.',
      ],
      quiz: [
        {
          question:
            'Three stacked layers each fuse groups of 2 with stride 2. What is the receptive field of the top output?',
          options: ['6', '4', '8', '3'],
          answer: 2,
          explanation:
            'Each level doubles the jump, so the field goes 2 → 4 → 8, which is 2^3. Adding 2 per layer (giving 6) would be the linear-growth mistake.',
        },
        {
          question:
            'Three stacked layers with kernel 2 but stride 1 (no dilation). What is the receptive field?',
          options: ['4', '8', '2', '6'],
          answer: 0,
          explanation:
            'With stride 1 the jump stays 1, so each layer adds (2 − 1)·1 = 1 position: 1 + 1 + 1 + 1 = 4. Multiplicative growth needs the jump to grow, via stride or dilation.',
        },
      ],
      challenge: {
        title: 'Receptive field calculator',
        instructions:
          'Implement `receptive_field(layers)` where layers is a list of (kernel, stride) tuples applied bottom to top. Start with field r = 1 and jump j = 1. For each layer: r = r + (kernel - 1) * j, then j = j * stride. Return the final r as an int. An empty list returns 1.',
        starter: String.raw`def receptive_field(layers):
    """layers: list of (kernel, stride) tuples, bottom layer first.
    Return how many input positions one top-level output can see."""
    # TODO: track the field r and the jump j between neighbouring units
    raise NotImplementedError
`,
        solution: String.raw`def receptive_field(layers):
    """layers: list of (kernel, stride) tuples, bottom layer first.
    Return how many input positions one top-level output can see."""
    r, j = 1, 1
    for kernel, stride in layers:
        r += (kernel - 1) * j
        j *= stride
    return r
`,
        tests: String.raw`assert receptive_field([]) == 1, "no layers: an output sees only itself"
assert receptive_field([(8, 8)]) == 8, "flat layer over 8 characters"
assert receptive_field([(2, 2)] * 3) == 8, "three levels of pairs see 8"
assert receptive_field([(2, 2)] * 6) == 64, "six levels of pairs see 64"
assert receptive_field([(2, 1)] * 3) == 4, "stride-1 stacking only grows linearly"
assert receptive_field([(3, 3), (2, 2)]) == 6, "groups of 3 then pairs see 6"
assert receptive_field([(2, 2), (3, 1)]) == 6, "pairs then a stride-1 kernel of 3: 2 + 2*2"
`,
        hint: 'Keep two running numbers. The field grows by (kernel - 1) times the current jump; only after that does the stride multiply the jump.',
      },
      lab: 'wavenet',
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'wavenet-module-design',
      title: 'Layers as Modules: Sequential and Train/Eval',
      minutes: 14,
      summary:
        'Organise the network the way torch.nn does: callable layer objects, registered parameters, a Sequential container, and a training flag that BatchNorm must respect.',
      sections: [
        {
          title: 'Layers are callable objects',
          body: 'Each layer becomes a small class: Linear, Embedding, FlattenConsecutive, BatchNorm1d, Tanh. The constructor creates its weights and __call__ runs the forward pass, so a layer is used like a function: out = layer(x). Code that once lived in one long script turns into reusable, swappable pieces.',
        },
        {
          title: 'Parameters and Sequential',
          body: 'Every layer exposes parameters(), a list of the tensors the optimiser should update; layers without weights return an empty list. A Sequential container stores layers in order, its __call__ feeds the output of each into the next, and its parameters() simply concatenates the lists of its children. The whole model is now one object you can call, inspect and train.',
        },
        {
          title: 'Training mode versus evaluation mode',
          body: 'Some layers behave differently while learning. BatchNorm uses the current batch mean and variance during training, while also updating running averages. At evaluation time a single example has no meaningful batch statistics, so it must switch to the running estimates. A training flag on every layer, flipped by model.train() and model.eval(), keeps this explicit.',
          formula: 'running = (1 − m)·running + m·batch_stat',
        },
        {
          title: 'The 3-D BatchNorm gotcha',
          body: "Inside the hierarchy, activations are (B, T, C). If BatchNorm averages only over dimension 0, it keeps separate statistics for every position T, which is noisy and not what we want. The fix is to average over dimensions (0, 1), treating every position of every example as a sample for each channel. The code runs either way, so this bug hides silently.\n\nWhy does it hide? Broadcasting. With a batch of 32 and 4 groups of 68 channels, x.mean(0, keepdim=True) has shape (1, 4, 68), and subtracting it from x still works. The only visible clue is the shape of the running buffers: they quietly become (1, 4, 68) instead of (1, 1, 68), one set of statistics per position. Each of those estimates is built from 32 numbers instead of 32 × 4 = 128, so it is noisier.\n\nThe shape also changes stage by stage. After the first fusion the tensor is (B, 4, H), after the second (B, 2, H), and after the last FlattenConsecutive it is a plain 2-D (B, H). So the same BatchNorm class must pick its reduction dimensions from the input it receives, and the cheapest way to catch a mistake is to print every layer's output shape (and the running_mean shape) once before training.\n\n```python\n# inside BatchNorm1d.__call__, training mode\ndims = 0 if x.ndim == 2 else (0, 1)        # (B, C) or (B, T, C)\nmean = x.mean(dims, keepdim=True)          # (1, C) or (1, 1, C)\nvar = x.var(dims, keepdim=True, unbiased=False)\n\n# a one-off shape check over the whole stack\nfor layer in model.layers:\n    print(layer.__class__.__name__, tuple(layer.out.shape))\nprint(model.layers[3].running_mean.shape)  # want (1, 1, C), not (1, T, C)\n```\n\nIn the lecture, fixing this bug gave a small but real improvement in validation loss. It is a good reminder that a model can run, train and produce plausible numbers while one layer is quietly computing the wrong thing.",
        },
      ],
      keyTakeaways: [
        'Layers are classes with __call__ and parameters(); Sequential chains them and gathers parameters.',
        'BatchNorm must use batch statistics in training and running statistics in eval mode.',
        'For (B, T, C) inputs, BatchNorm statistics must be computed over dimensions (0, 1).',
      ],
      quiz: [
        {
          question:
            'A BatchNorm1d layer receives a (32, 4, 68) input but computes its mean over dimension 0 only. What goes wrong?',
          options: [
            'It raises a shape error immediately',
            'It keeps separate statistics for each of the 4 positions instead of one set per channel',
            'It normalises across channels instead of across examples',
            'Nothing; dimension 0 is the correct choice',
          ],
          answer: 1,
          explanation:
            'Averaging over dim 0 alone produces a (1, 4, 68) mean, i.e. per-position statistics estimated from fewer samples. Broadcasting means no error is raised, which is why the bug is easy to miss. Averaging over (0, 1) gives one statistic per channel.',
        },
        {
          question: 'Why must you call model.eval() before sampling a single name?',
          options: [
            'It makes gradients flow faster',
            'It reinitialises the weights',
            'It turns off the output softmax',
            'BatchNorm would otherwise compute statistics from a batch of one example instead of using its running averages',
          ],
          answer: 3,
          explanation:
            'In training mode BatchNorm normalises with the current batch. A batch of one has zero variance and a mean equal to the example itself, wiping out the signal. Eval mode switches to the running estimates gathered during training.',
        },
      ],
      challenge: {
        title: 'BatchNorm1d and Sequential',
        instructions:
          'Linear and Tanh are given (they work on any nesting depth). Implement `BatchNorm1d.__call__(self, x)` for inputs of shape (B, C) or (B, T, C): in training mode compute the per-channel mean and biased variance (divide by N) over all B (or B*T) vectors, normalise with (v - mean) / math.sqrt(var + eps), apply gamma and beta, and update running_mean/running_var with momentum: running = (1 - momentum) * running + momentum * batch_stat. In eval mode (self.training False) use the running statistics and do not update them. Return the same shape as the input. Then implement `Sequential.__call__`, `Sequential.parameters()` (concatenated layer parameters, in order), `Sequential.train()` and `Sequential.eval()` (set .training to True/False on every layer).',
        starter: String.raw`import math
import random

class Linear:
    def __init__(self, fan_in, fan_out, rng):
        self.W = [[rng.gauss(0, 1) / math.sqrt(fan_in) for _ in range(fan_in)] for _ in range(fan_out)]
        self.b = [0.0] * fan_out
        self.training = True
    def __call__(self, x):
        if isinstance(x[0], list):
            return [self(row) for row in x]
        return [sum(w * v for w, v in zip(row, x)) + bi for row, bi in zip(self.W, self.b)]
    def parameters(self):
        return [self.W, self.b]

class Tanh:
    def __init__(self):
        self.training = True
    def __call__(self, x):
        if isinstance(x[0], list):
            return [self(row) for row in x]
        return [math.tanh(v) for v in x]
    def parameters(self):
        return []

class BatchNorm1d:
    def __init__(self, dim, eps=1e-5, momentum=0.1):
        self.eps = eps
        self.momentum = momentum
        self.training = True
        self.gamma = [1.0] * dim
        self.beta = [0.0] * dim
        self.running_mean = [0.0] * dim
        self.running_var = [1.0] * dim
    def __call__(self, x):
        # TODO: x is (B, C) or (B, T, C). Statistics per channel over ALL vectors.
        raise NotImplementedError
    def parameters(self):
        return [self.gamma, self.beta]

class Sequential:
    def __init__(self, layers):
        self.layers = layers
    def __call__(self, x):
        # TODO: feed x through every layer in order
        raise NotImplementedError
    def parameters(self):
        # TODO: concatenate parameters() of all layers
        raise NotImplementedError
    def train(self):
        # TODO: set training = True on every layer
        raise NotImplementedError
    def eval(self):
        # TODO: set training = False on every layer
        raise NotImplementedError
`,
        solution: String.raw`import math
import random

class Linear:
    def __init__(self, fan_in, fan_out, rng):
        self.W = [[rng.gauss(0, 1) / math.sqrt(fan_in) for _ in range(fan_in)] for _ in range(fan_out)]
        self.b = [0.0] * fan_out
        self.training = True
    def __call__(self, x):
        if isinstance(x[0], list):
            return [self(row) for row in x]
        return [sum(w * v for w, v in zip(row, x)) + bi for row, bi in zip(self.W, self.b)]
    def parameters(self):
        return [self.W, self.b]

class Tanh:
    def __init__(self):
        self.training = True
    def __call__(self, x):
        if isinstance(x[0], list):
            return [self(row) for row in x]
        return [math.tanh(v) for v in x]
    def parameters(self):
        return []

class BatchNorm1d:
    def __init__(self, dim, eps=1e-5, momentum=0.1):
        self.eps = eps
        self.momentum = momentum
        self.training = True
        self.gamma = [1.0] * dim
        self.beta = [0.0] * dim
        self.running_mean = [0.0] * dim
        self.running_var = [1.0] * dim
    def __call__(self, x):
        is_3d = isinstance(x[0][0], list)
        rows = [v for seq in x for v in seq] if is_3d else x
        dim = len(self.gamma)
        if self.training:
            n = len(rows)
            mean = [sum(r[c] for r in rows) / n for c in range(dim)]
            var = [sum((r[c] - mean[c]) ** 2 for r in rows) / n for c in range(dim)]
            m = self.momentum
            self.running_mean = [(1 - m) * rm + m * bm for rm, bm in zip(self.running_mean, mean)]
            self.running_var = [(1 - m) * rv + m * bv for rv, bv in zip(self.running_var, var)]
        else:
            mean, var = self.running_mean, self.running_var
        def norm(v):
            return [self.gamma[c] * (v[c] - mean[c]) / math.sqrt(var[c] + self.eps) + self.beta[c] for c in range(dim)]
        if is_3d:
            return [[norm(v) for v in seq] for seq in x]
        return [norm(v) for v in x]
    def parameters(self):
        return [self.gamma, self.beta]

class Sequential:
    def __init__(self, layers):
        self.layers = layers
    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x
    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]
    def train(self):
        for layer in self.layers:
            layer.training = True
    def eval(self):
        for layer in self.layers:
            layer.training = False
`,
        tests: String.raw`import math
import random

# 2-D training mode
bn = BatchNorm1d(2)
out = bn([[1.0, 10.0], [3.0, 20.0]])
assert math.isclose(out[0][0], -1 / math.sqrt(1 + 1e-5), rel_tol=1e-6), "channel 0: mean 2, var 1"
assert math.isclose(out[1][1], 5 / math.sqrt(25 + 1e-5), rel_tol=1e-6), "channel 1: mean 15, var 25 (biased)"
assert math.isclose(bn.running_mean[0], 0.2, rel_tol=1e-6) and math.isclose(bn.running_mean[1], 1.5, rel_tol=1e-6), "running mean update"
assert math.isclose(bn.running_var[0], 1.0, rel_tol=1e-6) and math.isclose(bn.running_var[1], 3.4, rel_tol=1e-6), "running var update"

# eval mode uses running stats and does not update them
bn.training = False
e = bn([[0.2, 1.5]])
assert math.isclose(e[0][0], 0.0, abs_tol=1e-9) and math.isclose(e[0][1], 0.0, abs_tol=1e-9), "eval must use running stats"
assert math.isclose(bn.running_mean[1], 1.5, rel_tol=1e-6), "eval must not update running stats"

# 3-D input: statistics over dims (0, 1)
bn3 = BatchNorm1d(2)
x3 = [[[1.0, 0.0], [3.0, 0.0]], [[5.0, 0.0], [7.0, 0.0]]]
o3 = bn3(x3)
assert len(o3) == 2 and len(o3[0]) == 2 and len(o3[0][0]) == 2, "3-D shape must be preserved"
assert math.isclose(o3[0][0][0], (1 - 4) / math.sqrt(5 + 1e-5), rel_tol=1e-6), "mean over (0,1) is 4, var is 5"
assert math.isclose(o3[1][1][0], (7 - 4) / math.sqrt(5 + 1e-5), rel_tol=1e-6), "mean over (0,1) is 4, var is 5"
assert math.isclose(o3[1][0][1], 0.0, abs_tol=1e-9), "constant channel normalises to 0"
assert math.isclose(bn3.running_mean[0], 0.4, rel_tol=1e-6), "running mean over all B*T vectors"

# gamma / beta are applied
bn4 = BatchNorm1d(1)
bn4.gamma = [2.0]
bn4.beta = [0.5]
o4 = bn4([[0.0], [2.0]])
assert math.isclose(o4[1][0], 2.0 / math.sqrt(1 + 1e-5) + 0.5, rel_tol=1e-6), "scale by gamma then shift by beta"
bn6 = BatchNorm1d(2)
bn6.gamma = [3.0, -2.0]
bn6.beta = [1.0, 0.25]
o6 = bn6(x3)
assert math.isclose(o6[0][0][0], 3.0 * (1 - 4) / math.sqrt(5 + 1e-5) + 1.0, rel_tol=1e-6), "3-D: per-channel gamma and beta"
assert math.isclose(o6[1][0][1], 0.25, rel_tol=1e-6), "3-D: a constant channel becomes its beta"
bn6.training = False
e6 = bn6([[4.0, 0.0]])
assert math.isclose(e6[0][0], 3.0 * (4.0 - bn6.running_mean[0]) / math.sqrt(bn6.running_var[0] + 1e-5) + 1.0, rel_tol=1e-6), "eval applies gamma and beta to running-stat normalisation"

# Sequential
rng = random.Random(0)
lin = Linear(3, 4, rng)
norm = BatchNorm1d(4)
act = Tanh()
model = Sequential([lin, norm, act])
x = [[0.5, -1.0, 2.0], [1.0, 0.0, -0.5], [-2.0, 1.5, 0.3]]
ref = act(BatchNorm1d(4)(lin(x)))
got = model(x)
assert len(got) == 3 and len(got[0]) == 4, "Sequential output shape"
for gr, rr in zip(got, ref):
    for g, r in zip(gr, rr):
        assert math.isclose(g, r, rel_tol=1e-6, abs_tol=1e-12), "Sequential must chain layers in order"
params = model.parameters()
assert len(params) == 4, "Linear(2) + BatchNorm1d(2) + Tanh(0) = 4 parameter lists"
assert params[0] is lin.W and params[1] is lin.b and params[2] is norm.gamma and params[3] is norm.beta, "parameters in layer order, same objects"
model.eval()
assert all(not l.training for l in model.layers), "eval() must clear training on every layer"
model.train()
assert all(l.training for l in model.layers), "train() must set training on every layer"
`,
        hint: 'Flatten a 3-D input into a list of C-vectors first, compute per-channel statistics from that list, then rebuild the original nesting when you return. Sequential is a loop plus a list comprehension.',
      },
      lab: 'wavenet',
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'wavenet-dilated-convolutions',
      title: 'Dilated Causal Convolutions',
      minutes: 13,
      summary:
        'See how the hierarchical model can be computed for every position at once by sliding shared weights along the sequence and reusing intermediate results.',
      sections: [
        {
          title: 'One window versus every position',
          body: 'Our hierarchy predicts one next character from one window of eight. A name of length eight produces eight training examples whose windows overlap heavily, and treating them separately recomputes the same bigram and 4-gram summaries again and again. Note that the video discusses this link to convolutions conceptually and does not fully implement it; here we build a tiny version ourselves.',
        },
        {
          title: 'Convolution means sliding shared weights',
          body: 'A 1-D convolution applies the same small linear map at every position of a sequence. That is exactly our fusion layer, just slid along the whole input instead of applied to one window. Causal means each output reads only the current and earlier positions, so no prediction peeks at the future.',
          formula: 'y_t = Σ_k w_k · x_(t − (K−1−k)·d),   x_i = 0 for i < 0',
        },
        {
          title: 'Dilation recreates the tree',
          body: 'With kernel two, level one combines positions t and t − 1. Level two uses dilation 2, combining t and t − 2, and level three uses dilation 4. At the last position this reproduces the pair, 4-gram, 8-gram tree exactly, while still producing outputs everywhere else.',
        },
        {
          title: 'Reusing intermediate results',
          body: 'Each level is computed once for the whole sequence, and every higher unit simply reads the stored lower outputs it needs. The pair summary at position three is shared by all later windows containing it, so the convolutional form is a faster way to run the same model, not a different model.',
        },
      ],
      keyTakeaways: [
        'A causal convolution slides one shared fusion layer across all positions, reading only the past.',
        'Dilations 1, 2, 4 with kernel 2 reproduce the pairwise tree at every position.',
        'Shared intermediate results make it an efficient implementation of the same hierarchical model.',
      ],
      quiz: [
        {
          question:
            'With kernel size 2, which dilations at levels 1, 2, 3 let the top output at position t cover exactly positions t−7 … t?',
          options: ['1, 1, 1', '2, 4, 8', '1, 2, 4', '1, 3, 9'],
          answer: 2,
          explanation:
            'Dilations 1, 2, 4 give fields 2, 4, 8, matching the pair tree. Using 1, 1, 1 would only reach 4 positions, and 2, 4, 8 would skip neighbours and leave gaps.',
        },
        {
          question:
            'Why is the convolutional form more efficient than running the hierarchy separately for each window?',
          options: [
            'Intermediate summaries are computed once per position and reused by every later window that needs them',
            'It uses fewer parameters than the hierarchical model',
            'It skips the nonlinearity',
            'It looks at fewer characters per prediction',
          ],
          answer: 0,
          explanation:
            'The weights and the receptive field are identical; the saving comes from not recomputing overlapping bigram and 4-gram summaries. It is the same model, run more cleverly.',
        },
      ],
      challenge: {
        title: 'A tiny causal dilated stack',
        instructions:
          'Implement `causal_dilated_conv(x, w, dilation)` for a 1-D list of floats x and kernel weights w (length K). Return a list y of the same length where y[t] = sum over k of w[k] * x[t - (K - 1 - k) * dilation], treating any negative index as 0. So w[-1] multiplies the current position. Then implement `wavenet_stack(x, layers)`, where `layers` is a list of `(w, dilation)` pairs, one per level. Each level has its own kernel weights, just as each level of the hierarchy has its own Linear layer. Apply causal_dilated_conv for each pair in order, feeding each output into the next level, and return the final list. An empty `layers` list returns x unchanged. No nonlinearity.',
        starter: String.raw`def causal_dilated_conv(x, w, dilation):
    """y[t] = sum_k w[k] * x[t - (K-1-k)*dilation]; indices below 0 count as 0.
    Return a list with the same length as x."""
    # TODO
    raise NotImplementedError

def wavenet_stack(x, layers):
    """layers is a list of (w, dilation) pairs, one per level, each with its own weights.
    Apply causal_dilated_conv for each level in order and return the final list."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`def causal_dilated_conv(x, w, dilation):
    """y[t] = sum_k w[k] * x[t - (K-1-k)*dilation]; indices below 0 count as 0.
    Return a list with the same length as x."""
    K = len(w)
    y = []
    for t in range(len(x)):
        total = 0.0
        for k in range(K):
            i = t - (K - 1 - k) * dilation
            if i >= 0:
                total += w[k] * x[i]
        y.append(total)
    return y

def wavenet_stack(x, layers):
    """layers is a list of (w, dilation) pairs, one per level, each with its own weights.
    Apply causal_dilated_conv for each level in order and return the final list."""
    for w, dilation in layers:
        x = causal_dilated_conv(x, w, dilation)
    return x
`,
        tests: String.raw`import math

x = [1.0, 2.0, 3.0, 4.0]
assert causal_dilated_conv(x, [10.0, 1.0], 1) == [1.0, 12.0, 23.0, 34.0], "dilation 1: 10*previous + current"
assert causal_dilated_conv(x, [10.0, 1.0], 2) == [1.0, 2.0, 13.0, 24.0], "dilation 2: 10*x[t-2] + x[t]"
assert causal_dilated_conv(x, [3.0], 5) == [3.0, 6.0, 9.0, 12.0], "kernel 1 just scales"
assert causal_dilated_conv(x, [1.0, 1.0, 1.0], 1) == [1.0, 3.0, 6.0, 9.0], "kernel 3, causal running window"

# The stack reproduces the pairwise tree at the last position, with DIFFERENT weights per level
w1, w2, w3 = [0.5, -2.0], [1.5, 0.25], [-0.75, 3.0]
seq = [0.3, -1.2, 2.5, 0.7, -0.4, 1.1, 0.9, -2.2]
fuse = lambda w, a, b: w[0] * a + w[1] * b
level1 = [fuse(w1, seq[i], seq[i + 1]) for i in range(0, 8, 2)]
level2 = [fuse(w2, level1[i], level1[i + 1]) for i in range(0, 4, 2)]
top = fuse(w3, level2[0], level2[1])

y1 = causal_dilated_conv(seq, w1, 1)
for got, want in zip([y1[1], y1[3], y1[5], y1[7]], level1):
    assert math.isclose(got, want, rel_tol=1e-9), "odd positions of level 1 are the tree's bigram nodes"
out = wavenet_stack(seq, [(w1, 1), (w2, 2), (w3, 4)])
assert len(out) == 8, "same length as input"
assert math.isclose(out[7], top, rel_tol=1e-9), "last position equals the hierarchical tree output, each level using its own weights"
same = wavenet_stack(seq, [(w1, 1), (w1, 2), (w1, 4)])
assert not math.isclose(same[7], out[7], rel_tol=1e-9), "levels must use their own weights, not the first level's"
two = wavenet_stack(seq, [(w1, 1), (w2, 2)])
assert math.isclose(two[7], level2[1], rel_tol=1e-9) and math.isclose(two[3], level2[0], rel_tol=1e-9), "two levels give the 4-gram nodes"
assert wavenet_stack(seq, []) == seq, "no layers returns the input"
`,
        hint: "Compute the input index i = t - (K - 1 - k) * dilation for each tap and skip it when i < 0. The stack is just a loop over the (w, dilation) pairs that feeds each output into the next call with that level's own weights.",
      },
      lab: 'wavenet',
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'wavenet-evaluation-sampling',
      title: 'Evaluate, Sample, and Run Disciplined Experiments',
      minutes: 12,
      summary:
        'Switch to eval mode, measure loss on each split, generate names, and keep a clean experiment log so improvements are real.',
      sections: [
        {
          title: 'Evaluation mode first',
          body: 'Before measuring anything, call model.eval() so BatchNorm uses its running statistics instead of the current batch. Forgetting this makes losses depend on which examples happen to share a batch, and makes single-example sampling nonsense. Gradients are not needed either, so evaluation can skip that bookkeeping.',
        },
        {
          title: 'Split losses',
          body: 'Compute the average negative log-likelihood of the correct next character on the training and validation splits. A train loss far below validation signals overfitting; both high together signals underfitting. The test split is touched only rarely, at the very end, so it stays an honest estimate.',
          formula: 'loss = −(1/N) Σ log p(y_i | context_i)',
        },
        {
          title: 'Sampling names',
          body: 'Start from a context of all "." tokens. Ask the model for a probability distribution, draw one character, shift it into the context, and repeat until "." is drawn again. The generated names give a quick, human sanity check that numbers alone cannot.',
        },
        {
          title: 'Experiment discipline',
          body: 'Training curves are noisy, so plot the loss averaged over chunks of steps. Change one hyperparameter at a time, such as embedding size, hidden width, or learning-rate schedule, and log every run with its settings and both split losses. Choose winners by validation loss only, and fix random seeds so comparisons are fair.',
        },
      ],
      keyTakeaways: [
        'Always switch to eval mode before computing losses or sampling.',
        'Compare runs by validation loss; keep the test split for the final check.',
        'Log every configuration, change one thing at a time, and smooth noisy loss curves.',
      ],
      quiz: [
        {
          question:
            'Run A has train loss 1.70 and val loss 2.15. Run B has train 1.95 and val 2.02. Which should you keep, and why?',
          options: [
            'Run A, because its training loss is lower',
            'Run B, because model selection should use validation loss and A is overfitting',
            'Run A, because a bigger gap means the model learned more',
            'Neither; you should pick using the test loss',
          ],
          answer: 1,
          explanation:
            "Validation loss estimates performance on unseen data, and B wins there. A's large train/val gap is a classic overfitting signal. Picking with the test split would leak it into model selection.",
        },
        {
          question: 'When does the sampling loop for one name stop?',
          options: [
            'After exactly block_size characters',
            'When the probabilities become uniform',
            'When the context is full of letters',
            'When the model samples the "." end token',
          ],
          answer: 3,
          explanation:
            'The "." token marks both the start and the end of a name, so drawing it ends the sample. A maximum length is only a safety guard, not the normal stopping rule.',
        },
      ],
      challenge: {
        title: 'Evaluate and sample',
        instructions:
          'Implement `evaluate(model, splits)`: set model.training = False, then return a dict mapping each split name to the mean of -math.log(model(context)[target]) over that split\'s (context, target) pairs. Implement `sample_name(model, block_size, itos, rng, max_len=20)`: set model.training = False, start with context = [0] * block_size (index 0 is the "." token), and repeat: probs = model(context); r = rng.random(); pick the first index ix whose cumulative probability exceeds r; if ix == 0 stop; otherwise append itos[ix] and set context = context[1:] + [ix]. Stop after max_len characters. Return the joined string.',
        starter: String.raw`import math
import random

def evaluate(model, splits):
    """splits: dict name -> list of (context, target).
    Set eval mode, return dict name -> mean negative log-likelihood."""
    # TODO
    raise NotImplementedError

def sample_name(model, block_size, itos, rng, max_len=20):
    """Generate one name. Index 0 is the '.' token (start and end).
    Use exactly one rng.random() per step and the cumulative-probability rule."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math
import random

def evaluate(model, splits):
    """splits: dict name -> list of (context, target).
    Set eval mode, return dict name -> mean negative log-likelihood."""
    model.training = False
    result = {}
    for name, examples in splits.items():
        total = 0.0
        for context, target in examples:
            total += -math.log(model(context)[target])
        result[name] = total / len(examples)
    return result

def sample_name(model, block_size, itos, rng, max_len=20):
    """Generate one name. Index 0 is the '.' token (start and end).
    Use exactly one rng.random() per step and the cumulative-probability rule."""
    model.training = False
    context = [0] * block_size
    out = []
    while len(out) < max_len:
        probs = model(context)
        r = rng.random()
        cum = 0.0
        ix = len(probs) - 1
        for i, p in enumerate(probs):
            cum += p
            if cum > r:
                ix = i
                break
        if ix == 0:
            break
        out.append(itos[ix])
        context = context[1:] + [ix]
    return ''.join(out)
`,
        tests: String.raw`import math
import random

class ToyModel:
    """Uniform in training mode, a fixed table in eval mode (like a BatchNorm-dependent net)."""
    def __init__(self, table):
        self.training = True
        self.table = table
    def __call__(self, context):
        if self.training:
            return [1 / 3] * 3
        return self.table[context[-1]]

table = {0: [0.1, 0.6, 0.3], 1: [0.5, 0.25, 0.25], 2: [0.2, 0.2, 0.6]}
m = ToyModel(table)
splits = {"train": [([0, 0], 1), ([0, 1], 0)], "val": [([1, 2], 2)]}
res = evaluate(m, splits)
assert m.training is False, "evaluate must switch the model to eval mode"
assert set(res) == {"train", "val"}, "one loss per split"
assert math.isclose(res["train"], -(math.log(0.6) + math.log(0.5)) / 2, rel_tol=1e-6), "mean NLL on train"
assert math.isclose(res["val"], -math.log(0.6), rel_tol=1e-6), "mean NLL on val"

class Deterministic:
    def __init__(self):
        self.training = True
    def __call__(self, context):
        last = context[-1]
        if self.training:
            return [1.0, 0.0, 0.0]
        nxt = {0: 1, 1: 2, 2: 0}[last]
        probs = [0.0, 0.0, 0.0]
        probs[nxt] = 1.0
        return probs

itos = {0: ".", 1: "a", 2: "b"}
d = Deterministic()
assert sample_name(d, 3, itos, random.Random(1)) == "ab", "one-hot model must produce 'ab' then stop at '.'"
assert d.training is False, "sample_name must switch to eval mode"

class Loop:
    training = True
    def __call__(self, context):
        return [0.0, 1.0, 0.0]
assert sample_name(Loop(), 2, itos, random.Random(0), max_len=5) == "aaaaa", "max_len guard"

class Uniform:
    training = True
    def __call__(self, context):
        return [1 / 3, 1 / 3, 1 / 3]
ref = random.Random(42)
expected = []
while True:
    r = ref.random()
    ix = 0 if r < 1 / 3 else (1 if r < 2 / 3 else 2)
    if ix == 0 or len(expected) == 20:
        break
    expected.append(itos[ix])
assert sample_name(Uniform(), 3, itos, random.Random(42)) == "".join(expected), "cumulative sampling with one rng.random() per step"
`,
        hint: 'For evaluate, average -math.log of the probability assigned to the true target. For sampling, walk a running sum through probs and stop at the first index where it exceeds r.',
      },
      lab: 'wavenet',
    },
  ],
};
