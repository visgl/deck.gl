// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type LayerContext} from '@deck.gl/core';
import {
  ArrowArcLayer,
  ArrowColumnLayer,
  ArrowIconLayer,
  ArrowLineLayer,
  ArrowPointCloudLayer,
  ArrowScatterplotLayer,
  ArrowPathLayer
} from '@deck.gl-community/arrow-layers';
import {makeArrowFixedSizeListVector} from '@luma.gl/arrow';
import {NullDevice} from '@luma.gl/test-utils';
import * as arrow from 'apache-arrow';
import {expect, test, vi} from 'vitest';

const adapterCases = [
  [
    ArrowArcLayer,
    {getSourcePosition: 'positions', getTargetPosition: 'positions', getWidth: 'missing'}
  ],
  [ArrowColumnLayer, {getPosition: 'positions', getRadius: 'missing'}],
  [
    ArrowIconLayer,
    {
      getPosition: 'positions',
      getIcon: 'icons',
      iconMapping: {dot: {x: 0, y: 0, width: 32, height: 32}},
      getSize: 'missing'
    }
  ],
  [
    ArrowLineLayer,
    {getSourcePosition: 'positions', getTargetPosition: 'positions', getWidth: 'missing'}
  ],
  [ArrowPointCloudLayer, {getPosition: 'positions', getColor: 'missing'}],
  [ArrowScatterplotLayer, {getPosition: 'positions', getRadius: 'missing'}]
] as const;

for (const [LayerClass, props] of adapterCases) {
  test(`${LayerClass.layerName} preserves old vectors and rolls back a rejected upload`, () => {
    const device = new NullDevice({});
    const positions = makeArrowFixedSizeListVector(
      new arrow.Float32(),
      LayerClass === ArrowPointCloudLayer ? 3 : 2,
      new Float32Array(LayerClass === ArrowPointCloudLayer ? [1, 2, 3] : [1, 2])
    );
    const data = new arrow.Table({positions, icons: arrow.vectorFromArray(['dot'])});
    const layer = new LayerClass({id: 'adapter', data, ...props} as never);
    const oldVector = {destroy: vi.fn()};
    layer.state = {positions: oldVector, sourcePositions: oldVector};
    const unsubscribe = vi.fn();
    layer.context = {device, resourceManager: {unsubscribe}} as unknown as LayerContext;
    vi.spyOn(layer, 'setState').mockImplementation(state => Object.assign(layer.state, state));
    const createBuffer = vi.spyOn(device, 'createBuffer');
    expect(() =>
      layer.updateState({
        props: layer.props,
        oldProps: layer.props,
        changeFlags: {dataChanged: true}
      } as never)
    ).toThrow('missing');
    expect(oldVector.destroy).not.toHaveBeenCalled();
    expect(layer.state.positions).toBe(oldVector);
    expect(createBuffer.mock.results.length).toBeGreaterThan(0);
    for (const result of createBuffer.mock.results) expect(result.value.destroyed).toBe(true);
    layer.state = {positions: oldVector};
    layer.finalizeState(layer.context);
    expect(oldVector.destroy).toHaveBeenCalledOnce();
    expect(unsubscribe).toHaveBeenCalledWith({consumerId: layer.id});
    device.destroy();
  });
}

for (const reason of ['replace', 'finalize', 'prepare-error'] as const) {
  test(`ArrowPathLayer closes its iterator on ${reason}`, async () => {
    const layer = new ArrowPathLayer({id: 'path'});
    layer.state = {
      batches: [],
      loadVersion: 1,
      sourceInitialized: true,
      gpuVectorSourceCache: new Map()
    };
    layer.context = {resourceManager: {unsubscribe: vi.fn()}} as unknown as LayerContext;
    vi.spyOn(layer, 'setState').mockImplementation(state => Object.assign(layer.state, state));
    const iterator = {
      next: vi.fn(() =>
        reason === 'prepare-error'
          ? Promise.resolve({done: false, value: {numRows: 1}})
          : new Promise<IteratorResult<arrow.RecordBatch>>(() => {})
      ),
      return: vi.fn(async () => ({done: true, value: undefined}))
    };
    const internal = layer as any;
    internal.appendSourceBatch = vi.fn(async () => {
      throw new Error('preparation failed');
    });
    const loading = internal.loadRecordBatchSource(layer.props, iterator, 1);
    if (reason === 'replace') await internal.loadSource({...layer.props, data: null});
    if (reason === 'finalize') layer.finalizeState(layer.context);
    if (reason === 'prepare-error') await expect(loading).rejects.toThrow('preparation failed');
    else await loading;
    expect(iterator.return).toHaveBeenCalledOnce();
    if (reason !== 'prepare-error') expect(internal.appendSourceBatch).not.toHaveBeenCalled();
  });
}
