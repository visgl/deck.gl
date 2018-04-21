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
import {COORDINATE_SYSTEM} from './constants';
import AttributeManager from './attribute-manager';
import {removeLayerInSeer} from './seer-integration';
import {LIFECYCLE} from '../lifecycle/constants';
import {createProps} from '../lifecycle/create-props';
import {diffProps} from '../lifecycle/props';
import {count} from '../utils/count';
import log from '../utils/log';
import {GL, withParameters} from 'luma.gl';
import assert from '../utils/assert';

import LayerState from './layer-state';

const LOG_PRIORITY_UPDATE = 1;
const EMPTY_PROPS = Object.freeze({});
const noop = () => {};

const defaultProps = {
  // data: Special handling for null, see below
  dataComparator: null,
  updateTriggers: {}, // Update triggers: a core change detection mechanism in deck.gl
  numInstances: undefined,

  visible: true,
  pickable: false,
  opacity: {type: 'number', min: 0, max: 1, value: 0.8},

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
  getPolygonOffset: ({layerIndex}) => [0, -layerIndex * 100],

  // Selection/Highlighting
  highlightedObjectIndex: null,
  autoHighlight: false,
  highlightColor: [0, 0, 128, 128]
};

let counter = 0;

export default class Layer {
  constructor(/* ...propObjects */) {
    // Merge supplied props with default props and freeze them.
    /* eslint-disable prefer-spread */
    this.props = createProps.apply(this, arguments);
    /* eslint-enable prefer-spread */

    // Define all members before layer is sealed
    this.id = this.props.id; // The layer's id, used for matching with layers from last render cycle
    this.count = counter++; // Keep track of how many layer instances you are generating
    this.lifecycle = LIFECYCLE.NO_STATE; // Helps track and debug the life cycle of the layers
    this.parentLayer = null; // reference to the composite layer parent that rendered this layer
    this.context = null; // Will reference layer manager's context, contains state shared by layers
    this.state = null; // Will be set to the shared layer state object during layer matching
    this.internalState = null;

    // Seal the layer
    Object.seal(this);
  }

  // clone this layer with modified props
  clone(newProps) {
    return new this.constructor(Object.assign({}, this.props, newProps));
  }

  toString() {
    const className = this.constructor.layerName || this.constructor.name;
    return `${className}({id: '${this.props.id}'})`;
  }

  get stats() {
    return this.internalState.stats;
  }

  // Public API

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
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
  // TODO - Need to align with existing needsUpdate before uncommenting
  // For now async props will call layerManager directly
  // setNeedsUpdate() {
  //   this.context.layerManager.setNeedsUpdate(String(this));
  // }

  // Checks state of attributes and model
  getNeedsRedraw({clearRedrawFlags = false} = {}) {
    return this._getNeedsRedraw(clearRedrawFlags);
  }

  // Checks if layer attributes needs updating
  needsUpdate() {
    // Call subclass lifecycle method
    return this.shouldUpdateState(this._getUpdateParams());
    // End lifecycle method
  }

  // Returns true if the layer is pickable and visible.
  isPickable() {
    return this.props.pickable && this.props.visible;
  }

  // Return an array of models used by this layer, can be overriden by layer subclass
  getModels() {
    return this.state && (this.state.models || (this.state.model ? [this.state.model] : []));
  }

  // TODO - Gradually phase out, does not support multi model layers
  getSingleModel() {
    return this.state && this.state.model;
  }

  getAttributeManager() {
    return this.internalState && this.internalState.attributeManager;
  }

  // Returns the most recent layer that matched to this state
  // (When reacting to an async event, this layer may no longer be the latest)
  getCurrentLayer() {
    return this.internalState && this.internalState.layer;
  }

  // Use iteration (the only required capability on data) to get first element
  // deprecated since we are effectively only supporting Arrays
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

  // PROJECTION METHODS

