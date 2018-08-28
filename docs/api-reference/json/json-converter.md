# JSONConverter (Experimental)

> NOTE: This component is only intended to support **official deck.gl API props** via JSON. In particular, it is not intended to evolve an implementation of alternate JSON schemas. Support for such schemas should be developed indenpendently, perhaps using the source code of this component as a base. See the [JSON Layers RFC](https://github.com/uber/deck.gl/blob/6.1-release/dev-docs/RFCs/v6.1/json-layers-rfc.md) for more on this.

Converts a JSON description of a deck.gl visualization into properties that can be passed to the `Deck` component.

Requirements on the JSON description:

* Expected to contain at minimum "layers" and "initialViewState" fields.
* The JSON for each layer should be formatted as in described in JSONLayer.


## Usage

```js
import {JSONConverter} from '@deck.gl/json';

import json from './us-map.json';

const configuration = {
  layers: require('@deck.gl/layers'),
  ...
};

const new jsonConverter = new JSONConverter({configuration});

const deck = new Deck({
  canvas: 'deck-canvas',
  json
});

deck.setProps(jsonConverter.convertJSONToDeckProps(json));
```


## Properties


### json : Object | String

A JSON string or a parsed JSON structure.


### configuration : Object

Object with the following fields.

* `layers` - Allows the application to specify which layer types the JSONConverter can use. Expects a map from layer names to layer classes. No layers are supported by default.
* `views` - Allows the application to specify which view types the JSONConverter can use. Expects a map from view names to view classes. Can be ommitted as the standard views in `@deck.gl/core` module are supported by default.
* `enumerations` - a map of enumerations that should be made available to the JSON string resolver.
* `classes` - a map of general classes that should be made available to the JSON class resolver.


## JSON Properties

All properties in `prop.json` are passed to `Deck`, after processing, which includes the following fields:


### `json.views` : Array

If supplied, used to create `View` instances from JSON descriptors.

Instantiates views: `{type: MapView, ...props}` to `MapView(...props)`


### `json.layers` : Array

Passes to an instance of `JSONLayer` as the top level layer.


### `json.map` : Boolean

* If set to `true` display a base map. See remarks below.


### `mapStyle` : String

An optional mapbox-gl compatible style URL.


## Remarks

* Displaying a base map requires `mapboxgl` top level prop to be provided, a valid `mapboxApiAccessToken` in top level props or `props.json`, and the view state to have longitude, latitude, zoom fields.
