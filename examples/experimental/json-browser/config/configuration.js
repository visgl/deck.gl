import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

import * as Layers from '@deck.gl/layers';
import * as AggregationLayers from '@deck.gl/aggregation-layers';
import * as GeoLayers from '@deck.gl/geo-layers';
import * as MeshLayers from '@deck.gl/mesh-layers';

export default {
  // a map of all layers that should be exposes as JSONLayers
  layers: Object.assign({}, Layers, AggregationLayers, GeoLayers, MeshLayers, {
    BezierGraphLayer: require('../../bezier/src/bezier-graph-layer').default
    // PlotLayer: require('../../website/plot/plot-layer').default
  }),
  // Any non-standard views
  views: {},
  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL
  }
};
