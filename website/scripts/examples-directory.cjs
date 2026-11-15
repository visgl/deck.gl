// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

const examplesDirectory = process.env.WEBSITE_EXAMPLES_DIR || 'examples-arrow';
if (examplesDirectory !== 'examples' && examplesDirectory !== 'examples-arrow') {
  throw new Error('WEBSITE_EXAMPLES_DIR must be examples or examples-arrow');
}

module.exports = examplesDirectory;
