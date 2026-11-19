// Renders a poster cover onto a canvas at any size: every photo panel cropped and colour-graded, the title cell's
// sky with its striped sun, palms and horizon grid, film grain, the gutters, then the caption lettering.
// The same function draws the live preview and the exported PNG, so what you see is what you export.

import { GRADES, gradePixels, grainPattern, hexToRgb } from './grades.js';
import { polygonPath, polygonToPixels, resolveLayout, titleBox } from './layouts.js';
import { drawBadge, drawCreditStrip, drawPanelLabel } from './dressing.js';
import { drawTitleBlock } from './lettering.js';
import { drawPalm } from './samples.js';

/** Where a panel's photo comes from: the source rectangle for the panel box at the slot's zoom and focus point. */
export function cropFor(box, photo, slot) {
  const base = Math.max(box.w / photo.w, box.h / photo.h);
  const scale = base * slot.zoom;
  const sw = box.w / scale;
  const sh = box.h / scale;
  const sx = Math.min(Math.max(slot.cx * photo.w - sw / 2, 0), photo.w - sw);
  const sy = Math.min(Math.max(slot.cy * photo.h - sh / 2, 0), photo.h - sh);
  return { sx, sy, sw, sh, scale };
}

const panelCache = new Map();

/** One graded panel image (cached by everything that changes its pixels). */
function gradedPanel(photo, slot, box, grade, strength) {
  const key = [photo.id, box.w, box.h, slot.zoom.toFixed(4), slot.cx.toFixed(4), slot.cy.toFixed(4), slot.flip, grade.name, strength].join('|');
  if (panelCache.has(key)) return panelCache.get(key);
  const c = document.createElement('canvas');
  c.width = Math.max(1, box.w);
  c.height = Math.max(1, box.h);
  const g = c.getContext('2d', { willReadFrequently: true });
  const { sx, sy, sw, sh } = cropFor(box, photo, slot);
  g.save();
  if (slot.flip) { g.translate(c.width, 0); g.scale(-1, 1); }
  g.imageSmoothingQuality = 'high';
  g.drawImage(photo.src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  g.restore();
  const img = g.getImageData(0, 0, c.width, c.height);
  gradePixels(img.data, grade, strength);
  g.putImageData(img, 0, 0);
  const v = g.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.35, c.width / 2, c.height / 2, Math.hypot(c.width, c.height) * 0.6);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,0,25,0.42)');
  g.fillStyle = v;
  g.fillRect(0, 0, c.width, c.height);
  drawSunFlare(g, c.width, c.height, grade, strength);
  if (panelCache.size > 60) panelCache.delete(panelCache.keys().next().value);
  panelCache.set(key, c);
  return c;
}

/** A low sun's warm bloom from the panel's upper corner, screened over the photo (the Vice City haze). */
function drawSunFlare(g, w, h, grade, strength) {
  if (!strength) return;
  const x = w * 0.86;
  const y = h * 0.08;
  const r = Math.hypot(w, h) * 0.75;
  const f = g.createRadialGradient(x, y, 0, x, y, r);
  f.addColorStop(0, withAlpha(grade.sun[1], 0.42 * strength));
  f.addColorStop(0.35, withAlpha(grade.sun[2], 0.16 * strength));
  f.addColorStop(1, withAlpha(grade.sun[2], 0));
  g.save();
  g.globalCompositeOperation = 'screen';
  g.fillStyle = f;
  g.fillRect(0, 0, w, h);
  g.restore();
}

function withAlpha(hex, a) {
  const [r, gg, b] = hexToRgb(hex);
  return `rgba(${r},${gg},${b},${a.toFixed(3)})`;
}

