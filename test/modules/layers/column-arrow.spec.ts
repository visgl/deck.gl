// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ColumnLayer, GridCellLayer} from '@deck.gl/layers';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVectorModel} from '@luma.gl/engine';
import {Texture} from '@luma.gl/core';
import {Field, FixedSizeList, Float64, vectorFromArray} from 'apache-arrow';

function positions(rows: number[][]) {
  return vectorFromArray(rows, new FixedSizeList(3, new Field('value', new Float64(), false)));
}

for (const [Layer, backend] of [ColumnLayer, GridCellLayer].flatMap(Layer =>
  (['webgl', 'webgpu'] as const).map(backend => [Layer, backend] as const)
)) {
  test(`${Layer.layerName} Arrow meshes support draw modes and replacement on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const target = testDevice.createTexture({
      width: 16,
      height: 16,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [target]});
    const source = positions([
      [0, 0, 0],
      [1, 0, 0]
    ]).concat(
      positions([
        [0, 1, 0],
        [1, 1, 0]
      ])
    );
    let previousGeometries;
    let previousBuffer;
    try {
      await testLayerAsync({
        Layer,
        device: testDevice,
        draw: false,
        onError: error => {
          throw error;
        },
        testCases: [
          {props: {positions: source, extruded: true, wireframe: true, numInstances: 3}},
          {updateProps: {extruded: false, stroked: true}},
          {updateProps: {diskResolution: 6, flatShading: true}},
          {updateProps: {positions: null, data: [{position: [0, 0, 0]}]}}
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            if (!layer.isLoaded) return;
            if (index === 3) {
              expect(layer.getAttributeManager()).not.toBeNull();
              expect(previousBuffer.destroyed).toBe(true);
              return;
            }
            expect(layer.getAttributeManager()).toBeNull();
            expect(layer.getBounds()).toEqual([
              [0, 0, 0],
              [1, 1, 0]
            ]);
            expect(layer.getNumInstances()).toBe(3);
            for (const model of layer.state.models!) expect(model.constructor).toBe(GPUVectorModel);
            const geometries = [...layer.state.geometries!.values()];
            if (previousGeometries)
              for (const geometry of previousGeometries) {
                if (!geometries.includes(geometry))
                  expect(geometry.attributes.geometry.data[0].buffer.destroyed).toBe(true);
              }
            previousGeometries = geometries;
            if (previousBuffer)
              expect(
                (layer.state.columns as any).prepared.columns.instancePositions.data[0].buffer
              ).toBe(previousBuffer);
            previousBuffer = (layer.state.columns as any).prepared.columns.instancePositions.data[0]
              .buffer;
            const model = layer.state.fillModel!;
            const offsets: number[] = [];
            const counts: number[] = [];
            const setter = model.shaderInputs.setProps.bind(model.shaderInputs);
            const spy = vi.spyOn(model.shaderInputs, 'setProps').mockImplementation(props => {
              if (props.column && Object.keys(props.column).length === 1) {
                offsets.push(props.column.rowIndexOffset!);
                counts.push(model.instanceCount);
              }
              return setter(props);
            });
            try {
              if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
              const pass = testDevice.beginRenderPass({framebuffer});
              layer.context.renderPass = pass;
              layer.draw({uniforms: {}});
              pass.end();
              testDevice.submit();
              if (backend === 'webgpu')
                expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
              expect(offsets).toEqual([0, 2]);
              expect(counts).toEqual([2, 1]);
            } finally {
              spy.mockRestore();
            }
          }
        }))
      });
    } finally {
      framebuffer.destroy();
      target.destroy();
    }
  });
}
