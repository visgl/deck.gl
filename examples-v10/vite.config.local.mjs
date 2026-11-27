/* eslint-disable import/namespace */
import {defineConfig} from 'vite';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {readFileSync} from 'fs';
import {join} from 'path';

const rootDir = join(__dirname, '..');

function aliasScopedPackages(scope) {
  // Redirect bare package imports to the repo root without rewriting package export subpaths.
  return {
    find: new RegExp(`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)$`),
    replacement: join(rootDir, `./node_modules/${scope}/$1`)
  };
}

/**
 * Maps each `@deck.gl/react` subpath to its source file. The package's exports don't mirror
 * `src/`: `/maplibre` is `src/dom/maplibre.tsx` and `/layers` is `src/wrappers/layers.ts`, so the
 * prefix alias for `@deck.gl/react` alone would resolve them to files that don't exist.
 */
function reactSubpathAliases() {
  const {exports} = JSON.parse(readFileSync(join(rootDir, 'modules/react/package.json'), 'utf8'));
  return Object.entries(exports)
    .filter(([subpath]) => subpath.startsWith('./') && subpath !== './package.json')
    .map(([subpath, target]) => ({
      find: new RegExp(`^@deck\\.gl/react/${subpath.slice(2)}$`),
      replacement: join(
        rootDir,
        'modules/react/src',
        target.import.replace(/^\.\/dist\//, '').replace(/\.js$/, '')
      )
    }));
}

/** https://vitejs.dev/config/ */
export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDir});

  return {
    resolve: {
      dedupe: ['apache-arrow', 'react', 'react-dom'],

      alias: [
        ...reactSubpathAliases(),
        ...Object.entries(aliases).map(([find, replacement]) => ({find, replacement})),
        {
          find: '@deck.gl/proposals/layers',
          replacement: join(rootDir, 'modules/proposals/src/layers/index.ts')
        },
        // Use root dependencies
        {find: 'mjolnir.js', replacement: join(rootDir, './node_modules/mjolnir.js')},
        aliasScopedPackages('@luma.gl'),
        aliasScopedPackages('@math.gl'),
        {find: '@arcgis/core', replacement: join(rootDir, './node_modules/@arcgis/core')},
        aliasScopedPackages('@loaders.gl')
      ]
    },
    define: {
      'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey),
      'process.env.GoogleMapsMapId': JSON.stringify(process.env.GoogleMapsMapId),
      'process.env.MapboxAccessToken': JSON.stringify(process.env.MapboxAccessToken)
    },
    server: {
      open: true,
      port: 8080
    },
    worker: {format: 'es'},
    optimizeDeps: {
      // Preserve the codec modules' relative WASM URLs in development.
      exclude: ['compress-utils'],
      esbuildOptions: {target: 'es2022'}
    }
  };
});
