import type { Lesson } from '../types';

// Lesson 4 of module 11: the trie (prefix tree): insert, search, startsWith, wildcard search.

/** Monospace art without the leading newline; backslashes kept as typed. */
const art = (s: TemplateStringsArray) => s.raw[0].slice(1);

const TRIE_JS = `class Trie {
  constructor() {
    this.root = { children: {}, end: false };
  }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  // follow the letters of s; null if the path breaks
  walk(s) {
    let node = this.root;
    for (const ch of s) {
      node = node.children[ch];
      if (!node) return null;
    }
    return node;
  }
  search(word) {
    const node = this.walk(word);
    return node !== null && node.end;
  }
  startsWith(prefix) {
    return this.walk(prefix) !== null;
  }
}`;

const RUN_TRIE = `function runTrie(ops) {
  const trie = new Trie();
  return ops.map(([op, word]) => {
    if (op === 'insert') {
      trie.insert(word);
      return null;
    }
    return op === 'search' ? trie.search(word) : trie.startsWith(word);
  });
}`;

const WORD_DICT_JS = `class WordDictionary {
  constructor() {
    this.root = { children: {}, end: false };
  }
  addWord(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  search(word) {
    const dfs = (node, i) => {
      if (i === word.length) return node.end;
      const ch = word[i];
      if (ch === '.') {
        for (const child of Object.values(node.children)) {
          if (dfs(child, i + 1)) return true;
        }
        return false;
      }
      const child = node.children[ch];
      return child ? dfs(child, i + 1) : false;
    };
    return dfs(this.root, 0);
  }
}`;

const RUN_WORD_DICT = `function runWordDictionary(ops) {
  const dict = new WordDictionary();
  return ops.map(([op, word]) => {
    if (op === 'addWord') {
      dict.addWord(word);
      return null;
    }
    return dict.search(word);
  });
}`;

const MAP_SUM_JS = `class MapSum {
  constructor() {
    this.root = { children: {}, score: 0 };
    this.values = new Map();              // key -> its current value
  }
  insert(key, val) {
    const delta = val - (this.values.get(key) ?? 0);
    this.values.set(key, val);
    let node = this.root;
    for (const ch of key) {
      if (!node.children[ch]) node.children[ch] = { children: {}, score: 0 };
      node = node.children[ch];
      node.score += delta;                // every prefix of key gains delta
    }
  }
  sum(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children[ch];
      if (!node) return 0;
    }
    return node.score;
  }
}`;

const RUN_MAP_SUM = `function runMapSum(ops) {
  const map = new MapSum();
  return ops.map(([op, key, val]) => {
    if (op === 'insert') {
      map.insert(key, val);
      return null;
    }
    return map.sum(key);
  });
}`;

const REPLACE_JS = `function replaceWords(dictionary, sentence) {
  const root = { children: {}, end: false };
  for (const w of dictionary) {
    let node = root;
    for (const ch of w) {
      if (!node.children[ch]) node.children[ch] = { children: {}, end: false };
      node = node.children[ch];
    }
    node.end = true;
  }
  const shortestRoot = (word) => {
    let node = root;
    for (let i = 0; i < word.length; i++) {
      node = node.children[word[i]];
      if (!node) return word;                  // no root fits
      if (node.end) return word.slice(0, i + 1); // first (shortest) root
    }
    return word;
  };
  return sentence.split(' ').map(shortestRoot).join(' ');
}`;

