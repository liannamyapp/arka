import { FABRICS, LEGS, dimensions, skuBase, fullSku } from './config.js';

const $ = (sel) => document.querySelector(sel);

/** Marks one button in a group as pressed. */
function press(group, button) {
  group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
}

function buildSwatches(container, options, onPick) {
  options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sw' + (option.type ? ` ${option.type}` : '');
    button.style.setProperty('--c', option.hex);
    button.title = option.name;
    button.setAttribute('aria-label', option.name);
    button.setAttribute('aria-pressed', String(index === 0));
    button.addEventListener('click', () => {
      press(container, button);
      onPick(index);
    });
    container.appendChild(button);
  });
}

/**
 * Wires the option panel to callbacks.
 * @param {object} handlers onFabric, onLeg, onLight, onArms, onSpin, onView,
 *                          onShowDrawing, onDownloadSVG, onDownloadDXF
 */
export function initUI(handlers, { autoRotate }) {
  buildSwatches($('#fabrics'), FABRICS, handlers.onFabric);
  buildSwatches($('#legs'), LEGS, handlers.onLeg);

  const lights = $('#lights');
  lights.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => { press(lights, b); handlers.onLight(b.dataset.light); }));

  const views = $('#views');
  views.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => { press(views, b); handlers.onView(b.dataset.view); }));

  const arms = $('#arms');
  arms.addEventListener('change', () => handlers.onArms(arms.checked));

  const spin = $('#spin');
  spin.checked = autoRotate;
  spin.addEventListener('change', () => handlers.onSpin(spin.checked));

  const dialog = $('#drawingDialog');
  $('#showDrawing').addEventListener('click', () => {
    $('#drawingPreview').innerHTML = handlers.onShowDrawing();
    dialog.showModal();
  });
  $('#closeDrawing').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  document.querySelectorAll('[data-export="svg"]').forEach((b) => b.addEventListener('click', handlers.onDownloadSVG));
  document.querySelectorAll('[data-export="dxf"]').forEach((b) => b.addEventListener('click', handlers.onDownloadDXF));

  return {
    /** Refreshes names, SKU and dimensions after any change. */
    render(state) {
      const d = dimensions(state.arms);
      $('#fabricName').textContent = FABRICS[state.fabric].name;
      $('#legName').textContent = LEGS[state.leg].name;
      $('#sku').textContent = fullSku(state);
      $('#dSku').textContent = skuBase(state);
      $('#dW').textContent = `${d.width / 10} см`;
      $('#dD').textContent = `${d.depth / 10} см`;
      $('#dH').textContent = `${d.height / 10} см`;
      $('#dS').textContent = `${d.seatHeight / 10} см`;
      $('#drawingTitle').textContent = `Чертёж ${skuBase(state)}`;
    },
  };
}
