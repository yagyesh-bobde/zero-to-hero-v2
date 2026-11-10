import type { Module } from '../types';
import matching from './06-stacks-queues.lesson-1';
import stackDesign from './06-stacks-queues.lesson-2';
import expressions from './06-stacks-queues.lesson-3';
import monotonicStack from './06-stacks-queues.lesson-4';
import queuesDeques from './06-stacks-queues.lesson-5';

const mod: Module = {
  id: 'stacks-queues',
  number: 6,
  part: 'linear',
  title: 'Stacks, queues & monotonic stacks',
  tagline: 'Last-in-first-out thinking for matching, undo, and next-greater problems.',
  draft: false,
  intro:
    'A stack remembers the most recent unfinished thing; a queue remembers the oldest. That one difference powers bracket checkers, undo buttons, calculators, browser history and rate limiters. After this module you can spot when a problem wants a stack, a queue or a deque, and solve classics like valid brackets, min stack, decode string, daily temperatures and sliding window maximum in one pass.',
  lessons: [matching, stackDesign, expressions, monotonicStack, queuesDeques],
  patterns: [
    {
      name: 'Stack: match or cancel the top',
      signals: [
        'Things must **nest** or close in order (brackets, tags, folders).',
        'A new item can **cancel the previous one** (backspace, `..`, equal neighbours, undo).',
        'You keep needing **the most recent unfinished** item.',
      ],
      template: `stack ← empty stack
for each item in input:
    if stack is not empty and item closes / cancels top of stack:
        pop from stack
    else:
        push item onto stack
// answer comes from what is left (or "is it empty?")`,
      examples: [
        'stacks-queues-valid-parentheses',
        'stacks-queues-remove-adjacent-duplicates',
        'stacks-queues-simplify-path',
      ],
    },
    {
      name: 'Stack of saved context (expressions)',
      signals: [
        'Operators use **earlier values** (RPN, calculators).',
        'Brackets open a **smaller job inside a bigger one** (`k[...]`, nested formulas).',
        '"Times before plus" without brackets: build a list of terms.',
      ],
      template: `stack ← empty stack
current ← fresh state
for each token:
    if token opens a scope:
        push current onto stack; current ← fresh state
    else if token closes a scope:
        current ← combine(pop from stack, current)
    else if token is an operator:
        b ← pop; a ← pop; push (a op b)
    else:
        update current / push value
return current (or the last value)`,
      examples: ['stacks-queues-eval-rpn', 'stacks-queues-decode-string', 'stacks-queues-basic-calculator'],
    },
    {
      name: 'Monotonic stack (next greater / smaller)',
      signals: [
        '"Next greater", "next warmer", "days until", "first bigger to the right".',
        'Each item needs the **nearest** item on one side that is bigger or smaller.',
        'Histogram / skyline areas: how far can a bar stretch?',
      ],
      template: `answer ← list of n defaults
stack ← empty stack                    // indexes still waiting
for i from 0 to n - 1:
    while stack is not empty and a[i] beats a[top of stack]:
        j ← pop from stack
        answer[j] ← a[i]               // or i - j
    push i onto stack`,
      examples: [
        'stacks-queues-daily-temperatures',
        'stacks-queues-next-greater-element',
        'stacks-queues-next-greater-circular',
        'stacks-queues-largest-rectangle',
      ],
    },
    {
      name: 'Queue / monotonic deque',
      signals: [
        'Items **expire** from the old end (time windows, rate limits, fixed-size buffers).',
        '"Max / min of every window of size k".',
        'First come, first served.',
      ],
      template: `deque ← empty deque                    // indexes
for i from 0 to n - 1:
    while front of deque is outside the window:
        deque.popFront()
    while back of deque can never beat a[i]:
        deque.popBack()
    deque.pushBack(i)
    the front is the best in the window`,
      examples: ['stacks-queues-recent-counter', 'stacks-queues-circular-queue', 'stacks-queues-sliding-window-max'],
    },
  ],
  practice: [
    { title: 'Removing Stars From a String', leetcode: 2390, difficulty: 'medium', hint: 'Each `*` is a backspace: it cancels the most recent letter.' },
    { title: 'Minimum Remove to Make Valid Parentheses', leetcode: 1249, difficulty: 'medium', hint: 'Push the **index** of each `(` so you know which ones to delete at the end.' },
    { title: 'Remove All Adjacent Duplicates in String II', leetcode: 1209, difficulty: 'medium', hint: 'Store `[letter, count]` on the stack instead of single letters.' },
    { title: 'Validate Stack Sequences', leetcode: 946, difficulty: 'medium', hint: 'Simulate it: push in order, and pop greedily whenever the top matches the next pop.' },
    { title: 'Implement Stack using Queues', leetcode: 225, difficulty: 'easy', hint: 'After each push, rotate the older items behind the new one.' },
    { title: 'Design Circular Deque', leetcode: 641, difficulty: 'medium', hint: 'Same ring buffer as the circular queue; moving the front back is `(head - 1 + k) % k`.' },
    { title: 'Basic Calculator', leetcode: 224, difficulty: 'hard', hint: 'On `(` push the running result and sign; on `)` pop and combine.' },
    { title: 'Remove K Digits', leetcode: 402, difficulty: 'medium', hint: 'A monotonic stack: pop a bigger digit when a smaller one arrives, while you still may remove.' },
    { title: 'Remove Duplicate Letters', leetcode: 316, difficulty: 'medium', hint: 'Like Remove K Digits, but only pop a letter if it appears again later.' },
    { title: 'Sum of Subarray Minimums', leetcode: 907, difficulty: 'medium', hint: 'For each value, count the subarrays where it is the minimum: previous and next smaller.' },
    { title: 'Maximal Rectangle', leetcode: 85, difficulty: 'hard', hint: 'Turn each row into a histogram of heights and reuse the largest rectangle trick.' },
    { title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', leetcode: 1438, difficulty: 'medium', hint: 'Keep two monotonic deques: one for the window max, one for the min.' },
  ],
};

export default mod;
