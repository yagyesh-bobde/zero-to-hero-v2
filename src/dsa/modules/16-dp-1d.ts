import type { Module } from '../types';
import { lesson as recursionToTable } from './16-dp-1d.recursion-to-table';
import { lesson as robOrSkip } from './16-dp-1d.rob-or-skip';
import { lesson as countingWays } from './16-dp-1d.counting-ways';
import { lesson as unboundedChoices } from './16-dp-1d.unbounded-choices';
import { lesson as subsequencesLis } from './16-dp-1d.subsequences-lis';
import { lesson as kadane } from './16-dp-1d.kadane';

const mod: Module = {
  id: 'dp-1d',
  number: 16,
  part: 'optimization',
  title: 'Dynamic programming I',
  tagline: 'From recursion to memo to table: 1D states and decisions.',
  draft: false,
  intro:
    "Dynamic programming (DP) is where most people get stuck, and it is also one of the most common topics in medium interview questions. The secret is a slow, fixed routine: write the plain recursion, notice it asks the same questions again, remember the answers, then fill a table from small to big. Every lesson uses the same five-part recipe (state, choice, recurrence, base case, answer) and a filled-in table you can check by hand. After this module you can solve the classic one-row DP problems: stairs, house robber, decode ways, coin change, word break, LIS and Kadane.",
  lessons: [recursionToTable, robOrSkip, countingWays, unboundedChoices, subsequencesLis, kadane],
  patterns: [
    {
      name: 'Linear DP: take or skip',
      signals: [
        'A row of items where taking one **blocks its neighbours** (or the next few)',
        '"maximum total without two adjacent..."',
        'Each item is a yes/no decision and the best answer for a prefix depends on shorter prefixes',
      ],
      template: `dp[0] ← 0
dp[1] ← value of item 0
for i from 2 to n:
    skip ← dp[i - 1]
    take ← dp[i - 2] + value of item i - 1
    dp[i] ← max(skip, take)
return dp[n]`,
      examples: ['dp-1d-house-robber', 'dp-1d-house-robber-circle', 'dp-1d-delete-and-earn', 'dp-1d-min-cost-stairs'],
    },
    {
      name: 'Counting ways',
      signals: [
        '"How many ways / sequences / decodings..."',
        'Every answer can be split by its **last** step or last piece, and the cases never overlap',
        '"Return it modulo 1e9+7" (the count is huge)',
      ],
      template: `dp[0] ← 1                        // one way to do nothing
for x from 1 to goal:
    for each allowed last step s:
        if step s is valid at x:
            dp[x] ← dp[x] + dp[x - s]
return dp[goal]`,
      examples: ['dp-1d-climbing-stairs', 'dp-1d-broken-stairs', 'dp-1d-decode-ways', 'dp-1d-combination-sum-iv', 'dp-1d-good-strings'],
    },
    {
      name: 'Unbounded choices (coin style)',
      signals: [
        'Reach a target amount using options you may **reuse** any number of times',
        '"fewest coins / squares / pieces", "can it be split into words", "number of combinations"',
        'Greedy (biggest first) gives a wrong answer on a small example',
      ],
      template: `dp ← array of target + 1 cells, all ∞
dp[0] ← 0
for a from 1 to target:
    for each option c with c ≤ a:
        dp[a] ← min(dp[a], dp[a - c] + 1)
return dp[target] (or -1 if ∞)
// combinations: options loop OUTSIDE, amount inside`,
      examples: ['dp-1d-coin-change', 'dp-1d-coin-change-ii', 'dp-1d-perfect-squares', 'dp-1d-word-break'],
    },
    {
      name: 'Best ending here (LIS and Kadane)',
      signals: [
        'The next choice depends on the **last** element you picked',
        '"longest increasing subsequence", "largest chain where each fits the previous"',
        '"maximum sum / product of a subarray" (unbroken run)',
      ],
      template: `// subsequence version, O(n²)
for i from 0 to n - 1:
    dp[i] ← 1
    for j from 0 to i - 1:
        if item i may follow item j:
            dp[i] ← max(dp[i], dp[j] + 1)
return max of dp
// subarray version (Kadane), O(n)
for each x after the first:
    cur ← max(x, cur + x)        // restart or extend
    best ← max(best, cur)`,
      examples: ['dp-1d-lis', 'dp-1d-number-of-lis', 'dp-1d-largest-divisible-subset', 'dp-1d-max-subarray', 'dp-1d-max-product-subarray', 'dp-1d-max-circular-subarray'],
    },
  ],
  practice: [
    { title: 'N-th Tribonacci Number', leetcode: 1137, difficulty: 'easy', hint: 'Climbing Stairs with three previous cells instead of two: keep three variables.' },
    { title: 'Solving Questions With Brainpower', leetcode: 2140, difficulty: 'medium', hint: 'Take or skip, but taking question `i` jumps you forward by `brainpower + 1`. Fill the table from the right.' },
    { title: 'Minimum Cost For Tickets', leetcode: 983, difficulty: 'medium', hint: '`dp[day]` = cheapest cost to cover all travel days up to `day`. The last ticket bought was a 1, 7 or 30-day pass.' },
    { title: 'Integer Break', leetcode: 343, difficulty: 'medium', hint: '`dp[n]` = best product for `n`. The last piece is some `j`; the rest is either kept whole (`n - j`) or broken further (`dp[n - j]`).' },
    { title: 'Arithmetic Slices', leetcode: 413, difficulty: 'medium', hint: 'Count the arithmetic slices that **end** at `i`: it is one more than the count ending at `i - 1` when the step stays the same.' },
    { title: 'Best Sightseeing Pair', leetcode: 1014, difficulty: 'medium', hint: 'Split the score into `values[i] + i` and `values[j] - j`. Keep the best first part seen so far, Kadane style.' },
    { title: 'Partition Array for Maximum Sum', leetcode: 1043, difficulty: 'medium', hint: '`dp[i]` = best sum for the first `i` items. The last group has length 1 to `k`: try each.' },
    { title: 'Longest Arithmetic Subsequence of Given Difference', leetcode: 1218, difficulty: 'medium', hint: 'LIS where "may follow" means exactly `x - difference`. A map from value to best length makes it O(n).' },
    { title: 'Wiggle Subsequence', leetcode: 376, difficulty: 'medium', hint: 'Keep two numbers: the longest wiggle ending with an up-step and the longest ending with a down-step.' },
    { title: 'Maximum Length of Subarray With Positive Product', leetcode: 1567, difficulty: 'medium', hint: 'Like the max-product trick: track the longest run ending here with a positive product and with a negative product.' },
    { title: 'Russian Doll Envelopes (stretch)', leetcode: 354, difficulty: 'hard', hint: 'Sort by width ascending and height **descending** for equal widths, then run the O(n log n) LIS on heights.' },
  ],
};

export default mod;
