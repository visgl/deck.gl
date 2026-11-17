// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {type Color, _packNormalizedColor as packNormalizedColor} from '@deck.gl/core';

/** Pack normalized plain arrays into bytes and pass through typed array inputs. */
export function toByteColor(color: Color): Color {
  if (!Array.isArray(color)) {
    return color;
  }
  /** Packed RGBA channels, with opaque alpha as the fallback. */
  const packed: [number, number, number, number] = [0, 0, 0, 255];
  packNormalizedColor(color, packed, 0, 4);
  return packed;
}
