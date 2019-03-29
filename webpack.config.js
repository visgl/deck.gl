const getWebpackConfig = require('ocular-dev-tools/config/webpack.config');

module.exports = env => {
  const config = getWebpackConfig(env);
  // Object.assign(config.aliases, {
  // 	'@luma.gl/core': '../luma.gl/modules/core/src',
  // 	'@luma.gl/webgl': '../luma.gl/modules/webgl/src',
  // 	'@luma.gl/webgl-state-tracker': '../luma.gl/modules/webgl-state-tracker/src',
  // 	'@luma.gl/webgl2-polyfill': '../luma.gl/modules/webgl2-polyfill/src'
  // });
  return config;
};
