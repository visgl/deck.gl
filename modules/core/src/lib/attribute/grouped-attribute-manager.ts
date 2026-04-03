// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable guard-for-in */
import Attribute, {AttributeOptions} from './attribute';
import log from '../../utils/log';
import memoize from '../../utils/memoize';
import {mergeBounds} from '../../utils/math-utils';
import debug from '../../debug/index';
import {NumericArray} from '../../types/types';
import {getBufferAttributeLayout, getStride} from './gl-utils';

import AttributeTransitionManager from './attribute-transition-manager';

import {Buffer} from '@luma.gl/core';
import type {Device, BufferLayout, BufferAttributeLayout} from '@luma.gl/core';
import type {Stats} from '@probe.gl/stats';
import type {Timeline} from '@luma.gl/engine';
import type {TypedArray} from '../../types/types';

const TRACE_INVALIDATE = 'attributeManager.invalidate';
const TRACE_UPDATE_START = 'attributeManager.updateStart';
const TRACE_UPDATE_END = 'attributeManager.updateEnd';
const TRACE_ATTRIBUTE_UPDATE_START = 'attribute.updateStart';
const TRACE_ATTRIBUTE_ALLOCATE = 'attribute.allocate';
const TRACE_ATTRIBUTE_UPDATE_END = 'attribute.updateEnd';

type AttributeGroup = {
  id: string;
  attributes: Attribute[];
};

export type GroupedPublishedAttributes = {
  buffers: Record<string, Buffer>;
  constants: Record<string, TypedArray>;
  indexBuffers: Buffer[];
};

type PackedBufferGroupLayout = {
  id: string;
  byteStride: number;
  byteLength: number;
  stepMode: 'vertex' | 'instance';
  attributeOffsets: Record<string, number>;
  attributeNames: string[];
  layout: BufferLayout;
};

type PackedBufferGroupState = {
  buffer: Buffer;
  layout: PackedBufferGroupLayout;
};

export default class GroupedAttributeManager {
  id: string;
  device: Device;
  attributes: Record<string, Attribute>;
  updateTriggers: {[name: string]: string[]};
  needsRedraw: string | boolean;
  userData: any;

  private stats?: Stats;
  private attributeTransitionManager: AttributeTransitionManager;
  private mergeBoundsMemoized: any = memoize(mergeBounds);
  private packedBuffers: Record<string, PackedBufferGroupState>;
  readonly generateConstantAttributes: boolean;

  constructor(
    device: Device,
    {
      id = 'attribute-manager',
      stats,
      timeline,
      generateConstantAttributes
    }: {
      id?: string;
      stats?: Stats;
      timeline?: Timeline;
      generateConstantAttributes?: boolean;
    } = {}
  ) {
    this.id = id;
    this.device = device;
    this.attributes = {};
    this.updateTriggers = {};
    this.needsRedraw = true;
    this.userData = {};
    this.stats = stats;
    this.generateConstantAttributes =
      device.type === 'webgpu' ? true : (generateConstantAttributes ?? false);

    this.attributeTransitionManager = new AttributeTransitionManager(device, {
      id: `${id}-transitions`,
      timeline
    });
    this.packedBuffers = {};

    Object.seal(this);
  }

