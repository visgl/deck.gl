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

/* eslint-disable guard-for-in */
import {AttributeManager} from 'luma.gl';
import {areEqualShallow} from './util';
import {addIterator} from './util';
import log from './log';
import isDeepEqual from 'lodash.isequal';
import assert from 'assert';
import ViewportMercator from 'viewport-mercator-project';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
const DEFAULT_PROPS = {
  key: 0,
  opacity: 0.8,
  numInstances: undefined,
  data: [],
  isPickable: false,
  deepCompare: false,
  getValue: x => x,
  onHover: () => {},
  onClick: () => {},
  // Update triggers: a key change detection mechanism in deck.gl
  //
  // The value of `updateTriggers` is a map with fields corresponding to
  // attribute names (or `all`). Each field has a value which is an object,
  // it can contain any amount of data. The data for each field is compared
  // shallowly, and if a change is detected, the attribute is invalidated
  // (all attributes are invalidated if the `all` key is used.)
  // Note: updateTriggers are ignored by normal shallow comparison, so it is
  // OK for the app to mint a new object on every render.
  updateTriggers: {}
};

const ATTRIBUTES = {
  instancePickingColors:
    {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

let counter = 0;

export default class Layer {

  static get attributes() {
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
  constructor(props) {

    props = {
      ...DEFAULT_PROPS,
      ...props
    };

    // Add iterator to objects
    // TODO - Modifying props is an anti-pattern
    if (props.data) {
      addIterator(props.data);
      assert(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.props = props;

    this.checkProp(props.data, 'data');
    this.checkProp(props.id, 'id');
    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');

    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');
    this.checkProp(props.latitude, 'latitude');
    this.checkProp(props.longitude, 'longitude');
    this.checkProp(props.zoom, 'zoom');

    this.count = counter++;
  }
  /* eslint-enable max-statements */

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state
  initializeState() {
  }

  // gl context is now available
  didMount() {
  }

  shouldUpdate(oldProps, newProps) {
    // Check update triggers, and invalidate props accordingly
    if (this.checkUpdateTriggers(oldProps, newProps)) {
      return true;
    }
    // If any props have changed, ignoring updateTriggers objects
    // (updateTriggers are expected to be reminted on every update)
    const equalShallow = areEqualShallow(newProps, oldProps, {
      ignore: {updateTriggers: true}
    });
    if (!equalShallow) {
      if (newProps.data !== oldProps.data) {
        this.setState({dataChanged: true});
      }
      return true;
    }
    if (newProps.deepCompare && !isDeepEqual(newProps.data, oldProps.data)) {
      // Support optional deep compare of data
      // Note: this is quite inefficient, app should use buffer props instead
      this.setState({dataChanged: true});
      return true;
    }
    return false;
  }

  // Default implementation, all attributeManager will be updated
  willReceiveProps(oldProps, newProps) {
    const {attributeManager} = this.state;
    if (this.state.dataChanged) {
      attributeManager.invalidateAll();
    }
  }

  // gl context still available
  willUnmount() {
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
    redraw = redraw || model.getNeedsRedraw({clearRedrawFlags});
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

  // Internal Helpers

  checkProps(oldProps, newProps) {
    // Note: dataChanged might already be set
    if (newProps.data !== oldProps.data) {
      // Figure out data length
      this.state.dataChanged = true;
    }

    const viewportChanged =
      newProps.width !== oldProps.width ||
      newProps.height !== oldProps.height ||
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom;

    this.setState({viewportChanged});
  }

  updateAttributes(props) {
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

  updateBaseUniforms() {
    this.setUniforms({
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity || 0.8, 1 / 2.2)
    });
  }

  // Check if any update triggers have changed, and invalidate
  // attributes accordingly.
  checkUpdateTriggers(oldProps, newProps) {
    let change = false;
    const {attributeManager} = this.state;
    for (const propName in newProps.updateTriggers) {
      const oldTriggers = oldProps.updateTriggers[propName];
      const newTriggers = newProps.updateTriggers[propName];
      if (!areEqualShallow(oldTriggers, newTriggers)) {
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

  // LAYER MANAGER API

  // Called by layer manager when a new layer is found
  /* eslint-disable max-statements */
  initializeLayer({gl}) {
    assert(gl);
    this.state = {gl};

    // Initialize state only once
    this.setState({
      attributeManager: new AttributeManager({id: this.props.id}),
      model: null,
      needsRedraw: true,
      dataChanged: true
    });

    const {attributeManager} = this.state;
    // All instanced layers get instancePickingColors attribute by default
    // Their shaders can use it to render a picking scene
    attributeManager.addInstanced(ATTRIBUTES, {
      instancePickingColors: {update: this.calculateInstancePickingColors}
    });

    this.setViewport();
    this.initializeState();
    assert(this.state.model, 'Model must be set in initializeState');
    this.setViewport();

    // TODO - the app must be able to override

    // Add any subclass attributes
    this.updateAttributes(this.props);
    this.updateBaseUniforms();

    const {model} = this.state;
    model.setInstanceCount(this.getNumInstances());
    model.id = this.props.id;
    model.program.id = `${this.props.id}-program`;
    model.geometry.id = `${this.props.id}-geometry`;

    // Create a model for the layer
    this._updateModel({gl});

    // Call life cycle method
    this.didMount();
  }
  /* eslint-enable max-statements */

  // Called by layer manager when existing layer is getting new props
  updateLayer(oldProps, newProps) {
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

      if (this.state.model) {
        this.state.model.setInstanceCount(this.getNumInstances());
      }
    }

    this.state.dataChanged = false;
    this.state.viewportChanged = false;
  }

  // Called by manager when layer is about to be disposed
  // Note: not guaranteed to be called on application shutdown
  finalizeLayer() {
    this.willUnmount();
  }

  calculateInstancePickingColors(attribute, numInstances) {
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
    const {color} = info;
    info.index = this.decodePickingColor(color);
    // If props.data is an indexable array, get the object
    if (Array.isArray(this.props.data)) {
      info.object = this.props.data[info.index];
    }
    info.geoCoords = this.unproject({x: info.x, y: info.y});
    return info;
  }

  onHover(info) {
    const {color} = info;

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

  // INTERNAL METHODS
  _updateModel({gl}) {
    const {model, attributeManager, uniforms} = this.state;

    assert(model);
    model.setAttributes(attributeManager.getAttributes());
    model.setUniforms(uniforms);
    // whether current layer responds to mouse events
    model.setPickable(this.props.isPickable);
  }

  checkProp(property, propertyName) {
    if (property === undefined || property === null) {
      throw new Error(`Property ${propertyName} undefined in layer ${this.props.id}`);
    }
  }

  // MAP LAYER FUNCTIONALITY

  setViewport() {
    const {width, height, latitude, longitude, zoom} = this.props;
    this.setState({
      viewport: {x: 0, y: 0, width, height},
      mercator: ViewportMercator({
        width, height, latitude, longitude, zoom,
        tileSize: 512
      })
    });
    this.setUniforms({
      viewport: [0, 0, width, height],
      mercatorScale: Math.pow(2, zoom),
      mercatorCenter: [longitude, latitude]
    });
    log(3, this.state.viewport, latitude, longitude, zoom);
  }

  /**
   * Position conversion is done in shader, so in many cases there is no need
   * for this function
   * @param {Object|Array} latLng - Either [lat,lng] or {lat, lon}
   * @return {Object} - x, y
   */
  project(latLng) {
    const {mercator} = this.state;
    const [x, y] = Array.isArray(latLng) ?
      mercator.project([latLng[1], latLng[0]]) :
      mercator.project([latLng.lon, latLng.lat]);
    return {x, y};
  }

  unproject(xy) {
    const {mercator} = this.state;
    const [lon, lat] = Array.isArray(xy) ?
      mercator.unproject(xy) :
      mercator.unproject([xy.x, xy.y]);
    return {lat, lon};
  }
}
