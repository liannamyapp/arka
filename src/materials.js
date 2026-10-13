import * as THREE from 'three';
import { fabricTexture, woodTexture } from './textures.js';

/**
 * PBR materials for the chair, plus smooth color transitions between options.
 * @param {{fabric:string, wood:string, metal:string}} colors initial hex colors
 */
export function createMaterials(colors) {
  const fabricTex = fabricTexture();

  const fabric = new THREE.MeshStandardMaterial({
    color: colors.fabric,
    map: fabricTex,
    bumpMap: fabricTex,
    bumpScale: 0.3,
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.5,
  });

  const wood = new THREE.MeshStandardMaterial({
    color: colors.wood,
    map: woodTexture(),
    roughness: 0.55,
    metalness: 0,
    envMapIntensity: 0.8,
  });

  const metal = new THREE.MeshStandardMaterial({
    color: colors.metal,
    roughness: 0.32,
    metalness: 1,
    envMapIntensity: 1.1,
  });

  const targets = new Map([
    [fabric, fabric.color.clone()],
    [wood, wood.color.clone()],
    [metal, metal.color.clone()],
  ]);

  return {
    fabric,
    wood,
    metal,
    /** Start fading a material toward a new color. */
    setColor(material, hex) {
      targets.set(material, new THREE.Color(hex));
    },
    /** @param {number} k interpolation factor for this frame, 0..1 */
    update(k) {
      for (const [material, color] of targets) material.color.lerp(color, k);
    },
  };
}
