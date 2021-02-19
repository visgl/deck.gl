import {loadArcGISModules} from '@deck.gl/arcgis';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

// Tileset entry point: Indexed 3D layer file url
const TILESET_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

export async function renderToDOM(container) {
  const {DeckRenderer, modules} = await loadArcGISModules([
    'esri/Map',
    'esri/views/SceneView',
    'esri/views/3d/externalRenderers'
  ]);
  const [ArcGISMap, SceneView, externalRenderers] = modules;

  const sceneView = new SceneView({
    container,
    qualityProfile: 'high',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector'
    }),
    environment: {
      atmosphereEnabled: false
    },
    camera: {
      position: {x: -122.4, y: 37.78, z: 3000},
      heading: 0,
      tilt: 25
    },
    viewingMode: 'local'
  });

  const renderer = new DeckRenderer(sceneView, {});
  externalRenderers.add(sceneView, renderer);

  sceneView.on('layerview-create', () => {
    renderer.deck.layers = [
      new Tile3DLayer({
        id: 'tile-3d-layer',
        data: TILESET_URL,
        loader: I3SLoader
      })
    ];
  });

  return {
    remove: () => {
      sceneView.destroy();
      renderer.dispose();
    }
  };
}
