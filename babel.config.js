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
        include: './modules/widgets/**/*.{ts,tsx}',
        presets: [['@babel/typescript', {jsxPragma: 'h'}]],
        plugins: [
          ['@babel/transform-react-jsx', {pragma: 'h'}]
          // 'babel-plugin-transform-redom-jsx',
          // ['@babel/transform-react-jsx', {pragma: 'el'}]
        ]
      }
    ]
  }
});
