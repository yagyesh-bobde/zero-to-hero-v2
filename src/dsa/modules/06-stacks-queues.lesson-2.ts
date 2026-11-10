import type { Lesson } from '../types';

// Module 6, lesson 2: designing data structures out of stacks.
const lesson: Lesson = {
  id: 'stack-design',
  title: 'Designing with stacks',
  summary: 'Give each stack slot a memory, or put two stacks back to back.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The lightest crate in the truck',
      text: 'A delivery truck is loaded with crates in one tall pile. Workers can only add or take the top crate. Every few minutes the manager shouts: "What is the lightest crate in the pile right now?" Lifting every crate to check takes forever. Can the pile answer instantly?',
    },
    {
      kind: 'text',
      text: '**The problem.** Build a stack with four operations, all **O(1)**: `push(x)`, `pop()`, `top()` and `getMin()` (the smallest value currently in the stack). This is a **design** problem: you write a class, not one function.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: scan for the minimum',
      code: `function getMin():
    best ← +∞
    for each x in stack:
        best ← min(best, x)
    return best                    // O(n) every single call`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** When a crate goes on the pile, the minimum of everything **below** it is already fixed. Nothing under it can change while it sits there, because you can only touch the top. So each slot can remember one extra number: "the smallest value from here down". We work it out once, on push, and never again.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Store the answer next to each item',
      text: 'Push a pair `[value, minSoFar]`, where `minSoFar = min(value, min stored in the slot below)`. Then `getMin()` just reads the top pair. When you pop, the slot below already knows its own minimum. No rescanning, ever.',
    },
    {
      kind: 'steps',
      title: 'Min stack: each cell is "value, min so far" (bottom → top)',
      frames: [
        { cells: ['5,5'], active: [0], vars: { getMin: 5 }, note: '`push(5)`. The stack was empty, so the min so far is 5.' },
        { cells: ['5,5', '3,3'], active: [1], vars: { getMin: 3 }, note: '`push(3)`. min(3, 5) = 3. Store 3 next to it.' },
        { cells: ['5,5', '3,3', '7,3'], active: [2], vars: { getMin: 3 }, note: '`push(7)`. min(7, 3) = 3. The 7 remembers that 3 is still below it.' },
        { cells: ['5,5', '3,3', '7,3', '2,2'], active: [3], vars: { getMin: 2 }, note: '`push(2)`. New smallest: 2.' },
        { cells: ['5,5', '3,3', '7,3', '2,2'], found: [3], vars: { getMin: 2 }, note: '`getMin()` reads the min part of the top cell: 2. No scan.' },
        { cells: ['5,5', '3,3', '7,3'], found: [2], vars: { getMin: 3 }, note: '`pop()` removes 2. The new top already knows the min is 3.' },
        { cells: ['5,5', '3,3'], found: [1], vars: { getMin: 3 }, note: '`pop()` removes 7. Still 3, read straight from the top.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Min stack',
      code: `class MinStack:
    items ← empty stack                // holds pairs [value, minSoFar]

    push(x):
        if items is empty: m ← x
        else: m ← min(x, top of items.minSoFar)
        push [x, m] onto items

    pop():    pop from items
    top():    return top of items.value
    getMin(): return top of items.minSoFar`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `class MinStack {
  constructor() {
    this.items = []; // [value, minSoFar]
  }
  push(x) {
    const m = this.items.length ? Math.min(x, this.getMin()) : x;
    this.items.push([x, m]);
  }
  pop() {
    this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1][0];
  }
  getMin() {
    return this.items[this.items.length - 1][1];
  }
}`,
    },
    {
      kind: 'text',
      text: '**Second design: a queue from two stacks.** A **queue** is a line at a shop: first in, first out (**FIFO**). You add at the back and serve from the front. Can you build one using only stacks? Yes. Keep an `inbox` stack for new items and an `outbox` stack for serving. When the outbox is empty, pour the whole inbox into it. Pouring flips the order, so the **oldest** item lands on top of the outbox.',
    },
    {
      kind: 'trace',
      title: 'Queue from two stacks (bottom → top)',
      columns: ['op', 'inbox', 'outbox', 'returns'],
      rows: [
        ['push(1)', '1', '', '-'],
        ['push(2)', '1 2', '', '-'],
        ['push(3)', '1 2 3', '', '-'],
        ['pop()', '', '3 2', '1 (poured, then popped)'],
        ['push(4)', '4', '3 2', '-'],
        ['pop()', '4', '3', '2 (outbox not empty: no pour)'],
        ['peek()', '4', '3', '3'],
      ],
      note: 'Each item is poured at most once in its life, so a long run of operations costs O(1) each **on average**. That average-over-many-operations cost is called **amortized** O(1).',
    },
    {
      kind: 'compare',
      title: 'Designs in this lesson',
      rows: [
        { approach: 'Min stack, scan on getMin', time: 'O(n) getMin', space: 'O(n)', note: 'Simple, but slow when getMin is called a lot.' },
        { approach: 'Min stack, pair per slot', time: 'O(1) all', space: 'O(n)', note: 'Each slot stores the min from itself down.' },
        { approach: 'Queue with array `shift()`', time: 'O(n) pop', space: 'O(n)', note: '`shift()` moves every element left by one.' },
        { approach: 'Queue from two stacks', time: 'O(1) amortized', space: 'O(n)', note: 'Each item is pushed, poured and popped once.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** When a design needs a fast question about "everything currently in the stack" (min, max, sum), store the answer **inside each slot** at push time. When you need to **reverse** the order of service, or move back and forth like a browser, use **two stacks**: one for each direction.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: two stacks back to back',
      code: `inbox ← empty stack
outbox ← empty stack

add(x):   push x onto inbox
take():
    if outbox is empty:
        while inbox is not empty:
            push (pop from inbox) onto outbox   // flips the order
    return pop from outbox`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'How design problems are tested here',
      text: 'Each design problem gives you a class and a small runner function that is already written. The tests call the runner with a list of operations like `[["push", 3], ["getMin"]]`. It returns one output per operation, with `null` for operations that return nothing. You only fill in the class.',
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Only pour when the outbox is empty',
      text: 'If you pour the inbox on every `pop`, newer items land on top of older ones in the outbox and the order breaks. Pour **only** when the outbox is empty. A popular min stack variant uses a second stack that only holds minimums. Push onto it when `x ≤` its top (not `<`), or a repeated minimum is lost on the first pop.',
    },
  ],
  problems: [
    {
      id: 'stacks-queues-min-stack',
      title: 'Stack That Knows Its Minimum',
      difficulty: 'medium',
      leetcode: 155,
      pattern: 'Stack with extra memory per slot',
      statement:
        'Build the crate pile from the lesson: a `MinStack` class with `push(x)`, `pop()`, `top()` and `getMin()`, **each in O(1)**. `pop`, `top` and `getMin` are only called when the stack is not empty. **Testing:** the runner `runMinStack(ops)` is already written. It gets a list of operations like `[["push", 3], ["getMin"], ["pop"]]` and returns one output per operation, `null` for `push` and `pop`.',
      examples: [
        {
          input: 'ops = [["push",-2],["push",0],["push",-3],["getMin"],["pop"],["top"],["getMin"]]',
          output: '[null,null,null,-3,null,0,-2]',
          explain: 'After popping -3, the top is 0 and the smallest left is -2.',
        },
      ],
      constraints: ['-2³¹ ≤ x ≤ 2³¹ - 1', 'up to 3 · 10⁴ operations'],
      hints: [
        'While an item sits in the stack, can the minimum of the items **below** it change?',
        'No. So work out that minimum once, when you push, and keep it.',
        'Push pairs `[x, min(x, minBelow)]`. `getMin` reads the second half of the top pair.',
      ],
      approaches: [
        {
          name: 'Plain stack, scan for min',
          idea: 'Store values only. On `getMin`, loop over the whole array. Correct, but O(n) per call.',
          time: 'O(n) getMin, O(1) others',
          space: 'O(n)',
        },
        {
          name: 'Pair per slot',
          idea: 'Items below the top cannot change, so their minimum is fixed. Each slot stores `[value, min from here down]`. Popping reveals a slot that already knows its own answer.',
          pseudo: `push(x):
    m ← x if items is empty, else min(x, top of items.min)
    push [x, m] onto items
pop():    pop from items
top():    return top of items.value
getMin(): return top of items.min`,
          code: `class MinStack {
  constructor() {
    this.items = [];
  }
  push(x) {
    const m = this.items.length ? Math.min(x, this.getMin()) : x;
    this.items.push([x, m]);
  }
  pop() {
    this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1][0];
  }
  getMin() {
    return this.items[this.items.length - 1][1];
  }
}`,
          time: 'O(1) every operation',
          space: 'O(n)',
        },
      ],
      fn: 'runMinStack',
      starter: `class MinStack {
  constructor() {
    // your state here
  }
  push(x) {}
  pop() {}
  top() {}
  getMin() {}
}

// Already written: runs the test operations. Leave it as is.
function runMinStack(ops) {
  const s = new MinStack();
  return ops.map(([op, arg]) => {
    const out = s[op](arg);
    return out === undefined ? null : out;
  });
}`,
      solution: `class MinStack {
  constructor() {
    this.items = [];
  }
  push(x) {
    const m = this.items.length ? Math.min(x, this.getMin()) : x;
    this.items.push([x, m]);
  }
  pop() {
    this.items.pop();
  }
  top() {
    return this.items[this.items.length - 1][0];
  }
  getMin() {
    return this.items[this.items.length - 1][1];
  }
}

function runMinStack(ops) {
  const s = new MinStack();
  return ops.map(([op, arg]) => {
    const out = s[op](arg);
    return out === undefined ? null : out;
  });
}`,
      tests: [
        {
          name: 'example',
          args: [[['push', -2], ['push', 0], ['push', -3], ['getMin'], ['pop'], ['top'], ['getMin']]],
          expected: [null, null, null, -3, null, 0, -2],
        },
        { name: 'single item', args: [[['push', 7], ['top'], ['getMin']]], expected: [null, 7, 7] },
        {
          name: 'duplicate minimum',
          args: [[['push', 1], ['push', 1], ['pop'], ['getMin']]],
          expected: [null, null, null, 1],
        },
        {
          name: 'rising values',
          args: [[['push', 1], ['push', 2], ['push', 3], ['getMin'], ['pop'], ['getMin'], ['top']]],
          expected: [null, null, null, 1, null, 1, 2],
        },
        {
          name: 'falling values',
          args: [[['push', 3], ['push', 2], ['push', 1], ['getMin'], ['pop'], ['getMin'], ['pop'], ['getMin']]],
          expected: [null, null, null, 1, null, 2, null, 3],
        },
        {
          name: 'empty then refill',
          args: [[['push', 5], ['pop'], ['push', 9], ['getMin'], ['top']]],
          expected: [null, null, null, 9, 9],
        },
        {
          name: 'big negatives',
          args: [[['push', -2147483648], ['push', 2147483647], ['getMin'], ['top']]],
          expected: [null, null, -2147483648, 2147483647],
        },
      ],
      takeaway: 'If the answer for "everything below" cannot change, store it in the slot at push time.',
    },
    {
      id: 'stacks-queues-queue-from-stacks',
      title: 'A Queue Made of Two Stacks',
      difficulty: 'easy',
      leetcode: 232,
      pattern: 'Two stacks back to back',
      statement:
        'Your toy language only has stacks (push to top, pop from top, peek at top, check empty). Build a first-in-first-out `MyQueue` with `push(x)` (add to the back), `pop()` (remove and return the front), `peek()` (return the front) and `empty()`. `pop` and `peek` are only called on a non-empty queue. Aim for **amortized O(1)** per operation. **Testing:** the runner `runMyQueue(ops)` is already written. It runs a list like `[["push", 1], ["peek"], ["empty"]]` and returns one output per operation, `null` for `push`.',
      examples: [
        {
          input: 'ops = [["push",1],["push",2],["peek"],["pop"],["empty"]]',
          output: '[null,null,1,1,false]',
        },
      ],
      constraints: ['1 ≤ x ≤ 9', 'up to 100 operations'],
      hints: [
        'Pouring one stack into another reverses the order. Is reversed order useful?',
        'Push to an `inbox`. Serve from an `outbox`. After a pour, the oldest item is on top of the outbox.',
        'Pour only when the outbox is empty. Otherwise you put new items on top of old ones.',
      ],
      approaches: [
        {
          name: 'Pour both ways every time',
          idea: 'Keep everything in one stack. To pop the front, pour all into a helper stack, pop, then pour back. Correct, but every pop moves all n items twice.',
          time: 'O(n) per pop',
          space: 'O(n)',
        },
        {
          name: 'Inbox + outbox, lazy pour',
          idea: 'Items wait in the inbox until the outbox runs dry. One pour flips them so the oldest is on top. Every item is pushed once, poured once, popped once: O(1) amortized.',
          pseudo: `push(x): push x onto inbox
moveIfNeeded():
    if outbox is empty:
        while inbox is not empty:
            push (pop from inbox) onto outbox
pop():   moveIfNeeded(); return pop from outbox
peek():  moveIfNeeded(); return top of outbox
empty(): return inbox is empty and outbox is empty`,
          code: `class MyQueue {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  push(x) {
    this.inbox.push(x);
  }
  move() {
    if (this.outbox.length === 0) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  pop() {
    this.move();
    return this.outbox.pop();
  }
  peek() {
    this.move();
    return this.outbox[this.outbox.length - 1];
  }
  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}`,
          time: 'O(1) amortized',
          space: 'O(n)',
        },
      ],
      fn: 'runMyQueue',
      starter: `class MyQueue {
  constructor() {
    // use only stack moves on arrays: push, pop, look at the last item, length
  }
  push(x) {}
  pop() {}
  peek() {}
  empty() {}
}

// Already written: runs the test operations. Leave it as is.
function runMyQueue(ops) {
  const q = new MyQueue();
  return ops.map(([op, arg]) => {
    const out = q[op](arg);
    return out === undefined ? null : out;
  });
}`,
      solution: `class MyQueue {
  constructor() {
    this.inbox = [];
    this.outbox = [];
  }
  push(x) {
    this.inbox.push(x);
  }
  move() {
    if (this.outbox.length === 0) {
      while (this.inbox.length) this.outbox.push(this.inbox.pop());
    }
  }
  pop() {
    this.move();
    return this.outbox.pop();
  }
  peek() {
    this.move();
    return this.outbox[this.outbox.length - 1];
  }
  empty() {
    return this.inbox.length === 0 && this.outbox.length === 0;
  }
}

function runMyQueue(ops) {
  const q = new MyQueue();
  return ops.map(([op, arg]) => {
    const out = q[op](arg);
    return out === undefined ? null : out;
  });
}`,
      tests: [
        { name: 'example', args: [[['push', 1], ['push', 2], ['peek'], ['pop'], ['empty']]], expected: [null, null, 1, 1, false] },
        { name: 'new queue is empty', args: [[['empty']]], expected: [true] },
        {
          name: 'push between pops',
          args: [[['push', 1], ['push', 2], ['push', 3], ['pop'], ['push', 4], ['pop'], ['pop'], ['pop'], ['empty']]],
          expected: [null, null, null, 1, null, 2, 3, 4, true],
        },
        { name: 'one item in and out', args: [[['push', 9], ['pop'], ['empty']]], expected: [null, 9, true] },
        {
          name: 'peek does not remove',
          args: [[['push', 5], ['push', 6], ['peek'], ['peek'], ['pop'], ['peek']]],
          expected: [null, null, 5, 5, 5, 6],
        },
        {
          name: 'refill after empty',
          args: [[['push', 1], ['pop'], ['push', 2], ['push', 3], ['pop'], ['empty']]],
          expected: [null, 1, null, null, 2, false],
        },
      ],
      takeaway: 'Two stacks back to back make a queue: pour only when the outbox is empty.',
    },
    {
      id: 'stacks-queues-browser-history',
      title: 'Back and Forward Buttons',
      difficulty: 'medium',
      leetcode: 1472,
      pattern: 'Two stacks (or array + pointer)',
      statement:
        'Build the history for a one-tab browser. It starts on `homepage`. `visit(url)` opens a new page and **wipes all forward history**. `back(steps)` goes back up to `steps` pages (stop at the first page) and returns the page you land on. `forward(steps)` goes forward up to `steps` pages (stop at the newest) and returns the page you land on. **Testing:** the runner `runBrowserHistory(homepage, ops)` is already written. It runs a list like `[["visit", "a.com"], ["back", 1]]` and returns one output per operation, `null` for `visit`.',
      examples: [
        {
          input: 'homepage = "home", ops = [["visit","a"],["visit","b"],["back",1],["visit","c"],["forward",1],["back",5]]',
          output: '[null,null,"a",null,"c","home"]',
          explain: 'Visiting `c` from `a` wipes `b`, so forward has nowhere to go. `back(5)` stops at `home`.',
        },
      ],
      constraints: ['1 ≤ steps ≤ 100', 'up to 5000 operations'],
      hints: [
        'Going back and then forward is like undo and redo. What holds undo history?',
        'Two stacks work: pages behind you, and pages ahead of you. A visit empties the "ahead" stack.',
        'Even simpler: one array, an index `cur` for where you are, and `last` for the newest valid page. `visit` writes at `cur + 1` and sets `last = cur`.',
      ],
      approaches: [
        {
          name: 'Two stacks',
          idea: 'The `back` stack holds the pages behind you with the current page on top. `forward` holds pages ahead. Going back moves pages from one stack to the other, one by one. A visit clears `forward`.',
          time: 'O(steps) per back/forward',
          space: 'O(n)',
        },
        {
          name: 'Array + pointer',
          idea: 'Keep every page in one array. `cur` is where you are, `last` is the newest page that still counts. Back and forward just move `cur` and clamp it; a visit overwrites the slot after `cur` and cuts off everything after it by moving `last`.',
          pseudo: `init(homepage):
    pages ← [homepage]; cur ← 0; last ← 0
visit(url):
    cur ← cur + 1
    pages[cur] ← url
    last ← cur                       // forward history is gone
back(steps):
    cur ← max(0, cur - steps)
    return pages[cur]
forward(steps):
    cur ← min(last, cur + steps)
    return pages[cur]`,
          code: `class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.cur = 0;
    this.last = 0;
  }
  visit(url) {
    this.cur++;
    this.pages[this.cur] = url;
    this.last = this.cur;
  }
  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.pages[this.cur];
  }
  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.pages[this.cur];
  }
}`,
          time: 'O(1) every operation',
          space: 'O(n)',
        },
      ],
      fn: 'runBrowserHistory',
      starter: `class BrowserHistory {
  constructor(homepage) {
    // your state here
  }
  visit(url) {}
  back(steps) {}
  forward(steps) {}
}

// Already written: runs the test operations. Leave it as is.
function runBrowserHistory(homepage, ops) {
  const b = new BrowserHistory(homepage);
  return ops.map(([op, arg]) => {
    const out = b[op](arg);
    return out === undefined ? null : out;
  });
}`,
      solution: `class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.cur = 0;
    this.last = 0;
  }
  visit(url) {
    this.cur++;
    this.pages[this.cur] = url;
    this.last = this.cur;
  }
  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.pages[this.cur];
  }
  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.pages[this.cur];
  }
}

function runBrowserHistory(homepage, ops) {
  const b = new BrowserHistory(homepage);
  return ops.map(([op, arg]) => {
    const out = b[op](arg);
    return out === undefined ? null : out;
  });
}`,
      tests: [
        {
          name: 'example',
          args: ['home', [['visit', 'a'], ['visit', 'b'], ['back', 1], ['visit', 'c'], ['forward', 1], ['back', 5]]],
          expected: [null, null, 'a', null, 'c', 'home'],
        },
        { name: 'back on first page', args: ['home', [['back', 1]]], expected: ['home'] },
        { name: 'forward with nothing ahead', args: ['home', [['visit', 'a'], ['forward', 3]]], expected: [null, 'a'] },
        {
          name: 'back then forward',
          args: ['h', [['visit', 'a'], ['visit', 'b'], ['visit', 'c'], ['back', 2], ['forward', 1], ['forward', 9]]],
          expected: [null, null, null, 'a', 'b', 'c'],
        },
        {
          name: 'visit wipes forward',
          args: ['h', [['visit', 'a'], ['visit', 'b'], ['back', 2], ['visit', 'x'], ['forward', 1], ['back', 1]]],
          expected: [null, null, 'h', null, 'x', 'h'],
        },
        {
          name: 'leetcode-style run',
          args: [
            'leetcode.com',
            [
              ['visit', 'google.com'], ['visit', 'facebook.com'], ['visit', 'youtube.com'], ['back', 1], ['back', 1],
              ['forward', 1], ['visit', 'linkedin.com'], ['forward', 2], ['back', 2], ['back', 7],
            ],
          ],
          expected: [null, null, null, 'facebook.com', 'google.com', 'facebook.com', null, 'linkedin.com', 'google.com', 'leetcode.com'],
        },
      ],
      takeaway: 'Back/forward is undo/redo: two stacks, or one array with a cursor and an end marker.',
    },
  ],
  quiz: [
    {
      prompt: 'In the pair-per-slot min stack, why is it safe to compute the min once, at push time?',
      options: [
        'Because values in a stack are always sorted.',
        'Because nothing below an item can change while that item is still in the stack.',
        'Because getMin is only called once.',
      ],
      answer: 1,
      explanation: 'You can only touch the top. Everything underneath is frozen until the top is popped, so its minimum is frozen too.',
    },
    {
      prompt: 'Queue from two stacks: the outbox holds `[3, 2]` (top is 2) and the inbox holds `[4]`. What does `pop()` return?',
      options: ['4', '3', '2'],
      answer: 2,
      explanation: 'The outbox is not empty, so no pour. Pop its top: 2, the oldest item still waiting.',
    },
    {
      prompt: 'What does "amortized O(1)" mean?',
      options: [
        'Every single call is O(1).',
        'Some calls may be slow, but averaged over many calls each costs O(1).',
        'It is O(1) only for small inputs.',
      ],
      answer: 1,
      explanation: 'A single pour can move many items, but each item is poured only once, so the total over n operations is O(n).',
    },
  ],
  takeaways: [
    'For "min/max of everything in the stack", store it in each slot when you push.',
    'Two stacks back to back turn LIFO into FIFO; pour only when the outbox is empty.',
    'Design problems here are tested with a list of operations and a list of outputs.',
  ],
};

export default lesson;
