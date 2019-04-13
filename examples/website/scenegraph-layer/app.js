/* global fetch, setTimeout, clearTimeout */
import React, {Component, Fragment} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {ScenegraphLayer} from 'deck.gl';

import {GLBScenegraphLoader, GLTFScenegraphLoader} from '@luma.gl/addons';
import {registerLoaders} from '@loaders.gl/core';

registerLoaders([GLBScenegraphLoader, GLTFScenegraphLoader]);

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';

const DATA_URL = 'https://opensky-network.org/api/states/all';
const MODEL_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';
const REFRESH_TIME = 30000;

export const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const DATA_INDEX = {
  UNIQUE_ID: 0,
  ORIGIN_COUNTRY: 2,
  LONGITUDE: 5,
  LATITUDE: 6,
  BARO_ALTITUDE: 7,
  VELOCITY: 9,
  TRUE_TRACK: 10,
  VERTICAL_RATE: 11,
  GEO_ALTITUDE: 13,
  POSITION_SOURCE: 16
};

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this._loadData();
  }

  componentWillUnmount() {
    this.unmounted = true;
    if (this.state.nextTimeoutId) {
      clearTimeout(this.state.nextTimeoutId);
    }
  }

  _sort(data, oldData) {
    // In order to keep the animation smooth we need to always return the same
    // objects in the exact same order. This function will discard new objects
    // and only update existing ones.
    if (!oldData) {
      return data;
    }

    const dataAsObj = {};
    data.forEach(entry => (dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] = entry));
    return oldData.map(entry => dataAsObj[entry[DATA_INDEX.UNIQUE_ID]] || entry);
  }

  _loadData() {
    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(resp => {
        if (resp && resp.states && !this.unmounted) {
          const nextTimeoutId = setTimeout(() => this._loadData(), REFRESH_TIME);
          this.setState({data: this._sort(resp.states, this.state.data), nextTimeoutId});
        }
      });
  }

  _verticalRateToAngle(object) {
    // Return: -90 looking up, +90 looking down
    const verticalRate = object[DATA_INDEX.VERTICAL_RATE] || 0;
    const velocity = object[DATA_INDEX.VELOCITY] || 0;
    return (-Math.atan2(verticalRate, velocity) * 180) / Math.PI;
  }

  _renderLayers() {
    const {data} = this.state;

    if (Array.isArray(data)) {
      return [
        new ScenegraphLayer({
          id: 'scenegraph-layer',
          data,
          pickable: true,
          sizeScale: 20,
          scenegraph: MODEL_URL,
          getPosition: d => [
            d[DATA_INDEX.LONGITUDE] || 0,
            d[DATA_INDEX.LATITUDE] || 0,
            d[DATA_INDEX.GEO_ALTITUDE] || 0
          ],
          getOrientation: d => [
            this._verticalRateToAngle(d),
            // TODO: Fix this direction
            (d[DATA_INDEX.TRUE_TRACK] || 0) - 180,
            90
          ],
          getTranslation: [0, 0, 0],
          getScale: [1, 1, 1],
          transitions: {
            getPosition: REFRESH_TIME * 0.9
          },
          onHover: ({object}) => this.setState({hoverObject: object})
        })
      ];
    }

    return [];
  }

  _renderHoverObject() {
    const [icao24 = '', callsign = '', originCountry = ''] = this.state.hoverObject;
    const verticalRate = this.state.hoverObject[DATA_INDEX.VERTICAL_RATE] || 0;
    const velocity = this.state.hoverObject[DATA_INDEX.VELOCITY] || 0;
    const track = this.state.hoverObject[DATA_INDEX.TRUE_TRACK] || 0;
    return (
      <Fragment>
        <div>Unique ID: {icao24}</div>
        <div>Call Sign: {callsign}</div>
        <div>Country: {originCountry}</div>
        <div>Vertical Rate: {verticalRate} m/s</div>
        <div>Velocity: {velocity} m/s</div>
        <div>Direction: {track}</div>
      </Fragment>
    );
  }

  _renderInfoBox() {
    return (
      <div
        style={{
          position: 'fixed',
          right: 8,
          top: 8,
          width: 140,
          background: 'rgba(0,0,255,0.3)',
          borderRadius: 8,
          color: 'white',
          padding: 8,
          fontSize: 12
        }}
      >
        Data provided by{' '}
        <a
          style={{color: 'white'}}
          href="http://www.opensky-network.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          The OpenSky Network, http://www.opensky-network.org
        </a>
        {this.state.hoverObject && this._renderHoverObject()}
      </div>
    );
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <Fragment>
        <DeckGL
          layers={this._renderLayers()}
          initialViewState={INITIAL_VIEW_STATE}
          viewState={viewState}
          controller={controller}
        >
          {baseMap && (
            <StaticMap
              reuseMaps
              mapStyle={MAPBOX_STYLE}
              preventStyleDiffing={true}
              mapboxApiAccessToken={MAPBOX_TOKEN}
            />
          )}
        </DeckGL>
        {/* this._renderInfoBox() */}
      </Fragment>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
