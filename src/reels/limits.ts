// Text budgets per scene field: what fits the content safe zone at phone size
// (390px wide) without shrinking below readable sizes (see reels.css tokens).
// Enforced statically by tests/reels.test.ts and visually by scripts/reels-qa.mjs
// (its `word-split` rule is the ground truth; these numbers were measured with it).
//
// Two kinds of budget:
//  - lengths: total characters of a field (it may wrap at spaces) or a line count.
//  - `*Word` budgets: the widest single word that still fits on ONE line, because a
//    word never breaks mid-word. They are in average characters (0.563em each, the
//    Inter lowercase mean); the check measures real glyph widths, so narrow letters
//    (i l t) fit more and wide ones (m w) less. A zero-width space (U+200B) or a
//    hyphen inside a word is an allowed break point (so is a slash), so each part counts as a word.
//  - Mono fields (code, terminal, diagram subs, captions, compare titles) count plain characters.
import type { Scene } from './types';

/** One-line word capacity by diagram column count (phone). Keys are `cols`, clamped to 1–5. */
type ByCols = Record<1 | 2 | 3 | 4 | 5, number>;

export const LIMITS = {
  /** `lines`: wrapped caption-style lines on a phone at the regular title size (see `titleLines`). */
  title: { title: 40, titleWord: 12.1, lines: 4, kicker: 26, sub: 60, subWord: 25.8 },
  /** `chrome`: file name + language badge share one bar (file.length + lang.length). */
  code: { lines: 14, cols: 38, note: 36, noteWord: 29.6, chrome: 26 },
  /** Output rows size the font (down to a floor that fits `outCols`); commands wrap once at a space. */
  terminal: { lines: 8, cmd: 40, outCols: 34, outLines: 4 },
  /** Labels shrink to a 15px floor; a node is min(56cqw, 0.96 cell) of a 288px phone column minus border + 0.5cqw sides. */
  diagram: {
    nodes: 9,
    label: 18,
    labelWord: { 1: 24.6, 2: 15.3, 3: 9.9, 4: 7.2, 5: 5.6 } as ByCols,
    sub: 24,
    subWord: { 1: 20, 2: 18, 3: 11, 4: 8, 5: 6 } as ByCols,
    edgeLabel: 16,
    caption: 40,
    captionWord: 34.6,
    title: 30,
  },
  /** Columns = leaves. */
  tree: { leaves: 5, depth: 4, label: 14, labelWord: { 1: 24.6, 2: 15.3, 3: 9.9, 4: 7.2, 5: 5.6 } as ByCols, caption: 32, captionWord: 34.6, title: 30 },
  /** The mock is narrowest (in text terms) on the laptop frame; word budgets are measured there. */
  phone: {
    items: 5,
    itemLabel: 36,
    itemLabelWord: 19.8,
    itemSub: 30,
    itemSubWord: 27,
    itemValue: 10,
    title: 24,
    titleWord: 15.8,
    body: 70,
    caption: 40,
    captionWord: 36,
    noticeTitle: 36,
    noticeTitleWord: 21.5,
    noticeBody: 50,
    noticeBodyWord: 23,
    bubble: 40,
    permission: 70,
    crash: 60,
    toast: 30,
  },
  /** Title and item type shrink to fit the longest word on either side (down to 13px); items stay ≤ 2 lines on a phone card. */
  compare: { items: 4, item: 26, itemWord: 15, title: 18, titleWord: 14, codeLines: 6, codeCols: 23, sceneTitle: 30 },
  list: { items: 5, text: 36, textWord: 14.5, sub: 36, subWord: 22.8, title: 30 },
  timeline: { steps: 6, label: 18, labelWord: 16.6, sub: 30, subWord: 24, title: 30 },
  stat: { value: 8, unit: 6, label: 36, labelWord: 17.6, sub: 40, subWord: 25.5 },
  quiz: { question: 70, questionWord: 17.8, options: 4, option: 32, optionWord: 18.8, explain: 72, explainWord: 29.8 },
  outro: { points: 4, point: 46, pointWord: 18.8, tagline: 30, taglineWord: 16.7, title: 24 },
  /**
   * Array dry run. The cell text budget depends on the cell count (see `cellEmMax`); pointer names
   * are mono; vars chips must fit `varRows` phone lines.
   */
  array: { cells: 10, pointers: 4, pointerName: 5, vars: 4, varKey: 8, varValue: 14, varRows: 2, caption: 40, captionWord: 34.6, title: 30 },
  /** 2D grid. `cols` counts data columns (row labels get their own column); headers are mono. */
  grid: { rows: 8, cols: 8, rowLabel: 6, colLabel: 4, vars: 4, varKey: 8, varValue: 14, varRows: 2, caption: 40, captionWord: 34.6, title: 30 },
  /** Bars on a number line: the axis spans `axisSpan` integers at most; labels are mono in a left column. */
  intervals: { bars: 6, axisSpan: 12, label: 7, vars: 4, varKey: 8, varValue: 14, varRows: 2, caption: 40, captionWord: 34.6, title: 30 },
  /** Every scene heading (a wider word makes Fit zoom the scene a little less). */
  sceneTitleWord: 19.2,
  /** `Reel.link`: the label sits on the end-card button and under the rail icon (laptop). */
  link: { label: 14 },
} as const;

