# PostProcessEffect

The `PostProcessEffect` applies screen space pixel manipulation effects to deck.gl layers.

[deck.gl PostProcessEffect Demo](https://codepen.io/vis-gl/embed/YbRGvv/?height=450\&theme-id=light\&default-tab=result)

## Constructor[​](#constructor "Direct link to Constructor")

```
new PostProcessEffect(shaderModule, props);
```

Parameters:

* `shaderModule`(object) - a shader module wraps a screen space effect. For supported effects see [luma.gl shader modules](https://luma.gl/docs/api-reference/shadertools/shader-passes/image-processing).
* `props`(object) - parameters to replace the default values in shader module.

## Example[​](#example "Direct link to Example")

```
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

## Remarks[​](#remarks "Direct link to Remarks")

### Antialiasing[​](#antialiasing "Direct link to Antialiasing")

Adding a post-processing effect redirects layer rendering into an offscreen framebuffer, which is not multisampled. Layers whose edges depend on the canvas' MSAA — including [PathLayer](https://deck.gl/docs/api-reference/layers/path-layer.md), [LineLayer](https://deck.gl/docs/api-reference/layers/line-layer.md), [ArcLayer](https://deck.gl/docs/api-reference/layers/arc-layer.md), and [PointCloudLayer](https://deck.gl/docs/api-reference/layers/point-cloud-layer.md) — therefore render with hard, aliased edges once any effect is added, even though the canvas itself was created with `antialias: true`. See [#10404](https://github.com/visgl/deck.gl/issues/10404).

Set `antialiasing: true` on those layers to have them compute edge coverage in the shader instead. On composite layers the prop is named `lineAntialiasing` ([GeoJsonLayer](https://deck.gl/docs/api-reference/layers/geojson-layer.md#lineantialiasing), [PolygonLayer](https://deck.gl/docs/api-reference/layers/polygon-layer.md#lineantialiasing)).

## Source[​](#source "Direct link to Source")

[/modules/core/src/effects/post-process-effect.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/effects/post-process-effect.ts)
