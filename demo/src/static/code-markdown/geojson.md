```
import React, {Component} from 'react';
import DeckGL, {GeoJsonLayer} from 'deck.gl';

export default class GeoJsonDemo extends Component {

  render() {
    const {viewport, data} = this.props;

    const layers = data.map((d, i) => new GeoJsonLayer({
      id: `choropleth-${i}`,
      data: d,
      stroked: true,
      filled: true,
      fp64: true,
      lineWidthMaxPixels: 1,
      getFillColor: f => {
        const r = f.properties.value / 160;
        return [255 * r, 200 * (1 - r), 255 * (1 - r)];
      }
    }));

    return (
      <DeckGL {...viewport} layers={ layers } />
    );
  }
}

```
