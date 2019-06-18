var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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
import { COORDINATE_SYSTEM, LIFECYCLE } from './constants';
import AttributeManager from './attribute-manager';
import Stats from './stats';
import { getDefaultProps, diffProps as _diffProps } from './props';
import { count } from '../utils/count';
import log from '../utils/log';
import { applyPropOverrides, removeLayerInSeer } from './seer-integration';
import { GL, withParameters } from 'luma.gl';
import assert from 'assert';

var LOG_PRIORITY_UPDATE = 1;

var EMPTY_ARRAY = [];
var EMPTY_PROPS = {};
Object.freeze(EMPTY_PROPS);
var noop = function noop() {};

var defaultProps = {
  // data: Special handling for null, see below
  dataComparator: null,
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl
  numInstances: undefined,

  visible: true,
  pickable: false,
  opacity: 0.8,

  onHover: noop,
  onClick: noop,

  coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
  coordinateOrigin: [0, 0, 0],

  parameters: {},
  uniforms: {},
  framebuffer: null,

  animation: null, // Passed prop animation functions to evaluate props

  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: function getPolygonOffset(_ref) {
    var layerIndex = _ref.layerIndex;
    return [0, -layerIndex * 100];
  },

  // Selection/Highlighting
  highlightedObjectIndex: -1,
  autoHighlight: false,
  highlightColor: [0, 0, 128, 128]
};

var counter = 0;

