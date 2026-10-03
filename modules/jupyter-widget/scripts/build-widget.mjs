// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Builds the self-contained ES module that pydeck's anywidget-based DeckGLWidget loads.
 *
 * `ocular-bundle --format=esm` marks every package as external, which anywidget cannot resolve when it
 * loads the module from a blob URL, so this drives esbuild directly while reusing ocular's aliases
 * (@deck.gl/* -> modules/x/dist, or modules/x/src with --env=dev) and browser targets.
 */
import {existsSync, readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import esbuild from 'esbuild';
import {getOcularConfig} from '@vis.gl/dev-tools';

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(moduleRoot, '../..');
const dev = process.argv.includes('--env=dev');

if (!dev && !existsSync(resolve(repoRoot, 'modules/core/dist'))) {
  throw new Error(
    'deck.gl is not built. Run `yarn build` in the repository root first, or use `yarn build:dev` to bundle from source.'
  );
}

const {version} = JSON.parse(readFileSync(resolve(moduleRoot, 'package.json'), 'utf8'));
const ocular = await getOcularConfig({root: repoRoot, aliasMode: dev ? 'src' : 'dist'});

await esbuild.build({
  entryPoints: [resolve(moduleRoot, 'src/widget.js')],
  outfile: resolve(moduleRoot, 'dist/widget.js'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ocular.bundle.target,
  alias: ocular.aliases,
  define: {__VERSION__: JSON.stringify(version)},
  minify: !dev,
  sourcemap: true,
  sourcesContent: false,
  logLevel: 'info'
});
