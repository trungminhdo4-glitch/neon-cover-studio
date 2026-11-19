// Neon Cover Studio's own lettering: a heavy, condensed block alphabet drawn as stroked skeletons on a 4 x 8 grid,
// no font file at all. Each glyph is a list of polylines (centre lines); a closed loop repeats its first point.
// Strokes are drawn with square caps and mitred joins, so the letters come out as solid poster blocks, and every
// title style (chrome sunset, neon tube, poster block) is just a different stack of strokes over the same skeleton.

/** Stroke width of the skeleton, in grid units (the cap height is 8 units). */
export const STROKE = 2.2;
const GAP = 0.8;

const O_LOOP = [[1, 0], [3, 0], [4, 1], [4, 7], [3, 8], [1, 8], [0, 7], [0, 1], [1, 0]];

/** The alphabet: char -> { w: width of the centre lines, p: polylines }. */
export const GLYPHS = {
  A: { w: 4, p: [[[0, 8], [0, 1.5], [1.5, 0], [2.5, 0], [4, 1.5], [4, 8]], [[0, 4.6], [4, 4.6]]] },
  B: { w: 4, p: [[[0, 0], [2.9, 0], [3.8, 0.9], [3.8, 3.1], [2.9, 4], [3.1, 4], [4, 4.9], [4, 7.1], [3.1, 8], [0, 8], [0, 0]], [[0, 4], [2.9, 4]]] },
  C: { w: 4, p: [[[4, 1.4], [4, 1], [3, 0], [1, 0], [0, 1], [0, 7], [1, 8], [3, 8], [4, 7], [4, 6.6]]] },
  D: { w: 4, p: [[[0, 0], [2.4, 0], [4, 1.6], [4, 6.4], [2.4, 8], [0, 8], [0, 0]]] },
  E: { w: 3.6, p: [[[3.6, 0], [0, 0], [0, 8], [3.6, 8]], [[0, 4], [2.8, 4]]] },
  F: { w: 3.6, p: [[[3.6, 0], [0, 0], [0, 8]], [[0, 4], [2.8, 4]]] },
  G: { w: 4, p: [[[4, 1.4], [4, 1], [3, 0], [1, 0], [0, 1], [0, 7], [1, 8], [3, 8], [4, 7], [4, 4.4], [2.2, 4.4]]] },
  H: { w: 4, p: [[[0, 0], [0, 8]], [[4, 0], [4, 8]], [[0, 4], [4, 4]]] },
  I: { w: 0, p: [[[0, 0], [0, 8]]] },
  J: { w: 3.6, p: [[[3.6, 0], [3.6, 7], [2.6, 8], [1, 8], [0, 7], [0, 5.8]]] },
  K: { w: 4, p: [[[0, 0], [0, 8]], [[4, 0], [4, 0.6], [0.6, 4]], [[1.6, 3.4], [4, 7.4], [4, 8]]] },
  L: { w: 3.6, p: [[[0, 0], [0, 8], [3.6, 8]]] },
  M: { w: 5.2, p: [[[0, 8], [0, 0], [2.6, 3.8], [5.2, 0], [5.2, 8]]] },
  N: { w: 4, p: [[[0, 8], [0, 0], [4, 8], [4, 0]]] },
  O: { w: 4, p: [O_LOOP] },
  P: { w: 4, p: [[[0, 8], [0, 0], [3, 0], [4, 1], [4, 3.4], [3, 4.4], [0, 4.4]]] },
  Q: { w: 4, p: [O_LOOP, [[2.4, 5.8], [4.4, 8.4]]] },
  R: { w: 4, p: [[[0, 8], [0, 0], [3, 0], [4, 1], [4, 3.2], [3, 4.2], [0, 4.2]], [[2.2, 4.2], [4, 7.2], [4, 8]]] },
  S: { w: 4, p: [[[4, 1.2], [3, 0], [1, 0], [0, 1], [0, 3], [1, 4], [3, 4], [4, 5], [4, 7], [3, 8], [1, 8], [0, 6.8]]] },
  T: { w: 4, p: [[[0, 0], [4, 0]], [[2, 0], [2, 8]]] },
  U: { w: 4, p: [[[0, 0], [0, 7], [1, 8], [3, 8], [4, 7], [4, 0]]] },
  V: { w: 4.2, p: [[[0, 0], [0, 4.6], [2.1, 8], [4.2, 4.6], [4.2, 0]]] },
  W: { w: 5.2, p: [[[0, 0], [0, 8], [2.6, 4.4], [5.2, 8], [5.2, 0]]] },
  X: { w: 4, p: [[[0, 0], [0, 1.4], [4, 6.6], [4, 8]], [[4, 0], [4, 1.4], [0, 6.6], [0, 8]]] },
  Y: { w: 4, p: [[[0, 0], [0, 2.4], [2, 4.4], [4, 2.4], [4, 0]], [[2, 4.4], [2, 8]]] },
  Z: { w: 4, p: [[[0, 0], [4, 0], [4, 1.4], [0, 6.6], [0, 8], [4, 8]]] },
  0: { w: 4, p: [O_LOOP] },
  1: { w: 1.4, p: [[[0, 1.4], [1.4, 0], [1.4, 8]]] },
  2: { w: 4, p: [[[0, 1.2], [1, 0], [3, 0], [4, 1], [4, 3.2], [0, 6.8], [0, 8], [4, 8]]] },
  3: { w: 4, p: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 3], [3, 4], [1.4, 4]], [[3, 4], [4, 5], [4, 7], [3, 8], [1, 8], [0, 7]]] },
  4: { w: 4, p: [[[3, 8], [3, 0], [0, 5.4], [4, 5.4]]] },
  5: { w: 4, p: [[[4, 0], [0, 0], [0, 3.6], [3, 3.6], [4, 4.6], [4, 7], [3, 8], [1, 8], [0, 7]]] },
  6: { w: 4, p: [[[4, 1], [3, 0], [1, 0], [0, 1], [0, 7], [1, 8], [3, 8], [4, 7], [4, 5], [3, 4], [0, 4]]] },
  7: { w: 4, p: [[[0, 0], [4, 0], [4, 1.4], [1.6, 8]]] },
  8: { w: 4, p: [[[1, 4], [0, 3], [0, 1], [1, 0], [3, 0], [4, 1], [4, 3], [3, 4], [1, 4], [0, 5], [0, 7], [1, 8], [3, 8], [4, 7], [4, 5], [3, 4]]] },
  9: { w: 4, p: [[[0, 7], [1, 8], [3, 8], [4, 7], [4, 1], [3, 0], [1, 0], [0, 1], [0, 3], [1, 4], [4, 4]]] },
  ' ': { w: 1.4, p: [] },
  '.': { w: 0, p: [[[0, 7.7], [0, 8]]] },
  ',': { w: 0.4, p: [[[0.4, 7.4], [0, 9.2]]] },
  '!': { w: 0, p: [[[0, 0], [0, 5.2]], [[0, 7.7], [0, 8]]] },
  '?': { w: 4, p: [[[0, 1], [1, 0], [3, 0], [4, 1], [4, 3], [2, 4.6], [2, 5.4]], [[2, 7.7], [2, 8]]] },
  '-': { w: 2.6, p: [[[0, 4.2], [2.6, 4.2]]] },
  '+': { w: 3.2, p: [[[0, 4.2], [3.2, 4.2]], [[1.6, 2.6], [1.6, 5.8]]] },
  '&': { w: 4.4, p: [[[4.4, 8], [0.6, 3.2], [0.6, 1], [1.6, 0], [2.6, 0], [3.4, 0.8], [3.4, 2.2], [0, 5], [0, 7], [1, 8], [2.4, 8], [4.4, 4.8]]] },
  "'": { w: 0, p: [[[0, 0], [0, 2]]] },
  ':': { w: 0, p: [[[0, 2.8], [0, 3.1]], [[0, 7.7], [0, 8]]] },
  '/': { w: 3, p: [[[3, 0], [0, 8]]] },
  '#': { w: 4.4, p: [[[1.4, 0.6], [1, 7.4]], [[3.4, 0.6], [3, 7.4]], [[0, 2.8], [4.4, 2.8]], [[0, 5.2], [4.4, 5.2]]] },
  '$': { w: 4, p: [[[4, 1.6], [3, 0.6], [1, 0.6], [0, 1.6], [0, 3], [1, 4], [3, 4], [4, 5], [4, 6.4], [3, 7.4], [1, 7.4], [0, 6.4]], [[2, -0.4], [2, 8.4]]] },
  '*': { w: 3.2, p: [[[1.6, 0.4], [1.6, 4]], [[0, 1.2], [3.2, 3.2]], [[3.2, 1.2], [0, 3.2]]] },
};

