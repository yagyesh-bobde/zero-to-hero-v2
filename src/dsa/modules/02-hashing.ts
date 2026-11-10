import type { Module } from '../types';
import { countingLesson, lookupLesson } from './02-hashing.lessons-1';
import { groupingLesson, setsLesson } from './02-hashing.lessons-2';
import { prefixHashLesson, prefixLesson } from './02-hashing.lessons-3';

const mod: Module = {
  id: 'hashing',
  number: 2,
  part: 'foundations',
  title: 'Hash maps, sets & prefix sums',
  tagline: 'Trade memory for speed: counting, complements, grouping and running sums.',
  draft: false,
  intro:
    "Most slow solutions are slow because they search for something they already walked past. A hash map remembers it and finds it again in about one step, so O(n²) pair checks turn into one O(n) pass. You will learn to look up complements, count, group by a key, check existence with sets, and use running totals to answer range and subarray questions. After this module, Two Sum, Group Anagrams, Top K Frequent and Subarray Sum Equals K are routine.",
  lessons: [lookupLesson, countingLesson, groupingLesson, setsLesson, prefixLesson, prefixHashLesson],
  patterns: [
    {
      name: 'Complement lookup',
      signals: [
        "Find or count **pairs** that add up to / differ by / combine to a target.",
        "'Have I already seen the partner of this item?'",
        "Brute force is a double loop over pairs.",
      ],
      template: `seen ← empty map              // value → index or count
for each x in items:
    partner ← target - x          // or x - k, (60 - x % 60) % 60 ...
    if partner in seen:
        use seen[partner]
    record x in seen              // after the lookup`,
      examples: ['hashing-two-sum', 'hashing-song-pairs', 'hashing-pairs-diff-k'],
    },
    {
      name: 'Frequency map',
      signals: [
        "Anagram, same letters, rearrangement.",
        "Most / least frequent, top k, appears once.",
        "Order does not matter, only how many of each.",
      ],
      template: `count ← empty map
for each x in items:
    count[x] ← (count[x] or 0) + 1
// answer from counts: compare, find count = 1,
// or bucket[c] lists values seen c times (top k)`,
      examples: ['hashing-valid-anagram', 'hashing-first-unique-char', 'hashing-top-k-frequent'],
    },
    {
      name: 'Group by key / set for existence',
      signals: [
        "Group items that are 'the same' in some way (anagrams, equal rows, same size).",
        "Duplicate, unique, already seen, visited, contains.",
        "Fast 'is x + 1 / this neighbour here?' checks.",
      ],
      template: `groups ← empty map              // or a set if you only need yes / no
for each item in items:
    key ← signature(item)          // string or number, never an array
    if key not in groups:
        groups[key] ← empty list
    append item to groups[key]`,
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
      name: 'Prefix sums (+ hash map)',
      signals: [
        "Sum of a range or subarray; many queries on an array that does not change.",
        "Count subarrays / longest subarray with sum = k, balance = 0, or sum divisible by k.",
        "Numbers can be negative, so a sliding window will not work.",
      ],
      template: `seen ← map with {0: 1}          // {0: -1} when you want the longest
prefix ← 0
for i from 0 to n - 1:
    prefix ← prefix + nums[i]
    look up seen[prefix - target]  // add count, or i - first index
    record prefix in seen          // count + 1, or first index only`,
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
    { title: 'Ransom Note', leetcode: 383, difficulty: 'easy', hint: "Count the magazine's letters, then spend them on the note." },
    { title: 'Contains Duplicate II', leetcode: 219, difficulty: 'easy', hint: 'Remember the last index where you saw each value.' },
    { title: 'Number of Good Pairs', leetcode: 1512, difficulty: 'easy', hint: 'Each new copy of a value pairs with every earlier copy.' },
    { title: 'Intersection of Two Arrays', leetcode: 349, difficulty: 'easy', hint: 'Put one array in a set and walk the other.' },
    { title: 'Isomorphic Strings', leetcode: 205, difficulty: 'easy', hint: 'The letter mapping must work in both directions.' },
    { title: 'Word Pattern', leetcode: 290, difficulty: 'easy', hint: 'Two maps: letter → word and word → letter.' },
    { title: 'Brick Wall', leetcode: 554, difficulty: 'medium', hint: 'Count where brick edges fall using running widths per row.' },
    { title: 'Range Sum Query 2D - Immutable', leetcode: 304, difficulty: 'medium', hint: 'Prefix sums in two directions; mind what gets subtracted twice.' },
    { title: 'Binary Subarrays With Sum', leetcode: 930, difficulty: 'medium', hint: 'Same as Subarray Sum Equals K with 0s and 1s.' },
    { title: 'Count Number of Nice Subarrays', leetcode: 1248, difficulty: 'medium', hint: 'Treat odd numbers as 1 and even numbers as 0.' },
  ],
};

export default mod;
