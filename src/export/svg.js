/**
 * Renders drawing primitives to an SVG string.
 * Model Y points up, SVG Y points down, so every Y is negated.
 * The document is sized in real millimetres at 1:10 scale.
 */
const STYLES = {
  OUTLINE: 'fill="none" stroke="#1c221f" stroke-width="3" stroke-linejoin="round"',
  HIDDEN: 'fill="none" stroke="#7a827d" stroke-width="2" stroke-dasharray="14 8"',
  DIM: 'fill="none" stroke="#2e5c4f" stroke-width="1.4"',
};
const TEXT_FILL = { DIM: '#2e5c4f', TEXT: '#1c221f' };

const n = (v) => +v.toFixed(2);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function toSVG(drawing, { pad = 80 } = {}) {
  const { minX, minY, maxX, maxY } = drawing.bounds;
  const x = minX - pad;
  const y = -(maxY + pad);
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;

  const body = drawing.items.map((it) => {
    const style = STYLES[it.layer] || STYLES.OUTLINE;
    switch (it.type) {
      case 'line':
        return `<line x1="${n(it.x1)}" y1="${n(-it.y1)}" x2="${n(it.x2)}" y2="${n(-it.y2)}" ${style}/>`;
      case 'poly': {
        const pts = it.pts.map(([px, py]) => `${n(px)},${n(-py)}`).join(' ');
        return `<${it.closed ? 'polygon' : 'polyline'} points="${pts}" ${style}/>`;
      }
      case 'circle':
        return `<circle cx="${n(it.x)}" cy="${n(-it.y)}" r="${n(it.r)}" ${style}/>`;
      case 'text': {
        const rot = it.rot ? ` transform="rotate(${-it.rot} ${n(it.x)} ${n(-it.y)})"` : '';
        return `<text x="${n(it.x)}" y="${n(-it.y)}" font-size="${it.h}" text-anchor="middle" fill="${TEXT_FILL[it.layer] || '#1c221f'}"${rot}>${esc(it.value)}</text>`;
      }
      default:
        return '';
    }
  }).join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${n(w / 10)}mm" height="${n(h / 10)}mm" viewBox="${n(x)} ${n(y)} ${n(w)} ${n(h)}" font-family="Arial, Helvetica, sans-serif">
  <rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="#ffffff"/>
  ${body}
</svg>
`;
}
