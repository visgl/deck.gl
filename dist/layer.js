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

    // Override to add or modify info in sublayer
    // The sublayer may know what lat,lon corresponds to using math etc
    // even when picking does not work

  }, {
    key: 'onGetHoverInfo',
    value: function onGetHoverInfo(info) {
      var color = info.color;

      info.index = this.decodePickingColor(color);
      info.geoCoords = this.unproject({ x: info.x, y: info.y });
      return info;
    }
  }, {
    key: 'onHover',
    value: function onHover(info) {
      info = this.onGetHoverInfo(info);
      return this.props.onHover(info);
    }
  }, {
    key: 'onClick',
    value: function onClick(info) {
      info = this.onGetHoverInfo(info);
      return this.props.onClick(info);
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
    key: 'unproject',
    value: function unproject(xy) {
      var mercator = this.state.mercator;

      var _ref6 = Array.isArray(xy) ? mercator.unproject(xy) : mercator.unproject([xy.x, xy.y]);

      var _ref7 = _slicedToArray(_ref6, 2);

      var lon = _ref7[0];
      var lat = _ref7[1];

      return { lat: lat, lon: lon };
    }
  }, {
    key: 'screenToSpace',
    value: function screenToSpace(_ref8) {
      var x = _ref8.x;
      var y = _ref8.y;
      var viewport = this.state.viewport;

      return viewport.screenToSpace({ x: x, y: y });
    }
  }]);

  return Layer;
}();

