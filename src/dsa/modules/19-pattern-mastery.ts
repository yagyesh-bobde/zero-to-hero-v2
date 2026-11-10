import type { Module } from '../types';
import signals from './19-pattern-mastery.lesson-1';
import mixedArrays from './19-pattern-mastery.lesson-2';
import mixedGrids from './19-pattern-mastery.lesson-3';
import playbook from './19-pattern-mastery.lesson-4';
import mockA from './19-pattern-mastery.lesson-5';
import mockB from './19-pattern-mastery.lesson-6';

// Module 19. Owner: Content J. Lessons live in 19-pattern-mastery.lesson-N.ts.
const mod: Module = {
  id: 'pattern-mastery',
  number: 19,
  part: 'mastery',
  title: 'Pattern recognition & interview playbook',
  tagline: 'Mixed problems: spot the pattern from the statement and solve under time pressure.',
  draft: false,
  intro:
    'In every earlier module you knew the pattern before you read the problem. In a real interview nobody tells you. ' +
    'This module trains the missing skill: read a statement, notice the **signals** (sorted input? "longest substring"? a grid? "minimum steps"?) ' +
    'and pick the right tool in under two minutes. You get a signals → pattern guide for all 18 modules, mixed sets where the pattern is hidden, ' +
    'a playbook for talking, testing and timing a 45-minute interview, and four mock interviews to put it all together.',
  lessons: [signals, mixedArrays, mixedGrids, playbook, mockA, mockB],
  patterns: [
    {
      name: 'Pattern triage (signals → pattern)',
      signals: [
        'You do not know where to start, or the problem does not name a technique.',
        'Read three things in order: the **size limit** (sets the target speed), the **input shape**, and **what is asked**.',
        'If two patterns both fit, the size limit usually picks one.',
      ],
      template: `function triage(problem):
    target ← speed allowed by the size limit     // n ≤ 10⁵ → O(n log n) or O(n)
    shape ← input shape                          // sorted? string? grid? tree? edges?
    ask ← what is asked                          // count? longest? min steps? all options?
    candidates ← 2 patterns that match shape and ask
    if brute force meets target:
        return brute force                       // tiny n: just write it
    for each p in candidates:
        if p meets target and works on a tiny example:
            return p
    return "find the repeated work in brute force"`,
      examples: [
        'pattern-mastery-sort-by-frequency',
        'pattern-mastery-peak-element',
        'pattern-mastery-fruit-baskets',
        'pattern-mastery-sums-divisible-by-k',
        'pattern-mastery-flip-k-zeros',
      ],
    },
    {
      name: 'Grid: search backwards from the border',
      signals: [
        'A grid where a cell is "safe" or "good" only if it can reach the edge (or some target).',
        'Checking every cell on its own repeats the same search again and again.',
        'Flip it: start from the edge cells and mark everything they can reach.',
      ],
      template: `function fromBorder(grid):
    stack ← every border cell that qualifies
    mark each of them as reached
    while stack is not empty:
        (r, c) ← pop from stack
        for each (dr, dc) in four directions:
            (nr, nc) ← (r + dr, c + dc)
            if (nr, nc) inside grid and not reached and edge allowed:
                mark (nr, nc) as reached
                push (nr, nc) onto stack
    return reached cells`,
      examples: ['pattern-mastery-surrounded-regions', 'pattern-mastery-pacific-atlantic'],
    },
    {
      name: 'Sweep with a stack (things that merge or cancel)',
      signals: [
        'Items arrive in order and a new item can **wipe out** or **swallow** earlier ones.',
        'Words like "collide", "catch up and join", "how many days back".',
        'Sometimes you must sort first (by position or time) to get the right order.',
      ],
      template: `function sweep(items):
    stack ← empty
    for each x in items:                      // sort items first if order matters
        while stack is not empty and x beats top of stack:
            pop from stack                    // x merges or cancels it
        if x survives:
            push x onto stack
    return stack`,
      examples: ['pattern-mastery-asteroid-collision', 'pattern-mastery-car-fleet', 'pattern-mastery-stock-span'],
    },
    {
      name: 'The 45-minute interview loop',
      signals: [
        'Any live coding interview or timed practice round.',
        'You feel the urge to start typing in the first two minutes (don’t).',
      ],
      template: `function interview(problem):
    ask clarifying questions                  // size, empty, duplicates, negatives
    work 2 examples by hand
    say the brute force and its cost
    find the repeated work, name the pattern
    agree on the plan with the interviewer
    write the code, talking as you go
    dry-run a tiny input line by line
    test edge cases: empty, one item, all same
    state final time and space`,
      examples: ['pattern-mastery-find-duplicate', 'pattern-mastery-two-city', 'pattern-mastery-evaluate-division'],
    },
  ],
  practice: [
    { title: 'Rotate Image', leetcode: 48, difficulty: 'medium', hint: 'A 90° turn is two simple flips. Which two?' },
    { title: 'Set Matrix Zeroes', leetcode: 73, difficulty: 'medium', hint: 'For O(1) space, can the matrix itself remember which rows and columns to clear?' },
    { title: 'Max Number of K-Sum Pairs', leetcode: 1679, difficulty: 'medium', hint: 'For each number x, which partner does it need? How do you find it fast and use each number only once?' },
    { title: 'Frequency of the Most Frequent Element', leetcode: 1838, difficulty: 'medium', hint: 'Which numbers are cheapest to raise up to a given value? If the array were sorted, where would they sit?' },
    { title: 'Successful Pairs of Spells and Potions', leetcode: 2300, difficulty: 'medium', hint: 'For one spell, which potions work? If the potions were sorted, where would those sit?' },
    { title: 'Remove All Adjacent Duplicates in String II', leetcode: 1209, difficulty: 'medium', hint: 'Deleting a run can make two runs meet. What do you need to remember about the characters just before?' },
    { title: 'As Far from Land as Possible', leetcode: 1162, difficulty: 'medium', hint: 'Searching outward from every water cell repeats work. What if you start from the other side?' },
    { title: 'House Robber III', leetcode: 337, difficulty: 'medium', hint: 'What two answers would a parent house like to hear from each child?' },
    { title: 'Perfect Squares', leetcode: 279, difficulty: 'medium', hint: '"Fewest pieces that add to n" — the same shape as making change with coins.' },
    { title: 'Path with Maximum Probability', leetcode: 1514, difficulty: 'medium', hint: 'Multiplying by a probability can only shrink the total, just like adding a positive cost. Which search relies on that?' },
  ],
};

export default mod;
