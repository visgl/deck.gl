// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Vector} from 'apache-arrow';

/** Recognizes Arrow vectors across runtime copies without loading the optional Arrow peer. */
export function isArrowVector(value: unknown): value is Vector {
  const vector = value as Vector | null | undefined;
  return Boolean(
    vector &&
      Number.isInteger(vector.length) &&
      Number.isInteger(vector.type?.typeId) &&
      Array.isArray(vector.data) &&
      typeof vector.get === 'function'
  );
}
