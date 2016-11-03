# Getting Started

## Installation

    npm install --save deck.gl luma.gl

For more info about `luma.gl`, see remarks section.

## Basic Usage

    import DeckGL from 'deck.gl/react';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />

## Examples

Check out the source code tabs in the examples page, or clone the
deck.gl repository and run `npm start`.

## Remarks

* `luma.gl` will not be automatically installed with deck.gl. The reason is that an application must only include one copy of luma.gl. If you are using npm v3, please explicitly install `luma.gl` with your app. This is similar
to React, where components will typically only have peer dependencies on React,
and it is the application's responsibility to actually select and install
a specific React version.
