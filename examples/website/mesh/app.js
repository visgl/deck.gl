import React from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {
  COORDINATE_SYSTEM,
  OrbitView,
  DirectionalLight,
  LightingEffect,
  AmbientLight
} from '@deck.gl/core';
import {SolidPolygonLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';

import {OBJLoader} from '@loaders.gl/obj';
import {registerLoaders} from '@loaders.gl/core';

// Add the loaders that handle your mesh format here
registerLoaders([OBJLoader]);

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

const SAMPLE_DATA = (([xCount, yCount], spacing) => {
  const data = [];
  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      data.push({
        position: [(x - (xCount - 1) / 2) * spacing, (y - (yCount - 1) / 2) * spacing],
        color: [(x / (xCount - 1)) * 255, 128, (y / (yCount - 1)) * 255],
        orientation: [(x / (xCount - 1)) * 60 - 30, 0, -90]
      });
    }
  }
  return data;
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
  [[-1000.0, -1000.0, -40], [1000.0, -1000.0, -40], [1000.0, 1000.0, -40], [-1000.0, 1000.0, -40]]
];

export default function App() {
  const layers = [
    new SimpleMeshLayer({
      id: 'mini-coopers',
      data: SAMPLE_DATA,
      mesh: MESH_URL,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPosition: d => d.position,
      getColor: d => d.color,
      getOrientation: d => d.orientation
    }),
    // only needed when using shadows - a plane for shadows to drop on
    new SolidPolygonLayer({
      id: 'background',
      data: background,
      extruded: false,
      coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    })
  ];

  return (
    <DeckGL
      views={
        new OrbitView({
          near: 0.1,
          far: 2
        })
      }
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      effects={[lightingEffect]}
    />
  );
}

export function renderToDOM(container) {
  render(<App />, container);
}
