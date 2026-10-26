// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import ScatterplotLayer from '@deck.gl/layers/scatterplot-layer/scatterplot-layer';
import GPUVectorModel from '@deck.gl/core/lib/luma-upstream/gpu-vector-model';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';

test('GPUVectorModel rejects untyped attribute inputs', () => {
  const model = Object.create(GPUVectorModel.prototype) as GPUVectorModel;
  expect(() => model.setGPUAttributes({positions: {} as GPUVector}, [])).toThrow(TypeError);
});

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
        expect(model).toBeInstanceOf(GPUVectorModel);
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
    expect(model).toBeInstanceOf(GPUVectorModel);
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

test('ScatterplotLayer binds mixed WebGPU position vectors and constants separately', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice('core');
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
  const positions = device.createBuffer({
    data: new Float32Array([99, 1, 2, 3, 99, 4, 5, 6]),
    usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
  });
  const layer = new ScatterplotLayer({
    id: 'mixed-gpu-scatterplot',
    data: {
      length: 2,
      attributes: {getPosition: {buffer: positions, size: 3, stride: 16, offset: 4}}
    }
  });
  let ownedBuffer: Buffer;
  try {
    manager.setLayers([layer]);
    const model = layer.getModels()[0];
    const highSlot = getAttributeBufferSlot(model, 'instancePositions');
    const lowSlot = getAttributeBufferSlot(model, 'instancePositions64Low');
    expect(highSlot).not.toBe(lowSlot);
    expect(model.vertexArray.attributes[highSlot]).toBe(positions);
    const highLayout = model.bufferLayout.find(layout =>
      layout.attributes?.some(definition => definition.attribute === 'instancePositions')
    )!;
    expect(highLayout.byteStride).toBe(16);
    expect(highLayout.attributes![0].byteOffset).toBe(4);
    const lowLayout = model.bufferLayout.find(layout =>
      layout.attributes?.some(definition => definition.attribute === 'instancePositions64Low')
    )!;
    expect(lowLayout.byteStride).toBe(0);
    ownedBuffer = model.vertexArray.attributes[lowSlot] as Buffer;
    expect(ownedBuffer).toBeInstanceOf(Buffer);
    expect(ownedBuffer).not.toBe(positions);
    const bytes = await ownedBuffer.readAsync();
    const byteOffset = lowLayout.attributes![0].byteOffset || 0;
    expect(new Float32Array(bytes.buffer, bytes.byteOffset + byteOffset, 3)).toEqual(
      new Float32Array(3)
    );

    const varying = layer.clone({
      data: [
        [1, 2, 3],
        [4, 5, 6]
      ],
      getPosition: d => d
    });
    manager.setLayers([varying]);
    expect(ownedBuffer.destroyed).toBe(true);
    expect(positions.destroyed).toBe(false);
    const varyingModel = varying.getModels()[0];
    expect(getAttributeBufferSlot(varyingModel, 'instancePositions')).toBe(
      getAttributeBufferSlot(varyingModel, 'instancePositions64Low')
    );

    const mixedAgain = varying.clone({data: layer.props.data});
    manager.setLayers([mixedAgain]);
    const mixedModel = mixedAgain.getModels()[0];
    const mixedLowSlot = getAttributeBufferSlot(mixedModel, 'instancePositions64Low');
    const mixedBuffer = mixedModel.vertexArray.attributes[mixedLowSlot] as Buffer;
    const constant = mixedAgain.clone({data: [1, 2], getPosition: [7, 8, 9]});
    manager.setLayers([constant]);
    expect(mixedBuffer.destroyed).toBe(true);
    expect(positions.destroyed).toBe(false);
    const constantModel = constant.getModels()[0];
    const constantSlot = getAttributeBufferSlot(constantModel, 'instancePositions');
    ownedBuffer = constantModel.vertexArray.attributes[constantSlot] as Buffer;
    expect(constantSlot).toBe(getAttributeBufferSlot(constantModel, 'instancePositions64Low'));
  } finally {
    manager.finalize();
    expect(positions.destroyed).toBe(false);
    if (ownedBuffer) {
      expect(ownedBuffer.destroyed).toBe(true);
    }
    positions.destroy();
  }
});

function getAttributeBufferSlot(model: Model, attributeName: string): number {
  const layout = model.bufferLayout.find(candidate =>
    candidate.attributes?.some(definition => definition.attribute === attributeName)
  );
  expect(layout).toBeDefined();
  const slot = model.vertexArray.getBufferSlot(layout!.name);
  expect(slot).not.toBeNull();
  return slot!;
}
