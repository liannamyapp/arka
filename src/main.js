import { FABRICS, LEGS, skuBase } from './config.js';
import { createStage } from './scene.js';
import { createMaterials } from './materials.js';
import { createChair } from './chair.js';
import { createLighting } from './lighting.js';
import { createViewAnimator } from './camera-views.js';
import { initUI } from './ui.js';
import { buildDrawing } from './export/drawing.js';
import { toSVG } from './export/svg.js';
import { toDXF } from './export/dxf.js';
import { downloadText } from './export/download.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = { fabric: 0, leg: 0, light: 'studio', arms: true };

// ---------- 3D ----------
const stageEl = document.getElementById('stage');
const stage = createStage(stageEl, { autoRotate: !reduceMotion });

const materials = createMaterials({
  fabric: FABRICS[0].hex,
  wood: LEGS[0].hex,
  metal: LEGS.find((l) => l.type === 'metal').hex,
});
const chair = createChair(materials);
stage.scene.add(chair.group);

const lighting = createLighting(stage.scene, stage.renderer);
const views = createViewAnimator(stage.camera, stage.controls, reduceMotion);

function applyLeg() {
  const leg = LEGS[state.leg];
  const material = leg.type === 'wood' ? materials.wood : materials.metal;
  chair.setFrameMaterial(material);
  materials.setColor(material, leg.hex);
}

function applyLight(name) {
  state.light = name;
  lighting.apply(name);
  stageEl.dataset.light = name;
}

// ---------- Drawing export ----------
const fileName = (ext) => `${skuBase(state)}_${FABRICS[state.fabric].code}_${LEGS[state.leg].code}.${ext}`;

// ---------- UI ----------
const ui = initUI({
  onFabric(i) { state.fabric = i; materials.setColor(materials.fabric, FABRICS[i].hex); ui.render(state); },
  onLeg(i) { state.leg = i; applyLeg(); ui.render(state); },
  onLight: applyLight,
  onArms(on) { state.arms = on; ui.render(state); },
  onSpin(on) { stage.controls.autoRotate = on; },
  onView: views.go,
  onShowDrawing: () => toSVG(buildDrawing(state)),
  onDownloadSVG: () => downloadText(fileName('svg'), toSVG(buildDrawing(state)), 'image/svg+xml'),
  onDownloadDXF: () => downloadText(fileName('dxf'), toDXF(buildDrawing(state)), 'application/dxf'),
}, { autoRotate: !reduceMotion });

applyLeg();
applyLight('studio');
ui.render(state);

// ---------- Render loop ----------
let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 8);

  materials.update(k);
  chair.update(k, state.arms);
  views.update(dt);
  stage.controls.update();
  stage.renderer.render(stage.scene, stage.camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
