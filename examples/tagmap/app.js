/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
// load json file
import {default as tags} from './data/hashtags10k.json';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    // set data in component state
    this._loadData();
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

  _loadData() {
    // remove high-frequency terms
    const excludeList = new Set(['#hiring', '#job', '#jobs', '#careerarc', '#career']);
    const data = tags.filter(x => !excludeList.has(x.label)).slice(0, 3000);
    const weightThreshold = 2;
    this.setState({data, weightThreshold});
  }

  render() {
    const {viewport, data, weightThreshold} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}>
        <DeckGLOverlay
          viewport={viewport}
          data={data}
          weightThreshold={weightThreshold}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
