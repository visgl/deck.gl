// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Attribute} from '@deck.gl/core';
import type {TypedArray} from '@luma.gl/core';

/** This is designed to mirror a vertex shader function
 * For each vertex, calculates a value from attribtes, vertex index and options (uniforms)
 */
export type VertexAccessor<ValueT, OptionsT = undefined> = {
  /** Attribute ids that provide input to getValue, used to index into the attributes map.
   * For example `['position', 'size']`
   */
  sources?: string[];
  /** Called for each data point to retrieve a value during update. */
  getValue: (
    /** Attributes at the vertex index */
    data: any,
    /** Vertex index */
    index: number,
    /** Shared options across all vertices */
    options: OptionsT
  ) => ValueT;
};

/** Evaluate a VertexAccessor with a set of attributes */
export function evaluateVertexAccessor<ValueT, OptionsT>(
  accessor: VertexAccessor<ValueT, OptionsT>,
  attributes: Record<string, Attribute>,
  options: OptionsT
): (vertexIndex: number) => ValueT {
  const vertexReaders: {[id: string]: (i: number) => number | number[]} = {};
  for (const id of accessor.sources || []) {
    const attribute = attributes[id];
    if (attribute) {
      vertexReaders[id] = getVertexReader(attribute);
    } else {
      throw new Error(`Cannot find attribute ${id}`);
    }
  }
  const data: {[id: string]: number | number[]} = {};

  return (vertexIndex: number) => {
    for (const id in vertexReaders) {
      data[id] = vertexReaders[id](vertexIndex);
    }
    return accessor.getValue(data, vertexIndex, options);
  };
}

/** Read value out of a deck.gl Attribute by vertex */
function getVertexReader(attribute: Attribute): (vertexIndex: number) => number | number[] {
  const value = attribute.value as TypedArray;
  const {offset = 0, stride, size} = attribute.getAccessor();
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementOffset = offset / bytesPerElement;
  const elementStride = stride ? stride / bytesPerElement : size;

  if (size === 1) {
    // Size 1, returns (i: number) => number
    if (attribute.isConstant) {
      return () => value[0];
    }
    return (vertexIndex: number) => {
      const i = elementOffset + elementStride * vertexIndex;
      return value[i];
    };
  }

  // Size >1, returns (i: number) => number[]
  let result: number[];
  if (attribute.isConstant) {
    result = Array.from(value);
    return () => result;
  }

  result = new Array(size);
  return (vertexIndex: number) => {
    const i = elementOffset + elementStride * vertexIndex;
    for (let j = 0; j < size; j++) {
      result[j] = value[i + j];
    }
    return result;
  };
}
