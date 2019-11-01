import {Layer} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry} from '@luma.gl/core';

import {textMatrixToTexture} from './utils';

import fragmentShader from './axes-fragment.glsl';
import gridVertex from './grid-vertex.glsl';
import labelVertex from './label-vertex.glsl';
import labelFragment from './label-fragment.glsl';

/* Constants */
const DEFAULT_FONT_SIZE = 12;
const DEFAULT_TICK_COUNT = 6;
const DEFAULT_TICK_FORMAT = x => x.toFixed(2);

const defaultProps = {
  data: [],
  fontSize: DEFAULT_FONT_SIZE,
  xScale: null,
  yScale: null,
  zScale: null,
  xTicks: DEFAULT_TICK_COUNT,
  yTicks: DEFAULT_TICK_COUNT,
  zTicks: DEFAULT_TICK_COUNT,
  xTickFormat: DEFAULT_TICK_FORMAT,
  yTickFormat: DEFAULT_TICK_FORMAT,
  zTickFormat: DEFAULT_TICK_FORMAT,
  padding: 0,
  color: [0, 0, 0, 255],
  xTitle: 'x',
  yTitle: 'y',
  zTitle: 'z'
};

/* Utils */
function flatten(arrayOfArrays) {
  const flatArray = arrayOfArrays.reduce((acc, arr) => acc.concat(arr), []);
  if (Array.isArray(flatArray[0])) {
    return flatten(flatArray);
  }
  return flatArray;
}

function getTicks(props) {
  const {axis} = props;
  let ticks = props[`${axis}Ticks`];
  const scale = props[`${axis}Scale`];
  const tickFormat = props[`${axis}TickFormat`];

  if (!Array.isArray(ticks)) {
    ticks = scale.ticks(ticks);
  }

  const titleTick = {
    value: props[`${axis}Title`],
    position: (scale.range()[0] + scale.range()[1]) / 2,
    text: props[`${axis}Title`]
  };

  return [
    ...ticks.map(t => ({
      value: t,
      position: scale(t),
      text: tickFormat(t, axis)
    })),
    titleTick
  ];
}

/*
 * @classdesc
 * A layer that plots a surface based on a z=f(x,y) equation.
 *
 * @class
 * @param {Object} [props]
 * @param {Integer} [props.ticksCount] - number of ticks along each axis, see
      https://github.com/d3/d3-axis/blob/master/README.md#axis_ticks
 * @param {Number} [props.padding] - amount to set back grids from the plot,
      relative to the size of the bounding box
 * @param {d3.scale} [props.xScale] - a d3 scale for the x axis
 * @param {d3.scale} [props.yScale] - a d3 scale for the y axis
 * @param {d3.scale} [props.zScale] - a d3 scale for the z axis
 * @param {Number | [Number]} [props.xTicks] - either tick counts or an array of tick values
 * @param {Number | [Number]} [props.yTicks] - either tick counts or an array of tick values
 * @param {Number | [Number]} [props.zTicks] - either tick counts or an array of tick values
 * @param {Function} [props.xTickFormat] - returns a string from value
 * @param {Function} [props.yTickFormat] - returns a string from value
 * @param {Function} [props.zTickFormat] - returns a string from value
 * @param {String} [props.xTitle] - x axis title
 * @param {String} [props.yTitle] - y axis title
 * @param {String} [props.zTitle] - z axis title
 * @param {Number} [props.fontSize] - size of the labels
 * @param {Array} [props.color] - color of the gridlines, in [r,g,b,a]
 */
