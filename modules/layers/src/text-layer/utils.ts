// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable max-statements, max-params, complexity, max-depth */
// TODO merge with icon-layer/icon-manager
import {log} from '@deck.gl/core';
import type {NumericArray} from '@math.gl/core';

const MISSING_CHAR_WIDTH = 32;
const SINGLE_LINE = [];

export type Character = {
  x: number;
  y: number;
  width: number;
  height: number;
  layoutWidth: number;
  layoutHeight: number;
  layoutOffsetY?: number;
};

export type CharacterMapping = Record<string, Character>;

export function nextPowOfTwo(number: number): number {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

/**
 * Generate character mapping table or update from an existing mapping table
 */
export function buildMapping({
  characterSet,
  getFontWidth,
  fontHeight,
  buffer,
  maxCanvasWidth,
  mapping = {},
  xOffset = 0,
  yOffset = 0
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
} {
  let row = 0;
  // continue from x position of last character in the old mapping
  let x = xOffset;
  const rowHeight = fontHeight + buffer * 2;

  for (const char of characterSet) {
    if (!mapping[char]) {
      // measure texts
      // TODO - use Advanced text metrics when they are adopted:
      // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
      const width = getFontWidth(char);

      if (x + width + buffer * 2 > maxCanvasWidth) {
        x = 0;
        row++;
      }
      mapping[char] = {
        x: x + buffer,
        y: yOffset + row * rowHeight + buffer,
        width,
        height: rowHeight,
        layoutWidth: width,
        layoutHeight: fontHeight
      };
      x += width + buffer * 2;
    }
  }

  return {
    mapping,
    xOffset: x,
    yOffset: yOffset + row * rowHeight,
    canvasHeight: nextPowOfTwo(yOffset + (row + 1) * rowHeight)
  };
}

function getTextWidth(
  text: string[],
  startIndex: number,
  endIndex: number,
  mapping: CharacterMapping
): number {
  let width = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = text[i];
    width += mapping[character]?.layoutWidth || 0;
  }

  return width;
}

function breakAll(
  text: string[],
  startIndex: number,
  endIndex: number,
  maxWidth: number,
  iconMapping: CharacterMapping,
  target: number[]
): number {
  let rowStartCharIndex = startIndex;
  let rowOffsetLeft = 0;

  for (let i = startIndex; i < endIndex; i++) {
    // 2. figure out where to break lines
    const textWidth = getTextWidth(text, i, i + 1, iconMapping);
    if (rowOffsetLeft + textWidth > maxWidth) {
      if (rowStartCharIndex < i) {
        target.push(i);
      }
      rowStartCharIndex = i;
      rowOffsetLeft = 0;
    }
    rowOffsetLeft += textWidth;
  }

  return rowOffsetLeft;
}

function breakWord(
  text: string[],
  startIndex: number,
  endIndex: number,
  maxWidth: number,
  iconMapping: CharacterMapping,
  target: number[]
): number {
  let rowStartCharIndex = startIndex;
  let groupStartCharIndex = startIndex;
  let groupEndCharIndex = startIndex;
  let rowOffsetLeft = 0;

  for (let i = startIndex; i < endIndex; i++) {
    // 1. break text into word groups
    //  - if current char is white space
    //  - else if next char is white space
    //  - else if reach last char
    if (text[i] === ' ') {
      groupEndCharIndex = i + 1;
    } else if (text[i + 1] === ' ' || i + 1 === endIndex) {
      groupEndCharIndex = i + 1;
    }

    if (groupEndCharIndex > groupStartCharIndex) {
      // 2. break text into next row at maxWidth
      let groupWidth = getTextWidth(text, groupStartCharIndex, groupEndCharIndex, iconMapping);
      if (rowOffsetLeft + groupWidth > maxWidth) {
        if (rowStartCharIndex < groupStartCharIndex) {
          target.push(groupStartCharIndex);
          rowStartCharIndex = groupStartCharIndex;
          rowOffsetLeft = 0;
        }

        // if a single text group is bigger than maxWidth, then `break-all`
        if (groupWidth > maxWidth) {
          groupWidth = breakAll(
            text,
            groupStartCharIndex,
            groupEndCharIndex,
            maxWidth,
            iconMapping,
            target
          );
          // move reference to last row
          rowStartCharIndex = target[target.length - 1];
        }
      }
      groupStartCharIndex = groupEndCharIndex;
      rowOffsetLeft += groupWidth;
    }
  }

  return rowOffsetLeft;
}

/**
 * Wrap the given text so that each line does not exceed the given max width.
 * Returns a list of indices where line breaks should be inserted.
 */
export function autoWrapping(
  text: string[],
  wordBreak: 'break-all' | 'break-word',
  maxWidth: number,
  iconMapping: CharacterMapping,
  startIndex: number = 0,
  endIndex: number
): number[] {
  if (endIndex === undefined) {
    endIndex = text.length;
  }
  const result = [];
  if (wordBreak === 'break-all') {
    breakAll(text, startIndex, endIndex, maxWidth, iconMapping, result);
  } else {
    breakWord(text, startIndex, endIndex, maxWidth, iconMapping, result);
  }
  return result;
}

function transformRow(
  line: string[],
  startIndex: number,
  endIndex: number,
  iconMapping: CharacterMapping,
  leftOffsets: number[],
  rowSize: [number, number]
) {
  let x = 0;
  let rowHeight = 0;

  for (let i = startIndex; i < endIndex; i++) {
    const character = line[i];
    const frame = iconMapping[character];
    if (frame) {
      if (!rowHeight) {
        // frame.height should be a constant
        rowHeight = frame.layoutHeight;
      }
      leftOffsets[i] = x + frame.layoutWidth / 2;
      x += frame.layoutWidth;
    } else {
      log.warn(`Missing character: ${character} (${character.codePointAt(0)})`)();
      leftOffsets[i] = x;
      x += MISSING_CHAR_WIDTH;
    }
  }

  rowSize[0] = x;
  rowSize[1] = rowHeight;
}

/**
 * Transform a text paragraph to an array of characters, each character contains
 */
export function transformParagraph(
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
} {
  // Break into an array of characters
  // When dealing with double-length unicode characters, `str.length` or `str[i]` do not work
  const characters = Array.from(paragraph);
  const numCharacters = characters.length;
  const x = new Array(numCharacters) as number[];
  const y = new Array(numCharacters) as number[];
  const rowWidth = new Array(numCharacters) as number[];
  const autoWrappingEnabled =
    (wordBreak === 'break-word' || wordBreak === 'break-all') && isFinite(maxWidth) && maxWidth > 0;

  // maxWidth and height of the paragraph
  const size: [number, number] = [0, 0];
  const rowSize: [number, number] = [0, 0];
  let rowOffsetTop = 0;
  let lineStartIndex = 0;
  let lineEndIndex = 0;

  for (let i = 0; i <= numCharacters; i++) {
    const char = characters[i];
    if (char === '\n' || i === numCharacters) {
      lineEndIndex = i;
    }

    if (lineEndIndex > lineStartIndex) {
      const rows = autoWrappingEnabled
        ? autoWrapping(characters, wordBreak, maxWidth, iconMapping, lineStartIndex, lineEndIndex)
        : SINGLE_LINE;

      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const rowStart = rowIndex === 0 ? lineStartIndex : rows[rowIndex - 1];
        const rowEnd = rowIndex < rows.length ? rows[rowIndex] : lineEndIndex;

        transformRow(characters, rowStart, rowEnd, iconMapping, x, rowSize);
        for (let j = rowStart; j < rowEnd; j++) {
          const char = characters[j];
          const layoutOffsetY = iconMapping[char]?.layoutOffsetY || 0;
          y[j] = rowOffsetTop + rowSize[1] / 2 + layoutOffsetY;
          rowWidth[j] = rowSize[0];
        }

        rowOffsetTop = rowOffsetTop + rowSize[1] * lineHeight;
        size[0] = Math.max(size[0], rowSize[0]);
      }
      lineStartIndex = lineEndIndex;
    }

    if (char === '\n') {
      // Make sure result.length matches paragraph.length
      x[lineStartIndex] = 0;
      y[lineStartIndex] = 0;
      rowWidth[lineStartIndex] = 0;
      lineStartIndex++;
    }
  }

  // last row
  size[1] = rowOffsetTop;
  return {x, y, rowWidth, size};
}

