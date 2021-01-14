import test from 'tape-catch';
import {testLayer} from '@deck.gl/test-utils';
import {MVTLayer} from '@deck.gl/geo-layers';
import ClipExtension from '@deck.gl/geo-layers/mvt-layer/clip-extension';
import {transform} from '@deck.gl/geo-layers/mvt-layer/coordinate-transform';
import {GeoJsonLayer} from '@deck.gl/layers';

import {ScatterplotLayer} from '@deck.gl/layers';
import {WebMercatorViewport} from '@deck.gl/core';
import {testLayerAsync} from '@deck.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

const geoJSONData = [
  {
    id: 1,
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [0.80908203125, 0.8935546875],
          [0.8095703125, 0.89404296875],
          [0.80908203125, 0.89404296875],
          [0.80908203125, 0.8935546875]
        ]
      ]
    },
    properties: {
      cartodb_id: 148
    }
  }
];

const TRANSFORM_COORDS_DATA = [
  {
    result: [-135, 79.17133464081945],
    geom: {
      type: 'Point',
      coordinates: [0.25, 0.25] // local coords
    }
  },
  {
    result: [[-135, 79.17133464081945], [-90, 66.51326044311185]],
    geom: {
      type: 'MultiPoint',
      coordinates: [[0.25, 0.25], [0.5, 0.5]] // local coords
    }
  },
  {
    result: [[[-180, 0], [0, 0], [0, 66.51326044311185], [-180, 0]]],
    geom: {
      type: 'Polygon',
      coordinates: [[[0, 1], [1, 1], [1, 0.5], [0, 1]]] // local coords
    }
  },
  {
    result: [
      [
        [[-180, 0], [0, 0], [0, 66.51326044311185], [-180, 0]],
        [[-180, 0], [0, -66.51326044311185], [0, -40.97989806962013], [-180, 0]]
      ]
    ],
    geom: {
      type: 'MultiPolygon',
      coordinates: [[[[0, 1], [1, 1], [1, 0.5], [0, 1]], [[0, 1], [1, 1.5], [1, 1.25], [0, 1]]]] // local coords
    }
  },
  {
    result: [[-180, 85.0511287798066], [-180, 0]],
    geom: {
      type: 'LineString',
      coordinates: [[0, 0], [0, 1]] // local coords
    }
  },
  {
    result: [[[-180, 85.0511287798066], [-180, 0]], [[-90, 66.51326044311185], [-180, 0]]],
    geom: {
      type: 'MultiLineString',
      coordinates: [[[0, 0], [0, 1]], [[0.5, 0.5], [0, 1]]] // local coords
    }
  }
];

test('ClipExtension', t => {
  const testCases = [
    {
      props: {
        id: 'clip-extension-test',
        data: FIXTURES.geojson,
        stroked: true,
        filled: true,
        extensions: [new ClipExtension()],
        clipBounds: [0, -30, 90, 30]
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          const uniforms = layer.getModels()[0].getUniforms();
          if (layer.id.endsWith('points')) {
            t.ok(uniforms.clip_bounds && uniforms.clip_bounds[0] === 0, 'has clip_bounds uniform');
          } else {
            t.ok(
              uniforms.clip_bounds && uniforms.clip_bounds[0] === 256,
              'has clip_bounds uniform'
            );
          }
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: t.notOk});

  t.end();
});

test('transformCoorsToWGS84', t => {
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1
  });

  const bbox = {west: -180, north: 85.0511287798066, east: 0, south: 0};

  for (const tc of TRANSFORM_COORDS_DATA) {
    const func = transform(tc.geom, bbox, viewport);
    t.deepEqual(func, tc.result, `transform ${tc.geom.type} returned expected WGS84 coordinates`);
  }

  t.end();
});

