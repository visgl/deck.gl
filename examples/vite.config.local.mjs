/* eslint-disable import/namespace */
import {defineConfig} from 'vite';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {existsSync, readFileSync} from 'fs';
import {join} from 'path';

const rootDir = join(__dirname, '..');

// Packages that must have a single copy shared by the example and the deck.gl sources
const EXAMPLE_PACKAGES = ['react', 'react-dom', 'mapbox-gl', 'maplibre-gl'];

function aliasScopedPackages(scope) {
  // Redirect bare package imports to the repo root without rewriting package export subpaths.
  return {
    find: new RegExp(`^${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/([^/]+)$`),
    replacement: join(rootDir, `./node_modules/${scope}/$1`)
  };
}

function readPackageVersion(packageDir) {
  const packageJsonPath = join(packageDir, 'package.json');
  return existsSync(packageJsonPath)
    ? JSON.parse(readFileSync(packageJsonPath, 'utf8')).version
    : null;
}

function isAliased(packageName, alias) {
  return alias.some(({find}) =>
    typeof find === 'string' ? find === packageName : find.test(packageName)
  );
}

// Dependencies missing from the example's node_modules silently resolve to the repo root copies
function warnMissingDependencies(exampleDir, alias) {
  const packageJsonPath = join(exampleDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    return;
  }
  const {dependencies = {}} = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const missing = Object.keys(dependencies)
    .filter(name => !isAliased(name, alias))
    .filter(name => !readPackageVersion(join(exampleDir, 'node_modules', name)))
    .map(name => {
      const rootVersion = readPackageVersion(join(rootDir, 'node_modules', name));
      return rootVersion ? `${name} (falls back to repo root ${rootVersion})` : name;
    });
  if (missing.length) {
    console.warn(
      `\x1b[33mMissing from ${join(exampleDir, 'node_modules')}:\n  ${missing.join('\n  ')}\n` +
        'Run `yarn --check-files` in the example, then `yarn start-local --force`.\x1b[0m'
    );
  }
}

/** https://vitejs.dev/config/ */
export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: rootDir});
  const exampleDir = process.cwd();
  const alias = [
    ...Object.entries(aliases).map(([find, replacement]) => ({find, replacement})),
    // Use root dependencies
    {find: 'mjolnir.js', replacement: join(rootDir, './node_modules/mjolnir.js')},
    aliasScopedPackages('@luma.gl'),
    aliasScopedPackages('@math.gl'),
    {find: '@arcgis/core', replacement: join(rootDir, './node_modules/@arcgis/core')},
    {find: '@loaders.gl/core', replacement: join(rootDir, './node_modules/@loaders.gl/core')}
  ];

  warnMissingDependencies(exampleDir, alias);

  return {
    resolve: {
      alias,
      // Resolve these from the example even when imported by deck.gl sources under modules/.
      // Only installed packages are listed, so installing one changes the config hash and
      // invalidates a dependency cache that was built against the repo root copy.
      dedupe: EXAMPLE_PACKAGES.filter(name =>
        readPackageVersion(join(exampleDir, 'node_modules', name))
      )
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
