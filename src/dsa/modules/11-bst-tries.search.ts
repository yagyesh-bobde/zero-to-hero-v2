import type { Lesson } from '../types';

// Lesson 1 of module 11: the BST rule, search, insert, and the "split point" (LCA).

/** Monospace art without the leading newline; backslashes kept as typed. */
const art = (s: TemplateStringsArray) => s.raw[0].slice(1);

const T = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13];

export const searchLesson: Lesson = {
  id: 'bst-search-insert',
  title: 'The BST rule: search and insert',
  summary: 'One comparison per level: go left or go right, and skip half the tree each time.',
  minutes: 18,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How a database finds row 48,213',
      text: "You run `SELECT * FROM users WHERE id = 48213` on a table with a million rows. The answer comes back in a millisecond. The database did not read a million rows. It walked an **index**: a tree kept in sorted order, where every step tells it 'go left' or 'go right'. About 20 steps, and it is there. Real databases use B-trees (many children per node), but the idea is the one you learn here.",
    },
    {
      kind: 'text',
      text: 'Here is a tree of 9 numbers. Two questions: is **6** in it? Is **5** in it? Before you search, look for a pattern in where the numbers sit.',
    },
    {
      kind: 'diagram',
      title: 'Our example tree',
      art: art`
           8
         /   \
        3     10
       / \      \
      1   6      14
         / \    /
        4   7  13`,
      caption: 'Level order: `[8,3,10,1,6,null,14,null,null,4,7,13]`.',
    },
    {
      kind: 'text',
      text: "This is a **binary search tree** (BST). It follows one rule at *every* node: every value in the left subtree is smaller, every value in the right subtree is bigger. Check it at 8: the left side holds 1, 3, 4, 6, 7 (all smaller) and the right side holds 10, 13, 14 (all bigger). Now check 3: left is 1, right is 4, 6, 7. It holds everywhere.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: look at every node',
      code: `function contains(node, target):     // any traversal from module 10
    if node = null:
        return false
    if node.val = target:
        return true
    return contains(node.left, target) or contains(node.right, target)`,
    },
    {
      kind: 'text',
      text: 'That works on any tree, and it costs **O(n)**: in the worst case it touches every node. Now spot the waste. Looking for 6, the very first check is 6 vs 8. The rule says everything on the right of 8 is bigger than 8, so 6 *cannot* be there. Brute force still walks 10, 14 and 13 for nothing.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'One comparison throws away a whole side',
      text: "Compare the target with the node. Smaller? It can only be on the left. Bigger? Only on the right. Equal? Found it. This is binary search (module 5) baked into the shape of the tree. Each step goes down one level, so the cost is the tree's **height** `h`, not `n`.",
    },
    {
      kind: 'trace',
      title: 'Search for 5 (it is not there)',
      columns: ['step', 'node', 'compare', 'go'],
      rows: [
        [1, 8, '5 < 8', 'left'],
        [2, 3, '5 > 3', 'right'],
        [3, 6, '5 < 6', 'left'],
        [4, 4, '5 > 4', 'right'],
        [5, 'null', 'fell off', 'not found'],
      ],
      note: '4 comparisons out of 9 nodes. Searching for 6 takes only 3. On a balanced tree of a million nodes it is about 20.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Search in a BST',
      code: `function searchBST(root, target):
    node ← root
    while node ≠ null:
        if target = node.val:
            return node
        if target < node.val:
            node ← node.left          // the right side is too big
        else:
            node ← node.right         // the left side is too small
    return null`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function searchBST(root, target) {
  let node = root;
  while (node) {
    if (target === node.val) return node;
    node = target < node.val ? node.left : node.right;
  }
  return null;
}`,
    },
    {
      kind: 'text',
      text: "**Insert** is search plus one line. Search for the new value. You will fall off the tree at an empty spot, and that empty spot is exactly where the value belongs. The new value always becomes a **leaf** (a node with no children). Nothing else moves.",
    },
    {
      kind: 'diagram',
      title: 'Insert 5: walk 8 → 3 → 6 → 4, then fall off',
      art: art`
           8                       8
         /   \                   /   \
        3     10                3     10
       / \      \     =>       / \      \
      1   6      14           1   6      14
         / \    /                / \    /
        4   7  13               4   7  13
                                 \
                                  5`,
      caption: '5 > 4 and 4 has no right child, so 5 becomes the right child of 4.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Insert (recursive, returns the subtree root)',
      code: `function insert(node, x):
    if node = null:
        return new node(x)                // fell off: x goes right here
    if x < node.val:
        node.left ← insert(node.left, x)
    else:
        node.right ← insert(node.right, x)
    return node                           // hand this subtree back up`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function insertIntoBST(root, x) {
  if (!root) return new TreeNode(x);
  if (x < root.val) root.left = insertIntoBST(root.left, x);
  else root.right = insertIntoBST(root.right, x);
  return root;
}`,
    },
    {
      kind: 'diagram',
      title: 'Height is everything',
      art: art`
 insert 1,2,3,4,5 in order     insert 3,1,4,2,5

 1                                   3
  \                                /   \
   2                              1     4
    \                              \     \
     3                              2     5
      \
       4
        \
         5
 height 5: search is O(n)      height 3: about O(log n)`,
      caption: 'Same five values, different insert order. Sorted input makes a "stick" that is really a linked list. Libraries fix this with self-balancing trees (red-black, AVL). You will not code those in interviews; just know `O(log n)` assumes the tree is balanced.',
    },
    {
      kind: 'compare',
      title: 'Find a value',
      rows: [
        { approach: 'Visit every node', time: 'O(n)', space: 'O(h)', note: 'Works on any tree. Ignores the BST rule.' },
        { approach: 'Sorted array + binary search', time: 'O(log n)', space: 'O(1)', note: 'Fast search, but inserting means shifting up to n items.' },
        { approach: 'BST walk', time: 'O(h)', space: 'O(1)', note: 'Search and insert both O(h). h ≈ log n when balanced, n when it is a stick.' },
      ],
    },
    {
      kind: 'list',
      items: [
        "**Reach for the BST walk when** the problem says 'binary search tree' and asks you to find, insert, or locate a value or range.",
        'At each node ask one question: is my answer here, on the left, or on the right? Then go only one way.',
        "If you need *two* targets (like two values' common ancestor), keep walking while both go the same way. The node where they split is special.",
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Forgetting to hook the new node in',
      text: "In recursive insert, writing `insertIntoBST(root.left, x)` without `root.left = ...` builds the node and then drops it on the floor. Always assign the returned subtree. And don't forget the empty tree: `insertIntoBST(null, 5)` must return a new node, so the caller must use the return value as the new root.",
    },
  ],
  problems: [
    {
      id: 'bst-tries-search',
      title: 'Search in a BST',
      difficulty: 'easy',
      leetcode: 700,
      pattern: 'BST walk',
      statement:
        'A library keeps book IDs in a binary search tree. Given the `root` and an ID `val`, return the node that holds `val`. The tests print it as that node with its whole subtree. If the ID is not in the tree, return `null`.',
      examples: [
        { input: 'root = [4,2,7,1,3], val = 2', output: '[2,1,3]', explain: '2 < 4, go left: found 2. Its subtree is 2 with children 1 and 3.' },
        { input: 'root = [4,2,7,1,3], val = 5', output: '[]', explain: '5 > 4 go right to 7, 5 < 7 go left: null. Not found.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 5000', 'All values are distinct'],
      hints: [
        'You never need to look at both children of a node.',
        'Compare `val` with `node.val`: smaller means only the left subtree can hold it.',
        'Loop: while the node is not null, return it if it matches, else move to `node.left` or `node.right`.',
      ],
      approaches: [
        {
          name: 'Visit every node',
          idea: 'Any traversal from module 10 finds it, but ignores the BST rule and may touch all n nodes.',
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'BST walk',
          idea: 'Each comparison rules out one whole side, so you only walk one path from the root down.',
          pseudo: `function searchBST(root, val):
    node ← root
    while node ≠ null and node.val ≠ val:
        if val < node.val:
            node ← node.left
        else:
            node ← node.right
    return node`,
          code: `function searchBST(root, val) {
  let node = root;
  while (node && node.val !== val) {
    node = val < node.val ? node.left : node.right;
  }
  return node;
}`,
          time: 'O(h)',
          space: 'O(1)',
        },
      ],
      fn: 'searchBST',
      starter: `function searchBST(root, val) {
  // walk left or right until you find val or fall off the tree
  return null;
}`,
      solution: `function searchBST(root, val) {
  let node = root;
  while (node && node.val !== val) node = val < node.val ? node.left : node.right;
  return node;
}`,
      tests: [
        { name: 'found inside', args: [[4, 2, 7, 1, 3], 2], expected: [2, 1, 3] },
        { name: 'missing', args: [[4, 2, 7, 1, 3], 5], expected: [] },
        { name: 'found at root', args: [T, 8], expected: T },
        { name: 'subtree with a gap', args: [T, 10], expected: [10, null, 14, 13] },
        { name: 'found a leaf', args: [T, 13], expected: [13] },
        { name: 'middle node', args: [T, 6], expected: [6, 4, 7] },
        { name: 'smaller than everything', args: [T, 0], expected: [] },
        { name: 'empty tree', args: [[], 1], expected: [] },
      ],
      shapes: { args: ['tree', 'raw'], result: 'tree' },
      takeaway: 'In a BST, one comparison per level picks the only side worth visiting.',
    },
    {
      id: 'bst-tries-insert',
      title: 'Insert into a BST',
      difficulty: 'medium',
      leetcode: 701,
      pattern: 'BST walk',
      statement:
        "Add the value `val` to the BST and return the root. `val` is not already in the tree. There are many valid trees, so use the simple rule: walk down as if searching for `val`, and attach it as a **new leaf** at the empty spot where you fall off. Don't move any existing node.",
      examples: [
        { input: 'root = [4,2,7,1,3], val = 5', output: '[4,2,7,1,3,5]', explain: '5 > 4 go right, 5 < 7 go left: empty, so 5 becomes the left child of 7.' },
        { input: 'root = [], val = 5', output: '[5]', explain: 'An empty tree: the new node is the root.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', 'All values are distinct and val is not in the tree'],
      hints: [
        'Where would a search for `val` end? That null spot is where it belongs.',
        'Recursion makes the hookup easy: return the (possibly new) subtree root and assign it to `node.left` or `node.right`.',
        'Base case: if the node is null, return `new TreeNode(val)`. Otherwise recurse into one side and return the node itself.',
      ],
      approaches: [
        {
          name: 'Iterative walk with a parent pointer',
          idea: 'Walk down keeping the last real node. When the next step is null, attach the new node to that parent on the correct side.',
          time: 'O(h)',
          space: 'O(1)',
        },
        {
          name: 'Recursive: return the new subtree root',
          idea: 'Each call returns the root of its subtree after inserting. Only the null spot creates a node; every other call returns itself, so the parent links stay correct.',
          pseudo: `function insert(node, val):
    if node = null:
        return new node(val)
    if val < node.val:
        node.left ← insert(node.left, val)
    else:
        node.right ← insert(node.right, val)
    return node`,
          code: `function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}`,
          time: 'O(h)',
          space: 'O(h) for the call stack',
        },
      ],
      fn: 'insertIntoBST',
      starter: `function insertIntoBST(root, val) {
  // add val as a new leaf where a search for it would fall off; return the root
  return root;
}`,
      solution: `function insertIntoBST(root, val) {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertIntoBST(root.left, val);
  else root.right = insertIntoBST(root.right, val);
  return root;
}`,
      tests: [
        { name: 'example', args: [[4, 2, 7, 1, 3], 5], expected: [4, 2, 7, 1, 3, 5] },
        { name: 'empty tree', args: [[], 5], expected: [5] },
        { name: 'single node, go left', args: [[8], 3], expected: [8, 3] },
        { name: 'single node, go right', args: [[8], 10], expected: [8, null, 10] },
        { name: 'deep insert', args: [T, 5], expected: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13, null, null, 5] },
        { name: 'new maximum', args: [[5, 3, 8], 9], expected: [5, 3, 8, null, null, null, 9] },
        { name: 'new minimum', args: [[5, 3, 8], 1], expected: [5, 3, 8, 1] },
        { name: 'negatives', args: [[0, -5, 5], -3], expected: [0, -5, 5, null, -3] },
        { name: 'between two levels', args: [[40, 20, 60, 10, 30, 50, 70], 25], expected: [40, 20, 60, 10, 30, 50, 70, null, null, 25] },
      ],
      shapes: { args: ['tree', 'raw'], result: 'tree' },
      takeaway: 'Insert = search until you fall off, then hang the new leaf there.',
    },
    {
      id: 'bst-tries-lca',
      title: 'Lowest common ancestor in a BST',
      difficulty: 'medium',
      leetcode: 235,
      pattern: 'BST walk',
      statement:
        'A company org chart is stored as a BST of employee IDs. For two employees `p` and `q`, find their **lowest common ancestor**: the deepest node that has both of them in its subtree (a node counts as in its own subtree). Here `p` and `q` are given as **values**, both exist in the tree, and `p ≠ q`. Return the **value** of the ancestor.',
      examples: [
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8', output: '6', explain: '2 is left of 6 and 8 is right of 6, so they split at 6.' },
        { input: 'root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4', output: '2', explain: '4 is inside 2\'s subtree, and 2 counts as its own ancestor.' },
      ],
      constraints: ['2 ≤ number of nodes ≤ 10⁵', 'All values distinct; p and q both exist'],
      hints: [
        'Module 10 solved this on a general tree by searching both sides. A BST tells you which side each value is on.',
        'If both values are smaller than the node, the answer is somewhere on the left. Both bigger: on the right.',
        'The first node where they do not go the same way (or one of them equals the node) is the answer.',
      ],
      approaches: [
        {
          name: 'General-tree LCA (module 10)',
          idea: 'Search both subtrees and return up whatever you found. Correct, but it ignores the BST rule and may visit every node.',
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'Walk to the split point',
          idea: 'While both values are on the same side of the node, step to that side. The first node that separates them, or equals one of them, is the deepest node holding both.',
          pseudo: `function lca(root, p, q):
    node ← root
    while node ≠ null:
        if p < node.val and q < node.val:
            node ← node.left
        else if p > node.val and q > node.val:
            node ← node.right
        else:
            return node.val           // they split here
    return null`,
          code: `function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node.val;
  }
  return null;
}`,
          time: 'O(h)',
          space: 'O(1)',
        },
      ],
      fn: 'lowestCommonAncestor',
      starter: `function lowestCommonAncestor(root, p, q) {
  // p and q are values; return the VALUE of their lowest common ancestor
  return null;
}`,
      solution: `function lowestCommonAncestor(root, p, q) {
  let node = root;
  while (node) {
    if (p < node.val && q < node.val) node = node.left;
    else if (p > node.val && q > node.val) node = node.right;
    else return node.val;
  }
  return null;
}`,
      tests: [
        { name: 'split at root', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expected: 6 },
        { name: 'one is the ancestor', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expected: 2 },
        { name: 'deep split', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5], expected: 4 },
        { name: 'p bigger than q', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 5, 0], expected: 2 },
        { name: 'right side', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 7, 9], expected: 8 },
        { name: 'root is one of them', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 6, 9], expected: 6 },
        { name: 'far apart', args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 9], expected: 6 },
        { name: 'two nodes', args: [[2, 1], 2, 1], expected: 2 },
      ],
      shapes: { args: ['tree', 'raw', 'raw'] },
      takeaway: 'Two targets in a BST: walk while they agree on a side; the split point is the LCA.',
    },
  ],
  quiz: [
    {
      prompt: 'You search a BST for 12 and the current node is 20. What do you know?',
      options: ['12 can only be in the left subtree of 20', '12 can only be in the right subtree of 20', '12 could be on either side', '12 is not in the tree'],
      answer: 0,
      explanation: 'Everything in the right subtree of 20 is bigger than 20, so 12 can only be on the left.',
    },
    {
      prompt: 'You insert 10, 20, 30, 40, 50 into an empty BST in that order. How long is a search in the worst case?',
      options: ['O(1)', 'O(log n)', 'O(n): the tree is a stick', 'O(n log n)'],
      answer: 2,
      explanation: 'Each value is bigger than the last, so each goes to the right. The tree is one long chain of height n.',
    },
    {
      prompt: 'Where does a newly inserted value end up (with the simple insert)?',
      options: ['Always at the root', 'As a new leaf, where a search for it falls off', 'Next to the closest value, shifting others down', 'In the middle of the tree'],
      answer: 1,
      explanation: 'Search for the value, and the empty spot you reach is where it goes. No existing node moves.',
    },
  ],
  takeaways: [
    'BST rule: everything on the left is smaller, everything on the right is bigger, at every node.',
    'Search, insert and LCA all walk one path: O(h), which is O(log n) only when the tree is balanced.',
    'Recursive edits return the subtree root, and the parent assigns it: `node.left = insert(node.left, x)`.',
  ],
};
