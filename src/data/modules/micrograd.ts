import type { CourseModule } from '../../types';

export const microgradModule: CourseModule = {
  id: 'micrograd',
  number: 1,
  title: 'Micrograd',
  subtitle: 'Build a tiny autograd engine and train a neural net with it, one scalar at a time.',
  description:
    "An original, hands-on companion to Andrej Karpathy's lecture on building micrograd. You go from the idea of a derivative to a working scalar autograd engine and a small neural network trained by gradient descent, all in pure Python. Watch the video for the full build, and use these lessons to check your understanding and practise each piece.",
  duration: '2h25m',
  videoId: 'VMj-3S1tku0',
  sourceTitle: 'The spelled-out intro to neural networks and backpropagation: building micrograd',
  topics: [
    'Derivatives & the chain rule',
    'Expression graphs',
    'Reverse-mode autodiff',
    'Training an MLP',
  ],
  project:
    'A tiny pure-Python autograd engine (a Value class with backward()) plus Neuron, Layer and MLP classes and a training loop that fits a small dataset.',
  lessons: [
    // ------------------------------------------------------------------ 1
    {
      id: 'micrograd-derivatives',
      title: 'Derivatives and the Chain Rule',
      minutes: 10,
      summary:
        'A derivative measures how much an output moves when you nudge an input. You will estimate slopes numerically and combine them with the chain rule.',
      sections: [
        {
          title: 'What a derivative tells you',
          body: 'A derivative answers one question: if I nudge the input a tiny bit, how much does the output move, and in which direction? For f(x) = x², a small step h at x = 3 raises the output by about 6h, so the slope there is 6. Neural networks care because every weight is an input to the loss, and its derivative says whether increasing that weight makes the loss go up or down, and how strongly.',
          formula: "f'(x) = lim(h→0) [f(x + h) − f(x)] / h",
        },
        {
          title: 'Estimating slopes numerically',
          body: 'You can approximate a derivative without calculus by evaluating the function twice. The forward difference compares f(x + h) with f(x). The central difference looks both ways, using f(x + h) and f(x − h); its error shrinks like h² instead of h, so it is far more accurate for the same step. Too large an h lets curvature distort the estimate; too small an h lets floating-point rounding dominate.',
          formula: "f'(x) ≈ [f(x + h) − f(x − h)] / (2h)",
        },
        {
          title: 'The chain rule',
          body: 'Real models are long chains of simple functions. If y = f(g(x)), a nudge in x first changes g, and that change is then scaled by how sensitive f is to its input. The overall rate is the product of the two local rates. This is the idea that makes backpropagation possible: each operation only needs its own local derivative, and multiplying local pieces along a path gives the derivative of the whole expression.',
          formula: "d/dx f(g(x)) = f'(g(x)) · g'(x)",
        },
        {
          title: 'Numerical checks as a safety net',
          body: 'Finite differences are too slow for training, since they need extra function evaluations for every parameter, but they are perfect for testing. Whenever you derive a gradient by hand or in code, compare it with a central-difference estimate. Agreement to several decimal places is strong evidence your code is right.',
        },
      ],
      keyTakeaways: [
        'A derivative is the local rate of change: output change divided by a tiny input change.',
        'The central difference [f(x+h) − f(x−h)] / 2h is a cheap, accurate way to check gradients.',
        'The chain rule multiplies local derivatives along a path; it is the core of backpropagation.',
      ],
      quiz: [
        {
          question:
            'Why is the central difference usually more accurate than the forward difference for the same step h?',
          options: [
            'It secretly uses a smaller step size',
            'Its error shrinks in proportion to h² rather than h',
            'It avoids floating-point arithmetic entirely',
            'It gives the exact derivative for every function',
          ],
          answer: 1,
          explanation:
            'Looking both ways cancels the first-order curvature error, leaving an error that scales with h². It still uses floating point and is only exact for special cases such as quadratics, so it is not exact in general.',
        },
        {
          question: "If y = f(g(x)) with g'(2) = 3 and f'(g(2)) = 5, what is dy/dx at x = 2?",
          options: ['15', '8', '3', '5'],
          answer: 0,
          explanation:
            'The chain rule multiplies the local rates: 5 · 3 = 15. Adding them (8) is a common slip, but rates of change compose by multiplication, not addition.',
        },
      ],
      challenge: {
        title: 'Numerical slopes and the chain rule',
        instructions:
          "Implement two functions. `derivative(f, x, h=1e-5)` returns the central-difference estimate (f(x + h) − f(x − h)) / (2h) of f'(x). `chain_derivative(f_prime, g, g_prime, x)` returns the derivative of f(g(x)) at x using the chain rule, given the derivative functions f_prime and g_prime and the inner function g. Both return floats.",
        starter: String.raw`import math


def derivative(f, x, h=1e-5):
    """Estimate f'(x) with the central difference (f(x + h) - f(x - h)) / (2h)."""
    # TODO: evaluate f on both sides of x and return the slope estimate
    raise NotImplementedError


def chain_derivative(f_prime, g, g_prime, x):
    """Return the derivative of f(g(x)) at x.

    f_prime and g_prime are the known derivative functions of f and g.
    """
    # TODO: apply the chain rule
    raise NotImplementedError
`,
        solution: String.raw`import math


def derivative(f, x, h=1e-5):
    """Estimate f'(x) with the central difference (f(x + h) - f(x - h)) / (2h)."""
    return (f(x + h) - f(x - h)) / (2 * h)


def chain_derivative(f_prime, g, g_prime, x):
    """Return the derivative of f(g(x)) at x.

    f_prime and g_prime are the known derivative functions of f and g.
    """
    return f_prime(g(x)) * g_prime(x)
`,
        tests: String.raw`import math

assert math.isclose(derivative(lambda x: x ** 3, 2.0), 12.0, rel_tol=1e-6), "d/dx x^3 at 2 should be 12"
assert math.isclose(derivative(lambda x: 3 * x + 7, -4.0), 3.0, rel_tol=1e-6), "the slope of a line is constant"
assert math.isclose(derivative(math.sin, 0.5), math.cos(0.5), rel_tol=1e-6), "d/dx sin(x) = cos(x)"
assert abs(derivative(lambda x: x * x, 0.0)) < 1e-9, "slope of x^2 at 0 is 0"
assert math.isclose(derivative(lambda x: x * x, 1.0, h=0.1), 2.0, rel_tol=1e-9), "central difference is exact for quadratics, even with a big h"
# For x^3 the central difference equals 3x^2 + h^2, so a big h exposes whether h is really used.
assert math.isclose(derivative(lambda x: x ** 3, 2.0, h=0.5), 12.25, rel_tol=1e-9), "with h=0.5 the central difference of x^3 at 2 is 12 + 0.25 = 12.25 (forward difference would give 15.25)"
assert math.isclose(derivative(lambda x: x ** 3, 2.0, h=1.0), 13.0, rel_tol=1e-9), "with h=1 the central difference of x^3 at 2 is (27 - 1) / 2 = 13"

got = chain_derivative(math.cos, lambda x: x * x, lambda x: 2 * x, 1.3)
assert math.isclose(got, math.cos(1.3 * 1.3) * 2.6, rel_tol=1e-9), "d/dx sin(x^2) = cos(x^2) * 2x"
assert math.isclose(got, derivative(lambda x: math.sin(x * x), 1.3), rel_tol=1e-6), "chain rule should agree with finite differences"
got2 = chain_derivative(lambda u: 2 * u, lambda x: 3 * x + 1, lambda x: 3.0, 2.0)
assert math.isclose(got2, 42.0, rel_tol=1e-9), "d/dx (3x+1)^2 at 2 = 2*7*3 = 42"
`,
        hint: 'derivative needs exactly two calls to f. For the chain rule, evaluate the outer derivative at g(x), not at x, then multiply.',
      },
      lab: 'gradient',
    },
    // ------------------------------------------------------------------ 2
    {
      id: 'micrograd-value-graph',
      title: 'A Value That Remembers Its History',
      minutes: 12,
      summary:
        'Wrap each number in a Value object that records which Values produced it and how. Operator overloading turns ordinary arithmetic into a graph.',
      sections: [
        {
          title: 'Wrapping a number',
          body: 'To differentiate an expression automatically, we first need a record of how it was built. The trick is to wrap each scalar in a small Value object that stores its number (data), a slot for its gradient (grad, starting at 0), the Values it was computed from (its children), and the name of the operation that produced it. A Value created directly from a literal has no children and an empty op: it is a leaf.',
        },
        {
          title: 'Operator overloading',
          body: 'Python lets a class define what + and * mean through special methods such as __add__ and __mul__. Inside them we compute the new number as usual, but return a fresh Value that points back to both operands. Writing c = a * b + 1 then quietly builds a graph: a multiply node with children a and b feeding an add node. Plain numbers like 1 are wrapped into constant Values so every node has the same shape.',
          formula: "c = a * b  →  c.data = a.data · b.data,  c._prev = (a, b),  c._op = '*'",
        },
        {
          title: 'Reflected and derived operations',
          body: 'An expression like 2 * a first asks int to do the multiplication, which it cannot, so Python retries with a.__rmul__(2). Defining __radd__ and __rmul__ in terms of __add__ and __mul__ makes constants work on either side. Negation and subtraction need no new machinery: −a is a * −1, and a − b is a + (−b). Fewer primitive operations means fewer local derivatives to get right later.',
        },
        {
          title: 'Why the graph matters',
          body: 'The result is a directed acyclic graph whose leaves are inputs and parameters and whose root is the final output. Every edge records a dependency. Next we will walk this graph backwards, from root to leaves, to compute every gradient in one pass.',
        },
      ],
      keyTakeaways: [
        'A Value stores data, grad, its children (_prev) and the operation (_op) that created it.',
        'Overloaded operators build the expression graph as a side effect of normal arithmetic.',
        'Reflected methods and rewriting − in terms of + and * keep the set of primitive ops small.',
      ],
      quiz: [
        {
          question: 'Why does 3 * v (where v is a Value) need a __rmul__ method?',
          options: [
            'Because Value objects cannot be multiplied at all otherwise',
            'Because multiplication of Values is not commutative',
            "Because int's multiplication does not understand Value, so Python falls back to v.__rmul__(3)",
            'Because __rmul__ is where the gradient gets computed',
          ],
          answer: 2,
          explanation:
            'Python evaluates the left operand first: int.__mul__(3, v) returns NotImplemented, and only then is v.__rmul__(3) tried. Without it you get a TypeError, even though v * 3 works fine.',
        },
        {
          question: 'What does a leaf created as Value(4.0) store for its children and op?',
          options: [
            "A reference to itself as its only child, with op '='",
            'The number 4.0 as its child',
            'None for both, filled in later by backward()',
            'An empty tuple of children and an empty op string',
          ],
          answer: 3,
          explanation:
            'Leaves were not computed from anything, so there are no children and no operation. Pointing a node at itself would create a cycle, which breaks the acyclic graph that backprop relies on.',
        },
      ],
      challenge: {
        title: 'Build the expression graph',
        instructions:
          "Complete the `Value` class. `__add__` and `__mul__` must wrap plain numbers in a Value, then return a new Value whose `data` is the sum/product, whose `_prev` is the tuple `(self, other)` in that order, and whose `_op` is '+' or '*'. Implement `__radd__` and `__rmul__` so numbers work on the left, `__neg__` as multiplication by -1, and `__sub__` as `self + (-other)`. Do not change `grad`.",
        starter: String.raw`class Value:
    """A scalar that remembers how it was computed."""

    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)  # the Values this one was built from
        self._op = _op                 # the operation that produced it ('' for leaves)

    def __repr__(self):
        return "Value(data=%g)" % self.data

    def __add__(self, other):
        # TODO: wrap plain numbers in Value, then return a new Value with
        # data = self.data + other.data, children (self, other) and op '+'
        raise NotImplementedError

    def __mul__(self, other):
        # TODO: like __add__, but multiply and use op '*'
        raise NotImplementedError

    def __radd__(self, other):
        # TODO: handle  number + Value
        raise NotImplementedError

    def __rmul__(self, other):
        # TODO: handle  number * Value
        raise NotImplementedError

    def __neg__(self):
        # TODO: express -self using multiplication by -1
        raise NotImplementedError

    def __sub__(self, other):
        # TODO: express self - other using addition and negation
        raise NotImplementedError
`,
        solution: String.raw`class Value:
    """A scalar that remembers how it was computed."""

    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)  # the Values this one was built from
        self._op = _op                 # the operation that produced it ('' for leaves)

    def __repr__(self):
        return "Value(data=%g)" % self.data

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data + other.data, (self, other), '+')

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data, (self, other), '*')

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)
`,
        tests: String.raw`import math

a = Value(2.0)
b = Value(-3.0)
assert a._prev == () and a._op == '', "leaves have no children and no op"

c = a * b
assert isinstance(c, Value) and math.isclose(c.data, -6.0), "2 * -3 should be -6"
assert c._op == '*', "a multiplication node should have op '*'"
assert len(c._prev) == 2 and c._prev[0] is a and c._prev[1] is b, "children must be (a, b) in that order"

d = c + a
assert math.isclose(d.data, -4.0) and d._op == '+', "-6 + 2 should be -4 with op '+'"
assert d._prev[0] is c and d._prev[1] is a, "the add node's children should be (c, a)"

e = a + 10
assert math.isclose(e.data, 12.0) and isinstance(e._prev[1], Value), "plain numbers must be wrapped in Value"
assert math.isclose(e._prev[1].data, 10.0) and e._prev[1]._prev == (), "a wrapped constant is a leaf"

f = 3 * a
assert isinstance(f, Value) and math.isclose(f.data, 6.0) and f._op == '*', "3 * a should work via __rmul__"
g = 1.5 + b
assert isinstance(g, Value) and math.isclose(g.data, -1.5) and g._op == '+', "1.5 + b should work via __radd__"

n = -a
assert isinstance(n, Value) and math.isclose(n.data, -2.0) and n._op == '*', "negation is multiplication by -1"
s = a - b
assert isinstance(s, Value) and math.isclose(s.data, 5.0) and s._op == '+', "a - b is a + (-b)"
assert any(child is a for child in s._prev), "the subtraction graph must still connect to a"
assert a.grad == 0.0 and c.grad == 0.0, "building the graph must not touch gradients"
`,
        hint: 'Start each binary method with other = other if isinstance(other, Value) else Value(other). The reflected and derived methods can each be a single line that reuses + and *.',
      },
      lab: 'backprop',
    },
    // ------------------------------------------------------------------ 3
    {
      id: 'micrograd-backprop',
      title: 'Backpropagation Through the Graph',
      minutes: 14,
      summary:
        'Reverse-mode autodiff visits the graph from the output back to the leaves, applying the chain rule at every node. Gradients from reused nodes must add up.',
      sections: [
        {
          title: 'Local derivatives, global gradients',
          body: 'Each node knows how its output depends on its direct inputs. For c = a + b both local derivatives are 1; for c = a · b, ∂c/∂a = b and ∂c/∂b = a. Backpropagation combines these with the chain rule: a child receives the gradient flowing into its parent multiplied by the local derivative. We keep that upstream gradient in out.grad and give every node a small _backward function that pushes it down to its children.',
          formula: 'child.grad += (∂out/∂child) · out.grad',
        },
        {
          title: 'Ordering with a topological sort',
          body: 'A node may only pass gradient to its children after it has received gradient from every node that uses it. A topological sort guarantees this. A depth-first search that appends a node only after all its children are appended produces a list where inputs come before outputs. Reversing that list visits the output first and each node after all of its consumers.',
        },
        {
          title: 'Seeding and running the pass',
          body: 'The derivative of the output with respect to itself is 1, so backward() sets the root grad to 1.0 and then calls _backward on each node in reversed topological order. One sweep fills in the gradient of the output with respect to every Value in the graph, at roughly the cost of the forward pass. That efficiency is what makes reverse mode the right choice for one loss and many parameters.',
        },
        {
          title: 'Accumulate, never overwrite',
          body: 'When a Value feeds into more than one place, as in b = a + a, each use contributes its own share of gradient, and the multivariable chain rule says the shares add. That is why _backward uses += rather than =; assigning would silently keep only the last path.',
        },
      ],
      keyTakeaways: [
        'Each operation supplies only its local derivative; the chain rule stitches them together.',
        'Reversed topological order ensures a node has all its upstream gradient before passing it on.',
        'Gradients accumulate with += because a reused Value receives gradient along every path.',
      ],
      quiz: [
        {
          question: 'For b = a + a with a.data = 5, what should a.grad be after b.backward()?',
          options: ['1', '5', '2', '0'],
          answer: 2,
          explanation:
            'a reaches b along two edges, each with local derivative 1, and the contributions add: 1 + 1 = 2. If _backward used = instead of +=, the second write would overwrite the first and you would wrongly get 1.',
        },
        {
          question: 'Why are nodes processed in reversed topological order during backward()?',
          options: [
            'So each node has received all gradient from its consumers before it propagates to its children',
            'So the leaves are visited first and can be initialised',
            'It is merely faster; any order gives the same result',
            'It lets us skip the chain rule for addition nodes',
          ],
          answer: 0,
          explanation:
            'A node’s grad is only complete once every consumer has contributed. Processing in another order could push a partial gradient to the children, giving wrong results, not just slower ones.',
        },
      ],
      challenge: {
        title: 'Write backward()',
        instructions:
          'The `Value` class already builds the graph. Fill in the two `_backward` closures inside `__add__` and `__mul__` so they push `out.grad` into `self.grad` and `other.grad` using the local derivatives (accumulate with `+=`). Then implement `backward(self)`: build a topological order with a depth-first search and a visited set, set `self.grad = 1.0`, and call `_backward()` on every node in reversed order.',
        starter: String.raw`class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None  # leaves have nothing to propagate

    def __repr__(self):
        return "Value(data=%g, grad=%g)" % (self.data, self.grad)

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            # TODO: the local derivative of a sum is 1 for both inputs.
            # Push out.grad into self.grad and other.grad (use +=).
            raise NotImplementedError

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            # TODO: d(out)/d(self) = other.data and d(out)/d(other) = self.data.
            # Multiply by out.grad and accumulate with +=.
            raise NotImplementedError

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def backward(self):
        """Fill in .grad for every Value that self depends on."""
        # TODO:
        # 1. Build a topological order (children before parents) with a
        #    depth-first search and a visited set.
        # 2. Seed self.grad = 1.0.
        # 3. Call _backward() on every node in reversed topological order.
        raise NotImplementedError
`,
        solution: String.raw`class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None  # leaves have nothing to propagate

    def __repr__(self):
        return "Value(data=%g, grad=%g)" % (self.data, self.grad)

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def backward(self):
        """Fill in .grad for every Value that self depends on."""
        topo = []
        visited = set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()
`,
        tests: String.raw`import math

# Hand-computed example with a reused node.
a = Value(2.0)
b = Value(-3.0)
c = a * b        # -6
d = c + a        # -4  (a is used twice)
e = d * d        # 16
e.backward()
assert math.isclose(e.grad, 1.0), "the output is seeded with grad 1"
assert math.isclose(d.grad, -8.0), "de/dd = 2d = -8"
assert math.isclose(c.grad, -8.0), "de/dc = de/dd * 1"
assert math.isclose(a.grad, 16.0), "de/da = -8 * (b + 1) = 16 (both paths through a must add up)"
assert math.isclose(b.grad, -16.0), "de/db = -8 * a = -16"

# Simplest accumulation case.
x = Value(3.0)
y = x + x
y.backward()
assert math.isclose(x.grad, 2.0), "x + x has gradient 2 with respect to x"

# Compare with finite differences.
def f(p, q):
    return (p * q + q) * (p + 1.0)

p, q = Value(1.5), Value(-2.0)
f(p, q).backward()
h = 1e-6
num_p = (f(1.5 + h, -2.0) - f(1.5 - h, -2.0)) / (2 * h)
num_q = (f(1.5, -2.0 + h) - f(1.5, -2.0 - h)) / (2 * h)
assert math.isclose(p.grad, num_p, rel_tol=1e-6), "dp should match the numerical estimate"
assert math.isclose(q.grad, num_q, rel_tol=1e-6), "dq should match the numerical estimate"

# A deeper graph where the same leaf feeds every level; ordering matters here.
def g(v):
    out = v
    for _ in range(30):
        out = out * 0.9 + v
    return out

z = Value(0.7)
g(z).backward()
num_z = (g(0.7 + h) - g(0.7 - h)) / (2 * h)
assert math.isclose(z.grad, num_z, rel_tol=1e-6), "deep graph gradient should match finite differences"
`,
        hint: 'In build(v), recurse into every child before appending v. For multiplication, each input’s local derivative is the other input’s data.',
      },
      lab: 'backprop',
    },
    // ------------------------------------------------------------------ 4
    {
      id: 'micrograd-tanh-neuron',
      title: 'A Neuron with a tanh Squash',
      minutes: 11,
      summary:
        'A neuron is a weighted sum plus a bias pushed through a nonlinearity. Add tanh to the engine with its local derivative 1 − tanh².',
      sections: [
        {
          title: 'Weighted sum plus bias',
          body: 'A neuron takes inputs x₁…xₙ, multiplies each by its own weight, adds them up, and adds a bias. The weights decide how much each input matters and with what sign; the bias shifts the result so the neuron can respond even when every input is zero. On its own this is a linear function, and stacking linear functions only ever gives another linear function.',
          formula: 'n = Σᵢ wᵢ·xᵢ + b',
        },
        {
          title: 'Adding nonlinearity with tanh',
          body: 'To model curved relationships, the sum passes through a nonlinear activation. The hyperbolic tangent squashes any real number into (−1, 1): large positive sums approach 1, large negative sums approach −1, and values near zero pass through almost unchanged. It is smooth everywhere and centred at zero.',
          formula: 'tanh(n) = (e²ⁿ − 1) / (e²ⁿ + 1)',
        },
        {
          title: 'The local derivative',
          body: 'If t = tanh(n), then dt/dn = 1 − t². The backward pass can reuse the output it already computed instead of recomputing exponentials. Notice what happens when |n| is large: t² is close to 1, so the derivative is close to 0 and almost no gradient flows back. Such a saturated neuron learns very slowly, which is one reason sensible weight initialisation matters.',
          formula: 'd tanh(n)/dn = 1 − tanh(n)²',
        },
        {
          title: 'Granularity is a choice',
          body: "We could build tanh from smaller pieces and let autodiff work through them, or treat it as one operation with a known local derivative. Both give the same gradient; the single op is just shorter and faster. Seeing the long route once is a great test of your engine, because it needs three more primitives.\n\n- exp: if out = eˣ, then d out/dx = eˣ, which is out itself.\n- pow with a constant k: if out = xᵏ, then d out/dx = k·xᵏ⁻¹.\n- division: a / b is just a · b⁻¹, so it needs no backward of its own once pow exists.\n\n```python\ndef exp(self):\n    out = Value(math.exp(self.data), (self,), 'exp')\n    def _backward():\n        self.grad += out.data * out.grad       # d(e^x)/dx = e^x\n    out._backward = _backward\n    return out\n\ndef __pow__(self, k):                          # k is a plain int or float\n    out = Value(self.data ** k, (self,), f'**{k}')\n    def _backward():\n        self.grad += k * self.data ** (k - 1) * out.grad\n    out._backward = _backward\n    return out\n\ndef __truediv__(self, other):                  # a / b = a * b**-1\n    return self * other ** -1\n\n# tanh rebuilt from parts: (e^(2n) - 1) / (e^(2n) + 1)\ne = (2 * n).exp()\no = (e - 1) / (e + 1)\n```\n\nRun backward on o and on n.tanh() for the same n: the gradient on n must match to many decimal places, because both graphs describe the same function. Only the graph shape differs (one node versus about six).\n\nThe same check works against a real library. The snippet below is for your own machine, not for these in-browser exercises, which never use torch:\n\n```python\nimport torch\nn = torch.tensor(0.8814, dtype=torch.double, requires_grad=True)\no = torch.tanh(n)\no.backward()\nprint(o.item(), n.grad.item())   # compare with your Value's o.data and n.grad\n```\n\nPyTorch does the same job with tensors instead of scalars: requires_grad=True marks a leaf you want gradients for, and .grad holds the result after backward(). The downloadable micrograd.py project includes pow and division, and its gradient check compares the engine against finite differences.",
        },
      ],
      keyTakeaways: [
        'A neuron computes tanh(Σ wᵢxᵢ + b): a linear score followed by a squashing nonlinearity.',
        'The local derivative of tanh is 1 − t², computed from the forward output t.',
        'Saturated tanh units (|n| large) pass almost no gradient, so they learn slowly.',
      ],
      quiz: [
        {
          question: 'A tanh neuron outputs t = 0.6. What is its local derivative dt/dn?',
          options: ['0.4', '0.64', '0.36', '1.6'],
          answer: 1,
          explanation:
            'dt/dn = 1 − t² = 1 − 0.36 = 0.64. The tempting 0.36 is t² itself, and 0.4 is 1 − t, which forgets the square.',
        },
        {
          question:
            'What happens to gradient flow when the pre-activation n is very large in magnitude?',
          options: [
            'The gradient explodes because tanh grows without bound',
            'Nothing special, since tanh has a constant slope',
            'The bias absorbs all of the gradient',
            'Very little gradient flows back, because 1 − tanh(n)² is near 0',
          ],
          answer: 3,
          explanation:
            'tanh flattens out towards ±1, so its slope 1 − t² approaches 0 and the upstream gradient is multiplied by almost nothing. tanh is bounded, so it cannot explode.',
        },
      ],
      challenge: {
        title: 'Add tanh and build a neuron',
        instructions:
          "Implement the `tanh(self)` method on `Value`: return a new Value with data `math.tanh(self.data)`, children `(self,)` and op 'tanh', whose `_backward` adds `(1 - t**2) * out.grad` to `self.grad`. Then implement `neuron(xs, ws, b)`, where `xs` is a list of floats, `ws` a list of Values of the same length, and `b` a Value. It returns the Value `tanh(Σ ws[i]*xs[i] + b)`, built with Value operations so gradients reach every weight and the bias.",
        starter: String.raw`import math


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        # TODO: forward pass with math.tanh; the new node has child (self,)
        # and op 'tanh'. Its _backward uses the local derivative 1 - t**2.
        raise NotImplementedError

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


def neuron(xs, ws, b):
    """Return tanh(sum(w * x) + b) as a Value. xs: floats, ws: Values, b: Value."""
    # TODO: accumulate the weighted sum with Value arithmetic, add b, apply tanh
    raise NotImplementedError
`,
        solution: String.raw`import math


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


def neuron(xs, ws, b):
    """Return tanh(sum(w * x) + b) as a Value. xs: floats, ws: Values, b: Value."""
    act = b
    for w, x in zip(ws, xs):
        act = act + w * x
    return act.tanh()
`,
        tests: String.raw`import math

v = Value(0.5)
t = v.tanh()
assert math.isclose(t.data, math.tanh(0.5), rel_tol=1e-9), "the forward pass should use tanh"
assert t._op == 'tanh' and len(t._prev) == 1 and t._prev[0] is v, "a tanh node has a single child"
t.backward()
assert math.isclose(v.grad, 1 - math.tanh(0.5) ** 2, rel_tol=1e-9), "the local derivative is 1 - tanh^2"

z = Value(0.0)
zt = z.tanh()
zt.backward()
assert zt.data == 0.0 and math.isclose(z.grad, 1.0), "tanh(0) = 0 with slope 1"

big = Value(10.0)
bt = big.tanh()
bt.backward()
assert 0.0 < big.grad < 1e-6, "a saturated tanh passes almost no gradient"

xs = [1.5, -2.0, 0.5]
ws = [Value(0.4), Value(0.3), Value(-0.8)]
b = Value(0.2)
out = neuron(xs, ws, b)
n = 0.4 * 1.5 + 0.3 * -2.0 + -0.8 * 0.5 + 0.2
assert isinstance(out, Value) and math.isclose(out.data, math.tanh(n), rel_tol=1e-9), "neuron output = tanh(w.x + b)"
out.backward()
slope = 1 - math.tanh(n) ** 2
for w, x in zip(ws, xs):
    assert math.isclose(w.grad, slope * x, rel_tol=1e-9), "d out / d w_i should be (1 - t^2) * x_i"
assert math.isclose(b.grad, slope, rel_tol=1e-9), "d out / d b should be 1 - t^2"

def f(w0):
    return math.tanh(w0 * 1.5 + 0.3 * -2.0 + -0.8 * 0.5 + 0.2)

h = 1e-5
assert math.isclose(ws[0].grad, (f(0.4 + h) - f(0.4 - h)) / (2 * h), rel_tol=1e-6), "gradient should match finite differences"
`,
        hint: 'Compute t once and let the inner _backward closure capture it. In neuron, start from b and keep adding w * x so every term stays a Value.',
      },
      lab: 'backprop',
    },
    // ------------------------------------------------------------------ 5
    {
      id: 'micrograd-mlp',
      title: 'From Neurons to a Multilayer Perceptron',
      minutes: 12,
      summary:
        'Compose neurons into layers and layers into an MLP, and expose every trainable Value through parameters().',
      sections: [
        {
          title: 'A Neuron object',
          body: 'Packaging a neuron as a class keeps its parameters together: a list of weight Values and one bias Value, initialised with small random numbers so different neurons start out different. Calling the neuron on an input list computes the weighted sum plus bias and applies tanh. Because every step produces Values, the output carries the whole graph back to the weights.',
        },
        {
          title: 'Layers and the MLP',
          body: 'A layer is a list of independent neurons that all read the same inputs; its output is the list of their activations. A multilayer perceptron chains layers so each layer’s output becomes the next layer’s input. An MLP with 3 inputs and layer sizes [4, 4, 1] has two hidden layers of four neurons and a single output neuron. Returning a bare Value when a layer has one neuron keeps the final output convenient.',
          formula: 'parameters in a layer = nout · (nin + 1)',
        },
        {
          title: 'Collecting parameters',
          body: 'Training must touch every adjustable number, so each component exposes parameters(). A neuron returns its weights plus its bias, a layer concatenates its neurons’ lists, and the MLP concatenates its layers’. For 3 → 4 → 4 → 1 that is 16 + 20 + 5 = 41 Values. The list must contain the very same Value objects used in the forward pass, because that is where backward() deposits gradients.',
        },
        {
          title: 'Composition over cleverness',
          body: 'Nothing here is new mathematics. The power comes from composing small pieces whose graphs plug together; the same engine differentiates the entire network for free.',
        },
      ],
      keyTakeaways: [
        'Neuron → Layer → MLP is plain composition; each piece calls the one below it.',
        'A layer with nin inputs and nout neurons owns nout · (nin + 1) parameters.',
        'parameters() must return the exact Value objects in the graph so gradients and updates land on them.',
      ],
      quiz: [
        {
          question: 'How many parameters does an MLP with 2 inputs and layer sizes [3, 1] have?',
          options: ['9', '12', '13', '7'],
          answer: 2,
          explanation:
            'The hidden layer has 3 · (2 + 1) = 9 and the output layer has 1 · (3 + 1) = 4, for 13 in total. Answering 9 or 12 usually means forgetting a layer or the biases.',
        },
        {
          question:
            'Why must parameters() return the Value objects used in the forward pass rather than copies?',
          options: [
            'Copies would just use more memory but otherwise work',
            'backward() writes gradients onto the objects in the graph, so copies would never see them and updates would not change the model',
            'Copies of Values cannot be multiplied',
            'Python does not allow copying objects that define __mul__',
          ],
          answer: 1,
          explanation:
            'Gradients live on the exact nodes in the graph. A copy has its own grad (still 0) and its own data, so updating it leaves the real weights untouched; the problem is correctness, not memory.',
        },
      ],
      challenge: {
        title: 'Neuron, Layer and MLP',
        instructions:
          'Using the provided `Value` class, implement three classes. `Neuron(nin)`: attributes `w` (list of `nin` Values) and `b` (a Value), each initialised with `random.uniform(-1, 1)` (draw the `nin` weights first, in order, then the bias); calling it on a list `x` returns `tanh(Σ w·x + b)`; `parameters()` returns `w + [b]`. `Layer(nin, nout)`: attribute `neurons` (list of `nout` Neurons); calling it returns the list of outputs, or the single Value if `nout == 1`; `parameters()` concatenates its neurons’ parameters. `MLP(nin, nouts)`: attribute `layers` with sizes `[nin] + nouts`; calling it feeds `x` through each layer in turn; `parameters()` concatenates all layers’ parameters.',
        starter: String.raw`import math
import random


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


class Neuron:
    def __init__(self, nin):
        # TODO: self.w = nin random Values, self.b = one random Value
        raise NotImplementedError

    def __call__(self, x):
        # TODO: return tanh(sum(w * x) + b) as a Value
        raise NotImplementedError

    def parameters(self):
        # TODO: weights followed by the bias
        raise NotImplementedError


class Layer:
    def __init__(self, nin, nout):
        # TODO: self.neurons = nout Neurons that each take nin inputs
        raise NotImplementedError

    def __call__(self, x):
        # TODO: list of outputs, or a single Value when there is one neuron
        raise NotImplementedError

    def parameters(self):
        # TODO: concatenate the neurons' parameters
        raise NotImplementedError


class MLP:
    def __init__(self, nin, nouts):
        # TODO: self.layers, with sizes [nin] + nouts
        raise NotImplementedError

    def __call__(self, x):
        # TODO: feed x through every layer in order
        raise NotImplementedError

    def parameters(self):
        # TODO: concatenate the layers' parameters
        raise NotImplementedError
`,
        solution: String.raw`import math
import random


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __call__(self, x):
        act = self.b
        for wi, xi in zip(self.w, x):
            act = act + wi * xi
        return act.tanh()

    def parameters(self):
        return self.w + [self.b]


class Layer:
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]

    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]


class MLP:
    def __init__(self, nin, nouts):
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i + 1]) for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]
`,
        tests: String.raw`import math
import random

random.seed(1)
nrn = Neuron(3)
assert len(nrn.w) == 3 and isinstance(nrn.b, Value), "Neuron(3) has 3 weights and a bias"
ps = nrn.parameters()
assert len(ps) == 4 and ps[-1] is nrn.b and all(ps[i] is nrn.w[i] for i in range(3)), "parameters() is w + [b], the same objects"
assert all(-1.0 <= p.data <= 1.0 for p in ps), "initial values come from uniform(-1, 1)"
random.seed(1)
replay = [random.uniform(-1, 1) for _ in range(4)]
assert [p.data for p in ps] == replay, "weights then bias must be drawn with random.uniform(-1, 1), in that order"
other = Neuron(3)
assert [p.data for p in other.parameters()] != [p.data for p in ps], "two neurons should start with different random values"
x = [0.5, -1.0, 2.0]
expected = math.tanh(sum(w.data * xi for w, xi in zip(nrn.w, x)) + nrn.b.data)
y = nrn(x)
assert isinstance(y, Value) and math.isclose(y.data, expected, rel_tol=1e-9), "a neuron computes tanh(w.x + b)"

layer = Layer(2, 3)
outs = layer([1.0, -1.0])
assert isinstance(outs, list) and len(outs) == 3, "Layer(2, 3) returns a list of 3 outputs"
assert len(layer.parameters()) == 9, "3 neurons * (2 weights + 1 bias) = 9"
single = Layer(2, 1)([1.0, -1.0])
assert isinstance(single, Value), "a layer with one neuron returns a single Value"

random.seed(0)
model = MLP(3, [4, 4, 1])
params = model.parameters()
assert len(params) == 41, "3 -> 4 -> 4 -> 1 has 16 + 20 + 5 = 41 parameters"
assert len(set(id(p) for p in params)) == 41, "parameters must be distinct Value objects"
inp = [2.0, 3.0, -1.0]
out = model(inp)
assert isinstance(out, Value) and -1.0 < out.data < 1.0, "the MLP output is a single tanh Value"

def manual_forward(m, xs):
    acts = list(xs)
    for lyr in m.layers:
        acts = [math.tanh(sum(w.data * a for w, a in zip(n.w, acts)) + n.b.data) for n in lyr.neurons]
    return acts[0]

assert math.isclose(out.data, manual_forward(model, inp), rel_tol=1e-9), "the MLP must chain its layers in order"

out.backward()
assert all(p.grad != 0.0 for p in model.layers[-1].parameters()), "gradients must reach the output layer's parameters"
assert sum(1 for p in params if p.grad != 0.0) > 30, "gradients should reach parameters throughout the network"
`,
        hint: 'Each class only needs to call the one below it: MLP loops over layers, Layer loops over neurons. A nested list comprehension flattens parameters neatly.',
      },
      lab: 'gradient',
    },
    // ------------------------------------------------------------------ 6
    {
      id: 'micrograd-training',
      title: 'Training: Loss, Zero Grad and Gradient Descent',
      minutes: 14,
      summary:
        'Score predictions with a squared-error loss, backpropagate it, and nudge every parameter downhill. Repeat, remembering to reset gradients each step.',
      sections: [
        {
          title: 'Measuring wrongness with a loss',
          body: 'To improve a network we need a single number that says how bad its predictions are. Squared error compares each prediction with its target, squares the difference so that overshooting and undershooting both count, and sums over examples. The loss is itself a Value at the top of the graph, so calling backward() on it gives the gradient of the total error with respect to every parameter.',
          formula: 'L = Σᵢ (ŷᵢ − yᵢ)²',
        },
        {
          title: 'Gradient descent',
          body: 'Each gradient points in the direction that increases the loss fastest, so we move each parameter a little the opposite way. The learning rate η sets the step size: too small and training crawls, too large and the loss bounces around or blows up. In practice you watch the loss curve and adjust.',
          formula: 'p ← p − η · ∂L/∂p',
        },
        {
          title: 'Zero the gradients',
          body: 'Because backward accumulates with +=, the gradients from the previous iteration are still sitting in every grad field. If you do not reset them before the next backward pass, each step uses the sum of all past gradients, a stale and ever-growing signal. Setting grad = 0 for every parameter before backward is the zero_grad step.',
        },
        {
          title: 'The training loop',
          body: 'Every iteration follows the same rhythm: forward pass, compute the loss, zero the gradients, backward pass, update each parameter. Repeat and the loss should trend downward. Scaled up to tensors and billions of parameters, this same loop trains modern networks.',
        },
      ],
      keyTakeaways: [
        'A loss turns all prediction errors into one Value you can call backward() on.',
        'Gradient descent updates p ← p − η·∂L/∂p; the learning rate controls the step size.',
        'Zero every grad before each backward pass, because gradients accumulate.',
      ],
      quiz: [
        {
          question: 'What goes wrong if you skip zeroing the gradients between training steps?',
          options: [
            'backward() raises an error on the second step',
            'The forward pass computes the wrong loss',
            'Nothing, because backward() overwrites the old gradients',
            'Each step uses gradients summed over all previous steps, so the updates are stale and keep growing',
          ],
          answer: 3,
          explanation:
            'backward() adds into grad with +=, so old gradients linger. The forward pass and loss are fine; it is the update that becomes wrong, because it follows a sum of past gradients instead of the current one.',
        },
        {
          question:
            'Your loss jumps up and down wildly and sometimes grows. Which change should you try first?',
          options: [
            'Increase the learning rate',
            'Lower the learning rate',
            'Remove the bias terms',
            'Stop zeroing the gradients',
          ],
          answer: 1,
          explanation:
            'Oscillating or growing loss is the classic sign of steps that are too large, overshooting the minimum. A smaller learning rate takes shorter, more stable steps; increasing it would make things worse.',
        },
      ],
      challenge: {
        title: 'Train the network',
        instructions:
          'The `Value` engine and `Neuron`/`Layer`/`MLP` classes are provided. Implement `squared_error(preds, targets)`: given a list of prediction Values and a list of float targets, return the Value `Σ (pred − target)**2`. Then implement `train(model, xs, ys, steps, lr)`. For each of `steps` iterations: compute `preds = [model(x) for x in xs]`, the loss with `squared_error`, set `p.grad = 0.0` for every parameter, call `loss.backward()`, then update `p.data -= lr * p.grad`. Return the list of loss values (floats, `loss.data`) measured at each step before the update.',
        starter: String.raw`import math
import random


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __pow__(self, k):
        out = Value(self.data ** k, (self,), '**')

        def _backward():
            self.grad += k * self.data ** (k - 1) * out.grad

        out._backward = _backward
        return out

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __call__(self, x):
        act = self.b
        for wi, xi in zip(self.w, x):
            act = act + wi * xi
        return act.tanh()

    def parameters(self):
        return self.w + [self.b]


class Layer:
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]

    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]


class MLP:
    def __init__(self, nin, nouts):
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i + 1]) for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]


def squared_error(preds, targets):
    """Return sum((pred - target) ** 2) as a single Value."""
    # TODO: build the loss with Value arithmetic so it can be backpropagated
    raise NotImplementedError


def train(model, xs, ys, steps, lr):
    """Run gradient descent and return the list of losses (floats), one per step."""
    # TODO: forward -> loss -> zero grads -> backward -> update, repeated steps times
    raise NotImplementedError
`,
        solution: String.raw`import math
import random


class Value:
    def __init__(self, data, _children=(), _op=''):
        self.data = float(data)
        self.grad = 0.0
        self._prev = tuple(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), '+')

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), '*')

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __pow__(self, k):
        out = Value(self.data ** k, (self,), '**')

        def _backward():
            self.grad += k * self.data ** (k - 1) * out.grad

        out._backward = _backward
        return out

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __radd__(self, other):
        return self + other

    def __rmul__(self, other):
        return self * other

    def tanh(self):
        t = math.tanh(self.data)
        out = Value(t, (self,), 'tanh')

        def _backward():
            self.grad += (1 - t ** 2) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        topo, visited = [], set()

        def build(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build(child)
                topo.append(v)

        build(self)
        self.grad = 1.0
        for v in reversed(topo):
            v._backward()


class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))

    def __call__(self, x):
        act = self.b
        for wi, xi in zip(self.w, x):
            act = act + wi * xi
        return act.tanh()

    def parameters(self):
        return self.w + [self.b]


class Layer:
    def __init__(self, nin, nout):
        self.neurons = [Neuron(nin) for _ in range(nout)]

    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs

    def parameters(self):
        return [p for n in self.neurons for p in n.parameters()]


class MLP:
    def __init__(self, nin, nouts):
        sizes = [nin] + nouts
        self.layers = [Layer(sizes[i], sizes[i + 1]) for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]


def squared_error(preds, targets):
    """Return sum((pred - target) ** 2) as a single Value."""
    return sum(((p - t) ** 2 for p, t in zip(preds, targets)), Value(0.0))


def train(model, xs, ys, steps, lr):
    """Run gradient descent and return the list of losses (floats), one per step."""
    losses = []
    for _ in range(steps):
        preds = [model(x) for x in xs]
        loss = squared_error(preds, ys)
        for p in model.parameters():
            p.grad = 0.0
        loss.backward()
        for p in model.parameters():
            p.data -= lr * p.grad
        losses.append(loss.data)
    return losses
`,
        tests: String.raw`import math
import random

# squared_error on its own
p1, p2 = Value(1.0), Value(-0.5)
loss = squared_error([p1, p2], [0.0, 0.5])
assert isinstance(loss, Value) and math.isclose(loss.data, 2.0), "(1 - 0)^2 + (-0.5 - 0.5)^2 = 2"
loss.backward()
assert math.isclose(p1.grad, 2.0) and math.isclose(p2.grad, -2.0), "dL/dpred = 2 * (pred - target)"

# A tiny linear model checked against an independent float computation.
class Line:
    def __init__(self):
        self.w = Value(0.5)
        self.b = Value(0.0)

    def __call__(self, x):
        return self.w * x + self.b

    def parameters(self):
        return [self.w, self.b]

line = Line()
xs1, ys1 = [1.0, 2.0], [2.0, 4.0]
losses = train(line, xs1, ys1, steps=3, lr=0.01)
assert isinstance(losses, list) and len(losses) == 3, "train returns one loss per step"
assert all(isinstance(v, float) for v in losses), "losses should be plain floats"
assert math.isclose(losses[0], 11.25, rel_tol=1e-9), "the first loss is measured before any update"

w, b = 0.5, 0.0
ref = []
for _ in range(3):
    preds = [w * x + b for x in xs1]
    ref.append(sum((p - y) ** 2 for p, y in zip(preds, ys1)))
    gw = sum(2 * (p - y) * x for p, y, x in zip(preds, ys1, xs1))
    gb = sum(2 * (p - y) for p, y in zip(preds, ys1))
    w -= 0.01 * gw
    b -= 0.01 * gb
for got, want in zip(losses, ref):
    assert math.isclose(got, want, rel_tol=1e-9), "loss sequence should match plain gradient descent"
assert math.isclose(line.w.data, w, rel_tol=1e-9) and math.isclose(line.b.data, b, rel_tol=1e-9), "parameters are wrong: did you zero the grads every step?"

# A small MLP should fit four points.
random.seed(42)
model = MLP(3, [4, 4, 1])
xs = [[2.0, 3.0, -1.0], [3.0, -1.0, 0.5], [0.5, 1.0, 1.0], [1.0, 1.0, -1.0]]
ys = [1.0, -1.0, -1.0, 1.0]
hist = train(model, xs, ys, steps=40, lr=0.05)
assert len(hist) == 40, "one loss per step"
assert hist[-1] < 0.5 * hist[0], "training should cut the loss at least in half"
`,
        hint: 'Plain sum(...) already works: it starts from the integer 0, and 0 + Value calls Value.__radd__, which wraps 0 and returns a Value. Passing Value(0.0) as the start is fine but not needed. Inside the loop, reset every p.grad to 0.0 right before loss.backward().',
      },
      lab: 'gradient',
    },
  ],
};
