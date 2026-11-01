// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createIterable} from '@deck.gl/core';
import {
  Buffer,
  dataTypeDecoder,
  type BufferLayout,
  type Device,
  type RenderPass,
  type VertexFormat
} from '@luma.gl/core';
import {DynamicBuffer} from '@luma.gl/engine';
import {GPUConstant, GPUVector, getGPUVectorFormatInfo} from '@luma.gl/gpgpu/gpu-data';
import type {_GPUVectorModel as GPUVectorModel} from '@deck.gl/core';

import type {ColumnSource} from '@deck.gl/core/arrow';

export type ColumnDefinition = {
  attribute: string;
  accessor: string;
  semantic: 'position' | 'scalar' | 'color' | 'vector';
  size: number;
  prop?: boolean;
};

type PositionOptions = {
  transform?: ((value: number[]) => readonly number[]) | null;
  fp64?: boolean;
  requireRows?: boolean;
};

type Rows = {length: number; at(index: number): any};

type Request = {source: unknown; rows?: Rows};

type Columns = Record<string, GPUVector | GPUConstant>;
type Prepared = {
  columns: Columns;
  destroy(): void;
  length: number;
  source: unknown;
  rows: Rows;
  chunkLengths?: number[];
};

/** Prepares column inputs and accessor fallbacks for a layer. */
export class LayerColumns {
  private prepared?: Prepared;
  private version = 0;
  private request?: Request;
  loading = false;
  /** Number of rows in the last successfully prepared columns, used as the instance count. */
  get length(): number {
    return this.prepared?.length ?? 0;
  }
  /** Identifies the picking input in the currently prepared columns. */
  get hasRowIndexes(): boolean {
    return Boolean(this.prepared?.columns.rowIndexes);
  }
  /** Uses the layer's device to upload accessor values and convert Arrow columns. */
  constructor(
    private readonly device: Device,
    private readonly definitions: Record<string, ColumnDefinition>,
    private readonly name: string,
    private readonly useRowIndexes = false
  ) {}

  /** Supplies shader input layouts while asynchronous conversion has not produced buffers yet. */
  getBufferLayouts(useRowIndexes = false): BufferLayout[] {
    const formats: Record<string, VertexFormat> = {};
    for (const definition of Object.values(this.definitions)) {
      formats[definition.attribute] = (
        definition.semantic === 'color'
          ? 'unorm8x4'
          : definition.size === 1
            ? 'float32'
            : `float32x${definition.size}`
      ) as VertexFormat;
      if (definition.semantic === 'position') formats[`${definition.attribute}64Low`] = 'float32x3';
    }
    if (useRowIndexes) formats.rowIndexes = 'uint32';
    let offset = 0;
    const attributes = Object.entries(formats).map(([name, format]) => {
      const attribute = {attribute: name, format, byteOffset: offset};
      offset += getGPUVectorFormatInfo(format).byteLength;
      return attribute;
    });
    return [{name: `${this.name}-initial`, stepMode: 'instance', byteStride: 0, attributes}];
  }

  /** Checks only column/accessor inputs; uniform-only changes do not upload columns again. */
  needsUpdate(props: Record<string, any>, oldProps: Record<string, any>): boolean {
    return (
      !this.request ||
      props.data !== this.request.source ||
      props.modelMatrix !== oldProps.modelMatrix ||
      props.coordinateOrigin !== oldProps.coordinateOrigin ||
      props.coordinateSystem !== oldProps.coordinateSystem ||
      Object.entries(this.definitions).some(
        ([name, definition]) =>
          props[name] !== oldProps[name] ||
          props[definition.accessor] !== oldProps[definition.accessor]
      )
    );
  }

