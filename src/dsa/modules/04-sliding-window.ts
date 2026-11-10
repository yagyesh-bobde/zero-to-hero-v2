import type { Module } from '../types';
import { fixedWindowLesson } from './04-sliding-window.lessons-1';
import { variableWindowLesson } from './04-sliding-window.lessons-2';
import { frequencyWindowLesson } from './04-sliding-window.lessons-3';
import { minimumWindowLesson } from './04-sliding-window.lessons-4';
import { countingWindowLesson } from './04-sliding-window.lessons-5';

const mod: Module = {
  id: "sliding-window",
  number: 4,
  part: "linear",
  title: "Sliding window",
  tagline: "Grow and shrink a window to answer every subarray question in one pass.",
  draft: false,
  intro:
    "Tons of questions ask about **runs of neighbors** in an array or string: the best 7 days, the longest streak, the shortest snippet, how many stretches stay under a limit. Brute force checks all of them, about n² runs. A **sliding window** walks two edges forward once and updates what it knows as items enter and leave, so it answers in O(n). After this module you can solve LeetCode 3, 76, 209, 424, 438 and 992 on your own, and you will know when a window will *not* work.",
  lessons: [
    fixedWindowLesson,
    variableWindowLesson,
    frequencyWindowLesson,
    minimumWindowLesson,
    countingWindowLesson,
  ],
  patterns: [
    {
      name: 'Fixed-size window',
      signals: [
        '“exactly `k` in a row”, “every subarray of length `k`”',
        'Best / count of something over `k` consecutive days, letters or minutes',
        'An anagram or permutation of a fixed pattern (window size = pattern length)',
      ],
      template: `state ← empty
for right from 0 to n - 1:
    add nums[right] to state
    if right ≥ k:
        remove nums[right - k] from state
    if right ≥ k - 1:
        update answer from state`,
      examples: [
        'sliding-window-max-average-subarray',
        'sliding-window-max-vowels',
        'sliding-window-threshold-subarrays',
        'sliding-window-grumpy-bookstore',
        'sliding-window-permutation-in-string',
        'sliding-window-find-all-anagrams',
      ],
    },
    {
      name: 'Variable window (longest / shortest)',
      signals: [
        '“longest” or “shortest” subarray / substring such that …',
        'Adding an item moves the rule one way only (positive numbers, counts, distinct letters)',
        'Taking from both ends: flip it and find the longest middle',
      ],
      template: `left ← 0
for right from 0 to n - 1:
    add nums[right] to the window
    while the window is broken:          // longest
        remove nums[left] from the window
        left ← left + 1
    answer ← max(answer, right - left + 1)

// shortest: loop "while the window is valid"
// and record min(answer, right - left + 1) inside it`,
      examples: [
        'sliding-window-min-size-subarray-sum',
        'sliding-window-longest-unique-substring',
        'sliding-window-longest-ones-after-delete',
        'sliding-window-min-ops-reduce-x',
        'sliding-window-character-replacement',
        'sliding-window-balanced-string',
      ],
    },
    {
      name: 'Window + need map (covering)',
      signals: [
        '“contains all letters of …”, “anagram”, “permutation”',
        'Smallest substring that covers a set of characters with repeats',
      ],
      template: `need ← counts of the pattern
missing ← length of the pattern
for right from 0 to n - 1:
    if need[s[right]] > 0: missing ← missing - 1
    need[s[right]] ← need[s[right]] - 1
    while missing = 0 (or window too long):
        record the window if it is a match / shorter
        need[s[left]] ← need[s[left]] + 1
        if need[s[left]] > 0: missing ← missing + 1
        left ← left + 1`,
      examples: [
        'sliding-window-permutation-in-string',
        'sliding-window-find-all-anagrams',
        'sliding-window-min-window-substring',
      ],
    },
    {
      name: 'Counting windows (at most / exactly k)',
      signals: [
        '“how many subarrays / substrings” with a limit',
        '“exactly k” odd numbers, distinct values, ones … (use at most k − at most k−1)',
        '“at least one of each” (add `left` after shrinking)',
      ],
      template: `function atMost(k):
    if k < 0: return 0
    left ← 0
    count ← 0
    for right from 0 to n - 1:
        add nums[right]
        while window cost > k:
            remove nums[left]
            left ← left + 1
        count ← count + (right - left + 1)
    return count

exactly(k) = atMost(k) - atMost(k - 1)`,
      examples: [
        'sliding-window-product-less-than-k',
        'sliding-window-three-char-substrings',
        'sliding-window-binary-subarrays-sum',
        'sliding-window-k-distinct-subarrays',
      ],
    },
  ],
  practice: [
    {
      title: 'Minimum Recolors to Get K Consecutive Black Blocks',
      leetcode: 2379,
      difficulty: 'easy',
      hint: 'Fixed window of size `k`: count the white blocks inside it and keep the smallest count.',
    },
    {
      title: 'Contains Duplicate II',
      leetcode: 219,
      difficulty: 'easy',
      hint: 'Keep a set of the last `k` numbers. Add the new one, drop the one that is now too far away.',
    },
    {
      title: 'K Radius Subarray Averages',
      leetcode: 2090,
      difficulty: 'medium',
      hint: 'A fixed window of size `2k + 1` centered on `i`. Watch out for big sums and integer division.',
    },
    {
      title: 'Maximum Points You Can Obtain from Cards',
      leetcode: 1423,
      difficulty: 'medium',
      hint: 'You take from both ends, so flip it: the cards you leave are one block of `n - k` with the smallest sum.',
    },
    {
      title: 'Maximum Sum of Distinct Subarrays With Length K',
      leetcode: 2461,
      difficulty: 'medium',
      hint: 'Fixed window plus a count map. A window counts only when the map has `k` keys.',
    },
    {
      title: 'Maximum Erasure Value',
      leetcode: 1695,
      difficulty: 'medium',
      hint: 'Like longest substring without repeats, but track the window sum instead of its length.',
    },
    {
      title: 'Get Equal Substrings Within Budget',
      leetcode: 1208,
      difficulty: 'medium',
      hint: 'Each position has a cost `|s[i] - t[i]|`. Longest window whose total cost is at most the budget.',
    },
    {
      title: 'Maximize the Confusion of an Exam',
      leetcode: 2024,
      difficulty: 'medium',
      hint: 'Same idea as character replacement, with only two letters. Try “mostly T” and “mostly F”.',
    },
    {
      title: 'Frequency of the Most Frequent Element',
      leetcode: 1838,
      difficulty: 'medium',
      hint: 'Sort first. A window can all become its largest value if `largest · length - sum ≤ k`.',
    },
    {
      title: 'Repeated DNA Sequences',
      leetcode: 187,
      difficulty: 'medium',
      hint: 'Slide a window of 10 letters and remember each one in a set. Seen twice means repeated.',
    },
    {
      title: 'Count Subarrays Where Max Element Appears at Least K Times',
      leetcode: 2962,
      difficulty: 'medium',
      hint: 'An “at least” count: shrink while the window still has `k` copies of the max, then add `left`.',
    },
    {
      title: 'Substring with Concatenation of All Words',
      leetcode: 30,
      difficulty: 'hard',
      hint: 'All words have the same length `w`. Run `w` separate windows that move one word at a time, with a word count map.',
    },
  ],
};

export default mod;
