# Getting Started


## Installation

    npm install --save deck.gl luma.gl babel-polyfill
or
    yarn add deck.gl luma.gl babel-polyfill

Remarks:
* `luma.gl` will not be automatically installed with deck.gl.
  The reason is that an application must only include one copy of luma.gl.
  Please explicitly install `luma.gl` with your app (`npm install )
  This is similar to React components which typically only have "peer dependencies"
  on React, and it is the application's responsibility to actually
  select and install a specific React version.


## Basic Usage

	import 'babel-polyfill';
    import DeckGL from 'deck.gl/react';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />


## Examples

* The source code tabs in the Examples page in the interactive documentation
* The deck.gl repository contains an
  [examples folder](https://github.com/uber/deck.gl/tree/master/examples)
  with a selection of standalone examples.
  These foldiers can be copied and you should be able to get them running
  simply by installing (`yarn` or `npm install` and running `npm start`).

There's also the [react-map-gl](https://github.com/uber/react-map-gl) exhibits folder. Although not integrating deck.gl, it will give you additional examples
about how to use the base map component.


## Note on "Map Tokens"

This concerns Mapbox Tokens/Google Map Keys.

Your main requirement before running any example will be to provide a map
token to the examples so that they can load maps from mapbox/google etc.

To get a token, you typically need to register (create an account)
with the map data provider, and apply for a token. The token will usually
be free until a certain level of traffic is exceeded.

There are several ways to provide a token:
* Modify [app](./app.js) file to specify your Mapbox token,
* Set an environment variable (MapboxAccessToken)
* TBD - Provide the token in the URL

Remarks:
* If you fail to provide a token, the examples will still run,
  and render any deck.gl overlays, but the underlying maps will not render.
* The map token requirement obviously only applies only to examples that use
  base maps, e.g. any examples using
  [react-map-gl](https://github.com/uber/react-map-gl) to render map tiles.
