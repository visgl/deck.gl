# deck.gl Examples

## Overview

* [Layer Browser (Main Example)](./layer-browser/README.md) - The Layer Browser
  enables testing of props for all core layers and many sample layers.
  This is the main example used for testing layers during development of deck.gl.


## Sample Layers

A number of sample layers are available in `examples/sample-layers`. These can
be copied into your app and extended/modified as needed.


## Tutorial Examples

* [Hello World (webpack2)](./hello-world-webpack2/README.md): Bundles a minimal app with
  [webpack 2](https://github.com/webpack/webpack) and serves it with webpack-dev-server.
  Transpiles with buble.
* [Hello World (browserify)](./hello-world-browserify/README.md) Bundles a minimal app with
  [browserify](https://github.com/substack/node-browserify) and serves it with
  [budo](https://github.com/mattdesl/budo).
  Transpiles with babel.
* [Tree Shaking](./tree-shaking/README.md): Bundles a minimal app with
  [webpack 2](https://github.com/webpack/webpack) and provides various
  analysis scripts to measure the size of the resulting bundle.


### Installing and Running

As usual, you can install the dependencies either using `yarn` or with `npm install`.
(`yarn` installs faster, but is not required). `npm start` will run build and
run the example (and hot reload any source code changes).

Note that many of the comments in the "Getting Started" section of deck.gl
documentation also applies when building and running the examples.


### About the Hello World Examples

<div align="center">
  <a href="./webpack">
    <img height=85 src="https://cdn.pbrd.co/images/55RnpX6a3.png" style="margin-right:5;" />
  </a>
  <a href="./browserify">
    <img src="https://cdn.pbrd.co/images/vAmSmehU.png" />
  </a>
</div>

These examples all contain the same simple, minimial deck.gl application,
bundled by different javascript bundling tools.

These examples are intended to give you a minimal working example to build off.
The goal is to demonstrate the smallest working `package.json`
and configuration file settings for each bundler, removing all non-essential
dependencies and configuration, showing you exactly what is needed to get
started with deck.gl.

Although the interface might be slightly different, the result should be
exactly the same, i.e. an interactive dark map you can move and tilt with a
deck.gl `LineLayer` showing one line.

<img src="https://cdn.pbrd.co/images/53pkY8pz1.png" width="300" />


# Support for Working Directly Against deck.gl Source Code

Note that several examples are set up so that they can be run either
against the local source code (enabling debugging of deck.gl with hot reloading)
or against an installed version of deck.gl (enabling testing that things work
with the published version).

Examples that support this mode have a 'start-local' script in their
`package.json`

Look at the `webpack.config.local.js` in this directory for details.
