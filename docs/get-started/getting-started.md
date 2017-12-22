# Installing, Building and Running Examples

## Installation

First, you need to install the deck.gl and luma.gl frameworks
```bash
npm install --save deck.gl luma.gl
```
or
```bash
yarn add deck.gl luma.gl
```

## Running the Examples

The deck.gl repository contains an [examples folder](https://github.com/uber/deck.gl/tree/5.0-release/examples) with a selection of small, standalone examples that could be good starting points for your application.

You should be able to copy these folders to your preferred locations, and get them running simply by installing dependencies using:

```bash
npm install  # or yarn
```

and then running using:

```bash
export MapboxAccessToken={Your Token Here} && npm start
```

## Remarks:

* `luma.gl` will not be automatically installed with deck.gl. The reason is that an application must only include one copy of luma.gl. Please explicitly install `luma.gl` with your app (`npm install luma.gl`). This is similar to React components which typically only have "peer dependencies" on React, and it is the application's responsibility to actually select and install a specific React version.
* `MapboxAccessToken` is the Mapbox token. For most examples shipped with deck.gl, geospatial data is rendered on top of a Mapbox-powered basemap. Mapbox requires users to provide an access token before they serve map tiles to the user's browser. For more information about map token read the sections about [Using with Mapbox GL](/docs/get-started/using-with-mapbox-gl.md).
* Running the examples against the local deck.gl code. The examples contain an `npm run start-local` script that allow you to build and run the examples against the local code in the repo (e.g. master, instead of an installed version). There are some caveats with this mode, for instance you must make sure to install in the deck.gl root folder before running `npm run start-local` in an example.