  /**
   * Converts explicit columns and fills missing inputs from accessors or binary attributes.
   * Replaces the previous result only after all inputs succeed; superseded requests release
   * their allocations so asynchronous completions cannot overwrite newer state.
   */
  async update(
    props: Record<string, any>,
    changed: () => void,
    failed: (error: Error) => void,
    positionOptions: PositionOptions = {}
  ): Promise<void> {
    const version = ++this.version;
    this.loading = true;
    const previousRequest = this.request;
    const request: Request = {source: props.data};
    this.request = request;
    const results: Array<{destroy(): void}> = [];
    try {
      const rows = this.getRows(props.data, previousRequest);
      request.rows = rows;
      if (version !== this.version) return;
      if (positionOptions.requireRows && !rows.length) {
        this.prepared?.destroy();
        this.prepared = {columns: {}, length: 0, source: props.data, rows, destroy() {}};
        this.loading = false;
        changed();
        return;
      }
      const {ArrowConverter} = await import('@deck.gl/core/arrow');
      const converter = new ArrowConverter(this.device);
      const columns: Columns = {};
      let length: number | undefined;
      let chunkLengths: number[] | undefined;
      for (const [name, definition] of Object.entries(this.definitions)) {
        const source =
          definition.prop === false ? undefined : (props[name] as ColumnSource | undefined);
        if (!source) continue;
        const result = await converter.convert(source as Parameters<typeof converter.convert>[0], {
          name,
          semantic: definition.semantic === 'vector' ? 'numeric' : definition.semantic,
          ...(definition.semantic === 'position'
            ? {
                format: 'float32x3',
                transform: positionOptions.transform ?? undefined,
                fp64: positionOptions.fp64
              }
            : {})
        });
        results.push(result);
        if (version !== this.version) {
          for (const result of results) result.destroy();
          return;
        }
        const lengths = result.vector.data.map(chunk => chunk.length);
        if (
          chunkLengths &&
          (lengths.length !== chunkLengths.length ||
            lengths.some((value, index) => value !== chunkLengths![index]))
        )
          throw new Error('Arrow column chunk structures must match');
        chunkLengths ??= lengths;
        length ??= result.vector.length;
        if (result.vector.length !== length) throw new Error('Arrow column lengths must match');
        columns[definition.attribute] = result.vector;
        if (definition.semantic === 'position' && result.residualVector)
          columns[`${definition.attribute}64Low`] = result.residualVector;
      }
      length ??= 0;
      if (rows.length && rows.length !== length)
        throw new Error('data rows must match Arrow column lengths');
      for (const [name, definition] of Object.entries(this.definitions)) {
        if (definition.prop === false || !props[name]) {
          columns[definition.attribute] = await this.makeAccessorColumn(
            props,
            definition.accessor,
            definition.size,
            definition.semantic === 'color',
            length,
            results,
            columns,
            positionOptions,
            rows,
            definition.semantic === 'position' ? `${definition.attribute}64Low` : undefined
          );
        }
      }
      if (this.useRowIndexes && props.data?.attributes?.rowIndexes) {
        columns.rowIndexes = await this.makeAccessorColumn(
          props,
          'rowIndexes',
          1,
          false,
          length,
          results,
          columns,
          positionOptions,
          rows
        );
      }
      for (const definition of Object.values(this.definitions)) {
        if (definition.semantic === 'position')
          columns[`${definition.attribute}64Low`] ??= new GPUConstant({
            format: 'float32x3',
            value: new Float32Array(3)
          });
      }
      if (this.device.type === 'webgpu') {
        const values = Object.values(columns);
        const bindingCount =
          values.filter(column => column instanceof GPUVector).length +
          Number(values.some(column => column instanceof GPUConstant));
        if (bindingCount > this.device.limits.maxVertexBuffers) {
          throw new Error(
            `${this.name} Arrow columns require ${bindingCount} vertex buffers; this device supports ${this.device.limits.maxVertexBuffers}`
          );
        }
      }
      if (version !== this.version) {
        for (const result of results) result.destroy();
        return;
      }
      this.prepared?.destroy();
      this.prepared = {
        columns,
        length,
        chunkLengths,
        source: props.data,
        rows,
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

  /** Draws matching Arrow batches, slicing accessor buffers to the same ranges. */
  draw(model: GPUVectorModel, renderPass: RenderPass, onBatch?: (offset: number) => void): void {
    const prepared = this.prepared;
    if (!prepared) return;
    let start = 0;
    for (const length of prepared.chunkLengths ?? []) {
      if (!length) continue;
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
          length,
          byteOffset: offset,
          byteStride: chunk.byteStride
        });
        layouts.push({
          name,
          stepMode: 'instance',
          byteStride: chunk.byteStride,
          attributes: [{attribute: name, format: column.format as VertexFormat, byteOffset: offset}]
        });
      }
      if (constants.length)
        layouts.push({
          name: `${this.name}-constants`,
          stepMode: 'instance',
          byteStride: 0,
          attributes: constants
        });
      model.setGPUAttributes(columns, layouts);
      onBatch?.(start);
      model.setInstanceCount(length);
      model.draw(renderPass);
      start += length;
    }
  }

