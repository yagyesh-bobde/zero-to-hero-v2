import type { Module } from '../types';
import lesson1 from './18-bits-math.lesson-1';
import lesson2 from './18-bits-math.lesson-2';
import lesson3 from './18-bits-math.lesson-3';
import lesson4 from './18-bits-math.lesson-4';
import lesson5 from './18-bits-math.lesson-5';

const mod: Module = {
  id: "bits-math",
  number: 18,
  part: "mastery",
  title: "Bit manipulation & math tricks",
  tagline: "XOR magic, masks, and the number tricks interviews love.",
  draft: false,
  intro:
    'Every number in your computer is a row of on/off switches. This module teaches you to read and flip those switches directly: XOR tricks that find the odd one out with no extra memory, masks that hold a whole set inside one number, and the math toolkit (gcd, the prime sieve, modulo) behind every "return it mod 10⁹ + 7" problem. After it, `&`, `|`, `^` and `>>>` stop looking like noise, and you can solve the bit and math mediums on LeetCode on your own.',
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
  patterns: [
    {
      name: 'Walk the bits',
      signals: [
        '"binary representation", "1 bits", "set bits", "flip bits"',
        'Each bit position can be decided on its own',
        'Inputs are 32-bit integers and you need O(1) extra memory',
        'Others appear k times: count each bit position mod k',
      ],
      template: `for i from 0 to 31:
    bit ← (n >> i) AND 1           // 0 or 1
    // use bit i
// visit only the 1 bits:
while n ≠ 0:
    n ← n AND (n - 1)              // erase the rightmost 1
// reuse a smaller number:
bits[i] ← bits[i >> 1] + (i AND 1)`,
      examples: [
        'bits-math-number-of-1-bits',
        'bits-math-power-of-two',
        'bits-math-reverse-bits',
        'bits-math-min-flips-or',
        'bits-math-single-number-ii',
        'bits-math-counting-bits',
        'bits-math-range-and',
      ],
    },
    {
      name: 'XOR cancel',
      signals: [
        '"every element appears twice except one"',
        '"find the missing / extra number"',
        'O(n) time and O(1) extra memory',
        'Two answers: XOR gives a ^ b, then split by one differing bit',
      ],
      template: `acc ← 0
for each x in items:
    acc ← acc XOR x       // pairs cancel: x XOR x = 0
return acc               // what appeared an odd number of times`,
      examples: ['bits-math-single-number', 'bits-math-missing-number', 'bits-math-single-number-iii'],
    },
    {
      name: 'Bitmask as a set',
      signals: [
        'n ≤ 20 and "every subset / combination"',
        '"unique characters", "no common letters"',
        'Small sets of on/off states (permissions, toppings, visited)',
      ],
      template: `for mask from 0 to (1 << n) - 1:      // every subset
    for i from 0 to n - 1:
        if (mask >> i) AND 1 = 1:     // item i is in
            use items[i]
// letters: m ← m OR (1 << (ch - 'a'))
// disjoint: (a AND b) = 0     union: a OR b`,
      examples: ['bits-math-count-max-or-subsets', 'bits-math-max-product-word-lengths', 'bits-math-max-unique-concat'],
    },
    {
      name: 'Math toolkit',
      signals: [
        '"divides evenly", "largest equal pieces", "simplify"',
        '"count primes below n"',
        '"return the answer mod 10⁹ + 7"',
        '"without using * / or +": build it from doubling, XOR and carries',
      ],
      template: `function gcd(a, b):
    while b ≠ 0:
        (a, b) ← (b, a mod b)
    return a
// sieve: for each prime p with p × p < n, cross out p × p, p × p + p, …
// modulo: total ← (total × x + y) mod MOD after every step`,
      examples: [
        'bits-math-find-gcd-of-array',
        'bits-math-count-primes',
        'bits-math-factorial-trailing-zeroes',
        'bits-math-concatenated-binary',
        'bits-math-sum-of-two-integers',
        'bits-math-divide-two-integers',
      ],
    },
  ],
  practice: [
    { title: 'Hamming Distance', leetcode: 461, difficulty: 'easy', hint: 'Which operator marks exactly the bits where two numbers differ?' },
    { title: 'Find the Difference', leetcode: 389, difficulty: 'easy', hint: 'Letters are numbers too. What cancels when you XOR both strings?' },
    { title: 'Sort Integers by The Number of 1 Bits', leetcode: 1356, difficulty: 'easy', hint: 'Sort with a comparator that looks at the bit count first.' },
    { title: 'Greatest Common Divisor of Strings', leetcode: 1071, difficulty: 'easy', hint: 'First check `a + b === b + a`. If it holds, how long must the shared piece be?' },
    { title: 'Total Hamming Distance', leetcode: 477, difficulty: 'medium', hint: 'For each bit, count numbers with it on (k) and off (n − k). That bit adds k × (n − k).' },
    { title: 'Find The Original Array of Prefix Xor', leetcode: 2433, difficulty: 'medium', hint: 'XOR undoes itself: two neighbors in the prefix list give you one original value.' },
    { title: 'XOR Queries of a Subarray', leetcode: 1310, difficulty: 'medium', hint: 'Prefix XOR works like prefix sums, and XOR is its own "minus".' },
    { title: 'Largest Combination With Bitwise AND Greater Than Zero', leetcode: 2275, difficulty: 'medium', hint: 'An AND is non-zero if one bit is on in every chosen number. Check each bit position.' },
    { title: 'Number of Wonderful Substrings', leetcode: 1915, difficulty: 'medium', hint: 'Track which letters have appeared an odd number of times as a 10-bit mask of the prefix.' },
    { title: 'Reverse Integer', leetcode: 7, difficulty: 'medium', hint: 'Build the reversed number digit by digit and check the 32-bit range before returning.' },
    { title: 'Number of Valid Words for Each Puzzle (stretch)', leetcode: 1178, difficulty: 'hard', hint: 'Count word masks in a map, then loop over the submasks of each puzzle with `sub = (sub - 1) & mask`.' },
  ],
};

export default mod;
