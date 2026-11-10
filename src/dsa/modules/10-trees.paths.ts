import type { Lesson } from '../types';

// Module 10, lesson 4: path problems (pass state down; paths that bend).
const lesson: Lesson = {
  id: 'path-problems',
  title: 'Path problems: pass info down',
  summary: 'Carry a running total and one shared path down the tree instead of rebuilding paths.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The skill tree',
      text: 'In a game\'s skill tree you start at the top skill and keep unlocking one of the two skills below it until you reach a final skill (a leaf). Each skill costs points. You have exactly 22 points and want to spend all of them. Which routes work?',
    },
    {
      kind: 'diagram',
      title: 'Costs of each skill (target: 22)',
      art: [
        '            5',
        '          /   \\',
        '         4     8',
        '        /     / \\',
        '      11    13   4',
        '     /  \\       / \\',
        '    7    2     5   1',
        '',
        'level order: [5,4,8,11,null,13,4,7,2,null,null,5,1]',
      ].join('\n'),
      caption: 'Two routes cost exactly 22: `5 4 11 2` and `5 8 4 5`.',
    },
    {
      kind: 'text',
      text: '**The problem.** Return every root-to-leaf path whose values add up to `target`. A **root-to-leaf path** starts at the root and ends at a node with no children. For the tree above and `target = 22`, the answer is `[[5,4,11,2], [5,8,4,5]]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: list every path, then check each one',
      code: `function pathSum(root, target):
    paths ← empty list
    collect(root, [], paths)              // every root-to-leaf path
    return the paths in paths whose sum = target

function collect(node, path, paths):
    if node = null: return
    newPath ← copy of path with node.val added   // a fresh copy every step
    if node is a leaf: append newPath to paths
    collect(node.left, newPath, paths)
    collect(node.right, newPath, paths)`,
    },
    {
      kind: 'text',
      text: 'It works. But every step copies the whole path so far, and at the end each path is added up again from scratch. The prefix `5, 4, 11` is copied and summed once for each leaf below it. With height h, that is O(n × h) time and memory, mostly spent redoing the same prefix.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Carry the state down, undo it on the way back',
      text: 'Lesson 3 sent answers **up**. Here the information flows **down**: each call receives what is left of the budget, `remaining = target - (sum so far)`. And instead of copying, keep **one** path array: push the node when you enter it, pop it when you leave. That is the choose / explore / un-choose move from backtracking (module 9). Copy the path only at a leaf that matches.',
    },
    {
      kind: 'trace',
      title: 'DFS with one shared path (target 22)',
      columns: ['Enter', 'Path', 'Remaining', 'Leaf?', 'Action'],
      rows: [
        [5, '[5]', 17, 'no', 'go left'],
        [4, '[5,4]', 13, 'no', 'go left'],
        [11, '[5,4,11]', 2, 'no', 'go left'],
        [7, '[5,4,11,7]', -5, 'yes', 'not 0, pop 7'],
        [2, '[5,4,11,2]', 0, 'yes', 'save a copy, pop 2'],
        [8, '[5,8]', 9, 'no', '(popped 11, 4) go left'],
        [13, '[5,8,13]', -4, 'yes', 'not 0, pop 13'],
        [4, '[5,8,4]', 5, 'no', 'go left'],
        [5, '[5,8,4,5]', 0, 'yes', 'save a copy, pop 5'],
        [1, '[5,8,4,1]', 4, 'yes', 'not 0, pop 1, done'],
      ],
      note: 'The path array never holds more than h values. Each node is pushed once and popped once.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function pathSum(root, target):
    result ← empty list
    path ← empty list
    function dfs(node, remaining):
        if node = null: return
        push node.val onto path                    // choose
        remaining ← remaining - node.val
        if node.left = null and node.right = null and remaining = 0:
            append a copy of path to result
        dfs(node.left, remaining)                  // explore
        dfs(node.right, remaining)
        pop from path                              // un-choose
    dfs(root, target)
    return result`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function pathSum(root, target) {
  const result = [];
  const path = [];
  const dfs = (node, remaining) => {
    if (!node) return;
    path.push(node.val);
    remaining -= node.val;
    if (!node.left && !node.right && remaining === 0) result.push([...path]);
    dfs(node.left, remaining);
    dfs(node.right, remaining);
    path.pop();
  };
  dfs(root, target);
  return result;
}`,
    },
    {
      kind: 'compare',
      rows: [
        { approach: 'Copy the path at every step', time: 'O(n × h)', space: 'O(n × h)', note: 'Rebuilds and re-sums the same prefixes for every leaf.' },
        { approach: 'Remaining budget + one shared path', time: 'O(n) + copies of answers', space: 'O(h)', note: 'Each node is pushed and popped once. Only matching paths are copied.' },
      ],
    },
    {
      kind: 'table',
      title: 'Which path problem is it?',
      head: ['Path shape', 'Information flows', 'Example'],
      rows: [
        ['Root to leaf', '**Down**: pass a running total or the path so far', 'Path sum, sum of root-to-leaf numbers'],
        ['Anywhere, may bend at a node', '**Up**: return the best one-sided "arm"; record `left + node + right`', 'Diameter, maximum path sum'],
        ['Anywhere, only going down', 'Down, with a prefix-sum map (module 2 trick)', 'Path Sum III (practice list)'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: pass info down',
      code: `function dfs(node, state):
    if node = null: return
    state ← update(state, node)          // e.g. total + node.val
    if node is a leaf:
        check state, maybe record it
    dfs(node.left, state)
    dfs(node.right, state)
    // if state is a shared list, undo your change here`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Check at the leaf, and copy what you save',
      text: 'Values can be negative, so `remaining = 0` halfway down means nothing; only a leaf ends a path. A node with one child is **not** a leaf: in `[1, 2]` with target 1 the answer is empty. And `result.push(path)` saves a reference to the shared array, which is empty by the time you return. Push `[...path]`.',
    },
  ],
  problems: [
    {
      id: 'trees-path-sum',
      title: 'Path sum (yes or no)',
      difficulty: 'easy',
      leetcode: 112,
      pattern: 'Pass info down',
      statement:
        'Return `true` if some root-to-leaf path adds up to exactly `targetSum`. A leaf is a node with no children. The empty tree has no paths.',
      examples: [
        { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22', output: 'true' },
        { input: 'root = [1,2,3], targetSum = 5', output: 'false', explain: 'The paths are 1+2 = 3 and 1+3 = 4.' },
        { input: 'root = [], targetSum = 0', output: 'false' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 5000', '-1000 ≤ node value ≤ 1000'],
      hints: [
        'Subtract each node\'s value from the target as you go down.',
        'At a leaf, the path works if what is left is exactly 0.',
        '`has(node, t) = has(node.left, t - node.val) or has(node.right, t - node.val)`, with the leaf check first.',
      ],
      approaches: [
        {
          name: 'Sum every path separately',
          idea: 'List all root-to-leaf paths and add each one up. Works, but re-adds shared prefixes.',
          time: 'O(n × h)',
          space: 'O(n × h)',
        },
        {
          name: 'Pass the remaining target down',
          idea: 'Each call only needs to know how much is left. A leaf answers the question; every other node asks its children.',
          pseudo: `function hasPathSum(node, remaining):
    if node = null: return false
    remaining ← remaining - node.val
    if node.left = null and node.right = null:
        return remaining = 0
    return hasPathSum(node.left, remaining) or hasPathSum(node.right, remaining)`,
          code: `function hasPathSum(root, targetSum) {
  if (!root) return false;
  const remaining = targetSum - root.val;
  if (!root.left && !root.right) return remaining === 0;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'hasPathSum',
      starter: `function hasPathSum(root, targetSum) {
  // is there a root-to-leaf path adding up to targetSum?
  return false;
}`,
      solution: `function hasPathSum(root, targetSum) {
  if (!root) return false;
  const remaining = targetSum - root.val;
  if (!root.left && !root.right) return remaining === 0;
  return hasPathSum(root.left, remaining) || hasPathSum(root.right, remaining);
}`,
      tests: [
        { name: 'skill tree, 22', args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: true },
        { name: 'skill tree, 27', args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 27], expected: true },
        { name: 'skill tree, 10', args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 10], expected: false },
        { name: 'no match', args: [[1, 2, 3], 5], expected: false },
        { name: 'right path', args: [[1, 2, 3], 4], expected: true },
        { name: 'empty tree', args: [[], 0], expected: false },
        { name: 'root is not a leaf', args: [[1, 2], 1], expected: false },
        { name: 'single node', args: [[1], 1], expected: true },
        { name: 'negatives', args: [[-2, null, -3], -5], expected: true },
      ],
      shapes: { args: ['tree', 'raw'] },
      takeaway: 'Root-to-leaf questions: shrink the target on the way down, answer at the leaf.',
    },
    {
      id: 'trees-path-sum-ii',
      title: 'Path sum: list every route',
      difficulty: 'medium',
      leetcode: 113,
      pattern: 'Pass info down',
      statement:
        'Return every root-to-leaf path whose values add up to `targetSum`, each as a list of values from root to leaf. Any order of paths is accepted.',
      examples: [
        { input: 'root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22', output: '[[5,4,11,2],[5,8,4,5]]' },
        { input: 'root = [1,2,3], targetSum = 5', output: '[]' },
        { input: 'root = [1,2,2], targetSum = 3', output: '[[1,2],[1,2]]', explain: 'Two different leaves, two different paths, even though the values match.' },
      ],
      constraints: ['0 ≤ number of nodes ≤ 5000', '-1000 ≤ node value ≤ 1000'],
      hints: [
        'Same walk as the yes/no version, but you must remember the path you are on.',
        'Use one array: push when you enter a node, pop when you leave it.',
        'At a leaf with remaining 0, save a copy: `[...path]`.',
      ],
      approaches: [
        {
          name: 'Copy the path at every node',
          idea: 'Pass a new array `[...path, node.val]` into each call. Simple and correct, but makes a copy at every node, not just at answers.',
          code: `function pathSum(root, targetSum) {
  const result = [];
  const dfs = (node, path, remaining) => {
    if (!node) return;
    const next = [...path, node.val];
    remaining -= node.val;
    if (!node.left && !node.right && remaining === 0) result.push(next);
    dfs(node.left, next, remaining);
    dfs(node.right, next, remaining);
  };
  dfs(root, [], targetSum);
  return result;
}`,
          time: 'O(n × h)',
          space: 'O(n × h)',
        },
        {
          name: 'One shared path (backtracking)',
          idea: 'Push on the way in, pop on the way out, so the array always holds exactly the current root-to-node path. Copy it only when a leaf matches.',
          pseudo: `function pathSum(root, target):
    result ← empty list
    path ← empty list
    function dfs(node, remaining):
        if node = null: return
        push node.val onto path
        remaining ← remaining - node.val
        if node is a leaf and remaining = 0:
            append a copy of path to result
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        pop from path
    dfs(root, target)
    return result`,
          code: `function pathSum(root, targetSum) {
  const result = [];
  const path = [];
  const dfs = (node, remaining) => {
    if (!node) return;
    path.push(node.val);
    remaining -= node.val;
    if (!node.left && !node.right && remaining === 0) result.push([...path]);
    dfs(node.left, remaining);
    dfs(node.right, remaining);
    path.pop();
  };
  dfs(root, targetSum);
  return result;
}`,
          time: 'O(n) + size of the answer',
          space: 'O(h)',
        },
      ],
      fn: 'pathSum',
      starter: `function pathSum(root, targetSum) {
  // every root-to-leaf path (as a list of values) that sums to targetSum
  return [];
}`,
      solution: `function pathSum(root, targetSum) {
  const result = [];
  const path = [];
  const dfs = (node, remaining) => {
    if (!node) return;
    path.push(node.val);
    remaining -= node.val;
    if (!node.left && !node.right && remaining === 0) result.push([...path]);
    dfs(node.left, remaining);
    dfs(node.right, remaining);
    path.pop();
  };
  dfs(root, targetSum);
  return result;
}`,
      tests: [
        { name: 'skill tree', args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expected: [[5, 4, 11, 2], [5, 8, 4, 5]] },
        { name: 'no match', args: [[1, 2, 3], 5], expected: [] },
        { name: 'same values, two leaves', args: [[1, 2, 2], 3], expected: [[1, 2], [1, 2]] },
        { name: 'empty tree', args: [[], 0], expected: [] },
        { name: 'root is not a leaf', args: [[1, 2], 1], expected: [] },
        { name: 'single node', args: [[1], 1], expected: [[1]] },
        { name: 'negatives, zero halfway', args: [[1, -2, -3, 1, 3, -2, null, -1], -1], expected: [[1, -2, 1, -1]] },
      ],
      shapes: { args: ['tree', 'raw'] },
      compare: 'unordered',
      takeaway: 'One shared list + push/pop beats copying at every node.',
    },
    {
      id: 'trees-sum-root-to-leaf',
      title: 'Sum of root-to-leaf numbers',
      difficulty: 'medium',
      leetcode: 129,
      pattern: 'Pass info down',
      statement:
        'Every node holds a digit 0-9. Reading a root-to-leaf path top to bottom spells a number: the path `1 → 2 → 3` is 123. Return the sum of the numbers for all root-to-leaf paths.',
      examples: [
        { input: 'root = [1,2,3]', output: '25', explain: '12 + 13 = 25.' },
        { input: 'root = [4,9,0,5,1]', output: '1026', explain: '495 + 491 + 40 = 1026.' },
        { input: 'root = [0]', output: '0' },
      ],
      constraints: ['1 ≤ number of nodes ≤ 1000', '0 ≤ node value ≤ 9', 'Tree depth ≤ 10'],
      hints: [
        'When you go one level down, what happens to the number built so far?',
        'It shifts one place left: `number * 10 + node.val`.',
        'Pass `number` down. A leaf returns it; any other node returns the sum of its children\'s answers.',
      ],
      approaches: [
        {
          name: 'Collect digit strings',
          idea: 'Build each path as a string of digits, then convert every string to a number and add. Works, but builds strings you then have to parse.',
          time: 'O(n × h)',
          space: 'O(n × h)',
        },
        {
          name: 'Pass the number down',
          idea: 'Going down one level is "multiply by 10 and add the digit". Each call gets the number so far, so nothing is rebuilt.',
          pseudo: `function sumNumbers(node, number):
    if node = null: return 0
    number ← number × 10 + node.val
    if node.left = null and node.right = null:
        return number
    return sumNumbers(node.left, number) + sumNumbers(node.right, number)`,
          code: `function sumNumbers(root, number = 0) {
  if (!root) return 0;
  number = number * 10 + root.val;
  if (!root.left && !root.right) return number;
  return sumNumbers(root.left, number) + sumNumbers(root.right, number);
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'sumNumbers',
      starter: `function sumNumbers(root) {
  // add up the number spelled by every root-to-leaf path
  return 0;
}`,
      solution: `function sumNumbers(root, number = 0) {
  if (!root) return 0;
  number = number * 10 + root.val;
  if (!root.left && !root.right) return number;
  return sumNumbers(root.left, number) + sumNumbers(root.right, number);
}`,
      tests: [
        { name: 'small tree', args: [[1, 2, 3]], expected: 25 },
        { name: 'three paths', args: [[4, 9, 0, 5, 1]], expected: 1026 },
        { name: 'single zero', args: [[0]], expected: 0 },
        { name: 'trailing zero', args: [[1, 0]], expected: 10 },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: 1517 },
        { name: 'all nines', args: [[9, 9, 9]], expected: 198 },
        { name: 'empty tree', args: [[]], expected: 0 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Building a number digit by digit = `n * 10 + d`, passed down.',
    },
    {
      id: 'trees-max-path-sum',
      title: 'Maximum path sum (stretch)',
      difficulty: 'hard',
      leetcode: 124,
      pattern: 'Return info up',
      statement:
        '**Stretch problem.** A path is any chain of connected nodes, each used at most once. It does not have to touch the root or a leaf, and it can bend at one node (go up one side, down the other). Values can be negative. Return the largest possible sum of a non-empty path.',
      examples: [
        { input: 'root = [1,2,3]', output: '6', explain: 'The path 2 → 1 → 3.' },
        { input: 'root = [-10,9,20,null,null,15,7]', output: '42', explain: '15 → 20 → 7. Including -10 would only lower it.' },
        { input: 'root = [-3]', output: '-3', explain: 'The path must have at least one node.' },
      ],
      constraints: ['1 ≤ number of nodes ≤ 3 × 10⁴', '-1000 ≤ node value ≤ 1000'],
      hints: [
        'This is the diameter problem from lesson 3, with values instead of edge counts.',
        'A parent can only extend a path that goes straight down one side. Return the best such "arm": `node.val + max(leftArm, rightArm)`.',
        'An arm with a negative sum hurts. Treat it as 0: `max(0, arm)`.',
        'At each node, record `node.val + leftArm + rightArm` as a candidate. Start `best` at `-Infinity`, not 0.',
      ],
      approaches: [
        {
          name: 'Try every bend point, recompute arms',
          idea: 'For each node, compute the best downward arm on each side with a fresh DFS and add them. Correct, but the same arms are recomputed for every ancestor.',
          time: 'O(n²)',
          space: 'O(h)',
        },
        {
          name: 'Return the best arm, record the bend',
          idea: 'Two different things again. The parent needs one straight arm (it cannot use both of your sides). The answer needs the best path bending here, which can use both. Dropping negative arms means "do not extend that way".',
          pseudo: `function maxPathSum(root):
    best ← -infinity
    function arm(node):
        if node = null: return 0
        left ← max(0, arm(node.left))       // skip a side that hurts
        right ← max(0, arm(node.right))
        best ← max(best, node.val + left + right)  // path bending here
        return node.val + max(left, right)         // one straight arm up
    arm(root)
    return best`,
          code: `function maxPathSum(root) {
  let best = -Infinity;
  const arm = (node) => {
    if (!node) return 0;
    const left = Math.max(0, arm(node.left));
    const right = Math.max(0, arm(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  };
  arm(root);
  return best;
}`,
          time: 'O(n)',
          space: 'O(h)',
        },
      ],
      fn: 'maxPathSum',
      starter: `function maxPathSum(root) {
  // best sum of any connected path (it may bend once)
  return 0;
}`,
      solution: `function maxPathSum(root) {
  let best = -Infinity;
  const arm = (node) => {
    if (!node) return 0;
    const left = Math.max(0, arm(node.left));
    const right = Math.max(0, arm(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  };
  arm(root);
  return best;
}`,
      tests: [
        { name: 'small tree', args: [[1, 2, 3]], expected: 6 },
        { name: 'skip a negative root', args: [[-10, 9, 20, null, null, 15, 7]], expected: 42 },
        { name: 'single negative', args: [[-3]], expected: -3 },
        { name: 'drop a negative child', args: [[2, -1]], expected: 2 },
        { name: 'all negative', args: [[-2, -1]], expected: -1 },
        { name: 'all negative, three', args: [[-1, -2, -3]], expected: -1 },
        { name: 'bigger tree', args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expected: 48 },
        { name: 'lesson tree', args: [[1, 2, 3, 4, 5, null, 6, null, null, 7]], expected: 24 },
        { name: 'negative in the middle', args: [[1, -2, 3]], expected: 4 },
      ],
      shapes: { args: ['tree'] },
      takeaway: 'Bending paths: return one arm, record both arms. Clamp negative arms to 0.',
    },
  ],
  quiz: [
    {
      prompt: 'Why must the "remaining = 0" check happen only at a leaf?',
      options: [
        'Leaves are faster to check',
        'A root-to-leaf path must end at a leaf, and later negative values can change the sum',
        'Because inner nodes have no value',
        'It does not matter where you check',
      ],
      answer: 1,
      explanation: 'The task asks for root-to-leaf paths. Stopping at an inner node gives a path that does not reach a leaf.',
    },
    {
      prompt: 'You push `path` (not a copy) into the result. What do you see at the end?',
      options: ['The right answers', 'Empty arrays', 'Only the last path', 'An error'],
      answer: 1,
      explanation: 'Every saved entry is the same shared array, and after all the pops it is empty.',
    },
    {
      prompt: 'In maximum path sum, why does a node return only `val + max(left, right)` to its parent?',
      options: [
        'To save memory',
        'A path through the parent can only continue down one side of this node',
        'Because the right side is always smaller',
        'It should return `val + left + right`',
      ],
      answer: 1,
      explanation: 'If the path came from the parent and used both of your sides, it would visit you and branch twice, which is not a path.',
    },
  ],
  takeaways: [
    'Root-to-leaf: pass state down (remaining target, number so far, current path).',
    'Use one shared path with push/pop; copy it only when you save an answer.',
    'Paths that bend anywhere: return one arm up, record both arms at the bend.',
  ],
};

export default lesson;
