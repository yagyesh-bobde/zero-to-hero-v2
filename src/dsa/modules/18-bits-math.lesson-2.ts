import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'xor-tricks',
  title: 'XOR: the cancel button',
  summary: 'x ^ x = 0 and x ^ 0 = x. Pairs cancel, so the odd one out is left standing.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The disk that rebuilds itself',
      text: "Many servers use RAID 5: data sits on disks A and B, and a third disk P stores `A ^ B`. When disk B dies, the server rebuilds it as `A ^ P`, bit for bit. No copy of B was ever kept. It works because XOR-ing the same thing twice cancels out: `A ^ P = A ^ A ^ B = B`. That one rule solves a whole family of interview problems.",
    },
    {
      kind: 'text',
      text: '**The problem.** After laundry you dump all the socks in a pile. Every sock has a twin except one. Each sock has a number. Given `[4, 1, 2, 1, 2]`, find the lonely sock: `4`. The catch: do it in one pass with O(1) extra memory.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: count every number',
      code: `function singleNumber(nums):
    counts ← empty map                 // number → how many times seen
    for each x in nums:
        counts[x] ← counts[x] + 1      // missing keys start at 0
    for each (x, c) in counts:
        if c = 1:
            return x`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** This is O(n) time, which is great, but the map holds about n/2 entries just to find one number. We store a count for every sock, yet all we care about is which one has no partner. We need something that *forgets* a number when it sees it the second time.",
    },
    {
      kind: 'table',
      title: 'The XOR rules (^ means XOR: 1 where the bits differ)',
      head: ['rule', 'example', 'in words'],
      rows: [
        ['`x ^ x = 0`', '`5 ^ 5 = 0`', 'a number cancels itself'],
        ['`x ^ 0 = x`', '`5 ^ 0 = 5`', 'XOR with 0 changes nothing'],
        ['`a ^ b = b ^ a`', '`3 ^ 5 = 5 ^ 3`', 'order does not matter'],
        ['`(a ^ b) ^ c = a ^ (b ^ c)`', '', 'grouping does not matter either'],
      ],
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'XOR everything together',
      text: "Because order does not matter, XOR-ing the whole list is the same as lining up the twins next to each other: `(1 ^ 1) ^ (2 ^ 2) ^ 4 = 0 ^ 0 ^ 4 = 4`. Every pair becomes 0, and 0 changes nothing. Only the lonely number is left. One variable, one pass.",
    },
    {
      kind: 'steps',
      title: 'XOR-ing [4, 1, 2, 1, 2]',
      frames: [
        { cells: [4, 1, 2, 1, 2], pointers: { i: 0 }, active: [0], vars: { acc: '0 = 000' }, note: 'Start with `acc = 0`. Nothing has been seen yet.' },
        { cells: [4, 1, 2, 1, 2], pointers: { i: 0 }, active: [0], vars: { acc: '4 = 100' }, note: '`000 ^ 100 = 100`. acc = 4.' },
        { cells: [4, 1, 2, 1, 2], pointers: { i: 1 }, active: [1], done: [0], vars: { acc: '5 = 101' }, note: '`100 ^ 001 = 101`. acc = 5. It looks like a mess, but the information is all there.' },
        { cells: [4, 1, 2, 1, 2], pointers: { i: 2 }, active: [2], done: [0, 1], vars: { acc: '7 = 111' }, note: '`101 ^ 010 = 111`. acc = 7.' },
        { cells: [4, 1, 2, 1, 2], pointers: { i: 3 }, active: [3], done: [0, 1, 2], vars: { acc: '6 = 110' }, note: 'The second 1 arrives: `111 ^ 001 = 110`. Bit 0 switched back off, so the 1s have cancelled.' },
        { cells: [4, 1, 2, 1, 2], pointers: { i: 4 }, active: [4], done: [0, 1, 2, 3], vars: { acc: '4 = 100' }, note: 'The second 2: `110 ^ 010 = 100`. The 2s cancelled too.' },
        { cells: [4, 1, 2, 1, 2], found: [0], done: [1, 2, 3, 4], vars: { acc: '4 = 100' }, note: 'Done. acc = 4, the lonely sock.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `// XOR: a bit is 1 when the two input bits are different
function singleNumber(nums):
    acc ← 0
    for each x in nums:
        acc ← acc XOR x        // twins cancel, 0 changes nothing
    return acc`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}

singleNumber([4, 1, 2, 1, 2]); // 4`,
    },
    {
      kind: 'compare',
      title: 'Find the number without a twin',
      rows: [
        { approach: 'Two loops, count each number', time: 'O(n²)', space: 'O(1)', note: 'For each number, scan the list again.' },
        { approach: 'Sort, then check neighbors', time: 'O(n log n)', space: 'O(1)*', note: 'Twins end up side by side. *Ignoring the sort itself.' },
        { approach: 'Hash map of counts', time: 'O(n)', space: 'O(n)', note: 'Fast, but stores every number.' },
        { approach: 'XOR everything', time: 'O(n)', space: 'O(1)', note: 'Pairs cancel. Nothing to store.' },
      ],
    },
    {
      kind: 'text',
      text: "**Twist: two lonely socks.** If two numbers `a` and `b` have no twin, XOR-ing everything gives `a ^ b`, not either one. But `a ^ b` is not useless: wherever it has a 1, `a` and `b` have *different* bits. Pick one such bit and split the list into two piles by that bit. `a` and `b` land in different piles, and every twin pair lands together. XOR each pile.",
    },
    {
      kind: 'diagram',
      title: 'Splitting [1, 2, 1, 3, 2, 5] into two piles',
      art: `XOR of all = 3 ^ 5 = 011 ^ 101 = 110
lowest 1 bit of 110 = 010 (bit 1)

  number  bits   bit 1?   pile
    1     001      0       B
    2     010      1       A
    1     001      0       B
    3     011      1       A
    2     010      1       A
    5     101      0       B

pile A: 2 ^ 3 ^ 2 = 3
pile B: 1 ^ 1 ^ 5 = 5      answer: [3, 5]`,
      caption: '`x & -x` keeps only the lowest 1 bit of x: `6 & -6 = 2`. It is the quickest way to pick the splitting bit.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: XOR cancel',
      code: `// Signals: "every element appears twice except…", "one is missing",
// "one extra", "O(1) extra space"
acc ← 0
for each x in items:
    acc ← acc XOR x
return acc      // anything seen an even number of times is gone`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'XOR only cancels pairs',
      text: "`x ^ x ^ x = x`, not 0. If the others appear **three** times, XOR leaves junk behind. Then you count each bit position instead: for every bit, add up how many numbers have it on and take the total mod 3. Whatever is left over belongs to the lonely number (see Single number II below).",
    },
  ],
  problems: [
    {
      id: 'bits-math-single-number',
      title: 'Single number',
      difficulty: 'easy',
      leetcode: 136,
      pattern: 'XOR cancel',
      statement:
        'Every sock in the pile has an identical twin, except one. Given the sock numbers `nums`, return the number of the sock with no twin. Use O(n) time and O(1) extra memory.',
      examples: [
        { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
        { input: 'nums = [2, 2, 1]', output: '1' },
        { input: 'nums = [1]', output: '1' },
      ],
      constraints: ['1 ≤ n ≤ 3·10⁴, n is odd', '−3·10⁴ ≤ nums[i] ≤ 3·10⁴'],
      hints: [
        'What happens when you XOR a number with itself?',
        'XOR does not care about order, so you can imagine the twins sitting next to each other.',
        'Start at 0 and XOR every number into one variable.',
      ],
      approaches: [
        {
          name: 'Hash map of counts',
          idea: 'Count how many times each number appears, then return the one with count 1. Fast, but uses O(n) memory.',
          code: `function singleNumber(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  for (const [x, c] of counts) if (c === 1) return x;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'XOR everything',
          idea: '`x ^ x = 0` and `x ^ 0 = x`, and order does not matter. So every pair cancels and only the lonely number survives.',
          pseudo: `function singleNumber(nums):
    acc ← 0
    for each x in nums:
        acc ← acc XOR x
    return acc`,
          code: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'singleNumber',
      starter: `function singleNumber(nums) {
  // every number appears twice except one
  return 0;
}`,
      solution: `function singleNumber(nums) {
  let acc = 0;
  for (const x of nums) acc ^= x;
  return acc;
}`,
      tests: [
        { name: 'example', args: [[4, 1, 2, 1, 2]], expected: 4 },
        { name: 'small', args: [[2, 2, 1]], expected: 1 },
        { name: 'one sock', args: [[1]], expected: 1 },
        { name: 'negative answer', args: [[-1, -1, -2]], expected: -2 },
        { name: 'answer is zero', args: [[0, 5, 5]], expected: 0 },
        { name: 'mixed signs', args: [[7, 3, 7, -3, 3]], expected: -3 },
        { name: 'big values', args: [[30000, -30000, 30000]], expected: -30000 },
      ],
      takeaway: 'Pairs cancel under XOR: XOR the whole list to find the one without a partner.',
    },
    {
      id: 'bits-math-missing-number',
      title: 'Missing number',
      difficulty: 'easy',
      leetcode: 268,
      pattern: 'XOR cancel',
      statement:
        'A cinema hall has seats numbered `0` to `n`. There are `n` tickets sold, all different, so exactly one seat is empty. Given the sold seat numbers `nums` (in any order), return the empty seat.',
      examples: [
        { input: 'nums = [3, 0, 1]', output: '2', explain: 'n = 3, seats 0..3. Seat 2 is empty.' },
        { input: 'nums = [0, 1]', output: '2' },
        { input: 'nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]', output: '8' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', 'All values are different and between 0 and n'],
      hints: [
        'You know exactly which numbers *should* be there: 0, 1, …, n.',
        'If you XOR all the numbers that should be there with all the numbers that are there, what cancels?',
        'XOR every index `i` (0..n−1), `n` itself, and every value. The leftover is the missing seat.',
      ],
      approaches: [
        {
          name: 'Sort and scan',
          idea: 'After sorting, seat `i` should hold value `i`. The first place where it does not is the gap.',
          time: 'O(n log n)',
          space: 'O(1)',
        },
        {
          name: 'Sum formula',
          idea: '0 + 1 + … + n = n(n + 1) / 2. Subtract the sum of `nums`. Safe in JS for this size, but in languages with 32-bit ints the sum can overflow.',
          code: `function missingNumber(nums) {
  const n = nums.length;
  return (n * (n + 1)) / 2 - nums.reduce((a, b) => a + b, 0);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'XOR indexes and values',
          idea: 'Every seat number that appears in `nums` also appears in the list 0..n, so it shows up twice and cancels. The empty seat shows up only once.',
          pseudo: `function missingNumber(nums):
    acc ← n                             // the one index the loop misses
    for i from 0 to n - 1:
        acc ← acc XOR i XOR nums[i]
    return acc`,
          code: `function missingNumber(nums) {
  let acc = nums.length;
  for (let i = 0; i < nums.length; i++) acc ^= i ^ nums[i];
  return acc;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'missingNumber',
      starter: `function missingNumber(nums) {
  // seats 0..n, one is empty
  return 0;
}`,
      solution: `function missingNumber(nums) {
  let acc = nums.length;
  for (let i = 0; i < nums.length; i++) acc ^= i ^ nums[i];
  return acc;
}`,
      tests: [
        { name: 'example', args: [[3, 0, 1]], expected: 2 },
        { name: 'last seat empty', args: [[0, 1]], expected: 2 },
        { name: 'longer', args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expected: 8 },
        { name: 'single, missing 1', args: [[0]], expected: 1 },
        { name: 'single, missing 0', args: [[1]], expected: 0 },
        { name: 'first seat empty', args: [[2, 1]], expected: 0 },
        { name: 'middle seat empty', args: [[2, 0]], expected: 1 },
      ],
      takeaway: 'XOR what should be there with what is there: the leftover is what is missing.',
    },
    {
      id: 'bits-math-single-number-iii',
      title: 'Single number III (two lonely numbers)',
      difficulty: 'medium',
      leetcode: 260,
      pattern: 'XOR cancel',
      statement:
        'This time **two** different numbers have no twin; everything else appears exactly twice. Return the two lonely numbers (in any order). Use O(n) time and O(1) extra memory.',
      examples: [
        { input: 'nums = [1, 2, 1, 3, 2, 5]', output: '[3, 5]', explain: '`[5, 3]` is also accepted.' },
        { input: 'nums = [-1, 0]', output: '[-1, 0]' },
      ],
      constraints: ['2 ≤ n ≤ 3·10⁴', '−2³¹ ≤ nums[i] ≤ 2³¹ − 1'],
      hints: [
        'XOR everything. You get `a ^ b`, where `a` and `b` are the two answers.',
        'Since `a ≠ b`, `a ^ b` has at least one 1 bit. At that bit, `a` and `b` differ.',
        'Use `x & -x` to keep only the lowest 1 bit. Split the numbers into two piles by that bit and XOR each pile on its own.',
      ],
      approaches: [
        {
          name: 'Hash set',
          idea: 'Add a number when you first see it, remove it the second time. The two left in the set are the answer. Uses O(n) memory.',
          code: `function singleNumberIII(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) seen.delete(x);
    else seen.add(x);
  }
  return [...seen];
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'XOR, then split by one bit',
          idea: '`a ^ b` has a 1 wherever `a` and `b` differ. Pick one such bit. Twins share all bits, so each pair goes to the same pile; `a` and `b` go to different piles. Each pile is now the one-lonely-number problem.',
          pseudo: `function singleNumberIII(nums):
    both ← 0
    for each x in nums:
        both ← both XOR x            // = a XOR b
    bit ← both AND (-both)           // lowest 1 bit: a and b differ here
    a ← 0
    b ← 0
    for each x in nums:
        if x AND bit ≠ 0:
            a ← a XOR x              // pile A
        else:
            b ← b XOR x              // pile B
    return [a, b]`,
          code: `function singleNumberIII(nums) {
  let both = 0;
  for (const x of nums) both ^= x;
  const bit = both & -both;
  let a = 0;
  let b = 0;
  for (const x of nums) {
    if ((x & bit) !== 0) a ^= x;
    else b ^= x;
  }
  return [a, b];
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'singleNumberIII',
      starter: `function singleNumberIII(nums) {
  // two numbers appear once, the rest twice; return both
  return [];
}`,
      solution: `function singleNumberIII(nums) {
  let both = 0;
  for (const x of nums) both ^= x;
  const bit = both & -both;
  let a = 0;
  let b = 0;
  for (const x of nums) {
    if ((x & bit) !== 0) a ^= x;
    else b ^= x;
  }
  return [a, b];
}`,
      compare: 'unordered',
      tests: [
        { name: 'example', args: [[1, 2, 1, 3, 2, 5]], expected: [3, 5] },
        { name: 'just two', args: [[-1, 0]], expected: [-1, 0] },
        { name: 'zero and one', args: [[0, 1]], expected: [0, 1] },
        { name: 'pair first', args: [[4, 4, 7, 9]], expected: [7, 9] },
        { name: 'negatives', args: [[2, 2, 3, 3, -5, 6]], expected: [-5, 6] },
        { name: '32-bit extremes', args: [[-2147483648, 2147483647]], expected: [-2147483648, 2147483647] },
        { name: 'extreme with pairs', args: [[-2147483648, 0, 0, 5, 9, 9]], expected: [-2147483648, 5] },
      ],
      takeaway: 'When XOR gives you `a ^ b`, split the input by any bit where `a` and `b` differ.',
    },
    {
      id: 'bits-math-single-number-ii',
      title: 'Single number II (others appear three times)',
      difficulty: 'medium',
      leetcode: 137,
      pattern: 'Walk the bits',
      statement:
        'A warehouse ships every product in boxes of three, but one product was shipped alone. Given the product codes `nums`, where every code appears exactly three times except one that appears once, return the lonely code. Use O(n) time and O(1) extra memory.',
      examples: [
        { input: 'nums = [2, 2, 3, 2]', output: '3' },
        { input: 'nums = [0, 1, 0, 1, 0, 1, 99]', output: '99' },
      ],
      constraints: ['1 ≤ n ≤ 3·10⁴', '−2³¹ ≤ nums[i] ≤ 2³¹ − 1'],
      hints: [
        'XOR fails here: three copies leave one copy behind.',
        'Look at one bit position at a time. Count how many numbers have that bit on.',
        'Numbers that appear three times add 0, 3, 6, … to the count. So `count % 3` is the lonely number\'s bit.',
        'Set bit `i` of the answer with `result |= 1 << i`. Bit 31 makes it negative, which is exactly right.',
      ],
      approaches: [
        {
          name: 'Hash map of counts',
          idea: 'Count every number and return the one with count 1. Simple, but O(n) memory.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Count each bit mod 3',
          idea: 'For every bit position, the triples add a multiple of 3 to the count of 1s. Whatever is left after `% 3` comes from the lonely number. Build it bit by bit.',
          pseudo: `function singleNumberII(nums):
    result ← 0
    for i from 0 to 31:
        count ← 0
        for each x in nums:
            count ← count + ((x >> i) AND 1)
        if count mod 3 = 1:
            result ← result OR (1 << i)    // the lonely number has bit i
    return result`,
          code: `function singleNumberII(nums) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    let count = 0;
    for (const x of nums) count += (x >> i) & 1;
    if (count % 3 === 1) result |= 1 << i;
  }
  return result;
}`,
          time: 'O(32·n)',
          space: 'O(1)',
        },
      ],
      fn: 'singleNumberII',
      starter: `function singleNumberII(nums) {
  // every number appears three times except one
  return 0;
}`,
      solution: `function singleNumberII(nums) {
  let result = 0;
  for (let i = 0; i < 32; i++) {
    let count = 0;
    for (const x of nums) count += (x >> i) & 1;
    if (count % 3 === 1) result |= 1 << i;
  }
  return result;
}`,
      tests: [
        { name: 'example', args: [[2, 2, 3, 2]], expected: 3 },
        { name: 'bigger lonely', args: [[0, 1, 0, 1, 0, 1, 99]], expected: 99 },
        { name: 'only one', args: [[5]], expected: 5 },
        { name: 'negative answer', args: [[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]], expected: -4 },
        { name: 'triples of −1', args: [[-1, -1, -1, -7]], expected: -7 },
        { name: 'answer −1', args: [[0, 0, 0, -1]], expected: -1 },
        {
          name: '32-bit extremes',
          args: [[2147483647, 2147483647, 2147483647, -2147483648]],
          expected: -2147483648,
        },
      ],
      takeaway: 'If XOR cannot cancel (triples), count each bit position and take the count mod 3.',
    },
  ],
  quiz: [
    {
      prompt: 'What is `9 ^ 5 ^ 9`?',
      options: ['5', '9', '0', '13'],
      answer: 0,
      explanation: 'Order does not matter: `(9 ^ 9) ^ 5 = 0 ^ 5 = 5`.',
    },
    {
      prompt: 'Every number appears **three** times except one. Why does XOR-ing everything fail?',
      options: [
        'XOR is too slow',
        '`x ^ x ^ x = x`, so every triple leaves one copy behind',
        'XOR does not work on negatives',
        'It works fine',
      ],
      answer: 1,
      explanation: 'XOR only cancels even counts. Count bits mod 3 instead.',
    },
    {
      prompt: 'What does `x & -x` give for x = 12 (`1100`)?',
      options: ['12', '8', '4', '1'],
      answer: 2,
      explanation: 'It keeps only the lowest 1 bit: `0100` = 4.',
    },
  ],
  takeaways: [
    '`x ^ x = 0`, `x ^ 0 = x`, and order does not matter: pairs cancel.',
    'XOR "what should be there" with "what is there" to find what is missing or extra.',
    'Two lonely numbers: XOR gives `a ^ b`; split by its lowest 1 bit (`x & -x`).',
    'Triples: count each bit position mod 3 instead of XOR.',
  ],
};

export default lesson;
