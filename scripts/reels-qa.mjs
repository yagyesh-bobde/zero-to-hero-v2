// Visual QA for React Native Reels and /shorts: renders every beat of every reel at phone and
// laptop sizes, at several frozen moments per beat, and checks the DOM for
// overflow, collisions with the caption / rail / progress safe zones, clipped or
// tiny text and overlapping blocks. Screenshots, a JSON report and an HTML
// contact sheet land in .reels-qa/ (gitignored). Exits 1 on any failure.
//
// Usage: node scripts/reels-qa.mjs [--reel <id>[,<id>…]] [--viewport phone|laptop] [--no-shots]
//        [--workers 6] [--root <dir>] [--out <dir>] [--moments enter,settle,mid,end,longcap]
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const root = path.resolve(opt('root', path.resolve(here, '..')));
const out = path.resolve(opt('out', path.join(root, '.reels-qa')));
const onlyReel = opt('reel', null);
const onlyViewport = opt('viewport', null);
const shots = !flag('no-shots');
const workers = Math.max(1, Number(opt('workers', 6)) || 6);
const momentNames = opt('moments', 'enter,settle,mid,end,longcap').split(',');

const VIEWPORTS = {
  phone: { width: 390, height: 844, isMobile: true, hasTouch: true },
  laptop: { width: 1440, height: 900, isMobile: false, hasTouch: false },
};

/** Rules and thresholds (px unless noted). Documented in the report. */
const RULES = {
  'zone-overflow': 'scene content outside the content safe zone (.stage-scenes), tolerance 1px',
  'caption-gap': 'scene content closer than minGap (3.5% of stage width) to the caption text, or overlapping it',
  'rail-clear': 'scene content or the caption closer than railClearance (12px) to the right-side action rail icons it shares rows with (phone)',
  'top-overlap': 'scene content overlapping the progress bar / title chrome',
  'sibling-overlap': 'two sibling content blocks overlapping by more than 2px',
  'overlay-covers-text': 'an overlay (VS badge, packet) painted over scene text',
  'clipped': 'text cut off by an overflow:hidden ancestor, or ellipsised',
  'font-min': 'font size below the minimum for its role (caption 20, title 18, body 13, diagram label 13, small labels/mono 11, phone-mock 8, chrome 11)',
  'caption-lines': 'a caption chunk wrapping to more than 2 lines or leaving its box',
  'caption-words': 'two caption words on one line closer than captionWordGap em (the spoken-word chip would eat the gap)',
  'caption-orphan-line': 'a caption chunk whose second line holds a single word (rendered, or by the phone-width estimate of every chunk)',
  'heading-jump': 'a scene heading sitting more than headingJump of the stage height away from the reel’s median heading position',
  'title-lines': 'a title wrapping to more than maxTitleLines lines',
  'dia-size': 'a diagram/tree whose nodes span less than minDiaWidth of the zone width',
  'stat-unit-gap': 'a stat unit closer than statUnitGap em of the value size to the number',
  'blank': 'no scene ink at or above minInk opacity at a sampled moment (a blank flash on a beat change)',
  'fit-scaled': 'scene auto-shrunk below 85% to fit the zone (content too tall)',
  'composition': 'the content zone is off the stage axis, or (centred scene types) the ink bounding box centre sits more than centerTolerance of the zone width off the zone centre',
  'fill': 'at the end of a beat the settled ink box covers less than minFill of the zone height (content left floating in dead space)',
  'caption-sentence': 'a caption chunk spans a sentence end (". We used the array")',
  'caption-orphan': 'a sentence ends on a single short word in its own chunk although the previous chunk could have spared one',
  'word-split': 'a word (scene text or caption) broken across two lines, or running past the border of the box it sits in; a zero-width space (U+200B) or a hyphen marks the only allowed break inside a word',
  'error': 'the beat could not be rendered / frozen',
};

const fail = (message) => {
  console.error(`reels-qa: ${message}`);
  process.exit(2);
};

// ── Load reels, timings and the engine's timeline helpers from the root under test ──
// Each folder renders on its own page: course series on /react-native-reels, sampler shorts on /shorts.
const collections = [
  { dir: 'src/reels/series', route: '/react-native-reels' },
  { dir: 'src/reels/shorts', route: '/shorts' },
  { dir: 'src/reels/engineering', route: '/engineering' },
  { dir: 'src/reels/dsa', route: '/dsa/reels' },
];
const audioDir = path.join(root, 'public/react-native-reels/audio');
const timeline = await import(pathToFileURL(path.join(root, 'src/reels/timeline.ts')).href);
const reels = [];
for (const { dir, route } of collections) {
  const files = (await readdir(path.join(root, dir))).filter((f) => f.endsWith('.ts')).sort();
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(root, dir, file)).href);
    for (const reel of mod.series?.reels ?? []) reels.push({ ...reel, file, route, seriesTitle: mod.series.title });
  }
}
const selected = reels.filter((r) => !onlyReel || onlyReel.split(',').includes(r.id));
if (!selected.length) fail(`no reel matches "${onlyReel}"`);
const viewports = Object.keys(VIEWPORTS).filter((v) => !onlyViewport || v === onlyViewport);
if (!viewports.length) fail(`unknown viewport "${onlyViewport}"`);

