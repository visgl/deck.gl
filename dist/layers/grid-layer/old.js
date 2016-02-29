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

// Note: Shaders are inlined by the glslify browserify transform
var glslify = require('glslify');

var GridLayer = function (_BaseMapLayer) {
  _inherits(GridLayer, _BaseMapLayer);

  /**
   * @classdesc
   * GridLayer
   *
   * @class
   * @param {object} opts
   * @param {number} opts.unitWidth - width of the unit rectangle
   * @param {number} opts.unitHeight - height of the unit rectangle
   */

  function GridLayer(opts) {
    _classCallCheck(this, GridLayer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GridLayer).call(this, opts));

    _this.unitWidth = opts.unitWidth || 100;
    _this.unitHeight = opts.unitHeight || 100;
    return _this;
  }

  _createClass(GridLayer, [{
    key: 'updateLayer',
    value: function updateLayer() {
      // dataChanged does not affect the generation of grid layout
      if (this.dataChanged || true) {
        this._allocateGLBuffers();
        this._calculatePositions();
        this._calculateColors();
        this._calculatePickingColors();
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
      return {
        id: this.id,
        drawType: 'TRIANGLE_FAN',
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0]),
        instanced: true
      };
    }
  }, {
    key: 'setLayerUniforms',
    value: function setLayerUniforms() {
      var margin = 2;

      this._uniforms = _extends({}, this._uniforms, {
        scale: new Float32Array([this.unitWidth - margin * 2, this.unitHeight - margin * 2, 1]),
        maxCount: this.cache.maxCount
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
      this.numCol = Math.ceil(this.width * 2 / this.unitWidth);
      this.numRow = Math.ceil(this.height * 2 / this.unitHeight);

      var N = this._numInstances = this.numCol * this.numRow;

      this.cache.positions = new Float32Array(N * 3);
      this.cache.colors = new Float32Array(N * 3);
      this.cache.colors.fill(0.0);

      if (!this.isPickable) {
        return;
      }

      this.cache.pickingColors = new Float32Array(N * 3);
    }
  }, {
    key: '_calculatePositions',
    value: function _calculatePositions() {
      for (var i = 0; i < this._numInstances; i++) {
        var x = i % this.numCol;
        var y = Math.floor(i / this.numCol);
        this.cache.positions[i * 3 + 0] = x * this.unitWidth - this.width;
        this.cache.positions[i * 3 + 1] = y * this.unitHeight - this.height;
        this.cache.positions[i * 3 + 2] = 0;
      }
    }
  }, {
    key: '_calculateColors',
    value: function _calculateColors() {
      var _this2 = this,
          _Math;

      this.data.forEach(function (point) {
        var pixel = _this2.project([point.position.x, point.position.y]);
        var space = _this2.screenToSpace(pixel.x, pixel.y);

        var colId = Math.floor((space.x + _this2.width) / _this2.unitWidth);
        var rowId = Math.floor((space.y + _this2.height) / _this2.unitHeight);

        var i3 = (colId + rowId * _this2.numCol) * 3;
        _this2.cache.colors[i3 + 0] += 1;
        _this2.cache.colors[i3 + 1] += 5;
        _this2.cache.colors[i3 + 2] += 1;
      });

      this.cache.maxCount = (_Math = Math).max.apply(_Math, _toConsumableArray(this.cache.colors));
    }
  }, {
    key: '_calculatePickingColors',
    value: function _calculatePickingColors() {
      if (!this.isPickable) {
        return;
      }

      for (var i = 0; i < this._numInstances; i++) {
        this.cache.pickingColors[i * 3 + 0] = (i + 1) % 256;
        this.cache.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
        this.cache.pickingColors[i * 3 + 2] = this.layerIndex;
      }
    }
  }]);

  return GridLayer;
}(_baseMapLayer2.default);

