import type { Lesson } from '../types';
import { stateMachineProblems } from './17-dp-2d.state-machines-problems';

export const lesson: Lesson = {
  id: 'state-machines',
  title: 'State machines: a few modes per day',
  summary: 'When a rule depends on what you did before, the state is (day, mode). Draw the modes as a diagram.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'A trading app with a waiting rule',
      text: 'Some trading apps make you wait after you sell before you can buy again, while the money settles. So what you are allowed to do today depends on what you did **yesterday**. Traffic lights, vending machines and game characters (standing / jumping / falling) work the same way: a small set of **modes** and rules for moving between them.',
    },
    {
      kind: 'text',
      text: 'The problem: stock prices for 5 days are `[1, 2, 3, 0, 2]`. You may buy and sell as often as you like, own **at most one share**, and after a sale you must skip **one day** before buying again. Most profit? Buy at 1, sell at 2, wait a day, buy at 0, sell at 2: **3**.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Why not greedy?',
      text: 'Without the cooldown (Stock II, LeetCode 122, in module 15) you just add up every price rise. Here, greedy sells at 2 and again at 3, but selling at 2 forces you to skip day 2, and that clashes with the next trade. You need to compare whole plans, and that is DP.',
    },
    {
      kind: 'text',
      text: 'To decide what to do on a day, the day number alone is not enough. You also need to know your **mode** at the end of that day: **held** (you own a share), **sold** (you sold today, so tomorrow is a cooldown) or **rest** (you own nothing and are free to buy tomorrow). So the state is two things: `(day, mode)`. The second index is tiny, just 3 values.',
    },
    {
      kind: 'diagram',
      title: 'The three modes and the moves between them',
      art: `           buy: - price
    ┌──────────────────────────┐
    │                          ▼
 ┌──────┐                  ┌──────┐
 │ REST │ ◄─┐              │ HELD │ ◄─┐
 └──────┘ ──┘ wait         └──────┘ ──┘ keep
    ▲                          │
    │ next day                 │ sell: + price
    │ (cooldown over)          ▼
    │                      ┌──────┐
    └───────────────────── │ SOLD │
                           └──────┘
  No arrow SOLD → HELD: that is the cooldown.`,
      caption: 'Every arrow becomes one option in a `max`. Count the arrows **into** each box: HELD has 2 (keep, buy), SOLD has 1 (sell), REST has 2 (wait, cooldown over).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: recursion with (day, mode)',
      code: `// best(d, mode) = most money you can have at the end of day d in that mode
function best(d, mode):
    if d = 0:
        if mode = held: return -prices[0]
        if mode = sold: return -∞            // nothing to sell yet
        return 0                              // rest
    p ← prices[d]
    if mode = held:
        return max(best(d - 1, held), best(d - 1, rest) - p)
    if mode = sold:
        return best(d - 1, held) + p
    return max(best(d - 1, rest), best(d - 1, sold))       // rest

answer ← max(best(n - 1, sold), best(n - 1, rest))`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** `best(d, held)` and `best(d, rest)` both call `best(d - 1, rest)`, and so on down the days, so the calls multiply. But there are only `n × 3` different `(day, mode)` pairs. A memo keyed by `"d,mode"` solves each once. Better still: day `d` only needs day `d - 1`, so keep just **three numbers** and update them each day.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Each day is a row, each mode is a column',
      text: 'Think of a table with one row per day and one column per mode. The arrows in the diagram tell you which cells of yesterday\'s row feed each cell of today\'s row. Because only yesterday matters, the whole table shrinks to three variables.',
    },
    {
      kind: 'table',
      title: 'The DP recipe for this problem',
      head: ['Part', 'For this problem'],
      rows: [
        ['State', '`held[d]`, `sold[d]`, `rest[d]` = most money at the end of day `d` in that mode'],
        ['Choice', 'The arrows: keep or buy (held), sell (sold), wait or finish cooldown (rest)'],
        ['Recurrence', '`held = max(held, rest - p)`, `sold = held + p`, `rest = max(rest, sold)`, from yesterday'],
        ['Base case', 'Day 0: `held = -prices[0]`, `sold = -∞`, `rest = 0`'],
        ['Answer', '`max(sold, rest)` on the last day (ending while holding is never best)'],
      ],
    },
    {
      kind: 'trace',
      title: 'Day by day for prices [1, 2, 3, 0, 2]',
      columns: ['day', 'price', 'held = max(held, rest - p)', 'sold = held + p', 'rest = max(rest, sold)'],
      rows: [
        [0, 1, '-1 (buy)', '-∞', 0],
        [1, 2, 'max(-1, 0 - 2) = -1', '-1 + 2 = 1', 'max(0, -∞) = 0'],
        [2, 3, 'max(-1, 0 - 3) = -1', '-1 + 3 = 2', 'max(0, 1) = 1'],
        [3, 0, 'max(-1, 1 - 0) = 1', '-1 + 0 = -1', 'max(1, 2) = 2'],
        [4, 2, 'max(1, 2 - 2) = 1', '1 + 2 = 3', 'max(2, -1) = 2'],
      ],
      note: 'Every formula uses **yesterday\'s** row. Answer: `max(sold 3, rest 2)` = **3**. Day 3\'s `held = 1` is "sold on day 1, cooled down on day 2, bought at 0 on day 3".',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Three numbers instead of a table',
      code: `function maxProfit(prices):
    held ← -prices[0], sold ← -∞, rest ← 0
    for d from 1 to n - 1:
        p ← prices[d]
        newHeld ← max(held, rest - p)
        newSold ← held + p
        newRest ← max(rest, sold)
        held ← newHeld, sold ← newSold, rest ← newRest
    return max(sold, rest)`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'In JavaScript (update all three at once)',
      code: `function maxProfit(prices) {
  let held = -prices[0], sold = -Infinity, rest = 0;
  for (let d = 1; d < prices.length; d++) {
    const p = prices[d];
    // the right side is computed first, from yesterday's values
    [held, sold, rest] = [Math.max(held, rest - p), held + p, Math.max(rest, sold)];
  }
  return Math.max(sold, rest);
}`,
    },
    {
      kind: 'text',
      text: '**Change the rules, change the diagram.** With a **fee** per sale instead of a cooldown (LeetCode 714), you need only two modes, *hold* and *free*: `hold = max(hold, free - p)` and `free = max(free, hold + p - fee)`. With **at most two trades** (LeetCode 123), you need a chain of four: `buy1 → sell1 → buy2 → sell2`. The method never changes: list the modes, draw the arrows, write one `max` per mode.',
    },
    {
      kind: 'compare',
      title: 'Stock with cooldown',
      rows: [
        { approach: 'Try every action sequence', time: 'O(2^n)', space: 'O(n)', note: 'Wait, buy or sell every day.' },
        { approach: 'Memo keyed by "d,mode"', time: 'O(n)', space: 'O(n)', note: '3n states, each solved once.' },
        { approach: 'Table n × 3', time: 'O(n)', space: 'O(n)', note: 'Rows are days, columns are modes.' },
        { approach: 'Three variables', time: 'O(n)', space: 'O(1)', note: 'Each day only needs yesterday.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Updating one variable too early',
      text: 'If you write the three updates as three plain lines, `rest = max(rest, sold)` reads the `sold` you **just** computed for today. That means "sold today and already rested today", so you can buy again tomorrow and the cooldown is gone. On `[1, 2, 3, 0, 2]` this bug returns 4 instead of 3. Compute every new value from the old ones first (temp variables, or one destructuring assignment). Also start impossible modes at `-Infinity`, not 0, or you "sell" a share you never bought.',
    },
    {
      kind: 'table',
      title: 'How to pick the DP state (all of DP in one table)',
      head: ['The problem looks like...', 'State', 'Examples'],
      rows: [
        ['One list, decide item by item', '`dp[i]` = answer for the first `i` items', 'House robber, coin change, LIS (module 16)'],
        ['Moving on a grid', '`dp[r][c]` = answer for cell `(r, c)`', 'Unique paths, minimum path sum'],
        ['Two strings or lists', '`dp[i][j]` = answer for two prefixes', 'LCS, edit distance, interleaving'],
        ['Pick items under a limit, each once', '`dp[i][cap]`, one row looped backwards', 'Backpack, partition, target sum'],
        ['Pieces of one string', '`dp[i][j]` = answer for `s[i..j]`', 'Palindromes'],
        ['Days with modes and rules', '`dp[day][mode]`', 'Stock with cooldown or fee'],
      ],
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The one question that finds the state',
      text: 'Ask: **"To decide the rest of the problem, what do I need to know about what already happened?"** Write the brute-force recursion with exactly those things as arguments. Those arguments are your state, the number of different values they can take is your table size, and the cases inside the function are your recurrence.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: state machine DP template',
      code: `// Signals: days / steps in order, and a rule that depends on
// what you did before (holding, cooldown, fee, trades left).
list the modes; draw arrows between them
start ← value of each mode before day 0 (impossible = -∞)
for each step:
    for each mode m:
        new[m] ← best over arrows (old[from] + gain of that arrow)
    old ← new                       // update all modes together
return best over the allowed final modes`,
    },
  ],
  problems: stateMachineProblems,
  quiz: [
    {
      prompt: 'Why can\'t `sold` go straight to `held` the next day in the cooldown problem?',
      options: [
        'Because prices only go up',
        'Because after selling you must wait one day, so `held` only comes from `held` or `rest`',
        'Because `sold` is always negative',
        'Because you can own two shares',
      ],
      answer: 1,
      explanation: 'The missing arrow **is** the cooldown rule. Buying is only allowed from `rest`.',
    },
    {
      prompt: 'You compute today\'s `sold` first, then `rest = max(rest, sold)` using that new `sold`. What goes wrong?',
      options: [
        'Nothing',
        'You can sell today and buy tomorrow, so the cooldown is skipped and the answer can be too big',
        'The code becomes slower',
        'It returns negative numbers only',
      ],
      answer: 1,
      explanation: 'Every mode for today must be computed from **yesterday\'s** values. Compute them all first, then assign.',
    },
    {
      prompt: 'A problem says "at most k trades". What happens to the state?',
      options: [
        'Nothing changes',
        'You add more modes: one "holding" and one "sold" mode per trade number',
        'You need a 3D table of prices',
        'It becomes a knapsack',
      ],
      answer: 1,
      explanation: 'The state must remember how many trades are used, so the chain of modes gets longer: `2k` modes.',
    },
  ],
  takeaways: [
    'If what you may do now depends on what you did before, add a **mode** to the state: `dp[day][mode]`.',
    'Draw the modes as boxes and the moves as arrows. Each arrow is one option inside a `max`.',
    'To find any DP state, ask what you must know about the past to finish the problem. Those are the recursion\'s arguments.',
  ],
};
