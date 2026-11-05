// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import ts from 'typescript';
import {resolve} from 'node:path';
import {readFileSync} from 'node:fs';
import {expect, it} from 'vitest';

it('marks compatibility aliases deprecated in the TypeScript language service', () => {
  const fileName = resolve('tile-alias-consumer.ts');
  const geoLayersPath = resolve('modules/geo-layers/src/index.ts');
  const mainPath = resolve('modules/main/src/index.ts');
  const parse = (path: string) =>
    ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const geoLayers = parse(geoLayersPath);
  const aliasNames = new Set(['_Tileset2D', '_Tile2DHeader', '_TileLoadProps', '_Tileset2DProps']);
  const declarations = geoLayers.statements
    .filter(
      node =>
        ts.isImportDeclaration(node) ||
        (ts.isTypeAliasDeclaration(node) && aliasNames.has(node.name.text)) ||
        (ts.isExportDeclaration(node) &&
          node.exportClause &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.some(specifier => aliasNames.has(specifier.name.text)))
    )
    .map(node => node.getFullText(geoLayers))
    .join('\n');
  const main = parse(mainPath);
  const mainAlias = main.statements
    .filter(ts.isExportDeclaration)
    .flatMap(node =>
      node.exportClause && ts.isNamedExports(node.exportClause)
        ? [...node.exportClause.elements]
        : []
    )
    .find(specifier => specifier.name.text === '_Tileset2D')!;
  // Exercise the actual export declarations, with minimal backing types so the
  // language-service test does not load the entire rendering/dependency graph.
  const files = new Map([
    [geoLayersPath, declarations],
    [mainPath, `export {${mainAlias.getFullText(main)}} from '@deck.gl/geo-layers';`],
    [
      resolve('modules/geo-layers/src/tileset-2d/index.ts'),
      `
      export class Tileset2D {}
      export class Tile2DHeader { constructor(index: unknown) {} }
      export type TileLoadProps = {};
      export type Tileset2DProps<DataT = any, ViewStateT = any> = {data?: DataT; view?: ViewStateT};
    `
    ],
    [resolve('modules/core/src/index.ts'), 'export class Viewport {}']
  ]);
  const source = `
    import {_Tileset2D, _Tile2DHeader, type _TileLoadProps, type _Tileset2DProps,
      } from '@deck.gl/geo-layers';
    import {_Tileset2D as MainTileset} from 'deck.gl';
    new _Tileset2D();
    new _Tile2DHeader({x: 0, y: 0, z: 0});
    let load: _TileLoadProps;
    let options: _Tileset2DProps;
    new MainTileset();
  `;
  files.set(fileName, source);
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    noLib: true,
    paths: {
      '@deck.gl/geo-layers': [resolve('modules/geo-layers/src/index.ts')],
      '@deck.gl/core': [resolve('modules/core/src/index.ts')],
      'deck.gl': [resolve('modules/main/src/index.ts')]
    }
  };
  const host: ts.LanguageServiceHost = {
    ...ts.sys,
    getCompilationSettings: () => options,
    getScriptFileNames: () => [...files.keys()],
    getScriptVersion: () => '0',
    getScriptSnapshot: path => {
      const text = files.get(path);
      return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text);
    },
    getCurrentDirectory: () => process.cwd(),
    getDefaultLibFileName: opts => ts.getDefaultLibFilePath(opts),
    fileExists: path => files.has(path),
    readFile: path => files.get(path)
  };
  const service = ts.createLanguageService(host);
  try {
    const deprecated = service.getSuggestionDiagnostics(fileName).filter(d => d.reportsDeprecated);
    for (const name of [
      '_Tileset2D',
      '_Tile2DHeader',
      '_TileLoadProps',
      '_Tileset2DProps',
      'MainTileset'
    ]) {
      expect(
        deprecated.some(d => source.slice(d.start, d.start! + d.length!) === name),
        name
      ).toBe(true);
    }
    const mvt = parse(resolve('modules/geo-layers/src/mvt-layer/mvt-layer.ts'));
    const mvtClass = mvt.statements
      .filter(ts.isClassDeclaration)
      .find(node => node.name?.text === 'MVTLayer')!;
    expect(ts.getJSDocDeprecatedTag(mvtClass)).toBeUndefined();
  } finally {
    service.dispose();
  }
});
