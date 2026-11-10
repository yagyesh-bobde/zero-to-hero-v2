import type { DiagramEdge, DiagramNode, DiagramScene, Series } from '../types';

// /dsa/reels module 7. One reel per lesson of src/dsa/modules/07-linked-lists*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.
// A linked list is a row of `pill` nodes in a `diagram`, one empty column between nodes so every
// arrow has room. Pointers (a, b, slow, fast…) are small pills on the row above or below, on a coloured stem.

const pill = (id: string, label: string, x: number, y: number, extra: Partial<DiagramNode> = {}): DiagramNode => ({
  id,
  label,
  x,
  y,
  shape: 'pill',
  ...extra,
});
const ptr = (id: string, label: string, x: number, y: number, extra: Partial<DiagramNode> = {}): DiagramNode =>
  pill(id, label, x, y, { tone: 'warn', ...extra });
const link = (from: string, to: string, extra: Partial<DiagramEdge> = {}): DiagramEdge => ({ from, to, ...extra });
const aim = (from: string, to: string): DiagramEdge => ({ from, to, tone: 'warn', dashed: true });

// ── Lesson 1: merge a = 1 → 3 → 5 with b = 2 → 3 → 6 ─────────────────────────────────────────
// List a on row 1, list b on row 2, staggered so the merged list is a zigzag between them.
// Pointer a sits above its head, pointer b below its head, the dummy D on the left.
const MERGE_X = { a1: 2, b2: 3, a3: 4, b3: 5, a5: 6, b6: 7 } as const;
type MergeId = keyof typeof MERGE_X;
const MERGE_ORDER: MergeId[] = ['a1', 'b2', 'a3', 'b3', 'a5', 'b6'];

function merge(opts: {
  dummy: boolean;
  merged: number; // how many nodes are linked into the answer so far
  a: MergeId | null; // current head of a (null = ran out)
  b: MergeId | null;
  old: [MergeId, MergeId][]; // original links still in place
  fresh?: number; // how many of the newest answer links glow
  caption: string;
  done?: boolean;
}): DiagramScene {
  const inAnswer = MERGE_ORDER.slice(0, opts.merged);
  const tail = opts.merged ? inAnswer[opts.merged - 1] : 'd';
  const label = (id: MergeId) => id.slice(1);
  const nodes: DiagramNode[] = [];
  if (opts.dummy) nodes.push(pill('d', 'D', 0, 1.5, { tone: 'muted', active: tail === 'd' }));
  for (const id of MERGE_ORDER) {
    const row = id.startsWith('a') ? 1 : 2;
    const merged = inAnswer.includes(id);
    nodes.push(pill(id, label(id), MERGE_X[id], row, merged ? { tone: 'good', active: id === tail && !opts.done } : {}));
  }
  nodes.push(ptr('pa', 'a', opts.a ? MERGE_X[opts.a] : 6, 0, { dim: !opts.a }));
  nodes.push(ptr('pb', 'b', opts.b ? MERGE_X[opts.b] : 7, 3, { dim: !opts.b }));
  const chain = opts.dummy ? ['d', ...inAnswer] : [];
  const fresh = opts.fresh ?? 1;
  const edges: DiagramEdge[] = [];
  for (let i = 1; i < chain.length; i++) {
    edges.push(link(chain[i - 1], chain[i], { tone: 'good', active: !opts.done && i > chain.length - 1 - fresh }));
  }
  for (const [from, to] of opts.old) edges.push(link(from, to));
  if (opts.a) edges.push(aim('pa', opts.a));
  if (opts.b) edges.push(aim('pb', opts.b));
  return { type: 'diagram', title: 'Merge two sorted lists', cols: 8, rows: 4, nodes, edges, caption: opts.caption };
}

// ── Lesson 2: 1 → 2 → 3 → 4 → 5 → 6, and 6 links back to 3 ──────────────────────────────────
// A tail (1, 2) into a diamond-shaped loop (3, 4, 5, 6). The tortoise (slow) rides above its
// node, the hare (fast) below.
const RING: Record<number, [number, number]> = { 1: [0, 2], 2: [2, 2], 3: [4, 2], 4: [6, 1], 5: [8, 2], 6: [6, 3] };
const RING_LINKS: [number, number][] = [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];

function ring(opts: { title: string; slow?: number; fast?: number; meet?: boolean; loopTone?: 'bad'; caption: string }): DiagramScene {
  const nodes: DiagramNode[] = Object.entries(RING).map(([v, [x, y]]) => {
    const n = Number(v);
    const met = opts.meet && n === opts.slow;
    return pill(`n${v}`, v, x, y, met ? { tone: 'good', active: true } : { active: !opts.meet && n === opts.slow });
  });
  const edges: DiagramEdge[] = RING_LINKS.map(([a, b]) =>
    link(`n${a}`, `n${b}`, a === 6 && opts.loopTone ? { tone: opts.loopTone, active: true } : {}),
  );
  if (opts.slow) {
    const [x, y] = RING[opts.slow];
    nodes.push(ptr('slow', '🐢', x, y - 1));
    edges.push(aim('slow', `n${opts.slow}`));
  }
  if (opts.fast) {
    const [x, y] = RING[opts.fast];
    nodes.push(ptr('fast', '🐇', x, y + 1, { tone: 'info' }));
    edges.push({ ...aim('fast', `n${opts.fast}`), tone: 'info' });
  }
  return { type: 'diagram', title: opts.title, cols: 9, rows: 4, nodes, edges, caption: opts.caption };
}

