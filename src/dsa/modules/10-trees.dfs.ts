import type { Lesson } from '../types';

// Module 10, lesson 1: depth-first traversals (recursive and iterative).
const lesson: Lesson = {
  id: 'dfs-traversals',
  title: 'Walking a tree: preorder, inorder, postorder',
  summary: 'Visit every node with recursion, then do the same with your own stack.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your file explorer is a tree',
      text: 'Run `tree` in a terminal and it prints a folder, then everything inside it, top to bottom. Ask your computer how big a folder is and it must add up the sizes inside it *first*. Same tree, two different visiting orders. Picking the right order is most of the work in tree problems.',
    },
    {
      kind: 'text',
      text: 'A **binary tree** node is a linked-list node with two next pointers: `left` and `right`. The top node is the **root**. A node with no children is a **leaf**. Every node is the root of its own smaller tree, called a **subtree**. In this course `TreeNode(val, left, right)` is already in scope, just like on LeetCode, and tests write trees as **level-order arrays**: row by row, left to right, with `null` for a missing child.',
    },
    {
      kind: 'diagram',
      title: 'The tree we use all lesson',
      art: [
        '            1',
        '          /   \\',
        '         2     3',
        '        / \\     \\',
        '       4   5     6',
        '          /',
        '         7',
        '',
        'level order: [1,2,3,4,5,null,6,null,null,7]',
      ].join('\n'),
      caption: 'Node 3 has no left child, so its slot is `null`. Trailing nulls are dropped.',
    },
    {
      kind: 'text',
      text: '**The problem.** Return the values in **preorder**: the node first, then its whole left subtree, then its whole right subtree. For the tree above the answer is `[1, 2, 4, 5, 7, 3, 6]`. Try it with your finger before reading on.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'First try: recursion (it works)',
      code: `function preorder(node, out):
    if node = null:
        return                      // empty subtree: nothing to do
    append node.val to out          // 1. the node itself
    preorder(node.left, out)        // 2. everything on the left
    preorder(node.right, out)       // 3. everything on the right`,
    },
    {
      kind: 'text',
      text: 'Move the `append` line and you get the other two orders. Same walk, the only change is *when* you write the value down.',
    },
    {
      kind: 'table',
      title: 'Three orders, one walk',
      head: ['Order', 'Visit the node...', 'Our tree', 'Use it when'],
      rows: [
        ['Preorder', 'before its children', '1 2 4 5 7 3 6', 'copying or saving a tree, printing folders'],
        ['Inorder', 'between left and right', '4 2 7 5 1 3 6', 'search trees: gives sorted order (module 11)'],
        ['Postorder', 'after both children', '4 7 5 2 6 3 1', 'you need the children\'s answers first (folder sizes)'],
      ],
    },
    {
      kind: 'text',
      text: '**So what is wrong with recursion?** Nothing, most of the time. But every call waits on the **call stack** (the list of unfinished function calls) until its children finish. A tree shaped like a long line, 100,000 nodes deep, makes 100,000 waiting calls. JavaScript often gives up somewhere around 10,000 with `Maximum call stack size exceeded`. Interviewers also love to ask "now do it without recursion".',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Recursion is a stack you cannot see',
      text: 'Every recursive walk can be rewritten with your own stack. For preorder: pop a node, write it down, then push its **right** child and then its **left** child. The left one goes on top, so it comes out first, exactly like the recursive version.',
    },
    {
      kind: 'trace',
      title: 'Iterative preorder on our tree (top of stack on the right)',
      columns: ['Step', 'Pop', 'Output so far', 'Push (right, then left)', 'Stack after'],
      rows: [
        [0, '-', '[]', 'start with root', '[1]'],
        [1, 1, '[1]', '3, 2', '[3, 2]'],
        [2, 2, '[1, 2]', '5, 4', '[3, 5, 4]'],
        [3, 4, '[1, 2, 4]', 'nothing (leaf)', '[3, 5]'],
        [4, 5, '[1, 2, 4, 5]', '7 (no right child)', '[3, 7]'],
        [5, 7, '[1, 2, 4, 5, 7]', 'nothing (leaf)', '[3]'],
        [6, 3, '[1, 2, 4, 5, 7, 3]', '6 (no left child)', '[6]'],
        [7, 6, '[1, 2, 4, 5, 7, 3, 6]', 'nothing (leaf)', '[]'],
      ],
      note: 'Node 3 waited on the stack the whole time the left side was being explored. That waiting is exactly what the hidden call stack does.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Preorder with your own stack',
      code: `function preorder(root):
    if root = null:
        return []
    out ← empty list
    stack ← [root]
    while stack is not empty:
        node ← pop from stack
        append node.val to out
        if node.right ≠ null: push node.right onto stack   // right first...
        if node.left ≠ null: push node.left onto stack     // ...so left pops first
    return out`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function preorderTraversal(root) {
  if (!root) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}`,
    },
    {
      kind: 'compare',
      title: 'Ways to walk a tree',
      rows: [
        { approach: 'Recursion', time: 'O(n)', space: 'O(h)', note: 'Shortest code. `h` is the height: about log n if the tree is bushy, n if it is a line.' },
        { approach: 'Your own stack', time: 'O(n)', space: 'O(h)', note: 'Same cost, but a deep tree cannot crash the call stack. Inorder needs a small twist (see the second problem).' },
        { approach: 'Morris traversal', time: 'O(n)', space: 'O(1)', note: 'Temporarily rewires pointers to avoid a stack. Clever, rarely asked. Know it exists.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** Reach for a plain DFS (depth-first search: go as deep as you can down one branch before backing up) whenever a problem says "every node", "each node", "visit", or "for all subtrees". Almost every tree solution in this module is this template with something extra in the middle.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: DFS on a tree',
      code: `function dfs(node):
    if node = null:
        return BASE              // the empty tree answer
    // preorder work goes here (before the children)
    leftAnswer ← dfs(node.left)
    // inorder work goes here (between)
    rightAnswer ← dfs(node.right)
    // postorder work goes here (after the children)
    return combine(node, leftAnswer, rightAnswer)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The null check comes first',
      text: 'Forget `if node = null` and you get `Cannot read properties of null (reading \'left\')` on the first leaf. Also check the empty tree: LeetCode passes `root = null` and expects `[]`, not a crash. In the stack version, pushing left before right gives you a mirrored order.',
    },
  ],
  problems: [
    {
      id: 'trees-preorder',
      title: 'Preorder traversal',
      difficulty: 'easy',
      leetcode: 144,
      pattern: 'Tree DFS',
      statement:
        'You are writing the `tree` command for a tiny file system. Each folder is a node. Return the node values in **preorder**: the node, then all of its left subtree, then all of its right subtree. Try it once with recursion and once with your own stack.',
      examples: [
        { input: 'root = [1,2,3,4,5,null,6,null,null,7]', output: '[1,2,4,5,7,3,6]' },
        { input: 'root = [1,null,2,3]', output: '[1,2,3]', explain: '1 has only a right child 2, and 2 has a left child 3.' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 100', '-100 ≤ node value ≤ 100'],
      hints: [
        'Write the value down *before* you visit the children.',
        'Recursive version: base case for `null`, then node, left, right.',
        'Stack version: pop, record, push right, push left. Left is on top, so it is handled next.',
      ],
      approaches: [
        {
          name: 'Recursion',
          idea: 'Record the node, then recurse left, then right. The call stack remembers where to come back to.',
          code: `function preorderTraversal(root) {
  const out = [];
  const walk = (node) => {
    if (!node) return;
    out.push(node.val);
    walk(node.left);
    walk(node.right);
  };
  walk(root);
  return out;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'Your own stack',
          idea: 'Replace the call stack with an array. Push the right child before the left child so the left subtree is finished first.',
          pseudo: `function preorder(root):
    if root = null: return []
    out ← empty list
    stack ← [root]
    while stack is not empty:
        node ← pop from stack
        append node.val to out
        if node.right ≠ null: push node.right onto stack
        if node.left ≠ null: push node.left onto stack
    return out`,
          code: `function preorderTraversal(root) {
  if (!root) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'preorderTraversal',
      starter: `function preorderTraversal(root) {
  // node, then left subtree, then right subtree
  return [];
}`,
      solution: `function preorderTraversal(root) {
  if (!root) return [];
  const out = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.right) stack.push(node.right);
    if (node.left) stack.push(node.left);
  }
  return out;
}`,
      tests: [
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [1, 2, 4, 5, 7, 3, 6] },
        { name: 'right then left child', args: [[1, null, 2, 3]], expected: [1, 2, 3] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[42]], expected: [42] },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 2, 4, 5, 3, 6, 7] },
        { name: 'left line', args: [[1, 2, null, 3, null, 4]], expected: [1, 2, 3, 4] },
        { name: 'negatives', args: [[-1, -2, -3]], expected: [-1, -2, -3] },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Preorder = "me first". With a stack, push right before left.',
    },
    {
      id: 'trees-inorder',
      title: 'Inorder traversal (without recursion)',
      difficulty: 'easy',
      leetcode: 94,
      pattern: 'Tree DFS',
      statement:
        'Return the node values in **inorder**: all of the left subtree, then the node, then all of the right subtree. The recursive version is three lines, so the real challenge is doing it with your own stack.',
      examples: [
        { input: 'root = [1,2,3,4,5,null,6,null,null,7]', output: '[4,2,7,5,1,3,6]' },
        { input: 'root = [1,null,2,3]', output: '[1,3,2]', explain: 'Nothing left of 1, so 1 comes first. Then 2\'s left child 3, then 2.' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 100', '-100 ≤ node value ≤ 100'],
      hints: [
        'The first value written is the leftmost node. How do you get there?',
        'Slide down the left edge, pushing every node you pass. Nothing can be written until you hit `null`.',
        'Then pop one node, write it, and move to its right child. Repeat the slide from there.',
      ],
      approaches: [
        {
          name: 'Recursion',
          idea: 'Recurse left, record the node, recurse right. Correct and short, but uses the call stack.',
          code: `function inorderTraversal(root) {
  const out = [];
  const walk = (node) => {
    if (!node) return;
    walk(node.left);
    out.push(node.val);
    walk(node.right);
  };
  walk(root);
  return out;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'Stack: slide left, pop, go right',
          idea: 'A node can only be written after its whole left side. So push nodes while going left; when you fall off, the top of the stack is the next node to write. After writing it, its right subtree is next.',
          pseudo: `function inorder(root):
    out ← empty list
    stack ← empty stack
    node ← root
    while node ≠ null or stack is not empty:
        while node ≠ null:               // slide down the left edge
            push node onto stack
            node ← node.left
        node ← pop from stack             // leftmost node not yet written
        append node.val to out
        node ← node.right                 // now handle its right subtree
    return out`,
          code: `function inorderTraversal(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'inorderTraversal',
      starter: `function inorderTraversal(root) {
  // left subtree, then node, then right subtree
  return [];
}`,
      solution: `function inorderTraversal(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node || stack.length) {
    while (node) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    out.push(node.val);
    node = node.right;
  }
  return out;
}`,
      tests: [
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [4, 2, 7, 5, 1, 3, 6] },
        { name: 'right then left child', args: [[1, null, 2, 3]], expected: [1, 3, 2] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[5]], expected: [5] },
        { name: 'left line', args: [[1, 2, null, 3]], expected: [3, 2, 1] },
        { name: 'right line', args: [[1, null, 2, null, 3]], expected: [1, 2, 3] },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [4, 2, 5, 1, 6, 3, 7] },
        { name: 'negatives', args: [[0, -3, 9, -10, null, 5]], expected: [-10, -3, 0, 5, 9] },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Iterative inorder: slide left pushing, pop and write, step right.',
    },
    {
      id: 'trees-invert',
      title: 'Mirror a tree',
      difficulty: 'easy',
      leetcode: 226,
      pattern: 'Tree DFS',
      statement:
        'A photo app has a "flip horizontally" button, and the layout of the photo grid is stored as a tree. Mirror the tree: at every node, swap the left and right children. Return the root.',
      examples: [
        { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
        { input: 'root = [1,2]', output: '[1,null,2]', explain: 'The only child moves from the left side to the right side.' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 100'],
      hints: [
        'Mirroring the whole tree = mirror both subtrees, then swap them.',
        'Any visiting order works, as long as every node gets its children swapped exactly once.',
        'In JS you can swap in one line: `[node.left, node.right] = [node.right, node.left]`.',
      ],
      approaches: [
        {
          name: 'Build a new mirrored tree',
          idea: 'Create a new node whose left is the mirror of the old right and whose right is the mirror of the old left. Correct, but allocates n new nodes.',
          code: `function invertTree(root) {
  if (!root) return null;
  return new TreeNode(root.val, invertTree(root.right), invertTree(root.left));
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Swap in place (DFS)',
          idea: 'Visit every node and swap its two child pointers. After every node is swapped, every left-right relationship in the tree is flipped.',
          pseudo: `function invert(node):
    if node = null:
        return null
    swap node.left and node.right
    invert(node.left)
    invert(node.right)
    return node`,
          code: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'invertTree',
      starter: `function invertTree(root) {
  // swap left and right at every node
  return root;
}`,
      solution: `function invertTree(root) {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];
  invertTree(root.left);
  invertTree(root.right);
  return root;
}`,
      tests: [
        { name: 'full tree', args: [[4, 2, 7, 1, 3, 6, 9]], expected: [4, 7, 2, 9, 6, 3, 1] },
        { name: 'three nodes', args: [[2, 1, 3]], expected: [2, 3, 1] },
        { name: 'only a left child', args: [[1, 2]], expected: [1, null, 2] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[1]], expected: [1] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [1, 3, 2, 6, null, 5, 4, null, null, null, 7] },
      ],
      shapes: { args: ['tree'], result: 'tree' },
      takeaway: 'If you can solve it for one node and trust the recursion for the rest, you are done.',
    },
  ],
  quiz: [
    {
      prompt: 'Folder sizes: a folder\'s size is the sum of everything inside it. Which order computes it naturally?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
      answer: 2,
      explanation: 'You need the children\'s sizes before you can add them up, so the node is handled *after* its children: postorder.',
    },
    {
      prompt: 'In iterative preorder you pop a node with both children. What do you push?',
      options: ['Left, then right', 'Right, then left', 'Only the left child', 'The node again'],
      answer: 1,
      explanation: 'A stack is last in, first out. Pushing right first leaves left on top, so the left subtree is handled next.',
    },
    {
      prompt: 'A tree with 50,000 nodes is one long chain to the left. What can go wrong with the recursive walk in JS?',
      options: ['It becomes O(n²)', 'It visits nodes twice', 'It can overflow the call stack', 'Nothing at all'],
      answer: 2,
      explanation: 'Height equals n here, so recursion needs 50,000 waiting calls. JS engines often stop around 10,000. Your own stack has no such limit.',
    },
  ],
  takeaways: [
    'Preorder, inorder and postorder are one walk; only the moment you record the node changes.',
    'Space for any DFS is O(h), the height: small for bushy trees, O(n) for a chain.',
    'Any recursive walk can use your own stack instead. Push right before left for preorder.',
  ],
};

export default lesson;
