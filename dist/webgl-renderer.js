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
  onInitializationFailed: function onInitializationFailed() {},
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

      var gl = (0, _luma.createGLContext)(canvas);

      var events = _luma.Events.create(canvas, {
        cacheSize: false,
        cachePosition: false,
        centerOrigin: false,
        onClick: this._onClick,
        onMouseMove: (0, _lodash2.default)(this._onMouseMove, 100)
      });

      // events={ {
      //   onObjectHovered: this._handleObjectHovered,
      //   onObjectClicked: this._handleObjectClicked
      // } }

      var camera = new _luma.PerspectiveCamera(this.props.camera);

      // TODO - remove program parameter from scene, or move it into options
      var scene = new _luma.Scene(gl, null, camera, {
        lights: this.props.lights,
        backgroundColor: { r: 0, g: 0, b: 0, a: 0 }
      });

      this.setState({ gl: gl, camera: camera, scene: scene, events: events });

      this.props.onRendererInitialized({ gl: gl, camera: camera, scene: scene });
    }

    // TODO - move this to luma.gl/pick.js or model.js?
    /* eslint-disable max-statements */

  }, {
    key: '_pick',
    value: function _pick(x, y) {
      var _state = this.state;
      var gl = _state.gl;
      var scene = _state.scene;
      var camera = _state.camera;


      if (this._pickingFBO === undefined) {
        this._pickingFBO = new _luma.Framebuffer(gl, {
          width: gl.canvas.width,
          height: gl.canvas.height
        });
      }

      this._pickingFBO.bind();

      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, gl.canvas.height - y, 1, 1);

      var picked = [];

      // TODO - iterate in reverse order?
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = scene.models[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var model = _step.value;

          if (model.pickable) {
            var program = model.program;
            program.use();
            program.setUniform('enablePicking', 1);
            model.onBeforeRender();
            var view = camera.view;
            var matrix = model.matrix;

            var worldMatrix = view.mulMat4(matrix);

            model.setState(program);

            program.setUniform('worldMatrix', worldMatrix);

            gl.clear(gl.COLOR_BUFFER_BIT);

            model.render();

            // Read the color in the central pixel, to be mapped with picking colors
            var color = new Uint8Array(4);
            gl.readPixels(x, gl.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

            picked.push({ model: model, color: color });

            program.setUniform('enablePicking', 0);

            model.unsetState(program);
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

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.SCISSOR_TEST);
      return picked;
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

      if (!gl) {
        return;
      }

      // Note: Do this after gl check, in case onNeedRedraw clears flags
      if (!onNeedRedraw()) {}
      // return;


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
      scene.render();
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
        ref: 'webgl-renderer-overlay',
        width: width * pixelRatio || 1,
        height: height * pixelRatio || 1,
        style: { width: width, height: height } });
    }
  }]);

  return WebGLRenderer;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, '_onClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_animationLoop', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_animationLoop'), _class.prototype)), _class);
