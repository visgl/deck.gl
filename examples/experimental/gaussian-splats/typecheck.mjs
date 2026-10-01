// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import ts from 'typescript';
import {resolve} from 'node:path';

// The prototype runs unreleased luma source. Validate against the same checkout's built API,
// not the older npm declarations, which cannot describe CPU-only hierarchy selection.
const lumaRoot = process.env.LUMA_GL_ROOT;
if (!lumaRoot) throw new Error('LUMA_GL_ROOT must point to a built luma.gl checkout.');
const configPath = resolve(import.meta.dirname, 'tsconfig.json');
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error)
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, import.meta.dirname);
config.options.paths = {'@luma.gl/*': [resolve(lumaRoot, 'modules/*/dist/index.d.ts')]};
const program = ts.createProgram(config.fileNames, config.options);
const diagnostics = [...config.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  process.stderr.write(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: filename => filename,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => '\n'
    })
  );
  process.exitCode = 1;
}
