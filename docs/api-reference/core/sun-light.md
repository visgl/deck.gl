# SunLight (Experimental)

SunLight is a directional light source simulating the sun. Sun position calculations are based on [article](http://aa.quae.nl/en/reken/zonpositie.html) and inspired by [SunCalc](https://www.npmjs.com/package/suncalc). 

## Usage 

Create a sun light source.

```js
import {_SunLight as SunLight} from '@deck.gl/core';

new SunLight({
  timestamp: 1554927200000, 
  color: [255, 0, 0], // [1, 0, 0] with Deck normalizedColors enabled
  intensity: 1
});
```

## constructor

The constructor for the `SunLight` class. Use this to create a new `SunLight`.

```js
const sunLight = new SunLight({timestamp, color, intensity});
```

* `timestamp` - (number) - Unix timestamp in milliseconds.
* `color` - (number[3])  RGB color of sun light source, default value is `[255, 255, 255]`. Custom RGB arrays use 0–1 channels when Deck’s [`normalizedColors`](./deck.md#normalizedcolors) is enabled and 0–255 channels otherwise.
* `intensity` - (number) Strength of sun light source, default value is `1.0`.

## Source

[/modules/core/src/effects/lighting/sun-light.ts](https://github.com/visgl/deck.gl/tree/master/modules/core/src/effects/lighting/sun-light.ts)
