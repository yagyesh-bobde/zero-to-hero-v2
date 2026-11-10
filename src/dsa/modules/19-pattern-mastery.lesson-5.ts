import type { Lesson } from '../types';

// Module 19, lesson 5. Owner: Content J.

const carFleetCode = `function carFleet(target, position, speed) {
  // [position, time to reach the target if the road were empty]
  const cars = position.map((p, i) => [p, (target - p) / speed[i]]);
  cars.sort((a, b) => b[0] - a[0]); // closest to the target first
  let fleets = 0;
  let lead = 0; // arrival time of the fleet just ahead
  for (const [, time] of cars) {
    if (time > lead) {
      fleets++; // too slow to catch the fleet ahead: a new fleet
      lead = time;
    }
    // else: it catches up and joins, so lead stays the same
  }
  return fleets;
}`;

const carFleetStackCode = `function carFleet(target, position, speed) {
  const cars = position.map((p, i) => [p, (target - p) / speed[i]]);
  cars.sort((a, b) => b[0] - a[0]);
  const stack = []; // arrival time of each fleet, front fleet at the bottom
  for (const [, time] of cars) {
    if (stack.length === 0 || time > stack[stack.length - 1]) stack.push(time);
  }
  return stack.length;
}`;

const carFleetPseudo = `function carFleet(target, position, speed):
    cars ← empty list
    for i from 0 to n - 1:
        time ← (target - position[i]) / speed[i]   // real division
        append (position[i], time) to cars
    sort cars by position, biggest first          // closest to target first
    fleets ← 0
    lead ← 0                 // arrival time of the fleet just ahead
    for each (pos, time) in cars:
        if time > lead:      // cannot catch the fleet ahead
            fleets ← fleets + 1
            lead ← time      // this car leads a new fleet
        // else: it catches up and joins, lead stays
    return fleets`;

const minDeletionsCode = `function minDeletions(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  const freqs = [...count.values()].sort((a, b) => b - a); // biggest first
  let deletions = 0;
  let allowed = Infinity; // the highest count the next letter may keep
  for (const f of freqs) {
    const keep = Math.min(f, allowed);
    deletions += f - keep;
    allowed = Math.max(keep - 1, 0); // 0 may repeat: those letters are gone
  }
  return deletions;
}`;

const minDeletionsSetCode = `function minDeletions(s) {
  const count = new Map();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  const used = new Set();
  let deletions = 0;
  for (let f of count.values()) {
    while (f > 0 && used.has(f)) {
      f--;
      deletions++;
    }
    if (f > 0) used.add(f);
  }
  return deletions;
}`;

const kthCode = `function kthSmallest(matrix, k) {
  const n = matrix.length;
  let lo = matrix[0][0];
  let hi = matrix[n - 1][n - 1];
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    // staircase: count values <= mid, start at the top-right corner
    let count = 0;
    let col = n - 1;
    for (let row = 0; row < n; row++) {
      while (col >= 0 && matrix[row][col] > mid) col--;
      count += col + 1;
    }
    if (count >= k) hi = mid; // mid might be the answer, keep it
    else lo = mid + 1;
  }
  return lo;
}`;

const kthHeapCode = `function kthSmallest(matrix, k) {
  const n = matrix.length;
  const heap = new Heap((a, b) => a[0] - b[0]); // [value, row, col]
  for (let r = 0; r < Math.min(n, k); r++) heap.push([matrix[r][0], r, 0]);
  let value = matrix[0][0];
  for (let i = 0; i < k; i++) {
    const [v, r, c] = heap.pop();
    value = v;
    if (c + 1 < n) heap.push([matrix[r][c + 1], r, c + 1]);
  }
  return value;
}`;

const twoCityCode = `function twoCitySchedCost(costs) {
  // most negative (toA - toB) first = biggest saving for going to A
  const sorted = [...costs].sort((x, y) => (x[0] - x[1]) - (y[0] - y[1]));
  const n = sorted.length / 2;
  let total = 0;
  for (let i = 0; i < sorted.length; i++) {
    total += i < n ? sorted[i][0] : sorted[i][1];
  }
  return total;
}`;

