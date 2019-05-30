# PostProcessEffect

The post-processing Effect applies kinds of screen space pixel manipulation effects to deck.gl layers.

## Constructor

```js
new PostProcessEffect(shaderModule, props);
```

Parameters:
* `shaderModule`(Object) - a shader module wraps a screen space effect. For supported effects see [glfx shader modules](https://github.com/uber/luma.gl/blob/master/modules/effects/src/index.js).
* `props`(Object) - parameters to replace the default values in shader module.

## Example

```js
import {brightnessContrast} from '@luma.gl/effects';
import {PostProcessEffect} from '@deck.gl/core';

const postProcessEffect = new PostProcessEffect(brightnessContrast, {
  brightness: 1.0,
  contrast: 1.0
});

const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  initialViewState,
  controller: true,
  // add effect to deck
  effects: [postProcessEffect],
  layers: [new GeoJsonLayer({
    ...
  })]
});
```

## Source

[/modules/core/src/effects/post-process-effect.js](https://github.com/uber/deck.gl/tree/master/modules/core/src/effects/post-process-effect.js)
