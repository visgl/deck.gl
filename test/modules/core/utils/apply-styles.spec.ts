/* global document */
import test from 'tape-promise/tape';
import {applyStyles} from '@deck.gl/core/utils/apply-styles';

const TEST_CASES = [
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

test('applyStyles', t => {
  const container = document.body.appendChild(document.createElement('div'));
  for (const tc of TEST_CASES) {
    const {argument, result} = tc;
    applyStyles(container, {[argument.property]: argument.value});
    t.deepEqual(
      container.style.getPropertyValue(result.property),
      result.value,
      `applyStyles ${tc.title} returned expected result`
    );
  }
  t.end();
});
