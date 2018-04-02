import React, {Component} from 'react';
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

  render() {
    const {viewport, data} = this.props;

    const layers = [
      new TagmapLayer({
        id: 'Twitter-topics',
        data
      })
    ];

    return <DeckGL {...viewport} layers={layers} />;
  }
}