test('MVT Highlight', async t => {
  class TestMVTLayer extends MVTLayer {
    getTileData() {
      return geoJSONData;
    }
  }

  TestMVTLayer.componentName = 'TestMVTLayer';

  const testCases = [
    {
      props: {
        data: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'],
        id: 'mvt-highlight-test',
        filled: true,
        pickable: true,
        autoHighlight: true,
        highlightedFeatureId: 1
      },
      onAfterUpdate: ({subLayers}) => {
        for (const layer of subLayers) {
          t.ok(layer.props.pickable, 'MVT Sublayer is pickable');
          t.ok(!layer.props.autoHighlight, 'AutoHighlight should be disabled');
          t.equal(layer.props.highlightedObjectIndex, 0, 'Feature highlighted has index 0');
        }
      }
    }
  ];

  await testLayerAsync({Layer: TestMVTLayer, testCases, onError: t.notOk});

  t.end();
});

test('TileJSON', async t => {
  class TestMVTLayer extends MVTLayer {
    getTileData() {
      return [];
    }
    renderSubLayers(props) {
      return new ScatterplotLayer(props, {id: `${props.id}-fill`});
    }
  }
  const testViewport = new WebMercatorViewport({
    width: 100,
    height: 100,
    longitude: 0,
    latitude: 60,
    zoom: 3
  });

  const tileJSON = {
    tilejson: '2.2.0',
    tiles: [
      'https://a.server/{z}/{x}/{y}.mvt',
      'https://b.server/{z}/{x}/{y}.mvt',
      'https://c.server/{z}/{x}/{y}.mvt'
    ],
    minzoom: 3,
    maxzoom: 10
  };

  // polyfill/hijack fetch
  /* global global, window */
  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  _global.fetch = url => {
    return Promise.resolve(JSON.stringify(tileJSON));
  };

  const onAfterUpdate = ({layer, subLayers}) => {
    if (!layer.isLoaded) {
      t.is(subLayers.length, 0);
    } else {
      t.is(subLayers.length, 2, 'Rendered sublayers');
      t.is(layer.state.data.length, 3, 'Data is loaded');
      t.is(layer.state.tileset.minZoom, tileJSON.minZoom, 'Min zoom layer is correct');
      t.is(layer.state.tileset.minZoom, tileJSON.maxZoom, 'Max zoom layer is correct');
      t.ok(layer.isLoaded, 'Layer is loaded');
    }
  };

  const testCases = [
    {
      props: {
        data: 'http://echo.jsontest.com/key/value'
      },
      onAfterUpdate
    },
    {
      props: {
        data: tileJSON
      },
      onAfterUpdate
    }
  ];
  await testLayerAsync({Layer: TestMVTLayer, viewport: testViewport, testCases, onError: t.notOk});
  t.end();

  // restore fetcch
  _global.fetch = fetch;
});

test('MVT#getVisibleTiles', async t => {
  class TestMVTLayerVisibleTiles extends MVTLayer {
    getTileData() {
      return geoJSONData;
    }
  }

  TestMVTLayerVisibleTiles.componentName = 'TestMVTLayerVisibleTiles';

  const LOCAL_COORDS_TEST_CASES = [null, undefined, 1, true, false, '', 'local'];
  const WGS84_TEST_CASE = 'wgs84';

  const testCases = [
    {
      props: {
        data: ['https://a.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png'],
        id: 'mvt-visible-tiles-test'
      },
      onAfterUpdate: async ({layer}) => {
        if (layer.isLoaded) {
          for (const tc of LOCAL_COORDS_TEST_CASES) {
            const selectedTiles = await layer.getVisibleTiles(tc);

            selectedTiles.forEach(tile => {
              t.ok(!tile.dataWithWGS84Coords, 'Correctly skips tile data transformation to WGS84.');
            });
          }

          const selectedTiles = await layer.getVisibleTiles(WGS84_TEST_CASE);

          selectedTiles.forEach(tile => {
            t.ok('dataWithWGS84Coords' in tile, 'Tile data correctly transformed to WGS84.');
          });
        }
      }
    }
  ];

  await testLayerAsync({Layer: TestMVTLayerVisibleTiles, testCases, onError: t.notOk});

  t.end();
});
