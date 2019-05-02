/* eslint-disable import/no-extraneous-dependencies */
const getBabelConfig = require('ocular-dev-tools/config/babel.config');

module.exports = api => {
  const config = getBabelConfig(api);

  config.plugins.push('version-inline', 'inline-webgl-constants', [
    'remove-glsl-comments',
    {
      patterns: ['**/*.glsl.js']
    }
  ]);

  return config;
};
