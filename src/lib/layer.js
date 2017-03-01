// Copyright (c) 2015 Uber Technologies, Inc.
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
import {GL} from 'luma.gl';
import AttributeManager from './attribute-manager';
import {compareProps, log, count} from './utils';
import assert from 'assert';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {bool} props.opacity - opacity of the layer
 */
const defaultProps = {
  dataIterator: null,
  dataComparator: null,
  numInstances: undefined,
  visible: true,
  pickable: false,
  opacity: 0.8,
  onHover: () => {},
  onClick: () => {},
  // Update triggers: a key change detection mechanism in deck.gl
  // See layer documentation
  updateTriggers: {}
};

let counter = 0;

export default class Layer {
  /**
   * @class
   * @param {object} props - See docs and defaults above
   */
  constructor(props) {
    // If sublayer has static defaultProps member, getDefaultProps will return it
    const mergedDefaultProps = getDefaultProps(this);
    // Merge supplied props with pre-merged default props
    props = Object.assign({}, mergedDefaultProps, props);
    // Accept null as data - otherwise apps and layers need to add ugly checks
    props.data = props.data || [];
    // Props are immutable
    Object.freeze(props);

    // Define all members and freeze layer
    this.id = props.id;
    this.props = props;
    this.oldProps = null;
    this.state = null;
    this.context = null;
    this.count = counter++;
    Object.seal(this);

    this.validateRequiredProp('id', x => typeof x === 'string' && x !== '');
    this.validateRequiredProp('data');
  }

  toString() {
    const className = this.constructor.layerName || this.constructor.name;
    return className !== this.props.id ? `<${className}:'${this.props.id}'>` : `<${className}>`;
  }

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state
  // App can create WebGL resources
  initializeState() {
    throw new Error(`Layer ${this} has not defined initializeState`);
  }

  // Let's layer control if updateState should be called
  shouldUpdateState({oldProps, props, oldContext, context, changeFlags}) {
    return changeFlags.somethingChanged;
  }

  // Default implementation, all attributes will be invalidated and updated
  // when data changes
  updateState({oldProps, props, oldContext, context, changeFlags}) {
    if (changeFlags.dataChanged) {
      this.invalidateAttribute('all');
    }
  }

  // Called once when layer is no longer matched and state will be discarded
  // App can destroy WebGL resources here
  finalizeState() {
  }

  // Implement to generate sublayers
  renderLayers() {
    return null;
  }

  // If state has a model, draw it with supplied uniforms
  draw({uniforms = {}}) {
    if (this.state.model) {
      this.state.model.render(uniforms);
    }
  }

  // called to populate the info object that is passed to the event handler
  // @return null to cancel event
  getPickingInfo({info, mode}) {
    const {color, index} = info;

    if (index >= 0) {
      // If props.data is an indexable array, get the object
      if (Array.isArray(this.props.data)) {
        info.object = this.props.data[index];
      }
    }

    // TODO - move to the JS part of a shader picking shader package
    if (mode === 'hover') {
      const selectedPickingColor = new Float32Array(3);
      selectedPickingColor[0] = color[0];
      selectedPickingColor[1] = color[1];
      selectedPickingColor[2] = color[2];
      this.setUniforms({selectedPickingColor});
    }

    return info;
  }

  // END LIFECYCLE METHODS
  // //////////////////////////////////////////////////

  // Default implementation of attribute invalidation, can be redefine
  invalidateAttribute(name = 'all') {
    if (name === 'all') {
      this.state.attributeManager.invalidateAll();
    } else {
      this.state.attributeManager.invalidate(name);
    }
  }

  // Calls attribute manager to update any WebGL attributes, can be redefined
  updateAttributes(props) {
    const {attributeManager, model} = this.state;
    if (!attributeManager) {
      return;
    }

    const numInstances = this.getNumInstances(props);
    // Figure out data length
    attributeManager.update({
      data: props.data,
      numInstances,
      props,
      buffers: props,
      context: this,
      // Don't worry about non-attribute props
      ignoreUnknownAttributes: true
    });
    if (model) {
      const changedAttributes = attributeManager.getChangedAttributes({clearChangedFlags: true});
      model.setAttributes(changedAttributes);
    }
  }

