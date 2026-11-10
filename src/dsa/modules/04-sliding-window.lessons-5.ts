import type { Lesson } from '../types';

// Lesson 5: counting subarrays and the "at most k" trick (713, 1358, 930, 992).

const productPseudo = `function numSubarrayProductLessThanK(nums, k):
    if k ≤ 1: return 0                     // no product of positives is < 1
    left ← 0
    product ← 1
    count ← 0
    for right from 0 to n - 1:
        product ← product * nums[right]
        while product ≥ k:                 // broken: shrink
            product ← product / nums[left]
            left ← left + 1
        count ← count + (right - left + 1) // every window ending at right
    return count`;

const productCode = `function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) return 0;
  let left = 0;
  let product = 1;
  let count = 0;
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right];
    while (product >= k) {
      product /= nums[left];
      left++;
    }
    count += right - left + 1; // windows ending at right
  }
  return count;
}`;

const threeCharsCode = `function numberOfSubstrings(s) {
  const count = { a: 0, b: 0, c: 0 };
  let left = 0;
  let total = 0;
  for (let right = 0; right < s.length; right++) {
    count[s[right]]++;
    while (count.a > 0 && count.b > 0 && count.c > 0) {
      count[s[left]]--; // shrink while it still has all three
      left++;
    }
    total += left; // starts 0..left-1 all work with this right
  }
  return total;
}`;

const binarySumCode = `function numSubarraysWithSum(nums, goal) {
  const atMost = (g) => {
    if (g < 0) return 0;
    let left = 0;
    let sum = 0;
    let count = 0;
    for (let right = 0; right < nums.length; right++) {
      sum += nums[right];
      while (sum > g) {
        sum -= nums[left];
        left++;
      }
      count += right - left + 1;
    }
    return count;
  };
  return atMost(goal) - atMost(goal - 1);
}`;

const kDistinctCode = `function subarraysWithKDistinct(nums, k) {
  const atMost = (limit) => {
    const count = new Map();
    let left = 0;
    let result = 0;
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) ?? 0) + 1);
      while (count.size > limit) {
        const out = nums[left];
        count.set(out, count.get(out) - 1);
        if (count.get(out) === 0) count.delete(out);
        left++;
      }
      result += right - left + 1;
    }
    return result;
  };
  return atMost(k) - atMost(k - 1);
}`;

