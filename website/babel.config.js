module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
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
