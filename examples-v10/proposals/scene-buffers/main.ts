// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import {createBufferScene} from './app';
declare global {
  interface Window {
    bufferScene: ReturnType<typeof createBufferScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const scene = createBufferScene(parent);
window.bufferScene = scene;
const mode = document.querySelector<HTMLSelectElement>('#mode')!;
mode.addEventListener('change', () => {
  const value = mode.value;
  if (
    value === 'scene' ||
    value === 'normals' ||
    value === 'depth' ||
    value === 'selection' ||
    value === 'previous'
  )
    scene.setMode(value);
});
for (const [id, update] of [
  ['bloom', scene.setBloom],
  ['edges', scene.setEdges],
  ['selection', scene.setSelection],
  ['glass', scene.setGlass]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${id}`)!;
  input.addEventListener('change', () => update(input.checked));
}
const strength = document.querySelector<HTMLInputElement>('#strength')!;
strength.addEventListener('input', () => scene.setStrength(Number(strength.value)));
document.querySelector('#reset-history')!.addEventListener('click', () => scene.resetHistory());
parent.addEventListener('buffer-selection', () => {
  document.querySelector('#selected')!.textContent = scene.diagnostics.selected;
});
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
  });
window.addEventListener('pagehide', () => scene.finalize());
