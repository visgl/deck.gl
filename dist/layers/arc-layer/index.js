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


      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'arc');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUF0RDtDQURJOztJQUllOzs7Ozs7Ozs7OztBQVFuQixXQVJtQixRQVFuQixDQUFZLElBQVosRUFBa0I7MEJBUkMsVUFRRDs7a0VBUkMscUJBU1gsT0FEVTtHQUFsQjs7ZUFSbUI7O3NDQVlEO0FBQ2hCLGlDQWJpQix3REFhakIsQ0FEZ0I7bUJBRVMsS0FBSyxLQUFMLENBRlQ7VUFFVCxlQUZTO1VBRUwsK0JBRks7OztBQUloQixVQUFNLFVBQVUsa0JBQ2QsRUFEYyxFQUVkLFFBQVEsZUFBUixDQUZjLEVBR2QsUUFBUSxpQkFBUixDQUhjLEVBSWQsS0FKYyxDQUFWLENBSlU7O0FBV2hCLFVBQU07QUFDSixZQUFJLEtBQUssRUFBTDtBQUNKLG1CQUFXLElBQVg7U0FDRyxLQUFLLFdBQUwsR0FIQyxDQVhVOztBQWlCaEIsV0FBSyxRQUFMLENBQWM7QUFDWix3QkFEWTtBQUVaLDRCQUZZO09BQWQsRUFqQmdCOztBQXNCaEIsaUJBQVcsWUFBWCxDQUF3QixVQUF4QixFQUFvQztBQUNsQyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtPQURGLEVBdEJnQjs7QUEwQmhCLFdBQUssWUFBTCxHQTFCZ0I7Ozs7cUNBNkJELFVBQVUsV0FBVztBQUNwQyxpQ0ExQ2lCLDBEQTBDTSxVQUFVLFVBQWpDLENBRG9DO0FBRXBDLFdBQUssWUFBTCxHQUZvQzs7OzttQ0FLdkI7O0FBRWIsVUFBTSxTQUFTLEtBQUssY0FBTCxFQUFULENBRk87QUFHYixVQUFJLE1BQUosRUFBWTtBQUNWLGFBQUssV0FBTCxDQUFpQjtBQUNmLGtCQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQ7QUFDUixrQkFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkO1NBRlYsRUFEVTtPQUFaOzs7O3VDQVFpQixXQUFXO1VBQ3JCLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FEcUI7VUFFckIsUUFBZSxVQUFmLE1BRnFCO1VBRWQsT0FBUSxVQUFSLEtBRmM7O0FBRzVCLFVBQUksSUFBSSxDQUFKLENBSHdCOzs7Ozs7QUFJNUIsNkJBQWtCLDhCQUFsQixvR0FBd0I7Y0FBYixrQkFBYTs7QUFDdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRE87QUFFdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRk87QUFHdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSE87QUFJdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSk87QUFLdEIsZUFBSyxJQUFMLENBTHNCO1NBQXhCOzs7Ozs7Ozs7Ozs7OztPQUo0Qjs7OztrQ0FhaEI7QUFDWixVQUFJLFdBQVcsRUFBWCxDQURRO0FBRVosVUFBTSxlQUFlLEVBQWYsQ0FGTTtBQUdaLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDckMsZ0RBQWUsWUFBVSxHQUFHLEdBQUcsR0FBL0IsQ0FEcUM7T0FBdkM7QUFHQSxhQUFPO0FBQ0wsa0JBQVUsWUFBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFWO09BRkYsQ0FOWTs7OztTQXRFSyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBNYXBMYXllciBmcm9tICcuLi9tYXAtbGF5ZXInO1xuaW1wb3J0IHtQcm9ncmFtfSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDQsICcwJzogJ3gwJywgJzEnOiAneTAnLCAnMic6ICd4MScsICczJzogJ3kxJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyY0xheWVyIGV4dGVuZHMgTWFwTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBcmNMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IHByb2dyYW0gPSBuZXcgUHJvZ3JhbShcbiAgICAgIGdsLFxuICAgICAgZ2xzbGlmeSgnLi92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeSgnLi9mcmFnbWVudC5nbHNsJyksXG4gICAgICAnYXJjJ1xuICAgICk7XG5cbiAgICBjb25zdCBwcmltaXRpdmUgPSB7XG4gICAgICBpZDogdGhpcy5pZCxcbiAgICAgIGluc3RhbmNlZDogdHJ1ZSxcbiAgICAgIC4uLnRoaXMuZ2V0R2VvbWV0cnkoKVxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmVcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9XG4gICAgfSk7XG5cbiAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV4dFByb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV4dFByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZUNvbG9ycygpO1xuICB9XG5cbiAgdXBkYXRlQ29sb3JzKCkge1xuICAgIC8vIEdldCBjb2xvcnMgZnJvbSBmaXJzdCBvYmplY3RcbiAgICBjb25zdCBvYmplY3QgPSB0aGlzLmdldEZpcnN0T2JqZWN0KCk7XG4gICAgaWYgKG9iamVjdCkge1xuICAgICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAgIGNvbG9yMDogb2JqZWN0LmNvbG9ycy5jMCxcbiAgICAgICAgY29sb3IxOiBvYmplY3QuY29sb3JzLmMxXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGFyYyBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBhcmMucG9zaXRpb24ueDA7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBhcmMucG9zaXRpb24ueTA7XG4gICAgICB2YWx1ZVtpICsgMl0gPSBhcmMucG9zaXRpb24ueDE7XG4gICAgICB2YWx1ZVtpICsgM10gPSBhcmMucG9zaXRpb24ueTE7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgZ2V0R2VvbWV0cnkoKSB7XG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgY29uc3QgTlVNX1NFR01FTlRTID0gNTA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbLi4udmVydGljZXMsIGksIGksIGldO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgZHJhd1R5cGU6ICdMSU5FX1NUUklQJyxcbiAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgIH07XG4gIH1cblxufVxuIl19