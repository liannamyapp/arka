/**
 * Writes drawing primitives as an ASCII DXF (AutoCAD R12 / AC1009).
 * R12 is the most widely supported flavour: AutoCAD, LibreCAD, QCAD,
 * CNC/CAM software and online viewers all open it.
 *
 * Units are millimetres ($INSUNITS = 4). Layers: OUTLINE, HIDDEN, DIM, TEXT.
 */
const LAYERS = [
  { name: 'OUTLINE', color: 7, ltype: 'CONTINUOUS' },
  { name: 'HIDDEN', color: 8, ltype: 'DASHED' },
  { name: 'DIM', color: 4, ltype: 'CONTINUOUS' },
  { name: 'TEXT', color: 7, ltype: 'CONTINUOUS' },
];

const f = (v) => (+v).toFixed(3);

export function toDXF(drawing) {
  const out = [];
  const g = (code, value) => out.push(String(code), String(value));

  // HEADER
  g(0, 'SECTION'); g(2, 'HEADER');
  g(9, '$ACADVER'); g(1, 'AC1009');
  g(9, '$INSUNITS'); g(70, 4);
  g(9, '$EXTMIN'); g(10, f(drawing.bounds.minX)); g(20, f(drawing.bounds.minY));
  g(9, '$EXTMAX'); g(10, f(drawing.bounds.maxX)); g(20, f(drawing.bounds.maxY));
  g(0, 'ENDSEC');

  // TABLES: line types and layers
  g(0, 'SECTION'); g(2, 'TABLES');
  g(0, 'TABLE'); g(2, 'LTYPE'); g(70, 2);
  g(0, 'LTYPE'); g(2, 'CONTINUOUS'); g(70, 0); g(3, 'Solid line'); g(72, 65); g(73, 0); g(40, f(0));
  g(0, 'LTYPE'); g(2, 'DASHED'); g(70, 0); g(3, '__ __ __'); g(72, 65); g(73, 2); g(40, f(22)); g(49, f(14)); g(49, f(-8));
  g(0, 'ENDTAB');
  g(0, 'TABLE'); g(2, 'LAYER'); g(70, LAYERS.length);
  for (const l of LAYERS) { g(0, 'LAYER'); g(2, l.name); g(70, 0); g(62, l.color); g(6, l.ltype); }
  g(0, 'ENDTAB');
  g(0, 'ENDSEC');

  // ENTITIES
  g(0, 'SECTION'); g(2, 'ENTITIES');
  const line = (x1, y1, x2, y2, layer) => {
    g(0, 'LINE'); g(8, layer);
    g(10, f(x1)); g(20, f(y1)); g(30, f(0));
    g(11, f(x2)); g(21, f(y2)); g(31, f(0));
  };

  for (const it of drawing.items) {
    switch (it.type) {
      case 'line':
        line(it.x1, it.y1, it.x2, it.y2, it.layer);
        break;
      case 'poly': {
        const pts = it.pts;
        const count = it.closed ? pts.length : pts.length - 1;
        for (let i = 0; i < count; i++) {
          const [ax, ay] = pts[i];
          const [bx, by] = pts[(i + 1) % pts.length];
          line(ax, ay, bx, by, it.layer);
        }
        break;
      }
      case 'circle':
        g(0, 'CIRCLE'); g(8, it.layer);
        g(10, f(it.x)); g(20, f(it.y)); g(30, f(0)); g(40, f(it.r));
        break;
      case 'text':
        // 72 = 1 centres the text on the alignment point (11/21)
        g(0, 'TEXT'); g(8, it.layer);
        g(10, f(it.x)); g(20, f(it.y)); g(30, f(0));
        g(40, f(it.h)); g(1, it.value);
        if (it.rot) g(50, f(it.rot));
        g(72, 1);
        g(11, f(it.x)); g(21, f(it.y)); g(31, f(0));
        break;
    }
  }
  g(0, 'ENDSEC');
  g(0, 'EOF');
  return out.join('\r\n') + '\r\n';
}
