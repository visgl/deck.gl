// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync} from 'node:fs';

const modulesRoot = new URL('../modules/', import.meta.url);
const allowedPrivateModules = ['proposals'];
const privateModules = readdirSync(modulesRoot, {withFileTypes: true})
  .filter(entry => entry.isDirectory())
  .filter(entry => {
    const manifestPath = new URL(`${entry.name}/package.json`, modulesRoot);
    // Ignored build output can leave removed workspace directories behind after a branch switch.
    if (!existsSync(manifestPath)) return false;
    const manifest = JSON.parse(readFileSync(manifestPath));
    return manifest.private === true;
  })
  .map(entry => entry.name)
  .sort();
assert.deepEqual(privateModules, allowedPrivateModules, 'Keep private prototypes in modules/proposals');
