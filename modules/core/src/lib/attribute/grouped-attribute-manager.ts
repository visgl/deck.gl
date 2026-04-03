// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable guard-for-in */
import Attribute from './attribute';
import AttributeManager from './attribute-manager';

import {Buffer} from '@luma.gl/core';
import type {Device, BufferLayout, BufferAttributeLayout} from '@luma.gl/core';
import type {Stats} from '@probe.gl/stats';
import type {Timeline} from '@luma.gl/engine';
import type {NumericArray, TypedArray} from '../../types/types';

/** A logical attribute group that may publish as one shared vertex buffer. */
type AttributeGroup = {
  id: string;
  attributes: Attribute[];
};

/** Published outputs emitted by `GroupedAttributeManager` for model binding. */
export type GroupedPublishedAttributes = {
  buffers: Record<string, Buffer>;
  constants: Record<string, TypedArray>;
  indexBuffers: Buffer[];
};

/** Cached packed buffer layout metadata for a shared attribute group. */
type PackedBufferGroupLayout = {
  id: string;
  byteStride: number;
  byteLength: number;
  stepMode: 'vertex' | 'instance';
  attributeOffsets: Record<string, number>;
  attributeNames: string[];
  layout: BufferLayout;
};

/** Shared GPU buffer state for a packed attribute group. */
type PackedBufferGroupState = {
  buffer: Buffer;
  layout: PackedBufferGroupLayout;
};

export default class GroupedAttributeManager extends AttributeManager {
  private packedBuffers: Record<string, PackedBufferGroupState>;
  /** Controls whether constant attributes are materialized into GPU buffers. */
  readonly generateConstantAttributes: boolean;

  constructor(
    device: Device,
    {
      generateConstantAttributes,
      ...props
    }: {
      id?: string;
      stats?: Stats;
      timeline?: Timeline;
      generateConstantAttributes?: boolean;
    } = {}
  ) {
    super(device, props);
    this.generateConstantAttributes =
      device.type === 'webgpu' ? true : (generateConstantAttributes ?? false);
    this.packedBuffers = {};
    Object.seal(this);
  }

  override finalize() {
    for (const state of Object.values(this.packedBuffers)) {
      state.buffer.delete();
    }
    super.finalize();
  }

  // eslint-disable-next-line complexity
  override update({
    data,
    numInstances,
    startIndices = null,
    transitions,
    props = {},
    buffers = {},
    context = {}
  }: {
    data: any;
    numInstances: number;
    startIndices?: NumericArray | null;
    transitions: any;
    props: any;
    buffers: any;
    context: any;
  }) {
    let updated = false;
    const sharedPackedGroupIds = this._getSharedPackedGroupIds();

    if (this.stats) {
      this.stats.get('Update Attributes').timeStart();
    }

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      const generateAttributeBuffer =
        !sharedPackedGroupIds.has(this._getAttributeGroupId(attribute)) ||
        Boolean(attribute.settings.transition);
      const generateConstantBuffer =
        generateAttributeBuffer &&
        (this.generateConstantAttributes || Boolean(attribute.settings.transition));

      attribute.startIndices = startIndices;
      attribute.numInstances = numInstances;

      if (attribute.setExternalBuffer(buffers[attributeName])) {
        // external buffer
      } else if (
        attribute.setBinaryValue(
          typeof accessorName === 'string' ? buffers[accessorName] : undefined,
          data.startIndices,
          generateAttributeBuffer
        )
      ) {
        // binary typed array
      } else if (
        typeof accessorName === 'string' &&
        !buffers[accessorName] &&
        attribute.setConstantValue(context, props[accessorName], generateConstantBuffer)
      ) {
        // constant prop
      } else if (attribute.needsUpdate()) {
        updated = true;
        this._updateAttribute({
          attribute,
          numInstances,
          data,
          props,
          context,
          generateAttributeBuffer,
          generateConstantBuffer
        });
      }

      this.needsRedraw = this.needsRedraw || attribute.needsRedraw();
    }

    if (this.stats) {
      this.stats.get('Update Attributes').timeEnd();
      if (updated) this.stats.get('Attributes updated').incrementCount();
    }

