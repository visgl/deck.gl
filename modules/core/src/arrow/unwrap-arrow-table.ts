// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowTable} from './upstream-math/is-arrow-table';

/** Reads a bare Arrow table or the table inside a loaders.gl Arrow result. */
export function unwrapArrowTable(source: unknown) {
  if (isArrowTable(source)) {
    return source;
  }
  const result = source as {shape?: unknown; data?: unknown} | null;
  return result?.shape === 'arrow-table' && isArrowTable(result.data) ? result.data : null;
}
