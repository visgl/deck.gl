// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
// TODO - Currently converts in place, might be clearer to convert to separate structure

// Converts a JSON payload to a deck.gl props object
// Lightly processes `json` props, transform string values, and extract `views` and `layers`
// See: https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md
//
// NOTES:
// * This is intended to provide minimal necessary processing required to support
//   existing deck.gl props via JSON. This is not an implementation of alternate JSON schemas.
// * Optionally, error checking could be applied, but ideally should leverage
//   non-JSON specific mechanisms like prop types.

import {_JSONConverter, _shallowEqualObjects, _parseExpressionString} from '@deck.gl/json';
import enhancedFetch from './enhanced-fetch';

import DeckJSONConfiguration from './deck-json-configuration';

export const DEFAULT_MAP_PROPS = {style: 'mapbox://styles/mapbox/light-v9'};

export default class DeckJSONConverter extends _JSONConverter {
  constructor(props) {
    super({
      ...props,
      // Inject default deck configuration
      configuration: new DeckJSONConfiguration(props.configuration)
    });
    this.configuration.preProcessClassProps = this.preProcessClassProps.bind(this);
  }

  preProcessClassProps(Class, props) {
    props.fetch = props.fetch || enhancedFetch;
    return getJSONLayerProps(Class, props, this.configuration);
  }

  postProcessConvertedJson(json) {
    // Handle `json.initialViewState`
    // If we receive new JSON we need to decide if we should update current view state
    // Current heuristic is to compare with last `initialViewState` and only update if changed
    if ('initialViewState' in json) {
      const updateViewState =
        !this.initialViewState ||
        !_shallowEqualObjects(json.initialViewState, this.initialViewState);

      if (updateViewState) {
        json.viewState = json.viewState || json.initialViewState;
        this.initialViewState = json.initialViewState;
      }

      delete json.initialViewState;
    }

    normalizeMapProps(json, this.configuration);

    return json;
  }
}

/*
// Converts JSON to props ("hydrating" classes, resolving enums and functions etc).
export function convertDeckJSON(json, configuration) {
  const jsonProps = convertJSON(json, configuration);

  // Normalize deck props
  if ('initialViewState' in jsonProps) {
    jsonProps.viewState = jsonProps.viewState || jsonProps.initialViewState;
  }

  normalizeMapProps(jsonProps, configuration);

  return jsonProps;
}
*/

// Normalizes map/mapStyle etc props to a `map: {style}` object-valued prop
function normalizeMapProps(jsonProps, configuration) {
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

// LAYERS
/*
// Replaces accessor props
export function getJSONLayers(jsonLayers = [], configuration) {
  // assert(Array.isArray(jsonLayers));
  const layerCatalog = configuration.layers || {};
  return jsonLayers.map(jsonLayer => {
    const Layer = layerCatalog[jsonLayer.type];
    const props = getJSONLayerProps(Layer, jsonLayer, configuration);
    return Layer && new Layer(props);
  });
}
*/

// TODO - we need to generalize string to function conversion
// and move it upstream into the json-converter
// eslint-disable-next-line complexity
function getJSONLayerProps(Layer, jsonProps, configuration) {
  let propTypes = Layer && Layer._propTypes && Layer._propTypes;
  // HACK: Trigger generation of propType
  if (!propTypes && Layer.defaultProps) {
    new Layer({}); // eslint-disable-line no-new
    propTypes = Layer && Layer._propTypes && Layer._propTypes;
  }
  if (!propTypes) {
    return jsonProps;
  }
  const replacedProps = {};
  for (const propName in jsonProps) {
    let propValue = jsonProps[propName];

    // Parse string valued expressions
    if (typeof propValue === 'string') {
      propValue = convertStringProp(propValue, propName, propTypes, configuration);
    }

    // Invalid functions return null, show default value instead.
    if (propValue) {
      replacedProps[propName] = propValue;
    }
  }
  return replacedProps;
}

function convertStringProp(propValue, propName, propTypes, configuration) {
  const propType = propTypes[propName];
  let type = typeof propType === 'object' && propType.type;
  // TODO - should not be needed if prop types are good
  if (propName.startsWith('get')) {
    type = 'accessor';
  }
  switch (type) {
    case 'accessor':
      const isAccessor = true;
      propValue = _parseExpressionString(propValue, configuration, isAccessor);
      break;
    case 'function':
      propValue = _parseExpressionString(propValue, configuration);
      break;
    default:
  }

  return propValue;
}
