// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowVector} from '../arrow/upstream-math/is-arrow-vector';
import {isArrowTable} from '../arrow/upstream-math/is-arrow-table';
import {getArrowConversionFormat} from '../arrow/upstream-luma/arrow-schema';
import type {ColumnDefinitions} from './layer-columns';
import type {ColumnSource} from '../arrow/upstream-luma/arrow-converter';

/**
 * Selects explicit columns, opted-in Arrow accessors, then compatible table fields.
 * Internal shader inputs are excluded. Missing inputs retain their normal fallbacks.
 */
export function resolveColumns(
  props: Readonly<Record<string, unknown>>,
  definitions: ColumnDefinitions,
  useTable = false
): Record<string, ColumnSource> {
  const table = useTable && isArrowTable(props.data) ? props.data : null;
  const columns: Record<string, ColumnSource> = {};
  for (const [name, definition] of Object.entries(definitions)) {
    if (definition.prop === false) {
      continue;
    }
    const source = props[name];
    if (source != null) {
      columns[name] = source as ColumnSource;
      continue;
    }
    const accessor = definition.accessor && props[definition.accessor];
    if (definition.arrowAccessor && isArrowVector(accessor)) {
      columns[name] = accessor;
      continue;
    }
    if (!definition.semantic) {
      continue;
    }
    const column = table?.getChild(name);
    if (!column) {
      continue;
    }
    try {
      const format = getArrowConversionFormat(column.type, {
        semantic: definition.semantic === 'vector' ? 'numeric' : definition.semantic
      });
      if (
        definition.semantic === 'vector' &&
        definition.size &&
        format !== (definition.size === 1 ? 'float32' : `float32x${definition.size}`)
      ) {
        continue;
      }
    } catch {
      continue;
    }
    columns[name] = column;
  }
  return columns;
}
