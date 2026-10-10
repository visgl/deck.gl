// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {COORDINATE_SYSTEM, Deck, MapView, type MapViewState} from '@deck.gl/core';
import {SunLayer, MoonLayer, CloudLayer, AtmosphereLayer} from '@deck.gl-community/gpu-layers';
import type {CloudProps, AtmosphereProps} from '@luma.gl/shadertools';
import {getMoonPosition, getMoonIllumination, getSkyDirection} from '@math.gl/sun';
import {getDeckExampleProps, type DeckExampleDeviceOptions} from '../deck-example-device';
import {CITY_ORIGIN, makeCityFeatures} from '../river-district-data';
import {RiverfrontShadowEffect, type ShadowSettings} from './shadow-effect';
import {ShadowDistrictLayer} from './shadow-layer';
import {DEFAULT_HOUR, FIRST_HOUR, LAST_HOUR, getRiverfrontSun} from './sun';
import {getSkyCameraState, SKY_FIELD_OF_VIEW} from './sky-camera';
import {getRiverfrontSkyLighting} from '../riverfront-sky-lighting';

export function createRiverfrontSoftShadowScene(
  parent: HTMLDivElement,
  options: DeckExampleDeviceOptions = {}
) {
  const features = makeCityFeatures();
  for (const feature of features) {
    if (feature.kind === 'ground') feature.color = [0.72, 0.73, 0.69];
    if (feature.kind === 'building') feature.color = [0.85, 0.82, 0.75];
    if (feature.kind === 'water') feature.color = [0.14, 0.4, 0.47];
  }
  const settings: ShadowSettings = {
    hour: DEFAULT_HOUR,
    animated: true,
    hoursPerSecond: 0.8,
    enabled: true,
    softness: 0.018,
    quality: 'balanced'
  };
  const diagnostics = {frames: 0, backend: '', error: '', finalized: false};
  let resolveReady: () => void;
  let rejectReady: (error: Error) => void;
  const ready = new Promise<void>((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });
  const shadowEffect = new RiverfrontShadowEffect(features, settings);
  const sky = {sun: true, moon: true};
  const atmosphereSettings = {enabled: true, haze: 1};
  const cloudSettings = {
    enabled: true,
    shadows: true,
    animated: true,
    cover: 0.4,
    windSpeed: 18,
    windDirection: 75,
    time: 0
  };
  function shouldAnimate() {
    return settings.animated || (cloudSettings.enabled && cloudSettings.animated);
  }
  function getMoon(hour: number) {
    const date = new Date(getRiverfrontSun(hour).timestamp);
    const position = getMoonPosition(date, CITY_ORIGIN[1], CITY_ORIGIN[0]);
    const illumination = getMoonIllumination(date);
    const altitude = position.altitude;
    const direction = getSkyDirection(altitude, position.azimuth);
    const limbAngle =
      Math.PI / 2 +
      illumination.angle -
      position.parallacticAngle -
      (illumination.phase > 0.5 ? Math.PI : 0);
    return {direction, phase: illumination.phase, limbAngle, altitude};
  }
  function getClouds(): CloudProps {
    const lighting = getRiverfrontSkyLighting(settings.hour);
    const sun = lighting.sun;
    const daylight = sun.direction[2] > 0;
    return {
      cover: cloudSettings.enabled ? cloudSettings.cover : 0,
      time: cloudSettings.time,
      velocity: [
        Math.sin((cloudSettings.windDirection * Math.PI) / 180) * cloudSettings.windSpeed,
        Math.cos((cloudSettings.windDirection * Math.PI) / 180) * cloudSettings.windSpeed
      ],
      sunDirection: daylight ? [...sun.direction] : [...lighting.moonDirection],
      sunColor: daylight
        ? lighting.sunlight.color
        : [
            lighting.moonColor[0] * lighting.moonIntensity,
            lighting.moonColor[1] * lighting.moonIntensity,
            lighting.moonColor[2] * lighting.moonIntensity
          ]
    };
  }
  function getAtmosphere(): AtmosphereProps {
    return {
      enabled: atmosphereSettings.enabled ? 1 : 0,
      sunDirection: [...getRiverfrontSun(settings.hour).direction],
      haze: atmosphereSettings.haze,
      sunIntensity: 10 * getRiverfrontSkyLighting(settings.hour).sunlight.intensity,
      groundColor: features.find(feature => feature.kind === 'ground')!.color
    };
  }
  function getLayers() {
    const sun = getRiverfrontSun(settings.hour);
    const moon = getMoon(settings.hour);
    return [
      new AtmosphereLayer({
        id: 'riverfront-atmosphere',
        coordinateOrigin: CITY_ORIGIN,
        ...getAtmosphere(),
        visible: atmosphereSettings.enabled
      }),
      new SunLayer({
        id: 'riverfront-sun',
        direction: sun.direction,
        coordinateOrigin: CITY_ORIGIN,
        color: [sun.color[0], sun.color[1], sun.color[2], 255],
        radiusPixels: 14,
        visible: sky.sun
      }),
      new MoonLayer({
        id: 'riverfront-moon',
        direction: moon.direction,
        coordinateOrigin: CITY_ORIGIN,
        phase: moon.phase,
        limbAngle: moon.limbAngle,
        radiusPixels: 18,
        visible: sky.moon
      }),
      new CloudLayer({
        id: 'riverfront-clouds',
        coordinateOrigin: CITY_ORIGIN,
        visible: cloudSettings.enabled,
        ...getClouds()
      }),
      new ShadowDistrictLayer({
        id: 'riverfront-shadow-district',
        data: features,
        features,
        shadowEffect,
        clouds: () => ({...getClouds(), cover: cloudSettings.shadows ? getClouds().cover : 0}),
        atmosphere: getAtmosphere,
        pickable: true,
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: CITY_ORIGIN
      })
    ];
  }
  let lastFrameTime = 0;
  let viewState: MapViewState = getSkyCameraState(
    {
      longitude: CITY_ORIGIN[0],
      latitude: CITY_ORIGIN[1],
      zoom: 15,
      pitch: 80,
      bearing:
        (Math.atan2(
          getRiverfrontSun(DEFAULT_HOUR).direction[0],
          getRiverfrontSun(DEFAULT_HOUR).direction[1]
        ) *
          180) /
          Math.PI -
        12
    },
    parent.clientWidth,
    parent.clientHeight
  );
  const initialViewState = {...viewState};
  const deck = new Deck<MapView>({
    parent,
    ...getDeckExampleProps(options),
    views: new MapView({id: 'riverfront-shadows', fovy: SKY_FIELD_OF_VIEW, controller: true}),
    viewState,
    onViewStateChange: ({viewState: nextViewState}) => {
      viewState = getSkyCameraState(nextViewState, parent.clientWidth, parent.clientHeight);
      deck.setProps({viewState});
    },
    onResize: ({width, height}) => {
      viewState = getSkyCameraState(viewState, width, height);
      deck.setProps({viewState});
    },
    effects: [shadowEffect],
    layers: getLayers(),
    _animate: true,
    onDeviceInitialized: device => {
      diagnostics.backend = device.type;
    },
    onLoad: () => resolveReady(),
    onBeforeRender: () => {
      const now = performance.now();
      if (settings.animated && lastFrameTime) {
        settings.hour =
          FIRST_HOUR +
          ((settings.hour - FIRST_HOUR + ((now - lastFrameTime) / 1000) * settings.hoursPerSecond) %
            (LAST_HOUR - FIRST_HOUR));
      }
      if (lastFrameTime && cloudSettings.enabled && cloudSettings.animated) {
        cloudSettings.time += Math.min(now - lastFrameTime, 1000) / 1000;
      }
      lastFrameTime = now;
      deck.setProps({layers: getLayers()});
    },
    onAfterRender: () => {
      diagnostics.frames++;
      parent.dispatchEvent(new Event('sun-frame'));
    },
    onError: error => {
      diagnostics.error ||= error.message;
      rejectReady(error);
    },
    getTooltip: info => info.object?.name ?? null
  });
  return {
    deck,
    settings,
    sky,
    get viewState() {
      return viewState;
    },
    cloudSettings,
    atmosphereSettings,
    shadowEffect,
    diagnostics,
    ready,
    get moon() {
      return getMoon(settings.hour);
    },
    setClouds(enabled: boolean): void {
      cloudSettings.enabled = enabled;
      lastFrameTime = 0;
      deck.setProps({_animate: shouldAnimate(), layers: getLayers()});
      deck.redraw('cloud toggle');
    },
    setCloudAnimated(enabled: boolean): void {
      cloudSettings.animated = enabled;
      lastFrameTime = 0;
      deck.setProps({_animate: shouldAnimate()});
      deck.redraw('cloud animation');
    },
    setCloudShadows(enabled: boolean): void {
      cloudSettings.shadows = enabled;
      deck.redraw('cloud shadows');
    },
    setAtmosphere(enabled: boolean): void {
      atmosphereSettings.enabled = enabled;
      deck.setProps({layers: getLayers()});
      deck.redraw('atmosphere');
    },
    setHaze(value: number): void {
      atmosphereSettings.haze = value;
      deck.setProps({layers: getLayers()});
      deck.redraw('atmospheric haze');
    },
    setCloudTime(value: number): void {
      cloudSettings.time = value;
      lastFrameTime = 0;
      deck.setProps({layers: getLayers()});
      deck.redraw('cloud time');
    },
    setCloudCover(value: number): void {
      cloudSettings.cover = value;
      deck.redraw('cloud cover');
    },
    setWindSpeed(value: number): void {
      cloudSettings.windSpeed = value;
      deck.redraw('cloud wind');
    },
    setWindDirection(value: number): void {
      cloudSettings.windDirection = value;
      deck.redraw('cloud wind direction');
    },
    setSkyBody(body: 'sun' | 'moon', visible: boolean): void {
      sky[body] = visible;
      deck.setProps({layers: getLayers()});
    },
    centerView(): void {
      viewState = getSkyCameraState(initialViewState, parent.clientWidth, parent.clientHeight);
      deck.setProps({viewState});
      deck.redraw('center riverfront');
    },
    lookAtSkyBody(body: 'sun' | 'moon'): void {
      let hour = settings.hour;
      if (body === 'sun' && getRiverfrontSun(hour).direction[2] <= 0) hour = DEFAULT_HOUR;
      if (body === 'moon' && getMoon(hour).direction[2] <= 0) {
        hour =
          Array.from({length: 48}, (_, index) => index / 2).find(value => {
            const altitude = (getMoon(value).altitude * 180) / Math.PI;
            return altitude > 4 && altitude < 15;
          }) ?? settings.hour;
      }
      settings.hour = hour;
      settings.animated = false;
      lastFrameTime = 0;
      const direction = body === 'sun' ? getRiverfrontSun(hour).direction : getMoon(hour).direction;
      viewState = getSkyCameraState(
        {
          longitude: CITY_ORIGIN[0],
          latitude: CITY_ORIGIN[1],
          zoom: 15,
          pitch: 90 + (Math.asin(direction[2]) * 180) / Math.PI,
          bearing: (Math.atan2(direction[0], direction[1]) * 180) / Math.PI
        },
        parent.clientWidth,
        parent.clientHeight
      );
      deck.setProps({_animate: shouldAnimate(), layers: getLayers(), viewState});
      deck.redraw('sky body view');
    },
    get sun() {
      return getRiverfrontSun(settings.hour);
    },
    setHour(hour: number): void {
      settings.hour = Math.max(FIRST_HOUR, Math.min(LAST_HOUR, hour));
      deck.redraw('sun time');
    },
    setAnimated(enabled: boolean): void {
      settings.animated = enabled;
      lastFrameTime = 0;
      deck.setProps({_animate: shouldAnimate()});
      deck.redraw('sun animation');
    },
    setShadows(enabled: boolean): void {
      settings.enabled = enabled;
      deck.redraw('shadow toggle');
    },
    setSoftness(value: number): void {
      settings.softness = value;
      deck.redraw('shadow softness');
    },
    setSpeed(value: number): void {
      settings.hoursPerSecond = value;
    },
    setQuality(value: ShadowSettings['quality']): void {
      settings.quality = value;
      deck.redraw('shadow quality');
    },
    finalize(): void {
      if (diagnostics.finalized) return;
      diagnostics.finalized = true;
      deck.finalize();
    }
  };
}
