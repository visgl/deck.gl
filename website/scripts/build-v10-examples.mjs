// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, loadConfigFromFile, mergeConfig} from 'vite';
import exampleCatalogs from './example-catalogs.cjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const websiteBasePath = `/${(process.env.WEBSITE_BASE_URL || '').split('/').filter(Boolean).join('/')}`;
for (const {id, assetPath} of exampleCatalogs) {
  const examplesRoot = resolve(root, id, 'proposals');
  const sections = JSON.parse(readFileSync(resolve(root, `website/src/${id}/v10/examples.json`)));
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
    base: `${websiteBasePath === '/' ? '' : websiteBasePath}/${assetPath}/`,
    build: {
      outDir: resolve(root, 'website/static', assetPath),
      emptyOutDir: true,
      rollupOptions: {input}
    }
  }));
}
