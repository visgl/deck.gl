/* eslint-disable import/no-extraneous-dependencies */
const {getBabelConfig, deepMerge} = require('ocular-dev-tools');

module.exports = api => {
  let config = getBabelConfig(api);

  config = deepMerge(config, {
    plugins: [
      'version-inline',
      'inline-webgl-constants',
      [
        'remove-glsl-comments',
        {
          patterns: ['**/*.glsl.js']
        }
      ]
    ]
  });

  return config;
};
