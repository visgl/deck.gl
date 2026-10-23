// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {Geometry, type Model} from '@luma.gl/engine';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import GPUVectorModel from '@deck.gl/core/lib/luma-upstream/gpu-vector-model';
import BitmapLayer from '@deck.gl/layers/bitmap-layer/bitmap-layer';
import SimpleMeshLayer from '@deck.gl/mesh-layers/simple-mesh-layer/simple-mesh-layer';
import MeshLayer from '@deck.gl/geo-layers/mesh-layer/mesh-layer';

const COLOR = [128, 64, 255, 255] as const;
const DATA = [{position: [0, 0, 0]}, {position: [1, 1, 0]}];

function createGeometry() {
  return new Geometry({
    topology: 'triangle-list',
    indices: new Uint16Array([0, 1, 2]),
    attributes: {
      positions: {size: 3, value: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])},
      normals: {size: 3, value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])},
      texCoords: {size: 2, value: new Float32Array([0, 0, 1, 0, 0, 1])},
      colors: {size: 4, value: new Float32Array(12).fill(1)}
    }
  });
}

function getAttributeBuffer(model: Model, name: string) {
  const slot =
    model.device.type === 'webgl'
      ? model.pipeline.shaderLayout.attributes!.find(attribute => attribute.name === name)!.location
      : model.vertexArray.getBufferSlot(
          model.bufferLayout.find(layout =>
            layout.attributes?.some(attribute => attribute.attribute === name)
          )!.name
        )!;
  return model.vertexArray.attributes[slot];
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Bitmap and mesh layers use typed attributes on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const viewport = new MapView().makeViewport({
      width: 100,
      height: 100,
      viewState: {longitude: 0, latitude: 0, zoom: 1}
    });
    const manager = new LayerManager(testDevice, {viewport});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const texture = testDevice.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([255, 255, 255, 255])
    });
    const positions = testDevice.createBuffer({data: new Float32Array([0, 0, 0, 1, 1, 0])});
    try {
      let bitmap = new BitmapLayer({image: texture, bounds: [0, 0, 1, 1]});
      for (const bounds of [
        [0, 0, 1, 1],
        [0, 0, 2, 2]
      ]) {
        bitmap = bitmap.clone({bounds});
        manager.setLayers([bitmap]);
        const model = bitmap.state.model!;
        const attributes = bitmap.getAttributeManager()!;
        expect(model).toBeInstanceOf(GPUVectorModel);
        for (const name of ['positions', 'texCoords']) {
          const column = attributes.getGPUVectors()[name] as GPUVector;
          expect(column).toBeInstanceOf(GPUVector);
          expect(column.ownsBuffer).toBe(false);
          expect(getAttributeBuffer(model, name)).toBe(column.data[0].buffer);
        }
        expect(model.vertexArray.indexBuffer).toBe(attributes.getAttributes().indices.getBuffer());
      }
      for (const Layer of [SimpleMeshLayer, MeshLayer]) {
        let layer = new Layer({
          data: DATA,
          mesh: createGeometry(),
          texture,
          getColor: COLOR,
          ...(Layer === MeshLayer
            ? {
                pbrMaterial: {
                  pbrMetallicRoughness: {
                    baseColorFactor: [1, 1, 1, 1],
                    metallicFactor: 0,
                    roughnessFactor: 1
                  }
                }
              }
            : {})
        });
        for (let update = 0; update < 3; update++) {
          layer = layer.clone({
            getColor: update === 1 ? () => COLOR : COLOR,
            updateTriggers: {getColor: update},
            ...(update === 2
              ? {data: {length: 2, attributes: {getPosition: {buffer: positions, size: 3}}}}
              : {})
          });
          manager.setLayers([layer]);
          const model = layer.state.model!;
          const columns = layer.getAttributeManager()!.getGPUVectors();
          expect(model).toBeInstanceOf(GPUVectorModel);
          expect(columns.instanceColors).toBeInstanceOf(update === 1 ? GPUVector : GPUConstant);
          if (update !== 1)
            expect(Array.from((columns.instanceColors as GPUConstant).value)).toEqual(COLOR);
          if (Layer === SimpleMeshLayer) {
            expect(getAttributeBuffer(model, 'instancePositions')).toBe(
              (columns.instancePositions as GPUVector).data[0].buffer
            );
          }
          if (update === 1) {
            expect(getAttributeBuffer(model, 'instanceColors')).toBe(
              (columns.instanceColors as GPUVector).data[0].buffer
            );
          }
          expect(Object.values(model._gpuGeometry!.attributes)).toContain(
            getAttributeBuffer(model, 'positions')
          );
          expect(model.vertexArray.indexBuffer).toBe(model._gpuGeometry!.indices);
        }
        if (Layer === SimpleMeshLayer) {
          expect(getAttributeBuffer(layer.state.model!, 'instancePositions')).toBe(positions);
        }
      }
    } finally {
      manager.finalize();
      expect(texture.destroyed).toBe(false);
      expect(positions.destroyed).toBe(false);
      texture.destroy();
      positions.destroy();
    }
  });
}
