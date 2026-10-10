// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView} from '@deck.gl/core';
import {SketchEdgeLayer} from '@deck.gl-community/gpu-layers';
import type {Buffer} from '@luma.gl/core';
import type {MakeEdgeGeometryOptions} from '@luma.gl/engine';
import {makeCityFeatures, type CityFeature} from '../river-district-data';
import type {SketchStrokeProps} from '@luma.gl/shadertools';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {BuildingMeshLayer} from './building-layer';
import {makeBuildings, makeEdges, ORIGIN} from './building-data';

type GroundTone = 'light' | 'dark';

export function createSketchScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeBuildings().map(feature => {
    const tone = (feature.color[0] + feature.color[1] + feature.color[2]) / 3;
    return {...feature, color: [tone * 0.96, tone * 0.94, tone * 0.9] as [number, number, number]};
  });
  const districtFeatures = makeCityFeatures().filter(feature => feature.kind !== 'building');
  let groundTone: GroundTone = 'light';
  let surroundings = makeSurroundings(groundTone);
  let edgeOptions: MakeEdgeGeometryOptions = {angleThreshold: 30};
  let edgeData = makeEdges(features, edgeOptions);
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
    selected: '',
    finalized: false,
    edgeCount: edgeData.length / 8
  };
  let segments: Buffer | null = null;
  let style: SketchStrokeProps = {
    width: 3.1,
    jitter: 0.65,
    grain: 0.9,
    variation: 0.45,
    extension: 5
  };
  let edgesVisible = true;
  let fillsVisible = false;
  let contextVisible = true;
  const deck = new Deck({
    parent,
    ...getDeckExampleProps(options),
    views: new MapView({controller: true}),
    initialViewState: {
      ...RIVERFRONT_VIEW_LIMITS,
      longitude: ORIGIN[0],
      latitude: ORIGIN[1],
      zoom: 15.6,
      pitch: 52,
      bearing: -28
    },
    layers: [],
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
      segments = device.createBuffer({id: 'building-edges', data: edgeData});
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
          visible: contextVisible,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: ORIGIN
        }),
        new BuildingMeshLayer({
          id: 'buildings',
          features,
          data: features,
          pickable: true,
          opacity: 0.34,
          visible: fillsVisible,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: ORIGIN
        }),
        edgesVisible &&
          segments &&
          new SketchEdgeLayer({
            id: 'sketch-edges',
            segments,
            segmentCount: edgeData.length / 8,
            data: features,
            color: [48, 44, 40, 255],
            style,
            visible: edgesVisible,
            coordinateOrigin: ORIGIN,
            pickable: true
          })
      ]
    });
  }
  return {
    deck,
    features,
    diagnostics,
    ready,
    get segments() {
      return segments;
    },
    setStyle(next: SketchStrokeProps) {
      style = {...style, ...next};
      updateLayers();
    },
    setEdgeOptions(next: MakeEdgeGeometryOptions) {
      edgeOptions = {...edgeOptions, ...next};
      if (!segments) return;
      edgeData = makeEdges(features, edgeOptions);
      diagnostics.edgeCount = edgeData.length / 8;
      const previous = segments;
      segments = previous.device.createBuffer({id: 'building-edges', data: edgeData});
      updateLayers();
      previous.destroy();
    },
    setContextVisible(visible: boolean) {
      contextVisible = visible;
      updateLayers();
    },
    setGroundTone(nextGroundTone: GroundTone) {
      if (groundTone === nextGroundTone) return;
      groundTone = nextGroundTone;
      surroundings = makeSurroundings(groundTone);
      updateLayers();
    },
    setEdgesVisible(visible: boolean) {
      edgesVisible = visible;
      updateLayers();
    },
    setFillsVisible(visible: boolean) {
      fillsVisible = visible;
      updateLayers();
    },
    rebuildLayers() {
      updateLayers();
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
      segments?.destroy();
      segments = null;
    }
  };

  function makeSurroundings(tone: GroundTone): CityFeature[] {
    const groundColor: [number, number, number] =
      tone === 'light' ? [0.78, 0.77, 0.73] : [0.17, 0.23, 0.27];
    return districtFeatures.map(feature =>
      feature.kind === 'ground' ? {...feature, color: groundColor} : feature
    );
  }
}