/** Upper-cases the text and folds accents (é -> E) so every character has a glyph; unknown ones become spaces. */
export function normaliseCaption(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[“”"]/g, "'")
    .replace(/[–—]/g, '-')
    .split('\n')
    .map((line) => [...line].map((ch) => (GLYPHS[ch] ? ch : ' ')).join('').replace(/ +/g, ' ').trim())
    .join('\n');
}

/** Width of a line in grid units, from the left edge of the first stroke to the right edge of the last. */
export function measureLine(line, tracking = 0) {
  let x = 0;
  const chars = [...line];
  chars.forEach((ch, i) => {
    x += GLYPHS[ch].w + STROKE + (i < chars.length - 1 ? GAP + tracking : 0);
  });
  return x;
}

/** Builds one Path2D holding every glyph skeleton of `line`, its top-left at (x, y), one grid unit = `u` pixels. */
export function linePath(line, x, y, u, tracking = 0) {
  const path = new Path2D();
  let pen = x + (STROKE / 2) * u;
  const top = y + (STROKE / 2) * u;
  for (const ch of line) {
    const g = GLYPHS[ch];
    for (const poly of g.p) {
      const closed = poly.length > 2 && poly[0][0] === poly[poly.length - 1][0] && poly[0][1] === poly[poly.length - 1][1];
      const pts = closed ? poly.slice(0, -1) : poly;
      path.moveTo(pen + pts[0][0] * u, top + pts[0][1] * u);
      for (let i = 1; i < pts.length; i++) path.lineTo(pen + pts[i][0] * u, top + pts[i][1] * u);
      if (closed) path.closePath();
    }
    pen += (g.w + STROKE + GAP + tracking) * u;
  }
  return path;
}

/** Splits a caption into lines: honours typed line breaks, else picks the 1-3 line split that letters largest. */
export function splitCaption(text, boxW, boxH) {
  const clean = normaliseCaption(text);
  if (!clean) return [];
  if (clean.includes('\n')) return clean.split('\n').filter(Boolean);
  const words = clean.split(' ');
  const options = [[clean]];
  for (let a = 1; a < words.length; a++) {
    options.push([words.slice(0, a).join(' '), words.slice(a).join(' ')]);
    for (let b = a + 1; b < words.length && words.length <= 9; b++) {
      options.push([words.slice(0, a).join(' '), words.slice(a, b).join(' '), words.slice(b).join(' ')]);
    }
  }
  let best = options[0];
  let bestScore = -1;
  for (const lines of options) {
    const u = unitFor(lines, boxW, boxH);
    const score = u * (1 - 0.07 * (lines.length - 1));
    if (score > bestScore) { bestScore = score; best = lines; }
  }
  return best;
}

const LINE_GAP = 0.22; // between lines, in cap heights
function unitFor(lines, boxW, boxH) {
  const widest = Math.max(...lines.map((l) => measureLine(l)));
  const tall = lines.length * (8 + STROKE) + (lines.length - 1) * 8 * LINE_GAP + 2.2;
  return Math.min(boxW / (widest + 2.2), boxH / tall);
}

/** The three title treatments a cover can use. */
export const TITLE_STYLES = {
  chrome: 'Sunset Chrome',
  neon: 'Neon Tube',
  block: 'Poster Block',
};

/**
 * Letters `title` (and a smaller `tagline` under it) inside `box` {x, y, w, h}, centred, leaning forward when
 * `lean` is set, in one of TITLE_STYLES with colours from the grade's `ink` palette.
 */
export function drawTitleBlock(ctx, box, title, tagline, style, ink, lean = true) {
  const tag = normaliseCaption(tagline).replace(/\n/g, ' ');
  const tagShare = tag ? 0.2 : 0;
  const titleBox = { x: box.x, y: box.y, w: box.w, h: box.h * (1 - tagShare) };
  const lines = splitCaption(title, titleBox.w, titleBox.h);
  if (!lines.length && !tag) return;
  const u = lines.length ? unitFor(lines, titleBox.w, titleBox.h) : 0;
  const lineH = (8 + STROKE) * u;
  const blockH = lines.length ? lines.length * lineH + (lines.length - 1) * 8 * LINE_GAP * u : 0;
  const tagTracking = 1.4;
  const tu = tag ? Math.min(u * 0.34 || box.h * 0.02, (box.w * 0.92) / measureLine(tag, tagTracking)) : 0;
  const tagH = tag ? (8 + STROKE) * tu : 0;
  const gap = tag && lines.length ? Math.max(tu * 4, u * 1.6) : 0;
  const total = blockH + gap + tagH;
  let y = box.y + (box.h - total) / 2;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  ctx.save();
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 3;
  ctx.lineCap = 'square';
  if (lean) {
    ctx.translate(cx, cy);
    ctx.transform(1, 0, -0.16, 1, 0, 0);
    ctx.translate(-cx, -cy);
  }
  for (const line of lines) {
    const w = measureLine(line) * u;
    const path = linePath(line, cx - w / 2, y, u);
    STYLE_PAINTERS[style](ctx, path, { x: cx - w / 2, y, w, h: lineH, u }, ink);
    y += lineH + 8 * LINE_GAP * u;
  }
  if (tag) {
    y += gap - (lines.length ? 8 * LINE_GAP * u : 0);
    const w = measureLine(tag, tagTracking) * tu;
    const path = linePath(tag, cx - w / 2, y, tu, tagTracking);
    paintTagline(ctx, path, tu, ink);
  }
  ctx.restore();
}

/** Strokes the skeleton at `extra` units wider than the letter, `copies` times stepping along (dx, dy): an extrusion. */
function extrude(ctx, path, u, color, extra, depth, dx = 0.55, dy = 1) {
  const steps = Math.max(1, Math.ceil((depth * u) / Math.max(1, u * 0.12)));
  ctx.strokeStyle = color;
  ctx.lineWidth = (STROKE + extra) * u;
  for (let i = steps; i >= 1; i--) {
    const t = (i / steps) * depth * u;
    ctx.save();
    ctx.translate(t * dx, t * dy);
    ctx.stroke(path);
    ctx.restore();
  }
}

const STYLE_PAINTERS = {
  /** Chrome sunset: a hard horizon split in the fill, a dark outline and a deep coloured extrusion. */
  chrome(ctx, path, box, ink) {
    const { u } = box;
    extrude(ctx, path, u, '#000000', 1.5, 1.6);
    extrude(ctx, path, u, ink.deep, 1.1, 1.1);
    ctx.strokeStyle = '#0d0214';
    ctx.lineWidth = (STROKE + 1.1) * u;
    ctx.stroke(path);
    const g = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    g.addColorStop(0, ink.chrome[0]);
    g.addColorStop(0.49, ink.chrome[1]);
    g.addColorStop(0.51, ink.chrome[2]);
    g.addColorStop(1, ink.chrome[3]);
    ctx.strokeStyle = g;
    ctx.lineWidth = STROKE * u;
    ctx.stroke(path);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, u * 0.28);
    ctx.lineCap = 'butt';
    ctx.setLineDash([u * 1.2, u * 9]);
    ctx.lineDashOffset = -u * 0.6;
    ctx.translate(-u * 0.55, -u * 0.55);
    ctx.stroke(path);
    ctx.restore();
  },
  /** Neon tube: a dark backing, a wide soft glow in the tube colour and a hot white core. */
  neon(ctx, path, box, ink) {
    const { u } = box;
    ctx.strokeStyle = 'rgba(8, 0, 20, 0.75)';
    ctx.lineWidth = (STROKE + 1.6) * u;
    ctx.stroke(path);
    ctx.save();
    ctx.shadowColor = ink.neon;
    ctx.strokeStyle = ink.neon;
    for (const [blur, width] of [[u * 3.2, STROKE * 0.95], [u * 1.4, STROKE * 0.8]]) {
      ctx.shadowBlur = blur;
      ctx.lineWidth = width * u;
      ctx.stroke(path);
    }
    ctx.restore();
    ctx.strokeStyle = ink.neonCore;
    ctx.lineWidth = STROKE * 0.38 * u;
    ctx.stroke(path);
  },
  /** Poster block: white letters, a heavy black outline and a hard drop shadow. */
  block(ctx, path, box, ink) {
    const { u } = box;
    extrude(ctx, path, u, '#000000', 1.4, 1.5, 0.7, 0.9);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = (STROKE + 1.4) * u;
    ctx.stroke(path);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = STROKE * u;
    ctx.stroke(path);
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = ink.accent;
    ctx.lineWidth = STROKE * 0.32 * u;
    ctx.translate(u * 0.35, u * 0.35);
    ctx.stroke(path);
    ctx.restore();
  },
};

function paintTagline(ctx, path, u, ink) {
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.lineWidth = (STROKE + 1.6) * u;
  ctx.stroke(path);
  ctx.strokeStyle = ink.accent;
  ctx.lineWidth = STROKE * u;
  ctx.stroke(path);
}
