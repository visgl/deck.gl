// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {
  H3HexagonLayer,
  H3ClusterLayer,
  S2Layer,
  GeohashLayer,
  QuadkeyLayer,
  A5Layer
} from '@deck.gl/geo-layers';
import {vectorFromArray} from 'apache-arrow';

for (const [Layer, cell] of [
  [H3HexagonLayer, '8928308280fffff'],
  [H3ClusterLayer, '8928308280fffff'],
  [S2Layer, '89c25'],
  [GeohashLayer, '9q8yy'],
  [QuadkeyLayer, '120'],
  [A5Layer, '2e80000000000000']
] as const) {
  test(`${Layer.layerName} renders cell columns and replaces feature styles`, () => {
    const cells = vectorFromArray([cell]);
    let previousCells;
    let previousRows;
    testLayer({
      Layer: Layer as typeof H3HexagonLayer,
      testCases: [
        {
          title: 'initialize columns',
          props: {cells, elevations: vectorFromArray([10]), extruded: true, pickable: true}
        },
        {title: 'opacity update', updateProps: {opacity: 0.5}},
        {title: 'replace styles', updateProps: {elevations: vectorFromArray([20])}},
        {
          title: 'replace geometry',
          updateProps: {cells: vectorFromArray([cell, cell]), elevations: vectorFromArray([30, 40])}
        }
      ].map(testCase => ({
        ...testCase,
        onAfterUpdate: ({layer, subLayer}) => {
          expect(subLayer).toBeTruthy();
          const rows = subLayer.props.data;
          if (previousCells === layer.props.cells) expect(rows).toBe(previousRows);
          previousCells = layer.props.cells;
          previousRows = rows;
          expect(rows.length).toBe(layer.props.cells.length);
          expect(subLayer.props.getElevation(rows[0], {index: 0})).toBe(
            layer.props.elevations.get(0)
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
  test(`${Layer.layerName} restores accessor geometry when cells are removed`, () => {
    const id = '8928308280fffff';
    testLayer({
      Layer: Layer as typeof H3HexagonLayer,
      testCases: [
        {
          title: 'initialize columns',
          props: {data: [{hexagon: id, hexagons: [id]}], cells: vectorFromArray([id])}
        },
        {title: 'restore accessors', updateProps: {cells: null}}
      ].map(testCase => ({
        ...testCase,
        onAfterUpdate: ({layer, subLayer}) => {
          expect(subLayer).toBeTruthy();
          if (!layer.props.cells) {
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
