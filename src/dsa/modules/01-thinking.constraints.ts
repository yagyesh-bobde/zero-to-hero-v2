import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'constraints',
  title: 'Constraints pick the target',
  summary: 'Read the size limits first: they tell you how fast your answer must be.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Sports day relay teams',
      text: 'On sports day, 1,000 kids stand in one line, each with a different speed rating. The coach wants every possible 3-kid relay team where, walking down the line, the ratings go **strictly up** or **strictly down**. The sign-up sheet has to print the number before the races start.',
    },
    {
      kind: 'text',
      text: 'Ratings `[2, 5, 3, 4, 1]`. Pick positions `i < j < k`. Valid teams: `(2, 3, 4)` going up, `(5, 4, 1)` and `(5, 3, 1)` going down. Answer: `3`.',
    },
    {
      kind: 'text',
      text: 'Before you think of any idea, read the limits under the problem: `3 ≤ n ≤ 1000`. That one line tells you how fast you need to be. A judge gives you about one second, and a computer does roughly **10⁸ simple steps per second**. So plug the biggest `n` into your Big-O and check that it stays under about 10⁸.',
    },
    {
      kind: 'table',
      title: 'Cheat sheet: constraint → target',
      head: ['Biggest n', 'Steps at that n', 'Target', 'Usual idea'],
      rows: [
        ['n ≤ 10', '10! ≈ 3.6·10⁶', 'O(n!)', 'try every order (module 9)'],
        ['n ≤ 20', '2²⁰ ≈ 10⁶', 'O(2ⁿ)', 'try every subset (module 9)'],
        ['n ≤ 500', '500³ ≈ 1.25·10⁸', 'O(n³)', 'three nested loops'],
        ['n ≤ 5,000', '5000² = 2.5·10⁷', 'O(n²)', 'every pair, loop in a loop'],
        ['n ≤ 10⁶', '~2·10⁷', 'O(n log n) or O(n)', 'sort, one pass, hash map, two pointers'],
        ['n up to 10⁹ or more', 'cannot even loop', 'O(log n) or O(1)', 'binary search, math'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: every triple',
      code: `function numTeams(rating):
    teams ← 0
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            for k from j + 1 to n - 1:
                a ← rating[i]
                b ← rating[j]
                c ← rating[k]
                if (a < b and b < c) or (a > b and b > c):
                    teams ← teams + 1
    return teams`,
    },
    {
      kind: 'text',
      text: 'Count it: three nested loops is **O(n³)**. At `n = 1000` that is about `1000³ / 6 ≈ 1.7·10⁸` triples. Over budget, and the cheat sheet agrees: `n ≤ 1000` sits between the n³ row (500) and the n² row (5,000), so aim for **O(n²)**. That target is a big clue: "two loops, not three". **Spot the waste**: for each middle kid, the brute force re-pairs every left kid with every right kid, one by one, when it only needs *how many* there are on each side.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Fix the middle',
      text: 'Pick the middle kid `j`. Count kids on the left who are slower (`lessLeft`) and faster (`moreLeft`), and the same on the right. Every slower-left kid pairs with every faster-right kid: `lessLeft × moreRight` going-up teams. Downward is `moreLeft × lessRight`. Counting is one loop per middle, so O(n) per middle and **O(n²)** total.',
    },
    {
      kind: 'trace',
      title: 'Fix the middle on [2, 5, 3, 4, 1]',
      columns: ['middle j', 'rating', 'lessLeft', 'moreLeft', 'lessRight', 'moreRight', 'teams added'],
      rows: [
        [1, 5, 1, 0, 3, 0, '1·0 + 0·3 = 0'],
        [2, 3, 1, 1, 1, 1, '1·1 + 1·1 = 2'],
        [3, 4, 2, 1, 1, 0, '2·0 + 1·1 = 1'],
      ],
      note: 'The first and last kid can never be in the middle, so we skip them. Total: 0 + 2 + 1 = **3**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function numTeams(rating):
    teams ← 0
    for j from 1 to n - 2:
        lessLeft ← 0
        lessRight ← 0
        for i from 0 to j - 1:
            if rating[i] < rating[j]:
                lessLeft ← lessLeft + 1
        for k from j + 1 to n - 1:
            if rating[k] < rating[j]:
                lessRight ← lessRight + 1
        moreLeft ← j - lessLeft                // ratings are all different
        moreRight ← (n - 1 - j) - lessRight
        teams ← teams + lessLeft × moreRight + moreLeft × lessRight
    return teams`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function numTeams(rating) {
  const n = rating.length;
  let teams = 0;
  for (let j = 1; j < n - 1; j++) {
    let lessLeft = 0;
    let lessRight = 0;
    for (let i = 0; i < j; i++) {
      if (rating[i] < rating[j]) lessLeft++;
    }
    for (let k = j + 1; k < n; k++) {
      if (rating[k] < rating[j]) lessRight++;
    }
    const moreLeft = j - lessLeft; // ratings are all different
    const moreRight = n - 1 - j - lessRight;
    teams += lessLeft * moreRight + moreLeft * lessRight;
  }
  return teams;
}`,
    },
    {
      kind: 'compare',
      title: 'Count number of teams (n ≤ 1000)',
      rows: [
        { approach: 'Every triple', time: 'O(n³)', space: 'O(1)', note: '~1.7·10⁸ steps at n = 1000. Too slow for the limit.' },
        { approach: 'Fix the middle', time: 'O(n²)', space: 'O(1)', note: '~10⁶ steps. Exactly what the constraint asked for.' },
      ],
    },
    {
      kind: 'list',
      items: [
        '**Values are small** (like `1 ≤ x ≤ 100`): you can use an array of 101 counters instead of sorting or searching.',
        '**The input is sorted**: think binary search (module 5) or two pointers (module 3).',
        '**A grid with `m, n ≤ 50`**: visiting every cell (2,500 cells) is cheap. Just do it.',
        '**"Return the answer modulo 10⁹ + 7"**: the real answer is huge, so you are counting ways, often with DP (module 16).',
        '**n is tiny but the brute force is easy**: brute force *is* the intended answer. Do not over-engineer.',
      ],
    },
    {
      kind: 'text',
      text: '**The pattern: fix the middle.** Reach for it when you count triples `i < j < k` with a rule that links the middle to both sides. Instead of choosing all three, fix `j`, count good partners on each side, and multiply.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: fix the middle',
      code: `total ← 0
for j from 1 to n - 2:
    left ← count of i < j that fit with item j
    right ← count of k > j that fit with item j
    total ← total + left × right
return total`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Passing the examples is not passing',
      text: 'The examples have 5 numbers, so even an O(n³) idea finishes instantly. The hidden tests use the **biggest** `n` from the constraints. Always plug that `n` into your Big-O *before* coding, or you will hit "Time Limit Exceeded" on test 40 of 50.',
    },
  ],
  problems: [
    {
      id: 'thinking-count-teams',
      title: 'Count Number of Teams',
      difficulty: 'medium',
      leetcode: 1395,
      pattern: 'Fix the middle',
      statement:
        'Kids stand in a line with **different** speed ratings `rating`. A team is 3 kids at positions `i < j < k` whose ratings go strictly up (`rating[i] < rating[j] < rating[k]`) or strictly down. Return how many teams you can form. A kid can be in many teams.',
      examples: [
        { input: 'rating = [2,5,3,4,1]', output: '3', explain: '(2,3,4), (5,4,1) and (5,3,1).' },
        { input: 'rating = [2,1,3]', output: '0' },
        { input: 'rating = [1,2,3,4]', output: '4' },
      ],
      constraints: ['3 ≤ n ≤ 1000', '1 ≤ rating[i] ≤ 10⁵', 'all ratings are different'],
      hints: [
        'n ≤ 1000, so O(n³) (about 1.7·10⁸) is too slow. Aim for O(n²).',
        'Every team has a middle kid. Try fixing the middle kid `j` instead of choosing all three.',
        'For middle `j`, count kids on the left who are slower and faster, and the same on the right.',
        'Teams with middle `j` = `lessLeft × moreRight + moreLeft × lessRight`.',
      ],
      approaches: [
        {
          name: 'Every triple',
          idea: 'Three nested loops check every `i < j < k`. Correct because it looks at every possible team, but it is O(n³).',
          time: 'O(n³)',
          space: 'O(1)',
        },
        {
          name: 'Fix the middle',
          idea: 'Every team has exactly one middle kid. For a fixed middle, any slower kid on the left can pair with any faster kid on the right (and the mirror for going down), so you multiply counts instead of listing teams.',
          pseudo: `function numTeams(rating):
    teams ← 0
    for j from 1 to n - 2:
        lessLeft ← 0
        lessRight ← 0
        for i from 0 to j - 1:
            if rating[i] < rating[j]:
                lessLeft ← lessLeft + 1
        for k from j + 1 to n - 1:
            if rating[k] < rating[j]:
                lessRight ← lessRight + 1
        moreLeft ← j - lessLeft                // ratings are all different
        moreRight ← (n - 1 - j) - lessRight
        teams ← teams + lessLeft × moreRight + moreLeft × lessRight
    return teams`,
          code: `function numTeams(rating) {
  const n = rating.length;
  let teams = 0;
  for (let j = 1; j < n - 1; j++) {
    let lessLeft = 0;
    let lessRight = 0;
    for (let i = 0; i < j; i++) {
      if (rating[i] < rating[j]) lessLeft++;
    }
    for (let k = j + 1; k < n; k++) {
      if (rating[k] < rating[j]) lessRight++;
    }
    const moreLeft = j - lessLeft; // ratings are all different
    const moreRight = n - 1 - j - lessRight;
    teams += lessLeft * moreRight + moreLeft * lessRight;
  }
  return teams;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
      ],
      fn: 'numTeams',
      starter: `function numTeams(rating) {
  // count triples i < j < k going strictly up or strictly down
  return 0;
}`,
      solution: `function numTeams(rating) {
  const n = rating.length;
  let teams = 0;
  for (let j = 1; j < n - 1; j++) {
    let lessLeft = 0;
    let lessRight = 0;
    for (let i = 0; i < j; i++) {
      if (rating[i] < rating[j]) lessLeft++;
    }
    for (let k = j + 1; k < n; k++) {
      if (rating[k] < rating[j]) lessRight++;
    }
    const moreLeft = j - lessLeft; // ratings are all different
    const moreRight = n - 1 - j - lessRight;
    teams += lessLeft * moreRight + moreLeft * lessRight;
  }
  return teams;
}`,
      tests: [
        { name: 'example', args: [[2, 5, 3, 4, 1]], expected: 3 },
        { name: 'no team', args: [[2, 1, 3]], expected: 0 },
        { name: 'all going up', args: [[1, 2, 3, 4]], expected: 4 },
        { name: 'all going down', args: [[4, 3, 2, 1]], expected: 4 },
        { name: 'exactly three', args: [[1, 2, 3]], expected: 1 },
        { name: 'three, no order', args: [[3, 1, 2]], expected: 0 },
        { name: 'zigzag', args: [[1, 5, 2, 4, 3]], expected: 3 },
        { name: 'six kids', args: [[5, 1, 4, 2, 6, 3]], expected: 5 },
      ],
      takeaway: 'For triples, fix the middle and multiply the counts on each side.',
    },
    {
      id: 'thinking-pairs-diff-k',
      title: 'Count Pairs With Difference K',
      difficulty: 'easy',
      leetcode: 2006,
      pattern: 'Read the constraints',
      statement:
        'A music app pairs songs for a smooth mix when their tempo levels differ by exactly `k`. Given the levels `nums`, return how many pairs `i < j` have `|nums[i] - nums[j]| = k`.',
      examples: [
        { input: 'nums = [1,2,2,1], k = 1', output: '4', explain: 'Each 1 pairs with each 2: 2 × 2 = 4 pairs.' },
        { input: 'nums = [3,2,1,5,4], k = 2', output: '3', explain: '(3,1), (3,5), (2,4).' },
      ],
      constraints: ['1 ≤ n ≤ 200', '1 ≤ nums[i] ≤ 100', '1 ≤ k ≤ 99'],
      hints: [
        'Look at the constraints before looking for a clever idea. How many pairs can there be at most?',
        'n ≤ 200 means at most about 20,000 pairs. That is tiny.',
        'Two nested loops, `j` starting at `i + 1`, and count when `Math.abs(nums[i] - nums[j]) === k`.',
      ],
      approaches: [
        {
          name: 'Check every pair (the right call here)',
          idea: 'With n ≤ 200 there are at most ~20,000 pairs, far below the ~10⁸ budget. Brute force is correct, simple, and fast enough, so it is the intended answer. (Module 2 shows an O(n) counting version for when n is huge.)',
          pseudo: `function countKDifference(nums, k):
    pairs ← 0
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if |nums[i] - nums[j]| = k:
                pairs ← pairs + 1
    return pairs`,
          code: `function countKDifference(nums, k) {
  let pairs = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (Math.abs(nums[i] - nums[j]) === k) pairs++;
    }
  }
  return pairs;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
      ],
      fn: 'countKDifference',
      starter: `function countKDifference(nums, k) {
  // count pairs i < j where the levels differ by exactly k
  return 0;
}`,
      solution: `function countKDifference(nums, k) {
  let pairs = 0;
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (Math.abs(nums[i] - nums[j]) === k) pairs++;
    }
  }
  return pairs;
}`,
      tests: [
        { name: 'example', args: [[1, 2, 2, 1], 1], expected: 4 },
        { name: 'no pairs', args: [[1, 3], 3], expected: 0 },
        { name: 'both directions', args: [[3, 2, 1, 5, 4], 2], expected: 3 },
        { name: 'one song', args: [[5], 1], expected: 0 },
        { name: 'all the same', args: [[7, 7, 7], 1], expected: 0 },
        { name: 'neighbours', args: [[1, 2, 3, 4, 5], 1], expected: 4 },
        { name: 'duplicates on both sides', args: [[1, 1, 2, 2], 1], expected: 4 },
        { name: 'widest gap', args: [[100, 1], 99], expected: 1 },
      ],
      takeaway: 'Small n means brute force is the answer. Check the limits before reaching for a trick.',
    },
    {
      id: 'thinking-richest-customer',
      title: 'Richest Customer Wealth',
      difficulty: 'easy',
      leetcode: 1672,
      pattern: 'Read the constraints',
      statement:
        'A banking app has a grid `accounts`: row `i` is a customer, column `j` is a bank, and `accounts[i][j]` is the money customer `i` keeps in bank `j`. A customer\'s wealth is the total across all their banks. Return the wealth of the richest customer.',
      examples: [
        { input: 'accounts = [[1,2,3],[3,2,1]]', output: '6', explain: 'Both customers have 6.' },
        { input: 'accounts = [[1,5],[7,3],[3,5]]', output: '10', explain: 'The second customer has 7 + 3 = 10.' },
      ],
      constraints: ['1 ≤ m, n ≤ 50', '1 ≤ accounts[i][j] ≤ 100'],
      hints: [
        'The grid has at most 50 × 50 = 2,500 cells. Can you afford to look at every cell?',
        'Sum each row, keep the biggest sum.',
      ],
      approaches: [
        {
          name: 'Sum every row',
          idea: 'Every cell can change the answer, so you must read every cell at least once. Reading each exactly once is therefore the best possible: O(m·n).',
          pseudo: `function maximumWealth(accounts):
    richest ← 0
    for each row in accounts:
        wealth ← 0
        for each money in row:
            wealth ← wealth + money
        richest ← max(richest, wealth)
    return richest`,
          code: `function maximumWealth(accounts) {
  let richest = 0;
  for (const row of accounts) {
    let wealth = 0;
    for (const money of row) wealth += money;
    richest = Math.max(richest, wealth);
  }
  return richest;
}`,
          time: 'O(m·n)',
          space: 'O(1)',
        },
      ],
      fn: 'maximumWealth',
      starter: `function maximumWealth(accounts) {
  // return the biggest row total
  return 0;
}`,
      solution: `function maximumWealth(accounts) {
  let richest = 0;
  for (const row of accounts) {
    let wealth = 0;
    for (const money of row) wealth += money;
    richest = Math.max(richest, wealth);
  }
  return richest;
}`,
      tests: [
        { name: 'tie', args: [[[1, 2, 3], [3, 2, 1]]], expected: 6 },
        { name: 'middle customer', args: [[[1, 5], [7, 3], [3, 5]]], expected: 10 },
        { name: 'square grid', args: [[[2, 8, 7], [7, 1, 3], [1, 9, 5]]], expected: 17 },
        { name: 'one cell', args: [[[5]]], expected: 5 },
        { name: 'one bank each', args: [[[1], [2], [3]]], expected: 3 },
        { name: 'one customer', args: [[[1, 1, 1, 1]]], expected: 4 },
        { name: 'close race', args: [[[10, 1], [1, 10], [5, 6]]], expected: 11 },
      ],
      takeaway: 'If every input value can change the answer, reading each one once is already optimal.',
    },
  ],
  quiz: [
    {
      prompt: 'The limits say `n ≤ 10⁵`. Your idea is O(n²). What happens?',
      options: [
        'Fine: 10⁵ is small',
        'About 10¹⁰ steps: far too slow, aim for O(n log n) or O(n)',
        'About 10⁷ steps: fine',
        'It depends only on the examples',
      ],
      answer: 1,
      explanation: '(10⁵)² = 10¹⁰, about 100 times over the ~10⁸ budget. Expect "Time Limit Exceeded".',
    },
    {
      prompt: 'The limits say `n ≤ 20`. Is trying every subset (O(2ⁿ)) OK?',
      options: ['No, exponential is always too slow', 'Yes: 2²⁰ is about 10⁶ steps', 'Only if n ≤ 10', 'Only with a hash map'],
      answer: 1,
      explanation: '2²⁰ ≈ 1,000,000. A tiny n is often the problem quietly telling you to try everything.',
    },
    {
      prompt: 'Ratings `[1, 4, 2, 5]`. How many teams have the kid rated `4` (index 1) in the middle?',
      options: ['0', '1', '2', '3'],
      answer: 1,
      explanation: 'lessLeft = 1 (the 1), moreLeft = 0, lessRight = 1 (the 2), moreRight = 1 (the 5). Teams = 1·1 + 0·1 = 1, the team (1, 4, 5).',
    },
  ],
  takeaways: [
    'Plug the biggest n into your Big-O. Stay under about 10⁸ steps.',
    'Use the cheat sheet backwards: the limit tells you the target, and the target hints at the idea.',
    'Small limits mean brute force is fine; small *values* mean you can use an array of counters.',
  ],
};

export default lesson;
