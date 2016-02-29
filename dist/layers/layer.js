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
  onObjectHovered: function onObjectHovered() {},
  onObjectClicked: function onObjectClicked() {}
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
        numInstances: this.getNumInstances(),
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
    value: function shouldUpdate(newProps) {
      var oldProps = this.props;
      return !(0, _util.areEqualShallow)(newProps, oldProps);
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
    value: function getNumInstances() {
      // First check if the layer has set its own value
      if (this.state && this.state.numInstances !== undefined) {
        return this.state.numInstances;
      }

      // Check if app has set an explicit value
      if (this.props.numInstances) {
        return this.props.numInstances;
      }

      var data = this.props.data;

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
      // Figure out data length
      var numInstances = this.getNumInstances(newProps);
      if (numInstances !== this.state.numInstances) {
        this.state.dataChanged = true;
      }
      this.setState({
        numInstances: numInstances
      });

      // Setup update flags, used to prevent unnecessary calculations
      // TODO non-instanced layer cannot use .data.length for equal check
      if (newProps.deepCompare) {
        this.state.dataChanged = !(0, _lodash2.default)(newProps.data, oldProps.data);
      } else {
        this.state.dataChanged = newProps.data.length !== oldProps.data.length;
      }
    }
  }, {
    key: 'updateAttributes',
    value: function updateAttributes() {
      var attributes = this.state.attributes;

      var numInstances = this.getNumInstances(this.props);

      // Figure out data length
      attributes.update({
        numInstances: numInstances,
        bufferMap: this.props,
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
      this.updateAttributes();
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
        this.updateAttributes();
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

      var drawType = primitive.drawType ? gl.get(primitive.drawType) : gl.POINTS;

      var numIndices = primitive.indices ? primitive.indices.length : 0;
      var numVertices = primitive.vertices ? primitive.vertices.length : 0;

      if (primitive.instanced) {
        var _ret = function () {
          var extension = gl.getExtension('ANGLE_instanced_arrays');

          if (primitive.indices) {
            return {
              v: function v() {
                return extension.drawElementsInstancedANGLE(drawType, numIndices, gl.UNSIGNED_SHORT, 0, state.numInstances);
              }
            };
          }
          // else if this.primitive does not have indices
          return {
            v: function v() {
              return extension.drawArraysInstancedANGLE(drawType, 0, numVertices / 3, state.numInstances);
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
        return gl.drawArrays(drawType, 0, state.numInstances);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9DQSxJQUFNLGdCQUFnQjtBQUNwQixPQUFLLENBQUw7QUFDQSxXQUFTLEdBQVQ7QUFDQSxnQkFBYyxTQUFkO0FBQ0EsY0FBWSxFQUFaO0FBQ0EsUUFBTSxFQUFOO0FBQ0EsY0FBWSxLQUFaO0FBQ0EsZUFBYSxLQUFiO0FBQ0EsWUFBVTtXQUFLO0dBQUw7QUFDVixtQkFBaUIsMkJBQU0sRUFBTjtBQUNqQixtQkFBaUIsMkJBQU0sRUFBTjtDQVZiOztBQWFOLElBQU0sYUFBYTtBQUNqQixpQkFBZSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssU0FBTCxFQUFnQixLQUFLLFdBQUwsRUFBa0IsS0FBSyxVQUFMLEVBQTNEO0NBREk7O0FBSU4sSUFBSSxRQUFRLENBQVI7O0lBRWlCOzs7d0JBRUs7QUFDdEIsYUFBTyxVQUFQLENBRHNCOzs7Ozs7Ozs7Ozs7OztBQVl4QixXQWRtQixLQWNuQixDQUFZLEtBQVosRUFBbUI7MEJBZEEsT0FjQTs7QUFFakIseUJBQ0ssZUFDQSxNQUZMOzs7O0FBRmlCLFFBU2IsTUFBTSxJQUFOLEVBQVk7QUFDZCw2QkFBWSxNQUFNLElBQU4sQ0FBWixDQURjO0FBRWQsNEJBQU8sTUFBTSxJQUFOLENBQVcsT0FBTyxRQUFQLENBQWxCLEVBQW9DLGlDQUFwQyxFQUZjO0tBQWhCOztBQUtBLFNBQUssU0FBTCxDQUFlLE1BQU0sSUFBTixFQUFZLE1BQTNCLEVBZGlCO0FBZWpCLFNBQUssU0FBTCxDQUFlLE1BQU0sRUFBTixFQUFVLElBQXpCLEVBZmlCO0FBZ0JqQixTQUFLLFNBQUwsQ0FBZSxNQUFNLEtBQU4sRUFBYSxPQUE1QixFQWhCaUI7QUFpQmpCLFNBQUssU0FBTCxDQUFlLE1BQU0sTUFBTixFQUFjLFFBQTdCLEVBakJpQjs7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RyxjQUFILEVBQW1CLENBQXpEO1NBQU4sQ0FEeUI7T0FBbEM7O0FBeEJxQixhQTRCZDtlQUFNLEdBQUcsVUFBSCxDQUFjLFFBQWQsRUFBd0IsQ0FBeEIsRUFBMkIsTUFBTSxZQUFOO09BQWpDLENBNUJjOzs7OzhCQStCYixVQUFVLGNBQWM7QUFDaEMsVUFBSSxDQUFDLFFBQUQsRUFBVztBQUNiLGNBQU0sSUFBSSxLQUFKLGVBQXNCLHdDQUFtQyxLQUFLLEVBQUwsQ0FBL0QsQ0FEYTtPQUFmOzs7O1NBM1lpQiIsImZpbGUiOiJsYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIGd1YXJkLWZvci1pbiAqL1xuaW1wb3J0IEF0dHJpYnV0ZXMgZnJvbSAnLi4vYXR0cmlidXRlcyc7XG5pbXBvcnQge01vZGVsfSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB7YXJlRXF1YWxTaGFsbG93fSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7YWRkSXRlcmF0b3J9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IGlzRGVlcEVxdWFsIGZyb20gJ2xvZGFzaC5pc2VxdWFsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcblxuLypcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5pZCAtIGxheWVyIG5hbWVcbiAqIEBwYXJhbSB7YXJyYXl9ICBwcm9wcy5kYXRhIC0gYXJyYXkgb2YgZGF0YSBpbnN0YW5jZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy53aWR0aCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLmhlaWdodCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5pc1BpY2thYmxlIC0gd2hldGhlciBsYXllciByZXNwb25zZSB0byBtb3VzZSBldmVudFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5vcGFjaXR5IC0gb3BhY2l0eSBvZiB0aGUgbGF5ZXJcbiAqL1xuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAga2V5OiAwLFxuICBvcGFjaXR5OiAwLjgsXG4gIG51bUluc3RhbmNlczogdW5kZWZpbmVkLFxuICBhdHRyaWJ1dGVzOiB7fSxcbiAgZGF0YTogW10sXG4gIGlzUGlja2FibGU6IGZhbHNlLFxuICBkZWVwQ29tcGFyZTogZmFsc2UsXG4gIGdldFZhbHVlOiB4ID0+IHgsXG4gIG9uT2JqZWN0SG92ZXJlZDogKCkgPT4ge30sXG4gIG9uT2JqZWN0Q2xpY2tlZDogKCkgPT4ge31cbn07XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxubGV0IGNvdW50ID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEJhc2UgTGF5ZXIgY2xhc3NcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyAtIFNlZSBkb2NzIGFib3ZlXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG4gICAgcHJvcHMgPSB7XG4gICAgICAuLi5ERUZBVUxUX1BST1BTLFxuICAgICAgLi4ucHJvcHNcbiAgICB9O1xuXG4gICAgLy8gQWRkIGl0ZXJhdG9yIHRvIG9iamVjdHNcbiAgICAvLyBUT0RPIC0gTW9kaWZ5aW5nIHByb3BzIGlzIGFuIGFudGktcGF0dGVyblxuICAgIGlmIChwcm9wcy5kYXRhKSB7XG4gICAgICBhZGRJdGVyYXRvcihwcm9wcy5kYXRhKTtcbiAgICAgIGFzc2VydChwcm9wcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0sICdkYXRhIHByb3AgbXVzdCBoYXZlIGFuIGl0ZXJhdG9yJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuZGF0YSwgJ2RhdGEnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5pZCwgJ2lkJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY291bnQgPSBjb3VudCsrO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMgKi9cblxuICAvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBMSUZFQ1lDTEUgTUVUSE9EUywgb3ZlcnJpZGRlbiBieSB0aGUgbGF5ZXIgc3ViY2xhc3Nlc1xuXG4gIC8vIENhbGxlZCBvbmNlIHRvIHNldCB1cCB0aGUgaW5pdGlhbCBzdGF0ZVxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRyaWJ1dGVzOiBuZXcgQXR0cmlidXRlcyh7aWQ6IHRoaXMucHJvcHMuaWR9KSxcbiAgICAgIG1vZGVsOiBudWxsLFxuICAgICAgdW5pZm9ybXM6IHt9LFxuICAgICAgbmVlZHNSZWRyYXc6IHRydWUsXG4gICAgICBudW1JbnN0YW5jZXM6IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKCksXG4gICAgICBkYXRhQ2hhbmdlZDogdHJ1ZSxcbiAgICAgIHN1cGVyV2FzQ2FsbGVkOiB0cnVlXG4gICAgfSk7XG5cbiAgICBjb25zdCB7YXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuICAgIC8vIEFsbCBpbnN0YW5jZWQgbGF5ZXJzIGdldCBwaWNraW5nQ29sb3JzIGF0dHJpYnV0ZSBieSBkZWZhdWx0XG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcGlja2luZ0NvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzLCB3aGVuOiAncmVhbGxvYyd9XG4gICAgfSk7XG4gIH1cblxuICAvLyBnbCBjb250ZXh0IGlzIG5vdyBhdmFpbGFibGVcbiAgZGlkTW91bnQoKSB7XG4gIH1cblxuICBzaG91bGRVcGRhdGUobmV3UHJvcHMpIHtcbiAgICBjb25zdCBvbGRQcm9wcyA9IHRoaXMucHJvcHM7XG4gICAgcmV0dXJuICFhcmVFcXVhbFNoYWxsb3cobmV3UHJvcHMsIG9sZFByb3BzKTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaW1wbGVtZW50YXRpb24sIGFsbCBhdHRyaWJ1dGVzIHdpbGwgYmUgdXBkYXRlZFxuICB3aWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBhdHRyaWJ1dGVzLmludmFsaWRhdGVBbGwoKTtcbiAgfVxuXG4gIC8vIGdsIGNvbnRleHQgc3RpbGwgYXZhaWxhYmxlXG4gIHdpbGxVbm1vdW50KCkge1xuICB9XG5cbiAgLy8gRU5EIExJRkVDWUNMRSBNRVRIT0RTXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gUHVibGljIEFQSVxuXG4gIGdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBsZXQgbmVlZHNSZWRyYXcgPSBhdHRyaWJ1dGVzLmdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KTtcbiAgICBuZWVkc1JlZHJhdyA9IG5lZWRzUmVkcmF3IHx8IHRoaXMubmVlZHNSZWRyYXc7XG4gICAgaWYgKGNsZWFyRmxhZykge1xuICAgICAgdGhpcy5uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbmVlZHNSZWRyYXc7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRTdGF0ZSh1cGRhdGVPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHVwZGF0ZU9iamVjdCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRVbmlmb3Jtcyh1bmlmb3JtTWFwKSB7XG4gICAgdGhpcy5fY2hlY2tVbmlmb3Jtcyh1bmlmb3JtTWFwKTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUudW5pZm9ybXMsIHVuaWZvcm1NYXApO1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICB9XG5cbiAgLy8gVE9ETyAtIE1vdmUgaW50byBsdW1hLmdsLCBhbmQgY2hlY2sgYWdhaW5zdCBkZWZpbml0aW9uc1xuICBfY2hlY2tVbmlmb3Jtcyh1bmlmb3JtTWFwKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdW5pZm9ybU1hcCkge1xuICAgICAgY29uc3QgdmFsdWUgPSB1bmlmb3JtTWFwW2tleV07XG4gICAgICB0aGlzLl9jaGVja1VuaWZvcm1WYWx1ZShrZXksIHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tVbmlmb3JtVmFsdWUodW5pZm9ybSwgdmFsdWUpIHtcbiAgICBmdW5jdGlvbiBpc051bWJlcih2KSB7XG4gICAgICByZXR1cm4gIWlzTmFOKHYpICYmIE51bWJlcih2KSA9PT0gdiAmJiB2ICE9PSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IG9rID0gdHJ1ZTtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgfHwgdmFsdWUgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB2YWx1ZSkge1xuICAgICAgICBpZiAoIWlzTnVtYmVyKGVsZW1lbnQpKSB7XG4gICAgICAgICAgb2sgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWlzTnVtYmVyKHZhbHVlKSkge1xuICAgICAgb2sgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKCFvaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3RoaXMucHJvcHMuaWR9IEJhZCB1bmlmb3JtICR7dW5pZm9ybX1gLCB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXNlIGl0ZXJhdGlvbiAodGhlIG9ubHkgcmVxdWlyZWQgY2FwYWJpbGl0eSBvbiBkYXRhKSB0byBnZXQgZmlyc3QgZWxlbWVudFxuICBnZXRGaXJzdE9iamVjdCgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIERlZHVjZXMgbnVtZXIgb2YgaW5zdGFuY2VzLiBJbnRlbnRpb24gaXMgdG8gc3VwcG9ydDpcbiAgLy8gLSBFeHBsaWNpdCBzZXR0aW5nIG9mIG51bUluc3RhbmNlc1xuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIHNpemUgbWVtYmVyXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIENsYXNzaWMgQXJyYXlzIHZpYSB0aGUgYnVpbHQtaW4gbGVuZ3RoIGF0dHJpYnV0ZVxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIHZpYSBhcnJheXNcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiB2aWEgaXRlcmF0aW9uXG4gIGdldE51bUluc3RhbmNlcygpIHtcbiAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGUgbGF5ZXIgaGFzIHNldCBpdHMgb3duIHZhbHVlXG4gICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGFwcCBoYXMgc2V0IGFuIGV4cGxpY2l0IHZhbHVlXG4gICAgaWYgKHRoaXMucHJvcHMubnVtSW5zdGFuY2VzKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9wcy5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcblxuICAgIC8vIENoZWNrIGlmIGFycmF5IGxlbmd0aCBhdHRyaWJ1dGUgaXMgc2V0IG9uIGRhdGFcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZGF0YS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICAgIGlmIChkYXRhICYmIGRhdGEuc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZGF0YS5zaXplO1xuICAgIH1cblxuICAgIC8vIFRPRE8gLSBzbG93LCB3ZSBwcm9iYWJseSBzaG91bGQgbm90IHN1cHBvcnQgdGhpcyB1bmxlc3NcbiAgICAvLyB3ZSBsaW1pdCB0aGUgbnVtYmVyIG9mIGludm9jYXRpb25zXG4gICAgLy9cbiAgICAvLyBVc2UgaXRlcmF0aW9uIHRvIGNvdW50IG9iamVjdHNcbiAgICAvLyBsZXQgY291bnQgPSAwO1xuICAgIC8vIC8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG4gICAgLy8gZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgIC8vICAgY291bnQrKztcbiAgICAvLyB9XG4gICAgLy8gcmV0dXJuIGNvdW50O1xuXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZGVkdWNlIG51bUluc3RhbmNlcycpO1xuICB9XG5cbiAgLy8gSW50ZXJuYWwgSGVscGVyc1xuXG4gIGNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKG5ld1Byb3BzKTtcbiAgICBpZiAobnVtSW5zdGFuY2VzICE9PSB0aGlzLnN0YXRlLm51bUluc3RhbmNlcykge1xuICAgICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbnVtSW5zdGFuY2VzXG4gICAgfSk7XG5cbiAgICAvLyBTZXR1cCB1cGRhdGUgZmxhZ3MsIHVzZWQgdG8gcHJldmVudCB1bm5lY2Vzc2FyeSBjYWxjdWxhdGlvbnNcbiAgICAvLyBUT0RPIG5vbi1pbnN0YW5jZWQgbGF5ZXIgY2Fubm90IHVzZSAuZGF0YS5sZW5ndGggZm9yIGVxdWFsIGNoZWNrXG4gICAgaWYgKG5ld1Byb3BzLmRlZXBDb21wYXJlKSB7XG4gICAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gIWlzRGVlcEVxdWFsKG5ld1Byb3BzLmRhdGEsIG9sZFByb3BzLmRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gbmV3UHJvcHMuZGF0YS5sZW5ndGggIT09IG9sZFByb3BzLmRhdGEubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBudW1JbnN0YW5jZXMgPSB0aGlzLmdldE51bUluc3RhbmNlcyh0aGlzLnByb3BzKTtcblxuICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICBhdHRyaWJ1dGVzLnVwZGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBidWZmZXJNYXA6IHRoaXMucHJvcHMsXG4gICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgLy8gRG9uJ3Qgd29ycnkgYWJvdXQgbm9uLWF0dHJpYnV0ZSBwcm9wc1xuICAgICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXM6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgLy8gYXBwbHkgZ2FtbWEgdG8gb3BhY2l0eSB0byBtYWtlIGl0IHZpc3VhbGx5IFwibGluZWFyXCJcbiAgICAgIG9wYWNpdHk6IE1hdGgucG93KHRoaXMucHJvcHMub3BhY2l0eSB8fCAwLjgsIDEgLyAyLjIpXG4gICAgfSk7XG4gIH1cblxuICAvLyBMQVlFUiBNQU5BR0VSIEFQSVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gYSBuZXcgbGF5ZXIgaXMgZm91bmRcbiAgaW5pdGlhbGl6ZUxheWVyKHtnbH0pIHtcbiAgICBhc3NlcnQoZ2wpO1xuICAgIHRoaXMuc3RhdGUgPSB7Z2x9O1xuXG4gICAgLy8gSW5pdGlhbGl6ZSBzdGF0ZSBvbmx5IG9uY2VcbiAgICAvLyBOb3RlOiBNdXN0IGFsd2F5cyBjYWxsIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpIHdoZW4gb3ZlcnJpZGluZyFcbiAgICB0aGlzLnN0YXRlLnN1cGVyV2FzQ2FsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5pbml0aWFsaXplU3RhdGUoKTtcbiAgICBhc3NlcnQodGhpcy5zdGF0ZS5zdXBlcldhc0NhbGxlZCxcbiAgICAgICdMYXllciBtdXN0IGNhbGwgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCknKTtcblxuICAgIC8vIEFkZCBhbnkgcHJpbWl0aXZlIGF0dHJpYnV0ZXNcbiAgICB0aGlzLl9pbml0aWFsaXplUHJpbWl0aXZlQXR0cmlidXRlcygpO1xuXG4gICAgLy8gVE9ETyAtIHRoZSBhcHAgbXVzdCBiZSBhYmxlIHRvIG92ZXJyaWRlXG5cbiAgICAvLyBBZGQgYW55IHN1YmNsYXNzIGF0dHJpYnV0ZXNcbiAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoKTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG5cbiAgICAvLyBDcmVhdGUgYSBtb2RlbCBmb3IgdGhlIGxheWVyXG4gICAgdGhpcy5fY3JlYXRlTW9kZWwoe2dsfSk7XG5cbiAgICAvLyBDYWxsIGxpZmUgY3ljbGUgbWV0aG9kXG4gICAgdGhpcy5kaWRNb3VudCgpO1xuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IGxheWVyIG1hbmFnZXIgd2hlbiBleGlzdGluZyBsYXllciBpcyBnZXR0aW5nIG5ldyBwcm9wc1xuICB1cGRhdGVMYXllcihvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBDYWxjdWxhdGUgc3RhbmRhcmQgY2hhbmdlIGZsYWdzXG4gICAgdGhpcy5jaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBDaGVjayBpZiBhbnkgcHJvcHMgaGF2ZSBjaGFuZ2VkXG4gICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykpIHtcbiAgICAgIC8vIExldCB0aGUgc3ViY2xhc3MgbWFyayB3aGF0IGlzIG5lZWRlZCBmb3IgdXBkYXRlXG4gICAgICB0aGlzLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICAgIC8vIFJ1biB0aGUgYXR0cmlidXRlIHVwZGF0ZXJzXG4gICAgICB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoKTtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdW5pZm9ybXNcbiAgICAgIHRoaXMudXBkYXRlVW5pZm9ybXMoKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBtYW5hZ2VyIHdoZW4gbGF5ZXIgaXMgYWJvdXQgdG8gYmUgZGlzcG9zZWRcbiAgLy8gTm90ZTogbm90IGd1YXJhbnRlZWQgdG8gYmUgY2FsbGVkIG9uIGFwcGxpY2F0aW9uIHNodXRkb3duXG4gIGZpbmFsaXplTGF5ZXIoKSB7XG4gICAgdGhpcy53aWxsVW5tb3VudCgpO1xuICB9XG5cbiAgY2FsY3VsYXRlUGlja2luZ0NvbG9ycyhhdHRyaWJ1dGUsIG51bUluc3RhbmNlcykge1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IChpICsgMSkgJSAyNTY7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2KSAlIDI1NjtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYgLyAyNTYpICUgMjU2O1xuICAgIH1cbiAgfVxuXG4gIGRlY29kZVBpY2tpbmdDb2xvcihjb2xvcikge1xuICAgIGFzc2VydChjb2xvciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICAgIGNvbnN0IFtpMSwgaTIsIGkzXSA9IGNvbG9yO1xuICAgIGNvbnN0IGluZGV4ID0gaTEgKyBpMiAqIDI1NiArIGkzICogNjU1MzY7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgb25Ib3ZlcihpbmZvKSB7XG4gICAgY29uc3Qge2NvbG9yfSA9IGluZm87XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmRlY29kZVBpY2tpbmdDb2xvcihjb2xvcik7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Ib3Zlcih7aW5kZXgsIC4uLmluZm99KTtcbiAgfVxuXG4gIG9uQ2xpY2soaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ2xpY2soe2luZGV4LCAuLi5pbmZvfSk7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gU2V0IHVwIGF0dHJpYnV0ZXMgcmVsYXRpbmcgdG8gdGhlIHByaW1pdGl2ZSBpdHNlbGYgKG5vdCB0aGUgaW5zdGFuY2VzKVxuICBfaW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3Qge2dsLCBwcmltaXRpdmUsIGF0dHJpYnV0ZXN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7dmVydGljZXMsIG5vcm1hbHMsIGluZGljZXN9ID0gcHJpbWl0aXZlO1xuXG4gICAgY29uc3QgeHl6ID0geycwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAneid9O1xuXG4gICAgaWYgKHZlcnRpY2VzKSB7XG4gICAgICBhdHRyaWJ1dGVzLmFkZChcbiAgICAgICAge3ZlcnRpY2VzOiB7dmFsdWU6IHZlcnRpY2VzLCBzaXplOiAzLCAuLi54eXp9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAobm9ybWFscykge1xuICAgICAgYXR0cmlidXRlcy5hZGQoe1xuICAgICAgICBub3JtYWxzOiB7dmFsdWU6IG5vcm1hbHMsIHNpemU6IDMsIC4uLnh5en1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChpbmRpY2VzKSB7XG4gICAgICBhdHRyaWJ1dGVzLmFkZCh7XG4gICAgICAgIGluZGljZXM6IHtcbiAgICAgICAgICB2YWx1ZTogaW5kaWNlcyxcbiAgICAgICAgICBzaXplOiAxLFxuICAgICAgICAgIGJ1ZmZlclR5cGU6IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLFxuICAgICAgICAgIGRyYXdUeXBlOiBnbC5TVEFUSUNfRFJBVyxcbiAgICAgICAgICAnMCc6ICdpbmRleCdcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZU1vZGVsKHtnbH0pIHtcbiAgICBjb25zdCB7cHJvZ3JhbSwgYXR0cmlidXRlcywgdW5pZm9ybXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc3RhdGUubW9kZWwgPSBuZXcgTW9kZWwoe1xuICAgICAgcHJvZ3JhbTogcHJvZ3JhbSxcbiAgICAgIGF0dHJpYnV0ZXM6IGF0dHJpYnV0ZXMuZ2V0QXR0cmlidXRlcygpLFxuICAgICAgdW5pZm9ybXM6IHVuaWZvcm1zLFxuICAgICAgLy8gd2hldGhlciBjdXJyZW50IGxheWVyIHJlc3BvbnNlcyB0byBtb3VzZSBldmVudHNcbiAgICAgIHBpY2thYmxlOiB0aGlzLnByb3BzLmlzUGlja2FibGUsXG4gICAgICAvLyBnZXQgcmVuZGVyIGZ1bmN0aW9uIHBlciBwcmltaXRpdmUgKGluc3RhbmNlZD8gaW5kZXhlZD8pXG4gICAgICByZW5kZXI6IHRoaXMuX2dldFJlbmRlckZ1bmN0aW9uKGdsKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gU2hvdWxkIHRoaXMgYmUgbW92ZWQgdG8gcHJvZ3JhbVxuICBfZ2V0UmVuZGVyRnVuY3Rpb24oZ2wpIHtcbiAgICAvLyBcIkNhcHR1cmVcIiBzdGF0ZSBhcyBpdCB3aWxsIGJlIHNldCB0byBudWxsIHdoZW4gbGF5ZXIgaXMgZGlzcG9zZWRcbiAgICBjb25zdCB7c3RhdGV9ID0gdGhpcztcbiAgICBjb25zdCB7cHJpbWl0aXZlfSA9IHN0YXRlO1xuICAgIGNvbnN0IGRyYXdUeXBlID0gcHJpbWl0aXZlLmRyYXdUeXBlID9cbiAgICAgIGdsLmdldChwcmltaXRpdmUuZHJhd1R5cGUpIDogZ2wuUE9JTlRTO1xuXG4gICAgY29uc3QgbnVtSW5kaWNlcyA9IHByaW1pdGl2ZS5pbmRpY2VzID8gcHJpbWl0aXZlLmluZGljZXMubGVuZ3RoIDogMDtcbiAgICBjb25zdCBudW1WZXJ0aWNlcyA9IHByaW1pdGl2ZS52ZXJ0aWNlcyA/IHByaW1pdGl2ZS52ZXJ0aWNlcy5sZW5ndGggOiAwO1xuXG4gICAgaWYgKHByaW1pdGl2ZS5pbnN0YW5jZWQpIHtcbiAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbignQU5HTEVfaW5zdGFuY2VkX2FycmF5cycpO1xuXG4gICAgICBpZiAocHJpbWl0aXZlLmluZGljZXMpIHtcbiAgICAgICAgcmV0dXJuICgpID0+IGV4dGVuc2lvbi5kcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRShcbiAgICAgICAgICBkcmF3VHlwZSwgbnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDAsIHN0YXRlLm51bUluc3RhbmNlc1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZiB0aGlzLnByaW1pdGl2ZSBkb2VzIG5vdCBoYXZlIGluZGljZXNcbiAgICAgIHJldHVybiAoKSA9PiBleHRlbnNpb24uZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFKFxuICAgICAgICBkcmF3VHlwZSwgMCwgbnVtVmVydGljZXMgLyAzLCBzdGF0ZS5udW1JbnN0YW5jZXNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc3RhdGUucHJpbWl0aXZlLmluZGljZXMpIHtcbiAgICAgIHJldHVybiAoKSA9PiBnbC5kcmF3RWxlbWVudHMoZHJhd1R5cGUsIG51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICB9XG4gICAgLy8gZWxzZSBpZiB0aGlzLnByaW1pdGl2ZSBkb2VzIG5vdCBoYXZlIGluZGljZXNcbiAgICByZXR1cm4gKCkgPT4gZ2wuZHJhd0FycmF5cyhkcmF3VHlwZSwgMCwgc3RhdGUubnVtSW5zdGFuY2VzKTtcbiAgfVxuXG4gIGNoZWNrUHJvcChwcm9wZXJ0eSwgcHJvcGVydHlOYW1lKSB7XG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAke3Byb3BlcnR5TmFtZX0gdW5kZWZpbmVkIGluIGxheWVyICR7dGhpcy5pZH1gKTtcbiAgICB9XG4gIH1cblxufVxuIl19