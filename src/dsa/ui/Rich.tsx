import { Fragment, useMemo, type ReactNode } from 'react';
import { parseInline, type InlineNode } from './inline';
import { tokenize } from './highlight';

function render(nodes: InlineNode[]): ReactNode[] {
  return nodes.map((n, i) => {
    if (n.kind === 'text') return <Fragment key={i}>{n.text}</Fragment>;
    if (n.kind === 'code') return <code key={i}>{n.text}</code>;
    if (n.kind === 'strong') return <strong key={i}>{render(n.children)}</strong>;
    return <em key={i}>{render(n.children)}</em>;
  });
}

/** Renders course inline markup (**bold**, *italic*, `code`) as safe React text. */
export function Rich({ text }: { text: string }) {
  const nodes = useMemo(() => parseInline(text), [text]);
  return <>{render(nodes)}</>;
}

/** Code with a light syntax tint. */
export function Highlight({ code, lang }: { code: string; lang: 'js' | 'pseudo' }) {
  const tokens = useMemo(() => tokenize(code, lang), [code, lang]);
  return (
    <>
      {tokens.map((t, i) => (t.kind === 'txt' ? <Fragment key={i}>{t.text}</Fragment> : <span key={i} className={`tk-${t.kind}`}>{t.text}</span>))}
    </>
  );
}
