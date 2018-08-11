// The LAYER_CATALOG is a map of all layers that should be exposes as JSONLayers
export const LAYER_CATALOG = Object.assign({}, require('@deck.gl/layers'), {
  BezierGraphLayer: require('../experimental/bezier/bezier-graph-layer').default,
  PlotLayer: require('../website/plot/plot-layer').default
});
