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
  summary: 'Build a shared label for items that belong in the same group.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Word families in a puzzle app',
      text: 'A puzzle app puts `eat`, `tea`, and `ate` together. They use the same letter tiles. `tan` belongs elsewhere. How can you find each word’s group?',
    },
    {
      kind: 'text',
      text: '**Group Anagrams.** Remember, anagrams use the same letters the same number of times. For `["eat", "tea", "tan", "ate"]`, return `[["eat", "tea", "ate"], ["tan"]]`. You may return the groups and their words in any order.',
    },
    {
      kind: 'text',
      text: 'Start by checking each new word against one word from every group. `isAnagram` below means the letter-count check from the previous lesson. From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length.',
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
      text: 'When `ate` arrives, you compare it with other words to find its group. More groups mean more comparisons. We will give each word a shared family label so the map can find its group directly.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Use sorted letters as the key',
      text: 'Sorting means putting items in order. Put each word’s letters in alphabetical order: `eat`, `tea`, and `ate` all become `aet`. Save the original words under that key. This shared label is sometimes called a **signature** or **canonical key**.',
    },
    {
      kind: 'list',
      items: [
        'Take `tea` apart into letters: `["t", "e", "a"]`.',
        'Sort them alphabetically: `["a", "e", "t"]`.',
        'Join the letters into the string `"aet"`. In JavaScript, `[...w].sort().join(\'\')` performs these three steps.',
        'Ask for key `"aet"`. If it is missing, save an empty list there. Add the original word `"tea"` to that list.',
      ],
      ordered: true,
    },
    {
      kind: 'diagram',
      title: 'Find a word\'s group',
      art: `Take the next word
        |
        v
Sort its letters and join them into a key
        |
        v
Is the key already in groups?
  | yes                 | no
  v                     v
Keep its list       Create an empty list
  |                     |
  +----------+----------+
             v
Add the original word, then take the next word`,
      caption: 'The key finds the list; the list keeps the original words.',
    },
    {
      kind: 'text',
      text: 'Use `["eat", "tea", "tan", "ate"]` and watch each sorted key find its list in `groups`; `aet -> [eat, tea]` means those original words share the key `aet`.',
    },
    {
      kind: 'steps',
      title: 'Shared letters find the same group',
      frames: [
        {
          cells: ['eat', 'tea', 'tan', 'ate'],
          vars: {
            'groups (key -> original words)': 'empty',
          },
          note: 'Start with no groups because no words have been read.',
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate'],
          pointers: { current: 0 },
          active: [0],
          vars: {
            key: 'aet',
            'groups (key -> original words)': 'aet -> [eat]',
          },
          note: '`eat` gives key `aet`, so create its list and add `eat`.',
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate'],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          found: [0, 1],
          vars: {
            key: 'aet',
            'groups (key -> original words)': 'aet -> [eat, tea]',
          },
          note: '`tea` also gives `aet`, so add it to the existing list.',
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate'],
          pointers: { current: 2 },
          active: [2],
          done: [0, 1],
          vars: {
            key: 'ant',
            'groups (key -> original words)': 'aet -> [eat, tea]; ant -> [tan]',
          },
          note: '`tan` gives a new key `ant`, so start a separate list.',
        },
        {
          cells: ['eat', 'tea', 'tan', 'ate'],
          pointers: { current: 3 },
          active: [3],
          done: [2],
          found: [0, 1, 3],
          vars: {
            key: 'aet',
            'groups (key -> original words)': 'aet -> [eat, tea, ate]; ant -> [tan]',
          },
          note: '`ate` gives `aet`, so the final groups are `[eat, tea, ate]` and `[tan]`.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'A shared key lets you find the right group without comparing the new word with earlier words.',
    },
    {
      kind: 'text',
      text: 'Use `["", "a", "", "a"]` and watch empty words and repeated words stay in the answer; `""` marks an empty string in the cells and the map.',
    },
    {
      kind: 'steps',
      title: 'Empty words and duplicates still belong',
      frames: [
        {
          cells: ['""', 'a', '""', 'a'],
          vars: {
            'groups (key -> original words)': 'empty',
          },
          note: 'The map starts empty because even an empty word must be read first.',
        },
        {
          cells: ['""', 'a', '""', 'a'],
          pointers: { current: 0 },
          active: [0],
          vars: {
            key: '"" (empty string)',
            'groups (key -> original words)': '"" -> [""]',
          },
          note: 'The empty word gives key `""`, so create a list holding that word.',
        },
        {
          cells: ['""', 'a', '""', 'a'],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          vars: {
            key: 'a',
            'groups (key -> original words)': '"" -> [""]; a -> [a]',
          },
          note: '`a` gives a different key, so it needs its own list.',
        },
        {
          cells: ['""', 'a', '""', 'a'],
          pointers: { current: 2 },
          active: [2],
          done: [1],
          found: [0, 2],
          vars: {
            key: '"" (empty string)',
            'groups (key -> original words)': '"" -> ["", ""]; a -> [a]',
          },
          note: 'The next empty word has the same key, so keep both copies in its list.',
        },
        {
          cells: ['""', 'a', '""', 'a'],
          pointers: { current: 3 },
          active: [3],
          done: [0, 2],
          found: [1, 3],
          vars: {
            key: 'a',
            'groups (key -> original words)': '"" -> ["", ""]; a -> [a, a]',
          },
          note: 'The second `a` joins the first because grouping keeps every input word.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'The map keeps one list per key, but that list keeps every copy of a word.',
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
  return [...groups.values()]; // collect the saved lists into an array
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Use a string for this shared label',
      text: 'A Map can use arrays as keys, but two separately created arrays are different keys even if they contain the same letters. Two strings containing `"aet"` do match. That is why you join the sorted letters before asking the map.',
    },
    {
      kind: 'text',
      text: '**Optional: a letter-count key.** Instead of sorting, count each letter in a fixed order. For words using only a and b, `aab` gives counts `[2, 1]`; `aba` also gives `[2, 1]`. Put `#` between the counts as a **separator**, a character that keeps the numbers apart. You get `"2#1"`. For full English words, include all 26 counts in a-to-z order. This avoids sorting each word.',
    },
    {
      kind: 'diagram',
      title: 'Why the separator matters',
      art: `counts of letters a, b:

word A: a x 1, b x 11    word B: a x 11, b x 1

join('')  -> "111"   and   "111"    (same: WRONG)
join('#') -> "1#11"  and   "11#1"   (different: right)`,
      caption:
        'A separator is a character placed between numbers. It keeps 1 followed by 11 different from 11 followed by 1.',
    },
    {
      kind: 'text',
      text: 'For the costs below, `n` is the number of words and `k` is the length of a word. From module 1: O(n²) means pair-like growth; O(k log k) is the usual sorting cost for k letters. Multiply by n because you process n words. Space O(n · k) allows room for all their letters.',
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
      text: '**Pattern: group by a shared key.** Use it when different-looking items belong together: words with the same letters, lists with the same numbers in the same order, or people asking for the same team size. Decide exactly what makes items belong together before choosing the key.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: group by a shared key',
      code: `groups ← empty map                  // shared label → list of items
for each item in items:
    key ← shared label for item
    if key not in groups:
        groups[key] ← empty list
    append item to groups[key]
return values of groups`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'A key must keep meaningful differences',
      text: 'Length is not enough for anagrams: `cat` and `dog` both have length 3. For rows of numbers, order matters, so join without sorting. Use commas: `[1, 11]` becomes `"1,11"`, while `[11, 1]` becomes `"11,1"`.',
    },
  ],
  problems: [
    {
      id: 'hashing-group-anagrams',
      title: 'Group Anagrams',
      difficulty: 'medium',
      leetcode: 49,
      pattern: 'Group by canonical key',
      statement:
        'A puzzle app groups words that use the same letters the same number of times. These are anagrams. Return all groups, keeping the original words. For `["ab", "ba", "aab"]`, return `[["ab", "ba"], ["aab"]]`: the last word has an extra a. Any group order and word order are allowed.',
      examples: [
        {
          input: "words = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']",
          output: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
        },
        { input: "words = ['']", output: "[['']]", explain: 'The empty word is its own family.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', '0 ≤ word length ≤ 100', 'lowercase English letters'],
      hints: [
        'What label could both `ab` and `ba` produce, without giving the same label to `aab`?',
        'Sort the letters alphabetically, then join them: both `ab` and `ba` give the string `"ab"`.',
        'For each word: (1) build its sorted string key, (2) create an empty list under that key if needed, (3) append the original word. Return all the saved lists.',
      ],
      approaches: [
        {
          name: 'Compare with every group',
          idea: 'Compare each word’s letter counts with the first word of every existing group. Equal counts identify its group, but you may repeat many comparisons.',
          time: 'O(n² · k)',
          space: 'O(n · k)',
        },
        {
          name: 'Map with a sorted-letters key',
          idea: 'Sort a word’s letters and join them into one string: tea becomes aet. Use that string as a map key and save a list of original words under it, so equal letter counts lead directly to the same group.',
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
      takeaway:
        'Grouping is easy once you find a key that is equal exactly for items that belong together.',
    },
    {
      id: 'hashing-equal-row-column-pairs',
      title: 'Equal row and column pairs',
      difficulty: 'medium',
      leetcode: 2352,
      pattern: 'Group by canonical key',
      statement:
        'A square grid has the same number of rows and columns. Count row-and-column pairs with exactly the same numbers in the same order: read a row left to right and a column top to bottom. For `[[1, 2], [2, 3]]`, row 0 matches column 0 and row 1 matches column 1, so return 2. Repeated equal rows each make their own pair. Here n is the number of rows, which also equals the number of columns.',
      examples: [
        {
          input: 'grid = [[1, 2], [2, 3]]',
          output: '2',
          explain: 'Row 0 and column 0 are [1, 2]. Row 1 and column 1 are [2, 3].',
        },
        {
          input: 'grid = [[1, 1], [1, 1]]',
          output: '4',
          explain: 'Each of the 2 rows matches each of the 2 columns: 2 × 2 = 4.',
        },
      ],
      constraints: ['1 ≤ n ≤ 200', '1 ≤ grid[i][j] ≤ 10⁵'],
      hints: [
        'If two rows are identical and one column matches them, how many pairs does that column make?',
        'Save a count for each row’s string key. Join with commas: [1, 11] becomes "1,11", not "111". Do not sort; order matters.',
        'Build each column’s comma-joined key from top to bottom. Add the saved row count for that key, or 0 if it is missing.',
      ],
      approaches: [
        {
          name: 'Compare every row with every column',
          idea: 'Compare every row with every column, one number at a time. A pair qualifies only if every position matches; n rows, n columns, and n checks per pair can take O(n³) work.',
          time: 'O(n³)',
          space: 'O(1)',
        },
        {
          name: 'Count row keys, look up column keys',
          idea: 'Turn a row into a comma-separated key and count how many rows have it. Build the same kind of key for each column; its saved count is exactly how many rows that column matches.',
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
      takeaway:
        'To compare whole lists fast, turn each list into a string key (with a separator) and count keys.',
    },
    {
      id: 'hashing-group-by-size',
      title: 'Group people by group size',
      difficulty: 'medium',
      leetcode: 1282,
      pattern: 'Group by key',
      statement:
        'Person i asks for a team with exactly `sizes[i]` people, including themselves. Return teams of person indexes, counted from 0. For `[2, 1, 2]`, people 0 and 2 make a team of 2, and person 1 forms a team of 1: `[[0, 2], [1]]`. For each size, fill teams in increasing person-index order. You may return completed teams in any order. A valid grouping always exists.',
      examples: [
        {
          input: 'sizes = [2, 1, 2]',
          output: '[[1], [0, 2]]',
          explain: 'Person 1 asked to be alone. People 0 and 2 each asked for a team of 2.',
        },
        {
          input: 'sizes = [2, 2, 2, 2]',
          output: '[[0, 1], [2, 3]]',
          explain: 'Fill the first team of 2 before starting the next one.',
        },
      ],
      constraints: ['1 ≤ n ≤ 500', '1 ≤ sizes[i] ≤ n'],
      hints: [
        'People can share a team only if they asked for the same size.',
        'Use requested size as the map key and save the team currently being filled as its value.',
        'For [2, 2, 2, 2], collect [0, 1], move that full team to the answer, then start a fresh list for [2, 3]. Remove the old map entry when its team fills.',
      ],
      approaches: [
        {
          name: 'Group by size, then cut into chunks',
          idea: 'Collect all person indexes under each requested size, in input order. Split each saved list into teams of that size; this also takes one pass through the saved people.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Fill teams as you go',
          idea: 'Save one unfinished team per size. Add each person to their requested size’s list; when it reaches that size, save the finished team and remove the map entry so the next person starts a new team.',
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
      takeaway: 'Sometimes the key is handed to you; the work is in what you store per key.',
    },
  ],
  quiz: [
    {
      prompt: 'Which shared key puts `eat` and `tea` together without also adding `dog`?',
      options: ['Word length', 'Letters sorted and joined into a string', 'First letter'],
      answer: 1,
      explanation: 'Both words give `aet`. Dog gives `dgo`, so it goes in another group.',
    },
    {
      prompt: "You key rows by `row.join('')`. Which two rows wrongly get the same key?",
      options: ['[1, 2] and [2, 1]', '[11, 1] and [1, 11]', '[3, 3] and [3, 3]'],
      answer: 1,
      explanation: "Both become `'111'`. Join with a separator: `'11,1'` vs `'1,11'`.",
    },
    {
      prompt: 'The map has `"aet" → ["eat"]`. What should you do with `tea`?',
      options: [
        'Replace the key with tea.',
        'Add tea to the existing list.',
        'Start a second aet group.',
      ],
      answer: 1,
      explanation: 'Tea gives the same key, so you keep both original words in that key’s list.',
    },
  ],
  takeaways: [
    'Choose a shared label that matches exactly when items belong together.',
    'For anagrams, sort letters and join them into a string key.',
    'For number lists, keep their order and join with a separator.',
  ],
};

export const setsLesson: Lesson = {
  id: 'sets',
  title: 'Sets for existence',
  summary: 'Use a collection of distinct values when you only need a yes-or-no check.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The duplicate song',
      text: 'You merge playlists with song ids `[4, 7, 4]`. The second 4 is already in the playlist. You need to spot the repeat; you do not need its old position or play count.',
    },
    {
      kind: 'text',
      text: '**Contains Duplicate.** A duplicate is a value that appears more than once. Compare each pair first: the two 4s match, so return true. We will remember song ids to avoid searching earlier songs for each new one.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Remember values without attached information',
      text: 'A **hash set**, called `Set` in JavaScript, stores each distinct value once. Distinct means different: adding 4 twice still leaves one 4 in the set. Use `seen.add(4)` to save it and `seen.has(4)` to ask whether it is present. Like a map lookup, this takes O(1) on average: roughly steady work as the set grows.',
    },
    {
      kind: 'diagram',
      title: 'Ask before adding a song id',
      art: `Take the next song id
        |
        v
Is it already in seen?
  | yes              | no
  v                  v
Return true      Add it to seen
                     |
                     v
           More ids? Take the next one
           No more ids? Return false`,
      caption: 'Checking before adding tells you whether an earlier song had this id.',
    },
    {
      kind: 'text',
      text: 'Use `[4, 7, 4]` and watch `seen` grow until a song id repeats; each number inside the set is an id already read.',
    },
    {
      kind: 'steps',
      title: 'Spot the repeated song id',
      frames: [
        {
          cells: [4, 7, 4],
          vars: {
            'seen (distinct song ids)': 'empty',
          },
          note: 'Start with no saved song ids because none have been checked.',
        },
        {
          cells: [4, 7, 4],
          pointers: { current: 0 },
          active: [0],
          vars: {
            'seen (distinct song ids)': '{4}',
          },
          note: '4 is absent, so save it for later checks.',
        },
        {
          cells: [4, 7, 4],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          vars: {
            'seen (distinct song ids)': '{4, 7}',
          },
          note: '7 is absent too, so save it beside 4.',
        },
        {
          cells: [4, 7, 4],
          pointers: { current: 2 },
          active: [2],
          done: [1],
          found: [0, 2],
          vars: {
            'seen (distinct song ids)': '{4, 7}',
            answer: 'true',
          },
          note: '4 is already saved, so the two 4s prove the answer is true.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'A set answers whether a value appeared before; the second 4 proves there is a duplicate.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Plan: check for a duplicate',
      code: `seen ← empty set
for each x in nums:
    if x in seen:
        return true
    add x to seen
return false`,
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
      text: '**Next task: consecutive days.** Consecutive means one after another with no missing number. In `[4, 1, 3, 2, 9]`, the days 1, 2, 3, 4 form the longest streak: length 4. Their order in the input does not matter. Repeated days count once. From module 1: pseudocode is a plain code plan. `←` stores, `=` means equal, `≠` means not equal, and loop endpoints are included. `n` is the input length.',
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
      text: 'This plan starts at every day and searches the array for the next day. A set avoids each search. But starting at 1 counts 1, 2, 3, 4; starting at 2 then counts 2, 3, 4 again. We will also skip starts that repeat part of a streak. From module 1: time counts work, and space counts extra storage. O(n) work grows with the input length; O(n²) grows like the number of pairs.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Only count from the first day',
      text: 'The number 1 starts the streak because 0 is missing. The number 2 does not start it because 1 exists. For any `x`, count upward only if `x - 1` is absent. Every streak now gets one count-up walk.',
    },
    {
      kind: 'diagram',
      title: 'Count a streak only from its first day',
      art: `Build present from all input days
        |
        v
Take the next distinct day x
        |
        v
Is the previous day x - 1 present?
  | yes                    | no
  v                        v
Skip this day      Count upward until a day is missing
  |                        |
  |                Keep the longest length in best
  |                        |
  +------------+-----------+
               v
        Take the next distinct day`,
      caption: 'Saving all days first lets you find a streak even when the input is out of order.',
    },
    {
      kind: 'text',
      text: 'Use `[4, 1, 3, 2]` and watch `present` grow before searching for streaks; each saved number is a day, and `best` is the largest number of days in any streak found so far.',
    },
    {
      kind: 'steps',
      title: 'Build the set, then find days 1 through 4',
      frames: [
        {
          cells: [4, 1, 3, 2],
          vars: {
            'present (distinct days)': 'empty',
            'best (longest length)': 0,
          },
          note: 'Start with an empty set because no days have been saved.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 0 },
          active: [0],
          done: [],
          vars: {
            'present (distinct days)': '{4}',
            'best (longest length)': 0,
          },
          note: 'Add day 4 so later checks can ask whether it exists.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 1 },
          active: [1],
          done: [0],
          vars: {
            'present (distinct days)': '{4, 1}',
            'best (longest length)': 0,
          },
          note: 'Add day 1 so later checks can ask whether it exists.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 2 },
          active: [2],
          done: [0, 1],
          vars: {
            'present (distinct days)': '{4, 1, 3}',
            'best (longest length)': 0,
          },
          note: 'Add day 3 so later checks can ask whether it exists.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: {
            'present (distinct days)': '{4, 1, 3, 2}',
            'best (longest length)': 0,
          },
          note: 'Add day 2 so later checks can ask whether it exists.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 0 },
          active: [0],
          vars: {
            'present (distinct days)': '{4, 1, 3, 2}',
            'previous day': '3 is present',
            'best (longest length)': 0,
          },
          note: 'Skip 4 because day 3 exists, so 4 is not the start of a streak.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 1 },
          active: [1],
          done: [],
          found: [1, 3, 2, 0],
          vars: {
            'present (distinct days)': '{4, 1, 3, 2}',
            'streak in order': '1, 2, 3, 4',
            'length (days in this streak)': 4,
            'best (longest length)': 4,
          },
          note: 'Start at 1 because 0 is absent, then find 2, 3, and 4 before missing 5.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 2 },
          active: [2],
          done: [0, 1],
          found: [1, 3, 2, 0],
          vars: {
            'present (distinct days)': '{4, 1, 3, 2}',
            'previous day': '2 is present',
            'best (longest length)': 4,
          },
          note: 'Skip 3 because 2 exists and the walk from 1 already covered it.',
        },
        {
          cells: [4, 1, 3, 2],
          pointers: { current: 3 },
          active: [3],
          done: [],
          found: [1, 3, 2, 0],
          vars: {
            'present (distinct days)': '{4, 1, 3, 2}',
            'previous day': '1 is present',
            'best (longest length)': 4,
          },
          note: 'Skip 2 because 1 exists, leaving the longest streak length at 4.',
        },
      ],
    },
    {
      kind: 'text',
      text: 'The set ignores input order, and checking for a missing previous day counts each streak only once.',
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
      text: '**When the place matters: Sudoku.** A 9-by-9 board has rows, columns, and nine 3-by-3 boxes. Number each from 0. A 5 may appear once in each row, column, and box. Save labels such as `"5 in row 0"` in the set. Another 5 in row 0 repeats that label and breaks the rule. A **composite key** is a label made from several pieces, here the digit and its place.',
    },
    {
      kind: 'list',
      items: [
        'Number the boxes left to right: top row 0, 1, 2; middle row 3, 4, 5; bottom row 6, 7, 8.',
        'For cell at row 4, column 7: divide each position by 3 and round down. `Math.floor(4 / 3) = 1` and `Math.floor(7 / 3) = 2`.',
        'The box number is `1 * 3 + 2 = 5`. For digit 8 there, check `"8 in row 4"`, `"8 in col 7"`, and `"8 in box 5"`. Save all three if none is already present.',
      ],
      ordered: true,
    },
    {
      kind: 'text',
      text: '**Pattern: a set for existence.** Existence just means “is it there?” Use a set for “already seen”, “duplicate”, or “is the next number present?” Use a map if you also need an index, count, or group saved under each key.',
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
      title: 'Walk through distinct days',
      text: 'For `[1, 1, 2, 3]`, a loop over the input would count the streak from 1 twice. `new Set(nums)` keeps one copy of each day. Loop over that set so each streak starts once.',
    },
  ],
  problems: [
    {
      id: 'hashing-contains-duplicate',
      title: 'Contains Duplicate',
      difficulty: 'easy',
      leetcode: 217,
      pattern: 'Set for existence',
      statement:
        'You merge playlists and want to detect a repeated song id. Return true if any number in `nums` appears at least twice; otherwise return false. For `[4, 7, 4]`, return true because id 4 appears at positions 0 and 2.',
      examples: [
        {
          input: 'nums = [4, 7, 4]',
          output: 'true',
          explain: 'Song id 4 appears twice.',
        },
        {
          input: 'nums = [4, 7, 9]',
          output: 'false',
          explain: 'Each id appears once.',
        },
      ],
      constraints: ['0 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        'Do you need each song’s old position, or only whether it has appeared?',
        'Use a set. For each id, return true if it is already present; otherwise add it. Return false if you reach the end.',
      ],
      approaches: [
        {
          name: 'Sort, then check neighbours',
          idea: 'Sort the values so equal ones sit next to each other, then check neighbouring positions. Sorting changes the input unless you first copy it.',
          time: 'O(n log n)',
          space: 'O(1) to O(n)',
        },
        {
          name: 'Set',
          idea: 'A set remembers each id once. If an id is already there when you reach it, you have found a repeated value.',
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
      statement:
        'Check a 9-by-9 Sudoku board. Cells hold digits "1" through "9", or "." for empty. Return false if a digit repeats in a row, a column, or one of the nine 3-by-3 boxes; otherwise return true. For example, 5 at (row 0, column 0) and 5 at (row 0, column 4) repeat in row 0, so return false. Row and column indexes start at 0. You only check filled cells, not whether the puzzle can be completed.',
      examples: [
        {
          input: 'a 9-by-9 board of ".", except board[0][0] = "5" and board[0][4] = "5"',
          output: 'false',
          explain: 'The two 5s share row 0, even though they occupy different 3-by-3 boxes.',
        },
        {
          input: 'a 9-by-9 board of ".", except board[0][0] = "5" and board[4][4] = "5"',
          output: 'true',
          explain: 'The two 5s are in different rows, columns, and boxes.',
        },
      ],
      constraints: ['board is 9 × 9', "cells are '1'-'9' or '.'"],
      hints: [
        'For each filled cell, ask separately whether its digit has appeared in this row, this column, or this box. Ignore empty cells.',
        'Number boxes 0, 1, 2 across the top, then 3, 4, 5, then 6, 7, 8. At row 4, column 7, floor(4 / 3) = 1 and floor(7 / 3) = 2, so box = 1 * 3 + 2 = 5.',
        'Save three labels for digit 8 at that cell: "8 in row 4", "8 in col 7", "8 in box 5". If any label is already in the set, return false; otherwise add all three.',
      ],
      approaches: [
        {
          name: 'Check each row, column and box separately',
          idea: 'Check each row with its own fresh set, then each column, then each box. A repeated digit in any one group breaks the rules; because the board is always 81 cells, its cost is fixed.',
          time: 'O(1) (81 cells)',
          space: 'O(1)',
        },
        {
          name: 'One pass, one set of composite keys',
          idea: 'Save three text labels for each digit: digit with row, digit with column, and digit with box. These are composite keys, labels built from more than one piece, so one set can track all three rules without mixing them.',
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
      takeaway:
        'Save the digit and its place together so only a repeat in the same group is rejected.',
    },
    {
      id: 'hashing-longest-consecutive',
      title: 'Longest Consecutive Sequence',
      difficulty: 'medium',
      leetcode: 128,
      pattern: 'Set for existence',
      statement:
        'A fitness app stores workout day numbers in `nums`, in any order and possibly repeated. Return the number of days in the longest streak with no missing day. For `[4, 1, 3, 2, 9]`, days 1, 2, 3, 4 give length 4. Repeats count once; an empty input gives 0. Aim for O(n): work that grows with the number of input days, without sorting.',
      examples: [
        { input: 'nums = [100, 4, 200, 1, 3, 2]', output: '4', explain: 'The streak 1, 2, 3, 4.' },
        { input: 'nums = [0, 3, 7, 2, 5, 8, 4, 6, 0, 1]', output: '9', explain: '0 through 8.' },
      ],
      constraints: ['0 ≤ n ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
      hints: [
        'A set lets you check whether the next day exists without searching the whole array.',
        'If 1, 2, 3, 4 exist, counting from 2 repeats part of the walk from 1. How can you recognize just the beginning?',
        'Start counting from x only if x - 1 is absent. Then test x + 1, x + 2, and so on. Loop over the set, where repeated input days appear only once.',
      ],
      approaches: [
        {
          name: 'Sort, then scan',
          idea: 'Sort day numbers, skip duplicates, and count each run that increases by 1. This works, but sorting takes O(n log n), more work than the requested O(n).',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Set, start only at streak starts',
          idea: 'Put distinct day numbers in a set. Count upward only from a day with no previous day present; each streak is then counted once, giving O(n) total work on average.',
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
      takeaway:
        'Only start work where a run begins (x - 1 missing), and the set makes the whole scan O(n).',
    },
  ],
  quiz: [
    {
      prompt: 'When should you use a `Set` instead of a `Map`?',
      options: [
        'When you only need to know if something was seen, not any value attached to it.',
        'When the keys are numbers.',
        'When you need the items in sorted order.',
      ],
      answer: 0,
      explanation: 'A set is a map without values. If you need an index or a count, use a map.',
    },
    {
      prompt: 'In Longest Consecutive Sequence, when do you start counting up from `x`?',
      options: ['Always', 'Only when `x + 1` is in the set', 'Only when `x - 1` is not in the set'],
      answer: 2,
      explanation:
        'If `x - 1` exists, `x` is in the middle of a streak that someone else will count.',
    },
    {
      prompt:
        'Which box is Sudoku cell (row 4, column 7) in, using `Math.floor(r / 3) * 3 + Math.floor(c / 3)`?',
      options: ['3', '5', '7'],
      answer: 1,
      explanation:
        'floor(4 / 3) = 1, floor(7 / 3) = 2, so 1 × 3 + 2 = 5 (middle row of boxes, right column).',
    },
  ],
  takeaways: [
    'A set saves distinct values and answers whether a value is present.',
    'To count a consecutive streak once, start only when the previous number is absent.',
    'When location matters, include it in the saved label.',
  ],
};
