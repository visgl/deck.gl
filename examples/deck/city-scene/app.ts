// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView, type MapViewState} from '@deck.gl/core';
import {SceneBufferEffect, SketchEdgeLayer, WaterSurfaceLayer} from '@deck.gl-community/gpu-layers';
import type {Buffer} from '@luma.gl/core';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {RIVERFRONT_VIEW_LIMITS} from '../riverfront-view';
import {
  CITY_ORIGIN,
  makeCityFeatures,
  makeCityMesh,
  type CityFeature
} from '../river-district-data';
import {RiverDistrictLayer} from '../river-district-layer';
import {makeBuildings, makeEdges} from '../river-district-edges';
import type {SSRQuality} from '@luma.gl/effects';
import {RiverReflectionEffect} from './river-reflection-effect';

export const CAMERA_PRESETS = {
  district: {
    longitude: CITY_ORIGIN[0],
    latitude: CITY_ORIGIN[1],
    zoom: 15.6,
    pitch: 52,
    bearing: -28
  },
  overhead: {longitude: CITY_ORIGIN[0], latitude: CITY_ORIGIN[1], zoom: 15.5, pitch: 0, bearing: 0},
  waterfront: {
    longitude: CITY_ORIGIN[0],
    latitude: CITY_ORIGIN[1],
    zoom: 16.3,
    pitch: 68,
    bearing: 15
  }
} satisfies Record<string, MapViewState>;

export type BuildingEdgeStyle = 'none' | 'solid' | 'pencil';

export type CityScene = ReturnType<typeof createCityScene>;

