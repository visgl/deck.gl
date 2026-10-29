// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {_GPUVectorModel as GPUVectorModel} from '@deck.gl/core';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import ScreenGridCellLayer from '@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-cell-layer';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`ScreenGridCellLayer binds typed inputs on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const positions = testDevice.createBuffer({
      data: new Float32Array([0, 0, 1, 1]),
      usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
    });
    try {
      await testLayerAsync({
        Layer: ScreenGridCellLayer,
        device: testDevice,
        testCases: [
          {
            props: {
              data: {length: 2, attributes: {getBin: {buffer: positions, size: 2}}},
              getWeight: 3,
              cellSizePixels: 20,
              cellMarginPixels: 1,
              colorScaleType: 'linear',
              colorDomain: () => [0, 10],
              colorRange: [
                [0, 0, 0, 255],
                [255, 255, 255, 255]
              ]
            }
          },
          {updateProps: {getWeight: (_row, {index}) => index + 5, updateTriggers: {getWeight: 1}}},
          {updateProps: {getWeight: 9, updateTriggers: {getWeight: 2}}}
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            const model = layer.getModels()[0] as GPUVectorModel;
            expect(model).toBeInstanceOf(GPUVectorModel);
            const columns = layer.getAttributeManager()!.getGPUVectors();
            expect(columns.instancePositions).toBeInstanceOf(GPUVector);
            expect((columns.instancePositions as GPUVector).ownsBuffer).toBe(false);
            expect(columns.instanceWeights).toBeInstanceOf(index === 1 ? GPUVector : GPUConstant);
            const getBinding = (name: string) => {
              const slot =
                backend === 'webgl'
                  ? model.pipeline.shaderLayout.attributes!.find(
                      attribute => attribute.name === name
                    )!.location
                  : model.vertexArray.getBufferSlot(
                      model.bufferLayout.find(layout =>
                        layout.attributes?.some(attribute => attribute.attribute === name)
                      )!.name
                    )!;
              return model.vertexArray.attributes[slot];
            };
            expect(getBinding('instancePositions')).toBe(positions);
            const weights = getBinding('instanceWeights');
            const expected = index === 1 ? [5, 6] : [index === 0 ? 3 : 9];
            if (weights instanceof Buffer) {
              const bytes = await weights.readAsync();
              expect(
                Array.from(new Float32Array(bytes.buffer, bytes.byteOffset, expected.length))
              ).toEqual(expected);
            } else {
              expect(Array.from(weights as Float32Array)).toEqual(expected);
            }
          }
        })),
        onError: error => {
          throw error;
        }
      });
      expect(positions.destroyed).toBe(false);
    } finally {
      positions.destroy();
    }
  });
}
