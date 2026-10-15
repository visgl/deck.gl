// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView} from '@deck.gl/core';
import {assert, type Device} from '@luma.gl/core';
import {FlowParticleLayer} from '@deck.gl-community/gpu-layers';
import {
  FlowFieldAtlas,
  FlowParticleSimulation,
  type FlowParticleStepResult
} from '@luma.gl/experimental';
import {CITY_ORIGIN, makeCityFeatures} from '../river-district-data';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {RiverDistrictLayer} from '../river-district-layer';

const BOUNDS = [-84, -620, 84, 620] as const;
export type FlowPattern = 'river' | 'eddies' | 'missing' | 'changing';

export function createFlowScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const buildings = makeCityFeatures();
  for (const feature of buildings) {
    if (feature.kind === 'water') feature.color = [0.035, 0.15, 0.2];
    else
      feature.color = [feature.color[0] * 0.65, feature.color[1] * 0.65, feature.color[2] * 0.65];
  }
  let device: Device | null = null;
  let fieldAtlas: FlowFieldAtlas | null = null;
  let northernSection = true;
  let fieldTime = 0;
  let fieldTick = -1;
  let simulation: FlowParticleSimulation | null = null;
  let particles: FlowParticleStepResult | null = null;
  let particleCount = 2048;
  let pattern: FlowPattern = 'river';
  let playing = true;
  let speed = 2;
  let trailSeconds = 6;
  let widthPixels = 1.5;
  let previousTime = 0;
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const diagnostics = {
    frames: 0,
    backend: '',
    error: '',
    selected: -1,
    finalized: false,
    advancedTime: 0,
    droppedTime: 0,
    submissionMilliseconds: 0,
    fieldTime: 0,
    fieldUpdates: 0
  };
  const deckDeviceProps = getDeckExampleProps(options);
  const deck = new Deck({
    parent,
    ...deckDeviceProps,
    deviceProps: {
      ...deckDeviceProps.deviceProps,
      createCanvasContext: {alphaMode: 'opaque'},
      webgl: {alpha: false}
    },
    views: new MapView({controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15.6,
      pitch: 50,
      bearing: -25
    },
    layers: [],
    _animate: true,
    onDeviceInitialized: nextDevice => {
      device = nextDevice;
      diagnostics.backend = device.type;
      rebuildSimulation();
    },
    onLoad: () => {
      updateLayers();
      resolveReady();
    },
    onBeforeRender: () => {
      const now = performance.now();
      const elapsed = previousTime ? (now - previousTime) / 1000 : 1 / 60;
      previousTime = now;
      if (simulation && playing) {
        if (pattern === 'changing' && Math.floor(fieldTime * 2) !== fieldTick) updateField();
        particles = simulation.step(elapsed * speed);
        fieldTime += particles.advancedTime;
        diagnostics.fieldTime = fieldTime;
        diagnostics.submissionMilliseconds = performance.now() - now;
        diagnostics.advancedTime += particles.advancedTime;
        diagnostics.droppedTime += particles.droppedTime;
      }
    },
    onAfterRender: () => {
      diagnostics.frames++;
    },
    onError: error => {
      diagnostics.error ||= error.message;
      rejectReady(error);
    },
    onClick: info => {
      diagnostics.selected = info.layer?.id === 'particles' ? info.index : -1;
      parent.dispatchEvent(new Event('flow-selection'));
    },
    getTooltip: info =>
      info.layer?.id === 'particles' ? `Particle ${info.index}` : info.object?.name || null
  });
  function rebuildSimulation() {
    if (!device) return;
    if (!fieldAtlas) {
      fieldAtlas = new FlowFieldAtlas(device, {
        bounds: BOUNDS,
        coordinates: 'cartesian',
        tileSize: [64, 64],
        tileCount: [1, 4]
      });
      updateField();
    }
    const nextSimulation = new FlowParticleSimulation(device, {
      particleCount,
      field: fieldAtlas.field,
      seed: 29,
      lifetime: 90
    });
    const previousSimulation = simulation;
    simulation = nextSimulation;
    particles = simulation.step(1 / 60);
    previousSimulation?.destroy();
    previousTime = 0;
  }
  function updateField() {
    if (!fieldAtlas) return;
    fieldTick = Math.floor(fieldTime * 2);
    for (let row = 0; row < 4; row++) {
      if (row === 3 && !northernSection) fieldAtlas.clearTile(0, row);
      else writeFlowFieldTile(fieldAtlas, row, pattern, fieldTick / 2);
    }
    diagnostics.fieldUpdates++;
  }
  function updateLayers() {
    if (!particles) return;
    const projection = {
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: CITY_ORIGIN
    };
    deck.setProps({
      layers: [
        new RiverDistrictLayer({
          id: 'buildings',
          features: buildings,
          data: buildings,
          pickable: true,
          ...projection
        }),
        new FlowParticleLayer({
          id: 'particles',
          particles: () => {
            assert(particles);
            return particles;
          },
          particleCount,
          bounds: BOUNDS,
          widthPixels,
          trailSeconds,
          altitude: 1,
          color: [0.45, 0.93, 0.88, 0.9],
          pickable: true,
          ...projection
        })
      ]
    });
  }
  return {
    deck,
    diagnostics,
    ready,
    get simulation() {
      return simulation;
    },
    get fieldAtlas() {
      return fieldAtlas;
    },
    get particles() {
      return particles;
    },
    setPlaying(value: boolean) {
      playing = value;
      previousTime = 0;
      deck.setProps({_animate: playing});
    },
    setSpeed(value: number) {
      speed = value;
    },
    setTrail(value: number) {
      trailSeconds = value;
      updateLayers();
    },
    setWidth(value: number) {
      widthPixels = value;
      updateLayers();
    },
    setCount(value: number) {
      particleCount = value;
      rebuildSimulation();
      updateLayers();
    },
    setPattern(value: FlowPattern) {
      if (!device || !simulation) return;
      pattern = value;
      updateField();
      particles = simulation.step(1 / 60);
      updateLayers();
    },
    setNorthernSection(value: boolean) {
      northernSection = value;
      if (!fieldAtlas || !simulation) return;
      if (value) writeFlowFieldTile(fieldAtlas, 3, pattern, fieldTick / 2);
      else fieldAtlas.clearTile(0, 3);
      diagnostics.fieldUpdates++;
      particles = simulation.step(1 / 60);
      updateLayers();
    },
    reset() {
      fieldTime = 0;
      diagnostics.fieldTime = 0;
      previousTime = 0;
      updateField();
      simulation?.reset();
      particles = simulation?.step(1 / 60) ?? null;
      updateLayers();
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
      simulation?.destroy();
      fieldAtlas?.destroy();
    }
  };
}

