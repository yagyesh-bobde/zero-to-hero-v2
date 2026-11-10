import type { Module } from '../types';
import classic from './05-binary-search.lesson-1';
import bounds from './05-binary-search.lesson-2';
import rotated from './05-binary-search.lesson-3';
import onTheAnswer from './05-binary-search.lesson-4';
import gridsAndDesign from './05-binary-search.lesson-5';

const mod: Module = {
  id: "binary-search",
  number: 5,
  part: "linear",
  title: "Binary search",
  tagline: "Halve the search space, on arrays and on the answer itself.",
  draft: false,
  intro:
    "Binary search finds a value in a sorted list by throwing away half of the list on every look, so a billion items take about 30 looks. Its real power is wider: whenever a yes/no answer flips once, from all no to all yes, binary search finds the flip. That covers the first broken commit, the slowest safe speed, and the smallest truck that ships on time. After this module you can handle exact search, first and last positions, rotated arrays, binary search on the answer, and sorted grids.",
  lessons: [classic, bounds, rotated, onTheAnswer, gridsAndDesign],
  patterns: [
    {
      name: 'Binary search (exact match)',
      signals: [
        'The data is sorted and you need one exact value.',
        'The statement asks for O(log n), or n is too big to scan.',
        'Each look has three outcomes: found, go left, go right.',
      ],
      template: `lo ← 0
hi ← n - 1
while lo ≤ hi:
    mid ← floor((lo + hi) / 2)
    if nums[mid] = target:
        return mid
    else if nums[mid] < target:
        lo ← mid + 1
    else:
        hi ← mid - 1
return -1`,
      examples: [
        'binary-search-classic',
        'binary-search-guess-number',
        'binary-search-perfect-square',
        'binary-search-matrix',
      ],
    },
    {
      name: 'First true (lower / upper bound)',
      signals: [
        '"First / last position of", "where would x be inserted", "how many values are < x".',
        '"The first version / day / index such that…".',
        'You can ask a yes/no question that is all no, then all yes.',
      ],
      template: `lo ← smallest possible answer
hi ← largest possible answer    // n if "after the end" is allowed
while lo < hi:
    mid ← floor((lo + hi) / 2)
    if isYes(mid):
        hi ← mid
    else:
        lo ← mid + 1
return lo`,
      examples: [
        'binary-search-insert-position',
        'binary-search-first-last',
        'binary-search-first-bad-version',
        'binary-search-k-closest',
        'binary-search-time-map',
      ],
    },
    {
      name: 'Shape search (rotated, mountain)',
      signals: [
        '"Sorted, but rotated / shifted / wrapped around".',
        'Strictly up then strictly down (a mountain), find the peak.',
        'A comparison at mid (with an end or a neighbor) tells you which side holds the answer.',
      ],
      template: `lo ← 0
hi ← n - 1
while lo < hi:
    mid ← floor((lo + hi) / 2)
    if answer is right of mid:  // nums[mid] > nums[hi], or
        lo ← mid + 1            // arr[mid] < arr[mid + 1]
    else:
        hi ← mid
return lo`,
      examples: [
        'binary-search-rotated-min',
        'binary-search-rotated-search',
        'binary-search-rotated-duplicates',
        'binary-search-mountain-peak',
      ],
    },
    {
      name: 'Binary search on the answer',
      signals: [
        '"Minimum speed / capacity / days such that…" or "maximum x such that…".',
        '"Minimize the largest" or "maximize the smallest".',
        'Checking one guess is easy (often one pass that takes as much as fits), and bigger guesses are always at least as good.',
      ],
      template: `lo ← smallest answer that could work
hi ← largest answer you could need
while lo < hi:
    mid ← floor((lo + hi) / 2)
    if works(mid):
        hi ← mid
    else:
        lo ← mid + 1
return lo`,
      examples: [
        'binary-search-eating-speed',
        'binary-search-ship-capacity',
        'binary-search-bouquets',
        'binary-search-split-array',
      ],
    },
  ],
  practice: [
    {
      title: 'Sqrt(x)',
      leetcode: 69,
      difficulty: 'easy',
      hint: 'You want the **last** k with `k × k ≤ x`. Find the first k with `k × k > x` and step back one.',
    },
    {
      title: 'Find Smallest Letter Greater Than Target',
      leetcode: 744,
      difficulty: 'easy',
      hint: 'An upper bound on letters. If it falls off the end, wrap around to index 0.',
    },
    {
      title: 'Kth Missing Positive Number',
      leetcode: 1539,
      difficulty: 'easy',
      hint: 'How many numbers are missing before index i? `arr[i] - (i + 1)`. That count only grows.',
    },
    {
      title: 'Single Element in a Sorted Array',
      leetcode: 540,
      difficulty: 'medium',
      hint: 'Before the single element, pairs start at even indexes. After it, at odd ones. Search for where that flips.',
    },
    {
      title: 'Find the Smallest Divisor Given a Threshold',
      leetcode: 1283,
      difficulty: 'medium',
      hint: 'Same shape as the eating speed: a bigger divisor never makes the sum of rounded-up results bigger.',
    },
    {
      title: 'Minimum Time to Complete Trips',
      leetcode: 2187,
      difficulty: 'medium',
      hint: 'Guess a time t. Trips done by then: the sum of `floor(t / time[i])`. Watch how big `hi` must be.',
    },
    {
      title: 'Minimum Speed to Arrive on Time',
      leetcode: 1870,
      difficulty: 'medium',
      hint: 'Every ride but the last waits for the next whole hour, so round those up. The last ride is not rounded.',
    },
    {
      title: 'Maximum Candies Allocated to K Children',
      leetcode: 2226,
      difficulty: 'medium',
      hint: 'Guess a pile size. Can you cut at least k piles that big? Bigger guesses only get harder.',
    },
    {
      title: 'Snapshot Array',
      leetcode: 1146,
      difficulty: 'medium',
      hint: 'Like the time-based store: per index, keep a list of (snapshot id, value) and upper-bound into it.',
    },
    {
      title: 'Find Minimum in Rotated Sorted Array II',
      leetcode: 154,
      difficulty: 'hard',
      hint: 'The rotated minimum with repeats. When `nums[mid] = nums[hi]`, you can safely drop just `hi`.',
    },
    {
      title: 'Median of Two Sorted Arrays',
      leetcode: 4,
      difficulty: 'hard',
      hint: 'Binary search how many items to take from the shorter array. The rest come from the other one.',
    },
  ],
};

export default mod;
