import test from 'tape-promise/tape';

import {Deck, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';
import {gl} from '@deck.gl/test-utils';

class MockMapboxMap {
  constructor(opts) {
    this.opts = opts;
    this.version = opts.version;
    this._callbacks = {};
    this._layers = {};
  }

  on(event, cb) {
    this._callbacks[event] = this._callbacks[event] || [];
    this._callbacks[event].push(cb);
  }

  emit(event) {
    if (!this._callbacks[event]) {
      return;
    }
    for (const func of this._callbacks[event]) {
      func();
    }
  }

  addLayer(layer) {
    this._layers[layer.id] = layer;
    layer.onAdd(this, gl);
  }

  removeLayer(layer) {
    delete this._layers[layer.id];
    layer.onRemove();
  }

  triggerRepaint() {
    for (const id in this._layers) {
      this._layers[id].render(gl);
    }
    this.emit('render');
  }

  getCenter() {
    return this.opts.center;
  }
  getZoom() {
    return this.opts.zoom;
  }
  getPitch() {
    return this.opts.pitch || 0;
  }
  getBearing() {
    return this.opts.bearing || 0;
  }
  getRenderWorldCopies() {
    return true;
  }
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

  const map = new MockMapboxMap({
    version: '1.10.0-beta.1',
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  t.ok(layers[0] && layers[1], 'MapboxLayer constructor does not throw');

  map.addLayer(layers[0]);
  const {deck} = layers[0];

  t.ok(deck, 'Deck is initialized');
  t.ok(
    deck.props.layers.find(
      l => l.id === 'scatterplot-layer-0' && l.constructor === ScatterplotLayer
    ),
    'Layer is added to deck'
  );
  t.deepEqual(deck.props.userData.mapboxVersion, {major: 1, minor: 10}, 'Mapbox version is parsed');
  t.ok(deck.props.views[0].id === 'mapbox', 'mapbox view exists');

  t.deepEqual(
    deck.props.viewState,
    {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 12,
      bearing: 0,
      pitch: 0
    },
    'viewState is set correctly'
  );

  map.removeLayer(layers[0]);
  t.is(deck.props.layers.length, 0, 'Layer is removed from deck');

  map.addLayer(layers[1]);
  t.is(deck, layers[1].deck, 'Deck is reused');
  t.is(deck.props.layers[0].props.getRadius, 10, 'Layer is added');

  layers[1].setProps({
    getRadius: 20
  });

  t.is(deck.props.layers[0].props.getRadius, 20, 'Layer is updated');

  map.emit('render');
  t.notOk(deck.layerManager, 'Deck is waiting initialization');
  t.pass('Map render does not throw');

  deck.props.onLoad = () => {
    map.emit('render');
    t.pass('Map render does not throw');

    map.emit('remove');
    t.notOk(deck.layerManager, 'Deck is finalized');

    t.end();
  };
});

test('MapboxLayer#external Deck', t => {
  const deck = new Deck({
    gl,
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
    ]
  });

  const layer = new MapboxLayer({id: 'scatterplot-layer-0', deck});

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });

  deck.props.onLoad = () => {
    map.addLayer(layer);
    t.is(layer.deck, deck, 'Used external Deck instance');
    t.ok(deck.props.userData.mapboxVersion, 'Mapbox version is parsed');
    t.ok(deck.props.views[0].id === 'mapbox', 'mapbox view exists');

    map.emit('render');
    t.pass('Map render does not throw');

    map.emit('remove');
    t.ok(deck.layerManager, 'External Deck should not be finalized with map');

    deck.finalize();

    map.emit('render');
    t.pass('Map render does not throw');

    layer.render();
    t.pass('Map render does not throw');

    t.end();
  };
});

test('MapboxLayer#external Deck multiple views supplied', t => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const deck = new Deck({
    gl,
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

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
  });
  const layerDefaultView = new MapboxLayer({id: 'scatterplot-map', deck});
  map.addLayer(layerDefaultView);

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

test('MapboxLayer#external Deck custom views', t => {
  const drawLog = [];
  const onRedrawLayer = ({viewport, layer}) => {
    drawLog.push([viewport.id, layer.id]);
  };

  const deck = new Deck({
    gl,
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

  const map = new MockMapboxMap({
    center: {lng: -122.45, lat: 37.78},
    zoom: 12
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