exports.default = WebGLRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQSxJQUFNLGFBQWE7QUFDakIsTUFBSSxpQkFBVSxNQUFWOztBQUVKLFNBQU8saUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNQLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjs7QUFFUixjQUFZLGlCQUFVLE1BQVY7QUFDWixZQUFVLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDVixVQUFRLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUixVQUFRLGlCQUFVLE1BQVY7QUFDUixZQUFVLGlCQUFVLE1BQVY7QUFDVixVQUFRLGlCQUFVLE1BQVY7O0FBRVIseUJBQXVCLGlCQUFVLElBQVYsQ0FBZSxVQUFmO0FBQ3ZCLDBCQUF3QixpQkFBVSxJQUFWO0FBQ3hCLFdBQVMsaUJBQVUsSUFBVjs7QUFFVCx1QkFBcUIsaUJBQVUsSUFBVjtBQUNyQixzQkFBb0IsaUJBQVUsSUFBVjtBQUNwQiw4QkFBNEIsaUJBQVUsSUFBVjtBQUM1Qiw2QkFBMkIsaUJBQVUsSUFBVjs7QUFFM0IsZ0JBQWMsaUJBQVUsSUFBVjtBQUNkLGVBQWEsaUJBQVUsSUFBVjtBQUNiLFdBQVMsaUJBQVUsSUFBVjtDQXhCTDs7QUEyQk4sSUFBTSxnQkFBZ0I7QUFDcEIsTUFBSSxjQUFKO0FBQ0EseUJBQXVCLGlDQUFNLEVBQU47QUFDdkIsMEJBQXdCLGtDQUFNLEVBQU47QUFDeEIsV0FBUyx3QkFBUztBQUNoQixVQUFNLEtBQU4sQ0FEZ0I7R0FBVDtBQUdULHVCQUFxQiwrQkFBTSxFQUFOO0FBQ3JCLHNCQUFvQiw4QkFBTSxFQUFOO0FBQ3BCLDhCQUE0QixzQ0FBTSxFQUFOO0FBQzVCLDZCQUEyQixxQ0FBTSxFQUFOOztBQUUzQixnQkFBYztXQUFNO0dBQU47QUFDZCxlQUFhLHVCQUFNLEVBQU47QUFDYixXQUFTLG1CQUFNLEVBQU47Q0FkTDs7SUFpQmU7Ozs7O3dCQUVJO0FBQ3JCLGFBQU8sVUFBUCxDQURxQjs7Ozt3QkFJRztBQUN4QixhQUFPLGFBQVAsQ0FEd0I7Ozs7Ozs7Ozs7Ozs7Ozs7QUFjMUIsV0FwQm1CLGFBb0JuQixDQUFZLEtBQVosRUFBbUI7MEJBcEJBLGVBb0JBOzt1RUFwQkEsMEJBcUJYLFFBRFc7O0FBRWpCLFVBQUssS0FBTCxHQUFhO0FBQ1gsVUFBSSxJQUFKO0tBREYsQ0FGaUI7O0dBQW5COztlQXBCbUI7O3dDQTJCQztBQUNsQixVQUFNLFNBQVMsbUJBQVMsV0FBVCxDQUFxQixJQUFyQixDQUFULENBRFk7QUFFbEIsV0FBSyxVQUFMLENBQWdCLE1BQWhCLEVBRmtCO0FBR2xCLFdBQUssY0FBTCxHQUhrQjs7Ozs7Ozs7OzsrQkFVVCxRQUFROztBQUVqQixVQUFNLEtBQUssMkJBQWdCLE1BQWhCLENBQUwsQ0FGVzs7QUFJakIsVUFBTSxTQUFTLGFBQU8sTUFBUCxDQUFjLE1BQWQsRUFBc0I7QUFDbkMsbUJBQVcsS0FBWDtBQUNBLHVCQUFlLEtBQWY7QUFDQSxzQkFBYyxLQUFkO0FBQ0EsaUJBQVMsS0FBSyxRQUFMO0FBQ1QscUJBQWEsc0JBQVMsS0FBSyxZQUFMLEVBQW1CLEdBQTVCLENBQWI7T0FMYSxDQUFUOzs7Ozs7O0FBSlcsVUFpQlgsU0FBUyw0QkFBc0IsS0FBSyxLQUFMLENBQVcsTUFBWCxDQUEvQjs7O0FBakJXLFVBb0JYLFFBQVEsZ0JBQVUsRUFBVixFQUFjLElBQWQsRUFBb0IsTUFBcEIsRUFBNEI7QUFDeEMsZ0JBQVEsS0FBSyxLQUFMLENBQVcsTUFBWDtBQUNSLHlCQUFpQixFQUFDLEdBQUcsQ0FBSCxFQUFNLEdBQUcsQ0FBSCxFQUFNLEdBQUcsQ0FBSCxFQUFNLEdBQUcsQ0FBSCxFQUFwQztPQUZZLENBQVIsQ0FwQlc7O0FBeUJqQixXQUFLLFFBQUwsQ0FBYyxFQUFDLE1BQUQsRUFBSyxjQUFMLEVBQWEsWUFBYixFQUFvQixjQUFwQixFQUFkLEVBekJpQjs7QUEyQmpCLFdBQUssS0FBTCxDQUFXLHFCQUFYLENBQWlDLEVBQUMsTUFBRCxFQUFLLGNBQUwsRUFBYSxZQUFiLEVBQWpDLEVBM0JpQjs7Ozs7Ozs7MEJBZ0NiLEdBQUcsR0FBRzttQkFDa0IsS0FBSyxLQUFMLENBRGxCO1VBQ0gsZUFERztVQUNDLHFCQUREO1VBQ1EsdUJBRFI7OztBQUdWLFVBQUksS0FBSyxXQUFMLEtBQXFCLFNBQXJCLEVBQWdDO0FBQ2xDLGFBQUssV0FBTCxHQUFtQixzQkFBZ0IsRUFBaEIsRUFBb0I7QUFDckMsaUJBQU8sR0FBRyxNQUFILENBQVUsS0FBVjtBQUNQLGtCQUFRLEdBQUcsTUFBSCxDQUFVLE1BQVY7U0FGUyxDQUFuQixDQURrQztPQUFwQzs7QUFPQSxXQUFLLFdBQUwsQ0FBaUIsSUFBakIsR0FWVTs7QUFZVixTQUFHLE1BQUgsQ0FBVSxHQUFHLFlBQUgsQ0FBVixDQVpVO0FBYVYsU0FBRyxPQUFILENBQVcsQ0FBWCxFQUFjLEdBQUcsTUFBSCxDQUFVLE1BQVYsR0FBbUIsQ0FBbkIsRUFBc0IsQ0FBcEMsRUFBdUMsQ0FBdkMsRUFiVTs7QUFlVixVQUFNLFNBQVMsRUFBVDs7O0FBZkk7Ozs7O0FBa0JWLDZCQUFvQixNQUFNLE1BQU4sMEJBQXBCLG9HQUFrQztjQUF2QixvQkFBdUI7O0FBQ2hDLGNBQUksTUFBTSxRQUFOLEVBQWdCO0FBQ2xCLGdCQUFNLFVBQVUsTUFBTSxPQUFOLENBREU7QUFFbEIsb0JBQVEsR0FBUixHQUZrQjtBQUdsQixvQkFBUSxVQUFSLENBQW1CLGVBQW5CLEVBQW9DLENBQXBDLEVBSGtCO0FBSWxCLGtCQUFNLGNBQU4sR0FKa0I7Z0JBS1gsT0FBUSxPQUFSLEtBTFc7Z0JBTVgsU0FBVSxNQUFWLE9BTlc7O0FBT2xCLGdCQUFNLGNBQWMsS0FBSyxPQUFMLENBQWEsTUFBYixDQUFkLENBUFk7O0FBU2xCLGtCQUFNLFFBQU4sQ0FBZSxPQUFmLEVBVGtCOztBQVdsQixvQkFBUSxVQUFSLENBQW1CLGFBQW5CLEVBQWtDLFdBQWxDLEVBWGtCOztBQWFsQixlQUFHLEtBQUgsQ0FBUyxHQUFHLGdCQUFILENBQVQsQ0Fia0I7O0FBZWxCLGtCQUFNLE1BQU47OztBQWZrQixnQkFrQlosUUFBUSxJQUFJLFVBQUosQ0FBZSxDQUFmLENBQVIsQ0FsQlk7QUFtQmxCLGVBQUcsVUFBSCxDQUNFLENBREYsRUFDSyxHQUFHLE1BQUgsQ0FBVSxNQUFWLEdBQW1CLENBQW5CLEVBQXNCLENBRDNCLEVBQzhCLENBRDlCLEVBQ2lDLEdBQUcsSUFBSCxFQUFTLEdBQUcsYUFBSCxFQUFrQixLQUQ1RCxFQW5Ca0I7O0FBdUJsQixtQkFBTyxJQUFQLENBQVksRUFBQyxZQUFELEVBQVEsWUFBUixFQUFaLEVBdkJrQjs7QUF5QmxCLG9CQUFRLFVBQVIsQ0FBbUIsZUFBbkIsRUFBb0MsQ0FBcEMsRUF6QmtCOztBQTJCbEIsa0JBQU0sVUFBTixDQUFpQixPQUFqQixFQTNCa0I7V0FBcEI7U0FERjs7Ozs7Ozs7Ozs7Ozs7T0FsQlU7O0FBa0RWLFNBQUcsZUFBSCxDQUFtQixHQUFHLFdBQUgsRUFBZ0IsSUFBbkMsRUFsRFU7QUFtRFYsU0FBRyxPQUFILENBQVcsR0FBRyxZQUFILENBQVgsQ0FuRFU7QUFvRFYsYUFBTyxNQUFQLENBcERVOzs7OzZCQXdESCxPQUFPO0FBQ2QsVUFBTSxTQUFTLEtBQUssS0FBTCxDQUFXLE1BQU0sQ0FBTixFQUFTLE1BQU0sQ0FBTixDQUE3QixDQURRO0FBRWQsV0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQW5CLEVBRmM7Ozs7aUNBTUgsT0FBTztBQUNsQixVQUFNLFNBQVMsS0FBSyxLQUFMLENBQVcsTUFBTSxDQUFOLEVBQVMsTUFBTSxDQUFOLENBQTdCLENBRFk7QUFFbEIsV0FBSyxLQUFMLENBQVcsV0FBWCxDQUF1QixFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQXZCLEVBRmtCOzs7O21DQUtMO21CQVFULEtBQUssS0FBTCxDQVJTO21DQUVYLFNBRlc7VUFFQSxzQkFGQTtVQUVHLHNCQUZIO1VBRU0sOEJBRk47VUFFYSxnQ0FGYjttQ0FHWCxTQUhXO1VBR0EsZ0NBSEE7VUFHUSxzQ0FIUjtVQUdtQiw4Q0FIbkI7VUFJWCxpREFKVztVQUtYLCtDQUxXO1VBTVgsbUNBTlc7VUFPWCwrQkFQVztvQkFVTyxLQUFLLEtBQUwsQ0FWUDtVQVVOLGdCQVZNO1VBVUYsc0JBVkU7O0FBV2IsVUFBSSxDQUFDLEVBQUQsRUFBSztBQUNQLGVBRE87T0FBVDs7O0FBWGEsVUFnQlQsQ0FBQyxjQUFELEVBQWlCOzs7OztBQUFyQixRQUtBLENBQUcsS0FBSCxDQUFTLEdBQUcsZ0JBQUgsR0FBc0IsR0FBRyxnQkFBSCxDQUEvQjs7OztBQXJCYSxRQXlCYixDQUFHLFFBQUgsQ0FDRSxJQUFJLFVBQUosRUFDQSxJQUFJLFVBQUosRUFDQSxRQUFRLFVBQVIsRUFDQSxTQUFTLFVBQVQsQ0FKRjs7O0FBekJhLFVBaUNULE1BQUosRUFBWTtBQUNWLFdBQUcsTUFBSCxDQUFVLEdBQUcsS0FBSCxDQUFWLENBRFU7QUFFVixXQUFHLFNBQUgsOEJBQWdCLFVBQVUsR0FBVixDQUFjO2lCQUFLLEdBQUcsR0FBSCxDQUFPLENBQVA7U0FBTCxFQUE5QixFQUZVO0FBR1YsV0FBRyxhQUFILENBQWlCLEdBQUcsR0FBSCxDQUFPLGFBQVAsQ0FBakIsRUFIVTtPQUFaLE1BSU87QUFDTCxXQUFHLE9BQUgsQ0FBVyxHQUFHLEtBQUgsQ0FBWCxDQURLO09BSlA7O0FBUUEsNEJBekNhO0FBMENiLFlBQU0sTUFBTixHQTFDYTtBQTJDYiwyQkEzQ2E7Ozs7Ozs7OztxQ0FrREU7QUFDZixXQUFLLFlBQUw7O0FBRGUsY0FHZixDQUFHLHFCQUFILENBQXlCLEtBQUssY0FBTCxDQUF6QixDQUhlOzs7OzZCQU1SO29CQUNpQyxLQUFLLEtBQUwsQ0FEakM7VUFDQSxnQkFEQTtVQUNJLHNCQURKO1VBQ1csd0JBRFg7VUFDbUIsZ0NBRG5COztBQUVQLGFBQ0U7QUFDRSxZQUFLLEVBQUw7QUFDQSxhQUFNLHdCQUFOO0FBQ0EsZUFBUSxRQUFRLFVBQVIsSUFBc0IsQ0FBdEI7QUFDUixnQkFBUyxTQUFTLFVBQVQsSUFBdUIsQ0FBdkI7QUFDVCxlQUFRLEVBQUMsWUFBRCxFQUFRLGNBQVIsRUFBUixFQUxGLENBREYsQ0FGTzs7OztTQWhNVTtFQUFzQixnQkFBTSxTQUFOO2tCQUF0QiIsImZpbGUiOiJ3ZWJnbC1yZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnYXV0b2JpbmQtZGVjb3JhdG9yJztcbmltcG9ydCB7Y3JlYXRlR0xDb250ZXh0LCBQZXJzcGVjdGl2ZUNhbWVyYSwgU2NlbmUsIEV2ZW50cywgRngsIEZyYW1lYnVmZmVyfVxuICBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdsb2Rhc2gudGhyb3R0bGUnO1xuXG5jb25zdCBQUk9QX1RZUEVTID0ge1xuICBpZDogUHJvcFR5cGVzLnN0cmluZyxcblxuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcblxuICBwaXhlbFJhdGlvOiBQcm9wVHlwZXMubnVtYmVyLFxuICB2aWV3cG9ydDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICBjYW1lcmE6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgbGlnaHRzOiBQcm9wVHlwZXMub2JqZWN0LFxuICBibGVuZGluZzogUHJvcFR5cGVzLm9iamVjdCxcbiAgZXZlbnRzOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gIG9uUmVuZGVyZXJJbml0aWFsaXplZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25Jbml0aWFsaXphdGlvbkZhaWxlZDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLFxuXG4gIG9uQmVmb3JlUmVuZGVyRnJhbWU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkFmdGVyUmVuZGVyRnJhbWU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkJlZm9yZVJlbmRlclBpY2tpbmdTY2VuZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQWZ0ZXJSZW5kZXJQaWNraW5nU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuXG4gIG9uTmVlZFJlZHJhdzogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uTW91c2VNb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmNcbn07XG5cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIGlkOiAnd2ViZ2wtY2FudmFzJyxcbiAgb25SZW5kZXJlckluaXRpYWxpemVkOiAoKSA9PiB7fSxcbiAgb25Jbml0aWFsaXphdGlvbkZhaWxlZDogKCkgPT4ge30sXG4gIG9uRXJyb3I6IGVycm9yID0+IHtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfSxcbiAgb25CZWZvcmVSZW5kZXJGcmFtZTogKCkgPT4ge30sXG4gIG9uQWZ0ZXJSZW5kZXJGcmFtZTogKCkgPT4ge30sXG4gIG9uQmVmb3JlUmVuZGVyUGlja2luZ1NjZW5lOiAoKSA9PiB7fSxcbiAgb25BZnRlclJlbmRlclBpY2tpbmdTY2VuZTogKCkgPT4ge30sXG5cbiAgb25OZWVkUmVkcmF3OiAoKSA9PiB0cnVlLFxuICBvbk1vdXNlTW92ZTogKCkgPT4ge30sXG4gIG9uQ2xpY2s6ICgpID0+IHt9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWJHTFJlbmRlcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgZ2V0IHByb3BUeXBlcygpIHtcbiAgICByZXR1cm4gUFJPUF9UWVBFUztcbiAgfVxuXG4gIHN0YXRpYyBnZXQgZGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiBERUZBVUxUX1BST1BTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogU21hbGwgcmVhY3QgY29tcG9uZW50IHRoYXQgdXNlcyBMdW1hLkdMIHRvIGluaXRpYWxpemUgYSBXZWJHTCBjb250ZXh0LlxuICAgKlxuICAgKiBSZXR1cm5zIGEgY2FudmFzLCBjcmVhdGVzIGEgYmFzaWMgV2ViR0wgY29udGV4dCwgYSBjYW1lcmEgYW5kIGEgc2NlbmUsXG4gICAqIHNldHMgdXAgYSByZW5kZXJsb29wLCBhbmQgcmVnaXN0ZXJzIHNvbWUgYmFzaWMgZXZlbnQgaGFuZGxlcnNcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyAtIHNlZSBwcm9wVHlwZXMgZG9jdW1lbnRhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGdsOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGNhbnZhcyA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMuX2luaXRXZWJHTChjYW52YXMpO1xuICAgIHRoaXMuX2FuaW1hdGlvbkxvb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIEx1bWFHTCBsaWJyYXJ5IGFuZCB0aHJvdWdoIGl0IFdlYkdMXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjYW52YXNcbiAgICovXG4gIF9pbml0V2ViR0woY2FudmFzKSB7XG5cbiAgICBjb25zdCBnbCA9IGNyZWF0ZUdMQ29udGV4dChjYW52YXMpO1xuXG4gICAgY29uc3QgZXZlbnRzID0gRXZlbnRzLmNyZWF0ZShjYW52YXMsIHtcbiAgICAgIGNhY2hlU2l6ZTogZmFsc2UsXG4gICAgICBjYWNoZVBvc2l0aW9uOiBmYWxzZSxcbiAgICAgIGNlbnRlck9yaWdpbjogZmFsc2UsXG4gICAgICBvbkNsaWNrOiB0aGlzLl9vbkNsaWNrLFxuICAgICAgb25Nb3VzZU1vdmU6IHRocm90dGxlKHRoaXMuX29uTW91c2VNb3ZlLCAxMDApXG4gICAgfSk7XG5cbiAgICAvLyBldmVudHM9eyB7XG4gICAgLy8gICBvbk9iamVjdEhvdmVyZWQ6IHRoaXMuX2hhbmRsZU9iamVjdEhvdmVyZWQsXG4gICAgLy8gICBvbk9iamVjdENsaWNrZWQ6IHRoaXMuX2hhbmRsZU9iamVjdENsaWNrZWRcbiAgICAvLyB9IH1cblxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLnByb3BzLmNhbWVyYSk7XG5cbiAgICAvLyBUT0RPIC0gcmVtb3ZlIHByb2dyYW0gcGFyYW1ldGVyIGZyb20gc2NlbmUsIG9yIG1vdmUgaXQgaW50byBvcHRpb25zXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgU2NlbmUoZ2wsIG51bGwsIGNhbWVyYSwge1xuICAgICAgbGlnaHRzOiB0aGlzLnByb3BzLmxpZ2h0cyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjoge3I6IDAsIGc6IDAsIGI6IDAsIGE6IDB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtnbCwgY2FtZXJhLCBzY2VuZSwgZXZlbnRzfSk7XG5cbiAgICB0aGlzLnByb3BzLm9uUmVuZGVyZXJJbml0aWFsaXplZCh7Z2wsIGNhbWVyYSwgc2NlbmV9KTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBtb3ZlIHRoaXMgdG8gbHVtYS5nbC9waWNrLmpzIG9yIG1vZGVsLmpzP1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBfcGljayh4LCB5KSB7XG4gICAgY29uc3Qge2dsLCBzY2VuZSwgY2FtZXJhfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBpZiAodGhpcy5fcGlja2luZ0ZCTyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9waWNraW5nRkJPID0gbmV3IEZyYW1lYnVmZmVyKGdsLCB7XG4gICAgICAgIHdpZHRoOiBnbC5jYW52YXMud2lkdGgsXG4gICAgICAgIGhlaWdodDogZ2wuY2FudmFzLmhlaWdodFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGlja2luZ0ZCTy5iaW5kKCk7XG5cbiAgICBnbC5lbmFibGUoZ2wuU0NJU1NPUl9URVNUKTtcbiAgICBnbC5zY2lzc29yKHgsIGdsLmNhbnZhcy5oZWlnaHQgLSB5LCAxLCAxKTtcblxuICAgIGNvbnN0IHBpY2tlZCA9IFtdO1xuXG4gICAgLy8gVE9ETyAtIGl0ZXJhdGUgaW4gcmV2ZXJzZSBvcmRlcj9cbiAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIHNjZW5lLm1vZGVscykge1xuICAgICAgaWYgKG1vZGVsLnBpY2thYmxlKSB7XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSBtb2RlbC5wcm9ncmFtO1xuICAgICAgICBwcm9ncmFtLnVzZSgpO1xuICAgICAgICBwcm9ncmFtLnNldFVuaWZvcm0oJ2VuYWJsZVBpY2tpbmcnLCAxKTtcbiAgICAgICAgbW9kZWwub25CZWZvcmVSZW5kZXIoKTtcbiAgICAgICAgY29uc3Qge3ZpZXd9ID0gY2FtZXJhO1xuICAgICAgICBjb25zdCB7bWF0cml4fSA9IG1vZGVsO1xuICAgICAgICBjb25zdCB3b3JsZE1hdHJpeCA9IHZpZXcubXVsTWF0NChtYXRyaXgpO1xuXG4gICAgICAgIG1vZGVsLnNldFN0YXRlKHByb2dyYW0pO1xuXG4gICAgICAgIHByb2dyYW0uc2V0VW5pZm9ybSgnd29ybGRNYXRyaXgnLCB3b3JsZE1hdHJpeCk7XG5cbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG5cbiAgICAgICAgbW9kZWwucmVuZGVyKCk7XG5cbiAgICAgICAgLy8gUmVhZCB0aGUgY29sb3IgaW4gdGhlIGNlbnRyYWwgcGl4ZWwsIHRvIGJlIG1hcHBlZCB3aXRoIHBpY2tpbmcgY29sb3JzXG4gICAgICAgIGNvbnN0IGNvbG9yID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG4gICAgICAgIGdsLnJlYWRQaXhlbHMoXG4gICAgICAgICAgeCwgZ2wuY2FudmFzLmhlaWdodCAtIHksIDEsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGNvbG9yXG4gICAgICAgICk7XG5cbiAgICAgICAgcGlja2VkLnB1c2goe21vZGVsLCBjb2xvcn0pO1xuXG4gICAgICAgIHByb2dyYW0uc2V0VW5pZm9ybSgnZW5hYmxlUGlja2luZycsIDApO1xuXG4gICAgICAgIG1vZGVsLnVuc2V0U3RhdGUocHJvZ3JhbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgICBnbC5kaXNhYmxlKGdsLlNDSVNTT1JfVEVTVCk7XG4gICAgcmV0dXJuIHBpY2tlZDtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25DbGljayhldmVudCkge1xuICAgIGNvbnN0IHBpY2tlZCA9IHRoaXMuX3BpY2soZXZlbnQueCwgZXZlbnQueSk7XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHtldmVudCwgcGlja2VkfSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgY29uc3QgcGlja2VkID0gdGhpcy5fcGljayhldmVudC54LCBldmVudC55KTtcbiAgICB0aGlzLnByb3BzLm9uTW91c2VNb3ZlKHtldmVudCwgcGlja2VkfSk7XG4gIH1cblxuICBfcmVuZGVyRnJhbWUoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdmlld3BvcnQ6IHt4LCB5LCB3aWR0aCwgaGVpZ2h0fSxcbiAgICAgIGJsZW5kaW5nOiB7ZW5hYmxlLCBibGVuZEZ1bmMsIGJsZW5kRXF1YXRpb259LFxuICAgICAgb25CZWZvcmVSZW5kZXJGcmFtZSxcbiAgICAgIG9uQWZ0ZXJSZW5kZXJGcmFtZSxcbiAgICAgIG9uTmVlZFJlZHJhdyxcbiAgICAgIHBpeGVsUmF0aW9cbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IHtnbCwgc2NlbmV9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTm90ZTogRG8gdGhpcyBhZnRlciBnbCBjaGVjaywgaW4gY2FzZSBvbk5lZWRSZWRyYXcgY2xlYXJzIGZsYWdzXG4gICAgaWYgKCFvbk5lZWRSZWRyYXcoKSkge1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGNsZWFyIGRlcHRoIGFuZCBjb2xvciBidWZmZXJzXG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuXG4gICAgLy8gdXBkYXRlIHZpZXdwb3J0IHRvIGxhdGVzdCBwcm9wc1xuICAgIC8vICh0eXBpY2FsbHkgY2hhbmdlZCBieSBhcHAgb24gYnJvd3NlciByZXNpemUgZXRjKVxuICAgIGdsLnZpZXdwb3J0KFxuICAgICAgeCAqIHBpeGVsUmF0aW8sXG4gICAgICB5ICogcGl4ZWxSYXRpbyxcbiAgICAgIHdpZHRoICogcGl4ZWxSYXRpbyxcbiAgICAgIGhlaWdodCAqIHBpeGVsUmF0aW9cbiAgICApO1xuXG4gICAgLy8gc2V0dXAgYmxlZG5pbmdcbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBnbC5lbmFibGUoZ2wuQkxFTkQpO1xuICAgICAgZ2wuYmxlbmRGdW5jKC4uLmJsZW5kRnVuYy5tYXAocyA9PiBnbC5nZXQocykpKTtcbiAgICAgIGdsLmJsZW5kRXF1YXRpb24oZ2wuZ2V0KGJsZW5kRXF1YXRpb24pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wuZGlzYWJsZShnbC5CTEVORCk7XG4gICAgfVxuXG4gICAgb25CZWZvcmVSZW5kZXJGcmFtZSgpO1xuICAgIHNjZW5lLnJlbmRlcigpO1xuICAgIG9uQWZ0ZXJSZW5kZXJGcmFtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1haW4gV2ViR0wgYW5pbWF0aW9uIGxvb3BcbiAgICovXG4gIEBhdXRvYmluZFxuICBfYW5pbWF0aW9uTG9vcCgpIHtcbiAgICB0aGlzLl9yZW5kZXJGcmFtZSgpO1xuICAgIC8vIEtlZXAgcmVnaXN0ZXJpbmcgb3Vyc2VsdmVzIGZvciB0aGUgbmV4dCBhbmltYXRpb24gZnJhbWVcbiAgICBGeC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0aW9uTG9vcCk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2lkLCB3aWR0aCwgaGVpZ2h0LCBwaXhlbFJhdGlvfSA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuIChcbiAgICAgIDxjYW52YXNcbiAgICAgICAgaWQ9eyBpZCB9XG4gICAgICAgIHJlZj17ICd3ZWJnbC1yZW5kZXJlci1vdmVybGF5JyB9XG4gICAgICAgIHdpZHRoPXsgd2lkdGggKiBwaXhlbFJhdGlvIHx8IDEgfVxuICAgICAgICBoZWlnaHQ9eyBoZWlnaHQgKiBwaXhlbFJhdGlvIHx8IDEgfVxuICAgICAgICBzdHlsZT17IHt3aWR0aCwgaGVpZ2h0fSB9Lz5cbiAgICApO1xuICB9XG5cbn1cbiJdfQ==