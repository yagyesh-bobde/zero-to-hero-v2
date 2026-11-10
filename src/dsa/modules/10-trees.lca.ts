import type { Lesson } from '../types';

// Module 10, lesson 6: lowest common ancestor.
const lesson: Lesson = {
  id: 'lowest-common-ancestor',
  title: 'Lowest common ancestor',
  summary: 'Find where two nodes\' paths from the root split, in one pass that reports what each subtree found.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'git merge-base',
      text: 'When you merge two Git branches, Git first finds the newest commit both branches grew from, called the merge base. Your family tree has the same question: who is the closest shared ancestor of you and a cousin? Real Git history can merge, so it is a graph, but on a tree the idea is the same.',
    },
    {
      kind: 'text',
      text: 'An **ancestor** of a node is any node on the path from the root down to it, **including the node itself**. The **lowest common ancestor (LCA)** of `p` and `q` is the deepest node that is an ancestor of both. Put another way: walk down from the root toward `p` and toward `q`; the LCA is the last node where the two walks are still together.',
    },
    {
      kind: 'diagram',
      title: 'Our lesson tree',
      art: [
        '            1          LCA(4, 7) = 2',
        '          /   \\        LCA(7, 6) = 1',
        '         2     3       LCA(5, 7) = 5',
        '        / \\     \\      (5 is an ancestor of itself)',
        '       4   5     6',
        '          /',
        '         7',
      ].join('\n'),
    },
    {
      kind: 'text',
      text: '**The problem.** Given the root and two values `p` and `q` (all values are unique and both are in the tree), return the value of their LCA. LeetCode passes the nodes themselves; here you get values and return a value, but the algorithm is identical.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: ask "which side are they on?" at every step',
      code: `function lca(root, p, q):
    node ← root
    loop:
        if contains(node.left, p) and contains(node.left, q):
            node ← node.left                 // both are on the left
        else if contains(node.right, p) and contains(node.right, q):
            node ← node.right                // both are on the right
        else:
            return node.val                  // they split here (or one is node)

function contains(node, x): DFS that returns true if x is under node`,
    },
    {
      kind: 'text',
      text: 'It works. But every step down calls `contains`, which searches whole subtrees, and the next step searches most of the same nodes again. That is O(n) per step and up to h steps: O(n × h), which is O(n²) for a chain.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Let each subtree report what it found',
      text: 'Do one postorder walk where each call returns a node: `null` if neither `p` nor `q` is in this subtree, or the node it found. If a node **is** `p` or `q`, return it right away. If a node gets something back from **both** sides, `p` is on one side and `q` on the other, so this node is the LCA: return it. Otherwise pass up whichever side found something. The LCA then rides up to the root.',
    },
    {
      kind: 'trace',
      title: 'LCA(7, 4) on the lesson tree, in the order calls finish',
      columns: ['Node', 'Left returned', 'Right returned', 'Returns', 'Why'],
      rows: [
        [4, '-', '-', 4, 'it is q: stop here'],
        [7, '-', '-', 7, 'it is p: stop here'],
        [5, 7, 'null', 7, 'only the left found something'],
        [2, 4, 7, 2, 'both sides found one: this is the LCA'],
        [6, 'null', 'null', 'null', 'nothing below'],
        [3, 'null', 'null', 'null', 'nothing below'],
        [1, 2, 'null', 2, 'pass the LCA up'],
      ],
      note: 'The answer is 2. Every node is visited at most once.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function lca(root, p, q):
    function find(node):
        if node = null: return null
        if node.val = p or node.val = q: return node
        left ← find(node.left)
        right ← find(node.right)
        if left ≠ null and right ≠ null: return node   // split here
        return left if left ≠ null, else right
    return find(root).val`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function lowestCommonAncestor(root, p, q) {
  const find = (node) => {
    if (!node || node.val === p || node.val === q) return node;
    const left = find(node.left);
    const right = find(node.right);
    if (left && right) return node;
    return left || right;
  };
  return find(root).val;
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: '`contains` at every step', time: 'O(n × h)', space: 'O(h)', note: 'Re-searches the same subtrees on each step down.' },
        { approach: 'Two root-to-node paths', time: 'O(n)', space: 'O(h)', note: 'Find the path to p and to q, then the last shared node. Two passes plus two lists.' },
        { approach: 'One pass, report what you found', time: 'O(n)', space: 'O(h)', note: 'Single postorder walk. The usual interview answer.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** This is "return info up" (lesson 3) where the info is *"what did you find?"*. Reach for it when a question involves **two nodes and where their paths meet**: common ancestor, distance between two nodes (depth of p + depth of q - 2 × depth of LCA), directions from one node to another. If the tree is a **binary search tree**, you can skip the search entirely by comparing values; that version is in module 11.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: report what you found',
      code: `function find(node):
    if node = null: return nothing
    if node is a target: return node
    left ← find(node.left)
    right ← find(node.right)
    if both found something: return node      // the meeting point
    return whichever one found something`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'The early return assumes both exist',
      text: 'Returning as soon as you hit `p` skips everything below it. That is correct only because `q` is guaranteed to be in the tree: if it is not beside `p`, it must be under `p`, and then `p` is the LCA. If a problem says "p or q may be missing", search the whole tree and count how many targets you actually found.',
    },
  ],
  problems: [
    {
      id: 'trees-lca',
      title: 'Lowest common ancestor',
      difficulty: 'medium',
      leetcode: 236,
      pattern: 'Return info up',
      statement:
        'All values in the tree are unique. Given the root and two different values `p` and `q` that are both in the tree, return the **value** of their lowest common ancestor: the deepest node that has both of them in its subtree (a node counts as being in its own subtree).',
      examples: [
        { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' },
        { input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4', output: '5', explain: '4 is below 5, so 5 is the deepest node with both.' },
        { input: 'root = [1,2], p = 1, q = 2', output: '1' },
      ],
      constraints: ['2 ≤ number of nodes ≤ 10⁵', 'All values are unique', 'p ≠ q, and both are in the tree'],
      hints: [
        'Think about what a subtree could tell its parent: "I found nothing", or "I found one of them".',
        'If a node is `p` or `q`, return it immediately.',
        'If both children return something, the current node is the answer. Otherwise pass up the non-null side.',
      ],
      approaches: [
        {
          name: 'Two root-to-node paths',
          idea: 'Record the path from the root to `p` and to `q`. Walk both paths together; the last node they share is the LCA.',
          code: `function lowestCommonAncestor(root, p, q) {
  const pathTo = (node, x, path) => {
    if (!node) return false;
    path.push(node.val);
    if (node.val === x || pathTo(node.left, x, path) || pathTo(node.right, x, path)) return true;
    path.pop();
    return false;
  };
  const a = [];
  const b = [];
  pathTo(root, p, a);
  pathTo(root, q, b);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a[i - 1];
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'One pass, report what you found',
          idea: 'Each subtree returns null or the target it found. The first node that hears back from both sides is where p and q split, which is exactly the LCA.',
          pseudo: `function lca(root, p, q):
    function find(node):
        if node = null: return null
        if node.val = p or node.val = q: return node
        left ← find(node.left)
        right ← find(node.right)
        if left ≠ null and right ≠ null: return node
        return left if left ≠ null, else right
    return find(root).val`,
          code: `function lowestCommonAncestor(root, p, q) {
  const find = (node) => {
    if (!node || node.val === p || node.val === q) return node;
    const left = find(node.left);
    const right = find(node.right);
    if (left && right) return node;
    return left || right;
  };
  return find(root).val;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'lowestCommonAncestor',
      starter: `function lowestCommonAncestor(root, p, q) {
  // p and q are VALUES; return the LCA's value
  return null;
}`,
      solution: `function lowestCommonAncestor(root, p, q) {
  const find = (node) => {
    if (!node || node.val === p || node.val === q) return node;
    const left = find(node.left);
    const right = find(node.right);
    if (left && right) return node;
    return left || right;
  };
  return find(root).val;
}`,
      tests: [
        { name: 'split at the root', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
        { name: 'one is above the other', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
        { name: 'deep pair', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 6], expected: 5 },
        { name: 'two nodes', args: [[1, 2], 1, 2], expected: 1 },
        { name: 'lesson tree 4, 7', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 4, 7], expected: 2 },
        { name: 'lesson tree 7, 6', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 7, 6], expected: 1 },
        { name: 'lesson tree 5, 7', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 5, 7], expected: 5 },
        { name: 'chain', args: [[1, 2, null, 3, null, 4], 4, 3], expected: 3 },
        { name: 'negative values', args: [[-1, 0, 3, -2, 4, null, null, 8], 8, 4], expected: 0 },
      ],
      shapes: { args: ['tree', 'raw', 'raw'] },
      takeaway: 'The LCA is the first node that hears back from both sides.',
    },
    {
      id: 'trees-lca-deepest-leaves',
      title: 'Smallest subtree with all the deepest leaves',
      difficulty: 'medium',
      leetcode: 1123,
      pattern: 'Return info up',
      statement:
        'The **deepest leaves** are the nodes on the bottom level of the tree. Return the lowest common ancestor of all of them, as a subtree (the node and everything below it). If there is only one deepest leaf, it is its own answer.',
      examples: [
        { input: 'root = [3,5,1,6,2,0,8,null,null,7,4]', output: '[2,7,4]', explain: 'The deepest leaves are 7 and 4. Their LCA is 2.' },
        { input: 'root = [1]', output: '[1]' },
        { input: 'root = [0,1,3,null,2]', output: '[2]', explain: 'Only one deepest leaf: 2.' },
      ],
      constraints: ['1 ≤ number of nodes ≤ 1000', 'All values are unique'],
      hints: [
        'Compare the heights of the two subtrees at a node. What does it mean if they are equal?',
        'Equal heights: the deepest leaves are on both sides, so this node is the answer for its subtree.',
        'Return a pair `[height, answerNode]`. If one side is taller, pass up that side\'s answer with height + 1.',
      ],
      approaches: [
        {
          name: 'Find the deepest leaves, then LCA them',
          idea: 'BFS to get the bottom row, then run the LCA search on its first and last node (the LCA of the outermost two covers everything between). Two separate passes.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Return height and answer together',
          idea: 'Each node learns both subtree heights. If they are equal, the deepest leaves are split across it, so it is the meeting point. If not, all the deepest leaves are on the taller side, so that side\'s answer is still correct.',
          pseudo: `function lcaDeepestLeaves(root):
    function dfs(node):                       // returns [height, answer]
        if node = null: return [0, null]
        [lh, la] ← dfs(node.left)
        [rh, ra] ← dfs(node.right)
        if lh = rh: return [lh + 1, node]
        if lh > rh: return [lh + 1, la]
        return [rh + 1, ra]
    return dfs(root)[1]`,
          code: `function lcaDeepestLeaves(root) {
  const dfs = (node) => {
    if (!node) return [0, null];
    const [lh, la] = dfs(node.left);
    const [rh, ra] = dfs(node.right);
    if (lh === rh) return [lh + 1, node];
    return lh > rh ? [lh + 1, la] : [rh + 1, ra];
  };
  return dfs(root)[1];
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'lcaDeepestLeaves',
      starter: `function lcaDeepestLeaves(root) {
  // return the node whose subtree holds every deepest leaf
  return root;
}`,
      solution: `function lcaDeepestLeaves(root) {
  const dfs = (node) => {
    if (!node) return [0, null];
    const [lh, la] = dfs(node.left);
    const [rh, ra] = dfs(node.right);
    if (lh === rh) return [lh + 1, node];
    return lh > rh ? [lh + 1, la] : [rh + 1, ra];
  };
  return dfs(root)[1];
}`,
      tests: [
        { name: 'classic', args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]], expected: [2, 7, 4] },
        { name: 'single node', args: [[1]], expected: [1] },
        { name: 'one deepest leaf', args: [[0, 1, 3, null, 2]], expected: [2] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [7] },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
        { name: 'left side deeper', args: [[1, 2, 3, 4, 5]], expected: [2, 4, 5] },
        { name: 'deep leaves far apart', args: [[1, 2, 3, 4, null, null, 5]], expected: [1, 2, 3, 4, null, null, 5] },
      ],
      shapes: { args: ['tree'], result: 'tree' },
      takeaway: 'When a node needs two facts from below, return them as a pair.',
    },
    {
      id: 'trees-step-directions',
      title: 'Directions between two nodes',
      difficulty: 'medium',
      leetcode: 2096,
      pattern: 'Return info up',
      statement:
        'A delivery robot moves on a tree. From a node it can go `L` (to the left child), `R` (to the right child) or `U` (up to the parent). Values are unique. Return the shortest list of moves, as a string, from the node with value `startValue` to the node with value `destValue`.',
      examples: [
        { input: 'root = [5,1,2,3,null,6,4], startValue = 3, destValue = 6', output: '"UURL"', explain: '3 → 1 → 5 (up twice), then 5 → 2 → 6 (right, left).' },
        { input: 'root = [2,1], startValue = 2, destValue = 1', output: '"L"' },
        { input: 'root = [2,1], startValue = 1, destValue = 2', output: '"U"' },
      ],
      constraints: ['2 ≤ number of nodes ≤ 10⁵', 'All values are unique', 'startValue ≠ destValue, both in the tree'],
      hints: [
        'The shortest route goes up from start to their LCA, then down to dest.',
        'Write the path from the root to each node as a string of `L` and `R`.',
        'Drop the common beginning of the two strings (that part leads to the LCA). Every move left in start\'s path becomes `U`; then follow the rest of dest\'s path.',
      ],
      approaches: [
        {
          name: 'Parent map + BFS',
          idea: 'Store each node\'s parent, then treat the tree as a graph and BFS from start, remembering which move reached each node. Correct, but builds extra maps and needs a queue.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Two root paths, cut the shared start',
          idea: 'Both root paths agree until they reach the LCA. After the shared part, start\'s leftover moves are steps you must undo (each one is a `U`), and dest\'s leftover moves are the way down.',
          pseudo: `function getDirections(root, start, dest):
    a ← moves from root to start      // e.g. "LL"
    b ← moves from root to dest       // e.g. "RL"
    i ← 0
    while i < length(a) and i < length(b) and a[i] = b[i]:
        i ← i + 1                     // shared part leads to the LCA
    return "U" repeated (length(a) - i) times + b from index i

function moves(node, target, path):   // push/pop like path sum
    if node = null: return false
    if node.val = target: return true
    push "L"; if moves(node.left, target, path): return true; pop
    push "R"; if moves(node.right, target, path): return true; pop
    return false`,
          code: `function getDirections(root, startValue, destValue) {
  const moves = (node, target, path) => {
    if (!node) return false;
    if (node.val === target) return true;
    path.push('L');
    if (moves(node.left, target, path)) return true;
    path.pop();
    path.push('R');
    if (moves(node.right, target, path)) return true;
    path.pop();
    return false;
  };
  const a = [];
  const b = [];
  moves(root, startValue, a);
  moves(root, destValue, b);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return 'U'.repeat(a.length - i) + b.slice(i).join('');
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'getDirections',
      starter: `function getDirections(root, startValue, destValue) {
  // return a string of 'U', 'L' and 'R' moves
  return '';
}`,
      solution: `function getDirections(root, startValue, destValue) {
  const moves = (node, target, path) => {
    if (!node) return false;
    if (node.val === target) return true;
    path.push('L');
    if (moves(node.left, target, path)) return true;
    path.pop();
    path.push('R');
    if (moves(node.right, target, path)) return true;
    path.pop();
    return false;
  };
  const a = [];
  const b = [];
  moves(root, startValue, a);
  moves(root, destValue, b);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return 'U'.repeat(a.length - i) + b.slice(i).join('');
}`,
      tests: [
        { name: 'up then down', args: [[5, 1, 2, 3, null, 6, 4], 3, 6], expected: 'UURL' },
        { name: 'straight down', args: [[2, 1], 2, 1], expected: 'L' },
        { name: 'straight up', args: [[2, 1], 1, 2], expected: 'U' },
        { name: 'siblings', args: [[1, 2, 3], 2, 3], expected: 'UR' },
        { name: 'across the root', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 4, 6], expected: 'UURR' },
        { name: 'shared start', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 4, 7], expected: 'URL' },
        { name: 'root to deep leaf', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 1, 7], expected: 'LRL' },
        { name: 'deep leaf to root', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7], 7, 1], expected: 'UUU' },
      ],
      shapes: { args: ['tree', 'raw', 'raw'] },
      takeaway: 'Two root paths share a beginning; where they split is the LCA.',
    },
  ],
  quiz: [
    {
      prompt: 'In the lesson tree, what is LCA(4, 5)?',
      options: ['1', '2', '4', '5'],
      answer: 1,
      explanation: '4 and 5 are the two children of 2, so their paths from the root split at 2.',
    },
    {
      prompt: 'During the one-pass search, a node gets a non-null result from both children. What does that mean?',
      options: [
        'p and q are the same node',
        'One target is on each side, so this node is the LCA',
        'The tree has duplicates',
        'You should keep searching upward for both',
      ],
      answer: 1,
      explanation: 'Each side found one target, so their paths split exactly here.',
    },
    {
      prompt: 'Why is it safe to return immediately when the current node is `p`?',
      options: [
        'Because p is always a leaf',
        'Because q is guaranteed to exist: if it is not elsewhere, it is under p, and then p is the LCA',
        'Because the left side is searched first',
        'It is not safe',
      ],
      answer: 1,
      explanation: 'The guarantee that both exist is what makes the shortcut correct. Without it you must keep searching.',
    },
  ],
  takeaways: [
    'LCA = the last node the root-to-p and root-to-q paths share.',
    'One pass: return null or what you found; a node that hears back from both sides is the LCA.',
    'Many two-node questions (distance, directions) reduce to finding the LCA first.',
  ],
};

export default lesson;
