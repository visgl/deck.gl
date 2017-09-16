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
import {log} from './utils';
import {flatten} from './utils/flatten';
import {drawLayers, pickLayers, queryLayers} from './draw-and-pick';
import {LIFECYCLE} from './constants';
import {Viewport} from './viewports';
import {
  setPropOverrides,
  layerEditListener,
  seerInitListener,
  initLayerInSeer,
  updateLayerInSeer
} from '../debug/seer-integration';

const LOG_PRIORITY_LIFECYCLE = 2;
const LOG_PRIORITY_LIFECYCLE_MINOR = 4;

const layerName = layer => layer instanceof Layer ?
  `${layer}` :
  (!layer ? 'null layer' : 'invalid layer');

export default class LayerManager {
  constructor({gl}) {
    /* Currently deck.gl expects the DeckGL.layers to be different
     whenever React rerenders. If the same layers array is used, the
     LayerManager's diffing algorithm will generate a fatal error and
     break the rendering.

     `this.lastRenderedLayers` stores the UNFILTERED layers sent
     down to LayerManager, so that `layers` reference can be compared.
     If it's the same across two React render calls, the diffing logic
     will be skipped.
    */

    this.lastRenderedLayers = [];

    this.prevLayers = [];
    this.layers = [];
    this.oldContext = {};
    this.screenCleared = false;
    this._needsRedraw = true;

    this._eventManager = null;
    this._pickingRadius = 0;
    this._onLayerClick = null;
    this._onLayerHover = null;
    this._onClick = this._onClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);

    this._initSeer = this._initSeer.bind(this);
    this._editSeer = this._editSeer.bind(this);

    this.context = {
      gl,
      uniforms: {},
      viewport: null,
      viewportChanged: true,
      pickingFBO: null,
      lastPickedInfo: {
        index: -1,
        layerId: null
      },
      shaderCache: new ShaderCache({gl})
    };

    seerInitListener(this._initSeer);
    layerEditListener(this._editSeer);

