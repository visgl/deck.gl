/* eslint-disable max-len */
/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const FILE_PATH = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags100k.json';
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';

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
    // set data in component state
    this._loadData();
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
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
    const excludeList = new Set(['#hiring', '#job', '#jobs', '#careerarc', '#career', '#photo']);

    requestJson(FILE_PATH, (error, response) => {
      if (!error) {
        const data = response.filter(x => !excludeList.has(x.label));
        this.setState({data});
      } else {
        throw new Error(error.toString());
      }
    });
  }

  render() {
    const {viewport, data} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle={MAPBOX_STYLE}
        preventStyleDiffing={true}
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGLOverlay viewport={viewport} data={data} fontSize={32} cluster={true} />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
