import type { Problem } from '../types';

const backpack: Problem = {
  id: 'dp-2d-backpack',
  title: 'Pack the Backpack (0/1 knapsack)',
  difficulty: 'medium',
  pattern: '0/1 knapsack',
  statement:
    'You are packing for a hike. Item `i` weighs `weights[i]` kg and is worth `values[i]` fun points. Your back can carry at most `limit` kg. You either pack an item or leave it (you have only one of each). Return the most fun points you can carry.',
  examples: [
    {
      input: 'weights = [1,3,4], values = [15,20,30], limit = 4',
      output: '35',
      explain: 'Snacks (1 kg, 15) + camera (3 kg, 20) = 4 kg, 35 points. The tent alone is 30.',
    },
    { input: 'weights = [5], values = [10], limit = 4', output: '0', explain: 'The only item is too heavy.' },
  ],
  constraints: ['1 ≤ n ≤ 100', '0 ≤ limit ≤ 1000', 'weights ≥ 1'],
  hints: [
    'For each item there are two choices: pack it or skip it.',
    'The state needs two numbers: how many items you have decided on, and how much room is left.',
    '`best(i, cap) = max(best(i - 1, cap), values[i - 1] + best(i - 1, cap - weights[i - 1]))`, the second only if it fits.',
    'One row works if you loop the capacity from `limit` **down** to the item\'s weight, so each item is counted at most once.',
  ],
  approaches: [
    {
      name: 'Try every subset',
      idea: 'Each item is in or out, so there are `2^n` packings. Check the weight of each and keep the best value. Fine for 10 items, hopeless for 100.',
      time: 'O(2^n × n)',
      space: 'O(n)',
    },
    {
      name: '2D table: items × capacity',
      idea: '`dp[i][c]` = best value using only the first `i` items with `c` kg of room. Skip item `i` → the row above, same `c`. Pack it → the row above, `c - weight`, plus its value. Both look at the row above, so no item is used twice.',
      time: 'O(n × limit)',
      space: 'O(n × limit)',
    },
    {
      name: 'One row, capacity backwards',
      idea: 'Keep one array `best[c]`. For each item, update `c` from high to low. Then `best[c - w]` has not been updated for this item yet, so it still means "without this item". Looping forwards would let the item be packed again and again.',
      pseudo: `function maxBackpackValue(weights, values, limit):
    best ← array of limit + 1 zeros       // best[c] = most value with c kg of room
    for i from 0 to n - 1:
        w ← weights[i], v ← values[i]
        for c from limit down to w:        // BACKWARDS: each item once
            best[c] ← max(best[c], v + best[c - w])
    return best[limit]`,
      code: `function maxBackpackValue(weights, values, limit) {
  const best = new Array(limit + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i], v = values[i];
    for (let c = limit; c >= w; c--) {
      best[c] = Math.max(best[c], v + best[c - w]);
    }
  }
  return best[limit];
}`,
      time: 'O(n × limit)',
      space: 'O(limit)',
    },
  ],
  fn: 'maxBackpackValue',
  starter: `function maxBackpackValue(weights, values, limit) {
  // most total value with total weight <= limit, each item at most once
  return 0;
}`,
  solution: `function maxBackpackValue(weights, values, limit) {
  const best = new Array(limit + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i], v = values[i];
    for (let c = limit; c >= w; c--) {
      best[c] = Math.max(best[c], v + best[c - w]);
    }
  }
  return best[limit];
}`,
  tests: [
    { name: 'lesson example', args: [[1, 3, 4], [15, 20, 30], 4], expected: 35 },
    { name: 'four items', args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
    { name: 'too heavy', args: [[5], [10], 4], expected: 0 },
    { name: 'exact fit', args: [[5], [10], 5], expected: 10 },
    { name: 'no room at all', args: [[2, 2, 2], [3, 3, 3], 0], expected: 0 },
    { name: 'greedy by value fails', args: [[1, 2, 3], [6, 10, 12], 5], expected: 22 },
    { name: 'small item worth a lot', args: [[4, 2, 3, 1], [10, 4, 7, 8], 6], expected: 19 },
    { name: 'five items', args: [[3, 4, 5, 9, 4], [3, 4, 4, 10, 4], 11], expected: 11 },
    { name: 'everything fits', args: [[1, 1, 1], [1, 1, 1], 10], expected: 3 },
  ],
  takeaway: '0/1 knapsack: state = (items considered, room left). One row only if you loop the room backwards.',
};

const partition: Problem = {
  id: 'dp-2d-partition-equal-subset',
  title: 'Partition Equal Subset Sum',
  difficulty: 'medium',
  leetcode: 416,
  pattern: '0/1 knapsack',
  statement:
    'Two kids want to split a bag of candy bars so that both get exactly the same total number of calories. Each bar goes to one kid, whole. Given the calories of each bar, return `true` if a fair split exists.',
  examples: [
    { input: 'nums = [1,5,11,5]', output: 'true', explain: '[1, 5, 5] and [11], both sum to 11.' },
    { input: 'nums = [1,2,3,5]', output: 'false', explain: 'The total is 11, which is odd.' },
  ],
  constraints: ['1 ≤ nums.length ≤ 200', '1 ≤ nums[i] ≤ 100'],
  hints: [
    'If the total is odd, it is impossible.',
    'Otherwise you only need to find **one** pile that sums to `total / 2`. The rest is the other pile.',
    'That is a knapsack where each bar is packed or skipped, and you ask "can I hit exactly this sum?"',
    '`can[s]` = true if some bars sum to `s`. For each bar, loop `s` from `target` down to the bar: `can[s] ← can[s] or can[s - bar]`.',
  ],
  approaches: [
    {
      name: 'Try every subset',
      idea: 'Check all `2^n` ways to choose a pile and see if any sums to half the total.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Subset-sum table, one row',
      idea: 'Same as the backpack, but the "value" is just true/false: can I reach this sum? Start with only sum 0 reachable. Each bar can make new sums `s` from `s - bar`. Loop backwards so a bar is used once.',
      pseudo: `function canPartition(nums):
    total ← sum of nums
    if total is odd:
        return false
    target ← total / 2
    can ← array of target + 1 values, all false
    can[0] ← true                          // the empty pile
    for each x in nums:
        for s from target down to x:
            if can[s - x]:
                can[s] ← true
    return can[target]`,
      code: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 === 1) return false;
  const target = total / 2;
  const can = new Array(target + 1).fill(false);
  can[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) {
      if (can[s - x]) can[s] = true;
    }
  }
  return can[target];
}`,
      time: 'O(n × total)',
      space: 'O(total)',
    },
  ],
  fn: 'canPartition',
  starter: `function canPartition(nums) {
  // can nums be split into two piles with equal sums?
  return false;
}`,
  solution: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2 === 1) return false;
  const target = total / 2;
  const can = new Array(target + 1).fill(false);
  can[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) {
      if (can[s - x]) can[s] = true;
    }
  }
  return can[target];
}`,
  tests: [
    { name: 'classic yes', args: [[1, 5, 11, 5]], expected: true },
    { name: 'odd total', args: [[1, 2, 3, 5]], expected: false },
    { name: 'two equal', args: [[1, 1]], expected: true },
    { name: 'single bar', args: [[1]], expected: false },
    { name: 'even total, still no', args: [[2, 2, 3, 5]], expected: false },
    { name: 'five bars', args: [[3, 3, 3, 4, 5]], expected: true },
    { name: 'one big bar', args: [[100]], expected: false },
    { name: 'one through seven', args: [[1, 2, 3, 4, 5, 6, 7]], expected: true },
    { name: 'mixed sizes', args: [[14, 9, 8, 4, 3, 2]], expected: true },
  ],
  takeaway: 'A "split into two equal halves" question is a subset-sum knapsack for `total / 2`.',
};

