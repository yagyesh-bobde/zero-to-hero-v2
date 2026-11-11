import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'big-o',
  title: 'Big-O by counting steps',
  summary: 'Count repeated work, then save time by remembering the cheapest price so far.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The stock app question',
      text: 'Your stock app shows the price of one share each day. You want to know how much you could have earned by buying once and selling later. Start with a few days you can check by hand.',
    },
    {
      kind: 'text',
      text: 'Prices are `[7, 1, 5, 3, 6, 4]`. Buy at `1`, then sell at `6`: you earn `6 - 1 = 5`. You cannot sell before you buy. If every possible trade loses money, do nothing and return `0`.',
    },
    {
      kind: 'text',
      text: 'The prices you give the function are its **input**. The answer it returns is its **output**. Here the input is `[7, 1, 5, 3, 6, 4]` and the output is `5`.',
    },
    {
      kind: 'text',
      text: 'An **array** is an ordered list of items, also called elements. An **index** is an item’s position, counted from `0`: `prices[1]` is `1`, the second price. Here, `n` means the number of prices, so `n = 6`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the plan before the code',
      text: '**Pseudocode** is a code-like plan that you read by hand. `best ← 0` means store `0` in `best`. `=` checks equality; JavaScript uses `===` for that. A colon and the indented lines below it show what belongs inside a loop or an `if`.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read this loop',
      text: '`for buy from 0 to n - 1` includes both ends: here, `0, 1, 2, 3, 4, 5`. If the start is past the end, skip that loop. `prices[buy]` reads the price at position `buy`. `max(a, b)` chooses the bigger value; `min(a, b)` chooses the smaller one.',
    },
    {
      kind: 'text',
      text: 'Try every allowed choice and keep the best answer. This is called **brute force**. With `[7, 1, 5]`, the trades are `7 → 1`, `7 → 5`, and `1 → 5`. Only the last makes money: `5 - 1 = 4`. In the plan below, the outer loop picks a buy day. The indented inner loop tries each later sell day for that buy day.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every allowed trade',
      code: `function maxProfit(prices):
    best ← 0
    for buy from 0 to n - 1:
        for sell from buy + 1 to n - 1:
            best ← max(best, prices[sell] - prices[buy])
    return best`,
    },
    {
      kind: 'text',
      text: 'To compare speed, count repeated work. Call one pair check a **step** here. It takes several small code operations, but we care about how often it repeats. Six prices need 15 pair checks. Doubling to 12 prices needs 66: roughly four times as many.',
    },
    {
      kind: 'table',
      title: 'More prices, much more work',
      head: ['Prices (n)', 'Check every pair', 'Read each price once'],
      rows: [
        ['6', '15 pairs', '6 visits'],
        ['1,000', '499,500 pairs', '1,000 visits'],
        ['100,000', 'about 5 billion pairs', '100,000 visits'],
      ],
    },
    {
      kind: 'text',
      text: '**Big-O** describes how work grows as the input grows. Checking all pairs has **O(n²)** time cost, read “O of n squared”. `n²` means `n × n`: at 1,000 prices, that is 1,000,000. There are about half that many pairs, but the growth is still roughly fourfold when you double the input.',
    },
    {
      kind: 'text',
      text: 'Reading each price once has **O(n)** time cost: twice as many prices means roughly twice the work. Big-O leaves out fixed multipliers. Two separate full loops do `n + n = 2 × n` visits, so they are also O(n). A loop inside another full loop does `n × n` visits, so it is O(n²).',
    },
    {
      kind: 'text',
      text: '**Complexity** describes how a cost grows with the input size. **Time complexity** describes the amount of work. Reading all n prices once takes O(n) time. Big-O gives the growth shape, not an exact number of seconds.',
    },
    {
      kind: 'text',
      text: '**Space complexity** describes extra memory, such as new arrays, beyond the input you were given. Two or three variables stay two or three variables as n grows. That is **O(1)** space, called **constant** space. O(1) time likewise means a fixed amount of work.',
    },
    {
      kind: 'text',
      text: 'Now let’s remove repeated work. If you sell at `6`, earlier prices are `7, 1, 5, 3`. You only need the cheapest, `1`. Checking the other buy prices again cannot improve that sale.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Remember the best so far',
      text: 'Read the prices once, from left to right. This is **one pass**. Keep the cheapest price seen and the best profit seen. For each new price, compare today’s possible profit with your best profit.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Starting before you have seen a price',
      text: '`infinity` (JavaScript `Infinity`) is bigger than every ordinary price. It lets the first price become the cheapest. `best` starts at `0` because you may skip trading. Updating cheapest first can compare a price with itself; that gives `0`, so it never creates a positive same-day profit.',
    },
    {
      kind: 'diagram',
      title: 'One visit per price',
      art: [
        'Start: cheapest = infinity, best = 0',
        '  |',
        '  v',
        'Any price left? -- no --> Return best',
        '  | yes',
        '  v',
        'Read next price',
        '  |',
        '  v',
        'Keep the smaller of cheapest and price',
        '  |',
        '  v',
        'Keep the bigger of best and price - cheapest',
        '  |',
        '  +--> Go back to "Any price left?"',
      ].join('\n'),
      caption: 'Each price changes two remembered numbers; earlier prices need no second visit.',
    },
    {
      kind: 'text',
      text: 'Use `[7, 1, 5, 3, 6, 4]` and watch `cheapest`, the lowest price seen, and `best`, the biggest profit seen, after each day.',
    },
    {
      kind: 'steps',
      title: 'One pass over [7, 1, 5, 3, 6, 4]',
      frames: [
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 0,
          },
          active: [0],
          vars: {
            'cheapest price (cheapest)': 7,
            'profit selling today': '7 - 7 = 0',
            'best profit (best)': 0,
          },
          note: 'The first price sets cheapest to 7, but one day alone cannot earn a profit.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 1,
          },
          active: [1],
          done: [0],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '1 - 1 = 0',
            'best profit (best)': 0,
          },
          note: 'The price 1 replaces 7 as cheapest because it gives future sales a better buy price.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 2,
          },
          active: [2],
          done: [0, 1],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '5 - 1 = 4',
            'best profit (best)': 4,
          },
          note: 'Selling at 5 after buying at 1 sets best to 4 because it beats 0.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 3,
          },
          active: [3],
          done: [0, 1, 2],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '3 - 1 = 2',
            'best profit (best)': 4,
          },
          note: 'Selling at 3 earns only 2, so best stays 4.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 4,
          },
          active: [4],
          done: [0, 1, 2, 3],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '6 - 1 = 5',
            'best profit (best)': 5,
          },
          note: 'Selling at 6 raises best to 5 because buying at 1 gives a larger profit.',
        },
        {
          cells: [7, 1, 5, 3, 6, 4],
          pointers: {
            i: 5,
          },
          active: [5],
          found: [1, 4],
          done: [0, 2, 3],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '4 - 1 = 3',
            'best profit (best)': 5,
            'best trade': 'buy at 1, sell later at 6',
          },
          note: 'Selling at 4 earns only 3, so return the best profit of 5 after six visits.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Remembering the cheapest price removed the repeated search for a buy day: six price visits found profit `5`.',
    },
    {
      kind: 'text',
      text: 'Use `[7, 6, 4, 3, 1]` and watch why a lower `cheapest` never creates a profit when every later price is lower.',
    },
    {
      kind: 'steps',
      title: 'Falling prices on [7, 6, 4, 3, 1]',
      frames: [
        {
          cells: [7, 6, 4, 3, 1],
          active: [0],
          vars: {
            'cheapest price (cheapest)': 7,
            'profit selling today': '7 - 7 = 0',
            'best profit (best)': 0,
          },
          note: 'The first price sets cheapest to 7 because no earlier price exists.',
        },
        {
          cells: [7, 6, 4, 3, 1],
          active: [1],
          done: [0],
          vars: {
            'cheapest price (cheapest)': 6,
            'profit selling today': '6 - 6 = 0',
            'best profit (best)': 0,
          },
          note: 'The price 6 becomes cheapest, but selling after buying at 7 would lose money.',
        },
        {
          cells: [7, 6, 4, 3, 1],
          active: [2],
          done: [0, 1],
          vars: {
            'cheapest price (cheapest)': 4,
            'profit selling today': '4 - 4 = 0',
            'best profit (best)': 0,
          },
          note: 'The price 4 becomes cheapest because it is below 6, while best stays 0.',
        },
        {
          cells: [7, 6, 4, 3, 1],
          active: [3],
          done: [0, 1, 2],
          vars: {
            'cheapest price (cheapest)': 3,
            'profit selling today': '3 - 3 = 0',
            'best profit (best)': 0,
          },
          note: 'The price 3 becomes cheapest, but all earlier buy prices are still higher.',
        },
        {
          cells: [7, 6, 4, 3, 1],
          active: [4],
          done: [0, 1, 2, 3],
          vars: {
            'cheapest price (cheapest)': 1,
            'profit selling today': '1 - 1 = 0',
            'best profit (best)': 0,
            answer: '0: do not trade',
          },
          note: 'The cheapest price arrives last, so there is no later sale and the answer stays 0.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'Keeping `best` at least `0` lets you skip every losing trade; even this no-profit input takes just one visit per price.',
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
      kind: 'callout',
      tone: 'tip',
      title: 'Read the comparison',
      text: '`10⁵` means 10 multiplied by itself five times: 100,000. `5·10⁹` means 5 × 1,000,000,000, or 5 billion. The `~` sign means “about”. These are work estimates, not a promise about seconds. The comparison shows time (work) and space (extra memory).',
    },
    {
      kind: 'compare',
      title: 'Best time to buy and sell',
      rows: [
        {
          approach: 'Try every pair',
          time: 'O(n²)',
          space: 'O(1)',
          note: 'Correct, but ~5·10⁹ steps for 10⁵ days.',
        },
        {
          approach: 'Cheapest so far (one pass)',
          time: 'O(n)',
          space: 'O(1)',
          note: 'Each day is looked at once. You cannot beat this: you must read every price.',
        },
      ],
    },
    {
      kind: 'text',
      text: '**Pattern: best so far.** A pattern is an idea you can reuse. Use this one when you need an earlier item and a later item, but only the best earlier value matters. `i < j` means position `i` comes before position `j`. Remember that earlier value instead of searching for it again.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: remember the best earlier value',
      code: `bestEarlier ← first item
answer ← starting answer for this problem
for j from 1 to n - 1:
    try combining bestEarlier with item j
    update answer if that choice is better
    update bestEarlier using item j
return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'A short line can hide a loop',
      text: '`arr.includes(x)` searches for `x` and may check every item. Calling it once for each item can therefore take O(n²) time. Copying a whole array with `arr.slice()` or `[...arr]` also visits every item. Count the work inside the loop, including library calls.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Read the practice panels',
      text: 'A problem’s constraints are its limits and promises. Start with its statement and worked example. Try the hints one at a time. Each approach is a way to solve it; the time and space labels describe its work and extra memory.',
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
        'You get `prices`, the price of one share each day. Buy once and sell on a later day. Return the biggest profit, or `0` if you cannot make money. For `[7, 1, 5]`, buy at 1 and sell at 5: profit `5 - 1 = 4`.',
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5', explain: 'Buy at 1, sell at 6.' },
        {
          input: 'prices = [7,6,4,3,1]',
          output: '0',
          explain: 'Prices only fall, so do not trade.',
        },
      ],
      constraints: ['The array has 1 to 100,000 prices.', 'Each price is from 0 to 10,000.'],
      hints: [
        'Try choosing a sell day first. Which of the earlier prices would be the best buy?',
        'Only the smallest earlier price matters. Can you remember it while reading left to right?',
        'Keep cheapest and best. For each price, update cheapest with min, then best with max(best, price - cheapest).',
      ],
      approaches: [
        {
          name: 'Try every pair',
          idea: 'For each buy day, check every later sell day. For `[7, 1, 5]`, check 7 → 1, 7 → 5, and 1 → 5. Keeping the biggest positive difference works because you try every allowed trade.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Cheapest so far',
          idea: 'Let’s replace the repeated search for a buy day with one remembered price. If you sell at 5 after seeing `[7, 1]`, the cheapest earlier price, 1, gives the best profit: 4. Keep that cheapest price and the best profit while you read once.',
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
      takeaway:
        'When only the best earlier value matters, carry it forward instead of looping back.',
    },
    {
      id: 'thinking-running-sum',
      title: 'Running Sum',
      difficulty: 'easy',
      leetcode: 1480,
      pattern: 'Best so far',
      statement:
        'An app records daily score changes in `nums`. Return a new array with the total so far at every position. For `[2, 3, 1]`, return `[2, 5, 6]`: first 2, then `2 + 3`, then `2 + 3 + 1`. A negative change lowers the total.',
      examples: [
        {
          input: 'nums = [1,2,3,4]',
          output: '[1,3,6,10]',
          explain: '1, then 1+2, then 1+2+3, then 1+2+3+4.',
        },
        { input: 'nums = [3,1,2,10,1]', output: '[3,4,6,16,17]' },
      ],
      constraints: [
        'The array has 1 to 1,000 numbers.',
        'Each number is from -1,000,000 to 1,000,000.',
      ],
      hints: [
        'Write the total after each item in `[2, 3, 1]`. Which additions would you repeat if you started from the beginning each time?',
        'After the first two items the total is 5. For the next item, just add 1 to that total.',
        'Start total at 0. Add each value to total, then append total to the new array. Append means add at the end; JavaScript uses push.',
      ],
      approaches: [
        {
          name: 'Add from the beginning each time',
          idea: 'For every position, add all numbers from the beginning to that position. In `[2, 3, 1]`, that means adding 2 again for every total. The answers are correct, but earlier additions keep repeating.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Carry the total',
          idea: 'Let’s reuse the previous total. In `[2, 3, 1]`, total goes 0 → 2 → 5 → 6; add each new total to the end of out with push. The returned array grows to n items, which is why the space cost here includes O(n) for the output.',
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
      takeaway:
        'When the next answer only adds one new item, keep the previous total instead of adding everything again.',
    },
    {
      id: 'thinking-best-sightseeing-pair',
      title: 'Best Sightseeing Pair',
      difficulty: 'medium',
      leetcode: 1014,
      pattern: 'Best so far',
      statement:
        'A road has viewpoints at positions `0, 1, 2, …`, one kilometre apart. Each has a score in `values`. Choose two positions `i < j`. Add their scores and subtract the distance `j - i`. Return the biggest result. For `[8, 1, 5]`, positions 0 and 2 give `8 + 5 - 2 = 11`.',
      examples: [
        { input: 'values = [8,1,5,2,6]', output: '11', explain: 'i = 0, j = 2: 8 + 5 - 2 = 11.' },
        { input: 'values = [1,2]', output: '2', explain: '1 + 2 - 1 = 2.' },
      ],
      constraints: ['The array has 2 to 50,000 scores.', 'Each score is from 1 to 1,000.'],
      hints: [
        'Try every pair on `[8, 1, 5]`. For one fixed right position, what part of the score comes from the left position?',
        'The score is `values[i] + values[j] - j + i`. Move the terms into two groups: `(values[i] + i) + (values[j] - j)`. For i = 0 and j = 2, that is `(8 + 0) + (5 - 2) = 11`.',
        'For each right position j, keep the largest earlier values[i] + i. This is like remembering the cheapest earlier stock price, but now you want the largest left part.',
        'Try the current j with bestLeft before updating bestLeft with values[j] + j. This keeps the two positions different.',
      ],
      approaches: [
        {
          name: 'Try every pair',
          idea: 'Compute the score for every pair of different positions in left-to-right order. With `[8, 1, 5]`, the scores are 8, 11, and 5, so keep 11. This tries every allowed pair but takes O(n²) time.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Best left part so far',
          idea: 'Let’s separate what comes from each position: `values[i] + values[j] - (j - i)` becomes `(values[i] + i) + (values[j] - j)`. In `[8, 1, 5]`, the best left part before j = 2 is `8 + 0 = 8`, and the right part is `5 - 2 = 3`, giving 11. Remember the largest left part; start best at -Infinity, a value below any possible score, so the first real pair replaces it.',
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
      takeaway:
        'If you can split a pair score into a left part plus a right part, remember the best earlier left part.',
    },
  ],
  quiz: [
    {
      prompt:
        'One loop walks `n` items. After it finishes, a second, separate loop walks the same `n` items. What is the Big-O?',
      options: ['O(n²)', 'O(n)', 'It needs no work', 'O(1)'],
      answer: 1,
      explanation: 'You make 2 × n visits. Doubling n doubles those visits, so the growth is O(n).',
    },
    {
      prompt:
        'Inside a loop over `n` items you call `arr.includes(x)` on an array of `n` items. What is the Big-O?',
      options: ['O(n)', 'Two visits total', 'O(n²)', 'O(1)'],
      answer: 2,
      explanation: '`includes` walks the array, so it is a hidden loop inside your loop: `n × n`.',
    },
    {
      prompt: 'Prices are `[9, 2, 8, 1, 3]`. What does the one-pass answer return?',
      options: ['2', '6', '7', '8'],
      answer: 1,
      explanation:
        'Buy at 2, sell at 8 for 6. The later low of 1 only allows selling at 3, which earns 2.',
    },
  ],
  takeaways: [
    'Use n for the input length. Big-O describes how the work grows when n grows.',
    'Separate loops add their work; repeated full loops inside each other multiply it.',
    'Remember the best earlier value when searching earlier items again would repeat work.',
  ],
};

export default lesson;
