// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import {createStrokeScene} from './app';
declare global {
  interface Window {
    strokeScene: ReturnType<typeof createStrokeScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
backend.value =
  new URLSearchParams(location.search).get('backend') === 'webgl' ? 'webgl' : 'webgpu';
const scene = createStrokeScene(parent, {
  deviceType: backend.value === 'webgl' ? 'webgl' : 'webgpu'
});
window.strokeScene = scene;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const appearance = document.querySelector<HTMLSelectElement>('#appearance')!;
const grain = document.querySelector<HTMLInputElement>('#grain')!;
const glowIntensity = document.querySelector<HTMLInputElement>('#glowIntensity')!;
appearance.addEventListener('change', () => {
  const style = appearance.value;
  scene.setAppearance(style === 'sketch' || style === 'glow' ? style : 'plain');
  grain.disabled = style !== 'sketch';
  glowIntensity.disabled = style !== 'glow';
});
grain.addEventListener('input', () => scene.setGrain(Number(grain.value)));
glowIntensity.addEventListener('input', () => scene.setGlowIntensity(Number(glowIntensity.value)));
const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
enabled.addEventListener('change', () => scene.setEnabled(enabled.checked));
const cap = document.querySelector<HTMLSelectElement>('#cap')!;
cap.addEventListener('change', () => {
  const value = cap.value;
  if (value === 'butt' || value === 'square' || value === 'round')
    scene.setGeometryOptions({cap: value});
});
const join = document.querySelector<HTMLSelectElement>('#join')!;
join.addEventListener('change', () => {
  const value = join.value;
  if (value === 'miter' || value === 'bevel' || value === 'round')
    scene.setGeometryOptions({join: value});
});
for (const property of ['width', 'miterLimit'] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${property}`)!;
  input.addEventListener('input', () =>
    scene.setGeometryOptions({[property]: Number(input.value)})
  );
}
for (const property of ['dashLength', 'gapLength', 'offset'] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${property}`)!;
  input.addEventListener('input', () => scene.setDash({[property]: Number(input.value)}));
}
parent.addEventListener('stroke-error', () => {
  document.querySelector('#status')!.textContent = scene.diagnostics.error;
  document.body.dataset['ready'] = 'error';
});
parent.addEventListener('stroke-selection', () => {
  document.querySelector('#selection')!.textContent =
    scene.diagnostics.selected || 'Click a route to inspect';
});
scene.ready
  .then(() => {
    if (scene.diagnostics.error) throw new Error(scene.diagnostics.error);
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
    document.body.dataset['ready'] = 'error';
  });
window.addEventListener('pagehide', () => scene.finalize());
