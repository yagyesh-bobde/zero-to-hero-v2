import type { Lesson } from '../types';

// Module 7, lesson 5: walking two lists at once (digit addition with carry, intersection).
const lesson: Lesson = {
  id: 'two-lists',
  title: 'Two lists at once: big-number addition and meeting points',
  summary: 'Walk two lists in step: add digits with a carry, and find where two lists join.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Numbers too big for a number',
      text: "In JavaScript, `9007199254740993` prints as `9007199254740992`. Normal numbers stop being exact after about 16 digits. A crypto wallet counts balances in units of 10⁻¹⁸ and a bank ledger may need 30-digit totals, so big-number libraries store a number as a **chain of digits** and add it the way you learned in school: column by column, carrying the 1.",
    },
    {
      kind: 'text',
      text: "**The problem.** Two numbers are stored as linked lists of digits, **ones digit first**. `342` is `2 → 4 → 3` and `465` is `5 → 6 → 4`. Return their sum in the same form: `807` is `7 → 0 → 8`. The lists can be 100 digits long.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: turn them into numbers',
      code: `function addBrute(a, b):
    x ← number made from the digits of a
    y ← number made from the digits of b
    s ← x + y
    return a list of the digits of s, ones digit first`,
    },
    {
      kind: 'text',
      text: "Fine for small inputs. With 100-digit lists it silently gives the wrong answer, because `x` and `y` lose their last digits. (`BigInt` would hide the problem, but interviewers want the algorithm: it is exactly what `BigInt` does inside.)",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** You never need the whole number at once. Column addition only looks at **one digit from each number plus a carry**. And the lists already hand you the ones digit first, which is exactly the order you add in.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Walk both lists together, carry the 1',
      text: "Move a pointer down each list at the same time. At each step: `sum = digitA + digitB + carry`, write `sum % 10` into a new node, keep `carry = Math.floor(sum / 10)`. When one list is shorter, treat its missing digits as 0. Keep going while **either list or the carry** is left. A dummy node collects the answer.",
    },
    {
      kind: 'trace',
      title: '342 + 465 (lists 2 → 4 → 3 and 5 → 6 → 4)',
      columns: ['column', 'a', 'b', 'carry in', 'sum', 'write', 'carry out'],
      rows: [
        ['ones', 2, 5, 0, 7, 7, 0],
        ['tens', 4, 6, 0, 10, 0, 1],
        ['hundreds', 3, 4, 1, 8, 8, 0],
      ],
      note: "Answer: `7 → 0 → 8`, which is 807. For 99 + 1 (`9 → 9` and `1`) the loop runs a third time with only the carry left and writes the final 1: `0 → 0 → 1`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Add two numbers (ones digit first)',
      code: `function addTwoNumbers(a, b):
    dummy ← new node(0)
    tail ← dummy
    carry ← 0
    while a ≠ null or b ≠ null or carry > 0:
        sum ← carry
        if a ≠ null:
            sum ← sum + a.val
            a ← a.next
        if b ≠ null:
            sum ← sum + b.val
            b ← b.next
        tail.next ← new node(sum mod 10)
        tail ← tail.next
        carry ← floor(sum / 10)
    return dummy.next`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function addTwoNumbers(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;
  while (a || b || carry) {
    let sum = carry;
    if (a) {
      sum += a.val;
      a = a.next;
    }
    if (b) {
      sum += b.val;
      b = b.next;
    }
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    carry = Math.floor(sum / 10);
  }
  return dummy.next;
}`,
    },
    {
      kind: 'compare',
      title: 'Adding digit lists',
      rows: [
        { approach: 'Convert to numbers', time: 'O(n + m)', space: 'O(n + m)', note: 'Wrong past ~16 digits in JS.' },
        { approach: 'Column addition with carry', time: 'O(max(n, m))', space: 'O(1) extra', note: 'Exact for any length. The output list itself is not counted.' },
      ],
    },
    {
      kind: 'text',
      text: "**A second two-list trick: where do they meet?** In Git, every commit points to its parent. Two branches that split from `main` are two chains that **join** at a shared commit and share everything after it (what `git merge-base` looks for). In list terms: two lists that end in the same tail. Find the first shared node.",
    },
    {
      kind: 'diagram',
      title: 'Two lists, one shared tail',
      art: `A:     4 → 1 ↘
              8 → 4 → 5 → null
B: 5 → 6 → 1 ↗

p walks A, then B:  4 1 8 4 5 | 5 6 1 [8]
q walks B, then A:  5 6 1 8 4 5 | 4 1 [8]

Each walked 8 nodes first (2 + 3 + 3), so both
arrive at the shared node 8 on the same step.`,
      caption: "The brute force puts every node of A in a `Set` and walks B until it finds one: O(n) memory. The trick: when a pointer falls off the end, send it to the **other** list's head. Both pointers then cover A's own part + B's own part + the shared part, the same distance, so they reach the join together. No join? Both reach `null` together.",
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Switch tracks',
      code: `function getIntersectionNode(headA, headB) {
  let p = headA;
  let q = headB;
  while (p !== q) {
    p = p ? p.next : headB; // fell off A? continue on B
    q = q ? q.next : headA; // fell off B? continue on A
  }
  return p; // the shared node, or null if there is none
}`,
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: walk two lists in step',
      code: `p ← headA
q ← headB
state ← starting value            // e.g. carry ← 0
while p ≠ null or q ≠ null or state still matters:
    x ← p.val if p ≠ null, otherwise a neutral value (0)
    y ← q.val if q ≠ null, otherwise 0
    use x, y and state; append to the answer via a dummy
    if p ≠ null: p ← p.next
    if q ≠ null: q ← q.next`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The last carry, and nodes vs values',
      text: "Write `while (a || b || carry)`, not `while (a || b)`, or 99 + 1 comes out as 00 instead of 001. In the intersection problem, compare **nodes** (`p !== q`), not values: two different nodes can both hold 1 and still not be shared.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-add-two-numbers',
      title: 'Big-number adder',
      difficulty: 'medium',
      leetcode: 2,
      pattern: 'Walk two lists in step',
      statement: "Two non-negative whole numbers are stored as linked lists of digits, **ones digit first** (no leading zeros except the number 0 itself). Return their sum as a list in the same format. Lists can be up to 100 digits, too long for normal JS numbers.",
      examples: [
        { input: 'a = 2 → 4 → 3, b = 5 → 6 → 4', output: '7 → 0 → 8', explain: '342 + 465 = 807.' },
        { input: 'a = 9 → 9, b = 1', output: '0 → 0 → 1', explain: '99 + 1 = 100: the last carry makes a new node.' },
      ],
      constraints: ['1 ≤ digits per list ≤ 100', '0 ≤ digit ≤ 9'],
      hints: [
        'Do it the school way: one column at a time, starting with the ones. Which end of the list is that?',
        'Keep a `carry`. Each column: `sum = x + y + carry`, write `sum % 10`, new carry `Math.floor(sum / 10)`.',
        'Loop while `a || b || carry`. Use 0 for a list that already ended, and build the answer behind a dummy node.',
      ],
      approaches: [
        {
          name: 'Convert to numbers',
          idea: 'Read each list into a number, add, split the sum back into digits. Breaks after about 16 digits because JS numbers lose precision.',
          time: 'O(n + m)',
          space: 'O(n + m)',
        },
        {
          name: 'Column addition with carry',
          idea: 'A column only needs one digit from each list and the carry from the column before, so you never hold the whole number. The ones-first order means you can add while walking forward.',
          pseudo: `function addTwoNumbers(a, b):
    dummy ← new node(0)
    tail ← dummy
    carry ← 0
    while a ≠ null or b ≠ null or carry > 0:
        sum ← carry
        if a ≠ null:
            sum ← sum + a.val
            a ← a.next
        if b ≠ null:
            sum ← sum + b.val
            b ← b.next
        tail.next ← new node(sum mod 10)
        tail ← tail.next
        carry ← floor(sum / 10)
    return dummy.next`,
          code: `function addTwoNumbers(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;
  while (a || b || carry) {
    let sum = carry;
    if (a) {
      sum += a.val;
      a = a.next;
    }
    if (b) {
      sum += b.val;
      b = b.next;
    }
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    carry = Math.floor(sum / 10);
  }
  return dummy.next;
}`,
          time: 'O(max(n, m))',
          space: 'O(1) extra',
        },
      ],
      fn: 'addTwoNumbers',
      starter: `function addTwoNumbers(a, b) {
  // Your code here: return the sum as a digit list, ones digit first.
  return null;
}`,
      solution: `function addTwoNumbers(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  let carry = 0;
  while (a || b || carry) {
    let sum = carry;
    if (a) {
      sum += a.val;
      a = a.next;
    }
    if (b) {
      sum += b.val;
      b = b.next;
    }
    tail.next = new ListNode(sum % 10);
    tail = tail.next;
    carry = Math.floor(sum / 10);
  }
  return dummy.next;
}`,
      tests: [
        { name: '342 + 465', args: [[2, 4, 3], [5, 6, 4]], expected: [7, 0, 8] },
        { name: 'zeros', args: [[0], [0]], expected: [0] },
        { name: 'long carry chain', args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expected: [8, 9, 9, 9, 0, 0, 0, 1] },
        { name: '5 + 5', args: [[5], [5]], expected: [0, 1] },
        { name: 'add zero', args: [[1, 8], [0]], expected: [1, 8] },
        { name: '99 + 1', args: [[9, 9], [1]], expected: [0, 0, 1] },
        { name: '20 nines + 1', args: [Array(20).fill(9), [1]], expected: [...Array(20).fill(0), 1] },
      ],
      shapes: { args: ['list', 'list'], result: 'list' },
      takeaway: 'Two lists in step + a carry + a dummy. Loop while anything is left, including the carry.',
    },
    {
      id: 'linked-lists-add-two-numbers-ii',
      title: 'Big-number adder, normal order',
      difficulty: 'medium',
      leetcode: 445,
      pattern: 'Walk two lists in step',
      statement: "Same adder, but now the digits are stored the way people write them: **most significant digit first**. `7243` is `7 → 2 → 4 → 3`. Return the sum in the same order. Bonus: do not change the input lists.",
      examples: [
        { input: 'a = 7 → 2 → 4 → 3, b = 5 → 6 → 4', output: '7 → 8 → 0 → 7', explain: '7243 + 564 = 7807.' },
        { input: 'a = 9 → 9, b = 1', output: '1 → 0 → 0' },
      ],
      constraints: ['1 ≤ digits per list ≤ 100', '0 ≤ digit ≤ 9', 'no leading zeros except the number 0'],
      hints: [
        'Addition starts at the ones digit, but now that digit is at the end of each list. How can you reach the digits back to front?',
        'Option 1: reverse both lists (lesson 3), run the previous problem, reverse the answer. Option 2: push every digit onto a stack.',
        'With stacks, pop one digit from each, add with the carry, and put each new node at the **front** of the answer (`head = new ListNode(digit, head)`). Then no final reverse is needed.',
      ],
      approaches: [
        {
          name: 'Convert to numbers',
          idea: 'Same problem as before: JS numbers are not exact past ~16 digits.',
          time: 'O(n + m)',
          space: 'O(n + m)',
        },
        {
          name: 'Reverse, add, reverse',
          idea: 'Reverse both lists so the ones digit comes first, reuse the column adder, then reverse the result. O(1) extra memory, but it scrambles the caller\'s input unless you reverse it back.',
          time: 'O(n + m)',
          space: 'O(1) extra',
        },
        {
          name: 'Two stacks + build from the front',
          idea: 'A stack hands digits back last-in-first-out, so popping gives ones, tens, hundreds… Each new digit belongs in *front* of the ones already made, so prepend it. The inputs are never touched.',
          pseudo: `function addTwoNumbersII(a, b):
    s1 ← stack of a's digits          // last digit on top
    s2 ← stack of b's digits
    head ← null
    carry ← 0
    while s1 not empty or s2 not empty or carry > 0:
        sum ← carry
        if s1 not empty: sum ← sum + pop from s1
        if s2 not empty: sum ← sum + pop from s2
        head ← new node(sum mod 10, next = head)   // prepend
        carry ← floor(sum / 10)
    return head`,
          code: `function addTwoNumbersII(a, b) {
  const s1 = [];
  const s2 = [];
  for (; a; a = a.next) s1.push(a.val);
  for (; b; b = b.next) s2.push(b.val);
  let head = null;
  let carry = 0;
  while (s1.length || s2.length || carry) {
    const sum = (s1.pop() ?? 0) + (s2.pop() ?? 0) + carry;
    head = new ListNode(sum % 10, head);
    carry = Math.floor(sum / 10);
  }
  return head;
}`,
          time: 'O(n + m)',
          space: 'O(n + m)',
        },
      ],
      fn: 'addTwoNumbersII',
      starter: `function addTwoNumbersII(a, b) {
  // Your code here: digits are most significant first. Return the sum the same way.
  return null;
}`,
      solution: `function addTwoNumbersII(a, b) {
  const s1 = [];
  const s2 = [];
  for (; a; a = a.next) s1.push(a.val);
  for (; b; b = b.next) s2.push(b.val);
  let head = null;
  let carry = 0;
  while (s1.length || s2.length || carry) {
    const sum = (s1.pop() ?? 0) + (s2.pop() ?? 0) + carry;
    head = new ListNode(sum % 10, head);
    carry = Math.floor(sum / 10);
  }
  return head;
}`,
      tests: [
        { name: '7243 + 564', args: [[7, 2, 4, 3], [5, 6, 4]], expected: [7, 8, 0, 7] },
        { name: '243 + 564', args: [[2, 4, 3], [5, 6, 4]], expected: [8, 0, 7] },
        { name: 'zeros', args: [[0], [0]], expected: [0] },
        { name: '99 + 1', args: [[9, 9], [1]], expected: [1, 0, 0] },
        { name: '1 + 999', args: [[1], [9, 9, 9]], expected: [1, 0, 0, 0] },
        { name: '5 + 5', args: [[5], [5]], expected: [1, 0] },
        { name: 'add zero', args: [[1, 2, 3], [0]], expected: [1, 2, 3] },
        { name: '18 nines + 1', args: [Array(18).fill(9), [1]], expected: [1, ...Array(18).fill(0)] },
      ],
      shapes: { args: ['list', 'list'], result: 'list' },
      takeaway: 'Need a list back to front without touching it? Push it on a stack. Building an answer back to front? Prepend.',
    },
    {
      id: 'linked-lists-intersection',
      title: 'Where the branches join',
      difficulty: 'easy',
      leetcode: 160,
      pattern: 'Walk two lists in step',
      statement: "Two linked lists may join at some node and share every node after it (like two Git branches sharing history). Return the **first shared node**, or `null` if they never join. Do not change the lists. The test helper `runIntersection(a, b, shared)` is already written for you: it builds list A from `a` + `shared` and list B from `b` + `shared` (the shared part is the very same nodes), calls your `getIntersectionNode`, and reports the **value** of the node you return (or null).",
      examples: [
        { input: 'a = [4, 1], b = [5, 6, 1], shared = [8, 4, 5]', output: '8', explain: 'A is 4 → 1 → 8 → 4 → 5, B is 5 → 6 → 1 → 8 → 4 → 5. The 1s are different nodes; the first shared node is 8.' },
        { input: 'a = [2, 6, 4], b = [1, 5], shared = []', output: 'null' },
      ],
      constraints: ['0 ≤ lengths ≤ 3 · 10⁴'],
      hints: [
        'A `Set` of every node in A, then walk B until you hit one, works in O(n) memory. Can you use O(1)?',
        'If both lists had the same length before the join, walking them in step would make the pointers arrive together. They do not.',
        'Fix the length difference for free: when a pointer falls off the end of its list, send it to the head of the *other* list. Loop until `p === q`.',
      ],
      approaches: [
        {
          name: 'Set of nodes',
          idea: 'Store every node of A in a set. Walk B; the first node already in the set is the join.',
          time: 'O(n + m)',
          space: 'O(n)',
        },
        {
          name: 'Switch tracks',
          idea: 'Pointer p walks A then B, q walks B then A. Each covers A-only + B-only + shared, the same total, so they land on the first shared node at the same moment (or both on null).',
          pseudo: `function getIntersectionNode(headA, headB):
    p ← headA
    q ← headB
    while p ≠ q:                       // compare nodes, not values
        p ← p.next if p ≠ null, otherwise headB
        q ← q.next if q ≠ null, otherwise headA
    return p`,
          code: `function getIntersectionNode(headA, headB) {
  let p = headA;
  let q = headB;
  while (p !== q) {
    p = p ? p.next : headB;
    q = q ? q.next : headA;
  }
  return p;
}`,
          time: 'O(n + m)',
          space: 'O(1)',
        },
      ],
      fn: 'runIntersection',
      starter: `function getIntersectionNode(headA, headB) {
  // Your code here: return the first node both lists share, or null.
  return null;
}

// Test helper (already written for you, don't edit): builds A = a + shared and
// B = b + shared (the shared nodes are the same objects), then reports the
// value of the node your function returns.
function runIntersection(a, b, shared) {
  const build = (values, tail) => values.reduceRight((next, v) => new ListNode(v, next), tail);
  const common = build(shared, null);
  const node = getIntersectionNode(build(a, common), build(b, common));
  return node ? node.val : null;
}`,
      solution: `function getIntersectionNode(headA, headB) {
  let p = headA;
  let q = headB;
  while (p !== q) {
    p = p ? p.next : headB;
    q = q ? q.next : headA;
  }
  return p;
}

// Test helper (already written for you, don't edit): builds A = a + shared and
// B = b + shared (the shared nodes are the same objects), then reports the
// value of the node your function returns.
function runIntersection(a, b, shared) {
  const build = (values, tail) => values.reduceRight((next, v) => new ListNode(v, next), tail);
  const common = build(shared, null);
  const node = getIntersectionNode(build(a, common), build(b, common));
  return node ? node.val : null;
}`,
      tests: [
        { name: 'classic', args: [[4, 1], [5, 6, 1], [8, 4, 5]], expected: 8 },
        { name: 'A longer', args: [[1, 9, 1], [3], [2, 4]], expected: 2 },
        { name: 'never join', args: [[2, 6, 4], [1, 5], []], expected: null },
        { name: 'same list', args: [[], [], [7]], expected: 7 },
        { name: 'B starts at the join', args: [[1, 2, 3], [], [4]], expected: 4 },
        { name: 'both empty', args: [[], [], []], expected: null },
        { name: 'B much longer', args: [[1], [2, 3, 4, 5], [6, 7]], expected: 6 },
        { name: 'equal values, different nodes', args: [[1, 5], [2, 5], [7]], expected: 7 },
      ],
      takeaway: 'Different lengths? Let each pointer walk both lists; the extra length cancels out.',
    },
  ],
  quiz: [
    {
      prompt: 'Why must the adder loop be `while (a || b || carry)`?',
      options: [
        'So it handles empty input.',
        'A carry can be left after both lists end (99 + 1 = 100) and it needs its own node.',
        'It makes the loop faster.',
      ],
      answer: 1,
      explanation: 'When the last column overflows, the carry becomes a new leading digit. Stopping when the lists end would drop it.',
    },
    {
      prompt: 'The digits are stored ones digit first. Why is that convenient?',
      options: [
        'It is the order column addition goes, so you can add while walking forward.',
        'It uses less memory.',
        'It is not convenient; you still need to reverse.',
      ],
      answer: 0,
      explanation: 'School addition starts at the ones column. Ones-first lists give you that digit first. When the order is flipped (the second adder), you need a stack or a reversal.',
    },
    {
      prompt: 'A has 2 nodes of its own, B has 5 of its own, and they share 3. With "switch tracks", how many nodes does each pointer pass before both reach the shared node?',
      options: ['5 and 8', '7 each', '10 each'],
      answer: 2,
      explanation: "p passes A's own 2, the shared 3, then B's own 5: 10 nodes. q passes B's own 5, the shared 3, then A's own 2: also 10. Same distance, so they step onto the shared node together.",
    },
  ],
  takeaways: [
    'Two lists in step: move both pointers together, treat a finished list as 0, and keep going while the carry is not 0.',
    'Need digits back to front without changing the input? Use a stack, and prepend nodes to build the answer.',
    'Two lists that join: switch to the other head at the end; both pointers then walk the same distance.',
  ],
};

export default lesson;
