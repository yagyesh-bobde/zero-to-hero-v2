import type { Lesson } from '../types';

// Module 5, lesson 2: lower bound, upper bound and the "first true" template.
const lesson: Lesson = {
  id: 'lower-upper-bound',
  title: 'Lower and upper bound',
  summary: 'Find the first spot where a yes/no answer flips: first copy, last copy, insert position.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'git bisect',
      text: "Your app worked at commit 1 and is broken at commit 100. One commit in between broke it, and every commit after that one is broken too. `git bisect` checks out the middle commit, you test it and say \"good\" or \"bad\", and it halves the range. About 7 tests find the guilty commit among 100. Notice what it searches for: not a value, but the **spot where good turns into bad**.",
    },
    {
      kind: 'text',
      text: "**The problem.** `nums = [1, 3, 3, 5, 5, 5, 8, 9]` is sorted and has repeats. Where does the first `5` start? And if a new value `4` arrives, at which index should it go to keep the array sorted? Classic binary search answers neither. It stops at *whichever* 5 it hits first (index 3, 4 or 5), and for 4 it just says `-1`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: first value that is big enough',
      code: `function firstAtLeast(nums, target):
    for i from 0 to n - 1:
        if nums[i] ≥ target:
            return i
    return n                    // all smaller: insert at the end`,
    },
    {
      kind: 'text',
      text: "This answers both questions: the first 5 is at index 3, and 4 should also go at index 3. But it is O(n) again, and the array is sorted. We should be halving.",
    },
    {
      kind: 'text',
      text: "**Spot the shape.** Ask one yes/no question at every index: *is `nums[i] ≥ target`?* Because the array is sorted, all the \"no\" answers come first and all the \"yes\" answers come after. We no longer hunt for a value. We hunt for the **first yes**.",
    },
    {
      kind: 'diagram',
      title: 'Two questions, two flip points',
      art: `index    0  1  2  3  4  5  6  7
nums     1  3  3  5  5  5  8  9
>= 5 ?   N  N  N  Y  Y  Y  Y  Y   first Y: 3
>  5 ?   N  N  N  N  N  N  Y  Y   first Y: 6`,
      caption: 'The first Y of "≥ 5" is the **lower bound** (3). The first Y of "> 5" is the **upper bound** (6). The 5s live in between: indexes 3 to 5.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Search for the flip, not the value',
      text: "Keep a range `lo..hi` that always contains the first yes. Look at `mid`. If `mid` is a yes, the first yes is `mid` or something left of it, so set `hi = mid`. Keep `mid`: it might be the answer. If `mid` is a no, the first yes is to its right: `lo = mid + 1`. When `lo = hi`, only one candidate is left, and it is the answer.",
    },
    {
      kind: 'steps',
      title: 'Lower bound of 5',
      frames: [
        {
          cells: [1, 3, 3, 5, 5, 5, 8, 9, ''],
          pointers: { lo: 0, hi: 8 },
          vars: { target: 5 },
          note: 'The empty cell is index 8 = n, meaning "after the end". It is a real answer if every value is smaller. So `lo = 0`, `hi = 8`.',
        },
        {
          cells: [1, 3, 3, 5, 5, 5, 8, 9, ''],
          pointers: { lo: 0, mid: 4, hi: 8 },
          active: [4],
          vars: { target: 5, 'nums[mid]': 5, 'is ≥ 5?': 'yes' },
          note: '`mid = 4`. Is 5 ≥ 5? Yes. The first yes is 4 or left of it: `hi = 4`.',
        },
        {
          cells: [1, 3, 3, 5, 5, 5, 8, 9, ''],
          pointers: { lo: 0, mid: 2, hi: 4 },
          active: [2],
          done: [5, 6, 7, 8],
          vars: { target: 5, 'nums[mid]': 3, 'is ≥ 5?': 'no' },
          note: '`mid = 2`. Is 3 ≥ 5? No. The first yes is right of 2: `lo = 3`.',
        },
        {
          cells: [1, 3, 3, 5, 5, 5, 8, 9, ''],
          pointers: { lo: 3, mid: 3, hi: 4 },
          active: [3],
          done: [0, 1, 2, 5, 6, 7, 8],
          vars: { target: 5, 'nums[mid]': 5, 'is ≥ 5?': 'yes' },
          note: '`mid = floor((3 + 4) / 2) = 3`. Is 5 ≥ 5? Yes: `hi = 3`.',
        },
        {
          cells: [1, 3, 3, 5, 5, 5, 8, 9, ''],
          pointers: { lo: 3, hi: 3 },
          found: [3],
          done: [0, 1, 2, 4, 5, 6, 7, 8],
          vars: { target: 5, answer: 3 },
          note: '`lo = hi = 3`. One candidate left: the first 5 is at index 3. That is also where a new 4 would go.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Lower bound',
      code: `function lowerBound(nums, target):
    lo ← 0
    hi ← n                      // n means "after the last cell"
    while lo < hi:              // stop when one candidate is left
        mid ← floor((lo + hi) / 2)
        if nums[mid] ≥ target:  // yes: answer is mid or left
            hi ← mid
        else:                   // no: answer is right of mid
            lo ← mid + 1
    return lo                   // lo = hi = the first yes`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript: both bounds',
      code: `// First index with nums[i] >= target (or nums.length)
function lowerBound(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

// First index with nums[i] > target. One character changed.
function upperBound(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] > target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

const nums = [1, 3, 3, 5, 5, 5, 8, 9];
lowerBound(nums, 5); // 3  (first 5)
upperBound(nums, 5); // 6  (so the last 5 is at 6 - 1 = 5)
lowerBound(nums, 4); // 3  (insert 4 here)`,
    },
    {
      kind: 'table',
      title: 'What the two bounds give you',
      head: ['You want', 'Use'],
      rows: [
        ['Where to insert `target`', '`lowerBound(target)`'],
        ['First copy of `target`', '`i = lowerBound(target)`, then check `nums[i] = target`'],
        ['Last copy of `target`', '`upperBound(target) - 1` (if a first copy exists)'],
        ['How many copies', '`upperBound(target) - lowerBound(target)`'],
        ['How many values are `< target`', '`lowerBound(target)`'],
      ],
    },
    {
      kind: 'compare',
      title: 'First and last position of a value',
      rows: [
        {
          approach: 'Scan from the left',
          time: 'O(n)',
          space: 'O(1)',
          note: 'Simple. Too slow for big arrays.',
        },
        {
          approach: 'Classic search, then walk out to both edges',
          time: 'O(log n + k)',
          space: 'O(1)',
          note: 'k = number of copies. With a million copies of one value, the walk is O(n).',
        },
        {
          approach: 'Lower bound + upper bound',
          time: 'O(log n)',
          space: 'O(1)',
          note: 'Two binary searches. Fast no matter how many copies there are.',
        },
      ],
    },
    {
      kind: 'list',
      items: [
        '**The pattern: first true.** Reach for it when you see "first / last position", "where would x go", "smallest index such that…", or "the first version that…".',
        'Also for counting: "how many values are less than x" is just a lower bound.',
        'The test: can you write a yes/no question that is all no, then all yes? Then binary search finds the flip.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: first true',
      code: `// isYes must be: no, no, ..., no, yes, yes, ...
lo ← smallest possible answer
hi ← largest possible answer    // one past the end if "none" is allowed
while lo < hi:
    mid ← floor((lo + hi) / 2)
    if isYes(mid):
        hi ← mid                // mid might be the answer: keep it
    else:
        lo ← mid + 1            // mid is a no: drop it
return lo`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: "Don't mix the two templates",
      text: "Exact match uses `while (lo <= hi)` with `hi = mid - 1`. First true uses `while (lo < hi)` with `hi = mid`. Mixing them breaks things: `while (lo <= hi)` with `hi = mid` loops forever once `lo = hi`. Writing `lo = mid` (instead of `mid + 1`) loops forever when `hi = lo + 1`, because `Math.floor` keeps picking `lo`. Rule of thumb: the side that drops `mid` uses `+ 1`. And start with `hi = n`, not `n - 1`, when \"after the end\" is a valid answer: 10 goes into `[1, 3, 5]` at index 3.",
    },
  ],
  problems: [
    {
      id: 'binary-search-insert-position',
      title: 'Search Insert Position',
      difficulty: 'easy',
      leetcode: 35,
      pattern: 'Lower bound (first true)',
      statement:
        "A game keeps its high scores in a sorted array `nums` with no repeats. A new score `target` comes in. If it is already in the array, return its index. If not, return the index where it should be inserted to keep the array sorted. Use O(log n) time.",
      examples: [
        { input: 'nums = [1, 3, 5, 6], target = 5', output: '2', explain: 'Already there, at index 2.' },
        { input: 'nums = [1, 3, 5, 6], target = 2', output: '1', explain: '2 goes between 1 and 3.' },
        { input: 'nums = [1, 3, 5, 6], target = 7', output: '4', explain: 'Bigger than everything: it goes at the end.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', 'values are distinct and sorted ascending'],
      hints: [
        'Both cases ("found" and "insert here") have the same answer: the first index whose value is ≥ target.',
        'The answer can be `n` (insert at the end), so start with `hi = n`, not `n - 1`.',
        'First-true loop: `while (lo < hi)`, if `nums[mid] >= target` then `hi = mid`, else `lo = mid + 1`. Return `lo`.',
      ],
      approaches: [
        {
          name: 'Scan from the left',
          idea: 'Walk until you meet the first value that is ≥ target. That is both "where it is" and "where it goes". If none, return n.',
          code: `function searchInsert(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] >= target) return i;
  }
  return nums.length;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Lower bound',
          idea: 'The question "is `nums[i] ≥ target`?" is all no, then all yes. Binary search for the first yes. The range is `0..n` because "after the end" is a valid answer.',
          pseudo: `function searchInsert(nums, target):
    lo ← 0
    hi ← n
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] ≥ target:
            hi ← mid
        else:
            lo ← mid + 1
    return lo`,
          code: `function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'searchInsert',
      starter: `function searchInsert(nums, target) {
  // Return target's index, or where it should be inserted.
  return 0;
}`,
      solution: `function searchInsert(nums, target) {
  let lo = 0;
  let hi = nums.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'already there', args: [[1, 3, 5, 6], 5], expected: 2 },
        { name: 'goes in a gap', args: [[1, 3, 5, 6], 2], expected: 1 },
        { name: 'goes at the end', args: [[1, 3, 5, 6], 7], expected: 4 },
        { name: 'goes at the start', args: [[1, 3, 5, 6], 0], expected: 0 },
        { name: 'single, smaller', args: [[1], 0], expected: 0 },
        { name: 'single, bigger', args: [[1], 2], expected: 1 },
        { name: 'single, equal', args: [[1], 1], expected: 0 },
        { name: 'negatives', args: [[-5, -2, 0, 4], -3], expected: 1 },
        { name: 'empty array', args: [[], 9], expected: 0 },
      ],
      takeaway: '"Where is it, or where would it go?" is one question: the lower bound.',
    },
    {
      id: 'binary-search-first-last',
      title: 'First and Last Position',
      difficulty: 'medium',
      leetcode: 34,
      pattern: 'Lower + upper bound',
      statement:
        "An online store logs every sale's price in a sorted array `nums`, so the same price can appear many times. Given a price `target`, return `[first, last]`: the first and last index where it appears. If it never appears, return `[-1, -1]`. Use O(log n) time, even if the array is full of copies.",
      examples: [
        { input: 'nums = [5, 7, 7, 8, 8, 10], target = 8', output: '[3, 4]' },
        { input: 'nums = [5, 7, 7, 8, 8, 10], target = 6', output: '[-1, -1]' },
        { input: 'nums = [], target = 0', output: '[-1, -1]' },
      ],
      constraints: ['0 ≤ n ≤ 10⁵', 'nums is sorted ascending'],
      hints: [
        'Finding *one* copy is easy. The hard part is the edges. Walking outward is O(n) when everything is a copy.',
        'The first copy is the first index with `nums[i] ≥ target`. What question gives you the index *just after* the last copy?',
        'Lower bound gives `first`. Upper bound (first `nums[i] > target`) minus 1 gives `last`. Check that `nums[first]` really is `target`.',
      ],
      approaches: [
        {
          name: 'Scan',
          idea: 'Walk the array, remember the first and last index where `nums[i] = target`.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Find one, walk outward',
          idea: 'Classic binary search lands on some copy. Then step left and right while the value still matches. Fast with few copies, O(n) when the array is all copies.',
          time: 'O(log n + k)',
          space: 'O(1)',
        },
        {
          name: 'Two bounds',
          idea: 'Run first-true twice. Question 1, "is `nums[i] ≥ target`?", flips at the first copy. Question 2, "is `nums[i] > target`?", flips just after the last copy. Each search is O(log n) no matter how many copies there are.',
          pseudo: `function searchRange(nums, target):
    first ← firstTrue(i → nums[i] ≥ target)
    if first = n or nums[first] ≠ target:
        return [-1, -1]
    afterLast ← firstTrue(i → nums[i] > target)
    return [first, afterLast - 1]

function firstTrue(isYes):
    lo ← 0
    hi ← n
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if isYes(mid):
            hi ← mid
        else:
            lo ← mid + 1
    return lo`,
          code: `function searchRange(nums, target) {
  // First index where isYes(value) is true, or nums.length.
  const firstTrue = (isYes) => {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (isYes(nums[mid])) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };
  const first = firstTrue((v) => v >= target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  const afterLast = firstTrue((v) => v > target);
  return [first, afterLast - 1];
}`,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'searchRange',
      starter: `function searchRange(nums, target) {
  // Return [first, last] index of target, or [-1, -1].
  return [-1, -1];
}`,
      solution: `function searchRange(nums, target) {
  const firstTrue = (isYes) => {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (isYes(nums[mid])) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  };
  const first = firstTrue((v) => v >= target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  const afterLast = firstTrue((v) => v > target);
  return [first, afterLast - 1];
}`,
      tests: [
        { name: 'two copies', args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
        { name: 'missing, in a gap', args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
        { name: 'empty array', args: [[], 0], expected: [-1, -1] },
        { name: 'single element', args: [[1], 1], expected: [0, 0] },
        { name: 'all copies', args: [[2, 2, 2, 2], 2], expected: [0, 3] },
        { name: 'last element only', args: [[1, 2, 3], 3], expected: [2, 2] },
        { name: 'first element only', args: [[1, 2, 3], 1], expected: [0, 0] },
        { name: 'smaller than everything', args: [[1, 1, 2], 0], expected: [-1, -1] },
        { name: 'bigger than everything', args: [[1, 3], 4], expected: [-1, -1] },
        { name: 'negative copies', args: [[-3, -3, -1, 0], -3], expected: [0, 1] },
      ],
      takeaway: 'First copy = lower bound. Last copy = upper bound - 1.',
    },
    {
      id: 'binary-search-first-bad-version',
      title: 'First Bad Version',
      difficulty: 'easy',
      leetcode: 278,
      pattern: 'First true',
      statement:
        "Your team shipped versions `1` to `n`. One version introduced a bug, and every version after it has the bug too. You can call `isBad(v)`, but each call runs a slow test suite, so call it as few times as you can. Return the first bad version. To make this runnable, your function also gets `firstBad`; the starter builds `isBad` from it. Play fair: only `isBad` may use `firstBad`.",
      examples: [
        { input: 'n = 5, firstBad = 4', output: '4', explain: 'isBad(3) = false, isBad(4) = true, isBad(5) = true.' },
        { input: 'n = 1, firstBad = 1', output: '1' },
      ],
      constraints: ['1 ≤ firstBad ≤ n ≤ 2³¹ - 1'],
      hints: [
        'Line the versions up: good, good, ..., good, bad, bad. Which template finds the first "bad"?',
        'The answer is somewhere in `1..n` (n is surely bad), so `lo = 1`, `hi = n`.',
        'If `isBad(mid)`, the first bad is `mid` or earlier: `hi = mid`. Otherwise `lo = mid + 1`. Stop when `lo = hi`.',
      ],
      approaches: [
        {
          name: 'Test every version in order',
          idea: 'Call `isBad(1)`, `isBad(2)`, ... and return the first true. Up to 2 billion slow test runs.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'First true (git bisect)',
          idea: '`isBad` is all false, then all true. First-true binary search finds the flip in about 31 calls for n = 2³¹ - 1. `mid` is kept when it is bad, because it might be the first bad one.',
          pseudo: `function firstBadVersion(n):
    lo ← 1
    hi ← n                      // n is bad for sure
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if isBad(mid):
            hi ← mid            // mid could be the first bad one
        else:
            lo ← mid + 1        // mid is good: look after it
    return lo`,
          code: `function firstBadVersion(n, firstBad) {
  const isBad = (v) => v >= firstBad;
  let lo = 1;
  let hi = n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (isBad(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(log n) calls',
          space: 'O(1)',
        },
      ],
      fn: 'firstBadVersion',
      starter: `function firstBadVersion(n, firstBad) {
  // The only code allowed to look at firstBad (pretend it is slow):
  const isBad = (v) => v >= firstBad;
  // Find the first bad version using isBad(v) only.
  return 0;
}`,
      solution: `function firstBadVersion(n, firstBad) {
  const isBad = (v) => v >= firstBad;
  let lo = 1;
  let hi = n;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (isBad(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'bad near the end', args: [5, 4], expected: 4 },
        { name: 'one version', args: [1, 1], expected: 1 },
        { name: 'two versions, first bad', args: [2, 1], expected: 1 },
        { name: 'two versions, second bad', args: [2, 2], expected: 2 },
        { name: 'only the last is bad', args: [10, 10], expected: 10 },
        { name: 'everything is bad', args: [10, 1], expected: 1 },
        { name: 'right after the middle', args: [100, 51], expected: 51 },
        { name: 'about 2 billion versions', args: [2126753390, 1702766719], expected: 1702766719 },
      ],
      takeaway: 'Good, good, bad, bad: whenever a yes/no answer flips once, binary search finds the flip.',
    },
    {
      id: 'binary-search-k-closest',
      title: 'K Closest Elements',
      difficulty: 'medium',
      leetcode: 658,
      pattern: 'Binary search on a window start',
      statement:
        "A music app has song lengths (in seconds) in a sorted array `arr`. A user wants `k` songs whose lengths are closest to `x`. Return those `k` lengths, sorted ascending. Song `a` is closer than song `b` if `|a - x| < |b - x|`; on a tie, the shorter song wins.",
      examples: [
        { input: 'arr = [1, 2, 3, 4, 5], k = 4, x = 3', output: '[1, 2, 3, 4]', explain: '1 and 5 tie (distance 2); the smaller one, 1, wins.' },
        { input: 'arr = [1, 2, 3, 4, 5], k = 4, x = -1', output: '[1, 2, 3, 4]', explain: 'x is left of everything, so take the first four.' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 10⁴', 'arr is sorted ascending', 'x can be outside the array'],
      hints: [
        'The k closest values always sit next to each other in the sorted array. So the answer is a window `arr[i..i+k-1]`.',
        'Search for the window start `i` in `0..n-k`. Compare the value leaving on the left, `arr[mid]`, with the value that would join on the right, `arr[mid + k]`.',
        'If `x - arr[mid] > arr[mid + k] - x`, the right one is strictly closer, so the window should start later: `lo = mid + 1`. Otherwise `hi = mid`.',
      ],
      approaches: [
        {
          name: 'Sort by distance',
          idea: 'Sort a copy by `|v - x|` (ties: smaller value first), take the first k, sort them again. Correct, but ignores that arr is already sorted.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Lower bound, then grow outward',
          idea: 'Find where x would go with a lower bound. Put two pointers around that spot and k times take whichever side is closer. Good when k is small.',
          time: 'O(log n + k)',
          space: 'O(1) extra',
        },
        {
          name: 'Binary search the window start',
          idea: 'The answer is k values in a row. Picture sliding a k-wide window. At start `mid`, if `arr[mid + k]` is strictly closer to x than `arr[mid]`, shifting right improves the window, and every earlier start is worse too. That is a no-then-yes shape over starts `0..n-k`.',
          pseudo: `function findClosestElements(arr, k, x):
    lo ← 0
    hi ← n - k                  // last possible window start
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        // arr[mid] would leave, arr[mid + k] would join
        if x - arr[mid] > arr[mid + k] - x:
            lo ← mid + 1        // right side is closer: start later
        else:
            hi ← mid
    return arr[lo .. lo + k - 1]`,
          code: `function findClosestElements(arr, k, x) {
  let lo = 0;
  let hi = arr.length - k;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;
    else hi = mid;
  }
  return arr.slice(lo, lo + k);
}`,
          time: 'O(log(n - k) + k)',
          space: 'O(1) extra',
        },
      ],
      fn: 'findClosestElements',
      starter: `function findClosestElements(arr, k, x) {
  // Return the k values closest to x, sorted ascending.
  return [];
}`,
      solution: `function findClosestElements(arr, k, x) {
  let lo = 0;
  let hi = arr.length - k;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (x - arr[mid] > arr[mid + k] - x) lo = mid + 1;
    else hi = mid;
  }
  return arr.slice(lo, lo + k);
}`,
      tests: [
        { name: 'x in the middle', args: [[1, 2, 3, 4, 5], 4, 3], expected: [1, 2, 3, 4] },
        { name: 'x left of everything', args: [[1, 2, 3, 4, 5], 4, -1], expected: [1, 2, 3, 4] },
        { name: 'x right of everything', args: [[1, 2, 3, 4, 5], 1, 10], expected: [5] },
        { name: 'tie goes to the smaller', args: [[1, 3], 1, 2], expected: [1] },
        { name: 'duplicates at the start', args: [[1, 1, 2, 3, 4, 5], 4, -1], expected: [1, 1, 2, 3] },
        { name: 'closer group on the right', args: [[1, 1, 1, 10, 10, 10], 1, 9], expected: [10] },
        { name: 'mixed ties', args: [[0, 0, 1, 2, 3, 3, 4, 7, 7, 8], 3, 5], expected: [3, 3, 4] },
        { name: 'k equals n', args: [[1, 5, 10], 3, 4], expected: [1, 5, 10] },
        { name: 'x matches a value', args: [[2, 4, 6, 8, 10], 2, 8], expected: [6, 8] },
      ],
      takeaway: 'If the answer is a window of fixed size, you can binary search where the window starts.',
    },
  ],
  quiz: [
    {
      prompt: '`nums = [2, 4, 4, 4, 7]`. What are `lowerBound(nums, 4)` and `upperBound(nums, 4)`?',
      options: ['1 and 4', '1 and 3', '2 and 4', '0 and 5'],
      answer: 0,
      explanation: 'The first value ≥ 4 is at index 1. The first value > 4 is the 7, at index 4. So the 4s live at 1..3, and there are 4 - 1 = 3 of them.',
    },
    {
      prompt: 'In the first-true loop, why do we write `hi = mid` and not `hi = mid - 1`?',
      options: ['`mid` itself might be the first yes', 'It is faster', 'It stops `hi` from going negative', 'It makes no difference'],
      answer: 0,
      explanation: 'When `mid` is a yes, it is a candidate. `mid - 1` could throw away the real answer.',
    },
    {
      prompt: 'Where should 10 be inserted in `[1, 3, 5]`?',
      options: ['3', '2', '-1', '0'],
      answer: 0,
      explanation: 'Every value is smaller, so the answer is n = 3, "after the end". That is why `hi` starts at n.',
    },
    {
      prompt: '`git bisect` on 64 commits. In the worst case, about how many commits do you test?',
      options: ['6', '8', '32', '64'],
      answer: 0,
      explanation: 'Each test halves the range: 64 → 32 → 16 → 8 → 4 → 2 → 1. That is 6 tests, since 2⁶ = 64.',
    },
  ],
  takeaways: [
    'Turn the problem into a yes/no question that is all no, then all yes. Binary search finds the first yes.',
    'First-true template: `while (lo < hi)`, yes → `hi = mid`, no → `lo = mid + 1`, return `lo`.',
    'Lower bound = first `≥ target`. Upper bound = first `> target`. Their difference counts the copies.',
  ],
};

export default lesson;
