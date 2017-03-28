import React, {Component} from 'react';

import DeckGL, {GeoJsonLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 41.87,
      longitude: -87.62,
      zoom: 13,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, colorScale, extruded} = this.props;

    if (!data) {
      return null;
    }

    const layer = new GeoJsonLayer({
      id: 'geojson',
      data,
      stroked: true,
      filled: true,
      extruded,
      fp64: true,
      lineWidthMaxPixels: 1,
      getElevation: f => f.properties.value,
      getFillColor: f => colorScale(f.properties.value)
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } onWebGLInitialized={this._initialize} />
    );
  }
}
