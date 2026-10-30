// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, loadConfigFromFile, mergeConfig} from 'vite';

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
  build: {
    outDir: resolve(root, 'website/static/v10-examples'),
    emptyOutDir: true,
    rollupOptions: {input}
  }
}));
