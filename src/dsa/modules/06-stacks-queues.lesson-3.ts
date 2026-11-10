import type { Lesson } from '../types';

// Module 6, lesson 3: evaluating expressions and nested strings with a stack.
const lesson: Lesson = {
  id: 'expressions',
  title: 'Evaluating expressions',
  summary: 'Numbers wait on a stack until an operator, or a closing bracket, uses them.',
  minutes: 22,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'How a calculator reads 3 + 4 × 2',
      text: 'Your phone calculator says `3 + 4 × 2 = 11`, not 14. Old HP calculators skipped the problem entirely: you typed `3 4 2 × +`. That style is called **Reverse Polish Notation (RPN)**: the operator comes **after** its two numbers, so you never need brackets or "times before plus" rules. Compilers and spreadsheets turn your formulas into something like RPN before they compute.',
    },
    {
      kind: 'text',
      text: '**The problem.** You get RPN tokens, for example `["2", "1", "+", "3", "*"]`. Each operator (`+ - * /`) uses the two values just before it. Here: `2 1 +` is 3, then `3 3 *` is 9. Division drops the fraction toward zero (`7 / 2 = 3`, `-7 / 2 = -3`). Return the final value.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: find an operator, collapse, repeat',
      code: `function evalSlow(tokens):
    while tokens has more than one item:
        i ← index of the first operator in tokens
        value ← apply tokens[i] to tokens[i - 2] and tokens[i - 1]
        replace tokens[i - 2 .. i] with value     // shifts the list
    return tokens[0]`,
    },
    {
      kind: 'text',
      text: 'It works, but every round searches from the start and splices the list (which shifts everything after it). With n tokens that is **O(n²)**.',
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Reading left to right, the numbers an operator needs are always the **two most recent numbers that have not been used yet**. "Most recent, not yet used" is a stack again. Nothing to search for.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Numbers wait on the stack',
      text: 'Push each number. When an operator comes, pop two (the first pop is the **right** side), compute, and push the result back. It becomes a number waiting for the next operator. At the end, the one number left is the answer.',
    },
    {
      kind: 'steps',
      title: 'Evaluating 4 13 5 / +',
      frames: [
        { cells: ['4', '13', '5', '/', '+'], pointers: { i: 0 }, active: [0], vars: { stack: '4' }, note: 'A number. Push it.' },
        { cells: ['4', '13', '5', '/', '+'], pointers: { i: 1 }, active: [1], vars: { stack: '4 13' }, note: 'A number. Push it.' },
        { cells: ['4', '13', '5', '/', '+'], pointers: { i: 2 }, active: [2], vars: { stack: '4 13 5' }, note: 'A number. Push it. The stack is bottom → top.' },
        { cells: ['4', '13', '5', '/', '+'], pointers: { i: 3 }, active: [3], done: [1, 2], vars: { b: 5, a: 13, stack: '4 2' }, note: '`/`: pop b = 5, then a = 13. 13 / 5 = 2.6, drop the fraction → 2. Push 2.' },
        { cells: ['4', '13', '5', '/', '+'], pointers: { i: 4 }, active: [4], done: [0, 1, 2, 3], vars: { b: 2, a: 4, stack: '6' }, note: '`+`: pop b = 2, a = 4. 4 + 2 = 6. Push 6.' },
        { cells: ['4', '13', '5', '/', '+'], found: [0, 1, 2, 3, 4], vars: { stack: '6', answer: 6 }, note: 'Out of tokens. One value is left: the answer is 6.' },
      ],
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'RPN with a stack',
      code: `function evalRPN(tokens):
    stack ← empty stack
    for each t in tokens:
        if t is "+", "-", "*" or "/":
            b ← pop from stack              // right side comes off first
            a ← pop from stack
            push (a t b) onto stack         // division drops toward zero
        else:
            push number(t) onto stack
    return pop from stack`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop();
      const a = stack.pop();
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop();
}`,
    },
    {
      kind: 'text',
      text: '**Same trick, nested strings.** `"3[a2[c]]"` means "3 times (a, then 2 times c)" = `"accaccacc"`. When you see `[`, you are starting a new inner piece, but you must not forget the outer one. So **push what you had** (the text so far and the repeat count) and start fresh. When you see `]`, pop the saved outer text and glue the repeated inner piece onto it.',
    },
    {
      kind: 'trace',
      title: 'Decoding "3[a2[c]]"',
      columns: ['char', 'num', 'cur', 'stack (bottom → top)'],
      rows: [
        ['3', '3', '""', 'empty'],
        ['[', '0', '""', '("", 3)'],
        ['a', '0', '"a"', '("", 3)'],
        ['2', '2', '"a"', '("", 3)'],
        ['[', '0', '""', '("", 3) ("a", 2)'],
        ['c', '0', '"c"', '("", 3) ("a", 2)'],
        [']', '0', '"a" + "cc" = "acc"', '("", 3)'],
        [']', '0', '"" + "acc"×3', 'empty'],
      ],
      note: 'Final `cur` is `"accaccacc"`. Each `[` saves the outer context; each `]` restores it.',
    },
    {
      kind: 'compare',
      title: 'Expression problems',
      rows: [
        { approach: 'RPN: find operator, splice, repeat', time: 'O(n²)', space: 'O(n)', note: 'Re-searches and shifts the list every round.' },
        { approach: 'RPN: value stack', time: 'O(n)', space: 'O(n)', note: 'Each token is pushed or popped a constant number of times.' },
        { approach: 'Decode: recursion per bracket', time: 'O(output)', space: 'O(depth)', note: 'Also fine. The call stack is the stack.' },
        { approach: 'Decode: explicit stack of (text, count)', time: 'O(output)', space: 'O(depth)', note: 'Same idea, no recursion limits, easy to trace.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** Reach for a stack when an expression has **operators that use earlier values**, or **brackets that open a new scope** (a smaller job inside a bigger one). For "times before plus" without brackets (problem 3 below), keep a stack of terms to add up, and apply `*` and `/` to the top term right away.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: save the context, start fresh',
      code: `stack ← empty stack
