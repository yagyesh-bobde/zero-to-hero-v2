import type { Lesson } from '../types';

// Lesson 5 of module 11: trie + DFS. Suggestions, longest buildable word, Word Search II.

/** Monospace art without the leading newline; backslashes kept as typed. */
const art = (s: TemplateStringsArray) => s.raw[0].slice(1);

const SUGGEST_JS = `function suggestedProducts(products, searchWord) {
  const root = { children: {}, top: [] };
  for (const p of [...products].sort()) {   // a-z order, so the first 3 are the answer
    let node = root;
    for (const ch of p) {
      if (!node.children[ch]) node.children[ch] = { children: {}, top: [] };
      node = node.children[ch];
      if (node.top.length < 3) node.top.push(p);
    }
  }
  const out = [];
  let node = root;
  for (const ch of searchWord) {
    node = node ? node.children[ch] : undefined;
    out.push(node ? node.top : []);
  }
  return out;
}`;

const WORD_SEARCH_JS = `function findWords(board, words) {
  const root = { children: {}, word: null };
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.children[ch]) node.children[ch] = { children: {}, word: null };
      node = node.children[ch];
    }
    node.word = w;                          // store the whole word at its end
  }
  const rows = board.length;
  const cols = board[0].length;
  const found = [];
  const dfs = (r, c, parent) => {
    const ch = board[r][c];
    const node = parent.children[ch];
    if (!node) return;                      // no word continues this way: prune
    if (node.word !== null) {
      found.push(node.word);
      node.word = null;                     // report each word once
    }
    board[r][c] = '#';                      // mark as used on this path
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) dfs(nr, nc, node);
    }
    board[r][c] = ch;                       // un-choose
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root);
  }
  return found;
}`;

const LONGEST_JS = `function longestWord(words) {
  const root = { children: {}, word: '' };   // the empty start counts as built
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node.children[ch]) node.children[ch] = { children: {}, word: null };
      node = node.children[ch];
    }
    node.word = w;
  }
  let best = '';
  const dfs = (node) => {
    for (const ch of Object.keys(node.children).sort()) {
      const child = node.children[ch];
      if (child.word === null) continue;     // not a word: the chain breaks here
      if (child.word.length > best.length) best = child.word;
      dfs(child);
    }
  };
  dfs(root);
  return best;
}`;

const BOARD = [
  ['o', 'a', 'a', 'n'],
  ['e', 't', 'a', 'e'],
  ['i', 'h', 'k', 'r'],
  ['i', 'f', 'l', 'v'],
];

