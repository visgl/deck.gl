/**
 * Embeddable @deck.gl/jupyter-widget bundle
 *
 * Used in JupyterLab (whose entry point is at plugin.js) and Jupyter Notebook alike.
 *
 */
import esbuild from 'esbuild';
import getConfig from '../../scripts/bundle.config.mjs';
import ext from 'esbuild-plugin-external-global';

// JupyterLab requires an amd bundle
// Standalone version requires iife
// esbuild does not support umd format
// Work around from https://github.com/evanw/esbuild/issues/819
// Template: https://webpack.js.org/configuration/output/#type-umd
const umdWrapper = {
  format: 'iife',
  globalName: '__exports__',
  banner: {
    js: `\
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
      else if (typeof define === 'function' && define.amd) define([], factory);
      else {
        var a = factory();
        for (var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
      }
    })(globalThis, function () {`
  },
  footer: {
    js: `\
    return __exports__;
    });`
  }
};

// External dependency only used inside JupyterLab
function amdRequire(packages) {
  const externals = {};
  for (const packageName of packages) {
    externals[packageName] = `typeof require === 'function' ? require('${packageName}') : null`;
  }
  return externals;
}

const buildConfig = {
  ...getConfig(),
  ...umdWrapper,
  entryPoints: ['./src/index.js'],
  outfile: './dist/index.js',
  sourcemap: true
};

buildConfig.plugins[0] = ext.externalGlobalPlugin(amdRequire(['@jupyter-widgets/base']));

/* global process, console */
const mode = process.argv[2];

if (mode === 'watch') {
  buildConfig.watch = true;
  esbuild.build(buildConfig).then(result => {
    /* eslint-disable no-console */
    console.log('watching...');
  });
} else {
  esbuild.build(buildConfig);
}
