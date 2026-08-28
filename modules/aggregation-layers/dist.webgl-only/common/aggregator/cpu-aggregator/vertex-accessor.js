// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/** Evaluate a VertexAccessor with a set of attributes */
export function evaluateVertexAccessor(accessor, attributes, options) {
    const vertexReaders = {};
    for (const id of accessor.sources || []) {
        const attribute = attributes[id];
        if (attribute) {
            vertexReaders[id] = getVertexReader(attribute);
        }
        else {
            throw new Error(`Cannot find attribute ${id}`);
        }
    }
    const data = {};
    return (vertexIndex) => {
        for (const id in vertexReaders) {
            data[id] = vertexReaders[id](vertexIndex);
        }
        return accessor.getValue(data, vertexIndex, options);
    };
}
/** Read value out of a deck.gl Attribute by vertex */
function getVertexReader(attribute) {
    const value = attribute.value;
    const { offset = 0, stride, size } = attribute.getAccessor();
    const bytesPerElement = value.BYTES_PER_ELEMENT;
    const elementOffset = offset / bytesPerElement;
    const elementStride = stride ? stride / bytesPerElement : size;
    if (size === 1) {
        // Size 1, returns (i: number) => number
        if (attribute.isConstant) {
            return () => value[0];
        }
        return (vertexIndex) => {
            const i = elementOffset + elementStride * vertexIndex;
            return value[i];
        };
    }
    // Size >1, returns (i: number) => number[]
    let result;
    if (attribute.isConstant) {
        result = Array.from(value);
        return () => result;
    }
    result = new Array(size);
    return (vertexIndex) => {
        const i = elementOffset + elementStride * vertexIndex;
        for (let j = 0; j < size; j++) {
            result[j] = value[i + j];
        }
        return result;
    };
}
//# sourceMappingURL=vertex-accessor.js.map