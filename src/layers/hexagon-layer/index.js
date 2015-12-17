import BaseMapLayer from '../base-map-layer';
// Note: Shaders are inlined by the glslify browserify transform
const glslify = require('glslify');

function dist(a, b) {
  const diffX = a[0] - b[0];
  const diffY = a[1] - b[1];
  return Math.sqrt(diffX * diffX + diffY * diffY);
}

function sub(a, b) {
  return {
    x: a[0] - b[0],
    y: a[1] - b[1]
  };
}

export default class HexagonLayer extends BaseMapLayer {
  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   * @param {bool} opts.lightingEnabled - whether use lighting or not
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */
  constructor(opts) {
    super(opts);

    this.radius = opts.dotRadius || 10;
    this.elevation = opts.elevation || 101;
    this.lightingEnabled = opts.lightingEnabled ? 1.0 : 0.0;

    this.onObjectHovered = opts.onHexagonHovered;
    this.onObjectClicked = opts.onHexagonClicked;
  }

  update(deep) {
    if (deep || this._positionNeedUpdate) {
      this._allocateGlBuffers();
      this._calculatePositions();
    }
    this._calculateColors();
    this._calculateRadiusAndAngle();
    this._calculatePickingColors();
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
    const NUM_SEGMENTS = 6;
    const PI2 = Math.PI * 2;

    let vertices = [];
    for (let i = 0; i < NUM_SEGMENTS; i++) {
      vertices = [
        ...vertices,
        Math.cos(PI2 * i / NUM_SEGMENTS),
        Math.sin(PI2 * i / NUM_SEGMENTS),
        0
      ];
    }

    return {
      id: this.id,
      drawType: 'TRIANGLE_FAN',
      vertices: new Float32Array(vertices),
      instanced: true
    };
  }

  _getUniforms() {
    return {
      radius: this.radius,
      opacity: this.opacity,
      angle: this.angle
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

  _allocateGlBuffers(buffer) {
    this.glBuffers = {};
    this.glBuffers.positions = new Float32Array(this.numInstances * 3);
    this.glBuffers.colors = new Float32Array(this.numInstances * 3);
    this.glBuffers.pickingColors = new Float32Array(this.numInstances * 3);
  }

  _calculatePositions() {
    this.data.forEach((hexagon, i) => {
      const centroid = hexagon.centroid;
      // -> screen coords
      const pixel = this.project([centroid.x, centroid.y]);
      // -> world coordinates
      const space = this.screenToSpace(pixel.x, pixel.y);

      this.glBuffers.positions[i * 3 + 0] = space.x;
      this.glBuffers.positions[i * 3 + 1] = space.y;
      this.glBuffers.positions[i * 3 + 2] = this.elevation;
    });

    this._positionNeedUpdate = false;
  }

  _calculateColors() {
    this.data.forEach((hexagon, i) => {
      this.glBuffers.colors[i * 3 + 0] = hexagon.color.r;
      this.glBuffers.colors[i * 3 + 1] = hexagon.color.g;
      this.glBuffers.colors[i * 3 + 2] = hexagon.color.b;
    });
  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    for (let i = 0; i < this.numInstances; i++) {
      this.glBuffers.pickingColors[i * 3 + 0] = (i + 1) % 256;
      this.glBuffers.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
      this.glBuffers.pickingColors[i * 3 + 2] = this.layerIndex;
    }
  }

  _calculateRadiusAndAngle() {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const vertices = this.data[0].vertices;
    const vertex0 = vertices[0];
    const vertex3 = vertices[3];

    // transform to screen coords
    const pixel0 = this.project([vertex0[0], vertex0[1]]);
    const pixel3 = this.project([vertex3[0], vertex3[1]]);

    // map from screen coordinates to 3D world coordinates
    const space0 = this.screenToSpace(pixel0.x, pixel0.y);
    const space3 = this.screenToSpace(pixel3.x, pixel3.y);

    // Vector representing distance between two close centroids
    // Minimum distance between two hexagon centroids
    const subSpace = sub([space0.x, space0.y], [space3.x, space3.y]);
    const distSpace = dist([space0.x, space0.y], [space3.x, space3.y]);

    // Calculate angle that the perpendicular hexagon vertex axis is tilted
    this.angle = Math.acos(subSpace.x / distSpace) * -Math.sign(subSpace.y);

    // Allow user to fine tune radius
    this.radius = distSpace / 2 * Math.min(1, this.radius);
  }

}
