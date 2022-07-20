import {h3IsValid} from 'h3-js';

import {indexToBigInt} from '../quadbin-utils';

type SCHEME = 'h3' | 'quadbin';
type PropArrayConstructor = Float32ArrayConstructor | Float64ArrayConstructor | ArrayConstructor;
type TypedArray = Float32Array | Float64Array;

function inferSpatialIndexType(index: string): SCHEME {
  return h3IsValid(index) ? 'h3' : 'quadbin';
}

export function spatialjsonToBinary(spatial): any {
  const count = spatial.length;

  const scheme = count ? inferSpatialIndexType(spatial[0].id) : undefined;
  const indices = {value: new BigUint64Array(count), size: 1};
  const cells = {indices, numericProps: {}, properties: []};

  // Create numeric property arrays
  const propArrayTypes = extractNumericPropTypes(spatial);
  const numericPropKeys = Object.keys(propArrayTypes).filter(k => propArrayTypes[k] !== Array);
  for (const propName of numericPropKeys) {
    const T = propArrayTypes[propName];
    cells.numericProps[propName] = new T(count) as TypedArray;
  }

  let i = 0;
  for (const {id, properties} of spatial) {
    cells.indices.value[i] = indexToBigInt(id);

    fillNumericProperties(cells.numericProps, properties, i);
    i++;
  }

  return {scheme, cells};
}

function extractNumericPropTypes(features: any[]): {
  [key: string]: PropArrayConstructor;
} {
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

function fillNumericProperties(
  numericProps,
  properties: {[x: string]: string | number | boolean | null},
  index: number
): void {
  for (const numericPropName in numericProps) {
    console.log('fill', numericPropName, properties);
    if (numericPropName in properties) {
      const value = properties[numericPropName] as number;
      numericProps[numericPropName][index] = value;
    }
  }
}

function deduceArrayType(x: any, constructor: PropArrayConstructor): PropArrayConstructor {
  if (constructor === Array || !Number.isFinite(x)) {
    return Array;
  }

  // If this or previous value required 64bits use Float64Array
  return constructor === Float64Array || Math.fround(x) !== x ? Float64Array : Float32Array;
}
