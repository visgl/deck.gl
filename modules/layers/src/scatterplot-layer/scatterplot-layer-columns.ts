// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createIterable} from '@deck.gl/core';
import {
  Buffer,
  type BufferLayout,
  type Device,
  type RenderPass,
  type VertexFormat
} from '@luma.gl/core';
import {DynamicBuffer} from '@luma.gl/engine';
import {GPUConstant, GPUVector, getGPUVectorFormatInfo} from '@luma.gl/gpgpu/gpu-data';
import type {_GPUVectorModel as GPUVectorModel} from '@deck.gl/core';

import type {ColumnSource as ScatterplotColumn} from '@deck.gl/core/arrow';

const DEFINITIONS = {
  positions: {
    attribute: 'instancePositions',
    accessor: 'getPosition',
    semantic: 'position',
    size: 3
  },
  radii: {attribute: 'instanceRadius', accessor: 'getRadius', semantic: 'scalar', size: 1},
  fillColors: {
    attribute: 'instanceFillColors',
    accessor: 'getFillColor',
    semantic: 'color',
    size: 4
  },
  lineColors: {
    attribute: 'instanceLineColors',
    accessor: 'getLineColor',
    semantic: 'color',
    size: 4
  },
  lineWidths: {
    attribute: 'instanceLineWidths',
    accessor: 'getLineWidth',
    semantic: 'scalar',
    size: 1
  }
} as const;
export type ScatterplotColumnName = keyof typeof DEFINITIONS;
/** Explicit column props override the matching accessors when supplied. */
export type ScatterplotColumnProps = {
  /** Arrow XY/XYZ position column overriding getPosition. */
  positions?: ScatterplotColumn | null;
  /** Arrow numeric radius column overriding getRadius. */
  radii?: ScatterplotColumn | null;
  /** Arrow RGB/RGBA fill column overriding getFillColor. */
  fillColors?: ScatterplotColumn | null;
  /** Arrow RGB/RGBA stroke column overriding getLineColor. */
  lineColors?: ScatterplotColumn | null;
  /** Arrow numeric stroke width column overriding getLineWidth. */
  lineWidths?: ScatterplotColumn | null;
};

type Columns = Record<string, GPUVector | GPUConstant>;
type Prepared = {columns: Columns; destroy(): void; length: number};

/** Returns whether the caller selected the explicit-column path. */
export function hasScatterplotColumns(props: ScatterplotColumnProps): boolean {
  return Object.keys(DEFINITIONS).some(name => Boolean(props[name as ScatterplotColumnName]));
}

/** Direct model binding and ownership for Scatterplot's optional Arrow column inputs. */
export class ScatterplotLayerColumns {
  private prepared?: Prepared;
  private version = 0;
  loading = false;
  get length(): number {
    return this.prepared?.length ?? 0;
  }
  constructor(private readonly device: Device) {}

  /** Initial shader input layouts used before asynchronous conversion completes. */
  getBufferLayouts(): BufferLayout[] {
    const formats: Record<string, VertexFormat> = {
      instancePositions: 'float32x3',
      instancePositions64Low: 'float32x3',
      instanceRadius: 'float32',
      instanceFillColors: 'unorm8x4',
      instanceLineColors: 'unorm8x4',
      instanceLineWidths: 'float32',
      instancePixelOffset: 'float32x2'
    };
    let offset = 0;
    const attributes = Object.entries(formats).map(([name, format]) => {
      const attribute = {attribute: name, format, byteOffset: offset};
      offset += getGPUVectorFormatInfo(format).byteLength;
      return attribute;
    });
    return [{name: 'scatterplot-initial', stepMode: 'instance', byteStride: 0, attributes}];
  }

  /** Checks only column/accessor inputs; uniform-only changes do not upload columns again. */
  needsUpdate(props: Record<string, any>, oldProps: Record<string, any>): boolean {
    return (
      (!this.prepared && !this.loading) ||
      props.getPixelOffset !== oldProps.getPixelOffset ||
      Object.entries(DEFINITIONS).some(
        ([name, definition]) =>
          props[name] !== oldProps[name] ||
          props[definition.accessor] !== oldProps[definition.accessor]
      )
    );
  }

