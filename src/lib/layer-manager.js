
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
import {log} from './utils';
import assert from 'assert';
import Layer from './base-layer';

export function updateLayers({oldLayers, newLayers, gl, scene}) {
  // Match all layers, checking for caught errors
  const error1 = matchLayers(oldLayers, newLayers);
  const error2 = finalizeOldLayers(oldLayers);
  const error3 = updateMatchedLayers(newLayers);
  const error4 = initializeNewLayers(newLayers, {gl});
  addLayersToScene(newLayers, scene);
  // Throw first error found, if any
  const error = error1 || error2 || error3 || error4;
  if (error) {
    throw error;
  }
}

export function layersNeedRedraw(layers, {clearRedrawFlags = false} = {}) {
  let redraw = false;
  for (const layer of layers) {
    redraw = redraw || layer.getNeedsRedraw({clearRedrawFlags});
  }
  return redraw;
}

function layerName(layer) {
  if (layer instanceof Layer) {
    return `<${layer.constructor.name}:'${layer.props.id}'>`;
  }
  if (!layer) {
    return 'null layer';
  }
  return 'invalid layer';
}

function matchLayers(oldLayers, newLayers) {
  let error = null;
  for (const newLayer of newLayers) {
    try {
      // 1. given a new coming layer, find its matching layer
      const oldLayer = _findMatchingLayer(oldLayers, newLayer);

      // Only transfer state at this stage. We must not generate exceptions
      // until all layers' state have been transferred
      if (oldLayer) {
        log(3, `matched ${layerName(newLayer)}`, oldLayer, '=>', newLayer);

        _transferLayerState(oldLayer, newLayer);
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

function _findMatchingLayer(oldLayers, newLayer) {
  const candidates = oldLayers.filter(l => l.props.id === newLayer.props.id);
  if (candidates.length > 1) {
    throw new Error(
      `deck.gl error layer has more than one match ${layerName(newLayer)}`);
  }
  return candidates.length > 0 && candidates[0];
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
function initializeNewLayers(layers, {gl}) {
  if (!gl) {
    return null;
  }

  let error = null;
  for (const layer of layers) {
    // Check if new layer, and initialize it's state
    if (!layer.state) {
      log(1, `initializing ${layerName(layer)}`);
      try {
        layer.initializeLayer({gl});
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

function addLayersToScene(layers, scene) {
  if (!scene) {
    return;
  }
  // clear scene and repopulate based on new layers
  scene.removeAll();
  for (const layer of layers) {
    // Add model to scene
    if (layer.state.model) {
      scene.add(layer.state.model);
    }
  }
}
