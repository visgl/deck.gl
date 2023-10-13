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
    ],
    overrides: [
      {
        include: './modules/widgets/**/*.tsx',
        // Parse preact-style JSX in @deck.gl/widgets.
        presets: [['@babel/typescript', {jsxPragma: 'h'}]],
        plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'h'}]]
      }
    ]
  }
});
