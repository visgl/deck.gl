// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView, type Viewport} from '@deck.gl/core';
import {SceneBufferEffect, ShaderPassEffect} from '@deck.gl-community/gpu-layers';
import {dofCompositeShaderPass} from '@luma.gl/effects';
import {Matrix4} from '@math.gl/core';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {CITY_ORIGIN, makeCityFeatures, type CityFeature} from '../river-district-data';
import {RiverDistrictLayer} from '../river-district-layer';
import {FocusController} from './focus-controller';

/** Reuses luma.gl's depth-of-field pipeline with the auxiliary depth captured from Deck. */
export function createRiverfrontDepthOfFieldScene(
  parent: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  const features = makeCityFeatures();
  const focus = new FocusController();
  const settings = {enabled: true, blur: 24};
  const diagnostics = {
    frames: 0,
    backend: '',
    error: '',
    finalized: false,
    focusedBuilding: '',
    focusDistance: 0,
    targetDistance: 0
  };
  let resolveReady!: () => void;
  let rejectReady!: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const startTime = performance.now();
  const capture = new SceneBufferEffect({
    id: 'depth-of-field-buffers',
    colorFormat: 'rgba8unorm',
    getLayerOptions: layer => (layer instanceof RiverDistrictLayer ? {mode: 'opaque'} : null)
  });
  const effect = new ShaderPassEffect({
    id: 'riverfront-depth-of-field',
    shaderPasses: [dofCompositeShaderPass],
    colorFormat: 'rgba8unorm',
    getRenderOptions: options => {
      const viewport = options.viewports[0];
      if (!viewport) return null;
      const frame = capture.getFrame(viewport.id);
      if (!frame) return null;
      const time = (performance.now() - startTime) / 1000;
      const distances = features.map(feature => getFeatureDistance(viewport, feature));
      const candidates = features
        .flatMap((feature, index) => {
          if (feature.kind !== 'building') return [];
          const position = getFeaturePosition(viewport, feature);
          const clipPosition = new Matrix4(viewport.viewProjectionMatrix).transform(position);
          return clipPosition[3] > 0 &&
            Math.abs(clipPosition[0] / clipPosition[3]) < 0.95 &&
            Math.abs(clipPosition[1] / clipPosition[3]) < 0.9
            ? [index]
            : [];
        })
        .sort((first, second) => distances[first] - distances[second]);
      // Visit alternating near/far buildings, traversing the whole visible set.
      const tour: number[] = [];
      for (let index = 0; index < Math.ceil(candidates.length / 2); index++) {
        tour.push(candidates[index]);
        const oppositeIndex = candidates.length - index - 1;
        if (oppositeIndex !== index) tour.push(candidates[oppositeIndex]);
      }
      focus.updateSelection(time, tour);
      if (focus.selectedIndex < 0) return null;
      const depthScale = viewport.projectionMatrix[10];
      const depthOffset = viewport.projectionMatrix[14];
      const nearPlane = depthOffset / (depthScale - 1);
      const farPlane = depthOffset / (depthScale + 1);
      const targetDistance = Math.max(nearPlane, distances[focus.selectedIndex]);
      const focusDistance = focus.updateDistance(time, targetDistance);
      diagnostics.focusedBuilding = features[focus.selectedIndex].name;
      const viewUnitsPerMeter =
        viewport.distanceScales.unitsPerMeter[2] *
        Math.hypot(viewport.viewMatrix[8], viewport.viewMatrix[9], viewport.viewMatrix[10]);
      diagnostics.focusDistance = focusDistance / viewUnitsPerMeter;
      diagnostics.targetDistance = targetDistance / viewUnitsPerMeter;
      return {
        sourceTexture: frame.buffer.colorTexture,
        bindings: {depthTexture: frame.buffer.depthTexture},
        uniforms: {
          dof: {
            depthRange: [nearPlane, farPlane],
            focusDistance,
            // An artistic miniature lens: blur scales with relative distance, in physical pixels.
            blurCoefficient: settings.enabled ? (settings.blur * frame.buffer.height) / 800 : 0,
            pixelsPerMillimeter: 1
          }
        }
      };
    }
  });
  const deck = new Deck({
    parent,
    ...getDeckExampleProps(options),
    views: new MapView({id: 'riverfront', controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15.9,
      pitch: 62,
      bearing: -18
    },
    layers: [
      new RiverDistrictLayer({
        id: 'riverfront-city',
        features,
        data: features,
        pickable: true,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: CITY_ORIGIN
      })
    ],
    effects: [capture, effect],
    _animate: true,
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
    },
    onLoad: () => resolveReady(),
    onAfterRender: () => {
      diagnostics.frames++;
    },
    onError: error => {
      diagnostics.error ||= error.message;
      rejectReady(error);
    },
    onClick: info => {
      const feature: CityFeature | undefined = info.object;
      if (feature?.kind === 'building') focus.select(features.indexOf(feature));
    },
    getTooltip: info => (info.object?.kind === 'building' ? `Focus on ${info.object.name}` : null)
  });
  return {
    deck,
    capture,
    effect,
    focus,
    settings,
    diagnostics,
    features,
    ready,
    setAutomatic(enabled: boolean): void {
      focus.setAutomatic(enabled, (performance.now() - startTime) / 1000);
    },
    finalize(): void {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
    }
  };
}

function getFeaturePosition(
  viewport: Viewport,
  feature: CityFeature
): [number, number, number, number] {
  const origin = viewport.projectPosition(CITY_ORIGIN);
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter;
  return [
    origin[0] + feature.center[0] * unitsPerMeter[0],
    origin[1] + feature.center[1] * unitsPerMeter[1],
    origin[2] + (feature.center[2] + feature.size[2] * 0.6) * unitsPerMeter[2],
    1
  ];
}

function getFeatureDistance(viewport: Viewport, feature: CityFeature): number {
  return -new Matrix4(viewport.viewMatrix).transform(getFeaturePosition(viewport, feature))[2];
}
