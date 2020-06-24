import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {MapView} from '@deck.gl/core';
import RangeInput from './range-input';
import memoizeOne from 'memoize-one';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-web/kepler.gl-data/master/earthquakes/data.csv'; // eslint-disable-line

// This is only needed for this particular dataset - the default view assumes
// that the furthest geometries are on the ground. Because we are drawing the
// circles at the depth of the earthquakes, i.e. below sea level, we need to
// push the far plane away to avoid clipping them.
const MAP_VIEW = new MapView({
  // 1 is the distance between the camera and the ground
  farZMultiplier: 100
});

const INITIAL_VIEW_STATE = {
  latitude: 36.5,
  longitude: -120,
  zoom: 5.5,
  pitch: 0,
  bearing: 0
};

const MS_PER_DAY = 8.64e7;

const dataFilter = new DataFilterExtension({
  filterSize: 1,
  // Enable for higher precision, e.g. 1 second granularity
  // See DataFilterExtension documentation for how to pick precision
  fp64: false
});

const getTimeRange = memoizeOne(data => {
  if (!data) {
    return null;
  }
  return data.reduce(
    (range, d) => {
      const t = d.timestamp;
      range[0] = Math.min(range[0], t);
      range[1] = Math.max(range[1], t);
      return range;
    },
    [Infinity, -Infinity]
  );
});

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filterValue: null,
      hoveredObject: null
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderLayers() {
    const {data} = this.props;
    const filterValue = this.state.filterValue || getTimeRange(data);

    return [
      data &&
        new ScatterplotLayer({
          id: 'earthquakes',
          data,
          opacity: 0.8,
          radiusScale: 100,
          radiusMinPixels: 1,
          wrapLongitude: true,

          getPosition: d => [d.longitude, d.latitude, -d.depth * 1000],
          getRadius: d => Math.pow(2, d.magnitude),
          getFillColor: d => {
            const r = Math.sqrt(Math.max(d.depth, 0));
            return [255 - r * 15, r * 5, r * 10];
          },

          getFilterValue: d => d.timestamp,
          filterRange: [filterValue[0], filterValue[1]],
          filterSoftRange: [
            filterValue[0] * 0.9 + filterValue[1] * 0.1,
            filterValue[0] * 0.1 + filterValue[1] * 0.9
          ],
          extensions: [dataFilter],

          pickable: true,
          onHover: this._onHover
        })
    ];
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;
    return (
      hoveredObject && (
        <div className="tooltip" style={{top: y, left: x}}>
          <div>
            <b>Time: </b>
            <span>{new Date(hoveredObject.timestamp).toUTCString()}</span>
          </div>
          <div>
            <b>Magnitude: </b>
            <span>{hoveredObject.magnitude}</span>
          </div>
          <div>
            <b>Depth: </b>
            <span>{hoveredObject.depth} km</span>
          </div>
        </div>
      )
    );
  }

  _formatLabel(t) {
    const date = new Date(t);
    return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}`;
  }

  render() {
    const {mapStyle = 'mapbox://styles/mapbox/light-v9', data} = this.props;
    const timeRange = getTimeRange(data);
    const filterValue = this.state.filterValue || timeRange;

    return (
      <>
        <DeckGL
          views={MAP_VIEW}
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
        >
          <StaticMap
            reuseMaps
            mapStyle={mapStyle}
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />

          {this._renderTooltip}
        </DeckGL>

        {timeRange && (
          <RangeInput
            min={timeRange[0]}
            max={timeRange[1]}
            value={filterValue}
            animationSpeed={MS_PER_DAY * 30}
            formatLabel={this._formatLabel}
            onChange={value => this.setState({filterValue: value})}
          />
        )}
      </>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(row => ({
        timestamp: new Date(`${row.DateTime} UTC`).getTime(),
        latitude: Number(row.Latitude),
        longitude: Number(row.Longitude),
        depth: Number(row.Depth),
        magnitude: Number(row.Magnitude)
      }));
      render(<App data={data} />, container);
    }
  });
}
