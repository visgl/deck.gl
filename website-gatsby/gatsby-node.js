// NOTE: It is possible to override the ocular-provided callbacks
// and this take control any aspect of gatsby:

// exports.onCreateNode = ({ node, actions, getNode }) =>
//   ocular.onCreateNode({ node, actions, getNode });

// exports.setFieldsOnGraphQLNodeType = ({ type, actions }) =>
//   ocular.setFieldsOnGraphQLNodeType({ type, actions });

// // This is a main gatsby entry point
// // Here we get to programmatically create pages after all nodes are created
// // by gatsby.
// // We use graphgl to query for nodes and iterate
// exports.createPages = ({ graphql, actions }) =>
//   ocular.createPages({ graphql, actions });

const ocularConfig = require('./ocular-config');
const getGatsbyNodeCallbacks = require('ocular-gatsby/gatsby-node');

const callbacks = getGatsbyNodeCallbacks(ocularConfig);

module.exports = callbacks;

const onCreateWebpackConfig = callbacks.onCreateWebpackConfig;

callbacks.onCreateWebpackConfig = function onCreateWebpackConfigOverride(opts) {
  onCreateWebpackConfig(opts);

  const {
    // stage, // build stage: ‘develop’, ‘develop-html’, ‘build-javascript’, or ‘build-html’
    // rules, // Object (map): set of preconfigured webpack config rules
    // plugins, // Object (map): A set of preconfigured webpack config plugins
    // getConfig, // Function that returns the current webpack config
    loaders, // Object (map): set of preconfigured webpack config loaders
    actions
  } = opts;

  console.log(`App rewriting gatsby webpack config`); // eslint-disable-line

  // Recreate it with custom exclude filter
  // Called without any arguments, `loaders.js` will return an
  // object like:
  // {
  //   options: undefined,
  //   loader: '/path/to/node_modules/gatsby/dist/utils/babel-loader.js',
  // }
  // Unless you're replacing Babel with a different transpiler, you probably
  // want this so that Gatsby will apply its required Babel
  // presets/plugins.  This will also merge in your configuration from
  // `babel.config.js`.
  const newJSRule = loaders.js();

  Object.assign(newJSRule, {
    // JS and JSX
    test: /\.jsx?$/,

    // Exclude all node_modules from transpilation, except for ocular
    exclude: modulePath =>
      /node_modules/.test(modulePath) &&
      !/node_modules\/(ocular|ocular-gatsby|gatsby-plugin-ocular)/.test(modulePath)
  });

  const newConfig = {
    module: {
      rules: [
        // Omit the default rule where test === '\.jsx?$'
        newJSRule
      ]
    },
    node: {
      fs: 'empty'
    },
    resolve: {
      alias: Object.assign(ocularConfig.webpack.resolve.alias)
    }
  };

  // Merges into the webpack config
  actions.setWebpackConfig(newConfig);
};
