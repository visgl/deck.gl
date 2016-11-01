# Getting Started

## Learning deck.gl

How you approach learning deck.gl will probably depend on your previous
knowledge and how you want to use it.

### Understanding WebGL


### Understanding Reactive / Dataflow Architecture

The key to writing good, performant deck.gl layers lies in understanding
how to minimize updates of any calculated data, such as WebGL.

## Installation

    npm install --save luma.gl deck.gl

Making luma.gl a peerDependency rather than a deck.gl dependency allows you
to be more flexible about it.

## Example

    import DeckGL from 'deck.gl/react';
    import {ArcLayer} from 'deck.gl';

    const flights = new ArcLayer({
      id: 'flights',
      data: [] // Some flight points
    });

    <DeckGL width={1920} height={1080} layers={[flights]} />
