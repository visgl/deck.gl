/* global document */
import {assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Texture2D} from 'luma.gl';

import {scaleLinear} from 'd3-scale';
import {readFileSync} from 'fs';
import {join} from 'path';

const FONT_SIZE = 24;
/* Utils */

function flatten(arrayOfArrays) {
  return arrayOfArrays.reduce((acc, arr) => acc.concat(arr), []);
}

function getTicks([min, max], ticksCount) {
  return scaleLinear().domain([min, max]).ticks(ticksCount);
}

function setTextStyle(ctx) {
  ctx.font = `${FONT_SIZE}px Helvetica,Arial,sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
}

export default class Axes {

  constructor(props) {
    this.models = this._getModels(props);
    this.props = props;
    this.labels = null;
  }

  render(uniforms) {
    if (this.labels) {
      this.models.grids.render(uniforms);

      this.models.labels.render({
        ...uniforms,
        ...this.labels
      });
    }
  }

  updateProps(props) {
    const {bounds, ticksCount} = props;

    if (bounds || this.props.ticksCount !== ticksCount) {
      this.props = {...this.props, ...props};
      this.calculateTicks(bounds, ticksCount);
    }
  }

  _getModels({gl, id}) {
    // grids
    const gridShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './grid-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './fragment.glsl'), 'utf8')
    });

    // draw rectangle around slice
    const gridPositions = [
      -1, -1, 0, -1, 1, 0,
      -1, 1, 0, 1, 1, 0,
      1, 1, 0, 1, -1, 0,
      1, -1, 0, -1, -1, 0
    ];
    const gridNormals = [
      -1, 0, 0, -1, 0, 0,
      0, 1, 0, 0, 1, 0,
      1, 0, 0, 1, 0, 0,
      0, -1, 0, 0, -1, 0
    ];

    const grids = new Model({
      gl,
      id: `${id}-grids`,
      vs: gridShaders.vs,
      fs: gridShaders.fs,
      geometry: new Geometry({
        drawMode: GL.LINES,
        positions: new Float32Array(gridPositions),
        normals: new Float32Array(gridNormals)
      }),
      isInstanced: true
    });

    // labels
    const labelShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './label-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './label-fragment.glsl'), 'utf8')
    });

    let labelTexCoords = [];
    let labelPositions = [];
    let labelNormals = [];
    let labelIndices = [];
    for (let i = 0; i < 8; i++) {
      labelTexCoords = labelTexCoords.concat([0, 0, 0, 1, 1, 0, 1, 1]);
      labelIndices = labelIndices.concat([
        i * 4 + 0, i * 4 + 1, i * 4 + 2,
        i * 4 + 2, i * 4 + 1, i * 4 + 3
      ]);

      for (let j = 0; j < 4; j++) {
        labelPositions = labelPositions.concat(gridPositions.slice(i * 3, i * 3 + 3));
        labelNormals = labelNormals.concat(gridNormals.slice(i * 3, i * 3 + 3));
      }
    }

    const labels = new Model({
      gl,
      id: `${id}-labels`,
      vs: labelShaders.vs,
      fs: labelShaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        indices: new Uint16Array(labelIndices),
        positions: new Float32Array(labelPositions),
        texCoords: {size: 2, value: new Float32Array(labelTexCoords)},
        normals: new Float32Array(labelNormals)
      }),
      isInstanced: true
    });

    return {grids, labels};
  }

  // updates the instancePositions and instanceNormals attributes
  calculateTicks(bounds, ticksCount) {
    if (!bounds) {
      return;
    }

    const xTicks = getTicks(bounds[0], ticksCount);
    const yTicks = getTicks(bounds[1], ticksCount);
    const zTicks = getTicks(bounds[2], ticksCount);

    const positions = [].concat(
      xTicks.map((t, i) => [t, i]),
      yTicks.map((t, i) => [t, i]),
      zTicks.map((t, i) => [t, i])
    );
    const normals = [].concat(
      xTicks.map(t => [1, 0, 0]),
      yTicks.map(t => [0, 1, 0]),
      zTicks.map(t => [0, 0, 1])
    );

    this.renderLabelTexture([xTicks, yTicks, zTicks]);

    Object.values(this.models).forEach(model => {
      model.setAttributes({
        instancePositions: {size: 2, value: new Float32Array(flatten(positions)), instanced: true},
        instanceNormals: {size: 3, value: new Float32Array(flatten(normals)), instanced: true}
      });
      model.setInstanceCount(normals.length);
    });
  }

  renderLabelTexture(labels) {

    if (this.labels) {
      this.labels.labelTexture.delete();
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    setTextStyle(ctx);

    // measure texts
    const maxWidth = labels.map(axisLabels => {
      return axisLabels.reduce((acc, label) => {
        const w = ctx.measureText(label).width;
        return Math.max(acc, w);
      }, 0);
    });

    const canvasWidth = maxWidth.reduce((x, w) => x + Math.ceil(w) * 2, 0);
    const canvasHeight = labels.reduce((h, axisLabels) =>
      Math.max(h, axisLabels.length * FONT_SIZE), 0);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // changing canvas size will reset context
    setTextStyle(ctx);

    let x = 0;
    labels.forEach((axisLabels, axis) => {
      x += maxWidth[axis] / 2;
      axisLabels.forEach((label, i) => {
        ctx.fillText(label, x, i * FONT_SIZE);
      });
      x += maxWidth[axis] / 2;
    });

    this.labels = {
      labelHeight: FONT_SIZE,
      labelWidths: maxWidth,
      labelTextureDim: [canvasWidth, canvasHeight],
      labelTexture: new Texture2D(this.props.gl, {pixels: canvas})
    };
  }

}
