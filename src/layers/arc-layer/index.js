import BaseMapLayer from '../base-map-layer';
// Note: Shaders are inlined by the glslify browserify transform
const glslify = require('glslify');

export default class ArcLayer extends BaseMapLayer {
  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */
  constructor(opts) {
    super(opts);
  }

  update(deep) {
    if (deep || this._positionNeedUpdate) {
      this._allocateGlBuffers();
      this._calculatePositions();
    }
  }

  _getPrograms() {
    return {
      id: this.id,
      from: 'sources',
      vs: glslify('./vertex.glsl'),
      fs: glslify('./fragment.glsl')
    };
  }

  _getPrimitive() {
    let vertices = [];
    const NUM_SEGMENTS = 50;
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [...vertices, i, i, i];
    }

    return {
      id: this.id,
      drawType: 'LINE_STRIP',
      vertices: new Float32Array(vertices),
      instanced: true
    };
  }

  _getUniforms() {
    if (!this.data || this.data.length === 0) {
      return {};
    }

    return {
      color0: this.data[0].colors.c0,
      color1: this.data[0].colors.c1,
      opacity: this.opacity
    };
  }

  _getAttributes() {
    return {
      positions: {
        value: this.glBuffers.positions,
        instanced: 1,
        size: 4
      }
    };
  }

  _getOptions() {
    return {
      numInstances: this.numInstances,
      isPickable: this.isPickable
    };
  }

  _allocateGlBuffers() {
    this.glBuffers = {};
    this.glBuffers.positions = new Float32Array(this.numInstances * 4);
  }

  _calculatePositions() {
    this.data.forEach((trip, i) => {
      const position = trip.position;
      // -> screen coords
      const pixel0 = this.project([position.x0, position.y0]);
      const pixel1 = this.project([position.x1, position.y1]);
      // -> world coordinates
      const space0 = this.screenToSpace(pixel0.x, pixel0.y);
      const space1 = this.screenToSpace(pixel1.x, pixel1.y);

      this.glBuffers.positions[i * 4 + 0] = space0.x;
      this.glBuffers.positions[i * 4 + 1] = space0.y;
      this.glBuffers.positions[i * 4 + 2] = space1.x;
      this.glBuffers.positions[i * 4 + 3] = space1.y;
    });

    this._positionNeedUpdate = false;
  }

}
