// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {build} from 'esbuild';
import {expect, test} from 'vitest';
import {getCJSBuildOptions, getCJSEntries} from '../../../modules/react/build-cjs.mjs';

/** Loads real modules, such as React, for the evaluated bundles. */
const require = createRequire(import.meta.url);
/** Directory of `@deck.gl/react`. */
const PACKAGE_ROOT = resolve(import.meta.dirname, '../../../modules/react');

/** A CommonJS entry: the file to bundle and the bundle it publishes. */
type Entry = {input: string; output: string};

/** The package's CommonJS entries, bundled from source instead of `dist`. */
function getSourceEntries(): Entry[] {
  return getCJSEntries((importFile: string) => {
    const base = importFile.replace(`${PACKAGE_ROOT}/dist/`, `${PACKAGE_ROOT}/src/`);
    const source = [base.replace(/\.js$/, '.ts'), base.replace(/\.js$/, '.tsx')].find(existsSync);
    if (!source) throw new Error(`No source for ${importFile}`);
    return source;
  });
}

/** Bundles an entry with the options `build-cjs.mjs` uses for the published bundle. */
async function bundleCJS(entry: Entry, entries: Entry[]): Promise<string> {
  const options = getCJSBuildOptions(entry, entries);
  const result = await build({...options, sourcemap: false, write: false, logLevel: 'silent'});
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

test('the root imports /legacy by relative path, so it resolves without `exports`', () => {
  const source = readFileSync(resolve(PACKAGE_ROOT, 'src/index.ts'), 'utf8');
  expect(source).not.toMatch(/from '@deck\.gl\/react/);
  expect(source).toContain("from './legacy/index'");
});

test('CommonJS root loads the /legacy bundle instead of inlining a copy', async () => {
  const entries = getSourceEntries();
  const root = entries.find(entry => entry.output.endsWith('/dist/index.cjs'));
  const legacy = entries.find(entry => entry.output.endsWith('/dist/legacy/index.cjs'));
  expect(root && legacy).toBeTruthy();

  const rootCode = await bundleCJS(root!, entries);
  const legacyCode = await bundleCJS(legacy!, entries);

  // The root bundle has no implementation of its own, so it creates no second React context.
  expect(rootCode).toContain('require("./legacy/index.cjs")');
  expect(rootCode).not.toContain('createContext');
  expect(legacyCode).toContain('createContext');

  const legacyExports = evaluateCJS(legacyCode, {});
  const rootExports = evaluateCJS(rootCode, {'./legacy/index.cjs': legacyExports});

  expect(Object.keys(rootExports).sort()).toEqual(Object.keys(legacyExports).sort());
  expect(rootExports.DeckGL, 'DeckGL').toBe(legacyExports.DeckGL);
  expect(rootExports.useWidget, 'useWidget').toBe(legacyExports.useWidget);
  expect(rootExports.default, 'default export').toBe(legacyExports.default);
});
