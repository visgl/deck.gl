// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Replaces `overlay.setProps` so that only layer updates reach the overlay. The base map owns the
 * camera, so view state and other deck props from the notebook are ignored.
 * Kept separate from the map setup so that it can be tested without loading a map library.
 */
export function forwardLayerUpdates(overlay) {
  const setOverlayProps = overlay.setProps.bind(overlay);
  overlay.setProps = function (props) {
    if (props.layers) {
      setOverlayProps({layers: props.layers});
    }
  };
  return overlay;
}
