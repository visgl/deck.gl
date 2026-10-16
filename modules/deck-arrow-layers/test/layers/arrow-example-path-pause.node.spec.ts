// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ArrowPathDataSource} from '../../../../examples/v10-experimental/arrow-path-layer/arrow-path-data-source';

const panel = vi.hoisted(() => ({props: null as any, beginTableStream: vi.fn()}));
vi.mock('../../../../examples/v10-experimental/arrow-example-source-panel', () => ({
  DeckArrowSourcePanel: class {
    constructor(props: any) {
      panel.props = props;
    }
    initialize(): void {}
    beginTableStream = panel.beginTableStream;
  }
}));

test('animation settings preserve partially loaded path batches and table progress', () => {
  panel.beginTableStream.mockReturnValue({setLoadedBatchCount: vi.fn()});
  const onDataUpdated = vi.fn();
  const source = new ArrowPathDataSource({onDataUpdated});
  source.initialize({type: 'webgpu'} as any);
  const settings = {...panel.props.initialState, rowCountKind: '2400-stream', timeKind: 'xyzm'};
  panel.props.onSettingsChange(settings);
  const update = onDataUpdated.mock.lastCall![0];
  update.layerProps.onDataBatch({loadedBatchCount: 2});
  const streamCount = panel.beginTableStream.mock.calls.length;
  for (const animate of [false, true]) {
    panel.props.onSettingsChange({...settings, animate});
    const next = onDataUpdated.mock.lastCall![0];
    expect(next.asyncIterator).toBe(update.asyncIterator);
    expect(next.layerProps.onDataBatch).toBe(update.layerProps.onDataBatch);
    expect(next.animate).toBe(animate);
    expect(panel.beginTableStream).toHaveBeenCalledTimes(streamCount);
  }
});
