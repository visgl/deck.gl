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

import assert from 'assert';
import {Framebuffer, ShaderCache} from 'luma.gl';
import seer from 'seer';
import Layer from './layer';
import {drawLayers} from './draw-layers';
import {pickObject, pickVisibleObjects} from './pick-layers';
import {LIFECYCLE} from './constants';
import Viewport from '../viewports/viewport';
// TODO - remove, just for dummy initialization
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import log from '../utils/log';
import {flatten} from '../utils/flatten';

import {
  setPropOverrides,
  layerEditListener,
  seerInitListener,
  initLayerInSeer,
  updateLayerInSeer
} from './seer-integration';

const LOG_PRIORITY_LIFECYCLE = 2;
const LOG_PRIORITY_LIFECYCLE_MINOR = 4;

const initialContext = {
  uniforms: {},
  viewports: [],
  viewport: null,
  layerFilter: null,
  viewportChanged: true,
  pickingFBO: null,
  useDevicePixels: true,
  lastPickedInfo: {
    index: -1,
    layerId: null
  }
};

const layerName = layer => layer instanceof Layer ? `${layer}` : (!layer ? 'null' : 'invalid');

export default class LayerManager {

  constructor(gl, {eventManager} = {}) { // eslint-disable-line
     // Currently deck.gl expects the DeckGL.layers array to be different
     // whenever React rerenders. If the same layers array is used, the
     // LayerManager's diffing algorithm will generate a fatal error and
     // break the rendering.

     // `this.lastRenderedLayers` stores the UNFILTERED layers sent
     // down to LayerManager, so that `layers` reference can be compared.
     // If it's the same across two React render calls, the diffing logic
     // will be skipped.
    this.lastRenderedLayers = [];
    this.prevLayers = [];
    this.layers = [];

    this.oldContext = {};
    this.context = Object.assign({}, initialContext, {
      gl,
      // Enabling luma.gl Program caching using private API (_cachePrograms)
      shaderCache: new ShaderCache({gl, _cachePrograms: true})
    });

    // List of view descriptors, gets re-evaluated when width/height changes
    this.width = 100;
    this.height = 100;
    this.viewDescriptors = [];
    this.viewDescriptorsChanged = true;
    this.viewports = []; // Generated viewports
    this._needsRedraw = 'Initial render';

    // Event handling
    this._pickingRadius = 0;

    this._eventManager = null;
    this._onLayerClick = null;
    this._onLayerHover = null;
    this._onClick = this._onClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._pickAndCallback = this._pickAndCallback.bind(this);

    // Seer integration
    this._initSeer = this._initSeer.bind(this);
    this._editSeer = this._editSeer.bind(this);
    seerInitListener(this._initSeer);
    layerEditListener(this._editSeer);

    Object.seal(this);

    if (eventManager) {
      this._initEventHandling(eventManager);
    }

    // Init with dummy viewport
    this.setViewports([
      new WebMercatorViewport({width: 1, height: 1, latitude: 0, longitude: 0, zoom: 1})
    ]);
  }

  /**
   * Method to call when the layer manager is not needed anymore.
   *
   * Currently used in the <DeckGL> componentWillUnmount lifecycle to unbind Seer listeners.
   */
  finalize() {
    seer.removeListener(this._initSeer);
    seer.removeListener(this._editSeer);
  }

  needsRedraw({clearRedrawFlags = true} = {}) {
    return this._checkIfNeedsRedraw(clearRedrawFlags);
  }

  // Normally not called by app
  setNeedsRedraw(reason) {
    this._needsRedraw = this._needsRedraw || reason;
  }

  // Gets an (optionally) filtered list of layers
  getLayers({layerIds = null} = {}) {
    // Filtering by layerId compares beginning of strings, so that sublayers will be included
    // Dependes on the convention of adding suffixes to the parent's layer name
    return layerIds ?
      this.layers.filter(layer => layerIds.find(layerId => layer.id.indexOf(layerId) === 0)) :
      this.layers;
  }

