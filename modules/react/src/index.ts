// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// The current React API, also published as `@deck.gl/react/legacy`. The CommonJS build
// (`build-cjs.mjs`) makes this re-export a `require` of the `/legacy` bundle, so both entries share
// one implementation and one React context.
export * from './legacy/index';
// Re-export the default by name: through the CommonJS interop, `default` of a required bundle
// would be its whole `module.exports` object.
export {DeckGL as default} from './legacy/index';
