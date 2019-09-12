// TODO - This file contains too much custom code, should just require a clean `JSONConfiguration`.

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).

// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import {_convertFunctions} from '@deck.gl/json';

import {MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import * as Layers from '@deck.gl/layers';
import * as AggregationLayers from '@deck.gl/aggregation-layers';
import * as GeoLayers from '@deck.gl/geo-layers';
import * as MeshLayers from '@deck.gl/mesh-layers';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

export default {
  // Classes that should be instantiatable by JSON converter
  classes: Object.assign(
    // Support `@deck.gl/core` Views
    {MapView, FirstPersonView, OrbitView, OrthographicView},
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
  },

  preProcessClassProps(Class, props, configuration) {
    return _convertFunctions(Class, props, configuration);
  }
};
