# RFC: Color Filter and Effects Extension for deck.gl Layers

* Authors: Chris Gervang
* Date: January, 2023
* Status: **Draft**

## Abstract

This RFC proposes a new layer extension for `deck.gl` that allows users to easily apply color filters and effects, such as tint, brightness, and saturation, to any layer. The extension utilizes the `getModels` function from each layer and injects a `DECKGL_FILTER_COLOR` shader extension into each model.

## Background

`deck.gl` currently lacks a straightforward way to apply color filters and effects directly to layers. Users often have to write custom layers to achieve desired visual effects, which can be cumbersome. Alternatively, they are limited to using post-processing effects, which apply to the whole frame buffer rather than per layer.

## Proposals

### Design 1: User-Provided Luma ShaderPass

#### Overview

This design allows users to provide a `luma.gl` ShaderPass, such as the built-in vibrance module, to apply effects. The extension will utilize this ShaderPass for layer rendering.

#### Implementation

- Introduce a `ColorFilterExtension` that accepts a ShaderPass as an input parameter.
- Modify the layer's fragment shader by integrating the provided ShaderPass at render time.

```js
import {
  brightnessContrast,
  hueSaturation,
} from '@luma.gl/shadertools'

new Tile3DLayer({
    extensions: [new ColorFilterExtension(brightnessContrast)]
    brightnessContrast: {
        brightness: 0.5,
        contrast: 0.5
    }
})
```

Multiple filters can be applied with more than one instance:

```js
{
    extensions: [new ColorFilterExtension(hueSaturation), new ColorFilterExtension(brightnessContrast)]
    hueSaturation: ...,
    brightnessContrast: ...,
}
```

#### Pros and Cons

**Pros:**
- Flexibility: Enables users to create custom effects.
- Compatibility: Integrates seamlessly with existing `luma.gl` modules.

**Cons:**
- Usage Complexity: Requires users to have a good understanding of `luma.gl` shaders.
- Typings Complexity: Determining extension properties is complex since the ShaderPass dictates them.

### Design 2: Built-in Shaders in Extension

#### Overview

This design incorporates a set of predefined shaders within the extension, addressing common filters like tint, brightness, and saturation.

#### Implementation

- Equip the `ColorFilterExtension` with built-in shader modules.
- Allow users to select a filter and modify its parameters (e.g., intensity).

```js
new Tile3DLayer({
    extensions: [new ColorFilterExtension()]
    brightnessContrast: {
        brightness: 0.5,
        contrast: 0.5
    }
})
```

All single pass "filter" shaders would be built-in: brightnessContrast, hueSaturation, vibrance, tint (mix original colors), fill (set colors to single hue), sepia, colorHalftone, and dotScreen.

##### Props

- shaders (`Array<String>`):

Should a user need to customize the shader order we could have an `shaders` extension prop to specify which shaders to load and in which order. 

Usage: `new ColorFilterExtension({shaders: ['hueSaturation', 'tint']})`

This may be useful in the event a user wanted to first make their layer greyscale and then tint it as opposed to tinting before desaturating.

The same prop may be useful for cherry picking which shaders to apply for users concerned with shader overhead.

#### Pros and Cons

**Pros:**
- Ease of Use: Simplifies the process for users unfamiliar with shader programming.
- Consistency: Ensures standardized performance and appearance.

**Cons:**
- Limited Flexibility: Confines users to predefined filters.
- Additional Overhead: Introduces shaders that may not be used consistently unless a lifecycle mechanism for adding/removing active effects is implemented.

## Conclusion

After careful consideration of both designs, I'd prefer Design 2: Built-in Shaders in Extension. This design is easier to adopt for a broader range of users, especially those without extensive shader programming experience.

While Design 1 offers more flexibility, the complexity it introduces both in terms of usage and implementation may pose barriers for users and maintainers. 

### Remarks

We could extend this design in to support custom shaders in the future, akin to what Design 1 proposes. 

If performance degrades considerably when applying this extension, we could explore mechanisms for managing the lifecycle of active effects to minimize overhead since most use cases would likely only apply a few effects at a time.
