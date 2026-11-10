import type { Module } from '../types';
import { lesson1 } from './12-heaps.lesson-1';
import { lesson2 } from './12-heaps.lesson-2';
import { lesson3 } from './12-heaps.lesson-3';
import { lesson4 } from './12-heaps.lesson-4';
import { lesson5 } from './12-heaps.lesson-5';

const mod: Module = {
  id: "heaps",
  number: 12,
  part: "nonlinear",
  title: "Heaps & priority queues",
  tagline: "Always grab the smallest (or biggest) next: top-k, merging, running medians.",
  draft: false,
  intro:
    "A heap answers one question fast, over and over: *what is the smallest (or biggest) thing right now?* Hospitals, ride apps, music charts and your OS's CPU scheduler all ask it nonstop while new data keeps arriving. You will build a heap by hand once, then use it to find the top k of anything, merge k sorted streams, track a live median, and schedule meetings and jobs.",
  lessons: [lesson1, lesson2, lesson3, lesson4, lesson5],
  patterns: [
    {
      name: 'Top-k with a size-k heap',
      signals: [
        '"k largest", "k smallest", "k closest", "top k", "kth biggest".',
        'A stream where you keep reporting a rank (the kth best so far).',
        '"Save the best resource for the k biggest things" (ladders, coupons, boosts).',
      ],
      template: `heap ← empty heap with the WEAKEST winner on top
    // k largest → min-heap, k smallest → max-heap
for each x in items:
    heap.push(x)
    if heap.size() > k:
        heap.pop()                      // kick out the weakest
return heap                             // pop + reverse for best-first`,
      examples: ['heaps-kth-largest-stream', 'heaps-k-closest-points', 'heaps-top-k-frequent-words', 'heaps-furthest-building'],
    },
    {
      name: 'K-way merge (heap of fronts)',
      signals: [
        '"k sorted lists / arrays / files", "merge", "smallest across several sorted things".',
        'A grid or table whose rows are sorted (pair sums, matrix rows).',
        'Generate values in sorted order from smaller ones.',
      ],
      template: `heap ← empty min-heap of [value, streamId, position]
for each stream s that is not empty:
    heap.push([first value of s, s, 0])
while heap is not empty (or until you have k):
    [value, s, j] ← heap.pop()
    use value
    if stream s has an item at j + 1:
        heap.push([that item, s, j + 1])`,
      examples: ['heaps-merge-k-sorted', 'heaps-k-smallest-pairs', 'heaps-ugly-number-ii'],
    },
    {
      name: 'Two heaps',
      signals: [
        '"median", "middle" of a changing set of numbers.',
        'Two pools that each need their best member (front vs back of a line).',
        'Split the data into a smaller half and a bigger half and watch the boundary.',
      ],
      template: `low ← max-heap                          // smaller half
high ← min-heap                         // bigger half
function add(x):
    low.push(x)
    high.push(low.pop())
    if high.size() > low.size():
        low.push(high.pop())
median ← low.peek() if low is bigger, else (low.peek() + high.peek()) / 2`,
      examples: ['heaps-median-finder', 'heaps-hire-workers'],
    },
    {
      name: 'Scheduling: sort by time + heap',
      signals: [
        'Intervals, rooms, gates, servers, CPUs, deadlines, cooldowns.',
        'Options that become available over time (arrivals, money unlocking projects).',
        '"Which one should go next?" asked again and again.',
      ],
      template: `sort items by when they become available
heap ← empty, ordered by who should go next
for each moment / item in time order:
    push everything that is available now
    if heap is empty:
        jump time forward to the next item
    else:
        pop the best and act on it`,
      examples: ['heaps-meeting-rooms', 'heaps-task-scheduler', 'heaps-single-threaded-cpu', 'heaps-ipo'],
    },
  ],
  practice: [
    { title: 'Take Gifts From the Richest Pile', leetcode: 2558, difficulty: 'easy', hint: 'Each second, act on the biggest pile. Which heap gives you that?' },
    { title: 'Maximal Score After Applying K Operations', leetcode: 2530, difficulty: 'medium', hint: 'Greedy on the biggest value, then put the shrunk value back.' },
    { title: 'Find the Kth Largest Integer in the Array', leetcode: 1985, difficulty: 'medium', hint: 'The numbers are digit strings, too long for a JS number. How can you compare two of them without converting?' },
    { title: 'Reorganize String', leetcode: 767, difficulty: 'medium', hint: 'Always place the most common letter that is not the one you just placed.' },
    { title: 'Design Twitter', leetcode: 355, difficulty: 'medium', hint: 'A news feed is a k-way merge of each followed user’s tweets, newest first.' },
    { title: 'K-th Smallest Prime Fraction', leetcode: 786, difficulty: 'medium', hint: 'For a fixed numerator, fractions grow as the denominator shrinks: sorted streams again.' },
    { title: 'Maximum Number of Events That Can Be Attended', leetcode: 1353, difficulty: 'medium', hint: 'Walk day by day. Among events open today, attend the one that ends first.' },
    { title: 'Process Tasks Using Servers', leetcode: 1882, difficulty: 'medium', hint: 'Two heaps: free servers by (weight, index) and busy servers by the time they free up.' },
    { title: 'Sliding Window Median', leetcode: 480, difficulty: 'hard', hint: 'Two heaps again, but values also leave. Delete lazily: remember what to drop and skip it when it reaches a top.' },
    { title: 'Minimum Number of Refueling Stops', leetcode: 871, difficulty: 'hard', hint: 'Drive as far as you can; when stuck, pretend you stopped at the biggest station you passed.' },
    { title: 'Meeting Rooms III', leetcode: 2402, difficulty: 'hard', hint: 'Free rooms by number, busy rooms by end time. A delayed meeting keeps its length.' },
  ],
};

export default mod;
