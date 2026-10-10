// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createPatternScene} from './app';
import type {PatternFillProps} from '@luma.gl/shadertools';

declare global {
  interface Window {
    patternScene: ReturnType<typeof createPatternScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
backend.value =
  new URLSearchParams(location.search).get('backend') === 'webgl' ? 'webgl' : 'webgpu';
const scene = createPatternScene(parent, {
  deviceType: backend.value === 'webgl' ? 'webgl' : 'webgpu'
});
window.patternScene = scene;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
enabled.addEventListener('change', () => scene.setEnabled(enabled.checked));
const pattern = document.querySelector<HTMLSelectElement>('#pattern')!;
pattern.addEventListener('change', () => {
  const kind = pattern.value;
  if (kind === 'hatch' || kind === 'crosshatch' || kind === 'dots')
    scene.setPattern({pattern: kind});
});
for (const property of ['spacing', 'width', 'angle'] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${property}`)!;
  input.addEventListener('input', () => {
    const value = Number(input.value) * (property === 'angle' ? Math.PI / 180 : 1);
    const next: PatternFillProps = {[property]: value};
    scene.setPattern(next);
  });
}
parent.addEventListener('pattern-selection', () => {
  document.querySelector('#selection')!.textContent =
    scene.diagnostics.selected || 'Click a building to inspect';
});
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
  });
window.addEventListener('pagehide', () => scene.finalize());
