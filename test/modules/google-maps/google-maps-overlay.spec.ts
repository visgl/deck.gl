// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements */
import {test, expect, vi} from 'vitest';

import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {log} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {equals} from '@math.gl/core';

import {
  addMap3DCameraChangeListener,
  captureMap3DWebGLContext,
  getScreenViewPropsFromMap3D,
  getViewPropsFromMap3D,
  installMap3DWebGLContextCapture,
  isMap3DElement
} from '../../../modules/google-maps/src/utils';
import * as mapsApi from './mock-maps-api';

globalThis.google = {maps: mapsApi};

const withDevice = props => ({device, ...props});

test('GoogleMapsOverlay#Map3D captures nested renderer canvas context', () => {
  const originalGetContext = HTMLCanvasElement.prototype.getContext;
  const gl = {canvas: null};
  HTMLCanvasElement.prototype.getContext = function getContext(this: HTMLCanvasElement) {
    gl.canvas = this;
    return gl;
  } as typeof HTMLCanvasElement.prototype.getContext;

  installMap3DWebGLContextCapture();

  const map = document.createElement('gmp-map-3d') as mapsApi.Map3DElement;
  const internalHost = document.createElement('gmp-internal-renderer');
  const shadowRoot = map.attachShadow({mode: 'open'});
  const internalRoot = internalHost.attachShadow({mode: 'open'});
  const canvas = document.createElement('canvas');
  shadowRoot.appendChild(internalHost);
  internalRoot.appendChild(canvas);

  canvas.getContext('webgl2');

  expect(captureMap3DWebGLContext(map), 'nested Map3D WebGL context is captured').toBe(gl);

  HTMLCanvasElement.prototype.getContext = originalGetContext;
});

test('GoogleMapsOverlay#constructor', () => {
  const map = new mapsApi.Map({
    width: 1,
    height: 1,
    longitude: 0,
    latitude: 0,
    zoom: 1
  });

  const overlay = new GoogleMapsOverlay({
    device,
    layers: []
  });

  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();
  expect(overlay.props.interleaved, 'interleaved defaults to true').toBeTruthy();
  expect(overlay.props.map3DDepthMode, 'Map3D depth mode defaults to screen').toBe('screen');
  expect(overlay.props.map3DFallbackMode, 'Map3D fallback mode defaults to geospatial').toBe(
    'geospatial'
  );

  overlay.setMap(map);
  expect(overlay._deck, 'Deck instance is the same').toBe(deck);

  overlay.setMap(null);
  expect(overlay._deck, 'Deck instance is not removed').toBe(deck);

  overlay.finalize();
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('GoogleMapsOverlay#interleaved prop', () => {
  const overlay = new GoogleMapsOverlay({
    device,
    interleaved: false,
    layers: []
  });

  expect(!overlay.props.interleaved, 'interleaved set to false').toBeTruthy();
});

test('GoogleMapsOverlay#Map3D camera view state', () => {
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30},
    range: 1200,
    heading: 123,
    tilt: 67,
    fov: 35
  });

  const {width, height, viewState} = getViewPropsFromMap3D(map);

  expect(isMap3DElement(map), 'Map3D element is recognized').toBeTruthy();
  expect(width, 'width is set').toBe(800);
  expect(height, 'height is set').toBe(400);
  expect(equals(viewState.longitude, -122.45), 'longitude is set').toBeTruthy();
  expect(equals(viewState.latitude, 37.78), 'latitude is set').toBeTruthy();
  expect(equals(viewState.bearing, 123), 'bearing is set').toBeTruthy();
  expect(equals(viewState.pitch, 67), 'pitch is set').toBeTruthy();
  expect(equals(viewState.position, [0, 0, 0]), 'deck viewport altitude stays stable').toBeTruthy();
  expect(equals(viewState.zoom, 14.997043852729847), 'range-derived zoom is set').toBeTruthy();
  expect(viewState.projectionMatrix, 'projection matrix is set').toBeTruthy();
});

