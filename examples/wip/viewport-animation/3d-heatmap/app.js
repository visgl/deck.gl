/* global window,document, setInterval*/
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import MapController from '../../../../src/experimental/react/controllers/map-controller';
// import EventManager from '../../src/controllers/events/event-manager';

import {csv as requestCsv} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv';  // eslint-disable-line

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

    requestCsv(DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => ([Number(d.lng), Number(d.lat)]));
        this.setState({data});
      }
    });
  }

  componentDidMount() {
    // -TODO- : fails to add event handler, verify eventCanvas.
    // const {eventCanvas} = this.refs;
    // const eventManager = new EventManager(eventCanvas);
    // this._eventManager = eventManager;
    // this._eventManager.on('keydown', this._onEvent.bind(this));

    window.addEventListener('resize', this._resize.bind(this));
    this._resize();

    // TODO: this is to just simulate viwport prop change and test animation.
    this._interval = setInterval(() => this._toggleViewport(), 5000);
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

  _onEvent(event) {
    // console.log(`app event.type: ${event.type}`);
  }

  // TODO: this is to just simulate viwport prop change and test animation.
  _toggleViewport() {
    const newViewport = {};
    // console.log(`p: ${this.state.viewport.pitch} b: ${this.state.viewport.bearing}`)
    newViewport.pitch = (this.state.viewport.pitch === 0) ? 60.0 : 0.0;
    newViewport.bearing = (this.state.viewport.bearing === 0) ? -60.0 : 0.0;
    this.setState({
      viewport: {...this.state.viewport, ...newViewport}
    });
  }

  render() {
    const {viewport, data} = this.state;
    // const eventCanvasStyle = {
    //   width: viewport.width,
    //   height: viewport.height,
    //   position: 'relative'
    // };
    return (
      <MapController
      /*
      ref={'eventCanvas'}
      style={eventCanvasStyle}
      */
        {...viewport}
        onViewportChange={this._onViewportChange.bind(this)}
        animateViewport={true}>
        <StaticMap
          {...viewport}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}>
          <DeckGLOverlay
            viewport={viewport}
            data={data || []}
          />
        </StaticMap>
      </MapController>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
