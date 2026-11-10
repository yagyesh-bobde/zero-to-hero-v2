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
  tagline: 'Big-O from constraints, pseudocode, and a repeatable way to go from brute force to optimal.',
  draft: false,
  intro:
    'Most problems feel hard because you do not know where to start. This module gives you a start every time: count steps to see if an idea is fast enough, read the constraints to know how fast it must be, plan in pseudocode, and follow one solving loop from brute force to the best answer. You will also learn the JavaScript traps that quietly break correct ideas. After it, easy array problems should feel routine, and you will know how to begin any medium.',
  lessons: [bigO, constraints, pseudocode, solvingLoop, jsToolkit],
  patterns: [
    {
      name: 'Best so far',
      signals: [
        'The answer is a pair `i < j`: buy then sell, left then right.',
        'For a fixed right end, only the best left value matters (cheapest, biggest, smallest).',
        'The brute force has an inner loop that only looks backwards for a max or min.',
      ],
      template: `bestLeft ← value for index 0
answer ← worst possible
for j from 1 to n - 1:
    answer ← better of (answer, combine(bestLeft, item j))
    bestLeft ← better of (bestLeft, item j)
return answer`,
      examples: ['thinking-best-stock', 'thinking-best-sightseeing-pair', 'thinking-running-sum'],
    },
    {
      name: 'Streak counter',
      signals: [
        '"Consecutive", "in a row", "contiguous", "longest streak".',
        'Count windows made only of one kind of item (each run of length L ends L windows).',
        'Today\'s run can be built from yesterday\'s run.',
      ],
      template: `current ← 0
answer ← 0
for i from 0 to n - 1:
    if item i continues the run:
        current ← current + 1
    else:
        current ← 1 if item i starts a new run, else 0
    answer ← update answer using current
return answer`,
      examples: ['thinking-max-consecutive-ones', 'thinking-zero-filled-subarrays', 'thinking-smooth-descent'],
    },
    {
      name: 'Fix the middle',
      signals: [
        'Count triples `i < j < k` with a rule linking the middle to both sides.',
        'Constraints allow O(n²) but not O(n³) (n around 1,000 to 5,000).',
      ],
      template: `total ← 0
for j from 1 to n - 2:
    left ← count of i < j that fit with item j
    right ← count of k > j that fit with item j
    total ← total + left × right
return total`,
      examples: ['thinking-count-teams'],
    },
    {
      name: 'Track the top few',
      signals: [
        'Only the biggest (or smallest) one, two or three values matter.',
        'A sort would work, but you only need a few winners, not the full order.',
        'A strong promise like "more than half" lets one candidate stand for the whole array.',
      ],
      template: `first ← none
second ← none
for each x in list:
    if first is none or x beats first:
        second ← first
        first ← x
    else if second is none or x beats second:
        second ← x
return first, second`,
      examples: ['thinking-max-product-two', 'thinking-third-max', 'thinking-majority-element'],
    },
  ],
  practice: [
    {
      title: 'Find Numbers with Even Number of Digits',
      leetcode: 1295,
      difficulty: 'easy',
      hint: 'Count the digits of each number by dividing by 10 until it hits 0.',
    },
    {
      title: 'Shuffle the Array',
      leetcode: 1470,
      difficulty: 'easy',
      hint: 'Item i of the first half lands at 2i. Where does item i of the second half land?',
    },
    {
      title: 'Find the Highest Altitude',
      leetcode: 1732,
      difficulty: 'easy',
      hint: 'Carry a running total like Running Sum, and do not forget the starting altitude 0.',
    },
    {
      title: 'Three Consecutive Odds',
      leetcode: 1550,
      difficulty: 'easy',
      hint: 'A streak counter that resets on every even number.',
    },
    {
      title: 'Maximum Ascending Subarray Sum',
      leetcode: 1800,
      difficulty: 'easy',
      hint: 'A streak counter whose streak holds a sum, and breaks when the next value is not bigger.',
    },
    {
      title: 'Maximum Difference Between Increasing Elements',
      leetcode: 2016,
      difficulty: 'easy',
      hint: 'The stock problem in disguise, but watch what to return when nothing ever increases.',
    },
    {
      title: 'Maximum Product Difference Between Two Pairs',
      leetcode: 1913,
      difficulty: 'easy',
      hint: 'You need only the two biggest and the two smallest values. One pass can track all four.',
    },
    {
      title: 'How Many Numbers Are Smaller Than the Current Number',
      leetcode: 1365,
      difficulty: 'easy',
      hint: 'Read the limits: is O(n²) allowed? Then ask what values ≤ 100 lets you do instead.',
    },
    {
      title: 'Sequential Digits',
      leetcode: 1291,
      difficulty: 'medium',
      hint: 'Fewer than 40 numbers have sequential digits at all. Generate them, then filter by the range.',
    },
    {
      title: 'Partitioning Into Minimum Number Of Deci-Binary Numbers',
      leetcode: 1689,
      difficulty: 'medium',
      hint: 'Work a few small examples by hand. Which single digit forces the answer?',
    },
  ],
};

export default mod;
