import type { Module } from '../types';
import { lesson as gridDp } from './17-dp-2d.grid-dp';
import { lesson as twoStrings } from './17-dp-2d.two-strings';
import { lesson as knapsack } from './17-dp-2d.knapsack-01';
import { lesson as palindromes } from './17-dp-2d.palindromes';
import { lesson as stateMachines } from './17-dp-2d.state-machines';

const mod: Module = {
  id: "dp-2d",
  number: 17,
  part: "optimization",
  title: "Dynamic programming II",
  tagline: "Grids, two strings, knapsack: 2D states without the fear.",
  draft: false,
  intro:
    'Many real DP problems need **two** numbers to describe a sub-problem: a row and a column, a position in each of two strings, the items used and the room left, or the two ends of a substring. You will use the same recipe as module 16 (state, choice, recurrence, base case, answer), with every step shown as a filled-in table. After this module you can solve the classic mediums: unique paths, LCS, edit distance, partition and target sum, longest palindrome, and the stock problems with cooldown or fees.',
  lessons: [gridDp, twoStrings, knapsack, palindromes, stateMachines],
  patterns: [
    {
      name: 'Two-string DP',
      signals: [
        'Two strings or two arrays, and the words "common", "match", "transform", "edit" or "delete"',
        'A question about how one sequence lines up with another, in order',
        '"Can s3 be built from s1 and s2?"',
      ],
      template: `dp ← (m + 1) × (n + 1) grid
fill row 0 and column 0 (empty prefix)
for i from 1 to m:
    for j from 1 to n:
        if a[i - 1] = b[j - 1]:
            dp[i][j] ← from the diagonal dp[i - 1][j - 1]
        else:
            dp[i][j] ← best of up dp[i - 1][j], left dp[i][j - 1]
return dp[m][n]`,
      examples: ['dp-2d-lcs', 'dp-2d-edit-distance', 'dp-2d-delete-two-strings', 'dp-2d-interleaving-string'],
    },
    {
      name: '0/1 knapsack',
      signals: [
        'Pick a subset of items, each **at most once**',
        'A weight limit, a budget, or an exact target sum',
        '"Split into two groups with equal sums", "put + or - before each number"',
      ],
      template: `dp ← array of limit + 1 starting values
for each item (weight w, value v):
    for c from limit down to w:        // backwards: each item once
        dp[c] ← combine(dp[c], dp[c - w] plus v)
        // combine: max (best value), or (reachable), + (count ways)
return dp[limit]`,
      examples: ['dp-2d-backpack', 'dp-2d-partition-equal-subset', 'dp-2d-target-sum', 'dp-2d-last-stone-weight-2'],
    },
    {
      name: 'Interval DP on substrings',
      signals: [
        'One string, and the answer for a piece `s[i..j]` depends on smaller pieces inside it',
        'Palindromes: longest, count, fewest insertions',
        'Substring or subsequence of a single string',
      ],
      template: `dp ← n × n grid
for i from 0 to n - 1:
    dp[i][i] ← answer for one letter
for i from n - 1 down to 0:
    for j from i + 1 to n - 1:
        if s[i] = s[j]:
            dp[i][j] ← use the inside dp[i + 1][j - 1]
        else:
            dp[i][j] ← best of dp[i + 1][j], dp[i][j - 1]
return dp[0][n - 1]`,
      examples: [
        'dp-2d-longest-palindromic-substring',
        'dp-2d-palindromic-substrings',
        'dp-2d-longest-palindromic-subsequence',
        'dp-2d-min-insertions-palindrome',
      ],
    },
    {
      name: 'State machine DP',
      signals: [
        'Steps or days in order, and what you may do depends on what you did before',
        'Holding / not holding, cooldowns, fees, "at most k" actions',
        'You can draw a few modes as boxes with arrows between them',
      ],
      template: `list the modes; draw the arrows
old[m] ← value of mode m before the first step (impossible = -∞)
for each step:
    for each mode m:
        new[m] ← best over arrows into m of (old[from] + gain)
    old ← new                      // all modes from yesterday's values
return best of the allowed final modes`,
      examples: ['dp-2d-stock-cooldown', 'dp-2d-stock-fee', 'dp-2d-stock-two-trades'],
    },
  ],
  practice: [
    { title: 'Minimum Falling Path Sum', leetcode: 931, difficulty: 'medium', hint: 'Grid DP where each cell can come from three cells in the row above.' },
    { title: 'Maximal Square', leetcode: 221, difficulty: 'medium', hint: 'Let `dp[r][c]` be the side of the biggest square ending at that cell; look at up, left and diagonal.' },
    { title: 'Count Square Submatrices with All Ones', leetcode: 1277, difficulty: 'medium', hint: 'Same table as Maximal Square; add up every cell.' },
    { title: 'Dungeon Game', leetcode: 174, difficulty: 'hard', hint: 'Fill from the bottom-right: how much health do you need when you enter each cell?' },
    { title: 'Uncrossed Lines', leetcode: 1035, difficulty: 'medium', hint: 'Draw a few lines and compare with LCS.' },
    { title: 'Minimum ASCII Delete Sum for Two Strings', leetcode: 712, difficulty: 'medium', hint: 'Like Delete Operation, but each delete costs the letter\'s code.' },
    { title: 'Distinct Subsequences', leetcode: 115, difficulty: 'hard', hint: 'Count ways: on a match you may use the letter or skip it.' },
    { title: 'Ones and Zeroes', leetcode: 474, difficulty: 'medium', hint: 'A knapsack with two limits at once; loop both backwards.' },
    { title: 'Number of Dice Rolls With Target Sum', leetcode: 1155, difficulty: 'medium', hint: 'State: (dice used, sum so far). Count the ways.' },
    { title: 'Best Time to Buy and Sell Stock IV', leetcode: 188, difficulty: 'hard', hint: 'Stock III with `k` instead of 2: a chain of `2k` modes.' },
  ],
};

export default mod;
