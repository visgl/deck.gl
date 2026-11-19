// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {CompositeLayer, OrthographicView} from '@deck.gl/core';
import {tableFromArrays} from 'apache-arrow';
import {PolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {_ColorScaleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

/** Builds a drawable layer with a resolved SQL color scale. */
function makeReadings(id = 'readings') {
  return new ScatterplotLayer({
    id,
    data: tableFromArrays({value: [0, 10]}),
    getPosition: [0, 0],
    getFillColor: {sql: "SCALE_COLOR(value, DOMAIN(value), PALETTE('#000000', '#ffffff'))"}
  });
}

/** Excludes a child in the same way that a composite filters cached sublayers. */
class ReadingsGroup extends CompositeLayer {
  /** Layer type used by the fixture. */
  static layerName = 'ReadingsGroup';

  /** Suppresses all children of the test composite. */
  filterSubLayer() {
    return false;
  }

  /** Creates a child with its own SQL scale. */
  renderLayers() {
    return makeReadings('hidden-child');
  }
}

test('_ColorScaleWidget respects screen filters and its attached viewport', async () => {
  const layer = makeReadings();
  const tester = new WidgetTester({
    views: [
      new OrthographicView({id: 'left', width: '50%'}),
      new OrthographicView({id: 'right', x: '50%', width: '50%'})
    ],
    layerFilter: ({viewport}) => viewport.id === 'right',
    layers: [layer, new ReadingsGroup()],
    widgets: [new _ColorScaleWidget({viewId: 'left'})]
  });
  /** Reads the panel associated with the attached view. */
  const legend = () => tester.findElements('.deck-widget-color-scale section')[0];
  try {
    await vi.waitFor(() => expect(layer._getResolvedColorScales()).toBeDefined());
    await tester.idle();
    expect(legend()).toBeUndefined();
    tester.setProps({layerFilter: () => true});
    await vi.waitFor(() => expect(legend()?.textContent).toContain('readings · getFillColor'));
    expect(legend()?.textContent).not.toContain('hidden-child');
    expect(tester.findElements('.deck-color-scale-domain')[0]?.textContent).toBe('010');

    const panel = legend() as HTMLElement;
    const container = tester.findElements('')[0] as HTMLElement;
    container.style.setProperty('--menu-background', 'rgb(1, 2, 3)');
    container.style.setProperty('--menu-text', 'rgb(4, 5, 6)');
    const style = getComputedStyle(panel);
    expect(style.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(style.color).toBe('rgb(4, 5, 6)');
    expect(style.overflowY).toBe('auto');
    expect(style.pointerEvents).toBe('auto');
    expect(panel.style.maxHeight).toBe('384px');

    tester.setProps({layerFilter: () => false});
    await vi.waitFor(() => expect(legend()).toBeUndefined());
  } finally {
    tester.destroy();
  }
});

test('_ColorScaleWidget includes a composite scale when one of its children is drawable', async () => {
  const layer = new PolygonLayer({
    id: 'counties',
    data: tableFromArrays({
      value: [0, 10],
      path: [
        [0, 0, 1, 0, 0, 1],
        [1, 1, 2, 1, 1, 2]
      ]
    }),
    getPolygon: {sql: 'path'},
    getFillColor: {sql: "SCALE_COLOR(value, DOMAIN(value), PALETTE('#000000', '#ffffff'))"},
    positionFormat: 'XY',
    stroked: false
  });
  const tester = new WidgetTester({layers: [layer], widgets: [new _ColorScaleWidget()]});
  /** Reads the currently rendered legend panels. */
  const legends = () => tester.findElements('.deck-widget-color-scale section');
  try {
    await vi.waitFor(() => expect(legends()[0]?.textContent).toContain('counties · getFillColor'));
    tester.setProps({layerFilter: () => false});
    await vi.waitFor(() => expect(legends()).toHaveLength(0));
  } finally {
    tester.destroy();
  }
});
