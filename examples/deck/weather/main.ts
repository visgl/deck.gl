// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createWeatherScene, type WeatherPreset} from './app';
import {resolveDeckExampleDeviceType} from '../deck-example-device';
declare global {
  interface Window {
    weatherScene: ReturnType<typeof createWeatherScene>;
  }
}
const backend = document.querySelector<HTMLSelectElement>('#backend')!;
const deviceType = await resolveDeckExampleDeviceType(
  new URLSearchParams(location.search).get('backend')
);
backend.value = deviceType;
const scene = createWeatherScene(document.querySelector<HTMLDivElement>('#scene')!, {
  deviceType
});
window.weatherScene = scene;
backend.addEventListener('change', () => {
  location.search = `?backend=${backend.value}`;
});
const preset = document.querySelector<HTMLSelectElement>('#preset')!;
preset.addEventListener('change', () => {
  const value: WeatherPreset =
    preset.value === 'snow'
      ? 'snow'
      : preset.value === 'rain'
        ? 'rain'
        : preset.value === 'clouds'
          ? 'clouds'
          : 'clear';
  scene.setPreset(value);
  document.querySelector<HTMLInputElement>('#clouds')!.checked = value !== 'clear';
});
const fogEnabled = document.querySelector<HTMLInputElement>('#fog-enabled')!;
fogEnabled.addEventListener('change', () => {
  scene.setFogEnabled(fogEnabled.checked);
  for (const identifier of ['visibility', 'fog-variation', 'fog-speed']) {
    document.querySelector<HTMLInputElement>(`#${identifier}`)!.disabled = !fogEnabled.checked;
  }
});
for (const [identifier, setter] of [
  ['clouds', scene.setClouds],
  ['surface-enabled', scene.setSurfaceEnabled],
  ['accumulate', scene.setAccumulation]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
  input.addEventListener('change', () => setter(input.checked));
}
document.querySelector('#scene')!.addEventListener('weather-frame', () => {
  for (const [identifier, value] of [
    ['wetness', scene.surfaceSettings.wetness],
    ['snow-cover', scene.surfaceSettings.snow]
  ] as const) {
    const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
    if (document.activeElement !== input) input.value = String(value);
  }
});
const playing = document.querySelector<HTMLInputElement>('#playing')!;
playing.addEventListener('change', () => scene.setPlaying(playing.checked));
for (const [identifier, setter] of [
  ['hour', scene.setHour],
  ['intensity', scene.setIntensity],
  ['wind-speed', scene.setWindSpeed],
  ['wind-direction', scene.setWindDirection],
  ['visibility', scene.setVisibility],
  ['fog-variation', scene.setFogVariation],
  ['fog-speed', scene.setFogSpeed],
  ['wetness', scene.setWetness],
  ['snow-cover', scene.setSnowCover],
  ['puddles', scene.setPuddles]
] as const) {
  const input = document.querySelector<HTMLInputElement>(`#${identifier}`)!;
  input.addEventListener('input', () => setter(Number(input.value)));
}
document.querySelector('#center')!.addEventListener('click', () => scene.centerView());
for (const body of ['sun', 'moon'] as const) {
  document.querySelector(`#look-${body}`)!.addEventListener('click', () => {
    scene.lookAtBody(body);
    document.querySelector<HTMLInputElement>('#hour')!.value = String(scene.diagnostics.hour);
  });
}
document.querySelector('#reset')!.addEventListener('click', () => scene.reset());
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    document.querySelector('#status')!.textContent = error.message;
  });
window.addEventListener('pagehide', () => scene.finalize());
