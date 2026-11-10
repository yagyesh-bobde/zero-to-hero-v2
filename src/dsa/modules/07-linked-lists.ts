import type { Module } from '../types';
import dummyAndMerge from './07-linked-lists.l1';
import fastSlow from './07-linked-lists.l2';
import reversal from './07-linked-lists.l3';
import combineMoves from './07-linked-lists.l4';
import twoLists from './07-linked-lists.l5';
import lruCache from './07-linked-lists.l6';

const mod: Module = {
  id: "linked-lists",
  number: 7,
  part: "linear",
  title: "Linked list techniques",
  tagline: "Dummy nodes, fast/slow pointers and in-place reversal, fast.",
  draft: false,
  intro:
    "You already know what a node is, so this module skips straight to the moves that crack linked-list interview questions. There are only a handful: a **dummy node** so the head is never special, **fast & slow pointers** for loops, middles and \"k-th from the end\", **in-place reversal** with three pointers, and a **hash map + doubly linked list** for O(1) designs like an LRU cache. After this module you can solve merge, cycle, reorder, palindrome, add-two-numbers and LRU-style mediums, mostly in O(1) extra memory.",
  lessons: [dummyAndMerge, fastSlow, reversal, combineMoves, twoLists, lruCache],
  patterns: [
    {
      name: 'Dummy node',
      signals: [
        'The head of the answer might change or is not known yet (deleting, merging, building a new list).',
        'You are splitting one list into groups (one dummy per group).',
        'You catch yourself writing `if (node === head)`.',
      ],
      template: `dummy ← new node(0)
dummy.next ← head              // when editing an existing list
tail ← dummy                   // when building a new one
for each node you keep:
    tail.next ← node
    tail ← node
tail.next ← null
return dummy.next`,
      examples: [
        'linked-lists-merge-two-sorted',
        'linked-lists-remove-elements',
        'linked-lists-partition',
        'linked-lists-remove-duplicates-ii',
        'linked-lists-add-two-numbers',
      ],
    },
    {
      name: 'Fast & slow pointers',
      signals: [
        'Detect a loop, or find where it starts.',
        'Find the middle in one pass.',
        '"k-th from the end" (gap version: give one pointer a head start).',
        'O(1) extra memory is required.',
      ],
      template: `slow ← head
fast ← head
while fast ≠ null and fast.next ≠ null:
    slow ← slow.next
    fast ← fast.next.next
    if slow = fast: there is a loop
// no loop: slow is on the (second) middle`,
      examples: [
        'linked-lists-cycle',
        'linked-lists-middle',
        'linked-lists-cycle-start',
        'linked-lists-remove-nth-from-end',
      ],
    },
    {
      name: 'In-place reversal',
      signals: [
        '"Reverse", "swap nodes", "in groups of k", "in place".',
        'The task would be easy if you could walk the list backwards.',
        'Pairing the i-th node from the front with the i-th from the back (mirror trick: middle + reverse + walk).',
      ],
      template: `prev ← null
curr ← first
repeat k times (or while curr ≠ null):
    nxt ← curr.next
    curr.next ← prev
    prev ← curr
    curr ← nxt
first.next ← curr          // stitch, for partial reversals
before.next ← prev`,
      examples: [
        'linked-lists-reverse',
        'linked-lists-reverse-between',
        'linked-lists-swap-pairs',
        'linked-lists-reverse-k-group',
        'linked-lists-reorder',
        'linked-lists-palindrome',
        'linked-lists-twin-sum',
      ],
    },
    {
      name: 'Hash map + doubly linked list',
      signals: [
        'O(1) get and put, plus "least recently used" or "move to front".',
        'You need to find an item fast AND keep items in an order you change often.',
      ],
      template: `map ← key → node
head ⇄ … ⇄ tail                // sentinels, newest after head
on every use of node:
    remove(node)
    addFront(node)
when over capacity:
    lru ← tail.prev
    remove(lru)
    delete lru.key from map`,
      examples: ['linked-lists-lru-cache', 'linked-lists-browser-history'],
    },
  ],
  practice: [
    { title: 'Remove Duplicates from Sorted List', leetcode: 83, difficulty: 'easy', hint: 'Keep one copy: if `curr.next` has the same value, skip it and stay put.' },
    { title: 'Odd Even Linked List', leetcode: 328, difficulty: 'medium', hint: 'Two chains (odd positions, even positions) built as you walk, then glue odd → even.' },
    { title: 'Delete the Middle Node of a Linked List', leetcode: 2095, difficulty: 'medium', hint: 'You need the node *before* the middle: start `fast` one round ahead of `slow`.' },
    { title: 'Rotate List', leetcode: 61, difficulty: 'medium', hint: 'Use `k % length`, close the list into a ring, then cut it at the right spot.' },
    { title: 'Swapping Nodes in a Linked List', leetcode: 1721, difficulty: 'medium', hint: 'k-th from the front is easy; k-th from the end is the gap trick.' },
    { title: 'Split Linked List in Parts', leetcode: 725, difficulty: 'medium', hint: 'Count first. The first `length % k` parts get one extra node.' },
    { title: 'Merge In Between Linked Lists', leetcode: 1669, difficulty: 'medium', hint: 'Find the node before position a and the node after position b, then stitch two links.' },
    { title: 'Remove Nodes From Linked List', leetcode: 2487, difficulty: 'medium', hint: 'Reverse, keep a running max while deleting smaller nodes, reverse back.' },
    { title: 'Copy List with Random Pointer', leetcode: 138, difficulty: 'medium', hint: 'A map from old node to new node lets you wire `next` and `random` in a second pass.' },
    { title: 'Flatten a Multilevel Doubly Linked List', leetcode: 430, difficulty: 'medium', hint: 'When a node has a child, splice the whole child list in between the node and its next.' },
    { title: 'LFU Cache', leetcode: 460, difficulty: 'hard', hint: 'Stretch: one doubly linked list per use-count, plus a map from key to node and the current minimum count.' },
  ],
};

export default mod;
