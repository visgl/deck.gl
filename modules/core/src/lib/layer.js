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

/* eslint-disable react/no-direct-mutation-state */
import {COORDINATE_SYSTEM} from './constants';
import AttributeManager from './attribute/attribute-manager';
import UniformTransitionManager from './uniform-transition-manager';
import {diffProps, validateProps} from '../lifecycle/props';
import {count} from '../utils/count';
import log from '../utils/log';
import debug from '../debug';
import GL from '@luma.gl/constants';
import {withParameters, setParameters} from '@luma.gl/core';
import assert from '../utils/assert';
import memoize from '../utils/memoize';
import {mergeShaders} from '../utils/shader';
import {projectPosition, getWorldPosition} from '../shaderlib/project/project-functions';
import typedArrayManager from '../utils/typed-array-manager';

import Component from '../lifecycle/component';
import LayerState from './layer-state';

import {worldToPixels} from '@math.gl/web-mercator';

import {load} from '@loaders.gl/core';

const TRACE_CHANGE_FLAG = 'layer.changeFlag';
const TRACE_INITIALIZE = 'layer.initialize';
const TRACE_UPDATE = 'layer.update';
const TRACE_FINALIZE = 'layer.finalize';
const TRACE_MATCHED = 'layer.matched';

const MAX_PICKING_COLOR_CACHE_SIZE = 2 ** 24 - 1;

const EMPTY_ARRAY = Object.freeze([]);

// Only compare the same two viewports once
const areViewportsEqual = memoize(({oldViewport, viewport}) => {
  return oldViewport.equals(viewport);
});

let pickingColorCache = new Uint8ClampedArray(0);

const defaultProps = {
  // data: Special handling for null, see below
  data: {type: 'data', value: EMPTY_ARRAY, async: true},
  dataComparator: null,
  _dataDiff: {type: 'function', value: data => data && data.__diff, compare: false, optional: true},
  dataTransform: {type: 'function', value: null, compare: false, optional: true},
  onDataLoad: {type: 'function', value: null, compare: false, optional: true},
  onError: {type: 'function', value: null, compare: false, optional: true},
  fetch: {
    type: 'function',
    value: (url, {propName, layer, loaders, loadOptions, signal}) => {
      const {resourceManager} = layer.context;
      loadOptions = loadOptions || layer.getLoadOptions();
      loaders = loaders || layer.props.loaders;
      if (signal) {
        loadOptions = {
          ...loadOptions,
          fetch: {
            ...loadOptions?.fetch,
            signal
          }
        };
      }

      let inResourceManager = resourceManager.contains(url);

      if (!inResourceManager && !loadOptions) {
        // If there is no layer-specific load options, then attempt to cache this resource in the data manager
        resourceManager.add({resourceId: url, data: load(url, loaders), persistent: false});
        inResourceManager = true;
      }
      if (inResourceManager) {
        return resourceManager.subscribe({
          resourceId: url,
          onChange: data => layer.internalState.reloadAsyncProp(propName, data),
          consumerId: layer.id,
          requestId: propName
        });
      }

      return load(url, loaders, loadOptions);
    },
    compare: false
  },
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl

  visible: true,
  pickable: false,
  opacity: {type: 'number', min: 0, max: 1, value: 1},

  onHover: {type: 'function', value: null, compare: false, optional: true},
  onClick: {type: 'function', value: null, compare: false, optional: true},
  onDragStart: {type: 'function', value: null, compare: false, optional: true},
  onDrag: {type: 'function', value: null, compare: false, optional: true},
  onDragEnd: {type: 'function', value: null, compare: false, optional: true},

  coordinateSystem: COORDINATE_SYSTEM.DEFAULT,
  coordinateOrigin: {type: 'array', value: [0, 0, 0], compare: true},
  modelMatrix: {type: 'array', value: null, compare: true, optional: true},
  wrapLongitude: false,
  positionFormat: 'XYZ',
  colorFormat: 'RGBA',

  parameters: {},
  transitions: null,
  extensions: [],
  loaders: {type: 'array', value: [], optional: true, compare: true},

  // Offset depth based on layer index to avoid z-fighting.
  // Negative values pull layer towards the camera
  // https://www.opengl.org/archives/resources/faq/technical/polygonoffset.htm
  getPolygonOffset: {
    type: 'function',
    value: ({layerIndex}) => [0, -layerIndex * 100],
    compare: false
  },

  // Selection/Highlighting
  highlightedObjectIndex: -1,
  autoHighlight: false,
  highlightColor: {type: 'accessor', value: [0, 0, 128, 128]}
};

