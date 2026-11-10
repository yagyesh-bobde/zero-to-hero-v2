import type { Lesson } from '../types';

// Module 2, lessons 5-6: prefix sums, prefix sums + hash map.

export const prefixLesson: Lesson = {
  id: 'prefix-sums',
  title: 'Prefix sums',
  summary: 'Add once from the left; then any range sum is one subtraction.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The step counter',
      text: "Your step-counter app shows a graph of steps per hour. Tap 'from 9 am to 5 pm' and it shows the total instantly, for any range you pick, over years of data. It does not re-add every hour each time. It keeps a **running total** (steps since midnight) and subtracts two numbers: total at 5 pm minus total at 9 am.",
    },
    {
      kind: 'text',
      text: "**The problem (Range Sum Query).** You get an array `nums` once, then many questions `(left, right)`: what is `nums[left] + ... + nums[right]`? For `nums = [2, 5, 1, 4, 3]` (hundreds of steps per hour), the query `(1, 3)` is `5 + 1 + 4 = 10`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: add up every query',
      code: `function rangeSums(nums, queries):
    answers ← empty list
    for each (left, right) in queries:
        total ← 0
        for i from left to right:
            total ← total + nums[i]
        append total to answers
    return answers`,
    },
    {
      kind: 'text',
      text: "Each query costs up to n steps, so q queries cost O(q · n). With 10⁴ queries over 10⁴ hours, that is 10⁸ additions. **Spot the waste:** query `(1, 3)` and query `(0, 4)` both add `5 + 1 + 4`. Every query re-adds numbers we have added before.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Store running totals',
      text: "Build `pre` where `pre[i]` = the sum of the **first i** numbers, so `pre[0] = 0`. Then the sum from `left` to `right` is everything up to `right`, minus everything before `left`: `pre[right + 1] - pre[left]`. One subtraction per query.",
    },
    {
      kind: 'steps',
      title: 'Building pre for nums = [2, 5, 1, 4, 3]',
      frames: [
        {
          cells: [0, '', '', '', '', ''],
          pointers: { i: 0 },
          found: [0],
          vars: { 'pre[i]': 'sum of first i numbers' },
          note: "`pre` has n + 1 slots. `pre[0] = 0`: the sum of zero numbers.",
        },
        {
          cells: [0, 2, '', '', '', ''],
          pointers: { i: 1 },
          active: [1],
          vars: { step: 'pre[1] = pre[0] + nums[0] = 0 + 2' },
          note: "Each slot is the previous slot plus one more number.",
        },
        {
          cells: [0, 2, 7, '', '', ''],
          pointers: { i: 2 },
          active: [2],
          vars: { step: 'pre[2] = 2 + 5' },
          note: "Running total after two hours: 7.",
        },
        {
          cells: [0, 2, 7, 8, 12, 15],
          pointers: { i: 5 },
          active: [3, 4, 5],
          vars: { step: '8 = 7 + 1, 12 = 8 + 4, 15 = 12 + 3' },
          note: "Keep going to the end. One pass, O(n), done once.",
        },
        {
          cells: [0, 2, 7, 8, 12, 15],
          pointers: { left: 1, 'right+1': 4 },
          found: [1, 4],
          vars: { 'sum(1..3)': 'pre[4] - pre[1] = 12 - 2 = 10' },
          note: "Query (1, 3): total of the first 4 numbers minus total of the first 1. That is 5 + 1 + 4 = 10.",
        },
      ],
    },
    {
      kind: 'diagram',
      title: 'Why the subtraction works',
      art: `nums:      2    5    1    4    3
index:     0    1    2    3    4

pre[4] = [ 2 + 5 + 1 + 4 ]          = 12
pre[1] = [ 2 ]                      =  2
            ---------------
pre[4] - pre[1] =  5 + 1 + 4        = 10`,
      caption: "Both totals include the same first part. Subtracting cancels it and leaves exactly the range you asked for.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function rangeSums(nums, queries):
    pre ← list of n + 1 zeros
    for i from 0 to n - 1:
        pre[i + 1] ← pre[i] + nums[i]
    answers ← empty list
    for each (left, right) in queries:
        append pre[right + 1] - pre[left] to answers
    return answers`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function rangeSums(nums, queries) {
  const pre = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
  return queries.map(([left, right]) => pre[right + 1] - pre[left]);
}`,
    },
    {
      kind: 'text',
      text: "**Same trick, other operations: Product of Array Except Self.** For each `i`, return the product of every number except `nums[i]`, without division. Split it: *product of everything to the left of i* times *product of everything to the right of i*. Build the left products in one pass from the left and the right products in one pass from the right.",
    },
    {
      kind: 'trace',
      title: 'nums = [1, 2, 3, 4]',
      columns: ['i', 'nums[i]', 'left of i', 'right of i', 'answer'],
      rows: [
        [0, 1, 1, '2·3·4 = 24', 24],
        [1, 2, 1, '3·4 = 12', 12],
        [2, 3, '1·2 = 2', 4, 8],
        [3, 4, '1·2·3 = 6', 1, 6],
      ],
      note: "Nothing to the left of index 0 and nothing to the right of the last index, so those start at 1 (multiplying by 1 changes nothing, like adding 0).",
    },
    {
      kind: 'compare',
      title: 'q range-sum queries on n numbers',
      rows: [
        { approach: 'Add each range', time: 'O(q · n)', space: 'O(1)', note: 'Re-adds the same numbers for every query.' },
        { approach: 'Prefix sums', time: 'O(n + q)', space: 'O(n)', note: 'O(n) once to build, then O(1) per query.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern: prefix sums.** Reach for it when the problem says *sum of a range / subarray*, *many queries on a fixed array*, *balance*, *running total*, or *left side vs right side* (pivot, product except self). It only helps when the array does not change between queries.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: prefix sums',
      code: `pre ← list of n + 1 zeros            // pre[i] = sum of first i
for i from 0 to n - 1:
    pre[i + 1] ← pre[i] + nums[i]
// sum of nums[left..right], inclusive:
rangeSum ← pre[right + 1] - pre[left]`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The off-by-one',
      text: "If you make `pre` the same length as `nums` (with `pre[i]` = sum *through* i), then a range starting at 0 needs `pre[left - 1]` = `pre[-1]`, which is `undefined` in JS and gives `NaN`. The extra `pre[0] = 0` slot removes that special case. Remember: `pre[right + 1] - pre[left]`.",
    },
  ],
  problems: [
    {
      id: 'hashing-range-sum-query',
      title: 'Range Sum Query',
      difficulty: 'easy',
      leetcode: 303,
      pattern: 'Prefix sums',
      statement: "A step-counter app stores `nums[i]` = steps in hour `i`. It then answers many questions `[left, right]`: total steps from hour `left` to hour `right`, inclusive. Return the list of answers, one per query, in order.",
      examples: [
        { input: 'nums = [-2, 0, 3, -5, 2, -1], queries = [[0, 2], [2, 5], [0, 5]]', output: '[1, -1, -3]', explain: 'The numbers can be negative too (think bank deposits and withdrawals).' },
        { input: 'nums = [2, 5, 1, 4, 3], queries = [[1, 3]]', output: '[10]' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '0 ≤ queries ≤ 10⁴', '0 ≤ left ≤ right < n'],
      hints: [
        "Adding each range from scratch repeats work. What can you build once, before any query?",
        "Running totals: `pre[i]` = sum of the first `i` numbers, with `pre[0] = 0`.",
        "Sum of `left..right` = `pre[right + 1] - pre[left]`.",
      ],
      approaches: [
        {
          name: 'Add each range',
          idea: 'Loop from left to right for every query. Correct, but O(n) per query.',
          time: 'O(q · n)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sums',
          idea: "Everything up to `right` minus everything before `left` leaves exactly the range. Building the running totals once makes every query one subtraction.",
          pseudo: `function rangeSums(nums, queries):
    pre ← list of n + 1 zeros
    for i from 0 to n - 1:
        pre[i + 1] ← pre[i] + nums[i]
    answers ← empty list
    for each (left, right) in queries:
        append pre[right + 1] - pre[left] to answers
    return answers`,
          code: `function rangeSums(nums, queries) {
  const pre = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
  return queries.map(([left, right]) => pre[right + 1] - pre[left]);
}`,
          time: 'O(n + q)',
          space: 'O(n)',
        },
      ],
      fn: 'rangeSums',
      starter: `function rangeSums(nums, queries) {
  // for each [left, right] return nums[left] + ... + nums[right]
  return [];
}`,
      solution: `function rangeSums(nums, queries) {
  const pre = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
  return queries.map(([left, right]) => pre[right + 1] - pre[left]);
}`,
      tests: [
        { name: 'example with negatives', args: [[-2, 0, 3, -5, 2, -1], [[0, 2], [2, 5], [0, 5]]], expected: [1, -1, -3] },
        { name: 'one number', args: [[5], [[0, 0]]], expected: [5] },
        { name: 'no queries', args: [[1, 2, 3], []], expected: [] },
        { name: 'single cells and full range', args: [[2, 5, 1, 4, 3], [[1, 3], [0, 4], [4, 4], [0, 0]]], expected: [10, 15, 3, 2] },
        { name: 'all the same', args: [[7, 7, 7, 7], [[0, 3], [1, 2], [3, 3]]], expected: [28, 14, 7] },
        { name: 'all negative', args: [[-1, -2, -3], [[0, 1], [1, 2]]], expected: [-3, -5] },
      ],
      takeaway: "Build running totals once; every range sum is then pre[right + 1] - pre[left].",
    },
    {
      id: 'hashing-pivot-index',
      title: 'Find the balance point',
      difficulty: 'easy',
      leetcode: 724,
      pattern: 'Prefix sums',
      statement: "Weights hang along a straight bar at positions `0..n-1`. Find the leftmost position `i` where the total weight strictly to the left equals the total strictly to the right. (With nothing on a side, that side's total is 0.) Return `-1` if no such position exists. Weights can be negative.",
      examples: [
        { input: 'nums = [1, 7, 3, 6, 5, 6]', output: '3', explain: 'Left: 1 + 7 + 3 = 11. Right: 5 + 6 = 11.' },
        { input: 'nums = [1, 2, 3]', output: '-1' },
        { input: 'nums = [2, 1, -1]', output: '0', explain: 'Left is empty (0). Right: 1 + (-1) = 0.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '-1000 ≤ nums[i] ≤ 1000'],
      hints: [
        "Summing the left and right side for every `i` is O(n²). What do you know once you have the total?",
        "Keep a running `left` sum as you walk.",
        "The right side is `total - left - nums[i]`. Check `left === right`, then add `nums[i]` to `left`.",
      ],
      approaches: [
        {
          name: 'Sum both sides for every i',
          idea: 'Two inner loops per position. Correct, O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Total minus running left sum',
          idea: "Left + middle + right = total, so once you know the total and the running left sum, the right side is free. One pass after computing the total.",
          pseudo: `function pivotIndex(nums):
    total ← sum of nums
    left ← 0
    for i from 0 to n - 1:
        right ← total - left - nums[i]
        if left = right:
            return i
        left ← left + nums[i]
    return -1`,
          code: `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'pivotIndex',
      starter: `function pivotIndex(nums) {
  // leftmost i where sum left of i equals sum right of i, else -1
  return -1;
}`,
      solution: `function pivotIndex(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}`,
      tests: [
        { name: 'middle', args: [[1, 7, 3, 6, 5, 6]], expected: 3 },
        { name: 'none', args: [[1, 2, 3]], expected: -1 },
        { name: 'index 0', args: [[2, 1, -1]], expected: 0 },
        { name: 'one element', args: [[5]], expected: 0 },
        { name: 'last index', args: [[-1, -1, 0, 1, 1, 0]], expected: 5 },
        { name: 'all zeros, leftmost', args: [[0, 0, 0]], expected: 0 },
      ],
      takeaway: "Right side = total - left - current: one running sum gives you both sides.",
    },
    {
      id: 'hashing-product-except-self',
      title: 'Product of Array Except Self',
      difficulty: 'medium',
      leetcode: 238,
      pattern: 'Prefix and suffix products',
      statement: "For each position `i`, return the product of every number in `nums` except `nums[i]`. Do it in O(n) and **without division** (a single 0 would break division anyway).",
      examples: [
        { input: 'nums = [1, 2, 3, 4]', output: '[24, 12, 8, 6]' },
        { input: 'nums = [0, 4, 5]', output: '[20, 0, 0]' },
      ],
      constraints: ['2 ≤ n ≤ 10⁵', 'every product fits in a 32-bit integer'],
      hints: [
        "The answer at `i` = (product of everything left of `i`) × (product of everything right of `i`).",
        "Fill `answer[i]` with the left product in a pass from the left, starting at 1.",
        "Then walk from the right keeping a running `right` product, and multiply it in.",
      ],
      approaches: [
        {
          name: 'Multiply all others for every i',
          idea: 'An inner loop skips `i` and multiplies the rest. Correct, O(n²).',
          time: 'O(n²)',
          space: 'O(1) extra',
        },
        {
          name: 'Total product, then divide',
          idea: 'Divide the total by `nums[i]`. Fast, but forbidden here, and breaks on zeros.',
          time: 'O(n)',
          space: 'O(1) extra',
        },
        {
          name: 'Left pass, then right pass',
          idea: "Everything except `i` is exactly 'left of i' plus 'right of i'. Running products from each end give both parts in O(n), and the output array can hold the left products so no extra list is needed.",
          pseudo: `function productExceptSelf(nums):
    answer ← list of n ones
    left ← 1
    for i from 0 to n - 1:
        answer[i] ← left              // product of everything before i
        left ← left × nums[i]
    right ← 1
    for i from n - 1 down to 0:
        answer[i] ← answer[i] × right // times everything after i
        right ← right × nums[i]
    return answer`,
          code: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    right *= nums[i];
  }
  return answer;
}`,
          time: 'O(n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'productExceptSelf',
      starter: `function productExceptSelf(nums) {
  // answer[i] = product of all nums except nums[i], no division
  return [];
}`,
      solution: `function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    left *= nums[i];
  }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    right *= nums[i];
  }
  return answer;
}`,
      tests: [
        { name: 'example', args: [[1, 2, 3, 4]], expected: [24, 12, 8, 6] },
        { name: 'negatives', args: [[-1, 2, -3, 4]], expected: [-24, 12, -8, 6] },
        { name: 'two numbers', args: [[2, 3]], expected: [3, 2] },
        { name: 'one zero', args: [[0, 4, 5]], expected: [20, 0, 0] },
        { name: 'zero in the middle', args: [[1, 2, 0, 4]], expected: [0, 0, 8, 0] },
        { name: 'two zeros', args: [[0, 0]], expected: [0, 0] },
        { name: 'ones', args: [[5, 1, 1]], expected: [1, 5, 5] },
      ],
      takeaway: "'Everything except i' = left part × right part; build each with a running value.",
    },
  ],
  quiz: [
    {
      prompt: "`pre = [0, 2, 7, 8, 12, 15]` for `nums = [2, 5, 1, 4, 3]`. What is the sum of `nums[2..4]`?",
      options: ['pre[4] - pre[2] = 5', 'pre[5] - pre[2] = 8', 'pre[5] - pre[1] = 13'],
      answer: 1,
      explanation: "Sum of left..right = pre[right + 1] - pre[left] = pre[5] - pre[2] = 15 - 7 = 8 (1 + 4 + 3).",
    },
    {
      prompt: "Why does `pre` get n + 1 slots with `pre[0] = 0`?",
      options: [
        'So a range that starts at index 0 needs no special case.',
        'Because JavaScript arrays start at 1.',
        'To store the total at the end.',
      ],
      answer: 0,
      explanation: "With `pre[0] = 0`, a range starting at 0 is `pre[right + 1] - pre[0]`, same formula as every other range.",
    },
    {
      prompt: "When do prefix sums stop being a good fit?",
      options: [
        'When the numbers can be negative.',
        'When the array keeps changing between queries.',
        'When there are many queries.',
      ],
      answer: 1,
      explanation: "One change would force you to rebuild every later total. Negatives are fine.",
    },
  ],
  takeaways: [
    "Prefix sums: build running totals once, answer any range in O(1) with pre[right + 1] - pre[left].",
    "Give `pre` an extra leading 0 so ranges starting at index 0 need no special case.",
    "The left-pass / right-pass idea also works for products and other 'everything except i' questions.",
  ],
};

export const prefixHashLesson: Lesson = {
  id: 'prefix-sum-hash-map',
  title: 'Prefix sums + hash map',
  summary: 'Count subarrays with a target sum by looking up earlier running totals.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The bank auditor',
      text: "A bank auditor reads a ledger of daily changes: deposits are positive, withdrawals negative. She asks: *how many stretches of consecutive days changed the balance by exactly +3?* She does not test every stretch. She writes down the running balance each day and asks: *how many earlier days had a balance exactly 3 lower than today?*",
    },
    {
      kind: 'text',
      text: "**The problem (Subarray Sum Equals K).** Count the **subarrays** (unbroken runs of neighbouring elements) whose sum is exactly `k`. For `nums = [1, 2, 1, -1, 2]` and `k = 3` the answer is 3: `[1, 2]`, `[2, 1]` and `[1, 2, 1, -1]`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, every end',
      code: `function subarraySum(nums, k):
    count ← 0
    for i from 0 to n - 1:                 // start
        total ← 0
        for j from i to n - 1:             // end
            total ← total + nums[j]
            if total = k:
                count ← count + 1
    return count`,
    },
    {
      kind: 'text',
      text: "Correct, and already smarter than re-adding each subarray, but still O(n²): 2 × 10⁴ numbers means 2 × 10⁸ steps. Can a sliding window help? No: with negative numbers, growing the window can make the sum smaller, so you never know which way to move (windows are module 4). **Spot the waste:** at each end `j`, the real question is *how many starts make the sum k?* and we answer it by trying every start.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Flip the question',
      text: "Let `prefix` be the running total up to the current index. A subarray that ends here sums to `k` exactly when some **earlier** running total equals `prefix - k`. So keep a map `running total → how many times it has appeared`, and at each step add `count[prefix - k]` to the answer.",
    },
    {
      kind: 'diagram',
      title: 'Why prefix - k',
      art: `   start of array          i             j
   |-----------------------|-------------|
   |  earlier prefix  P    |  subarray   |
   |-------- current prefix  Q ----------|

   subarray sum = Q - P
   Q - P = k   means   P = Q - k`,
      caption: "Every subarray ending at the current position is 'current total minus some earlier total'. Counting earlier totals equal to `Q - k` counts exactly the subarrays with sum `k`.",
    },
    {
      kind: 'trace',
      title: 'nums = [1, 2, 1, -1, 2], k = 3, map starts as {0: 1}',
      columns: ['x', 'prefix', 'need', 'found', 'total', 'map after'],
      rows: [
        [1, 1, -2, 0, 0, '{0:1, 1:1}'],
        [2, 3, 0, 1, 1, '{0:1, 1:1, 3:1}'],
        [1, 4, 1, 1, 2, '{0:1, 1:1, 3:1, 4:1}'],
        [-1, 3, 0, 1, 3, '{0:1, 1:1, 3:2, 4:1}'],
        [2, 5, 2, 0, 3, '{0:1, 1:1, 3:2, 4:1, 5:1}'],
      ],
      note: "`need = prefix - k`, `found = count[need]`. Row 2 finds `[1, 2]`, row 3 finds `[2, 1]`, row 4 finds `[1, 2, 1, -1]`. Answer: 3.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The {0: 1} seed',
      text: "Before the loop, the map must already hold `0 → 1`: the running total of the empty start, *before* index 0. Without it, subarrays that start at index 0 are never found. In the trace above, rows 2 and 4 both used that 0. Without the seed you get **1** instead of 3.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function subarraySum(nums, k):
    seen ← map with {0: 1}              // running total → how many times
    prefix ← 0
    count ← 0
    for each x in nums:
        prefix ← prefix + x
        count ← count + (seen[prefix - k] or 0)
        seen[prefix] ← (seen[prefix] or 0) + 1   // AFTER the lookup
    return count`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let prefix = 0;
  let count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}`,
    },
    {
      kind: 'text',
      text: "**A twist: Contiguous Array.** In a list of 0s and 1s, find the longest subarray with as many 0s as 1s. Trick: count each 0 as **-1**. Equal counts now means *sum = 0*, so we want the longest subarray with sum 0. Two changes from above: we want the **longest**, so store the **first** index where each running total appeared; and the seed is `{0: -1}` (total 0 'at index -1', before the array starts).",
    },
    {
      kind: 'steps',
      title: 'nums = [0, 1, 0, 0, 1, 1, 0], 0 counts as -1',
      frames: [
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          vars: { prefix: 0, first: '{0:-1}', best: 0 },
          note: "Seed: running total 0 is seen 'at index -1', just before the array.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 0 },
          active: [0],
          vars: { prefix: -1, first: '{0:-1, -1:0}', best: 0 },
          note: "A 0 adds -1. Total -1 is new: remember its first index, 0.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 1 },
          found: [0, 1],
          vars: { prefix: 0, first: '{0:-1, -1:0}', best: 2 },
          note: "Total 0 again. First seen at -1, so indexes 0..1 are balanced: length 1 - (-1) = 2.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 2 },
          found: [1, 2],
          vars: { prefix: -1, first: '{0:-1, -1:0}', best: 2 },
          note: "Total -1, first seen at 0: length 2 - 0 = 2. Do not overwrite the first index.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 3 },
          active: [3],
          vars: { prefix: -2, first: '{0:-1, -1:0, -2:3}', best: 2 },
          note: "Total -2 is new. Remember index 3.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 4 },
          found: [1, 2, 3, 4],
          vars: { prefix: -1, first: '{0:-1, -1:0, -2:3}', best: 4 },
          note: "Total -1, first at 0: indexes 1..4 (1, 0, 0, 1) are balanced. Length 4.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 5 },
          found: [0, 1, 2, 3, 4, 5],
          vars: { prefix: 0, first: '{0:-1, -1:0, -2:3}', best: 6 },
          note: "Total 0, first at -1: indexes 0..5 are balanced. Length 6. The seed made this one possible.",
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: { i: 6 },
          found: [1, 2, 3, 4, 5, 6],
          vars: { prefix: -1, first: '{0:-1, -1:0, -2:3}', best: 6 },
          note: "Total -1, first at 0: length 6 again. Answer: 6.",
        },
      ],
    },
    {
      kind: 'compare',
      title: 'Subarray Sum Equals K',
      rows: [
        { approach: 'Every start and end, re-add', time: 'O(n³)', space: 'O(1)', note: 'Sums each subarray from scratch.' },
        { approach: 'Every start, running sum', time: 'O(n²)', space: 'O(1)', note: 'Honest and simple. Too slow at n = 2 × 10⁴.' },
        { approach: 'Sliding window', time: 'O(n)', space: 'O(1)', note: 'Wrong here: only works when all numbers are positive.' },
        { approach: 'Prefix sum + hash map', time: 'O(n)', space: 'O(n)', note: 'Works with negatives. One lookup per element.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern: prefix sum + hash map.** Reach for it when the problem asks to *count* subarrays, or find the *longest* subarray, with a sum (or balance, or remainder) equal to something, **especially when numbers can be negative**. Store counts when you count, first indexes when you want the longest.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: prefix sum + hash map',
      code: `seen ← map with {0: 1}       // counting; use {0: -1} for longest
prefix ← 0
for i from 0 to n - 1:
    prefix ← prefix + value(nums[i])     // maybe 0 → -1, or mod k
    look up seen[prefix - target]        // add count, or i - first index
    record prefix in seen                // count + 1, or first index only`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Order and seeds',
      text: "**Look up before you record**, or with `k = 0` every element would match its own running total. **Seed the map** (`{0: 1}` when counting, `{0: -1}` when measuring length), or subarrays that start at index 0 vanish. **For 'longest', never overwrite** a running total's first index: the earliest start gives the longest run.",
    },
  ],
  problems: [
    {
      id: 'hashing-subarray-sum-k',
      title: 'Subarray Sum Equals K',
      difficulty: 'medium',
      leetcode: 560,
      pattern: 'Prefix sum + hash map',
      statement: "A bank ledger lists daily balance changes (deposits positive, withdrawals negative). Count the stretches of consecutive days (subarrays) whose changes add up to exactly `k`.",
      examples: [
        { input: 'nums = [1, 1, 1], k = 2', output: '2', explain: 'Days 0-1 and days 1-2.' },
        { input: 'nums = [1, 2, 1, -1, 2], k = 3', output: '3', explain: '[1, 2], [2, 1] and [1, 2, 1, -1].' },
      ],
      constraints: ['1 ≤ n ≤ 2 × 10⁴', '-1000 ≤ nums[i] ≤ 1000', '-10⁷ ≤ k ≤ 10⁷'],
      hints: [
        "A sliding window will not work: the numbers can be negative.",
        "Sum of a subarray = (running total now) - (running total just before it started).",
        "Keep a map from running total to how many times you have seen it, seeded with `{0: 1}`. At each step add `seen[prefix - k]`.",
      ],
      approaches: [
        {
          name: 'Every start, running sum',
          idea: 'For each start, extend the end one step at a time and keep a running total. Correct, O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sum + hash map',
          idea: "A subarray ending here has sum `k` exactly when an earlier running total equals `prefix - k`. Counting earlier totals in a map counts all such subarrays in one lookup; the `{0: 1}` seed stands for 'start at index 0'.",
          pseudo: `function subarraySum(nums, k):
    seen ← map with {0: 1}
    prefix ← 0
    count ← 0
    for each x in nums:
        prefix ← prefix + x
        count ← count + (seen[prefix - k] or 0)
        seen[prefix] ← (seen[prefix] or 0) + 1
    return count`,
          code: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let prefix = 0;
  let count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'subarraySum',
      starter: `function subarraySum(nums, k) {
  // count subarrays whose sum is exactly k
  return 0;
}`,
      solution: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let prefix = 0;
  let count = 0;
  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);
  }
  return count;
}`,
      tests: [
        { name: 'all ones', args: [[1, 1, 1], 2], expected: 2 },
        { name: 'lesson example', args: [[1, 2, 1, -1, 2], 3], expected: 3 },
        { name: 'single element match', args: [[1, 2, 3], 3], expected: 2 },
        { name: 'one element, yes', args: [[5], 5], expected: 1 },
        { name: 'one element, no', args: [[5], 3], expected: 0 },
        { name: 'zeros with k = 0', args: [[0, 0, 0], 0], expected: 6 },
        { name: 'negatives, k = 0', args: [[-1, -1, 1], 0], expected: 1 },
        { name: 'alternating', args: [[1, -1, 1, -1], 0], expected: 4 },
        { name: 'mixed', args: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 },
      ],
      takeaway: "Count subarrays with sum k: count earlier running totals equal to prefix - k, seeded with {0: 1}.",
    },
    {
      id: 'hashing-contiguous-array',
      title: 'Contiguous Array',
      difficulty: 'medium',
      leetcode: 525,
      pattern: 'Prefix sum + hash map (first index)',
      statement: "A coin was flipped many times: `0` for tails, `1` for heads. Return the length of the longest unbroken run of flips with exactly as many heads as tails.",
      examples: [
        { input: 'nums = [0, 1]', output: '2' },
        { input: 'nums = [0, 1, 0, 0, 1, 1, 0]', output: '6', explain: 'Indexes 0..5 (or 1..6) have three of each.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums[i] is 0 or 1'],
      hints: [
        "Count a 0 as -1 and a 1 as +1. What is the sum of a balanced run?",
        "You now need the longest subarray with sum 0. When does a running total repeat?",
        "Store the first index of each running total, seeded `{0: -1}`. If the total was seen at index `j`, the run `j+1..i` is balanced: length `i - j`.",
      ],
      approaches: [
        {
          name: 'Every start, running balance',
          idea: 'For each start, extend and track zeros minus ones; record the longest balanced run. O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix balance + first index',
          idea: "With 0 as -1, a run is balanced exactly when the running total is the same at both ends. The longest such run starts right after the **first** time this total appeared, so store only first indexes.",
          pseudo: `function findMaxLength(nums):
    first ← map with {0: -1}         // running total → first index
    prefix ← 0
    best ← 0
    for i from 0 to n - 1:
        if nums[i] = 1:
            prefix ← prefix + 1
        else:
            prefix ← prefix - 1
        if prefix in first:
            best ← max(best, i - first[prefix])
        else:
            first[prefix] ← i
    return best`,
          code: `function findMaxLength(nums) {
  const first = new Map([[0, -1]]);
  let prefix = 0;
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i] === 1 ? 1 : -1;
    if (first.has(prefix)) best = Math.max(best, i - first.get(prefix));
    else first.set(prefix, i);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'findMaxLength',
      starter: `function findMaxLength(nums) {
  // longest subarray with equally many 0s and 1s
  return 0;
}`,
      solution: `function findMaxLength(nums) {
  const first = new Map([[0, -1]]);
  let prefix = 0;
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i] === 1 ? 1 : -1;
    if (first.has(prefix)) best = Math.max(best, i - first.get(prefix));
    else first.set(prefix, i);
  }
  return best;
}`,
      tests: [
        { name: 'two', args: [[0, 1]], expected: 2 },
        { name: 'three', args: [[0, 1, 0]], expected: 2 },
        { name: 'lesson example', args: [[0, 1, 0, 0, 1, 1, 0]], expected: 6 },
        { name: 'one element', args: [[0]], expected: 0 },
        { name: 'all ones', args: [[1, 1, 1]], expected: 0 },
        { name: 'balanced run at the end', args: [[0, 0, 1, 0, 0, 0, 1, 1]], expected: 6 },
        { name: 'whole array', args: [[1, 0, 1, 0, 1, 0]], expected: 6 },
      ],
      takeaway: "Turn 'equal counts' into 'sum 0' with ±1, and keep the FIRST index of each running total for the longest run.",
    },
    {
      id: 'hashing-continuous-subarray-sum',
      title: 'Continuous Subarray Sum',
      difficulty: 'medium',
      leetcode: 523,
      pattern: 'Prefix remainder + hash map',
      statement: "Eggs are packed in boxes of `k`. A farm logs how many eggs each hen laid, in order (`nums`, all ≥ 0). Is there a run of **at least two** neighbouring hens whose eggs fill boxes exactly, that is, whose total is a multiple of `k` (0 counts as a multiple)?",
      examples: [
        { input: 'nums = [23, 2, 4, 6, 7], k = 6', output: 'true', explain: '2 + 4 = 6.' },
        { input: 'nums = [23, 2, 6, 4, 7], k = 13', output: 'false' },
        { input: 'nums = [5, 0, 0, 0], k = 3', output: 'true', explain: '0 + 0 = 0, a multiple of 3.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ nums[i] ≤ 10⁹', '1 ≤ k ≤ 2³¹ - 1'],
      hints: [
        "A subarray sum is a difference of two running totals. When is a difference a multiple of `k`?",
        "When both running totals leave the same remainder after dividing by `k`.",
        "Map remainder → first index, seeded `{0: -1}`. If the remainder was seen at `j` and `i - j ≥ 2`, return true. Never overwrite a first index.",
      ],
      approaches: [
        {
          name: 'Every start, running sum',
          idea: 'For each start, extend to length ≥ 2 and test `sum % k === 0`. O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix remainder + first index',
          idea: "Two running totals with the same remainder differ by a multiple of `k`, so the run between them works. Keeping the earliest index per remainder gives the longest run, which is the best chance to reach length 2.",
          pseudo: `function checkSubarraySum(nums, k):
    first ← map with {0: -1}         // remainder → first index
    prefix ← 0
    for i from 0 to n - 1:
        prefix ← (prefix + nums[i]) mod k
        if prefix in first:
            if i - first[prefix] ≥ 2:
                return true
        else:
            first[prefix] ← i
    return false`,
          code: `function checkSubarraySum(nums, k) {
  const first = new Map([[0, -1]]);
  let prefix = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix = (prefix + nums[i]) % k;
    if (first.has(prefix)) {
      if (i - first.get(prefix) >= 2) return true;
    } else {
      first.set(prefix, i);
    }
  }
  return false;
}`,
          time: 'O(n)',
          space: 'O(min(n, k))',
        },
      ],
      fn: 'checkSubarraySum',
      starter: `function checkSubarraySum(nums, k) {
  // true if some subarray of length >= 2 sums to a multiple of k
  return false;
}`,
      solution: `function checkSubarraySum(nums, k) {
  const first = new Map([[0, -1]]);
  let prefix = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix = (prefix + nums[i]) % k;
    if (first.has(prefix)) {
      if (i - first.get(prefix) >= 2) return true;
    } else {
      first.set(prefix, i);
    }
  }
  return false;
}`,
      tests: [
        { name: 'short run', args: [[23, 2, 4, 6, 7], 6], expected: true },
        { name: 'longer run', args: [[23, 2, 6, 4, 7], 6], expected: true },
        { name: 'none', args: [[23, 2, 6, 4, 7], 13], expected: false },
        { name: 'one element is too short', args: [[0], 1], expected: false },
        { name: 'two zeros', args: [[0, 0], 1], expected: true },
        { name: 'zeros after a number', args: [[5, 0, 0, 0], 3], expected: true },
        { name: 'single multiple is too short', args: [[6], 6], expected: false },
        { name: 'whole array', args: [[2, 4], 6], expected: true },
        { name: 'near misses', args: [[1, 2, 12], 6], expected: false },
        { name: 'do not overwrite first', args: [[1, 0], 2], expected: false },
      ],
      takeaway: "Same remainder twice means the part in between is a multiple of k.",
    },
  ],
  quiz: [
    {
      prompt: "In Subarray Sum Equals K, why does the map start as `{0: 1}`?",
      options: [
        'It stands for the running total before index 0, so subarrays starting at index 0 are counted.',
        'Because k is never 0.',
        'To avoid dividing by zero.',
      ],
      answer: 0,
      explanation: "A subarray from index 0 to j has sum `prefix - 0`. The seed provides that 0.",
    },
    {
      prompt: "Why can't a sliding window solve Subarray Sum Equals K in general?",
      options: [
        'It is too slow.',
        'Negative numbers mean growing the window can lower the sum, so you cannot tell which side to move.',
        'It needs a sorted array.',
      ],
      answer: 1,
      explanation: "Windows rely on 'bigger window = bigger sum', which only holds for non-negative numbers.",
    },
    {
      prompt: "For Contiguous Array (longest balanced run), what do you store per running total?",
      options: ['How many times it appeared', 'The most recent index', 'The first index it appeared at'],
      answer: 2,
      explanation: "The earliest matching start gives the longest run, so never overwrite it.",
    },
    {
      prompt: "Running totals mod 5 are 3 at index 1 and 3 at index 4. What do you know?",
      options: [
        'nums[2] + nums[3] + nums[4] is a multiple of 5.',
        'nums[1] + ... + nums[4] is a multiple of 5.',
        'Nothing useful.',
      ],
      answer: 0,
      explanation: "The run is the part after index 1 up to index 4: indexes 2..4.",
    },
  ],
  takeaways: [
    "Subarray sum = current running total - earlier running total. Look up the earlier one in a map.",
    "Seed the map: `{0: 1}` for counting, `{0: -1}` for longest length.",
    "Store counts to count, first indexes to find the longest. Look up before you record.",
  ],
};
