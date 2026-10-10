// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors
import {COORDINATE_SYSTEM, Deck, MapView} from '@deck.gl/core';
import {SceneBufferEffect} from '@deck.gl-community/gpu-layers';
import {CITY_ORIGIN, makeCityFeatures, type CityFeature} from '../river-district-data';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {RiverDistrictLayer} from '../river-district-layer';
import {BufferPreviewEffect, type BufferPreviewMode} from './buffer-preview-effect';

export function createBufferScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeCityFeatures();
  const context = features.filter(feature => feature.kind !== 'building');
  const buildings = features.filter(feature => feature.kind === 'building');
  const lights: CityFeature[] = buildings.map((feature, index) => ({
    name: `${feature.name} beacon`,
    kind: 'building',
    center: [feature.center[0], feature.center[1], feature.size[2] + 1],
    size: [6, 6, 5],
    color: index % 2 ? [6, 1.8, 0.3] : [0.3, 3, 6]
  }));
  const glass: CityFeature[] = [
    {
      name: 'Glass pavilion',
      kind: 'building',
      center: [315, 125, 0],
      size: [90, 90, 125],
      color: [0.12, 0.8, 1]
    }
  ];
  let selected = 'East 4.1';
  let showGlass = true;
  const capture = new SceneBufferEffect({
    history: true,
    selection: true,
    getLayerOptions: layer => ({
      mode: layer.id === 'glass' ? 'transparent' : 'opaque',
      surfaceBuffer: layer.id !== 'glass',
      selected: layer.id === 'selected'
    })
  });
  const preview = new BufferPreviewEffect(capture);
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const diagnostics = {frames: 0, error: '', selected, finalized: false};
  const deviceProps = getDeckExampleProps(options);
  const deck = new Deck({
    parent,
    ...deviceProps,
    deviceProps: {...deviceProps.deviceProps, createCanvasContext: {alphaMode: 'opaque'}},
    views: new MapView({id: 'main', controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15.6,
      pitch: 52,
      bearing: -28
    },
    effects: [capture, preview],
    layers: [],
    onLoad: () => {
      updateLayers();
      resolveReady();
    },
    onAfterRender: () => {
      diagnostics.frames++;
    },
    onError: error => {
      diagnostics.error ||= error.message;
      rejectReady(error);
    },
    onClick: info => {
      if (
        info.object?.kind === 'building' &&
        !info.object.name.includes('beacon') &&
        info.object.name !== 'Glass pavilion'
      ) {
        selected = info.object.name;
        diagnostics.selected = selected;
        updateLayers();
        parent.dispatchEvent(new Event('buffer-selection'));
      }
    },
    getTooltip: info => info.object?.name || null
  });
  function updateLayers() {
    const coordinates = {
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: CITY_ORIGIN,
      roughness: 0.7
    };
    const selectedFeatures = buildings.filter(feature => feature.name === selected);
    const otherBuildings = buildings.filter(feature => feature.name !== selected);
    deck.setProps({
      layers: [
        new RiverDistrictLayer({
          id: 'context',
          features: context,
          data: context,
          pickable: true,
          ...coordinates
        }),
        new RiverDistrictLayer({
          id: 'buildings',
          features: otherBuildings,
          data: otherBuildings,
          pickable: true,
          ...coordinates
        }),
        new RiverDistrictLayer({
          id: 'selected',
          features: selectedFeatures,
          data: selectedFeatures,
          pickable: true,
          ...coordinates
        }),
        new RiverDistrictLayer({id: 'lights', features: lights, data: lights, ...coordinates}),
        new RiverDistrictLayer({
          id: 'glass',
          features: glass,
          data: glass,
          opacity: 0.35,
          visible: showGlass,
          pickable: true,
          parameters: {
            blend: true,
            blendColorOperation: 'add',
            blendAlphaOperation: 'add',
            blendColorSrcFactor: 'src-alpha',
            blendColorDstFactor: 'one-minus-src-alpha',
            blendAlphaSrcFactor: 'one',
            blendAlphaDstFactor: 'one-minus-src-alpha',
            depthWriteEnabled: false
          },
          ...coordinates
        })
      ]
    });
  }
  return {
    deck,
    capture,
    preview,
    ready,
    diagnostics,
    buildings,
    setMode(mode: BufferPreviewMode) {
      preview.mode = mode;
      deck.redraw('scene-buffer controls');
    },
    setBloom(value: boolean) {
      preview.bloom = value;
      deck.redraw('scene-buffer controls');
    },
    setEdges(value: boolean) {
      preview.edges = value;
      deck.redraw('scene-buffer controls');
    },
    setSelection(value: boolean) {
      preview.selection = value;
      deck.redraw('scene-buffer controls');
    },
    setStrength(value: number) {
      preview.strength = value;
      deck.redraw('scene-buffer controls');
    },
    setGlass(value: boolean) {
      showGlass = value;
      updateLayers();
    },
    resetHistory() {
      capture.resetHistory();
      deck.redraw('scene-buffer controls');
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
    }
  };
}
