import type { Lesson } from '../types';

// Module 7, lesson 2: fast & slow pointers (cycle, cycle start, middle, gap pointers).
const lesson: Lesson = {
  id: 'fast-slow',
  title: 'Fast and slow pointers',
  summary: 'Two runners at different speeds find loops, middles and "n from the end" in one pass.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Stuck in a redirect loop',
      text: "A web crawler follows links: `/a` sends it to `/b`, `/b` to `/c`, `/c` to `/d`, and `/d` sends it back to `/b`. The crawler will spin forever unless it notices the loop. It could remember every page it ever saw, but crawlers visit billions of pages. Is there a way to spot a loop while remembering almost nothing?",
    },
    {
      kind: 'text',
      text: "**The problem.** You get the head of a linked list. Somewhere, the last node might point back to an earlier node instead of `null`, forming a loop. Return `true` if there is a loop. Example: `1 → 2 → 3 → 4 → 5 → 6`, and 6 points back to 3.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: remember every node',
      code: `function hasCycleBrute(head):
    seen ← empty set                 // stores nodes, not values
    node ← head
    while node ≠ null:
        if node in seen:
            return true              // we came back: a loop
        add node to seen
        node ← node.next
    return false`,
    },
    {
      kind: 'text',
      text: "This works in **O(n)** time, but the set grows to **O(n)** memory. Note it stores *nodes*, not values: two different nodes can hold the same number.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** We store every node only to answer one yes/no question. Think of a running track instead. If two people run on a straight road, the faster one just finishes. If the road is a loop, the faster one eventually **laps** the slower one and they meet.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: "The tortoise and the hare (Floyd's trick)",
      text: "Move `slow` one node per step and `fast` two nodes per step. No loop: `fast` hits `null`, done. A loop: both end up inside it, and each step `fast` gains exactly one node on `slow`, so the gap shrinks to zero and they land on the **same node**. Two pointers, **O(1)** memory.",
    },
    {
      kind: 'steps',
      title: 'Find the loop, then find where it starts (6 links back to 3)',
      frames: [
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 0, fast: 0 }, vars: { 'hidden link': '6 → 3' }, note: 'Both start at the head. The tail (6) secretly links back to 3.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 1, fast: 2 }, active: [1, 2], note: '`slow` takes 1 step, `fast` takes 2.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 2, fast: 4 }, active: [2, 4], note: 'Again: slow on 3, fast on 5.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 3, fast: 2 }, active: [3, 2], note: '`fast` goes 5 → 6 → back to 3. It is in the loop now, one node behind `slow`.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 4, fast: 4 }, found: [4], note: 'They meet on 5. Meeting is only possible inside a loop, so: loop found.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { p: 0, q: 4 }, active: [0, 4], note: 'Bonus: where does the loop start? Put `p` back at the head, leave `q` at the meeting node.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { p: 1, q: 5 }, active: [1, 5], note: 'Now move both **one** step at a time.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { p: 2, q: 2 }, found: [2], note: '`q` wraps 6 → 3 and meets `p` on 3: the first node of the loop.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Why does the reset trick land on the loop start?',
      text: "One-sentence intuition: the walk from the head to the loop start is exactly as long as the walk from the meeting node forward to the loop start (maybe after a few extra laps). In the example both walks are 2 steps. No need to memorize the algebra; remember \"meet, reset one to head, walk together\".",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Detect a loop',
      code: `function hasCycle(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next             // 1 step
        fast ← fast.next.next        // 2 steps
        if slow = fast:              // same node, not same value
            return true
    return false                     // fast fell off the end`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    },
    {
      kind: 'trace',
      title: 'Same two runners, no loop: find the middle of 1 → 2 → 3 → 4 → 5 → 6',
      columns: ['step', 'slow on', 'fast on', 'what happens'],
      rows: [
        [0, 1, 1, 'start together'],
        [1, 2, 3, 'fast moves 2'],
        [2, 3, 5, 'fast moves 2'],
        [3, 4, 'null', 'fast fell off: stop'],
      ],
      note: "When `fast` reaches the end, `slow` has gone exactly half as far: it sits on the middle (for even lengths, the **second** middle, 4). For `1 → 2 → 3 → 4 → 5` it stops on 3.",
    },
    {
      kind: 'diagram',
      title: 'A cousin: the gap trick (2nd node from the end)',
      art: `n = 2.  Move lead n + 1 = 3 steps first:
dummy → 1 → 2 → 3 → 4 → 5 → null
  ↑             ↑
trail          lead

Now move both until lead is null:
dummy → 1 → 2 → 3 → 4 → 5 → null
                ↑               ↑
              trail            lead

trail.next is 4, the 2nd from the end. Unlink it.`,
      caption: "Same idea, different rule: instead of different speeds, the two pointers keep a **fixed gap**. When the front one hits the end, the back one is exactly where you need it.",
    },
    {
      kind: 'compare',
      title: 'Loop detection',
      rows: [
        { approach: 'Set of visited nodes', time: 'O(n)', space: 'O(n)', note: 'Easy to write; memory grows with the list.' },
        { approach: 'Fast & slow pointers', time: 'O(n)', space: 'O(1)', note: 'Two pointers. Also finds the loop start and the middle.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: fast & slow',
      code: `slow ← head
fast ← head
while fast ≠ null and fast.next ≠ null:
    slow ← slow.next
    fast ← fast.next.next
    // loop question?  if slow = fast: there is a loop
// no loop: slow now sits on the middle

// gap version ("k-th from the end"): move lead k steps,
// then move lead and trail together until lead = null`,
    },
    {
      kind: 'text',
      text: "**Signals.** \"Detect a loop\", \"find the middle\", \"k-th from the end\", \"in one pass\", \"O(1) extra memory\" on a linked list. If you would need the length first, a second pointer can usually measure it for you.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Check before you jump two',
      text: "`fast.next.next` crashes if `fast` or `fast.next` is null. The loop condition must be `fast && fast.next`, in that order. And compare **nodes** (`slow === fast`), never values: a list like `7 → 7 → 7` has equal values with no loop at all.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-cycle',
      title: 'Redirect loop detector',
      difficulty: 'easy',
      leetcode: 141,
      pattern: 'Fast & slow pointers',
      statement: "Return `true` if following `next` from `head` ever comes back to a node you already passed, and `false` if you reach `null`. Use O(1) extra memory if you can. The test helper `runHasCycle(values, pos)` is already written for you. It builds the list from `values` and links the last node back to index `pos` (`-1` means no loop), then calls your `hasCycle`.",
      examples: [
        { input: 'values = [3, 2, 0, -4], pos = 1', output: 'true', explain: 'The tail -4 links back to 2.' },
        { input: 'values = [1], pos = -1', output: 'false' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', 'pos is -1 or a valid index'],
      hints: [
        'Remembering every node you visited works. Can you do it without remembering anything?',
        'Picture two runners on a track. On a circular track, the fast one catches the slow one.',
        'Move `slow` by 1 and `fast` by 2 while `fast && fast.next`. If they are ever the same node, there is a loop.',
      ],
      approaches: [
        {
          name: 'Set of visited nodes',
          idea: 'Store each node in a `Set`. Seeing a node twice means you went around a loop.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Fast & slow pointers',
          idea: 'Inside a loop the fast pointer gains one node per step on the slow one, so it must land on it. Without a loop the fast pointer simply reaches `null`.',
          pseudo: `function hasCycle(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
        if slow = fast:
            return true
    return false`,
          code: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'runHasCycle',
      starter: `function hasCycle(head) {
  // Your code here: return true if the list loops back on itself.
  return false;
}

// Test helper (already written for you, don't edit): builds a list whose tail
// points back to the node at index pos (-1 = no loop), then calls hasCycle.
function runHasCycle(values, pos) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let loopTo = null;
  values.forEach((v, i) => {
    tail = tail.next = new ListNode(v);
    if (i === pos) loopTo = tail;
  });
  tail.next = loopTo;
  return hasCycle(dummy.next);
}`,
      solution: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}

// Test helper (already written for you, don't edit): builds a list whose tail
// points back to the node at index pos (-1 = no loop), then calls hasCycle.
function runHasCycle(values, pos) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let loopTo = null;
  values.forEach((v, i) => {
    tail = tail.next = new ListNode(v);
    if (i === pos) loopTo = tail;
  });
  tail.next = loopTo;
  return hasCycle(dummy.next);
}`,
      tests: [
        { name: 'loop to index 1', args: [[3, 2, 0, -4], 1], expected: true },
        { name: 'two nodes, loop to head', args: [[1, 2], 0], expected: true },
        { name: 'one node, no loop', args: [[1], -1], expected: false },
        { name: 'empty list', args: [[], -1], expected: false },
        { name: 'node points to itself', args: [[1], 0], expected: true },
        { name: 'straight list', args: [[1, 2, 3, 4, 5], -1], expected: false },
        { name: 'loop to the middle', args: [[1, 2, 3, 4, 5, 6], 2], expected: true },
        { name: 'equal values, no loop', args: [[7, 7, 7], -1], expected: false },
      ],
      takeaway: 'Different speeds on a loop always collide. Compare nodes, not values.',
    },
    {
      id: 'linked-lists-middle',
      title: 'Middle of the queue',
      difficulty: 'easy',
      leetcode: 876,
      pattern: 'Fast & slow pointers',
      statement: "A support queue is a linked list and you want to spot-check the customer in the middle, in **one pass** and without counting first. Return the middle node (the answer is that node and everything after it). If there are two middles, return the **second** one.",
      examples: [
        { input: '1 → 2 → 3 → 4 → 5', output: '3 → 4 → 5' },
        { input: '1 → 2 → 3 → 4 → 5 → 6', output: '4 → 5 → 6', explain: 'Two middles (3 and 4): return the second.' },
      ],
      constraints: ['1 ≤ n ≤ 100'],
      hints: [
        'The simple way: count the nodes, then walk half of them. Can one walk do both jobs?',
        'If one pointer moves twice as fast as another, where is the slow one when the fast one finishes?',
        'Loop while `fast && fast.next`: slow moves 1, fast moves 2. Return `slow`.',
      ],
      approaches: [
        {
          name: 'Count, then walk',
          idea: 'One pass to count n, a second pass of `Math.floor(n / 2)` steps. Fine, just two passes.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Fast & slow pointers',
          idea: 'While `fast` covers the whole list, `slow` covers exactly half of it, so it stops on the middle.',
          pseudo: `function middleNode(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    return slow`,
          code: `function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'middleNode',
      starter: `function middleNode(head) {
  // Your code here: return the middle node (second middle if even).
  return head;
}`,
      solution: `function middleNode(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}`,
      tests: [
        { name: 'odd length', args: [[1, 2, 3, 4, 5]], expected: [3, 4, 5] },
        { name: 'even length', args: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6] },
        { name: 'one node', args: [[1]], expected: [1] },
        { name: 'two nodes', args: [[1, 2]], expected: [2] },
        { name: 'three nodes', args: [[10, 20, 30]], expected: [20, 30] },
        { name: 'eight nodes', args: [[5, 4, 3, 2, 1, 0, 9, 8]], expected: [1, 0, 9, 8] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'Half speed means half way. `fast` measures the length for you.',
    },
    {
      id: 'linked-lists-cycle-start',
      title: 'Where does the loop begin?',
      difficulty: 'medium',
      leetcode: 142,
      pattern: 'Fast & slow pointers',
      statement: "Same redirect chain, harder question: return the **node where the loop starts** (the first node you visit twice), or `null` if there is no loop. Use O(1) extra memory if you can. The test helper `runDetectCycle(values, pos)` is already written for you. It builds the list (tail linked back to index `pos`, `-1` = no loop), calls your `detectCycle`, and reports the **index** of the node you return (`-1` for `null`).",
      examples: [
        { input: 'values = [3, 2, 0, -4], pos = 1', output: '1', explain: 'The loop starts at the node holding 2, index 1.' },
        { input: 'values = [1], pos = -1', output: '-1', explain: 'No loop, so `detectCycle` returns null.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', 'pos is -1 or a valid index'],
      hints: [
        'With a `Set`, the first node you see twice is the answer. Now try O(1) memory.',
        'First detect the loop with fast & slow and keep the node where they meet.',
        'Put one pointer back at the head, leave the other at the meeting node, and move both one step at a time. Where they meet is the loop start.',
      ],
      approaches: [
        {
          name: 'Set of visited nodes',
          idea: 'Walk the list and store nodes. The first node already in the set is where the loop begins.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: "Floyd: meet, then reset",
          idea: 'After `slow` and `fast` meet, the distance from the head to the loop start equals the distance from the meeting node forward to the loop start. So two pointers walking at the same speed from those two spots meet right at the start.',
          pseudo: `function detectCycle(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
        if slow = fast:                 // phase 1: they met
            p ← head
            while p ≠ slow:             // phase 2: same speed
                p ← p.next
                slow ← slow.next
            return p
    return null`,
          code: `function detectCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) {
        p = p.next;
        slow = slow.next;
      }
      return p;
    }
  }
  return null;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'runDetectCycle',
      starter: `function detectCycle(head) {
  // Your code here: return the node where the loop starts, or null.
  return null;
}

// Test helper (already written for you, don't edit): builds the list with the
// tail linked to index pos (-1 = no loop), calls detectCycle, and returns the
// index of the node you returned (-1 for null).
function runDetectCycle(values, pos) {
  const nodes = values.map((v) => new ListNode(v));
  nodes.forEach((node, i) => (node.next = nodes[i + 1] ?? null));
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  return nodes.indexOf(detectCycle(nodes[0] ?? null));
}`,
      solution: `function detectCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) {
        p = p.next;
        slow = slow.next;
      }
      return p;
    }
  }
  return null;
}

// Test helper (already written for you, don't edit): builds the list with the
// tail linked to index pos (-1 = no loop), calls detectCycle, and returns the
// index of the node you returned (-1 for null).
function runDetectCycle(values, pos) {
  const nodes = values.map((v) => new ListNode(v));
  nodes.forEach((node, i) => (node.next = nodes[i + 1] ?? null));
  if (pos >= 0) nodes[nodes.length - 1].next = nodes[pos];
  return nodes.indexOf(detectCycle(nodes[0] ?? null));
}`,
      tests: [
        { name: 'loop to index 1', args: [[3, 2, 0, -4], 1], expected: 1 },
        { name: 'two nodes, loop to head', args: [[1, 2], 0], expected: 0 },
        { name: 'no loop', args: [[1], -1], expected: -1 },
        { name: 'self loop', args: [[1], 0], expected: 0 },
        { name: 'loop to the middle', args: [[1, 2, 3, 4, 5, 6], 2], expected: 2 },
        { name: 'tail points to itself', args: [[1, 2, 3, 4, 5, 6], 5], expected: 5 },
        { name: 'empty list', args: [[], -1], expected: -1 },
        { name: 'equal values', args: [[7, 7, 7, 7], 3], expected: 3 },
      ],
      takeaway: 'Meet with fast & slow, reset one pointer to the head, walk both at speed 1: they meet at the loop start.',
    },
    {
      id: 'linked-lists-remove-nth-from-end',
      title: 'Undo the n-th last edit',
      difficulty: 'medium',
      leetcode: 19,
      pattern: 'Gap pointers',
      statement: "An editor keeps your edits in a linked list, oldest first. Remove the edit that is `n` places from the **end** (n = 1 is the newest) and return the head. Try to do it in one pass.",
      examples: [
        { input: 'head = 1 → 2 → 3 → 4 → 5, n = 2', output: '1 → 2 → 3 → 5' },
        { input: 'head = 1, n = 1', output: 'empty' },
        { input: 'head = 1 → 2, n = 2', output: '2', explain: 'Removing the head: a dummy makes this case normal.' },
      ],
      constraints: ['1 ≤ length ≤ 30', '1 ≤ n ≤ length'],
      hints: [
        'Two passes is easy: count the length L, then the node to remove is number L − n + 1 from the front.',
        'For one pass, use two pointers with a fixed gap between them.',
        'Start both at a dummy. Move `lead` n + 1 steps. Then move both until `lead` is null. Now `trail.next` is the node to remove.',
      ],
      approaches: [
        {
          name: 'Count, then walk',
          idea: 'First pass finds the length L. Second pass stops on the node just before position L − n and unlinks the next one. Use a dummy in case the head goes.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Gap pointers (one pass)',
          idea: 'If `lead` is n + 1 nodes ahead of `trail`, then when `lead` falls off the end, `trail` is just before the n-th node from the end. The dummy covers the case where that node is the head.',
          pseudo: `function removeNthFromEnd(head, n):
    dummy ← new node(0)
    dummy.next ← head
    lead ← dummy
    trail ← dummy
    repeat n + 1 times:
        lead ← lead.next
    while lead ≠ null:
        lead ← lead.next
        trail ← trail.next
    trail.next ← trail.next.next      // unlink the target
    return dummy.next`,
          code: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let lead = dummy;
  let trail = dummy;
  for (let i = 0; i <= n; i++) lead = lead.next;
  while (lead) {
    lead = lead.next;
    trail = trail.next;
  }
  trail.next = trail.next.next;
  return dummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'removeNthFromEnd',
      starter: `function removeNthFromEnd(head, n) {
  // Your code here: remove the n-th node from the end, return the head.
  return head;
}`,
      solution: `function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let lead = dummy;
  let trail = dummy;
  for (let i = 0; i <= n; i++) lead = lead.next;
  while (lead) {
    lead = lead.next;
    trail = trail.next;
  }
  trail.next = trail.next.next;
  return dummy.next;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
        { name: 'only node', args: [[1], 1], expected: [] },
        { name: 'remove the tail', args: [[1, 2], 1], expected: [1] },
        { name: 'remove the head', args: [[1, 2], 2], expected: [2] },
        { name: 'head of three', args: [[1, 2, 3], 3], expected: [2, 3] },
        { name: 'last of four', args: [[1, 2, 3, 4], 1], expected: [1, 2, 3] },
        { name: 'middle of six', args: [[9, 8, 7, 6, 5, 4], 4], expected: [9, 8, 6, 5, 4] },
      ],
      shapes: { args: ['list', 'raw'], result: 'list' },
      takeaway: '"k-th from the end" in one pass: give one pointer a head start of k, then move both together.',
    },
  ],
  quiz: [
    {
      prompt: 'Why must the loop condition be `fast && fast.next` and not just `fast`?',
      options: [
        'It makes the loop faster.',
        'We read `fast.next.next`, which crashes if `fast.next` is null.',
        'Otherwise slow would skip the middle.',
      ],
      answer: 1,
      explanation: 'Each step jumps two nodes. Both hops must exist, so check `fast` and then `fast.next` before reading `fast.next.next`.',
    },
    {
      prompt: 'In a list with a loop, why do fast and slow always meet instead of fast jumping over slow forever?',
      options: [
        'Inside the loop, fast gets exactly 1 node closer to slow each step, so the gap shrinks to 0.',
        'Because fast slows down inside the loop.',
        'They do not always meet; you need a set as backup.',
      ],
      answer: 0,
      explanation: 'Fast moves 2, slow moves 1, so the gap closes by exactly 1 per step. A gap that shrinks by 1 cannot skip over 0.',
    },
    {
      prompt: 'For "remove the 3rd node from the end" in one pass, how far ahead of `trail` (both starting at a dummy) does `lead` go first?',
      options: ['2 steps', '3 steps', '4 steps'],
      answer: 2,
      explanation: '`trail` must stop on the node *before* the target so it can unlink it, so the gap is n + 1 = 4.',
    },
  ],
  takeaways: [
    'Slow moves 1, fast moves 2. Meeting = loop. Fast hits null = no loop, and slow is on the middle.',
    'Loop start: after they meet, reset one pointer to the head and walk both at speed 1.',
    '"n-th from the end": give `lead` a head start of n + 1 from a dummy, then move both.',
  ],
};

export default lesson;
