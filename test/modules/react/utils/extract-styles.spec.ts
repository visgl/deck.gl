// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import extractStyles from '@deck.gl/react/utils/extract-styles';

test('extractStyles', () => {
  let result = extractStyles({width: '100%', height: '100%'});
  expect(result.containerStyle.width, 'containerStyle has width').toBe('100%');
  expect(result.containerStyle.height, 'containerStyle has height').toBe('100%');
  expect(result.canvasStyle, 'returns canvasStyle').toBeTruthy();

  result = extractStyles({
    width: 600,
    height: 400,
    style: {float: 'left', mixBlendMode: 'color-burn'}
  });
  expect(result.containerStyle.width, 'containerStyle has width').toBe(600);
  expect(result.containerStyle.height, 'containerStyle has height').toBe(400);
  expect(result.containerStyle.float, 'containerStyle contains custom style').toBe('left');
  expect(
    result.containerStyle.mixBlendMode,
    'containerStyle does not contain canvas only style'
  ).toBeFalsy();
  expect(result.canvasStyle.mixBlendMode, 'canvasStyle contains custom style').toBe('color-burn');
  expect(result.canvasStyle.float, 'canvasStyle does not contain positioning style').toBeFalsy();
});
