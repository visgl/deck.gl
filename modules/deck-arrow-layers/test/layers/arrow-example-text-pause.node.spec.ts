// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {ArrowTextDataSource} from '../../../../examples/v10-experimental/arrow-text-layer/arrow-text-data-source';

const mocks = vi.hoisted(() => ({
  panelProps: null as any,
  beginTableStream: vi.fn(),
  makeSource: vi.fn()
}));
vi.mock('../../../../examples/v10-experimental/arrow-example-source-panel', () => ({
  DeckArrowSourcePanel: class {
    constructor(props: any) {
      mocks.panelProps = props;
    }
    initialize(): void {}
    setSettings(): void {}
    beginTableStream = mocks.beginTableStream;
  }
}));
vi.mock(
  '../../../../examples/v10-experimental/shared/arrow/arrow-text-2d/arrow-text-data',
  async importOriginal => ({
    ...(await importOriginal<any>()),
    makeStreamingArrowTextSourceAsync: mocks.makeSource
  })
);

test('text animation toggles preserve loaded batches and pending source generation', async () => {
  const progress = vi.fn();
  mocks.beginTableStream.mockReturnValue({setLoadedBatchCount: progress});
  let finishGeneration!: (source: any) => void;
  mocks.makeSource.mockImplementation(
    () =>
      new Promise(resolve => {
        finishGeneration = resolve;
      })
  );
  const onDataUpdated = vi.fn();
  const source = new ArrowTextDataSource({onDataUpdated});
  source.initialize({type: 'webgpu'} as any);
  const initialSettings = {...mocks.panelProps.initialState};
  const settings = {...initialSettings, rowCountKind: '1m'};
  mocks.panelProps.onSettingsChange(settings);
  mocks.panelProps.onSettingsChange({...settings, animate: false});
  expect(mocks.makeSource).toHaveBeenCalledTimes(2);
  const batches = [{schema: {}, numRows: 5000}];
  finishGeneration({recordBatches: batches});
  await vi.waitFor(() => expect(onDataUpdated).toHaveBeenCalledTimes(1));
  const update = onDataUpdated.mock.lastCall![0];
  expect(update.animate).toBe(false);
  update.layerProps.onDataBatch({loadedBatchCount: 1});
  expect(progress).toHaveBeenCalledWith(1);
  for (const animate of [true, false]) {
    mocks.panelProps.onSettingsChange({...settings, animate});
    const next = onDataUpdated.mock.lastCall![0];
    expect(next.asyncIterator).toBe(update.asyncIterator);
    expect(next.layerProps.onDataBatch).toBe(update.layerProps.onDataBatch);
    expect(next.animate).toBe(animate);
  }
  expect(mocks.makeSource).toHaveBeenCalledTimes(2);
  expect(mocks.beginTableStream).toHaveBeenCalledTimes(1);
});

test('pausing while generating a replacement preserves the loaded text stream', async () => {
  mocks.makeSource.mockReset();
  mocks.beginTableStream.mockReset();
  mocks.beginTableStream.mockReturnValue({setLoadedBatchCount: vi.fn()});
  const batches = [{schema: {}, numRows: 5000}];
  mocks.makeSource.mockResolvedValueOnce({recordBatches: batches});
  const onDataUpdated = vi.fn();
  const source = new ArrowTextDataSource({onDataUpdated});
  source.initialize({type: 'webgpu'} as any);
  await vi.waitFor(() => expect(onDataUpdated).toHaveBeenCalledTimes(1));
  const previous = onDataUpdated.mock.lastCall![0];
  let finishGeneration!: (source: any) => void;
  mocks.makeSource.mockImplementation(
    () =>
      new Promise(resolve => {
        finishGeneration = resolve;
      })
  );
  const settings = {...mocks.panelProps.initialState, rowCountKind: '1m', animate: true};
  mocks.panelProps.onSettingsChange(settings);
  mocks.panelProps.onSettingsChange({...settings, animate: false});
  expect(onDataUpdated).toHaveBeenCalledTimes(2);
  expect(onDataUpdated.mock.lastCall![0].asyncIterator).toBe(previous.asyncIterator);
  expect(onDataUpdated.mock.lastCall![0].animate).toBe(false);
  expect(mocks.makeSource).toHaveBeenCalledTimes(2);
  finishGeneration({recordBatches: batches});
  await vi.waitFor(() => expect(onDataUpdated).toHaveBeenCalledTimes(3));
  const next = onDataUpdated.mock.lastCall![0];
  expect(next.asyncIterator).not.toBe(previous.asyncIterator);
  expect(next.animate).toBe(false);
});