test('GoogleMapsOverlay#Map3D screen fallback view state', () => {
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30}
  });

  const {width, height, viewState} = getScreenViewPropsFromMap3D(map);

  expect(width, 'width is set').toBe(800);
  expect(height, 'height is set').toBe(400);
  expect(equals(viewState.target, [400, 200, 0]), 'screen target is centered').toBeTruthy();
  expect(viewState.zoom, 'screen zoom is one pixel per unit').toBe(0);
});

test('GoogleMapsOverlay#Map3D cameraPosition zoom', () => {
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30},
    cameraPosition: {lat: 37.77, lng: -122.46, altitude: 600},
    range: 1200,
    heading: 123,
    tilt: 67,
    fov: 35
  });

  const {viewState} = getViewPropsFromMap3D(map);

  expect(
    equals(viewState.zoom, 14.715292534987455),
    'cameraPosition-derived zoom is set'
  ).toBeTruthy();
});

test('GoogleMapsOverlay#Map3D range zoom ignores camera altitude', () => {
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30},
    cameraPosition: {lat: 37.77, lng: -122.46, altitude: 600},
    range: 1200,
    heading: 123,
    tilt: 67,
    fov: 35
  });

  const {viewState} = getViewPropsFromMap3D(map, {zoomSource: 'range'});

  expect(equals(viewState.zoom, 14.997043852729847), 'range-derived zoom is set').toBeTruthy();

  map.cameraPosition = {lat: 37.77, lng: -122.46, altitude: 900};
  expect(
    equals(getViewPropsFromMap3D(map, {zoomSource: 'range'}).viewState.zoom, viewState.zoom),
    'range-derived zoom ignores camera altitude changes'
  ).toBeTruthy();
});

test('GoogleMapsOverlay#Map3D redraws continuously while camera is not steady', () => {
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    frameId++;
    frames.set(frameId, callback);
    return frameId;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) => {
    frames.delete(id);
  }) as typeof globalThis.cancelAnimationFrame;

  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30}
  });
  const callback = vi.fn();
  const listener = addMap3DCameraChangeListener(map, callback);

  map.dispatchEvent(new CustomEvent('gmp-steadychange', {detail: {isSteady: false}}));
  expect(callback, 'steady false redraws immediately').toHaveBeenCalledTimes(1);
  expect(frames.size, 'continuous redraw loop is scheduled').toBe(1);

  frames.get(1)?.(0);
  expect(callback, 'animation frame redraws while moving').toHaveBeenCalledTimes(2);
  expect(frames.has(2), 'continuous redraw loop schedules next frame').toBeTruthy();

  map.dispatchEvent(new CustomEvent('gmp-steadychange', {detail: {isSteady: true}}));
  expect(callback, 'steady true redraws final pose').toHaveBeenCalledTimes(3);
  expect(frames.has(2), 'continuous redraw loop is cancelled').toBeFalsy();

  listener.remove();
  globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
});

test('GoogleMapsOverlay#Map3D fallback waits for steady camera before redraw', () => {
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30}
  });
  const callback = vi.fn();
  const listener = addMap3DCameraChangeListener(map, callback, {redrawWhileMoving: false});

  map.dispatchEvent(new CustomEvent('gmp-steadychange', {detail: {isSteady: false}}));
  expect(callback, 'steady false does not redraw fallback immediately').toHaveBeenCalledTimes(0);

  map.dispatchEvent(new Event('gmp-centerchange'));
  expect(callback, 'camera changes are skipped while fallback is moving').toHaveBeenCalledTimes(0);

  map.dispatchEvent(new CustomEvent('gmp-steadychange', {detail: {isSteady: true}}));
  expect(callback, 'steady true redraws fallback final pose').toHaveBeenCalledTimes(1);

  map.dispatchEvent(new Event('gmp-centerchange'));
  expect(callback, 'camera changes redraw fallback after camera is steady').toHaveBeenCalledTimes(
    2
  );

  listener.remove();
});

test('GoogleMapsOverlay#Map3D lifecycle without captured internals', () => {
  const warnSpy = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30},
    range: 1200,
    heading: 123,
    tilt: 67,
    fov: 35
  });
  const overlay = new GoogleMapsOverlay({
    device,
    layers: []
  });

  overlay.setMap(map);
  expect(
    warnSpy.mock.calls.some(call => String(call[0]).includes('could not capture the Map3D WebGL')),
    'missing Map3D internals warns clearly'
  ).toBeTruthy();
  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._deck.props.viewState.longitude, 'Map3D longitude is set').toBe(-122.45);

  overlay.setMap(null);
  overlay.finalize();
  warnSpy.mockRestore();
});

