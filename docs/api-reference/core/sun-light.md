# SunLight (Experimental)

SunLight is a directional light source simulating the sun. Sun position calculations are based on [article](http://aa.quae.nl/en/reken/zonpositie.html) and inspired by [SunCalc](https://www.npmjs.com/package/suncalc). 

## Usage 

Create a sun light source.

```js
import {_SunLight as SunLight} from '@deck.gl/core';

new SunLight({
  timestamp: 1554927200000, 
  color: [255, 0, 0],
  intensity: 1
});
```

## constructor

The constructor for the `SunLight` class. Use this to create a new `SunLight`.

```js
const sunLight = new SunLight({timestamp, color, intensity});
```

* `timestamp` - (*number*) - Unix timestamp in milliseconds.
* `color` - (*array*)  RGB color of sun light source, default value is `[255, 255, 255]`.
* `intensity` - (*number*) Strength of sun light source, default value is `1.0`.

## Source

[/modules/core/src/effects/lighting/sun-light.js](https://github.com/visgl/deck.gl/tree/master/modules/core/src/effects/lighting/sun-light.js)
