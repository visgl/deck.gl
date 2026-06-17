// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {getDeckInstance} from '@deck.gl/mapbox/deck-utils';
import MapboxLayerGroup from '@deck.gl/mapbox/mapbox-layer-group';
import {_GlobeView as GlobeView, MapView, Widget} from '@deck.gl/core';
import type {WidgetPlacement} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {WebGLDevice} from '@luma.gl/webgl';

import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS, approxDeepEqual} from './fixtures';

// Create an isolated device for overlaid mode tests to prevent GL context corruption
const overlaidTestDevice = new WebGLDevice({createCanvasContext: {width: 1, height: 1}});

const webglTest = device.type === 'webgl' ? test : test.skip;

// Simple test widget for testing MapboxOverlay widget support
class TestWidget extends Widget<{placement?: WidgetPlacement; viewId?: string | null}> {
  static defaultProps = {
    ...Widget.defaultProps,
    id: 'test-widget',
    placement: 'top-left' as WidgetPlacement
  };

  placement: WidgetPlacement = 'top-left';
  className = 'deck-test-widget';

  constructor(props: {id?: string; placement?: WidgetPlacement; viewId?: string | null} = {}) {
    super(props);
    this.viewId = props.viewId ?? null;
    this.placement = props.placement ?? 'top-left';
  }

