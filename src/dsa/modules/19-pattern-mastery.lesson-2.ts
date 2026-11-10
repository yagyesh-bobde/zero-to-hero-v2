import type { Lesson } from '../types';

// Module 19, lesson 2. Owner: Content J.
const lesson: Lesson = {
  id: 'mixed-arrays-strings',
  title: 'Mixed set A: arrays & strings',
  summary: 'No labels this time: underline the signal words, name the pattern, then code.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Five envelopes',
      text: "A shop owner writes down how much cash came in each day. Some days are negative (refunds). She wants to know: how many runs of back-to-back days add up to an amount she can split **evenly into 5 envelopes**? Nobody tells her which algorithm to use. That is what an interview feels like too.",
    },
    {
      kind: 'text',
      text: "In real interviews the problem never says *use a sliding window*. You have to find the pattern yourself. Lesson 1 gave you the signals table. Now you practice using it on problems with no label.",
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        "**Underline the words that matter.** *subarray* or *contiguous* (a range with no gaps), *at most k*, *longest*, *sum*, *divisible*, *how many*, *more than n/3*, *cancel out* or *collide*.",
        "**Ask what brute force would do.** Usually: try every range, or simulate step by step.",
        "**Spot the waste.** What does brute force compute again and again?",
        "**Name the pattern and its module** before you type any code. Then write its template.",
      ],
    },
    {
      kind: 'text',
      text: "Try it on the shop problem. Input: `nums = [4, 5, 0, -2, -3, 1]`, `k = 5`. Underline: *runs of back-to-back days* (contiguous subarray), *add up* (sum), *split evenly into 5* (divisible by k), *how many* (count). Answer: **7** runs, for example `[5]`, `[5, 0]`, `[0]` and `[4, 5, 0, -2, -3, 1]`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every start, keep a running sum',
      code: `function countDivisible(nums, k):
    count ← 0
    for i from 0 to n - 1:              // start of the range
        sum ← 0
        for j from i to n - 1:          // end of the range
            sum ← sum + nums[j]
            if sum mod k = 0:
                count ← count + 1
    return count                        // O(n²) time, O(1) space`,
    },
    {
      kind: 'text',
      text: "It works, but look at the waste. The range starting at 1 re-adds `5, 0, -2…`, which the range starting at 0 already added. Every start adds the same numbers again. A **prefix sum** (the total of everything up to index i, module 2) stops that: the sum of a range is `prefix[j] - prefix[i - 1]`. But checking every pair of prefixes is still O(n²). We need one more idea.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Same remainder = good range',
      text: "If two prefix sums leave the **same remainder** when you divide by k, the numbers between them add up to a multiple of k. Example: prefix 9 and prefix 4 both leave remainder 4 with k = 5, and 9 - 4 = 5. So you do not need pairs. Walk left to right, and at each step ask: *how many earlier prefixes had my remainder?* Keep those counts in a map.",
    },
    {
      kind: 'steps',
      title: 'Counting remainders for [4, 5, 0, -2, -3, 1], k = 5',
      frames: [
        {
          cells: [4, 5, 0, -2, -3, 1],
          vars: { sum: 0, rem: 0, seen: '{0:1}', answer: 0 },
          note: "Before we start, the empty prefix has sum 0, so remainder 0 has been seen **once**.",
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 0 },
          active: [0],
          vars: { sum: 4, rem: 4, seen: '{0:1, 4:1}', answer: 0 },
          note: 'Sum 4, remainder 4. No earlier prefix had remainder 4, so add 0. Then record it.',
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 1 },
          active: [1],
          found: [1],
          vars: { sum: 9, rem: 4, seen: '{0:1, 4:2}', answer: 1 },
          note: 'Sum 9, remainder 4. One earlier prefix had remainder 4, so one good range ends here: `[5]`.',
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 2 },
          active: [2],
          found: [1, 2],
          vars: { sum: 9, rem: 4, seen: '{0:1, 4:3}', answer: 3 },
          note: 'Remainder 4 again, seen twice before: add 2. The ranges are `[5, 0]` and `[0]`.',
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 3 },
          active: [3],
          vars: { sum: 7, rem: 2, seen: '{0:1, 4:3, 2:1}', answer: 3 },
          note: 'Sum 7, remainder 2. Never seen, so add 0.',
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 4 },
          active: [4],
          found: [1, 2, 3, 4],
          vars: { sum: 4, rem: 4, seen: '{0:1, 4:4, 2:1}', answer: 6 },
          note: 'Sum 4, remainder 4, seen 3 times: add 3. Ranges ending here start at index 1, 2 and 3.',
        },
        {
          cells: [4, 5, 0, -2, -3, 1],
          pointers: { i: 5 },
          active: [5],
          found: [0, 1, 2, 3, 4, 5],
          vars: { sum: 5, rem: 0, seen: '{0:2, 4:4, 2:1}', answer: 7 },
          note: 'Sum 5, remainder 0. The empty prefix matches, so the whole array counts. Answer: **7**.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Prefix remainder counts',
      code: `function countDivisible(nums, k):
    seen ← map with seen[0] ← 1         // the empty prefix
    sum ← 0
    count ← 0
    for each x in nums:
        sum ← (sum + x) mod k           // always 0 to k - 1
        count ← count + seen[sum]       // earlier prefixes with my remainder
        seen[sum] ← seen[sum] + 1
    return count`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0);
  seen[0] = 1; // the empty prefix
  let rem = 0;
  let count = 0;
  for (const x of nums) {
    rem = (((rem + x) % k) + k) % k; // keep it in 0..k-1
    count += seen[rem];
    seen[rem]++;
  }
  return count;
}`,
    },
    {
      kind: 'compare',
      title: 'Three ways to count',
      rows: [
        { approach: 'Brute force (running sum per start)', time: 'O(n²)', space: 'O(1)', note: 'Simple and correct. Re-adds the same numbers for every start.' },
        { approach: 'Prefix sums, check every pair', time: 'O(n²)', space: 'O(n)', note: 'Each range sum is now O(1), but there are still n² pairs.' },
        { approach: 'Prefix remainder counts', time: 'O(n + k)', space: 'O(k)', note: 'One pass. A map (or array of size k) answers *how many earlier prefixes match me?*' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'JavaScript keeps the minus sign',
      text: "In JS, `-1 % 5` is `-1`, not `4`. So prefix sums -1 and 4 would land in different buckets even though they match. Fix it with `((x % k) + k) % k`. Second trap: forget `seen[0] = 1` and you miss every range that starts at index 0.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: count subarrays with a property (module 2)',
      code: `seen ← map with seen[start key] ← 1   // the empty prefix
