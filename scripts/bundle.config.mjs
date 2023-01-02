import fs from 'fs';
import {resolve} from 'path';
import babel from 'esbuild-plugin-babel';
import ext from "esbuild-plugin-external-global";

const PACKAGE_ROOT = process.cwd();
const PACKAGE_INFO = getPackageInfo(PACKAGE_ROOT);
const ALIASES = getAliases();

function getPackageInfo(dir) {
  const text = fs.readFileSync(resolve(dir, 'package.json'), 'utf-8');
  return JSON.parse(text);
}

function getAliases() {
  const submodules = {};
  const parentPath = resolve(PACKAGE_ROOT, '..');

  fs.readdirSync(parentPath).forEach((item) => {
    const itemPath = resolve(parentPath, item);
    try {
      const packageInfo = getPackageInfo(itemPath)
      submodules[packageInfo.name] = resolve(itemPath, 'src');
    } catch {
      // ignore
    }
  });

  return submodules;
}

/**
 * peerDependencies are excluded using `externals`
 * https://webpack.js.org/configuration/externals/
 * e.g. @deck.gl/core is not bundled with @deck.gl/geo-layers
 */
function getExternals(packageInfo) {
  let externals = {
    // Hard coded externals
    'h3-js': 'globalThis.h3 || {}'
  };
  const {peerDependencies = {}} = packageInfo;

  for (const depName in peerDependencies) {
    if (depName.startsWith('@deck.gl')) {
      // Instead of bundling the dependency, import from the global `deck` object
      externals[depName] = 'globalThis.deck';
    }
  }

  if (externals['@deck.gl/core']) {
    // Do not bundle luma.gl if `core` is peer dependency
    externals['@luma.gl/core'] = 'globalThis.luma';
  }

  return externals;
}

const babelConfigProd = {
  filter: /src|bundle|esm/,
  config: {
    presets: [
      '@babel/preset-typescript',
      ['@babel/preset-env', {
        targets: ["supports webgl", "not dead"],
        modules: false
      }]
    ],
    // all of the helpers will reference the module @babel/runtime to avoid duplication
    // across the compiled output.
    plugins: [
      '@babel/transform-runtime',
      'inline-webgl-constants',
      ['remove-glsl-comments', {patterns: ['**/*.glsl.js', '**/*.glsl.ts']}]
    ]
  }
};

const babelConfigDev = {
  filter: /src|bundle/,
  config: {
    presets: [
      '@babel/preset-typescript'
    ]
  }
}

export default function getBundleConfig(opts = {}) {
  const devMode = opts.env === 'dev';

  const {input, output = devMode ? './dist/dist.dev.js' : './dist.min.js'} = opts;

  return {
    entryPoints: [input],
    outfile: output,
    bundle: true,
    minify: !devMode,
    format: 'iife',
    globalName: 'deck',
    alias: ALIASES,
    platform: 'browser',
    target: ['esnext'],
    logLevel: 'info',
    define: {
      __VERSION__: `'${PACKAGE_INFO.version}'`
    },
    plugins: [
      ext.externalGlobalPlugin(getExternals(PACKAGE_INFO)),
      babel(devMode ? babelConfigDev : babelConfigProd)
    ]
  };
}