  onRenderHTML(rootElement: HTMLElement): void {
    rootElement.textContent = this.id;
  }
}

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
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  expect(
    approxDeepEqual(deck.props.viewState, {
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

  expect(approxDeepEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
  expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  const renderPromise = waitForRender(map, () => {
    expect(
      approxDeepEqual(deck.props.viewState, {
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
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  expect(
    approxDeepEqual(deck.props.viewState, {
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

  expect(approxDeepEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
  expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

  overlay.setProps({
    layers: [new ScatterplotLayer()]
  });

  const renderPromise = waitForRender(map, () => {
    expect(
      approxDeepEqual(deck.props.viewState, {
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

    expect(approxDeepEqual(deck.props.parameters, {}), 'Parameters are empty').toBeTruthy();
    expect('parameters' in overlay._props, 'Overlay parameters arent set').toBeFalsy();

    map.removeControl(overlay);

    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.setCenter({lng: 0.45, lat: 51.47});
  map.setZoom(4);
  map.triggerRepaint();
  await renderPromise;
});

test('MapboxOverlay#overlaidAutoInjectMapboxView', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  const views = Array.isArray(deck.props.views) ? deck.props.views : [deck.props.views];
  expect(views.length, 'Single view is present').toBe(1);
  expect(views[0].id, 'Default mapbox view is auto-injected').toBe('mapbox');
  expect(views[0] instanceof MapView, 'View is a MapView').toBeTruthy();

  map.removeControl(overlay);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('MapboxOverlay#overlaidAutoInjectMapboxViewSetProps', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  // setProps with custom views should still auto-inject mapbox view
  const customView = new MapView({
    id: 'minimap',
    x: '75%',
    y: '75%',
    width: '25%',
    height: '25%'
  });
  overlay.setProps({views: [customView]});

  const views = Array.isArray(deck.props.views) ? deck.props.views : [deck.props.views];
  expect(views.length, 'After setProps has two views').toBe(2);
  expect(views[0].id, 'Mapbox view is still auto-injected after setProps').toBe('mapbox');
  expect(views[1].id, 'Custom view is added').toBe('minimap');

  map.removeControl(overlay);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('MapboxOverlay#overlaidAutoInjectMapboxViewWithCustomViews', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const customView = new MapView({id: 'minimap', x: '75%', y: '75%', width: '25%', height: '25%'});

  const overlay = new MapboxOverlay({
    views: [customView],
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  const views = Array.isArray(deck.props.views) ? deck.props.views : [deck.props.views];
  expect(views.length, 'Two views are present').toBe(2);
  expect(views[0].id, 'Mapbox view is auto-injected at the start').toBe('mapbox');
  expect(views[0] instanceof MapView, 'First view is MapView').toBeTruthy();
  expect(views[1].id, 'Custom view is preserved').toBe('minimap');
  expect(views[1], 'Custom view is the same instance').toBe(customView);

  map.removeControl(overlay);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('MapboxOverlay#overlaidNoDuplicateWhenMapboxViewProvided', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const explicitMapboxView = new MapView({id: 'mapbox'});
  const customView = new MapView({id: 'minimap', x: '75%', y: '75%', width: '25%', height: '25%'});

  const overlay = new MapboxOverlay({
    views: [explicitMapboxView, customView],
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  map.addControl(overlay);

  const deck = overlay._deck;
  expect(deck, 'Deck instance is created').toBeTruthy();

  const views = Array.isArray(deck.props.views) ? deck.props.views : [deck.props.views];
  expect(views.length, 'Two views only (no duplicate)').toBe(2);
  expect(views[0], 'First view is the explicitly provided mapbox view').toBe(explicitMapboxView);
  expect(views[1], 'Second view is the custom view').toBe(customView);

  map.removeControl(overlay);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
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
      approxDeepEqual(overlay._deck.props.viewState, VIEW_STATE),
      'View state is set correcly'
    ).toBeTruthy();
    expect('viewState' in overlay._props, 'Overlay viewState arent set').toBeFalsy();

    expect(
      approxDeepEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Parameters are set correctly'
    ).toBeTruthy();
    expect(
      approxDeepEqual(overlay._props.parameters, {
        depthWriteEnabled: false,
        cullMode: 'back'
      }),
      'Overlay parameters are intact'
    ).toBeTruthy();

    expect(overlay._props.useDevicePixels, 'useDevicePixels is not forwarded').toBe(undefined);

    await sleep(100);
    expect(map.getLayer('deck-layer-group-last'), 'Layer group is added').toBeTruthy();
    expect(drawLog, 'layers correctly filtered').toEqual(['poi']);
    drawLog = [];

    overlay.setProps({
      layers: [new TestScatterplotLayer({id: 'cities', onAfterRedraw: onRedrawLayer})],
      layerFilter: undefined
    });

    await sleep(100);
    expect(map.getLayer('deck-layer-group-last'), 'Layer group exists').toBeTruthy();
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
      approxDeepEqual(overlay._deck.props.parameters, DEFAULT_PARAMETERS),
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
    expect(map.getLayer('deck-layer-group-last'), 'Layer group is added').toBeTruthy();

    expect(
      approxDeepEqual(overlay._deck.props.parameters, {
        ...DEFAULT_PARAMETERS,
        depthWriteEnabled: false
      }),
      'Parameters are updated correctly'
    ).toBeTruthy();
    expect(
      approxDeepEqual(overlay._props.parameters, {
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

webglTest('MapboxOverlay#interleavedAutoInjectMapboxView', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  const renderPromise = waitForRender(map, () => {
    let views = Array.isArray(overlay._deck.props.views)
      ? overlay._deck.props.views
      : [overlay._deck.props.views];
    expect(views.length, 'Single view is present').toBe(1);
    expect(views[0].id, 'Default mapbox view is auto-injected').toBe('mapbox');
    expect(views[0] instanceof MapView, 'View is a MapView').toBeTruthy();

    // Test that setProps with custom views still auto-injects mapbox view
    const customView = new MapView({
      id: 'minimap',
      x: '75%',
      y: '75%',
      width: '25%',
      height: '25%'
    });
    overlay.setProps({views: [customView]});

    views = Array.isArray(overlay._deck.props.views)
      ? overlay._deck.props.views
      : [overlay._deck.props.views];
    expect(views.length, 'After setProps has two views').toBe(2);
    expect(views[0].id, 'Mapbox view is still auto-injected after setProps').toBe('mapbox');
    expect(views[1].id, 'Custom view is added').toBe('minimap');

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  await renderPromise;
});

webglTest('MapboxOverlay#interleavedAutoInjectMapboxViewWithCustomViews', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const customView = new MapView({id: 'minimap', x: '75%', y: '75%', width: '25%', height: '25%'});

  const overlay = new MapboxOverlay({
    interleaved: true,
    views: [customView],
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  const renderPromise = waitForRender(map, () => {
    const views = Array.isArray(overlay._deck.props.views)
      ? overlay._deck.props.views
      : [overlay._deck.props.views];

    expect(views.length, 'Two views are present').toBe(2);
    expect(views[0].id, 'Mapbox view is auto-injected at the start').toBe('mapbox');
    expect(views[0] instanceof MapView, 'First view is MapView').toBeTruthy();
    expect(views[1].id, 'Custom view is preserved').toBe('minimap');
    expect(views[1], 'Custom view is the same instance').toBe(customView);

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  await renderPromise;
});

webglTest('MapboxOverlay#interleavedNoDuplicateWhenMapboxViewProvided', async () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const explicitMapboxView = new MapView({id: 'mapbox'});
  const customView = new MapView({id: 'minimap', x: '75%', y: '75%', width: '25%', height: '25%'});

  const overlay = new MapboxOverlay({
    interleaved: true,
    views: [explicitMapboxView, customView],
    layers: [new ScatterplotLayer({id: 'test'})]
  });

  const renderPromise = waitForRender(map, () => {
    const views = Array.isArray(overlay._deck.props.views)
      ? overlay._deck.props.views
      : [overlay._deck.props.views];

    expect(views.length, 'Two views only (no duplicate)').toBe(2);
    expect(views[0], 'First view is the explicitly provided mapbox view').toBe(explicitMapboxView);
    expect(views[1], 'Second view is the custom view').toBe(customView);

    map.removeControl(overlay);
    expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
  });
  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
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

// Widget support tests

test('MapboxOverlay#widgets - regular widgets render in deck container', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'regular-widget', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._widgetControls.length, 'No widget controls for regular widgets').toBe(0);
  expect(overlay._deck.props.widgets.includes(widget), 'Widget is passed to Deck').toBeTruthy();

  map.removeControl(overlay);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('MapboxOverlay#widgets - viewId:mapbox widgets wrapped as IControl', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'mapbox-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._widgetControls.length, 'Widget control is created').toBe(1);
  expect(map.hasControl(overlay._widgetControls[0]), 'Widget control is added to map').toBeTruthy();
  expect(widget.props._container, 'Widget _container is set').toBeTruthy();
  expect(
    overlay._deck.props.widgets.includes(widget),
    'Widget is still passed to Deck for events'
  ).toBeTruthy();

  map.removeControl(overlay);
  expect(overlay._widgetControls.length, 'Widget controls are cleaned up').toBe(0);
  expect(overlay._deck, 'Deck instance is finalized').toBeFalsy();
});

test('MapboxOverlay#widgets - mixed widgets', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const regularWidget = new TestWidget({id: 'regular', placement: 'top-left'});
  const mapboxWidget1 = new TestWidget({id: 'mapbox1', viewId: 'mapbox', placement: 'top-right'});
  const mapboxWidget2 = new TestWidget({
    id: 'mapbox2',
    viewId: 'mapbox',
    placement: 'bottom-right'
  });

  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [regularWidget, mapboxWidget1, mapboxWidget2]
  });

  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._widgetControls.length, 'Two widget controls for mapbox widgets').toBe(2);
  expect(regularWidget.props._container, 'Regular widget _container is not set').toBeFalsy();
  expect(mapboxWidget1.props._container, 'Mapbox widget1 _container is set').toBeTruthy();
  expect(mapboxWidget2.props._container, 'Mapbox widget2 _container is set').toBeTruthy();

  // All widgets passed to Deck
  expect(overlay._deck.props.widgets.length, 'All widgets passed to Deck').toBe(3);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - setProps updates widget controls', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget1 = new TestWidget({id: 'widget1', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget1]
  });

  map.addControl(overlay);
  expect(overlay._widgetControls.length, 'Initial widget control created').toBe(1);

  const widget2 = new TestWidget({id: 'widget2', viewId: 'mapbox', placement: 'bottom-left'});
  overlay.setProps({
    widgets: [widget2]
  });

  expect(overlay._widgetControls.length, 'Widget control count updated').toBe(1);
  expect(widget2.props._container, 'New widget _container is set').toBeTruthy();

  // Clear all widgets
  overlay.setProps({
    widgets: []
  });
  expect(overlay._widgetControls.length, 'Widget controls cleared').toBe(0);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - setProps preserves container for same widget instance', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'widget1', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);
  expect(overlay._widgetControls.length, 'Widget control created').toBe(1);
  const originalContainer = widget.props._container;
  expect(originalContainer, 'Widget _container is set').toBeTruthy();
  const originalControl = overlay._widgetControls[0];

  // Call setProps with the same widget instance
  overlay.setProps({
    widgets: [widget]
  });

  expect(overlay._widgetControls.length, 'Still one widget control').toBe(1);
  expect(overlay._widgetControls[0], 'Same control instance preserved').toBe(originalControl);
  expect(widget.props._container, 'Container preserved - not recreated').toBe(originalContainer);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - setProps preserves container for new widget instance with same id', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget1 = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget1]
  });

  map.addControl(overlay);
  expect(overlay._widgetControls.length, 'Widget control created').toBe(1);
  const originalContainer = widget1.props._container;
  expect(originalContainer, 'Widget _container is set').toBeTruthy();
  const originalControl = overlay._widgetControls[0];

  // Call setProps with a NEW widget instance but same id and placement (React pattern)
  const widget2 = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'top-right'});
  overlay.setProps({
    widgets: [widget2]
  });

  expect(overlay._widgetControls.length, 'Still one widget control').toBe(1);
  expect(overlay._widgetControls[0], 'Same control instance preserved').toBe(originalControl);
  expect(widget2.props._container, 'New widget gets existing container').toBe(originalContainer);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - interleaved mode', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'mapbox-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    interleaved: true,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._widgetControls.length, 'Widget control is created in interleaved mode').toBe(1);
  expect(widget.props._container, 'Widget _container is set').toBeTruthy();

  map.removeControl(overlay);
  expect(overlay._widgetControls.length, 'Widget controls are cleaned up').toBe(0);
});

test('MapboxOverlay#widgets - placement change recreates control', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);
  expect(overlay._widgetControls.length).toBe(1);
  const originalControl = overlay._widgetControls[0];
  const originalContainer = widget.props._container;

  // Same id but different placement - should recreate the control
  const widget2 = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'bottom-left'});
  overlay.setProps({
    widgets: [widget2]
  });

  expect(overlay._widgetControls.length, 'Still one widget control').toBe(1);
  expect(
    overlay._widgetControls[0] !== originalControl,
    'New control instance created'
  ).toBeTruthy();
  expect(widget2.props._container, 'New widget has _container set').toBeTruthy();
  expect(
    widget2.props._container !== originalContainer,
    'New container created for new placement'
  ).toBeTruthy();
  expect(map.hasControl(originalControl), 'Old control removed from map').toBeFalsy();
  expect(map.hasControl(overlay._widgetControls[0]), 'New control added to map').toBeTruthy();

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - setWidget updates control widget reference', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget1 = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget1]
  });

  map.addControl(overlay);
  const control = overlay._widgetControls[0];
  expect(control.widget, 'Control initially references widget1').toBe(widget1);

  // New instance with same id and placement - control is reused
  const widget2 = new TestWidget({id: 'my-widget', viewId: 'mapbox', placement: 'top-right'});
  overlay.setProps({
    widgets: [widget2]
  });

  expect(overlay._widgetControls[0], 'Same control instance reused').toBe(control);
  expect(control.widget, 'Control widget reference updated to widget2').toBe(widget2);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - onRemove clears widget _container', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'mapbox-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);
  expect(widget.props._container, '_container is set after addControl').toBeTruthy();

  map.removeControl(overlay);
  expect(widget.props._container, '_container is cleared after removeControl').toBeFalsy();
});

test('MapboxOverlay#widgets - getDefaultPosition maps placement correctly', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const topRight = new TestWidget({id: 'w1', viewId: 'mapbox', placement: 'top-right'});
  const bottomLeft = new TestWidget({id: 'w2', viewId: 'mapbox', placement: 'bottom-left'});
  const fillWidget = new TestWidget({id: 'w3', viewId: 'mapbox', placement: 'fill'});

  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [topRight, bottomLeft, fillWidget]
  });

  map.addControl(overlay);
  expect(overlay._widgetControls.length).toBe(3);

  // Check that mock map recorded the correct positions
  const controlEntries = map._controls.filter(
    c => c.control !== overlay // exclude the overlay itself
  );
  const positions = controlEntries.map(c => c.position);
  expect(positions, 'Positions match widget placements').toEqual([
    'top-right',
    'bottom-left',
    'top-left' // 'fill' falls back to 'top-left'
  ]);

  map.removeControl(overlay);
});

test('MapboxOverlay#widgets - null widgets in array are filtered', () => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'valid-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    device: overlaidTestDevice,
    layers: [new ScatterplotLayer()],
    widgets: [null as any, widget, undefined as any]
  });

  map.addControl(overlay);

  expect(overlay._deck, 'Deck instance is created').toBeTruthy();
  expect(overlay._widgetControls.length, 'Only valid mapbox widget creates a control').toBe(1);
  expect(widget.props._container, 'Valid widget _container is set').toBeTruthy();

  map.removeControl(overlay);
});

test('MapboxLayerGroup#external Deck lifecycle', async () => {
  const deck = new Deck({
    device,
    viewState: {longitude: 0, latitude: 0, zoom: 1},
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-layer-0',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0]
      })
    ],
    parameters: {...DEFAULT_PARAMETERS, depthTest: false}
  });

  const group = new MapboxLayerGroup({id: 'deck-layer-group-last'});

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  await map.once('load');

  getDeckInstance({map, deck});

  map.addLayer(group);
  expect(deck.props.views.id === 'mapbox', 'mapbox view exists').toBeTruthy();

  expect(() => (map as any)._render(), 'Map render does not throw').not.toThrow();

  map.fire('remove');
  expect(deck.layerManager, 'External Deck should not be finalized with map').toBeTruthy();

  deck.finalize();

  expect(() => (map as any)._render(), 'Map render does not throw after finalize').not.toThrow();
  expect(
    () => group.render(null, null),
    'Group render does not throw after finalize'
  ).not.toThrow();
});

test('MapboxLayerGroup#external Deck multiple views', async () => {
  const drawLog: [string, string][] = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  await map.once('load');

  const deck = new Deck({
    device,
    views: [new MapView({id: 'view-two'}), new MapView({id: 'mapbox'})],
    viewState: {longitude: 0, latitude: 0, zoom: 1},
    layers: [
      new TestScatterplotLayer({
        id: 'scatterplot-map',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0],
        onAfterRedraw: onRedrawLayer
      }),
      new TestScatterplotLayer({
        id: 'scatterplot-second-view',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0],
        onAfterRedraw: onRedrawLayer
      })
    ],
    parameters: DEFAULT_PARAMETERS,
    layerFilter: ({viewport, layer}) => {
      if (viewport.id === 'mapbox') return layer.id === 'scatterplot-map';
      return layer.id === 'scatterplot-second-view';
    }
  });

  getDeckInstance({map, deck});

  const group = new MapboxLayerGroup({id: 'deck-layer-group-last'});
  const renderPromise = map.once('render');
  map.addLayer(group);
  await renderPromise;

  expect((map as any)._renderError, 'render should not throw').toBeFalsy();
  expect(drawLog, 'layers drawn into the correct views').toEqual([
    ['mapbox', 'scatterplot-map'],
    ['view-two', 'scatterplot-second-view']
  ]);

  deck.finalize();
});

test('MapboxLayerGroup#external Deck custom views', async () => {
  const drawLog: [string, string][] = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  await map.once('load');

  const deck = new Deck({
    device,
    views: [new MapView({id: 'view-two'})],
    viewState: {longitude: 0, latitude: 0, zoom: 1},
    layers: [
      new TestScatterplotLayer({
        id: 'scatterplot',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0],
        onAfterRedraw: onRedrawLayer
      })
    ]
  });

  getDeckInstance({map, deck});

  const renderPromise = map.once('render');
  map.addLayer(new MapboxLayerGroup({id: 'deck-layer-group-last'}));
  await renderPromise;

  expect((map as any)._renderError, 'render should not throw').toBeFalsy();
  expect(drawLog, 'layer is drawn to both views').toEqual([
    ['mapbox', 'scatterplot'],
    ['view-two', 'scatterplot']
  ]);

  deck.finalize();
});