  // Get a set of viewports for a given width and height
  // TODO - Intention is for deck.gl to autodeduce width and height and drop the need for props
  getViewports({width, height} = {}) {
    if (width !== this.width || height !== this.height || this.viewDescriptorsChanged) {
      this._rebuildViewportsFromViews({viewDescriptors: this.viewDescriptors, width, height});
      this.width = width;
      this.height = height;
    }
    return this.viewports;
  }

  /**
   * Set parameters needed for layer rendering and picking.
   * Parameters are to be passed as a single object, with the following values:
   * @param {Boolean} useDevicePixels
   */
  setParameters(parameters) {
    if ('eventManager' in parameters) {
      this._initEventHandling(parameters.eventManager);
    }

    if ('pickingRadius' in parameters ||
      'onLayerClick' in parameters ||
      'onLayerHover' in parameters) {
      this._setEventHandlingParameters(parameters);
    }

    // TODO - For now we set layers before viewports to preservenchangeFlags
    if ('layers' in parameters) {
      this.setLayers(parameters.layers);
    }

    if ('viewports' in parameters) {
      this.setViewports(parameters.viewports);
    }

    if ('layerFilter' in parameters) {
      this.context.layerFilter = parameters.layerFilter;
      if (this.context.layerFilter !== parameters.layerFilter) {
        this.setNeedsRedraw('layerFilter changed');
      }
    }

    if ('drawPickingColors' in parameters) {
      if (this.context.drawPickingColors !== parameters.drawPickingColors) {
        this.setNeedsRedraw('drawPickingColors changed');
      }
    }

    Object.assign(this.context, parameters);
  }

  // Update the view descriptor list and set change flag if needed
  setViewports(viewports) {
    // Ensure viewports are wrapped in descriptors
    const viewDescriptors = flatten(viewports, {filter: Boolean})
      .map(viewport => viewport instanceof Viewport ? {viewport} : viewport);

    this.viewDescriptorsChanged =
      this.viewDescriptorsChanged ||
      this._diffViews(viewDescriptors, this.viewDescriptors);

    // Try to not actually rebuild the viewports until `getViewports` is called
    if (this.viewDescriptorsChanged) {
      this.viewDescriptors = viewDescriptors;
      this._rebuildViewportsFromViews({viewDescriptors: this.viewDescriptors});
      this.viewDescriptorsChanged = false;
    }
  }

  // Supply a new layer list, initiating sublayer generation and layer matching
  setLayers(newLayers) {
    assert(this.context.viewport, 'LayerManager.updateLayers: viewport not set');

    // TODO - something is generating state updates that cause rerender of the same
    if (newLayers === this.lastRenderedLayers) {
      log.log(3, 'Ignoring layer update due to layer array not changed');
      return this;
    }
    this.lastRenderedLayers = newLayers;

    newLayers = flatten(newLayers, {filter: Boolean});

    for (const layer of newLayers) {
      layer.context = this.context;
    }

    this.prevLayers = this.layers;
    const {error, generatedLayers} = this._updateLayers({
      oldLayers: this.prevLayers,
      newLayers
    });

    this.layers = generatedLayers;
    // Throw first error found, if any
    if (error) {
      throw error;
    }
    return this;
  }

  drawLayers({pass = 'render to screen', redrawReason = 'unknown reason'} = {}) {
    const {gl, useDevicePixels, drawPickingColors} = this.context;

    // render this viewport
    drawLayers(gl, {
      layers: this.layers,
      viewports: this.getViewports(),
      onViewportActive: this._activateViewport.bind(this),
      useDevicePixels,
      drawPickingColors,
      pass,
      layerFilter: this.context.layerFilter,
      redrawReason
    });
  }

