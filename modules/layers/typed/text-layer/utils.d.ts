import type {NumericArray} from '@math.gl/core';
export declare type Character = {
  x: number;
  y: number;
  width: number;
  height: number;
  layoutWidth: number;
  layoutHeight: number;
  layoutOffsetY?: number;
};
export declare type CharacterMapping = Record<string, Character>;
export declare function nextPowOfTwo(number: number): number;
/**
 * Generate character mapping table or update from an existing mapping table
 */
export declare function buildMapping({
  characterSet,
  getFontWidth,
  fontHeight,
  buffer,
  maxCanvasWidth,
  mapping,
  xOffset,
  yOffset
}: {
  /** list of characters */
  characterSet: Set<string>;
  /** function to get width of each character */
  getFontWidth: (char: string) => number;
  /** height of font */
  fontHeight: number;
  /** bleeding buffer surround each character */
  buffer: number;
  /** max width of font atlas */
  maxCanvasWidth: number;
  /** cached mapping table */
  mapping?: CharacterMapping;
  /** x position of last character in the existing mapping table */
  xOffset?: number;
  /** y position of last character in the existing mapping table */
  yOffset?: number;
}): {
  /** new mapping table */
  mapping: CharacterMapping;
  /** x position of last character in the new mapping table */
  xOffset: number;
  /** y position of last character in the new mapping table */
  yOffset: number;
  /** height of the font atlas canvas, power of 2 */
  canvasHeight: number;
};
/**
 * Wrap the given text so that each line does not exceed the given max width.
 * Returns a list of indices where line breaks should be inserted.
 */
export declare function autoWrapping(
  text: string[],
  wordBreak: 'break-all' | 'break-word',
  maxWidth: number,
  iconMapping: CharacterMapping,
  startIndex: number,
  endIndex: number
): number[];
/**
 * Transform a text paragraph to an array of characters, each character contains
 */
export declare function transformParagraph(
  paragraph: string,
  /** CSS line-height */
  lineHeight: number,
  /** CSS word-break option */
  wordBreak: 'break-word' | 'break-all',
  /** CSS max-width */
  maxWidth: number,
  /** character mapping table for retrieving a character from font atlas */
  iconMapping: CharacterMapping
): {
  /** x position of each character */
  x: number[];
  /** y position of each character */
  y: number[];
  /** the current row width of each character */
  rowWidth: number[];
  /** the width and height of the paragraph */
  size: [number, number];
};
export declare function getTextFromBuffer({
  value,
  length,
  stride,
  offset,
  startIndices,
  characterSet
}: {
  value: Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array;
  length: number;
  stride?: number;
  offset?: number;
  startIndices: NumericArray;
  characterSet?: Set<string>;
}): {
  texts: string[];
  characterCount: number;
};
// # sourceMappingURL=utils.d.ts.map
