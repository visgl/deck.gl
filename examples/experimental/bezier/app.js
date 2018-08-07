import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import BezierGraphLayer from './bezier-graph-layer';

import SAMPLE_GRAPH from './sample-graph.json';

const INITIAL_VIEW_STATE = {
  offset: [0, 0],
  zoom: 1
};

export default class App extends Component {
  render() {
    const {data = SAMPLE_GRAPH} = this.props;

    return (
      <DeckGL
        width="100%"
        height="100%"
        initialViewState={INITIAL_VIEW_STATE}
        views={[new OrthographicView({controller: true})]}
        layers={[new BezierGraphLayer({data})]}
      />
    );
  }
}

/* global document */
render(<App />, document.body.appendChild(document.createElement('div')));
