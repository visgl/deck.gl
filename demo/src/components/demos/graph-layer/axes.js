import {assembleShaders} from 'deck.gl';
import {GL, Model, Geometry} from 'luma.gl';

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

export default class Axes {

  constructor(props) {
    this.model = this._getModel(props);
    this.props = props;
  }

  render(uniforms) {
    this.model.render(uniforms);
  }

  updateProps(props) {
    const {bounds, ticksCount} = props;

    if (bounds || this.props.ticksCount !== ticksCount) {
      this.props = {...this.props, ...props};
      this.calculateTicks(bounds, ticksCount);
    }
  }

  _getModel({gl, id}) {
    // axis grids
    const axisShaders = assembleShaders(gl, {
      vs: readFileSync(join(__dirname, './axes-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './fragment.glsl'), 'utf8')
    });

    // draw rectangle around slice
    const axisPositions = [
      -1, -1, 0, -1, 1, 0,
      -1, 1, 0, 1, 1, 0,
      1, 1, 0, 1, -1, 0,
      1, -1, 0, -1, -1, 0
    ];
    const axisNormals = [
      -1, 0, 0, -1, 0, 0,
      0, 1, 0, 0, 1, 0,
      1, 0, 0, 1, 0, 0,
      0, -1, 0, 0, -1, 0
    ];

    return new Model({
      gl,
      id: `${id}-axis`,
      vs: axisShaders.vs,
      fs: axisShaders.fs,
      geometry: new Geometry({
        drawMode: GL.LINES,
        positions: new Float32Array(axisPositions),
        normals: new Float32Array(axisNormals)
      }),
      isInstanced: true
    });
  }

  // updates the instancePositions and instanceNormals attributes
  calculateTicks(bounds, ticksCount) {
    if (!bounds) {
      return;
    }

    const xTicks = getTicks(bounds[0], ticksCount);
    const yTicks = getTicks(bounds[1], ticksCount);
    const zTicks = getTicks(bounds[2], ticksCount);

    const normals = [].concat(
      xTicks.map(t => [1, 0, 0]),
      yTicks.map(t => [0, 1, 0]),
      zTicks.map(t => [0, 0, 1])
    );

    this.model.setAttributes({
      instancePositions: {
        size: 1,
        value: new Float32Array(flatten([xTicks, yTicks, zTicks])),
        instanced: true
      },
      instanceNormals: {size: 3, value: new Float32Array(flatten(normals)), instanced: true}
    });
    this.model.setInstanceCount(normals.length);
  }

}
