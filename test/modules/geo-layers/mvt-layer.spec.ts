// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils/vitest';
import {MVTLayer} from '@deck.gl/geo-layers';
import {ClipExtension} from '@deck.gl/extensions';
import {transform} from '@deck.gl/geo-layers/mvt-layer/coordinate-transform';
import findIndexBinary from '@deck.gl/geo-layers/mvt-layer/find-index-binary';
import {GeoJsonLayer} from '@deck.gl/layers';
import {geojsonToBinary} from '@loaders.gl/gis';
import {MVTLoader} from '@loaders.gl/mvt';

import {ScatterplotLayer} from '@deck.gl/layers';
import {WebMercatorViewport} from '@deck.gl/core';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';

import {testPickingLayer} from '../layers/test-picking-layer';

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

const geoJSONDataWGS84 = [
  {
    ...geoJSONData[0],
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [111.26953125, -80.35699541661765],
          [111.44531250000001, -80.38639582973977],
          [111.26953125, -80.38639582973977],
          [111.26953125, -80.35699541661765]
        ]
      ]
    }
  }
];

const geoJSONBinaryData = geojsonToBinary(JSON.parse(JSON.stringify(geoJSONData)));

const TRANSFORM_COORDS_DATA = [
  {
    result: {type: 'Point', coordinates: [-135, 79.17133464081945]},
    geom: {
      type: 'Point',
      coordinates: [0.25, 0.25] // local coords
    }
  },
  {
    result: {
      type: 'MultiPoint',
      coordinates: [
        [-135, 79.17133464081945],
        [-90, 66.51326044311185]
      ]
    },
    geom: {
      type: 'MultiPoint',
      coordinates: [
        [0.25, 0.25],
        [0.5, 0.5]
      ] // local coords
    }
  },
  {
    result: {
      type: 'Polygon',
      coordinates: [
        [
          [-180, 0],
          [0, 0],
          [0, 66.51326044311185],
          [-180, 0]
        ]
      ]
    },
    geom: {
      type: 'Polygon',
      coordinates: [
        [
          [0, 1],
          [1, 1],
          [1, 0.5],
          [0, 1]
        ]
      ] // local coords
    }
  },
  {
    result: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-180, 0],
            [0, 0],
            [0, 66.51326044311185],
            [-180, 0]
          ],
          [
            [-180, 0],
            [0, -66.51326044311185],
            [0, -40.97989806962013],
            [-180, 0]
          ]
        ]
      ]
    },
    geom: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 1],
            [1, 1],
            [1, 0.5],
            [0, 1]
          ],
          [
            [0, 1],
            [1, 1.5],
            [1, 1.25],
            [0, 1]
          ]
        ]
      ] // local coords
    }
  },
  {
    result: {
      type: 'LineString',
      coordinates: [
        [-180, 85.0511287798066],
        [-180, 0]
      ]
    },
    geom: {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [0, 1]
      ] // local coords
    }
  },
  {
    result: {
      type: 'MultiLineString',
      coordinates: [
        [
          [-180, 85.0511287798066],
          [-180, 0]
        ],
        [
          [-90, 66.51326044311185],
          [-180, 0]
        ]
      ]
    },
    geom: {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [0, 1]
        ],
        [
          [0.5, 0.5],
          [0, 1]
        ]
      ] // local coords
    }
  }
];

