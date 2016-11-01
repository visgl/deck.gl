```
import React, {Component} from 'react';
import {DeckGLOverlay, GridLayer} from 'deck.gl';

export default class GridDemo extends Component {

  componentWillReceiveProps(nextProps) {
    const {data} = nextProps;
    if (data && data !== this.props.data) {
      console.log('Sample count: ' + data.length);
    }
  }

  render() {
    const {viewport, params, data} = this.props;

    if (!data) {
      return null;
    }

    const layer = new GridLayer({
      id: 'grid',
      ...viewport,
      data: data,
      unitWidth: params.cellSize.value,
      unitHeight: params.cellSize.value,
      isPickable: false
    });

    return (
      <DeckGLOverlay {...viewport} layers={ [layer] } />
    );
  }
}

```
