// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Buffer, type Device, type BufferLayout, type VertexFormat} from '@luma.gl/core';
import {DynamicBuffer} from '@luma.gl/core/dynamic';
import type {GPUVectorModel} from '@luma.gl/engine';
import {GPUVector, GPUConstant} from '@luma.gl/graph/gpu-data';
import type {ColumnSource} from '@deck.gl/core/arrow';

/** A single contiguous Arrow column or caller-owned GPU vector. */
export type BitmapMeshSource = ColumnSource | GPUVector;

/** Explicit triangle mesh inputs; positions and texture coordinates must be supplied together. */
export type BitmapMeshProps = {
  /** Arrow XY/XYZ lists or float32x2/float32x3 GPUVector positions, replacing bounds. */
  positions?: BitmapMeshSource | null;
  /** Two texture coordinates per vertex, with (0, 0) at the image's top left. */
  texCoords?: BitmapMeshSource | null;
  /** Optional uint16/uint32 triangle indices. Otherwise every three vertices form a triangle. */
  indices?: BitmapMeshSource | null;
};

/** Detects explicit mesh inputs, including incomplete inputs that need validation. */
export function hasBitmapMesh(props: BitmapMeshProps): boolean {
  return Boolean(props.positions || props.texCoords || props.indices);
}

/** Owns only converted Arrow allocations; supplied GPU vectors remain caller-owned. */
export class BitmapLayerMesh {
  private resources: {destroy(): void}[] = [];
  private attributes: Record<string, GPUVector | GPUConstant> = {};
  private indices: GPUVector | null = null;
  private vertexCount = 0;
  private version = 0;
  loading = false;
  bounds: [number[], number[]] | null = null;

  /** Creates mesh resources on the layer's device. */
  constructor(private readonly device: Device) {}