/** Owns the example's Deck instance; Deck owns the device, frame loop, and mesh-layer lifecycle. */
export function createCityScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeCityFeatures();
  const buildings = makeBuildings();
  const edgeVertices = makeEdges(buildings);
  const diagnostics = {
    frames: 0,
    backend: '',
    selected: '',
    finalized: false,
    error: '',
    timeSeconds: 0,
    waterEnabled: true,
    buildingsVisible: true,
    edgeStyle: 'none' as BuildingEdgeStyle,
    waterStyle: 'river' as 'classic' | 'river',
    reflectionsEnabled: true,
    reflectionQuality: 'balanced' as SSRQuality,
    playing: true
  };
  const ready = Promise.withResolvers<void>();
  let activeFeatures = features;
  let dryFeatures = features.filter(feature => feature.kind !== 'water');
  let waterPositions: Buffer | null = null;
  let edgeSegments: Buffer | null = null;
  let edgeWidth = 2.2;
  let waveStrength = 0.55;
  let waterColor: [number, number, number] = [11 / 255, 66 / 255, 82 / 255];
  let riverReflectionEffect: RiverReflectionEffect | null = null;
  let lastFrameTime: number | null = null;
  const waterFeatures = features.filter(feature => feature.kind === 'water');
  const riverFeature = waterFeatures[0];
  const flowDirection: [number, number] =
    riverFeature && Math.abs(riverFeature.size[0]) > Math.abs(riverFeature.size[1])
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
  const deck = new Deck({
    parent,
    ...getDeckExampleProps(options),
    views: new MapView({id: 'city', controller: true}),
    initialViewState: {...RIVERFRONT_VIEW_LIMITS, ...CAMERA_PRESETS.district},
    layers: [],
    _animate: true,
    onLoad: () => {
      updateLayers();
      ready.resolve();
    },
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
      waterPositions = device.createBuffer({id: 'river-positions', data: waterVertices});
      edgeSegments = device.createBuffer({id: 'city-building-edges', data: edgeVertices});
      if (device.type === 'webgpu') {
        riverReflectionEffect = new RiverReflectionEffect(
          new SceneBufferEffect({
            id: 'city-scene-buffers',
            colorFormat: 'rgba8unorm',
            getLayerOptions: layer =>
              layer instanceof RiverDistrictLayer || layer instanceof WaterSurfaceLayer
                ? {mode: 'opaque', surfaceBuffer: true}
                : layer instanceof SketchEdgeLayer
                  ? {mode: 'transparent'}
                  : null
          })
        );
        updateEffects();
      } else {
        diagnostics.reflectionsEnabled = false;
      }
    },
    onBeforeRender: () => {
      const now = performance.now();
      if (diagnostics.playing && diagnostics.waterEnabled) {
        if (lastFrameTime !== null)
          diagnostics.timeSeconds += Math.min(now - lastFrameTime, 100) / 1000;
        lastFrameTime = now;
      }
    },
    onAfterRender: () => {
      diagnostics.frames++;
      updateAnimation();
    },
    onError: error => {
      diagnostics.error = error.message;
      ready.reject(error);
      parent.dispatchEvent(new CustomEvent('city-error', {detail: error.message}));
    },
    getTooltip: ({object}: {object?: CityFeature}) =>
      object ? `${object.name} · ${object.kind}` : null,
    onClick: ({object}: {object?: CityFeature}) => {
      diagnostics.selected = object?.name ?? '';
      parent.dispatchEvent(new CustomEvent('city-selection', {detail: diagnostics.selected}));
    }
  });

  function updateLayers() {
    riverReflectionEffect?.resetHistory();
    const mesh = new RiverDistrictLayer({
      id: 'city-mesh',
      features: diagnostics.waterEnabled ? dryFeatures : activeFeatures,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 196, 92, 160],
      coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      coordinateOrigin: CITY_ORIGIN
    });
    const water =
      diagnostics.waterEnabled && waterPositions
        ? new WaterSurfaceLayer({
            id: 'river-water',
            data: waterFeatures,
            positions: waterPositions,
            vertexCount: waterVertices.length / 3,
            coordinateOrigin: CITY_ORIGIN,
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 196, 92, 160],
            style: diagnostics.waterStyle,
            flowDirection,
            time: () => diagnostics.timeSeconds,
            material: {
              baseColor: diagnostics.waterStyle === 'river' ? waterColor : [0.045, 0.26, 0.32],
              fresnelColor:
                diagnostics.waterStyle === 'river'
                  ? (waterColor.map(channel => Math.min(channel + 0.48, 1)) as [
                      number,
                      number,
                      number
                    ])
                  : [0.7, 0.87, 0.92],
              normalStrength: waveStrength,
              coordinateScale: [0.22, 0.22],
              waveASpeed: 1.1,
              waveBSpeed: -0.7,
              specularIntensity: 0.8
            }
          })
        : null;
    deck.setProps({
      layers: [
        mesh,
        water,
        diagnostics.buildingsVisible && diagnostics.edgeStyle !== 'none' && edgeSegments
          ? new SketchEdgeLayer({
              id: 'city-building-edges',
              segments: edgeSegments,
              segmentCount: edgeVertices.length / 8,
              data: buildings,
              coordinateOrigin: CITY_ORIGIN,
              pickable: true,
              style: {
                width: edgeWidth,
                sketch: diagnostics.edgeStyle === 'pencil' ? 1 : 0,
                jitter: 0.85,
                variation: 0.65,
                grain: 0.6,
                extension: diagnostics.edgeStyle === 'pencil' ? 4 : 0
              }
            })
          : null
      ],
      _animate: shouldAnimate()
    });
  }

  function shouldAnimate(): boolean {
    return (
      diagnostics.waterEnabled &&
      (diagnostics.playing ||
        Boolean(diagnostics.reflectionsEnabled && riverReflectionEffect?.needsRedraw))
    );
  }

  function updateAnimation(): void {
    const animate = shouldAnimate();
    if (deck.props._animate !== animate) deck.setProps({_animate: animate});
  }

  function updateEffects() {
    deck.setProps({
      effects:
        diagnostics.reflectionsEnabled && riverReflectionEffect
          ? [riverReflectionEffect.capture, riverReflectionEffect]
          : [],
      _animate: shouldAnimate()
    });
  }

  return {
    deck,
    ready: ready.promise,
    diagnostics,
    features,
    setCamera(preset: keyof typeof CAMERA_PRESETS) {
      riverReflectionEffect?.resetHistory();
      deck.setProps({
        initialViewState: {...RIVERFRONT_VIEW_LIMITS, ...CAMERA_PRESETS[preset]},
        _animate: shouldAnimate()
      });
    },
    setEdgeStyle(style: BuildingEdgeStyle) {
      diagnostics.edgeStyle = style;
      updateLayers();
    },
    setEdgeWidth(width: number) {
      edgeWidth = width;
      updateLayers();
    },
    setBuildingsVisible(visible: boolean) {
      diagnostics.buildingsVisible = visible;
      activeFeatures = visible ? features : features.filter(feature => feature.kind !== 'building');
      dryFeatures = activeFeatures.filter(feature => feature.kind !== 'water');
      updateLayers();
    },
    setWaterEnabled(enabled: boolean) {
      diagnostics.waterEnabled = enabled;
      lastFrameTime = null;
      updateLayers();
    },
    setWaterStyle(style: 'classic' | 'river') {
      diagnostics.waterStyle = style;
      updateLayers();
    },
    setReflectionsEnabled(enabled: boolean) {
      diagnostics.reflectionsEnabled = enabled && Boolean(riverReflectionEffect);
      updateEffects();
    },
    setReflectionQuality(quality: SSRQuality) {
      diagnostics.reflectionQuality = quality;
      riverReflectionEffect?.setQuality(quality);
      deck.redraw('reflection quality changed');
    },
    setReflectionDebugMode(mode: number) {
      if (riverReflectionEffect) riverReflectionEffect.debugMode = mode;
      deck.redraw('reflection debug view');
    },
    setWaterColor(color: [number, number, number]) {
      waterColor = color;
      updateLayers();
    },
    setPlaying(playing: boolean) {
      diagnostics.playing = playing;
      lastFrameTime = null;
      if (!playing) riverReflectionEffect?.requestConvergence();
      updateAnimation();
    },
    setTime(timeSeconds: number) {
      riverReflectionEffect?.resetHistory();
      diagnostics.playing = false;
      diagnostics.timeSeconds = timeSeconds;
      lastFrameTime = null;
      deck.setProps({_animate: false});
      deck.redraw('water time changed');
    },
    setWaveStrength(strength: number) {
      waveStrength = strength;
      updateLayers();
    },
    getFeatureScreenPosition(name: string): number[] | null {
      const layer = deck.props.layers?.find(candidate => candidate instanceof RiverDistrictLayer);
      const feature = activeFeatures.find(candidate => candidate.name === name);
      if (!(layer instanceof RiverDistrictLayer) || !feature) return null;
      return layer.project([
        feature.center[0],
        feature.center[1],
        feature.center[2] + feature.size[2]
      ]);
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
      waterPositions?.destroy();
      waterPositions = null;
      edgeSegments?.destroy();
      edgeSegments = null;
    }
  };
}
