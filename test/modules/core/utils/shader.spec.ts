// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {project, phongMaterial, log} from '@deck.gl/core';
import {mergeShaders, convertLegacyInjections} from '@deck.gl/core/utils/shader';

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

test('convertLegacyInjections converts inject fields to GLSL plugins', () => {
  const dependency = {name: 'dependency', inject: {'vs:#decl': 'float dependency;'}};
  const module = {
    name: 'tint',
    dependencies: [dependency],
    inject: {
      'fs:DECKGL_FILTER_COLOR': 'color.rgb = vec3(1.0, 0.0, 0.0);',
      'vs:#main-end': {injection: 'gl_Position.z = 0.0;', order: 2},
      'gl_FragColor = (.*);': 'unsupported'
    }
  };
  const shaders = {
    vs: 'vs',
    modules: [module],
    plugins: [discardPlugin],
    inject: {'fs:#main-start': 'float layer;'}
  };

  const converted = convertLegacyInjections(shaders);
  expect(converted.inject, 'inject is removed').toBeUndefined();
  expect(converted.modules, 'modules are kept').toEqual([module]);
  expect(converted.plugins).toEqual([
    discardPlugin,
    {
      name: 'dependency-inject',
      injections: [{stage: 'vertex', target: '#decl', glsl: 'float dependency;', order: 0}]
    },
    {
      name: 'tint-inject',
      injections: [
        {
          stage: 'fragment',
          target: 'DECKGL_FILTER_COLOR',
          glsl: 'color.rgb = vec3(1.0, 0.0, 0.0);',
          order: 0
        },
        {stage: 'vertex', target: '#main-end', glsl: 'gl_Position.z = 0.0;', order: 2}
      ]
    },
    {
      name: 'layer-inject',
      injections: [{stage: 'fragment', target: '#main-start', glsl: 'float layer;', order: 0}]
    }
  ]);
  expect(shaders.plugins, 'input is not mutated').toEqual([discardPlugin]);

  const again = convertLegacyInjections(shaders);
  expect(again.plugins[2], 'module plugin is stable').toBe(converted.plugins[2]);
});

test('convertLegacyInjections warns once for each inject field', () => {
  const warn = vi.spyOn(log, 'warn');
  const shaders = {modules: [{name: 'warn-once', inject: {'fs:DECKGL_FILTER_COLOR': ''}}]};
  convertLegacyInjections(shaders);
  convertLegacyInjections(shaders);
  const messages = warn.mock.calls.map(args => args[0]);
  warn.mockRestore();
  expect(messages).toHaveLength(1);
  expect(messages[0]).toContain('shader module "warn-once"');
  expect(messages[0]).toContain('"inject" is deprecated');
  expect(messages[0]).toContain('"plugins"');
});

test('convertLegacyInjections returns plugin-only shaders unchanged', () => {
  const shaders = {modules: [project], plugins: [discardPlugin]};
  expect(convertLegacyInjections(shaders)).toBe(shaders);
});