/*
 * Array / grid geometry, mirrored by reels.css (.scene-array, .scene-grid). Both scenes lay out at
 * Fit zoom 1, so a phone column is 74cqw = 288px of a 390px stage. A cell is a square slot of
 * `pitch` (≤ 18cqw); its box is the slot minus a max(3px, 8%) gap. All cells share one font that
 * fits the widest cell text, never below 15px: that floor sets the text budget per pitch.
 */
const PHONE_CQW = 3.9;
const PHONE_COL_CQW = 74;
/** An array keeps 3cqw of its column free for the window band's overhang (pass it as `labelCqw`). */
export const ARRAY_INSET_CQW = 3;
/** Cell pitch on a phone (px) for `count` columns, an optional row-label column (cqw) and, for grids, the row count. */
export function cellPitchPx(count: number, labelCqw = 0, rows = 0) {
  const byWidth = ((PHONE_COL_CQW - labelCqw) * PHONE_CQW) / Math.max(1, count);
  // Grids also fit their height: all rows share 52cqh (844px phone stage).
  const byHeight = rows ? (0.52 * 844) / rows : Infinity;
  return Math.min(18 * PHONE_CQW, byWidth, byHeight);
}
/** Widest cell text (em at the 15px floor) that fits a cell box at that pitch (inside its 2px borders, 1px of air each side). */
export const cellEmMax = (pitch: number) => (pitch - Math.max(3, pitch * 0.08) - 6) / 15;
/** Width (em) the cell font is sized for: the widest cell text, Inter 700 widths × 1.04 for the 800 weight. */
export const cellEm = (cells: (string | number)[]) => Math.max(0.9, ...cells.map((c) => wordEm(String(c)) * 1.04));
/** Grid row-label column width (cqw): mono at --fs-small (3.2cqw) plus padding. */
export const gridLabelCqw = (labels: string[] | undefined) =>
  labels?.length ? Math.max(...labels.map((l) => [...l].length), 1) * 0.6 * 3.2 + 3 : 0;
/** An interval bar's row label: its own, or "[from,to]". */
export const intervalLabel = (bar: { from: number; to: number; label?: string }) => bar.label ?? `[${bar.from},${bar.to}]`;
/** Pointer chip width (cqw): mono name at 3.8cqw, 0.62em per char + 1.2em padding (reels.css .arr-ptr). */
export const pointerChipCqw = (name: string) => 3.8 * (0.62 * [...name].length + 1.2);

/**
 * Pointer chip rows under an array: each pointer takes the lowest row where its chip clears every
 * chip already there (pointers on one cell stack; wide names on neighbouring cells step down).
 * Estimated on the phone column (the narrowest), so both sizes share one layout. Out-of-range
 * pointers are hidden and take no row.
 */
