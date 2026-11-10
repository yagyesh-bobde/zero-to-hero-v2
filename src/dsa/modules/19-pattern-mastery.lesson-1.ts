import type { Lesson } from '../types';

// Module 19, lesson 1. Owner: Content J.

const triagePseudo = `function triage(problem):
    // read 1: constraints → target (module 1)
    n ← the biggest size in the constraints
    target ← the slowest Big-O that n still allows
    // read 2: input shape
    shape ← sorted array, string, grid, tree, graph,
            intervals, linked list or stream
    // read 3: the ask
    ask ← count, longest, shortest, min steps, all combos,
          k-th / top k, number of ways, yes/no or in place
    candidates ← 2 patterns that match shape + ask
    if cost of brute force ≤ target:
        return "brute force"          // tiny n: just write it
    for each p in candidates:
        if cost of p ≤ target and p works on a tiny example by hand:
            return p
    return "find the repeated work in brute force and remove it"`;

const sortPseudo = `function frequencySort(s):
    count ← empty map                    // char → times seen
    for each c in s:
        count[c] ← count[c] + 1
    buckets ← n + 1 empty lists          // buckets[f] = chars seen f times
    for each c in keys of count, sorted by char code:
        append c to buckets[count[c]]    // each bucket stays in code order
    out ← empty list
    for f from n down to 1:
        for each c in buckets[f]:
            append c repeated f times to out
    return out joined into one string`;

const sortJs = `function frequencySort(s) {
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);

  // buckets[f] = characters that appear exactly f times
  const buckets = Array.from({ length: s.length + 1 }, () => []);
  const chars = [...count.keys()].sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0));
  for (const c of chars) buckets[count.get(c)].push(c);

  let out = '';
  for (let f = s.length; f >= 1; f--) {
    for (const c of buckets[f]) out += c.repeat(f);
  }
  return out;
}`;

const sortByCountJs = `function frequencySort(s) {
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
  const chars = [...count.keys()].sort(
    (a, b) => count.get(b) - count.get(a) || a.charCodeAt(0) - b.charCodeAt(0),
  );
  return chars.map((c) => c.repeat(count.get(c))).join('');
}`;

const sortWholeJs = `function frequencySort(s) {
  const count = new Map();
  for (const c of s) count.set(c, (count.get(c) ?? 0) + 1);
  return [...s]
    .sort((a, b) => count.get(b) - count.get(a) || a.charCodeAt(0) - b.charCodeAt(0))
    .join('');
}`;

const peakPseudo = `function findPeakElement(nums):
    lo ← 0
    hi ← n - 1
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if nums[mid] < nums[mid + 1]:
            lo ← mid + 1          // going uphill: a peak is to the right
        else:
            hi ← mid              // going downhill: mid or something left
    return lo                     // lo = hi = the peak`;

const peakJs = `function findPeakElement(nums) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}`;

const peakScanJs = `function findPeakElement(nums) {
  for (let i = 0; i < nums.length - 1; i++) {
    if (nums[i] > nums[i + 1]) return i;
  }
  return nums.length - 1;
}`;

const fruitPseudo = `function totalFruit(fruits):
    count ← empty map             // type → how many in the window
    left ← 0
    best ← 0
    for right from 0 to n - 1:
        count[fruits[right]] ← count[fruits[right]] + 1
        while count has more than 2 keys:
            count[fruits[left]] ← count[fruits[left]] - 1
            if count[fruits[left]] = 0:
                remove fruits[left] from count
            left ← left + 1
        best ← max(best, right - left + 1)
    return best`;

const fruitJs = `function totalFruit(fruits) {
  const count = new Map();
  let left = 0;
  let best = 0;
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) ?? 0) + 1);
    while (count.size > 2) {
      const f = fruits[left];
      count.set(f, count.get(f) - 1);
      if (count.get(f) === 0) count.delete(f);
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}`;

const fruitBruteJs = `function totalFruit(fruits) {
  let best = 0;
  for (let i = 0; i < fruits.length; i++) {
    const types = new Set();
    for (let j = i; j < fruits.length; j++) {
      types.add(fruits[j]);
      if (types.size > 2) break;
      best = Math.max(best, j - i + 1);
    }
  }
  return best;
}`;

