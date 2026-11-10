import type { Lesson } from '../types';

// Module 6, lesson 1: a stack for matching, cancelling and undo.
const lesson: Lesson = {
  id: 'matching',
  title: 'Stacks for matching and undo',
  summary: 'When the newest open thing must close first, keep a stack.',
  minutes: 20,
  blocks: [
    {
      kind: 'callout',
      tone: 'story',
      title: 'Your code editor already does this',
      text: 'Type a `)` in VS Code and it lights up the `(` it closes. Forget one `}` and everything below turns red. The editor is not guessing. It keeps a pile of brackets that are still open, and checks each closing bracket against the **top** of that pile. Ctrl+Z works the same way: the last thing you did is the first thing undone.',
    },
    {
      kind: 'text',
      text: 'That pile is a **stack**. You may only add to the top (**push**) and only take from the top (**pop**). Looking at the top without removing it is a **peek**. The last thing in is the first thing out, so people call it **LIFO** (last in, first out). In JavaScript a plain array is a stack: `push` and `pop` work on the end and cost O(1).',
    },
    {
      kind: 'text',
      text: '**The problem.** You get a string made only of `( ) [ ] { }`. Is every bracket closed by the same kind, in the right order? `"{[()]}"` is fine. `"([)]"` is not: the `[` is still open when the `)` shows up. `"(("` is not either: two brackets never close.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Brute force: delete pairs until nothing changes',
      code: `function isValidSlow(s):
    repeat:
        old ← s
        remove every "()", "[]" and "{}" from s
    until s = old
    return s is empty`,
    },
    {
      kind: 'text',
      text: 'This works: a valid string always has some pair touching in the middle, so it shrinks to nothing. But each pass reads the whole string, and `"((((((()))))))"` needs one pass per pair. That is about n/2 passes of n characters: **O(n²)**.',
    },
    {
      kind: 'text',
      text: '**Spot the waste.** Every pass re-reads characters we already looked at. And a closing bracket can only ever match one thing: the **most recent opener that is still open**. We do not need the whole string. We only need to remember the open brackets, newest on top.',
    },
    {
      kind: 'callout',
      tone: 'insight',
      title: 'Newest open closes first',
      text: 'Push every opener. When a closer arrives, the top of the stack must be its partner: if it is, pop it; if not (or the stack is empty), the string is broken. At the end the stack must be empty, or something never closed.',
    },
    {
      kind: 'steps',
      title: 'Checking "{[()]}" with a stack',
      frames: [
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 0 }, active: [0], vars: { stack: '{' }, note: '`{` is an opener. Push it.' },
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 1 }, active: [1], vars: { stack: '{ [' }, note: '`[` is an opener. Push it. The stack is written bottom → top.' },
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 2 }, active: [2], vars: { stack: '{ [ (' }, note: '`(` is an opener. Push it. It is now the newest open bracket.' },
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 3 }, active: [3], found: [2], vars: { stack: '{ [' }, note: '`)` is a closer. The top is `(`, its partner. Pop.' },
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 4 }, active: [4], found: [1, 2, 3], vars: { stack: '{' }, note: '`]` meets `[` on top. Pop.' },
        { cells: ['{', '[', '(', ')', ']', '}'], pointers: { i: 5 }, active: [5], found: [1, 2, 3, 4], vars: { stack: '(empty)' }, note: '`}` meets `{` on top. Pop.' },
        { cells: ['{', '[', '(', ')', ']', '}'], found: [0, 1, 2, 3, 4, 5], vars: { stack: '(empty)', answer: 'true' }, note: 'End of string and the stack is empty. Every bracket closed in order: valid.' },
      ],
    },
    {
      kind: 'trace',
      title: 'And a broken one: "([)]"',
      columns: ['char', 'action', 'stack after'],
      rows: [
        ['(', 'opener → push', '('],
        ['[', 'opener → push', '( ['],
        [')', 'top is [ but ) needs ( → stop', '( ['],
      ],
      note: 'We return `false` at the third character. We never even look at the last `]`.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Stack version',
      code: `function isValid(s):
    partner ← map { ")": "(", "]": "[", "}": "{" }
    stack ← empty stack
    for each ch in s:
        if ch is not in partner:              // an opener
            push ch onto stack
        else:                                 // a closer
            if stack is empty or top of stack ≠ partner[ch]:
                return false
            pop from stack
    return stack is empty                     // leftovers never closed`,
    },
    {
      kind: 'code',
      lang: 'js',
      code: `function isValid(s) {
  const partner = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (!(ch in partner)) {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack[stack.length - 1] !== partner[ch]) return false;
      stack.pop();
    }
  }
  return stack.length === 0;
}`,
    },
    {
      kind: 'compare',
      title: 'Valid brackets',
      rows: [
        { approach: 'Delete pairs until stuck', time: 'O(n²)', space: 'O(n)', note: 'Correct, but re-reads the string again and again.' },
        { approach: 'Counter of open brackets', time: 'O(n)', space: 'O(1)', note: 'Only works with **one** kind of bracket. `"([)]"` fools it: counts look fine, order is wrong.' },
        { approach: 'Stack of open brackets', time: 'O(n)', space: 'O(n)', note: 'Each character is pushed or popped once. Handles any mix of kinds.' },
      ],
    },
    {
      kind: 'text',
      text: '**The pattern.** Reach for a stack when: things must **nest** (brackets, HTML tags, folders); a new item can **cancel the previous one** (backspace, undo, `..` in a path, two equal letters touching); or you keep needing **the most recent unfinished thing**.',
    },
    {
      kind: 'code',
      lang: 'pseudo',
      title: 'Template: match or cancel the top',
      code: `stack ← empty stack
for each item in input:
    if stack is not empty and item closes / cancels top of stack:
        pop from stack
    else:
        push item onto stack
// the answer is built from what is left in the stack`,
    },
    {
      kind: 'callout',
      tone: 'trap',
      title: 'Leftovers and silent pops',
      text: '`"(("` never fails inside the loop, so always check `stack.length === 0` at the end. And in JS, `[].pop()` does not crash: it quietly returns `undefined`. Check for an empty stack **before** you compare with the top, or `")"` slips through. Peek with `stack[stack.length - 1]` (or `stack.at(-1)`).',
    },
    {
      kind: 'callout',
      tone: 'tip',
      title: 'JS arrays as stacks',
      text: 'Use `push` and `pop` (the end of the array): both O(1). Never use `unshift`/`shift` for a stack; they move every element, O(n). When the answer is "what is left", `stack.join(\'\')` turns it back into a string in one step.',
    },
  ],
  problems: [
    {
      id: 'stacks-queues-valid-parentheses',
      title: 'Valid Brackets',
      difficulty: 'easy',
      leetcode: 20,
      pattern: 'Stack (matching)',
      statement:
        'You are building the red squiggle for a tiny code editor. Given a string `s` made only of `( ) [ ] { }`, return `true` if every bracket is closed by a bracket of the same kind, and brackets close in the right order (the newest open one first). Otherwise return `false`. An empty string counts as valid.',
      examples: [
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "{[()]}"', output: 'true', explain: 'Each closer meets its partner on top of the stack.' },
        { input: 's = "([)]"', output: 'false', explain: 'When `)` arrives, the newest open bracket is `[`, not `(`.' },
      ],
      constraints: ['0 ≤ s.length ≤ 10⁴', 's has only the six bracket characters'],
      hints: [
        'A closing bracket can only match one opener. Which one?',
        'It must match the most recently opened bracket that is still open.',
        'Push openers onto a stack. On a closer, check the top, then pop. At the end the stack must be empty.',
      ],
      approaches: [
        {
          name: 'Delete pairs until stuck',
          idea: 'A valid string always has a pair like `()` touching somewhere. Delete all such pairs and repeat. If you end with an empty string it was valid.',
          code: `function isValid(s) {
  let old;
  do {
    old = s;
    s = s.replaceAll('()', '').replaceAll('[]', '').replaceAll('{}', '');
  } while (s !== old);
  return s === '';
}`,
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Stack of open brackets',
          idea: 'The newest open bracket must close first, and a stack always shows the newest on top. Push openers; each closer must match the top, which we pop. Leftovers mean something never closed.',
          pseudo: `function isValid(s):
    partner ← map { ")": "(", "]": "[", "}": "{" }
    stack ← empty stack
    for each ch in s:
        if ch is not in partner:
            push ch onto stack
        else if stack is empty or top of stack ≠ partner[ch]:
            return false
        else:
            pop from stack
    return stack is empty`,
          code: `function isValid(s) {
  const partner = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (!(ch in partner)) stack.push(ch);
    else if (stack.length === 0 || stack[stack.length - 1] !== partner[ch]) return false;
    else stack.pop();
  }
  return stack.length === 0;
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'isValid',
      starter: `function isValid(s) {
  // return true if every bracket closes in the right order
  return false;
}`,
      solution: `function isValid(s) {
  const partner = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if (!(ch in partner)) stack.push(ch);
    else if (stack.length === 0 || stack[stack.length - 1] !== partner[ch]) return false;
    else stack.pop();
  }
  return stack.length === 0;
}`,
      tests: [
        { name: 'one pair', args: ['()'], expected: true },
        { name: 'three pairs side by side', args: ['()[]{}'], expected: true },
        { name: 'nested', args: ['{[()]}'], expected: true },
        { name: 'wrong kind', args: ['(]'], expected: false },
        { name: 'crossed', args: ['([)]'], expected: false },
        { name: 'empty string', args: [''], expected: true },
        { name: 'never closed', args: ['(('], expected: false },
        { name: 'closer first', args: [')('], expected: false },
        { name: 'lonely closer', args: [']'], expected: false },
        { name: 'deep mix', args: ['{[()()]}[]'], expected: true },
      ],
      takeaway: 'When the newest open thing must close first, a stack holds exactly what you need.',
    },
    {
      id: 'stacks-queues-remove-adjacent-duplicates',
      title: 'Pop Matching Neighbours',
      difficulty: 'easy',
      leetcode: 1047,
      pattern: 'Stack (cancel the top)',
      statement:
        'In a word game, whenever two **equal letters touch**, they both vanish, which can make two new letters touch. Keep going until no equal letters touch. Given a lowercase string `s`, return what is left (the result is always the same no matter which pair you remove first).',
      examples: [
        { input: 's = "abbaca"', output: '"ca"', explain: '`bb` vanishes → `aaca`. Now `aa` touch → `ca`.' },
        { input: 's = "azxxzy"', output: '"ay"' },
      ],
      constraints: ['1 ≤ s.length ≤ 10⁵', 's has lowercase letters only'],
      hints: [
        'After a pair vanishes, which letter might pair up next?',
        'Only the letter just before the removed pair can match the next one. That is the most recent survivor.',
        'Keep the survivors on a stack. If the new letter equals the top, pop; otherwise push. Join the stack at the end.',
      ],
      approaches: [
        {
          name: 'Scan and delete, repeat',
          idea: 'Find any touching equal pair, cut it out, start over. It works, but each cut can force another full scan.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Stack of survivors',
          idea: 'The stack holds the letters that are still alive, in order. A new letter can only cancel the last survivor, which is the top. Equal → pop both; different → push.',
          pseudo: `function removeDuplicates(s):
    stack ← empty stack
    for each ch in s:
        if stack is not empty and top of stack = ch:
            pop from stack                 // the pair vanishes
        else:
            push ch onto stack
    return stack joined into a string`,
          code: `function removeDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join('');
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'removeDuplicates',
      starter: `function removeDuplicates(s) {
  // return the string left after all touching pairs vanish
  return '';
}`,
      solution: `function removeDuplicates(s) {
  const stack = [];
  for (const ch of s) {
    if (stack.length && stack[stack.length - 1] === ch) stack.pop();
    else stack.push(ch);
  }
  return stack.join('');
}`,
      tests: [
        { name: 'chain reaction', args: ['abbaca'], expected: 'ca' },
        { name: 'inner pair first', args: ['azxxzy'], expected: 'ay' },
        { name: 'single letter', args: ['a'], expected: 'a' },
        { name: 'one pair, nothing left', args: ['aa'], expected: '' },
        { name: 'three in a row', args: ['aaa'], expected: 'a' },
        { name: 'no pairs', args: ['abc'], expected: 'abc' },
        { name: 'full collapse', args: ['abba'], expected: '' },
        { name: 'two separate pairs', args: ['aabccb'], expected: '' },
      ],
      takeaway: 'If a new item can cancel only the last survivor, keep the survivors on a stack.',
    },
    {
      id: 'stacks-queues-simplify-path',
      title: 'Clean Up a File Path',
      difficulty: 'medium',
      leetcode: 71,
      pattern: 'Stack (cancel the top)',
      statement:
        'A terminal lets people type messy paths like `/home//user/./docs/../pics/`. Turn an absolute path into its clean form: `.` means "stay here", `..` means "go up one folder" (going up from `/` stays at `/`), and several `/` in a row count as one. Any other name, even `...`, is a normal folder. The clean path starts with one `/`, has one `/` between folders, and no `/` at the end (except the root `/` itself).',
      examples: [
        { input: 'path = "/home/"', output: '"/home"' },
        { input: 'path = "/a/./b/../../c/"', output: '"/c"', explain: 'Go into a, stay, into b, up to a, up to root, into c.' },
        { input: 'path = "/../"', output: '"/"', explain: 'You cannot go above the root.' },
      ],
      constraints: ['1 ≤ path.length ≤ 3000', 'path starts with "/"', 'folder names use letters, digits, ".", "_"'],
      hints: [
        'Split the path on `/`. What pieces do you get, and which ones can you just skip?',
        '`..` undoes the most recent folder you went into. "Most recent" is a stack word.',
        'Push folder names. On `..` pop (if not empty). Skip `""` and `.`. Answer: `"/" + stack.join("/")`.',
      ],
      approaches: [
        {
          name: 'String replacing',
          idea: 'Replace `//` with `/`, remove `/./`, and hunt for `name/..` patterns with repeated scans. It gets messy fast (`...` is a real name, `..` at the root) and each fix is another full scan.',
          time: 'O(n²)',
          space: 'O(n)',
        },
        {
          name: 'Split + stack of folders',
          idea: 'Split on `/` so each piece is one step. The stack is the folder you are in, root at the bottom. A name goes deeper (push), `..` goes up (pop), empty pieces and `.` do nothing.',
          pseudo: `function simplifyPath(path):
    stack ← empty stack
    for each part in path split by "/":
        if part = "" or part = ".":
            continue                         // nothing to do
        else if part = "..":
            if stack is not empty:
                pop from stack               // go up one folder
        else:
            push part onto stack             // go into a folder
    return "/" + (stack joined with "/")`,
          code: `function simplifyPath(path) {
  const stack = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return '/' + stack.join('/');
}`,
          time: 'O(n)',
          space: 'O(n)',
        },
      ],
      fn: 'simplifyPath',
      starter: `function simplifyPath(path) {
  // return the clean absolute path
  return '/';
}`,
      solution: `function simplifyPath(path) {
  const stack = [];
  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return '/' + stack.join('/');
}`,
      tests: [
        { name: 'trailing slash', args: ['/home/'], expected: '/home' },
        { name: 'above the root', args: ['/../'], expected: '/' },
        { name: 'double slash', args: ['/home//foo/'], expected: '/home/foo' },
        { name: 'dots and ups', args: ['/a/./b/../../c/'], expected: '/c' },
        { name: 'three dots is a name', args: ['/.../a/../b'], expected: '/.../b' },
        { name: 'messy', args: ['/a//b////c/d//././/..'], expected: '/a/b/c' },
        { name: 'just root', args: ['/'], expected: '/' },
        { name: 'dot-prefixed name', args: ['/..hidden/x/..'], expected: '/..hidden' },
      ],
      takeaway: '`..` is an undo: push to go in, pop to come back out.',
    },
    {
      id: 'stacks-queues-generate-parentheses',
      title: 'All Balanced Bracket Strings',
      difficulty: 'medium',
      leetcode: 22,
      pattern: 'Open-bracket count (a stack height)',
      statement:
        'A test generator for a code editor needs every **balanced** string made of `n` pairs of `(` and `)`. Balanced means the bracket checker from this lesson would say `true`. Return all of them, in any order.',
      examples: [
        { input: 'n = 2', output: '["(())","()()"]' },
        { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' },
      ],
      constraints: ['1 ≤ n ≤ 8'],
      hints: [
        'With only one kind of bracket, the stack would just hold `(`, `(`, `(`... so you only need its **height**: how many are still open.',
        'Build the string one character at a time. When is it safe to add `(`? When is it safe to add `)`?',
        'Add `(` while you have used fewer than `n`. Add `)` only while something is still open (`close < open`). Stop at length `2n`.',
      ],
      approaches: [
        {
          name: 'Make every string, keep the valid ones',
          idea: 'There are 2²ⁿ strings of length 2n. Make each one and run the bracket checker on it. Correct, but almost all of them are thrown away.',
          time: 'O(2²ⁿ · n)',
          space: 'O(n)',
        },
        {
          name: 'Build only valid strings',
          idea: 'Track how many `(` you used (`open`) and how many `)` (`close`). `close < open` means the imaginary stack is not empty, so a `)` is allowed. You never build a broken string, so nothing is wasted. (This "try a choice, then undo it" style is backtracking; module 9 covers it in full.)',
          pseudo: `function generateParenthesis(n):
    result ← empty list
    function build(text, open, close):
        if length of text = 2 · n:
            append text to result
            return
        if open < n:
            build(text + "(", open + 1, close)
        if close < open:                    // something is still open
            build(text + ")", open, close + 1)
    build("", 0, 0)
    return result`,
          code: `function generateParenthesis(n) {
  const result = [];
  const build = (text, open, close) => {
    if (text.length === 2 * n) {
      result.push(text);
      return;
    }
    if (open < n) build(text + '(', open + 1, close);
    if (close < open) build(text + ')', open, close + 1);
  };
  build('', 0, 0);
  return result;
}`,
          time: 'O(answers · n)',
          space: 'O(n) besides the output',
        },
      ],
      fn: 'generateParenthesis',
      starter: `function generateParenthesis(n) {
  // return every balanced string with n pairs
  return [];
}`,
      solution: `function generateParenthesis(n) {
  const result = [];
  const build = (text, open, close) => {
    if (text.length === 2 * n) {
      result.push(text);
      return;
    }
    if (open < n) build(text + '(', open + 1, close);
    if (close < open) build(text + ')', open, close + 1);
  };
  build('', 0, 0);
  return result;
}`,
      tests: [
        { name: 'one pair', args: [1], expected: ['()'] },
        { name: 'two pairs', args: [2], expected: ['(())', '()()'] },
        { name: 'three pairs', args: [3], expected: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
        {
          name: 'four pairs (14 strings)',
          args: [4],
          expected: [
            '(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()',
            '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()',
          ],
        },
      ],
      compare: 'unordered',
      takeaway: 'With one bracket kind, the stack is just a number: how many are still open.',
    },
  ],
  quiz: [
    {
      prompt: 'Why does a simple counter (+1 for open, -1 for close) fail on `"([)]"`?',
      options: [
        'It counts wrong when there are 4 characters.',
        'It only knows how many are open, not which kind is open on top.',
        'It cannot handle an empty string.',
      ],
      answer: 1,
      explanation: 'The counts balance, but the order is wrong. You need to know the **kind** of the newest open bracket, which is what the stack top tells you.',
    },
    {
      prompt: 'In JavaScript, what does `[].pop()` do?',
      options: ['Throws an error', 'Returns `undefined` without complaining', 'Returns `null`'],
      answer: 1,
      explanation: 'It silently returns `undefined`. That is why you check `stack.length` before comparing with the top.',
    },
    {
      prompt: 'Which of these is a "cancel the top" stack problem?',
      options: [
        'Find the largest number in an array',
        'Handle `..` in a file path',
        'Count how many times each word appears',
      ],
      answer: 1,
      explanation: '`..` undoes the most recent folder. Undoing the most recent thing is a pop.',
    },
  ],
  takeaways: [
    'A stack is LIFO: push and pop at the top, both O(1) with a JS array.',
    'Signals: nesting, "cancel the previous one", undo, "most recent unfinished thing".',
    'Check for an empty stack before peeking, and check for leftovers at the end.',
  ],
};

export default lesson;
