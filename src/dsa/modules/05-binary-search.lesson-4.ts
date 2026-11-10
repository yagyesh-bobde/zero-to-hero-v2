import type { Lesson } from '../types';

// Module 5, lesson 4: binary search on the answer.
const lesson: Lesson = {
  id: 'search-the-answer',
  title: 'Binary search on the answer',
  summary: 'When checking a guess is easy but finding the answer is hard, binary search over the possible answers.',
  minutes: 25,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How small a truck?',
      text: "A delivery company must move today's packages within 5 days. Bigger trucks cost more, so they want the **smallest** capacity that still works. There is no formula for that number. But if you *guess* a capacity, checking it is easy: load the packages in order and count the days. And there is a shape: if capacity 20 works, 21 works too. That shape is all binary search needs. Cloud teams pick server counts this way, and video apps pick the lowest quality that doesn't buffer.",
    },
    {
      kind: 'text',
      text: "**The problem.** A panda has bamboo piles `[3, 6, 7, 11]`, and the keeper is back in `h = 8` hours. The panda picks a speed `k` (shoots per hour). Each hour it eats up to `k` shoots from one pile. If that pile has fewer, it finishes the pile and rests until the hour ends. What is the slowest speed `k` that clears every pile within 8 hours?",
    },
    {
      kind: 'text',
      text: "**Checking one guess is easy.** A pile of `p` shoots takes `ceil(p / k)` hours. **ceil** means round up: 7 shoots at speed 3 take 3 hours (3 + 3 + 1), not 2.33. Add this up over all piles and compare it with `h`.",
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every speed',
      code: `function minSpeedSlow(piles, h):
    for k from 1 to max(piles):     // max(piles) always works
        if hoursNeeded(piles, k) ≤ h:
            return k

function hoursNeeded(piles, k):
    total ← 0
    for each p in piles:
        total ← total + ceil(p / k)
    return total`,
    },
    {
      kind: 'text',
      text: "Correct. But if the biggest pile has 1,000,000,000 shoots, that is up to a billion speeds, each checked in O(n). **Spot the waste:** write the answers down for every speed.",
    },
    {
      kind: 'trace',
      title: 'Is speed k fast enough for h = 8?',
      columns: ['k', 'hours needed', '≤ 8 ?'],
      rows: [
        [1, '3 + 6 + 7 + 11 = 27', 'no'],
        [2, '2 + 3 + 4 + 6 = 15', 'no'],
        [3, '1 + 2 + 3 + 4 = 10', 'no'],
        [4, '1 + 2 + 2 + 3 = 8', 'yes'],
        [5, '1 + 2 + 2 + 3 = 8', 'yes'],
        [6, '1 + 1 + 2 + 2 = 6', 'yes'],
        ['…', '…', 'yes'],
        [11, '1 + 1 + 1 + 1 = 4', 'yes'],
      ],
      note: 'No, no, no, then yes forever. A faster panda never needs *more* hours. We want the first yes: the same shape as the lower bound.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Binary search the answer, not the array',
      text: "The thing we search is not `piles`. It is the list of all possible answers: `1, 2, 3, …, max(piles)`. You never build that list; `lo` and `hi` are just numbers. Run first true with the question *does speed `mid` finish in time?* Each check costs O(n), and you need only about log₂(max) checks.",
    },
    {
      kind: 'steps',
      title: 'Searching speeds 1 to 11',
      frames: [
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 0, hi: 10 },
          note: 'These cells are **speeds**, not piles. `lo = 1` (slowest possible), `hi = 11` (the biggest pile, always fast enough).',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 0, mid: 5, hi: 10 },
          active: [5],
          vars: { speed: 6, hours: 6, 'fits 8?': 'yes' },
          note: 'Try speed 6: 6 hours. It fits, so the answer is 6 or slower: `hi = 6`.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 0, mid: 2, hi: 5 },
          active: [2],
          done: [6, 7, 8, 9, 10],
          vars: { speed: 3, hours: 10, 'fits 8?': 'no' },
          note: 'Try speed 3: 10 hours. Too slow, and so is anything slower: `lo = 4`.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 3, mid: 4, hi: 5 },
          active: [4],
          done: [0, 1, 2, 6, 7, 8, 9, 10],
          vars: { speed: 5, hours: 8, 'fits 8?': 'yes' },
          note: 'Try speed 5: 8 hours. Fits: `hi = 5`.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 3, mid: 3, hi: 4 },
          active: [3],
          done: [0, 1, 2, 5, 6, 7, 8, 9, 10],
          vars: { speed: 4, hours: 8, 'fits 8?': 'yes' },
          note: 'Try speed 4: 8 hours. Fits: `hi = 4`.',
        },
        {
          cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          pointers: { lo: 3, hi: 3 },
          found: [3],
          done: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10],
          vars: { answer: 4 },
          note: '`lo = hi`: speed **4** is the slowest that works. 4 checks instead of up to 11.',
        },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Binary search on the eating speed',
      code: `function minEatingSpeed(piles, h):
    lo ← 1
    hi ← max(piles)
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if hoursNeeded(piles, mid) ≤ h:
            hi ← mid            // mid works; maybe slower works too
        else:
            lo ← mid + 1        // mid is too slow, so is everything below
    return lo`,
    },
    {
      kind: 'code',
      lang: 'js',
      title: 'JavaScript',
      code: `function minEatingSpeed(piles, h) {
  const hoursAt = (k) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hoursAt(mid) <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

minEatingSpeed([3, 6, 7, 11], 8); // 4`,
    },
    {
      kind: 'table',
      title: 'Picking lo and hi',
      head: ['Problem', 'Check for a guess', 'lo', 'hi'],
      rows: [
        ['Eating speed', 'hours at speed k ≤ h', '1', 'max(piles)'],
        ['Ship capacity', 'days at capacity c ≤ D', 'max(weights)', 'sum(weights)'],
        ['Bouquets', 'bouquets ready by day d ≥ m', 'min(bloomDay)', 'max(bloomDay)'],
      ],
    },
    {
      kind: 'compare',
      title: 'Finding the smallest answer that works',
      rows: [
        {
          approach: 'Try every answer, small to big',
          time: 'O(n · M)',
          space: 'O(1)',
          note: 'M = size of the answer range. Hopeless when M is 10⁹.',
        },
        {
          approach: 'Binary search on the answer',
          time: 'O(n · log M)',
          space: 'O(1)',
          note: 'About 30 checks cover a range of a billion.',
        },
      ],
    },
    {
      kind: 'list',
      items: [
        '**The pattern: binary search on the answer.** The statement asks for the *minimum* (or *maximum*) value such that something is possible.',
        'Phrases like "minimize the largest…", "at least / at most… within D days", "the slowest speed / smallest capacity that…".',
        'Checking one guess is easy, often one **greedy** O(n) pass: take things in order, as many as fit, and move on.',
        'Bigger guesses are always at least as good (or always at least as bad). That gives the no…no, yes…yes shape.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: smallest answer that works',
      code: `function smallestThatWorks(lo, hi):
    // works(x) must be: no, ..., no, yes, ..., yes
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if works(mid):
            hi ← mid            // mid works; maybe smaller works too
        else:
            lo ← mid + 1        // mid fails, so everything smaller fails
    return lo`,
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'Write the check first',
      text: "The binary search part is always the same 7 lines. The real work is `works(x)`. Write it on its own, test it by hand on two or three guesses (like the table above), and only then wrap it in the template.",
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Bad bounds, rounding, and the "largest" flip',
      text: "**1. Bad bounds.** `lo = 0` makes `p / k` divide by zero. For ship capacity, `lo = 1` lets the check pretend a 10 kg package fits on a 5 kg truck. `lo` must be the smallest answer that *could* be valid. **2. Rounding.** Hours are `Math.ceil(p / k)`, not `p / k`. **3. Largest instead of smallest.** For \"the largest x that still works\", the shape flips to yes…yes, no…no, and on a yes you write `lo = mid`. Then you must round mid **up**: `mid = Math.floor((lo + hi + 1) / 2)`. Otherwise `lo = 3, hi = 4` picks 3 forever.",
    },
  ],
  problems: [
    {
      id: 'binary-search-eating-speed',
      title: 'Slowest Eating Speed',
      difficulty: 'medium',
      leetcode: 875,
      pattern: 'Binary search on the answer',
      statement:
        "A panda has piles of bamboo: `piles[i]` shoots in pile i. It picks a fixed speed `k` (shoots per hour). Each hour it eats up to `k` shoots from one pile; if that pile has fewer, it finishes it and does nothing else that hour. The keeper returns in `h` hours (`h` is at least the number of piles). Return the slowest whole speed `k` that finishes every pile within `h` hours.",
      examples: [
        { input: 'piles = [3, 6, 7, 11], h = 8', output: '4' },
        { input: 'piles = [30, 11, 23, 4, 20], h = 5', output: '30', explain: 'One hour per pile, so the speed must cover the biggest pile.' },
        { input: 'piles = [30, 11, 23, 4, 20], h = 6', output: '23' },
      ],
      constraints: ['1 ≤ n ≤ 10⁴', 'n ≤ h ≤ 10⁹', '1 ≤ piles[i] ≤ 10⁹'],
      hints: [
        'Forget finding k directly. If someone hands you a k, can you check whether it is fast enough?',
        'A pile of p takes `Math.ceil(p / k)` hours. If speed k works, does k + 1 work too?',
        'Binary search k in `1..max(piles)` with the first-true template: if hours ≤ h, `hi = mid`, else `lo = mid + 1`.',
      ],
      approaches: [
        {
          name: 'Try every speed',
          idea: 'Check k = 1, 2, 3, … and return the first that fits. `max(piles)` always fits, so this stops. Up to 10⁹ checks.',
          time: 'O(n · max)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on the speed',
          idea: 'Faster never takes more hours, so "does speed k fit?" is no…no, yes…yes over `1..max(piles)`. First true finds the slowest yes in about 30 checks.',
          pseudo: `function minEatingSpeed(piles, h):
    lo ← 1
    hi ← max(piles)
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        hours ← 0
        for each p in piles:
            hours ← hours + ceil(p / mid)
        if hours ≤ h:
            hi ← mid
        else:
            lo ← mid + 1
    return lo`,
          code: `function minEatingSpeed(piles, h) {
  const hoursAt = (k) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hoursAt(mid) <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(n · log max)',
          space: 'O(1)',
        },
      ],
      fn: 'minEatingSpeed',
      starter: `function minEatingSpeed(piles, h) {
  // Return the slowest speed that finishes all piles in h hours.
  return 0;
}`,
      solution: `function minEatingSpeed(piles, h) {
  const hoursAt = (k) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (hoursAt(mid) <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'the lesson example', args: [[3, 6, 7, 11], 8], expected: 4 },
        { name: 'one hour per pile', args: [[30, 11, 23, 4, 20], 5], expected: 30 },
        { name: 'one spare hour', args: [[30, 11, 23, 4, 20], 6], expected: 23 },
        { name: 'single tiny pile', args: [[1], 1], expected: 1 },
        { name: 'huge pile, two hours', args: [[1000000000], 2], expected: 500000000 },
        { name: 'equal piles, tight', args: [[5, 5, 5], 3], expected: 5 },
        { name: 'equal piles, lots of time', args: [[5, 5, 5], 15], expected: 1 },
        { name: 'just under one shoot per hour', args: [[312884470], 312884469], expected: 2 },
        { name: 'more hours than shoots', args: [[312884470], 968709470], expected: 1 },
      ],
      takeaway: 'If you can check a guess, and bigger guesses only get better, binary search the guess.',
    },
    {
      id: 'binary-search-ship-capacity',
      title: 'Ship Packages Within D Days',
      difficulty: 'medium',
      leetcode: 1011,
      pattern: 'Binary search on the answer',
      statement:
        "Packages sit on a conveyor belt in a fixed order, `weights[i]` kg each. Every day one truck takes packages from the front, in order, until the next package would push it over its capacity. Packages can't be skipped or split. Return the smallest truck capacity that ships everything within `days` days.",
      examples: [
        { input: 'weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5', output: '15', explain: 'Days: [1..5], [6, 7], [8], [9], [10]. With 14, it takes 6 days.' },
        { input: 'weights = [3, 2, 2, 4, 1, 4], days = 3', output: '6', explain: '[3, 2], [2, 4], [1, 4].' },
      ],
      constraints: ['1 ≤ days ≤ n ≤ 5 × 10⁴', '1 ≤ weights[i] ≤ 500'],
      hints: [
        'Given a capacity, how do you count the days? Fill the truck greedily, start a new day when the next package does not fit.',
        'What is the smallest capacity that could ever work? The largest you would ever need?',
        '`lo = max(weights)` (the heaviest package must fit), `hi = sum(weights)` (all in one day). First true on "days needed ≤ days".',
      ],
      approaches: [
        {
          name: 'Try every capacity',
          idea: 'Start at `max(weights)` and go up by 1 until the day count fits. Up to `sum - max` checks, each O(n).',
          time: 'O(n · sum)',
          space: 'O(1)',
        },
        {
          name: 'Binary search on the capacity',
          idea: 'A bigger truck never needs more days, so "does capacity c fit?" is no…no, yes…yes over `max..sum`. The check is a greedy pass: keep loading until the next package overflows, then start a new day.',
          pseudo: `function shipWithinDays(weights, days):
    lo ← max(weights)
    hi ← sum(weights)
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if daysNeeded(weights, mid) ≤ days:
            hi ← mid
        else:
            lo ← mid + 1
    return lo

function daysNeeded(weights, cap):
    used ← 1
    load ← 0
    for each w in weights:
        if load + w > cap:      // does not fit: new day
            used ← used + 1
            load ← 0
        load ← load + w
    return used`,
          code: `function shipWithinDays(weights, days) {
  const daysAt = (cap) => {
    let used = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        used++;
        load = 0;
      }
      load += w;
    }
    return used;
  };
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysAt(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(n · log sum)',
          space: 'O(1)',
        },
      ],
      fn: 'shipWithinDays',
      starter: `function shipWithinDays(weights, days) {
  // Return the smallest capacity that ships everything in time.
  return 0;
}`,
      solution: `function shipWithinDays(weights, days) {
  const daysAt = (cap) => {
    let used = 1;
    let load = 0;
    for (const w of weights) {
      if (load + w > cap) {
        used++;
        load = 0;
      }
      load += w;
    }
    return used;
  };
  let lo = Math.max(...weights);
  let hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (daysAt(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'ten packages, five days', args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expected: 15 },
        { name: 'three days', args: [[3, 2, 2, 4, 1, 4], 3], expected: 6 },
        { name: 'four days', args: [[1, 2, 3, 1, 1], 4], expected: 3 },
        { name: 'one package', args: [[10], 1], expected: 10 },
        { name: 'one per day', args: [[1, 1, 1, 1], 4], expected: 1 },
        { name: 'all in one day', args: [[1, 1, 1, 1], 1], expected: 4 },
        { name: 'equal weights', args: [[5, 5, 5, 5], 2], expected: 10 },
        { name: 'heavy package decides', args: [[1, 1, 9, 1, 1], 5], expected: 9 },
        { name: 'uneven split', args: [[7, 2, 5, 10, 8], 2], expected: 18 },
      ],
      takeaway: '`lo` is the smallest answer that could ever be valid: here, the heaviest package.',
    },
    {
      id: 'binary-search-bouquets',
      title: 'Minimum Days for Bouquets',
      difficulty: 'medium',
      leetcode: 1482,
      pattern: 'Binary search on the answer',
      statement:
        "A row of flowers: flower i blooms on day `bloomDay[i]` and stays bloomed. A bouquet needs `k` bloomed flowers that stand **next to each other**. Each flower can go in only one bouquet. You need `m` bouquets for a wedding. Return the fewest days you must wait, or `-1` if it is impossible.",
      examples: [
        { input: 'bloomDay = [1, 10, 3, 10, 2], m = 3, k = 1', output: '3', explain: 'By day 3, flowers 0, 2 and 4 are open: 3 bouquets of 1.' },
        { input: 'bloomDay = [1, 10, 3, 10, 2], m = 3, k = 2', output: '-1', explain: '6 flowers needed, only 5 exist.' },
        { input: 'bloomDay = [7, 7, 7, 7, 12, 7, 7], m = 2, k = 3', output: '12', explain: 'On day 7 the 12 splits the row, so only one run of 3 fits.' },
      ],
      constraints: ['1 ≤ n ≤ 10⁵', '1 ≤ bloomDay[i] ≤ 10⁹', '1 ≤ m, k ≤ 10⁶'],
      hints: [
        'When is it impossible no matter how long you wait?',
        'If you can make m bouquets on day d, can you on day d + 1? Then binary search the day.',
        'Check a day d in one pass: count bloomed flowers in a row; each time the run reaches k, make a bouquet and reset the run. A flower not yet bloomed also resets it. Search days in `min(bloomDay)..max(bloomDay)`.',
      ],
      approaches: [
        {
          name: 'Try every distinct bloom day',
          idea: 'The answer is always one of the bloom days. Sort them and check each in order. Up to n checks of O(n).',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Binary search on the day',
          idea: 'Waiting longer never closes a flower, so "can I make m bouquets by day d?" is no…no, yes…yes. If `m × k > n` there are not enough flowers at all, so return -1 first.',
          pseudo: `function minDays(bloomDay, m, k):
    if m × k > n:
        return -1
    lo ← min(bloomDay)
    hi ← max(bloomDay)
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if bouquetsBy(mid) ≥ m:
            hi ← mid
        else:
            lo ← mid + 1
    return lo

function bouquetsBy(day):
    made ← 0
    run ← 0                     // bloomed flowers in a row
    for each d in bloomDay:
        if d ≤ day:
            run ← run + 1
            if run = k:
                made ← made + 1
                run ← 0
        else:
            run ← 0
    return made`,
          code: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1;
  const bouquetsBy = (day) => {
    let made = 0;
    let run = 0;
    for (const d of bloomDay) {
      if (d <= day) {
        run++;
        if (run === k) {
          made++;
          run = 0;
        }
      } else {
        run = 0;
      }
    }
    return made;
  };
  let lo = Math.min(...bloomDay);
  let hi = Math.max(...bloomDay);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (bouquetsBy(mid) >= m) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(n · log maxDay)',
          space: 'O(1)',
        },
      ],
      fn: 'minDays',
      starter: `function minDays(bloomDay, m, k) {
  // Return the fewest days to make m bouquets of k adjacent flowers, or -1.
  return -1;
}`,
      solution: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1;
  const bouquetsBy = (day) => {
    let made = 0;
    let run = 0;
    for (const d of bloomDay) {
      if (d <= day) {
        run++;
        if (run === k) {
          made++;
          run = 0;
        }
      } else {
        run = 0;
      }
    }
    return made;
  };
  let lo = Math.min(...bloomDay);
  let hi = Math.max(...bloomDay);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (bouquetsBy(mid) >= m) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'bouquets of one', args: [[1, 10, 3, 10, 2], 3, 1], expected: 3 },
        { name: 'not enough flowers', args: [[1, 10, 3, 10, 2], 3, 2], expected: -1 },
        { name: 'a late flower splits the row', args: [[7, 7, 7, 7, 12, 7, 7], 2, 3], expected: 12 },
        { name: 'huge days', args: [[1000000000, 1000000000], 1, 1], expected: 1000000000 },
        { name: 'pairs in a zigzag', args: [[1, 10, 2, 9, 3, 8, 4, 7, 5, 6], 4, 2], expected: 9 },
        { name: 'single flower', args: [[5], 1, 1], expected: 5 },
        { name: 'one bouquet uses every flower', args: [[1, 2, 3], 1, 3], expected: 3 },
        { name: 'two singles', args: [[3, 1, 2], 2, 1], expected: 2 },
        { name: 'exactly enough flowers', args: [[4, 2, 9, 1], 2, 2], expected: 9 },
      ],
      takeaway: 'Check the impossible case first, then binary search the day.',
    },
    {
      id: 'binary-search-split-array',
      title: 'Split Array, Smallest Largest Sum (stretch)',
      difficulty: 'hard',
      leetcode: 410,
      pattern: 'Binary search on the answer',
      statement:
        "**Stretch problem.** A book's chapters have page counts `nums`, in order. You must split the chapters among exactly `k` translators. Each translator gets a block of chapters that are next to each other, and nobody gets zero chapters. The book is done when the busiest translator finishes. Return the smallest possible page count for the busiest translator.",
      examples: [
        { input: 'nums = [7, 2, 5, 10, 8], k = 2', output: '18', explain: 'Split as [7, 2, 5] and [10, 8]: sums 14 and 18.' },
        { input: 'nums = [1, 2, 3, 4, 5], k = 2', output: '9', explain: '[1, 2, 3] and [4, 5]: sums 6 and 9.' },
      ],
      constraints: ['1 ≤ k ≤ min(50, n)', '1 ≤ n ≤ 1000', '0 ≤ nums[i] ≤ 10⁶'],
      hints: [
        'This looks like a splitting puzzle, but read the question: "smallest possible largest sum". That is an answer you can guess and check.',
        'Given a limit `L` on any one block, how few blocks can you make? Greedily add chapters until the next one would go over L.',
        'If the greedy count is ≤ k, the limit works (you can always split a block further to reach exactly k). Search L in `max(nums)..sum(nums)`. It is the ship-capacity problem in disguise.',
      ],
      approaches: [
        {
          name: 'Try every split',
          idea: 'Place k - 1 cut points in every possible way and keep the best. Way too many ways for n = 1000. (A dynamic programming solution in O(k · n²) also exists; modules 16-17 teach that style.)',
          time: 'O(n^(k-1))',
          space: 'O(k)',
        },
        {
          name: 'Binary search on the largest sum',
          idea: 'Guess a limit L. Greedy packing gives the fewest blocks with every block ≤ L. A bigger L never needs more blocks, so "fewest blocks ≤ k?" is no…no, yes…yes. If you need fewer than k blocks, split any block with 2+ chapters: no block gets bigger.',
          pseudo: `function splitArray(nums, k):
    lo ← max(nums)              // one chapter can't be split
    hi ← sum(nums)              // one translator does it all
    while lo < hi:
        mid ← floor((lo + hi) / 2)
        if blocksNeeded(nums, mid) ≤ k:
            hi ← mid
        else:
            lo ← mid + 1
    return lo

function blocksNeeded(nums, limit):
    blocks ← 1
    current ← 0
    for each x in nums:
        if current + x > limit:
            blocks ← blocks + 1
            current ← 0
        current ← current + x
    return blocks`,
          code: `function splitArray(nums, k) {
  const blocksNeeded = (limit) => {
    let blocks = 1;
    let current = 0;
    for (const x of nums) {
      if (current + x > limit) {
        blocks++;
        current = 0;
      }
      current += x;
    }
    return blocks;
  };
  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (blocksNeeded(mid) <= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
          time: 'O(n · log sum)',
          space: 'O(1)',
        },
      ],
      fn: 'splitArray',
      starter: `function splitArray(nums, k) {
  // Split nums into k contiguous blocks; minimize the largest block sum.
  return 0;
}`,
      solution: `function splitArray(nums, k) {
  const blocksNeeded = (limit) => {
    let blocks = 1;
    let current = 0;
    for (const x of nums) {
      if (current + x > limit) {
        blocks++;
        current = 0;
      }
      current += x;
    }
    return blocks;
  };
  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (blocksNeeded(mid) <= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`,
      tests: [
        { name: 'two translators', args: [[7, 2, 5, 10, 8], 2], expected: 18 },
        { name: 'balanced split', args: [[1, 2, 3, 4, 5], 2], expected: 9 },
        { name: 'k equals n', args: [[1, 4, 4], 3], expected: 4 },
        { name: 'one chapter', args: [[10], 1], expected: 10 },
        { name: 'everyone gets one', args: [[1, 2, 3, 4, 5], 5], expected: 5 },
        { name: 'one translator', args: [[1, 2, 3, 4, 5], 1], expected: 15 },
        { name: 'all zeros', args: [[0, 0, 0], 2], expected: 0 },
        { name: 'five translators, six chapters', args: [[2, 3, 1, 2, 4, 3], 5], expected: 4 },
        { name: 'big chapter decides', args: [[1, 1, 1, 50, 1, 1], 3], expected: 50 },
      ],
      takeaway: '"Minimize the largest" is a strong signal for binary search on the answer.',
    },
  ],
  quiz: [
    {
      prompt: 'Why can we binary search the eating speed?',
      options: [
        'If speed k works, every faster speed works too',
        'The piles are sorted',
        'Speeds are whole numbers',
        'h is always small',
      ],
      answer: 0,
      explanation: 'That one-way shape (no…no, yes…yes) is what binary search needs. The piles do not need to be sorted at all.',
    },
    {
      prompt: 'Ship capacity with `weights = [4, 9, 2]`. What is the right starting `lo`?',
      options: ['9, the heaviest package', '1', '0', '15'],
      answer: 0,
      explanation: 'Any capacity below 9 can never carry the 9 kg package. The sum, 15, is `hi`: one day carries everything.',
    },
    {
      prompt: 'You want the **largest** x such that `works(x)`, and on a yes you write `lo = mid`. How must you compute `mid`?',
      options: ['`Math.floor((lo + hi + 1) / 2)`', '`Math.floor((lo + hi) / 2)`', '`(lo + hi) / 2`'],
      answer: 0,
      explanation: 'Rounding up makes sure `mid > lo` when `hi = lo + 1`. Rounding down would pick `lo` again and loop forever.',
    },
    {
      prompt: 'The answer is between 1 and 10⁹, and one check costs O(n). About how much work in total?',
      options: ['About 30 checks: O(30 · n)', '10⁹ checks', 'O(log n)', 'O(n²)'],
      answer: 0,
      explanation: 'log₂(10⁹) ≈ 30, so you halve the range about 30 times, paying O(n) each time.',
    },
  ],
  takeaways: [
    'If you can check a guess, and the checks look like no…no, yes…yes, binary search the answer itself.',
    'Pick `lo` and `hi` as the smallest and largest answers that could ever be right.',
    'Cost = (cost of one check) × log₂(size of the answer range).',
  ],
};

export default lesson;
