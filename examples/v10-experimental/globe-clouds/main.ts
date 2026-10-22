// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createGlobeCloudScene} from './app';
import {resolveDeckExampleDeviceType} from '../deck-example-device';

declare global {
  interface Window {
    globeCloudScene: ReturnType<typeof createGlobeCloudScene>;
  }
}
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
const status = document.querySelector<HTMLOutputElement>('#status')!;
const deviceType = await resolveDeckExampleDeviceType(
  new URLSearchParams(location.search).get('backend')
);
backend.value = deviceType;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const scene = createGlobeCloudScene(document.querySelector<HTMLDivElement>('#scene')!, {
  deviceType
});
window.globeCloudScene = scene;
for (const [identifier, setter] of [
  ['clouds', scene.setClouds],
  ['sun', scene.setSun],
  ['moon', scene.setMoon],
  ['stars', scene.setStars],
  ['animate', scene.setAnimate]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
  input.addEventListener('change', () => setter(input.checked));
}
for (const [identifier, setter] of [
  ['cover', scene.setCover],
  ['scale', scene.setScale],
  ['drift', scene.setDrift],
  ['sunlight', scene.setSunlight]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
  input.addEventListener('input', () => setter(Number(input.value)));
}
document
  .querySelector<HTMLButtonElement>('#center')!
  .addEventListener('click', () => scene.centerView());
for (const body of ['sun', 'moon'] as const) {
  document
    .querySelector<HTMLButtonElement>(`#look-${body}`)!
    .addEventListener('click', () => scene.lookAtBody(body));
}
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
    status.value = `Astronomy sky and cloud cover · ${scene.diagnostics.backend === 'webgpu' ? 'WebGPU' : 'WebGL2'}`;
  })
  .catch(error => {
    document.body.dataset['ready'] = 'error';
    status.value = error instanceof Error ? error.message : String(error);
  });
window.addEventListener('pagehide', () => scene.finalize());
