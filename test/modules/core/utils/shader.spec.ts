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

test('mergeShaders converts the inject field of each descriptor before the merge', () => {
  const layerShaders = {vs: 'vs', inject: {'fs:DECKGL_FILTER_COLOR': 'color.a *= 0.5;'}};
  const extensionShaders = {
    inject: {
      'fs:DECKGL_FILTER_COLOR': {injection: 'color.rgb = vec3(1.0, 0.0, 0.0);', order: -1},
      'vs:#main-end': {injection: 'gl_Position.z = 0.0;', order: 2}
    }
  };
  const merged = mergeShaders(
    mergeShaders({plugins: [discardPlugin]}, layerShaders),
    extensionShaders
  );
  expect(merged.inject, 'inject is removed').toBeUndefined();
  expect('inject' in merged, 'inject key is removed').toBe(false);
  expect(merged.plugins).toEqual([
    discardPlugin,
    {
      name: 'layer-inject',
      injections: [
        {stage: 'fragment', target: 'DECKGL_FILTER_COLOR', glsl: 'color.a *= 0.5;', order: 0}
      ]
    },
    {
      name: 'layer-inject',
      injections: [
        {
          stage: 'fragment',
          target: 'DECKGL_FILTER_COLOR',
          glsl: 'color.rgb = vec3(1.0, 0.0, 0.0);',
          order: -1
        },
        {stage: 'vertex', target: '#main-end', glsl: 'gl_Position.z = 0.0;', order: 2}
      ]
    }
  ]);
  expect(layerShaders.inject, 'input is not mutated').toBeDefined();
});

test('mergeShaders keeps inject keys that are not named targets', () => {
  // luma.gl assembles a regular expression key from the `inject` option
  const merged = mergeShaders(
    mergeShaders({}, {inject: {'fragColor = (.*);': 'a', 'fs:#main-end': 'b'}}),
    {inject: {'fragColor = (.*);': 'c', 'gl_Position = (.*);': {injection: 'd', order: 1}}}
  );
  expect(merged.inject).toEqual({
    'fragColor = (.*);': 'ac',
    'gl_Position = (.*);': {injection: 'd', order: 1}
  });
  expect(merged.plugins).toEqual([
    {
      name: 'layer-inject',
      injections: [{stage: 'fragment', target: '#main-end', glsl: 'b', order: 0}]
    }
  ]);
});

test('mergeShaders keeps the target injections before the source injections', () => {
  // The two descriptors still have an `inject` map, as in a direct call of the merge
  const merged = mergeShaders(
    {inject: {'fs:#main-end': 'fragColor.r = 1.0;'}},
    {inject: {'fs:#main-end': 'fragColor.r *= 0.5;'}}
  );
  expect('inject' in merged, 'inject key is removed').toBe(false);
  expect(merged.plugins.map(plugin => plugin.injections[0].glsl)).toEqual([
    'fragColor.r = 1.0;',
    'fragColor.r *= 0.5;'
  ]);
  expect(convertLegacyInjections(merged), 'no later conversion').toBe(merged);
});

test('mergeShaders moves an array of shader injections to a plugin', () => {
  const fade = {stage: 'fragment', target: '#main-end', glsl: 'fragColor.a *= 0.5;'};
  const tint = {stage: 'fragment', target: '#main-end', wgsl: 'color.r = 1.0;', order: -1};
  const warn = vi.spyOn(log, 'warn');
  const merged = mergeShaders(mergeShaders({}, {inject: [fade]}), {inject: [tint]});
  const warnings = warn.mock.calls.length;
  warn.mockRestore();
  expect('inject' in merged, 'inject key is removed').toBe(false);
  expect(merged.plugins).toEqual([
    {name: 'layer-inject', injections: [fade]},
    {name: 'layer-inject', injections: [tint]}
  ]);
  expect(merged.plugins[0].injections[0], 'entries are not copied').toBe(fade);
  expect(warnings, 'the array form is not deprecated').toBe(0);

  // An array that is already on the target stays in effect
  const fromTarget = mergeShaders({inject: [fade]}, {inject: {'gl_Position = (.*);': 'a'}});
  expect(fromTarget.plugins).toEqual([{name: 'layer-inject', injections: [fade]}]);
  expect(fromTarget.inject).toEqual({'gl_Position = (.*);': 'a'});
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
  expect(again.plugins, 'repeated conversion gives equal plugins').toEqual(converted.plugins);
});

test('convertLegacyInjections reads the current contents of a reused inject object', () => {
  const inject: Record<string, string> = {};
  const module = {name: 'reused', inject};
  const shaders = {modules: [module]};

  expect(convertLegacyInjections(shaders).plugins, 'empty inject gives no plugin').toBeUndefined();

  inject['fs:#main-start'] = 'float first;';
  expect(convertLegacyInjections(shaders).plugins, 'added entry is converted').toEqual([
    {
      name: 'reused-inject',
      injections: [{stage: 'fragment', target: '#main-start', glsl: 'float first;', order: 0}]
    }
  ]);

  inject['fs:#main-start'] = 'float second;';
  expect(convertLegacyInjections(shaders).plugins, 'changed entry is converted').toEqual([
    {
      name: 'reused-inject',
      injections: [{stage: 'fragment', target: '#main-start', glsl: 'float second;', order: 0}]
    }
  ]);
});

test('convertLegacyInjections warns once for inject fields that are merged on each call', () => {
  const warn = vi.spyOn(log, 'warn');
  // mergeShaders makes a new `inject` object each time two descriptors have the field.
  const getShaders = () =>
    mergeShaders({vs: 'vs', inject: {'vs:#decl': 'float a;'}}, {inject: {'fs:#decl': 'float b;'}});
  convertLegacyInjections(getShaders());
  convertLegacyInjections(getShaders());
  const messages = warn.mock.calls.map(args => args[0]).filter(m => m.startsWith('getShaders()'));
  warn.mockRestore();
  expect(messages.length, 'at most one warning').toBeLessThanOrEqual(1);
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
