export const glossary = [
  [
    'Activation',
    'A neuron’s output after a nonlinear function such as tanh or ReLU. Nonlinearity lets a network represent more than one linear transformation.',
  ],
  [
    'Autoregressive model',
    'A model that predicts the next token using only earlier tokens. Generation repeatedly appends a sampled token to the context.',
  ],
  [
    'Backpropagation',
    'An efficient application of the chain rule. Visit a computation graph in reverse order and accumulate each node’s contribution to the loss gradient.',
  ],
  [
    'Batch normalization',
    'Normalize a layer’s features using minibatch statistics, then learn a scale γ and shift β. Inference typically uses running averages instead.',
  ],
  [
    'Bigram',
    'A pair of consecutive tokens. A bigram model predicts the next token from only the current token.',
  ],
  [
    'Broadcasting',
    'Rules that align tensor dimensions for arithmetic. Starting from the right, dimensions must be equal or one must be 1.',
  ],
  [
    'Byte pair encoding (BPE)',
    'A tokenizer training algorithm that repeatedly merges a frequent adjacent pair. Encoding applies learned merges in their training rank order.',
  ],
  [
    'Causal mask',
    'A mask that prevents a token from attending to future positions. Without it, a next-token model could cheat during training.',
  ],
  [
    'Chain rule',
    'The derivative of a composition multiplies local derivatives: dL/dx = (dL/dy)(dy/dx). Contributions from separate paths add.',
  ],
  [
    'Context window',
    'The sequence of previous tokens a model can use to predict the next one. A longer window costs memory and computation.',
  ],
  [
    'Cross entropy',
    'For a one-hot target class y, the negative log of its predicted probability: −log p(y). Lower is better; zero corresponds to certainty on the correct class.',
  ],
  [
    'Dilated convolution',
    'A convolution that spaces its input taps apart. Increasing the dilation grows the receptive field without increasing the number of filter parameters.',
  ],
  [
    'Embedding',
    'A learned lookup table that maps a discrete token ID to a dense vector. It is trained with the rest of the network.',
  ],
  [
    'Epoch',
    'One complete pass through the training dataset. An optimizer step usually uses just one minibatch, not an entire epoch.',
  ],
  [
    'Feed-forward network',
    'In a Transformer block, a small neural network applied independently at each position, usually expanding then projecting the feature dimension.',
  ],
  [
    'Gradient',
    'The vector of partial derivatives of the loss with respect to parameters. It points toward the steepest local increase in loss.',
  ],
  [
    'Gradient descent',
    'Update parameters opposite the gradient: θ ← θ − η∇L. The learning rate η controls the step size.',
  ],
  [
    'Hyperparameter',
    'A setting chosen outside gradient optimization, such as learning rate, hidden width, context length, or regularization strength.',
  ],
  [
    'Kaiming initialization',
    'An initialization scheme that scales weights with fan-in to help preserve activation variance. The nonlinearity determines the appropriate gain.',
  ],
  [
    'Layer normalization',
    'Normalize across the feature dimension of each example, without mixing examples in a batch. Often used before attention and feed-forward layers.',
  ],
  [
    'Learning rate',
    'The multiplier on a gradient update. Too large can make training diverge; too small can make progress impractically slow.',
  ],
  [
    'Logit',
    'An unnormalized class score. Softmax transforms a vector of logits into positive probabilities that sum to one.',
  ],
  [
    'Loss',
    'A number measuring how badly predictions disagree with training targets. The optimizer changes parameters to reduce it.',
  ],
  [
    'Minibatch',
    'A subset of training examples used to estimate a gradient efficiently. Batch size influences memory use and gradient noise.',
  ],
  [
    'Negative log likelihood',
    'The negative logarithm of the probability a model assigns to observed data. For categorical next-token prediction it equals cross entropy.',
  ],
  [
    'Overfitting',
    'Learning training-specific patterns that do not generalize. Training loss improves while validation performance gets worse.',
  ],
  [
    'Parameter',
    'A learned value, such as a weight, bias, or embedding entry, updated by the optimizer.',
  ],
  [
    'Perplexity',
    'The exponential of average negative log likelihood, when the loss uses natural logarithms. Compare only when tokenization and evaluation data match.',
  ],
  [
    'Receptive field',
    'The set of input positions that can affect one output. Hierarchical or dilated architectures can expand it efficiently.',
  ],
  [
    'Residual connection',
    'An identity path around a transformation: x + f(x). It helps information and gradients flow through deep networks.',
  ],
  [
    'Self-attention',
    'A content-dependent weighted combination of value vectors, using similarities between queries and keys to choose weights.',
  ],
  [
    'Softmax',
    'Convert scores s to probabilities exp(sᵢ)/Σexp(sⱼ). Subtracting the maximum score first gives the same result with better numerical stability.',
  ],
  [
    'Temperature',
    'A positive divisor on logits before softmax. Lower temperature sharpens the distribution; higher temperature makes sampling more varied.',
  ],
  [
    'Tensor',
    'A multidimensional array with a shape, data type, and device. Keeping track of its dimensions is essential to building neural networks.',
  ],
  [
    'Token',
    'An integer-indexed unit of text for a language model. Depending on the tokenizer, it may represent a byte, character, word fragment, or special marker.',
  ],
  [
    'Train / validation / test',
    'Training data fits parameters, validation data guides model choices, and held-out test data estimates final performance. Do not repeatedly tune on the test set.',
  ],
  [
    'Transformer',
    'A sequence model built from attention and feed-forward blocks, with normalization and residual connections. A GPT-style model uses causal attention.',
  ],
  [
    'UTF-8',
    'A reversible encoding of Unicode text into bytes. Each character occupies one to four bytes, so character count and byte count can differ.',
  ],
] as const;
