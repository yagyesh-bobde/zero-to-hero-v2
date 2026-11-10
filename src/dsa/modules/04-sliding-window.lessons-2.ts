import type { Lesson } from '../types';

// Lesson 2: variable windows, grow right / shrink left (209, 3, 1493, 1658).

const minLenPseudo = `function minSubArrayLen(target, nums):
    left ← 0
    sum ← 0
    best ← infinity
    for right from 0 to n - 1:
        sum ← sum + nums[right]             // grow
        while sum ≥ target:                 // valid: try to shrink
            best ← min(best, right - left + 1)
            sum ← sum - nums[left]
            left ← left + 1
    if best = infinity: return 0
    return best`;

const minLenCode = `function minSubArrayLen(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right]; // grow
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left]; // shrink
      left++;
    }
  }
  return best === Infinity ? 0 : best;
}`;

const uniqueSetCode = `function lengthOfLongestSubstring(s) {
  const inWindow = new Set();
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    while (inWindow.has(s[right])) {
      inWindow.delete(s[left]); // shrink until the repeat is gone
      left++;
    }
    inWindow.add(s[right]);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

const uniqueJumpCode = `function lengthOfLongestSubstring(s) {
  const lastSeen = new Map(); // letter -> last index
  let left = 0;
  let best = 0;
  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; // jump past the old copy
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

const deleteOneCode = `function longestSubarray(nums) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > 1) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left); // length - 1: one item is deleted
  }
  return best;
}`;

const reduceXCode = `function minOperations(nums, x) {
  const total = nums.reduce((a, b) => a + b, 0);
  const target = total - x; // what the kept middle must sum to
  if (target < 0) return -1;
  let left = 0;
  let sum = 0;
  let longest = -1;
  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];
    while (sum > target) {
      sum -= nums[left];
      left++;
    }
    if (sum === target) longest = Math.max(longest, right - left + 1);
  }
  return longest === -1 ? -1 : nums.length - longest;
}`;

export const variableWindowLesson: Lesson = {
  id: 'variable-window',
  title: 'Variable windows: grow and shrink',
  summary: 'Grow the right edge until the window works, shrink the left edge while it still works.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your fastest 5 km',
      text: "Strava shows your **fastest 5 km** even if you ran 12 km that day. It looks at your run log, minute by minute, and finds the shortest stretch of minutes that covers at least 5 km. The window here has no fixed size. It is as long as it needs to be.",
    },
    {
      kind: 'text',
      text: 'Small version: distances per minute `[2, 3, 1, 2, 4, 3]` and `target = 7`. Find the **shortest** run of minutes in a row whose total is **at least 7**. The answer is `2`: the stretch `[4, 3]`. If no stretch reaches the target, return `0`. All numbers are positive.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, grow until it works',
      code: `function minSubArrayLen(target, nums):
    best ← infinity
    for start from 0 to n - 1:
        sum ← 0
        for end from start to n - 1:
            sum ← sum + nums[end]
            if sum ≥ target:
                best ← min(best, end - start + 1)
                stop this inner loop      // longer ends are worse
    if best = infinity: return 0
    return best`,
    },
    {
      kind: 'text',
      text: 'That is **O(n²)**: for each start, the end walks forward again. **Spot the waste.** From start 0, the end walks to index 3 (`2+3+1+2 = 8`). Then for start 1, you walk the end from index 1 again. But you already know `3+1+2 = 8 - 2 = 6`. And the end never needs to go back: if `[0..2]` was too small, `[1..2]` is even smaller.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Two pointers, both only move right',
      text: "**Grow** the right edge until the window is valid (sum ≥ target). Then **shrink** the left edge while it stays valid, recording the length each time. Neither edge ever moves back, so the total work is at most `2n` steps. This works because every number is positive: adding makes the sum bigger, removing makes it smaller.",
    },
    {
      kind: 'steps',
      title: 'Shortest stretch with sum ≥ 7',
      frames: [
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 0, R: 2 },
          active: [0, 1, 2],
          vars: { sum: 6, best: '∞' },
          note: 'Grow: `2 + 3 + 1 = 6`. Still below 7, keep growing.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 0, R: 3 },
          active: [0, 1, 2, 3],
          vars: { sum: 8, best: 4 },
          note: 'Add `2`: sum 8 ≥ 7. Valid, length 4. Now try to shrink.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 1, R: 3 },
          active: [1, 2, 3],
          done: [0],
          vars: { sum: 6, best: 4 },
          note: 'Drop `2`: sum 6. Broken, so stop shrinking and grow again.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 1, R: 4 },
          active: [1, 2, 3, 4],
          done: [0],
          vars: { sum: 10, best: 4 },
          note: 'Add `4`: sum 10. Valid, length 4. Not better yet.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 2, R: 4 },
          active: [2, 3, 4],
          done: [0, 1],
          vars: { sum: 7, best: 3 },
          note: 'Drop `3`: sum 7, still valid. Length 3, new best. Keep shrinking.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 3, R: 4 },
          active: [3, 4],
          done: [0, 1, 2],
          vars: { sum: 6, best: 3 },
          note: 'Drop `1`: sum 6. Broken. Grow.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 3, R: 5 },
          active: [3, 4, 5],
          done: [0, 1, 2],
          vars: { sum: 9, best: 3 },
          note: 'Add `3`: sum 9. Valid, length 3. Shrink.',
        },
        {
          cells: [2, 3, 1, 2, 4, 3],
          pointers: { L: 4, R: 5 },
          found: [4, 5],
          done: [0, 1, 2, 3],
          vars: { sum: 7, best: 2 },
          note: 'Drop `2`: sum 7, valid, length 2. New best. Dropping `4` next breaks it, and R is at the end. Answer: 2.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Grow and shrink', code: minLenPseudo },
    { kind: 'code', lang: 'js', title: 'JavaScript', code: minLenCode },
    {
      kind: 'text',
      text: 'A `while` inside a `for` looks like O(n²), but it is not. Count how many times `left` moves in the whole run: at most `n`, because it only goes right. So the inner loop does at most `n` steps **in total**, not per round.',
    },
    {
      kind: 'compare',
      title: 'Shortest subarray with sum ≥ target',
      rows: [
        { approach: 'Brute force', time: 'O(n²)', space: 'O(1)', note: 'Restarts the end for every start.' },
        { approach: 'Prefix sums + binary search (module 5)', time: 'O(n log n)', space: 'O(n)', note: 'Works, but more moving parts.' },
        { approach: 'Grow / shrink window', time: 'O(n)', space: 'O(1)', note: 'Each edge moves right at most `n` times.' },
      ],
    },
    {
      kind: 'table',
      title: 'Shortest vs longest: same loop, two small changes',
      head: ['You want the…', 'Shrink while…', 'Record the answer…'],
      rows: [
        ['**shortest** valid window', 'the window is **valid**', '**inside** the shrink loop, before removing'],
        ['**longest** valid window', 'the window is **broken**', '**after** the shrink loop, once it is fixed'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: variable window',
      code: `left ← 0
for right from 0 to n - 1:
    add nums[right] to the window

    // shortest: shrink while it works
    while window is valid:
        answer ← min(answer, right - left + 1)
        remove nums[left] from the window
        left ← left + 1

    // longest: shrink until it works again
    while window is broken:
        remove nums[left] from the window
        left ← left + 1
    answer ← max(answer, right - left + 1)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Negative numbers break the window',
      text: "Shrinking only makes sense if removing an item moves you in a known direction. With negatives, dropping an item can make the sum *bigger*, so you cannot tell whether to grow or shrink. For “subarray sums to k” with negatives, use **prefix sums + a hash map** from module 2 instead. Also: return `0` (or `-1`) when nothing was found, never `Infinity`.",
    },
  ],
  problems: [
    {
      id: 'sliding-window-min-size-subarray-sum',
      title: 'Fastest stretch to the target',
      difficulty: 'medium',
      leetcode: 209,
      pattern: 'Sliding window (variable, shortest)',
      statement: "Your run log `nums` has the meters you covered each minute (all positive). Return the length of the **shortest** run of minutes in a row whose total is **at least** `target`. If no run reaches it, return `0`.",
      examples: [
        { input: 'target = 7, nums = [2, 3, 1, 2, 4, 3]', output: '2', explain: '`[4, 3]` sums to 7.' },
        { input: 'target = 4, nums = [1, 4, 4]', output: '1' },
        { input: 'target = 11, nums = [1, 1, 1, 1, 1, 1, 1, 1]', output: '0', explain: 'Even all of it only sums to 8.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '1 ≤ nums[i] ≤ 10⁴', '1 ≤ target ≤ 10⁹'],
      hints: [
        'Once a window reaches the target, any longer window with the same start is worse.',
        'Move the right edge to grow the sum, the left edge to shrink it.',
        'After each grow step, shrink with a `while` loop as long as `sum ≥ target`, recording the length each time.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every start, grow the end until the sum reaches the target. The end restarts for every start, so you re-add the same numbers again and again.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sums + binary search',
          idea: 'Prefix sums only go up (all positive), so for each start you can binary search the first end that reaches the target. Binary search is module 5.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Grow / shrink window',
          idea: 'Grow right until valid, then shrink left while still valid. Positive numbers guarantee shrinking lowers the sum, so no edge ever moves back.',
          pseudo: minLenPseudo,
          code: minLenCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'minSubArrayLen',
      starter: `function minSubArrayLen(target, nums) {
  // Grow right until sum >= target, then shrink left while it holds.
  return 0;
}`,
      solution: minLenCode,
      tests: [
        { name: 'example', args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
        { name: 'single item is enough', args: [4, [1, 4, 4]], expected: 1 },
        { name: 'impossible', args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
        { name: 'needs everything', args: [15, [1, 2, 3, 4, 5]], expected: 5 },
        { name: 'best at the end', args: [11, [1, 2, 3, 4, 5]], expected: 3 },
        { name: 'one element', args: [5, [5]], expected: 1 },
        { name: 'first item alone', args: [6, [10, 2, 3]], expected: 1 },
        { name: 'two halves', args: [100, [50, 50]], expected: 2 },
      ],
      takeaway: 'Shortest window: record the length inside the shrink loop.',
    },
    {
      id: 'sliding-window-longest-unique-substring',
      title: 'Longest shuffle with no repeats',
      difficulty: 'medium',
      leetcode: 3,
      pattern: 'Sliding window (variable, longest)',
      statement: "A music app's play history is a string `s` where each character is a song. Return the length of the **longest stretch in a row with no song played twice**.",
      examples: [
        { input: 's = "abcabcbb"', output: '3', explain: '`"abc"` is the longest with no repeats.' },
        { input: 's = "bbbbb"', output: '1' },
        { input: 's = "pwwkew"', output: '3', explain: '`"wke"`. Note `"pwke"` is not in a row.' },
      ],
      constraints: ['0 ≤ s.length ≤ 5·10⁴', 's can have letters, digits, symbols and spaces'],
      hints: [
        'Longest valid window: the window is broken when some song appears twice.',
        'Keep the songs in the window in a set. When the new song is already in it, shrink from the left until it is gone.',
        'Faster: remember the last index of each song. On a repeat, jump `left` to one past the old copy, but never move `left` backward.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Check every substring and test whether all its characters are different. Lots of substrings, each checked from scratch.',
          time: 'O(n³) (O(n²) with a set per start)',
          space: 'O(n)',
        },
        {
          name: 'Window + set',
          idea: 'Grow right. If the new character is already in the window, shrink from the left until it is not. Every character enters and leaves the set at most once.',
          code: uniqueSetCode,
          time: 'O(n)',
          space: 'O(alphabet)',
        },
        {
          name: 'Window + last-seen map',
          idea: 'Instead of shrinking one step at a time, remember where each character was last seen and jump `left` straight past it. Only jump forward: an old copy that is already outside the window does not count.',
          pseudo: `function lengthOfLongestSubstring(s):
    lastSeen ← empty map              // character → last index
    left ← 0
    best ← 0
    for right from 0 to n - 1:
        c ← s[right]
        if c in lastSeen and lastSeen[c] ≥ left:
            left ← lastSeen[c] + 1      // jump past the old copy
        lastSeen[c] ← right
        best ← max(best, right - left + 1)
    return best`,
          code: uniqueJumpCode,
          time: 'O(n)',
          space: 'O(alphabet)',
        },
      ],
      fn: 'lengthOfLongestSubstring',
      starter: `function lengthOfLongestSubstring(s) {
  // Longest window with no repeated character.
  return 0;
}`,
      solution: uniqueJumpCode,
      tests: [
        { name: 'example', args: ['abcabcbb'], expected: 3 },
        { name: 'all same', args: ['bbbbb'], expected: 1 },
        { name: 'not a subsequence', args: ['pwwkew'], expected: 3 },
        { name: 'empty', args: [''], expected: 0 },
        { name: 'one space', args: [' '], expected: 1 },
        { name: 'repeat in the middle', args: ['dvdf'], expected: 3 },
        { name: 'old copy outside window', args: ['abba'], expected: 2 },
        { name: 'tricky jump', args: ['tmmzuxt'], expected: 5 },
        { name: 'all different', args: ['abcdef'], expected: 6 },
      ],
      takeaway: 'When you jump `left`, use `max`: it must never move backward.',
    },
    {
      id: 'sliding-window-longest-ones-after-delete',
      title: 'Longest streak with one free pass',
      difficulty: 'medium',
      leetcode: 1493,
      pattern: 'Sliding window (variable, longest)',
      statement: "Your fitness app marks each day `1` (goal hit) or `0` (missed). It gives you **one** free pass: you **must** delete exactly one day from the list. Return the length of the longest run of only `1`s you can get after deleting. If there is none, return `0`.",
      examples: [
        { input: 'nums = [1, 1, 0, 1]', output: '3', explain: 'Delete the `0`: `[1, 1, 1]`.' },
        { input: 'nums = [0, 1, 1, 1, 0, 1, 1, 0, 1]', output: '5' },
        { input: 'nums = [1, 1, 1]', output: '2', explain: 'You must delete one day, even a good one.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums[i] is 0 or 1'],
      hints: [
        'Rephrase it: find the longest window that has **at most one** `0`.',
        'The window is broken when it holds two zeros. Shrink until it holds one.',
        'The answer is the window length minus 1, because one item gets deleted.',
      ],
      approaches: [
        {
          name: 'Try deleting each day',
          idea: 'For each index, delete it and scan for the longest run of 1s. Correct, but each scan is O(n).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Window with at most one zero',
          idea: 'Grow right and count zeros. While there are two, move `left` past a zero. Every window with at most one zero becomes a run of 1s after deleting one item, so its length minus 1 is a candidate.',
          pseudo: `function longestSubarray(nums):
    left ← 0
    zeros ← 0
    best ← 0
    for right from 0 to n - 1:
        if nums[right] = 0: zeros ← zeros + 1
        while zeros > 1:                  // broken: shrink
            if nums[left] = 0: zeros ← zeros - 1
            left ← left + 1
        best ← max(best, right - left)   // length - 1
    return best`,
          code: deleteOneCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'longestSubarray',
      starter: `function longestSubarray(nums) {
  // Longest window with at most one 0, minus the deleted item.
  return 0;
}`,
      solution: deleteOneCode,
      tests: [
        { name: 'example', args: [[1, 1, 0, 1]], expected: 3 },
        { name: 'longer', args: [[0, 1, 1, 1, 0, 1, 1, 0, 1]], expected: 5 },
        { name: 'all ones still delete one', args: [[1, 1, 1]], expected: 2 },
        { name: 'all zeros', args: [[0, 0, 0]], expected: 0 },
        { name: 'single one', args: [[1]], expected: 0 },
        { name: 'single zero', args: [[0]], expected: 0 },
        { name: 'two zeros together', args: [[1, 0, 0, 1, 1]], expected: 2 },
        { name: 'best on the right', args: [[1, 1, 0, 0, 1, 1, 1, 0, 1]], expected: 4 },
      ],
      takeaway: 'Rephrase “delete one” as “allow one bad item in the window”.',
    },
    {
      id: 'sliding-window-min-ops-reduce-x',
      title: 'Pay x from both ends',
      difficulty: 'medium',
      leetcode: 1658,
      pattern: 'Sliding window (flip the question)',
      statement: "You have a row of positive numbers `nums` and a bill `x`. Each move, take the **first or last** number from the row and subtract it from `x`. Return the **fewest moves** to make `x` exactly `0`, or `-1` if it cannot be done.",
      examples: [
        { input: 'nums = [1, 1, 4, 2, 3], x = 5', output: '2', explain: 'Take `3` and `2` from the right end.' },
        { input: 'nums = [5, 6, 7, 8, 9], x = 4', output: '-1' },
        { input: 'nums = [3, 2, 20, 1, 1, 3], x = 10', output: '5', explain: 'Take `3, 2` from the left and `1, 1, 3` from the right.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '1 ≤ nums[i] ≤ 10⁴', '1 ≤ x ≤ 10⁹'],
      hints: [
        'Whatever you take comes from the two ends. What is left over?',
        'The numbers you **keep** form one block in the middle, and they sum to `total - x`.',
        'Fewest moves = longest middle block with sum exactly `total - x`. That is a longest-window problem.',
      ],
      approaches: [
        {
          name: 'Try every split',
          idea: 'For each count `a` taken from the left, find how many to take from the right. With two loops this is O(n²). Correct but slow.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Flip it: longest middle window',
          idea: 'Taking from the ends is awkward. Look at what stays instead: one block in the middle with sum `total - x`. Making the removed part small is the same as making the kept block long. All numbers are positive, so a normal grow/shrink window finds the longest block with that exact sum.',
          pseudo: `function minOperations(nums, x):
    target ← sum of nums - x            // the kept middle sums to this
    if target < 0: return -1
    left ← 0
    sum ← 0
    longest ← -1
    for right from 0 to n - 1:
        sum ← sum + nums[right]
        while sum > target:               // too big: shrink
            sum ← sum - nums[left]
            left ← left + 1
        if sum = target:
            longest ← max(longest, right - left + 1)
    if longest = -1: return -1
    return n - longest`,
          code: reduceXCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'minOperations',
      starter: `function minOperations(nums, x) {
  // Hint: what stays in the middle?
  return -1;
}`,
      solution: reduceXCode,
      tests: [
        { name: 'example', args: [[1, 1, 4, 2, 3], 5], expected: 2 },
        { name: 'impossible', args: [[5, 6, 7, 8, 9], 4], expected: -1 },
        { name: 'both ends', args: [[3, 2, 20, 1, 1, 3], 10], expected: 5 },
        { name: 'x bigger than total', args: [[1, 1], 3], expected: -1 },
        { name: 'single item', args: [[5], 5], expected: 1 },
        { name: 'take everything', args: [[1, 2, 3], 6], expected: 3 },
        { name: 'one from the left', args: [[2, 3, 1, 1, 1], 2], expected: 1 },
        { name: 'all ones', args: [[1, 1, 1, 1, 1], 3], expected: 3 },
      ],
      takeaway: 'When you take from both ends, look at the middle that stays.',
    },
  ],
  quiz: [
    {
      prompt: 'Why is the grow/shrink loop O(n) even with a `while` inside a `for`?',
      options: [
        'The `while` runs at most once per round',
        '`left` only moves right, so the `while` runs at most `n` times in total',
        'Because the array is sorted',
        'It is actually O(n log n)',
      ],
      answer: 1,
      explanation: 'Add up all the `left++` steps over the whole run. `left` never moves back, so there are at most `n` of them.',
    },
    {
      prompt: 'You want the **longest** window with at most one zero. Where do you record the answer?',
      options: [
        'Inside the shrink loop, before removing',
        'After the shrink loop, once the window is valid again',
        'Only when `right` reaches the end',
        'Before adding `nums[right]`',
      ],
      answer: 1,
      explanation: 'For longest, you shrink while the window is broken. Only after that is it valid, so that is when you measure it.',
    },
    {
      prompt: 'Which input breaks the grow/shrink window for “shortest subarray with sum ≥ target”?',
      options: ['`[5, 1, 3]`', '`[2, 2, 2, 2]`', '`[4, -3, 5]`', '`[100]`'],
      answer: 2,
      explanation: 'With a negative number, removing an item can raise the sum. The window can no longer tell whether shrinking helps. Prefix sums (module 2) handle negatives.',
    },
  ],
  takeaways: [
    'Grow the right edge, shrink the left edge. Both only move forward, so it is O(n).',
    'Shortest: record while shrinking a valid window. Longest: record after fixing a broken one.',
    'Windows need a one-way effect (like positive numbers). With negatives, reach for prefix sums.',
  ],
};
