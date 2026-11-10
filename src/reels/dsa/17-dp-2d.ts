import type { Series } from '../types';

// /dsa/reels module 17. One reel per lesson of src/dsa/modules/17-dp-2d*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

// Lesson 1: unique paths on a 3 × 4 map.
const pathRows = ['0', '1', '2'];
const pathCols = ['0', '1', '2', '3'];
const pathTitle = 'Routes to each cell';

// Lesson 2: LCS of "abcde" and "ace".
const lcsRows = ['""', 'a', 'b', 'c', 'd', 'e'];
const lcsCols = ['""', 'a', 'c', 'e'];
const lcsTitle = '"abcde" vs "ace"';

// Lesson 3: snacks (1 kg, 15), camera (3 kg, 20), tent (4 kg, 30), 4 kg of room.
const packRows = ['none', 'snacks', 'camera', 'tent'];
const packCols = ['0', '1', '2', '3', '4'];
const packTitle = 'Best score for each kg';

// Lesson 4: isPal[i][j] for "babad". ✓ = palindrome, ✗ = not.
const palLetters = ['b', 'a', 'b', 'a', 'd'];
const palTitle = 'Is s[i..j] a palindrome?';
// The bottom-left half is never used: a piece can't end before it starts.
const palLower: [number, number][] = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [4, 3]];

// Lesson 5: stock with cooldown, prices [1, 2, 3, 0, 2].
const stockRows = ['$1', '$2', '$3', '$0', '$2'];
const stockCols = ['held', 'sold', 'rest'];
const stockTitle = 'Most money in each mode';

