'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _baseMapLayer = require('../base-map-layer');

var _baseMapLayer2 = _interopRequireDefault(_baseMapLayer);

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

var HexagonLayer = function (_BaseMapLayer) {
  _inherits(HexagonLayer, _BaseMapLayer);

  /**
   * @classdesc
   * HexagonLayer
   *
   * @class
   * @param {object} opts
   *
   * @param {number} opts.dotRadius - hexagon radius
   * @param {number} opts.elevation - hexagon height
   *
   * @param {function} opts.onHexagonHovered(index, e) - popup selected index
   * @param {function} opts.onHexagonClicked(index, e) - popup selected index
   */

  function HexagonLayer(opts) {
    _classCallCheck(this, HexagonLayer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HexagonLayer).call(this, opts));

    _this.radius = opts.dotRadius || 10;
    _this.elevation = opts.elevation || 101;

    _this.onObjectHovered = opts.onHexagonHovered;
    _this.onObjectClicked = opts.onHexagonClicked;
    return _this;
  }

  _createClass(HexagonLayer, [{
    key: 'updateLayer',
    value: function updateLayer() {
      if (this.dataChanged) {
        this._allocateGLBuffers();
        this._calculatePositions();
        this._calculateColors();
        this._calculatePickingColors();
      }

      if (this.viewportChanged || this.dataChanged) {
        this._calculateRadiusAndAngle();
      }

      this.setLayerUniforms();
      this.setLayerAttributes();

      this.dataChanged = false;
      this.viewportChanged = false;
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
      var NUM_SEGMENTS = 6;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return {
        id: this.id,
        drawType: 'TRIANGLE_FAN',
        vertices: new Float32Array(vertices),
        instanced: true
      };
    }
  }, {
    key: 'setLayerUniforms',
    value: function setLayerUniforms() {
      this._uniforms = _extends({}, this._uniforms, {
        radius: this.cache.radius,
        angle: this.cache.angle
      });
    }
  }, {
    key: 'setLayerAttributes',
    value: function setLayerAttributes() {
      this._attributes = _extends({}, this._attributes, {
        positions: {
          value: this.cache.positions,
          instanced: 1,
          size: 3
        },
        colors: {
          value: this.cache.colors,
          instanced: 1,
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
    key: '_calculatePositions',
    value: function _calculatePositions() {
      var _this2 = this;

      this.data.forEach(function (hexagon, i) {
        _this2.cache.positions[i * 3 + 0] = hexagon.centroid.x;
        _this2.cache.positions[i * 3 + 1] = hexagon.centroid.y;
        _this2.cache.positions[i * 3 + 2] = _this2.elevation;
      });
    }
  }, {
    key: '_calculateColors',
    value: function _calculateColors() {
      var _this3 = this;

      this.data.forEach(function (hexagon, i) {
        _this3.cache.colors[i * 3 + 0] = hexagon.color[0];
        _this3.cache.colors[i * 3 + 1] = hexagon.color[1];
        _this3.cache.colors[i * 3 + 2] = hexagon.color[2];
      });
    }
  }, {
    key: '_calculatePickingColors',
    value: function _calculatePickingColors() {
      var _this4 = this;

      if (!this.isPickable) {
        return;
      }

      this.data.forEach(function (_, i) {
        _this4.cache.pickingColors[i * 3 + 0] = (i + 1) % 256;
        _this4.cache.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
        _this4.cache.pickingColors[i * 3 + 2] = _this4.layerIndex;
      });
    }

    // TODO this is the only place that uses hexagon vertices
    // consider move radius and angle calculation to the shader

  }, {
    key: '_calculateRadiusAndAngle',
    value: function _calculateRadiusAndAngle() {
      if (!this.data || this.data.length === 0) {
        return;
      }

      var vertices = this.data[0].vertices;
      var vertex0 = vertices[0];
      var vertex3 = vertices[3];

      // transform to space coordinates
      var spaceCoord0 = this.project([vertex0[0], vertex0[1]]);
      var spaceCoord3 = this.project([vertex3[0], vertex3[1]]);

      // map from space coordinates to screen coordinates
      var screenCoord0 = this.screenToSpace(spaceCoord0.x, spaceCoord0.y);
      var screenCoord3 = this.screenToSpace(spaceCoord3.x, spaceCoord3.y);

      // distance between two close centroids
      var dx = screenCoord0.x - screenCoord3.x;
      var dy = screenCoord0.y - screenCoord3.y;
      var dxy = Math.sqrt(dx * dx + dy * dy);

      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      this.cache.angle = Math.acos(dx / dxy) * -Math.sign(dy);

      // Allow user to fine tune radius
      this.cache.radius = dxy / 2 * Math.min(1, this.radius);
    }
  }]);

  return HexagonLayer;
}(_baseMapLayer2.default);

exports.default = HexagonLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9vbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0lBRWU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY25CLFdBZG1CLFlBY25CLENBQVksSUFBWixFQUFrQjswQkFkQyxjQWNEOzt1RUFkQyx5QkFlWCxPQURVOztBQUdoQixVQUFLLE1BQUwsR0FBYyxLQUFLLFNBQUwsSUFBa0IsRUFBbEIsQ0FIRTtBQUloQixVQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUFMLElBQWtCLEdBQWxCLENBSkQ7O0FBTWhCLFVBQUssZUFBTCxHQUF1QixLQUFLLGdCQUFMLENBTlA7QUFPaEIsVUFBSyxlQUFMLEdBQXVCLEtBQUssZ0JBQUwsQ0FQUDs7R0FBbEI7O2VBZG1COztrQ0F3Qkw7QUFDWixVQUFJLEtBQUssV0FBTCxFQUFrQjtBQUNwQixhQUFLLGtCQUFMLEdBRG9CO0FBRXBCLGFBQUssbUJBQUwsR0FGb0I7QUFHcEIsYUFBSyxnQkFBTCxHQUhvQjtBQUlwQixhQUFLLHVCQUFMLEdBSm9CO09BQXRCOztBQU9BLFVBQUksS0FBSyxlQUFMLElBQXdCLEtBQUssV0FBTCxFQUFrQjtBQUM1QyxhQUFLLHdCQUFMLEdBRDRDO09BQTlDOztBQUlBLFdBQUssZ0JBQUwsR0FaWTtBQWFaLFdBQUssa0JBQUwsR0FiWTs7QUFlWixXQUFLLFdBQUwsR0FBbUIsS0FBbkIsQ0FmWTtBQWdCWixXQUFLLGVBQUwsR0FBdUIsS0FBdkIsQ0FoQlk7Ozs7cUNBbUJHO0FBQ2YsYUFBTztBQUNMLFlBQUksS0FBSyxFQUFMO0FBQ0osY0FBTSxTQUFOO0FBQ0EsWUFBSSxRQUFRLGVBQVIsQ0FBSjtBQUNBLFlBQUksUUFBUSxpQkFBUixDQUFKO09BSkYsQ0FEZTs7Ozt3Q0FTRztBQUNsQixVQUFNLGVBQWUsQ0FBZixD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OztBQVhtQixVQWNuQixlQUFlLEtBQUssYUFBTCxDQUFtQixZQUFZLENBQVosRUFBZSxZQUFZLENBQVosQ0FBakQsQ0FkbUI7QUFlekIsVUFBTSxlQUFlLEtBQUssYUFBTCxDQUFtQixZQUFZLENBQVosRUFBZSxZQUFZLENBQVosQ0FBakQ7OztBQWZtQixVQWtCbkIsS0FBSyxhQUFhLENBQWIsR0FBaUIsYUFBYSxDQUFiLENBbEJIO0FBbUJ6QixVQUFNLEtBQUssYUFBYSxDQUFiLEdBQWlCLGFBQWEsQ0FBYixDQW5CSDtBQW9CekIsVUFBTSxNQUFNLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBTCxDQUExQjs7O0FBcEJtQixVQXVCekIsQ0FBSyxLQUFMLENBQVcsS0FBWCxHQUFtQixLQUFLLElBQUwsQ0FBVSxLQUFLLEdBQUwsQ0FBVixHQUFzQixDQUFDLEtBQUssSUFBTCxDQUFVLEVBQVYsQ0FBRDs7O0FBdkJoQixVQTBCekIsQ0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixNQUFNLENBQU4sR0FBVSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksS0FBSyxNQUFMLENBQXRCLENBMUJLOzs7O1NBdkpSIiwiZmlsZSI6Im9sZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBCYXNlTWFwTGF5ZXIgZnJvbSAnLi4vYmFzZS1tYXAtbGF5ZXInO1xuXG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBCYXNlTWFwTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBIZXhhZ29uTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmRvdFJhZGl1cyAtIGhleGFnb24gcmFkaXVzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmVsZXZhdGlvbiAtIGhleGFnb24gaGVpZ2h0XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25IZXhhZ29uSG92ZXJlZChpbmRleCwgZSkgLSBwb3B1cCBzZWxlY3RlZCBpbmRleFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uSGV4YWdvbkNsaWNrZWQoaW5kZXgsIGUpIC0gcG9wdXAgc2VsZWN0ZWQgaW5kZXhcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcihvcHRzKTtcblxuICAgIHRoaXMucmFkaXVzID0gb3B0cy5kb3RSYWRpdXMgfHwgMTA7XG4gICAgdGhpcy5lbGV2YXRpb24gPSBvcHRzLmVsZXZhdGlvbiB8fCAxMDE7XG5cbiAgICB0aGlzLm9uT2JqZWN0SG92ZXJlZCA9IG9wdHMub25IZXhhZ29uSG92ZXJlZDtcbiAgICB0aGlzLm9uT2JqZWN0Q2xpY2tlZCA9IG9wdHMub25IZXhhZ29uQ2xpY2tlZDtcbiAgfVxuXG4gIHVwZGF0ZUxheWVyKCkge1xuICAgIGlmICh0aGlzLmRhdGFDaGFuZ2VkKSB7XG4gICAgICB0aGlzLl9hbGxvY2F0ZUdMQnVmZmVycygpO1xuICAgICAgdGhpcy5fY2FsY3VsYXRlUG9zaXRpb25zKCk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVDb2xvcnMoKTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy52aWV3cG9ydENoYW5nZWQgfHwgdGhpcy5kYXRhQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldExheWVyVW5pZm9ybXMoKTtcbiAgICB0aGlzLnNldExheWVyQXR0cmlidXRlcygpO1xuXG4gICAgdGhpcy5kYXRhQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMudmlld3BvcnRDaGFuZ2VkID0gZmFsc2U7XG4gIH1cblxuICBnZXRMYXllclNoYWRlcigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBmcm9tOiAnc291cmNlcycsXG4gICAgICB2czogZ2xzbGlmeSgnLi92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZnM6IGdsc2xpZnkoJy4vZnJhZ21lbnQuZ2xzbCcpXG4gICAgfTtcbiAgfVxuXG4gIGdldExheWVyUHJpbWl0aXZlKCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9O1xuICB9XG5cbiAgc2V0TGF5ZXJVbmlmb3JtcygpIHtcbiAgICB0aGlzLl91bmlmb3JtcyA9IHtcbiAgICAgIC4uLnRoaXMuX3VuaWZvcm1zLFxuICAgICAgcmFkaXVzOiB0aGlzLmNhY2hlLnJhZGl1cyxcbiAgICAgIGFuZ2xlOiB0aGlzLmNhY2hlLmFuZ2xlXG4gICAgfTtcbiAgfVxuXG4gIHNldExheWVyQXR0cmlidXRlcygpIHtcbiAgICB0aGlzLl9hdHRyaWJ1dGVzID0ge1xuICAgICAgLi4udGhpcy5fYXR0cmlidXRlcyxcbiAgICAgIHBvc2l0aW9uczoge1xuICAgICAgICB2YWx1ZTogdGhpcy5jYWNoZS5wb3NpdGlvbnMsXG4gICAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgICAgc2l6ZTogM1xuICAgICAgfSxcbiAgICAgIGNvbG9yczoge1xuICAgICAgICB2YWx1ZTogdGhpcy5jYWNoZS5jb2xvcnMsXG4gICAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgICAgc2l6ZTogM1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuaXNQaWNrYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2F0dHJpYnV0ZXMucGlja2luZ0NvbG9ycyA9IHtcbiAgICAgIHZhbHVlOiB0aGlzLmNhY2hlLnBpY2tpbmdDb2xvcnMsXG4gICAgICBpbnN0YW5jZWQ6IDEsXG4gICAgICBzaXplOiAzXG4gICAgfTtcbiAgfVxuXG4gIF9hbGxvY2F0ZUdMQnVmZmVycygpIHtcbiAgICBjb25zdCBOID0gdGhpcy5fbnVtSW5zdGFuY2VzO1xuXG4gICAgdGhpcy5jYWNoZS5wb3NpdGlvbnMgPSBuZXcgRmxvYXQzMkFycmF5KE4gKiAzKTtcbiAgICB0aGlzLmNhY2hlLmNvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoTiAqIDMpO1xuXG4gICAgaWYgKCF0aGlzLmlzUGlja2FibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNhY2hlLnBpY2tpbmdDb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KE4gKiAzKTtcbiAgfVxuXG4gIF9jYWxjdWxhdGVQb3NpdGlvbnMoKSB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2goKGhleGFnb24sIGkpID0+IHtcbiAgICAgIHRoaXMuY2FjaGUucG9zaXRpb25zW2kgKiAzICsgMF0gPSBoZXhhZ29uLmNlbnRyb2lkLng7XG4gICAgICB0aGlzLmNhY2hlLnBvc2l0aW9uc1tpICogMyArIDFdID0gaGV4YWdvbi5jZW50cm9pZC55O1xuICAgICAgdGhpcy5jYWNoZS5wb3NpdGlvbnNbaSAqIDMgKyAyXSA9IHRoaXMuZWxldmF0aW9uO1xuICAgIH0pO1xuICB9XG5cbiAgX2NhbGN1bGF0ZUNvbG9ycygpIHtcbiAgICB0aGlzLmRhdGEuZm9yRWFjaCgoaGV4YWdvbiwgaSkgPT4ge1xuICAgICAgdGhpcy5jYWNoZS5jb2xvcnNbaSAqIDMgKyAwXSA9IGhleGFnb24uY29sb3JbMF07XG4gICAgICB0aGlzLmNhY2hlLmNvbG9yc1tpICogMyArIDFdID0gaGV4YWdvbi5jb2xvclsxXTtcbiAgICAgIHRoaXMuY2FjaGUuY29sb3JzW2kgKiAzICsgMl0gPSBoZXhhZ29uLmNvbG9yWzJdO1xuICAgIH0pO1xuICB9XG5cbiAgX2NhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoKSB7XG4gICAgaWYgKCF0aGlzLmlzUGlja2FibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGEuZm9yRWFjaCgoXywgaSkgPT4ge1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMF0gPSAoaSArIDEpICUgMjU2O1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMV0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYpICUgMjU2O1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMl0gPSB0aGlzLmxheWVySW5kZXg7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPIHRoaXMgaXMgdGhlIG9ubHkgcGxhY2UgdGhhdCB1c2VzIGhleGFnb24gdmVydGljZXNcbiAgLy8gY29uc2lkZXIgbW92ZSByYWRpdXMgYW5kIGFuZ2xlIGNhbGN1bGF0aW9uIHRvIHRoZSBzaGFkZXJcbiAgX2NhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCkge1xuICAgIGlmICghdGhpcy5kYXRhIHx8IHRoaXMuZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJ0aWNlcyA9IHRoaXMuZGF0YVswXS52ZXJ0aWNlcztcbiAgICBjb25zdCB2ZXJ0ZXgwID0gdmVydGljZXNbMF07XG4gICAgY29uc3QgdmVydGV4MyA9IHZlcnRpY2VzWzNdO1xuXG4gICAgLy8gdHJhbnNmb3JtIHRvIHNwYWNlIGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc3BhY2VDb29yZDAgPSB0aGlzLnByb2plY3QoW3ZlcnRleDBbMF0sIHZlcnRleDBbMV1dKTtcbiAgICBjb25zdCBzcGFjZUNvb3JkMyA9IHRoaXMucHJvamVjdChbdmVydGV4M1swXSwgdmVydGV4M1sxXV0pO1xuXG4gICAgLy8gbWFwIGZyb20gc3BhY2UgY29vcmRpbmF0ZXMgdG8gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc2NyZWVuQ29vcmQwID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHNwYWNlQ29vcmQwLngsIHNwYWNlQ29vcmQwLnkpO1xuICAgIGNvbnN0IHNjcmVlbkNvb3JkMyA9IHRoaXMuc2NyZWVuVG9TcGFjZShzcGFjZUNvb3JkMy54LCBzcGFjZUNvb3JkMy55KTtcblxuICAgIC8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIGNsb3NlIGNlbnRyb2lkc1xuICAgIGNvbnN0IGR4ID0gc2NyZWVuQ29vcmQwLnggLSBzY3JlZW5Db29yZDMueDtcbiAgICBjb25zdCBkeSA9IHNjcmVlbkNvb3JkMC55IC0gc2NyZWVuQ29vcmQzLnk7XG4gICAgY29uc3QgZHh5ID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgdGhpcy5jYWNoZS5hbmdsZSA9IE1hdGguYWNvcyhkeCAvIGR4eSkgKiAtTWF0aC5zaWduKGR5KTtcblxuICAgIC8vIEFsbG93IHVzZXIgdG8gZmluZSB0dW5lIHJhZGl1c1xuICAgIHRoaXMuY2FjaGUucmFkaXVzID0gZHh5IC8gMiAqIE1hdGgubWluKDEsIHRoaXMucmFkaXVzKTtcbiAgfVxuXG59XG4iXX0=