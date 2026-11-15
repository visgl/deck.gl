// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import fs from 'fs';
import path from 'path';

const SCHEMA_FILE = 'schema.generated.json';

export default {
  define: {
    'process.env.GoogleMapsAPIKey': JSON.stringify(process.env.GoogleMapsAPIKey)
  },
  plugins: [
    {
      name: 'copy-generated-schema',
      closeBundle() {
        const sourcePath = path.resolve(__dirname, SCHEMA_FILE);
        const outPath = path.resolve(__dirname, 'dist', SCHEMA_FILE);

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, outPath);
        }
      }
    }
  ]
};
