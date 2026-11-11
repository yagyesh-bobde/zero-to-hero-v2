import type { Lesson } from '../types';

// Module 2, lessons 5-6: prefix sums, prefix sums + hash map.

export const prefixLesson: Lesson = {
  id: 'prefix-sums',
  title: 'Prefix sums',
  summary: 'Save totals from the start so you can add a range by subtracting two totals.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The step counter',
      text: 'Your app records steps each hour: `[2, 5, 1, 4, 3]`, in hundreds. You select hours 1 through 3. It should show `5 + 1 + 4 = 10`. Later, you select a different stretch of hours.',
    },
    {
      kind: 'text',
      text: '**Range Sum Query.** A **range** is a stretch from one position to another, including both ends here. A **query** is one question about the data. Given many `[left, right]` queries, return each range’s sum. The numbers stay the same between questions.',
    },
    {
      kind: 'text',
      text: 'Start by adding the numbers in each requested range. From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length.',
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
      text: 'Queries `[1, 3]` and `[0, 3]` both add 5, 1, and 4. We will save totals once so later queries can reuse them. From module 1: time counts work, and space counts extra storage. O(n) work grows with the input length; O(n²) grows like the number of pairs. Here `q` means the number of queries; O(q · n) allows up to n additions for each one.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Save totals from the start',
      text: 'After reading 2, your total is 2. Add 5 to get 7. Add 1 to get 8. This is a **running total**: keep the total so far and add the next number. A **prefix** is the part from the start, so these saved totals are called **prefix sums**.',
    },
    {
      kind: 'text',
      text: 'Save `pre[0] = 0` for the empty start and `pre[i]` for the total of the first i numbers. Use `pre[right + 1] - pre[left]` to include right and remove everything before left. The array needs n + 1 slots; the animations show only the slots filled so far.',
    },
    {
      kind: 'diagram',
      title: 'Save totals once, then answer each range',
      art: `Start pre with the empty total 0
        |
        v
Add the next input to the last saved total
        |
        v
Save the new total; repeat for every input
        |
        v
For a query, read pre[right + 1] and pre[left]
        |
        v
Subtract the total before the range`,
      caption: 'A slot in pre stores the sum of that many input numbers.',
    },
    {
      kind: 'text',
      text: 'Use `[2, 5, 1, 4, 3]` with query `[1, 3]` and watch `pre` grow; slot 2 holds 7 because the first two input numbers add to 7.',
    },
    {
      kind: 'steps',
      title: 'Build saved totals, then add hours 1 through 3',
      frames: [
        {
          cells: [2, 5, 1, 4, 3],
          vars: {
            'pre (saved totals)': '[0]',
            'numbers added': 0,
          },
          note: 'Save 0 for the empty start so ranges beginning at index 0 use the same rule.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          pointers: { current: 0 },
          active: [0],
          done: [],
          vars: {
            'pre (saved totals)': '[0, 2]',
            'numbers added': 1,
          },
          note: 'Add 2 to 0 and save 2 as the total after the first number.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          vars: {
            'pre (saved totals)': '[0, 2, 7]',
            'numbers added': 2,
          },
          note: 'Add 5 to 2 and save 7 as the total of the first 2 numbers.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          pointers: { current: 2 },
          active: [2],
          done: [0, 1],
          vars: {
            'pre (saved totals)': '[0, 2, 7, 8]',
            'numbers added': 3,
          },
          note: 'Add 1 to 7 and save 8 as the total of the first 3 numbers.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          pointers: { current: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: {
            'pre (saved totals)': '[0, 2, 7, 8, 12]',
            'numbers added': 4,
          },
          note: 'Add 4 to 8 and save 12 as the total of the first 4 numbers.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          pointers: { current: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          vars: {
            'pre (saved totals)': '[0, 2, 7, 8, 12, 15]',
            'numbers added': 5,
          },
          note: 'Add 3 to 12 and save 15 as the total of the first 5 numbers.',
        },
        {
          cells: [2, 5, 1, 4, 3],
          active: [1, 2, 3],
          done: [0, 4],
          found: [1, 2, 3],
          vars: {
            'pre (saved totals)': '[0, 2, 7, 8, 12, 15]',
            left: 1,
            right: 3,
            'range sum': 'pre[4] - pre[1] = 12 - 2 = 10',
          },
          note: 'For indexes 1 through 3, remove the earlier 2 from 12 to leave 5 + 1 + 4 = 10.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Subtracting the saved total before the range removes the numbers you did not ask for.',
    },
    {
      kind: 'text',
      text: 'Use `[-2, 0, 3]` with queries `[0, 2]` and `[1, 2]` and watch the same subtraction work with negative totals and a range starting at 0.',
    },
    {
      kind: 'steps',
      title: 'Negative totals and a range from the start',
      frames: [
        {
          cells: [-2, 0, 3],
          vars: {
            'pre (saved totals)': '[0]',
            'numbers added': 0,
          },
          note: 'Save 0 before any numbers so there is a total before index 0.',
        },
        {
          cells: [-2, 0, 3],
          pointers: { current: 0 },
          active: [0],
          vars: {
            'pre (saved totals)': '[0, -2]',
            'numbers added': 1,
          },
          note: 'Add -2 to 0 and save -2 because saved totals can be negative.',
        },
        {
          cells: [-2, 0, 3],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          vars: {
            'pre (saved totals)': '[0, -2, -2]',
            'numbers added': 2,
          },
          note: 'Add 0 to -2 and save -2 again because each input needs its own total slot.',
        },
        {
          cells: [-2, 0, 3],
          pointers: { current: 2 },
          active: [2],
          done: [0, 1],
          vars: {
            'pre (saved totals)': '[0, -2, -2, 1]',
            'numbers added': 3,
          },
          note: 'Add 3 to -2 and save 1 as the total of all three numbers.',
        },
        {
          cells: [-2, 0, 3],
          active: [0, 1, 2],
          done: [],
          found: [0, 1, 2],
          vars: {
            'pre (saved totals)': '[0, -2, -2, 1]',
            left: 0,
            right: 2,
            'range sum': 'pre[3] - pre[0] = 1 - 0 = 1',
          },
          note: 'For indexes 0 through 2, subtract the empty total 0 to get -2 + 0 + 3 = 1.',
        },
        {
          cells: [-2, 0, 3],
          active: [1, 2],
          done: [0],
          found: [1, 2],
          vars: {
            'pre (saved totals)': '[0, -2, -2, 1]',
            left: 1,
            right: 2,
            'range sum': 'pre[3] - pre[1] = 1 - (-2) = 3',
          },
          note: 'For indexes 1 through 2, subtract -2 to remove the first number and get 0 + 3 = 3.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Saved totals need not increase; subtraction still removes exactly the numbers before the range.',
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
      text: '**Related task: multiply everything except one number.** Multiplying numbers gives their **product**. In `[2, 3, 4]`, the answer for position 1 is `2 * 4 = 8`. Save products from the left and from the right, then multiply them. A **suffix** is the part that ends at the end of the array; a suffix product multiplies that part.',
    },
    {
      kind: 'text',
      text: 'Start an empty side’s product at 1 because multiplying by 1 changes nothing. Save each side’s product before including the current number. The Product of Array Except Self practice below shows the two passes in code.',
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
      text: '**Pattern: save a total before you need it again.** Use prefix sums for many range questions on fixed numbers. A **subarray** is a non-empty, unbroken part of an array: `[5, 1]` is a subarray of `[2, 5, 1, 4]`; `[2, 1]` is not, because it skips 5. Its sum is also a range sum.',
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
      title: 'A slot number is a count, not an input index',
      text: '`pre[3]` adds the first three numbers: input indexes 0, 1, 2. To include input index 3, you need `pre[4]`. For a range starting at 0, subtract `pre[0] = 0`; you never need a slot at -1.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'What changes when the input changes?',
      text: 'If you change the first input number, all later saved totals change too. Prefix sums are a good fit when the numbers stay fixed between queries.',
    },
  ],
  problems: [
    {
      id: 'hashing-range-sum-query',
      title: 'Range Sum Query',
      difficulty: 'easy',
      leetcode: 303,
      pattern: 'Prefix sums',
      statement:
        'You get daily changes in `nums` and questions in `queries`. Each question `[left, right]` asks for the sum from index left through index right, including both ends. Indexes start at 0. Return the answers in query order. For `[2, 5, 1, 4]` and queries `[[1, 3], [0, 1]]`, return `[10, 7]`: 5 + 1 + 4 = 10, and 2 + 5 = 7. The input numbers stay fixed and may be negative.',
      examples: [
        {
          input: 'nums = [2, 5, 1, 4], queries = [[1, 3], [0, 1]]',
          output: '[10, 7]',
          explain: 'The first range is 5 + 1 + 4 = 10. The second is 2 + 5 = 7.',
        },
        {
          input: 'nums = [-2, 0, 3, -5, 2, -1], queries = [[0, 2], [2, 5], [0, 5]]',
          output: '[1, -1, -3]',
          explain:
            'For the first answer, -2 + 0 + 3 = 1. Subtraction of saved totals also works with negative values.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '0 ≤ queries ≤ 10⁴', '0 ≤ left ≤ right < n'],
      hints: [
        'Two questions may add some of the same days. What totals could you save once?',
        'Save pre[i] as the sum of the first i numbers, including pre[0] = 0 before reading any.',
        'For [2, 5, 1, 4], the first four numbers total 12 and the first one totals 2. The range [1, 3] is 12 - 2 = 10. In general, subtract pre[left] from pre[right + 1].',
      ],
      approaches: [
        {
          name: 'Add each range',
          idea: 'For every question, loop through the requested indexes and add their numbers. This works but repeats additions when ranges overlap.',
          time: 'O(q · n)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sums',
          idea: 'Save a running total after each input number, plus 0 for the empty start. The total through right minus the total before left leaves the requested sum, so each question needs one subtraction.',
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
      takeaway: 'Build running totals once; every range sum is then pre[right + 1] - pre[left].',
    },
    {
      id: 'hashing-pivot-index',
      title: 'Find the balance point',
      difficulty: 'easy',
      leetcode: 724,
      pattern: 'Prefix sums',
      statement:
        'Find the first index whose numbers on the left add to the same total as its numbers on the right. Leave out the number at that index. An empty side totals 0. For `[1, 2, 1]`, return 1: the left is 1 and the right is 1. Return -1 if no index works. Numbers may be negative.',
      examples: [
        {
          input: 'nums = [1, 7, 3, 6, 5, 6]',
          output: '3',
          explain: 'Left: 1 + 7 + 3 = 11. Right: 5 + 6 = 11.',
        },
        { input: 'nums = [1, 2, 3]', output: '-1' },
        {
          input: 'nums = [2, 1, -1]',
          output: '0',
          explain: 'Left is empty (0). Right: 1 + (-1) = 0.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '-1000 ≤ nums[i] ≤ 1000'],
      hints: [
        'At each position, the whole total consists of the left side, the current number, and the right side.',
        'Save the whole total once. As you walk, keep the sum of numbers before the current position.',
        'Compute right = total - left - nums[i]. For [1, 2, 1] at index 1: 4 - 1 - 2 = 1. Compare left and right before adding nums[i] to left.',
      ],
      approaches: [
        {
          name: 'Sum both sides for every i',
          idea: 'At each position, add every number on its left and then every number on its right. Compare the two totals and return the first equal pair; this repeatedly adds the same numbers.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Total minus running left sum',
          idea: 'Compute the whole total once and keep a running sum for the left side. Subtract the left sum and current number to get the right sum, so each new position takes only a few operations.',
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
      takeaway: 'Right side = total - left - current: one running sum gives you both sides.',
    },
    {
      id: 'hashing-product-except-self',
      title: 'Product of Array Except Self',
      difficulty: 'medium',
      leetcode: 238,
      pattern: 'Prefix and suffix products',
      statement:
        'For each index i, return the product of all numbers in `nums` except `nums[i]`. Product means the result of multiplying. For `[2, 3, 4]`, return `[12, 8, 6]`: 3 * 4 = 12, 2 * 4 = 8, and 2 * 3 = 6. Use no division. Aim for O(n), meaning work grows with the input length.',
      examples: [
        {
          input: 'nums = [2, 3, 4]',
          output: '[12, 8, 6]',
          explain: 'Leave out each position in turn: 3 × 4, 2 × 4, then 2 × 3.',
        },
        {
          input: 'nums = [0, 4, 5]',
          output: '[20, 0, 0]',
          explain: 'Leaving out 0 gives 4 × 5 = 20. Every other product includes 0.',
        },
      ],
      constraints: ['2 ≤ n ≤ 10⁵', 'every product fits in a 32-bit integer'],
      hints: [
        'For one index, the numbers you keep are exactly those on its left and those on its right.',
        'For [2, 3, 4], save left products [1, 2, 6]. Save the product before multiplying in the current number. An empty side starts at 1 because multiplying by 1 changes nothing.',
        'Walk back from the right with right = 1. At index 2 get 6 * 1 = 6, then right becomes 4. At index 1 get 2 * 4 = 8, then right becomes 12. At index 0 get 1 * 12 = 12.',
      ],
      approaches: [
        {
          name: 'Multiply all others for every i',
          idea: 'For each position, loop through all other positions and multiply their numbers. It works even with zeros, but repeats most multiplications.',
          time: 'O(n²)',
          space: 'O(1) extra',
        },
        {
          name: 'Total product, then divide',
          idea: 'Multiplying the entire array and dividing by each current number would be quick when there are no zeros. This task forbids division, and dividing by zero would not produce the required answer.',
          time: 'O(n)',
          space: 'O(1) extra',
        },
        {
          name: 'Left pass, then right pass',
          idea: 'For [2, 3, 4], first save products to the left: [1, 2, 6]. A walk from the right supplies products [12, 4, 1]; multiplying the two sides at each index gives [12, 8, 6] without division.',
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
      takeaway: 'Save the product before each position, then multiply by the product after it.',
    },
  ],
  quiz: [
    {
      prompt:
        '`pre = [0, 2, 7, 8, 12, 15]` for `nums = [2, 5, 1, 4, 3]`. What is the sum of `nums[2..4]`?',
      options: ['pre[4] - pre[2] = 5', 'pre[5] - pre[2] = 8', 'pre[5] - pre[1] = 13'],
      answer: 1,
      explanation:
        'Sum of left..right = pre[right + 1] - pre[left] = pre[5] - pre[2] = 15 - 7 = 8 (1 + 4 + 3).',
    },
    {
      prompt: 'Why does `pre` get n + 1 slots with `pre[0] = 0`?',
      options: [
        'So a range that starts at index 0 needs no special case.',
        'Because JavaScript arrays start at 1.',
        'To store the total at the end.',
      ],
      answer: 0,
      explanation:
        'With `pre[0] = 0`, a range starting at 0 is `pre[right + 1] - pre[0]`, same formula as every other range.',
    },
    {
      prompt: 'When do prefix sums stop being a good fit?',
      options: [
        'When the numbers can be negative.',
        'When the array keeps changing between queries.',
        'When there are many queries.',
      ],
      answer: 1,
      explanation: 'One change would force you to rebuild every later total. Negatives are fine.',
    },
  ],
  takeaways: [
    'A prefix sum is a saved total from the start.',
    '`pre[i]` adds the first i numbers; `pre[0] = 0` adds none.',
    'A range sum is `pre[right + 1] - pre[left]`, including both ends.',
    'For products on each side, start an empty side at 1.',
  ],
};

export const prefixHashLesson: Lesson = {
  id: 'prefix-sum-hash-map',
  title: 'Prefix sums + hash map',
  summary: 'Remember earlier totals to count unbroken stretches that add to a target.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The bank ledger',
      text: 'Your daily balance changes are `[1, 2, 1]`. How many unbroken stretches add to 3? Days 0 through 1 give `1 + 2 = 3`. Days 1 through 2 give `2 + 1 = 3`. There are 2.',
    },
    {
      kind: 'text',
      text: '**Subarray Sum Equals K.** A subarray is a non-empty stretch of neighbouring items, with no skipped positions. Count all subarrays whose sum equals `k`. Different starting positions count separately, even when their numbers match. Deposits can be positive, withdrawals negative.',
    },
    {
      kind: 'text',
      text: 'Start at each position and keep adding one more day. Count each time the total equals k. From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length.',
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
      text: 'For each ending day, you still try every possible starting day. We will reuse saved totals to count those starts without trying them one by one. From module 1: time counts work, and space counts extra storage. O(n) work grows with the input length; O(n²) grows like the number of pairs.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Subtract an earlier total',
      text: 'The total through `[1, 2, 1]` is 4. Removing the total 1 from before the last two days leaves `4 - 1 = 3`. So when the current total is 4 and you want 3, ask for earlier total `4 - 3 = 1`. In general, the earlier total you need is `current total - k`.',
    },
    {
      kind: 'text',
      text: 'The map `seen` saves running total -> number of appearances; `3 -> 2` means the running total has been 3 twice, not that the input contained two 3s. Start with `0 -> 1` for the empty start, and save each new total only after asking about earlier totals.',
    },
    {
      kind: 'diagram',
      title: 'Count stretches ending at the next item',
      art: `Add the next item to the running total
        |
        v
Needed earlier total = running total - target
        |
        v
Is that earlier total saved?
  | yes                       | no
  v                           v
Add its saved count       Add nothing
  |                           |
  +-------------+-------------+
                v
Save one more appearance of the running total
                |
                v
Take the next item`,
      caption: 'Ask about earlier totals before saving the current one so you count only non-empty stretches.',
    },
    {
      kind: 'text',
      text: 'Use `[1, 2, 1, -1, 2]` with target `k = 3` and watch `prefix` (the running total), `count` (the answer), and every entry in `seen` after each item.',
    },
    {
      kind: 'steps',
      title: 'Count three stretches, including a withdrawal',
      frames: [
        {
          cells: [1, 2, 1, -1, 2],
          vars: {
            'prefix (running total)': 0,
            'seen (total -> times seen)': '0 -> 1',
            'count (answer)': 0,
          },
          note: 'Save total 0 once before any input so a stretch can begin at index 0.',
        },
        {
          cells: [1, 2, 1, -1, 2],
          pointers: { current: 0 },
          active: [0],
          done: [],
          found: [],
          vars: {
            'prefix (running total)': 1,
            'earlier total needed': '1 - 3 = -2',
            'new stretches': 0,
            'count (answer)': 0,
            'seen (total -> times seen)': '0 -> 1, 1 -> 1',
          },
          note: 'Need total -2, but it has not appeared, so save total 1 with no new stretch.',
        },
        {
          cells: [1, 2, 1, -1, 2],
          pointers: { current: 1 },
          active: [1],
          done: [],
          found: [0, 1],
          vars: {
            'prefix (running total)': 3,
            'earlier total needed': '3 - 3 = 0',
            'new stretches': 1,
            'count (answer)': 1,
            'seen (total -> times seen)': '0 -> 1, 1 -> 1, 3 -> 1',
          },
          note: 'The starting total 0 gives one stretch, [1, 2], so add 1 before saving total 3.',
        },
        {
          cells: [1, 2, 1, -1, 2],
          pointers: { current: 2 },
          active: [2],
          done: [0],
          found: [1, 2],
          vars: {
            'prefix (running total)': 4,
            'earlier total needed': '4 - 3 = 1',
            'new stretches': 1,
            'count (answer)': 2,
            'seen (total -> times seen)': '0 -> 1, 1 -> 1, 3 -> 1, 4 -> 1',
          },
          note: 'Earlier total 1 leaves [2, 1], so add 1 before saving total 4.',
        },
        {
          cells: [1, 2, 1, -1, 2],
          pointers: { current: 3 },
          active: [3],
          done: [],
          found: [0, 1, 2, 3],
          vars: {
            'prefix (running total)': 3,
            'earlier total needed': '3 - 3 = 0',
            'new stretches': 1,
            'count (answer)': 3,
            'seen (total -> times seen)': '0 -> 1, 1 -> 1, 3 -> 2, 4 -> 1',
          },
          note: 'Earlier total 0 gives [1, 2, 1, -1], then total 3 gets its second appearance.',
        },
        {
          cells: [1, 2, 1, -1, 2],
          pointers: { current: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          found: [],
          vars: {
            'prefix (running total)': 5,
            'earlier total needed': '5 - 3 = 2',
            'new stretches': 0,
            'count (answer)': 3,
            'seen (total -> times seen)': '0 -> 1, 1 -> 1, 3 -> 2, 4 -> 1, 5 -> 1',
          },
          note: 'No earlier total 2 exists, so save total 5 and keep the answer at 3.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'An earlier total tells you where to cut off the start; subtracting it leaves a stretch with the target sum.',
    },
    {
      kind: 'text',
      text: 'Use `[0, 0]` with target `k = 0` and watch one saved total represent several possible starts; ask for its old count before increasing it.',
    },
    {
      kind: 'steps',
      title: 'Two zeros make three stretches',
      frames: [
        {
          cells: [0, 0],
          vars: {
            'prefix (running total)': 0,
            'seen (total -> times seen)': '0 -> 1',
            'count (answer)': 0,
          },
          note: 'The starting total 0 has appeared once before the array, so save count 1.',
        },
        {
          cells: [0, 0],
          pointers: { current: 0 },
          active: [0],
          done: [],
          found: [0],
          vars: {
            'prefix (running total)': 0,
            'earlier total needed': '0 - 0 = 0',
            'new stretches': '1: index 0 alone',
            'count (answer)': 1,
            'seen (total -> times seen)': '0 -> 2',
          },
          note: 'The first 0 matches the starting total once, then raises the saved count to 2.',
        },
        {
          cells: [0, 0],
          pointers: { current: 1 },
          active: [1],
          done: [],
          found: [0, 1],
          vars: {
            'prefix (running total)': 0,
            'earlier total needed': '0 - 0 = 0',
            'new stretches': '2: [0] at index 1, and [0, 0]',
            'count (answer)': 3,
            'seen (total -> times seen)': '0 -> 3',
          },
          note: 'The second 0 matches two earlier totals, giving index 1 alone and indexes 0 through 1.',
        },
        {
          cells: [0, 0],
          done: [],
          found: [0, 1],
          vars: {
            'prefix (running total)': 0,
            'seen (total -> times seen)': '0 -> 3',
            'count (answer)': '1 + 2 = 3',
            'all matching index ranges': '0..0, 1..1, 0..1',
          },
          note: 'Return 3 because each single zero and the pair form different non-empty stretches.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Counts preserve different starting positions with the same total, and the starting `0 -> 1` counts stretches that begin at index 0.',
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
  const seen = new Map([[0, 1]]); // one [key, value] pair: total 0 seen once
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
      text: '**Next task: the longest balanced stretch.** In `[0, 1, 0, 1]`, all 4 items form a stretch with two 0s and two 1s. Call that stretch **balanced**. This time you want a length, so the map must save where a total first appeared instead of how often.',
    },
    {
      kind: 'text',
      text: 'Read each 0 as -1 and each 1 as +1, so a balanced stretch adds to 0. The map `first` saves total -> first input index; `-1 -> 0` means total -1 first appeared at index 0. Keep the earliest index to leave room for the longest stretch.',
    },
    {
      kind: 'text',
      text: 'Use `[0, 1, 0, 0, 1, 1, 0]` and watch repeated totals find a balanced stretch while their first saved indexes stay unchanged.',
    },
    {
      kind: 'steps',
      title: 'Keep the first index to find six balanced items',
      frames: [
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          vars: {
            'prefix (running total)': 0,
            'first (total -> first index)': '0 -> -1',
            'best (longest length)': 0,
          },
          note: 'Save total 0 at index -1 because that position means before the first input.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 0,
          },
          active: [0],
          done: [],
          found: [],
          vars: {
            'prefix (running total)': -1,
            'first (total -> first index)': '0 -> -1, -1 -> 0',
            'best (longest length)': 0,
          },
          note: 'Read 0 as -1 and save its first index 0 because total -1 is new.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 1,
          },
          active: [1],
          done: [],
          found: [0, 1],
          vars: {
            'prefix (running total)': 0,
            'first (total -> first index)': '0 -> -1, -1 -> 0',
            'best (longest length)': 2,
          },
          note: 'Read 1 as +1; total 0 was at -1, so [0, 1] is balanced with length 1 - (-1) = 2.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 2,
          },
          active: [2],
          done: [0],
          found: [1, 2],
          vars: {
            'prefix (running total)': -1,
            'first (total -> first index)': '0 -> -1, -1 -> 0',
            'best (longest length)': 2,
          },
          note: 'Total -1 was first at 0, so [1, 0] has length 2 - 0 = 2 and the first index stays 0.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 3,
          },
          active: [3],
          done: [0],
          found: [1, 2],
          vars: {
            'prefix (running total)': -2,
            'first (total -> first index)': '0 -> -1, -1 -> 0, -2 -> 3',
            'best (longest length)': 2,
          },
          note: 'Read 0 as -1 and save index 3 because total -2 has not appeared before.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 4,
          },
          active: [4],
          done: [0],
          found: [1, 2, 3, 4],
          vars: {
            'prefix (running total)': -1,
            'first (total -> first index)': '0 -> -1, -1 -> 0, -2 -> 3',
            'best (longest length)': 4,
          },
          note: 'Total -1 was first at 0, so [1, 0, 0, 1] has length 4 - 0 = 4.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 5,
          },
          active: [5],
          done: [],
          found: [0, 1, 2, 3, 4, 5],
          vars: {
            'prefix (running total)': 0,
            'first (total -> first index)': '0 -> -1, -1 -> 0, -2 -> 3',
            'best (longest length)': 6,
          },
          note: 'Total 0 was first at -1, so the first six items balance with length 5 - (-1) = 6.',
        },
        {
          cells: [0, 1, 0, 0, 1, 1, 0],
          pointers: {
            current: 6,
          },
          active: [6],
          done: [0],
          found: [1, 2, 3, 4, 5, 6],
          vars: {
            'prefix (running total)': -1,
            'first (total -> first index)': '0 -> -1, -1 -> 0, -2 -> 3',
            'best (longest length)': 6,
          },
          note: 'Total -1 was first at 0, so the last six items also balance and the answer stays 6.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Equal totals enclose a balanced stretch; keeping the first index makes that stretch as long as possible.',
    },
    {
      kind: 'list',
      items: [
        '**A further variation: full boxes of size 6.** After a total of 8 items, 2 are left over after filling a box. After a total of 20, 2 are also left over. That leftover is the **remainder**: `8 % 6 = 2` and `20 % 6 = 2`. Pseudocode writes `%` as `mod`.',
        'The items added between those totals are `20 - 8 = 12`: exactly two boxes. Equal remainders mean the stretch between them adds to a **multiple** of 6, a number made of whole groups of 6.',
        'For Continuous Subarray Sum, save each remainder’s first index. A match gives a possible stretch; also check that its length is at least 2. The initial `0 → -1` lets a stretch begin at index 0.',
      ],
      ordered: true,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'One alternative in the comparison',
      text: 'A sliding window is a stretch whose ends move as you search; module 4 teaches it. Adding a negative number can lower a stretch’s total, so a simple grow-or-shrink rule does not work here.',
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
      text: '**Pattern: prefix sums with a map.** For a target sum, ask for an earlier total that is k smaller. Store counts to count stretches; store first indexes to measure the longest.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: count stretches with a target sum',
      code: `seen ← map with {0: 1}             // total → earlier appearances
prefix ← 0
count ← 0
for each x in nums:
    prefix ← prefix + x
    need ← prefix - k
    count ← count + (seen[need] or 0)
    seen[prefix] ← (seen[prefix] or 0) + 1
return count`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Read earlier totals before saving the current one',
      text: 'With `[0]` and k = 0, the initial total 0 gives one real stretch. If you saved the new total first, you would count 2, including an empty stretch. Keep the initial entry. For a longest-length question, keep the first index whenever a total repeats.',
    },
  ],
  problems: [
    {
      id: 'hashing-subarray-sum-k',
      title: 'Subarray Sum Equals K',
      difficulty: 'medium',
      leetcode: 560,
      pattern: 'Prefix sum + hash map',
      statement:
        'A bank records daily changes in `nums`: positive for money added and negative for money taken out. Count non-empty stretches of neighbouring days whose changes add to exactly k. For `[1, 1, 1]` and k = 2, days 0–1 and days 1–2 each add to 2, so return 2. These stretches are subarrays; they can overlap.',
      examples: [
        { input: 'nums = [1, 1, 1], k = 2', output: '2', explain: 'Days 0-1 and days 1-2.' },
        {
          input: 'nums = [1, 2, 1, -1, 2], k = 3',
          output: '3',
          explain: '[1, 2], [2, 1] and [1, 2, 1, -1].',
        },
      ],
      constraints: ['1 ≤ n ≤ 2 × 10⁴', '-1000 ≤ nums[i] ≤ 1000', '-10⁷ ≤ k ≤ 10⁷'],
      hints: [
        'At one ending day, how could an earlier running total tell you which stretch adds to k?',
        'A stretch adds to current total minus total before its start. So look for earlier total = current total - k.',
        'Start with 0 → 1 because total 0 occurred once before the first day. For [1, 2] and k = 3: totals become 1, then 3. At 3, the needed earlier total is 0, giving one stretch from day 0.',
        'Save total → number of earlier appearances. At each day, add the count for prefix - k, or 0 if missing. Only then increase the count for the current prefix.',
      ],
      approaches: [
        {
          name: 'Every start, running sum',
          idea: 'Choose every starting day and extend the stretch one day at a time, keeping its total. This checks every start-and-end pair without re-adding each whole stretch.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sum + hash map',
          idea: 'At current total 4 with target 3, each earlier total of 1 gives one matching stretch. Save counts of earlier totals, including 0 → 1 before the input, and ask for current total minus k before recording the current total.',
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
      takeaway: 'Count earlier totals that are k smaller; include the total 0 before any input.',
    },
    {
      id: 'hashing-contiguous-array',
      title: 'Contiguous Array',
      difficulty: 'medium',
      leetcode: 525,
      pattern: 'Prefix sum + hash map (first index)',
      statement:
        'A coin-flip log uses 0 for tails and 1 for heads. Return the length of the longest unbroken stretch with equal numbers of each. For `[0, 1, 0]`, the first two flips have one of each and length 2; all three do not match, so return 2. The title “contiguous” means neighbouring positions with no gaps.',
      examples: [
        {
          input: 'nums = [0, 1, 0]',
          output: '2',
          explain:
            'Either neighbouring pair has one 0 and one 1. The whole array has two 0s but one 1.',
        },
        {
          input: 'nums = [0, 1, 0, 0, 1, 1, 0]',
          output: '6',
          explain: 'Indexes 0 through 5 contain three 0s and three 1s, giving length 6.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums[i] is 0 or 1'],
      hints: [
        'Treat each 0 as -1 and each 1 as +1. A stretch with equal counts now adds to 0.',
        'Equal running totals mean the part between them adds to 0. To get the longest part, remember each total’s first index.',
        'Start with 0 → -1 for total 0 before the array. For [0, 1], totals are -1 at index 0 and 0 at index 1; matching the starting total gives length 1 - (-1) = 2.',
        'At index i, if total was first seen at j, the balanced stretch starts at j + 1 and has length i - j. Keep the largest length and never replace an earlier saved index.',
      ],
      approaches: [
        {
          name: 'Every start, running balance',
          idea: 'Start at each index and extend through later positions, counting 0s and 1s. Whenever the two counts match, compare this stretch’s length with the best so far.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix balance + first index',
          idea: 'Count a 0 as -1 and a 1 as +1, so a balanced stretch adds to 0. Save each total’s first index, starting with 0 → -1 before the input; a repeated total at index i gives length i minus its first index.',
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
      takeaway:
        'Treat 0 as -1, then matching totals mark a balanced stretch. Keep the first index for the longest length.',
    },
    {
      id: 'hashing-continuous-subarray-sum',
      title: 'Continuous Subarray Sum',
      difficulty: 'medium',
      leetcode: 523,
      pattern: 'Prefix remainder + hash map',
      statement:
        'Eggs are packed in boxes holding k eggs each. `nums` lists each hen’s egg count, in order. Return true if a stretch of at least two neighbouring hens fills whole boxes with no eggs left over. For `[2, 4]` and k = 6, 2 + 4 = 6 fills one box, so return true. A total of 0 also qualifies. All counts are non-negative.',
      examples: [
        { input: 'nums = [23, 2, 4, 6, 7], k = 6', output: 'true', explain: '2 + 4 = 6.' },
        { input: 'nums = [23, 2, 6, 4, 7], k = 13', output: 'false' },
        {
          input: 'nums = [5, 0, 0, 0], k = 3',
          output: 'true',
          explain: '0 + 0 = 0, a multiple of 3.',
        },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ nums[i] ≤ 10⁹', '1 ≤ k ≤ 2³¹ - 1'],
      hints: [
        'A remainder is the leftover after division. For k = 6, totals 8 and 20 both leave 2; their difference 12 fills whole boxes.',
        'The sum of a stretch is the current running total minus an earlier one. Matching remainders mean that difference is a multiple of k, meaning a whole number of boxes.',
        'Save remainder → first index, starting with 0 → -1 before the input. For [2, 4] and k = 6: remainders become 2 at index 0, then 0 at index 1. The match at -1 gives length 1 - (-1) = 2.',
        'At each index, update the remainder using (remainder + nums[i]) % k. If it was seen before, require i - first[remainder] >= 2. Save only the first index of each remainder. Pseudocode uses mod for %.',
      ],
      approaches: [
        {
          name: 'Every start, running sum',
          idea: 'Choose each starting hen and add counts through later hens. For every stretch of at least two hens, check that dividing its total by k leaves remainder 0.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix remainder + first index',
          idea: 'Totals 8 and 20 leave the same remainder after division by 6, so their difference 12 is a whole number of boxes. Remember each remainder’s first index and check that the distance to a matching index is at least 2; at most the smaller of n + 1 and k different remainders are stored.',
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
      takeaway:
        'Matching running-total remainders mark whole boxes; also require a stretch of at least two hens.',
    },
  ],
  quiz: [
    {
      prompt: 'For `[1, 2]` and k = 3, why start the map with `0 → 1`?',
      options: [
        'It counts the total before reading any numbers, so the whole stretch can be found.',
        'The array must contain a zero.',
        'It sets the answer to 1.',
      ],
      answer: 0,
      explanation:
        'The final total is 3. You need earlier total 3 - 3 = 0, which occurred once before the array.',
    },
    {
      prompt:
        'Your current total is 7, k is 3, and earlier total 4 appeared twice. How many matching stretches end here?',
      options: ['0', '1', '2'],
      answer: 2,
      explanation:
        'Each earlier total of 4 gives a different start whose stretch adds to 7 - 4 = 3.',
    },
    {
      prompt:
        'For the longest balanced stretch, total 0 first appears at position -1 and appears again at index 3. What length does this give?',
      options: ['2', '3', '4'],
      answer: 2,
      explanation: '3 - (-1) = 4. The imaginary position -1 lets the stretch include index 0.',
    },
    {
      prompt:
        'Running totals 8 and 20 both leave remainder 2 after division by 6. What is the sum between them?',
      options: ['2', '12, a whole number of groups of 6', '28'],
      answer: 1,
      explanation: 'Subtract the earlier total: 20 - 8 = 12. The equal leftovers cancel.',
    },
  ],
  takeaways: [
    'A stretch’s sum is the current running total minus the total before it began.',
    'For counting, save total → count and start with `0 → 1` for the empty start.',
    'For longest length, save total → first index and start with `0 → -1`.',
    'Ask about earlier totals before saving the current total.',
  ],
};