export function pointerRows(cells: number, pointers: Record<string, number>) {
  const pitch = Math.min(18, (PHONE_COL_CQW - ARRAY_INSET_CQW) / Math.max(1, cells));
  const track = pitch * cells;
  const placed: { x: number; w: number; row: number }[] = [];
  const rows: Record<string, number> = {};
  const list = Object.entries(pointers)
    .map(([name, at], order) => ({ name, at, order }))
    .filter((p) => p.at >= 0 && p.at < cells)
    .sort((a, b) => a.at - b.at || a.order - b.order);
  for (const p of list) {
    const w = pointerChipCqw(p.name);
    // Chips near an end are pushed inward so they stay inside the column (reels.css clamps the same way).
    const x = Math.min(Math.max((p.at + 0.5) * pitch, w / 2), Math.max(w / 2, track - w / 2));
    let row = 0;
    while (placed.some((q) => q.row === row && Math.abs(q.x - x) < (q.w + w) / 2 + 1)) row++;
    placed.push({ x, w, row });
    rows[p.name] = row;
  }
  return { rows, count: placed.length ? Math.max(...placed.map((p) => p.row)) + 1 : 0 };
}

/** Phone lines the vars cards wrap to (key mono 2.8cqw over a value in Inter 800 at 6cqw, 8cqw padding, ≥ 17cqw, 2cqw gaps). */
export function varRows(vars: Record<string, string | number> | undefined) {
  let lines = 0;
  let cur = 0;
  for (const [key, value] of Object.entries(vars ?? {})) {
    // A value may hold spaces ("a3 b4"): Inter's space is ≈ 0.28em.
    const parts = String(value).split(' ');
    const valueEm = parts.reduce((n, part) => n + wordEm(part), 0) + (parts.length - 1) * 0.28;
    const w = Math.max(17, Math.max(1.68 * [...key].length, valueEm * 1.04 * 6) + 8.2);
    if (!lines || cur + 2 + w > PHONE_COL_CQW) {
      lines++;
      cur = w;
    } else cur += 2 + w;
  }
  return lines;
}

/* Advance widths (em) of Inter 700 glyphs, measured in the browser; unknown characters fall back by class. */
const EM: Record<string, number> = {
  '0': 0.674, '1': 0.431, '2': 0.63, '3': 0.645, '4': 0.676, '5': 0.622, '6': 0.65, '7': 0.581, '8': 0.651, '9': 0.65,
  a: 0.581, b: 0.63, c: 0.588, d: 0.63, e: 0.596, f: 0.398, g: 0.632, h: 0.623, i: 0.271, j: 0.271, k: 0.58, l: 0.271, m: 0.912,
  n: 0.622, o: 0.613, p: 0.63, q: 0.63, r: 0.407, s: 0.56, t: 0.366, u: 0.623, v: 0.6, w: 0.85, x: 0.58, y: 0.602, z: 0.573,
  A: 0.747, B: 0.662, C: 0.74, D: 0.722, E: 0.607, F: 0.587, G: 0.751, H: 0.747, I: 0.281, J: 0.584, K: 0.719, L: 0.565, M: 0.932,
  N: 0.762, O: 0.77, P: 0.648, Q: 0.777, R: 0.657, S: 0.655, T: 0.668, U: 0.732, V: 0.747, W: 1.038, X: 0.738, Y: 0.731, Z: 0.664,
  '.': 0.334, ',': 0.334, ':': 0.334, ';': 0.343, "'": 0.339, '’': 0.311, '"': 0.552, '“': 0.54, '”': 0.532, '!': 0.338, '?': 0.559,
  '|': 0.372, '-': 0.468, '–': 0.5, '—': 1, '(': 0.377, ')': 0.377, '[': 0.377, ']': 0.377, '{': 0.469, '}': 0.469, '/': 0.388,
  '\\': 0.388, '=': 0.679, '<': 0.679, '>': 0.679, '+': 0.679, '*': 0.559, '&': 0.672, '@': 1.016, '#': 0.649, '%': 1.015,
  '…': 1.002, '·': 0.334, '→': 1, '_': 0.476, '~': 0.679, '`': 0.365, '^': 0.487, '$': 0.655,
};
/** Mean lowercase advance: one "average character". */
export const AVG_EM = 0.563;
const EMOJI = /\p{Extended_Pictographic}/u;
const charEm = (ch: string) => EM[ch] ?? (EMOJI.test(ch) ? 1.3 : /\p{Lu}/u.test(ch) ? 0.72 : /\p{N}/u.test(ch) ? 0.64 : 0.6);
/** Width of a word in em (Inter 700); mono text is 0.6em per character. */
export const wordEm = (word: string, mono = false) => (mono ? 0.6 * [...word].length : [...word].reduce((n, ch) => n + charEm(ch), 0));

