
// IMLEMENTATION NOTES: Why new layers are created on every render
//
// The key here is to understand the declarative / functional
// programming nature of React.
//
// - In React, the a representation of the entire "UI tree" is re-rendered
//   every time something changes.
// - React then diffs the rendered tree of "ReactElements" against the
// previous tree and makes optimized changes to the DOM.
//
// - Due the difficulty of making non-DOM elements in React 14, our Layers
// are a "pseudo-react" construct. So, the render function will indeed create
// new layers every render call, however the new layers are immediately
// matched against existing layers using layer index/layer id.
// A new layers only has a props field pointing to the unmodified props
// object supplied by the app on creation.
// All calculated state (programs, attributes etc) are stored in a state object
// and this state object is moved forward to the new layer every render.
// The new layer ends up with the state of the old layer but the props of
// the new layer, while the old layer is discarded.

/* eslint-disable no-try-catch */
/* eslint-disable no-console */
/* global console */
import Layer from './layer';
import {Viewport} from '../viewport';
import {fp64ify} from '../lib/utils/fp64';
import {log} from './utils';
import assert from 'assert';

export default class LayerManager {
  constructor({gl}) {
    this.prevLayers = [];
    this.layers = [];
    // Tracks if any layers were drawn last update
    // Needed to ensure that screen is cleared when no layers are shown
    this.drewLayers = false;
    this.context = {gl, viewport: null, uniforms: {}};
    Object.seal(this.context);
  }

  setContext({
    viewport,
    width, height, latitude, longitude, zoom, pitch, bearing, altitude
  }) {
    viewport = viewport || new Viewport({
      width, height, latitude, longitude, zoom, pitch, bearing, altitude,
      tileSize: 512
    });

    this.context.viewport = viewport;
    this.context.uniforms = {
      mercatorScale: Math.pow(2, zoom),
      mercatorCenter: viewport.center,
      mercatorScaleFP64: fp64ify(Math.pow(2, zoom)),
      ...viewport.getUniforms()
    };

    // log(3, viewport, latitude, longitude, zoom);
    return this;
  }

  updateLayers({newLayers}) {
    this.prevLayers = this.layers;
    const {error, generatedLayers} = _updateLayers({
      oldLayers: this.prevLayers,
      newLayers,
      context: this.context
    });
    this.layers = generatedLayers;
    // Throw first error found, if any
    if (error) {
      throw error;
    }
    return this;
  }

  drawLayers() {
    const {uniforms} = this.context;
    for (const layer of this.layers) {
      if (layer.props.visible) {
        layer.drawLayer({uniforms});
      }
    }
    return this;
  }

  getLayerPickingModels() {
    const models = [];
    for (const layer of this.layers) {
      const {visible, pickable, isPickable} = layer.props;
      if (visible && (pickable || isPickable) && layer.state.model) {
        models.push(layer.state.model);
      }
    }
    return models;
  }

  needsRedraw(layers, {clearRedrawFlags = false} = {}) {
    let redraw = false;

    // Make sure that buffer is cleared once when layer list becomes empty
    if (layers.length === 0 && this.drewLayers) {
      redraw = true;
    }

    this.drewLayers = false;
    for (const layer of this.layers) {
      redraw = redraw || layer.getNeedsRedraw({clearRedrawFlags});
      this.drewLayers = true;
    }

    return redraw;
  }
}

export function _updateLayers({oldLayers, newLayers, context}) {
  // Match all layers, checking for caught errors
  // To avoid having an exception in one layer disrupt other layers
  const {error, generatedLayers} = matchLayers(oldLayers, newLayers, context);
  const error2 = finalizeOldLayers(oldLayers);
  const error3 = updateMatchedLayers(generatedLayers);
  const error4 = initializeNewLayers(generatedLayers);
  const firstError = error || error2 || error3 || error4;
  return {error: firstError, generatedLayers};
}

function layerName(layer) {
  if (layer instanceof Layer) {
    return `<${layer.constructor.name}:'${layer.props.id}'>`;
  }
  return !layer ? 'null layer' : 'invalid layer';
}

