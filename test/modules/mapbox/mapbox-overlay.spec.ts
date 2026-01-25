// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxOverlay} from '@deck.gl/mapbox';
import {_GlobeView as GlobeView, MapView, Widget} from '@deck.gl/core';
import type {WidgetPlacement} from '@deck.gl/core';

import {objectEqual} from './mapbox-layer.spec';
import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS} from './fixtures';

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

    t.is(overlay._props.useDevicePixels, undefined, 'useDevicePixels is not forwarded');

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

    t.is(overlay._props.useDevicePixels, undefined, 'useDevicePixels is not forwarded');

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

test('MapboxOverlay#renderLayersInGroups - constructor', t => {
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

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');
  t.true(overlay._renderLayersInGroups, '_renderLayersInGroups option is set');

  map.once('render', async () => {
    await sleep(100);

    const groupId = 'deck-layer-group-before:park';
    t.ok(map.getLayer(groupId), 'Group layer exists');
    t.notOk(map.getLayer('poi1'), 'Individual layer poi1 not added to map');
    t.notOk(map.getLayer('poi2'), 'Individual layer poi2 not added to map');

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});

test('MapboxOverlay#renderLayersInGroups - setProps', t => {
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

  map.addControl(overlay);

  map.once('render', async () => {
    await sleep(100);

    const parkGroup = 'deck-layer-group-before:park';
    t.ok(map.getLayer(parkGroup), 'Park group exists initially');

    // Update to different beforeId
    overlay.setProps({
      layers: [new ScatterplotLayer({id: 'poi', beforeId: 'building'})]
    });

    await sleep(100);

    const buildingGroup = 'deck-layer-group-before:building';
    t.ok(map.getLayer(buildingGroup), 'Building group exists after setProps');
    t.notOk(map.getLayer(parkGroup), 'Park group removed after setProps');

    // Remove all layers
    overlay.setProps({
      layers: []
    });

    await sleep(100);

    t.notOk(map.getLayer(buildingGroup), 'Building group removed when layers cleared');

    map.removeControl(overlay);
    t.notOk(overlay._deck, 'Deck instance is finalized');
    t.end();
  });
});

// Widget support tests

test('MapboxOverlay#widgets - regular widgets render in deck container', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'regular-widget', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');
  t.is(overlay._widgetControls.length, 0, 'No widget controls for regular widgets');
  t.ok(overlay._deck.props.widgets.includes(widget), 'Widget is passed to Deck');

  map.removeControl(overlay);
  t.notOk(overlay._deck, 'Deck instance is finalized');
  t.end();
});

test('MapboxOverlay#widgets - viewId:mapbox widgets wrapped as IControl', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget = new TestWidget({id: 'mapbox-widget', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer()],
    widgets: [widget]
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');
  t.is(overlay._widgetControls.length, 1, 'Widget control is created');
  t.ok(map.hasControl(overlay._widgetControls[0]), 'Widget control is added to map');
  t.ok(widget.props._container, 'Widget _container is set');
  t.ok(overlay._deck.props.widgets.includes(widget), 'Widget is still passed to Deck for events');

  map.removeControl(overlay);
  t.is(overlay._widgetControls.length, 0, 'Widget controls are cleaned up');
  t.notOk(overlay._deck, 'Deck instance is finalized');
  t.end();
});

test('MapboxOverlay#widgets - mixed widgets', t => {
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
    layers: [new ScatterplotLayer()],
    widgets: [regularWidget, mapboxWidget1, mapboxWidget2]
  });

  map.addControl(overlay);

  t.ok(overlay._deck, 'Deck instance is created');
  t.is(overlay._widgetControls.length, 2, 'Two widget controls for mapbox widgets');
  t.notOk(regularWidget.props._container, 'Regular widget _container is not set');
  t.ok(mapboxWidget1.props._container, 'Mapbox widget1 _container is set');
  t.ok(mapboxWidget2.props._container, 'Mapbox widget2 _container is set');

  // All widgets passed to Deck
  t.is(overlay._deck.props.widgets.length, 3, 'All widgets passed to Deck');

  map.removeControl(overlay);
  t.end();
});

test('MapboxOverlay#widgets - setProps updates widget controls', t => {
  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 14
  });

  const widget1 = new TestWidget({id: 'widget1', viewId: 'mapbox', placement: 'top-right'});
  const overlay = new MapboxOverlay({
    layers: [new ScatterplotLayer()],
    widgets: [widget1]
  });

  map.addControl(overlay);
  t.is(overlay._widgetControls.length, 1, 'Initial widget control created');

  const widget2 = new TestWidget({id: 'widget2', viewId: 'mapbox', placement: 'bottom-left'});
  overlay.setProps({
    widgets: [widget2]
  });

  t.is(overlay._widgetControls.length, 1, 'Widget control count updated');
  t.ok(widget2.props._container, 'New widget _container is set');

  // Clear all widgets
  overlay.setProps({
    widgets: []
  });
  t.is(overlay._widgetControls.length, 0, 'Widget controls cleared');

  map.removeControl(overlay);
  t.end();
});

test('MapboxOverlay#widgets - interleaved mode', t => {
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

  t.ok(overlay._deck, 'Deck instance is created');
  t.is(overlay._widgetControls.length, 1, 'Widget control is created in interleaved mode');
  t.ok(widget.props._container, 'Widget _container is set');

  map.removeControl(overlay);
  t.is(overlay._widgetControls.length, 0, 'Widget controls are cleaned up');
  t.end();
});
