// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test} from 'vitest';
import {GPUDataEvaluator} from '@luma.gl/gpgpu';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Buffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import GPUVectorModel from '@deck.gl/core/lib/luma-upstream/gpu-vector-model';
import PathLayer from '@deck.gl/layers/path-layer/path-layer';
import SolidPolygonLayer from '@deck.gl/layers/solid-polygon-layer/solid-polygon-layer';
import TripsLayer from '@deck.gl/geo-layers/trips-layer/trips-layer';

const bufferPoolSize = GPUDataEvaluator.bufferPoolSize;
beforeAll(() => {
  GPUDataEvaluator.bufferPoolSize = 0;
});
afterAll(() => {
  GPUDataEvaluator.bufferPoolSize = bufferPoolSize;
});

const COLORS = [
  [128, 64, 255, 255],
  [32, 200, 96, 192],
  [240, 128, 48, 64]
] as const;
const COLOR = COLORS[0];
const DATA = [
  {
    path: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 1, 0],
      [0, 0, 0]
    ],
    timestamps: [0, 1, 2, 3]
  },
  {
    path: [
      [2, 0, 0],
      [3, 0, 0],
      [3, 1, 0],
      [2, 0, 0]
    ],
    timestamps: [4, 5, 6, 7]
  }
];

function getAttributeBuffer(model: Model, name: string): Buffer {
  const slot =
    model.device.type === 'webgl'
      ? model.pipeline.shaderLayout.attributes!.find(attribute => attribute.name === name)!.location
      : model.vertexArray.getBufferSlot(
          model.bufferLayout.find(layout =>
            layout.attributes?.some(attribute => attribute.attribute === name)
          )!.name
        )!;
  return model.vertexArray.attributes[slot] as Buffer;
}

async function expectBoundColor(
  model: Model,
  name: string,
  color: readonly number[],
  constant: boolean
) {
  if (model.device.type === 'webgl' && constant) {
    const location = model.pipeline.shaderLayout.attributes!.find(
      attribute => attribute.name === name
    )!.location;
    expect(model.vertexArray.attributes[location]).toEqual(
      new Float32Array(color).map(value => value / 255)
    );
    return;
  }
  const layout = model.bufferLayout.find(candidate =>
    candidate.attributes?.some(attribute => attribute.attribute === name)
  )!;
  const definition = layout.attributes!.find(attribute => attribute.attribute === name)!;
  // Both backends normalize these raw bytes through the bound vertex format.
  expect(definition.format).toBe('unorm8x4');
  const bytes = await getAttributeBuffer(model, name).readAsync();
  const offset = definition.byteOffset || 0;
  expect(Array.from(bytes.subarray(offset, offset + 4))).toEqual(color);
  // Packed groups can repeat constant colors in nonzero-stride records.
  if (layout.byteStride && bytes.length >= offset + layout.byteStride + 4) {
    expect(
      Array.from(bytes.subarray(offset + layout.byteStride, offset + layout.byteStride + 4))
    ).toEqual(color);
  }
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Tessellated layers bind typed attributes on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const fixtures = [
      {
        Layer: PathLayer,
        props: {data: DATA, getColor: COLOR},
        accessor: 'getColor',
        color: 'instanceColors',
        position: 'instanceStartPositions'
      },
      {
        Layer: TripsLayer,
        props: {data: DATA, getColor: COLOR},
        accessor: 'getColor',
        color: 'instanceColors',
        position: 'instanceStartPositions'
      },
      {
        Layer: SolidPolygonLayer,
        props: {
          data: DATA,
          getPolygon: (row: (typeof DATA)[number]) => row.path,
          getFillColor: COLOR,
          extruded: true,
          wireframe: true
        },
        accessor: 'getFillColor',
        color: 'fillColors',
        position: 'vertexPositions'
      }
    ];
    for (const fixture of fixtures) {
      await testLayerAsync<PathLayer | SolidPolygonLayer>({
        Layer: fixture.Layer,
        device: testDevice,
        draw: false,
        testCases: COLORS.map((color, update) => ({
          title: `color update ${update}`,
          ...(update === 0 ? {props: {...fixture.props, [fixture.accessor]: color}} : {}),
          updateProps: {
            [fixture.accessor]: update === 1 ? () => color : color,
            updateTriggers: {[fixture.accessor]: update}
          },
          onAfterUpdate: async ({layer}) => {
            const columns = layer.getAttributeManager()!.getGPUVectors();
            expect(columns[fixture.color]).toBeInstanceOf(update === 1 ? GPUVector : GPUConstant);
            if (update !== 1) {
              expect(Array.from((columns[fixture.color] as GPUConstant).value)).toEqual(color);
            }
            const positions = columns[fixture.position] as GPUVector;
            expect(positions).toBeInstanceOf(GPUVector);
            expect(positions.ownsBuffer).toBe(false);
            for (const model of layer.getModels()) {
              expect(model).toBeInstanceOf(GPUVectorModel);
              await expectBoundColor(model, fixture.color, color, update !== 1);
              expect(getAttributeBuffer(model, fixture.position)).toBe(positions.data[0].buffer);
              expect(getAttributeBuffer(model, fixture.position).destroyed).toBe(false);
            }
            if (layer instanceof SolidPolygonLayer) {
              expect(layer.getModels()).toHaveLength(3);
              expect(layer.state.topModel!.vertexArray.indexBuffer).toBe(
                layer.getAttributeManager()!.getAttributes().indices.getBuffer()
              );
              expect(layer.state.sideModel!.vertexArray.indexBuffer).toBeFalsy();
              expect(layer.state.wireframeModel!.vertexArray.indexBuffer).toBeFalsy();
              if (backend === 'webgpu')
                expect(
                  layer.state.topModel!.pipeline.shaderLayout.attributes!.some(
                    attribute => attribute.name === 'nextVertexPositions'
                  )
                ).toBe(false);
            } else {
              expect(layer.state.model!.vertexArray.indexBuffer).toBeTruthy();
              if (layer instanceof TripsLayer) {
                const timestamps = columns.instanceTimestamps as GPUVector;
                expect(timestamps).toBeInstanceOf(GPUVector);
                const manager = layer.getAttributeManager()!;
                const bindings = manager.getBufferGroupBindings({}, layer.state.model!);
                expect(getAttributeBuffer(layer.state.model!, 'instanceTimestamps')).toBe(
                  backend === 'webgpu'
                    ? bindings.buffers['path-instance-data']
                    : timestamps.data[0].buffer
                );
              }
            }
          }
        }))
      });
    }
  });
}
