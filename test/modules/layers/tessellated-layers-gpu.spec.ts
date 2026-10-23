// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {Buffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import GPUVectorModel from '@deck.gl/core/lib/luma-upstream/gpu-vector-model';
import PathLayer from '@deck.gl/layers/path-layer/path-layer';
import SolidPolygonLayer from '@deck.gl/layers/solid-polygon-layer/solid-polygon-layer';
import TripsLayer from '@deck.gl/geo-layers/trips-layer/trips-layer';

const COLOR = [128, 64, 255, 255] as const;
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

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Tessellated layers bind typed attributes on ${backend}`, async ({skip}) => {
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
    const fixtures = [
      {
        layer: new PathLayer({data: DATA, getColor: COLOR}),
        accessor: 'getColor',
        color: 'instanceColors',
        position: 'instanceStartPositions'
      },
      {
        layer: new TripsLayer({data: DATA, getColor: COLOR}),
        accessor: 'getColor',
        color: 'instanceColors',
        position: 'instanceStartPositions'
      },
      {
        layer: new SolidPolygonLayer({
          data: DATA,
          getPolygon: row => row.path,
          getFillColor: COLOR,
          extruded: true,
          wireframe: true
        }),
        accessor: 'getFillColor',
        color: 'fillColors',
        position: 'vertexPositions'
      }
    ];
    try {
      for (const fixture of fixtures) {
        let layer = fixture.layer;
        for (let update = 0; update < 3; update++) {
          layer = layer.clone({
            [fixture.accessor]: update === 1 ? () => COLOR : COLOR,
            updateTriggers: {[fixture.accessor]: update}
          });
          manager.setLayers([layer]);
          const columns = layer.getAttributeManager()!.getGPUVectors();
          expect(columns[fixture.color]).toBeInstanceOf(update === 1 ? GPUVector : GPUConstant);
          if (update !== 1) {
            expect(Array.from((columns[fixture.color] as GPUConstant).value)).toEqual(COLOR);
          }
          const positions = columns[fixture.position] as GPUVector;
          expect(positions).toBeInstanceOf(GPUVector);
          expect(positions.ownsBuffer).toBe(false);
          for (const model of layer.getModels()) {
            expect(model).toBeInstanceOf(GPUVectorModel);
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
              const bindings = manager.getBufferGroupBindings(
                manager.getAttributes(),
                layer.state.model!
              );
              expect(getAttributeBuffer(layer.state.model!, 'instanceTimestamps')).toBe(
                backend === 'webgpu'
                  ? bindings.buffers['path-instance-data']
                  : timestamps.data[0].buffer
              );
            }
          }
        }
      }
    } finally {
      manager.finalize();
    }
  });
}
