/* global window,document */
/* eslint-disable max-len */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';
import {fromJS} from 'immutable';
import {json as requestJson} from 'd3-request';
import Stats from 'stats.js';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
// mapbox style file path
const MAPBOX_STYLE_FILE =
  'https://rivulet-zhang.github.io/dataRepo/mapbox/style/map-style-dark-v9-no-labels.json';
// sample data
const FILE_PATH = 'https://rivulet-zhang.github.io/dataRepo/text-layer/hashtagsOneDayWithTime.json';
const SECONDS_PER_DAY = 24 * 60 * 60;
// visualize data within in the time window of [current - TIME_WINDOW, current + TIME_WINDOW]
const TIME_WINDOW = 2;
const TEXT_COLOR = [12, 123, 234];

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

  componentWillMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }
  componentDidMount() {
    this._loadData();

    // performace monitoring panel
    this._stats = new Stats();
    this._stats.showPanel(0);
    this.fps.appendChild(this._stats.dom);

    const calcFPS = () => {
      this._stats.begin();
      this._stats.end();
      this._animateRef = window.requestAnimationFrame(calcFPS);
    };
    window.requestAnimationFrame(calcFPS);

    window.requestAnimationFrame(this._animateData.bind(this));
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
    if (this._animateRef) {
      window.cancelAnimationFrame(this._animateRef);
    }
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
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

  _loadData() {
    requestJson(FILE_PATH, (error, response) => {
      if (!error) {
        // each entry in the data object contains all tweets posted at that second
        const data = Array.from({length: SECONDS_PER_DAY}, () => []);
        response.forEach(val => {
          const second = parseInt(val.time, 10) % SECONDS_PER_DAY;
          data[second].push(val);
        });
        this.setState({data});
      } else {
        throw new Error(error.toString());
      }
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

  render() {
    const {viewport, mapStyle, dataSlice} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <DeckGLOverlay viewport={viewport} data={dataSlice} />
        </MapGL>
        <div ref={c => (this.fps = c)} className="fps" />
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
