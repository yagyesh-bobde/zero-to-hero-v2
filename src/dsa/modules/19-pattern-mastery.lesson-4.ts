import type { Lesson } from '../types';

// Module 19, lesson 4. Owner: Content J.

const findDupBinaryJs = `function findDuplicate(nums) {
  let lo = 1;
  let hi = nums.length - 1; // biggest possible value
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let count = 0;
    for (const x of nums) if (x <= mid) count++;
    if (count > mid) hi = mid; // too many values in 1..mid
    else lo = mid + 1;
  }
  return lo;
}`;

const findDupFloydJs = `function findDuplicate(nums) {
  // Treat i -> nums[i] as a linked list. The duplicate is where the cycle starts.
  let slow = nums[0];
  let fast = nums[0];
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`;

const encodeDecodeJs = `function encode(strs) {
  // Each string becomes "<length>#<string>".
  return strs.map((s) => s.length + '#' + s).join('');
}

function decode(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    let j = i;
    while (s[j] !== '#') j++; // digits never contain '#'
    const len = Number(s.slice(i, j));
    out.push(s.slice(j + 1, j + 1 + len));
    i = j + 1 + len; // jump over the body, never read it
  }
  return out;
}

function roundTrip(strs) {
  return decode(encode(strs));
}`;

const randomizedSetJs = `class RandomizedSet {
  constructor() {
    this.vals = []; // the values, for O(1) random picks
    this.pos = new Map(); // value -> its index in vals
  }
  insert(x) {
    if (this.pos.has(x)) return false;
    this.pos.set(x, this.vals.length);
    this.vals.push(x);
    return true;
  }
  remove(x) {
    if (!this.pos.has(x)) return false;
    const i = this.pos.get(x);
    const last = this.vals[this.vals.length - 1];
    this.vals[i] = last; // move the last value into the hole
    this.pos.set(last, i);
    this.vals.pop();
    this.pos.delete(x);
    return true;
  }
  getRandom() {
    return this.vals[Math.floor(Math.random() * this.vals.length)];
  }
}

function runRandomizedSet(ops) {
  const set = new RandomizedSet();
  return ops.map(([op, x]) => (op === 'getRandom' ? set.getRandom() : set[op](x)));
}`;

