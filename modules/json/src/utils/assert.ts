// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export function assert(condition, message = '') {
  if (!condition) {
    throw new Error(`JSON conversion error ${message}`);
  }
}