export const trieDfsLesson: Lesson = {
  id: 'trie-dfs',
  title: 'Trie + DFS: suggestions and word search',
  summary: 'Walk a trie and something else together (keystrokes, a grid) and stop the moment no word can continue.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Three suggestions per key press',
      text: 'You type `m`, `o`, `u` into a shopping search box. After every letter it shows the 3 alphabetically first products that start with what you typed: mobile, moneypot, monitor... then mouse, mousepad. It answers before your next key press. Word games like Boggle do the opposite trick: they hunt for thousands of dictionary words in a grid of letters at once.',
    },
    {
      kind: 'text',
      text: 'The problem: given `products = [mobile, mouse, moneypot, monitor, mousepad]` and the search word `mouse`, return the suggestions after each letter: after `m`, after `mo`, after `mou`, and so on.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: filter for every prefix',
      code: `function suggestions(products, word):
    sort products                          // a-z
    out ← empty list
    for i from 1 to length(word):
        prefix ← word[0..i-1]
        matches ← products that start with prefix
        append first 3 of matches to out
    return out
// O(L · N · L): every key press re-checks every product`,
    },
    {
      kind: 'text',
      text: "Spot the waste. Everything that matches `mou` already matched `mo`. Each key press only goes one step deeper, but the brute force starts over and compares every product's first letters again.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'One key press = one step down the trie',
      text: "Put the products in a trie. The node for the typed prefix has *every* matching product below it, so each key press is one step down. Even better: insert the products in sorted order and let each node remember the first 3 that pass through it. Then the answer for a prefix is already sitting on its node. When the walk falls off the trie, every later answer is empty.",
    },
    {
      kind: 'trace',
      title: 'Typing "mouse"',
      columns: ['typed', 'trie node', 'top 3 stored there'],
      rows: [
        ['m', 'root → m', 'mobile, moneypot, monitor'],
        ['mo', 'm → o', 'mobile, moneypot, monitor'],
        ['mou', 'o → u', 'mouse, mousepad'],
        ['mous', 'u → s', 'mouse, mousepad'],
        ['mouse', 's → e', 'mouse, mousepad'],
      ],
      note: 'Sorted order: mobile, moneypot, monitor, mouse, mousepad. Each node kept the first 3 words that were inserted through it.',
    },
    { kind: 'code', lang: 'js', code: SUGGEST_JS },
    {
      kind: 'text',
      text: "Now the big one. Module 9 found **one** word in a grid with backtracking: start at a cell, step to a neighbor, never reuse a cell on the same path, undo on the way back. Now you get **many** words. Running that search once per word repeats the same grid walks thousands of times, and each one only learns 'this word is not here'.",
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Walk the grid and the trie together',
      text: "Put all the words in a trie. Run **one** backtracking DFS from each cell, and move down the trie as you move across the grid. The trie answers 'can any word continue with this letter?' in O(1). If not, stop right there. When you land on a node that ends a word, you found it.",
    },
    {
      kind: 'diagram',
      title: 'Board and trie for words ab, abd, ca',
      art: art`
 board         trie
                 (root)
  a b            /    \
  c d           a      c
                |      |
                b*     a*
                |
                d*`,
      caption: 'Starting at `b` or `d` dies at once: no word starts with them. Starting at `a`: a → b finds "ab", → d finds "abd". Starting at `c`: c → a finds "ca".',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Word Search II: trie-guided backtracking',
      code: `function findWords(board, words):
    insert every word into a trie (store the word at its end node)
    found ← empty list
    function dfs(r, c, parent):
        node ← parent.children[board[r][c]]
        if node = null:
            return                          // no word goes this way
        if node.word ≠ null:
            append node.word to found
            node.word ← null                // never report it twice
        mark board[r][c] as used
        for each neighbor (nr, nc) inside the board:
            dfs(nr, nc, node)               // used cells have no child
        unmark board[r][c]
    for each cell (r, c):
        dfs(r, c, trie root)
    return found`,
    },
    { kind: 'code', lang: 'js', code: WORD_SEARCH_JS },
    {
      kind: 'compare',
      title: 'Find W words in an R × C grid',
      rows: [
        { approach: 'Backtracking once per word', time: 'O(W · R·C · 4^L)', space: 'O(L)', note: 'Each word repeats the same grid walks.' },
        { approach: 'Trie + one backtracking pass', time: 'O(R·C · 4^L) worst', space: 'O(total letters)', note: 'All words share each walk. The trie cuts a path the moment no word continues, so it is far faster in practice.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: trie-guided DFS',
      code: `function dfs(state, trieNode):
    next ← trieNode.children[letter at state]
    if next = null:
        return                              // prune: no word continues
    if next marks a word:
        record it
    for each move from state:               // grid neighbor, next key, child
        dfs(move, next)`,
    },
    {
      kind: 'list',
      items: [
        "**Reach for trie + DFS when** you must match *many* words at once (in a grid, a stream of key presses, a long text), or collect words in a-z order under a prefix.",
        'The trie is the pruning: one missing child kills a whole branch of the search.',
        'Want results in a-z order? Visit children in sorted order, or insert sorted input.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Duplicates and un-marking',
      text: 'The same word can be found along two different paths. Clear `node.word` after recording it, or it shows up twice. And always put the letter back (`board[r][c] = ch`) after exploring the neighbors, or later starting cells see a broken board.',
    },
  ],
  problems: [
    {
      id: 'bst-tries-search-suggestions',
      title: 'Search suggestions',
      difficulty: 'medium',
      leetcode: 1268,
      pattern: 'Trie',
      statement:
        'You have a list of distinct product names and a `searchWord` typed one letter at a time. After each letter, suggest at most **3** products that start with the typed prefix, picking the alphabetically smallest ones (in a-z order). Return a list with one suggestion list per letter. If nothing matches, that entry is `[]`.',
      examples: [
        {
          input: 'products = ["mobile","mouse","moneypot","monitor","mousepad"], searchWord = "mouse"',
          output: '[["mobile","moneypot","monitor"],["mobile","moneypot","monitor"],["mouse","mousepad"],["mouse","mousepad"],["mouse","mousepad"]]',
        },
        { input: 'products = ["havana"], searchWord = "tatiana"', output: '[[],[],[],[],[],[],[]]' },
      ],
      constraints: ['1 ≤ products.length ≤ 1000', 'Lowercase letters only', '1 ≤ searchWord.length ≤ 1000'],
      hints: [
        'Sorting the products first makes "the 3 smallest" easy: they are just the first 3 matches.',
        'Each new letter narrows the matches you already had. A trie walks one step per letter.',
        'Insert the sorted products into a trie and let every node keep the first 3 products that pass through it. Then walk `searchWord` and read each node.',
      ],
      approaches: [
        {
          name: 'Filter for every prefix',
          idea: 'Sort, then for each prefix scan all products and keep the first 3 that start with it. Correct but restarts every time.',
          time: 'O(N log N + L · N · L)',
          space: 'O(1) extra',
        },
        {
          name: 'Sort + binary search',
          idea: 'In a sorted list, all words with a prefix sit together. Binary search (module 5) finds where the prefix would go and the next 3 words are the candidates.',
          time: 'O(N log N + L · L log N)',
          space: 'O(1) extra',
        },
        {
          name: 'Trie with top 3 per node',
          idea: 'Products are inserted in a-z order, so the first 3 that pass through a node are the 3 smallest with that prefix. Each key press is one step down.',
          pseudo: `function suggestedProducts(products, word):
    sort products
    for each p in products:
        node ← root
        for each ch in p:
            if ch not in node.children:
                node.children[ch] ← new node with empty top
            node ← node.children[ch]
            if size of node.top < 3:
                append p to node.top
    out ← empty list
    node ← root
    for each ch in word:
        if node ≠ null:
            node ← node.children[ch]       // null if missing
        append (node.top if node ≠ null, else []) to out
    return out`,
          code: SUGGEST_JS,
          time: 'O(N log N + total letters)',
          space: 'O(total letters)',
        },
      ],
      fn: 'suggestedProducts',
      starter: `function suggestedProducts(products, searchWord) {
  // one list of up to 3 a-z suggestions per typed letter
  return [];
}`,
      solution: SUGGEST_JS,
      tests: [
        {
          name: 'example',
          args: [['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse'],
          expected: [
            ['mobile', 'moneypot', 'monitor'],
            ['mobile', 'moneypot', 'monitor'],
            ['mouse', 'mousepad'],
            ['mouse', 'mousepad'],
            ['mouse', 'mousepad'],
          ],
        },
        { name: 'one product, exact', args: [['havana'], 'havana'], expected: [['havana'], ['havana'], ['havana'], ['havana'], ['havana'], ['havana']] },
        {
          name: 'more than 3 matches',
          args: [['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'],
          expected: [['baggage', 'bags', 'banner'], ['baggage', 'bags', 'banner'], ['baggage', 'bags'], ['bags']],
        },
        { name: 'nothing matches', args: [['havana'], 'tatiana'], expected: [[], [], [], [], [], [], []] },
        { name: 'a word that is a prefix of others', args: [['apple', 'app', 'apricot', 'ape', 'apex'], 'ap'], expected: [['ape', 'apex', 'app'], ['ape', 'apex', 'app']] },
        { name: 'falls off midway', args: [['code', 'coder'], 'cox'], expected: [['code', 'coder'], ['code', 'coder'], []] },
      ],
      takeaway: 'Insert sorted, keep the first 3 at each node: every prefix answer is precomputed.',
    },
    {
      id: 'bst-tries-longest-word',
      title: 'Longest word built letter by letter',
      difficulty: 'medium',
      leetcode: 720,
      pattern: 'Trie',
      statement:
        'A word game: you may only play a word if every shorter start of it is also in the list (to play "cat" you need "c" and "ca" too). Return the longest word you can play. If there is a tie, return the alphabetically smallest. If no word can be played, return `""`.',
      examples: [
        { input: 'words = ["w","wo","wor","worl","world"]', output: '"world"' },
        { input: 'words = ["a","banana","app","appl","ap","apply","apple"]', output: '"apple"', explain: '"apply" and "apple" can both be built; "apple" is smaller.' },
      ],
      constraints: ['1 ≤ words.length ≤ 1000', '1 ≤ word length ≤ 30', 'Lowercase letters only'],
      hints: [
        'Store the words in a trie. A playable word is a path where *every* node on the way ends a word.',
        'DFS from the root, but only step into children that end a word.',
        'Visit children in a-z order and only replace the best when the new word is strictly longer: ties then keep the smaller word.',
      ],
      approaches: [
        {
          name: 'Set + check every prefix',
          idea: 'Put words in a Set. For each word, check that all its prefixes are in the set; keep the best by (length, then a-z).',
          time: 'O(N · L²)',
          space: 'O(total letters)',
        },
        {
          name: 'Trie + DFS through word nodes',
          idea: 'In the trie, a playable word is a path where every node is a word end. DFS only along such nodes finds exactly the playable words, and visiting children in a-z order makes ties resolve to the smallest.',
          pseudo: `function longestWord(words):
    insert every word into a trie (node.word ← the word at its end)
    best ← ""
    function dfs(node):
        for each letter ch in node.children, in a-z order:
            child ← node.children[ch]
            if child.word = null:
                continue                    // chain broken
            if length(child.word) > length(best):
                best ← child.word
            dfs(child)
    dfs(root)
    return best`,
          code: LONGEST_JS,
          time: 'O(total letters · log 26)',
          space: 'O(total letters)',
        },
      ],
      fn: 'longestWord',
      starter: `function longestWord(words) {
  // longest word whose every prefix is also a word; ties -> a-z smallest
  return '';
}`,
      solution: LONGEST_JS,
      tests: [
        { name: 'one chain', args: [['w', 'wo', 'wor', 'worl', 'world']], expected: 'world' },
        { name: 'tie goes to a-z', args: [['a', 'banana', 'app', 'appl', 'ap', 'apply', 'apple']], expected: 'apple' },
        { name: 'missing first letter', args: [['abc', 'ab']], expected: '' },
        { name: 'single letter', args: [['a']], expected: 'a' },
        { name: 'all single letters', args: [['a', 'b', 'c']], expected: 'a' },
        {
          name: 'two chains same length',
          args: [['m', 'mo', 'moc', 'moch', 'mocha', 'l', 'la', 'lat', 'latt', 'latte', 'c', 'ca', 'cat']],
          expected: 'latte',
        },
        {
          name: 'mixed lengths',
          args: [['yo', 'ew', 'fc', 'zrc', 'yodn', 'fcm', 'qm', 'qmo', 'fcmz', 'z', 'ewq', 'yod', 'ewqz', 'y']],
          expected: 'yodn',
        },
        { name: 'break in the middle', args: [['b', 'br', 'bre', 'brea', 'break', 'a', 'breaks', 'breakfast']], expected: 'breaks' },
      ],
      takeaway: 'DFS only through nodes that end a word to follow "built one letter at a time" chains.',
    },
    {
      id: 'bst-tries-word-search-ii',
      title: 'Word Search II (stretch)',
      difficulty: 'hard',
      leetcode: 212,
      pattern: 'Trie + DFS',
      statement:
        '**Stretch problem.** A Boggle-style game. Given a grid of letters and a list of distinct words, return every word that can be traced on the grid. A word is traced by moving between cells that share a side (up, down, left, right), and the same cell cannot be used twice in one word. Return the found words in any order.',
      examples: [
        {
          input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
          output: '["eat","oath"]',
        },
        { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]', explain: 'Tracing "abcb" would need to reuse b.' },
      ],
      constraints: ['1 ≤ rows, cols ≤ 12', '1 ≤ words.length ≤ 3·10⁴', '1 ≤ word length ≤ 10'],
      hints: [
        'Module 9 solved this for one word. Running it once per word repeats the same walks.',
        'Put all the words in a trie, and do one DFS per starting cell that moves in the grid and in the trie at the same time.',
        'Stop a path the moment the trie has no child for the next letter. Store the full word on its end node, record it when you reach it, then set it to null so it is not found twice.',
        'Mark a cell as used (e.g. `#`) before visiting neighbors and restore it after. A `#` never matches a trie child, so it also blocks reuse.',
      ],
      approaches: [
        {
          name: 'Word Search once per word',
          idea: 'Run the module 9 backtracking for each word from each cell. Each word repeats the same grid walks, and most of them fail.',
          time: 'O(W · R·C · 4^L)',
          space: 'O(L)',
        },
        {
          name: 'Trie-guided backtracking',
          idea: 'All words share one walk. The trie tells you instantly when no word continues with the current path, so dead paths are cut after one letter instead of being tried per word.',
          pseudo: `function findWords(board, words):
    insert every word into a trie (node.word ← word at its end)
    found ← empty list
    function dfs(r, c, parent):
        node ← parent.children[board[r][c]]
        if node = null:
            return
        if node.word ≠ null:
            append node.word to found
            node.word ← null
        ch ← board[r][c]
        board[r][c] ← '#'
        for each neighbor (nr, nc) inside the board:
            dfs(nr, nc, node)
        board[r][c] ← ch
    for each cell (r, c):
        dfs(r, c, root)
    return found`,
          code: WORD_SEARCH_JS,
          time: 'O(R·C · 4^L) worst',
          space: 'O(total letters)',
        },
      ],
      fn: 'findWords',
      starter: `function findWords(board, words) {
  // every word that can be traced on the board, in any order
  return [];
}`,
      solution: WORD_SEARCH_JS,
      tests: [
        { name: 'example', args: [BOARD, ['oath', 'pea', 'eat', 'rain']], expected: ['eat', 'oath'] },
        { name: 'cannot reuse a cell', args: [[['a', 'b'], ['c', 'd']], ['abcb']], expected: [] },
        { name: 'one cell', args: [[['a']], ['a']], expected: ['a'] },
        { name: 'too short a board', args: [[['a', 'a']], ['aaa']], expected: [] },
        {
          name: 'many words, some diagonal',
          args: [[['a', 'b'], ['c', 'd']], ['ab', 'ac', 'bd', 'ad', 'abdc', 'acdb', 'ca']],
          expected: ['ab', 'ac', 'bd', 'abdc', 'acdb', 'ca'],
        },
        { name: 'found on many paths, listed once', args: [[['a', 'a'], ['a', 'a']], ['aa', 'aaaa', 'aaaaa']], expected: ['aa', 'aaaa'] },
        {
          name: 'word inside another',
          args: [[['o', 'a', 'b', 'n'], ['o', 't', 'a', 'e'], ['a', 'h', 'k', 'r'], ['a', 'f', 'l', 'v']], ['oa', 'oaa']],
          expected: ['oa', 'oaa'],
        },
      ],
      compare: 'unordered',
      takeaway: 'Many words in one search: put them in a trie and let it prune the backtracking.',
    },
  ],
  quiz: [
    {
      prompt: 'Why insert the products in sorted order for search suggestions?',
      options: [
        'Tries only work on sorted input',
        'So the first 3 products that pass through each node are the 3 alphabetically smallest',
        'To save memory',
        'So the trie is balanced',
      ],
      answer: 1,
      explanation: 'Each node keeps the first 3 words inserted through it. Insert in a-z order and those are exactly the 3 smallest for that prefix.',
    },
    {
      prompt: 'In Word Search II, what makes the trie version faster than searching for each word separately?',
      options: [
        'It visits fewer cells to start from',
        'All words share one walk, and a path stops as soon as no word continues it',
        'It sorts the board first',
        'It uses BFS instead of DFS',
      ],
      answer: 1,
      explanation: 'One DFS checks every word at once, and the trie cuts a path the moment its letters are not the start of any word.',
    },
    {
      prompt: 'You found "oath" in Word Search II. Why set `node.word = null`?',
      options: ['To free memory', 'So the same word is not reported again from another path', 'Because the word is invalid now', 'To mark the cell as used'],
      answer: 1,
      explanation: 'A word can often be traced in more than one way. Clearing it after the first find keeps the output free of duplicates.',
    },
  ],
  takeaways: [
    'Trie + DFS: move through the trie and the other structure together; a missing child prunes the branch.',
    'Store answers on nodes (top 3, the full word) so reading them is free.',
    'Backtracking rules from module 9 still apply: mark before exploring, restore after.',
  ],
};
