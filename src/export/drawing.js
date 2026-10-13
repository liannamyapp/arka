import { dimensions, skuBase, FABRICS, LEGS } from '../config.js';

/**
 * Builds a 2D technical drawing (front view + top view with dimensions)
 * for the current configuration. Units are millimetres, Y axis points up.
 *
 * The result is a list of format-independent primitives:
 *   line   { x1, y1, x2, y2 }
 *   poly   { pts: [[x, y], ...], closed }
 *   circle { x, y, r }
 *   text   { x, y, value, h, rot }   (x, y = baseline centre, rot in degrees)
 * Each primitive has a `layer`: OUTLINE, HIDDEN, DIM or TEXT.
 * SVG and DXF exporters render the same list.
 */
export function buildDrawing(state) {
  const d = dimensions(state.arms);
  const W = d.width;
  const items = [];

  const line = (x1, y1, x2, y2, layer = 'OUTLINE') => items.push({ type: 'line', x1, y1, x2, y2, layer });
  const rect = (x1, y1, x2, y2, layer = 'OUTLINE') =>
    items.push({ type: 'poly', pts: [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], closed: true, layer });
  const poly = (pts, layer = 'OUTLINE') => items.push({ type: 'poly', pts, closed: true, layer });
  const circle = (x, y, r, layer = 'OUTLINE') => items.push({ type: 'circle', x, y, r, layer });
  const text = (x, y, value, h = 26, rot = 0, layer = 'TEXT') => items.push({ type: 'text', x, y, value, h, rot, layer });

  const TICK = 10;
  const EXT = 15;

  /** Horizontal dimension between x1 and x2; feature at yFeat, dimension line at yLine. */
  function dimH(x1, x2, yFeat, yLine, label) {
    const dir = Math.sign(yLine - yFeat) || -1;
    line(x1, yFeat + dir * EXT, x1, yLine + dir * EXT, 'DIM');
    line(x2, yFeat + dir * EXT, x2, yLine + dir * EXT, 'DIM');
    line(x1 - 20, yLine, x2 + 20, yLine, 'DIM');
    line(x1 - TICK, yLine - TICK, x1 + TICK, yLine + TICK, 'DIM');
    line(x2 - TICK, yLine - TICK, x2 + TICK, yLine + TICK, 'DIM');
    text((x1 + x2) / 2, yLine + 12, label, 26, 0, 'DIM');
  }

  /** Vertical dimension between y1 and y2; feature at xFeat, dimension line at xLine. */
  function dimV(y1, y2, xFeat, xLine, label) {
    const dir = Math.sign(xLine - xFeat) || -1;
    line(xFeat + dir * EXT, y1, xLine + dir * EXT, y1, 'DIM');
    line(xFeat + dir * EXT, y2, xLine + dir * EXT, y2, 'DIM');
    line(xLine, y1 - 20, xLine, y2 + 20, 'DIM');
    line(xLine - TICK, y1 - TICK, xLine + TICK, y1 + TICK, 'DIM');
    line(xLine - TICK, y2 - TICK, xLine + TICK, y2 + TICK, 'DIM');
    text(xLine - 12, (y1 + y2) / 2, label, 26, 90, 'DIM');
  }

  // ---------- Front view, centred on x = 0, floor at y = 0 ----------
  for (const s of [-1, 1]) {
    poly([[s * 270 - 21, 300], [s * 270 + 21, 300], [s * 300 + 13, 0], [s * 300 - 13, 0]]);
  }
  rect(-320, 300, 320, 350);              // frame
  rect(-300, 350, 300, d.seatHeight);     // seat cushion
  rect(-300, d.seatHeight, 300, d.height); // backrest
  if (state.arms) {
    for (const s of [-1, 1]) {
      rect(s * 335 - 35, 590, s * 335 + 35, 630); // armrest
      rect(s * 335 - 20, 350, s * 335 + 20, 590); // arm post
    }
  }
  dimH(-W / 2, W / 2, 0, -110, String(W));
  dimV(0, d.height, -W / 2, -W / 2 - 110, String(d.height));
  dimV(0, d.seatHeight, W / 2, W / 2 + 110, String(d.seatHeight));
  text(0, -240, 'FRONT VIEW', 34);

  // ---------- Top view, to the right ----------
  const ox = W + 500;
  const cy = 420;
  const front = cy - d.depth / 2;
  const rear = cy + d.depth / 2;

  for (const sx of [-1, 1]) for (const sz of [-1, 1]) circle(ox + sx * 300, cy + sz * 290, 13, 'HIDDEN');
  rect(ox - 320, front + 10, ox + 320, rear - 40); // frame
  rect(ox - 300, front, ox + 300, cy + 200);       // seat
  rect(ox - 300, cy + 200, ox + 300, rear);        // backrest
  if (state.arms) {
    for (const s of [-1, 1]) rect(ox + s * 335 - 35, front + 40, ox + s * 335 + 35, cy + 260);
  }
  dimH(ox - W / 2, ox + W / 2, front, front - 110, String(W));
  dimV(front, rear, ox + W / 2, ox + W / 2 + 110, String(d.depth));
  text(ox, -240, 'TOP VIEW', 34);

  // ---------- Title line ----------
  const title = `ARKA ${skuBase(state)}  |  ${FABRICS[state.fabric].code} / ${LEGS[state.leg].code}  |  dimensions in mm`;
  text(ox / 2, -340, title, 24);

  return { items, bounds: computeBounds(items) };
}

function computeBounds(items) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const add = (x, y) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  };
  for (const it of items) {
    if (it.type === 'line') { add(it.x1, it.y1); add(it.x2, it.y2); }
    else if (it.type === 'poly') it.pts.forEach(([x, y]) => add(x, y));
    else if (it.type === 'circle') { add(it.x - it.r, it.y - it.r); add(it.x + it.r, it.y + it.r); }
    else if (it.type === 'text') {
      const half = it.value.length * it.h * 0.32;
      if (it.rot === 90) { add(it.x - it.h, it.y - half); add(it.x, it.y + half); }
      else { add(it.x - half, it.y); add(it.x + half, it.y + it.h); }
    }
  }
  return { minX, minY, maxX, maxY };
}
