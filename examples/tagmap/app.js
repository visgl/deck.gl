/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import MAP_STYLE from './style/map-style-dark-v9.json';
import {fromJS} from 'immutable';
// handle ajax call
import axios from 'axios';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const FILE_PATH = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      mapStyle: this._removeLabelFromMapStyle(fromJS(MAP_STYLE))
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

    axios.get(FILE_PATH)
      .then(response => {
        const data = response.data.filter(x => !excludeList.has(x.label)).slice(0, 3000);
        this.setState({data, weightThreshold});
      }).catch(error => {
        throw new Error(error.toString());
      });
  }

  _removeLabelFromMapStyle(mapStyle) {
    const LABEL_REG = /label|place|poi/;
    const layers = mapStyle.get('layers').filter(layer => {
      return !LABEL_REG.test(layer.get('id'));
    });
    return mapStyle.set('layers', layers);
  }

  render() {
    const {viewport, mapStyle, data, weightThreshold} = this.state;

    return (
      <MapGL
        {...viewport}
        mapStyle={mapStyle}
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
