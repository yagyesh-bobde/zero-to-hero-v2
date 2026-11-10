import type { Series } from '../types';

// /dsa/reels module 6. One reel per lesson of src/dsa/modules/06-stacks-queues*.ts, in lesson order.
// Brief: src/reels/dsa/README.md. Rules: src/reels/AUTHORING.md.

const brackets = ['{', '[', '(', ')', ']', '}'];
const rpn = ['4', '13', '5', '/', '+'];
const temps = [73, 74, 75, 71, 69, 72, 76, 73];
const days = ['0', '1', '2', '3', '4', '5', '6', '7'];
const times = [1, 100, 3001, 3002, 3500];

export const series: Series = {
  id: 'dsa-stacks-queues',
  title: 'Stacks, queues & monotonic stacks',
  emoji: '📚',
  color: '#22d3ee',
  order: 6,
  blurb: 'Last-in-first-out thinking for matching, undo, and next-greater problems.',
  reels: [
    {
      id: 'dsa-stacks-queues-matching',
      title: 'Stacks for matching and undo',
      link: { label: 'Solve it', href: '/dsa#/m/stacks-queues/matching/stacks-queues-valid-parentheses' },
      beats: [
        {
          say: 'Forget one curly brace, and your editor turns red. How does it know?',
          emphasis: ['red'],
          scene: { type: 'title', kicker: 'Stacks · Lesson 1', title: 'Which bracket closes *which*?', emoji: '🧱', style: 'slam' },
        },
        {
          say: 'Is every bracket closed by the same kind, in the right order? This one is valid.',
          emphasis: ['same', 'order'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Valid brackets?',
            cells: brackets,
            found: [0, 1, 2, 3, 4, 5],
            vars: { valid: 'true' },
            caption: 'the newest open one must close first',
          },
        },
        {
          say: 'The easy way deletes touching pairs, again and again, until nothing changes.',
          emphasis: ['again'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function isValidSlow(s):
    repeat:
        old ← s
        remove every "()", "[]" and "{}"
    until s = old
    return s is empty`,
            highlight: [4],
            note: { line: 4, text: 'each pass re-reads the string', tone: 'warn' },
          },
        },
        {
          say: 'Each pass reads the whole string again. That is O of n squared, billions of steps for long code.',
          speak: 'Each pass reads the whole string again. That is oh of n squared, billions of steps for long code.',
          emphasis: ['squared', 'billions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for *100,000* brackets',
            sub: 'O(n²): every pass re-reads it all',
            tone: 'bad',
          },
        },
        {
          say: 'When a closer shows up, only one bracket can match it: the newest one still open.',
          emphasis: ['newest'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: brackets,
            pointers: { i: 3 },
            active: [3],
            reads: [2],
            caption: 'a closer only matches the newest opener',
          },
        },
        {
          say: 'So keep the open ones in a pile, called a stack. Push openers, and check each closer against the top.',
          emphasis: ['stack', 'top'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Newest open, *first closed*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Walk the string. The curly brace is an opener, so push it on the stack.',
          emphasis: ['push'],
          scene: {
            type: 'array',
            title: 'Check {[()]}',
            cells: brackets,
            pointers: { i: 0 },
            active: [0],
            vars: { stack: '{', action: 'push' },
          },
        },
        {
          say: 'Square and round are openers too. Push both. Round is now on top, the newest open one.',
          emphasis: ['top'],
          scene: {
            type: 'array',
            title: 'Check {[()]}',
            cells: brackets,
            pointers: { i: 2 },
            active: [2],
            vars: { stack: '{ [ (', action: 'push' },
          },
        },
        {
          say: 'A round closer. The top is its partner, so pop it. One pair done.',
          emphasis: ['partner', 'pop'],
          scene: {
            type: 'array',
            title: 'Check {[()]}',
            cells: brackets,
            pointers: { i: 3 },
            active: [3],
            found: [2],
            vars: { stack: '{ [', action: 'pop' },
          },
        },
        {
          say: 'The square and curly closers pop their partners too. The stack ends empty, so it is valid.',
          emphasis: ['empty', 'valid'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Check {[()]}',
            cells: brackets,
            pointers: { i: 5 },
            found: [0, 1, 2, 3, 4, 5],
            vars: { stack: 'empty', action: 'valid' },
          },
        },
        {
          say: 'In code, openers get pushed. A closer pops, and the pop must be its partner. One pass, so O of n.',
          speak: 'In code, openers get pushed. A closer pops, and the pop must be its partner. One pass, so oh of n.',
          emphasis: ['partner'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'isValid.js',
            code: `function isValid(s) {
  const pair = {
    ')': '(', ']': '[', '}': '{',
  };
  const open = [];
  for (const ch of s) {
    if (!(ch in pair)) open.push(ch);
    else if (open.pop() !== pair[ch])
      return false;
  }
  return open.length === 0;
}`,
            highlight: [8],
            note: { line: 8, text: 'the pop must match: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for a stack when things nest, or a new item cancels the last one, like undo.',
          emphasis: ['nest', 'undo'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Things *nest*: brackets, tags', icon: '🪆' },
              { text: 'A new item cancels the last', icon: '✖️' },
              { text: 'Undo the most recent thing', icon: '↩️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is leftovers. Two openers never fail inside the loop, so check the stack is empty at the end.',
          emphasis: ['leftovers', 'empty'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `function isValid(s) {
  // ...push and pop...
  return true;
}
isValid('(('); // true?!`,
            errors: [3],
            note: { line: 3, text: 'leftovers never closed', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why does a simple plus one, minus one counter fail on this string?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why does a +1 / −1 counter fail on "([)]"?',
            options: ['It miscounts 4 characters', 'It forgets which kind is on top', "It can't handle empty"],
            answer: 1,
          },
        },
        {
          say: 'It forgets which kind is on top. The counts balance, but the round closer meets a square opener.',
          emphasis: ['kind'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why does a +1 / −1 counter fail on "([)]"?',
            options: ['It miscounts 4 characters', 'It forgets which kind is on top', "It can't handle empty"],
            answer: 1,
            reveal: true,
            explain: 'The counts balance, but ) arrives with [ on top.',
          },
        },
        {
          say: 'Remember this. Push openers, pop on a match, and end with an empty stack. Now tap solve it and try it yourself.',
          emphasis: ['match', 'empty'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Push openers, pop on a *match*', 'Empty at the end means valid', 'Last in, *first out*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-stacks-queues-stack-design',
      title: 'Designing with stacks',
      link: { label: 'Solve it', href: '/dsa#/m/stacks-queues/stack-design/stacks-queues-min-stack' },
      beats: [
        {
          say: 'A tall pile of crates. Which one is lightest, right now?',
          emphasis: ['lightest'],
          scene: { type: 'title', kicker: 'Stacks · Lesson 2', title: 'The *lightest* crate, instantly', emoji: '📦', style: 'slam' },
        },
        {
          say: 'Build a stack that can push, pop, peek, and tell you its smallest item, each in one step.',
          emphasis: ['smallest', 'one'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Crate weights, bottom to top',
            cells: [5, 3, 7, 2],
            indices: false,
            pointers: { top: 3 },
            found: [3],
            vars: { min: 2 },
            caption: 'push, pop, top and min, all O(1)',
          },
        },
        {
          say: 'The easy way lifts every crate to find the smallest.',
          emphasis: ['every'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function getMin():
    best ← +∞
    for each x in stack:
        best ← min(best, x)
    return best`,
            highlight: [[3, 4]],
            note: { line: 4, text: 'O(n) on every single call', tone: 'warn' },
          },
        },
        {
          say: 'With a million crates, every single question lifts a million crates. That is O of n, each time.',
          speak: 'With a million crates, every single question lifts a million crates. That is oh of n, each time.',
          emphasis: ['million'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '1M',
            label: 'crates lifted per *question*',
            sub: 'O(n) every time you ask',
            tone: 'bad',
          },
        },
        {
          say: 'When seven goes on top, nothing below it can change until seven leaves. So its minimum is fixed.',
          emphasis: ['nothing', 'fixed'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: [5, 3, 7],
            indices: false,
            pointers: { top: 2 },
            active: [2],
            reads: [0, 1],
            caption: 'the crates below 7 are frozen',
          },
        },
        {
          say: 'So store the answer next to each item. Each slot remembers the smallest from itself down.',
          emphasis: ['each', 'slot'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Store the min *in each slot*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Push five, then three. Three is smaller, so its slot stores three as the minimum.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'Each slot: value, min',
            cells: ['5,5', '3,3'],
            indices: false,
            pointers: { top: 1 },
            active: [1],
            vars: { op: 'push(3)', min: 3 },
          },
        },
        {
          say: 'Push seven. Seven is bigger, so its slot still says three.',
          emphasis: ['still'],
          scene: {
            type: 'array',
            title: 'Each slot: value, min',
            cells: ['5,5', '3,3', '7,3'],
            indices: false,
            pointers: { top: 2 },
            active: [2],
            vars: { op: 'push(7)', min: 3 },
          },
        },
        {
          say: 'Push two, a new smallest. Asking for the minimum just reads the top slot: two.',
          emphasis: ['two', 'top'],
          scene: {
            type: 'array',
            title: 'Each slot: value, min',
            cells: ['5,5', '3,3', '7,3', '2,2'],
            indices: false,
            pointers: { top: 3 },
            active: [3],
            vars: { op: 'push(2)', min: 2 },
          },
        },
        {
          say: 'Pop the two. The new top already knows the minimum is three. No lifting at all.',
          emphasis: ['already', 'three'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Each slot: value, min',
            cells: ['5,5', '3,3', '7,3'],
            indices: false,
            pointers: { top: 2 },
            found: [2],
            vars: { op: 'pop()', min: 3 },
          },
        },
        {
          say: 'In code, each push stores a pair: the value, and the smallest so far. Every operation is O of one.',
          speak: 'In code, each push stores a pair: the value, and the smallest so far. Every operation is oh of one.',
          emphasis: ['pair'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'MinStack.js',
            code: `class MinStack {
  items = []; // pairs [value, min]
  push(x) {
    let m = x;
    if (this.items.length) {
      m = Math.min(x, this.getMin());
    }
    this.items.push([x, m]);
  }
  pop() { this.items.pop(); }
  getMin() {
    return this.items.at(-1)[1];
  }
}`,
            highlight: [8],
            note: { line: 8, text: 'store the min with it: O(1)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when a design asks a fast question about everything in the stack.',
          emphasis: ['everything'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Ask about *everything* in it', icon: '📦' },
              { text: 'Min, max or sum in O(1)', icon: '⚡' },
              { text: 'Need a queue? Use two stacks', icon: '🔁' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap: a second stack of minimums, pushed with less than. Push two twice, pop once, and the two is lost.',
          emphasis: ['lost'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `// mins: a second stack of minimums
if (!mins.length || x < mins.at(-1)) {
  mins.push(x);
}
// push 2, push 2, pop: min is lost`,
            errors: [2],
            note: { line: 2, text: 'use ≤, or a repeated min is lost', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why is it safe to work out the minimum once, when you push?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why is it safe to store the min at push time?',
            options: ['Stacks are always sorted', 'Nothing below it can change', 'getMin runs only once'],
            answer: 1,
          },
        },
        {
          say: 'Nothing below it can change. You only touch the top, so everything under it stays frozen.',
          emphasis: ['frozen'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why is it safe to store the min at push time?',
            options: ['Stacks are always sorted', 'Nothing below it can change', 'getMin runs only once'],
            answer: 1,
            reveal: true,
            explain: 'Only the top moves, so all below is frozen.',
          },
        },
        {
          say: 'Remember this. Store the answer in each slot when you push. Now tap solve it and try it yourself.',
          emphasis: ['each', 'slot'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Store the min in *each slot*', 'Pop, and the slot below still knows', 'Two stacks make a *queue*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-stacks-queues-expressions',
      title: 'Evaluating expressions',
      link: { label: 'Solve it', href: '/dsa#/m/stacks-queues/expressions/stacks-queues-eval-rpn' },
      beats: [
        {
          say: 'Old calculators had no brackets. So how did they do math?',
          emphasis: ['no', 'brackets'],
          scene: { type: 'title', kicker: 'Stacks · Lesson 3', title: 'Math with *no* brackets', emoji: '🧮', style: 'slam' },
        },
        {
          say: 'Here, each operator comes after its two numbers. Two, one, plus, three, times means nine.',
          emphasis: ['after', 'nine'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Reverse Polish notation',
            cells: ['2', '1', '+', '3', '*'],
            active: [4],
            vars: { answer: 9 },
            caption: 'means (2 + 1) × 3',
          },
        },
        {
          say: 'The easy way finds the first operator, squashes it with its two numbers, and starts over.',
          emphasis: ['starts', 'over'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function evalSlow(tokens):
    while tokens has 2+ items:
        i ← first operator in tokens
        v ← apply it to the two before
        replace the three with v
    return tokens[0]`,
            highlight: [3],
            note: { line: 3, text: 'searches from the start each round', tone: 'warn' },
          },
        },
        {
          say: 'Every round searches and shifts the whole list. That is O of n squared.',
          speak: 'Every round searches and shifts the whole list. That is oh of n squared.',
          emphasis: ['squared'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'steps for *100,000* tokens',
            sub: 'O(n²): search and shift each round',
            tone: 'bad',
          },
        },
        {
          say: 'Look at the divide. It always uses the two most recent numbers. That is the top of a stack!',
          emphasis: ['recent', 'stack'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: rpn,
            pointers: { i: 3 },
            active: [3],
            reads: [1, 2],
            caption: 'an operator uses the two newest numbers',
          },
        },
        {
          say: 'So push each number. An operator pops two, works them out, and pushes the result back.',
          emphasis: ['push', 'pops'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Numbers *wait* on a stack', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Numbers just wait. Push four, thirteen and five onto the stack.',
          emphasis: ['wait'],
          scene: {
            type: 'array',
            title: 'Evaluate 4 13 5 / +',
            cells: rpn,
            pointers: { i: 2 },
            active: [2],
            vars: { stack: '4 13 5', a: '–', b: '–' },
          },
        },
        {
          say: 'Divide. Pop five, then thirteen. Thirteen over five is two, dropping the fraction. Push two.',
          emphasis: ['five', 'thirteen'],
          scene: {
            type: 'array',
            title: 'Evaluate 4 13 5 / +',
            cells: rpn,
            pointers: { i: 3 },
            active: [3],
            done: [1, 2],
            vars: { stack: '4 2', a: 13, b: 5 },
          },
        },
        {
          say: 'Plus. Pop two, then four. Four plus two is six. Push six.',
          emphasis: ['six'],
          scene: {
            type: 'array',
            title: 'Evaluate 4 13 5 / +',
            cells: rpn,
            pointers: { i: 4 },
            active: [4],
            done: [0, 1, 2, 3],
            vars: { stack: '6', a: 4, b: 2 },
          },
        },
        {
          say: 'Out of tokens, and one number is left on the stack. The answer is six.',
          emphasis: ['six'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Evaluate 4 13 5 / +',
            cells: rpn,
            pointers: { i: 5 },
            found: [0, 1, 2, 3, 4],
            vars: { stack: '6', a: '–', b: '–' },
          },
        },
        {
          say: 'In code, pop the right side first, then the left, and push the result. Each token once, so O of n.',
          speak: 'In code, pop the right side first, then the left, and push the result. Each token once, so oh of n.',
          emphasis: ['right', 'left'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'evalRPN.js',
            code: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (!(t in ops)) {
      stack.push(Number(t));
    } else {
      const b = stack.pop(); // right
      const a = stack.pop(); // left
      stack.push(ops[t](a, b));
    }
  }
  return stack.pop();
}
// ops: + - * and / (Math.trunc)`,
            highlight: [[7, 8]],
            note: { line: 8, text: 'right side pops first: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for a stack when operators use earlier values, or brackets open a new scope.',
          emphasis: ['earlier', 'scope'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Operators use *earlier* values', icon: '➗' },
              { text: 'Brackets open a new scope', icon: '🗂️' },
              { text: 'Nested text like 3[a2[c]]', icon: '🪆' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is pop order. Swap the two pops, and eight minus two gives minus six.',
          emphasis: ['order', 'minus', 'six'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `const a = stack.pop();
const b = stack.pop();
stack.push(a - b);
// "8 2 -" gives -6, not 6`,
            errors: [[1, 2]],
            note: { line: 2, text: 'the first pop is the right side', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Eight, two, minus. You pop two, then eight. What do you push?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: '"8 2 -": you pop 2, then 8. What do you push?',
            options: ['2 − 8 = −6', '8 − 2 = 6', '8 + 2 = 10'],
            answer: 1,
          },
        },
        {
          say: 'Six. Two came off first, so it is the right side. Eight minus two.',
          emphasis: ['right'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: '"8 2 -": you pop 2, then 8. What do you push?',
            options: ['2 − 8 = −6', '8 − 2 = 6', '8 + 2 = 10'],
            answer: 1,
            reveal: true,
            explain: 'First pop is b, the right side: a − b = 8 − 2.',
          },
        },
        {
          say: 'Remember this. Numbers wait on a stack until an operator uses them. Now tap solve it and try it yourself.',
          emphasis: ['wait'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Numbers *wait* on the stack', 'Pop right, pop left, push result', 'Divide toward zero: *Math.trunc*'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-stacks-queues-monotonic-stack',
      title: 'Monotonic stacks: who is next bigger?',
      link: { label: 'Solve it', href: '/dsa#/m/stacks-queues/monotonic-stack/stacks-queues-daily-temperatures' },
      beats: [
        {
          say: 'Your weather app says three days until warmer. How does it know?',
          emphasis: ['warmer'],
          scene: { type: 'title', kicker: 'Stacks · Lesson 4', title: 'Days until *warmer*', emoji: '🌡️', style: 'slam' },
        },
        {
          say: 'Here are eight days. Day two is seventy-five. The next warmer day comes four days later.',
          emphasis: ['four'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Daily temperatures',
            cells: temps,
            pointers: { day: 2, next: 6 },
            active: [2],
            found: [6],
            vars: { wait: 4 },
            caption: 'how many days until a warmer one?',
          },
        },
        {
          say: 'The easy way looks ahead from every day until it finds a warmer one. On a cold streak, that is O of n squared.',
          speak: 'The easy way looks ahead from every day until it finds a warmer one. On a cold streak, that is oh of n squared.',
          emphasis: ['every', 'squared'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function dailyTempsSlow(temps):
    for i from 0 to n - 1:
        for j from i + 1 to n - 1:
            if temps[j] > temps[i]:
                answer[i] ← j - i
                break`,
            highlight: [[2, 3]],
            note: { line: 3, text: 'O(n²) on a long cold streak', tone: 'warn' },
          },
        },
        {
          say: 'Seventy-one scans ahead. Then sixty-nine scans the same days again. What a waste.',
          emphasis: ['same', 'again'],
          sfx: 'error',
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: temps,
            pointers: { i: 3 },
            active: [3],
            reads: [4, 5, 6],
            caption: 'every cold day re-reads the days ahead',
          },
        },
        {
          say: 'Flip it. Keep a stack of days still waiting. A warmer day pops every colder day, and answers it.',
          emphasis: ['waiting', 'warmer'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Let the *warm day* answer', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Seventy-four beats seventy-three, so day zero waited one day. Pop it, and push day one.',
          emphasis: ['one'],
          scene: {
            type: 'grid',
            title: 'Days until warmer',
            colLabels: days,
            rowLabels: ['temp', 'wait'],
            cells: [temps, [1, '', '', '', '', '', '', '']],
            active: [[0, 1]],
            found: [[1, 0]],
            vars: { waiting: '74' },
          },
        },
        {
          say: 'Seventy-five answers day one. Then seventy-one and sixty-nine are colder, so they wait in line.',
          emphasis: ['colder', 'wait'],
          scene: {
            type: 'grid',
            title: 'Days until warmer',
            colLabels: days,
            rowLabels: ['temp', 'wait'],
            cells: [temps, [1, 1, '', '', '', '', '', '']],
            active: [[0, 4]],
            vars: { waiting: '75 71 69' },
          },
        },
        {
          say: 'Seventy-two beats sixty-nine and seventy-one. Pop both, and write their waits: one and two days.',
          emphasis: ['both'],
          scene: {
            type: 'grid',
            title: 'Days until warmer',
            colLabels: days,
            rowLabels: ['temp', 'wait'],
            cells: [temps, [1, 1, '', 2, 1, '', '', '']],
            active: [[0, 5]],
            found: [[1, 3], [1, 4]],
            vars: { waiting: '75 72' },
          },
        },
        {
          say: 'Seventy-six beats seventy-two and seventy-five. Day two waited four days.',
          emphasis: ['four'],
          scene: {
            type: 'grid',
            title: 'Days until warmer',
            colLabels: days,
            rowLabels: ['temp', 'wait'],
            cells: [temps, [1, 1, 4, 2, 1, 1, '', '']],
            active: [[0, 6]],
            found: [[1, 2], [1, 5]],
            vars: { waiting: '76' },
          },
        },
        {
          say: 'Seventy-three waits too, but the days run out. Anyone left on the stack gets zero.',
          emphasis: ['zero'],
          sfx: 'success',
          scene: {
            type: 'grid',
            title: 'Days until warmer',
            colLabels: days,
            rowLabels: ['temp', 'wait'],
            cells: [temps, [1, 1, 4, 2, 1, 1, 0, 0]],
            active: [[0, 7]],
            found: [[1, 6], [1, 7]],
            vars: { waiting: '76 73' },
          },
        },
        {
          say: 'In code, a warmer day pops and answers. Each day is pushed once and popped once, so O of n.',
          speak: 'In code, a warmer day pops and answers. Each day is pushed once and popped once, so oh of n.',
          emphasis: ['once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'dailyTemperatures.js',
            code: `function dailyTemperatures(temps) {
  const ans = temps.map(() => 0);
  const stack = []; // waiting indexes
  temps.forEach((x, i) => {
    while (stack.length) {
      const j = stack.at(-1);
      if (x <= temps[j]) break;
      ans[j] = i - j; // i answers j
      stack.pop();
    }
    stack.push(i);
  });
  return ans;
}`,
            highlight: [[8, 9]],
            note: { line: 9, text: 'each index pops once: O(n)', tone: 'good' },
          },
        },
        {
          say: 'Reach for this when each item needs the next bigger or smaller item.',
          emphasis: ['next', 'bigger'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'The *next* bigger or smaller item', icon: '⏭️' },
              { text: 'Days until warmer or higher', icon: '📈' },
              { text: 'Nearest shorter bar each side', icon: '📊' },
            ],
            active: 0,
          },
        },
        {
          say: "The trap is pushing the temperature. You lose the day, so you can't count the wait. Push the index.",
          emphasis: ['index'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `stack.push(temps[i]);
// later: ans[?] = i - ?`,
            errors: [1],
            note: { line: 1, text: 'push the index, not the value', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. There is a while inside a for. Why is it still O of n?',
          speak: 'Quick check. There is a while inside a for. Why is it still oh of n?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'A while inside a for. Why is it still O(n)?',
            options: ['The while runs once per day', 'Each index pops once at most', 'Temperatures are small'],
            answer: 1,
          },
        },
        {
          say: 'Each index is pushed once and popped at most once. Count the moves over the whole run.',
          emphasis: ['once'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'A while inside a for. Why is it still O(n)?',
            options: ['The while runs once per day', 'Each index pops once at most', 'Temperatures are small'],
            answer: 1,
            reveal: true,
            explain: 'n pushes and n pops in total, over the whole run.',
          },
        },
        {
          say: 'Remember this. Keep a stack of the still waiting, and let a bigger arrival answer them. Now tap solve it and try it yourself.',
          emphasis: ['waiting', 'bigger'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['A stack of days still *waiting*', 'A warmer day pops and answers', 'Push *indexes*, not values'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
    {
      id: 'dsa-stacks-queues-queues-deques',
      title: 'Queues and deques',
      link: { label: 'Solve it', href: '/dsa#/m/stacks-queues/queues-deques/stacks-queues-recent-counter' },
      beats: [
        {
          say: 'Too many requests? The server says slow down. How does it count?',
          emphasis: ['slow', 'down'],
          scene: { type: 'title', kicker: 'Stacks · Lesson 5', title: 'Too many *requests*', emoji: '🚦', style: 'slam' },
        },
        {
          say: 'Each request has a time in milliseconds. Count the requests in the last three seconds. At thirty-five hundred, that is three.',
          emphasis: ['three'],
          sfx: 'pop',
          scene: {
            type: 'array',
            title: 'Request times (ms)',
            cells: times,
            pointers: { t: 4 },
            window: [2, 4],
            found: [2, 3, 4],
            vars: { count: 3 },
            caption: 'requests in the last 3000 ms',
          },
        },
        {
          say: 'The easy way recounts from the very first request, every single time.',
          emphasis: ['recounts'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'pseudo',
            file: 'Brute force',
            code: `function countRecentSlow(times):
    for i from 0 to n - 1:
        count ← 0
        for j from 0 to i:
            if times[j] ≥ times[i] - 3000:
                count ← count + 1`,
            highlight: [[4, 5]],
            note: { line: 5, text: 'recounts from the start', tone: 'warn' },
          },
        },
        {
          say: 'That is O of n squared. A hundred thousand requests means billions of checks.',
          speak: 'That is oh of n squared. A hundred thousand requests means billions of checks.',
          emphasis: ['squared', 'billions'],
          sfx: 'error',
          scene: {
            type: 'stat',
            value: '5B',
            label: 'checks for *100,000* requests',
            sub: 'O(n²): recounting every time',
            tone: 'bad',
          },
        },
        {
          say: 'Times only go up. Once a request is too old, it stays too old forever.',
          emphasis: ['forever'],
          scene: {
            type: 'array',
            title: 'Spot the waste',
            cells: times,
            pointers: { t: 3 },
            active: [3],
            done: [0],
            caption: 'too old once means too old forever',
          },
        },
        {
          say: 'So keep a queue. New requests join the back, and old ones drop off the front.',
          emphasis: ['back', 'front'],
          sfx: 'ding',
          scene: { type: 'title', kicker: 'The insight', title: 'Old ones leave the *front*', emoji: '💡', style: 'slam' },
        },
        {
          say: 'Each new request joins the back. At one hundred, both requests are inside the window.',
          emphasis: ['back'],
          scene: {
            type: 'array',
            title: 'Queue with a head index',
            cells: times,
            pointers: { head: 0, t: 1 },
            window: [0, 1],
            active: [1],
            vars: { count: 2, dropped: 0 },
          },
        },
        {
          say: 'At three thousand and one, the window still reaches back to one. All three count.',
          emphasis: ['three'],
          scene: {
            type: 'array',
            title: 'Queue with a head index',
            cells: times,
            pointers: { head: 0, t: 2 },
            window: [0, 2],
            active: [2],
            vars: { count: 3, dropped: 0 },
          },
        },
        {
          say: 'At three thousand and two, request one is too old. The head steps past it.',
          emphasis: ['head'],
          scene: {
            type: 'array',
            title: 'Queue with a head index',
            cells: times,
            pointers: { head: 1, t: 3 },
            window: [1, 3],
            active: [3],
            done: [0],
            vars: { count: 3, dropped: 1 },
          },
        },
        {
          say: 'At thirty-five hundred, one hundred drops off too. Nothing moved. The head just stepped forward.',
          emphasis: ['Nothing', 'moved'],
          sfx: 'success',
          scene: {
            type: 'array',
            title: 'Queue with a head index',
            cells: times,
            pointers: { head: 2, t: 4 },
            window: [2, 4],
            found: [2, 3, 4],
            done: [0, 1],
            vars: { count: 3, dropped: 2 },
          },
        },
        {
          say: 'In code, push the new time, then move the head past anything too old. Each time leaves once, so O of n.',
          speak: 'In code, push the new time, then move the head past anything too old. Each time leaves once, so oh of n.',
          emphasis: ['head', 'once'],
          sfx: 'type',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'countRecentCalls.js',
            code: `function countRecentCalls(times) {
  const q = [];
  let head = 0; // index of the front
  const answer = [];
  for (const t of times) {
    q.push(t);
    while (q[head] < t - 3000) head++;
    answer.push(q.length - head);
  }
  return answer;
}`,
            highlight: [7],
            note: { line: 7, text: 'drop from the front: O(n) total', tone: 'good' },
          },
        },
        {
          say: 'Reach for a queue when the oldest goes first, like a time window. Need the window max? Use a deque.',
          speak: 'Reach for a queue when the oldest goes first, like a time window. Need the window max? Use a deck.',
          emphasis: ['oldest', 'deque'],
          scene: {
            type: 'list',
            title: 'Reach for this when…',
            items: [
              { text: 'Oldest out first: *FIFO*', icon: '🚶' },
              { text: 'Only the last k seconds count', icon: '⏱️' },
              { text: 'Window max? Use a *deque*', icon: '↔️' },
            ],
            active: 0,
          },
        },
        {
          say: 'The trap is shift. It slides every item one slot left, so a loop of shifts is O of n squared.',
          speak: 'The trap is shift. It slides every item one slot left, so a loop of shifts is oh of n squared.',
          emphasis: ['shift', 'squared'],
          sfx: 'error',
          scene: {
            type: 'code',
            lang: 'js',
            file: 'trap.js',
            code: `while (q[0] < t - 3000) {
  q.shift(); // moves every item!
}`,
            errors: [2],
            note: { line: 2, text: 'O(n) each: use a head index', tone: 'bad' },
          },
        },
        {
          say: 'Quick check. Why is shift slow inside a loop on a big array?',
          sfx: 'riser',
          scene: {
            type: 'quiz',
            question: 'Why is shift() in a loop slow on a big array?',
            options: ['It copies to new memory', 'It moves every item left', "It isn't slow at all"],
            answer: 1,
          },
        },
        {
          say: 'It moves every other item one slot left. A head index just counts up, and nothing moves.',
          emphasis: ['moves', 'head'],
          sfx: 'ding',
          scene: {
            type: 'quiz',
            question: 'Why is shift() in a loop slow on a big array?',
            options: ['It copies to new memory', 'It moves every item left', "It isn't slow at all"],
            answer: 1,
            reveal: true,
            explain: 'Each shift is O(n). head++ is O(1).',
          },
        },
        {
          say: 'Remember this. Old items leave the front, and a head index beats shift. Now tap solve it and try it yourself.',
          emphasis: ['front', 'head'],
          sfx: 'success',
          scene: {
            type: 'outro',
            points: ['Queue: first in, *first out*', 'Use a head index, not shift()', 'Deque: drop from *both* ends'],
            tagline: 'Now go solve it.',
          },
        },
      ],
    },
  ],
};
