// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {NullDevice} from '@luma.gl/test-utils';
import {PathTripsStorageModel, PathStorageModel} from '@luma.gl/experimental/models';
import * as arrow from 'apache-arrow';
import {expect, test, vi} from 'vitest';
import {
  ArrowLineRenderer,
  convertArrowLineColumnsToGPUVectors
} from '../../../../examples/arrow/arrow-lines/arrow-line-renderer';
import {makeArrowLineSourceData} from '../../../../examples/arrow/arrow-lines/arrow-line-data';

for (const ModelClass of [PathTripsStorageModel, PathStorageModel]) {
  test(`${ModelClass.name} receives live styling without replacing path data`, () => {
    const device = new NullDevice({});
    const renderer = new ArrowLineRenderer(device, {model: 'storage'});
    const model = Object.create(ModelClass.prototype);
    model.setProps = vi.fn();
    renderer.model = model;
    const color: [number, number, number, number] = [20, 40, 60, 255];
    expect(renderer.setProps({color, width: 0.5, currentTime: 75, trailLength: 12})).toEqual({
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
