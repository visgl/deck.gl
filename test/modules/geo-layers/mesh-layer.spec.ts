// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

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
