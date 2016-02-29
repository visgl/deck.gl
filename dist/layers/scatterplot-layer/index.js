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
}(_mapLayer2.default);

exports.default = ScatterplotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkEsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7O0FBWXhCLFdBZG1CLGdCQWNuQixDQUFZLEtBQVosRUFBbUI7MEJBZEEsa0JBY0E7O2tFQWRBLDZCQWVYLFFBRFc7R0FBbkI7O2VBZG1COztzQ0FrQkQ7QUFDaEIsaUNBbkJpQixnRUFtQmpCLENBRGdCOztVQUdULEtBQU0sS0FBSyxLQUFMLENBQU4sR0FIUztVQUlULGFBQWMsS0FBSyxLQUFMLENBQWQsV0FKUzs7O0FBTWhCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxlQUFSLENBRmMsRUFHZCxRQUFRLGlCQUFSLENBSGMsRUFJZCxhQUpjLENBQVYsQ0FOVTs7QUFhaEIsVUFBTTtBQUNKLFlBQUksS0FBSyxFQUFMO0FBQ0osbUJBQVcsSUFBWDtTQUNHLEtBQUssV0FBTCxHQUhDLENBYlU7O0FBbUJoQixXQUFLLFFBQUwsQ0FBYztBQUNaLHdCQURZO0FBRVosNEJBRlk7T0FBZCxFQW5CZ0I7O0FBd0JoQixpQkFBVyxZQUFYLENBQXdCLFVBQXhCLEVBQW9DO0FBQ2xDLG1CQUFXLEVBQUMsUUFBUSxLQUFLLGtCQUFMLEVBQXBCO0FBQ0EsZ0JBQVEsRUFBQyxRQUFRLEtBQUssZUFB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QWJMO0FBY2pCLFVBQU0sS0FBSyxPQUFPLENBQVAsR0FBVyxPQUFPLENBQVAsQ0FkTDs7QUFnQmpCLFdBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxHQUFMLENBQVMsS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUFMLENBQTdCLEVBQXVDLEdBQXZDLENBQXBCLENBaEJpQjs7OztTQTdHQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBNYXBMYXllciBmcm9tICcuLi9tYXAtbGF5ZXInO1xuaW1wb3J0IHtQcm9ncmFtfSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2F0dGVycGxvdExheWVyIGV4dGVuZHMgTWFwTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIFNjYXR0ZXJwbG90TGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvcHMucmFkaXVzIC0gcG9pbnQgcmFkaXVzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIGNvbnN0IHtnbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0oXG4gICAgICBnbCxcbiAgICAgIGdsc2xpZnkoJy4vdmVydGV4Lmdsc2wnKSxcbiAgICAgIGdsc2xpZnkoJy4vZnJhZ21lbnQuZ2xzbCcpLFxuICAgICAgJ3NjYXR0ZXJwbG90J1xuICAgICk7XG5cbiAgICBjb25zdCBwcmltaXRpdmUgPSB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGluc3RhbmNlZDogdHJ1ZSxcbiAgICAgIC4uLnRoaXMuZ2V0R2VvbWV0cnkoKVxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmVcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcbiAgfVxuXG4gIGRpZE1vdW50KCkge1xuICAgIHRoaXMudXBkYXRlUmFkaXVzKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLnVwZGF0ZVJhZGl1cygpO1xuICB9XG5cbiAgdXBkYXRlUmFkaXVzKCkge1xuICAgIHRoaXMuX2NhbGN1bGF0ZVJhZGl1cygpO1xuICAgIGNvbnN0IHtyYWRpdXN9ID0gdGhpcy5zdGF0ZTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIHJhZGl1c1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0R2VvbWV0cnkoKSB7XG4gICAgY29uc3QgTlVNX1NFR01FTlRTID0gMTY7XG4gICAgY29uc3QgUEkyID0gTWF0aC5QSSAqIDI7XG5cbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFtcbiAgICAgICAgLi4udmVydGljZXMsXG4gICAgICAgIE1hdGguY29zKFBJMiAqIGkgLyBOVU1fU0VHTUVOVFMpLFxuICAgICAgICBNYXRoLnNpbihQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgMFxuICAgICAgXTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgZHJhd1R5cGU6ICdUUklBTkdMRV9GQU4nLFxuICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpXG4gICAgfTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gcG9pbnQucG9zaXRpb24ueDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHBvaW50LnBvc2l0aW9uLnk7XG4gICAgICB2YWx1ZVtpICsgMl0gPSBwb2ludC5wb3NpdGlvbi56O1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gcG9pbnQuY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBwb2ludC5jb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IHBvaW50LmNvbG9yWzJdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIF9jYWxjdWxhdGVSYWRpdXMoKSB7XG4gICAgLy8gdXNlIHJhZGl1cyBpZiBzcGVjaWZpZWRcbiAgICBpZiAodGhpcy5wcm9wcy5yYWRpdXMpIHtcbiAgICAgIHRoaXMuc3RhdGUucmFkaXVzID0gdGhpcy5wcm9wcy5yYWRpdXM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGl4ZWwwID0gdGhpcy5wcm9qZWN0KFstMTIyLCAzNy41XSk7XG4gICAgY29uc3QgcGl4ZWwxID0gdGhpcy5wcm9qZWN0KFstMTIyLCAzNy41MDAyXSk7XG5cbiAgICBjb25zdCBzcGFjZTAgPSB0aGlzLnNjcmVlblRvU3BhY2UocGl4ZWwwLngsIHBpeGVsMC55KTtcbiAgICBjb25zdCBzcGFjZTEgPSB0aGlzLnNjcmVlblRvU3BhY2UocGl4ZWwxLngsIHBpeGVsMS55KTtcblxuICAgIGNvbnN0IGR4ID0gc3BhY2UwLnggLSBzcGFjZTEueDtcbiAgICBjb25zdCBkeSA9IHNwYWNlMC55IC0gc3BhY2UxLnk7XG5cbiAgICB0aGlzLnN0YXRlLnJhZGl1cyA9IE1hdGgubWF4KE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSksIDIuMCk7XG4gIH1cblxufVxuIl19