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
import AttributeManager from './attribute-manager';
import {GL} from 'luma.gl';
import {addIterator, compareProps, log} from './utils';
import assert from 'assert';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {bool} props.opacity - opacity of the layer
 */
const DEFAULT_PROPS = {
  data: [],
  dataIterator: null,
  dataComparator: null,
  numInstances: undefined,
  visible: true,
  pickable: false,
  opacity: 0.8,
  onHover: () => {},
  onClick: () => {},
  getValue: x => x,
  // Update triggers: a key change detection mechanism in deck.gl
  // See layer documentation
  updateTriggers: {}
};

let counter = 0;

export default class Layer {
  /**
   * @classdesc
   * Base Layer class
   *
   * @class
   * @param {object} props - See docs above
   */
  constructor(props) {

    props = {
      ...DEFAULT_PROPS,
      ...props,
      // Accept null as data - otherwise apps will need to add ugly checks
      data: props.data || [],
      id: props.id || this.constructor.name
    };

    // Add iterator to objects
    // TODO - Modifying props is an anti-pattern
    // TODO - allow app to supply dataIterator prop?
    if (props.data) {
      addIterator(props.data);
      assert(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.id = props.id;
    this.count = counter++;
    this.props = props;
    this.oldProps = null;
    this.state = null;
    this.context = null;
    Object.seal(this);

    this.validateRequiredProp('data');
    this.validateRequiredProp('id', x => typeof x === 'string');

    this._validateDeprecatedProps();
  }

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state
  // App can create WebGL resources
  initializeState() {
    throw new Error(`Layer ${this.id} has not defined initializeState`);
  }

  // Called once when layer is no longer matched and state will be discarded
  // App can destroy WebGL resources
  finalizeState() {
  }

  shouldUpdate(oldProps, newProps, changeFlags) {
    return changeFlags.propsChanged;
  }

  // Default implementation, all attributeManager will be updated
  willReceiveProps(oldProps, newProps) {
    const {attributeManager} = this.state;
    if (this.state.dataChanged) {
      attributeManager.invalidateAll();
    }
  }

  // Implement to generate sublayers
  renderLayers() {
    return null;
  }

  // If state has a model, draw it with supplied uniforms
  draw(uniforms = {}) {
    const {model} = this.state;
    if (model) {
      model.render(uniforms);
    }
  }

  // If state has a model, draw it with supplied uniforms
  pick({uniforms, deviceX, deviceY}) {
    const {gl} = this.context;
    const {model} = this.state;

    if (model) {
      model.setUniforms({renderPickingBuffer: 1, pickingEnabled: 1});
      model.render(uniforms);
      model.setUniforms({renderPickingBuffer: 0, pickingEnabled: 0});

      // Read color in the central pixel, to be mapped with picking colors
      const color = new Uint8Array(4);
      gl.readPixels(deviceX, deviceY, 1, 1, GL.RGBA, GL.UNSIGNED_BYTE, color);

      const index = this.decodePickingColor(color);

      if (index >= 0) {
        // Return an info object
        return {index, color};
      }
    }

    return null;
  }

  // END LIFECYCLE METHODS
  // //////////////////////////////////////////////////

  // Public API

  setNeedsRedraw(redraw = true) {
    if (this.state) {
      this.state.needsRedraw = redraw;
    }
  }

  // Checks state of attributes and model
  // TODO - is attribute manager needed? - Model should be enough.
  getNeedsRedraw({clearRedrawFlags = false} = {}) {
    // this method may be called by the render loop as soon a the layer
    // has been created, so guard against uninitialized state
    if (!this.state) {
      return false;
    }

    const {attributeManager, model} = this.state;
    let redraw = false;
    redraw = redraw || this.state.needsRedraw;
    this.state.needsRedraw = this.state.needsRedraw && !clearRedrawFlags;

    redraw = redraw || attributeManager.getNeedsRedraw({clearRedrawFlags});
    redraw = redraw || (model && model.getNeedsRedraw({clearRedrawFlags}));
    return redraw;
  }

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
    Object.assign(this.state, updateObject);
    this.state.needsRedraw = true;
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

  // Use iteration (the only required capability on data) to get first element
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

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

  // INTERNAL METHODS

  // Calculates uniforms
  drawLayer(uniforms = {}) {
    assert(this.context.viewport, 'Layer missing context.viewport');
    const viewportUniforms = this.context.viewport.getUniforms(this.props);
    uniforms = {...uniforms, ...viewportUniforms};
    // Call lifecycle method
    this.draw(uniforms);
    // End lifecycle method
  }

  pickLayer(uniforms = {}) {
    const viewportUniforms = this.context.viewport.getUniforms(this.props);
    uniforms = {...uniforms, ...viewportUniforms, renderPickingBuffer: true};
    // Call lifecycle method
    return this.pick(uniforms);
    // End lifecycle method
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

    const {data} = props;

    // Check if ES6 collection "count" function is available
    if (data && typeof data.count === 'function') {
      return data.count();
    }

    // Check if ES6 collection "size" attribute is set
    if (data && data.size !== undefined) {
      return data.size;
    }

    // Check if array length attribute is set
    // Note: checking this last since some ES6 collections (Immutable.js)
    // emit profuse warnings when trying to access `length` attribute
    if (data && data.length !== undefined) {
      return data.length;
    }

    throw new Error('Could not deduce numInstances');
  }

  // LAYER MANAGER API

  // Called by layer manager when a new layer is found
  /* eslint-disable max-statements */
  initializeLayer() {
    assert(this.context.gl);

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
    attributeManager.addInstanced({
      instancePickingColors:
        {size: 3, update: this.calculateInstancePickingColors}
    });

    // Call subclass lifecycle method
    this.initializeState();
    // End subclass lifecycle method

    // Add any subclass attributes
    this._updateAttributes(this.props);
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
  /* eslint-enable max-statements */

  // Called by layer manager when existing layer is getting new props
  updateLayer(oldProps, newProps) {
    // Calculate change flags to simplify for layer
    const changeFlags = this._checkChangedProps(oldProps, newProps);

    // Set them on state
    // TODO remove in favor of argument to shouldUpdate/willReceiveProps
    this.setState(changeFlags);

    // Check if any props have changed
    if (this.shouldUpdate(oldProps, newProps, changeFlags)) {
      // Let the subclass mark what is needed for update
      this.willReceiveProps(oldProps, newProps, changeFlags);
      // Run the attribute updaters
      this._updateAttributes(newProps);
      // Update the uniforms
      this._updateBaseUniforms();

      if (this.state.model) {
        this.state.model.setInstanceCount(this.getNumInstances());
      }
    }

    // Reset change flags
    // TODO - remove, see above
    this.setState({
      dataChanged: false,
      viewportChanged: false
    });
  }

  // Called by manager when layer is about to be disposed
  // Note: not guaranteed to be called on application shutdown
  finalizeLayer() {
    // Call subclass lifecycle method
    this.finalizeState();
    // End subclass lifecycle method
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

  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    // 1 was added to seperate from no selection
    const index = i1 + i2 * 256 + i3 * 65536 - 1;
    return index;
  }

  encodePickingColor(i) {
    return [
      (i + 1) % 256,
      Math.floor((i + 1) / 256) % 256,
      Math.floor((i + 1) / 256 / 256) % 256
    ];
  }

  // VIRTUAL METHOD - Override to add or modify `info` object in sublayer
  // The sublayer may know what object e.g. lat,lon corresponds to using math
  // etc even when picking does not work
  onGetHoverInfo(info) {
    // If props.data is an indexable array, get the object
    if (Array.isArray(this.props.data)) {
      info.object = this.props.data[info.index];
    }
    info.pixel = [info.x, info.y];
    info.lngLat = this.unproject(info.pixel);
    // Backwards compatibility...
    info.geoCoords = {lat: info.lngLat[1], lon: info.lngLat[0]};
    return info;
  }

  onHover(info) {
    const {color} = info;

    // TODO - selectedPickingColor should be removed?
    const selectedPickingColor = new Float32Array(3);
    selectedPickingColor[0] = color[0];
    selectedPickingColor[1] = color[1];
    selectedPickingColor[2] = color[2];
    this.setUniforms({selectedPickingColor});

    info = this.onGetHoverInfo(info);
    return this.props.onHover(info);
  }

  onClick(info) {
    info = this.onGetHoverInfo(info);
    return this.props.onClick(info);
  }

  // Internal Helpers
  _checkChangedProps(oldProps, newProps) {
    // If any props have changed, ignoring updateTriggers objects
    // (updateTriggers are expected to be a new object on every update)
    const inequalReason = compareProps({
      newProps,
      oldProps,
      ignoreProps: {data: null, updateTriggers: null}
    });
    if (inequalReason) {
      return true;
    }

    return {
      propsChanged: Boolean(inequalReason),
      dataChanged: this._checkDataChanged(oldProps, newProps),
      viewportChanged: this.context.viewportChanged
    };
  }

  // The comparison of the data prop has some special handling
  _checkDataChanged(oldProps, newProps) {
    // Support optional app defined comparison of data
    const {dataComparator} = newProps;
    if (dataComparator) {
      if (!dataComparator(newProps.data, oldProps.data)) {
        return true;
      }
    // Otherwise, do a shallow equal on props
    } else if (newProps.data !== oldProps.data) {
      return true;
    }

    // If data hasn't changed, check update triggers
    // these will indicate if accessors will return diffferent values
    if (this._checkUpdateTriggers(oldProps, newProps)) {
      return true;
    }

    return false;
  }

  // Check if any update triggers have changed, and invalidate
  // attributes accordingly.
  _checkUpdateTriggers(oldProps, newProps) {
    let change = false;
    const {attributeManager} = this.state;
    for (const propName in newProps.updateTriggers) {
      const oldTriggers = oldProps.updateTriggers[propName];
      const newTriggers = newProps.updateTriggers[propName];
      const unequalReason = compareProps(oldTriggers, newTriggers);
      if (unequalReason) {
        if (propName === 'all') {
          attributeManager.invalidateAll();
          change = true;
        } else {
          attributeManager.invalidate(propName);
          change = true;
        }
      }
    }
    return change;
  }

  validateOptionalProp(propertyName, condition) {
    const value = this.props[propertyName];
    if (value !== undefined && !condition(value)) {
      throw new Error(`Bad property ${propertyName} in layer ${this.id}`);
    }
  }

  validateRequiredProp(propertyName, condition) {
    const value = this.props[propertyName];
    if (value === undefined) {
      throw new Error(`Property ${propertyName} undefined in layer ${this.id}`);
    }
    if (condition && !condition(value)) {
      throw new Error(`Bad property ${propertyName} in layer ${this.id}`);
    }
  }

  _validateDeprecatedProps() {
    if (this.props.isPickable !== undefined) {
      throw new Error('No isPickable prop in deckgl v3 - use pickable instead');
    }

    // TODO - inject viewport from overlay instead of creating for each layer?
    const hasViewportProps =
      this.props.width !== undefined ||
      this.props.height !== undefined ||
      this.props.latitude !== undefined ||
      this.props.longitude !== undefined ||
      this.props.zoom !== undefined ||
      this.props.pitch !== undefined ||
      this.props.bearing !== undefined;
    if (hasViewportProps) {
      /* eslint-disable no-console */
      // /* global console */
      throw new Error(
        `deck.gl v3 no longer needs viewport props in Layer ${this.id}`);
    }
  }
  /* eslint-enable max-statements */

  // Calls attribute manager to update any WebGL attributes
  _updateAttributes(props) {
    const {attributeManager, model} = this.state;
    const numInstances = this.getNumInstances(props);
    // Figure out data length
    attributeManager.update({
      numInstances,
      bufferMap: props,
      context: this,
      // Don't worry about non-attribute props
      ignoreUnknownAttributes: true
    });
    if (model) {
      const changedAttributes =
        attributeManager.getChangedAttributes({clearChangedFlags: true});
      model.setAttributes(changedAttributes);
    }
  }

  _updateBaseUniforms() {
    this.setUniforms({
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity, 1 / 2.2),
      ONE: 1.0
    });
  }
}
