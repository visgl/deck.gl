// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {project, phongMaterial} from '@deck.gl/core';
import {mergeShaders} from '@deck.gl/core/utils/shader';

const TEST_SHADERS = {vs: 'vs', fs: 'fs'};
const discardPlugin = {name: 'discard', injections: {'glsl:fs:#main-start': 'discard;'}};
const colorPlugin = {
  name: 'color',
  injections: {'glsl:fs:#main-end': 'filter_pickingColor(gl_FragColor);'}
};

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
      plugins: [discardPlugin]
    },
    output: {
      vs: 'vs',
      fs: 'fs',
      defines: {DRAW: 1},
      modules: [project],
      plugins: [discardPlugin]
    }
  },
  {
    title: 'deep merge source and target fields',
    input: {
      vs: 'vs-v2',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [phongMaterial],
      plugins: [colorPlugin]
    },
    output: {
      vs: 'vs-v2',
      fs: 'fs',
      defines: {DRAW: 0, EXTRUDE: 1},
      modules: [project, phongMaterial],
      plugins: [discardPlugin, colorPlugin]
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

test('mergeShaders preserves layer and extension plugins in order', () => {
  const basePlugin = {name: 'base'};
  const firstPlugin = {name: 'first'};
  const secondPlugin = {name: 'second'};
  const shaders = {plugins: [basePlugin]};
  const merged = mergeShaders(mergeShaders(shaders, {plugins: [firstPlugin]}), {
    plugins: [secondPlugin]
  });
  expect(merged.plugins).toEqual([basePlugin, firstPlugin, secondPlugin]);
  expect(shaders.plugins).toEqual([basePlugin]);
});