const flow = `1. Constraints -> how fast must it be? (module 1)
            |
2. What is the input?
   |- tree ............ DFS "return up" / BFS levels
   |- graph / edges ... BFS, DFS, topo, union-find
   |- grid ............ BFS / DFS (2D DP if "ways")
   |- linked list ..... dummy, fast/slow, reverse
   |- intervals ....... sort + sweep / greedy
   |- array / string .. go on to the ask
            |
3. What is asked?
   |- seen before / pair ..... hash map
   |- longest contiguous run . sliding window
   |- sorted, find x ......... binary search
   |- min value that works ... search the answer
   |- next greater ........... monotonic stack
   |- top k / k-th ........... heap / quickselect
   |- all combos (n <= 20) ... backtracking
   |- ways / best total ...... DP (or greedy)`;

const lesson: Lesson = {
  id: 'signals-to-patterns',
  title: 'Signals → pattern: the decision guide',
  summary: 'Read constraints, input shape and the ask, and the pattern usually picks itself.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The mechanic does not try every tool',
      text: 'Your car squeals when you brake. A good mechanic does not take every tool off the wall and try them one by one. She hears *squeal + braking* and thinks "brake pads". A click when you turn means a joint. **Symptom → tool.** You now own 18 modules of tools. This lesson is the list of symptoms.',
    },
    {
      kind: 'text',
      text: 'When you open a new problem, do not start coding. Spend 2 minutes reading it like a mechanic. You read three things, always in the same order. Each read cuts the list of tools down.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Constraints → target speed.** How big can *n* get? That tells you how fast the answer must be (module 1).',
        '**Input shape.** Sorted array, string, grid, tree, graph or edge list, intervals, linked list, a stream of values arriving one by one.',
        '**The ask.** Count? Longest or shortest? Min steps? All combinations? The k-th or top k? Number of ways? Yes or no? Do it in place?',
      ],
    },
    {
      kind: 'table',
      title: 'Read 1: constraints → target (module 1)',
      head: ['If n is up to', 'Aim for', 'Usually means'],
      rows: [
        ['about 20', 'O(2ⁿ) or O(n!)', 'try every choice: backtracking, bitmasks'],
        ['about 500', 'O(n³)', 'three loops, interval or 2D DP'],
        ['about 5,000', 'O(n²)', 'two loops, 2D DP over pairs'],
        ['10⁵ to 10⁶', 'O(n log n) or O(n)', 'sort, heap, binary search, one pass'],
        ['10⁹ or more', 'O(log n) or O(1)', 'binary search on a range, math'],
      ],
    },
    {
      kind: 'table',
      title: 'Arrays & strings',
      head: ['You see', 'Reach for', 'Module'],
      rows: [
        ['find a pair that sums to x; "seen before?"', 'hash map lookup', '2'],
        ['counts, frequency, anagrams', 'counting map', '2'],
        ['group items that "match"', 'map keyed by a signature', '2'],
        ['range sums; "subarray sum = k"', 'prefix sum (+ hash map)', '2'],
        ['sorted array, find a pair', 'two pointers from both ends', '3'],
        ['palindrome, compare the two ends', 'two pointers moving inward', '3'],
        ['remove or move items *in place*', 'read/write pointers', '3'],
        ['sort into 2-3 groups in place', 'partition (Dutch flag)', '3'],
        ['3 or 4 numbers that hit a target', 'sort + k-sum', '3'],
        ['every window of size k', 'fixed sliding window', '4'],
        ['longest / shortest *contiguous* run with a rule', 'variable sliding window', '4'],
        ['count subarrays with *exactly* k', 'atMost(k) − atMost(k − 1)', '4'],
        ['sorted, find x or the first ≥ x', 'binary search, lower/upper bound', '5'],
        ['sorted, then rotated', 'binary search on the sorted half', '5'],
        ['matrix with sorted rows and columns', 'binary search on the 2D grid', '5'],
      ],
    },
    {
      kind: 'table',
      title: 'Stacks, lists, trees & graphs',
      head: ['You see', 'Reach for', 'Module'],
      rows: [
        ['brackets, nesting, undo, expressions', 'stack', '6'],
        ['next greater / next smaller', 'monotonic stack', '6'],
        ['max or min of every window', 'monotonic deque', '6'],
        ['merge lists, delete a node', 'dummy node', '7'],
        ['cycle, middle, k-th from the end', 'fast/slow pointers', '7'],
        ['reverse a list or part of it', 'in-place reversal', '7'],
        ['O(1) get and put, evict the oldest', 'hash map + linked list (LRU)', '7'],
        ['tree height, diameter, path sums, LCA', 'DFS that returns info up', '10'],
        ['tree "by level", right side view', 'BFS with a queue', '10'],
        ['BST: search, validate, k-th smallest', 'BST rule + in-order walk', '11'],
        ['prefixes, autocomplete, word lists', 'trie', '11'],
        ['grid islands, flood fill, regions', 'DFS / BFS on the grid', '13'],
        ['min steps, every step costs 1', 'BFS', '13'],
        ['spreads from many starts at once', 'multi-source BFS', '13'],
        ['tasks with "do X before Y"', 'topological sort', '13'],
        ['"are these connected?" as edges arrive', 'union-find', '14'],
        ['cheapest path, weighted edges', 'Dijkstra', '14'],
        ['cheapest path with at most k stops', 'Bellman-Ford (k rounds)', '14'],
        ['connect all points at least cost', 'MST (Kruskal / Prim)', '14'],
      ],
    },
    {
      kind: 'table',
      title: 'Optimization, choices & counting',
      head: ['You see', 'Reach for', 'Module'],
      rows: [
        ['smallest speed / capacity that still works', 'binary search on the answer', '5'],
        ['split in half, solve, combine', 'divide & conquer (recursion)', '8'],
        ['one k-th largest, no sorting needed', 'quickselect', '8'],
        ['x to a huge power', 'fast power (halve the exponent)', '8'],
        ['all subsets / orders / combos, n ≤ 20', 'backtracking', '9'],
        ['top k, k closest, k most frequent', 'heap of size k', '12'],
        ['merge k sorted lists', 'k-way merge with a heap', '12'],
        ['running median as values stream in', 'two heaps', '12'],
        ['always run the best ready task next', 'scheduling with a heap', '12'],
        ['a local choice looks safe (jumps, gas)', 'greedy', '15'],
        ['meetings, overlaps, intervals', 'sort by start or end + sweep', '15'],
        ['ways / min cost / max along a line', '1D DP', '16'],
        ['biggest sum of a contiguous part', 'Kadane (running best)', '16'],
        ['two strings, grid paths, knapsack', '2D DP', '17'],
        ['buy/sell with rules (cooldown, fee)', 'DP with states', '17'],
        ['"appears once", toggles, subset masks', 'bits (XOR, masks)', '18'],
        ['gcd, primes, "answer modulo 10⁹+7"', 'math tricks', '18'],
      ],
    },
    {
      kind: 'diagram',
      title: 'The decision flow',
      art: flow,
      caption: 'Read top to bottom. The input shape often decides it. For a plain array or string, the ask decides it.',
    },
    { kind: 'code', lang: 'pseudo', title: 'The 2-minute triage', code: triagePseudo },
    {
      kind: 'trace',
      title: 'Triage drill: 8 one-line problems',
      columns: ['Problem', 'Signal', 'Pattern (module)'],
      rows: [
        ['Eat all banana piles within h hours. Find the slowest speed.', '"slowest speed that still works"', 'binary search on the answer (5)'],
        ['For each day, how many days until a warmer one?', '"next greater"', 'monotonic stack (6)'],
        ['Rot spreads to neighbor oranges each minute. When is all rotten?', 'grid + many starts + minutes', 'multi-source BFS (13)'],
        ['Courses have prerequisites. Can you finish them all?', '"X before Y" + yes/no', 'topological sort (13)'],
        ['How many ways to climb n stairs, 1 or 2 steps at a time?', '"number of ways", builds on smaller n', '1D DP (16)'],
        ['Longest substring with no repeated letter', '"longest" + contiguous + rule', 'variable sliding window (4)'],
        ['The k points closest to the origin', '"k closest"', 'heap of size k (12)'],
        ['Every way to place n queens safely, n ≤ 9', '"every way" + tiny n', 'backtracking (9)'],
      ],
      note: 'Notice that the story (bananas, oranges, stairs) never picked the pattern. The ask and the constraint did.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The story is decoration',
      text: '**The ask + the constraint usually decide it.** "Bananas per hour", "ship capacity" and "pages per student" are the same problem: *the smallest value that still works*. Strip the story and write the problem in one plain line. The pattern is usually sitting in that line.',
    },
    {
      kind: 'text',
      text: '**Worked problem: sort characters by frequency.** Given `"tree"`, return the characters with the most common first: `"eert"`. Ties go in character-code order. Triage: n up to 5 × 10⁵, so aim for O(n log n) or better. Input: a string. The ask: *how often* each character appears, then *order by that count*. "How often" → counting map (module 2). "Order by a small whole number" → sort, or put things in buckets by count (the counting sort idea, module 8).',
    },
    { kind: 'code', lang: 'pseudo', title: 'Count, then bucket by count', code: sortPseudo },
    { kind: 'code', lang: 'js', title: 'frequencySort', code: sortJs },
    {
      kind: 'compare',
      title: 'Sort characters by frequency',
      rows: [
        { approach: 'Sort the whole string by count', time: 'O(n log n)', space: 'O(n)', note: 'Works, but sorts every letter even though most are copies.' },
        { approach: 'Count, sort the distinct chars', time: 'O(n + k log k)', space: 'O(n)', note: '*k* = distinct chars (at most 62), so the sort is tiny.' },
        { approach: 'Count, bucket by count', time: 'O(n)', space: 'O(n)', note: 'A count is a whole number from 1 to n, so it can be a list index.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Same words, different pattern',
      text: '"Subarray with sum k" sounds like a sliding window. But with **negative numbers**, growing the window can make the sum smaller, so you never know when to shrink. Use **prefix sum + hash map** (module 2). "Longest" does not always mean DP either: the longest *substring* (contiguous) is a sliding window, while the longest increasing *subsequence* (can skip) is DP (module 16). And "shortest path" is BFS only when every step costs the same. With weights, it is Dijkstra (module 14). Always check the small words.',
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-sort-by-frequency',
      title: 'Sort Characters by Frequency',
      difficulty: 'medium',
      leetcode: 451,
      pattern: 'Signal drill',
      statement: 'A word game shows each player the letters of a word, grouped so the most common ones come first. Given a string `s`, return a new string with the same characters, where characters that appear more often come first, and all copies of a character sit together. If two characters appear the same number of times, put them in alphabetical order, by character code (so digits come before `A`–`Z`, which come before `a`–`z`).',
      examples: [
        { input: 's = "tree"', output: '"eert"', explain: '`e` appears twice. `r` and `t` appear once, and `r` comes before `t`.' },
        { input: 's = "cccaaa"', output: '"aaaccc"', explain: 'Both appear 3 times, so `a` goes first.' },
        { input: 's = "Aabb"', output: '"bbAa"', explain: '`A` (code 65) comes before `a` (code 97).' },
      ],
      constraints: ['1 ≤ s.length ≤ 5 × 10⁵', 's has only English letters (upper and lower case) and digits'],
      hints: [
        'Which pattern fits? The order depends on *how often* each character appears. What do you build before you can order anything?',
        'Count with a map (module 2). Then order the distinct characters by count, highest first. A sort works, or the counting sort idea from module 8: a count is a whole number from 1 to n.',
        'Make `buckets[f]` = the characters seen exactly f times, filled in character-code order. Walk f from n down to 1 and add each character repeated f times.',
      ],
      approaches: [
        {
          name: 'Sort the whole string by count',
          idea: 'Count each character, then sort all n characters with a comparator: higher count first, then lower character code. Copies of the same character have equal keys, so they end up together.',
          code: sortWholeJs,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Count, sort the distinct characters',
          idea: 'There are at most 62 different characters. Sort only those by (count, code) and write each one count times. The sort is tiny, so the work is mostly the counting pass.',
          code: sortByCountJs,
          time: 'O(n + k log k)',
          space: 'O(n)',
        },
        {
          name: 'Count, bucket by count',
          idea: 'A count is a whole number between 1 and n, so use it as an index into a list of buckets. Walking the buckets from n down to 1 gives the "most common first" order with no comparison sort on counts. Filling the buckets in character-code order handles ties.',
          pseudo: sortPseudo,
          code: sortJs,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'frequencySort',
      starter: `function frequencySort(s) {
  // most frequent characters first, ties by character code
  return '';
}`,
      solution: sortJs,
      tests: [
        { name: 'example', args: ['tree'], expected: 'eert' },
        { name: 'tie goes alphabetical', args: ['cccaaa'], expected: 'aaaccc' },
        { name: 'upper before lower', args: ['Aabb'], expected: 'bbAa' },
        { name: 'single character', args: ['a'], expected: 'a' },
        { name: 'digits and a letter', args: ['2a554442'], expected: '4442255a' },
        { name: 'all the same', args: ['zzzzz'], expected: 'zzzzz' },
        { name: 'all once: code order', args: ['cba321CBA'], expected: '123ABCabc' },
        { name: 'longer word', args: ['loveleetcode'], expected: 'eeeelloocdtv' },
        { name: 'three-way tie', args: ['bbAAaa'], expected: 'AAaabb' },
      ],
      takeaway: '*Order by how often* → counting map, then sort or bucket by the count.',
    },
    {
      id: 'pattern-mastery-peak-element',
      title: 'Find a Peak',
      difficulty: 'medium',
      leetcode: 162,
      pattern: 'Signal drill',
      statement: 'A hiking app stores the heights along a trail as a list `nums`. A *peak* is a spot higher than both neighbors. Next to each other, heights are never equal, and the spots just outside the list count as −∞ (so the first or last spot can be a peak). Return the index of a peak. In real life there may be several peaks and any one is fine, but **every test here has exactly one peak**, so the answer is unique. Your solution must take O(log n) time.',
      examples: [
        { input: 'nums = [1, 2, 3, 1]', output: '2', explain: '3 is bigger than 2 and 1.' },
        { input: 'nums = [1, 2, 3, 4, 5]', output: '4', explain: 'Always uphill. The last spot beats its left neighbor and −∞.' },
        { input: 'nums = [7]', output: '0' },
      ],
      constraints: ['1 ≤ n ≤ 1000', 'nums[i] ≠ nums[i + 1]', 'must run in O(log n)'],
      hints: [
        'Which pattern fits? Look at the constraint: *O(log n)*. Which tool cuts the search in half each step? The list is not sorted, so ask: what could tell you which half is safe?',
        'Binary search (module 5). It does not need sorted data, only a test that tells you which half is safe. Compare `nums[mid]` with `nums[mid + 1]`.',
        'If `nums[mid] < nums[mid + 1]` you are walking uphill, and since the far edge is −∞ a peak must be to the right: `lo ← mid + 1`. Otherwise a peak is at mid or to its left: `hi ← mid`. Loop while `lo < hi` and return `lo`.',
      ],
      approaches: [
        {
          name: 'Walk until it goes down',
          idea: 'Scan left to right. The first time a height is bigger than the next one, you have a peak (it was bigger than the one before too, or it is the first spot). If it never goes down, the last spot is the peak. Correct, but O(n), and the task asks for O(log n).',
          code: peakScanJs,
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on the slope',
          idea: 'At any mid, look one step right. Uphill means a peak must exist to the right, because the heights cannot climb forever: the edge is −∞. Downhill means mid or something to its left is a peak. Either way you throw away half the list.',
          pseudo: peakPseudo,
          code: peakJs,
          time: 'O(log n)',
          space: 'O(1)',
        },
      ],
      fn: 'findPeakElement',
      starter: `function findPeakElement(nums) {
  // return the index of the peak
  return -1;
}`,
      solution: peakJs,
      tests: [
        { name: 'example', args: [[1, 2, 3, 1]], expected: 2 },
        { name: 'single element', args: [[7]], expected: 0 },
        { name: 'two, going up', args: [[1, 2]], expected: 1 },
        { name: 'two, going down', args: [[2, 1]], expected: 0 },
        { name: 'strictly increasing', args: [[1, 2, 3, 4, 5]], expected: 4 },
        { name: 'strictly decreasing', args: [[5, 4, 3, 2, 1]], expected: 0 },
        { name: 'mountain in the middle', args: [[1, 3, 5, 7, 6, 4, 2]], expected: 3 },
        { name: 'negatives', args: [[-5, -2, 0, 9, 8]], expected: 3 },
        { name: 'peak near the start', args: [[0, 10, 9, 8, 7, 6, 5, 4, 3]], expected: 1 },
        { name: 'peak near the end', args: [[-3, -1, 4, 8, 12, 15, 20, 18]], expected: 6 },
      ],
      takeaway: '*O(log n)* on data that is not sorted → binary search on something that tells you which half is safe (here, the slope).',
    },
    {
      id: 'pattern-mastery-fruit-baskets',
      title: 'Fruit Into Two Baskets',
      difficulty: 'medium',
      leetcode: 904,
      pattern: 'Signal drill',
      statement: 'You walk along a row of fruit trees. `fruits[i]` is the type of fruit on tree i. You carry **two baskets**, and each basket holds only one type (but as many of it as you like). You pick a starting tree, then walk right, picking exactly one fruit from every tree. You must stop as soon as a tree has a third type that fits in neither basket. Return the most fruit you can collect.',
      examples: [
        { input: 'fruits = [1, 2, 1]', output: '3', explain: 'Only two types, so take all three.' },
        { input: 'fruits = [1, 2, 3, 2, 2]', output: '4', explain: 'Start at index 1: [2, 3, 2, 2].' },
        { input: 'fruits = [0, 1, 2, 2]', output: '3', explain: 'Start at index 1: [1, 2, 2].' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ fruits[i] < n'],
      hints: [
        'Which pattern fits? Strip the story: you want the *longest contiguous run* with *at most 2 different values*. What kind of range is that?',
        'Variable sliding window (module 4) with a count map of the types inside the window.',
        'Move `right` one step at a time and add its type to the map. While the map has more than 2 keys, remove `fruits[left]` (delete the key at 0) and move `left`. After that, `best ← max(best, right − left + 1)`.',
      ],
      approaches: [
        {
          name: 'Try every start',
          idea: 'From each start, walk right and keep a set of types. Stop when the set gets a third type. Correct, but you re-walk the same trees from every start: O(n²).',
          code: fruitBruteJs,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sliding window + count map',
          idea: 'A run that has too many types only gets worse if you grow it, so shrink it from the left until it has 2 types again. Each tree enters the window once and leaves once, so the whole thing is one pass.',
          pseudo: fruitPseudo,
          code: fruitJs,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'totalFruit',
      starter: `function totalFruit(fruits) {
  // longest run with at most 2 fruit types
  return 0;
}`,
      solution: fruitJs,
      tests: [
        { name: 'only two types', args: [[1, 2, 1]], expected: 3 },
        { name: 'skip the first tree', args: [[0, 1, 2, 2]], expected: 3 },
        { name: 'best run in the middle', args: [[1, 2, 3, 2, 2]], expected: 4 },
        { name: 'longer row', args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expected: 5 },
        { name: 'one tree', args: [[1]], expected: 1 },
        { name: 'all the same type', args: [[5, 5, 5, 5]], expected: 4 },
        { name: 'all different', args: [[1, 2, 3, 4, 5]], expected: 2 },
        { name: 'best run at the end', args: [[0, 1, 6, 6, 4, 4, 6]], expected: 5 },
        { name: 'types keep switching', args: [[1, 0, 1, 4, 1, 4, 1, 2, 3]], expected: 5 },
      ],
      takeaway: '*Longest contiguous run with at most k kinds* → variable sliding window with a count map.',
    },
  ],
  quiz: [
    {
      prompt: 'n ≤ 15. "Return every way to split the team into two groups with equal total skill." Which pattern fits first?',
      options: ['Variable sliding window', 'Backtracking (try every choice)', 'Binary search on the answer', 'Monotonic stack'],
      answer: 1,
      explanation: '*Every way* + *tiny n* (2¹⁵ is about 33,000) means you can afford to try every choice. A window or a binary search finds one best answer, not all of them.',
    },
    {
      prompt: 'The array can have negative numbers. "Count the subarrays whose sum is exactly k." What do you use?',
      options: ['Variable sliding window', 'Two pointers from both ends', 'Prefix sum + hash map', 'Heap of size k'],
      answer: 2,
      explanation: 'With negatives, adding a number can make the sum go down, so a window never knows when to shrink. Prefix sums turn it into "have I seen `prefix − k` before?", a hash map lookup (module 2).',
    },
    {
      prompt: '"Find the smallest ship capacity that ships all packages, in order, within d days." What is the signal?',
      options: ['"smallest … that still works" → binary search on the answer', '"packages in order" → stack', '"smallest" → always a min-heap', '"d days" → 1D DP'],
      answer: 0,
      explanation: 'If capacity c works, every bigger capacity works too. So you can binary search over capacities and check each one with a greedy pass (module 5).',
    },
    {
      prompt: 'A grid maze. Every move costs 1. "Fewest moves from start to exit." Which tool?',
      options: ['Dijkstra', 'BFS', '2D DP (only right/down moves)', 'Backtracking'],
      answer: 1,
      explanation: 'Equal step costs + "fewest steps" = BFS (module 13). Dijkstra also works but is slower and only needed when steps have different costs. DP fails because you can move in all four directions.',
    },
  ],
  takeaways: [
    'Read in order: **constraints** (target speed), **input shape**, then **the ask**.',
    'The ask + the constraint pick the pattern. The story is decoration: rewrite the problem as one plain line.',
    'List 2 candidates and check each against the target before you code.',
    'Small words matter: *contiguous* vs *subsequence*, *negatives*, *weighted*, *exactly* vs *at most*.',
  ],
};

export default lesson;
