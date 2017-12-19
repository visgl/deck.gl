import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL from 'deck.gl';
import TagmapLayer from './tagmap-layer';

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      latitude: 39.1,
      longitude: -94.57,
      zoom: 3.8,
      maxZoom: 16,
      pitch: 0,
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
    const {viewport, data, weightThreshold} = this.props;

    const layers = [
      new TagmapLayer({
        id: 'Twitter-topics',
        data,
        weightThreshold
      })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}
