// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vite';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

function aliasScopedPackages(scope) {
  return {
    find: new RegExp(`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)$`),
    replacement: join(rootDir, `./node_modules/${scope}/$1`)
  };
}

export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDir});

  return {
    resolve: {
      alias: [
        ...Object.entries(aliases).map(([find, replacement]) => ({find, replacement})),
        {find: 'mjolnir.js', replacement: join(rootDir, './node_modules/mjolnir.js')},
        aliasScopedPackages('@luma.gl'),
        aliasScopedPackages('@math.gl'),
        {find: '@arcgis/core', replacement: join(rootDir, './node_modules/@arcgis/core')},
        {find: '@loaders.gl/core', replacement: join(rootDir, './node_modules/@loaders.gl/core')}
      ]
    },
    define: {
      'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey)
    }
  };
});
