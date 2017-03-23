```
import React, {Component} from 'react';
import DeckGL, {ScatterplotLayer} from 'deck.gl';

export default class ScatterPlotDemo extends Component {

  render() {
    const {viewport, params, data} = this.props;

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      data,
      radiusScale: params.radius.value,
      radiusMinPixels: 0.25,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => d[2] === 1 ? params.colorM.value : params.colorF.value,
      getRadius: d => 1,
      updateTriggers: {
        getColor: {c1: params.colorM.value, c2: params.colorF.value}
      }
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}

```
