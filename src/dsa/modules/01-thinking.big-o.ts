import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'big-o',
  title: 'Big-O by counting steps',
  summary: 'Measure an idea by counting its steps, then cut the steps with "best so far".',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The stock app question',
      text: 'Your stock app shows last week\'s prices for one share. You wonder: "If I had bought on the best day and sold on a later, better day, how much would I have made?" The app has years of prices, so your answer has to be fast, not just correct.',
    },
    {
      kind: 'text',
      text: 'Prices, one per day: `[7, 1, 5, 3, 6, 4]`. Buy on one day, sell on a **later** day. The best is buy at `1` (day 1), sell at `6` (day 4): profit `5`. If prices only fall, you skip the trade and the profit is `0`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every pair of days',
      code: `function maxProfit(prices):
    best ← 0
    for buy from 0 to n - 1:
        for sell from buy + 1 to n - 1:
            best ← max(best, prices[sell] - prices[buy])
    return best`,
    },
    {
      kind: 'text',
      text: 'It works. But how fast is it? Do not time it with a stopwatch: computers differ. **Count the steps** instead. With `n` days, the first buy day tries `n - 1` sell days, the next tries `n - 2`, and so on. That adds up to about `n × n / 2` pairs.',
    },
    {
      kind: 'table',
      title: 'Steps as the input grows',
      head: ['Days (n)', 'Brute force (all pairs)', 'One pass (later in this lesson)'],
      rows: [
        ['6', '15', '6'],
        ['1,000', '~500,000', '1,000'],
        ['100,000', '~5,000,000,000', '100,000'],
      ],
    },
    {
      kind: 'text',
      text: 'A computer does roughly **10⁸ simple steps per second**. So 100,000 days of prices takes the brute force about 50 seconds. **Big-O** is the name for how the step count grows when `n` grows. Keep only the biggest term and drop the constant: `n × n / 2` becomes **O(n²)**, read "order n squared".',
    },
    {
      kind: 'list',
      items: [
        '**Loops one after another add up**: two separate loops over `n` is `n + n` steps, which is still **O(n)**.',
        '**A loop inside a loop multiplies**: `n` times `n` is **O(n²)**.',
        '**Drop constants and small terms**: `3n + 5` is O(n); `n² + n` is O(n²).',
        '**Space** is the extra memory you create (new arrays, maps), not the input itself. A few variables is **O(1)**, "constant".',
      ],
    },
    {
      kind: 'text',
      text: '**Spot the waste.** When the brute force looks at selling on day 4, it checks every earlier buy day: 7, 1, 5, 3. But only one of them can ever win: the **cheapest** one. The other comparisons are thrown away every time.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Remember the best so far',
      text: 'Walk the days once. Keep one number: the cheapest price seen so far. On each day, "sell today" profit is `today - cheapest`. That one remembered number replaces the whole inner loop.',
    },
    {
      kind: 'steps',
      title: 'One pass over [7, 1, 5, 3, 6, 4]',
      frames: [
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 0 },
          active: [0],
          vars: { cheapest: 7, 'sell today': 0, best: 0 },
          note: 'Day 0: the cheapest price so far is 7. Selling today earns 0.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { cheapest: 1, 'sell today': 0, best: 0 },
          note: 'Day 1: 1 is cheaper than 7, so it becomes the new cheapest.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 2 },
          active: [1, 2],
          done: [0],
          vars: { cheapest: 1, 'sell today': 4, best: 4 },
          note: 'Day 2: selling at 5 after buying at 1 earns 4. New best.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 3 },
          active: [1, 3],
          done: [0, 2],
          vars: { cheapest: 1, 'sell today': 2, best: 4 },
          note: 'Day 3: selling at 3 earns only 2. Best stays 4.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 4 },
          active: [1, 4],
          done: [0, 2, 3],
          vars: { cheapest: 1, 'sell today': 5, best: 5 },
          note: 'Day 4: selling at 6 earns 5. New best.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: { i: 5 },
          found: [1, 4],
          done: [0, 2, 3, 5],
          vars: { cheapest: 1, 'sell today': 3, best: 5 },
          note: 'Day 5: selling at 4 earns 3. Done after 6 steps: buy at 1, sell at 6, profit 5.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'One pass',
      code: `function maxProfit(prices):
    cheapest ← infinity
    best ← 0
    for each price in prices:
        cheapest ← min(cheapest, price)
        best ← max(best, price - cheapest)
    return best`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const price of prices) {
    cheapest = Math.min(cheapest, price);
    best = Math.max(best, price - cheapest);
  }
  return best;
}`,
    },
    {
      kind: 'compare',
      title: 'Best time to buy and sell',
      rows: [
        { approach: 'Try every pair', time: 'O(n²)', space: 'O(1)', note: 'Correct, but ~5·10⁹ steps for 10⁵ days.' },
        { approach: 'Cheapest so far (one pass)', time: 'O(n)', space: 'O(1)', note: 'Each day is looked at once. You cannot beat this: you must read every price.' },
      ],
    },
    {
      kind: 'table',
      title: 'The Big-O ladder (n = 100,000)',
      head: ['Big-O', 'In plain words', 'Looks like', 'Steps'],
      rows: [
        ['O(1)', 'constant', 'read `arr[i]`', '1'],
        ['O(log n)', 'halve each time', 'binary search (module 5)', '~17'],
        ['O(n)', 'one look per item', 'one loop', '10⁵'],
        ['O(n log n)', 'sorting', '`arr.sort((a, b) => a - b)`', '~1.7·10⁶'],
        ['O(n²)', 'every pair', 'loop inside a loop', '10¹⁰ (too slow)'],
        ['O(2ⁿ)', 'every subset', 'backtracking (module 9)', 'hopeless'],
      ],
    },
    {
      kind: 'text',
      text: '**The pattern: best so far.** Reach for it when the answer is a pair `i < j` and, for a fixed right end `j`, only the best left end matters (the cheapest, the biggest, the smallest so far). Carry that best value forward instead of looping back.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: best so far',
      code: `bestLeft ← value for index 0
