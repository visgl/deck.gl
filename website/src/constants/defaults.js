// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import lightStyle from '../../static/mapstyle/deck-light.json';
import darkStyle from '../../static/mapstyle/deck-dark.json';

export const MAPBOX_STYLES = {
  LIGHT: lightStyle,
  LIGHT_LABEL: 'https://tiles.openfreemap.org/styles/positron',
  DARK: darkStyle,
  DARK_LABEL: 'https://tiles.openfreemap.org/styles/dark',
  BLANK: {
    version: 8,
    sources: {},
    layers: []
  }
};

export const DATA_URI = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website';
export const GITHUB_TREE = 'https://github.com/visgl/deck.gl/tree/master';
