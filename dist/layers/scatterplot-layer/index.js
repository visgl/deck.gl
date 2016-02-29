'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var ScatterplotLayer = function (_MapLayer) {
  _inherits(ScatterplotLayer, _MapLayer);

  _createClass(ScatterplotLayer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * ScatterplotLayer
     *
     * @class
     * @param {object} props
     * @param {number} props.radius - point radius
     */

  }]);

  function ScatterplotLayer(props) {
    _classCallCheck(this, ScatterplotLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScatterplotLayer).call(this, props));
  }

  _createClass(ScatterplotLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'initializeState', this).call(this);

      var gl = this.state.gl;
      var attributes = this.state.attributes;


      var program = new _luma.Program(gl, glslify(__dirname + '/vertex.glsl'), glslify(__dirname + '/fragment.glsl'), 'scatterplot');

      var primitive = _extends({
        id: this.id,
        instanced: true
      }, this.getGeometry());

      this.setState({
        program: program,
        primitive: primitive
      });

      attributes.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });
    }
  }, {
    key: 'didMount',
    value: function didMount() {
      this.updateRadius();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);
      this.updateRadius();
    }
  }, {
    key: 'updateRadius',
    value: function updateRadius() {
      this._calculateRadius();
      var radius = this.state.radius;

      this.setUniforms({
        radius: radius
      });
    }
  }, {
    key: 'getGeometry',
    value: function getGeometry() {
      var NUM_SEGMENTS = 16;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return {
        drawType: 'TRIANGLE_FAN',
        vertices: new Float32Array(vertices)
      };
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
          var point = _step.value;

          value[i + 0] = point.position.x;
          value[i + 1] = point.position.y;
          value[i + 2] = point.position.z;
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
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          value[i + 0] = point.color[0];
          value[i + 1] = point.color[1];
          value[i + 2] = point.color[2];
          i += size;
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
  }, {
    key: '_calculateRadius',
    value: function _calculateRadius() {
      // use radius if specified
      if (this.props.radius) {
        this.state.radius = this.props.radius;
        return;
      }

      var pixel0 = this.project([-122, 37.5]);
      var pixel1 = this.project([-122, 37.5002]);

      var space0 = this.screenToSpace(pixel0.x, pixel0.y);
      var space1 = this.screenToSpace(pixel1.x, pixel1.y);

      var dx = space0.x - space1.x;
      var dy = space0.y - space1.y;

      this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
    }
  }]);

  return ScatterplotLayer;
}(_mapLayer2.default);

