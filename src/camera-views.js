import * as THREE from 'three';
import { VIEWS } from './config.js';

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Moves the camera between preset views along a sphere around the target,
 * so the camera swings around the chair instead of cutting through it.
 */
export function createViewAnimator(camera, controls, reduceMotion = false) {
  let tween = null;
  const current = new THREE.Spherical();

  controls.addEventListener('start', () => { tween = null; });

  return {
    go(name) {
      const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      const to = new THREE.Spherical().setFromVector3(new THREE.Vector3(...VIEWS[name]).sub(controls.target));
      let dTheta = to.theta - from.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      tween = { from, to, dTheta, t: reduceMotion ? 1 : 0 };
    },
    update(dt, duration = 0.9) {
      if (!tween) return;
      tween.t = Math.min(1, tween.t + dt / duration);
      const e = easeInOutCubic(tween.t);
      current.radius = THREE.MathUtils.lerp(tween.from.radius, tween.to.radius, e);
      current.phi = THREE.MathUtils.lerp(tween.from.phi, tween.to.phi, e);
      current.theta = tween.from.theta + tween.dTheta * e;
      camera.position.setFromSpherical(current).add(controls.target);
      if (tween.t >= 1) tween = null;
    },
  };
}
