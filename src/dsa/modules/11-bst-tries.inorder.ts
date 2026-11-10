import type { Lesson } from '../types';

// Lesson 2 of module 11: in-order traversal of a BST gives sorted order.

/** Monospace art without the leading newline; backslashes kept as typed. */
const art = (s: TemplateStringsArray) => s.raw[0].slice(1);

const T = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13];

export const inorderLesson: Lesson = {
  id: 'bst-inorder-sorted',
  title: 'In-order is sorted: validate and kth smallest',
  summary: 'Walk a BST left, node, right and the values come out sorted. Most BST questions are now array questions.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: "'Price: low to high' for free",
      text: "An online shop keeps its products in a BST keyed by price. You tap 'Price: low to high'. The shop does not run a sort. It walks the tree in a fixed order (left subtree, then the node, then the right subtree) and the products come out cheapest first. Want the 3rd cheapest? Stop after three.",
    },
    {
      kind: 'text',
      text: "The problem: a teammate hands you a tree and says 'it's a BST'. Before you trust any search on it, check. Is the tree below a valid BST?",
    },
    {
      kind: 'diagram',
      title: 'Is this a BST?',
      art: art`
         5
        / \
       4   6
          / \
         3   7`,
      caption: 'Level order: `[5,4,6,null,null,3,7]`.',
    },
    {
      kind: 'text',
      text: "First try: check each node against its two children. 5 > 4 and 5 < 6, fine. 6 > 3 and 6 < 7, fine. Every node passes. But it is **not** a BST: 3 sits in the right subtree of 5, and everything there must be bigger than 5. The rule is about the whole subtree, not just the children. A correct brute force checks every node against the max of its left subtree and the min of its right subtree.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: compare with whole subtrees',
      code: `function isBST(node):
    if node = null:
        return true
    if node.left ≠ null and maxOf(node.left) ≥ node.val:
        return false
    if node.right ≠ null and minOf(node.right) ≤ node.val:
        return false
    return isBST(node.left) and isBST(node.right)
// maxOf / minOf visit a whole subtree each time`,
    },
    {
      kind: 'text',
      text: 'It is correct, but `maxOf` and `minOf` walk the same nodes again and again: a node deep in the tree gets visited once for every ancestor. On a stick-shaped tree that is **O(n²)**.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'In-order walk of a BST = sorted order',
      text: "In-order (left, node, right, from module 10) visits everything smaller than a node before it and everything bigger after it. So a tree is a BST **exactly when its in-order sequence is strictly increasing**. You don't even need the list: just remember the previous value and check each new one is bigger.",
    },
    {
      kind: 'steps',
      title: 'In-order walk of the suspicious tree',
      frames: [
        { cells: [4, 5, 3, 6, 7], pointers: { cur: 0 }, active: [0], vars: { prev: '-∞' }, note: 'In-order starts at the leftmost node, 4. Is 4 > prev (-∞)? Yes. prev = 4.' },
        { cells: [4, 5, 3, 6, 7], pointers: { cur: 1 }, active: [1], done: [0], vars: { prev: 4 }, note: 'Next comes the root, 5. Is 5 > 4? Yes. prev = 5.' },
        { cells: [4, 5, 3, 6, 7], pointers: { cur: 2 }, active: [1, 2], done: [0], vars: { prev: 5 }, note: 'Now the right subtree starts with its leftmost node, 3. Is 3 > 5? **No.** The sequence went down.' },
        { cells: [4, 5, 3, 6, 7], pointers: { cur: 2 }, active: [2], done: [0, 1, 3, 4], vars: { prev: 5, answer: 'false' }, note: 'Stop right away: not a BST. One pass, O(n), and you found the grandchild bug the children-only check missed.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Validate with in-order + prev',
      code: `function isValidBST(root):
    prev ← -infinity
    function inorder(node):
        if node = null:
            return true
        if not inorder(node.left):
            return false
        if node.val ≤ prev:            // must be strictly increasing
            return false
        prev ← node.val
        return inorder(node.right)
    return inorder(root)`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function isValidBST(root) {
  let prev = -Infinity;
  const inorder = (node) => {
    if (!node) return true;
    if (!inorder(node.left)) return false;
    if (node.val <= prev) return false;
    prev = node.val;
    return inorder(node.right);
  };
  return inorder(root);
}`,
    },
    {
      kind: 'text',
      text: "Once you see in-order as 'a sorted array I can walk', lots of questions get easy. **Kth smallest**: count nodes as you visit, stop at k. **Smallest gap between two values**: in a sorted list the closest pair is always next to each other, so compare each value with `prev`. To *pause* the walk (stop at k, or hand out one value at a time) use the loop version with your own stack.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: in-order with a stack (pausable)',
      code: `function inorderSteps(root):
    stack ← empty stack
    node ← root
    while node ≠ null or stack is not empty:
        while node ≠ null:             // go as far left as you can
            push node onto stack
            node ← node.left
        node ← pop from stack          // the next value in sorted order
        visit(node)                    // count it, compare with prev, or stop
        node ← node.right              // then do its right subtree`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Kth smallest, stopping early',
      code: `function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    k -= 1;
    if (k === 0) return node.val;
    node = node.right;
  }
  return -1;
}`,
    },
    {
      kind: 'compare',
      title: 'Is it a BST?',
      rows: [
        { approach: 'Check children only', time: 'O(n)', space: 'O(h)', note: '**Wrong.** Misses a small value deep in a right subtree.' },
        { approach: 'Max/min of whole subtrees', time: 'O(n²) worst', space: 'O(h)', note: 'Correct, but re-walks the same nodes for every ancestor.' },
        { approach: 'Pass bounds down (lo, hi)', time: 'O(n)', space: 'O(h)', note: 'Each node must fit between the limits its ancestors set.' },
        { approach: 'In-order + prev', time: 'O(n)', space: 'O(h)', note: 'Sorted order check. The same walk also answers kth smallest and min gap.' },
      ],
    },
    {
      kind: 'list',
      items: [
        "**Reach for in-order when** a BST question mentions sorted order, 'kth smallest', 'closest values', 'next bigger', or 'is this valid'.",
        'Think of it as walking a sorted array: keep `prev`, a counter, or a running best.',
        'Need to stop early or produce values one at a time? Use the stack loop instead of recursion.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'prev = 0 and the equal-values bug',
      text: "Start `prev` at `-Infinity`, not 0: a tree like `[-1,-2,0]` is valid, but `-2 ≤ 0` would fail it. Use `node.val <= prev` (not `<`), because a BST here holds **distinct** values: `[2,2,2]` is not valid. And never check only the children: the grandchild 3 under 6 above is the classic wrong answer.",
    },
  ],
  problems: [
    {
      id: 'bst-tries-validate',
      title: 'Validate a BST',
      difficulty: 'medium',
      leetcode: 98,
      pattern: 'In-order = sorted',
      statement:
        'Return `true` if the tree is a valid binary search tree: for every node, all values in its left subtree are strictly smaller and all values in its right subtree are strictly bigger. Duplicates are not allowed. An empty tree is valid.',
      examples: [
        { input: 'root = [2,1,3]', output: 'true' },
        { input: 'root = [5,4,6,null,null,3,7]', output: 'false', explain: '3 is in the right subtree of 5 but smaller than 5.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', '-2³¹ ≤ node.val ≤ 2³¹ - 1'],
      hints: [
        'Checking a node against its two children is not enough. Find a tree that fools it.',
        'What order do the values come out in if you walk a real BST left, node, right?',
        'Walk in-order and keep the previous value. If the current value is ≤ prev, it is not a BST. Start prev at -Infinity.',
      ],
      approaches: [
        {
          name: 'Max/min of subtrees',
          idea: 'For each node, compute the max on its left and the min on its right and compare. Correct, but the same nodes are re-walked for every ancestor.',
          time: 'O(n²) worst',
          space: 'O(h)',
        },
        {
          name: 'Pass bounds down',
          idea: 'Each node gets a window (lo, hi) from its ancestors. Going left, the node becomes the new upper limit; going right, the new lower limit.',
          code: `function isValidBST(root, lo = -Infinity, hi = Infinity) {
  if (!root) return true;
  if (root.val <= lo || root.val >= hi) return false;
  return isValidBST(root.left, lo, root.val) && isValidBST(root.right, root.val, hi);
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'In-order + prev',
          idea: 'In-order visits a BST in sorted order, so the tree is valid exactly when every value is bigger than the one before it.',
          pseudo: `function isValidBST(root):
    prev ← -infinity
    function inorder(node):
        if node = null:
            return true
        if not inorder(node.left):
            return false
        if node.val ≤ prev:
            return false
        prev ← node.val
        return inorder(node.right)
    return inorder(root)`,
          code: `function isValidBST(root) {
  let prev = -Infinity;
  const inorder = (node) => {
    if (!node) return true;
    if (!inorder(node.left)) return false;
    if (node.val <= prev) return false;
    prev = node.val;
    return inorder(node.right);
  };
  return inorder(root);
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'isValidBST',
      starter: `function isValidBST(root) {
  // true if every left subtree is smaller and every right subtree is bigger
  return false;
}`,
      solution: `function isValidBST(root) {
  let prev = -Infinity;
  const inorder = (node) => {
    if (!node) return true;
    if (!inorder(node.left)) return false;
    if (node.val <= prev) return false;
    prev = node.val;
    return inorder(node.right);
  };
  return inorder(root);
}`,
      tests: [
        { name: 'small valid', args: [[2, 1, 3]], expected: true },
        { name: 'child out of place', args: [[5, 1, 4, null, null, 3, 6]], expected: false },
        { name: 'grandchild trap', args: [[5, 4, 6, null, null, 3, 7]], expected: false },
        { name: 'bigger valid tree', args: [T], expected: true },
        { name: 'single node', args: [[1]], expected: true },
        { name: 'empty tree', args: [[]], expected: true },
        { name: 'duplicates', args: [[2, 2, 2]], expected: false },
        { name: 'duplicate on the left', args: [[1, 1]], expected: false },
        { name: 'negatives', args: [[-1, -2, 0]], expected: true },
        { name: 'equal value deep in left subtree', args: [[3, 1, 5, 0, 2, 4, 6, null, null, null, 3]], expected: false },
        { name: 'max int', args: [[2147483647]], expected: true },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'A BST check is a sorted-order check: in-order + prev, starting at -Infinity.',
    },
    {
      id: 'bst-tries-kth-smallest',
      title: 'Kth smallest in a BST',
      difficulty: 'medium',
      leetcode: 230,
      pattern: 'In-order = sorted',
      statement:
        'A game keeps player scores in a BST. Return the `k`th smallest score (k starts at 1). `k` is always between 1 and the number of nodes.',
      examples: [
        { input: 'root = [3,1,4,null,2], k = 1', output: '1' },
        { input: 'root = [5,3,6,2,4,null,null,1], k = 3', output: '3', explain: 'Sorted: 1, 2, 3, 4, 5, 6. The 3rd is 3.' },
      ],
      constraints: ['1 ≤ k ≤ n ≤ 10⁴'],
      hints: [
        'Which traversal gives the values in sorted order?',
        'You do not need the whole sorted list. You only need to count.',
        'Use the stack version of in-order: each pop is the next smallest value. Return on the kth pop.',
      ],
      approaches: [
        {
          name: 'Collect then index',
          idea: 'Do a full in-order walk into an array (it comes out sorted) and return `arr[k - 1]`. Simple, but walks every node even when k = 1.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'In-order with a stack, stop at k',
          idea: 'Each pop from the stack is the next value in sorted order. Count pops and stop at the kth, so you only walk about h + k nodes.',
          pseudo: `function kthSmallest(root, k):
    stack ← empty stack
    node ← root
    while node ≠ null or stack is not empty:
        while node ≠ null:
            push node onto stack
            node ← node.left
        node ← pop from stack
        k ← k - 1
        if k = 0:
            return node.val
        node ← node.right`,
          code: `function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}`,
          time: 'O(h + k)',
          space: 'O(h)',
        },
      ],
      fn: 'kthSmallest',
      starter: `function kthSmallest(root, k) {
  // walk in sorted order and stop at the kth value
  return -1;
}`,
      solution: `function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    if (--k === 0) return node.val;
    node = node.right;
  }
  return -1;
}`,
      tests: [
        { name: 'smallest', args: [[3, 1, 4, null, 2], 1], expected: 1 },
        { name: 'middle', args: [[5, 3, 6, 2, 4, null, null, 1], 3], expected: 3 },
        { name: 'first of bigger tree', args: [T, 1], expected: 1 },
        { name: 'fourth', args: [T, 4], expected: 6 },
        { name: 'largest', args: [T, 9], expected: 14 },
        { name: 'single node', args: [[1], 1], expected: 1 },
        { name: 'root is last', args: [[2, 1], 2], expected: 2 },
        { name: 'right stick', args: [[1, null, 2, null, 3, null, 4], 3], expected: 3 },
      ],
      shapes: { args: ['tree', 'raw'] },
      takeaway: 'Kth smallest = the kth pop of an in-order walk.',
    },
    {
      id: 'bst-tries-min-diff',
      title: 'Smallest gap in a BST',
      difficulty: 'easy',
      leetcode: 530,
      pattern: 'In-order = sorted',
      statement:
        'A BST holds the departure times (in minutes) of trains from one platform. Return the smallest difference between any two different times. The tree has at least 2 nodes.',
      examples: [
        { input: 'root = [4,2,6,1,3]', output: '1', explain: 'Sorted: 1,2,3,4,6. Gaps 1,1,1,2. The smallest is 1.' },
        { input: 'root = [1,0,48,null,null,12,49]', output: '1', explain: '48 and 49.' },
      ],
      constraints: ['2 ≤ number of nodes ≤ 10⁴', '0 ≤ node.val ≤ 10⁵'],
      hints: [
        'In a sorted list, where is the closest pair always found?',
        'They are always next to each other. So compare each in-order value only with the one right before it.',
      ],
      approaches: [
        {
          name: 'All pairs',
          idea: 'Collect every value and try every pair. Ignores the order the BST gives you.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'In-order + prev',
          idea: 'In-order gives sorted values, and in sorted order the closest pair is always adjacent. So one pass comparing with prev is enough.',
          pseudo: `function getMinimumDifference(root):
    prev ← null
    best ← infinity
    for each node in in-order of root:
        if prev ≠ null:
            best ← min(best, node.val - prev)
        prev ← node.val
    return best`,
          code: `function getMinimumDifference(root) {
  let prev = null;
  let best = Infinity;
  const inorder = (node) => {
    if (!node) return;
    inorder(node.left);
    if (prev !== null) best = Math.min(best, node.val - prev);
    prev = node.val;
    inorder(node.right);
  };
  inorder(root);
  return best;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'getMinimumDifference',
      starter: `function getMinimumDifference(root) {
  // smallest difference between two values in the BST
  return 0;
}`,
      solution: `function getMinimumDifference(root) {
  let prev = null;
  let best = Infinity;
  const inorder = (node) => {
    if (!node) return;
    inorder(node.left);
    if (prev !== null) best = Math.min(best, node.val - prev);
    prev = node.val;
    inorder(node.right);
  };
  inorder(root);
  return best;
}`,
      tests: [
        { name: 'example', args: [[4, 2, 6, 1, 3]], expected: 1 },
        { name: 'gap far apart in tree', args: [[1, 0, 48, null, null, 12, 49]], expected: 1 },
        { name: 'bigger tree', args: [T], expected: 1 },
        { name: 'three nodes', args: [[10, 5, 20]], expected: 5 },
        { name: 'two nodes', args: [[100, 50]], expected: 50 },
        { name: 'closest pair across root', args: [[236, 104, 701, null, 227, null, 911]], expected: 9 },
        { name: 'contains zero', args: [[0, null, 2236, 1277, 2776, 519]], expected: 519 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Closest pair in sorted data is always adjacent: in-order + prev.',
    },
    {
      id: 'bst-tries-iterator',
      title: 'BST iterator',
      difficulty: 'medium',
      leetcode: 173,
      pattern: 'In-order = sorted',
      statement:
        "Build a 'next smallest' iterator over a BST, like a music app that plays songs in order of their ID, one at a time. We test it as one function: `runBSTIterator(root, ops)` where `ops` is a list of strings, each `\"next\"` or `\"hasNext\"`. Return a list with one output per op: for `\"next\"` the next smallest value, for `\"hasNext\"` `true` or `false`. `\"next\"` is only called when a value is left. Try to use only O(h) memory, not a full copy of the values.",
      examples: [
        {
          input: 'root = [7,3,15,null,null,9,20], ops = ["next","next","hasNext","next","hasNext","next","hasNext","next","hasNext"]',
          output: '[3,7,true,9,true,15,true,20,false]',
        },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁵', 'At most 10⁵ ops'],
      hints: [
        'The easy version copies the in-order list into an array. Can you produce values lazily instead?',
        'The stack loop for in-order already pauses after each pop. Keep the stack between calls.',
        'Start by pushing the left edge from the root. On `next`, pop a node, push the left edge of its right child, and return the popped value. `hasNext` is "is the stack non-empty".',
      ],
      approaches: [
        {
          name: 'Flatten to an array',
          idea: 'In-order the whole tree into an array and walk an index. Easy, but uses O(n) memory up front.',
          time: 'O(1) per op, O(n) setup',
          space: 'O(n)',
        },
        {
          name: 'Lazy in-order with a stack',
          idea: 'The stack holds the path of nodes still waiting to be visited. Each node is pushed and popped once, so `next` is O(1) on average and memory is O(h).',
          pseudo: `function runBSTIterator(root, ops):
    stack ← empty stack
    function pushLeft(node):
        while node ≠ null:
            push node onto stack
            node ← node.left
    pushLeft(root)
    out ← empty list
    for each op in ops:
        if op = "hasNext":
            append (stack is not empty) to out
        else:
            node ← pop from stack
            pushLeft(node.right)
            append node.val to out
    return out`,
          code: `function runBSTIterator(root, ops) {
  const stack = [];
  const pushLeft = (node) => {
    while (node) {
      stack.push(node);
      node = node.left;
    }
  };
  pushLeft(root);
  const out = [];
  for (const op of ops) {
    if (op === 'hasNext') {
      out.push(stack.length > 0);
    } else {
      const node = stack.pop();
      pushLeft(node.right);
      out.push(node.val);
    }
  }
  return out;
}`,
          time: 'O(1) average per op',
          space: 'O(h)',
        },
      ],
      fn: 'runBSTIterator',
      starter: `function runBSTIterator(root, ops) {
  // ops is a list of "next" / "hasNext"; return one output per op
  const out = [];
  return out;
}`,
      solution: `function runBSTIterator(root, ops) {
  const stack = [];
  const pushLeft = (node) => {
    while (node) {
      stack.push(node);
      node = node.left;
    }
  };
  pushLeft(root);
  const out = [];
  for (const op of ops) {
    if (op === 'hasNext') {
      out.push(stack.length > 0);
    } else {
      const node = stack.pop();
      pushLeft(node.right);
      out.push(node.val);
    }
  }
  return out;
}`,
      tests: [
        {
          name: 'example',
          args: [[7, 3, 15, null, null, 9, 20], ['next', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext', 'next', 'hasNext']],
          expected: [3, 7, true, 9, true, 15, true, 20, false],
        },
        { name: 'single node', args: [[1], ['hasNext', 'next', 'hasNext']], expected: [true, 1, false] },
        { name: 'three in a row', args: [[2, 1, 3], ['next', 'next', 'next', 'hasNext']], expected: [1, 2, 3, false] },
        { name: 'empty tree', args: [[], ['hasNext']], expected: [false] },
        { name: 'partial walk', args: [T, ['next', 'next', 'next', 'next', 'next']], expected: [1, 3, 4, 6, 7] },
        { name: 'left stick', args: [[5, 3, null, 2, null, 1], ['next', 'next', 'next', 'next', 'hasNext']], expected: [1, 2, 3, 5, false] },
        { name: 'hasNext twice is safe', args: [[2, 1], ['hasNext', 'hasNext', 'next', 'next', 'hasNext']], expected: [true, true, 1, 2, false] },
      ],
      shapes: { args: ['tree', 'raw'] },
      takeaway: 'An in-order stack is a pausable sorted walk: O(h) memory, O(1) average per step.',
    },
  ],
  quiz: [
    {
      prompt: 'You walk a valid BST in-order. What do you get?',
      options: ['The values level by level', 'The values in increasing order', 'The values in decreasing order', 'The root first, then the rest'],
      answer: 1,
      explanation: 'Left subtree (smaller), then the node, then the right subtree (bigger), at every node: sorted increasing.',
    },
    {
      prompt: 'Why does checking each node only against its two children fail?',
      options: [
        'It is too slow',
        'A value deep in a subtree can break the rule with an ancestor, not its parent',
        'It fails on empty trees',
        'It only works with negative numbers',
      ],
      answer: 1,
      explanation: 'In `[5,4,6,null,null,3,7]`, 3 is fine next to its parent 6 but is smaller than its grandparent 5 while sitting on 5\'s right.',
    },
    {
      prompt: 'Smallest gap between two values in a BST. Which pairs must you compare?',
      options: ['Every pair', 'Each node with its parent', 'Each value with the one right before it in in-order', 'Only the root with its children'],
      answer: 2,
      explanation: 'In sorted order the closest two values are always neighbors, so comparing with the previous in-order value is enough.',
    },
  ],
  takeaways: [
    'In-order of a BST is sorted. Treat it like walking a sorted array with `prev`.',
    'Validate with in-order + prev (start at -Infinity, use ≤), or by passing (lo, hi) bounds down.',
    'The stack version of in-order can pause: kth smallest stops early, an iterator keeps the stack.',
  ],
};
