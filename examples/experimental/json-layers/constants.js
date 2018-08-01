export const JSON_TEMPLATES = {
  'Graph (BezierLayer)': require('./json-files/bezier-graph.json'),
  'US map (GeoJsonLayer)': require('./json-files/us-map.json'),
  'Dot Text (Scatterplot/TextLayer)': require('./json-files/dot-text.json'),
  'Screen Grid (ScreenGridLayer)': require('./json-files/screen-grid.json')
};

// The LAYER_CATALOG is a map of all layers that should be exposes as JSONLayers
export const LAYER_CATALOG = Object.assign({}, require('@deck.gl/layers'), {
  BezierGraphLayer: require('../bezier/bezier-graph-layer').default
});
