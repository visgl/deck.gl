// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { createIterable, getAccessorFromBuffer } from "./iterable-utils.js";
import defaultTypedArrayManager from "./typed-array-manager.js";
import assert from "./assert.js";
import { Buffer } from '@luma.gl/core';
export default class Tesselator {
    constructor(opts) {
        this.indexStarts = [0];
        this.vertexStarts = [0];
        this.vertexCount = 0;
        this.instanceCount = 0;
        const { attributes = {} } = opts;
        this.typedArrayManager = defaultTypedArrayManager;
        this.attributes = {};
        this._attributeDefs = attributes;
        this.opts = opts;
        this.updateGeometry(opts);
    }
    /* Public methods */
    updateGeometry(opts) {
        Object.assign(this.opts, opts);
        const { data, buffers = {}, getGeometry, geometryBuffer, positionFormat, dataChanged, normalize = true } = this.opts;
        this.data = data;
        this.getGeometry = getGeometry;
        this.positionSize =
            // @ts-ignore (2339) when geometryBuffer is a luma Buffer, size falls back to positionFormat
            (geometryBuffer && geometryBuffer.size) || (positionFormat === 'XY' ? 2 : 3);
        this.buffers = buffers;
        this.normalize = normalize;
        // Handle external logical value
        if (geometryBuffer) {
            assert(data.startIndices); // binary data missing startIndices
            this.getGeometry = this.getGeometryFromBuffer(geometryBuffer);
            if (!normalize) {
                // skip packing and set attribute value directly
                // TODO - avoid mutating user-provided object
                buffers.vertexPositions = geometryBuffer;
            }
        }
        this.geometryBuffer = buffers.vertexPositions;
        if (Array.isArray(dataChanged)) {
            // is partial update
            for (const dataRange of dataChanged) {
                this._rebuildGeometry(dataRange);
            }
        }
        else {
            this._rebuildGeometry();
        }
    }
    updatePartialGeometry({ startRow, endRow }) {
        this._rebuildGeometry({ startRow, endRow });
    }
    getGeometryFromBuffer(geometryBuffer) {
        const value = geometryBuffer.value || geometryBuffer;
        if (!ArrayBuffer.isView(value)) {
            // Cannot read binary geometries
            return null;
        }
        // @ts-ignore (2322) NumericArray not assignable to GeometryT
        return getAccessorFromBuffer(value, {
            size: this.positionSize,
            offset: geometryBuffer.offset,
            stride: geometryBuffer.stride,
            startIndices: this.data.startIndices
        });
    }
    /* Private utility methods */
    _allocate(instanceCount, copy) {
        // allocate attributes
        const { attributes, buffers, _attributeDefs, typedArrayManager } = this;
        for (const name in _attributeDefs) {
            if (name in buffers) {
                // Use external buffer
                typedArrayManager.release(attributes[name]);
                attributes[name] = null;
            }
            else {
                const def = _attributeDefs[name];
                // If dataRange is supplied, this is a partial update.
                // In case we need to reallocate the typed array, it will need the old values copied
                // before performing partial update.
                def.copy = copy;
                attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
            }
        }
    }
    /**
     * Visit all objects
     * `data` is expected to be an iterable consistent with the base Layer expectation
     */
    _forEachGeometry(visitor, startRow, endRow) {
        const { data, getGeometry } = this;
        const { iterable, objectInfo } = createIterable(data, startRow, endRow);
        for (const object of iterable) {
            objectInfo.index++;
            const geometry = getGeometry ? getGeometry(object, objectInfo) : null;
            visitor(geometry, objectInfo.index);
        }
    }
    /* eslint-disable complexity,max-statements */
    _rebuildGeometry(dataRange) {
        if (!this.data) {
            return;
        }
        let { indexStarts, vertexStarts, instanceCount } = this;
        const { data, geometryBuffer } = this;
        const { startRow = 0, endRow = Infinity } = dataRange || {};
        const normalizedData = {};
        if (!dataRange) {
            // Full update - regenerate buffer layout from scratch
            indexStarts = [0];
            vertexStarts = [0];
        }
        if (this.normalize || !geometryBuffer) {
            this._forEachGeometry((geometry, dataIndex) => {
                const normalizedGeometry = geometry && this.normalizeGeometry(geometry);
                normalizedData[dataIndex] = normalizedGeometry;
                vertexStarts[dataIndex + 1] =
                    vertexStarts[dataIndex] +
                        (normalizedGeometry ? this.getGeometrySize(normalizedGeometry) : 0);
            }, startRow, endRow);
            // count instances
            instanceCount = vertexStarts[vertexStarts.length - 1];
        }
        else {
            // assume user provided data is already normalized
            vertexStarts = data.startIndices;
            instanceCount = vertexStarts[data.length] || 0;
            if (ArrayBuffer.isView(geometryBuffer)) {
                instanceCount = instanceCount || geometryBuffer.length / this.positionSize;
            }
            else if (geometryBuffer instanceof Buffer) {
                const byteStride = this.positionSize * 4;
                instanceCount = instanceCount || geometryBuffer.byteLength / byteStride;
            }
            else if (geometryBuffer.buffer) {
                const byteStride = geometryBuffer.stride || this.positionSize * 4;
                instanceCount = instanceCount || geometryBuffer.buffer.byteLength / byteStride;
            }
            else if (geometryBuffer.value) {
                const bufferValue = geometryBuffer.value;
                const elementStride = 
                // @ts-ignore (2339) if stride is not specified, will fall through to positionSize
                geometryBuffer.stride / bufferValue.BYTES_PER_ELEMENT || this.positionSize;
                instanceCount = instanceCount || bufferValue.length / elementStride;
            }
        }
        // allocate attributes
        this._allocate(instanceCount, Boolean(dataRange));
        this.indexStarts = indexStarts;
        this.vertexStarts = vertexStarts;
        this.instanceCount = instanceCount;
        // @ts-ignore (2739) context will be populated in the loop
        const context = {};
        this._forEachGeometry((geometry, dataIndex) => {
            const normalizedGeometry = normalizedData[dataIndex] || geometry;
            context.vertexStart = vertexStarts[dataIndex];
            context.indexStart = indexStarts[dataIndex];
            const vertexEnd = dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
            context.geometrySize = vertexEnd - vertexStarts[dataIndex];
            context.geometryIndex = dataIndex;
            this.updateGeometryAttributes(normalizedGeometry, context);
        }, startRow, endRow);
        this.vertexCount = indexStarts[indexStarts.length - 1];
    }
}
//# sourceMappingURL=tesselator.js.map