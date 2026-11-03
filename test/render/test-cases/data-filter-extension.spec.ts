// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {expandViewMatrix} from '../view-presets';
import type {ViewPresetName} from '../view-presets';
import type {TestCase} from '../deck-test-utils';

const VIEWSTATE = {latitude: 37, longitude: -122, zoom: 10.2, pitch: 0, bearing: 0};

// Attribute filtering is projection independent, so one range and one category variant are
// rendered under GlobeView as well; the remaining variants stay map-only to limit golden images.
const MAP_AND_GLOBE: ViewPresetName[] = ['map', 'globe'];
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

const testCases: TestCase[] = [
  {
    // Golden: a 32 x 20 grid of small dots with columns 3 to 8 drawn large, the same on map and globe
    name: 'filter-1d',
    presets: MAP_AND_GLOBE,
    props: {
      extensions: [new DataFilterExtension({filterSize: 1})],
      getFilterValue: d => d.column,
      filterRange: [3, 8]
    }
  },
  {
    // Golden: large dots only where columns 3 to 8 meet rows 2 to 5
    name: 'filter-2d',
    props: {
      extensions: [new DataFilterExtension({filterSize: 2})],
      getFilterValue: d => [d.column, d.row],
      filterRange: [
        [3, 8],
        [2, 5]
      ]
    }
  },
  {
    // Golden: 25 large dots scattered over the grid, five per 128 points, the same on map and globe
    name: 'single-category',
    presets: MAP_AND_GLOBE,
    props: {
      extensions: [new DataFilterExtension({categorySize: 1})],
      getFilterCategory: d => d.index % 128,
      filterCategories: [3, 4, 5, 127, 0]
    }
  },
  {
    // Golden: large dots only on rows 4, 5, 8 and 16 whose index matches one of five categories
    name: '2-categories',
    props: {
      extensions: [new DataFilterExtension({categorySize: 2, filterSize: 0})],
      getFilterCategory: d => [d.index % 128, d.row],
      filterCategories: [
        [3, 4, 5, 15, 50],
        [4, 5, 8, 16, 'missing']
      ]
    }
  },
  {
    // Golden: large dots only in columns 1 to 5 of rows 0 to 6 whose index is 3 modulo 128
    name: '3-categories',
    props: {
      extensions: [new DataFilterExtension({categorySize: 3})],
      getFilterCategory: d => [d.index % 128, d.column, d.row],
      filterCategories: [[3], [1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 6]]
    }
  },
  {
    // Golden: large dots every 210th point, four of them along the grid
    name: '4-categories',
    props: {
      extensions: [new DataFilterExtension({categorySize: 4})],
      getFilterCategory: ({index}) => [index % 2, index % 3, index % 5, index % 7],
      filterCategories: [[0], [0], [0], [0]]
    }
  },
  {
    // Golden: the `4-categories` dots that also lie in column 2 or later and rows 0 to 15
    name: '4-categories-filter-2d',
    props: {
      extensions: [new DataFilterExtension({categorySize: 4, filterSize: 2})],
      getFilterCategory: ({index}) => [index % 2, index % 3, index % 5, index % 7],
      filterCategories: [[0], [0], [0], [0]],
      getFilterValue: d => [d.column, d.row],
      filterRange: [
        [2, 1000],
        [0, 15]
      ]
    }
  }
].flatMap(({name, presets, props}: {name: string; presets?: ViewPresetName[]; props: any}) =>
  expandViewMatrix(
    {
      name: `data-filter-effect-${name}`,
      // The spec's own view; passed explicitly so the existing map goldens are reused unchanged
      viewState: VIEWSTATE,
      layers: [
        new ScatterplotLayer({
          id: name,
          data: DATA,
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
      // Tight enough that losing a third of the 25 `single-category` dots fails the globe diff
      overrides: {globe: {imageDiffOptions: {threshold: 0.995}}}
    },
    presets ?? ['map']
  )
);

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
