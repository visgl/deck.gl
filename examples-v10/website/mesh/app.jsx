// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {tableFromArrays} from 'apache-arrow';
import {OrbitView, DirectionalLight, LightingEffect, AmbientLight} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {OBJLoader} from '@loaders.gl/scene/obj';

const MESH_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/mesh/minicooper.obj';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  zoom: 0
};

/** Builds one Arrow row per car in the sample grid. */
const SAMPLE_DATA = (([xCount, yCount], spacing) => {
  const columns = {x: [], y: [], red: [], blue: [], yaw: []};
  for (let i = 0; i < xCount; i++) {
    for (let j = 0; j < yCount; j++) {
      columns.x.push((i - (xCount - 1) / 2) * spacing);
      columns.y.push((j - (yCount - 1) / 2) * spacing);
      columns.red.push(i / (xCount - 1));
      columns.blue.push(j / (yCount - 1));
      columns.yaw.push((i / (xCount - 1)) * 60 - 30);
    }
  }
  return tableFromArrays(columns);
})([10, 10], 120);

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-10, -2, -15],
  _shadow: true
});

const lightingEffect = new LightingEffect({ambientLight, dirLight});

const background = [
  [
    [-1000.0, -1000.0, -40],
    [1000.0, -1000.0, -40],
    [1000.0, 1000.0, -40],
    [-1000.0, 1000.0, -40]
  ]
];

/** @param {{device?: import('@luma.gl/core').Device}} props */
export default function App({device}) {
  const isWebGPU = device?.type === 'webgpu';
  const layers = [
    new SimpleMeshLayer({
      id: 'mini-coopers',
      data: SAMPLE_DATA,
      loaders: [OBJLoader],
      mesh: MESH_URL,
      loadOptions: {obj: {shape: 'mesh'}},
      coordinateSystem: 'cartesian',
      getPosition: {sql: 'FLOAT64x2(x, y)'},
      getColor: {sql: 'RGBA8(red, 0.5, blue, 1)'},
      getOrientation: d => [d.yaw, 0, -90]
    }),
    // only needed when using shadows - a plane for shadows to drop on
    new SolidPolygonLayer({
      id: 'background',
      data: background,
      extruded: false,
      coordinateSystem: 'cartesian',
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    })
  ];

  return (
    <DeckGL
      device={device}
      views={
        new OrbitView({
          near: 0.1,
          far: 2
        })
      }
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      effects={isWebGPU ? [] : [lightingEffect]}
    />
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
