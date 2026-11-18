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
import {Field, List, Schema, Table, Uint8, tableFromArrays, vectorFromArray} from 'apache-arrow';

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
    matrix: [null, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1]],
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
  [SimpleMeshLayer, {getScale: 'scale', getTransformMatrix: 'matrix'}],
  [ScenegraphLayer, {getScale: 'scale', getTransformMatrix: 'matrix'}]
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
    const validate = ({layer}) => {
      if (!layer.isLoaded || layer.internalState?.needsUpdate) {
        return;
      }
      for (const [prop, column] of entries) {
        expect(layer.props[prop](null, {index: 1})).toEqual(toValue(data.getChild(column)!.get(1)));
      }
      if (Layer === SimpleMeshLayer || Layer === ScenegraphLayer) {
        const matrix = layer.getAttributeManager()?.getAttributes().instanceModelMatrix?.value;
        expect(Array.from(matrix.slice(9, 12))).toEqual([0, 0, 0]);
        expect(Array.from(matrix.slice(21, 24))).toEqual([10, 20, 30]);
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

test('TextLayer refreshes sublayer colors when an Arrow or SQL accessor changes', async () => {
  const data = tableFromArrays({
    position: [[0, 0]],
    normalizedColor: [[1, 0, 0, 1]]
  });
  const integerColors = vectorFromArray(
    [[0, 255, 0, 255]],
    new List(new Field('item', new Uint8()))
  );
  const checkColor =
    (color: number[]) =>
    ({layer}) => {
      if (layer.isLoaded && !layer.internalState?.needsUpdate) {
        const glyphs = layer.getSubLayers().find(sublayer => sublayer.id.endsWith('-characters'));
        const attribute = glyphs.getAttributeManager().getAttributes().instanceColors;
        expect(Array.from(attribute.value.slice(0, 4))).toEqual(color);
      }
    };
  await testLayerAsync({
    Layer: TextLayer,
    device,
    draw: false,
    testCases: [
      {
        props: {
          data,
          getPosition: data.getChild('position')!,
          getText: () => 'A',
          getColor: data.getChild('normalizedColor')!
        },
        onAfterUpdate: checkColor([255, 0, 0, 255])
      },
      {updateProps: {getColor: integerColors}, onAfterUpdate: checkColor([0, 255, 0, 255])},
      {
        updateProps: {getColor: {sql: 'normalizedColor'}},
        onAfterUpdate: checkColor([255, 0, 0, 255])
      }
    ],
    onError: error => {
      throw error;
    }
  });
});

test('PathLayer repeats an RGBA SQL color across vertices in RGB format', async () => {
  const data = tableFromArrays({
    path: [
      [
        [0, 0],
        [1, 0],
        [2, 0]
      ]
    ],
    color: [[1, 0.5, 0, 1]]
  });
  await testLayerAsync({
    Layer: PathLayer,
    device,
    draw: false,
    testCases: [
      {
        props: {
          data,
          colorFormat: 'RGB',
          getPath: data.getChild('path')!,
          getColor: {sql: 'color'}
        },
        onAfterUpdate: ({layer}) => {
          if (layer.isLoaded && !layer.internalState?.needsUpdate) {
            const {instanceColors} = layer.getAttributeManager()!.getAttributes();
            expect(Array.from(instanceColors.value!.slice(0, 6))).toEqual([
              255, 128, 0, 255, 128, 0
            ]);
          }
        }
      }
    ]
  });
});
