# RFC: Attribute Animation

* **Authors**: Xiaoji Chen
* **Date**: Aug 2017
* **Status**: Early draft, not ready for formal review.

Notes:
*  This could build on a "GeometryBuilder RFC", @ibgreen has been doing some work in this area.

## Motivation

For a general motivation of animation, see the [Property Animation RFC]().

The goal of this supplmentary RFC is to investigate to what extend deck.gl could provide automatic interpolation of vertex attribute arrays, in addition to primitive values like properties, uniforms and gl parameters.

## Proposal: Attribute Array Interpolation

### Behavior

When attribute updates are triggered by data change or updateTriggers, instead of immediately applying the new values, transition the current values to the new values by user-specified duration and easing curve.

### APIs

In deck.gl layer classes, certain attributes can declare themselves to be "animatable", which allows for smooth interpolation when their values are updated. This will be desirable for attributes such as sizes, widths, positions and colors. Animation will be an opt-in feature for backward compatibility:
```js
this.state.attributeManager.add({
  // Not animatable
  pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors},
  // Animatable
  positions: {size: 3, accessor: 'getPosition', update: this.calculatePositions, animate: true},
  colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors, animate: true}
});
```

When creating layers, animation can be enabled by supplying an `animation` prop. Animation parameters are defined per attribute by using attribute names or accessor names as keys, similar to that of `updateTriggers`:
```js
new Layer({
  animation: {
    getPositions: {
      duration: 600  //ms
      // easing defaults to EASING.LINEAR
    },
    getColors: {
      duration: 300,  //ms
      easing: EASING.CIRCULAR_IN_OUT
    }
  }
});
```

Because we intend to implement the easing functions in a shader module, the users will need to choose from a fixed preset. An `EASING` constant will be exported for referencing the supported easing functions. As a start, we may include the [d3-ease](https://github.com/d3/d3-ease) functions with default parameters.

### Implementation

- Layers will get the feature (almost) free:
    + The animation states will be tracked in the attribute manager.
    + The base `Layer` class will ensure that the animated attributes are updated every render cycle before the `draw` call.
- In WebGL2 enabled browsers, use TransformFeedback for interpolation:
    + The inputs are from and to value arrays, and current time as a uniform
    + The output is passed to the vertex shader for the target attribute
    + Easing functions are implemented as a shader module.
- In non-WebGL2 enabled browsers, we either drop the feature, or fall back to interpolation on the CPU.


## Impact on performance

If interpolation is done on the CPU: both calculating the attribute and uploading it to the GPU will be expensive. Framerate is expected to stagger.

If using TransformFeedback:
- At initialization: there is a cost to compile shaders and create the model for the transform feedback. We should minimize it by only doing it for the layers that have animation enabled.
- At attribute update: new value arrays are uploaded to GPU once at the beginning of the animation, which is the same as today. There is a cost to calculate and upload the "current" state of the attribute to animate from.
- During animation: The transform feedback is updated every frame till the end of the transition. It renders to buffers that are directly transfered to the vertex shader, so perf cost should be minimal.


## Questions

### Enter and exit behaviors

Enter (appearance of new geometries) may happen when:
**A** The layer is added or becomes visible
**B** The data array is changed with increased size

Exit (disappearance of rendered geometries) may happen when:
**C** The layer is removed or becomes invisible
**D** The data array is changed with decreased size

Without adding additional complexity, the most straightforward behavior is no enter/exit animation - geometries appear and disappear immediately. The application can create their own enter/exit animations by adding invisible objects (e.g. instead of removing objects from the data array, change their colors to transparent).

To support enter/exit animations, we may consider one of the following:
- Add a field `voidValue` to attribute definitions. This could be a value or an transform to be used for enter animation to transition from, or exit animation to transition to.
```js
this.state.attributeManager.add({
  // Animatable
  radius: {size: 1, accessor: 'getRadius', update: this.calculateRadius, animate: true, voidValue: 0},
  colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors, animate: true, voidValue: ([r, g, b, a]) => [r, g, b, 0]}
});
```
- Add fields `enter` and `exit` to animation parameters. The attribute updater is called with these functions substituting the regular accessor to retrieve the from value for enter animation, or to value for exit animation. This allows the user to control the animations per object, but more expensive at run time:
```js
new Layer({
  animation: {
    getColors: {
      duration: 300,
      enter: feature => feature.properties.fill.concat(0),
      exit: feature => feature.properties.fill.concat(0)
    }
  }
});
```

To properly support scenario **B** and **D**, we need a way to diff data arrays to determine which objects are added/removed.

In the current layer management logic, **C** is very difficult to handle, as the layer is immediately removed from the render.

### Animation parameter key: attribute name vs accessor name

`updateTriggers` moved away from using attribute names so that the user does not need to know the underlying implementation of each layer. Using accessor names to substitute attribute names may introduce confusing behavior in animation, though:
- Attributes that depend on multiple accessors: e.g. ArcLayer's `instancePosition` (`getSourcePosition` and `getTargetPosition`), will use animation parameters defined by one of the accessor names. No separate control though the semantic suggests so.
- Attributes that are not directly populated by the returned value of the accessor: Transitioning the accessor returned value (expected behavior) will not be the same as transitioning the attribute array (actual behavior). No example in core layers.

### GeoJSON interpolation

PathLayer and PolygonLayer do not animate correctly using this method when the vertex count of data changes. I believe the animation feature still has a ton of value even if these layers are excluded at the release, but I expect the support to be highly desired by our users.
