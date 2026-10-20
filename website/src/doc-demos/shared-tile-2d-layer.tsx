// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import App from 'website-examples/shared-tile-2d-layer/app';

/** Bounded shared-cache comparison using the same app as the standalone example. */
export function Tile2DLayerDemo() {
  return (
    <div style={{height: 420, position: 'relative', marginBottom: 24, borderRadius: 8, overflow: 'hidden'}}>
      <BrowserOnly fallback={<p>Loading the interactive shared-tileset demo...</p>}>
        {() => <App />}
      </BrowserOnly>
    </div>
  );
}
