/* global window, document */
import React, {Component} from 'react';
import autobind from 'react-autobind';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';

import WindDemo from './wind-demo';
import ControlPanel from './control-panel';

// animation
import TWEEN from 'tween.js';
const animate = () => {
  TWEEN.update();
  window.requestAnimationFrame(animate);
};

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        bearing: 0.9642857142857792,
        latitude: 37.59651729201781,
        longitude: -96.86543413846587,
        mapStyle: 'mapbox://styles/mapbox/dark-v9',
        maxZoom: 8,
        pitch: 34.095940959409596,
        zoom: 4.223615382460847,
        width: 500,
        height: 500
      },
      settings: {
        time: 0,
        showParticles: false,
        showWindDemo: false,
        showElevation: false
      }
    };
    autobind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
    animate();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    this._updateViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _updateViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _updateSettings(settings) {
    this.setState({
      settings: {...this.state.settings, ...settings}
    });
  }

  render() {
    const {viewport, settings} = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          perspectiveEnabled
          onChangeViewport={this._updateViewport}>

          <WindDemo viewport={viewport} settings={settings} />

        </MapGL>

        <div className="control-panel">
          <h1>Wind</h1>
          <p>Visualize wind on vector fields and particles.</p>
          <ul>
            <li>Hold cmd + drag to tilt the map</li>
            <li>Turn on/off between a particles or vector field layer</li>
            <li>Slide through every hour of the day to look at wind change</li>
          </ul>
          <p>Made with <a href="http://deck.gl">deck.gl</a> by
            <a href="https://twitter.com/philogb">@philogb</a>
          </p>
          <p>Data source: <a href="http://www.census.gov">NCAA</a></p>
          <hr />

          <ControlPanel settings={settings} onChange={this._updateSettings} />

        </div>

      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
