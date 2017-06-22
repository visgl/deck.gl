/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
// handle ajax call
import axios from 'axios';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const filePath = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';

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
    const weightThreshold = 2;

    axios.get(filePath)
      .then(response => {
        const data = response.data.filter(x => !excludeList.has(x.label)).slice(0, 3000);
        this.setState({data, weightThreshold});
      }).catch(error => {
        throw new Error(error.toString());
      });
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
