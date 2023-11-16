module.exports = {
  presets: [
    require.resolve('@docusaurus/core/lib/babel/preset'),
    ['@babel/preset-typescript', {allowDeclareFields: true}]
  ],
  plugins: [
    'version-inline',
    'inline-webgl-constants',
    [
      'remove-glsl-comments',
      {
        patterns: ['**/*.glsl.js', '**/*.glsl.ts']
      }
    ],
    // Ensure consistently hashed component classNames between environments (a must for SSR)
    'styled-components'
  ]
};
