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
      _get(Object.getPrototypeOf(HexagonLayer.prototype), 'initializeState', this).call(this);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9oZXhhZ29uLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7Q0FGSTs7SUFLZTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjbkIsV0FkbUIsWUFjbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQWRDLGNBY0Q7O2tFQWRDO0FBZ0JmLGlCQUFXLEVBQVg7QUFDQSxpQkFBVyxHQUFYO09BQ0csUUFKVztHQUFsQjs7ZUFkbUI7O3NDQXNCRDtBQUNoQixpQ0F2QmlCLDREQXVCakIsQ0FEZ0I7O21CQUdlLEtBQUssS0FBTCxDQUhmO1VBR1QsZUFIUztVQUdMLDJDQUhLOzs7QUFLaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssUUFBTCxDQUFjLEVBQWQsQ0FBUDtPQURGLEVBTGdCOztBQVNoQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCO09BRkYsRUFUZ0I7O0FBY2hCLFdBQUssdUJBQUwsR0FkZ0I7Ozs7cUNBaUJELFVBQVUsVUFBVTtBQUNuQyxpQ0F4Q2lCLDhEQXdDTSxVQUFVLFNBQWpDLENBRG1DOztvQkFHc0IsS0FBSyxLQUFMLENBSHRCO1VBRzVCLGtDQUg0QjtVQUdmLDBDQUhlO1VBR0UsNENBSEY7OztB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Y0FBYyxLQUFLLE9BQUwsQ0FBYSxFQUFDLEtBQUssUUFBUSxDQUFSLENBQUwsRUFBaUIsS0FBSyxRQUFRLENBQVIsQ0FBTCxFQUEvQixDQUFkOzs7QUFaa0IsVUFlbEIsZUFBZSxLQUFLLGFBQUwsQ0FBbUIsV0FBbkIsQ0FBZixDQWZrQjtBQWdCeEIsVUFBTSxlQUFlLEtBQUssYUFBTCxDQUFtQixXQUFuQixDQUFmOzs7QUFoQmtCLFVBbUJsQixLQUFLLGFBQWEsQ0FBYixHQUFpQixhQUFhLENBQWIsQ0FuQko7QUFvQnhCLFVBQU0sS0FBSyxhQUFhLENBQWIsR0FBaUIsYUFBYSxDQUFiLENBcEJKO0FBcUJ4QixVQUFNLE1BQU0sS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUFMLENBQTFCLENBckJrQjs7QUF1QnhCLFdBQUssV0FBTCxDQUFpQjs7QUFFZixlQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssR0FBTCxDQUFWLEdBQXNCLENBQUMsS0FBSyxJQUFMLENBQVUsRUFBVixDQUFEOztBQUU3QixnQkFBUSxNQUFNLENBQU4sR0FBVSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksS0FBSyxLQUFMLENBQVcsU0FBWCxDQUF0QjtPQUpWLEVBdkJ3Qjs7OztTQTVHUCIsImZpbGUiOiJoZXhhZ29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWwsIFByb2dyYW0sIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEhleGFnb25MYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZG90UmFkaXVzIC0gaGV4YWdvbiByYWRpdXNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuZWxldmF0aW9uIC0gaGV4YWdvbiBoZWlnaHRcbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkhleGFnb25Ib3ZlcmVkKGluZGV4LCBlKSAtIHBvcHVwIHNlbGVjdGVkIGluZGV4XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IG9wdHMub25IZXhhZ29uQ2xpY2tlZChpbmRleCwgZSkgLSBwb3B1cCBzZWxlY3RlZCBpbmRleFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKHtcbiAgICAgIGRvdFJhZGl1czogMTAsXG4gICAgICBlbGV2YXRpb246IDEwMSxcbiAgICAgIC4uLm9wdHNcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtb2RlbDogdGhpcy5nZXRNb2RlbChnbClcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCB2aWV3cG9ydENoYW5nZWQsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmIChkYXRhQ2hhbmdlZCB8fCB2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZSgncG9zaXRpb25zJyk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gICAgfVxuICAgIGlmIChkYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlKCdjb2xvcnMnKTtcbiAgICB9XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2hleGFnb24tbGF5ZXItdmVydGV4Lmdsc2wnKSxcbiAgICAgICAgZnM6IGdsc2xpZnkoJy4vaGV4YWdvbi1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnaGV4YWdvbidcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgaGV4YWdvbiBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBoZXhhZ29uLmNlbnRyb2lkLng7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBoZXhhZ29uLmNlbnRyb2lkLnk7XG4gICAgICB2YWx1ZVtpICsgMl0gPSB0aGlzLnByb3BzLmVsZXZhdGlvbjtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGhleGFnb24gb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gaGV4YWdvbi5jb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGhleGFnb24uY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBoZXhhZ29uLmNvbG9yWzJdO1xuICAgICAgaSArPSAzO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gdGhpcyBpcyB0aGUgb25seSBwbGFjZSB0aGF0IHVzZXMgaGV4YWdvbiB2ZXJ0aWNlc1xuICAvLyBjb25zaWRlciBtb3ZlIHJhZGl1cyBhbmQgYW5nbGUgY2FsY3VsYXRpb24gdG8gdGhlIHNoYWRlclxuICBjYWxjdWxhdGVSYWRpdXNBbmRBbmdsZSgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghZGF0YSB8fCBkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnRpY2VzID0gZGF0YVswXS52ZXJ0aWNlcztcbiAgICBjb25zdCB2ZXJ0ZXgwID0gdmVydGljZXNbMF07XG4gICAgY29uc3QgdmVydGV4MyA9IHZlcnRpY2VzWzNdO1xuXG4gICAgLy8gdHJhbnNmb3JtIHRvIHNwYWNlIGNvb3JkaW5hdGVzXG4gICAgY29uc3Qgc3BhY2VDb29yZDAgPSB0aGlzLnByb2plY3Qoe2xhdDogdmVydGV4MFsxXSwgbG9uOiB2ZXJ0ZXgwWzBdfSk7XG4gICAgY29uc3Qgc3BhY2VDb29yZDMgPSB0aGlzLnByb2plY3Qoe2xhdDogdmVydGV4M1sxXSwgbG9uOiB2ZXJ0ZXgzWzBdfSk7XG5cbiAgICAvLyBtYXAgZnJvbSBzcGFjZSBjb29yZGluYXRlcyB0byBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICBjb25zdCBzY3JlZW5Db29yZDAgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDApO1xuICAgIGNvbnN0IHNjcmVlbkNvb3JkMyA9IHRoaXMuc2NyZWVuVG9TcGFjZShzcGFjZUNvb3JkMyk7XG5cbiAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjbG9zZSBjZW50cm9pZHNcbiAgICBjb25zdCBkeCA9IHNjcmVlbkNvb3JkMC54IC0gc2NyZWVuQ29vcmQzLng7XG4gICAgY29uc3QgZHkgPSBzY3JlZW5Db29yZDAueSAtIHNjcmVlbkNvb3JkMy55O1xuICAgIGNvbnN0IGR4eSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgICBhbmdsZTogTWF0aC5hY29zKGR4IC8gZHh5KSAqIC1NYXRoLnNpZ24oZHkpLFxuICAgICAgLy8gQWxsb3cgdXNlciB0byBmaW5lIHR1bmUgcmFkaXVzXG4gICAgICByYWRpdXM6IGR4eSAvIDIgKiBNYXRoLm1pbigxLCB0aGlzLnByb3BzLmRvdFJhZGl1cylcbiAgICB9KTtcblxuICB9XG5cbn1cbiJdfQ==