export const trieLesson: Lesson = {
  id: 'trie-basics',
  title: 'Tries: insert, search, prefix',
  summary: 'Store words letter by letter so every word with the same start shares one path.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Typing "ca" in your contacts',
      text: "You have 2,000 contacts. You type `c`, then `a`, and the list shrinks to Carla, Carlos and Cathy before your thumb lifts. Search boxes do the same with millions of past searches, and spell checkers do it for every word you type. None of them scan the whole list on each key press.",
    },
    {
      kind: 'text',
      text: 'The problem: you have a dictionary of words. Answer two kinds of questions, many times: **is X a word?** and **does any word start with P?** For example, with `car, card, care, cat, do, dog`: is "ca" a word? (no) Does any word start with "ca"? (yes)',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: check every word',
      code: `function startsWith(words, prefix):
    for each w in words:
        if w begins with prefix:
            return true
    return false
// N words, prefix length L: O(N · L) per question`,
    },
    {
      kind: 'text',
      text: 'A set answers "is X a word?" in O(L), but it cannot answer prefix questions unless you also store every prefix of every word. And the brute force wastes work: `car`, `card`, `care` and `cat` all start with "ca", yet it compares `c` and `a` against each of them separately.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Store each shared start once',
      text: "Build a tree where each step down is one letter. A path from the root spells a prefix, and words with the same start share the same path. Mark the nodes where a whole word ends. This is a **trie** (say 'try', from re*trie*val), also called a prefix tree. Answering a question means walking one letter at a time: **O(L)**, no matter how many words are stored.",
    },
    {
      kind: 'diagram',
      title: 'Trie for car, card, care, cat, do, dog',
      art: art`
              (root)
              /    \
             c      d
             |      |
             a      o*
            / \     |
           r*  t*   g*
          / \
         d*  e*

 * = a word ends here`,
      caption: '"ca" exists as a path, so some word starts with it. But the `a` node has no `*`, so "ca" is not a word. "do" is both a word and a prefix of "dog".',
    },
    {
      kind: 'trace',
      title: 'insert("cart") into the trie above',
      columns: ['letter', 'child exists?', 'action'],
      rows: [
        ['c', 'yes', 'move down to c'],
        ['a', 'yes', 'move down to a'],
        ['r', 'yes', 'move down to r'],
        ['t', 'no', 'create node t, move down'],
        ['(end)', '-', 'mark t as end of a word'],
      ],
      note: 'Only one new node. The shared start "car" was already there.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Trie',
      code: `// each node has: children (map letter → node), end (a word ends here?)

function insert(word):
    node ← root
    for each ch in word:
        if ch not in node.children:
            node.children[ch] ← new node
        node ← node.children[ch]
    node.end ← true

function walk(s):                       // follow s; null if the path breaks
    node ← root
    for each ch in s:
        if ch not in node.children:
            return null
        node ← node.children[ch]
    return node

function search(word):     return walk(word) ≠ null and walk(word).end
function startsWith(p):    return walk(p) ≠ null`,
    },
    { kind: 'code', lang: 'js', code: TRIE_JS },
    {
      kind: 'text',
      text: "Now a twist: a search pattern can contain `.`, which matches any one letter (`.at` matches cat and bat). At a normal letter you still follow one child. At a `.` you don't know which child, so **try every child** with DFS and succeed if any path works. That is the first time a trie needs DFS; lesson 5 goes all in.",
    },
    {
      kind: 'compare',
      title: 'Answer "does any word start with P?"',
      rows: [
        { approach: 'Scan the list', time: 'O(N · L) per query', space: 'O(1) extra', note: 'Fine for one query, too slow for a search box.' },
        { approach: 'Sorted list + binary search', time: 'O(L · log N) per query', space: 'O(1) extra', note: 'Find where P would go, then check that word. Good, but harder to extend.' },
        { approach: 'Trie', time: 'O(L) per query', space: 'O(total letters)', note: 'Independent of N. Easy to extend: counts, wildcards, top suggestions.' },
      ],
    },
    {
      kind: 'list',
      items: [
        "**Reach for a trie when** you see: prefix, starts with, autocomplete, dictionary of words, 'replace with the shortest root', or many string lookups that share starts.",
        'Each node holds `children` plus whatever the problem needs at that spot: `end`, a count, a score, the full word.',
        'Most trie answers are: walk the letters, then read the node you stopped at.',
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'A path is not a word',
      text: "After inserting only \"apple\", `search(\"app\")` must be **false**: the path exists, but no word ends there. Forgetting the `end` flag makes search behave like startsWith. Also, a trie is memory hungry (one object per letter), so don't reach for it when a plain `Set` of whole words is enough.",
    },
  ],
  problems: [
    {
      id: 'bst-tries-implement-trie',
      title: 'Implement a trie',
      difficulty: 'medium',
      leetcode: 208,
      pattern: 'Trie',
      statement:
        'Build a trie with `insert(word)`, `search(word)` (is this exact word stored?) and `startsWith(prefix)` (is any stored word starting with it?). We test it as one function: `runTrie(ops)`, where each op is `["insert", w]`, `["search", w]` or `["startsWith", p]`. Return a list with one output per op: `null` for insert, `true`/`false` for the others. The starter already has `runTrie`; fill in the class.',
      examples: [
        {
          input: 'ops = [["insert","apple"],["search","apple"],["search","app"],["startsWith","app"],["insert","app"],["search","app"]]',
          output: '[null,true,false,true,null,true]',
          explain: '"app" is only a prefix until it is inserted as a word.',
        },
      ],
      constraints: ['Words use lowercase a-z', '1 ≤ word length ≤ 2000', 'At most 3·10⁴ ops'],
      hints: [
        'Each node needs a map from letter to child, plus a flag for "a word ends here".',
        'search and startsWith both walk the letters. Write that walk once.',
        'search = the walk reaches a node AND its end flag is true. startsWith = the walk reaches a node.',
      ],
      approaches: [
        {
          name: 'Array of words',
          idea: 'Keep every word in a list. search compares with each word, startsWith checks `w.startsWith(p)` for each. O(N · L) per query.',
          time: 'O(N · L) per query',
          space: 'O(total letters)',
        },
        {
          name: 'Trie',
          idea: 'Shared starts are stored once, so every operation just walks the letters of its input: cost depends on the word length, not on how many words are stored.',
          pseudo: `function insert(word):
    node ← root
    for each ch in word:
        if ch not in node.children:
            node.children[ch] ← new node
        node ← node.children[ch]
    node.end ← true

function walk(s):
    node ← root
    for each ch in s:
        if ch not in node.children: return null
        node ← node.children[ch]
    return node

search(word)   = walk(word) ≠ null and walk(word).end
startsWith(p)  = walk(p) ≠ null`,
          code: TRIE_JS,
          time: 'O(L) per op',
          space: 'O(total letters)',
        },
      ],
      fn: 'runTrie',
      starter: `class Trie {
  constructor() {
    // set up the root node
  }
  insert(word) {}
  search(word) {
    return false;
  }
  startsWith(prefix) {
    return false;
  }
}

${RUN_TRIE}`,
      solution: `${TRIE_JS}

${RUN_TRIE}`,
      tests: [
        {
          name: 'example',
          args: [[['insert', 'apple'], ['search', 'apple'], ['search', 'app'], ['startsWith', 'app'], ['insert', 'app'], ['search', 'app']]],
          expected: [null, true, false, true, null, true],
        },
        { name: 'empty trie', args: [[['search', 'a'], ['startsWith', 'a']]], expected: [false, false] },
        {
          name: 'shared start',
          args: [[['insert', 'car'], ['insert', 'cart'], ['search', 'ca'], ['startsWith', 'ca'], ['search', 'cart'], ['search', 'carts'], ['startsWith', 'carts']]],
          expected: [null, null, false, true, true, false, false],
        },
        { name: 'insert twice', args: [[['insert', 'a'], ['insert', 'a'], ['search', 'a'], ['startsWith', 'a']]], expected: [null, null, true, true] },
        {
          name: 'prefix longer than word',
          args: [[['insert', 'dog'], ['startsWith', 'doge'], ['search', 'do'], ['startsWith', 'd']]],
          expected: [null, false, false, true],
        },
        {
          name: 'differs at the last letter',
          args: [[['insert', 'abc'], ['search', 'abd'], ['startsWith', 'abd'], ['startsWith', 'abc']]],
          expected: [null, false, false, true],
        },
      ],
      takeaway: 'A trie node = children + an end flag. search needs the flag; startsWith only needs the path.',
    },
    {
      id: 'bst-tries-word-dictionary',
      title: 'Word dictionary with wildcards',
      difficulty: 'medium',
      leetcode: 211,
      pattern: 'Trie',
      statement:
        "A crossword helper. Support `addWord(word)` and `search(pattern)`, where the pattern may contain `.` meaning 'any one letter'. `search` returns true if any stored word matches the whole pattern. Test format: `runWordDictionary(ops)` with ops `[\"addWord\", w]` or `[\"search\", p]`; return one output per op (`null` for addWord). The starter has the runner; fill in the class.",
      examples: [
        {
          input: 'ops = [["addWord","bad"],["addWord","dad"],["addWord","mad"],["search","pad"],["search","bad"],["search",".ad"],["search","b.."]]',
          output: '[null,null,null,false,true,true,true]',
        },
      ],
      constraints: ['Words use lowercase a-z', 'Patterns have at most 2 dots', 'At most 10⁴ ops'],
      hints: [
        'Without dots this is plain trie search.',
        'At a `.`, you do not know which child to take. So try all of them.',
        'Write `dfs(node, i)`: if i is the end, return node.end. If pattern[i] is a dot, return true if dfs works for any child; otherwise follow that one letter.',
      ],
      approaches: [
        {
          name: 'Compare with every word',
          idea: 'Keep a list. For each word of the same length, check letter by letter, treating `.` as a match. O(N · L) per search.',
          time: 'O(N · L) per search',
          space: 'O(total letters)',
        },
        {
          name: 'Trie + DFS on dots',
          idea: 'Normal letters follow one path. A dot branches into every child, but the trie still prunes: a branch dies as soon as the next letter is missing.',
          pseudo: `function search(pattern):
    function dfs(node, i):
        if i = length of pattern:
            return node.end
        ch ← pattern[i]
        if ch = '.':
            for each child in node.children:
                if dfs(child, i + 1):
                    return true
            return false
        if ch not in node.children:
            return false
        return dfs(node.children[ch], i + 1)
    return dfs(root, 0)`,
          code: WORD_DICT_JS,
          time: 'O(L) without dots, up to O(26^d · L) with d dots',
          space: 'O(total letters)',
        },
      ],
      fn: 'runWordDictionary',
      starter: `class WordDictionary {
  constructor() {
    // set up the root node
  }
  addWord(word) {}
  search(word) {
    // '.' matches any one letter
    return false;
  }
}

${RUN_WORD_DICT}`,
      solution: `${WORD_DICT_JS}

${RUN_WORD_DICT}`,
      tests: [
        {
          name: 'example',
          args: [[['addWord', 'bad'], ['addWord', 'dad'], ['addWord', 'mad'], ['search', 'pad'], ['search', 'bad'], ['search', '.ad'], ['search', 'b..']]],
          expected: [null, null, null, false, true, true, true],
        },
        { name: 'empty dictionary', args: [[['search', '.']]], expected: [false] },
        { name: 'length must match', args: [[['addWord', 'a'], ['search', '.'], ['search', '..'], ['search', 'a']]], expected: [null, true, false, true] },
        {
          name: 'mixed',
          args: [
            [
              ['addWord', 'at'], ['addWord', 'and'], ['addWord', 'an'], ['addWord', 'add'],
              ['search', 'a'], ['search', '.at'], ['addWord', 'bat'], ['search', '.at'],
              ['search', 'an.'], ['search', 'a.d.'], ['search', 'b.'], ['search', 'a.d'],
            ],
          ],
          expected: [null, null, null, null, false, false, null, true, true, false, false, true],
        },
        { name: 'all dots', args: [[['addWord', 'abc'], ['search', '...'], ['search', '....'], ['search', '.b.']]], expected: [null, true, false, true] },
        { name: 'prefix is not a word', args: [[['addWord', 'apple'], ['search', 'app'], ['search', 'appl.']]], expected: [null, false, true] },
      ],
      takeaway: 'A wildcard turns one path into a DFS over children; the trie still prunes dead branches.',
    },
    {
      id: 'bst-tries-replace-words',
      title: 'Replace words with their roots',
      difficulty: 'medium',
      leetcode: 648,
      pattern: 'Trie',
      statement:
        'A text shortener has a dictionary of **roots** (like "cat"). In a sentence, replace every word that starts with a root by that root. If several roots fit, use the **shortest**. Words with no matching root stay as they are. Words are separated by single spaces.',
      examples: [
        {
          input: 'dictionary = ["cat","bat","rat"], sentence = "the cattle was rattled by the battery"',
          output: '"the cat was rat by the bat"',
        },
        { input: 'dictionary = ["a","aa","aaa"], sentence = "aa aaa aaaa"', output: '"a a a"', explain: '"a" is the shortest root for all three.' },
      ],
      constraints: ['1 ≤ dictionary.length ≤ 1000', 'sentence length ≤ 10⁶', 'Lowercase letters and spaces only'],
      hints: [
        'Checking every root against every word works but repeats a lot of comparisons.',
        'Put the roots in a trie. For each word, walk its letters down the trie.',
        'The first node you reach that ends a root is the shortest root. If the path breaks first, keep the word.',
      ],
      approaches: [
        {
          name: 'Check every root',
          idea: 'For each word, test every root with `startsWith` and keep the shortest match. With R roots this is O(R · L) per word.',
          time: 'O(W · R · L)',
          space: 'O(1) extra',
        },
        {
          name: 'Trie of roots',
          idea: 'Walking a word down the trie meets roots from shortest to longest, so the first `end` node you hit is the answer. Stop there.',
          pseudo: `function replaceWords(dictionary, sentence):
    insert every root into a trie
    out ← empty list
    for each word in sentence split by spaces:
        node ← root of trie
        replacement ← word
        for i from 0 to length(word) - 1:
            if word[i] not in node.children:
                break                          // no root fits
            node ← node.children[word[i]]
            if node.end:
                replacement ← word[0..i]       // shortest root
                break
        append replacement to out
    return out joined by spaces`,
          code: REPLACE_JS,
          time: 'O(total letters)',
          space: 'O(letters in roots)',
        },
      ],
      fn: 'replaceWords',
      starter: `function replaceWords(dictionary, sentence) {
  // replace each word by its shortest root from dictionary
  return sentence;
}`,
      solution: REPLACE_JS,
      tests: [
        { name: 'example', args: [['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], expected: 'the cat was rat by the bat' },
        { name: 'single letters', args: [['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'], expected: 'a a b c' },
        { name: 'shortest root wins', args: [['a', 'aa', 'aaa'], 'aa aaa aaaa'], expected: 'a a a' },
        { name: 'longer root also present', args: [['catt', 'cat', 'bat', 'rat'], 'the cattle was rattled by the battery'], expected: 'the cat was rat by the bat' },
        { name: 'no root fits', args: [['xyz'], 'hello world'], expected: 'hello world' },
        { name: 'word equals root', args: [['he'], 'he'], expected: 'he' },
        { name: 'word shorter than root', args: [['cat'], 'ca cat'], expected: 'ca cat' },
      ],
      takeaway: 'Walking a word down a trie meets its prefixes shortest first.',
    },
    {
      id: 'bst-tries-map-sum',
      title: 'Prefix score sum',
      difficulty: 'medium',
      leetcode: 677,
      pattern: 'Trie',
      statement:
        'A shop tags products with a name and a sales score. `insert(key, val)` sets the score of `key` (inserting the same key again **replaces** its old score). `sum(prefix)` returns the total score of all keys that start with `prefix`. Test format: `runMapSum(ops)` with ops `["insert", key, val]` or `["sum", prefix]`; return one output per op (`null` for insert). The starter has the runner; fill in the class.',
      examples: [
        { input: 'ops = [["insert","apple",3],["sum","ap"],["insert","app",2],["sum","ap"]]', output: '[null,3,null,5]' },
        { input: 'ops = [["insert","apple",3],["insert","apple",2],["sum","ap"]]', output: '[null,null,2]', explain: 'The second insert replaces 3 with 2.' },
      ],
      constraints: ['1 ≤ key length, prefix length ≤ 50', '1 ≤ val ≤ 1000', 'At most 50 ops'],
      hints: [
        'A simple version: on `sum`, walk to the prefix node and add up every value below it with DFS.',
        'Faster: store at each node the total score of all keys passing through it. Then `sum` is just a walk.',
        'For replacing, remember each key\'s old value in a Map and add only the difference (`val - old`) along the path.',
      ],
      approaches: [
        {
          name: 'Map + scan',
          idea: 'Store key → value in a Map. On `sum`, loop over all keys and add those that start with the prefix.',
          time: 'O(N · L) per sum',
          space: 'O(total letters)',
        },
        {
          name: 'Trie with running totals',
          idea: 'Every key adds its score to each node on its path, so a node holds the total for its prefix. On replace, push only the change (new - old) down the path.',
          pseudo: `function insert(key, val):
    delta ← val - (old value of key, or 0)
    remember key → val
    node ← root
    for each ch in key:
        if ch not in node.children:
            node.children[ch] ← new node with score 0
        node ← node.children[ch]
        node.score ← node.score + delta

function sum(prefix):
    node ← walk(prefix)
    return 0 if node = null, else node.score`,
          code: MAP_SUM_JS,
          time: 'O(L) per op',
          space: 'O(total letters)',
        },
      ],
      fn: 'runMapSum',
      starter: `class MapSum {
  constructor() {
    // set up your trie (and anything else you need)
  }
  insert(key, val) {}
  sum(prefix) {
    return 0;
  }
}

${RUN_MAP_SUM}`,
      solution: `${MAP_SUM_JS}

${RUN_MAP_SUM}`,
      tests: [
        { name: 'example', args: [[['insert', 'apple', 3], ['sum', 'ap'], ['insert', 'app', 2], ['sum', 'ap']]], expected: [null, 3, null, 5] },
        { name: 'replace a key', args: [[['insert', 'apple', 3], ['insert', 'apple', 2], ['sum', 'ap']]], expected: [null, null, 2] },
        { name: 'empty', args: [[['sum', 'a']]], expected: [0] },
        {
          name: 'several prefixes',
          args: [[['insert', 'a', 3], ['insert', 'ab', 4], ['sum', 'a'], ['sum', 'ab'], ['sum', 'abc'], ['sum', 'b']]],
          expected: [null, null, 7, 4, 0, 0],
        },
        {
          name: 'replace then add',
          args: [[['insert', 'aa', 3], ['sum', 'a'], ['insert', 'aa', 2], ['sum', 'a'], ['insert', 'ab', 5], ['sum', 'a']]],
          expected: [null, 3, null, 2, null, 7],
        },
        { name: 'whole key as prefix', args: [[['insert', 'cat', 10], ['insert', 'car', 1], ['sum', 'cat'], ['sum', 'ca']]], expected: [null, null, 10, 11] },
      ],
      takeaway: 'Store an answer at each trie node and prefix queries become a single walk.',
    },
  ],
  quiz: [
    {
      prompt: 'The trie holds only "apple". What do `search("app")` and `startsWith("app")` return?',
      options: ['true, true', 'false, true', 'true, false', 'false, false'],
      answer: 1,
      explanation: 'The path a-p-p exists, so startsWith is true. No word ends at that node, so search is false.',
    },
    {
      prompt: 'A trie stores 1 million words. How long does `startsWith("pre")` take?',
      options: ['About 1 million steps', 'About 3 steps (one per letter)', 'About 20 steps (log of a million)', 'It depends on how many words start with "pre"'],
      answer: 1,
      explanation: 'You walk one node per letter of the prefix. The number of stored words does not matter.',
    },
    {
      prompt: 'In a wildcard search, what do you do at a `.`?',
      options: ['Skip the letter', 'Follow the first child only', 'Try every child and succeed if any path works', 'Return false'],
      answer: 2,
      explanation: 'A dot can be any letter, so each child is a possible match. DFS tries them all.',
    },
  ],
  takeaways: [
    'A trie stores words as paths of letters; shared starts are stored once.',
    'Operations walk the letters: O(L), no matter how many words are stored.',
    'Put extra info on nodes (end flag, count, score, word) to answer prefix questions in one walk.',
  ],
};
