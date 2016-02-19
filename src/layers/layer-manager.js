
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
    if (oldLayer) {
      assert(oldLayer.state);
      // 2. update state in old layer
      oldLayer.preUpdateState(newLayer.props);
      oldLayer.updateState(newLayer.props);
      // 3. copy over state to new layer
      newLayer.state = oldLayer.state;
      oldLayer.state = null;
    }
  }
}

export function initializeNewLayers(layers, {gl}) {
  for (const newLayer of layers) {
    if (!newLayer.state) {
      // New layer, it needs to initialize it's state
      newLayer.state = {gl};
      newLayer.initializeState();
      newLayer.initializeAttributes();
      // Create a model for the layer
      newLayer.createModel({gl});
      // 2. update state in old layer
      newLayer.preUpdateState(newLayer.props);
      newLayer.updateState(newLayer.props);
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
