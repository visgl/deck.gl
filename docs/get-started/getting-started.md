# Installing, Building and Running Examples

## Installation

First, you need to install the deck.gl and luma.gl frameworks
```bash
npm install --save deck.gl
```
or
```bash
yarn add deck.gl luma.gl
```

> Be careful with dependencies. An application must only include one copy each of deck.gl and luma.gl. As of v5.0, deck.gl has a dependency on luma.gl but depending on which installation tool you use you may explicitly install `luma.gl` with your app (`npm install luma.gl`).


## Running the Examples

> The examples on the `master` branch are occasionally updated to use features from the latest, unreleased version of deck.gl. For most consistent results, it is recommended that you check out the latest release branch (`5.1-release`) of deck.gl when building the examples, alternatively run examples using `npm run start-local` (see below).

The deck.gl repository contains an [examples folder](https://github.com/uber/deck.gl/tree/5.1-release/examples) with a selection of small, standalone examples that could be good starting points for your application.

You should be able to copy these folders to your preferred locations, and get them running simply by installing dependencies using:
```bash
npm install  # or yarn
```

and then running using:
```bash
npm start
```

If the example uses a mapbox base map you need a [Mapbox access token](/docs/get-started/using-with-mapbox-gl.md)
```bash
export MapboxAccessToken={Your Token Here} && npm start
```

If you want to build the example against the latest deck.gl source code in the cloned repo (rather than the published version of deck.gl listed in the examples `package.json`)
```bash
npm run start-local
```

> While all examples support `npm run start-local`, there are some caveats when running against local source. Most importantly, you must make sure to run `npm install` or `yarn` in the deck.gl root folder before running `npm run start-local` in an example folder.


## Remarks:

* The complications around dependencies between deck.gl and luma.gl are related to the issues which cause React components to typically only specify "peer dependencies" on React, and it is the application's responsibility to actually select and install a specific React version.
