// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, loadConfigFromFile, mergeConfig} from 'vite';

// The Arrow package is not published. Pin its source to the installed alpha's
// revision so CI and deployment builds use compatible peers.
const lumaRevision = 'f94cb23e034d0627dfcab1f9df4d13eec5f5e49d';
const root = fileURLToPath(new URL('../../', import.meta.url));
const examplesRoot = resolve(root, 'examples/v10-experimental');
const sections = JSON.parse(readFileSync(resolve(root, 'website/src/examples/v10/examples.json')));
const websiteBasePath = `/${(process.env.WEBSITE_BASE_URL || '').split('/').filter(Boolean).join('/')}`;
const loadedConfig = await loadConfigFromFile(
  {command: 'build', mode: 'production'},
  resolve(examplesRoot, 'vite.config.ts'),
  examplesRoot
);
if (!loadedConfig) throw new Error('Unable to load the deck.gl example Vite config');
const sourceRoot = mkdtempSync(resolve(tmpdir(), 'deck-website-luma-'));

try {
  const response = await fetch(`https://codeload.github.com/visgl/luma.gl/tar.gz/${lumaRevision}`);
  if (!response.ok) throw new Error(`Unable to fetch luma.gl sources: ${response.status}`);
  const archivePath = resolve(sourceRoot, 'source.tar.gz');
  writeFileSync(archivePath, Buffer.from(await response.arrayBuffer()));
  execFileSync('tar', ['-xzf', archivePath, '--strip-components=1', '-C', sourceRoot]);

  const aliases = [];
  for (const moduleName of ['arrow']) {
    const moduleRoot = resolve(sourceRoot, 'modules', moduleName);
    const metadata = JSON.parse(readFileSync(resolve(moduleRoot, 'package.json')));
    for (const [subpath, entry] of Object.entries(metadata.exports)) {
      const packagePath = `@luma.gl/${moduleName}${subpath === '.' ? '' : subpath.slice(1)}`;
      aliases.push({
        find: new RegExp(`^${packagePath.replaceAll('.', '\\.')}$`),
        replacement: resolve(
          moduleRoot,
          entry.import.replace('./dist/', './src/').replace(/\.js$/, '.ts')
        )
      });
    }
  }

  const input = Object.fromEntries(
    sections.flatMap(section =>
      section.examples.map(({id}) => [id, resolve(examplesRoot, id, 'index.html')])
    )
  );
  await build(mergeConfig(loadedConfig.config, {
    configFile: false,
    root: examplesRoot,
    // Docusaurus may redirect index.html to a URL without a trailing slash.
    // Absolute asset URLs keep those redirects and /next/ deployments working.
    base: `${websiteBasePath === '/' ? '' : websiteBasePath}/v10-examples/`,
    resolve: {
      alias: aliases,
      // Also resolve imports made by the temporary luma.gl source checkout.
      dedupe: [
        '@luma.gl/splats',
        '@luma.gl/text',
        '@luma.gl/graph',
        '@math.gl/core',
        '@math.gl/geospatial',
        '@math.gl/geometry',
        '@mapbox/tiny-sdf'
      ]
    },
    build: {
      outDir: resolve(root, 'website/static/v10-examples'),
      emptyOutDir: true,
      rollupOptions: {input}
    }
  }));
} finally {
  rmSync(sourceRoot, {recursive: true, force: true});
}
