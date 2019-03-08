const getBabelConfig = require('ocular-dev-tools/config/babel.config');

module.exports = api => {
  const config = getBabelConfig(api);

  config.plugins.push('version-inline', [
    'remove-glsl-comments',
    {
      patterns: ['**/*.glsl.js']
    }
  ]);

  return config;
};
