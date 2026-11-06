// Reel data model. Series files in ./series/*.ts export `series: Series`.
// Keep series files free of runtime imports (type-only imports are fine) so
// scripts/reels-extract.mjs can load them with Node's TypeScript stripping.

/** Semantic colour. `accent` uses the series colour. */
export type Tone = 'accent' | 'good' | 'bad' | 'warn' | 'info' | 'muted';

export type Sfx =
  | 'whoosh'
  | 'pop'
  | 'click'
  | 'type'
  | 'ding'
  | 'success'
  | 'error'
  | 'riser'
  | 'swipe'
  | 'none';

/** 1-based line number, or an inclusive [from, to] range. */
export type LineRange = number | [number, number];

export type CodeLang =
  | 'tsx'
  | 'ts'
  | 'js'
  | 'json'
  | 'bash'
  | 'kotlin'
  | 'java'
  | 'swift'
  | 'objc'
  | 'xml'
  | 'gradle'
  | 'ruby'
  | 'cpp'
  | 'text';

export interface TitleScene {
  type: 'title';
  /** Small label above the title, e.g. "React internals". */
  kicker?: string;
  /** Giant kinetic text. Wrap words in *stars* to colour them with the accent. */
  title: string;
  sub?: string;
  /** One big emoji/icon character that bounces in. */
  emoji?: string;
  /** slam = words punch in, stack = huge stacked lines, glitch = RGB-split shake. */
  style?: 'slam' | 'stack' | 'glitch';
}

export interface CodeNote {
  /** Line the callout points at (1-based). */
  line: number;
  text: string;
  tone?: Tone;
}

export interface CodeScene {
  type: 'code';
  lang?: CodeLang;
  /** Tab title, e.g. "Counter.tsx". */
  file?: string;
  /** Source. Keep it short: ≤ 14 lines, ≤ 34 chars per line reads best. */
  code: string;
  /** Lines glow with the accent colour. */
  highlight?: LineRange[];
  /** Lines glow red (bugs). */
  errors?: LineRange[];
  /** Lines glow green (fixes / new code). */
  added?: LineRange[];
  /** Dim everything that is not highlighted/errors/added. Default true when any mark exists. */
  focus?: boolean;
  note?: CodeNote;
}

export interface DiagramNode {
  id: string;
  label: string;
  /** Grid column (0-based, fractions allowed). */
  x: number;
  /** Grid row (0-based, fractions allowed). */
  y: number;
  sub?: string;
  icon?: string;
  tone?: Tone;
  shape?: 'box' | 'pill' | 'circle';
  /** Pulses and glows. */
  active?: boolean;
  /** Greyed out (e.g. a killed process). */
  dim?: boolean;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  dashed?: boolean;
  /** Animated marching dashes + glow. */
  active?: boolean;
  /** Draw a head at both ends. */
  both?: boolean;
}

export interface DiagramPacket {
  from: string;
  to: string;
  label?: string;
  tone?: Tone;
  /** Repeat forever (default true). */
  loop?: boolean;
}

export interface DiagramScene {
  type: 'diagram';
  title?: string;
  /** Grid size. Defaults: 3 columns × 4 rows. */
  cols?: number;
  rows?: number;
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  packets?: DiagramPacket[];
  caption?: string;
}

export interface PhoneItem {
  /** Stable id so reorders animate (defaults to label). */
  id?: string;
  label: string;
  sub?: string;
  icon?: string;
  /** Renders a text input showing this value. */
  value?: string;
  /** Renders a checkbox. */
  checked?: boolean;
  tone?: Tone;
}

export interface PhoneNotice {
  app: string;
  title: string;
  body?: string;
  icon?: string;
}

export type PhoneScreen =
  | {
      kind: 'app';
      title: string;
      icon?: string;
      body?: string;
      items?: PhoneItem[];
      button?: string;
      /** Small floating toast at the bottom of the screen. */
      toast?: string;
      /** Spinner over the content. */
      loading?: boolean;
    }
  | {
      kind: 'permission';
      app: string;
      icon?: string;
      text: string;
      allow?: string;
      deny?: string;
      /** Animates a tap on one of the buttons. */
      choice?: 'allow' | 'deny';
    }
  | { kind: 'notification'; notice: PhoneNotice; behind?: 'home' | 'lock' | 'app' }
  | { kind: 'bubble'; app: string; icon?: string; text?: string; behind?: 'home' | 'app' }
  | { kind: 'home'; apps?: { icon: string; label: string }[]; highlight?: string }
  | { kind: 'lock'; time?: string; notices?: PhoneNotice[] }
  | { kind: 'killed'; app: string; icon?: string; reason?: string }
  | { kind: 'crash'; app: string; message?: string }
  | { kind: 'splash'; app: string; icon?: string };

