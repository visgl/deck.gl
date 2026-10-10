// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, _GlobeView} from '@deck.gl/core';
import {SkyLayer} from '@deck.gl-community/gpu-layers';
import {DynamicTexture, loadImageBitmap} from '@luma.gl/engine';
import {
  createSkyObserver,
  getSunPosition,
  getMoonPosition,
  getMoonIllumination,
  getMoonLight,
  getSkyDirection,
  skyDirectionToGlobe
} from '@math.gl/sun';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {EarthLayer} from './earth-layer';
import earthImage from '../../showcase/globe/earth.jpg';

export function createGlobeCloudScene(
  parent: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  const settings = {
    clouds: true,
    animate: true,
    cover: 0.45,
    scale: 900,
    drift: 1,
    sunlight: 13,
    sun: true,
    moon: true,
    stars: true
  };
  const diagnostics = {frames: 0, time: 0, backend: '', error: '', finalized: false};
  const ready = Promise.withResolvers<void>();
  const observer = createSkyObserver({longitude: 20, latitude: 20});
  const date = Date.UTC(2026, 9, 4);
  const getTimestamp = () => date + settings.sunlight * 3600000;
  const initialViewState = {
    longitude: 20,
    latitude: 20,
    zoom: 1.4,
    minZoom: -1.5,
    maxZoom: 8,
    maxPitch: 120,
    pitch: 0,
    bearing: 0
  };
  let earthTexture: DynamicTexture | undefined;
  let lastTimestamp = 0;
  let initialized = false;
  const deviceProps = getDeckExampleProps(options);
  const highDynamicRange =
    (options.device?.type ?? options.deviceType ?? 'webgpu') === 'webgpu' &&
    window.matchMedia('(dynamic-range: high)').matches;
  const deck = new Deck({
    parent,
    ...deviceProps,
    deviceProps: {
      ...deviceProps.deviceProps,
      createCanvasContext: highDynamicRange
        ? {
            colorFormat: 'rgba16float',
            colorSpace: 'display-p3',
            toneMapping: 'extended',
            alphaMode: 'opaque'
          }
        : {alphaMode: 'opaque'}
    },
    views: new _GlobeView({id: 'globe', controller: true}),
    initialViewState,
    layers: [],
    _animate: true,
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
      earthTexture = new DynamicTexture(device, {
        id: 'globe-earth-texture',
        data: loadImageBitmap(earthImage),
        sampler: {
          minFilter: 'linear',
          magFilter: 'linear',
          addressModeU: 'repeat',
          addressModeV: 'clamp-to-edge'
        }
      });
      earthTexture.ready
        .then(() => {
          if (diagnostics.finalized) return;
          initialized = true;
          updateLayers();
        })
        .catch(reportError);
    },
    onBeforeRender: () => {
      const timestamp = performance.now();
      const elapsed = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 1000, 0.1) : 0;
      lastTimestamp = timestamp;
      if (settings.animate) diagnostics.time += elapsed;
      if (initialized && settings.animate) updateLayers();
    },
    onAfterRender: () => {
      diagnostics.frames++;
      if (initialized) ready.resolve();
    },
    onError: reportError
  });
  function reportError(error: Error): void {
    diagnostics.error = error.message;
    ready.reject(error);
  }
  function updateLayers(): void {
    if (!earthTexture?.isReady || diagnostics.finalized) return;
    const timestamp = getTimestamp();
    const position = getSunPosition(timestamp, observer.latitude, observer.longitude);
    const sunDirection = skyDirectionToGlobe(
      getSkyDirection(position.altitude, position.azimuth),
      observer
    );
    const moon = getMoonPosition(timestamp, observer.latitude, observer.longitude);
    const illumination = getMoonIllumination(timestamp);
    const moonDirection = skyDirectionToGlobe(
      getSkyDirection(moon.altitude, moon.azimuth),
      observer
    );
    // Evaluate a zenith reference; each surface normal determines its own lunar horizon.
    const moonlight = getMoonLight(Math.PI / 2, {
      phaseAngle: Math.acos(2 * illumination.fraction - 1),
      distance: moon.distance
    });
    deck.setProps({
      layers: [
        new EarthLayer({
          id: 'earth',
          texture: earthTexture.texture,
          sunDirection,
          moonDirection,
          moonColor: [moonlight.color[0] * 0.7, moonlight.color[1] * 0.82, moonlight.color[2]],
          moonIntensity: moonlight.intensity * 0.18
        }),
        new SkyLayer({
          id: 'sky',
          timestamp,
          observer,
          time: diagnostics.time,
          atmosphere: false,
          sun: settings.sun && {radiusPixels: 14, radiance: 8, color: [255, 220, 18, 255]},
          moon: settings.moon && {radiusPixels: 18},
          stars: settings.stars && {brightness: 2},
          clouds: settings.clouds && {
            cover: settings.cover,
            scale: settings.scale * 1000,
            // Accelerated drift makes orbital-scale cloud movement visible during a preview.
            velocity: [22000 * settings.drift, 5000 * settings.drift]
          }
        })
      ]
    });
  }
  return {
    deck,
    settings,
    diagnostics,
    ready: ready.promise,
    setClouds(value: boolean) {
      settings.clouds = value;
      updateLayers();
    },
    setAnimate(value: boolean) {
      settings.animate = value;
    },
    setCover(value: number) {
      settings.cover = value;
      updateLayers();
    },
    setScale(value: number) {
      settings.scale = value;
      updateLayers();
    },
    setDrift(value: number) {
      settings.drift = value;
      updateLayers();
    },
    setSunlight(value: number) {
      settings.sunlight = value;
      updateLayers();
    },
    setSun(value: boolean) {
      settings.sun = value;
      updateLayers();
    },
    setMoon(value: boolean) {
      settings.moon = value;
      updateLayers();
    },
    setStars(value: boolean) {
      settings.stars = value;
      updateLayers();
    },
    lookAtBody(body: 'sun' | 'moon') {
      const position =
        body === 'sun'
          ? getSunPosition(getTimestamp(), observer.latitude, observer.longitude)
          : getMoonPosition(getTimestamp(), observer.latitude, observer.longitude);
      const direction = skyDirectionToGlobe(
        getSkyDirection(position.altitude, position.azimuth),
        observer
      );
      const longitude = (Math.atan2(direction[0], -direction[1]) * 180) / Math.PI;
      const latitude = (Math.asin(direction[2]) * 180) / Math.PI;
      // Keep the planet small and offset the body from its silhouette instead of hiding it behind Earth.
      deck.setProps({
        initialViewState: {
          ...initialViewState,
          longitude: longitude + 198,
          latitude: -latitude,
          zoom: -1.2
        }
      });
    },
    centerView() {
      deck.setProps({initialViewState: {...initialViewState}});
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
      earthTexture?.destroy();
    }
  };
}
