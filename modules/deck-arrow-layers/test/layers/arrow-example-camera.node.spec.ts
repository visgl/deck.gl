// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {createArrowTextLayerDeck} from '../../../../examples/v10-experimental/arrow-text-layer/app';
import {createArrowPolygonLayerDeck} from '../../../../examples/v10-experimental/arrow-polygon-layer/app';

const sources = vi.hoisted(() => ({text: null as any, polygon: null as any}));
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
vi.mock('@luma.gl/text', () => ({buildSdfFontAtlas: () => ({})}));
vi.mock('../../../../examples/v10-experimental/arrow-text-layer/arrow-text-data-source', () => ({
  ArrowTextDataSource: class {
    constructor(props: any) {
      sources.text = props;
    }
  }
}));
vi.mock(
  '../../../../examples/v10-experimental/shared/arrow/arrow-polygons/arrow-polygon-data-source',
  () => ({
    ArrowPolygonDataSource: class {
      constructor(props: any) {
        sources.polygon = props;
      }
    }
  })
);

test('paused text camera retains controller pan and zoom on subsequent draws', () => {
  const deck = createArrowTextLayerDeck();
  sources.text.onDataUpdated({
    animate: false,
    labelFieldHeight: 1000,
    clipRects: null,
    angles: null,
    sizes: null,
    layerProps: {}
  });
  const camera = {target: [50, 60, 0], zoom: 2};
  (deck.props.onViewStateChange as any)({viewState: camera});
  const setProps = vi.spyOn(deck, 'setProps');
  (deck.props.onBeforeRender as any)({deck});
  expect(deck.props.viewState).toEqual(camera);
  expect(setProps).not.toHaveBeenCalled();
});

test('polygon scrolling retains user camera offset and zoom', () => {
  const deck = createArrowPolygonLayerDeck();
  sources.polygon.onDataUpdated({
    viewState: {startCenter: [0, 0], endCenter: [100, 0], scrollDurationSeconds: 10},
    colors: null,
    layerProps: {}
  });
  const camera = {target: [50, 60, 0], zoom: 11};
  (deck.props.onViewStateChange as any)({viewState: camera});
  (deck.props.onBeforeRender as any)({deck});
  expect(deck.props.viewState).toEqual(camera);
});

test('text data updates reset motion baseline without jumping the user camera', () => {
  const deck = createArrowTextLayerDeck();
  const update = {
    animate: true,
    labelFieldHeight: 1000,
    clipRects: null,
    angles: null,
    sizes: null,
    layerProps: {}
  };
  const now = vi.spyOn(performance, 'now').mockReturnValue(0);
  try {
    sources.text.onDataUpdated(update);
    const camera = {target: [50, 60, 0], zoom: 2};
    (deck.props.onViewStateChange as any)({viewState: camera});
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual(camera);
    now.mockReturnValue(1000);
    (deck.props.onBeforeRender as any)({deck});
    const movedCamera = deck.props.viewState;
    sources.text.onDataUpdated({...update, labelFieldHeight: 2000});
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual(movedCamera);
  } finally {
    now.mockRestore();
  }
});

test('polygon color updates preserve the camera and scroll phase after scrolling', () => {
  const deck = createArrowPolygonLayerDeck();
  const update = {
    viewState: {startCenter: [0, 0], endCenter: [100, 0], scrollDurationSeconds: 10},
    colors: null,
    layerProps: {}
  };
  const now = vi.spyOn(performance, 'now').mockReturnValue(0);
  try {
    sources.polygon.onDataUpdated(update);
    const camera = {target: [50, 60, 3], zoom: 11};
    (deck.props.onViewStateChange as any)({viewState: camera});
    (deck.props.onBeforeRender as any)({deck});
    now.mockReturnValue(5000);
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual({...camera, target: [100, 60, 3]});
    sources.polygon.onDataUpdated({...update, colors: 'colors'});
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual({...camera, target: [100, 60, 3]});
    now.mockReturnValue(10000);
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual({...camera, target: [150, 60, 3]});
    now.mockReturnValue(20000);
    (deck.props.onBeforeRender as any)({deck});
    expect(deck.props.viewState).toEqual(camera);
  } finally {
    now.mockRestore();
  }
});
