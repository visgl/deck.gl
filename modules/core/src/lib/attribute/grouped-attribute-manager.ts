// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable guard-for-in */
import Attribute from './attribute';
import AttributeManager from './attribute-manager';
import TableBufferPlanner, {
  TableBufferGroup,
  TableBufferPlan,
  TableColumnDescriptor
} from './table-buffer-planner';

import {Buffer} from '@luma.gl/core';
import type {Device, BufferLayout, BufferAttributeLayout} from '@luma.gl/core';
import type {Stats} from '@probe.gl/stats';
import type {Timeline} from '@luma.gl/engine';
import type {NumericArray, TypedArray} from '../../types/types';

/** Attribute outputs emitted by `GroupedAttributeManager` for model binding. */
export type GroupedModelBindings = {
  buffers: Record<string, Buffer>;
  constants: Record<string, TypedArray>;
  indexBuffers: Buffer[];
};

/** Model bindings plus layout information, computed from one planner pass. */
export type GroupedModelBindingPlan = GroupedModelBindings & {
  bufferLayouts: BufferLayout[];
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
  data: Uint8Array;
  layout: PackedBufferGroupLayout;
};

type ModelInfo = {isInstanced?: boolean; reservedVertexBufferCount?: number};
type RowGeometryAttributes = {
  rowIndex: Attribute;
  pickingColors: Attribute;
};

function noop(): void {}

