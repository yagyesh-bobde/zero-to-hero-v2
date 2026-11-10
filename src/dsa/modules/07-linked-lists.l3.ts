import type { Lesson } from '../types';

// Module 7, lesson 3: in-place reversal (whole list, a sub-range, pairs, k-groups).
const lesson: Lesson = {
  id: 'reversal',
  title: 'In-place reversal',
  summary: 'Flip the arrows with three pointers: whole lists, a slice, pairs, blocks of k.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Newest message first',
      text: "A chat app keeps a conversation as a linked list, oldest message first. The design team now wants \"newest on top\". The chat has two million messages and runs on a cheap phone, so making a second copy of the list is not an option. You must turn the list around **using the nodes you already have**.",
    },
    {
      kind: 'text',
      text: "**The problem.** Reverse `1 → 2 → 3 → 4` into `4 → 3 → 2 → 1` and return the new head. Only O(1) extra memory.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: copy into a stack',
      code: `function reverseBrute(head):
    stack ← empty stack
    for each node in the list:
        push node.val onto stack
    for each node in the list:          // second walk
        node.val ← pop from stack       // write values back reversed
    return head`,
    },
    {
      kind: 'text',
      text: "O(n) time, but **O(n)** extra memory for the stack, and it changes values instead of links (many problems forbid that: a node can carry much more than a number).",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** All the nodes are already where they need to be in memory. The only thing wrong is the *direction of the arrows*. So don't move data: walk the list once and flip each arrow as you pass it.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Three pointers: prev, curr, nxt',
      text: "At each node: (1) **save** `nxt = curr.next`, because you are about to overwrite it, (2) **flip** `curr.next = prev`, (3) **step** `prev = curr`, `curr = nxt`. When `curr` becomes null, `prev` is the old tail, which is the new head.",
    },
    {
      kind: 'steps',
      title: 'Reverse 1 → 2 → 3 → 4 (each cell shows which way its arrow points)',
      frames: [
        { cells: ['∅', '1→', '2→', '3→', '4→', '∅'], pointers: { prev: 0, curr: 1 }, vars: { reversed: '∅', 'still to do': '1→2→3→4→∅' }, note: 'Start: `prev` = null, `curr` = head. Every arrow points right.' },
        { cells: ['∅', '1→', '2→', '3→', '4→', '∅'], pointers: { prev: 0, curr: 1, nxt: 2 }, active: [1], vars: { reversed: '∅', 'still to do': '1→2→3→4→∅' }, note: 'Save `nxt = curr.next` first. Without it, 2, 3, 4 would be lost the moment we flip.' },
        { cells: ['∅', '←1', '2→', '3→', '4→', '∅'], pointers: { prev: 1, curr: 2 }, active: [2], vars: { reversed: '1→∅', 'still to do': '2→3→4→∅' }, note: "Flip 1's arrow to point at `prev` (null). Step: `prev` = 1, `curr` = 2." },
        { cells: ['∅', '←1', '←2', '3→', '4→', '∅'], pointers: { prev: 2, curr: 3 }, active: [3], vars: { reversed: '2→1→∅', 'still to do': '3→4→∅' }, note: 'Same three moves: save, flip 2 → 1, step.' },
        { cells: ['∅', '←1', '←2', '←3', '4→', '∅'], pointers: { prev: 3, curr: 4 }, active: [4], vars: { reversed: '3→2→1→∅', 'still to do': '4→∅' }, note: 'Flip 3 → 2. The reversed part grows by one node each step.' },
        { cells: ['∅', '←1', '←2', '←3', '←4', '∅'], pointers: { prev: 4, curr: 5 }, found: [4], vars: { reversed: '4→3→2→1→∅', 'still to do': '∅' }, note: '`curr` is null: stop. `prev` (4) is the new head.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Reverse a whole list',
      code: `function reverseList(head):
    prev ← null
    curr ← head
    while curr ≠ null:
        nxt ← curr.next          // 1. save the rest
        curr.next ← prev         // 2. flip the arrow
        prev ← curr              // 3. step forward
        curr ← nxt
    return prev                  // old tail = new head`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'The recursive version (for later)',
      text: "\"Reverse everything after me, then make my next node point back at me\": `newHead = reverse(head.next); head.next.next = head; head.next = null`. Pretty, but each call waits on the call stack, so it uses **O(n)** memory and can overflow on huge lists. Module 8 teaches recursion properly.",
    },
    {
      kind: 'compare',
      title: 'Reversing a list',
      rows: [
        { approach: 'Copy values to a stack', time: 'O(n)', space: 'O(n)', note: 'Moves data, not links. Often not allowed.' },
        { approach: 'Recursion', time: 'O(n)', space: 'O(n)', note: 'Short code; the call stack is the hidden cost.' },
        { approach: 'Three pointers', time: 'O(n)', space: 'O(1)', note: 'The one to know by heart.' },
      ],
    },
    {
      kind: 'text',
      text: "**Reversing only part of a list.** Real problems rarely want the whole thing flipped. They want positions 2 to 4, or every pair, or every block of k. Same three-pointer loop, plus two extra links to stitch the flipped block back in:",
    },
    {
      kind: 'diagram',
      title: 'Reverse positions 2..4 of 1 → 2 → 3 → 4 → 5',
      art: `dummy → 1 → 2 → 3 → 4 → 5
        ↑
      before

run the plain loop for 3 nodes, starting at 2:
        1    4 → 3 → 2 → null    5
        ↑    ↑       ↑           ↑
     before prev   first        curr

stitch it back with two links:
   first.next  ← curr     (2 → 5)
   before.next ← prev     (1 → 4)

dummy → 1 → 4 → 3 → 2 → 5`,
      caption: "`first` is the block's old first node; after flipping it is the block's **last** node. The dummy covers blocks that start at the head.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: reverse k nodes and stitch them back',
      code: `// before = the node just before the block (often a dummy)
first ← before.next
prev ← null
curr ← first
repeat k times:
    nxt ← curr.next
    curr.next ← prev
    prev ← curr
    curr ← nxt
first.next ← curr          // block's new tail → rest of list
before.next ← prev         // node before → block's new head
// next block (if any) starts after: before ← first`,
    },
    {
      kind: 'text',
      text: "**Signals.** \"Reverse\", \"in place\", \"O(1) extra space\", \"swap nodes\", \"in groups of k\", or any task that would be easy if you could walk the list *backwards*. Lesson 4 uses that last one a lot.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Save before you flip',
      text: "If you write `curr.next = prev` before saving `curr.next`, the rest of the list is gone: nothing points to it anymore. Always save `nxt` first. For partial reversals, the classic bug is forgetting the stitch: the block's old first node still points into the block, which makes a loop or chops off the tail.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-reverse',
      title: 'Newest message first',
      difficulty: 'easy',
      leetcode: 206,
      pattern: 'In-place reversal',
      statement: 'Reverse a linked list by re-pointing its links and return the new head. Use O(1) extra memory.',
      examples: [
        { input: '1 → 2 → 3 → 4 → 5', output: '5 → 4 → 3 → 2 → 1' },
        { input: 'empty', output: 'empty' },
      ],
      constraints: ['0 ≤ n ≤ 5000'],
      hints: [
        'You do not need to move any node. Only the arrows point the wrong way.',
        'At each node you need three things: the node before it, the node itself, and the node after it.',
        'Save `nxt = curr.next`, set `curr.next = prev`, then move `prev` and `curr` one step. Return `prev`.',
      ],
      approaches: [
        {
          name: 'Stack of values',
          idea: 'Push every value, then walk again and pop them back in. Uses O(n) memory and changes values, not links.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Recursion',
          idea: 'Reverse the rest of the list, then hook the node after you back to you and cut your own `next`.',
          code: `function reverseList(head) {
  if (!head || !head.next) return head;
  const newHead = reverseList(head.next);
  head.next.next = head;
  head.next = null;
  return newHead;
}`,
          time: 'O(n)',
          space: 'O(n) call stack',
        },
        {
          name: 'Three pointers',
          idea: 'Walk once. Everything behind `curr` is already reversed and starts at `prev`. Each step moves one node from the "to do" side to the reversed side.',
          pseudo: `function reverseList(head):
    prev ← null
    curr ← head
    while curr ≠ null:
        nxt ← curr.next
        curr.next ← prev
        prev ← curr
        curr ← nxt
    return prev`,
          code: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'reverseList',
      starter: `function reverseList(head) {
  // Your code here: reverse the links, return the new head.
  return head;
}`,
      solution: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
      tests: [
        { name: 'five nodes', args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
        { name: 'two nodes', args: [[1, 2]], expected: [2, 1] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'one node', args: [[1]], expected: [1] },
        { name: 'duplicates', args: [[3, 3, 1]], expected: [1, 3, 3] },
        { name: 'negatives', args: [[-1, 0, 1]], expected: [1, 0, -1] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'Save, flip, step. `prev` ends up as the new head.',
    },
    {
      id: 'linked-lists-reverse-between',
      title: 'Flip one section of the playlist',
      difficulty: 'medium',
      leetcode: 92,
      pattern: 'In-place reversal',
      statement: "Positions in the list are counted from 1. Reverse only the nodes from position `left` to position `right` (inclusive) and leave the rest alone. Return the head. Try to do it in one pass.",
      examples: [
        { input: 'head = 1 → 2 → 3 → 4 → 5, left = 2, right = 4', output: '1 → 4 → 3 → 2 → 5' },
        { input: 'head = 5, left = 1, right = 1', output: '5' },
      ],
      constraints: ['1 ≤ n ≤ 500', '1 ≤ left ≤ right ≤ n'],
      hints: [
        'Walk to the node just *before* position `left`. Call it `before`. What if `left` is 1?',
        'A dummy node in front of the head gives position 1 a `before` too.',
        'Run the normal reversal loop for `right - left + 1` nodes starting at `before.next`. Then stitch: the old first node of the block points to `curr`, and `before.next` becomes `prev`.',
      ],
      approaches: [
        {
          name: 'Copy, reverse the slice, write back',
          idea: 'Copy values into an array, reverse the part from `left - 1` to `right - 1`, then write values back into the nodes. Easy, but O(n) memory and it changes values instead of links.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Dummy + reverse a block + stitch',
          idea: 'Only the arrows inside the block change direction, plus two links at the edges. A dummy means the block can start at the head without a special case.',
          pseudo: `function reverseBetween(head, left, right):
    dummy ← new node(0)
    dummy.next ← head
    before ← dummy
    repeat left - 1 times:
        before ← before.next
    first ← before.next
    prev ← null
    curr ← first
    repeat right - left + 1 times:
        nxt ← curr.next
        curr.next ← prev
        prev ← curr
        curr ← nxt
    first.next ← curr
    before.next ← prev
    return dummy.next`,
          code: `function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;
  const first = before.next;
  let prev = null;
  let curr = first;
  for (let i = left; i <= right; i++) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  first.next = curr;
  before.next = prev;
  return dummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'reverseBetween',
      starter: `function reverseBetween(head, left, right) {
  // Your code here: reverse positions left..right (1-based), return the head.
  return head;
}`,
      solution: `function reverseBetween(head, left, right) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (let i = 1; i < left; i++) before = before.next;
  const first = before.next;
  let prev = null;
  let curr = first;
  for (let i = left; i <= right; i++) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  first.next = curr;
  before.next = prev;
  return dummy.next;
}`,
      tests: [
        { name: 'middle block', args: [[1, 2, 3, 4, 5], 2, 4], expected: [1, 4, 3, 2, 5] },
        { name: 'one node', args: [[5], 1, 1], expected: [5] },
        { name: 'whole list', args: [[1, 2, 3], 1, 3], expected: [3, 2, 1] },
        { name: 'starts at head', args: [[1, 2, 3, 4], 1, 2], expected: [2, 1, 3, 4] },
        { name: 'ends at tail', args: [[1, 2, 3, 4], 3, 4], expected: [1, 2, 4, 3] },
        { name: 'block of one', args: [[1, 2, 3, 4, 5, 6], 3, 3], expected: [1, 2, 3, 4, 5, 6] },
        { name: 'all but the head', args: [[10, 20, 30, 40, 50], 2, 5], expected: [10, 50, 40, 30, 20] },
      ],
      shapes: { args: ['list', 'raw', 'raw'], result: 'list' },
      takeaway: 'Partial reversal = find `before`, run the normal loop k times, stitch two links.',
    },
    {
      id: 'linked-lists-swap-pairs',
      title: 'Swap dance partners',
      difficulty: 'medium',
      leetcode: 24,
      pattern: 'In-place reversal',
      statement: "Dancers stand in a line (a linked list). On the beat, every pair swaps places: 1st with 2nd, 3rd with 4th, and so on. A dancer without a partner at the end stays put. Swap the **nodes** (not the values) and return the new head.",
      examples: [
        { input: '1 → 2 → 3 → 4', output: '2 → 1 → 4 → 3' },
        { input: '1 → 2 → 3', output: '2 → 1 → 3', explain: '3 has no partner.' },
      ],
      constraints: ['0 ≤ n ≤ 100', 'change links, not values'],
      hints: [
        'This is "reverse in blocks of 2". The head changes, so start with a dummy.',
        'Stand on `prev`, the node before the pair. Call the pair `a` and `b`.',
        'Three links change: `a.next = b.next`, `b.next = a`, `prev.next = b`. Then `prev = a` (a is now second in the pair).',
      ],
      approaches: [
        {
          name: 'Swap the values',
          idea: 'Walk two at a time and swap `val`s. Gives the right printout, but the task says to move nodes; in real code nodes carry more than one number.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Dummy + relink each pair',
          idea: 'Each pair is a tiny reversal of two nodes, stitched to the node before it and the node after it. The dummy is the "node before" for the first pair.',
          pseudo: `function swapPairs(head):
    dummy ← new node(0)
    dummy.next ← head
    prev ← dummy
    while prev.next ≠ null and prev.next.next ≠ null:
        a ← prev.next
        b ← a.next
        a.next ← b.next          // a points past the pair
        b.next ← a               // b points back to a
        prev.next ← b            // the node before now sees b first
        prev ← a                 // a is the last of this pair
    return dummy.next`,
          code: `function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next;
    const b = a.next;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'swapPairs',
      starter: `function swapPairs(head) {
  // Your code here: swap every two adjacent nodes, return the new head.
  return head;
}`,
      solution: `function swapPairs(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next;
    const b = a.next;
    a.next = b.next;
    b.next = a;
    prev.next = b;
    prev = a;
  }
  return dummy.next;
}`,
      tests: [
        { name: 'even length', args: [[1, 2, 3, 4]], expected: [2, 1, 4, 3] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'one node', args: [[1]], expected: [1] },
        { name: 'odd length', args: [[1, 2, 3]], expected: [2, 1, 3] },
        { name: 'one pair', args: [[1, 2]], expected: [2, 1] },
        { name: 'three pairs', args: [[5, 6, 7, 8, 9, 10]], expected: [6, 5, 8, 7, 10, 9] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'Swapping a pair is a 2-node reversal: three links change, then step to the pair\'s new tail.',
    },
    {
      id: 'linked-lists-reverse-k-group',
      title: 'Stretch: reverse in blocks of k',
      difficulty: 'hard',
      leetcode: 25,
      pattern: 'In-place reversal',
      statement: "**Stretch problem (hard).** Reverse the list in blocks of `k` nodes: the first k nodes flip, then the next k, and so on. A final block with fewer than k nodes stays as it is. Change links, not values, and use O(1) extra memory.",
      examples: [
        { input: 'head = 1 → 2 → 3 → 4 → 5, k = 2', output: '2 → 1 → 4 → 3 → 5' },
        { input: 'head = 1 → 2 → 3 → 4 → 5, k = 3', output: '3 → 2 → 1 → 4 → 5', explain: 'Only 2 nodes are left after the first block, fewer than 3, so they stay.' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 5000'],
      hints: [
        'Swap Pairs was this problem with k = 2. Use a dummy and a `before` pointer again.',
        'Before flipping a block, check that k nodes actually exist after `before`. If not, stop.',
        'Flip k nodes with the template, stitch (`first.next = curr`, `before.next = prev`), then set `before = first` and repeat.',
      ],
      approaches: [
        {
          name: 'Copy values, reverse chunks, write back',
          idea: 'Put values in an array, reverse each full chunk of k, write them back. Easy to get right, but O(n) memory and it moves values, not nodes.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Block reversal in place',
          idea: 'Repeat the "reverse k nodes and stitch" template block by block. After each block, its old first node is its new last node, which is exactly the `before` of the next block.',
          pseudo: `function reverseKGroup(head, k):
    dummy ← new node(0)
    dummy.next ← head
    before ← dummy
    while true:
        check ← before                   // are there k nodes left?
        count ← 0
        while count < k and check ≠ null:
            check ← check.next
            count ← count + 1
        if check = null:
            return dummy.next            // fewer than k left: done
        first ← before.next
        prev ← null
        curr ← first
        repeat k times:                  // plain reversal
            nxt ← curr.next
            curr.next ← prev
            prev ← curr
            curr ← nxt
        first.next ← curr                // stitch
        before.next ← prev
        before ← first                   // move to the next block`,
          code: `function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (;;) {
    let check = before;
    for (let i = 0; i < k && check; i++) check = check.next;
    if (!check) return dummy.next;
    const first = before.next;
    let prev = null;
    let curr = first;
    for (let i = 0; i < k; i++) {
      const nxt = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nxt;
    }
    first.next = curr;
    before.next = prev;
    before = first;
  }
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'reverseKGroup',
      starter: `function reverseKGroup(head, k) {
  // Your code here: reverse every full block of k nodes, return the new head.
  return head;
}`,
      solution: `function reverseKGroup(head, k) {
  const dummy = new ListNode(0, head);
  let before = dummy;
  for (;;) {
    let check = before;
    for (let i = 0; i < k && check; i++) check = check.next;
    if (!check) return dummy.next;
    const first = before.next;
    let prev = null;
    let curr = first;
    for (let i = 0; i < k; i++) {
      const nxt = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nxt;
    }
    first.next = curr;
    before.next = prev;
    before = first;
  }
}`,
      tests: [
        { name: 'k = 2', args: [[1, 2, 3, 4, 5], 2], expected: [2, 1, 4, 3, 5] },
        { name: 'k = 3, short tail', args: [[1, 2, 3, 4, 5], 3], expected: [3, 2, 1, 4, 5] },
        { name: 'k = 1 changes nothing', args: [[1, 2, 3, 4, 5], 1], expected: [1, 2, 3, 4, 5] },
        { name: 'one node', args: [[1], 1], expected: [1] },
        { name: 'two full blocks', args: [[1, 2, 3, 4, 5, 6], 3], expected: [3, 2, 1, 6, 5, 4] },
        { name: 'k equals length', args: [[1, 2, 3, 4], 4], expected: [4, 3, 2, 1] },
        { name: 'blocks of 4', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9], 4], expected: [4, 3, 2, 1, 8, 7, 6, 5, 9] },
      ],
      shapes: { args: ['list', 'raw'], result: 'list' },
      takeaway: 'Hard problems are often a known template on repeat: check, flip k, stitch, move `before`.',
    },
  ],
  quiz: [
    {
      prompt: 'In the reversal loop, what breaks if you skip `nxt = curr.next` and flip first?',
      options: [
        'Nothing, `curr.next` still points forward after the flip.',
        'You lose the rest of the list: `curr.next` now points backward and nothing else points forward.',
        'The loop runs one extra time.',
      ],
      answer: 1,
      explanation: 'The flip overwrites the only link to the rest of the list. Save it first.',
    },
    {
      prompt: 'After reversing `1 → 2 → 3`, which variable holds the new head?',
      options: ['`curr`', '`prev`', '`head`'],
      answer: 1,
      explanation: 'The loop ends when `curr` is null. `prev` is the last node we flipped, the old tail, which is the new head. `head` still points at 1, now the tail.',
    },
    {
      prompt: "When you reverse a block in the middle of a list, the block's old first node becomes…",
      options: ['the block\'s new first node', "the block's new last node, which must point to the node after the block", 'unreachable'],
      answer: 1,
      explanation: 'Flipping turns first into last. That is why the stitch step sets `first.next = curr`.',
    },
  ],
  takeaways: [
    'Reversal = save `nxt`, flip `curr.next = prev`, step. Return `prev`.',
    'Iterative reversal is O(1) memory; recursion quietly costs O(n) stack.',
    'Partial reversal = dummy + walk to `before` + flip k + stitch two links.',
  ],
};

export default lesson;