  /** Releases owned conversion results and prevents completion of pending replacements. */
  destroy(): void {
    this.version++;
    this.prepared?.destroy();
    this.prepared = undefined;
    this.request = undefined;
  }

  /**
   * Provides indexed rows for fallback accessors without copying already indexable data.
   * Materializes iterables and retains one-shot iterator rows across pending or failed requests.
   */
  private getRows(data: any, previousRequest?: Request): Rows {
    if (data && Number.isFinite(data.length))
      return {length: data.length, at: index => data[index]};
    if (data && Number.isFinite(data.numRows) && typeof data.get === 'function') {
      return {length: data.numRows, at: index => data.get(index)};
    }
    const iterator = data?.[Symbol.iterator]?.();
    if (!iterator) return {length: 0, at: () => null};
    // Normalize a one-shot input once, even while its request is pending or failed.
    if (iterator === data) {
      if (previousRequest && previousRequest.source === data) {
        if (previousRequest.rows) return previousRequest.rows;
        throw new Error('Replace a failed row iterator before retrying');
      }
      if (this.prepared && this.prepared.source === data) return this.prepared.rows;
    }
    const rows = Array.from({[Symbol.iterator]: () => iterator});
    return {length: rows.length, at: index => rows[index]};
  }

  /**
   * Builds a missing shader input from a binary attribute, constant, or row accessor.
   * Borrows compatible buffers; otherwise packs and owns uploads, including position residuals
   * and coordinate transforms needed to match the normal attribute path.
   */
  private async makeAccessorColumn(
    props: Record<string, any>,
    accessor: string,
    size: number,
    color: boolean,
    length: number,
    owned: Array<{destroy(): void}>,
    columns: Columns,
    positionOptions: PositionOptions,
    rows: Rows,
    lowAttribute?: string
  ): Promise<GPUVector | GPUConstant> {
    let binaryColor = false;
    const binary = props.data?.attributes?.[accessor];
    if (binary) {
      const descriptor = ArrayBuffer.isView(binary)
        ? {value: binary}
        : binary instanceof Buffer
          ? {buffer: binary}
          : binary;
      const values = descriptor.value;
      const sourceSize = descriptor.size ?? (color ? props.colorFormat?.length : undefined) ?? size;
      let type =
        descriptor.type ??
        (values instanceof Float64Array
          ? 'float64'
          : values
            ? dataTypeDecoder.getDataType(values)
            : accessor === 'rowIndexes'
              ? 'uint32'
              : color
                ? 'unorm8'
                : 'float32');
      if (!descriptor.type && (descriptor.normalized ?? color) && type !== 'float64')
        type = type.replace('int', 'norm');
      const typeInfo = type === 'float64' ? null : dataTypeDecoder.getDataTypeInfo(type);
      if (
        !descriptor.constant &&
        sourceSize === size &&
        type !== 'float64' &&
        (!typeInfo!.integer || accessor === 'rowIndexes') &&
        !(Boolean(lowAttribute) && positionOptions.transform)
      ) {
        const format = (size === 1 ? type : `${type}x${size}`) as any;
        const bytes = getGPUVectorFormatInfo(format).byteLength;
        const buffer =
          descriptor.buffer ??
          this.device.createBuffer({
            data: values,
            usage: Buffer.VERTEX | Buffer.COPY_SRC | Buffer.COPY_DST
          });
        if (!descriptor.buffer) owned.push(buffer);
        if (
          length &&
          (descriptor.offset ?? 0) + (length - 1) * (descriptor.stride ?? bytes) + bytes >
            buffer.byteLength
        )
          throw new Error('Binary attribute is shorter than the Arrow columns');
        return new GPUVector({
          type: 'buffer',
          name: accessor,
          buffer,
          ownsBuffer: false,
          format,
          length,
          byteOffset: descriptor.offset ?? 0,
          byteStride: descriptor.stride ?? bytes
        });
      }
      const TypedArray =
        type === 'float64' ? Float64Array : dataTypeDecoder.getTypedArrayConstructor(type);
      const bytes = values ?? (await descriptor.buffer.readAsync());
      const view =
        values ??
        new TypedArray(
          bytes.buffer,
          bytes.byteOffset,
          bytes.byteLength / TypedArray.BYTES_PER_ELEMENT
        );
      const stride =
        (descriptor.stride ?? sourceSize * view.BYTES_PER_ELEMENT) / view.BYTES_PER_ELEMENT;
      const offset = (descriptor.offset ?? 0) / view.BYTES_PER_ELEMENT;
      const rowCount = descriptor.constant ? 1 : length;
      if (rowCount && offset + (rowCount - 1) * stride + sourceSize > view.length)
        throw new Error('Binary attribute is shorter than the Arrow columns');
      binaryColor = color;
      const normalize = (value: number) => {
        if (!typeInfo?.normalized) return value;
        const bits = typeInfo.byteLength * 8;
        return typeInfo.signed
          ? Math.max(-1, value / (2 ** (bits - 1) - 1))
          : value / (2 ** bits - 1);
      };
      const readValue = (index: number) =>
        sourceSize === 1
          ? normalize(view[offset + index * stride])
          : Array.from(
              view.subarray(offset + index * stride, offset + index * stride + sourceSize),
              normalize
            );
      props = {
        ...props,
        [accessor]: descriptor.constant ? readValue(0) : (_row, {index}) => readValue(index)
      };
    }
    const source = props[accessor];
    const format =
      accessor === 'rowIndexes'
        ? 'uint32'
        : color && !binaryColor
          ? 'unorm8x4'
          : size === 1
            ? 'float32'
            : `float32x${size}`;
    const lows =
      Boolean(lowAttribute) && positionOptions.fp64
        ? new Float32Array(Math.max(1, length) * size)
        : undefined;
    const pack = (value: any, target: Float32Array | Uint8Array | Uint32Array, offset: number) => {
      if (Boolean(lowAttribute) && positionOptions.transform)
        value = positionOptions.transform(value);
      for (let component = 0; component < size; component++) {
        target[offset + component] =
          size === 1
            ? Number(value)
            : (value?.[component] ?? (color && component === 3 ? (binaryColor ? 1 : 255) : 0));
        if (lows) lows[offset + component] = (value?.[component] ?? 0) - target[offset + component];
      }
    };
    if (typeof source !== 'function') {
      const value =
        accessor === 'rowIndexes'
          ? new Uint32Array(size)
          : color && !binaryColor
            ? new Uint8Array(size)
            : new Float32Array(size);
      pack(source, value, 0);
      if (lows)
        columns[lowAttribute!] = new GPUConstant({
          format: 'float32x3',
          value: lows.slice(0, size)
        });
      return new GPUConstant({format: format as any, value});
    }
    const values =
      accessor === 'rowIndexes'
        ? new Uint32Array(length * size)
        : color && !binaryColor
          ? new Uint8Array(length * size)
          : new Float32Array(length * size);
    const {objectInfo} = createIterable(null);
    objectInfo.data = props.data;
    for (let index = 0; index < length; index++) {
      objectInfo.index = index;
      pack(source(rows.at(index) ?? null, objectInfo), values, index * size);
    }
    const upload = (data: Float32Array | Uint8Array | Uint32Array) => {
      const buffer = this.device.createBuffer({
        data,
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
    };
    if (lows) columns[lowAttribute!] = upload(lows);
    return upload(values);
  }
}
