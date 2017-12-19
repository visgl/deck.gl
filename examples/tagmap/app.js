/* eslint-disable max-len */
/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {fromJS} from 'immutable';
import Stats from 'stats.js';
import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// sample data
const FILE_PATH = 'https://rivulet-zhang.github.io/dataRepo/tagmap/hashtags10k.json';
// mapbox style file path
const MAPBOX_STYLE_FILE =
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
    this._loadMapStyle();
  }

  // use this instead of componentDidMount to avoid pickingFBO incorrect size issue
  componentWillMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  componentDidMount() {
    // set data in component state
    this._loadData();

    this._stats = new Stats();
    this._stats.showPanel(0);
    this.fps.appendChild(this._stats.dom);

    const calcFPS = () => {
      this._stats.begin();
      this._stats.end();
      this._animateRef = window.requestAnimationFrame(calcFPS);
    };

    this._animateRef = window.requestAnimationFrame(calcFPS);
  }

  componentWillUnmount() {
    if (this._animateRef) {
      window.cancelAnimationFrame(this._animateRef);
    }
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
    const weightThreshold = 1;

    requestJson(FILE_PATH, (error, response) => {
      if (!error) {
        const data = response.filter(x => !excludeList.has(x.label)).slice(0, 1000);
        this.setState({data, weightThreshold});
      } else {
        throw new Error(error.toString());
      }
    });
  }

  _loadMapStyle() {
    requestJson(MAPBOX_STYLE_FILE, (error, response) => {
      if (!error) {
        const mapStyle = fromJS(response);
        this.setState({mapStyle});
      } else {
        throw new Error(error.toString());
      }
    });
  }

  render() {
    const {viewport, mapStyle, data, weightThreshold} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <DeckGLOverlay viewport={viewport} data={data} weightThreshold={weightThreshold} />
        </MapGL>
        <div ref={c => (this.fps = c)} className="fps" />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
