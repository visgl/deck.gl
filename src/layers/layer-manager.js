
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

import assert from 'assert';

export function matchLayers(oldLayers, newLayers) {
  for (const newLayer of newLayers) {
    // 1. given a new coming layer, find its matching layer
    const oldLayer = _findMatchingLayer(oldLayers, newLayer);

    // Only transfer state at this stage. We must not generate exceptions
    // until all layers' state have been transferred
    if (oldLayer) {
      const {state, props} = oldLayer;
      assert(state, 'Matching layer has lost state');
      assert(oldLayer !== newLayer, 'Matching layer is same');
      // Copy state
      newLayer.state = state;
      // Keep a temporary ref to the old props, for prop comparison
      newLayer.oldProps = props;
      oldLayer.state = null;
      console.log(`matched layer ${newLayer.props.id} o->n`,
        oldLayer, newLayer);
    }
  }

  // Unmatched layers still have state, it will be discarded
  for (const layer of oldLayers) {
    const {state} = layer;
    if (state) {
      layer.finalizeLayer();
      layer.state = null;
      console.log(`finalized layer ${layer.props.id}`);
    }
  }
}

// Update the old layers that were matched
export function updateOldLayers(newLayers) {
  for (const layer of newLayers) {
    const {oldProps, props} = layer;
    if (oldProps) {
      layer.updateLayer(oldProps, props);
    }
  }
}

// Layers can't be initialized until gl context is available
export function initializeNewLayers(layers, {gl}) {
  for (const layer of layers) {
    if (!layer.state) {
      // New layer, initialize it's state
      layer.initializeLayer({gl});
    }
  }
}

function _findMatchingLayer(oldLayers, newLayer) {
  const candidates = oldLayers.filter(l => l.props.id === newLayer.props.id);
  if (candidates.length > 1) {
    throw new Error(`Layer has more than one matching layers ${newLayer.id}`);
  }
  return candidates.length > 0 && candidates[0];
}
