import type { Lesson } from '../types';

const blank = (filled: number[], total: number) => [...filled, ...Array<string>(total - filled.length).fill('')];

const lesson: Lesson = {
  id: 'counting-and-arithmetic',
  title: 'Counting bits and math without + or /',
  summary: "Reuse a smaller number's bit count, then add and divide using only bit moves.",
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How a chip adds',
      text: "Deep inside your phone's processor there is no magic `+`. An adder is a tiny circuit made of an XOR gate (the sum bit) and an AND gate (the carry bit). Old game consoles like the NES had no divide instruction at all, so games divided by shifting and subtracting. In this lesson you build both, and first you learn to count bits for a whole range of numbers at once.",
    },
    {
      kind: 'text',
      text: '**The problem.** A chart shows, for every number from 0 to `n`, how many 1 bits it has. For `n = 5` the answer is `[0, 1, 1, 2, 1, 2]` (0 = `0`, 1 = `1`, 2 = `10`, 3 = `11`, 4 = `100`, 5 = `101`).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: count each number from scratch',
      code: `function countBits(n):
    ans ← empty list
    for i from 0 to n:
        append countOnes(i) to ans     // the loop from lesson 1
    return ans`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** That is up to 32 steps per number. But look at 5 = `101` and 2 = `10`. The number 5 is just 2 with one extra bit stuck on the end. Every number `i` is `i >> 1` (itself without its last bit) plus that last bit. And we already counted `i >> 1`, because it is smaller than `i`.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'bits[i] = bits[i >> 1] + (i & 1)',
      text: '`i >> 1` drops the last bit, so it has the same 1s as `i` except maybe that last one. `i & 1` adds it back. Since `i >> 1` is smaller than `i`, its answer is already in the list when you reach `i`. Each number costs one step.',
    },
    {
      kind: 'steps',
      title: 'Filling bits[0..8]',
      frames: [
        { cells: blank([0], 9), found: [0], vars: { i: 0 }, note: '`bits[0] = 0`. Zero has no 1 bits.' },
        { cells: blank([0, 1], 9), pointers: { i: 1, half: 0 }, active: [1], vars: { i: '1 = 0001', 'i >> 1': 0, 'i & 1': 1 }, note: '`bits[1] = bits[0] + 1 = 1`.' },
        { cells: blank([0, 1, 1], 9), pointers: { i: 2, half: 1 }, active: [2], vars: { i: '2 = 0010', 'i >> 1': 1, 'i & 1': 0 }, note: '2 is 1 with a 0 added: `bits[2] = bits[1] + 0 = 1`.' },
        { cells: blank([0, 1, 1, 2], 9), pointers: { i: 3, half: 1 }, active: [3], vars: { i: '3 = 0011', 'i >> 1': 1, 'i & 1': 1 }, note: '3 is 1 with a 1 added: `bits[3] = bits[1] + 1 = 2`.' },
        { cells: blank([0, 1, 1, 2, 1], 9), pointers: { i: 4, half: 2 }, active: [4], vars: { i: '4 = 0100', 'i >> 1': 2, 'i & 1': 0 }, note: '`bits[4] = bits[2] + 0 = 1`.' },
        { cells: blank([0, 1, 1, 2, 1, 2], 9), pointers: { i: 5, half: 2 }, active: [5], vars: { i: '5 = 0101', 'i >> 1': 2, 'i & 1': 1 }, note: '`bits[5] = bits[2] + 1 = 2`.' },
        { cells: blank([0, 1, 1, 2, 1, 2, 2], 9), pointers: { i: 6, half: 3 }, active: [6], vars: { i: '6 = 0110', 'i >> 1': 3, 'i & 1': 0 }, note: '`bits[6] = bits[3] + 0 = 2`.' },
        { cells: blank([0, 1, 1, 2, 1, 2, 2, 3], 9), pointers: { i: 7, half: 3 }, active: [7], vars: { i: '7 = 0111', 'i >> 1': 3, 'i & 1': 1 }, note: '`bits[7] = bits[3] + 1 = 3`.' },
        { cells: [0, 1, 1, 2, 1, 2, 2, 3, 1], pointers: { i: 8, half: 4 }, active: [8], vars: { i: '8 = 1000', 'i >> 1': 4, 'i & 1': 0 }, note: '`bits[8] = bits[4] + 0 = 1`. Every answer came from one earlier answer.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `// i >> 1: i without its last bit      i AND 1: the last bit (0 or 1)
function countBits(n):
    bits ← list of n + 1 zeros
    for i from 1 to n:
        bits[i] ← bits[i >> 1] + (i AND 1)
    return bits`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}`,
    },
    {
      kind: 'compare',
      title: 'Bit counts for 0..n',
      rows: [
        { approach: 'Count each number with a loop', time: 'O(n · 32)', space: 'O(1) extra', note: 'Ignores everything you already worked out.' },
        { approach: 'bits[i >> 1] + (i & 1)', time: 'O(n)', space: 'O(1) extra', note: 'One step per number. This "reuse a smaller answer" idea is the heart of DP (modules 16-17).' },
        { approach: 'bits[i & (i − 1)] + 1', time: 'O(n)', space: 'O(1) extra', note: 'Same speed: `i & (i − 1)` is `i` with one fewer 1, and it is smaller than `i`.' },
      ],
    },
    {
      kind: 'text',
      text: "**Adding without `+`.** Add 5 + 3 the way a chip does. XOR gives the sum of each column *ignoring carries* (1 + 1 = 0 in that column). AND finds the columns where both bits are 1: those make a carry, which moves one column left (`<< 1`). Now you have a new pair to add: the partial sum and the carries. Repeat until there is no carry.",
    },
    {
      kind: 'trace',
      title: '5 + 3 with only XOR, AND and shift',
      columns: ['round', 'a', 'b (carry in)', 'a ^ b (sum, no carry)', '(a & b) << 1 (carry)'],
      rows: [
        [1, '0101 (5)', '0011 (3)', '0110 (6)', '0010 (2)'],
        [2, '0110 (6)', '0010 (2)', '0100 (4)', '0100 (4)'],
        [3, '0100 (4)', '0100 (4)', '0000 (0)', '1000 (8)'],
        [4, '0000 (0)', '1000 (8)', '1000 (8)', '0000 (0)'],
      ],
      note: 'The carry is 0 after round 4, so the answer is `1000` = 8. Each round, the next row uses the two right-hand columns as its new `a` and `b`.',
    },
    {
      kind: 'text',
      text: "**Dividing without `/`.** To find 43 ÷ 5, keep doubling 5 while it still fits: 5, 10, 20, 40. 40 is 5 × 8, so take away 40 and add 8 to the answer. 3 is left, which is less than 5, so stop: 43 ÷ 5 = 8. Doubling (instead of subtracting 5 again and again) means even 2³¹ ÷ 1 takes only about 31 × 31 steps instead of two billion.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: reuse a smaller number, or add with XOR + carry',
      code: `// Signals: "for every number 0..n", "without + / * /", "count bits in a range"
bits[i] ← bits[i >> 1] + (i AND 1)    // answer for i from answer for i/2

function add(a, b):                    // works for negatives in 32 bits
    while b ≠ 0:
        carry ← (a AND b) << 1
        a ← a XOR b
        b ← carry
    return a`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The one division that overflows',
      text: "32-bit integers go from −2147483648 to 2147483647. So `−2147483648 ÷ −1 = 2147483648` does not fit, and problems tell you to return 2147483647. Also, in JS, doubling with `b << 1` breaks once `b` passes 2³⁰. Double with `b + b` on normal numbers instead. And watch for `-0`: `-quotient` when quotient is 0 gives `-0`, which is not the same as `0`. Write `0 - quotient`.",
    },
  ],
  problems: [
    {
      id: 'bits-math-counting-bits',
      title: 'Counting bits',
      difficulty: 'easy',
      leetcode: 338,
      pattern: 'Reuse a smaller number',
      statement:
        'Build a lookup table for a chart: for every number `i` from 0 to `n`, store how many 1 bits `i` has. Return the list. Aim for one step per number.',
      examples: [
        { input: 'n = 2', output: '[0, 1, 1]' },
        { input: 'n = 5', output: '[0, 1, 1, 2, 1, 2]' },
      ],
      constraints: ['0 ≤ n ≤ 10⁵'],
      hints: [
        'Compare `i` with `i >> 1`. How are their bits related?',
        '`i >> 1` is `i` with the last bit removed, and it is smaller than `i`.',
        '`bits[i] = bits[i >> 1] + (i & 1)`.',
      ],
      approaches: [
        {
          name: 'Count each number',
          idea: 'Run the `n & (n - 1)` loop from lesson 1 on every number.',
          code: `function countBits(n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    let x = i;
    let c = 0;
    while (x) {
      x &= x - 1;
      c++;
    }
    out.push(c);
  }
  return out;
}`,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
        {
          name: 'Reuse i >> 1',
          idea: '`i` has the same bits as `i >> 1` plus its last bit. `i >> 1` is smaller, so its count is already in the table.',
          pseudo: `function countBits(n):
    bits ← list of n + 1 zeros
    for i from 1 to n:
        bits[i] ← bits[i >> 1] + (i AND 1)
    return bits`,
          code: `function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}`,
          time: 'O(n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'countBits',
      starter: `function countBits(n) {
  // bits[i] = number of 1 bits in i, for i = 0..n
  return [];
}`,
      solution: `function countBits(n) {
  const bits = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) bits[i] = bits[i >> 1] + (i & 1);
  return bits;
}`,
      tests: [
        { name: 'zero', args: [0], expected: [0] },
        { name: 'one', args: [1], expected: [0, 1] },
        { name: 'two', args: [2], expected: [0, 1, 1] },
        { name: 'five', args: [5], expected: [0, 1, 1, 2, 1, 2] },
        { name: 'power of two', args: [8], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1] },
        { name: 'sixteen', args: [16], expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1] },
      ],
      takeaway: '`bits[i] = bits[i >> 1] + (i & 1)`: build answers from smaller numbers you already solved.',
    },
    {
      id: 'bits-math-sum-of-two-integers',
      title: 'Sum of two integers',
      difficulty: 'medium',
      leetcode: 371,
      pattern: 'Add with XOR and carry',
      statement:
        'You are writing the adder for a toy CPU that only has bit operations. Return `a + b` **without** using `+` or `-`. The inputs can be negative.',
      examples: [
        { input: 'a = 1, b = 2', output: '3' },
        { input: 'a = 2, b = 3', output: '5' },
        { input: 'a = -1, b = 1', output: '0' },
      ],
      constraints: ['−1000 ≤ a, b ≤ 1000'],
      hints: [
        'Add two single bits: what is the sum bit, and when is there a carry?',
        'Sum bit = XOR. Carry = AND, and the carry moves one column left.',
        'Loop: `carry = (a & b) << 1; a = a ^ b; b = carry;` until `b` is 0.',
        'Negatives just work: JS bit operators wrap around in 32 bits, the same way a real chip does.',
      ],
      approaches: [
        {
          name: 'Count up one at a time',
          idea: 'Move `a` toward the answer one step at a time. It needs `+ 1`, which is the thing we are not allowed to use, and it is slow. It shows why we need a real adder.',
          time: 'O(|b|)',
          space: 'O(1)',
        },
        {
          name: 'XOR for sum, AND for carry',
          idea: 'XOR adds each column but forgets carries. `(a & b) << 1` is exactly the carries, moved to where they belong. Adding those two is the same problem with fewer carries each round, so it ends within 32 rounds.',
          pseudo: `// XOR: sum of each column without carry
// AND then << 1: the carries, moved one column left
function getSum(a, b):
    while b ≠ 0:
        carry ← (a AND b) << 1
        a ← a XOR b
        b ← carry
    return a`,
          code: `function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a ^= b;
    b = carry;
  }
  return a;
}`,
          time: 'O(32)',
          space: 'O(1)',
        },
      ],
      fn: 'getSum',
      starter: `function getSum(a, b) {
  // add a and b without + or -
  return 0;
}`,
      solution: `function getSum(a, b) {
  while (b !== 0) {
    const carry = (a & b) << 1;
    a ^= b;
    b = carry;
  }
  return a;
}`,
      tests: [
        { name: 'small', args: [1, 2], expected: 3 },
        { name: 'example', args: [2, 3], expected: 5 },
        { name: 'cancel out', args: [-1, 1], expected: 0 },
        { name: 'zeros', args: [0, 0], expected: 0 },
        { name: 'both negative', args: [-5, -7], expected: -12 },
        { name: 'opposites', args: [1000, -1000], expected: 0 },
        { name: 'negative result', args: [-1000, 999], expected: -1 },
        { name: 'long carry chain', args: [15, 17], expected: 32 },
        { name: 'largest', args: [1000, 1000], expected: 2000 },
      ],
      takeaway: 'a + b = (a XOR b) + ((a AND b) << 1). Repeat until the carry is 0.',
    },
    {
      id: 'bits-math-divide-two-integers',
      title: 'Divide two integers',
      difficulty: 'medium',
      leetcode: 29,
      pattern: 'Doubling',
      statement:
        "A tiny chip has no divide instruction. Return `dividend ÷ divisor`, rounded toward zero (drop the fraction, so `-7 ÷ 3 = -2`), **without** using `*`, `/` or `%`. Results must fit in 32 bits: if the true answer is above 2147483647, return 2147483647. If the answer is zero, return `0` (not `-0`).",
      examples: [
        { input: 'dividend = 10, divisor = 3', output: '3' },
        { input: 'dividend = 7, divisor = -3', output: '-2' },
        { input: 'dividend = -2147483648, divisor = -1', output: '2147483647', explain: 'The true answer 2147483648 does not fit.' },
      ],
      constraints: ['−2³¹ ≤ dividend, divisor ≤ 2³¹ − 1', 'divisor ≠ 0'],
      hints: [
        'Handle the one overflow case first, then work with positive numbers and fix the sign at the end.',
        'Subtracting the divisor once per step is too slow for 2³¹ ÷ 1.',
        'Double the divisor (`d + d`) while it still fits in what is left, and double a counter alongside it.',
        'Subtract the biggest doubled chunk, add its counter to the answer, and start doubling again from the divisor.',
      ],
      approaches: [
        {
          name: 'Subtract one divisor at a time',
          idea: 'Count how many times you can take away the divisor. Correct, but 2³¹ ÷ 1 needs two billion steps.',
          time: 'O(answer)',
          space: 'O(1)',
        },
        {
          name: 'Subtract doubled chunks',
          idea: 'Take away the biggest "divisor × 2ᵏ" that fits, and add 2ᵏ to the answer. Each chunk at least halves what is left, so there are about 31 chunks, each found in about 31 doublings.',
          pseudo: `function divide(dividend, divisor):
    if dividend = -2³¹ and divisor = -1:
        return 2³¹ - 1                    // the only overflow
    negative ← (dividend < 0) ≠ (divisor < 0)
    a ← |dividend|
    b ← |divisor|
    quotient ← 0
    while a ≥ b:
        chunk ← b
        times ← 1
        while chunk + chunk ≤ a:          // double while it still fits
            chunk ← chunk + chunk
            times ← times + times
        a ← a - chunk
        quotient ← quotient + times
    if negative:
        return 0 - quotient
    return quotient`,
          code: `function divide(dividend, divisor) {
  if (dividend === -2147483648 && divisor === -1) return 2147483647;
  const negative = (dividend < 0) !== (divisor < 0);
  let a = Math.abs(dividend);
  const b = Math.abs(divisor);
  let quotient = 0;
  while (a >= b) {
    let chunk = b;
    let times = 1;
    while (chunk + chunk <= a) {
      chunk += chunk;
      times += times;
    }
    a -= chunk;
    quotient += times;
  }
  return negative ? 0 - quotient : quotient;
}`,
          time: 'O(log² n)',
          space: 'O(1)',
        },
      ],
      fn: 'divide',
      starter: `function divide(dividend, divisor) {
  // dividend / divisor rounded toward zero, without * / %
  return 0;
}`,
      solution: `function divide(dividend, divisor) {
  if (dividend === -2147483648 && divisor === -1) return 2147483647;
  const negative = (dividend < 0) !== (divisor < 0);
  let a = Math.abs(dividend);
  const b = Math.abs(divisor);
  let quotient = 0;
  while (a >= b) {
    let chunk = b;
    let times = 1;
    while (chunk + chunk <= a) {
      chunk += chunk;
      times += times;
    }
    a -= chunk;
    quotient += times;
  }
  return negative ? 0 - quotient : quotient;
}`,
      tests: [
        { name: 'example', args: [10, 3], expected: 3 },
        { name: 'negative divisor', args: [7, -3], expected: -2 },
        { name: 'chunks', args: [43, 5], expected: 8 },
        { name: 'zero dividend', args: [0, -1], expected: 0 },
        { name: 'rounds to zero, negative', args: [1, -2], expected: 0 },
        { name: 'both negative', args: [-7, -7], expected: 1 },
        { name: 'overflow clamp', args: [-2147483648, -1], expected: 2147483647 },
        { name: '−2³¹ ÷ 1', args: [-2147483648, 1], expected: -2147483648 },
        { name: '2³¹ − 1 ÷ 1', args: [2147483647, 1], expected: 2147483647 },
        { name: '−2³¹ ÷ 2', args: [-2147483648, 2], expected: -1073741824 },
      ],
      takeaway: 'Replace repeated subtraction with doubling: chunks of divisor × 2ᵏ make it logarithmic.',
    },
    {
      id: 'bits-math-range-and',
      title: 'Bitwise AND of a range',
      difficulty: 'medium',
      leetcode: 201,
      pattern: 'Common prefix of bits',
      statement:
        'A security log gives every event an ID. You want the bits that are on in **every** ID from `left` to `right`, including both ends. Return `left & (left + 1) & … & right`. The range can be huge, so do not loop through it.',
      examples: [
        { input: 'left = 5, right = 7', output: '4', explain: '`101 & 110 & 111 = 100`.' },
        { input: 'left = 0, right = 0', output: '0' },
        { input: 'left = 1, right = 2147483647', output: '0' },
      ],
      constraints: ['0 ≤ left ≤ right ≤ 2³¹ − 1'],
      hints: [
        'Write 26 to 30 in binary under each other. Which bits never change?',
        'Any bit that flips even once inside the range ends up 0 after AND.',
        'Only the shared left part (the common prefix) of `left` and `right` survives. Everything after it becomes 0.',
        'Shift both right until they are equal, count the shifts, then shift back. Or: while `right > left`, do `right &= right - 1`.',
      ],
      approaches: [
        {
          name: 'AND every number',
          idea: 'Loop from `left` to `right`. Correct, but up to two billion steps. (You can stop early once the result is 0.)',
          time: 'O(right − left)',
          space: 'O(1)',
        },
        {
          name: 'Keep the common prefix',
          idea: 'Counting from `left` to `right`, every bit below the first place they differ flips at least once, so it ANDs to 0. Bits above that place never change. So the answer is their shared prefix followed by zeros.',
          pseudo: `function rangeBitwiseAnd(left, right):
    shift ← 0
    while left ≠ right:
        left ← left >> 1
        right ← right >> 1
        shift ← shift + 1
    return left << shift            // put the zeros back`,
          code: `function rangeBitwiseAnd(left, right) {
  let shift = 0;
  while (left !== right) {
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left << shift;
}`,
          time: 'O(32)',
          space: 'O(1)',
        },
      ],
      fn: 'rangeBitwiseAnd',
      starter: `function rangeBitwiseAnd(left, right) {
  // AND of every number from left to right
  return 0;
}`,
      solution: `function rangeBitwiseAnd(left, right) {
  let shift = 0;
  while (left !== right) {
    left >>= 1;
    right >>= 1;
    shift++;
  }
  return left << shift;
}`,
      tests: [
        { name: 'example', args: [5, 7], expected: 4 },
        { name: 'zero', args: [0, 0], expected: 0 },
        { name: 'single number', args: [6, 6], expected: 6 },
        { name: 'huge range', args: [1, 2147483647], expected: 0 },
        { name: 'shared prefix 11', args: [26, 30], expected: 24 },
        { name: 'same top bits', args: [12, 15], expected: 12 },
        { name: 'crosses a power of two', args: [8, 16], expected: 0 },
        { name: 'top of 32-bit range', args: [2147483646, 2147483647], expected: 2147483646 },
      ],
      takeaway: 'The AND of a range keeps only the common binary prefix of its two ends.',
    },
  ],
  quiz: [
    {
      prompt: 'You already have `bits[6] = 2`. What is `bits[13]`? (13 = `1101`)',
      options: ['2', '3', '4', '1'],
      answer: 1,
      explanation: '`13 >> 1 = 6` and `13 & 1 = 1`, so `bits[13] = bits[6] + 1 = 3`.',
    },
    {
      prompt: 'Adding 6 + 3 with bits: what are `6 ^ 3` and `(6 & 3) << 1`?',
      options: ['5 and 4', '9 and 0', '5 and 2', '3 and 6'],
      answer: 0,
      explanation: '`110 ^ 011 = 101` = 5. `110 & 011 = 010`, shifted left = `100` = 4. Then 5 + 4 continues the loop and gives 9.',
    },
    {
      prompt: 'Why does Divide two integers need a special case for −2147483648 ÷ −1?',
      options: [
        'Dividing by −1 is not allowed',
        'The answer 2147483648 is one more than the biggest 32-bit integer',
        'Negative numbers cannot be divided',
        'It does not need one',
      ],
      answer: 1,
      explanation: '32-bit integers stop at 2147483647, so the problem says to return that instead.',
    },
  ],
  takeaways: [
    '`bits[i] = bits[i >> 1] + (i & 1)`: reuse the answer of a smaller number.',
    'XOR is addition without carries; `(a & b) << 1` is the carries. Loop until the carry is 0.',
    'Doubling turns "subtract many times" into about log n steps.',
    'Watch the 32-bit edges: clamp −2³¹ ÷ −1, double with `+` not `<<`, and avoid returning `-0`.',
  ],
};

export default lesson;
