// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as cartoColors from 'cartocolor';
import {assert} from '../utils';
import {Color} from '@deck.gl/core';

export const DEFAULT_PALETTE = 'PurpOr';
export const NULL_COLOR: Color = [204, 204, 204];
export const OTHERS_COLOR: Color = [119, 119, 119];

interface CartoColorsPalette {
  tags?: string[];
  [key: number]: string[];
}

export default function getPalette(name: string, numCategories: number): Color[] {
  const palette: CartoColorsPalette | undefined = cartoColors[name];
  let paletteIndex = numCategories;

  assert(palette, `Palette "${name}" not found. Expected a CARTOColors string`);

  const palettesColorVariants = Object.keys(palette)
    .filter(p => p !== 'tags')
    .map(Number);

  const longestPaletteIndex = Math.max(...palettesColorVariants);
  const smallestPaletteIndex = Math.min(...palettesColorVariants);

  if (!Number.isInteger(numCategories) || numCategories > longestPaletteIndex) {
    paletteIndex = longestPaletteIndex;
  } else if (numCategories < smallestPaletteIndex) {
    paletteIndex = smallestPaletteIndex;
  }

  let colors = palette[paletteIndex];

  if (palette.tags && palette.tags.includes('qualitative')) {
    colors = colors.slice(0, -1);
  }

  return colors.map(c => hexToRgb(c));
}

export function hexToRgb(hex: string): Color {
  // Evaluate #ABC
  let result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      255
    ];
  }

  // Evaluate #ABCD
  result = /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex);

  if (result) {
    return [
      parseInt(result[1] + result[1], 16),
      parseInt(result[2] + result[2], 16),
      parseInt(result[3] + result[3], 16),
      parseInt(result[4] + result[4], 16)
    ];
  }

  // Evaluate #ABCDEF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (result) {
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255];
  }

  // Evaluate #ABCDEFAF
  result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  assert(result, `Hexadecimal color "${hex}" was not parsed correctly`);

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    parseInt(result[4], 16)
  ];
}
