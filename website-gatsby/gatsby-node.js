const resolve = require('path').resolve;
const getOcularConfig = require('ocular-dev-tools/config/ocular.config');
const webpack = require('webpack');

module.exports.onCreateWebpackConfig = function onCreateWebpackConfigOverride(opts) {
  const {
    stage, // build stage: ‘develop’, ‘develop-html’, ‘build-javascript’, or ‘build-html’
    // rules, // Object (map): set of preconfigured webpack config rules
    // plugins, // Object (map): A set of preconfigured webpack config plugins
    getConfig, // Function that returns the current webpack config
    // loaders, // Object (map): set of preconfigured webpack config loaders
    actions
  } = opts;

  console.log(`App rewriting gatsby webpack config ${stage}`); // eslint-disable-line

  const ALIASES = getOcularConfig({root: resolve(__dirname, '..')}).aliases;

  const config = getConfig();
  config.resolve = config.resolve || {};
  config.resolve.alias = Object.assign({
    'website-examples': resolve('../examples/website'),
    react: resolve('node_modules/react'),
    'react-dom': resolve('node_modules/react-dom'),
    'styletron-engine-atomic': resolve('node_modules/styletron-engine-atomic'),
    'styletron-react': resolve('node_modules/styletron-react'),

    '@luma.gl/constants': resolve('../node_modules/@luma.gl/constants'),
    '@luma.gl/core': resolve('../node_modules/@luma.gl/core'),
    '@luma.gl/engine': resolve('../node_modules/@luma.gl/engine'),
    '@luma.gl/webgl': resolve('../node_modules/@luma.gl/webgl'),
    '@luma.gl/gltools': resolve('../node_modules/@luma.gl/gltools'),
    '@luma.gl/shadertools': resolve('../node_modules/@luma.gl/shadertools'),
    '@luma.gl/experimental': resolve('../node_modules/@luma.gl/experimental'),

    '@loaders.gl/core': resolve('../node_modules/@loaders.gl/core'),
    '@loaders.gl/images': resolve('../node_modules/@loaders.gl/images')
  }, config.resolve.alias, ALIASES);

  config.plugins = config.plugins || [];
  config.plugins.push(new webpack.EnvironmentPlugin(['MapboxAccessToken']));

  // Completely replace the webpack config for the current stage.
  // This can be dangerous and break Gatsby if certain configuration options are changed.
  // Generally only useful for cases where you need to handle config merging logic yourself,
  // in which case consider using webpack-merge.
  actions.replaceWebpackConfig(config);
};