test('MapboxLayerGroup#drawLayerGroup with zero-size canvas', async () => {
  await new Promise<void>((resolve, reject) => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [
          new ScatterplotLayer({
            id: 'scatterplot',
            data: [],
            getPosition: d => d.position,
            getRadius: 10,
            getFillColor: [255, 0, 0]
          })
        ],
        onLoad: () => {
          try {
            (deck as any).width = 0;
            (deck as any).height = 0;
            (map as any)._render();

            expect(
              (map as any)._renderError,
              'render should not throw when canvas has zero dimensions'
            ).toBeFalsy();

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
      map.addLayer(new MapboxLayerGroup({id: 'deck-layer-group-last'}));
    });
  });
});

test('MapboxLayerGroup#afterRender with zero-size canvas', async () => {
  await new Promise<void>((resolve, reject) => {
    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        views: [new MapView({id: 'mapbox'}), new MapView({id: 'overview'})],
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [
          new ScatterplotLayer({
            id: 'scatterplot',
            data: [],
            getPosition: d => d.position,
            getRadius: 10,
            getFillColor: [255, 0, 0]
          })
        ],
        onLoad: () => {
          try {
            (deck as any).width = 0;
            (deck as any).height = 0;
            (map as any)._render();

            expect(
              (map as any)._renderError,
              'afterRender should not throw when canvas has zero dimensions'
            ).toBeFalsy();

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
      map.addLayer(new MapboxLayerGroup({id: 'deck-layer-group-last'}));
    });
  });
});

test('MapboxLayerGroup#afterRender fires onBeforeRender/onAfterRender without non-Mapbox layers', async () => {
  // When there are no deck layers (and thus no non-Mapbox layers to draw),
  // afterRender should still fire onBeforeRender and onAfterRender callbacks
  // so consumers can track view state changes.
  await new Promise<void>((resolve, reject) => {
    const callLog: string[] = [];

    const map = new MockMapboxMap({
      center: {lng: -122.45, lat: 37.78},
      zoom: 12
    });

    map.on('load', () => {
      const deck = new Deck({
        device,
        viewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [],
        parameters: DEFAULT_PARAMETERS,
        onBeforeRender: () => callLog.push('onBeforeRender'),
        onAfterRender: () => callLog.push('onAfterRender'),
        onLoad: () => {
          try {
            // Clear any callbacks from initialization
            callLog.length = 0;
            // Render after deck is initialized - no layers on the map,
            // so afterRender's else branch should fire callbacks
            (map as any)._render();

            expect(callLog, 'onBeforeRender and onAfterRender should be called').toEqual([
              'onBeforeRender',
              'onAfterRender'
            ]);

            deck.finalize();
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

      getDeckInstance({map, deck});
    });
  });
});
