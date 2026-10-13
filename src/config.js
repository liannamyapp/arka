/**
 * Product data for the Arka chair: options, lighting presets, camera views and dimensions.
 * Everything the UI, 3D scene and drawing exporters need comes from here.
 */

export const FABRICS = [
  { name: 'Букле «Овёс»', code: 'BK-112', hex: '#d8ccb6' },
  { name: 'Велюр «Мох»', code: 'VL-305', hex: '#5e6b4c' },
  { name: 'Велюр «Кирпич»', code: 'VL-318', hex: '#9c4f3b' },
  { name: 'Рогожка «Графит»', code: 'RG-090', hex: '#3b3e44' },
  { name: 'Букле «Лёд»', code: 'BK-140', hex: '#c6d1d4' },
  { name: 'Велюр «Индиго»', code: 'VL-342', hex: '#2d3961' },
];

export const LEGS = [
  { name: 'Дуб', code: 'OAK', hex: '#c7a274', type: 'wood' },
  { name: 'Орех', code: 'WAL', hex: '#6a4830', type: 'wood' },
  { name: 'Чёрный металл', code: 'BLK', hex: '#232326', type: 'metal' },
  { name: 'Латунь', code: 'BRS', hex: '#c09a52', type: 'metal' },
];

/** Physically based light intensities (three.js r155+ lighting model). */
export const LIGHTS = {
  studio: { key: 0xffffff, keyIntensity: 6.0, hemi: 1.7, sky: 0xffffff, ground: 0x9aa39c, exposure: 1.0, position: [-2.2, 3.4, 2.4] },
  warm: { key: 0xffb27a, keyIntensity: 6.5, hemi: 1.1, sky: 0xffd9b8, ground: 0x6b5446, exposure: 0.95, position: [2.6, 1.8, 1.6] },
  day: { key: 0xe8f0ff, keyIntensity: 5.5, hemi: 2.3, sky: 0xdfeaff, ground: 0xb8c2b6, exposure: 1.05, position: [-1.2, 4.2, 1.0] },
};

export const VIEWS = {
  front: [0, 0.85, 2.5],
  three: [1.75, 1.05, 1.85],
  side: [2.5, 0.85, 0.05],
};

export const CAMERA_TARGET = [0, 0.45, 0];

/** Overall dimensions in millimetres. */
export function dimensions(arms) {
  return { width: arms ? 740 : 640, depth: 680, height: 840, seatHeight: 450 };
}

export function skuBase(state) {
  return 'ARK-04' + (state.arms ? 'A' : '');
}

export function fullSku(state) {
  return `${skuBase(state)} · ${FABRICS[state.fabric].code} · ${LEGS[state.leg].code}`;
}
