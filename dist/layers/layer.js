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

var count = 0;

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

    this.props = props;
    this.count = count++;
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
        throw new Error(this.props.id + ' Bad uniform ' + uniform, value);
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
    // - Auto-deduction via iteration

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

      // Check if array length attribute is set on data

      if (data && data.length !== undefined) {
        return data.length;
      }

      // Check if ES6 collection "size" attribute is set
      if (data && data.size !== undefined) {
        return data.size;
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
  }]);

  return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQSxJQUFNLGdCQUFnQjtBQUNwQixPQUFLLENBQUw7QUFDQSxXQUFTLEdBQVQ7QUFDQSxnQkFBYyxTQUFkO0FBQ0EsY0FBWSxFQUFaO0FBQ0EsUUFBTSxFQUFOO0FBQ0EsY0FBWSxLQUFaO0FBQ0EsZUFBYSxLQUFiO0FBQ0EsWUFBVTtXQUFLO0dBQUw7QUFDVixXQUFTLG1CQUFNLEVBQU47QUFDVCxXQUFTLG1CQUFNLEVBQU47Q0FWTDs7QUFhTixJQUFNLGFBQWE7QUFDakIsaUJBQWUsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLFNBQUwsRUFBZ0IsS0FBSyxXQUFMLEVBQWtCLEtBQUssVUFBTCxFQUEzRDtDQURJOztBQUlOLElBQUksUUFBUSxDQUFSOztJQUVpQjs7O3dCQUVLO0FBQ3RCLGFBQU8sVUFBUCxDQURzQjs7Ozs7Ozs7Ozs7Ozs7QUFZeEIsV0FkbUIsS0FjbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWRBLE9BY0E7O0FBRWpCLHlCQUNLLGVBQ0EsTUFGTDs7OztBQUZpQixRQVNiLE1BQU0sSUFBTixFQUFZO0FBQ2QsNkJBQVksTUFBTSxJQUFOLENBQVosQ0FEYztBQUVkLDRCQUFPLE1BQU0sSUFBTixDQUFXLE9BQU8sUUFBUCxDQUFsQixFQUFvQyxpQ0FBcEMsRUFGYztLQUFoQjs7QUFLQSxTQUFLLFNBQUwsQ0FBZSxNQUFNLElBQU4sRUFBWSxNQUEzQixFQWRpQjtBQWVqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLEVBQU4sRUFBVSxJQUF6QixFQWZpQjtBQWdCakIsU0FBSyxTQUFMLENBQWUsTUFBTSxLQUFOLEVBQWEsT0FBNUIsRUFoQmlCO0FBaUJqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLE1BQU4sRUFBYyxRQUE3QixFQWpCaUI7O0FBbUJq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YyxRQUFkLEVBQXdCLENBQXhCLEVBQTJCLEtBQUssZUFBTCxFQUEzQjtPQUFOLENBN0JjOzs7OzhCQWdDYixVQUFVLGNBQWM7QUFDaEMsVUFBSSxDQUFDLFFBQUQsRUFBVztBQUNiLGNBQU0sSUFBSSxLQUFKLGVBQXNCLHdDQUFtQyxLQUFLLEVBQUwsQ0FBL0QsQ0FEYTtPQUFmOzs7O1NBN1lpQiIsImZpbGUiOiJsYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIGd1YXJkLWZvci1pbiAqL1xuaW1wb3J0IEF0dHJpYnV0ZXMgZnJvbSAnLi4vYXR0cmlidXRlcyc7XG5pbXBvcnQge01vZGVsfSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7YXJlRXF1YWxTaGFsbG93fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7YWRkSXRlcmF0b3J9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IGlzRGVlcEVxdWFsIGZyb20gJ2xvZGFzaC5pc2VxdWFsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLypcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5pZCAtIGxheWVyIG5hbWVcbiAqIEBwYXJhbSB7YXJyYXl9ICBwcm9wcy5kYXRhIC0gYXJyYXkgb2YgZGF0YSBpbnN0YW5jZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy53aWR0aCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLmhlaWdodCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5pc1BpY2thYmxlIC0gd2hldGhlciBsYXllciByZXNwb25zZSB0byBtb3VzZSBldmVudFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5vcGFjaXR5IC0gb3BhY2l0eSBvZiB0aGUgbGF5ZXJcbiAqL1xuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAga2V5OiAwLFxuICBvcGFjaXR5OiAwLjgsXG4gIG51bUluc3RhbmNlczogdW5kZWZpbmVkLFxuICBhdHRyaWJ1dGVzOiB7fSxcbiAgZGF0YTogW10sXG4gIGlzUGlja2FibGU6IGZhbHNlLFxuICBkZWVwQ29tcGFyZTogZmFsc2UsXG4gIGdldFZhbHVlOiB4ID0+IHgsXG4gIG9uSG92ZXI6ICgpID0+IHt9LFxuICBvbkNsaWNrOiAoKSA9PiB7fVxufTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcGlja2luZ0NvbG9yczoge3NpemU6IDMsICcwJzogJ3BpY2tSZWQnLCAnMSc6ICdwaWNrR3JlZW4nLCAnMic6ICdwaWNrQmx1ZSd9XG59O1xuXG5sZXQgY291bnQgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQmFzZSBMYXllciBjbGFzc1xuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IHByb3BzIC0gU2VlIGRvY3MgYWJvdmVcbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cbiAgICBwcm9wcyA9IHtcbiAgICAgIC4uLkRFRkFVTFRfUFJPUFMsXG4gICAgICAuLi5wcm9wc1xuICAgIH07XG5cbiAgICAvLyBBZGQgaXRlcmF0b3IgdG8gb2JqZWN0c1xuICAgIC8vIFRPRE8gLSBNb2RpZnlpbmcgcHJvcHMgaXMgYW4gYW50aS1wYXR0ZXJuXG4gICAgaWYgKHByb3BzLmRhdGEpIHtcbiAgICAgIGFkZEl0ZXJhdG9yKHByb3BzLmRhdGEpO1xuICAgICAgYXNzZXJ0KHByb3BzLmRhdGFbU3ltYm9sLml0ZXJhdG9yXSwgJ2RhdGEgcHJvcCBtdXN0IGhhdmUgYW4gaXRlcmF0b3InKTtcbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5kYXRhLCAnZGF0YScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmlkLCAnaWQnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5jb3VudCA9IGNvdW50Kys7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIExJRkVDWUNMRSBNRVRIT0RTLCBvdmVycmlkZGVuIGJ5IHRoZSBsYXllciBzdWJjbGFzc2VzXG5cbiAgLy8gQ2FsbGVkIG9uY2UgdG8gc2V0IHVwIHRoZSBpbml0aWFsIHN0YXRlXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGF0dHJpYnV0ZXM6IG5ldyBBdHRyaWJ1dGVzKHtpZDogdGhpcy5wcm9wcy5pZH0pLFxuICAgICAgbW9kZWw6IG51bGwsXG4gICAgICB1bmlmb3Jtczoge30sXG4gICAgICBuZWVkc1JlZHJhdzogdHJ1ZSxcbiAgICAgIC8vIG51bUluc3RhbmNlczogdGhpcy5nZXROdW1JbnN0YW5jZXModGhpcy5wcm9wcyksXG4gICAgICBzZWxmOiB0aGlzLFxuICAgICAgZGF0YUNoYW5nZWQ6IHRydWUsXG4gICAgICBzdXBlcldhc0NhbGxlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICAvLyBBbGwgaW5zdGFuY2VkIGxheWVycyBnZXQgcGlja2luZ0NvbG9ycyBhdHRyaWJ1dGUgYnkgZGVmYXVsdFxuICAgIGF0dHJpYnV0ZXMuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9ycywgd2hlbjogJ3JlYWxsb2MnfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBpcyBub3cgYXZhaWxhYmxlXG4gIGRpZE1vdW50KCkge1xuICB9XG5cbiAgc2hvdWxkVXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIElmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAoIWFyZUVxdWFsU2hhbGxvdyhuZXdQcm9wcywgb2xkUHJvcHMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG5ld1Byb3BzLmRlZXBDb21wYXJlICYmICFpc0RlZXBFcXVhbChuZXdQcm9wcy5kYXRhLCBvbGRQcm9wcy5kYXRhKSkge1xuICAgICAgLy8gU3VwcG9ydCBvcHRpb25hbCBkZWVwIGNvbXBhcmUgb2YgZGF0YVxuICAgICAgLy8gTm90ZTogdGhpcyBpcyBxdWl0ZSBpbmVmZmljaWVudCwgYXBwIHNob3VsZCB1c2UgYnVmZmVyIHByb3BzIGluc3RlYWRcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFDaGFuZ2VkOiB0cnVlfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiwgYWxsIGF0dHJpYnV0ZXMgd2lsbCBiZSB1cGRhdGVkXG4gIHdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGF0dHJpYnV0ZXMuaW52YWxpZGF0ZUFsbCgpO1xuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBzdGlsbCBhdmFpbGFibGVcbiAgd2lsbFVubW91bnQoKSB7XG4gIH1cblxuICAvLyBFTkQgTElGRUNZQ0xFIE1FVEhPRFNcbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGxldCBuZWVkc1JlZHJhdyA9IGF0dHJpYnV0ZXMuZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pO1xuICAgIG5lZWRzUmVkcmF3ID0gbmVlZHNSZWRyYXcgfHwgdGhpcy5uZWVkc1JlZHJhdztcbiAgICBpZiAoY2xlYXJGbGFnKSB7XG4gICAgICB0aGlzLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBuZWVkc1JlZHJhdztcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFN0YXRlKHVwZGF0ZU9iamVjdCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgdXBkYXRlT2JqZWN0KTtcbiAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFVuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICB0aGlzLl9jaGVja1VuaWZvcm1zKHVuaWZvcm1NYXApO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZS51bmlmb3JtcywgdW5pZm9ybU1hcCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBUT0RPIC0gTW92ZSBpbnRvIGx1bWEuZ2wsIGFuZCBjaGVjayBhZ2FpbnN0IGRlZmluaXRpb25zXG4gIF9jaGVja1VuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB1bmlmb3JtTWFwKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHVuaWZvcm1NYXBba2V5XTtcbiAgICAgIHRoaXMuX2NoZWNrVW5pZm9ybVZhbHVlKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIF9jaGVja1VuaWZvcm1WYWx1ZSh1bmlmb3JtLCB2YWx1ZSkge1xuICAgIGZ1bmN0aW9uIGlzTnVtYmVyKHYpIHtcbiAgICAgIHJldHVybiAhaXNOYU4odikgJiYgTnVtYmVyKHYpID09PSB2ICYmIHYgIT09IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBsZXQgb2sgPSB0cnVlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSB8fCB2YWx1ZSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkge1xuICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHZhbHVlKSB7XG4gICAgICAgIGlmICghaXNOdW1iZXIoZWxlbWVudCkpIHtcbiAgICAgICAgICBvayA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaXNOdW1iZXIodmFsdWUpKSB7XG4gICAgICBvayA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoIW9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7dGhpcy5wcm9wcy5pZH0gQmFkIHVuaWZvcm0gJHt1bmlmb3JtfWAsIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICAvLyBVc2UgaXRlcmF0aW9uICh0aGUgb25seSByZXF1aXJlZCBjYXBhYmlsaXR5IG9uIGRhdGEpIHRvIGdldCBmaXJzdCBlbGVtZW50XG4gIGdldEZpcnN0T2JqZWN0KCkge1xuICAgIGNvbnN0IHtkYXRhfSA9IHRoaXMucHJvcHM7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgcmV0dXJuIG9iamVjdDtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gRGVkdWNlcyBudW1lciBvZiBpbnN0YW5jZXMuIEludGVudGlvbiBpcyB0byBzdXBwb3J0OlxuICAvLyAtIEV4cGxpY2l0IHNldHRpbmcgb2YgbnVtSW5zdGFuY2VzXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIEVTNiBjb250YWluZXJzIHRoYXQgZGVmaW5lIGEgc2l6ZSBtZW1iZXJcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgQ2xhc3NpYyBBcnJheXMgdmlhIHRoZSBidWlsdC1pbiBsZW5ndGggYXR0cmlidXRlXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gdmlhIGFycmF5c1xuICAvLyAtIEF1dG8tZGVkdWN0aW9uIHZpYSBpdGVyYXRpb25cbiAgZ2V0TnVtSW5zdGFuY2VzKHByb3BzKSB7XG4gICAgcHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhlIGxheWVyIGhhcyBzZXQgaXRzIG93biB2YWx1ZVxuICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhcHAgaGFzIHNldCBhbiBleHBsaWNpdCB2YWx1ZVxuICAgIGlmIChwcm9wcy5udW1JbnN0YW5jZXMpIHtcbiAgICAgIHJldHVybiBwcm9wcy5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgY29uc3Qge2RhdGF9ID0gcHJvcHM7XG5cbiAgICAvLyBDaGVjayBpZiBhcnJheSBsZW5ndGggYXR0cmlidXRlIGlzIHNldCBvbiBkYXRhXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGRhdGEubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgICBpZiAoZGF0YSAmJiBkYXRhLnNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGRhdGEuc2l6ZTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIC0gc2xvdywgd2UgcHJvYmFibHkgc2hvdWxkIG5vdCBzdXBwb3J0IHRoaXMgdW5sZXNzXG4gICAgLy8gd2UgbGltaXQgdGhlIG51bWJlciBvZiBpbnZvY2F0aW9uc1xuICAgIC8vXG4gICAgLy8gVXNlIGl0ZXJhdGlvbiB0byBjb3VudCBvYmplY3RzXG4gICAgLy8gbGV0IGNvdW50ID0gMDtcbiAgICAvLyAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIC8vIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAvLyAgIGNvdW50Kys7XG4gICAgLy8gfVxuICAgIC8vIHJldHVybiBjb3VudDtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRlZHVjZSBudW1JbnN0YW5jZXMnKTtcbiAgfVxuXG4gIC8vIEludGVybmFsIEhlbHBlcnNcblxuICBjaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIE5vdGU6IGRhdGFDaGFuZ2VkIG1pZ2h0IGFscmVhZHkgYmUgc2V0XG4gICAgaWYgKG5ld1Byb3BzLmRhdGEgIT09IG9sZFByb3BzLmRhdGEpIHtcbiAgICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICAgIHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZXMocHJvcHMpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKHByb3BzKTtcblxuICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICBhdHRyaWJ1dGVzLnVwZGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBidWZmZXJNYXA6IHByb3BzLFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IG5vbi1hdHRyaWJ1dGUgcHJvcHNcbiAgICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVVbmlmb3JtcygpIHtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIGFwcGx5IGdhbW1hIHRvIG9wYWNpdHkgdG8gbWFrZSBpdCB2aXN1YWxseSBcImxpbmVhclwiXG4gICAgICBvcGFjaXR5OiBNYXRoLnBvdyh0aGlzLnByb3BzLm9wYWNpdHkgfHwgMC44LCAxIC8gMi4yKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gTEFZRVIgTUFOQUdFUiBBUElcblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGEgbmV3IGxheWVyIGlzIGZvdW5kXG4gIGluaXRpYWxpemVMYXllcih7Z2x9KSB7XG4gICAgYXNzZXJ0KGdsKTtcbiAgICB0aGlzLnN0YXRlID0ge2dsfTtcblxuICAgIC8vIEluaXRpYWxpemUgc3RhdGUgb25seSBvbmNlXG4gICAgLy8gTm90ZTogTXVzdCBhbHdheXMgY2FsbCBzdXBlci5pbml0aWFsaXplU3RhdGUoKSB3aGVuIG92ZXJyaWRpbmchXG4gICAgdGhpcy5zdGF0ZS5zdXBlcldhc0NhbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgYXNzZXJ0KHRoaXMuc3RhdGUuc3VwZXJXYXNDYWxsZWQsXG4gICAgICAnTGF5ZXIgbXVzdCBjYWxsIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpJyk7XG5cbiAgICAvLyBBZGQgYW55IHByaW1pdGl2ZSBhdHRyaWJ1dGVzXG4gICAgdGhpcy5faW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKTtcblxuICAgIC8vIFRPRE8gLSB0aGUgYXBwIG11c3QgYmUgYWJsZSB0byBvdmVycmlkZVxuXG4gICAgLy8gQWRkIGFueSBzdWJjbGFzcyBhdHRyaWJ1dGVzXG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHRoaXMucHJvcHMpO1xuICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcblxuICAgIC8vIENyZWF0ZSBhIG1vZGVsIGZvciB0aGUgbGF5ZXJcbiAgICB0aGlzLl9jcmVhdGVNb2RlbCh7Z2x9KTtcblxuICAgIC8vIENhbGwgbGlmZSBjeWNsZSBtZXRob2RcbiAgICB0aGlzLmRpZE1vdW50KCk7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGV4aXN0aW5nIGxheWVyIGlzIGdldHRpbmcgbmV3IHByb3BzXG4gIHVwZGF0ZUxheWVyKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIENhbGN1bGF0ZSBzdGFuZGFyZCBjaGFuZ2UgZmxhZ3NcbiAgICB0aGlzLmNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIENoZWNrIGlmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgLy8gTGV0IHRoZSBzdWJjbGFzcyBtYXJrIHdoYXQgaXMgbmVlZGVkIGZvciB1cGRhdGVcbiAgICAgIHRoaXMud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgICAgLy8gUnVuIHRoZSBhdHRyaWJ1dGUgdXBkYXRlcnNcbiAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyhuZXdQcm9wcyk7XG4gICAgICAvLyBVcGRhdGUgdGhlIHVuaWZvcm1zXG4gICAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkID0gZmFsc2U7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbWFuYWdlciB3aGVuIGxheWVyIGlzIGFib3V0IHRvIGJlIGRpc3Bvc2VkXG4gIC8vIE5vdGU6IG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhbGxlZCBvbiBhcHBsaWNhdGlvbiBzaHV0ZG93blxuICBmaW5hbGl6ZUxheWVyKCkge1xuICAgIHRoaXMud2lsbFVubW91bnQoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtSW5zdGFuY2VzOyBpKyspIHtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSAoaSArIDEpICUgMjU2O1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAxXSA9IE1hdGguZmxvb3IoKGkgKyAxKSAvIDI1NikgJSAyNTY7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDJdID0gTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2IC8gMjU2KSAlIDI1NjtcbiAgICB9XG4gIH1cblxuICBkZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpIHtcbiAgICBhc3NlcnQoY29sb3IgaW5zdGFuY2VvZiBVaW50OEFycmF5KTtcbiAgICBjb25zdCBbaTEsIGkyLCBpM10gPSBjb2xvcjtcbiAgICBjb25zdCBpbmRleCA9IGkxICsgaTIgKiAyNTYgKyBpMyAqIDY1NTM2O1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIG9uSG92ZXIoaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uSG92ZXIoe2luZGV4LCAuLi5pbmZvfSk7XG4gIH1cblxuICBvbkNsaWNrKGluZm8pIHtcbiAgICBjb25zdCB7Y29sb3J9ID0gaW5mbztcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuZGVjb2RlUGlja2luZ0NvbG9yKGNvbG9yKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKHtpbmRleCwgLi4uaW5mb30pO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIFNldCB1cCBhdHRyaWJ1dGVzIHJlbGF0aW5nIHRvIHRoZSBwcmltaXRpdmUgaXRzZWxmIChub3QgdGhlIGluc3RhbmNlcylcbiAgX2luaXRpYWxpemVQcmltaXRpdmVBdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IHtnbCwgcHJpbWl0aXZlLCBhdHRyaWJ1dGVzfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge3ZlcnRpY2VzLCBub3JtYWxzLCBpbmRpY2VzfSA9IHByaW1pdGl2ZTtcblxuICAgIGNvbnN0IHh5eiA9IHsnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3onfTtcblxuICAgIGlmICh2ZXJ0aWNlcykge1xuICAgICAgYXR0cmlidXRlcy5hZGQoXG4gICAgICAgIHt2ZXJ0aWNlczoge3ZhbHVlOiB2ZXJ0aWNlcywgc2l6ZTogMywgLi4ueHl6fVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG5vcm1hbHMpIHtcbiAgICAgIGF0dHJpYnV0ZXMuYWRkKHtcbiAgICAgICAgbm9ybWFsczoge3ZhbHVlOiBub3JtYWxzLCBzaXplOiAzLCAuLi54eXp9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoaW5kaWNlcykge1xuICAgICAgYXR0cmlidXRlcy5hZGQoe1xuICAgICAgICBpbmRpY2VzOiB7XG4gICAgICAgICAgdmFsdWU6IGluZGljZXMsXG4gICAgICAgICAgc2l6ZTogMSxcbiAgICAgICAgICBidWZmZXJUeXBlOiBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUixcbiAgICAgICAgICBkcmF3VHlwZTogZ2wuU1RBVElDX0RSQVcsXG4gICAgICAgICAgJzAnOiAnaW5kZXgnXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVNb2RlbCh7Z2x9KSB7XG4gICAgY29uc3Qge3Byb2dyYW0sIGF0dHJpYnV0ZXMsIHVuaWZvcm1zfSA9IHRoaXMuc3RhdGU7XG5cbiAgICB0aGlzLnN0YXRlLm1vZGVsID0gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IHByb2dyYW0sXG4gICAgICBhdHRyaWJ1dGVzOiBhdHRyaWJ1dGVzLmdldEF0dHJpYnV0ZXMoKSxcbiAgICAgIHVuaWZvcm1zOiB1bmlmb3JtcyxcbiAgICAgIC8vIHdoZXRoZXIgY3VycmVudCBsYXllciByZXNwb25zZXMgdG8gbW91c2UgZXZlbnRzXG4gICAgICBwaWNrYWJsZTogdGhpcy5wcm9wcy5pc1BpY2thYmxlLFxuICAgICAgLy8gZ2V0IHJlbmRlciBmdW5jdGlvbiBwZXIgcHJpbWl0aXZlIChpbnN0YW5jZWQ/IGluZGV4ZWQ/KVxuICAgICAgcmVuZGVyOiB0aGlzLl9nZXRSZW5kZXJGdW5jdGlvbihnbClcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFNob3VsZCB0aGlzIGJlIG1vdmVkIHRvIHByb2dyYW1cbiAgX2dldFJlbmRlckZ1bmN0aW9uKGdsKSB7XG4gICAgLy8gXCJDYXB0dXJlXCIgc3RhdGUgYXMgaXQgd2lsbCBiZSBzZXQgdG8gbnVsbCB3aGVuIGxheWVyIGlzIGRpc3Bvc2VkXG4gICAgY29uc3Qge3N0YXRlfSA9IHRoaXM7XG4gICAgY29uc3Qge3ByaW1pdGl2ZX0gPSBzdGF0ZTtcbiAgICBjb25zdCB7c2VsZn0gPSBzdGF0ZTtcbiAgICBjb25zdCBkcmF3VHlwZSA9IHByaW1pdGl2ZS5kcmF3VHlwZSA/XG4gICAgICBnbC5nZXQocHJpbWl0aXZlLmRyYXdUeXBlKSA6IGdsLlBPSU5UUztcblxuICAgIGNvbnN0IG51bUluZGljZXMgPSBwcmltaXRpdmUuaW5kaWNlcyA/IHByaW1pdGl2ZS5pbmRpY2VzLmxlbmd0aCA6IDA7XG4gICAgY29uc3QgbnVtVmVydGljZXMgPSBwcmltaXRpdmUudmVydGljZXMgPyBwcmltaXRpdmUudmVydGljZXMubGVuZ3RoIDogMDtcblxuICAgIGlmIChwcmltaXRpdmUuaW5zdGFuY2VkKSB7XG4gICAgICBjb25zdCBleHRlbnNpb24gPSBnbC5nZXRFeHRlbnNpb24oJ0FOR0xFX2luc3RhbmNlZF9hcnJheXMnKTtcblxuICAgICAgaWYgKHByaW1pdGl2ZS5pbmRpY2VzKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiBleHRlbnNpb24uZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgICAgZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwLCBzZWxmLmdldE51bUluc3RhbmNlcygpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICAvLyBlbHNlIGlmIHRoaXMucHJpbWl0aXZlIGRvZXMgbm90IGhhdmUgaW5kaWNlc1xuICAgICAgcmV0dXJuICgpID0+IGV4dGVuc2lvbi5kcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUoXG4gICAgICAgIGRyYXdUeXBlLCAwLCBudW1WZXJ0aWNlcyAvIDMsIHNlbGYuZ2V0TnVtSW5zdGFuY2VzKClcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucHJpbWl0aXZlLmluZGljZXMpIHtcbiAgICAgIHJldHVybiAoKSA9PiBnbC5kcmF3RWxlbWVudHMoZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICB9XG4gICAgLy8gZWxzZSBpZiB0aGlzLnByaW1pdGl2ZSBkb2VzIG5vdCBoYXZlIGluZGljZXNcbiAgICByZXR1cm4gKCkgPT4gZ2wuZHJhd0FycmF5cyhkcmF3VHlwZSwgMCwgc2VsZi5nZXROdW1JbnN0YW5jZXMoKSk7XG4gIH1cblxuICBjaGVja1Byb3AocHJvcGVydHksIHByb3BlcnR5TmFtZSkge1xuICAgIGlmICghcHJvcGVydHkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvcGVydHkgJHtwcm9wZXJ0eU5hbWV9IHVuZGVmaW5lZCBpbiBsYXllciAke3RoaXMuaWR9YCk7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==