exports.default = ScatterplotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7O0FBWXhCLFdBZG1CLGdCQWNuQixDQUFZLEtBQVosRUFBbUI7MEJBZEEsa0JBY0E7O2tFQWRBLDZCQWVYLFFBRFc7R0FBbkI7O2VBZG1COztzQ0FrQkQ7QUFDaEIsaUNBbkJpQixnRUFtQmpCLENBRGdCOztVQUdULEtBQU0sS0FBSyxLQUFMLENBQU4sR0FIUztVQUlULGFBQWMsS0FBSyxLQUFMLENBQWQsV0FKUzs7O0FBTWhCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxZQUFZLGNBQVosQ0FGTSxFQUdkLFFBQVEsWUFBWSxnQkFBWixDQUhNLEVBSWQsYUFKYyxDQUFWLENBTlU7O0FBYWhCLFVBQU07QUFDSixZQUFJLEtBQUssRUFBTDtBQUNKLG1CQUFXLElBQVg7U0FDRyxLQUFLLFdBQUwsR0FIQyxDQWJVOztBQW1CaEIsV0FBSyxRQUFMLENBQWM7QUFDWix3QkFEWTtBQUVaLDRCQUZZO09BQWQsRUFuQmdCOztBQXdCaEIsaUJBQVcsWUFBWCxDQUF3QixVQUF4QixFQUFvQztBQUNsQyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtBQUNBLGdCQUFRLEVBQUMsUUFB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QUFPLENBQVAsQ0FiTDtBQWNqQixVQUFNLEtBQUssT0FBTyxDQUFQLEdBQVcsT0FBTyxDQUFQLENBZEw7O0FBZ0JqQixXQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLEtBQUssR0FBTCxDQUFTLEtBQUssSUFBTCxDQUFVLEtBQUssRUFBTCxHQUFVLEtBQUssRUFBTCxDQUE3QixFQUF1QyxHQUF2QyxDQUFwQixDQWhCaUI7Ozs7U0E3R0EiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTWFwTGF5ZXIgZnJvbSAnLi4vbWFwLWxheWVyJztcbmltcG9ydCB7UHJvZ3JhbX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhdHRlcnBsb3RMYXllciBleHRlbmRzIE1hcExheWVyIHtcblxuICBzdGF0aWMgZ2V0IGF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIEFUVFJJQlVURVM7XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBTY2F0dGVycGxvdExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLnJhZGl1cyAtIHBvaW50IHJhZGl1c1xuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG5cbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKFxuICAgICAgZ2wsXG4gICAgICBnbHNsaWZ5KF9fZGlybmFtZSArICcvdmVydGV4Lmdsc2wnKSxcbiAgICAgIGdsc2xpZnkoX19kaXJuYW1lICsgJy9mcmFnbWVudC5nbHNsJyksXG4gICAgICAnc2NhdHRlcnBsb3QnXG4gICAgKTtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlLFxuICAgICAgLi4udGhpcy5nZXRHZW9tZXRyeSgpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHByaW1pdGl2ZVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc30sXG4gICAgICBjb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfVxuICAgIH0pO1xuICB9XG5cbiAgZGlkTW91bnQoKSB7XG4gICAgdGhpcy51cGRhdGVSYWRpdXMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlUmFkaXVzKCk7XG4gIH1cblxuICB1cGRhdGVSYWRpdXMoKSB7XG4gICAgdGhpcy5fY2FsY3VsYXRlUmFkaXVzKCk7XG4gICAgY29uc3Qge3JhZGl1c30gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgcmFkaXVzXG4gICAgfSk7XG4gIH1cblxuICBnZXRHZW9tZXRyeSgpIHtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSAxNjtcbiAgICBjb25zdCBQSTIgPSBNYXRoLlBJICogMjtcblxuICAgIGxldCB2ZXJ0aWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTlVNX1NFR01FTlRTOyBpKyspIHtcbiAgICAgIHZlcnRpY2VzID0gW1xuICAgICAgICAuLi52ZXJ0aWNlcyxcbiAgICAgICAgTWF0aC5jb3MoUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIE1hdGguc2luKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICAwXG4gICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcylcbiAgICB9O1xuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBwb2ludC5wb3NpdGlvbi54O1xuICAgICAgdmFsdWVbaSArIDFdID0gcG9pbnQucG9zaXRpb24ueTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IHBvaW50LnBvc2l0aW9uLno7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBwb2ludC5jb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHBvaW50LmNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gcG9pbnQuY29sb3JbMl07XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgX2NhbGN1bGF0ZVJhZGl1cygpIHtcbiAgICAvLyB1c2UgcmFkaXVzIGlmIHNwZWNpZmllZFxuICAgIGlmICh0aGlzLnByb3BzLnJhZGl1cykge1xuICAgICAgdGhpcy5zdGF0ZS5yYWRpdXMgPSB0aGlzLnByb3BzLnJhZGl1cztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwaXhlbDAgPSB0aGlzLnByb2plY3QoWy0xMjIsIDM3LjVdKTtcbiAgICBjb25zdCBwaXhlbDEgPSB0aGlzLnByb2plY3QoWy0xMjIsIDM3LjUwMDJdKTtcblxuICAgIGNvbnN0IHNwYWNlMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDAueCwgcGl4ZWwwLnkpO1xuICAgIGNvbnN0IHNwYWNlMSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDEueCwgcGl4ZWwxLnkpO1xuXG4gICAgY29uc3QgZHggPSBzcGFjZTAueCAtIHNwYWNlMS54O1xuICAgIGNvbnN0IGR5ID0gc3BhY2UwLnkgLSBzcGFjZTEueTtcblxuICAgIHRoaXMuc3RhdGUucmFkaXVzID0gTWF0aC5tYXgoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgMi4wKTtcbiAgfVxuXG59XG4iXX0=