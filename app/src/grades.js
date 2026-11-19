// Colour grades: each maps a photo's brightness onto a gradient (a gradient map, mixed with a punchier copy of the
// original so skin keeps some of its colour), and carries the palette its title cell, sun and lettering use.

export const GRADES = {
  sunset: {
    name: 'Sunset Strip',
    shadow: '#3b0d6e', light: '#ffb257', floor: '#2a0636',
    stops: [[0, '#1a0533'], [0.32, '#6e1a6a'], [0.58, '#f2456f'], [0.8, '#ffa24c'], [1, '#fff1c2']],
    contrast: 1.2, saturation: 1.15,
    sky: ['#26093f', '#8c1f6e', '#ff5a52', '#ffc45e'],
    sun: ['#fff3a0', '#ffb347', '#ff3d7f'],
    ground: '#1b0630', grid: '#ff6fb0',
    ink: { chrome: ['#fffbe0', '#ffc94a', '#ff5f6d', '#b81fcf'], deep: '#4d0b45', neon: '#ff4fb8', neonCore: '#fff0fa', accent: '#ffd36b' },
  },
  neon: {
    name: 'Neon Night',
    shadow: '#0b2a7a', light: '#ff7fd6', floor: '#120838',
    stops: [[0, '#06011c'], [0.3, '#2c0f8f'], [0.56, '#b81fd0'], [0.8, '#ff5aa8'], [1, '#a8fbff']],
    contrast: 1.28, saturation: 1.2, scanlines: true,
    sky: ['#04011a', '#1e0a5c', '#7a19a8', '#ff3fa4'],
    sun: ['#ffd1f6', '#ff6ad5', '#8a2be2'],
    ground: '#07021c', grid: '#47f3ff',
    ink: { chrome: ['#e9fdff', '#6ff7ff', '#ff5fd2', '#7b2cff'], deep: '#1f0752', neon: '#ff2fd0', neonCore: '#fff2fd', accent: '#5ff6ff' },
  },
  golden: {
    name: 'Golden Hour',
    shadow: '#4a1630', light: '#ffc86b', floor: '#2a0c08',
    stops: [[0, '#1e0a03'], [0.38, '#7d2c12'], [0.66, '#ee8530'], [0.86, '#ffc56b'], [1, '#fff6d8']],
    contrast: 1.16, saturation: 1.1,
    sky: ['#3a1206', '#a8361b', '#f28b2f', '#ffe08a'],
    sun: ['#fffbe0', '#ffd25c', '#ff7a2f'],
    ground: '#2a0c04', grid: '#ffb347',
    ink: { chrome: ['#fffdf0', '#ffd768', '#ff8a2a', '#c2361a'], deep: '#4a1406', neon: '#ffb02e', neonCore: '#fffbe8', accent: '#ffe7a3' },
  },
  ocean: {
    name: 'Ocean Drive',
    shadow: '#063f5c', light: '#ffb4a0', floor: '#04202c',
    stops: [[0, '#021b29'], [0.34, '#0c6577'], [0.6, '#ff7c9c'], [0.84, '#ffc9a6'], [1, '#fff8e8']],
    contrast: 1.18, saturation: 1.12,
    sky: ['#032c45', '#0e8a9a', '#ff8fa8', '#ffe2b8'],
    sun: ['#fffef0', '#ffd0a8', '#ff6f91'],
    ground: '#03202e', grid: '#64fff0',
    ink: { chrome: ['#ffffff', '#7ff6ee', '#ff7aa2', '#ff4f7b'], deep: '#063a4f', neon: '#3ff2e0', neonCore: '#f2fffd', accent: '#ff9fb8' },
  },
  natural: {
    name: 'Natural Pop',
    shadow: '#1d2a5a', light: '#ffd08a', floor: '#120a1c',
    stops: null,
    contrast: 1.14, saturation: 1.28,
    sky: ['#1c2a5a', '#4560b0', '#f08a5d', '#ffd59a'],
    sun: ['#fffbe8', '#ffd36b', '#ff8c42'],
    ground: '#141a33', grid: '#ffd36b',
    ink: { chrome: ['#ffffff', '#ffe08a', '#ff9a3d', '#e2452c'], deep: '#3a1206', neon: '#ffd23f', neonCore: '#fffdf0', accent: '#ffe08a' },
  },
};

const lutCache = new Map();

