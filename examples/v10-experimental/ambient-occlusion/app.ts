// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView, type Viewport} from '@deck.gl/core';
import {SceneBufferEffect, WaterSurfaceLayer} from '@deck.gl-community/gpu-layers';
import type {Buffer} from '@luma.gl/core';
import type {CompositeShaderPass} from '@luma.gl/shadertools';
import {
  createSSAOCompositeShaderPass,
  createOutlineCompositeShaderPass,
  toneMapping
} from '@luma.gl/effects';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {CITY_ORIGIN, makeCityFeatures, makeCityMesh} from '../river-district-data';
import {RiverDistrictLayer} from '../river-district-layer';
import {
  RiverReflectionEffect,
  type RiverReflectionPassUniforms
} from '../city-scene/river-reflection-effect';

const toneMappingPass: CompositeShaderPass = {
  name: 'riverfrontToneMapping',
  steps: [{shaderPass: toneMapping, inputs: {sourceTexture: 'previous'}, output: 'previous'}]
};

export type RiverfrontAmbientOcclusionSettings = {
  ambientOcclusion: boolean;
  outlines: boolean;
  reflections: boolean;
};

export function createRiverfrontAmbientOcclusionScene(
  parent: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  const features = makeCityFeatures();
  const dryFeatures = features.filter(feature => feature.kind !== 'water');
  const waterFeatures = features.filter(feature => feature.kind === 'water');
  const waterFeature = waterFeatures[0];
  const flowDirection: [number, number] =
    waterFeature && Math.abs(waterFeature.size[0]) > Math.abs(waterFeature.size[1])
      ? [1, 0]
      : [0, 1];
  const waterMesh = makeCityMesh(waterFeatures);
  const waterVertices = new Float32Array((waterMesh.length / 10) * 3);
  for (
    let sourceIndex = 0, targetIndex = 0;
    sourceIndex < waterMesh.length;
    sourceIndex += 10, targetIndex += 3
  ) {
    waterVertices.set(waterMesh.subarray(sourceIndex, sourceIndex + 3), targetIndex);
  }
  const settings: RiverfrontAmbientOcclusionSettings = {
    ambientOcclusion: true,
    outlines: false,
    reflections: true
  };
  const diagnostics = {frames: 0, backend: '', error: '', time: 0, finalized: false};
  const ready = Promise.withResolvers<void>();
  const capture = new SceneBufferEffect({
    id: 'ambient-occlusion-buffers',
    colorFormat: 'rgba16float',
    getLayerOptions: layer =>
      layer instanceof RiverDistrictLayer || layer instanceof WaterSurfaceLayer
        ? {mode: 'opaque', surfaceBuffer: true}
        : null
  });
  let waterPositions: Buffer | null = null;
  let effect: RiverReflectionEffect | null = null;
  let lastFrameTime = 0;
  const effectPasses: RiverReflectionPassUniforms = {};
  const stack = new RiverReflectionEffect(capture, 'ambient-occlusion-stack', 1.3, {
    beforeReflection: [
      createSSAOCompositeShaderPass({normalSource: 'normal-texture', resolutionScale: 1})
    ],
    afterReflection: [
      createOutlineCompositeShaderPass({normalSource: 'normal-texture'}),
      toneMappingPass
    ],
    getUniforms: viewport => makeEffectUniforms(viewport, settings, effectPasses)
  });
  effect = stack;
  const deviceProps = getDeckExampleProps(options);
  const deck = new Deck({
    parent,
    ...deviceProps,
    views: new MapView({id: 'riverfront', controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15.9,
      pitch: 58,
      bearing: -18
    },
    effects: [capture, stack],
    layers: [],
    _animate: true,
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
      const waterPositionsBuffer = device.createBuffer({
        id: 'ambient-occlusion-water',
        data: waterVertices
      });
      waterPositions = waterPositionsBuffer;
      updateLayers();
    },
    onLoad: () => ready.resolve(),
    onBeforeRender: () => {
      const now = performance.now();
      if (lastFrameTime) diagnostics.time += Math.min(now - lastFrameTime, 100) / 1000;
      lastFrameTime = now;
    },
    onAfterRender: () => {
      diagnostics.frames++;
    },
    onError: error => {
      diagnostics.error ||= error.message;
      ready.reject(error);
    },
    getTooltip: info => info.object?.name ?? null
  });

  function updateLayers(): void {
    deck.setProps({
      layers: [
        new RiverDistrictLayer({
          id: 'riverfront-city',
          features: dryFeatures,
          data: dryFeatures,
          pickable: true,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: CITY_ORIGIN,
          roughness: 0.84
        }),
        waterPositions
          ? new WaterSurfaceLayer({
              id: 'riverfront-water',
              data: waterFeatures,
              positions: waterPositions,
              vertexCount: waterVertices.length / 3,
              coordinateOrigin: CITY_ORIGIN,
              style: 'river',
              flowDirection,
              time: () => diagnostics.time,
              material: {
                baseColor: [11 / 255, 66 / 255, 82 / 255],
                fresnelColor: [0.48, 0.67, 0.79],
                normalStrength: 0.34,
                coordinateScale: [0.22, 0.22],
                waveASpeed: 1.1,
                waveBSpeed: -0.7,
                specularIntensity: 0.72
              }
            })
          : null
      ]
    });
  }

  return {
    deck,
    capture,
    effect,
    settings,
    diagnostics,
    ready: ready.promise,
    setEffect(name: keyof RiverfrontAmbientOcclusionSettings, enabled: boolean): void {
      settings[name] = enabled;
      if (name === 'reflections') effect?.setReflectionIntensity(enabled ? 1.3 : 0);
      else effect?.requestConvergence();
      deck.redraw(`riverfront ${name}`);
    },
    finalize(): void {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
      waterPositions?.destroy();
      waterPositions = null;
    }
  };
}

function makeEffectUniforms(
  viewport: Viewport,
  settings: RiverfrontAmbientOcclusionSettings,
  uniforms: RiverReflectionPassUniforms
): RiverReflectionPassUniforms {
  const viewUnitsPerMeter =
    viewport.distanceScales.unitsPerMeter[2] *
    Math.hypot(viewport.viewMatrix[8], viewport.viewMatrix[9], viewport.viewMatrix[10]);
  // Deck's perspective depth planes are expressed in viewport-normalized view units.
  const depthScale = viewport.projectionMatrix[10];
  const depthOffset = viewport.projectionMatrix[14] / viewUnitsPerMeter;
  uniforms['ssaoEvaluate'] = {
    nearPlane: depthOffset / (depthScale - 1),
    farPlane: depthOffset / (depthScale + 1),
    radius: 12,
    bias: 0.3,
    intensity: settings.ambientOcclusion ? 1.5 : 0
  };
  uniforms['ssaoComposite'] = {debugMode: 0};
  uniforms['screenSpaceOutline'] = {
    color: [0.025, 0.045, 0.06, settings.outlines ? 0.5 : 0],
    thickness: 1.2,
    depthThreshold: 0.003,
    normalThreshold: 0.18
  };
  uniforms['toneMapping'] = {exposure: 1.1};
  return uniforms;
}
