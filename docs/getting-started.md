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


## Basic Usage

    import DeckGL from 'deck.gl';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />


## Examples

The deck.gl repository contains an
[examples folder](https://github.com/uber/deck.gl/tree/master/examples)
with a selection of small, standalone examples that could be good starting
points for your application.

These foldiers can be copied and you should be able to get them running
simply by installing (`yarn` or `npm install` and running `npm start`).

For more on using maps with deck.gl,it might also be worth checking out the
[react-map-gl](https://github.com/uber/react-map-gl)
examples. Although not focused on deck.gl, these will provide you with
additional examples of how to use the base map component.


## Note on Map Tokens

The main requirement before running any application using maps will be to provide
a map token to the examples so that they can load maps from mapbox etc.

For more information about map token read the sections about "Using with Mapbox",
and the [examples](https://github.com/uber/deck.gl/tree/master/examples/README.md)
