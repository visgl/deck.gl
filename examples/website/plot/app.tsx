// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import DeckGL from '@deck.gl/react';
import {OrbitView, OrbitViewState} from '@deck.gl/core';
import PlotLayer, {Axes, PlotLayerPickingInfo} from './plot-layer';
import {scaleLinear} from 'd3-scale';

/** Given x and y, returns z coordinate */
type Equation = (x: number, y: number) => number;

const DEFAULT_EQUATION = (x, y) => (Math.sin(x * x + y * y) * x) / Math.PI;
const MAX_SIZE = 24;

const INITIAL_VIEW_STATE: OrbitViewState = {
  target: [0, 0, 0],
  rotationX: 30,
  rotationOrbit: -30,
  /* global window */
  zoom: typeof window !== 'undefined' ? Math.log2(window.innerHeight / MAX_SIZE) + 1 : 1
};

function onAxesChange(axes: Axes) {
  for (const axis of Object.values(axes)) {
    let size = axis.max - axis.min;
    let clamped = false;
    if (size > MAX_SIZE) {
      const mid = (axis.min + axis.max) / 2;
      axis.min = mid - MAX_SIZE / 2;
      axis.max = mid + MAX_SIZE / 2;
      size = MAX_SIZE;
      clamped = true;
    }

    const scale = scaleLinear()
      .domain([axis.min, axis.max])
      .range([-size / 2, size / 2])
      .clamp(clamped)
      .nice();
    axis.min = scale.domain()[0];
    axis.max = scale.domain()[1];
    axis.scale = scale;
    axis.ticks = scale.ticks(6);
  }
}

function getTooltip({sample}: PlotLayerPickingInfo) {
  return sample && sample.map(x => x.toFixed(3)).join(', ');
}

export default function App({
  resolution = 200,
  showAxis = true,
  equation = DEFAULT_EQUATION
}: {
  equation?: Equation;
  resolution?: number;
  showAxis?: boolean;
}) {
  const layers = [
    equation &&
      resolution &&
      new PlotLayer({
        getPosition: ([u, v]) => {
          const x = (u - 1 / 2) * Math.PI * 2;
          const y = (v - 1 / 2) * Math.PI * 2;
          return [x, y, equation(x, y)];
        },
        getColor: ([x, y, z]) => [40, z * 128 + 128, 160],
        onAxesChange,
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

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
