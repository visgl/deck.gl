// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createRiverfrontAmbientOcclusionScene} from './app';

declare global {
  interface Window {
    riverfrontAmbientOcclusionScene: ReturnType<typeof createRiverfrontAmbientOcclusionScene>;
  }
}

const parent = document.querySelector<HTMLDivElement>('#scene')!;
const status = document.querySelector<HTMLOutputElement>('#status')!;
const scene = createRiverfrontAmbientOcclusionScene(parent);
window.riverfrontAmbientOcclusionScene = scene;

for (const effectName of ['ambientOcclusion', 'reflections', 'outlines'] as const) {
  const checkbox = document.querySelector<HTMLInputElement>(`#${effectName}`)!;
  checkbox.addEventListener('change', () => scene.setEffect(effectName, checkbox.checked));
}

scene.ready
  .then(() => {
    status.value = 'Toggle ambient occlusion to compare building faces.';
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    status.value = error instanceof Error ? error.message : String(error);
    document.body.dataset['ready'] = 'error';
  });

window.addEventListener('pagehide', () => scene.finalize());
