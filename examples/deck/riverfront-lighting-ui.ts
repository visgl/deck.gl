// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  createRiverfrontLightingScene,
  type RiverfrontLightingKind
} from './riverfront-lighting-scene';
import {FIREFLY_SPECIES} from './fireflies/firefly-species';

declare global {
  interface Window {
    riverfrontLighting: ReturnType<typeof createRiverfrontLightingScene>;
  }
}
export function startRiverfrontLightingExample(kind: RiverfrontLightingKind): void {
  const backend = document.querySelector<HTMLSelectElement>('#backend')!;
  backend.value =
    new URLSearchParams(location.search).get('backend') === 'webgl' ? 'webgl' : 'webgpu';
  backend.addEventListener('change', () => {
    location.search = `?backend=${backend.value}`;
  });
  const scene = createRiverfrontLightingScene(
    document.querySelector<HTMLDivElement>('#scene')!,
    kind,
    {deviceType: backend.value === 'webgl' ? 'webgl' : 'webgpu'}
  );
  window.riverfrontLighting = scene;
  const status = document.querySelector<HTMLOutputElement>('#status')!;
  document
    .querySelector<HTMLButtonElement>('#center')!
    .addEventListener('click', () => scene.center());
  for (const name of [
    'animate',
    'enabled',
    'lamps',
    'bloom',
    'autoExposure',
    'reflections'
  ] as const) {
    document.querySelector<HTMLInputElement>(`#${name}`)?.addEventListener('change', event => {
      const target = event.currentTarget;
      if (target instanceof HTMLInputElement) scene.setSetting(name, target.checked);
    });
  }
  for (const name of [
    'intensity',
    'exposure',
    'radius',
    'speed',
    'radiance',
    'density',
    'bloomStrength',
    'ripples'
  ] as const) {
    const input = document.querySelector<HTMLInputElement>(`#${name}`);
    if (!input) continue;
    input.value = String(scene.settings[name]);
    input.addEventListener('input', () => scene.setSetting(name, Number(input.value)));
  }
  const speciesSelector = document.querySelector<HTMLSelectElement>('#species');
  if (speciesSelector) {
    for (const species of FIREFLY_SPECIES)
      speciesSelector.add(new Option(species.label, species.id));
    speciesSelector.value = scene.settings.species;
    speciesSelector.addEventListener('change', () =>
      scene.setSetting('species', speciesSelector.value)
    );
  }
  document.querySelector<HTMLSelectElement>('#buffer-view')!.addEventListener('change', event => {
    if (event.currentTarget instanceof HTMLSelectElement)
      scene.setSetting('debugMode', Number(event.currentTarget.value));
  });
  scene.ready
    .then(() => {
      if (scene.diagnostics.backend === 'webgl') {
        for (const selector of ['#bloom', '#bloomStrength', '#exposure', '#buffer-view']) {
          const control = document.querySelector<HTMLInputElement | HTMLSelectElement>(selector);
          if (control) control.disabled = true;
        }
      }
      status.value =
        scene.diagnostics.backend === 'webgl'
          ? 'WebGL2 · additive lights and water mirrors'
          : `${scene.diagnostics.highDynamicRange ? 'HDR display output' : 'SDR display output'} · shared depth, normals and motion`;
      document.body.dataset['ready'] = 'true';
    })
    .catch(error => {
      status.value = error instanceof Error ? error.message : String(error);
      document.body.dataset['ready'] = 'error';
    });
  window.addEventListener('pagehide', () => scene.finalize());
}
