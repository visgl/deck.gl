import BaseMapLayer from '../base-map-layer';
// Note: Shaders are inlined by the glslify browserify transform
const glslify = require('glslify');

export default class GridLayer extends BaseMapLayer {
  /**
   * @classdesc
   * GridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */
  constructor(opts) {
    super(opts);

    this.unitWidth = opts.unitWidth || 100;
    this.unitHeight = opts.unitHeight || 100;
    this.opacity = opts.opacity || 0.01;
  }

  update(deep) {
    if (deep || this._positionNeedUpdate) {
      this._allocateGlBuffers();
      this._calculatePositions();
      this._calculateColors();
      this._calculatePickingColors();
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
    return {
      id: this.id,
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]),
      instanced: true
    };
  }

  _getUniforms() {
    return {
      opacity: this.opacity,
      radius: this.unitWidth / 2 - 2,
      scale: this.scale
    };
  }

  _getAttributes() {
    return {
      positions: {
        value: this.glBuffers.positions,
        instanced: 1,
        size: 3
      },
      colors: {
        value: this.glBuffers.colors,
        instanced: 1,
        size: 3
      },
      pickingColors: this.isPickable ? {
        value: this.glBuffers.pickingColors,
        instanced: 1,
        size: 3
      } : null
    };
  }

  _getOptions() {
    return {
      numInstances: this.numInstances,
      isPickable: this.isPickable
    };
  }

  _allocateGlBuffers() {
    const halfScreenWidth = this.width + this.unitWidth / 2;
    const halfScreenHeight = this.height + this.unitHeight / 2;

    this.numCol = Math.ceil(halfScreenWidth / this.unitWidth) * 2;
    this.numRow = Math.ceil(halfScreenHeight / this.unitHeight) * 2;
    this.numInstances = this.numCol * this.numRow;

    this.glBuffers = {};
    this.glBuffers.positions = new Float32Array(this.numInstances * 3);
    this.glBuffers.colors = new Float32Array(this.numInstances * 3);
    this.glBuffers.colors.fill(0);

    if (this.isPickable) {
      this.glBuffers.pickingColors = new Float32Array(this.numInstances * 3);
    }
  }

  _calculatePositions() {
    for (let y = 0; y < this.numRow; y++) {
      for (let x = 0; x < this.numCol; x++) {
        const i3 = (x + y * this.numCol) * 3;
        this.glBuffers.positions[i3 + 0] = x * this.unitWidth - this.width;
        this.glBuffers.positions[i3 + 1] = y * this.unitHeight - this.height;
        this.glBuffers.positions[i3 + 2] = 0;
      }
    }

    this._positionNeedUpdate = false;
  }

  _calculateColors() {
    this.data.forEach(point => {
      const position = point.position;
      const pixel = this.project([position.x, point.position.y]);
      const space = this.screenToSpace(pixel.x, pixel.y);

      let xOffset = Math.abs(space.x) + this.unitWidth / 2;
      let yOffset = Math.abs(space.y) + this.unitHeight / 2;

      xOffset = space.x < 0 ? -xOffset : xOffset;
      yOffset = space.y < 0 ? -yOffset : yOffset;

      xOffset += this.width;
      yOffset += this.height;

      const colId = Math.floor(xOffset / this.unitWidth + 0.5);
      const rowId = Math.floor(yOffset / this.unitHeight + 0.5);

      const i3 = (colId + rowId * this.numCol) * 3;
      this.glBuffers.colors[i3 + 0] += 1;
      this.glBuffers.colors[i3 + 1] += 1;
      this.glBuffers.colors[i3 + 2] += 1;
    });

    this.scale = Math.max(...this.glBuffers.colors);
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    for (let y = 0; y < this.numRow; y++) {
      for (let x = 0; x < this.numCol; x++) {
        const i = x + y * this.numCol;
        this.glBuffers.pickingColors[i * 3 + 0] = (i + 1) % 256;
        this.glBuffers.pickingColors[i * 3 + 1] =
          Math.floor((i + 1) / 256) % 256;
        this.glBuffers.pickingColors[i * 3 + 2] = this.layerIndex;
      }
    }
  }

}
