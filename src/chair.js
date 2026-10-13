import * as THREE from 'three';

/** Box with rounded edges built from an extruded rounded rectangle with a bevel. */
function roundedBox(w, h, d, r) {
  const iw = w - 2 * r;
  const ih = h - 2 * r;
  const cr = Math.min(iw, ih) * 0.12;
  const x = -iw / 2;
  const y = -ih / 2;

  const shape = new THREE.Shape();
  shape.moveTo(x + cr, y);
  shape.lineTo(x + iw - cr, y);
  shape.quadraticCurveTo(x + iw, y, x + iw, y + cr);
  shape.lineTo(x + iw, y + ih - cr);
  shape.quadraticCurveTo(x + iw, y + ih, x + iw - cr, y + ih);
  shape.lineTo(x + cr, y + ih);
  shape.quadraticCurveTo(x, y + ih, x, y + ih - cr);
  shape.lineTo(x, y + cr);
  shape.quadraticCurveTo(x, y, x + cr, y);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(d - 2 * r, 0.001),
    bevelEnabled: true,
    bevelSize: r,
    bevelThickness: r,
    bevelSegments: 5,
    curveSegments: 8,
  });
  geo.center();
  return geo;
}

function part(geometry, material, position, rotation) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/**
 * Builds the chair from primitives. Units are metres; the floor is y = 0.
 * @returns {{group: THREE.Group, setFrameMaterial: Function, update: Function}}
 */
export function createChair(materials) {
  const group = new THREE.Group();
  const frameParts = [];

  const frame = part(roundedBox(0.64, 0.05, 0.58, 0.012), materials.wood, [0, 0.37, 0]);
  frameParts.push(frame);

  const seat = part(roundedBox(0.6, 0.11, 0.54, 0.04), materials.fabric, [0, 0.45, 0.01]);
  const back = part(roundedBox(0.6, 0.46, 0.11, 0.045), materials.fabric, [0, 0.74, -0.245], [-0.17, 0, 0]);
  group.add(frame, seat, back);

  // Tapered legs, splayed outward
  const legGeo = new THREE.CylinderGeometry(0.021, 0.013, 0.37, 20);
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const leg = part(legGeo, materials.wood, [sx * 0.27, 0.18, sz * 0.23], [-sz * 0.1, 0, sx * 0.1]);
    frameParts.push(leg);
    group.add(leg);
  }

  const arms = new THREE.Group();
  for (const s of [1, -1]) {
    const top = part(roundedBox(0.07, 0.04, 0.5, 0.014), materials.wood, [s * 0.335, 0.64, -0.01]);
    const post = part(roundedBox(0.04, 0.24, 0.04, 0.012), materials.wood, [s * 0.335, 0.5, 0.19]);
    frameParts.push(top, post);
    arms.add(top, post);
  }
  group.add(arms);

  let armScale = 1;

  return {
    group,
    /** Legs, frame and armrests share one material (wood or metal). */
    setFrameMaterial(material) {
      for (const mesh of frameParts) mesh.material = material;
    },
    /** Animates armrests in and out. */
    update(k, showArms) {
      armScale += ((showArms ? 1 : 0) - armScale) * k;
      arms.visible = armScale > 0.01;
      arms.scale.set(1, Math.max(armScale, 0.001), 1);
      arms.position.y = (1 - armScale) * 0.25;
    },
  };
}
