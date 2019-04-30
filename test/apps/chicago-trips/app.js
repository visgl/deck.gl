/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const INITIAL_VIEW_STATE = {
  latitude: 41.83131644,
  longitude: -87.62167682,
  zoom: 13,
  pitch: 45,
  bearing: 0
};

/* eslint-disable complexity */
function getColor(trip) {
  const routeId = trip.route_id;

  switch (routeId) {
    case 'Blue':
      return [44, 161, 221];
    case 'Brn':
      return [98, 54, 27];
    case 'G':
      return [36, 155, 58];
    case 'Org':
      return [248, 70, 27];
    case 'P':
      return [82, 35, 152];
    case 'Pink':
      return [226, 126, 165];
    case 'Red':
      return [198, 27, 84];
    case 'Y':
      return [249, 226, 0];
    case '6':
    case '26':
    case '100':
    case '146':
    case 'X9':
    case 'X49':
      return [183, 25, 51];
    default:
      return [200, 200, 200];
  }
}
/* eslint-enable complexity */

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 1800, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    return new TripsLayer({
      id: `trips`,
      data: './output/trips.json',
      getPath: d => {
        return d.waypoints.map(p => {
          const startTime = d.waypoints[0].timestamp;
          return [p.longitude, p.latitude, p.timestamp - startTime];
        });
      },
      getColor: d => getColor(d),
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 100,
      currentTime: this.state.time
    });
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
