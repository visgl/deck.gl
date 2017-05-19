/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {COORDINATE_SYSTEM, ScatterplotLayer} from 'deck.gl';

import {json as requestJson} from 'd3-request';
import assert from 'assert';

// URL from this GIST https://gist.github.com/javisantana/68e50e70bf5463dbcaaf205063fcef00
const TORQUE_TILE_SOURCE = 'https://cartocdn-ashbu_b.global.ssl.fastly.net/javi/api/v1/map/168d1645f74d1355a17adc6c341eb5d1:1494934031794/0/17/38597/49256.json.torque'; // eslint-disable-line

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line

const INITIAL_VIEWPORT = {
  latitude: 37.785164,
  longitude: -122.41669,
  zoom: 16.140440,
  bearing: -20.55991,
  pitch: 60
};

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: INITIAL_VIEWPORT,
      width: 0,
      height: 0
    };

    this.loadTorqueTile(TORQUE_TILE_SOURCE);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  loadTorqueTile(url) {
    requestJson(url, (error, response) => {
      if (error) {
        console.error(error); // eslint-disable-line
      } else {
        this.setState({points: this.parseTorqueTile(response)});
      }
    });
  }

  // Parses a torque tile into a linear array of points which is easier for deck.gl to deal with
  // @param {Array} tile - a torque tile is an array of "pixels"
  // @return {Array} - returns an array of points
  parseTorqueTile(tile) {
    assert(Array.isArray(tile), 'Cannot parse torque tile - expected array of pixels');

    const points = [];
    for (const pixel of tile) {
      assert(
        Number.isFinite(pixel.x__uint8) && Number.isFinite(pixel.y__uint8) &&
        Array.isArray(pixel.vals__uint8) && Array.isArray(pixel.dates__uint16) &&
        pixel.vals__uint8.length === pixel.dates__uint16.length,
        'Cannot parse torque tile - expected torque pixel'
      );

      // Generate a linear set of points from the vals and dates arrays
      for (let i = 0; i < pixel.vals__uint8; ++i) {
        points.push({
          position: [pixel.x__uint8, pixel.y__uint8],
          value: pixel.vals__uint8[i],
          time: pixel.dates__uint16[i]
        });
      }
    }
    return points;
  }

  render() {
    const {viewport, width, height} = this.state;

    return (
      <MapGL
        {...viewport}
        width={width}
        height={height}
        perspectiveEnabled
        mapboxApiAccessToken={MAPBOX_TOKEN}
        onChangeViewport={this._onChangeViewport.bind(this)}>
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          debug
          layers={[
            new ScatterplotLayer({
              projectionMode: COORDINATE_SYSTEM.METERS,
              positionOrigin: [INITIAL_VIEWPORT.longitude, INITIAL_VIEWPORT.latitude],
              data: this.state.points,
              getColor: x => x.value === 1 ? [0, 0, 255] : [255, 0, 0],
              getRadius: x => x.value === 1 ? 1 : 3
            })
          ]} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
