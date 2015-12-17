import BaseMapLayer from '../base-map-layer';
import earcut from 'earcut';
import flattenDeep from 'lodash.flattendeep';
// Note: Shaders are inlined by the glslify browserify transform
const glslify = require('glslify');

export default class ChoroplethLayer extends BaseMapLayer {
  /**
   * @classdesc
   * ChoroplethLayer
   *
   * @class
   * @param {object} opts
   * @param {bool} opts.drawContour - ? drawContour : drawArea
   * @param {function} opts.onChoroplethHovered - provide proerties of the
   * selected choropleth, together with the mouse event when mouse hovered
   * @param {function} opts.onChoroplethClicked - provide proerties of the
   * selected choropleth, together with the mouse event when mouse clicked
   */
  constructor(opts) {
    super(opts);

    this.drawContour = opts.drawContour;

    this.onObjectHovered = this._onChoroplethHovered;
    this.onObjectClicked = this._onChoroplethClicked;

    this.opts = {...opts};
  }

  update(deep) {
    if (deep || this._positionNeedUpdate) {
      this._allocateGlBuffers();

      this._extractChoropleths();
      this._calculateVertices();
      this._calculateIndices();
      this._calculateColors();
      this._calculatePickingColors();

      this._positionNeedUpdate = false;
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
      drawType: this.drawContour ? 'LINES' : 'TRIANGLES',
      indices: this.glBuffers.indices,
      instanced: false
    };
  }

  _getUniforms() {
    return {
      opacity: this.opacity
    };
  }

  _getAttributes() {
    return {
      vertices: {
        value: this.glBuffers.vertices,
        size: 3
      },
      colors: {
        value: this.glBuffers.colors,
        size: 3
      },
      pickingColors: {
        value: this.glBuffers.pickingColors,
        size: 3
      }
    };
  }

  _getOptions() {
    return {
      numInstances: 0,
      isPickable: this.isPickable
    };
  }

  _allocateGlBuffers() {
    this.glBuffers = {};
  }

  _extractChoropleths() {
    if (this.data.type === 'GeometryCollection') {
      this.choropleths = this.data.geometries.map(choropleth => {
        let coordinates = choropleth.coordinates;
        // flatten nested polygons
        if (coordinates.length === 1 && coordinates[0].length > 2) {
          coordinates = coordinates[0];
        }
        return {
          id: choropleth.zip,
          name: choropleth.zip,
          coordinates
        };
      });
    } else if (this.data.type === 'FeatureCollection') {
      this.choropleths = this.data.features.map(choropleth => {
        let coordinates = choropleth.geometry.coordinates[0];
        // flatten nested polygons
        if (coordinates.length === 1 && coordinates[0].length > 2) {
          coordinates = coordinates[0];
        }
        return {
          id: choropleth.id,
          name: choropleth.properties.name,
          coordinates
        };
      });
    }
  }

  _calculateVertices() {
    this.vertices = this.choropleths.map(
      choropleth => choropleth.coordinates.map(
        coordinate => {
          const pixel = this.project([coordinate[1], coordinate[0]]);
          const space = this.screenToSpace(pixel.x, pixel.y);
          return [space.x, space.y, 100];
        }
      )
    );

    this.glBuffers.vertices = new Float32Array(flattenDeep(this.vertices));
  }

  _calculateIndices() {
    // adjust index offset for multiple choropleths
    const offsets = this.vertices.reduce(
      (acc, vertices) => [...acc, acc[acc.length - 1] + vertices.length],
      [0]
    );

    const indices = this.vertices.map(
      (vertices, choroplethIndex) => this.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        this._calculateContourIndices(vertices.length).map(
          index => index + offsets[choroplethIndex]
        ) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        earcut(flattenDeep(vertices), null, 3).map(
          index => index + offsets[choroplethIndex]
        )
    );

    this.glBuffers.indices = new Uint16Array(flattenDeep(indices));
  }

  _calculateColors() {
    const colors = this.vertices.map(
      vertices => vertices.map(
        vertex => this.drawContour ? [0, 0, 0] : [128, 128, 128]
      )
    );

    this.glBuffers.colors = new Float32Array(flattenDeep(colors));
  }

  _calculatePickingColors() {
    const pickingColors = this.vertices.map(
      (vertices, choroplethIndex) => vertices.map(
        vertex => this.drawContour ? [-1, -1, -1] : [
          (choroplethIndex + 1) % 256,
          Math.floor((choroplethIndex + 1) / 256) % 256,
          this.layerIndex
        ]
      )
    );

    this.glBuffers.pickingColors = new Float32Array(flattenDeep(pickingColors));
  }

  _calculateContourIndices(numVertices) {
    // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
    let indices = [];
    for (var i = 1; i < numVertices - 1; i++) {
      indices = [...indices, i, i];
    }
    return [0, ...indices, 0];
  }

  _onChoroplethHovered(index, layerIndex, e) {
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = this.data.features[index].properties;
    this.opts.onChoroplethHovered(choroplethProps, e);
  }

  _onChoroplethClicked(index, layerIndex, e) {
    if (layerIndex !== this.layerIndex) {
      return;
    }
    const choroplethProps = this.data.features[index].properties;
    this.opts.onChoroplethClicked(choroplethProps, e);
  }

}