/** Builds the 256-entry RGB lookup table of a grade's gradient map (null for a grade without one). */
export function gradeLut(grade) {
  if (!grade.stops) return null;
  if (lutCache.has(grade)) return lutCache.get(grade);
  const stops = grade.stops.map(([at, hex]) => [at, hexToRgb(hex)]);
  const lut = new Uint8ClampedArray(768);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [a0, c0] = stops[k];
    const [a1, c1] = stops[k + 1];
    const f = Math.min(1, Math.max(0, (t - a0) / (a1 - a0 || 1)));
    for (let ch = 0; ch < 3; ch++) lut[i * 3 + ch] = c0[ch] + (c1[ch] - c0[ch]) * f;
  }
  lutCache.set(grade, lut);
  return lut;
}

/**
 * Grades pixels in place, the poster way: vibrance and an S-curve first, then the grade's gradient map laid over
 * the photo with an overlay blend (so faces keep their detail and skin its warmth), split toning that pushes the
 * shadows towards the grade's `shadow` colour and the highlights towards its `light`, and a lifted, tinted black.
 * `strength` (0..1) scales everything after the vibrance.
 */
export function gradePixels(data, grade, strength) {
  const lut = gradeLut(grade);
  const c = grade.contrast;
  const s = grade.saturation;
  const sh = hexToRgb(grade.shadow ?? '#2a0b4a');
  const hi = hexToRgb(grade.light ?? '#ffb15c');
  const floor = hexToRgb(grade.floor ?? '#14051f');
  const over = lut ? Math.min(1, 1.05 * strength) : 0;
  const wash = lut ? 0.26 * strength : 0;
  const tone = 0.42 * strength;
  const lift = 0.55 * strength;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
    // vibrance: muted colours gain more saturation than already-vivid ones
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l0 = r * 0.299 + g * 0.587 + b * 0.114;
    const vib = s + (s - 1) * 1.6 * (1 - (mx - mn));
    r = l0 + (r - l0) * vib; g = l0 + (g - l0) * vib; b = l0 + (b - l0) * vib;
    // S-curve contrast
    r = sCurve(r, c); g = sCurve(g, c); b = sCurve(b, c);
    const l = clamp01(r * 0.299 + g * 0.587 + b * 0.114);
    if (over) {
      const j = (l * 255 | 0) * 3;
      r += (overlay(r, lut[j] / 255) - r) * over;
      g += (overlay(g, lut[j + 1] / 255) - g) * over;
      b += (overlay(b, lut[j + 2] / 255) - b) * over;
      r += (lut[j] / 255 - r) * wash; g += (lut[j + 1] / 255 - g) * wash; b += (lut[j + 2] / 255 - b) * wash;
    } else {
      r += 0.05 * strength; b -= 0.05 * strength;
    }
    const ws = (1 - l) * (1 - l) * tone;
    const wh = l * l * tone;
    r += (sh[0] / 255 - r) * ws + (hi[0] / 255 - r) * wh;
    g += (sh[1] / 255 - g) * ws + (hi[1] / 255 - g) * wh;
    b += (sh[2] / 255 - b) * ws + (hi[2] / 255 - b) * wh;
    // matte: blacks lift towards a tinted floor instead of crushing to grey
    data[i] = 255 * (r + (floor[0] / 255) * (1 - r) * lift * 0.5);
    data[i + 1] = 255 * (g + (floor[1] / 255) * (1 - g) * lift * 0.5);
    data[i + 2] = 255 * (b + (floor[2] / 255) * (1 - b) * lift * 0.5);
  }
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
function overlay(base, blend) {
  return base < 0.5 ? 2 * base * blend : 1 - 2 * (1 - base) * (1 - blend);
}
/** Contrast as a smooth S around mid-grey: `k` 1 leaves it, 1.3 is punchy. */
function sCurve(v, k) {
  v = clamp01(v);
  const smooth = v * v * (3 - 2 * v);
  return clamp01(v + (smooth - v) * (k - 1) * 2.2);
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A small seeded pseudo-random generator (mulberry32), so grain and sample scenes are the same on every run. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let grainTile = null;
/** A 192 px tile of seeded film grain, drawn over the whole cover. */
export function grainPattern(ctx) {
  if (!grainTile) {
    grainTile = document.createElement('canvas');
    grainTile.width = grainTile.height = 192;
    const g = grainTile.getContext('2d');
    const img = g.createImageData(192, 192);
    const rnd = seededRandom(1979);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (rnd() - 0.5) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  return ctx.createPattern(grainTile, 'repeat');
}
