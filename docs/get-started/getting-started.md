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

The deck.gl repository contains an [examples folder](https://github.com/visgl/deck.gl/tree/master/examples) with a selection of small examples that could be good starting points for your application.

Package-managed examples in this repository are installed as Yarn workspaces from the repository root. If you copy an example into a separate project, replace any `workspace:*` deck.gl dependencies with published version ranges before installing it outside this monorepo.

Clone the deck.gl repo, if you haven't already

```bash
git clone git@github.com:visgl/deck.gl.git
```

For most consistent results, it is recommended that you check out the latest release branch (e.g. `8.0-release`) instead of `master` when running examples.

```bash
git checkout 8.0-release
```

Install dependencies once from the deck.gl repository root:

```bash
cd deck.gl
yarn install
```

Change directory to the example you are interested in and start it:

```bash
cd examples/get-started/pure-js/basic
yarn start
```

If the example uses a mapbox base map you need a [Mapbox access token](./using-with-map.md)

```bash
export MapboxAccessToken={Your Token Here} && yarn start
```

If you want to build the example against the latest deck.gl source code in the cloned repo (rather than the published version of deck.gl listed in the examples `package.json`)

```bash
yarn start-local
```

> The examples on the `master` branch are updated to use features from the latest, unreleased version of deck.gl. If some example doesn't work using `yarn start` it can be worth trying `yarn start-local`.


## Selectively Install Dependencies

A family of NPM modules are published as part of the deck.gl framework. The following tree shows their scope and dependencies:

- `@deck.gl/core` - Core module that handles the GPU rendering pipeline, data management, and user interaction
  + `@deck.gl/layers` - Primitive layers that are the building blocks of all visualizations
    * `@deck.gl/aggregation-layers` - Advanced layers that aggregate data into alternative representations, e.g. heatmap, contour, hex bins, etc.
    * `@deck.gl/geo-layers` - Additional layers that handle geospatial use cases and GIS formats.
    * `@deck.gl/mesh-layers` - Additional layers that render 3D meshes and [scene graphs](https://en.wikipedia.org/wiki/Scene_graph).
  + `@deck.gl/json` - Declarative interface that supports specifying deck.gl layers and views using a JSON format.
  + `@deck.gl/mapbox` - An integration with the [Mapbox custom layer](../api-reference/mapbox/overview.md) API.
  + `@deck.gl/react` - React wrapper of deck.gl.
  + `@deck.gl/widgets` - Useful UI components.
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
