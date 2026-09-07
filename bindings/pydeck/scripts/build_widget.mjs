// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Builds @deck.gl/jupyter-widget (unless --copy-only) and copies its bundles into pydeck/static:
 *   dist/index.js  -> standalone.js   UMD bundle used by Deck.to_html(offline=True)
 *   dist/widget.js -> widget.js       ES module loaded by the anywidget-based DeckGLWidget
 *   @deck.gl/widgets stylesheet -> widget.css
 */
import {execSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const pydeckRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(pydeckRoot, '../..');
const widgetDir = join(repoRoot, 'modules/jupyter-widget');
const staticDir = join(pydeckRoot, 'pydeck/static');
const copyOnly = process.argv.includes('--copy-only');

if (!copyOnly) {
  if (!existsSync(join(repoRoot, 'modules/core/dist'))) {
    throw new Error(
      'deck.gl is not built: run `yarn bootstrap && yarn build` in the repository root ' +
        '(or `make init` in bindings/pydeck) before building the pydeck widget.'
    );
  }
  execSync('yarn build', {cwd: widgetDir, stdio: 'inherit'});
}

const FILES = {
  'dist/index.js': 'standalone.js',
  'dist/index.js.map': 'standalone.js.map',
  'dist/widget.js': 'widget.js',
  'dist/widget.js.map': 'widget.js.map',
  '../widgets/dist/stylesheet.css': 'widget.css'
};

mkdirSync(staticDir, {recursive: true});
for (const [source, destination] of Object.entries(FILES)) {
  const sourcePath = join(widgetDir, source);
  if (!existsSync(sourcePath)) {
    throw new Error(
      `Missing ${sourcePath}. Run \`yarn build\` in modules/jupyter-widget (and modules/widgets) first.`
    );
  }
  copyFileSync(sourcePath, join(staticDir, destination));
}
console.log(`Copied ${Object.keys(FILES).length} files into ${staticDir}`);
