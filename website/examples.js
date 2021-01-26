const {resolve} = require('path');

function makeExampleEntries(data, category) {
  return Object.keys(data).map(name => ({
    title: name,
    category,
    path: `examples/${data[name]}/`,
    image: `images/examples/${data[name]}.jpg`,
    componentUrl: resolve(`./src/examples/${data[name]}.js`)
  }));
}

const LAYER_EXAMPLES = {
  'ArcLayer': 'arc-layer',
  'ContourLayer': 'contour-layer',
  'GeoJsonLayer (Polygons)': 'geojson-layer-polygons',
  'GeoJsonLayer (Paths)': 'geojson-layer-paths',
  'HeatmapLayer': 'heatmap-layer',
  'HexagonLayer': 'hexagon-layer',
  'IconLayer': 'icon-layer',
  'LineLayer': 'line-layer',
  'PointCloudLayer': 'point-cloud-layer',
  'ScatterplotLayer': 'scatterplot-layer',
  'ScenegraphLayer': 'scenegraph-layer',
  'ScreenGridLayer': 'screen-grid-layer',
  'TerrainLayer': 'terrain-layer',
  'TextLayer': 'text-layer',
  'TileLayer': 'tile-layer',
  'TileLayer (Non-geospatial)': 'tile-layer-non-geospatial',
  'Tile3DLayer': 'tile-3d-layer',
  'TripsLayer': 'trips-layer'
};

const INTEGRATION_EXAMPLES = {
  'ArcGIS': 'arcgis',
  'CARTO': 'carto',
  'Google Maps': 'google-maps',
  'Mapbox': 'mapbox'
};

const VIEW_EXAMPLES = {
  'Minimap': 'multi-view',
  'OrbitView': 'plot'
};

const EXTENSION_EXAMPLES = {
  'BrushingExtension': 'brushing-extension',
  'DataFilterExtension': 'data-filter-extension'
};

module.exports = [].concat(
  makeExampleEntries(LAYER_EXAMPLES, 'Layers'),
  makeExampleEntries(INTEGRATION_EXAMPLES, 'Integrations'),
  makeExampleEntries(VIEW_EXAMPLES, 'Views'),
  makeExampleEntries(EXTENSION_EXAMPLES, 'Extensions'),
  {
    title: 'Playground',
    category: 'Declarative',
    path: 'playground',
    image: 'images/examples/playground.jpg'
  }
);
