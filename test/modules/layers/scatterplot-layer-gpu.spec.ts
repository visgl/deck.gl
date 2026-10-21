// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer} from '@luma.gl/core';
import ScatterplotLayer from '@deck.gl/layers/scatterplot-layer/scatterplot-layer';
import GPUTableModel from '@deck.gl/core/lib/attribute/gpu-table-model';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';

test('ScatterplotLayer consumes GPU columns across constant and buffer updates', () => {
  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {props: {data: [{position: [1, 2, 3]}], getFillColor: [128, 64, 255, 255]}},
      {
        updateProps: {
          getRadius: () => 2,
          getFillColor: () => [255, 0, 0, 255],
          updateTriggers: {getRadius: 1, getFillColor: 1}
        }
      },
      {
        updateProps: {
          getRadius: 4,
          getFillColor: [0, 255, 0, 255],
          updateTriggers: {getRadius: 2, getFillColor: 2}
        }
      },
      {updateProps: {data: [{position: [1, 2, 3]}, {position: [4, 5, 6]}]}}
    ].map(testCase => ({
      ...testCase,
      onAfterUpdate: ({layer}) => {
        const model = layer.getModels()[0];
        expect(model).toBeInstanceOf(GPUTableModel);
        const columns = layer.getAttributeManager().getGPUVectors();
        expect(columns.instancePositions).toBeInstanceOf(GPUVector);
        expect(columns.instancePositions.length).toBe(layer.props.data.length);
        const colorLocation = model.pipeline.shaderLayout.attributes.find(
          attribute => attribute.name === 'instanceFillColors'
        ).location;
        if (columns.instanceFillColors instanceof GPUConstant) {
          expect(model.vertexArray.attributes[colorLocation]).toEqual(
            new Float32Array(columns.instanceFillColors.value).map(value => value / 255)
          );
        } else {
          expect(model.vertexArray.attributes[colorLocation]).toBe(
            columns.instanceFillColors.data[0].buffer
          );
        }
        expect(columns.instanceRadius).toBeInstanceOf(
          typeof layer.props.getRadius === 'function' ? GPUVector : GPUConstant
        );
      }
    })),
    onError: err => {
      throw err;
    }
  });
});

test('ScatterplotLayer GPU columns retain WebGPU grouping and release constant buffers', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) {
    skip();
    return;
  }
  const viewport = new MapView().makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const layer = new ScatterplotLayer({
    id: 'gpu-scatterplot',
    data: [1, 2],
    getPosition: [1.1, 2.2, 3.3],
    getRadius: value => value,
    getFillColor: [128, 64, 255, 255]
  });
  let constantBuffer: Buffer;
  try {
    manager.setLayers([layer]);
    const model = layer.getModels()[0];
    expect(model).toBeInstanceOf(GPUTableModel);
    expect(model.bufferLayout.some(layout => layout.name === 'scatterplot-instance-data')).toBe(
      true
    );
    const slot = model.vertexArray.getBufferSlot('instancePositions')!;
    constantBuffer = model.vertexArray.attributes[slot] as Buffer;
    expect(constantBuffer).toBeInstanceOf(Buffer);
    const bytes = await constantBuffer.readAsync();
    const positionValues = new Float32Array(bytes.buffer, bytes.byteOffset, 6);
    expect(positionValues.slice(0, 3)).toEqual(new Float32Array([1.1, 2.2, 3.3]));
    expect(positionValues[3]).not.toBe(0);
    const nextLayer = layer.clone({
      getPosition: value => [value, 0, 0],
      updateTriggers: {getPosition: 1}
    });
    manager.setLayers([nextLayer]);
    expect(constantBuffer.destroyed).toBe(true);
    expect(nextLayer.getAttributeManager()!.getGPUVectors().instancePositions).toBeInstanceOf(
      GPUVector
    );
  } finally {
    manager.finalize();
  }
});
