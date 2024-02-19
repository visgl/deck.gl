# Property Types

This article documents the system that deck.gl offers to provide extra type annotations for layer properties.

A number of deck.gl features are enabled by rich descriptions of the types of the properties in a layer:

- Asynchronous props (e.g. loading layer data from an URL)
- Type checking (during development)
- Improve render performance, see "Prop Types and Performance" section below
- Transitions and Animation
- [Reflection](https://en.wikipedia.org/wiki/Reflection_%28computer_programming%29) (e.g. dynamically creating UI controls for layer props)


## Declaring Layer Properties

A layer class may supply a static member `defaultProps` that defines its default property types and values:

```js
import {Layer} from 'deck.gl';

class MyLayer extends Layer {
  // implementation
}

MyLayer.defaultProps = {
  texture: {type: 'object', value: null, async: true},
  strokeOpacity: {type: 'number', value: 1, min: 0, max: 1},
  strokeColor: {type: 'color', value: [255, 0, 0]},
  getRadius: {type: 'accessor', value: d => d.radius}
};
```

When the user construct this layer, the props are resolved as such:

```jsx
const layer = new MyLayer({id: 'my-layer', strokeOpacity: 0.5})
/**
  layer.props:
  {
    texture: null,
    strokeOpacity: 0.5,
    strokeColor: [255, 0, 0],
    getRadius: d => d.radius,
    // other default base Layer props
  }
 */
```

## Property Types

The property types system enables layers to opt-in to specifying types, and also allows a certain amount of type auto-deduction to happen based on existing default values for layers that do not opt in.

Each prop in `defaultProps` may be an object in the following shape:

- `type` (string, required)
- `value` (any, required) - the default value if this prop is not supplied
- `async` (boolean, optional) - if `true`, the prop can either be a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to its actual value, or an url string (loaded using the base Layer's [fetch](../../api-reference/core/layer.md) prop).
- `transform` (function, optional) - transforms an asynchronously loaded value and returns a new form. Receives the following arguments:
  + `value` - the new value of this prop
  + `propType` - this prop type definition
  + `layer` - the owner of this prop
- `release` (function, optional) - release a transformed value when it's no longer in use. Receives the following arguments:
  + `value` - the old value of this prop
  + `propType` - this prop type definition
  + `layer` - the owner of this prop
- `validate` (function, optional) - returns `true` if the value is valid. Validation of layer props is only invoked in debug mode. This function is automatically populated if the prop has a built-in type. Receives the following arguments:
  + `value` - the value to be validated
  + `propType` - this prop type definition
- `equal` (function, optional) - returns `true` if the two prop values should be considered equal. Comparison of layer props is invoked during layer update and the result is passed to `changeFlags.propsChanged`. This function is automatically populated if the prop has a built-in type. Receives the following arguments:
  + `value` - the new value of this prop
  + `oldValue` - the previous value of this prop
  + `propType` - this prop type definition
- `deprecatedFor` (string|array, optional) - mark this prop as deprecated. The value is the new prop name(s) that this prop has been deprecated for. If the old prop is supplied instead of the new one, its value will be transferred to the new prop. The user will get a warning about the deprecation.
- Any additional options, see individual types below.

### Built-in Types

##### `boolean` {#boolean}

Any value.

- Default `validate`: always pass
- Default `equal`: compared by truthiness

```js
MyLayerClass.defaultProps = {
  // explicit
  fill: {type: 'boolean', value: false}
  // inferred
  fill: false
}
```

##### `number` {#number}

A numeric value.

- Options:
  + `min` (number, optional) - the minimum allowed value
  + `max` (number, optional) - the maximum allowed value
- Default `validate`: value is finite and within bounds (if specified)
- Default `equal`: strict equal

```js
MyLayerClass.defaultProps = {
  // explicit, with bounds
  radiusScale: {type: 'number', value: 1, min: 0}
  // inferred, no bounds
  radiusScale: 1
}
```

##### `color` {#color}

A RGBA color.

- Default `validate`: value is an array of 3 or 4 numbers
- Default `equal`: deep equal

```js
MyLayerClass.defaultProps = {
  // must be explicit
  fillColor: {type: 'color', value: [255, 204, 0]}
}
```

##### `image` {#image}

One of: URL string, [luma.gl Texture](https://luma.gl/docs/api-reference/core/resources/texture) object, `Image`, `HTMLCanvasElement`, `HTMLVideoElement`, `ImageBitmap` or `ImageData`.

- Options:
  + `parameters` (object, optional) - custom [sampler properties](https://luma.gl/docs/api-reference/core/resources/sampler#samplerprops) of the texture. If not specified, the following defaults are used:

  ```js
  {
    minFilter: 'linear',
    magFilter: 'linear',
    mipmapFilter: 'linear',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge'
  }
  ```

- Default `transform`: converts to a `Texture2D` object

##### `array` {#array}

An array of objects.

- Options:
  + `optional` (boolean, optional) - accept `null` or `undefined`. Default `false`.
  + `ignore` (boolean, optional) - if `true`, prop comparison is disabled. Default `false`.
  + `compare` (boolean|number, optional) - compare deeply during prop comparison. Default `false`. If a number is supplied, indicates the maximum depth to deep-compare, where 0 is shallow comparison and -1 is infinite depth. `true` is equivalent to `1`.
- Default `validate`: value is an array
- Default `equal`: shallow equal if `compare: false`, otherwise deep equal

```js
MyLayerClass.defaultProps = {
  // explicit
  coordinateOrigin: {type: 'array', value: [0, 0, 0], compare: true}
  // inferred
  coordinateOrigin: [0, 0, 0]
}
```

##### `object` {#object}

An arbitrary object.

- Options:
  + `optional` (boolean, optional) - accept `null` or `undefined`. Default `false`.
  + `ignore` (boolean, optional) - if `true`, prop comparison is disabled. Default `false`.
  + `compare` (boolean|number, optional) - compare deeply during prop comparison. Default `false`. If a number is supplied, indicates the maximum depth to deep-compare, where 0 is shallow comparison and -1 is infinite depth. `true` is equivalent to `1`.
- Default `equal`: shallow equal if `compare: false`, otherwise deep equal

```js
MyLayerClass.defaultProps = {
  // explicit
  parameters: {type: 'object', value: {}, compare: 2}
  // inferred
  loadOptions: {}
}
```

##### `accessor` {#accessor}

An accessor used to update shader attributes.

- Default `validate`: value is either a function or the same type as the default value
- Default `equal`: `true` if function, otherwise deep equal

```js
MyLayerClass.defaultProps = {
  // must be explicit
  getColor: {type: 'accessor', value: [255, 255, 255]}
}
```

##### `function` {#function}

A function.

- Options:
  + `optional` (boolean, optional) - accept `null` or `undefined`. Default `false`.
  + `ignore` (boolean, optional) - if `true`, prop comparison is disabled. Default `true`.
- Default `validate`: value is a function
- Default `equal`: `true` if `ignore: true`, otherwise strict equal

```js
MyLayerClass.defaultProps = {
  // explicit
  sizeScale: {type: 'function', value: x => Math.sqrt(x), ignore: false}
  // inferred
  sizeScale: x => Math.sqrt(x)
}
```

## Prop Types and Performance

The performance of a deck.gl application can be greatly improved by limiting the frequency of layer updates. Consider the following app:

```jsx
import React from 'react';

function App() {
  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: DATA_URL,
      extruded: true,
      wireframe: true,
      getElevation: f => ELEVATION_SCALE(f.properties.population),
      getFillColor: f => COLOR_SCALE(f.properties.income),
      getLineColor: [255, 255, 255]
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={{
        latitude: 49.254,
        longitude: -123.13,
        zoom: 11
      }}
      controller={true}
    />
  );
}
```

Each time the user interacts with the viewport, the app state is updated, and `render()` is called. Because `getElevation`, `getFillColor` and `getLineColor` are functions and arrays defined inline, they have changed from the previous render.

Usually, any prop change results in updating a layer, that is, recomputing its internal states. Updating a layer could be expensive. In GeoJsonLayer's case, it creates ScatterplotLayer, PolygonLayer and PathLayer, and those layers also need to be updated recursively.

In reality, we do not want to update GeoJsonLayer, because no layer props changed from the user's perspective. In GeoJsonLayer, these props are declared as such:

```js
const defaultProps = {
    ...
    getElevation: {type: 'accessor', value: 1000},
    getFillColor: {type: 'accessor', value: [0, 0, 0, 255]},
    getLineColor: {type: 'accessor', value: [0, 0, 0, 255]}
}
```

The default comparator of the `access` prop type ignores shallow changes in functions. As a result, deck.gl decides that no props have changed between the two renders, and the GeoJsonLayer does not need to be updated.
