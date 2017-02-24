/* global document */
import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry, Texture2D} from 'luma.gl';

import {scaleLinear} from 'd3-scale';
import {readFileSync} from 'fs';
import {join} from 'path';

/* Utils */
function flatten(arrayOfArrays) {
  return arrayOfArrays.reduce((acc, arr) => acc.concat(arr), []);
}

function getTicks([min, max], ticksCount) {
  return scaleLinear().domain([min, max]).ticks(ticksCount);
}

function setTextStyle(ctx, fontSize) {
  ctx.font = `${fontSize}px Helvetica,Arial,sans-serif`;
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
}

/* Constants */
const defaultProps = {
  fontSize: 24,
  ticksCount: 6,
  axesOffset: 0,
  axesColor: [0, 0, 0, 255]
};

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Integer} [props.ticksCount] - number of ticks along each axis, see
      https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks
 * @param {Number} [props.axesOffset] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.axesColor] - color of the gridlines, in [r,g,b,a]
 */
export default class AxesLayer extends Layer {

  initializeState() {
    const {gl} = this.context;
    const {attributeManager} = this.state;

    attributeManager.addInstanced({
      instancePositions: {size: 2, update: this.calculateInstancePositions, noAlloc: true},
      instanceNormals: {size: 3, update: this.calculateInstanceNormals, noAlloc: true}
    });

    this.setState({
      models: this._getModels(gl)
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {attributeManager} = this.state;

    if (changeFlags.dataChanged || oldProps.ticksCount !== props.ticksCount) {
      const ticks = calculateTicks();

      this.setState({
        ticks,
        labels: renderLabelTexture(ticks),
        dims: this.props.data.map(d => d[1])
      });

      const instanceCount = ticks[0] + ticks[1] + ticks[2];
      const {grids, labels} = this.state.models;

      attributeManager.invalidateAll();

      Object.values(this.state.models).forEach(model => {
        model.setInstanceCount(instanceCount);
        model.setAttributes(attributeManager.attributes);
      });
    }
  }

  draw({uniforms}) {
    const {viewport: {width, height}} = this.context;
    const {dim} = this.state;
    const {fontSize, axesColor, axesOffset} = this.props;

    const baseUniforms = {
      ...uniforms,
      fontSize,
      dim,
      screenSize: [width, height],
      offset: axesOffset,
      strokeColor: axesColor
    };

    if (this.state.labels) {
      this.models.grids.render(baseUniforms);

      this.models.labels.render({
        ...baseUniforms,
        ...this.state.labels
      });
    }
  }

  _getModels(gl) {
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
      id: `${this.props.id}-grids`,
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

  calculateInstancePositions(attribute) {
    const {ticks} = this.state;

    const positions = ticks.map(axisTicks =>
      axisTicks.map((t, i) => [t, i])
    );

    attribute.value = new Float32Array(flatten(positions));
  }

  calculateInstanceNormals(attribute) {
    const {ticks: [xTicks, yTicks, zTicks]} = this.state;

    const normals = [
      xTicks.map(t => [1, 0, 0]),
      yTicks.map(t => [0, 1, 0]),
      zTicks.map(t => [0, 0, 1])
    ];

    attribute.value = new Float32Array(flatten(normals));
  }

  // updates the instancePositions and instanceNormals attributes
  calculateTicks() {
    const {data, ticksCount} = this.props;
    if (!data) {
      return;
    }

    const xTicks = getTicks(data[0], ticksCount);
    const yTicks = getTicks(data[1], ticksCount);
    const zTicks = getTicks(data[2], ticksCount);

    return [xTicks, yTicks, zTicks];
  }

  renderLabelTexture(ticks) {

    if (this.labels) {
      this.labels.labelTexture.delete();
    }
    const fontSize = 48;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    setTextStyle(ctx);

    // measure texts
    const maxWidth = ticks.map(axisLabels => {
      return axisLabels.reduce((acc, label) => {
        const w = ctx.measureText(label).width;
        return Math.max(acc, w);
      }, 0);
    });

    const canvasWidth = maxWidth.reduce((x, w) => x + Math.ceil(w) * 2, 0);
    const canvasHeight = ticks.reduce((h, axisLabels) =>
      Math.max(h, axisLabels.length * fontSize), 0);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // changing canvas size will reset context
    setTextStyle(ctx);

    let x = 0;
    ticks.forEach((axisLabels, axis) => {
      x += maxWidth[axis] / 2;
      axisLabels.forEach((label, i) => {
        ctx.fillText(label, x, i * fontSize);
      });
      x += maxWidth[axis] / 2;
    });

    this.labels = {
      labelHeight: fontSize,
      labelWidths: maxWidth,
      labelTextureDim: [canvasWidth, canvasHeight],
      labelTexture: new Texture2D(this.props.gl, {pixels: canvas})
    };
  }

}

PlotLayer.layerName = 'AxesLayer';
PlotLayer.defaultProps = defaultProps;
