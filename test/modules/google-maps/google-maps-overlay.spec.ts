// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements */
import {test, expect} from 'vitest';

import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {ScatterplotLayer} from '@deck.gl/layers';
import {makeSpy} from '@probe.gl/test-utils';
import {equals} from '@math.gl/core';

import * as mapsApi from './mock-maps-api';

globalThis.google = {maps: mapsApi};

test('GoogleMapsOverlay#constructor', () => {
  const map = new mapsApi.Map({
    width: 1,
    height: 1,
    longitude: 0,
    latitude: 0,
    zoom: 1
  });

  const overlay = new GoogleMapsOverlay({
    layers: []
  });

  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();
  expect(overlay.props.interleaved, 'interleaved defaults to true').toBeTruthy();

  overlay.setMap(map);
  expect(overlay._deck, 'Deck instance is the same').toBe(deck);

  overlay.setMap(null);
  expect(overlay._deck, 'Deck instance is not removed').toBe(deck);

  overlay.finalize();
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('GoogleMapsOverlay#interleaved prop', () => {
  const overlay = new GoogleMapsOverlay({
    interleaved: false,
    layers: []
  });

  expect(!overlay.props.interleaved, 'interleaved set to false').toBeTruthy();
});

test('GoogleMapsOverlay#useDevicePixels prop', () => {
  const map = new mapsApi.Map({width: 1, height: 1, longitude: 0, latitude: 0, zoom: 1});

  let overlay = new GoogleMapsOverlay({useDevicePixels: 3, layers: []});
  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
  expect(
    overlay._deck.props.useDevicePixels,
    'useDevicePixels is forced to true in interleaved mode'
  ).toBeTruthy();

  overlay = new GoogleMapsOverlay({interleaved: false, useDevicePixels: 3, layers: []});
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
    style: {zIndex: 10},
    layers: [],
    onLoad: () => {
      const deck = overlay._deck;

      expect(deck.props.parent.style.zIndex, 'parent zIndex is set').toBe('10');
      expect(deck.canvas.style.zIndex, 'canvas zIndex is not set').toBe('');

      overlay.setProps({
        style: {zIndex: 5}
      });
      expect(deck.props.parent.style.zIndex, 'parent zIndex is set').toBe('5');
      expect(deck.canvas.style.zIndex, 'canvas zIndex is not set').toBe('');

      overlay.finalize();
    }
  });

  overlay.setMap(map);
  map.emit({type: 'renderingtype_changed'});
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
    const pointerMoveSpy = makeSpy(overlay._deck, '_onPointerMove');
    map.emit({type: 'mousemove', pixel: [0, 0]});
    expect(pointerMoveSpy.callCount, 'pointer move event is handled').toBe(1);

    map.emit({type: 'mouseout', pixel: [0, 0]});
    expect(pointerMoveSpy.callCount, 'pointer leave event is handled').toBe(2);
    pointerMoveSpy.reset();
    */

    overlay.finalize();
  });
}
for (const renderingType of [mapsApi.RenderingType.RASTER, mapsApi.RenderingType.VECTOR]) {
  drawPickTest(renderingType);
}
