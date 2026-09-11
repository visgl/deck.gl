// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {test, expect, describe} from 'vitest';

// vitest aliases every `@deck.gl/*` specifier straight to its `src`, so an
// `import`/`require` test here would never touch the published package.json
// (see the `aliases` map in vitest.config.ts) - read the file directly
// instead, the same way a consumer's package manager would see it.
function readPackageJson(modulePath: string) {
  const packageJsonUrl = new URL(`../../../modules/${modulePath}/package.json`, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(packageJsonUrl), 'utf-8'));
}

describe('@deck.gl/maplibre package.json ships both module formats', () => {
  // @deck.gl/mapbox is the closest sibling: same "wrap deck.gl layers for a
  // host map library" shape, same dependency on @deck.gl/core.
  const mapbox = readPackageJson('mapbox');
  const maplibre = readPackageJson('maplibre');

  test('declares a CJS "main" entry, like @deck.gl/mapbox', () => {
    expect(mapbox.main).toMatch(/\.cjs$/);
    expect(maplibre.main).toMatch(/\.cjs$/);
  });

  test('exports["."] has a "require" condition, like @deck.gl/mapbox', () => {
    const mapboxRequire = mapbox.exports['.'].require;
    const maplibreRequire = maplibre.exports['.'].require;

    expect(mapboxRequire).toMatch(/\.cjs$/);
    expect(maplibreRequire).toMatch(/\.cjs$/);
  });

  test('"main" and exports["."].require point at the same file', () => {
    expect(maplibre.main).toBe(maplibre.exports['.'].require.replace(/^\.\//, ''));
  });
});
