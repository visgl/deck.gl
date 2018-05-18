import React, {Component} from 'react';
import DeckGL, {ScatterplotLayer} from 'deck.gl';

// Source data
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/scatterplot/manhattan.json'; // eslint-disable-line

export default class DeckGLOverlay extends Component {
  static get defaultViewport() {
    return {
      longitude: -74,
      latitude: 40.7,
      zoom: 11,
      maxZoom: 16,
      pitch: 0,
      bearing: 0
    };
  }

  render() {
    const {viewport, maleColor, femaleColor, radius} = this.props;

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      data: DATA_URL,
      radiusScale: radius,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => (d[2] === 1 ? maleColor : femaleColor),
      getRadius: d => 1,
      updateTriggers: {
        getColor: [maleColor, femaleColor]
      }
    });

    return <DeckGL width="100%" height="100%" {...viewport} layers={[layer]} />;
  }
}