export interface PhoneScene {
  type: 'phone';
  os?: 'ios' | 'android';
  screen: PhoneScreen;
  /** Label beside/below the phone. */
  caption?: string;
  /** Tap ripple at a position on the screen (0–1 fractions). */
  tap?: { x: number; y: number };
}

export interface CompareSide {
  title: string;
  /** ok = ✅, bad = ❌, neutral = no badge. */
  verdict?: 'ok' | 'bad' | 'neutral';
  items?: string[];
  code?: string;
  icon?: string;
}

export interface CompareScene {
  type: 'compare';
  title?: string;
  left: CompareSide;
  right: CompareSide;
}

export type ListItem = string | { text: string; icon?: string; sub?: string; tone?: Tone };

export interface ListScene {
  type: 'list';
  title?: string;
  items: ListItem[];
  numbered?: boolean;
  /** 0-based index of the highlighted item. */
  active?: number;
}

export interface TerminalLine {
  /** Typed after a `$` prompt. */
  cmd?: string;
  /** Printed output. */
  out?: string;
  tone?: Tone;
}

export interface TerminalScene {
  type: 'terminal';
  title?: string;
  lines: TerminalLine[];
}

export interface TreeNode {
  id: string;
  label: string;
  tone?: Tone;
  /** Glows and pulses (e.g. currently rendering). */
  active?: boolean;
  /** Dashed outline + dot badge (e.g. needs re-render). */
  dirty?: boolean;
  dim?: boolean;
  children?: TreeNode[];
}

export interface TreeScene {
  type: 'tree';
  title?: string;
  root: TreeNode;
  caption?: string;
}

export interface TimelineStep {
  label: string;
  sub?: string;
  icon?: string;
  tone?: Tone;
}

export interface TimelineScene {
  type: 'timeline';
  title?: string;
  steps: TimelineStep[];
  /** 0-based index of the current step. Earlier steps show as done. */
  active?: number;
}

export interface StatScene {
  type: 'stat';
  /** "16.6", "60", "3x", "200ms". Leading numbers count up. */
  value: string;
  unit?: string;
  label: string;
  sub?: string;
  tone?: Tone;
}

export interface QuizScene {
  type: 'quiz';
  question: string;
  options: string[];
  /** 0-based correct option. */
  answer: number;
  /** false = asking, true = show the answer. Repeat the quiz on the next beat with reveal: true. */
  reveal?: boolean;
  explain?: string;
}

export interface OutroScene {
  type: 'outro';
  /** Defaults to "Remember this". */
  title?: string;
  points: string[];
  tagline?: string;
}

export type Scene =
  | TitleScene
  | CodeScene
  | DiagramScene
  | PhoneScene
  | CompareScene
  | ListScene
  | TerminalScene
  | TreeScene
  | TimelineScene
  | StatScene
  | QuizScene
  | OutroScene;

export type SceneType = Scene['type'];

export interface Beat {
  /** One narration sentence. Shown as captions. */
  say: string;
  /** Optional pronunciation override sent to TTS instead of `say` (captions still show `say`). */
  speak?: string;
  scene: Scene;
  sfx?: Sfx;
  /** Words in `say` to highlight in captions (case-insensitive, punctuation ignored). */
  emphasis?: string[];
}

export interface Reel {
  /** Globally unique kebab-case id. Also the audio file name. */
  id: string;
  title: string;
  beats: Beat[];
}

export interface Series {
  id: string;
  title: string;
  emoji: string;
  /** Accent colour (hex). */
  color: string;
  /** Sort order on the feed. */
  order: number;
  blurb?: string;
  reels: Reel[];
}

/** public/react-native-reels/audio/<reelId>.json */
export interface AudioManifest {
  /** Seconds, per beat, in beat order. `words` are absolute [start, end] per caption word when aligned. */
  beats: { start: number; end: number; words?: [number, number][] }[];
  duration: number;
  hash: string;
  /** Audio file name next to the manifest, e.g. "set-state.m4a". */
  file?: string;
}

export interface ReelsProgress {
  watched: string[];
  saved: string[];
  lastReel: string | null;
}