const targetSum: Problem = {
  id: 'dp-2d-target-sum',
  title: 'Target Sum',
  difficulty: 'medium',
  leetcode: 494,
  pattern: '0/1 knapsack',
  statement:
    'A game show gives you a row of numbered cards. You must put a `+` or a `-` sign in front of **every** card, then add them all up. Count how many different sign choices give exactly `target`.',
  examples: [
    { input: 'nums = [1,1,1,1,1], target = 3', output: '5', explain: 'Pick which one card gets the minus: 5 ways.' },
    { input: 'nums = [1], target = 1', output: '1' },
  ],
  constraints: ['1 ≤ nums.length ≤ 20', '0 ≤ nums[i] ≤ 1000', 'sum(nums) ≤ 1000', '-1000 ≤ target ≤ 1000'],
  hints: [
    'Brute force tries `2^n` sign choices. It passes here, but there is a neat knapsack inside.',
    'Call the plus cards `P` and the minus cards `N`. Then `P - N = target` and `P + N = total`.',
    'Add the two: `P = (total + target) / 2`. So count the subsets that sum to that number.',
    'If `total + target` is odd or negative, or `|target| > total`, the answer is 0. Count with `ways[s] ← ways[s] + ways[s - x]`, looping `s` backwards.',
  ],
  approaches: [
    {
      name: 'Try every sign',
      idea: 'Recursion: for each card try `+` and `-`, count the endings that hit `target`. Simple and correct, but `2^n`.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Turn it into subset-sum counting',
      idea: 'The plus cards must sum to `P = (total + target) / 2`, and then the minus cards are fixed. So the answer is "how many subsets sum to `P`". Count them like coin change ways, but loop the sum backwards so each card is used once. Zeros double the count, which this handles on its own.',
      pseudo: `function findTargetSumWays(nums, target):
    total ← sum of nums
    if |target| > total or (total + target) is odd:
        return 0
    goal ← (total + target) / 2
    ways ← array of goal + 1 zeros
    ways[0] ← 1                          // one way to make 0: pick nothing
    for each x in nums:
        for s from goal down to x:
            ways[s] ← ways[s] + ways[s - x]
    return ways[goal]`,
      code: `function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const goal = (total + target) / 2;
  const ways = new Array(goal + 1).fill(0);
  ways[0] = 1;
  for (const x of nums) {
    for (let s = goal; s >= x; s--) ways[s] += ways[s - x];
  }
  return ways[goal];
}`,
      time: 'O(n × total)',
      space: 'O(total)',
    },
  ],
  fn: 'findTargetSumWays',
  starter: `function findTargetSumWays(nums, target) {
  // count the +/- sign choices that sum to target
  return 0;
}`,
  solution: `function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;
  const goal = (total + target) / 2;
  const ways = new Array(goal + 1).fill(0);
  ways[0] = 1;
  for (const x of nums) {
    for (let s = goal; s >= x; s--) ways[s] += ways[s - x];
  }
  return ways[goal];
}`,
  tests: [
    { name: 'five ones', args: [[1, 1, 1, 1, 1], 3], expected: 5 },
    { name: 'one card, hit', args: [[1], 1], expected: 1 },
    { name: 'one card, miss', args: [[1], 2], expected: 0 },
    { name: 'zeros double the count', args: [[0, 0, 0], 0], expected: 8 },
    { name: 'sum to zero', args: [[1, 2, 1], 0], expected: 2 },
    { name: 'negative target', args: [[1, 1, 1, 1, 1], -3], expected: 5 },
    { name: 'zero target, three cards', args: [[2, 3, 5], 0], expected: 2 },
    { name: 'a zero card', args: [[1, 0], 1], expected: 2 },
    { name: 'one way only', args: [[5, 3, 2, 6], 4], expected: 1 },
    { name: 'target too big', args: [[1, 2, 3], 7], expected: 0 },
  ],
  takeaway: 'Signs on every number → split into a plus pile and a minus pile → count subsets with a fixed sum.',
};