export default class AxesLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    const attributeManager = this.getAttributeManager();

    attributeManager.addInstanced({
      instancePositions: {size: 2, update: this.calculateInstancePositions, noAlloc: true},
      instanceNormals: {size: 3, update: this.calculateInstanceNormals, noAlloc: true},
      instanceIsTitle: {size: 1, update: this.calculateInstanceIsTitle, noAlloc: true}
    });

    this.setState(
      Object.assign(
        {
          numInstances: 0,
          labels: null
        },
        this._getModels(gl)
      )
    );
  }

  updateState({oldProps, props, changeFlags}) {
    const attributeManager = this.getAttributeManager();

    if (
      oldProps.xScale !== props.xScale ||
      oldProps.yScale !== props.yScale ||
      oldProps.zScale !== props.zScale ||
      oldProps.xTicks !== props.xTicks ||
      oldProps.yTicks !== props.yTicks ||
      oldProps.zTicks !== props.zTicks ||
      oldProps.xTickFormat !== props.xTickFormat ||
      oldProps.yTickFormat !== props.yTickFormat ||
      oldProps.zTickFormat !== props.zTickFormat
    ) {
      const {xScale, yScale, zScale} = props;

      const ticks = [
        getTicks({...props, axis: 'x'}),
        getTicks({...props, axis: 'z'}),
        getTicks({...props, axis: 'y'})
      ];

      const xRange = xScale.range();
      const yRange = yScale.range();
      const zRange = zScale.range();

      this.setState({
        ticks,
        labelTexture: this.renderLabelTexture(ticks),
        gridDims: [xRange[1] - xRange[0], zRange[1] - zRange[0], yRange[1] - yRange[0]],
        gridCenter: [
          (xRange[0] + xRange[1]) / 2,
          (zRange[0] + zRange[1]) / 2,
          (yRange[0] + yRange[1]) / 2
        ]
      });

      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {gridDims, gridCenter, modelsByName, labelTexture, numInstances} = this.state;
    const {fontSize, color, padding} = this.props;

    if (labelTexture) {
      const baseUniforms = {
        fontSize,
        gridDims,
        gridCenter,
        gridOffset: padding,
        strokeColor: color
      };

      modelsByName.grids.setInstanceCount(numInstances);
      modelsByName.labels.setInstanceCount(numInstances);

      modelsByName.grids.setUniforms(Object.assign({}, uniforms, baseUniforms)).draw();
      modelsByName.labels
        .setUniforms(Object.assign({}, uniforms, baseUniforms, labelTexture))
        .draw();
    }
  }

  _getModels(gl) {
    /* grids:
     * for each x tick, draw rectangle on yz plane around the bounding box.
     * for each y tick, draw rectangle on zx plane around the bounding box.
     * for each z tick, draw rectangle on xy plane around the bounding box.
     * show/hide is toggled by the vertex shader
     */
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
      -1,
      -1,
      0,
      -1,
      1,
      0,
      // top edge
      -1,
      1,
      0,
      1,
      1,
      0,
      // right edge
      1,
      1,
      0,
      1,
      -1,
      0,
      // bottom edge
      1,
      -1,
      0,
      -1,
      -1,
      0
    ];
    // normal of each edge
    const gridNormals = [
      // left edge
      -1,
      0,
      0,
      -1,
      0,
      0,
      // top edge
      0,
      1,
      0,
      0,
      1,
      0,
      // right edge
      1,
      0,
      0,
      1,
      0,
      0,
      // bottom edge
      0,
      -1,
      0,
      0,
      -1,
      0
    ];

    const grids = new Model(gl, {
      id: `${this.props.id}-grids`,
      vs: gridVertex,
      fs: fragmentShader,
      geometry: new Geometry({
        drawMode: GL.LINES,
        attributes: {
          positions: new Float32Array(gridPositions),
          normals: new Float32Array(gridNormals)
        },
        vertexCount: gridPositions.length / 3
      }),
      isInstanced: true
    });

    /* labels
     * one label is placed at each end of every grid line
     * show/hide is toggled by the vertex shader
     */
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
        i * 4 + 0,
        i * 4 + 1,
        i * 4 + 2,
        i * 4 + 2,
        i * 4 + 1,
        i * 4 + 3
      ]);

      // all four vertices of this label's rectangle is anchored at the same grid endpoint
      for (let j = 0; j < 4; j++) {
        labelPositions = labelPositions.concat(gridPositions.slice(i * 3, i * 3 + 3));
        labelNormals = labelNormals.concat(gridNormals.slice(i * 3, i * 3 + 3));
      }
    }

    const labels = new Model(gl, {
      id: `${this.props.id}-labels`,
      vs: labelVertex,
      fs: labelFragment,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: {
          indices: new Uint16Array(labelIndices),
          positions: new Float32Array(labelPositions),
          texCoords: {size: 2, value: new Float32Array(labelTexCoords)},
          normals: new Float32Array(labelNormals)
        }
      }),
      isInstanced: true
    });

    return {
      models: [grids, labels].filter(Boolean),
      modelsByName: {grids, labels}
    };
  }

  calculateInstancePositions(attribute) {
    const {ticks} = this.state;

    const positions = ticks.map(axisTicks => axisTicks.map((t, i) => [t.position, i]));

    const value = new Float32Array(flatten(positions));
    attribute.value = value;

    this.setState({numInstances: value.length / attribute.size});
  }

  calculateInstanceNormals(attribute) {
    const {
      ticks: [xTicks, zTicks, yTicks]
    } = this.state;

    const normals = [
      xTicks.map(t => [1, 0, 0]),
      zTicks.map(t => [0, 1, 0]),
      yTicks.map(t => [0, 0, 1])
    ];

    attribute.value = new Float32Array(flatten(normals));
  }

  calculateInstanceIsTitle(attribute) {
    const {ticks} = this.state;

    const isTitle = ticks.map(axisTicks => {
      const ticksCount = axisTicks.length - 1;
      return axisTicks.map((t, i) => (i < ticksCount ? 0 : 1));
    });

    attribute.value = new Float32Array(flatten(isTitle));
  }

  renderLabelTexture(ticks) {
    if (this.state.labels) {
      this.state.labels.labelTexture.delete();
    }

    // attach a 2d texture of all the label texts
    const textureInfo = textMatrixToTexture(this.context.gl, ticks, DEFAULT_FONT_SIZE * 4);
    if (textureInfo) {
      // success
      const {columnWidths, texture} = textureInfo;

      return {
        labelHeight: DEFAULT_FONT_SIZE * 4,
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
