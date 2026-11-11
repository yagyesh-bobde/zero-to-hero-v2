import type { Module } from '../types';
import { countingLesson, lookupLesson } from './02-hashing.lessons-1';
import { groupingLesson, setsLesson } from './02-hashing.lessons-2';
import { prefixHashLesson, prefixLesson } from './02-hashing.lessons-3';

const mod: Module = {
  id: 'hashing',
  number: 2,
  part: 'foundations',
  title: 'Hash maps, sets & prefix sums',
  tagline: 'Remember earlier items, count repeats, group similar items, and reuse saved totals.',
  draft: false,
  intro:
    'You often search a list for something you have already passed. You can save that information and ask for it directly. Start with two prices that add to a gift-card total, then count letters, group words, spot repeats, and reuse totals for stretches of numbers. Each lesson shows what to save and why it helps.',
  lessons: [
    lookupLesson,
    countingLesson,
    groupingLesson,
    setsLesson,
    prefixLesson,
    prefixHashLesson,
  ],
  patterns: [
    {
      name: 'Complement lookup: find the missing partner',
      signals: [
        'Two items must add to a target.',
        'You know the current value and can calculate its missing partner, called a complement.',
        'Trying every pair repeats searches through earlier items.',
      ],
      template: `seen ← empty map                  // number → its index
for i from 0 to n - 1:
    partner ← target - nums[i]
    if partner in seen:
        use [seen[partner], i]
    seen[nums[i]] ← i               // check before saving`,
      examples: ['hashing-two-sum', 'hashing-song-pairs', 'hashing-pairs-diff-k'],
    },
    {
      name: 'Frequency map: count appearances',
      signals: [
        'You need how many of each item, also called its frequency.',
        'Words must use the same letters the same number of times.',
        'You want items that appear once or appear most often.',
      ],
      template: `count ← empty map                 // item → number of appearances
for each x in items:
    count[x] ← (count[x] or 0) + 1  // missing means 0
// use the completed counts to answer
// for top k: bucket c holds items with count c`,
      examples: ['hashing-valid-anagram', 'hashing-first-unique-char', 'hashing-top-k-frequent'],
    },
    {
      name: 'Shared keys for grouping; sets for yes or no',
      signals: [
        'Items belong together when they produce the same label, or key.',
        'You only need to know whether a value has appeared: use a set.',
        'If you also need a group, count, or index, save it in a map.',
      ],
      template: `groups ← empty map                // key → list of items
for each item in items:
    key ← shared label for item    // e.g. sorted letters joined
    if key not in groups:
        groups[key] ← empty list
    append item to groups[key]
// for a yes-or-no check, a set saves just the labels`,
      examples: [
        'hashing-group-anagrams',
        'hashing-equal-row-column-pairs',
        'hashing-group-by-size',
        'hashing-contains-duplicate',
        'hashing-valid-sudoku',
        'hashing-longest-consecutive',
      ],
    },
    {
      name: 'Prefix sums: reuse totals from the start',
      signals: [
        'Many questions ask for the sum from one index through another.',
        'You need to count subarrays: non-empty stretches with no gaps.',
        'You want the longest stretch with a target sum or equal counts.',
      ],
      template: `seen ← map with {0: 1}            // total 0 occurred once before input
prefix ← 0
answer ← 0
for each x in nums:
    prefix ← prefix + x
    answer ← answer + (seen[prefix - target] or 0)
    seen[prefix] ← (seen[prefix] or 0) + 1
// longest length: save first indexes, starting with 0 → -1
// known range: pre[right + 1] - pre[left]`,
      examples: [
        'hashing-range-sum-query',
        'hashing-pivot-index',
        'hashing-product-except-self',
        'hashing-subarray-sum-k',
        'hashing-contiguous-array',
        'hashing-continuous-subarray-sum',
      ],
    },
  ],
  practice: [
    {
      title: 'Ransom Note',
      leetcode: 383,
      difficulty: 'easy',
      hint: 'Count available copies of each letter, then use one for each letter in the note.',
    },
    {
      title: 'Contains Duplicate II',
      leetcode: 219,
      difficulty: 'easy',
      hint: 'Save each value’s latest index. Compare its new index with the saved one to check the distance.',
    },
    {
      title: 'Number of Good Pairs',
      leetcode: 1512,
      difficulty: 'easy',
      hint: 'A new copy pairs with every earlier copy of the same value. Save how many copies you have seen.',
    },
    {
      title: 'Intersection of Two Arrays',
      leetcode: 349,
      difficulty: 'easy',
      hint: 'Save the first array’s distinct values in a set. Which values from the second array are also there?',
    },
    {
      title: 'Isomorphic Strings',
      leetcode: 205,
      difficulty: 'easy',
      hint: 'Each letter in one string must consistently match one letter in the other, in both directions.',
    },
    {
      title: 'Word Pattern',
      leetcode: 290,
      difficulty: 'easy',
      hint: 'Save both letter → word and word → letter so two letters cannot claim the same word.',
    },
    {
      title: 'Brick Wall',
      leetcode: 554,
      difficulty: 'medium',
      hint: 'Add brick widths from the left of each row. Which inside-edge position occurs in the most rows?',
    },
    {
      title: 'Range Sum Query 2D - Immutable',
      leetcode: 304,
      difficulty: 'medium',
      hint: 'Save totals for rectangles that start at the top-left corner. Subtract the parts outside your requested rectangle.',
    },
    {
      title: 'Binary Subarrays With Sum',
      leetcode: 930,
      difficulty: 'medium',
      hint: 'Use counts of earlier running totals, just as for Subarray Sum Equals K.',
    },
    {
      title: 'Count Number of Nice Subarrays',
      leetcode: 1248,
      difficulty: 'medium',
      hint: 'Treat an odd number as 1 and an even number as 0. Now a stretch’s sum counts its odd numbers.',
    },
  ],
};

export default mod;