const plain = (text: string | undefined) => (text ?? '').replace(/\*/g, '');
/** Words as the layout may place them: split at whitespace, zero-width spaces and after hyphens / slashes. */
export const words = (text: string) => plain(text).split(/[\s​]+|(?<=[-/])/).filter(Boolean);
/** The widest word of a text, in em. */
export const widestWordEm = (text: string, mono = false) => Math.max(0, ...words(text).map((word) => wordEm(word, mono)));

/**
 * Wrapped line count of a title on a phone (288px column at Fit zoom 1.2 → 240px),
 * at the big (14.5cqw) or regular (10.5cqw) size; Inter 900 at −0.045em tracking is
 * ≈ 1.1× the 700 widths, and each word box carries its trailing space (0.3em).
 * Cards.tsx picks the size with it; the test caps the regular count.
 */
export function titleLines(title: string, size: 'big' | 'regular') {
  const lineEm = 240 / ((size === 'big' ? 14.5 : 10.5) * 3.9);
  let lines = 1;
  let cur = 0;
  for (const word of words(title)) {
    const em = wordEm(word) * 1.1 + 0.3;
    if (cur && cur + em > lineEm) {
      lines++;
      cur = em;
    } else cur += em;
  }
  return lines;
}

/** Caption line width on a phone in em of the caption size (285px box / 24.6px ≈ 11.6em, less a safety margin). */
export const CAPTION_LINE_EM = 10.7;
/** Width of a run of caption words in em: words plus 0.36em gaps. */
export const captionEm = (ws: string[]) => ws.reduce((n, w) => n + wordEm(w) * 1.04, 0) + Math.max(0, ws.length - 1) * 0.36;

const over = (field: string, text: string | undefined, max: number, out: string[]) => {
  const n = plain(text).length;
  if (n > max) out.push(`${field} is ${n} chars (max ${max})`);
};
const count = (field: string, n: number, max: number, out: string[]) => {
  if (n > max) out.push(`${field}: ${n} (max ${max})`);
};
/** The longest word must fit one line: `max` average characters (Inter) or plain characters (`mono`). */
const overWord = (field: string, text: string | undefined, max: number, out: string[], mono = false) => {
  for (const word of words(text ?? '')) {
    const chars = mono ? [...word].length : wordEm(word) / AVG_EM;
    if (chars > max + 0.05) out.push(`${field}: word “${word}” is ≈${chars.toFixed(1)} ${mono ? '' : 'average '}chars, one line fits ${max}`);
  }
};
/** The code a code scene shows: trailing newlines dropped; pseudocode's 4-space indents shown as 2 (Code.tsx). */
export const displayCode = (code: string, lang?: string) => {
  const trimmed = code.replace(/\n+$/, '');
  return lang === 'pseudo' ? trimmed.replace(/^(?: {4})+/gm, (indent) => ' '.repeat(indent.length / 2)) : trimmed;
};
/** Lines a mono text wraps to (greedy, at spaces) with `cols` characters per line. */
const monoLines = (text: string | undefined, cols: number) => {
  let lines = 0;
  let cur = -1;
  for (const word of plain(text).split(/\s+/).filter(Boolean)) {
    const n = [...word].length;
    if (cur < 0 || cur + 1 + n > cols) {
      lines++;
      cur = n;
    } else cur += 1 + n;
  }
  return lines;
};
const widest = (text: string) => Math.max(0, ...text.split('\n').map((line) => line.length));
const byCols = (table: ByCols, cols: number) => table[Math.min(5, Math.max(1, Math.round(cols))) as keyof ByCols];

