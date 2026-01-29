// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {cellToBoundary, cellToLatLng, gridDisk, compactCells} from 'h3-js';
import {_count as count, WebMercatorViewport} from '@deck.gl/core';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils';
import {H3HexagonLayer, H3ClusterLayer} from '@deck.gl/geo-layers';
import {scalePolygon, normalizeLongitudes} from '@deck.gl/geo-layers/h3-layers/h3-utils';
import data from 'deck.gl-test/data/h3-sf.json';

const SAMPLE_PROPS = {
  data,
  getHexagon: d => d.hexagons[0]
};

test('H3Utils#scalePolygon', () => {
  const TEST_CASES = [
    {
      coverage: 0,
      verify: (vertices, hexId) => {
        const [lat, lng] = cellToLatLng(hexId);
        return vertices.every(vertex => vertex[0] === lng || vertex[1] === lat);
      }
    },
    {
      coverage: 1,
      verify: (vertices, hexId) => {
        const expectedVertices = cellToBoundary(hexId, true);
        return vertices.every(
          (vertex, i) =>
            vertex[0] === expectedVertices[i][0] || vertex[1] === expectedVertices[i][1]
        );
      }
    },
    {
      coverage: 0.5,
      verify: (vertices, hexId) => {
        const [lat, lng] = cellToLatLng(hexId);
        const end = cellToBoundary(hexId, true);

        return vertices.every(
          (vertex, i) =>
            vertex[0] === 0.5 * (lng + end[i][0]) || vertex[1] === 0.5 * (lat + end[i][1])
        );
      }
    }
  ];
  const HEXID = '88283082e1fffff';

  for (const testCase of TEST_CASES) {
    const vertices = cellToBoundary(HEXID, true);
    scalePolygon(HEXID, vertices, testCase.coverage);
    expect(vertices[0], 'first and last vertices should match').toEqual(
      vertices[vertices.length - 1]
    );
    expect(
      testCase.verify(vertices, HEXID),
      `vertices should match for coverage: ${testCase.coverage}`
    ).toBeTruthy();
  }
});

test('H3Utils#normalizeLongitudes', () => {
  const TEST_CASES = [
    {
      vertices: [
        [-180, 30],
        [90, 76],
        [180, -90],
        [-110, -21]
      ],
      expected: [
        [-180, 30],
        [-270, 76],
        [-180, -90],
        [-110, -21]
      ]
    },
    {
      vertices: [
        [-180, 30],
        [90, 76],
        [180, -90],
        [-110, -21]
      ],
      expected: [
        [180, 30],
        [90, 76],
        [180, -90],
        [250, -21]
      ],
      refLng: 180
    },
    {
      hexId: '88283082e1fffff'
    },
    {
      hexId: '88283082e1fffff',
      refLng: 1
    },
    {
      hexId: '88283082e1fffff',
      refLng: 98
    },
    {
      hexId: '88283082e1fffff',
      refLng: 170
    },
    {
      hexId: '88283082e1fffff',
      refLng: -70
    },
    {
      hexId: '88283082e1fffff',
      refLng: -150
    }
  ];
  for (const testCase of TEST_CASES) {
    let {vertices, refLng} = testCase;
    const {expected, hexId} = testCase;
    vertices = vertices || cellToBoundary(hexId, true);
    normalizeLongitudes(vertices, refLng);
    if (expected) {
      expect(
        vertices,
        `Vertices should get normailized for ${refLng ? refLng : 'first vertex'}`
      ).toEqual(expected);
    }
    refLng = refLng || vertices[0][0];
    expect(
      !vertices.find(vertex => refLng - vertex[0] > 180 || refLng - vertex[0] < -180),
      `vertices should get normaized for ${refLng}`
    ).toBeTruthy();
  }
});

test('H3HexagonLayer', () => {
  const testCases = generateLayerTests({
    Layer: H3HexagonLayer,
    sampleProps: SAMPLE_PROPS,
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayer}) => {
      expect(subLayer.props.stroked, 'stroked prop is forwarded').toBe(layer.props.stroked);

      if (layer._shouldUseHighPrecision()) {
        expect(subLayer.constructor.layerName, 'PolygonLayer').toBeTruthy();
      } else {
        expect(subLayer.constructor.layerName, 'ColumnLayer').toBeTruthy();
      }
    }
  });

  testLayer({Layer: H3HexagonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('H3HexagonLayer#_shouldUseHighPrecision', () => {
  testLayer({
    Layer: H3HexagonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: {
          data: gridDisk('882830829bfffff', 4),
          getHexagon: d => d
        },
        onAfterUpdate({layer, subLayer}) {
          expect(
            layer._shouldUseHighPrecision(),
            'Instanced rendering with standard hexagons'
          ).toBe(false);
          expect(subLayer.constructor.layerName, 'ColumnLayer').toBeTruthy();
        }
      },
      {
        props: {
          data: gridDisk('891c0000003ffff', 4),
          getHexagon: d => d
        },
        onAfterUpdate({layer, subLayer}) {
          expect(
            layer._shouldUseHighPrecision(),
            'Polygon rendering when input contains a pentagon'
          ).toBe(true);
          expect(subLayer.constructor.layerName, 'PolygonLayer').toBeTruthy();
        }
      },
      {
        props: {
          data: compactCells(gridDisk('882830829bfffff', 6)),
          getHexagon: d => d
        },
        onAfterUpdate({layer, subLayer}) {
          expect(
            layer._shouldUseHighPrecision(),
            'Polygon rendering when input contains multiple resolutions'
          ).toBe(true);
          expect(subLayer.constructor.layerName, 'PolygonLayer').toBeTruthy();
        }
      }
    ]
  });
});

