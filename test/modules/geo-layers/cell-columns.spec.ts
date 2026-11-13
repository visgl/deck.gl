// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {
  H3HexagonLayer,
  H3ClusterLayer,
  S2Layer,
  GeohashLayer,
  QuadkeyLayer,
  A5Layer
} from '@deck.gl/geo-layers';
import {Table, vectorFromArray} from 'apache-arrow';

for (const [Layer, accessor, cell] of [
  [H3HexagonLayer, 'getHexagon', '8928308280fffff'],
  [H3ClusterLayer, 'getHexagons', '8928308280fffff'],
  [S2Layer, 'getS2Token', '89c25'],
  [GeohashLayer, 'getGeohash', '9q8yy'],
  [QuadkeyLayer, 'getQuadkey', '120'],
  [A5Layer, 'getPentagon', '2e80000000000000']
] as const) {
  test(`${Layer.layerName} renders cell columns and replaces feature styles`, () => {
    const cells = vectorFromArray([cell]);
    let previousCells;
    let previousRows;
    let geometryUpdates: ReturnType<typeof vi.spyOn>[] = [];
    testLayer({
      Layer: Layer as typeof H3HexagonLayer,
      testCases: [
        {
          title: 'initialize columns',
          props: {
            [accessor]: cells,
            getElevation: vectorFromArray([10]),
            extruded: true,
            pickable: true
          }
        },
        {title: 'opacity update', updateProps: {opacity: 0.5}},
        {title: 'replace styles', updateProps: {getElevation: vectorFromArray([20])}},
        {
          title: 'replace geometry',
          updateProps: {
            [accessor]: vectorFromArray([cell, cell]),
            getElevation: vectorFromArray([30, 40])
          }
        }
      ].map(testCase => ({
        ...testCase,
        onAfterUpdate: ({layer, subLayer}) => {
          expect(subLayer).toBeTruthy();
          const rows = subLayer.props.data;
          if (previousCells === layer.props[accessor]) {
            expect(subLayer.props.dataComparator(rows, previousRows)).toBe(true);
            expect(subLayer.internalState.changeFlags.dataChanged).toBeFalsy();
            for (const update of geometryUpdates) expect(update).not.toHaveBeenCalled();
          }
          for (const update of geometryUpdates) update.mockRestore();
          geometryUpdates = [];
          const watchGeometry = (child: any) => {
            if (child.state?.polygonTesselator) {
              geometryUpdates.push(vi.spyOn(child.state.polygonTesselator, 'updateGeometry'));
            }
            const positions = child.getAttributeManager?.()?.getAttributes().instancePositions;
            if (positions) geometryUpdates.push(vi.spyOn(positions, 'updateBuffer'));
            for (const descendant of child.getSubLayers?.() ?? []) watchGeometry(descendant);
          };
          watchGeometry(subLayer);
          expect(geometryUpdates.length).toBeGreaterThan(0);
          previousCells = layer.props[accessor];
          previousRows = rows;
          expect(rows.length).toBe(layer.props[accessor].length);
          expect(subLayer.props.getElevation(rows[0], {index: 0})).toBe(
            layer.props.getElevation.get(0)
          );
        }
      })),
      onError: error => {
        throw error;
      }
    });
  });
}

for (const Layer of [H3HexagonLayer, H3ClusterLayer]) {
  const accessor = Layer === H3HexagonLayer ? 'getHexagon' : 'getHexagons';
  test(`${Layer.layerName} restores accessor geometry when cells are removed`, () => {
    const id = '8928308280fffff';
    testLayer({
      Layer: Layer as typeof H3HexagonLayer,
      testCases: [
        {
          title: 'initialize columns',
          props: {data: [{hexagon: id, hexagons: [id]}], [accessor]: vectorFromArray([id])}
        },
        {
          title: 'restore accessors',
          updateProps: {[accessor]: row => row[accessor === 'getHexagon' ? 'hexagon' : 'hexagons']}
        }
      ].map(testCase => ({
        ...testCase,
        onAfterUpdate: ({layer, subLayer}) => {
          expect(subLayer).toBeTruthy();
          if (typeof layer.props[accessor] === 'function') {
            if (layer instanceof H3HexagonLayer) expect(layer.state.resolution).toBe(9);
            else expect(layer.state.polygons.length).toBeGreaterThan(0);
          }
        }
      })),
      onError: error => {
        throw error;
      }
    });
  });
}

test('H3ClusterLayer does not apply source comparators to generated polygons', () => {
  testLayer({
    Layer: H3ClusterLayer,
    testCases: [
      {
        props: {
          data: [{hexagons: ['8928308280fffff'], version: 1}],
          getHexagons: d => d.hexagons,
          dataComparator: (next, old) => next[0]?.version === old[0]?.version
        }
      },
      {updateProps: {data: [{hexagons: ['8928308280fffff', '8928308280bffff'], version: 2}]}}
    ].map(testCase => ({
      ...testCase,
      onAfterUpdate: ({layer, subLayer}) => {
        expect(subLayer.props.data).toBe(layer.state.polygons);
        expect(subLayer.props.dataComparator).toBeFalsy();
      }
    })),
    onError: error => {
      throw error;
    }
  });
});

test('Arrow table style updates skip descendant polygon tessellation', () => {
  const data = new Table({value: vectorFromArray([1])});
  const cells = vectorFromArray(['89c25']);
  let geometryUpdate;
  testLayer({
    Layer: S2Layer,
    testCases: [
      {
        props: {data, getS2Token: cells, getElevation: vectorFromArray([10])},
        onAfterUpdate: ({subLayer}) => {
          const fill = subLayer
            .getSubLayers()[0]
            .getSubLayers()
            .find(child => child.state.polygonTesselator);
          expect(fill).toBeTruthy();
          geometryUpdate = vi.spyOn(fill.state.polygonTesselator, 'updateGeometry');
        }
      },
      {
        updateProps: {opacity: 0.5, getElevation: vectorFromArray([20])},
        onAfterUpdate: () => {
          expect(geometryUpdate).not.toHaveBeenCalled();
          geometryUpdate.mockRestore();
        }
      }
    ],
    onError: error => {
      throw error;
    }
  });
});
