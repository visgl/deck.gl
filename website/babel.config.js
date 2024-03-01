module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    // Ensure consistently hashed component classNames between environments (a must for SSR)
    'styled-components'
  ]
};
