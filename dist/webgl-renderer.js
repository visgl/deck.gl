'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

/* eslint-disable no-console, no-try-catch */
/* global console */


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _luma = require('luma.gl');

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
  id: _react.PropTypes.string,

  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,

  pixelRatio: _react.PropTypes.number,
  viewport: _react.PropTypes.object.isRequired,
  camera: _react.PropTypes.object.isRequired,
  lights: _react.PropTypes.object,
  blending: _react.PropTypes.object,
  events: _react.PropTypes.object,

  onRendererInitialized: _react.PropTypes.func.isRequired,
  onInitializationFailed: _react.PropTypes.func,
  onError: _react.PropTypes.func,

  onBeforeRenderFrame: _react.PropTypes.func,
  onAfterRenderFrame: _react.PropTypes.func,
  onBeforeRenderPickingScene: _react.PropTypes.func,
  onAfterRenderPickingScene: _react.PropTypes.func,

  onNeedRedraw: _react.PropTypes.func,
  onMouseMove: _react.PropTypes.func,
  onClick: _react.PropTypes.func
};

var DEFAULT_PROPS = {
  id: 'webgl-canvas',
  onRendererInitialized: function onRendererInitialized() {},
  onInitializationFailed: function onInitializationFailed(error) {
    return console.error(error);
  },
  onError: function onError(error) {
    throw error;
  },
  onBeforeRenderFrame: function onBeforeRenderFrame() {},
  onAfterRenderFrame: function onAfterRenderFrame() {},
  onBeforeRenderPickingScene: function onBeforeRenderPickingScene() {},
  onAfterRenderPickingScene: function onAfterRenderPickingScene() {},

  onNeedRedraw: function onNeedRedraw() {
    return true;
  },
  onMouseMove: function onMouseMove() {},
  onClick: function onClick() {}
};