const lesson: Lesson = {
  id: 'mock-interviews-1',
  title: 'Mock interviews 1 & 2',
  summary: 'Run a 45-minute mock on yourself, score it honestly, then see what a strong answer looks like.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Pilots crash in the simulator, not the sky',
      text: "A new pilot lands a plane hundreds of times in a simulator before carrying one passenger. The engines fail there, the weather turns there, and mistakes are cheap there. Football teams do the same with a scrimmage before match day. A **mock interview** is your simulator: a real clock, a real problem, nobody watching, and every mistake free.",
    },
    {
      kind: 'text',
      text: "Lesson 4 (*The interview playbook: talk, test, time*) gave you the 45-minute timeline, the talk script, the clarify checklist and hand-testing. Here you use all of it under a real clock. Reading solutions feels like learning. Solving under a timer, out loud, is what actually gets tested.",
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        "**One 45-minute timer per mock, two problems.** That is about 22 minutes each: the lesson 4 stages at half length. When the timer rings, stop, even mid-line. Running out of time is useful data.",
        "**Talk out loud the whole time**, or record your screen and voice. Silence hides the gaps in your thinking.",
        "**No hints in the first 10 minutes of a problem.** Stuck? Restate the problem, try a smaller example, say the brute force aloud. After that, opening a hint is allowed, but note it.",
        "**Write your test list before you press Run.** Edge cases first: smallest input, ties, duplicates.",
        "**Score yourself right away** with the rubric below, before you look at any solution.",
      ],
    },
    {
      kind: 'table',
      title: 'Scoring rubric: give each row 1, 2 or 3',
      head: ['Signal', '1: weak', '2: okay', '3: strong'],
      rows: [
        [
          '**Problem solving**',
          'Jumped into code with no plan, or got stuck and stayed stuck.',
          'Found a working idea, but only after a hint or late in the clock.',
          'Said a brute force first, then found the better idea alone and said *why* it works.',
        ],
        [
          '**Code quality**',
          'Buggy or unfinished, names like `x2` and `tmp`.',
          'Works, but has messy parts or copy-pasted blocks.',
          'Clean, clear names, edge cases handled in one obvious place.',
        ],
        [
          '**Testing**',
          'Pressed Run and hoped.',
          'Checked only the example from the statement.',
          'Wrote own tests first (edge case, tie, tiny input) and traced one by hand.',
        ],
        [
          '**Communication**',
          'Long silences.',
          'Talked, but mostly read the code aloud.',
          'Said the plan, the trade-off and the Big-O before coding, and asked clarifying questions.',
        ],
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Stop here and try Mock 1 first',
      text: "**Mock 1** = the first two problems below (Car Fleet and Unique Letter Counts). **Mock 2** = problems 3 and 4. Start a 45-minute timer and do Mock 1 now. Only then read the debrief below. If you read it first, you lose the one honest run you get at these problems.",
    },
    {
      kind: 'table',
      title: 'Debrief: Car Fleet, minute by minute (a strong answer)',
      head: ['Minute', 'What you do', 'What you say'],
      rows: [
        ['0-3', 'Clarify & examples', '"Can two cars start at the same spot? If a car catches up exactly at the target, is that one fleet?" (No, yes.) Draw a road with 4 cars and solve it by hand.'],
        ['3-6', 'Brute force + cost', '"I could simulate time and merge cars when they touch." Say why it is messy. Do not code it.'],
        ['6-9', 'Optimize & agree', '"Only the car in front can slow me down. So sort by position and compare arrival times. O(n log n). Shall I code it?"'],
        ['9-18', 'Code', 'Pseudocode skeleton first, then JS, saying what each line does.'],
        ['18-22', 'Test', 'Trace the drawn example, then one car, a tie at the target, and a fractional time.'],
      ],
    },
    {
      kind: 'text',
      text: "**Brute force: simulate.** Move every car forward one tick at a time. When a fast car reaches the car ahead, glue them together at the slower speed. Count the groups at the end. It works, but it is messy. Cars meet at fractional times (like 1.33 hours), so whole ticks miss meetings, and tiny ticks are slow. You also need a pile of merge code. Saying this out loud is enough. It shows you know a baseline exists.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Stop simulating. Compare arrival times.',
      text: "Cars cannot pass, so a car can only be slowed by the car **in front** of it. Sort by position, **closest to the target first**. For each car, work out its arrival time if the road were empty: `(target - position) / speed`. If that time is **≤** the arrival time of the fleet just ahead, the car catches up and joins it. If it is bigger, it can never catch up, so it starts a new fleet. This is the monotonic stack idea (module 6) with a sort first, a classic greedy move (module 15).",
    },
    {
      kind: 'trace',
      title: 'target = 10, position = [1, 4, 6, 8], speed = [3, 2, 4, 1]',
      columns: ['car (pos, speed)', 'time alone', 'lead before', 'time > lead?', 'fleets', 'lead after'],
      rows: [
        ['(8, 1)', 2, 0, 'yes: new fleet', 1, 2],
        ['(6, 4)', 1, 2, 'no: joins', 1, 2],
        ['(4, 2)', 3, 2, 'yes: new fleet', 2, 3],
        ['(1, 3)', 3, 3, 'no (tie): joins', 2, 3],
      ],
      note: "The car at 6 would arrive at hour 1, but the car at 8 blocks it, so it rides along to hour 2. The last car ties at hour 3 and meets its fleet right at the target, which still counts as one fleet. Answer: **2**.",
    },
    { kind: 'code', lang: 'pseudo', title: 'Car Fleet: sort + sweep', code: carFleetPseudo },
    { kind: 'code', lang: 'js', title: 'Car Fleet in JavaScript', code: carFleetCode },
    {
      kind: 'compare',
      title: 'Car Fleet approaches',
      rows: [
        { approach: 'Simulate time ticks', time: 'O(n · ticks)', space: 'O(n)', note: 'Works, but fractional meeting times make it slow and fiddly.' },
        { approach: 'Sort + stack of fleet times', time: 'O(n log n)', space: 'O(n)', note: 'Push a time only when it is bigger than the top. Stack size = fleets.' },
        { approach: 'Sort + one `lead` variable', time: 'O(n log n)', space: 'O(n)', note: 'Same idea: you only ever look at the top, so one number is enough.' },
      ],
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three ways to lose this problem',
      text: "**Integer division.** In Java, C++ or Python's `//`, `(10 - 6) / 3` becomes `1`, not `1.33`, and two different cars look tied. In JS, `/` is fine, but never wrap it in `Math.floor`. **Wrong sort direction.** Start from the car farthest from the target and you compare each car with a car *behind* it, which cannot slow it down. **`<` vs `≤`.** A car that arrives at exactly the same time as the fleet ahead joins it. Only `time > lead` makes a new fleet.",
    },
    {
      kind: 'list',
      items: [
        "**Did you clarify the tie?** Asking \"is meeting exactly at the target one fleet?\" shows you hunt for edge cases.",
        "**Did you reframe?** Turning *cars moving* into *one arrival time per car* is the real skill being tested.",
        "**Did you say why you sort?** \"Only the car in front matters\" is the one sentence that proves you understand it.",
        "**Did you give Big-O without being asked**, and test a tie plus a fractional time before saying done?",
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'After every mock',
      text: "Write one line: the rubric row where you scored lowest and what you missed. Then redo that problem from a blank file in **3 days**. Now do Mock 2 (problems 3 and 4) under a fresh 45-minute timer.",
    },
  ],
  problems: [
    {
      id: 'pattern-mastery-car-fleet',
      title: 'Car Fleet',
      difficulty: 'medium',
      leetcode: 853,
      pattern: 'Mock 1',
      statement:
        "Cars are driving down a one-lane road toward a city gate at mile `target`. Car `i` starts at mile `position[i]` and drives at `speed[i]` miles per hour. No one can overtake. When a faster car reaches a slower car ahead, it slows down and they drive on together. A group of cars driving together is a **fleet** (one car alone is also a fleet). If a car reaches a fleet exactly at the gate, it still counts as part of that fleet. Return how many fleets arrive at the gate.",
      examples: [
        {
          input: 'target = 10, position = [1, 4, 6, 8], speed = [3, 2, 4, 1]',
          output: '2',
          explain: "The car at 6 catches the car at 8. The car at 1 catches the car at 4 exactly at the gate. Two fleets.",
        },
        { input: 'target = 10, position = [3], speed = [3]', output: '1', explain: 'One car is one fleet.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ position[i] < target ≤ 10⁶', 'all positions are different', '1 ≤ speed[i] ≤ 10⁶'],
      hints: [
        "Which pattern fits? Cars cannot pass, so only the car *in front* of you can slow you down. In what order should you look at the cars?",
        "Sort by position, closest to the gate first, and sweep (the monotonic stack idea from module 6, with a greedy sort from module 15).",
        "Give each car one number: how long it would take to reach the gate on an empty road.",
        "Keep the arrival time of the fleet just ahead. If a car's time is ≤ it, the car joins that fleet. If it is bigger, count a new fleet and update the time.",
      ],
      approaches: [
        {
          name: 'Simulate time',
          idea: "Move every car forward in small time steps and merge cars that touch. It is correct if the steps are small enough, but cars meet at fractional times, so it is slow and full of merge code.",
          time: 'O(n · steps)',
          space: 'O(n)',
        },
        {
          name: 'Sort + stack of fleet times',
          idea: "Sort by position, closest first. Each car's arrival time alone is `(target - position) / speed`. Push it only if it is bigger than the fleet on top of the stack, because a car that would arrive earlier gets stuck behind that fleet. The stack size is the answer.",
          code: carFleetStackCode,
          time: 'O(n log n)',
          space: 'O(n)',
        },
        {
          name: 'Sort + one lead time',
          idea: "You only ever look at the top of that stack, so keep one number: the arrival time of the fleet just ahead. A slower (bigger) time starts a new fleet; anything ≤ joins.",
          pseudo: carFleetPseudo,
          code: carFleetCode,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'carFleet',
      starter: `function carFleet(target, position, speed) {
  // return the number of fleets that reach the target
  return 0;
}`,
      solution: carFleetCode,
      tests: [
        { name: 'worked example', args: [10, [1, 4, 6, 8], [3, 2, 4, 1]], expected: 2 },
        { name: 'one car', args: [10, [3], [3]], expected: 1 },
        { name: 'mixed road', args: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], expected: 3 },
        { name: 'everyone gets stuck behind the leader', args: [100, [0, 2, 4], [4, 2, 1]], expected: 1 },
        { name: 'fractional time (integer division trap)', args: [10, [6, 8], [3, 2]], expected: 2 },
        { name: 'meet exactly at the target', args: [10, [4, 7], [2, 1]], expected: 1 },
        { name: 'same speed, nobody merges', args: [10, [8, 3, 7, 4, 6, 5], [4, 4, 4, 4, 4, 4]], expected: 6 },
        { name: 'unsorted input', args: [20, [6, 2, 17], [3, 9, 2]], expected: 2 },
        { name: 'many cars, two fleets', args: [13, [10, 2, 5, 7, 4, 6, 11], [7, 5, 10, 5, 9, 4, 1]], expected: 2 },
      ],
      takeaway: "*Only the one in front can slow you down* → sort by position, sweep from the front, and compare one number per item.",
    },
    {
      id: 'pattern-mastery-unique-frequencies',
      title: 'Unique Letter Counts',
      difficulty: 'medium',
      leetcode: 1647,
      pattern: 'Mock 1',
      statement:
        "A word game gives a podium to each letter in a string `s`, ranked by how many times it appears. Ties are not allowed: no two letters may appear the same number of times. You may delete letters (any copies you like). Return the **fewest deletions** needed so that every letter still in the string has a different count. A letter deleted completely no longer counts.",
      examples: [
        {
          input: 's = "bbcebab"',
          output: '2',
          explain: "Counts: b = 4, c = 1, e = 1, a = 1. Keep b at 4 and one letter at 1. Delete the other two single letters completely: 2 deletions.",
        },
        { input: 's = "aab"', output: '0', explain: 'a = 2, b = 1. Already all different.' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 's has only lowercase English letters'],
      hints: [
        "Which pattern fits? Only *how many times* each letter appears matters, not where. And you want the *fewest* deletions. What two steps does that suggest?",
        "Count letters with a map (module 2), then make a greedy choice (module 15) about how far to lower each count.",
        "Handle the counts from biggest to smallest. Each one may keep at most one less than the count kept before it.",
        "Keep `allowed`, starting at infinity. For each count `f`: keep `min(f, allowed)`, add the difference to the answer, then set `allowed` to `max(keep - 1, 0)`.",
      ],
      approaches: [
        {
          name: 'Try every way to delete',
          idea: "Try every possible new count for every letter and check if they are all different. Correct but exponential: far too slow even for 26 letters.",
          time: 'exponential',
          space: 'O(26)',
        },
        {
          name: 'Count + set of used counts',
          idea: "Go through the counts in any order. While a count is already used by another letter, lower it by one (one deletion each). Lowering to the nearest free spot costs the fewest deletions. Zero never collides because those letters are gone.",
          code: minDeletionsSetCode,
          time: 'O(n + 26²)',
          space: 'O(26)',
        },
        {
          name: 'Count + sort descending, cap each below the last',
          idea: "Sort counts biggest first. Each count keeps as much as it can, but at most one less than the count kept before it. Keeping as much as possible is safe: it never blocks a smaller count, because smaller counts sit below it anyway.",
          pseudo: `function minDeletions(s):
    count ← empty map                   // letter → how many times
    for each ch in s:
        count[ch] ← count[ch] + 1
    freqs ← values of count, sorted biggest first
    deletions ← 0
    allowed ← infinity                  // most the next letter may keep
    for each f in freqs:
        keep ← min(f, allowed)
        deletions ← deletions + (f - keep)
        allowed ← max(keep - 1, 0)      // 0 can repeat: letter is gone
    return deletions`,
          code: minDeletionsCode,
          time: 'O(n + 26 log 26) = O(n)',
          space: 'O(26)',
        },
      ],
      fn: 'minDeletions',
      starter: `function minDeletions(s) {
  // return the fewest deletions so no two letters share a count
  return 0;
}`,
      solution: minDeletionsCode,
      tests: [
        { name: 'worked example', args: ['bbcebab'], expected: 2 },
        { name: 'already unique', args: ['aab'], expected: 0 },
        { name: 'two-way tie', args: ['aaabbbcc'], expected: 2 },
        { name: 'shuffled letters', args: ['ceabaacb'], expected: 2 },
        { name: 'single letter', args: ['a'], expected: 0 },
        { name: 'one letter repeated', args: ['aaaa'], expected: 0 },
        { name: 'all different letters', args: ['abcdef'], expected: 5 },
        { name: 'three-way tie', args: ['abcabc'], expected: 3 },
        { name: 'four-way tie at 3', args: ['aaabbbcccddd'], expected: 6 },
      ],
      takeaway: "*Make the counts all different with the fewest changes* → count with a map, sort counts biggest first, cap each one below the last.",
    },
    {
      id: 'pattern-mastery-kth-smallest-matrix',
      title: 'K-th Smallest in a Sorted Grid',
      difficulty: 'medium',
      leetcode: 378,
      pattern: 'Mock 2',
      statement:
        "A cinema prints its ticket prices as an `n × n` grid. Every row goes up from left to right, and every column goes up from top to bottom. Given the grid `matrix` and a number `k`, return the **k-th smallest price** in the whole grid, counting repeats (so in `[[1, 2], [1, 3]]` the 2nd smallest is `1`). Try to do better than copying all `n²` values into one list.",
      examples: [
        {
          input: 'matrix = [[1, 3, 5], [6, 7, 12], [11, 14, 14]], k = 6',
          output: '11',
          explain: 'In order: 1, 3, 5, 6, 7, 11, 12, 14, 14. The 6th is 11.',
        },
        { input: 'matrix = [[1, 2], [1, 3]], k = 2', output: '1', explain: 'In order: 1, 1, 2, 3. Repeats count.' },
      ],
      constraints: ['1 ≤ n ≤ 300', '-10⁹ ≤ matrix[i][j] ≤ 10⁹', 'rows and columns are sorted ascending', '1 ≤ k ≤ n²'],
      hints: [
        "Which pattern fits? Every row is sorted, every column is sorted, and you want the *k-th smallest*. Which tools find a k-th item without sorting everything?",
        "Two good options: merge the sorted rows with a min-heap (module 12), or binary search on the answer value (module 5): guess a value and count how many are ≤ it.",
        "Counting values ≤ `mid` is fast: start at the top-right corner. If the value is too big, step left. Otherwise everything to its left in that row counts, so step down.",
        "Search `lo = matrix[0][0]`, `hi = matrix[n-1][n-1]`. If count(≤ mid) ≥ k, the answer is ≤ mid, so `hi = mid`. Otherwise `lo = mid + 1`. When they meet, that value is in the grid.",
      ],
      approaches: [
        {
          name: 'Flatten + sort',
          idea: "Copy all values into one list, sort it, and take index `k - 1`. Simple and correct, but it ignores that the grid is already sorted.",
          code: `function kthSmallest(matrix, k) {
  return matrix.flat().sort((a, b) => a - b)[k - 1];
}`,
          time: 'O(n² log n)',
          space: 'O(n²)',
        },
        {
          name: 'Min-heap k-way merge',
          idea: "Each row is a sorted list, so this is merging n sorted lists. Put each row's first value in a min-heap. Pop the smallest k times; after each pop, push the next value from that row. The k-th pop is the answer.",
          code: kthHeapCode,
          time: 'O(k log n)',
          space: 'O(n)',
        },
        {
          name: 'Binary search on the value + staircase count',
          idea: "The answer is the smallest value `v` with at least k grid values ≤ `v`. That yes/no question flips only once as `v` grows, so binary search on `v`. Count with a staircase walk from the top-right corner in O(n), because sorted columns mean the boundary only moves left.",
          pseudo: `function kthSmallest(matrix, k):
    lo ← matrix[0][0]
    hi ← matrix[n - 1][n - 1]
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        count ← 0
        col ← n - 1                     // start at the top-right
        for row from 0 to n - 1:
            while col ≥ 0 and matrix[row][col] > mid:
                col ← col - 1           // too big: step left
            count ← count + (col + 1)   // this row's values ≤ mid
        if count ≥ k:
            hi ← mid                    // mid could be the answer
        else:
            lo ← mid + 1
    return lo`,
          code: kthCode,
          time: 'O(n log(max − min))',
          space: 'O(1)',
        },
      ],
      fn: 'kthSmallest',
      starter: `function kthSmallest(matrix, k) {
  // return the k-th smallest value in the sorted grid
  return 0;
}`,
      solution: kthCode,
      tests: [
        { name: 'worked example', args: [[[1, 3, 5], [6, 7, 12], [11, 14, 14]], 6], expected: 11 },
        { name: 'classic 3×3', args: [[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8], expected: 13 },
        { name: 'single cell', args: [[[-5]], 1], expected: -5 },
        { name: 'repeats count', args: [[[1, 2], [1, 3]], 2], expected: 1 },
        { name: 'k = n² (largest)', args: [[[1, 2], [1, 3]], 4], expected: 3 },
        { name: 'negatives with repeats', args: [[[-5, -4], [-5, -4]], 2], expected: -5 },
        { name: 'all the same', args: [[[2, 2, 2], [2, 2, 2], [2, 2, 2]], 5], expected: 2 },
        { name: '4×4, k = 1', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 1], expected: 1 },
        { name: '4×4, middle', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 10], expected: 10 },
        { name: '4×4, last', args: [[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17]], 16], expected: 17 },
      ],
      takeaway: "*k-th smallest in sorted rows/columns* → min-heap k-way merge, or binary search on the value with a staircase count.",
    },
    {
      id: 'pattern-mastery-two-city',
      title: 'Two-City Offsite',
      difficulty: 'medium',
      leetcode: 1029,
      pattern: 'Mock 2',
      statement:
        "Your company is flying `2n` people to an offsite split across two cities, A and B. `costs[i] = [toA, toB]` is what it costs to fly person `i` to each city. **Exactly n** people must go to each city. Return the **smallest total cost**.",
      examples: [
        {
          input: 'costs = [[20, 60], [10, 50], [40, 200], [30, 300]]',
          output: '180',
          explain: "Send the last two people to A (30 + 40), the first two to B (60 + 50). Total 180.",
        },
        { input: 'costs = [[5, 7], [3, 9]]', output: '10', explain: 'Person 2 saves more by going to A (3 vs 9), so person 1 goes to B: 3 + 7 = 10.' },
      ],
      constraints: ['2 ≤ costs.length ≤ 100, and it is even', '1 ≤ toA, toB ≤ 1000'],
      hints: [
        "Which pattern fits? Every person goes to one of two places, and you want the cheapest total. Is there *one number per person* that says how much they prefer A?",
        "This is a greedy sort (module 15). The trick is choosing what to sort by.",
        "Imagine everyone is booked to B first. Moving person i to A changes the bill by `toA - toB`. A negative number is a refund.",
        "Sort by `toA - toB`, smallest first. Send the first half to A and the rest to B.",
      ],
      approaches: [
        {
          name: 'Try every split',
          idea: "Backtracking: try every way to choose which n people go to A. That is C(2n, n) splits, which explodes fast. A DP table `dp[i][j]` = best cost for the first i people with j sent to A also works in O(n²), but the greedy below is simpler.",
          time: 'O(C(2n, n))',
          space: 'O(n)',
        },
        {
          name: 'Greedy: sort by the refund',
          idea: "Book everyone to B. Switching person i to A changes the total by `toA - toB`. You must switch exactly n people, so pick the n biggest refunds (most negative differences). Sorting by `toA` alone fails because someone cheap for A may be even cheaper for B.",
          pseudo: `function twoCitySchedCost(costs):
    sort costs by (toA - toB), smallest first   // biggest refund first
    n ← length of costs / 2
    total ← 0
    for i from 0 to 2n - 1:
        if i < n:
            total ← total + costs[i].toA
        else:
            total ← total + costs[i].toB
    return total`,
          code: twoCityCode,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'twoCitySchedCost',
      starter: `function twoCitySchedCost(costs) {
  // return the smallest total with exactly half going to each city
  return 0;
}`,
      solution: twoCityCode,
      tests: [
        { name: 'worked example', args: [[[20, 60], [10, 50], [40, 200], [30, 300]]], expected: 180 },
        { name: 'two people', args: [[[5, 7], [3, 9]]], expected: 10 },
        { name: 'classic four', args: [[[10, 20], [30, 200], [400, 50], [30, 20]]], expected: 110 },
        { name: 'all equal', args: [[[10, 10], [10, 10]]], expected: 20 },
        { name: 'clear preferences', args: [[[1, 100], [100, 1], [50, 50], [60, 40]]], expected: 92 },
        { name: 'six people', args: [[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]], expected: 1859 },
        { name: 'eight people', args: [[[515, 563], [451, 713], [537, 709], [343, 819], [855, 779], [457, 60], [650, 359], [631, 42]]], expected: 3086 },
      ],
      takeaway: "*Split into two groups of fixed size, cheapest total* → sort by the difference between the two choices, take the first half.",
    },
  ],
  quiz: [
    {
      prompt: 'In Car Fleet, why do you process cars from the one closest to the target backward?',
      options: [
        'Because a car can only be slowed by the car in front, so the fleet ahead must be known first.',
        'Because sorting is what makes the solution O(n).',
        'Because the closest car is always the fastest.',
        'Because JavaScript sorts arrays from the end.',
      ],
      answer: 0,
      explanation: "Each car's fate depends only on the fleet directly ahead of it. Going front to back means that fleet is already decided. Sorting costs O(n log n), not O(n), and closeness says nothing about speed.",
    },
    {
      prompt: 'A car would reach the target alone in 3 hours. The fleet just ahead of it arrives in exactly 3 hours. What happens?',
      options: [
        'It starts a new fleet, because its time is not smaller.',
        'It joins that fleet: they meet right at the target.',
        'It overtakes the fleet.',
        'You cannot tell without the speeds.',
      ],
      answer: 1,
      explanation: "Equal times mean the car catches the fleet exactly at the target, which counts as one fleet. That is why only `time > lead` makes a new fleet, not `time ≥ lead`.",
    },
    {
      prompt: "You are 7 minutes into a self-mock problem and you are stuck. What is the best move?",
      options: [
        'Open a hint now, time is short.',
        'Skip to the second problem.',
        'Restate the problem, try a smaller example, and say the brute force out loud.',
        'Start typing code and hope the idea appears.',
      ],
      answer: 2,
      explanation: "No hints in the first 10 minutes of a problem. Restating, shrinking the example and naming a brute force are exactly what an interviewer wants to see, and they usually unlock the idea. Coding without a plan scores 1 in problem solving.",
    },
    {
      prompt: 'In Two-City Offsite, why sort by `toA - toB` instead of by `toA`?',
      options: [
        'Because `toA` might be negative.',
        'Because the difference is the saving from switching a person to A. Someone cheap for A may be even cheaper for B.',
        'Because sorting by `toA` is slower.',
        'It does not matter, both give the same answer.',
      ],
      answer: 1,
      explanation: "With costs `[[1, 2], [2, 100]]`, sorting by `toA` would send person 1 to A and pay 1 + 100 = 101 instead of 2 + 2 = 4. The difference is what you actually trade.",
    },
  ],
  takeaways: [
    'A self-mock is a 45-minute timer, two problems, talking out loud, tests before Run, and an honest score right after.',
    'Score four signals: problem solving, code quality, testing, communication. Redo your weakest problem from scratch in 3 days.',
    "*Only the one in front can slow you down* → sort by position, sweep from the front, compare one number per item.",
  ],
};

export default lesson;
