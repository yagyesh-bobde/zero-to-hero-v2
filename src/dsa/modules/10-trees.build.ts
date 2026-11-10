import type { Lesson } from '../types';

// Module 10, lesson 5: comparing trees, building from traversals, serializing.
const lesson: Lesson = {
  id: 'compare-and-build',
  title: 'Comparing, rebuilding and saving trees',
  summary: 'Walk two trees in lockstep, rebuild a tree from two traversals, and turn a tree into text.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The sync app',
      text: 'A cloud-sync app keeps a folder tree on your laptop and a copy on its server. Before uploading, it asks "are these two trees the same?". When it does upload, it cannot send pointers over the internet; it must flatten the tree into a list of values and rebuild the exact same shape on the other side.',
    },
    {
      kind: 'text',
      text: '**Warm-up: are two trees the same?** Walk both trees at the same time, in lockstep. Two empty trees match. If only one is empty, or the values differ, they do not match. Otherwise both left subtrees must match and both right subtrees must match.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Lockstep DFS on two trees',
      code: `function same(a, b):
    if a = null and b = null: return true
    if a = null or b = null: return false
    if a.val ≠ b.val: return false
    return same(a.left, b.left) and same(a.right, b.right)`,
    },
    {
      kind: 'text',
      text: '**The problem.** Can a list of values describe a tree? One list is not enough: preorder `[1, 2]` could be 1 with a *left* child 2 or with a *right* child 2. But **preorder plus inorder** pins it down (when values are unique). Rebuild the tree from `preorder = [3, 9, 20, 15, 7]` and `inorder = [9, 3, 15, 20, 7]`.',
    },
    {
      kind: 'diagram',
      title: 'How the two lists split',
      art: [
        'preorder: [ 3 | 9 | 20 15 7 ]   root first',
        '           root left  right',
        '',
        'inorder:  [ 9 | 3 | 15 20 7 ]   root in the middle',
        '            left root right',
        '',
        '        3        left part of inorder has 1 value,',
        '       / \\       so the next 1 value of preorder (9)',
        '      9   20     is the left subtree. The rest',
        '         /  \\    (20 15 7) is the right subtree.',
        '        15   7',
      ].join('\n'),
      caption: 'Preorder tells you **who** the root is. Inorder tells you **what goes left and right** of it.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: search and slice',
      code: `function build(preorder, inorder):
    if preorder is empty: return null
    root ← new node(preorder[0])
    k ← position of preorder[0] in inorder     // linear search
    root.left ← build(preorder[1..k], inorder[0..k-1])
    root.right ← build(preorder[k+1..end], inorder[k+1..end])
    return root`,
    },
    {
      kind: 'text',
      text: 'It works. But each call scans `inorder` to find the root and copies four new arrays. For a chain-shaped tree that is n calls doing up to n work each: O(n²). The scan is pure waste, because the position of each value in `inorder` never changes.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Look up positions in a map, pass ranges, read preorder once',
      text: 'Build a map `value → index in inorder` once, so finding the root is O(1). Pass index ranges `(lo, hi)` instead of copying arrays. And note that preorder lists the nodes in exactly the order you create them (root, then the whole left side, then the right side), so a single pointer that moves forward through `preorder` always gives the next root. Just build left before right.',
    },
    {
      kind: 'trace',
      title: 'build(lo, hi) over inorder [9, 3, 15, 20, 7]',
      columns: ['Call (lo, hi)', 'Next preorder value', 'Its inorder index', 'Left range', 'Right range'],
      rows: [
        ['(0, 4)', 3, 1, '(0, 0)', '(2, 4)'],
        ['(0, 0)', 9, 0, 'empty', 'empty'],
        ['(2, 4)', 20, 3, '(2, 2)', '(4, 4)'],
        ['(2, 2)', 15, 2, 'empty', 'empty'],
        ['(4, 4)', 7, 4, 'empty', 'empty'],
      ],
      note: 'An empty range (`lo > hi`) returns `null`. Each value is used once as a root: O(n).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function buildTree(preorder, inorder):
    where ← map of value → index in inorder
    next ← 0                                  // pointer into preorder
    function build(lo, hi):                   // inorder range
        if lo > hi: return null
        root ← new node(preorder[next])
        next ← next + 1
        mid ← where[root.val]
        root.left ← build(lo, mid - 1)        // left first: preorder order
        root.right ← build(mid + 1, hi)
        return root
    return build(0, n - 1)`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function buildTree(preorder, inorder) {
  const where = new Map(inorder.map((v, i) => [v, i]));
  let next = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const root = new TreeNode(preorder[next++]);
    const mid = where.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Search + slice', time: 'O(n²)', space: 'O(n²)', note: 'Every call scans for the root and copies the arrays.' },
        { approach: 'Map + ranges + preorder pointer', time: 'O(n)', space: 'O(n)', note: 'One map, no copies. Each value becomes a root once.' },
      ],
    },
    {
      kind: 'text',
      text: '**The patterns.** Comparing two trees (same, mirror, subtree) is **lockstep DFS**: recurse on matching pairs. Rebuilding is **divide by the root**: one list tells you the root, the other tells you how to split. And saving a tree as text is easiest as **preorder with null markers** such as `#`: writing down the empty spots records the shape, so one list is enough (the stretch problem below).',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: divide by the root',
      code: `function build(range):
    if range is empty: return null
    root ← new node(next value from the root-first list)
    split range into the part before root and the part after
    root.left ← build(part before)
    root.right ← build(part after)
    return root`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Order and uniqueness',
      text: 'With a shared preorder pointer you **must** build the left subtree before the right one, or the pointer hands out the wrong roots. The value map only works when values are unique; with duplicates, `inorder` cannot tell you where to split. And check the empty ranges: `lo > hi` is empty, `lo = hi` is one node.',
    },
  ],
  problems: [
    {
      id: 'trees-same',
      title: 'Same tree',
      difficulty: 'easy',
      leetcode: 100,
      pattern: 'Lockstep DFS',
      statement:
        'Return `true` if two trees have the same shape and the same value at every position.',
      examples: [
        { input: 'p = [1,2,3], q = [1,2,3]', output: 'true' },
        { input: 'p = [1,2], q = [1,null,2]', output: 'false', explain: 'Same values, different shape.' },
        { input: 'p = [1,2,1], q = [1,1,2]', output: 'false' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 100'],
      hints: [
        'Handle the null cases first: both empty, or exactly one empty.',
        'Then compare values, and recurse on `(p.left, q.left)` and `(p.right, q.right)`.',
      ],
      approaches: [
        {
          name: 'Compare traversal lists',
          idea: 'Turn both trees into level-order lists with nulls and compare the lists. Works, but builds two full lists even when the roots already differ.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Lockstep DFS',
          idea: 'Two trees are equal exactly when the roots match and both pairs of subtrees are equal. Stops at the first difference.',
          pseudo: `function isSameTree(p, q):
    if p = null and q = null: return true
    if p = null or q = null: return false
    if p.val ≠ q.val: return false
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`,
          code: `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'isSameTree',
      starter: `function isSameTree(p, q) {
  // same shape and same values?
  return false;
}`,
      solution: `function isSameTree(p, q) {
  if (!p && !q) return true;
  if (!p || !q || p.val !== q.val) return false;
  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
      tests: [
        { name: 'equal', args: [[1, 2, 3], [1, 2, 3]], expected: true },
        { name: 'different shape', args: [[1, 2], [1, null, 2]], expected: false },
        { name: 'children swapped', args: [[1, 2, 1], [1, 1, 2]], expected: false },
        { name: 'both empty', args: [[], []], expected: true },
        { name: 'one empty', args: [[], [1]], expected: false },
        { name: 'single nodes', args: [[1], [1]], expected: true },
        { name: 'differs deep down', args: [[1, 2, 3, 4], [1, 2, 3, null, 4]], expected: false },
        { name: 'negatives', args: [[-1, -2], [-1, -2]], expected: true },
      ],
      shapes: { args: ['tree', 'tree'] },
      takeaway: 'Two trees at once: recurse on matching pairs, nulls first.',
    },
    {
      id: 'trees-build-pre-in',
      title: 'Rebuild from preorder and inorder',
      difficulty: 'medium',
      leetcode: 105,
      pattern: 'Divide by the root',
      statement:
        'You get the preorder and inorder lists of a tree with **unique** values. Rebuild the tree and return its root.',
      examples: [
        { input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]' },
        { input: 'preorder = [1,2,3], inorder = [3,2,1]', output: '[1,2,null,3]', explain: 'Each value is to the left of the one before it in inorder, so it is a left chain.' },
        { input: 'preorder = [-1], inorder = [-1]', output: '[-1]' },
      ],
      constraints: ['0 ≤ n ≤ 3000', 'All values are unique', 'Both lists describe the same tree'],
      hints: [
        'The first value of preorder is always the root.',
        'Find the root in inorder. Everything before it is the left subtree; everything after it is the right subtree.',
        'A map from value to inorder index makes the lookup O(1). Pass index ranges instead of slicing, and read preorder with one pointer, building left before right.',
      ],
      approaches: [
        {
          name: 'Search and slice',
          idea: 'Root = `preorder[0]`. Find it in inorder with `indexOf`, slice both lists into left and right parts, recurse. Clear, but each call scans and copies.',
          code: `function buildTree(preorder, inorder) {
  if (!preorder.length) return null;
  const k = inorder.indexOf(preorder[0]);
  return new TreeNode(
    preorder[0],
    buildTree(preorder.slice(1, k + 1), inorder.slice(0, k)),
    buildTree(preorder.slice(k + 1), inorder.slice(k + 1)),
  );
}`,
          time: 'O(n²)',
          space: 'O(n²)',
        },
        {
          name: 'Map + ranges + preorder pointer',
          idea: 'Preorder hands out roots in the exact order you build them, so one moving pointer is enough. The map finds each root\'s split point in O(1).',
          pseudo: `function buildTree(preorder, inorder):
    where ← map of value → index in inorder
    next ← 0
    function build(lo, hi):
        if lo > hi: return null
        root ← new node(preorder[next])
        next ← next + 1
        mid ← where[root.val]
        root.left ← build(lo, mid - 1)
        root.right ← build(mid + 1, hi)
        return root
    return build(0, n - 1)`,
          code: `function buildTree(preorder, inorder) {
  const where = new Map(inorder.map((v, i) => [v, i]));
  let next = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const root = new TreeNode(preorder[next++]);
    const mid = where.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'buildTree',
      starter: `function buildTree(preorder, inorder) {
  // preorder gives the roots, inorder gives the split
  return null;
}`,
      solution: `function buildTree(preorder, inorder) {
  const where = new Map(inorder.map((v, i) => [v, i]));
  let next = 0;
  const build = (lo, hi) => {
    if (lo > hi) return null;
    const root = new TreeNode(preorder[next++]);
    const mid = where.get(root.val);
    root.left = build(lo, mid - 1);
    root.right = build(mid + 1, hi);
    return root;
  };
  return build(0, inorder.length - 1);
}`,
      tests: [
        { name: 'classic', args: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: [3, 9, 20, null, null, 15, 7] },
        { name: 'single node', args: [[-1], [-1]], expected: [-1] },
        { name: 'empty', args: [[], []], expected: [] },
        { name: 'left chain', args: [[1, 2, 3], [3, 2, 1]], expected: [1, 2, null, 3] },
        { name: 'right chain', args: [[1, 2, 3], [1, 2, 3]], expected: [1, null, 2, null, 3] },
        { name: 'lesson tree', args: [[1, 2, 4, 5, 7, 3, 6], [4, 2, 7, 5, 1, 3, 6]], expected: [1, 2, 3, 4, 5, null, 6, null, null, 7] },
        { name: 'full tree', args: [[1, 2, 4, 5, 3, 6, 7], [4, 2, 5, 1, 6, 3, 7]], expected: [1, 2, 3, 4, 5, 6, 7] },
      ],
      shapes: { result: 'tree' },
      takeaway: 'Preorder says who the root is; inorder says what goes left and right.',
    },
    {
      id: 'trees-subtree',
      title: 'Subtree of another tree',
      difficulty: 'easy',
      leetcode: 572,
      pattern: 'Lockstep DFS',
      statement:
        'Return `true` if `subRoot` appears somewhere inside `root`: some node of `root`, together with *everything below it*, is exactly the same tree as `subRoot`.',
      examples: [
        { input: 'root = [3,4,5,1,2], subRoot = [4,1,2]', output: 'true' },
        { input: 'root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]', output: 'false', explain: 'Node 2 has an extra child 0, so the part under 4 is not an exact match.' },
        { input: 'root = [12], subRoot = [2]', output: 'false' },
      ],
      constraints: ['0 ≤ nodes in root ≤ 2000', '1 ≤ nodes in subRoot ≤ 1000'],
      hints: [
        'You already have `isSameTree`. Where could a match start?',
        'Try every node of `root` as the start: `same(node, subRoot)`.',
        'Faster idea: write both trees as preorder strings with a marker for every null and a separator before every value, then check if one string contains the other.',
      ],
      approaches: [
        {
          name: 'Same-tree check at every node',
          idea: 'Any match has to start at some node of `root`. Walk `root`, and at each node run the lockstep comparison. This is the answer most interviewers expect.',
          code: `function isSubtree(root, subRoot) {
  const same = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
  };
  if (!root) return !subRoot;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
          time: 'O(n × m)',
          space: 'O(h)',
        },
        {
          name: 'Serialize both, then search the text',
          idea: 'Preorder with null markers is unique per tree, and a subtree is a contiguous piece of its parent\'s preorder. So `subRoot` is a subtree exactly when its string appears inside `root`\'s string. A comma before each value stops `2` from matching inside `12`.',
          pseudo: `function isSubtree(root, subRoot):
    return serialize(subRoot) is a substring of serialize(root)

function serialize(node):
    if node = null: return ",#"
    return "," + node.val + serialize(node.left) + serialize(node.right)`,
          code: `function isSubtree(root, subRoot) {
  const serialize = (node, out) => {
    if (!node) {
      out.push('#');
      return out;
    }
    out.push(String(node.val));
    serialize(node.left, out);
    serialize(node.right, out);
    return out;
  };
  const big = ',' + serialize(root, []).join(',');
  const small = ',' + serialize(subRoot, []).join(',');
  return big.includes(small);
}`,
          time: 'O(n + m) with a linear search like KMP',
          space: 'O(n + m)',
        },
      ],
      fn: 'isSubtree',
      starter: `function isSubtree(root, subRoot) {
  // does subRoot appear (with everything below it) inside root?
  return false;
}`,
      solution: `function isSubtree(root, subRoot) {
  const same = (a, b) => {
    if (!a && !b) return true;
    if (!a || !b || a.val !== b.val) return false;
    return same(a.left, b.left) && same(a.right, b.right);
  };
  if (!root) return !subRoot;
  return same(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}`,
      tests: [
        { name: 'found', args: [[3, 4, 5, 1, 2], [4, 1, 2]], expected: true },
        { name: 'extra child below', args: [[3, 4, 5, 1, 2, null, null, null, null, 0], [4, 1, 2]], expected: false },
        { name: '2 is not inside 12', args: [[12], [2]], expected: false },
        { name: 'whole tree', args: [[1], [1]], expected: true },
        { name: 'a leaf', args: [[1, 1], [1]], expected: true },
        { name: 'empty root', args: [[], [1]], expected: false },
        { name: 'same values, other shape', args: [[1, 2, 3], [2, null, 3]], expected: false },
      ],
      shapes: { args: ['tree', 'tree'] },
      takeaway: '"Appears inside" = try every start node, or compare serialized strings.',
    },
    {
      id: 'trees-serialize',
      title: 'Save and load a tree (stretch)',
      difficulty: 'hard',
      leetcode: 297,
      pattern: 'Preorder with null markers',
      statement:
        '**Stretch problem.** Write `serialize(root)`, which turns a tree into a **string**, and `deserialize(data)`, which rebuilds the exact same tree from that string alone. You choose the format. Values can be negative and have several digits. The checker calls `roundTrip(root)` (already written in the starter), which runs `deserialize(serialize(root))` and compares the result with the original tree.',
      examples: [
        { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explain: 'One possible string: "1,2,#,#,3,4,#,#,5,#,#".' },
        { input: 'root = []', output: '[]' },
        { input: 'root = [-10,200]', output: '[-10,200]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 10⁴', '-1000 ≤ node value ≤ 1000', '`serialize` must return a string'],
      hints: [
        'A plain preorder list loses the shape. What extra thing could you write down to keep it?',
        'Write a marker like `#` for every null child. Then preorder alone describes the tree.',
        'Join tokens with commas so multi-digit and negative values stay intact.',
        'To load, split on commas and read tokens with one pointer, in the same order you wrote them: value, then the left subtree, then the right subtree.',
      ],
      approaches: [
        {
          name: 'Two traversals (preorder + inorder)',
          idea: 'Save both lists and rebuild with the previous problem. Works only when all values are unique, and stores every value twice.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Level order with nulls',
          idea: 'Write the tree row by row with `null` for missing children, like the test arrays on this site. Works with duplicates; loading needs a queue.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Preorder with null markers',
          idea: 'Recording every empty child makes the shape explicit. Loading reads tokens in the same order they were written, so one recursive function mirrors the other.',
          pseudo: `function serialize(root):
    tokens ← empty list
    function write(node):
        if node = null: append "#" to tokens; return
        append node.val to tokens
        write(node.left)
        write(node.right)
    write(root)
    return tokens joined with ","

function deserialize(data):
    tokens ← data split on ","
    i ← 0
    function read():
        t ← tokens[i]; i ← i + 1
        if t = "#": return null
        node ← new node(number(t))
        node.left ← read()
        node.right ← read()
        return node
    return read()`,
          code: `function serialize(root) {
  const tokens = [];
  const write = (node) => {
    if (!node) {
      tokens.push('#');
      return;
    }
    tokens.push(String(node.val));
    write(node.left);
    write(node.right);
  };
  write(root);
  return tokens.join(',');
}

function deserialize(data) {
  const tokens = data.split(',');
  let i = 0;
  const read = () => {
    const t = tokens[i++];
    if (t === '#') return null;
    const node = new TreeNode(Number(t));
    node.left = read();
    node.right = read();
    return node;
  };
  return read();
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'roundTrip',
      starter: `function serialize(root) {
  // turn the tree into a string
  return '';
}

function deserialize(data) {
  // rebuild the tree using only the string
  return null;
}

// Used by the checker. No need to change it.
function roundTrip(root) {
  const text = serialize(root);
  if (typeof text !== 'string') throw new Error('serialize must return a string');
  return deserialize(text);
}`,
      solution: `function serialize(root) {
  const tokens = [];
  const write = (node) => {
    if (!node) {
      tokens.push('#');
      return;
    }
    tokens.push(String(node.val));
    write(node.left);
    write(node.right);
  };
  write(root);
  return tokens.join(',');
}

function deserialize(data) {
  const tokens = data.split(',');
  let i = 0;
  const read = () => {
    const t = tokens[i++];
    if (t === '#') return null;
    const node = new TreeNode(Number(t));
    node.left = read();
    node.right = read();
    return node;
  };
  return read();
}

function roundTrip(root) {
  const text = serialize(root);
  if (typeof text !== 'string') throw new Error('serialize must return a string');
  return deserialize(text);
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 3, null, null, 4, 5]], expected: [1, 2, 3, null, null, 4, 5] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[7]], expected: [7] },
        { name: 'negative and multi-digit', args: [[-10, 200, -3000]], expected: [-10, 200, -3000] },
        { name: 'zeros', args: [[0, 0, 0]], expected: [0, 0, 0] },
        { name: 'left chain', args: [[1, 2, null, 3, null, 4]], expected: [1, 2, null, 3, null, 4] },
        { name: 'right chain', args: [[1, null, 2, null, 3]], expected: [1, null, 2, null, 3] },
        { name: 'duplicates', args: [[1, 1, 1, 1, null, null, 1]], expected: [1, 1, 1, 1, null, null, 1] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [1, 2, 3, 4, 5, null, 6, null, null, 7] },
      ],
      shapes: { args: ['tree'], result: 'tree' },
      takeaway: 'Write down the empty spots and one traversal is enough to rebuild a tree.',
    },
  ],
  quiz: [
    {
      prompt: 'Why can preorder `[1, 2]` alone not rebuild a tree?',
      options: [
        'It is too short',
        'Node 2 could be the left child or the right child of 1',
        'Preorder never starts with the root',
        'It can; the tree is 1 with left child 2',
      ],
      answer: 1,
      explanation: 'Both shapes have preorder `[1, 2]`. You need a second list (inorder) or null markers to tell them apart.',
    },
    {
      prompt: 'In the fast `buildTree`, why must you build the left subtree before the right one?',
      options: [
        'Left subtrees are smaller',
        'The shared preorder pointer hands out roots in preorder: root, then all of left, then all of right',
        'Inorder requires it',
        'It does not matter',
      ],
      answer: 1,
      explanation: 'After the root, preorder lists every left-subtree node before any right-subtree node. Building right first would take left nodes as roots.',
    },
    {
      prompt: 'Serializing for the subtree check, why put a comma before every value?',
      options: ['To make the string shorter', 'So `2` cannot match the end of `12`', 'Commas are required by `includes`', 'To mark null children'],
      answer: 1,
      explanation: 'Without a separator, the text for tree `[2]` would appear inside the text for `[12]`, giving a false match.',
    },
  ],
  takeaways: [
    'Two trees at once: recurse on matching pairs, and handle the null cases first.',
    'Rebuild = divide by the root: one list names the root, the other tells you how to split.',
    'Preorder plus a marker for every null fully describes a tree, even with duplicate values.',
  ],
};

export default lesson;