var WebGLRenderer = (_class = function (_React$Component) {
  _inherits(WebGLRenderer, _React$Component);

  _createClass(WebGLRenderer, null, [{
    key: 'propTypes',
    get: function get() {
      return PROP_TYPES;
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return DEFAULT_PROPS;
    }

    /**
     * @classdesc
     * Small react component that uses Luma.GL to initialize a WebGL context.
     *
     * Returns a canvas, creates a basic WebGL context, a camera and a scene,
     * sets up a renderloop, and registers some basic event handlers
     *
     * @class
     * @param {Object} props - see propTypes documentation
     */

  }]);

  function WebGLRenderer(props) {
    _classCallCheck(this, WebGLRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebGLRenderer).call(this, props));

    _this.state = {
      gl: null
    };
    return _this;
  }

  _createClass(WebGLRenderer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var canvas = _reactDom2.default.findDOMNode(this);
      this._initWebGL(canvas);
      this._animationLoop();
    }

    /**
     * Initialize LumaGL library and through it WebGL
     * @param {string} canvas
     */

  }, {
    key: '_initWebGL',
    value: function _initWebGL(canvas) {

      var gl = void 0;
      try {
        gl = (0, _luma.createGLContext)(canvas);
      } catch (error) {
        this.props.onInitializationFailed(error);
        return;
      }

      var events = _luma.Events.create(canvas, {
        cacheSize: false,
        cachePosition: false,
        centerOrigin: false,
        onClick: this._onClick,
        onMouseMove: (0, _lodash2.default)(this._onMouseMove, 100)
      });

      var camera = new _luma.PerspectiveCamera(this.props.camera);

      // TODO - remove program parameter from scene, or move it into options
      var scene = new _luma.Scene(gl, {
        lights: this.props.lights,
        backgroundColor: { r: 0, g: 0, b: 0, a: 0 }
      });

      this.setState({ gl: gl, camera: camera, scene: scene, events: events });

      this.props.onRendererInitialized({ gl: gl, camera: camera, scene: scene });
    }

    // TODO - move this back to luma.gl/scene.js
    /* eslint-disable max-statements */

  }, {
    key: '_pick',
    value: function _pick(x, y) {
      var _state = this.state;
      var gl = _state.gl;
      var scene = _state.scene;
      var camera = _state.camera;


      var pickedModels = scene.pickModels(gl, { camera: camera, x: x, y: y });

      return pickedModels;
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var picked = this._pick(event.x, event.y);
      this.props.onClick({ event: event, picked: picked });
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var picked = this._pick(event.x, event.y);
      this.props.onMouseMove({ event: event, picked: picked });
    }
  }, {
    key: '_renderFrame',
    value: function _renderFrame() {
      var _props = this.props;
      var _props$viewport = _props.viewport;
      var x = _props$viewport.x;
      var y = _props$viewport.y;
      var width = _props$viewport.width;
      var height = _props$viewport.height;
      var _props$blending = _props.blending;
      var enable = _props$blending.enable;
      var blendFunc = _props$blending.blendFunc;
      var blendEquation = _props$blending.blendEquation;
      var onBeforeRenderFrame = _props.onBeforeRenderFrame;
      var onAfterRenderFrame = _props.onAfterRenderFrame;
      var onNeedRedraw = _props.onNeedRedraw;
      var pixelRatio = _props.pixelRatio;
      var _state2 = this.state;
      var gl = _state2.gl;
      var scene = _state2.scene;
      var camera = _state2.camera;

      if (!gl) {
        return;
      }

      // Note: Do this after gl check, in case onNeedRedraw clears flags
      if (!onNeedRedraw()) {
        return;
      }

      // clear depth and color buffers
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // update viewport to latest props
      // (typically changed by app on browser resize etc)
      gl.viewport(x * pixelRatio, y * pixelRatio, width * pixelRatio, height * pixelRatio);

      // setup bledning
      if (enable) {
        gl.enable(gl.BLEND);
        gl.blendFunc.apply(gl, _toConsumableArray(blendFunc.map(function (s) {
          return gl.get(s);
        })));
        gl.blendEquation(gl.get(blendEquation));
      } else {
        gl.disable(gl.BLEND);
      }

      onBeforeRenderFrame();
      scene.render(gl, { camera: camera });
      onAfterRenderFrame();
    }

    /**
     * Main WebGL animation loop
     */

  }, {
    key: '_animationLoop',
    value: function _animationLoop() {
      this._renderFrame();
      // Keep registering ourselves for the next animation frame
      _luma.Fx.requestAnimationFrame(this._animationLoop);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var id = _props2.id;
      var width = _props2.width;
      var height = _props2.height;
      var pixelRatio = _props2.pixelRatio;

      return _react2.default.createElement('canvas', {
        id: id,
        width: width * pixelRatio || 1,
        height: height * pixelRatio || 1,
        style: { width: width, height: height } });
    }
  }]);

  return WebGLRenderer;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, '_onClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_animationLoop', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_animationLoop'), _class.prototype)), _class);
