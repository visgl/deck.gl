import {Layer, assembleShaders} from 'deck.gl';
import {GL, Model, Geometry} from 'luma.gl';

import {scaleLinear} from 'd3-scale';
import {readFileSync} from 'fs';
import {join} from 'path';
import {textMatrixToTexture} from './utils';

/* Constants */
const FONT_SIZE = 48;

const defaultProps = {
  fontSize: 24,
  ticksCount: 6,
  axesOffset: 0,
  axesColor: [0, 0, 0, 255]
};

/* Utils */
function flatten(arrayOfArrays) {
  const flatArray = arrayOfArrays.reduce((acc, arr) => acc.concat(arr), []);
  if (Array.isArray(flatArray[0])) {
    return flatten(flatArray);
  }
  return flatArray;
}

function getTicks([min, max], ticksCount) {
  return scaleLinear().domain([min, max]).ticks(ticksCount);
}

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
      models: this._getModels(gl),
      numInstances: 0,
      labels: null,
      center: [0, 0, 0],
      dim: [1, 1, 1]
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {attributeManager} = this.state;

    if (changeFlags.dataChanged || oldProps.ticksCount !== props.ticksCount) {
      const {data, ticksCount} = props;

      const ticks = this.calculateTicks(data, ticksCount);

      this.setState({
        ticks,
        labelTexture: this.renderLabelTexture(ticks),
        center: data.map(b => (b[0] + b[1]) / 2),
        dim: data.map(b => b[1] - b[0])
      });

      attributeManager.invalidateAll();
    }
  }

  updateAttributes(props) {
    super.updateAttributes(props);
    const {attributeManager, models, numInstances} = this.state;
    const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});

    models.grids.setInstanceCount(numInstances);
    models.grids.setAttributes(changedAttributes);

    models.labels.setInstanceCount(numInstances);
    models.labels.setAttributes(changedAttributes);
  }

  draw({uniforms}) {
    const {viewport: {width, height}} = this.context;
    const {center, dim, models, labelTexture} = this.state;
    const {fontSize, axesColor, axesOffset} = this.props;

    if (labelTexture) {
      const baseUniforms = {
        fontSize,
        screenSize: [width, height],
        modelCenter: center,
        modelDim: dim,
        gridOffset: axesOffset,
        strokeColor: axesColor
      };

      models.grids.render(Object.assign({}, uniforms, baseUniforms));

      models.labels.render(Object.assign({}, uniforms, baseUniforms, labelTexture));
    }
  }

  _getModels(gl) {
    /* grids:
     * for each x tick, draw rectangle on yz plane around the bounding box.
     * for each y tick, draw rectangle on zx plane around the bounding box.
     * for each z tick, draw rectangle on xy plane around the bounding box.
     * show/hide is toggled by the vertex shader
     */
    const gridShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './grid-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './fragment.glsl'), 'utf8')
    });

    /*
     * rectangles are defined in 2d and rotated in the vertex shader
     *
     * (-1,1)      (1,1)
     *   +-----------+
     *   |           |
     *   |           |
     *   |           |
     *   |           |
     *   +-----------+
     * (-1,-1)     (1,-1)
     */

    // offset of each corner
    const gridPositions = [
      // left edge
      -1, -1, 0, -1, 1, 0,
      // top edge
      -1, 1, 0, 1, 1, 0,
      // right edge
      1, 1, 0, 1, -1, 0,
      // bottom edge
      1, -1, 0, -1, -1, 0
    ];
    // normal of each edge
    const gridNormals = [
      // left edge
      -1, 0, 0, -1, 0, 0,
      // top edge
      0, 1, 0, 0, 1, 0,
      // right edge
      1, 0, 0, 1, 0, 0,
      // bottom edge
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

    /* labels
     * one label is placed at each end of every grid line
     * show/hide is toggled by the vertex shader
     */
    const labelShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './label-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './label-fragment.glsl'), 'utf8')
    });

    let labelTexCoords = [];
    let labelPositions = [];
    let labelNormals = [];
    let labelIndices = [];
    for (let i = 0; i < 8; i++) {
      /*
       * each label is rendered as a rectangle
       *   0     2
       *    +--.+
       *    | / |
       *    +'--+
       *   1     3
       */
      labelTexCoords = labelTexCoords.concat([0, 0, 0, 1, 1, 0, 1, 1]);
      labelIndices = labelIndices.concat([
        i * 4 + 0, i * 4 + 1, i * 4 + 2,
        i * 4 + 2, i * 4 + 1, i * 4 + 3
      ]);

      // all four vertices of this label's rectangle is anchored at the same grid endpoint
      for (let j = 0; j < 4; j++) {
        labelPositions = labelPositions.concat(gridPositions.slice(i * 3, i * 3 + 3));
        labelNormals = labelNormals.concat(gridNormals.slice(i * 3, i * 3 + 3));
      }
    }

    const labels = new Model({
      gl,
      id: `${this.props.id}-labels`,
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

    const value = new Float32Array(flatten(positions));
    attribute.value = value;

    this.setState({numInstances: value.length / attribute.size});
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
  calculateTicks(bounds, ticksCount) {
    const xTicks = getTicks(bounds[0], ticksCount);
    const yTicks = getTicks(bounds[1], ticksCount);
    const zTicks = getTicks(bounds[2], ticksCount);

    return [xTicks, yTicks, zTicks];
  }

  renderLabelTexture(ticks) {

    if (this.state.labels) {
      this.state.labels.labelTexture.delete();
    }

    // attach a 2d texture of all the label texts
    const textureInfo = textMatrixToTexture(this.context.gl, ticks, FONT_SIZE);
    if (textureInfo) {
      // success
      const {columnWidths, texture} = textureInfo;

      return {
        labelHeight: FONT_SIZE,
        labelWidths: columnWidths,
        labelTextureDim: [texture.width, texture.height],
        labelTexture: texture
      };
    }
    return null;
  }

}

AxesLayer.layerName = 'AxesLayer';
AxesLayer.defaultProps = defaultProps;