async function manifestFor(reel) {
  try {
    const json = JSON.parse(await readFile(path.join(audioDir, `${reel.id}.json`), 'utf8'));
    if (timeline.manifestFits(reel, json)) return json;
  } catch {
    /* no audio yet: fall back to the estimated clock, exactly like the player */
  }
  return timeline.estimateManifest(reel);
}

/** Moments (ms into the beat) worth freezing: mid-transition, after enter animations settle, middle, end, longest caption. */
function momentsFor(reel, manifest, index) {
  const beat = manifest.beats[index];
  const next = manifest.beats[index + 1];
  const dur = ((next?.start ?? manifest.duration) - beat.start) * 1000;
  const words = timeline.splitWords(reel.beats[index].say);
  const chunks = timeline.captionChunks(words);
  const longest = chunks.reduce((a, b) => (b.map((i) => words[i]).join(' ').length > a.map((i) => words[i]).join(' ').length ? b : a));
  const times = timeline.wordTimes(reel.beats[index].say, beat);
  const all = {
    enter: Math.min(80, dur), // the frame a viewer sees right after a beat change (QA: `blank`)
    settle: Math.min(1800, Math.max(200, dur - 200)),
    mid: dur / 2,
    end: Math.max(0, dur - 150),
    longcap: Math.min(dur - 100, Math.max(0, (times[longest[0]][0] - beat.start) * 1000 + 80)),
  };
  const seen = new Set();
  return momentNames
    .filter((name) => name in all)
    .map((name) => ({ name, t: Math.round(all[name]) }))
    .filter((m) => !seen.has(m.t) && seen.add(m.t))
    .sort((a, b) => a.t - b.t);
}

