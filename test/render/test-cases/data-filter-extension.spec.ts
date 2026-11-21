// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {describe, expect} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {defaultOnAfterRender, type TestCase} from '../deck-test-utils';

const VIEWSTATE = {latitude: 37, longitude: -122, zoom: 10.2, pitch: 0, bearing: 0};
const DATA = [];
let i = 0;
for (let y = 0; y < 20; y++) {
  for (let x = 0; x < 32; x++) {
    DATA.push({
      position: [VIEWSTATE.longitude + 0.01 * (x - 16), VIEWSTATE.latitude - 0.01 * (y - 10)],
      index: i++,
      column: x,
      row: y
    });
  }
}

// Golden: only matching grid points remain large; counting must not change rendering.
const testCases = [
  {
    name: 'filter-1d',
    expectedCount: 120,
    props: {
      extensions: [new DataFilterExtension({countItems: true, filterSize: 1})],
      getFilterValue: d => d.column,
      filterRange: [3, 8]
    }
  },
  {
    name: 'filter-2d',
    expectedCount: 24,
    props: {
      extensions: [new DataFilterExtension({countItems: true, filterSize: 2})],
      getFilterValue: d => [d.column, d.row],
      filterRange: [
        [3, 8],
        [2, 5]
      ]
    }
  },
  {
    name: 'single-category',
    expectedCount: 25,
    props: {
      extensions: [new DataFilterExtension({countItems: true, categorySize: 1})],
      getFilterCategory: d => d.index % 128,
      filterCategories: [3, 4, 5, 127, 0]
    }
  },
  {
    name: '2-categories',
    expectedCount: 13,
    props: {
      extensions: [new DataFilterExtension({countItems: true, categorySize: 2, filterSize: 0})],
      getFilterCategory: d => [d.index % 128, d.row],
      filterCategories: [
        [3, 4, 5, 15, 50],
        [4, 5, 8, 16, 'missing']
      ]
    }
  },
  {
    name: '3-categories',
    expectedCount: 7,
    props: {
      extensions: [new DataFilterExtension({countItems: true, categorySize: 3})],
      getFilterCategory: d => [d.index % 32, d.column, d.row],
      filterCategories: [[3], [1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6]]
    }
  },
  {
    name: '4-categories',
    expectedCount: 4,
    props: {
      extensions: [new DataFilterExtension({countItems: true, categorySize: 4})],
      getFilterCategory: ({index}) => [index % 2, index % 3, index % 5, index % 7],
      filterCategories: [[0], [0], [0], [0]]
    }
  },
  {
    name: '4-categories-filter-2d',
    expectedCount: 2,
    props: {
      extensions: [new DataFilterExtension({countItems: true, categorySize: 4, filterSize: 2})],
      getFilterCategory: ({index}) => [index % 2, index % 3, index % 5, index % 7],
      filterCategories: [[0], [0], [0], [0]],
      getFilterValue: d => [d.column, d.row],
      filterRange: [
        [2, 1000],
        [0, 15]
      ]
    }
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  const renderCases = testCases.map(({name, props, expectedCount}) => {
    let filteredCount: number | undefined;
    return {
      name: `data-filter-effect-${name}`,
      viewState: VIEWSTATE,
      layers: [
        new ScatterplotLayer({
          id: name,
          data: DATA,
          onFilteredItemsChange: ({count}) => {
            filteredCount = count;
          },
          getRadius: 8,
          radiusUnits: 'pixels',
          ...props
        }),
        new ScatterplotLayer({
          id: `${name}-background`,
          data: DATA,
          getRadius: 2,
          radiusUnits: 'pixels'
        })
      ],
      onAfterRender: params => {
        if (filteredCount === undefined) {
          params.layers[0].setNeedsRedraw();
          return;
        }
        expect(filteredCount).toBe(expectedCount);
        defaultOnAfterRender(params);
      },
      goldenImage: `./test/render/golden-images/data-filter-effect-${name}.png`
    };
  });
  runRenderTestSuite(renderCases as TestCase[], deviceType);
});
