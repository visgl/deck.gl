// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import semver from 'semver';
import {expect, test} from 'vitest';

type PackageJson = {
  version: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const PACKAGE_JSON = resolve(import.meta.dirname, '../../../../modules/react/package.json');
const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf8')) as PackageJson;
/** Reads an installed dependency's manifest the way Node resolves it from the package. */
function readDependency(name: string): PackageJson {
  for (let dir = dirname(PACKAGE_JSON); ; dir = dirname(dir)) {
    const file = resolve(dir, 'node_modules', name, 'package.json');
    if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')) as PackageJson;
    if (dirname(dir) === dir) throw new Error(`${name} is not installed`);
  }
}

// A workspace install hoists one React for every package, so a dependency whose React peer range
// is narrower than ours would still install here, but fail with ERESOLVE for an app that installs
// the React version we declare as the minimum.
test('React peer ranges fit every dependency that peers on React', () => {
  const peers = pkg.peerDependencies ?? {};
  const checked: string[] = [];

  for (const [name, range] of Object.entries(pkg.dependencies ?? {})) {
    const dependency = readDependency(name);
    expect(semver.satisfies(dependency.version, range), `${name}@${dependency.version}`).toBe(true);

    for (const peer of ['react', 'react-dom']) {
      const required = dependency.peerDependencies?.[peer];
      if (!required) continue;
      expect(peers[peer], `${peer} peer`).toBeDefined();
      expect(
        semver.subset(peers[peer], required),
        `${peer} "${peers[peer]}" must fit ${name}'s "${required}"`
      ).toBe(true);
      checked.push(`${name}:${peer}`);
    }
  }

  expect(checked).toContain('react-reconciler:react');
  expect(semver.minVersion(peers['react-dom'])?.version).toBe(
    semver.minVersion(peers.react)?.version
  );
});
