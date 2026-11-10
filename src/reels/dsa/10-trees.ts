import type { Series, TreeNode } from '../types';

// /dsa/reels module 10. One reel per lesson of src/dsa/modules/10-trees*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

/** A tree as nested tuples: [label, ...children]. A label may carry its own id as "label#id". */
type Spec = readonly [string, ...Spec[]];
type Marks = Record<string, Omit<TreeNode, 'id' | 'label' | 'children'>>;

/** Builds a tree scene root; `marks` is keyed by node id (the label unless "label#id" is used). */
const tree = (spec: Spec, marks: Marks = {}): TreeNode => {
  const [raw, ...kids] = spec;
  const [label, id = raw] = raw.split('#');
  return { id: `n-${id}`, label, ...marks[id], ...(kids.length ? { children: kids.map((k) => tree(k, marks)) } : {}) };
};

/** Marks every listed id with the same props. */
const all = (ids: string[], props: Omit<TreeNode, 'id' | 'label' | 'children'>): Marks =>
  Object.fromEntries(ids.map((id) => [id, props]));

// Lesson 1: 1 → (2 → 4, 5 → 7), (3 → 6)
const walk: Spec = ['1', ['2', ['4'], ['5', ['7']]], ['3', ['6']]];
// Tree node `tone` is overridden by `.dia-node` in reels.css, so visited nodes use `dim` (like an array's `done`).
const out = (ids: string[]): Marks => all(ids, { dim: true });
const waiting = (ids: string[]): Marks => all(ids, { dirty: true });

// Lesson 3: the same tree, each node labelled with the height it reported up.
const withH = (h: Record<string, number>): Spec => {
  const l = (v: string) => (v in h ? `${v} · h${h[v]}#${v}` : v);
  return [l('1'), [l('2'), [l('4')], [l('5'), [l('7')]]], [l('3'), [l('6')]]];
};
const longest = all(['7', '5', '2', '1', '3', '6'], { active: true });

// Lesson 4: the skill tree (target 22). Repeated values get their own ids.
const skills: Spec = ['5#r', ['4#a', ['11', ['7'], ['2']]], ['8', ['13'], ['4#b', ['5#c'], ['1']]]];
const onPath = (ids: string[]): Marks => all(ids, { active: true });
const popped = (ids: string[]): Marks => all(ids, { dim: true });

