# Conversion Reference

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to is to replace certain objects in the structure with instances of objects.


## Classes

Conversion happens by default for classes. For example, when this configuration is passed to `JSONConverter`:

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


### Enumerations

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

## Functions

Functions are parsed from strings.

> TBA
