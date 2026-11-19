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
    const widgetRoot = tester.findElements('.deck-widget-color-scale')[0];
    expect(getComputedStyle(widgetRoot).display).toBe('none');
    tester.setProps({layerFilter: () => true});
    await vi.waitFor(() => expect(legend()?.textContent).toContain('readings'));
    expect(legend()?.textContent).not.toContain('hidden-child');
    expect(legend()?.textContent).not.toContain('getFillColor');
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
    expect(style.maxHeight).toBe('376px');
    expect(getComputedStyle(widgetRoot).display).not.toBe('none');

    const disclosure = panel.querySelector('details')!;
    const heading = disclosure.querySelector('summary')!;
    expect(heading.textContent).toBe('Legend');
    expect(disclosure.open).toBe(true);
    heading.click();
    expect(disclosure.open).toBe(false);
    heading.click();
    expect(disclosure.open).toBe(true);

    tester.setProps({layerFilter: () => false});
    await vi.waitFor(() => expect(legend()).toBeUndefined());
    expect(getComputedStyle(widgetRoot).display).toBe('none');
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
    await vi.waitFor(() => expect(legends()[0]?.textContent).toContain('counties'), {
      timeout: 5000
    });
    tester.setProps({layerFilter: () => false});
    await vi.waitFor(() => expect(legends()).toHaveLength(0));
  } finally {
    tester.destroy();
  }
});

test('_ColorScaleWidget labels multiple scales with readable names', async () => {
  const layer = makeReadings().clone({
    stroked: true,
    getLineColor: {sql: "SCALE_QUANTILE(value, 2, PALETTE('#0000ff', '#ff0000'))"}
  });
  const tester = new WidgetTester({layers: [layer], widgets: [new _ColorScaleWidget()]});
  try {
    await vi.waitFor(() => {
      const label = tester.findElements('.deck-widget-color-scale section')[0]?.textContent;
      expect(label).toContain('readings · fill color');
      expect(label).toContain('readings · line color');
      expect(
        tester.findElements('.deck-color-scale-heading small').map(item => item.textContent)
      ).toEqual(['Continuous', 'Quantile']);
    });
  } finally {
    tester.destroy();
  }
});

test('_ColorScaleWidget formats numeric labels and aligns them below quantile breaks', async () => {
  const layer = makeReadings().clone({
    data: tableFromArrays({value: [1.2345, 12.345]}),
    getFillColor: {sql: "SCALE_QUANTILE(value, 2, PALETTE('#0000ff', '#ff0000'))"}
  });
  const widget = new _ColorScaleWidget();
  const tester = new WidgetTester({layers: [layer], widgets: [widget]});
  /** Reads labels from the horizontal quantile legend. */
  const breaks = () => tester.findElements('.deck-color-scale-breaks > span') as HTMLElement[];
  try {
    await vi.waitFor(() =>
      expect(breaks().map(item => item.textContent)).toEqual(['1.2', '6.8', '12'])
    );
    expect(breaks().map(item => item.style.left)).toEqual(['0%', '50%', '100%']);
    expect(tester.findElements('.deck-color-scale-bins > span')).toHaveLength(2);
    widget.setProps({precision: 4});
    expect(breaks().map(item => item.textContent)).toEqual(['1.235', '6.79', '12.35']);
  } finally {
    tester.destroy();
  }
});

test('_ColorScaleWidget distinguishes nearby values at the default precision', async () => {
  const layer = makeReadings().clone({
    data: tableFromArrays({value: [1000000, 1000001]})
  });
  const tester = new WidgetTester({layers: [layer], widgets: [new _ColorScaleWidget()]});
  try {
    await vi.waitFor(() => {
      const labels = tester.findElements('.deck-color-scale-domain span');
      expect(labels.map(label => label.textContent)).toEqual(['1,000,000', '1,000,001']);
    });
  } finally {
    tester.destroy();
  }
});

test('_ColorScaleWidget gives long quantile labels room and scrolls the row', async () => {
  const layer = makeReadings().clone({
    data: tableFromArrays({value: [1000000, 1000001, 1000002, 1000003, 1000004, 1000005]}),
    getFillColor: {sql: "SCALE_QUANTILE(value, 5, PALETTE('viridis'))"}
  });
  const tester = new WidgetTester({layers: [layer], widgets: [new _ColorScaleWidget()]});
  /** Finds the scroll container once the scale has evaluated. */
  const quantile = () => tester.findElements('.deck-color-scale-quantile')[0];
  try {
    await vi.waitFor(() => expect(quantile()).toBeDefined(), {timeout: 5000});
    const row = quantile();
    const labels = [...row.querySelectorAll('.deck-color-scale-breaks > span')];
    expect(labels).toHaveLength(6);
    expect(row.scrollWidth).toBeGreaterThan(row.clientWidth);
    for (let index = 1; index < labels.length; index++) {
      expect(labels[index - 1].getBoundingClientRect().right).toBeLessThan(
        labels[index].getBoundingClientRect().left
      );
    }
  } finally {
    tester.destroy();
  }
});
