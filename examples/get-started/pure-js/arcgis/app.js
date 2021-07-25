import {loadArcGISModules} from '@deck.gl/arcgis';
import {GeoJsonLayer, ArcLayer} from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

loadArcGISModules(['esri/Map', 'esri/views/MapView']).then(({DeckLayer, modules}) => {
  const [ArcGISMap, MapView] = modules;
  const layer = new DeckLayer({
    effect: 'bloom(1.5, 0.5px, 0.1)',
    'deck.getTooltip': info => info.object && info.object.properties.name,
    'deck.layers': [
      new GeoJsonLayer({
        id: 'airports',
        data: AIR_PORTS,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getPointRadius: f => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: info =>
          info.object &&
          // eslint-disable-next-line
          alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
      }),
      new ArcLayer({
        id: 'arcs',
        data: AIR_PORTS,
        dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
        // Styles
        getSourcePosition: f => [-0.4531566, 51.4709959], // London
        getTargetPosition: f => f.geometry.coordinates,
        getSourceColor: [0, 128, 200],
        getTargetColor: [200, 0, 80],
        getWidth: 1
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
