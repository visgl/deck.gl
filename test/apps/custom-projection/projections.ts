// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const projections = {
  mercator: {
    crs: 'EPSG:3857',
    note: 'The familiar web map projection, with increasing scale distortion toward the poles. Latitude clamped to ±85.05°.'
  },
  equalEarth: {
    // EPSG:8857: WGS 84 / Equal Earth Greenwich.
    crs: '+proj=eqearth +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m',
    note: 'A rounded equal-area world map that preserves the relative sizes of continents. Full world extent.'
  },
  equirectangular: {
    crs: '+proj=eqc +R=6371008.8 +units=m',
    note: 'A rectangular map with evenly spaced longitude and latitude lines, stretching shapes near the poles.'
  },
  stereographic: {
    crs: '+proj=stere +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +k=1 +R=6371008.8 +units=m',
    note: 'A view centered on the North Pole that preserves local angles, with increasing scale distortion away from the center. Rendering extent limited to 150° from the center (60°S).'
  }
};

export type ProjectionName = keyof typeof projections;
