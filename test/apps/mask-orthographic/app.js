/* global fetch */
import React, {useState, useMemo} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, OrthographicView, OPERATION} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';

/* eslint-disable react/no-deprecated */
export default function App() {
  const [maskEnabled, setMaskEnabled] = useState(true);
  const [showLayers, setShowLayers] = useState(true);

  const layers = [
    new SolidPolygonLayer({
      id: 'mask',
      operation: OPERATION.MASK,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [
        [
          [-20, -200],
          [-20, 200],
          [20, 200],
          [20, -200]
        ]
      ],
      getPolygon: f => f,
      getFillColor: [0, 255, 0]
    }),
    new SolidPolygonLayer({
      id: 'square',
      extensions: [new MaskExtension()],
      maskId: maskEnabled && 'mask',
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      data: [
        [
          [-100, -100],
          [-100, 100],
          [100, 100],
          [100, -100]
        ]
      ],
      getPolygon: f => f,
      getFillColor: [255, 0, 0]
    })
  ];

  const views = new OrthographicView();
  const viewState = {
    target: [0, 0, 0],
    zoom: 0
  };
  return (
    <>
      <DeckGL
        layers={showLayers ? layers : []}
        initialViewState={viewState}
        views={views}
        controller={true}
      ></DeckGL>
      <div style={{position: 'absolute', background: 'white', padding: 10}}>
        <label>
          <input
            type="checkbox"
            checked={maskEnabled}
            onChange={() => setMaskEnabled(!maskEnabled)}
          />
          Use mask
        </label>
        <label>
          <input type="checkbox" checked={showLayers} onChange={() => setShowLayers(!showLayers)} />
          Show layers
        </label>
      </div>
    </>
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
