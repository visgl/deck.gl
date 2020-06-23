const {resolve} = require('path');

const EXAMPLES = {
  'ArcLayer': 'arc-layer',
  'GeoJsonLayer (Polygons)': 'geojson-layer-polygons',
  'GeoJsonLayer (Paths)': 'geojson-layer-paths',
  'HeatmapLayer': 'heatmap-layer',
  'HexagonLayer': 'hexagon-layer',
  'IconLayer': 'icon-layer',
  'LineLayer': 'line-layer',
  'PointCloudLayer': 'point-cloud-layer',
  'ScatterplotLayer': 'scatterplot-layer',
  'ScreenGridLayer': 'screen-grid-layer',
  'TerrainLayer': 'terrain-layer',
  'TextLayer': 'text-layer',
  'TileLayer': 'tile-layer',
  'Tile3DLayer': 'tile-3d-layer',
  'TripsLayer': 'trips-layer',
  'BrusingExtension': 'brushing-extension',
  'DataFilterExtension': 'data-filter-extension',
  '3D Plot': 'plot'
};

const standaloneExamples = Object.keys(EXAMPLES).map(name => ({
  title: name,
  path: `examples/${EXAMPLES[name]}/`,
  image: `images/examples/${EXAMPLES[name]}.jpg`,
  componentUrl: resolve(`./src/examples/${EXAMPLES[name]}.js`)
}));

const externalExamples = [
  {
    title: 'Playground',
    path: 'playground',
    image: 'images/examples/playground.jpg'
  }
];

module.exports = standaloneExamples.concat(externalExamples);
