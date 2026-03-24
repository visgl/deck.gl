import {defineConfig} from 'vite';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {join} from 'path';

const rootDir = join(__dirname, '..');

function aliasScopedPackages(scope) {
  // Redirect bare package imports to the repo root without rewriting package export subpaths.
  return {
    find: new RegExp(`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)$`),
    replacement: join(rootDir, `./node_modules/${scope}/$1`)
  };
}

/** https://vitejs.dev/config/ */
export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDir});

  return {
    resolve: {
      alias: [
        ...Object.entries(aliases).map(([find, replacement]) => ({find, replacement})),
        // Use root dependencies
        {find: 'mjolnir.js', replacement: join(rootDir, './node_modules/mjolnir.js')},
        aliasScopedPackages('@luma.gl'),
        aliasScopedPackages('@math.gl'),
        {find: '@arcgis/core', replacement: join(rootDir, './node_modules/@arcgis/core')},
        {find: '@loaders.gl/core', replacement: join(rootDir, './node_modules/@loaders.gl/core')}
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
    optimizeDeps: {
      esbuildOptions: {target: 'es2022'}
    }
  };
});
