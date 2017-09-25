/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {ScatterplotLayer} from 'deck.gl';

import PointGenerator from './point-generator';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);

    this._pointGenerator = new PointGenerator({
      center: [-122.45, 37.75],
      distanceRange: [0, 0.05],
      radiusRange: [5, 100],
      count: 10000
    });

    this.state = {
      viewport: {
        latitude: 37.75,
        longitude: -122.45,
        zoom: 12
      },
      width: window.innerWidth,
      height: window.innerHeight,
      data: this._pointGenerator.points,
      pointsUpdated: 0,
      radiusUpdated: 0,
      colorsUpdated: 0
    };

    this._onViewportChange = this._onViewportChange.bind(this);
    this._resize = this._resize.bind(this);
    this._randomizePositions = this._randomizePositions.bind(this);
    this._randomizeRadius = this._randomizeRadius.bind(this);
    this._randomizeColors = this._randomizeColors.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _randomizePositions() {
    this._pointGenerator.randomizePositions();
    this.setState({positionsUpdated: Date.now()});
  }

  _randomizeRadius() {
    this._pointGenerator.randomizeRadius();
    this.setState({radiusUpdated: Date.now()});
  }

  _randomizeColors() {
    this._pointGenerator.randomizeColors();
    this.setState({colorsUpdated: Date.now()});
  }

  render() {
    const {viewport, width, height, data,
      positionsUpdated, radiusUpdated, colorsUpdated} = this.state;

    const layer = new ScatterplotLayer({
      data,
      getPosition: d => d.position,
      getColor: d => d.color,
      getRadius: d => d.radius,
      updateTriggers: {
        getPosition: positionsUpdated,
        getRadius: radiusUpdated,
        getColor: colorsUpdated
      },
      animation: {
        getPosition: {duration: 2000},
        getRadius: {duration: 600},
        getColor: {duration: 600}
      }
    });

    return (
      <MapGL
        {...viewport}
        width={width}
        height={height}
        onViewportChange={this._onViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          layers={[layer]} />
        <div id="control-panel">
          <button onClick={this._randomizePositions}>Randomize Positions</button>
          <button onClick={this._randomizeRadius}>Randomize Radius</button>
          <button onClick={this._randomizeColors}>Randomize Colors</button>
        </div>
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