test('GoogleMapsOverlay#Map3D mesh depth mode warns without captured internals', () => {
  const warnSpy = vi.spyOn(log, 'warn').mockReturnValue(() => {});
  const map = new mapsApi.Map3DElement({
    width: 800,
    height: 400,
    center: {lat: 37.78, lng: -122.45, altitude: 30},
    range: 1200,
    heading: 123,
    tilt: 67,
    fov: 35
  });
  const overlay = new GoogleMapsOverlay({
    device,
    layers: [],
    map3DDepthMode: 'mesh'
  });

  overlay.setMap(map);
  expect(overlay.props.map3DDepthMode, 'Map3D depth mode is set').toBe('mesh');
  expect(
    warnSpy.mock.calls.some(call => String(call[0]).includes('Mesh-depth mode was requested')),
    'mesh depth fallback warns clearly'
  ).toBeTruthy();

  overlay.finalize();
  warnSpy.mockRestore();
});

test('GoogleMapsOverlay#useDevicePixels prop', () => {
  const map = new mapsApi.Map({width: 1, height: 1, longitude: 0, latitude: 0, zoom: 1});

  let overlay = new GoogleMapsOverlay(withDevice({useDevicePixels: 3, layers: []}));
  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  expect(
    overlay._deck.props.useDevicePixels,
    'useDevicePixels is forced to true in interleaved mode'
  ).toBeTruthy();

  overlay = new GoogleMapsOverlay(withDevice({interleaved: false, useDevicePixels: 3, layers: []}));
  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  expect(
    overlay._deck.props.useDevicePixels,
    'useDevicePixels is overridden when not interleaved'
  ).toBe(3);
});

test('GoogleMapsOverlay#raster lifecycle', () => {
  const map = new mapsApi.Map({
    width: 1,
    height: 1,
    longitude: 0,
    latitude: 0,
    zoom: 1,
    renderingType: mapsApi.RenderingType.RASTER
  });

  const overlay = new GoogleMapsOverlay({
    device,
    layers: []
  });

  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  expect(overlay._overlay.onAdd, 'onAdd lifecycle function is registered').toBeTruthy();
  expect(overlay._overlay.draw, 'draw lifecycle function is registered').toBeTruthy();
  expect(overlay._overlay.onRemove, 'onRemove lifecycle function is registered').toBeTruthy();
  overlay.finalize();
});

for (const interleaved of [true, false]) {
  test(`GoogleMapsOverlay#vector lifecycle (interleaved:${interleaved}`, () => {
    const map = new mapsApi.Map({
      width: 1,
      height: 1,
      longitude: 0,
      latitude: 0,
      zoom: 1,
      renderingType: mapsApi.RenderingType.VECTOR
    });

    const overlay = new GoogleMapsOverlay({
      device,
      interleaved,
      layers: []
    });

    overlay.setMap(map);
    map.emit({type: 'renderingtype_changed'});
    expect(overlay._overlay.onAdd, 'onAdd lifecycle function is registered').toBeTruthy();
    expect(
      overlay._overlay.onContextLost,
      'onContextLost lifecycle function is registered'
    ).toBeTruthy();
    expect(
      overlay._overlay.onContextRestored,
      'onContextRestored lifecycle function is registered'
    ).toBeTruthy();
    expect(overlay._overlay.onDraw, 'onDraw lifecycle function is registered').toBeTruthy();
    expect(overlay._overlay.onRemove, 'onRemove lifecycle function is registered').toBeTruthy();

    // Dual overlay setup: positioning overlay + WebGL overlay
    expect(overlay._positioningOverlay, 'Positioning overlay is created').toBeTruthy();
    expect(overlay._positioningOverlay.onAdd, 'Positioning overlay has onAdd').toBeTruthy();
    expect(overlay._positioningOverlay.draw, 'Positioning overlay has draw').toBeTruthy();
    expect(overlay._positioningOverlay.onRemove, 'Positioning overlay has onRemove').toBeTruthy();
    expect(overlay._overlay, 'WebGL overlay is created').toBeTruthy();
    expect(overlay._overlay.onDraw, 'WebGL overlay has onDraw').toBeTruthy();

    // Positioning container should be created in the DOM
    const container = map.getDiv().querySelector('#deck-gl-google-maps-container');
    expect(container, 'Positioning container is created in DOM').toBeTruthy();

    expect(overlay._overlay._draws, 'Map not yet drawn').toBeFalsy();
    overlay.setMap(null);
    if (interleaved) {
      expect(overlay._overlay._draws, 'Redraw requested when map removed').toBeTruthy();
    } else {
      expect(overlay._overlay._draws, 'Redraw not requested when map removed').toBeFalsy();
    }

    overlay.finalize();
  });
}

