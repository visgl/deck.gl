// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Functions to wrangle data from pydeck's row major order matrix dataframe to the deck.gl binary data format.
// The format used is described here:
// https://deck.gl/#/documentation/developer-guide/performance-optimization?section=supply-attributes-directly

// eslint-disable-next-line complexity
function dtypeToTypedArray(dtype) {
  // Supports converting a numpy-typed array to a JavaScript-typed array
  // based on a string value dtype and a DataView `data`
  switch (dtype) {
    case 'int8':
      return Int8Array;
    case 'uint8':
      return Uint8Array;
    case 'int16':
      return Int16Array;
    case 'uint16':
      return Uint16Array;
    case 'float32':
      return Float32Array;
    case 'float64':
      return Float64Array;
    case 'int32':
      return Int32Array;
    case 'uint32':
      return Uint32Array;
    case 'int64':
      return BigInt64Array; // eslint-disable-line no-undef
    case 'uint64':
      return BigUint64Array; // eslint-disable-line no-undef
    default:
      throw new Error(`Unrecognized dtype ${dtype}`);
  }
}

export function deserializeMatrix(obj, manager) {
  if (!obj) {
    return null;
  }
  for (const layerId in obj) {
    const attributes = obj[layerId].attributes;
    for (const accessorName in attributes) {
      const {dtype, value} = attributes[accessorName];
      const ArrayType = dtypeToTypedArray(dtype);
      attributes[accessorName].value = new ArrayType(value.buffer);
    }
  }
  // Becomes the data stored within the widget model at `model.get('data_buffer')`
  return obj;
}
