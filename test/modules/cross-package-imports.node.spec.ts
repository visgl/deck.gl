// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(import.meta.dirname, '../..');
const modulesDir = path.join(rootDir, 'modules');
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
/**
 * Extract module specifiers the way a bundler reads the file: comments and
 * non-import strings are skipped, and only quoted literals in import/export
 * position are returned, so a comment mentioning `from '../../core/...'`
 * cannot fail the check and a dynamic `import(/* chunk *\/ '../../core/...')`
 * cannot slip past it.
 */
function extractModuleSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  let i = 0;
  let expectSpecifier = false;
  while (i < source.length) {
    const c = source[i];
    if (c === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
    } else if (c === '/' && source[i + 1] === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++;
      i += 2;
    } else if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      const start = ++i;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
      if (expectSpecifier) {
        specifiers.push(source.slice(start, i));
        expectSpecifier = false;
      }
      i++;
    } else if (/[A-Za-z_$]/.test(c)) {
      const start = i;
      while (i < source.length && /[A-Za-z0-9_$]/.test(source[i])) i++;
      expectSpecifier = source.slice(start, i) === 'import' || source.slice(start, i) === 'from';
    } else if (c === '(' || /\s/.test(c)) {
      i++;
    } else {
      expectSpecifier = false;
      i++;
    }
  }
  return specifiers;
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
