import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const defaultProps = {
  opacity: 1,
  strokeWidth: 1,
  getPaths: feature => feature.geometry.coordinates,
  getColor: feature => feature.properties.color,
  getWidth: feature => feature.properties.width || 1
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
    attributeManager.addDynamic({
      indices: {size: 1, update: this.calculateIndices, isIndexed: true},
      positions: {size: 3, update: this.calculatePositions},
      prevPositions: {size: 3, update: this.calculatePrevPositions},
      nextPositions: {size: 3, update: this.calculateNextPositions},
      directions: {size: 1, update: this.calculateDirections},
      colors: {size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateColors},
      pickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        update: this.calculatePickingColors,
        noAlloc: true
      }
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {getPaths} = this.props;
    const {attributeManager} = this.state;

    if (changeFlags.dataChanged) {
      // this.state.paths only stores point positions in each path
      this.state.paths = [];

      this.state.paths =props.data.map(getPaths);

      this.state.pointCount = 0;
      this.state.indexCount = 0;

      this.state.paths.forEach(path => {
        this.state.pointCount += path.length;
        // path.length - 1: n points => n-1 line segments
        // * 2 * 3: each is rendered as 2 triangles with 3 vertices
        this.state.indexCount += (path.length - 1) * 2 * 3;
      });

      attributeManager.invalidateAll();
    }

    if (oldProps.opacity !== props.opacity) {
      this.setUniforms({opacity: props.opacity});
    }
  }

  draw({uniforms}) {
    this.state.model.render(Object.assign({}, uniforms, {
      opacity: this.props.opacity,
      thickness: this.props.strokeWidth || 1,
      miterLimit: 1
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
    const {paths, IndexType, model, indexCount} = this.state;

    if (IndexType === Uint16Array && indexCount > 65535) {
      throw new Error('Vertex count exceeds browser\'s limit');
    }
    model.setVertexCount(indexCount);

    const indices = new IndexType(indexCount);

    // 1. calculate index offsets for points on paths
    const offsets = [0];
    let accLength = 0;
    paths.forEach(vertices => {
      accLength += vertices.length;
      offsets.push(accLength);
    });

    let i = 0;
    // 2. generate mesh indices
    paths.forEach((path, pathIndex) => {
      const di = offsets[pathIndex] * 2;
      const ptCount = path.length;

      // counter-clockwise triangulation
      //
      //             0 |---| 2
      //  o---o  =>    o / o
      //             1 |---| 3
      //
      for (let ptIndex = 0; ptIndex < ptCount - 1; ptIndex++) {
        const startIndex = ptIndex * 2 + di;
        // triangle A with indices: 0, 1, 2
        indices[i++] = startIndex + 0;
        indices[i++] = startIndex + 1;
        indices[i++] = startIndex + 2;
        // triangle B with indices: 2, 1, 3
        indices[i++] = startIndex + 2;
        indices[i++] = startIndex + 1;
        indices[i++] = startIndex + 3;
      }
    });

    attribute.value = indices;
    attribute.target = GL.ELEMENT_ARRAY_BUFFER;
  }

  calculatePositions(attribute) {
    const {paths, pointCount} = this.state;
    const positions = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path =>
      path.forEach(point => {
        positions[i++] = point[0];
        positions[i++] = point[1];
        positions[i++] = point[2] || 0;
        positions[i++] = point[0];
        positions[i++] = point[1];
        positions[i++] = point[2] || 0;
      })
    );

    attribute.value = positions;
  }

  calculatePrevPositions(attribute) {
    const {paths, pointCount} = this.state;
    const prevPositions = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      this._shiftPath(path, -1).forEach(point => {
        prevPositions[i++] = point[0];
        prevPositions[i++] = point[1];
        prevPositions[i++] = point[2] || 0;
        prevPositions[i++] = point[0];
        prevPositions[i++] = point[1];
        prevPositions[i++] = point[2] || 0;
      });
    });

    attribute.value = prevPositions;
  }

  calculateNextPositions(attribute) {
    const {paths, pointCount} = this.state;
    const nextPositions = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      this._shiftPath(path, 1).forEach(point => {
        nextPositions[i++] = point[0];
        nextPositions[i++] = point[1];
        nextPositions[i++] = point[2] || 0;
        nextPositions[i++] = point[0];
        nextPositions[i++] = point[1];
        nextPositions[i++] = point[2] || 0;
      });
    });

    attribute.value = nextPositions;
  }

  calculateDirections(attribute) {
    const {data, strokeWidth, getWidth} = this.props;
    const {paths, pointCount} = this.state;
    const directions = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      const w = getWidth(data[path._index]) || strokeWidth;
      path.forEach(() => {
        directions[i++] = w;
        directions[i++] = -w;
      });
    });

    attribute.value = directions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths, pointCount} = this.state;
    const colors = new Uint8Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      const pointColor = getColor(data[path._index]);
      if (isNaN(pointColor[3])) {
        pointColor[3] = 255;
      }

      path.forEach(() => {
        colors[i++] = pointColor[0];
        colors[i++] = pointColor[1];
        colors[i++] = pointColor[2];
        colors[i++] = pointColor[3];
        colors[i++] = pointColor[0];
        colors[i++] = pointColor[1];
        colors[i++] = pointColor[2];
        colors[i++] = pointColor[3];
      });
    });

    attribute.value = colors;
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const {paths, pointCount} = this.state;
    const pickingColors = new Uint8Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const pickingColor = this.encodePickingColor(index);
      path.forEach(() => {
        pickingColors[i++] = pickingColor[0];
        pickingColors[i++] = pickingColor[1];
        pickingColors[i++] = pickingColor[2];
        pickingColors[i++] = pickingColor[0];
        pickingColors[i++] = pickingColor[1];
        pickingColors[i++] = pickingColor[2];
      });
    });

    attribute.value = pickingColors;
  }

  _shiftPath(path, offset = 0) {
    const result = new Array(path.length);
    let point = path[0];
    for (let i = 0; i < path.length; i++) {
      point = path[i + offset] || point;
      result[i] = point;
    }
    return result;
  }
}

PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
