/* global document */
import {Texture2D} from 'luma.gl';

const GL_TEXTURE_WRAP_S = 0x2802;
const GL_TEXTURE_WRAP_T = 0x2803;
const GL_CLAMP_TO_EDGE = 0x812f;
const MAX_CANVAS_WIDTH = 1024;
const fontSize = 64;
const padding = 4;

const charList = [];
for (let i = 32; i < 128; i++) {
  charList.push(String.fromCharCode(i));
}

function setTextStyle(ctx, fontFamily) {
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'hanging';
  ctx.textAlign = 'left';
}

export function makeFontAtlas(gl, fontFamily) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  setTextStyle(ctx, fontFamily);

  // measure texts
  let row = 0;
  let x = 0;
  const mapping = {};

  charList.forEach(char => {
    const {width} = ctx.measureText(char);
    if (x + width > MAX_CANVAS_WIDTH) {
      x = 0;
      row++;
    }
    mapping[char] = {
      x,
      y: row * (fontSize + padding),
      width,
      height: fontSize,
      mask: true
    };
    x += width + padding;
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = (row + 1) * (fontSize + padding);

  setTextStyle(ctx, fontFamily);
  for (const char in mapping) {
    ctx.fillText(char, mapping[char].x, mapping[char].y);
  }

  return {
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
