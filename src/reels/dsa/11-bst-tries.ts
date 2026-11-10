import type { DiagramScene, Series, TreeNode } from '../types';

// /dsa/reels module 11. One reel per lesson of src/dsa/modules/11-bst-tries*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

/** A tree as nested tuples: [label, ...children]. A label may carry its own id as "label#id". */
type Spec = readonly [string, ...Spec[]];
type Mark = Omit<TreeNode, 'id' | 'label' | 'children'>;
type Marks = Record<string, Mark>;

/** Builds a tree scene root; `marks` is keyed by node id (the label unless "label#id" is used). */
const tree = (spec: Spec, marks: Marks = {}): TreeNode => {
  const [raw, ...kids] = spec;
  const [label, id = raw] = raw.split('#');
  return { id: `n-${id}`, label, ...marks[id], ...(kids.length ? { children: kids.map((k) => tree(k, marks)) } : {}) };
};

/** Marks every listed id with the same props. Tree node `tone` is overridden by `.dia-node` in reels.css, so use active / dirty / dim. */
const all = (ids: string[], props: Mark): Marks => Object.fromEntries(ids.map((id) => [id, props]));
const gone = (ids: string[]): Marks => all(ids, { dim: true });

// Lesson 1: the example BST, level order [8,3,10,1,6,null,14,null,null,4,7,13].
const bst: Spec = ['8', ['3', ['1'], ['6', ['4'], ['7']]], ['10', ['14', ['13']]]];

// Lesson 2: the suspicious tree [5,4,6,null,null,3,7] and its in-order sequence.
const suspect: Spec = ['5', ['4'], ['6', ['3'], ['7']]];
const inorderSeq = [4, 5, 3, 6, 7];

// Lesson 3: delete 3. Its seat keeps id "3" while it takes the successor's value 4.
const seatTaken: Spec = ['8', ['4#3', ['1'], ['6', ['4'], ['7']]], ['10', ['14', ['13']]]];
const deleted: Spec = ['8', ['4#3', ['1'], ['6', ['7']]], ['10', ['14', ['13']]]];

// Lesson 4: a trie for car, cat, do, dog (a star marks a word's end), then insert "cab".
const trie = (b?: string): Spec => [
  'root',
  ['c', ['a', ...(b ? [[b] as const] : []), ['r*#r'], ['t*#t']]],
  ['d', ['o*#o', ['g*#g']]],
];

// Lesson 5: the trie path for "mouse" (b and n branch off at o). Each node keeps the first 3 sorted products through it.
const letters: [string, number, number][] = [['m', 1, 0], ['o', 1, 1], ['b', 0, 2], ['u', 1, 2], ['n', 2, 2], ['s', 1, 3], ['e', 1, 4]];
const links: [string, string][] = [['m', 'o'], ['o', 'b'], ['o', 'u'], ['o', 'n'], ['u', 's'], ['s', 'e']];
const typing = (at: string, caption: string, title = 'Typing “mouse”'): DiagramScene => {
  const path = 'mouse'.slice(0, 'mouse'.indexOf(at) + 1);
  const off = (id: string) => path.length >= 3 && 'bn'.includes(id); // side branches drop out after "mou"
  return {
    type: 'diagram', title, cols: 3, rows: 5, caption,
    nodes: letters.map(([id, x, y]) => ({ id, label: id, x, y, shape: 'pill', active: id === at, dim: off(id) })),
    edges: links.map(([from, to]) => ({ from, to, active: path.includes(from) && path.includes(to) })),
  };
};

