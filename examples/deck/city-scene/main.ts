// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createCityScene, type CityScene} from './app';

declare global {
  interface Window {
    cityScene: CityScene;
  }
}

const parent = document.querySelector<HTMLDivElement>('#city');
const status = document.querySelector<HTMLOutputElement>('#status');
const selection = document.querySelector<HTMLOutputElement>('#selection');
const backend = document.querySelector<HTMLSelectElement>('#backend');
const camera = document.querySelector<HTMLSelectElement>('#camera');
const buildings = document.querySelector<HTMLInputElement>('#buildings');
const edgeStyle = document.querySelector<HTMLSelectElement>('#edge-style');
const edgeWidth = document.querySelector<HTMLInputElement>('#edge-width');
const water = document.querySelector<HTMLInputElement>('#water');
const reflectionQuality = document.querySelector<HTMLSelectElement>('#reflection-quality');
const reflections = document.querySelector<HTMLInputElement>('#reflections');
const reflectionView = document.querySelector<HTMLSelectElement>('#reflection-view');
const waterStyle = document.querySelector<HTMLSelectElement>('#water-style');
const waterPreset = document.querySelector<HTMLSelectElement>('#water-preset');
const waterColor = document.querySelector<HTMLInputElement>('#water-color');
const strength = document.querySelector<HTMLInputElement>('#strength');
const playback = document.querySelector<HTMLButtonElement>('#playback');
if (
  !parent ||
  !status ||
  !selection ||
  !backend ||
  !camera ||
  !buildings ||
  !edgeStyle ||
  !edgeWidth ||
  !water ||
  !reflections ||
  !reflectionQuality ||
  !reflectionView ||
  !waterStyle ||
  !waterPreset ||
  !waterColor ||
  !strength ||
  !playback
) {
  throw new Error('Missing city scene controls');
}
const cityParent = parent;
const cityStatus = status;
const cameraControl = camera;
const buildingsControl = buildings;
const backendControl = backend;
const edgeStyleControl = edgeStyle;
const edgeWidthControl = edgeWidth;
const waterControl = water;
const reflectionsControl = reflections;
const reflectionQualityControl = reflectionQuality;
const reflectionViewControl = reflectionView;
const waterStyleControl = waterStyle;
const waterPresetControl = waterPreset;
const waterColorControl = waterColor;
const strengthControl = strength;
const playbackControl = playback;
let scene: CityScene;

const WATER_COLOR_PRESETS = {
  teal: '#0b4252',
  slate: '#67747a',
  'deep-blue': '#205875'
} as const;

function parseColor(color: string): [number, number, number] {
  return [
    Number.parseInt(color.slice(1, 3), 16) / 255,
    Number.parseInt(color.slice(3, 5), 16) / 255,
    Number.parseInt(color.slice(5, 7), 16) / 255
  ];
}

async function startScene() {
  scene?.finalize();
  document.body.dataset['ready'] = 'false';
  cityStatus.value = 'Preparing the district…';
  const deviceType = backendControl.value === 'webgl' ? 'webgl' : 'webgpu';
  scene = createCityScene(cityParent, {deviceType});
  const startingScene = scene;
  window.cityScene = scene;
  try {
    await startingScene.ready;
    if (scene !== startingScene) return;
    cameraControl.value = 'district';
    buildingsControl.checked = true;
    edgeStyleControl.value = 'none';
    edgeWidthControl.value = '2.2';
    edgeWidthControl.disabled = true;
    waterControl.checked = true;
    reflectionsControl.disabled = scene.diagnostics.backend !== 'webgpu';
    reflectionsControl.checked = !reflectionsControl.disabled;
    reflectionsControl.title = reflectionsControl.disabled
      ? 'Scene reflections require WebGPU'
      : '';
    reflectionQualityControl.disabled = reflectionsControl.disabled;
    reflectionQualityControl.value = 'balanced';
    reflectionViewControl.value = '0';
    reflectionViewControl.disabled = reflectionsControl.disabled;
    waterStyleControl.value = 'river';
    waterPresetControl.value = 'teal';
    waterColorControl.value = '#0b4252';
    strengthControl.value = '0.55';
    playbackControl.textContent = 'Pause waves';
    cityStatus.value = `${scene.features.filter(feature => feature.kind === 'building').length} buildings · local fixture`;
    document.body.dataset['ready'] = 'true';
  } catch (error) {
    if (scene !== startingScene) return;
    cityStatus.value = error instanceof Error ? error.message : String(error);
    document.body.dataset['ready'] = 'error';
  }
}
backend.addEventListener('change', () => {
  void startScene();
});
camera.addEventListener('change', () => {
  const value = cameraControl.value;
  scene.setCamera(value === 'overhead' || value === 'waterfront' ? value : 'district');
});
buildings.addEventListener('change', () => scene.setBuildingsVisible(buildingsControl.checked));
edgeStyle.addEventListener('change', () => {
  const style = edgeStyleControl.value;
  scene.setEdgeStyle(style === 'solid' || style === 'pencil' ? style : 'none');
  edgeWidthControl.disabled = style === 'none';
});
edgeWidth.addEventListener('input', () => scene.setEdgeWidth(Number(edgeWidthControl.value)));
water.addEventListener('change', () => scene.setWaterEnabled(waterControl.checked));
reflections.addEventListener('change', () => {
  scene.setReflectionsEnabled(reflectionsControl.checked);
  reflectionQualityControl.disabled = !reflectionsControl.checked;
  reflectionViewControl.disabled = !reflectionsControl.checked;
});
reflectionView.addEventListener('change', () =>
  scene.setReflectionDebugMode(Number(reflectionViewControl.value))
);
reflectionQuality.addEventListener('change', () => {
  const quality = reflectionQualityControl.value;
  scene.setReflectionQuality(quality === 'fast' || quality === 'detailed' ? quality : 'balanced');
});
waterStyle.addEventListener('change', () =>
  scene.setWaterStyle(waterStyleControl.value === 'classic' ? 'classic' : 'river')
);
waterPreset.addEventListener('change', () => {
  const preset = waterPresetControl.value as keyof typeof WATER_COLOR_PRESETS;
  if (!(preset in WATER_COLOR_PRESETS)) return;
  waterColorControl.value = WATER_COLOR_PRESETS[preset];
  scene.setWaterColor(parseColor(waterColorControl.value));
});
waterColor.addEventListener('input', () => {
  waterPresetControl.value = 'custom';
  scene.setWaterColor(parseColor(waterColorControl.value));
});
strength.addEventListener('input', () => scene.setWaveStrength(Number(strengthControl.value)));
playback.addEventListener('click', () => {
  scene.setPlaying(!scene.diagnostics.playing);
  playbackControl.textContent = scene.diagnostics.playing ? 'Pause waves' : 'Play waves';
});
parent.addEventListener('city-selection', () => {
  selection.value = scene.diagnostics.selected || 'Click a building or the river';
});
parent.addEventListener('city-error', () => {
  cityStatus.value = scene.diagnostics.error;
  document.body.dataset['ready'] = 'error';
});
window.addEventListener('pagehide', () => scene.finalize());
const requestedBackend = new URLSearchParams(location.search).get('backend');
if (requestedBackend === 'webgl' || requestedBackend === 'webgpu') backend.value = requestedBackend;
void startScene();
