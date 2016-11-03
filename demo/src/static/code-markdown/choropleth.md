```
import React, {Component} from 'react';
import {ChoroplethLayer} from 'deck.gl';
import DeckGL from 'deck.gl/react';

export default class ChoroplethDemo extends Component {

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new ChoroplethLayer({
      id: 'choropleth',
      data,
      opacity: Math.min(1, Math.max(0, 3 - viewport.zoom / 3)),
      getColor: f => {
        const r = f.properties.value / 3000;
        return [255, 255 * (1 - r), 0]
      }
    });

    return (
      <DeckGL {...viewport} layers={ [layer] } />
    );
  }
}

```
