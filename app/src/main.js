// The editor: a photo library (your own photos, read on this machine, plus samples), layouts, caption, colour grade
// and per-panel crop, a live preview you drag and scroll on, and the PNG export in three post sizes.
// A `?shot=` query sets up a fixed scene for a screenshot instead (./shots.js).

import { cropFor, panelAt, panelBox, renderPoster } from './cover.js';
import { GRADES } from './grades.js';
import { LAYOUTS, MAX_PANELS } from './layouts.js';
import { TITLE_STYLES } from './lettering.js';
import { KIT_PHOTOS, paintedSamples } from './samples.js';
import { DEFAULT_LABELS } from './dressing.js';
import { runShot } from './shots.js';

export const FORMATS = {
  square: { name: 'Square', w: 1080, h: 1080 },
  portrait: { name: 'Portrait', w: 1080, h: 1350 },
  landscape: { name: 'Wide', w: 1920, h: 1080 },
};

/** Crops that make one photo look like many shots: zoom and focus point per panel (faces sit high in most photos). */
const VARIED_CROPS = [
  [1.0, 0.5, 0.32], [2.0, 0.5, 0.2], [1.4, 0.36, 0.4], [2.6, 0.56, 0.18],
  [1.25, 0.7, 0.5], [1.8, 0.42, 0.26], [2.3, 0.62, 0.3], [1.5, 0.5, 0.62],
];

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const photos = new Map();
let picked = null;
let selected = 0;
let userCount = 0;

export const doc = {
  format: 'landscape',
  layout: 'keyart',
  grade: 'sunset',
  strength: 0.8,
  style: 'vice',
  lean: true,
  title: 'HEAT RISES',
  tagline: 'SUMMER ON THE STRIP',
  extras: true,
  badge: 'SEASON|ONE',
  strip: 'EVERY SUNSET HAS A PRICE',
  credits: 'A NEON COVER STUDIO PICTURE - ALL PHOTOS YOUR OWN - LETTERED AND GRADED ON YOUR MACHINE',
  gutter: 0.012,
  frame: '#05010a',
  grain: true,
  panels: [],
};

function slot(photo, crop = VARIED_CROPS[0], label = '') {
  return { photo, zoom: crop[0], cx: crop[1], cy: crop[2], flip: false, label };
}

/** The plate text panel `i` keeps when its photo changes. */
const labelOf = (i) => doc.panels[i]?.label ?? DEFAULT_LABELS[i % DEFAULT_LABELS.length];

/** Puts `ids` into the panels in turn, each repeat of a photo cropped differently from the last. */
export function fillPanels(ids) {
  const seen = new Map();
  doc.panels = Array.from({ length: MAX_PANELS }, (_, i) => {
    const id = ids[i % ids.length];
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    return slot(id, VARIED_CROPS[(n + (ids.length === 1 ? 0 : i)) % VARIED_CROPS.length], labelOf(i));
  });
}

// ---- rendering -------------------------------------------------------------------------------------------------

let queued = false;
/** Redraws the preview on the next frame (many changes in one frame draw once). */
export function redraw() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    drawNow();
  });
}

export function drawNow(marks = true) {
  const f = FORMATS[doc.format];
  const scale = Math.min(1, 1280 / Math.max(f.w, f.h));
  const w = Math.round(f.w * scale);
  const h = Math.round(f.h * scale);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  renderPoster(canvas, doc, photos, marks ? { selected, numbers: true } : {});
}

/** Renders the cover at a post size on its own canvas, with no editor marks: the exported image. */
export function renderExport(formatId) {
  const f = FORMATS[formatId];
  const out = document.createElement('canvas');
  out.width = f.w;
  out.height = f.h;
  renderPoster(out, doc, photos);
  return out;
}

function fileName(f) {
  const words = doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
  return `${words}-${f.w}x${f.h}.png`;
}

/** Exports the cover in each format given, as PNG downloads. */
async function exportPng(formatIds) {
  const names = [];
  for (const id of formatIds) {
    const f = FORMATS[id];
    const blob = await new Promise((resolve) => renderExport(id).toBlob(resolve, 'image/png'));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName(f);
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    names.push(`${a.download} (${Math.round(blob.size / 1024)} KB)`);
  }
  setStatus(`Exported ${names.join(', ')}`);
}

