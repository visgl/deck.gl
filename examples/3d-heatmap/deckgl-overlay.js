import React, {Component} from 'react';
import DeckGL, {HexagonLayer} from 'deck.gl';

const LIGHT_SETTINGS = {
  lightsPosition: [-0.144528, 49.739968, 8000, -3.807751, 54.104682, 8000],
  ambientRatio: 0.6,
  diffuseRatio: 0.6,
  specularRatio: 0.3,
  lightsStrength: [1, 0.0, 0.8, 0.0],
  numberOfLights: 2
};

export default class DeckGLOverlay extends Component {
  static get defaultColorRange() {
    return [
      [1, 152, 189],
      [73, 227, 206],
      [216, 254, 181],
      [254, 237, 177],
      [254, 173, 84],
      [209, 55, 78]
    ];
  }
  static get defaultViewport() {
    return {
      longitude: -1.4855092665310963,
      latitude: 52.38821282001933,
      zoom: 6.6,
      maxZoom: 15,
      pitch: 60,
      bearing: -14
    };
  }

  _initialize(gl) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  render() {
    const {viewport, data, radius, upperPercentile} = this.props;

    if (!buildings || !trips) {
      return null;
    }

    const layers = [
      new HexagonLayer({
        id: 'heatmap',
        data,
        opacity: 1,
        colorRange: this.defaultColorRange,
        extruded: true,
        pickable: true,
        radius,
        upperPercentile,
        elevationScale: 1,
        elevationRange: [0, 3000],
        coverage: 1,
        getPosition: d => d,
        lightSettings: LIGHT_SETTINGS
      })
    ];

    return (
      <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />
    );
  }
}
