/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGL from 'deck.gl';
import App from './app';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);

    const app = new App({onUpdated: _ => this.forceUpdate()});

    this.state = {
      viewState: app.getDefaultViewState(),
      width: 500,
      height: 500,
      app
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewState) {
    this.setState({viewState});
  }

  render() {
    const {app, viewState, width, height} = this.state;

    return (
      <MapGL
        width={width}
        height={height}
        {...viewState}
        onViewportChange={this._onViewportChange.bind(this)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <DeckGL
          width={width}
          height={height}
          {...viewState}
          layers={app.renderLayers(this.props)}
        />
      </MapGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
