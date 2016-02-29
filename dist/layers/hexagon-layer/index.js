'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _mapLayer = require('../map-layer');

var _mapLayer2 = _interopRequireDefault(_mapLayer);

var _luma = require('luma.gl');

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

var ATTRIBUTES = {
  positions: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' }
};

var HexagonLayer = function (_MapLayer) {
  _inherits(HexagonLayer, _MapLayer);

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

    return _possibleConstructorReturn(this, Object.getPrototypeOf(HexagonLayer).call(this, _extends({
      dotRadius: 10,
      elevation: 101
    }, opts)));
  }

  _createClass(HexagonLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(HexagonLayer.prototype), 'initializeState', this).call(this);

      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'hexagon');

      this.setState({
        program: program,
        primitive: this.getPrimitive()
      });

      attributes.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });

      this.calculateRadiusAndAngle();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(HexagonLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var _state2 = this.state;
      var dataChanged = _state2.dataChanged;
      var viewportChanged = _state2.viewportChanged;
      var attributes = _state2.attributes;


      if (dataChanged || viewportChanged) {
        attributes.invalidate('positions');
        this.calculateRadiusAndAngle();
      }
      if (dataChanged) {
        attributes.invalidate('colors');
      }
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      var data = this.props.data;
      var value = attribute.value;
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var hexagon = _step.value;

          value[i + 0] = hexagon.centroid.x;
          value[i + 1] = hexagon.centroid.y;
          value[i + 2] = this.props.elevation;
          i += size;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var data = this.props.data;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var hexagon = _step2.value;

          value[i + 0] = hexagon.color[0];
          value[i + 1] = hexagon.color[1];
          value[i + 2] = hexagon.color[2];
          i += 3;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }

    // TODO this is the only place that uses hexagon vertices
    // consider move radius and angle calculation to the shader

  }, {
    key: 'calculateRadiusAndAngle',
    value: function calculateRadiusAndAngle() {
      var data = this.props.data;

      if (!data || data.length === 0) {
        return;
      }

      var vertices = data[0].vertices;
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

      this.setUniforms({
        // Calculate angle that the perpendicular hexagon vertex axis is tilted
        angle: Math.acos(dx / dxy) * -Math.sign(dy),
        // Allow user to fine tune radius
        radius: dxy / 2 * Math.min(1, this.props.dotRadius)
      });
    }
  }, {
    key: 'getPrimitive',
    value: function getPrimitive() {
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
  }]);

  return HexagonLayer;
}(_mapLayer2.default);

