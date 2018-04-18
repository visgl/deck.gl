import React, {Component} from 'react';

import DeckGL, {ScreenGridLayer} from 'deck.gl';

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -119.3,
      latitude: 35.6,
      zoom: 6,
      maxZoom: 20,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const {viewport, cellSize, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScreenGridLayer({
      id: 'grid',
      data,
      minColor: [0, 0, 0, 0],
      getPosition: d => d,
      cellSizePixels: cellSize
    });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}
