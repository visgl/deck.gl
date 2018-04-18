/* global document */
import {GL, Texture2D} from 'luma.gl';

const MAX_CANVAS_WIDTH = 1024;

// helper for textMatrixToTexture
function setTextStyle(ctx, fontSize) {
  ctx.font = `${fontSize}px Helvetica,Arial,sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
}

/*
 * renders a matrix of text labels to texture2D.
 * @param {WebGLRenderingContext} glContext
 * @param {[[String]]} data: text to render, in array of columns (array of strings)
 * @param {Number} fontSize: size to render with
 * @returns {object} {texture, columnWidths}
 */
export function makeTextureAtlasFromLabels(gl, {data, getLabel = x => x, fontSize = 48}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  setTextStyle(ctx, fontSize);

  // measure texts
  let row = 0;
  let x = 0;
  const mapping = data.map((object, index) => {
    const string = getLabel(object);
    const {width} = ctx.measureText(string);
    if (x + width > MAX_CANVAS_WIDTH) {
      x = 0;
      row++;
    }
    const iconMap = {
      object,
      index,
      string,
      x,
      y: row * fontSize,
      width: Math.min(width, MAX_CANVAS_WIDTH),
      height: fontSize,
      mask: true
    };
    x += width;
    return iconMap;
  });

  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = (row + 1) * fontSize;

  // changing canvas size will reset context
  setTextStyle(ctx, fontSize);

  /*
   *  +---------------------+----------+
   *  | elt1 | elt2-------- | elt3     |
   *  +----------+----------+----------+
   *  | elt4---------------   | elt5   |
   *  +----------+----------+----------+
   *  | ...      | ...      | ...      |
   */
  for (const label of mapping) {
    ctx.fillText(label.string, label.x, label.y);
  }

  return {
    mapping,
    texture: new Texture2D(gl, {
      pixels: canvas,
      magFilter: GL.LINEAR
    })
  };
}
