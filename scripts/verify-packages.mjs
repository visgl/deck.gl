// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Checks the built packages the way an application consumes them, after `yarn build`.
// 1. `require()` loads every CommonJS entry.
// 2. A bundler resolves every import using only the packages a consumer gets from installing the
//    entry package. Optional peers and packages that are only hoisted in this repo do not count.

import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {builtinModules} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const builtins = new Set(builtinModules);
// TODO - `@arcgis/core` is ESM-only, and its default exports are lost through `require()`
const knownRequireFailures = new Set(['@deck.gl/arcgis']);
// Runs inside test runners, which load browser automation outside of the application bundle
const unbundledPackages = new Set(['@deck.gl/test-utils']);

const packages = readdirSync(join(rootDir, 'modules'))
  .map(moduleName => join(rootDir, 'modules', moduleName))
  .map(packageDir => ({packageDir, packageJson: readPackageJson(packageDir)}))
  .filter(({packageJson}) => packageJson && !packageJson.private && packageJson.exports?.['.']);

let failureCount = 0;
for (const {packageDir, packageJson} of packages) {
  const errors = [];
  if (packageJson.exports['.'].require && !knownRequireFailures.has(packageJson.name)) {
    errors.push(...verifyRequire(packageJson.name));
  }
  if (!unbundledPackages.has(packageJson.name)) {
    errors.push(...(await verifyBundle(packageDir, packageJson)));
  }

  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${packageJson.name}`);
  for (const error of errors) {
    console.log(`     ${error}`);
  }
  failureCount += errors.length ? 1 : 0;
}
process.exit(failureCount ? 1 : 0);

/** Load the CommonJS entry in a fresh Node process */
function verifyRequire(packageName) {
  const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(packageName)})`], {
    cwd: rootDir,
    encoding: 'utf8'
  });
  if (result.status === 0) {
    return [];
  }
  const message = result.stderr.split('\n').find(line => /Error/.test(line)) || result.stderr;
  return [`require(): ${message.trim()}`];
}

/** Bundle the ESM entry, failing on imports of packages a consumer would not have installed */
async function verifyBundle(packageDir, packageJson) {
  const installed = getInstalledPackages(packageDir);
  const missing = new Set();
  try {
    await build({
      stdin: {
        contents: `import * as entry from '${packageJson.name}'; export default entry;`,
        resolveDir: rootDir
      },
      absWorkingDir: rootDir,
      bundle: true,
      write: false,
      format: 'esm',
      platform: 'browser',
      logLevel: 'silent',
      loader: {'.css': 'empty', '.wasm': 'empty'},
      plugins: [
        {
          name: 'consumer-install',
          setup(pluginBuild) {
            // `#` paths are package.json subpath imports, resolved inside their own package
            pluginBuild.onResolve({filter: /^[^./#]/}, args => {
              const packageName = getPackageName(args.path);
              // Node built-ins are left to the application's bundler configuration
              if (builtins.has(packageName)) {
                return {path: args.path, external: true};
              }
              if (!installed.has(packageName)) {
                missing.add(`${packageName} (imported by ${getImporterPackage(args.importer)})`);
                return {path: args.path, external: true};
              }
              return undefined;
            });
          }
        }
      ]
    });
  } catch (error) {
    return [`bundle: ${error.errors?.[0]?.text || error.message}`];
  }
  return [...missing].map(name => `bundle: not installed with ${packageJson.name}: ${name}`);
}

/** Names of the packages that installing the package in `packageDir` brings in */
function getInstalledPackages(packageDir) {
  const installed = new Set();
  const queue = [packageDir];
  while (queue.length) {
    const dir = queue.shift();
    const packageJson = readPackageJson(dir);
    if (!packageJson || installed.has(packageJson.name)) {
      continue;
    }
    installed.add(packageJson.name);
    const optionalPeers = packageJson.peerDependenciesMeta || {};
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}).filter(
        name => !optionalPeers[name]?.optional
      )
    ];
    for (const dependencyName of dependencyNames) {
      const dependencyDir = findPackageDir(dependencyName, dir);
      if (dependencyDir) {
        queue.push(dependencyDir);
      }
    }
  }
  return installed;
}

function findPackageDir(packageName, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', packageName);
    if (existsSync(join(candidate, 'package.json'))) {
      return candidate;
    }
    if (dir === dirname(dir)) {
      return null;
    }
  }
}

function getImporterPackage(importer) {
  for (let dir = dirname(importer); dir !== dirname(dir); dir = dirname(dir)) {
    const packageJson = readPackageJson(dir);
    if (packageJson?.name) {
      return packageJson.name;
    }
  }
  return importer;
}

function getPackageName(importPath) {
  const parts = importPath.replace(/^node:/, '').split('/');
  return importPath.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function readPackageJson(dir) {
  const path = join(dir, 'package.json');
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}
