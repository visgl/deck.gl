# PostProcessEffect

The `PostProcessEffect` applies screen space pixel manipulation effects to deck.gl layers.

<iframe height="450" style="width: 100%;" scrolling="no" title="deck.gl PostProcessEffect Demo" src="https://codepen.io/vis-gl/embed/YbRGvv/?height=450&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/vis-gl/pen/YbRGvv/'>deck.gl PostProcessEffect Demo</a> by vis.gl
  (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

## Constructor

```js
new PostProcessEffect(shaderModule, props);
```

Parameters:
* `shaderModule`(Object) - a shader module wraps a screen space effect. For supported effects see [luma.gl shader modules](https://github.com/uber/luma.gl/tree/8.0-release/modules/shadertools/src/modules).
* `props`(Object) - parameters to replace the default values in shader module.

## Example

```js
import {brightnessContrast} from '@luma.gl/shadertools';
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
