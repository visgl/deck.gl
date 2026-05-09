// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import Attribute from './attribute';
import TableBufferPlanner, {
  type TableBufferGroup,
  type TableBufferPlan,
  type TableBufferPlannerModelInfo,
  type TableColumnDescriptor
} from './table-buffer-planner';
import {getBufferAttributeLayout, getStride} from './gl-utils';

import {Buffer} from '@luma.gl/core';
import type {Device, BufferLayout, BufferAttributeLayout} from '@luma.gl/core';
import type {NumericArray, TypedArray} from '../../types/types';

/**
 * Runtime model bindings emitted by `AttributeManager`.
 *
 * This is intentionally separate from `TableBufferPlan`: the planner only
 * describes allocation shape, while this type carries the actual luma buffers
 * and WebGL constant values that are applied to a `Model`.
 */
export type AttributeModelBindings = {
  /** Vertex buffers keyed by shader attribute name or planner-owned group id. */
  buffers: Record<string, Buffer>;
  /** WebGL constant attributes keyed by shader attribute name. */
  constants: Record<string, TypedArray>;
  /** Index buffers published by indexed attributes. */
  indexBuffers: Buffer[];
};

/** Model bindings plus buffer layouts, computed from one table-buffer planner pass. */
export type AttributeModelBindingPlan = AttributeModelBindings & {
  /** luma `Model` buffer layouts matching the returned buffer bindings. */
  bufferLayouts: BufferLayout[];
};

/** Cached packed buffer layout metadata for a shared attribute group. */
type PackedBufferGroupLayout = {
  /** Planner group id and luma buffer layout name. */
  id: string;
  /** Byte distance between consecutive packed table rows or geometry vertices. */
  byteStride: number;
  /** Current allocated byte length needed for this group. */
  byteLength: number;
  /** Vertex input step mode for the packed group. */
  stepMode: 'vertex' | 'instance';
  /** Byte offsets for every shader-visible attribute view in the group. */
  attributeOffsets: Record<string, number>;
  /** Ordered shader-visible attribute names used to compare layout stability. */
  attributeNames: string[];
  /** luma buffer layout descriptor published to the `Model`. */
  layout: BufferLayout;
};

/** Shared GPU buffer state for a packed attribute group. */
type PackedBufferGroupState = {
  /** Planner-owned GPU buffer that contains one or more packed columns. */
  buffer: Buffer;
  /** CPU staging bytes reused for partial packed-buffer rewrites. */
  data: Uint8Array;
  /** Last layout used to allocate and populate `buffer`. */
  layout: PackedBufferGroupLayout;
};

/** Minimal `AttributeManager` surface needed by the table-buffer adapter. */
type AttributeManagerLike = {
  /** Layer or manager id used for labels and planner logs. */
  id: string;
  /** luma device used to create planner-owned buffers. */
  device: Device;
  /** Primary attributes, excluding transition attributes. */
  attributes: Record<string, Attribute>;
  /** Returns all currently model-visible attributes, including transition attributes. */
  getAttributes(): {[id: string]: Attribute};
};

/** Write parameters for copying one Attribute into an interleaved packed buffer. */
type PackedBufferWriteOptions = {
  /** Byte distance between consecutive rows in the target interleaved buffer. */
  byteStride: number;
  /** Byte offset where this column starts within each target row. */
  byteOffset: number;
  /** Number of target rows to write. */
  rowCount: number;
  /** Optional fp64 component view. The current WebGPU low component path writes zeros. */
  fp64Component?: 'high' | 'low' | null;
};

/**
 * Converts AttributeManager-owned Attributes into TableBufferPlanner inputs and
 * applies the resulting plan to luma Model bindings.
 */
export default class AttributeManagerTableBuffers {
  /** Whether constant attributes should be materialized into real GPU buffers. */
  readonly generateConstantAttributes: boolean;