test('H3HexagonLayer#viewportUpdate', () => {
  let vertices = null;

  testLayer({
    Layer: H3HexagonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          vertices = layer.state.vertices;
          expect(vertices, 'vertices are generated').toBeTruthy();
        }
      },
      {
        // viewport does not move
        viewport: new WebMercatorViewport({longitude: 0, latitude: 0, zoom: 10}),
        onAfterUpdate({layer}) {
          expect(vertices, 'vertices are not changed').toBe(layer.state.vertices);
        }
      },
      {
        // viewport moves a small distance
        viewport: new WebMercatorViewport({longitude: 0.001, latitude: 0.001, zoom: 10}),
        onAfterUpdate({layer}) {
          expect(vertices, 'vertices are not changed').toBe(layer.state.vertices);
        }
      },
      {
        // far viewport jump, gridDistance throws
        viewport: new WebMercatorViewport({longitude: -100, latitude: 65, zoom: 10}),
        onAfterUpdate({layer}) {
          expect(vertices, 'vertices are updated').not.toBe(layer.state.vertices);
          vertices = layer.state.vertices;
        }
      },
      {
        // viewport moves far enough
        viewport: new WebMercatorViewport({longitude: -102, latitude: 60, zoom: 10}),
        onAfterUpdate({layer}) {
          expect(vertices, 'vertices are updated').not.toBe(layer.state.vertices);
          vertices = layer.state.vertices;
        }
      }
    ]
  });
});

test('H3HexagonLayer#mergeTriggers', () => {
  testLayer({
    Layer: H3HexagonLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: Object.assign({}, SAMPLE_PROPS, {highPrecision: true}),
        onAfterUpdate({layer}) {
          expect(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            'With no other triggers, should use coverage as trigger'
          ).toBe(1);
        }
      },
      {
        updateProps: {
          coverage: 0
        },
        onAfterUpdate({layer}) {
          expect(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            'SubLayer update trigger should be updated to new coverage value'
          ).toBe(0);
        }
      },
      {
        updateProps: {
          updateTriggers: {getHexagon: 0}
        },
        onAfterUpdate({layer}) {
          expect(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            'SubLayer update trigger should be merged correctly'
          ).toEqual({getHexagon: 0, coverage: 0});
        }
      },
      {
        updateProps: {
          updateTriggers: {getHexagon: ['A', 1]}
        },
        onAfterUpdate({layer}) {
          expect(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            'SubLayer update trigger should be merged correctly with Array'
          ).toEqual({0: 'A', 1: 1, coverage: 0});
        }
      },
      {
        updateProps: {
          coverage: 0.75,
          updateTriggers: {getHexagon: {a: 'abc'}}
        },
        onAfterUpdate({layer}) {
          expect(
            layer.internalState.subLayers[0].props.updateTriggers.getPolygon,
            'SubLayer update trigger should be merged correctly with Object'
          ).toEqual({a: 'abc', coverage: 0.75});
        }
      }
    ]
  });
});

test('H3ClusterLayer', () => {
  const testCases = generateLayerTests({
    Layer: H3ClusterLayer,
    sampleProps: {
      data,
      getHexagons: d => d.hexagons
      // getElevation: d => d.size
    },
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer}) => {
      expect(
        layer.state.polygons.length >= count(layer.props.data),
        'polygons are generated'
      ).toBeTruthy();
    }
  });

  testLayer({Layer: H3ClusterLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

/** Verify that accessors are properly wrapped to access the source object */
test('H3ClusterLayer#accessor', () => {
  const elevations = [];

  testLayer({
    Layer: H3ClusterLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: {
          data,
          getHexagons: d => d.hexagons,
          getElevation: d => {
            const elevation = d.size;
            elevations.push(elevation);
            return elevation;
          }
        },
        onAfterUpdate: () => {
          expect(elevations.every(Number.isFinite), 'Elevations populated').toBeTruthy();
        }
      }
    ]
  });
});
