// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Re-exported loaders.gl API in the pre-built bundle
 * Cherry-pick loaders core exports that are relevant to deck
 */
export {registerLoaders, load, parse, fetchFile} from '@loaders.gl/core';
