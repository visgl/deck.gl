// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {MVT2DLayer} from '@deck.gl/geo-layers';
import {MVTLoader} from '@loaders.gl/mvt';
import {makeLayerDemo} from './demo-base';
import {GITHUB_TREE} from '../constants/defaults';

/** Standard MVT styling demo backed by the new tile layer's canonical decoder. */
const Demo = makeLayerDemo({
  Layer: MVT2DLayer,
  mapStyle: null,
  sourceLink: `${GITHUB_TREE}/website/src/doc-demos/mvt-2d-layer.js`,
  imports: {MVTLoader},
  getTooltip: '({object}) => object && (object.properties.name || object.properties.layerName)',
  props: `{
    data: 'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt',
    minZoom: 0,
    maxZoom: 14,
    loaders: [MVTLoader],
    loadOptions: {worker: false},
    stroked: false,
    getFillColor: feature => {
      switch (feature.properties.layerName) {
        case 'water': return [125, 174, 196];
        case 'building': return [207, 190, 167];
        default: return [238, 237, 230];
      }
    },
    getLineColor: [65, 80, 85],
    lineWidthMinPixels: 1,
    getPointRadius: 2,
    pointRadiusUnits: 'pixels',
    pickable: true
  }`
});

/** Displays the new MVT decoder with visible source attribution and a repository source link. */
export function MVT2DLayerDemo() {
  return (
    <div style={{position: 'relative'}}>
      <Demo />
      <div style={{position: 'absolute', bottom: 32, left: 8, padding: '2px 4px', fontSize: 10, background: 'var(--ifm-background-surface-color)'}}>
        {'© '}<a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>
        {', © '}<a href="https://carto.com/attribution/">CARTO</a>
      </div>
    </div>
  );
}
