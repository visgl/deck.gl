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

export function updateRange({array, startIndex, endIndex, data}) {
  for (let i = startIndex; i < Math.min(endIndex, array.length); i++) {
    const object = array[i];
    Object.assign(object, data);
  }
}

export function transformText(text, iconMapping, transformLetter, transformedData) {
  let startIndex = transformedData.length;

  const letters = Array.from(text);

  let offsetLeft = 0;
  let offsetTop = 0;
  let lineHeight = 0;

  // width and height of the text
  const size = [0, 0];

  letters.forEach((letter, i) => {
    if (letter === '\n') {
      size[0] = Math.max(offsetLeft, size[0]);

      updateRange({
        array: transformedData,
        startIndex,
        endIndex: transformedData.length,
        data: {lineLength: offsetLeft}
      });

      startIndex = transformedData.length;
      offsetLeft = 0;
      offsetTop += lineHeight;
    } else {
      const datum = transformLetter({
        text: letter,
        index: i,
        size,
        offsetLeft,
        offsetTop,
        len: text.length
      });

      const frame = iconMapping[letter];

      if (frame) {
        offsetLeft += frame.width;
        lineHeight = Math.max(lineHeight, frame.height);
      } else {
        log.warn(`Missing character: ${letter}`)();
        offsetLeft += MISSING_CHAR_WIDTH;
      }

      transformedData.push(datum);
    }
  });

  // last line
  size[0] = Math.max(size[0], offsetLeft);
  if (startIndex < transformedData.length) {
    size[1] = offsetTop + lineHeight;

    updateRange({
      array: transformedData,
      startIndex,
      endIndex: transformedData.length,
      data: {lineLength: offsetLeft}
    });
    startIndex = transformedData.length;
  }
}
