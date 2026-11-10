import type { Series, TreeNode } from '../types';

// /dsa/reels module 9. One reel per lesson of src/dsa/modules/09-backtracking*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

// ---------------------------------------------------------------------------
// Lesson 1: subsets. The dry run walks the take/skip tree for [1, 2].
// ---------------------------------------------------------------------------

/**
 * The take/skip tree for [1, 2]. Left = take, right = skip. Unseen nodes are dim; every leaf
 * you reach is a saved subset. (Tree node `tone` doesn't show yet, so the caption says "saved".)
 */
function subsetTree(active: string | undefined, seen: string[]): TreeNode {
  const node = (id: string, label: string, children?: TreeNode[]): TreeNode => ({
    id,
    label,
    active: id === active,
    dim: !seen.includes(id),
    children,
  });
  return node('r', 'start', [
    node('t1', '[1]', [node('t1t2', '[1,2]'), node('t1s2', '[1]')]),
    node('s1', '[ ]', [node('s1t2', '[2]'), node('s1s2', '[ ]')]),
  ]);
}

const SUBSET_TREE_TITLE = 'Take or skip, for [1, 2]';

// Lesson 2: combination sum. The dry run walks the sorted coins with a start index.
const COINS = [2, 3, 6, 7];
const COIN_RUN = 'Sorted coins, target 7';

// Lesson 3: permutations. The dry run follows the lesson's used[] frames on [1, 2, 3].
const PERM_RUN = 'used[ ] on [1, 2, 3]';
const PERMS = [
  [1, 2, 3],
  [1, 3, 2],
  [2, 1, 3],
  [2, 3, 1],
  [3, 1, 2],
  [3, 2, 1],
];

// Lesson 4: palindrome cuts. The window is the piece being tried.
const WORD = ['a', 'a', 'b'];
const CUT_RUN = "Cutting 'aab'";

// Lesson 5: word search on the lesson's board.
const BOARD = [
  ['A', 'B', 'C', 'E'],
  ['S', 'F', 'C', 'S'],
  ['A', 'D', 'E', 'E'],
];
const WORD_RUN = "Searching 'ABCCED'";
type Pos = [number, number];
const ABCCED: Pos[] = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1]];

// Lesson 6: N-Queens on a 4 × 4 board. Empty squares are '' cells.
const QUEEN_RUN = 'Row by row, n = 4';
/** A 4 × 4 board: 'Q' on each queen, '×' on each square just found attacked. */
function board(queens: Pos[], attacked: Pos[] = []): string[][] {
  const has = (list: Pos[], r: number, c: number) => list.some(([lr, lc]) => lr === r && lc === c);
  return [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (has(queens, r, c) ? 'Q' : has(attacked, r, c) ? '×' : '')));
}
const rowOf = (r: number): Pos[] => [0, 1, 2, 3].map((c): Pos => [r, c]);

