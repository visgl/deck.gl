// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Table} from 'apache-arrow';

/** Recognizes a table without importing or relying on a particular Arrow runtime. */
export function isArrowTable(data: unknown): data is Table {
  const table = data as Table | null | undefined;
  return Boolean(
    table &&
      Number.isInteger(table.numRows) &&
      Array.isArray(table.schema?.fields) &&
      typeof table.get === 'function' &&
      typeof table.getChild === 'function'
  );
}
