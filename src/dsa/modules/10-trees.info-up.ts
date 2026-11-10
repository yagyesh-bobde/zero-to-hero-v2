import type { Lesson } from '../types';

// Module 10, lesson 3: postorder "return info up" (height, diameter, balanced).
const lesson: Lesson = {
  id: 'return-info-up',
  title: 'Return info up: height, diameter, balanced',
  summary: 'Let each child report a small fact to its parent, and answer the question in one pass.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The headcount email',
      text: 'The CEO wants to know how many people work under each manager. Nobody counts the whole company. Each manager asks their direct reports "how big is your team?", adds the answers, adds 1 for themselves, and replies upward. The CEO gets the total after one round of replies. That is the most useful idea in tree problems.',
    },
    {
      kind: 'text',
      text: '**Warm-up: height.** The height of a tree is the number of nodes on its longest path from the root down to a leaf. The empty tree has height 0. A node does not need to look at the whole tree: it asks its two children for their heights and adds 1.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Height: ask the children, add 1',
      code: `function height(node):
    if node = null:
        return 0
    return 1 + max(height(node.left), height(node.right))`,
    },
    {
      kind: 'text',
      text: '**The problem.** A company wires its offices in a tree of cables. A message is slowest between the two offices that are the most cables apart. Find that number: the **diameter**, the longest path between *any* two nodes, counted in edges (cables). In the lesson tree from before it is 5: `7 - 5 - 2 - 1 - 3 - 6`. Every longest path goes up from one leaf, bends at some node, and goes down the other side. If it bends at node X, its length is `height(X.left) + height(X.right)`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every bend point',
      code: `function diameter(root):
    best ← 0
    for each node X in the tree:
        best ← max(best, height(X.left) + height(X.right))
    return best`,
    },
    {
      kind: 'text',
      text: 'Correct, but look at what `height` does. Asking about node 1 walks the whole tree. Asking about node 2 walks its subtree again. Asking about node 5 walks it a third time. In a chain-shaped tree every node is re-measured once for each ancestor: O(n²).',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Return what the parent needs, record what the answer needs',
      text: 'When the height call finishes at a node, it already knows both child heights. So do everything in that same moment: **update the best diameter** with `left + right`, then **return the height** to the parent. One postorder walk (children first, then the node) gives both, and no subtree is measured twice.',
    },
    {
      kind: 'diagram',
      title: 'What each node reports up (h) and checks (through)',
      art: [
        '            1     h=4  through=3+2=5  <- best',
        '          /   \\',
        '         2     3  2: h=3  through=1+2=3',
        '        / \\     \\ 3: h=2  through=0+1=1',
        '       4   5     6',
        '          /       5: h=2  through=1+0=1',
        '         7        4, 6, 7: h=1  through=0',
      ].join('\n'),
      caption: '`through` = longest path that bends at this node = left height + right height.',
    },
    {
      kind: 'trace',
      title: 'Postorder pass (children before parent)',
      columns: ['Node', 'Left h', 'Right h', 'Through', 'Best', 'Returns h'],
      rows: [
        [4, 0, 0, 0, 0, 1],
        [7, 0, 0, 0, 0, 1],
        [5, 1, 0, 1, 1, 2],
        [2, 1, 2, 3, 3, 3],
        [6, 0, 0, 0, 3, 1],
        [3, 0, 1, 1, 3, 2],
        [1, 3, 2, 5, 5, 4],
      ],
      note: 'Each row uses only the two numbers its children returned. Seven nodes, seven rows: O(n).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function diameter(root):
    best ← 0
    function height(node):
        if node = null: return 0
        left ← height(node.left)
        right ← height(node.right)
        best ← max(best, left + right)      // record for the answer
        return 1 + max(left, right)        // report to the parent
    height(root)
    return best`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Height call at every node', time: 'O(n²)', space: 'O(h)', note: 'Subtrees are measured again for every ancestor. O(n log n) if bushy, O(n²) if a chain.' },
        { approach: 'One postorder pass', time: 'O(n)', space: 'O(h)', note: 'Each node uses its children\'s returned heights, then reports its own.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** Use it when the answer at a node depends on answers from its subtrees: height, size, sums, "is it balanced", "is it a valid X", "longest path", "how many moves". Ask two questions. (1) What does my **parent** need from me? That is the return value. (2) What does the **final answer** need? If it is different, keep it in a variable outside the recursion.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: return info up',
      code: `answer ← starting value
function solve(node):
    if node = null:
        return EMPTY_INFO            // e.g. height 0, sum 0
    left ← solve(node.left)
    right ← solve(node.right)
    answer ← better of answer and (something from node, left, right)
    return info the parent needs   // often 1 + max, or a sum
solve(root)
return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Edges or nodes? And it may not use the root.',
      text: 'LeetCode\'s diameter counts **edges**, so a single node has diameter 0 and `left + right` (not `+ 1`) is right. Also, the longest path does not have to pass through the root; a tall left subtree can hold it alone. That is why you check every node, not just the root.',
    },
  ],
  problems: [
    {
      id: 'trees-max-depth',
      title: 'Maximum depth',
      difficulty: 'easy',
      leetcode: 104,
      pattern: 'Return info up',
      statement:
        'Return the number of nodes on the longest path from the root down to a leaf. The empty tree has depth 0.',
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
        { input: 'root = [1,null,2]', output: '2' },
        { input: 'root = []', output: '0' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴'],
      hints: [
        'If you knew the depth of both subtrees, what would the answer be?',
        '`1 + max(depth(left), depth(right))`, and `depth(null) = 0`.',
      ],
      approaches: [
        {
          name: 'BFS, count the rows',
          idea: 'Run level-order BFS and count how many rows you process.',
          code: `function maxDepth(root) {
  let depth = 0;
  let queue = root ? [root] : [];
  while (queue.length) {
    depth++;
    queue = queue.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return depth;
}`,
          time: 'O(n)',
          space: 'O(w)',
        },
        {
          name: 'Return the height up',
          idea: 'Each node returns 1 plus the deeper of its two children. Null returns 0.',
          pseudo: `function maxDepth(node):
    if node = null: return 0
    return 1 + max(maxDepth(node.left), maxDepth(node.right))`,
          code: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'maxDepth',
      starter: `function maxDepth(root) {
  // nodes on the longest root-to-leaf path
  return 0;
}`,
      solution: `function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}`,
      tests: [
        { name: 'small tree', args: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
        { name: 'right child only', args: [[1, null, 2]], expected: 2 },
        { name: 'empty tree', args: [[]], expected: 0 },
        { name: 'single node', args: [[0]], expected: 1 },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: 4 },
        { name: 'left line', args: [[1, 2, null, 3, null, 4]], expected: 4 },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: 3 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Height is the "hello world" of return-info-up: `1 + max(left, right)`.',
    },
    {
      id: 'trees-diameter',
      title: 'Diameter of a tree',
      difficulty: 'easy',
      leetcode: 543,
      pattern: 'Return info up',
      statement:
        'Offices are wired in a tree of cables. Return the largest number of cables (edges) between any two offices (nodes). The path does not have to go through the root.',
      examples: [
        { input: 'root = [1,2,3,4,5]', output: '3', explain: 'For example `4 - 2 - 1 - 3` has 3 edges.' },
        { input: 'root = [1,2]', output: '1' },
        { input: 'root = [1]', output: '0' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', 'Count edges, not nodes'],
      hints: [
        'Every path has one highest node where it bends. If it bends at X, how long is it?',
        'Length through X = height of X\'s left subtree + height of X\'s right subtree.',
        'Compute heights in one postorder pass. Update a `best` variable at every node, return the height.',
      ],
      approaches: [
        {
          name: 'Measure heights at every node',
          idea: 'For each node, call a separate height function on both children. Correct, but the same subtrees are measured again and again.',
          time: 'O(n²)',
          space: 'O(h)',
        },
        {
          name: 'One postorder pass',
          idea: 'The height function already knows both child heights at each node, so it can update the best `left + right` on the spot and still return the height.',
          pseudo: `function diameter(root):
    best ← 0
    function height(node):
        if node = null: return 0
        left ← height(node.left)
        right ← height(node.right)
        best ← max(best, left + right)
        return 1 + max(left, right)
    height(root)
    return best`,
          code: `function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'diameterOfBinaryTree',
      starter: `function diameterOfBinaryTree(root) {
  // longest path between any two nodes, in edges
  return 0;
}`,
      solution: `function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const left = height(node.left);
    const right = height(node.right);
    best = Math.max(best, left + right);
    return 1 + Math.max(left, right);
  };
  height(root);
  return best;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 3, 4, 5]], expected: 3 },
        { name: 'two nodes', args: [[1, 2]], expected: 1 },
        { name: 'single node', args: [[1]], expected: 0 },
        { name: 'empty tree', args: [[]], expected: 0 },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: 5 },
        { name: 'left line', args: [[1, 2, null, 3, null, 4]], expected: 3 },
        { name: 'longest path skips the root', args: [[1, 2, null, 3, 4, 5, null, null, 6, 7, null, null, 8]], expected: 6 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Return the height; record `left + right` on the side.',
    },
    {
      id: 'trees-balanced',
      title: 'Is it balanced?',
      difficulty: 'easy',
      leetcode: 110,
      pattern: 'Return info up',
      statement:
        'A tree is **balanced** if at *every* node the heights of the left and right subtrees differ by at most 1. Return `true` if the tree is balanced. The empty tree is balanced.',
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: 'true' },
        { input: 'root = [1,2,2,3,3,null,null,4,4]', output: 'false', explain: 'At the root, the left side has height 3 and the right side has height 1.' },
        { input: 'root = []', output: 'true' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 5000'],
      hints: [
        'Checking only the root is not enough. The rule is for every node.',
        'A node needs its children\'s heights *and* whether they are balanced. Can one number carry both?',
        'Return the height, or `-1` to mean "unbalanced somewhere below". Once you see `-1`, pass it straight up.',
      ],
      approaches: [
        {
          name: 'Height call at every node',
          idea: 'For every node, compute both child heights with a separate function and compare. Correct, but repeats work: O(n²) on a chain.',
          time: 'O(n²)',
          space: 'O(h)',
        },
        {
          name: 'Return height, or -1 for "broken"',
          idea: 'One postorder pass. A real height is never negative, so `-1` can safely mean "this subtree is unbalanced". It travels up and stops all the other checks.',
          pseudo: `function check(node):
    if node = null: return 0
    left ← check(node.left)
    if left = -1: return -1
    right ← check(node.right)
    if right = -1: return -1
    if |left - right| > 1: return -1
    return 1 + max(left, right)

function isBalanced(root):
    return check(root) ≠ -1`,
          code: `function isBalanced(root) {
  const check = (node) => {
    if (!node) return 0;
    const left = check(node.left);
    if (left === -1) return -1;
    const right = check(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  };
  return check(root) !== -1;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'isBalanced',
      starter: `function isBalanced(root) {
  // every node: |height(left) - height(right)| <= 1
  return true;
}`,
      solution: `function isBalanced(root) {
  const check = (node) => {
    if (!node) return 0;
    const left = check(node.left);
    if (left === -1) return -1;
    const right = check(node.right);
    if (right === -1) return -1;
    if (Math.abs(left - right) > 1) return -1;
    return 1 + Math.max(left, right);
  };
  return check(root) !== -1;
}`,
      tests: [
        { name: 'balanced', args: [[3, 9, 20, null, null, 15, 7]], expected: true },
        { name: 'heavy left', args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expected: false },
        { name: 'empty tree', args: [[]], expected: true },
        { name: 'single node', args: [[1]], expected: true },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: true },
        { name: 'chain of three', args: [[1, 2, null, 3]], expected: false },
        { name: 'root looks fine, child does not', args: [[1, 2, 3, 4, null, null, 5, 6, null, null, 7]], expected: false },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'A sentinel like `-1` lets one return value carry two facts.',
    },
    {
      id: 'trees-distribute-coins',
      title: 'Share the coins',
      difficulty: 'medium',
      leetcode: 979,
      pattern: 'Return info up',
      statement:
        'Each node of a tree holds some coins (its value). In total there are exactly as many coins as nodes. In one move you can pass one coin between a node and its parent or child. Return the fewest moves so that every node ends with exactly one coin.',
      examples: [
        { input: 'root = [3,0,0]', output: '2', explain: 'The root sends one coin to each child.' },
        { input: 'root = [0,3,0]', output: '3', explain: 'The left child sends one coin up (1), and another coin goes up and over to the right child (2).' },
        { input: 'root = [1]', output: '0' },
      ],
      constraints: ['1 ≤ number of nodes ≤ 100', 'Sum of all values = number of nodes'],
      hints: [
        'Look at a single edge between a node and its parent. How many coins must cross it?',
        'A subtree with 5 nodes and 7 coins must send 2 coins up. One with 5 nodes and 2 coins must pull 3 down. Either way, that many moves use this edge.',
        'Return the subtree\'s "extra" = `node.val - 1 + leftExtra + rightExtra`. Add `|leftExtra| + |rightExtra|` to the move count.',
      ],
      approaches: [
        {
          name: 'Count per edge, recompute sums',
          idea: 'For every edge, the coins crossing it = |coins in the subtree below - nodes in that subtree|. Computing those totals fresh for every node repeats work.',
          time: 'O(n²)',
          space: 'O(h)',
        },
        {
          name: 'Return the extra coins up',
          idea: 'Each subtree reports how many coins it has too many (positive) or too few (negative). Every one of those must cross the edge to the parent, so add its absolute value to the moves.',
          pseudo: `function distributeCoins(root):
    moves ← 0
    function extra(node):
        if node = null: return 0
        left ← extra(node.left)
        right ← extra(node.right)
        moves ← moves + |left| + |right|   // coins crossing the two child edges
        return node.val - 1 + left + right
    extra(root)
    return moves`,
          code: `function distributeCoins(root) {
  let moves = 0;
  const extra = (node) => {
    if (!node) return 0;
    const left = extra(node.left);
    const right = extra(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.val - 1 + left + right;
  };
  extra(root);
  return moves;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'distributeCoins',
      starter: `function distributeCoins(root) {
  // fewest single-coin moves so every node has 1 coin
  return 0;
}`,
      solution: `function distributeCoins(root) {
  let moves = 0;
  const extra = (node) => {
    if (!node) return 0;
    const left = extra(node.left);
    const right = extra(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.val - 1 + left + right;
  };
  extra(root);
  return moves;
}`,
      tests: [
        { name: 'root has all', args: [[3, 0, 0]], expected: 2 },
        { name: 'left child has all', args: [[0, 3, 0]], expected: 3 },
        { name: 'single node', args: [[1]], expected: 0 },
        { name: 'one each side', args: [[1, 0, 2]], expected: 2 },
        { name: 'chain', args: [[0, 0, null, 3]], expected: 3 },
        { name: 'deep pile', args: [[1, 0, 0, null, 3]], expected: 4 },
        { name: 'far corner pile', args: [[0, 0, 0, 0, 0, 0, 7]], expected: 16 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Think per edge: what has to cross it? The subtree can tell you.',
    },
  ],
  quiz: [
    {
      prompt: 'In the diameter solution, what does the helper return, and what does it record?',
      options: [
        'Returns the diameter, records the height',
        'Returns the height, records the best `left + right`',
        'Returns both in an array, records nothing',
        'Returns the number of nodes, records the depth',
      ],
      answer: 1,
      explanation: 'The parent needs a height to compute its own. The final answer needs the best bend, which is kept outside.',
    },
    {
      prompt: 'Why is calling `height()` separately at every node O(n²) on a chain?',
      options: [
        'Because height is O(n²) by itself',
        'Each node\'s subtree is walked again for every ancestor above it',
        'Because recursion is always slow',
        'It is not; it is O(n)',
      ],
      answer: 1,
      explanation: 'In a chain, node k is measured by the call for every node above it: 1 + 2 + ... + n = O(n²).',
    },
    {
      prompt: 'In the balanced check, why is `-1` a safe "unbalanced" signal?',
      options: ['JS treats -1 as false', 'A real height is never negative', 'It is the height of a leaf', 'LeetCode requires it'],
      answer: 1,
      explanation: 'Heights are 0 or more, so -1 can never be confused with a real height.',
    },
  ],
  takeaways: [
    'Postorder: children answer first, then the node combines their answers.',
    'Return what the parent needs; keep what the final answer needs in an outside variable.',
    'If a node needs two facts, return a pair or use a sentinel value like `-1`.',
  ],
};

export default lesson;
