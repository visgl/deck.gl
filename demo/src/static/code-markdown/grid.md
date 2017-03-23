```
import React, {Component} from 'react';
import DeckGL, {ScreenGridLayer} from 'deck.gl';

export default class GridDemo extends Component {

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ScreenGridLayer({
      id: 'grid',
      data,
      minColor: [0, 0, 0, 0],
      cellSizePixels: params.cellSize.value
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}

```
