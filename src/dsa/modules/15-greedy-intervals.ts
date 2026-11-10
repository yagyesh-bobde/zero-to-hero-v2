import type { Module } from '../types';
import greedyThinking from './15-greedy-intervals.lesson-1';
import reachAndJumps from './15-greedy-intervals.lesson-2';
import mergeIntervals from './15-greedy-intervals.lesson-3';
import sortByEnd from './15-greedy-intervals.lesson-4';
import partitionAndGrouping from './15-greedy-intervals.lesson-5';

const mod: Module = {
  id: "greedy-intervals",
  number: 15,
  part: "optimization",
  title: "Greedy & intervals",
  tagline: "Make the locally best move, and know when that is safe.",
  draft: false,
  intro:
    'Greedy means making the best-looking move right now and never taking it back. It gives short, fast code, but it is only correct when you can say *why* the move is safe, so you will learn a one-sentence swap check and a counter-example where greedy fails. Then come the tricks behind most greedy and interval questions: the farthest-reach scan for jump games, sort by start to merge, sort by end to keep the most, and cut-as-early-as-you-can for partitions. After this module you can solve mediums like Merge Intervals, Jump Game II, Gas Station and Partition Labels on your own.',
  lessons: [greedyThinking, reachAndJumps, mergeIntervals, sortByEnd, partitionAndGrouping],
  patterns: [
    {
      name: 'Greedy with a swap check',
      signals: [
        'Asks for the **most** or **fewest** of something (kids fed, boats, coins of change).',
        'There is an obvious order to try things: smallest first, heaviest first, cheapest first.',
        'You can say in one sentence why the best-looking move never blocks a better plan.',
        'Try 2-3 item counter-examples first. If one breaks the rule, use DP (module 16).',
      ],
      template: `sort items by the key that makes the best move obvious
answer ← 0
for each item in sorted order:
    if item can be taken right now:
        take it                          // never undo
        answer ← answer + 1
return answer`,
      examples: [
        'greedy-intervals-assign-cookies',
        'greedy-intervals-lemonade-change',
        'greedy-intervals-stock-profit-ii',
        'greedy-intervals-boats-to-save-people',
        'greedy-intervals-hand-of-straights',
        'greedy-intervals-merge-triplets',
      ],
    },
    {
      name: 'Farthest reach',
      signals: [
        'Each position lets you move *up to* some distance forward.',
        '"Can I reach the end?" or "fewest jumps", not the actual path.',
        'A running total must never drop below zero (fuel, battery): restart after a failure.',
        'Cut a sequence into the most pieces where some items must stay together.',
      ],
      template: `reach ← 0
for i from 0 to n - 1:
    if i > reach:
        stop: i cannot be reached
    reach ← max(reach, farthest point i allows)
    // partition: if i = reach, cut here
    // fewest jumps: when i = end of level, jumps + 1, end ← reach`,
      examples: [
        'greedy-intervals-jump-game',
        'greedy-intervals-jump-game-ii',
        'greedy-intervals-gas-station',
        'greedy-intervals-partition-labels',
        'greedy-intervals-valid-parenthesis-string',
      ],
    },
    {
      name: 'Sort by start, then sweep',
      signals: [
        'A list of `[start, end]` pairs: meetings, bookings, ranges.',
        'Words like *merge*, *overlap*, *conflict*, *insert*, *both free*.',
        'Input order does not matter (sort it), or it is already sorted (skip the sort).',
      ],
      template: `sort intervals by start
out ← empty list
for each [s, e] in intervals:
    if out not empty and s ≤ end of last in out:
        end of last ← max(end of last, e)
    else:
        append [s, e] to out
return out`,
      examples: [
        'greedy-intervals-merge-intervals',
        'greedy-intervals-insert-interval',
        'greedy-intervals-meeting-rooms',
        'greedy-intervals-interval-intersections',
        'greedy-intervals-remove-covered',
      ],
    },
    {
      name: 'Sort by end, keep the earliest finisher',
      signals: [
        'The **most** intervals with no overlap, or the **fewest** to remove.',
        'The **fewest** points (arrows, guards) so every interval contains one.',
        'Choosing an interval uses up time; you want to leave the most room for the rest.',
      ],
      template: `sort intervals by end
count ← 0
lastEnd ← -infinity
for each [s, e] in intervals:
    if s ≥ lastEnd:        // s > lastEnd if touching clashes
        count ← count + 1
        lastEnd ← e
return count`,
      examples: ['greedy-intervals-non-overlapping', 'greedy-intervals-min-arrows'],
    },
  ],
  practice: [
    {
      title: 'Maximize Sum Of Array After K Negations',
      leetcode: 1005,
      difficulty: 'easy',
      hint: 'Which number gains the most from a sign flip? Sort first, and think about leftover flips.',
    },
    {
      title: 'Maximum Units on a Truck',
      leetcode: 1710,
      difficulty: 'easy',
      hint: 'Load the box type with the most units per box first.',
    },
    {
      title: 'Teemo Attacking',
      leetcode: 495,
      difficulty: 'easy',
      hint: 'Each attack is an interval. Add its length, but don\'t count the overlap with the next attack twice.',
    },
    {
      title: 'Maximum Matching of Players With Trainers',
      leetcode: 2410,
      difficulty: 'medium',
      hint: 'Assign Cookies with new names.',
    },
    {
      title: 'Bag of Tokens',
      leetcode: 948,
      difficulty: 'medium',
      hint: 'Sort. Buy points with the cheapest token; when stuck, trade a point for the most expensive one.',
    },
    {
      title: 'Minimum Increment to Make Array Unique',
      leetcode: 945,
      difficulty: 'medium',
      hint: 'After sorting, each number must be at least one more than the number before it.',
    },
    {
      title: 'Video Stitching',
      leetcode: 1024,
      difficulty: 'medium',
      hint: 'Jump Game II in disguise: from each time, how far can one clip carry you?',
    },
    {
      title: 'Maximum Length of Pair Chain',
      leetcode: 646,
      difficulty: 'medium',
      hint: 'The festival shows again: sort by end and keep whatever fits.',
    },
    {
      title: 'Divide Array in Sets of K Consecutive Numbers',
      leetcode: 1296,
      difficulty: 'medium',
      hint: 'Same as Hand of Straights.',
    },
    {
      title: 'Candy',
      leetcode: 135,
      difficulty: 'hard',
      hint: 'Stretch: one pass left to right for left neighbors, one pass right to left for right neighbors.',
    },
    {
      title: 'Minimum Number of Taps to Open to Water a Garden',
      leetcode: 1326,
      difficulty: 'hard',
      hint: 'Stretch: turn each tap into an interval, then it is Video Stitching.',
    },
  ],
};

export default mod;
