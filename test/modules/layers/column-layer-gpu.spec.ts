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
import ColumnLayer from '@deck.gl/layers/column-layer/column-layer';
import GridCellLayer from '@deck.gl/layers/column-layer/grid-cell-layer';

const bufferPoolSize = GPUDataEvaluator.bufferPoolSize;
beforeAll(() => {
  GPUDataEvaluator.bufferPoolSize = 0;
});
afterAll(() => {
  GPUDataEvaluator.bufferPoolSize = bufferPoolSize;
});

const COLOR = [128, 64, 255, 255] as const;
const DATA = [{position: [0, 0, 0]}, {position: [1, 1, 0]}];

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

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const {Layer, extruded} of [
    {Layer: ColumnLayer, extruded: true},
    {Layer: ColumnLayer, extruded: false},
    {Layer: GridCellLayer, extruded: true}
  ]) {
    test(`${Layer.layerName} (extruded=${extruded}) shares typed columns on ${backend}`, async ({
      skip
    }) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) {
        skip();
        return;
      }
      const positions = testDevice.createBuffer({
        data: new Float32Array([0, 0, 0, 1, 1, 0])
      });
      const props = {
        data: DATA,
        extruded,
        stroked: !extruded,
        getFillColor: COLOR,
        getLineColor: COLOR
      };
      try {
        const updates = [
          {},
          {
            getFillColor: () => COLOR,
            getLineColor: () => COLOR,
            updateTriggers: {getFillColor: 1, getLineColor: 1}
          },
          {
            getFillColor: COLOR,
            getLineColor: COLOR,
            diskResolution: 8,
            updateTriggers: {getFillColor: 2, getLineColor: 2}
          },
          {
            data: {length: 2, attributes: {getPosition: {buffer: positions, size: 3}}}
          }
        ];
        await testLayerAsync<ColumnLayer>({
          Layer,
          device: testDevice,
          draw: false,
          testCases: updates.map((update, index) => ({
            title: `attribute update ${index}`,
            ...(index === 0 ? {props} : {updateProps: update}),
            onAfterUpdate: ({layer}) => {
              const columns = layer.getAttributeManager()!.getGPUVectors();
              const position = columns.instancePositions as GPUVector;
              expect(position).toBeInstanceOf(GPUVector);
              expect(position.ownsBuffer).toBe(false);
              const varying = typeof layer.props.getFillColor === 'function';
              expect(columns.instanceFillColors).toBeInstanceOf(varying ? GPUVector : GPUConstant);
              expect(columns.instanceLineColors).toBeInstanceOf(varying ? GPUVector : GPUConstant);
              if (!varying) {
                expect(Array.from((columns.instanceFillColors as GPUConstant).value)).toEqual(
                  COLOR
                );
              }
              expect(layer.getModels()).toHaveLength(3);
              for (const model of layer.getModels()) {
                expect(model).toBeInstanceOf(GPUVectorModel);
                expect(getAttributeBuffer(model, 'instancePositions')).toBe(
                  position.data[0].buffer
                );
                const geometryLayout = model.bufferLayout.filter(
                  layout => layout.name === 'geometry'
                );
                if (model._gpuGeometry) {
                  expect(geometryLayout).toHaveLength(1);
                  expect(geometryLayout[0]).toEqual(
                    model._gpuGeometry.bufferLayout.find(layout => layout.name === 'geometry')
                  );
                  expect(
                    getAttributeBuffer(model, 'positions'),
                    `${model.id} geometry: ${JSON.stringify(update)}`
                  ).toBeDefined();
                  expect(getAttributeBuffer(model, 'positions').destroyed).toBe(false);
                }
                if (backend === 'webgl' && !varying) {
                  const location = model.pipeline.shaderLayout.attributes!.find(
                    attribute => attribute.name === 'instanceFillColors'
                  )!.location;
                  expect(model.vertexArray.attributes[location]).toEqual(
                    new Float32Array(COLOR).map(value => value / 255)
                  );
                }
              }
              expect(Boolean(layer.state.fillModel!.vertexArray.indexBuffer)).toBe(
                Layer === GridCellLayer
              );
              expect(layer.state.strokeModel!.vertexArray.indexBuffer).toBeFalsy();
              expect(Boolean(layer.state.wireframeModel!.vertexArray.indexBuffer)).toBe(
                Layer === ColumnLayer && extruded
              );
              if (index === updates.length - 1) {
                expect(getAttributeBuffer(layer.state.fillModel!, 'instancePositions')).toBe(
                  positions
                );
              }
            }
          }))
        });
      } finally {
        expect(positions.destroyed).toBe(false);
        positions.destroy();
      }
    });
  }
}
