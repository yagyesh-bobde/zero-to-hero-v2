import type { Module } from '../types';
import l1 from './08-recursion.l1';
import l2 from './08-recursion.l2';
import l3 from './08-recursion.l3';
import l4 from './08-recursion.l4';
import l5 from './08-recursion.l5';
import l6 from './08-recursion.l6';

const mod: Module = {
  id: "recursion",
  number: 8,
  part: "recursion",
  title: "Recursion & divide and conquer",
  tagline: "Trust the smaller call: recursion, merge sort, quickselect.",
  draft: false,
  intro:
    'Lots of hard problems hide an easier copy of themselves inside. Solve a smaller copy, then take one step to finish. In this module you learn to spot that copy and write the base case. Then you **trust the call**: you let the smaller call do its job without tracing every level in your head. Then you use the same idea to split work in half: merge sort, quickselect, fast power, and "try every split" problems. You also learn the sorting tools that half of all LeetCode mediums quietly need. After this module you can sort a linked list, find the k-th largest number in O(n) on average, and work out x to the power of a billion in about 30 steps.',
  lessons: [l1, l2, l3, l4, l5, l6],
  patterns: [
    {
      name: 'Trust the smaller call',
      signals: [
        'The answer for `n` is easy **if** you already had the answer for `n - 1` or `n / 2`.',
        'The input is built from a smaller copy of itself (row n comes from row n - 1, a circle of n people becomes n - 1).',
        'A huge number like `n = 10¹⁵` or `x^n`: halving it each call gives about 50 steps.',
      ],
      template: `function solve(input):
    if input is tiny:                   // base case: answer directly
        return smallAnswer
    smaller ← shrink(input)             // n - 1, n / 2, a shorter list...
    sub ← solve(smaller)                // trust it: assume it is right
    return finish(sub, input)           // one small step of work`,
      examples: [
        'recursion-fibonacci',
        'recursion-kth-symbol',
        'recursion-josephus',
        'recursion-pow',
        'recursion-count-good-numbers',
        'recursion-super-pow',
      ],
    },
    {
      name: 'Divide and conquer (split, solve, combine)',
      signals: [
        'You can cut the input into parts and solve each part on its own (left half, right half, each side of an operator, each side of a bad character).',
        'Combining two solved parts is cheap: merging two sorted lists, counting pairs across the middle, pairing every left result with every right result.',
        'You need `O(n log n)` and the brute force compares every pair.',
      ],
      template: `function solve(lo, hi):
    if hi - lo + 1 ≤ 1:                 // tiny part: answer directly
        return base answer
    mid ← floor((lo + hi) / 2)
    left ← solve(lo, mid)               // trust the halves
    right ← solve(mid + 1, hi)
    return combine(left, right)         // the real work lives here`,
      examples: [
        'recursion-sort-array',
        'recursion-sort-list',
        'recursion-count-inversions',
        'recursion-merge-k-sorted',
        'recursion-add-parentheses',
        'recursion-longest-nice-substring',
        'recursion-longest-k-repeating',
      ],
    },
    {
      name: 'Quickselect (partition, keep one side)',
      signals: [
        'You need the k-th largest / k-th smallest / the median, **not** the whole sorted order.',
        'Sorting would work in `O(n log n)`, and the task hints that `O(n)` is possible.',
        'You may reorder the array (or copy it).',
      ],
      template: `function select(a, lo, hi, target):   // target = index in sorted order
    p ← random index from lo to hi
    mid ← partition(a, lo, hi, p)       // pivot lands at its final spot
    if mid = target: return a[mid]
    if target < mid: return select(a, lo, mid - 1, target)
    return select(a, mid + 1, hi, target)`,
      examples: ['recursion-kth-largest', 'recursion-min-moves-median', 'recursion-kth-largest-string'],
    },
    {
      name: 'Sort by a custom key (and counting sort)',
      signals: [
        'The order is not plain "small to big": by frequency, by a given order list, by "which joins into a bigger string".',
        'Ties need a second rule (same frequency → bigger value first).',
        'Values live in a small range (0..1000, ≤ n), so you can count instead of compare.',
      ],
      template: `// Comparator: negative = a first, positive = b first, 0 = keep order
sort items by (a, b):
    if key1(a) ≠ key1(b): return key1(a) - key1(b)
    return key2(a) - key2(b)            // tie-break

// Counting sort for values in 0..maxV
count ← array of maxV + 1 zeros
for each x in items: count[x] ← count[x] + 1
for v from 0 to maxV: append v, count[v] times`,
      examples: [
        'recursion-sort-by-frequency',
        'recursion-relative-sort',
        'recursion-h-index',
        'recursion-largest-number',
      ],
    },
  ],
  practice: [
    {
      title: 'Reverse String',
      leetcode: 344,
      difficulty: 'easy',
      hint: 'Swap the two ends, then trust a call on the part in between. What is the base case?',
    },
    {
      title: 'Height Checker',
      leetcode: 1051,
      difficulty: 'easy',
      hint: 'Heights are at most 100. Count them, rebuild the sorted line, and compare.',
    },
    {
      title: 'Largest Perimeter Triangle',
      leetcode: 976,
      difficulty: 'easy',
      hint: 'Sort descending. If three neighbours cannot make a triangle, can a smaller third side help?',
    },
    {
      title: 'Elimination Game',
      leetcode: 390,
      difficulty: 'medium',
      hint: 'After one pass, the survivors look like a smaller copy of the same game. Track the first survivor and the gap.',
    },
    {
      title: 'Find Kth Bit in Nth Binary String',
      leetcode: 1545,
      difficulty: 'medium',
      hint: 'Like K-th Symbol: the second half is a flipped mirror of the first half. Map k back into it.',
    },
    {
      title: 'Custom Sort String',
      leetcode: 791,
      difficulty: 'medium',
      hint: 'Count every letter of s, then write letters out in the given order, then the rest.',
    },
    {
      title: 'Sort Integers by The Power Value',
      leetcode: 1387,
      difficulty: 'medium',
      hint: 'Write a recursive steps(x), then sort by (steps, value). A small cache makes it fast.',
    },
    {
      title: 'Wiggle Sort II',
      leetcode: 324,
      difficulty: 'medium',
      hint: 'Find the median (quickselect), then put bigger values in odd slots and smaller in even slots.',
    },
    {
      title: 'Beautiful Array',
      leetcode: 932,
      difficulty: 'medium',
      hint: 'Odds on the left, evens on the right: an odd plus an even is odd, so no number can be their average. Build both sides from a smaller beautiful array.',
    },
    {
      title: 'Reverse Pairs',
      leetcode: 493,
      difficulty: 'hard',
      hint: 'Same shape as counting inversions: count across the middle with two pointers before you merge.',
    },
  ],
};

export default mod;
