# Getting Started

## Installation

    npm install --save deck.gl luma.gl
or
    yarn add deck.gl luma.gl

Remarks:
* `luma.gl` will not be automatically installed with deck.gl.
  The reason is that an application must only include one copy of luma.gl.
  Please explicitly install `luma.gl` with your app (`npm install )
  This is similar to React components which typically only have "peer dependencies"
  on React, and it is the application's responsibility to actually
  select and install a specific React version.

## Examples

The deck.gl repository contains an
[examples folder](https://github.com/uber/deck.gl/tree/master/examples)
with a selection of small, standalone examples that could be good starting
points for your application.

You should be able to copy these folders to other locations, and get them running
simply by installing using `yarn` or `npm install` and running using `npm start`.

## Note on Map Tokens

For most of the examples come with deck.gl, sample geospatial data is rendered
on top of a Mapbox basemap. Mapbox requires each user to provide a token before
they serve any basemap tiles from their servers to your browser. You can either set an environmental variable needs to be set via
```
export MAPBOX_ACCESS_TOKEN={Your Token Here}
```
and import it in your application code via
```
const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;
```
or your can write out the token in your app explicitly.

For more information about map token read the sections about ["Using with Mapbox"(link update needed)](),
and the [examples](https://github.com/uber/deck.gl/tree/master/examples/README.md)
