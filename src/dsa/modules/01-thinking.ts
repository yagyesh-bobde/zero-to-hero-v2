import type { Module } from '../types';
import bigO from './01-thinking.big-o';
import constraints from './01-thinking.constraints';
import pseudocode from './01-thinking.pseudocode';
import solvingLoop from './01-thinking.solving-loop';
import jsToolkit from './01-thinking.js-toolkit';

const mod: Module = {
  id: 'thinking',
  number: 1,
  part: 'foundations',
  title: 'How to think about a problem',
  tagline: 'Start with small examples, count the work, and turn a plain-word plan into code.',
  draft: false,
  intro:
    'You can write loops and functions, but a new problem can still leave you wondering where to start. Begin with a small example, try a direct solution, and see which work you can avoid repeating. You will learn how to compare the work and memory of two plans, read the problem’s limits, and write a plan before coding. JavaScript examples show how to turn that plan into a working answer.',
  lessons: [bigO, constraints, pseudocode, solvingLoop, jsToolkit],
  patterns: [
    {
      name: 'Best so far',
      signals: [
        'You choose an earlier position i and a later position j: i < j.',
        'For a chosen later item, only the cheapest, largest, or smallest earlier value matters.',
        'Or the next result can reuse a total you already calculated, as in Running Sum.',
      ],
      template: `remembered ← first item or starting total
answer ← starting answer for this problem
for each next item in order:
    use remembered to work out the next answer
    update remembered with what later items need
return answer`,
      examples: ['thinking-best-stock', 'thinking-best-sightseeing-pair', 'thinking-running-sum'],
    },
    {
      name: 'Streak counter',
      signals: [
        'The problem says “consecutive”, “in a row”, or “contiguous”: neighboring items with no gaps.',
        'You need the longest run, or the number of valid windows (subarrays) inside runs.',
        'The run ending here either extends the previous run or starts over.',
      ],
      template: `run ← 0
answer ← 0
for each item in order:
    if it continues the run:
        run ← run + 1
    else:
        run ← 1 if this item starts a valid run, otherwise 0
    update answer using run
    // longest run: keep max(answer, run)
    // count windows: add run to answer
return answer`,
      examples: [
        'thinking-max-consecutive-ones',
        'thinking-zero-filled-subarrays',
        'thinking-smooth-descent',
      ],
    },
    {
      name: 'Fix the middle',
      signals: [
        'You count teams of three positions i < j < k, keeping their left-to-right order.',
        'The middle item decides which choices on the left and right fit.',
        'The input size makes checking all triples too costly, but O(n²) work looks practical.',
      ],
      template: `total ← 0
for j from 1 to n - 2:
    left ← number of fitting choices before j
    right ← number of fitting choices after j
    total ← total + left × right
return total`,
      examples: ['thinking-count-teams'],
    },
    {
      name: 'Track the top few',
      signals: [
        'Only the largest or smallest two or three values affect the answer.',
        'Sorting would work, but most of that order is never used.',
        'Check whether repeated values get separate places or only different values count.',
      ],
      template: `first ← none
second ← none
for each x in list:
    // if only different values count, skip repeats first
    if first is none or x > first:
        second ← first
        first ← x
    else if second is none or x > second:
        second ← x
return first, second`,
      examples: ['thinking-max-product-two', 'thinking-third-max'],
    },
  ],
  practice: [
    {
      title: 'Find Numbers with Even Number of Digits',
      leetcode: 1295,
      difficulty: 'easy',
      hint: 'Count digits by repeatedly dividing by 10 and rounding down. For 123, you get 123 → 12 → 1 → 0: three digits.',
    },
    {
      title: 'Shuffle the Array',
      leetcode: 1470,
      difficulty: 'easy',
      hint: 'Try [a, b, x, y]: the result should be [a, x, b, y]. Copy one item from each half in turn.',
    },
    {
      title: 'Find the Highest Altitude',
      leetcode: 1732,
      difficulty: 'easy',
      hint: 'Start at altitude 0. Add each gain to your current altitude and keep the highest altitude seen.',
    },
    {
      title: 'Three Consecutive Odds',
      leetcode: 1550,
      difficulty: 'easy',
      hint: 'Keep a count of odd numbers in a row. Reset it at an even number. Stop when it reaches 3.',
    },
    {
      title: 'Maximum Ascending Subarray Sum',
      leetcode: 1800,
      difficulty: 'easy',
      hint: 'Keep the sum of the increasing run ending here. If the next value is not bigger, start a new sum at that value.',
    },
    {
      title: 'Maximum Difference Between Increasing Elements',
      leetcode: 2016,
      difficulty: 'easy',
      hint: 'Remember the smallest earlier value, as in the stock problem. Check what this problem asks you to return when no later value is larger.',
    },
    {
      title: 'Maximum Product Difference Between Two Pairs',
      leetcode: 1913,
      difficulty: 'easy',
      hint: 'Try a few pairs by hand. Which two large values and which two small values matter for the answer?',
    },
    {
      title: 'How Many Numbers Are Smaller Than the Current Number',
      leetcode: 1365,
      difficulty: 'easy',
      hint: 'With at most 500 numbers, checking every pair may fit. The values are also small; could one counter for each possible value help?',
    },
    {
      title: 'Sequential Digits',
      leetcode: 1291,
      difficulty: 'medium',
      hint: 'For example, 123 and 234 have each digit 1 larger than the previous digit. Try building such numbers from each starting digit, then keep those inside the requested range.',
    },
    {
      title: 'Partitioning Into Minimum Number Of Deci-Binary Numbers',
      leetcode: 1689,
      difficulty: 'medium',
      hint: 'Each deci-binary number uses only digits 0 and 1. For a small example like 32, how many 1s must add up in the tens column?',
    },
  ],
};

export default mod;
