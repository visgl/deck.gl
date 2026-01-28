/* global document */
import {test, expect, describe} from 'vitest';
import {applyStyles, removeStyles} from '@deck.gl/core/utils/apply-styles';

const APPLY_TEST_CASES = [
  {
    title: 'CSS variable',
    argument: {property: '--my-var', value: 'red'},
    result: {property: '--my-var', value: 'red'}
  },
  {
    title: 'camelCase property',
    argument: {property: 'backgroundColor', value: 'red'},
    result: {property: 'background-color', value: 'red'}
  }
];

test('applyStyles', () => {
  const container = document.body.appendChild(document.createElement('div'));
  for (const tc of APPLY_TEST_CASES) {
    const {argument, result} = tc;
    applyStyles(container, {[argument.property]: argument.value});
    expect(
      container.style.getPropertyValue(result.property),
      `applyStyles ${tc.title} returned expected result`
    ).toEqual(result.value);
  }
});

const REMOVE_TEST_CASES = [
  {
    title: 'CSS variable',
    argument: {property: '--my-var', value: 'red'},
    result: {property: '--my-var', value: ''}
  },
  {
    title: 'camelCase property',
    argument: {property: 'backgroundColor', value: 'red'},
    result: {property: 'background-color', value: ''}
  }
];

test('removeStyles', () => {
  const container = document.body.appendChild(document.createElement('div'));
  for (const tc of REMOVE_TEST_CASES) {
    const {argument, result} = tc;
    // setProperty expects kabab-case
    container.style.setProperty(result.property, argument.value);
    removeStyles(container, {[argument.property]: argument.value});
    expect(
      container.style.getPropertyValue(result.property),
      `removeStyles ${tc.title} returned expected result`
    ).toEqual(result.value);
  }
});
