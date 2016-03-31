'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('../../layer');

var _layer2 = _interopRequireDefault(_layer);

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

var HexagonLayer = function (_Layer) {
  _inherits(HexagonLayer, _Layer);

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
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      this.setState({
        model: this.getModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
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
      var attributeManager = _state2.attributeManager;


      if (dataChanged || viewportChanged) {
        attributeManager.invalidate('positions');
        this.calculateRadiusAndAngle();
      }
      if (dataChanged) {
        attributeManager.invalidate('colors');
      }
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var NUM_SEGMENTS = 6;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./hexagon-layer-vertex.glsl'),
          fs: glslify('./hexagon-layer-fragment.glsl'),
          id: 'hexagon'
        }),
        geometry: new _luma.Geometry({
          id: this.props.id,
          drawMode: 'TRIANGLE_FAN',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
      });
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
      var spaceCoord0 = this.project({ lat: vertex0[1], lon: vertex0[0] });
      var spaceCoord3 = this.project({ lat: vertex3[1], lon: vertex3[0] });

      // map from space coordinates to screen coordinates
      var screenCoord0 = this.screenToSpace(spaceCoord0);
      var screenCoord3 = this.screenToSpace(spaceCoord3);

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
  }]);

  return HexagonLayer;
}(_layer2.default);

