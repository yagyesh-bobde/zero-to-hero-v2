import type { Lesson } from '../types';

// Module 7, lesson 6: design with lists (LRU cache = hash map + doubly linked list; browser history).
const lesson: Lesson = {
  id: 'lru-cache',
  title: 'Design: the LRU cache',
  summary: 'A hash map finds a node in O(1); a doubly linked list moves or drops it in O(1).',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Which photo do we forget?',
      text: "A photo app keeps the **3** most recently viewed full-size photos in memory, so flipping back is instant. Open a 4th and one must go: the one you looked at **least recently**. Browsers, CDNs, databases and even your CPU use this rule. It is called **LRU** (Least Recently Used), and it is one of the most asked design questions.",
    },
    {
      kind: 'text',
      text: "**The problem.** Build a cache with a fixed `capacity` and two operations. `get(key)` returns the value, or -1 if missing; reading counts as using it. `put(key, value)` adds or updates a key, which also counts as using it; if that pushes the size over `capacity`, throw out the least recently used key. **Both must be O(1).**",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: a map plus an array of keys',
      code: `values ← empty map                // key → value
order ← empty list                // keys, least recent first

function touch(key):              // mark key as just used
    remove key from order         // O(n): search, then shift
    append key to order

function get(key):
    if key not in values: return -1
    touch(key)
    return values[key]

function put(key, value):
    values[key] ← value
    touch(key)
    if size of values > capacity:
        oldest ← first item of order
        remove it from order and from values`,
    },
    {
      kind: 'text',
      text: "Correct, but every operation searches and shifts the array: **O(n)** each. With a million cached items, that is a million steps per photo tap.",
    },
    {
      kind: 'text',
      text: "**Spot the waste.** The map already finds the *value* in O(1). The slow part is the *order*: an array is bad at pulling an item out of the middle. A linked list can unlink a node in O(1), **if** you are already holding the node and can reach the node before it. So store the node in the map, and give every node a `prev` pointer.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Hash map + doubly linked list',
      text: "Keep the keys in a **doubly linked list** (each node has `prev` and `next`), most recent at the front. The **map** goes from key to its node. Use: map lookup O(1), unlink O(1), re-insert at the front O(1). Evict: the node just before the back is the least recent, O(1). Add two **sentinels** (dummy nodes) `head` and `tail` so the list is never empty and nothing is ever null: lesson 1's dummy, on both ends.",
    },
    {
      kind: 'diagram',
      title: 'Capacity 3',
      art: `map: { 1 → node, 2 → node, 3 → node }

head ⇄ [3] ⇄ [1] ⇄ [2] ⇄ tail
       newest           oldest

get(2): unlink [2], put it right after head
head ⇄ [2] ⇄ [3] ⇄ [1] ⇄ tail

put(4): too full, so drop tail.prev ([1]),
delete key 1 from the map, add [4] after head
head ⇄ [4] ⇄ [2] ⇄ [3] ⇄ tail`,
      caption: 'Every step touches a fixed number of pointers, no matter how big the cache is.',
    },
    {
      kind: 'trace',
      title: 'Capacity 2, a run of operations',
      columns: ['operation', 'returns', 'list (newest → oldest)', 'what happened'],
      rows: [
        ['put(1, 1)', 'null', '1', 'added'],
        ['put(2, 2)', 'null', '2 1', 'added'],
        ['get(1)', 1, '1 2', '1 moves to the front'],
        ['put(3, 3)', 'null', '3 1', 'over capacity: evict 2'],
        ['get(2)', -1, '3 1', '2 is gone'],
        ['put(4, 4)', 'null', '4 3', 'evict 1'],
        ['get(3)', 3, '3 4', '3 moves to the front'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'LRU cache',
      code: `map ← empty map                        // key → node
head ← new node                        // sentinel on the newest side
tail ← new node                        // sentinel on the oldest side
head.next ← tail
tail.prev ← head

function remove(node):                 // unlink, O(1)
    node.prev.next ← node.next
    node.next.prev ← node.prev

function addFront(node):               // insert after head, O(1)
    node.prev ← head
    node.next ← head.next
    head.next.prev ← node
    head.next ← node

function get(key):
    if key not in map: return -1
    node ← map[key]
    remove(node)
    addFront(node)                     // now most recent
    return node.val

function put(key, value):
    if key in map: remove(map[key])
    node ← new node(key, value)        // keep the key in the node!
    map[key] ← node
    addFront(node)
    if size of map > capacity:
        lru ← tail.prev
        remove(lru)
        delete lru.key from map`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key -> node
    this.head = { prev: null, next: null }; // newest side
    this.tail = { prev: null, next: null }; // oldest side
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  addFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node);
    this.addFront(node);
    return node.val;
  }
  put(key, val) {
    const old = this.map.get(key);
    if (old) this.remove(old);
    const node = { key, val, prev: null, next: null };
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: "JavaScript's secret LRU",
      text: "A JS `Map` remembers insertion order. `map.delete(k)` then `map.set(k, v)` moves `k` to the end, and `map.keys().next().value` is the oldest key. That is a 10-line LRU, and Java's `LinkedHashMap` is the same idea built in. Nice to mention, but interviewers usually ask you to build the list yourself, because inside those tools *is* a hash map plus a linked list.",
    },
    {
      kind: 'compare',
      title: 'LRU cache',
      rows: [
        { approach: 'Map + array of keys', time: 'O(n) per op', space: 'O(capacity)', note: 'Search and shift the array on every use.' },
        { approach: 'JS Map insertion order', time: 'O(1) per op', space: 'O(capacity)', note: 'Short, but leans on a language feature.' },
        { approach: 'Map + doubly linked list', time: 'O(1) per op', space: 'O(capacity)', note: 'Works in any language. The expected answer.' },
      ],
    },
    {
      kind: 'text',
      text: "**Signals.** \"O(1) get and put\", \"least recently used\", \"move to front\", \"evict the oldest\", or any time you must *find* an item fast **and** keep items in an order you change often. The map finds; the doubly linked list orders. **Counter-signal:** if you need to jump *k* places (browser history's \"back 3 pages\"), a list walks k steps; an array with an index jumps in O(1). Pick the structure for the operations you need.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three ways to break an LRU',
      text: "(1) Evicting from the list but forgetting `map.delete(lru.key)`: the map then points at a dead node. That is why the node stores its **key**. (2) Updating an existing key without removing its old node: the list gets two nodes for one key. (3) Forgetting that `get` counts as a use: it must move the node to the front too.",
    },
  ],
  problems: [
    {
      id: 'linked-lists-lru-cache',
      title: 'Photo cache (LRU)',
      difficulty: 'medium',
      leetcode: 146,
      pattern: 'Hash map + doubly linked list',
      statement: "Build an `LRUCache` class: `new LRUCache(capacity)`, `get(key)` returns the value or -1, and `put(key, value)` adds or updates. Both `get` and `put` count as using the key. When a `put` makes the cache hold more than `capacity` keys, remove the least recently used key. Aim for O(1) per operation. The test helper `runLRU(capacity, ops)` is already written for you: it creates your cache, runs each operation (like `[\"put\", 1, 1]` or `[\"get\", 1]`), and returns the outputs (`null` for each `put`).",
      examples: [
        {
          input: 'capacity = 2, ops = [put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)]',
          output: '[null, null, 1, null, -1, null, -1, 3, 4]',
          explain: 'put(3,3) evicts 2 (1 was used more recently). put(4,4) evicts 1.',
        },
      ],
      constraints: ['1 ≤ capacity ≤ 3000', 'at most 2 · 10⁵ operations'],
      hints: [
        'A `Map` gives O(1) lookup. The hard part is keeping the "most recently used" order in O(1).',
        'Keep the keys in a list ordered by recency. To move a node from the middle to the front in O(1), each node needs `prev` and `next`.',
        'Use two sentinel nodes `head` and `tail`, a `remove(node)` and an `addFront(node)` helper. Store the key inside each node so you can delete it from the map when you evict `tail.prev`.',
      ],
      approaches: [
        {
          name: 'Map + array of keys',
          idea: 'The map holds values; an array holds keys from oldest to newest. Each use searches the array and moves the key to the end: correct, but O(n).',
          time: 'O(n) per op',
          space: 'O(capacity)',
        },
        {
          name: 'JS Map insertion order',
          idea: 'A JS `Map` iterates in insertion order, so delete + set makes a key the newest, and the first key is the oldest. Valid in JS, but it hides the real data structure.',
          code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  put(key, val) {
    this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value);
  }
}`,
          time: 'O(1) per op',
          space: 'O(capacity)',
        },
        {
          name: 'Hash map + doubly linked list',
          idea: 'The map jumps straight to a node; `prev`/`next` pointers let you unlink it and re-insert it at the front in O(1). The least recent node is always right before the tail sentinel.',
          pseudo: `function get(key):
    if key not in map: return -1
    node ← map[key]
    remove(node)
    addFront(node)
    return node.val

function put(key, value):
    if key in map: remove(map[key])
    node ← new node(key, value)
    map[key] ← node
    addFront(node)
    if size of map > capacity:
        lru ← tail.prev
        remove(lru)
        delete lru.key from map`,
          code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = { prev: null, next: null };
    this.tail = { prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  addFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node);
    this.addFront(node);
    return node.val;
  }
  put(key, val) {
    const old = this.map.get(key);
    if (old) this.remove(old);
    const node = { key, val, prev: null, next: null };
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}`,
          time: 'O(1) per op',
          space: 'O(capacity)',
        },
      ],
      fn: 'runLRU',
      starter: `class LRUCache {
  constructor(capacity) {
    // Your code here: set up your map and your list.
  }
  get(key) {
    // Your code here: return the value (and mark it as used), or -1.
    return -1;
  }
  put(key, value) {
    // Your code here: add/update, mark as used, evict the LRU key if over capacity.
  }
}

// Test helper (already written for you, don't edit): runs each operation and
// collects the outputs (null for put).
function runLRU(capacity, ops) {
  const cache = new LRUCache(capacity);
  return ops.map(([op, key, value]) => {
    if (op === 'get') return cache.get(key);
    cache.put(key, value);
    return null;
  });
}`,
      solution: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // key -> node
    this.head = { prev: null, next: null }; // newest side
    this.tail = { prev: null, next: null }; // oldest side
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  addFront(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }
  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this.remove(node);
    this.addFront(node);
    return node.val;
  }
  put(key, val) {
    const old = this.map.get(key);
    if (old) this.remove(old);
    const node = { key, val, prev: null, next: null };
    this.map.set(key, node);
    this.addFront(node);
    if (this.map.size > this.capacity) {
      const lru = this.tail.prev;
      this.remove(lru);
      this.map.delete(lru.key);
    }
  }
}

