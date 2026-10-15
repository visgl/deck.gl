// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView} from '@deck.gl/core';
import type {PatternFillProps} from '@luma.gl/shadertools';
import {makeCityFeatures, CITY_ORIGIN} from '../river-district-data';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {BuildingMeshLayer} from './building-layer';

export function createPatternScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeCityFeatures().filter(feature => feature.kind === 'building');
  const surroundings = makeCityFeatures().filter(feature => feature.kind !== 'building');
  let pattern: PatternFillProps = {pattern: 'hatch', spacing: 8, width: 0.2, angle: Math.PI / 4};
  let enabled = true;
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const diagnostics = {frames: 0, backend: '', error: '', selected: '', finalized: false};
  const deck = new Deck({
    parent,
    ...getDeckExampleProps(options),
    views: new MapView({controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15.6,
      pitch: 52,
      bearing: -28
    },
    layers: [],
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
    },
    onLoad: () => {
      updateLayers();
      resolveReady();
    },
    onAfterRender: () => {
      diagnostics.frames++;
    },
    onError: error => {
      diagnostics.error = error.message;
      rejectReady(error);
    },
    onClick: info => {
      diagnostics.selected = info.object?.name || '';
      parent.dispatchEvent(new Event('pattern-selection'));
    },
    getTooltip: info => info.object?.name || null
  });
  function updateLayers() {
    deck.setProps({
      layers: [
        new BuildingMeshLayer({
          id: 'surroundings',
          features: surroundings,
          data: surroundings,
          pattern: {width: 0},
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: CITY_ORIGIN
        }),
        new BuildingMeshLayer({
          id: 'buildings',
          features,
          data: features,
          pattern: {...pattern, width: enabled ? pattern.width : 0},
          pickable: true,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: CITY_ORIGIN
        })
      ]
    });
  }
  return {
    deck,
    features,
    diagnostics,
    ready,
    setPattern(next: PatternFillProps) {
      pattern = {...pattern, ...next};
      updateLayers();
    },
    setEnabled(value: boolean) {
      enabled = value;
      updateLayers();
    },
    rebuildLayers: updateLayers,
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
    }
  };
}
