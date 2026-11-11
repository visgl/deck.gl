// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ColumnSource} from './luma-upstream/arrow-converter';

/** Public column names and whether each input is exposed as a prop. */
type ColumnDefinitions = Readonly<Record<string, {prop?: boolean}>>;

/**
 * Selects explicit column inputs without converting or taking ownership of them.
 * Internal shader inputs are excluded. Null and undefined leave accessor fallback active.
 */
export function resolveColumns(
  props: Readonly<Record<string, unknown>>,
  definitions: ColumnDefinitions
): Record<string, ColumnSource> {
  const columns: Record<string, ColumnSource> = {};
  for (const [name, definition] of Object.entries(definitions)) {
    const source = props[name];
    if (definition.prop !== false && source != null) {
      columns[name] = source as ColumnSource;
    }
  }
  return columns;
}
