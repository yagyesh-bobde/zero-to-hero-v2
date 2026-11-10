import type { Lesson } from '../types';

// Module 10, lesson 2: breadth-first search, level by level.
const lesson: Lesson = {
  id: 'bfs-levels',
  title: 'Level by level: BFS with a queue',
  summary: 'Process a tree row by row using a queue and one number: the level size.',
  minutes: 16,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The org chart printer',
      text: 'HR wants the company org chart printed one row per level: the CEO, then everyone who reports to the CEO, then everyone one level below that. A DFS would print the CEO, then dive down one VP\'s whole team before ever reaching the second VP. You need a different walk: wide first, not deep first.',
    },
    {
      kind: 'diagram',
      title: 'Same tree as lesson 1, read row by row',
      art: [
        '            1            level 0',
        '          /   \\',
        '         2     3         level 1',
        '        / \\     \\',
        '       4   5     6       level 2',
        '          /',
        '         7               level 3',
      ].join('\n'),
    },
    {
      kind: 'text',
      text: '**The problem.** Return the values grouped by level, left to right: `[[1], [2, 3], [4, 5, 6], [7]]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: one full walk per level',
      code: `function levelOrder(root):
    result ← empty list
    for d from 0 to height(root) - 1:
        row ← empty list
        collect(root, 0, d, row)          // DFS that keeps nodes at depth d
        append row to result
    return result

function collect(node, depth, d, row):
    if node = null: return
    if depth = d: append node.val to row; return
    collect(node.left, depth + 1, d, row)
    collect(node.right, depth + 1, d, row)`,
    },
    {
      kind: 'text',
      text: 'It works. But to collect level 3 it walks through levels 0, 1 and 2 again, and it did the same for level 2 before that. The top of the tree is re-walked once per level, so the cost is O(n × h). For a chain-shaped tree that is O(n²).',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A queue hands nodes back in the order you found them',
      text: 'A **queue** is a line at a shop: first in, first out. Put the root in. Each time you take a node out, add its children to the back. Children of level 1 always join the line *behind* every level 1 node, so nodes come out level by level. To know where one level ends, write down the queue size **before** you start the level. That many nodes is exactly one row.',
    },
    {
      kind: 'steps',
      title: 'BFS on our tree (the array is the queue, faded = already taken)',
      frames: [
        {
          cells: [1],
          pointers: { head: 0 },
          active: [0],
          vars: { level: 0, size: 1, result: '[]' },
          note: 'The queue holds only the root. Level 0 has `size = 1` node.',
        },
        {
          cells: [1, 2, 3],
          pointers: { head: 1 },
          done: [0],
          active: [1, 2],
          vars: { level: 1, size: 2, result: '[[1]]' },
          note: 'Took 1, wrote it as row 0, added its children 2 and 3 to the back. Snapshot: the next row has 2 nodes.',
        },
        {
          cells: [1, 2, 3, 4, 5],
          pointers: { head: 2 },
          done: [0, 1],
          active: [2],
          vars: { level: 1, row: '[2]', result: '[[1]]' },
          note: 'Took 2 and added 4 and 5. They wait behind 3, so level 1 still finishes first.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6],
          pointers: { head: 3 },
          done: [0, 1, 2],
          active: [3, 4, 5],
          vars: { level: 2, size: 3, result: '[[1],[2,3]]' },
          note: 'Took 3 and added 6. We took `size = 2` nodes, so row 1 is complete. The next row has 3 nodes.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7],
          pointers: { head: 6 },
          done: [0, 1, 2, 3, 4, 5],
          active: [6],
          vars: { level: 3, size: 1, result: '[[1],[2,3],[4,5,6]]' },
          note: 'Took 4, 5 and 6. Only 5 had a child, 7. Row 2 is complete.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7],
          pointers: { head: 7 },
          done: [0, 1, 2, 3, 4, 5, 6],
          vars: { result: '[[1],[2,3],[4,5,6],[7]]' },
          note: 'Took 7. The head has reached the end of the queue, so we are done. Every node went in and out once.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'BFS, one row at a time',
      code: `function levelOrder(root):
    if root = null: return []
    result ← empty list
    queue ← [root]
    while queue is not empty:
        size ← length of queue              // how many nodes are in this row
        row ← empty list
        repeat size times:
            node ← queue.popFront()
            append node.val to row
            if node.left ≠ null: queue.pushBack(node.left)
            if node.right ≠ null: queue.pushBack(node.right)
        append row to result
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  while (queue.length) {
    const row = [];
    const next = [];
    for (const node of queue) {
      row.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    result.push(row);
    queue = next;
  }
  return result;
}`,
      title: 'In JS: build the next row in its own array',
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'One DFS per level', time: 'O(n × h)', space: 'O(h)', note: 'Re-walks the top of the tree for every level.' },
        { approach: 'DFS that passes the depth', time: 'O(n)', space: 'O(h)', note: 'Push each value into `result[depth]`. Also fine, but it cannot stop early at a level.' },
        { approach: 'BFS with level size', time: 'O(n)', space: 'O(w)', note: '`w` is the widest row. Every node enters and leaves the queue once.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** Reach for BFS when a problem talks about **levels, rows, depth order, "closest to the root", or "first/last on each row"**. Right side view, zigzag order, average of each level and minimum depth are all this loop with a different line in the middle. The same loop finds shortest paths in graphs in module 13.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: BFS by levels',
      code: `queue ← [root]          // skip if root is null
depth ← 0
while queue is not empty:
    size ← length of queue
    for i from 0 to size - 1:
        node ← queue.popFront()
        // work for this node (i = its position in the row)
        push node's non-null children to the back of queue
    // work for the finished row
    depth ← depth + 1`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Two JS traps',
      text: '`queue.shift()` looks like popFront, but it moves every other item one slot down, so it costs O(n) each time and the whole BFS can become O(n²). Use a `head` index, or build the next row in a new array as above. Second trap: read the row size **once, before** the inner loop. `for (let i = 0; i < queue.length; i++)` keeps growing while you push children.',
    },
  ],
  problems: [
    {
      id: 'trees-level-order',
      title: 'Level order traversal',
      difficulty: 'medium',
      leetcode: 102,
      pattern: 'BFS by levels',
      statement:
        'Print the org chart: return the node values grouped by level, from the top row down, each row left to right.',
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
        { input: 'root = [1,2,3,4,5,null,6,null,null,7]', output: '[[1],[2,3],[4,5,6],[7]]' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 2000', '-1000 ≤ node value ≤ 1000'],
      hints: [
        'Nodes should come out in the order they were discovered. Which data structure does that?',
        'Put the root in a queue. When you take a node out, add its children to the back.',
        'Before each row, record how many nodes are in the queue. Take exactly that many: that is one row.',
      ],
      approaches: [
        {
          name: 'One DFS per level',
          idea: 'For each depth d, walk the whole tree and keep nodes at depth d. Correct, but the top levels are walked again for every level.',
          time: 'O(n × h)',
          space: 'O(h)',
        },
        {
          name: 'DFS passing the depth',
          idea: 'Walk once in preorder, carrying the depth. Push each value into `result[depth]`. Left is visited before right, so every row stays left to right.',
          code: `function levelOrder(root) {
  const result = [];
  const walk = (node, depth) => {
    if (!node) return;
    if (result.length === depth) result.push([]);
    result[depth].push(node.val);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  };
  walk(root, 0);
  return result;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'BFS with level size',
          idea: 'A queue returns nodes in discovery order, which is level by level. Taking exactly one row\'s worth of nodes at a time splits the output into rows.',
          pseudo: `function levelOrder(root):
    if root = null: return []
    result ← empty list
    queue ← [root]
    while queue is not empty:
        row ← empty list
        next ← empty list
        for each node in queue:
            append node.val to row
            if node.left ≠ null: append node.left to next
            if node.right ≠ null: append node.right to next
        append row to result
        queue ← next
    return result`,
          code: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  while (queue.length) {
    const row = [];
    const next = [];
    for (const node of queue) {
      row.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    result.push(row);
    queue = next;
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(w)',
        },
      ],
      fn: 'levelOrder',
      starter: `function levelOrder(root) {
  // one inner array per level, top to bottom
  return [];
}`,
      solution: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  while (queue.length) {
    const row = [];
    const next = [];
    for (const node of queue) {
      row.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    result.push(row);
    queue = next;
  }
  return result;
}`,
      tests: [
        { name: 'small tree', args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [[1], [2, 3], [4, 5, 6], [7]] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[1]], expected: [[1]] },
        { name: 'left line', args: [[1, 2, null, 3]], expected: [[1], [2], [3]] },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [[1], [2, 3], [4, 5, 6, 7]] },
        { name: 'negatives', args: [[0, -1, 1, -2, null, null, 2]], expected: [[0], [-1, 1], [-2, 2]] },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Rows in a tree = BFS + "size of the queue before the row starts".',
    },
    {
      id: 'trees-right-side-view',
      title: 'Right side view',
      difficulty: 'medium',
      leetcode: 199,
      pattern: 'BFS by levels',
      statement:
        'You stand to the right of a tree and look at it. On each level you can only see the node closest to you. Return the values you see, from top to bottom.',
      examples: [
        { input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' },
        { input: 'root = [1,2,3,4]', output: '[1,3,4]', explain: 'Level 2 has only node 4. It is on the left side, but nothing blocks it, so you see it.' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 100'],
      hints: [
        'The visible node is not always a right child. It is the last node on its level.',
        'Run level-order BFS and keep only the last node of each row.',
        'DFS also works: visit right before left, and record a node when its depth is reached for the first time.',
      ],
      approaches: [
        {
          name: 'Follow right children only',
          idea: 'Tempting, but wrong: in `[1,2,3,4]` the right path stops at 3 while node 4 on the left is still visible. Only use this to see why levels matter.',
          time: 'O(h)',
          space: 'O(1)',
        },
        {
          name: 'DFS, right child first',
          idea: 'Visit right before left and carry the depth. The first node you reach at each new depth is the rightmost one on that level.',
          code: `function rightSideView(root) {
  const seen = [];
  const walk = (node, depth) => {
    if (!node) return;
    if (seen.length === depth) seen.push(node.val);
    walk(node.right, depth + 1);
    walk(node.left, depth + 1);
  };
  walk(root, 0);
  return seen;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
        {
          name: 'BFS, last node of each row',
          idea: 'Level-order BFS already gives each row left to right. The last node of every row is the one you see.',
          pseudo: `function rightSideView(root):
    if root = null: return []
    seen ← empty list
    queue ← [root]
    while queue is not empty:
        append (last node of queue).val to seen
        next ← empty list
        for each node in queue:
            if node.left ≠ null: append node.left to next
            if node.right ≠ null: append node.right to next
        queue ← next
    return seen`,
          code: `function rightSideView(root) {
  if (!root) return [];
  const seen = [];
  let queue = [root];
  while (queue.length) {
    seen.push(queue[queue.length - 1].val);
    const next = [];
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return seen;
}`,
          time: 'O(n)',
          space: 'O(w)',
        },
      ],
      fn: 'rightSideView',
      starter: `function rightSideView(root) {
  // the last node of every level, top to bottom
  return [];
}`,
      solution: `function rightSideView(root) {
  if (!root) return [];
  const seen = [];
  let queue = [root];
  while (queue.length) {
    seen.push(queue[queue.length - 1].val);
    const next = [];
    for (const node of queue) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    queue = next;
  }
  return seen;
}`,
      tests: [
        { name: 'classic', args: [[1, 2, 3, null, 5, null, 4]], expected: [1, 3, 4] },
        { name: 'left side shows through', args: [[1, 2, 3, 4]], expected: [1, 3, 4] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [1, 3, 6, 7] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[9]], expected: [9] },
        { name: 'only left children', args: [[1, 2, null, 3]], expected: [1, 2, 3] },
        { name: 'full tree', args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, 3, 7] },
      ],
      shapes: { args: ['tree'] },
      takeaway: '"Visible from the side" means "last on its level", not "right child".',
    },
    {
      id: 'trees-zigzag',
      title: 'Zigzag level order',
      difficulty: 'medium',
      leetcode: 103,
      pattern: 'BFS by levels',
      statement:
        'A snake game reads a tree row by row, but turns around at the end of every row: row 0 left to right, row 1 right to left, row 2 left to right, and so on. Return the rows in that order.',
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[20,9],[15,7]]' },
        { input: 'root = [1,2,3,4,5,null,6,null,null,7]', output: '[[1],[3,2],[4,5,6],[7]]' },
        { input: 'root = []', output: '[]' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 2000'],
      hints: [
        'Do not change the order nodes go into the queue. Only change how you write each row.',
        'Keep a flag that flips after every row.',
        'On odd rows, reverse the row, or write each value straight into slot `size - 1 - i`.',
      ],
      approaches: [
        {
          name: 'Level order, then reverse odd rows',
          idea: 'Run normal BFS. Afterwards reverse rows 1, 3, 5... Simple and still O(n), because each value is moved once more.',
          code: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const rows = [];
  let queue = [root];
  while (queue.length) {
    rows.push(queue.map((n) => n.val));
    queue = queue.flatMap((n) => [n.left, n.right].filter(Boolean));
  }
  return rows.map((row, i) => (i % 2 ? row.reverse() : row));
}`,
          time: 'O(n)',
          space: 'O(w)',
        },
        {
          name: 'Write each value into its final slot',
          idea: 'The queue always holds a row left to right. When the row should be reversed, put the i-th node at position `size - 1 - i` instead of `i`. No extra pass.',
          pseudo: `function zigzag(root):
    if root = null: return []
    result ← empty list
    queue ← [root]
    leftToRight ← true
    while queue is not empty:
        size ← length of queue
        row ← list of size empty slots
        next ← empty list
        for i from 0 to size - 1:
            node ← queue[i]
            if leftToRight: row[i] ← node.val
            else: row[size - 1 - i] ← node.val
            append node's non-null children to next
        append row to result
        queue ← next
        leftToRight ← not leftToRight
    return result`,
          code: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  let leftToRight = true;
  while (queue.length) {
    const size = queue.length;
    const row = new Array(size);
    const next = [];
    queue.forEach((node, i) => {
      row[leftToRight ? i : size - 1 - i] = node.val;
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    });
    result.push(row);
    queue = next;
    leftToRight = !leftToRight;
  }
  return result;
}`,
          time: 'O(n)',
          space: 'O(w)',
        },
      ],
      fn: 'zigzagLevelOrder',
      starter: `function zigzagLevelOrder(root) {
  // rows alternate: left to right, then right to left
  return [];
}`,
      solution: `function zigzagLevelOrder(root) {
  if (!root) return [];
  const result = [];
  let queue = [root];
  let leftToRight = true;
  while (queue.length) {
    const size = queue.length;
    const row = new Array(size);
    const next = [];
    queue.forEach((node, i) => {
      row[leftToRight ? i : size - 1 - i] = node.val;
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    });
    result.push(row);
    queue = next;
    leftToRight = !leftToRight;
  }
  return result;
}`,
      tests: [
        { name: 'small tree', args: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [20, 9], [15, 7]] },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: [[1], [3, 2], [4, 5, 6], [7]] },
        { name: 'empty tree', args: [[]], expected: [] },
        { name: 'single node', args: [[1]], expected: [[1]] },
        { name: 'gaps in a row', args: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [3, 2], [4, 5]] },
        {
          name: 'four full rows',
          args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
          expected: [[1], [3, 2], [4, 5, 6, 7], [15, 14, 13, 12, 11, 10, 9, 8]],
        },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Keep the queue order normal; change only how a row is written out.',
    },
  ],
  quiz: [
    {
      prompt: 'Why does BFS read the size of the queue *before* processing a row?',
      options: [
        'To skip null children',
        'Because children are added during the row, and they belong to the next row',
        'To make it faster than DFS',
        'Because JS arrays have no length while looping',
      ],
      answer: 1,
      explanation: 'While you take nodes from row d, their children (row d + 1) join the back. The size you saved before the row tells you where row d stops.',
    },
    {
      prompt: 'What is wrong with `queue.shift()` for a BFS over a million nodes?',
      options: ['It returns the last item', 'It is O(n) per call, so the BFS can become O(n²)', 'It does not work on objects', 'Nothing'],
      answer: 1,
      explanation: '`shift()` re-indexes the whole array. Use a head index or swap in a fresh array per row.',
    },
    {
      prompt: 'Which question is a BFS signal?',
      options: ['Is the tree balanced?', 'What is the leftmost value on the bottom row?', 'Sum of all values', 'Is this a mirror image?'],
      answer: 1,
      explanation: '"Bottom row" and "leftmost on a row" are about levels. BFS gives you rows directly.',
    },
  ],
  takeaways: [
    'BFS = queue. Nodes come out level by level because children always join the back.',
    'Save the queue size before a row; that many nodes make exactly one row.',
    'In JS, avoid `shift()` in hot loops: use a head index or a new array per row.',
  ],
};

export default lesson;
