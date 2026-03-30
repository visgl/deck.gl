// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {_GlobeView as GlobeView, MapView} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';

import {objectEqual} from './mapbox-layer.spec';
import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS} from './fixtures';

const webglTest = device.type === 'webgl' ? test : test.skip;

function sleep(milliseconds: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function waitForRender(map: MockMapboxMap, callback: () => void | Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    map.once('render', () => {
      Promise.resolve().then(callback).then(resolve, reject);
    });
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

test('MapboxOverlay#overlaid', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    device,
    layers: [new ScatterplotLayer()]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  expect(
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
  ).toBeTruthy();
  expect('viewState' in overlay._props, 'Overlay viewState is not set').toBeFalsy();

  expect(deck.props.useDevicePixels === true, 'useDevicePixels is set correctly').toBeTruthy();
  expect('useDevicePixels' in overlay._props, 'Overlay useDevicePixels is not set').toBeFalsy();

  expect(objectEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
  expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  const renderPromise = waitForRender(map, () => {
    expect(
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
    ).toBeTruthy();

    map.removeControl(overlay);

    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  await renderPromise;
});

test('MapboxOverlay#overlaidNoIntitalLayers', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({device});

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  expect(
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
  ).toBeTruthy();

  expect(deck.props.useDevicePixels === true, 'useDevicePixels is set correctly').toBeTruthy();
  expect('useDevicePixels' in overlay._props, 'Overlay useDevicePixels is not set').toBeFalsy();

  expect(deck.props.layers.length, 'Layers are empty').toBe(0);
  expect('layers' in overlay._props, 'Overlay layers arent set').toBeFalsy();

  expect(objectEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
  expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  const renderPromise = waitForRender(map, () => {
    expect(
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
    ).toBeTruthy();

    expect(objectEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
    expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

    map.removeControl(overlay);

    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  await renderPromise;
});

webglTest('MapboxOverlay#interleaved', async () => {
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

  const renderPromise = waitForRender(map, async () => {
    const VIEW_STATE = {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 14,
      bearing: 0,
      pitch: 0,
      padding: {left: 0, right: 0, top: 0, bottom: 0},
      repeat: true
    };
    expect(
      objectEqual(overlay._deck.props.viewState, VIEW_STATE),
      'View state is set correcly'
    ).toBeTruthy();
    expect('viewState' in overlay._props, 'Overlay viewState arent set').toBeFalsy();

    expect(
      objectEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Parameters are set correctly'
    ).toBeTruthy();
    expect(
      objectEqual(overlay._props.parameters, {
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Overlay parameters are intact'
    ).toBeTruthy();

    expect(overlay._props.useDevicePixels, 'useDevicePixels is not forwarded').toBe(undefined);

    await sleep(100);
    expect(map.getLayer('poi'), 'MapboxLayer is added').toBeTruthy();
    expect(map.getLayer('poi2'), 'MapboxLayer is added').toBeTruthy();
    expect(drawLog, 'layers correctly filtered').toEqual(['poi']);
    drawLog = [];

    overlay.setProps({
      layers: [new TestScatterplotLayer({id: 'cities', onAfterRedraw: onRedrawLayer})],
      layerFilter: undefined
    });

    await sleep(100);
    expect(map.getLayer('poi'), 'MapboxLayer is removed').toBeFalsy();
    expect(map.getLayer('cities'), 'MapboxLayer is added').toBeTruthy();
    expect(drawLog, 'layers correctly filtered').toEqual(['cities']);

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  await renderPromise;
});

webglTest('MapboxOverlay#interleaved#remove and add', () => {
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
  expect(deck && deck.animationLoop, 'Deck instance is created').toBeTruthy();
  map.removeControl(overlay);
  expect(deck.animationLoop, 'Deck instance is finalized').toBeFalsy();

  map.addControl(overlay);
  deck = overlay._deck;
  expect(deck && deck.animationLoop, 'Deck instance is created').toBeTruthy();
  map.removeControl(overlay);
  expect(deck.animationLoop, 'Deck instance is finalized').toBeFalsy();
});

webglTest('MapboxOverlay#interleavedNoInitialLayers', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    useDevicePixels: false
  });

  const renderPromise = waitForRender(map, async () => {
    expect(overlay._deck.props.layers.length, 'Layers are empty').toBe(0);
    expect('layers' in overlay._props, 'Overlay layers arent set').toBeFalsy();

    expect(
      objectEqual(overlay._deck.props.parameters, DEFAULT_PARAMETERS),
      'Parameters are set correctly'
    ).toBeTruthy();
    expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

    expect(overlay._props.useDevicePixels, 'useDevicePixels is not forwarded').toBe(undefined);

    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'cities'})],
      parameters: {
        depthWriteEnabled: false
      }
    });
    await sleep(100);
    expect(map.getLayer('cities'), 'MapboxLayer is added').toBeTruthy();

    expect(
      objectEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false
      }),
      'Parameters are updated correctly'
    ).toBeTruthy();
    expect(
      objectEqual(overlay._props.parameters, {
        depthWriteEnabled: false
      }),
      'Overlay parameters are updated correctly'
    ).toBeTruthy();

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  await renderPromise;
});

webglTest('MapboxOverlay#interleavedFinalizeRemovesMoveHandler', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [new ScatterplotLayer({id: 'poi'})]
  });

  const renderPromise = waitForRender(map, () => {
    expect(
      map._listeners['move'].length === 1,
      'One move listener attached by overlay'
    ).toBeTruthy();

    overlay.finalize();
    expect(
      map._listeners['move'].length === 1,
      'Listener attached after finalized until it fires'
    ).toBeTruthy();

    map.setCenter({lng: 0, lat: 1});
    expect(map._listeners['move'].length === 0, 'Listener detached after it fired').toBeTruthy();

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect('move' in map._listeners, 'No move listeners initially').toBeFalsy();
  await renderPromise;
});

const PROJECTION_TEST_CASES = [
  {projection: 'globe', ExpectedView: GlobeView},
  {projection: 'mercator', ExpectedView: MapView},
  {ExpectedView: MapView}
];

for (const {projection, ExpectedView} of PROJECTION_TEST_CASES) {
  webglTest(`MapboxOverlay#${projection} projection view selection`, async () => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 14,
      projection
    });

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: [new ScatterplotLayer({id: 'test-layer'})]
    });

    const renderPromise = waitForRender(map, () => {
      const mapboxView = overlay._deck.props.views;
      expect(
        mapboxView instanceof ExpectedView,
        `should use correct view when map has ${projection} projection`
      ).toBeTruthy();

      map.removeControl(overlay);
      expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
    });
    map.addControl(overlay);

    expect(overlay._deck, 'Deck instance is created').toBeTruthy();
    await renderPromise;
  });
}

