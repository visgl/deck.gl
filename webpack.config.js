// const {getWebpackConfig} = require('ocular-dev-tools');

// module.exports = env => {
//   const config = getWebpackConfig(env);
//   // Unfortunately, ocular-dev-tool swallows logs...
//   require('fs').writeFileSync('/tmp/ocular.log', JSON.stringify(config, null, 2));
//   return config;
// };
/* eslint-disable import/no-extraneous-dependencies */
const {getWebpackConfig} = require('ocular-dev-tools');

module.exports = (env = {}) => {
  let config = getWebpackConfig(env);

  config.devtool = 'source-map';

  // Enable SharedArrayBuffer in wasm
  // config.devServer = config.devServer || {};
  // config.devServer.headers = config.devServer.headers || {};
  // config.devServer.headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
  // config.devServer.headers['Cross-Origin-Opener-Policy'] = 'same-origin';

  config = addBabelSettings(config);
  config.module.rules.push({
    // Load worker tests
    test: /\.worker\.js$/,
    loader: 'worker-loader'
  });
  // config.module.rules.push({
  //   test: /\.wasm$/,
  //   loaders: ['base64-loader'],
  //   type: 'javascript/auto'
  // });
  // Look for babel plugin
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  const babelRule = config.module.rules.find(rule => rule.loader === 'babel-loader');

  // If found, inject excludes in @babel/present-env to prevent transpile
  if (babelRule && babelRule.options && babelRule.options.presets) {
    babelRule.options.presets = babelRule.options.presets.map(preset => {
      if (preset === '@babel/preset-env') {
        return [
          '@babel/preset-env',
          {
            exclude: [/transform-async-to-generator/, /transform-regenerator/]
          }
        ];
      }
      return preset;
    });
  }

  // Log regex
  // eslint-disable-next-line
  Object.defineProperty(RegExp.prototype, 'toJSON', {
    value: RegExp.prototype.toString
  });

  // Uncomment to debug config
  // console.warn(JSON.stringify(config, null, 2));

  return [config];
};

function makeBabelRule() {
  return {
    // Compile source using babel
    test: /(\.js|\.ts|\.tsx)$/,
    loader: 'babel-loader',
    include: [/modules\/.*\/src/, /modules\/.*\/test/],
    exclude: [/node_modules/],
    options: {
      presets: [
        '@babel/preset-react',
        '@babel/preset-typescript',
        [
          '@babel/preset-env',
          {
            exclude: [/transform-async-to-generator/, /transform-regenerator/]
          }
        ]
      ],
      plugins: ['@babel/plugin-proposal-class-properties']
    }
  };
}

function addBabelSettings(config) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules.filter(r => r.loader !== 'babel-loader'),
        makeBabelRule(),
        // See https://github.com/apollographql/apollo-link-state/issues/302
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    },
    resolve: {
      ...config.resolve,
      extensions: ['.ts', '.tsx', '.js', '.json']
    }
  };
}
