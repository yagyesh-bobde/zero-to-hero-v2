import type { Lesson } from '../types';

// Module 7, lesson 1: the dummy node. Merge, filter and split lists with no head special cases.
const lesson: Lesson = {
  id: 'dummy-and-merge',
  title: 'The dummy node: merge and split lists',
  summary: 'One fake node at the front removes every "what about the head?" special case.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Blending two playlists',
      text: "Spotify's Blend mixes your playlist with a friend's. Say both playlists are already sorted by release year, oldest first. The app wants one combined list, still sorted, and it does not want to copy thousands of songs. It just wants to **re-link the songs that already exist**.",
    },
    {
      kind: 'text',
      text: "**The problem.** You get two sorted linked lists, `a = 1 → 3 → 5` and `b = 2 → 3 → 6`. Join them into one sorted list `1 → 2 → 3 → 3 → 5 → 6` by changing `next` pointers. No new nodes needed.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: dump, sort, rebuild',
      code: `function mergeBrute(a, b):
    values ← empty list
    for each node in a, then each node in b:
        append node.val to values
    sort values
    build a new list from values and return it`,
    },
    {
      kind: 'text',
      text: "This works. It costs **O((n + m) log(n + m))** time for the sort and **O(n + m)** extra memory for the array and the new nodes (n and m are the two list lengths).",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** Both lists are *already sorted*. So the smallest value left is always sitting at one of the two heads. Sorting throws that fact away. And when you try to link nodes directly, you hit an annoying question: the first node you pick becomes the head, so it needs its own `if`.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Compare the two heads, and start from a dummy',
      text: "Look only at the two heads. Take the smaller one, move that list forward, repeat. To avoid the head special case, start the answer with a **dummy node**: a fake node that is not part of the answer. Now \"add a node\" is always `tail.next = node`, even for the very first one. At the end, return `dummy.next`.",
    },
    {
      kind: 'diagram',
      title: 'The dummy node and the tail pointer',
      art: `start:            dummy → (nothing yet)
                    ↑
                   tail

after taking 1, 2: dummy → 1 → 2
                              ↑
                             tail

answer = dummy.next  (skip the fake node)`,
      caption: "`tail` always points at the last real node, so appending is one line, every time.",
    },
    {
      kind: 'trace',
      title: 'Merge a = 1 → 3 → 5 with b = 2 → 3 → 6',
      columns: ['step', 'head of a', 'head of b', 'take', 'merged so far'],
      rows: [
        [1, 1, 2, '1 from a', 'D → 1'],
        [2, 3, 2, '2 from b', 'D → 1 → 2'],
        [3, 3, 3, '3 from a (tie: take a)', 'D → 1 → 2 → 3'],
        [4, 5, 3, '3 from b', '… → 3 → 3'],
        [5, 5, 6, '5 from a', '… → 3 → 5'],
        [6, 'null', 6, 'rest of b', '… → 5 → 6'],
      ],
      note: "When one list runs out, glue on the rest of the other list in one step. It is already sorted, so there is nothing left to compare. `D` is the dummy.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Merge with a dummy node',
      code: `function mergeTwoLists(a, b):
    dummy ← new node(0)            // fake head, never in the answer
    tail ← dummy                   // last node of the merged list
    while a ≠ null and b ≠ null:
        if a.val ≤ b.val:
            tail.next ← a
            a ← a.next
        else:
            tail.next ← b
            b ← b.next
        tail ← tail.next
    if a ≠ null:                    // glue on whatever is left
        tail.next ← a
    else:
        tail.next ← b
    return dummy.next`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b; // one of them is null, the other is the sorted leftover
  return dummy.next;
}`,
    },
    {
      kind: 'compare',
      title: 'Merging two sorted lists',
      rows: [
        { approach: 'Dump into array, sort, rebuild', time: 'O((n+m) log(n+m))', space: 'O(n + m)', note: 'Ignores that the input is already sorted.' },
        { approach: 'Merge, special-case the head', time: 'O(n + m)', space: 'O(1)', note: 'Fast, but the extra `if` for the first node is where bugs hide.' },
        { approach: 'Merge with a dummy node', time: 'O(n + m)', space: 'O(1)', note: 'Same speed, one code path. This is the one to write.' },
      ],
    },
    {
      kind: 'text',
      text: "**When to reach for a dummy node.** Any time the head of the answer might change or is not known yet: deleting nodes (the first node might go), merging, splitting one list into two (use two dummies), building a brand-new list digit by digit. If you catch yourself writing `if (head === null)` or `if (node === head)`, add a dummy instead.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: build a list with a dummy',
      code: `dummy ← new node(0)