/** The title cell: a graded sky, a striped sun on the horizon, a glowing perspective grid and two palm silhouettes. */
function drawTitleCell(ctx, pts, box, grade) {
  ctx.save();
  ctx.clip(polygonPath(pts));
  const horizon = box.y + box.h * 0.7;
  const sky = ctx.createLinearGradient(0, box.y, 0, horizon);
  grade.sky.forEach((c, i) => sky.addColorStop(i / (grade.sky.length - 1), c));
  ctx.fillStyle = sky;
  ctx.fillRect(box.x, box.y, box.w, box.h);

  const r = Math.min(box.w * 0.24, box.h * 0.62);
  const sunX = box.x + box.w * 0.5;
  const sunY = horizon - r * 0.32;
  const sun = ctx.createLinearGradient(0, sunY - r, 0, sunY + r * 0.4);
  grade.sun.forEach((c, i) => sun.addColorStop(i / (grade.sun.length - 1), c));
  ctx.save();
  ctx.shadowColor = grade.sun[1];
  ctx.shadowBlur = r * 0.5;
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(sunX, sunY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = sky;
  for (let k = 0; k < 6; k++) {
    const y = sunY - r * 0.05 + k * r * 0.2;
    ctx.fillRect(sunX - r - 2, y, 2 * r + 4, r * 0.035 * (k + 1.5));
  }

  ctx.fillStyle = grade.ground;
  ctx.fillRect(box.x, horizon, box.w, box.y + box.h - horizon);
  ctx.save();
  ctx.strokeStyle = grade.grid;
  ctx.shadowColor = grade.grid;
  ctx.shadowBlur = Math.max(2, box.h * 0.02);
  ctx.lineWidth = Math.max(1, box.h * 0.006);
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(box.x, horizon);
  ctx.lineTo(box.x + box.w, horizon);
  const depth = box.y + box.h - horizon;
  for (let k = 1; k <= 6; k++) {
    const y = horizon + depth * (k / 6) ** 1.8;
    ctx.moveTo(box.x, y);
    ctx.lineTo(box.x + box.w, y);
  }
  for (let i = -14; i <= 14; i++) {
    ctx.moveTo(sunX + i * box.w * 0.025, horizon);
    ctx.lineTo(sunX + i * box.w * 0.16, box.y + box.h);
  }
  ctx.stroke();
  ctx.restore();

  const palmH = box.h * 0.95;
  drawPalm(ctx, box.x + box.w * 0.06, box.y + box.h * 1.02, palmH, 0.22, '#0b0212');
  drawPalm(ctx, box.x + box.w * 0.95, box.y + box.h * 1.04, palmH * 0.82, -0.28, '#0b0212');
  ctx.restore();
}

/**
 * Draws the whole cover for `doc` onto `canvas` at the canvas's size. `photos` maps photo ids to
 * { id, src, w, h }. `opts.selected` outlines one panel and `opts.numbers` badges each, for the editor only.
 */
export function renderPoster(canvas, doc, photos, opts = {}) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const layout = resolveLayout(doc.layout, w, h);
  const grade = GRADES[doc.grade];
  const short = Math.min(w, h);
  ctx.save();
  ctx.fillStyle = doc.frame;
  ctx.fillRect(0, 0, w, h);

  const fallback = photos.values().next().value;
  const shapes = layout.photos.map((poly) => polygonToPixels(poly, w, h));
  shapes.forEach(({ pts, box }, i) => {
    const slot = doc.panels[i];
    const photo = photos.get(slot.photo) ?? fallback;
    if (!photo) return;
    ctx.save();
    ctx.clip(polygonPath(pts));
    // the painted sample scenes are already graded: they take a lighter pass so their night colours stay bright
    const strength = photo.painted ? doc.strength * 0.4 : doc.strength;
    ctx.drawImage(gradedPanel(photo, slot, box, grade, strength), box.x, box.y);
    ctx.restore();
  });

  if (layout.title.cell) {
    const { pts, box } = polygonToPixels(layout.title.cell, w, h);
    drawTitleCell(ctx, pts, box, grade);
  }

  const strip = layout.strip ? polygonToPixels(layout.strip, w, h) : null;
  if (strip) drawCreditStrip(ctx, strip.box, doc.strip, doc.credits, grade);

  if (doc.grain) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  if (grade.scanlines) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    const step = Math.max(3, Math.round(short / 270));
    for (let y = 0; y < h; y += step) ctx.fillRect(0, y, w, 1);
    ctx.restore();
  }

  const gutter = doc.gutter * short;
  ctx.save();
  ctx.strokeStyle = doc.frame;
  ctx.lineJoin = 'miter';
  ctx.lineWidth = gutter;
  const cells = [...shapes];
  if (layout.title.cell) cells.push(polygonToPixels(layout.title.cell, w, h));
  if (strip) cells.push(strip);
  for (const { pts } of cells) ctx.stroke(polygonPath(pts));
  ctx.lineWidth = gutter * 2;
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();

  const tb = titleBox(layout, w, h);
  if (doc.extras) {
    const top = layout.labelTop ?? [];
    const avoid = { x: tb.x, y: tb.y - tb.h * 0.05, w: tb.w, h: tb.h * 1.1 };
    shapes.forEach(({ box }, i) => drawPanelLabel(ctx, box, doc.panels[i]?.label, grade.ink, short, top.includes(i), avoid));
  }
  if (layout.title.overlay) {
    // a soft dark band behind the caption, over the photo panels only
    ctx.save();
    const clip = new Path2D();
    shapes.forEach(({ pts }) => clip.addPath(polygonPath(pts)));
    ctx.clip(clip);
    const scrim = ctx.createLinearGradient(0, tb.y - tb.h * 0.45, 0, tb.y + tb.h * 1.15);
    scrim.addColorStop(0, 'rgba(8,0,20,0)');
    scrim.addColorStop(0.55, 'rgba(8,0,20,0.5)');
    scrim.addColorStop(1, 'rgba(8,0,20,0.18)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, tb.y - tb.h * 0.45, w, tb.h * 1.6);
    ctx.restore();
  }
  drawTitleBlock(ctx, tb, doc.title, doc.tagline, doc.style, grade.ink, doc.lean);
  if (doc.extras && doc.badge) {
    const b = layout.badge ?? { x: 0.88, y: 0.15, r: 0.1 };
    drawBadge(ctx, b.x * w, b.y * h, b.r * short, doc.badge, grade.ink);
  }

  if (opts.numbers || opts.selected != null) drawEditorMarks(ctx, shapes, opts, short);
  ctx.restore();
}

