// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {createArrowTextLayerDeck} from '../../../../examples/deck/arrow-text-layer/app';
import {createArrowPolygonLayerDeck} from '../../../../examples/deck/arrow-polygon-layer/app';

const sources = vi.hoisted(() => ({text: null as any, polygon: null as any}));
vi.mock('../../../../examples/deck/arrow-deck', () => ({
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
vi.mock('../../../../examples/deck/arrow-text-layer/arrow-text-data-source', () => ({
  ArrowTextDataSource: class {
    constructor(props: any) {
      sources.text = props;
    }
  }
}));
vi.mock('../../../../examples/arrow/arrow-polygons/arrow-polygon-data-source', () => ({
  ArrowPolygonDataSource: class {
    constructor(props: any) {
      sources.polygon = props;
    }
  }
}));

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