  // Pick the closest info at given coordinate
  pickObject({x, y, mode, radius = 0, layerIds, layerFilter}) {
    const {gl, useDevicePixels} = this.context;

    const layers = this.getLayers({layerIds});

    return pickObject(gl, {
      // User params
      x,
      y,
      radius,
      layers,
      mode,
      layerFilter,
      // Injected params
      viewports: this.getViewports(),
      onViewportActive: this._activateViewport.bind(this),
      pickingFBO: this._getPickingBuffer(),
      lastPickedInfo: this.context.lastPickedInfo,
      useDevicePixels
    });
  }

  // Get all unique infos within a bounding box
  pickObjects({x, y, width, height, layerIds, layerFilter}) {
    const {gl, useDevicePixels} = this.context;

    const layers = this.getLayers({layerIds});

    return pickVisibleObjects(gl, {
      x,
      y,
      width,
      height,
      layers,
      layerFilter,
      mode: 'pickObjects',
      // TODO - how does this interact with multiple viewports?
      viewport: this.context.viewport,
      viewports: this.getViewports(),
      onViewportActive: this._activateViewport.bind(this),
      pickingFBO: this._getPickingBuffer(),
      useDevicePixels
    });
  }

  //
  // DEPRECATED METHODS
  //

  updateLayers({newLayers}) {
    log.deprecated('updateLayers', 'setLayers');
    this.setLayers(newLayers);
  }

  setViewport(viewport) {
    log.deprecated('setViewport', 'setViewports');
    this.setViewports([viewport]);
    return this;
  }

  //
  // PRIVATE METHODS
  //

  _checkIfNeedsRedraw(clearRedrawFlags) {
    let redraw = this._needsRedraw;
    if (clearRedrawFlags) {
      this._needsRedraw = false;
    }

    // This layers list doesn't include sublayers, relying on composite layers
    for (const layer of this.layers) {
      // Call every layer to clear their flags
      const layerNeedsRedraw = layer.getNeedsRedraw({clearRedrawFlags});
      redraw = redraw || layerNeedsRedraw;
    }

    return redraw;
  }

  // Rebuilds viewports from descriptors towards a certain window size
  _rebuildViewportsFromViews({viewDescriptors, width, height}) {
    const newViewports = viewDescriptors.map(viewDescriptor =>
      // If a `Viewport` instance was supplied, use it, otherwise build it
      viewDescriptor.viewport instanceof Viewport ?
        viewDescriptor.viewport :
        this._makeViewportFromViewDescriptor({viewDescriptor, width, height})
    );

    this.setNeedsRedraw('Viewport(s) changed');

    // Ensure one viewport is activated, layers may expect it
    // TODO - handle empty viewport list (using dummy viewport), or assert
    // const oldViewports = this.context.viewports;
    // if (viewportsChanged) {

    const viewport = newViewports[0];
    assert(viewport instanceof Viewport, 'Invalid viewport');

    this.context.viewports = newViewports;
    this._activateViewport(viewport);
    // }

    // We've just rebuilt the viewports to match the descriptors, so clear the flag
    this.viewports = newViewports;
    this.viewDescriptorsChanged = false;
  }

  // Build a `Viewport` from a view descriptor
  // TODO - add support for autosizing viewports using width and height
  _makeViewportFromViewDescriptor({viewDescriptor, width, height}) {
    // Get the type of the viewport
    // TODO - default to WebMercator?
    const {type: ViewportType, viewState} = viewDescriptor;

    // Resolve relative viewport dimensions
    // TODO - we need to have width and height available
    const viewportDimensions = this._getViewDimensions({viewDescriptor});

    // Create the viewport, giving preference to view state in `viewState`
    return new ViewportType(Object.assign({},
      viewDescriptor,
      viewportDimensions,
      viewState // Object.assign handles undefined
    ));
  }

  // Check if viewport array has changed, returns true if any change
  // Note that descriptors can be the same
  _diffViews(newViews, oldViews) {
    if (newViews.length !== oldViews.length) {
      return true;
    }

    return newViews.some(
      (_, i) => this._diffView(newViews[i], oldViews[i])
    );
  }

