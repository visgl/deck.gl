'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseMapLayer = require('../base-map-layer');

var _baseMapLayer2 = _interopRequireDefault(_baseMapLayer);

var _earcut = require('earcut');

var _earcut2 = _interopRequireDefault(_earcut);

var _lodash = require('lodash.flattendeep');

var _lodash2 = _interopRequireDefault(_lodash);

var _geojsonNormalize = require('geojson-normalize');

var _geojsonNormalize2 = _interopRequireDefault(_geojsonNormalize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var glslify = require('glslify');

var ChoroplethLayer = function (_BaseMapLayer) {
  _inherits(ChoroplethLayer, _BaseMapLayer);

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

  function ChoroplethLayer(opts) {
    _classCallCheck(this, ChoroplethLayer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChoroplethLayer).call(this, opts));

    _this.drawContour = opts.drawContour;

    _this.onObjectHovered = _this._onChoroplethHovered;
    _this.onObjectClicked = _this._onChoroplethClicked;
    return _this;
  }

  _createClass(ChoroplethLayer, [{
    key: 'updateLayer',
    value: function updateLayer() {
      if (this.dataChanged) {
        this._allocateGLBuffers();
        this._extractChoropleths();
        this._calculateVertices();
        this._calculateIndices();
        this._calculateColors();
        this._calculatePickingColors();
      }

      // TODO change getters to setters
      this._primitive = this.getLayerPrimitive();
      this.setLayerUniforms();
      this.setLayerAttributes();
    }
  }, {
    key: 'getLayerShader',
    value: function getLayerShader() {
      return {
        id: this.id,
        from: 'sources',
        vs: glslify('./vertex.glsl'),
        fs: glslify('./fragment.glsl')
      };
    }
  }, {
    key: 'getLayerPrimitive',
    value: function getLayerPrimitive() {
      if (!this.cache || !this.cache.indices) {
        return {};
      }

      return {
        id: this.id,
        drawType: this.drawContour ? 'LINES' : 'TRIANGLES',
        indices: this.cache.indices,
        instanced: false
      };
    }
  }, {
    key: 'setLayerUniforms',
    value: function setLayerUniforms() {
      this._uniforms = _extends({}, this._uniforms, {
        opacity: this.opacity
      });
    }
  }, {
    key: 'setLayerAttributes',
    value: function setLayerAttributes() {
      this._attributes = _extends({}, this.attribute, {
        vertices: {
          value: this.cache.vertices,
          size: 3
        },
        colors: {
          value: this.cache.colors,
          size: 3
        }
      });

      if (!this.isPickable) {
        return;
      }

      this._attributes.pickingColors = {
        value: this.cache.pickingColors,
        instanced: 1,
        size: 3
      };
    }
  }, {
    key: '_allocateGLBuffers',
    value: function _allocateGLBuffers() {
      var N = this._numInstances;

      this.cache.positions = new Float32Array(N * 3);
      this.cache.colors = new Float32Array(N * 3);

      if (!this.isPickable) {
        return;
      }

      this.cache.pickingColors = new Float32Array(N * 3);
    }
  }, {
    key: '_extractChoropleths',
    value: function _extractChoropleths() {
      if (this.cache.choropleths) {
        return;
      }

      var normalizedGeojson = (0, _geojsonNormalize2.default)(this.data);

      this.cache.choropleths = normalizedGeojson.features.map(function (choropleth) {
        var coordinates = choropleth.geometry.coordinates[0];
        // flatten nested polygons
        if (coordinates.length === 1 && coordinates[0].length > 2) {
          coordinates = coordinates[0];
        }
        return {
          properties: choropleth.properties,
          coordinates: coordinates
        };
      });
    }
  }, {
    key: '_calculateVertices',
    value: function _calculateVertices() {
      this.cache.groupedVertices = this.cache.choropleths.map(function (choropleth) {
        return choropleth.coordinates.map(function (coordinate) {
          return [coordinate[0], coordinate[1], 100];
        });
      });

      var vertices = (0, _lodash2.default)(this.cache.groupedVertices);
      this.cache.vertices = new Float32Array(vertices);
    }
  }, {
    key: '_calculateIndices',
    value: function _calculateIndices() {
      var _this2 = this;

      // adjust index offset for multiple choropleths
      var offsets = this.cache.groupedVertices.reduce(function (acc, vertices) {
        return [].concat(_toConsumableArray(acc), [acc[acc.length - 1] + vertices.length]);
      }, [0]);

      var indices = this.cache.groupedVertices.map(function (vertices, choroplethIndex) {
        return _this2.drawContour ?
        // 1. get sequentially ordered indices of each choropleth contour
        // 2. offset them by the number of indices in previous choropleths
        _this2._calculateContourIndices(vertices.length).map(function (index) {
          return index + offsets[choroplethIndex];
        }) :
        // 1. get triangulated indices for the internal areas
        // 2. offset them by the number of indices in previous choropleths
        (0, _earcut2.default)((0, _lodash2.default)(vertices), null, 3).map(function (index) {
          return index + offsets[choroplethIndex];
        });
      });

      this.cache.indices = new Uint16Array((0, _lodash2.default)(indices));
    }
  }, {
    key: '_calculateColors',
    value: function _calculateColors() {
      var _this3 = this;

      var colors = this.cache.groupedVertices.map(function (vertices) {
        return vertices.map(function (vertex) {
          return _this3.drawContour ? [0, 0, 0] : [128, 128, 128];
        });
      });

      this.cache.colors = new Float32Array((0, _lodash2.default)(colors));
    }
  }, {
    key: '_calculatePickingColors',
    value: function _calculatePickingColors() {
      var _this4 = this;

      if (!this.isPickable) {
        return;
      }

      var pickingColors = this.cache.vertices.map(function (vertices, choroplethIndex) {
        return vertices.map(function (vertex) {
          return _this4.drawContour ? [-1, -1, -1] : [(choroplethIndex + 1) % 256, Math.floor((choroplethIndex + 1) / 256) % 256, _this4.layerIndex];
        });
      });

      this.cache.pickingColors = new Float32Array((0, _lodash2.default)(pickingColors));
    }
  }, {
    key: '_calculateContourIndices',
    value: function _calculateContourIndices(numVertices) {
      // use vertex pairs for gl.LINES => [0, 1, 1, 2, 2, ..., n-1, n-1, 0]
      var indices = [];
      for (var i = 1; i < numVertices - 1; i++) {
        indices = [].concat(_toConsumableArray(indices), [i, i]);
      }
      return [0].concat(_toConsumableArray(indices), [0]);
    }
  }, {
    key: '_onChoroplethHovered',
    value: function _onChoroplethHovered(index, layerIndex, e) {
      if (layerIndex !== this.layerIndex) {
        return;
      }
      var choroplethProps = this.data.features[index].properties;
      this.opts.onChoroplethHovered(choroplethProps, e);
    }
  }, {
    key: '_onChoroplethClicked',
    value: function _onChoroplethClicked(index, layerIndex, e) {
      if (layerIndex !== this.layerIndex) {
        return;
      }
      var choroplethProps = this.data.features[index].properties;
      this.opts.onChoroplethClicked(choroplethProps, e);
    }
  }]);

  return ChoroplethLayer;
}(_baseMapLayer2.default);

