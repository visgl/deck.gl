/* global document */
import {Texture2D} from 'luma.gl';
import TinySDF from '@mapbox/tiny-sdf';

const GL_TEXTURE_WRAP_S = 0x2802;
const GL_TEXTURE_WRAP_T = 0x2803;
const GL_CLAMP_TO_EDGE = 0x812f;
const MAX_CANVAS_WIDTH = 1024;

const BASELINE_SCALE = 0.9;
const HEIGHT_SCALE = 1.2;

function getDefaultCharacterSet() {
  const charSet = [];
  for (let i = 32; i < 128; i++) {
    charSet.push(String.fromCharCode(i));
  }
  return charSet;
}

export const DEFAULT_CHAR_SET = getDefaultCharacterSet();
export const DEFAULT_FONT_FAMILY = 'Monaco, monospace';
export const DEFAULT_FONT_WEIGHT = 'normal';

export const DEFAULT_FONT_SETTINGS = {
  fontSize: 64,
  buffer: 2,
  sdf: false,
  cutoff: 0.25,
  radius: 3
};

function populateAlphaChannel(alphaChannel, imageData) {
  // populate distance value from tinySDF to image alpha channel
  for (let i = 0; i < alphaChannel.length; i++) {
    imageData.data[4 * i + 3] = alphaChannel[i];
  }
}

function setTextStyle(ctx, fontFamily, fontSize, fontWeight) {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
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
    // TODO - use Advanced text metrics when they are adopted:
    // https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics
    const {width} = ctx.measureText(char);

    if (x + width + buffer * 2 > maxCanvasWidth) {
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

export function makeFontAtlas(gl, fontSettings) {
  const mergedFontSettings = Object.assign(
    {
      fontFamily: DEFAULT_FONT_FAMILY,
      fontWeight: DEFAULT_FONT_WEIGHT,
      characterSet: DEFAULT_CHAR_SET
    },
    DEFAULT_FONT_SETTINGS,
    fontSettings
  );

  const {
    fontFamily,
    fontWeight,
    characterSet,
    fontSize,
    buffer,
    sdf,
    radius,
    cutoff
  } = mergedFontSettings;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // build mapping
  setTextStyle(ctx, fontFamily, fontSize, fontWeight);
  const fontHeight = fontSize * HEIGHT_SCALE;
  const {canvasHeight, mapping} = buildMapping({
    ctx,
    fontHeight,
    buffer,
    characterSet,
    maxCanvasWidth: MAX_CANVAS_WIDTH
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = canvasHeight;
  setTextStyle(ctx, fontFamily, fontSize, fontWeight);

  // layout characters
  if (sdf) {
    const tinySDF = new TinySDF(fontSize, buffer, radius, cutoff, fontFamily, fontWeight);
    // used to store distance values from tinySDF
    const imageData = ctx.createImageData(tinySDF.size, tinySDF.size);

    for (const char of characterSet) {
      populateAlphaChannel(tinySDF.draw(char), imageData);
      ctx.putImageData(imageData, mapping[char].x - buffer, mapping[char].y - buffer);
    }
  } else {
    for (const char of characterSet) {
      ctx.fillText(char, mapping[char].x, mapping[char].y + fontSize * BASELINE_SCALE);
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
