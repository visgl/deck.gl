// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {isArrowVector} from './upstream-math/is-arrow-vector';

/** Adapts Arrow list cells to the nested arrays expected by row accessor consumers. */
export function readAccessorValue(value: unknown): unknown {
  if (isArrowVector(value)) {
    return Array.from({length: value.length}, (_, index) => readAccessorValue(value.get(index)));
  }
  return value;
}