export default class Layer extends Component {
  toString() {
    const className = this.constructor.layerName || this.constructor.name;
    return `${className}({id: '${this.props.id}'})`;
  }

  raiseError(error, message) {
    if (message) {
      error.message = `${message}: ${error.message}`;
    }
    if (!this.props.onError?.(error)) {
      this.context?.onError?.(error, this);
    }
  }

  // Public API

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
    this.setChangeFlags({stateChanged: true});
    Object.assign(this.state, updateObject);
    this.setNeedsRedraw();
  }

  // Sets the redraw flag for this layer, will trigger a redraw next animation frame
  setNeedsRedraw(redraw = true) {
    if (this.internalState) {
      this.internalState.needsRedraw = redraw;
    }
  }

  // This layer needs a deep update
  setNeedsUpdate() {
    this.context.layerManager.setNeedsUpdate(String(this));
    this.internalState.needsUpdate = true;
  }

  // Checks state of attributes and model
  getNeedsRedraw(opts = {clearRedrawFlags: false}) {
    return this._getNeedsRedraw(opts);
  }

  // Checks if layer attributes needs updating
  needsUpdate() {
    // Call subclass lifecycle method
    return (
      this.internalState.needsUpdate ||
      this.hasUniformTransition() ||
      this.shouldUpdateState(this._getUpdateParams())
    );
    // End lifecycle method
  }

  hasUniformTransition() {
    return this.internalState.uniformTransitions.active;
  }

  get isLoaded() {
    return this.internalState && !this.internalState.isAsyncPropLoading();
  }

  get wrapLongitude() {
    return this.props.wrapLongitude;
  }

  // Returns true if the layer is pickable and visible.
  isPickable() {
    return this.props.pickable && this.props.visible;
  }

  // Return an array of models used by this layer, can be overriden by layer subclass
  getModels() {
    return this.state && (this.state.models || (this.state.model ? [this.state.model] : []));
  }

  getAttributeManager() {
    return this.internalState && this.internalState.attributeManager;
  }

  // Returns the most recent layer that matched to this state
  // (When reacting to an async event, this layer may no longer be the latest)
  getCurrentLayer() {
    return this.internalState && this.internalState.layer;
  }

  // Returns the default parse options for async props
  getLoadOptions() {
    return this.props.loadOptions;
  }

  // PROJECTION METHODS

  // Projects a point with current map state (lat, lon, zoom, pitch, bearing)
  // From the current layer's coordinate system to screen
  project(xyz) {
    const {viewport} = this.context;
    const worldPosition = getWorldPosition(xyz, {
      viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem
    });
    const [x, y, z] = worldToPixels(worldPosition, viewport.pixelProjectionMatrix);
    return xyz.length === 2 ? [x, y] : [x, y, z];
  }

  // Note: this does not reverse `project`.
  // Always unprojects to the viewport's coordinate system
  unproject(xy) {
    const {viewport} = this.context;
    return viewport.unproject(xy);
  }

  projectPosition(xyz) {
    return projectPosition(xyz, {
      viewport: this.context.viewport,
      modelMatrix: this.props.modelMatrix,
      coordinateOrigin: this.props.coordinateOrigin,
      coordinateSystem: this.props.coordinateSystem
    });
  }

  use64bitPositions() {
    const {coordinateSystem} = this.props;
    return (
      coordinateSystem === COORDINATE_SYSTEM.DEFAULT ||
      coordinateSystem === COORDINATE_SYSTEM.LNGLAT ||
      coordinateSystem === COORDINATE_SYSTEM.CARTESIAN
    );
  }

  // Event handling
  onHover(info, pickingEvent) {
    if (this.props.onHover) {
      return this.props.onHover(info, pickingEvent);
    }
    return false;
  }

  onClick(info, pickingEvent) {
    if (this.props.onClick) {
      return this.props.onClick(info, pickingEvent);
    }
    return false;
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  // @return {Array} - a black color
  nullPickingColor() {
    return [0, 0, 0];
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  encodePickingColor(i, target = []) {
    target[0] = (i + 1) & 255;
    target[1] = ((i + 1) >> 8) & 255;
    target[2] = (((i + 1) >> 8) >> 8) & 255;
    return target;
  }

  // Returns the index corresponding to a picking color that doesn't match any subfeature
  // @param {Uint8Array} color - color array to be decoded
  // @return {Array} - the decoded picking color
  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    // 1 was added to seperate from no selection
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state
  // App can create WebGL resources
  initializeState() {
    throw new Error(`Layer ${this} has not defined initializeState`);
  }

  getShaders(shaders) {
    for (const extension of this.props.extensions) {
      shaders = mergeShaders(shaders, extension.getShaders.call(this, extension));
    }
    return shaders;
  }

  // Let's layer control if updateState should be called
  shouldUpdateState({oldProps, props, context, changeFlags}) {
    return changeFlags.propsOrDataChanged;
  }

  // Default implementation, all attributes will be invalidated and updated
  // when data changes
  /* eslint-disable-next-line complexity */
  updateState({oldProps, props, context, changeFlags}) {
    const attributeManager = this.getAttributeManager();
    if (changeFlags.dataChanged && attributeManager) {
      const {dataChanged} = changeFlags;
      if (Array.isArray(dataChanged)) {
        // is partial update
        for (const dataRange of dataChanged) {
          attributeManager.invalidateAll(dataRange);
        }
      } else {
        attributeManager.invalidateAll();
      }
    }

    const neededPickingBuffer = oldProps.highlightedObjectIndex >= 0 || oldProps.pickable;
    const needPickingBuffer = props.highlightedObjectIndex >= 0 || props.pickable;
    if (neededPickingBuffer !== needPickingBuffer && attributeManager) {
      const {pickingColors, instancePickingColors} = attributeManager.attributes;
      const pickingColorsAttribute = pickingColors || instancePickingColors;
      if (pickingColorsAttribute) {
        if (needPickingBuffer && pickingColorsAttribute.constant) {
          pickingColorsAttribute.constant = false;
          attributeManager.invalidate(pickingColorsAttribute.id);
        }
        if (!pickingColorsAttribute.value && !needPickingBuffer) {
          pickingColorsAttribute.constant = true;
          pickingColorsAttribute.value = [0, 0, 0];
        }
      }
    }
  }

  // Called once when layer is no longer matched and state will be discarded
  // App can destroy WebGL resources here
  finalizeState() {
    for (const model of this.getModels()) {
      model.delete();
    }
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.finalize();
    }
    this.context.resourceManager.unsubscribe({consumerId: this.id});
    this.internalState.uniformTransitions.clear();
    this.internalState.finalize();
  }

  // If state has a model, draw it with supplied uniforms
  draw(opts) {
    for (const model of this.getModels()) {
      model.draw(opts);
    }
  }

  // called to populate the info object that is passed to the event handler
  // @return null to cancel event
  getPickingInfo({info, mode}) {
    const {index} = info;

    if (index >= 0) {
      // If props.data is an indexable array, get the object
      if (Array.isArray(this.props.data)) {
        info.object = this.props.data[index];
      }
    }

    return info;
  }

  // END LIFECYCLE METHODS
  // //////////////////////////////////////////////////

  // INTERNAL METHODS
  activateViewport(viewport) {
    const oldViewport = this.internalState.viewport;
    this.internalState.viewport = viewport;

    if (!oldViewport || !areViewportsEqual({oldViewport, viewport})) {
      this.setChangeFlags({viewportChanged: true});

      if (this.isComposite) {
        if (this.needsUpdate()) {
          // Composite layers may add/remove sublayers on viewport change
          // Because we cannot change the layers list during a draw cycle, we don't want to update sublayers right away
          // This will not call update immediately, but mark the layerManager as needs update on the next frame
          this.setNeedsUpdate();
        }
      } else {
        this._update();
      }
    }
  }

  // Default implementation of attribute invalidation, can be redefined
  invalidateAttribute(name = 'all', diffReason = '') {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }

    if (name === 'all') {
      attributeManager.invalidateAll();
    } else {
      attributeManager.invalidate(name);
    }
  }

  updateAttributes(changedAttributes) {
    for (const model of this.getModels()) {
      this._setModelAttributes(model, changedAttributes);
    }
  }

  // Calls attribute manager to update any WebGL attributes
  _updateAttributes(props) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }

    // Figure out data length
    const numInstances = this.getNumInstances(props);
    const startIndices = this.getStartIndices(props);

    attributeManager.update({
      data: props.data,
      numInstances,
      startIndices,
      props,
      transitions: props.transitions,
      buffers: props.data.attributes,
      context: this,
      // Don't worry about non-attribute props
      ignoreUnknownAttributes: true
    });

    const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
    this.updateAttributes(changedAttributes);
  }

  // Update attribute transitions. This is called in drawLayer, no model updates required.
  _updateAttributeTransition() {
    const attributeManager = this.getAttributeManager();
    if (attributeManager) {
      attributeManager.updateTransition();
    }
  }

  // Update uniform (prop) transitions. This is called in updateState, may result in model updates.
  _updateUniformTransition() {
    const {uniformTransitions} = this.internalState;
    if (uniformTransitions.active) {
      // clone props
      const propsInTransition = uniformTransitions.update();
      const props = Object.create(this.props);
      for (const key in propsInTransition) {
        Object.defineProperty(props, key, {value: propsInTransition[key]});
      }
      return props;
    }
    return this.props;
  }

  calculateInstancePickingColors(attribute, {numInstances}) {
    if (attribute.constant) {
      return;
    }

    // calculateInstancePickingColors always generates the same sequence.
    // pickingColorCache saves the largest generated sequence for reuse
    const cacheSize = Math.floor(pickingColorCache.length / 3);

    // Record when using the picking buffer cache, so that layers can always point at the most recently allocated cache
    this.internalState.usesPickingColorCache = true;

    if (cacheSize < numInstances) {
      if (numInstances > MAX_PICKING_COLOR_CACHE_SIZE) {
        log.warn(
          'Layer has too many data objects. Picking might not be able to distinguish all objects.'
        )();
      }

      pickingColorCache = typedArrayManager.allocate(pickingColorCache, numInstances, {
        size: 3,
        copy: true,
        maxCount: Math.max(numInstances, MAX_PICKING_COLOR_CACHE_SIZE)
      });

      // If the attribute is larger than the cache, resize the cache and populate the missing chunk
      const newCacheSize = Math.floor(pickingColorCache.length / 3);
      const pickingColor = [];
      for (let i = cacheSize; i < newCacheSize; i++) {
        this.encodePickingColor(i, pickingColor);
        pickingColorCache[i * 3 + 0] = pickingColor[0];
        pickingColorCache[i * 3 + 1] = pickingColor[1];
        pickingColorCache[i * 3 + 2] = pickingColor[2];
      }
    }

    attribute.value = pickingColorCache.subarray(0, numInstances * 3);
  }

  _setModelAttributes(model, changedAttributes) {
    const attributeManager = this.getAttributeManager();
    const excludeAttributes = model.userData.excludeAttributes || {};
    const shaderAttributes = attributeManager.getShaderAttributes(
      changedAttributes,
      excludeAttributes
    );

    model.setAttributes(shaderAttributes);
  }

  // Sets the picking color at the specified index to null picking color. Used for multi-depth picking.
  // This method may be overriden by layer implementations
  disablePickingIndex(objectIndex) {
    this._disablePickingIndex(objectIndex);
  }

  _disablePickingIndex(objectIndex) {
    const {pickingColors, instancePickingColors} = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;

    const start = colors.getVertexOffset(objectIndex);
    const end = colors.getVertexOffset(objectIndex + 1);

    // Fill the sub buffer with 0s
    colors.buffer.subData({
      data: new Uint8Array(end - start),
      offset: start // 1 byte per element
    });
  }

  restorePickingColors() {
    const {pickingColors, instancePickingColors} = this.getAttributeManager().attributes;
    const colors = pickingColors || instancePickingColors;
    // The picking color cache may have been freed and then reallocated. This ensures we read from the currently allocated cache.
    if (
      this.internalState.usesPickingColorCache &&
      colors.value.buffer !== pickingColorCache.buffer
    ) {
      colors.value = pickingColorCache.subarray(0, colors.value.length);
    }
    colors.updateSubBuffer({startOffset: 0});
  }

  // Deduces numer of instances. Intention is to support:
  // - Explicit setting of numInstances
  // - Auto-deduction for ES6 containers that define a size member
  // - Auto-deduction for Classic Arrays via the built-in length attribute
  // - Auto-deduction via arrays
  getNumInstances(props) {
    props = props || this.props;

    // First Check if app has provided an explicit value
    if (props.numInstances !== undefined) {
      return props.numInstances;
    }

    // Second check if the layer has set its own value
    if (this.state && this.state.numInstances !== undefined) {
      return this.state.numInstances;
    }

    // Use container library to get a count for any ES6 container or object
    return count(props.data);
  }

  // Buffer layout describes how many attribute values are packed for each data object
  // The default (null) is one value each object.
  // Some data formats (e.g. paths, polygons) have various length. Their buffer layout
  //  is in the form of [L0, L1, L2, ...]
  getStartIndices(props) {
    props = props || this.props;

    // First Check if startIndices is provided as an explicit value
    if (props.startIndices !== undefined) {
      return props.startIndices;
    }

    // Second check if the layer has set its own value
    if (this.state && this.state.startIndices) {
      return this.state.startIndices;
    }

    return null;
  }

  // LAYER MANAGER API
  // Should only be called by the deck.gl LayerManager class

  // Called by layer manager when a new layer is found
  /* eslint-disable max-statements */
  _initialize() {
    debug(TRACE_INITIALIZE, this);

    this._initState();

    // Call subclass lifecycle methods
    this.initializeState(this.context);
    // Initialize extensions
    for (const extension of this.props.extensions) {
      extension.initializeState.call(this, this.context, extension);
    }
    // End subclass lifecycle methods

    // initializeState callback tends to clear state
    this.setChangeFlags({
      dataChanged: true,
      propsChanged: true,
      viewportChanged: true,
      extensionsChanged: true
    });

    this._updateState();
  }

  // Called by layer manager
  // if this layer is new (not matched with an existing layer) oldProps will be empty object
  _update() {
    // Call subclass lifecycle method
    const stateNeedsUpdate = this.needsUpdate();
    // End lifecycle method
    debug(TRACE_UPDATE, this, stateNeedsUpdate);

    if (stateNeedsUpdate) {
      this._updateState();
    }
  }

  // Common code for _initialize and _update
  _updateState() {
    const currentProps = this.props;
    const currentViewport = this.context.viewport;
    const propsInTransition = this._updateUniformTransition();
    this.internalState.propsInTransition = propsInTransition;
    // Overwrite this.context.viewport during update to use the last activated viewport on this layer
    // In multi-view applications, a layer may only be drawn in one of the views
    // Which would make the "active" viewport different from the shared context
    this.context.viewport = this.internalState.viewport || currentViewport;
    // Overwrite this.props during update to use in-transition prop values
    this.props = propsInTransition;

    try {
      const updateParams = this._getUpdateParams();
      const oldModels = this.getModels();

      // Safely call subclass lifecycle methods
      if (this.context.gl) {
        this.updateState(updateParams);
      } else {
        try {
          this.updateState(updateParams);
        } catch (error) {
          // ignore error if gl context is missing
        }
      }
      // Execute extension updates
      for (const extension of this.props.extensions) {
        extension.updateState.call(this, updateParams, extension);
      }

      const modelChanged = this.getModels()[0] !== oldModels[0];
      this._updateModules(updateParams, modelChanged);
      // End subclass lifecycle methods

      if (this.isComposite) {
        // Render or update previously rendered sublayers
        this._renderLayers(updateParams);
      } else {
        this.setNeedsRedraw();
        // Add any subclass attributes
        this._updateAttributes(this.props);

        // Note: Automatic instance count update only works for single layers
        if (this.state.model) {
          this.state.model.setInstanceCount(this.getNumInstances());
        }
      }
    } finally {
      // Restore shared context
      this.context.viewport = currentViewport;
      this.props = currentProps;
      this.clearChangeFlags();
      this.internalState.needsUpdate = false;
      this.internalState.resetOldProps();
    }
  }
  /* eslint-enable max-statements */

  // Called by manager when layer is about to be disposed
  // Note: not guaranteed to be called on application shutdown
  _finalize() {
    debug(TRACE_FINALIZE, this);

    // Call subclass lifecycle method
    this.finalizeState(this.context);
    // Finalize extensions
    for (const extension of this.props.extensions) {
      extension.finalizeState.call(this, extension);
    }
  }

  // Calculates uniforms
  drawLayer({moduleParameters = null, uniforms = {}, parameters = {}}) {
    this._updateAttributeTransition();

    const currentProps = this.props;
    // Overwrite this.props during redraw to use in-transition prop values
    // `internalState.propsInTransition` could be missing if `updateState` failed
    this.props = this.internalState.propsInTransition || currentProps;

    const {opacity} = this.props;
    // apply gamma to opacity to make it visually "linear"
    uniforms.opacity = Math.pow(opacity, 1 / 2.2);

    try {
      // TODO/ib - hack move to luma Model.draw
      if (moduleParameters) {
        this.setModuleParameters(moduleParameters);
      }

      // Apply polygon offset to avoid z-fighting
      // TODO - move to draw-layers
      const {getPolygonOffset} = this.props;
      const offsets = (getPolygonOffset && getPolygonOffset(uniforms)) || [0, 0];

      setParameters(this.context.gl, {polygonOffset: offsets});

      // Call subclass lifecycle method
      withParameters(this.context.gl, parameters, () => {
        const opts = {moduleParameters, uniforms, parameters, context: this.context};

        // extensions
        for (const extension of this.props.extensions) {
          extension.draw.call(this, opts, extension);
        }

        this.draw(opts);
      });
    } finally {
      this.props = currentProps;
    }

    // End lifecycle method
  }

  // Helper methods
  getChangeFlags() {
    return this.internalState.changeFlags;
  }

  // Dirty some change flags, will be handled by updateLayer
  /* eslint-disable complexity */
  setChangeFlags(flags) {
    const {changeFlags} = this.internalState;

    /* eslint-disable no-fallthrough, max-depth */
    for (const key in flags) {
      if (flags[key]) {
        let flagChanged = false;
        switch (key) {
          case 'dataChanged':
            // changeFlags.dataChanged may be `false`, a string (reason) or an array of ranges
            if (Array.isArray(changeFlags[key])) {
              changeFlags[key] = Array.isArray(flags[key])
                ? changeFlags[key].concat(flags[key])
                : flags[key];
              flagChanged = true;
            }

          default:
            if (!changeFlags[key]) {
              changeFlags[key] = flags[key];
              flagChanged = true;
            }
        }
        if (flagChanged) {
          debug(TRACE_CHANGE_FLAG, this, key, flags);
        }
      }
    }
    /* eslint-enable no-fallthrough, max-depth */

    // Update composite flags
    const propsOrDataChanged =
      changeFlags.dataChanged ||
      changeFlags.updateTriggersChanged ||
      changeFlags.propsChanged ||
      changeFlags.extensionsChanged;
    changeFlags.propsOrDataChanged = propsOrDataChanged;
    changeFlags.somethingChanged =
      propsOrDataChanged || flags.viewportChanged || flags.stateChanged;
  }
  /* eslint-enable complexity */

  // Clear all changeFlags, typically after an update
  clearChangeFlags() {
    this.internalState.changeFlags = {
      // Primary changeFlags, can be strings stating reason for change
      dataChanged: false,
      propsChanged: false,
      updateTriggersChanged: false,
      viewportChanged: false,
      stateChanged: false,
      extensionsChanged: false,

      // Derived changeFlags
      propsOrDataChanged: false,
      somethingChanged: false
    };
  }

  // Compares the layers props with old props from a matched older layer
  // and extracts change flags that describe what has change so that state
  // can be update correctly with minimal effort
  diffProps(newProps, oldProps) {
    const changeFlags = diffProps(newProps, oldProps);

    // iterate over changedTriggers
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this.invalidateAttribute(key);
        }
      }
    }

    // trigger uniform transitions
    if (changeFlags.transitionsChanged) {
      for (const key in changeFlags.transitionsChanged) {
        // prop changed and transition is enabled
        this.internalState.uniformTransitions.add(
          key,
          oldProps[key],
          newProps[key],
          newProps.transitions[key]
        );
      }
    }

    return this.setChangeFlags(changeFlags);
  }

  // Called by layer manager to validate props (in development)
  validateProps() {
    validateProps(this.props);
  }

  setModuleParameters(moduleParameters) {
    for (const model of this.getModels()) {
      model.updateModuleSettings(moduleParameters);
    }
  }

  updateAutoHighlight(info) {
    if (this.props.autoHighlight) {
      this._updateAutoHighlight(info);
    }
  }

  // May be overriden by classes
  _updateAutoHighlight(info) {
    const pickingModuleParameters = {
      pickingSelectedColor: info.picked ? info.color : null
    };
    const {highlightColor} = this.props;
    if (info.picked && typeof highlightColor === 'function') {
      pickingModuleParameters.pickingHighlightColor = highlightColor(info);
    }
    this.setModuleParameters(pickingModuleParameters);
    // setModuleParameters does not trigger redraw
    this.setNeedsRedraw();
  }

  // PRIVATE METHODS
  _updateModules({props, oldProps}, forceUpdate) {
    // Picking module parameters
    const {autoHighlight, highlightedObjectIndex, highlightColor} = props;
    if (
      forceUpdate ||
      oldProps.autoHighlight !== autoHighlight ||
      oldProps.highlightedObjectIndex !== highlightedObjectIndex ||
      oldProps.highlightColor !== highlightColor
    ) {
      const parameters = {};
      if (!autoHighlight) {
        parameters.pickingSelectedColor = null;
      }
      if (Array.isArray(highlightColor)) {
        parameters.pickingHighlightColor = highlightColor;
      }

      // highlightedObjectIndex will overwrite any settings from auto highlighting.
      if (Number.isInteger(highlightedObjectIndex)) {
        parameters.pickingSelectedColor =
          highlightedObjectIndex >= 0 ? this.encodePickingColor(highlightedObjectIndex) : null;
      }

      this.setModuleParameters(parameters);
    }
  }

  _getUpdateParams() {
    return {
      props: this.props,
      oldProps: this.internalState.getOldProps(),
      context: this.context,
      changeFlags: this.internalState.changeFlags
    };
  }

  // Checks state of attributes and model
  _getNeedsRedraw(opts) {
    // this method may be called by the render loop as soon a the layer
    // has been created, so guard against uninitialized state
    if (!this.internalState) {
      return false;
    }

    let redraw = false;
    redraw = redraw || (this.internalState.needsRedraw && this.id);
    this.internalState.needsRedraw = this.internalState.needsRedraw && !opts.clearRedrawFlags;

    // TODO - is attribute manager needed? - Model should be enough.
    const attributeManager = this.getAttributeManager();
    const attributeManagerNeedsRedraw = attributeManager && attributeManager.getNeedsRedraw(opts);
    redraw = redraw || attributeManagerNeedsRedraw;

    return redraw;
  }

  // Create new attribute manager
  _getAttributeManager() {
    return new AttributeManager(this.context.gl, {
      id: this.props.id,
      stats: this.context.stats,
      timeline: this.context.timeline
    });
  }

  _initState() {
    assert(!this.internalState && !this.state); // finalized layer cannot be reused
    assert(isFinite(this.props.coordinateSystem)); // invalid coordinateSystem

    const attributeManager = this._getAttributeManager();

    if (attributeManager) {
      // All instanced layers get instancePickingColors attribute by default
      // Their shaders can use it to render a picking scene
      // TODO - this slightly slows down non instanced layers
      attributeManager.addInstanced({
        instancePickingColors: {
          type: GL.UNSIGNED_BYTE,
          size: 3,
          noAlloc: true,
          update: this.calculateInstancePickingColors
        }
      });
    }

    this.internalState = new LayerState({
      attributeManager,
      layer: this
    });
    this.clearChangeFlags(); // populate this.internalState.changeFlags

    this.state = {};
    // for backwards compatibility with older layers
    // TODO - remove in next release
    /* eslint-disable accessor-pairs */
    Object.defineProperty(this.state, 'attributeManager', {
      get: () => {
        log.deprecated('layer.state.attributeManager', 'layer.getAttributeManager()');
        return attributeManager;
      }
    });
    /* eslint-enable accessor-pairs */

    this.internalState.layer = this;
    this.internalState.uniformTransitions = new UniformTransitionManager(this.context.timeline);
    this.internalState.onAsyncPropUpdated = this._onAsyncPropUpdated.bind(this);

    // Ensure any async props are updated
    this.internalState.setAsyncProps(this.props);
  }

  // Called by layer manager to transfer state from an old layer
  _transferState(oldLayer) {
    debug(TRACE_MATCHED, this, this === oldLayer);

    const {state, internalState} = oldLayer;

    if (this === oldLayer) {
      return;
    }

    // Move internalState
    this.internalState = internalState;
    this.internalState.layer = this;

    // Move state
    this.state = state;
    // We keep the state ref on old layers to support async actions
    // oldLayer.state = null;

    // Ensure any async props are updated
    this.internalState.setAsyncProps(this.props);

    this.diffProps(this.props, this.internalState.getOldProps());
  }

  _onAsyncPropUpdated() {
    this.diffProps(this.props, this.internalState.getOldProps());
    this.setNeedsUpdate();
  }
}

Layer.layerName = 'Layer';
Layer.defaultProps = defaultProps;
