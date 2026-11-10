import type { Lesson } from '../types';
import { tests } from './12-heaps.tests';

export const lesson5: Lesson = {
  id: 'scheduling',
  title: 'Scheduling with a heap',
  summary: 'Sort events by time, keep what is available (or busy) in a heap, always act on the top.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How many gates does the airport need?',
      text: "Planes land and take off all day. Each plane holds a gate from arrival to departure. The airport wants the **fewest gates** that never leave a plane waiting. Your laptop's operating system solves the same kind of problem every millisecond: which program gets the CPU next?",
    },
    {
      kind: 'text',
      text: "**The problem:** meetings have `[start, end]` times. Find the fewest rooms so no two meetings overlap in the same room. A meeting ending at 10 frees its room for one starting at 10. Example: `[[0, 30], [5, 10], [15, 20], [25, 35]]` needs **2** rooms.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: count overlaps at every start',
      code: `function minMeetingRooms(meetings):
    best ← 0
    for each m in meetings:
        busy ← 0
        for each other in meetings:     // who is running when m starts?
            if other.start ≤ m.start and m.start < other.end:
                busy ← busy + 1
        best ← max(best, busy)
    return best`,
    },
    {
      kind: 'text',
      text: "This is correct (the busiest moment is always when some meeting starts), but it is O(n²). **The waste:** when a new meeting starts, we re-check every meeting. In real life you only ask one question: *is any room free yet?* And the room most likely to be free is the one that **ends earliest**.",
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Sort by time, heap of end times',
      text: "Handle meetings in order of **start** time. Keep a **min-heap of end times**, one per room in use. When a meeting starts, peek: if the earliest end is ≤ this start, that room is free, so pop it. Then push this meeting's end. The heap only grows when every room is busy, so its final size is the answer.",
    },
    {
      kind: 'trace',
      title: 'Meetings [0, 30], [5, 10], [15, 20], [25, 35]',
      columns: ['meeting', 'earliest end', 'free room?', 'heap of ends', 'rooms'],
      rows: [
        ['[0, 30]', '-', 'no rooms yet', '{30}', 1],
        ['[5, 10]', 30, 'no, 30 > 5', '{10, 30}', 2],
        ['[15, 20]', 10, 'yes, 10 ≤ 15: pop', '{20, 30}', 2],
        ['[25, 35]', 20, 'yes, 20 ≤ 25: pop', '{30, 35}', 2],
      ],
      note: 'Two rooms are enough: one hosts [0, 30], the other hosts [5, 10], [15, 20], [25, 35] back to back.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Meeting rooms',
      code: `function minMeetingRooms(meetings):
    sort meetings by start
    ends ← empty min-heap               // end time of each busy room
    for each [start, end] in meetings:
        if ends is not empty and ends.peek() ≤ start:
            ends.pop()                  // that room is free again
        ends.push(end)
    return ends.size()`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function minMeetingRooms(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const ends = new Heap((a, b) => a - b);
  for (const [start, end] of sorted) {
    if (!ends.isEmpty() && ends.peek() <= start) ends.pop();
    ends.push(end);
  }
  return ends.size();
}`,
    },
    {
      kind: 'compare',
      title: 'Minimum rooms for n meetings',
      rows: [
        { approach: 'Count overlaps at every start', time: 'O(n²)', space: 'O(1)', note: 'Easy to trust, too slow for 10⁵ meetings.' },
        { approach: 'Sort + min-heap of end times', time: 'O(n log n)', space: 'O(n)', note: 'The heap answers "which room frees first?" in O(log n).' },
        { approach: 'Sort starts and ends separately', time: 'O(n log n)', space: 'O(n)', note: 'Two pointers sweep, no heap. Same cost; the heap version also tells you which room to use.' },
      ],
    },
    {
      kind: 'table',
      title: 'The scheduling family: same skeleton, different heap',
      head: ['Problem', 'Process in order of', 'Heap holds', 'Top of heap'],
      rows: [
        ['Meeting rooms', 'start time', 'end times of busy rooms', 'room that frees first'],
        ['Single-threaded CPU', 'arrival time', 'tasks that have arrived', 'shortest task, then lowest index'],
        ['IPO (pick projects)', 'money needed', 'profits you can afford now', 'biggest profit'],
        ['Task scheduler', 'time ticks', 'tasks ready to run (by count left)', 'the task with most left'],
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Scheduling template',
      code: `sort items by the time (or cost) they become available
heap ← empty                           // ordered by "who should go next"
next ← 0
while there is work left:
    while next < n and items[next] is available now:
        heap.push(items[next])
        next ← next + 1
    if heap is empty:
        jump time forward to items[next]   // nothing to do: skip idle time
    else:
        best ← heap.pop()
        do best, and update time / money`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Traps',
      text: "**1.** Idle time: if nothing is available, **jump** the clock to the next arrival. Ticking one unit at a time can take forever when times reach 10⁹. **2.** Touching intervals: a meeting ending at 5 frees the room for one starting at 5, so compare with `≤`, not `<`. **3.** Tie-breaks belong in the comparator: `(a, b) => a.time - b.time || a.index - b.index`.",
    },
  ],
  problems: [
    {
      id: 'heaps-meeting-rooms',
      title: 'Fewest meeting rooms',
      difficulty: 'medium',
      leetcode: 253,
      pattern: 'Sort + min-heap of end times',
      statement:
        "Your office books meetings as `[start, end]` (end is not included, so a meeting ending at 10 and one starting at 10 can share a room). Return the fewest rooms needed so every meeting gets a room. The list is not sorted. An empty list needs 0 rooms.",
      examples: [
        { input: 'intervals = [[0, 30], [5, 10], [15, 20]]', output: '2', explain: '[0, 30] needs its own room. [5, 10] and [15, 20] can share the second room.' },
        { input: 'intervals = [[7, 10], [2, 4]]', output: '1' },
      ],
      constraints: ['0 ≤ intervals.length ≤ 10⁴', '0 ≤ start < end ≤ 10⁶'],
      hints: [
        'Handle meetings in order of start time.',
        'When a meeting starts, the only room worth checking is the one that ends earliest.',
        'Min-heap of end times. If `peek() ≤ start`, pop (reuse that room). Always push the new end. Return the heap size.',
      ],
      approaches: [
        {
          name: 'Count overlaps at every start',
          idea: 'The busiest moment is always the start of some meeting. For each start, count meetings running at that time. Correct, but O(n²).',
          time: 'O(n²)',
          space: 'O(1)',
        },
        {
          name: 'Sort + min-heap of end times',
          idea: 'Each heap item is a busy room, keyed by when it frees up. A new meeting reuses the room that frees first if it is free by then; otherwise it needs a new room. The heap never shrinks below the most rooms ever in use.',
          pseudo: `function minMeetingRooms(intervals):
    sort intervals by start
    ends ← empty min-heap
    for each [start, end] in intervals:
        if ends is not empty and ends.peek() ≤ start:
            ends.pop()
        ends.push(end)
    return ends.size()`,
          code: `function minMeetingRooms(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const ends = new Heap((a, b) => a - b);
  for (const [start, end] of sorted) {
    if (!ends.isEmpty() && ends.peek() <= start) ends.pop();
    ends.push(end);
  }
  return ends.size();
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'minMeetingRooms',
      starter: `function minMeetingRooms(intervals) {
  // Sort by start; track when each busy room frees up.
  return 0;
}`,
      solution: `function minMeetingRooms(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const ends = new Heap((a, b) => a - b);
  for (const [start, end] of sorted) {
    if (!ends.isEmpty() && ends.peek() <= start) ends.pop();
    ends.push(end);
  }
  return ends.size();
}`,
      tests: tests.minMeetingRooms,
      takeaway: 'Rooms, gates, servers: sort by start, keep a min-heap of when each one frees up.',
    },
    {
      id: 'heaps-task-scheduler',
      title: 'Spell cooldowns',
      difficulty: 'medium',
      leetcode: 621,
      pattern: 'Max-heap + cooldown queue',
      statement:
        "A game character must cast a list of spells, `tasks`, given as letters like `'A'`. Order does not matter. Each time unit you either cast one spell or wait. After casting a spell, the **same** spell has a cooldown: at least `n` time units must pass before casting it again. Return the fewest time units needed to cast them all.",
      examples: [
        {
          input: "tasks = ['A', 'A', 'A', 'B', 'B', 'B'], n = 2",
          output: '8',
          explain: 'A B wait A B wait A B. Each A is 3 units after the last one.',
        },
        { input: "tasks = ['A', 'C', 'A', 'B', 'D', 'B'], n = 1", output: '6', explain: 'A B A B C D never has to wait.' },
      ],
      constraints: ['1 ≤ tasks.length ≤ 10⁴', 'tasks are uppercase letters', '0 ≤ n ≤ 100'],
      hints: [
        'The spell with the most copies left is the one most likely to force waiting. Cast it as early as you can.',
        'Keep the ready spells in a max-heap by copies left. A spell that was just cast goes into a waiting line until its cooldown ends.',
        'Each time unit: tick the clock, pop the biggest ready count (if any) and put `count - 1` in the queue with ready time `time + n`. Move it back into the heap when its time comes.',
      ],
      approaches: [
        {
          name: 'Max-heap + cooldown queue',
          idea: 'Simulate the clock. Each unit, cast the ready spell with the most copies left, because leaving big piles for the end forces long waits. Cooling spells wait in a plain queue, which is already sorted by ready time.',
          pseudo: `function leastInterval(tasks, n):
    ready ← max-heap of how many copies each spell has
    cooling ← empty queue of [copiesLeft, readyAt]
    time ← 0
    while ready is not empty or cooling is not empty:
        time ← time + 1
        if ready is not empty:
            left ← ready.pop() - 1
            if left > 0:
                cooling.pushBack([left, time + n])
        if cooling is not empty and cooling.front().readyAt = time:
            ready.push(cooling.popFront().copiesLeft)
    return time`,
          code: `function leastInterval(tasks, n) {
  const count = new Map();
  for (const t of tasks) count.set(t, (count.get(t) || 0) + 1);
  const ready = new Heap((a, b) => b - a);
  for (const c of count.values()) ready.push(c);
  const cooling = []; // [copiesLeft, readyAt]
  let time = 0;
  while (!ready.isEmpty() || cooling.length > 0) {
    time++;
    if (!ready.isEmpty()) {
      const left = ready.pop() - 1;
      if (left > 0) cooling.push([left, time + n]);
    }
    if (cooling.length > 0 && cooling[0][1] === time) ready.push(cooling.shift()[0]);
  }
  return time;
}`,
          time: 'O(T log 26), T = answer',
          space: 'O(26)',
        },
        {
          name: 'Count the frame (math)',
          idea: 'Let `maxCount` be the most copies of one spell, and `tied` how many spells have that many. The busiest spell builds `maxCount - 1` blocks of length `n + 1`, plus one final block holding the `tied` spells. Other spells fill the gaps. If there are more spells than gaps, no waiting is needed and the answer is just the number of tasks.',
          pseudo: `function leastInterval(tasks, n):
    count ← copies of each spell
    maxCount ← biggest value in count
    tied ← how many spells have maxCount copies
    return max(length of tasks, (maxCount - 1) * (n + 1) + tied)`,
          code: `function leastInterval(tasks, n) {
  const count = new Map();
  for (const t of tasks) count.set(t, (count.get(t) || 0) + 1);
  const values = [...count.values()];
  const maxCount = Math.max(...values);
  const tied = values.filter((c) => c === maxCount).length;
  return Math.max(tasks.length, (maxCount - 1) * (n + 1) + tied);
}`,
          time: 'O(T)',
          space: 'O(26)',
        },
      ],
      fn: 'leastInterval',
      starter: `function leastInterval(tasks, n) {
  // Cast the spell with the most copies left whenever you can.
  return 0;
}`,
      solution: `function leastInterval(tasks, n) {
  const count = new Map();
  for (const t of tasks) count.set(t, (count.get(t) || 0) + 1);
  const ready = new Heap((a, b) => b - a);
  for (const c of count.values()) ready.push(c);
  const cooling = [];
  let time = 0;
  while (!ready.isEmpty() || cooling.length > 0) {
    time++;
    if (!ready.isEmpty()) {
      const left = ready.pop() - 1;
      if (left > 0) cooling.push([left, time + n]);
    }
    if (cooling.length > 0 && cooling[0][1] === time) ready.push(cooling.shift()[0]);
  }
  return time;
}`,
      tests: tests.leastInterval,
      takeaway: 'Ready things in a heap, cooling things in a queue. Always run the one with the most work left.',
    },
    {
      id: 'heaps-single-threaded-cpu',
      title: 'One CPU, many jobs',
      difficulty: 'medium',
      leetcode: 1834,
      pattern: 'Sort by arrival + min-heap of ready tasks',
      statement:
        "A CPU gets jobs `tasks[i] = [arriveTime, runTime]`, numbered by their index i. It runs one job at a time and never stops a job halfway. Whenever it is free, it looks at the jobs that have already arrived and picks the one with the **shortest runTime** (ties: smallest index). If no job has arrived yet, it waits for the next one. Return the order of job indexes it runs.",
      examples: [
        {
          input: 'tasks = [[1, 2], [2, 4], [3, 2], [4, 1]]',
          output: '[0, 2, 3, 1]',
          explain: 'Time 1: only job 0 is here, run it until 3. Jobs 1 and 2 are waiting; job 2 is shorter, run it until 5. Now 1 and 3 wait; job 3 (runTime 1) goes, then job 1.',
        },
        { input: 'tasks = [[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]', output: '[4, 3, 2, 0, 1]', explain: 'All arrive together, so shortest first.' },
      ],
      constraints: ['1 ≤ tasks.length ≤ 10⁵', '1 ≤ arriveTime, runTime ≤ 10⁹'],
      hints: [
        'Two questions keep coming up: which jobs have arrived by now? And which of those is shortest?',
        'Sort the jobs by arrival time (keep their original index). A pointer walks through them as the clock moves.',
        'Min-heap of arrived jobs by `[runTime, index]`. If the heap is empty, jump the clock to the next arrival. Pop, add its runTime to the clock, record the index.',
      ],
      approaches: [
        {
          name: 'Scan all jobs each time',
          idea: 'Every time the CPU is free, scan every unfinished job to find arrived ones and pick the shortest. Correct, but O(n) per pick.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Sort + min-heap',
          idea: 'Sorting by arrival lets a pointer add jobs to the heap exactly when they arrive. The heap keeps arrived jobs ordered by runTime, then index, so the next job is always on top.',
          pseudo: `function getOrder(tasks):
    jobs ← [arrive, run, index] for each task, sorted by arrive
    ready ← empty min-heap by (run, then index)
    time ← 0
    next ← 0
    order ← empty list
    while size of order < n:
        if ready is empty and time < jobs[next].arrive:
            time ← jobs[next].arrive        // CPU idle: jump ahead
        while next < n and jobs[next].arrive ≤ time:
            ready.push(jobs[next])
            next ← next + 1
        job ← ready.pop()
        time ← time + job.run
        append job.index to order
    return order`,
          code: `function getOrder(tasks) {
  const jobs = tasks.map(([arrive, run], i) => [arrive, run, i]).sort((a, b) => a[0] - b[0]);
  const ready = new Heap((a, b) => a[1] - b[1] || a[2] - b[2]);
  const order = [];
  let time = 0;
  let next = 0;
  while (order.length < tasks.length) {
    if (ready.isEmpty() && time < jobs[next][0]) time = jobs[next][0];
    while (next < jobs.length && jobs[next][0] <= time) ready.push(jobs[next++]);
    const [, run, i] = ready.pop();
    time += run;
    order.push(i);
  }
  return order;
}`,
          time: 'O(n log n)',
          space: 'O(n)',
        },
      ],
      fn: 'getOrder',
      starter: `function getOrder(tasks) {
  // Return the indexes in the order the CPU runs them.
  return [];
}`,
      solution: `function getOrder(tasks) {
  const jobs = tasks.map(([arrive, run], i) => [arrive, run, i]).sort((a, b) => a[0] - b[0]);
  const ready = new Heap((a, b) => a[1] - b[1] || a[2] - b[2]);
  const order = [];
  let time = 0;
  let next = 0;
  while (order.length < tasks.length) {
    if (ready.isEmpty() && time < jobs[next][0]) time = jobs[next][0];
    while (next < jobs.length && jobs[next][0] <= time) ready.push(jobs[next++]);
    const [, run, i] = ready.pop();
    time += run;
    order.push(i);
  }
  return order;
}`,
      tests: tests.getOrder,
      takeaway: 'Sort by arrival, push into a heap as the clock passes, jump the clock when the heap is empty.',
    },
    {
      id: 'heaps-ipo',
      title: 'Startup projects (stretch)',
      difficulty: 'hard',
      leetcode: 502,
      pattern: 'Sort by cost + max-heap of affordable choices',
      statement:
        "**Stretch problem.** Your startup has `w` dollars. Project i needs you to *have* at least `capital[i]` dollars to start (you don't spend it) and adds `profits[i]` dollars when done. You can finish at most `k` projects, one after another, and each project only once. Return the most money you can end up with.",
      examples: [
        {
          input: 'k = 2, w = 0, profits = [1, 2, 3], capital = [0, 1, 1]',
          output: '4',
          explain: 'With 0 you can only do project 0 → 1 dollar. Now projects 1 and 2 are open; take project 2 (profit 3) → 4.',
        },
        { input: 'k = 3, w = 0, profits = [1, 2, 3], capital = [0, 1, 2]', output: '6' },
      ],
      constraints: ['1 ≤ k ≤ 10⁵', '0 ≤ w ≤ 10⁹', '1 ≤ profits.length ≤ 10⁵'],
      hints: [
        'Money only goes up. So once a project is affordable, it stays affordable.',
        'Among the projects you can afford right now, which one should you do first? The most profitable: more money opens more projects.',
        'Sort projects by capital. Each round, push every newly affordable profit into a max-heap, then pop the top and add it to w. If the heap is empty, stop early.',
      ],
      approaches: [
        {
          name: 'Scan for the best affordable project each round',
          idea: 'Each round, look at every unused project you can afford and take the biggest profit. Taking the biggest is safe because it can only unlock more. Correct, but O(n) per round.',
          time: 'O(k · n)',
          space: 'O(n)',
        },
        {
          name: 'Sort by capital + max-heap of profits',
          idea: 'Because money never drops, a pointer over projects sorted by capital only moves forward. Every project it passes goes into a max-heap of profits, and each round takes the top.',
          pseudo: `function findMaximizedCapital(k, w, profits, capital):
    projects ← [capital[i], profits[i]] for each i, sorted by capital
    affordable ← empty max-heap of profits
    next ← 0
    for round from 1 to k:
        while next < n and projects[next].capital ≤ w:
            affordable.push(projects[next].profit)
            next ← next + 1
        if affordable is empty:
            break                       // nothing left we can start
        w ← w + affordable.pop()
    return w`,
          code: `function findMaximizedCapital(k, w, profits, capital) {
  const projects = profits.map((p, i) => [capital[i], p]).sort((a, b) => a[0] - b[0]);
  const affordable = new Heap((a, b) => b - a);
  let next = 0;
  for (let round = 0; round < k; round++) {
    while (next < projects.length && projects[next][0] <= w) affordable.push(projects[next++][1]);
    if (affordable.isEmpty()) break;
    w += affordable.pop();
  }
  return w;
}`,
          time: 'O((n + k) log n)',
          space: 'O(n)',
        },
      ],
      fn: 'findMaximizedCapital',
      starter: `function findMaximizedCapital(k, w, profits, capital) {
  // Unlock projects as money grows; always take the best one you can afford.
  return w;
}`,
      solution: `function findMaximizedCapital(k, w, profits, capital) {
  const projects = profits.map((p, i) => [capital[i], p]).sort((a, b) => a[0] - b[0]);
  const affordable = new Heap((a, b) => b - a);
  let next = 0;
  for (let round = 0; round < k; round++) {
    while (next < projects.length && projects[next][0] <= w) affordable.push(projects[next++][1]);
    if (affordable.isEmpty()) break;
    w += affordable.pop();
  }
  return w;
}`,
      tests: tests.findMaximizedCapital,
      takeaway: 'When options only unlock over time, sort by the unlock condition and keep unlocked options in a heap.',
    },
  ],
  quiz: [
    {
      prompt: 'Meetings [1, 5] and [5, 8]. How many rooms?',
      options: ['1', '2', '0', 'It depends on the order'],
      answer: 0,
      explanation: 'The first meeting ends at 5 and the second starts at 5, so the room is free in time. That is why the check is `peek() ≤ start`.',
    },
    {
      prompt: 'In the meeting-rooms heap, what does each item stand for?',
      options: ['A meeting start time', 'A busy room, keyed by when it frees up', 'The number of rooms', 'A meeting length'],
      answer: 1,
      explanation: 'One item per room in use. The top is the room that frees first, the only one worth checking.',
    },
    {
      prompt: 'In Single-threaded CPU, the heap is empty but jobs remain. What do you do?',
      options: ['Return the order so far', 'Add 1 to the clock and check again', 'Jump the clock to the next arrival time', 'Pop anyway'],
      answer: 2,
      explanation: 'Nothing can run until the next job arrives, so jump straight there. Ticking by 1 could take a billion steps.',
    },
    {
      prompt: 'Why is it safe in IPO to always take the most profitable affordable project?',
      options: [
        'Profits are sorted',
        'More money never hurts: it keeps every option open and can unlock new ones',
        'Because k is small',
        'It is not safe',
      ],
      answer: 1,
      explanation: 'Capital is a requirement, not a cost. Taking the biggest profit first gives the most money for every later round.',
    },
  ],
  takeaways: [
    'Scheduling problems: sort by time (or unlock cost), feed items into a heap as they become available, act on the top.',
    'Meeting rooms: min-heap of end times. Reuse when `peek() ≤ start`; the final size is the answer.',
    'If nothing is available, jump the clock forward instead of ticking.',
    'Put every tie-break into the comparator, e.g. `a[1] - b[1] || a[2] - b[2]`.',
  ],
};
