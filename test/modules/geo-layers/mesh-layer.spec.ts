// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {device} from '@deck.gl/test-utils/vitest';

import MeshLayer from '../../../modules/geo-layers/src/mesh-layer/mesh-layer';

const TEST_MATERIAL = {
  pbrMetallicRoughness: {
    baseColorFactor: [1, 1, 1, 1],
    metallicFactor: 0,
    roughnessFactor: 1
  }
};

test('Tile3DLayer mesh sublayer draws with a WebGPU device', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  for (const featureIds of [null, new Uint32Array([0, 1, 1])]) {
    const errors: Error[] = [];
    const layer = new MeshLayer({
      id: featureIds ? 'webgpu-tile3d-feature-mesh' : 'webgpu-tile3d-mesh',
      data: [0],
      mesh: new Geometry({
        topology: 'triangle-list',
        attributes: {
          positions: {
            size: 3,
            value: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0])
          },
          normals: {
            size: 3,
            value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
          },
          colors: {
            size: 4,
            value: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
            normalized: true
          },
          texCoords: {
            size: 2,
            value: new Float32Array([0, 0, 1, 0, 0.5, 1])
          },
          ...(featureIds
            ? {
                uvRegions: {
                  size: 4,
                  value: new Float32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1])
                }
              }
            : {})
        }
      }),
      pbrMaterial: TEST_MATERIAL,
      featureIds,
      getPosition: [0, 0, 0],
      getColor: [255, 255, 255, 255]
    });
    let deck: Deck | null = null;

    try {
      const renderedLayer = await new Promise<MeshLayer>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error('Timed out drawing Tile3DLayer mesh sublayer')),
          30000
        );

        deck = new Deck({
          id: `${layer.id}-deck`,
          device: webgpuDevice,
          width: 100,
          height: 100,
          views: new OrthographicView(),
          initialViewState: {target: [0, 0, 0], zoom: 0},
          controller: false,
          layers: [layer],
          onError: error => {
            errors.push(error);
            clearTimeout(timeout);
            reject(error);
          },
          onAfterRender: () => {
            // @ts-expect-error Accessing the layer manager for test-only validation.
            const renderedMeshLayer = deck?.layerManager
              ?.getLayers()
              .find(candidate => candidate instanceof MeshLayer) as MeshLayer | undefined;

            if (renderedMeshLayer?.state.model) {
              clearTimeout(timeout);
              resolve(renderedMeshLayer);
            }
          }
        });
      });

      const bindings = renderedLayer.state.model!.shaderInputs.getBindingValues();
      expect(bindings.simpleMeshTexture, 'binds a WebGPU texture').toBeDefined();
      expect(bindings.sampler, 'does not use the WebGL sampler binding').toBeUndefined();
      await webgpuDevice.handle.queue.onSubmittedWorkDone();
      expect(errors).toEqual([]);
    } finally {
      deck?.finalize();
    }
  }
}, 70000);

/** Runs a test on WebGL only: the pixel tests read back the WebGL drawing buffer. */
const webglTest = device.type === 'webgl' ? test : test.skip;

/** Red, green, blue and white texels, in a row. */
const TEXELS = {
  red: [255, 0, 0, 255],
  green: [0, 255, 0, 255],
  blue: [0, 0, 255, 255],
  white: [255, 255, 255, 255]
};

/** A PBR material whose base colour is the four `TEXELS`, sampled without filtering. */
const FOUR_TEXEL_MATERIAL = {
  pbrMetallicRoughness: {
    baseColorFactor: [1, 1, 1, 1],
    baseColorTexture: {
      texture: {
        source: {
          image: new ImageData(
            new Uint8ClampedArray([
              ...TEXELS.red,
              ...TEXELS.green,
              ...TEXELS.blue,
              ...TEXELS.white
            ]),
            4,
            1
          )
        },
        sampler: {magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071}
      }
    }
  }
};

/** A square 80 units wide, two triangles, with u running from 0.25 on the left to 0.75 on the right. */
function texturedSquare(uvRegion?: number[]): Geometry {
  return new Geometry({
    topology: 'triangle-list',
    attributes: {
      positions: {
        size: 3,
        value: new Float32Array([
          -40, -40, 0, 40, -40, 0, 40, 40, 0, -40, -40, 0, 40, 40, 0, -40, 40, 0
        ])
      },
      normals: {size: 3, value: new Float32Array(Array.from({length: 6}, () => [0, 0, 1]).flat())},
      colors: {size: 4, value: new Uint8Array(6 * 4).fill(255), normalized: true},
      texCoords: {
        size: 2,
        value: new Float32Array([0.25, 0.5, 0.75, 0.5, 0.75, 0.5, 0.25, 0.5, 0.75, 0.5, 0.25, 0.5])
      },
      ...(uvRegion
        ? {
            uvRegions: {
              size: 4,
              value: new Float32Array(Array.from({length: 6}, () => uvRegion).flat())
            }
          }
        : {})
    }
  });
}

/** The colours of a pixel left of the square's centre and of one right of it, drawn by a MeshLayer. */
async function drawTexturedMesh(mesh: Geometry): Promise<{left: number[]; right: number[]}> {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const gl = canvas.getContext('webgl2', {antialias: false, preserveDrawingBuffer: true})!;
  const deck = new Deck({
    gl,
    width: 100,
    height: 100,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    controller: false,
    layers: [
      new MeshLayer({
        id: 'textured-pbr-mesh',
        data: [0],
        mesh,
        pbrMaterial: FOUR_TEXEL_MATERIAL,
        getPosition: [0, 0, 0],
        getColor: [255, 255, 255, 255]
      })
    ]
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await new Promise<void>((resolve, reject) => {
      timeout = setTimeout(() => reject(new Error('Timed out drawing the textured mesh')), 10000);
      deck.setProps({
        onError: reject,
        onAfterRender: () => {
          // @ts-expect-error Accessing the layer manager for test-only validation.
          const layer = deck.layerManager
            ?.getLayers()
            .find(candidate => candidate instanceof MeshLayer);
          if (layer?.state.model) resolve();
        }
      });
    });
    const pixel = (x: number, y: number) => {
      const out = new Uint8Array(4);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return Array.from(out);
    };
    // u = 0.375 and 0.625 at these pixels without uvRegions
    return {left: pixel(30, 50), right: pixel(70, 50)};
  } finally {
    clearTimeout(timeout);
    deck.finalize();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}

webglTest('MeshLayer#draws a textured PBR mesh in its texture colours', async () => {
  const {left, right} = await drawTexturedMesh(texturedSquare());
  expect(left, 'u = 0.375 samples the second texel').toEqual(TEXELS.green);
  expect(right, 'u = 0.625 samples the third texel').toEqual(TEXELS.blue);
});

webglTest('MeshLayer#maps texture coordinates into their uvRegions', async () => {
  // The right half of the texture: u = 0.25..0.75 becomes 0.625..0.875.
  const {left, right} = await drawTexturedMesh(texturedSquare([0.5, 0, 1, 1]));
  expect(left, 'u = 0.6875 samples the third texel').toEqual(TEXELS.blue);
  expect(right, 'u = 0.8125 samples the fourth texel').toEqual(TEXELS.white);
});
