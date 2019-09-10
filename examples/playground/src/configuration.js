import {COORDINATE_SYSTEM, log} from '@deck.gl/core';
import GL from '@luma.gl/constants';

import * as Layers from '@deck.gl/layers';
import * as AggregationLayers from '@deck.gl/aggregation-layers';
import * as GeoLayers from '@deck.gl/geo-layers';
import * as MeshLayers from '@deck.gl/mesh-layers';

export default {
  log,

  // Classes that should be instantiatable by JSON converter
  classes: Object.assign(
    {},
    // a map of all layers that should be exposes as JSONLayers
    Layers,
    AggregationLayers,
    GeoLayers,
    MeshLayers,
    // Any non-standard views
    {}
  ),

  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL
  }
};
