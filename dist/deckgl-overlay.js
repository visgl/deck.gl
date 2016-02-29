'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; // Copyright (c) 2015 Uber Technologies, Inc.
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

/* global window */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _webglRenderer = require('./webgl-renderer');

var _webglRenderer2 = _interopRequireDefault(_webglRenderer);

var _flatWorld = require('./flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _layerManager = require('./layers/layer-manager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var PROP_TYPES = {
  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,
  layers: _react.PropTypes.array.isRequired
};

var DeckGLOverlay = (_class = function (_React$Component) {
  _inherits(DeckGLOverlay, _React$Component);

  _createClass(DeckGLOverlay, null, [{
    key: 'propTypes',
    get: function get() {
      return PROP_TYPES;
    }
  }]);

  function DeckGLOverlay(props) {
    _classCallCheck(this, DeckGLOverlay);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DeckGLOverlay).call(this, props));

    _this.state = {};
    _this.needsRedraw = true;
    return _this;
  }

  _createClass(DeckGLOverlay, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      (0, _layerManager.matchLayers)(this.props.layers, nextProps.layers);
      (0, _layerManager.finalizeOldLayers)(this.props.layers);
      (0, _layerManager.updateMatchedLayers)(nextProps.layers);
      this.initializeLayers(nextProps.layers);
    }
  }, {
    key: 'initializeLayers',
    value: function initializeLayers(layers) {
      var gl = this.state.gl;

      if (!gl) {
        return;
      }
      (0, _layerManager.initializeNewLayers)(layers, { gl: gl });
      this.addLayersToScene(layers);
    }
  }, {
    key: 'addLayersToScene',
    value: function addLayersToScene(layers) {
      var scene = this.state.scene;

      if (!scene) {
        return;
      }
      // clear scene and repopulate based on new layers
      scene.removeAll();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = layers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var layer = _step.value;

          // Save layer on model for picking purposes
          // TODO - store on model.userData rather than directly on model
          layer.state.model.layer = layer;
          // Add model to scene
          scene.add(layer.state.model);
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
    key: '_onRendererInitialized',
    value: function _onRendererInitialized(_ref) {
      var gl = _ref.gl;
      var scene = _ref.scene;

      this.setState({ gl: gl, scene: scene });
      (0, _layerManager.initializeNewLayers)(this.props.layers, { gl: gl });
    }

    // Route events to layers

  }, {
    key: '_onClick',
    value: function _onClick(info) {
      var picked = info.picked;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = picked[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          if (item.model.layer.onClick(_extends({ color: item.color }, info))) {
            return;
          }
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

    // Route events to layers

  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(info) {
      var picked = info.picked;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = picked[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var item = _step3.value;

          if (item.model.layer.onHover(_extends({ color: item.color }, info))) {
            return;
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }, {
    key: '_checkIfNeedRedraw',
    value: function _checkIfNeedRedraw() {
      var layers = this.props.layers;

      return (0, _layerManager.layersNeedRedraw)(layers, { clearFlag: true });
    }

    // @autobind
    // onAfterRender

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var width = _props.width;
      var height = _props.height;
      var layers = _props.layers;

      var otherProps = _objectWithoutProperties(_props, ['width', 'height', 'layers']);

      // if (layers.length === 0) {
      //   return null;
      // }

      this.initializeLayers(layers);

      return _react2.default.createElement(_webglRenderer2.default, _extends({}, otherProps, {

        width: width,
        height: height,

        viewport: new _flatWorld2.default.Viewport(width, height),
        camera: _flatWorld2.default.getCamera(),
        lights: _flatWorld2.default.getLighting(),
        blending: _flatWorld2.default.getBlending(),
        pixelRatio: _flatWorld2.default.getPixelRatio(window.devicePixelRatio),

        onRendererInitialized: this._onRendererInitialized,
        onNeedRedraw: this._checkIfNeedRedraw,
        onMouseMove: this._onMouseMove,
        onClick: this._onClick }));
    }
  }]);

  return DeckGLOverlay;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, '_onRendererInitialized', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onRendererInitialized'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_checkIfNeedRedraw', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_checkIfNeedRedraw'), _class.prototype)), _class);
exports.default = DeckGLOverlay;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWNrZ2wtb3ZlcmxheS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0JBLElBQU0sYUFBYTtBQUNqQixTQUFPLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUCxVQUFRLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUixVQUFRLGlCQUFVLEtBQVYsQ0FBZ0IsVUFBaEI7Q0FISjs7SUFNZTs7Ozs7d0JBRUk7QUFDckIsYUFBTyxVQUFQLENBRHFCOzs7O0FBSXZCLFdBTm1CLGFBTW5CLENBQVksS0FBWixFQUFtQjswQkFOQSxlQU1BOzt1RUFOQSwwQkFPWCxRQURXOztBQUVqQixVQUFLLEtBQUwsR0FBYSxFQUFiLENBRmlCO0FBR2pCLFVBQUssV0FBTCxHQUFtQixJQUFuQixDQUhpQjs7R0FBbkI7O2VBTm1COzs4Q0FZTyxXQUFXO0FBQ25DLHFDQUFZLEtBQUssS0FBTCxDQUFXLE1BQVgsRUFBbUIsVUFBVSxNQUFWLENBQS9CLENBRG1DO0FBRW5DLDJDQUFrQixLQUFLLEtBQUwsQ0FBVyxNQUFYLENBQWxCLENBRm1DO0FBR25DLDZDQUFvQixVQUFVLE1BQVYsQ0FBcEIsQ0FIbUM7QUFJbkMsV0FBSyxnQkFBTCxDQUFzQixVQUFVLE1BQVYsQ0FBdEIsQ0FKbUM7Ozs7cUNBT3BCLFFBQVE7VUFDaEIsS0FBTSxLQUFLLEtBQUwsQ0FBTixHQURnQjs7QUFFdkIsVUFBSSxDQUFDLEVBQUQsRUFBSztBQUNQLGVBRE87T0FBVDtBQUdBLDZDQUFvQixNQUFwQixFQUE0QixFQUFDLE1BQUQsRUFBNUIsRUFMdUI7QUFNdkIsV0FBSyxnQkFBTCxDQUFzQixNQUF0QixFQU51Qjs7OztxQ0FTUixRQUFRO1VBQ2hCLFFBQVMsS0FBSyxLQUFMLENBQVQsTUFEZ0I7O0FBRXZCLFVBQUksQ0FBQyxLQUFELEVBQVE7QUFDVixlQURVO09BQVo7O0FBRnVCLFdBTXZCLENBQU0sU0FBTixHQU51Qjs7Ozs7O0FBT3ZCLDZCQUFvQixnQ0FBcEIsb0dBQTRCO2NBQWpCLG9CQUFpQjs7OztBQUcxQixnQkFBTSxLQUFOLENBQVksS0FBWixDQUFrQixLQUFsQixHQUEwQixLQUExQjs7QUFIMEIsZUFLMUIsQ0FBTSxHQUFOLENBQVUsTUFBTSxLQUFOLENBQVksS0FBWixDQUFWLENBTDBCO1NBQTVCOzs7Ozs7Ozs7Ozs7OztPQVB1Qjs7OztpREFpQlc7VUFBWixhQUFZO1VBQVIsbUJBQVE7O0FBQ2xDLFdBQUssUUFBTCxDQUFjLEVBQUMsTUFBRCxFQUFLLFlBQUwsRUFBZCxFQURrQztBQUVsQyw2Q0FBb0IsS0FBSyxLQUFMLENBQVcsTUFBWCxFQUFtQixFQUFDLE1BQUQsRUFBdkMsRUFGa0M7Ozs7Ozs7NkJBTzNCLE1BQU07VUFDTixTQUFVLEtBQVYsT0FETTs7Ozs7O0FBRWIsOEJBQW1CLGlDQUFuQix3R0FBMkI7Y0FBaEIsb0JBQWdCOztBQUN6QixjQUFJLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsT0FBakIsWUFBMEIsT0FBTyxLQUFLLEtBQUwsSUFBZSxLQUFoRCxDQUFKLEVBQTREO0FBQzFELG1CQUQwRDtXQUE1RDtTQURGOzs7Ozs7Ozs7Ozs7OztPQUZhOzs7Ozs7O2lDQVdGLE1BQU07VUFDVixTQUFVLEtBQVYsT0FEVTs7Ozs7O0FBRWpCLDhCQUFtQixpQ0FBbkIsd0dBQTJCO2NBQWhCLG9CQUFnQjs7QUFDekIsY0FBSSxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLE9BQWpCLFlBQTBCLE9BQU8sS0FBSyxLQUFMLElBQWUsS0FBaEQsQ0FBSixFQUE0RDtBQUMxRCxtQkFEMEQ7V0FBNUQ7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FGaUI7Ozs7eUNBVUU7VUFDWixTQUFVLEtBQUssS0FBTCxDQUFWLE9BRFk7O0FBRW5CLGFBQU8sb0NBQWlCLE1BQWpCLEVBQXlCLEVBQUMsV0FBVyxJQUFYLEVBQTFCLENBQVAsQ0FGbUI7Ozs7Ozs7OzZCQVFaO21CQUN3QyxLQUFLLEtBQUwsQ0FEeEM7VUFDQSxxQkFEQTtVQUNPLHVCQURQO1VBQ2UsdUJBRGY7O1VBQzBCOzs7Ozs7QUFEMUIsVUFPUCxDQUFLLGdCQUFMLENBQXNCLE1BQXRCLEVBUE87O0FBU1AsYUFDRSxvRUFDTzs7QUFFTCxlQUFRLEtBQVI7QUFDQSxnQkFBUyxNQUFUOztBQUVBLGtCQUFXLElBQUksb0JBQVUsUUFBVixDQUFtQixLQUF2QixFQUE4QixNQUE5QixDQUFYO0FBQ0EsZ0JBQVMsb0JBQVUsU0FBVixFQUFUO0FBQ0EsZ0JBQVMsb0JBQVUsV0FBVixFQUFUO0FBQ0Esa0JBQVcsb0JBQVUsV0FBVixFQUFYO0FBQ0Esb0JBQWEsb0JBQVUsYUFBVixDQUF3QixPQUFPLGdCQUFQLENBQXJDOztBQUVBLCtCQUF3QixLQUFLLHNCQUFMO0FBQ3hCLHNCQUFlLEtBQUssa0JBQUw7QUFDZixxQkFBYyxLQUFLLFlBQUw7QUFDZCxpQkFBVSxLQUFLLFFBQUwsR0FmWixDQURGLENBVE87Ozs7U0FqRlU7RUFBc0IsZ0JBQU0sU0FBTjtrQkFBdEIiLCJmaWxlIjoiZGVja2dsLW92ZXJsYXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBhdXRvYmluZCBmcm9tICdhdXRvYmluZC1kZWNvcmF0b3InO1xuXG5pbXBvcnQgV2ViR0xSZW5kZXJlciBmcm9tICcuL3dlYmdsLXJlbmRlcmVyJztcbmltcG9ydCBmbGF0V29ybGQgZnJvbSAnLi9mbGF0LXdvcmxkJztcbmltcG9ydCB7XG4gIG1hdGNoTGF5ZXJzLCBmaW5hbGl6ZU9sZExheWVycywgdXBkYXRlTWF0Y2hlZExheWVycywgaW5pdGlhbGl6ZU5ld0xheWVycyxcbiAgbGF5ZXJzTmVlZFJlZHJhd1xufSBmcm9tICcuL2xheWVycy9sYXllci1tYW5hZ2VyJztcblxuY29uc3QgUFJPUF9UWVBFUyA9IHtcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIGxheWVyczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWRcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlY2tHTE92ZXJsYXkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHN0YXRpYyBnZXQgcHJvcFR5cGVzKCkge1xuICAgIHJldHVybiBQUk9QX1RZUEVTO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIHRoaXMubmVlZHNSZWRyYXcgPSB0cnVlO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICBtYXRjaExheWVycyh0aGlzLnByb3BzLmxheWVycywgbmV4dFByb3BzLmxheWVycyk7XG4gICAgZmluYWxpemVPbGRMYXllcnModGhpcy5wcm9wcy5sYXllcnMpO1xuICAgIHVwZGF0ZU1hdGNoZWRMYXllcnMobmV4dFByb3BzLmxheWVycyk7XG4gICAgdGhpcy5pbml0aWFsaXplTGF5ZXJzKG5leHRQcm9wcy5sYXllcnMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZUxheWVycyhsYXllcnMpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGluaXRpYWxpemVOZXdMYXllcnMobGF5ZXJzLCB7Z2x9KTtcbiAgICB0aGlzLmFkZExheWVyc1RvU2NlbmUobGF5ZXJzKTtcbiAgfVxuXG4gIGFkZExheWVyc1RvU2NlbmUobGF5ZXJzKSB7XG4gICAgY29uc3Qge3NjZW5lfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFzY2VuZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBjbGVhciBzY2VuZSBhbmQgcmVwb3B1bGF0ZSBiYXNlZCBvbiBuZXcgbGF5ZXJzXG4gICAgc2NlbmUucmVtb3ZlQWxsKCk7XG4gICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcbiAgICAgIC8vIFNhdmUgbGF5ZXIgb24gbW9kZWwgZm9yIHBpY2tpbmcgcHVycG9zZXNcbiAgICAgIC8vIFRPRE8gLSBzdG9yZSBvbiBtb2RlbC51c2VyRGF0YSByYXRoZXIgdGhhbiBkaXJlY3RseSBvbiBtb2RlbFxuICAgICAgbGF5ZXIuc3RhdGUubW9kZWwubGF5ZXIgPSBsYXllcjtcbiAgICAgIC8vIEFkZCBtb2RlbCB0byBzY2VuZVxuICAgICAgc2NlbmUuYWRkKGxheWVyLnN0YXRlLm1vZGVsKTtcbiAgICB9XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uUmVuZGVyZXJJbml0aWFsaXplZCh7Z2wsIHNjZW5lfSkge1xuICAgIHRoaXMuc2V0U3RhdGUoe2dsLCBzY2VuZX0pO1xuICAgIGluaXRpYWxpemVOZXdMYXllcnModGhpcy5wcm9wcy5sYXllcnMsIHtnbH0pO1xuICB9XG5cbiAgLy8gUm91dGUgZXZlbnRzIHRvIGxheWVyc1xuICBAYXV0b2JpbmRcbiAgX29uQ2xpY2soaW5mbykge1xuICAgIGNvbnN0IHtwaWNrZWR9ID0gaW5mbztcbiAgICBmb3IgKGNvbnN0IGl0ZW0gb2YgcGlja2VkKSB7XG4gICAgICBpZiAoaXRlbS5tb2RlbC5sYXllci5vbkNsaWNrKHtjb2xvcjogaXRlbS5jb2xvciwgLi4uaW5mb30pKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAgIC8vIFJvdXRlIGV2ZW50cyB0byBsYXllcnNcbiAgQGF1dG9iaW5kXG4gIF9vbk1vdXNlTW92ZShpbmZvKSB7XG4gICAgY29uc3Qge3BpY2tlZH0gPSBpbmZvO1xuICAgIGZvciAoY29uc3QgaXRlbSBvZiBwaWNrZWQpIHtcbiAgICAgIGlmIChpdGVtLm1vZGVsLmxheWVyLm9uSG92ZXIoe2NvbG9yOiBpdGVtLmNvbG9yLCAuLi5pbmZvfSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfY2hlY2tJZk5lZWRSZWRyYXcoKSB7XG4gICAgY29uc3Qge2xheWVyc30gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiBsYXllcnNOZWVkUmVkcmF3KGxheWVycywge2NsZWFyRmxhZzogdHJ1ZX0pO1xuICB9XG5cbiAgLy8gQGF1dG9iaW5kXG4gIC8vIG9uQWZ0ZXJSZW5kZXJcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGxheWVycywgLi4ub3RoZXJQcm9wc30gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gaWYgKGxheWVycy5sZW5ndGggPT09IDApIHtcbiAgICAvLyAgIHJldHVybiBudWxsO1xuICAgIC8vIH1cblxuICAgIHRoaXMuaW5pdGlhbGl6ZUxheWVycyhsYXllcnMpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxXZWJHTFJlbmRlcmVyXG4gICAgICAgIHsgLi4ub3RoZXJQcm9wcyB9XG5cbiAgICAgICAgd2lkdGg9eyB3aWR0aCB9XG4gICAgICAgIGhlaWdodD17IGhlaWdodCB9XG5cbiAgICAgICAgdmlld3BvcnQ9eyBuZXcgZmxhdFdvcmxkLlZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpIH1cbiAgICAgICAgY2FtZXJhPXsgZmxhdFdvcmxkLmdldENhbWVyYSgpIH1cbiAgICAgICAgbGlnaHRzPXsgZmxhdFdvcmxkLmdldExpZ2h0aW5nKCkgfVxuICAgICAgICBibGVuZGluZz17IGZsYXRXb3JsZC5nZXRCbGVuZGluZygpIH1cbiAgICAgICAgcGl4ZWxSYXRpbz17IGZsYXRXb3JsZC5nZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKSB9XG5cbiAgICAgICAgb25SZW5kZXJlckluaXRpYWxpemVkPXsgdGhpcy5fb25SZW5kZXJlckluaXRpYWxpemVkIH1cbiAgICAgICAgb25OZWVkUmVkcmF3PXsgdGhpcy5fY2hlY2tJZk5lZWRSZWRyYXcgfVxuICAgICAgICBvbk1vdXNlTW92ZT17IHRoaXMuX29uTW91c2VNb3ZlIH1cbiAgICAgICAgb25DbGljaz17IHRoaXMuX29uQ2xpY2sgfS8+XG4gICAgKTtcbiAgfVxuXG59XG4iXX0=