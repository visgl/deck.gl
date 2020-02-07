import ArcGISMap from "esri/Map";
import MapView from "esri/views/MapView";
import { EsriDeckLayer } from '@deck.gl/arcgis';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';

// source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const AIR_PORTS =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const layer = new EsriDeckLayer({
  getDeckLayer() {
    const t = performance.now() / 1000;

    return [
      new GeoJsonLayer({
        id: 'airports',
        data: AIR_PORTS,
        // Styles
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusScale: 2000,
        getRadius: f => 11 - f.properties.scalerank,
        getFillColor: [200, 0, 80, 180],
        // Interactive props
        pickable: true,
        autoHighlight: true,
        onClick: info =>
          // eslint-disable-next-line
          info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
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
    ];
  }
});

// In the ArcGIS API for JavaScript the MapView is responsible
// for displaying a Map, which usually contains at least a basemap.
const view = new MapView({
  container: "app",
  map: new ArcGISMap({
    basemap: "dark-gray-vector",
    layers: [layer]
  }),
  center: [0.119167, 52.205276],
  zoom: 7
});