answer ← worst possible
for j from 1 to n - 1:
    answer ← better of (answer, combine(bestLeft, item j))
    bestLeft ← better of (bestLeft, item j)
return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Hidden loops',
      text: 'One `for` loop is not always O(n). `arr.includes(x)`, `arr.indexOf(x)`, `arr.slice()`, `[...arr]` and `arr.shift()` each walk the whole array. Put one inside a loop and you are back to **O(n²)** without seeing a second `for`.',
    },
  ],
  problems: [
    {
      id: 'thinking-best-stock',
      title: 'Best Time to Buy and Sell Stock',
      difficulty: 'easy',
      leetcode: 121,
      pattern: 'Best so far',
      statement:
        'You get `prices`, the price of one share on each day. Choose one day to buy and a **later** day to sell. Return the biggest profit you can make. If no trade makes money, return `0`.',
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5', explain: 'Buy at 1, sell at 6.' },
        { input: 'prices = [7,6,4,3,1]', output: '0', explain: 'Prices only fall, so do not trade.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁴'],
      hints: [
        'Pretend you must sell on day `j`. Which buy day would you pick?',
        'Only the cheapest price before day `j` matters for selling on day `j`.',
        'Walk once. Keep `cheapest` so far and `best` profit so far. Update `cheapest` first, then `best = max(best, price - cheapest)`.',
      ],
      approaches: [
        {
          name: 'Try every pair',
          idea: 'Check every buy day with every later sell day and keep the biggest difference. It is correct because it tries every legal trade.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Cheapest so far',
          idea: 'For a fixed sell day, the best buy day is the cheapest one before it. So remember the cheapest price while walking, and compare "sell today" with the best profit seen.',
          pseudo: `function maxProfit(prices):
    cheapest ← infinity
    best ← 0
    for each price in prices:
        cheapest ← min(cheapest, price)
        best ← max(best, price - cheapest)
    return best`,
          code: `function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const price of prices) {
    cheapest = Math.min(cheapest, price);
    best = Math.max(best, price - cheapest);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxProfit',
      starter: `function maxProfit(prices) {
  // return the best profit from one buy and one later sell
  return 0;
}`,
      solution: `function maxProfit(prices) {
  let cheapest = Infinity;
  let best = 0;
  for (const price of prices) {
    cheapest = Math.min(cheapest, price);
    best = Math.max(best, price - cheapest);
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[7, 1, 5, 3, 6, 4]], expected: 5 },
        { name: 'prices only fall', args: [[7, 6, 4, 3, 1]], expected: 0 },
        { name: 'one day', args: [[5]], expected: 0 },
        { name: 'cheapest day comes last', args: [[2, 4, 1]], expected: 2 },
        { name: 'all the same', args: [[3, 3, 3]], expected: 0 },
        { name: 'two days up', args: [[1, 2]], expected: 1 },
        { name: 'new low then recovery', args: [[3, 2, 6, 5, 0, 3]], expected: 4 },
        { name: 'zigzag', args: [[2, 1, 2, 1, 0, 1, 2]], expected: 2 },
      ],
      takeaway: 'When only the best earlier value matters, carry it forward instead of looping back.',
    },
    {
      id: 'thinking-running-sum',
      title: 'Running Sum',
      difficulty: 'easy',
      leetcode: 1480,
      pattern: 'Best so far',
      statement:
        'A step counter app logs your steps for each day in `nums`. Return a new array where position `i` holds your **total steps from day 0 to day i**.',
      examples: [
        { input: 'nums = [1,2,3,4]', output: '[1,3,6,10]', explain: '1, then 1+2, then 1+2+3, then 1+2+3+4.' },
        { input: 'nums = [3,1,2,10,1]', output: '[3,4,6,16,17]' },
      ],
      constraints: ['1 ≤ n ≤ 1000', '-10⁶ ≤ nums[i] ≤ 10⁶'],
      hints: [
        'The brute force re-adds everything from day 0 for each day. What did you already add up on the previous day?',
        'Total up to day `i` = total up to day `i - 1` + `nums[i]`.',
        'Keep one running `total`. Add each number to it and push the total into the output.',
      ],
      approaches: [
        {
          name: 'Re-add every prefix',
          idea: 'For each day, loop from day 0 to that day and add. Correct, but day `i` repeats all the additions of day `i - 1`.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Carry the total',
          idea: 'Yesterday\'s total already holds the sum of every earlier day, so today\'s total is one addition away. Each number is added exactly once.',
          pseudo: `function runningSum(nums):
    out ← empty list
    total ← 0
    for each x in nums:
        total ← total + x
        append total to out
    return out`,
          code: `function runningSum(nums) {
  const out = [];
  let total = 0;
  for (const x of nums) {
    total += x;
    out.push(total);
  }
  return out;
}`,
          time: 'O(n)',
          space: 'O(n) for the output',
        },
      ],
      fn: 'runningSum',
      starter: `function runningSum(nums) {
  // return the total so far at every index
  return [];
}`,
      solution: `function runningSum(nums) {
  const out = [];
  let total = 0;
  for (const x of nums) {
    total += x;
    out.push(total);
  }
  return out;
}`,
      tests: [
        { name: 'example', args: [[1, 2, 3, 4]], expected: [1, 3, 6, 10] },
        { name: 'all ones', args: [[1, 1, 1, 1, 1]], expected: [1, 2, 3, 4, 5] },
        { name: 'mixed', args: [[3, 1, 2, 10, 1]], expected: [3, 4, 6, 16, 17] },
        { name: 'one item', args: [[5]], expected: [5] },
        { name: 'negatives', args: [[-1, 2, -3]], expected: [-1, 1, -2] },
        { name: 'zeros', args: [[0, 0, 0]], expected: [0, 0, 0] },
      ],
      takeaway: 'If step i redoes step i - 1 plus a little, keep step i - 1\'s result. (Module 2 turns this into prefix sums.)',
    },
    {
      id: 'thinking-best-sightseeing-pair',
      title: 'Best Sightseeing Pair',
      difficulty: 'medium',
      leetcode: 1014,
      pattern: 'Best so far',
      statement:
        'A highway has viewpoints at kilometre `0, 1, 2, …`. Viewpoint `i` has a beauty score `values[i]`. You visit two viewpoints `i < j`. Your trip score is `values[i] + values[j]` minus the drive between them, `j - i`. Return the best trip score.',
      examples: [
        { input: 'values = [8,1,5,2,6]', output: '11', explain: 'i = 0, j = 2: 8 + 5 - 2 = 11.' },
        { input: 'values = [1,2]', output: '2', explain: '1 + 2 - 1 = 2.' },
      ],
      constraints: ['2 ≤ n ≤ 5·10⁴', '1 ≤ values[i] ≤ 1000'],
      hints: [
        'n can be 5·10⁴, so all pairs (about 1.25·10⁹) is too slow. Aim for one pass.',
        'Regroup the score: `(values[i] + i) + (values[j] - j)`. The first part only depends on `i`, the second only on `j`.',
        'For a fixed `j`, you want the biggest `values[i] + i` with `i < j`. Carry it forward, like the cheapest price in the stock problem.',
        'At each `j`: answer = max(answer, bestLeft + values[j] - j), then bestLeft = max(bestLeft, values[j] + j).',
      ],
      approaches: [
        {
          name: 'Try every pair',
          idea: 'Score every pair `i < j` and keep the best. Correct, but about n²/2 pairs.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Best left part so far',
          idea: 'Split the score into a part that belongs to `i` (`values[i] + i`) and a part that belongs to `j` (`values[j] - j`). For each `j`, only the biggest left part seen so far can win, so one remembered number replaces the inner loop.',
          pseudo: `function maxScoreSightseeingPair(values):
    bestLeft ← values[0] + 0
    best ← -infinity
    for j from 1 to n - 1:
        best ← max(best, bestLeft + values[j] - j)
        bestLeft ← max(bestLeft, values[j] + j)
    return best`,
          code: `function maxScoreSightseeingPair(values) {
  let bestLeft = values[0];
  let best = -Infinity;
  for (let j = 1; j < values.length; j++) {
    best = Math.max(best, bestLeft + values[j] - j);
    bestLeft = Math.max(bestLeft, values[j] + j);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxScoreSightseeingPair',
      starter: `function maxScoreSightseeingPair(values) {
  // return the best values[i] + values[j] + i - j with i < j
  return 0;
}`,
      solution: `function maxScoreSightseeingPair(values) {
  let bestLeft = values[0];
  let best = -Infinity;
  for (let j = 1; j < values.length; j++) {
    best = Math.max(best, bestLeft + values[j] - j);
    bestLeft = Math.max(bestLeft, values[j] + j);
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[8, 1, 5, 2, 6]], expected: 11 },
        { name: 'two viewpoints', args: [[1, 2]], expected: 2 },
        { name: 'neighbours win', args: [[1, 3, 5]], expected: 7 },
        { name: 'all the same', args: [[5, 5, 5, 5]], expected: 9 },
        { name: 'far apart still wins', args: [[10, 1, 1, 1, 1, 10]], expected: 15 },
        { name: 'two ones', args: [[1, 1]], expected: 1 },
        { name: 'two peaks far apart', args: [[2, 9, 1, 1, 9]], expected: 15 },
        { name: 'distance hurts the big pair', args: [[7, 1, 1, 1, 1, 1, 1, 1, 8]], expected: 8 },
      ],
      takeaway: 'Rewrite a pair score so each half depends on one index; then "best so far" works.',
    },
  ],
  quiz: [
    {
      prompt: 'One loop walks `n` items. After it finishes, a second, separate loop walks the same `n` items. What is the Big-O?',
      options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
      answer: 1,
      explanation: 'Loops one after another add: `n + n = 2n`. Drop the constant and you get O(n).',
    },
    {
      prompt: 'Inside a loop over `n` items you call `arr.includes(x)` on an array of `n` items. What is the Big-O?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      answer: 2,
      explanation: '`includes` walks the array, so it is a hidden loop inside your loop: `n × n`.',
    },
    {
      prompt: 'Prices are `[9, 2, 8, 1, 3]`. What does the one-pass answer return?',
      options: ['2', '6', '7', '8'],
      answer: 1,
      explanation: 'Buy at 2, sell at 8 for 6. The later low of 1 only allows selling at 3, which earns 2.',
    },
  ],
  takeaways: [
    'Measure an idea by counting steps as `n` grows, not with a stopwatch.',
    'Nested loops multiply, loops in a row add; drop constants and small terms.',
    'If an inner loop only hunts for the best earlier value, carry that value forward instead.',
  ],
};

export default lesson;
