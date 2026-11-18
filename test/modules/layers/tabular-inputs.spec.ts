// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {
  GeoJsonLayer,
  IconLayer,
  PathLayer,
  PolygonLayer,
  SolidPolygonLayer,
  TextLayer
} from '@deck.gl/layers';
import {
  ContourLayer,
  GridLayer,
  HeatmapLayer,
  HexagonLayer,
  ScreenGridLayer
} from '@deck.gl/aggregation-layers';
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {CubeGeometry, GroupNode} from '@luma.gl/engine';
import {TripsLayer} from '@deck.gl/geo-layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Field, Schema, Table, tableFromArrays} from 'apache-arrow';

/** Inputs with matching geometry, text, position, and style columns. */
function makeTable() {
  const rows = tableFromArrays({
    geometry: ['POINT (0 0)', 'POINT (1 1)'],
    position: [
      [0, 0],
      [1, 1]
    ],
    path: [
      [
        [0, 0],
        [1, 0]
      ],
      [
        [1, 1],
        [2, 1]
      ]
    ],
    polygon: [
      [
        [0, 0],
        [1, 0],
        [0, 1]
      ],
      [
        [1, 1],
        [2, 1],
        [1, 2]
      ]
    ],
    timestamps: [
      [0, 1],
      [0, 1]
    ],
    label: ['A', 'B'],
    scale: [
      [1, 1, 1],
      [2, 2, 2]
    ],
    weight: [3, 7]
  });
  const schema = new Schema(
    rows.schema.fields.map(field =>
      field.name === 'geometry'
        ? new Field(
            field.name,
            field.type,
            true,
            new Map([['ARROW:extension:name', 'geoarrow.wkt']])
          )
        : field
    )
  );
  return new Table(schema, rows.batches);
}

/** One representative row accessor per affected renderer. */
const cases = [
  [PathLayer, {getPath: 'path'}],
  [TripsLayer, {getPath: 'path', getTimestamps: 'timestamps'}],
  [PolygonLayer, {getPolygon: 'polygon'}],
  [SolidPolygonLayer, {getPolygon: 'polygon'}],
  [TextLayer, {getText: 'label', getPosition: 'position'}],
  [GeoJsonLayer, {getPointRadius: 'weight'}],
  [ContourLayer, {getPosition: 'position', getWeight: 'weight'}],
  [GridLayer, {getPosition: 'position', getColorWeight: 'weight'}],
  [HeatmapLayer, {getPosition: 'position', getWeight: 'weight'}],
  [HexagonLayer, {getPosition: 'position', getColorWeight: 'weight'}],
  [ScreenGridLayer, {getPosition: 'position', getWeight: 'weight'}],
  [IconLayer, {getIcon: 'label'}],
  [SimpleMeshLayer, {getScale: 'scale'}],
  [ScenegraphLayer, {getScale: 'scale'}]
] as const;

/** Materializes nested Arrow list cells for comparisons with row accessor output. */
function toValue(value: any): unknown {
  return value && typeof value.get === 'function'
    ? Array.from({length: value.length}, (_, index) => toValue(value.get(index)))
    : value;
}

for (const [Layer, accessors] of cases) {
  test(`${Layer.layerName} accepts Arrow vectors, SQL and empty data`, async () => {
    const data = makeTable();
    const entries = Object.entries(accessors);
    const vectorProps = Object.fromEntries(
      entries.map(([prop, column]) => [prop, data.getChild(column)])
    );
    const sqlProps = Object.fromEntries(entries.map(([prop, column]) => [prop, {sql: column}]));
    const initial = Object.fromEntries(
      entries.map(([prop]) => [prop, new Layer({} as never).props[prop]])
    );
    const validate = async ({layer}) => {
      await expect.poll(() => layer.isLoaded).toBe(true);
      for (const [prop, column] of entries) {
        expect(layer.props[prop](null, {index: 1})).toEqual(toValue(data.getChild(column)!.get(1)));
      }
    };
    const resources =
      Layer === SimpleMeshLayer
        ? {mesh: new CubeGeometry()}
        : Layer === ScenegraphLayer
          ? {scenegraph: new GroupNode([])}
          : Layer === IconLayer
            ? {
                iconAtlas: device.createTexture({width: 1, height: 1}),
                iconMapping: {
                  A: {x: 0, y: 0, width: 1, height: 1},
                  B: {x: 0, y: 0, width: 1, height: 1}
                }
              }
            : {};
    try {
      await testLayerAsync({
        Layer: Layer as typeof PathLayer,
        device,
        draw: false,
        testCases: [
          {props: {data: null, ...resources, ...sqlProps}},
          {updateProps: {data, ...vectorProps}, onAfterUpdate: validate},
          {updateProps: {data, ...sqlProps}, onAfterUpdate: validate},
          {updateProps: {data: data.slice(0, 0), ...sqlProps}},
          {
            updateProps: {data: null, ...initial},
            onAfterUpdate: ({layer}) => expect(layer.getNumInstances()).toBe(0)
          },
          {updateProps: {data, ...sqlProps}, onAfterUpdate: validate}
        ],
        onError: error => {
          throw error;
        }
      });
    } finally {
      resources.iconAtlas?.destroy();
    }
  });
}
