import type { Module } from '../types';
import dfs from './10-trees.dfs';
import bfs from './10-trees.bfs';
import infoUp from './10-trees.info-up';
import paths from './10-trees.paths';
import build from './10-trees.build';
import lca from './10-trees.lca';

const mod: Module = {
  id: 'trees',
  number: 10,
  part: 'nonlinear',
  title: 'Binary trees',
  tagline: 'DFS and BFS on trees, and how to return the right thing from a recursive call.',
  draft: false,
  intro:
    'File systems, org charts, the DOM in your browser and every search index are trees. Almost every tree problem is one of two walks: **DFS** (go deep, usually with recursion) or **BFS** (go level by level with a queue). The real skill is deciding what each call should **return up** to its parent or **pass down** to its children. After this module you can solve medium tree problems like level order, diameter, path sums, rebuilding a tree and lowest common ancestor in one pass.',
  lessons: [dfs, bfs, infoUp, paths, build, lca],
  patterns: [
    {
      name: 'Tree DFS (recursive or with a stack)',
      signals: [
        '"Visit every node", "for each node", "mirror", "copy"',
        'The order matters: node first (preorder), between children (inorder), after children (postorder)',
        'The tree may be very deep: switch to your own stack',
      ],
      template: `function dfs(node):
    if node = null: return BASE
    // preorder work
    left ← dfs(node.left)
    // inorder work
    right ← dfs(node.right)
    // postorder work
    return combine(node, left, right)`,
      examples: ['trees-preorder', 'trees-inorder', 'trees-invert', 'trees-same'],
    },
    {
      name: 'BFS by levels',
      signals: [
        '"Level", "row", "depth order", "top to bottom"',
        '"First / last node on each level", "right side view", "zigzag"',
        'Closest to the root, minimum depth',
      ],
      template: `queue ← [root]
while queue is not empty:
    size ← length of queue
    repeat size times:
        node ← queue.popFront()
        // work for this node
        push node's non-null children to the back
    // work for the finished level`,
      examples: ['trees-level-order', 'trees-right-side-view', 'trees-zigzag'],
    },
    {
      name: 'Return info up (postorder)',
      signals: [
        'The answer at a node depends on answers from both subtrees',
        'Height, size, balanced, longest path, "moves needed"',
        'Two nodes meeting: lowest common ancestor',
        'Return what the parent needs; keep the global best in an outside variable',
      ],
      template: `best ← starting value
function solve(node):
    if node = null: return EMPTY_INFO
    left ← solve(node.left)
    right ← solve(node.right)
    best ← better of best and f(node, left, right)
    return info the parent needs
solve(root)
return best`,
      examples: [
        'trees-max-depth',
        'trees-diameter',
        'trees-balanced',
        'trees-distribute-coins',
        'trees-max-path-sum',
        'trees-lca',
        'trees-lca-deepest-leaves',
      ],
    },
    {
      name: 'Pass info down (root-to-leaf)',
      signals: [
        '"Root-to-leaf path", "from the top", "path so far"',
        'A running total, a number being built, or the current path',
        'Check the condition at the leaf; undo shared state on the way back',
      ],
      template: `function dfs(node, state):
    if node = null: return
    state ← update(state, node)
    if node is a leaf: check state
    dfs(node.left, state)
    dfs(node.right, state)
    // undo changes to shared state here`,
      examples: ['trees-path-sum', 'trees-path-sum-ii', 'trees-sum-root-to-leaf', 'trees-step-directions'],
    },
  ],
  practice: [
    { title: 'Symmetric Tree', leetcode: 101, difficulty: 'easy', hint: 'Lockstep DFS, but compare the left of one side with the right of the other.' },
    { title: 'Minimum Depth of Binary Tree', leetcode: 111, difficulty: 'easy', hint: 'BFS and stop at the first leaf. With DFS, a node with one child is not a leaf.' },
    { title: 'Binary Tree Postorder Traversal', leetcode: 145, difficulty: 'easy', hint: 'Do "node, right, left" with a stack, then reverse the result.' },
    { title: 'Average of Levels in Binary Tree', leetcode: 637, difficulty: 'easy', hint: 'BFS by levels; divide each row\'s sum by its size.' },
    { title: 'Maximum Width of Binary Tree', leetcode: 662, difficulty: 'medium', hint: 'Give each node a position: children of i are 2i and 2i + 1. Width = last - first + 1 per row.' },
    { title: 'Populating Next Right Pointers in Each Node II', leetcode: 117, difficulty: 'medium', hint: 'BFS by levels and link each node to the next one in its row.' },
    { title: 'Path Sum III', leetcode: 437, difficulty: 'medium', hint: 'Paths only go down but can start anywhere: pass a map of prefix sums down the tree.' },
    { title: 'Construct Binary Tree from Inorder and Postorder Traversal', leetcode: 106, difficulty: 'medium', hint: 'Postorder\'s last value is the root. Read it backwards and build the right subtree first.' },
    { title: 'Flatten Binary Tree to Linked List', leetcode: 114, difficulty: 'medium', hint: 'Process nodes in reverse preorder (right, left, node) and keep a pointer to the previous one.' },
    { title: 'All Nodes Distance K in Binary Tree', leetcode: 863, difficulty: 'medium', hint: 'Record each node\'s parent, then BFS outward from the target for k steps.' },
    { title: 'Find Duplicate Subtrees', leetcode: 652, difficulty: 'medium', hint: 'Serialize every subtree in postorder and count the strings in a map.' },
    { title: 'Binary Tree Cameras', leetcode: 968, difficulty: 'hard', hint: 'Return one of three states up: covered, has a camera, needs a camera. Decide greedily from the leaves.' },
  ],
};

export default mod;
