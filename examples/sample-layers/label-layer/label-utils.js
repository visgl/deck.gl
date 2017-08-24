/* global document */
import {GL, Texture2D} from 'luma.gl';
import {TextAtlasPainter} from './text-painter';

const MAX_CANVAS_WIDTH = 1024;

/**
 * Renders a matrix of text labels to texture2D.
 *
 * @param {WebGLRenderingContext} glContext
 * @param {[[String]]} data: text to render, in array of columns (array of strings)
 * @param {Number} fontSize: size to render with
 * @returns {object} {texture, columnWidths}
 */
export function makeTextureAtlasFromLabels(gl, {data, getLabel = x => x, fontSize = 48}) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const textPainter = new TextAtlasPainter(ctx, MAX_CANVAS_WIDTH, fontSize);

  textPainter.setTextStyle();

  const mapping = data.map((object, index) => {
    const string = getLabel(object);
    const region = textPainter.getTextBounds(string);
    // region =  {x, y, width, height}
    // Anchor the label left aligned above the object, not centered.
    // Anchor the height so bottom of label is above object.
    const iconMap = {
      object,
      index,
      string,
      mask: true,
      ...region,
      anchorX: 0,
      anchorY: region.height
    };
    return iconMap;
  });

  const extents = textPainter.getExtents();
  canvas.width = MAX_CANVAS_WIDTH;
  canvas.height = extents.height;

  // Must set canvas context after resize
  textPainter.setTextStyle();

  for (const label of mapping) {
    textPainter.drawText(label.string, label);
  }

  return {
    mapping,
    texture: new Texture2D(gl, {
      pixels: canvas,
      magFilter: GL.LINEAR
    })
  };
}
