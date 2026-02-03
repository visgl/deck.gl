/* global document */
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 1
};

const data = [];
for (let x = -50; x <= 50; x += 5) {
  for (let y = -50; y <= 50; y += 5) {
    data.push({position: [x, y], color: [(x + 50) * 2.5, (y + 50) * 2.5, 128]});
  }
}

new Deck({
  parent: document.body,
  views: new OrthographicView({
    controller: {
      dragRotate: true
    }
  }),
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [
    new ScatterplotLayer({
      id: 'scatterplot',
      data,
      getPosition: d => d.position,
      getFillColor: d => d.color,
      getRadius: 2,
      radiusUnits: 'pixels'
    })
  ]
});
