```
import React, {Component} from 'react';
import {DeckGLOverlay, ScatterplotLayer} from 'deck.gl';

export default class ScatterPlotDemo extends Component {
  
  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      console.log('Point count: ' + data.length);
    }
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScatterplotLayer({
      id: 'scatter-plot',
      ...viewport,
      data: data,
      getPosition: d => [d[0], d[1], 0],
      getColor: d => d[2] === 1 ? params.colorM.value : params.colorF.value,
      getRadius: d => params.radius.value,
      updateTriggers: {
        instanceColors: {c1: params.colorM.value, c2: params.colorF.value},
        instancePositions: {radius: params.radius.value}
      },
      isPickable: true
    });

    return (
      <DeckGLOverlay {...viewport} layers={ [layer] } />
    );
  }
}

```