  /** Converts a replacement atomically; older requests cannot overwrite newer columns. */
  async update(
    props: Record<string, any>,
    changed: () => void,
    failed: (error: Error) => void
  ): Promise<void> {
    const version = ++this.version;
    this.loading = true;
    const results: Array<{destroy(): void}> = [];
    try {
      const {ArrowConverter} = await import('@deck.gl/core/arrow');
      const converter = new ArrowConverter(this.device);
      const columns: Columns = {};
      let length: number | undefined;
      for (const [name, definition] of Object.entries(DEFINITIONS)) {
        const source = props[name] as ScatterplotColumn | undefined;
        if (!source) continue;
        const result = await converter.convert(source as Parameters<typeof converter.convert>[0], {
          name,
          semantic: definition.semantic
        });
        results.push(result);
        if (version !== this.version) {
          for (const result of results) result.destroy();
          return;
        }
        length ??= result.vector.length;
        if (result.vector.length !== length)
          throw new Error('Scatterplot column lengths must match');
        columns[definition.attribute] = result.vector;
        if (name === 'positions' && result.residualVector)
          columns.instancePositions64Low = result.residualVector;
      }
      length ??= 0;
      for (const [name, definition] of Object.entries(DEFINITIONS)) {
        if (!props[name]) {
          columns[definition.attribute] = this.makeAccessorColumn(
            props,
            definition.accessor,
            definition.size,
            definition.semantic === 'color',
            length,
            results
          );
        }
      }
      columns.instancePixelOffset = this.makeAccessorColumn(
        props,
        'getPixelOffset',
        2,
        false,
        length,
        results
      );
      columns.instancePositions64Low ??= new GPUConstant({
        format: 'float32x3',
        value: new Float32Array(3)
      });
      this.prepared?.destroy();
      this.prepared = {
        columns,
        length,
        destroy: () => {
          for (const result of results) result.destroy();
        }
      };
      this.loading = false;
      changed();
    } catch (error) {
      for (const result of results) result.destroy();
      if (version === this.version) {
        this.loading = false;
        failed(error as Error);
        changed();
      }
    }
  }

  /** Binds each row-aligned buffer range directly, preserving independently chunked columns. */
  draw(model: GPUVectorModel, renderPass: RenderPass): void {
    const prepared = this.prepared;
    if (!prepared) return;
    const boundaries = new Set([0, prepared.length]);
    for (const column of Object.values(prepared.columns)) {
      if (!(column instanceof GPUVector)) continue;
      let offset = 0;
      for (const chunk of column.data) {
        offset += chunk.length;
        boundaries.add(offset);
      }
    }
    const offsets = [...boundaries].sort((a, b) => a - b);
    for (let index = 0; index < offsets.length - 1; index++) {
      const start = offsets[index],
        end = offsets[index + 1];
      if (start === end) continue;
      const columns: Columns = {};
      const layouts: BufferLayout[] = [];
      const constants: NonNullable<BufferLayout['attributes']> = [];
      let constantOffset = 0;
      for (const [name, column] of Object.entries(prepared.columns)) {
        if (column instanceof GPUConstant) {
          columns[name] = column;
          constants.push({
            attribute: name,
            format: column.format as VertexFormat,
            byteOffset: constantOffset
          });
          constantOffset += column.byteLength;
          continue;
        }
        let chunkStart = 0;
        const chunk = column.data.find(candidate => {
          if (start < chunkStart + candidate.length) return true;
          chunkStart += candidate.length;
          return false;
        })!;
        const offset = chunk.byteOffset + (start - chunkStart) * chunk.byteStride;
        const buffer = chunk.buffer instanceof DynamicBuffer ? chunk.buffer.buffer : chunk.buffer;
        columns[name] = new GPUVector({
          type: 'buffer',
          name,
          buffer,
          ownsBuffer: false,
          format: column.format!,
          length: end - start,
          byteOffset: offset,
          byteStride: chunk.byteStride
        });
        layouts.push({
          name,
          stepMode: 'instance',
          byteStride: chunk.byteStride,
          attributes: [{attribute: name, format: column.format as any, byteOffset: offset}]
        });
      }
      if (constants.length)
        layouts.push({
          name: 'scatterplot-constants',
          stepMode: 'instance',
          byteStride: 0,
          attributes: constants
        });
      model.setGPUAttributes(columns, layouts);
      model.shaderInputs.setProps({scatterplot: {rowIndexOffset: start}});
      model.setInstanceCount(end - start);
      model.draw(renderPass);
    }
  }

  /** Releases owned conversion results and prevents completion of pending replacements. */
  destroy(): void {
    this.version++;
    this.prepared?.destroy();
    this.prepared = undefined;
  }

  private makeAccessorColumn(
    props: Record<string, any>,
    accessor: string,
    size: number,
    color: boolean,
    length: number,
    owned: Array<{destroy(): void}>
  ): GPUVector | GPUConstant {
    const source = props[accessor];
    const format = color ? 'unorm8x4' : size === 1 ? 'float32' : `float32x${size}`;
    const pack = (value: any, target: Float32Array | Uint8Array, offset: number) => {
      for (let component = 0; component < size; component++)
        target[offset + component] =
          size === 1 ? Number(value) : (value?.[component] ?? (color && component === 3 ? 255 : 0));
    };
    if (typeof source !== 'function') {
      const value = color ? new Uint8Array(size) : new Float32Array(size);
      pack(source, value, 0);
      return new GPUConstant({format: format as any, value});
    }
    const values = color ? new Uint8Array(length * size) : new Float32Array(length * size);
    const {iterable, objectInfo} = createIterable(props.data, 0, length);
    let index = 0;
    for (const row of iterable) {
      if (index >= length) break;
      objectInfo.index++;
      pack(source(row, objectInfo), values, index++ * size);
    }
    const buffer = this.device.createBuffer({
      data: values,
      usage: Buffer.VERTEX | Buffer.COPY_DST | Buffer.COPY_SRC
    });
    owned.push(buffer);
    return new GPUVector({
      type: 'buffer',
      name: accessor,
      buffer,
      ownsBuffer: false,
      format: format as any,
      length
    });
  }
}