  finalize() {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].delete();
    }
    for (const state of Object.values(this.packedBuffers)) {
      state.buffer.delete();
    }
    this.attributeTransitionManager.finalize();
  }

  getNeedsRedraw(opts: {clearRedrawFlags?: boolean} = {clearRedrawFlags: false}): string | false {
    const redraw = this.needsRedraw;
    this.needsRedraw = this.needsRedraw && !opts.clearRedrawFlags;
    return redraw && this.id;
  }

  setNeedsRedraw() {
    this.needsRedraw = true;
  }

  add(attributes: {[id: string]: AttributeOptions}) {
    this._add(attributes);
  }

  addInstanced(attributes: {[id: string]: AttributeOptions}) {
    this._add(attributes, {stepMode: 'instance'});
  }

  remove(attributeNameArray: string[]) {
    for (const name of attributeNameArray) {
      if (this.attributes[name] !== undefined) {
        this.attributes[name].delete();
        delete this.attributes[name];
      }
    }
  }

  invalidate(triggerName: string, dataRange?: {startRow?: number; endRow?: number}) {
    const invalidatedAttributes = this._invalidateTrigger(triggerName, dataRange);
    debug(TRACE_INVALIDATE, this, triggerName, invalidatedAttributes);
  }

  invalidateAll(dataRange?: {startRow?: number; endRow?: number}) {
    for (const attributeName in this.attributes) {
      this.attributes[attributeName].setNeedsUpdate(attributeName, dataRange);
    }
    debug(TRACE_INVALIDATE, this, 'all');
  }

  // eslint-disable-next-line complexity
  update({
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

    debug(TRACE_UPDATE_START, this);
    if (this.stats) {
      this.stats.get('Update Attributes').timeStart();
    }

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      attribute.startIndices = startIndices;
      attribute.numInstances = numInstances;

      if (props[attributeName]) {
        log.removed(`props.${attributeName}`, `data.attributes.${attributeName}`)();
      }

      if (attribute.setExternalBuffer(buffers[attributeName])) {
        // Step 1: try update attribute directly from external buffers
      } else if (
        attribute.setBinaryValue(
          typeof accessorName === 'string' ? buffers[accessorName] : undefined,
          data.startIndices
        )
      ) {
        // Step 2: try set packed value from external typed array
      } else if (
        typeof accessorName === 'string' &&
        !buffers[accessorName] &&
        attribute.setConstantValue(
          context,
          props[accessorName],
          this.generateConstantAttributes || Boolean(attribute.settings.transition)
        )
      ) {
        // Step 3: try set constant value from props
      } else if (attribute.needsUpdate()) {
        updated = true;
        this._updateAttribute({
          attribute,
          numInstances,
          data,
          props,
          context
        });
      }

      this.needsRedraw = this.needsRedraw || attribute.needsRedraw();
    }

    if (updated) {
      debug(TRACE_UPDATE_END, this, numInstances);
    }

    if (this.stats) {
      this.stats.get('Update Attributes').timeEnd();
      if (updated) {
        this.stats.get('Attributes updated').incrementCount();
      }
    }

    this.attributeTransitionManager.update({
      attributes: this.attributes,
      numInstances,
      transitions
    });
  }

  updateTransition() {
    const {attributeTransitionManager} = this;
    const transitionUpdated = attributeTransitionManager.run();
    this.needsRedraw = this.needsRedraw || transitionUpdated;
    return transitionUpdated;
  }

  getAttributes(): {[id: string]: Attribute} {
    return {...this.attributes, ...this.attributeTransitionManager.getAttributes()};
  }

  getBounds(attributeNames: string[]) {
    const bounds = attributeNames.map(attributeName => this.attributes[attributeName]?.getBounds());
    return this.mergeBoundsMemoized(bounds);
  }

  getChangedAttributes(opts: {clearChangedFlags?: boolean} = {clearChangedFlags: false}): {
    [id: string]: Attribute;
  } {
    const {attributes, attributeTransitionManager} = this;

    const changedAttributes = {...attributeTransitionManager.getAttributes()};

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      if (attribute.needsRedraw(opts) && !attributeTransitionManager.hasAttribute(attributeName)) {
        changedAttributes[attributeName] = attribute;
      }
    }

    return changedAttributes;
  }

  getBufferLayouts(modelInfo?: {isInstanced?: boolean}): BufferLayout[] {
    const attributes = Object.values(this.getAttributes());
    const groups = this._getAttributeGroups(attributes);
    const seenGroups = new Set<string>();
    const layouts: BufferLayout[] = [];

    for (const attribute of attributes) {
      const groupId = this._getAttributeGroupId(attribute);
      const group = groups[groupId];

      if (!seenGroups.has(groupId)) {
        seenGroups.add(groupId);
        if (group.attributes[0].settings.isIndexed) {
          layouts.push(group.attributes[0].getBufferLayout(modelInfo));
        } else if (this._canPackAttributes(group.attributes)) {
          layouts.push(this._getPackedBufferGroupLayout(group, modelInfo).layout);
        } else {
          for (const member of group.attributes) {
            layouts.push(member.getBufferLayout(modelInfo));
          }
        }
      }
    }

    return layouts;
  }

  hasPackedBufferGroups(): boolean {
    return Object.values(this._getAttributeGroups(Object.values(this.getAttributes()))).some(
      group => group.attributes.length > 1 && this._canPackAttributes(group.attributes)
    );
  }

  getPublishedAttributes(changedAttributes: {[id: string]: Attribute}): GroupedPublishedAttributes {
    const groups = this._getAttributeGroups(Object.values(this.getAttributes()));
    const touchedGroupIds = new Set<string>();

    for (const attribute of Object.values(changedAttributes)) {
      const groupId = this._getAttributeGroupId(attribute);
      touchedGroupIds.add(groupId);
    }

    const buffers: Record<string, Buffer> = {};
    const constants: Record<string, TypedArray> = {};
    const indexBuffers: Buffer[] = [];

    for (const groupId of touchedGroupIds) {
      const group = groups[groupId];
      if (group.attributes[0].settings.isIndexed) {
        const values = group.attributes[0].getValue();
        for (const value of Object.values(values)) {
          if (value instanceof Buffer) {
            indexBuffers.push(value);
          }
        }
      } else if (
        group.attributes.length === 1 &&
        (group.attributes[0].constant || group.attributes[0].isConstant) &&
        !this.generateConstantAttributes
      ) {
        const values = group.attributes[0].getValue();
        for (const [name, value] of Object.entries(values)) {
          if (value && !(value instanceof Buffer)) {
            constants[name] = value;
          }
        }
      } else if (
        group.attributes.length === 1 &&
        !(group.attributes[0].constant || group.attributes[0].isConstant)
      ) {
        const values = group.attributes[0].getValue();
        for (const [name, value] of Object.entries(values)) {
          if (value instanceof Buffer) {
            buffers[group.id] = value;
          } else if (value) {
            constants[name] = value;
          }
        }
      } else if (this._canPackAttributes(group.attributes)) {
        const layout = this._getPackedBufferGroupLayout(group);
        const buffer = this._updatePackedBufferGroup(group, layout, changedAttributes);
        buffers[group.id] = buffer;
        if (!this.generateConstantAttributes) {
          for (const attribute of group.attributes) {
            if (!(attribute.constant || attribute.isConstant)) {
              continue;
            }
            const values = attribute.getValue();
            for (const [name, value] of Object.entries(values)) {
              if (value && !(value instanceof Buffer)) {
                constants[name] = value;
              }
            }
          }
        }
      } else {
        for (const attribute of group.attributes) {
          const values = attribute.getValue();
          for (const [name, value] of Object.entries(values)) {
            if (value instanceof Buffer) {
              buffers[name] = value;
            } else if (value) {
              constants[name] = value;
            }
          }
        }
      }
    }

    return {buffers, constants, indexBuffers};
  }

  getPackedBufferAttributes(changedAttributes: {[id: string]: Attribute}): Record<string, Buffer> {
    return this.getPublishedAttributes(changedAttributes).buffers;
  }

  private _add(
    attributes: {[id: string]: AttributeOptions},
    overrideOptions?: Partial<AttributeOptions>
  ) {
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];

      const props: AttributeOptions = {
        ...attribute,
        id: attributeName,
        size: (attribute.isIndexed && 1) || attribute.size || 1,
        ...overrideOptions
      };

      this.attributes[attributeName] = new Attribute(this.device, props);
    }

    this._mapUpdateTriggersToAttributes();
  }

  private _mapUpdateTriggersToAttributes() {
    const triggers: {[name: string]: string[]} = {};

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      attribute.getUpdateTriggers().forEach(triggerName => {
        if (!triggers[triggerName]) {
          triggers[triggerName] = [];
        }
        triggers[triggerName].push(attributeName);
      });
    }

    this.updateTriggers = triggers;
  }

  private _invalidateTrigger(
    triggerName: string,
    dataRange?: {startRow?: number; endRow?: number}
  ): string[] {
    const {attributes, updateTriggers} = this;
    const invalidatedAttributes = updateTriggers[triggerName];

    if (invalidatedAttributes) {
      invalidatedAttributes.forEach(name => {
        const attribute = attributes[name];
        if (attribute) {
          attribute.setNeedsUpdate(attribute.id, dataRange);
        }
      });
    }
    return invalidatedAttributes;
  }

  private _getAttributeGroupId(attribute: Attribute): string {
    if (
      attribute.settings.isIndexed ||
      this.attributeTransitionManager.hasAttribute(attribute.id)
    ) {
      return attribute.id;
    }
    return attribute.settings.bufferGroup || attribute.id;
  }

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

  private _canPackAttributes(attributes: Attribute[]): boolean {
    if (!attributes.length) {
      return false;
    }
    const stepMode = attributes[0].getBufferLayout().stepMode;

    return attributes.every(attribute => {
      if (attribute.doublePrecision || attribute.settings.isIndexed) {
        return false;
      }
      if (!ArrayBuffer.isView(attribute.value)) {
        return false;
      }
      return attribute.getBufferLayout().stepMode === stepMode;
    });
  }

  private _getPackedBufferGroupLayout(
    group: AttributeGroup,
    modelInfo?: {isInstanced?: boolean}
  ): PackedBufferGroupLayout {
    const byteStride = Math.max(
      ...group.attributes.map(attribute => getStride(attribute.getAccessor()))
    );
    const stepMode = group.attributes[0].getBufferLayout(modelInfo).stepMode as
      | 'vertex'
      | 'instance';
    const attributes: BufferAttributeLayout[] = [];
    const attributeOffsets: Record<string, number> = {};
    const attributeNames: string[] = [];
    let byteOffset = 0;

    for (const attribute of group.attributes) {
      const accessor = attribute.getAccessor();
      const stride = getStride(accessor);
      const baseOffset =
        byteOffset + (accessor.vertexOffset || 0) * stride + (accessor.offset || 0);
      const baseLayout = getBufferAttributeLayout(
        attribute.id,
        {...accessor, stride: byteStride, offset: baseOffset},
        this.device.type
      );
      if (baseLayout) {
        attributes.push(baseLayout);
        attributeOffsets[attribute.id] = baseOffset;
        attributeNames.push(attribute.id);
      }

      if (attribute.settings.shaderAttributes) {
        for (const [name, def] of Object.entries(attribute.settings.shaderAttributes)) {
          const shaderOffset =
            baseOffset +
            (def.vertexOffset || 0) * byteStride +
            (def.elementOffset || 0) * accessor.bytesPerElement;
          const shaderLayout = getBufferAttributeLayout(
            name,
            {...accessor, ...def, stride: byteStride, offset: shaderOffset},
            this.device.type
          );
          if (shaderLayout) {
            attributes.push(shaderLayout);
            attributeOffsets[name] = shaderOffset;
            attributeNames.push(name);
          }
        }
      }

      byteOffset += byteStride * (attribute.numInstances + 2);
    }

    return {
      id: group.id,
      byteStride,
      byteLength: byteOffset,
      stepMode,
      attributeOffsets,
      attributeNames,
      layout: {
        name: group.id,
        byteStride,
        attributes,
        stepMode
      }
    };
  }

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

    if (!state || layoutChanged) {
      for (const attribute of group.attributes) {
        if ((attribute.constant || attribute.isConstant) && !this.generateConstantAttributes) {
          continue;
        }
        buffer.write(
          this._getPackedAttributeData(attribute, layout.byteStride),
          layout.attributeOffsets[attribute.id]
        );
      }
    } else {
      for (const attribute of group.attributes) {
        if (!changedAttributes[attribute.id]) {
          continue;
        }
        if ((attribute.constant || attribute.isConstant) && !this.generateConstantAttributes) {
          continue;
        }
        buffer.write(
          this._getPackedAttributeData(attribute, layout.byteStride),
          layout.attributeOffsets[attribute.id]
        );
      }
    }

    this.packedBuffers[group.id] = {buffer, layout};
    return buffer;
  }

  private _getPackedAttributeData(attribute: Attribute, byteStride: number): Uint8Array {
    const accessor = attribute.getAccessor();
    const sourceStride = getStride(accessor);
    const instanceCount = Math.max(
      attribute.numInstances,
      attribute.constant || attribute.isConstant ? 1 : 0
    );
    const byteLength = byteStride * instanceCount;
    const target = new Uint8Array(byteLength);
    const sourceOffset = (accessor.vertexOffset || 0) * sourceStride + (accessor.offset || 0);

    if (attribute.constant || attribute.isConstant) {
      const value = attribute.value as TypedArray;
      const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      for (let i = 0; i < instanceCount; i++) {
        target.set(bytes, i * byteStride);
      }
      return target;
    }

    const value = attribute.value as TypedArray | null;
    if (!value) {
      return target;
    }
    const bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);

    for (let i = 0; i < attribute.numInstances; i++) {
      const srcStart = sourceOffset + i * sourceStride;
      target.set(bytes.subarray(srcStart, srcStart + sourceStride), i * byteStride);
    }

    return target;
  }

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

  private _updateAttribute(opts: {
    attribute: Attribute;
    numInstances: number;
    data: any;
    props: any;
    context: any;
  }) {
    const {attribute, numInstances} = opts;
    debug(TRACE_ATTRIBUTE_UPDATE_START, attribute);

    if (attribute.constant) {
      // @ts-ignore value can be set to an array by user but always cast to typed array during attribute update
      attribute.setConstantValue(
        opts.context,
        attribute.value,
        this.generateConstantAttributes || Boolean(attribute.settings.transition)
      );
      return;
    }

    if (attribute.allocate(numInstances)) {
      debug(TRACE_ATTRIBUTE_ALLOCATE, attribute, numInstances);
    }

    const updated = attribute.updateBuffer(opts);
    if (updated) {
      this.needsRedraw = true;
      debug(TRACE_ATTRIBUTE_UPDATE_END, attribute, numInstances);
    }
  }
}
