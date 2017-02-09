import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  opacity: 1,
  strokeWidthScale: 1, // stroke width in meters
  rounded: false,
  miterLimit: 4,
  strokeWidthMinPixels: 0, //  min stroke width in pixels
  strokeWidthMaxPixels: Number.MAX_SAFE_INTEGER, // max stroke width in pixels
  getPath: object => object.path,
  getColor: object => object.color || DEFAULT_COLOR,
  getStrokeWidth: object => object.width || 1
};

const isClosed = path => {
  const firstPoint = path[0];
  const lastPoint = path[path.length - 1];
  return firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1] &&
    firstPoint[2] === lastPoint[2];
};

export default class PathLayer extends Layer {
  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './path-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './path-layer-fragment.glsl'), 'utf8')
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const {attributeManager} = this.state;
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instanceStartPositions: {size: 3, update: this.calculateStartPositions},
      instanceEndPositions: {size: 3, update: this.calculateEndPositions},
      instanceLeftDeltas: {size: 3, update: this.calculateLeftDeltas},
      instanceRightDeltas: {size: 3, update: this.calculateRightDeltas},
      instanceStrokeWidths: {size: 1, accessor: 'getStrokeWidth', update: this.calculateStrokeWidths},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors},
      instancePickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors}
    });
    /* eslint-enable max-len */
  }

  updateState({oldProps, props, changeFlags}) {
    const {getPath} = this.props;
    const {attributeManager} = this.state;

    if (changeFlags.dataChanged) {
      // this.state.paths only stores point positions in each path
      const paths = props.data.map(getPath);
      const numInstances = paths.reduce((count, path) => count + path.length - 1, 0);

      this.setState({paths, numInstances});
      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {
      rounded, miterLimit, strokeWidthScale, strokeWidthMinPixels, strokeWidthMaxPixels
    } = this.props;

    this.state.model.render(Object.assign({}, uniforms, {
      jointType: Number(rounded),
      strokeWidthScale,
      miterLimit,
      strokeWidthMinPixels,
      strokeWidthMaxPixels
    }));
  }

  getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());

    /*
     *       _
     *        "-_ 1                   3                       5
     *     _     "o---------------------o-------------------_-o
     *       -   / ""--..__              '.             _.-' /
     *   _     "@- - - - - ""--..__- - - - x - - - -_.@'    /
     *    "-_  /                   ""--..__ '.  _,-` :     /
     *       "o----------------------------""-o'    :     /
     *      0,2                            4 / '.  :     /
     *                                      /   '.:     /
     *                                     /     :'.   /
     *                                    /     :  ', /
     *                                   /     :     o
     */

    const SEGMENT_INDICES = [
      // start corner
      0, 2, 1,
      // body
      1, 2, 4, 1, 4, 3,
      // end corner
      3, 4, 5
    ];

    // [0] position on segment - 0: start, 1: end
    // [1] side of path - -1: left, 0: center, 1: right
    // [2] role - 0: offset point 1: joint point
    const SEGMENT_POSITIONS = [
      // bevel start corner
      0, 0, 1,
      // start inner corner
      0, -1, 0,
      // start outer corner
      0, 1, 0,
      // end inner corner
      1, -1, 0,
      // end outer corner
      1, 1, 0,
      // bevel end corner
      1, 0, 1
    ];

    return new Model({
      gl,
      id: this.props.id,
      fs: shaders.fs,
      vs: shaders.vs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        attributes: {
          indices: new Uint16Array(SEGMENT_INDICES),
          positions: new Float32Array(SEGMENT_POSITIONS)
        }
      }),
      isInstanced: true
    });
  }

  calculateStartPositions(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach(path => {
      const numSegments = path.length - 1;
      for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
        const point = path[ptIndex];
        value[i++] = point[0];
        value[i++] = point[1];
        value[i++] = point[2] || 0;
      }
    });
  }

  calculateEndPositions(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach(path => {
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        const point = path[ptIndex];
        value[i++] = point[0];
        value[i++] = point[1];
        value[i++] = point[2] || 0;
      }
    });
  }

  calculateLeftDeltas(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach(path => {
      const numSegments = path.length - 1;
      let prevPoint = isClosed(path) ? path[path.length - 2] : path[0];

      for (let ptIndex = 0; ptIndex < numSegments; ptIndex++) {
        const point = path[ptIndex];
        value[i++] = point[0] - prevPoint[0];
        value[i++] = point[1] - prevPoint[1];
        value[i++] = (point[2] - prevPoint[2]) || 0;
        prevPoint = point;
      }
    });
  }

  calculateRightDeltas(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach(path => {
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        const point = path[ptIndex];
        let nextPoint = path[ptIndex + 1];
        if (!nextPoint) {
          nextPoint = isClosed(path) ? path[1] : point;
        }

        value[i++] = nextPoint[0] - point[0];
        value[i++] = nextPoint[1] - point[1];
        value[i++] = (nextPoint[2] - point[2]) || 0;
      }
    });
  }

  calculateStrokeWidths(attribute) {
    const {data, getStrokeWidth} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const width = getStrokeWidth(data[index], index);
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        value[i++] = width;
      }
    });
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const pointColor = getColor(data[index], index);
      if (isNaN(pointColor[3])) {
        pointColor[3] = 255;
      }
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        value[i++] = pointColor[0];
        value[i++] = pointColor[1];
        value[i++] = pointColor[2];
        value[i++] = pointColor[3];
      }
    });
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const {paths} = this.state;
    const {value} = attribute;

    let i = 0;
    paths.forEach((path, index) => {
      const pickingColor = this.encodePickingColor(index);
      for (let ptIndex = 1; ptIndex < path.length; ptIndex++) {
        value[i++] = pickingColor[0];
        value[i++] = pickingColor[1];
        value[i++] = pickingColor[2];
      }
    });
  }

}

PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
