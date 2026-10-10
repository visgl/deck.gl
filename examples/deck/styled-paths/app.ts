// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import {COORDINATE_SYSTEM, Deck, MapView} from '@deck.gl/core';
import type {StrokeGeometryOptions} from '@luma.gl/engine';
import type {PathDashProps} from '@luma.gl/shadertools';
import {CITY_ORIGIN, makeCityFeatures} from '../river-district-data';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {BuildingMeshLayer} from './building-layer';
import {
  StrokeMeshLayer,
  getStrokeParameters,
  type Route,
  type StrokeAppearance
} from './stroke-layer';
import {ROUTES} from './routes';

export function createStrokeScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeCityFeatures();
  const darkFeatures: typeof features = features.map(feature => ({
    ...feature,
    color: [feature.color[0] * 0.12, feature.color[1] * 0.17, feature.color[2] * 0.24]
  }));
  let appearance: StrokeAppearance = 'plain';
  let grain = 0.6;
  let glowIntensity = 0.8;
  let routes: readonly Route[] = ROUTES;
  let geometryOptions: StrokeGeometryOptions = {
    width: 9,
    cap: 'round',
    join: 'round',
    miterLimit: 3
  };
  let dash: PathDashProps = {dashLength: 25, gapLength: 14, offset: 10};
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
      diagnostics.error ||= error.message;
      parent.dispatchEvent(new Event('stroke-error'));
      rejectReady(error);
    },
    onClick: info => {
      diagnostics.selected = info.object?.name || '';
      parent.dispatchEvent(new Event('stroke-selection'));
    },
    getTooltip: info => info.object?.name || null
  });
  function updateLayers() {
    const coordinates = {
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: CITY_ORIGIN
    };
    parent.style.backgroundColor = appearance === 'glow' ? '#08101b' : '#e6e2d9';
    const activeFeatures = appearance === 'glow' ? darkFeatures : features;
    deck.setProps({
      layers: [
        new BuildingMeshLayer({
          id: 'district',
          features: activeFeatures,
          data: activeFeatures,
          pickable: true,
          ...coordinates
        }),
        new StrokeMeshLayer({
          id: 'routes',
          routes,
          data: routes,
          appearance,
          parameters: getStrokeParameters(appearance),
          grain,
          glowIntensity,
          geometryOptions,
          dash: {...dash, gapLength: enabled ? dash.gapLength : 0},
          pickable: true,
          ...coordinates
        })
      ]
    });
  }
  return {
    deck,
    ready,
    diagnostics,
    routes: ROUTES,
    setGeometryOptions(next: StrokeGeometryOptions) {
      geometryOptions = {...geometryOptions, ...next};
      updateLayers();
    },
    setDash(next: PathDashProps) {
      dash = {...dash, ...next};
      updateLayers();
    },
    setAppearance(value: StrokeAppearance) {
      appearance = value;
      updateLayers();
    },
    setGrain(value: number) {
      grain = value;
      updateLayers();
    },
    setGlowIntensity(value: number) {
      glowIntensity = value;
      updateLayers();
    },
    setRoutes(value: readonly Route[]) {
      routes = value;
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