function matchLayers(oldLayers, newLayers, context) {
  // set context
  for (const newLayer of newLayers) {
    newLayer.context = context;
  }

  // Create old layer map
  const oldLayerMap = {};
  for (const oldLayer of oldLayers) {
    if (oldLayerMap[oldLayer.id]) {
      throw new Error('Multipe old layers with same id');
    }
    oldLayerMap[oldLayer.id] = oldLayer;
  }

  const generatedLayers = [];
  const error = matchSublayers({newLayers, oldLayerMap, generatedLayers});
  return {generatedLayers, error};
}

/* eslint-disable max-statements */
function matchSublayers({newLayers, oldLayerMap, generatedLayers}) {
  let error = null;
  for (const newLayer of newLayers) {
    try {
      // 1. given a new coming layer, find its matching layer
      const oldLayer = oldLayerMap[newLayer.id];
      oldLayerMap[newLayer.id] = null;

      // Only transfer state at this stage. We must not generate exceptions
      // until all layers' state have been transferred
      if (oldLayer) {
        log(3, `matched ${layerName(newLayer)}`, oldLayer, '=>', newLayer);
        _transferLayerState(oldLayer, newLayer);
      }

      generatedLayers.push(newLayer);

      // Call layer lifecycle method: render sublayers
      let sublayers = newLayer.renderSublayers();
      // End layer lifecycle method: render sublayers

      if (sublayers) {
        sublayers = Array.isArray(sublayers) ? sublayers : [sublayers];
        matchSublayers({
          newLayers: sublayers,
          oldLayerMap,
          generatedLayers
        });
      }
    } catch (err) {
      console.error(
        `deck.gl error during matching of ${layerName(newLayer)} ${err}`, err);
      // Save first error
      error = error || err;
    }
  }
  return error;
}

function _transferLayerState(oldLayer, newLayer) {
  const {state, props} = oldLayer;
  assert(state, 'Matching layer has no state');
  assert(oldLayer !== newLayer, 'Matching layer is same');
  // Move state
  newLayer.state = state;
  state.layer = newLayer;
  // Update model layer reference
  if (state.model) {
    state.model.userData.layer = newLayer;
  }
  // Keep a temporary ref to the old props, for prop comparison
  newLayer.oldProps = props;
  oldLayer.state = null;
}

// Note: Layers can't be initialized until gl context is available
// Therefore this method can be called repeatedly
// This is a hack and should be cleaned up in calling code
function initializeNewLayers(layers) {
  let error = null;
  for (const layer of layers) {
    // Check if new layer, and initialize it's state
    if (!layer.state && layer.context.gl) {
      log(1, `initializing ${layerName(layer)}`);
      try {
        layer.initializeLayer();
      } catch (err) {
        console.error(
          `deck.gl error during initialization of ${layerName(layer)} ${err}`,
          err);
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
  }
  return error;
}

// Update the matched layers
function updateMatchedLayers(newLayers) {
  let error = null;
  for (const layer of newLayers) {
    const {oldProps, props} = layer;
    if (oldProps) {
      try {
        layer.updateLayer(oldProps, props);
      } catch (err) {
        console.error(
          `deck.gl error during update of ${layerName(layer)}`, err);
        // Save first error
        error = error || err;
      }
      log(2, `updating ${layerName(layer)}`);
    }
  }
  return error;
}

// Update the old layers that were matched
function finalizeOldLayers(oldLayers) {
  let error = null;
  // Unmatched layers still have state, it will be discarded
  for (const layer of oldLayers) {
    const {state} = layer;
    if (state) {
      try {
        layer.finalizeLayer();
      } catch (err) {
        console.error(
          `deck.gl error during finalization of ${layerName(layer)}`, err);
        // Save first error
        error = error || err;
      }
      layer.state = null;
      log(1, `finalizing ${layerName(layer)}`);
    }
  }
  return error;
}
