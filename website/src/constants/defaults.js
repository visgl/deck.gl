import {withPrefix} from 'gatsby';

export const MAPBOX_STYLES = {
  LIGHT: withPrefix('/mapstyle/deck-light.json'),
  LIGHT_LABEL: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  DARK: withPrefix('/mapstyle/deck-dark.json'),
  BLANK: {
    version: 8, 
    sources: {},
    layers: []
  }
};

export const DATA_URI = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website';
export const GITHUB_TREE = 'https://github.com/visgl/deck.gl/tree/master';
