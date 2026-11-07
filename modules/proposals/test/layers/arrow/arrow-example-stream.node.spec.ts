// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import type {ArrowPathLayer} from '@deck.gl/proposals/layers';
import type {ArrowPathDataSourceProps} from '../../../../../examples/proposals/arrow-path-layer/arrow-path-data-source';
import {MEASURE_SWEEP_DURATION} from '../../../../../examples/proposals/shared/arrow/arrow-lines/arrow-line-data';
import {createArrowPathLayerDeck} from '../../../../../examples/proposals/arrow-path-layer/app';

const callbacks = vi.hoisted(() => ({
  onDataUpdated: null as ArrowPathDataSourceProps['onDataUpdated'] | null
}));
vi.mock('../../../../../examples/proposals/arrow-path-layer/arrow-path-data-source', () => ({
  ArrowPathDataSource: class {
    constructor(props: ArrowPathDataSourceProps) {
      callbacks.onDataUpdated = props.onDataUpdated;
    }
    initialize(): void {}
    finalize(): void {}
  }
}));
vi.mock('../../../../../examples/proposals/arrow-deck', () => ({
  ArrowDeck: class {
    props: any;
    constructor(props: any) {
      this.props = props;
    }
    setProps(props: any): void {
      this.props = {...this.props, ...props};
    }
  }
}));

for (const useColumns of [false, true]) {
  test(`animation retains the stream with column selectors=${useColumns}`, () => {
    const deck = createArrowPathLayerDeck();
    const iterator = (async function* () {})();
    callbacks.onDataUpdated!({
      asyncIterator: iterator,
      model: 'storage',
      colorColumn: useColumns,
      widthColumn: useColumns,
      currentTime: 0,
      trailLength: 10,
      temporalEnabled: true,
      animate: true,
      layerProps: {}
    });
    const previous = deck.props.layers[0] as ArrowPathLayer;
    deck.props.onBeforeRender!({deck} as never);
    const next = deck.props.layers[0] as ArrowPathLayer;
    expect(next.props.data).toBe(iterator);
    expect(next.props.colors).toBe(previous.props.colors);
    expect(next.props.widths).toBe(previous.props.widths);
    const previousRenderer = previous.renderLayers().renderLayers();
    const nextRenderer = next.renderLayers().renderLayers();
    nextRenderer.state = {sourceInitialized: true, batches: [], loadVersion: 1};
    const loadSource = vi.spyOn(nextRenderer as any, 'loadSource');
    vi.spyOn(nextRenderer, 'setNeedsRedraw').mockImplementation(() => {});
    nextRenderer.updateState({
      props: nextRenderer.props,
      oldProps: previousRenderer.props,
      changeFlags: {dataChanged: false}
    } as never);
    expect(loadSource).not.toHaveBeenCalled();
  });
}

test('pausing and resuming preserves the path stream and elapsed trail time', () => {
  const clock = vi.spyOn(performance, 'now');
  const deck = createArrowPathLayerDeck();
  const update = {
    asyncIterator: (async function* () {})(),
    model: 'storage' as const,
    colorColumn: true,
    widthColumn: true,
    currentTime: 1,
    trailLength: 10,
    temporalEnabled: true,
    animate: true,
    layerProps: {}
  };
  callbacks.onDataUpdated!(update);
  clock.mockReturnValue(1000);
  deck.props.onBeforeRender!({deck} as never);
  clock.mockReturnValue(2000);
  deck.props.onBeforeRender!({deck} as never);
  const time = deck.props.layers[0].props.currentTime;
  expect(time).toBeCloseTo(1.24);
  callbacks.onDataUpdated!({...update, animate: false});
  expect(deck.props.layers[0].props.currentTime).toBe(time);
  clock.mockReturnValue(10000);
  deck.props.onBeforeRender!({deck} as never);
  callbacks.onDataUpdated!({...update, animate: true});
  deck.props.onBeforeRender!({deck} as never);
  expect(deck.props.layers[0].props.currentTime).toBe(time);
  clock.mockReturnValue(11000);
  deck.props.onBeforeRender!({deck} as never);
  expect(deck.props.layers[0].props.currentTime).toBeCloseTo(
    (time + 0.24) % MEASURE_SWEEP_DURATION
  );
  expect(deck.props.layers[0].props.data).toBe(update.asyncIterator);
  clock.mockRestore();
});
