// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Color, _packNormalizedColor as packNormalizedColor} from '@deck.gl/core';

export function toByteColor(color: Color): Color {
  if (!Array.isArray(color)) {
    return color;
  }
  const packed: Color = [0, 0, 0, 255];
  packNormalizedColor(color, packed, 0, 4);
  return packed;
}
