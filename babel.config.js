/* eslint-disable import/no-extraneous-dependencies */
const {getBabelConfig} = require('ocular-dev-tools/configuration');

module.exports = getBabelConfig({
  react: true,
  overrides: {
    plugins: [
      'version-inline',
      'inline-webgl-constants',
      [
        'remove-glsl-comments',
        {
          patterns: ['**/*.glsl.js', '**/*.glsl.ts']
        }
      ]
    ]
  }
});
