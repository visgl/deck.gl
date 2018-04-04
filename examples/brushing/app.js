/* global window,document */
import {fetch} from 'global/window';
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import DeckGLOverlay from './deckgl-overlay.js';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line
const tooltipStyle = {
  position: 'absolute',
  padding: '4px',
  background: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  maxWidth: '300px',
  fontSize: '10px',
  zIndex: 9,
  pointerEvents: 'none'
};

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        ...DeckGLOverlay.defaultViewport,
        width: 500,
        height: 500
      },
      data: null,
      mousePosition: [0, 0]
    };

    fetch(DATA_URL).then(response => {
      response.json().then(({features}) => {
        this.setState({data: features});
      });
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
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

  _onMouseMove(evt) {
    if (evt.nativeEvent) {
      this.setState({mousePosition: [evt.nativeEvent.offsetX, evt.nativeEvent.offsetY]});
    }
  }

  _onMouseEnter() {
    this.setState({mouseEntered: true});
  }

  _onMouseLeave() {
    this.setState({mouseEntered: false});
  }

  _onHover({x, y, object}) {
    this.setState({x, y, hoveredObject: object});
  }

  _renderTooltip() {
    const {x, y, hoveredObject} = this.state;

    if (!hoveredObject) {
      return null;
    }

    return (
      <div style={{...tooltipStyle, left: x, top: y}}>
        <div>{hoveredObject.name}</div>
        <div>{`Net gain: ${hoveredObject.net}`}</div>
        <div>{`i: ${hoveredObject.i}`}</div>
      </div>
    );
  }
  render() {
    const {viewport, data, mousePosition, mouseEntered} = this.state;

    if (!data) {
      return null;
    }

    return (
      <div
        onMouseMove={this._onMouseMove.bind(this)}
        onMouseEnter={this._onMouseEnter.bind(this)}
        onMouseLeave={this._onMouseLeave.bind(this)}
      >
        {this._renderTooltip()}
        <MapGL
          {...viewport}
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        >
          <DeckGLOverlay
            viewport={viewport}
            data={data}
            brushRadius={100000}
            opacity={0.7}
            strokeWidth={2}
            enableBrushing={true}
            mousePosition={mousePosition}
            mouseEntered={mouseEntered}
            onHover={this._onHover.bind(this)}
          />
        </MapGL>
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