  // Public API

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
    Object.assign(this.state, updateObject);
    this.state.needsRedraw = true;
  }

  setNeedsRedraw(redraw = true) {
    if (this.state) {
      this.state.needsRedraw = redraw;
    }
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
  project(lngLat) {
    const {viewport} = this.context;
    assert(Array.isArray(lngLat), 'Layer.project needs [lng,lat]');
    return viewport.project(lngLat);
  }

  unproject(xy) {
    const {viewport} = this.context;
    assert(Array.isArray(xy), 'Layer.unproject needs [x,y]');
    return viewport.unproject(xy);
  }

  projectFlat(lngLat) {
    const {viewport} = this.context;
    assert(Array.isArray(lngLat), 'Layer.project needs [lng,lat]');
    return viewport.projectFlat(lngLat);
  }

  unprojectFlat(xy) {
    const {viewport} = this.context;
    assert(Array.isArray(xy), 'Layer.unproject needs [x,y]');
    return viewport.unprojectFlat(xy);
  }

  screenToDevicePixels(screenPixels) {
    const devicePixelRatio = typeof window !== 'undefined' ?
      window.devicePixelRatio : 1;
    return screenPixels * devicePixelRatio;
  }

  /**
   * Returns the picking color that doesn't match any subfeature
   * Use if some graphics do not belong to any pickable subfeature
   * @return {Array} - a black color
   */
  nullPickingColor() {
    return [0, 0, 0];
  }

  /**
   * Returns the picking color that doesn't match any subfeature
   * Use if some graphics do not belong to any pickable subfeature
   * @param {int} i - index to be decoded
   * @return {Array} - the decoded color
   */
  encodePickingColor(i) {
    return [
      (i + 1) % 256,
      Math.floor((i + 1) / 256) % 256,
      Math.floor((i + 1) / 256 / 256) % 256
    ];
  }

  /**
   * Returns the picking color that doesn't match any subfeature
   * Use if some graphics do not belong to any pickable subfeature
   * @param {Uint8Array} color - color array to be decoded
   * @return {Array} - the decoded picking color
   */
  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    // 1 was added to seperate from no selection
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
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

  // DATA ACCESS API
  // Data can use iterators and may not be random access

  // Use iteration (the only required capability on data) to get first element
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

  // INTERNAL METHODS

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
    const {data} = props;
    return count(data);
  }

  // LAYER MANAGER API
  // Should only be called by the deck.gl LayerManager class

  // Called by layer manager when a new layer is found
  /* eslint-disable max-statements */
  initializeLayer(updateParams) {
    assert(this.context.gl, 'Layer context missing gl');
    assert(!this.state, 'Layer missing state');

    this.state = {};

    // Initialize state only once
    this.setState({
      attributeManager: new AttributeManager({id: this.props.id}),
      model: null,
      needsRedraw: true,
      dataChanged: true
    });

    // Add attribute manager loggers if provided
    this.state.attributeManager.setLogFunctions(this.props);

    const {attributeManager} = this.state;
    // All instanced layers get instancePickingColors attribute by default
    // Their shaders can use it to render a picking scene
    // TODO - this slows down non instanced layers
    attributeManager.addInstanced({
      instancePickingColors: {
        type: GL.UNSIGNED_BYTE,
        size: 3,
        update: this.calculateInstancePickingColors
      }
    });

    // Call subclass lifecycle methods
    this.initializeState();
    this.updateState(updateParams);
    // End subclass lifecycle methods

    // Add any subclass attributes
    this.updateAttributes(this.props);
    this._updateBaseUniforms();

    const {model} = this.state;
    if (model) {
      model.setInstanceCount(this.getNumInstances());
      model.id = this.props.id;
      model.program.id = `${this.props.id}-program`;
      model.geometry.id = `${this.props.id}-geometry`;
      model.setAttributes(attributeManager.getAttributes());
    }
  }

  // Called by layer manager when existing layer is getting new props
  updateLayer(updateParams) {
    // Check for deprecated method
    if (this.shouldUpdate) {
      log.once(0, `deck.gl v3 ${this}: "shouldUpdate" deprecated, renamed to "shouldUpdateState"`);
    }

    // Call subclass lifecycle method
    const stateNeedsUpdate = this.shouldUpdateState(updateParams);
    // End lifecycle method

    if (stateNeedsUpdate) {

      // Call deprecated lifecycle method if defined
      const hasRedefinedMethod = this.willReceiveProps &&
        this.willReceiveProps !== Layer.prototype.willReceiveProps;
      if (hasRedefinedMethod) {
        log.once(0, `deck.gl v3 willReceiveProps deprecated. Use updateState in ${this}`);
        const {oldProps, props, changeFlags} = updateParams;
        this.setState(changeFlags);
        this.willReceiveProps(oldProps, props, changeFlags);
        this.setState({
          dataChanged: false,
          viewportChanged: false
        });
      }
      // End lifecycle method

      // Call subclass lifecycle method
      this.updateState(updateParams);
      // End lifecycle method

      // Run the attribute updaters
      this.updateAttributes(updateParams.props);
      this._updateBaseUniforms();

      if (this.state.model) {
        this.state.model.setInstanceCount(this.getNumInstances());
      }
    }
  }
  /* eslint-enable max-statements */

  // Called by manager when layer is about to be disposed
  // Note: not guaranteed to be called on application shutdown
  finalizeLayer() {
    // Call subclass lifecycle method
    this.finalizeState();
    // End lifecycle method
  }

  // Calculates uniforms
  drawLayer({uniforms = {}}) {
    // Call subclass lifecycle method
    this.draw({uniforms});
    // End lifecycle method
  }

  // {uniforms = {}, ...opts}
  pickLayer(opts) {
    // Call subclass lifecycle method
    return this.getPickingInfo(opts);
    // End lifecycle method
  }

  diffProps(oldProps, newProps, context) {
    // First check if any props have changed (ignore props that will be examined separately)
    const propsChangedReason = compareProps({
      newProps,
      oldProps,
      ignoreProps: {data: null, updateTriggers: null}
    });

    // Now check if any data related props have changed
    const dataChangedReason = this._diffDataProps(oldProps, newProps);

    const propsChanged = Boolean(propsChangedReason);
    const dataChanged = Boolean(dataChangedReason);
    const viewportChanged = context.viewportChanged;
    const somethingChanged = propsChanged || dataChanged || viewportChanged;

    // Check update triggers to determine if any attributes need regeneration
    // Note - if data has changed, all attributes will need regeneration, so skip this step
    if (!dataChanged) {
      this._diffUpdateTriggers(oldProps, newProps);
    } else {
      log.log(1, `dataChanged: ${dataChanged}`);
    }

    return {
      propsChanged,
      dataChanged,
      viewportChanged,
      somethingChanged,
      reason: dataChangedReason || propsChangedReason
    };
  }

  // Checks state of attributes and model
  // TODO - is attribute manager needed? - Model should be enough.
  getNeedsRedraw({clearRedrawFlags = false} = {}) {
    // this method may be called by the render loop as soon a the layer
    // has been created, so guard against uninitialized state
    if (!this.state) {
      return false;
    }

    let redraw = false;
    redraw = redraw || this.state.needsRedraw;
    this.state.needsRedraw = this.state.needsRedraw && !clearRedrawFlags;

    const {attributeManager, model} = this.state;
    redraw = redraw || (attributeManager && attributeManager.getNeedsRedraw({clearRedrawFlags}));
    redraw = redraw || (model && model.getNeedsRedraw({clearRedrawFlags}));

    return redraw;
  }

  // PRIVATE METHODS

  // The comparison of the data prop requires special handling
  // the dataComparator should be used if supplied
  _diffDataProps(oldProps, newProps) {
    // Support optional app defined comparison of data
    const {dataComparator} = newProps;
    if (dataComparator) {
      if (!dataComparator(newProps.data, oldProps.data)) {
        return 'Data comparator detected a change';
      }
    // Otherwise, do a shallow equal on props
    } else if (newProps.data !== oldProps.data) {
      return 'A new data container was supplied';
    }

    return null;
  }

  // Checks if any update triggers have changed, and invalidate
  // attributes accordingly.
  /* eslint-disable max-statements */
  _diffUpdateTriggers(oldProps, newProps) {
    // const {attributeManager} = this.state;
    // const updateTriggerMap = attributeManager.getUpdateTriggerMap();

    let change = false;

    for (const propName in newProps.updateTriggers) {
      const oldTriggers = oldProps.updateTriggers[propName] || {};
      const newTriggers = newProps.updateTriggers[propName] || {};
      const diffReason = compareProps({
        oldProps: oldTriggers,
        newProps: newTriggers
      });
      if (diffReason) {
        if (propName === 'all') {
          log.log(1, `updateTriggers invalidating all attributes: ${diffReason}`);
          this.invalidateAttribute('all');
          change = true;
        } else {
          log.log(1, `updateTriggers invalidating attribute ${propName}: ${diffReason}`);
          this.invalidateAttribute(propName);
          change = true;
        }
      }
    }

    return change;
  }
  /* eslint-enable max-statements */

  validateRequiredProp(propertyName, condition) {
    const value = this.props[propertyName];
    if (value === undefined) {
      throw new Error(`Property ${propertyName} undefined in layer ${this}`);
    }
    if (condition && !condition(value)) {
      throw new Error(`Bad property ${propertyName} in layer ${this}`);
    }
  }

  _updateBaseUniforms() {
    this.setUniforms({
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity, 1 / 2.2),
      ONE: 1.0
    });
  }

  // DEPRECATED METHODS
  // shouldUpdate() {}

  willReceiveProps() {
  }

  // Updates selected state members and marks the object for redraw
  setUniforms(uniformMap) {
    if (this.state.model) {
      this.state.model.setUniforms(uniformMap);
    }
    // TODO - set needsRedraw on the model?
    this.state.needsRedraw = true;
    log(3, 'layer.setUniforms', uniformMap);
  }
}

