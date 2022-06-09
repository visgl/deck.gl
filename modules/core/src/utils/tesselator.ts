// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import {createIterable, getAccessorFromBuffer} from './iterable-utils';
import defaultTypedArrayManager from './typed-array-manager';
import assert from './assert';

import {Buffer} from '@luma.gl/webgl';

import type {BinaryAttribute} from '../lib/attribute/attribute';
import type {TypedArray} from '../types/types';
import type {AccessorFunction} from '../types/layer-props';
import type {TypedArrayManager} from './typed-array-manager';

type ExternalBuffer = TypedArray | Buffer | BinaryAttribute;

type TesselatorOptions<GeometryT, ExtraOptionsT> = ExtraOptionsT & {
  attributes?: Record<string, any>;
  getGeometry?: AccessorFunction<any, GeometryT>;
  data?: any;
  buffers?: Record<string, ExternalBuffer>;
  geometryBuffer?: ExternalBuffer;
  positionFormat?: 'XY' | 'XYZ';
  dataChanged?: {startRow: number; endRow?: number}[] | string | false;
  normalize?: boolean;
};

export type GeometryUpdateContext = {
  vertexStart: number;
  indexStart: number;
  geometrySize: number;
  geometryIndex: number;
};

export default abstract class Tesselator<GeometryT, NormalizedGeometryT, ExtraOptionsT> {
  opts: TesselatorOptions<GeometryT, ExtraOptionsT>;
  typedArrayManager: TypedArrayManager;
  indexStarts: number[] = [0];
  vertexStarts: number[] = [0];
  vertexCount: number = 0;
  instanceCount: number = 0;
  attributes: Record<string, TypedArray | null>;

  protected _attributeDefs: any;
  protected data: any;
  protected getGeometry?: AccessorFunction<any, GeometryT> | null;
  protected geometryBuffer?: ExternalBuffer;
  protected buffers!: Record<string, ExternalBuffer>;
  protected positionSize!: number;
  protected normalize!: boolean;

  constructor(opts: TesselatorOptions<GeometryT, ExtraOptionsT>) {
    const {attributes = {}} = opts;

    this.typedArrayManager = defaultTypedArrayManager;
    this.attributes = {};
    this._attributeDefs = attributes;
    this.opts = opts;

    this.updateGeometry(opts);
  }

