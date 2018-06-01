import React, {Component} from 'react';
import {GL} from 'luma.gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';

const WEBGL_PARAMETERS = {
  blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
  blendEquation: GL.FUNC_ADD
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

  render() {
    const {viewport, flightPaths, airports, strokeWidth} = this.props;

    if (!flightPaths || !airports) {
      return null;
    }

    const layers = [
      new ScatterplotLayer({
        id: 'airports',
        data: airports,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: d => [255, 140, 0],
        getRadius: d => getSize(d.type),
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      }),
      new LineLayer({
        id: 'flight-paths',
        data: flightPaths,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];

    return <DeckGL {...viewport} layers={layers} parameters={WEBGL_PARAMETERS} />;
  }
}
