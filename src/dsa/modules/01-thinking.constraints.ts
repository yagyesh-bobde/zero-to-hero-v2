import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'constraints',
  title: 'Constraints pick the target',
  summary: 'Use the size limits to decide whether checking every choice is practical.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Sports day relay teams',
      text: 'A coach lines up five runners with different speed ratings: `[2, 5, 3, 4, 1]`. Pick three runners without changing their order in the line. How many teams have ratings that go up at every step, or down at every step?',
    },
    {
      kind: 'text',
      text: 'The teams are `(2, 3, 4)`, `(5, 3, 1)`, and `(5, 4, 1)`: answer `3`. The runners need not stand next to each other. “Strictly up” means every next rating is bigger; “strictly down” means every next rating is smaller. Three chosen runners form a **triple**. Positions `i < j < k` name the first, middle, and last runner.',
    },
    {
      kind: 'text',
      text: '**Constraints** are the limits and promises listed under a problem. `3 ≤ n ≤ 1000` says there are at least 3 runners and at most 1,000. `≤` means “less than or equal to”; `≥` means “greater than or equal to”. Use the largest allowed input to check your idea.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the condition for a team',
      text: '`and` requires both checks to pass. `or` needs at least one side to pass. So `(a < b and b < c) or (a > b and b > c)` accepts either two upward steps or two downward steps. The parentheses group each kind of team.',
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
      text: 'Three loops try every group of three. With 5 runners you check 10 groups. With 1,000 runners you check 166,167,000 groups. That growth is **O(n³)**: `n³` means `n × n × n`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'A work estimate, not a stopwatch',
      text: 'You may see a rough budget of `10⁸`, or 100 million simple operations per second. Real speed depends on the machine, language, and work in each loop. A group check takes several operations. Hundreds of millions of checks are a warning; look for much less work.',
    },
    {
      kind: 'text',
      text: 'For one middle runner, the brute force tries each left runner with each right runner. Let’s count those choices instead of listing them. If there are 2 suitable runners on the left and 3 on the right, you get `2 × 3 = 6` teams. Each left choice works with each right choice.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Keep one middle runner fixed',
      text: 'For an increasing team, choose a smaller rating on the left and a bigger rating on the right. For a decreasing team, choose a bigger rating on the left and a smaller rating on the right. Multiply each pair of counts, then add the two results.',
    },
    {
      kind: 'text',
      text: 'In `[2, 5, 3, 4, 1]`, fix the middle rating `3`. On the left, `2` is smaller and `5` is bigger. On the right, `1` is smaller and `4` is bigger. You get `1 × 1` increasing team and `1 × 1` decreasing team: `(2, 3, 4)` and `(5, 3, 1)`.',
    },
    {
      kind: 'diagram',
      title: 'The plan for one middle runner',
      art: [
        'Pick a middle (skip first and last runners)',
        'Start four side counts at 0',
        '  |',
        '  v',
        'Read each runner on the left, then the right',
        '  |',
        '  v',
        'Smaller than the middle?',
        '  | yes                    | no (all differ)',
        '  v                        v',
        'Count as smaller        Count as bigger',
        '  |                        |',
        '  +-----------+------------+',
        '              v',
        'After both sides: multiply matching counts',
        'up = smaller-left x bigger-right',
        'down = bigger-left x smaller-right',
        '              |',
        '              v',
        'Add up + down; next middle, or return total',
      ].join('\n'),
      caption:
        'Count each side separately for every middle; all ratings are different, so a rating that is not smaller is bigger.',
    },
    {
      kind: 'text',
      text: 'Use `[2, 5, 3, 4, 1]` and watch which actual runners fill the four side counts as each possible middle is chosen.',
    },
    {
      kind: 'steps',
      title: 'Fix the middle on [2, 5, 3, 4, 1]',
      frames: [
        {
          cells: [2, 5, 3, 4, 1],
          pointers: { middle: 1 },
          active: [1],
          vars: {
            'smaller on the left (lessLeft)': '2  (1 runner)',
            'bigger on the left (moreLeft)': 'none  (0 runners)',
            'smaller on the right (lessRight)': '3, 4, 1  (3 runners)',
            'bigger on the right (moreRight)': 'none  (0 runners)',
            'teams from this middle': '1 x 0 + 0 x 3 = 0',
            'total teams (teams)': 0,
          },
          note: 'Middle 5 adds no teams because neither side has a bigger runner.',
        },
        {
          cells: [2, 5, 3, 4, 1],
          pointers: { middle: 2 },
          active: [2],
          done: [1],
          vars: {
            'smaller on the left (lessLeft)': '2  (1 runner)',
            'bigger on the left (moreLeft)': '5  (1 runner)',
            'smaller on the right (lessRight)': '1  (1 runner)',
            'bigger on the right (moreRight)': '4  (1 runner)',
            'teams from this middle': '1 x 1 + 1 x 1 = 2',
            'actual teams': '(2, 3, 4) and (5, 3, 1)',
            'total teams (teams)': 2,
          },
          note: 'Middle 3 adds two teams because it has one matching pair of partners in each direction.',
        },
        {
          cells: [2, 5, 3, 4, 1],
          pointers: { middle: 3 },
          active: [3],
          done: [1, 2],
          vars: {
            'smaller on the left (lessLeft)': '2, 3  (2 runners)',
            'bigger on the left (moreLeft)': '5  (1 runner)',
            'smaller on the right (lessRight)': '1  (1 runner)',
            'bigger on the right (moreRight)': 'none  (0 runners)',
            'teams from this middle': '2 x 0 + 1 x 1 = 1',
            'actual team': '(5, 4, 1)',
            'total teams (teams)': '2 + 1 = 3',
          },
          note: 'Middle 4 adds only (5, 4, 1) because no bigger runner stands on its right.',
        },
        {
          cells: [2, 5, 3, 4, 1],
          found: [0, 1, 2, 3, 4],
          vars: {
            'teams found': '(2, 3, 4); (5, 3, 1); (5, 4, 1)',
            'total teams (teams)': '0 + 2 + 1 = 3',
          },
          note: 'Return 3 because each listed team was counted at its own middle; the marks show all runners used across those teams.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Fixing the middle counted three teams without trying every left-and-right pair separately.',
    },
    {
      kind: 'text',
      text: 'Use `[2, 1, 3]` and watch why having a runner on each side of the middle still may give no valid team.',
    },
    {
      kind: 'steps',
      title: 'No team on [2, 1, 3]',
      frames: [
        {
          cells: [2, 1, 3],
          pointers: { middle: 1 },
          active: [1],
          vars: { 'middle rating': 1, 'total teams (teams)': 0 },
          note: 'Choose 1 as the only possible middle because a team needs a runner on both sides.',
        },
        {
          cells: [2, 1, 3],
          pointers: { middle: 1, checking: 0 },
          active: [0, 1],
          vars: {
            'smaller on the left (lessLeft)': 'none (0 runners)',
            'bigger on the left (moreLeft)': '2 (1 runner)',
            'right side': 'not counted yet',
          },
          note: 'Count 2 as bigger on the left because 2 is above the middle rating 1.',
        },
        {
          cells: [2, 1, 3],
          pointers: { middle: 1, checking: 2 },
          active: [1, 2],
          done: [0],
          vars: {
            'smaller on the left (lessLeft)': 'none (0 runners)',
            'bigger on the left (moreLeft)': '2 (1 runner)',
            'smaller on the right (lessRight)': 'none (0 runners)',
            'bigger on the right (moreRight)': '3 (1 runner)',
          },
          note: 'Count 3 as bigger on the right because 3 is also above the middle rating 1.',
        },
        {
          cells: [2, 1, 3],
          done: [0, 1, 2],
          vars: {
            'upward teams': '0 smaller-left x 1 bigger-right = 0',
            'downward teams': '1 bigger-left x 0 smaller-right = 0',
            'total teams (teams)': 0,
          },
          note: 'Return 0 because (2, 1, 3) turns down then up, so neither direction works.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Matching side counts matter: no smaller partner means no team here, even though three runners are available.',
    },
    {
      kind: 'text',
      text: 'All ratings are different. At position `j`, there are `j` runners to the left. So `moreLeft = j - lessLeft`. With middle position 2, there are 2 runners on the left; if 1 is smaller, the other 1 is bigger. The same subtraction works on the right.',
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
      kind: 'text',
      text: 'For each middle runner, you read the other ratings once. About 1,000 middle choices × 1,000 visits gives about 1 million visits: O(n²) time. The four counters use O(1) extra space. In the comparison, `10⁶` is 1 million and `1.7·10⁸` is about 170 million.',
    },
    {
      kind: 'compare',
      title: 'Count number of teams (n ≤ 1000)',
      rows: [
        {
          approach: 'Every triple',
          time: 'O(n³)',
          space: 'O(1)',
          note: '~1.7·10⁸ steps at n = 1000. Too slow for the limit.',
        },
        {
          approach: 'Fix the middle',
          time: 'O(n²)',
          space: 'O(1)',
          note: '~10⁶ steps. Exactly what the constraint asked for.',
        },
      ],
    },
    {
      kind: 'table',
      title: 'Growth shapes you will meet later',
      head: ['Name', 'Small example', 'What grows'],
      rows: [
        [
          'O(log n), read “O of log n”',
          '16 choices → 8 → 4 → 2 → 1: 4 halvings',
          'Each step cuts the choices roughly in half. log₂ n counts these halvings; the small 2 means “halve”, rather than divide by some other number. Module 5 teaches this search.',
        ],
        [
          'O(n log n)',
          'For n = 16, n × log₂ n = 16 × 4 = 64',
          'Work like visiting all items over several halving levels. Sorting often has this cost. “Sort” means put values in order.',
        ],
        [
          'O(2ⁿ)',
          '3 yes/no choices give 2 × 2 × 2 = 8 combinations',
          'Every extra choice doubles the combinations. A subset is one selection of items, possibly none. Module 9 tries these selections.',
        ],
        [
          'O(n!)',
          '4! = 4 × 3 × 2 × 1 = 24 orders',
          'The ! means multiply all whole numbers from 1 to n. Trying every order grows very quickly.',
        ],
      ],
    },
    {
      kind: 'table',
      title: 'Use limits as clues, then check the actual work',
      head: ['Largest input', 'Rough count', 'What to consider'],
      rows: [
        ['10 items', '10! = 3,628,800 orders', 'Trying every order may fit.'],
        ['20 items', '2²⁰ = 1,048,576 selections', 'Trying every selection may fit.'],
        ['500 items', '500³ = 125,000,000', 'Three full loops are already risky.'],
        ['5,000 items', '5,000² = 25,000,000', 'Two full loops may fit if each check is cheap.'],
        [
          '1,000,000 items',
          'One pass: 1 million; n log₂ n: about 20 million',
          'Look for one pass or sorting, rather than every pair.',
        ],
      ],
    },
    {
      kind: 'text',
      text: 'A grid is an array of rows. With 2 rows and 3 columns, you read 6 cells. If `m` is the number of rows and `n` is the number of columns, reading every cell takes **O(m·n)** time. The dot means multiply. Different letters can measure different parts of the input.',
    },
    {
      kind: 'text',
      text: '**Pattern: fix the middle.** Use it when you count triples and the middle item determines which left and right items fit. Count the partners on each side, then multiply. For the 200-song practice problem below, checking every pair is already small enough; a faster method is optional.',
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
      title: 'Examples are smaller than the full tests',
      text: 'An idea that is fast on five items may be slow on 1,000. Check the largest allowed size before coding. “Time Limit Exceeded” means a test took longer than the allowed time. The size table gives clues, so still count what your own loops do.',
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
        'Runners stand in a line with different ratings in `rating`. Choose three positions `i < j < k`, without changing their order. Count teams whose ratings go up at both steps or down at both steps. For `[1, 2, 3, 4]`, the teams are `(1,2,3)`, `(1,2,4)`, `(1,3,4)`, and `(2,3,4)`: return `4`. A runner may appear in several teams.',
      examples: [
        { input: 'rating = [2,5,3,4,1]', output: '3', explain: '(2,3,4), (5,4,1) and (5,3,1).' },
        { input: 'rating = [2,1,3]', output: '0' },
        { input: 'rating = [1,2,3,4]', output: '4' },
      ],
      constraints: [
        'There are 3 to 1,000 runners.',
        'Each rating is from 1 to 100,000.',
        'All ratings are different.',
      ],
      hints: [
        'Every team has exactly one middle runner. What happens if you choose that runner first?',
        'For one middle rating, count smaller and bigger ratings on each side.',
        'If 2 smaller left ratings can each pair with 3 bigger right ratings, that makes 2 × 3 = 6 increasing teams.',
        'Add lessLeft × moreRight for increasing teams and moreLeft × lessRight for decreasing teams. Repeat for each middle position.',
      ],
      approaches: [
        {
          name: 'Every triple',
          idea: 'Try every three positions in increasing order. Keep the team if its ratings increase twice or decrease twice. It checks every possibility, but the three loops take O(n³) time.',
          time: 'O(n³)',
          space: 'O(1)',
        },
        {
          name: 'Fix the middle',
          idea: 'Let’s count partners instead of listing teams. For a middle rating of 3 in `[2, 5, 3, 4, 1]`, 2 can pair with 4 to go up, and 5 can pair with 1 to go down. Multiply the smaller-left and bigger-right counts, then add bigger-left × smaller-right; repeat for every middle.',
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
        'A music app pairs songs whose tempo levels differ by exactly `k`. Count pairs of different positions `i < j` in `nums`. The notation `|a - b|` means the distance between a and b, ignoring the sign: both `|1 - 2|` and `|2 - 1|` are 1. For `[1, 2, 2, 1]` and `k = 1`, each of the two 1s pairs with each of the two 2s: return `2 × 2 = 4`.',
      examples: [
        {
          input: 'nums = [1,2,2,1], k = 1',
          output: '4',
          explain: 'Each 1 pairs with each 2: 2 × 2 = 4 pairs.',
        },
        { input: 'nums = [3,2,1,5,4], k = 2', output: '3', explain: '(3,1), (3,5), (2,4).' },
      ],
      constraints: [
        'There are 1 to 200 songs.',
        'Each level is from 1 to 100.',
        'k is from 1 to 99.',
      ],
      hints: [
        'At most 200 songs means fewer than 20,000 different pairs. Do you need a faster method than trying them all?',
        'Start the second position after the first, so you never pair a song with itself or count a pair twice.',
        'Check every i and j with j > i. Math.abs(nums[i] - nums[j]) gives their nonnegative difference. Add 1 when it equals k.',
      ],
      approaches: [
        {
          name: 'Check every pair (the right call here)',
          idea: 'For each song, check the songs after it. Math.abs turns a negative difference positive, so both 1 - 2 and 2 - 1 give a distance of 1. At most 200 songs means only 19,900 pairs, so this direct O(n²) plan is practical.',
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
      takeaway:
        'Small limits can make checking every pair a good choice. Estimate the work before adding a faster method.',
    },
    {
      id: 'thinking-richest-customer',
      title: 'Richest Customer Wealth',
      difficulty: 'easy',
      leetcode: 1672,
      pattern: 'Read the constraints',
      statement:
        'A bank app stores balances in a grid `accounts`, an array of row arrays. Each row belongs to one customer; each number in the row is money at one bank. Return the largest row total. For `[[1, 5], [7, 3]]`, the totals are 6 and 10, so return `10`.',
      examples: [
        { input: 'accounts = [[1,2,3],[3,2,1]]', output: '6', explain: 'Both customers have 6.' },
        {
          input: 'accounts = [[1,5],[7,3],[3,5]]',
          output: '10',
          explain: 'The second customer has 7 + 3 = 10.',
        },
      ],
      constraints: [
        'There are 1 to 50 customers (m rows).',
        'Each customer has 1 to 50 bank balances (n columns).',
        'Each balance is from 1 to 100.',
      ],
      hints: [
        'Work out each customer’s total by hand. Does any balance have to be skipped?',
        'Start a fresh wealth total at 0 for each row. Add its balances, then compare that total with richest.',
      ],
      approaches: [
        {
          name: 'Sum every row',
          idea: 'Add all balances for one customer, then keep the largest customer total. Reset wealth to 0 before each new row so customers do not get mixed together. With m rows and n columns you visit m × n cells, giving O(m·n) time and just a few variables of extra space.',
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
        {
          name: 'tie',
          args: [
            [
              [1, 2, 3],
              [3, 2, 1],
            ],
          ],
          expected: 6,
        },
        {
          name: 'middle customer',
          args: [
            [
              [1, 5],
              [7, 3],
              [3, 5],
            ],
          ],
          expected: 10,
        },
        {
          name: 'square grid',
          args: [
            [
              [2, 8, 7],
              [7, 1, 3],
              [1, 9, 5],
            ],
          ],
          expected: 17,
        },
        { name: 'one cell', args: [[[5]]], expected: 5 },
        { name: 'one bank each', args: [[[1], [2], [3]]], expected: 3 },
        { name: 'one customer', args: [[[1, 1, 1, 1]]], expected: 4 },
        {
          name: 'close race',
          args: [
            [
              [10, 1],
              [1, 10],
              [5, 6],
            ],
          ],
          expected: 11,
        },
      ],
      takeaway:
        'When every value can affect the answer, visiting every value once is already enough.',
    },
  ],
  quiz: [
    {
      prompt:
        'There can be 100,000 items. Your idea checks roughly n × n pairs. What should you do?',
      options: [
        'Assume it is fast because the example is small',
        'Look for less work: that is about 10 billion checks',
        'Count only 100,000 checks',
        'Ignore the limits',
      ],
      answer: 1,
      explanation:
        '100,000 × 100,000 is 10 billion. Reading each item once, or sorting, would involve far less work.',
    },
    {
      prompt: 'There are at most 20 items. Is trying every subset, O(2ⁿ), worth considering?',
      options: [
        'No, it can never fit',
        'Yes: 2²⁰ is about 1 million selections',
        'Only if there is one item',
        'Only after sorting',
      ],
      answer: 1,
      explanation:
        'A subset is a selection of items. Each item can be in or out. With 20 items, there are 1,048,576 selections. Check the work per selection too.',
    },
    {
      prompt:
        'Ratings `[1, 4, 2, 5]`. How many teams have the kid rated `4` (index 1) in the middle?',
      options: ['0', '1', '2', '3'],
      answer: 1,
      explanation:
        'lessLeft = 1 (the 1), moreLeft = 0, lessRight = 1 (the 2), moreRight = 1 (the 5). Teams = 1·1 + 0·1 = 1, the team (1, 4, 5).',
    },
  ],
  takeaways: [
    'Constraints tell you the allowed sizes and the promises your code may rely on.',
    'Estimate work at the largest size. Timing budgets are rough clues, not guarantees.',
    'For triples, fixing the middle can turn listing choices into multiplying counts.',
  ],
};

export default lesson;
