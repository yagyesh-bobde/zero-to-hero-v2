import type { Lesson } from '../types';

// Lesson 3 of module 11: delete, trim, prune and build. The "return the new subtree root" move.

/** Monospace art without the leading newline; backslashes kept as typed. */
const art = (s: TemplateStringsArray) => s.raw[0].slice(1);

const T = [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13];

export const reshapeLesson: Lesson = {
  id: 'bst-delete-trim-build',
  title: 'Delete, trim and build',
  summary: 'Change a BST without breaking its rule: each call returns the new root of its subtree.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Deleting an account',
      text: 'You delete your account on a site with 50 million users. Your user ID has to vanish from its sorted index, and the other 49,999,999 IDs must stay perfectly in order, because every login after yours walks that index. The site cannot rebuild the whole index for one delete. It fixes only the few nodes around yours.',
    },
    {
      kind: 'text',
      text: 'The problem: remove the value **3** from our example tree `[8,3,10,1,6,null,14,null,null,4,7,13]` and keep it a valid BST. 3 is not a leaf; it has two children (1 and 6), so you cannot just cut it off.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: rebuild everything',
      code: `function deleteByRebuild(root, key):
    values ← in-order list of root       // sorted
    remove key from values
    return buildBalanced(values)         // middle as root, recurse on halves`,
    },
    {
      kind: 'text',
      text: 'That is correct and even balances the tree, but it costs **O(n)** time and O(n) extra memory to remove one value. Spot the waste: deleting 3 only affects 3 and the nodes right under it. 8, 10, 14 and 13 never needed to move.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Who can take the empty seat?',
      text: "Find the node with a BST walk. Then: a **leaf** just disappears. A node with **one child** is replaced by that child. A node with **two children** needs someone bigger than everything on its left and smaller than everything else on its right. That is its **in-order successor**: the smallest value in its right subtree (step right once, then left as far as you can). Copy that value in, then delete the successor from the right subtree, which is always an easy case because it has no left child.",
    },
    {
      kind: 'diagram',
      title: 'The three cases',
      art: art`
 1) Leaf, delete 7: just cut it off.
       6            6
      / \    =>    /
     4   7        4

 2) One child, delete 10: the child moves up.
       8            8
        \            \
         10   =>      14
          \          /
           14       13
          /
         13

 3) Two children, delete 3: copy the successor (4).
       3            4
      / \          / \
     1   6   =>   1   6
        / \            \
       4   7            7`,
      caption: 'In case 3, the successor of 3 is 4: go right to 6, then left as far as possible. 4 > 1 and 4 < 6, 7, so the rule still holds.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Delete from a BST',
      code: `function deleteNode(node, key):
    if node = null:
        return null                          // key is not in the tree
    if key < node.val:
        node.left ← deleteNode(node.left, key)
    else if key > node.val:
        node.right ← deleteNode(node.right, key)
    else:                                    // found the node to delete
        if node.left = null:
            return node.right                // 0 or 1 child: child moves up
        if node.right = null:
            return node.left
        succ ← node.right
        while succ.left ≠ null:              // smallest value on the right
            succ ← succ.left
        node.val ← succ.val
        node.right ← deleteNode(node.right, succ.val)
    return node`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
    },
    {
      kind: 'text',
      text: "Notice the shape: every call **returns the root of its subtree after the change**, and the parent plugs it back in with `node.left = ...`. You saw it in insert. The same move handles **trimming** (drop every value outside a range: if a node is too small, it and its whole left side go, so return whatever survives on its right) and **pruning** a sum to a range. It also **builds** a tree: from a sorted array, the middle value becomes the root so both halves are the same size.",
    },
    {
      kind: 'diagram',
      title: 'Build a balanced BST from sorted values',
      art: art`
 nums = [1, 2, 3, 4, 5, 6, 7]
                  ^ mid = 3, so the root is 4
 left [1,2,3] -> root 2      right [5,6,7] -> root 6

              4
            /   \
           2     6
          / \   / \
         1   3 5   7`,
      caption: 'Each half does the same thing. With `mid = Math.floor((lo + hi) / 2)` the result is always the same tree, and its height is about log n.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: rebuild on the way back up',
      code: `function fix(node):
    if node = null:
        return null
    if node must go:                     // e.g. it is the key, or out of range
        return the subtree that replaces it
    node.left ← fix(node.left)           // only the side(s) that can change
    node.right ← fix(node.right)
    return node`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Sorted array to balanced BST',
      code: `function sortedArrayToBST(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, nums.length - 1);
}`,
    },
    {
      kind: 'compare',
      title: 'Delete one value',
      rows: [
        { approach: 'Rebuild from the in-order list', time: 'O(n)', space: 'O(n)', note: 'Correct and balanced, but redoes the whole tree for one value.' },
        { approach: 'BST delete (successor swap)', time: 'O(h)', space: 'O(h)', note: 'Walk down once to find it, once more to find the successor. Nothing else moves.' },
      ],
    },
    {
      kind: 'list',
      items: [
        "**Reach for 'return the new root' when** a BST question says delete, remove, trim, insert, or build.",
        'Ask: can this node stay? If not, what single subtree replaces it? Return that.',
        'If the node is out of range, a whole side is out too. Skip it without visiting.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Deleting the wrong copy',
      text: 'In the two-children case, after you copy the successor value into the node, delete the **successor value** from the **right** subtree: `deleteNode(root.right, succ.val)`. If you delete `key` again instead, nothing is found (you just overwrote it), so the old successor stays and its value now appears twice. Also: the root itself can be deleted, so the caller must use the returned root.',
    },
  ],
  problems: [
    {
      id: 'bst-tries-delete',
      title: 'Delete a node in a BST',
      difficulty: 'medium',
      leetcode: 450,
      pattern: 'Return the new root',
      statement:
        "Remove the value `key` from the BST and return the root. If `key` is not there, return the tree unchanged. Many trees are valid, so follow this exact rule: a node with 0 or 1 child is replaced by its child (or nothing). A node with 2 children takes the value of its **in-order successor** (the smallest value in its right subtree), and then that successor is removed from the right subtree with the same rule.",
      examples: [
        { input: 'root = [5,3,6,2,4,null,7], key = 3', output: '[5,4,6,2,null,null,7]', explain: '3 has two children. Its successor is 4: copy 4 up, then remove the leaf 4.' },
        { input: 'root = [5,3,6,2,4,null,7], key = 0', output: '[5,3,6,2,4,null,7]', explain: '0 is not in the tree.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', 'All values are distinct'],
      hints: [
        'First find the node with a normal BST walk. Then handle three cases: no child, one child, two children.',
        'With 0 or 1 child, just return the other child to the parent.',
        'With two children: walk right once, then left to the end. Copy that value in, then call delete on the right subtree with that value.',
      ],
      approaches: [
        {
          name: 'Rebuild from in-order',
          idea: 'List the values in sorted order, drop the key, and build a new tree. Works, but does O(n) work and gives a different shape than the rule asks for.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'BST delete with successor',
          idea: 'Only the deleted spot changes. The successor is the one value that can sit there and keep left < node < right, and it has no left child, so removing it is the easy case.',
          pseudo: `function deleteNode(node, key):
    if node = null:
        return null
    if key < node.val:
        node.left ← deleteNode(node.left, key)
    else if key > node.val:
        node.right ← deleteNode(node.right, key)
    else:
        if node.left = null: return node.right
        if node.right = null: return node.left
        succ ← leftmost node of node.right
        node.val ← succ.val
        node.right ← deleteNode(node.right, succ.val)
    return node`,
          code: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
          time: 'O(h)',
          space: 'O(h)',
        },
      ],
      fn: 'deleteNode',
      starter: `function deleteNode(root, key) {
  // two children: copy the in-order successor, then delete it from the right subtree
  return root;
}`,
      solution: `function deleteNode(root, key) {
  if (!root) return null;
  if (key < root.val) root.left = deleteNode(root.left, key);
  else if (key > root.val) root.right = deleteNode(root.right, key);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
      tests: [
        { name: 'two children', args: [[5, 3, 6, 2, 4, null, 7], 3], expected: [5, 4, 6, 2, null, null, 7] },
        { name: 'key missing', args: [[5, 3, 6, 2, 4, null, 7], 0], expected: [5, 3, 6, 2, 4, null, 7] },
        { name: 'empty tree', args: [[], 0], expected: [] },
        { name: 'only node', args: [[5], 5], expected: [] },
        { name: 'leaf', args: [[5, 3, 6, 2, 4, null, 7], 7], expected: [5, 3, 6, 2, 4] },
        { name: 'one child', args: [[5, 3, 6, 2, 4, null, 7], 6], expected: [5, 3, 7, 2, 4] },
        { name: 'delete the root', args: [[5, 3, 6, 2, 4, null, 7], 5], expected: [6, 3, 7, 2, 4] },
        { name: 'successor is deeper', args: [T, 3], expected: [8, 4, 10, 1, 6, null, 14, null, null, null, 7, 13] },
        { name: 'root, successor has a child', args: [T, 8], expected: [10, 3, 14, 1, 6, 13, null, null, null, 4, 7] },
        { name: 'root with left child only', args: [[2, 1], 2], expected: [1] },
      ],
      shapes: { args: ['tree', 'raw'], result: 'tree' },
      takeaway: 'Two children? Copy the in-order successor up, then delete it from the right subtree.',
    },
    {
      id: 'bst-tries-trim',
      title: 'Trim a BST to a range',
      difficulty: 'medium',
      leetcode: 669,
      pattern: 'Return the new root',
      statement:
        'A price filter: keep only the products priced from `low` to `high` (inclusive). Remove every node outside the range and return the new root. Nodes that stay must keep their relative positions (if one was an ancestor of another, it still is). The answer is unique.',
      examples: [
        { input: 'root = [1,0,2], low = 1, high = 2', output: '[1,null,2]' },
        { input: 'root = [3,0,4,null,2,null,null,1], low = 1, high = 3', output: '[3,2,null,1]', explain: '0 is too small, so it goes and its right side (2 with child 1) moves up. 4 is too big.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', '0 ≤ low ≤ high'],
      hints: [
        'If a node is smaller than `low`, what about everything in its left subtree?',
        'Too small: the node and its whole left side are gone. The answer for this spot is the trimmed right subtree. Too big: the trimmed left subtree.',
        'In range: keep the node, trim both children, plug them back in, return the node.',
      ],
      approaches: [
        {
          name: 'Delete one by one',
          idea: 'Find every out-of-range value and run BST delete on each. Works, but each delete walks from the root again and the successor swaps change the shape the problem asks for.',
          time: 'O(n·h)',
          space: 'O(h)',
        },
        {
          name: 'Recursive trim',
          idea: 'If a node is too small, everything on its left is even smaller, so return the trimmed right side in its place (and the mirror for too big). Otherwise keep it and fix both children.',
          pseudo: `function trim(node, low, high):
    if node = null:
        return null
    if node.val < low:
        return trim(node.right, low, high)    // node + left side are gone
    if node.val > high:
        return trim(node.left, low, high)     // node + right side are gone
    node.left ← trim(node.left, low, high)
    node.right ← trim(node.right, low, high)
    return node`,
          code: `function trimBST(root, low, high) {
  if (!root) return null;
  if (root.val < low) return trimBST(root.right, low, high);
  if (root.val > high) return trimBST(root.left, low, high);
  root.left = trimBST(root.left, low, high);
  root.right = trimBST(root.right, low, high);
  return root;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'trimBST',
      starter: `function trimBST(root, low, high) {
  // keep only values in [low, high]; return the new root
  return root;
}`,
      solution: `function trimBST(root, low, high) {
  if (!root) return null;
  if (root.val < low) return trimBST(root.right, low, high);
  if (root.val > high) return trimBST(root.left, low, high);
  root.left = trimBST(root.left, low, high);
  root.right = trimBST(root.right, low, high);
  return root;
}`,
      tests: [
        { name: 'drop one leaf', args: [[1, 0, 2], 1, 2], expected: [1, null, 2] },
        { name: 'subtree moves up', args: [[3, 0, 4, null, 2, null, null, 1], 1, 3], expected: [3, 2, null, 1] },
        { name: 'bigger tree', args: [T, 4, 10], expected: [8, 6, 10, 4, 7] },
        { name: 'nothing left', args: [[5], 6, 9], expected: [] },
        { name: 'exact single value', args: [[5], 5, 5], expected: [5] },
        { name: 'empty tree', args: [[], 1, 2], expected: [] },
        { name: 'keep everything', args: [[5, 3, 8], 0, 100], expected: [5, 3, 8] },
        { name: 'root removed', args: [T, 9, 20], expected: [10, null, 14, 13] },
      ],
      shapes: { args: ['tree', 'raw', 'raw'], result: 'tree' },
      takeaway: 'An out-of-range node takes a whole side with it; return the trimmed other side.',
    },
    {
      id: 'bst-tries-range-sum',
      title: 'Range sum of a BST',
      difficulty: 'easy',
      leetcode: 938,
      pattern: 'BST walk',
      statement:
        'A shop wants the total stock value of products priced from `low` to `high` (inclusive). Return the sum of all node values in that range. Skip any part of the tree that cannot contain an answer.',
      examples: [
        { input: 'root = [10,5,15,3,7,null,18], low = 7, high = 15', output: '32', explain: '7 + 10 + 15.' },
        { input: 'root = [10,5,15,3,7,13,18,1,null,6], low = 6, high = 10', output: '23', explain: '6 + 7 + 10.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 2·10⁴', 'All values are distinct'],
      hints: [
        'A plain traversal works. Can you skip some subtrees?',
        'If the node is below `low`, its whole left subtree is below too. Only go right.',
      ],
      approaches: [
        {
          name: 'Visit every node',
          idea: 'Traverse everything and add the values that fall in range.',
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'Pruned DFS',
          idea: 'A node below the range means its left side is below too; a node above means its right side is above too. Skip those sides.',
          pseudo: `function rangeSum(node, low, high):
    if node = null:
        return 0
    if node.val < low:
        return rangeSum(node.right, low, high)
    if node.val > high:
        return rangeSum(node.left, low, high)
    return node.val + rangeSum(node.left, low, high) + rangeSum(node.right, low, high)`,
          code: `function rangeSumBST(root, low, high) {
  if (!root) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}`,
          time: 'O(n) worst, much less on narrow ranges',
          space: 'O(h)',
        },
      ],
      fn: 'rangeSumBST',
      starter: `function rangeSumBST(root, low, high) {
  // sum of values in [low, high]; skip subtrees that cannot match
  return 0;
}`,
      solution: `function rangeSumBST(root, low, high) {
  if (!root) return 0;
  if (root.val < low) return rangeSumBST(root.right, low, high);
  if (root.val > high) return rangeSumBST(root.left, low, high);
  return root.val + rangeSumBST(root.left, low, high) + rangeSumBST(root.right, low, high);
}`,
      tests: [
        { name: 'example', args: [[10, 5, 15, 3, 7, null, 18], 7, 15], expected: 32 },
        { name: 'deeper tree', args: [[10, 5, 15, 3, 7, 13, 18, 1, null, 6], 6, 10], expected: 23 },
        { name: 'whole tree', args: [T, 1, 14], expected: 66 },
        { name: 'narrow range', args: [T, 5, 9], expected: 21 },
        { name: 'nothing in range', args: [T, 100, 200], expected: 0 },
        { name: 'single match', args: [[5], 5, 5], expected: 5 },
        { name: 'empty tree', args: [[], 1, 2], expected: 0 },
      ],
      shapes: { args: ['tree', 'raw', 'raw'] },
      takeaway: 'Out of range on one side means that whole side is out: prune it.',
    },
    {
      id: 'bst-tries-from-sorted',
      title: 'Sorted array to balanced BST',
      difficulty: 'easy',
      leetcode: 108,
      pattern: 'Return the new root',
      statement:
        'Turn a sorted array of distinct numbers into a **height-balanced** BST (the two sides of every node differ in height by at most 1). Many answers exist, so use this rule: for the range `lo..hi`, the root is `nums[Math.floor((lo + hi) / 2)]`, the left half builds the left subtree and the right half builds the right subtree.',
      examples: [
        { input: 'nums = [-10,-3,0,5,9]', output: '[0,-10,5,null,-3,null,9]', explain: 'Middle is 0. Left half [-10,-3] picks -10 (index 0) with -3 on its right. Right half [5,9] picks 5 with 9 on its right.' },
        { input: 'nums = [1,3]', output: '[1,null,3]' },
      ],
      constraints: ['0 ≤ nums.length ≤ 10⁴', 'nums is sorted and distinct'],
      hints: [
        'Which value should be the root so both sides get about the same number of values?',
        'The middle. Then the left half is its own smaller problem, and so is the right half.',
        'Recurse on index ranges `build(lo, hi)`; return null when `lo > hi`.',
      ],
      approaches: [
        {
          name: 'Insert one by one',
          idea: 'Insert the values in the given (sorted) order with normal BST insert. It makes a stick of height n: valid BST, but not balanced.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Middle as root, recurse on halves',
          idea: 'The middle value has half the values on each side, so it is the right root. Doing the same in each half keeps every node balanced.',
          pseudo: `function build(lo, hi):
    if lo > hi:
        return null
    mid ← floor((lo + hi) / 2)
    node ← new node(nums[mid])
    node.left ← build(lo, mid - 1)
    node.right ← build(mid + 1, hi)
    return node
// answer: build(0, n - 1)`,
          code: `function sortedArrayToBST(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, nums.length - 1);
}`,
          time: 'O(n)',
          space: 'O(log n) recursion',
        },
      ],
      fn: 'sortedArrayToBST',
      starter: `function sortedArrayToBST(nums) {
  // root = nums[Math.floor((lo + hi) / 2)], then recurse on both halves
  return null;
}`,
      solution: `function sortedArrayToBST(nums) {
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const mid = Math.floor((lo + hi) / 2);
    return new TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi));
  };
  return build(0, nums.length - 1);
}`,
      tests: [
        { name: 'example', args: [[-10, -3, 0, 5, 9]], expected: [0, -10, 5, null, -3, null, 9] },
        { name: 'two values', args: [[1, 3]], expected: [1, null, 3] },
        { name: 'one value', args: [[1]], expected: [1] },
        { name: 'empty', args: [[]], expected: [] },
        { name: 'perfect tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [4, 2, 6, 1, 3, 5, 7] },
        { name: 'even length', args: [[1, 2, 3, 4]], expected: [2, 1, 3, null, null, null, 4] },
        { name: 'six values', args: [[1, 2, 3, 4, 5, 6]], expected: [3, 1, 5, null, 2, 4, 6] },
      ],
      shapes: { result: 'tree' },
      takeaway: 'Balanced from sorted: the middle is the root, each half builds a side.',
    },
  ],
  quiz: [
    {
      prompt: 'You delete a node that has two children. Which value replaces it?',
      options: ['Its left child', 'Its right child', 'The smallest value in its right subtree', 'The root of the tree'],
      answer: 2,
      explanation: 'The in-order successor is bigger than everything on the left and smaller than everything else on the right, so the rule still holds.',
    },
    {
      prompt: 'While trimming to [10, 20], you reach a node with value 4. What happens?',
      options: [
        'Keep it and trim both children',
        'It and its whole left subtree go; the trimmed right subtree takes its place',
        'Remove only the node; both children move up',
        'Stop: nothing below can be in range',
      ],
      answer: 1,
      explanation: 'Everything on the left of 4 is smaller than 4, so smaller than 10. Only the right side can still hold values in range.',
    },
    {
      prompt: 'Why does a recursive BST edit return a node?',
      options: [
        'To count the nodes',
        'Because the root of a subtree may change, and the parent must point to the new one',
        'JavaScript functions must return something',
        'To make it faster',
      ],
      answer: 1,
      explanation: 'Deleting or trimming can replace a subtree root. Returning it lets the parent write `node.left = ...` and stay connected.',
    },
  ],
  takeaways: [
    'Delete: 0 or 1 child, the child moves up. 2 children, copy the in-order successor and delete it from the right.',
    'Edits return the new subtree root and the parent plugs it in. Same move for insert, delete, trim and build.',
    'Out of range on one side means the whole side is out: prune it without visiting.',
  ],
};