export const series: Series = {
  id: 'dsa-trees',
  title: 'Binary trees',
  emoji: '🌳',
  color: '#fb923c',
  order: 10,
  blurb: 'DFS and BFS on trees, and how to return the right thing from a recursive call.',
  reels: [
    {
      id: 'dsa-trees-dfs-traversals',
      title: 'Walking a tree: preorder, inorder, postorder',
      link: { label: 'Solve it', href: '/dsa#/m/trees/dfs-traversals/trees-preorder' },
      beats: [
        {
          say: 'Your folders are a tree. In what order should you visit them?',
          emphasis: ['tree', 'order'],
          scene: { type: 'title', kicker: 'Trees · Lesson 1', title: 'Your folders are a *tree*', emoji: '🌳', style: 'slam' },
        },
        {
          say: 'Preorder writes the node first, then its left side, then its right. Here that gives one, two, four, five, seven, three, six.',
          emphasis: ['node', 'first'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Preorder: node, left, right',
            root: tree(walk, { '1': { active: true } }),
            caption: 'preorder: 1 2 4 5 7 3 6',
          },
        },
        {
          say: 'The easy way is recursion. Write the node down, then call yourself on the left, then on the right.',
          emphasis: ['recursion'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Recursion',
            code: `function preorder(node, out):
    if node = null:
        return
    append node.val to out
    preorder(node.left, out)
    preorder(node.right, out)`,
            highlight: [4],
            note: { line: 4, text: 'move this line, change the order', tone: 'info' },
          },
        },
        {
          say: 'But every call waits on a hidden stack. JavaScript often gives up around ten thousand of them.',
          emphasis: ['hidden', 'stack'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10,000',
            label: 'waiting calls and *JS* gives up',
            sub: 'a tree shaped like a long line crashes',
            tone: 'bad',
          },
        },
        {
          say: 'So use your own stack. Pop a node, write it down, push its right child, then its left.',
          emphasis: ['own', 'stack'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Recursion is a *hidden* stack', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Pop one and write it down. Push three, then two, so two sits on top.',
          emphasis: ['top'],
          scene: {
            type: 'tree',
            title: 'Preorder with a stack',
            root: tree(walk, { '1': { active: true }, ...waiting(['3', '2']) }),
            caption: 'stack [3, 2] · out 1',
          },
        },
        {
          say: 'Pop two and write it down. Push five, then four. Now four is on top.',
          emphasis: ['four'],
          scene: {
            type: 'tree',
            title: 'Preorder with a stack',
            root: tree(walk, { ...out(['1']), '2': { active: true }, ...waiting(['3', '5', '4']) }),
            caption: 'stack [3, 5, 4] · out 1 2',
          },
        },
        {
          say: 'Pop four. It is a leaf, so there is nothing to push.',
          emphasis: ['leaf'],
          scene: {
            type: 'tree',
            title: 'Preorder with a stack',
            root: tree(walk, { ...out(['1', '2']), '4': { active: true }, ...waiting(['3', '5']) }),
            caption: 'stack [3, 5] · out 1 2 4',
          },
        },
        {
          say: 'Pop five and push seven, then pop seven. Three has waited this whole time.',
          emphasis: ['waited'],
          scene: {
            type: 'tree',
            title: 'Preorder with a stack',
            root: tree(walk, { ...out(['1', '2', '4', '5']), '7': { active: true }, ...waiting(['3']) }),
            caption: 'stack [3] · out 1 2 4 5 7',
          },
        },
        {
          say: 'Last, pop three, then six. One, two, four, five, seven, three, six. A perfect match.',
          emphasis: ['perfect', 'match'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'Preorder with a stack',
            root: tree(walk, { ...out(['1', '2', '3', '4', '5', '7']), '6': { active: true } }),
            caption: 'stack [] · out 1 2 4 5 7 3 6',
          },
        },
        {
          say: 'In JavaScript, push right before left, so left pops first. Each node is seen once, so it is O of n.',
          speak: 'In JavaScript, push right before left, so left pops first. Each node is seen once, so it is oh of n.',
          emphasis: ['right', 'left'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'preorder.js',
            code: `function preorder(root) {
  if (!root) return [];
  const out = [], stack = [root];
  while (stack.length) {
    const n = stack.pop();
    out.push(n.val);
    if (n.right) stack.push(n.right);
    if (n.left) stack.push(n.left);
  }
  return out;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'O(n) time, O(height) space', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you must visit every node, and the order you visit them in matters.',
          emphasis: ['every', 'order'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You must visit *every* node', icon: '🌳' },
              { text: 'The *order* of visits matters', icon: '🔢' },
              { text: 'The tree may be very deep', icon: '🕳️' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is the null check. Forget it, and the first empty child crashes your code.',
          emphasis: ['null', 'crashes'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `function preorder(node, out) {
  out.push(node.val);
  preorder(node.left, out);
  preorder(node.right, out);
}`,
            errors: [2],
            note: { line: 2, text: 'node is null at a leaf: crash', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. A folder size adds up everything inside it. Which order fits?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A folder’s size adds up everything inside it. Which order?',
            options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
            answer: 2,
          },
        },
        {
          say: 'Postorder. You need the sizes of the children first, so the folder comes last.',
          emphasis: ['Postorder'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A folder’s size adds up everything inside it. Which order?',
            options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
            answer: 2,
            reveal: true,
            explain: 'Children’s sizes first, then the folder: postorder.',
          },
        },
        {
          say: 'Remember this. It is one walk, and only the moment you write the node down changes. Now tap solve it and try it yourself.',
          emphasis: ['one', 'walk'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Pre, in, post: *one* walk', 'Space is the tree’s *height*', 'Own stack: push right, then left'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-trees-bfs-levels',
      title: 'Level by level: BFS with a queue',
      link: { label: 'Solve it', href: '/dsa#/m/trees/bfs-levels/trees-level-order' },
      beats: [
        {
          say: 'Print a company org chart one row at a time. How?',
          emphasis: ['row'],
          scene: { type: 'title', kicker: 'Trees · Lesson 2', title: 'Print it *row by row*', emoji: '🏢', style: 'slam' },
        },
        {
          say: 'Same tree as before. Group the values by level: one, then two and three, then four, five, six, then seven.',
          emphasis: ['level'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Read it level by level',
            root: tree(walk, all(['4', '5', '6'], { active: true })),
            caption: 'rows: [1] [2, 3] [4, 5, 6] [7]',
          },
        },
        {
          say: 'The easy way does one full walk per level, and keeps only the nodes at that depth.',
          emphasis: ['per', 'level'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function levelOrder(root):
    for d from 0 to height - 1:
        row ← empty list
        collect(root, 0, d, row)
        append row to result
    return result`,
            highlight: [[2, 4]],
            note: { line: 4, text: 'starts at the root every time', tone: 'warn' },
          },
        },
        {
          say: 'But the top gets walked again for every level. A chain of a hundred thousand nodes means ten billion steps.',
          emphasis: ['again', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10B',
            label: 'steps for a *100,000* node chain',
            sub: 'O(n × h): the top is walked again',
            tone: 'bad',
          },
        },
        {
          say: 'Use a queue instead. Children join the back, and the size before a row tells you where it ends.',
          emphasis: ['queue', 'size'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Save the *size* before each row', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The queue starts with just the root. Level zero has a size of one.',
          emphasis: ['one'],
          scene: {
            type: 'array',
            title: 'The queue',
            cells: [1],
            pointers: { head: 0 },
            active: [0],
            vars: { level: 0, size: 1, rows: 0 },
          },
        },
        {
          say: 'Take one, and add its children, two and three. Two nodes wait, so the next row has size two.',
          emphasis: ['two'],
          scene: {
            type: 'array',
            title: 'The queue',
            cells: [1, 2, 3],
            pointers: { head: 1 },
            active: [1, 2],
            done: [0],
            vars: { level: 1, size: 2, rows: 1 },
          },
        },
        {
          say: 'Take two, and add four and five. They wait behind three, so this row still finishes first.',
          emphasis: ['behind'],
          scene: {
            type: 'array',
            title: 'The queue',
            cells: [1, 2, 3, 4, 5],
            pointers: { head: 2 },
            active: [2],
            done: [0, 1],
            vars: { level: 1, size: 2, rows: 1 },
          },
        },
        {
          say: 'Take three, and add six. That was two nodes, so row one is done. The next row has three.',
          emphasis: ['done', 'three'],
          scene: {
            type: 'array',
            title: 'The queue',
            cells: [1, 2, 3, 4, 5, 6],
            pointers: { head: 3 },
            active: [3, 4, 5],
            done: [0, 1, 2],
            vars: { level: 2, size: 3, rows: 2 },
          },
        },
        {
          say: 'Take four, five and six, then seven. Every node went in and out once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'The queue',
            cells: [1, 2, 3, 4, 5, 6, 7],
            pointers: { head: 7 },
            found: [6],
            done: [0, 1, 2, 3, 4, 5],
            vars: { level: 3, size: 1, rows: 4 },
            caption: '[1] [2, 3] [4, 5, 6] [7]',
          },
        },
        {
          say: 'In JavaScript, build the next row in its own array. Each node goes in and out once, so it is O of n.',
          speak: 'In JavaScript, build the next row in its own array. Each node goes in and out once, so it is oh of n.',
          emphasis: ['next', 'row'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'levelOrder.js',
            code: `function levelOrder(root) {
  const out = [];
  let row = root ? [root] : [];
  while (row.length) {
    out.push(row.map((n) => n.val));
    const next = [];
    for (const n of row) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    row = next;
  }
  return out;
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'in and out once: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you hear level, row, or closest to the root.',
          emphasis: ['level', 'row'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The question says *level* or row', icon: '🪜' },
              { text: 'First or last on each row', icon: '👀' },
              { text: 'Closest to the root wins', icon: '🎯' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is shift. It slides every item down a slot, so your BFS can turn into O of n squared.',
          speak: 'The trap is shift. It slides every item down a slot, so your BFS can turn into oh of n squared.',
          emphasis: ['shift', 'squared'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const queue = [root];
while (queue.length) {
  const n = queue.shift();
  if (n.left) queue.push(n.left);
  if (n.right) queue.push(n.right);
}`,
            errors: [3],
            note: { line: 3, text: 'shift moves every item: O(n)', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why do you save the queue size before each row?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why save the queue size before each row?',
            options: ['To skip null children', 'New kids belong to the next row', 'To beat DFS on speed'],
            answer: 1,
          },
        },
        {
          say: 'Children join the back during the row, but they belong to the next one.',
          emphasis: ['next'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why save the queue size before each row?',
            options: ['To skip null children', 'New kids belong to the next row', 'To beat DFS on speed'],
            answer: 1,
            reveal: true,
            explain: 'Kids join during the row. The saved size marks where it stops.',
          },
        },
        {
          say: 'Remember this. A queue gives you rows, and the saved size tells you where each row ends. Now tap solve it and try it yourself.',
          emphasis: ['queue', 'size'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['BFS means a *queue*', 'Save the *size* before a row', 'Skip shift in hot loops'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-trees-return-info-up',
      title: 'Return info up: height, diameter, balanced',
      link: { label: 'Solve it', href: '/dsa#/m/trees/return-info-up/trees-diameter' },
      beats: [
        {
          say: 'How does a CEO get a headcount without counting everyone?',
          emphasis: ['headcount'],
          scene: { type: 'title', kicker: 'Trees · Lesson 3', title: 'Nobody counts the *whole* company', emoji: '📧', style: 'slam' },
        },
        {
          say: 'Offices are wired in a tree. The longest path runs seven, five, two, one, three, six. That is five cables.',
          emphasis: ['longest', 'five'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Longest path, in cables',
            root: tree(walk, { ...longest, '4': { dim: true } }),
            caption: 'the diameter is 5 cables',
          },
        },
        {
          say: 'The path bends at some node. The easy way measures both sides of every node, from scratch.',
          emphasis: ['every', 'scratch'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function diameter(root):
    best ← 0
    for each node X in tree:
        l ← height(X.left)
        r ← height(X.right)
        best ← max(best, l + r)
    return best`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'walks the whole subtree again', tone: 'warn' },
          },
        },
        {
          say: 'Each subtree gets measured again for every node above it. On a long chain, that is O of n squared.',
          speak: 'Each subtree gets measured again for every node above it. On a long chain, that is oh of n squared.',
          emphasis: ['again', 'squared'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for a *100,000* node chain',
            sub: 'O(n²): every subtree measured again',
            tone: 'bad',
          },
        },
        {
          say: 'When a node knows both child heights, record the best bend, then return its own height up.',
          emphasis: ['record', 'return'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Return height, *record* the best', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Leaves report a height of one. Node five hears one and zero, so its bend is one cable. It reports two.',
          emphasis: ['one', 'two'],
          scene: {
            type: 'tree',
            title: 'Heights flow up',
            root: tree(withH({ '4': 1, '7': 1, '5': 2 }), { '5': { active: true } }),
            caption: '5: bend 1 + 0 = 1 · best 1',
          },
        },
        {
          say: 'Node two hears one and two. A bend there is three cables, our new best. It reports three.',
          emphasis: ['three', 'best'],
          scene: {
            type: 'tree',
            title: 'Heights flow up',
            root: tree(withH({ '4': 1, '7': 1, '5': 2, '2': 3 }), { '2': { active: true } }),
            caption: '2: bend 1 + 2 = 3 · best 3',
          },
        },
        {
          say: 'On the right, six reports one, so node three bends just one cable. It reports two.',
          emphasis: ['two'],
          scene: {
            type: 'tree',
            title: 'Heights flow up',
            root: tree(withH({ '4': 1, '7': 1, '5': 2, '2': 3, '6': 1, '3': 2 }), { '3': { active: true } }),
            caption: '3: bend 0 + 1 = 1 · best 3',
          },
        },
        {
          say: 'Node one hears three and two. That bend is five cables, the new best.',
          emphasis: ['five'],
          scene: {
            type: 'tree',
            title: 'Heights flow up',
            root: tree(withH({ '4': 1, '7': 1, '5': 2, '2': 3, '6': 1, '3': 2, '1': 4 }), { '1': { active: true } }),
            caption: '1: bend 3 + 2 = 5 · best 5',
          },
        },
        {
          say: 'That is the path from seven to six, found in one pass. Each node was seen once.',
          emphasis: ['one', 'pass'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'Heights flow up',
            root: tree(withH({ '4': 1, '7': 1, '5': 2, '2': 3, '6': 1, '3': 2, '1': 4 }), { ...longest, '4': { dim: true } }),
            caption: 'diameter 5 · each node seen once',
          },
        },
        {
          say: 'In code, one helper does both jobs. It records the bend, then returns one plus the taller side. That is O of n.',
          speak: 'In code, one helper does both jobs. It records the bend, then returns one plus the taller side. That is oh of n.',
          emphasis: ['both', 'jobs'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'diameter.js',
            code: `function diameterOfBinaryTree(root) {
  let best = 0;
  const height = (node) => {
    if (!node) return 0;
    const l = height(node.left);
    const r = height(node.right);
    best = Math.max(best, l + r);
    return 1 + Math.max(l, r);
  };
  height(root);
  return best;
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'record, then report: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a node needs answers from both subtrees, like height, size, or balanced.',
          emphasis: ['both', 'subtrees'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'A node needs *both* subtrees', icon: '🌿' },
              { text: 'Height, size, sum, balanced', icon: '📏' },
              { text: 'Keep the best *outside*', icon: '🏆' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: diameter counts cables, not nodes. Add one here, and every answer comes out one too big.',
          emphasis: ['cables', 'nodes'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const height = (node) => {
  if (!node) return 0;
  const l = height(node.left);
  const r = height(node.right);
  best = Math.max(best, l + r + 1);
  return 1 + Math.max(l, r);
};`,
            errors: [5],
            note: { line: 5, text: 'counts nodes, not cables', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The helper returns one thing and records another. Which is which?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'The helper returns one thing and records another. Which?',
            options: ['Returns diameter, keeps height', 'Returns height, keeps best bend', 'Returns a node count'],
            answer: 1,
          },
        },
        {
          say: 'It returns the height, because the parent needs it. The best bend lives outside.',
          emphasis: ['height', 'outside'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'The helper returns one thing and records another. Which?',
            options: ['Returns diameter, keeps height', 'Returns height, keeps best bend', 'Returns a node count'],
            answer: 1,
            reveal: true,
            explain: 'The parent needs a height. The best bend is kept outside.',
          },
        },
        {
          say: 'Remember this. Children answer first, the node combines, and the best answer lives outside. Now tap solve it and try it yourself.',
          emphasis: ['Children', 'outside'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Children answer *first*', 'Return what the parent needs', 'Keep the best *outside*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-trees-path-problems',
      title: 'Path problems: pass info down',
      link: { label: 'Solve it', href: '/dsa#/m/trees/path-problems/trees-path-sum-ii' },
      beats: [
        {
          say: 'You have twenty-two skill points. Which routes spend every single one?',
          emphasis: ['every'],
          scene: { type: 'title', kicker: 'Trees · Lesson 4', title: 'Spend *exactly* 22 points', emoji: '🎮', style: 'slam' },
        },
        {
          say: 'Walk from the top skill down to a last one. Two routes add up to exactly twenty-two.',
          emphasis: ['Two', 'routes'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Skill costs, target 22',
            root: tree(skills, onPath(['r', 'a', '11', '2', '8', '4b', '5c'])),
            caption: '5 4 11 2 and 5 8 4 5 make 22',
          },
        },
        {
          say: 'The easy way builds a fresh copy of the path at every step, then adds each one up at the end.',
          emphasis: ['fresh', 'copy'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function collect(node, path):
    if node = null: return
    newPath ← path + [node.val]
    if node is a leaf:
        save newPath
    collect(node.left, newPath)
    collect(node.right, newPath)`,
            highlight: [3],
            note: { line: 3, text: 'a fresh copy at every step', tone: 'warn' },
          },
        },
        {
          say: 'A million nodes, twenty levels deep, copies twenty million numbers. That is O of n times h.',
          speak: 'A million nodes, twenty levels deep, copies twenty million numbers. That is oh of n times h.',
          emphasis: ['twenty', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '20M',
            label: 'numbers copied for *1M* nodes',
            sub: 'O(n × h): one copy per level, per node',
            tone: 'bad',
          },
        },
        {
          say: 'Pass the points that are left down the tree, and keep one shared path. Push when you enter, pop when you leave.',
          emphasis: ['Push', 'pop'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Carry it down, *undo* it after', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Go down five, four and eleven. Each step spends points, so two are left.',
          emphasis: ['two'],
          scene: {
            type: 'tree',
            title: 'One shared path',
            root: tree(skills, onPath(['r', 'a', '11'])),
            caption: 'path [5, 4, 11] · left 2',
          },
        },
        {
          say: 'Seven is a leaf, but it puts us five over. Pop it off. Two is a leaf with zero left, so save a copy.',
          emphasis: ['zero', 'copy'],
          scene: {
            type: 'tree',
            title: 'One shared path',
            root: tree(skills, { ...onPath(['r', 'a', '11', '2']), ...popped(['7']) }),
            caption: '[5, 4, 11, 2] · left 0 · saved',
          },
        },
        {
          say: 'Pop back up to the top, then go right. Thirteen is a leaf, but four over. Pop it.',
          emphasis: ['Pop'],
          scene: {
            type: 'tree',
            title: 'One shared path',
            root: tree(skills, { ...onPath(['r', '8', '13']), ...popped(['a', '11', '7', '2']) }),
            caption: 'path [5, 8, 13] · left -4',
          },
        },
        {
          say: 'Down four, then five. Zero left at a leaf, so save another copy.',
          emphasis: ['another'],
          scene: {
            type: 'tree',
            title: 'One shared path',
            root: tree(skills, { ...onPath(['r', '8', '4b', '5c']), ...popped(['a', '11', '7', '2', '13']) }),
            caption: '[5, 8, 4, 5] · left 0 · saved',
          },
        },
        {
          say: 'The last leaf, one, leaves four points, so pop it. Done, and each node was pushed and popped once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'One shared path',
            root: tree(skills, { ...onPath(['r', '8', '4b', '1']), ...popped(['a', '11', '7', '2', '13', '5c']) }),
            caption: 'left 4 · done, 2 routes saved',
          },
        },
        {
          say: 'In JavaScript, push on the way in and pop on the way out. Each node once, so it is O of n.',
          speak: 'In JavaScript, push on the way in and pop on the way out. Each node once, so it is oh of n.',
          emphasis: ['push', 'pop'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'pathSum.js',
            code: `function pathSum(root, target) {
  const out = [], path = [];
  const dfs = (n, rem) => {
    if (!n) return;
    rem -= n.val; path.push(n.val);
    if (!n.left && !n.right && !rem)
      out.push([...path]);
    dfs(n.left, rem);
    dfs(n.right, rem);
    path.pop();
  };
  dfs(root, target);
  return out;
}`,
            highlight: [5, 10],
            note: { line: 10, text: 'one shared path: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when the question is about root to leaf paths, or a running total from the top.',
          emphasis: ['root', 'leaf'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '*Root-to-leaf* paths', icon: '🌱' },
              { text: 'A running total from the top', icon: '🧮' },
              { text: 'Check it at the *leaf*', icon: '🍃' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: save the path itself, and every answer ends up empty after the pops. Save a copy.',
          emphasis: ['empty', 'copy'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `if (!n.left && !n.right && !rem)
  out.push(path);
dfs(n.left, rem);
dfs(n.right, rem);
path.pop();`,
            errors: [2],
            note: { line: 2, text: 'same array, empty by the end', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why test for zero points left only at a leaf?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why check for zero points left only at a leaf?',
            options: ['Leaves are faster', 'The path must end at a leaf', 'Inner nodes have no value'],
            answer: 1,
          },
        },
        {
          say: 'A root to leaf path has to end at a leaf. And later values, even negative ones, can still change the sum.',
          emphasis: ['leaf'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why check for zero points left only at a leaf?',
            options: ['Leaves are faster', 'The path must end at a leaf', 'Inner nodes have no value'],
            answer: 1,
            reveal: true,
            explain: 'The path must reach a leaf, and later values can change the sum.',
          },
        },
        {
          say: 'Remember this. Pass the budget down, push and pop one shared path, and copy it only when you save. Now tap solve it and try it yourself.',
          emphasis: ['down', 'copy'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Pass the budget *down*', 'One path: push, then *pop*', 'Copy it only when you save'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-trees-compare-and-build',
      title: 'Comparing, rebuilding and saving trees',
      link: { label: 'Solve it', href: '/dsa#/m/trees/compare-and-build/trees-build-pre-in' },
      beats: [
        {
          say: 'A tree is pointers. How do you send one over the internet?',
          emphasis: ['send', 'internet'],
          scene: { type: 'title', kicker: 'Trees · Lesson 5', title: 'Send a tree as *text*', emoji: '☁️', style: 'slam' },
        },
        {
          say: 'Send two lists. Preorder puts the root first. Inorder puts the root in the middle.',
          emphasis: ['first', 'middle'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Two lists, one tree',
            rowLabels: ['pre', 'in'],
            colLabels: ['0', '1', '2', '3', '4'],
            cells: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]],
            active: [[0, 0]],
            reads: [[1, 1]],
            caption: 'root first · root in the middle',
          },
        },
        {
          say: 'Together they pin down one tree. Three is the root, nine is on its left, and the rest is on its right.',
          emphasis: ['one', 'tree'],
          scene: {
            type: 'tree',
            title: 'The tree they describe',
            root: tree(['3', ['9'], ['20', ['15'], ['7']]], { '3': { active: true } }),
            caption: 'pre says who · in says where',
          },
        },
        {
          say: 'The easy way scans inorder for each root, then copies slices for both sides. On a long chain, that is O of n squared.',
          speak: 'The easy way scans inorder for each root, then copies slices for both sides. On a long chain, that is oh of n squared.',
          emphasis: ['scans', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function build(pre, ino):
    if pre is empty: return null
    root ← node(pre[0])
    k ← search ino for pre[0]
    root.left ← build(left slices)
    root.right ← build(right slices)
    return root`,
            highlight: [4],
            note: { line: 4, text: 'a scan and copies: O(n²)', tone: 'warn' },
          },
        },
        {
          say: 'Put each inorder position in a map, pass ranges instead of copies, and read preorder just once.',
          emphasis: ['map', 'ranges'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Map the *positions*, pass ranges', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Preorder says the root is three. The map says three sits at index one. So nine goes left, the rest goes right.',
          emphasis: ['three', 'one'],
          scene: {
            type: 'array',
            title: 'Inorder ranges',
            cells: [9, 3, 15, 20, 7],
            pointers: { lo: 0, hi: 4 },
            window: [0, 4],
            active: [1],
            vars: { root: 3, mid: 1 },
            caption: 'left (0, 0) · right (2, 4)',
          },
        },
        {
          say: 'Build the left side first. The next preorder value is nine. Its range holds only itself, so it is a leaf.',
          emphasis: ['left', 'first'],
          scene: {
            type: 'array',
            title: 'Inorder ranges',
            cells: [9, 3, 15, 20, 7],
            pointers: { lo: 0, hi: 0 },
            window: [0, 0],
            active: [0],
            done: [1],
            vars: { root: 9, mid: 0 },
            caption: 'a leaf: both sides empty',
          },
        },
        {
          say: 'Now the right range. The next value is twenty, at index three. Fifteen goes left, and seven goes right.',
          emphasis: ['twenty'],
          scene: {
            type: 'array',
            title: 'Inorder ranges',
            cells: [9, 3, 15, 20, 7],
            pointers: { lo: 2, hi: 4 },
            window: [2, 4],
            active: [3],
            done: [0, 1],
            vars: { root: 20, mid: 3 },
            caption: 'left (2, 2) · right (4, 4)',
          },
        },
        {
          say: 'Fifteen is next. Its range is just one cell, so it is a leaf.',
          emphasis: ['Fifteen'],
          scene: {
            type: 'array',
            title: 'Inorder ranges',
            cells: [9, 3, 15, 20, 7],
            pointers: { lo: 2, hi: 2 },
            window: [2, 2],
            active: [2],
            done: [0, 1, 3],
            vars: { root: 15, mid: 2 },
            caption: 'a leaf: both sides empty',
          },
        },
        {
          say: 'Then seven, the last leaf. Every value became a root exactly once, with no searching.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Inorder ranges',
            cells: [9, 3, 15, 20, 7],
            pointers: { lo: 4, hi: 4 },
            window: [4, 4],
            found: [4],
            done: [0, 1, 2, 3],
            vars: { root: 7, mid: 4 },
            caption: 'the last leaf · each value used once',
          },
        },
        {
          say: 'In JavaScript, the map finds each root instantly, and the pointer walks preorder once. That is O of n.',
          speak: 'In JavaScript, the map finds each root instantly, and the pointer walks preorder once. That is oh of n.',
          emphasis: ['map', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'buildTree.js',
            code: `function buildTree(pre, ino) {
  const at = new Map();
  ino.forEach((v, i) => at.set(v, i));
  let p = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const n = new TreeNode(pre[p++]);
    const mid = at.get(n.val);
    n.left = build(lo, mid - 1);
    n.right = build(mid + 1, hi);
    return n;
  };
  return build(0, ino.length - 1);
}`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'O(1) lookup, O(n) in total', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you compare two trees, rebuild one from two lists, or save one as text.',
          emphasis: ['compare', 'rebuild'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Two trees at once: *lockstep*', icon: '👯' },
              { text: 'Rebuild from two *traversals*', icon: '🧩' },
              { text: 'Save a tree as text', icon: '💾' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: build the right side first, and the preorder pointer hands out the wrong roots. Left always goes first.',
          emphasis: ['right', 'wrong'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const n = new TreeNode(pre[p++]);
const mid = at.get(n.val);
n.right = build(mid + 1, hi);
n.left = build(lo, mid - 1);`,
            errors: [3],
            note: { line: 3, text: 'right first steals left roots', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why is preorder one, two, not enough to rebuild a tree?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why can preorder [1, 2] alone not rebuild a tree?',
            options: ['It is too short', '2 could be a left or right child', 'Preorder skips the root'],
            answer: 1,
          },
        },
        {
          say: 'Two could be the left child or the right child. You need a second list to tell them apart.',
          emphasis: ['second', 'list'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why can preorder [1, 2] alone not rebuild a tree?',
            options: ['It is too short', '2 could be a left or right child', 'Preorder skips the root'],
            answer: 1,
            reveal: true,
            explain: 'Both shapes give [1, 2]. Inorder, or null markers, tells them apart.',
          },
        },
        {
          say: 'Remember this. One list names the root, and the other tells you how to split. Now tap solve it and try it yourself.',
          emphasis: ['root', 'split'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Preorder names the *root*', 'Inorder says what goes *where*', 'Map plus ranges: *O(n)*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-trees-lowest-common-ancestor',
      title: 'Lowest common ancestor',
      link: { label: 'Solve it', href: '/dsa#/m/trees/lowest-common-ancestor/trees-lca' },
      beats: [
        {
          say: 'When you merge two Git branches, Git first finds where they split.',
          emphasis: ['split'],
          scene: { type: 'title', kicker: 'Trees · Lesson 6', title: 'Where did two branches *split*?', emoji: '🌿', style: 'slam' },
        },
        {
          say: 'Here, the deepest node above both four and seven is two. That is their lowest common ancestor.',
          emphasis: ['two', 'ancestor'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'Lowest common ancestor',
            root: tree(walk, { '2': { active: true }, ...waiting(['4', '7']) }),
            caption: 'LCA of 4 and 7 is 2',
          },
        },
        {
          say: 'The easy way asks at every step: are both on the left, or both on the right? Each question searches a whole subtree.',
          emphasis: ['every', 'step'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function lca(root, p, q):
    node ← root
    loop:
        if both are under node.left:
            node ← node.left
        else if both under node.right:
            node ← node.right
        else: return node`,
            highlight: [4],
            note: { line: 4, text: 'each check searches a subtree', tone: 'warn' },
          },
        },
        {
          say: 'The next step searches most of the same nodes again. On a long chain, that is ten billion steps.',
          emphasis: ['again', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10B',
            label: 'steps for a *100,000* node chain',
            sub: 'O(n × h): the same nodes searched again',
            tone: 'bad',
          },
        },
        {
          say: 'Do one walk instead. Each subtree reports what it found. A node that hears back from both sides is the answer.',
          emphasis: ['both', 'sides'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Let each side *report* back', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Walk in postorder. Four is a target, so it returns itself. Seven does the same.',
          emphasis: ['itself'],
          scene: {
            type: 'tree',
            title: 'What did you find?',
            root: tree(walk, { '7': { active: true }, ...waiting(['4']) }),
            caption: '4 and 7 are targets: return them',
          },
        },
        {
          say: 'Five hears seven from the left and nothing from the right, so it passes seven up.',
          emphasis: ['passes'],
          scene: {
            type: 'tree',
            title: 'What did you find?',
            root: tree(walk, { '5': { active: true }, ...waiting(['4', '7']) }),
            caption: '5: left 7, right null → 7',
          },
        },
        {
          say: 'Two hears four from one side and seven from the other. They split here, so two is the answer.',
          emphasis: ['split', 'two'],
          sfx: 'ding',
          scene: {
            type: 'tree',
            title: 'What did you find?',
            root: tree(walk, { '2': { active: true }, ...waiting(['4', '7']) }),
            caption: '2: both sides found one → LCA',
          },
        },
        {
          say: 'On the right, six and three find nothing, so they return null.',
          emphasis: ['nothing'],
          scene: {
            type: 'tree',
            title: 'What did you find?',
            root: tree(walk, { '3': { active: true }, ...waiting(['2']), ...out(['4', '5', '6', '7']) }),
            caption: '6 and 3 find nothing → null',
          },
        },
        {
          say: 'One gets two from the left and null from the right, so it passes two up. The answer is two.',
          emphasis: ['two'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'What did you find?',
            root: tree(walk, { '2': { active: true }, '1': { dirty: true }, ...out(['3', '4', '5', '6', '7']) }),
            caption: '1 passes 2 up · the answer is 2',
          },
        },
        {
          say: 'In JavaScript, return the node when both sides found something, or else pass up whichever did. One pass, so O of n.',
          speak: 'In JavaScript, return the node when both sides found something, or else pass up whichever did. One pass, so oh of n.',
          emphasis: ['both', 'whichever'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'lca.js',
            code: `function lca(root, p, q) {
  const find = (n) => {
    if (!n) return null;
    if (n.val === p || n.val === q)
      return n;
    const left = find(n.left);
    const right = find(n.right);
    if (left && right) return n;
    return left || right;
  };
  return find(root).val;
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'one pass: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a question has two nodes and asks where their paths meet.',
          emphasis: ['two', 'meet'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Two nodes and where they *meet*', icon: '🤝' },
              { text: 'Distance between two nodes', icon: '📏' },
              { text: 'Directions from one to another', icon: '🧭' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap. The early stop is only safe when q is in the tree. If q could be missing, search everything and count.',
          emphasis: ['missing', 'count'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'The early stop',
            left: { title: 'q may be missing', verdict: 'bad', items: ['Early stop can lie', 'Returns p anyway'] },
            right: { title: 'Count the finds', verdict: 'ok', items: ['Search the whole tree', 'Check you found both'] },
          },
        },
        {
          say: 'Quick check. In our tree, what is the lowest common ancestor of five and seven?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In our tree, what is the LCA of 5 and 7?',
            options: ['1', '2', '5', '7'],
            answer: 2,
          },
        },
        {
          say: 'It is five. A node counts as its own ancestor, and seven sits right under it.',
          emphasis: ['five', 'own'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In our tree, what is the LCA of 5 and 7?',
            options: ['1', '2', '5', '7'],
            answer: 2,
            reveal: true,
            explain: '5 is an ancestor of itself, and 7 is under it.',
          },
        },
        {
          say: 'Remember this. Each side reports what it found, and the node that hears from both is the answer. Now tap solve it and try it yourself.',
          emphasis: ['reports', 'both'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['LCA: where the paths *split*', 'Return what you *found*', 'Heard from both? That is it'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
