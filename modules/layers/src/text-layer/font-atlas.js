/* global document */
import {Texture2D} from 'luma.gl';
import TinySDF from '@mapbox/tiny-sdf';

const GL_TEXTURE_WRAP_S = 0x2802;
const GL_TEXTURE_WRAP_T = 0x2803;
const GL_CLAMP_TO_EDGE = 0x812f;
const MAX_CANVAS_WIDTH = 1024;

const BASELINE_SCALE = 0.9;
const HEIGHT_SCALE = 1.2;

export const DEFAULT_PADDING = 2;
export const DEFAULT_FONT_SIZE = 64;

export const DEFAULT_CHAR_SET = [];
for (let i = 32; i < 128; i++) {
  DEFAULT_CHAR_SET.push(String.fromCharCode(i));
}

function populateAlphaChannel(alphaChannel, imageData) {
  // populate distance value from tinySDF to image alpha channel
  for (let i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}

function setTextStyle(ctx, fontFamily, fontSize) {
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'baseline';
  ctx.textAlign = 'left';
}

function buildMapping({ctx, fontHeight, buffer, characterSet, maxCanvasWidth}) {
  const mapping = {};
  let row = 0;
  let x = 0;
  Array.from(characterSet).forEach(char => {
    // measure texts
    const {width} = ctx.measureText(char);

    if (x + width > maxCanvasWidth) {
      x = 0;
      row++;
    }
    mapping[char] = {
      x: x + buffer,
      y: row * (fontHeight + buffer * 2) + buffer,
      width,
      height: fontHeight,
      mask: true
    };
    x += width + buffer * 2;
  });

  const canvasHeight = (row + 1) * (fontHeight + buffer * 2);

  return {mapping, canvasHeight};
}

export function makeFontAtlas(
  gl,
  {
    sdf,
    fontFamily,
    fontSize = DEFAULT_FONT_SIZE,
    characterSet = DEFAULT_CHAR_SET,
    padding = DEFAULT_PADDING
  }
) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // build mapping
  // TODO - use Advanced text metrics when they are adopted:
  // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
  const fontSettings = {
    fontSize: sdf ? sdf.fontSize : fontSize,
    fontFamily: sdf ? sdf.fontFamily : fontFamily,
    fontHeight: (sdf ? sdf.fontSize : fontSize) * HEIGHT_SCALE,
    buffer: sdf ? sdf.buffer : padding
  };

  setTextStyle(ctx, fontSettings.fontFamily, fontSettings.fontSize);
  const {canvasHeight, mapping} = buildMapping({
    ctx,
    fontHeight: fontSettings.fontHeight,
    buffer: fontSettings.buffer,
    characterSet,
    maxCanvasWidth: MAX_CANVAS_WIDTH
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = canvasHeight;
  setTextStyle(ctx, fontSettings.fontFamily, fontSettings.fontSize);

  // layout characters
  if (sdf) {
    const tinySDF = new TinySDF(
      fontSettings.fontSize,
      fontSettings.buffer,
      sdf.radius,
      sdf.cutoff,
      fontSettings.fontFamily,
      sdf.fontWeight
    );
    setTextStyle(tinySDF.ctx, fontFamily, fontSize);
    // used to store distance values from tinySDF
    const imageData = ctx.createImageData(tinySDF.size, tinySDF.size);

    for (const char of characterSet) {
      populateAlphaChannel(tinySDF.draw(char), imageData);
      ctx.putImageData(
        imageData,
        mapping[char].x - fontSettings.buffer,
        mapping[char].y - fontSettings.buffer
      );
    }
  } else {
    for (const char of characterSet) {
      ctx.fillText(char, mapping[char].x, mapping[char].y + fontSettings.fontSize * BASELINE_SCALE);
    }
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
