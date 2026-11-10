import type { Lesson } from '../types';

const cookiesCode = `function findContentChildren(kids, cookies) {
  kids.sort((a, b) => a - b);
  cookies.sort((a, b) => a - b);
  let k = 0; // least greedy kid who is still hungry
  for (const c of cookies) {
    if (k < kids.length && c >= kids[k]) k++;
  }
  return k;
}`;

const cookiesPseudo = `function findContentChildren(kids, cookies):
    sort kids ascending
    sort cookies ascending
    k ← 0                                // least greedy kid still hungry
    for each c in cookies:               // smallest cookie first
        if k < length of kids and c ≥ kids[k]:
            k ← k + 1                    // this kid is happy
        // else: c is too small for every hungry kid, skip it
    return k`;

const lemonadeCode = `function lemonadeChange(bills) {
  let fives = 0;
  let tens = 0;
  for (const b of bills) {
    if (b === 5) {
      fives++;
    } else if (b === 10) {
      if (fives === 0) return false;
      fives--;
      tens++;
    } else if (tens > 0 && fives > 0) {
      tens--;
      fives--;
    } else if (fives >= 3) {
      fives -= 3;
    } else {
      return false;
    }
  }
  return true;
}`;

const stockCode = `function maxProfit(prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1];
  }
  return profit;
}`;

const boatsCode = `function numRescueBoats(people, limit) {
  people.sort((a, b) => a - b);
  let i = 0;
  let j = people.length - 1;
  let boats = 0;
  while (i <= j) {
    if (people[i] + people[j] <= limit) i++; // lightest rides along
    j--; // heaviest always leaves
    boats++;
  }
  return boats;
}`;

