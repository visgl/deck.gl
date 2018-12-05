/* global document */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {
  COORDINATE_SYSTEM,
  MapView,
  ScatterplotLayer,
  PolygonLayer,
  MapController
} from 'deck.gl';

import DataGenerator from './data-generator';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const MAP_CENTER = [-122.45, 37.78];

class Root extends Component {
  constructor(props) {
    super(props);

    this._dataGenerator = new DataGenerator();

    this.state = {
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons,
      viewState: {
        longitude: MAP_CENTER[0],
        latitude: MAP_CENTER[1],
        zoom: 10
      }
    };

    this._randomize = this._randomize.bind(this);
  }

  _randomize() {
    this._dataGenerator.randomize();
    this.setState({
      points: this._dataGenerator.points,
      polygons: this._dataGenerator.polygons
    });
  }

  render() {
    const {points, polygons, viewState} = this.state;

    const layers = [
      new ScatterplotLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: MAP_CENTER,
        data: points,
        getPosition: d => d.position,
        getColor: d => d.color,
        getRadius: d => d.radius,
        transitions: {
          getPosition: 600,
          getRadius: 600,
          getColor: 600
        }
      }),
      new PolygonLayer({
        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        coordinateOrigin: MAP_CENTER,
        data: polygons,
        stroked: true,
        filled: true,
        getPolygon: d => d.polygon,
        getLineColor: d => d.color,
        getFillColor: d => [d.color[0], d.color[1], d.color[2], 128],
        getLineWidth: d => d.width,
        transitions: {
          getPolygon: 600,
          getLineColor: 600,
          getFillColor: 600,
          getLineWidth: 600
        }
      })
    ];

    return (
      <div>
        <DeckGL
          views={new MapView({id: 'map'})}
          controller={MapController}
          viewState={viewState}
          onViewStateChange={evt => this.setState({viewState: evt.viewState})}
          layers={layers}
        >
          <StaticMap
            viewId="map"
            {...viewState}
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        </DeckGL>
        <div id="control-panel">
          <button onClick={this._randomize}>Randomize</button>
        </div>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
