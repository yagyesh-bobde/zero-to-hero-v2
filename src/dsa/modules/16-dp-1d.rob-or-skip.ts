import type { Lesson, Problem } from '../types';

const houseRobber: Problem = {
  id: 'dp-1d-house-robber',
  title: 'House Robber',
  difficulty: 'medium',
  leetcode: 198,
  pattern: 'Linear DP: take or skip',
  statement:
    "A street of houses holds `nums[i]` cash each. The alarms of next-door houses are linked: rob two neighbours on the same night and the police arrive. Return the most cash you can take without robbing two adjacent houses.",
  examples: [
    { input: 'nums = [1, 2, 3, 1]', output: '4', explain: 'Houses 0 and 2: `1 + 3`.' },
    { input: 'nums = [2, 7, 9, 3, 1]', output: '12', explain: 'Houses 0, 2 and 4: `2 + 9 + 1`.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 400'],
  hints: [
    'Greedy "grab the biggest" fails on `[3, 4, 3]`. At each house there are exactly two choices: rob it or skip it.',
    'State: `dp[i]` = the most cash from the **first i houses**. If you skip house `i-1`, you get `dp[i-1]`. If you rob it, its neighbour is off limits, so you get `dp[i-2] + nums[i-1]`.',
    '`dp[i] = max(dp[i-1], dp[i-2] + nums[i-1])`, `dp[0] = 0`, `dp[1] = nums[0]`. Only the last two cells are ever read: keep two variables.',
  ],
  approaches: [
    {
      name: 'Try every choice (recursion)',
      idea: 'For each house, branch on rob or skip and return the better branch. Correct, but the same "best of the first k houses" is recomputed many times.',
      time: 'O(2ⁿ)',
      space: 'O(n)',
    },
    {
      name: 'Memo or table',
      idea: 'There are only `n + 1` different questions ("best of the first i houses"). Store each answer once, filling `dp` from small `i` to large.',
      time: 'O(n)',
      space: 'O(n)',
    },
    {
      name: 'Two variables',
      idea: 'The table only ever reads `dp[i-1]` and `dp[i-2]`, so keep just those two numbers and slide them along the street.',
      pseudo: `function rob(nums):
    a ← 0                       // best of the first i - 2 houses
    b ← 0                       // best of the first i - 1 houses
    for each x in nums:
        next ← max(b, a + x)    // skip this house, or rob it
        a ← b
        b ← next
    return b`,
      code: `function rob(nums) {
  let a = 0; // dp[i - 2]
  let b = 0; // dp[i - 1]
  for (const x of nums) {
    [a, b] = [b, Math.max(b, a + x)];
  }
  return b;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'rob',
  starter: `function rob(nums) {
  // dp[i] = max(skip: dp[i-1], rob: dp[i-2] + nums[i-1])
  return 0;
}`,
  solution: `function rob(nums) {
  let a = 0;
  let b = 0;
  for (const x of nums) {
    [a, b] = [b, Math.max(b, a + x)];
  }
  return b;
}`,
  tests: [
    { name: 'small street', args: [[1, 2, 3, 1]], expected: 4 },
    { name: 'classic', args: [[2, 7, 9, 3, 1]], expected: 12 },
    { name: 'one house', args: [[5]], expected: 5 },
    { name: 'two houses', args: [[2, 1]], expected: 2 },
    { name: 'not every other house', args: [[2, 1, 1, 2]], expected: 4 },
    { name: 'all empty', args: [[0, 0, 0]], expected: 0 },
    { name: 'mixed', args: [[4, 1, 2, 7, 5, 3, 1]], expected: 14 },
    { name: 'gaps of two', args: [[10, 1, 1, 10, 1, 1, 10]], expected: 30 },
  ],
  takeaway: 'Two choices per item, and each choice points to a smaller street: `max(skip, take)`.',
};

const houseRobberCircle: Problem = {
  id: 'dp-1d-house-robber-circle',
  title: 'House Robber II (houses in a circle)',
  difficulty: 'medium',
  leetcode: 213,
  pattern: 'Linear DP: take or skip',
  statement:
    "Same robbery, but the houses stand around a roundabout, so the first and the last house are neighbours too. Return the most cash you can take without robbing two adjacent houses.",
  examples: [
    { input: 'nums = [2, 3, 2]', output: '3', explain: 'Houses 0 and 2 touch now, so the best is house 1 alone.' },
    { input: 'nums = [1, 2, 3, 1]', output: '4', explain: 'Houses 0 and 2.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 100', '0 ≤ nums[i] ≤ 1000'],
  hints: [
    'The circle only adds one rule: you cannot rob **both** house 0 and house `n-1`.',
    'So at least one of them is skipped. Try both cases: drop the last house, or drop the first house.',
    'Each case is a straight street: run the normal House Robber on `nums[0..n-2]` and on `nums[1..n-1]`, and take the max. Careful with `n = 1`.',
  ],
  approaches: [
    {
      name: 'Try every valid set',
      idea: 'Check every subset of houses for neighbours (including first + last). Correct but exponential.',
      time: 'O(2ⁿ · n)',
      space: 'O(n)',
    },
    {
      name: 'Two straight streets',
      idea: 'Any valid plan skips the first house or skips the last one. Each of those is the plain House Robber, so solve both and keep the better.',
      pseudo: `function robCircle(nums):
    if n = 1:
        return nums[0]
    return max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1))

function robLine(nums, lo, hi):
    a ← 0
    b ← 0
    for i from lo to hi:
        next ← max(b, a + nums[i])
        a ← b
        b ← next
    return b`,
      code: `function robCircle(nums) {
  if (nums.length === 1) return nums[0];
  const robLine = (lo, hi) => {
    let a = 0;
    let b = 0;
    for (let i = lo; i <= hi; i++) [a, b] = [b, Math.max(b, a + nums[i])];
    return b;
  };
  return Math.max(robLine(0, nums.length - 2), robLine(1, nums.length - 1));
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'robCircle',
  starter: `function robCircle(nums) {
  // run House Robber twice: without the last house, then without the first
  return 0;
}`,
  solution: `function robCircle(nums) {
  if (nums.length === 1) return nums[0];
  const robLine = (lo, hi) => {
    let a = 0;
    let b = 0;
    for (let i = lo; i <= hi; i++) [a, b] = [b, Math.max(b, a + nums[i])];
    return b;
  };
  return Math.max(robLine(0, nums.length - 2), robLine(1, nums.length - 1));
}`,
  tests: [
    { name: 'three in a circle', args: [[2, 3, 2]], expected: 3 },
    { name: 'four in a circle', args: [[1, 2, 3, 1]], expected: 4 },
    { name: 'first and last cannot both go', args: [[1, 2, 3]], expected: 3 },
    { name: 'one house', args: [[7]], expected: 7 },
    { name: 'two houses', args: [[3, 8]], expected: 8 },
    { name: 'line answer is not allowed', args: [[2, 7, 9, 3, 1]], expected: 11 },
    { name: 'big ends', args: [[200, 3, 140, 20, 10]], expected: 340 },
    { name: 'all equal', args: [[1, 1, 1, 1]], expected: 2 },
  ],
  takeaway: 'Break a circle by trying "without the first" and "without the last".',
};

const deleteAndEarn: Problem = {
  id: 'dp-1d-delete-and-earn',
  title: 'Delete and Earn',
  difficulty: 'medium',
  leetcode: 740,
  pattern: 'Linear DP: take or skip',
  statement:
    "A bag holds number tiles `nums`. Pick a tile with value `v`: you earn `v` points, and every tile with value `v - 1` or `v + 1` is thrown away (earning nothing). Repeat until the bag is empty. Return the most points you can earn.",
  examples: [
    { input: 'nums = [3, 4, 2]', output: '6', explain: 'Take 4 (3 is thrown away), then take 2.' },
    { input: 'nums = [2, 2, 3, 3, 3, 4]', output: '9', explain: 'Take all three 3s (the 2s and 4 are thrown away).' },
  ],
  constraints: ['1 ≤ nums.length ≤ 2·10⁴', '1 ≤ nums[i] ≤ 10⁴'],
  hints: [
    'If you take one tile of value `v`, you might as well take **all** of them: their neighbours are gone already.',
    'So group by value: `total[v] = v × (how many v tiles)`. Now taking value `v` forbids `v - 1` and `v + 1`.',
    'That is House Robber on the array `total[0..max]`: neighbouring values are neighbouring houses.',
  ],
  approaches: [
    {
      name: 'Try every set of values',
      idea: 'For each distinct value, decide take or skip, and reject sets that contain two consecutive values. Correct but exponential.',
      time: 'O(2ᵏ) for k distinct values',
      space: 'O(k)',
    },
    {
      name: 'Bucket the points, then House Robber',
      idea: 'Add up the points per value. Values `v` and `v + 1` cannot both be taken, exactly like neighbouring houses, so run the rob-or-skip DP over the values in order.',
      pseudo: `function deleteAndEarn(nums):
    m ← max of nums
    total ← array of m + 1 zeros
    for each x in nums:
        total[x] ← total[x] + x
    a ← 0
    b ← 0
    for v from 0 to m:
        next ← max(b, a + total[v])   // skip value v, or take all of them
        a ← b
        b ← next
    return b`,
      code: `function deleteAndEarn(nums) {
  const m = Math.max(...nums);
  const total = new Array(m + 1).fill(0);
  for (const x of nums) total[x] += x;
  let a = 0;
  let b = 0;
  for (const points of total) [a, b] = [b, Math.max(b, a + points)];
  return b;
}`,
      time: 'O(n + m)',
      space: 'O(m)',
    },
  ],
  fn: 'deleteAndEarn',
  starter: `function deleteAndEarn(nums) {
  // total[v] = v * count(v), then rob-or-skip over the values
  return 0;
}`,
  solution: `function deleteAndEarn(nums) {
  const m = Math.max(...nums);
  const total = new Array(m + 1).fill(0);
  for (const x of nums) total[x] += x;
  let a = 0;
  let b = 0;
  for (const points of total) [a, b] = [b, Math.max(b, a + points)];
  return b;
}`,
  tests: [
    { name: 'three tiles', args: [[3, 4, 2]], expected: 6 },
    { name: 'take the middle value', args: [[2, 2, 3, 3, 3, 4]], expected: 9 },
    { name: 'one tile', args: [[1]], expected: 1 },
    { name: 'all the same', args: [[5, 5, 5]], expected: 15 },
    { name: 'a run of values', args: [[1, 2, 3, 4, 5, 6]], expected: 12 },
    { name: 'shuffled with repeats', args: [[8, 10, 4, 9, 1, 3, 5, 9, 4, 10]], expected: 37 },
    { name: 'one heavy value', args: [[1, 1, 1, 2, 4, 5, 5, 5, 6]], expected: 18 },
  ],
  takeaway: 'Reshape the input until it looks like a problem you already solved.',
};

export const lesson: Lesson = {
  id: 'rob-or-skip',
  title: 'Decision DP: rob or skip',
  summary: 'At every item you choose take or skip. The best answer for a long row is built from shorter rows.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Linked alarms',
      text: "A thief walks down a street. Each house has some cash, but neighbours share an alarm: rob two side-by-side houses and the police come. The same shape shows up in real planning: pick which days to send a promo email when back-to-back emails make people unsubscribe, or which shifts to work when you need a rest day after each one.",
    },
    {
      kind: 'text',
      text: "**The problem.** `nums = [2, 7, 9, 3, 1]`: never take two neighbours, get the most cash. The answer is `12` (houses 0, 2, 4). Simple rules fail: \"grab the biggest\" on `[3, 4, 3]` takes 4, but `3 + 3 = 6` is better. \"Every other house\" on `[2, 1, 1, 2]` gets 3, but houses 0 and 3 give 4. We need to really weigh the choices.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try both choices at every house',
      code: `function best(i):                       // most cash from houses 0..i-1
    if i = 0:
        return 0                            // no houses, no cash
    if i = 1:
        return nums[0]
    skip ← best(i - 1)                      // leave house i-1 alone
    take ← best(i - 2) + nums[i - 1]        // rob it: its neighbour is off limits
    return max(skip, take)`,
    },
    {
      kind: 'text',
      text: "**Spot the waste.** `best(5)` calls `best(4)` and `best(3)`; `best(4)` calls `best(3)` again... it is the exact same tree as Climbing Stairs, so it is `O(2ⁿ)`. And again there are only `n + 1` different questions. A memo fixes it, and a table fixes it without recursion.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Each choice leaves a smaller street',
      text: "Look only at the **last** house. Skip it, and you are left with the best of a street one house shorter. Rob it, and you are left with the best of a street **two** houses shorter (its neighbour is banned), plus its cash. Take the max of those two numbers. That is the whole algorithm.",
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`dp[i]` = the most cash you can take from the first `i` houses'],
        ['Choice', 'skip house `i - 1`, or rob it'],
        ['Recurrence', '`dp[i] = max(dp[i - 1], dp[i - 2] + nums[i - 1])`'],
        ['Base case', '`dp[0] = 0` (no houses), `dp[1] = nums[0]`'],
        ['Answer', '`dp[n]`'],
      ],
    },
    {
      kind: 'trace',
      title: 'Filling the table for nums = [2, 7, 9, 3, 1]',
      columns: ['i', 'house value', 'skip: dp[i-1]', 'rob: dp[i-2] + value', 'dp[i]', 'table so far'],
      rows: [
        [0, '—', '—', '—', '0 (base)', '[0]'],
        [1, 2, '—', '—', '2 (base)', '[0, 2]'],
        [2, 7, 2, '0 + 7 = 7', 7, '[0, 2, 7]'],
        [3, 9, 7, '2 + 9 = 11', 11, '[0, 2, 7, 11]'],
        [4, 3, 11, '7 + 3 = 10', 11, '[0, 2, 7, 11, 11]'],
        [5, 1, 11, '11 + 1 = 12', 12, '[0, 2, 7, 11, 11, 12]'],
      ],
      note: "Answer `dp[5] = 12`. At `i = 4` skipping wins (11 > 10): house 3 is not worth losing house 2.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Bottom-up table',
      code: `function rob(nums):
    dp ← array of size n + 1
    dp[0] ← 0
    dp[1] ← nums[0]
    for i from 2 to n:
        dp[i] ← max(dp[i - 1], dp[i - 2] + nums[i - 1])
    return dp[n]`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript: the same, with two variables',
      code: `function rob(nums) {
  let a = 0; // dp[i - 2]
  let b = 0; // dp[i - 1]
  for (const x of nums) {
    [a, b] = [b, Math.max(b, a + x)]; // skip or rob
  }
  return b;
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Try both choices (recursion)', time: 'O(2ⁿ)', space: 'O(n)', note: 'Correct, same repeated tree as Climbing Stairs.' },
        { approach: 'Memo / table', time: 'O(n)', space: 'O(n)', note: 'One cell per "first i houses".' },
        { approach: 'Two variables', time: 'O(n)', space: 'O(1)', note: 'Each cell only reads the two before it.' },
      ],
    },
    {
      kind: 'diagram',
      title: 'Houses in a circle (House Robber II)',
      art: `nums = [1, 2, 3, 1], house 0 and house 3 now touch

run A, drop the last house:  [1, 2, 3]  -> best 4
run B, drop the first house:    [2, 3, 1]  -> best 3

answer = max(4, 3) = 4`,
      caption: "A circle only adds one rule: not both ends. Every valid plan skips the first house or skips the last one, so solve both straight streets and keep the better.",
    },
    {
      kind: 'table',
      title: 'Delete and Earn turns into House Robber',
      head: ['value v', 'tiles', 'total[v] = v × count', 'like a house with'],
      rows: [
        ['2', '2, 2', '4', '4 cash'],
        ['3', '3, 3, 3', '9', '9 cash'],
        ['4', '4', '4', '4 cash'],
      ],
    },
    {
      kind: 'text',
      text: "In Delete and Earn (`nums = [2, 2, 3, 3, 3, 4]`), taking value `v` throws away `v - 1` and `v + 1`. Line the values up in order and they behave exactly like houses: neighbours cannot both be taken. Rob `[0, 0, 4, 9, 4]` → `9`. When a new problem feels unfamiliar, try reshaping the input until it looks like one you know.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: linear take-or-skip',
      code: `// dp[i] = best answer using the first i items
dp[0] ← 0
dp[1] ← value of item 0
for i from 2 to n:
    skip ← dp[i - 1]
    take ← dp[i - 2] + value of item i - 1   // taking bans the neighbour
    dp[i] ← max(skip, take)
return dp[n]`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Small inputs and the circle',
      text: "In House Robber II, `n = 1` breaks the two-run trick (both runs are empty and return 0, but the answer is `nums[0]`), so handle it first. In the table version, `dp[1] = nums[0]` needs at least one house. And never \"just take every other house\": `[2, 1, 1, 2]` proves it wrong.",
    },
  ],
  problems: [houseRobber, houseRobberCircle, deleteAndEarn],
  quiz: [
    {
      prompt: 'For `nums = [3, 4, 3]`, what does "grab the biggest house first" give, and what is the real best?',
      options: ['4 and 4', '4 and 6', '6 and 6', '3 and 6'],
      answer: 1,
      explanation: 'Taking 4 bans both 3s. Skipping it and taking both ends gives 6. Greedy choices that look good now can cost you later; DP weighs both.',
    },
    {
      prompt: 'In House Robber, why does robbing house `i - 1` lead to `dp[i - 2]` and not `dp[i - 1]`?',
      options: [
        'Because `dp[i - 1]` is not computed yet',
        'Because robbing house `i - 1` bans its neighbour `i - 2`, so only the first `i - 2` houses are left',
        'Because we always skip two houses',
        'It is a typo, it should be `dp[i - 1]`',
      ],
      answer: 1,
      explanation: 'The choice decides which smaller problem is left. Rob → the neighbour is gone → best of the first `i - 2` houses.',
    },
    {
      prompt: 'Why does House Robber II run the straight-street version twice?',
      options: [
        'To double-check the answer',
        'Because any valid plan skips the first house or the last house, so those two straight streets cover every case',
        'Because a circle has two directions',
        'Because the array must be reversed',
      ],
      answer: 1,
      explanation: 'The only new rule is "not both ends". Split into the two cases that obey it and keep the better.',
    },
  ],
  takeaways: [
    'Take-or-skip: `dp[i] = max(dp[i-1], dp[i-2] + value)`.',
    'Say the choice out loud and ask: which smaller problem is left after it?',
    'Circles: solve "without the first" and "without the last" separately.',
    'Reshape unfamiliar inputs (like Delete and Earn) into a DP you already know.',
  ],
};
