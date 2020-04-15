# RFC: Standalone version

## Motivation

A [large share](https://stateofjs.com/2017/front-end/results) of the visualization community do not use React. Every now and then we get inquiries on Github for using deck.gl with other frameworks, e.g. [#694](https://github.com/visgl/deck.gl/issues/694) [#576](https://github.com/visgl/deck.gl/issues/576), and there is a third-party [Polymer port](https://github.com/PolymerVis/deck-gl).

Moreover, not all potential users of deck.gl have knowledge about package management, bundling, or the Reactive programming paradigm. In several deck.gl workshops that we have hosted, we must give participants instructions for installing node.js, installing npm packages, troubleshoot over version incompatibilities, and copying an "hello world" example with more than 50 lines of code with a fairly intimidating webpack configuration.

We know that almost all creative coders are comfortable with the [d3.js](d3js.org) model: include a minified version in HTML and copy a few lines of code from examples, no compiling required.

This RFC proposes a "standalone" flavor of deck.gl. This version pre-bundles all dependencies, and hides away the complexity of state management for using the viewport controllers. It will make life much easier in the following scenarios:
- Introducing casual developers to prototyping with deck.gl
- Sharing code snippets and proof-of-concepts, e.g. [#1171](https://github.com/visgl/deck.gl/pull/1171)
- Reporting issues, e.g. [#1071](https://github.com/visgl/deck.gl/issues/1071)


## Proposed API

The standalone version of deck.gl exposes two global objects: `DeckGL` and `LumaGL`. `DeckGL` contains all exports from `deck.gl/core` and `deck.gl/layers`. `LumaGL` contains all exports of `luma.gl`.

`DeckGL` is also a wrapper class that manages shared states between a map, a deck.gl canvas and a viewport controller.

### Constructor

Create a new deck.gl visualization.

```
const deckgl = new DeckGL(props);
```

### Properties

All properties of `Deck`, except `canvas`, `width` and `height` (controlled by the `container` prop).

All properties of the viewport controller (see the `controller` prop).

##### `container` (DOM Element)

Container to append the deck.gl canvas to. The deck.gl canvas is automatically resized to fill the container.

Default `document.body`.

##### `map` (Object)

The base map instance.

By default, if the global variable `mapboxgl` is found, attempt to create a mapbox-gl map. Using Mapbox requires the mapbox-gl library be included:

```
<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.js'></script>
<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.1/mapbox-gl.css' rel='stylesheet' />
```

And an access token be set:

```
mapboxgl.accessToken = '<mapbox_access_token>';
```

To use a custom map, supply a `map` object that contains two methods: `setProps(props)` and `finalize()`.

Set `map` to `null` to disable base map.

##### `mapStyle` (String | Object)

Mapbox map style.


##### `controller` (Object)

The viewport controller instance.

By default, attempt to create a controller that works with the deck.gl viewport (`MapControllerJS` for `WebMercatorViewport`, or `OrbitControllerJS` for `OrbitViewport`).

To use a custom controller, supply a `controller` object that contains two methods: `setProps(props)` and `finalize()`. The controller may invoke `props.onViewStateChange` to update the viewport.

Set `controller` to `null` to disable interaction.


### Methods

##### `pickObject`

Same as `Deck.pickObject`.

##### `pickObjects`

Same as `Deck.pickObjects`.

##### `setProps`

Update props.

##### `getMapboxMap`

Returns the mapbox Map instance.

##### `finalize`

Release all resources.


## Example code

Include the following snippet in HTML:
```
<script src="https://some.cdn.domain/deck.gl-5.1.0.min.js"></script>
```

Hello world example:
```
const data = [
  { pickup: [-122.42, 37.8], dropoff: [-122.48, 37.76] },
  { pickup: [-122.43, 37.8], dropoff: [-122.42, 37.75] }
];

const deckgl = new DeckGL({
  container: document.getElementById("container"),
  longitude: -122.45,
  latitude: 37.8,
  zoom: 11,
  pitch: 30,
  layers: [
    new DeckGL.ArcLayer({
      data,
      getSourcePosition: d => d.pickup,
      getTargetPosition: d => d.dropoff,
      getSourceColor: d => [255, 128, 0],
      getTargetColor: d => [0, 128, 255],
      strokeWidth: 5
    })
  ]
});
```

[Demo in Codepen](https://codepen.io/Pessimistress/pen/jGXVBK)


## Work items and pending questions

deck.gl v5 already isolated the core from React. We also have a [working prototype](https://github.com/Pessimistress/deck.gl-runkit/blob/master/src/deckgl.js) of the proposed interface.

- Do we only publish a minified version to CDN? Or publish as a NPM module as well?
- Do we automatically publish a new standalone version every time the core package is updated? How much the test/publish process be automated?
- The `DeckGL` class and bundling configuration need to be ported into the deck.gl monorepo.
- The `deck.gl-layers` module can be exported as a separate bundle as a companion of the core library. To do this, we need to change all imports from `deck.gl` to `deck.gl/dist/core` to avoid requiring React.
- deck.gl and luma.gl already exposes global objects for debugging (`deck` and `luma`). Should we consolidate?