function drawEditorMarks(ctx, shapes, opts, short) {
  const r = Math.max(10, short * 0.022);
  shapes.forEach(({ pts, box }, i) => {
    if (i === opts.selected) {
      ctx.save();
      ctx.lineWidth = Math.max(3, short * 0.006);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke(polygonPath(pts));
      ctx.setLineDash([r, r * 0.7]);
      ctx.strokeStyle = '#2ef2ff';
      ctx.stroke(polygonPath(pts));
      ctx.restore();
    }
    if (opts.numbers) {
      const x = box.x + box.w - r * 1.6;
      const y = box.y + r * 1.6;
      ctx.fillStyle = i === opts.selected ? '#2ef2ff' : 'rgba(10,4,24,0.75)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i === opts.selected ? '#0a0418' : '#ffffff';
      ctx.font = `700 ${Math.round(r * 1.1)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), x, y + 1);
    }
  });
}

/** Which photo panel of `doc` holds the canvas point (x, y), or -1. */
export function panelAt(doc, w, h, x, y) {
  const ctx = hitCanvas.getContext('2d');
  const polys = resolveLayout(doc.layout, w, h).photos;
  for (let i = polys.length - 1; i >= 0; i--) {
    if (ctx.isPointInPath(polygonPath(polygonToPixels(polys[i], w, h).pts), x, y)) return i;
  }
  return -1;
}
const hitCanvas = document.createElement('canvas');

/** The pixel box of photo panel `i` at size w x h. */
export function panelBox(doc, w, h, i) {
  return polygonToPixels(resolveLayout(doc.layout, w, h).photos[i], w, h).box;
}