exports.default = Layer;
//# sourceMappingURL=data:application/json;base64,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LEVBQUMsSUFBRCxFQUFJLElBQUosRUFBdkIsQ0FBUCxDQUZvQjs7OztTQWhhSCIsImZpbGUiOiJsYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIGd1YXJkLWZvci1pbiAqL1xuaW1wb3J0IEF0dHJpYnV0ZU1hbmFnZXIgZnJvbSAnLi9hdHRyaWJ1dGUtbWFuYWdlcic7XG5pbXBvcnQgZmxhdFdvcmxkIGZyb20gJy4vZmxhdC13b3JsZCc7XG5pbXBvcnQge2FyZUVxdWFsU2hhbGxvd30gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7YWRkSXRlcmF0b3J9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgbG9nIGZyb20gJy4vbG9nJztcbmltcG9ydCBpc0RlZXBFcXVhbCBmcm9tICdsb2Rhc2guaXNlcXVhbCc7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgVmlld3BvcnRNZXJjYXRvciBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuLypcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wcy5pZCAtIGxheWVyIG5hbWVcbiAqIEBwYXJhbSB7YXJyYXl9ICBwcm9wcy5kYXRhIC0gYXJyYXkgb2YgZGF0YSBpbnN0YW5jZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy53aWR0aCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLmhlaWdodCAtIHZpZXdwb3J0IHdpZHRoLCBzeW5jZWQgd2l0aCBNYXBib3hHTFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5pc1BpY2thYmxlIC0gd2hldGhlciBsYXllciByZXNwb25zZSB0byBtb3VzZSBldmVudFxuICogQHBhcmFtIHtib29sfSBwcm9wcy5vcGFjaXR5IC0gb3BhY2l0eSBvZiB0aGUgbGF5ZXJcbiAqL1xuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAga2V5OiAwLFxuICBvcGFjaXR5OiAwLjgsXG4gIG51bUluc3RhbmNlczogdW5kZWZpbmVkLFxuICBkYXRhOiBbXSxcbiAgaXNQaWNrYWJsZTogZmFsc2UsXG4gIGRlZXBDb21wYXJlOiBmYWxzZSxcbiAgZ2V0VmFsdWU6IHggPT4geCxcbiAgb25Ib3ZlcjogKCkgPT4ge30sXG4gIG9uQ2xpY2s6ICgpID0+IHt9XG59O1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwaWNraW5nQ29sb3JzOiB7c2l6ZTogMywgJzAnOiAncGlja1JlZCcsICcxJzogJ3BpY2tHcmVlbicsICcyJzogJ3BpY2tCbHVlJ31cbn07XG5cbmxldCBjb3VudGVyID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEJhc2UgTGF5ZXIgY2xhc3NcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wcyAtIFNlZSBkb2NzIGFib3ZlXG4gICAqL1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuXG4gICAgcHJvcHMgPSB7XG4gICAgICAuLi5ERUZBVUxUX1BST1BTLFxuICAgICAgLi4ucHJvcHNcbiAgICB9O1xuXG4gICAgLy8gQWRkIGl0ZXJhdG9yIHRvIG9iamVjdHNcbiAgICAvLyBUT0RPIC0gTW9kaWZ5aW5nIHByb3BzIGlzIGFuIGFudGktcGF0dGVyblxuICAgIGlmIChwcm9wcy5kYXRhKSB7XG4gICAgICBhZGRJdGVyYXRvcihwcm9wcy5kYXRhKTtcbiAgICAgIGFzc2VydChwcm9wcy5kYXRhW1N5bWJvbC5pdGVyYXRvcl0sICdkYXRhIHByb3AgbXVzdCBoYXZlIGFuIGl0ZXJhdG9yJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuZGF0YSwgJ2RhdGEnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5pZCwgJ2lkJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuXG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmxhdGl0dWRlLCAnbGF0aXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5sb25naXR1ZGUsICdsb25naXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy56b29tLCAnem9vbScpO1xuXG4gICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgIHRoaXMuY291bnQgPSBjb3VudGVyKys7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIExJRkVDWUNMRSBNRVRIT0RTLCBvdmVycmlkZGVuIGJ5IHRoZSBsYXllciBzdWJjbGFzc2VzXG5cbiAgLy8gQ2FsbGVkIG9uY2UgdG8gc2V0IHVwIHRoZSBpbml0aWFsIHN0YXRlXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgfVxuXG4gIC8vIGdsIGNvbnRleHQgaXMgbm93IGF2YWlsYWJsZVxuICBkaWRNb3VudCgpIHtcbiAgfVxuXG4gIHNob3VsZFVwZGF0ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBJZiBhbnkgcHJvcHMgaGF2ZSBjaGFuZ2VkXG4gICAgaWYgKCFhcmVFcXVhbFNoYWxsb3cobmV3UHJvcHMsIG9sZFByb3BzKSkge1xuXG4gICAgICBpZiAobmV3UHJvcHMuZGF0YSAhPT0gb2xkUHJvcHMuZGF0YSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtkYXRhQ2hhbmdlZDogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChuZXdQcm9wcy5kZWVwQ29tcGFyZSAmJiAhaXNEZWVwRXF1YWwobmV3UHJvcHMuZGF0YSwgb2xkUHJvcHMuZGF0YSkpIHtcbiAgICAgIC8vIFN1cHBvcnQgb3B0aW9uYWwgZGVlcCBjb21wYXJlIG9mIGRhdGFcbiAgICAgIC8vIE5vdGU6IHRoaXMgaXMgcXVpdGUgaW5lZmZpY2llbnQsIGFwcCBzaG91bGQgdXNlIGJ1ZmZlciBwcm9wcyBpbnN0ZWFkXG4gICAgICB0aGlzLnNldFN0YXRlKHtkYXRhQ2hhbmdlZDogdHJ1ZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIERlZmF1bHQgaW1wbGVtZW50YXRpb24sIGFsbCBhdHRyaWJ1dGVNYW5hZ2VyIHdpbGwgYmUgdXBkYXRlZFxuICB3aWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAodGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCkge1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBzdGlsbCBhdmFpbGFibGVcbiAgd2lsbFVubW91bnQoKSB7XG4gIH1cblxuICAvLyBFTkQgTElGRUNZQ0xFIE1FVEhPRFNcbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pIHtcbiAgICAvLyB0aGlzIG1ldGhvZCBtYXkgYmUgY2FsbGVkIGJ5IHRoZSByZW5kZXIgbG9vcCBhcyBzb29uIGEgdGhlIGxheWVyXG4gICAgLy8gaGFzIGJlZW4gY3JlYXRlZCwgc28gZ3VhcmQgYWdhaW5zdCB1bmluaXRpYWxpemVkIHN0YXRlXG4gICAgaWYgKCF0aGlzLnN0YXRlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBsZXQgbmVlZHNSZWRyYXcgPSBhdHRyaWJ1dGVNYW5hZ2VyLmdldE5lZWRzUmVkcmF3KHtjbGVhckZsYWd9KTtcbiAgICBuZWVkc1JlZHJhdyA9IG5lZWRzUmVkcmF3IHx8IHRoaXMuc3RhdGUubmVlZHNSZWRyYXc7XG4gICAgaWYgKGNsZWFyRmxhZykge1xuICAgICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbmVlZHNSZWRyYXc7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRTdGF0ZSh1cGRhdGVPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHVwZGF0ZU9iamVjdCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRVbmlmb3Jtcyh1bmlmb3JtTWFwKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUubW9kZWwpIHtcbiAgICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0VW5pZm9ybXModW5pZm9ybU1hcCk7XG4gICAgfVxuICAgIC8vIFRPRE8gLSBzZXQgbmVlZHNSZWRyYXcgb24gdGhlIG1vZGVsP1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIGxvZygzLCAnbGF5ZXIuc2V0VW5pZm9ybXMnLCB1bmlmb3JtTWFwKTtcbiAgfVxuXG4gIC8vIFVzZSBpdGVyYXRpb24gKHRoZSBvbmx5IHJlcXVpcmVkIGNhcGFiaWxpdHkgb24gZGF0YSkgdG8gZ2V0IGZpcnN0IGVsZW1lbnRcbiAgZ2V0Rmlyc3RPYmplY3QoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICAvLyBEZWR1Y2VzIG51bWVyIG9mIGluc3RhbmNlcy4gSW50ZW50aW9uIGlzIHRvIHN1cHBvcnQ6XG4gIC8vIC0gRXhwbGljaXQgc2V0dGluZyBvZiBudW1JbnN0YW5jZXNcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgRVM2IGNvbnRhaW5lcnMgdGhhdCBkZWZpbmUgYSBzaXplIG1lbWJlclxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBDbGFzc2ljIEFycmF5cyB2aWEgdGhlIGJ1aWx0LWluIGxlbmd0aCBhdHRyaWJ1dGVcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiB2aWEgYXJyYXlzXG4gIGdldE51bUluc3RhbmNlcyhwcm9wcykge1xuICAgIHByb3BzID0gcHJvcHMgfHwgdGhpcy5wcm9wcztcblxuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZSBsYXllciBoYXMgc2V0IGl0cyBvd24gdmFsdWVcbiAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYXBwIGhhcyBzZXQgYW4gZXhwbGljaXQgdmFsdWVcbiAgICBpZiAocHJvcHMubnVtSW5zdGFuY2VzKSB7XG4gICAgICByZXR1cm4gcHJvcHMubnVtSW5zdGFuY2VzO1xuICAgIH1cblxuICAgIGNvbnN0IHtkYXRhfSA9IHByb3BzO1xuXG4gICAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICAgIGlmIChkYXRhICYmIHR5cGVvZiBkYXRhLmNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZGF0YS5jb3VudCgpO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIEVTNiBjb2xsZWN0aW9uIFwic2l6ZVwiIGF0dHJpYnV0ZSBpcyBzZXRcbiAgICBpZiAoZGF0YSAmJiBkYXRhLnNpemUpIHtcbiAgICAgIHJldHVybiBkYXRhLnNpemU7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYXJyYXkgbGVuZ3RoIGF0dHJpYnV0ZSBpcyBzZXQgb24gZGF0YVxuICAgIC8vIE5vdGU6IGNoZWNraW5nIHRoaXMgbGFzdCBzaW5jZSBzb21lIEVTNiBjb2xsZWN0aW9ucyAoSW1tdXRhYmxlKVxuICAgIC8vIGVtaXQgcHJvZnVzZSB3YXJuaW5ncyB3aGVuIHRyeWluZyB0byBhY2Nlc3MgLmxlbmd0aFxuICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZGF0YS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAtIHNsb3csIHdlIHByb2JhYmx5IHNob3VsZCBub3Qgc3VwcG9ydCB0aGlzIHVubGVzc1xuICAgIC8vIHdlIGxpbWl0IHRoZSBudW1iZXIgb2YgaW52b2NhdGlvbnNcbiAgICAvL1xuICAgIC8vIFVzZSBpdGVyYXRpb24gdG8gY291bnQgb2JqZWN0c1xuICAgIC8vIGxldCBjb3VudCA9IDA7XG4gICAgLy8gLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgICAvLyBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgLy8gICBjb3VudCsrO1xuICAgIC8vIH1cbiAgICAvLyByZXR1cm4gY291bnQ7XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBkZWR1Y2UgbnVtSW5zdGFuY2VzJyk7XG4gIH1cblxuICAvLyBJbnRlcm5hbCBIZWxwZXJzXG5cbiAgY2hlY2tQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICAvLyBOb3RlOiBkYXRhQ2hhbmdlZCBtaWdodCBhbHJlYWR5IGJlIHNldFxuICAgIGlmIChuZXdQcm9wcy5kYXRhICE9PSBvbGRQcm9wcy5kYXRhKSB7XG4gICAgICAvLyBGaWd1cmUgb3V0IGRhdGEgbGVuZ3RoXG4gICAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCB2aWV3cG9ydENoYW5nZWQgPVxuICAgICAgbmV3UHJvcHMud2lkdGggIT09IG9sZFByb3BzLndpZHRoIHx8XG4gICAgICBuZXdQcm9wcy5oZWlnaHQgIT09IG9sZFByb3BzLmhlaWdodCB8fFxuICAgICAgbmV3UHJvcHMubGF0aXR1ZGUgIT09IG9sZFByb3BzLmxhdGl0dWRlIHx8XG4gICAgICBuZXdQcm9wcy5sb25naXR1ZGUgIT09IG9sZFByb3BzLmxvbmdpdHVkZSB8fFxuICAgICAgbmV3UHJvcHMuem9vbSAhPT0gb2xkUHJvcHMuem9vbTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe3ZpZXdwb3J0Q2hhbmdlZH0pO1xuICB9XG5cbiAgdXBkYXRlQXR0cmlidXRlcyhwcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgbnVtSW5zdGFuY2VzID0gdGhpcy5nZXROdW1JbnN0YW5jZXMocHJvcHMpO1xuICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLnVwZGF0ZSh7XG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBidWZmZXJNYXA6IHByb3BzLFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IG5vbi1hdHRyaWJ1dGUgcHJvcHNcbiAgICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVCYXNlVW5pZm9ybXMoKSB7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAvLyBhcHBseSBnYW1tYSB0byBvcGFjaXR5IHRvIG1ha2UgaXQgdmlzdWFsbHkgXCJsaW5lYXJcIlxuICAgICAgb3BhY2l0eTogTWF0aC5wb3codGhpcy5wcm9wcy5vcGFjaXR5IHx8IDAuOCwgMSAvIDIuMilcbiAgICB9KTtcbiAgfVxuXG4gIC8vIExBWUVSIE1BTkFHRVIgQVBJXG5cbiAgLy8gQ2FsbGVkIGJ5IGxheWVyIG1hbmFnZXIgd2hlbiBhIG5ldyBsYXllciBpcyBmb3VuZFxuICBpbml0aWFsaXplTGF5ZXIoe2dsfSkge1xuICAgIGFzc2VydChnbCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtnbH07XG5cbiAgICAvLyBJbml0aWFsaXplIHN0YXRlIG9ubHkgb25jZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgYXR0cmlidXRlTWFuYWdlcjogbmV3IEF0dHJpYnV0ZU1hbmFnZXIoe2lkOiB0aGlzLnByb3BzLmlkfSksXG4gICAgICBtb2RlbDogbnVsbCxcbiAgICAgIG5lZWRzUmVkcmF3OiB0cnVlLFxuICAgICAgZGF0YUNoYW5nZWQ6IHRydWVcbiAgICB9KTtcblxuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgLy8gQWxsIGluc3RhbmNlZCBsYXllcnMgZ2V0IHBpY2tpbmdDb2xvcnMgYXR0cmlidXRlIGJ5IGRlZmF1bHRcbiAgICAvLyBUaGVpciBzaGFkZXJzIGNhbiB1c2UgaXQgdG8gcmVuZGVyIGEgcGlja2luZyBzY2VuZVxuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKEFUVFJJQlVURVMsIHtcbiAgICAgIHBpY2tpbmdDb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUGlja2luZ0NvbG9yc31cbiAgICB9KTtcblxuICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgICB0aGlzLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGFzc2VydCh0aGlzLnN0YXRlLm1vZGVsLCAnTW9kZWwgbXVzdCBiZSBzZXQgaW4gaW5pdGlhbGl6ZVN0YXRlJyk7XG4gICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuXG4gICAgLy8gQWRkIGFueSBwcmltaXRpdmUgYXR0cmlidXRlc1xuICAgIHRoaXMuX2luaXRpYWxpemVQcmltaXRpdmVBdHRyaWJ1dGVzKCk7XG5cbiAgICAvLyBUT0RPIC0gdGhlIGFwcCBtdXN0IGJlIGFibGUgdG8gb3ZlcnJpZGVcblxuICAgIC8vIEFkZCBhbnkgc3ViY2xhc3MgYXR0cmlidXRlc1xuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyh0aGlzLnByb3BzKTtcbiAgICB0aGlzLnVwZGF0ZUJhc2VVbmlmb3JtcygpO1xuICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0SW5zdGFuY2VDb3VudCh0aGlzLmdldE51bUluc3RhbmNlcygpKTtcblxuICAgIC8vIENyZWF0ZSBhIG1vZGVsIGZvciB0aGUgbGF5ZXJcbiAgICB0aGlzLl91cGRhdGVNb2RlbCh7Z2x9KTtcblxuICAgIC8vIENhbGwgbGlmZSBjeWNsZSBtZXRob2RcbiAgICB0aGlzLmRpZE1vdW50KCk7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGV4aXN0aW5nIGxheWVyIGlzIGdldHRpbmcgbmV3IHByb3BzXG4gIHVwZGF0ZUxheWVyKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIENhbGN1bGF0ZSBzdGFuZGFyZCBjaGFuZ2UgZmxhZ3NcbiAgICB0aGlzLmNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIC8vIENoZWNrIGlmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAodGhpcy5zaG91bGRVcGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSkge1xuICAgICAgaWYgKHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTGV0IHRoZSBzdWJjbGFzcyBtYXJrIHdoYXQgaXMgbmVlZGVkIGZvciB1cGRhdGVcbiAgICAgIHRoaXMud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgICAgLy8gUnVuIHRoZSBhdHRyaWJ1dGUgdXBkYXRlcnNcbiAgICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyhuZXdQcm9wcyk7XG4gICAgICAvLyBVcGRhdGUgdGhlIHVuaWZvcm1zXG4gICAgICB0aGlzLnVwZGF0ZUJhc2VVbmlmb3JtcygpO1xuXG4gICAgICB0aGlzLnN0YXRlLm1vZGVsLnNldEluc3RhbmNlQ291bnQodGhpcy5nZXROdW1JbnN0YW5jZXMoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5kYXRhQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhdGUudmlld3BvcnRDaGFuZ2VkID0gZmFsc2U7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbWFuYWdlciB3aGVuIGxheWVyIGlzIGFib3V0IHRvIGJlIGRpc3Bvc2VkXG4gIC8vIE5vdGU6IG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhbGxlZCBvbiBhcHBsaWNhdGlvbiBzaHV0ZG93blxuICBmaW5hbGl6ZUxheWVyKCkge1xuICAgIHRoaXMud2lsbFVubW91bnQoKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBpY2tpbmdDb2xvcnMoYXR0cmlidXRlLCBudW1JbnN0YW5jZXMpIHtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIC8vIGFkZCAxIHRvIGluZGV4IHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAwXSA9IChpICsgMSkgJSAyNTY7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2KSAlIDI1NjtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYgLyAyNTYpICUgMjU2O1xuICAgIH1cbiAgfVxuXG4gIGRlY29kZVBpY2tpbmdDb2xvcihjb2xvcikge1xuICAgIGFzc2VydChjb2xvciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICAgIGNvbnN0IFtpMSwgaTIsIGkzXSA9IGNvbG9yO1xuICAgIC8vIDEgd2FzIGFkZGVkIHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgY29uc3QgaW5kZXggPSBpMSArIGkyICogMjU2ICsgaTMgKiA2NTUzNiAtIDE7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdG8gYWRkIG9yIG1vZGlmeSBpbmZvIGluIHN1YmxheWVyXG4gIC8vIFRoZSBzdWJsYXllciBtYXkga25vdyB3aGF0IGxhdCxsb24gY29ycmVzcG9uZHMgdG8gdXNpbmcgbWF0aCBldGNcbiAgLy8gZXZlbiB3aGVuIHBpY2tpbmcgZG9lcyBub3Qgd29ya1xuICBvbkdldEhvdmVySW5mbyhpbmZvKSB7XG4gICAgY29uc3Qge2NvbG9yfSA9IGluZm87XG4gICAgaW5mby5pbmRleCA9IHRoaXMuZGVjb2RlUGlja2luZ0NvbG9yKGNvbG9yKTtcbiAgICBpbmZvLmdlb0Nvb3JkcyA9IHRoaXMudW5wcm9qZWN0KHt4OiBpbmZvLngsIHk6IGluZm8ueX0pO1xuICAgIHJldHVybiBpbmZvO1xuICB9XG5cbiAgb25Ib3ZlcihpbmZvKSB7XG4gICAgaW5mbyA9IHRoaXMub25HZXRIb3ZlckluZm8oaW5mbyk7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMub25Ib3ZlcihpbmZvKTtcbiAgfVxuXG4gIG9uQ2xpY2soaW5mbykge1xuICAgIGluZm8gPSB0aGlzLm9uR2V0SG92ZXJJbmZvKGluZm8pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uQ2xpY2soaW5mbyk7XG4gIH1cblxuICAvLyBJTlRFUk5BTCBNRVRIT0RTXG5cbiAgLy8gU2V0IHVwIGF0dHJpYnV0ZXMgcmVsYXRpbmcgdG8gdGhlIHByaW1pdGl2ZSBpdHNlbGYgKG5vdCB0aGUgaW5zdGFuY2VzKVxuICBfaW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKSB7XG4gICAgY29uc3Qge2dsLCBtb2RlbCwgYXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgLy8gVE9ETyAtIHRoaXMgdW5wYWNrcyBhbmQgcmVwYWNrcyB0aGUgYXR0cmlidXRlcywgc2VlbXMgdW5uZWNlc3NhcnlcbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCd2ZXJ0aWNlcycpKSB7XG4gICAgICBjb25zdCB2ZXJ0aWNlcyA9IG1vZGVsLmdlb21ldHJ5LmdldEFycmF5KCd2ZXJ0aWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRWZXJ0aWNlcyh2ZXJ0aWNlcyk7XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmdlb21ldHJ5Lmhhc0F0dHJpYnV0ZSgnbm9ybWFscycpKSB7XG4gICAgICBjb25zdCBub3JtYWxzID0gbW9kZWwuZ2VvbWV0cnkuZ2V0QXJyYXkoJ25vcm1hbHMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkTm9ybWFscyhub3JtYWxzKTtcbiAgICB9XG5cbiAgICBpZiAobW9kZWwuZ2VvbWV0cnkuaGFzQXR0cmlidXRlKCdpbmRpY2VzJykpIHtcbiAgICAgIGNvbnN0IGluZGljZXMgPSBtb2RlbC5nZW9tZXRyeS5nZXRBcnJheSgnaW5kaWNlcycpO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbmRpY2VzKGluZGljZXMsIGdsKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlTW9kZWwoe2dsfSkge1xuICAgIGNvbnN0IHttb2RlbCwgYXR0cmlidXRlTWFuYWdlciwgdW5pZm9ybXN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGFzc2VydChtb2RlbCk7XG4gICAgbW9kZWwuc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVNYW5hZ2VyLmdldEF0dHJpYnV0ZXMoKSk7XG4gICAgbW9kZWwuc2V0VW5pZm9ybXModW5pZm9ybXMpO1xuICAgIC8vIHdoZXRoZXIgY3VycmVudCBsYXllciByZXNwb25kcyB0byBtb3VzZSBldmVudHNcbiAgICBtb2RlbC5zZXRQaWNrYWJsZSh0aGlzLnByb3BzLmlzUGlja2FibGUpO1xuICB9XG5cbiAgY2hlY2tQcm9wKHByb3BlcnR5LCBwcm9wZXJ0eU5hbWUpIHtcbiAgICBpZiAoIXByb3BlcnR5KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3BlcnR5ICR7cHJvcGVydHlOYW1lfSB1bmRlZmluZWQgaW4gbGF5ZXIgJHt0aGlzLmlkfWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIE1BUCBMQVlFUiBGVU5DVElPTkFMSVRZXG5cbiAgc2V0Vmlld3BvcnQoKSB7XG4gICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb219ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgZmxhdFdvcmxkLlZpZXdwb3J0KHdpZHRoLCBoZWlnaHQpLFxuICAgICAgbWVyY2F0b3I6IFZpZXdwb3J0TWVyY2F0b3Ioe1xuICAgICAgICB3aWR0aCwgaGVpZ2h0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tLFxuICAgICAgICB0aWxlU2l6ZTogNTEyXG4gICAgICB9KVxuICAgIH0pO1xuICAgIGNvbnN0IHt4LCB5fSA9IHRoaXMuc3RhdGUudmlld3BvcnQ7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICB2aWV3cG9ydDogW3gsIHksIHdpZHRoLCBoZWlnaHRdLFxuICAgICAgbWFwVmlld3BvcnQ6IFtsb25naXR1ZGUsIGxhdGl0dWRlLCB6b29tLCBmbGF0V29ybGQuc2l6ZV1cbiAgICB9KTtcbiAgICBsb2coMywgdGhpcy5zdGF0ZS52aWV3cG9ydCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSk7XG4gIH1cblxuICAvKipcbiAgICogUG9zaXRpb24gY29udmVyc2lvbiBpcyBkb25lIGluIHNoYWRlciwgc28gaW4gbWFueSBjYXNlcyB0aGVyZSBpcyBubyBuZWVkXG4gICAqIGZvciB0aGlzIGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fEFycmF5fSBsYXRMbmcgLSBFaXRoZXIgW2xhdCxsbmddIG9yIHtsYXQsIGxvbn1cbiAgICogQHJldHVybiB7T2JqZWN0fSAtIHgsIHlcbiAgICovXG4gIHByb2plY3QobGF0TG5nKSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW3gsIHldID0gQXJyYXkuaXNBcnJheShsYXRMbmcpID9cbiAgICAgIG1lcmNhdG9yLnByb2plY3QoW2xhdExuZ1sxXSwgbGF0TG5nWzBdXSkgOlxuICAgICAgbWVyY2F0b3IucHJvamVjdChbbGF0TG5nLmxvbiwgbGF0TG5nLmxhdF0pO1xuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICB1bnByb2plY3QoeHkpIHtcbiAgICBjb25zdCB7bWVyY2F0b3J9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBbbG9uLCBsYXRdID0gQXJyYXkuaXNBcnJheSh4eSkgP1xuICAgICAgbWVyY2F0b3IudW5wcm9qZWN0KHh5KSA6XG4gICAgICBtZXJjYXRvci51bnByb2plY3QoW3h5LngsIHh5LnldKTtcbiAgICByZXR1cm4ge2xhdCwgbG9ufTtcbiAgfVxuXG4gIHNjcmVlblRvU3BhY2Uoe3gsIHl9KSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuc3RhdGU7XG4gICAgcmV0dXJuIHZpZXdwb3J0LnNjcmVlblRvU3BhY2Uoe3gsIHl9KTtcbiAgfVxuXG59XG4iXX0=