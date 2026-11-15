// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Data as ArrowData, DataType, Dictionary, Field, RecordBatch} from 'apache-arrow';

/** Rebuilds Arrow metadata and data views in the local runtime, borrowing the column buffers. */
export function normalizeArrowBatch(
  batch: RecordBatch,
  arrow: typeof import('apache-arrow')
): RecordBatch {
  const {Data, Schema, Vector} = arrow;
  const {schema, data} = batch;
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

  const localSchema = new Schema(schema.fields.map(localizeField), schema.metadata);

  /** Recreates nested data views so Arrow can construct local vectors from them. */
  function localizeData(source: ArrowData, type: DataType): ArrowData {
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
