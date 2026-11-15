// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

/** Arrow source shapes demonstrated by both luma.gl and deck.gl examples. */
export type ArrowExampleInputMode = 'stream' | 'table' | 'vectors';

export function isArrowExampleInputMode(value: unknown): value is ArrowExampleInputMode {
  return value === 'stream' || value === 'table' || value === 'vectors';
}

export const ARROW_EXAMPLE_INPUT_MODE_OPTIONS = [
  {label: 'RecordBatch stream', value: 'stream'},
  {label: 'Table + column names', value: 'table'},
  {label: 'Direct Arrow vectors', value: 'vectors'}
] as const;
