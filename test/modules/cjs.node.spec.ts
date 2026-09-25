// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync, readdirSync} from 'fs';
import {createRequire} from 'module';
import {fileURLToPath} from 'url';
import {resolve} from 'path';
import {test, expect, describe} from 'vitest';

// Every project in vitest.config.ts aliases `@deck.gl/*` straight to its
// `src` (see the `aliases` map there), so an `import`/`require` of the
// package name would never touch the built dist/ output, in this file or
// any other. Resolve and require() the built file by its real path instead,
// the same way test/setup/vitest-node-setup.ts already reaches past the
// alias for @loaders.gl/polyfills, and the same way a downstream CJS
// consumer (a Jest project without ESM transforms, plain Node require())
// actually loads these packages.
const require = createRequire(import.meta.url);
const modulesDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../modules');

function readPackageJson(packageName: string) {
  return JSON.parse(readFileSync(resolve(modulesDir, packageName, 'package.json'), 'utf-8'));
}

// Resolve exports["."].require to an absolute path, mirroring how Node's
// own CJS resolver reads a package.
function requireEntryFor(packageName: string): string {
  const requireEntry = readPackageJson(packageName).exports['.'].require;
  return resolve(modulesDir, packageName, requireEntry);
}

// Every published @deck.gl/* package that declares a CJS "require" export
// condition, gated on that condition rather than a hardcoded list: a future
// module that adds one is picked up automatically, and a module that's
// ESM-only (@deck.gl/jupyter-widget, as of this writing) is skipped without
// needing an exclusion list to keep in sync.
const cjsModules = readdirSync(modulesDir).filter(name => {
  const packageJsonPath = resolve(modulesDir, name, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return false;
  }
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return Boolean(packageJson.exports?.['.']?.require);
});

describe('@deck.gl/* packages ship a working CJS build', () => {
  const unbuilt: string[] = [];

  for (const packageName of cjsModules) {
    const entry = requireEntryFor(packageName);
    const built = existsSync(entry);
    if (!built) {
      unbuilt.push(packageName);
    }

    // `yarn build` runs before `yarn test-ci` in CI.
    // Locally, `yarn test` is commonly run without a prior build - every
    // other test in this suite runs against `src` via the alias map - so
    // skip instead of failing when the dist hasn't been built.
    test.skipIf(!built)(`@deck.gl/${packageName} require()s and exports something`, () => {
      // A real require() call, not the vitest alias: if the build didn't
      // emit this entry, or it can't resolve its own dependencies, this
      // throws instead of the module loading with empty/undefined exports.
      const builtModule = require(entry);
      expect(
        Object.keys(builtModule).length > 0,
        `@deck.gl/${packageName}'s built CJS entry (${entry}) has no exports`
      ).toBe(true);
    });
  }

  if (unbuilt.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[cjs.node.spec] Skipped ${unbuilt.length} unbuilt package(s) (${unbuilt.join(', ')}). ` +
        'Run `yarn build` to exercise these checks locally; CI always builds first in the ' +
        'test-coverage job.'
    );
  }
});
