import React, {Component} from 'react';

import DeckGL, {LineLayer} from 'deck.gl';

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 52,
      longitude: 0.4,
      zoom: 6,
      maxZoom: 16,
      pitch: 50,
      bearing: 0
    };
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, strokeWidth} = this.props;

    if (!data) {
      return null;
    }

    const layer = new LineLayer({
      id: 'geojson',
      data,
      strokeWidth,
      fp64: true,
      getSourcePosition: d => d.start,
      getTargetPosition: d => d.end,
      getColor
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } onWebGLInitialized={this._initialize} />
    );
  }
}