Layer.layerName = 'Layer';
Layer.defaultProps = defaultProps;

// HELPERS

// Constructors have their super class constructors as prototypes
function getOwnProperty(object, prop) {
  return object.hasOwnProperty(prop) && object[prop];
}
/*
 * Return merged default props stored on layers constructor, create them if needed
 */
function getDefaultProps(layer) {
  const mergedDefaultProps = getOwnProperty(layer.constructor, 'mergedDefaultProps');
  if (mergedDefaultProps) {
    return mergedDefaultProps;
  }
  return mergeDefaultProps(layer);
}

/*
 * Walk the prototype chain and merge all default props
 */
function mergeDefaultProps(layer) {
  const subClassConstructor = layer.constructor;
  const layerName = getOwnProperty(subClassConstructor, 'layerName');
  if (!layerName) {
    log.once(0, `layer ${layer.constructor.name} does not specify a "layerName"`);
  }
  let mergedDefaultProps = {
    id: layerName || layer.constructor.name
  };

  while (layer) {
    const layerDefaultProps = getOwnProperty(layer.constructor, 'defaultProps');
    Object.freeze(layerDefaultProps);
    if (layerDefaultProps) {
      mergedDefaultProps = Object.assign({}, layerDefaultProps, mergedDefaultProps);
    }
    layer = Object.getPrototypeOf(layer);
  }
  // Store for quick lookup
  subClassConstructor.mergedDefaultProps = mergedDefaultProps;
  return mergedDefaultProps;
}

export const TEST_EXPORTS = {
  mergeDefaultProps
};