  _diffView(newView, oldView) {
    // `View` hiearchy supports an `equals` method
    if (newView.viewport) {
      return !oldView.viewport || !newView.viewport.equals(oldView.viewport);
    }
    // TODO - implement deep equal on view descriptors
    return newView !== oldView;
  }

  // Support for relative viewport dimensions (e.g {y: '50%', height: '50%'})
  _getViewDimensions({viewDescriptor, width, height}) {
    const parsePercent = (value, max) => value;
    // TODO - enable to support percent size specifiers
    // const parsePercent = (value, max) => value ?
    //   Math.round(parseFloat(value) / 100 * max) :
    //   (value === null ? max : value);

    return {
      x: parsePercent(viewDescriptor.x, width),
      y: parsePercent(viewDescriptor.y, height),
      width: parsePercent(viewDescriptor.width, width),
      height: parsePercent(viewDescriptor.height, height)
    };
  }

  /**
   * @param {Object} eventManager   A source of DOM input events
   */
  _initEventHandling(eventManager) {
    this._eventManager = eventManager;

    // TODO: add/remove handlers on demand at runtime, not all at once on init.
    // Consider both top-level handlers like onLayerClick/Hover
    // and per-layer handlers attached to individual layers.
    // https://github.com/uber/deck.gl/issues/634
    this._eventManager.on({
      click: this._onClick,
      pointermove: this._onPointerMove,
      pointerleave: this._onPointerLeave
    });
  }

  // Set parameters for input event handling.
  _setEventHandlingParameters({
    pickingRadius,
    onLayerClick,
    onLayerHover
  }) {
    if (!isNaN(pickingRadius)) {
      this._pickingRadius = pickingRadius;
    }
    if (typeof onLayerClick !== 'undefined') {
      this._onLayerClick = onLayerClick;
    }
    if (typeof onLayerHover !== 'undefined') {
      this._onLayerHover = onLayerHover;
    }
    this._validateEventHandling();
  }

  // Make a viewport "current" in layer context, primed for draw
  _activateViewport(viewport) {
    // TODO - viewport change detection breaks METER_OFFSETS mode
    // const oldViewport = this.context.viewport;
    // const viewportChanged = !oldViewport || !viewport.equals(oldViewport);
    const viewportChanged = true;

    if (viewportChanged) {
      Object.assign(this.oldContext, this.context);
      this.context.viewport = viewport;
      this.context.viewportChanged = true;
      this.context.uniforms = {};
      log(4, viewport);

      // Update layers states
      // Let screen space layers update their state based on viewport
      // TODO - reimplement viewport change detection (single viewport optimization)
      // TODO - don't set viewportChanged during setViewports?
      if (this.context.viewportChanged) {
        for (const layer of this.layers) {
          layer.setChangeFlags({viewportChanged: 'Viewport changed'});
          this._updateLayer(layer);
        }
      }
    }

    assert(this.context.viewport, 'LayerManager: viewport not set');

    return this;
  }

  _getPickingBuffer() {
    const {gl} = this.context;
    // Create a frame buffer if not already available
    this.context.pickingFBO = this.context.pickingFBO || new Framebuffer(gl);
    // Resize it to current canvas size (this is a noop if size hasn't changed)
    this.context.pickingFBO.resize({width: gl.canvas.width, height: gl.canvas.height});
    return this.context.pickingFBO;
  }

  // Match all layers, checking for caught errors
  // To avoid having an exception in one layer disrupt other layers
  // TODO - mark layers with exceptions as bad and remove from rendering cycle?
  _updateLayers({oldLayers, newLayers}) {
    // Create old layer map
    const oldLayerMap = {};
    for (const oldLayer of oldLayers) {
      if (oldLayerMap[oldLayer.id]) {
        log.warn(`Multiple old layers with same id ${layerName(oldLayer)}`);
      } else {
        oldLayerMap[oldLayer.id] = oldLayer;
      }
    }

    // Allocate array for generated layers
    const generatedLayers = [];

    // Match sublayers
    const error = this._updateSublayersRecursively({
      newLayers, oldLayerMap, generatedLayers
    });

    // Finalize unmatched layers
    const error2 = this._finalizeOldLayers(oldLayerMap);

    const firstError = error || error2;
    return {error: firstError, generatedLayers};
  }

