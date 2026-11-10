import type { Lesson } from '../types';

// Module 8, lesson 6: the sorting toolkit. Comparators, stability, sort by a computed key, counting sort.
const lesson: Lesson = {
  id: 'sorting-toolkit',
  title: 'The sorting toolkit: comparators, stability, counting sort',
  summary: 'Tell sort() exactly what "smaller" means, break ties on purpose, and count instead of compare when values are small.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'The shop that sorted prices wrong',
      text: "A small online shop adds a \"cheapest first\" button. The developer writes `prices.sort()` and ships it. Prices `[100, 25, 3]` come out as `[100, 25, 3]`: the most expensive item sits on top. Nothing crashed, the tests on one-digit prices passed, and customers just thought the shop was weird. The bug: with no extra rule, JavaScript sorts **numbers as text**.",
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Three things sort() does that surprise people',
      code: `// 1. No comparator: values are turned into strings and compared letter by letter
[10, 9, 1].sort();    // [1, 10, 9]    because "1" < "10" < "9"
[100, 25, 3].sort();  // [100, 25, 3]  because "1" < "2" < "3"

// 2. A comparator fixes it: (a, b) => a - b means "small to big"
const prices = [100, 25, 3];
prices.sort((a, b) => a - b); // [3, 25, 100]

// 3. sort() works IN PLACE: prices itself is now changed.
//    Want a sorted copy and the original untouched?
const original = [100, 25, 3];
const copy1 = original.toSorted((a, b) => a - b);
const copy2 = [...original].sort((a, b) => a - b);`,
    },
    {
      kind: 'text',
      text: "**The comparator contract.** A comparator is a small function `(a, b) => number` that answers one question: who goes first? Return a **negative** number and `a` goes first. Return a **positive** number and `b` goes first. Return **0** and they are \"equal\", so they keep the order they already had. That is **stability**, which you met in lesson 3's merge. JavaScript's `sort` is guaranteed stable since 2019 (ES2019). So on a game leaderboard sorted by score, high to low, `Ana 50, Ben 70, Cy 50` becomes `Ben 70, Ana 50, Cy 50`: Ana reached 50 first, so she stays above Cy. Engines get this the same way your merge sort did: they use a merge-based sort that takes from the **left** on ties.",
    },
    {
      kind: 'text',
      text: "**The problem.** Your sticker album has numbers `[2, 3, 1, 3, 2]`. Show the **rarest** stickers first. If two numbers appear equally often, the **bigger** number goes first. Here `1` appears once, while `2` and `3` appear twice each. So `1` leads, then the tie between `2` and `3` goes to the bigger one: `[1, 3, 3, 2, 2]`. Two rules means two keys: first by count, then by value.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: count inside the comparator',
      code: `function frequencySort(nums):
    sort nums by (a, b):
        countA ← how many times a appears in nums   // walks all n items
        countB ← how many times b appears in nums   // walks all n again
        if countA ≠ countB:
            return countA - countB                   // rarer first
        return b - a                                 // tie: bigger first
    return nums`,
    },
    {
      kind: 'text',
      text: "This works, and the answer is right. But a sort asks the comparator about **n log n** pairs, and each answer here walks the whole array twice. That is **O(n² log n)**. With n = 100,000 the sort asks about 1.7 million questions, and each one costs 200,000 steps. **Spot the waste:** the count of `2` never changes while sorting. You recount it from scratch every single time the sort asks about a `2`.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Compute the key once, then compare keys',
      text: "Count every value **once** into a `Map` (value → count). That is one pass, O(n). Now the comparator just looks up two numbers: O(1) per question. Then compare by key 1 (count, small first). Only if key 1 is equal, compare by key 2 (value, big first). Total: **O(n log n)**.",
    },
    {
      kind: 'trace',
      title: 'Comparator answers for [2, 3, 1, 3, 2], counts {2: 2, 3: 2, 1: 1}',
      columns: ['a', 'b', 'count a', 'count b', 'returns', 'so'],
      rows: [
        [2, 1, 2, 1, '2 - 1 = 1', '1 goes first (rarer)'],
        [3, 1, 2, 1, '2 - 1 = 1', '1 goes first (rarer)'],
        [3, 2, 2, 2, 'tie: 2 - 3 = -1', '3 goes first (bigger)'],
        [2, 3, 2, 2, 'tie: 3 - 2 = 1', '3 goes first (bigger)'],
        [2, 2, 2, 2, 'tie: 2 - 2 = 0', 'keep their order'],
      ],
      note: "Result: `[1, 3, 3, 2, 2]`. The engine decides which pairs to ask about. Your comparator only has to give the same honest answer every time.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Count once, then a two-key comparator',
      code: `function frequencySort(nums):
    count ← empty map                     // value → how many times
    for each x in nums:
        count[x] ← count[x] + 1           // missing counts start at 0
    sort nums by (a, b):
        if count[a] ≠ count[b]:
            return count[a] - count[b]    // key 1: rarer first
        return b - a                      // key 2: bigger first
    return nums`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function frequencySort(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  return [...nums].sort((a, b) => {
    if (count.get(a) !== count.get(b)) return count.get(a) - count.get(b);
    return b - a;
  });
}
// Shortcut you will see a lot:
//   (a, b) => count.get(a) - count.get(b) || b - a
// A tie gives 0, and 0 is falsy, so || falls through to the second rule.`,
    },
    {
      kind: 'text',
      text: "**Counting sort: skip comparing.** Sometimes the values are whole numbers in a small **range**. The range is how many different values are possible: star ratings 0 to 4 have a range of 5, ages 0 to 120 have a range of 121. Then you can make one counter per possible value, count every item, and write the values back out in order. Cost: one pass over the n items, plus one pass over the range: **O(n + range)**. For 1 million ages that is about 1 million steps, instead of about 20 million comparisons for a normal sort.",
    },
    {
      kind: 'steps',
      title: 'Counting sort on star ratings [3, 1, 4, 1, 0, 3]',
      frames: [
        {
          cells: [0, 0, 0, 0, 0],
          vars: { ratings: '3 1 4 1 0 3', out: '' },
          note: 'One counter per possible rating. Cell `k` is `count[k]`: how many times rating `k` showed up. All start at 0.',
        },
        {
          cells: [0, 0, 0, 1, 0],
          pointers: { x: 3 },
          active: [3],
          vars: { ratings: '3 1 4 1 0 3', read: '3', out: '' },
          note: 'Read `3`, so `count[3]` goes up by one. No comparing with anything.',
        },
        {
          cells: [0, 1, 0, 1, 1],
          active: [1, 4],
          vars: { ratings: '3 1 4 1 0 3', read: '3 1 4', out: '' },
          note: 'Read `1` and `4`: bump `count[1]` and `count[4]`.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          active: [0, 1, 3],
          vars: { ratings: '3 1 4 1 0 3', read: 'all 6', out: '' },
          note: 'Read `1`, `0`, `3`. Counting is done after one pass: one 0, two 1s, no 2s, two 3s, one 4.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          pointers: { v: 0 },
          active: [0],
          vars: { out: '0' },
          note: 'Now walk the counters from `v = 0` upward. `count[0]` is 1, so write one `0`.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          pointers: { v: 1 },
          active: [1],
          done: [0],
          vars: { out: '0 1 1' },
          note: '`count[1]` is 2: write `1` twice.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          pointers: { v: 2 },
          active: [2],
          done: [0, 1],
          vars: { out: '0 1 1' },
          note: '`count[2]` is 0: write nothing and move on.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          pointers: { v: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { out: '0 1 1 3 3' },
          note: '`count[3]` is 2: write `3` twice.',
        },
        {
          cells: [1, 2, 0, 2, 1],
          pointers: { v: 4 },
          found: [0, 1, 2, 3, 4],
          vars: { out: '0 1 1 3 3 4' },
          note: '`count[4]` is 1: write one `4`. Sorted in 6 + 5 steps, and not one comparison.',
        },
      ],
    },
    {
      kind: 'compare',
      title: 'Ways to sort by a rule',
      rows: [
        {
          approach: 'Recompute the key inside the comparator',
          time: 'O(n² log n)',
          space: 'O(1)',
          note: 'Correct, but recounts the same value again and again.',
        },
        {
          approach: 'Compute keys once into a Map, then sort',
          time: 'O(n log n)',
          space: 'O(n)',
          note: 'The default choice. Works for any values and any rule.',
        },
        {
          approach: 'Counting sort',
          time: 'O(n + range)',
          space: 'O(range)',
          note: 'Only for whole numbers in a small range (0..1000, 0..n). Beats n log n there.',
        },
      ],
    },
    {
      kind: 'table',
      title: 'Cheat sheet: the sorting toolkit',
      head: ['You want', 'Write', 'Cost'],
      rows: [
        ['Numbers small to big', '`a.sort((x, y) => x - y)`', 'O(n log n)'],
        ['Numbers big to small', '`a.sort((x, y) => y - x)`', 'O(n log n)'],
        ['Strings A to Z', '`a.sort((x, y) => x.localeCompare(y))`', 'O(n log n · L), L = string length'],
        ['A sorted copy, original untouched', '`a.toSorted(cmp)` or `[...a].sort(cmp)`', 'O(n) extra space'],
        ['Two rules (main rule, then tie-break)', '`(x, y) => key1(x) - key1(y) || key2(x) - key2(y)`', 'O(n log n)'],
        ['Ties keep their input order', 'Nothing: `sort` is stable since ES2019', 'free'],
        ['A key that is slow to compute', 'Compute it once into a `Map`, then compare lookups', 'O(n) + O(n log n)'],
        ['Whole numbers in a small range', 'Counting sort', 'O(n + range)'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: sort by a computed key',
      code: `// 1. Slow key? Compute it once.
key ← empty map
for each x in items:
    key[x] ← computeKey(x)              // a count, a rank, a length...

// 2. Main rule first, tie-break second
sort items by (a, b):
    if key[a] ≠ key[b]:
        return key[a] - key[b]          // negative = a first
    return tieBreak(a, b)               // 0 = keep their order

// 3. Whole numbers in 0..maxV? Count instead.
count ← array of maxV + 1 zeros
for each x in items:
    count[x] ← count[x] + 1
for v from 0 to maxV:
    append v to out, count[v] times`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three comparator bugs that pass small tests',
      text: "**1. No comparator on numbers.** `[10, 9, 1].sort()` gives `[1, 10, 9]`. Always pass `(a, b) => a - b`. **2. A boolean comparator.** `(a, b) => a > b` returns `true` or `false`, which become `1` or `0`. It never says \"negative\", so the contract is broken. In Chrome and Node, `[3, 1, 2].sort((a, b) => a > b)` gives back `[3, 1, 2]`, unsorted. **3. Subtracting strings.** `'b' - 'a'` is `NaN`, so `(a, b) => a - b` on strings sorts nothing useful. Use `a.localeCompare(b)` or `a < b ? -1 : a > b ? 1 : 0`.",
    },
  ],
  problems: [
    {
      id: 'recursion-sort-by-frequency',
      title: 'Rarest stickers first',
      difficulty: 'easy',
      leetcode: 1636,
      pattern: 'Sort by a computed key',
      statement: "Your sticker album is a list of sticker numbers, with repeats. Show it with the **rarest** numbers first: sort by how many times each number appears, fewest first. If two numbers appear the same number of times, put the **bigger** number first. Return the sorted list.",
      examples: [
        {
          input: 'nums = [1, 1, 2, 2, 2, 3]',
          output: '[3, 1, 1, 2, 2, 2]',
          explain: '`3` appears once, `1` twice, `2` three times.',
        },
        {
          input: 'nums = [2, 3, 1, 3, 2]',
          output: '[1, 3, 3, 2, 2]',
          explain: '`2` and `3` both appear twice, so the bigger one, `3`, goes first.',
        },
      ],
      constraints: ['1 ≤ n ≤ 100', '-100 ≤ nums[i] ≤ 100'],
      hints: [
        'There are two rules: first by count, then by value. That is a two-key comparator.',
        'Counting inside the comparator is slow. Count every value once before you sort.',
        'Build a `Map` of value → count. Then sort with: if counts differ, return `count(a) - count(b)`; otherwise return `b - a`.',
      ],
      approaches: [
        {
          name: 'Recount inside the comparator',
          idea: 'Every time the sort asks about two values, walk the array to count each one. It gives the right order because the rule is right, but it repeats the same counting about n log n times.',
          code: `function frequencySort(nums) {
  const countOf = (v) => nums.filter((x) => x === v).length;
  return [...nums].sort((a, b) => countOf(a) - countOf(b) || b - a);
}`,
          time: 'O(n² log n)',
          space: 'O(n)',
        },
        {
          name: 'Count once into a Map, then a two-key sort',
          idea: "Counts never change while you sort, so compute them once in one pass. The comparator then only looks up two numbers: by count first (rarer first), and only on a tie by value (bigger first).",
          pseudo: `function frequencySort(nums):
    count ← empty map
    for each x in nums:
        count[x] ← count[x] + 1
    sort nums by (a, b):
        if count[a] ≠ count[b]:
            return count[a] - count[b]    // rarer first
        return b - a                      // tie: bigger first
    return nums`,
          code: `function frequencySort(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  return [...nums].sort((a, b) => {
    if (count.get(a) !== count.get(b)) return count.get(a) - count.get(b);
    return b - a;
  });
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'frequencySort',
      starter: `function frequencySort(nums) {
  // Your code here: rarest values first, ties broken by bigger value first.
  return [];
}`,
      solution: `function frequencySort(nums) {
  const count = new Map();
  for (const x of nums) count.set(x, (count.get(x) ?? 0) + 1);
  return [...nums].sort((a, b) => {
    if (count.get(a) !== count.get(b)) return count.get(a) - count.get(b);
    return b - a;
  });
}`,
      tests: [
        { name: 'classic', args: [[1, 1, 2, 2, 2, 3]], expected: [3, 1, 1, 2, 2, 2] },
        { name: 'tie: bigger first', args: [[2, 3, 1, 3, 2]], expected: [1, 3, 3, 2, 2] },
        { name: 'mixed signs', args: [[-1, 1, -6, 4, 5, -6, 1, 4, 1]], expected: [5, -1, 4, 4, -6, -6, 1, 1, 1] },
        { name: 'one element', args: [[7]], expected: [7] },
        { name: 'all the same', args: [[4, 4, 4]], expected: [4, 4, 4] },
        { name: 'all negatives', args: [[-3, -1, -3, -2, -1, -3]], expected: [-2, -1, -1, -3, -3, -3] },
        { name: 'breaks a text sort', args: [[10, 9, 1, 10, 9, 1]], expected: [10, 10, 9, 9, 1, 1] },
        { name: 'big numbers', args: [[100, 25, 3, 25]], expected: [100, 3, 25, 25] },
      ],
      takeaway: 'If the sort key is costly, compute it once into a Map; then the comparator only compares lookups.',
    },
    {
      id: 'recursion-relative-sort',
      title: "The bakery's featured order",
      difficulty: 'easy',
      leetcode: 1122,
      pattern: 'Counting sort',
      statement: "A bakery stores today's trays as item numbers in `arr1`. The owner gives a featured list `arr2`: distinct item numbers, all of them present in `arr1`. Lay out the trays so that items in `arr2` come first, in exactly `arr2`'s order (all copies of an item together). Then put every item that is not in `arr2` at the end, smallest number first. Item numbers are between 0 and 1000.",
      examples: [
        {
          input: 'arr1 = [2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], arr2 = [2, 1, 4, 3, 9, 6]',
          output: '[2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19]',
          explain: 'All the 2s, then 1, 4, the 3s, 9, 6. Then the leftovers 7 and 19, small to big.',
        },
      ],
      constraints: ['1 ≤ arr1.length ≤ 1000', '0 ≤ arr1[i] ≤ 1000', 'arr2 values are distinct and all appear in arr1'],
      hints: [
        'Give every value a rank: its position in `arr2`. Values not in `arr2` need a rank that puts them after all of those, in number order.',
        'A comparator works. But values only go from 0 to 1000. What can you do with a small range?',
        'Count every value in an array of size 1001. Write out `arr2` values first (all their copies, then zero their count), then walk 0..1000 for the leftovers.',
      ],
      approaches: [
        {
          name: 'Comparator with a rank map',
          idea: "Store each `arr2` value's index in a Map. A value's key is that index, or `arr2.length + value` if it is not in `arr2`, so leftovers land after every featured item and in number order. (Avoid `Infinity` as the rank: `Infinity - Infinity` is `NaN`.)",
          code: `function relativeSortArray(arr1, arr2) {
  const rank = new Map(arr2.map((v, i) => [v, i]));
  const key = (v) => (rank.has(v) ? rank.get(v) : arr2.length + v);
  return [...arr1].sort((a, b) => key(a) - key(b));
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Counting sort over 0..1000',
          idea: 'Values are whole numbers from 0 to 1000, so count them instead of comparing. Writing the output is then just reading counters: first in `arr2` order, then from 0 to 1000 for whatever is left.',
          pseudo: `function relativeSortArray(arr1, arr2):
    count ← array of 1001 zeros
    for each x in arr1:
        count[x] ← count[x] + 1
    out ← empty list
    for each v in arr2:                 // featured items first
        append v to out, count[v] times
        count[v] ← 0                    // used up
    for v from 0 to 1000:               // leftovers, small to big
        append v to out, count[v] times
    return out`,
          code: `function relativeSortArray(arr1, arr2) {
  const count = new Array(1001).fill(0);
  for (const x of arr1) count[x]++;
  const out = [];
  for (const v of arr2) {
    while (count[v] > 0) {
      out.push(v);
      count[v]--;
    }
  }
  for (let v = 0; v <= 1000; v++) {
    while (count[v] > 0) {
      out.push(v);
      count[v]--;
    }
  }
  return out;
}`,
          time: 'O(n + 1000)',
          space: 'O(1000)',
        },
      ],
      fn: 'relativeSortArray',
      starter: `function relativeSortArray(arr1, arr2) {
  // Your code here: arr2's order first, then the leftovers small to big.
  return [];
}`,
      solution: `function relativeSortArray(arr1, arr2) {
  const count = new Array(1001).fill(0);
  for (const x of arr1) count[x]++;
  const out = [];
  for (const v of arr2) {
    while (count[v] > 0) {
      out.push(v);
      count[v]--;
    }
  }
  for (let v = 0; v <= 1000; v++) {
    while (count[v] > 0) {
      out.push(v);
      count[v]--;
    }
  }
  return out;
}`,
      tests: [
        {
          name: 'classic',
          args: [[2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], [2, 1, 4, 3, 9, 6]],
          expected: [2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19],
        },
        { name: 'two leftovers', args: [[28, 6, 22, 8, 44, 17], [22, 28, 8, 6]], expected: [22, 28, 8, 6, 17, 44] },
        { name: 'no leftovers', args: [[3, 1, 2], [3, 1, 2]], expected: [3, 1, 2] },
        { name: 'duplicates grouped', args: [[2, 2, 1, 1, 3, 3], [3, 1, 2]], expected: [3, 3, 1, 1, 2, 2] },
        { name: 'one featured value', args: [[5, 7, 5, 7, 1], [7]], expected: [7, 7, 1, 5, 5] },
        { name: 'leftovers include 0 and 1000', args: [[9, 1000, 0, 4, 1000, 3, 0], [4]], expected: [4, 0, 0, 3, 9, 1000, 1000] },
        { name: 'leftovers by number, not text', args: [[40, 9, 100, 3], [9]], expected: [9, 3, 40, 100] },
        { name: 'featured in the middle', args: [[10, 0, 1000, 50, 10], [50]], expected: [50, 0, 10, 10, 1000] },
      ],
      takeaway: 'Values in a small fixed range (like 0..1000)? Count them, then read the counters in the order you want.',
    },
    {
      id: 'recursion-h-index',
      title: "A researcher's h-index",
      difficulty: 'medium',
      leetcode: 274,
      pattern: 'Counting sort (capped)',
      statement: "Research profiles show a score called the **h-index**. You get `citations`, where `citations[i]` is how many times paper `i` was cited (mentioned by other papers). The h-index is the **largest** `h` such that the researcher has at least `h` papers with at least `h` citations each. Return it.",
      examples: [
        {
          input: 'citations = [3, 0, 6, 1, 5]',
          output: '3',
          explain: 'Three papers (3, 6, 5) have at least 3 citations. There are not four papers with at least 4.',
        },
        { input: 'citations = [1, 3, 1]', output: '1' },
        { input: 'citations = [100]', output: '1', explain: 'One paper can give an h-index of at most 1.' },
      ],
      constraints: ['1 ≤ n ≤ 5000', '0 ≤ citations[i] ≤ 1000'],
      hints: [
        'The answer is between 0 and n (you cannot have more than n papers). Can you just test each possible h?',
        'Sort from most cited to least. If the paper at position `i` (0-based) has at least `i + 1` citations, then `i + 1` papers have at least `i + 1` each.',
        'A paper with 1000 citations counts the same as one with n citations when n is small, because h can never pass n. Cap every value at n, then counting sort into n + 1 buckets.',
        'Walk h from n down to 0, adding up how many papers have at least h citations. Return the first h where that total is at least h.',
      ],
      approaches: [
        {
          name: 'Try every h',
          idea: 'Test h = n, then n - 1, and so on. For each h, count the papers with at least h citations. The first h that works is the largest one. Correct, but each test walks the whole array.',
          code: `function hIndex(citations) {
  const n = citations.length;
  for (let h = n; h >= 0; h--) {
    let papers = 0;
    for (const c of citations) if (c >= h) papers++;
    if (papers >= h) return h;
  }
  return 0;
}`,
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort descending and walk',
          idea: 'After sorting from most cited to least, the first `i + 1` papers are the best `i + 1`. Keep going while the paper at index `i` still has at least `i + 1` citations; the number of steps you take is h.',
          code: `function hIndex(citations) {
  const c = [...citations].sort((a, b) => b - a);
  let h = 0;
  while (h < c.length && c[h] >= h + 1) h++;
  return h;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Counting sort with a cap at n',
          idea: 'h is never bigger than n, so 6 citations and 6,000 citations mean the same thing when n = 5. Cap every value at n and count into buckets 0..n. Then walk h from n down, keeping a running total of papers with at least h citations. The first h where the total reaches h is the answer.',
          pseudo: `function hIndex(citations):
    n ← length of citations
    count ← array of n + 1 zeros
    for each c in citations:
        count[min(c, n)] ← count[min(c, n)] + 1
    papers ← 0                          // papers with ≥ h citations
    for h from n down to 0:
        papers ← papers + count[h]
        if papers ≥ h:
            return h
    return 0`,
          code: `function hIndex(citations) {
  const n = citations.length;
  const count = new Array(n + 1).fill(0);
  for (const c of citations) count[Math.min(c, n)]++;
  let papers = 0;
  for (let h = n; h >= 0; h--) {
    papers += count[h];
    if (papers >= h) return h;
  }
  return 0;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'hIndex',
      starter: `function hIndex(citations) {
  // Your code here: the largest h with h papers cited at least h times each.
  return 0;
}`,
      solution: `function hIndex(citations) {
  const n = citations.length;
  const count = new Array(n + 1).fill(0);
  for (const c of citations) count[Math.min(c, n)]++;
  let papers = 0;
  for (let h = n; h >= 0; h--) {
    papers += count[h];
    if (papers >= h) return h;
  }
  return 0;
}`,
      tests: [
        { name: 'classic', args: [[3, 0, 6, 1, 5]], expected: 3 },
        { name: 'small values', args: [[1, 3, 1]], expected: 1 },
        { name: 'one uncited paper', args: [[0]], expected: 0 },
        { name: 'one famous paper', args: [[100]], expected: 1 },
        { name: 'all zeros', args: [[0, 0, 0]], expected: 0 },
        { name: 'all big (capped at n)', args: [[10, 10, 10]], expected: 3 },
        { name: 'zero and one', args: [[0, 1]], expected: 1 },
        { name: 'mixed', args: [[4, 4, 0, 0, 7, 2, 9, 1, 5]], expected: 4 },
        { name: 'all ones', args: [[1, 1, 1, 1, 1]], expected: 1 },
      ],
      takeaway: 'If the answer can never pass n, cap the values at n and counting sort them: O(n).',
    },
    {
      id: 'recursion-largest-number',
      title: 'The biggest number from jersey numbers',
      difficulty: 'medium',
      leetcode: 179,
      pattern: 'Custom comparator',
      statement: "A team lines up so the jersey numbers, read left to right as one long number, make the **biggest** number possible. You get the jersey numbers `nums` (non-negative whole numbers). Arrange them and return the biggest number as a **string** (it can be too long for a JS number). No leading zeros: if every jersey is 0, return `\"0\"`.",
      examples: [
        { input: 'nums = [10, 2]', output: '"210"', explain: '"210" beats "102".' },
        {
          input: 'nums = [3, 30, 34, 5, 9]',
          output: '"9534330"',
          explain: 'Notice `3` goes before `30`: "330" beats "303".',
        },
        { input: 'nums = [0, 0]', output: '"0"', explain: 'Not "00".' },
      ],
      constraints: ['1 ≤ n ≤ 100', '0 ≤ nums[i] ≤ 10⁹'],
      hints: [
        'Sorting numbers from big to small fails: `[3, 30]` gives "303", but "330" is bigger.',
        'Only look at two numbers at a time. Should `a` go before `b`? Try both orders and see which string is bigger.',
        'Turn every number into a string. Put `a` first if `a + b > b + a`. Both strings have the same length, so comparing them as text is the same as comparing them as numbers.',
        'After sorting, if the first string is "0", every number was 0: return "0".',
      ],
      approaches: [
        {
          name: 'Try every order',
          idea: 'List every way to arrange the numbers, glue each one into a string, and keep the biggest. Always right, but there are n! orders: about 40,000 for 8 numbers, and far too many for 100.',
          time: 'O(n! · n · L)',
          space: 'O(n · L)',
        },
        {
          name: 'Sort numbers big to small (wrong)',
          idea: 'Feels natural, but it compares the wrong thing. `30 > 3`, so it builds "303", while "330" is bigger. The size of the number does not matter; the digits at the front do.',
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Sort with an "a + b vs b + a" comparator',
          idea: 'For any two numbers, glue them both ways and keep the order that makes the bigger string. This rule is consistent (if a should beat b and b should beat c, then a beats c), so a normal sort with it gives the best full order. L is the number of digits, since each comparison builds and compares short strings.',
          pseudo: `function largestNumber(nums):
    s ← every number in nums as a string
    sort s by (a, b):
        if a + b > b + a: return -1     // a first
        if a + b < b + a: return 1      // b first
        return 0
    if s[0] = "0":                      // only zeros
        return "0"
    return s joined with no spaces`,
          code: `function largestNumber(nums) {
  const s = nums.map(String);
  s.sort((a, b) => {
    const ab = a + b;
    const ba = b + a;
    if (ab > ba) return -1;
    if (ab < ba) return 1;
    return 0;
  });
  if (s[0] === '0') return '0';
  return s.join('');
}`,
          time: 'O(n log n · L)',
          space: 'O(n · L)',
        },
      ],
      fn: 'largestNumber',
      starter: `function largestNumber(nums) {
  // Your code here: return the biggest number you can build, as a string.
  return '';
}`,
      solution: `function largestNumber(nums) {
  const s = nums.map(String);
  s.sort((a, b) => {
    const ab = a + b;
    const ba = b + a;
    if (ab > ba) return -1;
    if (ab < ba) return 1;
    return 0;
  });
  if (s[0] === '0') return '0';
  return s.join('');
}`,
      tests: [
        { name: 'two numbers', args: [[10, 2]], expected: '210' },
        { name: 'classic', args: [[3, 30, 34, 5, 9]], expected: '9534330' },
        { name: 'all zeros', args: [[0, 0]], expected: '0' },
        { name: 'single zero', args: [[0]], expected: '0' },
        { name: 'single number', args: [[1]], expected: '1' },
        { name: 'shared prefix', args: [[432, 43243]], expected: '43243432' },
        { name: 'repeats', args: [[8308, 8308, 830]], expected: '83088308830' },
        { name: 'many equal digits', args: [[111311, 1113]], expected: '1113111311' },
        { name: 'nines', args: [[9, 99, 999, 90]], expected: '99999990' },
        { name: 'zeros at the end', args: [[0, 0, 1]], expected: '100' },
      ],
      takeaway: 'When "bigger" depends on how two items combine, compare the two combinations directly in the comparator.',
    },
  ],
  quiz: [
    {
      prompt: 'What does `[25, 100, 3].sort()` return?',
      options: ['`[3, 25, 100]`', '`[100, 25, 3]`', '`[25, 100, 3]`', '`[100, 3, 25]`'],
      answer: 1,
      explanation:
        'With no comparator, the values are compared as text: "100" < "25" < "3" because "1" < "2" < "3". Pass `(a, b) => a - b` to sort numbers.',
    },
    {
      prompt: 'Your comparator returns `5` for the pair `(a, b)`. What does the sort do?',
      options: ['Puts `a` first', 'Puts `b` first', 'Keeps their order', 'Moves `a` 5 places right'],
      answer: 1,
      explanation:
        'Only the sign matters. Negative: `a` first. Positive: `b` first. Zero: keep the order they already had (stability).',
    },
    {
      prompt: 'Which task is the best fit for counting sort?',
      options: [
        'Sort 1 million names A to Z',
        'Sort 1 million ages, each from 0 to 120',
        'Sort 20 prices with cents',
        'Sort 1,000 numbers that can be up to 10⁹',
      ],
      answer: 1,
      explanation:
        'Counting sort needs whole numbers in a small range. Ages 0..120 cost O(n + 121). Names are not small whole numbers, prices have cents, and a range of 10⁹ counters is far too big.',
    },
    {
      prompt: 'For "largest number", why is `[3, 30]` sorted as `3` then `30`?',
      options: [
        'Because 3 is smaller than 30',
        'Because "330" is bigger than "303"',
        'Because strings sort A to Z by default',
        'Because the sort is stable',
      ],
      answer: 1,
      explanation:
        'The comparator glues the pair both ways and keeps the order that builds the bigger string: "3" + "30" = "330" beats "30" + "3" = "303".',
    },
  ],
  takeaways: [
    'Never call `sort()` on numbers without a comparator: it compares them as text. And `sort` changes the array in place; use `toSorted` or `[...a].sort` for a copy.',
    'A comparator returns negative (a first), positive (b first) or 0 (keep order). Never return a boolean. Two rules: compare key 1, and only on a tie compare key 2.',
    'If a sort key is slow to compute, compute it once into a `Map`, then sort.',
    'Whole numbers in a small range: counting sort in O(n + range) beats O(n log n).',
  ],
};

export default lesson;