// Test helper (already written for you, don't edit): runs each operation and
// collects the outputs (null for put).
function runLRU(capacity, ops) {
  const cache = new LRUCache(capacity);
  return ops.map(([op, key, value]) => {
    if (op === 'get') return cache.get(key);
    cache.put(key, value);
    return null;
  });
}`,
      tests: [
        {
          name: 'classic',
          args: [2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]]],
          expected: [null, null, 1, null, -1, null, -1, 3, 4],
        },
        {
          name: 'capacity 1',
          args: [1, [['put', 1, 10], ['get', 1], ['put', 2, 20], ['get', 1], ['get', 2]]],
          expected: [null, 10, null, -1, 20],
        },
        {
          name: 'update refreshes the key',
          args: [2, [['put', 1, 1], ['put', 2, 2], ['put', 1, 100], ['put', 3, 3], ['get', 1], ['get', 2], ['get', 3]]],
          expected: [null, null, null, null, 100, -1, 3],
        },
        { name: 'get on empty cache', args: [2, [['get', 5]]], expected: [-1] },
        {
          name: 'get counts as a use',
          args: [2, [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 1], ['get', 2]]],
          expected: [null, null, 1, null, 1, -1],
        },
        {
          name: 'room to spare',
          args: [3, [['put', 1, 1], ['put', 2, 2], ['put', 3, 3], ['get', 1], ['get', 2], ['get', 3]]],
          expected: [null, null, null, 1, 2, 3],
        },
        {
          name: 'update does not evict',
          args: [2, [['put', 2, 1], ['put', 2, 2], ['get', 2], ['put', 1, 1], ['put', 4, 1], ['get', 2]]],
          expected: [null, null, 2, null, null, -1],
        },
      ],
      takeaway: 'O(1) find + O(1) reorder = hash map pointing into a doubly linked list, with sentinels on both ends.',
    },
    {
      id: 'linked-lists-browser-history',
      title: 'Back and forward buttons',
      difficulty: 'medium',
      leetcode: 1472,
      pattern: 'Doubly linked list vs array + index',
      statement: "Build a `BrowserHistory` class. `new BrowserHistory(homepage)` starts on the homepage. `visit(url)` opens a new page and **wipes all forward history**. `back(steps)` goes back up to `steps` pages (stop at the first page) and returns the current url. `forward(steps)` goes forward up to `steps` pages (stop at the last one) and returns the current url. The test helper `runBrowser(homepage, ops)` is already written for you: it runs operations like `[\"visit\", \"a.com\"]` or `[\"back\", 2]` and returns the outputs (`null` for each `visit`).",
      examples: [
        {
          input: 'home = "home.com"; visit a.com, visit b.com, visit c.com, back(1), back(1), forward(1), visit d.com, forward(2), back(2), back(7)',
          output: '[null, null, null, "b.com", "a.com", "b.com", null, "d.com", "a.com", "home.com"]',
          explain: 'Visiting d.com from b.com wipes c.com, so forward(2) stays on d.com. back(7) stops at the homepage.',
        },
      ],
      constraints: ['1 ≤ steps ≤ 100', 'at most 5000 calls'],
      hints: [
        'A doubly linked list of pages fits naturally: back = follow `prev`, forward = follow `next`, visit = cut off `next` and attach a new node.',
        'With a list, back(k) walks k nodes. Could an array with an index jump there directly?',
        'Keep `pages`, an index `cur` and an index `last` (the furthest forward page). Visit: `cur++`, overwrite `pages[cur]`, `last = cur`. Back/forward: move `cur` and clamp it between 0 and `last`.',
      ],
      approaches: [
        {
          name: 'Doubly linked list',
          idea: 'Each page is a node with `prev` and `next`. Visiting links a new node after the current one, which drops the old forward pages. Back and forward follow pointers one step at a time.',
          code: `class BrowserHistory {
  constructor(homepage) {
    this.curr = { url: homepage, prev: null, next: null };
  }
  visit(url) {
    const node = { url, prev: this.curr, next: null };
    this.curr.next = node;
    this.curr = node;
  }
  back(steps) {
    while (steps > 0 && this.curr.prev) {
      this.curr = this.curr.prev;
      steps--;
    }
    return this.curr.url;
  }
  forward(steps) {
    while (steps > 0 && this.curr.next) {
      this.curr = this.curr.next;
      steps--;
    }
    return this.curr.url;
  }
}`,
          time: 'visit O(1), back/forward O(steps)',
          space: 'O(pages)',
        },
        {
          name: 'Array + two indexes',
          idea: 'Pages sit in an array, so jumping k places is just index math. `last` marks where forward history ends; a visit moves `last` back to `cur`, which "wipes" the forward pages without deleting anything.',
          pseudo: `pages ← [homepage]
cur ← 0                              // page on screen
last ← 0                             // furthest page you can go forward to

function visit(url):
    cur ← cur + 1
    pages[cur] ← url                 // overwrite old forward pages
    last ← cur

function back(steps):
    cur ← max(0, cur - steps)
    return pages[cur]

function forward(steps):
    cur ← min(last, cur + steps)
    return pages[cur]`,
          code: `class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.cur = 0;
    this.last = 0;
  }
  visit(url) {
    this.cur++;
    this.pages[this.cur] = url;
    this.last = this.cur;
  }
  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.pages[this.cur];
  }
  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.pages[this.cur];
  }
}`,
          time: 'O(1) per op',
          space: 'O(pages)',
        },
      ],
      fn: 'runBrowser',
      starter: `class BrowserHistory {
  constructor(homepage) {
    // Your code here.
  }
  visit(url) {
    // Your code here: open url, wipe forward history.
  }
  back(steps) {
    // Your code here: go back up to steps pages, return the current url.
    return '';
  }
  forward(steps) {
    // Your code here: go forward up to steps pages, return the current url.
    return '';
  }
}

// Test helper (already written for you, don't edit): runs each operation and
// collects the outputs (null for visit).
function runBrowser(homepage, ops) {
  const browser = new BrowserHistory(homepage);
  return ops.map(([op, arg]) => {
    if (op === 'visit') {
      browser.visit(arg);
      return null;
    }
    return op === 'back' ? browser.back(arg) : browser.forward(arg);
  });
}`,
      solution: `class BrowserHistory {
  constructor(homepage) {
    this.pages = [homepage];
    this.cur = 0;  // page on screen
    this.last = 0; // furthest page you can go forward to
  }
  visit(url) {
    this.cur++;
    this.pages[this.cur] = url;
    this.last = this.cur;
  }
  back(steps) {
    this.cur = Math.max(0, this.cur - steps);
    return this.pages[this.cur];
  }
  forward(steps) {
    this.cur = Math.min(this.last, this.cur + steps);
    return this.pages[this.cur];
  }
}

// Test helper (already written for you, don't edit): runs each operation and
// collects the outputs (null for visit).
function runBrowser(homepage, ops) {
  const browser = new BrowserHistory(homepage);
  return ops.map(([op, arg]) => {
    if (op === 'visit') {
      browser.visit(arg);
      return null;
    }
    return op === 'back' ? browser.back(arg) : browser.forward(arg);
  });
}`,
      tests: [
        {
          name: 'classic',
          args: [
            'home.com',
            [['visit', 'a.com'], ['visit', 'b.com'], ['visit', 'c.com'], ['back', 1], ['back', 1], ['forward', 1], ['visit', 'd.com'], ['forward', 2], ['back', 2], ['back', 7]],
          ],
          expected: [null, null, null, 'b.com', 'a.com', 'b.com', null, 'd.com', 'a.com', 'home.com'],
        },
        { name: 'back on a fresh tab', args: ['x.io', [['back', 3]]], expected: ['x.io'] },
        { name: 'nothing to go forward to', args: ['h', [['visit', 'a'], ['forward', 5]]], expected: [null, 'a'] },
        {
          name: 'visit wipes forward pages',
          args: ['h', [['visit', 'a'], ['visit', 'b'], ['back', 2], ['visit', 'c'], ['forward', 1], ['back', 1]]],
          expected: [null, null, 'h', null, 'c', 'h'],
        },
        {
          name: 'back twice, forward two',
          args: ['h', [['visit', 'a'], ['visit', 'b'], ['back', 1], ['back', 1], ['forward', 2]]],
          expected: [null, null, 'a', 'h', 'b'],
        },
        {
          name: 'huge step counts are clamped',
          args: ['h', [['visit', 'a'], ['visit', 'b'], ['visit', 'c'], ['back', 100], ['forward', 100]]],
          expected: [null, null, null, 'h', 'c'],
        },
      ],
      takeaway: 'A doubly linked list models back/forward perfectly, but if you jump k steps, an array with an index is faster.',
    },
  ],
  quiz: [
    {
      prompt: 'Why does the LRU list need `prev` pointers (a doubly linked list)?',
      options: [
        'To unlink a node from the middle in O(1) you must reach the node before it, and the map only gives you the node itself.',
        'To make `get` return values in sorted order.',
        'Singly linked lists cannot store keys.',
      ],
      answer: 0,
      explanation: "Unlinking means changing the previous node's `next`. With only `next` pointers you would have to walk from the head to find it: O(n).",
    },
    {
      prompt: 'Why does each LRU node store its key, not just its value?',
      options: [
        'For debugging only.',
        'When you evict `tail.prev`, you need its key to delete it from the map too.',
        'Because `Map` requires it.',
      ],
      answer: 1,
      explanation: 'The list tells you *which node* is oldest; the map is indexed by key. Without the key in the node, the map would keep a stale entry.',
    },
    {
      prompt: 'What do the `head` and `tail` sentinel nodes buy you?',
      options: [
        'They store the newest and oldest values.',
        'Every real node always has a real `prev` and `next`, so `remove` and `addFront` never check for null.',
        'They make the cache bigger.',
      ],
      answer: 1,
      explanation: 'Same idea as the dummy node from lesson 1, on both ends. An empty cache is just `head ⇄ tail`.',
    },
  ],
  takeaways: [
    'Find fast + reorder fast = hash map from key to node, plus a doubly linked list.',
    'Sentinels on both ends remove every null check from `remove` and `addFront`.',
    'Store the key in the node so eviction can clean up the map.',
    'Lists are great at "move this item"; arrays are great at "jump k places". Choose by the operations.',
  ],
};

export default lesson;