    Object.seal(this.context);
    Object.seal(this);
  }

  // Gets an (optionally) filtered list of layers
  getLayers({layerIds = null} = {}) {
    // Filtering by layerId compares beginning of strings, so that sublayers will be included
    // Dependes on the convention of adding suffixes to the parent's layer name
    return layerIds ?
      this.layers.filter(layer => layerIds.find(layerId => layer.id.indexOf(layerId) === 0)) :
      this.layers;
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

  setViewport(viewport) {
    assert(viewport instanceof Viewport, 'Invalid viewport');

    // TODO - viewport change detection breaks METER_OFFSETS mode
    // const oldViewport = this.context.viewport;
    // const viewportChanged = !oldViewport || !viewport.equals(oldViewport);

    this._needsRedraw = true;

    const viewportChanged = true;

    if (viewportChanged) {
      Object.assign(this.oldContext, this.context);
      this.context.viewport = viewport;
      this.context.viewportChanged = true;
      this.context.uniforms = {};
      log(4, viewport);
    }

    return this;
  }

  /**
   * @param {Object} eventManager   A source of DOM input events
   */
  initEventHandling(eventManager) {
    this._eventManager = eventManager;

    // TODO: add/remove handlers on demand at runtime, not all at once on init.
    // Consider both top-level handlers like onLayerClick/Hover
    // and per-layer handlers attached to individual layers.
    // https://github.com/uber/deck.gl/issues/634
    this._eventManager.on({
      click: this._onClick,
      pointermove: this._onPointerMove
    });
  }

  // Set parameters for input event handling.
  setEventHandlingParameters({
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

  updateLayers({newLayers}) {
    // TODO - something is generating state updates that cause rerender of the same
    if (newLayers === this.lastRenderedLayers) {
      log.log(3, 'Ignoring layer update due to layer array not changed');
      return this;
    }
    this.lastRenderedLayers = newLayers;

    assert(this.context.viewport, 'LayerManager.updateLayers: viewport not set');

    // Filter out any null layers
    newLayers = newLayers.filter(newLayer => newLayer !== null);

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

  drawLayers({pass}) {
    assert(this.context.viewport, 'LayerManager.drawLayers: viewport not set');

    drawLayers({layers: this.layers, pass});

    return this;
  }

  // Pick the closest info at given coordinate
  pickLayer({x, y, mode, radius = 0, layerIds}) {
    const {gl} = this.context;

    const layers = this.getLayers({layerIds});

    return pickLayers(gl, {
      x,
      y,
      radius,
      layers,
      mode,
      viewport: this.context.viewport,
      pickingFBO: this._getPickingBuffer(),
      lastPickedInfo: this.context.lastPickedInfo
    });
  }

  // Get all unique infos within a bounding box
  queryLayer({x, y, width, height, layerIds}) {
    const {gl} = this.context;
    const layers = layerIds ?
      this.layers.filter(layer => layerIds.indexOf(layer.id) >= 0) :
      this.layers;

    return queryLayers(gl, {
      x,
      y,
      width,
      height,
      layers,
      mode: 'query',
      viewport: this.context.viewport,
      pickingFBO: this._getPickingBuffer()
    });
  }

  needsRedraw({clearRedrawFlags = false} = {}) {
    if (!this.context.viewport) {
      return false;
    }

    let redraw = this._needsRedraw;
    if (clearRedrawFlags) {
      this._needsRedraw = false;
    }

    // Make sure that buffer is cleared once when layer list becomes empty
    if (this.layers.length === 0) {
      if (this.screenCleared === false) {
        redraw = true;
        this.screenCleared = true;
        return true;
      }
    } else if (this.screenCleared === true) {
      this.screenCleared = false;
    }

    for (const layer of this.layers) {
      redraw = redraw || layer.getNeedsRedraw({clearRedrawFlags});
    }

    return redraw;
  }

  //
  // PRIVATE METHODS
  //

  _getPickingBuffer() {
    const {gl} = this.context;

    // Create a frame buffer if not already available
    this.context.pickingFBO = this.context.pickingFBO || new Framebuffer(gl, {
      width: gl.canvas.width,
      height: gl.canvas.height
    });

    // Resize it to current canvas size (this is a noop if size hasn't changed)
    this.context.pickingFBO.resize({
      width: gl.canvas.width,
      height: gl.canvas.height
    });

    return this.context.pickingFBO;
  }

  // Match all layers, checking for caught errors
  // To avoid having an exception in one layer disrupt other layers
  _updateLayers({oldLayers, newLayers}) {
    // Create old layer map
    const oldLayerMap = {};
    for (const oldLayer of oldLayers) {
      if (oldLayerMap[oldLayer.id]) {
        log.once(0, `Multiple old layers with same id ${layerName(oldLayer)}`);
      } else {
        oldLayerMap[oldLayer.id] = oldLayer;
        oldLayer.lifecycle = LIFECYCLE.AWAITING_FINALIZATION;
      }
    }

    // Allocate array for generated layers
    const generatedLayers = [];

    // Match sublayers
    const error = this._matchSublayers({
      newLayers, oldLayerMap, generatedLayers
    });

    const error2 = this._finalizeOldLayers(oldLayers);
    const firstError = error || error2;
    return {error: firstError, generatedLayers};
  }

  /* eslint-disable max-statements */

  _matchSublayers({newLayers, oldLayerMap, generatedLayers}) {
    // Filter out any null layers
    newLayers = newLayers.filter(newLayer => newLayer !== null);

    let error = null;
    for (const newLayer of newLayers) {
      newLayer.context = this.context;

      try {
        // 1. given a new coming layer, find its matching layer
        const oldLayer = oldLayerMap[newLayer.id];
        oldLayerMap[newLayer.id] = null;

        if (oldLayer === null) {
          log.once(0, `Multiple new layers with same id ${layerName(newLayer)}`);
        }

        // Only transfer state at this stage. We must not generate exceptions
        // until all layers' state have been transferred
        if (oldLayer) {
          this._transferLayerState(oldLayer, newLayer);
          this._updateLayer(newLayer);

          updateLayerInSeer(newLayer); // Initializes layer in seer chrome extension (if connected)
        } else {
          this._initializeNewLayer(newLayer);

          initLayerInSeer(newLayer); // Initializes layer in seer chrome extension (if connected)
        }
        generatedLayers.push(newLayer);

        // Call layer lifecycle method: render sublayers
        const {props, oldProps} = newLayer;
        let sublayers = newLayer.isComposite ? newLayer._renderLayers({
          oldProps,
          props,
          context: this.context,
          oldContext: this.oldContext,
          changeFlags: newLayer.diffProps(oldProps, props, this.context)
        }) : null;
        // End layer lifecycle method: render sublayers

        if (sublayers) {
          // Flatten the returned array, removing any null, undefined or false
          // this allows layers to render sublayers conditionally
          // (see CompositeLayer.renderLayers docs)
          sublayers = flatten(sublayers, {filter: Boolean});

          // populate reference to parent layer
          sublayers.forEach(layer => {
            layer.parentLayer = newLayer;
          });

          this._matchSublayers({
            newLayers: sublayers,
            oldLayerMap,
            generatedLayers
          });
        }
      } catch (err) {
        log.once(0,
          `deck.gl error during matching of ${layerName(newLayer)} ${err}`, err);
        // Save first error
        error = error || err;
      }
    }
    return error;
  }

  _transferLayerState(oldLayer, newLayer) {
    const {state, props} = oldLayer;

    // sanity check
    assert(state, 'deck.gl sanity check - Matching layer has no state');
    if (newLayer !== oldLayer) {
      log(LOG_PRIORITY_LIFECYCLE_MINOR,
        `matched ${layerName(newLayer)}`, oldLayer, '->', newLayer);

      // Move state
      state.layer = newLayer;
      newLayer.state = state;

      // Update model layer reference
      if (state.model) {
        state.model.userData.layer = newLayer;
      }
      // Keep a temporary ref to the old props, for prop comparison
      newLayer.oldProps = props;
      // oldLayer.state = null;

      newLayer.lifecycle = LIFECYCLE.MATCHED;
      oldLayer.lifecycle = LIFECYCLE.AWAITING_GC;
    } else {
      log.log(LOG_PRIORITY_LIFECYCLE_MINOR, `Matching layer is unchanged ${newLayer.id}`);
      newLayer.lifecycle = LIFECYCLE.MATCHED;
      newLayer.oldProps = newLayer.props;
      // TODO - we could avoid prop comparisons in this case
    }
  }

  // Update the old layers that were not matched
  _finalizeOldLayers(oldLayers) {
    let error = null;
    // Matched layers have lifecycle state "outdated"
    for (const layer of oldLayers) {
      if (layer.lifecycle === LIFECYCLE.AWAITING_FINALIZATION) {
        error = error || this._finalizeLayer(layer);
      }
    }
    return error;
  }

  // Initializes a single layer, calling layer methods
  _initializeNewLayer(layer) {
    let error = null;
    // Check if new layer, and initialize it's state
    if (!layer.state) {
      log(LOG_PRIORITY_LIFECYCLE, `initializing ${layerName(layer)}`);
      try {

        layer.initializeLayer({
          oldProps: {},
          props: layer.props,
          oldContext: this.oldContext,
          context: this.context,
          changeFlags: layer.diffProps({}, layer.props, this.context)
        });

        layer.lifecycle = LIFECYCLE.INITIALIZED;

      } catch (err) {
        log.once(0, `deck.gl error during initialization of ${layerName(layer)} ${err}`, err);
        // Save first error
        error = error || err;
      }
      // Set back pointer (used in picking)
      if (layer.state) {
        layer.state.layer = layer;
        // Save layer on model for picking purposes
        // TODO - store on model.userData rather than directly on model
      }
      if (layer.state && layer.state.model) {
        layer.state.model.userData.layer = layer;
      }
    }
    return error;
  }

  // Updates a single layer, calling layer methods
  _updateLayer(layer) {
    const {oldProps, props} = layer;
    let error = null;
    if (oldProps) {
      try {
        layer.updateLayer({
          oldProps,
          props,
          context: this.context,
          oldContext: this.oldContext,
          changeFlags: layer.diffProps(oldProps, layer.props, this.context)
        });
      } catch (err) {
        log.once(0, `deck.gl error during update of ${layerName(layer)}`, err);
        // Save first error
        error = err;
      }
      log(LOG_PRIORITY_LIFECYCLE_MINOR, `updating ${layerName(layer)}`);
    }
    return error;
  }

  // Finalizes a single layer
  _finalizeLayer(layer) {
    let error = null;
    const {state} = layer;
    if (state) {
      try {
        layer.finalizeLayer();
      } catch (err) {
        log.once(0,
          `deck.gl error during finalization of ${layerName(layer)}`, err);
        // Save first error
        error = err;
      }
      // layer.state = null;
      layer.lifecycle = LIFECYCLE.FINALIZED;
      log(LOG_PRIORITY_LIFECYCLE, `finalizing ${layerName(layer)}`);
    }
    return error;
  }

  /**
   * Warn if a deck-level mouse event has been specified,
   * but no layers are `pickable`.
   */
  _validateEventHandling() {
    if (
      this.onLayerClick ||
      this.onLayerHover
    ) {
      if (this.layers.length && !this.layers.some(layer => layer.props.pickable)) {
        log.once(1,
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
    const pos = event.offsetCenter;
    if (!pos) {
      return;
    }
    const selectedInfos = this.pickLayer({
      x: pos.x,
      y: pos.y,
      radius: this._pickingRadius,
      mode: 'click'
    });
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      if (this._onLayerClick) {
        this._onLayerClick(firstInfo, selectedInfos, event.srcEvent);
      }
    }
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
      // Do not trigger onHover callbacks if mouse button is down
      return;
    }
    const pos = event.offsetCenter;
    // TODO: consider using this.eventManager.element size instead of layerManager.context
    // but do so in a way that doesn't cause reflow (e.g. `offsetWidth/Height`).
    // maybe the event object offers offsetCenter as a 0<>1 value as well?
    // since it's already doing size calculations...
    const {width, height} = this.context.viewport;
    if (!pos || pos.x < 0 || pos.y < 0 || pos.x > width || pos.y > height) {
      // Check if pointer is inside the canvas
      return;
    }
    const selectedInfos = this.pickLayer({
      x: pos.x,
      y: pos.y,
      radius: this._pickingRadius,
      mode: 'hover'
    });
    if (selectedInfos.length) {
      const firstInfo = selectedInfos.find(info => info.index >= 0);
      if (this._onLayerHover) {
        this._onLayerHover(firstInfo, selectedInfos, event.srcEvent);
      }
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
