const getBabelConfig = require('ocular-dev-tools/config/babel.config');

module.exports = api => {
  return getBabelConfig(api, {
    plugins: [
      'version-inline',
      [
        'remove-glsl-comments',
        {
          patterns: ['**/*.glsl.js']
        }
      ]
    ]
  });
};
