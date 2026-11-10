import type { Series, TreeNode } from '../types';

// /dsa/reels module 12. One reel per lesson of src/dsa/modules/12-heaps*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

/**
 * A min-heap array drawn as its tree (children of i are 2i + 1 and 2i + 2). Node ids follow the
 * VALUE, so a swap slides the two nodes past each other. `active` / `good` are array indices.
 */
const heapTree = (a: number[], mark: { active?: number[]; good?: number[] } = {}): TreeNode => {
  const node = (i: number): TreeNode => ({
    id: `v${a[i]}`,
    label: String(a[i]),
    active: mark.active?.includes(i) || undefined,
    tone: mark.good?.includes(i) ? 'good' : undefined,
    children: [2 * i + 1, 2 * i + 2].filter((c) => c < a.length).map(node),
  });
  return node(0);
};

// Lesson 2: scores for "3rd largest so far".
const scores = [4, 5, 8, 2, 3, 5, 10, 9];

// Lesson 3: lists A, B, C as grid rows ('' pads the short ones).
const lists = [
  [1, 4, 9],
  [2, 3, ''],
  [5, '', ''],
];

// Lesson 5: the lesson's meetings [0,30] [5,10] [15,20] [25,35], in units of 5 minutes.
const mA = { id: 'a', from: 0, to: 6 };
const mB = { id: 'b', from: 1, to: 2 };
const mC = { id: 'c', from: 3, to: 4 };
const mD = { id: 'd', from: 5, to: 7 };

