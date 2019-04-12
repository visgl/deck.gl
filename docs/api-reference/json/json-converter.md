# JSONConverter (Experimental)

> NOTE: This component is only intended to support **official deck.gl API props** via JSON. In particular, it is not intended to evolve an implementation of alternate JSON schemas. Support for such schemas should be developed indenpendently, perhaps using the source code of this component as a base. See the [JSON Layers RFC](https://github.com/uber/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md) for more on this.

Converts a JSON description of a deck.gl visualization into properties that can be passed to the `Deck` component.

Requirements on the JSON description:

* Expected to contain at minimum "layers" and "initialViewState" fields.
* The JSON for each layer should be formatted as in described in JSONLayer.


## Usage

```js
import {_JSONConverter as JSONConverter} from '@deck.gl/json';

import json from './us-map.json';

const configuration = {
  layers: require('@deck.gl/layers')
};

const new jsonConverter = new JSONConverter({configuration});

const deck = new Deck({
  canvas: 'deck-canvas',
  json
});

deck.setProps(jsonConverter.convertJSONToDeckProps(json));
```


## Properties


##### `json` (Object|String)

A JSON string or a parsed JSON structure. 
All properties in this object are passed to `Deck`, after processing, which includes the following fields:

- `views` (Array) - If supplied, used to create `View` instances from JSON descriptors. `{type: MapView, ...props}` will be instantiated to `MapView(...props)`
- `layers` (Array) - Passes to an instance of [JSONLayer](/docs/api-reference/json/json-layer.md) as the top level layer.
- `map` (Boolean) - If set to `true` display a base map. See remarks below.
- `mapStyle` (String) - An optional mapbox-gl compatible style URL.

##### `configuration` (Object)

Object with the following fields. See more details in the `Configuration` section below.

* `layers` - Allows the application to specify which layer types the JSONConverter can use. Expects a map from layer names to layer classes. No layers are supported by default.
* `views` - Allows the application to specify which view types the JSONConverter can use. Expects a map from view names to view classes. Can be ommitted as the standard views in `@deck.gl/core` module are supported by default.
* `enumerations` - a map of enumerations that should be made available to the JSON string resolver.
* `classes` - a map of general classes that should be made available to the JSON class resolver.


## Configuration

### Class Catalogs

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to is to replace certain objects in the structure with instances of objects. This happens by default for layers and views. For example, when this configuration is passed to `JSONConverter`:

```js
const configuration = {
  layers: Object.assign({}, require('@deck.gl/layers'), require('@deck.gl/aggregation-layers'))
};
```

and used to resolve this JSON object:

```json
{
  "layers": [
    {
      "type": "ScatterplotLayer",
      "data": ...,
      "getColor": [0, 128, 255],
      "getRadius": 1
    }
  ]
}
```

will replace the layers discriptor with

```js
{
  layers: [
    new ScatterplotLayer({
      data: ...,
      getColor: [0, 128, 255],
      getRadius: 1
    })
  ]
}
```

Whenever the `JSONConverter` component finds a "type" field, it looks into a "class catalog". This can be a layer, a view, or other objects.


### Enumeration Catalogs

A map of enumerations that should be made available to the JSON string resolver. For example, when this configuration is passed to `JSONConverter`:

```js
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import GL from '@luma.gl/constants';

const configuration = {
  ...
  enumerations: {
    COORDINATE_SYSTEM,
    GL
  }
};
```

and used to resolve this JSON object:

```json
{
  "layers": [
    {
      "type": "ScatterplotLayer",
      "data": ...,
      "coordinateSystem": "COORDINATE_SYSTEM.METER_OFFSETS",
      "parameters": {
        "blend": true,
        "blendFunc": ["GL.ONE", "GL.ZERO", "GL.SRC_ALPHA", "GL.DST_ALPHA"]
      }
    }
  ]
}
```

`<enum-name>.<enum-value>` will be resolved to values in the `enumerations` config:

```js
{
  layers: [
    new ScatterplotLayer({
      data: ...,
      coordinateSystem: 2,
      parameters: {
        blend: true,
        blendFunc: [1, 0, 770, 772]
      }
    })
  ]
}
```

## Remarks

* Displaying a base map requires `mapboxgl` top level prop to be provided, a valid `mapboxApiAccessToken` in top level props or `props.json`, and the view state to have longitude, latitude, zoom fields.
