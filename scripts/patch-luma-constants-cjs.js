// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const packageDir = path.join(__dirname, '..', 'node_modules', '@luma.gl', 'constants', 'dist');
const cjsPath = path.join(packageDir, 'index.cjs');
const esmPath = path.join(packageDir, 'webgl-constants.js');

function buildPatchedCommonJsModule() {
  const esmSource = fs.readFileSync(esmPath, 'utf8');
  const transformedSource = esmSource.replace(
    /export\s+\{\s*GLEnum\s+as\s+GL\s*\};?/,
    'module.exports = {GL: GLEnum};'
  );

  const module = {exports: {}};
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
    __dirname: packageDir,
    __filename: esmPath
  });

  new vm.Script(transformedSource, {filename: esmPath}).runInContext(context);

  if (!module.exports || !module.exports.GL || module.exports.GL.DYNAMIC_COPY !== 0x88ea) {
    throw new Error('Patched @luma.gl/constants CommonJS export did not expose GL as expected.');
  }

  return `'use strict';\nmodule.exports = ${JSON.stringify(module.exports, null, 2)};\n`;
}

if (!fs.existsSync(cjsPath) || !fs.existsSync(esmPath)) {
  process.exit(0);
}

const currentSource = fs.readFileSync(cjsPath, 'utf8');
if (currentSource.includes('DYNAMIC_COPY') && currentSource.includes('module.exports')) {
  process.exit(0);
}

fs.writeFileSync(cjsPath, buildPatchedCommonJsModule());
