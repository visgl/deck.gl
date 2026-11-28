// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {expect, test} from 'vitest';

/** The `package.json` fields this test reads. */
type PackageJson = {
  types: string;
  exports: Record<string, string | {types?: string}>;
  typesVersions?: Record<string, Record<string, string[]>>;
};

/** The parsed `@deck.gl/react` manifest. */
const pkg = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../../modules/react/package.json'), 'utf8')
) as PackageJson;

/** Removes the leading `./` that `exports` paths have and `typesVersions` paths don't. */
function normalize(path: string): string {
  return path.replace(/^\.\//, '');
}

// TypeScript's `moduleResolution: "node"` ignores `exports`, so subpath types are only found
// through `typesVersions`. Every subpath must map to the same declarations as its `exports` entry.
test('typesVersions maps every exports subpath to its declarations', () => {
  const mappings = pkg.typesVersions?.['*'] ?? {};
  const expected: Record<string, string[]> = {};
  for (const [subpath, entry] of Object.entries(pkg.exports)) {
    if (subpath === '.' || typeof entry !== 'object' || !entry.types) continue;
    expected[subpath.replace(/^\.\//, '')] = [normalize(entry.types)];
  }

  expect(Object.keys(expected)).toContain('legacy');
  expect(mappings).toEqual(expected);
  expect(normalize(pkg.types)).toBe(normalize((pkg.exports['.'] as {types: string}).types));
});
