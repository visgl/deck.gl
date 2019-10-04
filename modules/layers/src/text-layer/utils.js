// TODO merge with icon-layer/icon-manager
import {log} from '@deck.gl/core';

const MISSING_CHAR_WIDTH = 32;

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
        height: fontHeight,
        mask: true
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

function getTextWidth(text, mapping) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const character = text[i];
    let frameWidth = null;
    const frame = mapping && mapping[character];
    if (frame) {
      frameWidth = frame.width;
    } else {
      log.warn(`Missing character: ${character}`)();
      frameWidth = MISSING_CHAR_WIDTH;
    }

    width += frameWidth;
  }

  return width;
}

function breakAll(text, maxWidth, iconMapping) {
  const rows = [];
  let rowStartCharIndex = 0;
  let rowOffsetLeft = 0;

  for (let i = 0; i < text.length; i++) {
    // 2. figure out where to break lines
    const textWidth = getTextWidth(text[i], iconMapping);
    if (rowOffsetLeft + textWidth > maxWidth) {
      if (rowStartCharIndex < i) {
        rows.push(text.substring(rowStartCharIndex, i));
      }
      rowStartCharIndex = i;
      rowOffsetLeft = 0;
    }
    rowOffsetLeft += textWidth;
  }

  // last row
  if (rowStartCharIndex < text.length) {
    rows.push(text.substring(rowStartCharIndex));
  }

  return {
    rows,
    lastRowStartCharIndex: rowStartCharIndex,
    lastRowOffsetLeft: rowOffsetLeft
  };
}

/* eslint-disable max-statements, complexity, max-depth */
function breakWord(text, maxWidth, iconMapping) {
  let rows = [];
  let rowStartCharIndex = 0;
  let groupStartCharIndex = 0;
  let rowOffsetLeft = 0;
  let group = null;

  for (let i = 0; i < text.length; i++) {
    // 1. break text into word groups
    //  - if current char is white space
    //  - else if next char is white space
    //  - else if reach last char
    if (text[i] === ' ') {
      group = text[i];
      groupStartCharIndex = i + 1;
    } else if ((i + 1 < text.length && text[i + 1] === ' ') || i + 1 === text.length) {
      group = text.substring(groupStartCharIndex, i + 1);
      groupStartCharIndex = i + 1;
    } else {
      group = null;
    }

    if (group) {
      // 2. break text into next row at maxWidth
      let groupWidth = getTextWidth(group, iconMapping);
      if (rowOffsetLeft + groupWidth > maxWidth) {
        const lastGroupStartIndex = groupStartCharIndex - group.length;
        if (rowStartCharIndex < lastGroupStartIndex) {
          rows.push(text.substring(rowStartCharIndex, lastGroupStartIndex));
          rowStartCharIndex = lastGroupStartIndex;
          rowOffsetLeft = 0;
        }

        // if a single text group is bigger than maxWidth, then `break-all`
        if (groupWidth > maxWidth) {
          const subGroups = breakAll(group, maxWidth, iconMapping);
          if (subGroups.rows.length > 1) {
            // add all the sub rows to results except last row
            rows = rows.concat(subGroups.rows.slice(0, subGroups.rows.length - 1));
          }
          // move reference to last row
          rowStartCharIndex = rowStartCharIndex + subGroups.lastRowStartCharIndex;
          groupWidth = subGroups.lastRowOffsetLeft;
        }
      }
      rowOffsetLeft += groupWidth;
    }
  }

  // last row
  if (rowStartCharIndex < text.length) {
    rows.push(text.substring(rowStartCharIndex));
  }

  return {
    rows,
    lastRowStartCharIndex: rowStartCharIndex,
    lastRowOffsetLeft: rowOffsetLeft
  };
}
/* eslint-enable max-statements, complexity, max-depth */

export function autoWrapping(text, wordBreak, maxWidth, iconMapping) {
  if (wordBreak === 'break-all') {
    return breakAll(text, maxWidth, iconMapping);
  }
  return breakWord(text, maxWidth, iconMapping);
}

export function transformRow(row, iconMapping, lineHeight, rowOffsetTop) {
  let offsetLeft = 0;
  let rowHeight = 0;

  const characters = [];
  for (const character of row) {
    const datum = {
      text: character,
      offsetTop: rowOffsetTop,
      offsetLeft
    };

    const frame = iconMapping[character];
    if (frame) {
      if (!rowHeight) {
        // frame.height should be a constant
        rowHeight = frame.height * lineHeight;
      }
      offsetLeft += frame.width;
    } else {
      log.warn(`Missing character: ${character}`)();
      offsetLeft += MISSING_CHAR_WIDTH;
    }

    characters.push(datum);
  }

  return {
    characters,
    rowWidth: offsetLeft,
    rowHeight
  };
}

/**
 * Transform a text paragraph to an array of characters, each character contains
 * @param paragraph: {String}
 * @param iconMapping {Object} character mapping table for retrieving a character from font atlas
 * @param transformCharacter {Function} callback to transform a single character
 * @param lineHeight {Number} css line-height
 * @param wordBreak {String} css word-break option
 * @param maxWidth {number} css max-width
 * @param transformedData {Array} output transformed data array, each datum contains
 *   - text: character
 *   - index: character index in the paragraph
 *   - offsetLeft: x offset in the row,
 *   - offsetTop: y offset in the paragraph
 *   - size: [width, height] size of the paragraph
 *   - rowSize: [rowWidth, rowHeight] size of the row
 *   - len: length of the paragraph
 */
// eslint-disable-next-line max-params
export function transformParagraph(
  paragraph,
  lineHeight,
  wordBreak,
  maxWidth,
  iconMapping,
  transformCharacter,
  transformedData = []
) {
  if (!paragraph) {
    return;
  }

  const autoWrappingEnabled =
    (wordBreak === 'break-word' || wordBreak === 'break-all') && isFinite(maxWidth) && maxWidth > 0;

  // maxWidth and height of the paragraph
  const size = [0, 0];
  let rowOffsetTop = 0;

  const lines = paragraph.split('\n');

  for (const line of lines) {
    let rows = [line];
    if (autoWrappingEnabled) {
      rows = autoWrapping(line, wordBreak, maxWidth, iconMapping).rows;
    }

    for (const row of rows) {
      const {rowWidth, rowHeight, characters} = transformRow(
        row,
        iconMapping,
        lineHeight,
        rowOffsetTop
      );

      const rowSize = [rowWidth, rowHeight];

      for (const datum of characters) {
        datum.size = size;
        datum.rowSize = rowSize;
        transformedData.push(transformCharacter(datum));
      }

      rowOffsetTop = rowOffsetTop + rowHeight;
      size[0] = autoWrappingEnabled ? maxWidth : Math.max(size[0], rowWidth);
    }
  }

  // last row
  size[1] = rowOffsetTop;
}
