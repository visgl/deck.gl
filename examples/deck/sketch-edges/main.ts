// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import {createSketchScene} from './app';

declare global {
  interface Window {
    sketchScene: ReturnType<typeof createSketchScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
backend.value =
  new URLSearchParams(location.search).get('backend') === 'webgl' ? 'webgl' : 'webgpu';
const scene = createSketchScene(parent, {
  deviceType: backend.value === 'webgl' ? 'webgl' : 'webgpu'
});
window.sketchScene = scene;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const style = document.querySelector<HTMLSelectElement>('#style')!;
style.addEventListener('change', () => {
  scene.setStyle({sketch: style.value === 'sketch' ? 1 : 0});
});
for (const property of ['width', 'jitter', 'grain', 'extension'] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${property}`)!;
  input.addEventListener('input', () => scene.setStyle({[property]: Number(input.value)}));
}
const edges = document.querySelector<HTMLInputElement>('#edges')!;
edges.addEventListener('change', () => scene.setEdgesVisible(edges.checked));
const fills = document.querySelector<HTMLInputElement>('#fills')!;
fills.addEventListener('change', () => scene.setFillsVisible(fills.checked));
const context = document.querySelector<HTMLInputElement>('#context')!;
context.addEventListener('change', () => scene.setContextVisible(context.checked));
const ground = document.querySelector<HTMLSelectElement>('#ground')!;
ground.addEventListener('change', () => scene.setGroundTone(ground.value as 'light' | 'dark'));
const edgeMode = document.querySelector<HTMLSelectElement>('#edge-mode')!;
edgeMode.addEventListener('change', () => {
  scene.setEdgeOptions({includeCoplanarEdges: edgeMode.value === 'triangles'});
  updateSummary();
});
const angle = document.querySelector<HTMLInputElement>('#angle')!;
angle.addEventListener('input', () => {
  scene.setEdgeOptions({angleThreshold: Number(angle.value)});
  updateSummary();
});
function updateSummary() {
  document.querySelector('#edge-count')!.textContent =
    `${scene.features.length} buildings · ${scene.diagnostics.edgeCount} edges`;
}
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
    updateSummary();
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
  });
window.addEventListener('pagehide', () => scene.finalize());
