import test from 'tape-promise/tape';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';

import {objectEqual} from './mapbox-layer.spec';
import MockMapboxMap from './mapbox-gl-mock/map';

test('MapboxOverlay#overlaid', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer()]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  t.ok(deck, 'Deck instance is created');

  t.ok(
    objectEqual(deck.props.viewState, {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 14,
      bearing: 0,
      pitch: 0,
      padding: {left: 0, right: 0, top: 0, bottom: 0},
      repeat: true
    }),
    'View state is set correctly'
  );

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  map.on('render', () => {
    t.ok(
      objectEqual(deck.props.viewState, {
        longitude: 0.45,
        latitude: 51.47,
        zoom: 4,
        bearing: 0,
        pitch: 0,
        padding: {left: 0, right: 0, top: 0, bottom: 0},
        repeat: true
      }),
      'View state is updated'
    );

    map.removeControl(overlay);

    t.notOk(overlay._deck, 'Deck instance is finalized');

    t.end();
  });
});

test('MapboxOverlay#interleaved', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [new ScatterplotLayer({id: 'poi'})]
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');

  map.on('render', () => {
    t.ok(
      objectEqual(overlay._deck.props.viewState, {
        longitude: -122.45,
        latitude: 37.78,
        zoom: 14,
        bearing: 0,
        pitch: 0,
        padding: {left: 0, right: 0, top: 0, bottom: 0},
        repeat: true
      }),
      'View state is set correcly'
    );

    t.ok(map.getLayer('poi'), 'MapboxLayer is added');

    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'cities'})]
    });
    t.notOk(map.getLayer('poi'), 'MapboxLayer is removed');
    t.ok(map.getLayer('cities'), 'MapboxLayer is added');

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});
