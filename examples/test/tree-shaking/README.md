# Tree Shaking Example **EXPERIMENTAL**

## Build Optimization

This example is intended to measure the size of various builds to keep track of
and minimize dependencies and total code size.

## Tree Shaking

deck.gl support for tree shaking is still experimental, as the feature is
just stabilizing in bundlers like webpack 2 and rollup.

Tree-shaking support is provided in the following ways:
* deck.gl builds and publishes (in its npm module) a separate pre-built
  distribution (`dist-es6`). This distribution directory differs from the standard
  `dist` directory in that all ES6 features **except imports and
  exports** have been transpiled to ES5.
* The deck.gl `package.json` file contains an additional entry point, in
  addition to `main: dist/index.js`, names `modules: dist-es6/index.js`.
  Tree-shaking JavaScript bundlers, like rollup and webpack 2, look for this
  field in preference of the `main` field to select what code to use from
  a module.
* In addition, this example is provided with build scripts that are intended
  to trigger and measure the effects of tree-shaking bundling.