var Layer = function () {
  function Layer(props) {
    _classCallCheck(this, Layer);

    // Call a helper function to merge the incoming props with defaults and freeze them.
    this.props = this._normalizeProps(props);

    // Define all members before layer is sealed
    this.id = this.props.id; // The layer's id, used for matching with layers from last render cycle
    this.oldProps = EMPTY_PROPS; // Props from last render used for change detection
    this.count = counter++; // Keep track of how many layer instances you are generating
    this.lifecycle = LIFECYCLE.NO_STATE; // Helps track and debug the life cycle of the layers
    this.state = null; // Will be set to the shared layer state object during layer matching
    this.context = null; // Will reference layer manager's context, contains state shared by layers
    this.parentLayer = null; // reference to the composite layer parent that rendered this layer

    // CompositeLayer members, need to be defined here because of the `Object.seal`
    this.internalState = null;

    // Seal the layer
    Object.seal(this);
  }

  _createClass(Layer, [{
    key: 'toString',
    value: function toString() {
      var className = this.constructor.layerName || this.constructor.name;
      return className + '({id: \'' + this.props.id + '\'})';
    }
  }, {
    key: 'needsUpdate',
    value: function needsUpdate() {
      // Call subclass lifecycle method
      return this.shouldUpdateState(this._getUpdateParams());
      // End lifecycle method
    }

    // Checks state of attributes and model

  }, {
    key: 'getNeedsRedraw',
    value: function getNeedsRedraw() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$clearRedrawFlag = _ref2.clearRedrawFlags,
          clearRedrawFlags = _ref2$clearRedrawFlag === undefined ? false : _ref2$clearRedrawFlag;

      return this._getNeedsRedraw(clearRedrawFlags);
    }

    // //////////////////////////////////////////////////
    // LIFECYCLE METHODS, overridden by the layer subclasses

    // Called once to set up the initial state
    // App can create WebGL resources

  }, {
    key: 'initializeState',
    value: function initializeState() {
      throw new Error('Layer ' + this + ' has not defined initializeState');
    }

    // Let's layer control if updateState should be called

  }, {
    key: 'shouldUpdateState',
    value: function shouldUpdateState(_ref3) {
      var oldProps = _ref3.oldProps,
          props = _ref3.props,
          oldContext = _ref3.oldContext,
          context = _ref3.context,
          changeFlags = _ref3.changeFlags;

      return changeFlags.propsOrDataChanged;
    }

    // Default implementation, all attributes will be invalidated and updated
    // when data changes

  }, {
    key: 'updateState',
    value: function updateState(_ref4) {
      var oldProps = _ref4.oldProps,
          props = _ref4.props,
          oldContext = _ref4.oldContext,
          context = _ref4.context,
          changeFlags = _ref4.changeFlags;
      var attributeManager = this.state.attributeManager;

      if (changeFlags.dataChanged && attributeManager) {
        attributeManager.invalidateAll();
      }
    }

    // Called once when layer is no longer matched and state will be discarded
    // App can destroy WebGL resources here

  }, {
    key: 'finalizeState',
    value: function finalizeState() {}

    // If state has a model, draw it with supplied uniforms

  }, {
    key: 'draw',
    value: function draw(opts) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.getModels()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var model = _step.value;

          model.draw(opts);
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

    // called to populate the info object that is passed to the event handler
    // @return null to cancel event

  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref5) {
      var info = _ref5.info,
          mode = _ref5.mode;
      var color = info.color,
          index = info.index;


      if (index >= 0) {
        // If props.data is an indexable array, get the object
        if (Array.isArray(this.props.data)) {
          info.object = this.props.data[index];
        }
      }

      // Backward compitability for old custom picking feature.
      // This uniform should be removed in 5.0 version.
      if (mode === 'hover') {
        var selectedPickingColor = color || new Float32Array([0, 0, 0]);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.getModels()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var model = _step2.value;

            model.setUniforms({ selectedPickingColor: selectedPickingColor });
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

      return info;
    }

    // END LIFECYCLE METHODS
    // //////////////////////////////////////////////////

    // Returns true if the layer is pickable and visible.

  }, {
    key: 'isPickable',
    value: function isPickable() {
      return this.props.pickable && this.props.visible;
    }

    // Default implementation of attribute invalidation, can be redefined

  }, {
    key: 'invalidateAttribute',
    value: function invalidateAttribute() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';
      var diffReason = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var attributeManager = this.state.attributeManager;

      if (!attributeManager) {
        return;
      }

      if (name === 'all') {
        log.log(LOG_PRIORITY_UPDATE, 'updateTriggers invalidating all attributes: ' + diffReason);
        attributeManager.invalidateAll();
      } else {
        log.log(LOG_PRIORITY_UPDATE, 'updateTriggers invalidating attribute ' + name + ': ' + diffReason);
        attributeManager.invalidate(name);
      }
    }

    // Calls attribute manager to update any WebGL attributes, can be redefined

  }, {
    key: 'updateAttributes',
    value: function updateAttributes(props) {
      var attributeManager = this.state.attributeManager;

      if (!attributeManager) {
        return;
      }

      // Figure out data length
      var numInstances = this.getNumInstances(props);

      attributeManager.update({
        data: props.data,
        numInstances: numInstances,
        props: props,
        buffers: props,
        context: this,
        // Don't worry about non-attribute props
        ignoreUnknownAttributes: true
      });

      // TODO - Use getModels?
      var model = this.state.model;

      if (model) {
        var changedAttributes = attributeManager.getChangedAttributes({ clearChangedFlags: true });
        model.setAttributes(changedAttributes);
      }
    }

    // Public API

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setState',
    value: function setState(updateObject) {
      Object.assign(this.state, updateObject);
      this.state.needsRedraw = true;
    }

    // Sets the redraw flag for this layer, will trigger a redraw next animation frame

  }, {
    key: 'setNeedsRedraw',
    value: function setNeedsRedraw() {
      var redraw = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (this.state) {
        this.state.needsRedraw = redraw;
      }
    }

    // Return an array of models used by this layer, can be overriden by layer subclass

  }, {
    key: 'getModels',
    value: function getModels() {
      return this.state.models || (this.state.model ? [this.state.model] : []);
    }

    // PROJECTION METHODS

    /**
     * Projects a point with current map state (lat, lon, zoom, pitch, bearing)
     *
     * Note: Position conversion is done in shader, so in many cases there is no need
     * for this function
     * @param {Array|TypedArray} lngLat - long and lat values
     * @return {Array|TypedArray} - x, y coordinates
     */

  }, {
    key: 'project',
    value: function project(lngLat) {
      var viewport = this.context.viewport;

      assert(Array.isArray(lngLat), 'Layer.project needs [lng,lat]');
      return viewport.project(lngLat);
    }
  }, {
    key: 'unproject',
    value: function unproject(xy) {
      var viewport = this.context.viewport;

      assert(Array.isArray(xy), 'Layer.unproject needs [x,y]');
      return viewport.unproject(xy);
    }
  }, {
    key: 'projectFlat',
    value: function projectFlat(lngLat) {
      var viewport = this.context.viewport;

      assert(Array.isArray(lngLat), 'Layer.project needs [lng,lat]');
      return viewport.projectFlat(lngLat);
    }
  }, {
    key: 'unprojectFlat',
    value: function unprojectFlat(xy) {
      var viewport = this.context.viewport;

      assert(Array.isArray(xy), 'Layer.unproject needs [x,y]');
      return viewport.unprojectFlat(xy);
    }

    // TODO - needs to refer to context

  }, {
    key: 'screenToDevicePixels',
    value: function screenToDevicePixels(screenPixels) {
      log.deprecated('screenToDevicePixels', 'DeckGL prop useDevicePixels for conversion');
      var devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
      return screenPixels * devicePixelRatio;
    }

    /**
     * Returns the picking color that doesn't match any subfeature
     * Use if some graphics do not belong to any pickable subfeature
     * @return {Array} - a black color
     */

  }, {
    key: 'nullPickingColor',
    value: function nullPickingColor() {
      return [0, 0, 0];
    }

    /**
     * Returns the picking color that doesn't match any subfeature
     * Use if some graphics do not belong to any pickable subfeature
     * @param {int} i - index to be decoded
     * @return {Array} - the decoded color
     */

  }, {
    key: 'encodePickingColor',
    value: function encodePickingColor(i) {
      assert((i + 1 >> 24 & 255) === 0, 'index out of picking color range');
      return [i + 1 & 255, i + 1 >> 8 & 255, i + 1 >> 8 >> 8 & 255];
    }

    /**
     * Returns the picking color that doesn't match any subfeature
     * Use if some graphics do not belong to any pickable subfeature
     * @param {Uint8Array} color - color array to be decoded
     * @return {Array} - the decoded picking color
     */

  }, {
    key: 'decodePickingColor',
    value: function decodePickingColor(color) {
      assert(color instanceof Uint8Array);

      var _color = _slicedToArray(color, 3),
          i1 = _color[0],
          i2 = _color[1],
          i3 = _color[2];
      // 1 was added to seperate from no selection


      var index = i1 + i2 * 256 + i3 * 65536 - 1;
      return index;
    }
  }, {
    key: 'calculateInstancePickingColors',
    value: function calculateInstancePickingColors(attribute, _ref6) {
      var numInstances = _ref6.numInstances;
      var value = attribute.value,
          size = attribute.size;
      // add 1 to index to seperate from no selection

      for (var i = 0; i < numInstances; i++) {
        var pickingColor = this.encodePickingColor(i);
        value[i * size + 0] = pickingColor[0];
        value[i * size + 1] = pickingColor[1];
        value[i * size + 2] = pickingColor[2];
      }
    }

    // DATA ACCESS API
    // Data can use iterators and may not be random access

    // Use iteration (the only required capability on data) to get first element

  }, {
    key: 'getFirstObject',
    value: function getFirstObject() {
      var data = this.props.data;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          return object;
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

      // Check if app has provided an explicit value
      if (props.numInstances !== undefined) {
        return props.numInstances;
      }

      // Use container library to get a count for any ES6 container or object
      var _props = props,
          data = _props.data;

      return count(data);
    }

    // clone this layer with modified props

  }, {
    key: 'clone',
    value: function clone(newProps) {
      return new this.constructor(Object.assign({}, this.props, newProps));
    }

    // LAYER MANAGER API
    // Should only be called by the deck.gl LayerManager class

    // Called by layer manager when a new layer is found
    /* eslint-disable max-statements */

  }, {
    key: '_initialize',
    value: function _initialize() {
      assert(arguments.length === 0);
      assert(this.context.gl);
      assert(!this.state);

      var attributeManager = new AttributeManager({ id: this.props.id });
      // All instanced layers get instancePickingColors attribute by default
      // Their shaders can use it to render a picking scene
      // TODO - this slightly slows down non instanced layers
      attributeManager.addInstanced({
        instancePickingColors: {
          type: GL.UNSIGNED_BYTE, size: 3, update: this.calculateInstancePickingColors
        }
      });

      this.internalState = {
        subLayers: null, // reference to sublayers rendered in a previous cycle
        stats: new Stats({ id: 'draw' })
        // animatedProps: null, // Computing animated props requires layer manager state
        // TODO - move these fields here (risks breaking layers)
        // attributeManager,
        // needsRedraw: true,
      };

      this.state = {
        attributeManager: attributeManager,
        model: null,
        needsRedraw: true
      };

      // Call subclass lifecycle methods
      this.initializeState(this.context);
      // End subclass lifecycle methods

      // initializeState callback tends to clear state
      this.setChangeFlags({ dataChanged: true, propsChanged: true, viewportChanged: true });

      this._updateState(this._getUpdateParams());

      if (this.isComposite) {
        this._renderLayers(true);
      }

      var model = this.state.model;

      if (model) {
        model.id = this.props.id;
        model.program.id = this.props.id + '-program';
        model.geometry.id = this.props.id + '-geometry';
        model.setAttributes(attributeManager.getAttributes());
      }

      // Last but not least, update any sublayers
      if (this.isComposite) {
        this._renderLayers();
      }

      this.clearChangeFlags();
    }

    // Called by layer manager
    // if this layer is new (not matched with an existing layer) oldProps will be empty object

  }, {
    key: '_update',
    value: function _update() {
      assert(arguments.length === 0);

      // Call subclass lifecycle method
      var stateNeedsUpdate = this.needsUpdate();
      // End lifecycle method

      var updateParams = {
        props: this.props,
        oldProps: this.oldProps,
        context: this.context,
        oldContext: this.oldContext,
        changeFlags: this.internalState.changeFlags
      };

      if (stateNeedsUpdate) {
        this._updateState(updateParams);
      }

      // Render or update previously rendered sublayers
      if (this.isComposite) {
        this._renderLayers(stateNeedsUpdate);
      }

      this.clearChangeFlags();
    }
    /* eslint-enable max-statements */

  }, {
    key: '_updateState',
    value: function _updateState(updateParams) {
      // Call subclass lifecycle methods
      this.updateState(updateParams);
      // End subclass lifecycle methods

      // Add any subclass attributes
      this.updateAttributes(this.props);
      this._updateBaseUniforms();
      this._updateModuleSettings();

      // Note: Automatic instance count update only works for single layers
      if (this.state.model) {
        this.state.model.setInstanceCount(this.getNumInstances());
      }
    }

    // Called by manager when layer is about to be disposed
    // Note: not guaranteed to be called on application shutdown

  }, {
    key: '_finalize',
    value: function _finalize() {
      assert(arguments.length === 0);
      // Call subclass lifecycle method
      this.finalizeState(this.context);
      // End lifecycle method
      removeLayerInSeer(this.id);
    }

    // Calculates uniforms

  }, {
    key: 'drawLayer',
    value: function drawLayer(_ref7) {
      var _this = this;

      var _ref7$moduleParameter = _ref7.moduleParameters,
          moduleParameters = _ref7$moduleParameter === undefined ? null : _ref7$moduleParameter,
          _ref7$uniforms = _ref7.uniforms,
          uniforms = _ref7$uniforms === undefined ? {} : _ref7$uniforms,
          _ref7$parameters = _ref7.parameters,
          parameters = _ref7$parameters === undefined ? {} : _ref7$parameters;


      // TODO/ib - hack move to luma Model.draw
      if (moduleParameters) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.getModels()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var model = _step4.value;

            model.updateModuleSettings(moduleParameters);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      // Apply polygon offset to avoid z-fighting
      // TODO - move to draw-layers
      var getPolygonOffset = this.props.getPolygonOffset;

      var offsets = getPolygonOffset && getPolygonOffset(uniforms) || [0, 0];
      parameters.polygonOffset = offsets;

      // Call subclass lifecycle method
      withParameters(this.context.gl, parameters, function () {
        _this.draw({ moduleParameters: moduleParameters, uniforms: uniforms, parameters: parameters, context: _this.context });
      });
      // End lifecycle method
    }

    // {uniforms = {}, ...opts}

  }, {
    key: 'pickLayer',
    value: function pickLayer(opts) {
      // Call subclass lifecycle method
      return this.getPickingInfo(opts);
      // End lifecycle method
    }

    // Helper methods

  }, {
    key: 'getChangeFlags',
    value: function getChangeFlags() {
      return this.internalState.changeFlags;
    }

    // Dirty some change flags, will be handled by updateLayer
    /* eslint-disable complexity */

  }, {
    key: 'setChangeFlags',
    value: function setChangeFlags(flags) {
      var _this2 = this;

      this.internalState.changeFlags = this.internalState.changeFlags || {};
      var changeFlags = this.internalState.changeFlags;

      // Update primary flags
      if (flags.dataChanged && !changeFlags.dataChanged) {
        changeFlags.dataChanged = flags.dataChanged;
        log.log(LOG_PRIORITY_UPDATE + 1, function () {
          return 'dataChanged: ' + flags.dataChanged + ' in ' + _this2.id;
        });
      }
      if (flags.updateTriggersChanged && !changeFlags.updateTriggersChanged) {
        changeFlags.updateTriggersChanged = changeFlags.updateTriggersChanged && flags.updateTriggersChanged ? Object.assign({}, flags.updateTriggersChanged, changeFlags.updateTriggersChanged) : flags.updateTriggersChanged || changeFlags.updateTriggersChanged;
        log.log(LOG_PRIORITY_UPDATE + 1, function () {
          return 'updateTriggersChanged: ' + (Object.keys(flags.updateTriggersChanged).join(', ') + ' in ' + _this2.id);
        });
      }
      if (flags.propsChanged && !changeFlags.propsChanged) {
        changeFlags.propsChanged = flags.propsChanged;
        log.log(LOG_PRIORITY_UPDATE + 1, function () {
          return 'propsChanged: ' + flags.propsChanged + ' in ' + _this2.id;
        });
      }
      if (flags.viewportChanged && !changeFlags.viewportChanged) {
        changeFlags.viewportChanged = flags.viewportChanged;
        log.log(LOG_PRIORITY_UPDATE + 2, function () {
          return 'viewportChanged: ' + flags.viewportChanged + ' in ' + _this2.id;
        });
      }

      // Update composite flags
      var propsOrDataChanged = flags.dataChanged || flags.updateTriggersChanged || flags.propsChanged;
      changeFlags.propsOrDataChanged = changeFlags.propsOrDataChanged || propsOrDataChanged;
      changeFlags.somethingChanged = changeFlags.somethingChanged || propsOrDataChanged || flags.viewportChanged;
    }
    /* eslint-enable complexity */

    // Clear all changeFlags, typically after an update

  }, {
    key: 'clearChangeFlags',
    value: function clearChangeFlags() {
      this.internalState.changeFlags = {
        // Primary changeFlags, can be strings stating reason for change
        dataChanged: false,
        propsChanged: false,
        updateTriggersChanged: false,
        viewportChanged: false,

        // Derived changeFlags
        propsOrDataChanged: false,
        somethingChanged: false
      };
    }
  }, {
    key: 'printChangeFlags',
    value: function printChangeFlags() {
      var flags = this.internalState.changeFlags;
      return '' + (flags.dataChanged ? 'data ' : '') + (flags.propsChanged ? 'props ' : '') + (flags.updateTriggersChanged ? 'triggers ' : '') + (flags.viewportChanged ? 'viewport' : '');
    }

    // Compares the layers props with old props from a matched older layer
    // and extracts change flags that describe what has change so that state
    // can be update correctly with minimal effort
    // TODO - arguments for testing only

  }, {
    key: 'diffProps',
    value: function diffProps() {
      var newProps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;
      var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.oldProps;

      var changeFlags = _diffProps(newProps, oldProps);

      // iterate over changedTriggers
      if (changeFlags.updateTriggersChanged) {
        for (var key in changeFlags.updateTriggersChanged) {
          if (changeFlags.updateTriggersChanged[key]) {
            this._activeUpdateTrigger(key);
          }
        }
      }

      return this.setChangeFlags(changeFlags);
    }

    // PRIVATE METHODS

  }, {
    key: '_getUpdateParams',
    value: function _getUpdateParams() {
      return {
        props: this.props,
        oldProps: this.oldProps,
        context: this.context,
        oldContext: this.oldContext || {},
        changeFlags: this.internalState.changeFlags
      };
    }

    // Checks state of attributes and model

  }, {
    key: '_getNeedsRedraw',
    value: function _getNeedsRedraw(clearRedrawFlags) {
      // this method may be called by the render loop as soon a the layer
      // has been created, so guard against uninitialized state
      if (!this.state) {
        return false;
      }

      var redraw = false;
      redraw = redraw || this.state.needsRedraw && this.id;
      this.state.needsRedraw = this.state.needsRedraw && !clearRedrawFlags;

      // TODO - is attribute manager needed? - Model should be enough.
      var attributeManager = this.state.attributeManager;

      var attributeManagerNeedsRedraw = attributeManager && attributeManager.getNeedsRedraw({ clearRedrawFlags: clearRedrawFlags });
      redraw = redraw || attributeManagerNeedsRedraw;

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.getModels()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var model = _step5.value;

          var modelNeedsRedraw = model.getNeedsRedraw({ clearRedrawFlags: clearRedrawFlags });
          if (modelNeedsRedraw && typeof modelNeedsRedraw !== 'string') {
            modelNeedsRedraw = 'model ' + model.id;
          }
          redraw = redraw || modelNeedsRedraw;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return redraw;
    }

    // Helper for constructor, merges props with default props and freezes them

  }, {
    key: '_normalizeProps',
    value: function _normalizeProps(props) {
      // If sublayer has static defaultProps member, getDefaultProps will return it
      var mergedDefaultProps = getDefaultProps(this);
      // Merge supplied props with pre-merged default props
      props = Object.assign({}, mergedDefaultProps, props);
      // Accept null as data - otherwise apps and layers need to add ugly checks
      // Use constant fallback so that data change is not triggered
      props.data = props.data || EMPTY_ARRAY;
      // Apply any overrides from the seer debug extension if it is active
      applyPropOverrides(props);
      // Props are immutable
      Object.freeze(props);
      return props;
    }

    // Called by layer manager to transfer state from an old layer

  }, {
    key: '_transferState',
    value: function _transferState(oldLayer) {
      var state = oldLayer.state,
          internalState = oldLayer.internalState,
          props = oldLayer.props;

      assert(state && internalState);

      // Move state
      state.layer = this;
      this.state = state;
      this.internalState = internalState;
      // Note: We keep the state ref on old layers to support async actions
      // oldLayer.state = null;

      // Keep a temporary ref to the old props, for prop comparison
      this.oldProps = props;

      // Update model layer reference
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.getModels()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var model = _step6.value;

          model.userData.layer = this;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      this.diffProps();
    }

    // Operate on each changed triggers, will be called when an updateTrigger changes

  }, {
    key: '_activeUpdateTrigger',
    value: function _activeUpdateTrigger(propName) {
      this.invalidateAttribute(propName);
    }

    //  Helper to check that required props are supplied

  }, {
    key: '_checkRequiredProp',
    value: function _checkRequiredProp(propertyName, condition) {
      var value = this.props[propertyName];
      if (value === undefined) {
        throw new Error('Property ' + propertyName + ' undefined in layer ' + this);
      }
      if (condition && !condition(value)) {
        throw new Error('Bad property ' + propertyName + ' in layer ' + this);
      }
    }

    // Emits a warning if an old prop is used, optionally suggesting a replacement

  }, {
    key: '_checkRemovedProp',
    value: function _checkRemovedProp(oldProp) {
      var newProp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (this.props[oldProp] !== undefined) {
        var layerName = this.constructor;
        var message = layerName + ' no longer accepts props.' + oldProp + ' in this version of deck.gl.';
        if (newProp) {
          message += '\nPlease use props.' + newProp + ' instead.';
        }
        log.once(0, message);
      }
    }
  }, {
    key: '_updateBaseUniforms',
    value: function _updateBaseUniforms() {
      var uniforms = {
        // apply gamma to opacity to make it visually "linear"
        opacity: Math.pow(this.props.opacity, 1 / 2.2),
        ONE: 1.0
      };
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.getModels()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var model = _step7.value;

          model.setUniforms(uniforms);
        }

        // TODO - set needsRedraw on the model(s)?
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      this.state.needsRedraw = true;
    }
  }, {
    key: '_updateModuleSettings',
    value: function _updateModuleSettings() {
      var settings = {
        pickingHighlightColor: this.props.highlightColor
      };
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.getModels()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var model = _step8.value;

          model.updateModuleSettings(settings);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }

    // DEPRECATED METHODS

    // Updates selected state members and marks the object for redraw

  }, {
    key: 'setUniforms',
    value: function setUniforms(uniformMap) {
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.getModels()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var model = _step9.value;

          model.setUniforms(uniformMap);
        }

        // TODO - set needsRedraw on the model(s)?
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      this.state.needsRedraw = true;
      log.deprecated('layer.setUniforms', 'model.setUniforms');
    }
  }, {
    key: 'stats',
    get: function get() {
      return this.internalState.stats;
    }
  }]);

  return Layer;
}();