// ── In-page checker (serialised by Playwright; must stay self-contained) ──
function checkFrame(cfg) {
  const findings = [];
  const stage = document.querySelector('.stage.is-playing, .stage.is-paused');
  if (!stage) return { findings: [{ rule: 'error', el: 'stage', detail: 'player stage not found' }], metrics: {} };
  const frame = stage.closest('.frame');
  const zone = stage.querySelector('.stage-scenes');
  const layer = stage.querySelector('.scene-layer.is-current');
  const captionLine = stage.querySelector('.caption-line');
  const captionsBox = stage.querySelector('.captions');
  const topBits = [...stage.querySelectorAll('.segments, .stage-meta')];
  const railBtns = [...(frame?.querySelectorAll('.rail-btn') ?? [])];
  if (!zone || !layer) return { findings: [{ rule: 'error', el: 'scene', detail: 'no current scene layer' }], metrics: {} };

  const R = (el) => el.getBoundingClientRect();
  const union = (rects) =>
    rects.reduce(
      (u, r) => ({ left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) }),
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    );
  const overlap = (a, b, tol = 0) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > tol && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tol;
  const inside = (a, b, tol = 1) => a.left >= b.left - tol && a.right <= b.right + tol && a.top >= b.top - tol && a.bottom <= b.bottom + tol;
  const fmt = (r) => `[${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.right - r.left)}x${Math.round(r.bottom - r.top)}]`;
  const label = (el) => {
    const parts = [];
    for (let e = el; e && e !== layer && parts.length < 3; e = e.parentElement) {
      const cls = [...e.classList].filter((c) => !/^(is-|tone-|verdict-|shape-)/.test(c)).slice(0, 2).join('.');
      const i = e.parentElement ? [...e.parentElement.children].indexOf(e) + 1 : 1;
      parts.unshift(`${e.tagName.toLowerCase()}${cls ? '.' + cls : ''}${i > 1 ? `:nth-child(${i})` : ''}`);
    }
    const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 32);
    return `${parts.join(' > ')}${text ? ` “${text}”` : ''}`;
  };
  const opacityOf = (el) => {
    let o = 1;
    for (let e = el; e && e !== stage; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
    return o;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && opacityOf(el) > 0.08;
  };
  // Layout rules judge elements once they are on screen and their enter animations
  // (finite ones; ambient loops like glows don't count) have finished.
  const animating = (el) => {
    for (let e = el; e && e !== stage; e = e.parentElement)
      for (const a of e.getAnimations()) {
        const timing = a.effect?.getComputedTiming();
        if (!timing || timing.iterations === Infinity) continue;
        if ((a.currentTime ?? 0) < timing.endTime) return true;
      }
    return false;
  };
  const settled = (el) => opacityOf(el) >= 0.5 && !animating(el);
  // Composition counts dimmed items too (they still occupy the picture), just not ones still flying in.
  const present = (el) => !animating(el);
  const hasBox = (cs) =>
    (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') ||
    cs.backgroundImage !== 'none' ||
    ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== 'none');
  // The applied scene scale (zoom up to --zoom-max, or a shrink): rendered sizes are layout sizes × this.
  const fitScale = (el) => {
    const fit = el.closest('.scene-fit');
    return fit ? parseFloat(getComputedStyle(fit).getPropertyValue('--fit')) || 1 : 1;
  };
  const DECOR = '.stat-burst, .stage-bg, .phone-tap, .tl-rail, .tl-fill, svg, .ph-scrim, .ph-skeleton, .code-note-row:not(.is-open), .quiz-timer';
  const OVERLAY = '.cmp-vs, .cmp-stamp, .dia-packet, .ph-scrim, .ph-dialog, .ph-banner, .ph-bubble, .ph-toast, .ph-spinner, .phone-status, .phone-tap, .ph-killed-label, .ph-recents-card, .code-cursor';

  // Ink items: visible text runs and boxes inside the current scene.
  const items = [];
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      const el = node.parentElement;
      if (!node.textContent.trim() || !el || el.closest(DECOR) || !visible(el)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      if (rects.length) items.push({ el, rect: union(rects), text: true, settled: settled(el), present: present(el) });
    } else if (!node.closest(DECOR) && visible(node) && hasBox(getComputedStyle(node))) {
      const r = R(node);
      if (r.width > 0 && r.height > 0) items.push({ el: node, rect: r, text: false, settled: settled(node), present: present(node) });
    }
  }
  const add = (rule, el, detail) => findings.push({ rule, el: label(el), detail });

  // Safe zones.
  const zoneRect = R(zone);
  // The caption's ink: the union of its word boxes (the line box itself is always full width).
  const capWords = captionLine ? [...captionLine.querySelectorAll('.cw')] : [];
  const capRect = capWords.length ? union(capWords.map(R)) : captionLine ? R(captionLine) : null;
  const topRect = topBits.length ? union(topBits.map(R)) : null;
  const railRect = railBtns.length && cfg.viewport === 'phone' ? union(railBtns.map(R)) : null;
  const minGap = cfg.minGapRatio * R(stage).width;
  for (const it of items) {
    if (!it.settled) continue;
    // Text rects are glyph boxes (ascender/descender), so they get a little more slack than boxes.
    if (!inside(it.rect, zoneRect, it.text ? 3 : 1)) add('zone-overflow', it.el, `${fmt(it.rect)} outside zone ${fmt(zoneRect)}`);
    if (capRect && it.rect.right > capRect.left && it.rect.left < capRect.right) {
      const gap = capRect.top - it.rect.bottom;
      if (overlap(it.rect, capRect)) add('caption-gap', it.el, `overlaps caption ${fmt(capRect)}`);
      else if (gap < minGap) add('caption-gap', it.el, `${Math.round(gap)}px above caption (min ${Math.round(minGap)})`);
    }
    if (topRect && overlap(it.rect, topRect)) add('top-overlap', it.el, `${fmt(it.rect)} hits chrome ${fmt(topRect)}`);
  }
  // Everything that shares rows with the rail icons keeps a clear gutter in front of them.
  if (railRect) {
    const clearance = (r) => (r.bottom > railRect.top && r.top < railRect.bottom ? railRect.left - r.right : Infinity);
    for (const it of items)
      if (it.settled && clearance(it.rect) < cfg.railClearance) add('rail-clear', it.el, `${fmt(it.rect)} is ${Math.round(clearance(it.rect))}px from the rail ${fmt(railRect)} (min ${cfg.railClearance})`);
    if (capRect && clearance(capRect) < cfg.railClearance) add('rail-clear', captionLine, `caption ${fmt(capRect)} is ${Math.round(clearance(capRect))}px from the rail (min ${cfg.railClearance})`);
  }
  // A blank flash: at every sampled moment some scene ink is already (or still) readable.
  if (!items.some((it) => opacityOf(it.el) >= cfg.minInk)) add('blank', layer, `no scene ink at opacity ≥ ${cfg.minInk}`);

  // Composition: the zone sits on the stage axis; centred scene types keep their ink centred in it;
  // by the end of a beat the settled ink should fill a fair share of the zone's height.
  const stageRect = R(stage);
  const metrics = { zoneOffset: (zoneRect.left + zoneRect.right - stageRect.left - stageRect.right) / 2 / stageRect.width };
  if (Math.abs(metrics.zoneOffset) > cfg.zoneAxisTolerance) add('composition', zone, `content zone is ${(metrics.zoneOffset * 100).toFixed(1)}% of the stage width off the stage axis`);
  const ink = items.filter((it) => it.present && inside(it.rect, zoneRect, 6)).map((it) => it.rect);
  if (ink.length) {
    const box = union(ink);
    metrics.offset = ((box.left + box.right) / 2 - (zoneRect.left + zoneRect.right) / 2) / (zoneRect.right - zoneRect.left);
    metrics.fillW = (box.right - box.left) / (zoneRect.right - zoneRect.left);
    metrics.fillH = (box.bottom - box.top) / (zoneRect.bottom - zoneRect.top);
    // (not mid-transition: on the `enter` frame only part of the scene has popped in)
    if (cfg.moment !== 'enter' && cfg.centredTypes.includes(cfg.type) && Math.abs(metrics.offset) > cfg.centerTolerance)
      add('composition', layer, `ink ${fmt(box)} centre is ${(metrics.offset * 100).toFixed(1)}% of the zone width off centre (max ${cfg.centerTolerance * 100}%)`);
    if (cfg.moment === 'end' && metrics.fillH < cfg.minFill)
      add('fill', layer, `ink ${fmt(box)} fills ${(metrics.fillH * 100).toFixed(0)}% of the zone height (min ${cfg.minFill * 100}%)`);
  }
  // Heading position (the reel-level `heading-jump` check compares the `end` frames of a reel).
  const heading = layer.querySelector('.fit-head .scene-title');
  if (heading && cfg.moment === 'end') metrics.headingTop = (R(heading).top - stageRect.top) / stageRect.height;
  // Diagrams and trees use the width they have: the nodes span a fair share of the zone.
  // Checked on the settled \`end\` frame: nodes still popping in at a beat's start don't count.
  const diaNodes = [...layer.querySelectorAll('.dia-node')].filter((el) => visible(el) && present(el.querySelector('.dia-node-inner') ?? el));
  if (diaNodes.length && cfg.moment === 'end') {
    const span = union(diaNodes.map(R));
    metrics.diaWidth = (span.right - span.left) / (zoneRect.right - zoneRect.left);
    if (metrics.diaWidth < cfg.minDiaWidth) add('dia-size', layer, `nodes ${fmt(span)} span ${(metrics.diaWidth * 100).toFixed(0)}% of the zone width (min ${cfg.minDiaWidth * 100}%)`);
  }
  // Titles: balanced wrapping within maxTitleLines lines.
  const titleWords = [...layer.querySelectorAll('.title-word')].filter(visible);
  if (titleWords.length) {
    const tops = titleWords.map((w) => Math.round(R(w).top));
    const lines = new Set(tops).size;
    if (lines > cfg.maxTitleLines) add('title-lines', layer.querySelector('.title-text'), `${lines} lines (max ${cfg.maxTitleLines})`);
  }
  // Stat: the unit keeps a little air from the number.
  const unit = layer.querySelector('.stat-unit');
  if (unit && unit.previousSibling?.nodeType === Node.TEXT_NODE) {
    const range = document.createRange();
    range.selectNodeContents(unit.previousSibling);
    const num = union([...range.getClientRects()]);
    const size = parseFloat(getComputedStyle(unit.parentElement).fontSize) * fitScale(unit);
    const gap = R(unit).left - num.right;
    if (gap < cfg.statUnitGap * size) add('stat-unit-gap', unit, `${gap.toFixed(1)}px between the number and the unit (min ${(cfg.statUnitGap * size).toFixed(1)})`);
  }
  // Overlays (VS badge, packets) never paint over text: the text must win the hit test where they meet.
  for (const ov of layer.querySelectorAll('.cmp-vs, .dia-packet')) {
    if (!visible(ov)) continue;
    const ro = R(ov);
    for (const it of items) {
      if (!it.text || !it.settled || it.el.closest(OVERLAY) || !overlap(it.rect, ro)) continue;
      const cx = (Math.max(it.rect.left, ro.left) + Math.min(it.rect.right, ro.right)) / 2;
      const cy = (Math.max(it.rect.top, ro.top) + Math.min(it.rect.bottom, ro.bottom)) / 2;
      const hit = document.elementFromPoint(cx, cy);
      if (hit && (hit === ov || ov.contains(hit))) add('overlay-covers-text', it.el, `${fmt(it.rect)} covered by ${label(ov)} ${fmt(ro)}`);
    }
  }

  // Clipping: ink beyond the nearest overflow-hidden ancestor, or an ellipsis.
  for (const it of items) {
    for (let e = it.el; e && e !== layer; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (e !== it.el && /hidden|clip/.test(cs.overflowX + cs.overflowY)) {
        if (!inside(it.rect, R(e), 1)) add('clipped', it.el, `${fmt(it.rect)} clipped by ${label(e)} ${fmt(R(e))}`);
        break;
      }
    }
    if (it.text) {
      const cs = getComputedStyle(it.el);
      if (cs.textOverflow === 'ellipsis' && it.el.scrollWidth > it.el.clientWidth + 1) add('clipped', it.el, 'text ellipsised');
    }
  }

  // Sibling overlaps between blocks in normal flow (plus diagram nodes/labels, which are absolute).
  const blocks = [...new Set(items.filter((it) => !it.text || hasBox(getComputedStyle(it.el))).map((it) => it.el))];
  const textEls = [...new Set(items.filter((it) => it.text).map((it) => it.el))];
  const candidates = [...new Set([...blocks, ...textEls])].filter((el) => !el.closest(OVERLAY) && el !== layer && settled(el));
  const byParent = new Map();
  for (const el of candidates) {
    const cs = getComputedStyle(el);
    const isDia = el.matches('.dia-node, .dia-edge-label');
    if (!isDia && cs.position !== 'static' && cs.position !== 'relative') continue;
    const key = el.parentElement;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(el);
  }
  const seenPairs = new Set();
  for (const group of byParent.values()) {
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = R(a);
        const rb = R(b);
        if (overlap(ra, rb, cfg.overlapTolerance)) {
          const key = label(a) + '|' + label(b);
          if (!seenPairs.has(key)) {
            seenPairs.add(key);
            findings.push({ rule: 'sibling-overlap', el: label(a), detail: `${fmt(ra)} overlaps ${label(b)} ${fmt(rb)}` });
          }
        }
      }
  }

  // Minimum font sizes per role.
  const roles = [
    ['.caption-line, .cw', 'caption'],
    ['.phone-screen *', 'phone'],
    ['.dia-label', 'label'],
    ['.code-text, .code-gutter, .term-body *, .cmp-code, .dia-label, .dia-sub, .dia-edge-label, .tl-text small, .list-text small, .scene-caption, .code-file, .code-lang, .code-note, .quiz-explain, .dia-packet, .title-kicker, .quiz-badge, .outro-check', 'small'],
    ['.title-text, .scene-title, .quiz-q, .outro-title, .stat-value, .stat-label', 'title'],
  ];
  // One finding per role + size per frame (a code block has dozens of spans at the same size).
  const small = new Map();
  for (const el of textEls) {
    const role = roles.find(([sel]) => el.matches(sel) || el.closest(sel))?.[1] ?? 'body';
    const size = parseFloat(getComputedStyle(el).fontSize) * fitScale(el);
    if (size >= cfg.minFont[role]) continue;
    const key = `${role}:${size.toFixed(1)}`;
    if (!small.has(key)) small.set(key, { el, role, size, count: 0 });
    small.get(key).count++;
  }
  for (const { el, role, size, count } of small.values())
    add('font-min', el, `${size.toFixed(1)}px < ${cfg.minFont[role]}px (${role}${count > 1 ? `, ${count} elements` : ''})`);
  for (const el of [...stage.querySelectorAll('.stage-series, .stage-reel-title'), ...(frame?.querySelectorAll('.rail-label') ?? [])]) {
    if (visible(el) && parseFloat(getComputedStyle(el).fontSize) < cfg.minFont.chrome) add('font-min', el, `chrome text ${getComputedStyle(el).fontSize}`);
  }

  // Captions: at most two lines, inside their box, readable size, no rail collision.
  if (captionLine && captionsBox) {
    const cs = getComputedStyle(captionLine);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const words = [...captionLine.querySelectorAll('.cw')];
    const rects = words.map(R);
    const tops = rects.map((r) => r.top).sort((a, b) => a - b);
    const lines = tops.reduce((n, top, i) => n + (i > 0 && top - tops[i - 1] > lh * 0.5 ? 1 : 0), tops.length ? 1 : 0);
    if (lines > cfg.maxCaptionLines) add('caption-lines', captionLine, `${lines} lines (max ${cfg.maxCaptionLines})`);
    if (!inside(capRect, R(captionsBox), 2)) add('caption-lines', captionLine, `${fmt(capRect)} leaves caption box ${fmt(R(captionsBox))}`);
    const size = parseFloat(cs.fontSize);
    if (size < cfg.minFont.caption) add('font-min', captionLine, `${size.toFixed(1)}px < ${cfg.minFont.caption}px (caption)`);
    // Word gaps on a line stay open (the spoken-word chip sits inside them); line 2 never holds a lone word.
    let lastLine = 0;
    for (let i = 1; i < rects.length; i++) {
      if (Math.abs(rects[i].top - rects[i - 1].top) > lh * 0.5) {
        lastLine = i;
        continue;
      }
      const gap = rects[i].left - rects[i - 1].right;
      if (gap < cfg.captionWordGap * size) add('caption-words', words[i], `“${words[i - 1].textContent}|${words[i].textContent}” gap ${gap.toFixed(1)}px < ${(cfg.captionWordGap * size).toFixed(1)}`);
    }
    if (lines > 1 && rects.length - lastLine < 2) add('caption-orphan-line', captionLine, `“${words[rects.length - 1].textContent}” alone on line ${lines}`);
  }

  const fit = layer.querySelector('.scene-fit');
  if (fit) {
    const scale = parseFloat(getComputedStyle(fit).getPropertyValue('--fit')) || 1;
    if (scale < cfg.minFit) add('fit-scaled', fit, `scene scaled to ${(scale * 100).toFixed(0)}% to fit the zone`);
  }

  // Words: never split across lines (a U+200B or hyphen inside a word is an author-marked
  // break), and never wider than a boxed ancestor (card, node, pill) they sit in.
  const wordRoots = [layer, ...(captionLine ? [captionLine] : [])];
  const seenWords = new Set();
  for (const rootEl of wordRoots) {
    const tw = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
    for (let node = tw.nextNode(); node; node = tw.nextNode()) {
      const el = node.parentElement;
      if (!el || !node.textContent.trim() || el.closest(DECOR) || !visible(el) || !settled(el)) continue;
      // A word may run into a box's padding but never past its border.
      const boxes = [];
      for (let e = el; e && e !== rootEl; e = e.parentElement) {
        const cs = getComputedStyle(e);
        if (hasBox(cs)) {
          const r = R(e);
          boxes.push({ el: e, left: r.left + parseFloat(cs.borderLeftWidth), right: r.right - parseFloat(cs.borderRightWidth) });
        }
      }
      const text = node.textContent;
      const re = /[^\s​]+/g;
      for (let m = re.exec(text); m; m = re.exec(text)) {
        const word = m[0];
        if (word.length < 2) continue;
        const range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + word.length);
        const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
        if (!rects.length) continue;
        const key = label(el) + '|' + word;
        if (seenWords.has(key)) continue;
        const lines = rects.filter((r, i) => i === 0 || Math.abs(r.top - rects[0].top) > rects[0].height * 0.5).length;
        // Caption words never break at all (the chunk shrinks to fit instead).
        if (lines > 1 && (rootEl === captionLine || !/[-/—]/.test(word))) {
          seenWords.add(key);
          add('word-split', el, `“${word}” breaks across ${lines} lines`);
          continue;
        }
        // Emoji / symbol glyphs report loose rects, and overlays (packets flying along a path,
        // stamps) are not boxes text has to fit; only real words in real boxes are checked for spilling.
        if (!/[\p{L}\p{N}]/u.test(word) || el.closest(OVERLAY)) continue;
        const box = union(rects);
        const spill = boxes.find((b) => box.right > b.right + 1.5 || box.left < b.left - 1.5);
        if (spill) {
          seenWords.add(key);
          add('word-split', el, `“${word}” ${fmt(box)} is wider than its box ${label(spill.el)} ${fmt(R(spill.el))}`);
          continue;
        }
        // A diagram node's text stays inside the node's rounded shape (box, pill or circle).
        const inner = el.closest('.dia-node-inner');
        if (inner) {
          const nb = R(inner);
          const hw = nb.width / 2;
          const hh = nb.height / 2;
          const radius = getComputedStyle(inner).borderTopLeftRadius;
          const r = Math.min((parseFloat(radius) || 0) * (radius.endsWith('%') ? nb.width / 100 : 1), hw, hh);
          const cx = nb.left + hw;
          const cy = nb.top + hh;
          const corners = [[box.left, box.top], [box.right, box.top], [box.left, box.bottom], [box.right, box.bottom]];
          const outside = ([x, y]) => {
            const dx = Math.abs(x - cx) - hw;
            const dy = Math.abs(y - cy) - hh;
            if (dx > 1.5 || dy > 1.5) return true;
            const cdx = Math.max(0, dx + r);
            const cdy = Math.max(0, dy + r);
            return cdx > 0 && cdy > 0 && Math.hypot(cdx, cdy) > r + 1.5;
          };
          if (corners.some(outside)) {
            seenWords.add(key);
            add('word-split', el, `“${word}” ${fmt(box)} spills out of its node's rounded shape ${fmt(nb)}`);
          }
        }
      }
    }
  }
  return { findings, metrics };
}

