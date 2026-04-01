// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

test('render browser provides webgl2', () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');

  expect(gl, 'Expected render browser to provide a WebGL2 context').toBeTruthy();
});
