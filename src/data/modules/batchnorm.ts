import type { CourseModule } from '../../types';

export const batchnormModule: CourseModule = {
  id: 'batchnorm',
  number: 4,
  title: 'Activations & BatchNorm',
  subtitle: 'Learn to read the health of a deep network and keep its signals well-scaled.',
  description:
    'An original, hands-on companion to the lecture on activations, gradients, and Batch Normalization. You will learn why a fresh network can start out badly, how careful initialization and normalization keep activations in a useful range, and which diagnostics reveal whether training is healthy. Watch the video for the full build; here you rebuild the core ideas in small pure-Python exercises.',
  duration: '1h55m',
  videoId: 'P6sfmUTpUmc',
  sourceTitle: 'Building makemore Part 3: Activations & Gradients, BatchNorm',
  topics: [
    'Initialization and saturation',
    'Kaiming scaling',
    'Batch Normalization',
    'Training diagnostics',
  ],
  project:
    'A pure-Python toolkit that checks initial loss, scales weights with Kaiming init, measures activation health, runs a BatchNorm layer in training and inference modes, and tunes the learning rate from update-to-data ratios.',
  lessons: [
    {
      id: 'batchnorm-initial-loss',
      title: 'A Bad Start: Initial Loss and Saturated tanh',
      minutes: 12,
      summary:
        'Before training, a network should be unsure about every class. Learn how to spot an over-confident start and why saturated tanh units block gradients.',
      sections: [
        {
          title: 'What should the loss be at step zero?',
          body: 'A freshly initialized character model knows nothing, so the honest guess is a uniform distribution over the 27 tokens. Each correct token then gets probability 1/27, and the cross-entropy loss is its negative log. If your first reported loss is far above this number, the network is confidently wrong before it has seen any data, and the first part of training is wasted just undoing that bad start.',
          formula: 'L0 = -log(1/27) = log(27) ≈ 3.296',
        },
        {
          title: 'Over-confident logits',
          body: 'Softmax turns logits into probabilities. When logits are large and spread out, softmax becomes very peaked, so a random guess puts almost all its mass on one wrong token, and the loss for the true token becomes huge. The fix is simple: make the output layer produce small logits at the start, for example by shrinking its weights and setting its bias to zero. Small, similar logits mean a near-uniform prediction.',
        },
        {
          title: 'Saturated tanh blocks gradients',
          body: 'A hidden layer with tanh squashes its pre-activation into (-1, 1). If pre-activations are large, most outputs sit at -1 or +1. In that flat region the local derivative is almost zero, so whatever gradient arrives from above gets multiplied by roughly zero. The unit stops learning, and weights feeding it barely move.',
          formula: 'd tanh(x)/dx = 1 - tanh(x)²',
        },
        {
          title: 'The lesson',
          body: 'Both problems come from the same cause: numbers that are too big at initialization. Checking the first loss and the share of saturated units is a cheap habit that catches them early.',
        },
      ],
      keyTakeaways: [
        'A sensible initial loss for K equally likely classes is -log(1/K); for 27 tokens that is about 3.30.',
        'Large initial logits make softmax over-confident and inflate the starting loss.',
        'When |x| is large, tanh is flat, its local gradient 1 - tanh(x)² is near zero, and learning stalls.',
      ],
      quiz: [
        {
          question: 'A 27-class model with uniform predictions should report roughly which loss?',
          options: ['0.0', '27.0', '3.30', '1/27 ≈ 0.037'],
          answer: 2,
          explanation:
            'Uniform predictions give every class probability 1/27, so the loss is -log(1/27) = log(27) ≈ 3.30. The value 1/27 is the probability itself, not its negative log.',
        },
        {
          question:
            'A tanh unit outputs 0.999 for nearly every example. What happens to gradients through it?',
          options: [
            'They are scaled by about 0.002, so they nearly vanish',
            'They are doubled, causing exploding gradients',
            'They pass through unchanged because tanh is smooth',
            'They become negative and reverse the update',
          ],
          answer: 0,
          explanation:
            'The local derivative is 1 - 0.999² ≈ 0.002, so incoming gradient is multiplied by a tiny number. Smoothness does not help: the curve is smooth but almost flat there.',
        },
      ],
      challenge: {
        title: 'Check the start of training',
        instructions:
          'Implement `nll_from_logits(logits, target)` which returns the negative log-probability of index `target` under softmax(logits). Subtract the max logit before exponentiating for numerical stability. Also implement `tanh_local_grad(x)` which returns the derivative of tanh at x, i.e. 1 - tanh(x)**2. Both return floats.',
        starter: String.raw`import math

def nll_from_logits(logits, target):
    """Return -log(softmax(logits)[target]) as a float.
    Subtract max(logits) before exp for stability."""
    # TODO: compute a stable softmax and return the negative log-probability
    raise NotImplementedError

def tanh_local_grad(x):
    """Return d/dx tanh(x) = 1 - tanh(x)**2."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math

def nll_from_logits(logits, target):
    """Return -log(softmax(logits)[target]) as a float.
    Subtract max(logits) before exp for stability."""
    m = max(logits)
    exps = [math.exp(z - m) for z in logits]
    total = sum(exps)
    return -math.log(exps[target] / total)

def tanh_local_grad(x):
    """Return d/dx tanh(x) = 1 - tanh(x)**2."""
    t = math.tanh(x)
    return 1.0 - t * t
`,
        tests: String.raw`import math
import random

# Uniform logits give the "know nothing" loss log(27)
assert math.isclose(nll_from_logits([0.0] * 27, 5), math.log(27), rel_tol=1e-6), "uniform logits should give log(27)"
assert math.isclose(nll_from_logits([4.0] * 27, 0), math.log(27), rel_tol=1e-6), "shifting all logits must not change the loss"

# Hand-computed small case
expected = -math.log(math.exp(1.0) / (math.exp(1.0) + math.exp(2.0) + math.exp(3.0)))
assert math.isclose(nll_from_logits([1.0, 2.0, 3.0], 0), expected, rel_tol=1e-6), "wrong value on [1,2,3]"

# Over-confident wrong logits blow up the loss
big = [0.0] * 27
big[3] = 20.0
assert nll_from_logits(big, 0) > 19.0, "confident wrong prediction should have a huge loss"

# Stability: huge logits must not overflow
assert math.isclose(nll_from_logits([1000.0, 1000.0], 1), math.log(2), rel_tol=1e-6), "use the max-subtraction trick"

# Large random logits give a worse start than small ones
random.seed(0)
target = 7
small = [random.gauss(0, 0.01) for _ in range(27)]
large = [random.gauss(0, 10.0) for _ in range(27)]
large[target] = min(large)
assert abs(nll_from_logits(small, target) - math.log(27)) < 0.05, "small logits should be near log(27)"
assert nll_from_logits(large, target) > 10.0, "large random logits should give a bad initial loss"

# tanh local gradient
assert math.isclose(tanh_local_grad(0.0), 1.0, rel_tol=1e-9), "gradient at 0 should be 1"
h = 1e-6
fd = (math.tanh(0.7 + h) - math.tanh(0.7 - h)) / (2 * h)
assert math.isclose(tanh_local_grad(0.7), fd, rel_tol=1e-6), "should match finite differences"
assert tanh_local_grad(5.0) < 1e-3, "saturated tanh should have a tiny gradient"
assert math.isclose(tanh_local_grad(-2.0), tanh_local_grad(2.0), rel_tol=1e-9), "gradient is symmetric"
`,
        hint: 'For the loss, compute exp(z - max) for every logit, divide the target entry by the sum, then take -log. For tanh, reuse math.tanh.',
      },
      lab: 'normalization',
    },
    {
      id: 'batchnorm-kaiming-init',
      title: 'Kaiming Init: Scaling Weights by Fan-In',
      minutes: 11,
      summary:
        'Pick the weight scale so each layer keeps its activations at roughly unit size. The rule depends on the number of inputs and the nonlinearity.',
      sections: [
        {
          title: 'Why the output grows',
          body: 'A linear unit adds up fan_in products w·x. If inputs and weights are independent with zero mean, the variances add: the output variance is fan_in times the weight variance times the input variance. With weights of standard deviation 1 and 200 inputs, the output standard deviation is about √200 ≈ 14. Stack a few such layers and values explode or, with tiny weights, shrink toward zero.',
          formula: 'Var(y) = fan_in · Var(w) · Var(x)',
        },
        {
          title: 'The fan-in rule',
          body: 'To keep Var(y) equal to Var(x), choose Var(w) = 1/fan_in, which means a standard deviation of 1/√fan_in. Nonlinearities then change the picture: tanh squashes values and shrinks their spread, so we multiply by a gain a bit above 1 to compensate. A common choice for tanh is 5/3; ReLU, which zeros half its inputs, uses √2.',
          formula: 'std(w) = gain / √fan_in,   gain_tanh = 5/3,   gain_relu = √2',
        },
        {
          title: 'Why preserving scale matters',
          body: 'When every layer receives inputs of a similar size, tanh units stay in their responsive middle region, and gradients flowing backward are neither amplified nor crushed at each step. That keeps the whole stack trainable with one learning rate. Without it, early layers may learn far slower or faster than later ones.',
        },
        {
          title: 'Where it stops being enough',
          body: 'Good initialization only fixes the start. As weights change during training, scales can drift again, which motivates normalization layers that actively keep activations well-behaved.',
        },
      ],
      keyTakeaways: [
        'Summing fan_in random products multiplies the variance by about fan_in.',
        'Kaiming init sets std(w) = gain / √fan_in so activations keep roughly constant size.',
        'The gain compensates for the nonlinearity: about 5/3 for tanh and √2 for ReLU.',
      ],
      quiz: [
        {
          question:
            'A tanh layer has fan_in = 100. What weight standard deviation does Kaiming init suggest?',
          options: ['5/3', '(5/3) / 10 ≈ 0.167', '1/100 = 0.01', '√100 = 10'],
          answer: 1,
          explanation:
            'std = gain / √fan_in = (5/3) / √100 = 0.167. Using 1/fan_in confuses the variance rule with the standard deviation rule.',
        },
        {
          question: 'Why is the tanh gain slightly larger than 1?',
          options: [
            'To make the network output larger logits',
            'Because tanh doubles the variance of its input',
            'To speed up the learning rate schedule',
            'Because tanh squashes values, so a slight boost keeps the spread from shrinking layer after layer',
          ],
          answer: 3,
          explanation:
            'tanh is contractive: it pulls values toward ±1 and shrinks variance. A gain of about 5/3 offsets that shrinkage. It does not double variance; that reasoning applies in reverse to ReLU.',
        },
      ],
      challenge: {
        title: 'Initialize with the fan-in rule',
        instructions:
          'Implement `kaiming_std(fan_in, gain=1.0)` returning gain / sqrt(fan_in). Then implement `init_weights(fan_in, fan_out, gain=1.0, seed=0)` that calls random.seed(seed) and returns a list of fan_in rows, each a list of fan_out values drawn with random.gauss(0, kaiming_std(fan_in, gain)). Row i holds the weights leaving input i.',
        starter: String.raw`import math
import random

def kaiming_std(fan_in, gain=1.0):
    """Return gain / sqrt(fan_in)."""
    # TODO
    raise NotImplementedError

def init_weights(fan_in, fan_out, gain=1.0, seed=0):
    """Return a fan_in x fan_out list of lists of Gaussian weights
    with mean 0 and std kaiming_std(fan_in, gain). Call random.seed(seed) first."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math
import random

def kaiming_std(fan_in, gain=1.0):
    """Return gain / sqrt(fan_in)."""
    return gain / math.sqrt(fan_in)

def init_weights(fan_in, fan_out, gain=1.0, seed=0):
    """Return a fan_in x fan_out list of lists of Gaussian weights
    with mean 0 and std kaiming_std(fan_in, gain). Call random.seed(seed) first."""
    random.seed(seed)
    std = kaiming_std(fan_in, gain)
    return [[random.gauss(0.0, std) for _ in range(fan_out)] for _ in range(fan_in)]
`,
        tests: String.raw`import math
import random

assert math.isclose(kaiming_std(100, 5 / 3), (5 / 3) / 10, rel_tol=1e-9), "tanh gain with fan_in=100"
assert math.isclose(kaiming_std(64), 0.125, rel_tol=1e-9), "default gain should be 1"
assert math.isclose(kaiming_std(2, math.sqrt(2)), 1.0, rel_tol=1e-9), "ReLU gain sqrt(2) with fan_in=2"

W = init_weights(50, 40, gain=5 / 3, seed=1)
assert len(W) == 50 and all(len(r) == 40 for r in W), "shape must be fan_in x fan_out"
assert init_weights(50, 40, gain=5 / 3, seed=1) == W, "same seed must give same weights"

flat = [w for r in W for w in r]
mean = sum(flat) / len(flat)
std = math.sqrt(sum((w - mean) ** 2 for w in flat) / len(flat))
assert abs(mean) < 0.02, "weights should have mean near 0"
assert abs(std - (5 / 3) / math.sqrt(50)) < 0.02, "empirical std should match gain/sqrt(fan_in)"

# A linear layer with gain 1 should roughly preserve unit scale
fan_in, fan_out, n = 200, 50, 200
W1 = init_weights(fan_in, fan_out, gain=1.0, seed=3)
random.seed(42)
outs = []
for _ in range(n):
    x = [random.gauss(0, 1) for _ in range(fan_in)]
    for j in range(fan_out):
        outs.append(sum(x[i] * W1[i][j] for i in range(fan_in)))
m = sum(outs) / len(outs)
s = math.sqrt(sum((o - m) ** 2 for o in outs) / len(outs))
assert 0.85 < s < 1.15, "Kaiming init should keep output std near 1, got %f" % s
`,
        hint: 'kaiming_std is one line with math.sqrt. In init_weights, seed first, compute the std once, then build a nested list comprehension of random.gauss calls.',
      },
      lab: 'normalization',
    },
    {
      id: 'batchnorm-activation-stats',
      title: 'Reading Activation Statistics',
      minutes: 10,
      summary:
        'Summarize each layer with a few numbers: mean, spread, saturation share, and dead units. These reveal problems long before the loss curve does.',
      sections: [
        {
          title: 'Histograms tell a story',
          body: 'Collect the outputs of a hidden layer over one batch and draw a histogram. A healthy tanh layer looks like a broad hump spread across (-1, 1). An unhealthy one piles up at the edges near -1 and +1, or collapses into a thin spike at zero. Comparing histograms across layers shows whether the scale is stable as depth grows.',
        },
        {
          title: 'Saturation percentage',
          body: 'A single number captures the edge pile-up: the fraction of activations whose absolute value exceeds a threshold such as 0.97. A few percent is fine. Values well above that mean many units are in the flat region where gradients die. Tracking this number per layer during training shows whether things improve or degrade.',
          formula: 'saturated% = count(|a| > t) / count(a) × 100',
        },
        {
          title: 'Dead neurons',
          body: 'A unit is dead when it never does anything useful for any example. For tanh that means it is saturated for every input in the batch; for ReLU it means it outputs zero for every input. Either way, no gradient reaches its incoming weights, so it may never recover. Dead units usually come from too-large initial weights or a learning rate that knocked them into a bad region.',
        },
        {
          title: 'Mean and standard deviation',
          body: 'The overall mean should sit near zero and the standard deviation should stay similar from layer to layer. A shrinking standard deviation signals vanishing signal; a growing one signals explosion.',
        },
        {
          title: 'Gradient histograms: the backward-pass mirror',
          body: 'Forward statistics only tell half the story. After loss.backward(), make the same kind of plot for the gradient flowing into each layer\'s output (in PyTorch you keep it with t.retain_grad() on the non-leaf tensor, then read t.grad). Healthy networks show gradient histograms with a similar spread at every depth. If the gradient std shrinks layer by layer as you move toward the input, early layers learn slowly (vanishing); if it grows, they get hammered (exploding).\n\nA tanh gain that is too small makes activations shrink and gradients shrink with them. A gain that is too large saturates the units, and the 1 − t² factor wipes the gradient out. The "right" gain (about 5/3 for tanh) keeps both pictures stable. Read the two plots together: forward stats show whether information survives the trip up the network, gradient stats show whether learning signal survives the trip back down. BatchNorm makes both much less fragile, which is exactly why these plots look boring once it is in place.\n\n```python\n# sketch, inside a PyTorch training script\nfor layer in layers:\n    layer.out.retain_grad()          # keep grads on intermediate outputs\nloss.backward()\nfor i, layer in enumerate(layers):\n    if isinstance(layer, Tanh):\n        g = layer.out.grad\n        print(i, "grad mean", g.mean().item(), "grad std", g.std().item())\n```',
        },
      ],
      keyTakeaways: [
        'Activation histograms and their standard deviation show whether scale is stable across layers.',
        'Saturation percentage measures how many tanh outputs are stuck in the flat, gradient-killing region.',
        'A dead unit is inactive or saturated for every example, so its weights receive no gradient.',
      ],
      quiz: [
        {
          question: 'Which batch of tanh activations for one unit indicates a dead unit?',
          options: [
            '0.999, -0.998, 0.997, 0.999 (saturated on every example)',
            '0.2, -0.4, 0.6, -0.1',
            '0.0, 0.1, -0.1, 0.05',
            '0.999, 0.1, -0.3, 0.5',
          ],
          answer: 0,
          explanation:
            'Saturated on every example means the local gradient is near zero everywhere, so the weights never update. The last option is saturated only once, so it still learns from the other examples.',
        },
        {
          question:
            'Layer 1 activations have std 0.65, layer 4 has std 0.05. What does this suggest?',
          options: [
            'The network is perfectly initialized',
            'Activations are exploding with depth',
            'The signal is vanishing with depth, so weights are probably too small',
            'Too many units are saturated',
          ],
          answer: 2,
          explanation:
            'A shrinking spread means each layer scales its input down, so deeper layers see almost nothing. Saturation would show the opposite: a spread pushed toward ±1.',
        },
      ],
      challenge: {
        title: 'Compute layer health statistics',
        instructions:
          'Implement `activation_stats(acts, threshold=0.97)`. `acts` is a list of rows, one per example, each a list of tanh outputs (one per unit). Return a dict with keys: "mean" (mean of all values), "std" (population standard deviation of all values, dividing by N), "saturated_frac" (fraction of all values with abs(value) > threshold), and "dead_units" (sorted list of unit indices whose value has abs > threshold for every example).',
        starter: String.raw`import math

def activation_stats(acts, threshold=0.97):
    """acts: list of rows (examples), each a list of unit activations.
    Return {"mean", "std", "saturated_frac", "dead_units"}."""
    # TODO: flatten for mean/std/saturation, scan columns for dead units
    raise NotImplementedError
`,
        solution: String.raw`import math

def activation_stats(acts, threshold=0.97):
    """acts: list of rows (examples), each a list of unit activations.
    Return {"mean", "std", "saturated_frac", "dead_units"}."""
    flat = [a for row in acts for a in row]
    n = len(flat)
    mean = sum(flat) / n
    std = math.sqrt(sum((a - mean) ** 2 for a in flat) / n)
    saturated = sum(1 for a in flat if abs(a) > threshold)
    num_units = len(acts[0])
    dead = [j for j in range(num_units) if all(abs(row[j]) > threshold for row in acts)]
    return {"mean": mean, "std": std, "saturated_frac": saturated / n, "dead_units": dead}
`,
        tests: String.raw`import math
import random

acts = [
    [0.99, 0.1, -0.5],
    [-0.98, 0.2, 0.99],
    [0.995, -0.3, 0.0],
]
s = activation_stats(acts)
flat = [0.99, 0.1, -0.5, -0.98, 0.2, 0.99, 0.995, -0.3, 0.0]
m = sum(flat) / 9
sd = math.sqrt(sum((a - m) ** 2 for a in flat) / 9)
assert math.isclose(s["mean"], m, rel_tol=1e-9), "wrong mean"
assert math.isclose(s["std"], sd, rel_tol=1e-9), "std must use population formula (divide by N)"
assert math.isclose(s["saturated_frac"], 4 / 9, rel_tol=1e-9), "4 of 9 values exceed 0.97"
assert s["dead_units"] == [0], "only unit 0 is saturated for every example"

# Custom threshold
s2 = activation_stats(acts, threshold=0.4)
assert math.isclose(s2["saturated_frac"], 5 / 9, rel_tol=1e-9), "threshold 0.4 -> 5 values"
assert s2["dead_units"] == [0], "unit 2 has 0.0, unit 1 never exceeds 0.4"

# Healthy vs saturated layer from random pre-activations
random.seed(0)
healthy = [[math.tanh(random.gauss(0, 0.5)) for _ in range(20)] for _ in range(50)]
hot = [[math.tanh(random.gauss(0, 10.0)) for _ in range(20)] for _ in range(50)]
assert activation_stats(healthy)["saturated_frac"] < 0.01, "small pre-activations rarely saturate"
assert activation_stats(hot)["saturated_frac"] > 0.7, "large pre-activations mostly saturate"
assert activation_stats(healthy)["dead_units"] == [], "no dead units in a healthy layer"

# Two always-saturated units
dead_layer = [[1.0, 0.0, -1.0, 0.5] for _ in range(5)]
assert activation_stats(dead_layer)["dead_units"] == [0, 2], "units 0 and 2 are dead"
`,
        hint: 'Flatten the rows once for mean, std, and saturation. For dead units, loop over column indices j and use all(...) over the rows.',
      },
      lab: 'normalization',
    },
    {
      id: 'batchnorm-training-mode',
      title: 'BatchNorm in Training Mode',
      minutes: 13,
      summary:
        'Batch Normalization forces each feature to have zero mean and unit variance over the batch, then lets the network rescale it with learned parameters.',
      sections: [
        {
          title: 'The idea',
          body: 'Instead of hoping that initialization keeps pre-activations well-scaled, we can simply standardize them. For every feature, compute its mean and variance across the examples in the current batch, subtract the mean, and divide by the standard deviation. The result is roughly zero-mean and unit-variance, exactly the range where tanh responds best.',
          formula: 'μ = (1/m) Σ x_i,   σ² = (1/m) Σ (x_i - μ)²',
        },
        {
          title: 'Normalize, then scale and shift',
          body: 'A small constant eps is added inside the square root so we never divide by zero when a feature is constant. Forcing unit variance forever would limit what the layer can express, so two learnable vectors follow: gamma scales and beta shifts each feature. Initialized to 1 and 0, they start as a no-op and let training choose the best range.',
          formula: 'x̂_i = (x_i - μ) / √(σ² + eps),   y_i = γ · x̂_i + β',
        },
        {
          title: 'Why the bias becomes redundant',
          body: 'If the linear layer before BatchNorm adds a bias b, every example in that feature is shifted by the same b. The batch mean shifts by b too, so subtracting the mean removes it completely. The bias receives zero gradient and does nothing. Drop it and let beta play that role.',
        },
        {
          title: 'Where it sits',
          body: 'BatchNorm is usually placed after a linear layer and before the nonlinearity, so the tanh always sees standardized inputs.',
        },
      ],
      keyTakeaways: [
        'BatchNorm standardizes each feature using the current batch mean and variance.',
        'eps prevents division by zero; gamma and beta restore the freedom to scale and shift.',
        'A bias before BatchNorm is cancelled by mean subtraction, so it can be removed.',
      ],
      quiz: [
        {
          question:
            'A feature has batch values [2, 4, 6]. With eps ignored, gamma = 1, beta = 0, what is the normalized value of 6?',
          options: ['1.0', '0.5', '6.0', '√1.5 ≈ 1.22'],
          answer: 3,
          explanation:
            'Mean is 4 and the population variance is (4 + 0 + 4)/3 = 8/3, so std ≈ 1.633 and (6 - 4)/1.633 ≈ 1.22. Answering 1.0 assumes the std is 2, which is the sample (n-1) std, not the batch variance BatchNorm uses here.',
        },
        {
          question: 'Why can the linear layer before BatchNorm skip its bias?',
          options: [
            'Biases make training unstable',
            'Mean subtraction removes any constant added to every example, so the bias has no effect',
            'Gamma already multiplies the bias by zero',
            'BatchNorm only works with integer inputs',
          ],
          answer: 1,
          explanation:
            'A per-feature bias shifts every example and the batch mean equally, so it cancels. Beta then provides the learnable shift. Gamma scales the normalized value; it does not touch the bias.',
        },
      ],
      challenge: {
        title: 'Write the BatchNorm forward pass',
        instructions:
          'Implement `batchnorm_forward(x, gamma, beta, eps=1e-5)`. `x` is a list of rows (batch of m examples), each a list of n features. For each feature j compute the batch mean and the biased variance (divide by m), then y = gamma[j] * (x - mean) / sqrt(var + eps) + beta[j]. Return a tuple (out, means, variances) where out has the same shape as x and means/variances are lists of length n.',
        starter: String.raw`import math

def batchnorm_forward(x, gamma, beta, eps=1e-5):
    """x: list of m rows, each with n features.
    Return (out, means, variances), using the biased variance (divide by m)."""
    # TODO: per-feature mean and variance over the batch, normalize, scale, shift
    raise NotImplementedError
`,
        solution: String.raw`import math

def batchnorm_forward(x, gamma, beta, eps=1e-5):
    """x: list of m rows, each with n features.
    Return (out, means, variances), using the biased variance (divide by m)."""
    m = len(x)
    n = len(x[0])
    means = [sum(row[j] for row in x) / m for j in range(n)]
    variances = [sum((row[j] - means[j]) ** 2 for row in x) / m for j in range(n)]
    out = []
    for row in x:
        out.append([
            gamma[j] * (row[j] - means[j]) / math.sqrt(variances[j] + eps) + beta[j]
            for j in range(n)
        ])
    return out, means, variances
`,
        tests: String.raw`import math
import random

x = [[2.0, 10.0], [4.0, 10.0], [6.0, 10.0]]
out, means, variances = batchnorm_forward(x, [1.0, 1.0], [0.0, 0.0], eps=0.0 + 1e-12)
assert math.isclose(means[0], 4.0, rel_tol=1e-9) and math.isclose(means[1], 10.0, rel_tol=1e-9), "wrong means"
assert math.isclose(variances[0], 8 / 3, rel_tol=1e-9), "use biased variance (divide by m)"
assert math.isclose(variances[1], 0.0, abs_tol=1e-12), "constant feature has zero variance"
assert math.isclose(out[2][0], 2.0 / math.sqrt(8 / 3), rel_tol=1e-6), "wrong normalized value"
assert all(math.isclose(r[1], 0.0, abs_tol=1e-9) for r in out), "constant feature should normalize to 0 thanks to eps"

# gamma and beta
out2, _, _ = batchnorm_forward(x, [3.0, 1.0], [0.5, -2.0], eps=1e-5)
expected = 3.0 * (2.0 - 4.0) / math.sqrt(8 / 3 + 1e-5) + 0.5
assert math.isclose(out2[0][0], expected, rel_tol=1e-6), "gamma/beta not applied correctly"
assert math.isclose(out2[1][1], -2.0, rel_tol=1e-6), "constant feature should equal beta"

# Normalized output has mean 0 and variance ~1 per feature
random.seed(5)
xb = [[random.gauss(3, 7), random.gauss(-1, 0.2), random.gauss(0, 50)] for _ in range(64)]
ob, _, _ = batchnorm_forward(xb, [1.0] * 3, [0.0] * 3)
for j in range(3):
    col = [r[j] for r in ob]
    mu = sum(col) / len(col)
    var = sum((c - mu) ** 2 for c in col) / len(col)
    assert abs(mu) < 1e-9, "feature %d mean should be 0" % j
    assert abs(var - 1.0) < 1e-3, "feature %d variance should be ~1" % j

# A bias added before BatchNorm has no effect
shifted = [[r[0] + 100.0, r[1] - 7.0, r[2]] for r in xb]
os_, _, _ = batchnorm_forward(shifted, [1.0] * 3, [0.0] * 3)
assert all(math.isclose(a, b, abs_tol=1e-6) for ra, rb in zip(ob, os_) for a, b in zip(ra, rb)), "bias should cancel"
`,
        hint: 'Compute the means list first, then the variances list using those means, then build each output row with a list comprehension over feature indices.',
      },
      lab: 'normalization',
    },
    {
      id: 'batchnorm-running-stats',
      title: 'Running Statistics and Inference Mode',
      minutes: 12,
      summary:
        'At test time there may be only one example, so BatchNorm switches to running averages collected during training. Learn how they are updated and why batches couple examples.',
      sections: [
        {
          title: 'The problem at inference',
          body: 'In training, BatchNorm uses the statistics of the current batch. When you deploy a model you often feed a single example, which has no meaningful batch variance, and you want the same input to always give the same output. So the layer needs fixed statistics that describe the whole training set.',
        },
        {
          title: 'Exponential moving averages',
          body: 'Instead of a separate pass over the data, the layer keeps a running mean and running variance and nudges them toward each new batch statistic. The momentum controls the step: small momentum means slow, smooth averages. Running mean usually starts at 0 and running variance at 1. These buffers are updated, not learned by gradient descent.',
          formula: 'running ← (1 - momentum) · running + momentum · batch_stat',
        },
        {
          title: 'Training mode vs evaluation mode',
          body: 'In training mode the layer normalizes with batch statistics and updates its running buffers. In evaluation mode it normalizes with the running buffers and leaves them unchanged. Forgetting to switch modes is a classic bug: predictions then depend on whatever else is in the batch, or the buffers drift during evaluation.',
        },
        {
          title: 'The batch coupling side effect',
          body: "During training, each example's output depends on its batchmates through the shared mean and variance. This adds a little noise that can act as regularization, but it also makes BatchNorm awkward for tiny batches, and motivates alternatives like LayerNorm that normalize within one example.",
        },
      ],
      keyTakeaways: [
        'Running mean and variance are exponential moving averages updated during training.',
        'Evaluation mode normalizes with the running statistics and does not update them.',
        'In training mode, each example is coupled to its batchmates through the shared statistics.',
      ],
      quiz: [
        {
          question:
            'Running mean is 0.0, momentum is 0.1, and the batch mean is 5.0. What is the new running mean?',
          options: ['5.0', '4.5', '0.5', '0.0'],
          answer: 2,
          explanation:
            'new = 0.9 · 0.0 + 0.1 · 5.0 = 0.5. Answering 4.5 swaps the roles of momentum and 1 - momentum.',
        },
        {
          question: 'In evaluation mode, which statistics does BatchNorm use?',
          options: [
            'The stored running mean and variance, without updating them',
            'The statistics of the current batch',
            'Mean 0 and variance 1, always',
            'The statistics of the very first training batch',
          ],
          answer: 0,
          explanation:
            'Evaluation uses the accumulated running buffers so outputs are deterministic and independent of batchmates. Using current batch statistics is training-mode behavior.',
        },
      ],
      challenge: {
        title: 'A BatchNorm layer with two modes',
        instructions:
          'Complete the `forward(self, x)` method of class `BatchNorm1d`. `x` is a list of rows with `num_features` values each. If `self.training` is True: compute the per-feature batch mean and biased variance (divide by batch size), normalize with them, and update `self.running_mean` and `self.running_var` with running = (1 - momentum) * running + momentum * batch_stat. If False: normalize with the running statistics and do not change them. Output = gamma * x_hat + beta. Return a list of rows.',
        starter: String.raw`import math

class BatchNorm1d:
    def __init__(self, num_features, momentum=0.1, eps=1e-5):
        self.n = num_features
        self.momentum = momentum
        self.eps = eps
        self.gamma = [1.0] * num_features
        self.beta = [0.0] * num_features
        self.running_mean = [0.0] * num_features
        self.running_var = [1.0] * num_features
        self.training = True

    def forward(self, x):
        """Normalize x (list of rows). Use batch stats + update buffers in
        training mode; use running stats (no update) in eval mode."""
        # TODO
        raise NotImplementedError
`,
        solution: String.raw`import math

class BatchNorm1d:
    def __init__(self, num_features, momentum=0.1, eps=1e-5):
        self.n = num_features
        self.momentum = momentum
        self.eps = eps
        self.gamma = [1.0] * num_features
        self.beta = [0.0] * num_features
        self.running_mean = [0.0] * num_features
        self.running_var = [1.0] * num_features
        self.training = True

    def forward(self, x):
        """Normalize x (list of rows). Use batch stats + update buffers in
        training mode; use running stats (no update) in eval mode."""
        if self.training:
            m = len(x)
            mean = [sum(row[j] for row in x) / m for j in range(self.n)]
            var = [sum((row[j] - mean[j]) ** 2 for row in x) / m for j in range(self.n)]
            k = self.momentum
            self.running_mean = [(1 - k) * r + k * b for r, b in zip(self.running_mean, mean)]
            self.running_var = [(1 - k) * r + k * b for r, b in zip(self.running_var, var)]
        else:
            mean = self.running_mean
            var = self.running_var
        out = []
        for row in x:
            out.append([
                self.gamma[j] * (row[j] - mean[j]) / math.sqrt(var[j] + self.eps) + self.beta[j]
                for j in range(self.n)
            ])
        return out
`,
        tests: String.raw`import math
import random

bn = BatchNorm1d(2, momentum=0.1, eps=1e-5)
x = [[2.0, 1.0], [4.0, 1.0], [6.0, 1.0]]
out = bn.forward(x)
assert math.isclose(out[2][0], 2.0 / math.sqrt(8 / 3 + 1e-5), rel_tol=1e-6), "training mode should use batch stats"
assert math.isclose(bn.running_mean[0], 0.4, rel_tol=1e-9), "running mean: 0.9*0 + 0.1*4"
assert math.isclose(bn.running_mean[1], 0.1, rel_tol=1e-9), "running mean: 0.9*0 + 0.1*1"
assert math.isclose(bn.running_var[0], 0.9 + 0.1 * 8 / 3, rel_tol=1e-9), "running var: 0.9*1 + 0.1*(8/3)"
assert math.isclose(bn.running_var[1], 0.9, rel_tol=1e-9), "running var: 0.9*1 + 0.1*0"

# Eval mode: uses running stats, does not update them
bn.training = False
rm, rv = list(bn.running_mean), list(bn.running_var)
y = bn.forward([[3.0, 2.0]])
assert math.isclose(y[0][0], (3.0 - rm[0]) / math.sqrt(rv[0] + 1e-5), rel_tol=1e-6), "eval should use running mean/var"
assert bn.running_mean == rm and bn.running_var == rv, "eval must not change running stats"

# Running mean converges toward the data mean
random.seed(0)
bn2 = BatchNorm1d(1, momentum=0.1)
for _ in range(300):
    bn2.forward([[random.gauss(5.0, 2.0)] for _ in range(32)])
assert abs(bn2.running_mean[0] - 5.0) < 0.3, "running mean should approach 5"
assert abs(bn2.running_var[0] - 4.0) < 0.8, "running var should approach 4"

# Batch coupling: in training, example 0's output depends on its batchmates
bn3 = BatchNorm1d(1)
a = bn3.forward([[1.0], [2.0], [3.0]])[0][0]
b = bn3.forward([[1.0], [10.0], [20.0]])[0][0]
assert not math.isclose(a, b, rel_tol=1e-3), "training output should depend on the rest of the batch"
bn3.training = False
c = bn3.forward([[1.0], [2.0], [3.0]])[0][0]
d = bn3.forward([[1.0], [10.0], [20.0]])[0][0]
assert math.isclose(c, d, rel_tol=1e-12), "eval output must not depend on batchmates"

# Non-default gamma and beta, per feature, in both modes
bn5 = BatchNorm1d(2)
bn5.gamma = [2.0, -1.0]
bn5.beta = [0.5, 3.0]
o5 = bn5.forward([[1.0, 10.0], [3.0, 20.0]])
assert math.isclose(o5[0][0], 2.0 * (-1.0 / math.sqrt(1.0 + 1e-5)) + 0.5, rel_tol=1e-6), "training: gamma[0] scales and beta[0] shifts feature 0"
assert math.isclose(o5[1][1], -1.0 * (5.0 / math.sqrt(25.0 + 1e-5)) + 3.0, rel_tol=1e-6), "training: each feature uses its own gamma and beta"
bn5.training = False
e5 = bn5.forward([[1.0, 10.0]])
for j, v in enumerate([1.0, 10.0]):
    want = bn5.gamma[j] * (v - bn5.running_mean[j]) / math.sqrt(bn5.running_var[j] + 1e-5) + bn5.beta[j]
    assert math.isclose(e5[0][j], want, rel_tol=1e-6), "eval mode must still apply gamma and beta"
`,
        hint: 'Pick mean and var from the batch (training) or from the buffers (eval), update buffers only in the training branch, then share one normalization loop.',
      },
      lab: 'normalization',
    },
    {
      id: 'batchnorm-update-ratio',
      title: 'Diagnostics: Update-to-Data Ratio',
      minutes: 11,
      summary:
        'Compare how big each parameter update is to the parameter itself. This ratio is a fast, reliable guide to whether the learning rate is too small, too big, or about right.',
      sections: [
        {
          title: 'Gradient-to-data ratio',
          body: "A raw gradient value means little alone. What matters is its size relative to the parameter it changes. The grad-to-data ratio compares the standard deviation of a weight's gradient to the standard deviation of the weight. If one layer has a much larger ratio than the others, it will be trained much faster at the start. A classic case is the output layer right after we deliberately shrink it (for example W *= 0.1 to make the first predictions less confident): its weights now have a tiny std, so the same-sized gradient looks large next to them and its ratio stands out. That is usually harmless and settles after some steps, but it is worth recognising rather than mistaking for a bug. Note the direction: shrinking the weights raises this ratio, because the denominator got smaller.",
          formula: 'grad:data = std(grad) / std(W)',
        },
        {
          title: 'Update-to-data ratio',
          body: 'The update actually applied by plain gradient descent is lr · grad, so the more useful number includes the learning rate. Plot its log10 for every layer over training steps. A widely used rule of thumb is that the ratio should hover around 1e-3, which means each step changes parameters by about a thousandth of their size.',
          formula: 'update:data = std(lr · grad) / std(W),   target log10 ≈ -3',
        },
        {
          title: 'Using it to tune the learning rate',
          body: 'If the log10 ratio sits around -5, updates are tiny and learning is slow, so raise the learning rate. If it is near -1, parameters are being rewritten each step and training is unstable, so lower it. Because the ratio is proportional to lr, you can directly compute the learning rate that would hit a chosen target.',
        },
      ],
      keyTakeaways: [
        'Grad-to-data ratio shows whether some layers receive disproportionately large gradients.',
        'Update-to-data ratio std(lr·grad)/std(W) should be roughly 1e-3, i.e. log10 ≈ -3.',
        'Because the ratio scales linearly with lr, it tells you how much to raise or lower the learning rate.',
      ],
      quiz: [
        {
          question:
            'A layer shows log10(update:data) ≈ -5 throughout training. What should you try?',
          options: [
            'Lower the learning rate by 100x',
            'Raise the learning rate, since updates are about 100x smaller than the typical target',
            'Remove BatchNorm from the network',
            'Nothing; smaller is always safer',
          ],
          answer: 1,
          explanation:
            'A ratio of 1e-5 is two orders of magnitude below the rough 1e-3 target, so parameters barely move. Lowering the rate would make it even slower.',
        },
        {
          question: 'std(W) = 0.5, std(grad) = 0.01, lr = 0.1. What is the update-to-data ratio?',
          options: ['0.02', '0.05', '0.001', '0.002'],
          answer: 3,
          explanation:
            'std(lr · grad) = 0.1 · 0.01 = 0.001, and 0.001 / 0.5 = 0.002 (log10 ≈ -2.7). The answer 0.02 is the grad-to-data ratio, which ignores the learning rate.',
        },
      ],
      challenge: {
        title: 'Tune the learning rate from ratios',
        instructions:
          'Use population standard deviation (divide by N) throughout; a helper `std(values)` is provided. Implement `grad_data_ratio(param, grad)` returning std(grad) / std(param), `update_ratio_log10(param, grad, lr)` returning log10(std of lr*g for g in grad, divided by std(param)), and `suggest_lr(param, grad, target_log10=-3.0)` returning the learning rate that makes update_ratio_log10 equal target_log10. `param` and `grad` are flat lists of floats of equal length.',
        starter: String.raw`import math

def std(values):
    n = len(values)
    mu = sum(values) / n
    return math.sqrt(sum((v - mu) ** 2 for v in values) / n)

def grad_data_ratio(param, grad):
    """Return std(grad) / std(param)."""
    # TODO
    raise NotImplementedError

def update_ratio_log10(param, grad, lr):
    """Return log10( std([lr * g for g in grad]) / std(param) )."""
    # TODO
    raise NotImplementedError

def suggest_lr(param, grad, target_log10=-3.0):
    """Return lr such that update_ratio_log10(param, grad, lr) == target_log10."""
    # TODO
    raise NotImplementedError
`,
        solution: String.raw`import math

def std(values):
    n = len(values)
    mu = sum(values) / n
    return math.sqrt(sum((v - mu) ** 2 for v in values) / n)

def grad_data_ratio(param, grad):
    """Return std(grad) / std(param)."""
    return std(grad) / std(param)

def update_ratio_log10(param, grad, lr):
    """Return log10( std([lr * g for g in grad]) / std(param) )."""
    return math.log10(std([lr * g for g in grad]) / std(param))

def suggest_lr(param, grad, target_log10=-3.0):
    """Return lr such that update_ratio_log10(param, grad, lr) == target_log10."""
    return (10 ** target_log10) * std(param) / std(grad)
`,
        tests: String.raw`import math
import random

p = [1.0, -1.0, 1.0, -1.0]
g = [0.02, -0.02, 0.02, -0.02]
assert math.isclose(grad_data_ratio(p, g), 0.02, rel_tol=1e-9), "std(g)=0.02, std(p)=1"
assert math.isclose(update_ratio_log10(p, g, 0.05), -3.0, rel_tol=1e-9), "0.05*0.02/1 = 1e-3 -> -3"
assert math.isclose(update_ratio_log10(p, g, 0.5), -2.0, rel_tol=1e-9), "10x lr -> ratio up by one decade"
assert math.isclose(suggest_lr(p, g), 0.05, rel_tol=1e-9), "lr hitting 1e-3 should be 0.05"
assert math.isclose(suggest_lr(p, g, -2.0), 0.5, rel_tol=1e-9), "lr hitting 1e-2 should be 0.5"

# Ratios ignore the mean (std only)
p2 = [v + 3.0 for v in p]
assert math.isclose(grad_data_ratio(p2, g), 0.02, rel_tol=1e-9), "shifting params should not change std"

# Random layer: suggested lr really hits the target, and the relationship is linear in lr
random.seed(7)
W = [random.gauss(0, 0.2) for _ in range(500)]
G = [random.gauss(0, 0.004) for _ in range(500)]
for target in (-3.0, -2.5, -4.0):
    lr = suggest_lr(W, G, target)
    assert math.isclose(update_ratio_log10(W, G, lr), target, rel_tol=1e-9), "suggested lr must hit target"
r1 = update_ratio_log10(W, G, 0.01)
r2 = update_ratio_log10(W, G, 0.1)
assert math.isclose(r2 - r1, 1.0, rel_tol=1e-9), "10x learning rate should add exactly 1 to log10 ratio"
expected = math.log10(0.01 * std(G) / std(W))
assert math.isclose(r1, expected, rel_tol=1e-9), "wrong update ratio"
`,
        hint: 'Every function is a one-liner built from std(). For suggest_lr, solve lr · std(grad) / std(param) = 10 ** target_log10 for lr.',
      },
      lab: 'normalization',
    },
  ],
};