const lesson: Lesson = {
  id: 'interview-playbook',
  title: 'The interview playbook: talk, test, time',
  summary: 'A 45-minute plan, what to say at each stage, and how to test your code by hand.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Pilots still read the checklist',
      text: "A pilot with 20,000 flying hours still reads the pre-flight checklist out loud before every take-off. Not because they forgot how to fly. Because under pressure, smart people skip steps. A coding interview is the same: you know the patterns from modules 1-18, but with a clock running and someone watching, you forget to ask about empty input or you start coding too early. This lesson is your checklist.",
    },
    {
      kind: 'text',
      text: 'A coding interview tests three things besides "can you solve it": **time** (do you finish in 45 minutes), **talk** (can the interviewer follow your thinking), and **test** (can you find your own bugs without running the code). We will build a plan for each, then use all three on one real problem: *Find the Duplicate Number*.',
    },
    {
      kind: 'table',
      title: 'Time: the 45-minute plan',
      head: ['Minutes', 'Stage', 'What you do'],
      rows: [
        ['0-5', 'Clarify & examples', 'Repeat the problem in your words. Ask the checklist questions below. Write 1-2 tiny examples and agree on the output.'],
        ['5-12', 'Brute force + cost', 'Say the simplest correct idea and its Big-O out loud. Compare it with the size limit (module 1).'],
        ['12-18', 'Optimize & agree', 'Find the waste, pick a pattern, say the new cost. Ask "Does this sound good before I code it?"'],
        ['18-35', 'Code', 'Write clean code with good names. Say what each part does as you write it.'],
        ['35-42', 'Test by hand', 'Dry-run a tiny input line by line. Then walk the edge-case list. Fix bugs out loud.'],
        ['42-45', 'Your questions', 'Ask about the team or the work. Have one or two ready.'],
      ],
    },
    {
      kind: 'table',
      title: 'The clarify checklist (minutes 0-5)',
      head: ['Ask about', 'The question'],
      rows: [
        ['Size', 'How big is n? How big are the values? (This picks your target Big-O.)'],
        ['Empty', 'Can the array or string be empty?'],
        ['Duplicates', 'Can values repeat?'],
        ['Negatives', 'Can values be negative or zero?'],
        ['Sorted', 'Is the input already sorted?'],
        ['Modify', 'Can I change the input, or must I leave it as it is?'],
        ['Nothing found', 'What do I return if there is no answer? -1? An empty list?'],
      ],
    },
    {
      kind: 'list',
      items: [
        "**Behind at minute 18 with no better idea?** Say the brute force clearly and code it. Working slow code beats an unfinished fast idea. You can say: \"I'll code the O(n²) version now, then improve it if there's time.\"",
        '**Stuck for 3 minutes?** Ask for a hint *early*. A hint at minute 15 costs you a little. Silence until minute 30 costs you the interview.',
        '**Shrink the input.** Solve n = 1, 2, 3 by hand and watch what *you* do. Your hands often find the pattern before your head does.',
        '**Two problems in one round?** Use the same stages at about half length: aim to finish the first problem by minute 22.',
        '**Walk the signals table** (lesson 1 of this module). Sorted? Range of k? "All ways"? Min/max of something? Try each pattern for 30 seconds.',
      ],
    },
    {
      kind: 'table',
      title: 'Talk: what to say at each stage',
      head: ['Stage', 'Say something like'],
      rows: [
        ['Clarify', '"Can the array be empty?" "Can values be negative?" "If there is no answer, what should I return?"'],
        ['Brute force', '"The brute force checks every pair, so it is O(n²). n is up to 10⁵, so that is 10¹⁰ steps. Too slow. I need about O(n log n)."'],
        ['Optimize', '"I keep re-scanning to find the partner. I\'ll use a map from value to index, because then each lookup is O(1)."'],
        ['Agree', '"So the plan is one pass with a map, O(n) time and O(n) space. Shall I code that?"'],
        ['Code', '"This loop grows the window. This `while` shrinks it until it is valid again."'],
        ['Test', '"Let me trace [2, 7, 11] with target 9. i = 0, need is 7, the map is empty, so I add 2…"'],
      ],
    },
    {
      kind: 'text',
      text: '**Worked example: Find the Duplicate Number.** You get n + 1 numbers. Every number is between 1 and n, so at least one value must repeat. Return it. Example: `[1, 3, 4, 2, 2]` → `2`. Your first thought is probably "sort it" or "use a set". Both work. But watch what happens when you ask the clarifying questions.',
    },
    {
      kind: 'table',
      title: 'Clarifying kills the obvious answers',
      head: ['You ask', 'Interviewer says', 'What it changes'],
      rows: [
        ['"Can I sort the array?"', '"No, don\'t change it."', 'Sorting in place is out.'],
        ['"Can I use a set or a copy?"', '"Only O(1) extra space."', 'A set is out. Sorting a copy is out too.'],
        ['"Is exactly one value repeated?"', '"Yes, but it may repeat many times."', 'The sum trick (total − 1+2+…+n) breaks: `[2, 2, 2]` fools it.'],
        ['"How big is n?"', '"Up to 10⁵."', 'Checking every pair, O(n²), is too slow.'],
        ['"What are the values?"', '"Always 1 to n."', 'This is the clue. The values live in a small, known range.'],
      ],
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Search the values, not the array',
      text: 'Pick a number `mid`. If there were no repeat, at most `mid` values could be ≤ `mid` (only 1, 2, …, mid fit). So if you **count more than `mid`** values that are ≤ `mid`, the repeat must be in `1..mid`. Otherwise it is in `mid+1..n`. That is a yes/no question you can binary search on: **binary search on the answer** (module 5). Each guess costs one O(n) count and no extra space.',
    },
    {
      kind: 'steps',
      title: 'Binary search on the value range of [1, 3, 4, 2, 2]',
      frames: [
        { cells: [1, 3, 4, 2, 2], vars: { lo: 1, hi: 4 }, note: 'The answer is a value from 1 to 4. Start with `lo = 1`, `hi = 4`.' },
        { cells: [1, 3, 4, 2, 2], active: [0, 3, 4], vars: { lo: 1, hi: 4, mid: 2, 'count ≤ 2': 3 }, note: 'Guess `mid = 2`. Three values are ≤ 2, but only two slots (1 and 2) exist. Too many: the repeat is in 1..2, so `hi = 2`.' },
        { cells: [1, 3, 4, 2, 2], active: [0], vars: { lo: 1, hi: 2, mid: 1, 'count ≤ 1': 1 }, note: 'Guess `mid = 1`. One value is ≤ 1. That is not too many, so the repeat is in 2..2: `lo = 2`.' },
        { cells: [1, 3, 4, 2, 2], found: [3, 4], vars: { lo: 2, hi: 2 }, note: '`lo = hi = 2`. The range has one value left. The duplicate is **2**.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Binary search on the value range',
      code: `function findDuplicate(nums):
    lo ← 1
    hi ← length(nums) - 1             // biggest possible value
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        count ← 0
        for each x in nums:
            if x ≤ mid:
                count ← count + 1
        if count > mid:                // too many values in lo..mid
            hi ← mid                   // mid itself may be the answer
        else:
            lo ← mid + 1
    return lo`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'Binary search on the value range — O(n log n) time, O(1) space',
      code: findDupBinaryJs,
    },
    {
      kind: 'diagram',
      title: 'The O(n) answer: fast/slow pointers (module 7)',
      art: `nums = [1, 3, 4, 2, 2]   (index i points to nums[i])

  0 ──> 1 ──> 3 ──> 2 ──> 4
                    ^     |
                    └─────┘
  two arrows point into 2 (from 3 and from 4)
  because the value 2 appears twice`,
      caption: 'Follow `i → nums[i]` and you get a linked list with a cycle. The duplicate is where the cycle starts. Floyd\'s fast/slow pointers (module 7) find that spot in O(n) time and O(1) space. It is the best answer; the problem below asks you to code it.',
    },
    {
      kind: 'compare',
      title: 'Find the Duplicate: four approaches',
      rows: [
        { approach: 'Sort, then check neighbors', time: 'O(n log n)', space: 'O(1) or O(n)', note: 'Breaks a rule: it changes the array, or needs an O(n) copy.' },
        { approach: 'Set of seen values', time: 'O(n)', space: 'O(n)', note: 'The obvious answer. Breaks the O(1) space rule.' },
        { approach: 'Binary search on the value range', time: 'O(n log n)', space: 'O(1)', note: 'Count values ≤ mid (module 5). Easy to explain and get right in an interview.' },
        { approach: "Floyd's fast/slow pointers", time: 'O(n)', space: 'O(1)', note: 'Treat `i → nums[i]` as a linked list (module 7). Best, but harder to come up with under pressure.' },
      ],
    },
    {
      kind: 'text',
      text: '**Test: trace values, don\'t re-read.** Say you wrote `hi ← mid - 1` instead of `hi ← mid` (it *looks* like normal binary search). Reading the code again, it looks fine. So pick the tiny input `[1, 3, 4, 2, 2]` and write down every variable as each line runs.',
    },
    {
      kind: 'trace',
      title: 'Dry run with the buggy line, then with the fix',
      columns: ['run', 'lo', 'hi', 'mid', 'count ≤ mid', 'what happens'],
      rows: [
        ['buggy', 1, 4, 2, 3, '3 > 2, so hi ← mid - 1 = 1. Wrong: the answer 2 was just thrown away.'],
        ['buggy', 1, 1, '-', '-', 'lo < hi is false. Returns 1, but the answer is 2.'],
        ['fixed', 1, 4, 2, 3, '3 > 2, so hi ← mid = 2. The answer 2 stays inside the range.'],
        ['fixed', 1, 2, 1, 1, '1 is not > 1, so lo ← mid + 1 = 2.'],
        ['fixed', 2, 2, '-', '-', 'lo < hi is false. Returns 2. Correct.'],
      ],
      note: 'The bug shows up in the very first row. When `count > mid`, `mid` itself can be the duplicate, so you must keep it: `hi ← mid`. Say out loud: "Here hi skipped past the answer, so this should be `hi = mid`."',
    },
    {
      kind: 'table',
      title: 'Edge-case list (walk it after the dry run)',
      head: ['Case', 'What to check'],
      rows: [
        ['Empty', '`[]` or `""`. Does your loop even start? Do you read `nums[0]`?'],
        ['One or two items', 'The smallest cases, where windows and pointers break.'],
        ['All the same', '`[2, 2, 2, 2]`.'],
        ['Duplicates', 'Does your map overwrite an index you still need?'],
        ['Negatives and zero', 'They break "all values are positive" tricks, like a shrinking sum window.'],
        ['Sorted or reverse sorted', 'A common worst case.'],
        ['Huge values', 'Sums or products above 2⁵³ (about 9 × 10¹⁵) lose precision in JS numbers.'],
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three ways strong people fail',
      text: '**Going silent for 10 minutes.** The interviewer cannot give credit for thinking they cannot hear. Think out loud, even when unsure. **Coding before agreeing on the approach.** If your idea is wrong, you lose 15 minutes of code. Ask "Shall I code this?" first. **"Testing" by re-reading.** Your eyes see what you *meant* to write. Only tracing real values with a tiny input catches bugs like `hi = mid - 1`.',
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-find-duplicate',
      title: 'Find the Duplicate Number',
      difficulty: 'medium',
      leetcode: 287,
      pattern: 'Playbook drill',
      statement:
        'A ticket machine printed **n + 1** tickets, each numbered from **1 to n**. So at least one number was printed twice. In fact exactly one number repeats, but it may repeat many times. The tickets are glued to the wall in a row: you **must not change** `nums`, and your notebook holds only a few numbers (**O(1) extra space**). Return the repeated number.',
      examples: [
        { input: 'nums = [1, 3, 4, 2, 2]', output: '2' },
        { input: 'nums = [3, 1, 3, 4, 2]', output: '3' },
        { input: 'nums = [2, 2, 2, 2, 2]', output: '2', explain: 'The repeated value can show up more than twice.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', 'nums.length = n + 1', '1 ≤ nums[i] ≤ n', 'exactly one value repeats', 'do not modify nums, use O(1) extra space'],
      hints: [
        'Which pattern fits? The rules ban sorting and sets, so look at what is left: *n + 1 values, all between 1 and n*. Pick any number m. With no repeat, how many values could be ≤ m at most?',
        'Two patterns work. Binary search on the answer (module 5): count values ≤ mid; if the count is more than mid, the repeat is in 1..mid. Or fast/slow pointers (module 7): every value is also a valid index, so `i → nums[i]` is a linked list with a cycle.',
        'Floyd: start `slow` and `fast` at `nums[0]`. Move `slow ← nums[slow]` and `fast ← nums[nums[fast]]` until they meet. Then reset `slow ← nums[0]` and move both one step at a time. Where they meet again is the duplicate.',
      ],
      approaches: [
        {
          name: 'Sort, then check neighbors',
          idea: 'After sorting, equal values sit next to each other, so one pass finds them. But it changes the array, or needs an O(n) copy. Both break the rules.',
          time: 'O(n log n)',
          space: 'O(n) for the copy',
        },
        {
          name: 'Set of seen values',
          idea: 'Walk the array and add each value to a set. The first value already in the set is the answer. Simple and fast, but the set uses O(n) space.',
          time: 'O(n)',
          space: 'O(n)',
        },
        {
          name: 'Binary search on the value range',
          idea: 'If more than `mid` values are ≤ `mid`, there are too many values for the slots 1..mid, so the repeat is in 1..mid. Halve the range each time. Each guess is one O(n) count.',
          pseudo: `function findDuplicate(nums):
    lo ← 1
    hi ← length(nums) - 1
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        count ← number of x in nums with x ≤ mid
        if count > mid:
            hi ← mid
        else:
            lo ← mid + 1
    return lo`,
          code: findDupBinaryJs,
          time: 'O(n log n)',
          space: 'O(1)',
        },
        {
          name: "Floyd's fast/slow pointers",
          idea: 'Every value is between 1 and n, so it is also a valid index. Following `i → nums[i]` makes a linked list. The repeated value has two arrows pointing into it, so that is where a cycle starts. Floyd (module 7) finds the cycle entrance: meet inside the cycle, then restart one pointer and step both together.',
          pseudo: `function findDuplicate(nums):
    slow ← nums[0]
    fast ← nums[0]
    repeat:
        slow ← nums[slow]
        fast ← nums[nums[fast]]
    until slow = fast              // they meet inside the cycle
    slow ← nums[0]
    while slow ≠ fast:             // step both one at a time
        slow ← nums[slow]
        fast ← nums[fast]
    return slow                    // the cycle entrance = the duplicate`,
          code: findDupFloydJs,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'findDuplicate',
      starter: `function findDuplicate(nums) {
  // Don't change nums. Use O(1) extra space.
  return 0;
}`,
      solution: findDupFloydJs,
      tests: [
        { name: 'example', args: [[1, 3, 4, 2, 2]], expected: 2 },
        { name: 'repeat at the front', args: [[3, 1, 3, 4, 2]], expected: 3 },
        { name: 'smallest case (n = 1)', args: [[1, 1]], expected: 1 },
        { name: 'two slots', args: [[2, 1, 2]], expected: 2 },
        { name: 'all the same', args: [[2, 2, 2, 2, 2]], expected: 2 },
        { name: 'repeats three times', args: [[1, 4, 4, 2, 4]], expected: 4 },
        { name: 'biggest value repeats', args: [[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]], expected: 9 },
        { name: 'repeat in the middle', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 5]], expected: 5 },
        { name: 'reverse sorted', args: [[7, 6, 5, 4, 3, 2, 1, 1]], expected: 1 },
      ],
      takeaway: '*values 1..n, can\'t modify, O(1) space* → binary search on the value range with a count, or fast/slow pointers on `i → nums[i]`.',
    },
    {
      id: 'pattern-mastery-encode-decode',
      title: 'Encode and Decode Strings',
      difficulty: 'medium',
      leetcode: 271,
      pattern: 'Playbook drill',
      statement:
        "A chat app sends a whole list of messages as **one string** over the network, and the other side must rebuild the exact list. Messages can contain **any** character: `#`, `,`, digits, spaces. A message can also be empty, and the list itself can be empty. Write `encode(strs)` that turns the list into one string, and `decode(s)` that turns it back. We test `roundTrip(strs)`, which is already written: it returns `decode(encode(strs))`, and that must equal `strs` exactly.",
      examples: [
        { input: 'strs = ["hi", "a#b", ""]', output: '["hi", "a#b", ""]', explain: 'One possible encoding is `"2#hi3#a#b0#"`.' },
        { input: 'strs = []', output: '[]', explain: 'An empty list must not come back as `[""]`.' },
      ],
      constraints: ['0 ≤ strs.length ≤ 200', '0 ≤ strs[i].length ≤ 200', 'strs[i] can contain any character'],
      hints: [
        'Which pattern fits? Any character can appear *inside* a message, so no single character is safe to split on. What could the reader learn *before* it reads a message, so it never has to guess where the message ends?',
        'Put a small header in front of each string: its length, then a marker like `#`. The reader walks the string with one index, like a read pointer (module 3): read digits up to the marker, then jump exactly that many characters.',
        'encode: for each `s`, add `s.length + "#" + s`. decode: from `i`, find the first `#` at `j`; `len` = the number in `s[i..j-1]`; the message is the next `len` characters after `j`; then `i ← j + 1 + len`.',
      ],
      approaches: [
        {
          name: 'Join with a separator',
          idea: 'Join with `,` and split on `,`. It breaks as soon as a message contains a `,`. It also cannot tell `[]` from `[""]`: both encode to `""`.',
          time: 'O(total length)',
          space: 'O(total length)',
        },
        {
          name: 'Escape the separator',
          idea: 'Replace every `#` inside a message with `##` and end each message with `#,`. It works, but the decode rules are fiddly and easy to get wrong under time pressure.',
          time: 'O(total length)',
          space: 'O(total length)',
        },
        {
          name: 'Length prefix: "len#str"',
          idea: 'Write each message as its length, a `#`, then the message. The reader reads digits up to the first `#` (digits never contain `#`), then jumps over exactly `len` characters. It never looks inside a message, so any character there is safe.',
          pseudo: `function encode(strs):
    out ← ""
    for each s in strs:
        out ← out + length(s) + "#" + s
    return out

function decode(s):
    result ← empty list
    i ← 0
    while i < length(s):
        j ← i
        while s[j] ≠ "#":
            j ← j + 1
        len ← number made of s[i .. j - 1]
        append s[j + 1 .. j + len] to result
        i ← j + 1 + len
    return result`,
          code: encodeDecodeJs,
          time: 'O(total length)',
          space: 'O(total length)',
        },
      ],
      fn: 'roundTrip',
      starter: `function encode(strs) {
  // Turn the list into one string.
  return '';
}

function decode(s) {
  // Turn the string back into the list.
  return [];
}

function roundTrip(strs) {
  return decode(encode(strs));
}`,
      solution: encodeDecodeJs,
      tests: [
        { name: 'simple words', args: [['hello', 'world']], expected: ['hello', 'world'] },
        { name: 'empty list', args: [[]], expected: [] },
        { name: 'one empty string', args: [['']], expected: [''] },
        { name: 'several empty strings', args: [['', '', '']], expected: ['', '', ''] },
        { name: "contains '#'", args: [['a#b', '#', '##']], expected: ['a#b', '#', '##'] },
        { name: 'looks like a header', args: [['4#abc', '12#', '0#']], expected: ['4#abc', '12#', '0#'] },
        { name: "contains ','", args: [['a,b', ',', '']], expected: ['a,b', ',', ''] },
        { name: 'digits only', args: [['123', '0', '9#9', '10']], expected: ['123', '0', '9#9', '10'] },
        { name: 'spaces', args: [['  ', 'hi there', ' ']], expected: ['  ', 'hi there', ' '] },
        { name: 'long string (12 chars)', args: [['abcdefghijkl', 'x']], expected: ['abcdefghijkl', 'x'] },
      ],
      takeaway: '*any character may appear inside the data* → don\'t split on a character; prefix each piece with its length and jump.',
    },
    {
      id: 'pattern-mastery-randomized-set',
      title: 'Insert Delete GetRandom O(1)',
      difficulty: 'medium',
      leetcode: 380,
      pattern: 'Playbook drill',
      statement:
        'Build a raffle box. People drop in ticket numbers (`insert`), take them back out (`remove`), and at any moment you draw a winner (`getRandom`), where every ticket in the box must have the same chance. **All three must be O(1) on average.** `insert(x)` returns `true` if `x` was new, else `false`. `remove(x)` returns `true` if `x` was there, else `false`. `getRandom()` returns a value from the box. Write `runRandomizedSet(ops)`: `ops` is a list like `[["insert", 1], ["remove", 2], ["getRandom"]]`; return the list of outputs. To keep tests deterministic, **tests only call `getRandom` when the box holds exactly one value**, but your `getRandom` must still be O(1) and fair.',
      examples: [
        {
          input: 'ops = [["insert", 1], ["remove", 2], ["insert", 2], ["remove", 1], ["getRandom"]]',
          output: '[true, false, true, true, 2]',
          explain: '2 was never in the box, so removing it fails. After removing 1, only 2 is left, so `getRandom` must return 2.',
        },
      ],
      constraints: ['1 ≤ ops.length ≤ 200', '-2³¹ ≤ x ≤ 2³¹ - 1', 'getRandom is only called on a non-empty box'],
      hints: [
        'Which pattern fits? You need two things to be fast: *is x in the box?* and *pick any one at random*. Which structure is great at the first? Which is great at the second? Can you keep both in sync?',
        'A hash map (module 2) from value → index, plus an array for random picks (`vals[random index]` is O(1)). The only hard part is removing from the middle of the array in O(1).',
        'To remove `x`: look up its index `i`, copy the **last** value into slot `i`, update that moved value\'s index in the map, then pop the last slot and delete `x` from the map. Order does not matter in a set, so moving things around is fine.',
      ],
      approaches: [
        {
          name: 'Array only',
          idea: '`getRandom` is O(1): pick a random index. But checking "is x already here?" and removing need a scan, so insert and remove are O(n).',
          time: 'O(n) insert/remove, O(1) getRandom',
          space: 'O(n)',
        },
        {
          name: 'Set only',
          idea: 'Insert and remove are O(1). But a set has no "item number 5", so `getRandom` must copy it into an array first: O(n).',
          time: 'O(1) insert/remove, O(n) getRandom',
          space: 'O(n)',
        },
        {
          name: 'Array + map, remove by swapping with the last',
          idea: 'The array gives O(1) random picks. The map tells you where each value sits, so you find it in O(1). To remove from the middle without shifting, move the last value into the hole and pop the end. Popping the end is O(1).',
          pseudo: `vals ← empty list            // the values
pos ← empty map              // value → index in vals

function insert(x):
    if x in pos: return false
    pos[x] ← length(vals)
    append x to vals
    return true

function remove(x):
    if x not in pos: return false
    i ← pos[x]
    last ← vals[length(vals) - 1]
    vals[i] ← last           // fill the hole with the last value
    pos[last] ← i            // update before deleting x
    remove the last slot of vals
    delete x from pos
    return true

function getRandom():
    return vals[random index from 0 to length(vals) - 1]`,
          code: randomizedSetJs,
          time: 'O(1) average for each operation',
          space: 'O(n)',
        },
      ],
      fn: 'runRandomizedSet',
      starter: `function runRandomizedSet(ops) {
  // Run each op in order and collect the outputs.
  return [];
}`,
      solution: randomizedSetJs,
      tests: [
        {
          name: 'example',
          args: [[['insert', 1], ['remove', 2], ['insert', 2], ['remove', 1], ['getRandom']]],
          expected: [true, false, true, true, 2],
        },
        { name: 'one value', args: [[['insert', 5], ['getRandom']]], expected: [true, 5] },
        { name: 'remove from empty', args: [[['remove', 1]]], expected: [false] },
        {
          name: 'insert twice, remove twice',
          args: [[['insert', 7], ['insert', 7], ['remove', 7], ['remove', 7], ['insert', 7], ['getRandom']]],
          expected: [true, false, true, false, true, 7],
        },
        {
          name: 'remove the last value',
          args: [[['insert', 1], ['insert', 2], ['remove', 2], ['getRandom']]],
          expected: [true, true, true, 1],
        },
        {
          name: 'moved value must keep a correct index',
          args: [[['insert', 1], ['insert', 2], ['remove', 1], ['insert', 3], ['remove', 2], ['remove', 2], ['getRandom']]],
          expected: [true, true, true, true, true, false, 3],
        },
        {
          name: 'negatives and zero',
          args: [[['insert', -3], ['insert', 0], ['remove', -3], ['getRandom'], ['remove', 0], ['insert', 0], ['getRandom']]],
          expected: [true, true, true, 0, true, true, 0],
        },
        {
          name: 'empty, then refill',
          args: [[['insert', 4], ['insert', 8], ['remove', 4], ['remove', 8], ['remove', 8], ['insert', 8], ['insert', 9], ['remove', 8], ['getRandom']]],
          expected: [true, true, true, true, false, true, true, true, 9],
        },
      ],
      takeaway: '*O(1) lookup AND O(1) random pick* → array + map of value → index; delete by swapping with the last element.',
    },
  ],
  quiz: [
    {
      prompt: 'It is minute 20. You only have an O(n²) idea and no better one. What should you do?',
      options: [
        'Keep thinking quietly until the fast idea comes.',
        'Say the O(n²) plan out loud, code it, and improve it if time is left.',
        'Start coding a half-formed fast idea and hope it works.',
        'Tell the interviewer you cannot solve it.',
      ],
      answer: 1,
      explanation: 'Working code that you can test beats an unfinished fast idea. Saying the plan also lets the interviewer give a hint. Silence and half-formed code are the two most common ways to fail.',
    },
    {
      prompt: 'In Find the Duplicate, `nums` has values 1..4 and **5** values are ≤ 3. What do you know?',
      options: [
        'The duplicate is 3.',
        'The duplicate is in 4..4.',
        'The duplicate is in 1..3.',
        'Nothing, you must sort first.',
      ],
      answer: 2,
      explanation: 'Only the values 1, 2, 3 can be ≤ 3. Five values crammed into three slots means one of 1..3 repeats. It does not say *which* one yet, so you keep halving.',
    },
    {
      prompt: 'Which is real "testing" when you cannot run the code?',
      options: [
        'Reading the code again slowly.',
        'Saying "I think this works" and asking the interviewer.',
        'Picking a tiny input and writing down each variable as every line runs.',
        'Checking that every bracket is closed.',
      ],
      answer: 2,
      explanation: 'Re-reading shows you what you *meant* to write. Tracing real values shows what the code *does*. That is how you catch `hi = mid - 1` when it should be `hi = mid`.',
    },
    {
      prompt: 'In Find the Duplicate, which clarifying answer ruled out using a set?',
      options: [
        '"n is up to 10⁵."',
        '"Only O(1) extra space."',
        '"The values are 1 to n."',
        '"The duplicate may repeat many times."',
      ],
      answer: 1,
      explanation: 'A set stores up to n values, which is O(n) space. Without that rule, the set would be a perfectly good answer. Constraints change the solution, so always ask.',
    },
  ],
  takeaways: [
    'Time: clarify (5) → brute force + cost (7) → optimize and agree (6) → code (17) → test (7) → questions (3).',
    'Talk the whole time. Ask the checklist (size, empty, duplicates, negatives, sorted, modify, nothing found) before you pick an approach.',
    'Test by tracing a tiny input line by line, then walk the edge-case list. Re-reading is not testing.',
    'Constraints are clues: "can\'t modify, O(1) space, values 1..n" points straight at binary search on values or fast/slow pointers.',
  ],
};

export default lesson;
