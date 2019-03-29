/* global document */
import GL from '@luma.gl/constants';
import {Texture2D} from '@luma.gl/core';

// helper for textMatrixToTexture
function setTextStyle(ctx, fontSize) {
  ctx.font = `${fontSize}px Helvetica,Arial,sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
}

/*
 * renders a matrix of text labels to texture2D.
 * @param {WebGLRenderingContext} glContext
 * @param {[[String]]} data: text to render, in array of columns (array of strings)
 * @param {Number} fontSize: size to render with
 * @returns {object} {texture, columnWidths}
 */
export function textMatrixToTexture(glContext, data, fontSize = 48) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  setTextStyle(ctx, fontSize);

  // measure texts
  const columnWidths = data.map(column => {
    return column.reduce((acc, obj) => {
      const w = ctx.measureText(obj.text).width;
      return Math.max(acc, Math.ceil(w));
    }, 0);
  });

  const canvasWidth = columnWidths.reduce((x, w) => x + w, 0);
  const canvasHeight = data.reduce(
    (h, column) => Math.max(h, Math.ceil(column.length * fontSize)),
    0
  );

  if (canvasWidth === 0 || canvasHeight === 0) {
    // empty canvas willl cause error in Texture2D
    return null;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // changing canvas size will reset context
  setTextStyle(ctx, fontSize);

  /*
   *  +----------+----------+----------+
   *  | col0:0   | col1:0   | col2:0   |
   *  +----------+----------+----------+
   *  | col0:1   | col1:1   | col2:1   |
   *  +----------+----------+----------+
   *  | ...      | ...      | ...      |
   */
  let x = 0;
  data.forEach((column, colIndex) => {
    x += columnWidths[colIndex] / 2;
    column.forEach((obj, i) => {
      ctx.fillText(obj.text, x, i * fontSize);
    });
    x += columnWidths[colIndex] / 2;
  });

  return {
    columnWidths,
    texture: new Texture2D(glContext, {
      pixels: canvas,
      [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
    })
  };
}
