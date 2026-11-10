// A deliberately small syntax tint: keywords, strings, comments and numbers. No parsing.

export type TokenKind = 'kw' | 'str' | 'com' | 'num' | 'fn' | 'txt';
export interface Token {
  kind: TokenKind;
  text: string;
}

const JS = new Set(
  'const let var function return if else for while do of in new class null undefined true false break continue typeof this switch case default throw try catch'.split(' '),
);
const PSEUDO = new Set(
  'function return if else for each from to while in and or not break continue empty down step repeat until true false null do then'.split(' '),
);

const TOKEN = /(\/\/.*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?|(\s+|[^\sA-Za-z_$\d"'`/]+|\/)/gy;

export function tokenize(code: string, lang: 'js' | 'pseudo'): Token[] {
  const words = lang === 'js' ? JS : PSEUDO;
  const out: Token[] = [];
  const push = (kind: TokenKind, text: string) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ kind, text });
  };
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  let at = 0;
  while (at < code.length) {
    TOKEN.lastIndex = at;
    m = TOKEN.exec(code);
    if (!m) {
      push('txt', code[at]);
      at++;
      continue;
    }
    const [all, com, str, num, word, call, other] = m;
    if (com) push('com', com);
    else if (str && lang === 'js') push('str', str);
    else if (str) push('txt', str);
    else if (num) push('num', num);
    else if (word) {
      push(words.has(word) ? 'kw' : call ? 'fn' : 'txt', word);
      if (call) push('txt', call);
    } else push('txt', other ?? all);
    at += all.length || 1;
  }
  return out;
}