export default class GroupedAttributeManager extends AttributeManager {
  private packedBuffers: Record<string, PackedBufferGroupState>;
  private rowGeometryAttributes: RowGeometryAttributes;
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
    this.rowGeometryAttributes = {
      rowIndex: new Attribute(device, {
        id: 'rowIndex',
        size: 1,
        type: 'uint32',
        stepMode: 'vertex',
        bufferLayoutPriority: 'low',
        update: noop
      }),
      pickingColors: new Attribute(device, {
        id: 'pickingColors',
        size: 4,
        type: 'uint8',
        stepMode: 'vertex',
        bufferLayoutPriority: 'low',
        update: noop
      })
    };
    Object.seal(this);
  }

  override finalize() {
    for (const state of Object.values(this.packedBuffers)) {
      state.buffer.delete();
    }
    for (const attribute of Object.values(this.rowGeometryAttributes)) {
      attribute.delete();
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
    this._updateRowGeometryAttributes(data, numInstances, startIndices);

    if (this.stats) {
      this.stats.get('Update Attributes').timeStart();
    }

    for (const attributeName in this.attributes) {
      const attribute = this.attributes[attributeName];
      const accessorName = attribute.settings.accessor;
      const usesPlannedBuffer = TableBufferPlanner.shouldSkipColumnBuffer(
        this._getColumnDescriptor(attribute),
        undefined,
        name => this.attributeTransitionManager.hasAttribute(name)
      );
      const generateAttributeBuffer = !usesPlannedBuffer;
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

  override getBufferLayouts(modelInfo?: ModelInfo): BufferLayout[] {
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);
    return this._getBufferLayoutsFromPlan(plan, modelInfo);
  }

  /** Resolves changed groups into vertex buffers, constants, and index buffers for a model. */
  getModelBindings(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: ModelInfo
  ): GroupedModelBindings {
    changedAttributes = this._getChangedAttributesWithGenerated(changedAttributes, modelInfo);
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);
    return this._getModelBindingsFromPlan(changedAttributes, plan, modelInfo);
  }

  /** Resolves model bindings and layout information from one planner pass. */
  getModelBindingPlan(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: ModelInfo,
    options?: {includeAllAttributes?: boolean}
  ): GroupedModelBindingPlan {
    const plan = this._getTableBufferPlan(this._getPlanningAttributes(modelInfo), modelInfo);

    if (options?.includeAllAttributes) {
      changedAttributes = this.getAttributes();
    }
    changedAttributes = this._getChangedAttributesWithGenerated(changedAttributes, modelInfo);

    const modelBindings = this._getModelBindingsFromPlan(changedAttributes, plan, modelInfo);

    return {
      ...modelBindings,
      bufferLayouts: this._getBufferLayoutsFromPlan(plan, modelInfo)
    };
  }

  private _getModelBindingsFromPlan(
    changedAttributes: {[id: string]: Attribute},
    plan: TableBufferPlan,
    modelInfo?: ModelInfo
  ): GroupedModelBindings {
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
        const attributeValues = attribute.getPublishedValues();
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

  private _getTableBufferPlan(attributes: Attribute[], modelInfo?: ModelInfo) {
    const reservedVertexBufferCount =
      modelInfo?.reservedVertexBufferCount ??
      ((modelInfo as {_gpuGeometry?: {bufferLayout?: BufferLayout[]}} | undefined)?._gpuGeometry
        ?.bufferLayout?.length ||
        0);

    const columns = attributes.map(attribute => this._getColumnDescriptor(attribute, modelInfo));

    return TableBufferPlanner.getAllocationPlan({
      id: this.id,
      device: this.device,
      columns,
      modelInfo: modelInfo && {...modelInfo, reservedVertexBufferCount},
      generateConstantAttributes: this.generateConstantAttributes,
      isTransitionAttribute: name => this.attributeTransitionManager.hasAttribute(name)
    });
  }

  private _getBufferLayoutsFromPlan(
    plan: TableBufferPlan,
    modelInfo?: ModelInfo
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

  private _getPlanningAttributes(modelInfo?: ModelInfo): Attribute[] {
    const attributes = Object.values(this.getAttributes());

    if (!this._isRowGeometryMode(modelInfo)) {
      return attributes;
    }

    if (!this.attributes.rowIndex) {
      attributes.push(this.rowGeometryAttributes.rowIndex);
    }
    if (!this.attributes.pickingColors) {
      attributes.push(this.rowGeometryAttributes.pickingColors);
    }

    return attributes;
  }

  private _getChangedAttributesWithGenerated(
    changedAttributes: {[id: string]: Attribute},
    modelInfo?: ModelInfo
  ): {[id: string]: Attribute} {
    if (!this._isRowGeometryMode(modelInfo)) {
      return changedAttributes;
    }

    const attributes = {...changedAttributes};
    if (!this.attributes.rowIndex) {
      attributes.rowIndex = this.rowGeometryAttributes.rowIndex;
    }
    if (!this.attributes.pickingColors) {
      attributes.pickingColors = this.rowGeometryAttributes.pickingColors;
    }
    return attributes;
  }

  private _isRowGeometryMode(modelInfo?: ModelInfo): boolean {
    return modelInfo?.isInstanced === false;
  }

  private _getAttribute(id: string): Attribute {
    return this.attributes[id] || this.rowGeometryAttributes[id as keyof RowGeometryAttributes];
  }

  private _getColumnDescriptor(attribute: Attribute, modelInfo?: ModelInfo): TableColumnDescriptor {
    const stepMode = attribute.getBufferLayout(modelInfo).stepMode as 'vertex' | 'instance';

    return {
      id: attribute.id,
      byteStride: attribute.getPackedBufferStride(null),
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
      supportsPackedBuffer: attribute.supportsPackedBuffer(stepMode, modelInfo),
      isGeneratedRowGeometry: attribute.id === 'rowIndex' || attribute.id === 'pickingColors',
      priority: getColumnPriority(attribute)
    };
  }

  private _getStorageBufferByteLength(attribute: Attribute): number {
    if (ArrayBuffer.isView(attribute.value)) {
      return attribute.value.byteLength;
    }
    return Math.max(1, attribute.numInstances) * attribute.getPackedBufferStride(null);
  }

  private _updateRowGeometryAttributes(
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

  /** Builds the shared buffer layout metadata for one packed attribute group. */
  private _getPackedBufferGroupLayout(
    group: TableBufferGroup,
    modelInfo?: ModelInfo
  ): PackedBufferGroupLayout {
    const byteStride = group.columns.reduce(
      (stride, {id, fp64Component}) =>
        stride + this._getAttribute(id).getPackedBufferStride(fp64Component ?? null),
      0
    );
    const rowCount =
      group.rowCount ?? Math.max(1, ...group.columns.map(({id}) => this._getAttribute(id).numInstances));
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
      const layout = attribute.getPackedBufferLayout(
        byteStride,
        byteOffset,
        this.device.type,
        fp64Component ?? null
      );
      attributes.push(...layout.attributes);
      Object.assign(attributeOffsets, layout.attributeOffsets);
      attributeNames.push(...layout.attributeNames);
      byteOffset += attribute.getPackedBufferStride(fp64Component ?? null);
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
    let state: PackedBufferGroupState | undefined = this.packedBuffers[group.id];
    let buffer = state?.buffer;
    const layoutChanged = !state || !this._packedBufferGroupLayoutEquals(state.layout, layout);
    let rewriteAll = layoutChanged;

    if (!buffer || buffer.byteLength < layout.byteLength) {
      buffer?.delete();
      buffer = this.device.createBuffer({
        id: `${this.id}-${group.id}`,
        usage: Buffer.VERTEX | Buffer.COPY_DST,
        byteLength: layout.byteLength
      });
      state = undefined;
      rewriteAll = true;
    }

    const data = rewriteAll ? new Uint8Array(layout.byteLength) : state!.data;
    for (const {id, fp64Component} of group.columns) {
      const attribute = this._getAttribute(id);
      if (!rewriteAll && state && !changedAttributes[id]) {
        continue;
      }
      const attributeName = fp64Component === 'low' ? `${id}64Low` : id;
      attribute.writeToPackedBuffer(data, {
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

function encodePickingColor(index: number, target: Uint8ClampedArray, offset: number): void {
  const colorIndex = index + 1;
  target[offset + 0] = colorIndex & 255;
  target[offset + 1] = (colorIndex >> 8) & 255;
  target[offset + 2] = (colorIndex >> 16) & 255;
  target[offset + 3] = 0;
}

function getSourceIndex(data: any, row: number): number | null {
  const object = Array.isArray(data) ? data[row] : data?.[row];
  return Number.isFinite(object?.__source?.index) ? object.__source.index : null;
}

function isPositionAttribute(id: string): boolean {
  return id === 'positions' || /Positions$/.test(id);
}

function isColorAttribute(id: string): boolean {
  return /Colors?$/.test(id);
}

function isGeneratedPickingColorAttribute(id: string): boolean {
  return id === 'pickingColors' || id === 'instancePickingColors';
}

function isExternalGpuBufferOnlyAttribute(attribute: Attribute): boolean {
  return Boolean((attribute as unknown as {state?: {externalBuffer?: Buffer | null}}).state?.externalBuffer);
}

function canUseNoAllocPlannedBuffer(attribute: Attribute): boolean {
  return (
    isGeneratedPickingColorAttribute(attribute.id) &&
    typeof attribute.settings.update === 'function' &&
    !isExternalGpuBufferOnlyAttribute(attribute)
  );
}

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
