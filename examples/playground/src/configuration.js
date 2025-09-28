// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// This configuration object determines which deck.gl classes are accessible in Playground

import {MapView, FirstPersonView, OrbitView, OrthographicView, View, Layer} from '@deck.gl/core';
import * as Layers from '@deck.gl/layers';
import * as AggregationLayers from '@deck.gl/aggregation-layers';
import * as GeoLayers from '@deck.gl/geo-layers';
import * as MeshLayers from '@deck.gl/mesh-layers';
import {CARTO_LAYERS, colorBins, colorCategories, colorContinuous} from '@deck.gl/carto';
import {CARTO_SOURCES} from '@carto/api-client';
import * as Widgets from '@deck.gl/widgets';

import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GL as GLConstants} from '@luma.gl/constants';

import {registerLoaders} from '@loaders.gl/core';
import {CSVLoader} from '@loaders.gl/csv';
import {DracoWorkerLoader} from '@loaders.gl/draco';
import {Tiles3DLoader, CesiumIonLoader} from '@loaders.gl/3d-tiles';

// Note: deck already registers JSONLoader...
registerLoaders([CSVLoader, DracoWorkerLoader]);

export default {
  // Classes that should be instantiatable by JSON converter
  classes: Object.assign(
    // Support `@deck.gl/core` Views
    {MapView, FirstPersonView, OrbitView, OrthographicView},
    // a map of all layers that should be exposes as JSONLayers
    Layers,
    AggregationLayers,
    CARTO_LAYERS,
    GeoLayers,
    MeshLayers,
    // Support `@deck.gl/widgets` Widgets
    Widgets,
    // Any non-standard views
    {}
  ),

  // Functions that should be executed by JSON converter
  functions: {...CARTO_SOURCES, colorBins, colorCategories, colorContinuous},

  // Enumerations that should be available to JSON parser
  // Will be resolved as `<enum-name>.<enum-value>`
  enumerations: {
    COORDINATE_SYSTEM,
    GL: GLConstants
  },

  // Constants that should be resolved with the provided values by JSON converter
  constants: {
    Tiles3DLoader,
    CesiumIonLoader
  },

  postProcessConvertedJson: json => {
    // Filter out invalid props. Typically, props will be invalid while the user is typing.
    if (json.layers) {
      json.layers = json.layers.filter(layer => layer instanceof Layer);
    }
    if (json.widgets) {
      json.widgets = json.widgets.filter(widget => typeof widget.onAdd === 'function');
    }
    if (json.views && !(json.views instanceof View)) {
      json.views = json.views.filter(view => view instanceof View);
    }
    return json;
  }
};
