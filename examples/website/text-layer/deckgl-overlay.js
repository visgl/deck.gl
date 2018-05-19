import React, {Component} from 'react';
import {GL} from 'luma.gl';
import DeckGL, {TextLayer} from 'deck.gl';

const WEBGL_PARAMETERS = {
  blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
  blendEquation: GL.FUNC_ADD
};

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

  render() {
    const {viewport, data} = this.props;

    const layers = [
      new TextLayer({
        id: 'hashtag-layer',
        data,
        sizeScale: 8,
        getColor: d => d.color,
        getSize: d => d.size
      })
    ];

    return <DeckGL {...viewport} layers={layers} parameters={WEBGL_PARAMETERS} />;
  }
}
