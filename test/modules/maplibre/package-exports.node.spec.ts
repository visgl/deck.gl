// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'fs';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {resolve} from 'path';
import {test, expect, describe} from 'vitest';

// vitest aliases every `@deck.gl/*` specifier straight to its `src`, so an
// `import`/`require` of the package name here would never touch the built
// dist/ (see the `aliases` map in vitest.config.ts). Resolve and require()
// the built file by its real path instead - the same way test/setup/
// vitest-node-setup.ts already reaches past the alias for
// @loaders.gl/polyfills, and the same way a downstream CJS consumer (a
// Jest project without ESM transforms, plain Node require()) actually
// loads this package.
const require = createRequire(import.meta.url);
const modulesDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../modules');

function readPackageJson(packageName: string) {
  return JSON.parse(readFileSync(resolve(modulesDir, packageName, 'package.json'), 'utf-8'));
}

// Resolve exports["."].require (falling back to "main") to an absolute path,
// mirroring how Node's own CJS resolver reads a package.
function requireEntryFor(packageName: string): string {
  const packageJson = readPackageJson(packageName);
  const requireEntry = packageJson.exports?.['.']?.require ?? packageJson.main;
  return resolve(modulesDir, packageName, requireEntry);
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

describe('@deck.gl/maplibre CJS build artifact', () => {
  const maplibreEntry = requireEntryFor('maplibre');
  const built = existsSync(maplibreEntry);

  // `yarn build` already runs before `yarn test-ci` in the `test-coverage`
  // CI job, so this exercises the real artifact there at no added CI cost.
  // Locally, `yarn test` is commonly run without a prior build - every
  // other test in this suite runs against `src` via the alias map - so
  // skip instead of failing when the dist hasn't been built yet.
  test.skipIf(!built)(
    'require()s the built dist/index.cjs and resolves its own dependencies',
    () => {
      // A real require() call, not the vitest alias: if the build didn't
      // emit index.cjs, or index.cjs can't resolve its own @deck.gl/core /
      // @luma.gl/core requires, this throws instead of the module loading.
      const builtModule = require(maplibreEntry);
      expect(
        builtModule.MapLibreOverlay,
        'MapLibreOverlay exported from the built CJS'
      ).toBeTruthy();

      // Cross-check against the working sibling so this isn't pinning a
      // coincidence: both should load the same way.
      const mapboxEntry = requireEntryFor('mapbox');
      if (existsSync(mapboxEntry)) {
        const mapboxModule = require(mapboxEntry);
        expect(typeof builtModule.MapLibreOverlay).toBe(typeof mapboxModule.MapboxOverlay);
      }
    }
  );

  if (!built) {
    // eslint-disable-next-line no-console
    console.warn(
      `[package-exports.node.spec] Skipped: ${maplibreEntry} is not built. Run \`yarn build\` ` +
        'to exercise this check locally; CI always builds first in the test-coverage job.'
    );
  }
});
