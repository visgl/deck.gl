'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright (c) 2015 Uber Technologies, Inc.
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

/* eslint-disable guard-for-in */


var _attributes = require('../attributes');

var _attributes2 = _interopRequireDefault(_attributes);

var _luma = require('luma.gl');

var _util = require('../util');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _flatWorld = require('../flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
var DEFAULT_PROPS = {
  key: 0,
  opacity: 0.8,
  numInstances: undefined,
  attributes: {},
  data: [],
  isPickable: false,
  deepCompare: false,
  getValue: function getValue(x) {
    return x;
  },
  onHover: function onHover() {},
  onClick: function onClick() {}
};

var ATTRIBUTES = {
  pickingColors: { size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue' }
};

var counter = 0;

var Layer = function () {
  _createClass(Layer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * Base Layer class
     *
     * @class
     * @param {object} props - See docs above
     */
    /* eslint-disable max-statements */

  }]);

  function Layer(props) {
    _classCallCheck(this, Layer);

    props = _extends({}, DEFAULT_PROPS, props);

    // Add iterator to objects
    // TODO - Modifying props is an anti-pattern
    if (props.data) {
      (0, _util.addIterator)(props.data);
      (0, _assert2.default)(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.checkProp(props.data, 'data');
    this.checkProp(props.id, 'id');
    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');

    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');
    this.checkProp(props.latitude, 'latitude');
    this.checkProp(props.longitude, 'longitude');
    this.checkProp(props.zoom, 'zoom');

    this.props = props;
    this.count = counter++;
  }
  /* eslint-enable max-statements */

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state


  _createClass(Layer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.setState({
        attributes: new _attributes2.default({ id: this.props.id }),
        model: null,
        uniforms: {},
        needsRedraw: true,
        // numInstances: this.getNumInstances(this.props),
        self: this,
        dataChanged: true,
        superWasCalled: true
      });

      this.setViewport();

      var attributes = this.state.attributes;
      // All instanced layers get pickingColors attribute by default

      attributes.addInstanced(ATTRIBUTES, {
        pickingColors: { update: this.calculatePickingColors, when: 'realloc' }
      });
    }

    // gl context is now available

  }, {
    key: 'didMount',
    value: function didMount() {}
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate(oldProps, newProps) {
      // If any props have changed
      if (!(0, _util.areEqualShallow)(newProps, oldProps)) {
        return true;
      }
      if (newProps.deepCompare && !(0, _lodash2.default)(newProps.data, oldProps.data)) {
        // Support optional deep compare of data
        // Note: this is quite inefficient, app should use buffer props instead
        this.setState({ dataChanged: true });
        return true;
      }
      return false;
    }

    // Default implementation, all attributes will be updated

  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(newProps) {
      var attributes = this.state.attributes;

      attributes.invalidateAll();
    }

    // gl context still available

  }, {
    key: 'willUnmount',
    value: function willUnmount() {}

    // END LIFECYCLE METHODS
    // //////////////////////////////////////////////////

    // Public API

  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw(_ref) {
      var clearFlag = _ref.clearFlag;
      var attributes = this.state.attributes;

      var needsRedraw = attributes.getNeedsRedraw({ clearFlag: clearFlag });
      needsRedraw = needsRedraw || this.needsRedraw;
      if (clearFlag) {
        this.needsRedraw = false;
      }
      return needsRedraw;
    }

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setState',
    value: function setState(updateObject) {
      Object.assign(this.state, updateObject);
      this.state.needsRedraw = true;
    }

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setUniforms',
    value: function setUniforms(uniformMap) {
      this._checkUniforms(uniformMap);
      Object.assign(this.state.uniforms, uniformMap);
      this.state.needsRedraw = true;
    }

    // TODO - Move into luma.gl, and check against definitions

  }, {
    key: '_checkUniforms',
    value: function _checkUniforms(uniformMap) {
      for (var key in uniformMap) {
        var value = uniformMap[key];
        this._checkUniformValue(key, value);
      }
    }
  }, {
    key: '_checkUniformValue',
    value: function _checkUniformValue(uniform, value) {
      function isNumber(v) {
        return !isNaN(v) && Number(v) === v && v !== undefined;
      }

      var ok = true;
      if (Array.isArray(value) || value instanceof Float32Array) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = value[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var element = _step.value;

            if (!isNumber(element)) {
              ok = false;
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
      } else if (!isNumber(value)) {
        ok = false;
      }
      if (!ok) {
        /* eslint-disable no-console */
        /* global console */
        // Value could be unprintable so write the object on console
        console.error(this.props.id + ' Bad uniform ' + uniform, value);
        /* eslint-enable no-console */
        throw new Error(this.props.id + ' Bad uniform ' + uniform);
      }
    }

    // Use iteration (the only required capability on data) to get first element

  }, {
    key: 'getFirstObject',
    value: function getFirstObject() {
      var data = this.props.data;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          return object;
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

      return null;
    }

    // INTERNAL METHODS

    // Deduces numer of instances. Intention is to support:
    // - Explicit setting of numInstances
    // - Auto-deduction for ES6 containers that define a size member
    // - Auto-deduction for Classic Arrays via the built-in length attribute
    // - Auto-deduction via arrays

  }, {
    key: 'getNumInstances',
    value: function getNumInstances(props) {
      props = props || this.props;

      // First check if the layer has set its own value
      if (this.state && this.state.numInstances !== undefined) {
        return this.state.numInstances;
      }

      // Check if app has set an explicit value
      if (props.numInstances) {
        return props.numInstances;
      }

      var _props = props;
      var data = _props.data;

      // Check if ES6 collection "size" attribute is set

      if (data && typeof data.count === 'function') {
        return data.count();
      }

      // Check if ES6 collection "size" attribute is set
      if (data && data.size) {
        return data.size;
      }

      // Check if array length attribute is set on data
      // Note: checking this last since some ES6 collections (Immutable)
      // emit profuse warnings when trying to access .length
      if (data && data.length) {
        return data.length;
      }

      // TODO - slow, we probably should not support this unless
      // we limit the number of invocations
      //
      // Use iteration to count objects
      // let count = 0;
      // /* eslint-disable no-unused-vars */
      // for (const object of data) {
      //   count++;
      // }
      // return count;

      throw new Error('Could not deduce numInstances');
    }

    // Internal Helpers

  }, {
    key: 'checkProps',
    value: function checkProps(oldProps, newProps) {
      // Note: dataChanged might already be set
      if (newProps.data !== oldProps.data) {
        // Figure out data length
        this.state.dataChanged = true;
      }

      var viewportChanged = newProps.width !== oldProps.width || newProps.height !== oldProps.height || newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom;

      this.setState({ viewportChanged: viewportChanged });
    }
  }, {
    key: 'updateAttributes',
    value: function updateAttributes(props) {
      var attributes = this.state.attributes;

      var numInstances = this.getNumInstances(props);

      // Figure out data length
      attributes.update({
        numInstances: numInstances,
        bufferMap: props,
        context: this,
        // Don't worry about non-attribute props
        ignoreUnknownAttributes: true
      });
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      this.setUniforms({
        // apply gamma to opacity to make it visually "linear"
        opacity: Math.pow(this.props.opacity || 0.8, 1 / 2.2)
      });
    }

    // LAYER MANAGER API

    // Called by layer manager when a new layer is found

  }, {
    key: 'initializeLayer',
    value: function initializeLayer(_ref2) {
      var gl = _ref2.gl;

      (0, _assert2.default)(gl);
      this.state = { gl: gl };

      // Initialize state only once
      // Note: Must always call super.initializeState() when overriding!
      this.state.superWasCalled = false;
      this.initializeState();
      (0, _assert2.default)(this.state.superWasCalled, 'Layer must call super.initializeState()');

      // Add any primitive attributes
      this._initializePrimitiveAttributes();

      // TODO - the app must be able to override

      // Add any subclass attributes
      this.updateAttributes(this.props);
      this.updateUniforms();

      // Create a model for the layer
      this._createModel({ gl: gl });

      // Call life cycle method
      this.didMount();
    }

    // Called by layer manager when existing layer is getting new props

  }, {
    key: 'updateLayer',
    value: function updateLayer(oldProps, newProps) {
      // Calculate standard change flags
      this.checkProps(oldProps, newProps);

      // Check if any props have changed
      if (this.shouldUpdate(oldProps, newProps)) {
        if (this.state.viewportChanged) {
          this.setViewport();
        }

        // Let the subclass mark what is needed for update
        this.willReceiveProps(oldProps, newProps);
        // Run the attribute updaters
        this.updateAttributes(newProps);
        // Update the uniforms
        this.updateUniforms();
      }

      this.state.dataChanged = false;
      this.state.viewportChanged = false;
    }

    // Called by manager when layer is about to be disposed
    // Note: not guaranteed to be called on application shutdown

  }, {
    key: 'finalizeLayer',
    value: function finalizeLayer() {
      this.willUnmount();
    }
  }, {
    key: 'calculatePickingColors',
    value: function calculatePickingColors(attribute, numInstances) {
      var value = attribute.value;
      var size = attribute.size;

      for (var i = 0; i < numInstances; i++) {
        value[i * size + 0] = (i + 1) % 256;
        value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
        value[i * size + 2] = Math.floor((i + 1) / 256 / 256) % 256;
      }
    }
  }, {
    key: 'decodePickingColor',
    value: function decodePickingColor(color) {
      (0, _assert2.default)(color instanceof Uint8Array);

      var _color = _slicedToArray(color, 3);

      var i1 = _color[0];
      var i2 = _color[1];
      var i3 = _color[2];

      var index = i1 + i2 * 256 + i3 * 65536;
      return index;
    }
  }, {
    key: 'onHover',
    value: function onHover(info) {
      var color = info.color;

      var index = this.decodePickingColor(color);
      return this.props.onHover(_extends({ index: index }, info));
    }
  }, {
    key: 'onClick',
    value: function onClick(info) {
      var color = info.color;

      var index = this.decodePickingColor(color);
      return this.props.onClick(_extends({ index: index }, info));
    }

    // INTERNAL METHODS

    // Set up attributes relating to the primitive itself (not the instances)

  }, {
    key: '_initializePrimitiveAttributes',
    value: function _initializePrimitiveAttributes() {
      var _state = this.state;
      var gl = _state.gl;
      var primitive = _state.primitive;
      var attributes = _state.attributes;
      var vertices = primitive.vertices;
      var normals = primitive.normals;
      var indices = primitive.indices;


      var xyz = { '0': 'x', '1': 'y', '2': 'z' };

      if (vertices) {
        attributes.add({ vertices: _extends({ value: vertices, size: 3 }, xyz)
        });
      }

      if (normals) {
        attributes.add({
          normals: _extends({ value: normals, size: 3 }, xyz)
        });
      }

      if (indices) {
        attributes.add({
          indices: {
            value: indices,
            size: 1,
            bufferType: gl.ELEMENT_ARRAY_BUFFER,
            drawType: gl.STATIC_DRAW,
            '0': 'index'
          }
        });
      }
    }
  }, {
    key: '_createModel',
    value: function _createModel(_ref3) {
      var gl = _ref3.gl;
      var _state2 = this.state;
      var program = _state2.program;
      var attributes = _state2.attributes;
      var uniforms = _state2.uniforms;


      this.state.model = new _luma.Model({
        program: program,
        attributes: attributes.getAttributes(),
        uniforms: uniforms,
        // whether current layer responses to mouse events
        pickable: this.props.isPickable,
        // get render function per primitive (instanced? indexed?)
        render: this._getRenderFunction(gl)
      });
    }

    // Should this be moved to program

  }, {
    key: '_getRenderFunction',
    value: function _getRenderFunction(gl) {
      // "Capture" state as it will be set to null when layer is disposed
      var state = this.state;
      var primitive = state.primitive;
      var self = state.self;

      var drawType = primitive.drawType ? gl.get(primitive.drawType) : gl.POINTS;

      var numIndices = primitive.indices ? primitive.indices.length : 0;
      var numVertices = primitive.vertices ? primitive.vertices.length : 0;

      if (primitive.instanced) {
        var _ret = function () {
          var extension = gl.getExtension('ANGLE_instanced_arrays');

          if (primitive.indices) {
            return {
              v: function v() {
                return extension.drawElementsInstancedANGLE(drawType, numIndices, gl.UNSIGNED_SHORT, 0, self.getNumInstances());
              }
            };
          }
          // else if this.primitive does not have indices
          return {
            v: function v() {
              return extension.drawArraysInstancedANGLE(drawType, 0, numVertices / 3, self.getNumInstances());
            }
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }

      if (this.state.primitive.indices) {
        return function () {
          return gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
        };
      }
      // else if this.primitive does not have indices
      return function () {
        return gl.drawArrays(drawType, 0, self.getNumInstances());
      };
    }
  }, {
    key: 'checkProp',
    value: function checkProp(property, propertyName) {
      if (!property) {
        throw new Error('Property ' + propertyName + ' undefined in layer ' + this.id);
      }
    }

    // MAP LAYER FUNCTIONALITY

  }, {
    key: 'setViewport',
    value: function setViewport() {
      var _props2 = this.props;
      var width = _props2.width;
      var height = _props2.height;
      var latitude = _props2.latitude;
      var longitude = _props2.longitude;
      var zoom = _props2.zoom;

      this.setState({
        viewport: new _flatWorld2.default.Viewport(width, height),
        mercator: (0, _viewportMercatorProject2.default)({
          width: width, height: height, latitude: latitude, longitude: longitude, zoom: zoom,
          tileSize: 512
        })
      });
      var _state$viewport = this.state.viewport;
      var x = _state$viewport.x;
      var y = _state$viewport.y;

      this.setUniforms({
        viewport: [x, y, width, height],
        mapViewport: [longitude, latitude, zoom, _flatWorld2.default.size]
      });
      (0, _log2.default)(3, this.state.viewport, latitude, longitude, zoom);
    }

    // TODO deprecate: this funtion is only used for calculating radius now

  }, {
    key: 'project',
    value: function project(latLng) {
      var mercator = this.state.mercator;

      var _mercator$project = mercator.project([latLng[0], latLng[1]]);

      var _mercator$project2 = _slicedToArray(_mercator$project, 2);

      var x = _mercator$project2[0];
      var y = _mercator$project2[1];

      return { x: x, y: y };
    }

    // TODO deprecate: this funtion is only used for calculating radius now

  }, {
    key: 'screenToSpace',
    value: function screenToSpace(x, y) {
      var viewport = this.state.viewport;

      return viewport.screenToSpace(x, y);
    }
  }]);

  return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDQSxJQUFNLGdCQUFnQjtBQUNwQixPQUFLLENBQUw7QUFDQSxXQUFTLEdBQVQ7QUFDQSxnQkFBYyxTQUFkO0FBQ0EsY0FBWSxFQUFaO0FBQ0EsUUFBTSxFQUFOO0FBQ0EsY0FBWSxLQUFaO0FBQ0EsZUFBYSxLQUFiO0FBQ0EsWUFBVTtXQUFLO0dBQUw7QUFDVixXQUFTLG1CQUFNLEVBQU47QUFDVCxXQUFTLG1CQUFNLEVBQU47Q0FWTDs7QUFhTixJQUFNLGFBQWE7QUFDakIsaUJBQWUsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxXQUFMLEVBQWtCLEtBQUssVUFBTCxFQUEzRDtDQURJOztBQUlOLElBQUksVUFBVSxDQUFWOztJQUVpQjs7O3dCQUVLO0FBQ3RCLGFBQU8sVUFBUCxDQURzQjs7Ozs7Ozs7Ozs7Ozs7QUFZeEIsV0FkbUIsS0FjbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWRBLE9BY0E7O0FBRWpCLHlCQUNLLGVBQ0EsTUFGTDs7OztBQUZpQixRQVNiLE1BQU0sSUFBTixFQUFZO0FBQ2QsNkJBQVksTUFBTSxJQUFOLENBQVosQ0FEYztBQUVkLDRCQUFPLE1BQU0sSUFBTixDQUFXLE9BQU8sUUFBUCxDQUFsQixFQUFvQyxpQ0FBcEMsRUFGYztLQUFoQjs7QUFLQSxTQUFLLFNBQUwsQ0FBZSxNQUFNLElBQU4sRUFBWSxNQUEzQixFQWRpQjtBQWVqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLEVBQU4sRUFBVSxJQUF6QixFQWZpQjtBQWdCakIsU0FBSyxTQUFMLENBQWUsTUFBTSxLQUFOLEVBQWEsT0FBNUIsRUFoQmlCO0FBaUJqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLE1BQU4sRUFBYyxRQUE3QixF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IDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBlc2xpbnQtZGlzYWJsZSBndWFyZC1mb3ItaW4gKi9cbmltcG9ydCBBdHRyaWJ1dGVzIGZyb20gJy4uL2F0dHJpYnV0ZXMnO1xuaW1wb3J0IHtNb2RlbH0gZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQge2FyZUVxdWFsU2hhbGxvd30gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQge2FkZEl0ZXJhdG9yfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCBpc0RlZXBFcXVhbCBmcm9tICdsb2Rhc2guaXNlcXVhbCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgZmxhdFdvcmxkIGZyb20gJy4uL2ZsYXQtd29ybGQnO1xuaW1wb3J0IFZpZXdwb3J0TWVyY2F0b3IgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZyc7XG5cbi8qXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJvcHMuaWQgLSBsYXllciBuYW1lXG4gKiBAcGFyYW0ge2FycmF5fSAgcHJvcHMuZGF0YSAtIGFycmF5IG9mIGRhdGEgaW5zdGFuY2VzXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvcHMud2lkdGggLSB2aWV3cG9ydCB3aWR0aCwgc3luY2VkIHdpdGggTWFwYm94R0xcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5oZWlnaHQgLSB2aWV3cG9ydCB3aWR0aCwgc3luY2VkIHdpdGggTWFwYm94R0xcbiAqIEBwYXJhbSB7Ym9vbH0gcHJvcHMuaXNQaWNrYWJsZSAtIHdoZXRoZXIgbGF5ZXIgcmVzcG9uc2UgdG8gbW91c2UgZXZlbnRcbiAqIEBwYXJhbSB7Ym9vbH0gcHJvcHMub3BhY2l0eSAtIG9wYWNpdHkgb2YgdGhlIGxheWVyXG4gKi9cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIGtleTogMCxcbiAgb3BhY2l0eTogMC44LFxuICBudW1JbnN0YW5jZXM6IHVuZGVmaW5lZCxcbiAgYXR0cmlidXRlczoge30sXG4gIGRhdGE6IFtdLFxuICBpc1BpY2thYmxlOiBmYWxzZSxcbiAgZGVlcENvbXBhcmU6IGZhbHNlLFxuICBnZXRWYWx1ZTogeCA9PiB4LFxuICBvbkhvdmVyOiAoKSA9PiB7fSxcbiAgb25DbGljazogKCkgPT4ge31cbn07XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxubGV0IGNvdW50ZXIgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQmFzZSBMYXllciBjbGFzc1xuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IHByb3BzIC0gU2VlIGRvY3MgYWJvdmVcbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cbiAgICBwcm9wcyA9IHtcbiAgICAgIC4uLkRFRkFVTFRfUFJPUFMsXG4gICAgICAuLi5wcm9wc1xuICAgIH07XG5cbiAgICAvLyBBZGQgaXRlcmF0b3IgdG8gb2JqZWN0c1xuICAgIC8vIFRPRE8gLSBNb2RpZnlpbmcgcHJvcHMgaXMgYW4gYW50aS1wYXR0ZXJuXG4gICAgaWYgKHByb3BzLmRhdGEpIHtcbiAgICAgIGFkZEl0ZXJhdG9yKHByb3BzLmRhdGEpO1xuICAgICAgYXNzZXJ0KHByb3BzLmRhdGFbU3ltYm9sLml0ZXJhdG9yXSwgJ2RhdGEgcHJvcCBtdXN0IGhhdmUgYW4gaXRlcmF0b3InKTtcbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5kYXRhLCAnZGF0YScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmlkLCAnaWQnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG5cbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMubGF0aXR1ZGUsICdsYXRpdHVkZScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmxvbmdpdHVkZSwgJ2xvbmdpdHVkZScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLnpvb20sICd6b29tJyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5jb3VudCA9IGNvdW50ZXIrKztcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gTElGRUNZQ0xFIE1FVEhPRFMsIG92ZXJyaWRkZW4gYnkgdGhlIGxheWVyIHN1YmNsYXNzZXNcblxuICAvLyBDYWxsZWQgb25jZSB0byBzZXQgdXAgdGhlIGluaXRpYWwgc3RhdGVcbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0cmlidXRlczogbmV3IEF0dHJpYnV0ZXMoe2lkOiB0aGlzLnByb3BzLmlkfSksXG4gICAgICBtb2RlbDogbnVsbCxcbiAgICAgIHVuaWZvcm1zOiB7fSxcbiAgICAgIG5lZWRzUmVkcmF3OiB0cnVlLFxuICAgICAgLy8gbnVtSW5zdGFuY2VzOiB0aGlzLmdldE51bUluc3RhbmNlcyh0aGlzLnByb3BzKSxcbiAgICAgIHNlbGY6IHRoaXMsXG4gICAgICBkYXRhQ2hhbmdlZDogdHJ1ZSxcbiAgICAgIHN1cGVyV2FzQ2FsbGVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICB0aGlzLnNldFZpZXdwb3J0KCk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIC8vIEFsbCBpbnN0YW5jZWQgbGF5ZXJzIGdldCBwaWNraW5nQ29sb3JzIGF0dHJpYnV0ZSBieSBkZWZhdWx0XG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcGlja2luZ0NvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzLCB3aGVuOiAncmVhbGxvYyd9XG4gICAgfSk7XG4gIH1cblxuICAvLyBnbCBjb250ZXh0IGlzIG5vdyBhdmFpbGFibGVcbiAgZGlkTW91bnQoKSB7XG4gIH1cblxuICBzaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gSWYgYW55IHByb3BzIGhhdmUgY2hhbmdlZFxuICAgIGlmICghYXJlRXF1YWxTaGFsbG93KG5ld1Byb3BzLCBvbGRQcm9wcykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobmV3UHJvcHMuZGVlcENvbXBhcmUgJiYgIWlzRGVlcEVxdWFsKG5ld1Byb3BzLmRhdGEsIG9sZFByb3BzLmRhdGEpKSB7XG4gICAgICAvLyBTdXBwb3J0IG9wdGlvbmFsIGRlZXAgY29tcGFyZSBvZiBkYXRhXG4gICAgICAvLyBOb3RlOiB0aGlzIGlzIHF1aXRlIGluZWZmaWNpZW50LCBhcHAgc2hvdWxkIHVzZSBidWZmZXIgcHJvcHMgaW5zdGVhZFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUNoYW5nZWQ6IHRydWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEZWZhdWx0IGltcGxlbWVudGF0aW9uLCBhbGwgYXR0cmlidXRlcyB3aWxsIGJlIHVwZGF0ZWRcbiAgd2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgYXR0cmlidXRlcy5pbnZhbGlkYXRlQWxsKCk7XG4gIH1cblxuICAvLyBnbCBjb250ZXh0IHN0aWxsIGF2YWlsYWJsZVxuICB3aWxsVW5tb3VudCgpIHtcbiAgfVxuXG4gIC8vIEVORCBMSUZFQ1lDTEUgTUVUSE9EU1xuICAvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIFB1YmxpYyBBUElcblxuICBnZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSkge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgbGV0IG5lZWRzUmVkcmF3ID0gYXR0cmlidXRlcy5nZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSk7XG4gICAgbmVlZHNSZWRyYXcgPSBuZWVkc1JlZHJhdyB8fCB0aGlzLm5lZWRzUmVkcmF3O1xuICAgIGlmIChjbGVhckZsYWcpIHtcbiAgICAgIHRoaXMubmVlZHNSZWRyYXcgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG5lZWRzUmVkcmF3O1xuICB9XG5cbiAgLy8gVXBkYXRlcyBzZWxlY3RlZCBzdGF0ZSBtZW1iZXJzIGFuZCBtYXJrcyB0aGUgb2JqZWN0IGZvciByZWRyYXdcbiAgc2V0U3RhdGUodXBkYXRlT2JqZWN0KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLCB1cGRhdGVPYmplY3QpO1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVXBkYXRlcyBzZWxlY3RlZCBzdGF0ZSBtZW1iZXJzIGFuZCBtYXJrcyB0aGUgb2JqZWN0IGZvciByZWRyYXdcbiAgc2V0VW5pZm9ybXModW5pZm9ybU1hcCkge1xuICAgIHRoaXMuX2NoZWNrVW5pZm9ybXModW5pZm9ybU1hcCk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0YXRlLnVuaWZvcm1zLCB1bmlmb3JtTWFwKTtcbiAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBNb3ZlIGludG8gbHVtYS5nbCwgYW5kIGNoZWNrIGFnYWluc3QgZGVmaW5pdGlvbnNcbiAgX2NoZWNrVW5pZm9ybXModW5pZm9ybU1hcCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIHVuaWZvcm1NYXApIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdW5pZm9ybU1hcFtrZXldO1xuICAgICAgdGhpcy5fY2hlY2tVbmlmb3JtVmFsdWUoa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgX2NoZWNrVW5pZm9ybVZhbHVlKHVuaWZvcm0sIHZhbHVlKSB7XG4gICAgZnVuY3Rpb24gaXNOdW1iZXIodikge1xuICAgICAgcmV0dXJuICFpc05hTih2KSAmJiBOdW1iZXIodikgPT09IHYgJiYgdiAhPT0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBvayA9IHRydWU7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IHZhbHVlIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgdmFsdWUpIHtcbiAgICAgICAgaWYgKCFpc051bWJlcihlbGVtZW50KSkge1xuICAgICAgICAgIG9rID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFpc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIG9rID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICghb2spIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgIC8qIGdsb2JhbCBjb25zb2xlICovXG4gICAgICAvLyBWYWx1ZSBjb3VsZCBiZSB1bnByaW50YWJsZSBzbyB3cml0ZSB0aGUgb2JqZWN0IG9uIGNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoYCR7dGhpcy5wcm9wcy5pZH0gQmFkIHVuaWZvcm0gJHt1bmlmb3JtfWAsIHZhbHVlKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMucHJvcHMuaWR9IEJhZCB1bmlmb3JtICR7dW5pZm9ybX1gKTtcbiAgICB9XG4gIH1cblxuICAvLyBVc2UgaXRlcmF0aW9uICh0aGUgb25seSByZXF1aXJlZCBjYXBhYmlsaXR5IG9uIGRhdGEpIHRvIGdldCBmaXJzdCBlbGVtZW50XG4gIGdldEZpcnN0T2JqZWN0KCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gRGVkdWNlcyBudW1lciBvZiBpbnN0YW5jZXMuIEludGVudGlvbiBpcyB0byBzdXBwb3J0OlxuICAvLyAtIEV4cGxpY2l0IHNldHRpbmcgb2YgbnVtSW5zdGFuY2VzXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIEVTNiBjb250YWluZXJzIHRoYXQgZGVmaW5lIGEgc2l6ZSBtZW1iZXJcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgQ2xhc3NpYyBBcnJheXMgdmlhIHRoZSBidWlsdC1pbiBsZW5ndGggYXR0cmlidXRlXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gdmlhIGFycmF5c1xuICBnZXROdW1JbnN0YW5jZXMocHJvcHMpIHtcbiAgICBwcm9wcyA9IHByb3BzIHx8IHRoaXMucHJvcHM7XG5cbiAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGUgbGF5ZXIgaGFzIHNldCBpdHMgb3duIHZhbHVlXG4gICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFwcCBoYXMgc2V0IGFuIGV4cGxpY2l0IHZhbHVlXG4gICAgaWYgKHByb3BzLm51bUluc3RhbmNlcykge1xuICAgICAgcmV0dXJuIHByb3BzLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICBjb25zdCB7ZGF0YX0gPSBwcm9wcztcblxuICAgIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgICBpZiAoZGF0YSAmJiB0eXBlb2YgZGF0YS5jb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIGRhdGEuY291bnQoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcInNpemVcIiBhdHRyaWJ1dGUgaXMgc2V0XG4gICAgaWYgKGRhdGEgJiYgZGF0YS5zaXplKSB7XG4gICAgICByZXR1cm4gZGF0YS5zaXplO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFycmF5IGxlbmd0aCBhdHRyaWJ1dGUgaXMgc2V0IG9uIGRhdGFcbiAgICAvLyBOb3RlOiBjaGVja2luZyB0aGlzIGxhc3Qgc2luY2Ugc29tZSBFUzYgY29sbGVjdGlvbnMgKEltbXV0YWJsZSlcbiAgICAvLyBlbWl0IHByb2Z1c2Ugd2FybmluZ3Mgd2hlbiB0cnlpbmcgdG8gYWNjZXNzIC5sZW5ndGhcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIFRPRE8gLSBzbG93LCB3ZSBwcm9iYWJseSBzaG91bGQgbm90IHN1cHBvcnQgdGhpcyB1bmxlc3NcbiAgICAvLyB3ZSBsaW1pdCB0aGUgbnVtYmVyIG9mIGludm9jYXRpb25zXG4gICAgLy9cbiAgICAvLyBVc2UgaXRlcmF0aW9uIHRvIGNvdW50IG9iamVjdHNcbiAgICAvLyBsZXQgY291bnQgPSAwO1xuICAgIC8vIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgLy8gZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgIC8vICAgY291bnQrKztcbiAgICAvLyB9XG4gICAgLy8gcmV0dXJuIGNvdW50O1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGVkdWNlIG51bUluc3RhbmNlcycpO1xuICB9XG5cbiAgLy8gSW50ZXJuYWwgSGVscGVyc1xuXG4gIGNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gTm90ZTogZGF0YUNoYW5nZWQgbWlnaHQgYWxyZWFkeSBiZSBzZXRcbiAgICBpZiAobmV3UHJvcHMuZGF0YSAhPT0gb2xkUHJvcHMuZGF0YSkge1xuICAgICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3Qgdmlld3BvcnRDaGFuZ2VkID1cbiAgICAgIG5ld1Byb3BzLndpZHRoICE9PSBvbGRQcm9wcy53aWR0aCB8fFxuICAgICAgbmV3UHJvcHMuaGVpZ2h0ICE9PSBvbGRQcm9wcy5oZWlnaHQgfHxcbiAgICAgIG5ld1Byb3BzLmxhdGl0dWRlICE9PSBvbGRQcm9wcy5sYXRpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMubG9uZ2l0dWRlICE9PSBvbGRQcm9wcy5sb25naXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLnpvb20gIT09IG9sZFByb3BzLnpvb207XG5cbiAgICB0aGlzLnNldFN0YXRlKHt2aWV3cG9ydENoYW5nZWR9KTtcbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZXMocHJvcHMpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKHByb3BzKTtcblxuICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICBhdHRyaWJ1dGVzLnVwZGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBidWZmZXJNYXA6IHByb3BzLFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IG5vbi1hdHRyaWJ1dGUgcHJvcHNcbiAgICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVVbmlmb3JtcygpIHtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIGFwcGx5IGdhbW1hIHRvIG9wYWNpdHkgdG8gbWFrZSBpdCB2aXN1YWxseSBcImxpbmVhclwiXG4gICAgICBvcGFjaXR5OiBNYXRoLnBvdyh0aGlzLnByb3BzLm9wYWNpdHkgfHwgMC44LCAxIC8gMi4yKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gTEFZRVIgTUFOQUdFUiBBUElcblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGEgbmV3IGxheWVyIGlzIGZvdW5kXG4gIGluaXRpYWxpemVMYXllcih7Z2x9KSB7XG4gICAgYXNzZXJ0KGdsKTtcbiAgICB0aGlzLnN0YXRlID0ge2dsfTtcblxuICAgIC8vIEluaXRpYWxpemUgc3RhdGUgb25seSBvbmNlXG4gICAgLy8gTm90ZTogTXVzdCBhbHdheXMgY2FsbCBzdXBlci5pbml0aWFsaXplU3RhdGUoKSB3aGVuIG92ZXJyaWRpbmchXG4gICAgdGhpcy5zdGF0ZS5zdXBlcldhc0NhbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgYXNzZXJ0KHRoaXMuc3RhdGUuc3VwZXJXYXNDYWxsZWQsXG4gICAgICAnTGF5ZXIgbXVzdCBjYWxsIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpJyk7XG5cbiAgICAvLyBBZGQgYW55IHByaW1pdGl2ZSBhdHRyaWJ1dGVzXG4gICAgdGhpcy5faW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKTtcblxuICAgIC8vIFRPRE8gLSB0aGUgYXBwIG11c3QgYmUgYWJsZSB0byBvdmVycmlkZVxuXG4gICAgLy8gQWRkIGFueSBzdWJjbGFzcyBhdHRyaWJ1dGVzXG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHRoaXMucHJvcHMpO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcblxuICAgIC8vIENyZWF0ZSBhIG1vZGVsIGZvciB0aGUgbGF5ZXJcbiAgICB0aGlzLl9jcmVhdGVNb2RlbCh7Z2x9KTtcblxuICAgIC8vIENhbGwgbGlmZSBjeWNsZSBtZXRob2RcbiAgICB0aGlzLmRpZE1vdW50KCk7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGV4aXN0aW5nIGxheWVyIGlzIGdldHRpbmcgbmV3IHByb3BzXG4gIHVwZGF0ZUxheWVyKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIENhbGN1bGF0ZSBzdGFuZGFyZCBjaGFuZ2UgZmxhZ3NcbiAgICB0aGlzLmNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIENoZWNrIGlmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTGV0IHRoZSBzdWJjbGFzcyBtYXJrIHdoYXQgaXMgbmVlZGVkIGZvciB1cGRhdGVcbiAgICAgIHRoaXMud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgICAgLy8gUnVuIHRoZSBhdHRyaWJ1dGUgdXBkYXRlcnNcbiAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyhuZXdQcm9wcyk7XG4gICAgICAvLyBVcGRhdGUgdGhlIHVuaWZvcm1zXG4gICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkID0gZmFsc2U7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbWFuYWdlciB3aGVuIGxheWVyIGlzIGFib3V0IHRvIGJlIGRpc3Bvc2VkXG4gIC8vIE5vdGU6IG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhbGxlZCBvbiBhcHBsaWNhdGlvbiBzaHV0ZG93blxuICBmaW5hbGl6ZUxheWVyKCkge1xuICAgIHRoaXMud2lsbFVubW91bnQoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtSW5zdGFuY2VzOyBpKyspIHtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSAoaSArIDEpICUgMjU2O1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAxXSA9IE1hdGguZmxvb3IoKGkgKyAxKSAvIDI1NikgJSAyNTY7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDJdID0gTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2IC8gMjU2KSAlIDI1NjtcbiAgICB9XG4gIH1cblxuICBkZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpIHtcbiAgICBhc3NlcnQoY29sb3IgaW5zdGFuY2VvZiBVaW50OEFycmF5KTtcbiAgICBjb25zdCBbaTEsIGkyLCBpM10gPSBjb2xvcjtcbiAgICBjb25zdCBpbmRleCA9IGkxICsgaTIgKiAyNTYgKyBpMyAqIDY1NTM2O1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uSG92ZXIoe2luZGV4LCAuLi5pbmZvfSk7XG4gIH1cblxuICBvbkNsaWNrKGluZm8pIHtcbiAgICBjb25zdCB7Y29sb3J9ID0gaW5mbztcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZGVjb2RlUGlja2luZ0NvbG9yKGNvbG9yKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKHtpbmRleCwgLi4uaW5mb30pO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIFNldCB1cCBhdHRyaWJ1dGVzIHJlbGF0aW5nIHRvIHRoZSBwcmltaXRpdmUgaXRzZWxmIChub3QgdGhlIGluc3RhbmNlcylcbiAgX2luaXRpYWxpemVQcmltaXRpdmVBdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IHtnbCwgcHJpbWl0aXZlLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZlcnRpY2VzLCBub3JtYWxzLCBpbmRpY2VzfSA9IHByaW1pdGl2ZTtcblxuICAgIGNvbnN0IHh5eiA9IHsnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3onfTtcblxuICAgIGlmICh2ZXJ0aWNlcykge1xuICAgICAgYXR0cmlidXRlcy5hZGQoXG4gICAgICAgIHt2ZXJ0aWNlczoge3ZhbHVlOiB2ZXJ0aWNlcywgc2l6ZTogMywgLi4ueHl6fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG5vcm1hbHMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuYWRkKHtcbiAgICAgICAgbm9ybWFsczoge3ZhbHVlOiBub3JtYWxzLCBzaXplOiAzLCAuLi54eXp9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoaW5kaWNlcykge1xuICAgICAgYXR0cmlidXRlcy5hZGQoe1xuICAgICAgICBpbmRpY2VzOiB7XG4gICAgICAgICAgdmFsdWU6IGluZGljZXMsXG4gICAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgICBidWZmZXJUeXBlOiBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUixcbiAgICAgICAgICBkcmF3VHlwZTogZ2wuU1RBVElDX0RSQVcsXG4gICAgICAgICAgJzAnOiAnaW5kZXgnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVNb2RlbCh7Z2x9KSB7XG4gICAgY29uc3Qge3Byb2dyYW0sIGF0dHJpYnV0ZXMsIHVuaWZvcm1zfSA9IHRoaXMuc3RhdGU7XG5cbiAgICB0aGlzLnN0YXRlLm1vZGVsID0gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IHByb2dyYW0sXG4gICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLmdldEF0dHJpYnV0ZXMoKSxcbiAgICAgIHVuaWZvcm1zOiB1bmlmb3JtcyxcbiAgICAgIC8vIHdoZXRoZXIgY3VycmVudCBsYXllciByZXNwb25zZXMgdG8gbW91c2UgZXZlbnRzXG4gICAgICBwaWNrYWJsZTogdGhpcy5wcm9wcy5pc1BpY2thYmxlLFxuICAgICAgLy8gZ2V0IHJlbmRlciBmdW5jdGlvbiBwZXIgcHJpbWl0aXZlIChpbnN0YW5jZWQ/IGluZGV4ZWQ/KVxuICAgICAgcmVuZGVyOiB0aGlzLl9nZXRSZW5kZXJGdW5jdGlvbihnbClcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNob3VsZCB0aGlzIGJlIG1vdmVkIHRvIHByb2dyYW1cbiAgX2dldFJlbmRlckZ1bmN0aW9uKGdsKSB7XG4gICAgLy8gXCJDYXB0dXJlXCIgc3RhdGUgYXMgaXQgd2lsbCBiZSBzZXQgdG8gbnVsbCB3aGVuIGxheWVyIGlzIGRpc3Bvc2VkXG4gICAgY29uc3Qge3N0YXRlfSA9IHRoaXM7XG4gICAgY29uc3Qge3ByaW1pdGl2ZX0gPSBzdGF0ZTtcbiAgICBjb25zdCB7c2VsZn0gPSBzdGF0ZTtcbiAgICBjb25zdCBkcmF3VHlwZSA9IHByaW1pdGl2ZS5kcmF3VHlwZSA/XG4gICAgICBnbC5nZXQocHJpbWl0aXZlLmRyYXdUeXBlKSA6IGdsLlBPSU5UUztcblxuICAgIGNvbnN0IG51bUluZGljZXMgPSBwcmltaXRpdmUuaW5kaWNlcyA/IHByaW1pdGl2ZS5pbmRpY2VzLmxlbmd0aCA6IDA7XG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBwcmltaXRpdmUudmVydGljZXMgPyBwcmltaXRpdmUudmVydGljZXMubGVuZ3RoIDogMDtcblxuICAgIGlmIChwcmltaXRpdmUuaW5zdGFuY2VkKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcblxuICAgICAgaWYgKHByaW1pdGl2ZS5pbmRpY2VzKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBleHRlbnNpb24uZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwLCBzZWxmLmdldE51bUluc3RhbmNlcygpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICAvLyBlbHNlIGlmIHRoaXMucHJpbWl0aXZlIGRvZXMgbm90IGhhdmUgaW5kaWNlc1xuICAgICAgcmV0dXJuICgpID0+IGV4dGVuc2lvbi5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgIGRyYXdUeXBlLCAwLCBudW1WZXJ0aWNlcyAvIDMsIHNlbGYuZ2V0TnVtSW5zdGFuY2VzKClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucHJpbWl0aXZlLmluZGljZXMpIHtcbiAgICAgIHJldHVybiAoKSA9PiBnbC5kcmF3RWxlbWVudHMoZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICB9XG4gICAgLy8gZWxzZSBpZiB0aGlzLnByaW1pdGl2ZSBkb2VzIG5vdCBoYXZlIGluZGljZXNcbiAgICByZXR1cm4gKCkgPT4gZ2wuZHJhd0FycmF5cyhkcmF3VHlwZSwgMCwgc2VsZi5nZXROdW1JbnN0YW5jZXMoKSk7XG4gIH1cblxuICBjaGVja1Byb3AocHJvcGVydHksIHByb3BlcnR5TmFtZSkge1xuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wZXJ0eU5hbWV9IHVuZGVmaW5lZCBpbiBsYXllciAke3RoaXMuaWR9YCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTUFQIExBWUVSIEZVTkNUSU9OQUxJVFlcblxuICBzZXRWaWV3cG9ydCgpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbX0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlld3BvcnQ6IG5ldyBmbGF0V29ybGQuVmlld3BvcnQod2lkdGgsIGhlaWdodCksXG4gICAgICBtZXJjYXRvcjogVmlld3BvcnRNZXJjYXRvcih7XG4gICAgICAgIHdpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb20sXG4gICAgICAgIHRpbGVTaXplOiA1MTJcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgY29uc3Qge3gsIHl9ID0gdGhpcy5zdGF0ZS52aWV3cG9ydDtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIHZpZXdwb3J0OiBbeCwgeSwgd2lkdGgsIGhlaWdodF0sXG4gICAgICBtYXBWaWV3cG9ydDogW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIHpvb20sIGZsYXRXb3JsZC5zaXplXVxuICAgIH0pO1xuICAgIGxvZygzLCB0aGlzLnN0YXRlLnZpZXdwb3J0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tKTtcbiAgfVxuXG4gIC8vIFRPRE8gZGVwcmVjYXRlOiB0aGlzIGZ1bnRpb24gaXMgb25seSB1c2VkIGZvciBjYWxjdWxhdGluZyByYWRpdXMgbm93XG4gIHByb2plY3QobGF0TG5nKSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW3gsIHldID0gbWVyY2F0b3IucHJvamVjdChbbGF0TG5nWzBdLCBsYXRMbmdbMV1dKTtcbiAgICByZXR1cm4ge3gsIHl9O1xuICB9XG5cbiAgLy8gVE9ETyBkZXByZWNhdGU6IHRoaXMgZnVudGlvbiBpcyBvbmx5IHVzZWQgZm9yIGNhbGN1bGF0aW5nIHJhZGl1cyBub3dcbiAgc2NyZWVuVG9TcGFjZSh4LCB5KSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHZpZXdwb3J0LnNjcmVlblRvU3BhY2UoeCwgeSk7XG4gIH1cblxufVxuIl19