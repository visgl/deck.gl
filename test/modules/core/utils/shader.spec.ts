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
  expect(result1.modules.map(module => module.name)).toEqual(['project64']);

  // Test 2: Reverse case - project32 in source excludes project64 from target
  const result2 = mergeShaders(
    {modules: [project64Module]},
    {modules: [project32Module]}
  );
  expect(result2.modules.map(module => module.name)).toEqual(['project32']);

  // Test 3: Generic mechanism - synthetic modules to prove it's not hardcoded
  const moduleA = {name: 'moduleA', excludes: ['moduleB']};
  const moduleB = {name: 'moduleB', excludes: ['moduleA']};
  const moduleC = {name: 'moduleC'};

  const result3 = mergeShaders(
    {modules: [moduleA, moduleC]},
    {modules: [moduleB]}
  );
  expect(result3.modules.map(module => module.name)).toEqual(['moduleC', 'moduleB']);

  // Test 4: Non-mutual exclusion - later declaring module wins
  const moduleD = {name: 'moduleD', excludes: ['moduleE']};
  const moduleE = {name: 'moduleE'};

  const result4 = mergeShaders(
    {modules: [moduleE]},
    {modules: [moduleD]}
  );
  expect(result4.modules.map(module => module.name)).toEqual(['moduleD']);

  // Test 4b: Non-mutual exclusion reversed - later non-declaring module wins
  const result4b = mergeShaders(
    {modules: [moduleD]},
    {modules: [moduleE]}
  );
  expect(result4b.modules.map(module => module.name)).toEqual(['moduleE']);

  // Test 5: Excluded module not present - should be no-op
  const result5 = mergeShaders(
    {modules: [moduleC]},
    {modules: [moduleA]}
  );
  expect(result5.modules.map(module => module.name)).toEqual(['moduleC', 'moduleA']);

  // Test 6: No exclusions - backward compatibility
  const result6 = mergeShaders(
    {modules: [project]},
    {modules: [phongMaterial]}
  );
  expect(result6.modules.length).toBe(2);

  // Test 7: Transitive exclusion - only surviving modules' exclusions are honored
  const moduleC2 = {name: 'moduleC2'};
  const moduleA2 = {name: 'moduleA2', excludes: ['moduleC2']};
  const moduleB2 = {name: 'moduleB2', excludes: ['moduleA2']};

  const result7 = mergeShaders(
    {modules: [moduleC2, moduleA2, moduleB2]},
    {modules: []}
  );
  // B2 (later) excludes A2, so A2 is removed.
  // A2 declared exclusion of C2, but since A2 was removed, C2 survives.
  expect(result7.modules.map(module => module.name)).toEqual(['moduleC2', 'moduleB2']);

  // Test 8: Multiple exclusions - removed module stops processing remaining exclusions
  const moduleX = {name: 'moduleX'};
  const moduleY = {name: 'moduleY', excludes: ['moduleX', 'moduleZ']};
  const moduleZ = {name: 'moduleZ', excludes: ['moduleY']};

  const result8 = mergeShaders(
    {modules: [moduleX, moduleY, moduleZ]},
    {modules: []}
  );
  // Z (later) excludes Y, so Y is removed.
  // Y declared exclusions of both X and Z, but since Y was removed on its first
  // exclusion (Z), it should not continue to process its second exclusion (X).
  // Result: X and Z survive.
  expect(result8.modules.map(module => module.name)).toEqual(['moduleX', 'moduleZ']);
});