exports.default = ChoroplethLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvY2hvcm9wbGV0aC1sYXllci9vbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0lBRWU7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhbkIsV0FibUIsZUFhbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQWJDLGlCQWFEOzt1RUFiQyw0QkFjWCxPQURVOztBQUdoQixVQUFLLFdBQUwsR0FBbUIsS0FBSyxXQUFMLENBSEg7O0FBS2hCLFVBQUssZUFBTCxHQUF1QixNQUFLLG9CQUFMLENBTFA7QUFNaEIsVUFBSyxlQUFMLEdBQXVCLE1BQUssb0JBQUwsQ0FOUDs7R0FBbEI7O2VBYm1COztrQ0FzQkw7QUFDWixVQUFJLEtBQUssV0FBTCxFQUFrQjtBQUNwQixhQUFLLGtCQUFMLEdBRG9CO0FBRXBCLGFBQUssbUJBQUwsR0FGb0I7QUFHcEIsYUFBSyxrQkFBTCxHQUhvQjtBQUlwQixhQUFLLGlCQUFMLEdBSm9CO0FBS3BCLGFBQUssZ0JBQUwsR0FMb0I7QUFNcEIsYUFBSyx1QkFBTCxHQU5vQjtPQUF0Qjs7O0FBRFksVUFXWixDQUFLLFVBQUwsR0FBa0IsS0FBSyxpQkFBTCxFQUFsQixDQVhZO0FBWVosV0FBSyxnQkFBTCxHQVpZO0FBYVosV0FBSyxrQkFBTCxHQWJZOzs7O3FDQWdCRztBQUNmLGFBQU87QUFDTCxZQUFJLEtBQUssRUFBTDtBQUNKLGNBQU0sU0FBTjtBQUNBLFlBQUksUUFBUSxlQUFSLENBQUo7QUFDQSxZQUFJLFFBQVEsaUJBQVIsQ0FBSjtPQUpGLENBRGU7Ozs7d0NBU0c7QUFDbEIsVUFBSSxDQUFDLEtBQUssS0FBTCxJQUFjLENBQUMsS0FBSyxLQUFMLENBQVcsT0FBWCxFQUFvQjtBQUN0QyxlQUFPLEVBQVAsQ0FEc0M7T0FBeEM7O0FBSUEsYUFBTztBQUNMLFlBQUks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LEtBQUwsQ0FBVyxDQUFDLGtCQUFrQixDQUFsQixDQUFELEdBQXdCLEdBQXhCLENBQVgsR0FBMEMsR0FBMUMsRUFDQSxPQUFLLFVBQUwsQ0FIUTtTQUFWO09BREYsQ0FESSxDQUxrQjs7QUFleEIsV0FBSyxLQUFMLENBQVcsYUFBWCxHQUEyQixJQUFJLFlBQUosQ0FBaUIsc0JBQVksYUFBWixDQUFqQixDQUEzQixDQWZ3Qjs7Ozs2Q0FrQkQsYUFBYTs7QUFFcEMsVUFBSSxVQUFVLEVBQVYsQ0FGZ0M7QUFHcEMsV0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksY0FBYyxDQUFkLEVBQWlCLEdBQXJDLEVBQTBDO0FBQ3hDLCtDQUFjLFdBQVMsR0FBRyxHQUExQixDQUR3QztPQUExQztBQUdBLGNBQVEsNkJBQU0sV0FBUyxHQUF2QixDQU5vQzs7Ozt5Q0FTakIsT0FBTyxZQUFZLEdBQUc7QUFDekMsVUFBSSxlQUFlLEtBQUssVUFBTCxFQUFpQjtBQUNsQyxlQURrQztPQUFwQztBQUdBLFVBQU0sa0JBQWtCLEtBQUssSUFBTCxDQUFVLFFBQVYsQ0FBbUIsS0FBbkIsRUFBMEIsVUFBMUIsQ0FKaUI7QUFLekMsV0FBSyxJQUFMLENBQVUsbUJBQVYsQ0FBOEIsZUFBOUIsRUFBK0MsQ0FBL0MsRUFMeUM7Ozs7eUNBUXRCLE9BQU8sWUFBWSxHQUFHO0FBQ3pDLFVBQUksZUFBZSxLQUFLLFVBQUwsRUFBaUI7QUFDbEMsZUFEa0M7T0FBcEM7QUFHQSxVQUFNLGtCQUFrQixLQUFLLElBQUwsQ0FBVSxRQUFWLENBQW1CLEtBQW5CLEVBQTBCLFVBQTFCLENBSmlCO0FBS3pDLFdBQUssSUFBTCxDQUFVLG1CQUFWLENBQThCLGVBQTlCLEVBQStDLENBQS9DLEVBTHlDOzs7O1NBNU14QiIsImZpbGUiOiJvbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgQmFzZU1hcExheWVyIGZyb20gJy4uL2Jhc2UtbWFwLWxheWVyJztcbmltcG9ydCBlYXJjdXQgZnJvbSAnZWFyY3V0JztcbmltcG9ydCBmbGF0dGVuRGVlcCBmcm9tICdsb2Rhc2guZmxhdHRlbmRlZXAnO1xuaW1wb3J0IG5vcm1hbGl6ZSBmcm9tICdnZW9qc29uLW5vcm1hbGl6ZSc7XG5cbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENob3JvcGxldGhMYXllciBleHRlbmRzIEJhc2VNYXBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIENob3JvcGxldGhMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICogQHBhcmFtIHtib29sfSBvcHRzLmRyYXdDb250b3VyIC0gPyBkcmF3Q29udG91ciA6IGRyYXdBcmVhXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25DaG9yb3BsZXRoSG92ZXJlZCAtIHByb3ZpZGUgcHJvZXJ0aWVzIG9mIHRoZVxuICAgKiBzZWxlY3RlZCBjaG9yb3BsZXRoLCB0b2dldGhlciB3aXRoIHRoZSBtb3VzZSBldmVudCB3aGVuIG1vdXNlIGhvdmVyZWRcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkNob3JvcGxldGhDbGlja2VkIC0gcHJvdmlkZSBwcm9lcnRpZXMgb2YgdGhlXG4gICAqIHNlbGVjdGVkIGNob3JvcGxldGgsIHRvZ2V0aGVyIHdpdGggdGhlIG1vdXNlIGV2ZW50IHdoZW4gbW91c2UgY2xpY2tlZFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKG9wdHMpO1xuXG4gICAgdGhpcy5kcmF3Q29udG91ciA9IG9wdHMuZHJhd0NvbnRvdXI7XG5cbiAgICB0aGlzLm9uT2JqZWN0SG92ZXJlZCA9IHRoaXMuX29uQ2hvcm9wbGV0aEhvdmVyZWQ7XG4gICAgdGhpcy5vbk9iamVjdENsaWNrZWQgPSB0aGlzLl9vbkNob3JvcGxldGhDbGlja2VkO1xuICB9XG5cbiAgdXBkYXRlTGF5ZXIoKSB7XG4gICAgaWYgKHRoaXMuZGF0YUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX2FsbG9jYXRlR0xCdWZmZXJzKCk7XG4gICAgICB0aGlzLl9leHRyYWN0Q2hvcm9wbGV0aHMoKTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVZlcnRpY2VzKCk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVJbmRpY2VzKCk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVDb2xvcnMoKTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGNoYW5nZSBnZXR0ZXJzIHRvIHNldHRlcnNcbiAgICB0aGlzLl9wcmltaXRpdmUgPSB0aGlzLmdldExheWVyUHJpbWl0aXZlKCk7XG4gICAgdGhpcy5zZXRMYXllclVuaWZvcm1zKCk7XG4gICAgdGhpcy5zZXRMYXllckF0dHJpYnV0ZXMoKTtcbiAgfVxuXG4gIGdldExheWVyU2hhZGVyKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGZyb206ICdzb3VyY2VzJyxcbiAgICAgIHZzOiBnbHNsaWZ5KCcuL3ZlcnRleC5nbHNsJyksXG4gICAgICBmczogZ2xzbGlmeSgnLi9mcmFnbWVudC5nbHNsJylcbiAgICB9O1xuICB9XG5cbiAgZ2V0TGF5ZXJQcmltaXRpdmUoKSB7XG4gICAgaWYgKCF0aGlzLmNhY2hlIHx8ICF0aGlzLmNhY2hlLmluZGljZXMpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkcmF3VHlwZTogdGhpcy5kcmF3Q29udG91ciA/ICdMSU5FUycgOiAnVFJJQU5HTEVTJyxcbiAgICAgIGluZGljZXM6IHRoaXMuY2FjaGUuaW5kaWNlcyxcbiAgICAgIGluc3RhbmNlZDogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgc2V0TGF5ZXJVbmlmb3JtcygpIHtcbiAgICB0aGlzLl91bmlmb3JtcyA9IHtcbiAgICAgIC4uLnRoaXMuX3VuaWZvcm1zLFxuICAgICAgb3BhY2l0eTogdGhpcy5vcGFjaXR5XG4gICAgfTtcbiAgfVxuXG4gIHNldExheWVyQXR0cmlidXRlcygpIHtcbiAgICB0aGlzLl9hdHRyaWJ1dGVzID0ge1xuICAgICAgLi4udGhpcy5hdHRyaWJ1dGUsXG4gICAgICB2ZXJ0aWNlczoge1xuICAgICAgICB2YWx1ZTogdGhpcy5jYWNoZS52ZXJ0aWNlcyxcbiAgICAgICAgc2l6ZTogM1xuICAgICAgfSxcbiAgICAgIGNvbG9yczoge1xuICAgICAgICB2YWx1ZTogdGhpcy5jYWNoZS5jb2xvcnMsXG4gICAgICAgIHNpemU6IDNcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmlzUGlja2FibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9hdHRyaWJ1dGVzLnBpY2tpbmdDb2xvcnMgPSB7XG4gICAgICB2YWx1ZTogdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzLFxuICAgICAgaW5zdGFuY2VkOiAxLFxuICAgICAgc2l6ZTogM1xuICAgIH07XG4gIH1cblxuICBfYWxsb2NhdGVHTEJ1ZmZlcnMoKSB7XG4gICAgY29uc3QgTiA9IHRoaXMuX251bUluc3RhbmNlcztcblxuICAgIHRoaXMuY2FjaGUucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShOICogMyk7XG4gICAgdGhpcy5jYWNoZS5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KE4gKiAzKTtcblxuICAgIGlmICghdGhpcy5pc1BpY2thYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShOICogMyk7XG4gIH1cblxuICBfZXh0cmFjdENob3JvcGxldGhzKCkge1xuICAgIGlmICh0aGlzLmNhY2hlLmNob3JvcGxldGhzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgbm9ybWFsaXplZEdlb2pzb24gPSBub3JtYWxpemUodGhpcy5kYXRhKTtcblxuICAgIHRoaXMuY2FjaGUuY2hvcm9wbGV0aHMgPSBub3JtYWxpemVkR2VvanNvbi5mZWF0dXJlcy5tYXAoY2hvcm9wbGV0aCA9PiB7XG4gICAgICBsZXQgY29vcmRpbmF0ZXMgPSBjaG9yb3BsZXRoLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdO1xuICAgICAgLy8gZmxhdHRlbiBuZXN0ZWQgcG9seWdvbnNcbiAgICAgIGlmIChjb29yZGluYXRlcy5sZW5ndGggPT09IDEgJiYgY29vcmRpbmF0ZXNbMF0ubGVuZ3RoID4gMikge1xuICAgICAgICBjb29yZGluYXRlcyA9IGNvb3JkaW5hdGVzWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJvcGVydGllczogY2hvcm9wbGV0aC5wcm9wZXJ0aWVzLFxuICAgICAgICBjb29yZGluYXRlc1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIF9jYWxjdWxhdGVWZXJ0aWNlcygpIHtcbiAgICB0aGlzLmNhY2hlLmdyb3VwZWRWZXJ0aWNlcyA9IHRoaXMuY2FjaGUuY2hvcm9wbGV0aHMubWFwKFxuICAgICAgY2hvcm9wbGV0aCA9PiBjaG9yb3BsZXRoLmNvb3JkaW5hdGVzLm1hcChcbiAgICAgICAgY29vcmRpbmF0ZSA9PiBbY29vcmRpbmF0ZVswXSwgY29vcmRpbmF0ZVsxXSwgMTAwXVxuICAgICAgKVxuICAgICk7XG5cbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGZsYXR0ZW5EZWVwKHRoaXMuY2FjaGUuZ3JvdXBlZFZlcnRpY2VzKTtcbiAgICB0aGlzLmNhY2hlLnZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyk7XG4gIH1cblxuICBfY2FsY3VsYXRlSW5kaWNlcygpIHtcbiAgICAvLyBhZGp1c3QgaW5kZXggb2Zmc2V0IGZvciBtdWx0aXBsZSBjaG9yb3BsZXRoc1xuICAgIGNvbnN0IG9mZnNldHMgPSB0aGlzLmNhY2hlLmdyb3VwZWRWZXJ0aWNlcy5yZWR1Y2UoXG4gICAgICAoYWNjLCB2ZXJ0aWNlcykgPT4gWy4uLmFjYywgYWNjW2FjYy5sZW5ndGggLSAxXSArIHZlcnRpY2VzLmxlbmd0aF0sXG4gICAgICBbMF1cbiAgICApO1xuXG4gICAgY29uc3QgaW5kaWNlcyA9IHRoaXMuY2FjaGUuZ3JvdXBlZFZlcnRpY2VzLm1hcChcbiAgICAgICh2ZXJ0aWNlcywgY2hvcm9wbGV0aEluZGV4KSA9PiB0aGlzLmRyYXdDb250b3VyID9cbiAgICAgICAgLy8gMS4gZ2V0IHNlcXVlbnRpYWxseSBvcmRlcmVkIGluZGljZXMgb2YgZWFjaCBjaG9yb3BsZXRoIGNvbnRvdXJcbiAgICAgICAgLy8gMi4gb2Zmc2V0IHRoZW0gYnkgdGhlIG51bWJlciBvZiBpbmRpY2VzIGluIHByZXZpb3VzIGNob3JvcGxldGhzXG4gICAgICAgIHRoaXMuX2NhbGN1bGF0ZUNvbnRvdXJJbmRpY2VzKHZlcnRpY2VzLmxlbmd0aCkubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgICkgOlxuICAgICAgICAvLyAxLiBnZXQgdHJpYW5ndWxhdGVkIGluZGljZXMgZm9yIHRoZSBpbnRlcm5hbCBhcmVhc1xuICAgICAgICAvLyAyLiBvZmZzZXQgdGhlbSBieSB0aGUgbnVtYmVyIG9mIGluZGljZXMgaW4gcHJldmlvdXMgY2hvcm9wbGV0aHNcbiAgICAgICAgZWFyY3V0KGZsYXR0ZW5EZWVwKHZlcnRpY2VzKSwgbnVsbCwgMykubWFwKFxuICAgICAgICAgIGluZGV4ID0+IGluZGV4ICsgb2Zmc2V0c1tjaG9yb3BsZXRoSW5kZXhdXG4gICAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5jYWNoZS5pbmRpY2VzID0gbmV3IFVpbnQxNkFycmF5KGZsYXR0ZW5EZWVwKGluZGljZXMpKTtcbiAgfVxuXG4gIF9jYWxjdWxhdGVDb2xvcnMoKSB7XG4gICAgY29uc3QgY29sb3JzID0gdGhpcy5jYWNoZS5ncm91cGVkVmVydGljZXMubWFwKFxuICAgICAgdmVydGljZXMgPT4gdmVydGljZXMubWFwKFxuICAgICAgICB2ZXJ0ZXggPT4gdGhpcy5kcmF3Q29udG91ciA/IFswLCAwLCAwXSA6IFsxMjgsIDEyOCwgMTI4XVxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLmNhY2hlLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbkRlZXAoY29sb3JzKSk7XG4gIH1cblxuICBfY2FsY3VsYXRlUGlja2luZ0NvbG9ycygpIHtcbiAgICBpZiAoIXRoaXMuaXNQaWNrYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBpY2tpbmdDb2xvcnMgPSB0aGlzLmNhY2hlLnZlcnRpY2VzLm1hcChcbiAgICAgICh2ZXJ0aWNlcywgY2hvcm9wbGV0aEluZGV4KSA9PiB2ZXJ0aWNlcy5tYXAoXG4gICAgICAgIHZlcnRleCA9PiB0aGlzLmRyYXdDb250b3VyID8gWy0xLCAtMSwgLTFdIDogW1xuICAgICAgICAgIChjaG9yb3BsZXRoSW5kZXggKyAxKSAlIDI1NixcbiAgICAgICAgICBNYXRoLmZsb29yKChjaG9yb3BsZXRoSW5kZXggKyAxKSAvIDI1NikgJSAyNTYsXG4gICAgICAgICAgdGhpcy5sYXllckluZGV4XG4gICAgICAgIF1cbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzID0gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuRGVlcChwaWNraW5nQ29sb3JzKSk7XG4gIH1cblxuICBfY2FsY3VsYXRlQ29udG91ckluZGljZXMobnVtVmVydGljZXMpIHtcbiAgICAvLyB1c2UgdmVydGV4IHBhaXJzIGZvciBnbC5MSU5FUyA9PiBbMCwgMSwgMSwgMiwgMiwgLi4uLCBuLTEsIG4tMSwgMF1cbiAgICBsZXQgaW5kaWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtVmVydGljZXMgLSAxOyBpKyspIHtcbiAgICAgIGluZGljZXMgPSBbLi4uaW5kaWNlcywgaSwgaV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgLi4uaW5kaWNlcywgMF07XG4gIH1cblxuICBfb25DaG9yb3BsZXRoSG92ZXJlZChpbmRleCwgbGF5ZXJJbmRleCwgZSkge1xuICAgIGlmIChsYXllckluZGV4ICE9PSB0aGlzLmxheWVySW5kZXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY2hvcm9wbGV0aFByb3BzID0gdGhpcy5kYXRhLmZlYXR1cmVzW2luZGV4XS5wcm9wZXJ0aWVzO1xuICAgIHRoaXMub3B0cy5vbkNob3JvcGxldGhIb3ZlcmVkKGNob3JvcGxldGhQcm9wcywgZSk7XG4gIH1cblxuICBfb25DaG9yb3BsZXRoQ2xpY2tlZChpbmRleCwgbGF5ZXJJbmRleCwgZSkge1xuICAgIGlmIChsYXllckluZGV4ICE9PSB0aGlzLmxheWVySW5kZXgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY2hvcm9wbGV0aFByb3BzID0gdGhpcy5kYXRhLmZlYXR1cmVzW2luZGV4XS5wcm9wZXJ0aWVzO1xuICAgIHRoaXMub3B0cy5vbkNob3JvcGxldGhDbGlja2VkKGNob3JvcGxldGhQcm9wcywgZSk7XG4gIH1cblxufVxuIl19