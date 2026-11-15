// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createFlowScene} from './app';
import {resolveDeckExampleDeviceType} from '../deck-example-device';

declare global {
  interface Window {
    flowScene: ReturnType<typeof createFlowScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
const deviceType = await resolveDeckExampleDeviceType(
  new URLSearchParams(location.search).get('backend')
);
backend.value = deviceType;
const scene = createFlowScene(parent, {deviceType});
window.flowScene = scene;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const playing = document.querySelector<HTMLInputElement>('#playing')!;
playing.addEventListener('change', () => scene.setPlaying(playing.checked));
const field = document.querySelector<HTMLSelectElement>('#field')!;
field.addEventListener('change', () =>
  scene.setPattern(
    field.value === 'changing'
      ? 'changing'
      : field.value === 'eddies'
        ? 'eddies'
        : field.value === 'missing'
          ? 'missing'
          : 'river'
  )
);
const northernSection = document.querySelector<HTMLInputElement>('#northern-section')!;
northernSection.addEventListener('change', () => scene.setNorthernSection(northernSection.checked));
const count = document.querySelector<HTMLSelectElement>('#count')!;
count.addEventListener('change', () => scene.setCount(Number(count.value)));
for (const [identifier, setter] of [
  ['speed', scene.setSpeed],
  ['trail', scene.setTrail],
  ['width', scene.setWidth]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
  input.addEventListener('input', () => setter(Number(input.value)));
}
document.querySelector('#reset')!.addEventListener('click', () => scene.reset());
parent.addEventListener('flow-selection', () => {
  document.querySelector('#selection')!.textContent =
    scene.diagnostics.selected >= 0
      ? `Particle ${scene.diagnostics.selected}`
      : 'Click a particle to inspect';
});
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
  });
window.addEventListener('pagehide', () => scene.finalize());
