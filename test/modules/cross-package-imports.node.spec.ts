// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = path.resolve(import.meta.dirname, '../..');
const modulesDir = path.join(rootDir, 'modules');
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * Extract module specifiers with the TypeScript preprocessor: static imports,
 * re-exports, dynamic `import()` and `import('...')` types. Comments and
 * strings that only mention a path are ignored.
 */
function extractModuleSpecifiers(source: string): string[] {
  return ts.preProcessFile(source, true, true).importedFiles.map(file => file.fileName);
}

/**
 * Published packages only ship their own files plus their npm dependencies.
 * A relative import that leaves the package directory (e.g. from
 * `modules/arcgis` into `modules/core/src`) survives bundling as a relative
 * path in `dist` that no longer resolves once the package is installed.
 * Cross-package references must go through the package entry points.
 */
function findCrossPackageRelativeImports(): string[] {
  const violations: string[] = [];

  for (const moduleName of fs.readdirSync(modulesDir)) {
    const moduleDir = path.join(modulesDir, moduleName);
    const srcDir = path.join(moduleDir, 'src');
    if (!fs.statSync(moduleDir).isDirectory() || !fs.existsSync(srcDir)) {
      continue;
    }

    const visit = (dir: string) => {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          visit(entryPath);
        } else if (
          SOURCE_EXTENSIONS.includes(path.extname(entry.name)) &&
          !entry.name.endsWith('.d.ts')
        ) {
          collectFromFile(entryPath);
        }
      }
    };

    const collectFromFile = (file: string) => {
      for (const specifier of extractModuleSpecifiers(fs.readFileSync(file, 'utf-8'))) {
        if (!specifier.startsWith('.')) {
          continue;
        }
        const resolved = path.resolve(path.dirname(file), specifier);
        if (!resolved.startsWith(moduleDir + path.sep)) {
          violations.push(`${path.relative(rootDir, file)}: ${specifier}`);
        }
      }
    };

    visit(srcDir);
  }

  return violations.sort();
}

test('module sources do not import across package boundaries', () => {
  expect(
    findCrossPackageRelativeImports(),
    'relative imports must stay inside the package; cross-package imports must use package entry points (e.g. @deck.gl/core)'
  ).toEqual([]);
});
