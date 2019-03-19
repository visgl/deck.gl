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
import {experimental} from '@deck.gl/core';
const {count} = experimental;

function defaultAssert(condition, comment) {
  if (!condition) {
    throw new Error(comment);
  }
}

// Automatically generate testLayer test cases
export function generateLayerTests({
  Layer,
  sampleProps = {},
  assert = defaultAssert,
  onBeforeUpdate,
  onAfterUpdate = () => {}
}) {
  assert(Layer.layerName, 'Layer should have display name');

  function wrapTestCaseTitle(title) {
    return `${Layer.layerName}#${title}`;
  }

  const testCases = [
    {
      title: 'Empty props',
      props: {}
    },
    {
      title: 'Null data',
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
  } catch (error) {
    assert(false, `Construct ${Layer.layerName} throws: ${error.message}`);
  }

  const {_propTypes: propTypes, _mergedDefaultProps: defaultProps} = Layer;

  // Test alternative data formats
  for (const {title, props} of makeAltDataTestCases(sampleProps, propTypes)) {
    testCases.push({
      title,
      updateProps: props
    });
  }

  for (const propName in Layer.defaultProps) {
    if (!(propName in sampleProps)) {
      // Do not override user provided props - they may be layer-specific
      const newTestCase = makeAltPropTestCase(propName, propTypes, defaultProps);
      if (newTestCase) {
        testCases.push({
          title: newTestCase.title,
          updateProps: newTestCase.props
        });
      }
    }
  }

  const _onAfterUpdate = params => {
    // User callback
    onAfterUpdate(params);
    // Default assert
    if (params.layer.isComposite) {
      if (count(params.layer.props.data)) {
        assert(params.subLayers.length, 'Layer should have sublayers');
      }
    } else {
      assert(params.layer.getModels().length, 'Layer should have models');
    }
  };

  testCases.forEach(testCase => {
    testCase.title = wrapTestCaseTitle(testCase.title);
    testCase.onBeforeUpdate = onBeforeUpdate;
    testCase.onAfterUpdate = _onAfterUpdate;
  });

  return testCases;
}

function makeAltPropTestCase(propName, propTypes, defaultProps) {
  const newProps = {};
  const propDef = propTypes[propName];
  let title;

  if (!propDef) {
    return null;
  }

  switch (propDef.type) {
    case 'boolean':
      newProps[propName] = !defaultProps[propName];
      title = String(newProps[propName]);
      break;

    case 'number':
      if ('max' in propDef) {
        newProps[propName] = propDef.max;
      } else if ('min' in propDef) {
        newProps[propName] = propDef.min;
      } else {
        newProps[propName] = defaultProps[propName] + 1;
      }
      title = String(newProps[propName]);
      break;

    case 'accessor':
      if (typeof defaultProps[propName] === 'function') {
        return null;
      }
      newProps[propName] = () => defaultProps[propName];
      newProps.updateTriggers = {
        [propName]: propName
      };
      title = `() => ${defaultProps[propName]}`;
      break;

    default:
      return null;
  }
  return {title: `${propName}: ${title}`, props: newProps};
}

function makeAltDataTestCases(props, propTypes) {
  const originalData = props.data;
  if (!Array.isArray(originalData)) {
    return [];
  }
  // data should support any iterable
  const genIterableProps = {
    data: new Set(originalData)
  };
  // data in non-iterable form
  const nonIterableProps = {
    data: {
      length: originalData.length
    }
  };
  for (const propName in props) {
    if (propTypes[propName].type === 'accessor') {
      nonIterableProps[propName] = (_, {index}) => props[propName](originalData[index]);
    }
  }

  return [
    {
      title: 'Generic iterable data',
      props: genIterableProps
    },
    {
      title: 'non-iterable data',
      props: nonIterableProps
    }
  ];
}