export const series: Series = {
  id: 'dsa-heaps',
  title: 'Heaps & priority queues',
  emoji: '⛰️',
  color: '#fb923c',
  order: 12,
  blurb: 'Always grab the smallest (or biggest) next: top-k, merging, running medians.',
  reels: [
    // ───────────────────────────── Lesson 1 ─────────────────────────────
    {
      id: 'dsa-heaps-how-a-heap-works',
      title: 'How a heap works: build one',
      link: { label: 'Solve it', href: '/dsa#/m/heaps/how-a-heap-works/heaps-build-min-heap' },
      beats: [
        {
          say: 'In an ER, the most urgent patient goes next. How fast can you find them?',
          emphasis: ['urgent'],
          scene: {
            type: 'title',
            kicker: 'Heaps · Lesson 1',
            title: 'Who sees the doctor *next*?',
            emoji: '🏥',
            style: 'slam',
          },
        },
        {
          say: 'Patients with urgency five, three, eight and one arrive. One is the most urgent, so pop hands it back first.',
          emphasis: ['pop', 'first'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Patients, by urgency',
            cells: [5, 3, 8, 1],
            found: [3],
            vars: { next: 1 },
            caption: 'a lower number is more urgent',
          },
        },
        {
          say: 'The easy way keeps a plain list. Every pop scans all of it to find the smallest.',
          emphasis: ['scans'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function popMin(list):
    m ← 0
    for i from 1 to n - 1:
        if list[i] < list[m]:
            m ← i
    remove list[m] and return it`,
            highlight: [3],
            note: { line: 3, text: 'scans everything, every pop', tone: 'warn' },
          },
        },
        {
          say: 'A hundred thousand patients means ten billion steps. Keeping it sorted just moves the cost to push.',
          emphasis: ['billion', 'push'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10B',
            label: 'steps for *100,000* patients',
            sub: 'O(n²): every pop scans all n',
            tone: 'bad',
          },
        },
        {
          say: 'But we only ever ask for the smallest. So keep just enough order, not a full sort.',
          emphasis: ['smallest', 'enough'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Only the *top* matters',
            emoji: '💡',
            style: 'slam',
          },
        },
        {
          say: 'A heap is a tree stored in an array. Every parent is smaller than its children, so the smallest sits on top.',
          emphasis: ['parent', 'top'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'A min-heap',
            root: heapTree([1, 3, 5, 4, 8, 9], { active: [0] }),
            caption: 'array: [1, 3, 5, 4, 8, 9]',
          },
        },
        {
          say: 'Push two. It goes in the next free spot at the end of the array, right under five.',
          emphasis: ['end'],
          sfx: 'pop',
          scene: {
            type: 'tree',
            title: 'push(2): sift up',
            root: heapTree([1, 3, 5, 4, 8, 9, 2], { active: [6] }),
            caption: '[1, 3, 5, 4, 8, 9, 2]',
          },
        },
        {
          say: 'Two is smaller than its parent, five, so they swap. One is smaller than two, so it stops.',
          emphasis: ['swap', 'stops'],
          scene: {
            type: 'tree',
            title: 'push(2): sift up',
            root: heapTree([1, 3, 2, 4, 8, 9, 5], { active: [2], good: [2] }),
            caption: '[1, 3, 2, 4, 8, 9, 5]',
          },
        },
        {
          say: 'Pop takes the top, one. The last value, five, jumps up to fill the hole.',
          emphasis: ['top', 'last'],
          scene: {
            type: 'tree',
            title: 'pop(): sift down',
            root: heapTree([5, 3, 2, 4, 8, 9], { active: [0] }),
            caption: 'pop returns 1',
          },
        },
        {
          say: 'Five swaps with its smaller child, two. Nine is bigger, so five stops. The heap is fixed.',
          emphasis: ['smaller', 'child'],
          sfx: 'success',
          scene: {
            type: 'tree',
            title: 'pop(): sift down',
            root: heapTree([2, 3, 5, 4, 8, 9], { active: [2], good: [2] }),
            caption: '[2, 3, 5, 4, 8, 9]',
          },
        },
        {
          say: 'In JavaScript, push adds at the end and swaps up. Each swap climbs one level, so it is O of log n.',
          speak:
            'In JavaScript, push adds at the end and swaps up. Each swap climbs one level, so it is oh of log n.',
          emphasis: ['level'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'MinHeap.js',
            code: `push(x) {
  const a = this.a;
  a.push(x);
  let i = a.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (a[p] <= a[i]) break;
    [a[i], a[p]] = [a[p], a[i]];
    i = p;
  }
}`,
            highlight: [[6, 8]],
            note: { line: 8, text: 'one level per swap: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for a heap when you need the smallest again and again, while new values keep arriving.',
          emphasis: ['again', 'arriving'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You need the *min* over and over', icon: '🔁' },
              { text: 'New values keep *arriving*', icon: '📥' },
              { text: 'Only once? A plain scan wins', icon: '👀' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is faking a heap: push, then sort the whole array. That is O of n log n on every push.',
          speak:
            'The trap is faking a heap: push, then sort the whole array. That is oh of n log n on every push.',
          emphasis: ['faking', 'every'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// a fake heap
function push(x) {
  a.push(x);
  a.sort((p, q) => p - q);
}`,
            errors: [4],
            note: { line: 4, text: 'O(n log n) on every push', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The top is seven, and its children are four and two. Sift down swaps seven with which one?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'The top is 7. Its children are 4 and 2. Sift-down swaps 7 with…',
            options: ['4, the left child', '2, the smaller child', 'Nobody, 7 stays'],
            answer: 1,
          },
        },
        {
          say: 'Always the smaller child, two. If four went up, it would sit above two and break the rule.',
          emphasis: ['smaller'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'The top is 7. Its children are 4 and 2. Sift-down swaps 7 with…',
            options: ['4, the left child', '2, the smaller child', 'Nobody, 7 stays'],
            answer: 1,
            reveal: true,
            explain: 'With 4 on top, 4 would sit above 2.',
          },
        },
        {
          say: 'Remember this. A heap keeps the smallest on top and fixes one path per change. Now tap solve it and build one yourself.',
          emphasis: ['top', 'path'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: [
              'A heap is an *array* read as a tree',
              'push sifts up, pop sifts down',
              'Both cost *O(log n)*',
            ],
            tagline: 'Now build one yourself.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 2 ─────────────────────────────
    {
      id: 'dsa-heaps-top-k',
      title: 'Top-k with a small heap',
      link: { label: 'Solve it', href: '/dsa#/m/heaps/top-k/heaps-kth-largest-stream' },
      beats: [
        {
          say: 'A top three leaderboard, millions of scores. Who decides who gets in?',
          emphasis: ['decides'],
          scene: {
            type: 'title',
            kicker: 'Heaps · Lesson 2',
            title: 'The leaderboard *bouncer*',
            emoji: '🏆',
            style: 'slam',
          },
        },
        {
          say: 'Eight scores stream in. After each one, report the third largest so far. At the end, that is eight.',
          emphasis: ['third', 'eight'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Scores, one at a time',
            cells: scores,
            found: [2, 6, 7],
            vars: { k: 3, '3rd': 8 },
            caption: 'report the 3rd largest after each',
          },
        },
        {
          say: 'The easy way sorts every score, every time. After a million scores, each add sorts a million values.',
          emphasis: ['million'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function add(x):
    append x to all
    sort all from big to small
    return all[k - 1]`,
            highlight: [3],
            note: { line: 3, text: 'O(n log n) on every add', tone: 'bad' },
          },
        },
        {
          say: 'But two and three are already out of the top three. Scores only get added, so they can never win again.',
          emphasis: ['never'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: scores,
            pointers: { i: 4 },
            found: [0, 1, 2],
            reads: [3, 4],
            caption: 'out of the top 3 means out forever',
          },
        },
        {
          say: 'So keep only k scores in a min-heap. Its top, the weakest winner, is the bouncer at the door.',
          emphasis: ['min-heap', 'bouncer'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Keep a *min*-heap of size k',
            emoji: '💡',
            style: 'slam',
          },
        },
        {
          say: 'Push four, five and eight. The heap is full, and its top, four, is the third largest.',
          emphasis: ['top', 'four'],
          scene: {
            type: 'array',
            title: 'Top 3 with a min-heap',
            cells: scores,
            pointers: { i: 2, top: 0 },
            found: [0, 1, 2],
            vars: { heap: '4, 5, 8', '3rd': 4 },
          },
        },
        {
          say: 'Two and three are smaller than the bouncer. Each one is pushed, then popped right away.',
          emphasis: ['popped'],
          scene: {
            type: 'array',
            title: 'Top 3 with a min-heap',
            cells: scores,
            pointers: { i: 4, top: 0 },
            active: [4],
            found: [0, 1, 2],
            done: [3],
            vars: { heap: '4, 5, 8', '3rd': 4 },
          },
        },
        {
          say: 'Five beats four. Push five, pop four, and the other five becomes the new bouncer.',
          emphasis: ['bouncer'],
          scene: {
            type: 'array',
            title: 'Top 3 with a min-heap',
            cells: scores,
            pointers: { i: 5, top: 1 },
            active: [5],
            found: [1, 2],
            done: [0, 3, 4],
            vars: { heap: '5, 5, 8', '3rd': 5 },
          },
        },
        {
          say: 'Ten kicks out one five. The other five is on top now, so the answer stays five.',
          emphasis: ['stays'],
          scene: {
            type: 'array',
            title: 'Top 3 with a min-heap',
            cells: scores,
            pointers: { i: 6, top: 5 },
            active: [6],
            found: [2, 5],
            done: [0, 1, 3, 4],
            vars: { heap: '5, 8, 10', '3rd': 5 },
          },
        },
        {
          say: 'Nine kicks out the last five. Now eight is on top, so the third largest is eight.',
          emphasis: ['eight'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Top 3 with a min-heap',
            cells: scores,
            pointers: { i: 7, top: 2 },
            found: [2, 6, 7],
            done: [0, 1, 3, 4, 5],
            vars: { heap: '8, 9, 10', '3rd': 8 },
          },
        },
        {
          say: 'In JavaScript, push, and pop if the heap grows past k. Each step is O of log k.',
          speak: 'In JavaScript, push, and pop if the heap grows past k. Each step is oh of log k.',
          emphasis: ['past'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'kthLargest.js',
            code: `function kthLargest(items, k) {
  const h = new Heap((a, b) => a - b);
  for (const x of items) {
    h.push(x);
    if (h.size() > k) h.pop();
  }
  return h.peek();
}`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'O(n log k) in total', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you need the top k, or a rank from a stream, and k is small.',
          emphasis: ['top', 'rank'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You need the *top k* of something', icon: '🏆' },
              { text: 'A stream reports a *rank*', icon: '📈' },
              { text: 'k is tiny, n is huge', icon: '🐜' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is grabbing a max-heap for the k largest. It only works if you store every single value.',
          emphasis: ['max-heap', 'every'],
          sfx: 'error',
          scene: {
            type: 'compare',
            title: 'k largest: which heap?',
            left: {
              title: 'Max-heap of all',
              verdict: 'bad',
              items: ['Stores every value', 'Fails on endless streams'],
            },
            right: {
              title: 'Min-heap of k',
              verdict: 'ok',
              items: ['Holds only k values', 'Top is the one to kick'],
            },
          },
        },
        {
          say: 'Quick check. You want the five largest of a billion numbers. Which heap do you keep?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'The 5 largest of a billion numbers. Which heap do you keep?',
            options: ['A max-heap of everything', 'A min-heap of size 5', 'A max-heap of size 5'],
            answer: 1,
          },
        },
        {
          say: 'A min-heap of size five. Its top is the weakest winner, the one you kick out.',
          emphasis: ['weakest'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'The 5 largest of a billion numbers. Which heap do you keep?',
            options: ['A max-heap of everything', 'A min-heap of size 5', 'A max-heap of size 5'],
            answer: 1,
            reveal: true,
            explain: 'It never holds more than 6 values.',
          },
        },
        {
          say: 'Remember this. Push, and pop when the heap passes k. Its top is the kth largest. Now tap solve it and try it yourself.',
          emphasis: ['pop', 'top'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: [
              'Push, then pop if *size > k*',
              'k largest needs a *min*-heap',
              'O(n log k), and it streams',
            ],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 3 ─────────────────────────────
    {
      id: 'dsa-heaps-k-way-merge',
      title: 'K-way merge: a heap of fronts',
      link: { label: 'Solve it', href: '/dsa#/m/heaps/k-way-merge/heaps-merge-k-sorted' },
      beats: [
        {
          say: 'Three servers, three sorted log files. How do you get one timeline?',
          emphasis: ['one', 'timeline'],
          scene: {
            type: 'title',
            kicker: 'Heaps · Lesson 3',
            title: 'Merge *k* sorted lists',
            emoji: '🗂️',
            style: 'slam',
          },
        },
        {
          say: 'Three sorted lists: A, B and C. Merged, they should read one, two, three, four, five, nine.',
          emphasis: ['sorted'],
          sfx: 'pop',
          scene: {
            type: 'grid',
            title: 'Three sorted lists',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            vars: { out: '1,2,3,4,5,9' },
            caption: 'merge them into one sorted list',
          },
        },
        {
          say: 'The easy way glues everything together and sorts it. That ignores that each list is already sorted.',
          emphasis: ['already'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function mergeK(lists):
    all ← empty list
    for each list in lists:
        append every value to all
    sort all
    return all`,
            highlight: [5],
            note: { line: 5, text: 'O(N log N), all in memory', tone: 'warn' },
          },
        },
        {
          say: 'Or scan every front for the smallest. But after you take one, only one front changed, yet you check them all again.',
          emphasis: ['one', 'all'],
          scene: {
            type: 'grid',
            title: 'Spot the waste',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            active: [[0, 1]],
            reads: [
              [1, 0],
              [2, 0],
            ],
            done: [[0, 0]],
            caption: 'only the front of A changed',
          },
        },
        {
          say: 'So keep just the fronts in a min-heap. Pop the smallest, then push the next value from the same list.',
          emphasis: ['fronts', 'same'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Put the *fronts* in a min-heap',
            emoji: '💡',
            style: 'slam',
          },
        },
        {
          say: 'Start with the front of each list. One, two and five go into the heap.',
          emphasis: ['front'],
          scene: {
            type: 'grid',
            title: 'Merge with a heap',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            reads: [
              [0, 0],
              [1, 0],
              [2, 0],
            ],
            vars: { heap: '1, 2, 5', out: '—' },
          },
        },
        {
          say: 'Pop the smallest, one. It came from A, so push the next value from A, four.',
          emphasis: ['one', 'four'],
          scene: {
            type: 'grid',
            title: 'Merge with a heap',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            active: [[0, 0]],
            reads: [
              [0, 1],
              [1, 0],
              [2, 0],
            ],
            vars: { heap: '2, 4, 5', out: '1' },
          },
        },
        {
          say: 'Pop two, from B. Then push the next value from B, three.',
          emphasis: ['two', 'three'],
          scene: {
            type: 'grid',
            title: 'Merge with a heap',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            active: [[1, 0]],
            reads: [
              [0, 1],
              [1, 1],
              [2, 0],
            ],
            done: [[0, 0]],
            vars: { heap: '3, 4, 5', out: '1, 2' },
          },
        },
        {
          say: 'Pop three. B has nothing left, so nothing goes in, and the heap shrinks.',
          emphasis: ['nothing', 'shrinks'],
          scene: {
            type: 'grid',
            title: 'Merge with a heap',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            active: [[1, 1]],
            reads: [
              [0, 1],
              [2, 0],
            ],
            done: [
              [0, 0],
              [1, 0],
            ],
            vars: { heap: '4, 5', out: '1, 2, 3' },
          },
        },
        {
          say: 'Four, five and nine come out the same way. The heap never held more than three values.',
          emphasis: ['three'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Merge with a heap',
            rowLabels: ['A', 'B', 'C'],
            cells: lists,
            found: [
              [0, 0],
              [0, 1],
              [0, 2],
              [1, 0],
              [1, 1],
              [2, 0],
            ],
            vars: { heap: 'empty', out: '1,2,3,4,5,9' },
          },
        },
        {
          say: 'In JavaScript, tag each value with its list and spot. Pop, then push the next one from that list. Each step is O of log k.',
          speak:
            'In JavaScript, tag each value with its list and spot. Pop, then push the next one from that list. Each step is oh of log k.',
          emphasis: ['tag', 'next'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'mergeK.js',
            code: `// h: min-heap of [value, list, pos]
// starts with the front of each list
const out = [];
while (!h.isEmpty()) {
  const [v, i, j] = h.pop();
  out.push(v);
  const next = lists[i][j + 1];
  if (next !== undefined) {
    h.push([next, i, j + 1]);
  }
}
return out;`,
            highlight: [5, 9],
            note: { line: 9, text: 'k items in the heap: O(log k)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when you get several sorted lists, or need the smallest across sorted things.',
          emphasis: ['sorted'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: '*k sorted* lists or streams', icon: '📚' },
              { text: 'Smallest across sorted things', icon: '🔍' },
              { text: 'Each grid row is *sorted*', icon: '🧮' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is storing only values. When four pops out, you cannot tell which list to move forward.',
          emphasis: ['only', 'which'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `h.push(lists[i][0]);
// 4 pops out... from which list?
h.push([lists[i][0], i, 0]);
// tagged: [value, list, pos]`,
            errors: [1],
            added: [3],
            note: { line: 1, text: 'a bare value has no address', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Eight sorted lists, a million values in total. How big does the heap get?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '8 sorted lists, a million values in total. How big does the heap get?',
            options: ['8 items at most', '1,000,000 items', 'About 20 items'],
            answer: 0,
          },
        },
        {
          say: 'Eight items at most. The heap holds one front per list, never more.',
          emphasis: ['one', 'front'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '8 sorted lists, a million values in total. How big does the heap get?',
            options: ['8 items at most', '1,000,000 items', 'About 20 items'],
            answer: 0,
            reveal: true,
            explain: 'One front per list, so never more than 8.',
          },
        },
        {
          say: 'Remember this. Keep one front per list in a min-heap, and refill from the list you popped. Now tap solve it and try it yourself.',
          emphasis: ['front', 'refill'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: [
              'Heap holds one *front* per list',
              'Pop, then push from the *same* list',
              'O(N log k), only k in memory',
            ],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 4 ─────────────────────────────
    {
      id: 'dsa-heaps-two-heaps',
      title: 'Two heaps: the running median',
      link: { label: 'Solve it', href: '/dsa#/m/heaps/two-heaps/heaps-median-finder' },
      beats: [
        {
          say: 'Delivery apps show the median time, not the average. Why, and how?',
          emphasis: ['median'],
          scene: {
            type: 'title',
            kicker: 'Heaps · Lesson 4',
            title: 'The *running* median',
            emoji: '🛵',
            style: 'slam',
          },
        },
        {
          say: 'One slow order wrecks an average, but not the median. After each new time, show the middle value.',
          emphasis: ['middle'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Delivery times',
            cells: [5, 15, 1, 3, 8],
            vars: { medians: '5, 10, 5, 4, 5' },
            caption: 'the median after each new time',
          },
        },
        {
          say: 'The easy way keeps one sorted list. The median is instant, but every insert shifts values over.',
          emphasis: ['shifts'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function addNum(x):
    insert x in sorted order

function findMedian():
    m ← floor(n / 2)
    if n is odd:
        return list[m]
    return (list[m - 1] + list[m]) / 2`,
            highlight: [2],
            note: { line: 2, text: 'shifts up to n values: O(n)', tone: 'bad' },
          },
        },
        {
          say: 'But you only ever read the middle. Nobody cares where one and fifteen sit, just which side they are on.',
          emphasis: ['middle', 'side'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: [1, 3, 5, 8, 15],
            found: [2],
            done: [0, 4],
            caption: 'only the middle is ever read',
          },
        },
        {
          say: 'So put the low half in a max-heap, and the high half in a min-heap. Their two tops are the middle.',
          emphasis: ['max-heap', 'min-heap'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Two halves, two *heaps*',
            emoji: '💡',
            style: 'slam',
          },
        },
        {
          say: 'Five goes low, and fifteen ends up high. Same size, so the median is their average, ten.',
          emphasis: ['average', 'ten'],
          scene: {
            type: 'grid',
            title: 'Low half, high half',
            rowLabels: ['low', 'high'],
            cells: [
              [5, '', ''],
              [15, '', ''],
            ],
            found: [
              [0, 0],
              [1, 0],
            ],
            vars: { add: 15, median: 10 },
          },
        },
        {
          say: 'One goes low. Now low has one extra, so the median is just its top, five.',
          emphasis: ['extra', 'five'],
          scene: {
            type: 'grid',
            title: 'Low half, high half',
            rowLabels: ['low', 'high'],
            cells: [
              [5, 1, ''],
              [15, '', ''],
            ],
            active: [[0, 1]],
            found: [[0, 0]],
            vars: { add: 1, median: 5 },
          },
        },
        {
          say: 'Three arrives. Every new number goes into low first, and the biggest value in low sits on top.',
          emphasis: ['low', 'first'],
          scene: {
            type: 'grid',
            title: 'Low half, high half',
            rowLabels: ['low', 'high'],
            cells: [
              [5, 1, 3],
              [15, '', ''],
            ],
            active: [[0, 2]],
            vars: { add: 3, median: '?' },
          },
        },
        {
          say: 'Low hands its top, five, up to high. Now the tops are three and five, so the median is four.',
          emphasis: ['hands', 'four'],
          scene: {
            type: 'grid',
            title: 'Low half, high half',
            rowLabels: ['low', 'high'],
            cells: [
              [3, 1, ''],
              [5, 15, ''],
            ],
            active: [[1, 0]],
            found: [[0, 0]],
            vars: { add: 3, median: 4 },
          },
        },
        {
          say: 'Eight ends up high, so high has an extra, and five slides back to low. The median is five.',
          emphasis: ['slides', 'five'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Low half, high half',
            rowLabels: ['low', 'high'],
            cells: [
              [5, 1, 3],
              [8, 15, ''],
            ],
            found: [[0, 0]],
            vars: { add: 8, median: 5 },
          },
        },
        {
          say: 'In JavaScript, a new number goes low, low gives its top to high, then you rebalance. Each add is O of log n.',
          speak:
            'In JavaScript, a new number goes low, low gives its top to high, then you rebalance. Each add is oh of log n.',
          emphasis: ['rebalance'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'median.js',
            code: `const lo = new Heap((a, b) => b - a);
const hi = new Heap((a, b) => a - b);
function addNum(x) {
  lo.push(x);
  hi.push(lo.pop());
  if (hi.size() > lo.size())
    lo.push(hi.pop());
}

function median() {
  if (lo.size() > hi.size())
    return lo.peek();
  return (lo.peek() + hi.peek()) / 2;
}`,
            highlight: [[4, 7]],
            note: { line: 7, text: 'each add: O(log n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for two heaps when you need a median, or any line between a small half and a big half.',
          emphasis: ['median', 'half'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'You need a *median* or middle', icon: '🎯' },
              { text: 'Numbers arrive as a *stream*', icon: '🌊' },
              { text: 'A small half and a *big half*', icon: '⚖️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is a minus b on both heaps. Then the top of low is its smallest, and the median comes out wrong.',
          emphasis: ['both', 'wrong'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// wrong: low is a min-heap
const lo = new Heap((a, b) => a - b);
// right: biggest small value on top
const lo = new Heap((a, b) => b - a);`,
            errors: [2],
            added: [4],
            note: { line: 2, text: 'its top is the smallest', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Low holds five, three and one. High holds eight and fifteen. What is the median?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Low holds 5, 3, 1. High holds 8, 15. What is the median?',
            options: ['5', '6.5', '8'],
            answer: 0,
          },
        },
        {
          say: 'It is five. Low has one extra, so the median is simply the top of low.',
          emphasis: ['five', 'extra'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Low holds 5, 3, 1. High holds 8, 15. What is the median?',
            options: ['5', '6.5', '8'],
            answer: 0,
            reveal: true,
            explain: 'Five values: the middle is low’s top.',
          },
        },
        {
          say: 'Remember this. Max-heap for the low half, min-heap for the high half, and rebalance every time. Now tap solve it and try it yourself.',
          emphasis: ['rebalance'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: [
              'Low half: a *max*-heap',
              'High half: a *min*-heap',
              'Rebalance after *every* add',
            ],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },

    // ───────────────────────────── Lesson 5 ─────────────────────────────
    {
      id: 'dsa-heaps-scheduling',
      title: 'Scheduling with a heap',
      link: { label: 'Solve it', href: '/dsa#/m/heaps/scheduling/heaps-meeting-rooms' },
      beats: [
        {
          say: 'Planes hold gates all day. What is the fewest gates an airport needs?',
          emphasis: ['fewest'],
          scene: {
            type: 'title',
            kicker: 'Heaps · Lesson 5',
            title: 'How many *gates*?',
            emoji: '✈️',
            style: 'slam',
          },
        },
        {
          say: 'Here are four meetings, each holding a room from start to end. They fit in just two rooms.',
          emphasis: ['two', 'rooms'],
          sfx: 'pop',
          scene: {
            type: 'intervals',
            title: 'Four meetings',
            axis: [0, 7],
            bars: [
              { ...mC, tone: 'good' },
              { ...mA, tone: 'info' },
              { ...mD, tone: 'good' },
              { ...mB, tone: 'good' },
            ],
            vars: { rooms: 2 },
            caption: 'one colour per room',
          },
        },
        {
          say: 'The easy way goes to each meeting start, and counts every other meeting still running.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function minRooms(meetings):
    best ← 0
    for each m in meetings:
        busy ← 0
        for each o in meetings:
            if o.start ≤ m.start < o.end:
                busy ← busy + 1
        best ← max(best, busy)
    return best`,
            highlight: [[3, 5]],
            note: { line: 5, text: 'a loop inside a loop', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared. A hundred thousand meetings means ten billion checks.',
          speak: 'That is oh of n squared. A hundred thousand meetings means ten billion checks.',
          emphasis: ['squared', 'billion'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '10B',
            label: 'checks for *100,000* meetings',
            sub: 'O(n²): every start rechecks all',
            tone: 'bad',
          },
        },
        {
          say: 'Sort by start time. Keep a min-heap of end times, one per busy room. Its top frees up first.',
          emphasis: ['end', 'first'],
          sfx: 'ding',
          scene: {
            type: 'title',
            kicker: 'The insight',
            title: 'Watch the room that *ends first*',
            emoji: '💡',
            style: 'slam',
          },
        },
        {
          say: 'First, sort the meetings by their start time. No rooms are open yet.',
          emphasis: ['start'],
          scene: {
            type: 'intervals',
            title: 'Rooms, by start time',
            axis: [0, 7],
            bars: [mA, mB, mC, mD].map((m) => ({ ...m, dim: true })),
            vars: { ends: 'empty', rooms: 0 },
          },
        },
        {
          say: 'At time zero, no room is free, so open one and push its end time, six.',
          emphasis: ['six'],
          scene: {
            type: 'intervals',
            title: 'Rooms, by start time',
            axis: [0, 7],
            bars: [
              { ...mA, tone: 'info', active: true },
              { ...mB, dim: true },
              { ...mC, dim: true },
              { ...mD, dim: true },
            ],
            marker: 0,
            vars: { ends: '6', rooms: 1 },
          },
        },
        {
          say: 'At one, the earliest end is six. Nothing is free, so open a second room and push two.',
          emphasis: ['second'],
          scene: {
            type: 'intervals',
            title: 'Rooms, by start time',
            axis: [0, 7],
            bars: [
              { ...mA, tone: 'info' },
              { ...mB, tone: 'good', active: true },
              { ...mC, dim: true },
              { ...mD, dim: true },
            ],
            marker: 1,
            vars: { ends: '2, 6', rooms: 2 },
          },
        },
        {
          say: 'At three, the earliest end is two, so that room is free. Pop two, push four. Still two rooms.',
          emphasis: ['free'],
          scene: {
            type: 'intervals',
            title: 'Rooms, by start time',
            axis: [0, 7],
            bars: [
              { ...mA, tone: 'info' },
              { ...mB, tone: 'good' },
              { ...mC, tone: 'good', active: true },
              { ...mD, dim: true },
            ],
            marker: 3,
            vars: { ends: '4, 6', rooms: 2 },
          },
        },
        {
          say: 'At five, four has ended. Pop it, push seven. The size of the heap, two, is the answer.',
          emphasis: ['size', 'two'],
          sfx: 'success',
          scene: {
            type: 'intervals',
            title: 'Rooms, by start time',
            axis: [0, 7],
            bars: [
              { ...mA, tone: 'info' },
              { ...mB, tone: 'good' },
              { ...mC, tone: 'good' },
              { ...mD, tone: 'good', active: true },
            ],
            marker: 5,
            vars: { ends: '6, 7', rooms: 2 },
          },
        },
        {
          say: 'In JavaScript, sort, then peek. If that room is free, pop it, then push the new end. That is O of n log n.',
          speak:
            'In JavaScript, sort, then peek. If that room is free, pop it, then push the new end. That is oh of n log n.',
          emphasis: ['peek', 'free'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'minRooms.js',
            code: `function minRooms(list) {
  list.sort((a, b) => a[0] - b[0]);
  // min-heap of end times
  const h = new Heap((a, b) => a - b);
  for (const [start, end] of list) {
    if (h.size() && h.peek() <= start)
      h.pop(); // that room is free
    h.push(end);
  }
  return h.size();
}`,
            highlight: [[6, 7]],
            note: { line: 7, text: 'the earliest end frees first', tone: 'good' },
          },
        },
        {
          say: 'Reach for this with rooms, gates or servers, where things free up over time and you keep asking who goes next.',
          emphasis: ['time', 'next'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Rooms, gates, servers, CPUs', icon: '🏢' },
              { text: 'Things free up *over time*', icon: '⏱️' },
              { text: '“Who goes *next*?” again and again', icon: '🔁' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap is using less than. A meeting that ends at five frees its room for one that starts at five.',
          emphasis: ['less', 'five'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// meetings [1, 5] then [5, 8]
if (h.peek() < start) h.pop();
// 2 rooms: wrong
if (h.peek() <= start) h.pop();
// 1 room: free at 5, reused at 5`,
            errors: [2],
            added: [4],
            note: { line: 2, text: 'keeps a free room busy', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. In the meeting rooms heap, what does each item stand for?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'In the meeting-rooms heap, what does each item stand for?',
            options: ['A meeting start time', 'A busy room, by its end', 'The number of rooms'],
            answer: 1,
          },
        },
        {
          say: 'Each item is a busy room, keyed by when it frees up. The top is the only one worth checking.',
          emphasis: ['busy', 'room'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'In the meeting-rooms heap, what does each item stand for?',
            options: ['A meeting start time', 'A busy room, by its end', 'The number of rooms'],
            answer: 1,
            reveal: true,
            explain: 'One item per busy room. The top frees first.',
          },
        },
        {
          say: 'Remember this. Sort by time, keep busy rooms in a heap, and always check the top. Now tap solve it and try it yourself.',
          emphasis: ['time', 'top'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: [
              'Sort by *start* time',
              'Min-heap of *end times*',
              'Its final size is the answer',
            ],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