  // Projects a point with current map state (lat, lon, zoom, pitch, bearing)
  // TODO - need to be extended to work with COORDINATE_SYSTEM.METERS,IDENTITY
  // TODO - need to be extended to work with multiple `views`
  project(lngLat) {
    const {viewport} = this.context;
    assert(Array.isArray(lngLat));
    return viewport.project(lngLat);
  }

  unproject(xy) {
    const {viewport} = this.context;
    assert(Array.isArray(xy));
    return viewport.unproject(xy);
  }

  projectFlat(lngLat) {
    const {viewport} = this.context;
    assert(Array.isArray(lngLat));
    return viewport.projectFlat(lngLat);
  }

  unprojectFlat(xy) {
    const {viewport} = this.context;
    assert(Array.isArray(xy));
    return viewport.unprojectFlat(xy);
  }

  // TODO - needs to refer to context for devicePixels setting
  screenToDevicePixels(screenPixels) {
    log.deprecated('screenToDevicePixels', 'DeckGL prop useDevicePixels for conversion')();
    const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;
    return screenPixels * devicePixelRatio;
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  // @return {Array} - a black color
  nullPickingColor() {
    return [0, 0, 0];
  }

  // Returns the picking color that doesn't match any subfeature
  // Use if some graphics do not belong to any pickable subfeature
  encodePickingColor(i) {
    assert((((i + 1) >> 24) & 255) === 0, 'index out of picking color range');
    return [(i + 1) & 255, ((i + 1) >> 8) & 255, (((i + 1) >> 8) >> 8) & 255];
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

  // Let's layer control if updateState should be called
  shouldUpdateState({oldProps, props, context, changeFlags}) {
    return changeFlags.propsOrDataChanged;
  }

  // Default implementation, all attributes will be invalidated and updated
  // when data changes
  updateState({oldProps, props, context, changeFlags}) {
    const attributeManager = this.getAttributeManager();
    if (changeFlags.dataChanged && attributeManager) {
      attributeManager.invalidateAll();
    }
  }

  // Called once when layer is no longer matched and state will be discarded
  // App can destroy WebGL resources here
  finalizeState() {
    for (const model of this.getModels()) {
      model.delete();
    }
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

  // Default implementation of attribute invalidation, can be redefined
  invalidateAttribute(name = 'all', diffReason = '') {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }

    if (name === 'all') {
      log.log(LOG_PRIORITY_UPDATE, `updateTriggers invalidating all attributes: ${diffReason}`)();
      attributeManager.invalidateAll();
    } else {
      log.log(
        LOG_PRIORITY_UPDATE,
        `updateTriggers invalidating attribute ${name}: ${diffReason}`
      )();
      attributeManager.invalidate(name);
    }
  }

  // Calls attribute manager to update any WebGL attributes
  updateAttributes(props) {
    const attributeManager = this.getAttributeManager();
    if (!attributeManager) {
      return;
    }

    // Figure out data length
    const numInstances = this.getNumInstances(props);

    attributeManager.update({
      data: props.data,
      numInstances,
      props,
      transitions: props.transitions,
      buffers: props,
      context: this,
      // Don't worry about non-attribute props
      ignoreUnknownAttributes: true
    });

    const model = this.getSingleModel();
    if (model) {
      const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
      model.setAttributes(changedAttributes);
    }
  }

  // Update attribute transition
  updateTransition() {
    const model = this.getSingleModel();
    const attributeManager = this.getAttributeManager();
    const isInTransition = attributeManager && attributeManager.updateTransition();

    if (model && isInTransition) {
      model.setAttributes(attributeManager.getChangedAttributes({transition: true}));
    }
  }

  calculateInstancePickingColors(attribute, {numInstances}) {
    const {value, size} = attribute;
    // add 1 to index to seperate from no selection
    for (let i = 0; i < numInstances; i++) {
      const pickingColor = this.encodePickingColor(i);
      value[i * size + 0] = pickingColor[0];
      value[i * size + 1] = pickingColor[1];
      value[i * size + 2] = pickingColor[2];
    }
  }

  // this method overwrittes the current buffer and is used for multi-picking
  updateInstancePickingColors(excludeColors) {
    const excludeIds = excludeColors.map(this.decodePickingColor);

    const {instancePickingColors} = this.getAttributeManager().attributes;
    const {state: attribute, allocedInstances: numInstances} = instancePickingColors;

    const {value, size} = attribute;
    // add 1 to index to seperate from no selection
    for (let i = 0; i < numInstances; i++) {
      const pickingColor = excludeIds.includes(i)
        ? this.nullPickingColor()
        : this.encodePickingColor(i);
      value[i * size + 0] = pickingColor[0];
      value[i * size + 1] = pickingColor[1];
      value[i * size + 2] = pickingColor[2];
    }

    // TODO: Optimize this to use sub-buffer update!
    this.getSingleModel().setAttributes({instancePickingColors: attribute});
  }

  // Deduces numer of instances. Intention is to support:
  // - Explicit setting of numInstances
  // - Auto-deduction for ES6 containers that define a size member
  // - Auto-deduction for Classic Arrays via the built-in length attribute
  // - Auto-deduction via arrays
  getNumInstances(props) {
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
    const {data} = this.props;
    return count(data);
  }

  // LAYER MANAGER API
  // Should only be called by the deck.gl LayerManager class

  // Called by layer manager when a new layer is found
  /* eslint-disable max-statements */
  _initialize() {
    assert(this.context.gl);

    this._initState();

    // Call subclass lifecycle methods
    this.initializeState(this.context);
    // End subclass lifecycle methods

    // TODO deprecated, for backwards compatibility with older layers
    // in case layer resets state
    this.state.attributeManager = this.getAttributeManager();

    // initializeState callback tends to clear state
    this.setChangeFlags({dataChanged: true, propsChanged: true, viewportChanged: true});

    this.internalState.oldProps = EMPTY_PROPS;
    this._updateState();

    const model = this.getSingleModel();
    if (model) {
      model.id = this.props.id;
      model.program.id = `${this.props.id}-program`;
      model.geometry.id = `${this.props.id}-geometry`;
      model.setAttributes(this.getAttributeManager().getAttributes());
    }

    // Clear temporary states
    this.clearChangeFlags();
    this.internalState.oldProps = null;
  }

  // Called by layer manager
  // if this layer is new (not matched with an existing layer) oldProps will be empty object
  _update() {
    // Call subclass lifecycle method
    const stateNeedsUpdate = this.needsUpdate();
    // End lifecycle method

    if (stateNeedsUpdate) {
      this._updateState();
    }

    // Clear temporary states
    this.clearChangeFlags();
    this.internalState.oldProps = null;
  }
  /* eslint-enable max-statements */

  _updateState() {
    const updateParams = this._getUpdateParams();
    // Call subclass lifecycle methods
    this.updateState(updateParams);
    // End subclass lifecycle methods

    // Render or update previously rendered sublayers
    if (this.isComposite) {
      this._renderLayers();
    }

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
  _finalize() {
    assert(this.internalState && this.state);

    // Call subclass lifecycle method
    this.finalizeState(this.context);
    // End lifecycle method
    removeLayerInSeer(this.id);
  }

  // Calculates uniforms
  drawLayer({moduleParameters = null, uniforms = {}, parameters = {}}) {
    if (!uniforms.picking_uActive) {
      this.updateTransition();
    }

    // TODO/ib - hack move to luma Model.draw
    if (moduleParameters) {
      for (const model of this.getModels()) {
        model.updateModuleSettings(moduleParameters);
      }
    }

    // Apply polygon offset to avoid z-fighting
    // TODO - move to draw-layers
    const {getPolygonOffset} = this.props;
    const offsets = (getPolygonOffset && getPolygonOffset(uniforms)) || [0, 0];
    parameters.polygonOffset = offsets;

    // Call subclass lifecycle method
    withParameters(this.context.gl, parameters, () => {
      this.draw({moduleParameters, uniforms, parameters, context: this.context});
    });
    // End lifecycle method
  }

  // {uniforms = {}, ...opts}
  pickLayer(opts) {
    // Call subclass lifecycle method
    return this.getPickingInfo(opts);
    // End lifecycle method
  }

  // Helper methods
  getChangeFlags() {
    return this.internalState.changeFlags;
  }

  // Dirty some change flags, will be handled by updateLayer
  /* eslint-disable complexity */
  setChangeFlags(flags) {
    this.internalState.changeFlags = this.internalState.changeFlags || {};
    const changeFlags = this.internalState.changeFlags;

    // Update primary flags
    if (flags.dataChanged && !changeFlags.dataChanged) {
      changeFlags.dataChanged = flags.dataChanged;
      log.log(LOG_PRIORITY_UPDATE + 1, () => `dataChanged: ${flags.dataChanged} in ${this.id}`)();
    }
    if (flags.updateTriggersChanged && !changeFlags.updateTriggersChanged) {
      changeFlags.updateTriggersChanged =
        changeFlags.updateTriggersChanged && flags.updateTriggersChanged
          ? Object.assign({}, flags.updateTriggersChanged, changeFlags.updateTriggersChanged)
          : flags.updateTriggersChanged || changeFlags.updateTriggersChanged;
      log.log(
        LOG_PRIORITY_UPDATE + 1,
        () =>
          'updateTriggersChanged: ' +
          `${Object.keys(flags.updateTriggersChanged).join(', ')} in ${this.id}`
      )();
    }
    if (flags.propsChanged && !changeFlags.propsChanged) {
      changeFlags.propsChanged = flags.propsChanged;
      log.log(LOG_PRIORITY_UPDATE + 1, () => `propsChanged: ${flags.propsChanged} in ${this.id}`)();
    }
    if (flags.viewportChanged && !changeFlags.viewportChanged) {
      changeFlags.viewportChanged = flags.viewportChanged;
      log.log(
        LOG_PRIORITY_UPDATE + 2,
        () => `viewportChanged: ${flags.viewportChanged} in ${this.id}`
      )();
    }

    // Update composite flags
    const propsOrDataChanged =
      flags.dataChanged || flags.updateTriggersChanged || flags.propsChanged;
    changeFlags.propsOrDataChanged = changeFlags.propsOrDataChanged || propsOrDataChanged;
    changeFlags.somethingChanged =
      changeFlags.somethingChanged || propsOrDataChanged || flags.viewportChanged;
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

      // Derived changeFlags
      propsOrDataChanged: false,
      somethingChanged: false
    };
  }

  printChangeFlags() {
    const flags = this.internalState.changeFlags;
    return `\
${flags.dataChanged ? 'data ' : ''}\
${flags.propsChanged ? 'props ' : ''}\
${flags.updateTriggersChanged ? 'triggers ' : ''}\
${flags.viewportChanged ? 'viewport' : ''}\
`;
  }

  // Compares the layers props with old props from a matched older layer
  // and extracts change flags that describe what has change so that state
  // can be update correctly with minimal effort
  // TODO - arguments for testing only
  diffProps(newProps, oldProps) {
    const changeFlags = diffProps(newProps, oldProps);

    // iterate over changedTriggers
    if (changeFlags.updateTriggersChanged) {
      for (const key in changeFlags.updateTriggersChanged) {
        if (changeFlags.updateTriggersChanged[key]) {
          this._activeUpdateTrigger(key);
        }
      }
    }

    return this.setChangeFlags(changeFlags);
  }

  // PRIVATE METHODS

  _getUpdateParams() {
    return {
      props: this.props,
      oldProps: this.internalState.oldProps || this.props,
      context: this.context,
      changeFlags: this.internalState.changeFlags
    };
  }

  // Checks state of attributes and model
  _getNeedsRedraw(clearRedrawFlags) {
    // this method may be called by the render loop as soon a the layer
    // has been created, so guard against uninitialized state
    if (!this.internalState) {
      return false;
    }

    let redraw = false;
    redraw = redraw || (this.internalState.needsRedraw && this.id);
    this.internalState.needsRedraw = this.internalState.needsRedraw && !clearRedrawFlags;

    // TODO - is attribute manager needed? - Model should be enough.
    const attributeManager = this.getAttributeManager();
    const attributeManagerNeedsRedraw =
      attributeManager && attributeManager.getNeedsRedraw({clearRedrawFlags});
    redraw = redraw || attributeManagerNeedsRedraw;

    for (const model of this.getModels()) {
      let modelNeedsRedraw = model.getNeedsRedraw({clearRedrawFlags});
      if (modelNeedsRedraw && typeof modelNeedsRedraw !== 'string') {
        modelNeedsRedraw = `model ${model.id}`;
      }
      redraw = redraw || modelNeedsRedraw;
    }

    return redraw;
  }

  _initState() {
    assert(!this.internalState && !this.state);

    const attributeManager = new AttributeManager(this.context.gl, {
      id: this.props.id,
      stats: this.context.stats
    });

    // All instanced layers get instancePickingColors attribute by default
    // Their shaders can use it to render a picking scene
    // TODO - this slightly slows down non instanced layers
    attributeManager.addInstanced({
      instancePickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        update: this.calculateInstancePickingColors
      }
    });

    this.internalState = new LayerState({
      attributeManager
    });
    this.state = {};
    // TODO deprecated, for backwards compatibility with older layers
    this.state.attributeManager = this.getAttributeManager();
  }

  // Called by layer manager to transfer state from an old layer
  _transferState(oldLayer) {
    const {state, internalState, props} = oldLayer;
    assert(state && internalState);

    internalState.oldProps = props;

    if (this === oldLayer) {
      return;
    }

    // Move state
    state.layer = this;
    this.state = state;
    this.internalState = internalState;
    // Note: We keep the state ref on old layers to support async actions
    // oldLayer.state = null;

    // Update model layer reference
    for (const model of this.getModels()) {
      model.userData.layer = this;
    }

    this.diffProps(this.props, props);
  }

  // Operate on each changed triggers, will be called when an updateTrigger changes
  _activeUpdateTrigger(propName) {
    this.invalidateAttribute(propName);
  }

  //  Helper to check that required props are supplied
  _checkRequiredProp(propertyName, condition) {
    const value = this.props[propertyName];
    if (value === undefined) {
      throw new Error(`Property ${propertyName} undefined in layer ${this}`);
    }
    if (condition && !condition(value)) {
      throw new Error(`Bad property ${propertyName} in layer ${this}`);
    }
  }

  _updateBaseUniforms() {
    const uniforms = {
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity, 1 / 2.2),
      ONE: 1.0
    };
    for (const model of this.getModels()) {
      model.setUniforms(uniforms);
    }

    // TODO - set needsRedraw on the model(s)?
    this.setNeedsRedraw();
  }

  _updateModuleSettings() {
    const settings = {
      pickingHighlightColor: this.props.highlightColor
    };
    for (const model of this.getModels()) {
      model.updateModuleSettings(settings);
    }
  }

  // DEPRECATED METHODS

  // Updates selected state members and marks the object for redraw
  setUniforms(uniformMap) {
    for (const model of this.getModels()) {
      model.setUniforms(uniformMap);
    }

    // TODO - set needsRedraw on the model(s)?
    this.setNeedsRedraw();
    log.deprecated('layer.setUniforms', 'model.setUniforms')();
  }
}

Layer.layerName = 'Layer';
Layer.defaultProps = defaultProps;
