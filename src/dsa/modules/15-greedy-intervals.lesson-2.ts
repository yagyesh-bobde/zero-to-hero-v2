import type { Lesson } from '../types';

const canJumpPseudo = `function canJump(nums):
    reach ← 0                         // farthest index we can get to
    for i from 0 to n - 1:
        if i > reach:
            return false              // a gap: stone i is out of reach
        reach ← max(reach, i + nums[i])
    return true`;

const canJumpCode = `function canJump(nums) {
  let reach = 0; // farthest index we can get to
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) return false;
    reach = Math.max(reach, i + nums[i]);
  }
  return true;
}`;

const jumpCode = `function jump(nums) {
  let jumps = 0;
  let end = 0; // last index of the current level
  let farthest = 0; // last index of the next level
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === end) {
      jumps++;
      end = farthest;
    }
  }
  return jumps;
}`;

const gasCode = `function canCompleteCircuit(gas, cost) {
  let total = 0; // gas minus cost over the whole loop
  let tank = 0; // battery since the current start
  let start = 0;
  for (let i = 0; i < gas.length; i++) {
    const gain = gas[i] - cost[i];
    total += gain;
    tank += gain;
    if (tank < 0) {
      start = i + 1;
      tank = 0;
    }
  }
  return total < 0 ? -1 : start;
}`;

