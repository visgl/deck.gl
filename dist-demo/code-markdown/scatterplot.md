```
import React, {Component} from 'react';
import {ScatterplotLayer} from 'deck.gl';
import DeckGL from 'deck.gl/react';

export default class ScatterPlotDemo extends Component {

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      data: data,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => d[2] === 1 ? params.colorM.value : params.colorF.value,
      getRadius: d => params.radius.value,
      updateTriggers: {
        instanceColors: {c1: params.colorM.value, c2: params.colorF.value},
        instancePositions: {radius: params.radius.value}
      }
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}

```