const CFG = {
  minGapRatio: 0.035,
  overlapTolerance: 2,
  /** px between content/captions and the rail icons they share rows with (phone). */
  railClearance: 12,
  maxCaptionLines: 2,
  /** em of the caption size between two words on a line (the chip takes 0.12em of it). */
  captionWordGap: 0.26,
  minFit: 0.85,
  zoneAxisTolerance: 0.015,
  centerTolerance: 0.1,
  minFill: 0.22,
  /** Fraction of the stage height a heading may sit away from the reel's median heading position. */
  headingJump: 0.025,
  maxTitleLines: 4,
  /** Fraction of the zone width a diagram's nodes must span. */
  minDiaWidth: 0.5,
  /** em of the stat value size between the number and its unit. */
  statUnitGap: 0.06,
  /** Opacity some scene ink must have reached at every sampled moment. */
  minInk: 0.25,
  /** Scene types whose design centres the content column (left-aligned editorial layouts are exempt). */
  centredTypes: ['code', 'terminal', 'diagram', 'tree', 'phone', 'compare', 'list', 'stat', 'quiz'],
  /** Captions are 24.6px on a phone; 18 allows a single very long word (apple-app-site-association) to shrink to fit. */
  minFont: { caption: 18, title: 18, body: 13, label: 15, small: 11, phone: 8, chrome: 11 },
};

