import {loadArcGISModules} from '@deck.gl/arcgis';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

loadArcGISModules(['esri/Map', 'esri/views/SceneView', 'esri/views/3d/externalRenderers']).then(
  ({DeckLayer, DeckRenderer, modules}) => {
    const [ArcGISMap, SceneView, externalRenderers] = modules;

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
          data:
            'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
          loader: I3SLoader
        })
      ]
    });

    externalRenderers.add(sceneView, renderer);
  }
);
