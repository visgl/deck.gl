```
import React, {Component} from 'react';
import {ScreenGridLayer} from 'deck.gl';
import DeckGL from 'deck.gl/react';

export default class GridDemo extends Component {

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScreenGridLayer({
      id: 'grid',
      data: data,
      minColor: [0, 0, 0, 0],
      unitWidth: params.cellSize.value,
      unitHeight: params.cellSize.value
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}

```
