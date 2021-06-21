/* eslint-disable max-statements, max-params, complexity, max-depth */
// TODO merge with icon-layer/icon-manager
import {log} from '@deck.gl/core';

const MISSING_CHAR_WIDTH = 32;
const SINGLE_LINE = [];

export function nextPowOfTwo(number) {
  return Math.pow(2, Math.ceil(Math.log2(number)));
}

/**
 * Generate character mapping table or update from an existing mapping table
 * @param characterSet {Array|Set} new characters
 * @param getFontWidth {Function} function to get width of each character
 * @param fontHeight {Number} height of font
 * @param buffer {Number} buffer surround each character
 * @param maxCanvasWidth {Number} max width of font atlas
 * @param mapping {Object} old mapping table
 * @param xOffset {Number} x position of last character in old mapping table
 * @param yOffset {Number} y position of last character in old mapping table
 * @returns {{
 *   mapping: Object,
 *   xOffset: Number, x position of last character
 *   yOffset: Number, y position of last character in old mapping table
 *   canvasHeight: Number, height of the font atlas canvas, power of 2
 *  }}
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
}) {
  let row = 0;
  // continue from x position of last character in the old mapping
  let x = xOffset;

  let i = 0;
  for (const char of characterSet) {
    if (!mapping[char]) {
      // measure texts
      // TODO - use Advanced text metrics when they are adopted:
      // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
      const width = getFontWidth(char, i++);

      if (x + width + buffer * 2 > maxCanvasWidth) {
        x = 0;
        row++;
      }
      mapping[char] = {
        x: x + buffer,
        y: yOffset + row * (fontHeight + buffer * 2) + buffer,
        width,
        height: fontHeight
      };
      x += width + buffer * 2;
    }
  }

  const rowHeight = fontHeight + buffer * 2;

  return {
    mapping,
    xOffset: x,
    yOffset: yOffset + row * rowHeight,
    canvasHeight: nextPowOfTwo(yOffset + (row + 1) * rowHeight)
  };
}

function getTextWidth(text, startIndex, endIndex, mapping) {
  let width = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const character = text[i];
    let frameWidth = null;
    const frame = mapping && mapping[character];
    if (frame) {
      frameWidth = frame.width;
    }

    width += frameWidth;
  }

  return width;
}

function breakAll(text, startIndex, endIndex, maxWidth, iconMapping, target) {
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

function breakWord(text, startIndex, endIndex, maxWidth, iconMapping, target) {
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

// Returns a list of indices where line breaks should be inserted
export function autoWrapping(text, wordBreak, maxWidth, iconMapping, startIndex = 0, endIndex) {
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

function transformRow(line, startIndex, endIndex, iconMapping, leftOffsets, rowSize) {
  let x = 0;
  let rowHeight = 0;

  for (let i = startIndex; i < endIndex; i++) {
    const character = line[i];
    const frame = iconMapping[character];
    if (frame) {
      if (!rowHeight) {
        // frame.height should be a constant
        rowHeight = frame.height;
      }
      leftOffsets[i] = x + frame.width / 2;
      x += frame.width;
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
 * @param paragraph: {String}
 * @param iconMapping {Object} character mapping table for retrieving a character from font atlas
 * @param lineHeight {Number} css line-height
 * @param wordBreak {String} css word-break option
 * @param maxWidth {number} css max-width
 * @param transformedData {Array} output transformed data array, each datum contains
 *   - text: character
 *   - index: character index in the paragraph
 *   - x: x offset in the row,
 *   - y: y offset in the paragraph
 *   - size: [width, height] size of the paragraph
 *   - rowSize: [rowWidth, rowHeight] size of the row
 *   - len: length of the paragraph
 */
export function transformParagraph(paragraph, lineHeight, wordBreak, maxWidth, iconMapping) {
  // Break into an array of characters
  // When dealing with double-length unicode characters, `str.length` or `str[i]` do not work
  paragraph = Array.from(paragraph);
  const numCharacters = paragraph.length;
  const x = new Array(numCharacters);
  const y = new Array(numCharacters);
  const rowWidth = new Array(numCharacters);
  const autoWrappingEnabled =
    (wordBreak === 'break-word' || wordBreak === 'break-all') && isFinite(maxWidth) && maxWidth > 0;

  // maxWidth and height of the paragraph
  const size = [0, 0];
  const rowSize = [];
  let rowOffsetTop = 0;
  let lineStartIndex = 0;
  let lineEndIndex = 0;

  for (let i = 0; i <= numCharacters; i++) {
    const char = paragraph[i];
    if (char === '\n' || i === numCharacters) {
      lineEndIndex = i;
    }

    if (lineEndIndex > lineStartIndex) {
      const rows = autoWrappingEnabled
        ? autoWrapping(paragraph, wordBreak, maxWidth, iconMapping, lineStartIndex, lineEndIndex)
        : SINGLE_LINE;

      for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
        const rowStart = rowIndex === 0 ? lineStartIndex : rows[rowIndex - 1];
        const rowEnd = rowIndex < rows.length ? rows[rowIndex] : lineEndIndex;
        transformRow(paragraph, rowStart, rowEnd, iconMapping, x, rowSize);
        for (let j = rowStart; j < rowEnd; j++) {
          y[j] = rowOffsetTop + rowSize[1] / 2;
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

export function getTextFromBuffer({value, length, stride, offset, startIndices, characterSet}) {
  const bytesPerElement = value.BYTES_PER_ELEMENT;
  const elementStride = stride ? stride / bytesPerElement : 1;
  const elementOffset = offset ? offset / bytesPerElement : 0;
  const characterCount =
    startIndices[length] || Math.ceil((value.length - elementOffset) / elementStride);
  const autoCharacterSet = characterSet && new Set();

  const texts = new Array(length);

  let codes = value;
  if (elementStride > 1 || elementOffset > 0) {
    codes = new value.constructor(characterCount);
    for (let i = 0; i < characterCount; i++) {
      codes[i] = value[i * elementStride + elementOffset];
    }
  }

  for (let index = 0; index < length; index++) {
    const startIndex = startIndices[index];
    const endIndex = startIndices[index + 1] || characterCount;
    const codesAtIndex = codes.subarray(startIndex, endIndex);
    texts[index] = String.fromCodePoint.apply(null, codesAtIndex);
    if (autoCharacterSet) {
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
