import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { contactShadowTexture } from './textures.js';
import { VIEWS, CAMERA_TARGET } from './config.js';

/**
 * Environment map for reflections, rendered from a few emissive panels
 * inside a grey room. Avoids loading an HDR file.
 */
function createEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();

  env.add(new THREE.Mesh(
    new THREE.BoxGeometry(12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x6f7470, side: THREE.BackSide }),
  ));

  const panel = (w, h, position, intensity) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide }),
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  panel(5, 3, [0, 5.5, 0], 5);
  panel(3, 4, [-5.5, 1.5, 1], 3);
  panel(3, 3, [5.5, 1, -1], 1.6);
  panel(4, 2, [0, 1, 5.5], 1.2);

  const texture = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  return texture;
}

/** Renderer, scene, camera, orbit controls and floor. */
export function createStage(container, { autoRotate = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.environment = createEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);
  camera.position.set(...VIEWS.three);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...CAMERA_TARGET);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 1.4;
  controls.maxDistance = 4.2;
  controls.maxPolarAngle = 1.52;
  controls.autoRotateSpeed = 1.2;
  controls.autoRotate = autoRotate;

  // Floor that only shows shadows, plus a soft contact shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.2 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 1.0),
    new THREE.MeshBasicMaterial({ map: contactShadowTexture(), transparent: true, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.002;
  scene.add(contact);

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  return { renderer, scene, camera, controls };
}
