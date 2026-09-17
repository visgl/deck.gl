// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
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

test('mergeShaders - module exclusions', () => {
  // Import the actual modules for realistic testing
  const project32Module = {name: 'project32', excludes: ['project64']};
  const project64Module = {name: 'project64', excludes: ['project32']};

  // Test 1: Original behavior - project64 in source excludes project32 from target
  const result1 = mergeShaders(
    {modules: [project32Module]},
    {modules: [project64Module]}
  );
  expect(result1.modules.map(m => m.name)).toEqual(['project64']);

  // Test 2: Reverse case - project32 in source excludes project64 from target
  const result2 = mergeShaders(
    {modules: [project64Module]},
    {modules: [project32Module]}
  );
  expect(result2.modules.map(m => m.name)).toEqual(['project32']);

  // Test 3: Generic mechanism - synthetic modules to prove it's not hardcoded
  const moduleA = {name: 'moduleA', excludes: ['moduleB']};
  const moduleB = {name: 'moduleB', excludes: ['moduleA']};
  const moduleC = {name: 'moduleC'};

  const result3 = mergeShaders(
    {modules: [moduleA, moduleC]},
    {modules: [moduleB]}
  );
  expect(result3.modules.map(m => m.name)).toEqual(['moduleC', 'moduleB']);

  // Test 4: Non-mutual exclusion (only one module excludes the other)
  const moduleD = {name: 'moduleD', excludes: ['moduleE']};
  const moduleE = {name: 'moduleE'};

  const result4 = mergeShaders(
    {modules: [moduleE]},
    {modules: [moduleD]}
  );
  expect(result4.modules.map(m => m.name)).toEqual(['moduleD']);

  // Test 5: Excluded module not present - should be no-op
  const result5 = mergeShaders(
    {modules: [moduleC]},
    {modules: [moduleA]}
  );
  expect(result5.modules.map(m => m.name)).toEqual(['moduleC', 'moduleA']);

  // Test 6: No exclusions - backward compatibility
  const result6 = mergeShaders(
    {modules: [project]},
    {modules: [phongMaterial]}
  );
  expect(result6.modules.length).toBe(2);
});
