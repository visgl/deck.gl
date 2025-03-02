// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {hexToBigInt} from 'quadbin';

// Mimic encoding from backend for testing decoding
export function spatialjsonToBinary(spatial) {
  const count = spatial.length;

  const scheme = count ? inferSpatialIndexType(spatial[0].id) : undefined;
  const indices = {value: new BigUint64Array(count)};
  const cells = {indices, numericProps: {}, properties: []};

  // Create numeric property arrays
  const propArrayTypes = extractNumericPropTypes(spatial);
  const numericPropKeys = Object.keys(propArrayTypes).filter(k => propArrayTypes[k] !== Array);
  for (const propName of numericPropKeys) {
    const T = propArrayTypes[propName];
    cells.numericProps[propName] = {value: new T(count)};
  }

  let i = 0;
  for (const {id, properties} of spatial) {
    cells.indices.value[i] = scheme === 'h3' ? hexToBigInt(id) : id;

    fillNumericProperties(cells.numericProps, properties, i);
    cells.properties.push(keepStringProperties(properties, numericPropKeys));
    i++;
  }

  return {scheme, cells};
}

function inferSpatialIndexType(index) {
  return typeof index === 'bigint' ? 'quadbin' : 'h3';
}

function keepStringProperties(properties, numericKeys) {
  const props = {};
  for (const key in properties) {
    if (!numericKeys.includes(key)) {
      props[key] = properties[key];
    }
  }
  return props;
}

function extractNumericPropTypes(features) {
  const propArrayTypes = {};
  for (const feature of features) {
    if (feature.properties) {
      for (const key in feature.properties) {
        // If property has not been seen before, or if property has been numeric
        // in all previous features, check if numeric in this feature
        // If not numeric, Array is stored to prevent rechecking in the future
        // Additionally, detects if 64 bit precision is required
        const val = feature.properties[key];
        propArrayTypes[key] = deduceArrayType(val, propArrayTypes[key]);
      }
    }
  }

  return propArrayTypes;
}

function fillNumericProperties(numericProps, properties, index) {
  for (const numericPropName in numericProps) {
    if (numericPropName in properties) {
      const value = properties[numericPropName];
      numericProps[numericPropName].value[index] = value;
    }
  }
}

function deduceArrayType(x, constructor) {
  if (constructor === Array || !Number.isFinite(x)) {
    return Array;
  }

  // If this or previous value required 64bits use Float64Array
  return constructor === Float64Array || Math.fround(x) !== x ? Float64Array : Float32Array;
}