// ── Lesson 3: reverse 1 → 2 → 3 → 4 ───────────────────────────────────────────────────────────
// One row of nodes; prev / curr / nxt are pointer pills on the row below. `flipped` nodes point back.
// Nodes sit 1.8 cells apart (not 2) so each cell, and the `prev` pill in it, is a little wider.
const REV_STEP = 1.8;
function reverse(opts: { flipped: number; prev?: number; curr?: number; nxt?: number; caption: string; done?: boolean }): DiagramScene {
  const nodes: DiagramNode[] = [1, 2, 3, 4].map((v) =>
    pill(`r${v}`, String(v), (v - 1) * REV_STEP, 0, {
      tone: v <= opts.flipped ? 'good' : undefined,
      active: opts.done ? v === 4 : v === opts.curr,
    }),
  );
  const edges: DiagramEdge[] = [];
  for (let v = 1; v <= 4; v++) {
    if (v <= opts.flipped) {
      if (v > 1) edges.push(link(`r${v}`, `r${v - 1}`, { tone: 'good', active: v === opts.flipped }));
    } else if (v < 4) edges.push(link(`r${v}`, `r${v + 1}`));
  }
  const pointers: [string, number | undefined][] = [['prev', opts.prev], ['curr', opts.curr], ['nxt', opts.nxt]];
  for (const [name, at] of pointers) {
    if (!at) continue;
    nodes.push(ptr(name, name, (at - 1) * REV_STEP, 1, { tone: name === 'curr' ? 'warn' : name === 'prev' ? 'good' : 'info' }));
    edges.push({ ...aim(name, `r${at}`), tone: name === 'curr' ? 'warn' : name === 'prev' ? 'good' : 'info' });
  }
  return { type: 'diagram', title: 'Flip one arrow per step', cols: 3 * REV_STEP + 1, rows: 2, nodes, edges, caption: opts.caption };
}

// ── Lesson 4: DJ mode on 1 → 2 → 3 → 4 → 5 → 6 ────────────────────────────────────────────────
// The list folds into a U: 1 2 3 along the top, 4 5 6 back along the bottom (6 under 1), so the
// final weave 1 → 6 → 2 → 5 → 3 → 4 is a zigzag. Pointers ride above the top row / below the bottom.
const FOLD: Record<number, [number, number]> = { 1: [0, 1], 2: [2, 1], 3: [4, 1], 4: [5, 2], 5: [3, 2], 6: [1, 2] };

function fold(opts: {
  links: [number, number][];
  good?: [number, number][]; // links drawn green (new)
  fresh?: [number, number][]; // links that glow (this step)
  doneNodes?: number[];
  active?: number;
  top?: [string, string, number]; // [id, label, node]
  bottom?: [string, string, number];
  caption: string;
}): DiagramScene {
  const nodes: DiagramNode[] = Object.entries(FOLD).map(([v, [x, y]]) =>
    pill(`f${v}`, v, x, y, { tone: opts.doneNodes?.includes(Number(v)) ? 'good' : undefined, active: Number(v) === opts.active }),
  );
  const has = (list: [number, number][] | undefined, a: number, b: number) => !!list?.some(([p, q]) => p === a && q === b);
  const edges: DiagramEdge[] = opts.links.map(([a, b]) =>
    link(`f${a}`, `f${b}`, has(opts.good, a, b) ? { tone: 'good', active: has(opts.fresh, a, b) } : {}),
  );
  if (opts.top) {
    const [id, label, at] = opts.top;
    nodes.push(ptr(id, label, FOLD[at][0], 0));
    edges.push(aim(id, `f${at}`));
  }
  if (opts.bottom) {
    const [id, label, at] = opts.bottom;
    nodes.push(ptr(id, label, FOLD[at][0], 3, { tone: 'info' }));
    edges.push({ ...aim(id, `f${at}`), tone: 'info' });
  }
  return { type: 'diagram', title: 'DJ mode, in place', cols: 6, rows: 4, nodes, edges, caption: opts.caption };
}

// ── Lesson 5: 342 + 465, digits ones first ────────────────────────────────────────────────────
// Row 0: the carry, written above its column like at school. Rows 1-3: a, b and the sum.
const ADD_A = [2, 4, 3];
const ADD_B = [5, 6, 4];
const ADD_SUM = [7, 0, 8];

function addition(opts: { written: number; reading?: number; carryAt?: number; done?: boolean; caption: string }): DiagramScene {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  // While adding, only the current column stays bright.
  const read = (i: number) => ({ dim: opts.reading !== undefined && i !== opts.reading });
  ADD_A.forEach((d, i) => nodes.push(pill(`a${i}`, String(d), i * 2, 1, read(i))));
  ADD_B.forEach((d, i) => nodes.push(pill(`b${i}`, String(d), i * 2, 2, read(i))));
  for (let i = 1; i < 3; i++) {
    edges.push(link(`a${i - 1}`, `a${i}`));
    edges.push(link(`b${i - 1}`, `b${i}`));
  }
  for (let i = 0; i < opts.written; i++) {
    const last = i === opts.written - 1;
    nodes.push(pill(`s${i}`, String(ADD_SUM[i]), i * 2, 3, { tone: 'good', active: last && !opts.done }));
    if (i > 0) edges.push(link(`s${i - 1}`, `s${i}`, { tone: 'good', active: last && !opts.done }));
  }
  if (opts.carryAt !== undefined) {
    nodes.push(ptr('carry', '+1', opts.carryAt * 2, 0));
  }
  return { type: 'diagram', title: '342 + 465, ones digit first', cols: 5, rows: 4, nodes, edges, caption: opts.caption };
}