function writeFlowFieldTile(
  atlas: FlowFieldAtlas,
  tileRow: number,
  pattern: FlowPattern,
  time: number
): void {
  const [width, height] = atlas.tileSize;
  const fullHeight = height * atlas.tileCount[1];
  const data = new Float32Array(width * height * 4);
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      const east = BOUNDS[0] + (column / (width - 1)) * (BOUNDS[2] - BOUNDS[0]);
      const north =
        BOUNDS[1] + ((tileRow * height + row) / (fullHeight - 1)) * (BOUNDS[3] - BOUNDS[1]);
      const bankFalloff = Math.max(0.05, 1 - (east / 84) ** 2);
      const index = (row * width + column) * 4;
      data[index] =
        pattern === 'eddies'
          ? 5 * Math.sin(north / 55) * bankFalloff
          : Math.sin(north / 100) * bankFalloff;
      data[index + 1] =
        pattern === 'eddies'
          ? 3 + 6 * Math.sin(east / 35) * Math.cos(north / 55)
          : 3 + 5 * bankFalloff;
      if (pattern === 'changing') {
        data[index] += 3 * Math.sin(time * 0.35 + north / 180) * bankFalloff;
        data[index + 1] *= 0.35 + 0.65 * Math.cos(time * 0.4);
      }
      data[index + 2] = pattern === 'missing' && Math.hypot(east * 1.5, north - 100) < 75 ? 0 : 1;
    }
  }
  atlas.writeTile(0, tileRow, data);
}