  // Note: adds generated layers to `generatedLayers` array parameter
  _updateSublayersRecursively({newLayers, oldLayerMap, generatedLayers}) {
    let error = null;

    for (const newLayer of newLayers) {
      newLayer.context = this.context;

      // Given a new coming layer, find its matching old layer (if any)
      const oldLayer = oldLayerMap[newLayer.id];
      if (oldLayer === null) { // null, rather than undefined, means this id was originally there
        log.warn(`Multiple new layers with same id ${layerName(newLayer)}`);
      }
      // Remove the old layer from candidates, as it has been matched with this layer
      oldLayerMap[newLayer.id] = null;

      let sublayers = null;

      // We must not generate exceptions until after layer matching is complete
      try {
        if (!oldLayer) {
          this._initializeLayer(newLayer);
          initLayerInSeer(newLayer); // Initializes layer in seer chrome extension (if connected)
        } else {
          this._transferLayerState(oldLayer, newLayer);
          this._updateLayer(newLayer);
          updateLayerInSeer(newLayer); // Updates layer in seer chrome extension (if connected)
        }
        generatedLayers.push(newLayer);

        // Call layer lifecycle method: render sublayers
        sublayers = newLayer.isComposite && newLayer.getSubLayers();
        // End layer lifecycle method: render sublayers
      } catch (err) {
        log.warn(`error during matching of ${layerName(newLayer)}`, err);
        error = error || err; // Record first exception
      }

      if (sublayers) {
        this._updateSublayersRecursively({
          newLayers: sublayers,
          oldLayerMap,
          generatedLayers
        });
      }
    }

    return error;
  }

  // Finalize any old layers that were not matched
  _finalizeOldLayers(oldLayerMap) {
    let error = null;
    for (const layerId in oldLayerMap) {
      const layer = oldLayerMap[layerId];
      if (layer) {
        error = error || this._finalizeLayer(layer);
      }
    }
    return error;
  }

  // Initializes a single layer, calling layer methods
  _initializeLayer(layer) {
    assert(!layer.state);
    log(LOG_PRIORITY_LIFECYCLE, `initializing ${layerName(layer)}`);

    let error = null;
    try {
      layer._initialize();
      layer.lifecycle = LIFECYCLE.INITIALIZED;
    } catch (err) {
      log.warn(`error while initializing ${layerName(layer)}\n`, err);
      error = error || err;
      // TODO - what should the lifecycle state be here? LIFECYCLE.INITIALIZATION_FAILED?
    }

    assert(layer.state);

    // Set back pointer (used in picking)
    layer.state.layer = layer;

    // Save layer on model for picking purposes
    // store on model.userData rather than directly on model
    for (const model of layer.getModels()) {
      model.userData.layer = layer;
    }

    return error;
  }

  _transferLayerState(oldLayer, newLayer) {
    if (newLayer !== oldLayer) {
      log(LOG_PRIORITY_LIFECYCLE_MINOR, `matched ${layerName(newLayer)}`, oldLayer, '->', newLayer);
      newLayer.lifecycle = LIFECYCLE.MATCHED;
      oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
      newLayer._transferState(oldLayer);
    } else {
      log.log(LOG_PRIORITY_LIFECYCLE_MINOR, `Matching layer is unchanged ${newLayer.id}`);
      newLayer.lifecycle = LIFECYCLE.MATCHED;
      newLayer.oldProps = newLayer.props;
    }
  }

  // Updates a single layer, cleaning all flags
  _updateLayer(layer) {
    log.log(LOG_PRIORITY_LIFECYCLE_MINOR, `updating ${layer} because: ${layer.printChangeFlags()}`);
    let error = null;
    try {
      layer._update();
    } catch (err) {
      log.warn(`error during update of ${layerName(layer)}`, err);
      // Save first error
      error = err;
    }
    return error;
  }

