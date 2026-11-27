// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {mkdirSync, readFileSync, renameSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, loadConfigFromFile, mergeConfig} from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));
const websiteBasePath = `/${(process.env.WEBSITE_BASE_URL || '').split('/').filter(Boolean).join('/')}`;
const examplesRoot = resolve(root, 'examples-v10');
const sections = JSON.parse(readFileSync(resolve(root, 'website/src/examples-v10/v10/examples.json')));
const loadedConfig = await loadConfigFromFile(
  {command: 'build', mode: 'production'},
  resolve(examplesRoot, 'proposals/vite.config.ts'),
  examplesRoot
);
if (!loadedConfig) throw new Error('Unable to load the deck.gl example Vite config');
const input = Object.fromEntries(
  sections.flatMap(section =>
    section.examples.map(({id, source = `proposals/${id}`}) => [id, resolve(examplesRoot, source, 'index.html')])
  )
);
const outDir = resolve(root, 'website/static/v10-examples');
await build(mergeConfig(loadedConfig.config, {
  configFile: false,
  root: examplesRoot,
  // Docusaurus may redirect index.html to a URL without a trailing slash.
  // Absolute asset URLs keep those redirects and /next/ deployments working.
  base: `${websiteBasePath === '/' ? '' : websiteBasePath}/v10-examples/`,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {input}
  }
}));

// Keep the published embed URLs independent of the source directories.
for (const {examples} of sections) {
  for (const {id, source = `proposals/${id}`} of examples) {
    mkdirSync(resolve(outDir, id), {recursive: true});
    renameSync(resolve(outDir, source, 'index.html'), resolve(outDir, id, 'index.html'));
  }
}
