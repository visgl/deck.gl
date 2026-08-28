// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { dataTypeDecoder, getTypedArrayConstructor } from '@luma.gl/core';
export function typedArrayFromDataType(type) {
    // Sorted in some order of likelihood to reduce amount of comparisons
    switch (type) {
        case 'float64':
            return Float64Array;
        case 'uint8':
        case 'unorm8':
            return Uint8ClampedArray;
        default:
            return getTypedArrayConstructor(type);
    }
}
export const dataTypeFromTypedArray = dataTypeDecoder.getDataType.bind(dataTypeDecoder);
export function getBufferAttributeLayout(name, accessor, deviceType) {
    if (accessor.size > 4) {
        // Definitely not valid. TODO - stricter validation?
        return null;
    }
    // TODO(ibgreen): WebGPU change. Currently we always use normalized 8 bit integers
    const type = deviceType === 'webgpu' && accessor.type === 'uint8' ? 'unorm8' : accessor.type;
    const size = accessor.size;
    const webglOnly = Boolean(deviceType !== 'webgpu' &&
        size === 3 &&
        type &&
        ['uint8', 'sint8', 'unorm8', 'snorm8', 'uint16', 'sint16', 'unorm16', 'snorm16'].includes(type));
    return {
        attribute: name,
        // @ts-expect-error Not all combinations are valid vertex formats; it's up to DataColumn to ensure
        format: size > 1 ? `${type}x${size}${webglOnly ? '-webgl' : ''}` : accessor.type,
        byteOffset: accessor.offset || 0
        // Note stride is set on the top level
    };
}
export function getStride(accessor) {
    return accessor.stride || accessor.size * accessor.bytesPerElement;
}
export function bufferLayoutEqual(accessor1, accessor2) {
    return (accessor1.type === accessor2.type &&
        accessor1.size === accessor2.size &&
        getStride(accessor1) === getStride(accessor2) &&
        (accessor1.offset || 0) === (accessor2.offset || 0));
}
//# sourceMappingURL=gl-utils.js.map