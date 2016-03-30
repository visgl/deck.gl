'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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


var _attributeManager = require('./attribute-manager');

var _attributeManager2 = _interopRequireDefault(_attributeManager);

var _flatWorld = require('./flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _util = require('./util');

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

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
    value: function initializeState() {}

    // gl context is now available

  }, {
    key: 'didMount',
    value: function didMount() {}
  }, {
    key: 'shouldUpdate',
    value: function shouldUpdate(oldProps, newProps) {
      // If any props have changed
      if (!(0, _util.areEqualShallow)(newProps, oldProps)) {

        if (newProps.data !== oldProps.data) {
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

    // Default implementation, all attributeManager will be updated

  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(newProps) {
      var attributeManager = this.state.attributeManager;

      if (this.state.dataChanged) {
        attributeManager.invalidateAll();
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

      // this method may be called by the render loop as soon a the layer
      // has been created, so guard against uninitialized state
      if (!this.state) {
        return false;
      }

      var attributeManager = this.state.attributeManager;

      var needsRedraw = attributeManager.getNeedsRedraw({ clearFlag: clearFlag });
      needsRedraw = needsRedraw || this.state.needsRedraw;
      if (clearFlag) {
        this.state.needsRedraw = false;
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
      if (this.state.model) {
        this.state.model.setUniforms(uniformMap);
      }
      // TODO - set needsRedraw on the model?
      this.state.needsRedraw = true;
      (0, _log2.default)(3, 'layer.setUniforms', uniformMap);
    }

    // Use iteration (the only required capability on data) to get first element

  }, {
    key: 'getFirstObject',
    value: function getFirstObject() {
      var data = this.props.data;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          return object;
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
      var attributeManager = this.state.attributeManager;

      var numInstances = this.getNumInstances(props);
      // Figure out data length
      attributeManager.update({
        numInstances: numInstances,
        bufferMap: props,
        context: this,
        // Don't worry about non-attribute props
        ignoreUnknownAttributes: true
      });
    }
  }, {
    key: 'updateBaseUniforms',
    value: function updateBaseUniforms() {
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
      this.setState({
        attributeManager: new _attributeManager2.default({ id: this.props.id }),
        model: null,
        needsRedraw: true,
        dataChanged: true
      });

      var attributeManager = this.state.attributeManager;
      // All instanced layers get pickingColors attribute by default
      // Their shaders can use it to render a picking scene

      attributeManager.addInstanced(ATTRIBUTES, {
        pickingColors: { update: this.calculatePickingColors }
      });

      this.setViewport();
      this.initializeState();
      (0, _assert2.default)(this.state.model, 'Model must be set in initializeState');
      this.setViewport();

      // Add any primitive attributes
      this._initializePrimitiveAttributes();

      // TODO - the app must be able to override

      // Add any subclass attributes
      this.updateAttributes(this.props);
      this.updateBaseUniforms();
      this.state.model.setInstanceCount(this.getNumInstances());

      // Create a model for the layer
      this._updateModel({ gl: gl });

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
        this.updateBaseUniforms();

        this.state.model.setInstanceCount(this.getNumInstances());
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
      var model = _state.model;
      var attributeManager = _state.attributeManager;

      // TODO - this unpacks and repacks the attributes, seems unnecessary

      if (model.geometry.hasAttribute('vertices')) {
        var vertices = model.geometry.getArray('vertices');
        attributeManager.addVertices(vertices);
      }

      if (model.geometry.hasAttribute('normals')) {
        var normals = model.geometry.getArray('normals');
        attributeManager.addNormals(normals);
      }

      if (model.geometry.hasAttribute('indices')) {
        var indices = model.geometry.getArray('indices');
        attributeManager.addIndices(indices, gl);
      }
    }
  }, {
    key: '_updateModel',
    value: function _updateModel(_ref3) {
      var gl = _ref3.gl;
      var _state2 = this.state;
      var model = _state2.model;
      var attributeManager = _state2.attributeManager;
      var uniforms = _state2.uniforms;


      (0, _assert2.default)(model);
      model.setAttributes(attributeManager.getAttributes());
      model.setUniforms(uniforms);
      // whether current layer responds to mouse events
      model.setPickable(this.props.isPickable);
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

    /**
     * Position conversion is done in shader, so in many cases there is no need
     * for this function
     * @param {Object|Array} latLng - Either [lat,lng] or {lat, lon}
     * @return {Object} - x, y
     */

  }, {
    key: 'project',
    value: function project(latLng) {
      var mercator = this.state.mercator;

      var _ref4 = Array.isArray(latLng) ? mercator.project([latLng[1], latLng[0]]) : mercator.project([latLng.lon, latLng.lat]);

      var _ref5 = _slicedToArray(_ref4, 2);

      var x = _ref5[0];
      var y = _ref5[1];

      return { x: x, y: y };
    }
  }, {
    key: 'screenToSpace',
    value: function screenToSpace(_ref6) {
      var x = _ref6.x;
      var y = _ref6.y;
      var viewport = this.state.viewport;

      return viewport.screenToSpace({ x: x, y: y });
    }
  }]);

  return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,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QUF0QixFQUE0QixvQkFBVSxJQUFWLENBQXpDO09BRkYsRUFWWTtBQWNaLHlCQUFJLENBQUosRUFBTyxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBQXFCLFFBQTVCLEVBQXNDLFNBQXRDLEVBQWlELElBQWpELEVBZFk7Ozs7Ozs7Ozs7Ozs0QkF1Qk4sUUFBUTtVQUNQLFdBQVksS0FBSyxLQUFMLENBQVosU0FETzs7a0JBRUMsTUFBTSxPQUFOLENBQWMsTUFBZCxJQUNiLFNBQVMsT0FBVCxDQUFpQixDQUFDLE9BQU8sQ0FBUCxDQUFELEVBQVksT0FBTyxDQUFQLENBQVosQ0FBakIsQ0FEYSxHQUViLFNBQVMsT0FBVCxDQUFpQixDQUFDLE9BQU8sR0FBUCxFQUFZLE9BQU8sR0FBUCxDQUE5QixDQUZhLENBRkQ7Ozs7VUFFUCxhQUZPO1VBRUosYUFGSTs7QUFLZCxhQUFPLEVBQUMsSUFBRCxFQUFJLElBQUosRUFBUCxDQUxjOzs7O3lDQVFNO1VBQVAsWUFBTztVQUFKLFlBQUk7VUFDYixXQUFZLEtBQUssS0FBTCxDQUFaLFNBRGE7O0FBRXBCLGFBQU8sU0FBUyxhQUFULENBQXVCLEVBQUMsSUFBRCxFQUFJLElBQUosRUFBdkIsQ0FBUCxDQUZvQjs7OztTQWhaSCIsImZpbGUiOiJsYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIGd1YXJkLWZvci1pbiAqL1xuaW1wb3J0IEF0dHJpYnV0ZU1hbmFnZXIgZnJvbSAnLi9hdHRyaWJ1dGUtbWFuYWdlcic7XG5pbXBvcnQgZmxhdFdvcmxkIGZyb20gJy4vZmxhdC13b3JsZCc7XG5pbXBvcnQge2FyZUVxdWFsU2hhbGxvd30gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7YWRkSXRlcmF0b3J9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBpc0RlZXBFcXVhbCBmcm9tICdsb2Rhc2guaXNlcXVhbCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgVmlld3BvcnRNZXJjYXRvciBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuLypcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5pZCAtIGxheWVyIG5hbWVcbiAqIEBwYXJhbSB7YXJyYXl9ICBwcm9wcy5kYXRhIC0gYXJyYXkgb2YgZGF0YSBpbnN0YW5jZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy53aWR0aCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLmhlaWdodCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5pc1BpY2thYmxlIC0gd2hldGhlciBsYXllciByZXNwb25zZSB0byBtb3VzZSBldmVudFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5vcGFjaXR5IC0gb3BhY2l0eSBvZiB0aGUgbGF5ZXJcbiAqL1xuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAga2V5OiAwLFxuICBvcGFjaXR5OiAwLjgsXG4gIG51bUluc3RhbmNlczogdW5kZWZpbmVkLFxuICBkYXRhOiBbXSxcbiAgaXNQaWNrYWJsZTogZmFsc2UsXG4gIGRlZXBDb21wYXJlOiBmYWxzZSxcbiAgZ2V0VmFsdWU6IHggPT4geCxcbiAgb25Ib3ZlcjogKCkgPT4ge30sXG4gIG9uQ2xpY2s6ICgpID0+IHt9XG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgJzAnOiAncGlja1JlZCcsICcxJzogJ3BpY2tHcmVlbicsICcyJzogJ3BpY2tCbHVlJ31cbn07XG5cbmxldCBjb3VudGVyID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEJhc2UgTGF5ZXIgY2xhc3NcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyAtIFNlZSBkb2NzIGFib3ZlXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG4gICAgcHJvcHMgPSB7XG4gICAgICAuLi5ERUZBVUxUX1BST1BTLFxuICAgICAgLi4ucHJvcHNcbiAgICB9O1xuXG4gICAgLy8gQWRkIGl0ZXJhdG9yIHRvIG9iamVjdHNcbiAgICAvLyBUT0RPIC0gTW9kaWZ5aW5nIHByb3BzIGlzIGFuIGFudGktcGF0dGVyblxuICAgIGlmIChwcm9wcy5kYXRhKSB7XG4gICAgICBhZGRJdGVyYXRvcihwcm9wcy5kYXRhKTtcbiAgICAgIGFzc2VydChwcm9wcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0sICdkYXRhIHByb3AgbXVzdCBoYXZlIGFuIGl0ZXJhdG9yJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuZGF0YSwgJ2RhdGEnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5pZCwgJ2lkJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmxhdGl0dWRlLCAnbGF0aXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5sb25naXR1ZGUsICdsb25naXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy56b29tLCAnem9vbScpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY291bnQgPSBjb3VudGVyKys7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIExJRkVDWUNMRSBNRVRIT0RTLCBvdmVycmlkZGVuIGJ5IHRoZSBsYXllciBzdWJjbGFzc2VzXG5cbiAgLy8gQ2FsbGVkIG9uY2UgdG8gc2V0IHVwIHRoZSBpbml0aWFsIHN0YXRlXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgfVxuXG4gIC8vIGdsIGNvbnRleHQgaXMgbm93IGF2YWlsYWJsZVxuICBkaWRNb3VudCgpIHtcbiAgfVxuXG4gIHNob3VsZFVwZGF0ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBJZiBhbnkgcHJvcHMgaGF2ZSBjaGFuZ2VkXG4gICAgaWYgKCFhcmVFcXVhbFNoYWxsb3cobmV3UHJvcHMsIG9sZFByb3BzKSkge1xuXG4gICAgICBpZiAobmV3UHJvcHMuZGF0YSAhPT0gb2xkUHJvcHMuZGF0YSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhQ2hhbmdlZDogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChuZXdQcm9wcy5kZWVwQ29tcGFyZSAmJiAhaXNEZWVwRXF1YWwobmV3UHJvcHMuZGF0YSwgb2xkUHJvcHMuZGF0YSkpIHtcbiAgICAgIC8vIFN1cHBvcnQgb3B0aW9uYWwgZGVlcCBjb21wYXJlIG9mIGRhdGFcbiAgICAgIC8vIE5vdGU6IHRoaXMgaXMgcXVpdGUgaW5lZmZpY2llbnQsIGFwcCBzaG91bGQgdXNlIGJ1ZmZlciBwcm9wcyBpbnN0ZWFkXG4gICAgICB0aGlzLnNldFN0YXRlKHtkYXRhQ2hhbmdlZDogdHJ1ZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaW1wbGVtZW50YXRpb24sIGFsbCBhdHRyaWJ1dGVNYW5hZ2VyIHdpbGwgYmUgdXBkYXRlZFxuICB3aWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBzdGlsbCBhdmFpbGFibGVcbiAgd2lsbFVubW91bnQoKSB7XG4gIH1cblxuICAvLyBFTkQgTElGRUNZQ0xFIE1FVEhPRFNcbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICAvLyB0aGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIGJ5IHRoZSByZW5kZXIgbG9vcCBhcyBzb29uIGEgdGhlIGxheWVyXG4gICAgLy8gaGFzIGJlZW4gY3JlYXRlZCwgc28gZ3VhcmQgYWdhaW5zdCB1bmluaXRpYWxpemVkIHN0YXRlXG4gICAgaWYgKCF0aGlzLnN0YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBsZXQgbmVlZHNSZWRyYXcgPSBhdHRyaWJ1dGVNYW5hZ2VyLmdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KTtcbiAgICBuZWVkc1JlZHJhdyA9IG5lZWRzUmVkcmF3IHx8IHRoaXMuc3RhdGUubmVlZHNSZWRyYXc7XG4gICAgaWYgKGNsZWFyRmxhZykge1xuICAgICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbmVlZHNSZWRyYXc7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRTdGF0ZSh1cGRhdGVPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHVwZGF0ZU9iamVjdCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRVbmlmb3Jtcyh1bmlmb3JtTWFwKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUubW9kZWwpIHtcbiAgICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0VW5pZm9ybXModW5pZm9ybU1hcCk7XG4gICAgfVxuICAgIC8vIFRPRE8gLSBzZXQgbmVlZHNSZWRyYXcgb24gdGhlIG1vZGVsP1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIGxvZygzLCAnbGF5ZXIuc2V0VW5pZm9ybXMnLCB1bmlmb3JtTWFwKTtcbiAgfVxuXG4gIC8vIFVzZSBpdGVyYXRpb24gKHRoZSBvbmx5IHJlcXVpcmVkIGNhcGFiaWxpdHkgb24gZGF0YSkgdG8gZ2V0IGZpcnN0IGVsZW1lbnRcbiAgZ2V0Rmlyc3RPYmplY3QoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICAvLyBEZWR1Y2VzIG51bWVyIG9mIGluc3RhbmNlcy4gSW50ZW50aW9uIGlzIHRvIHN1cHBvcnQ6XG4gIC8vIC0gRXhwbGljaXQgc2V0dGluZyBvZiBudW1JbnN0YW5jZXNcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgRVM2IGNvbnRhaW5lcnMgdGhhdCBkZWZpbmUgYSBzaXplIG1lbWJlclxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBDbGFzc2ljIEFycmF5cyB2aWEgdGhlIGJ1aWx0LWluIGxlbmd0aCBhdHRyaWJ1dGVcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiB2aWEgYXJyYXlzXG4gIGdldE51bUluc3RhbmNlcyhwcm9wcykge1xuICAgIHByb3BzID0gcHJvcHMgfHwgdGhpcy5wcm9wcztcblxuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZSBsYXllciBoYXMgc2V0IGl0cyBvd24gdmFsdWVcbiAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYXBwIGhhcyBzZXQgYW4gZXhwbGljaXQgdmFsdWVcbiAgICBpZiAocHJvcHMubnVtSW5zdGFuY2VzKSB7XG4gICAgICByZXR1cm4gcHJvcHMubnVtSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIGNvbnN0IHtkYXRhfSA9IHByb3BzO1xuXG4gICAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhLmNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZGF0YS5jb3VudCgpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgICBpZiAoZGF0YSAmJiBkYXRhLnNpemUpIHtcbiAgICAgIHJldHVybiBkYXRhLnNpemU7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYXJyYXkgbGVuZ3RoIGF0dHJpYnV0ZSBpcyBzZXQgb24gZGF0YVxuICAgIC8vIE5vdGU6IGNoZWNraW5nIHRoaXMgbGFzdCBzaW5jZSBzb21lIEVTNiBjb2xsZWN0aW9ucyAoSW1tdXRhYmxlKVxuICAgIC8vIGVtaXQgcHJvZnVzZSB3YXJuaW5ncyB3aGVuIHRyeWluZyB0byBhY2Nlc3MgLmxlbmd0aFxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZGF0YS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAtIHNsb3csIHdlIHByb2JhYmx5IHNob3VsZCBub3Qgc3VwcG9ydCB0aGlzIHVubGVzc1xuICAgIC8vIHdlIGxpbWl0IHRoZSBudW1iZXIgb2YgaW52b2NhdGlvbnNcbiAgICAvL1xuICAgIC8vIFVzZSBpdGVyYXRpb24gdG8gY291bnQgb2JqZWN0c1xuICAgIC8vIGxldCBjb3VudCA9IDA7XG4gICAgLy8gLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICAvLyBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgLy8gICBjb3VudCsrO1xuICAgIC8vIH1cbiAgICAvLyByZXR1cm4gY291bnQ7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZWR1Y2UgbnVtSW5zdGFuY2VzJyk7XG4gIH1cblxuICAvLyBJbnRlcm5hbCBIZWxwZXJzXG5cbiAgY2hlY2tQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBOb3RlOiBkYXRhQ2hhbmdlZCBtaWdodCBhbHJlYWR5IGJlIHNldFxuICAgIGlmIChuZXdQcm9wcy5kYXRhICE9PSBvbGRQcm9wcy5kYXRhKSB7XG4gICAgICAvLyBGaWd1cmUgb3V0IGRhdGEgbGVuZ3RoXG4gICAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMud2lkdGggIT09IG9sZFByb3BzLndpZHRoIHx8XG4gICAgICBuZXdQcm9wcy5oZWlnaHQgIT09IG9sZFByb3BzLmhlaWdodCB8fFxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe3ZpZXdwb3J0Q2hhbmdlZH0pO1xuICB9XG5cbiAgdXBkYXRlQXR0cmlidXRlcyhwcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgbnVtSW5zdGFuY2VzID0gdGhpcy5nZXROdW1JbnN0YW5jZXMocHJvcHMpO1xuICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLnVwZGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBidWZmZXJNYXA6IHByb3BzLFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IG5vbi1hdHRyaWJ1dGUgcHJvcHNcbiAgICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVCYXNlVW5pZm9ybXMoKSB7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAvLyBhcHBseSBnYW1tYSB0byBvcGFjaXR5IHRvIG1ha2UgaXQgdmlzdWFsbHkgXCJsaW5lYXJcIlxuICAgICAgb3BhY2l0eTogTWF0aC5wb3codGhpcy5wcm9wcy5vcGFjaXR5IHx8IDAuOCwgMSAvIDIuMilcbiAgICB9KTtcbiAgfVxuXG4gIC8vIExBWUVSIE1BTkFHRVIgQVBJXG5cbiAgLy8gQ2FsbGVkIGJ5IGxheWVyIG1hbmFnZXIgd2hlbiBhIG5ldyBsYXllciBpcyBmb3VuZFxuICBpbml0aWFsaXplTGF5ZXIoe2dsfSkge1xuICAgIGFzc2VydChnbCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtnbH07XG5cbiAgICAvLyBJbml0aWFsaXplIHN0YXRlIG9ubHkgb25jZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0cmlidXRlTWFuYWdlcjogbmV3IEF0dHJpYnV0ZU1hbmFnZXIoe2lkOiB0aGlzLnByb3BzLmlkfSksXG4gICAgICBtb2RlbDogbnVsbCxcbiAgICAgIG5lZWRzUmVkcmF3OiB0cnVlLFxuICAgICAgZGF0YUNoYW5nZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gQWxsIGluc3RhbmNlZCBsYXllcnMgZ2V0IHBpY2tpbmdDb2xvcnMgYXR0cmlidXRlIGJ5IGRlZmF1bHRcbiAgICAvLyBUaGVpciBzaGFkZXJzIGNhbiB1c2UgaXQgdG8gcmVuZGVyIGEgcGlja2luZyBzY2VuZVxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgICB0aGlzLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGFzc2VydCh0aGlzLnN0YXRlLm1vZGVsLCAnTW9kZWwgbXVzdCBiZSBzZXQgaW4gaW5pdGlhbGl6ZVN0YXRlJyk7XG4gICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuXG4gICAgLy8gQWRkIGFueSBwcmltaXRpdmUgYXR0cmlidXRlc1xuICAgIHRoaXMuX2luaXRpYWxpemVQcmltaXRpdmVBdHRyaWJ1dGVzKCk7XG5cbiAgICAvLyBUT0RPIC0gdGhlIGFwcCBtdXN0IGJlIGFibGUgdG8gb3ZlcnJpZGVcblxuICAgIC8vIEFkZCBhbnkgc3ViY2xhc3MgYXR0cmlidXRlc1xuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyh0aGlzLnByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZUJhc2VVbmlmb3JtcygpO1xuICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0SW5zdGFuY2VDb3VudCh0aGlzLmdldE51bUluc3RhbmNlcygpKTtcblxuICAgIC8vIENyZWF0ZSBhIG1vZGVsIGZvciB0aGUgbGF5ZXJcbiAgICB0aGlzLl91cGRhdGVNb2RlbCh7Z2x9KTtcblxuICAgIC8vIENhbGwgbGlmZSBjeWNsZSBtZXRob2RcbiAgICB0aGlzLmRpZE1vdW50KCk7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGV4aXN0aW5nIGxheWVyIGlzIGdldHRpbmcgbmV3IHByb3BzXG4gIHVwZGF0ZUxheWVyKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIENhbGN1bGF0ZSBzdGFuZGFyZCBjaGFuZ2UgZmxhZ3NcbiAgICB0aGlzLmNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIENoZWNrIGlmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTGV0IHRoZSBzdWJjbGFzcyBtYXJrIHdoYXQgaXMgbmVlZGVkIGZvciB1cGRhdGVcbiAgICAgIHRoaXMud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgICAgLy8gUnVuIHRoZSBhdHRyaWJ1dGUgdXBkYXRlcnNcbiAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyhuZXdQcm9wcyk7XG4gICAgICAvLyBVcGRhdGUgdGhlIHVuaWZvcm1zXG4gICAgICB0aGlzLnVwZGF0ZUJhc2VVbmlmb3JtcygpO1xuXG4gICAgICB0aGlzLnN0YXRlLm1vZGVsLnNldEluc3RhbmNlQ291bnQodGhpcy5nZXROdW1JbnN0YW5jZXMoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkID0gZmFsc2U7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbWFuYWdlciB3aGVuIGxheWVyIGlzIGFib3V0IHRvIGJlIGRpc3Bvc2VkXG4gIC8vIE5vdGU6IG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhbGxlZCBvbiBhcHBsaWNhdGlvbiBzaHV0ZG93blxuICBmaW5hbGl6ZUxheWVyKCkge1xuICAgIHRoaXMud2lsbFVubW91bnQoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIC8vIGFkZCAxIHRvIGluZGV4IHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IChpICsgMSkgJSAyNTY7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2KSAlIDI1NjtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYgLyAyNTYpICUgMjU2O1xuICAgIH1cbiAgfVxuXG4gIGRlY29kZVBpY2tpbmdDb2xvcihjb2xvcikge1xuICAgIGFzc2VydChjb2xvciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICAgIGNvbnN0IFtpMSwgaTIsIGkzXSA9IGNvbG9yO1xuICAgIC8vIDEgd2FzIGFkZGVkIHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgY29uc3QgaW5kZXggPSBpMSArIGkyICogMjU2ICsgaTMgKiA2NTUzNiAtIDE7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgb25Ib3ZlcihpbmZvKSB7XG4gICAgY29uc3Qge2NvbG9yfSA9IGluZm87XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmRlY29kZVBpY2tpbmdDb2xvcihjb2xvcik7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Ib3Zlcih7aW5kZXgsIC4uLmluZm99KTtcbiAgfVxuXG4gIG9uQ2xpY2soaW5mbykge1xuICAgIGNvbnN0IHtjb2xvcn0gPSBpbmZvO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ2xpY2soe2luZGV4LCAuLi5pbmZvfSk7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gU2V0IHVwIGF0dHJpYnV0ZXMgcmVsYXRpbmcgdG8gdGhlIHByaW1pdGl2ZSBpdHNlbGYgKG5vdCB0aGUgaW5zdGFuY2VzKVxuICBfaW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3Qge2dsLCBtb2RlbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgLy8gVE9ETyAtIHRoaXMgdW5wYWNrcyBhbmQgcmVwYWNrcyB0aGUgYXR0cmlidXRlcywgc2VlbXMgdW5uZWNlc3NhcnlcbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCd2ZXJ0aWNlcycpKSB7XG4gICAgICBjb25zdCB2ZXJ0aWNlcyA9IG1vZGVsLmdlb21ldHJ5LmdldEFycmF5KCd2ZXJ0aWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcyk7XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmdlb21ldHJ5Lmhhc0F0dHJpYnV0ZSgnbm9ybWFscycpKSB7XG4gICAgICBjb25zdCBub3JtYWxzID0gbW9kZWwuZ2VvbWV0cnkuZ2V0QXJyYXkoJ25vcm1hbHMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkTm9ybWFscyhub3JtYWxzKTtcbiAgICB9XG5cbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCdpbmRpY2VzJykpIHtcbiAgICAgIGNvbnN0IGluZGljZXMgPSBtb2RlbC5nZW9tZXRyeS5nZXRBcnJheSgnaW5kaWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbmRpY2VzKGluZGljZXMsIGdsKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTW9kZWwoe2dsfSkge1xuICAgIGNvbnN0IHttb2RlbCwgYXR0cmlidXRlTWFuYWdlciwgdW5pZm9ybXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGFzc2VydChtb2RlbCk7XG4gICAgbW9kZWwuc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVNYW5hZ2VyLmdldEF0dHJpYnV0ZXMoKSk7XG4gICAgbW9kZWwuc2V0VW5pZm9ybXModW5pZm9ybXMpO1xuICAgIC8vIHdoZXRoZXIgY3VycmVudCBsYXllciByZXNwb25kcyB0byBtb3VzZSBldmVudHNcbiAgICBtb2RlbC5zZXRQaWNrYWJsZSh0aGlzLnByb3BzLmlzUGlja2FibGUpO1xuICB9XG5cbiAgY2hlY2tQcm9wKHByb3BlcnR5LCBwcm9wZXJ0eU5hbWUpIHtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICR7cHJvcGVydHlOYW1lfSB1bmRlZmluZWQgaW4gbGF5ZXIgJHt0aGlzLmlkfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1BUCBMQVlFUiBGVU5DVElPTkFMSVRZXG5cbiAgc2V0Vmlld3BvcnQoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb219ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgZmxhdFdvcmxkLlZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpLFxuICAgICAgbWVyY2F0b3I6IFZpZXdwb3J0TWVyY2F0b3Ioe1xuICAgICAgICB3aWR0aCwgaGVpZ2h0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tLFxuICAgICAgICB0aWxlU2l6ZTogNTEyXG4gICAgICB9KVxuICAgIH0pO1xuICAgIGNvbnN0IHt4LCB5fSA9IHRoaXMuc3RhdGUudmlld3BvcnQ7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICB2aWV3cG9ydDogW3gsIHksIHdpZHRoLCBoZWlnaHRdLFxuICAgICAgbWFwVmlld3BvcnQ6IFtsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tLCBmbGF0V29ybGQuc2l6ZV1cbiAgICB9KTtcbiAgICBsb2coMywgdGhpcy5zdGF0ZS52aWV3cG9ydCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSk7XG4gIH1cblxuICAvKipcbiAgICogUG9zaXRpb24gY29udmVyc2lvbiBpcyBkb25lIGluIHNoYWRlciwgc28gaW4gbWFueSBjYXNlcyB0aGVyZSBpcyBubyBuZWVkXG4gICAqIGZvciB0aGlzIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBsYXRMbmcgLSBFaXRoZXIgW2xhdCxsbmddIG9yIHtsYXQsIGxvbn1cbiAgICogQHJldHVybiB7T2JqZWN0fSAtIHgsIHlcbiAgICovXG4gIHByb2plY3QobGF0TG5nKSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW3gsIHldID0gQXJyYXkuaXNBcnJheShsYXRMbmcpID9cbiAgICAgIG1lcmNhdG9yLnByb2plY3QoW2xhdExuZ1sxXSwgbGF0TG5nWzBdXSkgOlxuICAgICAgbWVyY2F0b3IucHJvamVjdChbbGF0TG5nLmxvbiwgbGF0TG5nLmxhdF0pO1xuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICBzY3JlZW5Ub1NwYWNlKHt4LCB5fSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiB2aWV3cG9ydC5zY3JlZW5Ub1NwYWNlKHt4LCB5fSk7XG4gIH1cblxufVxuIl19