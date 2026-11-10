import { useRef, type KeyboardEvent } from 'react';

const INDENT = '  ';

/** A plain textarea code editor: Tab indents, Shift+Tab outdents, Enter keeps indentation, Cmd/Ctrl+Enter runs. */
export default function Editor({ value, onChange, onRun, label }: { value: string; onChange: (v: string) => void; onRun: () => void; label: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const escaped = useRef(false);
  const lines = value.split('\n').length;

  const edit = (el: HTMLTextAreaElement, text: string, start: number, end: number, selStart: number, selEnd: number) => {
    el.setRangeText(text, start, end, 'end');
    onChange(el.value);
    requestAnimationFrame(() => el.setSelectionRange(selStart, selEnd));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === 'Escape') {
      escaped.current = true;
      return;
    }
    if (e.key === 'Tab' && !escaped.current) {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: t, value: v } = el;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      if (s === t && !e.shiftKey) {
        edit(el, INDENT, s, t, s + INDENT.length, s + INDENT.length);
        return;
      }
      const block = v.slice(lineStart, t);
      const rows = block.split('\n');
      const next = e.shiftKey ? rows.map((r) => r.replace(/^ {1,2}/, '')) : rows.map((r) => INDENT + r);
      const joined = next.join('\n');
      const firstShift = e.shiftKey ? -(rows[0].length - next[0].length) : INDENT.length;
      edit(el, joined, lineStart, t, Math.max(lineStart, s + firstShift), lineStart + joined.length);
      return;
    }
    escaped.current = false;
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      const { selectionStart: s, selectionEnd: t, value: v } = el;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const indent = /^[ \t]*/.exec(v.slice(lineStart, s))?.[0] ?? '';
      const extra = /[{[(]\s*$/.test(v.slice(lineStart, s)) ? INDENT : '';
      if (!indent && !extra) return;
      e.preventDefault();
      const text = `\n${indent}${extra}`;
      edit(el, text, s, t, s + text.length, s + text.length);
    }
  };

  return (
    <div className="dsa-editor">
      <pre className="dsa-editor-gutter" aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
      </pre>
      <textarea
        ref={ref}
        aria-label={label}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        maxLength={30000}
        rows={Math.max(6, lines + 1)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
