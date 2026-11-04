// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {BitmapLayer} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Texture} from '@luma.gl/core';
import {GPUVectorModel} from '@luma.gl/engine';
import {Field, FixedSizeList, Float64, Uint16, vectorFromArray} from 'apache-arrow';

function column(rows: number[][]) {
  return vectorFromArray(
    rows,
    new FixedSizeList(rows[0].length, new Field('value', new Float64(), false))
  );
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap typed meshes render and switch back to bounds on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const image = testDevice.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([255, 0, 0, 255]),
      format: 'rgba8unorm'
    });
    const target = testDevice.createTexture({
      width: 16,
      height: 16,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [target]});
    let oldBuffer;
    let previousModel;
    try {
      await testLayerAsync({
        Layer: BitmapLayer,
        device: testDevice,
        draw: false,
        onError: error => {
          throw error;
        },
        testCases: [
          {
            props: {
              image,
              extensions: [new ClipExtension()],
              clipBounds: [-180, -90, 180, 90],
              positions: column([
                [0, 0],
                [1, 0],
                [0, 1]
              ]),
              texCoords: column([
                [0, 1],
                [1, 1],
                [0, 0]
              ]),
              indices: vectorFromArray([0, 1, 2], new Uint16())
            }
          },
          {updateProps: {opacity: 0.5}},
          {updateProps: {indices: null}},
          {updateProps: {positions: null, texCoords: null}}
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            if (!layer.isLoaded) return;
            if (index === 3) {
              expect(layer.getAttributeManager()).not.toBeNull();
              expect(oldBuffer.destroyed).toBe(true);
            } else {
              expect(layer.getAttributeManager()!.getAttributes().positions.value).toBeNull();
              expect(layer.state.model!.constructor).toBe(GPUVectorModel);
              const mesh = layer.state.typedMesh as any;
              if (index === 0) {
                oldBuffer = mesh.attributes.positions.data[0].buffer;
                previousModel = layer.state.model;
              }
              if (index === 1) {
                expect(mesh.attributes.positions.data[0].buffer).toBe(oldBuffer);
                expect(layer.state.model).toBe(previousModel);
              }
              expect(layer.getBounds()).toEqual([
                [0, 0, 0],
                [1, 1, 0]
              ]);
              expect(layer.state.coordinateConversion).toBe(0);
              expect(layer.state.model!.indexCount).toBe(index < 2 ? 3 : undefined);
            }
            if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
            const pass = testDevice.beginRenderPass({framebuffer});
            layer.context.renderPass = pass;
            layer.draw({shaderModuleProps: {picking: {isActive: false}}});
            pass.end();
            testDevice.submit();
            if (backend === 'webgpu')
              expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
          }
        }))
      });
    } finally {
      framebuffer.destroy();
      target.destroy();
      image.destroy();
    }
  });
}
