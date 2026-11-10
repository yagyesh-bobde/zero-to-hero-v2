import type { Lesson } from '../types';

// Module 5, lesson 1: classic binary search and the loop invariant.
const lesson: Lesson = {
  id: 'classic-binary-search',
  title: 'Classic binary search',
  summary: 'Find a value in a sorted array by throwing away half of the range on every look.',
  minutes: 15,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Twenty questions, with numbers',
      text: "Think of a number from 1 to 1,000,000. If you only answer \"higher\" or \"lower\", I can find it in **20** guesses. The trick: always guess the middle of what is left. Every answer kills half of the options. A paper dictionary works the same way: you open it near the middle, see words starting with \"M\", and you know \"cat\" is in the left half.",
    },
    {
      kind: 'text',
      text: '**The problem.** You get a sorted array `nums` and a number `target`. Return the index of `target`, or `-1` if it is not there. Example: `nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` and `target = 23`. The answer is `5`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: check every cell',
      code: `function linearSearch(nums, target):
    for i from 0 to n - 1:
        if nums[i] = target:
            return i
    return -1`,
    },
    {
      kind: 'text',
      text: "This works on any array. But it costs **O(n)**: with a million items, a missing target means a million checks. And it ignores the one thing we got for free: the array is **sorted**.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Say you look at `nums[4] = 16` and the target is 23. The array is sorted, so every cell left of index 4 is even smaller than 16. One look just ruled out indexes 0 to 4. A linear scan learns this and then throws it away.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Look in the middle, drop half',
      text: "Keep a range `lo..hi` where the target could still be. Look at the middle cell, `mid`. Too small? The target must be to its right, so move `lo` to `mid + 1`. Too big? Move `hi` to `mid - 1`. Each look cuts the range in half, so n items need only about **log₂ n** looks. (log₂ n just means \"how many times can you halve n before 1 is left\".)",
    },
    {
      kind: 'steps',
      title: 'Find 23',
      frames: [
        {
          cells: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          pointers: { lo: 0, hi: 9 },
          vars: { target: 23 },
          note: 'The whole array is the range: `lo = 0`, `hi = 9`.',
        },
        {
          cells: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          pointers: { lo: 0, mid: 4, hi: 9 },
          active: [4],
          vars: { target: 23, 'nums[mid]': 16 },
          note: '`mid = floor((0 + 9) / 2) = 4`. 16 is less than 23, so 23 can only be to the right: `lo = 5`.',
        },
        {
          cells: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          pointers: { lo: 5, mid: 7, hi: 9 },
          active: [7],
          done: [0, 1, 2, 3, 4],
          vars: { target: 23, 'nums[mid]': 56 },
          note: 'Indexes 0 to 4 are gone. `mid = 7`: 56 is bigger than 23, so drop 7 and everything right of it: `hi = 6`.',
        },
        {
          cells: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
          pointers: { lo: 5, mid: 5, hi: 6 },
          found: [5],
          done: [0, 1, 2, 3, 4, 7, 8, 9],
          vars: { target: 23, 'nums[mid]': 23 },
          note: '`mid = floor((5 + 6) / 2) = 5` and `nums[5] = 23`. Found in 3 looks instead of 6.',
        },
      ],
    },
    {
      kind: 'trace',
      title: 'Find 40 (it is missing)',
      columns: ['lo', 'hi', 'mid', 'nums[mid]', 'decision'],
      rows: [
        [0, 9, 4, 16, '16 < 40, so lo = 5'],
        [5, 9, 7, 56, '56 > 40, so hi = 6'],
        [5, 6, 5, 23, '23 < 40, so lo = 6'],
        [6, 6, 6, 38, '38 < 40, so lo = 7'],
        [7, 6, '-', '-', 'lo > hi: range empty, return -1'],
      ],
      note: 'The range shrinks until `lo` passes `hi`. An empty range means 40 is not there. Look at row 4: `lo = hi = 6` is still one real cell, so the loop must keep going while `lo ≤ hi`.',
    },
    {
      kind: 'text',
      text: "**The promise that keeps it correct.** Before every turn of the loop, this is true: *if the target is in the array at all, it is somewhere between `lo` and `hi`.* A promise like this is called a **loop invariant**: a fact that is true every time the loop starts. Each move keeps the promise, because we only throw away cells we *know* can't hold the target. When the range is empty, the promise tells us the target is nowhere.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Binary search',
      code: `function binarySearch(nums, target):
    lo ← 0
    hi ← n - 1                  // target, if present, is in lo..hi
    while lo ≤ hi:              // at least one cell left
        mid ← floor((lo + hi) / 2)
        if nums[mid] = target:
            return mid
        else if nums[mid] < target:
            lo ← mid + 1        // mid and everything left: too small
        else:
            hi ← mid - 1        // mid and everything right: too big
    return -1                   // range is empty`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

search([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 23); // 5
search([2, 5, 8, 12, 16, 23, 38, 56, 72, 91], 40); // -1`,
    },
    {
      kind: 'table',
      title: 'How few looks it takes (worst case)',
      head: ['Items (n)', 'Linear scan', 'Binary search'],
      rows: [
        ['10', '10', '4'],
        ['1,000', '1,000', '10'],
        ['1,000,000', '1,000,000', '20'],
        ['1,000,000,000', '1,000,000,000', '30'],
      ],
    },
    {
      kind: 'compare',
      title: 'Finding one value',
      rows: [
        {
          approach: 'Linear scan',
          time: 'O(n)',
          space: 'O(1)',
          note: 'Works on unsorted data too. Fine for tiny arrays or a single lookup.',
        },
        {
          approach: 'Sort once, then binary search',
          time: 'O(n log n) + O(log n) per search',
          space: 'O(1) to O(n)',
          note: 'Worth it only when you will search the same data many times.',
        },
        {
          approach: 'Binary search',
          time: 'O(log n)',
          space: 'O(1)',
          note: 'Needs sorted data. About 30 looks for a billion items.',
        },
      ],
    },
    {
      kind: 'list',
      items: [
        '**When to reach for it:** the data is sorted (or sorted once and searched many times) and you need one exact value.',
        'The statement says "sorted", asks for **O(log n)**, or n is huge (up to 10⁹), so even O(n) is too slow.',
        'Each question you can ask has three answers: "found it", "go left", "go right".',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: exact match',
      code: `lo ← first candidate
hi ← last candidate
while lo ≤ hi:
    mid ← floor((lo + hi) / 2)
    if mid is the answer:
        return mid
    else if the answer is right of mid:
        lo ← mid + 1
    else:
        hi ← mid - 1
return "not found"`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three bugs everyone writes once',
      text: "**1.** `while (lo < hi)` in this template skips the last cell when `lo = hi`. The \"find 40\" trace shows that cell matters. **2.** Writing `lo = mid` instead of `lo = mid + 1` can loop forever: with `lo = 5, hi = 6`, mid is 5 again and again. **3.** In JS, `(lo + hi) / 2` can be a decimal like `2.5`, and `nums[2.5]` is `undefined`. Always wrap it: `Math.floor((lo + hi) / 2)`. The shortcut `(lo + hi) >> 1` also rounds down, but breaks once `lo + hi` passes about 2.1 billion.",
    },
  ],
  problems: [
    {
      id: 'binary-search-classic',
      title: 'Binary Search',
      difficulty: 'easy',
      leetcode: 704,
      pattern: 'Binary search (exact match)',
      statement:
        "A library app keeps book IDs in a sorted array `nums` (smallest first, no repeats). A user scans a book with ID `target`. Return the index of that ID, or `-1` if the library does not have it. Your solution should take O(log n) time.",
      examples: [
        { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explain: '`nums[4] = 9`.' },
        { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explain: '2 would sit between 0 and 3, but it is not there.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', 'values are distinct and sorted ascending'],
      hints: [
        'The array is sorted. What does one look at the middle tell you about everything to its left?',
        'Keep two indexes `lo` and `hi`. Promise yourself: if the target exists, it is between them.',
        '`mid = Math.floor((lo + hi) / 2)`. Too small: `lo = mid + 1`. Too big: `hi = mid - 1`. Loop while `lo <= hi`.',
      ],
      approaches: [
        {
          name: 'Linear scan',
          idea: 'Check every cell from left to right. Simple and correct, but it ignores that the array is sorted.',
          code: `function search(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === target) return i;
  }
  return -1;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search',
          idea: 'Look at the middle of the range. Because the array is sorted, one comparison tells you which half cannot hold the target, so you drop it. The range halves every step.',
          pseudo: `function search(nums, target):
    lo ← 0
    hi ← n - 1
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] = target:
            return mid
        else if nums[mid] < target:
            lo ← mid + 1
        else:
            hi ← mid - 1
    return -1`,
          code: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'search',
      starter: `function search(nums, target) {
  // Return the index of target in sorted nums, or -1.
  return -1;
}`,
      solution: `function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      tests: [
        { name: 'found in the right half', args: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
        { name: 'missing, falls in a gap', args: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
        { name: 'first cell', args: [[-1, 0, 3, 5, 9, 12], -1], expected: 0 },
        { name: 'last cell', args: [[-1, 0, 3, 5, 9, 12], 12], expected: 5 },
        { name: 'smaller than everything', args: [[2, 4, 6], -5], expected: -1 },
        { name: 'bigger than everything', args: [[2, 4, 6], 50], expected: -1 },
        { name: 'single element, found', args: [[5], 5], expected: 0 },
        { name: 'single element, missing', args: [[5], 4], expected: -1 },
        { name: 'two elements', args: [[1, 3], 3], expected: 1 },
        { name: 'empty array', args: [[], 7], expected: -1 },
        { name: 'all negatives', args: [[-90, -40, -20, -7, -3], -7], expected: 3 },
      ],
      takeaway: 'Exact match: `while (lo <= hi)` and always move past `mid` with `± 1`.',
    },
    {
      id: 'binary-search-guess-number',
      title: 'Guess the Number',
      difficulty: 'easy',
      leetcode: 374,
      pattern: 'Binary search (exact match)',
      statement:
        "A friend picks a secret number between `1` and `n`. You can only ask `guess(x)`, which answers `-1` if the secret is **lower** than `x`, `1` if it is **higher**, and `0` if `x` is the secret. Return the secret. To make this runnable, your function also receives `pick` (the secret). The starter builds `guess` from it. Play fair: only `guess` may look at `pick`.",
      examples: [
        { input: 'n = 10, pick = 6', output: '6', explain: 'guess(5) says higher, guess(8) says lower, guess(6) says 0.' },
        { input: 'n = 1, pick = 1', output: '1' },
      ],
      constraints: ['1 ≤ pick ≤ n ≤ 2³¹ - 1'],
      hints: [
        'Counting up from 1 could take 2 billion guesses. Each answer tells you which half to keep.',
        'Keep `lo = 1`, `hi = n` and guess the middle.',
        'Answer `1` means go higher: `lo = mid + 1`. Answer `-1`: `hi = mid - 1`. Answer `0`: return `mid`.',
      ],
      approaches: [
        {
          name: 'Count up',
          idea: 'Guess 1, 2, 3, ... until `guess` says 0. Correct, but n can be 2 billion.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on 1..n',
          idea: 'There is no array, just the numbers 1 to n, which are sorted by definition. Guess the middle; the answer tells you which half to drop. At most 31 guesses for n = 2³¹ - 1.',
          pseudo: `function guessNumber(n):
    lo ← 1
    hi ← n
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        answer ← guess(mid)
        if answer = 0:
            return mid
        else if answer = 1:          // secret is higher
            lo ← mid + 1
        else:                        // secret is lower
            hi ← mid - 1
    return -1`,
          code: `function guessNumber(n, pick) {
  const guess = (x) => (pick < x ? -1 : pick > x ? 1 : 0);
  let lo = 1;
  let hi = n;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const answer = guess(mid);
    if (answer === 0) return mid;
    if (answer === 1) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'guessNumber',
      starter: `function guessNumber(n, pick) {
  // The only code allowed to look at pick:
  const guess = (x) => (pick < x ? -1 : pick > x ? 1 : 0);
  // Find the secret using guess(x) only.
  return 0;
}`,
      solution: `function guessNumber(n, pick) {
  const guess = (x) => (pick < x ? -1 : pick > x ? 1 : 0);
  let lo = 1;
  let hi = n;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const answer = guess(mid);
    if (answer === 0) return mid;
    if (answer === 1) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
      tests: [
        { name: 'small range', args: [10, 6], expected: 6 },
        { name: 'only one number', args: [1, 1], expected: 1 },
        { name: 'two numbers, low', args: [2, 1], expected: 1 },
        { name: 'two numbers, high', args: [2, 2], expected: 2 },
        { name: 'secret is 1', args: [100, 1], expected: 1 },
        { name: 'secret is n', args: [100, 100], expected: 100 },
        { name: 'a million', args: [1000000, 777777], expected: 777777 },
        { name: 'about 2 billion', args: [2126753390, 1702766719], expected: 1702766719 },
      ],
      takeaway: 'You do not need an array: any sorted range of numbers can be binary searched.',
    },
    {
      id: 'binary-search-perfect-square',
      title: 'Valid Perfect Square',
      difficulty: 'easy',
      leetcode: 367,
      pattern: 'Binary search (exact match)',
      statement:
        "A tiling app wants to know if `num` square tiles can cover a square floor exactly, like 16 tiles as a 4 × 4 floor. Return `true` if `num` is a perfect square (`k × k` for some whole number `k`), else `false`. Don't use `Math.sqrt` or `** 0.5`.",
      examples: [
        { input: 'num = 16', output: 'true', explain: '4 × 4 = 16.' },
        { input: 'num = 14', output: 'false', explain: '3 × 3 = 9 is too small and 4 × 4 = 16 is too big.' },
      ],
      constraints: ['1 ≤ num ≤ 2³¹ - 1'],
      hints: [
        'You are looking for a whole number `k` with `k × k = num`. Which numbers could `k` be?',
        'As `k` grows, `k × k` grows. So the candidates 1..num are sorted by their squares.',
        'Binary search `k` in `1..num`: compare `mid × mid` with `num` and move `lo` or `hi` like in classic search.',
      ],
      approaches: [
        {
          name: 'Try k = 1, 2, 3, ...',
          idea: 'Square each k until `k × k` reaches or passes num. It stops after about √num steps: 46,341 steps for the biggest input.',
          code: `function isPerfectSquare(num) {
  let k = 1;
  while (k * k < num) k++;
  return k * k === num;
}`,
          time: 'O(√n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on k',
          idea: 'Squares grow as k grows, so `k × k` vs `num` tells you which half of the candidates to drop. You search for an exact match, so it is the classic template.',
          pseudo: `function isPerfectSquare(num):
    lo ← 1
    hi ← num
    while lo ≤ hi:
        mid ← floor((lo + hi) / 2)
        square ← mid × mid
        if square = num:
            return true
        else if square < num:
            lo ← mid + 1
        else:
            hi ← mid - 1
    return false`,
          code: `function isPerfectSquare(num) {
  let lo = 1;
  let hi = num;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const square = mid * mid;
    if (square === num) return true;
    if (square < num) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'isPerfectSquare',
      starter: `function isPerfectSquare(num) {
  // Return true if num = k * k for some whole k. No Math.sqrt.
  return false;
}`,
      solution: `function isPerfectSquare(num) {
  let lo = 1;
  let hi = num;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const square = mid * mid;
    if (square === num) return true;
    if (square < num) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
      tests: [
        { name: '16 is 4 x 4', args: [16], expected: true },
        { name: '14 is not', args: [14], expected: false },
        { name: '1 is 1 x 1', args: [1], expected: true },
        { name: '2 is not', args: [2], expected: false },
        { name: '899 x 899', args: [808201], expected: true },
        { name: 'one less than a square', args: [808200], expected: false },
        { name: 'biggest square that fits', args: [2147395600], expected: true },
        { name: 'max input', args: [2147483647], expected: false },
      ],
      takeaway: 'If a value grows as its input grows, you can binary search the input.',
    },
  ],
  quiz: [
    {
      prompt: 'A sorted array has 1,000,000 numbers. About how many looks does binary search need in the worst case?',
      options: ['1,000', '500,000', '20', '1'],
      answer: 2,
      explanation: 'Each look halves the range. Halving 1,000,000 down to 1 takes about 20 steps, because 2²⁰ ≈ 1,000,000.',
    },
    {
      prompt: 'In the exact-match loop, why is the condition `lo ≤ hi` and not `lo < hi`?',
      options: [
        'When `lo = hi` there is still one cell left to check',
        'It makes the loop faster',
        'It avoids dividing by zero',
        'It makes no difference',
      ],
      answer: 0,
      explanation: '`lo = hi` means the range holds exactly one cell. With `lo < hi` you would stop without checking it.',
    },
    {
      prompt: '`lo = 3` and `hi = 4`. What is `Math.floor((lo + hi) / 2)`?',
      options: ['3', '3.5', '4', '7'],
      answer: 0,
      explanation: '(3 + 4) / 2 = 3.5, and `Math.floor` rounds down to 3. Without it you would read `nums[3.5]`, which is `undefined`.',
    },
    {
      prompt: 'What must be true about the data for classic binary search to work?',
      options: ['It is sorted', 'It has no negative numbers', 'Its length is a power of 2', 'It has no zeros'],
      answer: 0,
      explanation: 'Sorted order is what lets one comparison at `mid` rule out a whole half.',
    },
  ],
  takeaways: [
    'Binary search keeps a range `lo..hi` where the answer must be, and halves it on every look: O(log n).',
    'The loop invariant: if the target exists, it is inside `lo..hi`. Only throw away cells you know are wrong.',
    'Exact match uses `while (lo <= hi)` with `lo = mid + 1` or `hi = mid - 1`.',
  ],
};

export default lesson;
