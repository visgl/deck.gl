// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {_count as count, Layer} from '@deck.gl/core';

import type {DefaultProps} from '@deck.gl/core';
import type {LayerTestCase, LayerClass} from './lifecycle-test';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

function defaultAssert(condition: any, comment: string): void {
  if (!condition) {
    throw new Error(comment);
  }
}

// Automatically generate testLayer test cases
export function generateLayerTests<LayerT extends Layer>({
  Layer,
  sampleProps = {},
  assert = defaultAssert,
  onBeforeUpdate = noop,
  onAfterUpdate = noop,
  runDefaultAsserts = true
}: {
  Layer: LayerClass<LayerT>;
  /**
   * Override default props during the test
   */
  sampleProps?: Partial<LayerT['props']>;
  assert?: (condition: any, comment: string) => void;
  onBeforeUpdate?: LayerTestCase<LayerT>['onBeforeUpdate'];
  onAfterUpdate?: LayerTestCase<LayerT>['onAfterUpdate'];

  /**
   * Test some typical assumptions after layer updates
   * For primitive layers, assert that layer has model(s).
   * For composite layers, assert that layer has sublayer(s).
   * @default true
   */
  runDefaultAsserts?: boolean;
}): LayerTestCase<LayerT>[] {
  assert(Layer.layerName, 'Layer should have display name');

  function wrapTestCaseTitle(title: string): string {
    return `${Layer.layerName}#${title}`;
  }

  const testCases: LayerTestCase<LayerT>[] = [
    {
      title: 'Empty props',
      props: {}
    },
    {
      title: 'Null data',
      // @ts-expect-error null may not be an expected data type
      updateProps: {data: null}
    },
    {
      title: 'Sample data',
      updateProps: sampleProps
    }
  ];

  try {
    // Calling constructor for the first time resolves default props
    // eslint-disable-next-line
    new Layer({});
  } catch (error: unknown) {
    assert(false, `Construct ${Layer.layerName} throws: ${(error as Error).message}`);
  }

  //  @ts-expect-error Access hidden properties
  const {_propTypes: propTypes, _mergedDefaultProps: defaultProps} = Layer;

  // Test alternative data formats
  testCases.push(...makeAltDataTestCases<LayerT>(sampleProps, propTypes));

  for (const propName in Layer.defaultProps) {
    if (!(propName in sampleProps)) {
      // Do not override user provided props - they may be layer-specific
      const newTestCase =
        makeAltPropTestCase({propName, propTypes, defaultProps, sampleProps, assert}) || [];
      testCases.push(...newTestCase);
    }
  }

  testCases.forEach(testCase => {
    testCase.title = wrapTestCaseTitle(testCase.title);
    const beforeFunc = testCase.onBeforeUpdate || noop;
    const afterFunc = testCase.onAfterUpdate || noop;
    testCase.onBeforeUpdate = params => {
      // Generated callback
      beforeFunc(params);
      // User callback
      onBeforeUpdate(params);
    };
    testCase.onAfterUpdate = params => {
      // Generated callback
      afterFunc(params);
      // User callback
      onAfterUpdate(params);

      // Default assert
      if (runDefaultAsserts) {
        if (params.layer.isComposite) {
          const {data} = params.layer.props;
          if (data && typeof data === 'object' && count(data)) {
            assert(params.subLayers.length, 'Layer should have sublayers');
          }
        } else {
          assert(params.layer.getModels().length, 'Layer should have models');
        }
      }
    };
  });

  return testCases;
}

function makeAltPropTestCase<LayerT extends Layer>({
  propName,
  propTypes,
  defaultProps,
  sampleProps,
  assert
}: {
  propName: string;
  propTypes: DefaultProps<LayerT['props']>;
  defaultProps: LayerT['props'];
  sampleProps: Partial<LayerT['props']>;
  assert: (condition: any, comment: string) => void;
}): LayerTestCase<LayerT>[] | null {
  const newProps = {...sampleProps};
  const propDef = propTypes[propName];

  if (!propDef) {
    return null;
  }

  switch (propDef.type) {
    case 'boolean':
      newProps[propName] = !defaultProps[propName];
      return [
        {
          title: `${propName}: ${String(newProps[propName])}`,
          props: newProps
        }
      ];

    case 'number':
      if ('max' in propDef) {
        newProps[propName] = propDef.max;
      } else if ('min' in propDef) {
        newProps[propName] = propDef.min;
      } else {
        newProps[propName] = defaultProps[propName] + 1;
      }
      return [
        {
          title: `${propName}: ${String(newProps[propName])}`,
          props: newProps
        }
      ];

    case 'accessor': {
      if (typeof defaultProps[propName] === 'function') {
        return null;
      }
      let callCount = 0;
      newProps[propName] = () => {
        callCount++;
        return defaultProps[propName];
      };
      newProps.updateTriggers = {
        [propName]: 'function'
      };
      const onBeforeUpdate = () => (callCount = 0);
      const onAfterUpdate = () => assert(callCount > 0, 'accessor function is called');

      return [
        {
          title: `${propName}: () => ${defaultProps[propName]}`,
          props: newProps,
          onBeforeUpdate,
          onAfterUpdate
        },
        {
          title: `${propName}: updateTrigger`,
          updateProps: {
            updateTriggers: {
              [propName]: 'function+trigger'
            }
          } as Partial<Layer['props']>,
          onBeforeUpdate,
          onAfterUpdate
        }
      ];
    }

    default:
      return null;
  }
}

function makeAltDataTestCases<LayerT extends Layer>(
  props: Partial<LayerT['props']>,
  propTypes: DefaultProps<LayerT['props']>
): LayerTestCase<LayerT>[] {
  const originalData = props.data;
  if (!Array.isArray(originalData)) {
    return [];
  }
  // partial update
  const partialUpdateProps: Partial<Layer['props']> = {
    data: originalData.slice(),
    _dataDiff: () => [{startRow: 0, endRow: 2}]
  };
  // data should support any iterable
  const genIterableProps: Partial<Layer['props']> = {
    data: new Set(originalData),
    _dataDiff: null
  };
  // data in non-iterable form
  const nonIterableProps: Partial<Layer['props']> = {
    data: {
      length: originalData.length
    }
  };
  for (const propName in props) {
    // @ts-ignore propName cannot be used as index
    if (propTypes[propName].type === 'accessor') {
      // @ts-ignore propName cannot be used as index
      nonIterableProps[propName] = (_, info) => props[propName](originalData[info.index], info);
    }
  }

  return [
    {
      title: 'Partial update',
      updateProps: partialUpdateProps
    },
    {
      title: 'Generic iterable data',
      updateProps: genIterableProps
    },
    {
      title: 'non-iterable data',
      updateProps: nonIterableProps
    }
  ];
}
