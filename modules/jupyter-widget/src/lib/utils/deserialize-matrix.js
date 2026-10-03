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

function toTypedArray(ArrayType, value) {
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    // Already converted
    return value;
  }
  // The widget protocol delivers binary buffers as DataViews, which may be windows into a larger
  // ArrayBuffer, so byteOffset and byteLength must be honored.
  const view = value instanceof DataView ? value : new DataView(value);
  return new ArrayType(view.buffer, view.byteOffset, view.byteLength / ArrayType.BYTES_PER_ELEMENT);
}

/**
 * Converts pydeck's serialized binary attributes ({layerId: {length, attributes: {name: {dtype, size, value}}}})
 * into deck.gl binary attribute data with typed arrays. Does not mutate its input: the widget model keeps the
 * raw buffers, and every rendered view deserializes them independently.
 */
export function deserializeMatrix(obj) {
  if (!obj) {
    return null;
  }
  const result = {};
  for (const layerId in obj) {
    const {attributes = {}, ...layerData} = obj[layerId];
    const convertedAttributes = {};
    for (const accessorName in attributes) {
      const {dtype, value, ...attribute} = attributes[accessorName];
      convertedAttributes[accessorName] = {
        ...attribute,
        dtype,
        value: toTypedArray(dtypeToTypedArray(dtype), value)
      };
    }
    result[layerId] = {...layerData, attributes: convertedAttributes};
  }
  return result;
}
