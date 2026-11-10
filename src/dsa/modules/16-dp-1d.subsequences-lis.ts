import type { Lesson, Problem } from '../types';

const lis: Problem = {
  id: 'dp-1d-lis',
  title: 'Longest Increasing Subsequence',
  difficulty: 'medium',
  leetcode: 300,
  pattern: 'Ends-here DP (LIS)',
  statement:
    "Your game score for each day is in `nums`. You want to brag about the longest list of days whose scores **strictly** rise, keeping the days in order but skipping any days you like. Return the length of that longest strictly increasing subsequence.",
  examples: [
    { input: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]', output: '4', explain: 'For example `2, 3, 7, 18`.' },
    { input: 'nums = [0, 1, 0, 3, 2, 3]', output: '4', explain: '`0, 1, 2, 3`.' },
    { input: 'nums = [7, 7, 7, 7]', output: '1', explain: 'Equal values do not count as rising.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 2500', '-10⁴ ≤ nums[i] ≤ 10⁴'],
  hints: [
    'To extend a subsequence you need to know its **last** value. So make the state about where the subsequence ends.',
    'State: `dp[i]` = length of the longest increasing subsequence that **ends at index i**. It can come right after any earlier `j` with `nums[j] < nums[i]`.',
    '`dp[i] = 1 + max(dp[j])` over those `j` (or 1 if none). The answer is the **max of all** `dp[i]`.',
    'Faster: keep `tails[k]` = smallest last value of any increasing subsequence of length `k + 1`. For each `x`, binary search the first tail `≥ x` and replace it (or append).',
  ],
  approaches: [
    {
      name: 'Try every subsequence',
      idea: 'Each element is in or out: check all 2ⁿ subsequences for "strictly increasing" and keep the longest.',
      time: 'O(2ⁿ · n)',
      space: 'O(n)',
    },
    {
      name: 'DP: longest ending here',
      idea: 'A subsequence ending at `i` is one ending at some earlier smaller value, plus `nums[i]`. Try every earlier `j`, keep the best.',
      pseudo: `function lengthOfLIS(nums):
    dp ← array of n cells, all 1       // every element alone has length 1
    for i from 0 to n - 1:
        for j from 0 to i - 1:
            if nums[j] < nums[i]:
                dp[i] ← max(dp[i], dp[j] + 1)
    return max of dp`,
      code: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}`,
      time: 'O(n²)',
      space: 'O(n)',
    },
    {
      name: 'Tails + binary search',
      idea: 'For each length, only the smallest possible last value matters (smaller is easier to extend). `tails` stays sorted, so a binary search finds where each new value goes.',
      pseudo: `function lengthOfLIS(nums):
    tails ← empty list
    for each x in nums:
        lo ← 0
        hi ← length of tails
        while lo < hi:                 // first index with tails[idx] ≥ x
            mid ← floor((lo + hi) / 2)
            if tails[mid] < x:
                lo ← mid + 1
            else:
                hi ← mid
        tails[lo] ← x                  // replace, or append when lo = length
    return length of tails`,
      code: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
      time: 'O(n log n)',
      space: 'O(n)',
    },
  ],
  fn: 'lengthOfLIS',
  starter: `function lengthOfLIS(nums) {
  // dp[i] = longest increasing subsequence ending at i
  return 0;
}`,
  solution: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}`,
  tests: [
    { name: 'classic', args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
    { name: 'with repeats', args: [[0, 1, 0, 3, 2, 3]], expected: 4 },
    { name: 'all equal', args: [[7, 7, 7, 7]], expected: 1 },
    { name: 'one element', args: [[5]], expected: 1 },
    { name: 'already sorted', args: [[1, 2, 3, 4, 5]], expected: 5 },
    { name: 'sorted backwards', args: [[5, 4, 3, 2, 1]], expected: 1 },
    { name: 'answer not at the end', args: [[4, 10, 4, 3, 8, 9]], expected: 3 },
    { name: 'longer mix', args: [[3, 5, 6, 2, 5, 4, 19, 5, 6, 7, 12]], expected: 6 },
  ],
  takeaway: 'When a choice depends on the last element, make the state "best ending at i".',
};

const numberOfLis: Problem = {
  id: 'dp-1d-number-of-lis',
  title: 'Number of Longest Increasing Subsequences',
  difficulty: 'medium',
  leetcode: 673,
  pattern: 'Ends-here DP (LIS)',
  statement:
    "Same scores `nums`. There may be several different longest strictly increasing subsequences (different sets of positions). Return **how many** there are.",
  examples: [
    { input: 'nums = [1, 3, 5, 4, 7]', output: '2', explain: '`1, 3, 4, 7` and `1, 3, 5, 7`.' },
    { input: 'nums = [2, 2, 2, 2, 2]', output: '5', explain: 'The longest length is 1, and each of the 5 positions is one.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 2000', 'the answer fits in a 32-bit integer'],
  hints: [
    'Keep two arrays: `len[i]` (longest ending at `i`, like before) and `cnt[i]` (how many subsequences reach that length ending at `i`).',
    'For each earlier `j` with `nums[j] < nums[i]`: if `len[j] + 1` beats `len[i]`, take it and copy `cnt[i] = cnt[j]`. If it **ties**, add: `cnt[i] += cnt[j]`.',
    'Finally add up `cnt[i]` for every `i` whose `len[i]` equals the overall longest length.',
  ],
  approaches: [
    {
      name: 'List every subsequence',
      idea: 'Generate all increasing subsequences, find the longest length, count those. Correct but exponential.',
      time: 'O(2ⁿ · n)',
      space: 'O(n)',
    },
    {
      name: 'LIS DP with a count',
      idea: 'Alongside "longest ending here" keep "how many ways to get that longest". A new best length resets the count; a tie adds to it (counting DP inside a max DP).',
      pseudo: `function findNumberOfLIS(nums):
    len ← array of n cells, all 1
    cnt ← array of n cells, all 1
    for i from 0 to n - 1:
        for j from 0 to i - 1:
            if nums[j] < nums[i]:
                if len[j] + 1 > len[i]:
                    len[i] ← len[j] + 1
                    cnt[i] ← cnt[j]            // new best: reset the count
                else if len[j] + 1 = len[i]:
                    cnt[i] ← cnt[i] + cnt[j]   // tie: more ways
    best ← max of len
    return sum of cnt[i] where len[i] = best`,
      code: `function findNumberOfLIS(nums) {
  const n = nums.length;
  const len = new Array(n).fill(1);
  const cnt = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] >= nums[i]) continue;
      if (len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        cnt[i] = cnt[j];
      } else if (len[j] + 1 === len[i]) {
        cnt[i] += cnt[j];
      }
    }
  }
  const best = Math.max(...len);
  let total = 0;
  for (let i = 0; i < n; i++) if (len[i] === best) total += cnt[i];
  return total;
}`,
      time: 'O(n²)',
      space: 'O(n)',
    },
  ],
  fn: 'findNumberOfLIS',
  starter: `function findNumberOfLIS(nums) {
  // len[i] and cnt[i] for subsequences ending at i
  return 0;
}`,
  solution: `function findNumberOfLIS(nums) {
  const n = nums.length;
  const len = new Array(n).fill(1);
  const cnt = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] >= nums[i]) continue;
      if (len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        cnt[i] = cnt[j];
      } else if (len[j] + 1 === len[i]) {
        cnt[i] += cnt[j];
      }
    }
  }
  const best = Math.max(...len);
  let total = 0;
  for (let i = 0; i < n; i++) if (len[i] === best) total += cnt[i];
  return total;
}`,
  tests: [
    { name: 'two longest', args: [[1, 3, 5, 4, 7]], expected: 2 },
    { name: 'all equal', args: [[2, 2, 2, 2, 2]], expected: 5 },
    { name: 'one element', args: [[1]], expected: 1 },
    { name: 'several branches', args: [[1, 2, 4, 3, 5, 4, 7, 2]], expected: 3 },
    { name: 'decreasing', args: [[3, 2, 1]], expected: 3 },
    { name: 'sorted', args: [[1, 2, 3]], expected: 1 },
    { name: 'small fork', args: [[1, 3, 2]], expected: 2 },
    { name: 'classic array', args: [[10, 9, 2, 5, 3, 7, 101, 18]], expected: 4 },
  ],
  takeaway: 'To count the best answers, carry a count next to the best value: reset on a new best, add on a tie.',
};

const largestDivisibleSubset: Problem = {
  id: 'dp-1d-largest-divisible-subset',
  title: 'Largest Divisible Subset',
  difficulty: 'medium',
  leetcode: 368,
  pattern: 'Ends-here DP (LIS)',
  statement:
    "Gear sizes `nums` are all different positive numbers. Two gears fit together if the bigger size is a multiple of the smaller one. Return the largest group where **every pair** fits, sorted from small to large. (Every test has exactly one largest group.)",
  examples: [
    { input: 'nums = [3, 4, 16, 8]', output: '[4, 8, 16]' },
    { input: 'nums = [1, 2, 4, 8]', output: '[1, 2, 4, 8]' },
  ],
  constraints: ['1 ≤ nums.length ≤ 1000', '1 ≤ nums[i] ≤ 2·10⁹', 'all values are different'],
  hints: [
    'Sort first. In a sorted chain where each number divides the next, every pair works (if `a | b` and `b | c` then `a | c`).',
    'Now it is LIS with "divides" instead of "less than": `len[i]` = largest chain ending at `nums[i]`, extending any earlier `j` where `nums[i] % nums[j] === 0`.',
    'To return the actual group, also store `prev[i]` = the `j` you extended. Start at the index with the biggest `len` and walk `prev` back.',
  ],
  approaches: [
    {
      name: 'Check every subset',
      idea: 'Try all 2ⁿ subsets and keep the largest where every pair divides. Correct but exponential.',
      time: 'O(2ⁿ · n²)',
      space: 'O(n)',
    },
    {
      name: 'Sort + LIS-style DP with parent pointers',
      idea: 'After sorting, a valid group is a chain where each element divides the next. Find the longest chain like LIS, remembering where each chain came from so you can rebuild it.',
      pseudo: `function largestDivisibleSubset(nums):
    sort nums ascending
    len ← array of n cells, all 1
    prev ← array of n cells, all -1
    best ← 0
    for i from 0 to n - 1:
        for j from 0 to i - 1:
            if nums[i] mod nums[j] = 0 and len[j] + 1 > len[i]:
                len[i] ← len[j] + 1
                prev[i] ← j                 // remember the step back
        if len[i] > len[best]:
            best ← i
    group ← empty list
    i ← best
    while i ≠ -1:
        append nums[i] to group
        i ← prev[i]
    return group reversed`,
      code: `function largestDivisibleSubset(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const n = a.length;
  const len = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  let best = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[i] % a[j] === 0 && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
    if (len[i] > len[best]) best = i;
  }
  const group = [];
  for (let i = best; i !== -1; i = prev[i]) group.push(a[i]);
  return group.reverse();
}`,
      time: 'O(n²)',
      space: 'O(n)',
    },
  ],
  fn: 'largestDivisibleSubset',
  starter: `function largestDivisibleSubset(nums) {
  // sort, then LIS with "divides" + parent pointers
  return [];
}`,
  solution: `function largestDivisibleSubset(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const n = a.length;
  const len = new Array(n).fill(1);
  const prev = new Array(n).fill(-1);
  let best = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (a[i] % a[j] === 0 && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1;
        prev[i] = j;
      }
    }
    if (len[i] > len[best]) best = i;
  }
  const group = [];
  for (let i = best; i !== -1; i = prev[i]) group.push(a[i]);
  return group.reverse();
}`,
  tests: [
    { name: 'powers of two', args: [[1, 2, 4, 8]], expected: [1, 2, 4, 8] },
    { name: 'unsorted input', args: [[3, 4, 16, 8]], expected: [4, 8, 16] },
    { name: 'one gear', args: [[1]], expected: [1] },
    { name: 'long chain', args: [[5, 9, 18, 54, 108, 540, 90, 180, 360, 720]], expected: [9, 18, 90, 180, 360, 720] },
    { name: 'two candidate chains', args: [[2, 3, 4, 9, 8]], expected: [2, 4, 8] },
    { name: 'odd one out', args: [[7, 14, 28, 3]], expected: [7, 14, 28] },
    { name: 'skip a middle value', args: [[4, 8, 10, 240]], expected: [4, 8, 240] },
  ],
  compare: 'unordered',
  takeaway: 'Store a parent pointer when you need the actual answer, not just its size.',
};

export const lesson: Lesson = {
  id: 'subsequences-lis',
  title: 'Subsequences: LIS',
  summary: 'When the next choice depends on the last element picked, the state becomes "best ending here".',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The bragging streak',
      text: "Your game scores this week were `10, 9, 2, 5, 3, 7, 101, 18`. You want to post the longest list of days where the score keeps going **up**, in date order, but you are allowed to leave out bad days. Stock charts, fitness trackers and version histories all ask this same question: what is the longest rising trend if I may skip some points?",
    },
    {
      kind: 'text',
      text: "**The problem.** A **subsequence** keeps the original order but may skip elements (unlike a subarray, which must be one unbroken piece). Find the length of the longest strictly increasing subsequence (LIS). For the scores above it is `4`, e.g. `2, 3, 7, 18` or `2, 5, 7, 101`. **Brute force:** every element is in or out, so there are `2ⁿ` subsequences to check. Correct, but hopeless for `n = 50`.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Make the state about the end',
      text: "\"Longest increasing subsequence of the first `i` elements\" does not work as a state: to know whether `nums[i]` can be added, you need to know the **last** value of that subsequence. So pin it down: `dp[i]` = the longest increasing subsequence that **ends exactly at `nums[i]`**. Now extending is easy: `nums[i]` can come after any earlier `nums[j]` that is smaller.",
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i]` = length of the longest increasing subsequence that ends at index `i`'],
        ['Choice', 'which earlier smaller element `nums[j]` to come right after (or start fresh)'],
        ['Recurrence', '`dp[i] = 1 + max(dp[j])` over `j < i` with `nums[j] < nums[i]`'],
        ['Base case', 'every `dp[i]` starts at 1 (the element alone)'],
        ['Answer', '**max of all** `dp[i]` (the best subsequence can end anywhere)'],
      ],
    },
    {
      kind: 'trace',
      title: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]',
      columns: ['i', 'nums[i]', 'earlier smaller values (their dp)', 'best to extend', 'dp[i]'],
      rows: [
        [0, 10, 'none', '—', 1],
        [1, 9, 'none', '—', 1],
        [2, 2, 'none', '—', 1],
        [3, 5, '2 (1)', '2', 2],
        [4, 3, '2 (1)', '2', 2],
        [5, 7, '2 (1), 5 (2), 3 (2)', '5 or 3', 3],
        [6, 101, '10 (1), 9 (1), 2 (1), 5 (2), 3 (2), 7 (3)', '7', 4],
        [7, 18, '10 (1), 9 (1), 2 (1), 5 (2), 3 (2), 7 (3)', '7', 4],
      ],
      note: "Finished table: `dp = [1, 1, 1, 2, 2, 3, 4, 4]`. Answer = max = 4.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'O(n²): longest ending here',
      code: `function lengthOfLIS(nums):
    dp ← array of n cells, all 1
    for i from 0 to n - 1:
        for j from 0 to i - 1:
            if nums[j] < nums[i]:
                dp[i] ← max(dp[i], dp[j] + 1)
    return max of dp`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
  }
  return Math.max(...dp);
}`,
    },
    {
      kind: 'text',
      text: "**Faster: the tails trick (O(n log n)).** Think of dealing cards into piles. Keep `tails[k]` = the **smallest** last value of any increasing subsequence of length `k + 1` seen so far. A smaller tail is always better, because more future numbers can go after it. `tails` stays sorted, so for each new `x` you binary search (module 5) for the first tail `≥ x`: replace it with `x`, or append `x` if every tail is smaller. The length of `tails` is the answer.",
    },
    {
      kind: 'steps',
      title: 'Building tails for [10, 9, 2, 5, 3, 7, 101, 18]',
      frames: [
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 0 }, active: [0], vars: { tails: '[10]' }, note: "`tails` is empty, so append 10. Best length-1 tail: 10." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 1 }, active: [1], done: [0], vars: { tails: '[9]' }, note: "First tail `≥ 9` is 10: replace it. A length-1 run ending in 9 beats one ending in 10." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 2 }, active: [2], done: [0, 1], vars: { tails: '[2]' }, note: "Replace 9 with 2. Even better: anything above 2 can follow now." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 3 }, active: [3], done: [0, 1, 2], vars: { tails: '[2, 5]' }, note: "Nothing is `≥ 5`, so append: we now have a run of length 2 (`2, 5`)." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 4 }, active: [4], done: [0, 1, 2, 3], vars: { tails: '[2, 3]' }, note: "First tail `≥ 3` is 5: replace. `2, 3` is a better length-2 run than `2, 5`." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 5 }, active: [5], done: [0, 1, 2, 3, 4], vars: { tails: '[2, 3, 7]' }, note: "Append 7: length 3." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 6 }, active: [6], done: [0, 1, 2, 3, 4, 5], vars: { tails: '[2, 3, 7, 101]' }, note: "Append 101: length 4." },
        { cells: [10, 9, 2, 5, 3, 7, 101, 18], pointers: { i: 7 }, found: [2, 4, 5, 7], done: [0, 1, 3, 6], vars: { tails: '[2, 3, 7, 18]' }, note: "Replace 101 with 18. Done: `tails` has 4 entries, so the LIS length is 4 (here `2, 3, 7, 18`)." },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'O(n log n): tails + binary search',
      code: `function lengthOfLIS(nums):
    tails ← empty list
    for each x in nums:
        idx ← first index with tails[idx] ≥ x   // lower bound
        if idx = length of tails:
            append x to tails                  // extends the longest run
        else:
            tails[idx] ← x                     // a smaller tail for that length
    return length of tails`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Every subsequence', time: 'O(2ⁿ · n)', space: 'O(n)', note: 'Correct, only for tiny inputs.' },
        { approach: 'DP: longest ending here', time: 'O(n²)', space: 'O(n)', note: 'Easy to extend (counts, parents, other rules).' },
        { approach: 'Tails + binary search', time: 'O(n log n)', space: 'O(n)', note: 'Fastest, but only gives the length easily.' },
      ],
    },
    {
      kind: 'text',
      text: "**Variations of the O(n²) version.** *Number of LIS*: keep `cnt[i]` next to `dp[i]` — a new best length resets the count, a tie adds to it. *Largest Divisible Subset*: sort first, swap `<` for \"divides\", and store `prev[i]` (which `j` you extended) so you can walk back and rebuild the actual group.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: best ending at i',
      code: `// dp[i] = best answer for a subsequence that ENDS at item i
for i from 0 to n - 1:
    dp[i] ← value of item i alone
    for j from 0 to i - 1:
        if item i may follow item j:
            dp[i] ← better(dp[i], dp[j] + gain of item i)
return best of all dp[i]          // it can end anywhere`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three LIS traps',
      text: "1) The answer is the **max over all** `dp[i]`, not `dp[n - 1]`: in `[1, 2, 0]` the LIS ends at index 1. 2) Strictly increasing means `nums[j] < nums[i]`; in the tails version that is a lower bound (first `≥ x`). Using \"first `> x`\" would allow equal values. 3) `tails` is **not** a real subsequence in general — it only has the right length.",
    },
  ],
  problems: [lis, numberOfLis, largestDivisibleSubset],
  quiz: [
    {
      prompt: 'Why is `dp[i]` defined as "longest increasing subsequence **ending at** i" instead of "in the first i elements"?',
      options: [
        'It uses less memory',
        'To add `nums[i]` you must know the last value of the subsequence; "ending at j" tells you it is `nums[j]`',
        'Because subsequences must end at the last element',
        'It makes the answer `dp[n - 1]`',
      ],
      answer: 1,
      explanation: 'The choice ("can `nums[i]` follow?") depends on the last element, so the state must include it.',
    },
    {
      prompt: 'For `nums = [1, 2, 0]`, the table is `dp = [1, 2, 1]`. What is the answer?',
      options: ['1 (the last cell)', '2 (the max)', '3', '0'],
      answer: 1,
      explanation: 'The best subsequence `1, 2` ends at index 1. Always take the max over all cells.',
    },
    {
      prompt: 'In the tails method, the next value is `x = 4` and `tails = [2, 5, 9]`. What happens?',
      options: ['Append: `[2, 5, 9, 4]`', 'Replace 5: `[2, 4, 9]`', 'Replace 2: `[4, 5, 9]`', 'Nothing'],
      answer: 1,
      explanation: 'The first tail `≥ 4` is 5. A length-2 run ending in 4 is better than one ending in 5.',
    },
  ],
  takeaways: [
    'Subsequence = keep the order, skip anything. Subarray = one unbroken piece.',
    'If the next choice depends on the last pick, use "best ending at i" and answer with the max over all i.',
    'LIS: O(n²) DP is flexible; the tails + binary search version is O(n log n).',
    'Need the actual items? Store a parent pointer and walk it back.',
  ],
};