  private attributeManager: AttributeManagerLike;
  private isTransitionAttribute: (name: string) => boolean;
  private packedBuffers: Record<string, PackedBufferGroupState> = {};
  private rowGeometryAttributes: {rowIndex: Attribute; pickingColors: Attribute};

  /**
   * Creates an adapter around an `AttributeManager`.
   *
   * The adapter owns generated row-geometry lookup attributes and packed group
   * buffers, but leaves all source attribute value generation in `Attribute`.
   */
  constructor(
    attributeManager: AttributeManagerLike,
    {
      generateConstantAttributes,
      isTransitionAttribute
    }: {
      generateConstantAttributes: boolean;
      isTransitionAttribute: (name: string) => boolean;
    }
  ) {
    const {device} = attributeManager;

    this.attributeManager = attributeManager;
    this.generateConstantAttributes = generateConstantAttributes;
    this.isTransitionAttribute = isTransitionAttribute;
    this.rowGeometryAttributes = {
      rowIndex: new Attribute(device, {
        id: 'rowIndex',
        size: 1,
        type: 'uint32',
        stepMode: 'vertex',
        bufferLayoutPriority: 'low',
        update: () => {}
      }),
      pickingColors: new Attribute(device, {
        id: 'pickingColors',
        size: 4,
        type: 'uint8',
        stepMode: 'vertex',
        bufferLayoutPriority: 'low',
        update: () => {}
      })
    };
  }

  /** Deletes planner-owned packed buffers and generated row-geometry attributes. */
  finalize(): void {
    for (const state of Object.values(this.packedBuffers)) {
      state.buffer.delete();
    }
    for (const attribute of Object.values(this.rowGeometryAttributes)) {
      attribute.delete();
    }
  }

  /**
   * Updates generated row-geometry lookup columns.
   *
   * `rowIndex` maps every generated geometry vertex back to its source table
   * row. `pickingColors` mirrors deck.gl object picking ids, using
   * `object.__source.index` when present to match existing polygon/path logic.
   */
  updateRowGeometryAttributes(
    data: any,
    numInstances: number,
    startIndices: NumericArray | null
  ): void {
    const rowStarts = startIndices || data?.startIndices || null;
    const rowIndex = new Uint32Array(Math.max(numInstances, 1));
    const pickingColors = new Uint8ClampedArray(Math.max(numInstances, 1) * 4);
    const rowCount = rowStarts ? Math.max(0, rowStarts.length - 1) : numInstances;

    for (let row = 0; row < rowCount; row++) {
      const start = rowStarts ? rowStarts[row] : row;
      const end = rowStarts
        ? row + 1 < rowStarts.length
          ? rowStarts[row + 1]
          : numInstances
        : row + 1;
      const objectIndex = getSourceIndex(data, row);
      const pickingColorIndex = objectIndex ?? row;

      for (let vertex = start; vertex < end; vertex++) {
        rowIndex[vertex] = row;
        encodePickingColor(pickingColorIndex, pickingColors, vertex * 4);
      }
    }

    this.rowGeometryAttributes.rowIndex.numInstances = numInstances;
    this.rowGeometryAttributes.pickingColors.numInstances = numInstances;
    this.rowGeometryAttributes.rowIndex.setData({value: rowIndex}, false);
    this.rowGeometryAttributes.pickingColors.setData({value: pickingColors}, false);
  }

  /**
   * Returns how an attribute update should treat its standalone GPU buffer.
   *
   * Planner-managed columns still compute CPU typed arrays, but skip creating
   * standalone buffers because the adapter will publish them in packed groups.
   */
  getAttributeUpdateOptions(attribute: Attribute): {
    generateAttributeBuffer: boolean;
    generateConstantBuffer: boolean;
  } {
    const usesPlannedBuffer = TableBufferPlanner.shouldSkipColumnBuffer(
      this._getColumnDescriptor(attribute),
      undefined,
      this.isTransitionAttribute
    );
    const generateAttributeBuffer = !usesPlannedBuffer;

    return {
      generateAttributeBuffer,
      generateConstantBuffer:
        generateAttributeBuffer &&
        (this.generateConstantAttributes || Boolean(attribute.settings.transition))
    };
  }

