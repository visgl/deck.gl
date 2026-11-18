// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {expect, test} from 'vitest';

const require = createRequire(import.meta.url);
const REACT_SRC = resolve(import.meta.dirname, '../../../modules/react/src');

/** Bundles a source entry the way ocular's `build-cjs` bundles a `require` entry. */
async function bundleCJS(entry: string): Promise<string> {
  const result = await build({
    entryPoints: [resolve(REACT_SRC, entry)],
    bundle: true,
    format: 'cjs',
    target: 'node16',
    packages: 'external',
    tsconfigRaw: {compilerOptions: {paths: {}, jsx: 'react'}},
    write: false,
    logLevel: 'silent'
  });
  return result.outputFiles[0].text;
}

/** Any export of a stubbed deck.gl module is a class, so top-level `extends` and calls work. */
const deckStub = new Proxy({}, {get: (_, key) => (key === '__esModule' ? false : class {})});

/** Evaluates a CommonJS bundle with real React, stubbed deck.gl, and the given modules. */
function evaluateCJS(code: string, modules: Record<string, unknown>): Record<string, unknown> {
  const module = {exports: {} as Record<string, unknown>};
  const requireModule = (id: string) => {
    if (id in modules) return modules[id];
    if (id.startsWith('@deck.gl/') || id === 'mjolnir.js') return deckStub;
    return require(id);
  };
  new Function('module', 'exports', 'require', code)(module, module.exports, requireModule);
  return module.exports;
}

test('CommonJS root loads the /legacy bundle instead of inlining a copy', async () => {
  const rootCode = await bundleCJS('index.ts');
  const legacyCode = await bundleCJS('legacy/index.ts');

  // The root bundle has no implementation of its own, so it creates no second React context.
  expect(rootCode).toContain('require("@deck.gl/react/legacy")');
  expect(rootCode).not.toContain('createContext');
  expect(legacyCode).toContain('createContext');

  const legacy = evaluateCJS(legacyCode, {});
  const root = evaluateCJS(rootCode, {'@deck.gl/react/legacy': legacy});

  expect(Object.keys(root).sort()).toEqual(Object.keys(legacy).sort());
  expect(root.DeckGL, 'DeckGL').toBe(legacy.DeckGL);
  expect(root.useWidget, 'useWidget').toBe(legacy.useWidget);
  expect(root.default, 'default export').toBe(legacy.default);
});
