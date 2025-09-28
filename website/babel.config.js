// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

module.exports = {
  presets: [require.resolve('@docusaurus/core/lib/babel/preset')],
  plugins: [
    // Ensure consistently hashed component classNames between environments (a must for SSR)
    'styled-components'
  ]
};
