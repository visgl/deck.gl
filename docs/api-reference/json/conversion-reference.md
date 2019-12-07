# Conversion Reference

The JSON framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. One thing this conversion process needs to do is to replace certain objects in the structure with instances of objects.


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
      "@@type": "ScatterplotLayer",
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

Whenever the `JSONConverter` component finds the `@@type` field, it looks into a "class catalog." This can be a layer, a view, or other objects, provided it has been registered.


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
      "coordinateSystem": "@@#COORDINATE_SYSTEM.METER_OFFSETS",
      "parameters": {
        "blend": true,
        "blendFunc": ["@@#GL.ONE", "@@#GL.ZERO", "@@#GL.SRC_ALPHA", "@@#GL.DST_ALPHA"]
      }
    }
  ]
}
```

`@@#<enum-name>.<enum-value>` will be resolved to values in the `enumerations` config:

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

Functions are parsed from strings with a `@@=` prefix.

```json
    "layers": [{
        "@@type": "HexagonLayer",
        "data": [
            {"lat":0,"lng":0},
            {"lat":0,"lng":0},
            {"lat":0,"lng":0},
            {"lat":1.2,"lng":1.2},
            {"lat":1.2,"lng":1.2},
            {"lat":1.2,"lng":1.2}
        ],
        "getPosition": "@@=[lng, lat]",
```

In this case, a function is generated of the format `(row) => [row.lng, row.lat]`, reading from the JSON data rows.

Passing `-` will simply return a function of the format `(row) => (row)`. For example, if data were a list of lat/lng values (e.g., `[[0, 0], [0, 0]]`),
passing `-` would return those values.

Additionally, `@@=` provides access to a small Javascript expression parser. You can apply basic Boolean and arithmetic operations via this parser.
For example, the following are all valid functions:

```json
"getPosition": "@@=[lng / 10, lat / 10]",
"getFillColor": "@@=[color / 255, 200, 20]",
"getLineColor": "@@=value > 10 ? [255, 0, 0] : [0, 255, 200]",
```