  /* Public methods */
  updateGeometry(opts: TesselatorOptions<GeometryT, ExtraOptionsT>): void {
    Object.assign(this.opts, opts);
    const {
      data,
      buffers = {},
      getGeometry,
      geometryBuffer,
      positionFormat,
      dataChanged,
      normalize = true
    } = this.opts;
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
        buffers.positions = geometryBuffer;
      }
    }
    this.geometryBuffer = buffers.positions;

    if (Array.isArray(dataChanged)) {
      // is partial update
      for (const dataRange of dataChanged as {startRow: number; endRow?: number}[]) {
        this._rebuildGeometry(dataRange);
      }
    } else {
      this._rebuildGeometry();
    }
  }

  updatePartialGeometry({startRow, endRow}: {startRow: number; endRow: number}): void {
    this._rebuildGeometry({startRow, endRow});
  }

  // Subclass interface

  /** Convert geometry to a uniform shape */
  protected abstract normalizeGeometry(geometry: GeometryT): NormalizedGeometryT;

  /** Update the positions buffer of a single geometry */
  protected abstract updateGeometryAttributes(
    geometry: NormalizedGeometryT | null,
    context: GeometryUpdateContext
  );

  /** Get the number of vertices in a geometry */
  protected abstract getGeometrySize(geometry: NormalizedGeometryT): number;

  protected getGeometryFromBuffer(
    geometryBuffer: ExternalBuffer
  ): AccessorFunction<any, GeometryT> | null {
    const value = (geometryBuffer as BinaryAttribute).value || geometryBuffer;
    if (!ArrayBuffer.isView(value)) {
      // Cannot read binary geometries
      return null;
    }

    // @ts-ignore (2322) NumericArray not assignable to GeometryT
    return getAccessorFromBuffer(value, {
      size: this.positionSize,
      offset: (geometryBuffer as BinaryAttribute).offset,
      stride: (geometryBuffer as BinaryAttribute).stride,
      startIndices: this.data.startIndices
    });
  }

  /* Private utility methods */
  private _allocate(instanceCount: number, copy: boolean): void {
    // allocate attributes
    const {attributes, buffers, _attributeDefs, typedArrayManager} = this;
    for (const name in _attributeDefs) {
      if (name in buffers) {
        // Use external buffer
        typedArrayManager.release(attributes[name]);
        attributes[name] = null;
      } else {
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
  private _forEachGeometry(
    visitor: (geometry: GeometryT | null, index: number) => void,
    startRow: number,
    endRow: number
  ): void {
    const {data, getGeometry} = this;
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const geometry = getGeometry ? getGeometry(object, objectInfo) : null;
      visitor(geometry, objectInfo.index);
    }
  }

  /* eslint-disable complexity,max-statements */
  private _rebuildGeometry(dataRange?: {startRow: number; endRow?: number}): void {
    if (!this.data) {
      return;
    }

    let {indexStarts, vertexStarts, instanceCount} = this;
    const {data, geometryBuffer} = this;
    const {startRow = 0, endRow = Infinity} = dataRange || {};

    const normalizedData: Record<number, NormalizedGeometryT | null> = {};

    if (!dataRange) {
      // Full update - regenerate buffer layout from scratch
      indexStarts = [0];
      vertexStarts = [0];
    }
    if (this.normalize || !geometryBuffer) {
      this._forEachGeometry(
        (geometry: GeometryT | null, dataIndex: number) => {
          const normalizedGeometry = geometry && this.normalizeGeometry(geometry);
          normalizedData[dataIndex] = normalizedGeometry;
          vertexStarts[dataIndex + 1] =
            vertexStarts[dataIndex] +
            (normalizedGeometry ? this.getGeometrySize(normalizedGeometry) : 0);
        },
        startRow,
        endRow
      );
      // count instances
      instanceCount = vertexStarts[vertexStarts.length - 1];
    } else {
      // assume user provided data is already normalized
      vertexStarts = data.startIndices;
      instanceCount = vertexStarts[data.length] || 0;

      if (ArrayBuffer.isView(geometryBuffer)) {
        instanceCount = instanceCount || geometryBuffer.length / this.positionSize;
      } else if (geometryBuffer instanceof Buffer) {
        // @ts-expect-error (2339) accessor is not typed
        const byteStride = geometryBuffer.accessor.stride || this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.byteLength / byteStride;
      } else if (geometryBuffer.buffer) {
        const byteStride = geometryBuffer.stride || this.positionSize * 4;
        instanceCount = instanceCount || geometryBuffer.buffer.byteLength / byteStride;
      } else if (geometryBuffer.value) {
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
    const context: GeometryUpdateContext = {};

    this._forEachGeometry(
      (geometry: GeometryT | null, dataIndex: number) => {
        const normalizedGeometry =
          normalizedData[dataIndex] ||
          // @ts-expect-error (2352) GeometryT cannot be casted to NormalizedGeometryT. We are assuming the user passed already normalized data if opts.normalize is set to false.
          (geometry as NormalizedGeometryT);
        context.vertexStart = vertexStarts[dataIndex];
        context.indexStart = indexStarts[dataIndex];
        const vertexEnd =
          dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
        context.geometrySize = vertexEnd - vertexStarts[dataIndex];
        context.geometryIndex = dataIndex;
        this.updateGeometryAttributes(normalizedGeometry, context);
      },
      startRow,
      endRow
    );

    this.vertexCount = indexStarts[indexStarts.length - 1];
  }
}
