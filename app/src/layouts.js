// Poster layouts: each is a set of panels, polygons in 0..1 of the cover, stroked over with the gutter colour so
// every seam gets the same width, plus where the caption goes: a `title` cell of its own (sky, sun and lettering)
// or an `overlay` box lettered over the photos.

const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

export const LAYOUTS = {
  mosaic: {
    name: 'Mosaic Nine',
    photos: [
      rect(0, 0, 0.36, 0.34), rect(0.36, 0, 0.3, 0.34), rect(0.66, 0, 0.34, 0.5),
      rect(0, 0.34, 0.22, 0.36), rect(0.22, 0.34, 0.44, 0.36), rect(0.66, 0.5, 0.34, 0.2),
      rect(0, 0.7, 0.24, 0.3), rect(0.76, 0.7, 0.24, 0.3),
    ],
    title: { cell: rect(0.24, 0.7, 0.52, 0.3) },
  },
  hero: {
    name: 'Hero + Three',
    photos: [rect(0, 0, 0.62, 1), rect(0.62, 0, 0.38, 0.34), rect(0.62, 0.34, 0.38, 0.33), rect(0.62, 0.67, 0.38, 0.33)],
    title: { overlay: { x: 0.03, y: 0.64, w: 0.56, h: 0.32 } },
  },
  slash: {
    name: 'Slash Three',
    photos: [
      [[0, 0], [0.4, 0], [0.31, 0.72], [0, 0.72]],
      [[0.4, 0], [0.72, 0], [0.63, 0.72], [0.31, 0.72]],
      [[0.72, 0], [1, 0], [1, 0.72], [0.63, 0.72]],
    ],
    title: { cell: [[0, 0.72], [1, 0.72], [1, 1], [0, 1]] },
  },
  band: {
    name: 'Split Band',
    photos: [
      [[0, 0], [0.5, 0], [0.5, 0.38], [0, 0.4]],
      [[0.5, 0], [1, 0], [1, 0.36], [0.5, 0.38]],
      [[0, 0.66], [0.5, 0.64], [0.5, 1], [0, 1]],
      [[0.5, 0.64], [1, 0.62], [1, 1], [0.5, 1]],
    ],
    title: { cell: [[0, 0.4], [1, 0.36], [1, 0.62], [0, 0.66]] },
  },
  single: {
    name: 'Full Bleed',
    photos: [rect(0, 0, 1, 1)],
    title: { overlay: { x: 0.06, y: 0.62, w: 0.88, h: 0.32 } },
  },
};

/** The most photo panels any layout has: the document keeps this many panel slots. */
export const MAX_PANELS = Math.max(...Object.values(LAYOUTS).map((l) => l.photos.length));

/** Scales a polygon to pixels, with its bounding box. */
export function polygonToPixels(poly, w, h) {
  const pts = poly.map(([x, y]) => [x * w, y * h]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.floor(Math.min(...xs));
  const y0 = Math.floor(Math.min(...ys));
  return { pts, box: { x: x0, y: y0, w: Math.ceil(Math.max(...xs)) - x0, h: Math.ceil(Math.max(...ys)) - y0 } };
}

export function polygonPath(pts) {
  const path = new Path2D();
  pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
  path.closePath();
  return path;
}

/** The caption's box in pixels: inside the title cell (inset) or the overlay box. */
export function titleBox(layout, w, h) {
  if (layout.title.cell) {
    const { box } = polygonToPixels(layout.title.cell, w, h);
    const padX = box.w * 0.08;
    const padY = box.h * 0.14;
    return { x: box.x + padX, y: box.y + padY, w: box.w - 2 * padX, h: box.h - 2 * padY };
  }
  const o = layout.title.overlay;
  return { x: o.x * w, y: o.y * h, w: o.w * w, h: o.h * h };
}