    this.attributeTransitionManager.update({
      attributes: this.attributes,
      numInstances,
      transitions
    });
  }

  override getBufferLayouts(modelInfo?: {isInstanced?: boolean}): BufferLayout[] {
    const groups = this._getAttributeGroups(Object.values(this.getAttributes()));
    const layouts: BufferLayout[] = [];

    for (const group of Object.values(groups)) {
      if (group.attributes[0].settings.isIndexed) {
        layouts.push(group.attributes[0].getBufferLayout(modelInfo));
      } else if (this._canPackAttributes(group.attributes)) {
        layouts.push(this._getPackedBufferGroupLayout(group, modelInfo).layout);
      } else {
        for (const attribute of group.attributes) {
          layouts.push(attribute.getBufferLayout(modelInfo));
        }
      }
    }

    return layouts;
  }

  /** Returns whether any active group currently publishes as a shared packed buffer. */
  hasPackedBufferGroups(): boolean {
    return this._getSharedPackedGroupIds().size > 0;
  }

  /** Publishes changed groups as vertex buffers, constants, and index buffers. */
  getPublishedAttributes(changedAttributes: {[id: string]: Attribute}): GroupedPublishedAttributes {
    const groups = this._getAttributeGroups(Object.values(this.getAttributes()));
    const touchedGroupIds = new Set<string>();
    const buffers: Record<string, Buffer> = {};
    const constants: Record<string, TypedArray> = {};
    const indexBuffers: Buffer[] = [];

    for (const attribute of Object.values(changedAttributes)) {
      touchedGroupIds.add(this._getAttributeGroupId(attribute));
    }

    for (const groupId of touchedGroupIds) {
      const group = groups[groupId];
      if (group.attributes[0].settings.isIndexed) {
        const published = group.attributes[0].getPublishedValues();
        if (published.indexBuffer) {
          indexBuffers.push(published.indexBuffer);
        }
      } else if (
        group.attributes.length === 1 &&
        (group.attributes[0].constant || group.attributes[0].isConstant) &&
        !this.generateConstantAttributes
      ) {
        Object.assign(constants, group.attributes[0].getPublishedValues().constants);
      } else if (
        group.attributes.length === 1 &&
        !(group.attributes[0].constant || group.attributes[0].isConstant)
      ) {
        const published = group.attributes[0].getPublishedValues(group.id);
        Object.assign(buffers, published.buffers);
        Object.assign(constants, published.constants);
      } else if (this._canPackAttributes(group.attributes)) {
        const layout = this._getPackedBufferGroupLayout(group);
        buffers[group.id] = this._updatePackedBufferGroup(group, layout, changedAttributes);
        if (!this.generateConstantAttributes) {
          for (const attribute of group.attributes) {
            if (attribute.constant || attribute.isConstant) {
              Object.assign(constants, attribute.getPublishedValues().constants);
            }
          }
        }
      } else {
        for (const attribute of group.attributes) {
          const published = attribute.getPublishedValues();
          Object.assign(buffers, published.buffers);
          Object.assign(constants, published.constants);
        }
      }
    }

    return {buffers, constants, indexBuffers};
  }

  /** Backwards-compatible helper for callers that only need published vertex buffers. */
  getPackedBufferAttributes(changedAttributes: {[id: string]: Attribute}): Record<string, Buffer> {
    return this.getPublishedAttributes(changedAttributes).buffers;
  }

  /** Updates one attribute while controlling whether it should materialize its own GPU buffer. */
  protected override _updateAttribute(opts: {
    attribute: Attribute;
    numInstances: number;
    data: any;
    props: any;
    context: any;
    generateAttributeBuffer?: boolean;
    generateConstantBuffer?: boolean;
  }) {
    const {
      attribute,
      numInstances,
      generateAttributeBuffer = true,
      generateConstantBuffer = true
    } = opts;

    if (attribute.constant) {
      // @ts-ignore value can be set to an array by user but always cast to typed array during attribute update
      attribute.setConstantValue(opts.context, attribute.value, generateConstantBuffer);
      return;
    }

    attribute.allocate(numInstances, generateAttributeBuffer);
    const updated = attribute.updateBuffer({...opts, generateBuffer: generateAttributeBuffer});
    if (updated) {
      this.needsRedraw = true;
    }
  }

  /** Returns the ids of groups that can skip standalone attribute buffers during update. */
  private _getSharedPackedGroupIds(): Set<string> {
    const groups = this._getAttributeGroups(Object.values(this.attributes));
    const groupIds = new Set<string>();

    for (const group of Object.values(groups)) {
      const stepMode = group.attributes[0].getBufferLayout().stepMode as 'vertex' | 'instance';
      if (
        group.attributes.length > 1 &&
        group.attributes.every(attribute => attribute.supportsPackedBuffer(stepMode))
      ) {
        groupIds.add(group.id);
      }
    }

    return groupIds;
  }

  /** Returns the logical publication group id for an attribute. */
  private _getAttributeGroupId(attribute: Attribute): string {
    if (
      attribute.settings.isIndexed ||
      this.attributeTransitionManager.hasAttribute(attribute.id)
    ) {
      return attribute.id;
    }
    return attribute.settings.bufferGroup || attribute.id;
  }

  /** Builds stable, lexically ordered publication groups from a set of attributes. */
  private _getAttributeGroups(attributes: Attribute[]): Record<string, AttributeGroup> {
    const groups: Record<string, AttributeGroup> = {};

    for (const attribute of attributes) {
      const groupId = this._getAttributeGroupId(attribute);
      if (!groups[groupId]) {
        groups[groupId] = {id: groupId, attributes: []};
      }
      groups[groupId].attributes.push(attribute);
    }

    for (const group of Object.values(groups)) {
      group.attributes.sort((a, b) => a.id.localeCompare(b.id));
    }

    return groups;
  }

  /** Returns whether all members in a group can publish through one packed buffer. */
  private _canPackAttributes(attributes: Attribute[]): boolean {
    if (!attributes.length) {
      return false;
    }
    const stepMode = attributes[0].getBufferLayout().stepMode as 'vertex' | 'instance';
    return attributes.every(
      attribute => attribute.canBePacked() && attribute.supportsPackedBuffer(stepMode)
    );
  }

  /** Builds the shared buffer layout metadata for one packed attribute group. */
  private _getPackedBufferGroupLayout(
    group: AttributeGroup,
    modelInfo?: {isInstanced?: boolean}
  ): PackedBufferGroupLayout {
    const byteStride = Math.max(
      ...group.attributes.map(attribute => attribute.getPackedBufferStride())
    );
    const stepMode = group.attributes[0].getBufferLayout(modelInfo).stepMode as
      | 'vertex'
      | 'instance';
    const attributes: BufferAttributeLayout[] = [];
    const attributeOffsets: Record<string, number> = {};
    const attributeNames: string[] = [];
    let byteOffset = 0;

    for (const attribute of group.attributes) {
      const layout = attribute.getPackedBufferLayout(byteStride, byteOffset, this.device.type);
      attributes.push(...layout.attributes);
      Object.assign(attributeOffsets, layout.attributeOffsets);
      attributeNames.push(...layout.attributeNames);
      byteOffset += attribute.getPackedBufferByteLength(byteStride);
    }

    return {
      id: group.id,
      byteStride,
      byteLength: byteOffset,
      stepMode,
      attributeOffsets,
      attributeNames,
      layout: {name: group.id, byteStride, attributes, stepMode}
    };
  }

  /** Allocates or updates the shared GPU buffer for one packed attribute group. */
  private _updatePackedBufferGroup(
    group: AttributeGroup,
    layout: PackedBufferGroupLayout,
    changedAttributes: {[id: string]: Attribute}
  ): Buffer {
    let state: PackedBufferGroupState | undefined = this.packedBuffers[group.id];
    let buffer = state?.buffer;
    const layoutChanged = !state || !this._packedBufferGroupLayoutEquals(state.layout, layout);

    if (!buffer || buffer.byteLength < layout.byteLength) {
      buffer?.delete();
      buffer = this.device.createBuffer({
        id: `${this.id}-${group.id}`,
        usage: Buffer.VERTEX | Buffer.COPY_DST,
        byteLength: layout.byteLength
      });
      state = undefined;
    }

    for (const attribute of group.attributes) {
      if (!layoutChanged && state && !changedAttributes[attribute.id]) {
        continue;
      }
      if ((attribute.constant || attribute.isConstant) && !this.generateConstantAttributes) {
        continue;
      }
      attribute.writePackedBuffer(buffer, layout.byteStride, layout.attributeOffsets[attribute.id]);
    }

    this.packedBuffers[group.id] = {buffer, layout};
    return buffer;
  }

  /** Compares cached packed layouts to decide whether a shared buffer needs a full rewrite. */
  private _packedBufferGroupLayoutEquals(
    a: PackedBufferGroupLayout,
    b: PackedBufferGroupLayout
  ): boolean {
    if (
      a.byteStride !== b.byteStride ||
      a.byteLength !== b.byteLength ||
      a.stepMode !== b.stepMode ||
      a.attributeNames.length !== b.attributeNames.length
    ) {
      return false;
    }

    for (let i = 0; i < a.attributeNames.length; i++) {
      const attributeName = a.attributeNames[i];
      if (
        attributeName !== b.attributeNames[i] ||
        a.attributeOffsets[attributeName] !== b.attributeOffsets[attributeName]
      ) {
        return false;
      }
    }

    return true;
  }
}
