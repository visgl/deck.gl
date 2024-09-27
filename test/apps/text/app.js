// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {TextLayer, PathLayer} from '@deck.gl/layers';

const textLayerProps = {
  data: [0],
  fontFamily: 'Helvetica, Arial, sans-serif',
  getTextAnchor: 'start',
  getAlignmentBaseline: 'center',
  getText: _ => 'Any123',
  getSize: 20,
  sizeUnits: 'common'
};

const viewState = {
  target: [0, 0, 0],
  zoom: 2
};

const deck = new Deck({
  views: new OrthographicView(),
  viewState,
  layers: [
    new TextLayer({
      id: 'non-sdf',
      fontSettings: {
        fontSize: 64,
        buffer: 12
      },
      getPosition: _ => [-50, 0],
      ...textLayerProps
    }),
    new TextLayer({
      id: 'sdf',
      fontSettings: {
        sdf: true,
        fontSize: 64,
        buffer: 12,
        radius: 12
      },
      getPosition: _ => [50, 0],
      outlineWidth: 6,
      outlineColor: [0, 128, 255],
      ...textLayerProps
    }),
    new PathLayer({
      id: 'grid',
      data: [
        [
          [-200, -10],
          [200, -10]
        ],
        [
          [-200, 0],
          [200, 0]
        ],
        [
          [-200, 10],
          [200, 10]
        ],
        [
          [-50, -10],
          [-50, 10]
        ],
        [
          [50, -10],
          [50, 10]
        ]
      ],
      getPath: d => d,
      getColor: [255, 0, 0],
      getWidth: 1,
      widthUnits: 'pixels'
    })
  ]
});

// For automated test cases
/* global document */
document.body.style.margin = '0px';

const text = document.getElementById('svgText');
text.style.fontSize = textLayerProps.getSize * 2 ** viewState.zoom + 'px';