  /** Prepares a replacement atomically and ignores superseded asynchronous conversions. */
  async update(
    props: BitmapMeshProps,
    options: {transform?: (value: number[]) => readonly number[]; fp64?: boolean},
    changed: () => void,
    failed: (error: Error) => void
  ): Promise<void> {
    const version = ++this.version;
    this.loading = true;
    const resources: {destroy(): void}[] = [];
    try {
      if (!props.positions || !props.texCoords)
        throw new Error('Bitmap positions require texCoords');
      for (const source of [props.positions, props.texCoords, props.indices]) {
        if (source && source.data.length > 1)
          throw new Error('Bitmap meshes require single chunks');
      }
      let bounds: [number[], number[]] | null = null;
      const attributes: Record<string, GPUVector | GPUConstant> = {};
      for (const name of ['positions', 'texCoords'] as const) {
        const source = props[name]!;
        if (source instanceof GPUVector) {
          const formats = name === 'positions' ? ['float32x2', 'float32x3'] : ['float32x2'];
          if (!formats.includes(source.format as string))
            throw new Error(`Invalid bitmap ${name} format`);
          if (name === 'positions' && options.transform)
            throw new Error('Bitmap GPU positions cannot be preprojected');
          attributes[name] = source;
        } else {
          const {ArrowConverter} = await import('@deck.gl/core/arrow');
          const {DataType, makeVector} = await import('apache-arrow');
          const converter = new ArrowConverter(this.device);
          if (
            !DataType.isFixedSizeList(source.type) ||
            !(name === 'positions' ? [2, 3] : [2]).includes(source.type.listSize)
          )
            throw new Error(`Invalid bitmap ${name} format`);
          const result = await converter.convert(makeVector(source.data), {
            name,
            semantic: name === 'positions' ? 'position' : 'numeric',
            format: name === 'positions' ? 'float32x3' : 'float32x2',
            fp64: name === 'positions' && options.fp64,
            ...(name === 'positions' && {
              transform: value => {
                bounds ??= [
                  [Infinity, Infinity, Infinity],
                  [-Infinity, -Infinity, -Infinity]
                ];
                for (let i = 0; i < 3; i++) {
                  bounds[0][i] = Math.min(bounds[0][i], value[i] ?? 0);
                  bounds[1][i] = Math.max(bounds[1][i], value[i] ?? 0);
                }
                return options.transform ? options.transform(value) : value;
              }
            })
          });
          resources.push(result);
          attributes[name] = result.vector;
          if (result.residualVector) attributes.positions64Low = result.residualVector;
        }
      }
      attributes.positions64Low ??= new GPUConstant({
        format: 'float32x3',
        value: new Float32Array(3)
      });
      const vertexCount = (attributes.positions as GPUVector).length;
      if ((attributes.texCoords as GPUVector).length !== vertexCount)
        throw new Error('Bitmap position and texCoord lengths must match');
      let indices: GPUVector | null = null;
      if (props.indices instanceof GPUVector) {
        indices = props.indices;
      } else if (props.indices) {
        const {DataType, makeVector} = await import('apache-arrow');
        const source = props.indices;
        if (
          !DataType.isInt(source.type) ||
          source.type.isSigned ||
          ![16, 32].includes(source.type.bitWidth)
        )
          throw new Error('Bitmap indices must be uint16 or uint32');
        const vector = makeVector(source.data);
        const values =
          source.type.bitWidth === 16
            ? new Uint16Array(vector.length)
            : new Uint32Array(vector.length);
        for (let i = 0; i < vector.length; i++) {
          const value = vector.get(i);
          if (value === null || value >= vertexCount) throw new Error('Invalid bitmap index');
          values[i] = value;
        }
        const format = source.type.bitWidth === 16 ? 'uint16' : 'uint32';
        const buffer = this.device.createBuffer({
          data: values,
          usage: Buffer.INDEX | Buffer.COPY_DST,
          indexType: format
        });
        resources.push(buffer);
        indices = new GPUVector({
          type: 'buffer',
          name: 'indices',
          buffer,
          format,
          length: vector.length,
          ownsBuffer: false
        });
      }
      if (
        indices &&
        (!['uint16', 'uint32'].includes(indices.format as string) ||
          indices.byteStride !== (indices.format === 'uint16' ? 2 : 4))
      )
        throw new Error('Bitmap indices must be tightly packed uint16 or uint32');
      if (indices?.data[0]) {
        const chunk = indices.data[0];
        const buffer = chunk.buffer instanceof DynamicBuffer ? chunk.buffer.buffer : chunk.buffer;
        if (
          !(buffer.usage & Buffer.INDEX) ||
          buffer.indexType !== indices.format ||
          chunk.byteOffset % indices.byteStride
        )
          throw new Error('Bitmap index buffer metadata must match its vector');
      }
      if ((indices?.length ?? vertexCount) % 3)
        throw new Error('Bitmap meshes require complete triangles');
      if (version !== this.version) {
        resources.forEach(resource => resource.destroy());
        return;
      }
      const previous = this.resources;
      this.resources = resources;
      this.attributes = attributes;
      this.indices = indices;
      this.vertexCount = vertexCount;
      this.bounds = vertexCount ? bounds : null;
      this.loading = false;
      changed();
      previous.forEach(resource => resource.destroy());
    } catch (error) {
      resources.forEach(resource => resource.destroy());
      if (version === this.version) {
        this.loading = false;
        failed(error as Error);
      }
    }
  }

  /** Number of mesh vertices used to populate extension attributes. */
  getVertexCount(): number {
    return this.vertexCount;
  }

  /** Binds vertex and index inputs separately, preserving borrowed offsets and strides. */
  bind(model: GPUVectorModel): void {
    if (!this.attributes.positions) return;
    const layouts: BufferLayout[] = [];
    for (const [name, vector] of Object.entries(this.attributes)) {
      if (vector instanceof GPUVector)
        layouts.push({
          name,
          stepMode: 'vertex',
          byteStride: vector.byteStride,
          attributes: [{attribute: name, format: vector.format as VertexFormat, byteOffset: 0}]
        });
    }
    model.setGeometryVectors(this.attributes, layouts);
    model.setIndexVector(this.indices);
    model.setVertexCount(this.vertexCount);
  }

  /** Cancels pending conversion and releases only layer-owned buffers. */
  destroy(): void {
    this.version++;
    this.resources.forEach(resource => resource.destroy());
    this.resources = [];
  }
}
