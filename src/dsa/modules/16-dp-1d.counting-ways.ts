import type { Lesson, Problem } from '../types';

const decodeWays: Problem = {
  id: 'dp-1d-decode-ways',
  title: 'Decode Ways',
  difficulty: 'medium',
  leetcode: 91,
  pattern: 'Counting ways (1D)',
  statement:
    "A secret message used `A = 1, B = 2, ..., Z = 26`, but the spaces between the numbers were lost, so you only have a digit string `s`. Count how many different letter messages it could be. A piece can never start with `0` (`\"06\"` is not a letter, and `\"0\"` alone is not a letter either).",
  examples: [
    { input: 's = "12"', output: '2', explain: '`1 2` = AB, or `12` = L.' },
    { input: 's = "226"', output: '3', explain: '`2 2 6`, `22 6`, `2 26`.' },
    { input: 's = "06"', output: '0', explain: 'Nothing can start with 0.' },
  ],
  constraints: ['1 ≤ s.length ≤ 100', 's has only digits'],
  hints: [
    'Every decoding ends with a last piece, and that piece is either **one** digit or **two** digits.',
    'State: `dp[i]` = number of ways to decode the first `i` characters. One-digit last piece is allowed when `s[i-1] ≠ "0"`; two-digit when `s[i-2..i-1]` is between `"10"` and `"26"`.',
    '`dp[i] = (one-digit ok ? dp[i-1] : 0) + (two-digit ok ? dp[i-2] : 0)`, with `dp[0] = 1`. Answer `dp[n]`.',
  ],
  approaches: [
    {
      name: 'Recursion over the last piece',
      idea: 'Try a one-digit and a two-digit last piece and add the counts of the prefixes left over. Correct, but the same prefix is counted many times.',
      time: 'O(2ⁿ)',
      space: 'O(n)',
    },
    {
      name: 'Bottom-up table',
      idea: 'Each prefix length `i` is one cell. A decoding of the first `i` characters is a decoding of a shorter prefix plus one valid last piece, so add the two allowed cases.',
      pseudo: `function numDecodings(s):
    dp ← array of n + 1 zeros
    dp[0] ← 1                                // empty prefix: one way
    for i from 1 to n:
        if s[i - 1] ≠ '0':                   // last piece = one digit (1..9)
            dp[i] ← dp[i] + dp[i - 1]
        if i ≥ 2:
            two ← number made of s[i - 2] and s[i - 1]
            if s[i - 2] ≠ '0' and two ≤ 26:  // last piece = two digits (10..26)
                dp[i] ← dp[i] + dp[i - 2]
    return dp[n]`,
      code: `function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (s[i - 2] !== '0' && two <= 26) dp[i] += dp[i - 2];
    }
  }
  return dp[n];
}`,
      time: 'O(n)',
      space: 'O(n), or O(1) with two variables',
    },
  ],
  fn: 'numDecodings',
  starter: `function numDecodings(s) {
  // dp[i] = ways to decode the first i characters
  return 0;
}`,
  solution: `function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2) {
      const two = Number(s.slice(i - 2, i));
      if (s[i - 2] !== '0' && two <= 26) dp[i] += dp[i - 2];
    }
  }
  return dp[n];
}`,
  tests: [
    { name: 'two digits', args: ['12'], expected: 2 },
    { name: 'classic', args: ['226'], expected: 3 },
    { name: 'leading zero', args: ['06'], expected: 0 },
    { name: 'ten', args: ['10'], expected: 1 },
    { name: 'just zero', args: ['0'], expected: 0 },
    { name: 'zero in the middle', args: ['2106'], expected: 1 },
    { name: 'double zero', args: ['100'], expected: 0 },
    { name: 'zero after ones', args: ['11106'], expected: 2 },
    { name: 'over 26', args: ['27'], expected: 1 },
    { name: 'ten ones', args: ['1111111111'], expected: 89 },
    { name: 'thirty is not a letter', args: ['230'], expected: 0 },
    { name: 'mixed', args: ['1201234'], expected: 3 },
  ],
  takeaway: 'Counting DP: split by the last piece and add the counts of the allowed cases.',
};

