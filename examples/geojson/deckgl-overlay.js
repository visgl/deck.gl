import React, {Component} from 'react';

import DeckGL, {GeoJsonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-124.5, 48, 5000, -123.1, 49.3, 8000],
  ambientRatio: 0.5,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

function getLineColor(f) {
  const z = f.geometry.coordinates[0][2];
  const r = z / 5000;
  return [200 * (1 - r), 128 * r, 255 * r, 128 * Math.max(0.01, 1.5 - r)];
}

function getLineWidth(f) {
  const v = f.properties.velocity;
  return 30 - Math.sqrt(v);
}

export default class DeckGLOverlay extends Component {

  static get defaultViewport() {
    return {
      latitude: 49.254,
      longitude: -123.13,
      zoom: 11,
      maxZoom: 16,
      pitch: 45,
      bearing: 0
    };
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, colorScale} = this.props;

    if (!data) {
      return null;
    }

    const layer = new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 1,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,
      lineJointRounded: true,
      lineWidthScale: 10,
      lineWidthMinPixels: 2,

      getRadius: f => 1000,
      // getLineColor,
      // getLineWidth,

      getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: f => {
        const {valuePerSqm, prevValuePerSqm} = f.properties;
        var r = (valuePerSqm - prevValuePerSqm) / prevValuePerSqm;
        return [255 * r, 140, 30];
      },
      lightSettings: LIGHT_SETTINGS
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } onWebGLInitialized={this._initialize} />
    );
  }
}
