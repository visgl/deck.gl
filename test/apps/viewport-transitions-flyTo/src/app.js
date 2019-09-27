/* global window */
import React, {Component} from 'react';
import {StaticMap} from 'react-map-gl';
import DeckGL, {MapController, FlyToInterpolator, TRANSITION_EVENTS} from 'deck.gl';

import ControlPanel from './control-panel';

const token = process.env.MapboxAccessToken; // eslint-disable-line
const interruptionStyles = [
  {
    title: 'BREAK',
    style: TRANSITION_EVENTS.BREAK
  },
  {
    title: 'SNAP_TO_END',
    style: TRANSITION_EVENTS.SNAP_TO_END
  },
  {
    title: 'IGNORE',
    style: TRANSITION_EVENTS.IGNORE
  }
];

if (!token) {
  throw new Error('Please specify a valid mapbox token');
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewState: {
        latitude: 37.7751,
        longitude: -122.4193,
        zoom: 11,
        bearing: 0,
        pitch: 0,
        width: 500,
        height: 500
      }
    };
    this._interruptionStyle = TRANSITION_EVENTS.BREAK;
    this._resize = this._resize.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize() {
    this.setState({
      viewState: {
        ...this.state.viewState,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  }

  _easeTo({longitude, latitude}) {
    this.setState({
      viewState: {
        ...this.state.viewState,
        longitude,
        latitude,
        zoom: 11,
        pitch: 0,
        bearing: 0,
        transitionDuration: 'auto',
        transitionInterpolator: new FlyToInterpolator({speed: 2}),
        transitionInterruption: this._interruptionStyle
      }
    });
  }

  _onStyleChange(style) {
    this._interruptionStyle = style;
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  render() {
    const {viewState} = this.state;

    return (
      <div>
        <DeckGL
          viewState={viewState}
          controller={MapController}
          onViewStateChange={this._onViewStateChange}
        >
          <StaticMap
            mapStyle="mapbox://styles/mapbox/dark-v9"
            dragToRotate={false}
            mapboxApiAccessToken={token}
          />
        </DeckGL>

        <ControlPanel
          containerComponent={this.props.containerComponent}
          onViewportChange={this._easeTo.bind(this)}
          interruptionStyles={interruptionStyles}
          onStyleChange={this._onStyleChange.bind(this)}
        />
      </div>
    );
  }
}
