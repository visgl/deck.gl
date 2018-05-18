import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/heathrow-flights.json' // eslint-disable-line
};

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      latitude: 47.65,
      longitude: 7,
      zoom: 4.5,
      maxZoom: 16,
      pitch: 50,
      bearing: 0
    };
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }

  render() {
    const {viewport, strokeWidth} = this.props;

    const layers = [
      new ScatterplotLayer({
        id: 'airports',
        data: DATA_URL.AIRPORTS,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: d => [255, 140, 0],
        getRadius: d => getSize(d.type),
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      }),
      new LineLayer({
        id: 'flight-paths',
        data: DATA_URL.FLIGHT_PATHS,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}
