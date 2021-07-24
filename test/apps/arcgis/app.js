import {loadArcGISModules} from '@deck.gl/arcgis';
import {TripsLayer} from '@deck.gl/geo-layers';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/trips/trips-v7.json';

function renderLayers() {
  return [
    new TripsLayer({
      id: 'trips',
      data: DATA_URL,
      getPath: d => d.path,
      getTimestamps: d => d.timestamps,
      getColor: d => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
      opacity: 1.0,
      widthMinPixels: 4,
      rounded: true,
      trailLength: 180,
      currentTime: (Date.now() % 10000) / 10,
      shadowEnabled: false
    })
  ];
}

loadArcGISModules([
  'esri/Map',
  'esri/views/MapView',
  'esri/views/SceneView',
  'esri/views/3d/externalRenderers'
]).then(({DeckLayer, DeckRenderer, modules}) => {
  const [ArcGISMap, MapView, SceneView, externalRenderers] = modules;

  const layer = new DeckLayer({});

  // In the ArcGIS API for JavaScript the MapView is responsible
  // for displaying a Map, which usually contains at least a basemap.
  // eslint-disable-next-line
  const mapView = new MapView({
    container: 'mapViewDiv',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector',
      layers: [layer]
    }),
    center: [-74, 40.72],
    zoom: 14
  });

  const sceneView = new SceneView({
    container: 'sceneViewDiv',
    qualityProfile: 'high',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector'
    }),
    environment: {
      atmosphereEnabled: false
    },
    camera: {
      position: {
        x: -74,
        y: 40.65,
        z: 5000
      },

      tilt: 0
    },
    viewingMode: 'local'
  });

  const renderer = new DeckRenderer(sceneView, {});

  externalRenderers.add(sceneView, renderer);

  /* global setInterval */
  setInterval(() => {
    layer.deck.layers = renderLayers();
    renderer.deck.layers = renderLayers();
  }, 50);
});
