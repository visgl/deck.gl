import React, {Component} from 'react';
import DeckGL, {TextLayer} from 'deck.gl';
import TagmapLayer from './tagmap-layer';

const DEFAULT_COLOR = [29, 145, 192];

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
    const {viewport, data, cluster, fontSize} = this.props;

    const layer = cluster
      ? new TagmapLayer({
          id: 'twitter-topics-tagmap',
          data,
          maxFontSize: fontSize
        })
      : new TextLayer({
          id: 'twitter-topics-raw',
          data,
          getText: d => d.label,
          getColor: d => DEFAULT_COLOR,
          sizeScale: fontSize / 64
        });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}