export const series: Series = {
  id: 'dsa-bst-tries',
  title: 'BSTs & tries',
  emoji: '🌲',
  color: '#fb923c',
  order: 11,
  blurb: 'Sorted trees for ordered lookups and prefix trees for words.',
  reels: [
    {
      id: 'dsa-bst-tries-bst-search-insert',
      title: 'The BST rule: search and insert',
      link: { label: 'Solve it', href: '/dsa#/m/bst-tries/bst-search-insert/bst-tries-search' },
      beats: [
        {
          say: 'One row out of a million, found in twenty steps. How?',
          emphasis: ['twenty'],
          scene: { type: 'title', kicker: 'BSTs · Lesson 1', title: 'Find 1 row in a *million*', emoji: '🗄️', style: 'slam' },
        },
        {
          say: 'Look at this tree. At every node, everything on the left is smaller, and everything on the right is bigger.',
          emphasis: ['smaller', 'bigger'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'A binary search tree',
            root: tree(bst, { '8': { active: true } }),
            caption: 'left smaller · right bigger',
          },
        },
        {
          say: 'The easy way checks every node, on both sides. That is O of n, and it ignores the rule.',
          speak: 'The easy way checks every node, on both sides. That is oh of n, and it ignores the rule.',
          emphasis: ['every', 'node'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function contains(node, target):
    if node = null: return false
    if node.val = target: return true
    return contains(node.left, target)
        or contains(node.right, target)`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'both sides, every time: O(n)', tone: 'warn' },
          },
        },
        {
          say: 'Looking for six, the first check is six against eight. Everything on the right is bigger, so why walk it?',
          emphasis: ['bigger'],
          scene: {
            type: 'tree',
            title: 'Spot the waste',
            root: tree(bst, { '8': { active: true }, ...all(['10', '14', '13'], { dirty: true }) }),
            caption: '6 < 8, so 10, 14, 13 are useless',
          },
        },
        {
          say: 'So compare with the node. Smaller, go left. Bigger, go right. Each step throws away a whole side.',
          emphasis: ['left', 'right'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Skip a *whole side*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Search for five. Five is less than eight, so go left. The whole right side is gone.',
          emphasis: ['left', 'gone'],
          scene: {
            type: 'tree',
            title: 'Search for 5',
            root: tree(bst, { '8': { active: true }, ...gone(['10', '14', '13']) }),
            caption: '5 < 8 · go left',
          },
        },
        {
          say: 'Five beats three, so go right. That rules out the one on the left.',
          emphasis: ['right'],
          scene: {
            type: 'tree',
            title: 'Search for 5',
            root: tree(bst, { '3': { active: true }, ...gone(['10', '14', '13', '1']) }),
            caption: '5 > 3 · go right',
          },
        },
        {
          say: 'Five is less than six, so go left, and seven is out too.',
          emphasis: ['left'],
          scene: {
            type: 'tree',
            title: 'Search for 5',
            root: tree(bst, { '6': { active: true }, ...gone(['10', '14', '13', '1', '7']) }),
            caption: '5 < 6 · go left',
          },
        },
        {
          say: 'Five beats four, so go right. Nothing is there, so five is not in the tree, and that empty spot is where it would go.',
          emphasis: ['empty', 'spot'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'Search for 5',
            root: tree(bst, { '4': { active: true }, ...gone(['10', '14', '13', '1', '7']) }),
            caption: '4 checks of 9 · 5 joins under 4',
          },
        },
        {
          say: 'In JavaScript, one line picks the side. You walk a single path, so it is O of h, the height of the tree.',
          speak: 'In JavaScript, one line picks the side. You walk a single path, so it is oh of h, the height of the tree.',
          emphasis: ['single', 'path'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'searchBST.js',
            code: `function searchBST(root, x) {
  let n = root;
  while (n) {
    if (x === n.val) return n;
    n = x < n.val ? n.left : n.right;
  }
  return null;
}`,
            highlight: [5],
            note: { line: 5, text: 'one path down: O(height)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the problem says binary search tree, and asks you to find or insert a value.',
          emphasis: ['binary', 'search'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It says *binary search tree*', icon: '🌳' },
              { text: 'Find or insert a value', icon: '🔎' },
              { text: 'Go only *one* way per node', icon: '➡️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap in insert: call it without saving the result, and the new node is built, then dropped.',
          emphasis: ['dropped'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `function insert(n, x) {
  if (!n) return new TreeNode(x);
  if (x < n.val) insert(n.left, x);
  else insert(n.right, x);
  return n;
}`,
            errors: [[3, 4]],
            note: { line: 4, text: 'needs n.left = insert(…)', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You insert ten, twenty, thirty, forty, fifty, in that order. How slow is a search?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Insert 10, 20, 30, 40, 50 in order. How slow is a search?',
            options: ['O(1)', 'O(log n)', 'O(n): it is a stick'],
            answer: 2,
          },
        },
        {
          say: 'O of n. Each value goes right, so the tree becomes one long stick.',
          speak: 'Oh of n. Each value goes right, so the tree becomes one long stick.',
          emphasis: ['stick'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Insert 10, 20, 30, 40, 50 in order. How slow is a search?',
            options: ['O(1)', 'O(log n)', 'O(n): it is a stick'],
            answer: 2,
            reveal: true,
            explain: 'Each value goes right. The tree is one long chain, n tall.',
          },
        },
        {
          say: 'Remember this. Smaller goes left, bigger goes right, and you only walk one path. Now tap solve it and try it yourself.',
          emphasis: ['left', 'right'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Left is smaller, right is *bigger*', 'One path down: *O(h)*', 'Save what insert returns'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-bst-tries-bst-inorder-sorted',
      title: 'In-order is sorted: validate and kth smallest',
      link: { label: 'Solve it', href: '/dsa#/m/bst-tries/bst-inorder-sorted/bst-tries-validate' },
      beats: [
        {
          say: 'Tap price, low to high. The shop never runs a sort. How?',
          emphasis: ['never'],
          scene: { type: 'title', kicker: 'BSTs · Lesson 2', title: 'Low to high, with *no sort*', emoji: '🛒', style: 'slam' },
        },
        {
          say: 'A teammate says this is a binary search tree. Every node looks fine next to its children. Is it valid?',
          emphasis: ['valid'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Is this a BST?',
            root: tree(suspect, { '6': { active: true } }),
            caption: 'every parent-child check passes',
          },
        },
        {
          say: 'No. Three sits on the right side of five, so it has to be bigger than five. It is not.',
          emphasis: ['bigger', 'five'],
          sfx: 'error',
          scene: {
            type: 'tree',
            title: 'Is this a BST?',
            root: tree(suspect, { '3': { active: true }, '5': { dirty: true } }),
            caption: '3 is right of 5, but 3 < 5',
          },
        },
        {
          say: 'A safe brute force checks each node against the biggest value on its left and the smallest on its right. That re-walks subtrees, so O of n squared.',
          speak: 'A safe brute force checks each node against the biggest value on its left and the smallest on its right. That re-walks subtrees, so oh of n squared.',
          emphasis: ['squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function isBST(node):
    if node = null: return true
    if maxOf(node.left) ≥ node.val:
        return false
    if minOf(node.right) ≤ node.val:
        return false
    return isBST(node.left)
        and isBST(node.right)`,
            highlight: [3, 5],
            note: { line: 5, text: 'each walks a whole subtree', tone: 'warn' },
          },
        },
        {
          say: 'Walk left, node, right. In a real BST the values come out sorted, so just check each one beats the last.',
          emphasis: ['sorted'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'In-order of a BST is *sorted*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'In-order starts at the far left, with four. Four beats minus infinity, so prev becomes four.',
          emphasis: ['four'],
          scene: {
            type: 'array',
            title: 'In-order walk',
            cells: inorderSeq,
            pointers: { cur: 0 },
            active: [0],
            vars: { prev: '-∞', check: '4 > -∞ ✓' },
          },
        },
        {
          say: 'Next comes the root, five. Five beats four, so the list is still going up.',
          emphasis: ['up'],
          scene: {
            type: 'array',
            title: 'In-order walk',
            cells: inorderSeq,
            pointers: { cur: 1 },
            active: [1],
            done: [0],
            vars: { prev: 4, check: '5 > 4 ✓' },
          },
        },
        {
          say: 'Then the right side starts at its far left, with three. Is three bigger than five? No. The order went down.',
          emphasis: ['down'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'In-order walk',
            cells: inorderSeq,
            pointers: { cur: 2 },
            active: [2],
            reads: [1],
            done: [0],
            vars: { prev: 5, check: '3 > 5 ✗' },
          },
        },
        {
          say: 'Stop right there. It is not a BST, and one pass found the bug the child check missed.',
          emphasis: ['one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'In-order walk',
            cells: inorderSeq,
            pointers: { cur: 2 },
            active: [2],
            done: [0, 1, 3, 4],
            vars: { prev: 5, check: 'not a BST' },
            caption: 'stopped early: O(n) at most',
          },
        },
        {
          say: 'In JavaScript, keep prev outside the walk. Each value must beat it, then becomes the new prev. That is O of n.',
          speak: 'In JavaScript, keep prev outside the walk. Each value must beat it, then becomes the new prev. That is oh of n.',
          emphasis: ['prev'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'isValidBST.js',
            code: `function isValidBST(root) {
  let prev = -Infinity;
  const walk = (n) => {
    if (!n) return true;
    if (!walk(n.left)) return false;
    if (n.val <= prev) return false;
    prev = n.val;
    return walk(n.right);
  };
  return walk(root);
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'sorted check in one pass: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a BST question talks about sorted order, the kth smallest, or whether the tree is valid.',
          emphasis: ['sorted', 'kth'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Sorted order or *kth smallest*', icon: '🔢' },
              { text: 'Closest values, next bigger', icon: '📏' },
              { text: 'Is this tree *valid*?', icon: '✅' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: start prev at zero, and a valid tree of negative numbers fails. Start it at minus infinity.',
          emphasis: ['zero', 'infinity'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let prev = 0;
const walk = (n) => {
  if (!n) return true;
  if (!walk(n.left)) return false;
  if (n.val <= prev) return false;
  prev = n.val;
  return walk(n.right);
};`,
            errors: [1],
            note: { line: 1, text: 'a tree of negatives fails', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. To find the smallest gap between two values in a BST, which pairs do you compare?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Smallest gap between two values in a BST. Compare which pairs?',
            options: ['Every pair', 'Each node and its parent', 'Neighbours in in-order'],
            answer: 2,
          },
        },
        {
          say: 'Just neighbours in in-order. In a sorted list, the two closest values always sit side by side.',
          emphasis: ['neighbours'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Smallest gap between two values in a BST. Compare which pairs?',
            options: ['Every pair', 'Each node and its parent', 'Neighbours in in-order'],
            answer: 2,
            reveal: true,
            explain: 'Sorted, the two closest values always sit next to each other.',
          },
        },
        {
          say: 'Remember this. A BST read in-order is a sorted list, so check that it only goes up. Now tap solve it and try it yourself.',
          emphasis: ['sorted', 'up'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['In-order of a BST is *sorted*', 'Keep *prev*, check it grows', 'Start prev at minus infinity'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-bst-tries-bst-delete-trim-build',
      title: 'Delete, trim and build',
      link: { label: 'Solve it', href: '/dsa#/m/bst-tries/bst-delete-trim-build/bst-tries-delete' },
      beats: [
        {
          say: 'Delete one user out of fifty million. Keep everyone else in order.',
          emphasis: ['one', 'order'],
          scene: { type: 'title', kicker: 'BSTs · Lesson 3', title: 'Delete 1 user of *50 million*', emoji: '🗑️', style: 'slam' },
        },
        {
          say: 'Remove three from this tree and keep it a valid BST. But three has two children, so you cannot just cut it off.',
          emphasis: ['two', 'children'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Delete 3',
            root: tree(bst, { '3': { active: true } }),
            caption: '3 has two children: 1 and 6',
          },
        },
        {
          say: 'The easy way lists every value, removes one, and rebuilds the whole tree. That is O of n for a single delete.',
          speak: 'The easy way lists every value, removes one, and rebuilds the whole tree. That is oh of n for a single delete.',
          emphasis: ['whole', 'tree'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function deleteByRebuild(root, key):
    values ← in-order list of root
    remove key from values
    return buildBalanced(values)`,
            highlight: [4],
            note: { line: 4, text: 'rebuilds all n nodes: O(n)', tone: 'warn' },
          },
        },
        {
          say: 'But deleting three only touches three and the nodes under it. Eight, ten, fourteen and thirteen never move.',
          emphasis: ['never', 'move'],
          scene: {
            type: 'tree',
            title: 'Spot the waste',
            root: tree(bst, { '3': { active: true }, ...gone(['8', '10', '14', '13']) }),
            caption: 'only 3 and below can change',
          },
        },
        {
          say: 'A leaf just goes. One child moves up. With two children, the smallest value on the right takes the seat.',
          emphasis: ['smallest', 'right'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Who takes the *empty seat*?', emoji: '💡', style: 'slam' },
        },
        {
          say: 'To find that value, step right once, to six. Then go left as far as you can.',
          emphasis: ['right', 'left'],
          scene: {
            type: 'tree',
            title: 'Delete 3',
            root: tree(bst, { '3': { dirty: true }, '6': { active: true } }),
            caption: 'step right once, to 6…',
          },
        },
        {
          say: 'That lands on four. It is bigger than everything on the left, and smaller than the rest on the right.',
          emphasis: ['four'],
          scene: {
            type: 'tree',
            title: 'Delete 3',
            root: tree(bst, { '3': { dirty: true }, '4': { active: true } }),
            caption: '…then left: the successor is 4',
          },
        },
        {
          say: 'Copy four into the empty seat. For a moment, four appears twice.',
          emphasis: ['Copy', 'twice'],
          scene: {
            type: 'tree',
            title: 'Delete 3',
            root: tree(seatTaken, { '3': { active: true }, '4': { dirty: true } }),
            caption: 'copy 4 into the seat',
          },
        },
        {
          say: 'Then delete the old four from the right side. It is a leaf, so it just goes. Nothing else moved.',
          emphasis: ['leaf', 'Nothing'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'Delete 3',
            root: tree(deleted, { '3': { active: true } }),
            caption: 'still a valid BST · O(h) work',
          },
        },
        {
          say: 'In JavaScript, zero or one child returns the other side. Two children copy the successor, then delete it on the right. That is O of h.',
          speak: 'In JavaScript, zero or one child returns the other side. Two children copy the successor, then delete it on the right. That is oh of h.',
          emphasis: ['successor'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'deleteNode.js',
            code: `// found it: n.val === key
if (!n.left) return n.right;
if (!n.right) return n.left;
let s = n.right;
while (s.left) s = s.left;
n.val = s.val;
n.right = del(n.right, s.val);
return n;`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'two walks down: O(h)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a BST question says delete, trim, or build. Each call returns its new subtree root.',
          emphasis: ['returns'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Delete, remove or *trim*', icon: '✂️' },
              { text: 'Build from *sorted* values', icon: '🧱' },
              { text: 'Return the new subtree root', icon: '↩️' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap: after copying, delete the successor value, not the key again. The key is already gone, so nothing gets deleted.',
          emphasis: ['successor', 'key'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let s = n.right;
while (s.left) s = s.left;
n.val = s.val;
n.right = del(n.right, key);`,
            errors: [4],
            note: { line: 4, text: 'key is gone: deletes nothing', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. You trim a tree to keep only ten through twenty, and you reach a four. What happens?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Trimming to keep 10 through 20, you reach a 4. What happens?',
            options: ['Keep it, trim both sides', '4 and its left side go', 'Stop the whole trim'],
            answer: 1,
          },
        },
        {
          say: 'Four goes, and its whole left side goes with it. Only its right side can still hold values in range.',
          emphasis: ['whole', 'left'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Trimming to keep 10 through 20, you reach a 4. What happens?',
            options: ['Keep it, trim both sides', '4 and its left side go', 'Stop the whole trim'],
            answer: 1,
            reveal: true,
            explain: 'All left of 4 is under 10 too. Only its right side can stay.',
          },
        },
        {
          say: 'Remember this. Every edit returns the new root of its subtree, and the parent plugs it back in. Now tap solve it and try it yourself.',
          emphasis: ['returns', 'plugs'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['0 or 1 child: it *moves up*', '2 children: copy the *successor*', 'Return the new subtree root'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-bst-tries-trie-basics',
      title: 'Tries: insert, search, prefix',
      link: { label: 'Solve it', href: '/dsa#/m/bst-tries/trie-basics/bst-tries-implement-trie' },
      beats: [
        {
          say: 'You type two letters, and two thousand contacts shrink instantly. How?',
          emphasis: ['instantly'],
          scene: { type: 'title', kicker: 'Tries · Lesson 4', title: 'Two letters, *instant* results', emoji: '📇', style: 'slam' },
        },
        {
          say: 'Is ca a word? No. Does any word start with ca? Yes, car and cat.',
          speak: 'Is kah a word? No. Does any word start with kah? Yes, car and cat.',
          emphasis: ['word', 'start'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Our dictionary',
            cells: ['car', 'cat', 'do', 'dog'],
            indices: false,
            found: [0, 1],
            vars: { 'word?': 'no', 'prefix?': 'yes' },
            caption: 'car and cat start with “ca”',
          },
        },
        {
          say: 'The easy way checks every word, one by one, for every single question.',
          emphasis: ['every', 'word'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function startsWith(words, prefix):
    for each w in words:
        if w begins with prefix:
            return true
    return false`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'every word, every question', tone: 'warn' },
          },
        },
        {
          say: 'With a million words, every key press costs a million checks. That is O of N times L.',
          speak: 'With a million words, every key press costs a million checks. That is oh of N times L.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'checks per *key press*',
            sub: 'O(N · L): every word, every time',
            tone: 'bad',
          },
        },
        {
          say: 'Build a tree where each step down is one letter. Words that start the same share one path.',
          emphasis: ['one', 'letter'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Store each shared start *once*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Here is the trie for car, cat, do and dog. Stars mark where a word ends. To insert cab, start at c.',
          emphasis: ['Stars'],
          scene: {
            type: 'tree',
            title: 'Insert “cab”',
            root: tree(trie(), { c: { active: true } }),
            caption: 'c exists · move down',
          },
        },
        {
          say: 'A is there too, shared by car and cat. Move down again.',
          emphasis: ['shared'],
          scene: {
            type: 'tree',
            title: 'Insert “cab”',
            root: tree(trie(), { a: { active: true } }),
            caption: 'a exists · move down',
          },
        },
        {
          say: 'There is no b under a yet, so create one new node.',
          emphasis: ['new', 'node'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Insert “cab”',
            root: tree(trie('b'), { b: { active: true } }),
            caption: 'b is missing · create it',
          },
        },
        {
          say: 'Mark it with a star, since a word ends here. Only one node was new. The shared start was reused.',
          emphasis: ['one', 'reused'],
          scene: {
            type: 'tree',
            title: 'Insert “cab”',
            root: tree(trie('b*#b'), { b: { active: true } }),
            caption: 'b* · a word ends here',
          },
        },
        {
          say: 'Now search for ca. The path is there, but a has no star. So it is a prefix, not a word.',
          speak: 'Now search for kah. The path is there, but a has no star. So it is a prefix, not a word.',
          emphasis: ['prefix', 'not'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'Search “ca”',
            root: tree(trie('b*#b'), { c: { dirty: true }, a: { active: true } }),
            caption: 'a path, but no star: not a word',
          },
        },
        {
          say: 'In JavaScript, insert walks the letters and creates what is missing. Search also checks the end flag. Each is O of L, the word length.',
          speak: 'In JavaScript, insert walks the letters and creates what is missing. Search also checks the end flag. Each is oh of L, the word length.',
          emphasis: ['letters', 'end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'Trie.js',
            code: `insert(word) {
  let node = this.root;
  for (const ch of word) {
    node.kids[ch] ??= { kids: {} };
    node = node.kids[ch];
  }
  node.end = true;
}
search(word) {
  return !!this.walk(word)?.end;
}
startsWith(p) {
  return this.walk(p) !== null;
}`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'one step per letter: O(L)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you see prefix, starts with, autocomplete, or a big dictionary of words.',
          emphasis: ['prefix', 'autocomplete'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Prefix, starts with, *autocomplete*', icon: '⌨️' },
              { text: 'A big dictionary of *words*', icon: '📖' },
              { text: 'Many lookups with shared starts', icon: '🔁' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: forget the end flag, and search acts like starts with. After apple, app would count as a word.',
          emphasis: ['end', 'flag'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `search(word) {
  return this.walk(word) !== null;
}
// after "apple": search("app") → true`,
            errors: [2],
            note: { line: 2, text: 'a path is not a word', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A trie holds a million words. How long does starts with pre take?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A trie holds a million words. How long is startsWith("pre")?',
            options: ['About a million steps', 'About 3 steps', 'About 20 steps'],
            answer: 1,
          },
        },
        {
          say: 'About three steps, one per letter. The number of stored words does not matter at all.',
          emphasis: ['three', 'letter'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A trie holds a million words. How long is startsWith("pre")?',
            options: ['About a million steps', 'About 3 steps', 'About 20 steps'],
            answer: 1,
            reveal: true,
            explain: 'One node per letter. The number of words does not matter.',
          },
        },
        {
          say: 'Remember this. Walk one letter per step, and mark where each word ends. Now tap solve it and try it yourself.',
          emphasis: ['letter', 'ends'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Each step down is one *letter*', 'Shared starts stored *once*', 'A path is not a word'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-bst-tries-trie-dfs',
      title: 'Trie + DFS: suggestions and word search',
      link: { label: 'Solve it', href: '/dsa#/m/bst-tries/trie-dfs/bst-tries-search-suggestions' },
      beats: [
        {
          say: 'Type one letter, and a search box suggests three products instantly. How?',
          emphasis: ['three', 'instantly'],
          scene: { type: 'title', kicker: 'Tries · Lesson 5', title: '3 suggestions per *key press*', emoji: '🔍', style: 'slam' },
        },
        {
          say: 'After each letter of mouse, show the first three products, in a to z order, that start with what you typed.',
          emphasis: ['first', 'three'],
          sfx: 'pop',
          scene: {
            type: 'list',
            title: 'Typing “mouse”',
            items: [
              { text: 'After *m* and *mo*', sub: 'mobile, moneypot, monitor', icon: '⌨️' },
              { text: 'After *mou*, *mous*, *mouse*', sub: 'mouse, mousepad', icon: '🖱️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The easy way rescans every product after every key press, even though each letter only narrows the last answer.',
          emphasis: ['every', 'product'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function suggest(products, word):
    sort products
    for i from 1 to length(word):
        prefix ← word[0..i-1]
        matches ← products with prefix
        keep the first 3 matches`,
            highlight: [5],
            note: { line: 5, text: 'rescans every product', tone: 'warn' },
          },
        },
        {
          say: 'Put the products in a trie. Then each key press is just one step down from where you were.',
          emphasis: ['one', 'step'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'One key press, *one step* down', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Insert the products in a to z order, and let each node keep the first three that pass through it.',
          emphasis: ['first', 'three'],
          scene: typing('n', 'n keeps: moneypot, monitor', 'Each node keeps its top 3'),
        },
        {
          say: 'Type m. Step to the m node and read its top three: mobile, moneypot, monitor.',
          emphasis: ['read'],
          scene: typing('m', 'm: mobile, moneypot, monitor'),
        },
        {
          say: 'Type o. One more step down, and the o node holds the same three.',
          emphasis: ['same'],
          scene: typing('o', 'mo: mobile, moneypot, monitor'),
        },
        {
          say: 'Type u. Now the u node holds only mouse and mousepad.',
          emphasis: ['only'],
          scene: typing('u', 'mou: mouse, mousepad'),
        },
        {
          say: 'Type s. One more step, and the s node keeps the same two.',
          emphasis: ['same'],
          scene: typing('s', 'mous: mouse, mousepad'),
        },
        {
          say: 'Type e. One last step, and the same answer. Five letters, five steps, no rescanning.',
          emphasis: ['five', 'steps'],
          sfx: 'success',
          scene: typing('e', 'mouse: mouse, mousepad · 5 steps'),
        },
        {
          say: 'In JavaScript, insert the sorted products, and each node saves the first three. Each key press is then one step and a read.',
          emphasis: ['saves'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'suggest.js',
            code: `function suggest(products, word) {
  const root = { top: [] };
  for (const p of products.sort()) {
    let n = root;
    for (const ch of p) {
      n = n[ch] ??= { top: [] };
      if (n.top.length < 3)
        n.top.push(p);
    }
  }
  let n = root;
  return [...word].map((ch) =>
    (n = n?.[ch]) ? n.top : []);
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'answers wait on the nodes', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you match many words at once, like suggestions under a prefix, or words hidden in a letter grid.',
          emphasis: ['many', 'words'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Many words matched *at once*', icon: '🧩' },
              { text: 'Suggestions under a *prefix*', icon: '🔍' },
              { text: 'Words hidden in a letter grid', icon: '🔠' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: once a letter is missing, you fall off the trie. Keep walking without a check, and the next letter crashes.',
          emphasis: ['fall', 'crashes'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let n = root;
return [...word].map((ch) => {
  n = n[ch];
  return n ? n.top : [];
});`,
            errors: [3],
            note: { line: 3, text: 'n is undefined after a miss', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why insert the products in sorted order?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why insert the products in sorted order?',
            options: ['Tries need sorted input', 'Each node keeps the 3 smallest', 'It saves memory'],
            answer: 1,
          },
        },
        {
          say: 'Each node keeps the first three inserted through it. Insert a to z, and those are the three smallest.',
          emphasis: ['smallest'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why insert the products in sorted order?',
            options: ['Tries need sorted input', 'Each node keeps the 3 smallest', 'It saves memory'],
            answer: 1,
            reveal: true,
            explain: 'Nodes keep the first 3 inserted. Insert a-z, and those are the smallest.',
          },
        },
        {
          say: 'Remember this. Each key press is one step down the trie, and the answers wait on the nodes. Now tap solve it and try it yourself.',
          emphasis: ['step', 'nodes'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['One key press, *one step* down', 'Store answers *on nodes*', 'Fell off? The rest is empty'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
