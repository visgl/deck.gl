# deck.gl

> A WebGL overlay suite for React providing a set of highly performant data visualization overlays.

![screenshot](screenshot.png)

    npm install --save deck.gl

#### Design goals

- Provide overlays that plug directly into react-map-gl's overlay model,
  enabling overlays to work on maps.
- Provide highly performant data visualization overlays in 2 and 3 dimensions.
- Provide tested, highly performant layers for basic data visualization
  use cases, scatterplots, choropleths etc.
- Allows easy creation of custom WebGL layers by subclassing `Layer`.
- Support efficient WebGL rendering in "data flow architecture" applications
  (i.e. React).
- Special focus on buffer management, allowing both automatic buffer updates
  but also full application control of buffer allocation and management

#### Features

- Web Mercator projections are handled in shader on GPU. No projections are
  done in JavaScript (unless needed for a uniform calculation or reverse
  projection of e.g. picked coordinate etc). Specify your lat,lon once and
  never touch it again.
- Can accept data stored in any ES6 container (supporting `Symbol.iterator`).
- Automatic and manual WebGL buffer management to support.

## Usage

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

Take a look at the docs website or browse the [docs folder](./docs).

## Example

    npm run start

Note: **Building** deck.gl (not importing) has a dependency on node
version 0.12 or higher. If you use an older version, you can install
a node version manager like nvm and use a separate shell to install
and build deck.gl.

    npm install -g nvm && nvm install 0.12 && nvm use 0.12

#### Data source

[SF OpenData](https://data.sfgov.org)