const combinationSum4: Problem = {
  id: 'dp-1d-combination-sum-iv',
  title: 'Combination Sum IV (order matters)',
  difficulty: 'medium',
  leetcode: 377,
  pattern: 'Counting ways (1D)',
  statement:
    "A drum machine has pads that play beats of lengths `nums` (all different, all positive). How many different sequences of pad hits fill a bar of exactly `target` beats? Order matters: `1, 2` and `2, 1` are different rhythms. You may use a pad as often as you like.",
  examples: [
    { input: 'nums = [1, 2, 3], target = 4', output: '7', explain: '`1111`, `112`, `121`, `211`, `22`, `13`, `31`.' },
    { input: 'nums = [9], target = 3', output: '0' },
  ],
  constraints: ['1 ≤ nums.length ≤ 200', '1 ≤ nums[i] ≤ 1000', '1 ≤ target ≤ 1000', 'the answer fits in a 32-bit integer'],
  hints: [
    'This is Climbing Stairs where the allowed step sizes are `nums`.',
    'State: `dp[t]` = number of ordered sequences that add up to `t`. The **last** hit was some `x` in `nums`.',
    '`dp[t] = sum of dp[t - x]` over every `x ≤ t`, with `dp[0] = 1`. Loop `t` on the outside, `nums` on the inside.',
  ],
  approaches: [
    {
      name: 'Recursion over the last hit',
      idea: 'Try every pad as the last hit and count the ways to fill the rest. Correct, but the same remaining totals are recounted many times.',
      time: 'exponential',
      space: 'O(target)',
    },
    {
      name: 'Bottom-up over the target',
      idea: 'Every sequence for `t` ends with exactly one last hit `x`, and what comes before it is any sequence for `t - x`. Different last hits give different sequences, so add them up.',
      pseudo: `function combinationSum4(nums, target):
    dp ← array of target + 1 zeros
    dp[0] ← 1                          // empty sequence
    for t from 1 to target:            // amount OUTSIDE
        for each x in nums:            // last hit INSIDE
            if x ≤ t:
                dp[t] ← dp[t] + dp[t - x]
    return dp[target]`,
      code: `function combinationSum4(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let t = 1; t <= target; t++) {
    for (const x of nums) {
      if (x <= t) dp[t] += dp[t - x];
    }
  }
  return dp[target];
}`,
      time: 'O(target · k)',
      space: 'O(target)',
    },
  ],
  fn: 'combinationSum4',
  starter: `function combinationSum4(nums, target) {
  // dp[t] = number of ordered sequences that sum to t
  return 0;
}`,
  solution: `function combinationSum4(nums, target) {
  const dp = new Array(target + 1).fill(0);
  dp[0] = 1;
  for (let t = 1; t <= target; t++) {
    for (const x of nums) {
      if (x <= t) dp[t] += dp[t - x];
    }
  }
  return dp[target];
}`,
  tests: [
    { name: 'classic', args: [[1, 2, 3], 4], expected: 7 },
    { name: 'impossible', args: [[9], 3], expected: 0 },
    { name: 'only ones', args: [[1], 5], expected: 1 },
    { name: 'twos and threes', args: [[2, 3], 7], expected: 3 },
    { name: 'stairs in disguise', args: [[1, 2], 10], expected: 89 },
    { name: 'large count', args: [[4, 2, 1], 32], expected: 39882198 },
    { name: 'exact single pad', args: [[5], 5], expected: 1 },
    { name: 'target smaller than every pad', args: [[3, 5], 1], expected: 0 },
  ],
  takeaway: 'Order matters → amount on the outside, choices on the inside.',
};

