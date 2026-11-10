import { describe, expect, it } from 'vitest';
import { emptyProgress, parseProgress } from '../src/dsa/storage';
import { href, parseHash, type Route } from '../src/dsa/ui/route';
import { parseInline, plainText } from '../src/dsa/ui/inline';
import { tokenize } from '../src/dsa/ui/highlight';
import { runTests } from '../src/dsa/runner';
import sample from '../src/dsa/ui/sample';

describe('parseProgress', () => {
  it('returns empty progress for missing or broken data', () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress('')).toEqual(emptyProgress());
    expect(parseProgress('{not json')).toEqual(emptyProgress());
    expect(parseProgress('[1,2]')).toEqual(emptyProgress());
    expect(parseProgress('"hi"')).toEqual(emptyProgress());
  });
  it('keeps valid fields and drops bad ones', () => {
    const raw = JSON.stringify({
      lessons: ['hashing/lookup', 3, 'hashing/lookup', null],
      solved: 'nope',
      code: { a: 'function a(){}', b: 42 },
      quiz: { 'm/l/0': 1, 'm/l/1': -1, 'm/l/2': 1.5, 'm/l/3': '2' },
      last: { module: 'hashing', lesson: 'lookup' },
      extra: true,
    });
    expect(parseProgress(raw)).toEqual({
      lessons: ['hashing/lookup'],
      solved: [],
      code: { a: 'function a(){}' },
      quiz: { 'm/l/0': 1 },
      last: { module: 'hashing', lesson: 'lookup' },
    });
  });
  it('drops a malformed last location', () => {
    expect(parseProgress(JSON.stringify({ last: { module: 'x' } })).last).toBeNull();
  });
  it('round-trips', () => {
    const p = { lessons: ['a/b'], solved: ['p1'], code: { p1: 'x' }, quiz: { 'a/b/0': 2 }, last: { module: 'a', lesson: 'b' } };
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
  });
});

describe('parseHash', () => {
  const cases: [string, Route][] = [
    ['', { page: 'home' }],
    ['#', { page: 'home' }],
    ['#/', { page: 'home' }],
    ['#/problems', { page: 'problems' }],
    ['#/patterns', { page: 'patterns' }],
    ['#/m/hashing', { page: 'module', module: 'hashing' }],
    ['#/m/hashing/', { page: 'module', module: 'hashing' }],
    ['#/m/hashing/lookup', { page: 'lesson', module: 'hashing', lesson: 'lookup' }],
    ['#/m/hashing/lookup/hashing-two-sum', { page: 'lesson', module: 'hashing', lesson: 'lookup', problem: 'hashing-two-sum' }],
    ['#/m/hashing/lookup?p=hashing-two-sum', { page: 'lesson', module: 'hashing', lesson: 'lookup', problem: 'hashing-two-sum' }],
    ['#/dev/sample', { page: 'module', module: 'sample' }],
    ['#/m', { page: 'not-found' }],
    ['#/m/a/b/c/d', { page: 'not-found' }],
    ['#/whatever', { page: 'not-found' }],
    ['#/problems/extra', { page: 'not-found' }],
  ];
  it.each(cases)('%s', (hash, route) => expect(parseHash(hash)).toEqual(route));

  it('decodes segments and survives bad escapes', () => {
    expect(parseHash('#/m/a%20b')).toEqual({ page: 'module', module: 'a b' });
    expect(parseHash('#/m/%E0%A4%A')).toEqual({ page: 'module', module: '%E0%A4%A' });
  });

  it('round-trips through href', () => {
    const routes: Route[] = [
      { page: 'home' },
      { page: 'problems' },
      { page: 'patterns' },
      { page: 'module', module: 'two-pointers' },
      { page: 'module', module: 'sample' },
      { page: 'lesson', module: 'two-pointers', lesson: 'opposite-ends' },
      { page: 'lesson', module: 'two-pointers', lesson: 'opposite-ends', problem: 'two-pointers-3sum' },
    ];
    for (const r of routes) expect(parseHash(href(r))).toEqual(r);
  });
});