tail ← dummy
for each node you decide to keep:
    tail.next ← node
    tail ← node
tail.next ← null          // cut any old link the last node still has
return dummy.next`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Old links come along for the ride',
      text: "When you re-use existing nodes, each one still carries its old `next`. If the last node you keep used to point at a node you put somewhere else, you just built a **loop**. End every build with `tail.next = null` (the merge above is safe only because the leftover list already ends in null). Second classic bug: returning `dummy` instead of `dummy.next`.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-merge-two-sorted',
      title: 'Merge two sorted playlists',
      difficulty: 'easy',
      leetcode: 21,
      pattern: 'Dummy node',
      statement: "Two playlists are stored as linked lists of release years, each sorted from oldest to newest. Join them into **one** sorted list by re-linking the existing nodes, and return its head. Either list may be empty.",
      examples: [
        { input: 'a = 1 → 2 → 4, b = 1 → 3 → 4', output: '1 → 1 → 2 → 3 → 4 → 4' },
        { input: 'a = empty, b = 0', output: '0', explain: 'One empty list: the answer is just the other one.' },
      ],
      constraints: ['0 ≤ length of each list ≤ 50', '-100 ≤ val ≤ 100', 'both lists are sorted ascending'],
      hints: [
        'The smallest value still waiting is always at one of the two heads.',
        'Take the smaller head, link it on, move that list forward. Repeat.',
        'Start your answer at a dummy node and keep a `tail` pointer, so the first pick needs no special case. Glue on the leftover list at the end.',
      ],
      approaches: [
        {
          name: 'Dump, sort, rebuild',
          idea: 'Copy every value into an array, sort it, and build a fresh list. Correct, but it pays for a sort the input already did for you.',
          time: 'O((n+m) log(n+m))',
          space: 'O(n + m)',
        },
        {
          name: 'Two heads + dummy node',
          idea: 'Because both lists are sorted, the next value of the answer is the smaller of the two heads. A dummy node gives the answer a fixed starting point, so every pick is the same `tail.next = node` step.',
          pseudo: `function mergeTwoLists(a, b):
    dummy ← new node(0)
    tail ← dummy
    while a ≠ null and b ≠ null:
        if a.val ≤ b.val:
            tail.next ← a
            a ← a.next
        else:
            tail.next ← b
            b ← b.next
        tail ← tail.next
    tail.next ← a if a ≠ null, otherwise b
    return dummy.next`,
          code: `function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}`,
          time: 'O(n + m)',
          space: 'O(1)',
        },
      ],
      fn: 'mergeTwoLists',
      starter: `function mergeTwoLists(a, b) {
  // Your code here: return the head of one sorted list made from a and b.
  return null;
}`,
      solution: `function mergeTwoLists(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a;
      a = a.next;
    } else {
      tail.next = b;
      b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
        { name: 'both empty', args: [[], []], expected: [] },
        { name: 'first empty', args: [[], [0]], expected: [0] },
        { name: 'second empty', args: [[2, 9], []], expected: [2, 9] },
        { name: 'one big value', args: [[5], [1, 2, 3]], expected: [1, 2, 3, 5] },
        { name: 'all equal', args: [[1, 1, 1], [1, 1]], expected: [1, 1, 1, 1, 1] },
        { name: 'negatives', args: [[-3, 0, 7], [-5, -3, 10]], expected: [-5, -3, -3, 0, 7, 10] },
        { name: 'one tiny value', args: [[2, 4, 6, 8], [1]], expected: [1, 2, 4, 6, 8] },
      ],
      shapes: { args: ['list', 'list'], result: 'list' },
      takeaway: 'Sorted inputs mean the next answer is always at a head. A dummy node means the first pick is not special.',
    },
    {
      id: 'linked-lists-remove-elements',
      title: 'Remove every song by one artist',
      difficulty: 'easy',
      leetcode: 203,
      pattern: 'Dummy node',
      statement: "You are tired of one artist. Your queue is a linked list of artist ids. Remove **every** node whose value equals `val` and return the new head. Careful: the first few nodes might be removed too, and the list might end up empty.",
      examples: [
        { input: 'head = 1 → 2 → 6 → 3 → 4 → 5 → 6, val = 6', output: '1 → 2 → 3 → 4 → 5' },
        { input: 'head = 7 → 7 → 7, val = 7', output: 'empty', explain: 'Every node goes, including the head.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁴', '1 ≤ val ≤ 50'],
      hints: [
        'To remove a node you must change the `next` of the node *before* it. What is "before" the head?',
        'Put a dummy node in front of the head. Now every real node has a node before it.',
        'Walk with `prev`. If `prev.next` should go, set `prev.next = prev.next.next` and do NOT move `prev` (the new `prev.next` might also need to go). Otherwise step forward.',
      ],
      approaches: [
        {
          name: 'Fix the head first, then the rest',
          idea: 'First drop matching nodes from the front with a `while`, then walk the rest with a `prev` pointer. Works, but it is two loops doing the same job.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Dummy node + prev pointer',
          idea: 'A dummy in front of the head means the head is just another node with something before it. One loop handles every case.',
          pseudo: `function removeElements(head, val):
    dummy ← new node(0)
    dummy.next ← head
    prev ← dummy
    while prev.next ≠ null:
        if prev.next.val = val:
            prev.next ← prev.next.next   // skip it, stay put
        else:
            prev ← prev.next
    return dummy.next`,
          code: `function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next) {
    if (prev.next.val === val) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return dummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'removeElements',
      starter: `function removeElements(head, val) {
  // Your code here: remove every node equal to val, return the new head.
  return head;
}`,
      solution: `function removeElements(head, val) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  while (prev.next) {
    if (prev.next.val === val) prev.next = prev.next.next;
    else prev = prev.next;
  }
  return dummy.next;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 6, 3, 4, 5, 6], 6], expected: [1, 2, 3, 4, 5] },
        { name: 'empty list', args: [[], 1], expected: [] },
        { name: 'everything goes', args: [[7, 7, 7, 7], 7], expected: [] },
        { name: 'head and tail go', args: [[7, 1, 7], 7], expected: [1] },
        { name: 'nothing matches', args: [[1, 2, 3], 4], expected: [1, 2, 3] },
        { name: 'every other node', args: [[5, 1, 5, 2, 5], 5], expected: [1, 2] },
        { name: 'neighbors in a row', args: [[1, 2, 2, 2, 3], 2], expected: [1, 3] },
      ],
      shapes: { args: ['list', 'raw'], result: 'list' },
      takeaway: 'When you delete, stand on the node before. A dummy gives the head a node before it.',
    },
    {
      id: 'linked-lists-partition',
      title: 'Priority boarding',
      difficulty: 'medium',
      leetcode: 86,
      pattern: 'Dummy node (two lists)',
      statement: "Passengers wait in a linked list, each with a boarding group number. Everyone with a group **less than** `x` boards first, then everyone else. Inside each part, keep people in their original order (nobody likes being cut in line). Rearrange the nodes and return the new head.",
      examples: [
        { input: 'head = 1 → 4 → 3 → 2 → 5 → 2, x = 3', output: '1 → 2 → 2 → 4 → 3 → 5', explain: 'Small part: 1, 2, 2. Big part: 4, 3, 5. Both keep their order.' },
        { input: 'head = 2 → 1, x = 2', output: '1 → 2' },
      ],
      constraints: ['0 ≤ n ≤ 200', '-100 ≤ val ≤ 100', '-200 ≤ x ≤ 200'],
      hints: [
        'Think of two separate lines forming: "small" and "big". Each passenger joins the back of one.',
        'Two lines means two dummy nodes and two tail pointers.',
        "At the end, connect the small line's tail to the big line's first node. And make the big line's tail point to null.",
      ],
      approaches: [
        {
          name: 'Copy values into two arrays',
          idea: 'Walk the list, push each value into `small` or `big`, then write `small` followed by `big` back into the nodes. Simple, but uses O(n) extra memory.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two dummy nodes',
          idea: 'Build two lists at once by moving each node to the end of the small list or the big list. Appending to the end keeps the original order. Then glue them together.',
          pseudo: `function partition(head, x):
    smallDummy ← new node(0)
    bigDummy ← new node(0)
    small ← smallDummy
    big ← bigDummy
    for each node in the list:
        if node.val < x:
            small.next ← node
            small ← node
        else:
            big.next ← node
            big ← node
    big.next ← null                  // cut the old link: no loops
    small.next ← bigDummy.next       // glue the two lines
    return smallDummy.next`,
          code: `function partition(head, x) {
  const smallDummy = new ListNode(0);
  const bigDummy = new ListNode(0);
  let small = smallDummy;
  let big = bigDummy;
  for (let node = head; node; node = node.next) {
    if (node.val < x) {
      small.next = node;
      small = node;
    } else {
      big.next = node;
      big = node;
    }
  }
  big.next = null;
  small.next = bigDummy.next;
  return smallDummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'partition',
      starter: `function partition(head, x) {
  // Your code here: nodes < x first, then the rest, both in original order.
  return head;
}`,
      solution: `function partition(head, x) {
  const smallDummy = new ListNode(0);
  const bigDummy = new ListNode(0);
  let small = smallDummy;
  let big = bigDummy;
  for (let node = head; node; node = node.next) {
    if (node.val < x) {
      small.next = node;
      small = node;
    } else {
      big.next = node;
      big = node;
    }
  }
  big.next = null;
  small.next = bigDummy.next;
  return smallDummy.next;
}`,
      tests: [
        { name: 'classic', args: [[1, 4, 3, 2, 5, 2], 3], expected: [1, 2, 2, 4, 3, 5] },
        { name: 'two nodes', args: [[2, 1], 2], expected: [1, 2] },
        { name: 'empty', args: [[], 0], expected: [] },
        { name: 'all small', args: [[1, 2, 3], 5], expected: [1, 2, 3] },
        { name: 'all big', args: [[5, 6, 7], 1], expected: [5, 6, 7] },
        { name: 'alternating', args: [[3, 1, 3, 1], 2], expected: [1, 1, 3, 3] },
        { name: 'negatives', args: [[-1, 5, -2, 0], 0], expected: [-1, -2, 5, 0] },
        { name: 'big then small (loop trap)', args: [[4, 1], 3], expected: [1, 4] },
      ],
      shapes: { args: ['list', 'raw'], result: 'list' },
      takeaway: 'Splitting one list into groups? One dummy per group, then glue. Always null-terminate the last group.',
    },
    {
      id: 'linked-lists-remove-duplicates-ii',
      title: 'Keep only the one-time visitors',
      difficulty: 'medium',
      leetcode: 82,
      pattern: 'Dummy node',
      statement: "A sorted linked list holds user ids from today's login log. A user who logged in more than once shows up several times in a row. Remove **every** copy of any id that appears more than once, so only the users who logged in exactly once remain. Return the new head.",
      examples: [
        { input: '1 → 2 → 3 → 3 → 4 → 4 → 5', output: '1 → 2 → 5', explain: '3 and 4 repeat, so all of their nodes go.' },
        { input: '1 → 1 → 1 → 2 → 3', output: '2 → 3', explain: 'The head itself is removed.' },
      ],
      constraints: ['0 ≤ n ≤ 300', '-100 ≤ val ≤ 100', 'the list is sorted ascending'],
      hints: [
        'Because the list is sorted, copies of the same id always sit next to each other as one run.',
        'The head might be part of a run, so put a dummy in front.',
        'Keep `prev` = the last node you are sure to keep. When `curr` starts a run (its next has the same value), skip the whole run and set `prev.next` to the node after it. Do not move `prev` in that case.',
      ],
      approaches: [
        {
          name: 'Count, then rebuild',
          idea: 'First pass: count each value in a map. Second pass: keep only nodes whose count is 1. Correct, but it ignores that the list is sorted and needs a map.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Dummy + skip whole runs',
          idea: 'Sorted means each repeated id is one block of neighbors. When you see a block, jump over all of it and link `prev` straight to whatever comes after. A dummy handles a block at the very front.',
          pseudo: `function deleteDuplicates(head):
    dummy ← new node(0)
    dummy.next ← head
    prev ← dummy                       // last node we keep
    curr ← head
    while curr ≠ null:
        if curr.next ≠ null and curr.next.val = curr.val:
            dup ← curr.val
            while curr ≠ null and curr.val = dup:
                curr ← curr.next       // skip the whole run
            prev.next ← curr           // unlink it
        else:
            prev ← curr
            curr ← curr.next
    return dummy.next`,
          code: `function deleteDuplicates(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  let curr = head;
  while (curr) {
    if (curr.next && curr.next.val === curr.val) {
      const dup = curr.val;
      while (curr && curr.val === dup) curr = curr.next;
      prev.next = curr;
    } else {
      prev = curr;
      curr = curr.next;
    }
  }
  return dummy.next;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'deleteDuplicates',
      starter: `function deleteDuplicates(head) {
  // Your code here: drop every value that appears more than once.
  return head;
}`,
      solution: `function deleteDuplicates(head) {
  const dummy = new ListNode(0, head);
  let prev = dummy;
  let curr = head;
  while (curr) {
    if (curr.next && curr.next.val === curr.val) {
      const dup = curr.val;
      while (curr && curr.val === dup) curr = curr.next;
      prev.next = curr;
    } else {
      prev = curr;
      curr = curr.next;
    }
  }
  return dummy.next;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 3, 3, 4, 4, 5]], expected: [1, 2, 5] },
        { name: 'run at the head', args: [[1, 1, 1, 2, 3]], expected: [2, 3] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'one node', args: [[1]], expected: [1] },
        { name: 'only a run', args: [[1, 1]], expected: [] },
        { name: 'run at the tail', args: [[1, 2, 2]], expected: [1] },
        { name: 'negatives', args: [[-2, -2, 0, 1, 1, 3]], expected: [0, 3] },
        { name: 'no repeats', args: [[1, 2, 3]], expected: [1, 2, 3] },
        { name: 'two runs back to back', args: [[4, 4, 5, 5, 6]], expected: [6] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'In a sorted list, equal values form one run. Skip the run, then link `prev` past it.',
    },
  ],
  quiz: [
    {
      prompt: 'Why do we return `dummy.next` and not `dummy`?',
      options: [
        'The dummy is a fake node we added. The real answer starts right after it.',
        '`dummy` is always null at the end.',
        'Returning `dummy` would be slower.',
      ],
      answer: 0,
      explanation: 'The dummy only exists so the first append is not special. It holds a made-up value (0) that must not appear in the answer.',
    },
    {
      prompt: "In Priority boarding, the list is `4 → 1` and x = 3. What goes wrong if you forget `big.next = null`?",
      options: [
        'Nothing, the answer is still 1 → 4.',
        "Node 4 still points at node 1, so the answer 1 → 4 → 1 → 4 … loops forever.",
        'The answer comes out as 4 → 1.',
      ],
      answer: 1,
      explanation: 'Node 4 is the tail of the big list, but its old `next` is still node 1. Glue small (1) to big (4), and 4 points back at 1: a loop. Always cut the last node.',
    },
    {
      prompt: 'Merging two sorted lists of lengths n and m with the dummy method costs…',
      options: ['O(n · m) time', 'O((n + m) log(n + m)) time', 'O(n + m) time, O(1) extra space'],
      answer: 2,
      explanation: 'Every step links one node and never looks back, so it is one pass over both lists. We only re-link existing nodes, so no extra memory.',
    },
  ],
  takeaways: [
    'If the head of the answer can change, start from a dummy node and return `dummy.next`.',
    'Keep a `tail` pointer to append in O(1). Two groups? Two dummies, then glue.',
    'Re-used nodes keep their old `next`. Cut the last one with `tail.next = null`.',
    'To delete a node, stand on the node before it.',
  ],
};

export default lesson;
