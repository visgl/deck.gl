/* global window,document, setInterval*/
import React, {Component} from 'react';
import {render} from 'react-dom';
// import MapGL from 'react-map-gl';
import {StaticMap} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import MapController from '../../../../src/experimental/react/controllers/map-controller';
// import EventManager from '../../src/controllers/events/event-manager';

import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/geojson/vancouver-blocks.json'; // eslint-disable-line

const colorScale = r => [r * 255, 140, 200 * (1 - r)];

// viewport animation easing function
const easeInOutElastic = t => ((t -= 0.5) < 0 ?
  (0.01 + 0.01 / t) * Math.sin(50 * t) :
  (0.02 - 0.01 / t) * Math.sin(50 * t) + 1);

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null
    };

    requestJson(DATA_URL, (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    // this is to just simulate viwport prop change and test animation.
    this._interval = setInterval(() => this._toggleViewport(), 7000);
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

  // this is to just simulate viwport prop change and test animation.
  _toggleViewport() {
    const newViewport = {};
    // console.log(`bearing: ${this.state.viewport.bearing}`)
    newViewport.pitch = (this.state.viewport.pitch === 0) ? 60.0 : 10.0;
    newViewport.bearing = (this.state.viewport.bearing === 0) ? 90.0 : 10.0;
    this.setState({
      viewport: {...this.state.viewport, ...newViewport}
    });
  }

  render() {
    const {viewport, data} = this.state;

    return (
      <MapController
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        animateViewport={true}
        viewportAnimateDuration={4000}
        viewportAnimationEasingFunc={easeInOutElastic}>
        <StaticMap
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay
            viewport={viewport}
            data={data}
            colorScale={colorScale}/>
        </StaticMap>
      </MapController>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
