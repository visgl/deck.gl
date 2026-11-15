// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {
  Data as ArrowData,
  DataType,
  Dictionary,
  Field,
  RecordBatch,
  Schema
} from 'apache-arrow';

/** Recreates schema metadata from another Arrow runtime, including schemas with no batches. */
export function normalizeArrowSchema(schema: Schema, arrow: typeof import('apache-arrow')): Schema {
  if (schema instanceof arrow.Schema) {
    return schema;
  }

  /** Recreates field metadata with the local Arrow classes. */
  function localizeField(field: Field): Field {
    return new arrow.Field(field.name, localizeType(field.type), field.nullable, field.metadata);
  }

  /** Reuses type parameters while adapting nested fields and dictionary types. */
  function localizeType(type: DataType): DataType {
    const Constructor = arrow[type.constructor.name as keyof typeof arrow];
    if (typeof Constructor !== 'function' || !(Constructor.prototype instanceof arrow.DataType)) {
      throw new Error('Unsupported Arrow type from another runtime');
    }
    const local = Object.assign(Object.create(Constructor.prototype), type);
    if (type.children) {
      local.children = type.children.map(localizeField);
    }
    if (arrow.DataType.isDictionary(type)) {
      local.indices = localizeType(type.indices);
      local.dictionary = localizeType(type.dictionary);
    }
    return local;
  }

  return new arrow.Schema(schema.fields.map(localizeField), schema.metadata);
}

/** Rebuilds data views in the local Arrow runtime, borrowing the column buffers. */
export function normalizeArrowBatch(
  batch: RecordBatch,
  arrow: typeof import('apache-arrow')
): RecordBatch {
  const {Data, Vector} = arrow;
  const {schema, data} = batch;
  const localSchema = normalizeArrowSchema(schema, arrow);

  /** Recreates nested data views so Arrow can construct local vectors from them. */
  function localizeData(source: ArrowData, type: DataType): ArrowData {
    // The supported Arrow runtime cannot construct data with variadic buffers.
    if ((source as ArrowData & {variadicBuffers?: unknown[]}).variadicBuffers?.length) {
      throw new Error('Unsupported Arrow variadic buffers from another runtime');
    }
    return new Data(
      type,
      source.offset,
      source.length,
      source.nullCount,
      source.buffers,
      source.children.map((child, index) => localizeData(child, type.children[index].type)),
      source.dictionary &&
        new Vector(
          source.dictionary.data.map(child => localizeData(child, (type as Dictionary).dictionary))
        )
    );
  }

  return new arrow.RecordBatch(
    localSchema,
    localizeData(data, new arrow.Struct(localSchema.fields)) as RecordBatch['data']
  );
}
