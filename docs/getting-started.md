# Getting Started

## Installation

    npm install --save luma.gl deck.gl

As a peerDependency, luma.gl will not be automatically installed with deck.gl after npm@3,
explicitly install it to ensure only one copy of luma.gl is being used.

## Basic Usage

    import DeckGL from 'deck.gl/react';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />

## Example

Check out the example page for more.