function setStatus(text) {
  $('status').textContent = text;
}

// ---- photo library ---------------------------------------------------------------------------------------------

/** Reads a user's image file locally into a canvas (long side at most 2400 px). Nothing is uploaded. */
async function readPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const s = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    userCount += 1;
    const name = file.name.replace(/\.[^.]+$/, '') || `Photo ${userCount}`;
    return { id: `user-${userCount}`, name, src: c, w: c.width, h: c.height, user: true };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not read ${url}`));
    img.src = url;
  });
}

/** Adds the user's photos: the first ones fill the poster at once (one photo -> every panel, several -> mixed). */
export async function addPhotos(files) {
  const images = [...files].filter((f) => f.type.startsWith('image/'));
  if (!images.length) return;
  const firstOnes = ![...photos.values()].some((p) => p.user);
  const added = [];
  for (const file of images) {
    try {
      const p = await readPhoto(file);
      photos.set(p.id, p);
      added.push(p.id);
    } catch {
      setStatus(`Could not read ${file.name}`);
    }
  }
  if (!added.length) return;
  picked = added[0];
  if (firstOnes) fillPanels(added);
  else doc.panels[selected] = slot(added[0], VARIED_CROPS[0], labelOf(selected));
  renderTray();
  updatePanelTools();
  redraw();
  setStatus(`${added.length} photo${added.length > 1 ? 's' : ''} added. Drag inside a panel to position, scroll to zoom.`);
}

function renderTray() {
  const tray = $('tray');
  tray.replaceChildren();
  const list = [...photos.values()].sort((a, b) => (b.user ? 1 : 0) - (a.user ? 1 : 0));
  for (const p of list) {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = `${p.name}: click to put it in the selected panel`;
    b.className = p.id === picked ? 'picked' : '';
    const t = document.createElement('canvas');
    t.width = t.height = 96;
    const s = Math.max(96 / p.w, 96 / p.h);
    t.getContext('2d').drawImage(p.src, (96 - p.w * s) / 2, (96 - p.h * s) / 2, p.w * s, p.h * s);
    const label = document.createElement('span');
    label.textContent = p.name;
    b.append(t, label);
    b.addEventListener('click', () => {
      picked = p.id;
      doc.panels[selected] = slot(p.id, VARIED_CROPS[0], labelOf(selected));
      renderTray();
      updatePanelTools();
      redraw();
    });
    tray.append(b);
  }
}

// ---- panel crop --------------------------------------------------------------------------------------------------

export function selectPanel(i) {
  selected = Math.max(0, Math.min(i, LAYOUTS[doc.layout].photos.length - 1));
  picked = doc.panels[selected].photo;
  renderTray();
  updatePanelTools();
  redraw();
}

function updatePanelTools() {
  const s = doc.panels[selected];
  const photo = photos.get(s.photo);
  $('panel-label').textContent = `Panel ${selected + 1}${photo ? ` · ${photo.name}` : ''}`;
  $('zoom').value = Math.round(s.zoom * 100);
  $('pos-x').value = Math.round(s.cx * 1000);
  $('pos-y').value = Math.round(s.cy * 1000);
  $('flip').classList.toggle('on', s.flip);
  $('panel-text').value = s.label ?? '';
}

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * canvas.width, ((e.clientY - r.top) / r.height) * canvas.height];
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  const [x, y] = toCanvas(e);
  const i = panelAt(doc, canvas.width, canvas.height, x, y);
  if (i < 0) { $('title').focus(); return; }
  if (i !== selected) selectPanel(i);
  drag = { x, y };
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const [x, y] = toCanvas(e);
  const s = doc.panels[selected];
  const photo = photos.get(s.photo);
  if (!photo) return;
  const { scale } = cropFor(panelBox(doc, canvas.width, canvas.height, selected), photo, s);
  const dx = (x - drag.x) / scale / photo.w;
  const dy = (y - drag.y) / scale / photo.h;
  s.cx = clamp01(s.cx - (s.flip ? -dx : dx));
  s.cy = clamp01(s.cy - dy);
  drag = { x, y };
  updatePanelTools();
  redraw();
});
const endDrag = () => { drag = null; canvas.classList.remove('dragging'); };
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', (e) => {
  const [x, y] = toCanvas(e);
  const i = panelAt(doc, canvas.width, canvas.height, x, y);
  if (i < 0) return;
  e.preventDefault();
  if (i !== selected) selectPanel(i);
  const s = doc.panels[selected];
  s.zoom = Math.min(4, Math.max(1, s.zoom * Math.exp(-e.deltaY * 0.0015)));
  updatePanelTools();
  redraw();
}, { passive: false });
canvas.addEventListener('dblclick', () => {
  const s = doc.panels[selected];
  Object.assign(s, { zoom: 1, cx: 0.5, cy: 0.5 });
  updatePanelTools();
  redraw();
});

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// ---- controls ----------------------------------------------------------------------------------------------------

function radioButtons(container, entries, current, onPick, decorate) {
  const box = $(container);
  box.replaceChildren();
  for (const [id, label] of entries) {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(id === current()));
    b.dataset.id = id;
    if (decorate) decorate(b, id, label); else b.textContent = label;
    b.addEventListener('click', () => {
      onPick(id);
      for (const other of box.children) other.setAttribute('aria-checked', String(other.dataset.id === current()));
      redraw();
    });
    box.append(b);
  }
}

function layoutIcon(layout) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 64 36');
  const shapes = [...layout.photos.map((p) => [p, '#7d5bb5']), ...(layout.title.cell ? [[layout.title.cell, '#ff8a3d']] : [])];
  for (const [poly, fill] of shapes) {
    const el = document.createElementNS(ns, 'polygon');
    el.setAttribute('points', poly.map(([x, y]) => `${x * 64},${y * 36}`).join(' '));
    el.setAttribute('fill', fill);
    el.setAttribute('stroke', '#0c0716');
    el.setAttribute('stroke-width', '1.6');
    svg.append(el);
  }
  if (layout.title.overlay) {
    const o = layout.title.overlay;
    const bar = document.createElementNS(ns, 'rect');
    Object.entries({ x: o.x * 64 + 2, y: o.y * 36 + 4, width: o.w * 64 - 4, height: 5, fill: '#ff8a3d', rx: 1 }).forEach(([k, v]) => bar.setAttribute(k, v));
    svg.append(bar);
  }
  return svg;
}

function setupControls() {
  radioButtons('formats', Object.entries(FORMATS).map(([id, f]) => [id, f]), () => doc.format, (id) => { doc.format = id; }, (b, id, f) => {
    b.innerHTML = `${f.name}<small>${f.w}×${f.h}</small>`;
  });
  radioButtons('layouts', Object.entries(LAYOUTS).map(([id, l]) => [id, l]), () => doc.layout, (id) => {
    doc.layout = id;
    selectPanel(Math.min(selected, LAYOUTS[id].photos.length - 1));
  }, (b, id, l) => {
    const name = document.createElement('span');
    name.textContent = l.name;
    b.append(layoutIcon(l), name);
  });
  radioButtons('styles', Object.entries(TITLE_STYLES), () => doc.style, (id) => { doc.style = id; });
  radioButtons('grades', Object.entries(GRADES).map(([id, g]) => [id, g]), () => doc.grade, (id) => { doc.grade = id; }, (b, id, g) => {
    b.style.background = `linear-gradient(180deg, ${g.sky.join(', ')})`;
    b.title = g.name;
    const name = document.createElement('span');
    name.textContent = g.name;
    b.append(name);
  });

  $('title').addEventListener('input', (e) => { doc.title = e.target.value; redraw(); });
  $('tagline').addEventListener('input', (e) => { doc.tagline = e.target.value; redraw(); });
  $('badge').addEventListener('input', (e) => { doc.badge = e.target.value; redraw(); });
  $('strip').addEventListener('input', (e) => { doc.strip = e.target.value; redraw(); });
  $('extras').addEventListener('change', (e) => { doc.extras = e.target.checked; redraw(); });
  $('panel-text').addEventListener('input', (e) => { doc.panels[selected].label = e.target.value; redraw(); });
  $('lean').addEventListener('change', (e) => { doc.lean = e.target.checked; redraw(); });
  $('strength').addEventListener('input', (e) => { doc.strength = e.target.value / 100; redraw(); });
  $('gutter').addEventListener('input', (e) => { doc.gutter = e.target.value / 1000; redraw(); });
  $('grain').addEventListener('change', (e) => { doc.grain = e.target.checked; redraw(); });
  $('white-frame').addEventListener('change', (e) => { doc.frame = e.target.checked ? '#fbf6ee' : '#05010a'; redraw(); });
  $('zoom').addEventListener('input', (e) => { doc.panels[selected].zoom = e.target.value / 100; redraw(); });
  $('pos-x').addEventListener('input', (e) => { doc.panels[selected].cx = e.target.value / 1000; redraw(); });
  $('pos-y').addEventListener('input', (e) => { doc.panels[selected].cy = e.target.value / 1000; redraw(); });
  $('flip').addEventListener('click', () => { const s = doc.panels[selected]; s.flip = !s.flip; updatePanelTools(); redraw(); });
  $('reset-crop').addEventListener('click', () => { Object.assign(doc.panels[selected], { zoom: 1, cx: 0.5, cy: 0.5, flip: false }); updatePanelTools(); redraw(); });
  $('fill-one').addEventListener('click', () => {
    const id = picked ?? doc.panels[selected].photo;
    fillPanels([id]);
    updatePanelTools();
    redraw();
    setStatus(`${photos.get(id)?.name ?? 'Photo'} fills every panel, each cropped differently.`);
  });
  $('mix-all').addEventListener('click', () => {
    const users = [...photos.values()].filter((p) => p.user).map((p) => p.id);
    fillPanels(users.length ? users : [...photos.keys()]);
    updatePanelTools();
    redraw();
  });
  $('export').addEventListener('click', () => exportPng([doc.format]));
  $('export-all').addEventListener('click', () => exportPng(Object.keys(FORMATS)));

  $('photo-input').addEventListener('change', (e) => { addPhotos(e.target.files); e.target.value = ''; });
  const zone = $('drop-zone');
  window.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag'); });
  window.addEventListener('dragleave', () => zone.classList.remove('drag'));
  window.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('drag'); addPhotos(e.dataTransfer.files); });
  window.addEventListener('paste', (e) => addPhotos([...e.clipboardData.items].map((it) => it.getAsFile()).filter(Boolean)));
}

/** Syncs every control with `doc` (after a shot scene or any outside change). */
export function syncControls() {
  for (const [box, value] of [['formats', doc.format], ['layouts', doc.layout], ['styles', doc.style], ['grades', doc.grade]]) {
    for (const b of $(box).children) b.setAttribute('aria-checked', String(b.dataset.id === value));
  }
  $('title').value = doc.title;
  $('tagline').value = doc.tagline;
  $('lean').checked = doc.lean;
  $('badge').value = doc.badge;
  $('strip').value = doc.strip;
  $('extras').checked = doc.extras;
  $('strength').value = Math.round(doc.strength * 100);
  $('gutter').value = Math.round(doc.gutter * 1000);
  $('grain').checked = doc.grain;
  renderTray();
  updatePanelTools();
}

// ---- start -------------------------------------------------------------------------------------------------------

async function start() {
  for (const p of paintedSamples()) photos.set(p.id, p);
  for (const k of KIT_PHOTOS) {
    try {
      const img = await loadImage(k.url);
      photos.set(k.id, { id: k.id, name: k.name, src: img, w: img.naturalWidth, h: img.naturalHeight });
    } catch { /* a missing sample just leaves the painted ones */ }
  }
  const order = ['boulevard', 'pier', 'neon', 'boulevard', 'drive', 'palms', 'pier', 'palms'].filter((id) => photos.has(id));
  fillPanels(order.length ? order : [...photos.keys()]);
  picked = doc.panels[0].photo;
  setupControls();
  syncControls();
  const query = new URLSearchParams(location.search);
  if (query.get('shot')) {
    await runShot(query, { doc, photos, fillPanels, selectPanel, syncControls, drawNow, canvas, formats: FORMATS });
  } else {
    drawNow();
  }
}

start();
