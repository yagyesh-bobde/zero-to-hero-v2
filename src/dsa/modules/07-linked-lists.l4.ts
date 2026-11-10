import type { Lesson } from '../types';

// Module 7, lesson 4: combine the moves (find middle + reverse half + walk/weave).
const lesson: Lesson = {
  id: 'combine-moves',
  title: 'Combining the moves: middle, reverse, weave',
  summary: 'Find the middle, flip the back half, then walk both halves together.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'DJ mode',
      text: "A party speaker has a \"DJ mode\": it plays the first song, then the last, then the second, then the second-to-last, and so on, so old and new tracks keep alternating. The queue is a singly linked list. You can only walk it forward, but this order keeps asking for \"the next one from the back\".",
    },
    {
      kind: 'text',
      text: "**The problem.** Rearrange `1 → 2 → 3 → 4 → 5 → 6` into `1 → 6 → 2 → 5 → 3 → 4` by re-linking nodes, using O(1) extra memory.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: put the nodes in an array',
      code: `function reorderBrute(head):
    nodes ← every node of the list, in order    // an array
    i ← 0
    j ← n - 1
    while i < j:
        nodes[i].next ← nodes[j]                 // front → back
        i ← i + 1
        if i < j:
            nodes[j].next ← nodes[i]             // back → next front
        j ← j - 1
    nodes[i].next ← null
    return head`,
    },
    {
      kind: 'text',
      text: "With an array you can jump to the back, so two pointers from both ends do the job: **O(n)** time, **O(n)** memory for the array.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** The array exists only so we can walk the back half *backwards*. But you already know how to make a list walkable in the other direction: reverse it, in place, for free. And you know how to find where the back half starts: fast & slow pointers.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Three moves you already own',
      text: "**1. Middle:** fast & slow pointers find where the first half ends. **2. Reverse:** flip the second half, so its last node becomes a head you can start from. **3. Walk together:** a pointer on each half, moving in step. Weave them (DJ mode), compare them (palindrome), or add them (twin sums). Each move is O(n) time and O(1) memory, so the whole thing is too.",
    },
    {
      kind: 'steps',
      title: 'DJ mode on 1 → 2 → 3 → 4 → 5 → 6',
      frames: [
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 0, fast: 0 }, note: 'Move 1: find the end of the first half. Loop while `fast.next` and `fast.next.next` exist.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 1, fast: 2 }, active: [1, 2], note: 'slow +1, fast +2.' },
        { cells: [1, 2, 3, 4, 5, 6], pointers: { slow: 2, fast: 4 }, active: [2], note: '`fast.next.next` is null, so stop. `slow` (3) is the last node of the first half.' },
        { cells: [1, 2, 3, 6, 5, 4], active: [3, 4, 5], vars: { first: '1→2→3', second: '6→5→4' }, note: 'Move 2: cut after 3 (`slow.next = null`) and reverse the second half. 4→5→6 becomes 6→5→4.' },
        { cells: [1, 2, 3, 6, 5, 4], pointers: { p: 0, q: 3 }, active: [0, 3], vars: { result: '1 → 6' }, note: 'Move 3: weave. Link 1 to 6, then 6 to the next front node.' },
        { cells: [1, 2, 3, 6, 5, 4], pointers: { p: 1, q: 4 }, active: [1, 4], vars: { result: '1 → 6 → 2 → 5' }, note: 'Next pair: 2 then 5.' },
        { cells: [1, 2, 3, 6, 5, 4], pointers: { p: 2, q: 5 }, active: [2, 5], vars: { result: '1 → 6 → 2 → 5 → 3 → 4' }, note: 'Last pair: 3 then 4. `q` runs out, so we stop.' },
        { cells: [1, 6, 2, 5, 3, 4], found: [0, 1, 2, 3, 4, 5], note: 'Done: same six nodes, new links, no extra memory.' },
      ],
    },
    {
      kind: 'table',
      title: 'Which middle do you need?',
      head: ['loop condition (both start at head)', 'on 1→…→6 slow stops on', 'on 1→…→5', 'use it to'],
      rows: [
        ['`fast && fast.next`', '4 (second middle)', '3', 'return the middle; twin sums'],
        ['`fast.next && fast.next.next`', '3 (first middle)', '3', 'split into halves: cut after `slow`'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Reorder (DJ mode)',
      code: `function reorderList(head):
    if head = null or head.next = null:
        return head
    // move 1: find the end of the first half
    slow ← head
    fast ← head
    while fast.next ≠ null and fast.next.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    // move 2: reverse the second half, then cut
    second ← reverse(slow.next)
    slow.next ← null
    // move 3: weave
    first ← head
    while second ≠ null:
        n1 ← first.next
        n2 ← second.next
        first.next ← second
        second.next ← n1
        first ← n1
        second ← n2
    return head`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function reorderList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = reverse(slow.next);
  slow.next = null;
  let first = head;
  while (second) {
    const n1 = first.next;
    const n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
  return head;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
    },
    {
      kind: 'compare',
      title: 'Reorder list',
      rows: [
        { approach: 'Array of nodes + two pointers', time: 'O(n)', space: 'O(n)', note: 'Simplest to get right. A fine first answer.' },
        { approach: 'Middle + reverse + weave', time: 'O(n)', space: 'O(1)', note: 'Three O(n) passes, nothing stored. The follow-up interviewers ask for.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: the mirror trick',
      code: `mid ← end of the first half            // fast & slow
back ← reverse(mid.next)                // in-place reversal
mid.next ← null                         // if you need two clean lists
front ← head
while back ≠ null:                      // back half is never longer
    use front and back together         // compare, add or weave
    front ← front.next
    back ← back.next`,
    },
    {
      kind: 'text',
      text: "**Signals.** The task pairs the i-th node with the i-th node *from the end*: \"palindrome\", \"twin\", \"first with last\", \"fold the list\". With an array you would use two pointers from both ends; with a singly linked list, use the mirror trick.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Cut, and say what you broke',
      text: "In Reorder, forgetting `slow.next = null` leaves the first half still pointing into the second, and the weave builds a loop. Also, these tricks **change the input list**. In an interview, say so, and offer to reverse the second half back before returning if the caller still needs the list.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-reorder',
      title: 'DJ mode',
      difficulty: 'medium',
      leetcode: 143,
      pattern: 'Middle + reverse + weave',
      statement: "Rearrange the list `L0 → L1 → … → Ln-1` into `L0 → Ln-1 → L1 → Ln-2 → L2 → …` (first, last, second, second-to-last, …). Re-link the nodes, do not change values. Change the list in place and return its head.",
      examples: [
        { input: '1 → 2 → 3 → 4', output: '1 → 4 → 2 → 3' },
        { input: '1 → 2 → 3 → 4 → 5', output: '1 → 5 → 2 → 4 → 3' },
      ],
      constraints: ['0 ≤ n ≤ 5 · 10⁴'],
      hints: [
        'The order keeps asking for nodes from the back. How can you walk the back half from its end?',
        'Find the end of the first half with fast & slow (`while fast.next && fast.next.next`).',
        'Reverse the part after `slow`, cut with `slow.next = null`, then weave: one node from the front half, one from the reversed back half.',
      ],
      approaches: [
        {
          name: 'Array of nodes',
          idea: 'Store every node in an array so you can index the back. Then link `nodes[i]` → `nodes[j]` → `nodes[i + 1]`… with i rising and j falling.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Middle + reverse + weave',
          idea: 'Reversing the back half turns "the next node from the end" into "the next node of a list", so a forward walk is enough. Fast & slow tells you where the back half starts.',
          pseudo: `function reorderList(head):
    if head = null or head.next = null:
        return head
    slow ← head
    fast ← head
    while fast.next ≠ null and fast.next.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    second ← reverse(slow.next)
    slow.next ← null
    first ← head
    while second ≠ null:
        n1 ← first.next
        n2 ← second.next
        first.next ← second
        second.next ← n1
        first ← n1
        second ← n2
    return head`,
          code: `function reorderList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = reverse(slow.next);
  slow.next = null;
  let first = head;
  while (second) {
    const n1 = first.next;
    const n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
  return head;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'reorderList',
      starter: `function reorderList(head) {
  // Your code here: first, last, second, second-to-last, ... Return the head.
  return head;
}`,
      solution: `function reorderList(head) {
  if (!head || !head.next) return head;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let second = reverse(slow.next);
  slow.next = null;
  let first = head;
  while (second) {
    const n1 = first.next;
    const n2 = second.next;
    first.next = second;
    second.next = n1;
    first = n1;
    second = n2;
  }
  return head;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
      tests: [
        { name: 'even length', args: [[1, 2, 3, 4]], expected: [1, 4, 2, 3] },
        { name: 'odd length', args: [[1, 2, 3, 4, 5]], expected: [1, 5, 2, 4, 3] },
        { name: 'one node', args: [[1]], expected: [1] },
        { name: 'two nodes', args: [[1, 2]], expected: [1, 2] },
        { name: 'three nodes', args: [[1, 2, 3]], expected: [1, 3, 2] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'six nodes', args: [[10, 20, 30, 40, 50, 60]], expected: [10, 60, 20, 50, 30, 40] },
      ],
      shapes: { args: ['list'], result: 'list' },
      takeaway: 'Need the list from both ends? Reverse the back half and walk forward.',
    },
    {
      id: 'linked-lists-palindrome',
      title: 'Same both ways?',
      difficulty: 'easy',
      leetcode: 234,
      pattern: 'Middle + reverse + walk together',
      statement: "A streaming parser hands you a word one letter per node (as numbers here). Return `true` if the list reads the same forwards and backwards. Easy with an array; the real challenge is O(1) extra memory.",
      examples: [
        { input: '1 → 2 → 2 → 1', output: 'true' },
        { input: '1 → 2', output: 'false' },
        { input: '1 → 2 → 3 → 2 → 1', output: 'true', explain: 'The middle 3 is compared with nothing; it always matches itself.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ val ≤ 9'],
      hints: [
        'Copying the values into an array and using two pointers from both ends works. Now drop the array.',
        'A palindrome means: the first half equals the second half read backwards.',
        'Find the end of the first half, reverse what comes after it, then walk both halves comparing values until the reversed half runs out.',
      ],
      approaches: [
        {
          name: 'Copy to an array',
          idea: 'Copy every value into an array, then compare `arr[i]` with `arr[n - 1 - i]` moving inward.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Middle + reverse + compare',
          idea: 'Reverse the second half in place so you can walk it from the end. The halves must match value by value. The odd middle node sits in the first half and is never compared, which is right.',
          pseudo: `function isPalindrome(head):
    if head = null or head.next = null:
        return true
    slow ← head
    fast ← head
    while fast.next ≠ null and fast.next.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    q ← reverse(slow.next)
    p ← head
    while q ≠ null:
        if p.val ≠ q.val:
            return false
        p ← p.next
        q ← q.next
    return true`,
          code: `function isPalindrome(head) {
  if (!head || !head.next) return true;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let q = reverse(slow.next);
  let p = head;
  while (q) {
    if (p.val !== q.val) return false;
    p = p.next;
    q = q.next;
  }
  return true;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'isPalindrome',
      starter: `function isPalindrome(head) {
  // Your code here: true if the list reads the same both ways.
  return false;
}`,
      solution: `function isPalindrome(head) {
  if (!head || !head.next) return true;
  let slow = head;
  let fast = head;
  while (fast.next && fast.next.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let q = reverse(slow.next);
  let p = head;
  while (q) {
    if (p.val !== q.val) return false;
    p = p.next;
    q = q.next;
  }
  return true;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
      tests: [
        { name: 'even palindrome', args: [[1, 2, 2, 1]], expected: true },
        { name: 'two different', args: [[1, 2]], expected: false },
        { name: 'one node', args: [[1]], expected: true },
        { name: 'odd palindrome', args: [[1, 2, 3, 2, 1]], expected: true },
        { name: 'almost', args: [[1, 2, 3, 3, 1]], expected: false },
        { name: 'two equal', args: [[1, 1]], expected: true },
        { name: 'ends differ', args: [[1, 0, 0]], expected: false },
        { name: 'three, palindrome', args: [[9, 8, 9]], expected: true },
      ],
      shapes: { args: ['list'] },
      takeaway: 'Palindrome on a list = first half vs reversed second half.',
    },
    {
      id: 'linked-lists-twin-sum',
      title: 'Best twin pair',
      difficulty: 'medium',
      leetcode: 2130,
      pattern: 'Middle + reverse + walk together',
      statement: "A list has an **even** number of nodes, n. Node i (counting from 0) and node n − 1 − i are *twins*: the first and the last, the second and the second-to-last, and so on. A twin sum is the two values added. Return the **largest** twin sum.",
      examples: [
        { input: '5 → 4 → 2 → 1', output: '6', explain: 'Twins: 5 + 1 = 6 and 4 + 2 = 6.' },
        { input: '4 → 2 → 2 → 3', output: '7', explain: '4 + 3 = 7 beats 2 + 2 = 4.' },
      ],
      constraints: ['2 ≤ n ≤ 10⁵, n is even', '1 ≤ val ≤ 10⁵'],
      hints: [
        'Twins are mirror images around the middle, just like in a palindrome check.',
        'Find the start of the second half with the usual `fast && fast.next` loop (slow lands on the second middle).',
        'Reverse from `slow` onward, then walk from the head and from the reversed half together, keeping the best sum.',
      ],
      approaches: [
        {
          name: 'Copy to an array',
          idea: 'Copy the values, then check `arr[i] + arr[n - 1 - i]` for every i in the first half.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Middle + reverse + walk together',
          idea: 'After reversing the second half, the twin of the i-th node from the front is the i-th node of the reversed half, so one walk visits every twin pair.',
          pseudo: `function pairSum(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    q ← reverse(slow)               // slow = first node of the second half
    p ← head
    best ← 0
    while q ≠ null:
        best ← max(best, p.val + q.val)
        p ← p.next
        q ← q.next
    return best`,
          code: `function pairSum(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let q = reverse(slow);
  let p = head;
  let best = 0;
  while (q) {
    best = Math.max(best, p.val + q.val);
    p = p.next;
    q = q.next;
  }
  return best;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'pairSum',
      starter: `function pairSum(head) {
  // Your code here: return the largest sum of node i and node n-1-i.
  return 0;
}`,
      solution: `function pairSum(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  let q = reverse(slow);
  let p = head;
  let best = 0;
  while (q) {
    best = Math.max(best, p.val + q.val);
    p = p.next;
    q = q.next;
  }
  return best;
}

function reverse(head) {
  // lesson 3's loop, written short
  let prev = null;
  while (head) [head.next, prev, head] = [prev, head, head.next];
  return prev;
}`,
      tests: [
        { name: 'all twins equal', args: [[5, 4, 2, 1]], expected: 6 },
        { name: 'outer pair wins', args: [[4, 2, 2, 3]], expected: 7 },
        { name: 'two nodes, big value', args: [[1, 100000]], expected: 100001 },
        { name: 'smallest list', args: [[1, 2]], expected: 3 },
        { name: 'six nodes, all equal sums', args: [[1, 2, 3, 4, 5, 6]], expected: 7 },
        { name: 'outer pair huge', args: [[9, 1, 1, 1, 1, 2]], expected: 11 },
        { name: 'inner pair loses', args: [[3, 8, 1, 7]], expected: 10 },
      ],
      shapes: { args: ['list'] },
      takeaway: 'Any "i-th from the front with i-th from the back" question on a list is the mirror trick.',
    },
  ],
  quiz: [
    {
      prompt: 'You want to split `1 → 2 → 3 → 4` into `1 → 2` and `3 → 4`. Which loop leaves `slow` on 2?',
      options: [
        '`while (fast && fast.next)`',
        '`while (fast.next && fast.next.next)`',
        'Either one, they always stop on the same node.',
      ],
      answer: 1,
      explanation: 'The `fast.next.next` version stops one step earlier on even lengths, on the first middle. Then the second half is `slow.next`.',
    },
    {
      prompt: 'In Reorder, what goes wrong if you skip `slow.next = null`?',
      options: [
        'The first half still links into the second half, so the weave creates a loop.',
        'Nothing, the weave overwrites that link anyway.',
        'The answer comes out reversed.',
      ],
      answer: 0,
      explanation: "For `1 → 2 → 3 → 4`, node 2 still points at 3. In the last weave step, 3 gets linked to 2's old `next`, which is 3 itself: a loop. Always cut.",
    },
    {
      prompt: 'Why does the palindrome compare loop stop when `q` (the reversed half) runs out, and not when `p` does?',
      options: [
        'Because `p` is always null first.',
        'The reversed back half is never longer than the front half, so stopping on it never skips a pair.',
        'It makes no difference.',
      ],
      answer: 1,
      explanation: 'With the first-middle split, the front half has the same length or one more (the odd middle). Every pair is covered by the time `q` ends.',
    },
  ],
  takeaways: [
    'Hard-looking list problems are often 2-3 easy moves chained: middle, reverse, walk together.',
    'Pick the middle on purpose: `fast.next && fast.next.next` to split, `fast && fast.next` to land on the second middle.',
    'The mirror trick changes the input. Cut the halves cleanly, and offer to restore the list.',
  ],
};

export default lesson;
