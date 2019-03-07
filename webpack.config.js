const getWebpackConfig = require('ocular-dev-tools/config/webpack.config');

module.exports = env => {
  return getWebpackConfig(env);
};
