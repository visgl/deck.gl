// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import type {ArrowPathLayer} from '@deck.gl-community/arrow-layers';
import type {ArrowPathDataSourceProps} from '../../../../examples/v10-experimental/arrow-path-layer/arrow-path-data-source';
import {MEASURE_SWEEP_DURATION} from '../../../../examples/v10-experimental/shared/arrow/arrow-lines/arrow-line-data';
import {createArrowPathLayerDeck} from '../../../../examples/v10-experimental/arrow-path-layer/app';

const callbacks = vi.hoisted(() => ({
  onDataUpdated: null as ArrowPathDataSourceProps['onDataUpdated'] | null
}));
vi.mock('../../../../examples/v10-experimental/arrow-path-layer/arrow-path-data-source', () => ({
  ArrowPathDataSource: class {
    constructor(props: ArrowPathDataSourceProps) {
      callbacks.onDataUpdated = props.onDataUpdated;
    }
    initialize(): void {}
    finalize(): void {}
  }
}));
vi.mock('../../../../examples/v10-experimental/arrow-deck', () => ({
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
    expect(next.props.color).toBe(previous.props.color);
    expect(next.props.width).toBe(previous.props.width);
    next.state = {sourceInitialized: true, batches: [], loadVersion: 1};
    const loadSource = vi.spyOn(next as any, 'loadSource');
    vi.spyOn(next, 'setNeedsRedraw').mockImplementation(() => {});
    next.updateState({
      props: next.props,
      oldProps: previous.props,
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