exports.default = GridLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ3JpZC1sYXllci9vbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztJQUVlOzs7Ozs7Ozs7Ozs7O0FBVW5CLFdBVm1CLFNBVW5CLENBQVksSUFBWixFQUFrQjswQkFWQyxXQVVEOzt1RUFWQyxzQkFXWCxPQURVOztBQUVoQixVQUFLLFNBQUwsR0FBaUIsS0FBSyxTQUFMLElBQWtCLEdBQWxCLENBRkQ7QUFHaEIsVUFBSyxVQUFMLEdBQWtCLEtBQUssVUFBTCxJQUFtQixHQUFuQixDQUhGOztHQUFsQjs7ZUFWbUI7O2tDQWdCTDs7QUFFWixVQUFJLEtBQUssV0FBTCxJQUFvQixJQUFwQixFQUEwQjtBQUM1QixhQUFLLGtCQUFMLEdBRDRCO0FBRTVCLGFBQUssbUJBQUwsR0FGNEI7QUFHNUIsYUFBSyxnQkFBTCxHQUg0QjtBQUk1QixhQUFLLHVCQUFMLEdBSjRCO09BQTlCOztBQU9BLFdBQUssZ0JBQUwsR0FUWTtBQVVaLFdBQUssa0JBQUwsR0FWWTs7QUFZWixXQUFLLFdBQUwsR0FBbUIsS0FBbkIsQ0FaWTtBQWFaLFdBQUssZUFBTCxHQUF1QixLQUF2QixDQWJZOzs7O3FDQWdCRztBQUNmLGFBQU87QUFDTCxZQUFJLEtBQUssRUFBTDtBQUNKLGNBQU0sU0FBTjtBQUNBLFlBQUksUUFBUSxlQUFSLENBQUo7QUFDQSxZQUFJLFFBQVEsaUJBQVIsQ0FBSjtPQUpGLENBRGU7Ozs7d0NBU0c7QUFDbEIsYUFBTztBQUNMLFlBQUksS0FBSyxFQUFMO0FBQ0osa0JBQVUsY0FBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CLENBQW5CLEVBQXNCLENBQXRCLEVBQXlC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YUFBWCxDQUF5QixJQUFJLENBQUosR0FBUSxDQUFSLENBQXpCLEdBQXNDLEtBQUssS0FBTCxDQUFXLENBQUMsSUFBSSxDQUFKLENBQUQsR0FBVSxHQUFWLENBQVgsR0FBNEIsR0FBNUIsQ0FGSztBQUczQyxhQUFLLEtBQUwsQ0FBVyxhQUFYLENBQXlCLElBQUksQ0FBSixHQUFRLENBQVIsQ0FBekIsR0FBc0MsS0FBSyxVQUFMLENBSEs7T0FBN0M7Ozs7U0F4SWlCIiwiZmlsZSI6Im9sZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBCYXNlTWFwTGF5ZXIgZnJvbSAnLi4vYmFzZS1tYXAtbGF5ZXInO1xuLy8gTm90ZTogU2hhZGVycyBhcmUgaW5saW5lZCBieSB0aGUgZ2xzbGlmeSBicm93c2VyaWZ5IHRyYW5zZm9ybVxuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JpZExheWVyIGV4dGVuZHMgQmFzZU1hcExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogR3JpZExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy51bml0V2lkdGggLSB3aWR0aCBvZiB0aGUgdW5pdCByZWN0YW5nbGVcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMudW5pdEhlaWdodCAtIGhlaWdodCBvZiB0aGUgdW5pdCByZWN0YW5nbGVcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgICB0aGlzLnVuaXRXaWR0aCA9IG9wdHMudW5pdFdpZHRoIHx8IDEwMDtcbiAgICB0aGlzLnVuaXRIZWlnaHQgPSBvcHRzLnVuaXRIZWlnaHQgfHwgMTAwO1xuICB9XG5cbiAgdXBkYXRlTGF5ZXIoKSB7XG4gICAgLy8gZGF0YUNoYW5nZWQgZG9lcyBub3QgYWZmZWN0IHRoZSBnZW5lcmF0aW9uIG9mIGdyaWQgbGF5b3V0XG4gICAgaWYgKHRoaXMuZGF0YUNoYW5nZWQgfHwgdHJ1ZSkge1xuICAgICAgdGhpcy5fYWxsb2NhdGVHTEJ1ZmZlcnMoKTtcbiAgICAgIHRoaXMuX2NhbGN1bGF0ZVBvc2l0aW9ucygpO1xuICAgICAgdGhpcy5fY2FsY3VsYXRlQ29sb3JzKCk7XG4gICAgICB0aGlzLl9jYWxjdWxhdGVQaWNraW5nQ29sb3JzKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRMYXllclVuaWZvcm1zKCk7XG4gICAgdGhpcy5zZXRMYXllckF0dHJpYnV0ZXMoKTtcblxuICAgIHRoaXMuZGF0YUNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLnZpZXdwb3J0Q2hhbmdlZCA9IGZhbHNlO1xuICB9XG5cbiAgZ2V0TGF5ZXJTaGFkZXIoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZnJvbTogJ3NvdXJjZXMnLFxuICAgICAgdnM6IGdsc2xpZnkoJy4vdmVydGV4Lmdsc2wnKSxcbiAgICAgIGZzOiBnbHNsaWZ5KCcuL2ZyYWdtZW50Lmdsc2wnKVxuICAgIH07XG4gIH1cblxuICBnZXRMYXllclByaW1pdGl2ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMSwgMCwgMCwgMSwgMSwgMCwgMCwgMSwgMF0pLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlXG4gICAgfTtcbiAgfVxuXG4gIHNldExheWVyVW5pZm9ybXMoKSB7XG4gICAgY29uc3QgbWFyZ2luID0gMjtcblxuICAgIHRoaXMuX3VuaWZvcm1zID0ge1xuICAgICAgLi4udGhpcy5fdW5pZm9ybXMsXG4gICAgICBzY2FsZTogbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAgIHRoaXMudW5pdFdpZHRoIC0gbWFyZ2luICogMiwgdGhpcy51bml0SGVpZ2h0IC0gbWFyZ2luICogMiwgMV0pLFxuICAgICAgbWF4Q291bnQ6IHRoaXMuY2FjaGUubWF4Q291bnRcbiAgICB9O1xuICB9XG5cbiAgc2V0TGF5ZXJBdHRyaWJ1dGVzKCkge1xuICAgIHRoaXMuX2F0dHJpYnV0ZXMgPSB7XG4gICAgICAuLi50aGlzLl9hdHRyaWJ1dGVzLFxuICAgICAgcG9zaXRpb25zOiB7XG4gICAgICAgIHZhbHVlOiB0aGlzLmNhY2hlLnBvc2l0aW9ucyxcbiAgICAgICAgaW5zdGFuY2VkOiAxLFxuICAgICAgICBzaXplOiAzXG4gICAgICB9LFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIHZhbHVlOiB0aGlzLmNhY2hlLmNvbG9ycyxcbiAgICAgICAgaW5zdGFuY2VkOiAxLFxuICAgICAgICBzaXplOiAzXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5pc1BpY2thYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYXR0cmlidXRlcy5waWNraW5nQ29sb3JzID0ge1xuICAgICAgdmFsdWU6IHRoaXMuY2FjaGUucGlja2luZ0NvbG9ycyxcbiAgICAgIGluc3RhbmNlZDogMSxcbiAgICAgIHNpemU6IDNcbiAgICB9O1xuICB9XG5cbiAgX2FsbG9jYXRlR0xCdWZmZXJzKCkge1xuICAgIHRoaXMubnVtQ29sID0gTWF0aC5jZWlsKHRoaXMud2lkdGggKiAyIC8gdGhpcy51bml0V2lkdGgpO1xuICAgIHRoaXMubnVtUm93ID0gTWF0aC5jZWlsKHRoaXMuaGVpZ2h0ICogMiAvIHRoaXMudW5pdEhlaWdodCk7XG5cbiAgICBjb25zdCBOID0gdGhpcy5fbnVtSW5zdGFuY2VzID0gdGhpcy5udW1Db2wgKiB0aGlzLm51bVJvdztcblxuICAgIHRoaXMuY2FjaGUucG9zaXRpb25zID0gbmV3IEZsb2F0MzJBcnJheShOICogMyk7XG4gICAgdGhpcy5jYWNoZS5jb2xvcnMgPSBuZXcgRmxvYXQzMkFycmF5KE4gKiAzKTtcbiAgICB0aGlzLmNhY2hlLmNvbG9ycy5maWxsKDAuMCk7XG5cbiAgICBpZiAoIXRoaXMuaXNQaWNrYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2FjaGUucGlja2luZ0NvbG9ycyA9IG5ldyBGbG9hdDMyQXJyYXkoTiAqIDMpO1xuICB9XG5cbiAgX2NhbGN1bGF0ZVBvc2l0aW9ucygpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX251bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIHRoaXMubnVtQ29sO1xuICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoaSAvIHRoaXMubnVtQ29sKTtcbiAgICAgIHRoaXMuY2FjaGUucG9zaXRpb25zW2kgKiAzICsgMF0gPSB4ICogdGhpcy51bml0V2lkdGggLSB0aGlzLndpZHRoO1xuICAgICAgdGhpcy5jYWNoZS5wb3NpdGlvbnNbaSAqIDMgKyAxXSA9IHkgKiB0aGlzLnVuaXRIZWlnaHQgLSB0aGlzLmhlaWdodDtcbiAgICAgIHRoaXMuY2FjaGUucG9zaXRpb25zW2kgKiAzICsgMl0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIF9jYWxjdWxhdGVDb2xvcnMoKSB7XG4gICAgdGhpcy5kYXRhLmZvckVhY2gocG9pbnQgPT4ge1xuICAgICAgY29uc3QgcGl4ZWwgPSB0aGlzLnByb2plY3QoW3BvaW50LnBvc2l0aW9uLngsIHBvaW50LnBvc2l0aW9uLnldKTtcbiAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHBpeGVsLngsIHBpeGVsLnkpO1xuXG4gICAgICBjb25zdCBjb2xJZCA9IE1hdGguZmxvb3IoKHNwYWNlLnggKyB0aGlzLndpZHRoKSAvIHRoaXMudW5pdFdpZHRoKTtcbiAgICAgIGNvbnN0IHJvd0lkID0gTWF0aC5mbG9vcigoc3BhY2UueSArIHRoaXMuaGVpZ2h0KSAvIHRoaXMudW5pdEhlaWdodCk7XG5cbiAgICAgIGNvbnN0IGkzID0gKGNvbElkICsgcm93SWQgKiB0aGlzLm51bUNvbCkgKiAzO1xuICAgICAgdGhpcy5jYWNoZS5jb2xvcnNbaTMgKyAwXSArPSAxO1xuICAgICAgdGhpcy5jYWNoZS5jb2xvcnNbaTMgKyAxXSArPSA1O1xuICAgICAgdGhpcy5jYWNoZS5jb2xvcnNbaTMgKyAyXSArPSAxO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jYWNoZS5tYXhDb3VudCA9IE1hdGgubWF4KC4uLnRoaXMuY2FjaGUuY29sb3JzKTtcbiAgfVxuXG4gIF9jYWxjdWxhdGVQaWNraW5nQ29sb3JzKCkge1xuICAgIGlmICghdGhpcy5pc1BpY2thYmxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9udW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMF0gPSAoaSArIDEpICUgMjU2O1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMV0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYpICUgMjU2O1xuICAgICAgdGhpcy5jYWNoZS5waWNraW5nQ29sb3JzW2kgKiAzICsgMl0gPSB0aGlzLmxheWVySW5kZXg7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==