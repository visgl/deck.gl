/* eslint-disable max-statements */
import test from 'tape-catch';

import {GoogleMapsOverlay} from '@deck.gl/google-maps';
import {ScatterplotLayer} from '@deck.gl/layers';
import {makeSpy} from '@probe.gl/test-utils';
import {equals} from 'math.gl';

import * as mapsApi from './mock-maps-api';

/* global global, window */
const _global = typeof global === 'undefined' ? window : global;
_global.google = {maps: mapsApi};

test('GoogleMapsOverlay#constructor', t => {
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
  const deck = overlay._deck;
  t.ok(deck, 'Deck instance is created');

  overlay.setMap(map);
  t.is(overlay._deck, deck, 'Deck instance is the same');

  overlay.setMap(null);
  t.is(overlay._deck, deck, 'Deck instance is not removed');

  overlay.finalize();
  t.notOk(overlay._deck, 'Deck instance is finalized');

  t.end();
});

test('GoogleMapsOverlay#draw, pick', t => {
  const map = new mapsApi.Map({
    width: 800,
    height: 400,
    longitude: -122.45,
    latitude: 37.78,
    zoom: 13
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
  const deck = overlay._deck;

  t.notOk(deck.props.viewState, 'Deck does not have view state');

  map.draw();
  const {viewState, width, height} = deck.props;
  t.ok(equals(viewState.longitude, map.opts.longitude), 'longitude is set');
  t.ok(equals(viewState.latitude, map.opts.latitude), 'latitude is set');
  t.ok(equals(viewState.zoom, map.opts.zoom - 1), 'zoom is set');
  t.ok(equals(width, map.opts.width), 'width is set');
  t.ok(equals(height, map.opts.height), 'height is set');
  t.notOk(deck.props.layerFilter, 'layerFilter is empty');

  map.setTilt(45);
  map.draw();
  t.ok(deck.props.layerFilter, 'layerFilter should be set to block drawing');

  const pointerMoveSpy = makeSpy(overlay._deck, '_onPointerMove');
  map.emit({type: 'mousemove', pixel: [0, 0]});
  t.is(pointerMoveSpy.callCount, 1, 'pointer move event is handled');

  map.emit({type: 'mouseout', pixel: [0, 0]});
  t.is(pointerMoveSpy.callCount, 2, 'pointer leave event is handled');
  pointerMoveSpy.reset();

  overlay.finalize();

  t.end();
});
