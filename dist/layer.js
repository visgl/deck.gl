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
        var pickingColor = this.encodePickingColor(i);
        value[i * size + 0] = pickingColor[0];
        value[i * size + 1] = pickingColor[1];
        value[i * size + 2] = pickingColor[2];
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
    key: 'encodePickingColor',
    value: function encodePickingColor(i) {
      return [(i + 1) % 256, Math.floor((i + 1) / 256) % 256, Math.floor((i + 1) / 256 / 256) % 256];
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
      var _info = info;
      var color = _info.color;

      var selectedPickingColor = new Float32Array(3);
      selectedPickingColor[0] = color[0];
      selectedPickingColor[1] = color[1];
      selectedPickingColor[2] = color[2];
      this.setUniforms({ selectedPickingColor: selectedPickingColor });

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
//# sourceMappingURL=data:application/json;base64,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Q0FBOUIsQ0FGYSxDQUZEOzs7O1VBRVAsYUFGTztVQUVKLGFBRkk7O0FBS2QsYUFBTyxFQUFDLElBQUQsRUFBSSxJQUFKLEVBQVAsQ0FMYzs7Ozs4QkFRTixJQUFJO1VBQ0wsV0FBWSxLQUFLLEtBQUwsQ0FBWixTQURLOztrQkFFTyxNQUFNLE9BQU4sQ0FBYyxFQUFkLElBQ2pCLFNBQVMsU0FBVCxDQUFtQixFQUFuQixDQURpQixHQUVqQixTQUFTLFNBQVQsQ0FBbUIsQ0FBQyxHQUFHLENBQUgsRUFBTSxHQUFHLENBQUgsQ0FBMUIsQ0FGaUIsQ0FGUDs7OztVQUVMLGVBRks7VUFFQSxlQUZBOztBQUtaLGFBQU8sRUFBQyxRQUFELEVBQU0sUUFBTixFQUFQLENBTFk7Ozs7eUNBUVE7VUFBUCxZQUFPO1VBQUosWUFBSTtVQUNiLFdBQVksS0FBSyxLQUFMLENBQVosU0FEYTs7QUFFcEIsYUFBTyxTQUFTLGFBQVQsQ0FBdUIsRUFBQyxJQUFELEVBQUksSUFBSixFQUF2QixDQUFQLENBRm9COzs7O1NBaGJIIiwiZmlsZSI6ImxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZXNsaW50LWRpc2FibGUgZ3VhcmQtZm9yLWluICovXG5pbXBvcnQgQXR0cmlidXRlTWFuYWdlciBmcm9tICcuL2F0dHJpYnV0ZS1tYW5hZ2VyJztcbmltcG9ydCBmbGF0V29ybGQgZnJvbSAnLi9mbGF0LXdvcmxkJztcbmltcG9ydCB7YXJlRXF1YWxTaGFsbG93fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHthZGRJdGVyYXRvcn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBsb2cgZnJvbSAnLi9sb2cnO1xuaW1wb3J0IGlzRGVlcEVxdWFsIGZyb20gJ2xvZGFzaC5pc2VxdWFsJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBWaWV3cG9ydE1lcmNhdG9yIGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG4vKlxuICogQHBhcmFtIHtzdHJpbmd9IHByb3BzLmlkIC0gbGF5ZXIgbmFtZVxuICogQHBhcmFtIHthcnJheX0gIHByb3BzLmRhdGEgLSBhcnJheSBvZiBkYXRhIGluc3RhbmNlc1xuICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLndpZHRoIC0gdmlld3BvcnQgd2lkdGgsIHN5bmNlZCB3aXRoIE1hcGJveEdMXG4gKiBAcGFyYW0ge251bWJlcn0gcHJvcHMuaGVpZ2h0IC0gdmlld3BvcnQgd2lkdGgsIHN5bmNlZCB3aXRoIE1hcGJveEdMXG4gKiBAcGFyYW0ge2Jvb2x9IHByb3BzLmlzUGlja2FibGUgLSB3aGV0aGVyIGxheWVyIHJlc3BvbnNlIHRvIG1vdXNlIGV2ZW50XG4gKiBAcGFyYW0ge2Jvb2x9IHByb3BzLm9wYWNpdHkgLSBvcGFjaXR5IG9mIHRoZSBsYXllclxuICovXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBrZXk6IDAsXG4gIG9wYWNpdHk6IDAuOCxcbiAgbnVtSW5zdGFuY2VzOiB1bmRlZmluZWQsXG4gIGRhdGE6IFtdLFxuICBpc1BpY2thYmxlOiBmYWxzZSxcbiAgZGVlcENvbXBhcmU6IGZhbHNlLFxuICBnZXRWYWx1ZTogeCA9PiB4LFxuICBvbkhvdmVyOiAoKSA9PiB7fSxcbiAgb25DbGljazogKCkgPT4ge31cbn07XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBpY2tpbmdDb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdwaWNrUmVkJywgJzEnOiAncGlja0dyZWVuJywgJzInOiAncGlja0JsdWUnfVxufTtcblxubGV0IGNvdW50ZXIgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXllciB7XG5cbiAgc3RhdGljIGdldCBhdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiBBVFRSSUJVVEVTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQmFzZSBMYXllciBjbGFzc1xuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IHByb3BzIC0gU2VlIGRvY3MgYWJvdmVcbiAgICovXG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cbiAgICBwcm9wcyA9IHtcbiAgICAgIC4uLkRFRkFVTFRfUFJPUFMsXG4gICAgICAuLi5wcm9wc1xuICAgIH07XG5cbiAgICAvLyBBZGQgaXRlcmF0b3IgdG8gb2JqZWN0c1xuICAgIC8vIFRPRE8gLSBNb2RpZnlpbmcgcHJvcHMgaXMgYW4gYW50aS1wYXR0ZXJuXG4gICAgaWYgKHByb3BzLmRhdGEpIHtcbiAgICAgIGFkZEl0ZXJhdG9yKHByb3BzLmRhdGEpO1xuICAgICAgYXNzZXJ0KHByb3BzLmRhdGFbU3ltYm9sLml0ZXJhdG9yXSwgJ2RhdGEgcHJvcCBtdXN0IGhhdmUgYW4gaXRlcmF0b3InKTtcbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy5kYXRhLCAnZGF0YScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmlkLCAnaWQnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG5cbiAgICB0aGlzLmNoZWNrUHJvcChwcm9wcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5jaGVja1Byb3AocHJvcHMubGF0aXR1ZGUsICdsYXRpdHVkZScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLmxvbmdpdHVkZSwgJ2xvbmdpdHVkZScpO1xuICAgIHRoaXMuY2hlY2tQcm9wKHByb3BzLnpvb20sICd6b29tJyk7XG5cbiAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgdGhpcy5jb3VudCA9IGNvdW50ZXIrKztcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG1heC1zdGF0ZW1lbnRzICovXG5cbiAgLy8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gTElGRUNZQ0xFIE1FVEhPRFMsIG92ZXJyaWRkZW4gYnkgdGhlIGxheWVyIHN1YmNsYXNzZXNcblxuICAvLyBDYWxsZWQgb25jZSB0byBzZXQgdXAgdGhlIGluaXRpYWwgc3RhdGVcbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICB9XG5cbiAgLy8gZ2wgY29udGV4dCBpcyBub3cgYXZhaWxhYmxlXG4gIGRpZE1vdW50KCkge1xuICB9XG5cbiAgc2hvdWxkVXBkYXRlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIElmIGFueSBwcm9wcyBoYXZlIGNoYW5nZWRcbiAgICBpZiAoIWFyZUVxdWFsU2hhbGxvdyhuZXdQcm9wcywgb2xkUHJvcHMpKSB7XG5cbiAgICAgIGlmIChuZXdQcm9wcy5kYXRhICE9PSBvbGRQcm9wcy5kYXRhKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFDaGFuZ2VkOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG5ld1Byb3BzLmRlZXBDb21wYXJlICYmICFpc0RlZXBFcXVhbChuZXdQcm9wcy5kYXRhLCBvbGRQcm9wcy5kYXRhKSkge1xuICAgICAgLy8gU3VwcG9ydCBvcHRpb25hbCBkZWVwIGNvbXBhcmUgb2YgZGF0YVxuICAgICAgLy8gTm90ZTogdGhpcyBpcyBxdWl0ZSBpbmVmZmljaWVudCwgYXBwIHNob3VsZCB1c2UgYnVmZmVyIHByb3BzIGluc3RlYWRcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2RhdGFDaGFuZ2VkOiB0cnVlfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiwgYWxsIGF0dHJpYnV0ZU1hbmFnZXIgd2lsbCBiZSB1cGRhdGVkXG4gIHdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHMpIHtcbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICh0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkKSB7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvLyBnbCBjb250ZXh0IHN0aWxsIGF2YWlsYWJsZVxuICB3aWxsVW5tb3VudCgpIHtcbiAgfVxuXG4gIC8vIEVORCBMSUZFQ1lDTEUgTUVUSE9EU1xuICAvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIFB1YmxpYyBBUElcblxuICBnZXROZWVkc1JlZHJhdyh7Y2xlYXJGbGFnfSkge1xuICAgIC8vIHRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgYnkgdGhlIHJlbmRlciBsb29wIGFzIHNvb24gYSB0aGUgbGF5ZXJcbiAgICAvLyBoYXMgYmVlbiBjcmVhdGVkLCBzbyBndWFyZCBhZ2FpbnN0IHVuaW5pdGlhbGl6ZWQgc3RhdGVcbiAgICBpZiAoIXRoaXMuc3RhdGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGxldCBuZWVkc1JlZHJhdyA9IGF0dHJpYnV0ZU1hbmFnZXIuZ2V0TmVlZHNSZWRyYXcoe2NsZWFyRmxhZ30pO1xuICAgIG5lZWRzUmVkcmF3ID0gbmVlZHNSZWRyYXcgfHwgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdztcbiAgICBpZiAoY2xlYXJGbGFnKSB7XG4gICAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBuZWVkc1JlZHJhdztcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFN0YXRlKHVwZGF0ZU9iamVjdCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdGF0ZSwgdXBkYXRlT2JqZWN0KTtcbiAgICB0aGlzLnN0YXRlLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFVuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5tb2RlbCkge1xuICAgICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRVbmlmb3Jtcyh1bmlmb3JtTWFwKTtcbiAgICB9XG4gICAgLy8gVE9ETyAtIHNldCBuZWVkc1JlZHJhdyBvbiB0aGUgbW9kZWw/XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gICAgbG9nKDMsICdsYXllci5zZXRVbmlmb3JtcycsIHVuaWZvcm1NYXApO1xuICB9XG5cbiAgLy8gVXNlIGl0ZXJhdGlvbiAodGhlIG9ubHkgcmVxdWlyZWQgY2FwYWJpbGl0eSBvbiBkYXRhKSB0byBnZXQgZmlyc3QgZWxlbWVudFxuICBnZXRGaXJzdE9iamVjdCgpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIERlZHVjZXMgbnVtZXIgb2YgaW5zdGFuY2VzLiBJbnRlbnRpb24gaXMgdG8gc3VwcG9ydDpcbiAgLy8gLSBFeHBsaWNpdCBzZXR0aW5nIG9mIG51bUluc3RhbmNlc1xuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBFUzYgY29udGFpbmVycyB0aGF0IGRlZmluZSBhIHNpemUgbWVtYmVyXG4gIC8vIC0gQXV0by1kZWR1Y3Rpb24gZm9yIENsYXNzaWMgQXJyYXlzIHZpYSB0aGUgYnVpbHQtaW4gbGVuZ3RoIGF0dHJpYnV0ZVxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIHZpYSBhcnJheXNcbiAgZ2V0TnVtSW5zdGFuY2VzKHByb3BzKSB7XG4gICAgcHJvcHMgPSBwcm9wcyB8fCB0aGlzLnByb3BzO1xuXG4gICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhlIGxheWVyIGhhcyBzZXQgaXRzIG93biB2YWx1ZVxuICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUubnVtSW5zdGFuY2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhcHAgaGFzIHNldCBhbiBleHBsaWNpdCB2YWx1ZVxuICAgIGlmIChwcm9wcy5udW1JbnN0YW5jZXMpIHtcbiAgICAgIHJldHVybiBwcm9wcy5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgY29uc3Qge2RhdGF9ID0gcHJvcHM7XG5cbiAgICAvLyBDaGVjayBpZiBFUzYgY29sbGVjdGlvbiBcInNpemVcIiBhdHRyaWJ1dGUgaXMgc2V0XG4gICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEuY291bnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBkYXRhLmNvdW50KCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgRVM2IGNvbGxlY3Rpb24gXCJzaXplXCIgYXR0cmlidXRlIGlzIHNldFxuICAgIGlmIChkYXRhICYmIGRhdGEuc2l6ZSkge1xuICAgICAgcmV0dXJuIGRhdGEuc2l6ZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhcnJheSBsZW5ndGggYXR0cmlidXRlIGlzIHNldCBvbiBkYXRhXG4gICAgLy8gTm90ZTogY2hlY2tpbmcgdGhpcyBsYXN0IHNpbmNlIHNvbWUgRVM2IGNvbGxlY3Rpb25zIChJbW11dGFibGUpXG4gICAgLy8gZW1pdCBwcm9mdXNlIHdhcm5pbmdzIHdoZW4gdHJ5aW5nIHRvIGFjY2VzcyAubGVuZ3RoXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBkYXRhLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBUT0RPIC0gc2xvdywgd2UgcHJvYmFibHkgc2hvdWxkIG5vdCBzdXBwb3J0IHRoaXMgdW5sZXNzXG4gICAgLy8gd2UgbGltaXQgdGhlIG51bWJlciBvZiBpbnZvY2F0aW9uc1xuICAgIC8vXG4gICAgLy8gVXNlIGl0ZXJhdGlvbiB0byBjb3VudCBvYmplY3RzXG4gICAgLy8gbGV0IGNvdW50ID0gMDtcbiAgICAvLyAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xuICAgIC8vIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAvLyAgIGNvdW50Kys7XG4gICAgLy8gfVxuICAgIC8vIHJldHVybiBjb3VudDtcblxuICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGRlZHVjZSBudW1JbnN0YW5jZXMnKTtcbiAgfVxuXG4gIC8vIEludGVybmFsIEhlbHBlcnNcblxuICBjaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIC8vIE5vdGU6IGRhdGFDaGFuZ2VkIG1pZ2h0IGFscmVhZHkgYmUgc2V0XG4gICAgaWYgKG5ld1Byb3BzLmRhdGEgIT09IG9sZFByb3BzLmRhdGEpIHtcbiAgICAgIC8vIEZpZ3VyZSBvdXQgZGF0YSBsZW5ndGhcbiAgICAgIHRoaXMuc3RhdGUuZGF0YUNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy53aWR0aCAhPT0gb2xkUHJvcHMud2lkdGggfHxcbiAgICAgIG5ld1Byb3BzLmhlaWdodCAhPT0gb2xkUHJvcHMuaGVpZ2h0IHx8XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7dmlld3BvcnRDaGFuZ2VkfSk7XG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGVzKHByb3BzKSB7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBudW1JbnN0YW5jZXMgPSB0aGlzLmdldE51bUluc3RhbmNlcyhwcm9wcyk7XG4gICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgIGF0dHJpYnV0ZU1hbmFnZXIudXBkYXRlKHtcbiAgICAgIG51bUluc3RhbmNlcyxcbiAgICAgIGJ1ZmZlck1hcDogcHJvcHMsXG4gICAgICBjb250ZXh0OiB0aGlzLFxuICAgICAgLy8gRG9uJ3Qgd29ycnkgYWJvdXQgbm9uLWF0dHJpYnV0ZSBwcm9wc1xuICAgICAgaWdub3JlVW5rbm93bkF0dHJpYnV0ZXM6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZUJhc2VVbmlmb3JtcygpIHtcbiAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgIC8vIGFwcGx5IGdhbW1hIHRvIG9wYWNpdHkgdG8gbWFrZSBpdCB2aXN1YWxseSBcImxpbmVhclwiXG4gICAgICBvcGFjaXR5OiBNYXRoLnBvdyh0aGlzLnByb3BzLm9wYWNpdHkgfHwgMC44LCAxIC8gMi4yKVxuICAgIH0pO1xuICB9XG5cbiAgLy8gTEFZRVIgTUFOQUdFUiBBUElcblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB3aGVuIGEgbmV3IGxheWVyIGlzIGZvdW5kXG4gIGluaXRpYWxpemVMYXllcih7Z2x9KSB7XG4gICAgYXNzZXJ0KGdsKTtcbiAgICB0aGlzLnN0YXRlID0ge2dsfTtcblxuICAgIC8vIEluaXRpYWxpemUgc3RhdGUgb25seSBvbmNlXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyOiBuZXcgQXR0cmlidXRlTWFuYWdlcih7aWQ6IHRoaXMucHJvcHMuaWR9KSxcbiAgICAgIG1vZGVsOiBudWxsLFxuICAgICAgbmVlZHNSZWRyYXc6IHRydWUsXG4gICAgICBkYXRhQ2hhbmdlZDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAvLyBBbGwgaW5zdGFuY2VkIGxheWVycyBnZXQgcGlja2luZ0NvbG9ycyBhdHRyaWJ1dGUgYnkgZGVmYXVsdFxuICAgIC8vIFRoZWlyIHNoYWRlcnMgY2FuIHVzZSBpdCB0byByZW5kZXIgYSBwaWNraW5nIHNjZW5lXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcGlja2luZ0NvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVQaWNraW5nQ29sb3JzfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZVN0YXRlKCk7XG4gICAgYXNzZXJ0KHRoaXMuc3RhdGUubW9kZWwsICdNb2RlbCBtdXN0IGJlIHNldCBpbiBpbml0aWFsaXplU3RhdGUnKTtcbiAgICB0aGlzLnNldFZpZXdwb3J0KCk7XG5cbiAgICAvLyBBZGQgYW55IHByaW1pdGl2ZSBhdHRyaWJ1dGVzXG4gICAgdGhpcy5faW5pdGlhbGl6ZVByaW1pdGl2ZUF0dHJpYnV0ZXMoKTtcblxuICAgIC8vIFRPRE8gLSB0aGUgYXBwIG11c3QgYmUgYWJsZSB0byBvdmVycmlkZVxuXG4gICAgLy8gQWRkIGFueSBzdWJjbGFzcyBhdHRyaWJ1dGVzXG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKHRoaXMucHJvcHMpO1xuICAgIHRoaXMudXBkYXRlQmFzZVVuaWZvcm1zKCk7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5zZXRJbnN0YW5jZUNvdW50KHRoaXMuZ2V0TnVtSW5zdGFuY2VzKCkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgbW9kZWwgZm9yIHRoZSBsYXllclxuICAgIHRoaXMuX3VwZGF0ZU1vZGVsKHtnbH0pO1xuXG4gICAgLy8gQ2FsbCBsaWZlIGN5Y2xlIG1ldGhvZFxuICAgIHRoaXMuZGlkTW91bnQoKTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gZXhpc3RpbmcgbGF5ZXIgaXMgZ2V0dGluZyBuZXcgcHJvcHNcbiAgdXBkYXRlTGF5ZXIob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgLy8gQ2FsY3VsYXRlIHN0YW5kYXJkIGNoYW5nZSBmbGFnc1xuICAgIHRoaXMuY2hlY2tQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gQ2hlY2sgaWYgYW55IHByb3BzIGhhdmUgY2hhbmdlZFxuICAgIGlmICh0aGlzLnNob3VsZFVwZGF0ZShvbGRQcm9wcywgbmV3UHJvcHMpKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgICAgdGhpcy5zZXRWaWV3cG9ydCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBMZXQgdGhlIHN1YmNsYXNzIG1hcmsgd2hhdCBpcyBuZWVkZWQgZm9yIHVwZGF0ZVxuICAgICAgdGhpcy53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgICAvLyBSdW4gdGhlIGF0dHJpYnV0ZSB1cGRhdGVyc1xuICAgICAgdGhpcy51cGRhdGVBdHRyaWJ1dGVzKG5ld1Byb3BzKTtcbiAgICAgIC8vIFVwZGF0ZSB0aGUgdW5pZm9ybXNcbiAgICAgIHRoaXMudXBkYXRlQmFzZVVuaWZvcm1zKCk7XG5cbiAgICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0SW5zdGFuY2VDb3VudCh0aGlzLmdldE51bUluc3RhbmNlcygpKTtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLmRhdGFDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5zdGF0ZS52aWV3cG9ydENoYW5nZWQgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBtYW5hZ2VyIHdoZW4gbGF5ZXIgaXMgYWJvdXQgdG8gYmUgZGlzcG9zZWRcbiAgLy8gTm90ZTogbm90IGd1YXJhbnRlZWQgdG8gYmUgY2FsbGVkIG9uIGFwcGxpY2F0aW9uIHNodXRkb3duXG4gIGZpbmFsaXplTGF5ZXIoKSB7XG4gICAgdGhpcy53aWxsVW5tb3VudCgpO1xuICB9XG5cbiAgY2FsY3VsYXRlUGlja2luZ0NvbG9ycyhhdHRyaWJ1dGUsIG51bUluc3RhbmNlcykge1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgLy8gYWRkIDEgdG8gaW5kZXggdG8gc2VwZXJhdGUgZnJvbSBubyBzZWxlY3Rpb25cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUluc3RhbmNlczsgaSsrKSB7XG4gICAgICBjb25zdCBwaWNraW5nQ29sb3IgPSB0aGlzLmVuY29kZVBpY2tpbmdDb2xvcihpKTtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMF0gPSBwaWNraW5nQ29sb3JbMF07XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDFdID0gcGlja2luZ0NvbG9yWzFdO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAyXSA9IHBpY2tpbmdDb2xvclsyXTtcbiAgICB9XG4gIH1cblxuICBkZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpIHtcbiAgICBhc3NlcnQoY29sb3IgaW5zdGFuY2VvZiBVaW50OEFycmF5KTtcbiAgICBjb25zdCBbaTEsIGkyLCBpM10gPSBjb2xvcjtcbiAgICAvLyAxIHdhcyBhZGRlZCB0byBzZXBlcmF0ZSBmcm9tIG5vIHNlbGVjdGlvblxuICAgIGNvbnN0IGluZGV4ID0gaTEgKyBpMiAqIDI1NiArIGkzICogNjU1MzYgLSAxO1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIGVuY29kZVBpY2tpbmdDb2xvcihpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIChpICsgMSkgJSAyNTYsXG4gICAgICBNYXRoLmZsb29yKChpICsgMSkgLyAyNTYpICUgMjU2LFxuICAgICAgTWF0aC5mbG9vcigoaSArIDEpIC8gMjU2IC8gMjU2KSAlIDI1NlxuICAgIF07XG4gIH1cblxuICAvLyBPdmVycmlkZSB0byBhZGQgb3IgbW9kaWZ5IGluZm8gaW4gc3VibGF5ZXJcbiAgLy8gVGhlIHN1YmxheWVyIG1heSBrbm93IHdoYXQgbGF0LGxvbiBjb3JyZXNwb25kcyB0byB1c2luZyBtYXRoIGV0Y1xuICAvLyBldmVuIHdoZW4gcGlja2luZyBkb2VzIG5vdCB3b3JrXG4gIG9uR2V0SG92ZXJJbmZvKGluZm8pIHtcbiAgICBjb25zdCB7Y29sb3J9ID0gaW5mbztcbiAgICBpbmZvLmluZGV4ID0gdGhpcy5kZWNvZGVQaWNraW5nQ29sb3IoY29sb3IpO1xuICAgIGluZm8uZ2VvQ29vcmRzID0gdGhpcy51bnByb2plY3Qoe3g6IGluZm8ueCwgeTogaW5mby55fSk7XG4gICAgcmV0dXJuIGluZm87XG4gIH1cblxuICBvbkhvdmVyKGluZm8pIHtcbiAgICBjb25zdCB7Y29sb3J9ID0gaW5mbztcbiAgICBjb25zdCBzZWxlY3RlZFBpY2tpbmdDb2xvciA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7XG4gICAgc2VsZWN0ZWRQaWNraW5nQ29sb3JbMF0gPSBjb2xvclswXTtcbiAgICBzZWxlY3RlZFBpY2tpbmdDb2xvclsxXSA9IGNvbG9yWzFdO1xuICAgIHNlbGVjdGVkUGlja2luZ0NvbG9yWzJdID0gY29sb3JbMl07XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7c2VsZWN0ZWRQaWNraW5nQ29sb3J9KTtcblxuICAgIGluZm8gPSB0aGlzLm9uR2V0SG92ZXJJbmZvKGluZm8pO1xuICAgIHJldHVybiB0aGlzLnByb3BzLm9uSG92ZXIoaW5mbyk7XG4gIH1cblxuICBvbkNsaWNrKGluZm8pIHtcbiAgICBpbmZvID0gdGhpcy5vbkdldEhvdmVySW5mbyhpbmZvKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKGluZm8pO1xuICB9XG5cbiAgLy8gSU5URVJOQUwgTUVUSE9EU1xuXG4gIC8vIFNldCB1cCBhdHRyaWJ1dGVzIHJlbGF0aW5nIHRvIHRoZSBwcmltaXRpdmUgaXRzZWxmIChub3QgdGhlIGluc3RhbmNlcylcbiAgX2luaXRpYWxpemVQcmltaXRpdmVBdHRyaWJ1dGVzKCkge1xuICAgIGNvbnN0IHtnbCwgbW9kZWwsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIC8vIFRPRE8gLSB0aGlzIHVucGFja3MgYW5kIHJlcGFja3MgdGhlIGF0dHJpYnV0ZXMsIHNlZW1zIHVubmVjZXNzYXJ5XG4gICAgaWYgKG1vZGVsLmdlb21ldHJ5Lmhhc0F0dHJpYnV0ZSgndmVydGljZXMnKSkge1xuICAgICAgY29uc3QgdmVydGljZXMgPSBtb2RlbC5nZW9tZXRyeS5nZXRBcnJheSgndmVydGljZXMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkVmVydGljZXModmVydGljZXMpO1xuICAgIH1cblxuICAgIGlmIChtb2RlbC5nZW9tZXRyeS5oYXNBdHRyaWJ1dGUoJ25vcm1hbHMnKSkge1xuICAgICAgY29uc3Qgbm9ybWFscyA9IG1vZGVsLmdlb21ldHJ5LmdldEFycmF5KCdub3JtYWxzJyk7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZE5vcm1hbHMobm9ybWFscyk7XG4gICAgfVxuXG4gICAgaWYgKG1vZGVsLmdlb21ldHJ5Lmhhc0F0dHJpYnV0ZSgnaW5kaWNlcycpKSB7XG4gICAgICBjb25zdCBpbmRpY2VzID0gbW9kZWwuZ2VvbWV0cnkuZ2V0QXJyYXkoJ2luZGljZXMnKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5kaWNlcyhpbmRpY2VzLCBnbCk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZU1vZGVsKHtnbH0pIHtcbiAgICBjb25zdCB7bW9kZWwsIGF0dHJpYnV0ZU1hbmFnZXIsIHVuaWZvcm1zfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBhc3NlcnQobW9kZWwpO1xuICAgIG1vZGVsLnNldEF0dHJpYnV0ZXMoYXR0cmlidXRlTWFuYWdlci5nZXRBdHRyaWJ1dGVzKCkpO1xuICAgIG1vZGVsLnNldFVuaWZvcm1zKHVuaWZvcm1zKTtcbiAgICAvLyB3aGV0aGVyIGN1cnJlbnQgbGF5ZXIgcmVzcG9uZHMgdG8gbW91c2UgZXZlbnRzXG4gICAgbW9kZWwuc2V0UGlja2FibGUodGhpcy5wcm9wcy5pc1BpY2thYmxlKTtcbiAgfVxuXG4gIGNoZWNrUHJvcChwcm9wZXJ0eSwgcHJvcGVydHlOYW1lKSB7XG4gICAgaWYgKCFwcm9wZXJ0eSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAke3Byb3BlcnR5TmFtZX0gdW5kZWZpbmVkIGluIGxheWVyICR7dGhpcy5pZH1gKTtcbiAgICB9XG4gIH1cblxuICAvLyBNQVAgTEFZRVIgRlVOQ1RJT05BTElUWVxuXG4gIHNldFZpZXdwb3J0KCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3cG9ydDogbmV3IGZsYXRXb3JsZC5WaWV3cG9ydCh3aWR0aCwgaGVpZ2h0KSxcbiAgICAgIG1lcmNhdG9yOiBWaWV3cG9ydE1lcmNhdG9yKHtcbiAgICAgICAgd2lkdGgsIGhlaWdodCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSxcbiAgICAgICAgdGlsZVNpemU6IDUxMlxuICAgICAgfSlcbiAgICB9KTtcbiAgICBjb25zdCB7eCwgeX0gPSB0aGlzLnN0YXRlLnZpZXdwb3J0O1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgdmlld3BvcnQ6IFt4LCB5LCB3aWR0aCwgaGVpZ2h0XSxcbiAgICAgIG1hcFZpZXdwb3J0OiBbbG9uZ2l0dWRlLCBsYXRpdHVkZSwgem9vbSwgZmxhdFdvcmxkLnNpemVdXG4gICAgfSk7XG4gICAgbG9nKDMsIHRoaXMuc3RhdGUudmlld3BvcnQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb20pO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvc2l0aW9uIGNvbnZlcnNpb24gaXMgZG9uZSBpbiBzaGFkZXIsIHNvIGluIG1hbnkgY2FzZXMgdGhlcmUgaXMgbm8gbmVlZFxuICAgKiBmb3IgdGhpcyBmdW5jdGlvblxuICAgKiBAcGFyYW0ge09iamVjdHxBcnJheX0gbGF0TG5nIC0gRWl0aGVyIFtsYXQsbG5nXSBvciB7bGF0LCBsb259XG4gICAqIEByZXR1cm4ge09iamVjdH0gLSB4LCB5XG4gICAqL1xuICBwcm9qZWN0KGxhdExuZykge1xuICAgIGNvbnN0IHttZXJjYXRvcn0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IFt4LCB5XSA9IEFycmF5LmlzQXJyYXkobGF0TG5nKSA/XG4gICAgICBtZXJjYXRvci5wcm9qZWN0KFtsYXRMbmdbMV0sIGxhdExuZ1swXV0pIDpcbiAgICAgIG1lcmNhdG9yLnByb2plY3QoW2xhdExuZy5sb24sIGxhdExuZy5sYXRdKTtcbiAgICByZXR1cm4ge3gsIHl9O1xuICB9XG5cbiAgdW5wcm9qZWN0KHh5KSB7XG4gICAgY29uc3Qge21lcmNhdG9yfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgW2xvbiwgbGF0XSA9IEFycmF5LmlzQXJyYXkoeHkpID9cbiAgICAgIG1lcmNhdG9yLnVucHJvamVjdCh4eSkgOlxuICAgICAgbWVyY2F0b3IudW5wcm9qZWN0KFt4eS54LCB4eS55XSk7XG4gICAgcmV0dXJuIHtsYXQsIGxvbn07XG4gIH1cblxuICBzY3JlZW5Ub1NwYWNlKHt4LCB5fSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiB2aWV3cG9ydC5zY3JlZW5Ub1NwYWNlKHt4LCB5fSk7XG4gIH1cblxufVxuIl19