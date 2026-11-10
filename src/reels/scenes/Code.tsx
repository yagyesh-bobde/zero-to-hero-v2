import { Fragment } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { displayCode } from '../limits';
import { lineSet } from '../timeline';
import type { CodeLang, CodeScene, TerminalScene } from '../types';
import { toneClass, useTyping } from './shared';

const KEYWORDS = new Set(
  `const let var function return if else for while do switch case break continue new class extends
  import export from default async await try catch finally throw typeof instanceof in of this super
  null undefined true false void interface type enum implements public private protected static
  readonly fun val override suspend object companion when is as package lateinit init data sealed
  func struct let guard self Self nil some any protocol extension weak strong lazy mutating
  final abstract synchronized boolean int long float double char String def end do require
  @interface @implementation @property @end nonatomic YES NO include namespace auto`.split(/\s+/),
);

const TOKEN =
  /(\/\/.*$|#(?![\w-]*\()(?=\s|$).*$|\/\*.*?\*\/)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d[\d_.]*\b)|(<\/?[A-Za-z][\w.-]*|\/?>)|(@?[A-Za-z_$][\w$]*)(?=\s*\()|(@?[A-Za-z_$][\w$]*)/gm;

/** Course pseudocode: words, not syntax. Keywords go bold, `←` takes the accent, nothing else is coloured loudly. */
const PSEUDO_KEYWORDS = new Set(
  `function for each from to in while if else return and or not break continue do then true false empty null is`.split(' '),
);
const PSEUDO_TOKEN = /(\/\/.*$)|(←)|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?)|(\b\d[\d_.]*\b)|([A-Za-z_][\w]*)(?=\()|([A-Za-z_][\w]*)/gm;

function highlightPseudo(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(PSEUDO_TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    const [text, comment, arrow, str, num, call, word] = m;
    const cls = comment
      ? 'tk-comment'
      : arrow
        ? 'tk-assign'
        : str
          ? 'tk-string'
          : num
            ? 'tk-number'
            : call
              ? 'tk-call'
              : word && PSEUDO_KEYWORDS.has(word)
                ? 'tk-keyword'
                : '';
    out.push(cls ? <span key={i} className={cls}>{text}</span> : text);
    last = i + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function highlightLine(line: string, lang: CodeLang): ReactNode[] {
  if (lang === 'text') return [line];
  if (lang === 'pseudo') return highlightPseudo(line);
  const out: ReactNode[] = [];
  let last = 0;
  const hashComments = lang === 'bash' || lang === 'ruby';
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    const [text, comment, str, num, tag, call, word] = m;
    let cls = '';
    if (comment) cls = comment.startsWith('#') && !hashComments ? '' : 'tk-comment';
    else if (str) cls = 'tk-string';
    else if (num) cls = 'tk-number';
    else if (tag) cls = lang === 'tsx' || lang === 'xml' || lang === 'js' ? 'tk-tag' : '';
    else if (call) cls = KEYWORDS.has(call) ? 'tk-keyword' : 'tk-call';
    else if (word)
      cls = KEYWORDS.has(word) ? 'tk-keyword' : /^[A-Z]/.test(word) ? 'tk-type' : '';
    out.push(
      cls ? (
        <span key={i} className={cls}>
          {text}
        </span>
      ) : (
        text
      ),
    );
    last = i + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function Code({ scene, playing }: { scene: CodeScene; playing: boolean }) {
  const lang = scene.lang ?? 'tsx';
  const code = displayCode(scene.code, lang);
  const typed = useTyping(code, playing, Math.max(70, code.length / 1.4));
  const visible = code.slice(0, typed);
  const lines = code.split('\n');
  const highlight = lineSet(scene.highlight);
  const errors = lineSet(scene.errors);
  const added = lineSet(scene.added);
  const marked = highlight.size + errors.size + added.size > 0;
  const focus = scene.focus ?? marked;
  const done = typed >= code.length;
  // The longest line sets the font size (see .code-body: it shrinks to fit the zone width).
  const longest = Math.max(...lines.map((line) => line.length), 1);
  let offset = 0;
  return (
    <div className={`scene-code lang-${lang}`}>
      <div className="code-window">
        <div className="code-chrome">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          {scene.file && <span className="code-file">{scene.file}</span>}
          <span className="code-lang">{lang}</span>
        </div>
        <div className="code-body" style={{ '--code-cols': longest } as CSSProperties}>
          {lines.map((line, index) => {
            const n = index + 1;
            const start = offset;
            offset += line.length + 1;
            const shown = visible.length > start ? visible.slice(start, start + line.length) : '';
            const cursor = !done && visible.length >= start && visible.length <= start + line.length;
            const mark = errors.has(n)
              ? 'is-error'
              : added.has(n)
                ? 'is-added'
                : highlight.has(n)
                  ? 'is-hl'
                  : focus
                    ? 'is-dim'
                    : '';
            const note = done && scene.note?.line === n ? scene.note : undefined;
            return (
              <Fragment key={index}>
                <div className={`code-line ${done ? mark : ''}`}>
                  <span className="code-gutter">{n}</span>
                  <span className="code-text">
                    {highlightLine(shown, lang)}
                    {cursor && <span className="code-cursor" />}
                  </span>
                </div>
                <div className={`code-note-row ${note ? 'is-open' : ''}`}>
                  <div>
                    {note && (
                      <span className={`code-note ${toneClass(note.tone, 'accent')}`} key={note.text}>
                        {note.text}
                      </span>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TypedCommand({ text, playing }: { text: string; playing: boolean }) {
  const typed = useTyping(text, playing, 26);
  // A long command wraps at spaces only: each token is unbreakable (no "force-|idle").
  const tokens = text.slice(0, typed).split(/(\s+)/);
  return (
    <>
      {tokens.map((token, i) => (i % 2 ? token : <span key={i} className="term-tok">{token}</span>))}
      {typed < text.length && <span className="code-cursor" />}
    </>
  );
}

export function Terminal({ scene, playing }: { scene: TerminalScene; playing: boolean }) {
  // The widest output row sets the font size (see .term-body); commands wrap at spaces instead.
  const cols = Math.max(1, ...scene.lines.flatMap((line) => line.out?.split('\n').map((row) => row.length) ?? []));
  return (
    <div className="scene-terminal">
      <div className="term-window">
        <div className="code-chrome">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <span className="code-file">terminal</span>
        </div>
        <div className="term-body" style={{ '--term-cols': cols } as CSSProperties}>
          {scene.lines.map((line, i) => (
            <div key={`${i}:${line.cmd ?? ''}:${line.out ?? ''}`} className={`term-line ${toneClass(line.tone)}`}>
              {line.cmd !== undefined && (
                <div className="term-cmd">
                  <span className="term-prompt">$</span>
                  <span className="term-cmd-text">
                    <TypedCommand text={line.cmd} playing={playing} />
                  </span>
                </div>
              )}
              {line.out && (
                <pre className="term-out" style={{ animationDelay: line.cmd ? `${line.cmd.length / 26 + 0.15}s` : '0s' }}>
                  {line.out}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
