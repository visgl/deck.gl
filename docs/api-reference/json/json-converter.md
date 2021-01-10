# JSONConverter

> NOTE: This component is only intended to support **official deck.gl API props** via JSON. In particular, it is not intended to evolve an implementation of alternate JSON schemas. Support for such schemas should be developed independently, perhaps using the source code of this component as a base. See the [JSON Layers RFC](https://github.com/visgl/deck.gl/blob/master/dev-docs/RFCs/v6.1/json-layers-rfc.md) for more on this.

Converts a JSON description of a deck.gl visualization into properties that can be passed to the `Deck` component.

Requirements on the JSON description:

* Expected to contain at minimum "layers" and "initialViewState" fields.
* The JSON for each layer should be formatted as in described in JSONLayer.


## Usage

```js
import {JSONConverter} from '@deck.gl/json';

import json from './us-map.json';

const configuration = {
  layers: require('@deck.gl/layers')
};

const new jsonConverter = new JSONConverter({configuration});

const deck = new Deck({
  canvas: 'deck-canvas',
  json
});

deck.setProps(jsonConverter.convert(json));
```


## Properties


##### `json` (Object|String)

A JSON string or a parsed JSON structure.
All properties in this object, after processing, are passed to a [Deck](/docs/api-reference/core/deck.md) instance as props.

## Configuration

### Class Catalogs

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to is to replace certain objects in the structure with instances of objects. This happens by default for layers and views. For example, when this configuration is passed to `JSONConverter`:

```js
const configuration = {
  classes: Object.assign({}, require('@deck.gl/layers'), require('@deck.gl/aggregation-layers'))
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

will replace the layers descriptor with

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

### Functions Catalogs

A map of functions that should be made available to the JSON function resolver. For example, when this configuration is passed to `JSONConverter`:

```js
function calculateRadius({base, exponent}) {
  return Math.pow(base, exponent);
}

const configuration = {
  ...,
  functions: {calculateRadius}
};
```

and used to resolve this JSON object:

```json
{
  "layers": [
    {
      "@@type": "ScatterplotLayer",
      "data": ...,
      "getColor": [0, 128, 255],
      "getRadius": {
        "@@function": "calculateRadius",
        "base": 2,
        "exponent": 3
      }
    }
  ]
}
```

it will replace the layers descriptor with

```js
{
  layers: [
    new ScatterplotLayer({
      data: ...,
      getColor: [0, 128, 255],
      getRadius: 8
    })
  ]
}
```

Whenever the `JSONConverter` component finds a "function" field, it looks into a "function catalog".

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

### Constants Catalogs

A map of constants that should be made available to the JSON string resolver. This is also helpful to evaluate a prop that does not need to be instantiated. For example, when this configuration is passed to `JSONConverter`:

```js
import {MapController} from '@deck.gl/core';

const configuration = {
  ...
  constants: {
    MapController
  }
};
```

and used to resolve in this JSON object:

```json
{
  "controller": "MapController",
  "layers": [
    {
      "type": "ScatterplotLayer",
      "data": ...,
      ...
    }
  ]
}
```

will replace the constants' value with the value provided in configuration declaration:

```js
{
  controller: MapController, // MapController class from '@deck.gl/core' 
  layers: [
    new ScatterplotLayer({
      data: ...,
      ...
    })
  ]
}
``
