import type { Module } from '../types';
import { kSum } from './03-two-pointers.k-sum';
import { oppositeEnds } from './03-two-pointers.opposite-ends';
import { palindromes } from './03-two-pointers.palindromes';
import { partitioning } from './03-two-pointers.partitioning';
import { readWrite } from './03-two-pointers.read-write';

const mod: Module = {
  id: "two-pointers",
  number: 3,
  part: "linear",
  title: "Two pointers",
  tagline: "Walk an array from both ends (or at two speeds) to kill the nested loop.",
  draft: false,
  intro:
    "Many array and string problems hide a nested loop that checks every pair. Two pointers replaces it with two indexes that only ever move one way, so O(n²) work drops to O(n), often with O(1) extra memory. You will learn four shapes: pointers closing in from both ends, a read/write pair that edits in place, zones that partition an array, and sort-then-sweep for 3Sum and 4Sum. After this module you can solve pair-sum, cleanup, palindrome and k-sum LeetCode mediums on your own.",
  lessons: [oppositeEnds, readWrite, palindromes, partitioning, kSum],
  patterns: [
    {
      name: 'Opposite ends (converging pointers)',
      signals: [
        "Sorted input (or sorting is allowed) and the task is about **pairs**.",
        "The best answer depends on the two ends: widest, biggest + smallest, heaviest + lightest.",
        "Palindromes: compare outside pairs and walk inward.",
        "You need O(1) extra space where a hash map would be the easy route.",
      ],
      template: `L ← 0
R ← n - 1
while L < R:
    look at a[L] and a[R]
    if they form an answer: record it (or return)
    if L can't help any more: L ← L + 1
    else: R ← R - 1`,
      examples: [
        'two-pointers-two-sum-sorted',
        'two-pointers-container-most-water',
        'two-pointers-boats',
        'two-pointers-trapping-rain-water',
        'two-pointers-valid-palindrome',
      ],
    },
    {
      name: 'Read/write pointers (in place)',
      signals: [
        "**In place** or **O(1) extra space**, and you remove, keep or compact items.",
        "You return the **new length** and the kept items must stay in order.",
        "Later items cancel earlier ones (backspace): run the pointers from the back.",
      ],
      template: `write ← 0
for read from 0 to n - 1:
    if a[read] should be kept:
        a[write] ← a[read]
        write ← write + 1
return write`,
      examples: [
        'two-pointers-remove-duplicates',
        'two-pointers-move-zeroes',
        'two-pointers-remove-duplicates-ii',
        'two-pointers-backspace-compare',
      ],
    },
    {
      name: 'Partition into zones (Dutch flag)',
      signals: [
        "Items fall into 2 or 3 groups: colors, signs, smaller / equal / bigger than a pivot.",
        "Group them in place, in one pass.",
        "If order inside a group must stay, fill a result array from both ends instead of swapping.",
      ],
      template: `low ← 0
mid ← 0
high ← n - 1
while mid ≤ high:
    if a[mid] belongs in front:
        swap a[low] and a[mid]
        low ← low + 1
        mid ← mid + 1
    else if a[mid] belongs at the back:
        swap a[mid] and a[high]
        high ← high - 1
    else:
        mid ← mid + 1`,
      examples: ['two-pointers-sort-colors', 'two-pointers-partition-pivot', 'two-pointers-rearrange-by-sign'],
    },
    {
      name: 'Sort + fix + sweep (k-sum)',
      signals: [
        "Find 3 or 4 numbers that sum to, or close to, a target.",
        "The answer must list **unique** combinations.",
        "Input order doesn't matter, so you may sort; n is in the thousands.",
      ],
      template: `sort a ascending
for i from 0 to n - 3:
    if i > 0 and a[i] = a[i - 1]: skip to the next i
    L ← i + 1
    R ← n - 1
    while L < R:
        sum ← a[i] + a[L] + a[R]
        if sum hits the goal: record, move both, skip repeats
        else if sum is too small: L ← L + 1
        else: R ← R - 1`,
      examples: [
        'two-pointers-three-sum',
        'two-pointers-three-sum-closest',
        'two-pointers-four-sum',
        'two-pointers-max-k-sum-pairs',
      ],
    },
  ],
  practice: [
    {
      title: 'Merge Sorted Array',
      leetcode: 88,
      difficulty: 'easy',
      hint: "Fill the first array from the **back**, taking the bigger of the two last values each time.",
    },
    {
      title: 'Remove Element',
      leetcode: 27,
      difficulty: 'easy',
      hint: "Read/write pointers with the keep rule `a[read] ≠ val`.",
    },
    {
      title: 'Sort Array By Parity',
      leetcode: 905,
      difficulty: 'easy',
      hint: "Two-zone partition: swap each even value to the `low` border.",
    },
    {
      title: 'Sort Array By Parity II',
      leetcode: 922,
      difficulty: 'easy',
      hint: "One pointer walks even indexes, one walks odd indexes. Swap when both are on a wrong value.",
    },
    {
      title: 'Reverse Vowels of a String',
      leetcode: 345,
      difficulty: 'easy',
      hint: "Opposite ends: skip non-vowels on each side, swap when both pointers sit on a vowel.",
    },
    {
      title: 'Is Subsequence',
      leetcode: 392,
      difficulty: 'easy',
      hint: "One pointer per string. Always move the pointer in the long string; move the short one only on a match.",
    },
    {
      title: 'Valid Triangle Number',
      leetcode: 611,
      difficulty: 'medium',
      hint: "Sort, fix the **largest** side, then two pointers below it. When a pair works, every pair with a bigger left value works too.",
    },
    {
      title: '3Sum With Multiplicity',
      leetcode: 923,
      difficulty: 'medium',
      hint: "Like 3Sum, but count combinations: when the two ends are equal values, count pairs with n·(n−1)/2.",
    },
    {
      title: 'Bag of Tokens',
      leetcode: 948,
      difficulty: 'medium',
      hint: "Sort. Buy score with the cheapest token (left), sell score for the most expensive (right) only when stuck.",
    },
    {
      title: 'Number of Subsequences That Satisfy the Given Sum Condition',
      leetcode: 1498,
      difficulty: 'medium',
      hint: "Only the min and max of a subsequence matter. Sort, two pointers, and count 2^(R−L) choices for the middle.",
    },
    {
      title: 'Interval List Intersections',
      leetcode: 986,
      difficulty: 'medium',
      hint: "One pointer per list. Record the overlap, then move the pointer whose interval ends first.",
    },
    {
      title: 'Count the Number of Fair Pairs',
      leetcode: 2563,
      difficulty: 'medium',
      hint: "Sort. Count pairs with sum ≤ upper minus pairs with sum ≤ lower − 1, each with one two-pointer sweep.",
    },
  ],
};

export default mod;
