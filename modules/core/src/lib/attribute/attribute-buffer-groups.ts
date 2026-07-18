// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Attribute from './attribute';
import {getStride} from './gl-utils';

import {Buffer} from '@luma.gl/core';
import type {BufferAttributeLayout, BufferLayout, Device} from '@luma.gl/core';

type ModelInfo = {
  isInstanced?: boolean;
};

type PackedGroup = {
  id: string;
  attributes: Attribute[];
  layout: BufferLayout;
  byteStride: number;
  byteOffsets: Record<string, number>;
  rowCount: number;
};

type PackedGroupState = {
  buffer: Buffer;
  layoutKey: string;
};

/** Internal bindings produced for explicitly grouped WebGPU attributes. */
export type AttributeBufferGroupBindings = {
  /** Layouts for the current model, including ungrouped fallback attributes. */
  bufferLayouts: BufferLayout[];
  /** Shared vertex buffers keyed by group id. */
  buffers: Record<string, Buffer>;
  /** Source attribute ids consumed by shared buffers. */
  groupedAttributeIds: Set<string>;
};

/**
 * Packs explicitly grouped CPU-backed attributes into additional WebGPU vertex buffers.
 *
 * This intentionally does not replace Attribute-owned buffers. Keeping the legacy upload path
 * intact makes unsupported states safe to fall back to and keeps this 9.4 compatibility path
 * isolated from existing WebGL behavior.
 */
export default class AttributeBufferGroups {
  private device: Device;
  private id: string;
  private isTransitionAttribute: (attributeName: string) => boolean;
  private packedBuffers: Record<string, PackedGroupState> = {};

  constructor(
    device: Device,
    {
      id,
      isTransitionAttribute
    }: {
      id: string;
      isTransitionAttribute: (attributeName: string) => boolean;
    }
  ) {
    this.device = device;
    this.id = id;
    this.isTransitionAttribute = isTransitionAttribute;
  }

  /** Returns whether any attributes explicitly request WebGPU grouping. */
  hasGroups(attributes: Record<string, Attribute>): boolean {
    return (
      this.device.type === 'webgpu' &&
      Object.values(attributes).some(attribute => Boolean(attribute.settings.bufferGroup))
    );
  }

  /** Deletes shared buffers created by this helper. */
  finalize(): void {
    for (const state of Object.values(this.packedBuffers)) {
      state.buffer.delete();
    }
    this.packedBuffers = {};
  }

  /**
   * Returns constructor-time layouts. Values may not exist yet, so runtime-only fallbacks are
   * resolved by {@link getBindings} before the first draw.
   */
  getBufferLayouts(attributes: Record<string, Attribute>, modelInfo?: ModelInfo): BufferLayout[] {
    const groups = this._getPackedGroups(attributes, modelInfo, {
      requireValues: false,
      excludeAttributes: {}
    });
    return this._getBufferLayouts(attributes, groups, modelInfo);
  }

  /** Returns runtime layouts and shared buffers for a grouped WebGPU model update. */
  getBindings(
    attributes: Record<string, Attribute>,
    changedAttributes: Record<string, Attribute>,
    modelInfo: ModelInfo | undefined,
    excludeAttributes: Record<string, boolean>
  ): AttributeBufferGroupBindings {
    const groups = this._getPackedGroups(attributes, modelInfo, {
      requireValues: true,
      excludeAttributes
    });
    const buffers: Record<string, Buffer> = {};
    const groupedAttributeIds = new Set<string>();

    for (const group of groups.values()) {
      const needsUpload =
        !this.packedBuffers[group.id] ||
        group.attributes.some(attribute => Boolean(changedAttributes[attribute.id]));
      buffers[group.id] = this._getPackedBuffer(group, needsUpload);
      for (const attribute of group.attributes) {
        groupedAttributeIds.add(attribute.id);
      }
    }

    return {
      bufferLayouts: this._getBufferLayouts(attributes, groups, modelInfo),
      buffers,
      groupedAttributeIds
    };
  }