  /** Returns model buffer layouts generated from the current table-buffer plan. */
  getBufferLayouts(modelInfo?: TableBufferPlannerModelInfo): BufferLayout[] {
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);
    return this._getBufferLayoutsFromPlan(plan, modelInfo);
  }

  /** Resolves changed attributes into model buffers, constants, and index buffers. */
  getModelBindings(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: TableBufferPlannerModelInfo
  ): AttributeModelBindings {
    changedAttributes = this._getChangedAttributesWithGenerated(changedAttributes, modelInfo);
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);
    return this._getModelBindingsFromPlan(changedAttributes, plan, modelInfo);
  }

  /** Resolves changed attributes and layouts from a single table-buffer plan. */
  getModelBindingPlan(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: TableBufferPlannerModelInfo,
    options?: {includeAllAttributes?: boolean}
  ): AttributeModelBindingPlan {
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);

    if (options?.includeAllAttributes) {
      changedAttributes = this.attributeManager.getAttributes();
    }
    changedAttributes = this._getChangedAttributesWithGenerated(changedAttributes, modelInfo);

    const modelBindings = this._getModelBindingsFromPlan(changedAttributes, plan, modelInfo);

    return {
      ...modelBindings,
      bufferLayouts: this._getBufferLayoutsFromPlan(plan, modelInfo)
    };
  }

  /** Applies a planner output to the subset of groups touched by changed attributes. */
  private _getModelBindingsFromPlan(
    changedAttributes: {[id: string]: Attribute},
    plan: TableBufferPlan,
    modelInfo?: TableBufferPlannerModelInfo
  ): AttributeModelBindings {
    const touchedGroupIds = new Set<string>();
    const buffers: Record<string, Buffer> = {};
    const constants: Record<string, TypedArray> = {};
    const indexBuffers: Buffer[] = [];

    for (const attribute of Object.values(changedAttributes)) {
      for (const mapping of plan.mappingsByColumnId[attribute.id] || []) {
        touchedGroupIds.add(mapping.bufferName);
      }
    }

    for (const group of plan.groups) {
      if (!touchedGroupIds.has(group.id)) {
        continue;
      }

      if (group.kind === 'unmanaged-attribute-column') {
        const attribute = this._getAttribute(group.columns[0].id);
        const attributeValues = getAttributePublishedValues(attribute);
        Object.assign(buffers, attributeValues.buffers);
        Object.assign(constants, attributeValues.constants);
        if (attributeValues.indexBuffer) {
          indexBuffers.push(attributeValues.indexBuffer);
        }
      } else {
        const layout = this._getPackedBufferGroupLayout(group, modelInfo);
        buffers[group.id] = this._updatePackedBufferGroup(group, layout, changedAttributes);
      }
    }

    return {buffers, constants, indexBuffers};
  }

  /** Builds the planner input from current attributes and model geometry hints. */
  private _getTableBufferPlan(
    attributes: Attribute[],
    modelInfo?: TableBufferPlannerModelInfo
  ): TableBufferPlan {
    const {device, id} = this.attributeManager;
    const reservedVertexBufferCount =
      modelInfo?.reservedVertexBufferCount ??
      ((modelInfo as {_gpuGeometry?: {bufferLayout?: BufferLayout[]}} | undefined)?._gpuGeometry
        ?.bufferLayout?.length ||
        0);

    const columns = attributes.map(attribute => this._getColumnDescriptor(attribute, modelInfo));

    return TableBufferPlanner.getAllocationPlan({
      id,
      device,
      columns,
      modelInfo: modelInfo && {...modelInfo, reservedVertexBufferCount},
      generateConstantAttributes: this.generateConstantAttributes,
      isTransitionAttribute: this.isTransitionAttribute
    });
  }

  /** Converts planner groups to luma buffer layouts. */
  private _getBufferLayoutsFromPlan(
    plan: TableBufferPlan,
    modelInfo?: TableBufferPlannerModelInfo
  ): BufferLayout[] {
    const layouts: BufferLayout[] = [];

    for (const group of plan.groups) {
      if (group.kind === 'unmanaged-attribute-column') {
        layouts.push(this._getAttribute(group.columns[0].id).getBufferLayout(modelInfo));
      } else {
        layouts.push(this._getPackedBufferGroupLayout(group, modelInfo).layout);
      }
    }

    return layouts;
  }

  /** Returns attributes visible to the planner, including generated row-geometry columns. */
  private _getPlanningAttributes(modelInfo?: TableBufferPlannerModelInfo): Attribute[] {
    const attributes = Object.values(this.attributeManager.getAttributes());

    if (!this._isRowGeometryMode(modelInfo)) {
      return attributes;
    }

    if (!this.attributeManager.attributes.rowIndex) {
      attributes.push(this.rowGeometryAttributes.rowIndex);
    }
    if (!this.attributeManager.attributes.pickingColors) {
      attributes.push(this.rowGeometryAttributes.pickingColors);
    }

    return attributes;
  }

  /** Adds generated row-geometry attributes to changed bindings when applicable. */
  private _getChangedAttributesWithGenerated(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: TableBufferPlannerModelInfo
  ): {[id: string]: Attribute} {
    if (!this._isRowGeometryMode(modelInfo)) {
      return changedAttributes;
    }

    const attributes = {...changedAttributes};
    if (!this.attributeManager.attributes.rowIndex) {
      attributes.rowIndex = this.rowGeometryAttributes.rowIndex;
    }
    if (!this.attributeManager.attributes.pickingColors) {
      attributes.pickingColors = this.rowGeometryAttributes.pickingColors;
    }
    return attributes;
  }

  /** Returns true for non-instanced models with per-row variable geometry. */
  private _isRowGeometryMode(modelInfo?: TableBufferPlannerModelInfo): boolean {
    return modelInfo?.isInstanced === false;
  }

  /** Resolves user/layer attributes and generated row-geometry attributes by id. */
  private _getAttribute(id: string): Attribute {
    return (
      this.attributeManager.attributes[id] ||
      this.rowGeometryAttributes[id as 'rowIndex' | 'pickingColors']
    );
  }

  /** Converts an Attribute into the abstract column descriptor consumed by the planner. */
  private _getColumnDescriptor(
    attribute: Attribute,
    modelInfo?: TableBufferPlannerModelInfo
  ): TableColumnDescriptor {
    const stepMode = attribute.getBufferLayout(modelInfo).stepMode as 'vertex' | 'instance';

    return {
      id: attribute.id,
      byteStride: getAttributePackedBufferStride(attribute, null),
      byteLength: this._getStorageBufferByteLength(attribute),
      rowCount: attribute.numInstances,
      stepMode,
      isPosition: isPositionAttribute(attribute.id),
      isConstant: attribute.constant || attribute.isConstant,
      isIndexed: attribute.settings.isIndexed,
      isTransition: Boolean(attribute.settings.transition),
      isExternalBufferOnly: isExternalGpuBufferOnlyAttribute(attribute),
      isDoublePrecision: attribute.doublePrecision,
      noAlloc: attribute.settings.noAlloc,
      allowNoAllocManaged: canUseNoAllocPlannedBuffer(attribute),
      supportsPackedBuffer: attributeSupportsPackedBuffer(attribute, stepMode, modelInfo),
      isGeneratedRowGeometry: attribute.id === 'rowIndex' || attribute.id === 'pickingColors',
      priority: getColumnPriority(attribute)
    };
  }

  /** Returns the original column byte length for optional storage-buffer planning. */
  private _getStorageBufferByteLength(attribute: Attribute): number {
    if (ArrayBuffer.isView(attribute.value)) {
      return attribute.value.byteLength;
    }
    return Math.max(1, attribute.numInstances) * getAttributePackedBufferStride(attribute, null);
  }

  /** Builds the shared buffer layout metadata for one packed attribute group. */
  private _getPackedBufferGroupLayout(
    group: TableBufferGroup,
    modelInfo?: TableBufferPlannerModelInfo
  ): PackedBufferGroupLayout {
    const byteStride = group.columns.reduce(
      (stride, {id, fp64Component}) =>
        stride + getAttributePackedBufferStride(this._getAttribute(id), fp64Component ?? null),
      0
    );
    const rowCount =
      group.rowCount ??
      Math.max(1, ...group.columns.map(({id}) => this._getAttribute(id).numInstances));
    const stepMode =
      group.stepMode ??
      (this._getAttribute(group.columns[0].id).getBufferLayout(modelInfo).stepMode as
        | 'vertex'
        | 'instance');
    const attributes: BufferAttributeLayout[] = [];
    const attributeOffsets: Record<string, number> = {};
    const attributeNames: string[] = [];
    let byteOffset = 0;

    for (const {id, fp64Component} of group.columns) {
      const attribute = this._getAttribute(id);
      const layout = getAttributePackedBufferLayout(
        attribute,
        byteStride,
        byteOffset,
        this.attributeManager.device.type,
        fp64Component ?? null
      );
      attributes.push(...layout.attributes);
      Object.assign(attributeOffsets, layout.attributeOffsets);
      attributeNames.push(...layout.attributeNames);
      byteOffset += getAttributePackedBufferStride(attribute, fp64Component ?? null);
    }

    return {
      id: group.id,
      byteStride,
      byteLength: byteStride * (rowCount + 2),
      stepMode,
      attributeOffsets,
      attributeNames,
      layout: {name: group.id, byteStride, attributes, stepMode}
    };
  }

  /** Allocates or updates the shared GPU buffer for one packed attribute group. */
  private _updatePackedBufferGroup(
    group: TableBufferGroup,
    layout: PackedBufferGroupLayout,
    changedAttributes: {[id: string]: Attribute}
  ): Buffer {
    const {device, id} = this.attributeManager;
    let state: PackedBufferGroupState | undefined = this.packedBuffers[group.id];
    let buffer = state?.buffer;
    const layoutChanged = !state || !this._packedBufferGroupLayoutEquals(state.layout, layout);
    let rewriteAll = layoutChanged;

    if (!buffer || buffer.byteLength < layout.byteLength) {
      buffer?.delete();
      buffer = device.createBuffer({
        id: `${id}-${group.id}`,
        usage: Buffer.VERTEX | Buffer.COPY_DST,
        byteLength: layout.byteLength
      });
      state = undefined;
      rewriteAll = true;
    }

    const data = rewriteAll ? new Uint8Array(layout.byteLength) : state!.data;
    for (const {id: attributeId, fp64Component} of group.columns) {
      const attribute = this._getAttribute(attributeId);
      if (!rewriteAll && state && !changedAttributes[attributeId]) {
        continue;
      }
      const attributeName = fp64Component === 'low' ? `${attributeId}64Low` : attributeId;
      writeAttributeToPackedBuffer(attribute, data, {
        byteStride: layout.byteStride,
        byteOffset: layout.attributeOffsets[attributeName],
        rowCount: group.rowCount ?? attribute.numInstances,
        fp64Component: fp64Component ?? null
      });
    }

    buffer.write(data, 0);
    this.packedBuffers[group.id] = {buffer, data, layout};
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

/** Encodes a zero-based object index into deck.gl's one-based picking color bytes. */
function encodePickingColor(index: number, target: Uint8ClampedArray, offset: number): void {
  const colorIndex = index + 1;
  target[offset + 0] = colorIndex & 255;
  target[offset + 1] = (colorIndex >> 8) & 255;
  target[offset + 2] = (colorIndex >> 16) & 255;
  target[offset + 3] = 0;
}

/** Reads an original source-row index from flattened row-geometry data when available. */
function getSourceIndex(data: any, row: number): number | null {
  const object = Array.isArray(data) ? data[row] : data?.[row];
  return Number.isFinite(object?.__source?.index) ? object.__source.index : null;
}

/** Returns true for canonical deck.gl position attribute naming patterns. */
function isPositionAttribute(id: string): boolean {
  return id === 'positions' || /Positions$/.test(id);
}

/** Returns true for canonical deck.gl color attribute naming patterns. */
function isColorAttribute(id: string): boolean {
  return /Colors?$/.test(id);
}

/** Returns true for generated picking-color attributes that can be low-priority packed data. */
function isGeneratedPickingColorAttribute(id: string): boolean {
  return id === 'pickingColors' || id === 'instancePickingColors';
}

/** Returns true when an attribute has a GPU buffer but no CPU typed-array value to pack. */
function isExternalGpuBufferOnlyAttribute(attribute: Attribute): boolean {
  return Boolean(
    (attribute as unknown as {state?: {externalBuffer?: Buffer | null}}).state?.externalBuffer
  );
}

/** Returns true when a generated `noAlloc` attribute is still safe to planner-pack. */
function canUseNoAllocPlannedBuffer(attribute: Attribute): boolean {
  return (
    isGeneratedPickingColorAttribute(attribute.id) &&
    typeof attribute.settings.update === 'function' &&
    !isExternalGpuBufferOnlyAttribute(attribute)
  );
}

/** Returns planner priority for assigning scarce separate vertex-buffer slots. */
function getColumnPriority(attribute: Attribute): 'high' | 'medium' | 'low' {
  if (attribute.settings.bufferLayoutPriority) {
    return attribute.settings.bufferLayoutPriority;
  }
  if (isGeneratedPickingColorAttribute(attribute.id)) {
    return 'low';
  }
  if (isPositionAttribute(attribute.id) || isColorAttribute(attribute.id)) {
    return 'high';
  }
  return 'medium';
}

/** Classifies an unmanaged attribute's current output for direct model binding. */
function getAttributePublishedValues(
  attribute: Attribute,
  bufferName?: string
): {
  buffers: Record<string, Buffer>;
  constants: Record<string, TypedArray>;
  indexBuffer: Buffer | null;
} {
  const buffers: Record<string, Buffer> = {};
  const constants: Record<string, TypedArray> = {};
  let indexBuffer: Buffer | null = null;

  for (const [name, value] of Object.entries(attribute.getValue())) {
    if (value instanceof Buffer) {
      if (attribute.settings.isIndexed) {
        indexBuffer = value;
      } else {
        buffers[bufferName || name] = value;
      }
    } else if (value) {
      constants[name] = value;
    }
  }

  return {buffers, constants, indexBuffer};
}

/** Returns whether an attribute can be copied into a planner-owned packed buffer. */
function attributeSupportsPackedBuffer(
  attribute: Attribute,
  stepMode: 'vertex' | 'instance',
  modelInfo?: TableBufferPlannerModelInfo
): boolean {
  return (
    !attribute.doublePrecision &&
    !attribute.settings.isIndexed &&
    attribute.getBufferLayout(modelInfo).stepMode === stepMode
  );
}

/** Returns the byte stride an attribute contributes to an interleaved packed group. */
function getAttributePackedBufferStride(
  attribute: Attribute,
  fp64Component: 'high' | 'low' | null = null
): number {
  if (attribute.doublePrecision && fp64Component) {
    return attribute.size * 4;
  }
  return getStride(attribute.getAccessor());
}

/** Builds packed buffer layout entries for an attribute and its shader attribute views. */
function getAttributePackedBufferLayout(
  attribute: Attribute,
  byteStride: number,
  baseOffset: number,
  deviceType: Device['type'],
  fp64Component: 'high' | 'low' | null = null
): {
  attributes: BufferAttributeLayout[];
  attributeOffsets: Record<string, number>;
  attributeNames: string[];
} {
  const accessor = attribute.getAccessor();
  const attributes: BufferAttributeLayout[] = [];
  const attributeOffsets: Record<string, number> = {};
  const attributeNames: string[] = [];
  const stride = getAttributePackedBufferStride(attribute, fp64Component);
  const attributeOffset =
    baseOffset + (accessor.vertexOffset || 0) * stride + (accessor.offset || 0);
  const attributeName = fp64Component === 'low' ? `${attribute.id}64Low` : attribute.id;
  const packedAccessor = attribute.doublePrecision
    ? {...accessor, type: 'float32' as const, bytesPerElement: 4, stride}
    : accessor;
  const layout = getBufferAttributeLayout(
    attributeName,
    {...packedAccessor, stride: byteStride, offset: attributeOffset},
    deviceType
  );
  attributeOffsets[attributeName] = attributeOffset;
  attributeNames.push(attributeName);

  if (layout) {
    attributes.push(layout);
  }

  if (!fp64Component && attribute.settings.shaderAttributes) {
    for (const [name, def] of Object.entries(attribute.settings.shaderAttributes)) {
      const shaderOffset =
        attributeOffset +
        (def.vertexOffset || 0) * byteStride +
        (def.elementOffset || 0) * accessor.bytesPerElement;
      const shaderLayout = getBufferAttributeLayout(
        name,
        {...accessor, ...def, stride: byteStride, offset: shaderOffset},
        deviceType
      );
      if (shaderLayout) {
        attributes.push(shaderLayout);
        attributeOffsets[name] = shaderOffset;
        attributeNames.push(name);
      }
    }
  }

  return {attributes, attributeOffsets, attributeNames};
}

/**
 * Copies an Attribute's CPU-side typed array into one slice of a packed buffer.
 *
 * This keeps accessor stride/offset, constants, and fp64 component handling
 * outside the abstract planner while avoiding extra methods on `Attribute`.
 */
function writeAttributeToPackedBuffer(
  attribute: Attribute,
  target: Uint8Array,
  {byteStride, byteOffset, rowCount, fp64Component = null}: PackedBufferWriteOptions
): void {
  const value = attribute.value as TypedArray | null;
  if (!value) {
    return;
  }

  if (attribute.doublePrecision && fp64Component) {
    const row = new Float32Array(attribute.size);
    const rowBytes = new Uint8Array(row.buffer);
    const source = value as Float32Array | Float64Array;
    const isConstant = attribute.isConstant;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const sourceIndex = (isConstant ? 0 : rowIndex) * attribute.size;
      for (let componentIndex = 0; componentIndex < attribute.size; componentIndex++) {
        row[componentIndex] =
          fp64Component === 'low' ? 0 : source[sourceIndex + componentIndex] || 0;
      }
      target.set(rowBytes, rowIndex * byteStride + byteOffset);
    }
    return;
  }

  const accessor = attribute.getAccessor();
  const sourceStride = getStride(accessor);
  const sourceOffset = accessor.offset || 0;
  const source = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);

  if (attribute.isConstant) {
    const rowBytes = source.subarray(0, Math.min(sourceStride, source.byteLength));
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const targetStart = rowIndex * byteStride + byteOffset;
      target.fill(0, targetStart, targetStart + sourceStride);
      target.set(rowBytes, targetStart);
    }
    return;
  }

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const sourceStart = sourceOffset + rowIndex * sourceStride;
    const rowBytes = source.subarray(sourceStart, sourceStart + sourceStride);
    const targetStart = rowIndex * byteStride + byteOffset;
    target.fill(0, targetStart, targetStart + sourceStride);
    target.set(rowBytes, targetStart);
  }
}
