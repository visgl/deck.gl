const {resolve} = require('path');
const webpack = require('webpack');
const {getOcularConfig} = require('ocular-dev-tools');
const ALIASES = getOcularConfig({
  aliasMode: 'src',
  root: resolve(__dirname, '..')
}).aliases;

const PACKAGE_ROOT = resolve('.');
const PACKAGE_INFO = require(resolve(PACKAGE_ROOT, 'package.json'));

/**
 * peerDependencies are excluded using `externals`
 * https://webpack.js.org/configuration/externals/
 * e.g. @deck.gl/core is not bundled with @deck.gl/geo-layers
 */
function getExternals(packageInfo) {
  let externals = {
    // Hard coded externals
    'h3-js': 'h3'
  };
  const {peerDependencies = {}} = packageInfo;

  for (const depName in peerDependencies) {
    if (depName.startsWith('@deck.gl')) {
      // Instead of bundling the dependency, import from the global `deck` object
      externals[depName] = 'deck';
    }
  }

  if (externals['@deck.gl/core']) {
    // Do not bundle luma.gl if `core` is peer dependency
    externals['@luma.gl/core'] = 'luma';
  }

  return externals;
}

const config = {
  mode: 'production',

  entry: {
    main: resolve('./bundle.ts')
  },

  output: {
    libraryTarget: 'umd',
    path: PACKAGE_ROOT,
    filename: 'dist.min.js',
    library: 'deck'
  },

  resolve: {
    alias: ALIASES,
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        // Compile ES2015 using babel
        test: /(\.js|\.ts|\.tsx)$/,
        loader: 'babel-loader',
        include: [/src/, /bundle/, /esm/],
        options: {
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-env', {
              targets: ["supports webgl", "not dead"]
            }]
          ],
          // all of the helpers will reference the module @babel/runtime to avoid duplication
          // across the compiled output.
          plugins: [
            '@babel/transform-runtime',
            'inline-webgl-constants',
            ['remove-glsl-comments', {patterns: ['**/*.glsl.js']}]
          ]
        }
      }
    ]
  },

  externals: getExternals(PACKAGE_INFO),

  plugins: [
    // This is used to define the __VERSION__ constant in core/lib/init.js
    // babel-plugin-version-inline uses the package version from the working directory
    // Therefore we need to manually import the correct version from the core
    // This is called in prepublishOnly, after lerna bumps the package versions
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(PACKAGE_INFO.version)
    })
    // Uncomment for bundle size debug
    // ,new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()
  ],

  node: false,

  devtool: false
};

module.exports = (env = {}) => {
  // console.log(JSON.stringify(env, null, 2));

  if (env.dev) {
    // Set development mode (no minification)
    config.mode = 'development';
    // Remove .min from the name
    config.output.filename = 'dist/dist.dev.js';
    // Disable transpilation
    config.module.rules = [];
  }

  // NOTE uncomment to display config
  // console.log('webpack config', JSON.stringify(config, null, 2));

  return config;
};
