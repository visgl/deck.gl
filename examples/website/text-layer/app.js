/* eslint-disable max-len */
/* global document, fetch, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL, {TextLayer} from 'deck.gl';
import {setParameters} from 'luma.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// mapbox style file path
const MAPBOX_STYLE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';
// sample data
const DATA_URL = 'https://rivulet-zhang.github.io/dataRepo/text-layer/hashtagsOneDayWithTime.json';
const SECONDS_PER_DAY = 24 * 60 * 60;
// visualize data within in the time window of [current - TIME_WINDOW, current + TIME_WINDOW]
const TIME_WINDOW = 2;
const TEXT_COLOR = [255, 200, 0];

const INITIAL_VIEW_STATE = {
  latitude: 39.1,
  longitude: -94.57,
  zoom: 3.8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: INITIAL_VIEW_STATE
    };

    if (!window.demoLauncherActive) {
      this._loadData();
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._loadData();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _loadData() {
    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(resp => {
        // each entry in the data object contains all tweets posted at that second
        const data = Array.from({length: SECONDS_PER_DAY}, () => []);
        resp.forEach(val => {
          const second = parseInt(val.time, 10) % SECONDS_PER_DAY;
          data[second].push(val);
        });
        this.setState({data});
        window.requestAnimationFrame(this._animateData.bind(this));
      });
  }

  _animateData() {
    const {data} = this.state;
    const now = Date.now();
    const getSecCeil = ms => Math.ceil(ms / 1000, 10) % SECONDS_PER_DAY;
    const getSecFloor = ms => Math.floor(ms / 1000, 10) % SECONDS_PER_DAY;
    const timeWindow = [
      getSecCeil(now - TIME_WINDOW * 1000),
      getSecFloor(now + TIME_WINDOW * 1000)
    ];
    if (data) {
      let dataSlice = [];
      for (let i = timeWindow[0]; i <= timeWindow[1]; i++) {
        if (i >= 0 && i < data.length) {
          const slice = data[i].map(val => {
            const offset = Math.abs(getSecFloor(now) + (now % 1000) / 1000 - i) / TIME_WINDOW;
            // use non-linear function to achieve smooth animation
            const opac = Math.cos(offset * Math.PI / 2);
            const color = [...TEXT_COLOR, opac * 255];
            return Object.assign({}, val, {color}, {size: 12 * (opac + 1)});
          });
          dataSlice = [...dataSlice, ...slice];
        }
      }
      this.setState({dataSlice});
    }

    this._animationFrame = window.requestAnimationFrame(this._animateData.bind(this));
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }

  render() {
    const {viewport, dataSlice} = this.state;
    const {data} = this.props;

    const layers = [
      new TextLayer({
        id: 'hashtag-layer',
        data,
        sizeScale: 8,
        getColor: d => d.color,
        getSize: d => d.size
      })
    ];

    return (
      <MapGL
        {...viewport}
        mapStyle={MAPBOX_STYLE}
        preventStyleDiffing={true}
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
      </MapGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