const goodStrings: Problem = {
  id: 'dp-1d-good-strings',
  title: 'Count Ways To Build Good Strings',
  difficulty: 'medium',
  leetcode: 2466,
  pattern: 'Counting ways (1D)',
  statement:
    "You build a binary string from nothing. Each step appends either `zero` copies of `'0'` or `one` copies of `'1'`. A string is good if its length is between `low` and `high` (inclusive). Count the different good strings you can build. The count gets huge, so return it modulo `1,000,000,007`.",
  examples: [
    { input: 'low = 3, high = 3, zero = 1, one = 1', output: '8', explain: 'Every binary string of length 3.' },
    { input: 'low = 2, high = 3, zero = 1, one = 2', output: '5', explain: '`00`, `11`, `000`, `011`, `110`.' },
  ],
  constraints: ['1 ≤ low ≤ high ≤ 10⁵', '1 ≤ zero, one ≤ low'],
  hints: [
    'Only the **length** matters. Two different step sequences always give different strings, because a 0-block and a 1-block start with different characters.',
    'Climbing Stairs again: from length `L`, the last step added `zero` or `one` characters.',
    '`dp[L] = dp[L - zero] + dp[L - one]` (skip negative indexes), `dp[0] = 1`. Add up `dp[low..high]`, taking `% 1e9+7` as you go.',
  ],
  approaches: [
    {
      name: 'Build every string',
      idea: 'Recursively append blocks and count strings whose length lands in range. Correct but the number of strings explodes.',
      time: 'exponential',
      space: 'O(high)',
    },
    {
      name: 'Count by length',
      idea: '`dp[L]` = number of strings of length exactly `L`. Each one ends with a 0-block or a 1-block, so add the two shorter counts. The answer is the sum over the good lengths.',
      pseudo: `function countGoodStrings(low, high, zero, one):
    MOD ← 1000000007
    dp ← array of high + 1 zeros
    dp[0] ← 1
    answer ← 0
    for L from 1 to high:
        if L ≥ zero:
            dp[L] ← (dp[L] + dp[L - zero]) mod MOD
        if L ≥ one:
            dp[L] ← (dp[L] + dp[L - one]) mod MOD
        if L ≥ low:
            answer ← (answer + dp[L]) mod MOD
    return answer`,
      code: `function countGoodStrings(low, high, zero, one) {
  const MOD = 1_000_000_007;
  const dp = new Array(high + 1).fill(0);
  dp[0] = 1;
  let answer = 0;
  for (let L = 1; L <= high; L++) {
    if (L >= zero) dp[L] = (dp[L] + dp[L - zero]) % MOD;
    if (L >= one) dp[L] = (dp[L] + dp[L - one]) % MOD;
    if (L >= low) answer = (answer + dp[L]) % MOD;
  }
  return answer;
}`,
      time: 'O(high)',
      space: 'O(high)',
    },
  ],
  fn: 'countGoodStrings',
  starter: `function countGoodStrings(low, high, zero, one) {
  // dp[L] = number of strings of length L
  return 0;
}`,
  solution: `function countGoodStrings(low, high, zero, one) {
  const MOD = 1_000_000_007;
  const dp = new Array(high + 1).fill(0);
  dp[0] = 1;
  let answer = 0;
  for (let L = 1; L <= high; L++) {
    if (L >= zero) dp[L] = (dp[L] + dp[L - zero]) % MOD;
    if (L >= one) dp[L] = (dp[L] + dp[L - one]) % MOD;
    if (L >= low) answer = (answer + dp[L]) % MOD;
  }
  return answer;
}`,
  tests: [
    { name: 'all strings of length 3', args: [3, 3, 1, 1], expected: 8 },
    { name: 'two lengths', args: [2, 3, 1, 2], expected: 5 },
    { name: 'length 1 impossible', args: [1, 1, 2, 2], expected: 0 },
    { name: 'blocks of 2 and 3', args: [5, 5, 2, 3], expected: 2 },
    { name: 'range 1 to 10', args: [1, 10, 1, 1], expected: 2046 },
    { name: 'needs the modulo', args: [200, 200, 1, 1], expected: 499445072 },
    { name: 'big blocks', args: [50, 100, 10, 20], expected: 220 },
  ],
  takeaway: 'Many "build something" counts are Climbing Stairs with different step sizes.',
};