  // Finalizes a single layer
  _finalizeLayer(layer) {
    assert(layer.state);
    assert(layer.lifecycle !== LIFECYCLE.AWAITING_FINALIZATION);
    layer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;
    let error = null;
    this.setNeedsRedraw(`finalized ${layerName(layer)}`);
    try {
      layer._finalize();
    } catch (err) {
      log.warn(`error during finalization of ${layerName(layer)}`, err);
      error = err;
    }
    layer.lifecycle = LIFECYCLE.FINALIZED;
    log(LOG_PRIORITY_LIFECYCLE, `finalizing ${layerName(layer)}`);
    return error;
  }

  /**
   * Warn if a deck-level mouse event has been specified,
   * but no layers are `pickable`.
   */
  _validateEventHandling() {
    if (this.onLayerClick || this.onLayerHover) {
      if (this.layers.length && !this.layers.some(layer => layer.props.pickable)) {
        log.warn(1,
          'You have supplied a top-level input event handler (e.g. `onLayerClick`), ' +
          'but none of your layers have set the `pickable` flag.'
        );
      }
    }
  }

  /**
   * Route click events to layers.
   * `pickLayer` will call the `onClick` prop of any picked layer,
   * and `onLayerClick` is called directly from here
   * with any picking info generated by `pickLayer`.
   * @param {Object} event  An object encapsulating an input event,
   *                        with the following shape:
   *                        {Object: {x, y}} offsetCenter: center of the event
   *                        {Object} srcEvent:             native JS Event object
   */
  _onClick(event) {
    if (!event.offsetCenter) {
      // Do not trigger onHover callbacks when click position is invalid.
      return;
    }
    this._pickAndCallback({
      callback: this._onLayerClick,
      event,
      mode: 'click'
    });
  }

  /**
   * Route click events to layers.
   * `pickLayer` will call the `onHover` prop of any picked layer,
   * and `onLayerHover` is called directly from here
   * with any picking info generated by `pickLayer`.
   * @param {Object} event  An object encapsulating an input event,
   *                        with the following shape:
   *                        {Object: {x, y}} offsetCenter: center of the event
   *                        {Object} srcEvent:             native JS Event object
   */
  _onPointerMove(event) {
    if (event.isDown) {
      // Do not trigger onHover callbacks if mouse button is down.
      return;
    }
    this._pickAndCallback({
      callback: this._onLayerHover,
      event,
      mode: 'hover'
    });
  }

  _onPointerLeave(event) {
    this.pickObject({
      x: -1,
      y: -1,
      radius: this._pickingRadius,
      mode: 'hover'
    });
  }

  _pickAndCallback(options) {
    const pos = options.event.offsetCenter;
    const radius = this._pickingRadius;
    const selectedInfos = this.pickObject({x: pos.x, y: pos.y, radius, mode: options.mode});
    if (options.callback) {
      const firstInfo = selectedInfos.find(info => info.index >= 0) || null;
      // As per documentation, send null value when no valid object is picked.
      options.callback(firstInfo, selectedInfos, options.event.srcEvent);
    }
  }

  // SEER INTEGRATION

  /**
   * Called upon Seer initialization, manually sends layers data.
   */
  _initSeer() {
    this.layers.forEach(layer => {
      initLayerInSeer(layer);
      updateLayerInSeer(layer);
    });
  }

  /**
   * On Seer property edition, set override and update layers.
   */
  _editSeer(payload) {
    if (payload.type !== 'edit' || payload.valuePath[0] !== 'props') {
      return;
    }

    setPropOverrides(payload.itemKey, payload.valuePath.slice(1), payload.value);
    const newLayers = this.layers.map(layer => new layer.constructor(layer.props));
    this.updateLayers({newLayers});
  }
}
