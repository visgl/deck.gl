import test from 'tape-promise/tape';
import {DataFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('DataFilterExtension#constructor', t => {
  let extension = new DataFilterExtension();
  t.is(extension.opts.filterSize, 1, 'Extension has filterSize');

  extension = new DataFilterExtension({filterSize: 3, fp64: true});
  t.is(extension.opts.filterSize, 3, 'Extension has filterSize');
  t.ok(extension.opts.fp64, 'fp64 is enabled');

  t.end();
});

test('DataFilterExtension', t => {
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
        t.is(uniforms.min, 80, 'has correct uniforms');
        t.is(uniforms.softMax, 160, 'has correct uniforms');
        t.is(uniforms.useSoftMargin, false, 'has correct uniforms');
        t.is(uniforms.enabled, true, 'has correct uniforms');

        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.filterValues.value,
          [120, 140, 0, 0, 0, 0],
          'filterValues attribute is populated'
        );
        t.notOk(attributes.filterCategoryValues, 'filterCategoryValues attribute is not populated');
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
        t.deepEqual(uniforms.min, [10000, 0], 'has correct uniforms');
        t.deepEqual(uniforms.softMax, [18000, 8000], 'has correct uniforms');
        t.is(uniforms.useSoftMargin, true, 'has correct uniforms');
        t.is(uniforms.transformSize, false, 'has correct uniforms');
      }
    },
    {
      updateProps: {
        extensions: [new DataFilterExtension({filterSize: 2, fp64: true})]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.deepEqual(uniforms.min64High, [10000, 0], 'has double uniforms');
        t.deepEqual(uniforms.max64High, [20000, 100000], 'has double uniforms');
        t.deepEqual(uniforms.min, [0, 0], 'has correct uniforms');
        t.deepEqual(uniforms.softMax, [-2000, -92000], 'has correct uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('DataFilterExtension#categories', t => {
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
        t.deepEqual(uniforms.categoryBitMask, [2 ** 0, 0, 2 ** 1, 0], 'has correct uniforms');

        const attributes = layer.getAttributeManager().getAttributes();
        t.deepEqual(
          attributes.filterCategoryValues.value,
          [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
          'filterCategoryValues attribute is populated'
        );
        t.notOk(attributes.filterValues, 'filterValues attribute is not populated');
      }
    },
    {
      updateProps: {
        filterCategories: [['b', 'c'], []]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.deepEqual(uniforms.categoryBitMask, [2 ** 1 + 2 ** 2, 0, 0, 0], 'has correct uniforms');
      }
    },
    {
      updateProps: {
        data: [...data],
        filterCategories: [['d'], [5]]
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.deepEqual(uniforms.categoryBitMask, [2 ** 2, 0, 2 ** 2, 0], 'has correct uniforms');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});

test('DataFilterExtension#countItems', t => {
  let cbCalled = 0;

  const testCases = [
    {
      props: {
        data: [
          {position: [-122.453, 37.782], timestamp: 120},
          {position: [-122.454, 37.781], timestamp: 140}
        ],
        getPosition: d => d.position,
        getFilterValue: d => d.timestamp,
        onFilteredItemsChange: () => cbCalled++,
        filterRange: [80, 160],
        extensions: [new DataFilterExtension({filterSize: 1, countItems: true})]
      },
      onAfterUpdate: () => {
        t.is(cbCalled, 1, 'onFilteredItemsChange is called');
      }
    },
    {
      updateProps: {
        radiusMinPixels: 10
      },
      onAfterUpdate: () => {
        t.is(cbCalled, 1, 'onFilteredItemsChange should not be called without filter change');
      }
    },
    {
      updateProps: {
        filterRange: [80, 100]
      },
      onAfterUpdate: () => {
        t.is(cbCalled, 2, 'onFilteredItemsChange is called');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
