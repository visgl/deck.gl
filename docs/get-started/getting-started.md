# Installing and Running Examples

## Installation

To install the deck.gl framework:

```bash
npm install deck.gl --save
```

or

```bash
yarn add deck.gl
```

The [deck.gl](https://www.npmjs.com/package/deck.gl) module includes all deck.gl features and their dependencies. If you want to selectively install a subset of the features, see the [Dependencies](#selectively-install-dependencies) section below.


## Running the Examples

The deck.gl repository contains an [examples folder](https://github.com/uber/deck.gl/tree/master/examples) with a selection of small, standalone examples that could be good starting points for your application.

You should be able to copy these folders to your preferred locations, and get them running simply as follows:

Clone the deck.gl repo, if you haven't already

```bash
git clone git@github.com:uber/deck.gl.git
```

For most consistent results, it is recommended that you check out the latest release branch (e.g. `7.0-release`) instead of `master` when running examples.

```bash
git checkout 7.0-release
```

Change directory to the example you are interested in, e.g.

```bash
cd deck.gl/examples/get-started/pure-js/basic
```

Then install dependencies using the installer of your choice:

```bash
npm install
# or
yarn
```

and then running using:

```bash
npm start
```

If the example uses a mapbox base map you need a [Mapbox access token](/docs/get-started/using-with-map.md)

```bash
export MapboxAccessToken={Your Token Here} && npm start
```

If you want to build the example against the latest deck.gl source code in the cloned repo (rather than the published version of deck.gl listed in the examples `package.json`)

```bash
npm run start-local
```

> The examples on the `master` branch are updated to use features from the latest, unreleased version of deck.gl. If some example doesn't work using `npm start` it can be worth trying `npm run start-local`.

> While all examples support `npm run start-local`, there are some caveats when running against local source. Most importantly, you must make sure to run `npm install` or `yarn` in the deck.gl root folder before running `npm run start-local` in an example folder.


## Selectively Install Dependencies

A family of NPM modules are published as part of the deck.gl framework. The following tree shows their scope and dependencies:

- `@deck.gl/core` - Core module that handles the WebGL rendering pipeline, data management, and user interaction
  + `@deck.gl/layers` - Primitive layers that are the building blocks of all visualizations
    * `@deck.gl/aggregation-layers` - Advanced layers that aggregate data into alternative representations, e.g. heatmap, contour, hex bins, etc.
    * `@deck.gl/geo-layers` - Additional layers that handle geospatial use cases and GIS formats.
    * `@deck.gl/mesh-layers` - Additional layers that render 3D meshes and [scene graphs](https://en.wikipedia.org/wiki/Scene_graph).
  + `@deck.gl/json` - Declarative interface that supports specifying deck.gl layers and views using a JSON format.
  + `@deck.gl/mapbox` - An integration with the [Mapbox custom layer](/docs/api-reference/mapbox/overview.md) API.
  + `@deck.gl/react` - React wrapper of deck.gl.
  + `@deck.gl/test-utils` - Testing utilities.

For example, to render a `PointCloudLayer`, you may install:

```bash
yarn add @deck.gl/core @deck.gl/layers
```

To use the `HexagonLayer` with React, you need to install:

```bash
yarn add @deck.gl/core @deck.gl/layers @deck.gl/aggregation-layers @deck.gl/react
```

While installing submodules separately affords applications the maximum control over the dependencies that it pulls in, the submodule versions are expected to be synchronized manually in order to produce consistent results.

The `deck.gl` master module includes all submodules except for `@deck.gl/test-utils`. Most bundling solutions (Webpack, Rollup etc.) offer tree-shaking capabilities that exclude unused exports from a production build.
