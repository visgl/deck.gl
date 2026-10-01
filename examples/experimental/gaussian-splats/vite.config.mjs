// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable import/namespace */
import {defineConfig} from 'vite';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const exampleDirectory = dirname(fileURLToPath(import.meta.url));
const rootDirectory = join(exampleDirectory, '../../..');
const loadersRootDirectory = process.env.LOADERS_GL_ROOT;
const lumaRootDirectory = process.env.LUMA_GL_ROOT;

if (!lumaRootDirectory) {
  throw new Error(
    'LUMA_GL_ROOT must point to a luma.gl checkout with retained camera retargeting support.'
  );
}

function aliasScopedPackages(scope, directory = rootDirectory) {
  return {
    find: new RegExp(`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)$`),
    replacement: join(directory, `node_modules/${scope}/$1`)
  };
}

function aliasLumaSourcePackages(directory) {
  return {
    find: /^@luma\.gl\/([^/]+)(\/.*)?$/,
    replacement: join(directory, 'modules/$1/src$2')
  };
}

export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDirectory});
  return {
    resolve: {
      alias: [
        ...(loadersRootDirectory
          ? [
              {
                find: /^@loaders\.gl\/([^/]+)$/,
                replacement: join(loadersRootDirectory, 'modules/$1/src/index.ts')
              }
            ]
          : []),
        {
          find: '@luma.gl/splats',
          replacement: join(lumaRootDirectory, 'modules/splats/src/index.ts')
        },
        aliasLumaSourcePackages(lumaRootDirectory),
        ...Object.entries(aliases).map(([find, replacement]) => ({find, replacement})),
        {find: 'mjolnir.js', replacement: join(rootDirectory, 'node_modules/mjolnir.js')},
        ...(loadersRootDirectory ? [aliasScopedPackages('@math.gl', loadersRootDirectory)] : [])
      ]
    },
    server: {
      port: 8098,
      fs: {
        allow: [
          rootDirectory,
          ...(loadersRootDirectory ? [loadersRootDirectory] : []),
          lumaRootDirectory
        ]
      }
    },
    optimizeDeps: {
      esbuildOptions: {target: 'es2022'}
    }
  };
});