const lesson: Lesson = {
  id: 'greedy-thinking',
  title: 'Greedy thinking: the best move now',
  summary: 'Take the best-looking move, never undo it, and check in one sentence why that is safe.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Cookies at a party',
      text: 'You are handing out cookies at a birthday party. Cookies come in different sizes. Each kid has a *greed* number: the smallest cookie that makes them happy. Each kid gets at most one cookie. You want as many happy kids as possible. Do you give the biggest cookie to the hungriest kid? To whoever is first in line? There is a rule that is always right, and you can check it in one sentence.',
    },
    {
      kind: 'text',
      text: '**The problem.** The kids need `[1, 2, 3, 5]`. The cookies are `[1, 1, 3, 6]`. A cookie of size `c` makes a kid with greed `g` happy when `c ≥ g`. What is the most kids you can make happy? (Answer: 3.)',
    },
    {
      kind: 'text',
      text: '**Brute force first.** Try every way to hand out the cookies. Each cookie goes to some hungry kid it fits, or to nobody. Keep the best count. This is always correct. It is also hopeless past about 10 cookies, because the number of ways explodes.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: try every hand-out',
      code: `function bestFed(kids, cookies, c, fed):     // fed = set of happy kids
    if c = length of cookies:
        return size of fed
    best ← bestFed(kids, cookies, c + 1, fed)    // cookie c goes to nobody
    for each kid k not in fed:
        if cookies[c] ≥ kids[k]:
            add k to fed
            best ← max(best, bestFed(kids, cookies, c + 1, fed))
            remove k from fed
    return best
// Each cookie has up to n + 1 choices: about (n + 1)^m tries.`,
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Most of those tries are silly. Why give the size-6 cookie to the kid who only needs 1, when a size-1 cookie does that job? The brute force spends almost all its time on hand-outs that waste a big cookie on a small need.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Greedy: best move now, never undo it',
      text: 'A **greedy** algorithm makes the move that looks best right now and never takes it back. Here: sort both lists. Look at the smallest cookie. If it fits the least greedy hungry kid, give it. If not, throw it away: every other hungry kid is even greedier, so it fits nobody. **Why is this safe?** Say some best answer gave that kid a bigger cookie. Swap in the small one. The big cookie is now free, and it fits anyone the small one fit. The count never drops.',
    },
    {
      kind: 'steps',
      title: 'Smallest cookie meets least greedy kid',
      frames: [
        {
          cells: [1, 1, 3, 6],
          pointers: { c: 0 },
          active: [0],
          vars: { kids: '1 2 3 5', 'next kid needs': 1, happy: 0 },
          note: 'Both lists sorted. Cookie 1 meets the least greedy kid, who needs 1. It fits: give it.',
        },
        {
          cells: [1, 1, 3, 6],
          pointers: { c: 1 },
          active: [1],
          found: [0],
          vars: { kids: '1 2 3 5', 'next kid needs': 2, happy: 1 },
          note: 'Cookie 1 meets the kid who needs 2. Too small, and every other kid needs even more. Throw it away.',
        },
        {
          cells: [1, 1, 3, 6],
          pointers: { c: 2 },
          active: [2],
          found: [0],
          done: [1],
          vars: { kids: '1 2 3 5', 'next kid needs': 2, happy: 1 },
          note: 'Cookie 3 meets the kid who needs 2. It fits: give it. The kid who needs 2 waited; only the cookie was skipped.',
        },
        {
          cells: [1, 1, 3, 6],
          pointers: { c: 3 },
          active: [3],
          found: [0, 2],
          done: [1],
          vars: { kids: '1 2 3 5', 'next kid needs': 3, happy: 2 },
          note: 'Cookie 6 meets the kid who needs 3. It fits: give it.',
        },
        {
          cells: [1, 1, 3, 6],
          found: [0, 2, 3],
          done: [1],
          vars: { kids: '1 2 3 5', 'next kid needs': 5, happy: 3 },
          note: 'No cookies left. The kid who needs 5 stays hungry. Answer: **3**.',
        },
      ],
    },
    {
      kind: 'text',
      text: '**The one-sentence safety check.** Greedy rules feel right even when they are wrong. Before you trust one, run this check:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Say the rule in one sentence: *give the smallest cookie that fits to the least greedy kid.*',
        'Imagine a best answer that did something else first.',
        'Try to swap its move for yours. If the swap never makes the answer worse, your rule is safe. This is called an *exchange argument*: you exchange their move for yours.',
        'Then attack your rule with tiny inputs (2 or 3 items). If you find one case where it loses, the rule is wrong.',
      ],
    },
    {
      kind: 'diagram',
      title: 'When greedy fails: coins [1, 3, 4], make 6',
      art: `rule: take the biggest coin that fits

greedy:  6 --4--> 2 --1--> 1 --1--> 0     3 coins
best:    6 --3--> 3 --3--> 0              2 coins`,
      caption: 'The swap check fails here: taking the 4 leaves a 2, and a 2 is expensive to pay. One early choice changes what is left in a way that hurts later. Problems like this need dynamic programming, which module 16 teaches.',
    },
    { kind: 'code', lang: 'pseudo', title: 'Assign Cookies, greedy', code: cookiesPseudo },
    { kind: 'code', lang: 'js', title: 'Assign Cookies in JavaScript', code: cookiesCode },
    {
      kind: 'compare',
      title: 'Assign Cookies: n kids, m cookies',
      rows: [
        {
          approach: 'Try every hand-out',
          time: 'O((n + 1)^m)',
          space: 'O(m)',
          note: 'Correct, but 10 kids and 10 cookies is already billions of tries.',
        },
        {
          approach: 'Sort + walk both lists (greedy)',
          time: 'O(n log n + m log m)',
          space: 'O(1) extra',
          note: 'The sorts cost the most. The walk itself is one pass.',
        },
      ],
    },
    { kind: 'text', text: '**The pattern: greedy with a swap check.** Reach for it when you see:' },
    {
      kind: 'list',
      items: [
        'The task asks for the **most** or **fewest** of something: kids fed, boats, jumps, arrows.',
        'There is a natural order to try things in: smallest first, earliest end, farthest reach.',
        'Taking the best item now never blocks a better plan later, and you can say why in one sentence.',
        'If a choice now *can* ruin a later choice (like the coins), think DP instead.',
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: sort, then take greedily',
      code: `sort items by the key that makes the best move obvious
answer ← 0
for each item in sorted order:
    if item can be taken right now:
        take it                          // never undo
        answer ← answer + 1
return answer`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'sort() sorts numbers as text',
      text: 'In JavaScript, `[10, 9, 2].sort()` gives `[10, 2, 9]`. With no comparator, it compares the numbers as text, and "10" comes before "2". Almost every greedy starts with a sort, so this bug hides everywhere. Always write `nums.sort((a, b) => a - b)`. For intervals: `list.sort((a, b) => a[0] - b[0])`.',
    },
  ],
  problems: [
    {
      id: 'greedy-intervals-assign-cookies',
      title: 'Assign Cookies',
      difficulty: 'easy',
      leetcode: 455,
      pattern: 'Greedy: sort + match',
      statement:
        'At a party, kid `i` is happy with any cookie of size at least `kids[i]`. Cookie `j` has size `cookies[j]`. Each kid gets at most one cookie, and each cookie goes to at most one kid. Return the largest number of happy kids.',
      examples: [
        { input: 'kids = [1, 2, 3], cookies = [1, 1]', output: '1', explain: 'Both cookies are size 1. Only the kid who needs 1 can be happy.' },
        { input: 'kids = [1, 2], cookies = [1, 2, 3]', output: '2' },
      ],
      constraints: ['0 ≤ kids.length, cookies.length ≤ 3·10⁴', '1 ≤ kids[i], cookies[j] ≤ 2³¹ − 1'],
      hints: [
        'Would you ever give a big cookie to a kid when a smaller cookie would do?',
        'Sort both lists. Look at the smallest cookie and the least greedy hungry kid.',
        'If the smallest cookie fits that kid, give it. If not, it fits nobody: throw it away and move to the next cookie.',
      ],
      approaches: [
        {
          name: 'Try every hand-out',
          idea: 'For each cookie, try giving it to every hungry kid it fits, or to nobody, and keep the best count. Correct because it checks every option, but the options multiply.',
          time: 'O((n + 1)^m)',
          space: 'O(m)',
        },
        {
          name: 'Sort + walk both lists (greedy)',
          idea: 'Smallest cookie first. If it fits the least greedy hungry kid, that kid is fed. If it does not, no hungry kid can use it. Swap check: any best answer can trade the small cookie in for whatever it gave that kid, and never lose a kid.',
          pseudo: cookiesPseudo,
          code: cookiesCode,
          time: 'O(n log n + m log m)',
          space: 'O(1) extra',
        },
      ],
      fn: 'findContentChildren',
      starter: `function findContentChildren(kids, cookies) {
  // Return how many kids can get a cookie that fits.
  return 0;
}`,
      solution: cookiesCode,
      tests: [
        { name: 'example', args: [[1, 2, 3], [1, 1]], expected: 1 },
        { name: 'every kid fed', args: [[1, 2], [1, 2, 3]], expected: 2 },
        { name: 'no cookies', args: [[1, 2], []], expected: 0 },
        { name: 'no kids', args: [[], [1, 2]], expected: 0 },
        { name: 'unsorted, one cookie skipped', args: [[5, 1, 3, 2], [6, 1, 3, 1]], expected: 3 },
        { name: 'double-digit sizes (sort trap)', args: [[2, 5], [10, 3]], expected: 2 },
        { name: 'cookies too small', args: [[3, 3], [1, 2]], expected: 0 },
        { name: 'all the same', args: [[1, 1, 1], [1, 1]], expected: 2 },
      ],
      takeaway: 'Match the smallest thing that works. It saves the big resources for the big needs.',
    },
    {
      id: 'greedy-intervals-lemonade-change',
      title: 'Lemonade Change',
      difficulty: 'easy',
      leetcode: 860,
      pattern: 'Greedy: keep the flexible resource',
      statement:
        'You run a lemonade stand. Each cup costs $5. Customers come in the order of `bills`, and each pays with one bill: $5, $10 or $20. Your cash box starts empty, and you can only give change from bills you have already collected. Return `true` if you can give every customer exact change.',
      examples: [
        { input: 'bills = [5, 5, 5, 10, 20]', output: 'true', explain: 'Three $5s. The $10 gets a $5 back. The $20 gets $10 + $5 back.' },
        { input: 'bills = [5, 5, 10, 10, 20]', output: 'false', explain: 'After the two $10s you hold only $10 bills. The $20 needs $15, and you have no $5.' },
      ],
      constraints: ['0 ≤ bills.length ≤ 10⁵', 'bills[i] is 5, 10 or 20'],
      hints: [
        'You only care how many $5 and $10 bills you hold. A $20 is never useful as change.',
        'A $10 needs one $5 back. A $20 needs $15 back: either $10 + $5, or three $5s.',
        'When both ways work for a $20, which bill is more useful to keep? A $5 can help any later customer. A $10 only helps a $20.',
        'So pay $10 + $5 when you can, and three $5s only when you have no $10.',
      ],
      approaches: [
        {
          name: 'Bag of bills',
          idea: 'Keep every bill you collect in a list. For each customer, search the list for bills that make the change, and remove them. Correct, but searching and removing from a list is slow.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Two counters, keep the $5s (greedy)',
          idea: 'Only the number of $5s and $10s matters. For a $20, spend a $10 first, because a $5 is the more flexible bill. Swap check: paying $10 + $5 instead of three $5s leaves you with two more $5s and one less $10, and two $5s can do anything one $10 can.',
          pseudo: `function lemonadeChange(bills):
    fives ← 0
    tens ← 0
    for each b in bills:
        if b = 5:
            fives ← fives + 1
        else if b = 10:
            if fives = 0:
                return false
            fives ← fives - 1
            tens ← tens + 1
        else:                                // b = 20, owe $15
            if tens > 0 and fives > 0:
                tens ← tens - 1
                fives ← fives - 1
            else if fives ≥ 3:
                fives ← fives - 3
            else:
                return false
    return true`,
          code: lemonadeCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'lemonadeChange',
      starter: `function lemonadeChange(bills) {
  // Return true if every customer can get exact change.
  return false;
}`,
      solution: lemonadeCode,
      tests: [
        { name: 'example', args: [[5, 5, 5, 10, 20]], expected: true },
        { name: 'no $5 for the $20', args: [[5, 5, 10, 10, 20]], expected: false },
        { name: 'first customer pays $10', args: [[10]], expected: false },
        { name: 'one $5', args: [[5]], expected: true },
        { name: 'nobody comes', args: [[]], expected: true },
        { name: 'pay $20 with $10 + $5 first', args: [[5, 5, 5, 5, 10, 20, 10]], expected: true },
        { name: 'only $5s for a $20', args: [[5, 5, 5, 20]], expected: true },
        { name: 'two $5s are not enough', args: [[5, 5, 20]], expected: false },
      ],
      takeaway: 'When two moves both work, spend the less flexible resource and keep the flexible one.',
    },
    {
      id: 'greedy-intervals-stock-profit-ii',
      title: 'Trading Cards, Many Trades',
      difficulty: 'medium',
      leetcode: 122,
      pattern: 'Greedy: take every small gain',
      statement:
        'You know the price of a rare trading card for each of the next days: `prices[i]` on day `i`. Each day you may buy one card, sell the card you hold, or do nothing. You hold at most one card at a time, and you may trade as many times as you like (you can even sell and buy again on the same day). Return the largest total profit. (The one-trade version is in module 1.)',
      examples: [
        { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '7', explain: 'Buy at 1, sell at 5 (+4). Buy at 3, sell at 6 (+3).' },
        { input: 'prices = [1, 2, 3, 4, 5]', output: '4', explain: 'Buy at 1, sell at 5. Same as four one-day trades: 1 + 1 + 1 + 1.' },
        { input: 'prices = [7, 6, 4, 3, 1]', output: '0', explain: 'Prices only fall. Never buy.' },
      ],
      constraints: ['1 ≤ prices.length ≤ 3·10⁴', '0 ≤ prices[i] ≤ 10⁴'],
      hints: [
        'Picture the prices as a line chart. Where does the money come from?',
        'A climb from 1 to 5 earns the same as the small climbs 1→2, 2→3, 3→4, 4→5 added together.',
        'So you never lose by grabbing every day-to-day rise, and you never want to hold a card through a drop.',
        'Answer = the sum of `prices[i] - prices[i - 1]` over every day where it is positive.',
      ],
      approaches: [
        {
          name: 'Try every plan',
          idea: 'Each day, try every legal move (buy, sell, wait) and recurse. Keeps the best total. Correct but each day doubles the plans.',
          time: 'O(2ⁿ)',
          space: 'O(n)',
        },
        {
          name: 'Valleys and peaks',
          idea: 'Find each low point, buy there, ride up to the next high point, sell there. Correct, but the index juggling for "find the valley, find the peak" is easy to get wrong.',
          time: 'O(n)',
          space: 'O(1)',
        },
        {
          name: 'Add every rise (greedy)',
          idea: 'Any trade from day a to day b earns the sum of the daily changes between them. Rises only help and drops only hurt, so take every rise and skip every drop. Each rise is "buy today, sell tomorrow".',
          pseudo: `function maxProfit(prices):
    profit ← 0
    for i from 1 to n - 1:
        if prices[i] > prices[i - 1]:
            profit ← profit + (prices[i] - prices[i - 1])
    return profit`,
          code: stockCode,
          time: 'O(n)',
          space: 'O(1)',
        },
      ],
      fn: 'maxProfit',
      starter: `function maxProfit(prices) {
  // Return the best total profit with unlimited trades.
  return 0;
}`,
      solution: stockCode,
      tests: [
        { name: 'example', args: [[7, 1, 5, 3, 6, 4]], expected: 7 },
        { name: 'always rising', args: [[1, 2, 3, 4, 5]], expected: 4 },
        { name: 'always falling', args: [[7, 6, 4, 3, 1]], expected: 0 },
        { name: 'one day', args: [[5]], expected: 0 },
        { name: 'flat prices', args: [[2, 2, 2]], expected: 0 },
        { name: 'up down up', args: [[1, 5, 1, 5]], expected: 8 },
        { name: 'mixed', args: [[3, 3, 5, 0, 0, 3, 1, 4]], expected: 8 },
      ],
      takeaway: 'A big gain is a sum of small gains. If you can take each small gain on its own, take them all.',
    },
    {
      id: 'greedy-intervals-boats-to-save-people',
      title: 'Rescue Boats',
      difficulty: 'medium',
      leetcode: 881,
      pattern: 'Greedy: sort + two pointers',
      statement:
        'A flood rescue team has boats. Each boat carries **at most two people**, and their total weight must be at most `limit`. Given each person\'s weight in `people` (nobody weighs more than `limit`), return the fewest boats needed to carry everyone.',
      examples: [
        { input: 'people = [1, 2], limit = 3', output: '1' },
        { input: 'people = [3, 2, 2, 1], limit = 3', output: '3', explain: 'Boats: (1, 2), (2), (3).' },
        { input: 'people = [3, 5, 3, 4], limit = 5', output: '4', explain: 'No two people fit together.' },
      ],
      constraints: ['1 ≤ people.length ≤ 5·10⁴', '1 ≤ people[i] ≤ limit ≤ 3·10⁴'],
      hints: [
        'Think about the heaviest person. They need a boat no matter what. Who is their best partner?',
        'The lightest person. If even the lightest can\'t ride with the heaviest, nobody can, so the heaviest rides alone.',
        'Sort. Put one pointer on the lightest and one on the heaviest. Every boat takes the heaviest, plus the lightest if they fit.',
      ],
      approaches: [
        {
          name: 'Try every pairing',
          idea: 'Try every way to split people into pairs and singles, and keep the fewest boats. Correct but the number of pairings grows faster than 2ⁿ.',
          time: 'exponential',
          space: 'O(n)',
        },
        {
          name: 'Heaviest + lightest (greedy)',
          idea: 'The heaviest person must ride in some boat. Pair them with the lightest if the two fit. Swap check: if a best plan pairs the heaviest with someone else X, swap X and the lightest. The lightest fits anywhere X fit, so no boat breaks.',
          pseudo: `function numRescueBoats(people, limit):
    sort people ascending
    i ← 0                        // lightest person left
    j ← n - 1                    // heaviest person left
    boats ← 0
    while i ≤ j:
        if people[i] + people[j] ≤ limit:
            i ← i + 1            // lightest rides along
        j ← j - 1                // heaviest always leaves
        boats ← boats + 1
    return boats`,
          code: boatsCode,
          time: 'O(n log n)',
          space: 'O(1) extra',
        },
      ],
      fn: 'numRescueBoats',
      starter: `function numRescueBoats(people, limit) {
  // Return the fewest boats (max 2 people, max weight limit).
  return 0;
}`,
      solution: boatsCode,
      tests: [
        { name: 'one boat', args: [[1, 2], 3], expected: 1 },
        { name: 'example', args: [[3, 2, 2, 1], 3], expected: 3 },
        { name: 'nobody pairs', args: [[3, 5, 3, 4], 5], expected: 4 },
        { name: 'one person', args: [[5], 5], expected: 1 },
        { name: 'all pair up', args: [[2, 2, 2, 2], 4], expected: 2 },
        { name: 'max two per boat', args: [[1, 1, 1, 1, 1], 5], expected: 3 },
        { name: 'double digits (sort trap)', args: [[10, 2, 9, 1], 11], expected: 2 },
      ],
      takeaway: 'Deal with the hardest item first, and give it the partner most likely to fit.',
    },
  ],
  quiz: [
    {
      prompt: 'Coins `[1, 3, 4]`, make 6 with the fewest coins. What does "take the biggest coin that fits" give?',
      options: ['2 coins (3 + 3)', '3 coins (4 + 1 + 1)', '6 coins', 'It cannot make 6'],
      answer: 1,
      explanation: 'It grabs the 4, then must pay 1 + 1. The best is 3 + 3. Greedy is not safe for every coin set, so check before you trust it.',
    },
    {
      prompt: 'In Assign Cookies, the smallest cookie does not fit the least greedy hungry kid. What do you do?',
      options: [
        'Give it to the greediest kid',
        'Throw the cookie away and try the next cookie',
        'Skip that kid and try the next kid',
        'Stop: the answer is final',
      ],
      answer: 1,
      explanation: 'Every other hungry kid is at least as greedy, so this cookie fits nobody. Skipping the kid would be wrong: a bigger cookie may still feed them.',
    },
    {
      prompt: 'What is an *exchange argument*, in plain words?',
      options: [
        'Trying every possible answer',
        'Showing you can swap a best answer\'s move for your greedy move without making it worse',
        'Sorting the input before you start',
        'Trading time for space with a hash map',
      ],
      answer: 1,
      explanation: 'If every best answer can be changed to use your move and stay just as good, your move is safe.',
    },
    {
      prompt: 'What does `[3, 20, 100].sort()` return in JavaScript?',
      options: ['[3, 20, 100]', '[100, 20, 3]', '[20, 3, 100]'],
      answer: 1,
      explanation: 'With no comparator, the numbers are compared as text: "100" < "20" < "3". Use `(a, b) => a - b`.',
    },
  ],
  takeaways: [
    'Greedy = take the best-looking move now and never undo it. It is fast because it never looks back.',
    'Trust a greedy rule only after the swap check: any best answer can switch to your move without getting worse.',
    'Attack your rule with 2-3 item inputs. Coins `[1, 3, 4]` for 6 shows greedy can fail; that is a job for DP (module 16).',
    'Sort numbers with `(a, b) => a - b`. Plain `sort()` compares text.',
  ],
};

export default lesson;
