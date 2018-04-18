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
          getLabel: x => x.label,
          getPosition: x => x.coordinates,
          minFontSize: 14,
          maxFontSize: fontSize * 2 - 14
        })
      : new TextLayer({
          id: 'twitter-topics-raw',
          data,
          getText: d => d.label,
          getPosition: x => x.coordinates,
          getColor: d => DEFAULT_COLOR,
          getSize: d => 20,
          sizeScale: fontSize / 20
        });

    return <DeckGL {...viewport} layers={[layer]} />;
  }
}