exports.default = WebGLRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLGFBQWE7QUFDakIsTUFBSSxpQkFBVSxNQUFWOztBQUVKLFNBQU8saUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNQLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjs7QUFFUixjQUFZLGlCQUFVLE1BQVY7QUFDWixZQUFVLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDVixVQUFRLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUixVQUFRLGlCQUFVLE1BQVY7QUFDUixZQUFVLGlCQUFVLE1BQVY7QUFDVixVQUFRLGlCQUFVLE1BQVY7O0FBRVIseUJBQXVCLGlCQUFVLElBQVYsQ0FBZSxVQUFmO0FBQ3ZCLDBCQUF3QixpQkFBVSxJQUFWO0FBQ3hCLFdBQVMsaUJBQVUsSUFBVjs7QUFFVCx1QkFBcUIsaUJBQVUsSUFBVjtBQUNyQixzQkFBb0IsaUJBQVUsSUFBVjtBQUNwQiw4QkFBNEIsaUJBQVUsSUFBVjtBQUM1Qiw2QkFBMkIsaUJBQVUsSUFBVjs7QUFFM0IsZ0JBQWMsaUJBQVUsSUFBVjtBQUNkLGVBQWEsaUJBQVUsSUFBVjtBQUNiLFdBQVMsaUJBQVUsSUFBVjtDQXhCTDs7QUEyQk4sSUFBTSxnQkFBZ0I7QUFDcEIsTUFBSSxjQUFKO0FBQ0EseUJBQXVCLGlDQUFNLEVBQU47QUFDdkIsMEJBQXdCO1dBQVMsUUFBUSxLQUFSLENBQWMsS0FBZDtHQUFUO0FBQ3hCLFdBQVMsd0JBQVM7QUFDaEIsVUFBTSxLQUFOLENBRGdCO0dBQVQ7QUFHVCx1QkFBcUIsK0JBQU0sRUFBTjtBQUNyQixzQkFBb0IsOEJBQU0sRUFBTjtBQUNwQiw4QkFBNEIsc0NBQU0sRUFBTjtBQUM1Qiw2QkFBMkIscUNBQU0sRUFBTjs7QUFFM0IsZ0JBQWM7V0FBTTtHQUFOO0FBQ2QsZUFBYSx1QkFBTSxFQUFOO0FBQ2IsV0FBUyxtQkFBTSxFQUFOO0NBZEw7O0lBaUJlOzs7Ozt3QkFFSTtBQUNyQixhQUFPLFVBQVAsQ0FEcUI7Ozs7d0JBSUc7QUFDeEIsYUFBTyxhQUFQLENBRHdCOzs7Ozs7Ozs7Ozs7Ozs7O0FBYzFCLFdBcEJtQixhQW9CbkIsQ0FBWSxLQUFaLEVBQW1COzBCQXBCQSxlQW9CQTs7dUVBcEJBLDBCQXFCWCxRQURXOztBQUVqQixVQUFLLEtBQUwsR0FBYTtBQUNYLFVBQUksSUFBSjtLQURGLENBRmlCOztHQUFuQjs7ZUFwQm1COzt3Q0EyQkM7QUFDbEIsVUFBTSxTQUFTLG1CQUFTLFdBQVQsQ0FBcUIsSUFBckIsQ0FBVCxDQURZO0FBRWxCLFdBQUssVUFBTCxDQUFnQixNQUFoQixFQUZrQjtBQUdsQixXQUFLLGNBQUwsR0FIa0I7Ozs7Ozs7Ozs7K0JBVVQsUUFBUTs7QUFFakIsVUFBSSxXQUFKLENBRmlCO0FBR2pCLFVBQUk7QUFDRixhQUFLLDJCQUFnQixNQUFoQixDQUFMLENBREU7T0FBSixDQUVFLE9BQU8sS0FBUCxFQUFjO0FBQ2QsYUFBSyxLQUFMLENBQVcsc0JBQVgsQ0FBa0MsS0FBbEMsRUFEYztBQUVkLGVBRmM7T0FBZDs7QUFLRixVQUFNLFNBQVMsYUFBTyxNQUFQLENBQWMsTUFBZCxFQUFzQjtBQUNuQyxtQkFBVyxLQUFYO0FBQ0EsdUJBQWUsS0FBZjtBQUNBLHNCQUFjLEtBQWQ7QUFDQSxpQkFBUyxLQUFLLFFBQUw7QUFDVCxxQkFBYSxzQkFBUyxLQUFLLFlBQUwsRUFBbUIsR0FBNUIsQ0FBYjtPQUxhLENBQVQsQ0FWVzs7QUFrQmpCLFVBQU0sU0FBUyw0QkFBc0IsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUEvQjs7O0FBbEJXLFVBcUJYLFFBQVEsZ0JBQVUsRUFBVixFQUFjO0FBQzFCLGdCQUFRLEtBQUssS0FBTCxDQUFXLE1BQVg7QUFDUix5QkFBaUIsRUFBQyxHQUFHLENBQUgsRUFBTSxHQUFHLENBQUgsRUFBTSxHQUFHLENBQUgsRUFBTSxHQUFHLENBQUgsRUFBcEM7T0FGWSxDQUFSLENBckJXOztBQTBCakIsV0FBSyxRQUFMLENBQWMsRUFBQyxNQUFELEVBQUssY0FBTCxFQUFhLFlBQWIsRUFBb0IsY0FBcEIsRUFBZCxFQTFCaUI7O0FBNEJqQixXQUFLLEtBQUwsQ0FBVyxxQkFBWCxDQUFpQyxFQUFDLE1BQUQsRUFBSyxjQUFMLEVBQWEsWUFBYixFQUFqQyxFQTVCaUI7Ozs7Ozs7OzBCQWlDYixHQUFHLEdBQUc7bUJBQ2tCLEtBQUssS0FBTCxDQURsQjtVQUNILGVBREc7VUFDQyxxQkFERDtVQUNRLHVCQURSOzs7QUFHVixVQUFNLGVBQWUsTUFBTSxVQUFOLENBQWlCLEVBQWpCLEVBQXFCLEVBQUMsY0FBRCxFQUFTLElBQVQsRUFBWSxJQUFaLEVBQXJCLENBQWYsQ0FISTs7QUFLVixhQUFPLFlBQVAsQ0FMVTs7Ozs2QkFTSCxPQUFPO0FBQ2QsVUFBTSxTQUFTLEtBQUssS0FBTCxDQUFXLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUE3QixDQURRO0FBRWQsV0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQW5CLEVBRmM7Ozs7aUNBTUgsT0FBTztBQUNsQixVQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQTdCLENBRFk7QUFFbEIsV0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQXZCLEVBRmtCOzs7O21DQUtMO21CQVFULEtBQUssS0FBTCxDQVJTO21DQUVYLFNBRlc7VUFFQSxzQkFGQTtVQUVHLHNCQUZIO1VBRU0sOEJBRk47VUFFYSxnQ0FGYjttQ0FHWCxTQUhXO1VBR0EsZ0NBSEE7VUFHUSxzQ0FIUjtVQUdtQiw4Q0FIbkI7VUFJWCxpREFKVztVQUtYLCtDQUxXO1VBTVgsbUNBTlc7VUFPWCwrQkFQVztvQkFVZSxLQUFLLEtBQUwsQ0FWZjtVQVVOLGdCQVZNO1VBVUYsc0JBVkU7VUFVSyx3QkFWTDs7QUFXYixVQUFJLENBQUMsRUFBRCxFQUFLO0FBQ1AsZUFETztPQUFUOzs7QUFYYSxVQWdCVCxDQUFDLGNBQUQsRUFBaUI7QUFDbkIsZUFEbUI7T0FBckI7OztBQWhCYSxRQXFCYixDQUFHLEtBQUgsQ0FBUyxHQUFHLGdCQUFILEdBQXNCLEdBQUcsZ0JBQUgsQ0FBL0I7Ozs7QUFyQmEsUUF5QmIsQ0FBRyxRQUFILENBQ0UsSUFBSSxVQUFKLEVBQ0EsSUFBSSxVQUFKLEVBQ0EsUUFBUSxVQUFSLEVBQ0EsU0FBUyxVQUFULENBSkY7OztBQXpCYSxVQWlDVCxNQUFKLEVBQVk7QUFDVixXQUFHLE1BQUgsQ0FBVSxHQUFHLEtBQUgsQ0FBVixDQURVO0FBRVYsV0FBRyxTQUFILDhCQUFnQixVQUFVLEdBQVYsQ0FBYztpQkFBSyxHQUFHLEdBQUgsQ0FBTyxDQUFQO1NBQUwsRUFBOUIsRUFGVTtBQUdWLFdBQUcsYUFBSCxDQUFpQixHQUFHLEdBQUgsQ0FBTyxhQUFQLENBQWpCLEVBSFU7T0FBWixNQUlPO0FBQ0wsV0FBRyxPQUFILENBQVcsR0FBRyxLQUFILENBQVgsQ0FESztPQUpQOztBQVFBLDRCQXpDYTtBQTBDYixZQUFNLE1BQU4sQ0FBYSxFQUFiLEVBQWlCLEVBQUMsY0FBRCxFQUFqQixFQTFDYTtBQTJDYiwyQkEzQ2E7Ozs7Ozs7OztxQ0FrREU7QUFDZixXQUFLLFlBQUw7O0FBRGUsY0FHZixDQUFHLHFCQUFILENBQXlCLEtBQUssY0FBTCxDQUF6QixDQUhlOzs7OzZCQU1SO29CQUNpQyxLQUFLLEtBQUwsQ0FEakM7VUFDQSxnQkFEQTtVQUNJLHNCQURKO1VBQ1csd0JBRFg7VUFDbUIsZ0NBRG5COztBQUVQLGFBQ0U7QUFDRSxZQUFLLEVBQUw7QUFDQSxlQUFRLFFBQVEsVUFBUixJQUFzQixDQUF0QjtBQUNSLGdCQUFTLFNBQVMsVUFBVCxJQUF1QixDQUF2QjtBQUNULGVBQVEsRUFBQyxZQUFELEVBQVEsY0FBUixFQUFSLEVBSkYsQ0FERixDQUZPOzs7O1NBbEpVO0VBQXNCLGdCQUFNLFNBQU47a0JBQXRCIiwiZmlsZSI6IndlYmdsLXJlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSwgbm8tdHJ5LWNhdGNoICovXG4vKiBnbG9iYWwgY29uc29sZSAqL1xuaW1wb3J0IFJlYWN0LCB7UHJvcFR5cGVzfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICdhdXRvYmluZC1kZWNvcmF0b3InO1xuaW1wb3J0IHtjcmVhdGVHTENvbnRleHQsIFBlcnNwZWN0aXZlQ2FtZXJhLCBTY2VuZSwgRXZlbnRzLCBGeH0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoLnRocm90dGxlJztcblxuY29uc3QgUFJPUF9UWVBFUyA9IHtcbiAgaWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgcGl4ZWxSYXRpbzogUHJvcFR5cGVzLm51bWJlcixcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgY2FtZXJhOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIGxpZ2h0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgYmxlbmRpbmc6IFByb3BUeXBlcy5vYmplY3QsXG4gIGV2ZW50czogUHJvcFR5cGVzLm9iamVjdCxcblxuICBvblJlbmRlcmVySW5pdGlhbGl6ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uSW5pdGlhbGl6YXRpb25GYWlsZWQ6IFByb3BUeXBlcy5mdW5jLFxuICBvbkVycm9yOiBQcm9wVHlwZXMuZnVuYyxcblxuICBvbkJlZm9yZVJlbmRlckZyYW1lOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25BZnRlclJlbmRlckZyYW1lOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25CZWZvcmVSZW5kZXJQaWNraW5nU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkFmdGVyUmVuZGVyUGlja2luZ1NjZW5lOiBQcm9wVHlwZXMuZnVuYyxcblxuICBvbk5lZWRSZWRyYXc6IFByb3BUeXBlcy5mdW5jLFxuICBvbk1vdXNlTW92ZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jXG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBpZDogJ3dlYmdsLWNhbnZhcycsXG4gIG9uUmVuZGVyZXJJbml0aWFsaXplZDogKCkgPT4ge30sXG4gIG9uSW5pdGlhbGl6YXRpb25GYWlsZWQ6IGVycm9yID0+IGNvbnNvbGUuZXJyb3IoZXJyb3IpLFxuICBvbkVycm9yOiBlcnJvciA9PiB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0sXG4gIG9uQmVmb3JlUmVuZGVyRnJhbWU6ICgpID0+IHt9LFxuICBvbkFmdGVyUmVuZGVyRnJhbWU6ICgpID0+IHt9LFxuICBvbkJlZm9yZVJlbmRlclBpY2tpbmdTY2VuZTogKCkgPT4ge30sXG4gIG9uQWZ0ZXJSZW5kZXJQaWNraW5nU2NlbmU6ICgpID0+IHt9LFxuXG4gIG9uTmVlZFJlZHJhdzogKCkgPT4gdHJ1ZSxcbiAgb25Nb3VzZU1vdmU6ICgpID0+IHt9LFxuICBvbkNsaWNrOiAoKSA9PiB7fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2ViR0xSZW5kZXJlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIGdldCBwcm9wVHlwZXMoKSB7XG4gICAgcmV0dXJuIFBST1BfVFlQRVM7XG4gIH1cblxuICBzdGF0aWMgZ2V0IGRlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4gREVGQVVMVF9QUk9QUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIFNtYWxsIHJlYWN0IGNvbXBvbmVudCB0aGF0IHVzZXMgTHVtYS5HTCB0byBpbml0aWFsaXplIGEgV2ViR0wgY29udGV4dC5cbiAgICpcbiAgICogUmV0dXJucyBhIGNhbnZhcywgY3JlYXRlcyBhIGJhc2ljIFdlYkdMIGNvbnRleHQsIGEgY2FtZXJhIGFuZCBhIHNjZW5lLFxuICAgKiBzZXRzIHVwIGEgcmVuZGVybG9vcCwgYW5kIHJlZ2lzdGVycyBzb21lIGJhc2ljIGV2ZW50IGhhbmRsZXJzXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgLSBzZWUgcHJvcFR5cGVzIGRvY3VtZW50YXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBnbDogbnVsbFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBjYW52YXMgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICB0aGlzLl9pbml0V2ViR0woY2FudmFzKTtcbiAgICB0aGlzLl9hbmltYXRpb25Mb29wKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBMdW1hR0wgbGlicmFyeSBhbmQgdGhyb3VnaCBpdCBXZWJHTFxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzXG4gICAqL1xuICBfaW5pdFdlYkdMKGNhbnZhcykge1xuXG4gICAgbGV0IGdsO1xuICAgIHRyeSB7XG4gICAgICBnbCA9IGNyZWF0ZUdMQ29udGV4dChjYW52YXMpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnByb3BzLm9uSW5pdGlhbGl6YXRpb25GYWlsZWQoZXJyb3IpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50cyA9IEV2ZW50cy5jcmVhdGUoY2FudmFzLCB7XG4gICAgICBjYWNoZVNpemU6IGZhbHNlLFxuICAgICAgY2FjaGVQb3NpdGlvbjogZmFsc2UsXG4gICAgICBjZW50ZXJPcmlnaW46IGZhbHNlLFxuICAgICAgb25DbGljazogdGhpcy5fb25DbGljayxcbiAgICAgIG9uTW91c2VNb3ZlOiB0aHJvdHRsZSh0aGlzLl9vbk1vdXNlTW92ZSwgMTAwKVxuICAgIH0pO1xuXG4gICAgY29uc3QgY2FtZXJhID0gbmV3IFBlcnNwZWN0aXZlQ2FtZXJhKHRoaXMucHJvcHMuY2FtZXJhKTtcblxuICAgIC8vIFRPRE8gLSByZW1vdmUgcHJvZ3JhbSBwYXJhbWV0ZXIgZnJvbSBzY2VuZSwgb3IgbW92ZSBpdCBpbnRvIG9wdGlvbnNcbiAgICBjb25zdCBzY2VuZSA9IG5ldyBTY2VuZShnbCwge1xuICAgICAgbGlnaHRzOiB0aGlzLnByb3BzLmxpZ2h0cyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjoge3I6IDAsIGc6IDAsIGI6IDAsIGE6IDB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtnbCwgY2FtZXJhLCBzY2VuZSwgZXZlbnRzfSk7XG5cbiAgICB0aGlzLnByb3BzLm9uUmVuZGVyZXJJbml0aWFsaXplZCh7Z2wsIGNhbWVyYSwgc2NlbmV9KTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBtb3ZlIHRoaXMgYmFjayB0byBsdW1hLmdsL3NjZW5lLmpzXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIF9waWNrKHgsIHkpIHtcbiAgICBjb25zdCB7Z2wsIHNjZW5lLCBjYW1lcmF9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IHBpY2tlZE1vZGVscyA9IHNjZW5lLnBpY2tNb2RlbHMoZ2wsIHtjYW1lcmEsIHgsIHl9KTtcblxuICAgIHJldHVybiBwaWNrZWRNb2RlbHM7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uQ2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBwaWNrZWQgPSB0aGlzLl9waWNrKGV2ZW50LngsIGV2ZW50LnkpO1xuICAgIHRoaXMucHJvcHMub25DbGljayh7ZXZlbnQsIHBpY2tlZH0pO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9vbk1vdXNlTW92ZShldmVudCkge1xuICAgIGNvbnN0IHBpY2tlZCA9IHRoaXMuX3BpY2soZXZlbnQueCwgZXZlbnQueSk7XG4gICAgdGhpcy5wcm9wcy5vbk1vdXNlTW92ZSh7ZXZlbnQsIHBpY2tlZH0pO1xuICB9XG5cbiAgX3JlbmRlckZyYW1lKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHZpZXdwb3J0OiB7eCwgeSwgd2lkdGgsIGhlaWdodH0sXG4gICAgICBibGVuZGluZzoge2VuYWJsZSwgYmxlbmRGdW5jLCBibGVuZEVxdWF0aW9ufSxcbiAgICAgIG9uQmVmb3JlUmVuZGVyRnJhbWUsXG4gICAgICBvbkFmdGVyUmVuZGVyRnJhbWUsXG4gICAgICBvbk5lZWRSZWRyYXcsXG4gICAgICBwaXhlbFJhdGlvXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCB7Z2wsIHNjZW5lLCBjYW1lcmF9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTm90ZTogRG8gdGhpcyBhZnRlciBnbCBjaGVjaywgaW4gY2FzZSBvbk5lZWRSZWRyYXcgY2xlYXJzIGZsYWdzXG4gICAgaWYgKCFvbk5lZWRSZWRyYXcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGRlcHRoIGFuZCBjb2xvciBidWZmZXJzXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gdXBkYXRlIHZpZXdwb3J0IHRvIGxhdGVzdCBwcm9wc1xuICAgIC8vICh0eXBpY2FsbHkgY2hhbmdlZCBieSBhcHAgb24gYnJvd3NlciByZXNpemUgZXRjKVxuICAgIGdsLnZpZXdwb3J0KFxuICAgICAgeCAqIHBpeGVsUmF0aW8sXG4gICAgICB5ICogcGl4ZWxSYXRpbyxcbiAgICAgIHdpZHRoICogcGl4ZWxSYXRpbyxcbiAgICAgIGhlaWdodCAqIHBpeGVsUmF0aW9cbiAgICApO1xuXG4gICAgLy8gc2V0dXAgYmxlZG5pbmdcbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgZ2wuYmxlbmRGdW5jKC4uLmJsZW5kRnVuYy5tYXAocyA9PiBnbC5nZXQocykpKTtcbiAgICAgIGdsLmJsZW5kRXF1YXRpb24oZ2wuZ2V0KGJsZW5kRXF1YXRpb24pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7XG4gICAgfVxuXG4gICAgb25CZWZvcmVSZW5kZXJGcmFtZSgpO1xuICAgIHNjZW5lLnJlbmRlcihnbCwge2NhbWVyYX0pO1xuICAgIG9uQWZ0ZXJSZW5kZXJGcmFtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1haW4gV2ViR0wgYW5pbWF0aW9uIGxvb3BcbiAgICovXG4gIEBhdXRvYmluZFxuICBfYW5pbWF0aW9uTG9vcCgpIHtcbiAgICB0aGlzLl9yZW5kZXJGcmFtZSgpO1xuICAgIC8vIEtlZXAgcmVnaXN0ZXJpbmcgb3Vyc2VsdmVzIGZvciB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcbiAgICBGeC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0aW9uTG9vcCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2lkLCB3aWR0aCwgaGVpZ2h0LCBwaXhlbFJhdGlvfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxjYW52YXNcbiAgICAgICAgaWQ9eyBpZCB9XG4gICAgICAgIHdpZHRoPXsgd2lkdGggKiBwaXhlbFJhdGlvIHx8IDEgfVxuICAgICAgICBoZWlnaHQ9eyBoZWlnaHQgKiBwaXhlbFJhdGlvIHx8IDEgfVxuICAgICAgICBzdHlsZT17IHt3aWR0aCwgaGVpZ2h0fSB9Lz5cbiAgICApO1xuICB9XG5cbn1cbiJdfQ==