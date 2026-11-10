// Tiny inline-markup parser for course text: **bold**, *italic* and `code`. Output is a tree of
// plain strings that React renders as text, so content can never inject HTML.

export type InlineNode =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'strong' | 'em'; children: InlineNode[] };

const isSpace = (ch: string | undefined) => ch === undefined || /\s/.test(ch);

export function parseInline(src: string): InlineNode[] {
  const out: InlineNode[] = [];
  let buf = '';
  const flush = () => {
    if (buf) out.push({ kind: 'text', text: buf });
    buf = '';
  };
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '`') {
      const end = src.indexOf('`', i + 1);
      if (end > i + 1) {
        flush();
        out.push({ kind: 'code', text: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    } else if (ch === '*' && src[i + 1] === '*') {
      const end = src.indexOf('**', i + 2);
      if (end > i + 2 && !isSpace(src[i + 2]) && !isSpace(src[end - 1])) {
        flush();
        out.push({ kind: 'strong', children: parseInline(src.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    } else if (ch === '*') {
      let end = i + 1;
      while ((end = src.indexOf('*', end)) !== -1 && src[end + 1] === '*') end += 2;
      if (end > i + 1 && !isSpace(src[i + 1]) && !isSpace(src[end - 1])) {
        flush();
        out.push({ kind: 'em', children: parseInline(src.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** Plain text of inline markup, for search and titles. */
export function plainText(src: string): string {
  const walk = (nodes: InlineNode[]): string =>
    nodes.map((n) => (n.kind === 'text' || n.kind === 'code' ? n.text : walk(n.children))).join('');
  return walk(parseInline(src));
}