// ── Lesson 6: an LRU cache of size 2 ──────────────────────────────────────────────────────────
// head ⇄ newest ⇄ oldest ⇄ tail on row 1; the map's key pills sit above their nodes (row 0);
// an evicted node drops to row 2 and fades.
function lru(opts: { newest: number; oldest: number; evicted?: number; fresh?: number; caption: string }): DiagramScene {
  const nodes: DiagramNode[] = [
    pill('head', 'H', 0, 1, { tone: 'muted' }),
    pill('tail', 'T', 6, 1, { tone: 'muted' }),
  ];
  const edges: DiagramEdge[] = [];
  const order = ['head', `p${opts.newest}`, `p${opts.oldest}`, 'tail'];
  for (const [k, x] of [[opts.newest, 2], [opts.oldest, 4]]) {
    nodes.push(pill(`p${k}`, String(k), x, 1, { active: k === opts.fresh }));
    nodes.push(pill(`k${k}`, `k${k}`, x, 0, { tone: 'info' }));
    edges.push({ ...aim(`k${k}`, `p${k}`), tone: 'info' });
  }
  for (let i = 1; i < order.length; i++) {
    const touchesFresh = order[i] === `p${opts.fresh}` || order[i - 1] === `p${opts.fresh}`;
    edges.push(link(order[i - 1], order[i], { both: true, ...(touchesFresh ? { tone: 'good' as const, active: true } : {}) }));
  }
  if (opts.evicted) nodes.push(pill(`p${opts.evicted}`, String(opts.evicted), 5, 2, { tone: 'bad', dim: true }));
  return { type: 'diagram', title: 'LRU cache, size 2', cols: 7, rows: 3, nodes, edges, caption: opts.caption };
}

