// Sample pictures: the kit's two photos (made with an image model for make.fun, free to use) and three scenes this
// app paints itself, seeded so they come out the same every time: a palm beach at sunset, a neon motel street at
// night and a coastal drive at dusk. They let a first-time user see a full poster before adding their own photos.

import { seededRandom } from './grades.js';
import { drawTitleBlock } from './lettering.js';

export const KIT_PHOTOS = [
  { id: 'boulevard', name: 'Boulevard', url: 'samples/boulevard.jpg' },
  { id: 'pier', name: 'Pier', url: 'samples/pier.jpg' },
];

/** A palm silhouette: a leaning, tapering trunk and drooping fronds of leaflets. */
export function drawPalm(ctx, x, baseY, height, lean, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  const topX = x + lean * height;
  const topY = baseY - height;
  const ctrlX = x + lean * height * 0.15;
  const ctrlY = baseY - height * 0.55;
  const steps = 24;
  let px = x, py = baseY;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const nx = (1 - t) ** 2 * x + 2 * (1 - t) * t * ctrlX + t * t * topX;
    const ny = (1 - t) ** 2 * baseY + 2 * (1 - t) * t * ctrlY + t * t * topY;
    ctx.lineWidth = height * (0.05 - 0.028 * t);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    px = nx; py = ny;
  }
  const fronds = [-2.9, -2.4, -1.9, -1.35, -0.9, -0.35, 0.15, 0.6];
  for (const a of fronds) {
    const len = height * (0.36 + 0.06 * Math.cos(a * 3));
    const dirX = Math.cos(a);
    const dirY = Math.sin(a);
    const midX = topX + dirX * len * 0.55;
    const midY = topY + dirY * len * 0.55 - len * 0.12;
    const endX = topX + dirX * len;
    const endY = topY + dirY * len * 0.6 + len * 0.42;
    ctx.lineWidth = height * 0.012;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY, endX, endY);
    ctx.stroke();
    for (let k = 2; k <= 16; k++) {
      const t = k / 17;
      const qx = (1 - t) ** 2 * topX + 2 * (1 - t) * t * midX + t * t * endX;
      const qy = (1 - t) ** 2 * topY + 2 * (1 - t) * t * midY + t * t * endY;
      const tx = 2 * (1 - t) * (midX - topX) + 2 * t * (endX - midX);
      const ty = 2 * (1 - t) * (midY - topY) + 2 * t * (endY - midY);
      const n = Math.hypot(tx, ty) || 1;
      const leaf = len * 0.2 * Math.sin(Math.PI * t) + len * 0.03;
      ctx.lineWidth = height * 0.007;
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(qx, qy);
        ctx.lineTo(qx + (-ty / n) * leaf * side + (tx / n) * leaf * 0.35, qy + (tx / n) * leaf * side + (ty / n) * leaf * 0.35 + leaf * 0.35);
        ctx.stroke();
      }
    }
  }
  ctx.beginPath();
  ctx.arc(topX, topY, height * 0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function gradientY(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}

function skyline(ctx, rnd, y, w, minH, maxH, color, windows) {
  let x = -10;
  while (x < w) {
    const bw = 30 + rnd() * 70;
    const bh = minH + rnd() * (maxH - minH);
    ctx.fillStyle = color;
    ctx.fillRect(x, y - bh, bw, bh + 2);
    if (windows) {
      for (let wy = y - bh + 10; wy < y - 8; wy += 14) {
        for (let wx = x + 6; wx < x + bw - 8; wx += 11) {
          if (rnd() < 0.42) {
            ctx.fillStyle = windows[(rnd() * windows.length) | 0];
            ctx.fillRect(wx, wy, 5, 7);
          }
        }
      }
    }
    x += bw + 2 + rnd() * 6;
  }
}

/** Palm beach at sunset: striped sun over the sea, a far skyline, glittering reflections and three palms. */
function paintPalmBeach() {
  const c = canvasOf(1400, 1000);
  const ctx = c.getContext('2d');
  const rnd = seededRandom(7);
  const horizon = 600;
  ctx.fillStyle = gradientY(ctx, 0, horizon, ['#1c0838', '#6a1b6e', '#e8405f', '#ff9a4a', '#ffd27a']);
  ctx.fillRect(0, 0, 1400, horizon);
  ctx.save();
  ctx.shadowColor = '#ffb347';
  ctx.shadowBlur = 90;
  ctx.fillStyle = gradientY(ctx, 360, 620, ['#fff6b0', '#ffb347', '#ff4f6e']);
  ctx.beginPath();
  ctx.arc(860, 520, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  skyline(ctx, rnd, horizon, 520, 30, 150, '#2a0a33', null);
  ctx.fillStyle = gradientY(ctx, horizon, 1000, ['#3b0f4f', '#14062a', '#07020f']);
  ctx.fillRect(0, horizon, 1400, 400);
  for (let i = 0; i < 70; i++) {
    const y = horizon + 6 + (i / 70) ** 1.6 * 300;
    const half = 30 + 160 * (1 - i / 70) * (0.6 + rnd() * 0.6);
    ctx.fillStyle = i % 3 ? 'rgba(255,190,90,0.55)' : 'rgba(255,100,140,0.5)';
    ctx.fillRect(860 - half + (rnd() - 0.5) * 60, y, half * 2 * (0.3 + rnd() * 0.7), 2 + i / 30);
  }
  ctx.fillStyle = '#0a0310';
  ctx.beginPath();
  ctx.moveTo(0, 860);
  ctx.quadraticCurveTo(700, 800, 1400, 900);
  ctx.lineTo(1400, 1000);
  ctx.lineTo(0, 1000);
  ctx.fill();
  drawPalm(ctx, 160, 1010, 760, 0.3, '#0a0310');
  drawPalm(ctx, 330, 1010, 560, 0.42, '#0a0310');
  drawPalm(ctx, 1260, 1010, 820, -0.24, '#0a0310');
  return c;
}

/** Neon motel street at night: lit towers, glowing signs in the app's own lettering, wet road reflections, a car. */
function paintNeonStreet() {
  const c = canvasOf(1400, 1000);
  const ctx = c.getContext('2d');
  const rnd = seededRandom(23);
  ctx.fillStyle = gradientY(ctx, 0, 640, ['#05011a', '#1b0750', '#4a127a', '#a21f8f']);
  ctx.fillRect(0, 0, 1400, 640);
  skyline(ctx, rnd, 640, 1400, 220, 520, '#0d0624', ['#ffcf6b', '#5ff6ff', '#ff6ad5', '#fff2c4']);
  skyline(ctx, rnd, 660, 1400, 90, 260, '#07020f', ['#ff9f43', '#5ff6ff']);
  const ink = (neon) => ({ neon, neonCore: '#fff6fd', accent: neon, chrome: [], deep: '#000' });
  ctx.fillStyle = '#12051f';
  ctx.fillRect(90, 330, 380, 150);
  drawTitleBlock(ctx, { x: 110, y: 340, w: 340, h: 130 }, 'MOTEL', '', 'neon', ink('#ff2fd0'), false);
  ctx.fillStyle = '#12051f';
  ctx.fillRect(980, 260, 300, 120);
  drawTitleBlock(ctx, { x: 1000, y: 270, w: 260, h: 100 }, 'OPEN 24', '', 'neon', ink('#47f3ff'), false);
  ctx.fillStyle = '#12051f';
  ctx.fillRect(610, 420, 220, 110);
  drawTitleBlock(ctx, { x: 625, y: 430, w: 190, h: 90 }, 'CLUB', '', 'neon', ink('#ffb02e'), false);
  ctx.fillStyle = gradientY(ctx, 660, 1000, ['#1a0830', '#0b0418', '#050109']);
  ctx.fillRect(0, 660, 1400, 340);
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (const [x, wdt, col] of [[280, 300, '#ff2fd0'], [1130, 240, '#47f3ff'], [720, 180, '#ffb02e']]) {
    ctx.fillStyle = gradientY(ctx, 670, 1000, [col, 'rgba(0,0,0,0)']);
    for (let k = 0; k < 14; k++) ctx.fillRect(x - wdt / 2 + rnd() * wdt, 670 + rnd() * 40, 4 + rnd() * 10, 200 + rnd() * 120);
  }
  ctx.restore();
  ctx.fillStyle = '#05010a';
  ctx.beginPath();
  ctx.moveTo(470, 900); ctx.lineTo(500, 800); ctx.lineTo(590, 760); ctx.lineTo(820, 760);
  ctx.lineTo(910, 800); ctx.lineTo(940, 900); ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.shadowColor = '#ff2a3a';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ff3b4f';
  ctx.fillRect(500, 830, 110, 18);
  ctx.fillRect(800, 830, 110, 18);
  ctx.restore();
  return c;
}

/** Coastal drive at dusk: a road running to a glowing skyline, lane dashes, roadside palms and a coupe. */
function paintCoastalDrive() {
  const c = canvasOf(1400, 1000);
  const ctx = c.getContext('2d');
  const rnd = seededRandom(41);
  const horizon = 520;
  ctx.fillStyle = gradientY(ctx, 0, horizon, ['#0f2a5c', '#4b3c8f', '#e0567a', '#ffb066', '#ffe3a1']);
  ctx.fillRect(0, 0, 1400, horizon);
  ctx.save();
  ctx.shadowColor = '#ffd27a';
  ctx.shadowBlur = 60;
  ctx.fillStyle = '#fff1b8';
  ctx.beginPath();
  ctx.arc(700, horizon - 40, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  skyline(ctx, rnd, horizon, 1400, 40, 240, '#25163f', ['#ffd27a', '#ff9fd0']);
  ctx.fillStyle = gradientY(ctx, horizon, 1000, ['#2b1a3a', '#120a1c']);
  ctx.fillRect(0, horizon, 1400, 480);
  ctx.fillStyle = '#1b1426';
  ctx.beginPath();
  ctx.moveTo(680, horizon); ctx.lineTo(720, horizon); ctx.lineTo(1300, 1000); ctx.lineTo(100, 1000);
  ctx.fill();
  ctx.fillStyle = '#ffd27a';
  for (let k = 0; k < 9; k++) {
    const t0 = (k / 9) ** 2;
    const t1 = ((k + 0.5) / 9) ** 2;
    const y0 = horizon + t0 * 480;
    const y1 = horizon + t1 * 480;
    ctx.beginPath();
    ctx.moveTo(700 - 1 - t0 * 8, y0); ctx.lineTo(700 + 1 + t0 * 8, y0);
    ctx.lineTo(700 + 1 + t1 * 8, y1); ctx.lineTo(700 - 1 - t1 * 8, y1);
    ctx.fill();
  }
  for (let k = 0; k < 6; k++) {
    const t = 0.15 + k * 0.17;
    const s = 120 + t * 700;
    drawPalm(ctx, 700 - 40 - t * 640, horizon + t * 480, s, 0.12, '#0b0614');
    drawPalm(ctx, 700 + 40 + t * 640, horizon + t * 480, s, -0.12, '#0b0614');
  }
  ctx.fillStyle = '#0a0510';
  ctx.beginPath();
  ctx.moveTo(520, 930); ctx.lineTo(540, 850); ctx.lineTo(600, 830); ctx.lineTo(640, 780); ctx.lineTo(780, 780);
  ctx.lineTo(820, 830); ctx.lineTo(880, 850); ctx.lineTo(900, 930); ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.shadowColor = '#ff2a3a';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ff3b4f';
  ctx.fillRect(545, 862, 90, 14);
  ctx.fillRect(785, 862, 90, 14);
  ctx.restore();
  return c;
}

/** The painted scenes, as photo records { id, name, src, w, h }. */
export function paintedSamples() {
  return [
    ['palms', 'Palm Beach', paintPalmBeach],
    ['neon', 'Motel Strip', paintNeonStreet],
    ['drive', 'Coast Drive', paintCoastalDrive],
  ].map(([id, name, paint]) => {
    const src = paint();
    return { id, name, src, w: src.width, h: src.height };
  });
}
