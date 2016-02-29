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


      var program = new _luma.Program(gl, glslify(__dirname + '/vertex.glsl'), glslify(__dirname + '/fragment.glsl'), 'hexagon');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvaGV4YWdvbi1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBekM7QUFDQSxVQUFRLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxLQUFMLEVBQVksS0FBSyxPQUFMLEVBQWMsS0FBSyxNQUFMLEVBQTVDO0NBRkk7O0lBS2U7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY25CLFdBZG1CLFlBY25CLENBQVksSUFBWixFQUFrQjswQkFkQyxjQWNEOztrRUFkQztBQWdCZixpQkFBVyxFQUFYO0FBQ0EsaUJBQVcsR0FBWDtPQUNHLFFBSlc7R0FBbEI7O2VBZG1COztzQ0FzQkQ7QUFDaEIsaUNBdkJpQiw0REF1QmpCLENBRGdCOzttQkFHUyxLQUFLLEtBQUwsQ0FIVDtVQUdULGVBSFM7VUFHTCwrQkFISzs7O0FBS2hCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxZQUFZLGNBQVosQ0FGTSxFQUdkLFFBQVEsWUFBWSxnQkFBWixDQUhNLEVBSWQsU0FKYyxDQUFWLENBTFU7O0FBWWhCLFdBQUssUUFBTCxDQUFjO0FBQ1osd0JBRFk7QUFFWixtQkFBVyxLQUFLLFlBQUwsRUFBWDtPQUZGLEVBWmdCOztBQWlCaEIsaUJBQVcsWUFBWCxDQUF3QixVQUF4QixFQUFvQztBQUNsQyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtBQUNBLGdCQUFRLEVBQUMsUUFBUSxLQUFLLGVBQUwsRUFBakI7T0FGRixFQWpCZ0I7O0FBc0JoQixXQUFLLHVCQUFMLEdBdEJnQjs7OztxQ0F5QkQsVUFBVSxVQUFVO0FBQ25D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Q0FBVSxFQUFWLENBQUQ7O0FBRTdCLGdCQUFRLE1BQU0sQ0FBTixHQUFVLEtBQUssR0FBTCxDQUFTLENBQVQsRUFBWSxLQUFLLEtBQUwsQ0FBVyxTQUFYLENBQXRCO09BSlYsRUF2QndCOzs7O21DQWdDWDtBQUNiLFVBQU0sZUFBZSxDQUFmLENBRE87QUFFYixVQUFNLE1BQU0sS0FBSyxFQUFMLEdBQVUsQ0FBVixDQUZDOztBQUliLFVBQUksV0FBVyxFQUFYLENBSlM7QUFLYixXQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxZQUFKLEVBQWtCLEdBQWxDLEVBQXVDO0FBQ3JDLGdEQUNLLFlBQ0gsS0FBSyxHQUFMLENBQVMsTUFBTSxDQUFOLEdBQVUsWUFBVixHQUNULEtBQUssR0FBTCxDQUFTLE1BQU0sQ0FBTixHQUFVLFlBQVYsR0FDVCxHQUpGLENBRHFDO09BQXZDOztBQVNBLGFBQU87QUFDTCxZQUFJLEtBQUssRUFBTDtBQUNKLGtCQUFVLGNBQVY7QUFDQSxrQkFBVSxJQUFJLFlBQUosQ0FBaUIsUUFBakIsQ0FBVjtBQUNBLG1CQUFXLElBQVg7T0FKRixDQWRhOzs7O1NBdkhJIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IE1hcExheWVyIGZyb20gJy4uL21hcC1sYXllcic7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhleGFnb25MYXllciBleHRlbmRzIE1hcExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogSGV4YWdvbkxheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5kb3RSYWRpdXMgLSBoZXhhZ29uIHJhZGl1c1xuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5lbGV2YXRpb24gLSBoZXhhZ29uIGhlaWdodFxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBvcHRzLm9uSGV4YWdvbkhvdmVyZWQoaW5kZXgsIGUpIC0gcG9wdXAgc2VsZWN0ZWQgaW5kZXhcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb3B0cy5vbkhleGFnb25DbGlja2VkKGluZGV4LCBlKSAtIHBvcHVwIHNlbGVjdGVkIGluZGV4XG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIoe1xuICAgICAgZG90UmFkaXVzOiAxMCxcbiAgICAgIGVsZXZhdGlvbjogMTAxLFxuICAgICAgLi4ub3B0c1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuXG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0oXG4gICAgICBnbCxcbiAgICAgIGdsc2xpZnkoX19kaXJuYW1lICsgJy92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeShfX2Rpcm5hbWUgKyAnL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdoZXhhZ29uJ1xuICAgICk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmU6IHRoaXMuZ2V0UHJpbWl0aXZlKClcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgY29uc3Qge2RhdGFDaGFuZ2VkLCB2aWV3cG9ydENoYW5nZWQsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmIChkYXRhQ2hhbmdlZCB8fCB2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIGF0dHJpYnV0ZXMuaW52YWxpZGF0ZSgncG9zaXRpb25zJyk7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVJhZGl1c0FuZEFuZ2xlKCk7XG4gICAgfVxuICAgIGlmIChkYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlcy5pbnZhbGlkYXRlKCdjb2xvcnMnKTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGhleGFnb24gb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gaGV4YWdvbi5jZW50cm9pZC54O1xuICAgICAgdmFsdWVbaSArIDFdID0gaGV4YWdvbi5jZW50cm9pZC55O1xuICAgICAgdmFsdWVbaSArIDJdID0gdGhpcy5wcm9wcy5lbGV2YXRpb247XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBoZXhhZ29uIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGhleGFnb24uY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBoZXhhZ29uLmNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gaGV4YWdvbi5jb2xvclsyXTtcbiAgICAgIGkgKz0gMztcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIHRoaXMgaXMgdGhlIG9ubHkgcGxhY2UgdGhhdCB1c2VzIGhleGFnb24gdmVydGljZXNcbiAgLy8gY29uc2lkZXIgbW92ZSByYWRpdXMgYW5kIGFuZ2xlIGNhbGN1bGF0aW9uIHRvIHRoZSBzaGFkZXJcbiAgY2FsY3VsYXRlUmFkaXVzQW5kQW5nbGUoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWRhdGEgfHwgZGF0YS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJ0aWNlcyA9IGRhdGFbMF0udmVydGljZXM7XG4gICAgY29uc3QgdmVydGV4MCA9IHZlcnRpY2VzWzBdO1xuICAgIGNvbnN0IHZlcnRleDMgPSB2ZXJ0aWNlc1szXTtcblxuICAgIC8vIHRyYW5zZm9ybSB0byBzcGFjZSBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNwYWNlQ29vcmQwID0gdGhpcy5wcm9qZWN0KFt2ZXJ0ZXgwWzBdLCB2ZXJ0ZXgwWzFdXSk7XG4gICAgY29uc3Qgc3BhY2VDb29yZDMgPSB0aGlzLnByb2plY3QoW3ZlcnRleDNbMF0sIHZlcnRleDNbMV1dKTtcblxuICAgIC8vIG1hcCBmcm9tIHNwYWNlIGNvb3JkaW5hdGVzIHRvIHNjcmVlbiBjb29yZGluYXRlc1xuICAgIGNvbnN0IHNjcmVlbkNvb3JkMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShzcGFjZUNvb3JkMC54LCBzcGFjZUNvb3JkMC55KTtcbiAgICBjb25zdCBzY3JlZW5Db29yZDMgPSB0aGlzLnNjcmVlblRvU3BhY2Uoc3BhY2VDb29yZDMueCwgc3BhY2VDb29yZDMueSk7XG5cbiAgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBjbG9zZSBjZW50cm9pZHNcbiAgICBjb25zdCBkeCA9IHNjcmVlbkNvb3JkMC54IC0gc2NyZWVuQ29vcmQzLng7XG4gICAgY29uc3QgZHkgPSBzY3JlZW5Db29yZDAueSAtIHNjcmVlbkNvb3JkMy55O1xuICAgIGNvbnN0IGR4eSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIENhbGN1bGF0ZSBhbmdsZSB0aGF0IHRoZSBwZXJwZW5kaWN1bGFyIGhleGFnb24gdmVydGV4IGF4aXMgaXMgdGlsdGVkXG4gICAgICBhbmdsZTogTWF0aC5hY29zKGR4IC8gZHh5KSAqIC1NYXRoLnNpZ24oZHkpLFxuICAgICAgLy8gQWxsb3cgdXNlciB0byBmaW5lIHR1bmUgcmFkaXVzXG4gICAgICByYWRpdXM6IGR4eSAvIDIgKiBNYXRoLm1pbigxLCB0aGlzLnByb3BzLmRvdFJhZGl1cylcbiAgICB9KTtcblxuICB9XG5cbiAgZ2V0UHJpbWl0aXZlKCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHRoaXMuaWQsXG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9O1xuICB9XG5cbn1cbiJdfQ==