webglTest('MapboxOverlay#renderLayersInGroups - constructor', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14,
    style: {
      layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
    }
  });

  const overlay = new MapboxOverlay({
    interleaved: true,
    _renderLayersInGroups: true,
    layers: [
      new ScatterplotLayer({id: 'poi1', beforeId: 'park'}),
      new ScatterplotLayer({id: 'poi2', beforeId: 'park'})
    ]
  });

  const renderPromise = waitForRender(map, async () => {
    await sleep(100);

    const groupId = 'deck-layer-group-before:park';
    expect(map.getLayer(groupId), 'Group layer exists').toBeTruthy();
    expect(map.getLayer('poi1'), 'Individual layer poi1 not added to map').toBeFalsy();
    expect(map.getLayer('poi2'), 'Individual layer poi2 not added to map').toBeFalsy();

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._renderLayersInGroups, '_renderLayersInGroups option is set').toBeTruthy();
  await renderPromise;
});

webglTest('MapboxOverlay#renderLayersInGroups - setProps', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14,
    style: {
      layers: [{id: 'water'}, {id: 'park'}, {id: 'building'}]
    }
  });

  const overlay = new MapboxOverlay({
    interleaved: true,
    _renderLayersInGroups: true,
    layers: [new ScatterplotLayer({id: 'poi', beforeId: 'park'})]
  });

  const renderPromise = waitForRender(map, async () => {
    await sleep(100);

    const parkGroup = 'deck-layer-group-before:park';
    expect(map.getLayer(parkGroup), 'Park group exists initially').toBeTruthy();

    // Update to different beforeId
    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'poi', beforeId: 'building'})]
    });

    await sleep(100);

    const buildingGroup = 'deck-layer-group-before:building';
    expect(map.getLayer(buildingGroup), 'Building group exists after setProps').toBeTruthy();
    expect(map.getLayer(parkGroup), 'Park group removed after setProps').toBeFalsy();

    // Remove all layers
    overlay.setProps({
      layers: []
    });

    await sleep(100);

    expect(map.getLayer(buildingGroup), 'Building group removed when layers cleared').toBeFalsy();

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);
  await renderPromise;
});
