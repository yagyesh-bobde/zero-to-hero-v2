// Hidden sample module (route #/dev/sample). It uses every block kind so the renderer can be
// checked before real content lands. Not linked from anywhere and not counted in progress.
import type { Module } from '../types';

const sample: Module = {
  id: 'sample',
  number: 0,
  part: 'foundations',
  title: 'Renderer sample',
  tagline: 'Every block kind, a few problems and a quiz, for checking the UI.',
  draft: false,
  intro:
    'This module exists only to check how the course renders. It has **every block kind**, a linked-list problem, a problem with *unordered* answers and a quiz. Inline `code` should look like code.',
  lessons: [
    {
      id: 'two-sum',
      title: 'Find a pair that adds up',
      summary: 'From checking every pair to one pass with a map.',
      minutes: 15,
      blocks: [
        {
          kind: 'callout',
          tone: 'story',
          title: 'Splitting the bill',
          text: 'You and a friend have a gift card worth **₹900**. The menu has 8 dishes. Which two dishes use the card exactly?',
        },
        {
          kind: 'text',
          text: 'Given an array `nums` and a number `target`, return the indexes of the **two** numbers that add up to `target`. Exactly one answer exists. You may not use the same index twice.',
        },
        {
          kind: 'code',
          lang: 'pseudo',
          title: 'Brute force: try every pair',
          code: `function twoSum(nums, target):
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:          // every pair once
            if nums[i] + nums[j] = target:
                return [i, j]
    return []`,
        },
        {
          kind: 'list',
          items: [
            'Each number is compared with **every** later number.',
            'For `n = 10⁵` that is about *5 billion* checks: too slow.',
            'The waste: we already *saw* the number we need, but we forgot where.',
          ],
        },
        {
          kind: 'callout',
          tone: 'insight',
          text: 'For each number, the partner you need is `target - x`. Remember every number you have seen in a **map** from value to index, and the lookup is instant.',
        },
        {
          kind: 'steps',
          title: 'One pass with a map (target = 13)',
          frames: [
            { cells: [2, 7, 11, 15, 4, 9, 1, 6], pointers: { i: 0 }, active: [0], vars: { need: 11, seen: '{}' }, note: 'Need `13 - 2 = 11`. The map is empty, so remember **2 → 0**.' },
            { cells: [2, 7, 11, 15, 4, 9, 1, 6], pointers: { i: 1 }, active: [1], done: [0], vars: { need: 6, seen: '{2:0}' }, note: 'Need `6`. Not seen yet. Remember **7 → 1**.' },
            { cells: [2, 7, 11, 15, 4, 9, 1, 6], pointers: { i: 2 }, active: [2], done: [0, 1], vars: { need: 2, seen: '{2:0, 7:1}' }, note: 'Need `2`. It *is* in the map at index 0!' },
            { cells: [2, 7, 11, 15, 4, 9, 1, 6], pointers: { i: 2, j: 0 }, found: [0, 2], vars: { answer: '[0, 2]' }, note: 'Return `[0, 2]`. We looked at each number **once**.' },
          ],
        },
        {
          kind: 'steps',
          title: 'Sixteen cells still fit on a phone',
          frames: [
            { cells: [3, 8, 1, 9, 4, 4, 12, 0, 7, 5, 6, 2, 11, 10, 15, 13], pointers: { L: 0, R: 15 }, active: [0, 15], note: 'Two pointers start at both ends.' },
            { cells: [3, 8, 1, 9, 4, 4, 12, 0, 7, 5, 6, 2, 11, 10, 15, 13], pointers: { L: 1, R: 14 }, active: [1, 14], done: [0, 15], note: 'Both move one step inward.' },
            { cells: [3, 8, 1, 9, 4, 4, 12, 0, 7, 5, 6, 2, 11, 10, 15, 13], pointers: { L: 7, R: 8, mid: 7 }, active: [7, 8], done: [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12, 13, 14, 15], note: 'They meet in the middle. Pointers on the same cell stack.' },
          ],
        },
        {
          kind: 'code',
          lang: 'pseudo',
          title: 'One pass with a map',
          code: `function twoSum(nums, target):
    seen ← empty map                    // value → index
    for i from 0 to n - 1:
        need ← target - nums[i]
        if need in seen:
            return [seen[need], i]
        seen[nums[i]] ← i
    return []`,
        },
        {
          kind: 'code',
          lang: 'js',
          code: `function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return []; // a very long trailing comment so the code block has to scroll sideways on a phone
}`,
        },
        {
          kind: 'trace',
          title: 'Dry run on [3, 2, 4], target 6',
          columns: ['i', 'nums[i]', 'need', 'seen before', 'action'],
          rows: [
            [0, 3, 3, '{}', 'store 3 → 0'],
            [1, 2, 4, '{3:0}', 'store 2 → 1'],
            [2, 4, 2, '{3:0, 2:1}', 'found 2 at 1 → return [1, 2]'],
          ],
          note: 'Notice we never store `3` twice: we check *before* we store.',
        },
        {
          kind: 'compare',
          title: 'Approaches',
          rows: [
            { approach: 'Every pair', time: 'O(n²)', space: 'O(1)', note: 'Simple, fine for n ≤ 5000.' },
            { approach: 'Sort + two pointers', time: 'O(n log n)', space: 'O(n)', note: 'Needs to remember original indexes.' },
            { approach: 'Hash map, one pass', time: 'O(n)', space: 'O(n)', note: 'Trades memory for speed. **The interview answer.**' },
          ],
        },
        {
          kind: 'diagram',
          title: 'The map after two steps',
          art: `  seen (Map)
  ┌───────┬───────┐
  │ value │ index │
  ├───────┼───────┤
  │   2   │   0   │
  │   7   │   1   │
  └───────┴───────┘
  need = 13 - 11 = 2  ──►  seen.has(2)  ──►  yes, index 0
  a line that is exactly fifty-six characters long ok!!`,
          caption: 'Looking up `2` costs the same no matter how big the map is.',
        },
        {
          kind: 'table',
          title: 'Constraint → target complexity',
          head: ['n up to', 'Aim for', 'Example'],
          rows: [
            ['20', '`O(2ⁿ)`', 'try every subset'],
            ['5 000', '`O(n²)`', 'every pair'],
            ['10⁶', '`O(n)` or `O(n log n)`', '**one pass** or sort'],
          ],
        },
        { kind: 'callout', tone: 'tip', title: 'Say it out loud', text: 'In an interview, say the brute force first. It shows you understand the problem.' },
        { kind: 'callout', tone: 'trap', text: 'Check the map **before** storing the current number, or `[3, 3]` with target `6` will pair 3 with itself.' },
      ],
      problems: [
        {
          id: 'sample-two-sum',
          title: 'Gift card pair',
          difficulty: 'easy',
          leetcode: 1,
          pattern: 'Hash map lookup',
          statement: 'Return the indexes `[i, j]` (with `i < j`) of the two prices that add up to `target`. Exactly one pair works.',
          examples: [
            { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explain: '`2 + 7 = 9`.' },
            { input: 'nums = [3, 3], target = 6', output: '[0, 1]' },
          ],
          constraints: ['2 ≤ n ≤ 10⁴', 'exactly one answer'],
          hints: [
            'For a price `x`, which price do you need?',
            'You need `target - x`. Can you remember prices you have already seen?',
            'Store each price in a map from value to index, and check the map before storing.',
          ],
          approaches: [
            { name: 'Every pair', idea: 'Try all pairs. It works because one pair must match.', time: 'O(n²)', space: 'O(1)', code: 'function twoSum(nums, target) {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = i + 1; j < nums.length; j++)\n      if (nums[i] + nums[j] === target) return [i, j];\n  return [];\n}' },
            {
              name: 'Hash map',
              idea: 'Walk once. For each `x`, the partner `target - x` is either already in the map (answer!) or not yet seen.',
              pseudo: 'function twoSum(nums, target):\n    seen ← empty map\n    for i from 0 to n - 1:\n        if target - nums[i] in seen:\n            return [seen[target - nums[i]], i]\n        seen[nums[i]] ← i',
              code: 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
              time: 'O(n)',
              space: 'O(n)',
            },
          ],
          fn: 'twoSum',
          starter: 'function twoSum(nums, target) {\n  // return the two indexes\n  return [];\n}',
          solution: 'function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
          tests: [
            { name: 'basic', args: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { name: 'answer at the end', args: [[3, 2, 4], 6], expected: [1, 2] },
            { name: 'duplicates', args: [[3, 3], 6], expected: [0, 1] },
            { name: 'negatives', args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
          ],
          takeaway: 'When you need "the other half", remember what you have seen in a map.',
        },
        {
          id: 'sample-reverse-list',
          title: 'Rewind the playlist',
          difficulty: 'easy',
          leetcode: 206,
          pattern: 'In-place reversal',
          statement: 'A playlist is a linked list of song ids. Reverse it and return the new head.',
          examples: [{ input: 'head = [1, 2, 3]', output: '[3, 2, 1]' }],
          hints: ['Walk the list once.', 'Keep `prev`, `cur` and `next`. Point `cur.next` at `prev`.'],
          approaches: [
            {
              name: 'Three pointers',
              idea: 'Flip each arrow as you walk. Save `next` first so you do not lose the rest.',
              pseudo: 'prev ← null\nwhile cur ≠ null:\n    next ← cur.next\n    cur.next ← prev\n    prev ← cur\n    cur ← next\nreturn prev',
              code: 'function reverseList(head) {\n  let prev = null;\n  while (head) [head.next, prev, head] = [prev, head, head.next];\n  return prev;\n}',
              time: 'O(n)',
              space: 'O(1)',
            },
          ],
          fn: 'reverseList',
          starter: 'function reverseList(head) {\n  // head is a ListNode (or null)\n  return head;\n}',
          solution: 'function reverseList(head) {\n  let prev = null;\n  while (head) {\n    const next = head.next;\n    head.next = prev;\n    prev = head;\n    head = next;\n  }\n  return prev;\n}',
          tests: [
            { name: 'three songs', args: [[1, 2, 3]], expected: [3, 2, 1] },
            { name: 'one song', args: [[7]], expected: [7] },
            { name: 'empty', args: [[]], expected: [] },
            { name: 'two songs', args: [[1, 2]], expected: [2, 1] },
          ],
          shapes: { args: ['list'], result: 'list' },
        },
        {
          id: 'sample-subsets',
          title: 'Every topping combo',
          difficulty: 'medium',
          leetcode: 78,
          pattern: 'Backtracking',
          statement: 'Return every subset of distinct `toppings`. Any order is fine, inside and outside.',
          examples: [{ input: 'nums = [1, 2]', output: '[[], [1], [2], [1, 2]]' }],
          hints: ['Each item is either in or out.', 'Start from `[[]]` and, for each item, copy every subset with the item added.'],
          approaches: [
            { name: 'Bitmask', idea: 'Count from 0 to 2ⁿ - 1; each bit says in or out.', time: 'O(n·2ⁿ)', space: 'O(n·2ⁿ)' },
            {
              name: 'Grow the list',
              idea: 'Every new item doubles the subsets: the old ones, and the old ones plus the item.',
              pseudo: 'result ← [[]]\nfor each x in nums:\n    for each s in copy of result:\n        append s + [x] to result\nreturn result',
              code: 'function subsets(nums) {\n  const out = [[]];\n  for (const x of nums) for (const s of [...out]) out.push([...s, x]);\n  return out;\n}',
              time: 'O(n·2ⁿ)',
              space: 'O(n·2ⁿ)',
            },
          ],
          fn: 'subsets',
          starter: 'function subsets(nums) {\n  // return all subsets\n  return [];\n}',
          solution: 'function subsets(nums) {\n  const out = [[]];\n  for (const x of nums) for (const s of [...out]) out.push([...s, x]);\n  return out;\n}',
          tests: [
            { name: 'two', args: [[1, 2]], expected: [[], [1], [2], [1, 2]] },
            { name: 'empty', args: [[]], expected: [[]] },
            { name: 'three', args: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]] },
            { name: 'one', args: [[0]], expected: [[], [0]] },
          ],
          compare: 'nested',
        },
      ],
      quiz: [
        {
          prompt: 'Why do we check the map **before** storing `nums[i]`?',
          options: ['It is faster', 'So a number never pairs with itself', 'Maps cannot hold duplicates', 'It sorts the map'],
          answer: 1,
          explanation: 'If we stored first, `[3, 3]` with target `6` would match index 0 with itself.',
        },
        {
          prompt: 'What does the hash map trade for speed?',
          options: ['Correctness', 'Memory: `O(n)` extra space', 'Nothing'],
          answer: 1,
          explanation: 'We keep up to `n` entries. More memory, much less time.',
        },
      ],
      takeaways: [
        'Ask: *what do I need*, and *have I seen it already?*',
        'A map turns a search into an instant lookup: `O(n²)` → `O(n)`.',
        'Check before you store when an item must not pair with itself.',
      ],
    },
    {
      id: 'second-lesson',
      title: 'A short second lesson',
      summary: 'Checks prev/next navigation and lesson completion.',
      minutes: 5,
      blocks: [
        { kind: 'text', text: 'Short lesson so prev/next has somewhere to go.' },
        { kind: 'code', lang: 'pseudo', code: 'for each x in list:\n    print x' },
        { kind: 'callout', tone: 'tip', text: 'Prev and next buttons are at the bottom.' },
        { kind: 'list', ordered: true, items: ['Read', 'Solve', 'Quiz'] },
      ],
      problems: [
        {
          id: 'sample-sum',
          title: 'Add them up',
          difficulty: 'easy',
          pattern: 'Loop',
          statement: 'Return the sum of `nums`.',
          examples: [{ input: '[1, 2, 3]', output: '6' }],
          hints: ['Keep a running total.', 'Start the total at 0.'],
          approaches: [{ name: 'Loop', idea: 'Add each number.', pseudo: 'total ← 0\nfor each x in nums:\n    total ← total + x', time: 'O(n)', space: 'O(1)' }],
          fn: 'sum',
          starter: 'function sum(nums) {\n  return 0;\n}',
          solution: 'function sum(nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}',
          tests: [
            { args: [[1, 2, 3]], expected: 6 },
            { args: [[]], expected: 0 },
            { args: [[-1, 1]], expected: 0 },
            { args: [[5]], expected: 5 },
          ],
        },
      ],
      quiz: [
        { prompt: 'Sum of `[]`?', options: ['0', 'undefined'], answer: 0, explanation: 'An empty total is 0.' },
        { prompt: 'Time to sum n numbers?', options: ['O(1)', 'O(n)'], answer: 1, explanation: 'You touch each number once.' },
      ],
      takeaways: ['Start totals at 0.', 'One pass is `O(n)`.'],
    },
  ],
  patterns: [
    {
      name: 'Complement lookup',
      signals: ['"find two numbers that add up to…"', 'pair with a **target** sum or difference', 'need an answer in one pass'],
      template: 'seen ← empty map\nfor each i, x in nums:\n    if target - x in seen:\n        return [seen[target - x], i]\n    seen[x] ← i',
      examples: ['sample-two-sum'],
    },
  ],
  practice: [
    { title: 'Two Sum', leetcode: 1, difficulty: 'easy', hint: 'Map from value to index.' },
    { title: 'Contains Duplicate', leetcode: 217, difficulty: 'easy', hint: 'A set remembers what you have seen.' },
    { title: 'Subarray Sum Equals K', leetcode: 560, difficulty: 'medium', hint: 'Prefix sums plus a count map.' },
  ],
};

export default sample;
