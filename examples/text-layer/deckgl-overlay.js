import React, {Component} from 'react';
import {setParameters} from 'luma.gl';
import DeckGL, {TextLayer} from 'deck.gl';

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
    const {viewport, data} = this.props;

    const layers = [
      new TextLayer({
        id: 'hashtag-layer',
        data,
        getColor: d => d.color,
        getSize: d => d.size
      })
    ];

    return <DeckGL {...viewport} layers={layers} onWebGLInitialized={this._initialize} />;
  }
}
