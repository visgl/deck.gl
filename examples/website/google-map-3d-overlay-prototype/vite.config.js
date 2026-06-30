// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {fileURLToPath, URL} from 'node:url';

const fromRoot = path => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

export default {
  define: {
    'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey),
    'process.env.GoogleMapsMapId': JSON.stringify(process.env.GoogleMapsMapId)
  },
  resolve: {
    alias: [
      {find: /^@deck\.gl\/core$/, replacement: fromRoot('modules/core/src/index.ts')},
      {find: /^@deck\.gl\/google-maps$/, replacement: fromRoot('modules/google-maps/src/index.ts')},
      {find: /^@deck\.gl\/layers$/, replacement: fromRoot('modules/layers/src/index.ts')}
    ]
  }
};
