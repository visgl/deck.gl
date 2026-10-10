// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  COORDINATE_SYSTEM,
  Deck,
  MapView,
  _GlobeView,
  type Viewport,
  type MapViewState
} from '@deck.gl/core';
import type {Device, Texture} from '@luma.gl/core';
import {
  integrateSurfaceWeather,
  type HeightFogProps,
  type LightingProps,
  type PrecipitationProps,
  type SurfaceWeatherProps
} from '@luma.gl/shadertools';
import {
  getMeterOffsetPosition,
  WeatherParticleLayer,
  SkyLayer
} from '@deck.gl-community/gpu-layers';
import {CITY_ORIGIN, makeCityFeatures, type CityFeature} from '../river-district-data';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {createSkyObserver, getMoonPosition, getSkyDirection} from '@math.gl/sun';
import {getRiverfrontSun, DEFAULT_HOUR} from '../soft-shadows/sun';
import {getSkyCameraState, SKY_FIELD_OF_VIEW} from '../soft-shadows/sky-camera';
import {RiverDistrictLayer} from '../river-district-layer';
import {getRiverfrontSkyLighting} from '../riverfront-sky-lighting';

export type WeatherPreset = 'clear' | 'rain' | 'snow' | 'clouds';
const SURFACE_BOUNDS: [number, number, number, number] = [-700, -900, 700, 900];
export function createWeatherScene(parent: HTMLDivElement, options: DeckExampleDeviceOptions = {}) {
  const features = makeCityFeatures();
  let surfaceTexture: Texture | null = null;
  let preset: WeatherPreset = 'rain';
  let fogEnabled = true;
  let intensity = 0.6;
  let windSpeed = 6;
  let windDirection = 45;
  let visibility = 700;
  let fogVariation = 1;
  let fogSpeed = 3;
  let playing = true;
  let hour = 9;
  let cloudsEnabled = true;
  const observer = createSkyObserver({longitude: CITY_ORIGIN[0], latitude: CITY_ORIGIN[1]});
  const surfaceSettings = {enabled: true, accumulate: true, wetness: 0.35, snow: 0, puddles: 0.8};
  let time = 0;
  let fogTime = 0;
  let previousTime = 0;
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  // Pause the clock across hidden-tab gaps without slowing visible low-frame-rate rendering.
  const resetFrameTime = () => {
    previousTime = 0;
  };
  document.addEventListener('visibilitychange', resetFrameTime);
  const diagnostics = {
    frames: 0,
    time: 0,
    hour,
    sunAltitude: 0,
    error: '',
    backend: '',
    finalized: false
  };
  const deviceProps = getDeckExampleProps(options);
  const initialViewState: MapViewState = getSkyCameraState(
    {longitude: CITY_ORIGIN[0], latitude: CITY_ORIGIN[1], zoom: 15.6, pitch: 74, bearing: -25},
    parent.clientWidth,
    parent.clientHeight
  );
  const deck = new Deck<MapView | _GlobeView>({
    parent,
    ...deviceProps,
    deviceProps: {
      ...deviceProps.deviceProps,
      createCanvasContext: {alphaMode: 'premultiplied'},
      webgl: {alpha: true}
    },
    views: new MapView({controller: true, fovy: SKY_FIELD_OF_VIEW}),
    initialViewState,
    onViewStateChange: ({viewState}) =>
      getSkyCameraState(viewState, parent.clientWidth, parent.clientHeight),
    layers: [],
    _animate: isWeatherAnimating(),
    onDeviceInitialized: device => {
      surfaceTexture = makeSurfaceTexture(device, features);
      diagnostics.backend = device.type;
    },
    onLoad: () => {
      updateLayers();
      resolveReady();
    },
    onBeforeRender: () => {
      const now = performance.now();
      if (!document.hidden && isWeatherAnimating() && previousTime) {
        const elapsed = (now - previousTime) / 1000;
        time += elapsed;
        if (surfaceSettings.enabled && surfaceSettings.accumulate) {
          Object.assign(
            surfaceSettings,
            integrateSurfaceWeather(
              surfaceSettings,
              {
                rainfall: preset === 'rain' ? intensity * 0.12 : 0,
                snowfall: preset === 'snow' ? intensity * 0.06 : 0,
                evaporation: preset === 'rain' ? 0.004 : 0.025,
                snowmelt: preset === 'snow' ? 0.001 : preset === 'rain' ? 0.05 : 0.012
              },
              elapsed
            )
          );
        }
        if (fogEnabled && fogVariation > 0) fogTime += elapsed * fogSpeed;
      }
      previousTime = !document.hidden && isWeatherAnimating() ? now : 0;
      diagnostics.time = time;
      if (cloudsEnabled && playing && surfaceTexture) updateLayers(false);
    },
    onAfterRender: () => {
      diagnostics.frames++;
      parent.dispatchEvent(new Event('weather-frame'));
    },
    onError: error => {
      diagnostics.error ||= error.message;
      rejectReady(error);
    }
  });
  function getParticleCount(): number {
    return Math.round(intensity * 20000);
  }
  function isWeatherAnimating(): boolean {
    return (
      playing &&
      (cloudsEnabled ||
        (getParticleCount() > 0 && (preset === 'rain' || preset === 'snow')) ||
        (fogEnabled && fogVariation > 0 && fogSpeed > 0) ||
        (surfaceSettings.enabled && surfaceSettings.accumulate))
    );
  }
  function getPrecipitation(viewport: Viewport): PrecipitationProps {
    const target = viewport.projectPosition(
      viewport.unproject([viewport.width / 2, viewport.height / 2])
    );
    const center = getMeterOffsetPosition(viewport, CITY_ORIGIN, target);
    const angle = (windDirection * Math.PI) / 180;
    return {
      seed: 29,
      fallSpeed: preset === 'snow' ? 4 : 35,
      turbulence: preset === 'snow' ? 2 : 0,
      wind: [Math.sin(angle) * windSpeed, Math.cos(angle) * windSpeed],
      volumeSize: [1500, 1800, 450],
      volumeCenter: [center[0], center[1], 225]
    };
  }
  function getFog(): HeightFogProps {
    const angle = (windDirection * Math.PI) / 180;
    const daylight = getDaylight();
    const brightness = Math.max(0.15, daylight.intensity + daylight.diffuse.intensity);
    return {
      color: [0.53 * brightness, 0.61 * brightness, 0.67 * brightness],
      density: fogEnabled ? 3.912 / visibility : 0,
      baseHeight: 30,
      heightFalloff: 0.012,
      variation: fogVariation,
      wispScale: 140,
      // Integrate drift into this clock so changing speed does not jump the density field.
      velocity: [Math.sin(angle), Math.cos(angle), 0],
      evolutionSpeed: 0.06,
      time: fogTime
    };
  }
  function getSurfaceWeather(): SurfaceWeatherProps {
    return {
      wetness: surfaceSettings.enabled ? surfaceSettings.wetness : 0,
      snow: surfaceSettings.enabled ? surfaceSettings.snow : 0,
      puddles: surfaceSettings.puddles
    };
  }
  function getSkyLighting() {
    return getRiverfrontSkyLighting(hour, cloudsEnabled ? (preset === 'clear' ? 0.25 : 0.65) : 0);
  }
  function getDaylight() {
    return getSkyLighting().sunlight;
  }
  function getLighting(): LightingProps {
    return getSkyLighting().lights;
  }
  function updateLayers(redraw = true) {
    if (!surfaceTexture) return;
    const sun = getRiverfrontSun(hour);
    diagnostics.hour = hour;
    diagnostics.sunAltitude = sun.altitude;
    deck.setProps({
      _animate: isWeatherAnimating(),
      layers: [
        new SkyLayer({
          id: 'weather-sky',
          observer,
          timestamp: sun.timestamp,
          time,
          coordinateOrigin: CITY_ORIGIN,
          sun: {radiusPixels: 14, radiance: 8, color: [255, 220, 18, 255]},
          moon: {radiusPixels: 18},
          stars: sun.altitude < 0 ? {brightness: 2} : false,
          clouds: cloudsEnabled && {cover: preset === 'clear' ? 0.25 : 0.65, velocity: [14, 4]},
          atmosphere: {
            // Blend a little of the muted canvas background into the dark horizon.
            opacity: 0.78,
            sunIntensity: 10 * getDaylight().intensity,
            haze: preset === 'clear' ? 1 : 2,
            groundColor: features.find(feature => feature.kind === 'ground')!.color
          }
        }),
        new RiverDistrictLayer({
          id: 'district',
          features,
          lighting: getLighting,
          fog: getFog,
          surfaceWeather: getSurfaceWeather,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: CITY_ORIGIN
        }),
        new WeatherParticleLayer({
          id: 'weather',
          visible: preset === 'rain' || preset === 'snow',
          coordinateOrigin: CITY_ORIGIN,
          weather: preset === 'snow' ? 'snow' : 'rain',
          time: () => time,
          particleCount: getParticleCount(),
          precipitation: getPrecipitation,
          fog: getFog,
          widthPixels: preset === 'snow' ? 4 : 1.4,
          streakLength: preset === 'snow' ? 0 : 16,
          color: preset === 'snow' ? [0.96, 0.98, 1, 0.9] : [0.75, 0.85, 0.95, 0.65],
          surfaceTexture,
          surfaceBounds: SURFACE_BOUNDS
        })
      ]
    });
    if (redraw) deck.redraw('weather settings changed');
  }
  return {
    deck,
    ready,
    diagnostics,
    surfaceSettings,
    setHour(value: number) {
      hour = value;
      updateLayers();
    },
    setClouds(value: boolean) {
      cloudsEnabled = value;
      updateLayers();
    },
    centerView() {
      deck.setProps({initialViewState: {...initialViewState}});
    },
    lookAtBody(body: 'sun' | 'moon') {
      const getDirection = (value: number) => {
        if (body === 'sun') return getRiverfrontSun(value).direction;
        const moon = getMoonPosition(
          getRiverfrontSun(value).timestamp,
          observer.latitude,
          observer.longitude
        );
        return getSkyDirection(moon.altitude, moon.azimuth);
      };
      if (getDirection(hour)[2] <= 0)
        hour =
          Array.from({length: 48}, (_, index) => index / 2).find(
            value => getDirection(value)[2] > 0.08
          ) ?? DEFAULT_HOUR;
      const direction = getDirection(hour);
      const viewState = getSkyCameraState(
        {
          ...initialViewState,
          pitch: 90 + (Math.asin(direction[2]) * 180) / Math.PI,
          bearing: (Math.atan2(direction[0], direction[1]) * 180) / Math.PI
        },
        parent.clientWidth,
        parent.clientHeight
      );
      deck.setProps({initialViewState: viewState});
      updateLayers();
    },
    setSurfaceEnabled(value: boolean) {
      surfaceSettings.enabled = value;
      updateLayers();
    },
    setAccumulation(value: boolean) {
      surfaceSettings.accumulate = value;
      updateLayers();
    },
    setWetness(value: number) {
      surfaceSettings.wetness = value;
      deck.redraw('surface wetness');
    },
    setSnowCover(value: number) {
      surfaceSettings.snow = value;
      deck.redraw('snow cover');
    },
    setPuddles(value: number) {
      surfaceSettings.puddles = value;
      deck.redraw('puddles');
    },
    get surfaceTexture() {
      return surfaceTexture;
    },
    setProjection(value: 'map' | 'globe') {
      deck.setProps({
        views:
          value === 'globe'
            ? new _GlobeView({controller: true})
            : new MapView({controller: true, fovy: SKY_FIELD_OF_VIEW})
      });
    },
    setPreset(value: WeatherPreset) {
      preset = value;
      cloudsEnabled = value !== 'clear';
      updateLayers();
    },
    setIntensity(value: number) {
      intensity = value;
      updateLayers();
    },
    setWindSpeed(value: number) {
      windSpeed = value;
      deck.redraw('wind changed');
    },
    setWindDirection(value: number) {
      windDirection = value;
      deck.redraw('wind changed');
    },
    setVisibility(value: number) {
      visibility = value;
      updateLayers();
    },
    setFogEnabled(value: boolean) {
      fogEnabled = value;
      updateLayers();
    },
    setFogVariation(value: number) {
      fogVariation = value;
      updateLayers();
    },
    setFogSpeed(value: number) {
      fogSpeed = value;
      updateLayers();
    },
    setTime(value: number) {
      time = value;
      fogTime = value * fogSpeed;
      previousTime = 0;
      deck.redraw('weather time changed');
    },
    setPlaying(value: boolean) {
      playing = value;
      previousTime = 0;
      deck.setProps({_animate: isWeatherAnimating()});
    },
    reset() {
      surfaceSettings.wetness = 0;
      surfaceSettings.snow = 0;
      time = 0;
      fogTime = 0;
      previousTime = 0;
      deck.redraw('reset weather');
    },
    finalize() {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      document.removeEventListener('visibilitychange', resetFrameTime);
      deck.finalize();
      surfaceTexture?.destroy();
    }
  };
}

function makeSurfaceTexture(device: Device, features: CityFeature[]): Texture {
  const width = 256;
  const height = 384;
  const data = new Float32Array(width * height);
  const [west, south, east, north] = SURFACE_BOUNDS;
  // Conservative footprint rasterization keeps precipitation out of roofs and covered bridges.
  for (const feature of features) {
    const left = Math.max(
      0,
      Math.floor(((feature.center[0] - feature.size[0] / 2 - west) / (east - west)) * width)
    );
    const right = Math.min(
      width,
      Math.ceil(((feature.center[0] + feature.size[0] / 2 - west) / (east - west)) * width)
    );
    const bottom = Math.max(
      0,
      Math.floor(((feature.center[1] - feature.size[1] / 2 - south) / (north - south)) * height)
    );
    const top = Math.min(
      height,
      Math.ceil(((feature.center[1] + feature.size[1] / 2 - south) / (north - south)) * height)
    );
    for (let row = bottom; row < top; row++)
      for (let column = left; column < right; column++) {
        data[row * width + column] = Math.max(
          data[row * width + column],
          feature.center[2] + feature.size[2]
        );
      }
  }
  return device.createTexture({
    id: 'weather-surface-heights',
    width,
    height,
    format: 'r32float',
    data
  });
}
