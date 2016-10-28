# Getting Started


## Learning deck.gl

How you approach learning deck.gl will probably depend on your previous
knowledge and how you want to use it.


### Understanding WebGL


### Understanding Reactive / Dataflow Architecture

The key to writing good, performant deck.gl layers lies in understanding
how to minimize updates of any calculated data, such as WebGL.



## Installation

```
npm install --save deck.gl

## Usage

```
import {
  DeckGLOverlay,
  /* import layers here */
} from 'deck.gl';

const mapState = {
  latitude: 37.55,
  longitude: -122.2,
  zoom: 9,
  ...
}

<DeckGLOverlay
  width={1920}
  height={1080}
  mapState={mapState},  // optional
  layers={[/* put layer instances here */]}
/>
```
