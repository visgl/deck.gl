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

        if (newProps.data.length !== oldProps.data.length) {
          this.setState({ dataChanged: true });
        }
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

      if (this.state.dataChanged) {
        attributes.invalidateAll();
      }
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
      // add 1 to index to seperate from no selection

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
      // 1 was added to seperate from no selection

      var index = i1 + i2 * 256 + i3 * 65536 - 1;
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


      var drawType = primitive.drawType ? gl.get(primitive.drawType) : gl.POINTS;

      var numIndices = primitive.indices ? primitive.indices.length : 0;
      var numVertices = primitive.vertices ? primitive.vertices.length : 0;

      if (primitive.instanced) {
        var _ret = function () {
          var extension = gl.getExtension('ANGLE_instanced_arrays');

          if (primitive.indices) {
            return {
              v: function v() {
                return extension.drawElementsInstancedANGLE(drawType, numIndices, gl.UNSIGNED_SHORT, 0, state.layer.getNumInstances());
              }
            };
          }
          // else if this.primitive does not have indices
          return {
            v: function v() {
              return extension.drawArraysInstancedANGLE(drawType, 0, numVertices / 3, state.layer.getNumInstances());
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
        return gl.drawArrays(drawType, 0, state.layer.getNumInstances());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDQSxJQUFNLGdCQUFnQjtBQUNwQixPQUFLLENBQUw7QUFDQSxXQUFTLEdBQVQ7QUFDQSxnQkFBYyxTQUFkO0FBQ0EsY0FBWSxFQUFaO0FBQ0EsUUFBTSxFQUFOO0FBQ0EsY0FBWSxLQUFaO0FBQ0EsZUFBYSxLQUFiO0FBQ0EsWUFBVTtXQUFLO0dBQUw7QUFDVixXQUFTLG1CQUFNLEVBQU47QUFDVCxXQUFTLG1CQUFNLEVBQU47Q0FWTDs7QUFhTixJQUFNLGFBQWE7QUFDakIsaUJBQWUsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxXQUFMLEVBQWtCLEtBQUssVUFBTCxFQUEzRDtDQURJOztBQUlOLElBQUksVUFBVSxDQUFWOztJQUVpQjs7O3dCQUVLO0FBQ3RCLGFBQU8sVUFBUCxDQURzQjs7Ozs7Ozs7Ozs7Ozs7QUFZeEIsV0FkbUIsS0FjbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWRBLE9BY0E7O0FBRWpCLHlCQUNLLGVBQ0EsTUFGTDs7OztBQUZpQixRQVNiLE1BQU0sSUFBTixFQUFZO0FBQ2QsNkJBQVksTUFBTSxJQUFOLENBQVosQ0FEYztBQUVkLDRCQUFPLE1BQU0sSUFBTixDQUFXLE9BQU8sUUFBUCxDQUFsQixFQUFvQyxpQ0FBcEMsRUFGYztLQUFoQjs7QUFLQSxTQUFLLFNBQUwsQ0FBZSxNQUFNLElBQU4sRUFBWSxNQUEzQixFQWRpQjtBQWVqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLEVBQU4sRUFBVSxJQUF6QixFQWZpQjtBQWdCakIsU0FBSyxTQUFMLENBQWUsTUFBTSxLQUFOLEVBQWEsT0FBNUIsRUFoQmlCO0FBaUJqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLE1BQU4sRUFBYyxRQUE3QixF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QUFQLENBSGM7Ozs7Ozs7a0NBT0YsR0FBRyxHQUFHO1VBQ1gsV0FBWSxLQUFLLEtBQUwsQ0FBWixTQURXOztBQUVsQixhQUFPLFNBQVMsYUFBVCxDQUF1QixDQUF2QixFQUEwQixDQUExQixDQUFQLENBRmtCOzs7O1NBcGREIiwiZmlsZSI6ImxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZXNsaW50LWRpc2FibGUgZ3VhcmQtZm9yLWluICovXG5pbXBvcnQgQXR0cmlidXRlcyBmcm9tICcuLi9hdHRyaWJ1dGVzJztcbmltcG9ydCB7TW9kZWx9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHthcmVFcXVhbFNoYWxsb3d9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHthZGRJdGVyYXRvcn0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgaXNEZWVwRXF1YWwgZnJvbSAnbG9kYXNoLmlzZXF1YWwnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGZsYXRXb3JsZCBmcm9tICcuLi9mbGF0LXdvcmxkJztcbmltcG9ydCBWaWV3cG9ydE1lcmNhdG9yIGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2cnO1xuXG4vKlxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BzLmlkIC0gbGF5ZXIgbmFtZVxuICogQHBhcmFtIHthcnJheX0gIHByb3BzLmRhdGEgLSBhcnJheSBvZiBkYXRhIGluc3RhbmNlc1xuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLndpZHRoIC0gdmlld3BvcnQgd2lkdGgsIHN5bmNlZCB3aXRoIE1hcGJveEdMXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvcHMuaGVpZ2h0IC0gdmlld3BvcnQgd2lkdGgsIHN5bmNlZCB3aXRoIE1hcGJveEdMXG4gKiBAcGFyYW0ge2Jvb2x9IHByb3BzLmlzUGlja2FibGUgLSB3aGV0aGVyIGxheWVyIHJlc3BvbnNlIHRvIG1vdXNlIGV2ZW50XG4gKiBAcGFyYW0ge2Jvb2x9IHByb3BzLm9wYWNpdHkgLSBvcGFjaXR5IG9mIHRoZSBsYXllclxuICovXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBrZXk6IDAsXG4gIG9wYWNpdHk6IDAuOCxcbiAgbnVtSW5zdGFuY2VzOiB1bmRlZmluZWQsXG4gIGF0dHJpYnV0ZXM6IHt9LFxuICBkYXRhOiBbXSxcbiAgaXNQaWNrYWJsZTogZmFsc2UsXG4gIGRlZXBDb21wYXJlOiBmYWxzZSxcbiAgZ2V0VmFsdWU6IHggPT4geCxcbiAgb25Ib3ZlcjogKCkgPT4ge30sXG4gIG9uQ2xpY2s6ICgpID0+IHt9XG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgJzAnOiAncGlja1JlZCcsICcxJzogJ3BpY2tHcmVlbicsICcyJzogJ3BpY2tCbHVlJ31cbn07XG5cbmxldCBjb3VudGVyID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEJhc2UgTGF5ZXIgY2xhc3NcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyAtIFNlZSBkb2NzIGFib3ZlXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG4gICAgcHJvcHMgPSB7XG4gICAgICAuLi5ERUZBVUxUX1BST1BTLFxuICAgICAgLi4ucHJvcHNcbiAgICB9O1xuXG4gICAgLy8gQWRkIGl0ZXJhdG9yIHRvIG9iamVjdHNcbiAgICAvLyBUT0RPIC0gTW9kaWZ5aW5nIHByb3BzIGlzIGFuIGFudGktcGF0dGVyblxuICAgIGlmIChwcm9wcy5kYXRhKSB7XG4gICAgICBhZGRJdGVyYXRvcihwcm9wcy5kYXRhKTtcbiAgICAgIGFzc2VydChwcm9wcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0sICdkYXRhIHByb3AgbXVzdCBoYXZlIGFuIGl0ZXJhdG9yJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuZGF0YSwgJ2RhdGEnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5pZCwgJ2lkJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmxhdGl0dWRlLCAnbGF0aXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5sb25naXR1ZGUsICdsb25naXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy56b29tLCAnem9vbScpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY291bnQgPSBjb3VudGVyKys7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIExJRkVDWUNMRSBNRVRIT0RTLCBvdmVycmlkZGVuIGJ5IHRoZSBsYXllciBzdWJjbGFzc2VzXG5cbiAgLy8gQ2FsbGVkIG9uY2UgdG8gc2V0IHVwIHRoZSBpbml0aWFsIHN0YXRlXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF0dHJpYnV0ZXM6IG5ldyBBdHRyaWJ1dGVzKHtpZDogdGhpcy5wcm9wcy5pZH0pLFxuICAgICAgbW9kZWw6IG51bGwsXG4gICAgICB1bmlmb3Jtczoge30sXG4gICAgICBuZWVkc1JlZHJhdzogdHJ1ZSxcbiAgICAgIC8vIG51bUluc3RhbmNlczogdGhpcy5nZXROdW1JbnN0YW5jZXModGhpcy5wcm9wcyksXG4gICAgICBzZWxmOiB0aGlzLFxuICAgICAgZGF0YUNoYW5nZWQ6IHRydWUsXG4gICAgICBzdXBlcldhc0NhbGxlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICAvLyBBbGwgaW5zdGFuY2VkIGxheWVycyBnZXQgcGlja2luZ0NvbG9ycyBhdHRyaWJ1dGUgYnkgZGVmYXVsdFxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgd2hlbjogJ3JlYWxsb2MnfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBpcyBub3cgYXZhaWxhYmxlXG4gIGRpZE1vdW50KCkge1xuICB9XG5cbiAgc2hvdWxkVXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIElmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAoIWFyZUVxdWFsU2hhbGxvdyhuZXdQcm9wcywgb2xkUHJvcHMpKSB7XG5cbiAgICAgIGlmIChuZXdQcm9wcy5kYXRhLmxlbmd0aCAhPT0gb2xkUHJvcHMuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUNoYW5nZWQ6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobmV3UHJvcHMuZGVlcENvbXBhcmUgJiYgIWlzRGVlcEVxdWFsKG5ld1Byb3BzLmRhdGEsIG9sZFByb3BzLmRhdGEpKSB7XG4gICAgICAvLyBTdXBwb3J0IG9wdGlvbmFsIGRlZXAgY29tcGFyZSBvZiBkYXRhXG4gICAgICAvLyBOb3RlOiB0aGlzIGlzIHF1aXRlIGluZWZmaWNpZW50LCBhcHAgc2hvdWxkIHVzZSBidWZmZXIgcHJvcHMgaW5zdGVhZFxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGF0YUNoYW5nZWQ6IHRydWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBEZWZhdWx0IGltcGxlbWVudGF0aW9uLCBhbGwgYXR0cmlidXRlcyB3aWxsIGJlIHVwZGF0ZWRcbiAgd2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQpe1xuICAgICAgYXR0cmlidXRlcy5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBzdGlsbCBhdmFpbGFibGVcbiAgd2lsbFVubW91bnQoKSB7XG4gIH1cblxuICAvLyBFTkQgTElGRUNZQ0xFIE1FVEhPRFNcbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGxldCBuZWVkc1JlZHJhdyA9IGF0dHJpYnV0ZXMuZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pO1xuICAgIG5lZWRzUmVkcmF3ID0gbmVlZHNSZWRyYXcgfHwgdGhpcy5uZWVkc1JlZHJhdztcbiAgICBpZiAoY2xlYXJGbGFnKSB7XG4gICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBuZWVkc1JlZHJhdztcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFN0YXRlKHVwZGF0ZU9iamVjdCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgdXBkYXRlT2JqZWN0KTtcbiAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFVuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICB0aGlzLl9jaGVja1VuaWZvcm1zKHVuaWZvcm1NYXApO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS51bmlmb3JtcywgdW5pZm9ybU1hcCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBUT0RPIC0gTW92ZSBpbnRvIGx1bWEuZ2wsIGFuZCBjaGVjayBhZ2FpbnN0IGRlZmluaXRpb25zXG4gIF9jaGVja1VuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB1bmlmb3JtTWFwKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHVuaWZvcm1NYXBba2V5XTtcbiAgICAgIHRoaXMuX2NoZWNrVW5pZm9ybVZhbHVlKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja1VuaWZvcm1WYWx1ZSh1bmlmb3JtLCB2YWx1ZSkge1xuICAgIGZ1bmN0aW9uIGlzTnVtYmVyKHYpIHtcbiAgICAgIHJldHVybiAhaXNOYU4odikgJiYgTnVtYmVyKHYpID09PSB2ICYmIHYgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQgb2sgPSB0cnVlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHZhbHVlKSB7XG4gICAgICAgIGlmICghaXNOdW1iZXIoZWxlbWVudCkpIHtcbiAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICBvayA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIW9rKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gICAgICAvKiBnbG9iYWwgY29uc29sZSAqL1xuICAgICAgLy8gVmFsdWUgY291bGQgYmUgdW5wcmludGFibGUgc28gd3JpdGUgdGhlIG9iamVjdCBvbiBjb25zb2xlXG4gICAgICBjb25zb2xlLmVycm9yKGAke3RoaXMucHJvcHMuaWR9IEJhZCB1bmlmb3JtICR7dW5pZm9ybX1gLCB2YWx1ZSk7XG4gICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgIHRocm93IG5ldyBFcnJvcihgJHt0aGlzLnByb3BzLmlkfSBCYWQgdW5pZm9ybSAke3VuaWZvcm19YCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlIGl0ZXJhdGlvbiAodGhlIG9ubHkgcmVxdWlyZWQgY2FwYWJpbGl0eSBvbiBkYXRhKSB0byBnZXQgZmlyc3QgZWxlbWVudFxuICBnZXRGaXJzdE9iamVjdCgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIERlZHVjZXMgbnVtZXIgb2YgaW5zdGFuY2VzLiBJbnRlbnRpb24gaXMgdG8gc3VwcG9ydDpcbiAgLy8gLSBFeHBsaWNpdCBzZXR0aW5nIG9mIG51bUluc3RhbmNlc1xuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIHNpemUgbWVtYmVyXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIENsYXNzaWMgQXJyYXlzIHZpYSB0aGUgYnVpbHQtaW4gbGVuZ3RoIGF0dHJpYnV0ZVxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIHZpYSBhcnJheXNcbiAgZ2V0TnVtSW5zdGFuY2VzKHByb3BzKSB7XG4gICAgcHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhlIGxheWVyIGhhcyBzZXQgaXRzIG93biB2YWx1ZVxuICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhcHAgaGFzIHNldCBhbiBleHBsaWNpdCB2YWx1ZVxuICAgIGlmIChwcm9wcy5udW1JbnN0YW5jZXMpIHtcbiAgICAgIHJldHVybiBwcm9wcy5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgY29uc3Qge2RhdGF9ID0gcHJvcHM7XG5cbiAgICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcInNpemVcIiBhdHRyaWJ1dGUgaXMgc2V0XG4gICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEuY291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBkYXRhLmNvdW50KCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICAgIGlmIChkYXRhICYmIGRhdGEuc2l6ZSkge1xuICAgICAgcmV0dXJuIGRhdGEuc2l6ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhcnJheSBsZW5ndGggYXR0cmlidXRlIGlzIHNldCBvbiBkYXRhXG4gICAgLy8gTm90ZTogY2hlY2tpbmcgdGhpcyBsYXN0IHNpbmNlIHNvbWUgRVM2IGNvbGxlY3Rpb25zIChJbW11dGFibGUpXG4gICAgLy8gZW1pdCBwcm9mdXNlIHdhcm5pbmdzIHdoZW4gdHJ5aW5nIHRvIGFjY2VzcyAubGVuZ3RoXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBkYXRhLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBUT0RPIC0gc2xvdywgd2UgcHJvYmFibHkgc2hvdWxkIG5vdCBzdXBwb3J0IHRoaXMgdW5sZXNzXG4gICAgLy8gd2UgbGltaXQgdGhlIG51bWJlciBvZiBpbnZvY2F0aW9uc1xuICAgIC8vXG4gICAgLy8gVXNlIGl0ZXJhdGlvbiB0byBjb3VudCBvYmplY3RzXG4gICAgLy8gbGV0IGNvdW50ID0gMDtcbiAgICAvLyAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIC8vIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAvLyAgIGNvdW50Kys7XG4gICAgLy8gfVxuICAgIC8vIHJldHVybiBjb3VudDtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRlZHVjZSBudW1JbnN0YW5jZXMnKTtcbiAgfVxuXG4gIC8vIEludGVybmFsIEhlbHBlcnNcblxuICBjaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIE5vdGU6IGRhdGFDaGFuZ2VkIG1pZ2h0IGFscmVhZHkgYmUgc2V0XG4gICAgaWYgKG5ld1Byb3BzLmRhdGEgIT09IG9sZFByb3BzLmRhdGEpIHtcbiAgICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICAgIHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy53aWR0aCAhPT0gb2xkUHJvcHMud2lkdGggfHxcbiAgICAgIG5ld1Byb3BzLmhlaWdodCAhPT0gb2xkUHJvcHMuaGVpZ2h0IHx8XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7dmlld3BvcnRDaGFuZ2VkfSk7XG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGVzKHByb3BzKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBudW1JbnN0YW5jZXMgPSB0aGlzLmdldE51bUluc3RhbmNlcyhwcm9wcyk7XG4gICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgIGF0dHJpYnV0ZXMudXBkYXRlKHtcbiAgICAgIG51bUluc3RhbmNlcyxcbiAgICAgIGJ1ZmZlck1hcDogcHJvcHMsXG4gICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgLy8gRG9uJ3Qgd29ycnkgYWJvdXQgbm9uLWF0dHJpYnV0ZSBwcm9wc1xuICAgICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXM6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgLy8gYXBwbHkgZ2FtbWEgdG8gb3BhY2l0eSB0byBtYWtlIGl0IHZpc3VhbGx5IFwibGluZWFyXCJcbiAgICAgIG9wYWNpdHk6IE1hdGgucG93KHRoaXMucHJvcHMub3BhY2l0eSB8fCAwLjgsIDEgLyAyLjIpXG4gICAgfSk7XG4gIH1cblxuICAvLyBMQVlFUiBNQU5BR0VSIEFQSVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gYSBuZXcgbGF5ZXIgaXMgZm91bmRcbiAgaW5pdGlhbGl6ZUxheWVyKHtnbH0pIHtcbiAgICBhc3NlcnQoZ2wpO1xuICAgIHRoaXMuc3RhdGUgPSB7Z2x9O1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBzdGF0ZSBvbmx5IG9uY2VcbiAgICAvLyBOb3RlOiBNdXN0IGFsd2F5cyBjYWxsIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpIHdoZW4gb3ZlcnJpZGluZyFcbiAgICB0aGlzLnN0YXRlLnN1cGVyV2FzQ2FsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5pbml0aWFsaXplU3RhdGUoKTtcbiAgICBhc3NlcnQodGhpcy5zdGF0ZS5zdXBlcldhc0NhbGxlZCxcbiAgICAgICdMYXllciBtdXN0IGNhbGwgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCknKTtcblxuICAgIC8vIEFkZCBhbnkgcHJpbWl0aXZlIGF0dHJpYnV0ZXNcbiAgICB0aGlzLl9pbml0aWFsaXplUHJpbWl0aXZlQXR0cmlidXRlcygpO1xuXG4gICAgLy8gVE9ETyAtIHRoZSBhcHAgbXVzdCBiZSBhYmxlIHRvIG92ZXJyaWRlXG5cbiAgICAvLyBBZGQgYW55IHN1YmNsYXNzIGF0dHJpYnV0ZXNcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXModGhpcy5wcm9wcyk7XG4gICAgdGhpcy51cGRhdGVVbmlmb3JtcygpO1xuXG4gICAgLy8gQ3JlYXRlIGEgbW9kZWwgZm9yIHRoZSBsYXllclxuICAgIHRoaXMuX2NyZWF0ZU1vZGVsKHtnbH0pO1xuXG4gICAgLy8gQ2FsbCBsaWZlIGN5Y2xlIG1ldGhvZFxuICAgIHRoaXMuZGlkTW91bnQoKTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gZXhpc3RpbmcgbGF5ZXIgaXMgZ2V0dGluZyBuZXcgcHJvcHNcbiAgdXBkYXRlTGF5ZXIob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHN0YW5kYXJkIGNoYW5nZSBmbGFnc1xuICAgIHRoaXMuY2hlY2tQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gQ2hlY2sgaWYgYW55IHByb3BzIGhhdmUgY2hhbmdlZFxuICAgIGlmICh0aGlzLnNob3VsZFVwZGF0ZShvbGRQcm9wcywgbmV3UHJvcHMpKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBMZXQgdGhlIHN1YmNsYXNzIG1hcmsgd2hhdCBpcyBuZWVkZWQgZm9yIHVwZGF0ZVxuICAgICAgdGhpcy53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgICAvLyBSdW4gdGhlIGF0dHJpYnV0ZSB1cGRhdGVyc1xuICAgICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKG5ld1Byb3BzKTtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdW5pZm9ybXNcbiAgICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBtYW5hZ2VyIHdoZW4gbGF5ZXIgaXMgYWJvdXQgdG8gYmUgZGlzcG9zZWRcbiAgLy8gTm90ZTogbm90IGd1YXJhbnRlZWQgdG8gYmUgY2FsbGVkIG9uIGFwcGxpY2F0aW9uIHNodXRkb3duXG4gIGZpbmFsaXplTGF5ZXIoKSB7XG4gICAgdGhpcy53aWxsVW5tb3VudCgpO1xuICB9XG5cbiAgY2FsY3VsYXRlUGlja2luZ0NvbG9ycyhhdHRyaWJ1dGUsIG51bUluc3RhbmNlcykge1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgLy8gYWRkIDEgdG8gaW5kZXggdG8gc2VwZXJhdGUgZnJvbSBubyBzZWxlY3Rpb25cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDBdID0gKGkgKyAxKSAlIDI1NjtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMV0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYpICUgMjU2O1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAyXSA9IE1hdGguZmxvb3IoKGkgKyAxKSAvIDI1NiAvIDI1NikgJSAyNTY7XG4gICAgfVxuICB9XG5cbiAgZGVjb2RlUGlja2luZ0NvbG9yKGNvbG9yKSB7XG4gICAgYXNzZXJ0KGNvbG9yIGluc3RhbmNlb2YgVWludDhBcnJheSk7XG4gICAgY29uc3QgW2kxLCBpMiwgaTNdID0gY29sb3I7XG4gICAgLy8gMSB3YXMgYWRkZWQgdG8gc2VwZXJhdGUgZnJvbSBubyBzZWxlY3Rpb25cbiAgICBjb25zdCBpbmRleCA9IGkxICsgaTIgKiAyNTYgKyBpMyAqIDY1NTM2IC0gMTtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cblxuICBvbkhvdmVyKGluZm8pIHtcbiAgICBjb25zdCB7Y29sb3J9ID0gaW5mbztcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZGVjb2RlUGlja2luZ0NvbG9yKGNvbG9yKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkhvdmVyKHtpbmRleCwgLi4uaW5mb30pO1xuICB9XG5cbiAgb25DbGljayhpbmZvKSB7XG4gICAgY29uc3Qge2NvbG9yfSA9IGluZm87XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmRlY29kZVBpY2tpbmdDb2xvcihjb2xvcik7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25DbGljayh7aW5kZXgsIC4uLmluZm99KTtcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICAvLyBTZXQgdXAgYXR0cmlidXRlcyByZWxhdGluZyB0byB0aGUgcHJpbWl0aXZlIGl0c2VsZiAobm90IHRoZSBpbnN0YW5jZXMpXG4gIF9pbml0aWFsaXplUHJpbWl0aXZlQXR0cmlidXRlcygpIHtcbiAgICBjb25zdCB7Z2wsIHByaW1pdGl2ZSwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHt2ZXJ0aWNlcywgbm9ybWFscywgaW5kaWNlc30gPSBwcmltaXRpdmU7XG5cbiAgICBjb25zdCB4eXogPSB7JzAnOiAneCcsICcxJzogJ3knLCAnMic6ICd6J307XG5cbiAgICBpZiAodmVydGljZXMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuYWRkKFxuICAgICAgICB7dmVydGljZXM6IHt2YWx1ZTogdmVydGljZXMsIHNpemU6IDMsIC4uLnh5en1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChub3JtYWxzKSB7XG4gICAgICBhdHRyaWJ1dGVzLmFkZCh7XG4gICAgICAgIG5vcm1hbHM6IHt2YWx1ZTogbm9ybWFscywgc2l6ZTogMywgLi4ueHl6fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGluZGljZXMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuYWRkKHtcbiAgICAgICAgaW5kaWNlczoge1xuICAgICAgICAgIHZhbHVlOiBpbmRpY2VzLFxuICAgICAgICAgIHNpemU6IDEsXG4gICAgICAgICAgYnVmZmVyVHlwZTogZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsXG4gICAgICAgICAgZHJhd1R5cGU6IGdsLlNUQVRJQ19EUkFXLFxuICAgICAgICAgICcwJzogJ2luZGV4J1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlTW9kZWwoe2dsfSkge1xuICAgIGNvbnN0IHtwcm9ncmFtLCBhdHRyaWJ1dGVzLCB1bmlmb3Jtc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgdGhpcy5zdGF0ZS5tb2RlbCA9IG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBwcm9ncmFtLFxuICAgICAgYXR0cmlidXRlczogYXR0cmlidXRlcy5nZXRBdHRyaWJ1dGVzKCksXG4gICAgICB1bmlmb3JtczogdW5pZm9ybXMsXG4gICAgICAvLyB3aGV0aGVyIGN1cnJlbnQgbGF5ZXIgcmVzcG9uc2VzIHRvIG1vdXNlIGV2ZW50c1xuICAgICAgcGlja2FibGU6IHRoaXMucHJvcHMuaXNQaWNrYWJsZSxcbiAgICAgIC8vIGdldCByZW5kZXIgZnVuY3Rpb24gcGVyIHByaW1pdGl2ZSAoaW5zdGFuY2VkPyBpbmRleGVkPylcbiAgICAgIHJlbmRlcjogdGhpcy5fZ2V0UmVuZGVyRnVuY3Rpb24oZ2wpXG4gICAgfSk7XG4gIH1cblxuICAvLyBTaG91bGQgdGhpcyBiZSBtb3ZlZCB0byBwcm9ncmFtXG4gIF9nZXRSZW5kZXJGdW5jdGlvbihnbCkge1xuICAgIC8vIFwiQ2FwdHVyZVwiIHN0YXRlIGFzIGl0IHdpbGwgYmUgc2V0IHRvIG51bGwgd2hlbiBsYXllciBpcyBkaXNwb3NlZFxuICAgIGNvbnN0IHtzdGF0ZX0gPSB0aGlzO1xuICAgIGNvbnN0IHtwcmltaXRpdmV9ID0gc3RhdGU7XG5cbiAgICBjb25zdCBkcmF3VHlwZSA9IHByaW1pdGl2ZS5kcmF3VHlwZSA/XG4gICAgICBnbC5nZXQocHJpbWl0aXZlLmRyYXdUeXBlKSA6IGdsLlBPSU5UUztcblxuICAgIGNvbnN0IG51bUluZGljZXMgPSBwcmltaXRpdmUuaW5kaWNlcyA/IHByaW1pdGl2ZS5pbmRpY2VzLmxlbmd0aCA6IDA7XG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBwcmltaXRpdmUudmVydGljZXMgPyBwcmltaXRpdmUudmVydGljZXMubGVuZ3RoIDogMDtcblxuICAgIGlmIChwcmltaXRpdmUuaW5zdGFuY2VkKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcblxuICAgICAgaWYgKHByaW1pdGl2ZS5pbmRpY2VzKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBleHRlbnNpb24uZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwLCBzdGF0ZS5sYXllci5nZXROdW1JbnN0YW5jZXMoKVxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZiB0aGlzLnByaW1pdGl2ZSBkb2VzIG5vdCBoYXZlIGluZGljZXNcbiAgICAgIHJldHVybiAoKSA9PiBleHRlbnNpb24uZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFKFxuICAgICAgICBkcmF3VHlwZSwgMCwgbnVtVmVydGljZXMgLyAzLCBzdGF0ZS5sYXllci5nZXROdW1JbnN0YW5jZXMoKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zdGF0ZS5wcmltaXRpdmUuaW5kaWNlcykge1xuICAgICAgcmV0dXJuICgpID0+IGdsLmRyYXdFbGVtZW50cyhkcmF3VHlwZSwgbnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgIH1cbiAgICAvLyBlbHNlIGlmIHRoaXMucHJpbWl0aXZlIGRvZXMgbm90IGhhdmUgaW5kaWNlc1xuICAgIHJldHVybiAoKSA9PiBnbC5kcmF3QXJyYXlzKGRyYXdUeXBlLCAwLCBzdGF0ZS5sYXllci5nZXROdW1JbnN0YW5jZXMoKSk7XG4gIH1cblxuICBjaGVja1Byb3AocHJvcGVydHksIHByb3BlcnR5TmFtZSkge1xuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wZXJ0eU5hbWV9IHVuZGVmaW5lZCBpbiBsYXllciAke3RoaXMuaWR9YCk7XG4gICAgfVxuICB9XG5cbiAgLy8gTUFQIExBWUVSIEZVTkNUSU9OQUxJVFlcblxuICBzZXRWaWV3cG9ydCgpIHtcbiAgICBjb25zdCB7d2lkdGgsIGhlaWdodCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbX0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgdmlld3BvcnQ6IG5ldyBmbGF0V29ybGQuVmlld3BvcnQod2lkdGgsIGhlaWdodCksXG4gICAgICBtZXJjYXRvcjogVmlld3BvcnRNZXJjYXRvcih7XG4gICAgICAgIHdpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb20sXG4gICAgICAgIHRpbGVTaXplOiA1MTJcbiAgICAgIH0pXG4gICAgfSk7XG4gICAgY29uc3Qge3gsIHl9ID0gdGhpcy5zdGF0ZS52aWV3cG9ydDtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIHZpZXdwb3J0OiBbeCwgeSwgd2lkdGgsIGhlaWdodF0sXG4gICAgICBtYXBWaWV3cG9ydDogW2xvbmdpdHVkZSwgbGF0aXR1ZGUsIHpvb20sIGZsYXRXb3JsZC5zaXplXVxuICAgIH0pO1xuICAgIGxvZygzLCB0aGlzLnN0YXRlLnZpZXdwb3J0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tKTtcbiAgfVxuXG4gIC8vIFRPRE8gZGVwcmVjYXRlOiB0aGlzIGZ1bnRpb24gaXMgb25seSB1c2VkIGZvciBjYWxjdWxhdGluZyByYWRpdXMgbm93XG4gIHByb2plY3QobGF0TG5nKSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW3gsIHldID0gbWVyY2F0b3IucHJvamVjdChbbGF0TG5nWzBdLCBsYXRMbmdbMV1dKTtcbiAgICByZXR1cm4ge3gsIHl9O1xuICB9XG5cbiAgLy8gVE9ETyBkZXByZWNhdGU6IHRoaXMgZnVudGlvbiBpcyBvbmx5IHVzZWQgZm9yIGNhbGN1bGF0aW5nIHJhZGl1cyBub3dcbiAgc2NyZWVuVG9TcGFjZSh4LCB5KSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHZpZXdwb3J0LnNjcmVlblRvU3BhY2UoeCwgeSk7XG4gIH1cblxufVxuIl19