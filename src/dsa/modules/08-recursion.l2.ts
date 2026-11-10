import type { Lesson } from '../types';

// Module 8, lesson 2: cost a recursion by drawing its tree, then use "one call on n / 2" for fast power.
const lesson: Lesson = {
  id: 'recursion-trees-and-fast-power',
  title: 'Recursion trees, cost & fast power',
  summary: 'Draw the tree of calls to see what a recursion costs, then halve the exponent to get xⁿ in about 32 calls, even for n = 2 billion.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Fold a sheet of paper 42 times',
      text: "A sheet of paper is about 0.1 mm thick. Fold it once: 0.2 mm. Every fold **doubles** the thickness. After 42 folds the stack would be about 440,000 km tall, past the Moon. Doubling grows scary fast. Flip it around and you get the good news: **halving shrinks scary fast**. Cut a billion in half again and again and you reach 1 after only about 30 cuts. This lesson uses both facts: one explains why some recursions are hopelessly slow, the other makes a different one blazing fast.",
    },
    {
      kind: 'text',
      text: "**The question.** In the last lesson you saw that `fib(5)` makes 15 calls. But how fast does that number grow as `n` grows? To see it, redraw those calls as a **recursion tree**: every call is a node (a box in the drawing), and its children are the calls it makes. The calls with no children are the base cases, `f(1)` and `f(0)`. Then count the calls level by level.",
    },
    {
      kind: 'diagram',
      title: 'The recursion tree of fib(5)',
      art: `level 0                  f(5)
                     /          \\
level 1           f(4)           f(3)
                 /    \\         /    \\
level 2       f(3)    f(2)    f(2)   f(1)
             /   \\    /  \\    /  \\
level 3    f(2) f(1) f(1) f(0) f(1) f(0)
           /  \\
level 4  f(1) f(0)`,
      caption: "Calls per level: 1, 2, 4, 6, 2, so **15 calls** in total, the same 15 as in lesson 1.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Each call makes two more calls, so each level has up to twice as many calls as the one above it, like the folded paper. Each time n goes up by 1, the number of calls grows about 1.6×. We round that up and say naive Fibonacci costs **O(2ⁿ)**. In numbers: `fib(20)` makes 21,891 calls, `fib(40)` makes **331 million**, and `fib(50)` makes about 40 billion, which takes more than a minute on a laptop. Almost all of that is repeated work: the same subtree, like `f(3)`, gets rebuilt again and again. Saving each answer the first time (memoization, from the note in lesson 1) fixes this, and module 16 is all about it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Cost = number of calls × work per call',
      text: "To cost any recursion, draw its tree and count the nodes level by level, then multiply by the work one call does (not counting its children). The **memory** is the height of the tree, because that is how deep the call stack gets. Now compare a function that makes just **one** call on `n / 2`: its tree is not a tree at all, it is a single path, `f(13) → f(6) → f(3) → f(1) → f(0)`. A path that halves each step has only about **log₂ n** levels (log₂ n means: how many times can you halve n before you reach 1). For a billion that is about 30.",
    },
    {
      kind: 'table',
      title: 'Cheat sheet: read the cost off the tree',
      head: ['Each call makes…', 'The tree looks like', 'Total cost', 'Example'],
      rows: [
        ['one call on `n - 1`, O(1) work', 'a path, n levels', '**O(n)**', 'K-th Symbol, Josephus (last lesson)'],
        ['one call on `n / 2`, O(1) work', 'a path, log₂ n levels', '**O(log n)**', 'fast power (below)'],
        ['two calls on `n - 1`, O(1) work', 'doubles every level, n levels', '**O(2ⁿ)**', 'naive Fibonacci'],
        ['two calls on `n / 2`, O(n) work to combine', 'log₂ n levels, n work per level', '**O(n log n)**', 'merge sort (next lesson)'],
      ],
    },
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your browser does this every day',
      text: "When your browser opens an HTTPS site, it checks the site's RSA certificate. That means computing something like `s^65537 mod N`, where `N` is a number over 600 digits long. Multiplying `s` by itself 65,536 times would be far too slow. Your browser does it with **17 multiplications** using the trick in this lesson, called **fast power**. Your task: write `myPow(x, n)` that computes xⁿ for a decimal `x` and a whole number `n` anywhere from about -2.1 billion to 2.1 billion.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: multiply n times',
      code: `function myPow(x, n):
    if n < 0:
        return 1 / myPow(x, -n)      // x⁻ⁿ = 1 / xⁿ
    result ← 1
    for i from 1 to n:               // n multiplications
        result ← result × x
    return result`,
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Square the half',
      text: "The brute force works, and for `n = 20` it is instant. But for `n = 2,147,483,647` it does over 2 billion multiplications, which takes seconds for one call. The waste: to get `x¹⁰` it builds `x⁵` and then keeps going one `x` at a time, even though `x¹⁰ = x⁵ × x⁵`. So compute the half **once** and square it: `xⁿ = half × half` when n is even, and `half × half × x` when n is odd, where `half = x^floor(n / 2)`. That is one call on `n / 2`, so the cheat sheet says **O(log n)**.",
    },
    {
      kind: 'trace',
      title: 'Fast power: 3¹³',
      columns: ['call', 'n', 'half = pow(3, ⌊n/2⌋)', 'half × half', 'n odd?', 'returns'],
      rows: [
        [1, 13, 'pow(3, 6) = 729', 531441, 'yes, × 3', 1594323],
        [2, 6, 'pow(3, 3) = 27', 729, 'no', 729],
        [3, 3, 'pow(3, 1) = 3', 9, 'yes, × 3', 27],
        [4, 1, 'pow(3, 0) = 1', 1, 'yes, × 3', 3],
        [5, 0, 'base case', '—', '—', 1],
      ],
      note: "Calls go **down** the table (13 → 6 → 3 → 1 → 0). Answers come back **up**: read the `returns` column from the bottom. 5 calls instead of 13 multiplications. For n = 2³¹ - 1 it is 32 calls instead of 2 billion.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Fast power',
      code: `function myPow(x, n):
    if n < 0:
        return 1 / myPow(x, -n)
    if n = 0:                         // base case: x⁰ = 1
        return 1
    half ← myPow(x, floor(n / 2))     // ONE call, saved in a variable
    result ← half × half
    if n is odd:
        result ← result × x           // the leftover x
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2)); // plain n / 2 gives 6.5 for 13
  const result = half * half;
  return n % 2 === 1 ? result * x : result;
}`,
    },
    {
      kind: 'compare',
      title: 'Computing xⁿ',
      rows: [
        { approach: 'Multiply n times', time: 'O(n)', space: 'O(1)', note: 'Correct and simple. About 2 billion steps for the biggest n.' },
        { approach: 'Halve, but call it twice', time: 'O(n)', space: 'O(log n)', note: '`myPow(x, n/2) * myPow(x, n/2)` makes **two** calls on n / 2. There are still log₂ n levels, but the calls double on each one, so the bottom level alone has about n calls. All the speed is gone.' },
        { approach: 'Fast power (half once)', time: 'O(log n)', space: 'O(log n)', note: 'One call on n / 2. About 32 calls even for the biggest n. The space is the call stack.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern, and huge answers.** Reach for fast power when you see a huge exponent (`n` up to 10⁹ or 10¹⁵), or any \"do the same step n times\" where two half-runs combine into a full run. Answers like 5¹⁰⁰⁰ have hundreds of digits, so problems ask for them **mod 10⁹+7** (the remainder after dividing by 1,000,000,007). That keeps every number below about a billion. The rule that makes it work: `(a × b) mod m = ((a mod m) × (b mod m)) mod m`. So you can take the remainder after **every** multiplication, not just at the end.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: fast power mod m',
      code: `function power(base, exp, m):         // base to the power exp, mod m
    if exp = 0:
        return 1
    half ← power(base, floor(exp / 2), m)    // one call on exp / 2
    result ← (half × half) mod m
    if exp is odd:
        result ← (result × base) mod m
    return result`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: '`a * b % MOD` silently lies in JavaScript',
      text: "JS numbers are exact only up to 2⁵³ ≈ 9 × 10¹⁵. Two remainders just under 10⁹+7 multiply to about 10¹⁸, so the last digits get rounded away **with no error**. Try `1000000006 * 1000000006 % 1000000007`. The true answer is **1**, but JS prints **999999972**. The fix: multiply in **BigInt**, JS's whole numbers with no size limit. Write them with an `n` at the end (`1000000007n`) or convert with `BigInt(x)`, and turn the final answer back with `Number(result)`. `BigInt(1000000006) * BigInt(1000000006) % 1000000007n` gives `1n`. Mod 1337 is safe with plain numbers: 1336 × 1336 is under 2 million.",
    },
  ],
  problems: [
    {
      id: 'recursion-pow',
      title: 'Power button',
      difficulty: 'medium',
      leetcode: 50,
      pattern: 'Fast power (halve the exponent)',
      statement: "A calculator app needs a power button. Write `myPow(x, n)` that returns x raised to the power `n`, without using `**` or `Math.pow`. `x` can be a decimal, and `n` is a whole number that can be positive, zero or negative, as large as about 2.1 billion either way. A negative power means \"one over\": 2⁻² = 1 / 2² = 0.25.",
      examples: [
        { input: 'x = 2, n = 10', output: '1024' },
        { input: 'x = 2.1, n = 3', output: '9.261' },
        { input: 'x = 2, n = -2', output: '0.25', explain: '2⁻² = 1 / 4.' },
      ],
      constraints: ['-100 < x < 100', '-2³¹ ≤ n ≤ 2³¹ - 1', 'x is not 0 when n ≤ 0', 'answers within 0.00001 count as correct'],
      hints: [
        'Multiplying n times is too slow when n is 2 billion. What does x¹⁰ have to do with x⁵?',
        'x¹⁰ = x⁵ × x⁵ and x¹¹ = x⁵ × x⁵ × x. So `myPow(x, n)` only needs `myPow(x, floor(n / 2))`.',
        'Compute the half **once**, save it in a variable, square it, and multiply by one more `x` if n is odd. Base case: n = 0 returns 1.',
        'For negative n, return `1 / myPow(x, -n)`. Use `Math.floor(n / 2)`: plain `n / 2` gives fractions in JS.',
      ],
      approaches: [
        {
          name: 'Multiply n times',
          idea: 'xⁿ is x times itself n times, so loop n times (and flip to 1 / result for negative n). Correct, but n can be 2 billion, so it is far too slow.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Halve, but call it twice',
          idea: 'Uses xⁿ = x^(n/2) × x^(n/2), but writes the recursive call twice. That is two calls on n / 2 per level, so the tree doubles while n halves, and the total is O(n) calls again.',
          time: 'O(n)',
          space: 'O(log n)',
        },
        {
          name: 'Fast power (square the half)',
          idea: 'Get `half = x^floor(n/2)` with **one** call, then the answer is `half × half`, times one extra `x` if n is odd. n halves on every call, so there are only about log₂ n calls: about 32 for the biggest n.',
          pseudo: `function myPow(x, n):
    if n < 0:
        return 1 / myPow(x, -n)
    if n = 0:
        return 1
    half ← myPow(x, floor(n / 2))
    result ← half × half
    if n is odd:
        result ← result × x
    return result`,
          code: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));
  const result = half * half;
  return n % 2 === 1 ? result * x : result;
}`,
          time: 'O(log n)',
          space: 'O(log n)',
        },
      ],
      fn: 'myPow',
      starter: `function myPow(x, n) {
  // return x to the power n, in O(log n) steps
  return 0;
}`,
      solution: `function myPow(x, n) {
  if (n < 0) return 1 / myPow(x, -n);
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));
  const result = half * half;
  return n % 2 === 1 ? result * x : result;
}`,
      tests: [
        { name: 'small even power', args: [2, 10], expected: 1024 },
        { name: 'decimal base, odd power', args: [2.1, 3], expected: 9.261 },
        { name: 'negative power', args: [2, -2], expected: 0.25 },
        { name: 'fraction, negative power', args: [0.5, -3], expected: 8 },
        { name: 'power zero', args: [7, 0], expected: 1 },
        { name: 'base 1, huge n', args: [1, 2147483647], expected: 1 },
        { name: 'base -1, huge odd n', args: [-1, 2147483647], expected: -1 },
        { name: 'base -1, smallest n (even)', args: [-1, -2147483648], expected: 1 },
        { name: 'tiny step above 1, huge n', args: [1.0000000001, 2147483647], expected: 1.239549965208056 },
      ],
      compare: 'float',
      takeaway: 'Compute the half once and square it: one call on n / 2 means O(log n).',
    },
    {
      id: 'recursion-count-good-numbers',
      title: 'Count the good lock codes',
      difficulty: 'medium',
      leetcode: 1922,
      pattern: 'Fast power mod 10⁹+7',
      statement: "A lock company makes digit codes of length `n`. Number the positions from 0. A code is **good** if every even position (0, 2, 4, …) holds an even digit (0, 2, 4, 6 or 8) and every odd position (1, 3, 5, …) holds a prime digit (2, 3, 5 or 7). Leading zeros are fine. Return how many good codes of length `n` exist. The count is enormous, so return it **mod 1,000,000,007**.",
      examples: [
        { input: 'n = 1', output: '5', explain: 'One even position: 0, 2, 4, 6 or 8.' },
        { input: 'n = 4', output: '400', explain: 'Positions 0 and 2 have 5 choices, positions 1 and 3 have 4: 5 × 4 × 5 × 4.' },
        { input: 'n = 50', output: '564908303' },
      ],
      constraints: ['1 ≤ n ≤ 10¹⁵', 'return the count mod 1,000,000,007'],
      hints: [
        'Each position is picked on its own, so multiply the choices. Among positions 0 to n - 1, how many are even and how many are odd?',
        'There are `ceil(n / 2)` even positions and `floor(n / 2)` odd ones. The answer is 5^ceil(n/2) × 4^floor(n/2), mod 10⁹+7.',
        'n can be 10¹⁵, so use fast power, taking the remainder after every multiplication.',
        'Inside fast power, `half * half` can reach 10¹⁸, past 2⁵³. Multiply in BigInt: `BigInt(a) * BigInt(b) % 1000000007n`, then `Number(...)` at the end.',
      ],
      approaches: [
        {
          name: 'Multiply one position at a time',
          idea: 'Walk the n positions and multiply the running count by 5 or 4, taking mod each time. Correct, but n can be 10¹⁵: that loop would run for weeks.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Fast power with plain numbers',
          idea: 'Fast power fixes the speed: about 50 calls. But `half * half % MOD` on plain JS numbers can be around 10¹⁸, far past 2⁵³, so the low digits get rounded and the answer is silently wrong.',
          time: 'O(log n)',
          space: 'O(log n)',
        },
        {
          name: 'Fast power with BigInt',
          idea: 'Same fast power, but every multiply happens in BigInt, which never rounds. Since 5 and 4 are raised separately, the answer is power(5, evens) × power(4, odds) mod 10⁹+7.',
          pseudo: `function countGoodNumbers(n):
    MOD ← 1000000007
    evens ← ceil(n / 2)               // positions 0, 2, 4, ...
    odds ← floor(n / 2)               // positions 1, 3, 5, ...
    return (power(5, evens, MOD) × power(4, odds, MOD)) mod MOD

