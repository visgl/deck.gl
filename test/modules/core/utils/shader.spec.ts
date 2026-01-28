// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {project, phongMaterial} from '@deck.gl/core';
import {mergeShaders} from '@deck.gl/core/utils/shader';

const TEST_SHADERS = {vs: 'vs', fs: 'fs'};

const TEST_CASES = [
  {
    title: 'empty',
    input: null,
    output: {vs: 'vs', fs: 'fs'}
  },
  {
    title: 'missing target fields',
    input: {
      defines: {DRAW: 1},
      modules: [project],
      inject: {'fs#main-start': 'discard;'}
    },
    output: {
      vs: 'vs',
      fs: 'fs',
      defines: {DRAW: 1},
      modules: [project],
      inject: {'fs#main-start': 'discard;'}
    }
  },
  {
    title: 'deep merge source and target fields',
    input: {
      vs: 'vs-v2',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [phongMaterial],
      inject: {'fs#main-end': 'filter_pickingColor(gl_FragColor);'}
    },
    output: {
      vs: 'vs-v2',
      fs: 'fs',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [project, phongMaterial],
      inject: {'fs#main-start': 'discard;', 'fs#main-end': 'filter_pickingColor(gl_FragColor);'}
    }
  }
];

test('mergeShaders', () => {
  let shaders = TEST_SHADERS;

  for (const testCase of TEST_CASES) {
    shaders = mergeShaders(shaders, testCase.input);
    expect(shaders, `${testCase.title} returned correct result`).toEqual(testCase.output);
  }
});