export const series: Series = {
  id: 'dsa-linked-lists',
  title: 'Linked list techniques',
  emoji: '🔗',
  color: '#22d3ee',
  order: 7,
  blurb: 'Dummy nodes, fast/slow pointers and in-place reversal, fast.',
  reels: [
    {
      id: 'dsa-linked-lists-dummy-and-merge',
      title: 'The dummy node: merge and split lists',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/dummy-and-merge/linked-lists-merge-two-sorted' },
      beats: [
        {
          say: 'Two sorted playlists. Can you blend them without copying a single song?',
          emphasis: ['without', 'copying'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 1', title: 'Blend two lists, copy *nothing*', emoji: '🎧', style: 'slam' },
        },
        {
          say: 'List a is one, three, five. List b is two, three, six. Join them into one sorted list.',
          emphasis: ['one', 'sorted'],
          sfx: 'pop',
          scene: merge({
            dummy: false,
            merged: 0,
            a: 'a1',
            b: 'b2',
            old: [['a1', 'a3'], ['a3', 'a5'], ['b2', 'b3'], ['b3', 'b6']],
            caption: 'goal: 1 2 3 3 5 6, just re-link',
          }),
        },
        {
          say: 'The easy way dumps every value into an array, sorts it, and builds a brand new list.',
          emphasis: ['sorts'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function mergeBrute(a, b):
    values ← empty list
    for each node in a, then in b:
        append node.val to values
    sort values
    return a new list from values`,
            highlight: [5],
            note: { line: 5, text: 'sorts what was already sorted', tone: 'warn' },
          },
        },
        {
          say: 'For a million songs that is about twenty million steps, plus a full copy in memory.',
          emphasis: ['twenty', 'copy'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '20M',
            label: 'steps to merge *1M* songs',
            sub: 'O(n log n) time, O(n) extra memory',
            tone: 'bad',
          },
        },
        {
          say: 'Both lists are sorted, so the smallest is always at a head. And a fake first node keeps it simple.',
          emphasis: ['head', 'fake'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Compare heads, start from a *dummy*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'D is the dummy, a fake node that is not in the answer. The tail starts on it.',
          emphasis: ['dummy', 'tail'],
          sfx: 'pop',
          scene: merge({
            dummy: true,
            merged: 0,
            a: 'a1',
            b: 'b2',
            old: [['a1', 'a3'], ['a3', 'a5'], ['b2', 'b3'], ['b3', 'b6']],
            caption: 'tail is on D, the answer is empty',
          }),
        },
        {
          say: 'One beats two. Link one after the tail, move the tail, and move a forward.',
          emphasis: ['one'],
          scene: merge({
            dummy: true,
            merged: 1,
            a: 'a3',
            b: 'b2',
            old: [['a1', 'a3'], ['a3', 'a5'], ['b2', 'b3'], ['b3', 'b6']],
            caption: '1 < 2, so tail.next ← 1',
          }),
        },
        {
          say: 'Now two beats three. Same one line, even though two lives in the other list.',
          emphasis: ['same'],
          scene: merge({
            dummy: true,
            merged: 2,
            a: 'a3',
            b: 'b3',
            old: [['a3', 'a5'], ['b2', 'b3'], ['b3', 'b6']],
            caption: '2 < 3, so tail.next ← 2',
          }),
        },
        {
          say: 'Three ties three. Take a first, then b. The answer zigzags between the lists.',
          emphasis: ['zigzags'],
          scene: merge({
            dummy: true,
            merged: 4,
            a: 'a5',
            b: 'b6',
            old: [['b3', 'b6']],
            fresh: 2,
            caption: 'a tie: take a, then b',
          }),
        },
        {
          say: 'Take five. Now a is empty, so glue on the rest of b in one step.',
          emphasis: ['glue'],
          sfx: 'success',
          scene: merge({
            dummy: true,
            merged: 6,
            a: null,
            b: null,
            old: [],
            done: true,
            caption: 'return dummy.next: 1 2 3 3 5 6',
          }),
        },
        {
          say: 'In JavaScript, the dummy and the tail do all the work. One pass, so it is O of n.',
          speak: 'In JavaScript, the dummy and the tail do all the work. One pass, so it is oh of n.',
          emphasis: ['dummy', 'tail'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'mergeTwoLists.js',
            code: `function merge(a, b) {
  const dummy = new ListNode(0);
  let tail = dummy;
  while (a && b) {
    if (a.val <= b.val) {
      tail.next = a; a = a.next;
    } else {
      tail.next = b; b = b.next;
    }
    tail = tail.next;
  }
  tail.next = a ?? b;
  return dummy.next;
}`,
            highlight: [2, 13],
            note: { line: 13, text: 'one pass: O(n + m), O(1) space', tone: 'good' },
          },
        },
        {
          say: 'Reach for a dummy when the head might change, or when you build or split a list.',
          emphasis: ['head', 'change'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The *head* might change', icon: '🎯' },
              { text: 'You build a new list', icon: '🧱' },
              { text: 'You split one list in two', icon: '✂️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: reused nodes keep their old next. Forget to cut the last one and you build a loop.',
          emphasis: ['old', 'loop'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `for (const node of kept) {
  tail.next = node;
  tail = node;
}
// forgot: tail.next = null
return dummy.next;`,
            errors: [5],
            note: { line: 5, text: 'its old next can make a loop', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why do we return dummy dot next, and not the dummy?',
          speak: 'Quick check. Why do we return dummy dot next, and not the dummy?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why return dummy.next and not dummy?',
            options: ['The dummy is a fake node', 'dummy is null at the end', 'It runs faster'],
            answer: 0,
          },
        },
        {
          say: 'The dummy is fake. The real answer starts right after it.',
          emphasis: ['fake'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why return dummy.next and not dummy?',
            options: ['The dummy is a fake node', 'dummy is null at the end', 'It runs faster'],
            answer: 0,
            reveal: true,
            explain: 'D holds a made-up 0. The list starts at D.next.',
          },
        },
        {
          say: 'Remember this. If the head can change, start from a dummy, and cut the last link. Now tap solve it.',
          emphasis: ['dummy', 'cut'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Head might change? Use a *dummy*', 'Append with *tail.next*, then move tail', 'Cut the end: tail.next = null'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-linked-lists-fast-slow',
      title: 'Fast and slow pointers',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/fast-slow/linked-lists-cycle' },
      beats: [
        {
          say: 'Your crawler loops forever. Can it notice while remembering almost nothing?',
          emphasis: ['loops', 'nothing'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 2', title: 'Spot a loop, remember *nothing*', emoji: '🔁', style: 'slam' },
        },
        {
          say: 'Here is a list, one to six. But six links back to three, so it never ends.',
          emphasis: ['back', 'never'],
          sfx: 'pop',
          scene: ring({ title: 'Does this list loop?', loopTone: 'bad', caption: '6 links back to 3: a loop' }),
        },
        {
          say: 'The easy way remembers every node in a set. Seen one before? Then you are in a loop.',
          emphasis: ['every', 'set'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function hasCycle(head):
    seen ← empty set
    node ← head
    while node ≠ null:
        if node in seen: return true
        add node to seen
        node ← node.next
    return false`,
            highlight: [6],
            note: { line: 6, text: 'the set grows with the list', tone: 'warn' },
          },
        },
        {
          say: 'A crawler sees billions of pages. That is a billion nodes stored, just to answer yes or no.',
          emphasis: ['billion', 'yes'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1B',
            unit: 'nodes',
            label: 'stored to answer *yes or no*',
            sub: 'O(n) extra memory',
            tone: 'bad',
          },
        },
        {
          say: 'Send two runners instead. One moves one step, the other moves two. On a loop, the fast one laps the slow one.',
          emphasis: ['two', 'laps'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'The tortoise and the *hare*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Both start at the head. The tortoise is slow, one node a step. The hare is fast, two a step.',
          emphasis: ['slow', 'fast'],
          sfx: 'pop',
          scene: ring({ title: 'Slow 1 step, fast 2 steps', slow: 1, fast: 1, caption: 'both start on the head' }),
        },
        {
          say: 'Step one. The tortoise moves to two, and the hare jumps to three.',
          emphasis: ['two', 'three'],
          scene: ring({ title: 'Slow 1 step, fast 2 steps', slow: 2, fast: 3, caption: 'slow on 2, fast on 3' }),
        },
        {
          say: 'Step two. Tortoise on three, hare on five. No null yet, so keep going.',
          emphasis: ['five'],
          scene: ring({ title: 'Slow 1 step, fast 2 steps', slow: 3, fast: 5, caption: 'slow on 3, fast on 5' }),
        },
        {
          say: 'The hare goes to six, then back to three. It is now one node behind the tortoise.',
          emphasis: ['back', 'behind'],
          scene: ring({ title: 'Slow 1 step, fast 2 steps', slow: 4, fast: 3, caption: 'fast wraps 5, 6, 3: one behind' }),
        },
        {
          say: 'Next step, they land on the same node, five. Runners only meet on a loop, so we found one.',
          emphasis: ['same', 'loop'],
          sfx: 'success',
          scene: ring({ title: 'Slow 1 step, fast 2 steps', slow: 5, fast: 5, meet: true, caption: 'they meet on 5: there is a loop' }),
        },
        {
          say: 'In JavaScript, it is two pointers and one loop. O of n time, and O of one memory.',
          speak: 'In JavaScript, it is two pointers and one loop. Oh of n time, and oh of one memory.',
          emphasis: ['two', 'one'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'hasCycle.js',
            code: `function hasCycle(head) {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
            highlight: [7],
            note: { line: 7, text: 'O(n) time, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'Reach for fast and slow to spot a loop, find the middle, or count back from the end.',
          emphasis: ['loop', 'middle'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Spot a *loop* in a list', icon: '🔁' },
              { text: 'Find the *middle* in one pass', icon: '🎯' },
              { text: 'Count back from the *end*', icon: '📏' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: the hare hops two. Check fast and its next node first, or you crash on null.',
          emphasis: ['crash', 'null'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (fast) {
  slow = slow.next;
  fast = fast.next.next;
}`,
            errors: [3],
            note: { line: 3, text: 'crashes if fast.next is null', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. On a loop, why can the hare never jump over the tortoise forever?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'On a loop, why can fast never skip past slow forever?',
            options: ['The gap shrinks by 1 a step', 'Fast slows down in a loop', 'It can, so add a set'],
            answer: 0,
          },
        },
        {
          say: 'Each step the hare gains exactly one node. A gap that shrinks by one has to hit zero.',
          emphasis: ['one', 'zero'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'On a loop, why can fast never skip past slow forever?',
            options: ['The gap shrinks by 1 a step', 'Fast slows down in a loop', 'It can, so add a set'],
            answer: 0,
            reveal: true,
            explain: 'Fast moves 2, slow moves 1: the gap closes by 1 each step.',
          },
        },
        {
          say: 'Remember this. Slow moves one, fast moves two, and meeting means a loop. Now tap solve it.',
          emphasis: ['meeting', 'loop'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Slow 1, fast 2: *meeting* = loop', 'Fast hits null: no loop', 'Check fast and fast.next first'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-linked-lists-reversal',
      title: 'In-place reversal',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/reversal/linked-lists-reverse' },
      beats: [
        {
          say: 'Two million chat messages, oldest first. Flip them without making a copy.',
          emphasis: ['flip', 'copy'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 3', title: 'Newest first, *zero* copies', emoji: '💬', style: 'slam' },
        },
        {
          say: 'Here is the chat as a list: one, two, three, four. We want four, three, two, one.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: reverse({ flipped: 0, caption: 'goal: 4 → 3 → 2 → 1, same nodes' }),
        },
        {
          say: 'The easy way pushes every value onto a stack, then walks the list again and pops them back.',
          emphasis: ['stack'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function reverseBrute(head):
    stack ← empty stack
    for each node in the list:
        push node.val onto stack
    for each node in the list:
        node.val ← pop from stack
    return head`,
            highlight: [4],
            note: { line: 4, text: 'a full copy of every value', tone: 'warn' },
          },
        },
        {
          say: 'That copies two million values on a cheap phone. O of n extra memory, just to turn around.',
          speak: 'That copies two million values on a cheap phone. Oh of n extra memory, just to turn around.',
          emphasis: ['two', 'million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '2M',
            unit: 'copies',
            label: 'values pushed onto a *stack*',
            sub: 'O(n) extra memory',
            tone: 'bad',
          },
        },
        {
          say: 'But the nodes are already in place. Only the arrows point the wrong way, so flip them.',
          emphasis: ['arrows', 'flip'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Just *flip* the arrows', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start with prev as null and curr on the head. First, save curr dot next as nxt.',
          speak: 'Start with prev as null and curr on the head. First, save curr dot next as next.',
          emphasis: ['save'],
          sfx: 'pop',
          scene: reverse({ flipped: 0, curr: 1, nxt: 2, caption: 'prev = null, save nxt first' }),
        },
        {
          say: 'Flip one to point at prev, which is null. Then step: prev moves to one, curr to two.',
          emphasis: ['flip', 'step'],
          scene: reverse({ flipped: 1, prev: 1, curr: 2, nxt: 3, caption: '1 now points to null' }),
        },
        {
          say: 'Same three moves. Save, flip two back to one, and step forward.',
          emphasis: ['same'],
          scene: reverse({ flipped: 2, prev: 2, curr: 3, nxt: 4, caption: 'flip 2 → 1, then step' }),
        },
        {
          say: 'Flip three back to two. The reversed part grows by one node every step.',
          emphasis: ['grows'],
          scene: reverse({ flipped: 3, prev: 3, curr: 4, caption: 'flip 3 → 2, nxt is null' }),
        },
        {
          say: 'Flip four. Now curr is null, so stop. Prev sits on four, the new head.',
          emphasis: ['four', 'head'],
          sfx: 'success',
          scene: reverse({ flipped: 4, prev: 4, done: true, caption: 'return prev: 4 → 3 → 2 → 1' }),
        },
        {
          say: 'In JavaScript, it is save, flip, step. One pass and three pointers, so O of one memory.',
          speak: 'In JavaScript, it is save, flip, step. One pass and three pointers, so oh of one memory.',
          emphasis: ['save', 'flip', 'step'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'reverseList.js',
            code: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const nxt = curr.next;
    curr.next = prev;
    prev = curr;
    curr = nxt;
  }
  return prev;
}`,
            highlight: [[5, 6]],
            note: { line: 6, text: 'O(n) time, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'Reach for reversal when a task says reverse or swap, or would be easy walking backwards.',
          emphasis: ['reverse', 'backwards'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'It says *reverse* or *swap*', icon: '🔄' },
              { text: 'Easy if you walked *backwards*', icon: '⬅️' },
              { text: 'Only O(1) extra memory', icon: '🪶' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: flip before you save, and nothing points to the rest of the list anymore.',
          emphasis: ['save', 'rest'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (curr) {
  curr.next = prev;
  prev = curr;
  curr = curr.next;
}`,
            errors: [4],
            note: { line: 4, text: 'goes back: the rest is lost', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. After reversing one, two, three, which pointer holds the new head?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'After the loop ends, which pointer holds the new head?',
            options: ['curr', 'prev', 'head'],
            answer: 1,
          },
        },
        {
          say: 'It is prev. Curr ran off the end, and head still points at one, the new tail.',
          emphasis: ['prev'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'After the loop ends, which pointer holds the new head?',
            options: ['curr', 'prev', 'head'],
            answer: 1,
            reveal: true,
            explain: 'curr ends as null. prev is the old tail: the new head.',
          },
        },
        {
          say: 'Remember this. Save the next node, flip the arrow, step, and return prev. Now tap solve it.',
          emphasis: ['flip', 'prev'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Save nxt, *flip*, then step', 'Return *prev*, the new head', 'O(1) memory, no copies'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-linked-lists-combine-moves',
      title: 'Combining the moves: middle, reverse, weave',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/combine-moves/linked-lists-reorder' },
      beats: [
        {
          say: 'First song, then the last, then the second. On a one-way list?',
          emphasis: ['last', 'one-way'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 4', title: 'First, last, second, *repeat*', emoji: '🎧', style: 'slam' },
        },
        {
          say: 'The queue is one to six. DJ mode wants one, six, two, five, three, four.',
          emphasis: ['six', 'five'],
          sfx: 'pop',
          scene: fold({
            links: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
            caption: 'goal: 1 6 2 5 3 4, by re-linking',
          }),
        },
        {
          say: 'The easy way copies every node into an array, so you can jump to the back.',
          emphasis: ['array', 'back'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function reorderBrute(head):
    nodes ← every node, in an array
    i ← 0
    j ← n - 1
    while i < j:
        nodes[i].next ← nodes[j]
        i ← i + 1
        if i < j: nodes[j].next ← nodes[i]
        j ← j - 1
    nodes[i].next ← null`,
            highlight: [2],
            note: { line: 2, text: 'an array, just to walk back', tone: 'warn' },
          },
        },
        {
          say: 'A million songs means an extra array of a million nodes. That is O of n memory.',
          speak: 'A million songs means an extra array of a million nodes. That is oh of n memory.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            unit: 'slots',
            label: 'an extra array of *nodes*',
            sub: 'O(n) memory, just to walk back',
            tone: 'bad',
          },
        },
        {
          say: 'You already own three moves. Find the middle, reverse the back half, then walk both halves together.',
          emphasis: ['middle', 'reverse', 'together'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Middle, reverse, *weave*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Move one: fast and slow. When fast cannot hop two more, slow is on three, the end of the first half.',
          emphasis: ['three', 'first'],
          sfx: 'pop',
          scene: fold({
            links: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
            active: 3,
            top: ['slow', '🐢', 3],
            bottom: ['fast', '🐇', 5],
            caption: 'slow stops on 3: end of half one',
          }),
        },
        {
          say: 'Move two: cut after three, and reverse four, five, six. Now six is a head you can start from.',
          emphasis: ['cut', 'reverse'],
          scene: fold({
            links: [[1, 2], [2, 3], [6, 5], [5, 4]],
            good: [[6, 5], [5, 4]],
            fresh: [[6, 5], [5, 4]],
            active: 6,
            caption: 'cut after 3, back half is 6 5 4',
          }),
        },
        {
          say: 'Move three: weave. One links to six, and six links to the next front node, two.',
          emphasis: ['weave'],
          scene: fold({
            links: [[1, 6], [6, 2], [2, 3], [5, 4]],
            good: [[1, 6], [6, 2]],
            fresh: [[1, 6], [6, 2]],
            doneNodes: [1, 6],
            active: 2,
            top: ['p', 'p', 2],
            bottom: ['q', 'q', 5],
            caption: '1 → 6 → 2',
          }),
        },
        {
          say: 'Next pair. Two links to five, and five links to three.',
          emphasis: ['five', 'three'],
          scene: fold({
            links: [[1, 6], [6, 2], [2, 5], [5, 3]],
            good: [[1, 6], [6, 2], [2, 5], [5, 3]],
            fresh: [[2, 5], [5, 3]],
            doneNodes: [1, 6, 2, 5],
            active: 3,
            top: ['p', 'p', 3],
            bottom: ['q', 'q', 4],
            caption: '… → 2 → 5 → 3',
          }),
        },
        {
          say: 'Last pair: three links to four, and the back half runs out. Same six nodes, no extra memory.',
          emphasis: ['same', 'no'],
          sfx: 'success',
          scene: fold({
            links: [[1, 6], [6, 2], [2, 5], [5, 3], [3, 4]],
            good: [[1, 6], [6, 2], [2, 5], [5, 3], [3, 4]],
            doneNodes: [1, 2, 3, 4, 5, 6],
            caption: 'done: 1 6 2 5 3 4',
          }),
        },
        {
          say: 'In JavaScript, the three moves sit one after another. Each is O of n, so the whole thing is too.',
          speak: 'In JavaScript, the three moves sit one after another. Each is oh of n, so the whole thing is too.',
          emphasis: ['three', 'moves'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'reorderList.js',
            code: `let slow = head, fast = head;
while (fast.next?.next) {
  slow = slow.next;
  fast = fast.next.next;
}
let b = reverse(slow.next);
slow.next = null;
let a = head;
while (b) {
  const n1 = a.next, n2 = b.next;
  a.next = b; b.next = n1;
  a = n1; b = n2;
}`,
            highlight: [6, 7],
            note: { line: 7, text: 'three O(n) moves, O(1) memory', tone: 'good' },
          },
        },
        {
          say: 'Reach for this mirror trick when you pair each node with its twin from the end.',
          emphasis: ['twin', 'end'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Pair the front with the *back*', icon: '🪞' },
              { text: 'Palindrome or twin sums', icon: '👯' },
              { text: 'Fold the list in half', icon: '📄' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: forget to cut after the middle, and three still points into the back half. The weave builds a loop.',
          emphasis: ['cut', 'loop'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `let b = reverse(slow.next);
// forgot: slow.next = null
weave(head, b);`,
            errors: [2],
            note: { line: 2, text: 'the halves still touch: a loop', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. To cut a list of four in half, which loop leaves slow on node two?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'To cut a list of four in half, which loop stops slow on node 2?',
            options: ['while (fast && fast.next)', 'while (fast.next?.next)', 'Either one'],
            answer: 1,
          },
        },
        {
          say: 'The second one. It stops a step earlier on even lengths, on the first middle.',
          emphasis: ['earlier', 'first'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'To cut a list of four in half, which loop stops slow on node 2?',
            options: ['while (fast && fast.next)', 'while (fast.next?.next)', 'Either one'],
            answer: 1,
            reveal: true,
            explain: 'Checking fast.next.next stops one step early: the first middle.',
          },
        },
        {
          say: 'Remember this. Hard list problems are often easy moves chained together. Now tap solve it.',
          emphasis: ['easy', 'chained'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Middle, reverse, *walk together*', 'Cut the halves cleanly', 'Pick the middle on purpose'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-linked-lists-two-lists',
      title: 'Two lists at once: big-number addition and meeting points',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/two-lists/linked-lists-add-two-numbers' },
      beats: [
        {
          say: 'JavaScript cannot add two thirty-digit numbers exactly. A linked list can.',
          emphasis: ['exactly', 'can'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 5', title: 'Numbers too big for a *number*', emoji: '🔢', style: 'slam' },
        },
        {
          say: 'Three forty-two is stored ones first: two, four, three. Add four sixty-five, and you get eight oh seven.',
          emphasis: ['ones', 'first'],
          sfx: 'pop',
          scene: addition({ written: 3, done: true, caption: '342 + 465 = 807, read right to left' }),
        },
        {
          say: 'The easy way turns each list into a normal number, adds them, and splits the digits back out.',
          emphasis: ['normal', 'number'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function addBrute(a, b):
    x ← number from the digits of a
    y ← number from the digits of b
    return digits of x + y, ones first`,
            highlight: [4],
            note: { line: 4, text: 'x + y breaks past 16 digits', tone: 'warn' },
          },
        },
        {
          say: 'But JavaScript numbers stop being exact after about sixteen digits. A long list gives a wrong answer.',
          emphasis: ['sixteen', 'wrong'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '16',
            unit: 'digits',
            label: 'then JS numbers *lose* digits',
            sub: '…993 prints as …992',
            tone: 'bad',
          },
        },
        {
          say: 'Add like you did at school: one column at a time, and carry the one.',
          emphasis: ['column', 'carry'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Walk both, *carry the 1*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Start with the ones digits, two and five, and a carry of zero.',
          emphasis: ['ones', 'zero'],
          sfx: 'pop',
          scene: addition({ written: 0, reading: 0, caption: 'carry = 0, start at the ones' }),
        },
        {
          say: 'Two plus five is seven. Write a new node with seven, and the carry stays zero.',
          emphasis: ['seven'],
          scene: addition({ written: 1, reading: 0, caption: '2 + 5 = 7, carry 0' }),
        },
        {
          say: 'Four plus six is ten. Write the zero, and carry the one to the next column.',
          emphasis: ['zero', 'one'],
          scene: addition({ written: 2, reading: 1, carryAt: 2, caption: '4 + 6 = 10: write 0, carry 1' }),
        },
        {
          say: 'Three plus four, plus the carried one, is eight. No carry left over.',
          emphasis: ['eight'],
          scene: addition({ written: 3, reading: 2, caption: '3 + 4 + carried 1 = 8' }),
        },
        {
          say: 'Both lists are done and the carry is zero. Seven, zero, eight is eight oh seven.',
          emphasis: ['eight', 'seven'],
          sfx: 'success',
          scene: addition({ written: 3, done: true, caption: '7 → 0 → 8 means 807' }),
        },
        {
          say: 'In JavaScript, a dummy collects the answer, and the loop runs while either list or the carry is left.',
          emphasis: ['carry'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'addTwoNumbers.js',
            code: `const dummy = new ListNode(0);
let tail = dummy, carry = 0;
while (a || b || carry) {
  let sum = carry;
  if (a) { sum += a.val; a = a.next; }
  if (b) { sum += b.val; b = b.next; }
  tail.next = new ListNode(sum % 10);
  tail = tail.next;
  carry = Math.floor(sum / 10);
}
return dummy.next;`,
            highlight: [3, 9],
            note: { line: 9, text: 'one pass: O(max(n, m))', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when two lists walk in step, and some state like a carry rides along.',
          emphasis: ['step', 'carry'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Two lists walk in *step*', icon: '👣' },
              { text: 'A missing digit counts as 0', icon: '0️⃣' },
              { text: 'A *carry* rides along', icon: '🎒' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: stop when the lists end, and ninety-nine plus one comes out as zero zero.',
          emphasis: ['zero'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (a || b) {
  // add digits, write sum % 10
}
// 99 + 1 gives 0 → 0, not 0 → 0 → 1`,
            errors: [1],
            highlight: [4],
            note: { line: 4, text: 'drops the last carry', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. The digits come ones first. Why is that handy?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'The digits come ones digit first. Why is that handy?',
            options: ['It is the order you add in', 'It uses less memory', 'It is not, you must reverse'],
            answer: 0,
          },
        },
        {
          say: 'School addition starts at the ones column, and so does the list. You add while you walk.',
          emphasis: ['ones', 'walk'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'The digits come ones digit first. Why is that handy?',
            options: ['It is the order you add in', 'It uses less memory', 'It is not, you must reverse'],
            answer: 0,
            reveal: true,
            explain: 'You add from the ones column up, the same order as the list.',
          },
        },
        {
          say: 'Remember this. Walk both lists in step, treat a missing digit as zero, and keep the carry. Now tap solve it.',
          emphasis: ['step', 'carry'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Walk both lists in *step*', 'A missing digit counts as 0', 'Loop while a, b *or carry*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-linked-lists-lru-cache',
      title: 'Design: the LRU cache',
      link: { label: 'Solve it', href: '/dsa#/m/linked-lists/lru-cache/linked-lists-lru-cache' },
      beats: [
        {
          say: 'The cache holds two photos. A third one arrives. Which one goes?',
          emphasis: ['third', 'goes'],
          scene: { type: 'title', kicker: 'Linked lists · Lesson 6', title: 'Which photo do we *forget*?', emoji: '🖼️', style: 'slam' },
        },
        {
          say: 'Drop the one used longest ago. Put one, put two, get one. Now put three kicks out two.',
          emphasis: ['longest', 'two'],
          sfx: 'pop',
          scene: {
            type: 'timeline',
            title: 'A cache of size 2',
            steps: [
              { label: 'put(1)', sub: 'cache: 1' },
              { label: 'put(2)', sub: 'cache: 2 1' },
              { label: 'get(1)', sub: '1 is newest now' },
              { label: 'put(3)', sub: 'evicts 2', tone: 'bad' },
            ],
            active: 3,
          },
        },
        {
          say: 'The easy way keeps a map, plus an array of keys in the order you used them.',
          emphasis: ['array'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `values ← empty map
order ← keys, oldest first

function touch(key):
    remove key from order
    append key to order

function get(key):
    if key not in values: return -1
    touch(key)
    return values[key]`,
            highlight: [5],
            note: { line: 5, text: 'O(n): search, then shift', tone: 'warn' },
          },
        },
        {
          say: 'Every use searches and shifts that array. With a million photos, that is a million steps per tap.',
          emphasis: ['million', 'tap'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            unit: 'steps',
            label: 'per tap with *1M* photos',
            sub: 'O(n) for every get and put',
            tone: 'bad',
          },
        },
        {
          say: 'The map finds a node fast. A doubly linked list moves it fast. Use both.',
          emphasis: ['finds', 'moves'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Hash map + *doubly* linked list', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Put one, then two. The newest sits by head, the oldest by tail. Head and tail are fake sentinel nodes.',
          emphasis: ['newest', 'sentinel'],
          sfx: 'pop',
          scene: lru({ newest: 2, oldest: 1, caption: 'H ⇄ newest ⇄ oldest ⇄ T' }),
        },
        {
          say: 'Get one. The map jumps to its node, we unlink it, and add it at the front.',
          emphasis: ['jumps', 'front'],
          scene: lru({ newest: 1, oldest: 2, fresh: 1, caption: 'get(1): unlink, add at front' }),
        },
        {
          say: 'Put three. Now there are three, one too many, so we evict the node just before tail: two.',
          emphasis: ['evict', 'two'],
          scene: lru({ newest: 3, oldest: 1, evicted: 2, fresh: 3, caption: 'put(3): too full, evict 2' }),
        },
        {
          say: 'Put four. Again too full, so one goes, because it was used longest ago.',
          emphasis: ['one', 'longest'],
          scene: lru({ newest: 4, oldest: 3, evicted: 1, fresh: 4, caption: 'put(4): evict 1, least recent' }),
        },
        {
          say: 'Get three, and three jumps back to the front. Every step touched just a few pointers.',
          emphasis: ['few', 'pointers'],
          sfx: 'success',
          scene: lru({ newest: 3, oldest: 4, fresh: 3, caption: 'get(3): newest again, O(1)' }),
        },
        {
          say: 'In JavaScript, get is a map lookup, then remove and add front. Each is O of one.',
          speak: 'In JavaScript, get is a map lookup, then remove and add front. Each is oh of one.',
          emphasis: ['remove', 'front'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'LRUCache.js',
            code: `get(key) {
  const node = this.map.get(key);
  if (!node) return -1;
  this.remove(node);
  this.addFront(node);
  return node.val;
}
remove(node) {
  node.prev.next = node.next;
  node.next.prev = node.prev;
}`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'O(1): no search, no shift', tone: 'good' },
          },
        },
        {
          say: 'Reach for a map plus a list when you need O of one get and put, or least recently used.',
          speak: 'Reach for a map plus a list when you need oh of one get and put, or least recently used.',
          emphasis: ['map', 'list'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'O(1) *get* and *put*', icon: '⚡' },
              { text: 'Least recently used', icon: '🕰️' },
              { text: 'Move an item to the *front*', icon: '⏫' },
            ],
            active: 1,
          },
        },
        {
          say: 'The trap: evict from the list but forget the map, and the map points at a dead node.',
          emphasis: ['forget', 'dead'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const lru = this.tail.prev;
this.remove(lru);
// forgot: this.map.delete(lru.key)`,
            errors: [3],
            note: { line: 3, text: 'map points at a dead node', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why does the list need prev pointers, and not just next?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why does the LRU list need prev pointers?',
            options: ['To unlink a node in O(1)', 'To keep the values sorted', 'To store the keys'],
            answer: 0,
          },
        },
        {
          say: 'Unlinking changes the node before it. Prev gets you there in one step, not a walk.',
          emphasis: ['before'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why does the LRU list need prev pointers?',
            options: ['To unlink a node in O(1)', 'To keep the values sorted', 'To store the keys'],
            answer: 0,
            reveal: true,
            explain: 'Unlinking edits the node before it. prev reaches it in O(1).',
          },
        },
        {
          say: 'Remember this. The map finds, the list orders, and sentinels kill null checks. Now tap solve it.',
          emphasis: ['finds', 'orders'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Map *finds*, the list *orders*', 'Sentinels kill null checks', 'Store the key in the node'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