running ← start value
for each x in nums:
    running ← update(running, x)        // sum, sum mod k, parity...
    answer ← answer + seen[key you need]
    seen[key(running)] ← seen[key(running)] + 1`,
    },
    {
      kind: 'table',
      title: 'How you would triage the other three',
      head: ['Problem', 'Words to underline', 'Question to ask yourself'],
      rows: [
        ['Flip k zeros', '*longest*, *in a row*, *at most k* zeros', 'If a range breaks the rule, do I need to start over, or can I just move one end?'],
        ['Popular votes', '*more than n/3*, *all values*, *O(1) extra space*', 'How many different values can possibly pass that bar? Can you get away with tracking only that many?'],
        ['Asteroid crash', '*right* vs *left*, *collide*, *smaller one explodes*, *keeps going*', 'When a left-mover arrives, which asteroid does it hit first? If that one dies, who is next?'],
      ],
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-sums-divisible-by-k',
      title: 'Cash runs that split evenly',
      difficulty: 'medium',
      leetcode: 974,
      pattern: 'Mixed set A',
      statement: "A shop logs its daily cash flow in `nums` (refund days are negative). Count how many runs of back-to-back days (non-empty, contiguous) have a total that divides evenly by `k`. A total of 0 counts, and so do negative totals like -5 when k = 5.",
      examples: [
        { input: 'nums = [4, 5, 0, -2, -3, 1], k = 5', output: '7', explain: 'For example `[5]`, `[0]`, `[5, 0]`, `[-2, -3]` and the whole array.' },
        { input: 'nums = [5], k = 9', output: '0' },
      ],
      constraints: ['1 ≤ n ≤ 3·10⁴', '-10⁴ ≤ nums[i] ≤ 10⁴', '1 ≤ k ≤ 10⁴'],
      hints: [
        "Which pattern fits? Underline *back-to-back days*, *total* and *how many*. What tool turns any range total into a quick subtraction?",
        "Prefix sums plus a hash map of counts (module 2). Two prefixes bound a good range when their difference divides by k.",
        "Store the **remainder** of each prefix sum mod k. At each step, add how many earlier prefixes had the same remainder. Start with remainder 0 seen once, and fix negative remainders with `((x % k) + k) % k`.",
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'Try every start, extend to every end, and keep a running sum. Check the sum mod k each time. Correct, but the same numbers get re-added for every start.',
          code: `function subarraysDivByK(nums, k) {
  let count = 0;
  for (let i = 0; i < nums.length; i++) {
    let sum = 0;
    for (let j = i; j < nums.length; j++) {
      sum += nums[j];
      if (sum % k === 0) count++;
    }
  }
  return count;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Prefix remainder counts',
          idea: 'A range total divides by k exactly when the prefix sums at its two ends have the same remainder. So walk once, and at each prefix add how many earlier prefixes shared its remainder. The empty prefix (remainder 0) counts as seen once.',
          pseudo: `function subarraysDivByK(nums, k):
    seen ← array of k zeros
    seen[0] ← 1                         // the empty prefix
    rem ← 0
    count ← 0
    for each x in nums:
        rem ← (rem + x) mod k           // 0 to k - 1, even for negatives
        count ← count + seen[rem]
        seen[rem] ← seen[rem] + 1
    return count`,
          code: `function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0);
  seen[0] = 1; // the empty prefix
  let rem = 0;
  let count = 0;
  for (const x of nums) {
    rem = (((rem + x) % k) + k) % k; // keep it in 0..k-1
    count += seen[rem];
    seen[rem]++;
  }
  return count;
}`,
          time: 'O(n + k)',
          space: 'O(k)',
        },
      ],
      fn: 'subarraysDivByK',
      starter: `function subarraysDivByK(nums, k) {
  // count contiguous runs whose total divides evenly by k
  return 0;
}`,
      solution: `function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0);
  seen[0] = 1;
  let rem = 0;
  let count = 0;
  for (const x of nums) {
    rem = (((rem + x) % k) + k) % k;
    count += seen[rem];
    seen[rem]++;
  }
  return count;
}`,
      tests: [
        { name: 'example', args: [[4, 5, 0, -2, -3, 1], 5], expected: 7 },
        { name: 'single, no match', args: [[5], 9], expected: 0 },
        { name: 'single, match', args: [[5], 5], expected: 1 },
        { name: 'all zeros', args: [[0, 0, 0], 3], expected: 6 },
        { name: 'all negative multiples', args: [[-5, -5], 5], expected: 3 },
        { name: 'negatives, k = 2', args: [[-1, 2, 9], 2], expected: 2 },
        { name: 'mixed signs', args: [[2, -2, 2, -4], 6], expected: 2 },
        { name: 'k = 1 counts every range', args: [[1, 2, 3, 4], 1], expected: 10 },
        { name: 'negatives, no match', args: [[-1, -2, -3], 4], expected: 0 },
        { name: 'negative remainder trap', args: [[7, -3, -4, 10], 7], expected: 3 },
      ],
      takeaway: "*count contiguous ranges whose sum has a property* → prefix sum + map of what you have seen (start with the empty prefix).",
    },
    {
      id: 'pattern-mastery-flip-k-zeros',
      title: 'Streak with freeze tokens',
      difficulty: 'medium',
      leetcode: 1004,
      pattern: 'Mixed set A',
      statement: "A habit app stores your days as `nums`: 1 means you practised, 0 means you missed. You own `k` freeze tokens. Each token turns one missed day into a practised day. Return the length of the longest streak of 1s in a row you can make using **at most** `k` tokens.",
      examples: [
        { input: 'nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2', output: '6', explain: 'Freeze the two zeros at index 4 and 5: indexes 4 to 9 become six 1s in a row.' },
        { input: 'nums = [1,0,1,1,0,1], k = 0', output: '2' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums[i] is 0 or 1', '0 ≤ k ≤ n'],
      hints: [
        "Which pattern fits? Underline *longest*, *in a row* and *at most k* zeros. What kind of range grows and shrinks while it stays valid?",
        "A variable sliding window (module 4). The window is valid while it holds at most k zeros.",
        "Move `right` one step at a time and count zeros. While zeros > k, move `left` forward (drop a zero if you pass one). After that, the window `left..right` is valid: record its length.",
      ],
      approaches: [
        {
          name: 'Brute force',
          idea: 'For every start, walk right and count zeros. Stop when zeros go past k. The longest walk wins. Correct, but each start re-scans the same days.',
          code: `function longestOnes(nums, k) {
  let best = 0;
  for (let i = 0; i < nums.length; i++) {
    let zeros = 0;
    for (let j = i; j < nums.length; j++) {
      if (nums[j] === 0) zeros++;
      if (zeros > k) break;
      best = Math.max(best, j - i + 1);
    }
  }
  return best;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sliding window with a zero counter',
          idea: 'If a range has too many zeros, any bigger range with the same left end is also bad. So never restart: only push `left` forward until the window is valid again. Each index enters and leaves the window once.',
          pseudo: `function longestOnes(nums, k):
    left ← 0
    zeros ← 0
    best ← 0
    for right from 0 to n - 1:
        if nums[right] = 0:
            zeros ← zeros + 1
        while zeros > k:                // too many: shrink from the left
            if nums[left] = 0:
                zeros ← zeros - 1
            left ← left + 1
        best ← max(best, right - left + 1)
    return best`,
          code: `function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'longestOnes',
      starter: `function longestOnes(nums, k) {
  // longest run of 1s if you may flip at most k zeros
  return 0;
}`,
      solution: `function longestOnes(nums, k) {
  let left = 0;
  let zeros = 0;
  let best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expected: 6 },
        { name: 'longer, k = 3', args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expected: 10 },
        { name: 'k = 0', args: [[1, 0, 1, 1, 0, 1], 0], expected: 2 },
        { name: 'all zeros, k = 0', args: [[0, 0, 0], 0], expected: 0 },
        { name: 'all zeros, k = 2', args: [[0, 0, 0], 2], expected: 2 },
        { name: 'k ≥ number of zeros', args: [[0, 1, 0, 1], 5], expected: 4 },
        { name: 'all ones', args: [[1, 1, 1], 0], expected: 3 },
        { name: 'single zero, one token', args: [[0], 1], expected: 1 },
      ],
      takeaway: "*longest range with at most k bad items* → variable sliding window with a counter.",
    },
    {
      id: 'pattern-mastery-majority-thirds',
      title: 'Popular votes',
      difficulty: 'medium',
      leetcode: 229,
      pattern: 'Mixed set A',
      statement: "A class votes for a mascot. Each vote is a number in `nums` (the mascot's id). Any mascot that gets **more than ⌊n/3⌋** votes wins a sticker, where n is the number of votes. Return every winner's id, **sorted ascending**. Try to use O(1) extra space.",
      examples: [
        { input: 'nums = [3, 2, 3]', output: '[3]', explain: 'n = 3, so you need more than 1 vote. Only 3 has 2 votes.' },
        { input: 'nums = [1, 1, 1, 3, 3, 2, 2, 2]', output: '[1, 2]', explain: 'You need more than 2 votes. 1 and 2 have 3 each.' },
      ],
      constraints: ['1 ≤ n ≤ 5·10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        "Which pattern fits? Underline *more than n/3* and *O(1) extra space*. How many different values could possibly beat that bar?",
        "At most **two** values can win (three winners would need more than n votes). Counting with a hash map (module 2) works but uses O(n) space. The O(1) trick is new here: *Boyer-Moore voting*, with two candidates.",
        "Keep two candidates and two counts. Same as a candidate: its count goes up. A free slot (count 0): take it. Otherwise: both counts go down (three different votes cancel). Finally, count the two candidates again to check they really pass.",
      ],
      approaches: [
        {
          name: 'Hash map count',
          idea: 'Count every value in a map, then keep the ones with more than ⌊n/3⌋ votes. Easy and fast, but the map can hold n different values.',
          code: `function majorityElement(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  const out = [];
  for (const [x, c] of count) if (c > Math.floor(nums.length / 3)) out.push(x);
  return out.sort((a, b) => a - b);
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Boyer-Moore with two candidates',
          idea: 'Picture each new vote that matches neither candidate as throwing away three different votes at once: one for each candidate and the new one. A real winner has more than a third of all votes, so the throwing away can never wipe it out: it is still a candidate at the end. A candidate can be a fake though, so a second pass counts them for real.',
          pseudo: `function majorityElement(nums):
    a ← none, countA ← 0
    b ← none, countB ← 0
    for each x in nums:
        if x = a:
            countA ← countA + 1
        else if x = b:
            countB ← countB + 1
        else if countA = 0:
            a ← x, countA ← 1
        else if countB = 0:
            b ← x, countB ← 1
        else:                           // three different votes cancel
            countA ← countA - 1
            countB ← countB - 1
    result ← empty list
    for each c in [a, b]:               // second pass: verify
        if c ≠ none and (times c appears in nums) > floor(n / 3):
            append c to result
    return result sorted ascending`,
          code: `function majorityElement(nums) {
  let a = null;
  let b = null;
  let countA = 0;
  let countB = 0;
  for (const x of nums) {
    if (x === a) countA++;
    else if (x === b) countB++;
    else if (countA === 0) { a = x; countA = 1; }
    else if (countB === 0) { b = x; countB = 1; }
    else { countA--; countB--; }
  }
  const out = [];
  for (const c of [a, b]) {
    if (c !== null && nums.filter((x) => x === c).length > Math.floor(nums.length / 3)) out.push(c);
  }
  return out.sort((x, y) => x - y);
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'majorityElement',
      starter: `function majorityElement(nums) {
  // every value seen more than floor(n / 3) times, sorted ascending
  return [];
}`,
      solution: `function majorityElement(nums) {
  let a = null;
  let b = null;
  let countA = 0;
  let countB = 0;
  for (const x of nums) {
    if (x === a) countA++;
    else if (x === b) countB++;
    else if (countA === 0) { a = x; countA = 1; }
    else if (countB === 0) { b = x; countB = 1; }
    else { countA--; countB--; }
  }
  const out = [];
  for (const c of [a, b]) {
    if (c !== null && nums.filter((x) => x === c).length > Math.floor(nums.length / 3)) out.push(c);
  }
  return out.sort((x, y) => x - y);
}`,
      tests: [
        { name: 'example', args: [[3, 2, 3]], expected: [3] },
        { name: 'one vote', args: [[1]], expected: [1] },
        { name: 'two different votes', args: [[1, 2]], expected: [1, 2] },
        { name: 'two winners', args: [[1, 1, 1, 3, 3, 2, 2, 2]], expected: [1, 2] },
        { name: 'no winner', args: [[1, 2, 3, 4]], expected: [] },
        { name: 'all the same', args: [[2, 2]], expected: [2] },
        { name: 'one winner among many', args: [[4, 1, 2, 3, 4, 4, 3, 2, 1, 4]], expected: [4] },
        { name: 'negatives, sorted output', args: [[-1, -1, 5, 5, 5, -1, 7]], expected: [-1, 5] },
        { name: 'fake second candidate', args: [[2, 1, 1, 3, 1, 4, 5, 6]], expected: [1] },
        { name: 'zeros', args: [[0, 0, 0]], expected: [0] },
      ],
      takeaway: "*more than n/k times, O(1) space* → Boyer-Moore with k - 1 candidates, then verify in a second pass.",
    },
    {
      id: 'pattern-mastery-asteroid-collision',
      title: 'Asteroid crash',
      difficulty: 'medium',
      leetcode: 735,
      pattern: 'Mixed set A',
      statement: "Asteroids fly along one line, all at the same speed. `asteroids[i]` gives the size (the absolute value) and the direction: positive moves right, negative moves left. When a right-mover meets a left-mover, the smaller one explodes. If they are the same size, both explode. Two asteroids moving the same way never meet. Return the asteroids left after all crashes, in their original order.",
      examples: [
        { input: 'asteroids = [5, 10, -5]', output: '[5, 10]', explain: '-5 hits 10 and explodes. 5 and 10 move the same way, so they never meet.' },
        { input: 'asteroids = [10, 2, -5]', output: '[10]', explain: '-5 destroys 2, then hits 10 and explodes.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', '-1000 ≤ asteroids[i] ≤ 1000', 'asteroids[i] ≠ 0'],
      hints: [
        "Which pattern fits? Underline *right* vs *left*, *collide* and *keeps going*. A new left-mover hits the most recent right-mover first. What structure gives you *the most recent one* fast?",
        "A stack (module 6). The stack holds the survivors so far, and only its top can be hit next.",
        "For each asteroid: while it moves left and the top of the stack moves right, compare sizes. Pop a smaller top and keep going. Equal sizes: pop and stop (both die). Bigger top: the new one dies. If it survives, push it.",
      ],
      approaches: [
        {
          name: 'Simulate pair by pair',
          idea: 'Scan for the first right-mover that sits just before a left-mover, resolve that crash, and scan again from the start. Repeat until no such pair is left. Correct, but each crash costs a fresh scan.',
          code: `function asteroidCollision(asteroids) {
  const a = [...asteroids];
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i + 1 < a.length; i++) {
      if (a[i] > 0 && a[i + 1] < 0) {
        const right = a[i];
        const left = -a[i + 1];
        if (right > left) a.splice(i + 1, 1);
        else if (right < left) a.splice(i, 1);
        else a.splice(i, 2);
        changed = true;
        break;
      }
    }
  }
  return a;
}`,
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Stack of survivors',
          idea: 'A left-mover can only ever hit the nearest right-mover to its left, and that is the top of the survivors stack. If the top explodes, the next top is now nearest, so you keep checking. Each asteroid is pushed and popped at most once.',
          pseudo: `function asteroidCollision(asteroids):
    stack ← empty stack
    for each a in asteroids:
        alive ← true
        while alive and a < 0 and stack not empty and top of stack > 0:
            if top of stack < -a:
                pop from stack          // top explodes, keep going
            else if top of stack = -a:
                pop from stack          // both explode
                alive ← false
            else:
                alive ← false           // a explodes
        if alive:
            push a onto stack
    return stack (bottom to top)`,
          code: `function asteroidCollision(asteroids) {
  const stack = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) stack.pop();
      else if (top === -a) { stack.pop(); alive = false; }
      else alive = false;
    }
    if (alive) stack.push(a);
  }
  return stack;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'asteroidCollision',
      starter: `function asteroidCollision(asteroids) {
  // return the asteroids that survive, in order
  return [];
}`,
      solution: `function asteroidCollision(asteroids) {
  const stack = [];
  for (const a of asteroids) {
    let alive = true;
    while (alive && a < 0 && stack.length && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      if (top < -a) stack.pop();
      else if (top === -a) { stack.pop(); alive = false; }
      else alive = false;
    }
    if (alive) stack.push(a);
  }
  return stack;
}`,
      tests: [
        { name: 'example', args: [[5, 10, -5]], expected: [5, 10] },
        { name: 'equal sizes destroy both', args: [[8, -8]], expected: [] },
        { name: 'chain: small then big', args: [[10, 2, -5]], expected: [10] },
        { name: 'left-movers first never collide', args: [[-2, -1, 1, 2]], expected: [-2, -1, 1, 2] },
        { name: 'all moving right', args: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'all moving left', args: [[-4, -5, -6]], expected: [-4, -5, -6] },
        { name: 'one left-mover wins', args: [[1, -2, -2, -2]], expected: [-2, -2, -2] },
        { name: 'chain reaction', args: [[3, 5, -6, 2, -1, 4]], expected: [-6, 2, 4] },
        { name: 'empty result', args: [[5, -5, 5, -5]], expected: [] },
        { name: 'single asteroid', args: [[-3]], expected: [-3] },
      ],
      takeaway: "*the newest item reacts with the most recent survivor, and may keep going* → stack.",
    },
  ],
  quiz: [
    {
      prompt: 'In JavaScript, what is `((-7 % 5) + 5) % 5`?',
      options: ['`-2`', '`2`', '`3`', '`7`'],
      answer: 2,
      explanation: '`-7 % 5` is `-2` in JS (the sign stays). Then `-2 + 5 = 3`, and `3 % 5 = 3`. That is the true remainder, the same bucket as 3, 8, 13…',
    },
    {
      prompt: 'In the remainder-count solution, why does the map start with remainder 0 seen once?',
      options: [
        'To avoid dividing by zero',
        'It stands for the empty prefix, so ranges that start at index 0 get counted',
        'Because k is never 0',
        'It is not needed; it only makes the code shorter',
      ],
      answer: 1,
      explanation: 'A range from index 0 to j is good when prefix j itself divides by k. It needs a partner prefix with remainder 0: the empty prefix before index 0. Without it, `[5]` in `[5]`, k = 5, would count as 0.',
    },
    {
      prompt: 'At most how many different values can each appear more than ⌊n/3⌋ times in an array of length n?',
      options: ['1', '2', '3', 'It depends on n'],
      answer: 1,
      explanation: 'Each winner has at least ⌊n/3⌋ + 1 votes. Three winners would need more than n votes in total, which is impossible. So two candidates are enough.',
    },
  ],
  takeaways: [
    'Before coding, underline the signal words and say the pattern (and its module) out loud.',
    '*Count contiguous ranges with a sum property* → prefix sum + map of counts, starting with the empty prefix.',
    'In JS, `%` keeps the minus sign: use `((x % k) + k) % k` for a true remainder.',
  ],
};

export default lesson;