function power(base, exp, m):
    if exp = 0:
        return 1
    half ← power(base, floor(exp / 2), m)
    result ← (half × half) mod m
    if exp is odd:
        result ← (result × base) mod m
    return result`,
          code: `function countGoodNumbers(n) {
  const MOD = 1000000007n;
  function power(base, exp) { // base is a BigInt, exp is a normal number
    if (exp === 0) return 1n;
    const half = power(base, Math.floor(exp / 2));
    let result = half * half % MOD;
    if (exp % 2 === 1) result = result * base % MOD;
    return result;
  }
  const evens = Math.ceil(n / 2);
  const odds = Math.floor(n / 2);
  return Number(power(5n, evens) * power(4n, odds) % MOD);
}`,
          time: 'O(log n)',
          space: 'O(log n)',
        },
      ],
      fn: 'countGoodNumbers',
      starter: `function countGoodNumbers(n) {
  // count good codes of length n, mod 1000000007
  return 0;
}`,
      solution: `function countGoodNumbers(n) {
  const MOD = 1000000007n;
  function power(base, exp) { // base is a BigInt, exp is a normal number
    if (exp === 0) return 1n;
    const half = power(base, Math.floor(exp / 2));
    let result = half * half % MOD;
    if (exp % 2 === 1) result = result * base % MOD;
    return result;
  }
  const evens = Math.ceil(n / 2);
  const odds = Math.floor(n / 2);
  return Number(power(5n, evens) * power(4n, odds) % MOD);
}`,
      tests: [
        { name: 'one digit', args: [1], expected: 5 },
        { name: 'two digits', args: [2], expected: 20 },
        { name: 'three digits', args: [3], expected: 100 },
        { name: 'four digits', args: [4], expected: 400 },
        { name: 'ten digits, no mod yet', args: [10], expected: 3200000 },
        { name: 'fifty digits', args: [50], expected: 564908303 },
        { name: 'huge n', args: [806166225460393], expected: 643535977 },
        { name: 'n = 10¹⁵', args: [1000000000000000], expected: 711414395 },
        { name: 'n = 10¹⁵ - 1 (odd)', args: [999999999999999], expected: 927853604 },
      ],
      takeaway: 'Mod after every multiply, and multiply in BigInt when the factors can reach 10⁹.',
    },
    {
      id: 'recursion-super-pow',
      title: 'A power too big to write down',
      difficulty: 'medium',
      leetcode: 372,
      pattern: 'Fast power, digit by digit',
      statement: "A puzzle site gives you a base `a` and an exponent so big it arrives as an array of digits `b`, most significant digit first: `[2, 0, 0]` means 200. The array can be 2000 digits long, a number far too big to even store. Return a raised to that number, **mod 1337**.",
      examples: [
        { input: 'a = 2, b = [3]', output: '8' },
        { input: 'a = 2, b = [1, 0]', output: '1024', explain: '2¹⁰ = 1024, which is already below 1337.' },
        { input: 'a = 2147483647, b = [2, 0, 0]', output: '1198' },
      ],
      constraints: ['1 ≤ a ≤ 2³¹ - 1', '1 ≤ b.length ≤ 2000', '0 ≤ b[i] ≤ 9', 'b has no leading zeros'],
      hints: [
        'You cannot turn `b` into a JS number: past about 16 digits it loses precision, and past 308 digits it becomes `Infinity`.',
        'Peel off the last digit. If the exponent is `10 × C + d`, then a^(10C + d) = (a^C)¹⁰ × a^d.',
        'a^C is the same problem on `b` without its last digit: trust the call. Raise its answer to the 10th power, multiply by a^d, mod 1337.',
        'Reduce `a` mod 1337 first. Then every number stays below 1337, so every product stays below 1337² ≈ 1.8 million: plain numbers are safe here.',
      ],
      approaches: [
        {
          name: 'Glue the digits into one number',
          idea: 'Build the exponent with `Number(b.join(\'\'))` and run fast power. It breaks: a JS number holds only about 16 exact digits and turns into `Infinity` past 308 digits. (BigInt could hold it, but there is a neater way that never builds the giant number.)',
          time: 'O(len)',
          space: 'O(len)',
        },
        {
          name: 'Peel the last digit (recursion)',
          idea: 'If the digits spell `10 × C + d`, then a^B = (a^C)¹⁰ × a^d. a^C is the same problem with one digit fewer, so recurse on it. Each level only raises numbers to powers of 10 or less, with all values below 1337.',
          pseudo: `function superPow(a, b):
    return solve(b.length)

function solve(len):                  // a^(first len digits of b) mod 1337
    if len = 0:
        return 1                      // empty exponent: a⁰ = 1
    rest ← solve(len - 1)             // trust the call
    d ← b[len - 1]                    // the last digit
    return (power(rest, 10) × power(a mod 1337, d)) mod 1337

// power(base, exp): fast power mod 1337 from the lesson`,
          code: `function superPow(a, b) {
  const MOD = 1337;
  function power(base, exp) { // base < 1337, so products stay under 1.8 million
    if (exp === 0) return 1;
    const half = power(base, Math.floor(exp / 2));
    let result = half * half % MOD;
    if (exp % 2 === 1) result = result * base % MOD;
    return result;
  }
  function solve(len) { // a^(first len digits of b) mod 1337
    if (len === 0) return 1;
    const rest = solve(len - 1);
    return power(rest, 10) * power(a % MOD, b[len - 1]) % MOD;
  }
  return solve(b.length);
}`,
          time: 'O(len)',
          space: 'O(len)',
        },
      ],
      fn: 'superPow',
      starter: `function superPow(a, b) {
  // return a^(the number spelled by b) mod 1337
  return 0;
}`,
      solution: `function superPow(a, b) {
  const MOD = 1337;
  function power(base, exp) { // base < 1337, so products stay under 1.8 million
    if (exp === 0) return 1;
    const half = power(base, Math.floor(exp / 2));
    let result = half * half % MOD;
    if (exp % 2 === 1) result = result * base % MOD;
    return result;
  }
  function solve(len) { // a^(first len digits of b) mod 1337
    if (len === 0) return 1;
    const rest = solve(len - 1);
    return power(rest, 10) * power(a % MOD, b[len - 1]) % MOD;
  }
  return solve(b.length);
}`,
      tests: [
        { name: 'one digit', args: [2, [3]], expected: 8 },
        { name: 'two digits', args: [2, [1, 0]], expected: 1024 },
        { name: 'exponent is 0', args: [5, [0]], expected: 1 },
        { name: 'base 1', args: [1, [4, 3, 3, 8, 5, 2]], expected: 1 },
        { name: 'base bigger than 1337', args: [2147483647, [2, 0, 0]], expected: 1198 },
        { name: 'base is a multiple of 1337', args: [2674, [1, 2]], expected: 0 },
        { name: 'exponent 10²⁰', args: [3, [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], expected: 816 },
        {
          name: '40-digit exponent',
          args: [78267, [4, 5, 6, 2, 3, 0, 1, 2, 3, 8, 3, 6, 0, 7, 7, 7, 6, 7, 9, 3, 6, 1, 7, 3, 0, 4, 8, 6, 7, 6, 1, 4, 1, 1, 6, 9, 6, 1, 0, 5]],
          expected: 966,
        },
      ],
      takeaway: 'A huge exponent can be eaten one digit at a time: a^(10C + d) = (a^C)¹⁰ × a^d.',
    },
  ],
  quiz: [
    {
      prompt: 'A function does O(1) work and then calls itself **twice** on `n - 1`. About how many calls does it make for n = 30?',
      options: ['30', '900', 'about a billion', 'it never stops'],
      answer: 2,
      explanation: 'Calls double on every level and there are about 30 levels, so the last level alone has about 2³⁰ ≈ 1 billion calls (about 2 billion counting every level). That is the O(2ⁿ) row of the cheat sheet.',
    },
    {
      prompt: 'About how many calls does fast power make for n = 1,000,000?',
      options: ['21', '1,000', '500,000', '1,000,000'],
      answer: 0,
      explanation: 'n halves each call: 1,000,000 → 500,000 → … → 1 → 0. That is 20 halvings plus the base case call, so 21 calls. log₂ of a million is about 20.',
    },
    {
      prompt: 'You write `return myPow(x, Math.floor(n / 2)) * myPow(x, Math.floor(n / 2)) * (n % 2 ? x : 1)`. What is the time?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(2ⁿ)'],
      answer: 1,
      explanation: 'Two calls on n / 2 per call: the tree has log₂ n levels but doubles every level, so the bottom level alone has about n calls. Save the half in a variable and call once.',
    },
    {
      prompt: 'In JS, why can `a * b % 1000000007` be wrong when `a` and `b` are both below 1000000007?',
      options: [
        'The `%` operator rounds down',
        'The product can reach about 10¹⁸, past 2⁵³, so its last digits get rounded away',
        'JS numbers cannot be bigger than 10⁹',
        'It is only wrong for negative numbers',
      ],
      answer: 1,
      explanation: 'JS numbers are exact only up to 2⁵³ ≈ 9 × 10¹⁵. A product near 10¹⁸ is rounded before `%` sees it. Multiply in BigInt instead.',
    },
  ],
  takeaways: [
    'Cost of a recursion = number of calls (count the tree level by level) × work per call. Memory = the height of the tree.',
    'Two calls on n - 1 doubles every level: O(2ⁿ). One call on n / 2 is a path of log₂ n levels: O(log n).',
    'Fast power: compute the half **once**, square it, multiply by x if n is odd.',
    'For mod 10⁹+7, take the mod after every multiply, and multiply in BigInt so JS does not round past 2⁵³.',
  ],
};

export default lesson;
