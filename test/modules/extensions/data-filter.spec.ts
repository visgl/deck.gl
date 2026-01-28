// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {DataFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('DataFilterExtension#constructor', () => {
  let extension = new DataFilterExtension();
  expect(extension.opts.filterSize, 'Extension has filterSize').toBe(1);

  extension = new DataFilterExtension({filterSize: 3, fp64: true});
  expect(extension.opts.filterSize, 'Extension has filterSize').toBe(3);
  expect(extension.opts.fp64, 'fp64 is enabled').toBeTruthy();
});

test('DataFilterExtension', () => {
  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120, entry: 13567, exit: 4802},
          {position: [-122.454, 37.781], timestamp: 140, entry: 14475, exit: 5493}
        ],
        getPosition: d => d.position,
        getFilterValue: d => d.timestamp,
        filterRange: [80, 160],
        extensions: [new DataFilterExtension()]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.min, 'has correct uniforms').toBe(80);
        expect(uniforms.softMax, 'has correct uniforms').toBe(160);
        expect(uniforms.useSoftMargin, 'has correct uniforms').toBe(false);
        expect(uniforms.enabled, 'has correct uniforms').toBe(true);

        const attributes = layer.getAttributeManager().getAttributes();
        expect(attributes.filterValues.value, 'filterValues attribute is populated').toEqual([
          120, 140, 0, 0, 0, 0
        ]);
        expect(
          attributes.filterCategoryValues,
          'filterCategoryValues attribute is not populated'
        ).toBeFalsy();
      }
    },
    {
      updateProps: {
        getFilterValue: d => [d.entry, d.exit],
        filterRange: [
          [10000, 20000],
          [0, 100000]
        ],
        filterSoftRange: [
          [12000, 18000],
          [2000, 8000]
        ],
        filterEnabled: false,
        filterTransformSize: true,
        extensions: [new DataFilterExtension({filterSize: 2})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.min, 'has correct uniforms').toEqual([10000, 0]);
        expect(uniforms.softMax, 'has correct uniforms').toEqual([18000, 8000]);
        expect(uniforms.useSoftMargin, 'has correct uniforms').toBe(true);
        expect(uniforms.transformSize, 'has correct uniforms').toBe(false);
      }
    },
    {
      updateProps: {
        extensions: [new DataFilterExtension({filterSize: 2, fp64: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.min64High, 'has double uniforms').toEqual([10000, 0]);
        expect(uniforms.max64High, 'has double uniforms').toEqual([20000, 100000]);
        expect(uniforms.min, 'has correct uniforms').toEqual([0, 0]);
        expect(uniforms.softMax, 'has correct uniforms').toEqual([-2000, -92000]);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('DataFilterExtension#categories', () => {
  const data = [
    {position: [-122.453, 37.782], field1: 'a', field2: 7},
    {position: [-122.454, 37.781], field1: 'b', field2: 8}
  ];
  const testCases = [
    {
      props: {
        data,
        extensions: [new DataFilterExtension({categorySize: 2, filterSize: 0})],
        getPosition: d => d.position,
        getFilterCategory: d => [d.field1, d.field2],
        filterCategories: [['a'], [8]]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.categoryBitMask, 'has correct uniforms').toEqual([2 ** 0, 0, 2 ** 1, 0]);

        const attributes = layer.getAttributeManager().getAttributes();
        expect(
          attributes.filterCategoryValues.value.slice(0, 4),
          'filterCategoryValues attribute is populated'
        ).toEqual([0, 0, 1, 1]);
        expect(attributes.filterValues, 'filterValues attribute is not populated').toBeFalsy();
      }
    },
    {
      updateProps: {
        filterCategories: [['b', 'c'], []]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.categoryBitMask, 'has correct uniforms').toEqual([
          2 ** 1 + 2 ** 2,
          0,
          0,
          0
        ]);
      }
    },
    {
      updateProps: {
        data: [...data],
        filterCategories: [['d'], [5]]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.categoryBitMask, 'has correct uniforms').toEqual([2 ** 2, 0, 2 ** 2, 0]);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('DataFilterExtension#countItems', () => {
  let cbCalled = 0;
  let cbCount = -1;

  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120},
          {position: [-122.454, 37.781], timestamp: 140}
        ],
        getPosition: d => d.position,
        getFilterValue: d => d.timestamp,
        onFilteredItemsChange: event => {
          cbCalled++;
          cbCount = event.count;
        },
        filterRange: [80, 160],
        extensions: [new DataFilterExtension({filterSize: 1, countItems: true})]
      },
      onAfterUpdate: () => {
        expect(cbCalled, 'onFilteredItemsChange is called').toBe(1);
        expect(cbCount, 'count is correct').toBe(2);
      }
    },
    {
      updateProps: {
        radiusMinPixels: 10
      },
      onAfterUpdate: () => {
        expect(cbCalled, 'onFilteredItemsChange should not be called without filter change').toBe(
          1
        );
      }
    },
    {
      updateProps: {
        filterRange: [80, 100]
      },
      onAfterUpdate: () => {
        expect(cbCalled, 'onFilteredItemsChange is called').toBe(2);
        expect(cbCount, 'count is correct').toBe(0);
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