export const lesson: Lesson = {
  id: 'counting-ways',
  title: 'Counting ways',
  summary: 'When the question is "how many ways", split by the last piece and add the counts.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The message without spaces',
      text: "A friend sends a secret code where `A = 1, B = 2, ..., Z = 26`, but their keyboard ate the spaces: you get `226`. Is it `2 2 6` (BBF), `22 6` (VF) or `2 26` (BZ)? All three! Morse code has the same problem when the gaps between letters get lost. How many readings does a long string have?",
    },
    {
      kind: 'text',
      text: "**The problem.** Given a digit string `s`, count the ways to cut it into pieces where each piece is a number from 1 to 26 with no leading zero. **Brute force:** every reading ends with a last piece, and that piece is one digit or two digits. Count the readings for each case and add them.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: split by the last piece',
      code: `function count(i):                     // readings of the first i characters
    if i = 0:
        return 1                       // empty prefix: one way (read nothing)
    total ← 0
    if s[i - 1] ≠ '0':                 // last piece is one digit (1..9)
        total ← total + count(i - 1)
    if i ≥ 2 and s[i-2..i-1] is "10" to "26":   // last piece is two digits
        total ← total + count(i - 2)
    return total`,
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Counting = add the cases',
      text: "For \"how many ways\" questions, the recurrence **adds** instead of taking a max. It is safe to add because the cases never overlap: every reading has exactly one last piece, so it is counted in exactly one case. The repeated calls are the same as Climbing Stairs (`count(i - 2)` is reached twice), so a table makes it `O(n)`.",
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i]` = number of ways to decode the first `i` characters'],
        ['Choice', 'the last piece is one digit or two digits'],
        ['Recurrence', '`dp[i] = (one ok ? dp[i-1] : 0) + (two ok ? dp[i-2] : 0)`'],
        ['Base case', '`dp[0] = 1` (the empty prefix has one reading: nothing)'],
        ['Answer', '`dp[n]`'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling the table for s = "226"',
      columns: ['i', 'one-digit piece', 'adds dp[i-1]', 'two-digit piece', 'adds dp[i-2]', 'dp[i]'],
      rows: [
        [0, '—', '—', '—', '—', '1 (base)'],
        [1, '"2" ok', 1, '—', '—', 1],
        [2, '"2" ok', 1, '"22" ok', 1, 2],
        [3, '"6" ok', 2, '"26" ok', 1, 3],
      ],
      note: "Answer `dp[3] = 3`. Row 3 reads: the readings of `\"22\"` plus a final `6` (2 of them), and the readings of `\"2\"` plus a final `26` (1 of them).",
    },
    {
      kind: 'table',
      title: 'The zero traps',
      head: ['s', 'what happens', 'answer'],
      rows: [
        ['`"06"`', '`"6"` alone is fine, but `"0"` before it is no letter, and `"06"` has a leading zero', '0'],
        ['`"10"`', '`"0"` alone is not a letter, but `"10"` = J', '1'],
        ['`"100"`', 'the last `"0"` can only join as `"00"`, which is not a letter', '0'],
        ['`"2106"`', 'the 0 must glue to the 1 before it: `2 10 6`', '1'],
        ['`"27"`', '27 > 26, so only `2 7`', '1'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Bottom-up table',
      code: `function numDecodings(s):
    dp ← array of n + 1 zeros
    dp[0] ← 1
    for i from 1 to n:
        if s[i - 1] ≠ '0':
            dp[i] ← dp[i] + dp[i - 1]
        if i ≥ 2 and s[i - 2] ≠ '0' and number(s[i-2..i-1]) ≤ 26:
            dp[i] ← dp[i] + dp[i - 2]
    return dp[n]`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function numDecodings(s) {
  const n = s.length;
  const dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 1; i <= n; i++) {
    if (s[i - 1] !== '0') dp[i] += dp[i - 1];
    if (i >= 2 && s[i - 2] !== '0' && Number(s.slice(i - 2, i)) <= 26) {
      dp[i] += dp[i - 2];
    }
  }
  return dp[n];
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Recursion over the last piece', time: 'O(2ⁿ)', space: 'O(n)', note: 'Correct; recounts the same prefixes.' },
        { approach: 'Table over prefix length', time: 'O(n)', space: 'O(n)', note: 'One cell per prefix.' },
        { approach: 'Two variables', time: 'O(n)', space: 'O(1)', note: 'Each cell reads only the two before it.' },
      ],
    },
    {
      kind: 'text',
      text: "**Same idea, more choices: Combination Sum IV.** Count the ordered sequences from `nums = [1, 2, 3]` that add up to `4`. That is Climbing Stairs where your step sizes are `nums`. `dp[t]` = number of sequences that sum to `t`; the last number was some `x`, so `dp[t] = dp[t-1] + dp[t-2] + dp[t-3]` (only for `x ≤ t`). Because **order matters**, the loop over the amount `t` is on the outside and the loop over `nums` is inside. (Next lesson shows what changes when order does *not* matter.)",
    },
    {
      kind: 'trace',
      title: 'Combination Sum IV: nums = [1, 2, 3], target = 4',
      columns: ['t', 'last = 1: dp[t-1]', 'last = 2: dp[t-2]', 'last = 3: dp[t-3]', 'dp[t]'],
      rows: [
        [0, '—', '—', '—', '1 (base)'],
        [1, 1, '—', '—', 1],
        [2, 1, 1, '—', 2],
        [3, 2, 1, 1, 4],
        [4, 4, 2, 1, 7],
      ],
      note: "`dp[4] = 7`: `1111, 112, 121, 211, 22, 13, 31`. The 4 sequences for `t = 3` each get a final `1`, and so on.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: counting ways',
      code: `// dp[x] = number of ways to reach state x
dp[start] ← 1                          // one way to "do nothing"
for x in order (small to big):
    for each allowed last step s:
        if step s is valid here:
            dp[x] ← dp[x] + dp[x - s]  // add, never max
return dp[goal]   // or a sum of several cells`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Zeros, base cases and huge numbers',
      text: "The base case for counting is `dp[0] = 1`, not 0 — with 0 every cell stays 0. In Decode Ways, test the zero cases (`\"0\"`, `\"10\"`, `\"100\"`, `\"06\"`) before you submit. Counts grow fast: when a problem says \"return it modulo 1e9+7\", apply `% MOD` after **every** addition, or JS numbers lose precision past 2⁵³.",
    },
  ],
  problems: [decodeWays, combinationSum4, goodStrings],
  quiz: [
    {
      prompt: 'Why does a counting DP **add** the cases instead of taking the max?',
      options: [
        'Because max is slower',
        'Because each way falls into exactly one case (one last piece), so the total is the sum',
        'Because counts are always positive',
        'Because the table is 1D',
      ],
      answer: 1,
      explanation: 'The cases split all the ways into separate groups with no overlap, so the total is the sum of the group sizes.',
    },
    {
      prompt: 'What is `numDecodings("10")`?',
      options: ['0', '1', '2', '10'],
      answer: 1,
      explanation: '`"1" "0"` fails because `"0"` is not a letter. Only `"10"` = J works.',
    },
    {
      prompt: 'Why is `dp[0] = 1` in counting problems?',
      options: [
        'It is arbitrary',
        'There is exactly one way to build nothing: do nothing. Without it every cell would stay 0',
        'Arrays in JS start at 1',
        'To avoid dividing by zero',
      ],
      answer: 1,
      explanation: 'Every way is built on top of the empty start. If the empty start had 0 ways, nothing could be built from it.',
    },
  ],
  takeaways: [
    '"How many ways" → split by the last piece/step and **add** the counts.',
    'Base case for counting is `dp[0] = 1`: one way to do nothing.',
    'Many counting problems are Climbing Stairs with different step sizes.',
    'Order matters (sequences) → loop the amount outside, the choices inside.',
  ],
};