  private _getPackedGroups(
    attributes: Record<string, Attribute>,
    modelInfo: ModelInfo | undefined,
    {
      requireValues,
      excludeAttributes
    }: {
      requireValues: boolean;
      excludeAttributes: Record<string, boolean>;
    }
  ): Map<string, PackedGroup> {
    const groupedAttributes = new Map<string, Attribute[]>();

    for (const attribute of Object.values(attributes)) {
      const groupId = attribute.settings.bufferGroup;
      if (!groupId) {
        continue;
      }
      const group = groupedAttributes.get(groupId) || [];
      group.push(attribute);
      groupedAttributes.set(groupId, group);
    }

    const packedGroups = new Map<string, PackedGroup>();
    for (const [groupId, groupAttributes] of groupedAttributes) {
      const group = this._getPackedGroup(
        groupId,
        groupAttributes,
        modelInfo,
        requireValues,
        excludeAttributes
      );
      if (group) {
        packedGroups.set(groupId, group);
      }
    }
    return packedGroups;
  }

  // eslint-disable-next-line complexity
  private _getPackedGroup(
    id: string,
    attributes: Attribute[],
    modelInfo: ModelInfo | undefined,
    requireValues: boolean,
    excludeAttributes: Record<string, boolean>
  ): PackedGroup | null {
    if (attributes.length < 2) {
      return null;
    }

    const layouts = attributes.map(attribute => attribute.getBufferLayout(modelInfo));
    const stepMode = layouts[0].stepMode;
    const rowCount = Math.max(1, attributes[0].numInstances);

    for (let index = 0; index < attributes.length; index++) {
      const attribute = attributes[index];
      const accessor = attribute.getAccessor();
      const naturalStride = attribute.size * accessor.bytesPerElement;

      if (
        excludeAttributes[attribute.id] ||
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
          (!ArrayBuffer.isView(attribute.value) ||
            attribute.value.byteLength < rowCount * naturalStride))
      ) {
        return null;
      }
    }

    const byteOffsets: Record<string, number> = {};
    const layoutAttributes: BufferAttributeLayout[] = [];
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
        byteStride,
        stepMode,
        attributes: layoutAttributes
      }
    };
  }

  private _getBufferLayouts(
    attributes: Record<string, Attribute>,
    groups: Map<string, PackedGroup>,
    modelInfo?: ModelInfo
  ): BufferLayout[] {
    const layouts: BufferLayout[] = [];
    const emittedGroups = new Set<string>();
    const groupedAttributeIds = new Set<string>();

    for (const group of groups.values()) {
      for (const attribute of group.attributes) {
        groupedAttributeIds.add(attribute.id);
      }
    }

    for (const attribute of Object.values(attributes)) {
      if (attribute.settings.isIndexed) {
        continue;
      }
      const groupId = attribute.settings.bufferGroup;
      const group = groupId && groups.get(groupId);
      if (group && groupedAttributeIds.has(attribute.id)) {
        if (!emittedGroups.has(group.id)) {
          layouts.push(group.layout);
          emittedGroups.add(group.id);
        }
      } else {
        layouts.push(attribute.getBufferLayout(modelInfo));
      }
    }

    return layouts;
  }

  private _getPackedBuffer(group: PackedGroup, upload: boolean): Buffer {
    const byteLength = group.rowCount * group.byteStride;
    const layoutKey = JSON.stringify(group.layout);
    let state = this.packedBuffers[group.id];

    if (!state || state.buffer.byteLength < byteLength || state.layoutKey !== layoutKey) {
      state?.buffer.delete();
      state = {
        buffer: this.device.createBuffer({
          id: `${this.id}-${group.id}`,
          usage: Buffer.VERTEX | Buffer.COPY_DST,
          byteLength
        }),
        layoutKey
      };
      this.packedBuffers[group.id] = state;
      upload = true;
    }

    if (upload) {
      const data = new Uint8Array(byteLength);
      for (const attribute of group.attributes) {
        const value = attribute.value as ArrayBufferView;
        const source = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        const sourceStride = getStride(attribute.getAccessor());
        const targetOffset = group.byteOffsets[attribute.id];

        for (let row = 0; row < group.rowCount; row++) {
          const sourceOffset = row * sourceStride;
          data.set(
            source.subarray(sourceOffset, sourceOffset + sourceStride),
            row * group.byteStride + targetOffset
          );
        }
      }
      state.buffer.write(data);
    }

    return state.buffer;
  }
}

function alignTo4(value: number): number {
  return Math.ceil(value / 4) * 4;
}
