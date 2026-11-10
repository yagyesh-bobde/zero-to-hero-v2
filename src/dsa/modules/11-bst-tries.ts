import type { Module } from '../types';
import { inorderLesson } from './11-bst-tries.inorder';
import { reshapeLesson } from './11-bst-tries.reshape';
import { searchLesson } from './11-bst-tries.search';
import { trieLesson } from './11-bst-tries.trie';
import { trieDfsLesson } from './11-bst-tries.trie-dfs';

const mod: Module = {
  id: 'bst-tries',
  number: 11,
  part: 'nonlinear',
  title: 'BSTs & tries',
  tagline: 'Sorted trees for ordered lookups and prefix trees for words.',
  draft: false,
  intro:
    'Two trees with a superpower. A **binary search tree** keeps numbers in order, so you find, add or remove one by walking a single path instead of the whole tree: that is how database indexes work. A **trie** stores words letter by letter, so every word that starts with "car" sits under the same branch: that is how autocomplete and spell check work. After this module you can solve the LeetCode mediums on validating, editing and querying BSTs, and on tries from prefix search up to Word Search II.',
  lessons: [searchLesson, inorderLesson, reshapeLesson, trieLesson, trieDfsLesson],
  patterns: [
    {
      name: 'BST walk',
      signals: [
        'The input is a **binary search tree** and you look for a value, a range, or where two values split.',
        'You can decide "left or right" from one comparison at each node.',
        'A range query where a whole side can be skipped.',
      ],
      template: `node ← root
while node ≠ null:
    if answer is at node:
        return node
    if target < node.val:
        node ← node.left
    else:
        node ← node.right
return null`,
      examples: ['bst-tries-search', 'bst-tries-lca', 'bst-tries-range-sum'],
    },
    {
      name: 'Return the new root',
      signals: [
        'Insert, delete, trim or build a BST.',
        'A node may disappear or be replaced, so its parent must be re-linked.',
      ],
      template: `function fix(node):
    if node = null:
        return null (or a new node for insert)
    if node must go:
        return the subtree that replaces it
    node.left ← fix(node.left)
    node.right ← fix(node.right)
    return node`,
      examples: ['bst-tries-insert', 'bst-tries-delete', 'bst-tries-trim', 'bst-tries-from-sorted'],
    },
    {
      name: 'In-order = sorted',
      signals: [
        'A BST question about sorted order: kth smallest, closest values, next value, "is it valid".',
        'You would solve it easily if the tree were a sorted array.',
      ],
      template: `prev ← none
stack ← empty stack
node ← root
while node ≠ null or stack is not empty:
    while node ≠ null:
        push node onto stack
        node ← node.left
    node ← pop from stack
    use node.val with prev       // compare, count, or stop
    prev ← node.val
    node ← node.right`,
      examples: ['bst-tries-validate', 'bst-tries-kth-smallest', 'bst-tries-min-diff', 'bst-tries-iterator'],
    },
    {
      name: 'Trie (prefix tree)',
      signals: [
        'Prefix, starts with, autocomplete, dictionary of words, shortest root.',
        'Many words to match at once (in a grid, in a stream of key presses).',
        'A wildcard that matches any letter.',
      ],
      template: `// each node has: children (map letter → node), end (a word ends here?)

insert(word): walk letters, create missing children, mark end
walk(s):      follow letters; null if a child is missing

trie + DFS:
function dfs(state, trieNode):
    next ← trieNode.children[letter at state]
    if next = null: return              // prune
    if next ends a word: record it
    for each move from state: dfs(move, next)`,
      examples: [
        'bst-tries-implement-trie',
        'bst-tries-word-dictionary',
        'bst-tries-replace-words',
        'bst-tries-map-sum',
        'bst-tries-search-suggestions',
        'bst-tries-longest-word',
        'bst-tries-word-search-ii',
      ],
    },
  ],
  practice: [
    { title: 'Two Sum IV - Input is a BST', leetcode: 653, difficulty: 'easy', hint: 'In-order gives a sorted array; then two pointers from module 3.' },
    { title: 'Binary Search Tree to Greater Sum Tree', leetcode: 1038, difficulty: 'medium', hint: 'Walk in reverse in-order (right, node, left) with a running total.' },
    { title: 'Construct BST from Preorder Traversal', leetcode: 1008, difficulty: 'medium', hint: 'Pass an upper bound down; take the next value only while it fits.' },
    { title: 'Convert Sorted List to Binary Search Tree', leetcode: 109, difficulty: 'medium', hint: 'Same middle-as-root idea; find the middle with fast/slow pointers.' },
    { title: 'All Elements in Two Binary Search Trees', leetcode: 1305, difficulty: 'medium', hint: 'Two in-order walks give two sorted lists. Merge them.' },
    { title: 'Recover Binary Search Tree', leetcode: 99, difficulty: 'medium', hint: 'In-order + prev: the swapped pair shows up as one or two places where the order goes down.' },
    { title: 'Serialize and Deserialize BST', leetcode: 449, difficulty: 'medium', hint: 'Preorder is enough for a BST; rebuild with bounds, no null markers.' },
    { title: 'Remove Sub-Folders from the Filesystem', leetcode: 1233, difficulty: 'medium', hint: 'A trie over folder names split by "/": stop when you hit an end node.' },
    { title: 'Short Encoding of Words', leetcode: 820, difficulty: 'medium', hint: 'Insert words reversed; only words that end at a leaf add to the length.' },
    { title: 'Maximum XOR of Two Numbers in an Array', leetcode: 421, difficulty: 'medium', hint: 'A trie of bits, highest bit first; at each step try the opposite bit.' },
    { title: 'Sum of Prefix Scores of Strings', leetcode: 2416, difficulty: 'hard', hint: 'Count how many words pass through each trie node, then sum along each word.' },
    { title: 'Prefix and Suffix Search', leetcode: 745, difficulty: 'hard', hint: 'Insert "suffix#word" for every suffix, then search "suffix#prefix".' },
  ],
};

export default mod;
