// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {IconLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`IconLayer draws chunked Arrow positions on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const type = new FixedSizeList(2, new Field('value', new Float32(), false));
    const positions = vectorFromArray([[0, 0]], type).concat(vectorFromArray([[1, 1]], type));
    const atlas = testDevice.createTexture({width: 2, height: 2, format: 'rgba8unorm'});
    const target = testDevice.createTexture({
      width: 16,
      height: 16,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [target]});
    let drew = false;
    try {
      await testLayerAsync({
        Layer: IconLayer,
        device: testDevice,
        draw: false,
        testCases: [
          {
            title: 'Draw two chunks from a prepacked atlas',
            props: {
              data: [{icon: 'a'}, {icon: 'b'}],
              iconAtlas: atlas,
              iconMapping: {
                a: {x: 0, y: 0, width: 1, height: 1},
                b: {x: 1, y: 1, width: 1, height: 1}
              },
              positions
            },
            onAfterUpdate: async ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getNumInstances()).toBe(2);
              expect(layer.getBounds()).toEqual([
                [0, 0, 0],
                [1, 1, 0]
              ]);
              if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
              const pass = testDevice.beginRenderPass({framebuffer});
              layer.context.renderPass = pass;
              layer.draw({uniforms: {}});
              pass.end();
              testDevice.submit();
              if (backend === 'webgpu') {
                expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
              }
              drew = true;
            }
          }
        ],
        onError: error => {
          throw error;
        }
      });
      expect(drew).toBe(true);
    } finally {
      framebuffer.destroy();
      target.destroy();
      atlas.destroy();
    }
  });
}