const lastStone: Problem = {
  id: 'dp-2d-last-stone-weight-2',
  title: 'Last Stone Weight II',
  difficulty: 'medium',
  leetcode: 1049,
  pattern: '0/1 knapsack',
  statement:
    'You have a pile of rocks. Each turn you smash two rocks together: if they weigh the same, both break; otherwise the lighter one breaks and the heavier one loses that much weight. You choose the pairs. When at most one rock is left, return the smallest weight it can have (0 if none are left).',
  examples: [
    { input: 'stones = [2,7,4,1,8,1]', output: '1' },
    { input: 'stones = [31,26,33,21,40]', output: '5' },
  ],
  constraints: ['1 ≤ stones.length ≤ 30', '1 ≤ stones[i] ≤ 100'],
  hints: [
    'Play with a small example. In the end, every rock was either added or subtracted.',
    'So the last weight is `|A - B|` where `A` and `B` are the sums of two groups.',
    'To make that small, make one group as close to `total / 2` as possible without going over.',
    'Subset-sum: find the largest reachable `s ≤ total / 2`. The answer is `total - 2 × s`.',
  ],
  approaches: [
    {
      name: 'Try every grouping',
      idea: 'Give each rock a `+` or `-` and take the smallest absolute total. `2^n` choices.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Subset sum up to half',
      idea: 'Smashing is secretly splitting the rocks into two teams and subtracting their weights. Find which sums one team can reach (each rock used once, so loop backwards), take the biggest one that is at most half, and the leftover is the difference.',
      pseudo: `function lastStoneWeightII(stones):
    total ← sum of stones
    half ← floor(total / 2)
    can ← array of half + 1 values, all false
    can[0] ← true
    for each x in stones:
        for s from half down to x:
            if can[s - x]:
                can[s] ← true
    for s from half down to 0:
        if can[s]:
            return total - 2 × s`,
      code: `function lastStoneWeightII(stones) {
  const total = stones.reduce((a, b) => a + b, 0);
  const half = Math.floor(total / 2);
  const can = new Array(half + 1).fill(false);
  can[0] = true;
  for (const x of stones) {
    for (let s = half; s >= x; s--) {
      if (can[s - x]) can[s] = true;
    }
  }
  for (let s = half; s >= 0; s--) {
    if (can[s]) return total - 2 * s;
  }
  return total;
}`,
      time: 'O(n × total)',
      space: 'O(total)',
    },
  ],
  fn: 'lastStoneWeightII',
  starter: `function lastStoneWeightII(stones) {
  // smallest possible weight of the last rock (0 if none)
  return 0;
}`,
  solution: `function lastStoneWeightII(stones) {
  const total = stones.reduce((a, b) => a + b, 0);
  const half = Math.floor(total / 2);
  const can = new Array(half + 1).fill(false);
  can[0] = true;
  for (const x of stones) {
    for (let s = half; s >= x; s--) {
      if (can[s - x]) can[s] = true;
    }
  }
  for (let s = half; s >= 0; s--) {
    if (can[s]) return total - 2 * s;
  }
  return total;
}`,
  tests: [
    { name: 'six rocks', args: [[2, 7, 4, 1, 8, 1]], expected: 1 },
    { name: 'five big rocks', args: [[31, 26, 33, 21, 40]], expected: 5 },
    { name: 'one rock', args: [[1]], expected: 1 },
    { name: 'two equal', args: [[1, 1]], expected: 0 },
    { name: 'two different', args: [[3, 8]], expected: 5 },
    { name: 'perfect split', args: [[1, 2, 3, 4]], expected: 0 },
    { name: 'three equal', args: [[10, 10, 10]], expected: 10 },
  ],
  takeaway: 'When a process ends with "some added, some subtracted", look for a split into two groups.',
};

export const knapsackProblems: Problem[] = [backpack, partition, targetSum, lastStone];
