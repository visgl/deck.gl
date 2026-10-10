// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createRiverfrontSoftShadowScene} from './app';
import {formatSunHour} from './sun';
import {resolveDeckExampleDeviceType} from '../deck-example-device';

declare global {
  interface Window {
    riverfrontSoftShadowScene: ReturnType<typeof createRiverfrontSoftShadowScene>;
  }
}

const parent = document.querySelector<HTMLDivElement>('#scene')!;
const status = document.querySelector<HTMLOutputElement>('#status')!;
const hourInput = document.querySelector<HTMLInputElement>('#hour')!;
const timeOutput = document.querySelector<HTMLOutputElement>('#time')!;
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
const deviceType = await resolveDeckExampleDeviceType(
  new URLSearchParams(location.search).get('backend')
);
backend.value = deviceType;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const scene = createRiverfrontSoftShadowScene(parent, {deviceType});
window.riverfrontSoftShadowScene = scene;

parent.addEventListener('sun-frame', () => {
  const hour = scene.settings.hour;
  const daylight = Math.max(0, Math.min(1, scene.sun.direction[2] * 3));
  const topColor = [4, 10, 22].map(
    (value, index) => value + daylight * ([36, 72, 99][index] - value)
  );
  const bottomColor = [25, 44, 68].map(
    (value, index) => value + daylight * ([116, 150, 165][index] - value)
  );
  parent.style.background = `linear-gradient(rgb(${topColor.join(',')}), rgb(${bottomColor.join(',')}))`;
  timeOutput.value = formatSunHour(hour);
  if (document.activeElement !== hourInput) hourInput.value = String(hour);
  status.value = `Sun altitude ${((scene.sun.altitude * 180) / Math.PI).toFixed(0)}° · New York, June 21`;
});
hourInput.addEventListener('input', () => {
  scene.setAnimated(false);
  document.querySelector<HTMLInputElement>('#animated')!.checked = false;
  scene.setHour(Number(hourInput.value));
});
for (const [id, setter] of [
  ['animated', scene.setAnimated],
  ['shadows', scene.setShadows],
  ['clouds', scene.setClouds],
  ['cloud-shadows', scene.setCloudShadows],
  ['cloud-animated', scene.setCloudAnimated],
  ['atmosphere', scene.setAtmosphere]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${id}`)!;
  input.addEventListener('change', () => setter(input.checked));
}
for (const [id, setter] of [
  ['softness', scene.setSoftness],
  ['speed', scene.setSpeed],
  ['cloud-cover', scene.setCloudCover],
  ['wind-speed', scene.setWindSpeed],
  ['wind-direction', scene.setWindDirection],
  ['haze', scene.setHaze]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${id}`)!;
  input.addEventListener('input', () => setter(Number(input.value)));
}
document
  .querySelector<HTMLButtonElement>('#center')!
  .addEventListener('click', () => scene.centerView());
for (const body of ['sun', 'moon'] as const) {
  const input = document.querySelector<HTMLInputElement>(`#show-${body}`)!;
  input.addEventListener('change', () => scene.setSkyBody(body, input.checked));
  document.querySelector<HTMLButtonElement>(`#look-${body}`)!.addEventListener('click', () => {
    scene.lookAtSkyBody(body);
    document.querySelector<HTMLInputElement>('#animated')!.checked = false;
  });
}
const qualityInput = document.querySelector<HTMLSelectElement>('#quality')!;
qualityInput.addEventListener('change', () => {
  const value = qualityInput.value;
  if (value === 'low' || value === 'balanced' || value === 'cinematic') scene.setQuality(value);
});
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    status.value = error instanceof Error ? error.message : String(error);
    document.body.dataset['ready'] = 'error';
  });
window.addEventListener('pagehide', () => scene.finalize());
