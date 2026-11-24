// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowTable} from '../arrow/upstream-math/is-arrow-table';

/** Normalizes the loaders.gl Arrow result at the layer data boundary. */
export function unwrapLoaderArrowResult(value: unknown): unknown {
  const result = value as {shape?: unknown; data?: unknown} | null | undefined;
  return result?.shape === 'arrow-table' && isArrowTable(result.data) ? result.data : value;
}
