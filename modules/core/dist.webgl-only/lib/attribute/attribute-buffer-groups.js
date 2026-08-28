// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { getStride } from "./gl-utils.js";
import { backendRegistry, cleanEvaluateSync, GPUDataEvaluator, interleave as interleaveTables } from '@luma.gl/gpgpu';
import { interleave as webgpuInterleave } from '@luma.gl/gpgpu/webgpu';
/**
 * Packs explicitly grouped CPU-backed attributes into additional WebGPU vertex buffers.
 *
 * This intentionally does not replace Attribute-owned buffers. Keeping the legacy upload path
 * intact makes unsupported states safe to fall back to and keeps this 9.4 compatibility path
 * isolated from existing WebGL behavior.
 */
export default class AttributeBufferGroups {
    constructor(device, { id, isTransitionAttribute }) {
        this.packedBuffers = {};
        this.device = device;
        this.id = id;
        this.isTransitionAttribute = isTransitionAttribute;
        if (false) {
            backendRegistry.add('webgpu', {
                interleave: webgpuInterleave
            });
        }
    }
    /** Returns whether any attributes explicitly request WebGPU grouping. */
    hasGroups(attributes) {
        return (false &&
            Object.values(attributes).some(attribute => Boolean(attribute.settings.bufferGroup)));
    }
    /** Deletes shared buffers created by this helper. */
    finalize() {
        for (const state of Object.values(this.packedBuffers)) {
            state.packed.destroy();
        }
        this.packedBuffers = {};
    }
    /**
     * Returns constructor-time layouts. Values may not exist yet, so runtime-only fallbacks are
     * resolved by {@link getBindings} before the first draw.
     */
    getBufferLayouts(attributes, modelInfo) {
        const groups = this._getPackedGroups(attributes, modelInfo, {
            requireValues: false,
            excludeAttributes: {}
        });
        return this._getBufferLayouts(attributes, groups, modelInfo);
    }
    /** Returns runtime layouts and shared buffers for a grouped WebGPU model update. */
    getBindings(attributes, changedAttributes, modelInfo, excludeAttributes) {
        const groups = this._getPackedGroups(attributes, modelInfo, {
            requireValues: true,
            excludeAttributes
        });
        const buffers = {};
        const groupedAttributeIds = new Set();
        for (const group of groups.values()) {
            const needsUpload = !this.packedBuffers[group.id] ||
                group.attributes.some(attribute => Boolean(changedAttributes[attribute.id]));
            buffers[group.id] = this._getPackedBuffer(group, needsUpload);
            for (const attribute of group.attributes) {
                groupedAttributeIds.add(attribute.id);
            }
        }
        return {
            bufferLayouts: this._getBufferLayouts(attributes, groups, modelInfo).filter(layout => !excludeAttributes[layout.name] && !attributes[layout.name]?.settings.isIndexed),
            buffers,
            groupedAttributeIds
        };
    }
    _getPackedGroups(attributes, modelInfo, { requireValues, excludeAttributes }) {
        const groupedAttributes = new Map();
        for (const attribute of Object.values(attributes)) {
            const groupId = attribute.settings.bufferGroup;
            if (!groupId) {
                continue;
            }
            const group = groupedAttributes.get(groupId) || [];
            group.push(attribute);
            groupedAttributes.set(groupId, group);
        }
        const packedGroups = new Map();
        for (const [groupId, groupAttributes] of groupedAttributes) {
            const group = this._getPackedGroup(groupId, groupAttributes, modelInfo, requireValues, excludeAttributes);
            if (group) {
                packedGroups.set(groupId, group);
            }
        }
        return packedGroups;
    }
    // eslint-disable-next-line complexity
    _getPackedGroup(id, attributes, modelInfo, requireValues, excludeAttributes) {
        if (attributes.length < 2) {
            return null;
        }
        const layouts = attributes.map(attribute => attribute.getBufferLayout(modelInfo));
        const stepMode = layouts[0].stepMode;
        const rowCount = Math.max(1, attributes[0].numInstances);
        const allConstant = requireValues && attributes.every(attribute => attribute.isConstant);
        for (let index = 0; index < attributes.length; index++) {
            const attribute = attributes[index];
            const accessor = attribute.getAccessor();
            // Binary attributes may override the declared size and type. Eligibility must follow the
            // resolved accessor because that is the row shape published in the buffer layout.
            const naturalStride = accessor.size * accessor.bytesPerElement;
            if (excludeAttributes[attribute.id] ||
                attribute.settings.isIndexed ||
                attribute.settings.noAlloc ||
                attribute.doublePrecision ||
                this.isTransitionAttribute(attribute.id) ||
                layouts[index].stepMode !== stepMode ||
                attribute.numInstances !== attributes[0].numInstances ||
                (accessor.offset || 0) !== 0 ||
                (accessor.vertexOffset || 0) !== 0 ||
                getStride(accessor) !== naturalStride ||
                (requireValues &&
                    (attribute.isConstant
                        ? !attribute.getConstantValue() ||
                            attribute.getConstantValue().byteLength < naturalStride
                        : !ArrayBuffer.isView(attribute.value) ||
                            attribute.value.byteLength < rowCount * naturalStride))) {
                return null;
            }
        }
        const byteOffsets = {};
        const layoutAttributes = [];
        let byteStride = 0;
        for (let index = 0; index < attributes.length; index++) {
            const attribute = attributes[index];
            byteStride = alignTo4(byteStride);
            byteOffsets[attribute.id] = byteStride;
            for (const layoutAttribute of layouts[index].attributes || []) {
                layoutAttributes.push({
                    ...layoutAttribute,
                    byteOffset: byteStride + (layoutAttribute.byteOffset || 0)
                });
            }
            byteStride += getStride(attribute.getAccessor());
        }
        byteStride = alignTo4(byteStride);
        return {
            id,
            attributes,
            byteStride,
            byteOffsets,
            rowCount,
            layout: {
                name: id,
                // Interleave emits one row when every input is constant. A zero stride broadcasts that
                // row without allocating one copy per vertex or instance.
                byteStride: allConstant ? 0 : byteStride,
                stepMode,
                attributes: layoutAttributes
            }
        };
    }
    _getBufferLayouts(attributes, groups, modelInfo) {
        const layouts = [];
        const emittedGroups = new Set();
        const groupedAttributeIds = new Set();
        for (const group of groups.values()) {
            for (const attribute of group.attributes) {
                groupedAttributeIds.add(attribute.id);
            }
        }
        for (const attribute of Object.values(attributes)) {
            const groupId = attribute.settings.bufferGroup;
            const group = groupId && groups.get(groupId);
            if (group && groupedAttributeIds.has(attribute.id)) {
                if (!emittedGroups.has(group.id)) {
                    layouts.push(group.layout);
                    emittedGroups.add(group.id);
                }
            }
            else {
                layouts.push(attribute.getBufferLayout(modelInfo));
            }
        }
        return layouts;
    }
    _getPackedBuffer(group, upload) {
        // Step mode is pipeline metadata; it does not change the packed buffer contents. A layer may
        // share one group across instanced and non-instanced models, as SolidPolygonLayer does for
        // its side and top models.
        const layoutKey = JSON.stringify({
            byteStride: group.layout.byteStride,
            attributes: group.layout.attributes
        });
        const state = this.packedBuffers[group.id];
        if (!state || state.layoutKey !== layoutKey) {
            upload = true;
        }
        if (upload) {
            if (state) {
                state.packed.destroy();
                delete this.packedBuffers[group.id];
            }
            const packed = this._interleavePackedGroup(group);
            this.packedBuffers[group.id] = { packed, layoutKey };
            return packed.buffer;
        }
        if (!state) {
            throw new Error(`Attribute buffer group ${group.id} has no packed buffer`);
        }
        return state.packed.buffer;
    }
    _interleavePackedGroup(group) {
        const evaluators = group.attributes.map(attribute => this._getInterleaveInput(group, attribute));
        const packed = interleaveTables(...evaluators);
        cleanEvaluateSync(this.device, packed);
        return packed;
    }
    _getInterleaveInput(group, attribute) {
        const rowByteLength = getStride(attribute.getAccessor());
        const groupByteOffset = group.byteOffsets[attribute.id];
        assertU32Aligned(`${group.id}.${attribute.id} rowByteLength`, rowByteLength);
        assertU32Aligned(`${group.id}.${attribute.id} groupByteOffset`, groupByteOffset);
        if (attribute.isConstant) {
            const constantValue = attribute.getConstantValue();
            if (!constantValue) {
                throw new Error(`Attribute group ${group.id} is missing constant value ${attribute.id}`);
            }
            assertU32Aligned(`${group.id}.${attribute.id} constant byteOffset`, constantValue.byteOffset);
            // The packed output is a byte-for-byte vertex buffer. Reinterpret the source row as u32
            // so normalized integers retain their original bits when embedded as WGSL literals.
            return new GPUDataEvaluator({
                id: attribute.id,
                type: 'uint32',
                size: rowByteLength / 4,
                isConstant: true,
                value: new Uint32Array(constantValue.buffer, constantValue.byteOffset, rowByteLength / Uint32Array.BYTES_PER_ELEMENT)
            });
        }
        const buffer = attribute.getBuffer();
        const byteOffset = attribute.byteOffset;
        const stride = attribute.getAccessor().stride || rowByteLength;
        assertU32Aligned(`${group.id}.${attribute.id} byteOffset`, byteOffset);
        assertU32Aligned(`${group.id}.${attribute.id} stride`, stride);
        if (!buffer) {
            throw new Error(`Attribute group ${group.id} cannot interleave missing buffer ${attribute.id}`);
        }
        return new GPUDataEvaluator({
            id: attribute.id,
            type: 'uint32',
            size: rowByteLength / 4,
            offset: byteOffset,
            stride,
            length: group.rowCount,
            buffer
        });
    }
}
function alignTo4(value) {
    return Math.ceil(value / 4) * 4;
}
function assertU32Aligned(label, value) {
    if (value % 4 !== 0) {
        throw new Error(`Attribute buffer groups require 32-bit alignment: ${label}=${value}`);
    }
}
//# sourceMappingURL=attribute-buffer-groups.js.map