const lesson: Lesson = {
  id: 'reach-and-jumps',
  title: 'Farthest reach: jump games',
  summary: 'Track one number, the farthest you can get, instead of trying every path.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Stepping stones',
      text: 'You are crossing a river on a line of stones. Each stone has a number painted on it: the farthest you can leap from there (shorter leaps are fine). Some stones say 0. Land on one with no other way forward and you are stuck. Platform games, a drone that can only fly so far before it must land, a bus route with limited range: same puzzle.',
    },
    {
      kind: 'text',
      text: '**The problem.** `nums = [3, 2, 1, 0, 4]`. You start on stone 0. From stone `i` you can jump to any stone from `i + 1` up to `i + nums[i]`. Can you reach the last stone? Here, no: every path lands on the 0 at index 3 and gets stuck. For `[2, 3, 1, 1, 4]` the answer is yes.',
    },
    {
      kind: 'text',
      text: '**Brute force first.** From each stone, try every jump length and recurse. If any path reaches the end, say yes.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every path',
      code: `function canReach(nums, i):
    if i ≥ n - 1:
        return true
    for step from 1 to nums[i]:
        if canReach(nums, i + step):
            return true
    return false`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** This is correct, but it can take exponential time (roughly doubling with every extra stone): the same stone is reached by many paths and explored again each time. Remembering "stone `i` is a dead end" brings it to O(n²). Still wasteful: you don\'t need a path at all. You only need to know **whether** the last stone is inside the area you can reach.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'One number: reach',
      text: 'Keep `reach` = the farthest index you can get to so far. If you can reach index 7, you can also reach 6, 5, 4 (just leap shorter). So the stones you can reach form one solid block from 0 to `reach`, with no holes. Walk left to right. If `i` is past `reach`, there is a gap you can never cross: answer no. Otherwise stretch `reach` to `i + nums[i]` if that is farther.',
    },
    {
      kind: 'steps',
      title: 'Reach scan on [3, 2, 1, 0, 4]',
      frames: [
        {
          cells: [3, 2, 1, 0, 4],
          pointers: { i: 0 },
          active: [0],
          vars: { reach: 3 },
          note: 'Stone 0 says 3. You can reach any stone up to 0 + 3 = 3.',
        },
        {
          cells: [3, 2, 1, 0, 4],
          pointers: { i: 1 },
          active: [1],
          done: [0],
          vars: { reach: 3 },
          note: 'Stone 1: 1 + 2 = 3. No farther than before. reach stays 3.',
        },
        {
          cells: [3, 2, 1, 0, 4],
          pointers: { i: 2 },
          active: [2],
          done: [0, 1],
          vars: { reach: 3 },
          note: 'Stone 2: 2 + 1 = 3. Still 3. Every road so far ends at stone 3.',
        },
        {
          cells: [3, 2, 1, 0, 4],
          pointers: { i: 3 },
          active: [3],
          done: [0, 1, 2],
          vars: { reach: 3 },
          note: 'Stone 3 says 0. 3 + 0 = 3. No help.',
        },
        {
          cells: [3, 2, 1, 0, 4],
          pointers: { i: 4 },
          active: [4],
          done: [0, 1, 2, 3],
          vars: { reach: 3 },
          note: '`i = 4` is past `reach = 3`. There is a gap you can\'t cross. Return `false`.',
        },
      ],
    },
    { kind: 'code', lang: 'pseudo', title: 'Jump Game: reach scan', code: canJumpPseudo },
    { kind: 'code', lang: 'js', title: 'Jump Game in JavaScript', code: canJumpCode },
    {
      kind: 'compare',
      title: 'Can you reach the end?',
      rows: [
        { approach: 'Try every path', time: 'exponential', space: 'O(n)', note: 'Re-explores the same stones again and again.' },
        { approach: 'Remember dead ends', time: 'O(n²)', space: 'O(n)', note: 'Each stone is solved once, but each tries all its jumps.' },
        { approach: 'Farthest reach (greedy)', time: 'O(n)', space: 'O(1)', note: 'One pass, one number.' },
      ],
    },
    {
      kind: 'text',
      text: '**Level up: the fewest jumps.** Now the end is always reachable, and you want the *fewest* jumps. `[2, 3, 1, 1, 4]` → 2 (stone 0 → 1 → 4). Think in levels, like ripples in a pond. Level 0 is stone 0. Level 1 is every stone one jump can reach. Level 2 is every new stone a second jump can reach. The answer is the level that holds the last stone.',
    },
    {
      kind: 'diagram',
      title: 'Levels on [2, 3, 1, 1, 4]',
      art: `index:    0    1    2    3    4
nums:     2    3    1    1    4

level 0: [0]
level 1:      [1    2]
level 2:                [3    4]   <- last stone`,
      caption: 'From stone 0, one jump reaches stones 1-2. From stone 1 or 2, a second jump reaches as far as 1 + 3 = 4. So 2 jumps.',
    },
    {
      kind: 'trace',
      title: 'Jump Game II on [2, 3, 1, 1, 4]',
      columns: ['i', 'nums[i]', 'farthest', 'i = end?', 'jumps', 'end'],
      rows: [
        [0, 2, 2, 'yes: jump', 1, 2],
        [1, 3, 4, 'no', 1, 2],
        [2, 1, 4, 'yes: jump', 2, 4],
        [3, 1, 4, 'no', 2, 4],
      ],
      note: 'Start with `jumps = 0`, `end = 0`, `farthest = 0`. While you scan the current level, `farthest` grows to the edge of the next level. When `i` hits `end`, the current level is used up: jump, and the next level ends at `farthest`. The loop stops before the last index. This is breadth-first search (BFS, module 13) with the queue squeezed into two numbers.',
    },
    { kind: 'code', lang: 'js', title: 'Jump Game II in JavaScript', code: jumpCode },
    { kind: 'text', text: '**The pattern: farthest reach.** Reach for it when you see:' },
    {
      kind: 'list',
      items: [
        'Each position lets you move *up to* some distance forward.',
        'You need "can I get there?" or "fewest moves to get there", not the actual path.',
        'A running total must never drop below zero: fuel, battery, money (Gas Station, below).',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: farthest reach (and levels)',
      code: `reach ← 0
for i from 0 to n - 1:
    if i > reach:
        stop: i cannot be reached
    reach ← max(reach, i + jump from i)

// fewest jumps: also keep end (edge of this level)
// and when i = end: jumps ← jumps + 1, end ← reach
// (loop only to n - 2)`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Don\'t jump from the last stone',
      text: 'In Jump Game II, loop `i` from 0 to `n - 2`, not `n - 1`. With `nums = [0]` you already stand on the last stone, so the answer is 0. If the loop also visits the last index, `i === end` fires there and counts a jump you never take.',
    },
  ],
  problems: [
    {
      id: 'greedy-intervals-jump-game',
      title: 'Jump Game',
      difficulty: 'medium',
      leetcode: 55,
      pattern: 'Farthest reach',
      statement:
        'You stand on stone 0 of a row of stones. From stone `i` you can leap forward to any stone from `i + 1` up to `i + nums[i]`. Return `true` if you can reach the last stone.',
      examples: [
        { input: 'nums = [2, 3, 1, 1, 4]', output: 'true', explain: 'Leap 0 → 1, then 1 → 4.' },
        { input: 'nums = [3, 2, 1, 0, 4]', output: 'false', explain: 'Every path ends on the 0 at index 3.' },
      ],
      constraints: ['1 ≤ nums.length ≤ 10⁴', '0 ≤ nums[i] ≤ 10⁵'],
      hints: [
        'You don\'t need the path. You only need to know which stones are reachable.',
        'If you can reach stone 7, can you also reach stone 5?',
        'So the reachable stones are one block from 0 to some `reach`. Keep `reach` as you walk. If `i > reach`, you are stuck.',
      ],
      approaches: [
        {
          name: 'Try every path',
          idea: 'Recurse from each stone with every leap length. Correct because it explores everything, but the same stones are explored many times.',
          time: 'exponential',
          space: 'O(n)',
        },
        {
          name: 'Remember dead ends',
          idea: 'Same recursion, but save the answer for each stone so it is solved only once. Each stone still tries all of its leaps.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Farthest reach (greedy)',
          idea: 'Every stone up to `reach` can be reached (leap shorter if needed), so the reachable stones have no holes. Walk left to right, stretching `reach`. If you ever stand past `reach`, there is a gap you can\'t cross.',
          pseudo: canJumpPseudo,
          code: canJumpCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'canJump',
      starter: `function canJump(nums) {
  // Return true if you can reach the last index.
  return false;
}`,
      solution: canJumpCode,
      tests: [
        { name: 'example yes', args: [[2, 3, 1, 1, 4]], expected: true },
        { name: 'stuck on a zero', args: [[3, 2, 1, 0, 4]], expected: false },
        { name: 'one stone', args: [[0]], expected: true },
        { name: 'zero at the start', args: [[0, 1]], expected: false },
        { name: 'gap in the middle', args: [[1, 0, 1]], expected: false },
        { name: 'zeros after a big leap', args: [[2, 0, 0]], expected: true },
        { name: 'all ones', args: [[1, 1, 1, 1]], expected: true },
        { name: 'one huge leap', args: [[5, 0, 0, 0, 0, 0]], expected: true },
        { name: 'stuck near the end', args: [[1, 2, 0, 0, 1]], expected: false },
      ],
      takeaway: 'If the reachable area has no holes, one number (its edge) replaces the whole search.',
    },
    {
      id: 'greedy-intervals-jump-game-ii',
      title: 'Jump Game II',
      difficulty: 'medium',
      leetcode: 45,
      pattern: 'Farthest reach (levels)',
      statement:
        'Same stones as Jump Game: from stone `i` you can leap to any stone from `i + 1` up to `i + nums[i]`. This time the last stone is always reachable. Return the **fewest** leaps needed to get from stone 0 to the last stone.',
      examples: [
        { input: 'nums = [2, 3, 1, 1, 4]', output: '2', explain: 'Leap 0 → 1, then 1 → 4.' },
        { input: 'nums = [2, 3, 0, 1, 4]', output: '2' },
      ],
      constraints: ['1 ≤ nums.length ≤ 10⁴', '0 ≤ nums[i] ≤ 1000', 'the last stone is reachable'],
      hints: [
        'Group stones by how many leaps they need: 0 leaps, 1 leap, 2 leaps...',
        'Each group is a block of stones next to each other. The next block ends at the farthest point any stone in this block can reach.',
        'Scan once. Keep `end` (edge of the current block) and `farthest` (edge of the next). When `i === end`, count a leap and set `end = farthest`.',
        'Loop only up to `n - 2`: you never leap from the last stone.',
      ],
      approaches: [
        {
          name: 'Fewest leaps table',
          idea: '`best[i]` = fewest leaps to reach stone `i`. For each stone, update every stone it can reach with `best[i] + 1`. Correct, but each stone touches up to n others.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Levels with two numbers (greedy BFS)',
          idea: 'Stones that need k leaps form one block. While scanning block k, the farthest any of them reaches is the edge of block k + 1. When you finish a block, you must leap once more. Count the blocks until the block holding the last stone.',
          pseudo: `function jump(nums):
    jumps ← 0
    end ← 0                       // edge of the current level
    farthest ← 0                  // edge of the next level
    for i from 0 to n - 2:        // never leap from the last stone
        farthest ← max(farthest, i + nums[i])
        if i = end:               // current level used up
            jumps ← jumps + 1
            end ← farthest
    return jumps`,
          code: jumpCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'jump',
      starter: `function jump(nums) {
  // Return the fewest jumps to reach the last index.
  return 0;
}`,
      solution: jumpCode,
      tests: [
        { name: 'example', args: [[2, 3, 1, 1, 4]], expected: 2 },
        { name: 'zero in the way', args: [[2, 3, 0, 1, 4]], expected: 2 },
        { name: 'already there', args: [[0]], expected: 0 },
        { name: 'two stones', args: [[1, 2]], expected: 1 },
        { name: 'all ones', args: [[1, 1, 1, 1]], expected: 3 },
        { name: 'one big leap', args: [[10, 1, 1]], expected: 1 },
        { name: 'level by level', args: [[1, 2, 1, 1, 1]], expected: 3 },
      ],
      takeaway: 'Fewest moves = count BFS levels. On a line, each level is a block, so two numbers track it.',
    },
    {
      id: 'greedy-intervals-gas-station',
      title: 'Scooter on a Ring Road',
      difficulty: 'medium',
      leetcode: 134,
      pattern: 'Running total with restarts',
      statement:
        'A delivery scooter rides a ring road with `n` charging stations. At station `i` it can charge `gas[i]` units. Riding from station `i` to the next station (the last one wraps to station 0) costs `cost[i]` units. The battery starts empty and has no size limit. Return the index of the station where you can start and ride the full loop once, or `-1` if no start works. When an answer exists, it is unique.',
      examples: [
        {
          input: 'gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]',
          output: '3',
          explain: 'Start at 3: +4 −1 → 3. Station 4: +5 −2 → 6. Station 0: +1 −3 → 4. Station 1: +2 −4 → 2. Station 2: +3 −5 → 0. Back at 3.',
        },
        { input: 'gas = [2, 3, 4], cost = [3, 4, 3]', output: '-1', explain: 'Total charge 9 is less than total cost 10.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '0 ≤ gas[i], cost[i] ≤ 10⁴'],
      hints: [
        'If the total charge is less than the total cost, no start works. If it is not less, some start does.',
        'Ride from a start `s`. Say the battery goes negative right after station `i`. Could any station between `s` and `i` be a good start?',
        'No. You reached each of them with a battery of 0 or more. Starting there means starting with 0, which is no better. So skip them all.',
        'One pass: keep `tank` and `start`. If `tank < 0`, set `start = i + 1` and `tank = 0`. Return `start` if the total is not negative, else -1.',
      ],
      approaches: [
        {
          name: 'Try every start',
          idea: 'From each station, simulate the whole loop and see if the battery ever goes negative. Correct, but every start costs a full lap.',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'One pass with restarts (greedy)',
          idea: 'If the ride from `start` fails at station `i`, every start between them fails too: each was reached with a non-negative battery, so starting fresh there is only worse. Jump the start to `i + 1`. If the total charge covers the total cost, the last start standing is the answer.',
          pseudo: `function canCompleteCircuit(gas, cost):
    total ← 0                     // charge minus cost over the whole loop
    tank ← 0                      // battery since the current start
    start ← 0
    for i from 0 to n - 1:
        gain ← gas[i] - cost[i]
        total ← total + gain
        tank ← tank + gain
        if tank < 0:              // can't reach station i + 1
            start ← i + 1
            tank ← 0
    if total < 0:
        return -1
    return start`,
          code: gasCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'canCompleteCircuit',
      starter: `function canCompleteCircuit(gas, cost) {
  // Return the start station index, or -1.
  return -1;
}`,
      solution: gasCode,
      tests: [
        { name: 'example', args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expected: 3 },
        { name: 'not enough charge', args: [[2, 3, 4], [3, 4, 3]], expected: -1 },
        { name: 'one station, enough', args: [[5], [4]], expected: 0 },
        { name: 'one station, too little', args: [[4], [5]], expected: -1 },
        { name: 'start at 0', args: [[3, 1, 1], [1, 2, 2]], expected: 0 },
        { name: 'restart twice', args: [[0, 0, 10], [1, 1, 1]], expected: 2 },
        { name: 'exactly enough', args: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expected: 4 },
      ],
      takeaway: 'When a run fails at `i`, every start inside that run fails too. Restart right after it.',
    },
  ],
  quiz: [
    {
      prompt: 'What does the reach scan do on `nums = [1, 0, 2]`?',
      options: ['Returns true at i = 2', 'Returns false at i = 2, because reach is 1', 'Returns false at i = 1', 'Loops forever'],
      answer: 1,
      explanation: 'i = 0: reach = 1. i = 1: 1 + 0 = 1, reach stays 1. i = 2 is past reach: false.',
    },
    {
      prompt: 'Why can the reach scan forget the path it took?',
      options: [
        'Because there is only ever one path',
        'Because every index up to `reach` is reachable, so only the edge matters',
        'Because the array is sorted',
        'Because every leap is length 1',
      ],
      answer: 1,
      explanation: 'You can always leap shorter, so the reachable stones form one block. Its right edge says everything.',
    },
    {
      prompt: 'In Jump Game II, what does `end` mean?',
      options: [
        'The last index of the array',
        'The farthest index you can reach with the jumps counted so far',
        'The index you last jumped from',
        'The biggest value in `nums`',
      ],
      answer: 1,
      explanation: '`end` is the edge of the current level. When `i` reaches it, you need one more jump to go further.',
    },
    {
      prompt: 'Gas Station: starting at station 1, the battery goes negative right after station 4. Where do you try next?',
      options: ['Station 2', 'Station 5', 'Station 0', 'Return -1 right away'],
      answer: 1,
      explanation: 'Stations 1 to 4 all fail: each was reached with a battery of 0 or more, so starting there with 0 is no better.',
    },
  ],
  takeaways: [
    'When the reachable area has no holes, one number (`reach`) replaces the whole search.',
    'Fewest jumps = BFS by levels. Track where this level ends and how far the next one goes.',
    'Greedy restart: if a run fails at `i`, no start inside the run can work, so restart at `i + 1`.',
  ],
};

export default lesson;
