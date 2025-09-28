// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {_GlobeView as GlobeView, MapView} from '@deck.gl/core';

import {objectEqual} from './mapbox-layer.spec';
import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS} from './fixtures';

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

class TestScatterplotLayer extends ScatterplotLayer {
  draw(params) {
    super.draw(params);
    this.props.onAfterRedraw({
      viewport: this.context.viewport,
      layer: this
    });
  }
}
TestScatterplotLayer.layerName = 'TestScatterplotLayer';

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
  t.false('viewState' in overlay._props, 'Overlay viewState is not set');

  t.true(deck.props.useDevicePixels === true, 'useDevicePixels is set correctly');
  t.false('useDevicePixels' in overlay._props, 'Overlay useDevicePixels is not set');

  t.ok(objectEqual(deck.props.parameters, {}), 'Parameters are empty');
  t.false('parameters' in overlay._props, 'Overlay parameters arent set');

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  map.once('render', () => {
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

test('MapboxOverlay#overlaidNoIntitalLayers', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({});

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

  t.true(deck.props.useDevicePixels === true, 'useDevicePixels is set correctly');
  t.false('useDevicePixels' in overlay._props, 'Overlay useDevicePixels is not set');

  t.is(deck.props.layers.length, 0, 'Layers are empty');
  t.false('layers' in overlay._props, 'Overlay layers arent set');

  t.ok(objectEqual(deck.props.parameters, {}), 'Parameters are empty');
  t.false('parameters' in overlay._props, 'Overlay parameters arent set');

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  map.once('render', () => {
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

    t.ok(objectEqual(deck.props.parameters, {}), 'Parameters are empty');
    t.false('parameters' in overlay._props, 'Overlay parameters arent set');

    map.removeControl(overlay);

    t.notOk(overlay._deck, 'Deck instance is finalized');

    t.end();
  });
});

test('MapboxOverlay#interleaved', t => {
  let drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push(layer.id);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [
      new TestScatterplotLayer({id: 'poi', onAfterRedraw: onRedrawLayer}),
      new TestScatterplotLayer({id: 'poi2', onAfterRedraw: onRedrawLayer})
    ],
    layerFilter: ({layer}) => layer.id === 'poi',
    parameters: {
      depthWriteEnabled: false,
      cullMode: 'back'
    },
    useDevicePixels: 1
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');

  map.once('render', async () => {
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
    t.false('viewState' in overlay._props, 'Overlay viewState arent set');

    t.ok(
      objectEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Parameters are set correctly'
    );
    t.ok(
      objectEqual(overlay._props.parameters, {
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Overlay parameters are intact'
    );

    t.is(overlay._deck.props.useDevicePixels, 1, 'useDevicePixels is set correctly');
    t.is(overlay._props.useDevicePixels, 1, 'useDevicePixels are intact');

    await sleep(100);
    t.ok(map.getLayer('poi'), 'MapboxLayer is added');
    t.ok(map.getLayer('poi2'), 'MapboxLayer is added');
    t.deepEqual(drawLog, ['poi'], 'layers correctly filtered');
    drawLog = [];

    overlay.setProps({
      layers: [new TestScatterplotLayer({id: 'cities', onAfterRedraw: onRedrawLayer})],
      layerFilter: undefined
    });

    await sleep(100);
    t.notOk(map.getLayer('poi'), 'MapboxLayer is removed');
    t.ok(map.getLayer('cities'), 'MapboxLayer is added');
    t.deepEqual(drawLog, ['cities'], 'layers correctly filtered');

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});

test('MapboxOverlay#interleaved#remove and add', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [new ScatterplotLayer({id: 'poi'})],
    parameters: {
      depthWriteEnabled: false,
      cullMode: 'back'
    },
    useDevicePixels: 1
  });

  map.addControl(overlay);
  let deck = overlay._deck;
  t.ok(deck && deck.animationLoop, 'Deck instance is created');
  map.removeControl(overlay);
  t.notOk(deck.animationLoop, 'Deck instance is finalized');

  map.addControl(overlay);
  deck = overlay._deck;
  t.ok(deck && deck.animationLoop, 'Deck instance is created');
  map.removeControl(overlay);
  t.notOk(deck.animationLoop, 'Deck instance is finalized');

  t.end();
});

test('MapboxOverlay#interleavedNoInitialLayers', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    useDevicePixels: false
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');

  map.once('render', async () => {
    t.is(overlay._deck.props.layers.length, 0, 'Layers are empty');
    t.false('layers' in overlay._props, 'Overlay layers arent set');

    t.ok(
      objectEqual(overlay._deck.props.parameters, DEFAULT_PARAMETERS),
      'Parameters are set correctly'
    );
    t.false('parameters' in overlay._props, 'Overlay parameters arent set');

    t.true(overlay._deck.props.useDevicePixels === false, 'useDevicePixels is set correctly');
    t.true(overlay._props.useDevicePixels === false, 'useDevicePixels are intact');

    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'cities'})],
      parameters: {
        depthWriteEnabled: false
      }
    });
    await sleep(100);
    t.ok(map.getLayer('cities'), 'MapboxLayer is added');

    t.ok(
      objectEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false
      }),
      'Parameters are updated correctly'
    );
    t.ok(
      objectEqual(overlay._props.parameters, {
        depthWriteEnabled: false
      }),
      'Overlay parameters are updated correctly'
    );

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});

test('MapboxOverlay#interleavedFinalizeRemovesMoveHandler', t => {
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
  t.false('move' in map._listeners, 'No move listeners initially');

  map.once('render', () => {
    t.true(map._listeners['move'].length === 1, 'One move listener attached by overlay');

    overlay.finalize();
    t.true(map._listeners['move'].length === 1, 'Listener attached after finalized until it fires');

    map.setCenter({lng: 0, lat: 1});
    t.true(map._listeners['move'].length === 0, 'Listener detached after it fired');

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});

const PROJECTION_TEST_CASES = [
  {projection: 'globe', ExpectedView: GlobeView},
  {projection: 'mercator', ExpectedView: MapView},
  {ExpectedView: MapView}
];

for (const {projection, ExpectedView} of PROJECTION_TEST_CASES) {
  test(`MapboxOverlay#${projection} projection view selection`, t => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 14,
      projection
    });

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [new ScatterplotLayer({id: 'test-layer'})]
    });

    map.addControl(overlay);

    t.ok(overlay._deck, 'Deck instance is created');

    map.on('render', () => {
      const mapboxView = overlay._deck.props.views;
      t.ok(
        mapboxView instanceof ExpectedView,
        `should use correct view when map has ${projection} projection`
      );

      map.removeControl(overlay);
      t.notOk(overlay._deck, 'Deck instance is finalized');
      t.end();
    });
  });
}
