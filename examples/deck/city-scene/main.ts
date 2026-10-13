// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {createCityScene, type CityScene} from './app';
import {resolveDeckExampleDeviceType} from '../deck-example-device';

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
const citySelection = selection;
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
let controlsInitialized = false;
let backendResolved = false;

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

function captureSceneSettings() {
  return {
    camera: cameraControl.value,
    buildings: buildingsControl.checked,
    edgeStyle: edgeStyleControl.value,
    edgeWidth: edgeWidthControl.value,
    water: waterControl.checked,
    reflections: reflectionsControl.checked,
    reflectionQuality: reflectionQualityControl.value,
    reflectionView: reflectionViewControl.value,
    waterStyle: waterStyleControl.value,
    waterPreset: waterPresetControl.value,
    waterColor: waterColorControl.value,
    strength: strengthControl.value,
    playing: scene.diagnostics.playing
  };
}

function restoreSceneSettings(settings: ReturnType<typeof captureSceneSettings>) {
  cameraControl.value = settings.camera;
  buildingsControl.checked = settings.buildings;
  edgeStyleControl.value = settings.edgeStyle;
  edgeWidthControl.value = settings.edgeWidth;
  waterControl.checked = settings.water;
  reflectionsControl.checked = settings.reflections && !reflectionsControl.disabled;
  reflectionQualityControl.value = settings.reflectionQuality;
  reflectionViewControl.value = settings.reflectionView;
  waterStyleControl.value = settings.waterStyle;
  waterPresetControl.value = settings.waterPreset;
  waterColorControl.value = settings.waterColor;
  strengthControl.value = settings.strength;
  playbackControl.textContent = settings.playing ? 'Pause waves' : 'Play waves';
  edgeWidthControl.disabled = settings.edgeStyle === 'none';
  reflectionQualityControl.disabled = !reflectionsControl.checked;
  reflectionViewControl.disabled = !reflectionsControl.checked;
  scene.setCamera(
    settings.camera === 'overhead' || settings.camera === 'waterfront'
      ? settings.camera
      : 'district'
  );
  scene.setBuildingsVisible(settings.buildings);
  scene.setEdgeStyle(
    settings.edgeStyle === 'solid' || settings.edgeStyle === 'pencil' ? settings.edgeStyle : 'none'
  );
  scene.setEdgeWidth(Number(settings.edgeWidth));
  scene.setWaterEnabled(settings.water);
  scene.setReflectionsEnabled(reflectionsControl.checked);
  scene.setReflectionQuality(
    settings.reflectionQuality === 'fast' || settings.reflectionQuality === 'detailed'
      ? settings.reflectionQuality
      : 'balanced'
  );
  scene.setReflectionDebugMode(Number(settings.reflectionView));
  scene.setWaterStyle(settings.waterStyle === 'classic' ? 'classic' : 'river');
  scene.setWaterColor(parseColor(settings.waterColor));
  scene.setWaveStrength(Number(settings.strength));
  scene.setPlaying(settings.playing);
}

async function startScene(settings: ReturnType<typeof captureSceneSettings> | null = null) {
  if (pageHidden) return;
  scene?.finalize();
  document.body.dataset['ready'] = 'false';
  cityStatus.value = 'Preparing the district…';
  const deviceType = backendControl.value === 'webgl' ? 'webgl' : 'webgpu';
  scene = createCityScene(cityParent, {deviceType});
  const startingScene = scene;
  window.cityScene = scene;
  initializeControls();
  try {
    await startingScene.ready;
    if (pageHidden || scene !== startingScene) return;
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
    if (settings) restoreSceneSettings(settings);
    cityStatus.value = `${scene.features.filter(feature => feature.kind === 'building').length} buildings · local fixture`;
    document.body.dataset['ready'] = 'true';
  } catch (error) {
    if (pageHidden || scene !== startingScene) return;
    cityStatus.value = error instanceof Error ? error.message : String(error);
    document.body.dataset['ready'] = 'error';
  }
}
let pageHidden = false;
let savedSettings: ReturnType<typeof captureSceneSettings> | null = null;
window.addEventListener('pagehide', () => {
  if (document.body.dataset['ready'] === 'true') savedSettings = captureSceneSettings();
  pageHidden = true;
  scene?.finalize();
});
window.addEventListener('pageshow', () => {
  if (!pageHidden) return;
  pageHidden = false;
  if (backendResolved) void startScene(savedSettings);
});
backend.value = await resolveDeckExampleDeviceType(
  new URLSearchParams(location.search).get('backend')
);
backendResolved = true;
if (!pageHidden) void startScene(savedSettings);

function initializeControls() {
  if (controlsInitialized) return;
  controlsInitialized = true;
  backendControl.addEventListener('change', () => {
    savedSettings = null;
    void startScene();
  });
  cameraControl.addEventListener('change', () => {
    const value = cameraControl.value;
    scene.setCamera(value === 'overhead' || value === 'waterfront' ? value : 'district');
  });
  buildingsControl.addEventListener('change', () =>
    scene.setBuildingsVisible(buildingsControl.checked)
  );
  edgeStyleControl.addEventListener('change', () => {
    const style = edgeStyleControl.value;
    scene.setEdgeStyle(style === 'solid' || style === 'pencil' ? style : 'none');
    edgeWidthControl.disabled = style === 'none';
  });
  edgeWidthControl.addEventListener('input', () =>
    scene.setEdgeWidth(Number(edgeWidthControl.value))
  );
  waterControl.addEventListener('change', () => scene.setWaterEnabled(waterControl.checked));
  reflectionsControl.addEventListener('change', () => {
    scene.setReflectionsEnabled(reflectionsControl.checked);
    reflectionQualityControl.disabled = !reflectionsControl.checked;
    reflectionViewControl.disabled = !reflectionsControl.checked;
  });
  reflectionViewControl.addEventListener('change', () =>
    scene.setReflectionDebugMode(Number(reflectionViewControl.value))
  );
  reflectionQualityControl.addEventListener('change', () => {
    const quality = reflectionQualityControl.value;
    scene.setReflectionQuality(quality === 'fast' || quality === 'detailed' ? quality : 'balanced');
  });
  waterStyleControl.addEventListener('change', () =>
    scene.setWaterStyle(waterStyleControl.value === 'classic' ? 'classic' : 'river')
  );
  waterPresetControl.addEventListener('change', () => {
    const preset = waterPresetControl.value as keyof typeof WATER_COLOR_PRESETS;
    if (!(preset in WATER_COLOR_PRESETS)) return;
    waterColorControl.value = WATER_COLOR_PRESETS[preset];
    scene.setWaterColor(parseColor(waterColorControl.value));
  });
  waterColorControl.addEventListener('input', () => {
    waterPresetControl.value = 'custom';
    scene.setWaterColor(parseColor(waterColorControl.value));
  });
  strengthControl.addEventListener('input', () =>
    scene.setWaveStrength(Number(strengthControl.value))
  );
  playbackControl.addEventListener('click', () => {
    scene.setPlaying(!scene.diagnostics.playing);
    playbackControl.textContent = scene.diagnostics.playing ? 'Pause waves' : 'Play waves';
  });
  cityParent.addEventListener('city-selection', () => {
    citySelection.value = scene.diagnostics.selected || 'Click a building or the river';
  });
  cityParent.addEventListener('city-error', () => {
    cityStatus.value = scene.diagnostics.error;
    document.body.dataset['ready'] = 'error';
  });
}
