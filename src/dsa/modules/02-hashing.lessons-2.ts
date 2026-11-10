import type { Lesson } from '../types';

// Module 2, lessons 3-4: grouping by a key, sets for existence.

const SUDOKU: string[][] = [
  ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
  ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
  ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
  ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
  ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
  ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
  ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
  ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
  ['.', '.', '.', '.', '8', '.', '.', '7', '9'],
];

/** A copy of the valid board with one cell changed. */
const sudokuWith = (r: number, c: number, v: string) =>
  SUDOKU.map((row, i) => row.map((cell, j) => (i === r && j === c ? v : cell)));

const EMPTY_SUDOKU = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => '.'));

export const groupingLesson: Lesson = {
  id: 'grouping',
  title: 'Grouping by a key',
  summary: 'Give every item a signature; items with the same signature share a bucket.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Word families in a puzzle app',
      text: "A word-puzzle app shows 'word families': words built from exactly the same tiles. `eat`, `tea` and `ate` sit in one row, `tan` and `nat` in another, `bat` alone. Your photo app does the same thing when it groups pictures by date. Same idea: decide a **key** for each item, and items with the same key go together.",
    },
    {
      kind: 'text',
      text: "**The problem (Group Anagrams).** Given a list of words, put anagrams into the same group. For `['eat', 'tea', 'tan', 'ate', 'nat', 'bat']` the answer is `[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]` (any order).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: compare with every group',
      code: `function groupAnagrams(words):
    groups ← empty list
    for each w in words:
        placed ← false
        for each g in groups:
            if isAnagram(w, first word of g):
                append w to g
                placed ← true
                stop this loop
        if not placed:
            append [w] to groups
    return groups`,
    },
    {
      kind: 'text',
      text: "Correct, but each new word is compared against every group so far. With n words of length k that is up to O(n² · k). **Spot the waste:** we keep asking 'is this word like that word?' over and over. What if each word could tell us its family name by itself, with no comparing?",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'A signature per item',
      text: "Turn each word into a **canonical key**: a value that is identical for every word in the family and different for every other family. Sorting the letters works: `eat`, `tea`, `ate` all become `aet`. Then a map `key → list of words` does the grouping in one pass.",
    },
    {
      kind: 'steps',
      title: 'One pass, key = sorted letters',
      frames: [
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 0 },
          active: [0],
          vars: { key: 'aet', groups: '{aet:[eat]}' },
          note: "`eat` sorted is `aet`. New key, so start a new group.",
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { key: 'aet', groups: '{aet:[eat,tea]}' },
          note: "`tea` also sorts to `aet`. Same key, same group.",
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { key: 'ant', groups: '{aet:[eat,tea], ant:[tan]}' },
          note: "`tan` sorts to `ant`. New group.",
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { key: 'aet', groups: '{aet:[eat,tea,ate], ant:[tan]}' },
          note: "`ate` → `aet`. Joins the first group. No comparing with other words at all.",
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          vars: { key: 'ant', groups: '{aet:[3 words], ant:[tan,nat]}' },
          note: "`nat` → `ant`. Joins `tan`.",
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'],
          pointers: { i: 5 },
          active: [5],
          done: [0, 1, 2, 3, 4],
          vars: { key: 'abt', groups: '{aet:[3], ant:[2], abt:[bat]}' },
          note: "`bat` → `abt`. Its own group. The map's values are the answer.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function groupAnagrams(words):
    groups ← empty map                  // key → list of words
    for each w in words:
        key ← letters of w, sorted, joined into a string
        if key not in groups:
            groups[key] ← empty list
        append w to groups[key]
    return all values of groups`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function groupAnagrams(words) {
  const groups = new Map(); // key -> words
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}`,
    },
    {
      kind: 'text',
      text: "**A faster key.** Sorting each word costs O(k log k). For lowercase words you can instead count the 26 letters and use the counts as the key: `eat` → `1#0#0#0#1#...#1#...`. That is O(k) per word. Either way the key **must be a string** (or number). An array key never matches, because Map compares arrays by reference.",
    },
    {
      kind: 'diagram',
      title: 'Why the separator matters',
      art: `counts of letters a, b:

word A: a × 1, b × 11    word B: a × 11, b × 1

join('')  → "111"   and   "111"    (same: WRONG)
join('#') → "1#11"  and   "11#1"   (different: right)`,
      caption: "Gluing numbers together without a separator can make two different count lists look identical.",
    },
    {
      kind: 'compare',
      title: 'Group Anagrams (n words, length k)',
      rows: [
        { approach: 'Compare with every group', time: 'O(n² · k)', space: 'O(n · k)', note: 'Re-asks the same question again and again.' },
        { approach: 'Map, key = sorted letters', time: 'O(n · k log k)', space: 'O(n · k)', note: 'Simplest to write. Great for short words.' },
        { approach: 'Map, key = letter counts', time: 'O(n · k)', space: 'O(n · k)', note: 'Best for long words. Join with a separator.' },
      ],
    },
    {
      kind: 'text',
      text: "**The pattern: group by a canonical key.** Reach for it when the problem says *group*, *bucket*, *same pattern / same shape / equivalent*, or *how many pairs are identical*. The whole skill is choosing the key: sorted letters, letter counts, a row joined into a string, a date, a size.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: group by key',
      code: `groups ← empty map                 // key → list
for each item in items:
    key ← signature(item)          // must be a string or number
    if key not in groups:
        groups[key] ← empty list
    append item to groups[key]
return values of groups`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Array keys never match',
      text: "`map.set(['a', 'e', 't'], ...)` stores one specific array object. The next word builds a new array, so `map.has(newArray)` is `false` and every word lands in its own group. Always build a string key, and when joining numbers, use a separator like `'#'` or `','`.",
    },
  ],
  problems: [
    {
      id: 'hashing-group-anagrams',
      title: 'Group Anagrams',
      difficulty: 'medium',
      leetcode: 49,
      pattern: 'Group by canonical key',
      statement: "A puzzle app wants word families: words made of exactly the same letters. Given `words`, return the groups of anagrams. The groups and the words inside them can be in any order.",
      examples: [
        { input: "words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']", output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]" },
        { input: "words = ['']", output: "[['']]", explain: 'The empty word is its own family.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '0 ≤ word length ≤ 100', 'lowercase English letters'],
      hints: [
        "What could you compute from one word that is the same for all of its anagrams?",
        "Sorted letters: `eat`, `tea`, `ate` all become `aet`.",
        "Map from that key to a list of words, then return the map's values.",
      ],
      approaches: [
        {
          name: 'Compare with every group',
          idea: 'For each word, check it against the first word of every existing group. Correct, but it repeats the same comparisons over and over.',
          time: 'O(n² · k)',
          space: 'O(n · k)',
        },
        {
          name: 'Map with a sorted-letters key',
          idea: "Two words are anagrams exactly when their sorted letters are equal. So the sorted string is a family name, and a map groups everything in one pass.",
          pseudo: `function groupAnagrams(words):
    groups ← empty map
    for each w in words:
        key ← letters of w, sorted, joined
        if key not in groups:
            groups[key] ← empty list
        append w to groups[key]
    return values of groups`,
          code: `function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}`,
          time: 'O(n · k log k)',
          space: 'O(n · k)',
        },
      ],
      fn: 'groupAnagrams',
      starter: `function groupAnagrams(words) {
  // return a list of groups; each group holds words that are anagrams
  return [];
}`,
      solution: `function groupAnagrams(words) {
  const groups = new Map();
  for (const w of words) {
    const key = [...w].sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  return [...groups.values()];
}`,
      tests: [
        {
          name: 'example',
          args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']],
          expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']],
        },
        { name: 'empty word', args: [['']], expected: [['']] },
        { name: 'one word', args: [['a']], expected: [['a']] },
        { name: 'all one family', args: [['abc', 'bca', 'cab']], expected: [['abc', 'bca', 'cab']] },
        { name: 'different lengths', args: [['ab', 'ba', 'abc']], expected: [['ab', 'ba'], ['abc']] },
        { name: 'duplicate words', args: [['x', 'x']], expected: [['x', 'x']] },
        { name: 'same letters, other counts', args: [['aab', 'abb', 'bab']], expected: [['aab'], ['abb', 'bab']] },
      ],
      compare: 'nested',
      takeaway: "Grouping is easy once you find a key that is equal exactly for items that belong together.",
    },
    {
      id: 'hashing-equal-row-column-pairs',
      title: 'Equal row and column pairs',
      difficulty: 'medium',
      leetcode: 2352,
      pattern: 'Group by canonical key',
      statement: "A seating chart is an `n × n` grid of numbers. Count the pairs `(row r, column c)` where row `r` read left to right is exactly the same list as column `c` read top to bottom.",
      examples: [
        { input: 'grid = [[3,2,1],[1,7,6],[2,7,7]]', output: '1', explain: 'Row 2 is [2,7,7] and column 1 is [2,7,7].' },
        {
          input: 'grid = [[3,1,2,2],[1,4,4,5],[2,4,2,2],[2,4,2,2]]',
          output: '3',
          explain: 'Row 0 matches column 0; rows 2 and 3 both match column 2.',
        },
      ],
      constraints: ['1 ≤ n ≤ 200', '1 ≤ grid[i][j] ≤ 10⁵'],
      hints: [
        "Comparing every row with every column is n² pairs, each costing n. Can you compare whole lists faster?",
        "Turn each row into a string key and count how many rows have each key.",
        "For each column, build the same kind of key and add the count of rows with that key. Join with a separator: `[11, 1]` and `[1, 11]` must not both become `'111'`.",
      ],
      approaches: [
        {
          name: 'Compare every row with every column',
          idea: 'For each of the n² (row, column) pairs, compare n numbers. Correct, O(n³).',
          time: 'O(n³)',
          space: 'O(1)',
        },
        {
          name: 'Count row keys, look up column keys',
          idea: "Two lists are equal exactly when their joined strings (with a separator) are equal. Count each row's key once; then every column with the same key matches that many rows.",
          pseudo: `function equalPairs(grid):
    rowCount ← empty map              // row key → how many rows
    for each row in grid:
        key ← row joined with ","
        rowCount[key] ← (rowCount[key] or 0) + 1
    pairs ← 0
    for c from 0 to n - 1:
        key ← column c (top to bottom) joined with ","
        pairs ← pairs + (rowCount[key] or 0)
    return pairs`,
          code: `function equalPairs(grid) {
  const n = grid.length;
  const rowCount = new Map();
  for (const row of grid) {
    const key = row.join(',');
    rowCount.set(key, (rowCount.get(key) ?? 0) + 1);
  }
  let pairs = 0;
  for (let c = 0; c < n; c++) {
    const key = grid.map((row) => row[c]).join(',');
    pairs += rowCount.get(key) ?? 0;
  }
  return pairs;
}`,
          time: 'O(n²)',
          space: 'O(n²)',
        },
      ],
      fn: 'equalPairs',
      starter: `function equalPairs(grid) {
  // count (row, column) pairs holding the same list of numbers
  return 0;
}`,
      solution: `function equalPairs(grid) {
  const n = grid.length;
  const rowCount = new Map();
  for (const row of grid) {
    const key = row.join(',');
    rowCount.set(key, (rowCount.get(key) ?? 0) + 1);
  }
  let pairs = 0;
  for (let c = 0; c < n; c++) {
    const key = grid.map((row) => row[c]).join(',');
    pairs += rowCount.get(key) ?? 0;
  }
  return pairs;
}`,
      tests: [
        { name: 'one match', args: [[[3, 2, 1], [1, 7, 6], [2, 7, 7]]], expected: 1 },
        { name: 'repeated rows', args: [[[3, 1, 2, 2], [1, 4, 4, 5], [2, 4, 2, 2], [2, 4, 2, 2]]], expected: 3 },
        { name: '1 × 1', args: [[[1]]], expected: 1 },
        { name: 'all the same', args: [[[1, 1], [1, 1]]], expected: 4 },
        { name: 'no match', args: [[[1, 2], [3, 4]]], expected: 0 },
        { name: 'needs a separator', args: [[[11, 1], [1, 11]]], expected: 2 },
      ],
      takeaway: "To compare whole lists fast, turn each list into a string key (with a separator) and count keys.",
    },
    {
      id: 'hashing-group-by-size',
      title: 'Group people by group size',
      difficulty: 'medium',
      leetcode: 1282,
      pattern: 'Group by key',
      statement: "At a summer camp, kid `i` asked to be in a team of exactly `sizes[i]` kids. Build the teams. Fill teams in order of kid id: the first kids who asked for size 3 form the first team of 3, the next ones form the next team of 3, and so on. Return the teams (any order of teams). The input always allows a valid answer.",
      examples: [
        { input: 'sizes = [3, 3, 3, 3, 3, 1, 3]', output: '[[5], [0, 1, 2], [3, 4, 6]]' },
        { input: 'sizes = [2, 1, 3, 3, 3, 2]', output: '[[1], [0, 5], [2, 3, 4]]' },
      ],
      constraints: ['1 ≤ n ≤ 500', '1 ≤ sizes[i] ≤ n'],
      hints: [
        "The key here is simple: the size each kid asked for.",
        "Keep one 'team being filled' per size in a map.",
        "Add kid `i` to the team for `sizes[i]`. When that team reaches its size, move it to the answer and start a fresh one.",
      ],
      approaches: [
        {
          name: 'Group by size, then cut into chunks',
          idea: 'Collect all kids per size, then slice each list into pieces of that size. Correct, and also O(n).',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Fill teams as you go',
          idea: "Kids asking for the same size can share a team, so size is the key. Keeping one open team per size and closing it the moment it is full builds every team in a single pass.",
          pseudo: `function groupThePeople(sizes):
    open ← empty map                 // size → team being filled
    teams ← empty list
    for i from 0 to n - 1:
        s ← sizes[i]
        if s not in open:
            open[s] ← empty list
        append i to open[s]
        if length of open[s] = s:
            append open[s] to teams
            remove s from open
    return teams`,
          code: `function groupThePeople(sizes) {
  const open = new Map();
  const teams = [];
  sizes.forEach((s, i) => {
    if (!open.has(s)) open.set(s, []);
    const team = open.get(s);
    team.push(i);
    if (team.length === s) {
      teams.push(team);
      open.delete(s);
    }
  });
  return teams;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'groupThePeople',
      starter: `function groupThePeople(sizes) {
  // return teams of kid ids; team for kid i has exactly sizes[i] kids
  return [];
}`,
      solution: `function groupThePeople(sizes) {
  const open = new Map();
  const teams = [];
  sizes.forEach((s, i) => {
    if (!open.has(s)) open.set(s, []);
    const team = open.get(s);
    team.push(i);
    if (team.length === s) {
      teams.push(team);
      open.delete(s);
    }
  });
  return teams;
}`,
      tests: [
        { name: 'example 1', args: [[3, 3, 3, 3, 3, 1, 3]], expected: [[5], [0, 1, 2], [3, 4, 6]] },
        { name: 'example 2', args: [[2, 1, 3, 3, 3, 2]], expected: [[1], [0, 5], [2, 3, 4]] },
        { name: 'one kid', args: [[1]], expected: [[0]] },
        { name: 'everyone alone', args: [[1, 1, 1]], expected: [[0], [1], [2]] },
        { name: 'two pairs', args: [[2, 2, 2, 2]], expected: [[0, 1], [2, 3]] },
        { name: 'one big team', args: [[4, 4, 4, 4]], expected: [[0, 1, 2, 3]] },
      ],
      compare: 'nested',
      takeaway: "Sometimes the key is handed to you; the work is in what you store per key.",
    },
  ],
  quiz: [
    {
      prompt: "Which key correctly groups anagrams?",
      options: ['The word length', 'The first letter', 'The letters sorted into a string', 'The array of sorted letters'],
      answer: 2,
      explanation: "Length and first letter put non-anagrams together. An array key never matches in a Map because arrays compare by reference.",
    },
    {
      prompt: "You key rows by `row.join('')`. Which two rows wrongly get the same key?",
      options: ['[1, 2] and [2, 1]', '[11, 1] and [1, 11]', '[3, 3] and [3, 3]'],
      answer: 1,
      explanation: "Both become `'111'`. Join with a separator: `'11,1'` vs `'1,11'`.",
    },
    {
      prompt: "Group Anagrams with a sorted key costs O(n · k log k). What makes the count key O(n · k)?",
      options: [
        'Counting 26 letters takes one pass over the word instead of a sort.',
        'Maps are faster with longer keys.',
        'It skips words that were already grouped.',
      ],
      answer: 0,
      explanation: "Counting is O(k) per word; sorting is O(k log k).",
    },
  ],
  takeaways: [
    "Grouping = pick a canonical key, then `map[key]` collects the items.",
    "Keys must be strings or numbers. Build them with `join`, and use a separator between numbers.",
    "Counting keys (how many items share a key) answers 'how many identical pairs' questions.",
  ],
};

export const setsLesson: Lesson = {
  id: 'sets',
  title: 'Sets for existence',
  summary: 'When you only need "have I seen it?", a Set answers in one step.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The duplicate song',
      text: "You merge three playlists and Spotify warns: 'some songs are already in this playlist'. It does not compare every song with every other song. It keeps a **set** of song ids and asks, for each new song, *is this id already in the set?*",
    },
    {
      kind: 'text',
      text: "**Warm-up (Contains Duplicate).** Does `nums` contain any value twice? Brute force compares every pair: O(n²). Sorting puts duplicates next to each other: O(n log n). A **set** is a hash map with keys only: add each value, and if it is already there, you found a duplicate. O(n).",
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Contains Duplicate with a Set',
      code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
    },
    {
      kind: 'text',
      text: "**The real problem (Longest Consecutive Sequence).** A fitness app logs the days you worked out, as day numbers, in random order and with repeats: `[100, 4, 200, 1, 3, 2]`. What is your longest streak of back-to-back days? Here it is `1, 2, 3, 4`, so the answer is 4. You must do it in O(n), so sorting is not allowed.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: count up from every number',
      code: `function longestConsecutive(nums):
    best ← 0
    for each x in nums:
        length ← 1
        while x + length is in nums:        // scanning the array!
            length ← length + 1
        best ← max(best, length)
    return best`,
    },
    {
      kind: 'text',
      text: "Two kinds of waste here. **1.** 'Is `x + 1` in nums?' scans the array each time. A set fixes that. **2.** Even with a set, we count the streak `1,2,3,4` four times: from 1, from 2, from 3 and from 4. For one long streak of n days that is 1 + 2 + ... + n = O(n²) steps.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Only start at the start',
      text: "A number `x` begins a streak only if `x - 1` is **not** in the set. Only count upward from those starts. Every number is then visited by at most one count-up walk, so the total work is O(n).",
    },
    {
      kind: 'steps',
      title: 'Set = {100, 4, 200, 1, 3, 2}',
      frames: [
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 0 },
          active: [0],
          vars: { 'x - 1 in set?': '99: no', streak: '100', best: 1 },
          note: "100 is a start (no 99). 101 is missing, so the streak is 1.",
        },
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 1 },
          active: [1],
          done: [0],
          vars: { 'x - 1 in set?': '3: yes', best: 1 },
          note: "4 has a 3 before it, so it is in the middle of a streak. Skip it.",
        },
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 2 },
          active: [2],
          done: [0, 1],
          vars: { 'x - 1 in set?': '199: no', streak: '200', best: 1 },
          note: "200 is a start, but 201 is missing. Length 1.",
        },
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 3 },
          active: [3, 5, 4, 1],
          done: [0, 2],
          vars: { 'x - 1 in set?': '0: no', streak: '1, 2, 3, 4', best: 4 },
          note: "1 is a start. Walk up: 2 yes, 3 yes, 4 yes, 5 no. Length 4.",
        },
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          vars: { 'x - 1 in set?': '2: yes', best: 4 },
          note: "3 is in the middle (2 exists). Skip.",
        },
        {
          cells: [100, 4, 200, 1, 3, 2],
          pointers: { x: 5 },
          active: [5],
          found: [3, 5, 4, 1],
          done: [0, 2],
          vars: { 'x - 1 in set?': '1: yes', best: 4 },
          note: "2 is in the middle too. Done: the answer is 4, and each number was walked over at most once.",
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `function longestConsecutive(nums):
    present ← set of all values in nums
    best ← 0
    for each x in present:
        if x - 1 not in present:          // x starts a streak
            length ← 1
            while x + length in present:
                length ← length + 1
            best ← max(best, length)
    return best`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function longestConsecutive(nums) {
  const present = new Set(nums);
  let best = 0;
  for (const x of present) {
    if (present.has(x - 1)) continue; // not a start
    let length = 1;
    while (present.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}`,
    },
    {
      kind: 'compare',
      title: 'Longest Consecutive Sequence',
      rows: [
        { approach: 'Count up from every number, scan the array', time: 'O(n³)', space: 'O(1)', note: 'Each step of each walk scans the array.' },
        { approach: 'Sort, then one pass', time: 'O(n log n)', space: 'O(n)', note: 'Simple and often fine, but not the O(n) asked for.' },
        { approach: 'Set + count up from every number', time: 'O(n²)', space: 'O(n)', note: 'Fast lookups, but counts the same streak many times.' },
        { approach: 'Set + only start at starts', time: 'O(n)', space: 'O(n)', note: 'Each number is part of at most one walk.' },
      ],
    },
    {
      kind: 'text',
      text: "**Sets with smart keys.** Sometimes 'have I seen it?' needs more than the value. A Sudoku checker must know if `5` already appeared *in this row*, *in this column* or *in this 3×3 box*. Put strings like `'5 in row 3'`, `'5 in col 7'`, `'5 in box 2'` into one set. Box number = `Math.floor(r / 3) * 3 + Math.floor(c / 3)`.",
    },
    {
      kind: 'text',
      text: "**The pattern: set for existence.** Reach for a set when the problem says *duplicate*, *unique*, *already seen*, *visited*, *does it contain*, or when you need fast 'is `x + 1` / `x - 1` / this neighbour there?' checks. Use a map instead when you also need a value (an index, a count).",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: set for existence',
      code: `seen ← empty set
for each x in items:
    k ← key(x)                  // the value, or a string like "5 in row 3"
    if k in seen:
        react (duplicate, skip, conflict...)
    add k to seen`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Loop over the set, not the array',
      text: "In Longest Consecutive, `nums` can hold the same start many times, like `[1, 1, 1, ..., 1, 2, 3, ..., 50000]`. Looping over `nums` re-walks the long streak from every copy of 1, and you are back to O(n²). Loop over the **set**, where each value appears once.",
    },
  ],
  problems: [
    {
      id: 'hashing-contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'easy',
      leetcode: 217,
      pattern: 'Set for existence',
      statement: "You merge playlists and want to warn the user if any song id shows up more than once. Return `true` if some value appears at least twice in `nums`, otherwise `false`.",
      examples: [
        { input: 'nums = [1, 2, 3, 1]', output: 'true' },
        { input: 'nums = [1, 2, 3, 4]', output: 'false' },
      ],
      constraints: ['0 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        "You only need to know whether you have seen a value before. No count, no index.",
        "A `Set` answers 'have I seen x?' in about one step.",
      ],
      approaches: [
        {
          name: 'Sort, then check neighbours',
          idea: 'After sorting, equal values sit side by side. O(n log n), and it changes the array.',
          time: 'O(n log n)',
          space: 'O(1) to O(n)',
        },
        {
          name: 'Set',
          idea: "A duplicate is a value that is already in the set when you reach it. One pass, one lookup per value.",
          pseudo: `function containsDuplicate(nums):
    seen ← empty set
    for each x in nums:
        if x in seen:
            return true
        add x to seen
    return false`,
          code: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'containsDuplicate',
      starter: `function containsDuplicate(nums) {
  // true if any value appears at least twice
  return false;
}`,
      solution: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}`,
      tests: [
        { name: 'has duplicate', args: [[1, 2, 3, 1]], expected: true },
        { name: 'all distinct', args: [[1, 2, 3, 4]], expected: false },
        { name: 'empty', args: [[]], expected: false },
        { name: 'one element', args: [[7]], expected: false },
        { name: 'many repeats', args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expected: true },
        { name: 'negative and positive', args: [[-1, 1]], expected: false },
        { name: 'zeros', args: [[0, 0]], expected: true },
      ],
      takeaway: "'Have I seen it before?' is a Set question.",
    },
    {
      id: 'hashing-valid-sudoku',
      title: 'Valid Sudoku',
      difficulty: 'medium',
      leetcode: 36,
      pattern: 'Set with composite keys',
      statement: "A Sudoku app checks a half-filled 9×9 board before saving it. Cells hold `'1'`-`'9'` or `'.'` for empty. Return `true` if no digit repeats in any row, any column, or any of the nine 3×3 boxes. You do not need to check that the puzzle can be solved.",
      examples: [
        { input: 'the board from the lesson (classic example)', output: 'true' },
        { input: 'same board with the top-left cell changed to 8', output: 'false', explain: 'Column 0 and the top-left box now have two 8s.' },
      ],
      constraints: ['board is 9 × 9', "cells are '1'-'9' or '.'"],
      hints: [
        "You need three kinds of 'have I seen this digit?' checks: per row, per column, per box.",
        "Which box is cell (r, c) in? Try `Math.floor(r / 3) * 3 + Math.floor(c / 3)`.",
        "Use one set of strings like `'5 in row 3'`, `'5 in col 7'`, `'5 in box 2'`. If any is already there, the board is invalid.",
      ],
      approaches: [
        {
          name: 'Check each row, column and box separately',
          idea: 'Three loops of 9 groups, each with a fresh set. Correct and also O(81); just more code.',
          time: 'O(1) (81 cells)',
          space: 'O(1)',
        },
        {
          name: 'One pass, one set of composite keys',
          idea: "A digit breaks the rules only if the same digit was already seen in the same row, column or box. Encoding 'digit + where' as a string key lets one set track all 27 groups at once.",
          pseudo: `function isValidSudoku(board):
    seen ← empty set
    for r from 0 to 8:
        for c from 0 to 8:
            d ← board[r][c]
            if d = ".":
                continue
            b ← floor(r / 3) × 3 + floor(c / 3)
            keys ← [d + " in row " + r, d + " in col " + c, d + " in box " + b]
            for each k in keys:
                if k in seen:
                    return false
                add k to seen
    return true`,
          code: `function isValidSudoku(board) {
  const seen = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const d = board[r][c];
      if (d === '.') continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      for (const key of [d + ' in row ' + r, d + ' in col ' + c, d + ' in box ' + b]) {
        if (seen.has(key)) return false;
        seen.add(key);
      }
    }
  }
  return true;
}`,
          time: 'O(1) (81 cells)',
          space: 'O(1)',
        },
      ],
      fn: 'isValidSudoku',
      starter: `function isValidSudoku(board) {
  // true if no digit repeats in a row, a column or a 3x3 box
  return false;
}`,
      solution: `function isValidSudoku(board) {
  const seen = new Set();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const d = board[r][c];
      if (d === '.') continue;
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      for (const key of [d + ' in row ' + r, d + ' in col ' + c, d + ' in box ' + b]) {
        if (seen.has(key)) return false;
        seen.add(key);
      }
    }
  }
  return true;
}`,
      tests: [
        { name: 'valid board', args: [SUDOKU], expected: true },
        { name: 'column and box clash', args: [sudokuWith(0, 0, '8')], expected: false },
        { name: 'row clash only', args: [sudokuWith(0, 6, '7')], expected: false },
        { name: 'column clash only', args: [sudokuWith(5, 1, '9')], expected: false },
        { name: 'box clash only', args: [sudokuWith(0, 2, '6')], expected: false },
        { name: 'empty board', args: [EMPTY_SUDOKU], expected: true },
        { name: 'one more legal digit', args: [sudokuWith(0, 2, '1')], expected: true },
      ],
      takeaway: "When 'seen' depends on where, put the where into the key.",
    },
    {
      id: 'hashing-longest-consecutive',
      title: 'Longest Consecutive Sequence',
      difficulty: 'medium',
      leetcode: 128,
      pattern: 'Set for existence',
      statement: "A fitness app stores the days you worked out as day numbers, unsorted and possibly repeated. Return the length of your longest streak of consecutive days (values `x, x+1, x+2, ...`). Aim for O(n), so no sorting.",
      examples: [
        { input: 'nums = [100, 4, 200, 1, 3, 2]', output: '4', explain: 'The streak 1, 2, 3, 4.' },
        { input: 'nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', output: '9', explain: '0 through 8.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        "Put every value in a set so 'is `x + 1` here?' is one step.",
        "Counting up from every number re-counts the same streak many times. Which numbers are worth starting from?",
        "Only start at `x` when `x - 1` is not in the set. Loop over the set, not the array.",
      ],
      approaches: [
        {
          name: 'Sort, then scan',
          idea: 'After sorting, a streak is a run where each value is the previous + 1 (skip equal values). Correct, but O(n log n).',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Set, start only at streak starts',
          idea: "A streak has exactly one start: the value with no `x - 1`. Walking up only from starts means every value is stepped on by at most one walk, so the total is O(n).",
          pseudo: `function longestConsecutive(nums):
    present ← set of all values in nums
    best ← 0
    for each x in present:
        if x - 1 not in present:
            length ← 1
            while x + length in present:
                length ← length + 1
            best ← max(best, length)
    return best`,
          code: `function longestConsecutive(nums) {
  const present = new Set(nums);
  let best = 0;
  for (const x of present) {
    if (present.has(x - 1)) continue;
    let length = 1;
    while (present.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'longestConsecutive',
      starter: `function longestConsecutive(nums) {
  // length of the longest run x, x+1, x+2, ... using values from nums
  return 0;
}`,
      solution: `function longestConsecutive(nums) {
  const present = new Set(nums);
  let best = 0;
  for (const x of present) {
    if (present.has(x - 1)) continue;
    let length = 1;
    while (present.has(x + length)) length++;
    best = Math.max(best, length);
  }
  return best;
}`,
      tests: [
        { name: 'example', args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
        { name: 'long streak with a repeat', args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
        { name: 'empty', args: [[]], expected: 0 },
        { name: 'one element', args: [[1]], expected: 1 },
        { name: 'duplicates inside', args: [[1, 2, 0, 1]], expected: 3 },
        { name: 'negatives', args: [[-1, -2, -3, 10]], expected: 3 },
        { name: 'all the same', args: [[5, 5, 5]], expected: 1 },
        { name: 'no neighbours', args: [[10, 30, 20]], expected: 1 },
      ],
      takeaway: "Only start work where a run begins (x - 1 missing), and the set makes the whole scan O(n).",
    },
  ],
  quiz: [
    {
      prompt: "When should you use a `Set` instead of a `Map`?",
      options: [
        'When you only need to know if something was seen, not any value attached to it.',
        'When the keys are numbers.',
        'When you need the items in sorted order.',
      ],
      answer: 0,
      explanation: "A set is a map without values. If you need an index or a count, use a map.",
    },
    {
      prompt: "In Longest Consecutive Sequence, when do you start counting up from `x`?",
      options: ['Always', 'Only when `x + 1` is in the set', 'Only when `x - 1` is not in the set'],
      answer: 2,
      explanation: "If `x - 1` exists, `x` is in the middle of a streak that someone else will count.",
    },
    {
      prompt: "Which box is Sudoku cell (row 4, column 7) in, using `Math.floor(r / 3) * 3 + Math.floor(c / 3)`?",
      options: ['3', '5', '7'],
      answer: 1,
      explanation: "floor(4 / 3) = 1, floor(7 / 3) = 2, so 1 × 3 + 2 = 5 (middle row of boxes, right column).",
    },
  ],
  takeaways: [
    "A Set answers 'have I seen it?' in about O(1). Use a Map when you also need a value.",
    "Put context into the key ('5 in row 3') to track many groups with one set.",
    "Loop over the set, not the array, when duplicates could make you repeat work.",
  ],
};
