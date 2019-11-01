# JSONLayer (Experimental)

A composite layer that parses a json array and instantiates deck.gl layers by matching the names against a supplied layer catalog.


## Usage

```js
import {JSONLayer} from './json-layer';

const layers = [
  new JSONLayer({
  	layerCatalog: require('@deck.gl/layers'),
  	json: require('./us-map.json')
  })
];
```


## Props

##### `layerCatalog` (Object)

Allows the application to specify which layers the JSONDeck can use. Expects a map from layer names to layer classes. See [JSONConverter](/docs/api-reference/json/json-converter.md)'s `configuration` for details.


##### `json` (Array|String)

If supplied, used to create `Layer` subclass instances from JSON descriptors.

Optionally accept JSON strings by parsing them. Expects the result to be an array of layer "descriptor" objects.

`{type: ScatterplotLayer, ...props}` will be instantiated to `ScatterplotLayer(...pros)`.

Layer types need to be present in the supplied `layerCatalog` prop.
