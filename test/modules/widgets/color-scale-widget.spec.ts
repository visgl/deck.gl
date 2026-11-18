// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {tableFromArrays} from 'apache-arrow';
import {ScatterplotLayer} from '@deck.gl/layers';
import {ColorScaleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('ColorScaleWidget discovers a resolved layer scale and hides it when the layer is hidden', async () => {
  const layer = new ScatterplotLayer({
    id: 'readings',
    data: tableFromArrays({value: [0, 10]}),
    getPosition: [0, 0],
    getFillColor: {sql: "SCALE_COLOR(value, DOMAIN(value), PALETTE('#000000', '#ffffff'))"}
  });
  const tester = new WidgetTester({layers: [layer], widgets: [new ColorScaleWidget()]});
  try {
    await tester.idle();
    expect(tester.findElements('.deck-color-scale-domain')[0]?.textContent).toBe('010');
    const widget = new ColorScaleWidget();
    widget.onRedraw({layers: [layer.clone({visible: false})]});
    const element = document.createElement('div');
    widget.onRenderHTML(element);
    expect(element.textContent).toBe('');
  } finally {
    tester.destroy();
  }
});
