'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

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


      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'scatterplot');

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
}(_layer2.default);

exports.default = ScatterplotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7O0FBWXhCLFdBZG1CLGdCQWNuQixDQUFZLEtBQVosRUFBbUI7MEJBZEEsa0JBY0E7O2tFQWRBLDZCQWVYLFFBRFc7R0FBbkI7O2VBZG1COztzQ0FrQkQ7QUFDaEIsaUNBbkJpQixnRUFtQmpCLENBRGdCOztVQUdULEtBQU0sS0FBSyxLQUFMLENBQU4sR0FIUztVQUlULGFBQWMsS0FBSyxLQUFMLENBQWQsV0FKUzs7O0FBTWhCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxlQUFSLENBRmMsRUFHZCxRQUFRLGlCQUFSLENBSGMsRUFJZCxhQUpjLENBQVYsQ0FOVTs7QUFhaEIsVUFBTTtBQUNKLFlBQUksS0FBSyxFQUFMO0FBQ0osbUJBQVcsSUFBWDtTQUNHLEtBQUssV0FBTCxHQUhDLENBYlU7O0FBbUJoQixXQUFLLFFBQUwsQ0FBYztBQUNaLHdCQURZO0FBRVosNEJBRlk7T0FBZCxFQW5CZ0I7O0FBd0JoQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DO0FBQ2xDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFB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QWJMO0FBY2pCLFVBQU0sS0FBSyxPQUFPLENBQVAsR0FBVyxPQUFPLENBQVAsQ0FkTDs7QUFnQmpCLFdBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxHQUFMLENBQVMsS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUFMLENBQTdCLEVBQXVDLEdBQXZDLENBQXBCLENBaEJpQjs7OztTQTdHQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBMYXllciBmcm9tICcuLi9sYXllcic7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjYXR0ZXJwbG90TGF5ZXIgZXh0ZW5kcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogU2NhdHRlcnBsb3RMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IHByb3BzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5yYWRpdXMgLSBwb2ludCByYWRpdXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuXG4gICAgY29uc3Qge2dsfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShcbiAgICAgIGdsLFxuICAgICAgZ2xzbGlmeSgnLi92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeSgnLi9mcmFnbWVudC5nbHNsJyksXG4gICAgICAnc2NhdHRlcnBsb3QnXG4gICAgKTtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlLFxuICAgICAgLi4udGhpcy5nZXRHZW9tZXRyeSgpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHByaW1pdGl2ZVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc30sXG4gICAgICBjb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfVxuICAgIH0pO1xuICB9XG5cbiAgZGlkTW91bnQoKSB7XG4gICAgdGhpcy51cGRhdGVSYWRpdXMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlUmFkaXVzKCk7XG4gIH1cblxuICB1cGRhdGVSYWRpdXMoKSB7XG4gICAgdGhpcy5fY2FsY3VsYXRlUmFkaXVzKCk7XG4gICAgY29uc3Qge3JhZGl1c30gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgcmFkaXVzXG4gICAgfSk7XG4gIH1cblxuICBnZXRHZW9tZXRyeSgpIHtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSAxNjtcbiAgICBjb25zdCBQSTIgPSBNYXRoLlBJICogMjtcblxuICAgIGxldCB2ZXJ0aWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTlVNX1NFR01FTlRTOyBpKyspIHtcbiAgICAgIHZlcnRpY2VzID0gW1xuICAgICAgICAuLi52ZXJ0aWNlcyxcbiAgICAgICAgTWF0aC5jb3MoUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIE1hdGguc2luKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICAwXG4gICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBkcmF3VHlwZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcylcbiAgICB9O1xuICB9XG5cbiAgY2FsY3VsYXRlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBwb2ludC5wb3NpdGlvbi54O1xuICAgICAgdmFsdWVbaSArIDFdID0gcG9pbnQucG9zaXRpb24ueTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IHBvaW50LnBvc2l0aW9uLno7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBwb2ludC5jb2xvclswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHBvaW50LmNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gcG9pbnQuY29sb3JbMl07XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgX2NhbGN1bGF0ZVJhZGl1cygpIHtcbiAgICAvLyB1c2UgcmFkaXVzIGlmIHNwZWNpZmllZFxuICAgIGlmICh0aGlzLnByb3BzLnJhZGl1cykge1xuICAgICAgdGhpcy5zdGF0ZS5yYWRpdXMgPSB0aGlzLnByb3BzLnJhZGl1cztcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwaXhlbDAgPSB0aGlzLnByb2plY3QoWy0xMjIsIDM3LjVdKTtcbiAgICBjb25zdCBwaXhlbDEgPSB0aGlzLnByb2plY3QoWy0xMjIsIDM3LjUwMDJdKTtcblxuICAgIGNvbnN0IHNwYWNlMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDAueCwgcGl4ZWwwLnkpO1xuICAgIGNvbnN0IHNwYWNlMSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDEueCwgcGl4ZWwxLnkpO1xuXG4gICAgY29uc3QgZHggPSBzcGFjZTAueCAtIHNwYWNlMS54O1xuICAgIGNvbnN0IGR5ID0gc3BhY2UwLnkgLSBzcGFjZTEueTtcblxuICAgIHRoaXMuc3RhdGUucmFkaXVzID0gTWF0aC5tYXgoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgMi4wKTtcbiAgfVxuXG59XG4iXX0=