/** Static caption checks over every chunk of a beat (the frozen frames only show one chunk each). */
function captionFindings(say) {
  const words = timeline.splitWords(say);
  const chunks = timeline.captionChunks(words);
  const findings = [];
  const text = (chunk) => chunk.map((i) => words[i]).join(' ');
  chunks.forEach((chunk, c) => {
    if (chunk.slice(0, -1).some((i) => timeline.endsSentence(words[i]))) findings.push({ rule: 'caption-sentence', el: 'caption', detail: `“${text(chunk)}”` });
    if (!timeline.chunkLinesOk(chunk.map((i) => words[i]))) findings.push({ rule: 'caption-orphan-line', el: 'caption', detail: `“${text(chunk)}” would wrap with a lone word on line 2` });
    const prev = chunks[c - 1];
    if (chunk.length === 1 && words[chunk[0]].length <= 5 && prev && prev.length >= 3 && !timeline.endsSentence(words[prev[prev.length - 1]]))
      findings.push({ rule: 'caption-orphan', el: 'caption', detail: `“${text(prev)}” | “${text(chunk)}”` });
  });
  return findings;
}

// ── Vite + Playwright ──
// No file watcher and no HMR: a file saved mid-run must not reload pages under test
// (a reload drops window.__reelsQA and every later frame would fail with "reading 'seek'").
const vite = await import(pathToFileURL(path.join(root, 'node_modules/vite/dist/node/index.js')).href);
const server = await vite.createServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  logLevel: 'error',
  server: { host: '127.0.0.1', port: 5199, strictPort: false, open: false, hmr: false, watch: null },
});
await server.listen();
const base = server.resolvedUrls?.local[0]?.replace(/\/$/, '') ?? 'http://127.0.0.1:5199';

