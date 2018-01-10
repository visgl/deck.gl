/* global document, window, console */
/* eslint-disable no-console */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {ScatterplotLayer} from 'deck.gl';
import * as d3 from 'd3-ease';

import PointGenerator from './point-generator';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);

    this._pointGenerator = new PointGenerator({
      center: [-122.44, 37.75],
      distance: [0.064, 0.05],
      radiusRange: [5, 100],
      countRange: [1000, 10000]
    });

    this.state = {
      viewport: {
        latitude: 37.75,
        longitude: -122.44,
        zoom: 12,
        width: window.innerWidth,
        height: window.innerHeight
      },
      data: this._pointGenerator.points,
      pointsUpdated: 0,
      radiusUpdated: 0,
      colorsUpdated: 0
    };

    this._onViewportChange = this._onViewportChange.bind(this);
    this._resize = this._resize.bind(this);
    this._randomizeCount = this._randomizeCount.bind(this);
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

  _randomizeCount() {
    this._pointGenerator.randomizeCount();
    this.setState({data: this._pointGenerator.points});
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
    const {viewport, positionsUpdated, radiusUpdated, colorsUpdated} = this.state;

    const layer = new ScatterplotLayer({
      data: this._pointGenerator.points,
      getPosition: d => d.position,
      getColor: d => d.color,
      getRadius: d => d.radius,
      updateTriggers: {
        getPosition: positionsUpdated,
        getRadius: radiusUpdated,
        getColor: colorsUpdated
      },
      transitions: {
        getPosition: {
          duration: 2000,
          easing: d3.easeCubicInOut,
          onStart: evt => console.log('position transition started', evt),
          onEnd: evt => console.log('position transition ended', evt),
          onInterrupt: evt => console.log('position transition interrupted', evt)
        },
        getRadius: 600,
        getColor: 600
      }
    });

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/uberdata/cive48w2e001a2imn5mcu2vrs"
        onViewportChange={this._onViewportChange}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGL {...viewport} layers={[layer]} />
        <div id="control-panel">
          <button onClick={this._randomizeCount}>Randomize All</button>
          <button onClick={this._randomizePositions}>Randomize Positions</button>
          <button onClick={this._randomizeRadius}>Randomize Radius</button>
          <button onClick={this._randomizeColors}>Randomize Colors</button>
        </div>
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
