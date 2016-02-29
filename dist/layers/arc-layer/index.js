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
  positions: { size: 4, '0': 'x0', '1': 'y0', '2': 'x1', '3': 'y1' }
};

var ArcLayer = function (_MapLayer) {
  _inherits(ArcLayer, _MapLayer);

  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */

  function ArcLayer(opts) {
    _classCallCheck(this, ArcLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ArcLayer).call(this, opts));
  }

  _createClass(ArcLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'initializeState', this).call(this);
      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      var program = new _luma.Program(gl, glslify(__dirname + '/vertex.glsl'), glslify(__dirname + '/fragment.glsl'), 'arc');

      var primitive = _extends({
        id: this.id,
        instanced: true
      }, this.getGeometry());

      this.setState({
        program: program,
        primitive: primitive
      });

      attributes.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions }
      });

      this.updateColors();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, nextProps) {
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'willReceiveProps', this).call(this, oldProps, nextProps);
      this.updateColors();
    }
  }, {
    key: 'updateColors',
    value: function updateColors() {
      // Get colors from first object
      var object = this.getFirstObject();
      if (object) {
        this.setUniforms({
          color0: object.colors.c0,
          color1: object.colors.c1
        });
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
          var arc = _step.value;

          value[i + 0] = arc.position.x0;
          value[i + 1] = arc.position.y0;
          value[i + 2] = arc.position.x1;
          value[i + 3] = arc.position.y1;
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
    key: 'getGeometry',
    value: function getGeometry() {
      var vertices = [];
      var NUM_SEGMENTS = 50;
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [i, i, i]);
      }
      return {
        drawType: 'LINE_STRIP',
        vertices: new Float32Array(vertices)
      };
    }
  }]);

  return ArcLayer;
}(_mapLayer2.default);

exports.default = ArcLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUF0RDtDQURJOztJQUllOzs7Ozs7Ozs7OztBQVFuQixXQVJtQixRQVFuQixDQUFZLElBQVosRUFBa0I7MEJBUkMsVUFRRDs7a0VBUkMscUJBU1gsT0FEVTtHQUFsQjs7ZUFSbUI7O3NDQVlEO0FBQ2hCLGlDQWJpQix3REFhakIsQ0FEZ0I7bUJBRVMsS0FBSyxLQUFMLENBRlQ7VUFFVCxlQUZTO1VBRUwsK0JBRks7OztBQUloQixVQUFNLFVBQVUsa0JBQ2QsRUFEYyxFQUVkLFFBQVEsWUFBWSxjQUFaLENBRk0sRUFHZCxRQUFRLFlBQVksZ0JBQVosQ0FITSxFQUlkLEtBSmMsQ0FBVixDQUpVOztBQVdoQixVQUFNO0FBQ0osWUFBSSxLQUFLLEVBQUw7QUFDSixtQkFBVyxJQUFYO1NBQ0csS0FBSyxXQUFMLEdBSEMsQ0FYVTs7QUFpQmhCLFdBQUssUUFBTCxDQUFjO0FBQ1osd0JBRFk7QUFFWiw0QkFGWTtPQUFkLEVBakJnQjs7QUFzQmhCLGlCQUFXLFlBQVgsQ0FBd0IsVUFBeEIsRUFBb0M7QUFDbEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7T0FERixFQXRCZ0I7O0FBMEJoQixXQUFLLFlBQUwsR0ExQmdCOzs7O3FDQTZCRCxVQUFVLFdBQVc7QUFDcEMsaUNBMUNpQiwwREEwQ00sVUFBVSxVQUFqQyxDQURvQztBQUVwQyxXQUFLLFlBQUwsR0FGb0M7Ozs7bUNBS3ZCOztBQUViLFVBQU0sU0FBUyxLQUFLLGNBQUwsRUFBVCxDQUZPO0FBR2IsVUFBSSxNQUFKLEVBQVk7QUFDVixhQUFLLFdBQUwsQ0FBaUI7QUFDZixrQkFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkO0FBQ1Isa0JBQVEsT0FBTyxNQUFQLENBQWMsRUFBZDtTQUZWLEVBRFU7T0FBWjs7Ozt1Q0FRaUIsV0FBVztVQUNyQixPQUFRLEtBQUssS0FBTCxDQUFSLEtBRHFCO1VBRXJCLFFBQWUsVUFBZixNQUZxQjtVQUVkLE9BQVEsVUFBUixLQUZjOztBQUc1QixVQUFJLElBQUksQ0FBSixDQUh3Qjs7Ozs7O0FBSTVCLDZCQUFrQiw4QkFBbEIsb0dBQXdCO2NBQWIsa0JBQWE7O0FBQ3RCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQURPO0FBRXRCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUZPO0FBR3RCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUhPO0FBSXRCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUpPO0FBS3RCLGVBQUssSUFBTCxDQUxzQjtTQUF4Qjs7Ozs7Ozs7Ozs7Ozs7T0FKNEI7Ozs7a0NBYWhCO0FBQ1osVUFBSSxXQUFXLEVBQVgsQ0FEUTtBQUVaLFVBQU0sZUFBZSxFQUFmLENBRk07QUFHWixXQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxZQUFKLEVBQWtCLEdBQWxDLEVBQXVDO0FBQ3JDLGdEQUFlLFlBQVUsR0FBRyxHQUFHLEdBQS9CLENBRHFDO09BQXZDO0FBR0EsYUFBTztBQUNMLGtCQUFVLFlBQVY7QUFDQSxrQkFBVSxJQUFJLFlBQUosQ0FBaUIsUUFBakIsQ0FBVjtPQUZGLENBTlk7Ozs7U0F0RUsiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTWFwTGF5ZXIgZnJvbSAnLi4vbWFwLWxheWVyJztcbmltcG9ydCB7UHJvZ3JhbX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiA0LCAnMCc6ICd4MCcsICcxJzogJ3kwJywgJzInOiAneDEnLCAnMyc6ICd5MSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmNMYXllciBleHRlbmRzIE1hcExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQXJjTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIob3B0cyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0oXG4gICAgICBnbCxcbiAgICAgIGdsc2xpZnkoX19kaXJuYW1lICsgJy92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeShfX2Rpcm5hbWUgKyAnL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdhcmMnXG4gICAgKTtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlLFxuICAgICAgLi4udGhpcy5nZXRHZW9tZXRyeSgpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHByaW1pdGl2ZVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc31cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICB1cGRhdGVDb2xvcnMoKSB7XG4gICAgLy8gR2V0IGNvbG9ycyBmcm9tIGZpcnN0IG9iamVjdFxuICAgIGNvbnN0IG9iamVjdCA9IHRoaXMuZ2V0Rmlyc3RPYmplY3QoKTtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgICAgY29sb3IwOiBvYmplY3QuY29sb3JzLmMwLFxuICAgICAgICBjb2xvcjE6IG9iamVjdC5jb2xvcnMuYzFcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgYXJjIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGFyYy5wb3NpdGlvbi54MDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGFyYy5wb3NpdGlvbi55MDtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGFyYy5wb3NpdGlvbi54MTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGFyYy5wb3NpdGlvbi55MTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBnZXRHZW9tZXRyeSgpIHtcbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA1MDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFsuLi52ZXJ0aWNlcywgaSwgaSwgaV07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkcmF3VHlwZTogJ0xJTkVfU1RSSVAnLFxuICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=