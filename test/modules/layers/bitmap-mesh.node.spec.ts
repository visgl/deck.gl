// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {Buffer} from '@luma.gl/core';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {Field, FixedSizeList, Float64, Float32, Uint16, Int32, vectorFromArray} from 'apache-arrow';
import {BitmapLayer} from '../../../modules/layers/src';
import {BitmapLayerMesh} from '../../../modules/layers/src/bitmap-layer/bitmap-layer-mesh';

function column(rows: number[][], type = new Float64()) {
  return vectorFromArray(rows, new FixedSizeList(rows[0].length, new Field('value', type, false)));
}
function props() {
  return {
    positions: column([
      [0, 0],
      [1, 0],
      [0, 1]
    ]),
    texCoords: column(
      [
        [0, 1],
        [1, 1],
        [0, 0]
      ],
      new Float32()
    )
  };
}

test('Bitmap mesh converts positions and bounds and retains the last valid replacement', async () => {
  const device = new NullDevice({});
  const mesh = new BitmapLayerMesh(device);
  const failed = vi.fn();
  const changed = vi.fn();
  await mesh.update(
    {...props(), indices: vectorFromArray([0, 1, 2], new Uint16())},
    {fp64: true},
    changed,
    failed
  );
  expect(failed).not.toHaveBeenCalled();
  expect(mesh.bounds).toEqual([
    [0, 0, 0],
    [1, 1, 0]
  ]);
  const previous = (mesh as any).attributes;
  const buffer = previous.positions.data[0].buffer;
  const indexBuffer = (mesh as any).indices.data[0].buffer;
  expect(indexBuffer.indexType).toBe('uint16');
  expect(indexBuffer.usage & Buffer.INDEX).toBeTruthy();
  await mesh.update({...props(), texCoords: column([[0, 0]])}, {}, changed, failed);
  expect(failed).toHaveBeenCalledOnce();
  expect((mesh as any).attributes).toBe(previous);
  expect(buffer.destroyed).toBe(false);
  await mesh.update(props(), {}, changed, failed);
  expect(buffer.destroyed).toBe(true);
  expect(indexBuffer.destroyed).toBe(true);
  expect((mesh as any).indices).toBe(null);
  mesh.destroy();
  device.destroy();
});

test('Bitmap mesh rejects incomplete inputs, invalid indices, and chunked columns', async () => {
  const device = new NullDevice({});
  const mesh = new BitmapLayerMesh(device);
  for (const input of [
    {positions: props().positions},
    {...props(), indices: vectorFromArray([0, 1, 2], new Int32())},
    {...props(), indices: vectorFromArray([0, 1, 9], new Uint16())},
    {...props(), indices: vectorFromArray([0, 1], new Uint16())},
    {...props(), positions: props().positions.concat(props().positions)}
  ]) {
    const failed = vi.fn();
    await mesh.update(input, {}, () => {}, failed);
    expect(failed).toHaveBeenCalledOnce();
    expect(mesh.loading).toBe(false);
  }
  mesh.destroy();
  device.destroy();
});

test('Bitmap mesh borrows offsets and strides without destroying caller buffers', async () => {
  const device = new NullDevice({});
  const buffer = device.createBuffer({byteLength: 80, usage: Buffer.VERTEX});
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    buffer,
    format: 'float32x3',
    length: 3,
    byteOffset: 4,
    byteStride: 24
  });
  const mesh = new BitmapLayerMesh(device);
  const failed = vi.fn();
  await mesh.update({...props(), positions}, {}, () => {}, failed);
  expect(failed).not.toHaveBeenCalled();
  expect((mesh as any).attributes.positions).toBe(positions);
  await mesh.update({...props(), positions}, {transform: value => value}, () => {}, failed);
  expect(failed).toHaveBeenCalledOnce();
  mesh.destroy();
  expect(buffer.destroyed).toBe(false);
  buffer.destroy();
  device.destroy();
});

test('Bitmap discards pending conversions after removal', async () => {
  const device = new NullDevice({});
  const mesh = new BitmapLayerMesh(device);
  const buffers = vi.spyOn(device, 'createBuffer');
  const changed = vi.fn();
  const failed = vi.fn();
  const pending = mesh.update(props(), {}, changed, failed);
  mesh.destroy();
  await pending;
  expect(changed).not.toHaveBeenCalled();
  expect(failed).not.toHaveBeenCalled();
  for (const result of buffers.mock.results) expect(result.value.destroyed).toBe(true);
  device.destroy();
});

test('Bitmap rejects incompatible GPU index metadata without borrowing ownership', async () => {
  const device = new NullDevice({});
  const mesh = new BitmapLayerMesh(device);
  const buffer = device.createBuffer({byteLength: 12, usage: Buffer.VERTEX});
  const indices = new GPUVector({
    type: 'buffer',
    name: 'indices',
    buffer,
    format: 'uint32',
    length: 3
  });
  const failed = vi.fn();
  await mesh.update({...props(), indices}, {}, () => {}, failed);
  expect(failed).toHaveBeenCalledOnce();
  mesh.destroy();
  expect(buffer.destroyed).toBe(false);
  buffer.destroy();
  device.destroy();
});

test('Bitmap mesh mode rejects projection tolerance instead of ignoring it', () => {
  const layer = new BitmapLayer({...props(), _projectionTolerance: 1});
  expect(() => layer.updateState({} as any)).toThrow('_projectionTolerance');
});
