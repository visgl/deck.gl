# JSONDeck (Experimental)

> NOTE: This component is only intended to support **official deck.gl API props** via JSON. In particular, it is not intended to evolve an implementation of alternate JSON schemas. Support for such schemas should be developed indenpendently, perhaps using the source code of this component as a base. See the [JSON Layers RFC](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md) for more on this.

Creates a `Deck` instance from a JSON description.

The JSON description:

* Expected to contain at minimum "layers" and "initialViewState" fields.
* The JSON for each layer should be formatted as in described in JSONLayer.


## Usage

```js
import {JSONDeck} from '@deck.gl/json';

import json from './us-map.json';

export const deckgl = new JSONDeck({
  canvas: 'deck-canvas',
  layerCatalog: require('@deck.gl/layers'),
  json
});
```


## Properties


### json : Object | String

A JSON string or a parsed JSON structure.


### layerCatalog : Object

Allows the application to specify which layer types the JSONDeck can use. Expects a map from layer names to layer classes. No layers are supported by default.


### viewCatalog : Object

Allows the application to specify which view types the JSONDeck can use. Expects a map from view names to view classes. The most common views are supported by default.


## JSON Properties

All properties in `prop.json` are passed directly to `Deck`, with the following exceptions


### `json.views` : Array

If supplied, used to create `View` instances from JSON descriptors.

Instantiates views: `{type: MapView, ...props}` to `MapView(...props)`


### `json.layers` : Array

Passes to an instance of `JSONLayer` as the top level layer.


### `json.map` : Boolean

* If set to `true` display a base map. See remarks below.


### `json.mapboxApiAccessToken` : String

Passed to mapbox-gl, takes precedence over `props.mapboxApiAccessToken`/


### `style` : String

An optional mapbox-gl compatible style URL.


## Remarks

* Displaying a base map requires `mapboxgl` top level prop to be provided, a valid `mapboxApiAccessToken` in top level props or props.json, and the view state to have longitude, latitude, zoom fields.