test('ClipExtension', () => {
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
          const uniforms = getLayerUniforms(layer);
          if (layer.id.includes('-points-')) {
            expect(uniforms.bounds && uniforms.bounds[0] === 0, 'has bounds uniform').toBeTruthy();
          } else {
            expect(
              uniforms.bounds && uniforms.bounds[0] === 256,
              'has bounds uniform'
            ).toBeTruthy();
          }
        }
      }
    }
  ];

  testLayer({Layer: GeoJsonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('MVTLayer#transformCoordsToWGS84', () => {
  const viewport = new WebMercatorViewport({
    latitude: 0,
    longitude: 0,
    zoom: 1
  });

  const bbox = {west: -180, north: 85.0511287798066, east: 0, south: 0};

  for (const tc of TRANSFORM_COORDS_DATA) {
    const func = transform(tc.geom, bbox, viewport);
    expect(func, `transform ${tc.geom.type} returned expected WGS84 coordinates`).toEqual(
      tc.result
    );
  }
});

test('MVTLayer#autoHighlight', async () => {
  class TestMVTLayer extends MVTLayer {
    getTileData() {
      return this.state.binary ? geoJSONBinaryData : geoJSONData;
    }
  }

  TestMVTLayer.layerName = 'TestMVTLayer';

  const onAfterUpdate = ({subLayers}) => {
    for (const layer of subLayers) {
      expect(layer.props.pickable, 'MVT Sublayer is pickable').toBeTruthy();
      expect(!layer.props.autoHighlight, 'AutoHighlight should be disabled').toBeTruthy();
      expect(layer.props.highlightedObjectIndex, 'Feature highlighted has index 0').toBe(0);
    }
  };

  const testCases = [
    // Highlight using id field
    {
      props: {
        data: ['https://json/{z}/{x}/{y}.mvt'],
        id: 'mvt-highlight-test',
        filled: true,
        pickable: true,
        autoHighlight: true,
        highlightedFeatureId: 1,
        binary: false
      },
      onAfterUpdate
    },
    // highlight using a property
    {
      updateProps: {
        data: ['https://json_2/{z}/{x}/{y}.mvt'],
        uniqueIdProperty: 'cartodb_id',
        highlightedFeatureId: 148
      },
      onAfterUpdate
    },
    // highlight binary data
    {
      updateProps: {
        binary: true,
        data: ['https://binary/{z}/{x}/{y}.mvt'],
        uniqueIdProperty: 'cartodb_id',
        highlightedFeatureId: 148
      },
      onAfterUpdate
    }
  ];

  await testLayerAsync({Layer: TestMVTLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

for (const binary of [true, false]) {
  test(`MVTLayer#picking binary:${binary}`, async () => {
    class TestMVTLayer extends MVTLayer {
      getTileData() {
        return this.state.binary ? geoJSONBinaryData : geoJSONData;
      }
    }

    TestMVTLayer.layerName = 'TestMVTLayer';

    await testPickingLayer({
      layer: new TestMVTLayer({
        id: 'mvt',
        binary,
        data: ['https://json_2/{z}/{x}/{y}.mvt'],
        uniqueIdProperty: 'cartodb_id',
        autoHighlight: true
      }),
      viewport: new WebMercatorViewport({
        latitude: 0,
        longitude: 0,
        zoom: 1
      }),
      testCases: [
        {
          pickedColor: new Uint8Array([1, 0, 0, 0]),
          pickedLayerId: 'mvt-0-0-1-polygons-fill',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('hover over polygon');
            expect(info.object, 'info.object is populated').toBeTruthy();
            expect(info.object.properties, 'info.object.properties is populated').toBeTruthy();
            expect(info.object.geometry, 'info.object.geometry is populated').toBeTruthy();
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === 0),
              'set sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        },
        {
          pickedColor: new Uint8Array([0, 0, 0, 0]),
          pickedLayerId: '',
          mode: 'hover',
          onAfterUpdate: ({layer, subLayers, info}) => {
            console.log('pointer leave');
            expect(info.object, 'info.object is not populated').toBeFalsy();
            expect(
              subLayers.every(l => l.props.highlightedObjectIndex === -1),
              'cleared sub layers highlightedObjectIndex'
            ).toBeTruthy();
          }
        }
      ]
    });
  });
}

test('MVTLayer#TileJSON', async () => {
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
  const fetch = globalThis.fetch;

  globalThis.fetch = url => {
    return Promise.resolve(JSON.stringify(tileJSON));
  };

  const onAfterUpdate = ({layer, subLayers}) => {
    if (layer.isLoaded) {
      expect(subLayers.length, 'Rendered sublayers').toBe(2);
      expect(layer.state.data.length, 'Data is loaded').toBe(3);
      expect(layer.state.tileset.minZoom, 'Min zoom layer is correct').toBe(tileJSON.minZoom);
      expect(layer.state.tileset.minZoom, 'Max zoom layer is correct').toBe(tileJSON.maxZoom);
    }
  };

  const testCases = [
    {
      props: {
        data: tileJSON.tiles,
        binary: false
      },
      onAfterUpdate
    },
    {
      props: {
        data: tileJSON,
        binary: false
      },
      onAfterUpdate
    }
  ];
  await testLayerAsync({
    Layer: TestMVTLayer,
    viewport: testViewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
  // restore fetcch
  globalThis.fetch = fetch;
});

test('MVTLayer#dataInWGS84', async () => {
  class TestMVTLayer extends MVTLayer {
    getTileData() {
      return this.state.binary ? geoJSONBinaryData : geoJSONData;
    }
  }

  TestMVTLayer.layerName = 'TestMVTLayer';

  const viewport = new WebMercatorViewport({
    longitude: 0,
    latitude: 0,
    zoom: 0
  });

  const onAfterUpdate = ({layer}) => {
    if (layer.isLoaded) {
      const tile = layer.state.tileset.selectedTiles[0];

      const contentWGS84 = tile.dataInWGS84;

      expect(contentWGS84[0].geometry.coordinates, 'should transform to WGS84').toEqual(
        geoJSONDataWGS84[0].geometry.coordinates
      );
      expect(tile._contentWGS84, 'should set cache for further requests').not.toBe(undefined);
      expect(tile.dataInWGS84, 'should use the cache').toBe(contentWGS84);

      tile.content = null;
      tile._contentWGS84 = null;
      expect(tile.dataInWGS84, 'should return null if content is null').toBe(null);
    }
  };

  const testCases = [
    {
      props: {
        data: ['https://server.com/{z}/{x}/{y}.mvt'],
        binary: false
      },
      onAfterUpdate
    }
    // TODO: comment out when https://github.com/visgl/loaders.gl/pull/1137 is merged
    // {
    //   updateProps: {
    //     data: ['https://binary.com/{z}/{x}/{y}.mvt'],
    //     binary: true
    //   },
    //   onAfterUpdate
    // }
  ];

  await testLayerAsync({
    Layer: TestMVTLayer,
    viewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

test('MVTLayer#triangulation', async () => {
  const viewport = new WebMercatorViewport({
    longitude: -100,
    latitude: 40,
    zoom: 3,
    pitch: 0,
    bearing: 0
  });

  const onAfterUpdate = ({layer}) => {
    if (!layer.isLoaded) {
      return;
    }
    const geoJsonLayer = layer.internalState.subLayers[0];
    const data = geoJsonLayer.props.data;
    if (layer.state.binary) {
      // Triangulated binary data should be passed
      expect(data.polygons.triangles, 'should triangulate').toBeTruthy();
    } else {
      // GeoJSON should be passed (3 Features)
      expect(!data.polygons, 'should not triangulate').toBeTruthy();
      expect(data.length, 'should pass GeoJson').toBe(3);
    }
  };

  const props = {
    data: ['./test/data/mvt-with-hole/{z}/{x}/{y}.mvt'],
    binary: true,
    onTileError: error => {
      if (!(error.message && error.message.includes('404'))) {
        throw error;
      }
    },
    loaders: [MVTLoader]
  };
  const testCases = [{props, onAfterUpdate}];

  // Run as separate test runs otherwise data is cached
  await testLayerAsync({
    Layer: MVTLayer,
    viewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
  testCases[0].props.binary = false;
  await testLayerAsync({
    Layer: MVTLayer,
    viewport,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});

for (const tileset of ['mvt-tiles', 'mvt-with-hole']) {
  test(`MVTLayer#data.length ${tileset}`, async () => {
    const viewport = new WebMercatorViewport({
      longitude: -100,
      latitude: 40,
      zoom: 3,
      pitch: 0,
      bearing: 0
    });

    let binaryDataLength;
    let geoJsonDataLength;
    let requests = 0;
    const onAfterUpdate = ({layer}) => {
      if (!layer.isLoaded) {
        return;
      }
      const geoJsonLayer = layer.internalState.subLayers[0];
      const polygons = geoJsonLayer.state.layerProps.polygons;
      if (layer.props.binary) {
        binaryDataLength = polygons.data.length;
        requests++;
      } else {
        geoJsonDataLength = polygons.data.length;
        requests++;
      }

      if (requests === 2) {
        expect(geoJsonDataLength, 'should have equal length').toBe(binaryDataLength);
      }
    };

    // To avoid caching use different URLs
    const url1 = [`./test/data/${tileset}/{z}/{x}/{y}.mvt?test1`];
    const url2 = [`./test/data/${tileset}/{z}/{x}/{y}.mvt?test2`];
    const props = {
      onTileError: error => {
        if (!(error.message && error.message.includes('404'))) {
          throw error;
        }
      },
      loaders: [MVTLoader]
    };
    const testCases = [
      {props: {binary: false, data: url1, ...props}, onAfterUpdate},
      {props: {binary: true, data: url2, ...props}, onAfterUpdate}
    ];

    await testLayerAsync({
      Layer: MVTLayer,
      viewport,
      testCases,
      onError: err => expect(err).toBeFalsy()
    });
  });
}

test('findIndexBinary', () => {
  const testData = geojsonToBinary([
    {
      // For testing id collision
      id: 1,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {
        numericalId: 300,
        stringId: 'B',
        layerName: 'label'
      }
    },
    {
      id: 1,
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 1],
            [2, 2]
          ]
        ]
      },
      properties: {
        numericalId: 100,
        stringId: 'A',
        layerName: 'water'
      }
    },
    {
      id: 2,
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1]
        ]
      },
      properties: {
        numericalId: 200,
        stringId: 'B',
        layerName: 'road'
      }
    },
    {
      id: 3,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0]
      },
      properties: {
        numericalId: 300,
        stringId: 'C',
        layerName: 'poi'
      }
    },
    {
      id: 3,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [1, 1]
      },
      properties: {
        numericalId: 400,
        stringId: 'D',
        layerName: 'poi'
      }
    }
  ]);

  // @loaders.gl/gis does not populate fields as of 3.0.8
  testData.polygons.fields = [{id: 1}];
  testData.lines.fields = [{id: 2}];
  testData.points.fields = [{id: 1}, {id: 3}, {id: 4}];

  expect(findIndexBinary(testData, '', 3), 'Find by default id').toBe(3);
  expect(findIndexBinary(testData, '', 1), 'Find by default id').toBe(0);
  expect(findIndexBinary(testData, '', 1, 'water'), 'Find by default id with layer name').toBe(1);
  expect(findIndexBinary(testData, 'numericalId', 200), 'Find by numerical id').toBe(2);
  expect(findIndexBinary(testData, 'numericalId', 300), 'Find by numerical id').toBe(0);
  expect(
    findIndexBinary(testData, 'numericalId', 300, 'poi'),
    'Find by numerical id with layer name'
  ).toBe(3);
  expect(findIndexBinary(testData, 'stringId', 'A'), 'Find by string id').toBe(1);
  expect(findIndexBinary(testData, 'stringId', 'B'), 'Find by string id').toBe(0);
  expect(
    findIndexBinary(testData, 'stringId', 'B', 'road'),
    'Find by string id with layer name'
  ).toBe(2);
});

test('MVTLayer#GeoJsonLayer.defaultProps', () => {
  let didDraw = false;
  class TestMVTLayer extends MVTLayer {
    initializeState() {}

    renderLayers() {
      didDraw = true;
    }
  }

  const onBeforeUpdate = () => (didDraw = false);
  const testCases = [
    {
      title: 'GeoJsonLayer#shallow update',
      props: {
        id: 'testLayer',
        data: [],
        getTileData: () => {}, // TileLayer prop
        getFillColor: () => [128, 0, 0, 255] // GeoJsonLayer prop
      },
      onBeforeUpdate,
      onAfterUpdate: ({layer, subLayers}) => {
        expect(didDraw, 'should draw layer').toBeTruthy();
      }
    },
    {
      updateProps: {
        getTileData: () => {}
      },
      onBeforeUpdate,
      onAfterUpdate: ({layer, subLayers}) => {
        expect(didDraw, 'should not update after shallow TileLayer accessor update').toBeFalsy();
      }
    },
    {
      updateProps: {
        getFillColor: () => [128, 0, 0, 255]
      },
      onBeforeUpdate,
      onAfterUpdate: ({layer, subLayers}) => {
        expect(didDraw, 'should not update after shallow GeoJsonLayer accessor update').toBeFalsy();
      }
    }
  ];

  testLayer({Layer: TestMVTLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
