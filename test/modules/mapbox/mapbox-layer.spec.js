import test from 'tape-promise/tape';

import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';
import {device} from '@deck.gl/test-utils';
import {equals} from '@math.gl/core';

import MockMapboxMap from './mapbox-gl-mock/map';
import {DEFAULT_PARAMETERS} from './fixtures';

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

test('MapboxLayer#onAdd, onRemove, setProps', t => {
  const layers = Array.from(
    {length: 2},
    (_, i) =>
      new MapboxLayer({
        id: `scatterplot-layer-${i}`,
        type: ScatterplotLayer,
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0]
      })
  );

  t.ok(layers[0] && layers[1], 'MapboxLayer constructor does not throw');

  const map = new MockMapboxMap({
    version: '1.10.0-beta.1',
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });
  map.on('load', () => {
    map.addLayer(layers[0]);
    const {deck} = layers[0];

    t.ok(deck, 'Deck is initialized');
    t.ok(
      deck.props.layers.find(
        l => l.id === 'scatterplot-layer-0' && l.constructor === ScatterplotLayer
      ),
      'Layer is added to deck'
    );
    // t.deepEqual(deck.userData.mapboxVersion, {major: 1, minor: 10}, 'Mapbox version is parsed');
    t.ok(deck.props.views[0].id === 'mapbox', 'mapbox view exists');
    t.ok(objectEqual(deck.props.parameters, DEFAULT_PARAMETERS), 'Parameters are set correctly');

    t.ok(
      objectEqual(deck.props.viewState, {
        longitude: -122.45,
        latitude: 37.78,
        zoom: 12,
        bearing: 0,
        pitch: 0,
        padding: {left: 0, right: 0, top: 0, bottom: 0},
        repeat: true
      }),
      'viewState is set correctly'
    );

    map.removeLayer(layers[0].id);
    t.is(deck.props.layers.length, 0, 'Layer is removed from deck');

    map.addLayer(layers[1]);
    t.is(deck, layers[1].deck, 'Deck is reused');
    t.is(deck.props.layers[0].props.getRadius, 10, 'Layer is added');

    layers[1].setProps({
      getRadius: 20
    });

    t.is(deck.props.layers[0].props.getRadius, 20, 'Layer is updated');

    map.fire('render');
    t.notOk(deck.layerManager, 'Deck is waiting initialization');
    t.pass('Map render does not throw');

    deck.props.onLoad = () => {
      map.fire('render');
      t.pass('Map render does not throw');

      map.fire('remove');
      t.notOk(deck.layerManager, 'Deck is finalized');

      t.end();
    };
  });
});

test('MapboxLayer#external Deck', t => {
  const deck = new Deck({
    device,
    viewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    layers: [
      new ScatterplotLayer({
        id: 'scatterplot-layer-0',
        data: [],
        getPosition: d => d.position,
        getRadius: 10,
        getFillColor: [255, 0, 0]
      })
    ],
    parameters: {
      depthTest: false
    }
  });

  const layer = new MapboxLayer({id: 'scatterplot-layer-0', deck});

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    map.addLayer(layer);
    t.is(layer.deck, deck, 'Used external Deck instance');
    // t.ok(deck.userData.mapboxVersion, 'Mapbox version is parsed');
    t.ok(deck.props.views[0].id === 'mapbox', 'mapbox view exists');
    t.ok(
      objectEqual(deck.props.parameters, {...DEFAULT_PARAMETERS, depthTest: false}),
      'Parameters are set correctly'
    );

    map.fire('render');
    t.pass('Map render does not throw');

    map.fire('remove');
    t.ok(deck.layerManager, 'External Deck should not be finalized with map');

    deck.finalize();

    map.fire('render');
    t.pass('Map render does not throw');

    layer.render();
    t.pass('Map render does not throw');

    t.end();
  });
});

test('MapboxLayer#external Deck multiple views supplied', t => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    const deck = new Deck({
      device,
      views: [new MapView({id: 'view-two'}), new MapView({id: 'mapbox'})],
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      },
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
      layerFilter: ({viewport, layer}) => {
        if (viewport.id === 'mapbox') return layer.id === 'scatterplot-map';
        return layer.id === 'scatterplot-second-view';
      }
    });

    const layerDefaultView = new MapboxLayer({id: 'scatterplot-map', deck});
    map.addLayer(layerDefaultView);
    t.is(layerDefaultView.deck, deck, 'Used external Deck instance');
    t.ok(objectEqual(deck.props.parameters, DEFAULT_PARAMETERS), 'Parameters are set correctly');

    map.on('render', () => {
      t.deepEqual(
        drawLog,
        [
          ['mapbox', 'scatterplot-map'],
          ['view-two', 'scatterplot-second-view']
        ],
        'layers drawn into the correct views'
      );

      deck.finalize();

      t.end();
    });
  });
});

test('MapboxLayer#external Deck custom views', t => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  map.on('load', () => {
    const deck = new Deck({
      device,
      views: [new MapView({id: 'view-two'})],
      viewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      },
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

    map.addLayer(new MapboxLayer({id: 'scatterplot', deck}));
    map.on('render', () => {
      t.deepEqual(
        drawLog,
        [
          ['mapbox', 'scatterplot'],
          ['view-two', 'scatterplot']
        ],
        'layer is drawn to both views'
      );

      deck.finalize();

      t.end();
    });
  });
});

/** Used to compare view states */
export function objectEqual(actual, expected) {
  if (equals(actual, expected)) {
    return true;
  }

  const keys0 = Object.keys(actual);
  const keys1 = Object.keys(expected);
  if (keys0.length !== keys1.length) {
    return false;
  }
  for (const key of keys1) {
    if (!objectEqual(actual[key], expected[key])) {
      return false;
    }
  }
  return true;
}
