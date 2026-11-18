// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// The current React API, also published as `@deck.gl/react/legacy`. Re-export it by package name,
// not by relative path, so that each published bundle (including the CommonJS `dist/index.cjs`)
// loads the one `/legacy` implementation instead of inlining a second copy of it. Two copies
// would create two React contexts, and a component using `useWidget` from one entry could not
// see a `DeckGL` from the other.
export * from '@deck.gl/react/legacy';
// Re-export the default by name: through the CommonJS interop, `default` of a package import
// would be the whole `module.exports` object.
export {DeckGL as default} from '@deck.gl/react/legacy';
