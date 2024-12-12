// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import * as React from 'react';

const CANVAS_ONLY_STYLES = {
  mixBlendMode: null
};

export default function extractStyles({
  width,
  height,
  style
}: {
  width?: string | number;
  height?: string | number;
  style?: Partial<CSSStyleDeclaration> | null;
}): {
  containerStyle: React.CSSProperties;
  canvasStyle: React.CSSProperties;
} {
  // This styling is enforced for correct positioning with children
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 0,
    left: 0,
    top: 0,
    width,
    height
  };

  // Fill the container
  const canvasStyle: React.CSSProperties = {
    left: 0,
    top: 0
  };

  if (style) {
    for (const key in style) {
      if (key in CANVAS_ONLY_STYLES) {
        // apply style to the canvas, but not deck's children, e.g. mix-blend-mode
        canvasStyle[key] = style[key];
      } else {
        // apply style to the container, e.g. position/flow settings
        containerStyle[key] = style[key];
      }
    }
  }

  return {containerStyle, canvasStyle};
}
