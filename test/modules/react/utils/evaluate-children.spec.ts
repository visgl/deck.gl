// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import evaluateChildren from '@deck.gl/react/utils/evaluate-children';
import React, {createElement} from 'react';

const TEST_CHILD_PROPS = {zIndex: 1};

const TEST_CASES = [
  {
    title: 'empty child',
    input: null,
    count: 0
  },
  {
    title: 'function child',
    // eslint-disable-next-line react/display-name
    input: props => createElement('div', Object.assign({id: 'test-func'}, props)),
    count: 1,
    expected: {
      id: 'test-func',
      zIndex: 1
    }
  },
  {
    title: 'React elements',
    input: [
      createElement('div', {id: 'test-el-1', className: 'test'}),
      createElement('div', {id: 'test-el-2', className: 'test'})
    ],
    count: 2,
    expected: {
      className: 'test',
      zIndex: undefined
    }
  },
  {
    title: 'mock react-map-gl Map',
    input: createElement('div', {mapStyle: 'https://map/style.json'}),
    count: 1,
    expected: {
      zIndex: 1
    }
  }
];

test('evaluateChildren', () => {
  for (const testCase of TEST_CASES) {
    const result = evaluateChildren(testCase.input, TEST_CHILD_PROPS);

    expect(
      React.Children.count(result),
      `${testCase.title} returns ${testCase.count} child(ren)`
    ).toBe(testCase.count);

    React.Children.forEach(result, child => {
      for (const propName in testCase.expected) {
        expect(child.props[propName], `${testCase.title}: ${propName}`).toBe(
          testCase.expected[propName]
        );
      }
    });
  }
});

test('evaluateChildren keeps map controls above Deck and forwards onLoad', () => {
  const onLoad = vi.fn();
  const canvasContainer = document.createElement('div');
  const event = {target: {getCanvasContainer: () => canvasContainer}};
  const childProps = {width: 400};
  const child = createElement('div', {mapStyle: 'https://map/style.json', onLoad});
  const result = evaluateChildren(child, childProps) as React.ReactElement<any>;

  expect(result.props.style.zIndex).toBeUndefined();
  result.props.onLoad(event);
  expect(canvasContainer.style.zIndex).toBe('-1');
  expect(canvasContainer.style.inset).toBe('0px');
  expect(onLoad).toHaveBeenCalledWith(event);
  expect(childProps).toEqual({width: 400});
});
