import * as THREE from 'three';

/** Woven fabric pattern drawn on a canvas. Light grey so material.color tints it. */
export function fabricTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  g.fillStyle = '#f2f2f2';
  g.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const v = 215 + Math.random() * 40;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x + ((y / 4) % 2 ? 2 : 0), y, 2, 3);
    }
  }
  for (let i = 0; i < 1800; i++) {
    const v = 180 + Math.random() * 60;
    g.fillStyle = `rgba(${v},${v},${v},.5)`;
    g.beginPath();
    g.arc(Math.random() * size, Math.random() * size, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
    g.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Wood grain: wavy vertical lines on a light base. */
export function woodTexture() {
  const w = 128, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');
  g.fillStyle = '#f4f4f4';
  g.fillRect(0, 0, w, h);

  for (let i = 0; i < 46; i++) {
    const x = Math.random() * w;
    const a = 150 + Math.random() * 80;
    g.strokeStyle = `rgba(${a - 40},${a - 60},${a - 80},.18)`;
    g.lineWidth = Math.random() * 2.5 + 0.5;
    g.beginPath();
    for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y / 60 + i) * 4, y);
    g.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft radial gradient used as a contact shadow under the chair. */
export function contactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const g = canvas.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, 'rgba(0,0,0,.55)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