// Only what this run owns is cleared: the shot folders of the selected reels/viewports.
// Other reels' shots, sheets or notes in --out are left alone.
await mkdir(out, { recursive: true });
if (shots) for (const viewport of viewports) for (const reel of selected) await rm(path.join(out, 'shots', viewport, reel.id), { recursive: true, force: true });
const browser = await chromium.launch();
const results = [];
const jobs = [];
for (const viewport of viewports) for (const reel of selected) jobs.push({ reel, viewport });
let done = 0;
const started = Date.now();

async function runJob({ reel, viewport }) {
  const vp = VIEWPORTS[viewport];
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const manifest = await manifestFor(reel);
  const dir = path.join(out, 'shots', viewport, reel.id);
  if (shots) await mkdir(dir, { recursive: true });
  // (Re)loads the player at a beat and waits for the QA API: used once up front and again
  // if a frame ever finds the API gone (a navigation or reload under the test).
  const open = async (beat, t) => {
    await page.goto(`${base}${reel.route}?qa&beat=${beat}&t=${t}#/reel/${reel.id}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__reelsQA?.ready === true, null, { timeout: 30000 });
  };
  const seek = (beat, t) =>
    Promise.race([
      page.evaluate(async ([beat, t]) => {
        if (!window.__reelsQA?.seek) throw new Error('QA API missing (page reloaded?)');
        await window.__reelsQA.seek(beat, t);
      }, [beat, t]),
      new Promise((_, reject) => setTimeout(() => reject(new Error('seek timeout')), 8000)),
    ]);
  try {
    await open(0, 0);
    const clip = viewport === 'laptop' ? await page.evaluate(() => {
      const r = document.querySelector('.slot .frame')?.getBoundingClientRect();
      return r ? { x: Math.max(0, r.left - 24), y: Math.max(0, r.top - 16), width: r.width + 140, height: r.height + 32 } : null;
    }) : null;
    for (let b = 0; b < reel.beats.length; b++) {
      let first = true;
      for (const moment of momentsFor(reel, manifest, b)) {
        const entry = { reel: reel.id, series: reel.file, beat: b, type: reel.beats[b].scene.type, viewport, moment: moment.name, t: moment.t, findings: [] };
        results.push(entry);
        try {
          try {
            await seek(b, moment.t);
          } catch {
            // One retry from a fresh page before the frame counts as an error.
            await open(b, moment.t);
          }
          const checked = await page.evaluate(checkFrame, { ...CFG, viewport, type: entry.type, moment: moment.name });
          entry.findings = [...checked.findings];
          entry.metrics = checked.metrics;
          if (first && viewport === viewports[0]) entry.findings.push(...captionFindings(reel.beats[b].say));
          first = false;
          if (shots) {
            entry.shot = path.relative(out, path.join(dir, `${String(b).padStart(2, '0')}-${moment.name}.jpg`));
            await page.screenshot({ path: path.join(out, entry.shot), type: 'jpeg', quality: 82, clip: clip ?? undefined });
          }
        } catch (error) {
          entry.findings = [{ rule: 'error', el: 'page', detail: String(error.message ?? error) }];
        }
        if (errors.length) {
          entry.findings.push(...errors.splice(0).map((e) => ({ rule: 'error', el: 'page', detail: e })));
        }
      }
    }
  } catch (error) {
    results.push({ reel: reel.id, series: reel.file, beat: -1, type: '-', viewport, moment: '-', t: 0, findings: [{ rule: 'error', el: 'page', detail: String(error.message ?? error) }] });
  } finally {
    await context.close();
    done++;
    process.stderr.write(`\r${done}/${jobs.length} ${reel.id} ${viewport}`.padEnd(70));
  }
}

const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(workers, queue.length) }, async () => {
  while (queue.length) await runJob(queue.shift());
}));
await browser.close();
await server.close();
process.stderr.write('\n');

// ── Reel-level checks: headings keep one position across the beats of a reel (per viewport) ──
const byReelViewport = new Map();
for (const r of results) {
  if (r.metrics?.headingTop === undefined) continue;
  const key = `${r.reel}|${r.viewport}`;
  if (!byReelViewport.has(key)) byReelViewport.set(key, []);
  byReelViewport.get(key).push(r);
}
for (const group of byReelViewport.values()) {
  const tops = group.map((r) => r.metrics.headingTop).sort((a, b) => a - b);
  const median = tops[Math.floor(tops.length / 2)];
  for (const r of group)
    if (Math.abs(r.metrics.headingTop - median) > CFG.headingJump)
      r.findings.push({ rule: 'heading-jump', el: 'heading', detail: `heading at ${(r.metrics.headingTop * 100).toFixed(1)}% of the stage height, reel median ${(median * 100).toFixed(1)}% (max ±${CFG.headingJump * 100}%)` });
}

// ── Report ──
const failures = results.filter((r) => r.findings.length);
const byRule = {};
const byReel = {};
for (const r of failures)
  for (const f of r.findings) {
    byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
    byReel[r.reel] = (byReel[r.reel] ?? 0) + 1;
  }
results.sort((a, b) => a.reel.localeCompare(b.reel) || a.viewport.localeCompare(b.viewport) || a.beat - b.beat || a.t - b.t);
const report = {
  root,
  generatedAt: new Date().toISOString(),
  seconds: Math.round((Date.now() - started) / 1000),
  viewports,
  config: CFG,
  rules: RULES,
  summary: { frames: results.length, failingFrames: failures.length, findings: Object.values(byRule).reduce((a, b) => a + b, 0), byRule, byReel },
  results,
};
await writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
await writeFile(path.join(out, 'index.html'), contactSheet(report));

for (const r of failures)
  for (const f of r.findings)
    console.log(`${r.reel} / beat ${r.beat} (${r.type}) / ${r.viewport} / ${r.moment}@${r.t}ms / ${f.rule} / ${f.el}: ${f.detail}`);
console.log(
  `\nreels-qa: ${results.length} frames, ${failures.length} failing, ${report.summary.findings} findings in ${report.seconds}s` +
    (Object.keys(byRule).length ? ` — ${Object.entries(byRule).map(([k, v]) => `${k}:${v}`).join(', ')}` : '') +
    `\nreport: ${path.join(out, 'report.json')}\nsheet:  ${path.join(out, 'index.html')}`,
);
process.exit(failures.length ? 1 : 0);

function contactSheet(report) {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const groups = new Map();
  for (const r of report.results) {
    const key = `${r.reel}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const cells = [...groups].map(([reel, rows]) => {
    const bad = rows.filter((r) => r.findings.length).length;
    const items = rows
      .map(
        (r) => `<figure class="${r.findings.length ? 'bad' : ''}">
        ${r.shot ? `<a href="${esc(r.shot)}" target="_blank"><img loading="lazy" src="${esc(r.shot)}" alt=""></a>` : '<div class="noshot">no shot</div>'}
        <figcaption><b>${r.beat}</b> ${esc(r.type)} · ${esc(r.viewport)} · ${esc(r.moment)} @${r.t}ms
        ${r.findings.map((f) => `<div class="f"><i>${esc(f.rule)}</i> ${esc(f.el)}<br><small>${esc(f.detail)}</small></div>`).join('')}</figcaption></figure>`,
      )
      .join('');
    return `<details ${bad ? 'open' : ''}><summary>${esc(reel)} <small>${esc(rows[0].series)}</small> <span class="${bad ? 'bad' : 'ok'}">${bad ? `${bad} failing frames` : 'ok'}</span></summary><div class="row">${items}</div></details>`;
  });
  return `<!doctype html><meta charset="utf-8"><title>reels QA</title>
<style>
body{font:13px/1.4 system-ui;background:#111;color:#eee;margin:16px}
summary{cursor:pointer;font-size:16px;font-weight:700;margin:12px 0 4px}summary small{color:#888;font-weight:400}
.ok{color:#4ade80}.bad{color:#fb7185}.row{display:flex;flex-wrap:wrap;gap:10px}
figure{margin:0;width:200px;border:2px solid #333;border-radius:8px;padding:6px;background:#1a1a1f}figure.bad{border-color:#fb7185}
img{width:100%;display:block;border-radius:4px}figcaption{margin-top:6px;font-size:11px;color:#bbb}
.f{margin-top:4px;color:#fda4af}.f i{font-style:normal;font-weight:700}.f small{color:#999}.noshot{height:120px;display:grid;place-items:center;color:#666}
</style>
<h1>reels QA · ${esc(report.generatedAt)} · ${report.summary.frames} frames · <span class="${report.summary.failingFrames ? 'bad' : 'ok'}">${report.summary.failingFrames} failing</span></h1>
<p>${Object.entries(report.summary.byRule).map(([k, v]) => `${esc(k)}: ${v}`).join(' · ') || 'no findings'}</p>
${cells.join('\n')}`;
}
