// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowTable} from '../utils/is-arrow-table';
import {getArrowConversionFormat} from './luma-upstream/arrow-schema';
import type {ColumnDefinition} from './layer-columns';
import type {ColumnSource} from './luma-upstream/arrow-converter';

/** Public column names and whether each input is exposed as a prop. */
export type ColumnDefinitions = Readonly<Record<string, Partial<ColumnDefinition>>>;

/**
 * Selects explicit inputs first, then compatible fields from an opted-in table.
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