export const series: Series = {
  id: 'dsa-backtracking',
  title: 'Backtracking',
  emoji: '🧩',
  color: '#e879f9',
  order: 9,
  blurb: 'Choose, explore, un-choose: subsets, permutations, and search with pruning.',
  reels: [
    {
      id: 'dsa-backtracking-subsets-template',
      title: 'Subsets: choose, explore, un-choose',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/subsets-template/backtracking-subsets' },
      beats: [
        {
          say: 'Three pizza toppings. How many different pizzas can you make?',
          emphasis: ['pizzas'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 1', title: 'How many *pizzas*?', emoji: '🍕', style: 'slam' },
        },
        {
          say: 'Call the toppings one, two and three. Each one is on or off, so you get eight pizzas.',
          emphasis: ['on', 'off', 'eight'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'All 8 subsets of [1, 2, 3]',
            colLabels: ['1', '2', '3'],
            cells: [
              ['', '', ''],
              [1, '', ''],
              ['', 2, ''],
              ['', '', 3],
              [1, 2, ''],
              [1, '', 3],
              ['', 2, 3],
              [1, 2, 3],
            ],
            found: [[1, 0], [2, 1], [3, 2], [4, 0], [4, 1], [5, 0], [5, 2], [6, 1], [6, 2], [7, 0], [7, 1], [7, 2]],
            caption: 'the empty top row is a plain pizza',
          },
        },
        {
          say: 'One loop trick works. Start with the empty set, then for each number, copy every set and add the number.',
          emphasis: ['copy', 'every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function subsets(nums):
    result ← [[]]
    for each x in nums:
        for each s in result so far:
            append (s plus x) to result
    return result`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'the list doubles each time', tone: 'warn' },
          },
        },
        {
          say: 'Twenty items make about a million sets, and the trick builds every one before it checks any.',
          emphasis: ['million', 'every'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'subsets of just *20* items',
            sub: 'it can never stop a bad set early',
            tone: 'warn',
          },
        },
        {
          say: 'Better: walk the items one at a time, and for each one decide. Take it, or skip it.',
          emphasis: ['take', 'skip'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Take it, or *skip* it', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Keep it small, just one and two. Take the one: push it onto the path, and go down.',
          emphasis: ['push'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: SUBSET_TREE_TITLE,
            root: subsetTree('t1', ['r', 't1']),
            caption: 'choose: push 1, path is [1]',
          },
        },
        {
          say: 'Take the two as well. Both items are decided, so save a copy: one, two.',
          emphasis: ['save', 'copy'],
          scene: {
            type: 'tree',
            title: SUBSET_TREE_TITLE,
            root: subsetTree('t1t2', ['r', 't1', 't1t2']),
            caption: 'saved [1,2]',
          },
        },
        {
          say: 'Now back up. Pop the two, try skipping it, and save one on its own.',
          emphasis: ['pop', 'skipping'],
          scene: {
            type: 'tree',
            title: SUBSET_TREE_TITLE,
            root: subsetTree('t1s2', ['r', 't1', 't1t2', 't1s2']),
            caption: 'un-choose: pop 2, then saved [1]',
          },
        },
        {
          say: 'Back up again. Pop the one and skip it. The path is empty, just like at the start.',
          emphasis: ['empty'],
          scene: {
            type: 'tree',
            title: SUBSET_TREE_TITLE,
            root: subsetTree('s1', ['r', 't1', 't1t2', 't1s2', 's1']),
            caption: 'pop 1: the path is [ ] again',
          },
        },
        {
          say: 'The same moves on this side give two, and the empty set. Four leaves, four subsets.',
          emphasis: ['four'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: SUBSET_TREE_TITLE,
            root: subsetTree(undefined, ['r', 't1', 't1t2', 't1s2', 's1', 's1t2', 's1s2']),
            caption: '4 leaves, 4 subsets',
          },
        },
        {
          say: 'In JavaScript it is push, recurse, pop, then recurse again without it. That is choose, explore, un-choose.',
          emphasis: ['choose', 'explore', 'un-choose'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'subsets.js',
            code: `function go(i) {
  if (i === nums.length) {
    result.push([...path]);
    return;
  }
  path.push(nums[i]); // choose
  go(i + 1);          // explore
  path.pop();         // un-choose
  go(i + 1);          // skip it
}`,
            highlight: [[6, 9]],
            note: { line: 9, text: '2ⁿ subsets: O(n · 2ⁿ)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a problem wants all the ways, order does not matter, and n is twenty or less.',
          emphasis: ['all', 'twenty'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It asks for *all* the ways', icon: '📋' },
              { text: 'Order inside does not matter', icon: '🔀' },
              { text: 'n is small: *20* or less', icon: '🤏' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap is saving path itself. It is one shared array, so at the end every saved set is empty.',
          emphasis: ['shared', 'empty'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `if (i === nums.length) {
  result.push(path);
  return;
}`,
            errors: [2],
            note: { line: 2, text: 'saves the same array: [[], []…]', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. How many subsets do five different items have?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'How many subsets do 5 different items have?',
            options: ['10', '25', '32', '120'],
            answer: 2,
          },
        },
        {
          say: 'Thirty two. Each of the five items is in or out, so you double five times.',
          emphasis: ['double'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'How many subsets do 5 different items have?',
            options: ['10', '25', '32', '120'],
            answer: 2,
            reveal: true,
            explain: '2 × 2 × 2 × 2 × 2 = 32, and that counts [ ].',
          },
        },
        {
          say: 'Remember this. Choose, explore, un-choose, and always save a copy. Now tap solve it and try it yourself.',
          emphasis: ['un-choose', 'copy'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Choose, explore, *un-choose*', 'Save a *copy*, never path', 'n ≤ 20 means 2ⁿ is fine'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-backtracking-combinations',
      title: 'Combinations and combination sum',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/combinations/backtracking-combination-sum' },
      beats: [
        {
          say: 'A snack costs seven. Which bags of coins pay exactly seven?',
          emphasis: ['exactly'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 2', title: 'Which coins make *7*?', emoji: '🪙', style: 'slam' },
        },
        {
          say: 'The coins are two, three, six and seven, and you can reuse any coin. Two, two, three works, and so does seven.',
          emphasis: ['reuse', 'seven'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Coins, target 7',
            cells: COINS,
            found: [0, 1, 3],
            vars: { 'bag 1': '2 + 2 + 3', 'bag 2': '7' },
            caption: 'a bag does not care about order',
          },
        },
        {
          say: 'The easy way adds any coin, in any order, then throws the repeats into a set at the end.',
          emphasis: ['any', 'order'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function go(total):
    if total = target:
        add sorted path to seen
        return
    if total > target: return
    for each c in candidates:
        push c onto path
        go(total + c)
        pop from path`,
            highlight: [6],
            note: { line: 6, text: 'any coin, in any order', tone: 'warn' },
          },
        },
        {
          say: 'So one bag gets built three times: two two three, two three two, and three two two.',
          emphasis: ['three', 'times'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '3',
            unit: 'times',
            label: 'the *same* bag gets built',
            sub: '2+2+3, then 2+3+2, then 3+2+2',
            tone: 'bad',
          },
        },
        {
          say: 'Line the coins up, and only pick from where you are, or to the right. Never go back.',
          emphasis: ['right', 'back'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Only move *forward*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Sort the coins first. Take a two, then another two. The total is four.',
          emphasis: ['sort', 'four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: COIN_RUN,
            cells: COINS,
            pointers: { start: 0, i: 0 },
            active: [0],
            vars: { path: '[2, 2]', total: 4 },
          },
        },
        {
          say: 'A third two makes six. One more two is eight, too big. The coins are sorted, so the rest are too. Break.',
          emphasis: ['break'],
          scene: {
            type: 'array',
            title: COIN_RUN,
            cells: COINS,
            pointers: { start: 0, i: 0 },
            active: [0],
            done: [1, 2, 3],
            vars: { path: '[2, 2, 2]', total: '6 + 2 > 7' },
            caption: 'too big: the rest are bigger',
          },
        },
        {
          say: 'Back up to two, two, and try a three. That is exactly seven, so save it.',
          emphasis: ['seven', 'save'],
          scene: {
            type: 'array',
            title: COIN_RUN,
            cells: COINS,
            pointers: { start: 0, i: 1 },
            found: [0, 1],
            vars: { path: '[2, 2, 3]', total: 7 },
            caption: 'saved [2, 2, 3]',
          },
        },
        {
          say: 'Now start a bag with three. The two is behind the start, so three, two, two can never be built.',
          emphasis: ['behind', 'never'],
          scene: {
            type: 'array',
            title: COIN_RUN,
            cells: COINS,
            pointers: { start: 1, i: 1 },
            active: [1],
            done: [0],
            vars: { path: '[3]', total: 3 },
            caption: '2 is behind the start: off limits',
          },
        },
        {
          say: 'Last, seven on its own hits seven. Two bags, and each one was built exactly once.',
          emphasis: ['once'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: COIN_RUN,
            cells: COINS,
            pointers: { start: 3, i: 3 },
            found: [3],
            done: [0, 1, 2],
            vars: { path: '[7]', total: 7 },
            caption: 'saved [7]: two bags in all',
          },
        },
        {
          say: 'In code, the loop begins at start, and the call passes the same i, so that coin can be picked again.',
          emphasis: ['start', 'same'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'combinationSum.js',
            code: `function go(start, total) {
  if (total === target) {
    result.push([...path]);
    return;
  }
  for (let i = start; i < n; i++) {
    if (total + c[i] > target) break;
    path.push(c[i]);
    go(i, total + c[i]); // i: reuse
    path.pop();
  }
}`,
            highlight: [6, 9],
            note: { line: 12, text: 'each bag built once, in order', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when it says combination or group. Reuse a coin with i, or use it once with i plus one.',
          emphasis: ['combination', 'group'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It says *combination* or group', icon: '🧺' },
              { text: 'Order inside does not matter', icon: '🔀' },
              { text: 'Reuse: go(i). Once: go(i + 1)', icon: '🔁' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: break without sorting. A big coin up front stops the loop before a small coin that still fits.',
          emphasis: ['sorting'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const c = [7, 2, 3]; // not sorted!
// total is 5, target is 7
if (total + c[i] > target) break;`,
            errors: [3],
            note: { line: 3, text: 'stops on 7, so 2 is never tried', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Reuse is allowed. After you pick coin i, which call comes next?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Reuse is allowed. After you pick c[i], which call comes next?',
            options: ['go(i + 1, …)', 'go(i, …)', 'go(start + 1, …)', 'go(0, …)'],
            answer: 1,
          },
        },
        {
          say: 'Go with the same i. You can pick that coin again, but never a coin to its left.',
          emphasis: ['same', 'left'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Reuse is allowed. After you pick c[i], which call comes next?',
            options: ['go(i + 1, …)', 'go(i, …)', 'go(start + 1, …)', 'go(0, …)'],
            answer: 1,
            reveal: true,
            explain: 'Same i: pick it again, never anything to its left.',
          },
        },
        {
          say: 'Remember this. Only move forward, and sort so you can stop early. Now tap solve it and try it yourself.',
          emphasis: ['forward', 'sort'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A *start index* builds each bag once', 'Reuse: go(i). Once: go(i + 1)', 'Sort, then *break* early'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-backtracking-permutations',
      title: 'Permutations: when order matters',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/permutations/backtracking-permutations' },
      beats: [
        {
          say: 'Three friends, three car seats. How many ways can they sit?',
          emphasis: ['ways'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 3', title: 'Who sits *where*?', emoji: '🚗', style: 'slam' },
        },
        {
          say: 'Call them one, two and three. Now order matters, so one, two, three is not three, two, one. That makes six.',
          emphasis: ['order', 'six'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'All 6 orders of [1, 2, 3]',
            colLabels: ['1st', '2nd', '3rd'],
            cells: PERMS,
            found: [[0, 0], [0, 1], [0, 2], [5, 0], [5, 1], [5, 2]],
            caption: '3 × 2 × 1 = 6 line-ups',
          },
        },
        {
          say: 'The easy way fills every seat with anyone, then throws out line-ups with a repeat at the very end.',
          emphasis: ['end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function go():
    if length of path = n:
        if path has no repeats:
            save a copy of path
        return
    for each x in nums:
        push x onto path
        go()
        pop from path`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'repeats are caught too late', tone: 'warn' },
          },
        },
        {
          say: 'For eight friends, it builds about sixteen million line-ups, just to keep forty thousand.',
          emphasis: ['sixteen', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '16M',
            label: 'line-ups built for *8* friends',
            sub: 'only 40,320 of them are real',
            tone: 'bad',
          },
        },
        {
          say: 'Keep a used flag for every item, and skip anything that is already in the path.',
          emphasis: ['used', 'skip'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Check *before* you pick', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Seat one takes one, and marks it used. At seat two, one is used, so skip it and pick two.',
          emphasis: ['used', 'skip'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: PERM_RUN,
            cells: [1, 2, 3],
            pointers: { i: 1 },
            active: [1],
            done: [0],
            vars: { path: '[1, 2]', used: 'T T F' },
          },
        },
        {
          say: 'Seat three. Only three is left. The path is full, so save a copy.',
          emphasis: ['full', 'copy'],
          scene: {
            type: 'array',
            title: PERM_RUN,
            cells: [1, 2, 3],
            pointers: { i: 2 },
            found: [0, 1, 2],
            vars: { path: '[1, 2, 3]', used: 'T T T' },
            caption: 'saved [1, 2, 3]',
          },
        },
        {
          say: 'Back up. Pop three, pop two, and clear the flag on two. Now seat two tries three.',
          emphasis: ['clear', 'flag'],
          scene: {
            type: 'array',
            title: PERM_RUN,
            cells: [1, 2, 3],
            pointers: { i: 2 },
            active: [2],
            done: [0],
            vars: { path: '[1, 3]', used: 'T F T' },
            caption: 'un-choose: pop, and unmark',
          },
        },
        {
          say: 'Seat three. Only two is free, so take it. Save one, three, two.',
          emphasis: ['save'],
          scene: {
            type: 'array',
            title: PERM_RUN,
            cells: [1, 2, 3],
            pointers: { i: 1 },
            found: [0, 1, 2],
            vars: { path: '[1, 3, 2]', used: 'T T T' },
            caption: 'saved [1, 3, 2]',
          },
        },
        {
          say: 'Everything that starts with one is done. Unmark one, and seat one tries two. The same story repeats.',
          emphasis: ['repeats'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: PERM_RUN,
            cells: [1, 2, 3],
            pointers: { i: 1 },
            active: [1],
            vars: { path: '[2]', used: 'F T F' },
            caption: '2 answers so far, 4 to go',
          },
        },
        {
          say: 'In code, skip used items. When you back up, undo both: pop the path and clear the flag.',
          emphasis: ['both'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'permute.js',
            code: `function go() {
  if (path.length === n) {
    result.push([...path]);
    return;
  }
  for (let i = 0; i < n; i++) {
    if (used[i]) continue;
    used[i] = true;  // choose
    path.push(nums[i]);
    go();            // explore
    path.pop();      // un-choose
    used[i] = false;
  }
}`,
            highlight: [7, 12],
            note: { line: 12, text: 'n! orders: O(n · n!)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when it wants every order, so one, two and two, one both count, and n is ten or less.',
          emphasis: ['order', 'ten'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It wants every *order*', icon: '🔢' },
              { text: '[1, 2] and [2, 1] both count', icon: '↔️' },
              { text: 'n is tiny: *10* or less', icon: '🤏' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: you pop, but forget to clear the flag. After the first answer everything looks used, so you get just one.',
          emphasis: ['flag', 'one'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (let i = 0; i < n; i++) {
  if (used[i]) continue;
  used[i] = true;
  path.push(nums[i]);
  go();
  path.pop(); // no reset!
}`,
            errors: [6],
            note: { line: 6, text: 'flags stay true: only [1,2,3]', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why does this loop start at zero, and not at a start index?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Permutations: why does the loop start at 0?',
            options: ['It runs faster', 'Order matters: 1 can follow 3', 'To skip repeats', 'No real reason'],
            answer: 1,
          },
        },
        {
          say: 'Because order matters. Three, one and one, three are both answers, so every unused item stays open.',
          emphasis: ['order', 'open'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Permutations: why does the loop start at 0?',
            options: ['It runs faster', 'Order matters: 1 can follow 3', 'To skip repeats', 'No real reason'],
            answer: 1,
            reveal: true,
            explain: '[3, 1] and [1, 3] are both answers, so try every unused item.',
          },
        },
        {
          say: 'Remember this. Skip what is used, and undo everything when you back up. Now tap solve it and try it yourself.',
          emphasis: ['used', 'undo'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Loop over every item, skip *used*', 'Un-choose undoes *everything*', 'n! grows fast: n ≤ 10'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-backtracking-string-choices',
      title: 'Strings: phone keypads and cutting words',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/string-choices/backtracking-palindrome-partition' },
      beats: [
        {
          say: 'Old phones had three letters on each key. What can two keys spell?',
          emphasis: ['two', 'keys'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 4', title: 'What can *23* spell?', emoji: '📟', style: 'slam' },
        },
        {
          say: 'Key two gives a, b or c. Key three gives d, e or f. One choice per key makes nine pairs.',
          speak: 'Key two gives ay, bee or see. Key three gives dee, ee or eff. One choice per key makes nine pairs.',
          emphasis: ['one', 'choice', 'nine'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: "Keys '23': 3 × 3 = 9",
            rowLabels: ['a', 'b', 'c'],
            colLabels: ['d', 'e', 'f'],
            cells: [
              ['ad', 'ae', 'af'],
              ['bd', 'be', 'bf'],
              ['cd', 'ce', 'cf'],
            ],
            found: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
            caption: 'each step picks one letter',
          },
        },
        {
          say: 'Harder: cut a word so every piece is a palindrome, the same both ways. For a, a, b, there are two ways.',
          speak: 'Harder: cut a word so every piece is a palindrome, the same both ways. For ay, ay, bee, there are two ways.',
          emphasis: ['palindrome', 'two'],
          scene: {
            type: 'array',
            title: "Two ways to cut 'aab'",
            cells: WORD,
            found: [0, 1, 2],
            vars: { 'cut 1': 'a | a | b', 'cut 2': 'aa | b' },
            caption: "'ab' and 'aab' are not palindromes",
          },
        },
        {
          say: 'The easy way tries every possible cut, then checks the pieces only at the very end.',
          emphasis: ['every', 'end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function partition(s):
    for each way to cut s:
        if every piece is a palindrome:
            save the pieces`,
            highlight: [[2, 3]],
            note: { line: 3, text: '2ⁿ⁻¹ cuts, checked at the end', tone: 'warn' },
          },
        },
        {
          say: 'Instead, choose where the next piece ends, and check it right away. A bad piece kills its whole branch.',
          emphasis: ['next', 'piece'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Check each *piece* first', emoji: '💡', style: 'slam' },
        },
        {
          say: 'From the start, a on its own is a palindrome. Push it, and move on.',
          speak: 'From the start, ay on its own is a palindrome. Push it, and move on.',
          emphasis: ['push'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: CUT_RUN,
            cells: WORD,
            pointers: { start: 0, end: 0 },
            window: [0, 0],
            active: [0],
            vars: { piece: "'a' ✓", path: '[a]' },
          },
        },
        {
          say: 'Then a again, then b. We reach the end of the word, so save a, a, b.',
          speak: 'Then ay again, then bee. We reach the end of the word, so save ay, ay, bee.',
          emphasis: ['save'],
          scene: {
            type: 'array',
            title: CUT_RUN,
            cells: WORD,
            pointers: { start: 2, end: 2 },
            window: [2, 2],
            found: [0, 1, 2],
            vars: { piece: "'b' ✓", path: '[a, a, b]' },
            caption: 'saved [a, a, b]',
          },
        },
        {
          say: 'Back up and try a, b as one piece. Not a palindrome, so skip it. Nothing grows under it.',
          speak: 'Back up and try ay, bee as one piece. Not a palindrome, so skip it. Nothing grows under it.',
          emphasis: ['skip'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: CUT_RUN,
            cells: WORD,
            pointers: { start: 1, end: 2 },
            window: [1, 2],
            active: [1, 2],
            done: [0],
            vars: { piece: "'ab' ✗", path: '[a]' },
            caption: 'bad piece: the branch is cut',
          },
        },
        {
          say: 'Back at the start, try a, a. It reads the same both ways, so push it.',
          speak: 'Back at the start, try ay, ay. It reads the same both ways, so push it.',
          emphasis: ['push'],
          scene: {
            type: 'array',
            title: CUT_RUN,
            cells: WORD,
            pointers: { start: 0, end: 1 },
            window: [0, 1],
            active: [0, 1],
            vars: { piece: "'aa' ✓", path: '[aa]' },
          },
        },
        {
          say: 'Then b finishes the word. Save a a, b. Two answers, and no bad cut was ever finished.',
          speak: 'Then bee finishes the word. Save ay ay, bee. Two answers, and no bad cut was ever finished.',
          emphasis: ['two', 'answers'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: CUT_RUN,
            cells: WORD,
            pointers: { start: 2, end: 2 },
            window: [2, 2],
            found: [0, 1, 2],
            vars: { piece: "'b' ✓", path: '[aa, b]' },
            caption: 'saved [aa, b]',
          },
        },
        {
          say: 'In code, the loop tries every end. Check the piece first, and skip it if it is not a palindrome.',
          emphasis: ['first', 'skip'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'partition.js',
            code: `function go(start) {
  if (start === s.length) {
    result.push([...path]);
    return;
  }
  for (let e = start; e < n; e++) {
    if (!isPal(start, e)) continue;
    path.push(s.slice(start, e + 1));
    go(e + 1);
    path.pop();
  }
}`,
            highlight: [7],
            note: { line: 12, text: 'prune early: O(n · 2ⁿ) worst', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when each step builds a string one letter at a time, or cuts off the next piece.',
          emphasis: ['letter', 'piece'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Build a string *letter* by letter', icon: '🔤' },
              { text: 'Cut a string into valid *pieces*', icon: '✂️' },
              { text: 'Check each piece before going on', icon: '🔍' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: slice leaves out its end index. To keep the last letter of the piece, add one.',
          emphasis: ['slice', 'one'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// the piece is s[start] to s[e]
path.push(s.slice(start, e));
path.push(s.slice(start, e + 1));`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'slice stops before its end', tone: 'good' },
          },
        },
        {
          say: 'Quick check. Key seven has four letters, and so does key nine. How many pairs can they spell?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Key 7 is pqrs and key 9 is wxyz. How many pairs for 79?',
            options: ['8', '9', '12', '16'],
            answer: 3,
          },
        },
        {
          say: 'Sixteen. Four choices for the first key, times four for the second.',
          emphasis: ['sixteen'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Key 7 is pqrs and key 9 is wxyz. How many pairs for 79?',
            options: ['8', '9', '12', '16'],
            answer: 3,
            reveal: true,
            explain: '4 letters × 4 letters = 16 pairs.',
          },
        },
        {
          say: 'Remember this. Ask what one step decides, and check a piece before you go deeper. Now tap solve it and try it yourself.',
          emphasis: ['decides', 'check'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Ask what *one step* decides', 'Check a piece *before* going on', 'slice(start, end + 1)'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-backtracking-grid-search',
      title: 'Grid search: mark, explore, unmark',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/grid-search/backtracking-word-search' },
      beats: [
        {
          say: 'Boggle: trace a word through touching letters, never using one twice.',
          emphasis: ['twice'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 5', title: 'Find the word in the *grid*', emoji: '🔠', style: 'slam' },
        },
        {
          say: 'Can you spell A B C C E D here? Move up, down, left or right, and use each cell once.',
          speak: 'Can you spell ay bee see see ee dee here? Move up, down, left or right, and use each cell once.',
          emphasis: ['once'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: "Find 'ABCCED'",
            cells: BOARD,
            found: ABCCED,
            vars: { word: 'ABCCED', found: 'yes' },
            caption: 'no diagonals, no cell twice',
          },
        },
        {
          say: 'The easy way grows every path the length of the word, from every cell, and compares at the end.',
          emphasis: ['every', 'end'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function exist(board, word):
    for each start cell:
        for each path of L cells:
            if path spells word: return true
    return false`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'about 4 × 3ᴸ paths per cell', tone: 'warn' },
          },
        },
        {
          say: 'Walk and compare at the same time. A wrong letter means back up at once, and mark the cells you use.',
          emphasis: ['wrong', 'mark'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Wrong letter? *Back up*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start at the top left. It holds A, the first letter, so mark it as part of the path.',
          speak: 'Start at the top left. It holds ay, the first letter, so mark it as part of the path.',
          emphasis: ['mark'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            active: [[0, 0]],
            vars: { need: 'A', path: 'A' },
            caption: 'match: mark it',
          },
        },
        {
          say: 'Down is S, but we need B. Wrong letter, so back up right away.',
          speak: 'Down is ess, but we need bee. Wrong letter, so back up right away.',
          emphasis: ['back', 'up'],
          sfx: 'error',
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            active: [[1, 0]],
            found: [[0, 0]],
            vars: { need: 'B', path: 'A' },
            caption: 'S is not B: back up',
          },
        },
        {
          say: 'Right is B, then C, then down to another C. Each one matches, so each gets marked.',
          speak: 'Right is bee, then see, then down to another see. Each one matches, so each gets marked.',
          emphasis: ['matches'],
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            active: [[1, 2]],
            found: [[0, 0], [0, 1], [0, 2]],
            vars: { need: 'C', path: 'ABCC' },
            caption: 'four letters, four marks',
          },
        },
        {
          say: 'Down to E. Going back up hits a marked cell, so it is skipped. That is why we mark.',
          speak: 'Down to ee. Going back up hits a marked cell, so it is skipped. That is why we mark.',
          emphasis: ['marked', 'skipped'],
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            active: [[2, 2]],
            found: [[0, 0], [0, 1], [0, 2], [1, 2]],
            vars: { need: 'E', path: 'ABCCE' },
            caption: 'up is on the path: skip it',
          },
        },
        {
          say: 'Right of it is another E, but we need D. Wrong again, back up.',
          speak: 'Right of it is another ee, but we need dee. Wrong again, back up.',
          emphasis: ['wrong'],
          sfx: 'error',
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            active: [[2, 3]],
            found: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
            vars: { need: 'D', path: 'ABCCE' },
            caption: 'E is not D: back up',
          },
        },
        {
          say: 'Left of it is D, the last letter. The whole word is found, in just ten steps.',
          speak: 'Left of it is dee, the last letter. The whole word is found, in just ten steps.',
          emphasis: ['found'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: WORD_RUN,
            cells: BOARD,
            found: ABCCED,
            vars: { need: 'done', path: 'ABCCED' },
            caption: 'every letter matched in order',
          },
        },
        {
          say: 'In code: mark the cell, try all four neighbours, then put the letter back on the way out.',
          emphasis: ['mark', 'back'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'exist.js',
            code: `function dfs(r, c, k) {
  if (k === word.length) return true;
  if (board[r]?.[c] !== word[k])
    return false; // no match
  board[r][c] = '#';     // mark
  const found =
    dfs(r + 1, c, k + 1) ||
    dfs(r - 1, c, k + 1) ||
    dfs(r, c + 1, k + 1) ||
    dfs(r, c - 1, k + 1);
  board[r][c] = word[k]; // restore
  return found;
}`,
            highlight: [5, 11],
            note: { line: 13, text: 'lend the cell back to others', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you need a path through a grid, and each cell can be used once per path.',
          emphasis: ['path', 'once'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Find a *path* in a grid', icon: '🗺️' },
              { text: 'Each cell once per path', icon: '1️⃣' },
              { text: 'Mark, explore, then *unmark*', icon: '↩️' },
            ],
            active: 2,
          },
        },
        {
          say: 'The trap: returning before you restore. In problems that keep searching, that cell stays blocked for every later path.',
          emphasis: ['restore', 'blocked'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `board[r][c] = '#';
if (dfs(r + 1, c, k + 1)) return true;
// ...the other three
board[r][c] = word[k];`,
            errors: [2],
            note: { line: 2, text: 'leaves the # behind', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why do we restore a cell after exploring from it?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why do we restore a cell after exploring from it?',
            options: ['Saves memory', 'Another path may need it', 'Stops endless loops', 'Input must not change'],
            answer: 1,
          },
        },
        {
          say: 'Another path may need it. The mark only means on this path, right now.',
          emphasis: ['this', 'path'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why do we restore a cell after exploring from it?',
            options: ['Saves memory', 'Another path may need it', 'Stops endless loops', 'Input must not change'],
            answer: 1,
            reveal: true,
            explain: 'A mark means "on this path". Other paths may need the cell.',
          },
        },
        {
          say: 'Remember this. Mark, explore, unmark, and stop at the first wrong letter. Now tap solve it and try it yourself.',
          emphasis: ['unmark', 'first'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Mark, explore, *unmark*', 'Stop at the *first* wrong letter', 'Paths share cells: *restore*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-backtracking-pruning-n-queens',
      title: 'Pruning: N-Queens and failing fast',
      link: { label: 'Solve it', href: '/dsa#/m/backtracking/pruning-n-queens/backtracking-n-queens' },
      beats: [
        {
          say: 'Sudoku apps solve hard puzzles in a blink. They never try every board.',
          emphasis: ['blink', 'never'],
          scene: { type: 'title', kicker: 'Backtracking · Lesson 6', title: 'Fail *fast*, solve fast', emoji: '👑', style: 'slam' },
        },
        {
          say: 'Put four queens on a four by four board, so no two share a row, a column, or a diagonal.',
          emphasis: ['row', 'column', 'diagonal'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: '4 queens, no attacks',
            cells: board([[0, 1], [1, 3], [2, 0], [3, 2]]),
            found: [[0, 1], [1, 3], [2, 0], [3, 2]],
            caption: 'one of the only 2 answers',
          },
        },
        {
          say: 'The easy way puts one queen in every row, and checks only once the board is full.',
          emphasis: ['full'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function place(row):
    if row = n:
        if board is valid: save it
        return
    for col from 0 to n - 1:
        put a queen at (row, col)
        place(row + 1)
        remove it`,
            highlight: [[2, 3]],
            note: { line: 3, text: '8 queens: 16.7M full boards', tone: 'warn' },
          },
        },
        {
          say: 'Instead, check each queen the moment you place it. If it is attacked, skip that square.',
          emphasis: ['moment'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Check on *placement*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'The trick: along one diagonal, row plus column never changes. The other way, row minus column stays the same.',
          emphasis: ['plus', 'minus'],
          scene: {
            type: 'grid',
            title: 'Diagonal ids: row + col',
            rowLabels: ['r0', 'r1', 'r2', 'r3'],
            colLabels: ['c0', 'c1', 'c2', 'c3'],
            cells: [
              [0, 1, 2, 3],
              [1, 2, 3, 4],
              [2, 3, 4, 5],
              [3, 4, 5, 6],
            ],
            found: [[0, 3], [1, 2], [2, 1], [3, 0]],
            caption: 'one number names one diagonal',
          },
        },
        {
          say: 'Row zero: put a queen in column zero, and record its column and both diagonals.',
          emphasis: ['record'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 0]]),
            active: [[0, 0]],
            vars: { cols: '0', 'r-c': '0', 'r+c': '0' },
          },
        },
        {
          say: 'Row one: column zero is taken, and column one is on a diagonal. Column two is safe.',
          emphasis: ['safe'],
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 0], [1, 2]], [[1, 0], [1, 1]]),
            active: [[1, 2]],
            vars: { cols: '0,2', 'r-c': '0,-1', 'r+c': '0,3' },
          },
        },
        {
          say: 'Row two: every square is attacked. Dead end, so back up right away.',
          emphasis: ['dead', 'end'],
          sfx: 'error',
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 0], [1, 2]], rowOf(2)),
            done: rowOf(2),
            vars: { cols: '0,2', 'r-c': '0,-1', 'r+c': '0,3' },
            caption: 'row 2 has no safe square',
          },
        },
        {
          say: 'Undo that queen, and move it to column three. Its sets change with it.',
          emphasis: ['undo'],
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 0], [1, 3]]),
            active: [[1, 3]],
            vars: { cols: '0,3', 'r-c': '0,-2', 'r+c': '0,4' },
          },
        },
        {
          say: 'Row two fits in column one, but row three has no safe square. Back up again.',
          emphasis: ['again'],
          sfx: 'error',
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 0], [1, 3], [2, 1]], [[2, 0], ...rowOf(3)]),
            done: rowOf(3),
            vars: { cols: '0,3,1', 'r-c': '0,-2,1', 'r+c': '0,4,3' },
            caption: 'row 3 has no safe square',
          },
        },
        {
          say: 'So move the first queen to column one. Then three, zero and two all fit. Save the board.',
          emphasis: ['save'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: QUEEN_RUN,
            cells: board([[0, 1], [1, 3], [2, 0], [3, 2]]),
            found: [[0, 1], [1, 3], [2, 0], [3, 2]],
            vars: { cols: '1,3,0,2', 'r-c': '-1,-2,2,1', 'r+c': '1,4,2,5' },
            caption: 'saved: one of the 2 answers',
          },
        },
        {
          say: 'In code, one check before each queen: three set lookups. Then mark, go to the next row, and unmark.',
          emphasis: ['three', 'lookups'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'nQueens.js',
            code: `function place(row) {
  if (row === n) return save();
  for (let c = 0; c < n; c++) {
    if (attacked(row, c)) continue;
    mark(row, c);    // choose
    place(row + 1);  // explore
    unmark(row, c);  // un-choose
  }
}
function attacked(r, c) {
  return cols.has(c) ||
    d1.has(r - c) || d2.has(r + c);
}`,
            highlight: [4, [11, 12]],
            note: { line: 12, text: 'three O(1) checks', tone: 'good' },
          },
        },
        {
          say: 'The trap: row minus column can be negative. A set does not mind, but an array index does, so shift it.',
          emphasis: ['negative', 'shift'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const d1 = Array(2 * n - 1).fill(0);
d1[row - col] = 1;         // -3?!
d1[row - col + n - 1] = 1; // 0 to 6`,
            errors: [2],
            added: [3],
            note: { line: 3, text: 'shift by n - 1: never negative', tone: 'good' },
          },
        },
        {
          say: 'Quick check. Row two, column zero, and row zero, column two share a diagonal. Which one?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '(2,0) and (0,2) share a diagonal. Which kind?',
            options: ['Same row - col', 'Same row + col', 'Neither', 'Both'],
            answer: 1,
          },
        },
        {
          say: 'Row plus column. Both add up to two, but row minus column gives two and minus two.',
          emphasis: ['plus'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '(2,0) and (0,2) share a diagonal. Which kind?',
            options: ['Same row - col', 'Same row + col', 'Neither', 'Both'],
            answer: 1,
            reveal: true,
            explain: '2 + 0 = 0 + 2 = 2. Their row - col are 2 and -2.',
          },
        },
        {
          say: 'Remember this. Check the rules the moment you place, and back up as soon as one breaks. Now tap solve it and try it yourself.',
          emphasis: ['moment', 'back'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['*Check* the rules as you place', 'Sets make each check *O(1)*', 'Fail fast: back up at once'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
