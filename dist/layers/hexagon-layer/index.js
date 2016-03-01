'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('../layer');

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
}(_layer2.default);

exports.default = HexagonLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBekM7QUFDQSxVQUFRLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxLQUFMLEVBQVksS0FBSyxPQUFMLEVBQWMsS0FBSyxNQUFMLEVBQTVDO0NBRkk7O0lBS2U7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY25CLFdBZG1CLFlBY25CLENBQVksSUFBWixFQUFrQjswQkFkQyxjQWNEOztrRUFkQztBQWdCZixpQkFBVyxFQUFYO0FBQ0EsaUJBQVcsR0FBWDtPQUNHLFFBSlc7R0FBbEI7O2VBZG1COztzQ0FzQkQ7QUFDaEIsaUNBdkJpQiw0REF1QmpCLENBRGdCOzttQkFHUyxLQUFLLEtBQUwsQ0FIVDtVQUdULGVBSFM7VUFHTCwrQkFISzs7O0FBS2hCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxlQUFSLENBRmMsRUFHZCxRQUFRLGlCQUFSLENBSGMsRUFJZCxTQUpjLENBQVYsQ0FMVTs7QUFZaEIsV0FBSyxRQUFMLENBQWM7QUFDWix3QkFEWTtBQUVaLG1CQUFXLEtBQUssWUFBTCxFQUFYO09BRkYsRUFaZ0I7O0FBaUJoQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DO0FBQ2xDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFBTCxFQUFqQjtPQUZGLEVBakJnQjs7QUFzQmhCLFdBQUssdUJBQUwsR0F0QmdCOzs7O3FDQXlCRCxVQUFVLFVBQVU7QUFDbkMsaUNBaERpQiw4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Q0FBRDs7QUFFN0IsZ0JBQVEsTUFBTSxDQUFOLEdBQVUsS0FBSyxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBdEI7T0FKVixFQXZCd0I7Ozs7bUNBZ0NYO0FBQ2IsVUFBTSxlQUFlLENBQWYsQ0FETztBQUViLFVBQU0sTUFBTSxLQUFLLEVBQUwsR0FBVSxDQUFWLENBRkM7O0FBSWIsVUFBSSxXQUFXLEVBQVgsQ0FKUztBQUtiLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDckMsZ0RBQ0ssWUFDSCxLQUFLLEdBQUwsQ0FBUyxNQUFNLENBQU4sR0FBVSxZQUFWLEdBQ1QsS0FBSyxHQUFMLENBQVMsTUFBTSxDQUFOLEdBQVUsWUFBVixHQUNULEdBSkYsQ0FEcUM7T0FBdkM7O0FBU0EsYUFBTztBQUNMLFlBQUksS0FBSyxFQUFMO0FBQ0osa0JBQVUsY0FBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFWO0FBQ0EsbUJBQVcsSUFBWDtPQUpGLENBZGE7Ozs7U0F2SEkiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi4vbGF5ZXInO1xuaW1wb3J0IHtQcm9ncmFtfSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEhleGFnb25MYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZG90UmFkaXVzIC0gaGV4YWdvbiByYWRpdXNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZWxldmF0aW9uIC0gaGV4YWdvbiBoZWlnaHRcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkhleGFnb25Ib3ZlcmVkKGluZGV4LCBlKSAtIHBvcHVwIHNlbGVjdGVkIGluZGV4XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25IZXhhZ29uQ2xpY2tlZChpbmRleCwgZSkgLSBwb3B1cCBzZWxlY3RlZCBpbmRleFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKHtcbiAgICAgIGRvdFJhZGl1czogMTAsXG4gICAgICBlbGV2YXRpb246IDEwMSxcbiAgICAgIC4uLm9wdHNcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKFxuICAgICAgZ2wsXG4gICAgICBnbHNsaWZ5KCcuL3ZlcnRleC5nbHNsJyksXG4gICAgICBnbHNsaWZ5KCcuL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdoZXhhZ29uJ1xuICAgICk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmU6IHRoaXMuZ2V0UHJpbWl0aXZlKClcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCB2aWV3cG9ydENoYW5nZWQsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmIChkYXRhQ2hhbmdlZCB8fCB2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZXMuaW52YWxpZGF0ZSgncG9zaXRpb25zJyk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gICAgfVxuICAgIGlmIChkYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlcy5pbnZhbGlkYXRlKCdjb2xvcnMnKTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGhleGFnb24gb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gaGV4YWdvbi5jZW50cm9pZC54O1xuICAgICAgdmFsdWVbaSArIDFdID0gaGV4YWdvbi5jZW50cm9pZC55O1xuICAgICAgdmFsdWVbaSArIDJdID0gdGhpcy5wcm9wcy5lbGV2YXRpb247XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBoZXhhZ29uIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGhleGFnb24uY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBoZXhhZ29uLmNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gaGV4YWdvbi5jb2xvclsyXTtcbiAgICAgIGkgKz0gMztcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIHRoaXMgaXMgdGhlIG9ubHkgcGxhY2UgdGhhdCB1c2VzIGhleGFnb24gdmVydGljZXNcbiAgLy8gY29uc2lkZXIgbW92ZSByYWRpdXMgYW5kIGFuZ2xlIGNhbGN1bGF0aW9uIHRvIHRoZSBzaGFkZXJcbiAgY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGRhdGFbMF0udmVydGljZXM7XG4gICAgY29uc3QgdmVydGV4MCA9IHZlcnRpY2VzWzBdO1xuICAgIGNvbnN0IHZlcnRleDMgPSB2ZXJ0aWNlc1szXTtcblxuICAgIC8vIHRyYW5zZm9ybSB0byBzcGFjZSBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNwYWNlQ29vcmQwID0gdGhpcy5wcm9qZWN0KFt2ZXJ0ZXgwWzBdLCB2ZXJ0ZXgwWzFdXSk7XG4gICAgY29uc3Qgc3BhY2VDb29yZDMgPSB0aGlzLnByb2plY3QoW3ZlcnRleDNbMF0sIHZlcnRleDNbMV1dKTtcblxuICAgIC8vIG1hcCBmcm9tIHNwYWNlIGNvb3JkaW5hdGVzIHRvIHNjcmVlbiBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNjcmVlbkNvb3JkMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShzcGFjZUNvb3JkMC54LCBzcGFjZUNvb3JkMC55KTtcbiAgICBjb25zdCBzY3JlZW5Db29yZDMgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDMueCwgc3BhY2VDb29yZDMueSk7XG5cbiAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjbG9zZSBjZW50cm9pZHNcbiAgICBjb25zdCBkeCA9IHNjcmVlbkNvb3JkMC54IC0gc2NyZWVuQ29vcmQzLng7XG4gICAgY29uc3QgZHkgPSBzY3JlZW5Db29yZDAueSAtIHNjcmVlbkNvb3JkMy55O1xuICAgIGNvbnN0IGR4eSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgICBhbmdsZTogTWF0aC5hY29zKGR4IC8gZHh5KSAqIC1NYXRoLnNpZ24oZHkpLFxuICAgICAgLy8gQWxsb3cgdXNlciB0byBmaW5lIHR1bmUgcmFkaXVzXG4gICAgICByYWRpdXM6IGR4eSAvIDIgKiBNYXRoLm1pbigxLCB0aGlzLnByb3BzLmRvdFJhZGl1cylcbiAgICB9KTtcblxuICB9XG5cbiAgZ2V0UHJpbWl0aXZlKCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==