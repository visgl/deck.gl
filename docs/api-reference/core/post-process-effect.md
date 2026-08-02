# PostProcessEffect

The `PostProcessEffect` applies screen space pixel manipulation effects to deck.gl layers.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" width="100%" scrolling="no" title="deck.gl PostProcessEffect Demo" src="https://codepen.io/vis-gl/embed/YbRGvv/?height=450&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/YbRGvv/'>deck.gl PostProcessEffect Demo</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>

## Constructor

```js
new PostProcessEffect(shaderModule, props);
```

Parameters:
* `shaderModule`(object) - a shader module wraps a screen space effect. For supported effects see [luma.gl shader modules](https://luma.gl/docs/api-reference/shadertools/shader-passes/image-processing).
* `props`(object) - parameters to replace the default values in shader module.

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

## Remarks

### Antialiasing

Adding a post-processing effect redirects layer rendering into an offscreen framebuffer, which is not multisampled. Layers whose edges depend on the canvas' MSAA — most visibly [PathLayer](../layers/path-layer.md) and [LineLayer](../layers/line-layer.md) — therefore render with hard, aliased edges once any effect is added, even though the canvas itself was created with `antialias: true`. See [#10404](https://github.com/visgl/deck.gl/issues/10404).

Set `antialiasing: true` on those layers to have them compute edge coverage in the shader instead. On composite layers the prop is named `lineAntialiasing` ([GeoJsonLayer](../layers/geojson-layer.md#lineantialiasing), [PolygonLayer](../layers/polygon-layer.md#lineantialiasing)).

## Source

[/modules/core/src/effects/post-process-effect.ts](https://github.com/visgl/deck.gl/tree/master/modules/core/src/effects/post-process-effect.ts)
