// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import {MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import JSONLayer from '../json-layer/json-layer';
import parseStringExpression from './parse-string-expression';
// TODO - replace with loaders.gl
import enhancedFetch from './enhanced-fetch';

// Support all `@deck.gl/core` Views by default
const DEFAULT_VIEW_CATALOG = {MapView, FirstPersonView, OrbitView, OrthographicView};

const DEFAULT_MAP_PROPS = {
  style: 'mapbox://styles/mapbox/light-v9'
};

// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
export function convertTopLevelJSON(json, configuration) {
  // TODO - Currently converts "in place", might be clearer to convert to separate structure
  const jsonProps = json;

  // Convert "JSON layers" in `json.layers` into class instances
  if (jsonProps.layers) {
    jsonProps.layers = convertJSONLayers(json.layers, configuration);
  }

  // Convert "JSON views" in `json.views` into class instances
  if (jsonProps.views) {
    jsonProps.views = convertJSONViews(json.views, configuration);
  }

  if ('initialViewState' in jsonProps) {
    jsonProps.viewState = jsonProps.viewState || jsonProps.initialViewState;
  }

  convertJSONMapProps(jsonProps, configuration);

  return jsonProps;
}

// Normalizes map/mapStyle etc props to a `map: {style}` object-valued prop
function convertJSONMapProps(jsonProps, configuration) {
  if (jsonProps.map || jsonProps.mapStyle) {
    jsonProps.map = Object.assign({}, DEFAULT_MAP_PROPS, jsonProps.map);
  }

  if (!jsonProps.map) {
    return;
  }

  if ('mapStyle' in jsonProps) {
    jsonProps.map.style = jsonProps.mapStyle;
    jsonProps.map.mapStyle = jsonProps.mapStyle;
    delete jsonProps.mapStyle;
  }

  // TODO - better map handling
  if ('viewState' in jsonProps) {
    jsonProps.map.viewState = jsonProps.viewState;
  }
}

// Use the composite JSONLayer to render any JSON layers
function convertJSONLayers(jsonLayers, configuration) {
  return [
    new JSONLayer({
      data: jsonLayers,
      configuration
    })
  ];
}

// Instantiates views: `{type: MapView, ...props}` to `MapView(...props)`
function convertJSONViews(jsonViews, configuration) {
  if (!jsonViews) {
    return jsonViews;
  }

  const viewCatalog = configuration.views || {};

  jsonViews = Array.isArray(jsonViews) ? jsonViews : [jsonViews];
  return jsonViews
    .map(jsonView => {
      // Try to find a view definition
      const View = viewCatalog[jsonView.type] || DEFAULT_VIEW_CATALOG[jsonView.type];
      // Instantiate it
      if (View) {
        const viewProps = Object.assign({}, jsonView);
        delete viewProps.type;
        return new View(viewProps);
      }
      return null;
    })
    .filter(Boolean);
}

// LAYERS

// Replaces accessor props
export function getJSONLayers(jsonLayers = [], configuration) {
  // assert(Array.isArray(jsonLayers));
  const layerCatalog = configuration.layers || {};
  return jsonLayers.map(jsonLayer => {
    const Layer = layerCatalog[jsonLayer.type];
    const props = getJSONLayerProps(Layer, jsonLayer, configuration);
    props.fetch = enhancedFetch;
    return Layer && new Layer(props);
  });
}

function getJSONLayerProps(Layer, jsonProps, configuration) {
  const replacedProps = {};
  for (const propName in jsonProps) {
    let propValue = jsonProps[propName];

    // Parse string valued expressions
    if (typeof propValue === 'string') {
      const propType = Layer && Layer._mergedDefaultProps && Layer._mergedDefaultProps[propName];
      let type = typeof propType === 'object' && propType.type;
      // TODO - should not be needed if prop types are good
      if (propName.startsWith('get')) {
        type = 'accessor';
      }
      switch (type) {
        case 'accessor':
          const isAccessor = true;
          propValue = parseStringExpression(propValue, configuration, isAccessor);
          break;
        case 'function':
          propValue = parseStringExpression(propValue, configuration);
          break;
        default:
      }
    }

    // Invalid functions return null, show default value instead.
    if (propValue) {
      replacedProps[propName] = propValue;
    }
  }
  return replacedProps;
}
