"""
micrograd.py - a tiny scalar autograd engine and neural net, in pure Python.

Chapter 1 of the Zero to Hero course project pack.

What it shows
  * Value: one number that remembers how it was made (+, *, **, tanh).
  * backward(): sort the graph in topological order, then walk it in
    reverse and apply the chain rule at every node.
  * Gradients ACCUMULATE (+=), so a value used twice gets both shares.
  * Neuron -> Layer -> MLP built only from Value objects.
  * A finite-difference check that our gradients are right.
  * Training the MLP on a tiny 2D binary dataset with plain gradient descent.

Usage
  python micrograd.py                  # defaults: 100 steps, lr 0.05
  python micrograd.py --steps 300 --lr 0.1 --seed 7

No third-party packages. The data is tiny on purpose: it demonstrates the
mechanics of backprop, not model quality.
"""

import argparse
import math
import random


class Value:
    """A scalar plus the gradient of the final output with respect to it."""

    def __init__(self, data, _children=(), _op=""):
        self.data = float(data)
        self.grad = 0.0
        # _backward pushes this node's grad into its children (set by each op).
        self._backward = lambda: None
        self._prev = set(_children)
        self._op = _op

    # ---- core operations -------------------------------------------------
    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), "+")

        def _backward():
            # d(a+b)/da = 1 and d(a+b)/db = 1. Use += so reuse accumulates.
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), "*")

        def _backward():
            # d(a*b)/da = b and d(a*b)/db = a.
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __pow__(self, exponent):
        assert isinstance(exponent, (int, float)), "only constant exponents"
        out = Value(self.data ** exponent, (self,), "**%g" % exponent)

        def _backward():
            # d(a**n)/da = n * a**(n-1)
            self.grad += exponent * (self.data ** (exponent - 1)) * out.grad

        out._backward = _backward
        return out

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), "tanh")

        def _backward():
            # d tanh(x)/dx = 1 - tanh(x)**2, and we already have t.
            self.grad += (1 - t * t) * out.grad

        out._backward = _backward
        return out

    # ---- everything else is built from the ops above ---------------------
    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __truediv__(self, other):
        return self * other ** -1

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def __rsub__(self, other):
        return (-self) + other

    def __rtruediv__(self, other):
        return Value(other) * self ** -1

    # ---- reverse-mode autodiff -------------------------------------------
    def backward(self):
        # 1) Topological order: every node appears after all of its inputs.
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        # 2) Seed: d(self)/d(self) = 1. Then apply the chain rule from the
        #    output back to the leaves.
        self.grad = 1.0
        for node in reversed(topo):
            node._backward()

    def __repr__(self):
        return "Value(data=%.4f, grad=%.4f)" % (self.data, self.grad)


# ---- a tiny neural network library on top of Value -----------------------
class Neuron:
    def __init__(self, n_inputs, rng, nonlin=True):
        self.w = [Value(rng.uniform(-1, 1)) for _ in range(n_inputs)]
        self.b = Value(0.0)
        self.nonlin = nonlin

    def __call__(self, x):
        # w . x + b, then squash with tanh (unless this is a linear output).
        act = sum((wi * xi for wi, xi in zip(self.w, x)), self.b)
        return act.tanh() if self.nonlin else act

    def parameters(self):
        return self.w + [self.b]


class Layer:
    def __init__(self, n_inputs, n_outputs, rng, nonlin=True):
        self.neurons = [Neuron(n_inputs, rng, nonlin) for _ in range(n_outputs)]

    def __call__(self, x):
        out = [n(x) for n in self.neurons]
        return out[0] if len(out) == 1 else out

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]


class MLP:
    def __init__(self, n_inputs, layer_sizes, rng):
        sizes = [n_inputs] + layer_sizes
        # Every layer uses tanh, so the single output lives in (-1, 1),
        # which matches our +1 / -1 labels.
        self.layers = [Layer(sizes[i], sizes[i + 1], rng) for i in range(len(layer_sizes))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]

    def zero_grad(self):
        for p in self.parameters():
            p.grad = 0.0


# ---- small demos ---------------------------------------------------------
def demo_accumulation():
    a = Value(3.0)
    b = a + a  # a is used twice, so db/da should be 2, not 1
    b.backward()
    print("accumulation: b = a + a, a.grad = %.1f (expected 2.0)" % a.grad)
    assert a.grad == 2.0


def demo_gradient_check():
    """Compare backprop gradients with a numerical finite-difference slope."""

    def f(x, y):
        return ((x * y + x ** 2) / (y - 0.5)).tanh() * 3 - x

    x, y = Value(0.7), Value(-1.3)
    out = f(x, y)
    out.backward()
    h = 1e-6
    num_dx = (f(Value(0.7 + h), Value(-1.3)).data - f(Value(0.7 - h), Value(-1.3)).data) / (2 * h)
    num_dy = (f(Value(0.7), Value(-1.3 + h)).data - f(Value(0.7), Value(-1.3 - h)).data) / (2 * h)
    print("gradient check: dx backprop %.6f vs numeric %.6f" % (x.grad, num_dx))
    print("                dy backprop %.6f vs numeric %.6f" % (y.grad, num_dy))
    assert abs(x.grad - num_dx) < 1e-5 and abs(y.grad - num_dy) < 1e-5


# Tiny binary dataset: label is +1 when x0 and x1 share a sign (XOR-like),
# so a straight line cannot separate it and the hidden layer has to work.
DATA = [
    ([0.9, 0.8], 1.0), ([-0.7, -0.9], 1.0), ([0.4, 0.6], 1.0), ([-0.5, -0.3], 1.0),
    ([0.8, -0.7], -1.0), ([-0.6, 0.9], -1.0), ([0.3, -0.5], -1.0), ([-0.9, 0.4], -1.0),
]


def train(steps, lr, seed):
    rng = random.Random(seed)
    model = MLP(2, [8, 8, 1], rng)
    print("model: 2 -> 8 -> 8 -> 1, %d parameters" % len(model.parameters()))

    for step in range(1, steps + 1):
        # forward: mean squared error over the whole (tiny) dataset
        preds = [model(x) for x, _ in DATA]
        loss = sum((p - y) ** 2 for p, (_, y) in zip(preds, DATA)) / len(DATA)
        # backward: clear old grads first, because backward() accumulates
        model.zero_grad()
        loss.backward()
        # update: step every parameter downhill
        for p in model.parameters():
            p.data -= lr * p.grad
        if step == 1 or step % max(1, steps // 10) == 0 or step == steps:
            acc = sum((p.data > 0) == (y > 0) for p, (_, y) in zip(preds, DATA)) / len(DATA)
            print("step %4d | loss %.4f | accuracy %.0f%%" % (step, loss.data, acc * 100))

    print("\nfinal predictions (target -> output):")
    for x, y in DATA:
        print("  x=(%+.1f, %+.1f)  %+.0f -> %+.3f" % (x[0], x[1], y, model(x).data))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--steps", type=int, default=100, help="training steps (default 100)")
    parser.add_argument("--lr", type=float, default=0.05, help="learning rate (default 0.05)")
    parser.add_argument("--seed", type=int, default=42, help="random seed (default 42)")
    args = parser.parse_args()

    demo_accumulation()
    demo_gradient_check()
    print()
    train(args.steps, args.lr, args.seed)


if __name__ == "__main__":
    main()