export const series: Series = {
  id: 'dsa-dp-2d',
  title: 'Dynamic programming II',
  emoji: '🧮',
  color: '#f472b6',
  order: 17,
  blurb: 'Grids, two strings, knapsack: 2D states without the fear.',
  reels: [
    // ───────────────────────────── Lesson 1: grid DP ─────────────────────────────
    {
      id: 'dsa-dp-2d-grid-dp',
      title: 'Grid DP: counting routes on a map',
      link: { label: 'Solve it', href: '/dsa#/m/dp-2d/grid-dp/dp-2d-unique-paths' },
      beats: [
        {
          say: 'A robot drives only right or down. How many routes are there?',
          emphasis: ['routes'],
          scene: { type: 'title', kicker: 'Grid DP · Lesson 1', title: 'How many *routes*?', emoji: '🤖', style: 'slam' },
        },
        {
          say: 'Start at the top left and finish at the bottom right. On this small map, there are ten routes.',
          emphasis: ['ten'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'A map, 3 rows by 4 columns',
            cells: [
              ['S', '', '', ''],
              ['', '', '', ''],
              ['', '', '', 'E'],
            ],
            active: [[0, 0]],
            found: [[2, 3]],
            vars: { moves: 'right or down', routes: 10 },
          },
        },
        {
          say: 'Every route into a cell came from above or from the left. The easy way asks both, again and again.',
          emphasis: ['above', 'left'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function ways(r, c):
    if r = 0 or c = 0:
        return 1        // along an edge
    up ← ways(r - 1, c)
    left ← ways(r, c - 1)
    return up + left`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'every call splits in two', tone: 'warn' },
          },
        },
        {
          say: 'Each call splits in two. A fifteen by fifteen map makes over forty million calls, for just two hundred twenty five cells.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '40M',
            label: 'calls for a *15 by 15* map',
            sub: 'but only 225 different cells',
            tone: 'bad',
          },
        },
        {
          say: 'A cell’s answer never changes. So work it out once, and write it in a table.',
          emphasis: ['once', 'table'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'One answer per *cell*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Fill the edges first. Along the top row or the left column, there’s only one straight route.',
          emphasis: ['edges', 'one'],
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, '', '', ''],
              [1, '', '', ''],
            ],
            vars: { up: '-', left: '-', routes: 1 },
          },
        },
        {
          say: 'Cell one, one: one route from above, plus one from the left. That makes two.',
          emphasis: ['two'],
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, 2, '', ''],
              [1, '', '', ''],
            ],
            active: [[1, 1]],
            reads: [[0, 1], [1, 0]],
            vars: { up: 1, left: 1, routes: 2 },
          },
        },
        {
          say: 'Next door, it’s one from above and two from the left. So three.',
          emphasis: ['three'],
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, 2, 3, ''],
              [1, '', '', ''],
            ],
            active: [[1, 2]],
            reads: [[0, 2], [1, 1]],
            vars: { up: 1, left: 2, routes: 3 },
          },
        },
        {
          say: 'Then one plus three is four. Each cell just adds two numbers you already have.',
          emphasis: ['adds'],
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, 2, 3, 4],
              [1, '', '', ''],
            ],
            active: [[1, 3]],
            reads: [[0, 3], [1, 2]],
            vars: { up: 1, left: 3, routes: 4 },
          },
        },
        {
          say: 'Row two works the same way. Three from above and three from the left make six.',
          emphasis: ['six'],
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, 2, 3, 4],
              [1, 3, 6, ''],
            ],
            active: [[2, 2]],
            reads: [[1, 2], [2, 1]],
            vars: { up: 3, left: 3, routes: 6 },
          },
        },
        {
          say: 'The last cell is four plus six. Ten routes, and every cell was solved just once.',
          emphasis: ['Ten', 'once'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: pathTitle,
            rowLabels: pathRows,
            colLabels: pathCols,
            cells: [
              [1, 1, 1, 1],
              [1, 2, 3, 4],
              [1, 3, 6, 10],
            ],
            found: [[2, 3]],
            reads: [[1, 3], [2, 2]],
            vars: { up: 4, left: 6, routes: 10 },
          },
        },
        {
          say: 'In code, one row is enough. Before you add, row c still holds the cell above. That’s O of m times n.',
          speak: 'In code, one row is enough. Before you add, row c still holds the cell above. That’s oh of m times n.',
          emphasis: ['one', 'row'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'uniquePaths.js',
            code: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      row[c] += row[c - 1];
    }
  }
  return row[n - 1];
}`,
            highlight: [5],
            note: { line: 5, text: 'above + left: O(m × n)', tone: 'good' },
          },
        },
        {
          say: 'The trap: fill with one array, and every slot shares the same row. Change one, and they all change.',
          emphasis: ['same', 'row'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const row = Array(n).fill(0);
const dp = Array(m).fill(row);
dp[0][0] = 5; // all rows!`,
            errors: [2],
            note: { line: 2, text: 'every slot is the same row', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why is it okay to add the routes from above and from the left?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why can you add the routes from above and from the left?',
            options: ['Adding is faster', 'Each route has one last move', 'The grid is square', 'The edges are all ones'],
            answer: 1,
          },
        },
        {
          say: 'A route’s last move is down or right, never both. So the two groups never overlap.',
          emphasis: ['never', 'overlap'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why can you add the routes from above and from the left?',
            options: ['Adding is faster', 'Each route has one last move', 'The grid is square', 'The edges are all ones'],
            answer: 1,
            reveal: true,
            explain: 'A last move is down or right, never both. Two groups, so they add.',
          },
        },
        {
          say: 'Remember this. Each cell is the one above plus the one on the left. Now tap solve it and try it yourself.',
          emphasis: ['above', 'left'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Each cell is *up + left*', 'Solve every cell *once*', 'Count with +, best with min'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 2: two strings ─────────────────────────────
    {
      id: 'dsa-dp-2d-two-strings',
      title: 'Two strings: LCS and edit distance',
      link: { label: 'Solve it', href: '/dsa#/m/dp-2d/two-strings/dp-2d-lcs' },
      beats: [
        {
          say: 'How does git diff know which lines you changed?',
          emphasis: ['changed'],
          scene: { type: 'title', kicker: 'Two strings · Lesson 2', title: 'How does *git diff* know?', emoji: '🔍', style: 'slam' },
        },
        {
          say: 'Take abcde and ace. Keep a, c and e, in order, and both words have them. So the answer is three.',
          speak: 'Take a b c d e and ace. Keep a, c and e, in order, and both words have them. So the answer is three.',
          emphasis: ['order', 'three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Longest common subsequence',
            cells: ['a', 'b', 'c', 'd', 'e'],
            found: [0, 2, 4],
            done: [1, 3],
            vars: { other: '"ace"', length: 3 },
            caption: 'skip letters, but keep the order',
          },
        },
        {
          say: 'Look at the last letters. If they match, keep them. If not, drop one from either word and take the best.',
          emphasis: ['match', 'drop'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function lcs(i, j):
    if i = 0 or j = 0:
        return 0
    if a[i - 1] = b[j - 1]:
        return lcs(i - 1, j - 1) + 1
    up ← lcs(i - 1, j)
    left ← lcs(i, j - 1)
    return max(up, left)`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'a mismatch splits in two', tone: 'warn' },
          },
        },
        {
          say: 'Those calls repeat, so use a table. A match means the diagonal plus one. No match, take the bigger of up or left.',
          emphasis: ['diagonal', 'bigger'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Match? Go *diagonal*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Row zero and column zero mean an empty word. It shares nothing, so they’re all zero.',
          emphasis: ['empty', 'zero'],
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
            ],
            vars: { letters: '-', cell: 0 },
          },
        },
        {
          say: 'The letters a and a match. Take the diagonal, zero, and add one. That’s one.',
          emphasis: ['match', 'diagonal'],
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, 1, '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
            ],
            active: [[1, 1]],
            reads: [[0, 0]],
            vars: { letters: 'a = a', cell: '0 + 1' },
          },
        },
        {
          say: 'Now b and c don’t match. Up and left are both one, so this cell stays one.',
          emphasis: ['don’t', 'match'],
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, 1, 1, 1],
              [0, 1, 1, ''],
              [0, '', '', ''],
              [0, '', '', ''],
              [0, '', '', ''],
            ],
            active: [[2, 2]],
            reads: [[1, 2], [2, 1]],
            vars: { letters: 'b ≠ c', cell: 'max(1, 1)' },
          },
        },
        {
          say: 'Then c and c match. The diagonal holds one, so this cell becomes two.',
          emphasis: ['two'],
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, 1, 1, 1],
              [0, 1, 1, 1],
              [0, 1, 2, ''],
              [0, '', '', ''],
              [0, '', '', ''],
            ],
            active: [[3, 2]],
            reads: [[2, 1]],
            vars: { letters: 'c = c', cell: '1 + 1' },
          },
        },
        {
          say: 'The letters d and e don’t match, so the best neighbour carries over. Still two.',
          emphasis: ['carries'],
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, 1, 1, 1],
              [0, 1, 1, 1],
              [0, 1, 2, 2],
              [0, 1, 2, 2],
              [0, '', '', ''],
            ],
            active: [[4, 3]],
            reads: [[3, 3], [4, 2]],
            vars: { letters: 'd ≠ e', cell: 'max(2, 2)' },
          },
        },
        {
          say: 'Last, e and e match. Two plus one is three, and the answer sits in the bottom right corner.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: lcsTitle,
            rowLabels: lcsRows,
            colLabels: lcsCols,
            cells: [
              [0, 0, 0, 0],
              [0, 1, 1, 1],
              [0, 1, 1, 1],
              [0, 1, 2, 2],
              [0, 1, 2, 2],
              [0, 1, 2, 3],
            ],
            found: [[5, 3]],
            reads: [[4, 2]],
            vars: { letters: 'e = e', cell: '2 + 1' },
          },
        },
        {
          say: 'In JavaScript, it’s two loops and one if. Each cell is filled once, so it’s O of m times n.',
          speak: 'In JavaScript, it’s two loops and one if. Each cell is filled once, so it’s oh of m times n.',
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'lcs.js',
            code: `function lcs(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from(
    { length: m + 1 },
    () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j],
            dp[i][j-1]);
  return dp[m][n];
}`,
            highlight: [[9, 10]],
            note: { line: 10, text: 'match: diagonal + 1. O(m × n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this with two strings, and words like common, match or edit. Edit distance fills this same table.',
          emphasis: ['two', 'edit'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '*Two* strings or two lists', icon: '👯' },
              { text: 'Words like common or *edit*', icon: '✏️' },
              { text: 'Line one up with the other', icon: '📏' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: the table has an extra row, so row i is letter i minus one. Forget that, and you skip the first letter.',
          emphasis: ['extra', 'minus'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (let i = 1; i <= m; i++)
  for (let j = 1; j <= n; j++)
    if (a[i] === b[j]) ...`,
            errors: [3],
            note: { line: 3, text: 'row i is the letter a[i - 1]', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The letters at i, j match. Which cell do you build on?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'The letters at (i, j) match. Which cell do you build on?',
            options: ['The cell above', 'The cell to the left', 'The diagonal, up-left', 'Row zero'],
            answer: 2,
          },
        },
        {
          say: 'The diagonal. A match uses a letter from both words, so both words shrink by one.',
          emphasis: ['diagonal', 'both'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'The letters at (i, j) match. Which cell do you build on?',
            options: ['The cell above', 'The cell to the left', 'The diagonal, up-left', 'Row zero'],
            answer: 2,
            reveal: true,
            explain: 'A match uses both letters, so both words shrink: diagonal + 1.',
          },
        },
        {
          say: 'Remember this. One index per string, and always compare the last letters. Now tap solve it and try it yourself.',
          emphasis: ['last', 'letters'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['One index per *string*', 'Match: *diagonal* + 1', 'No match: best of up or left'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 3: 0/1 knapsack ─────────────────────────────
    {
      id: 'dsa-dp-2d-knapsack-01',
      title: '0/1 knapsack: pack it or leave it',
      link: { label: 'Solve it', href: '/dsa#/m/dp-2d/knapsack-01/dp-2d-backpack' },
      beats: [
        {
          say: 'Your bag holds four kilos. What should you pack?',
          emphasis: ['four', 'pack'],
          scene: { type: 'title', kicker: 'Knapsack · Lesson 3', title: 'Pack it or *leave* it', emoji: '🎒', style: 'slam' },
        },
        {
          say: 'You have snacks, a camera and a tent. Each has a weight and a fun score, and you own one of each.',
          emphasis: ['weight', 'score'],
          sfx: 'pop',
          scene: {
            type: 'list',
            title: 'Your back takes 4 kg',
            items: [
              { text: 'Snacks', sub: '1 kg · 15 points', icon: '🍫' },
              { text: 'Camera', sub: '3 kg · 20 points', icon: '📷' },
              { text: 'Tent', sub: '4 kg · 30 points', icon: '⛺' },
            ],
          },
        },
        {
          say: 'Grabbing the tent first gives thirty. But snacks plus the camera also weigh four, and score thirty five.',
          emphasis: ['thirty', 'five'],
          scene: {
            type: 'compare',
            title: 'Grab the best item first?',
            left: { title: 'Tent only', verdict: 'bad', items: ['4 kg used', '30 points'] },
            right: { title: 'Snacks + camera', verdict: 'ok', items: ['1 + 3 = 4 kg', '35 points'] },
          },
        },
        {
          say: 'The easy way tries both for every item: skip it, or take it. With n items, that’s two to the n plans.',
          emphasis: ['skip', 'take'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function best(i, cap):
    if i = 0: return 0
    w, v ← item i
    skip ← best(i - 1, cap)
    if w > cap: return skip
    take ← v + best(i - 1, cap - w)
    return max(skip, take)`,
            highlight: [4, 6],
            note: { line: 6, text: 'two calls per item: O(2ⁿ)', tone: 'warn' },
          },
        },
        {
          say: 'But only two things matter: how many items you’ve looked at, and how much room is left. That’s a table.',
          emphasis: ['room', 'table'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Items by *room* left', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Row zero has no items, so it’s all zero. With one kilo of room, the snacks fit. Fifteen.',
          emphasis: ['Fifteen'],
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, '', '', ''],
              ['', '', '', '', ''],
              ['', '', '', '', ''],
            ],
            active: [[1, 1]],
            reads: [[0, 1], [0, 0]],
            vars: { skip: 0, take: 15, best: 15 },
          },
        },
        {
          say: 'Any room of one kilo or more fits the snacks once. The whole row becomes fifteen.',
          emphasis: ['once'],
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, 15, 15, 15],
              ['', '', '', '', ''],
              ['', '', '', '', ''],
            ],
            active: [[1, 4]],
            reads: [[0, 4], [0, 3]],
            vars: { skip: 0, take: 15, best: 15 },
          },
        },
        {
          say: 'Now the camera. With three kilos, skip it for fifteen, or take it for twenty. Take it.',
          emphasis: ['twenty'],
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, 15, 15, 15],
              [0, 15, 15, 20, ''],
              ['', '', '', '', ''],
            ],
            active: [[2, 3]],
            reads: [[1, 3], [1, 0]],
            vars: { skip: 15, take: 20, best: 20 },
          },
        },
        {
          say: 'Here’s the key cell. Pack the camera with four kilos, and one is left over. The row above says that’s fifteen more.',
          emphasis: ['key', 'fifteen'],
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, 15, 15, 15],
              [0, 15, 15, 20, 35],
              ['', '', '', '', ''],
            ],
            active: [[2, 4]],
            reads: [[1, 4], [1, 1]],
            vars: { skip: 15, take: '20 + 15', best: 35 },
          },
        },
        {
          say: 'Last, the tent. Taking it scores thirty, but skipping it keeps thirty five. Skip wins.',
          emphasis: ['Skip', 'wins'],
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, 15, 15, 15],
              [0, 15, 15, 20, 35],
              [0, 15, 15, 20, 35],
            ],
            active: [[3, 4]],
            reads: [[2, 4], [2, 0]],
            vars: { skip: 35, take: 30, best: 35 },
          },
        },
        {
          say: 'Thirty five, in the bottom right corner. Snacks plus camera, and every cell was filled just once.',
          emphasis: ['Thirty', 'five'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: packTitle,
            rowLabels: packRows,
            colLabels: packCols,
            cells: [
              [0, 0, 0, 0, 0],
              [0, 15, 15, 15, 15],
              [0, 15, 15, 20, 35],
              [0, 15, 15, 20, 35],
            ],
            found: [[3, 4]],
            vars: { skip: 35, take: 30, best: 35 },
          },
        },
        {
          say: 'In code, keep just one row, and loop the room backwards so each item is packed once. That’s O of n times the room.',
          speak: 'In code, keep just one row, and loop the room backwards so each item is packed once. That’s oh of n times the room.',
          emphasis: ['backwards', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'maxValue.js',
            code: `function maxValue(w, v, cap) {
  const best = Array(cap + 1).fill(0);
  w.forEach((wi, i) => {
    for (let c = cap; c >= wi; c--) {
      best[c] = Math.max(best[c],
        v[i] + best[c - wi]);
    }
  });
  return best[cap];
}`,
            highlight: [4],
            note: { line: 4, text: 'backwards: O(n × cap)', tone: 'good' },
          },
        },
        {
          say: 'The trap: loop forwards, and the cells on the left already hold the snacks. You pack them four times.',
          emphasis: ['forwards', 'four'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'Loop forwards? Oops',
            cells: [0, 15, 30, 45, 60],
            active: [4],
            reads: [3],
            vars: { loop: 'forwards', snacks: '4 times' },
            caption: 'each cell adds snacks to its left',
          },
        },
        {
          say: 'Quick check. In the table, why is each item used at most once?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In the table, why is each item used at most once?',
            options: ['We sort the items', 'Both choices read the row above', 'The room only goes up', 'We use max'],
            answer: 1,
          },
        },
        {
          say: 'Skip and take both read the row above, where this item wasn’t allowed yet.',
          emphasis: ['row', 'above'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In the table, why is each item used at most once?',
            options: ['We sort the items', 'Both choices read the row above', 'The room only goes up', 'We use max'],
            answer: 1,
            reveal: true,
            explain: 'Take reads the row above, from before this item was allowed.',
          },
        },
        {
          say: 'Remember this. Each item is skip or take, both read from the row above. Now tap solve it and try it yourself.',
          emphasis: ['skip', 'take'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Columns are *room* left', '*Skip* or *take* each item', 'One row? Loop *backwards*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 4: palindromes ─────────────────────────────
    {
      id: 'dsa-dp-2d-palindromes',
      title: 'Palindromes: DP on a piece of a string',
      link: { label: 'Solve it', href: '/dsa#/m/dp-2d/palindromes/dp-2d-longest-palindromic-substring' },
      beats: [
        {
          say: 'Some DNA reads the same from both ends. How do you find it?',
          emphasis: ['both', 'ends'],
          scene: { type: 'title', kicker: 'Palindromes · Lesson 4', title: 'Find the *mirror*', emoji: '🧬', style: 'slam' },
        },
        {
          say: 'In babad, the longest piece that reads the same both ways is bab. It’s three letters long.',
          emphasis: ['bab', 'three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Longest palindrome in "babad"',
            cells: palLetters,
            found: [0, 1, 2],
            vars: { longest: '"bab"', length: 3 },
            caption: 'one unbroken piece of the string',
          },
        },
        {
          say: 'The easy way checks every piece, letter by letter. That’s n squared pieces, times n checks. O of n cubed.',
          speak: 'The easy way checks every piece, letter by letter. That’s n squared pieces, times n checks. Oh of n cubed.',
          emphasis: ['every', 'cubed'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function longestPalindrome(s):
    best ← first letter of s
    for i from 0 to n - 1:
        for j from i to n - 1:
            if isPal(s[i..j]):
                keep it if longer
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'n² pieces × n checks: O(n³)', tone: 'warn' },
          },
        },
        {
          say: 'To check abcba, you match the outer letters, then check bcb. But you already checked bcb on its own.',
          speak: 'To check a b c b a, you match the outer letters, then check b c b. But you already checked b c b on its own.',
          emphasis: ['already'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: ['a', 'b', 'c', 'b', 'a'],
            active: [0, 4],
            reads: [1, 2, 3],
            caption: '"bcb" was already checked',
          },
        },
        {
          say: 'A piece is a palindrome when its two ends match, and the piece inside is one too.',
          emphasis: ['ends', 'inside'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Ends match, inside *too*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Fill short pieces first. One letter is always a palindrome, so the whole diagonal gets a tick.',
          emphasis: ['short', 'diagonal'],
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '', '', '', ''],
              ['', '✓', '', '', ''],
              ['', '', '✓', '', ''],
              ['', '', '', '✓', ''],
              ['', '', '', '', '✓'],
            ],
            vars: { piece: '"b"', ends: 'b = b' },
          },
        },
        {
          say: 'Next come pairs. No two neighbours are the same letter, so every pair gets a cross.',
          emphasis: ['cross'],
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '✗', '', '', ''],
              ['', '✓', '✗', '', ''],
              ['', '', '✓', '✗', ''],
              ['', '', '', '✓', '✗'],
              ['', '', '', '', '✓'],
            ],
            active: [[0, 1]],
            vars: { piece: '"ba"', ends: 'b ≠ a' },
          },
        },
        {
          say: 'Now bab. Both ends are b, and the inside, a, already has a tick. So bab is a palindrome.',
          emphasis: ['bab'],
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '✗', '✓', '', ''],
              ['', '✓', '✗', '', ''],
              ['', '', '✓', '✗', ''],
              ['', '', '', '✓', '✗'],
              ['', '', '', '', '✓'],
            ],
            active: [[0, 2]],
            reads: [[1, 1]],
            vars: { piece: '"bab"', ends: 'b = b' },
          },
        },
        {
          say: 'The piece aba works the same way. But bad has different ends, so it’s out right away.',
          emphasis: ['different', 'ends'],
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '✗', '✓', '', ''],
              ['', '✓', '✗', '✓', ''],
              ['', '', '✓', '✗', '✗'],
              ['', '', '', '✓', '✗'],
              ['', '', '', '', '✓'],
            ],
            active: [[1, 3]],
            reads: [[2, 2]],
            vars: { piece: '"aba"', ends: 'a = a' },
          },
        },
        {
          say: 'The longer pieces all have ends that don’t match. Each one costs a single check.',
          emphasis: ['single', 'check'],
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '✗', '✓', '✗', '✗'],
              ['', '✓', '✗', '✓', '✗'],
              ['', '', '✓', '✗', '✗'],
              ['', '', '', '✓', '✗'],
              ['', '', '', '', '✓'],
            ],
            active: [[0, 4]],
            vars: { piece: '"babad"', ends: 'b ≠ d' },
          },
        },
        {
          say: 'The longest tick is bab, from zero to two. One check per piece makes it O of n squared.',
          speak: 'The longest tick is bab, from zero to two. One check per piece makes it oh of n squared.',
          emphasis: ['bab', 'squared'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: palTitle,
            rowLabels: palLetters,
            colLabels: palLetters,
            done: palLower,
            cells: [
              ['✓', '✗', '✓', '✗', '✗'],
              ['', '✓', '✗', '✓', '✗'],
              ['', '', '✓', '✗', '✗'],
              ['', '', '', '✓', '✗'],
              ['', '', '', '', '✓'],
            ],
            found: [[0, 2]],
            vars: { piece: '"bab"', ends: 'b = b' },
          },
        },
        {
          say: 'In JavaScript, loop by length, short pieces first. One line checks the ends and looks up the inside.',
          emphasis: ['length', 'inside'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'longestPal.js',
            code: `function longestPal(s) {
  const n = s.length;
  const P = [...s].map(() => []);
  let start = 0, best = 1;
  for (let L = 1; L <= n; L++)
    for (let i = 0; i + L <= n; i++) {
      const j = i + L - 1;
      P[i][j] = s[i] === s[j] &&
        (L <= 2 || P[i + 1][j - 1]);
      if (P[i][j] && L > best)
        [start, best] = [i, L];
    }
  return s.slice(start, start + best);
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'one check per piece: O(n²)', tone: 'good' },
          },
        },
        {
          say: 'The trap: fill rows from the top, and the row below is still empty. You get wrong answers, with no error.',
          emphasis: ['below', 'empty'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Wrong order',
            code: `for i from 0 to n - 1:
    for j from i + 1 to n - 1:
        dp[i][j] ← ... dp[i + 1][j - 1]`,
            errors: [3],
            note: { line: 3, text: 'row i + 1 is still empty!', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Before you fill a cell, which other cell must already be done?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Which cell must be ready before you fill isPal[i][j]?',
            options: ['The cell to its right', 'The piece just inside it', 'The top right corner', 'The cell above it'],
            answer: 1,
          },
        },
        {
          say: 'The piece just inside it. It’s one letter shorter on each side, so short pieces go first.',
          emphasis: ['inside', 'shorter'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Which cell must be ready before you fill isPal[i][j]?',
            options: ['The cell to its right', 'The piece just inside it', 'The top right corner', 'The cell above it'],
            answer: 1,
            reveal: true,
            explain: 'Ends match, and the inside (one shorter each side) is a palindrome.',
          },
        },
        {
          say: 'Remember this. Check the two ends, then trust the inside. Now tap solve it and try it yourself.',
          emphasis: ['ends', 'inside'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['dp[i][j] is the piece from *i* to *j*', 'Ends match + inside = *palindrome*', 'Fill *short* pieces first'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 5: state machines ─────────────────────────────
    {
      id: 'dsa-dp-2d-state-machines',
      title: 'State machines: a few modes per day',
      link: { label: 'Solve it', href: '/dsa#/m/dp-2d/state-machines/dp-2d-stock-cooldown' },
      beats: [
        {
          say: 'Sell a stock, then wait a day. How do you plan around that?',
          emphasis: ['wait'],
          scene: { type: 'title', kicker: 'State machines · Lesson 5', title: 'Sell, then *wait*', emoji: '⏳', style: 'slam' },
        },
        {
          say: 'Buy at one, sell at two, and wait a day. Then buy at zero and sell at two. Profit: three.',
          emphasis: ['wait', 'three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Prices for 5 days',
            cells: [1, 2, 3, 0, 2],
            pointers: { buy: 0, sell: 1, buy2: 3, sell2: 4 },
            found: [0, 1, 3, 4],
            done: [2],
            vars: { profit: 3 },
            caption: 'day 2 is the cooldown',
          },
        },
        {
          say: 'Each day ends in one of three modes. There’s no arrow from sold to held. That missing arrow is the cooldown.',
          emphasis: ['three', 'cooldown'],
          scene: {
            type: 'diagram',
            title: 'Three modes',
            cols: 3,
            rows: 3,
            nodes: [
              { id: 'held', label: 'Held', sub: 'own a share', icon: '📈', x: 0, y: 0 },
              { id: 'sold', label: 'Sold', sub: 'sold today', icon: '💰', x: 2, y: 0, active: true },
              { id: 'rest', label: 'Rest', sub: 'free to buy', icon: '😴', x: 1, y: 2 },
            ],
            edges: [
              { from: 'rest', to: 'held', label: 'buy' },
              { from: 'held', to: 'sold', label: 'sell' },
              { from: 'sold', to: 'rest', label: 'wait a day', active: true },
            ],
            caption: 'no arrow from Sold to Held',
          },
        },
        {
          say: 'The easy way asks about yesterday in every mode, again and again. The calls pile up fast.',
          emphasis: ['yesterday', 'pile'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function best(d, mode):
    if d = 0: return start[mode]
    p ← prices[d]
    if mode = held:
        return max(best(d - 1, held),
            best(d - 1, rest) - p)
    if mode = sold:
        return best(d - 1, held) + p
    return max(best(d - 1, rest),
        best(d - 1, sold))`,
            highlight: [[4, 6]],
            note: { line: 6, text: 'the same calls, again and again', tone: 'warn' },
          },
        },
        {
          say: 'But each day only needs yesterday. So make a table, with one row per day and one column per mode.',
          emphasis: ['yesterday', 'table'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'One row per *day*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Day zero: buy at one, and held is minus one. You can’t have sold yet, and resting is zero.',
          emphasis: ['minus', 'one'],
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              ['', '', ''],
              ['', '', ''],
              ['', '', ''],
              ['', '', ''],
            ],
            active: [[0, 0]],
            vars: { price: 1, rule: 'buy: 0 - 1' },
          },
        },
        {
          say: 'Day one, the price is two. Selling what you held gives minus one plus two. That’s one.',
          emphasis: ['Selling'],
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              [-1, 1, 0],
              ['', '', ''],
              ['', '', ''],
              ['', '', ''],
            ],
            active: [[1, 1]],
            reads: [[0, 0]],
            vars: { price: 2, rule: 'sell: -1 + 2' },
          },
        },
        {
          say: 'Day two, rest takes yesterday’s sale. The cooldown is over, and you’re free to buy with one.',
          emphasis: ['cooldown', 'free'],
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              [-1, 1, 0],
              [-1, 2, 1],
              ['', '', ''],
              ['', '', ''],
            ],
            active: [[2, 2]],
            reads: [[1, 1], [1, 2]],
            vars: { price: 3, rule: 'max(0, 1)' },
          },
        },
        {
          say: 'Day three, the price drops to zero. Buying from rest gives one, which beats minus one.',
          emphasis: ['zero', 'Buying'],
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              [-1, 1, 0],
              [-1, 2, 1],
              [1, -1, 2],
              ['', '', ''],
            ],
            active: [[3, 0]],
            reads: [[2, 0], [2, 2]],
            vars: { price: 0, rule: 'max(-1, 1 - 0)' },
          },
        },
        {
          say: 'Day four, sell at two. Yesterday’s held, one, plus two makes three.',
          emphasis: ['three'],
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              [-1, 1, 0],
              [-1, 2, 1],
              [1, -1, 2],
              [1, 3, 2],
            ],
            active: [[4, 1]],
            reads: [[3, 0]],
            vars: { price: 2, rule: 'sell: 1 + 2' },
          },
        },
        {
          say: 'On the last day, take the best of sold and rest. That’s three, and each row only looked at yesterday.',
          emphasis: ['Three', 'yesterday'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: stockTitle,
            rowLabels: stockRows,
            colLabels: stockCols,
            cells: [
              [-1, '-∞', 0],
              [-1, 1, 0],
              [-1, 2, 1],
              [1, -1, 2],
              [1, 3, 2],
            ],
            found: [[4, 1]],
            reads: [[4, 2]],
            vars: { price: 2, rule: 'max(3, 2)' },
          },
        },
        {
          say: 'Since you only need yesterday, three variables are enough. Update all three at once. O of n time.',
          speak: 'Since you only need yesterday, three variables are enough. Update all three at once. Oh of n time.',
          emphasis: ['three', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'maxProfit.js',
            code: `function maxProfit(prices) {
  let held = -prices[0];
  let sold = -Infinity, rest = 0;
  for (const p of prices.slice(1)) {
    [held, sold, rest] = [
      Math.max(held, rest - p),
      held + p,
      Math.max(rest, sold),
    ];
  }
  return Math.max(sold, rest);
}`,
            highlight: [[5, 9]],
            note: { line: 9, text: 'all from yesterday: O(n), O(1)', tone: 'good' },
          },
        },
        {
          say: 'The trap: update them one by one, and later lines read today’s values. The cooldown vanishes, and you get four, not three.',
          emphasis: ['vanishes', 'four'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `held = Math.max(held, rest - p);
sold = held + p;
rest = Math.max(rest, sold);`,
            errors: [[2, 3]],
            note: { line: 3, text: 'reads today, not yesterday', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why can’t sold go straight to held the next day?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why can’t Sold go straight to Held the next day?',
            options: ['Prices only go up', 'The cooldown forbids it', 'Sold is always negative', 'You can own two shares'],
            answer: 1,
          },
        },
        {
          say: 'The cooldown forbids it. You can only buy from rest, so that arrow is missing on purpose.',
          emphasis: ['cooldown', 'rest'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why can’t Sold go straight to Held the next day?',
            options: ['Prices only go up', 'The cooldown forbids it', 'Sold is always negative', 'You can own two shares'],
            answer: 1,
            reveal: true,
            explain: 'The missing arrow is the cooldown. You can only buy from Rest.',
          },
        },
        {
          say: 'Remember this. Draw the modes, turn each arrow into a max, and use yesterday’s values. Now tap solve it and try it yourself.',
          emphasis: ['modes', 'arrow'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['State is (*day*, *mode*)', 'Each arrow is one option in a *max*', 'Update every mode from *yesterday*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
