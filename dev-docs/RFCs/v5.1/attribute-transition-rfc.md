# RFC: Attribute Animation

* **Authors**: Xiaoji Chen
* **Date**: Aug 2017
* **Status**: **Implemented**

Notes:
*  This could build on a "GeometryBuilder RFC", @ibgreen has been doing some work in this area.

## Motivation

Adding animation to an visualization, especially an interactive visualization, can take it from great to extraordinary impact. Well-executed animations add a very deep level of polish and interest. However implementing good animations often requires considerable custom work in applications.

The goal of this supplementary RFC is to investigate to what extend deck.gl could provide automatic interpolation of vertex attribute arrays, in addition to primitive values like properties, uniforms and gl parameters.

## Proposal: Attribute Array Interpolation

### Behavior

When attribute updates are triggered by data change or updateTriggers, instead of immediately applying the new values, transition the current values to the new values by user-specified duration and easing curve.

### APIs

In deck.gl layer classes, certain attributes can declare themselves to be "transition-enabled", which allows for smooth interpolation when their values are updated. This will be desirable for attributes such as sizes, widths, positions and colors. Animation will be an opt-in feature for backward compatibility:
```js
this.state.attributeManager.add({
  // Transition disabled
  pickingColors: {size: 3, type: GL.UNSIGNED_BYTE, update: this.calculatePickingColors},
  // Transition enabled
  positions: {size: 3, accessor: 'getPosition', update: this.calculatePositions, transition: true},
  colors: {size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateColors, transition: true}
});
```

When creating layers, animation can be enabled by supplying an `transition` prop. Animation parameters are defined per attribute by using attribute names or accessor names as keys, similar to that of `updateTriggers`:
```js
new Layer({
  transition: {
    getPositions: 600,
    getColors: {
      duration: 300,
      easing: d3.easeCubicInOut
    }
  }
});
```

| Parameter | Type     | Default     | Description |
| --------- | -------- | ----------- | ----------- |
| duration  | Number   | `0` | Duration of the transition animation, in milliseconds |
| easing    | Function | LINEAR (`t => t`) | Easing function that maps a value from [0, 1] to [0, 1], see http://easings.net/ |
| onStart | Function   | `null` | Callback when the transition is started |
| onEnd | Function   | `null` | Callback when the transition is done |
| onInterrupt | Function   | `null` | Callback when the transition is interrupted |

As a shorthand, if an accessor key maps to a number rather than an object, then the number is assigned to the `duration` parameter.


### Implementation

- Layers will get the feature (almost) free:
    + The animation states will be tracked in the attribute manager.
    + The base `Layer` class will ensure that the animated attributes are updated every render cycle before the `draw` call.
- In WebGL2 enabled browsers, use TransformFeedback for interpolation:
    + The inputs are from and to value arrays, and current ratio (float between 0, 1) as a uniform
    + The output is passed to the vertex shader for the target attribute
- In non-WebGL2 enabled browsers, we either drop the feature, or fall back to interpolation on the CPU.

### TransformFeedback vs VertexShader

VertexShader pros:
- Available in all supported browsers

VertexShader cons:
- Must rewrite existing layers’ vertex shaders to double each animatable attribute and perform interpolation before other calculations. The cost of a heavier shader and double attribute upload applies even if transition is disabled on a layer.
- Interpolation must run every frame, cannot be disabled after animations complete.
- Current state is not captured if a transition is interrupted. (Scenario: array is updated to C while transitioning from A to B. The attribute should start from the current state in between A and B and end at C)


## Impact on performance

If interpolation is done on the CPU: both calculating the attribute and uploading it to the GPU will be expensive. Framerate is expected to stagger.

If using TransformFeedback:
- At initialization: there is a cost to compile shaders and create the model for the transform feedback. We should minimize it by only doing it for the layers that have transition enabled.
- At attribute update: new value arrays are uploaded to GPU once at the beginning of the animation, which is the same as today. There is a cost to calculating and uploading the "current" state of the attribute to animate from.
- During animation: The transform feedback is updated every frame till the end of the transition. It renders to buffers that are directly transferred to the vertex shader, so perf cost should be minimal.


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
  transition: {
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
