import * as THREE from 'three';
import { LIGHTS } from './config.js';

/** Hemisphere + shadow-casting key light + fill light, switchable by preset. */
export function createLighting(scene, renderer) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x9aa39c, 1.7);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -1.2, right: 1.2, top: 1.2, bottom: -1.2, near: 0.5, far: 10 });
  key.shadow.radius = 4;
  key.shadow.bias = -0.0008;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 1.2);
  fill.position.set(2, 1.5, -2);
  scene.add(fill);

  return {
    apply(name) {
      const p = LIGHTS[name];
      key.color.set(p.key);
      key.intensity = p.keyIntensity;
      key.position.set(...p.position);
      hemi.intensity = p.hemi;
      hemi.color.set(p.sky);
      hemi.groundColor.set(p.ground);
      renderer.toneMappingExposure = p.exposure;
    },
  };
}