describe('parseInline', () => {
  it('parses bold, italic and code', () => {
    expect(parseInline('a **b** *c* `d`')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'strong', children: [{ kind: 'text', text: 'b' }] },
      { kind: 'text', text: ' ' },
      { kind: 'em', children: [{ kind: 'text', text: 'c' }] },
      { kind: 'text', text: ' ' },
      { kind: 'code', text: 'd' },
    ]);
  });
  it('nests code inside bold and keeps code literal', () => {
    expect(parseInline('**use `a*b`**')).toEqual([
      { kind: 'strong', children: [{ kind: 'text', text: 'use ' }, { kind: 'code', text: 'a*b' }] },
    ]);
    expect(parseInline('`**not bold**`')).toEqual([{ kind: 'code', text: '**not bold**' }]);
  });
  it('leaves math and unmatched markers as text', () => {
    expect(parseInline('n * m * k')).toEqual([{ kind: 'text', text: 'n * m * k' }]);
    expect(parseInline('2 ** 3')).toEqual([{ kind: 'text', text: '2 ** 3' }]);
    expect(parseInline('a *b')).toEqual([{ kind: 'text', text: 'a *b' }]);
    expect(parseInline('tick ` alone')).toEqual([{ kind: 'text', text: 'tick ` alone' }]);
    expect(parseInline('')).toEqual([]);
  });
  it('never produces HTML: tags stay plain text', () => {
    const nodes = parseInline('<img src=x onerror=alert(1)> **<b>hi</b>**');
    expect(nodes[0]).toEqual({ kind: 'text', text: '<img src=x onerror=alert(1)> ' });
    expect(plainText('<script>x</script>')).toBe('<script>x</script>');
  });
  it('plainText strips markup', () => {
    expect(plainText('**two** *pointers* on `nums`')).toBe('two pointers on nums');
  });
});

describe('tokenize', () => {
  it('rebuilds the exact source', () => {
    const src = 'function f(a) {\n  // hi "there"\n  const s = "x\\"y" + 12;\n  return a ← 3 / 2;\n}';
    expect(tokenize(src, 'js').map((t) => t.text).join('')).toBe(src);
    expect(tokenize(src, 'pseudo').map((t) => t.text).join('')).toBe(src);
  });
  it('tags keywords, comments, strings and numbers', () => {
    const kinds = tokenize('const x = "a"; // c\nreturn 42', 'js').filter((t) => t.kind !== 'txt');
    expect(kinds.map((t) => t.kind)).toEqual(['kw', 'str', 'com', 'kw', 'num']);
    expect(tokenize("for each x in list: // don't", 'pseudo').filter((t) => t.kind === 'kw').map((t) => t.text)).toEqual(['for', 'each', 'in']);
  });
});

describe('sample module', () => {
  it('uses every block kind', () => {
    const kinds = new Set(sample.lessons.flatMap((l) => l.blocks.map((b) => b.kind)));
    expect([...kinds].sort()).toEqual(['callout', 'code', 'compare', 'diagram', 'list', 'steps', 'table', 'text', 'trace']);
  });
  it('reference solutions pass their tests', () => {
    for (const p of sample.lessons.flatMap((l) => l.problems)) {
      const run = runTests(p.solution, p);
      expect(run.error, p.id).toBeUndefined();
      expect(run.results.every((r) => r.passed), p.id).toBe(true);
    }
  });
});

describe('matchPatterns', async () => {
  const { matchPatterns } = await import('../src/dsa/ui/PatternsPage');
  const card = (name: string, signals: string[]) => ({ card: { name, signals, template: '' } });
  const list = [card('Two pointers', ['input is **sorted**', 'pair with a target']), card('Sliding window', ['longest subarray']), card('Heap', ['k largest'])];
  it('returns everything for an empty query', () => expect(matchPatterns(list, '  ')).toHaveLength(3));
  it('stems words and ranks full matches first', () => {
    const r = matchPatterns(list, 'sorting pairs');
    expect(r[0].card.name).toBe('Two pointers');
    expect(matchPatterns(list, 'subarray')).toEqual([list[1]]);
    expect(matchPatterns(list, 'graph')).toEqual([]);
  });
});