export const countingWindowLesson: Lesson = {
  id: 'counting-windows',
  title: 'Counting subarrays: the “at most k” trick',
  summary: 'Count every valid window ending at right in one step, and turn “exactly k” into two “at most” counts.',
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Combo multipliers',
      text: "In a fighting game every hit has a score multiplier, and a combo multiplies them together. The anti-cheat team wants to know **how many** combos (runs of hits in a row) stay under a total multiplier `k`, to spot players whose numbers look too good. They do not want the longest or shortest one. They want a **count**.",
    },
    {
      kind: 'text',
      text: 'Small version (LeetCode 713): multipliers `[10, 5, 2, 6]`, `k = 100`. Count the subarrays whose product is **less than** `100`. They are `[10]`, `[5]`, `[2]`, `[6]`, `[10,5]`, `[5,2]`, `[2,6]`, `[5,2,6]`: **8** in total. `[10,5,2]` is exactly 100, so it does not count.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, extend while it stays small',
      code: `function numSubarrayProductLessThanK(nums, k):
    count ← 0
    for start from 0 to n - 1:
        product ← 1
        for end from start to n - 1:
            product ← product * nums[end]
            if product ≥ k: stop this inner loop
            count ← count + 1
    return count`,
    },
    {
      kind: 'text',
      text: 'That is **O(n²)**. **Spot the waste.** The window part you already know: grow right, shrink left while the product is too big. The new problem is *counting*. Listing every valid subarray one by one is the slow part. There can be about n² of them, so you need to count them without listing.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Count all windows that end at right, at once',
      text: "After shrinking, `[left..right]` is valid. Any shorter window that also ends at `right` is valid too: it has fewer items, so a smaller product. That is `right - left + 1` windows: starting at `left`, `left + 1`, …, `right`. Add that number and move on. Each subarray gets counted exactly once, at its right end.",
    },
    {
      kind: 'steps',
      title: 'Counting products below 100',
      frames: [
        {
          cells: [10, 5, 2, 6],
          pointers: { L: 0, R: 0 },
          active: [0],
          vars: { product: 10, added: 1, count: 1 },
          note: 'Product 10 < 100. Windows ending here: `[10]`. Add 1.',
        },
        {
          cells: [10, 5, 2, 6],
          pointers: { L: 0, R: 1 },
          active: [0, 1],
          vars: { product: 50, added: 2, count: 3 },
          note: 'Product 50. Windows ending here: `[5]`, `[10,5]`. Add `1 - 0 + 1 = 2`.',
        },
        {
          cells: [10, 5, 2, 6],
          pointers: { L: 1, R: 2 },
          active: [1, 2],
          done: [0],
          vars: { product: 10, added: 2, count: 5 },
          note: 'Product 100 is too big. Drop `10`: product 10. Windows: `[2]`, `[5,2]`. Add 2.',
        },
        {
          cells: [10, 5, 2, 6],
          pointers: { L: 1, R: 3 },
          active: [1, 2, 3],
          done: [0],
          vars: { product: 60, added: 3, count: 8 },
          note: 'Product 60. Windows: `[6]`, `[2,6]`, `[5,2,6]`. Add 3. Total: 8.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Count windows ending at each right', code: productPseudo },
    { kind: 'code', lang: 'js', title: 'JavaScript', code: productCode },
    {
      kind: 'text',
      text: '**Now the hard version: “exactly k”.** Click logs are `1` (bought) or `0` (did not). Count the subarrays with **exactly** 2 purchases in `[1, 0, 1, 0, 1]`. A window gets stuck here: when it holds exactly 2, should you grow or shrink? Adding a `0` keeps it at 2, removing a `0` keeps it at 2. There is no single right move.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'exactly(k) = atMost(k) − atMost(k − 1)',
      text: "“At most k” is easy: it is the counting loop you just wrote. And every subarray with **exactly** k is one with at most k, but not one with at most k − 1. So count both and subtract.",
    },
    {
      kind: 'table',
      title: 'Purchases in [1, 0, 1, 0, 1] (15 subarrays in total)',
      head: ['Count', 'Value', 'Which subarrays'],
      rows: [
        ['`atMost(2)`', '14', 'all except the whole array (it has 3)'],
        ['`atMost(1)`', '10', 'the ones with 0 or 1 purchase'],
        ['`exactly(2)`', '14 − 10 = **4**', '`[1,0,1]` twice, `[1,0,1,0]`, `[0,1,0,1]`'],
      ],
    },
    {
      kind: 'compare',
      title: 'Counting subarrays',
      rows: [
        { approach: 'Brute force', time: 'O(n²)', space: 'O(1)', note: 'Looks at every subarray.' },
        { approach: 'Window + add right − left + 1', time: 'O(n)', space: 'O(1)', note: 'Counts all windows ending at `right` in one step.' },
        { approach: 'Exactly k = two at-most runs', time: 'O(n)', space: 'O(1) or O(k)', note: 'Two linear passes, one subtraction.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: counting with “at most” and “exactly”',
      code: `function atMost(nums, k):            // windows whose cost ≤ k
    if k < 0: return 0
    left ← 0
    count ← 0
    for right from 0 to n - 1:
        add nums[right] to the window
        while window cost > k:
            remove nums[left] from the window
            left ← left + 1
        count ← count + (right - left + 1)
    return count

exactly(k) = atMost(nums, k) - atMost(nums, k - 1)`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'At least k: count the starts on the left',
      text: "Sometimes the rule is “at least”: a window that is valid stays valid if you make it **longer**. Then shrink while it is still valid, and after the loop add `left`: every start from `0` to `left - 1` makes a valid window with this `right`. You will use this in “substrings containing all three characters”.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Common slips',
      text: "Add `right - left + 1`, not `1`. Handle edge values: with `k ≤ 1` in the product problem the shrink loop would push `left` past `right`, so return `0` first; `atMost(-1)` must return `0`. And again: this needs a one-way effect. With negative numbers, “sum equals k” needs prefix sums + a hash map (module 2).",
    },
  ],
  problems: [
    {
      id: 'sliding-window-product-less-than-k',
      title: 'Combos under the limit',
      difficulty: 'medium',
      leetcode: 713,
      pattern: 'Sliding window (counting)',
      statement: "Each hit in a combo has a positive multiplier `nums[i]`. Return how many runs of hits **in a row** have a product **strictly less than** `k`.",
      examples: [
        { input: 'nums = [10, 5, 2, 6], k = 100', output: '8' },
        { input: 'nums = [1, 2, 3], k = 0', output: '0', explain: 'No product of positive numbers is below 0.' },
      ],
      constraints: ['1 ≤ n ≤ 3·10⁴', '1 ≤ nums[i] ≤ 1000', '0 ≤ k ≤ 10⁶'],
      hints: [
        'Products of positive numbers only grow as the window grows. So grow/shrink works.',
        'After shrinking, every window that ends at `right` and starts at `left` or later is valid.',
        'Add `right - left + 1` each step. Return `0` right away if `k ≤ 1`.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For each start, multiply forward and stop once the product reaches `k`. Counts each valid subarray one by one.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Window, count by right end',
          idea: 'Keep the product of `[left..right]` below `k` by shrinking. Then all `right - left + 1` windows ending at `right` are valid, because shorter means a smaller product. Each subarray is counted once, at its right end.',
          pseudo: productPseudo,
          code: productCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'numSubarrayProductLessThanK',
      starter: `function numSubarrayProductLessThanK(nums, k) {
  // Count windows with product < k. Add all windows ending at right.
  return 0;
}`,
      solution: productCode,
      tests: [
        { name: 'example', args: [[10, 5, 2, 6], 100], expected: 8 },
        { name: 'k = 0', args: [[1, 2, 3], 0], expected: 0 },
        { name: 'k = 1', args: [[1, 1, 1], 1], expected: 0 },
        { name: 'all ones', args: [[1, 1, 1], 2], expected: 6 },
        { name: 'one item fits', args: [[5], 10], expected: 1 },
        { name: 'one item equals k', args: [[5], 5], expected: 0 },
        { name: 'big first item', args: [[100, 1, 1], 50], expected: 3 },
        { name: 'growing', args: [[2, 3, 4, 5], 60], expected: 8 },
      ],
      takeaway: 'To count windows, add `right - left + 1`: all valid windows ending at `right`.',
    },
    {
      id: 'sliding-window-three-char-substrings',
      title: 'Playlists with all three genres',
      difficulty: 'medium',
      leetcode: 1358,
      pattern: 'Sliding window (counting, at least)',
      statement: "A playlist is a string of `a`, `b` and `c`, one letter per song genre. Return how many stretches of songs **in a row** contain **at least one of each** genre.",
      examples: [
        { input: 's = "abcabc"', output: '10' },
        { input: 's = "aaacb"', output: '3', explain: '`"aaacb"`, `"aacb"`, `"acb"`.' },
        { input: 's = "abc"', output: '1' },
      ],
      constraints: ['3 ≤ s.length ≤ 5·10⁴', 's has only a, b and c'],
      hints: [
        'If a stretch has all three, any longer stretch around it does too. That is an “at least” rule.',
        'For each `right`, shrink `left` while the window still has all three.',
        'After shrinking, the starts `0` to `left - 1` all work with this `right`. Add `left`.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For each start, extend until all three appear. From then on every longer end also works, so add `n - end` and move to the next start. Still restarts for each start.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Window, count the starts on the left',
          idea: 'Grow right. While the window still has all three, drop `s[left]`. Now `[left..right]` is just missing something, but every start before `left` was valid with this `right`. So add `left`.',
          pseudo: `function numberOfSubstrings(s):
    count ← map with a, b, c all set to 0
    left ← 0
    total ← 0
    for right from 0 to n - 1:
        count[s[right]] ← count[s[right]] + 1
        while count[a] > 0 and count[b] > 0 and count[c] > 0:
            count[s[left]] ← count[s[left]] - 1
            left ← left + 1
        total ← total + left              // starts 0 .. left - 1
    return total`,
          code: threeCharsCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'numberOfSubstrings',
      starter: `function numberOfSubstrings(s) {
  // Count substrings that contain a, b and c at least once.
  return 0;
}`,
      solution: threeCharsCode,
      tests: [
        { name: 'example', args: ['abcabc'], expected: 10 },
        { name: 'repeats first', args: ['aaacb'], expected: 3 },
        { name: 'exactly three', args: ['abc'], expected: 1 },
        { name: 'one genre only', args: ['aaa'], expected: 0 },
        { name: 'reversed', args: ['cba'], expected: 1 },
        { name: 'two genres', args: ['abab'], expected: 0 },
        { name: 'extra at the end', args: ['abcc'], expected: 2 },
        { name: 'mixed', args: ['acbbcac'], expected: 11 },
      ],
      takeaway: 'At least k: shrink while still valid, then add `left`.',
    },
    {
      id: 'sliding-window-binary-subarrays-sum',
      title: 'Stretches with exactly g purchases',
      difficulty: 'medium',
      leetcode: 930,
      pattern: 'Sliding window (exactly k = at most k − at most k−1)',
      statement: "A shop logs each visit as `1` (bought something) or `0` (did not). Given the log `nums` and a number `goal`, return how many stretches of visits **in a row** have **exactly** `goal` purchases.",
      examples: [
        { input: 'nums = [1, 0, 1, 0, 1], goal = 2', output: '4' },
        { input: 'nums = [0, 0, 0, 0, 0], goal = 0', output: '15', explain: 'Every one of the 15 subarrays has 0 purchases.' },
      ],
      constraints: ['1 ≤ n ≤ 3·10⁴', 'nums[i] is 0 or 1', '0 ≤ goal ≤ n'],
      hints: [
        'A window with exactly `goal` can grow or shrink over zeros and stay at `goal`. One window is stuck.',
        'Counting windows with sum **at most** `g` is easy: shrink while sum > g, add `right - left + 1`.',
        'Answer = `atMost(goal) - atMost(goal - 1)`. Make `atMost(-1)` return 0.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every start, extend and count ends where the sum equals `goal`.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix sums + hash map',
          idea: 'A subarray sums to `goal` when `prefix[r] - prefix[l] = goal`. Count earlier prefixes in a map, as in module 2. Works even with negatives, but uses O(n) space.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two at-most windows',
          idea: 'Exactly `goal` = at most `goal` minus at most `goal - 1`. Each “at most” is the plain counting window, because with 0s and 1s the sum only goes up when you grow.',
          pseudo: `function numSubarraysWithSum(nums, goal):
    return atMost(goal) - atMost(goal - 1)

function atMost(g):
    if g < 0: return 0
    left ← 0
    sum ← 0
    count ← 0
    for right from 0 to n - 1:
        sum ← sum + nums[right]
        while sum > g:
            sum ← sum - nums[left]
            left ← left + 1
        count ← count + (right - left + 1)
    return count`,
          code: binarySumCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'numSubarraysWithSum',
      starter: `function numSubarraysWithSum(nums, goal) {
  // Hint: exactly(goal) = atMost(goal) - atMost(goal - 1).
  return 0;
}`,
      solution: binarySumCode,
      tests: [
        { name: 'example', args: [[1, 0, 1, 0, 1], 2], expected: 4 },
        { name: 'all zeros, goal 0', args: [[0, 0, 0, 0, 0], 0], expected: 15 },
        { name: 'goal too big', args: [[1, 1, 1], 4], expected: 0 },
        { name: 'single one', args: [[1], 1], expected: 1 },
        { name: 'zeros around a one', args: [[0, 1, 0], 1], expected: 4 },
        { name: 'goal 2 with a gap', args: [[1, 1, 0, 1], 2], expected: 3 },
        { name: 'goal 0 split by a one', args: [[0, 0, 1, 0, 0], 0], expected: 6 },
        { name: 'all ones', args: [[1, 1, 1, 1], 2], expected: 3 },
      ],
      takeaway: '“Exactly k” is stuck; “at most k” is easy. Subtract two at-most counts.',
    },
    {
      id: 'sliding-window-k-distinct-subarrays',
      title: 'Exactly k different genres',
      difficulty: 'hard',
      leetcode: 992,
      pattern: 'Sliding window (exactly k = at most k − at most k−1)',
      statement: "**Stretch problem.** A radio station logs the genre id of each song in `nums`. Return how many stretches of songs **in a row** contain **exactly** `k` different genres.",
      examples: [
        { input: 'nums = [1, 2, 1, 2, 3], k = 2', output: '7', explain: '`[1,2]`, `[2,1]`, `[1,2]`, `[2,3]`, `[1,2,1]`, `[2,1,2]`, `[1,2,1,2]`.' },
        { input: 'nums = [1, 2, 1, 3, 4], k = 3', output: '3', explain: '`[1,2,1,3]`, `[2,1,3]`, `[1,3,4]`.' },
      ],
      constraints: ['1 ≤ n ≤ 2·10⁴', '1 ≤ nums[i], k ≤ n'],
      hints: [
        'With exactly `k` genres, you can often add or drop a repeat and still have `k`. The window is stuck again.',
        'Count windows with **at most** `k` different values: a count map, shrink while `map.size > k`.',
        'Answer = `atMost(k) - atMost(k - 1)`. When a count drops to 0, delete the key so `size` stays right.',
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every start, extend and keep a set of genres. Count ends where the set has exactly `k`, and stop once it passes `k`.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Two at-most windows',
          idea: 'Exactly `k` = at most `k` minus at most `k - 1`. “At most `limit` different values” is a normal counting window: adding an item can only keep or raise the number of different values, so shrinking always helps.',
          pseudo: `function subarraysWithKDistinct(nums, k):
    return atMost(k) - atMost(k - 1)

function atMost(limit):
    count ← empty map                     // value → count in window
    left ← 0
    result ← 0
    for right from 0 to n - 1:
        count[nums[right]] ← count[nums[right]] + 1
        while number of keys in count > limit:
            count[nums[left]] ← count[nums[left]] - 1
            if count[nums[left]] = 0: remove nums[left] from count
            left ← left + 1
        result ← result + (right - left + 1)
    return result`,
          code: kDistinctCode,
          time: 'O(n)',
          space: 'O(k)',
        },
      ],
      fn: 'subarraysWithKDistinct',
      starter: `function subarraysWithKDistinct(nums, k) {
  // Hint: write atMost(limit) first.
  return 0;
}`,
      solution: kDistinctCode,
      tests: [
        { name: 'example', args: [[1, 2, 1, 2, 3], 2], expected: 7 },
        { name: 'three genres', args: [[1, 2, 1, 3, 4], 3], expected: 3 },
        { name: 'all the same', args: [[1, 1, 1], 1], expected: 6 },
        { name: 'k too big', args: [[1, 2, 3], 4], expected: 0 },
        { name: 'single item', args: [[1], 1], expected: 1 },
        { name: 'two singles', args: [[1, 2], 1], expected: 2 },
        { name: 'alternating', args: [[2, 1, 2, 1, 2], 2], expected: 10 },
        { name: 'repeat of the first', args: [[1, 2, 3, 1, 2], 3], expected: 6 },
      ],
      takeaway: 'When “exactly” has no clear move, subtract two “at most” counts.',
    },
  ],
  quiz: [
    {
      prompt: 'After shrinking, the window is `[left..right] = [3..7]` and valid (at-most rule). How many valid subarrays end at index 7?',
      options: ['1', '4', '5', '8'],
      answer: 2,
      explanation: 'Starts 3, 4, 5, 6 and 7 all work: `7 - 3 + 1 = 5`.',
    },
    {
      prompt: 'Why can one window not count “exactly k” directly?',
      options: [
        'It can, the same way as at most',
        'When the window has exactly k, both growing and shrinking can keep it at k, so there is no single right move',
        'Because the numbers are not sorted',
        'Because exactly k needs recursion',
      ],
      answer: 1,
      explanation: 'Many windows with the same right end can have exactly k. A single `left` cannot stand for all of them. Two at-most counts can.',
    },
    {
      prompt: '`atMost(3) = 20` and `atMost(2) = 14`. How many subarrays have exactly 3?',
      options: ['34', '20', '6', '14'],
      answer: 2,
      explanation: '`20 - 14 = 6`. The ones with at most 3, minus the ones with at most 2.',
    },
  ],
  takeaways: [
    'Count windows by their right end: add `right - left + 1` each step.',
    'At least k: shrink while still valid, then add `left`.',
    '`exactly(k) = atMost(k) - atMost(k - 1)` whenever “exactly” has no clear move.',
  ],
};
