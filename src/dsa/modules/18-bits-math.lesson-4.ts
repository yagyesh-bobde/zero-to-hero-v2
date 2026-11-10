import type { Lesson } from '../types';

const lesson: Lesson = {
  id: 'bitmasks-and-subsets',
  title: 'Bitmasks: a whole set in one number',
  summary: 'Use each bit as an in/out switch: loop over every subset, and compare sets with one &.',
  minutes: 24,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Discord permissions',
      text: 'Discord stores what a role may do as one number. Bit 1 is "kick members", bit 2 is "ban members", bit 11 is "send messages", and so on. A role with value `6` (`110`) can kick and ban. To merge two roles, Discord ORs their numbers. To check "can this role ban?", it ANDs with `1 << 2`. A number used like this is called a **bitmask**: a set of yes/no answers, one per bit.',
    },
    {
      kind: 'text',
      text: '**The problem.** A pizza place has toppings with "flavor codes" `[3, 1, 2]`. The strength of a pizza is the OR of its toppings\' codes. What is the strongest possible pizza, and how many different topping choices (non-empty subsets) reach that strength? Here the max is `3 | 1 | 2 = 3`, and 5 choices reach it.',
    },
    {
      kind: 'text',
      text: "**Brute force first.** The usual first idea is recursion: for each topping, take it or skip it (that is backtracking, module 9). It works, and it visits all 2ⁿ subsets.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: take or skip, recursively',
      code: `// best = OR of all nums (OR never lowers a value, so taking everything is the max)
function count(i, value):              // value = OR of items taken so far
    if i = n:
        return 1 if value = best else 0
    return count(i + 1, value OR nums[i])   // take item i
         + count(i + 1, value)              // skip item i
// answer: count(0, 0)  (the empty choice has OR 0, so it never matches)`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Nothing here is wrong, but you need recursion, a call stack and careful base cases just to list subsets. A subset is only a row of n yes/no answers, and a row of yes/no answers is exactly what a binary number is.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'The numbers 0 to 2ⁿ − 1 are all the subsets',
      text: 'Give item `i` the bit `i`. Then every subset is a number: bit `i` is 1 if item `i` is in. Counting from `0` to `2ⁿ − 1` visits every pattern of n bits exactly once, so a plain `for` loop lists every subset. No recursion, no lists to copy.',
    },
    {
      kind: 'trace',
      title: 'Every subset of [3, 1, 2] as a mask',
      columns: ['mask', 'bits (2 1 0)', 'items taken', 'OR', 'is max?'],
      rows: [
        [0, '000', '(none)', 0, 'skip, empty'],
        [1, '001', '3', 3, 'yes'],
        [2, '010', '1', 1, 'no'],
        [3, '011', '3, 1', 3, 'yes'],
        [4, '100', '2', 2, 'no'],
        [5, '101', '3, 2', 3, 'yes'],
        [6, '110', '1, 2', 3, 'yes'],
        [7, '111', '3, 1, 2', 3, 'yes'],
      ],
      note: 'Bits are read from the right: bit 0 is `nums[0] = 3`. Five masks reach the max OR of 3, so the answer is 5.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      code: `// 1 << n = 2ⁿ        (mask >> i) AND 1 = 1 means "item i is in"
function countMaxOrSubsets(nums):
    best ← 0
    for each x in nums:
        best ← best OR x                 // OR of everything is the max
    count ← 0
    for mask from 1 to (1 << n) - 1:     // every non-empty subset
        value ← 0
        for i from 0 to n - 1:
            if (mask >> i) AND 1 = 1:
                value ← value OR nums[i]
        if value = best:
            count ← count + 1
    return count`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function countMaxOrSubsets(nums) {
  const n = nums.length;
  const best = nums.reduce((a, b) => a | b, 0);
  let count = 0;
  for (let mask = 1; mask < 1 << n; mask++) {
    let value = 0;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) value |= nums[i];
    }
    if (value === best) count++;
  }
  return count;
}`,
    },
    {
      kind: 'table',
      title: 'Set operations on masks',
      head: ['set idea', 'mask code', 'example (a = 0110, b = 0011)'],
      rows: [
        ['union (in either)', '`a | b`', '`0111`'],
        ['intersection (in both)', '`a & b`', '`0010`'],
        ['no items shared?', '`(a & b) === 0`', 'false: they share bit 1'],
        ['add item i', '`a | (1 << i)`', 'i = 0: `0111`'],
        ['remove item i', '`a & ~(1 << i)`', 'i = 1: `0100`'],
        ['is a inside b?', '`(a & b) === a`', 'false: bit 2 is only in a'],
        ['all n items', '`(1 << n) - 1`', 'n = 4: `1111`'],
      ],
    },
    {
      kind: 'text',
      text: "**Masks also make comparisons fast.** Do the words `\"abc\"` and `\"def\"` share a letter? With sets you compare letter by letter. With masks you turn each word into a 26-bit number once (bit 0 = `a`, bit 1 = `b`, …) and then one `&` answers the question for any pair.",
    },
    {
      kind: 'diagram',
      title: 'Words as 26-bit letter masks (low 8 bits shown)',
      art: `                 h g f e d c b a
"abc"   ->       0 0 0 0 0 1 1 1
"def"   ->       0 0 1 1 1 0 0 0
"ad"    ->       0 0 0 0 1 0 0 1

"abc" & "def" =  0 0 0 0 0 0 0 0   no shared letter
"abc" & "ad"  =  0 0 0 0 0 0 0 1   both have 'a'`,
      caption: 'Letter `ch` sets bit `ch.charCodeAt(0) - 97` (97 is the code of `a`).',
    },
    {
      kind: 'compare',
      title: 'Count max-OR subsets (n items)',
      rows: [
        { approach: 'Recursion: take or skip', time: 'O(2ⁿ)', space: 'O(n) stack', note: 'Backtracking style (module 9). Fine, more code.' },
        { approach: 'Loop masks, OR from scratch', time: 'O(2ⁿ · n)', space: 'O(1)', note: 'Simplest to write. n ≤ 16 means about a million steps.' },
        { approach: 'Masks + reuse a smaller mask', time: 'O(2ⁿ)', space: 'O(2ⁿ)', note: '`or[mask] = or[mask without its lowest bit] | that item`. Faster, uses memory.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Pattern: bitmask as a set',
      code: `// Signals: n ≤ 20 (2ⁿ is about a million), "every subset / combination",
// "letters must be unique", "share no common letters", on/off states
for mask from 0 to (1 << n) - 1:      // every subset, once
    for i from 0 to n - 1:
        if (mask >> i) AND 1 = 1:     // item i is in this subset
            use items[i]

letterMask(word):                     // a set of letters in one number
    m ← 0
    for each ch in word:
        m ← m OR (1 << (ch - 'a'))
    return m`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: '1 << n stops working at n = 31',
      text: "In JS, `1 << 31` is negative and `1 << 32` is `1` (the shift amount wraps around at 32). So `for (mask = 0; mask < 1 << n; ...)` silently breaks for n ≥ 31. You would never loop over 2³¹ subsets anyway, but a 26-letter mask is fine and a 40-item mask is not. Also, check your constraints: masks over all subsets only work when n is small (about 20 or less).",
    },
  ],
  problems: [
    {
      id: 'bits-math-count-max-or-subsets',
      title: 'Count subsets with the maximum OR',
      difficulty: 'medium',
      leetcode: 2044,
      pattern: 'Bitmask as a set',
      statement:
        'Each pizza topping has a flavor code. A pizza\'s strength is the OR of its toppings\' codes. Given the codes `nums`, find the largest possible strength, and return **how many** non-empty topping choices reach it. Choices are different if they use different positions, even when the codes are equal.',
      examples: [
        { input: 'nums = [3, 1]', output: '2', explain: 'Max OR is 3: `[3]` and `[3, 1]`.' },
        { input: 'nums = [2, 2, 2]', output: '7', explain: 'Every one of the 7 non-empty choices has OR 2.' },
        { input: 'nums = [3, 2, 1, 5]', output: '6', explain: 'Max OR is 7.' },
      ],
      constraints: ['1 ≤ n ≤ 16', '1 ≤ nums[i] ≤ 10⁵'],
      hints: [
        'OR never turns a bit off, so taking more items never lowers the OR. What is the biggest OR possible?',
        'The OR of the whole array is the maximum.',
        'n ≤ 16, so you can afford to try all 2ⁿ subsets. Use each `mask` from 1 to `2ⁿ − 1` as a subset.',
      ],
      approaches: [
        {
          name: 'Recursion: take or skip',
          idea: 'For each item, branch on taking it or not, carrying the OR so far. Count the leaves whose OR equals the max.',
          code: `function countMaxOrSubsets(nums) {
  const best = nums.reduce((a, b) => a | b, 0);
  const go = (i, value) =>
    i === nums.length ? (value === best ? 1 : 0) : go(i + 1, value | nums[i]) + go(i + 1, value);
  return go(0, 0);
}`,
          time: 'O(2ⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Loop over masks',
          idea: 'Every number from 1 to 2ⁿ − 1 is one non-empty subset: bit `i` says whether item `i` is in. OR the chosen items and compare with the max.',
          pseudo: `function countMaxOrSubsets(nums):
    best ← OR of all nums
    count ← 0
    for mask from 1 to (1 << n) - 1:
        value ← 0
        for i from 0 to n - 1:
            if (mask >> i) AND 1 = 1:
                value ← value OR nums[i]
        if value = best:
            count ← count + 1
    return count`,
          code: `function countMaxOrSubsets(nums) {
  const n = nums.length;
  const best = nums.reduce((a, b) => a | b, 0);
  let count = 0;
  for (let mask = 1; mask < 1 << n; mask++) {
    let value = 0;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) value |= nums[i];
    }
    if (value === best) count++;
  }
  return count;
}`,
          time: 'O(2ⁿ · n)',
          space: 'O(1)',
        },
      ],
      fn: 'countMaxOrSubsets',
      starter: `function countMaxOrSubsets(nums) {
  // how many non-empty subsets have the biggest possible OR?
  return 0;
}`,
      solution: `function countMaxOrSubsets(nums) {
  const n = nums.length;
  const best = nums.reduce((a, b) => a | b, 0);
  let count = 0;
  for (let mask = 1; mask < 1 << n; mask++) {
    let value = 0;
    for (let i = 0; i < n; i++) {
      if ((mask >> i) & 1) value |= nums[i];
    }
    if (value === best) count++;
  }
  return count;
}`,
      tests: [
        { name: 'example', args: [[3, 1]], expected: 2 },
        { name: 'all equal', args: [[2, 2, 2]], expected: 7 },
        { name: 'four items', args: [[3, 2, 1, 5]], expected: 6 },
        { name: 'one item', args: [[1]], expected: 1 },
        { name: 'lesson example', args: [[3, 1, 2]], expected: 5 },
        { name: 'separate bits', args: [[1, 2, 4, 8]], expected: 1 },
        { name: 'duplicates count separately', args: [[5, 5]], expected: 3 },
        { name: 'ten ones', args: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]], expected: 1023 },
      ],
      takeaway: 'For n ≤ ~20, loop `mask` from 0 to 2ⁿ − 1 and treat bit i as "item i is in".',
    },
    {
      id: 'bits-math-max-product-word-lengths',
      title: 'Maximum product of word lengths',
      difficulty: 'medium',
      leetcode: 318,
      pattern: 'Bitmask as a set',
      statement:
        'A word game scores a pair of words by multiplying their lengths, but only if the two words share **no** letter. Words use only lowercase `a`-`z`. Return the best score over all pairs, or 0 if no pair works.',
      examples: [
        { input: 'words = ["abcw", "baz", "foo", "bar", "xtfn", "abcdef"]', output: '16', explain: '`"abcw"` and `"xtfn"`: 4 × 4.' },
        { input: 'words = ["a", "ab", "abc", "d", "cd", "bcd", "abcd"]', output: '4', explain: '`"ab"` and `"cd"`.' },
        { input: 'words = ["a", "aa", "aaa", "aaaa"]', output: '0' },
      ],
      constraints: ['2 ≤ n ≤ 1000', '1 ≤ word length ≤ 1000'],
      hints: [
        'You will check about n²/2 pairs. Make each check fast.',
        'Only the set of letters matters, not their order or count. There are just 26 letters.',
        'Turn each word into a 26-bit mask once. Two words share no letter when `(maskA & maskB) === 0`.',
      ],
      approaches: [
        {
          name: 'Compare letters for every pair',
          idea: 'For each pair, build a Set from one word and check every letter of the other. Each pair costs O(L) for word length L.',
          time: 'O(n² · L)',
          space: 'O(L)',
        },
        {
          name: 'Letter masks',
          idea: 'A word\'s letters fit in 26 bits. Build all masks once (O(total letters)); after that, "no shared letter" is a single `&` per pair.',
          pseudo: `function maxProduct(words):
    masks ← list of n zeros
    for i from 0 to n - 1:
        for each ch in words[i]:
            masks[i] ← masks[i] OR (1 << (ch - 'a'))
    best ← 0
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if masks[i] AND masks[j] = 0:          // no letter in common
                best ← max(best, len(words[i]) × len(words[j]))
    return best`,
          code: `function maxProduct(words) {
  const masks = words.map((w) => {
    let m = 0;
    for (const ch of w) m |= 1 << (ch.charCodeAt(0) - 97);
    return m;
  });
  let best = 0;
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if ((masks[i] & masks[j]) === 0) {
        best = Math.max(best, words[i].length * words[j].length);
      }
    }
  }
  return best;
}`,
          time: 'O(n² + total letters)',
          space: 'O(n)',
        },
      ],
      fn: 'maxProduct',
      starter: `function maxProduct(words) {
  // best length × length over pairs with no shared letter
  return 0;
}`,
      solution: `function maxProduct(words) {
  const masks = words.map((w) => {
    let m = 0;
    for (const ch of w) m |= 1 << (ch.charCodeAt(0) - 97);
    return m;
  });
  let best = 0;
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if ((masks[i] & masks[j]) === 0) {
        best = Math.max(best, words[i].length * words[j].length);
      }
    }
  }
  return best;
}`,
      tests: [
        { name: 'example 1', args: [['abcw', 'baz', 'foo', 'bar', 'xtfn', 'abcdef']], expected: 16 },
        { name: 'example 2', args: [['a', 'ab', 'abc', 'd', 'cd', 'bcd', 'abcd']], expected: 4 },
        { name: 'all share a', args: [['a', 'aa', 'aaa', 'aaaa']], expected: 0 },
        { name: 'two words', args: [['ab', 'cd']], expected: 4 },
        { name: 'single letters', args: [['x', 'y']], expected: 1 },
        { name: 'same word twice', args: [['abc', 'abc']], expected: 0 },
        { name: 'repeated letters', args: [['eae', 'ea', 'aaf', 'bda', 'fcf', 'dc', 'ac', 'ce', 'cefde', 'dabae']], expected: 15 },
        { name: 'uses z', args: [['zzzz', 'yz', 'abc']], expected: 12 },
      ],
      takeaway: 'A set of letters fits in a 26-bit mask; "no common letter" becomes `(a & b) === 0`.',
    },
    {
      id: 'bits-math-max-unique-concat',
      title: 'Longest string with all-unique letters',
      difficulty: 'medium',
      leetcode: 1239,
      pattern: 'Bitmask as a set',
      statement:
        'You are making a password by gluing together some of the given word pieces (any subset, kept in order). Every letter in the final password must be different. Return the longest possible password length. Pieces use only lowercase `a`-`z`.',
      examples: [
        { input: 'arr = ["un", "iq", "ue"]', output: '4', explain: '`"uniq"` or `"ique"`. `"unue"` repeats `u`.' },
        { input: 'arr = ["cha", "r", "act", "ers"]', output: '6', explain: '`"chaers"` or `"acters"`.' },
        { input: 'arr = ["aa", "bb"]', output: '0', explain: 'Each piece repeats a letter by itself.' },
      ],
      constraints: ['1 ≤ n ≤ 16', '1 ≤ piece length ≤ 26'],
      hints: [
        'Order does not change which letters are used, so this is about choosing a subset of pieces.',
        'Turn each piece into a letter mask. Skip pieces that repeat a letter inside themselves.',
        'Two letter sets can be joined only when `(a & b) === 0`; the joined set is `a | b`.',
        'Keep a list of every valid combined mask so far, starting with `[0]`. For each new piece, try adding it to each mask in the list.',
      ],
      approaches: [
        {
          name: 'Try every subset of pieces',
          idea: 'Loop `mask` over all 2ⁿ subsets, join the chosen pieces, and check whether all letters are unique. Simple, and fine for n ≤ 16.',
          code: `function maxLength(arr) {
  let best = 0;
  for (let mask = 0; mask < 1 << arr.length; mask++) {
    let s = '';
    for (let i = 0; i < arr.length; i++) if ((mask >> i) & 1) s += arr[i];
    if (new Set(s).size === s.length) best = Math.max(best, s.length);
  }
  return best;
}`,
          time: 'O(2ⁿ · n · 26)',
          space: 'O(26n)',
        },
        {
          name: 'Grow only valid letter sets',
          idea: 'Keep a list of letter masks that are reachable with no repeats. Each new piece can extend any mask it does not overlap. Masks that already clash are never built, so the list stays small.',
          pseudo: `function maxLength(arr):
    combos ← [0]                         // the empty password
    best ← 0
    for each piece in arr:
        m ← letter mask of piece
        if piece repeats a letter:
            skip this piece
        for each c in a copy of combos:
            if c AND m = 0:              // no shared letters
                append (c OR m) to combos
                best ← max(best, number of 1 bits in (c OR m))
    return best`,
          code: `function maxLength(arr) {
  const combos = [0];
  let best = 0;
  for (const piece of arr) {
    let m = 0;
    let ok = true;
    for (const ch of piece) {
      const bit = 1 << (ch.charCodeAt(0) - 97);
      if (m & bit) ok = false;
      m |= bit;
    }
    if (!ok) continue;
    const size = combos.length;
    for (let k = 0; k < size; k++) {
      if ((combos[k] & m) === 0) {
        const joined = combos[k] | m;
        combos.push(joined);
        let x = joined;
        let count = 0;
        while (x) {
          x &= x - 1;
          count++;
        }
        best = Math.max(best, count);
      }
    }
  }
  return best;
}`,
          time: 'O(2ⁿ) worst case',
          space: 'O(2ⁿ)',
        },
      ],
      fn: 'maxLength',
      starter: `function maxLength(arr) {
  // longest concatenation with no repeated letter
  return 0;
}`,
      solution: `function maxLength(arr) {
  const combos = [0];
  let best = 0;
  for (const piece of arr) {
    let m = 0;
    let ok = true;
    for (const ch of piece) {
      const bit = 1 << (ch.charCodeAt(0) - 97);
      if (m & bit) ok = false;
      m |= bit;
    }
    if (!ok) continue;
    const size = combos.length;
    for (let k = 0; k < size; k++) {
      if ((combos[k] & m) === 0) {
        const joined = combos[k] | m;
        combos.push(joined);
        let x = joined;
        let count = 0;
        while (x) {
          x &= x - 1;
          count++;
        }
        best = Math.max(best, count);
      }
    }
  }
  return best;
}`,
      tests: [
        { name: 'example 1', args: [['un', 'iq', 'ue']], expected: 4 },
        { name: 'example 2', args: [['cha', 'r', 'act', 'ers']], expected: 6 },
        { name: 'whole alphabet', args: [['abcdefghijklmnopqrstuvwxyz']], expected: 26 },
        { name: 'all pieces repeat', args: [['aa', 'bb']], expected: 0 },
        { name: 'single letters', args: [['a', 'b', 'c']], expected: 3 },
        { name: 'duplicate pieces', args: [['ab', 'cd', 'ab']], expected: 4 },
        { name: 'greedy trap', args: [['abc', 'def', 'bp', 'dq', 'eg', 'fh']], expected: 9 },
        { name: 'two good ones', args: [['a', 'abc', 'd', 'de', 'def']], expected: 6 },
      ],
      takeaway: 'Grow a list of valid masks: join with `|` only when `&` says they do not overlap.',
    },
  ],
  quiz: [
    {
      prompt: 'Items are `[pen, cup, hat]` (bit 0 = pen). Which items does mask `5` (`101`) hold?',
      options: ['pen and cup', 'pen and hat', 'cup and hat', 'only hat'],
      answer: 1,
      explanation: 'Bits 0 and 2 are on: item 0 (pen) and item 2 (hat).',
    },
    {
      prompt: 'How do you check that two letter masks `a` and `b` share no letter?',
      options: ['`a | b === 0`', '`(a & b) === 0`', '`(a ^ b) === 0`', '`a === b`'],
      answer: 1,
      explanation: '`a & b` has a 1 exactly where both have the letter. Zero means nothing in common.',
    },
    {
      prompt: 'n = 25 items. Is "loop over every mask" a good plan?',
      options: [
        'Yes, 2²⁵ is small',
        'No: 2²⁵ is about 33 million subsets, times n work each. Too slow for most limits.',
        'Yes, masks are always O(n)',
        'No, masks only work for n ≤ 8',
      ],
      answer: 1,
      explanation: 'Subset masks are great up to about n = 20 (about a million subsets).',
    },
  ],
  takeaways: [
    'A bitmask is a set: bit i on means item i is in.',
    'Looping `mask` from 0 to 2ⁿ − 1 visits every subset once. Use it when n ≤ ~20.',
    'Letters fit in a 26-bit mask: `(a & b) === 0` means no shared letter, `a | b` joins them.',
  ],
};

export default lesson;