export default Layer;


Layer.layerName = 'Layer';
Layer.propTypes = defaultProps;
Layer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2xpYi9sYXllci5qcyJdLCJuYW1lcyI6WyJDT09SRElOQVRFX1NZU1RFTSIsIkxJRkVDWUNMRSIsIkF0dHJpYnV0ZU1hbmFnZXIiLCJTdGF0cyIsImdldERlZmF1bHRQcm9wcyIsImRpZmZQcm9wcyIsImNvdW50IiwibG9nIiwiYXBwbHlQcm9wT3ZlcnJpZGVzIiwicmVtb3ZlTGF5ZXJJblNlZXIiLCJHTCIsIndpdGhQYXJhbWV0ZXJzIiwiYXNzZXJ0IiwiTE9HX1BSSU9SSVRZX1VQREFURSIsIkVNUFRZX0FSUkFZIiwiRU1QVFlfUFJPUFMiLCJPYmplY3QiLCJmcmVlemUiLCJub29wIiwiZGVmYXVsdFByb3BzIiwiZGF0YUNvbXBhcmF0b3IiLCJ1cGRhdGVUcmlnZ2VycyIsIm51bUluc3RhbmNlcyIsInVuZGVmaW5lZCIsInZpc2libGUiLCJwaWNrYWJsZSIsIm9wYWNpdHkiLCJvbkhvdmVyIiwib25DbGljayIsImNvb3JkaW5hdGVTeXN0ZW0iLCJMTkdMQVQiLCJjb29yZGluYXRlT3JpZ2luIiwicGFyYW1ldGVycyIsInVuaWZvcm1zIiwiZnJhbWVidWZmZXIiLCJhbmltYXRpb24iLCJnZXRQb2x5Z29uT2Zmc2V0IiwibGF5ZXJJbmRleCIsImhpZ2hsaWdodGVkT2JqZWN0SW5kZXgiLCJhdXRvSGlnaGxpZ2h0IiwiaGlnaGxpZ2h0Q29sb3IiLCJjb3VudGVyIiwiTGF5ZXIiLCJwcm9wcyIsIl9ub3JtYWxpemVQcm9wcyIsImlkIiwib2xkUHJvcHMiLCJsaWZlY3ljbGUiLCJOT19TVEFURSIsInN0YXRlIiwiY29udGV4dCIsInBhcmVudExheWVyIiwiaW50ZXJuYWxTdGF0ZSIsInNlYWwiLCJjbGFzc05hbWUiLCJjb25zdHJ1Y3RvciIsImxheWVyTmFtZSIsIm5hbWUiLCJzaG91bGRVcGRhdGVTdGF0ZSIsIl9nZXRVcGRhdGVQYXJhbXMiLCJjbGVhclJlZHJhd0ZsYWdzIiwiX2dldE5lZWRzUmVkcmF3IiwiRXJyb3IiLCJvbGRDb250ZXh0IiwiY2hhbmdlRmxhZ3MiLCJwcm9wc09yRGF0YUNoYW5nZWQiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwiZGF0YUNoYW5nZWQiLCJpbnZhbGlkYXRlQWxsIiwib3B0cyIsImdldE1vZGVscyIsIm1vZGVsIiwiZHJhdyIsImluZm8iLCJtb2RlIiwiY29sb3IiLCJpbmRleCIsIkFycmF5IiwiaXNBcnJheSIsImRhdGEiLCJvYmplY3QiLCJzZWxlY3RlZFBpY2tpbmdDb2xvciIsIkZsb2F0MzJBcnJheSIsInNldFVuaWZvcm1zIiwiZGlmZlJlYXNvbiIsImludmFsaWRhdGUiLCJnZXROdW1JbnN0YW5jZXMiLCJ1cGRhdGUiLCJidWZmZXJzIiwiaWdub3JlVW5rbm93bkF0dHJpYnV0ZXMiLCJjaGFuZ2VkQXR0cmlidXRlcyIsImdldENoYW5nZWRBdHRyaWJ1dGVzIiwiY2xlYXJDaGFuZ2VkRmxhZ3MiLCJzZXRBdHRyaWJ1dGVzIiwidXBkYXRlT2JqZWN0IiwiYXNzaWduIiwibmVlZHNSZWRyYXciLCJyZWRyYXciLCJtb2RlbHMiLCJsbmdMYXQiLCJ2aWV3cG9ydCIsInByb2plY3QiLCJ4eSIsInVucHJvamVjdCIsInByb2plY3RGbGF0IiwidW5wcm9qZWN0RmxhdCIsInNjcmVlblBpeGVscyIsImRlcHJlY2F0ZWQiLCJkZXZpY2VQaXhlbFJhdGlvIiwid2luZG93IiwiaSIsIlVpbnQ4QXJyYXkiLCJpMSIsImkyIiwiaTMiLCJhdHRyaWJ1dGUiLCJ2YWx1ZSIsInNpemUiLCJwaWNraW5nQ29sb3IiLCJlbmNvZGVQaWNraW5nQ29sb3IiLCJuZXdQcm9wcyIsImFyZ3VtZW50cyIsImxlbmd0aCIsImdsIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQaWNraW5nQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZVBpY2tpbmdDb2xvcnMiLCJzdWJMYXllcnMiLCJzdGF0cyIsImluaXRpYWxpemVTdGF0ZSIsInNldENoYW5nZUZsYWdzIiwicHJvcHNDaGFuZ2VkIiwidmlld3BvcnRDaGFuZ2VkIiwiX3VwZGF0ZVN0YXRlIiwiaXNDb21wb3NpdGUiLCJfcmVuZGVyTGF5ZXJzIiwicHJvZ3JhbSIsImdlb21ldHJ5IiwiZ2V0QXR0cmlidXRlcyIsImNsZWFyQ2hhbmdlRmxhZ3MiLCJzdGF0ZU5lZWRzVXBkYXRlIiwibmVlZHNVcGRhdGUiLCJ1cGRhdGVQYXJhbXMiLCJ1cGRhdGVTdGF0ZSIsInVwZGF0ZUF0dHJpYnV0ZXMiLCJfdXBkYXRlQmFzZVVuaWZvcm1zIiwiX3VwZGF0ZU1vZHVsZVNldHRpbmdzIiwic2V0SW5zdGFuY2VDb3VudCIsImZpbmFsaXplU3RhdGUiLCJtb2R1bGVQYXJhbWV0ZXJzIiwidXBkYXRlTW9kdWxlU2V0dGluZ3MiLCJvZmZzZXRzIiwicG9seWdvbk9mZnNldCIsImdldFBpY2tpbmdJbmZvIiwiZmxhZ3MiLCJ1cGRhdGVUcmlnZ2Vyc0NoYW5nZWQiLCJrZXlzIiwiam9pbiIsInNvbWV0aGluZ0NoYW5nZWQiLCJrZXkiLCJfYWN0aXZlVXBkYXRlVHJpZ2dlciIsImF0dHJpYnV0ZU1hbmFnZXJOZWVkc1JlZHJhdyIsImdldE5lZWRzUmVkcmF3IiwibW9kZWxOZWVkc1JlZHJhdyIsIm1lcmdlZERlZmF1bHRQcm9wcyIsIm9sZExheWVyIiwibGF5ZXIiLCJ1c2VyRGF0YSIsInByb3BOYW1lIiwiaW52YWxpZGF0ZUF0dHJpYnV0ZSIsInByb3BlcnR5TmFtZSIsImNvbmRpdGlvbiIsIm9sZFByb3AiLCJuZXdQcm9wIiwibWVzc2FnZSIsIm9uY2UiLCJNYXRoIiwicG93IiwiT05FIiwic2V0dGluZ3MiLCJwaWNraW5nSGlnaGxpZ2h0Q29sb3IiLCJ1bmlmb3JtTWFwIiwicHJvcFR5cGVzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQVFBLGlCQUFSLEVBQTJCQyxTQUEz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QkFBTixDQUEyQjZCLFFBQTNCO0FBQ0Q7QUFOcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU92Qjs7QUFFRDs7QUFFQTs7OztnQ0FDWUUsVSxFQUFZO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ3RCLDhCQUFvQixLQUFLakgsU0FBTCxFQUFwQixtSUFBc0M7QUFBQSxjQUEzQkMsS0FBMkI7O0FBQ3BDQSxnQkFBTVksV0FBTixDQUFrQm9HLFVBQWxCO0FBQ0Q7O0FBRUQ7QUFMc0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFNdEIsV0FBS3RJLEtBQUwsQ0FBVytDLFdBQVgsR0FBeUIsSUFBekI7QUFDQXpGLFVBQUlvRyxVQUFKLENBQWUsbUJBQWYsRUFBb0MsbUJBQXBDO0FBQ0Q7Ozt3QkFycEJXO0FBQ1YsYUFBTyxLQUFLdkQsYUFBTCxDQUFtQjhFLEtBQTFCO0FBQ0Q7Ozs7OztlQTVCa0J4RixLOzs7QUFrckJyQkEsTUFBTWMsU0FBTixHQUFrQixPQUFsQjtBQUNBZCxNQUFNOEksU0FBTixHQUFrQnJLLFlBQWxCO0FBQ0F1QixNQUFNdkIsWUFBTixHQUFxQkEsWUFBckIiLCJmaWxlIjoibGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLyogZ2xvYmFsIHdpbmRvdyAqL1xuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTSwgTElGRUNZQ0xFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgQXR0cmlidXRlTWFuYWdlciBmcm9tICcuL2F0dHJpYnV0ZS1tYW5hZ2VyJztcbmltcG9ydCBTdGF0cyBmcm9tICcuL3N0YXRzJztcbmltcG9ydCB7Z2V0RGVmYXVsdFByb3BzLCBkaWZmUHJvcHN9IGZyb20gJy4vcHJvcHMnO1xuaW1wb3J0IHtjb3VudH0gZnJvbSAnLi4vdXRpbHMvY291bnQnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi91dGlscy9sb2cnO1xuaW1wb3J0IHthcHBseVByb3BPdmVycmlkZXMsIHJlbW92ZUxheWVySW5TZWVyfSBmcm9tICcuL3NlZXItaW50ZWdyYXRpb24nO1xuaW1wb3J0IHtHTCwgd2l0aFBhcmFtZXRlcnN9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBMT0dfUFJJT1JJVFlfVVBEQVRFID0gMTtcblxuY29uc3QgRU1QVFlfQVJSQVkgPSBbXTtcbmNvbnN0IEVNUFRZX1BST1BTID0ge307XG5PYmplY3QuZnJlZXplKEVNUFRZX1BST1BTKTtcbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICAvLyBkYXRhOiBTcGVjaWFsIGhhbmRsaW5nIGZvciBudWxsLCBzZWUgYmVsb3dcbiAgZGF0YUNvbXBhcmF0b3I6IG51bGwsXG4gIHVwZGF0ZVRyaWdnZXJzOiB7fSwgLy8gVXBkYXRlIHRyaWdnZXJzOiBhIGNvcmUgY2hhbmdlIGRldGVjdGlvbiBtZWNoYW5pc20gaW4gZGVjay5nbFxuICBudW1JbnN0YW5jZXM6IHVuZGVmaW5lZCxcblxuICB2aXNpYmxlOiB0cnVlLFxuICBwaWNrYWJsZTogZmFsc2UsXG4gIG9wYWNpdHk6IDAuOCxcblxuICBvbkhvdmVyOiBub29wLFxuICBvbkNsaWNrOiBub29wLFxuXG4gIGNvb3JkaW5hdGVTeXN0ZW06IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCxcbiAgY29vcmRpbmF0ZU9yaWdpbjogWzAsIDAsIDBdLFxuXG4gIHBhcmFtZXRlcnM6IHt9LFxuICB1bmlmb3Jtczoge30sXG4gIGZyYW1lYnVmZmVyOiBudWxsLFxuXG4gIGFuaW1hdGlvbjogbnVsbCwgLy8gUGFzc2VkIHByb3AgYW5pbWF0aW9uIGZ1bmN0aW9ucyB0byBldmFsdWF0ZSBwcm9wc1xuXG4gIC8vIE9mZnNldCBkZXB0aCBiYXNlZCBvbiBsYXllciBpbmRleCB0byBhdm9pZCB6LWZpZ2h0aW5nLlxuICAvLyBOZWdhdGl2ZSB2YWx1ZXMgcHVsbCBsYXllciB0b3dhcmRzIHRoZSBjYW1lcmFcbiAgLy8gaHR0cHM6Ly93d3cub3BlbmdsLm9yZy9hcmNoaXZlcy9yZXNvdXJjZXMvZmFxL3RlY2huaWNhbC9wb2x5Z29ub2Zmc2V0Lmh0bVxuICBnZXRQb2x5Z29uT2Zmc2V0OiAoe2xheWVySW5kZXh9KSA9PiBbMCwgLWxheWVySW5kZXggKiAxMDBdLFxuXG4gIC8vIFNlbGVjdGlvbi9IaWdobGlnaHRpbmdcbiAgaGlnaGxpZ2h0ZWRPYmplY3RJbmRleDogLTEsXG4gIGF1dG9IaWdobGlnaHQ6IGZhbHNlLFxuICBoaWdobGlnaHRDb2xvcjogWzAsIDAsIDEyOCwgMTI4XVxufTtcblxubGV0IGNvdW50ZXIgPSAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMYXllciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgLy8gQ2FsbCBhIGhlbHBlciBmdW5jdGlvbiB0byBtZXJnZSB0aGUgaW5jb21pbmcgcHJvcHMgd2l0aCBkZWZhdWx0cyBhbmQgZnJlZXplIHRoZW0uXG4gICAgdGhpcy5wcm9wcyA9IHRoaXMuX25vcm1hbGl6ZVByb3BzKHByb3BzKTtcblxuICAgIC8vIERlZmluZSBhbGwgbWVtYmVycyBiZWZvcmUgbGF5ZXIgaXMgc2VhbGVkXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvcHMuaWQ7IC8vIFRoZSBsYXllcidzIGlkLCB1c2VkIGZvciBtYXRjaGluZyB3aXRoIGxheWVycyBmcm9tIGxhc3QgcmVuZGVyIGN5Y2xlXG4gICAgdGhpcy5vbGRQcm9wcyA9IEVNUFRZX1BST1BTOyAvLyBQcm9wcyBmcm9tIGxhc3QgcmVuZGVyIHVzZWQgZm9yIGNoYW5nZSBkZXRlY3Rpb25cbiAgICB0aGlzLmNvdW50ID0gY291bnRlcisrOyAvLyBLZWVwIHRyYWNrIG9mIGhvdyBtYW55IGxheWVyIGluc3RhbmNlcyB5b3UgYXJlIGdlbmVyYXRpbmdcbiAgICB0aGlzLmxpZmVjeWNsZSA9IExJRkVDWUNMRS5OT19TVEFURTsgLy8gSGVscHMgdHJhY2sgYW5kIGRlYnVnIHRoZSBsaWZlIGN5Y2xlIG9mIHRoZSBsYXllcnNcbiAgICB0aGlzLnN0YXRlID0gbnVsbDsgLy8gV2lsbCBiZSBzZXQgdG8gdGhlIHNoYXJlZCBsYXllciBzdGF0ZSBvYmplY3QgZHVyaW5nIGxheWVyIG1hdGNoaW5nXG4gICAgdGhpcy5jb250ZXh0ID0gbnVsbDsgLy8gV2lsbCByZWZlcmVuY2UgbGF5ZXIgbWFuYWdlcidzIGNvbnRleHQsIGNvbnRhaW5zIHN0YXRlIHNoYXJlZCBieSBsYXllcnNcbiAgICB0aGlzLnBhcmVudExheWVyID0gbnVsbDsgLy8gcmVmZXJlbmNlIHRvIHRoZSBjb21wb3NpdGUgbGF5ZXIgcGFyZW50IHRoYXQgcmVuZGVyZWQgdGhpcyBsYXllclxuXG4gICAgLy8gQ29tcG9zaXRlTGF5ZXIgbWVtYmVycywgbmVlZCB0byBiZSBkZWZpbmVkIGhlcmUgYmVjYXVzZSBvZiB0aGUgYE9iamVjdC5zZWFsYFxuICAgIHRoaXMuaW50ZXJuYWxTdGF0ZSA9IG51bGw7XG5cbiAgICAvLyBTZWFsIHRoZSBsYXllclxuICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5sYXllck5hbWUgfHwgdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIHJldHVybiBgJHtjbGFzc05hbWV9KHtpZDogJyR7dGhpcy5wcm9wcy5pZH0nfSlgO1xuICB9XG5cbiAgZ2V0IHN0YXRzKCkge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsU3RhdGUuc3RhdHM7XG4gIH1cblxuICBuZWVkc1VwZGF0ZSgpIHtcbiAgICAvLyBDYWxsIHN1YmNsYXNzIGxpZmVjeWNsZSBtZXRob2RcbiAgICByZXR1cm4gdGhpcy5zaG91bGRVcGRhdGVTdGF0ZSh0aGlzLl9nZXRVcGRhdGVQYXJhbXMoKSk7XG4gICAgLy8gRW5kIGxpZmVjeWNsZSBtZXRob2RcbiAgfVxuXG4gIC8vIENoZWNrcyBzdGF0ZSBvZiBhdHRyaWJ1dGVzIGFuZCBtb2RlbFxuICBnZXROZWVkc1JlZHJhdyh7Y2xlYXJSZWRyYXdGbGFncyA9IGZhbHNlfSA9IHt9KSB7XG4gICAgcmV0dXJuIHRoaXMuIF9nZXROZWVkc1JlZHJhdyhjbGVhclJlZHJhd0ZsYWdzKTtcbiAgfVxuXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIExJRkVDWUNMRSBNRVRIT0RTLCBvdmVycmlkZGVuIGJ5IHRoZSBsYXllciBzdWJjbGFzc2VzXG5cbiAgLy8gQ2FsbGVkIG9uY2UgdG8gc2V0IHVwIHRoZSBpbml0aWFsIHN0YXRlXG4gIC8vIEFwcCBjYW4gY3JlYXRlIFdlYkdMIHJlc291cmNlc1xuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBMYXllciAke3RoaXN9IGhhcyBub3QgZGVmaW5lZCBpbml0aWFsaXplU3RhdGVgKTtcbiAgfVxuXG4gIC8vIExldCdzIGxheWVyIGNvbnRyb2wgaWYgdXBkYXRlU3RhdGUgc2hvdWxkIGJlIGNhbGxlZFxuICBzaG91bGRVcGRhdGVTdGF0ZSh7b2xkUHJvcHMsIHByb3BzLCBvbGRDb250ZXh0LCBjb250ZXh0LCBjaGFuZ2VGbGFnc30pIHtcbiAgICByZXR1cm4gY2hhbmdlRmxhZ3MucHJvcHNPckRhdGFDaGFuZ2VkO1xuICB9XG5cbiAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiwgYWxsIGF0dHJpYnV0ZXMgd2lsbCBiZSBpbnZhbGlkYXRlZCBhbmQgdXBkYXRlZFxuICAvLyB3aGVuIGRhdGEgY2hhbmdlc1xuICB1cGRhdGVTdGF0ZSh7b2xkUHJvcHMsIHByb3BzLCBvbGRDb250ZXh0LCBjb250ZXh0LCBjaGFuZ2VGbGFnc30pIHtcbiAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChjaGFuZ2VGbGFncy5kYXRhQ2hhbmdlZCAmJiBhdHRyaWJ1dGVNYW5hZ2VyKSB7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsZWQgb25jZSB3aGVuIGxheWVyIGlzIG5vIGxvbmdlciBtYXRjaGVkIGFuZCBzdGF0ZSB3aWxsIGJlIGRpc2NhcmRlZFxuICAvLyBBcHAgY2FuIGRlc3Ryb3kgV2ViR0wgcmVzb3VyY2VzIGhlcmVcbiAgZmluYWxpemVTdGF0ZSgpIHtcbiAgfVxuXG4gIC8vIElmIHN0YXRlIGhhcyBhIG1vZGVsLCBkcmF3IGl0IHdpdGggc3VwcGxpZWQgdW5pZm9ybXNcbiAgZHJhdyhvcHRzKSB7XG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiB0aGlzLmdldE1vZGVscygpKSB7XG4gICAgICBtb2RlbC5kcmF3KG9wdHMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGxlZCB0byBwb3B1bGF0ZSB0aGUgaW5mbyBvYmplY3QgdGhhdCBpcyBwYXNzZWQgdG8gdGhlIGV2ZW50IGhhbmRsZXJcbiAgLy8gQHJldHVybiBudWxsIHRvIGNhbmNlbCBldmVudFxuICBnZXRQaWNraW5nSW5mbyh7aW5mbywgbW9kZX0pIHtcbiAgICBjb25zdCB7Y29sb3IsIGluZGV4fSA9IGluZm87XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgLy8gSWYgcHJvcHMuZGF0YSBpcyBhbiBpbmRleGFibGUgYXJyYXksIGdldCB0aGUgb2JqZWN0XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLnByb3BzLmRhdGEpKSB7XG4gICAgICAgIGluZm8ub2JqZWN0ID0gdGhpcy5wcm9wcy5kYXRhW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCYWNrd2FyZCBjb21waXRhYmlsaXR5IGZvciBvbGQgY3VzdG9tIHBpY2tpbmcgZmVhdHVyZS5cbiAgICAvLyBUaGlzIHVuaWZvcm0gc2hvdWxkIGJlIHJlbW92ZWQgaW4gNS4wIHZlcnNpb24uXG4gICAgaWYgKG1vZGUgPT09ICdob3ZlcicpIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkUGlja2luZ0NvbG9yID0gY29sb3IgfHwgbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMF0pO1xuICAgICAgZm9yIChjb25zdCBtb2RlbCBvZiB0aGlzLmdldE1vZGVscygpKSB7XG4gICAgICAgIG1vZGVsLnNldFVuaWZvcm1zKHtzZWxlY3RlZFBpY2tpbmdDb2xvcn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbmZvO1xuICB9XG5cbiAgLy8gRU5EIExJRkVDWUNMRSBNRVRIT0RTXG4gIC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBsYXllciBpcyBwaWNrYWJsZSBhbmQgdmlzaWJsZS5cbiAgaXNQaWNrYWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5waWNrYWJsZSAmJiB0aGlzLnByb3BzLnZpc2libGU7XG4gIH1cblxuICAvLyBEZWZhdWx0IGltcGxlbWVudGF0aW9uIG9mIGF0dHJpYnV0ZSBpbnZhbGlkYXRpb24sIGNhbiBiZSByZWRlZmluZWRcbiAgaW52YWxpZGF0ZUF0dHJpYnV0ZShuYW1lID0gJ2FsbCcsIGRpZmZSZWFzb24gPSAnJykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFhdHRyaWJ1dGVNYW5hZ2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG5hbWUgPT09ICdhbGwnKSB7XG4gICAgICBsb2cubG9nKExPR19QUklPUklUWV9VUERBVEUsIGB1cGRhdGVUcmlnZ2VycyBpbnZhbGlkYXRpbmcgYWxsIGF0dHJpYnV0ZXM6ICR7ZGlmZlJlYXNvbn1gKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cubG9nKExPR19QUklPUklUWV9VUERBVEUsIGB1cGRhdGVUcmlnZ2VycyBpbnZhbGlkYXRpbmcgYXR0cmlidXRlICR7bmFtZX06ICR7ZGlmZlJlYXNvbn1gKTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZShuYW1lKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWxscyBhdHRyaWJ1dGUgbWFuYWdlciB0byB1cGRhdGUgYW55IFdlYkdMIGF0dHJpYnV0ZXMsIGNhbiBiZSByZWRlZmluZWRcbiAgdXBkYXRlQXR0cmlidXRlcyhwcm9wcykge1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFhdHRyaWJ1dGVNYW5hZ2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRmlndXJlIG91dCBkYXRhIGxlbmd0aFxuICAgIGNvbnN0IG51bUluc3RhbmNlcyA9IHRoaXMuZ2V0TnVtSW5zdGFuY2VzKHByb3BzKTtcblxuICAgIGF0dHJpYnV0ZU1hbmFnZXIudXBkYXRlKHtcbiAgICAgIGRhdGE6IHByb3BzLmRhdGEsXG4gICAgICBudW1JbnN0YW5jZXMsXG4gICAgICBwcm9wcyxcbiAgICAgIGJ1ZmZlcnM6IHByb3BzLFxuICAgICAgY29udGV4dDogdGhpcyxcbiAgICAgIC8vIERvbid0IHdvcnJ5IGFib3V0IG5vbi1hdHRyaWJ1dGUgcHJvcHNcbiAgICAgIGlnbm9yZVVua25vd25BdHRyaWJ1dGVzOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPIC0gVXNlIGdldE1vZGVscz9cbiAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAobW9kZWwpIHtcbiAgICAgIGNvbnN0IGNoYW5nZWRBdHRyaWJ1dGVzID0gYXR0cmlidXRlTWFuYWdlci5nZXRDaGFuZ2VkQXR0cmlidXRlcyh7Y2xlYXJDaGFuZ2VkRmxhZ3M6IHRydWV9KTtcbiAgICAgIG1vZGVsLnNldEF0dHJpYnV0ZXMoY2hhbmdlZEF0dHJpYnV0ZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1YmxpYyBBUElcblxuICAvLyBVcGRhdGVzIHNlbGVjdGVkIHN0YXRlIG1lbWJlcnMgYW5kIG1hcmtzIHRoZSBvYmplY3QgZm9yIHJlZHJhd1xuICBzZXRTdGF0ZSh1cGRhdGVPYmplY3QpIHtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHVwZGF0ZU9iamVjdCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICAvLyBTZXRzIHRoZSByZWRyYXcgZmxhZyBmb3IgdGhpcyBsYXllciwgd2lsbCB0cmlnZ2VyIGEgcmVkcmF3IG5leHQgYW5pbWF0aW9uIGZyYW1lXG4gIHNldE5lZWRzUmVkcmF3KHJlZHJhdyA9IHRydWUpIHtcbiAgICBpZiAodGhpcy5zdGF0ZSkge1xuICAgICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHJlZHJhdztcbiAgICB9XG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXJyYXkgb2YgbW9kZWxzIHVzZWQgYnkgdGhpcyBsYXllciwgY2FuIGJlIG92ZXJyaWRlbiBieSBsYXllciBzdWJjbGFzc1xuICBnZXRNb2RlbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUubW9kZWxzIHx8ICh0aGlzLnN0YXRlLm1vZGVsID8gW3RoaXMuc3RhdGUubW9kZWxdIDogW10pO1xuICB9XG5cbiAgLy8gUFJPSkVDVElPTiBNRVRIT0RTXG5cbiAgLyoqXG4gICAqIFByb2plY3RzIGEgcG9pbnQgd2l0aCBjdXJyZW50IG1hcCBzdGF0ZSAobGF0LCBsb24sIHpvb20sIHBpdGNoLCBiZWFyaW5nKVxuICAgKlxuICAgKiBOb3RlOiBQb3NpdGlvbiBjb252ZXJzaW9uIGlzIGRvbmUgaW4gc2hhZGVyLCBzbyBpbiBtYW55IGNhc2VzIHRoZXJlIGlzIG5vIG5lZWRcbiAgICogZm9yIHRoaXMgZnVuY3Rpb25cbiAgICogQHBhcmFtIHtBcnJheXxUeXBlZEFycmF5fSBsbmdMYXQgLSBsb25nIGFuZCBsYXQgdmFsdWVzXG4gICAqIEByZXR1cm4ge0FycmF5fFR5cGVkQXJyYXl9IC0geCwgeSBjb29yZGluYXRlc1xuICAgKi9cbiAgcHJvamVjdChsbmdMYXQpIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgIGFzc2VydChBcnJheS5pc0FycmF5KGxuZ0xhdCksICdMYXllci5wcm9qZWN0IG5lZWRzIFtsbmcsbGF0XScpO1xuICAgIHJldHVybiB2aWV3cG9ydC5wcm9qZWN0KGxuZ0xhdCk7XG4gIH1cblxuICB1bnByb2plY3QoeHkpIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgIGFzc2VydChBcnJheS5pc0FycmF5KHh5KSwgJ0xheWVyLnVucHJvamVjdCBuZWVkcyBbeCx5XScpO1xuICAgIHJldHVybiB2aWV3cG9ydC51bnByb2plY3QoeHkpO1xuICB9XG5cbiAgcHJvamVjdEZsYXQobG5nTGF0KSB7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuY29udGV4dDtcbiAgICBhc3NlcnQoQXJyYXkuaXNBcnJheShsbmdMYXQpLCAnTGF5ZXIucHJvamVjdCBuZWVkcyBbbG5nLGxhdF0nKTtcbiAgICByZXR1cm4gdmlld3BvcnQucHJvamVjdEZsYXQobG5nTGF0KTtcbiAgfVxuXG4gIHVucHJvamVjdEZsYXQoeHkpIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5jb250ZXh0O1xuICAgIGFzc2VydChBcnJheS5pc0FycmF5KHh5KSwgJ0xheWVyLnVucHJvamVjdCBuZWVkcyBbeCx5XScpO1xuICAgIHJldHVybiB2aWV3cG9ydC51bnByb2plY3RGbGF0KHh5KTtcbiAgfVxuXG4gIC8vIFRPRE8gLSBuZWVkcyB0byByZWZlciB0byBjb250ZXh0XG4gIHNjcmVlblRvRGV2aWNlUGl4ZWxzKHNjcmVlblBpeGVscykge1xuICAgIGxvZy5kZXByZWNhdGVkKCdzY3JlZW5Ub0RldmljZVBpeGVscycsICdEZWNrR0wgcHJvcCB1c2VEZXZpY2VQaXhlbHMgZm9yIGNvbnZlcnNpb24nKTtcbiAgICBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgP1xuICAgICAgd2luZG93LmRldmljZVBpeGVsUmF0aW8gOiAxO1xuICAgIHJldHVybiBzY3JlZW5QaXhlbHMgKiBkZXZpY2VQaXhlbFJhdGlvO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBpY2tpbmcgY29sb3IgdGhhdCBkb2Vzbid0IG1hdGNoIGFueSBzdWJmZWF0dXJlXG4gICAqIFVzZSBpZiBzb21lIGdyYXBoaWNzIGRvIG5vdCBiZWxvbmcgdG8gYW55IHBpY2thYmxlIHN1YmZlYXR1cmVcbiAgICogQHJldHVybiB7QXJyYXl9IC0gYSBibGFjayBjb2xvclxuICAgKi9cbiAgbnVsbFBpY2tpbmdDb2xvcigpIHtcbiAgICByZXR1cm4gWzAsIDAsIDBdO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBpY2tpbmcgY29sb3IgdGhhdCBkb2Vzbid0IG1hdGNoIGFueSBzdWJmZWF0dXJlXG4gICAqIFVzZSBpZiBzb21lIGdyYXBoaWNzIGRvIG5vdCBiZWxvbmcgdG8gYW55IHBpY2thYmxlIHN1YmZlYXR1cmVcbiAgICogQHBhcmFtIHtpbnR9IGkgLSBpbmRleCB0byBiZSBkZWNvZGVkXG4gICAqIEByZXR1cm4ge0FycmF5fSAtIHRoZSBkZWNvZGVkIGNvbG9yXG4gICAqL1xuICBlbmNvZGVQaWNraW5nQ29sb3IoaSkge1xuICAgIGFzc2VydCgoKCgoaSArIDEpID4+IDI0KSAmIDI1NSkgPT09IDApLCAnaW5kZXggb3V0IG9mIHBpY2tpbmcgY29sb3IgcmFuZ2UnKTtcbiAgICByZXR1cm4gW1xuICAgICAgKGkgKyAxKSAmIDI1NSxcbiAgICAgICgoaSArIDEpID4+IDgpICYgMjU1LFxuICAgICAgKCgoaSArIDEpID4+IDgpID4+IDgpICYgMjU1XG4gICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwaWNraW5nIGNvbG9yIHRoYXQgZG9lc24ndCBtYXRjaCBhbnkgc3ViZmVhdHVyZVxuICAgKiBVc2UgaWYgc29tZSBncmFwaGljcyBkbyBub3QgYmVsb25nIHRvIGFueSBwaWNrYWJsZSBzdWJmZWF0dXJlXG4gICAqIEBwYXJhbSB7VWludDhBcnJheX0gY29sb3IgLSBjb2xvciBhcnJheSB0byBiZSBkZWNvZGVkXG4gICAqIEByZXR1cm4ge0FycmF5fSAtIHRoZSBkZWNvZGVkIHBpY2tpbmcgY29sb3JcbiAgICovXG4gIGRlY29kZVBpY2tpbmdDb2xvcihjb2xvcikge1xuICAgIGFzc2VydChjb2xvciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpO1xuICAgIGNvbnN0IFtpMSwgaTIsIGkzXSA9IGNvbG9yO1xuICAgIC8vIDEgd2FzIGFkZGVkIHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgY29uc3QgaW5kZXggPSBpMSArIGkyICogMjU2ICsgaTMgKiA2NTUzNiAtIDE7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQaWNraW5nQ29sb3JzKGF0dHJpYnV0ZSwge251bUluc3RhbmNlc30pIHtcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIC8vIGFkZCAxIHRvIGluZGV4IHRvIHNlcGVyYXRlIGZyb20gbm8gc2VsZWN0aW9uXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1JbnN0YW5jZXM7IGkrKykge1xuICAgICAgY29uc3QgcGlja2luZ0NvbG9yID0gdGhpcy5lbmNvZGVQaWNraW5nQ29sb3IoaSk7XG4gICAgICB2YWx1ZVtpICogc2l6ZSArIDBdID0gcGlja2luZ0NvbG9yWzBdO1xuICAgICAgdmFsdWVbaSAqIHNpemUgKyAxXSA9IHBpY2tpbmdDb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKiBzaXplICsgMl0gPSBwaWNraW5nQ29sb3JbMl07XG4gICAgfVxuICB9XG5cbiAgLy8gREFUQSBBQ0NFU1MgQVBJXG4gIC8vIERhdGEgY2FuIHVzZSBpdGVyYXRvcnMgYW5kIG1heSBub3QgYmUgcmFuZG9tIGFjY2Vzc1xuXG4gIC8vIFVzZSBpdGVyYXRpb24gKHRoZSBvbmx5IHJlcXVpcmVkIGNhcGFiaWxpdHkgb24gZGF0YSkgdG8gZ2V0IGZpcnN0IGVsZW1lbnRcbiAgZ2V0Rmlyc3RPYmplY3QoKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICByZXR1cm4gb2JqZWN0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIElOVEVSTkFMIE1FVEhPRFNcblxuICAvLyBEZWR1Y2VzIG51bWVyIG9mIGluc3RhbmNlcy4gSW50ZW50aW9uIGlzIHRvIHN1cHBvcnQ6XG4gIC8vIC0gRXhwbGljaXQgc2V0dGluZyBvZiBudW1JbnN0YW5jZXNcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiBmb3IgRVM2IGNvbnRhaW5lcnMgdGhhdCBkZWZpbmUgYSBzaXplIG1lbWJlclxuICAvLyAtIEF1dG8tZGVkdWN0aW9uIGZvciBDbGFzc2ljIEFycmF5cyB2aWEgdGhlIGJ1aWx0LWluIGxlbmd0aCBhdHRyaWJ1dGVcbiAgLy8gLSBBdXRvLWRlZHVjdGlvbiB2aWEgYXJyYXlzXG4gIGdldE51bUluc3RhbmNlcyhwcm9wcykge1xuICAgIHByb3BzID0gcHJvcHMgfHwgdGhpcy5wcm9wcztcblxuICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZSBsYXllciBoYXMgc2V0IGl0cyBvd24gdmFsdWVcbiAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLm51bUluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS5udW1JbnN0YW5jZXM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgaWYgYXBwIGhhcyBwcm92aWRlZCBhbiBleHBsaWNpdCB2YWx1ZVxuICAgIGlmIChwcm9wcy5udW1JbnN0YW5jZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHByb3BzLm51bUluc3RhbmNlcztcbiAgICB9XG5cbiAgICAvLyBVc2UgY29udGFpbmVyIGxpYnJhcnkgdG8gZ2V0IGEgY291bnQgZm9yIGFueSBFUzYgY29udGFpbmVyIG9yIG9iamVjdFxuICAgIGNvbnN0IHtkYXRhfSA9IHByb3BzO1xuICAgIHJldHVybiBjb3VudChkYXRhKTtcbiAgfVxuXG4gIC8vIGNsb25lIHRoaXMgbGF5ZXIgd2l0aCBtb2RpZmllZCBwcm9wc1xuICBjbG9uZShuZXdQcm9wcykge1xuICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCBuZXdQcm9wcykpO1xuICB9XG5cbiAgLy8gTEFZRVIgTUFOQUdFUiBBUElcbiAgLy8gU2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBkZWNrLmdsIExheWVyTWFuYWdlciBjbGFzc1xuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyIHdoZW4gYSBuZXcgbGF5ZXIgaXMgZm91bmRcbiAgLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMgKi9cbiAgX2luaXRpYWxpemUoKSB7XG4gICAgYXNzZXJ0KGFyZ3VtZW50cy5sZW5ndGggPT09IDApO1xuICAgIGFzc2VydCh0aGlzLmNvbnRleHQuZ2wpO1xuICAgIGFzc2VydCghdGhpcy5zdGF0ZSk7XG5cbiAgICBjb25zdCBhdHRyaWJ1dGVNYW5hZ2VyID0gbmV3IEF0dHJpYnV0ZU1hbmFnZXIoe2lkOiB0aGlzLnByb3BzLmlkfSk7XG4gICAgLy8gQWxsIGluc3RhbmNlZCBsYXllcnMgZ2V0IGluc3RhbmNlUGlja2luZ0NvbG9ycyBhdHRyaWJ1dGUgYnkgZGVmYXVsdFxuICAgIC8vIFRoZWlyIHNoYWRlcnMgY2FuIHVzZSBpdCB0byByZW5kZXIgYSBwaWNraW5nIHNjZW5lXG4gICAgLy8gVE9ETyAtIHRoaXMgc2xpZ2h0bHkgc2xvd3MgZG93biBub24gaW5zdGFuY2VkIGxheWVyc1xuICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUGlja2luZ0NvbG9yczoge1xuICAgICAgICB0eXBlOiBHTC5VTlNJR05FRF9CWVRFLCBzaXplOiAzLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQaWNraW5nQ29sb3JzXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmludGVybmFsU3RhdGUgPSB7XG4gICAgICBzdWJMYXllcnM6IG51bGwsICAgICAvLyByZWZlcmVuY2UgdG8gc3VibGF5ZXJzIHJlbmRlcmVkIGluIGEgcHJldmlvdXMgY3ljbGVcbiAgICAgIHN0YXRzOiBuZXcgU3RhdHMoe2lkOiAnZHJhdyd9KVxuICAgICAgLy8gYW5pbWF0ZWRQcm9wczogbnVsbCwgLy8gQ29tcHV0aW5nIGFuaW1hdGVkIHByb3BzIHJlcXVpcmVzIGxheWVyIG1hbmFnZXIgc3RhdGVcbiAgICAgIC8vIFRPRE8gLSBtb3ZlIHRoZXNlIGZpZWxkcyBoZXJlIChyaXNrcyBicmVha2luZyBsYXllcnMpXG4gICAgICAvLyBhdHRyaWJ1dGVNYW5hZ2VyLFxuICAgICAgLy8gbmVlZHNSZWRyYXc6IHRydWUsXG4gICAgfTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLFxuICAgICAgbW9kZWw6IG51bGwsXG4gICAgICBuZWVkc1JlZHJhdzogdHJ1ZVxuICAgIH07XG5cbiAgICAvLyBDYWxsIHN1YmNsYXNzIGxpZmVjeWNsZSBtZXRob2RzXG4gICAgdGhpcy5pbml0aWFsaXplU3RhdGUodGhpcy5jb250ZXh0KTtcbiAgICAvLyBFbmQgc3ViY2xhc3MgbGlmZWN5Y2xlIG1ldGhvZHNcblxuICAgIC8vIGluaXRpYWxpemVTdGF0ZSBjYWxsYmFjayB0ZW5kcyB0byBjbGVhciBzdGF0ZVxuICAgIHRoaXMuc2V0Q2hhbmdlRmxhZ3Moe2RhdGFDaGFuZ2VkOiB0cnVlLCBwcm9wc0NoYW5nZWQ6IHRydWUsIHZpZXdwb3J0Q2hhbmdlZDogdHJ1ZX0pO1xuXG4gICAgdGhpcy5fdXBkYXRlU3RhdGUodGhpcy5fZ2V0VXBkYXRlUGFyYW1zKCkpO1xuXG4gICAgaWYgKHRoaXMuaXNDb21wb3NpdGUpIHtcbiAgICAgIHRoaXMuX3JlbmRlckxheWVycyh0cnVlKTtcbiAgICB9XG5cbiAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAobW9kZWwpIHtcbiAgICAgIG1vZGVsLmlkID0gdGhpcy5wcm9wcy5pZDtcbiAgICAgIG1vZGVsLnByb2dyYW0uaWQgPSBgJHt0aGlzLnByb3BzLmlkfS1wcm9ncmFtYDtcbiAgICAgIG1vZGVsLmdlb21ldHJ5LmlkID0gYCR7dGhpcy5wcm9wcy5pZH0tZ2VvbWV0cnlgO1xuICAgICAgbW9kZWwuc2V0QXR0cmlidXRlcyhhdHRyaWJ1dGVNYW5hZ2VyLmdldEF0dHJpYnV0ZXMoKSk7XG4gICAgfVxuXG4gICAgLy8gTGFzdCBidXQgbm90IGxlYXN0LCB1cGRhdGUgYW55IHN1YmxheWVyc1xuICAgIGlmICh0aGlzLmlzQ29tcG9zaXRlKSB7XG4gICAgICB0aGlzLl9yZW5kZXJMYXllcnMoKTtcbiAgICB9XG5cbiAgICB0aGlzLmNsZWFyQ2hhbmdlRmxhZ3MoKTtcbiAgfVxuXG4gIC8vIENhbGxlZCBieSBsYXllciBtYW5hZ2VyXG4gIC8vIGlmIHRoaXMgbGF5ZXIgaXMgbmV3IChub3QgbWF0Y2hlZCB3aXRoIGFuIGV4aXN0aW5nIGxheWVyKSBvbGRQcm9wcyB3aWxsIGJlIGVtcHR5IG9iamVjdFxuICBfdXBkYXRlKCkge1xuICAgIGFzc2VydChhcmd1bWVudHMubGVuZ3RoID09PSAwKTtcblxuICAgIC8vIENhbGwgc3ViY2xhc3MgbGlmZWN5Y2xlIG1ldGhvZFxuICAgIGNvbnN0IHN0YXRlTmVlZHNVcGRhdGUgPSB0aGlzLm5lZWRzVXBkYXRlKCk7XG4gICAgLy8gRW5kIGxpZmVjeWNsZSBtZXRob2RcblxuICAgIGNvbnN0IHVwZGF0ZVBhcmFtcyA9IHtcbiAgICAgIHByb3BzOiB0aGlzLnByb3BzLFxuICAgICAgb2xkUHJvcHM6IHRoaXMub2xkUHJvcHMsXG4gICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQsXG4gICAgICBvbGRDb250ZXh0OiB0aGlzLm9sZENvbnRleHQsXG4gICAgICBjaGFuZ2VGbGFnczogdGhpcy5pbnRlcm5hbFN0YXRlLmNoYW5nZUZsYWdzXG4gICAgfTtcblxuICAgIGlmIChzdGF0ZU5lZWRzVXBkYXRlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTdGF0ZSh1cGRhdGVQYXJhbXMpO1xuICAgIH1cblxuICAgIC8vIFJlbmRlciBvciB1cGRhdGUgcHJldmlvdXNseSByZW5kZXJlZCBzdWJsYXllcnNcbiAgICBpZiAodGhpcy5pc0NvbXBvc2l0ZSkge1xuICAgICAgdGhpcy5fcmVuZGVyTGF5ZXJzKHN0YXRlTmVlZHNVcGRhdGUpO1xuICAgIH1cblxuICAgIHRoaXMuY2xlYXJDaGFuZ2VGbGFncygpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbWF4LXN0YXRlbWVudHMgKi9cblxuICBfdXBkYXRlU3RhdGUodXBkYXRlUGFyYW1zKSB7XG4gICAgLy8gQ2FsbCBzdWJjbGFzcyBsaWZlY3ljbGUgbWV0aG9kc1xuICAgIHRoaXMudXBkYXRlU3RhdGUodXBkYXRlUGFyYW1zKTtcbiAgICAvLyBFbmQgc3ViY2xhc3MgbGlmZWN5Y2xlIG1ldGhvZHNcblxuICAgIC8vIEFkZCBhbnkgc3ViY2xhc3MgYXR0cmlidXRlc1xuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlcyh0aGlzLnByb3BzKTtcbiAgICB0aGlzLl91cGRhdGVCYXNlVW5pZm9ybXMoKTtcbiAgICB0aGlzLl91cGRhdGVNb2R1bGVTZXR0aW5ncygpO1xuXG4gICAgLy8gTm90ZTogQXV0b21hdGljIGluc3RhbmNlIGNvdW50IHVwZGF0ZSBvbmx5IHdvcmtzIGZvciBzaW5nbGUgbGF5ZXJzXG4gICAgaWYgKHRoaXMuc3RhdGUubW9kZWwpIHtcbiAgICAgIHRoaXMuc3RhdGUubW9kZWwuc2V0SW5zdGFuY2VDb3VudCh0aGlzLmdldE51bUluc3RhbmNlcygpKTtcbiAgICB9XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbWFuYWdlciB3aGVuIGxheWVyIGlzIGFib3V0IHRvIGJlIGRpc3Bvc2VkXG4gIC8vIE5vdGU6IG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhbGxlZCBvbiBhcHBsaWNhdGlvbiBzaHV0ZG93blxuICBfZmluYWxpemUoKSB7XG4gICAgYXNzZXJ0KGFyZ3VtZW50cy5sZW5ndGggPT09IDApO1xuICAgIC8vIENhbGwgc3ViY2xhc3MgbGlmZWN5Y2xlIG1ldGhvZFxuICAgIHRoaXMuZmluYWxpemVTdGF0ZSh0aGlzLmNvbnRleHQpO1xuICAgIC8vIEVuZCBsaWZlY3ljbGUgbWV0aG9kXG4gICAgcmVtb3ZlTGF5ZXJJblNlZXIodGhpcy5pZCk7XG4gIH1cblxuICAvLyBDYWxjdWxhdGVzIHVuaWZvcm1zXG4gIGRyYXdMYXllcih7bW9kdWxlUGFyYW1ldGVycyA9IG51bGwsIHVuaWZvcm1zID0ge30sIHBhcmFtZXRlcnMgPSB7fX0pIHtcblxuICAgIC8vIFRPRE8vaWIgLSBoYWNrIG1vdmUgdG8gbHVtYSBNb2RlbC5kcmF3XG4gICAgaWYgKG1vZHVsZVBhcmFtZXRlcnMpIHtcbiAgICAgIGZvciAoY29uc3QgbW9kZWwgb2YgdGhpcy5nZXRNb2RlbHMoKSkge1xuICAgICAgICBtb2RlbC51cGRhdGVNb2R1bGVTZXR0aW5ncyhtb2R1bGVQYXJhbWV0ZXJzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBcHBseSBwb2x5Z29uIG9mZnNldCB0byBhdm9pZCB6LWZpZ2h0aW5nXG4gICAgLy8gVE9ETyAtIG1vdmUgdG8gZHJhdy1sYXllcnNcbiAgICBjb25zdCB7Z2V0UG9seWdvbk9mZnNldH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IG9mZnNldHMgPSBnZXRQb2x5Z29uT2Zmc2V0ICYmIGdldFBvbHlnb25PZmZzZXQodW5pZm9ybXMpIHx8IFswLCAwXTtcbiAgICBwYXJhbWV0ZXJzLnBvbHlnb25PZmZzZXQgPSBvZmZzZXRzO1xuXG4gICAgLy8gQ2FsbCBzdWJjbGFzcyBsaWZlY3ljbGUgbWV0aG9kXG4gICAgd2l0aFBhcmFtZXRlcnModGhpcy5jb250ZXh0LmdsLCBwYXJhbWV0ZXJzLCAoKSA9PiB7XG4gICAgICB0aGlzLmRyYXcoe21vZHVsZVBhcmFtZXRlcnMsIHVuaWZvcm1zLCBwYXJhbWV0ZXJzLCBjb250ZXh0OiB0aGlzLmNvbnRleHR9KTtcbiAgICB9KTtcbiAgICAvLyBFbmQgbGlmZWN5Y2xlIG1ldGhvZFxuICB9XG5cbiAgLy8ge3VuaWZvcm1zID0ge30sIC4uLm9wdHN9XG4gIHBpY2tMYXllcihvcHRzKSB7XG4gICAgLy8gQ2FsbCBzdWJjbGFzcyBsaWZlY3ljbGUgbWV0aG9kXG4gICAgcmV0dXJuIHRoaXMuZ2V0UGlja2luZ0luZm8ob3B0cyk7XG4gICAgLy8gRW5kIGxpZmVjeWNsZSBtZXRob2RcbiAgfVxuXG4gIC8vIEhlbHBlciBtZXRob2RzXG4gIGdldENoYW5nZUZsYWdzKCkge1xuICAgIHJldHVybiB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3M7XG4gIH1cblxuICAvLyBEaXJ0eSBzb21lIGNoYW5nZSBmbGFncywgd2lsbCBiZSBoYW5kbGVkIGJ5IHVwZGF0ZUxheWVyXG4gIC8qIGVzbGludC1kaXNhYmxlIGNvbXBsZXhpdHkgKi9cbiAgc2V0Q2hhbmdlRmxhZ3MoZmxhZ3MpIHtcbiAgICB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3MgPSB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3MgfHwge307XG4gICAgY29uc3QgY2hhbmdlRmxhZ3MgPSB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3M7XG5cbiAgICAvLyBVcGRhdGUgcHJpbWFyeSBmbGFnc1xuICAgIGlmIChmbGFncy5kYXRhQ2hhbmdlZCAmJiAhY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQpIHtcbiAgICAgIGNoYW5nZUZsYWdzLmRhdGFDaGFuZ2VkID0gZmxhZ3MuZGF0YUNoYW5nZWQ7XG4gICAgICBsb2cubG9nKExPR19QUklPUklUWV9VUERBVEUgKyAxLFxuICAgICAgICAoKSA9PiBgZGF0YUNoYW5nZWQ6ICR7ZmxhZ3MuZGF0YUNoYW5nZWR9IGluICR7dGhpcy5pZH1gKTtcbiAgICB9XG4gICAgaWYgKGZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCAmJiAhY2hhbmdlRmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkKSB7XG4gICAgICBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQgPVxuICAgICAgICBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQgJiYgZmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkID9cbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBmbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQsIGNoYW5nZUZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCkgOlxuICAgICAgICAgIGZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCB8fCBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQ7XG4gICAgICBsb2cubG9nKExPR19QUklPUklUWV9VUERBVEUgKyAxLFxuICAgICAgICAoKSA9PiAndXBkYXRlVHJpZ2dlcnNDaGFuZ2VkOiAnICtcbiAgICAgICAgYCR7T2JqZWN0LmtleXMoZmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkKS5qb2luKCcsICcpfSBpbiAke3RoaXMuaWR9YCk7XG4gICAgfVxuICAgIGlmIChmbGFncy5wcm9wc0NoYW5nZWQgJiYgIWNoYW5nZUZsYWdzLnByb3BzQ2hhbmdlZCkge1xuICAgICAgY2hhbmdlRmxhZ3MucHJvcHNDaGFuZ2VkID0gZmxhZ3MucHJvcHNDaGFuZ2VkO1xuICAgICAgbG9nLmxvZyhMT0dfUFJJT1JJVFlfVVBEQVRFICsgMSxcbiAgICAgICAgKCkgPT4gYHByb3BzQ2hhbmdlZDogJHtmbGFncy5wcm9wc0NoYW5nZWR9IGluICR7dGhpcy5pZH1gKTtcbiAgICB9XG4gICAgaWYgKGZsYWdzLnZpZXdwb3J0Q2hhbmdlZCAmJiAhY2hhbmdlRmxhZ3Mudmlld3BvcnRDaGFuZ2VkKSB7XG4gICAgICBjaGFuZ2VGbGFncy52aWV3cG9ydENoYW5nZWQgPSBmbGFncy52aWV3cG9ydENoYW5nZWQ7XG4gICAgICBsb2cubG9nKExPR19QUklPUklUWV9VUERBVEUgKyAyLFxuICAgICAgICAoKSA9PiBgdmlld3BvcnRDaGFuZ2VkOiAke2ZsYWdzLnZpZXdwb3J0Q2hhbmdlZH0gaW4gJHt0aGlzLmlkfWApO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBjb21wb3NpdGUgZmxhZ3NcbiAgICBjb25zdCBwcm9wc09yRGF0YUNoYW5nZWQgPVxuICAgICAgZmxhZ3MuZGF0YUNoYW5nZWQgfHwgZmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkIHx8IGZsYWdzLnByb3BzQ2hhbmdlZDtcbiAgICBjaGFuZ2VGbGFncy5wcm9wc09yRGF0YUNoYW5nZWQgPSBjaGFuZ2VGbGFncy5wcm9wc09yRGF0YUNoYW5nZWQgfHwgcHJvcHNPckRhdGFDaGFuZ2VkO1xuICAgIGNoYW5nZUZsYWdzLnNvbWV0aGluZ0NoYW5nZWQgPSBjaGFuZ2VGbGFncy5zb21ldGhpbmdDaGFuZ2VkIHx8XG4gICAgICBwcm9wc09yRGF0YUNoYW5nZWQgfHwgZmxhZ3Mudmlld3BvcnRDaGFuZ2VkO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgY29tcGxleGl0eSAqL1xuXG4gIC8vIENsZWFyIGFsbCBjaGFuZ2VGbGFncywgdHlwaWNhbGx5IGFmdGVyIGFuIHVwZGF0ZVxuICBjbGVhckNoYW5nZUZsYWdzKCkge1xuICAgIHRoaXMuaW50ZXJuYWxTdGF0ZS5jaGFuZ2VGbGFncyA9IHtcbiAgICAgIC8vIFByaW1hcnkgY2hhbmdlRmxhZ3MsIGNhbiBiZSBzdHJpbmdzIHN0YXRpbmcgcmVhc29uIGZvciBjaGFuZ2VcbiAgICAgIGRhdGFDaGFuZ2VkOiBmYWxzZSxcbiAgICAgIHByb3BzQ2hhbmdlZDogZmFsc2UsXG4gICAgICB1cGRhdGVUcmlnZ2Vyc0NoYW5nZWQ6IGZhbHNlLFxuICAgICAgdmlld3BvcnRDaGFuZ2VkOiBmYWxzZSxcblxuICAgICAgLy8gRGVyaXZlZCBjaGFuZ2VGbGFnc1xuICAgICAgcHJvcHNPckRhdGFDaGFuZ2VkOiBmYWxzZSxcbiAgICAgIHNvbWV0aGluZ0NoYW5nZWQ6IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIHByaW50Q2hhbmdlRmxhZ3MoKSB7XG4gICAgY29uc3QgZmxhZ3MgPSB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3M7XG4gICAgcmV0dXJuIGBcXFxuJHtmbGFncy5kYXRhQ2hhbmdlZCA/ICdkYXRhICcgOiAnJ31cXFxuJHtmbGFncy5wcm9wc0NoYW5nZWQgPyAncHJvcHMgJyA6ICcnfVxcXG4ke2ZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZCA/ICd0cmlnZ2VycyAnIDogJyd9XFxcbiR7ZmxhZ3Mudmlld3BvcnRDaGFuZ2VkID8gJ3ZpZXdwb3J0JyA6ICcnfVxcXG5gO1xuICB9XG5cbiAgLy8gQ29tcGFyZXMgdGhlIGxheWVycyBwcm9wcyB3aXRoIG9sZCBwcm9wcyBmcm9tIGEgbWF0Y2hlZCBvbGRlciBsYXllclxuICAvLyBhbmQgZXh0cmFjdHMgY2hhbmdlIGZsYWdzIHRoYXQgZGVzY3JpYmUgd2hhdCBoYXMgY2hhbmdlIHNvIHRoYXQgc3RhdGVcbiAgLy8gY2FuIGJlIHVwZGF0ZSBjb3JyZWN0bHkgd2l0aCBtaW5pbWFsIGVmZm9ydFxuICAvLyBUT0RPIC0gYXJndW1lbnRzIGZvciB0ZXN0aW5nIG9ubHlcbiAgZGlmZlByb3BzKG5ld1Byb3BzID0gdGhpcy5wcm9wcywgb2xkUHJvcHMgPSB0aGlzLm9sZFByb3BzKSB7XG4gICAgY29uc3QgY2hhbmdlRmxhZ3MgPSBkaWZmUHJvcHMobmV3UHJvcHMsIG9sZFByb3BzKTtcblxuICAgIC8vIGl0ZXJhdGUgb3ZlciBjaGFuZ2VkVHJpZ2dlcnNcbiAgICBpZiAoY2hhbmdlRmxhZ3MudXBkYXRlVHJpZ2dlcnNDaGFuZ2VkKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQpIHtcbiAgICAgICAgaWYgKGNoYW5nZUZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZFtrZXldKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aXZlVXBkYXRlVHJpZ2dlcihrZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0Q2hhbmdlRmxhZ3MoY2hhbmdlRmxhZ3MpO1xuICB9XG5cbiAgLy8gUFJJVkFURSBNRVRIT0RTXG5cbiAgX2dldFVwZGF0ZVBhcmFtcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvcHM6IHRoaXMucHJvcHMsXG4gICAgICBvbGRQcm9wczogdGhpcy5vbGRQcm9wcyxcbiAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dCxcbiAgICAgIG9sZENvbnRleHQ6IHRoaXMub2xkQ29udGV4dCB8fCB7fSxcbiAgICAgIGNoYW5nZUZsYWdzOiB0aGlzLmludGVybmFsU3RhdGUuY2hhbmdlRmxhZ3NcbiAgICB9O1xuICB9XG5cbiAgLy8gQ2hlY2tzIHN0YXRlIG9mIGF0dHJpYnV0ZXMgYW5kIG1vZGVsXG4gIF9nZXROZWVkc1JlZHJhdyhjbGVhclJlZHJhd0ZsYWdzKSB7XG4gICAgLy8gdGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBieSB0aGUgcmVuZGVyIGxvb3AgYXMgc29vbiBhIHRoZSBsYXllclxuICAgIC8vIGhhcyBiZWVuIGNyZWF0ZWQsIHNvIGd1YXJkIGFnYWluc3QgdW5pbml0aWFsaXplZCBzdGF0ZVxuICAgIGlmICghdGhpcy5zdGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCByZWRyYXcgPSBmYWxzZTtcbiAgICByZWRyYXcgPSByZWRyYXcgfHwgKHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgJiYgdGhpcy5pZCk7XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgJiYgIWNsZWFyUmVkcmF3RmxhZ3M7XG5cbiAgICAvLyBUT0RPIC0gaXMgYXR0cmlidXRlIG1hbmFnZXIgbmVlZGVkPyAtIE1vZGVsIHNob3VsZCBiZSBlbm91Z2guXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBhdHRyaWJ1dGVNYW5hZ2VyTmVlZHNSZWRyYXcgPVxuICAgICAgYXR0cmlidXRlTWFuYWdlciAmJiBhdHRyaWJ1dGVNYW5hZ2VyLmdldE5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzfSk7XG4gICAgcmVkcmF3ID0gcmVkcmF3IHx8IGF0dHJpYnV0ZU1hbmFnZXJOZWVkc1JlZHJhdztcblxuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgdGhpcy5nZXRNb2RlbHMoKSkge1xuICAgICAgbGV0IG1vZGVsTmVlZHNSZWRyYXcgPSBtb2RlbC5nZXROZWVkc1JlZHJhdyh7Y2xlYXJSZWRyYXdGbGFnc30pO1xuICAgICAgaWYgKG1vZGVsTmVlZHNSZWRyYXcgJiYgdHlwZW9mIG1vZGVsTmVlZHNSZWRyYXcgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIG1vZGVsTmVlZHNSZWRyYXcgPSBgbW9kZWwgJHttb2RlbC5pZH1gO1xuICAgICAgfVxuICAgICAgcmVkcmF3ID0gcmVkcmF3IHx8IG1vZGVsTmVlZHNSZWRyYXc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlZHJhdztcbiAgfVxuXG4gIC8vIEhlbHBlciBmb3IgY29uc3RydWN0b3IsIG1lcmdlcyBwcm9wcyB3aXRoIGRlZmF1bHQgcHJvcHMgYW5kIGZyZWV6ZXMgdGhlbVxuICBfbm9ybWFsaXplUHJvcHMocHJvcHMpIHtcbiAgICAvLyBJZiBzdWJsYXllciBoYXMgc3RhdGljIGRlZmF1bHRQcm9wcyBtZW1iZXIsIGdldERlZmF1bHRQcm9wcyB3aWxsIHJldHVybiBpdFxuICAgIGNvbnN0IG1lcmdlZERlZmF1bHRQcm9wcyA9IGdldERlZmF1bHRQcm9wcyh0aGlzKTtcbiAgICAvLyBNZXJnZSBzdXBwbGllZCBwcm9wcyB3aXRoIHByZS1tZXJnZWQgZGVmYXVsdCBwcm9wc1xuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgbWVyZ2VkRGVmYXVsdFByb3BzLCBwcm9wcyk7XG4gICAgLy8gQWNjZXB0IG51bGwgYXMgZGF0YSAtIG90aGVyd2lzZSBhcHBzIGFuZCBsYXllcnMgbmVlZCB0byBhZGQgdWdseSBjaGVja3NcbiAgICAvLyBVc2UgY29uc3RhbnQgZmFsbGJhY2sgc28gdGhhdCBkYXRhIGNoYW5nZSBpcyBub3QgdHJpZ2dlcmVkXG4gICAgcHJvcHMuZGF0YSA9IHByb3BzLmRhdGEgfHwgRU1QVFlfQVJSQVk7XG4gICAgLy8gQXBwbHkgYW55IG92ZXJyaWRlcyBmcm9tIHRoZSBzZWVyIGRlYnVnIGV4dGVuc2lvbiBpZiBpdCBpcyBhY3RpdmVcbiAgICBhcHBseVByb3BPdmVycmlkZXMocHJvcHMpO1xuICAgIC8vIFByb3BzIGFyZSBpbW11dGFibGVcbiAgICBPYmplY3QuZnJlZXplKHByb3BzKTtcbiAgICByZXR1cm4gcHJvcHM7XG4gIH1cblxuICAvLyBDYWxsZWQgYnkgbGF5ZXIgbWFuYWdlciB0byB0cmFuc2ZlciBzdGF0ZSBmcm9tIGFuIG9sZCBsYXllclxuICBfdHJhbnNmZXJTdGF0ZShvbGRMYXllcikge1xuICAgIGNvbnN0IHtzdGF0ZSwgaW50ZXJuYWxTdGF0ZSwgcHJvcHN9ID0gb2xkTGF5ZXI7XG4gICAgYXNzZXJ0KHN0YXRlICYmIGludGVybmFsU3RhdGUpO1xuXG4gICAgLy8gTW92ZSBzdGF0ZVxuICAgIHN0YXRlLmxheWVyID0gdGhpcztcbiAgICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gICAgdGhpcy5pbnRlcm5hbFN0YXRlID0gaW50ZXJuYWxTdGF0ZTtcbiAgICAvLyBOb3RlOiBXZSBrZWVwIHRoZSBzdGF0ZSByZWYgb24gb2xkIGxheWVycyB0byBzdXBwb3J0IGFzeW5jIGFjdGlvbnNcbiAgICAvLyBvbGRMYXllci5zdGF0ZSA9IG51bGw7XG5cbiAgICAvLyBLZWVwIGEgdGVtcG9yYXJ5IHJlZiB0byB0aGUgb2xkIHByb3BzLCBmb3IgcHJvcCBjb21wYXJpc29uXG4gICAgdGhpcy5vbGRQcm9wcyA9IHByb3BzO1xuXG4gICAgLy8gVXBkYXRlIG1vZGVsIGxheWVyIHJlZmVyZW5jZVxuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgdGhpcy5nZXRNb2RlbHMoKSkge1xuICAgICAgbW9kZWwudXNlckRhdGEubGF5ZXIgPSB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuZGlmZlByb3BzKCk7XG4gIH1cblxuICAvLyBPcGVyYXRlIG9uIGVhY2ggY2hhbmdlZCB0cmlnZ2Vycywgd2lsbCBiZSBjYWxsZWQgd2hlbiBhbiB1cGRhdGVUcmlnZ2VyIGNoYW5nZXNcbiAgX2FjdGl2ZVVwZGF0ZVRyaWdnZXIocHJvcE5hbWUpIHtcbiAgICB0aGlzLmludmFsaWRhdGVBdHRyaWJ1dGUocHJvcE5hbWUpO1xuICB9XG5cbiAgLy8gIEhlbHBlciB0byBjaGVjayB0aGF0IHJlcXVpcmVkIHByb3BzIGFyZSBzdXBwbGllZFxuICBfY2hlY2tSZXF1aXJlZFByb3AocHJvcGVydHlOYW1lLCBjb25kaXRpb24pIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMucHJvcHNbcHJvcGVydHlOYW1lXTtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm9wZXJ0eSAke3Byb3BlcnR5TmFtZX0gdW5kZWZpbmVkIGluIGxheWVyICR7dGhpc31gKTtcbiAgICB9XG4gICAgaWYgKGNvbmRpdGlvbiAmJiAhY29uZGl0aW9uKHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWQgcHJvcGVydHkgJHtwcm9wZXJ0eU5hbWV9IGluIGxheWVyICR7dGhpc31gKTtcbiAgICB9XG4gIH1cblxuICAvLyBFbWl0cyBhIHdhcm5pbmcgaWYgYW4gb2xkIHByb3AgaXMgdXNlZCwgb3B0aW9uYWxseSBzdWdnZXN0aW5nIGEgcmVwbGFjZW1lbnRcbiAgX2NoZWNrUmVtb3ZlZFByb3Aob2xkUHJvcCwgbmV3UHJvcCA9IG51bGwpIHtcbiAgICBpZiAodGhpcy5wcm9wc1tvbGRQcm9wXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBsYXllck5hbWUgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgICAgbGV0IG1lc3NhZ2UgPSBgJHtsYXllck5hbWV9IG5vIGxvbmdlciBhY2NlcHRzIHByb3BzLiR7b2xkUHJvcH0gaW4gdGhpcyB2ZXJzaW9uIG9mIGRlY2suZ2wuYDtcbiAgICAgIGlmIChuZXdQcm9wKSB7XG4gICAgICAgIG1lc3NhZ2UgKz0gYFxcblBsZWFzZSB1c2UgcHJvcHMuJHtuZXdQcm9wfSBpbnN0ZWFkLmA7XG4gICAgICB9XG4gICAgICBsb2cub25jZSgwLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlQmFzZVVuaWZvcm1zKCkge1xuICAgIGNvbnN0IHVuaWZvcm1zID0ge1xuICAgICAgLy8gYXBwbHkgZ2FtbWEgdG8gb3BhY2l0eSB0byBtYWtlIGl0IHZpc3VhbGx5IFwibGluZWFyXCJcbiAgICAgIG9wYWNpdHk6IE1hdGgucG93KHRoaXMucHJvcHMub3BhY2l0eSwgMSAvIDIuMiksXG4gICAgICBPTkU6IDEuMFxuICAgIH07XG4gICAgZm9yIChjb25zdCBtb2RlbCBvZiB0aGlzLmdldE1vZGVscygpKSB7XG4gICAgICBtb2RlbC5zZXRVbmlmb3Jtcyh1bmlmb3Jtcyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyAtIHNldCBuZWVkc1JlZHJhdyBvbiB0aGUgbW9kZWwocyk/XG4gICAgdGhpcy5zdGF0ZS5uZWVkc1JlZHJhdyA9IHRydWU7XG4gIH1cblxuICBfdXBkYXRlTW9kdWxlU2V0dGluZ3MoKSB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICBwaWNraW5nSGlnaGxpZ2h0Q29sb3I6IHRoaXMucHJvcHMuaGlnaGxpZ2h0Q29sb3JcbiAgICB9O1xuICAgIGZvciAoY29uc3QgbW9kZWwgb2YgdGhpcy5nZXRNb2RlbHMoKSkge1xuICAgICAgbW9kZWwudXBkYXRlTW9kdWxlU2V0dGluZ3Moc2V0dGluZ3MpO1xuICAgIH1cbiAgfVxuXG4gIC8vIERFUFJFQ0FURUQgTUVUSE9EU1xuXG4gIC8vIFVwZGF0ZXMgc2VsZWN0ZWQgc3RhdGUgbWVtYmVycyBhbmQgbWFya3MgdGhlIG9iamVjdCBmb3IgcmVkcmF3XG4gIHNldFVuaWZvcm1zKHVuaWZvcm1NYXApIHtcbiAgICBmb3IgKGNvbnN0IG1vZGVsIG9mIHRoaXMuZ2V0TW9kZWxzKCkpIHtcbiAgICAgIG1vZGVsLnNldFVuaWZvcm1zKHVuaWZvcm1NYXApO1xuICAgIH1cblxuICAgIC8vIFRPRE8gLSBzZXQgbmVlZHNSZWRyYXcgb24gdGhlIG1vZGVsKHMpP1xuICAgIHRoaXMuc3RhdGUubmVlZHNSZWRyYXcgPSB0cnVlO1xuICAgIGxvZy5kZXByZWNhdGVkKCdsYXllci5zZXRVbmlmb3JtcycsICdtb2RlbC5zZXRVbmlmb3JtcycpO1xuICB9XG59XG5cbkxheWVyLmxheWVyTmFtZSA9ICdMYXllcic7XG5MYXllci5wcm9wVHlwZXMgPSBkZWZhdWx0UHJvcHM7XG5MYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=