export function getTextFromBuffer({
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
} {
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : 1;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const characterCount =
    startIndices[length] || Math.ceil((value.length - elementOffset) / elementStride);
  const autoCharacterSet = characterSet && new Set<number>();

  const texts = new Array(length);

  let codes = value;
  if (elementStride > 1 || elementOffset > 0) {
    const ArrayType = value.constructor as
      | Uint8ArrayConstructor
      | Uint8ClampedArrayConstructor
      | Uint16ArrayConstructor
      | Uint32ArrayConstructor;
    codes = new ArrayType(characterCount);
    for (let i = 0; i < characterCount; i++) {
      codes[i] = value[i * elementStride + elementOffset];
    }
  }

  for (let index = 0; index < length; index++) {
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || characterCount;
    const codesAtIndex = codes.subarray(startIndex, endIndex);
    // @ts-ignore TS wants the argument to be number[] but typed array works too
    texts[index] = String.fromCodePoint.apply(null, codesAtIndex);
    if (autoCharacterSet) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      codesAtIndex.forEach(autoCharacterSet.add, autoCharacterSet);
    }
  }

  if (autoCharacterSet) {
    for (const charCode of autoCharacterSet) {
      characterSet.add(String.fromCodePoint(charCode));
    }
  }

  return {texts, characterCount};
}
