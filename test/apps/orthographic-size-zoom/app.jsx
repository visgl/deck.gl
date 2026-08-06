// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Manual test app for https://github.com/visgl/deck.gl/pull/10532
// "override size zoom in OrthographicView"
//
// The grid is stretched independently along X and Y by zoomX/zoomY.
// The circles use `common` size units, so their pixel radius is controlled
// by the viewport's single "size zoom" - normally min(zoomX, zoomY), but
// overridable by supplying a separate top-level `zoom` value.
import React, {useState, useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

function makeGrid(range, step) {
  const points = [];
  for (let x = -range; x <= range; x += step) {
    for (let y = -range; y <= range; y += step) {
      points.push([x, y]);
    }
  }
  return points;
}

const GRID = makeGrid(200, 40);
const VIEW = new OrthographicView({flipY: false});

export default function App() {
  const [zoomX, setZoomX] = useState(3);
  const [zoomY, setZoomY] = useState(1);
  const [overrideZoom, setOverrideZoom] = useState(false);
  const [zoom, setZoom] = useState(2);

  const viewState = useMemo(
    () => ({
      target: [0, 0, 0],
      zoomX,
      zoomY,
      ...(overrideZoom ? {zoom} : {})
    }),
    [zoomX, zoomY, overrideZoom, zoom]
  );

  const layers = [
    new ScatterplotLayer({
      id: 'points',
      data: GRID,
      getPosition: d => d,
      getRadius: 15,
      radiusUnits: 'common',
      getFillColor: [255, 80, 0],
      stroked: true,
      getLineColor: [0, 0, 0],
      lineWidthUnits: 'pixels',
      getLineWidth: 1
    })
  ];

  return (
    <>
      <DeckGL
        views={VIEW}
        viewState={viewState}
        onViewStateChange={() => {}}
        controller={false}
        layers={layers}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'white',
          padding: 10,
          fontFamily: 'sans-serif',
          fontSize: 13,
          lineHeight: 1.6
        }}
      >
        <div>
          <label>
            zoomX:{' '}
            <input
              type="number"
              step="0.5"
              value={zoomX}
              onChange={e => setZoomX(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            zoomY:{' '}
            <input
              type="number"
              step="0.5"
              value={zoomY}
              onChange={e => setZoomY(Number(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={overrideZoom}
              onChange={() => setOverrideZoom(!overrideZoom)}
            />{' '}
            Override size zoom
          </label>
        </div>
        {overrideZoom && (
          <div>
            <label>
              zoom (size):{' '}
              <input
                type="number"
                step="0.5"
                value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
              />
            </label>
          </div>
        )}
        <p style={{maxWidth: 320}}>
          Grid spacing is stretched by zoomX/zoomY independently (position projection). Circle
          radius uses <code>common</code> size units, controlled by the viewport's "size zoom":
          normally <code>min(zoomX, zoomY)</code>, or the explicit <code>zoom</code> value when
          "Override size zoom" is checked.
        </p>
      </div>
    </>
  );
}

const container = document.getElementById('app');
createRoot(container).render(<App />);
