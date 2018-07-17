/* global document */
import {Texture2D} from 'luma.gl';

const GL_TEXTURE_WRAP_S = 0x2802;
const GL_TEXTURE_WRAP_T = 0x2803;
const GL_CLAMP_TO_EDGE = 0x812f;
const MAX_CANVAS_WIDTH = 1024;
const DEFAULT_FONT_SIZE = 64;
const DEFAULT_PADDING = 4;

const BASELINE_SCALE = 0.9;
const HEIGHT_SCALE = 1.2;

export const DEFAULT_CHAR_SET = [];
for (let i = 32; i < 128; i++) {
  DEFAULT_CHAR_SET.push(String.fromCharCode(i));
}

function setTextStyle(ctx, fontFamily, fontSize) {
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'baseline';
  ctx.textAlign = 'left';
}

export function makeFontAtlas(
  gl,
  {
    fontFamily,
    characterSet = DEFAULT_CHAR_SET,
    fontSize = DEFAULT_FONT_SIZE,
    padding = DEFAULT_PADDING
  }
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // measure texts
  let row = 0;
  let x = 0;
  // TODO - use Advanced text metrics when they are adopted:
  // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
  const fontHeight = fontSize * HEIGHT_SCALE;
  setTextStyle(ctx, fontFamily, fontSize);
  const mapping = {};

  Array.from(characterSet).forEach(char => {
    const {width} = ctx.measureText(char);

    if (x + width > MAX_CANVAS_WIDTH) {
      x = 0;
      row++;
    }
    mapping[char] = {
      x,
      y: row * (fontHeight + padding),
      width,
      height: fontHeight,
      mask: true
    };
    x += width + padding;
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = (row + 1) * (fontHeight + padding);

  setTextStyle(ctx, fontFamily, fontSize);
  for (const char in mapping) {
    ctx.fillText(char, mapping[char].x, mapping[char].y + fontSize * BASELINE_SCALE);
  }

  return {
    scale: HEIGHT_SCALE,
    mapping,
    texture: new Texture2D(gl, {
      pixels: canvas,
      // padding is added only between the characters but not for borders
      // enforce CLAMP_TO_EDGE to avoid any artifacts.
      parameters: {
        [GL_TEXTURE_WRAP_S]: GL_CLAMP_TO_EDGE,
        [GL_TEXTURE_WRAP_T]: GL_CLAMP_TO_EDGE
      }
    })
  };
}
