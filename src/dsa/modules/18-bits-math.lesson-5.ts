import type { Lesson } from '../types';

const upTo16 = Array.from({ length: 16 }, (_, i) => i);

const lesson: Lesson = {
  id: 'number-tricks',
  title: 'Number tricks: gcd, primes and modulo',
  summary: "Euclid's gcd, the sieve of Eratosthenes, and how to survive \"return it mod 10⁹ + 7\".",
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Cutting chocolate with no waste',
      text: 'A chocolate factory has sheets 48 cm long and 18 cm wide. It wants to cut each sheet into equal squares with nothing left over, and the squares should be as big as possible. The answer is the **greatest common divisor** (gcd): the biggest number that divides both 48 and 18. It is 6. The same idea keeps fractions simple (`18/48 = 3/8`) and lines up repeating schedules.',
    },
    {
      kind: 'text',
      text: '**The problem.** Given a list of numbers, return the gcd of the smallest and the largest one. For `[2, 5, 6, 9, 10]` that is gcd(2, 10) = 2. The real work is computing gcd(a, b) fast, even for numbers near a billion.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every size',
      code: `function gcd(a, b):
    for d from min(a, b) down to 1:
        if a mod d = 0 and b mod d = 0:   // mod: the remainder after dividing
            return d`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** For gcd(1000000000, 999999999) this tries almost a billion sizes before it reaches 1. We test sizes that could never work. Think about the chocolate instead: cut as many 18 × 18 squares off the 48-long sheet as you can. Any square that tiles both 48 and 18 must also tile the 12 cm strip that is left over.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: "Euclid's rule: gcd(a, b) = gcd(b, a mod b)",
      text: '`a mod b` is the leftover strip after cutting b-sized pieces off a. It has the same common divisors as before, but the numbers shrink fast (at least by half every two steps). When the leftover is 0, the last size you cut with is the gcd. This rule is about 2300 years old.',
    },
    {
      kind: 'trace',
      title: 'gcd(48, 18)',
      columns: ['a', 'b', 'a mod b', 'next pair'],
      rows: [
        [48, 18, 12, '(18, 12)'],
        [18, 12, 6, '(12, 6)'],
        [12, 6, 0, '(6, 0)'],
        [6, 0, '-', 'b is 0: answer 6'],
      ],
      note: 'Three steps instead of trying 18 sizes. For numbers near a billion it takes about 45 steps at most.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function gcd(a, b):
    while b ≠ 0:
        (a, b) ← (b, a mod b)
    return a`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

gcd(48, 18); // 6
// lcm (least common multiple): a / gcd(a, b) * b   (divide first to stay small)`,
    },
    {
      kind: 'text',
      text: '**Primes, fast.** A prime is a number above 1 that only divides by 1 and itself. Counting the primes below `n` by testing each number on its own costs about n·√n steps. The waste: once you know 2 is prime, you already know 4, 6, 8, … are not. The **sieve of Eratosthenes** crosses out all multiples of each prime in one sweep, and whatever is never crossed out is prime.',
    },
    {
      kind: 'steps',
      title: 'Sieve: primes below 16',
      frames: [
        { cells: upTo16, done: [0, 1], note: '0 and 1 are not prime. Every other number starts as "maybe prime".' },
        {
          cells: upTo16,
          pointers: { p: 2 },
          found: [2],
          active: [4, 6, 8, 10, 12, 14],
          done: [0, 1],
          note: '2 was never crossed out, so it is prime. Cross out its multiples, starting at 2 × 2 = 4.',
        },
        {
          cells: upTo16,
          pointers: { p: 3 },
          found: [2, 3],
          active: [9, 12, 15],
          done: [0, 1, 4, 6, 8, 10, 14],
          note: '3 is prime. Start at 3 × 3 = 9: smaller multiples like 6 have a smaller factor (2), so they are already gone.',
        },
        {
          cells: upTo16,
          pointers: { p: 4 },
          found: [2, 3],
          done: [0, 1, 4, 6, 8, 9, 10, 12, 14, 15],
          note: 'p = 4: 4 × 4 = 16 is past the end, so stop. Any non-prime below 16 has a factor ≤ 3, and those are all crossed out.',
        },
        {
          cells: upTo16,
          found: [2, 3, 5, 7, 11, 13],
          done: [0, 1, 4, 6, 8, 9, 10, 12, 14, 15],
          vars: { primes: 6 },
          note: 'Whatever is left is prime: 2, 3, 5, 7, 11, 13. Six primes below 16.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function countPrimes(n):                 // primes strictly below n
    if n < 3:
        return 0
    isPrime ← list of n values, all true
    isPrime[0] ← false
    isPrime[1] ← false
    p ← 2
    while p × p < n:
        if isPrime[p]:
            for m from p × p to n - 1, step p:
                isPrime[m] ← false            // cross out multiples
        p ← p + 1
    return how many isPrime values are true`,
    },
    {
      kind: 'text',
      text: '**Modulo.** Many counting problems end with "return the answer mod 10⁹ + 7". The true answer is astronomically big, so they ask for the remainder. You never compute the giant number: take `% MOD` after **every** add or multiply. That is allowed because remainders survive arithmetic: `(a + b) % m = ((a % m) + (b % m)) % m`, and the same for `×`. (Fast power with modulo is taught in module 8.)',
    },
    {
      kind: 'table',
      title: 'Modulo in JavaScript: what goes wrong',
      head: ['code', 'result', 'what happened'],
      rows: [
        ['`123456789 * 987654321`', '`121932631112635260`', 'true value ends in …269. Above 2⁵³ JS numbers lose their last digits'],
        ['`(123456789 * 987654321) % 1000000007`', '`259106854`', 'wrong, because the product was already wrong'],
        ['`Number(123456789n * 987654321n % 1000000007n)`', '`259106859`', 'correct: BigInt (the `n` suffix) keeps every digit'],
        ['`-7 % 3`', '`-1`', 'JS keeps the sign of the left side'],
        ['`((-7 % 3) + 3) % 3`', '`2`', 'always lands in 0 … m − 1'],
      ],
    },
    {
      kind: 'compare',
      title: 'Number tricks',
      rows: [
        { approach: 'gcd: try every d', time: 'O(min(a, b))', space: 'O(1)', note: 'A billion steps for big inputs.' },
        { approach: 'gcd: Euclid', time: 'O(log min(a, b))', space: 'O(1)', note: 'The numbers shrink by half every two steps.' },
        { approach: 'primes: test each number', time: 'O(n√n)', space: 'O(1)', note: 'Divide each k by 2 … √k.' },
        { approach: 'primes: sieve', time: 'O(n log log n)', space: 'O(n)', note: 'Basically linear. Trades memory for speed.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: the math toolkit',
      code: `// Signals: "divides evenly", "largest equal parts", "simplify",
// "count primes", "mod 10⁹ + 7", "the answer may be very large"
function gcd(a, b):
    while b ≠ 0:
        (a, b) ← (b, a mod b)
    return a
// lcm(a, b) = a / gcd(a, b) × b

// sieve: for each prime p with p × p < n,
//        cross out p × p, p × p + p, p × p + 2p, …

MOD ← 10⁹ + 7
total ← (total + x) mod MOD               // after EVERY step
total ← (total × x) mod MOD               // keep total × x below 2⁵³`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Multiplying two big remainders',
      text: 'Two numbers below 10⁹ + 7 multiply to about 10¹⁸, far above 2⁵³ (about 9 × 10¹⁵). JS will not warn you, it just returns a slightly wrong number. Before you multiply, check that the product stays below 2⁵³; if it might not, use BigInt for that one step. Never use `<<` to multiply in mod problems: it chops to 32 bits.',
    },
  ],
  problems: [
    {
      id: 'bits-math-find-gcd-of-array',
      title: 'GCD of the smallest and largest',
      difficulty: 'easy',
      leetcode: 1979,
      pattern: 'Math toolkit',
      statement:
        'A tile shop lists the lengths of its wooden boards in `nums`. It wants to cut the shortest and the longest board into equal pieces with nothing left over, using the biggest piece size possible. Return that size: the gcd of the smallest and largest number in `nums`.',
      examples: [
        { input: 'nums = [2, 5, 6, 9, 10]', output: '2', explain: 'gcd(2, 10) = 2.' },
        { input: 'nums = [7, 5, 6, 8, 3]', output: '1', explain: 'gcd(3, 8) = 1.' },
        { input: 'nums = [3, 3]', output: '3' },
      ],
      constraints: ['2 ≤ n ≤ 1000', '1 ≤ nums[i] ≤ 1000'],
      hints: [
        'Find the smallest and largest values first.',
        'gcd(a, b) = gcd(b, a mod b), and gcd(a, 0) = a.',
      ],
      approaches: [
        {
          name: 'Try every size',
          idea: 'Count down from the smallest value and return the first size that divides both.',
          code: `function findGCD(nums) {
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  for (let d = lo; d >= 1; d--) if (lo % d === 0 && hi % d === 0) return d;
}`,
          time: 'O(n + min)',
          space: 'O(1)',
        },
        {
          name: 'Euclid',
          idea: 'Replace (a, b) with (b, a mod b) until b is 0. The leftover always shares the same divisors, and the numbers shrink fast.',
          pseudo: `function findGCD(nums):
    a ← smallest value in nums
    b ← largest value in nums
    while b ≠ 0:
        (a, b) ← (b, a mod b)
    return a`,
          code: `function findGCD(nums) {
  let a = Math.min(...nums);
  let b = Math.max(...nums);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}`,
          time: 'O(n + log max)',
          space: 'O(1)',
        },
      ],
      fn: 'findGCD',
      starter: `function findGCD(nums) {
  // gcd of the smallest and largest value
  return 1;
}`,
      solution: `function findGCD(nums) {
  let a = Math.min(...nums);
  let b = Math.max(...nums);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}`,
      tests: [
        { name: 'example 1', args: [[2, 5, 6, 9, 10]], expected: 2 },
        { name: 'coprime', args: [[7, 5, 6, 8, 3]], expected: 1 },
        { name: 'equal', args: [[3, 3]], expected: 3 },
        { name: 'middle ignored', args: [[12, 18, 30]], expected: 6 },
        { name: 'contains 1', args: [[1, 1000]], expected: 1 },
        { name: 'min divides max', args: [[8, 4, 12]], expected: 4 },
        { name: 'big values', args: [[1000, 500, 750]], expected: 500 },
      ],
      takeaway: 'gcd(a, b) = gcd(b, a mod b): logarithmic, and the base of lcm and fraction problems.',
    },
    {
      id: 'bits-math-count-primes',
      title: 'Count primes',
      difficulty: 'medium',
      leetcode: 204,
      pattern: 'Math toolkit',
      statement:
        'A puzzle game needs to know how many prime numbers are **strictly less than** `n` (a prime is above 1 and divides only by 1 and itself). Return that count.',
      examples: [
        { input: 'n = 10', output: '4', explain: '2, 3, 5, 7.' },
        { input: 'n = 0', output: '0' },
        { input: 'n = 1', output: '0' },
      ],
      constraints: ['0 ≤ n ≤ 5·10⁶'],
      hints: [
        'Testing each number on its own repeats a lot of work.',
        'If p is prime, then 2p, 3p, 4p, … are not. Cross them out in one go.',
        'Start crossing at p × p (smaller multiples were already crossed by smaller primes), and stop once p × p ≥ n.',
      ],
      approaches: [
        {
          name: 'Test each number',
          idea: 'For each k from 2 to n − 1, try dividing by 2 … √k. If nothing divides it, it is prime. Only up to √k because a factor above √k pairs with one below it.',
          code: `function countPrimes(n) {
  let count = 0;
  for (let k = 2; k < n; k++) {
    let prime = true;
    for (let d = 2; d * d <= k; d++) {
      if (k % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) count++;
  }
  return count;
}`,
          time: 'O(n√n)',
          space: 'O(1)',
        },
        {
          name: 'Sieve of Eratosthenes',
          idea: 'Assume everything is prime, then for each prime p cross out p×p, p×p + p, … Every non-prime gets crossed out by its smallest prime factor, so what is left is exactly the primes.',
          pseudo: `function countPrimes(n):
    if n < 3:
        return 0
    isPrime ← list of n values, all true
    isPrime[0] ← false
    isPrime[1] ← false
    p ← 2
    while p × p < n:
        if isPrime[p]:
            for m from p × p to n - 1, step p:
                isPrime[m] ← false
        p ← p + 1
    return how many isPrime values are true`,
          code: `function countPrimes(n) {
  if (n < 3) return 0;
  const isPrime = new Uint8Array(n).fill(1);
  isPrime[0] = isPrime[1] = 0;
  for (let p = 2; p * p < n; p++) {
    if (!isPrime[p]) continue;
    for (let m = p * p; m < n; m += p) isPrime[m] = 0;
  }
  let count = 0;
  for (let i = 2; i < n; i++) count += isPrime[i];
  return count;
}`,
          time: 'O(n log log n)',
          space: 'O(n)',
        },
      ],
      fn: 'countPrimes',
      starter: `function countPrimes(n) {
  // how many primes are < n?
  return 0;
}`,
      solution: `function countPrimes(n) {
  if (n < 3) return 0;
  const isPrime = new Uint8Array(n).fill(1);
  isPrime[0] = isPrime[1] = 0;
  for (let p = 2; p * p < n; p++) {
    if (!isPrime[p]) continue;
    for (let m = p * p; m < n; m += p) isPrime[m] = 0;
  }
  let count = 0;
  for (let i = 2; i < n; i++) count += isPrime[i];
  return count;
}`,
      tests: [
        { name: 'example', args: [10], expected: 4 },
        { name: 'zero', args: [0], expected: 0 },
        { name: 'one', args: [1], expected: 0 },
        { name: 'two (strictly less)', args: [2], expected: 0 },
        { name: 'three', args: [3], expected: 1 },
        { name: 'n is a square', args: [25], expected: 9 },
        { name: 'hundred', args: [100], expected: 25 },
        { name: 'thousand', args: [1000], expected: 168 },
        { name: 'hundred thousand', args: [100000], expected: 9592 },
      ],
      takeaway: 'Sieve: cross out multiples from p × p; stop when p × p ≥ n. Memory buys speed.',
    },
    {
      id: 'bits-math-factorial-trailing-zeroes',
      title: 'Factorial trailing zeroes',
      difficulty: 'medium',
      leetcode: 172,
      pattern: 'Math toolkit',
      statement:
        'n! (n factorial) is 1 × 2 × 3 × … × n. For example 10! = 3628800, which ends in 2 zeros. Return how many zeros `n!` ends with, without computing `n!` (it gets huge very fast).',
      examples: [
        { input: 'n = 5', output: '1', explain: '5! = 120.' },
        { input: 'n = 10', output: '2', explain: '10! = 3628800.' },
        { input: 'n = 0', output: '0', explain: '0! = 1.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴'],
      hints: [
        'Each trailing zero comes from a factor 10 = 2 × 5.',
        'There are always more 2s than 5s among 1 … n, so just count the 5s.',
        'Multiples of 5 give one 5, multiples of 25 give an extra one, multiples of 125 another… Add n/5 + n/25 + n/125 + … (rounded down).',
      ],
      approaches: [
        {
          name: 'Count the 5s in each number',
          idea: 'For every i from 1 to n, divide by 5 while you can and add up how many times. Correct, but walks all n numbers.',
          code: `function trailingZeroes(n) {
  let count = 0;
  for (let i = 5; i <= n; i += 5) {
    let x = i;
    while (x % 5 === 0) {
      count++;
      x /= 5;
    }
  }
  return count;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Divide by powers of 5',
          idea: '`floor(n / 5)` numbers give at least one 5, `floor(n / 25)` give a second one, and so on. Dividing n by 5 again and again adds up all those layers.',
          pseudo: `function trailingZeroes(n):
    count ← 0
    while n ≥ 5:
        n ← floor(n / 5)
        count ← count + n
    return count`,
          code: `function trailingZeroes(n) {
  let count = 0;
  while (n >= 5) {
    n = Math.floor(n / 5);
    count += n;
  }
  return count;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'trailingZeroes',
      starter: `function trailingZeroes(n) {
  // number of zeros at the end of n!
  return 0;
}`,
      solution: `function trailingZeroes(n) {
  let count = 0;
  while (n >= 5) {
    n = Math.floor(n / 5);
    count += n;
  }
  return count;
}`,
      tests: [
        { name: 'zero', args: [0], expected: 0 },
        { name: 'below five', args: [3], expected: 0 },
        { name: 'five', args: [5], expected: 1 },
        { name: 'ten', args: [10], expected: 2 },
        { name: '25 adds an extra 5', args: [25], expected: 6 },
        { name: 'thirty', args: [30], expected: 7 },
        { name: '125 adds two extra', args: [125], expected: 31 },
        { name: 'ten thousand', args: [10000], expected: 2499 },
      ],
      takeaway: 'Count the limiting factor (5s, not 10s), and count layers with n/5 + n/25 + …',
    },
    {
      id: 'bits-math-concatenated-binary',
      title: 'Concatenate binary numbers (mod 10⁹ + 7)',
      difficulty: 'medium',
      leetcode: 1680,
      pattern: 'Math toolkit',
      statement:
        'A logger writes 1, 2, 3, …, n in binary, one right after another, into one long bit string. For n = 3 that is `1` + `10` + `11` = `11011`, which is 27. Return the value of the whole string mod 1 000 000 007.',
      examples: [
        { input: 'n = 1', output: '1' },
        { input: 'n = 3', output: '27', explain: '`11011` = 27.' },
        { input: 'n = 12', output: '505379714', explain: 'The bit string is 37 bits long (a number above 10¹¹), so only its remainder is returned.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵'],
      hints: [
        'Gluing the bits of `i` onto the end of `value` means: shift `value` left by the bit length of `i`, then add `i`.',
        'Shifting left by `len` is multiplying by 2^len. Take `% MOD` after each step.',
        'The bit length grows by 1 exactly when `i` is a power of two, which is `(i & (i - 1)) === 0` from lesson 1.',
        'Do not use `<<` on `value`: it chops to 32 bits. `value * 2 ** len` stays below 2⁵³ here because value < 2³⁰ and len ≤ 17.',
      ],
      approaches: [
        {
          name: 'Build the string, then BigInt',
          idea: 'Join all binary strings and convert once with `BigInt("0b" + s) % MOD`. Correct, but the string has about 1.5 million characters for n = 10⁵ and the BigInt is huge.',
          code: `function concatenatedBinary(n) {
  let s = '';
  for (let i = 1; i <= n; i++) s += i.toString(2);
  return Number(BigInt('0b' + s) % 1000000007n);
}`,
          time: 'O(n log n) with a huge number',
          space: 'O(n log n)',
        },
        {
          name: 'Running value mod M',
          idea: 'Keep only the remainder of the value so far. Appending `i` is `value × 2^len + i`, and remainders survive multiply and add, so taking `% MOD` each step gives the same final remainder.',
          pseudo: `function concatenatedBinary(n):
    MOD ← 10⁹ + 7
    value ← 0
    len ← 0                               // bit length of i
    for i from 1 to n:
        if i AND (i - 1) = 0:             // i is a power of two
            len ← len + 1
        value ← (value × 2^len + i) mod MOD
    return value`,
          code: `function concatenatedBinary(n) {
  const MOD = 1000000007;
  let value = 0;
  let len = 0;
  for (let i = 1; i <= n; i++) {
    if ((i & (i - 1)) === 0) len++;
    value = (value * 2 ** len + i) % MOD;
  }
  return value;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'concatenatedBinary',
      starter: `function concatenatedBinary(n) {
  // value of "1" + "10" + "11" + ... (binary of 1..n), mod 1e9+7
  return 0;
}`,
      solution: `function concatenatedBinary(n) {
  const MOD = 1000000007;
  let value = 0;
  let len = 0;
  for (let i = 1; i <= n; i++) {
    if ((i & (i - 1)) === 0) len++;
    value = (value * 2 ** len + i) % MOD;
  }
  return value;
}`,
      tests: [
        { name: 'one', args: [1], expected: 1 },
        { name: 'two: 110', args: [2], expected: 6 },
        { name: 'three: 11011', args: [3], expected: 27 },
        { name: 'four: 11011100', args: [4], expected: 220 },
        { name: 'five', args: [5], expected: 1765 },
        { name: 'twelve (needs mod)', args: [12], expected: 505379714 },
        { name: 'largest', args: [100000], expected: 757631812 },
      ],
      takeaway: 'Take the remainder after every step, and make sure each product stays below 2⁵³.',
    },
  ],
  quiz: [
    {
      prompt: 'Using gcd(a, b) = gcd(b, a mod b), what pair comes after (35, 15)?',
      options: ['(15, 20)', '(15, 5)', '(5, 0)', '(20, 15)'],
      answer: 1,
      explanation: '35 mod 15 = 5, so the next pair is (15, 5). Then (5, 0), so gcd = 5.',
    },
    {
      prompt: 'In the sieve, why can you start crossing out multiples of p at p × p?',
      options: [
        'Smaller multiples like 2p or 3p were already crossed out by smaller primes',
        'p × p is always prime',
        'It is just a guess that works',
        'Multiples below p × p are prime',
      ],
      answer: 0,
      explanation: 'k × p with k < p has the smaller factor k, so a smaller prime already crossed it out.',
    },
    {
      prompt: 'Why can `(a * b) % 1000000007` be wrong in JS when a and b are near 10⁹?',
      options: [
        '`%` does not work on big numbers',
        'The product (about 10¹⁸) is above 2⁵³, so JS rounds it before `%` runs',
        'JS numbers are 32-bit',
        'It is never wrong',
      ],
      answer: 1,
      explanation: 'Numbers above 2⁵³ lose their last digits. Use BigInt for that multiply.',
    },
  ],
  takeaways: [
    "Euclid: gcd(a, b) = gcd(b, a mod b). lcm = a / gcd × b.",
    'Sieve: for each prime p, cross out from p × p; stop when p × p ≥ n.',
    'With "mod 10⁹ + 7", take `% MOD` after every step and keep products below 2⁵³ (or use BigInt).',
    'In JS, `-7 % 3` is `-1`. Use `((x % m) + m) % m` for a non-negative remainder.',
  ],
};

export default lesson;