exports.default = HexagonLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBekM7QUFDQSxVQUFRLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxLQUFMLEVBQVksS0FBSyxPQUFMLEVBQWMsS0FBSyxNQUFMLEVBQTVDO0NBRkk7O0lBS2U7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY25CLFdBZG1CLFlBY25CLENBQVksSUFBWixFQUFrQjswQkFkQyxjQWNEOztrRUFkQztBQWdCZixpQkFBVyxFQUFYO0FBQ0EsaUJBQVcsR0FBWDtPQUNHLFFBSlc7R0FBbEI7O2VBZG1COztzQ0FzQkQ7QUFDaEIsaUNBdkJpQiw0REF1QmpCLENBRGdCOzttQkFHUyxLQUFLLEtBQUwsQ0FIVDtVQUdULGVBSFM7VUFHTCwrQkFISzs7O0FBS2hCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxlQUFSLENBRmMsRUFHZCxRQUFRLGlCQUFSLENBSGMsRUFJZCxTQUpjLENBQVYsQ0FMVTs7QUFZaEIsV0FBSyxRQUFMLENBQWM7QUFDWix3QkFEWTtBQUVaLG1CQUFXLEtBQUssWUFBTCxFQUFYO09BRkYsRUFaZ0I7O0FBaUJoQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DO0FBQ2xDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjtPQUZGLEVBakJnQjs7QUFzQmhCLFdBQUssdUJBQUwsR0F0QmdCOzs7O3FDQXlCRCxVQUFVLFVBQVU7QUFDbkMsaUNBaERpQiw4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Q0FBRDs7QUFFN0IsZ0JBQVEsTUFBTSxDQUFOLEdBQVUsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBdEI7T0FKVixFQXZCd0I7Ozs7bUNBZ0NYO0FBQ2IsVUFBTSxlQUFlLENBQWYsQ0FETztBQUViLFVBQU0sTUFBTSxLQUFLLEVBQUwsR0FBVSxDQUFWLENBRkM7O0FBSWIsVUFBSSxXQUFXLEVBQVgsQ0FKUztBQUtiLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDckMsZ0RBQ0ssWUFDSCxLQUFLLEdBQUwsQ0FBUyxNQUFNLENBQU4sR0FBVSxZQUFWLEdBQ1QsS0FBSyxHQUFMLENBQVMsTUFBTSxDQUFOLEdBQVUsWUFBVixHQUNULEdBSkYsQ0FEcUM7T0FBdkM7O0FBU0EsYUFBTztBQUNMLFlBQUksS0FBSyxFQUFMO0FBQ0osa0JBQVUsY0FBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFWO0FBQ0EsbUJBQVcsSUFBWDtPQUpGLENBZGE7Ozs7U0F2SEkiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTWFwTGF5ZXIgZnJvbSAnLi4vbWFwLWxheWVyJztcbmltcG9ydCB7UHJvZ3JhbX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSGV4YWdvbkxheWVyIGV4dGVuZHMgTWFwTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBIZXhhZ29uTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmRvdFJhZGl1cyAtIGhleGFnb24gcmFkaXVzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLmVsZXZhdGlvbiAtIGhleGFnb24gaGVpZ2h0XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25IZXhhZ29uSG92ZXJlZChpbmRleCwgZSkgLSBwb3B1cCBzZWxlY3RlZCBpbmRleFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uSGV4YWdvbkNsaWNrZWQoaW5kZXgsIGUpIC0gcG9wdXAgc2VsZWN0ZWQgaW5kZXhcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcih7XG4gICAgICBkb3RSYWRpdXM6IDEwLFxuICAgICAgZWxldmF0aW9uOiAxMDEsXG4gICAgICAuLi5vcHRzXG4gICAgfSk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG5cbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShcbiAgICAgIGdsLFxuICAgICAgZ2xzbGlmeSgnLi92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeSgnLi9mcmFnbWVudC5nbHNsJyksXG4gICAgICAnaGV4YWdvbidcbiAgICApO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBwcm9ncmFtLFxuICAgICAgcHJpbWl0aXZlOiB0aGlzLmdldFByaW1pdGl2ZSgpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVzLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIGNvbnN0IHtkYXRhQ2hhbmdlZCwgdmlld3BvcnRDaGFuZ2VkLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAoZGF0YUNoYW5nZWQgfHwgdmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGUoJ3Bvc2l0aW9ucycpO1xuICAgICAgdGhpcy5jYWxjdWxhdGVSYWRpdXNBbmRBbmdsZSgpO1xuICAgIH1cbiAgICBpZiAoZGF0YUNoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZXMuaW52YWxpZGF0ZSgnY29sb3JzJyk7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBoZXhhZ29uIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGhleGFnb24uY2VudHJvaWQueDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGhleGFnb24uY2VudHJvaWQueTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IHRoaXMucHJvcHMuZWxldmF0aW9uO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgaGV4YWdvbiBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBoZXhhZ29uLmNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gaGV4YWdvbi5jb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGhleGFnb24uY29sb3JbMl07XG4gICAgICBpICs9IDM7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyB0aGlzIGlzIHRoZSBvbmx5IHBsYWNlIHRoYXQgdXNlcyBoZXhhZ29uIHZlcnRpY2VzXG4gIC8vIGNvbnNpZGVyIG1vdmUgcmFkaXVzIGFuZCBhbmdsZSBjYWxjdWxhdGlvbiB0byB0aGUgc2hhZGVyXG4gIGNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKCFkYXRhIHx8IGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdmVydGljZXMgPSBkYXRhWzBdLnZlcnRpY2VzO1xuICAgIGNvbnN0IHZlcnRleDAgPSB2ZXJ0aWNlc1swXTtcbiAgICBjb25zdCB2ZXJ0ZXgzID0gdmVydGljZXNbM107XG5cbiAgICAvLyB0cmFuc2Zvcm0gdG8gc3BhY2UgY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzcGFjZUNvb3JkMCA9IHRoaXMucHJvamVjdChbdmVydGV4MFswXSwgdmVydGV4MFsxXV0pO1xuICAgIGNvbnN0IHNwYWNlQ29vcmQzID0gdGhpcy5wcm9qZWN0KFt2ZXJ0ZXgzWzBdLCB2ZXJ0ZXgzWzFdXSk7XG5cbiAgICAvLyBtYXAgZnJvbSBzcGFjZSBjb29yZGluYXRlcyB0byBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzY3JlZW5Db29yZDAgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDAueCwgc3BhY2VDb29yZDAueSk7XG4gICAgY29uc3Qgc2NyZWVuQ29vcmQzID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHNwYWNlQ29vcmQzLngsIHNwYWNlQ29vcmQzLnkpO1xuXG4gICAgLy8gZGlzdGFuY2UgYmV0d2VlbiB0d28gY2xvc2UgY2VudHJvaWRzXG4gICAgY29uc3QgZHggPSBzY3JlZW5Db29yZDAueCAtIHNjcmVlbkNvb3JkMy54O1xuICAgIGNvbnN0IGR5ID0gc2NyZWVuQ29vcmQwLnkgLSBzY3JlZW5Db29yZDMueTtcbiAgICBjb25zdCBkeHkgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuXG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAvLyBDYWxjdWxhdGUgYW5nbGUgdGhhdCB0aGUgcGVycGVuZGljdWxhciBoZXhhZ29uIHZlcnRleCBheGlzIGlzIHRpbHRlZFxuICAgICAgYW5nbGU6IE1hdGguYWNvcyhkeCAvIGR4eSkgKiAtTWF0aC5zaWduKGR5KSxcbiAgICAgIC8vIEFsbG93IHVzZXIgdG8gZmluZSB0dW5lIHJhZGl1c1xuICAgICAgcmFkaXVzOiBkeHkgLyAyICogTWF0aC5taW4oMSwgdGhpcy5wcm9wcy5kb3RSYWRpdXMpXG4gICAgfSk7XG5cbiAgfVxuXG4gIGdldFByaW1pdGl2ZSgpIHtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA2O1xuICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuXG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbXG4gICAgICAgIC4uLnZlcnRpY2VzLFxuICAgICAgICBNYXRoLmNvcyhQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgTWF0aC5zaW4oUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIDBcbiAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgZHJhd1R5cGU6ICdUUklBTkdMRV9GQU4nLFxuICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=