/** Human-readable list of fields in `scene` that exceed their budget. Empty when it fits. */
export function textFitProblems(scene: Scene): string[] {
  const out: string[] = [];
  const sceneTitle = (title: string | undefined, max: number) => {
    over('title', title, max, out);
    overWord('title', title, LIMITS.sceneTitleWord, out);
  };
  switch (scene.type) {
    case 'title': {
      const L = LIMITS.title;
      over('title', scene.title, L.title, out);
      overWord('title', scene.title, L.titleWord, out);
      count('title lines (phone)', titleLines(scene.title, 'regular'), L.lines, out);
      over('kicker', scene.kicker, L.kicker, out);
      over('sub', scene.sub, L.sub, out);
      overWord('sub', scene.sub, L.subWord, out);
      break;
    }
    case 'code': {
      const L = LIMITS.code;
      const code = displayCode(scene.code, scene.lang);
      count('code lines', code.split('\n').length, L.lines, out);
      count('code columns', widest(code), L.cols, out);
      over('note', scene.note?.text, L.note, out);
      overWord('note', scene.note?.text, L.noteWord, out);
      const chrome = (scene.file?.length ?? 0) + (scene.lang ?? 'tsx').length;
      if (scene.file && chrome > L.chrome) out.push(`file "${scene.file}" + lang badge is ${chrome} chars (max ${L.chrome})`);
      break;
    }
    case 'terminal': {
      const L = LIMITS.terminal;
      let lines = 0;
      scene.lines.forEach((line, i) => {
        if (line.cmd !== undefined) {
          lines++;
          over(`line ${i} cmd`, line.cmd, L.cmd, out);
        }
        if (line.out) {
          const rows = line.out.split('\n');
          lines += rows.length;
          count(`line ${i} out lines`, rows.length, L.outLines, out);
          count(`line ${i} out columns`, widest(line.out), L.outCols, out);
        }
      });
      count('terminal lines', lines, L.lines, out);
      sceneTitle(scene.title, LIMITS.diagram.title);
      break;
    }
    case 'diagram': {
      const L = LIMITS.diagram;
      const cols = scene.cols ?? 3;
      count('nodes', scene.nodes.length, L.nodes, out);
      for (const node of scene.nodes) {
        // A circle is 0.75 of a cell instead of 0.94.
        const shape = node.shape === 'circle' ? 0.8 : 1;
        over(`node ${node.id} label`, node.label, L.label, out);
        overWord(`node ${node.id} label (cols ${cols})`, node.label, byCols(L.labelWord, cols) * shape, out);
        over(`node ${node.id} sub`, node.sub, L.sub, out);
        const subLines = monoLines(node.sub, Math.floor(byCols(L.subWord, cols) * shape));
        if (subLines > 2) out.push(`node ${node.id} sub wraps to ${subLines} lines at cols ${cols} (max 2)`);
        if (node.shape === 'circle' && node.sub) out.push(`node ${node.id}: a circle only fits an icon and a label; use a pill for a sub`);
        overWord(`node ${node.id} sub (cols ${cols})`, node.sub, Math.floor(byCols(L.subWord, cols) * shape), out, true);
      }
      for (const edge of scene.edges ?? []) over(`edge ${edge.from}->${edge.to} label`, edge.label, L.edgeLabel, out);
      over('caption', scene.caption, L.caption, out);
      overWord('caption', scene.caption, L.captionWord, out, true);
      sceneTitle(scene.title, L.title);
      break;
    }
    case 'tree': {
      const L = LIMITS.tree;
      let leaves = 0;
      let depth = 0;
      const labels: [string, string][] = [];
      const walk = (node: typeof scene.root, level: number) => {
        depth = Math.max(depth, level + 1);
        labels.push([node.id, node.label]);
        if (!node.children?.length) leaves++;
        for (const child of node.children ?? []) walk(child, level + 1);
      };
      walk(scene.root, 0);
      for (const [id, label] of labels) {
        over(`node ${id} label`, label, L.label, out);
        overWord(`node ${id} label (${leaves} leaves)`, label, byCols(L.labelWord, leaves), out);
      }
      count('leaves', leaves, L.leaves, out);
      count('depth', depth, L.depth, out);
      over('caption', scene.caption, L.caption, out);
      overWord('caption', scene.caption, L.captionWord, out, true);
      sceneTitle(scene.title, L.title);
      break;
    }
    case 'phone': {
      const L = LIMITS.phone;
      const s = scene.screen;
      over('caption', scene.caption, L.caption, out);
      overWord('caption', scene.caption, L.captionWord, out, true);
      const notice = (name: string, n: { title: string; body?: string }) => {
        over(`${name} title`, n.title, L.noticeTitle, out);
        overWord(`${name} title`, n.title, L.noticeTitleWord, out);
        over(`${name} body`, n.body, L.noticeBody, out);
        overWord(`${name} body`, n.body, L.noticeBodyWord, out);
      };
      if (s.kind === 'app') {
        over('title', s.title, L.title, out);
        overWord('title', s.title, L.titleWord, out);
        over('body', s.body, L.body, out);
        over('toast', s.toast, L.toast, out);
        count('items', s.items?.length ?? 0, L.items, out);
        for (const item of s.items ?? []) {
          over(`item "${item.label}"`, item.label, L.itemLabel, out);
          overWord(`item "${item.label}"`, item.label, L.itemLabelWord, out);
          over(`item "${item.label}" sub`, item.sub, L.itemSub, out);
          overWord(`item "${item.label}" sub`, item.sub, L.itemSubWord, out);
          over(`item "${item.label}" value`, item.value, L.itemValue, out);
        }
      } else if (s.kind === 'permission') over('permission text', s.text, L.permission, out);
      else if (s.kind === 'notification') notice('notice', s.notice);
      else if (s.kind === 'bubble') over('bubble text', s.text, L.bubble, out);
      else if (s.kind === 'crash') over('crash message', s.message, L.crash, out);
      else if (s.kind === 'lock') for (const n of s.notices ?? []) notice(`notice "${n.title}"`, n);
      break;
    }
    case 'compare': {
      const L = LIMITS.compare;
      sceneTitle(scene.title, L.sceneTitle);
      for (const side of [scene.left, scene.right]) {
        over(`side "${side.title}" title`, side.title, L.title, out);
        overWord(`side "${side.title}" title`, side.title, L.titleWord, out, true);
        count(`side "${side.title}" items`, side.items?.length ?? 0, L.items, out);
        for (const item of side.items ?? []) {
          over(`side "${side.title}" item`, item, L.item, out);
          overWord(`side "${side.title}" item`, item, L.itemWord, out);
        }
        if (side.code) {
          count(`side "${side.title}" code lines`, side.code.split('\n').length, L.codeLines, out);
          count(`side "${side.title}" code columns`, widest(side.code), L.codeCols, out);
        }
      }
      break;
    }
    case 'list': {
      const L = LIMITS.list;
      sceneTitle(scene.title, L.title);
      count('items', scene.items.length, L.items, out);
      for (const raw of scene.items) {
        const item = typeof raw === 'string' ? { text: raw } : raw;
        const name = `item "${plain(item.text).slice(0, 16)}"`;
        over(name, item.text, L.text, out);
        overWord(name, item.text, L.textWord, out);
        over(`${name} sub`, item.sub, L.sub, out);
        overWord(`${name} sub`, item.sub, L.subWord, out);
      }
      break;
    }
    case 'timeline': {
      const L = LIMITS.timeline;
      sceneTitle(scene.title, L.title);
      count('steps', scene.steps.length, L.steps, out);
      for (const step of scene.steps) {
        over(`step "${step.label}"`, step.label, L.label, out);
        overWord(`step "${step.label}"`, step.label, L.labelWord, out);
        over(`step "${step.label}" sub`, step.sub, L.sub, out);
        overWord(`step "${step.label}" sub`, step.sub, L.subWord, out, true);
      }
      break;
    }
    case 'stat': {
      const L = LIMITS.stat;
      over('value', scene.value, L.value, out);
      over('unit', scene.unit, L.unit, out);
      over('label', scene.label, L.label, out);
      overWord('label', scene.label, L.labelWord, out);
      over('sub', scene.sub, L.sub, out);
      overWord('sub', scene.sub, L.subWord, out);
      break;
    }
    case 'quiz': {
      const L = LIMITS.quiz;
      over('question', scene.question, L.question, out);
      overWord('question', scene.question, L.questionWord, out);
      count('options', scene.options.length, L.options, out);
      for (const option of scene.options) {
        over(`option "${plain(option).slice(0, 16)}"`, option, L.option, out);
        overWord(`option "${plain(option).slice(0, 16)}"`, option, L.optionWord, out);
      }
      over('explain', scene.explain, L.explain, out);
      overWord('explain', scene.explain, L.explainWord, out, true);
      break;
    }
    case 'array':
    case 'grid':
    case 'intervals': {
      const L = LIMITS[scene.type];
      const vars = scene.vars ?? {};
      count('vars', Object.keys(vars).length, L.vars, out);
      for (const [key, value] of Object.entries(vars)) {
        over(`var "${key}" key`, key, L.varKey, out);
        over(`var "${key}" value`, String(value), L.varValue, out);
      }
      count('vars lines (phone)', varRows(vars), L.varRows, out);
      over('caption', scene.caption, L.caption, out);
      overWord('caption', scene.caption, L.captionWord, out, true);
      sceneTitle(scene.title, L.title);
      const cellText = (cells: (string | number)[], pitch: number, where: string) => {
        const max = cellEmMax(pitch);
        for (const cell of cells) {
          const em = wordEm(String(cell)) * 1.04;
          if (em > max + 0.005) out.push(`${where}: cell “${cell}” is ${em.toFixed(2)}em wide, a ${pitch.toFixed(0)}px cell fits ${max.toFixed(2)}em at 15px`);
        }
      };
      if (scene.type === 'intervals') {
        const I = LIMITS.intervals;
        count('bars', scene.bars.length, I.bars, out);
        count('axis span', scene.axis[1] - scene.axis[0], I.axisSpan, out);
        for (const bar of scene.bars) over(`bar "${intervalLabel(bar)}" label`, intervalLabel(bar), I.label, out);
      } else if (scene.type === 'array') {
        const A = LIMITS.array;
        count('cells', scene.cells.length, A.cells, out);
        cellText(scene.cells, cellPitchPx(scene.cells.length, ARRAY_INSET_CQW), `${scene.cells.length} cells`);
        const pointers = Object.keys(scene.pointers ?? {});
        count('pointers', pointers.length, A.pointers, out);
        for (const name of pointers) over(`pointer "${name}"`, name, A.pointerName, out);
      } else {
        const G = LIMITS.grid;
        const cols = Math.max(0, ...scene.cells.map((row) => row.length));
        count('grid rows', scene.cells.length, G.rows, out);
        count('grid columns', cols, G.cols, out);
        for (const label of scene.rowLabels ?? []) over(`row label "${label}"`, label, G.rowLabel, out);
        for (const label of scene.colLabels ?? []) over(`column label "${label}"`, label, G.colLabel, out);
        const pitch = cellPitchPx(cols, gridLabelCqw(scene.rowLabels), scene.cells.length + (scene.colLabels ? 1 : 0));
        cellText(scene.cells.flat(), pitch, `${scene.cells.length}×${cols} grid`);
        // A column label sits over one cell (mono at 3.2cqw ≈ 12.5px on a phone).
        for (const label of scene.colLabels ?? [])
          if ([...label].length * 0.6 * 12.5 > pitch - 2) out.push(`column label "${label}" is wider than a ${pitch.toFixed(0)}px column`);
      }
      break;
    }
    case 'outro': {
      const L = LIMITS.outro;
      over('title', scene.title, L.title, out);
      count('points', scene.points.length, L.points, out);
      for (const point of scene.points) {
        over(`point "${plain(point).slice(0, 16)}"`, point, L.point, out);
        overWord(`point "${plain(point).slice(0, 16)}"`, point, L.pointWord, out);
      }
      over('tagline', scene.tagline, L.tagline, out);
      overWord('tagline', scene.tagline, L.taglineWord, out);
      break;
    }
  }
  return out;
}