current ← fresh state
for each token:
    if token opens a scope:            // "[" or "("
        push current onto stack
        current ← fresh state
    else if token closes a scope:      // "]" or ")"
        outer ← pop from stack
        current ← combine(outer, current)
    else:
        update current with token
return current`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Three classic bugs',
      text: '**1. Order of the two values:** the first pop is the **right** side, so `a - b` and `a / b` need `b` popped first. **2. Dividing toward zero:** use `Math.trunc(a / b)`, not `Math.floor`. `Math.floor(-7 / 2)` is -4; the answer is -3. **3. Multi-digit numbers:** `"12"` arrives one digit at a time when you read characters; build it with `num = num * 10 + digit` (a digit is `ch >= \'0\' && ch <= \'9\'`).',
    },
  ],
  problems: [
    {
      id: 'stacks-queues-eval-rpn',
      title: 'Reverse Polish Calculator',
      difficulty: 'medium',
      leetcode: 150,
      pattern: 'Value stack (expression evaluation)',
      statement:
        'You are writing the engine of an old-school RPN calculator. `tokens` is a list of strings: integers (maybe negative, like `"-11"`) or one of `"+" "-" "*" "/"`. Each operator uses the two values right before it. Division drops the fraction **toward zero**. The input is always a valid expression and never divides by zero. Return the result.',
      examples: [
        { input: 'tokens = ["2","1","+","3","*"]', output: '9', explain: '(2 + 1) * 3' },
        { input: 'tokens = ["4","13","5","/","+"]', output: '6', explain: '4 + (13 / 5) = 4 + 2' },
      ],
      constraints: ['1 ≤ tokens.length ≤ 10⁴', 'every value fits in 32-bit int'],
      hints: [
        'When an operator shows up, which two values does it use?',
        'The two most recent values not used yet. Keep values on a stack.',
        'Pop `b` first, then `a`, and push `a op b`. Use `Math.trunc` for `/`.',
      ],
      approaches: [
        {
          name: 'Find operator, collapse, repeat',
          idea: 'Find the first operator, replace it and its two values with the result, and start again. Correct, but every round rescans and shifts the list.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Value stack',
          idea: 'Values wait on the stack. An operator always uses the top two, and its result is a new value waiting for the next operator. One pass.',
          pseudo: `function evalRPN(tokens):
    stack ← empty stack
    for each t in tokens:
        if t is an operator:
            b ← pop from stack
            a ← pop from stack
            push (a t b) onto stack        // "/" truncates toward zero
        else:
            push number(t) onto stack
    return pop from stack`,
          code: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop();
      const a = stack.pop();
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop();
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'evalRPN',
      starter: `function evalRPN(tokens) {
  // return the value of the RPN expression
  return 0;
}`,
      solution: `function evalRPN(tokens) {
  const stack = [];
  for (const t of tokens) {
    if (t === '+' || t === '-' || t === '*' || t === '/') {
      const b = stack.pop();
      const a = stack.pop();
      if (t === '+') stack.push(a + b);
      else if (t === '-') stack.push(a - b);
      else if (t === '*') stack.push(a * b);
      else stack.push(Math.trunc(a / b));
    } else {
      stack.push(Number(t));
    }
  }
  return stack.pop();
}`,
      tests: [
        { name: 'add then multiply', args: [['2', '1', '+', '3', '*']], expected: 9 },
        { name: 'division drops fraction', args: [['4', '13', '5', '/', '+']], expected: 6 },
        {
          name: 'long with negative token',
          args: [['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']],
          expected: 22,
        },
        { name: 'just a number', args: [['42']], expected: 42 },
        { name: 'negative division truncates toward zero', args: [['7', '-2', '/']], expected: -3 },
        { name: 'order of values matters', args: [['3', '4', '-']], expected: -1 },
        { name: 'classic textbook', args: [['5', '1', '2', '+', '4', '*', '+', '3', '-']], expected: 14 },
        { name: 'zero divided', args: [['0', '3', '/']], expected: 0 },
      ],
      takeaway: 'In RPN the operator always eats the top two values: pop right, pop left, push result.',
    },
    {
      id: 'stacks-queues-decode-string',
      title: 'Unzip a Repeated Message',
      difficulty: 'medium',
      leetcode: 394,
      pattern: 'Stack of saved context',
      statement:
        'A chat app compresses messages: `k[text]` means `text` repeated `k` times, and these can nest. Given a valid encoded string `s`, return the decoded message. `k` is a positive whole number (maybe more than one digit), letters are lowercase, and digits only ever appear as repeat counts.',
      examples: [
        { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
        { input: 's = "3[a2[c]]"', output: '"accaccacc"', explain: 'Inside first: `a2[c]` is `acc`. Then 3 times.' },
        { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
      ],
      constraints: ['1 ≤ s.length ≤ 30', '1 ≤ k ≤ 300', 'decoded length ≤ 10⁵'],
      hints: [
        'When you hit `[`, a smaller job starts. What must you not forget about the bigger job?',
        'You must remember the text built so far and the count that will repeat the inner part.',
        'On `[`: push `[cur, num]`, reset both. On `]`: pop `[prev, k]` and set `cur = prev + cur.repeat(k)`.',
      ],
      approaches: [
        {
          name: 'Innermost first, repeat',
          idea: 'Find an innermost `k[letters]` (one with no brackets inside), expand it in place, and scan again until no brackets remain. Simple, but each expansion rebuilds the whole string.',
          time: 'O(output · brackets)',
          space: 'O(output)',
        },
        {
          name: 'Stack of (text so far, count)',
          idea: 'A `[` pauses the outer job: save its text and the repeat count on the stack, then build the inner text fresh. A `]` finishes the inner job: pop the outer text and attach the inner text repeated. Every character is handled once (plus the cost of writing the output).',
          pseudo: `function decodeString(s):
    stack ← empty stack
    cur ← ""; num ← 0
    for each ch in s:
        if ch is a digit:
            num ← num · 10 + digit(ch)
        else if ch = "[":
            push (cur, num) onto stack
            cur ← ""; num ← 0
        else if ch = "]":
            (prev, k) ← pop from stack
            cur ← prev + (cur repeated k times)
        else:
            cur ← cur + ch
    return cur`,
          code: `function decodeString(s) {
  const stack = [];
  let cur = '';
  let num = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    } else if (ch === '[') {
      stack.push([cur, num]);
      cur = '';
      num = 0;
    } else if (ch === ']') {
      const [prev, k] = stack.pop();
      cur = prev + cur.repeat(k);
    } else {
      cur += ch;
    }
  }
  return cur;
}`,
          time: 'O(output)',
          space: 'O(output)',
        },
      ],
      fn: 'decodeString',
      starter: `function decodeString(s) {
  // return the decoded message
  return '';
}`,
      solution: `function decodeString(s) {
  const stack = [];
  let cur = '';
  let num = 0;
  for (const ch of s) {
    if (ch >= '0' && ch <= '9') {
      num = num * 10 + Number(ch);
    } else if (ch === '[') {
      stack.push([cur, num]);
      cur = '';
      num = 0;
    } else if (ch === ']') {
      const [prev, k] = stack.pop();
      cur = prev + cur.repeat(k);
    } else {
      cur += ch;
    }
  }
  return cur;
}`,
      tests: [
        { name: 'two groups', args: ['3[a]2[bc]'], expected: 'aaabcbc' },
        { name: 'nested', args: ['3[a2[c]]'], expected: 'accaccacc' },
        { name: 'trailing letters', args: ['2[abc]3[cd]ef'], expected: 'abcabccdcdcdef' },
        { name: 'no brackets', args: ['abc'], expected: 'abc' },
        { name: 'two-digit count', args: ['10[a]'], expected: 'aaaaaaaaaa' },
        { name: 'three levels deep', args: ['2[2[2[x]]]'], expected: 'xxxxxxxx' },
        { name: 'letters around a group', args: ['a2[b]c'], expected: 'abbc' },
        { name: 'count of one', args: ['1[z]'], expected: 'z' },
      ],
      takeaway: 'An opening bracket means "save what you had and start fresh"; a closing one means "pop and combine".',
    },
    {
      id: 'stacks-queues-basic-calculator',
      title: 'Calculator Without Brackets',
      difficulty: 'medium',
      leetcode: 227,
      pattern: 'Stack of terms',
      statement:
        'Build the brain of a simple calculator app. `s` holds non-negative integers, `+ - * /` and spaces, with no brackets. Follow normal rules: `*` and `/` happen before `+` and `-`, and division drops the fraction **toward zero**. The expression is always valid. Return the result. Do not use `eval`.',
      examples: [
        { input: 's = "3+2*2"', output: '7', explain: '2 * 2 first, then 3 + 4.' },
        { input: 's = " 3+5 / 2 "', output: '5', explain: '5 / 2 = 2, then 3 + 2.' },
      ],
      constraints: ['1 ≤ s.length ≤ 3 · 10⁵', 'every value fits in 32-bit int'],
      hints: [
        'Think of the expression as a sum of **terms**: `3 + 2*2 - 8/4` is `3`, `+4`, `-2` added up.',
        'Keep a stack of terms. A `+` or `-` starts a new term. A `*` or `/` changes the last term.',
        'Remember the operator **before** the current number. When the number ends: `+` push it, `-` push its negative, `*` / `/` pop the top, combine, push back. Sum the stack.',
      ],
      approaches: [
        {
          name: 'Two passes over a token list',
          idea: 'Split into numbers and operators. First pass: collapse every `*` and `/` into a single number. Second pass: add and subtract left to right. Correct, but splicing the list makes it slow and fiddly.',
          time: 'O(n²) with splicing',
          space: 'O(n)',
        },
        {
          name: 'Stack of signed terms',
          idea: 'Every `+` or `-` starts a new term, so push it (negative for `-`). A `*` or `/` binds to the term just before it, which is the top of the stack: pop, combine, push back. At the end, all that is left is adding the terms. Pushing `-num` and then truncating keeps "toward zero" right for negative terms.',
          pseudo: `function calculate(s):
    stack ← empty stack
    num ← 0; op ← "+"                    // op = operator before num
    for i from 0 to n - 1:
        ch ← s[i]
        if ch is a digit:
            num ← num · 10 + digit(ch)
        if (ch is an operator) or i = n - 1:
            if op = "+": push num onto stack
            if op = "-": push -num onto stack
            if op = "*": push (pop from stack) · num onto stack
            if op = "/": push trunc((pop from stack) / num) onto stack
            op ← ch; num ← 0
    return sum of stack`,
          code: `function calculate(s) {
  const stack = [];
  let num = 0;
  let op = '+';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= '0' && ch <= '9') num = num * 10 + Number(ch);
    if ('+-*/'.includes(ch) || i === s.length - 1) {
      if (op === '+') stack.push(num);
      else if (op === '-') stack.push(-num);
      else if (op === '*') stack.push(stack.pop() * num);
      else stack.push(Math.trunc(stack.pop() / num));
      op = ch;
      num = 0;
    }
  }
  return stack.reduce((sum, x) => sum + x, 0);
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'calculate',
      starter: `function calculate(s) {
  // return the value of the expression (no eval)
  return 0;
}`,
      solution: `function calculate(s) {
  const stack = [];
  let num = 0;
  let op = '+';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch >= '0' && ch <= '9') num = num * 10 + Number(ch);
    if ('+-*/'.includes(ch) || i === s.length - 1) {
      if (op === '+') stack.push(num);
      else if (op === '-') stack.push(-num);
      else if (op === '*') stack.push(stack.pop() * num);
      else stack.push(Math.trunc(stack.pop() / num));
      op = ch;
      num = 0;
    }
  }
  return stack.reduce((sum, x) => sum + x, 0);
}`,
      tests: [
        { name: 'times before plus', args: ['3+2*2'], expected: 7 },
        { name: 'spaces and division', args: [' 3/2 '], expected: 1 },
        { name: 'mixed with spaces', args: [' 3+5 / 2 '], expected: 5 },
        { name: 'single number', args: ['42'], expected: 42 },
        { name: 'minus then divide', args: ['14-3/2'], expected: 13 },
        { name: 'chain of times', args: ['2*3*4'], expected: 24 },
        { name: 'left to right +/-', args: ['1-1+1'], expected: 1 },
        { name: 'negative term truncates toward zero', args: ['0-7/2'], expected: -3 },
        { name: 'chain of divides', args: ['100/10/3'], expected: 3 },
        { name: 'everything', args: [' 12 + 3 * 4 - 5 '], expected: 19 },
      ],
      takeaway: 'Turn the expression into a stack of signed terms; `*` and `/` change the top term right away.',
    },
  ],
  quiz: [
    {
      prompt: 'Evaluating RPN `["8", "2", "-"]`: you pop 2, then 8. What do you push?',
      options: ['2 - 8 = -6', '8 - 2 = 6', '8 + 2 = 10'],
      answer: 1,
      explanation: 'The first pop is the right side. So it is `a - b` with `a = 8`, `b = 2`.',
    },
    {
      prompt: 'Which gives the right answer for `-7 / 2` in these problems?',
      options: ['`Math.floor(-7 / 2)` = -4', '`Math.trunc(-7 / 2)` = -3', '`Math.round(-7 / 2)` = -3'],
      answer: 1,
      explanation: 'Dropping the fraction toward zero is `Math.trunc`. `Math.round` happens to match here but is wrong for `5 / 3` (it gives 2, the answer is 1).',
    },
    {
      prompt: 'In decode string, what do you push when you meet `[`?',
      options: ['Only the repeat count', 'The text built so far and the repeat count', 'The letter after the bracket'],
      answer: 1,
      explanation: 'You need both to rebuild the outer string when the matching `]` arrives.',
    },
  ],
  takeaways: [
    'Values wait on a stack until an operator uses them: pop right, pop left, push the result.',
    'Brackets open a new scope: push the outer state, start fresh, then pop and combine.',
    'Use `Math.trunc` for integer division toward zero, and build numbers digit by digit.',
  ],
};

export default lesson;
