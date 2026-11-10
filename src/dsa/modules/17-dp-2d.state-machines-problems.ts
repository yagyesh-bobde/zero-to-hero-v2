import type { Problem } from '../types';

const cooldown: Problem = {
  id: 'dp-2d-stock-cooldown',
  title: 'Best Time to Buy and Sell Stock with Cooldown',
  difficulty: 'medium',
  leetcode: 309,
  pattern: 'State machine DP',
  statement:
    'You know a stock\'s price for each of the next days. You can buy and sell as many times as you like, but you can hold **at most one share** at a time, and after you sell you must wait **one full day** before buying again (a cooldown). Return the most profit you can make.',
  examples: [
    { input: 'prices = [1,2,3,0,2]', output: '3', explain: 'Buy at 1, sell at 2, cool down, buy at 0, sell at 2: 1 + 2 = 3.' },
    { input: 'prices = [1]', output: '0' },
  ],
  constraints: ['1 ≤ prices.length ≤ 5000', '0 ≤ prices[i] ≤ 1000'],
  hints: [
    'Knowing the day is not enough to decide. You also need to know: do you own a share, and did you just sell?',
    'Use three states for the end of each day: **held** (own a share), **sold** (sold today), **rest** (own nothing, free to buy tomorrow).',
    '`held = max(held, rest - price)`, `sold = held + price`, `rest = max(rest, sold)`, all using **yesterday\'s** values.',
    'Start with `held = -prices[0]`, `sold = -∞`, `rest = 0`. Answer: `max(sold, rest)`.',
  ],
  approaches: [
    {
      name: 'Try every action',
      idea: 'Each day, try every allowed move (wait, buy, sell) and recurse. The number of action sequences grows exponentially.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Three states per day',
      idea: 'At the end of each day you are in exactly one of three states. Each state can only be reached from a few states of the day before (the arrows of the state diagram), so three numbers per day are enough, and only yesterday\'s three are needed.',
      pseudo: `function maxProfit(prices):
    held ← -prices[0]        // bought on day 0
    sold ← -∞                // cannot have sold on day 0
    rest ← 0                 // did nothing
    for d from 1 to n - 1:
        p ← prices[d]
        newHeld ← max(held, rest - p)    // keep holding, or buy today
        newSold ← held + p                // sell today
        newRest ← max(rest, sold)         // keep waiting, or cooldown ends
        held ← newHeld, sold ← newSold, rest ← newRest
    return max(sold, rest)`,
      code: `function maxProfit(prices) {
  let held = -prices[0], sold = -Infinity, rest = 0;
  for (let d = 1; d < prices.length; d++) {
    const p = prices[d];
    [held, sold, rest] = [Math.max(held, rest - p), held + p, Math.max(rest, sold)];
  }
  return Math.max(sold, rest);
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxProfit',
  starter: `function maxProfit(prices) {
  // most profit with a one-day cooldown after each sale
  return 0;
}`,
  solution: `function maxProfit(prices) {
  let held = -prices[0], sold = -Infinity, rest = 0;
  for (let d = 1; d < prices.length; d++) {
    const p = prices[d];
    [held, sold, rest] = [Math.max(held, rest - p), held + p, Math.max(rest, sold)];
  }
  return Math.max(sold, rest);
}`,
  tests: [
    { name: 'lesson example', args: [[1, 2, 3, 0, 2]], expected: 3 },
    { name: 'one day', args: [[1]], expected: 0 },
    { name: 'two days up', args: [[1, 2]], expected: 1 },
    { name: 'two days down', args: [[2, 1]], expected: 0 },
    { name: 'steady climb', args: [[1, 2, 4]], expected: 3 },
    { name: 'peak in the middle', args: [[1, 4, 2]], expected: 3 },
    { name: 'dip then climb', args: [[6, 1, 3, 2, 4, 7]], expected: 6 },
    { name: 'eight days', args: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 6 },
    { name: 'cooldown costs a trade', args: [[1, 2, 3, 0, 2, 5, 1, 6]], expected: 8 },
  ],
  takeaway: 'If a rule depends on what you did yesterday, put that in the state: `dp[day][mode]`.',
};

const fee: Problem = {
  id: 'dp-2d-stock-fee',
  title: 'Best Time to Buy and Sell Stock with Transaction Fee',
  difficulty: 'medium',
  leetcode: 714,
  pattern: 'State machine DP',
  statement:
    'Same stock game: buy and sell as often as you like, at most one share at a time. No cooldown this time, but your broker charges a `fee` every time you **sell**. Return the most profit.',
  examples: [
    { input: 'prices = [1,3,2,8,4,9], fee = 2', output: '8', explain: 'Buy 1 sell 8 (7 - 2 = 5), buy 4 sell 9 (5 - 2 = 3). Total 8.' },
    { input: 'prices = [1,3,7,5,10,3], fee = 3', output: '6' },
  ],
  constraints: ['1 ≤ prices.length ≤ 5 × 10⁴', '0 ≤ fee, prices[i] ≤ 5 × 10⁴'],
  hints: [
    'Two states are enough: you **hold** a share, or you are **free** (hold nothing).',
    '`hold = max(hold, free - price)`, `free = max(free, hold + price - fee)`.',
    'Many small trades now lose money to fees, so greedy "take every rise" does not work. The DP decides for you.',
  ],
  approaches: [
    {
      name: 'Try every action',
      idea: 'Recursively try wait / buy / sell each day. Exponential.',
      time: 'O(2^n)',
      space: 'O(n)',
    },
    {
      name: 'Two states per day',
      idea: 'At the end of a day you either own a share or not. Owning comes from owning yesterday or buying today. Not owning comes from not owning yesterday or selling today (paying the fee).',
      pseudo: `function maxProfit(prices, fee):
    hold ← -prices[0]
    free ← 0
    for d from 1 to n - 1:
        p ← prices[d]
        newHold ← max(hold, free - p)          // keep, or buy today
        newFree ← max(free, hold + p - fee)    // keep waiting, or sell today
        hold ← newHold, free ← newFree
    return free`,
      code: `function maxProfit(prices, fee) {
  let hold = -prices[0], free = 0;
  for (let d = 1; d < prices.length; d++) {
    const p = prices[d];
    [hold, free] = [Math.max(hold, free - p), Math.max(free, hold + p - fee)];
  }
  return free;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxProfit',
  starter: `function maxProfit(prices, fee) {
  // most profit when every sale costs fee
  return 0;
}`,
  solution: `function maxProfit(prices, fee) {
  let hold = -prices[0], free = 0;
  for (let d = 1; d < prices.length; d++) {
    const p = prices[d];
    [hold, free] = [Math.max(hold, free - p), Math.max(free, hold + p - fee)];
  }
  return free;
}`,
  tests: [
    { name: 'two trades', args: [[1, 3, 2, 8, 4, 9], 2], expected: 8 },
    { name: 'fee 3', args: [[1, 3, 7, 5, 10, 3], 3], expected: 6 },
    { name: 'one day', args: [[1], 0], expected: 0 },
    { name: 'no fee: every rise', args: [[1, 2, 3, 4], 0], expected: 3 },
    { name: 'only falling', args: [[9, 8, 7], 1], expected: 0 },
    { name: 'fee eats the profit', args: [[1, 5], 5], expected: 0 },
    { name: 'small profit left', args: [[1, 5], 3], expected: 1 },
    { name: 'zigzag', args: [[4, 5, 2, 8, 1, 9], 1], expected: 12 },
  ],
  takeaway: 'A fee is just a number on one arrow of the state diagram. The states stay the same.',
};

const stockThree: Problem = {
  id: 'dp-2d-stock-two-trades',
  title: 'Best Time to Buy and Sell Stock III (stretch)',
  difficulty: 'hard',
  leetcode: 123,
  pattern: 'State machine DP',
  statement:
    '**Stretch problem.** You may make **at most two** complete trades (buy then sell), and you must sell before buying again. Return the most profit.',
  examples: [
    { input: 'prices = [3,3,5,0,0,3,1,4]', output: '6', explain: 'Buy 0 sell 3, then buy 1 sell 4: 3 + 3 = 6.' },
    { input: 'prices = [1,2,3,4,5]', output: '4', explain: 'One trade, buy 1 sell 5.' },
  ],
  constraints: ['1 ≤ prices.length ≤ 10⁵', '0 ≤ prices[i] ≤ 10⁵'],
  hints: [
    'The state must remember how many trades you have used. Line up the states in order: before anything, holding trade 1, after trade 1, holding trade 2, after trade 2.',
    'Four numbers: `buy1`, `sell1`, `buy2`, `sell2` = best profit so far in each state.',
    '`buy1 = max(buy1, -p)`, `sell1 = max(sell1, buy1 + p)`, `buy2 = max(buy2, sell1 - p)`, `sell2 = max(sell2, buy2 + p)`.',
    'Answer: `sell2` (doing fewer trades is allowed, since `sell2 ≥ sell1 ≥ 0`).',
  ],
  approaches: [
    {
      name: 'Split point',
      idea: 'For every day `k`, best single trade in days `0..k` plus best single trade in days `k..n-1`. With prefix and suffix arrays that is `O(n)`, but it does not grow to "at most k trades".',
      time: 'O(n)',
      space: 'O(n)',
    },
    {
      name: 'Four states in a row',
      idea: 'The states form a chain: start → holding #1 → sold #1 → holding #2 → sold #2. Each day, each state either stays or moves one step along the chain. Four running numbers do it, and the same idea scales to `k` trades with `2k` states.',
      pseudo: `function maxProfit(prices):
    buy1 ← -∞, sell1 ← 0, buy2 ← -∞, sell2 ← 0
    for each p in prices:
        buy1 ← max(buy1, -p)              // first buy
        sell1 ← max(sell1, buy1 + p)      // first sell
        buy2 ← max(buy2, sell1 - p)       // second buy uses the first profit
        sell2 ← max(sell2, buy2 + p)      // second sell
    return sell2`,
      code: `function maxProfit(prices) {
  let buy1 = -Infinity, sell1 = 0, buy2 = -Infinity, sell2 = 0;
  for (const p of prices) {
    buy1 = Math.max(buy1, -p);
    sell1 = Math.max(sell1, buy1 + p);
    buy2 = Math.max(buy2, sell1 - p);
    sell2 = Math.max(sell2, buy2 + p);
  }
  return sell2;
}`,
      time: 'O(n)',
      space: 'O(1)',
    },
  ],
  fn: 'maxProfit',
  starter: `function maxProfit(prices) {
  // most profit with at most two trades
  return 0;
}`,
  solution: `function maxProfit(prices) {
  let buy1 = -Infinity, sell1 = 0, buy2 = -Infinity, sell2 = 0;
  for (const p of prices) {
    buy1 = Math.max(buy1, -p);
    sell1 = Math.max(sell1, buy1 + p);
    buy2 = Math.max(buy2, sell1 - p);
    sell2 = Math.max(sell2, buy2 + p);
  }
  return sell2;
}`,
  tests: [
    { name: 'two trades', args: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 6 },
    { name: 'one long climb', args: [[1, 2, 3, 4, 5]], expected: 4 },
    { name: 'only falling', args: [[7, 6, 4, 3, 1]], expected: 0 },
    { name: 'one day', args: [[1]], expected: 0 },
    { name: 'pick the best two', args: [[1, 2, 4, 2, 5, 7, 2, 4, 9, 0]], expected: 13 },
    { name: 'three rises, keep two', args: [[2, 1, 4, 1, 6, 1, 8]], expected: 12 },
  ],
  takeaway: 'A limit on the number of trades becomes more states in a chain: buy1 → sell1 → buy2 → sell2.',
};

export const stateMachineProblems: Problem[] = [cooldown, fee, stockThree];