exports.default = HexagonLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9oZXhhZ29uLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozs7Ozs7Ozs7Ozs7OztBQWNuQixXQWRtQixZQWNuQixDQUFZLElBQVosRUFBa0I7MEJBZEMsY0FjRDs7a0VBZEM7QUFnQmYsaUJBQVcsRUFBWDtBQUNBLGlCQUFXLEdBQVg7T0FDRyxRQUpXO0dBQWxCOztlQWRtQjs7c0NBc0JEO21CQUNlLEtBQUssS0FBTCxDQURmO1VBQ1QsZUFEUztVQUNMLDJDQURLOzs7QUFHaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssUUFBTCxDQUFjLEVBQWQsQ0FBUDtPQURGLEVBSGdCOztBQU9oQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCO09BRkYsRUFQZ0I7O0FBWWhCLFdBQUssdUJBQUwsR0FaZ0I7Ozs7cUNBZUQsVUFBVSxVQUFVO0FBQ25DLGlDQXRDaUIsOERBc0NNLFVBQVUsU0FBakMsQ0FEbUM7O29CQUdzQixLQUFLLEtBQUwsQ0FIdEI7VUFHNUIsa0NBSDRCO1VBR2YsMENBSGU7VUFHRSw0Q0FIRjs7O0FBS25DLFVBQUksZUFBZSxlQUFmLEVB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QUMsS0FBSyxRQUFRLENBQVIsQ0FBTCxFQUFpQixLQUFLLFFBQVEsQ0FBUixDQUFMLEVBQS9CLENBQWQ7OztBQVprQixVQWVsQixlQUFlLEtBQUssYUFBTCxDQUFtQixXQUFuQixDQUFmLENBZmtCO0FBZ0J4QixVQUFNLGVBQWUsS0FBSyxhQUFMLENBQW1CLFdBQW5CLENBQWY7OztBQWhCa0IsVUFtQmxCLEtBQUssYUFBYSxDQUFiLEdBQWlCLGFBQWEsQ0FBYixDQW5CSjtBQW9CeEIsVUFBTSxLQUFLLGFBQWEsQ0FBYixHQUFpQixhQUFhLENBQWIsQ0FwQko7QUFxQnhCLFVBQU0sTUFBTSxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQUwsQ0FBMUIsQ0FyQmtCOztBQXVCeEIsV0FBSyxXQUFMLENBQWlCOztBQUVmLGVBQU8sS0FBSyxJQUFMLENBQVUsS0FBSyxHQUFMLENBQVYsR0FBc0IsQ0FBQyxLQUFLLElBQUwsQ0FBVSxFQUFWLENBQUQ7O0FBRTdCLGdCQUFRLE1BQU0sQ0FBTixHQUFVLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxLQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXRCO09BSlYsRUF2QndCOzs7O1NBMUdQIiwiZmlsZSI6ImhleGFnb24tbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vLi4vbGF5ZXInO1xuaW1wb3J0IHtNb2RlbCwgUHJvZ3JhbSwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhleGFnb25MYXllciBleHRlbmRzIExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogSGV4YWdvbkxheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5kb3RSYWRpdXMgLSBoZXhhZ29uIHJhZGl1c1xuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5lbGV2YXRpb24gLSBoZXhhZ29uIGhlaWdodFxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uSGV4YWdvbkhvdmVyZWQoaW5kZXgsIGUpIC0gcG9wdXAgc2VsZWN0ZWQgaW5kZXhcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkhleGFnb25DbGlja2VkKGluZGV4LCBlKSAtIHBvcHVwIHNlbGVjdGVkIGluZGV4XG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgZG90UmFkaXVzOiAxMCxcbiAgICAgIGVsZXZhdGlvbjogMTAxLFxuICAgICAgLi4ub3B0c1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlbDogdGhpcy5nZXRNb2RlbChnbClcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCB2aWV3cG9ydENoYW5nZWQsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmIChkYXRhQ2hhbmdlZCB8fCB2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZSgncG9zaXRpb25zJyk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gICAgfVxuICAgIGlmIChkYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlKCdjb2xvcnMnKTtcbiAgICB9XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2hleGFnb24tbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vaGV4YWdvbi1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnaGV4YWdvbidcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgaGV4YWdvbiBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBoZXhhZ29uLmNlbnRyb2lkLng7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBoZXhhZ29uLmNlbnRyb2lkLnk7XG4gICAgICB2YWx1ZVtpICsgMl0gPSB0aGlzLnByb3BzLmVsZXZhdGlvbjtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGhleGFnb24gb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gaGV4YWdvbi5jb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGhleGFnb24uY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBoZXhhZ29uLmNvbG9yWzJdO1xuICAgICAgaSArPSAzO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gdGhpcyBpcyB0aGUgb25seSBwbGFjZSB0aGF0IHVzZXMgaGV4YWdvbiB2ZXJ0aWNlc1xuICAvLyBjb25zaWRlciBtb3ZlIHJhZGl1cyBhbmQgYW5nbGUgY2FsY3VsYXRpb24gdG8gdGhlIHNoYWRlclxuICBjYWxjdWxhdGVSYWRpdXNBbmRBbmdsZSgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnRpY2VzID0gZGF0YVswXS52ZXJ0aWNlcztcbiAgICBjb25zdCB2ZXJ0ZXgwID0gdmVydGljZXNbMF07XG4gICAgY29uc3QgdmVydGV4MyA9IHZlcnRpY2VzWzNdO1xuXG4gICAgLy8gdHJhbnNmb3JtIHRvIHNwYWNlIGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc3BhY2VDb29yZDAgPSB0aGlzLnByb2plY3Qoe2xhdDogdmVydGV4MFsxXSwgbG9uOiB2ZXJ0ZXgwWzBdfSk7XG4gICAgY29uc3Qgc3BhY2VDb29yZDMgPSB0aGlzLnByb2plY3Qoe2xhdDogdmVydGV4M1sxXSwgbG9uOiB2ZXJ0ZXgzWzBdfSk7XG5cbiAgICAvLyBtYXAgZnJvbSBzcGFjZSBjb29yZGluYXRlcyB0byBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzY3JlZW5Db29yZDAgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDApO1xuICAgIGNvbnN0IHNjcmVlbkNvb3JkMyA9IHRoaXMuc2NyZWVuVG9TcGFjZShzcGFjZUNvb3JkMyk7XG5cbiAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjbG9zZSBjZW50cm9pZHNcbiAgICBjb25zdCBkeCA9IHNjcmVlbkNvb3JkMC54IC0gc2NyZWVuQ29vcmQzLng7XG4gICAgY29uc3QgZHkgPSBzY3JlZW5Db29yZDAueSAtIHNjcmVlbkNvb3JkMy55O1xuICAgIGNvbnN0IGR4eSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgICBhbmdsZTogTWF0aC5hY29zKGR4IC8gZHh5KSAqIC1NYXRoLnNpZ24oZHkpLFxuICAgICAgLy8gQWxsb3cgdXNlciB0byBmaW5lIHR1bmUgcmFkaXVzXG4gICAgICByYWRpdXM6IGR4eSAvIDIgKiBNYXRoLm1pbigxLCB0aGlzLnByb3BzLmRvdFJhZGl1cylcbiAgICB9KTtcblxuICB9XG5cbn1cbiJdfQ==