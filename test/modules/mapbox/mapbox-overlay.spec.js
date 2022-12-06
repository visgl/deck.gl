import test from 'tape-promise/tape';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import GL from '@luma.gl/constants';

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
    layers: [new ScatterplotLayer({id: 'poi'})],
    parameters: {
      depthMask: false, // User defined parameters should override defaults.
      cull: true // Expected to merge in.
    },
    useDevicePixels: 1
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');

  map.on('render', () => {
    const VIEW_STATE = {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 14,
      bearing: 0,
      pitch: 0,
      padding: {left: 0, right: 0, top: 0, bottom: 0},
      repeat: true
    };
    t.ok(objectEqual(overlay._deck.props.viewState, VIEW_STATE), 'View state is set correcly');
    t.ok(objectEqual(overlay._props.viewState, VIEW_STATE), 'View state is in sync');

    const PARAMETERS = {
      depthMask: false,
      depthTest: true,
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthFunc: GL.LEQUAL,
      blendEquation: GL.FUNC_ADD,
      cull: true
    };
    t.ok(objectEqual(overlay._deck.props.parameters, PARAMETERS), 'Parameters are set correctly');
    t.ok(objectEqual(overlay._props.parameters, PARAMETERS), 'Parameters are in sync');

    t.equals(overlay._deck.props.useDevicePixels, 1, 'useDevicePixels is set correctly');
    t.equals(overlay._props.useDevicePixels, 1, 'useDevicePixels are in sync');

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

test('MapboxOverlay#interleavedNoInitialLayers', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');

  map.on('render', () => {
    t.equals(overlay._deck.props.layers.length, 0, 'Layers are empty');
    t.equals(overlay._props.layers.length, 0, 'Layers are in sync');

    const PARAMETERS = {
      depthMask: true,
      depthTest: true,
      blend: true,
      blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
      polygonOffsetFill: true,
      depthFunc: GL.LEQUAL,
      blendEquation: GL.FUNC_ADD
    };
    t.ok(objectEqual(overlay._deck.props.parameters, PARAMETERS), 'Parameters are set correctly');
    t.ok(objectEqual(overlay._props.parameters, PARAMETERS), 'Parameters are in sync');

    t.equals(overlay._deck.props.useDevicePixels, true, 'useDevicePixels is set correctly');
    t.equals(overlay._props.useDevicePixels, true, 'useDevicePixels are in sync');

    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'cities'})]
    });
    t.ok(map.getLayer('cities'), 'MapboxLayer is added');

    t.ok(
      objectEqual(overlay._deck.props.parameters, PARAMETERS),
      'Parameters are set correctly after first layer'
    );
    t.ok(
      objectEqual(overlay._props.parameters, PARAMETERS),
      'Parameters are still in sync after first layer'
    );

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});
