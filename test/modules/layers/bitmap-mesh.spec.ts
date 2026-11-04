// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {BitmapLayer} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';
import {device, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Buffer, Texture} from '@luma.gl/core';
import {GPUVector} from '@luma.gl/graph/gpu-data';
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

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap borrows interleaved GPU vertices and offset indices on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const buffer = testDevice.createBuffer({
      data: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0]),
      usage: Buffer.VERTEX
    });
    const indexBuffer = testDevice.createBuffer({
      data: new Uint32Array([99, 0, 1, 2]),
      usage: Buffer.INDEX,
      indexType: 'uint32'
    });
    const vector = (name: string, byteOffset: number) =>
      new GPUVector({
        type: 'buffer',
        name,
        buffer,
        format: 'float32x2',
        length: 3,
        byteStride: 16,
        byteOffset
      });
    const positions = vector('positions', 0);
    const texCoords = vector('texCoords', 8);
    const indices = new GPUVector({
      type: 'buffer',
      name: 'indices',
      buffer: indexBuffer,
      format: 'uint32',
      length: 3,
      byteOffset: 4
    });
    const image = testDevice.createTexture({width: 1, height: 1, format: 'rgba8unorm'});
    const target = testDevice.createTexture({
      width: 8,
      height: 8,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({colorAttachments: [target]});
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
            props: {positions, texCoords, indices, image, bounds: [1, 1, 0, 0]},
            onAfterUpdate: async ({layer}) => {
              if (!layer.isLoaded) return;
              expect(layer.getBounds()).toEqual([
                [0, 0, 0],
                [1, 1, 0]
              ]);
              expect(layer.state.model!.indexCount).toBe(3);
              if (backend === 'webgpu') (testDevice as any).handle.pushErrorScope('validation');
              const pass = testDevice.beginRenderPass({framebuffer});
              layer.context.renderPass = pass;
              layer.draw({shaderModuleProps: {picking: {isActive: false}}});
              pass.end();
              testDevice.submit();
              if (backend === 'webgpu')
                expect(await (testDevice as any).handle.popErrorScope()).toBeNull();
            }
          }
        ]
      });
      expect(buffer.destroyed).toBe(false);
      expect(indexBuffer.destroyed).toBe(false);
    } finally {
      framebuffer.destroy();
      target.destroy();
      image.destroy();
      buffer.destroy();
      indexBuffer.destroy();
    }
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap refreshes CPU-preprojected positions after transform changes on ${backend}`, async ({
    skip
  }) => {
    const {createTestViewport} = await import('../core/viewports/test-crs');
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const viewport = createTestViewport({
      width: 800,
      height: 600,
      converter: {
        forward: ([x, y, z = 0]) => [x * 2, y * 2, z],
        inverse: ([x, y, z = 0]) => [x / 2, y / 2, z]
      }
    });
    const expected = [
      [2, 4, 0],
      [8, 4, 0],
      [18, 16, 0]
    ];
    await testLayerAsync({
      Layer: BitmapLayer,
      device: testDevice,
      viewport,
      draw: false,
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            positions: column([
              [1, 2],
              [2, 2],
              [1, 3]
            ]),
            texCoords: column([
              [0, 0],
              [1, 0],
              [0, 1]
            ])
          }
        },
        {updateProps: {modelMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 3, 0, 0, 1]}},
        {updateProps: {coordinateOrigin: [5, 6, 0]}}
      ].map((testCase, index) => ({
        ...testCase,
        onAfterUpdate: async ({layer}) => {
          if (!layer.isLoaded) return;
          expect(layer.state.preproject).toBeTruthy();
          const buffer = (layer.state.typedMesh as any).attributes.positions.data[0].buffer;
          const bytes = await buffer.readAsync();
          expect(Array.from(new Float32Array(bytes.buffer, bytes.byteOffset, 3))).toEqual(
            expected[index]
          );
        }
      }))
    });
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap generated UVs replace mappings and preserve picking on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    const image = testDevice.createTexture({width: 8, height: 8, format: 'rgba8unorm'});
    let oldBuffer;
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
              bounds: [0, 0, 1, 1],
              imageMapping: {
                bounds: [0, 0, 1, 1],
                positionCRS: '+proj=longlat +datum=WGS84',
                imageCRS: '+proj=longlat +datum=WGS84'
              }
            }
          },
          {updateProps: {meshMaxEdgeLength: 0.5}},
          {updateProps: {imageMapping: null, meshMaxEdgeLength: null}}
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            if (!layer.isLoaded) return;
            if (index === 2) {
              expect(layer.getAttributeManager()).not.toBeNull();
              expect(oldBuffer.destroyed).toBe(true);
              return;
            }
            const mesh = layer.state.typedMesh as any;
            if (index === 0) {
              oldBuffer = mesh.attributes.texCoords.data[0].buffer;
              const bytes = await oldBuffer.readAsync();
              expect(Array.from(new Float32Array(bytes.buffer, bytes.byteOffset, 8))).toEqual([
                0, 1, 0, 0, 1, 0, 1, 1
              ]);
            } else {
              expect(oldBuffer.destroyed).toBe(true);
              oldBuffer = mesh.attributes.texCoords.data[0].buffer;
              expect(mesh.vertexCount).toBeGreaterThan(4);
            }
            const info = layer.getPickingInfo({info: {color: new Uint8Array([64, 32, 0])}} as any);
            expect(info.bitmap).toEqual({
              size: {width: 8, height: 8},
              uv: [0.25, 0.125],
              pixel: [2, 1]
            });
          }
        }))
      });
    } finally {
      image.destroy();
    }
  });
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap Mercator mapping matches independently calculated UVs on ${backend}`, async ({
    skip
  }) => {
    const {OrthographicViewport} = await import('@deck.gl/core');
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();
    // Cover a wide latitude range, where Mercator differs substantially from linear UVs.
    const rows: number[][] = [];
    for (let latitude = -70; latitude < 70; latitude += 20) {
      rows.push(
        [-60, latitude],
        [60, latitude],
        [60, latitude + 20],
        [-60, latitude],
        [60, latitude + 20],
        [-60, latitude + 20]
      );
    }
    const mercatorY = (latitude: number) =>
      Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360));
    const extent = mercatorY(75);
    const positions = column(rows);
    const texCoords = column(
      rows.map(([longitude, latitude]) => [
        (longitude + 60) / 120,
        (extent - mercatorY(latitude)) / (2 * extent)
      ])
    );
    const pixels = new Uint8Array(8 * 8 * 4);
    for (let i = 0; i < 64; i++)
      pixels.set([(i % 8) * 32, Math.floor(i / 8) * 32, 128, 255], i * 4);
    const image = testDevice.createTexture({
      width: 8,
      height: 8,
      format: 'rgba8unorm',
      data: pixels
    });
    const target = testDevice.createTexture({
      width: 64,
      height: 64,
      format: 'rgba8unorm',
      usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
    });
    const depth = testDevice.createTexture({
      width: 64,
      height: 64,
      format: 'depth24plus',
      usage: Texture.RENDER_ATTACHMENT
    });
    const framebuffer = testDevice.createFramebuffer({
      colorAttachments: [target],
      depthStencilAttachment: depth
    });
    const readback = testDevice.createBuffer({
      byteLength: 64 * 64 * 4,
      usage: Buffer.COPY_DST | Buffer.MAP_READ
    });
    let reference: Uint8Array;
    try {
      await testLayerAsync({
        Layer: BitmapLayer,
        device: testDevice,
        viewport: new OrthographicViewport({width: 64, height: 64, zoom: -1.5}),
        onError: error => {
          throw error;
        },
        testCases: [
          {props: {positions, texCoords, image, coordinateSystem: 'cartesian'}},
          {
            updateProps: {
              texCoords: null,
              imageMapping: {
                bounds: [
                  ((-60 * Math.PI) / 180) * 6378137,
                  -extent * 6378137,
                  ((60 * Math.PI) / 180) * 6378137,
                  extent * 6378137
                ],
                positionCRS: '+proj=longlat +datum=WGS84',
                imageCRS: '+proj=merc +a=6378137 +b=6378137'
              }
            }
          }
        ].map((testCase, index) => ({
          ...testCase,
          onAfterUpdate: async ({layer}) => {
            if (!layer.isLoaded) return;
            const pass = testDevice.beginRenderPass({
              framebuffer,
              parameters: {viewport: [0, 0, 64, 64], scissorRect: [0, 0, 64, 64]},
              clearColor: [0, 0, 0, 0]
            });
            layer.context.renderPass = pass;
            layer.draw({shaderModuleProps: {picking: {isActive: false}}});
            pass.end();
            testDevice.submit();
            target.readBuffer({width: 64, height: 64}, readback);
            const rendered = new Uint8Array(await readback.readAsync());
            expect(rendered.filter(value => value > 0).length).toBeGreaterThan(1000);
            if (index === 0) reference = rendered;
            else expect(rendered).toEqual(reference);
          }
        }))
      });
    } finally {
      readback.destroy();
      framebuffer.destroy();
      depth.destroy();
      target.destroy();
      image.destroy();
    }
  });
}
