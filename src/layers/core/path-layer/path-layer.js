import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  opacity: 1,
  strokeWidth: 1, // stroke width in meters
  miterLimit: 4,
  strokeMinPixels: 0, //  min stroke width in pixels
  strokeMaxPixels: Number.MAX_SAFE_INTEGER, // max stroke width in pixels
  getPath: object => object.path,
  getColor: object => object.color,
  getWidth: object => object.width
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
    this.setState({
      model: this.getModel(gl),
      numInstances: 0,
      IndexType: gl.getExtension('OES_element_index_uint') ? Uint32Array : Uint16Array
    });

    const {attributeManager} = this.state;
    const noAlloc = true;
    attributeManager.addDynamic({
      indices: {
        size: 1,
        isIndexed: true,
        update: this.calculateIndices, noAlloc
      },
      positions: {
        size: 3,
        update: this.calculatePositions, noAlloc
      },
      leftDeltas: {
        size: 3,
        update: this.calculateLeftDeltas, noAlloc
      },
      rightDeltas: {
        size: 3,
        update: this.calculateRightDeltas, noAlloc
      },
      directions: {
        size: 1,
        accessor: 'getWidth',
        update: this.calculateDirections, noAlloc
      },
      colors: {
        type: GL.UNSIGNED_BYTE,
        size: 4,
        accessor: 'getColor',
        update: this.calculateColors, noAlloc
      },
      pickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        update: this.calculatePickingColors, noAlloc
      }
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {getPath} = this.props;
    const {attributeManager, IndexType} = this.state;

    if (changeFlags.dataChanged) {
      // this.state.paths only stores point positions in each path
      const paths = props.data.map(getPath);
      const pointCount = paths.reduce((count, path) => count + path.length, 0);

      // each point will generate two vertices for outside and inside
      if (IndexType === Uint16Array && pointCount * 2 > 65535) {
        throw new Error('Vertex count exceeds browser\'s limit');
      }

      this.setState({paths, pointCount});
      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    const {opacity, strokeWidth, miterLimit, strokeMinPixels, strokeMaxPixels} = this.props;

    this.state.model.render(Object.assign({}, uniforms, {
      opacity,
      thickness: strokeWidth,
      miterLimit,
      strokeMinPixels,
      strokeMaxPixels
    }));
  }

  getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());
    return new Model({
      gl,
      id: this.props.id,
      fs: shaders.fs,
      vs: shaders.vs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES
      }),
      vertexCount: 0,
      isIndexed: true
    });
  }

  calculateIndices(attribute) {
    const {paths, IndexType, model, pointCount} = this.state;

    // each path with length n has n-1 line segments
    // * 2 * 3: each segment is rendered as 2 triangles with 3 vertices
    const indexCount = (pointCount - paths.length) * 2 * 3;
    model.setVertexCount(indexCount);

    const indices = new IndexType(indexCount);

    let i = 0;
    let offset = 0;
    paths.forEach(path => {
      // counter-clockwise triangulation
      //                ___
      //             0 |  /| 2  (outside edge)
      //  o---o  =>    o / o
      //             1 |/__| 3  (inside edge)
      //
      for (let ptIndex = 0; ptIndex < path.length - 1; ptIndex++) {
        // triangle A with indices: 0, 1, 2
        indices[i++] = offset + 0;
        indices[i++] = offset + 1;
        indices[i++] = offset + 2;
        // triangle B with indices: 2, 1, 3
        indices[i++] = offset + 2;
        indices[i++] = offset + 1;
        indices[i++] = offset + 3;
        // move to the next segment
        offset += 2;
      }
      // move to the next path
      offset += 2;
    });

    attribute.value = indices;
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;
  }

  calculatePositions(attribute) {
    const {paths, pointCount} = this.state;
    const positions = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      path.forEach(point => {
        // two copies for outside edge and inside edge each
        positions[i++] = point[0];
        positions[i++] = point[1];
        positions[i++] = point[2] || 0;
        positions[i++] = point[0];
        positions[i++] = point[1];
        positions[i++] = point[2] || 0;
      });
    });

    attribute.value = positions;
  }

  calculateLeftDeltas(attribute) {
    const {paths, pointCount} = this.state;
    const {size} = attribute;

    const leftDeltas = new Float32Array(pointCount * size * 2);

    let i = 0;
    paths.forEach(path => {
      path.reduce((prevPoint, point) => {
        if (prevPoint) {
          // two copies for outside edge and inside edge each
          leftDeltas[i++] = point[0] - prevPoint[0];
          leftDeltas[i++] = point[1] - prevPoint[1];
          leftDeltas[i++] = (point[2] - prevPoint[2]) || 0;
          leftDeltas[i++] = point[0] - prevPoint[0];
          leftDeltas[i++] = point[1] - prevPoint[1];
          leftDeltas[i++] = (point[2] - prevPoint[2]) || 0;
        }
        return point;
      }, isClosed(path) ? path[path.length - 2] : path[0]);
    });

    attribute.value = leftDeltas;
  }

  calculateRightDeltas(attribute) {
    const {paths, pointCount} = this.state;
    const {size} = attribute;

    const rightDeltas = new Float32Array(pointCount * size * 2);

    let i = 0;
    paths.forEach(path => {
      path.forEach((point, ptIndex) => {
        let nextPoint = path[ptIndex + 1];
        if (!nextPoint) {
          nextPoint = isClosed(path) ? path[1] : point;
        }

        // two copies for outside edge and inside edge each
        rightDeltas[i++] = nextPoint[0] - point[0];
        rightDeltas[i++] = nextPoint[1] - point[1];
        rightDeltas[i++] = (nextPoint[2] - point[2]) || 0;
        rightDeltas[i++] = nextPoint[0] - point[0];
        rightDeltas[i++] = nextPoint[1] - point[1];
        rightDeltas[i++] = (nextPoint[2] - point[2]) || 0;
      });
    });

    attribute.value = rightDeltas;
  }

  calculateDirections(attribute) {
    const {data, getWidth} = this.props;
    const {paths, pointCount} = this.state;
    const directions = new Float32Array(pointCount * 2);

    let i = 0;
    paths.forEach((path, index) => {
      let w = getWidth(data[index], index);
      if (isNaN(w)) {
        w = 1;
      }
      for (let ptIndex = 0; ptIndex < path.length; ptIndex++) {
        directions[i++] = w;
        directions[i++] = -w;
      }
    });

    attribute.value = directions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths, pointCount} = this.state;
    const {size} = attribute;
    const colors = new Uint8ClampedArray(pointCount * size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const pointColor = getColor(data[index], index) || DEFAULT_COLOR;
      if (isNaN(pointColor[3])) {
        pointColor[3] = 255;
      }
      for (let ptIndex = 0; ptIndex < path.length; ptIndex++) {
        // two copies for outside edge and inside edge each
        colors[i++] = pointColor[0];
        colors[i++] = pointColor[1];
        colors[i++] = pointColor[2];
        colors[i++] = pointColor[3];
        colors[i++] = pointColor[0];
        colors[i++] = pointColor[1];
        colors[i++] = pointColor[2];
        colors[i++] = pointColor[3];
      }
    });

    attribute.value = colors;
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const {paths, pointCount} = this.state;
    const {size} = attribute;
    const pickingColors = new Uint8ClampedArray(pointCount * size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const pickingColor = this.encodePickingColor(index);
      for (let ptIndex = 0; ptIndex < path.length; ptIndex++) {
        // two copies for outside edge and inside edge each
        pickingColors[i++] = pickingColor[0];
        pickingColors[i++] = pickingColor[1];
        pickingColors[i++] = pickingColor[2];
        pickingColors[i++] = pickingColor[0];
        pickingColors[i++] = pickingColor[1];
        pickingColors[i++] = pickingColor[2];
      }
    });

    attribute.value = pickingColors;
  }

}

PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
