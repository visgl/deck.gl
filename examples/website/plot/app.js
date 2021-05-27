import React from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {OrbitView} from '@deck.gl/core';
import PlotLayer from './plot-layer';
import {scaleLinear} from 'd3-scale';

const EQUATION = (x, y) => (Math.sin(x * x + y * y) * x) / Math.PI;

const INITIAL_VIEW_STATE = {
  target: [0.5, 0.5, 0.5],
  rotationX: 30,
  rotationOrbit: -30,
  /* global window */
  zoom: typeof window !== `undefined` ? Math.log2(window.innerHeight / 3) : 1 // fit 3x3x3 box in current viewport
};

function getScale({min, max}) {
  return scaleLinear()
    .domain([min, max])
    .range([0, 1]);
}

function getTooltip({sample}) {
  return sample && sample.map(x => x.toFixed(3)).join(', ');
}

export default function App({resolution = 200, showAxis = true, equation = EQUATION}) {
  const layers = [
    equation &&
      resolution &&
      new PlotLayer({
        getPosition: (u, v) => {
          const x = (u - 1 / 2) * Math.PI * 2;
          const y = (v - 1 / 2) * Math.PI * 2;
          return [x, y, equation(x, y)];
        },
        getColor: (x, y, z) => [40, z * 128 + 128, 160],
        getXScale: getScale,
        getYScale: getScale,
        getZScale: getScale,
        uCount: resolution,
        vCount: resolution,
        drawAxes: showAxis,
        axesPadding: 0.25,
        axesColor: [0, 0, 0, 128],
        pickable: true,
        updateTriggers: {
          getPosition: equation
        }
      })
  ];

  return (
    <DeckGL
      layers={layers}
      views={new OrbitView({orbitAxis: 'Y'})}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    />
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
