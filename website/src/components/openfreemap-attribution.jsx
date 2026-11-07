// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';

export const OPENFREEMAP_ATTRIBUTION_HTML =
  '<a href="https://openfreemap.org/">OpenFreeMap</a> ' +
  '<a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from ' +
  '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const OPENFREEMAP_ATTRIBUTION_STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  zIndex: 1,
  padding: '0 5px',
  background: 'rgba(255,255,255,0.8)',
  color: '#333',
  font: '12px/20px sans-serif'
};

export default function OpenFreeMapAttribution() {
  return (
    <div style={OPENFREEMAP_ATTRIBUTION_STYLE}>
      <a href="https://openfreemap.org/">OpenFreeMap</a>{' '}
      <a href="https://openmaptiles.org/">© OpenMapTiles</a> Data from{' '}
      <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
    </div>
  );
}
