# Installation

## The deck.gl Framework
```bash
npm install --save deck.gl luma.gl
```
or
```bash
yarn add deck.gl luma.gl
```

Remarks:
* `luma.gl` will not be automatically installed with deck.gl.
  The reason is that an application must only include one copy of luma.gl.
  Please explicitly install `luma.gl` with your app (`npm install )
  This is similar to React components which typically only have "peer dependencies"
  on React, and it is the application's responsibility to actually
  select and install a specific React version.

## Examples

The deck.gl repository contains an
[examples folder](https://github.com/uber/deck.gl/tree/4.0-release/examples)
with a selection of small, standalone examples that could be good starting
points for your application.

You should be able to copy these folders to your preferred locations, and get them running simply by installing dependencies using:

```bash
npm install  # or yarn
```

and then running using:

```bash
export MAPBOX_ACCESS_TOKEN={Your Token Here} && npm start
```

Remarks:

`MAPBOX_ACCESS_TOKEN` is the Mapbox token. For most examples shipped with deck.gl, geospatial data is rendered on top of Mapbox-powered basemap. Mapbox requires users to provide an access token before
they serve map tiles to user's browsers.

For more information about map token read the sections about [Using with Mapbox GL](/docs/get-started/using-with-mapbox-gl.md).
