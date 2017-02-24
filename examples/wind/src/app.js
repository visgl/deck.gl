/* global window,document */
import 'babel-polyfill';
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import Wind from './wind';
import ControlPanel from './control-panel';

// animation
import TWEEN from 'tween.js';
const animate = () => {
  TWEEN.update();
  window.requestAnimationFrame(animate);
};

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN; // eslint-disable-line

class Root extends Component {



  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        bearing:0.9642857142857792,
        latitude:37.59651729201781,
        longitude:-96.86543413846587,
        //mapStyle: "mapbox://styles/uberdata/cive485h000192imn6c6cc8fc",
        mapStyle: "mapbox://styles/mapbox/dark-v9",
        maxZoom:8,
        pitch:34.095940959409596,
        zoom:4.223615382460847,
        width: 500,
        height: 500
      },
      params: {
        // time: 11.4,
        time: 0,
        toggleParticles: true,
        toggleWind: false,
        toggleElevation: true
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize = () => {
    this._updateViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _updateViewport = viewport => {
    // console.log({...this.state.viewport, ...viewport});
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _updateParams = params => {
    // console.log({...this.state.params, ...params});
    this.setState({
      params: {...this.state.params, ...params}
    });
  }

  render() {
    const {viewport, params} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          perspectiveEnabled
          onChangeViewport={this._updateViewport}>

          <Wind viewport={viewport} params={params} />

        </MapGL>

        <div className="control-panel">
          <h1>Wind</h1>
          <p>Visualize wind on vector fields and particles.</p>
          <ul>
          <li>Hold cmd + drag to tilt the map</li>
          <li>Turn on/off between a particles or vector field layer</li>
          <li>Slide through every hour of the day to look at wind change</li>
          </ul>
          <p>Made with <a href="http://deck.gl">deck.gl</a> by <a href="https://twitter.com/philogb">@philogb</a></p>
          <p>Data source: <a href="http://www.census.gov">NCAA</a></p>
          <hr />

          <ControlPanel params={params} onChange={this._updateParams} />

        </div>

      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
