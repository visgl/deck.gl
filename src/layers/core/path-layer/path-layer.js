import {Layer} from '../../../lib';
import {assembleShaders} from '../../../shader-utils';
import {fillArray} from '../../../lib/utils';
import {GL, Model, Geometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  opacity: 1,
  strokeWidth: 1,
  getPath: object => object.path,
  getColor: object => object.color,
  getWidth: object => object.width
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
      leftDeltas: {size: 3, update: this.calculateLeftDeltas},
      rightDeltas: {size: 3, update: this.calculateRightDeltas},
      directions: {size: 1, update: this.calculateDirections},
      colors: {size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateColors},
      pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors,
        noAlloc: true}
    });
  }

  updateState({oldProps, props, changeFlags}) {
    const {getPath} = this.props;
    const {attributeManager} = this.state;

    if (changeFlags.dataChanged) {
      // this.state.paths only stores point positions in each path
      const paths = props.data.map(getPath);

      let pointCount = 0;
      let indexCount = 0;

      paths.forEach(path => {
        const ptCount = path.length;
        pointCount += ptCount;
        // path.length - 1: n points => n-1 line segments
        // * 2 * 3: each segment is rendered as 2 triangles with 3 vertices
        indexCount += (ptCount - 1) * 2 * 3;
      });

      this.setState({paths, pointCount, indexCount});
      attributeManager.invalidateAll();
    }
  }

  draw({uniforms}) {
    this.state.model.render(Object.assign({}, uniforms, {
      opacity: this.props.opacity,
      thickness: this.props.strokeWidth,
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

    let i = 0;
    let offset = 0;
    paths.forEach((path, pathIndex) => {
      const ptCount = path.length;

      // counter-clockwise triangulation
      //
      //             0 |---| 2
      //  o---o  =>    o / o
      //             1 |---| 3
      //
      for (let ptIndex = 0; ptIndex < ptCount - 1; ptIndex++) {
        // triangle A with indices: 0, 1, 2
        indices[i++] = offset + 0;
        indices[i++] = offset + 1;
        indices[i++] = offset + 2;
        // triangle B with indices: 2, 1, 3
        indices[i++] = offset + 2;
        indices[i++] = offset + 1;
        indices[i++] = offset + 3;

        offset += 2;
      }
      offset += 2;
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
        positions.copyWithin(i, i - 3, i);
        i += 3;
      })
    );

    attribute.value = positions;
  }

  calculateLeftDeltas(attribute) {
    const {paths, pointCount} = this.state;

    const leftDeltas = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      path.forEach((point, index) => {
        const prevPoint = path[index - 1] || point;
        leftDeltas[i++] = point[0] - prevPoint[0];
        leftDeltas[i++] = point[1] - prevPoint[1];
        leftDeltas[i++] = (point[2] - prevPoint[2]) || 0;
        leftDeltas.copyWithin(i, i - 3, i);
        i += 3;
      });
    });

    attribute.value = leftDeltas;
  }

  calculateRightDeltas(attribute) {
    const {paths, pointCount} = this.state;
    
    const rightDeltas = new Float32Array(pointCount * attribute.size * 2);

    let i = 0;
    paths.forEach(path => {
      path.forEach((point, index) => {
        const nextPoint = path[index + 1] || point;
        rightDeltas[i++] = nextPoint[0] - point[0];
        rightDeltas[i++] = nextPoint[1] - point[1];
        rightDeltas[i++] = (nextPoint[2] - point[2]) || 0;
        rightDeltas.copyWithin(i, i - 3, i);
        i += 3;
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
      const count = path.length;
      fillArray({target: directions, source: [w, -w], start: i, count});
      i += count * 2;
    });

    attribute.value = directions;
  }

  calculateColors(attribute) {
    const {data, getColor} = this.props;
    const {paths, pointCount} = this.state;
    const {size} = attribute;
    const colors = new Uint8Array(pointCount * size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const pointColor = getColor(data[index], index) || DEFAULT_COLOR;
      if (isNaN(pointColor[3])) {
        pointColor[3] = 255;
      }
      const count = path.length * 2;
      fillArray({target: colors, source: pointColor, start: i, count});
      i += count * size;
    });

    attribute.value = colors;
  }

  // Override the default picking colors calculation
  calculatePickingColors(attribute) {
    const {paths, pointCount} = this.state;
    const {size} = attribute;
    const pickingColors = new Uint8Array(pointCount * size * 2);

    let i = 0;
    paths.forEach((path, index) => {
      const pickingColor = this.encodePickingColor(index);
      const count = path.length * 2;
      fillArray({target: pickingColors, source: pickingColor, start: i, count});
      i += count * size;
    });

    attribute.value = pickingColors;
  }

}

PathLayer.layerName = 'PathLayer';
PathLayer.defaultProps = defaultProps;
