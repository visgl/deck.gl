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

var GridLayer = function (_MapLayer) {
  _inherits(GridLayer, _MapLayer);

  _createClass(GridLayer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * GridLayer
     *
     * @class
     * @param {object} opts
     * @param {number} opts.unitWidth - width of the unit rectangle
     * @param {number} opts.unitHeight - height of the unit rectangle
     */

  }]);

  function GridLayer(opts) {
    _classCallCheck(this, GridLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GridLayer).call(this, _extends({
      unitWidth: 100,
      unitHeight: 100
    }, opts)));
  }

  _createClass(GridLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(GridLayer.prototype), 'initializeState', this).call(this);

      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      var program = new _luma.Program(gl, glslify(__dirname + '/vertex.glsl'), glslify(__dirname + '/fragment.glsl'), 'grid');

      var geometry = {
        drawType: 'TRIANGLE_FAN',
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      };

      var primitive = _extends({
        id: this.props.id,
        instanced: true
      }, geometry);

      this.setState({
        program: program,
        primitive: primitive
      });

      attributes.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });

      this.updateCell();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(GridLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);

      var cellSizeChanged = newProps.unitWidth !== oldProps.unitWidth || newProps.unitHeight !== oldProps.unitHeight;

      if (cellSizeChanged || this.state.viewportChanged) {
        this.updateCell();
      }
    }
  }, {
    key: 'updateCell',
    value: function updateCell() {
      var _props = this.props;
      var width = _props.width;
      var height = _props.height;
      var unitWidth = _props.unitWidth;
      var unitHeight = _props.unitHeight;


      var numCol = Math.ceil(width * 2 / unitWidth);
      var numRow = Math.ceil(height * 2 / unitHeight);
      this.setState({
        numCol: numCol,
        numRow: numRow,
        numInstances: numCol * numRow
      });

      var attributes = this.state.attributes;

      attributes.invalidateAll();

      var MARGIN = 2;
      var scale = new Float32Array([unitWidth - MARGIN * 2, unitHeight - MARGIN * 2, 1]);
      this.setUniforms({ scale: scale });
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute, numInstances) {
      var _props2 = this.props;
      var unitWidth = _props2.unitWidth;
      var unitHeight = _props2.unitHeight;
      var width = _props2.width;
      var height = _props2.height;
      var numCol = this.state.numCol;
      var value = attribute.value;
      var size = attribute.size;


      for (var i = 0; i < numInstances; i++) {
        var x = i % numCol;
        var y = Math.floor(i / numCol);
        value[i * size + 0] = x * unitWidth - width;
        value[i * size + 1] = y * unitHeight - height;
        value[i * size + 2] = 0;
      }
    }
  }, {
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var _Math;

      var _props3 = this.props;
      var data = _props3.data;
      var unitWidth = _props3.unitWidth;
      var unitHeight = _props3.unitHeight;
      var width = _props3.width;
      var height = _props3.height;
      var _state2 = this.state;
      var numCol = _state2.numCol;
      var numRow = _state2.numRow;
      var value = attribute.value;
      var size = attribute.size;


      value.fill(0.0);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var pixel = this.project([point.position.x, point.position.y]);
          var space = this.screenToSpace(pixel.x, pixel.y);

          var colId = Math.floor((space.x + width) / unitWidth);
          var rowId = Math.floor((space.y + height) / unitHeight);
          if (colId < numCol && rowId < numRow) {
            var i3 = (colId + rowId * numCol) * size;
            value[i3 + 0] += 1;
            value[i3 + 1] += 5;
            value[i3 + 2] += 1;
          }
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

      this.setUniforms({ maxCount: (_Math = Math).max.apply(_Math, _toConsumableArray(value)) });
    }
  }]);

  return GridLayer;
}(_mapLayer2.default);

