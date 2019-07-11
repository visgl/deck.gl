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
  Array.from(characterSet).forEach((char, i) => {
    if (!mapping[char]) {
      // measure texts
      // TODO - use Advanced text metrics when they are adopted:
      // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
      const width = getFontWidth(char, i);

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
  });

  const rowHeight = fontHeight + buffer * 2;

  return {
    mapping,
    xOffset: x,
    yOffset: yOffset + row * rowHeight,
    canvasHeight: nextPowOfTwo(yOffset + (row + 1) * rowHeight)
  };
}

export function transformRow(row, iconMapping, lineHeight) {
  let offsetLeft = 0;
  let rowHeight = 0;

  let characters = Array.from(row);
  characters = characters.map((character, i) => {
    const datum = {
      text: character,
      offsetLeft
    };

    const frame = iconMapping[character];

    if (frame) {
      offsetLeft += frame.width;
      if (!rowHeight) {
        // frame.height should be a constant
        rowHeight = frame.height * lineHeight;
      }
    } else {
      log.warn(`Missing character: ${character}`)();
      offsetLeft += MISSING_CHAR_WIDTH;
    }

    return datum;
  });

  return {characters, rowWidth: offsetLeft, rowHeight};
}

/**
 * Transform a text paragraph to an array of characters, each character contains
 * @param paragraph {String}
 * @param lineHeight {Number} css line-height
 * @param iconMapping {Object} character mapping table for retrieving a character from font atlas
 * @param transformCharacter {Function} callback to transform a single character
 * @param transformedData {Array} output transformed data array, each datum contains
 *   - text: character
 *   - index: character index in the paragraph
 *   - offsetLeft: x offset in the row,
 *   - offsetTop: y offset in the paragraph
 *   - size: [width, height] size of the paragraph
 *   - rowSize: [rowWidth, rowHeight] size of the row
 *   - len: length of the paragraph
 */
export function transformParagraph(
  paragraph,
  lineHeight,
  iconMapping,
  transformCharacter,
  transformedData
) {
  const rows = paragraph.split('\n');

  // width and height of the paragraph
  const size = [0, 0];
  let offsetTop = 0;

  rows.forEach(row => {
    const {characters, rowWidth, rowHeight} = transformRow(row, iconMapping, lineHeight);
    const rowSize = [rowWidth, rowHeight];

    characters.forEach(datum => {
      datum.offsetTop = offsetTop;
      datum.size = size;
      datum.rowSize = rowSize;

      transformedData.push(transformCharacter(datum));
    });

    offsetTop = offsetTop + rowHeight;
    size[0] = Math.max(size[0], rowWidth);
  });

  // last row
  size[1] = offsetTop;
}
