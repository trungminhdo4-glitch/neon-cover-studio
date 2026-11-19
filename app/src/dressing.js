// Poster dressing, the details that make a cover read as key art: a location-and-time plate on each panel, a
// starburst badge with a five-star rating, and the credit strip along the bottom (striped-sun emblem, the strip's
// line in spaced capitals, a credit block and two palms). All of it is drawn with the app's own block alphabet.

import { drawText, textWidth } from './lettering.js';
import { drawPalm } from './samples.js';

/** Default plate text per panel: "PLACE|TIME", edited per panel in the editor. */
export const DEFAULT_LABELS = [
  'OCEAN DRIVE|6:42 PM', 'PIER 26|5:30 AM', 'MOTEL ROW|11:58 PM', 'TOWER 2|7:10 PM',
  'PALM BEACH|7:58 PM', 'COAST ROAD|9:30 PM', 'THE STRIP|1:15 AM', 'MARINA|4:40 AM',
];

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * A plate in a panel corner: an accent bar, the place in white capitals and the time in the accent colour. It goes
 * in the bottom-left corner (top-left when `top`), tries the other one when the caption box `avoid` covers it, and
 * is left out when both are covered.
 */
export function drawPanelLabel(ctx, box, label, ink, short, top = false, avoid = null) {
  const [place, time = ''] = String(label ?? '').split('|').map((t) => t.trim());
  if (!place && !time) return;
  const cap = Math.max(7, short * 0.019);
  const sub = cap * 0.62;
  const pad = cap * 0.55;
  const w = Math.max(textWidth(place, cap), textWidth(time, sub, 1.2)) + pad * 2.6;
  const h = cap + (time ? sub + cap * 0.5 : 0) + pad * 2;
  if (w > box.w * 0.92) return;
  const inset = short * 0.016;
  const x = box.x + inset;
  const yTop = box.y + inset;
  const yBottom = box.y + box.h - h - inset;
  const tries = top ? [yTop, yBottom] : [yBottom, yTop];
  const y = avoid ? tries.find((ty) => !overlaps({ x, y: ty, w, h }, avoid)) : tries[0];
  if (y === undefined) return;
  ctx.save();
  ctx.fillStyle = 'rgba(10, 2, 22, 0.82)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = ink.neon;
  ctx.fillRect(x, y, cap * 0.32, h);
  drawText(ctx, place, x + pad * 1.6, y + pad, cap, '#ffffff');
  if (time) drawText(ctx, time, x + pad * 1.6, y + pad + cap + cap * 0.5, sub, ink.accent, { tracking: 1.2 });
  ctx.restore();
}

/** A five-point star path centred on (x, y). */
function starPath(x, y, r) {
  const p = new Path2D();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    if (i) p.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    else p.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  p.closePath();
  return p;
}

/** A row of `n` stars centred on (x, y), the first `filled` solid. */
export function drawStars(ctx, x, y, r, n, filled, fill, outline) {
  const step = r * 2.3;
  ctx.save();
  ctx.lineJoin = 'round';
  for (let i = 0; i < n; i++) {
    const p = starPath(x + (i - (n - 1) / 2) * step, y, r);
    ctx.lineWidth = r * 0.35;
    ctx.strokeStyle = outline;
    ctx.stroke(p);
    if (i < filled) { ctx.fillStyle = fill; ctx.fill(p); }
  }
  ctx.restore();
}

/** The starburst badge: a toothed sun in the accent colour, a dark ring, two lines of text and five stars. */
export function drawBadge(ctx, cx, cy, r, text, ink) {
  const lines = String(text ?? '').split('|').map((t) => t.trim()).filter(Boolean).slice(0, 2);
  if (!lines.length) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.16);
  const burst = new Path2D();
  const teeth = 22;
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i * Math.PI) / teeth;
    const rr = i % 2 ? r * 0.88 : r;
    if (i) burst.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else burst.moveTo(rr, 0);
  }
  burst.closePath();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = r * 0.25;
  ctx.shadowOffsetY = r * 0.06;
  ctx.fillStyle = '#14031f';
  ctx.fill(burst);
  ctx.shadowColor = 'transparent';
  ctx.scale(0.93, 0.93);
  const g = ctx.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, '#fff1a8');
  g.addColorStop(1, ink.accent);
  ctx.fillStyle = g;
  ctx.fill(burst);
  ctx.scale(1 / 0.93, 1 / 0.93);
  ctx.lineWidth = r * 0.05;
  ctx.strokeStyle = '#14031f';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2);
  ctx.stroke();
  const cap = r * 0.24;
  const big = Math.min(cap * 1.35, (r * 1.15) / Math.max(1, textWidth(lines[lines.length - 1], 1) || 1));
  if (lines.length === 2) {
    drawText(ctx, lines[0], 0, -r * 0.42, cap * 0.7, '#14031f', { align: 'center', tracking: 1.4 });
    drawText(ctx, lines[1], 0, -r * 0.14, big, '#14031f', { align: 'center' });
  } else {
    drawText(ctx, lines[0], 0, -r * 0.3, big, '#14031f', { align: 'center' });
  }
  drawStars(ctx, 0, r * 0.42, r * 0.1, 5, 5, ink.neon, '#14031f');
  ctx.restore();
}

/**
 * The credit strip under the panels: a dark band with a sunset rule on top, a striped-sun emblem and palms at the
 * ends, the strip's line in large spaced capitals and a small credit block under it.
 */
export function drawCreditStrip(ctx, rect, line, credits, grade) {
  const { x, y, w, h } = rect;
  const ink = grade.ink;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const bg = ctx.createLinearGradient(0, y, 0, y + h);
  bg.addColorStop(0, '#1a0430');
  bg.addColorStop(1, '#07010f');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createLinearGradient(0, y + h, 0, y);
  glow.addColorStop(0, 'rgba(0,0,0,0)');
  glow.addColorStop(1, grade.sky[1] + '66');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  const rule = ctx.createLinearGradient(x, 0, x + w, 0);
  grade.sky.forEach((c, i) => rule.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = rule;
  ctx.fillRect(x, y, w, Math.max(2, h * 0.06));
  const palmH = h * 0.95;
  drawPalm(ctx, x + h * 0.1, y + h * 1.02, palmH, 0.2, '#000000');
  drawPalm(ctx, x + w - h * 0.12, y + h * 1.02, palmH * 0.9, -0.22, '#000000');

  const sunR = h * 0.3;
  const sx = x + h * 1.25;
  const sy = y + h * 0.54;
  const sun = ctx.createLinearGradient(0, sy - sunR, 0, sy + sunR);
  grade.sun.forEach((c, i) => sun.addColorStop(i / (grade.sun.length - 1), c));
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sx, sy, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#12031f';
  for (let k = 0; k < 4; k++) ctx.fillRect(sx - sunR, sy + k * sunR * 0.26, sunR * 2, sunR * 0.06 * (k + 1.5));

  const cap = h * 0.27;
  const free = w - h * 4;
  const capFit = Math.min(cap, cap * (free / Math.max(1, textWidth(line, cap, 2.6))));
  drawText(ctx, line, x + w / 2, y + h * 0.22, capFit, ink.accent, { align: 'center', tracking: 2.6 });
  const small = h * 0.1;
  const smallFit = Math.min(small, small * (free / Math.max(1, textWidth(credits, small, 1.1))));
  drawText(ctx, credits, x + w / 2, y + h * 0.66, smallFit, 'rgba(255,240,250,0.78)', { align: 'center', tracking: 1.1, weight: 0.7 });
  ctx.restore();
}