exports.default = GridLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvZ3JpZC1sYXllci9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEdBQUwsRUFBVSxLQUFLLEdBQUwsRUFBVSxLQUFLLFFBQUwsRUFBekM7QUFDQSxVQUFRLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxLQUFMLEVBQVksS0FBSyxPQUFMLEVBQWMsS0FBSyxNQUFMLEVBQTVDO0NBRkk7O0lBS2U7Ozs7O3dCQUVLO0FBQ3RCLGFBQU8sVUFBUCxDQURzQjs7Ozs7Ozs7Ozs7Ozs7O0FBYXhCLFdBZm1CLFNBZW5CLENBQVksSUFBWixFQUFrQjswQkFmQyxXQWVEOztrRUFmQztBQWlCZixpQkFBVyxHQUFYO0FBQ0Esa0JBQVksR0FBWjtPQUNHLFFBSlc7R0FBbEI7O2VBZm1COztzQ0F1QkQ7QUFDaEIsaUNBeEJpQix5REF3QmpCLENBRGdCOzttQkFHUyxLQUFLLEtBQUwsQ0FIVDtVQUdULGVBSFM7VUFHTCwrQkFISzs7O0FBS2hCLFVBQU0sVUFBVSxrQkFDZCxFQURjLEVBRWQsUUFBUSxZQUFZLGNBQVosQ0FGTSxFQUdkLFFBQVEsWUFBWSxnQkFBWixDQUhNLEVBSWQsTUFKYyxDQUFWLENBTFU7O0FBWWhCLFVBQU0sV0FBVztBQUNmLGtCQUFVLGNBQVY7QUFDQSxrQkFBVSxJQUFJLFlBQUosQ0FBaUIsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixFQUFtQixDQUFuQixFQUFzQixDQUF0QixFQUF5QixDQUF6QixFQUE0QixDQUE1QixFQUErQixDQUEvQixFQUFrQyxDQUFsQyxDQUFqQixDQUFWO09BRkksQ0FaVTs7QUFp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LFFBQU4sQ0FBZSxDQUFmLEVBQWtCLE1BQU0sUUFBTixDQUFlLENBQWYsQ0FBaEMsQ0FBUixDQURrQjtBQUV4QixjQUFNLFFBQVEsS0FBSyxhQUFMLENBQW1CLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUFwQyxDQUZrQjs7QUFJeEIsY0FBTSxRQUFRLEtBQUssS0FBTCxDQUFXLENBQUMsTUFBTSxDQUFOLEdBQVUsS0FBVixDQUFELEdBQW9CLFNBQXBCLENBQW5CLENBSmtCO0FBS3hCLGNBQU0sUUFBUSxLQUFLLEtBQUwsQ0FBVyxDQUFDLE1BQU0sQ0FBTixHQUFVLE1BQVYsQ0FBRCxHQUFxQixVQUFyQixDQUFuQixDQUxrQjtBQU14QixjQUFJLFFBQVEsTUFBUixJQUFrQixRQUFRLE1BQVIsRUFBZ0I7QUFDcEMsZ0JBQU0sS0FBSyxDQUFDLFFBQVEsUUFBUSxNQUFSLENBQVQsR0FBMkIsSUFBM0IsQ0FEeUI7QUFFcEMsa0JBQU0sS0FBSyxDQUFMLENBQU4sSUFBaUIsQ0FBakIsQ0FGb0M7QUFHcEMsa0JBQU0sS0FBSyxDQUFMLENBQU4sSUFBaUIsQ0FBakIsQ0FIb0M7QUFJcEMsa0JBQU0sS0FBSyxDQUFMLENBQU4sSUFBaUIsQ0FBakIsQ0FKb0M7V0FBdEM7U0FORjs7Ozs7Ozs7Ozs7Ozs7T0FQeUI7O0FBcUJ6QixXQUFLLFdBQUwsQ0FBaUIsRUFBQyxVQUFVLGVBQUssR0FBTCxpQ0FBWSxNQUFaLENBQVYsRUFBbEIsRUFyQnlCOzs7O1NBN0dSIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IE1hcExheWVyIGZyb20gJy4uL21hcC1sYXllcic7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogMywgJzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd1bnVzZWQnfSxcbiAgY29sb3JzOiB7c2l6ZTogMywgJzAnOiAncmVkJywgJzEnOiAnZ3JlZW4nLCAnMic6ICdibHVlJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRMYXllciBleHRlbmRzIE1hcExheWVyIHtcblxuICBzdGF0aWMgZ2V0IGF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIEFUVFJJQlVURVM7XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBHcmlkTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvcHRzLnVuaXRXaWR0aCAtIHdpZHRoIG9mIHRoZSB1bml0IHJlY3RhbmdsZVxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy51bml0SGVpZ2h0IC0gaGVpZ2h0IG9mIHRoZSB1bml0IHJlY3RhbmdsZVxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKHtcbiAgICAgIHVuaXRXaWR0aDogMTAwLFxuICAgICAgdW5pdEhlaWdodDogMTAwLFxuICAgICAgLi4ub3B0c1xuICAgIH0pO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuXG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBwcm9ncmFtID0gbmV3IFByb2dyYW0oXG4gICAgICBnbCxcbiAgICAgIGdsc2xpZnkoX19kaXJuYW1lICsgJy92ZXJ0ZXguZ2xzbCcpLFxuICAgICAgZ2xzbGlmeShfX2Rpcm5hbWUgKyAnL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdncmlkJ1xuICAgICk7XG5cbiAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgIGRyYXdUeXBlOiAnVFJJQU5HTEVfRkFOJyxcbiAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICB9O1xuXG4gICAgY29uc3QgcHJpbWl0aXZlID0ge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBpbnN0YW5jZWQ6IHRydWUsXG4gICAgICAuLi5nZW9tZXRyeVxuICAgIH07XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByb2dyYW0sXG4gICAgICBwcmltaXRpdmVcbiAgICB9KTtcblxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBvc2l0aW9uczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQb3NpdGlvbnN9LFxuICAgICAgY29sb3JzOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUNvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ2VsbCgpO1xuICB9XG5cbiAgd2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICBjb25zdCBjZWxsU2l6ZUNoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMudW5pdFdpZHRoICE9PSBvbGRQcm9wcy51bml0V2lkdGggfHxcbiAgICAgIG5ld1Byb3BzLnVuaXRIZWlnaHQgIT09IG9sZFByb3BzLnVuaXRIZWlnaHQ7XG5cbiAgICBpZiAoY2VsbFNpemVDaGFuZ2VkIHx8IHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICB0aGlzLnVwZGF0ZUNlbGwoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDZWxsKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCB1bml0V2lkdGgsIHVuaXRIZWlnaHR9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IG51bUNvbCA9IE1hdGguY2VpbCh3aWR0aCAqIDIgLyB1bml0V2lkdGgpO1xuICAgIGNvbnN0IG51bVJvdyA9IE1hdGguY2VpbChoZWlnaHQgKiAyIC8gdW5pdEhlaWdodCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBudW1Db2wsXG4gICAgICBudW1Sb3csXG4gICAgICBudW1JbnN0YW5jZXM6IG51bUNvbCAqIG51bVJvd1xuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGVBbGwoKTtcblxuICAgIGNvbnN0IE1BUkdJTiA9IDI7XG4gICAgY29uc3Qgc2NhbGUgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgIHVuaXRXaWR0aCAtIE1BUkdJTiAqIDIsXG4gICAgICB1bml0SGVpZ2h0IC0gTUFSR0lOICogMixcbiAgICAgIDFcbiAgICBdKTtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtzY2FsZX0pO1xuXG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIG51bUNvbDtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyBudW1Db2wpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IHggKiB1bml0V2lkdGggLSB3aWR0aDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSB5ICogdW5pdEhlaWdodCAtIGhlaWdodDtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgdW5pdFdpZHRoLCB1bml0SGVpZ2h0LCB3aWR0aCwgaGVpZ2h0fSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbCwgbnVtUm93fSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcblxuICAgIHZhbHVlLmZpbGwoMC4wKTtcblxuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcGl4ZWwgPSB0aGlzLnByb2plY3QoW3BvaW50LnBvc2l0aW9uLngsIHBvaW50LnBvc2l0aW9uLnldKTtcbiAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5zY3JlZW5Ub1NwYWNlKHBpeGVsLngsIHBpeGVsLnkpO1xuXG4gICAgICBjb25zdCBjb2xJZCA9IE1hdGguZmxvb3IoKHNwYWNlLnggKyB3aWR0aCkgLyB1bml0V2lkdGgpO1xuICAgICAgY29uc3Qgcm93SWQgPSBNYXRoLmZsb29yKChzcGFjZS55ICsgaGVpZ2h0KSAvIHVuaXRIZWlnaHQpO1xuICAgICAgaWYgKGNvbElkIDwgbnVtQ29sICYmIHJvd0lkIDwgbnVtUm93KSB7XG4gICAgICAgIGNvbnN0IGkzID0gKGNvbElkICsgcm93SWQgKiBudW1Db2wpICogc2l6ZTtcbiAgICAgICAgdmFsdWVbaTMgKyAwXSArPSAxO1xuICAgICAgICB2YWx1ZVtpMyArIDFdICs9IDU7XG4gICAgICAgIHZhbHVlW2kzICsgMl0gKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNldFVuaWZvcm1zKHttYXhDb3VudDogTWF0aC5tYXgoLi4udmFsdWUpfSk7XG4gIH1cblxufVxuIl19