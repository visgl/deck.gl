// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {loadArcGISModules} from '@deck.gl/arcgis';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

loadArcGISModules(['esri/Map', 'esri/views/SceneView', 'esri/views/3d/webgl/RenderNode'], {
  url: 'https://js.arcgis.com/4.32/'
}).then(({DeckLayer, DeckRenderer, modules}) => {
  const [ArcGISMap, SceneView, RenderNode] = modules;

  const sceneView = new SceneView({
    container: 'viewDiv',
    qualityProfile: 'high',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector'
    }),
    environment: {
      atmosphereEnabled: false
    },
    camera: {
      position: {
        x: -122.4194,
        y: 37.7749,
        z: 200
      },

      tilt: 40
    },
    viewingMode: 'local'
  });

  const renderer = new DeckRenderer(sceneView, {
    layers: [
      new Tile3DLayer({
        id: 'tile-3d-layer',
        // Tileset entry point: Indexed 3D layer file url
        data: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
        loaders: [I3SLoader]
      })
    ]
  });

  // DeckRenderer is an ArcGIS RenderNode; it self-registers with the
  // SceneView via the view property and does not need to be added as a layer.
  // eslint-disable-next-line no-unused-expressions
  renderer;

  // Debug hook
  window.__sceneView = sceneView;
});
