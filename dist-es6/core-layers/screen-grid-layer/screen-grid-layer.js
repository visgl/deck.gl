var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import { Layer } from '../../core';
import { GL, Model, Geometry } from 'luma.gl';

import vs from './screen-grid-layer-vertex.glsl';
import fs from './screen-grid-layer-fragment.glsl';

var defaultProps = {
  cellSizePixels: 100,

  // Color range?
  minColor: [0, 0, 0, 255],
  maxColor: [0, 255, 0, 255],

  getPosition: function getPosition(d) {
    return d.position;
  },
  getWeight: function getWeight(d) {
    return 1;
  }
};

var ScreenGridLayer = function (_Layer) {
  _inherits(ScreenGridLayer, _Layer);

  _createClass(ScreenGridLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return { vs: vs, fs: fs, modules: ['picking'] }; // 'project' module added by default.
    }
  }]);

  function ScreenGridLayer(props) {
    _classCallCheck(this, ScreenGridLayer);

    var _this = _possibleConstructorReturn(this, (ScreenGridLayer.__proto__ || Object.getPrototypeOf(ScreenGridLayer)).call(this, props));

    _this._checkRemovedProp('unitWidth', 'cellSizePixels');
    _this._checkRemovedProp('unitHeight', 'cellSizePixels');
    return _this;
  }

  _createClass(ScreenGridLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var attributeManager = this.state.attributeManager;
      var gl = this.context.gl;

      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 3, update: this.calculateInstancePositions },
        instanceCount: { size: 1, accessor: ['getPosition', 'getWeight'], update: this.calculateInstanceCount }
      });
      /* eslint-disable max-len */

      this.setState({ model: this._getModel(gl) });
    }
  }, {
    key: 'shouldUpdateState',
    value: function shouldUpdateState(_ref) {
      var changeFlags = _ref.changeFlags;

      return changeFlags.somethingChanged;
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      _get(ScreenGridLayer.prototype.__proto__ || Object.getPrototypeOf(ScreenGridLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      var cellSizeChanged = props.cellSizePixels !== oldProps.cellSizePixels;

      if (cellSizeChanged || changeFlags.viewportChanged) {
        this.updateCell();
      }
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var _props = this.props,
          minColor = _props.minColor,
          maxColor = _props.maxColor,
          _props$parameters = _props.parameters,
          parameters = _props$parameters === undefined ? {} : _props$parameters;
      var _state = this.state,
          model = _state.model,
          cellScale = _state.cellScale,
          maxCount = _state.maxCount;

      uniforms = Object.assign({}, uniforms, { minColor: minColor, maxColor: maxColor, cellScale: cellScale, maxCount: maxCount });
      model.draw({
        uniforms: uniforms,
        parameters: Object.assign({
          depthTest: false,
          depthMask: false
        }, parameters)
      });
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'updateCell',
    value: function updateCell() {
      var _context$viewport = this.context.viewport,
          width = _context$viewport.width,
          height = _context$viewport.height;
      var cellSizePixels = this.props.cellSizePixels;


      var MARGIN = 2;
      var cellScale = new Float32Array([(cellSizePixels - MARGIN) / width * 2, -(cellSizePixels - MARGIN) / height * 2, 1]);
      var numCol = Math.ceil(width / cellSizePixels);
      var numRow = Math.ceil(height / cellSizePixels);

      this.setState({
        cellScale: cellScale,
        numCol: numCol,
        numRow: numRow,
        numInstances: numCol * numRow
      });

      var attributeManager = this.state.attributeManager;

      attributeManager.invalidateAll();
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute, _ref4) {
      var numInstances = _ref4.numInstances;
      var _context$viewport2 = this.context.viewport,
          width = _context$viewport2.width,
          height = _context$viewport2.height;
      var cellSizePixels = this.props.cellSizePixels;
      var numCol = this.state.numCol;
      var value = attribute.value,
          size = attribute.size;


      for (var i = 0; i < numInstances; i++) {
        var x = i % numCol;
        var y = Math.floor(i / numCol);
        value[i * size + 0] = x * cellSizePixels / width * 2 - 1;
        value[i * size + 1] = 1 - y * cellSizePixels / height * 2;
        value[i * size + 2] = 0;
      }
    }
  }, {
    key: 'calculateInstanceCount',
    value: function calculateInstanceCount(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          cellSizePixels = _props2.cellSizePixels,
          getPosition = _props2.getPosition,
          getWeight = _props2.getWeight;
      var _state2 = this.state,
          numCol = _state2.numCol,
          numRow = _state2.numRow;
      var value = attribute.value;

      var maxCount = 0;

      value.fill(0.0);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var pixel = this.project(getPosition(point));
          var colId = Math.floor(pixel[0] / cellSizePixels);
          var rowId = Math.floor(pixel[1] / cellSizePixels);
          if (colId >= 0 && colId < numCol && rowId >= 0 && rowId < numRow) {
            var i = colId + rowId * numCol;
            value[i] += getWeight(point);
            if (value[i] > maxCount) {
              maxCount = value[i];
            }
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

      this.setState({ maxCount: maxCount });
    }
  }]);

  return ScreenGridLayer;
}(Layer);

export default ScreenGridLayer;


ScreenGridLayer.layerName = 'ScreenGridLayer';
ScreenGridLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zY3JlZW4tZ3JpZC1sYXllci9zY3JlZW4tZ3JpZC1sYXllci5qcyJdLCJuYW1lcyI6WyJMYXllciIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsInZzIiwiZnMiLCJkZWZhdWx0UHJvcHMiLCJjZWxsU2l6ZVBpeGVscyIsIm1pbkNvbG9yIiwibWF4Q29sb3IiLCJnZXRQb3NpdGlvbiIsImQiLCJwb3NpdGlvbiIsImdldFdlaWdodCIsIlNjcmVlbkdyaWRMYXllciIsIm1vZHVsZXMiLCJwcm9wcyIsIl9jaGVja1JlbW92ZWRQcm9wIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiZ2wiLCJjb250ZXh0IiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZUNvdW50IiwiYWNjZXNzb3IiLCJjYWxjdWxhdGVJbnN0YW5jZUNvdW50Iiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImNoYW5nZUZsYWdzIiwic29tZXRoaW5nQ2hhbmdlZCIsIm9sZFByb3BzIiwiY2VsbFNpemVDaGFuZ2VkIiwidmlld3BvcnRDaGFuZ2VkIiwidXBkYXRlQ2VsbCIsInVuaWZvcm1zIiwicGFyYW1ldGVycyIsImNlbGxTY2FsZSIsIm1heENvdW50IiwiT2JqZWN0IiwiYXNzaWduIiwiZHJhdyIsImRlcHRoVGVzdCIsImRlcHRoTWFzayIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRV9GQU4iLCJhdHRyaWJ1dGVzIiwidmVydGljZXMiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsInNoYWRlckNhY2hlIiwidmlld3BvcnQiLCJ3aWR0aCIsImhlaWdodCIsIk1BUkdJTiIsIm51bUNvbCIsIk1hdGgiLCJjZWlsIiwibnVtUm93IiwibnVtSW5zdGFuY2VzIiwiaW52YWxpZGF0ZUFsbCIsImF0dHJpYnV0ZSIsInZhbHVlIiwiaSIsIngiLCJ5IiwiZmxvb3IiLCJkYXRhIiwiZmlsbCIsInBvaW50IiwicGl4ZWwiLCJwcm9qZWN0IiwiY29sSWQiLCJyb3dJZCIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLEtBQVIsUUFBb0IsWUFBcEI7QUFDQSxTQUFRQyxFQUFSLEVBQVlDLEtBQVosRUFBbUJDLFFBQW5CLFFBQWtDLFNBQWxDOztBQUVBLE9BQU9DLEVBQVAsTUFBZSxpQ0FBZjtBQUNBLE9BQU9DLEVBQVAsTUFBZSxtQ0FBZjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxrQkFBZ0IsR0FERzs7QUFHbkI7QUFDQUMsWUFBVSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLEdBQVYsQ0FKUztBQUtuQkMsWUFBVSxDQUFDLENBQUQsRUFBSSxHQUFKLEVBQVMsQ0FBVCxFQUFZLEdBQVosQ0FMUzs7QUFPbkJDLGVBQWE7QUFBQSxXQUFLQyxFQUFFQyxRQUFQO0FBQUEsR0FQTTtBQVFuQkMsYUFBVztBQUFBLFdBQUssQ0FBTDtBQUFBO0FBUlEsQ0FBckI7O0lBV3FCQyxlOzs7OztpQ0FDTjtBQUNYLGFBQU8sRUFBQ1YsTUFBRCxFQUFLQyxNQUFMLEVBQVNVLFNBQVMsQ0FBQyxTQUFELENBQWxCLEVBQVAsQ0FEVyxDQUM0QjtBQUN4Qzs7O0FBRUQsMkJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxrSUFDWEEsS0FEVzs7QUFFakIsVUFBS0MsaUJBQUwsQ0FBdUIsV0FBdkIsRUFBb0MsZ0JBQXBDO0FBQ0EsVUFBS0EsaUJBQUwsQ0FBdUIsWUFBdkIsRUFBcUMsZ0JBQXJDO0FBSGlCO0FBSWxCOzs7O3NDQUVpQjtBQUFBLFVBQ1RDLGdCQURTLEdBQ1csS0FBS0Ms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QUFDQSxjQUFJd0UsU0FBUyxDQUFULElBQWNBLFFBQVFqQixNQUF0QixJQUFnQ2tCLFNBQVMsQ0FBekMsSUFBOENBLFFBQVFmLE1BQTFELEVBQWtFO0FBQ2hFLGdCQUFNSyxJQUFJUyxRQUFRQyxRQUFRbEIsTUFBMUI7QUFDQU8sa0JBQU1DLENBQU4sS0FBWXpELFVBQVUrRCxLQUFWLENBQVo7QUFDQSxnQkFBSVAsTUFBTUMsQ0FBTixJQUFXNUIsUUFBZixFQUF5QjtBQUN2QkEseUJBQVcyQixNQUFNQyxDQUFOLENBQVg7QUFDRDtBQUNGO0FBQ0Y7QUFuQitCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBcUJoQyxXQUFLeEMsUUFBTCxDQUFjLEVBQUNZLGtCQUFELEVBQWQ7QUFDRDs7OztFQS9IMEMxQyxLOztlQUF4QmMsZTs7O0FBa0lyQkEsZ0JBQWdCbUUsU0FBaEIsR0FBNEIsaUJBQTVCO0FBQ0FuRSxnQkFBZ0JSLFlBQWhCLEdBQStCQSxZQUEvQiIsImZpbGUiOiJzY3JlZW4tZ3JpZC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0xheWVyfSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCB7R0wsIE1vZGVsLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCB2cyBmcm9tICcuL3NjcmVlbi1ncmlkLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL3NjcmVlbi1ncmlkLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNlbGxTaXplUGl4ZWxzOiAxMDAsXG5cbiAgLy8gQ29sb3IgcmFuZ2U/XG4gIG1pbkNvbG9yOiBbMCwgMCwgMCwgMjU1XSxcbiAgbWF4Q29sb3I6IFswLCAyNTUsIDAsIDI1NV0sXG5cbiAgZ2V0UG9zaXRpb246IGQgPT4gZC5wb3NpdGlvbixcbiAgZ2V0V2VpZ2h0OiBkID0+IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjcmVlbkdyaWRMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4ge3ZzLCBmcywgbW9kdWxlczogWydwaWNraW5nJ119OyAvLyAncHJvamVjdCcgbW9kdWxlIGFkZGVkIGJ5IGRlZmF1bHQuXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9jaGVja1JlbW92ZWRQcm9wKCd1bml0V2lkdGgnLCAnY2VsbFNpemVQaXhlbHMnKTtcbiAgICB0aGlzLl9jaGVja1JlbW92ZWRQcm9wKCd1bml0SGVpZ2h0JywgJ2NlbGxTaXplUGl4ZWxzJyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuXG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlQ291bnQ6IHtzaXplOiAxLCBhY2Nlc3NvcjogWydnZXRQb3NpdGlvbicsICdnZXRXZWlnaHQnXSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlQ291bnR9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuICB9XG5cbiAgc2hvdWxkVXBkYXRlU3RhdGUoe2NoYW5nZUZsYWdzfSkge1xuICAgIHJldHVybiBjaGFuZ2VGbGFncy5zb21ldGhpbmdDaGFuZ2VkO1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICBjb25zdCBjZWxsU2l6ZUNoYW5nZWQgPVxuICAgICAgcHJvcHMuY2VsbFNpemVQaXhlbHMgIT09IG9sZFByb3BzLmNlbGxTaXplUGl4ZWxzO1xuXG4gICAgaWYgKGNlbGxTaXplQ2hhbmdlZCB8fCBjaGFuZ2VGbGFncy52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMudXBkYXRlQ2VsbCgpO1xuICAgIH1cbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHttaW5Db2xvciwgbWF4Q29sb3IsIHBhcmFtZXRlcnMgPSB7fX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHttb2RlbCwgY2VsbFNjYWxlLCBtYXhDb3VudH0gPSB0aGlzLnN0YXRlO1xuICAgIHVuaWZvcm1zID0gT2JqZWN0LmFzc2lnbih7fSwgdW5pZm9ybXMsIHttaW5Db2xvciwgbWF4Q29sb3IsIGNlbGxTY2FsZSwgbWF4Q291bnR9KTtcbiAgICBtb2RlbC5kcmF3KHtcbiAgICAgIHVuaWZvcm1zLFxuICAgICAgcGFyYW1ldGVyczogT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGRlcHRoVGVzdDogZmFsc2UsXG4gICAgICAgIGRlcHRoTWFzazogZmFsc2VcbiAgICAgIH0sIHBhcmFtZXRlcnMpXG4gICAgfSk7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX0ZBTixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG4gIH1cblxuICB1cGRhdGVDZWxsKCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0fSA9IHRoaXMuY29udGV4dC52aWV3cG9ydDtcbiAgICBjb25zdCB7Y2VsbFNpemVQaXhlbHN9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IE1BUkdJTiA9IDI7XG4gICAgY29uc3QgY2VsbFNjYWxlID0gbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAoY2VsbFNpemVQaXhlbHMgLSBNQVJHSU4pIC8gd2lkdGggKiAyLFxuICAgICAgLShjZWxsU2l6ZVBpeGVscyAtIE1BUkdJTikgLyBoZWlnaHQgKiAyLFxuICAgICAgMVxuICAgIF0pO1xuICAgIGNvbnN0IG51bUNvbCA9IE1hdGguY2VpbCh3aWR0aCAvIGNlbGxTaXplUGl4ZWxzKTtcbiAgICBjb25zdCBudW1Sb3cgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gY2VsbFNpemVQaXhlbHMpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjZWxsU2NhbGUsXG4gICAgICBudW1Db2wsXG4gICAgICBudW1Sb3csXG4gICAgICBudW1JbnN0YW5jZXM6IG51bUNvbCAqIG51bVJvd1xuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSwge251bUluc3RhbmNlc30pIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodH0gPSB0aGlzLmNvbnRleHQudmlld3BvcnQ7XG4gICAgY29uc3Qge2NlbGxTaXplUGl4ZWxzfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge251bUNvbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCB4ID0gaSAlIG51bUNvbDtcbiAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKGkgLyBudW1Db2wpO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IHggKiBjZWxsU2l6ZVBpeGVscyAvIHdpZHRoICogMiAtIDE7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gMSAtIHkgKiBjZWxsU2l6ZVBpeGVscyAvIGhlaWdodCAqIDI7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDJdID0gMDtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvdW50KGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBjZWxsU2l6ZVBpeGVscywgZ2V0UG9zaXRpb24sIGdldFdlaWdodH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtudW1Db2wsIG51bVJvd30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IG1heENvdW50ID0gMDtcblxuICAgIHZhbHVlLmZpbGwoMC4wKTtcblxuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcGl4ZWwgPSB0aGlzLnByb2plY3QoZ2V0UG9zaXRpb24ocG9pbnQpKTtcbiAgICAgIGNvbnN0IGNvbElkID0gTWF0aC5mbG9vcihwaXhlbFswXSAvIGNlbGxTaXplUGl4ZWxzKTtcbiAgICAgIGNvbnN0IHJvd0lkID0gTWF0aC5mbG9vcihwaXhlbFsxXSAvIGNlbGxTaXplUGl4ZWxzKTtcbiAgICAgIGlmIChjb2xJZCA+PSAwICYmIGNvbElkIDwgbnVtQ29sICYmIHJvd0lkID49IDAgJiYgcm93SWQgPCBudW1Sb3cpIHtcbiAgICAgICAgY29uc3QgaSA9IGNvbElkICsgcm93SWQgKiBudW1Db2w7XG4gICAgICAgIHZhbHVlW2ldICs9IGdldFdlaWdodChwb2ludCk7XG4gICAgICAgIGlmICh2YWx1ZVtpXSA+IG1heENvdW50KSB7XG4gICAgICAgICAgbWF4Q291bnQgPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe21heENvdW50fSk7XG4gIH1cbn1cblxuU2NyZWVuR3JpZExheWVyLmxheWVyTmFtZSA9ICdTY3JlZW5HcmlkTGF5ZXInO1xuU2NyZWVuR3JpZExheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==