// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NullDevice} from '@luma.gl/test-utils';
import {
  PathTripsStorageModel,
  PathStorageModel,
  PathAttributeModel
} from '@luma.gl/experimental/models';
import {Model} from '@luma.gl/engine';
import * as arrow from 'apache-arrow';
import {expect, test, vi} from 'vitest';
import {
  ArrowLineRenderer,
  convertArrowLineColumnsToGPUVectors
} from '../../../../examples/arrow/arrow-lines/arrow-line-renderer';
import {
  makeArrowLineRecordBatches,
  makeArrowLineSourceData
} from '../../../../examples/arrow/arrow-lines/arrow-line-data';

for (const ModelClass of [PathTripsStorageModel, PathStorageModel]) {
  test(`${ModelClass.name} receives live styling without replacing path data`, () => {
    const device = new NullDevice({});
    const renderer = new ArrowLineRenderer(device, {
      model: 'storage',
      timeColumn: 'timestamps',
      mode: 'lines'
    });
    const model = Object.create(ModelClass.prototype);
    model.setProps = vi.fn();
    renderer.model = model;
    const color: [number, number, number, number] = [20, 40, 60, 255];
    expect(
      renderer.setProps({
        color,
        width: 0.5,
        currentTime: 75,
        trailLength: 12,
        model: 'storage',
        timeColumn: 'timestamps',
        mode: 'lines'
      })
    ).toEqual({
      modelChanged: false
    });
    expect(renderer.model).toBe(model);
    expect(model.setProps).toHaveBeenLastCalledWith(
      ModelClass === PathTripsStorageModel
        ? {color, width: 0.5, currentTime: 75, trailLength: 12}
        : {color, width: 0.5}
    );
    renderer.setProps({currentTime: 80});
    expect(model.setProps).toHaveBeenLastCalledWith(
      ModelClass === PathTripsStorageModel ? {currentTime: 80} : {}
    );
    device.destroy();
  });
}

test('failed path preparation releases uploaded timestamp buffers', async () => {
  const device = new NullDevice({});
  const {sourceVectors} = makeArrowLineSourceData(
    {pathCount: 1, pointCount: 2, label: 'test'},
    'lines',
    'float32',
    'none',
    'timestamps'
  );
  const createBuffer = vi.spyOn(device, 'createBuffer');
  await expect(
    convertArrowLineColumnsToGPUVectors(
      device,
      {...sourceVectors, paths: arrow.vectorFromArray([1, 2])},
      {model: 'attribute', timeColumn: 'timestamps'}
    )
  ).rejects.toThrow();
  expect(createBuffer.mock.results.length).toBeGreaterThan(0);
  for (const result of createBuffer.mock.results) expect(result.value.destroyed).toBe(true);
  device.destroy();
});

test('delayed batches use the latest animation and style settings', async () => {
  const device = new NullDevice({});
  const renderer = new ArrowLineRenderer(device, {model: 'attribute'});
  const prepared = vi.spyOn(renderer as any, 'setPreparedProps').mockImplementation(() => {});
  const batch = makeArrowLineRecordBatches(
    makeArrowLineSourceData(
      {pathCount: 1, pointCount: 2, label: 'test'},
      'lines',
      'float32',
      'none',
      'timestamps'
    )
  )[0];
  const gate = Promise.withResolvers<void>();
  async function* stream() {
    yield batch;
    await gate.promise;
    yield batch;
  }
  renderer.setProps({data: stream(), currentTime: 1, trailLength: 2, width: 1});
  await vi.waitFor(() => expect(prepared).toHaveBeenCalledTimes(1));
  const color: [number, number, number, number] = [30, 50, 70, 255];
  renderer.setProps({currentTime: 80, trailLength: 12, width: 4, color});
  gate.resolve();
  await vi.waitFor(() => expect(prepared).toHaveBeenCalledTimes(2));
  expect(prepared.mock.calls[1][0]).toMatchObject({
    currentTime: 80,
    trailLength: 12,
    width: 4,
    color
  });
  const pathState = (prepared.mock.calls[1][0] as any).data.pathState;
  expect(pathState.renderBatches).toHaveLength(2);
  const attributeModel = Object.create(PathAttributeModel.prototype);
  Object.assign(attributeModel, {
    table: null,
    pathShaderLayout: {attributes: [{name: 'pathViewOrigins'}]},
    renderBatches: pathState.renderBatches,
    segmentLayout: pathState.segmentLayout,
    expandedPathVertexData: pathState.expandedPathVertexData,
    pathViewOriginData: pathState.pathViewOriginData,
    setAttributes: vi.fn(),
    setInstanceCount: vi.fn()
  });
  const draw = vi.spyOn(Model.prototype, 'draw').mockReturnValue(true);
  try {
    attributeModel.draw({} as any);
    expect(draw).toHaveBeenCalledTimes(2);
    for (let index = 0; index < 2; index++) {
      expect(attributeModel.setAttributes.mock.calls[index][0].expandedPathVertexData).toBe(
        pathState.renderBatches[index].expandedPathVertexData
      );
    }
  } finally {
    draw.mockRestore();
  }
  renderer.destroy();
  device.destroy();
});
