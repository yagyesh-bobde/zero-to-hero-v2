// Pure test runner shared by the browser worker and the vitest content checks.
// Learner code gets `ListNode`, `TreeNode` and `Heap` in scope, like on LeetCode.
import type { Compare, Problem, Shape } from './types';

export class ListNode {
  val: unknown;
  next: ListNode | null;
  constructor(val: unknown = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}

export class TreeNode {
  val: unknown;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val: unknown = 0, left: TreeNode | null = null, right: TreeNode | null = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

/** Binary heap available to learner code. `new Heap((a, b) => a - b)` is a min-heap. */
export class Heap<T = unknown> {
  private items: T[] = [];
  private cmp: (a: T, b: T) => number;
  constructor(compare: (a: T, b: T) => number = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    this.cmp = compare;
  }
  size() {
    return this.items.length;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  peek(): T | undefined {
    return this.items[0];
  }
  push(value: T) {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.cmp(a[i], a[p]) >= 0) break;
      [a[i], a[p]] = [a[p], a[i]];
      i = p;
    }
  }
  pop(): T | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop() as T;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;
        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]];
        i = m;
      }
    }
    return top;
  }
}

export function toList(values: unknown): ListNode | null {
  if (!Array.isArray(values)) return null;
  const dummy = new ListNode();
  let tail = dummy;
  for (const v of values) tail = tail.next = new ListNode(v);
  return dummy.next;
}

export function fromList(head: unknown): unknown[] {
  const out: unknown[] = [];
  let node = head as ListNode | null;
  const seen = new Set<unknown>();
  while (node && out.length < 10_000) {
    if (seen.has(node)) throw new Error('The returned list has a cycle.');
    seen.add(node);
    out.push(node.val);
    node = node.next;
  }
  return out;
}

/** LeetCode level-order array -> tree. */
export function toTree(values: unknown): TreeNode | null {
  if (!Array.isArray(values) || values.length === 0 || values[0] == null) return null;
  const root = new TreeNode(values[0]);
  const queue: TreeNode[] = [root];
  let i = 1;
  for (let q = 0; q < queue.length && i < values.length; q++) {
    const node = queue[q];
    if (i < values.length && values[i] != null) queue.push((node.left = new TreeNode(values[i])));
    i++;
    if (i < values.length && values[i] != null) queue.push((node.right = new TreeNode(values[i])));
    i++;
  }
  return root;
}

/** Tree -> LeetCode level-order array with trailing nulls trimmed. */
export function fromTree(root: unknown): unknown[] {
  const out: unknown[] = [];
  const queue: (TreeNode | null)[] = [root as TreeNode | null];
  for (let q = 0; q < queue.length && out.length < 20_000; q++) {
    const node = queue[q];
    if (!node) {
      out.push(null);
      continue;
    }
    out.push(node.val);
    queue.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

const shapeIn = (value: unknown, shape: Shape = 'raw') =>
  shape === 'list' ? toList(value) : shape === 'tree' ? toTree(value) : value;
const shapeOut = (value: unknown, shape: Shape = 'raw') =>
  shape === 'list' ? fromList(value) : shape === 'tree' ? fromTree(value) : value;

export function deepEqual(a: unknown, b: unknown, float = false): boolean {
  if (Object.is(a, b)) return true;
  if (float && typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-5;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  const ra = a as Record<string, unknown>;
  const rb = b as Record<string, unknown>;
  return ka.length === kb.length && ka.every((k) => Object.hasOwn(rb, k) && deepEqual(ra[k], rb[k], float));
}

const key = (v: unknown) => JSON.stringify(v) ?? String(v);
const sortDeep = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(sortDeep).sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0)) : v;
const sortOuter = (v: unknown): unknown =>
  Array.isArray(v) ? [...v].sort((x, y) => (key(x) < key(y) ? -1 : key(x) > key(y) ? 1 : 0)) : v;

export function matches(actual: unknown, expected: unknown, mode: Compare = 'exact'): boolean {
  if (mode === 'unordered') return deepEqual(sortOuter(actual), sortOuter(expected));
  if (mode === 'nested') return deepEqual(sortDeep(actual), sortDeep(expected));
  return deepEqual(actual, expected, mode === 'float');
}

export const display = (value: unknown) => {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

export interface TestResult {
  name: string;
  passed: boolean;
  input: string;
  actual: string;
  expected: string;
}

export type RunnableProblem = Pick<Problem, 'fn' | 'tests' | 'shapes' | 'compare'>;

/** Compiles `code`, runs every test, never throws. Infinite loops must be stopped by the caller (worker timeout). */
export function runTests(code: string, problem: RunnableProblem): { results: TestResult[]; error?: string } {
  let fn: unknown;
  try {
    fn = new Function(
      'ListNode',
      'TreeNode',
      'Heap',
      `"use strict";\n${code}\nreturn typeof ${problem.fn} === "function" ? ${problem.fn} : null;`,
    )(ListNode, TreeNode, Heap);
  } catch (error) {
    return { results: [], error: String(error).slice(0, 500) };
  }
  if (typeof fn !== 'function') {
    return { results: [], error: `Define a function named ${problem.fn}.` };
  }
  const call = fn as (...args: unknown[]) => unknown;
  const results = problem.tests.map((test, i): TestResult => {
    const name = test.name || `Test ${i + 1}`;
    const input = test.args.map(display).join(', ').slice(0, 300);
    const expected = display(test.expected);
    try {
      const args = structuredClone(test.args).map((a, j) => shapeIn(a, problem.shapes?.args?.[j]));
      const actual = shapeOut(call(...args), problem.shapes?.result);
      return {
        name,
        input,
        passed: matches(actual, test.expected, problem.compare),
        actual: display(actual).slice(0, 500),
        expected,
      };
    } catch (error) {
      return { name, input, passed: false, actual: String(error).slice(0, 200), expected };
    }
  });
  return { results };
}
