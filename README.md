# Arka — 3D Chair Configurator

An interactive product configurator built with **JavaScript** and **Three.js**. Pick upholstery and frame materials, switch lighting, move the camera, and export a dimensioned technical drawing of the current configuration as **SVG** or **DXF**.

**Live demo:** https://YOUR-USERNAME.github.io/arka-configurator/

![Demo](demo.gif)

## Features

**3D scene**
- Chair assembled from primitives: extruded rounded boxes with bevels, tapered splayed legs
- PBR materials (`MeshStandardMaterial`): fabric, wood, metal
- Procedural fabric and wood textures drawn on `<canvas>`; the fabric texture doubles as a bump map
- Reflections from a PMREM environment map built from emissive panels (no HDR file)
- Soft shadows (`PCFSoftShadowMap`), shadow-only floor and a contact shadow
- ACES Filmic tone mapping

**Lighting**
- Three presets: studio, evening, daylight (hemisphere + key + fill lights)

**Camera**
- `OrbitControls` with damping, limits and optional auto-rotate
- Preset views (front / 3/4 / side) animated along a sphere around the model

**Configuration**
- 6 upholstery options, 4 frame materials, removable armrests
- Smooth color transitions, live SKU and dimensions

**Technical drawing (SVG / DXF)**
- Front and top views with dimensions, generated from the same parameters as the 3D model
- One set of format-independent primitives rendered by two exporters
- SVG sized in real millimetres at 1:10
- DXF in AutoCAD R12 format (AC1009) with layers `OUTLINE`, `HIDDEN`, `DIM`, `TEXT` — opens in AutoCAD, LibreCAD, QCAD and CAM software

## Project structure

```
index.html              markup and import map
css/style.css           layout, light and dark themes
src/
  main.js               app state, wiring, render loop
  config.js             product options, lights, views, dimensions
  scene.js              renderer, camera, OrbitControls, environment, floor
  materials.js          PBR materials and color transitions
  textures.js           procedural canvas textures
  chair.js              chair geometry
  lighting.js           lighting presets
  camera-views.js       animated camera presets
  ui.js                 option panel and drawing dialog
  export/
    drawing.js          2D drawing model with dimensions
    svg.js              SVG exporter
    dxf.js              DXF (R12) exporter
    download.js         file download helper
```

## Run locally

ES modules need to be served over HTTP:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Three.js is loaded from a CDN through an import map, so there is no build step.

## Deploy to GitHub Pages

1. Push the project to a repository.
2. **Settings → Pages → Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Open `https://<username>.github.io/<repo-name>/`.

## Tech

JavaScript (ES modules) · Three.js r160 · WebGL · SVG · DXF · HTML · CSS

## License

MIT
