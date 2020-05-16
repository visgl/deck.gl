import {loadArcGISModules} from '@deck.gl/arcgis';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

loadArcGISModules(['esri/Map', 'esri/views/SceneView', 'esri/views/3d/externalRenderers']).then(({DeckLayer, DeckRenderer, modules}) => {
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
        data: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
        loader: I3SLoader
      })
    ]
  });

  externalRenderers.add(sceneView, renderer);
});


/*
import {loadArcGISModules} from '@deck.gl/arcgis';
import {Tile3DLayer} from '@deck.gl/geo-layers';
import {I3SLoader} from '@loaders.gl/i3s';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

loadArcGISModules(['esri/Map', 'esri/views/MapView']).then(({DeckLayer, modules}) => {
  const [ArcGISMap, MapView] = modules;
  const layer = new DeckLayer({
    'deck.layers': [
      new Tile3DLayer({
        id: 'tile-3d-layer',
        // Tileset entry point: Indexed 3D layer file url 
        data: 'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0',
        loader: I3SLoader
      })
    ]
  });

  // In the ArcGIS API for JavaScript the MapView is responsible
  // for displaying a Map, which usually contains at least a basemap.
  // eslint-disable-next-line
  const mapView = new MapView({
    container: 'viewDiv',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector',
      layers: [layer]
    }),
    center: [0.119167, 52.205276],
    zoom: 5
  });
});
*/