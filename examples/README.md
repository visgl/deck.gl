# deck.gl Examples

All deck.gl examples are set up to be "stand-alone", which means that
you can copy the example folder to your own environment, run `yarn` or `npm install`
and `npm start` and within minutes have a running, minimal app that you can
start modifying and experimenting with.

## Layer Browser Example

* [Layer Browser (Main Example)](./layer-browser/README.md) - The Layer Browser
  enables testing of props for all core layers and many sample layers.
  This is the main example used for testing layers during development of deck.gl.

## Tutorial Examples

These are intended to be absolutely minimal (in terms of application code,
package.json, webpack config etc) examples of how to get deck.gl and a base
map working together.

* [Hello World (webpack2)](./react/hello-world-webpack2/README.md): Bundles a minimal app with
  [webpack 2](https://github.com/webpack/webpack) and serves it with webpack-dev-server.
  Transpiles with buble.
* [Hello World (browserify)](./react/hello-world-browserify/README.md) Bundles a minimal app with
  [browserify](https://github.com/substack/node-browserify) and serves it with
  [budo](https://github.com/mattdesl/budo).
  Transpiles with babel.

Remarks:
* Note that these apps just draw a single line on a map and that they
  don't even implement event handling (you can't pan and zoom the map).
  However, if you are having environment or build issues, or difficulties
  understanding how more complex deck.gl applications work,
  making sure that you can get one of these to run would be a good first step.

## Demo Examples

These are stand-alone versions of the "showcase" examples in the deck.gl
website, with smaller uncompressed data sets to make it easy to understand
how they work.

* [3d-heatmap](./website/3d-heatmap/README.md)
* [arc](./website/arc/README.md)
* [geojson](./website/geojson/README.md)
* [icon](./website/icon/README.md)
* [line](./website/line/README.md)
* [plot](./website/plot/README.md)
* [scatterplot](./website/scatterplot/README.md)
* [screen-grid](./website/screen-grid/README.md)
* [trips](./website/trips/README.md)

Remarks:
* Since these examples are set up so they can be run both stand-alone and
  also loaded by the website (demo), their code is organize slightly
  differently than a completely stand-alone applications typically are.
  If you want to base your application on one of these examples you may want
  to make some small code simplifications by comparing to non-demo examples.

## Experimental Examples

* [SVG Interoperability](./svg-interoperability/README.md): Shows how
  deck.gl can interoperate with SVG.

* [JSX Layers](./jsx-layers/README.md): Shows a way to use JSX syntax
  to render deck.g layers as if they were React components.

* [Tree Shaking](./tree-shaking/README.md): Bundles a minimal app with
  [webpack 2](https://github.com/webpack/webpack) and provides various
  analysis scripts to measure the size of the resulting bundle.

## Sample Layers

A number of sample layers are available in `examples/sample-layers`. These can
be copied into your app and extended/modified as needed. Note that many of
the sample layers are imported by the Layer Browser example and can be tested
by running that example.


### Installing and Running

As usual, you can install the dependencies either using `yarn` or with `npm install`.
(`yarn` installs faster, but is not required). `npm start` will run build and
run the example (and hot reload any source code changes).

Note that many of the comments in the "Getting Started" section of deck.gl
documentation also applies when building and running the examples.


### Note on "Map Tokens"

The main requirement before running any examples using maps will be to provide
a map token to the examples so that they can load maps from mapbox etc.

All the examples are set up to read the token from the environment variable
`MapboxAccessToken`, so you don't have to edit the code to test them.

Also see

Remarks:
* If you fail to provide a token, the examples will still run,
  and render any deck.gl overlays, but the underlying maps will not render.
* The map token requirement obviously only applies only to examples that use
  base maps, e.g. any examples using
  [react-map-gl](https://github.com/uber/react-map-gl) to render map tiles.


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


### Support for Working Directly Against deck.gl Source Code

Note that several examples are set up so that they can be run either
against the local source code (enabling debugging of deck.gl itself,
with hot reloading) or against an installed version of deck.gl
(enables testing that things work with the published version).

Examples that support this mode have a 'start-local' script in their
`package.json`

Look at the `webpack.config.local.js` in this directory for details.
