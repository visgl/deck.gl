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

import {_shallowEqualObjects, _parseExpressionString} from '@deck.gl/json';
import {MapView, FirstPersonView, OrbitView, OrthographicView} from '@deck.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import enhancedFetch from './enhanced-fetch';

export const DECK_JSON_CONVERTER_CONFIGURATION = {
  // Support all `@deck.gl/core` Views by default
  classes: { MapView, FirstPersonView, OrbitView, OrthographicView },
  enumerations: { COORDINATE_SYSTEM, GL },
  preProcessClassProps(Class, props, configuration) {
    props.fetch = props.fetch || enhancedFetch;
    return convertFunctions(Class, props, configuration);
  },
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

    return json;
  }
};

// TODO - we need to generalize string to function conversion
// and move it upstream into the json-converter
// eslint-disable-next-line complexity
function convertFunctions(Layer, jsonProps, configuration) {
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
