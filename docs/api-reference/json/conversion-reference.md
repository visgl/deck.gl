# Conversion Reference

| Prefix | Description | Example usage |
| --- | --- | --- |
| `@@type` | Interpret a string as a JavaScript class or React component, resolving in the JSONConfiguration. | `"@@type": "ScatterplotLayer"`
| `@@function` | Interpret a string as a JavaScript function, resolving in the JSONConfiguration. | `"@@function": "calculateRadius"`
| `@@=` | Interpret the rest of the string as a function, parsing unquoted character strings as identifiers | `"@@=[lng, lat]"`
| `@@#` | Interpret the rest of the string as a constant, resolving in the JSON configuration | `"@@#GL.ONE"`


The @deck.g/json framework inspects the "raw" parsed JSON data structure before supplying it to deck.gl as props. This conversion process replaces certain objects in the structure with instances of objects.

## Classes and using `@@type`

Conversion happens by default for classes. For example, when this configuration of classes is passed to a
 `JSONConverter`–

```js
const configuration = {
  classes: Object.assign({}, require('@deck.gl/layers'), require('@deck.gl/aggregation-layers'))
};
```

and used to resolve this JSON object–

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

it will replace the layers descriptor with

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

A warning will be raised if the named layer is not registered.

Whenever the `JSONConverter` component finds the `@@type` field, it looks into the "class catalog"
like that in the configuration object above. These classes can be layers, views, or other objects,
 provided the classes have been registered.


## Functions and using `@@function`

Any JavaScript function can be passed. For example, when this configuration of functions is passed to a
`JSONConverter`–

```js
function calculateRadius({base, exponent}) {
  return Math.pow(base, exponent);
}

const configuration = {
  ...,
  functions: {calculateRadius}
};
```

and used to resolve this JSON object–

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

A warning will be raised if the function is not registered.

Whenever the `JSONConverter` component finds the `@@function` field, it looks into the "function catalog"
like that in the configuration object above.


### Enumerations and using the `@@#` prefix

Often deck.gl visualizations require access to particular enumerations. For this reason, a configuration
 object can also contain a map of enumerations that should be made available to the @deck.gl/json string
resolver. The `@@#` prefix on an enumeration triggers this lookup.

For example, when this configuration is passed to the `JSONConverter`–

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

and used to resolve this JSON object–

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

the `@@#<enum-name>.<enum-value>` will be resolved to values in the `enumerations` config:

```js
{
  layers: [
    new ScatterplotLayer({
      data: ...,
      coordinateSystem: 2,  // The enumerated value of COORDINATE_SYSTEM.METER_OFFSETS
      parameters: {
        blend: true,
        blendFunc: [1, 0, 770, 772]
      }
    })
  ]
}
```

## Functions and using the `@@=` prefix

Functions are parsed from value strings with a `@@=` prefix.

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

In this case, a function is generated of the format `(datum) => [datum["lng"], datum["lng"]]`, reading
from the JSON data rows.

Passing `@@=-` will simply return a function of the format `(datum) => (datum)`. For example, if data were
an array of coordinates (e.g., `[[0, 1], [0, 5]]`), passing `@@=-` would return those values.

Additionally, `@@=` provides access to a small Javascript expression parser. You can apply basic Boolean,
inline conditionals, and arithmetic operations via this parser.
For example, the following are all valid functions–

```json
"getPosition": "@@=[lng, lat, altitudeMeters]",
"getFillColor": "@@=[color / 255, 200, 20]",
"getLineColor": "@@=value > 10 ? [255, 0, 0] : [0, 255, 200]",
```

Each would be evaluated to an expression equivalent to–

```javascript
datum => [datum.lng, datum.lat, altitudeMeters / 1000]
datum => [datum.color / 255, 200, 20]
datum => datum.value > 10 ? [255, 0, 0] : [0, 255, 200]
```