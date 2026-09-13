// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GridLayer} from '@deck.gl/aggregation-layers';
import {DeckGL} from '@deck.gl/react';
import {Map} from 'react-map-gl/maplibre';
import {colorRange} from 'website-examples/3d-heatmap/app';

import {MAPBOX_STYLES, DATA_URI, GITHUB_TREE} from '../constants/defaults';
import {makeExample} from '../components';
import {readableInteger} from '../utils/format-utils';

const INITIAL_VIEW_STATE = {
  longitude: -1.415727,
  latitude: 52.232395,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

class GridDemo extends Component {
  static title = 'United Kingdom Road Safety';

  static hasDeviceTabs = true;

  static data = {
    url: `${DATA_URI}/heatmap-data.txt`,
    worker: '/workers/heatmap-data-decoder.js'
  };

  static code = `${GITHUB_TREE}/website/src/examples/grid-layer.js`;

  static parameters = {
    cellSize: {
      displayName: 'Cell Size',
      type: 'range',
      value: 2000,
      step: 100,
      min: 500,
      max: 20000
    },
    coverage: {displayName: 'Coverage', type: 'range', value: 0.7, step: 0.1, min: 0, max: 1},
    upperPercentile: {
      displayName: 'Upper Percentile',
      type: 'range',
      value: 100,
      step: 0.1,
      min: 80,
      max: 100
    }
  };

  static mapStyle = MAPBOX_STYLES.DARK;

  static renderInfo(meta) {
    return (
      <div>
        <p>Personal injury road accidents in Great Britain from 1979.</p>
        <p>The layer aggregates accidents within each grid cell.</p>
        <div className="layout">
          {colorRange.map((color, index) => (
            <div
              key={index}
              className="legend"
              style={{
                background: `rgb(${color.join(',')})`,
                width: `${100 / colorRange.length}%`
              }}
            />
          ))}
        </div>
        <p className="layout">
          <span className="col-1-2">Fewer Accidents</span>
          <span className="col-1-2 text-right">More Accidents</span>
        </p>
        <p>
          Data source: <a href="https://data.gov.uk">DATA.GOV.UK</a>
        </p>
        <div className="stat">
          Accidents<b>{readableInteger(meta.count || 0)}</b>
        </div>
      </div>
    );
  }

  render() {
    const {data, device, mapStyle, params} = this.props;

    const layer = new GridLayer({
      id: 'grid-layer',
      data,
      gpuAggregation: true,
      cellSize: params.cellSize.value,
      colorRange,
      coverage: params.coverage.value,
      upperPercentile: params.upperPercentile.value,
      elevationRange: [0, 3000],
      elevationScale: data?.length ? 50 : 0,
      extruded: true,
      getPosition: position => position,
      pickable: true,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51]
      }
    });

    return (
      <DeckGL
        device={device}
        layers={[layer]}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip={({object}) => object && `${object.count} accidents`}
      >
        <Map reuseMaps mapStyle={mapStyle} />
      </DeckGL>
    );
  }
}

export default makeExample(GridDemo);
