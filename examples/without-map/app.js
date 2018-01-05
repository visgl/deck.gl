/* global window,document,fetch */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {GeoJsonLayer, experimental} from 'deck.gl';

const {MapController} = experimental;

// source: Natural Earth http://www.naturalearthdata.com/
// via geojson.xyz
const GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: 40,
        longitude: -100,
        zoom: 3,
        bearing: 0,
        pitch: 60
      },
      width: 500,
      height: 500,
      data: null
    };

    fetch(GEOJSON)
      .then(resp => resp.json())
      .then(data => this.setState({data}));
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

  render() {
    const {viewport, width, height, data} = this.state;

    return (
      <MapController
        {...viewport}
        width={width}
        height={height}
        onViewportChange={v => this.setState({viewport: v})}
      >
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          debug
          layers={[
            new GeoJsonLayer({
              data,
              stroked: true,
              filled: true,
              lineWidthMinPixels: 2,
              getLineColor: () => [255, 255, 255],
              getFillColor: () => [200, 200, 200]
            })
          ]}
        />
      </MapController>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