test('GoogleMapsOverlay#style', () => {
  const map = new mapsApi.Map({
    width: 1,
    height: 1,
    longitude: 0,
    latitude: 0,
    zoom: 1
  });

  const overlay = new GoogleMapsOverlay({
    device,
    style: {zIndex: 10},
    layers: []
  });

  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  const deck = overlay._deck;

  expect(deck.props.parent.style.zIndex, 'parent zIndex is set').toBe('10');
  expect(deck.canvas?.style.zIndex ?? '', 'canvas zIndex is not set').toBe('');

  if (deck.canvas?.parentElement) {
    overlay.setProps({
      style: {zIndex: 5}
    });
    expect(deck.props.parent.style.zIndex, 'parent zIndex is set').toBe('5');
    expect(deck.canvas.style.zIndex, 'canvas zIndex is not set').toBe('');
  }

  overlay.finalize();
});

function drawPickTest(renderingType) {
  test(`GoogleMapsOverlay#draw, pick ${renderingType}`, () => {
    const map = new mapsApi.Map({
      width: 800,
      height: 400,
      longitude: -122.45,
      latitude: 37.78,
      zoom: 13,
      renderingType
    });

    const overlay = new GoogleMapsOverlay({
      device,
      layers: [
        new ScatterplotLayer({
          data: [{position: [0, 0]}, {position: [0, 0]}],
          radiusMinPixels: 100,
          pickable: true
        })
      ]
    });

    overlay.setMap(map);
    map.emit({type: 'renderingtype_changed'});
    const deck = overlay._deck;

    expect(deck.props.viewState, 'Deck does not have view state').toBeFalsy();

    map.draw();
    const {viewState, width, height} = deck.props;
    expect(equals(viewState.longitude, map.opts.longitude), 'longitude is set').toBeTruthy();
    expect(equals(viewState.latitude, map.opts.latitude), 'latitude is set').toBeTruthy();
    expect(equals(viewState.zoom, map.opts.zoom - 1), 'zoom is set').toBeTruthy();
    if (renderingType === mapsApi.RenderingType.RASTER) {
      expect(equals(width, map.opts.width), 'width is set').toBeTruthy();
      expect(equals(height, map.opts.height), 'height is set').toBeTruthy();
    } else {
      expect(equals(width, null), 'width is not set').toBeTruthy();
      expect(equals(height, null), 'height is not set').toBeTruthy();
    }

    // Removed as part of https://github.com/visgl/deck.gl/pull/7723
    // TODO: reintroduce when the mock context has `deck.isInitialized` (required for event forwarding)
    /*
    const pointerMoveSpy = vi.spyOn(overlay._deck, '_onPointerMove');
    map.emit({type: 'mousemove', pixel: [0, 0]});
    expect(pointerMoveSpy, 'pointer move event is handled').toHaveBeenCalledTimes(1);

    map.emit({type: 'mouseout', pixel: [0, 0]});
    expect(pointerMoveSpy, 'pointer leave event is handled').toHaveBeenCalledTimes(2);
    pointerMoveSpy.mockClear();
    */

    overlay.finalize();
  });
}
for (const renderingType of [mapsApi.RenderingType.RASTER, mapsApi.RenderingType.VECTOR]) {
  drawPickTest(renderingType);
}
