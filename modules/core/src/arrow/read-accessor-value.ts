// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Type} from 'apache-arrow';
import {isArrowVector} from './upstream-math/is-arrow-vector';

/** Adapts Arrow list cells to the nested arrays expected by row accessor consumers. */
export function readAccessorValue(value: unknown, color = false): unknown {
  if (isArrowVector(value)) {
    /** Lists of color tuples keep their per-vertex structure. */
    const typeId = value.type.typeId;
    if (color && (typeId === (2 satisfies Type.Int) || typeId === (3 satisfies Type.Float))) {
      /** Floating-point channels use normalized values; integer channels use bytes. */
      const scale = typeId === (3 satisfies Type.Float) ? 255 : 1;
      return Uint8ClampedArray.from(
        {length: value.length},
        (_, index) => Number(value.get(index)) * scale
      );
    }
    return Array.from({length: value.length}, (_, index) =>
      readAccessorValue(value.get(index), color)
    );
  }
  return value;
}
