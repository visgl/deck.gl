// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createRiverfrontDepthOfFieldScene} from './app';

declare global {
  interface Window {
    riverfrontDepthOfFieldScene: ReturnType<typeof createRiverfrontDepthOfFieldScene>;
  }
}
const parent = document.querySelector<HTMLDivElement>('#scene')!;
const status = document.querySelector<HTMLOutputElement>('#status')!;
const automatic = document.querySelector<HTMLInputElement>('#automatic')!;
const enabled = document.querySelector<HTMLInputElement>('#enabled')!;
const blur = document.querySelector<HTMLInputElement>('#blur')!;
const scene = createRiverfrontDepthOfFieldScene(parent);
window.riverfrontDepthOfFieldScene = scene;
automatic.addEventListener('change', () => scene.setAutomatic(automatic.checked));
enabled.addEventListener('change', () => {
  scene.settings.enabled = enabled.checked;
});
blur.addEventListener('input', () => {
  scene.settings.blur = Number(blur.value);
});
const statusTimer = window.setInterval(() => {
  automatic.checked = scene.focus.automatic;
  if (scene.diagnostics.focusedBuilding) {
    status.value = `${scene.focus.automatic ? 'Tour' : 'Focus'}: ${scene.diagnostics.focusedBuilding} · ${Math.round(scene.diagnostics.focusDistance)} m`;
  }
}, 100);
scene.ready
  .then(() => {
    document.body.dataset['ready'] = 'true';
  })
  .catch(error => {
    status.value = error instanceof Error ? error.message : String(error);
    document.body.dataset['ready'] = 'error';
  });
window.addEventListener('pagehide', () => {
  window.clearInterval(statusTimer);
  scene.finalize();
});
